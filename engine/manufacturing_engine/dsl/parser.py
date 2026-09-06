"""
Lark-based Manufacturing DSL Parser & AST Builder
Flow: DSL text -> Lark parser -> parse tree -> typed AST -> semantic validation -> canonical model
"""

import os
from typing import Tuple
from lark import Lark, Transformer, v_args, UnexpectedInput
from .ast_nodes import (
    ProgramNode, PartNode, ProcessNode, MaterialNode,
    RequirementBlockNode, GeometryBlockNode, FeatureBlockNode,
    LockBlockNode, OptimizeBlockNode, ProfileNode, ShellNode,
    DraftNode, FilletNode, ChamferNode, HoleNode, BossNode, RibNode, SourceSpan
)
from ..parameters.units import parse_quantity, create_quantity
from .semantic_validator import validate_ast
from .diagnostics import DiagnosticReport

GRAMMAR_PATH = os.path.join(os.path.dirname(__file__), "grammar.lark")

with open(GRAMMAR_PATH, "r", encoding="utf-8") as f:
    GRAMMAR_CONTENT = f.read()

_lark_parser = Lark(GRAMMAR_CONTENT, start="start", parser="lalr")

class ASTTransformer(Transformer):
    def QUANTITY(self, token):
        return parse_quantity(str(token))

    def val_qty(self, children):
        val = children[0]
        if hasattr(val, "canonical_value"):
            return val
        return create_quantity(float(val), "mm")

    def BOOLEAN(self, token):
        return str(token).lower() == "true"

    def IDENT(self, token):
        return str(token)

    def STRING(self, token):
        return str(token).strip('"\'')

    def NUMBER(self, token):
        return float(token)

    def OP(self, token):
        return str(token)

    def process_stmt(self, children):
        proc_name = children[0]
        return ProcessNode(process_type=proc_name)

    def material_stmt(self, children):
        mat_name = children[0]
        return MaterialNode(material_name=mat_name)

    def req_volume(self, children):
        op, qty = children
        return ("volume", op, qty)

    def req_height(self, children):
        op, qty = children
        return ("height", op, qty)

    def req_stackable(self, children):
        val = children[0]
        return ("stackable", val)

    def req_safety_factor(self, children):
        val = children[0]
        return ("safety_factor", val)

    def require_block(self, children):
        req_node = RequirementBlockNode()
        for item in children:
            if isinstance(item, tuple):
                if item[0] == "volume":
                    req_node.volume_op = item[1]
                    req_node.target_volume = item[2]
                elif item[0] == "height":
                    req_node.height_op = item[1]
                    req_node.max_height = item[2]
                elif item[0] == "stackable":
                    req_node.stackable = item[1]
                elif item[0] == "safety_factor":
                    req_node.min_safety_factor = item[1]
        return req_node

    def prof_bottom_dia(self, children):
        return ("bottom_diameter", children[0])

    def prof_top_dia(self, children):
        return ("top_diameter", children[0])

    def prof_height(self, children):
        return ("height", children[0])

    def prof_radius(self, children):
        return ("radius", children[0])

    def prof_length(self, children):
        return ("length", children[0])

    def prof_width(self, children):
        return ("width", children[0])

    def profile_block(self, children):
        prof = ProfileNode()
        for item in children:
            if isinstance(item, tuple):
                setattr(prof, item[0], item[1])
        return prof

    def shell_stmt(self, children):
        return ShellNode(thickness=children[0])

    def draft_stmt(self, children):
        return DraftNode(angle=children[0])

    def fillet_stmt(self, children):
        return FilletNode(target=children[0], radius=children[1])

    def chamfer_stmt(self, children):
        return ChamferNode(target=children[0], distance=children[1])

    def geom_stmt(self, children):
        return children[0]

    def geometry_block(self, children):
        geom = GeometryBlockNode()
        for item in children:
            if isinstance(item, ProfileNode):
                geom.profile = item
            elif isinstance(item, ShellNode):
                geom.shell = item
            elif isinstance(item, DraftNode):
                geom.draft = item
            elif isinstance(item, FilletNode):
                geom.fillets.append(item)
            elif isinstance(item, ChamferNode):
                geom.chamfers.append(item)
        return geom

    def feature_val(self, children):
        return children[0]

    def feature_arg(self, children):
        return (children[0], children[1])

    def feat_rim(self, children):
        return ("rim", children)

    def feat_emboss(self, children):
        return ("emboss", children)

    def feat_hole(self, children):
        return ("hole", children)

    def feat_boss(self, children):
        return ("boss", children)

    def feat_rib(self, children):
        return ("rib", children)

    def features_block(self, children):
        feat_block = FeatureBlockNode()
        for item in children:
            if isinstance(item, tuple):
                tag, args = item
                arg_dict = dict(args) if args else {}
                if tag == "rim":
                    if "radius" in arg_dict:
                        v = arg_dict["radius"]
                        feat_block.rim_radius = v if hasattr(v, "canonical_value") else parse_quantity(str(v))
                elif tag == "emboss":
                    if "depth" in arg_dict:
                        v = arg_dict["depth"]
                        feat_block.emboss_depth = v if hasattr(v, "canonical_value") else parse_quantity(str(v))
                    if "text" in arg_dict:
                        feat_block.emboss_text = str(arg_dict["text"])
        return feat_block

    def lock_item(self, children):
        return children[0]

    def lock_block(self, children):
        return LockBlockNode(locked_parameters=[c for c in children if isinstance(c, str)])

    def opt_min(self, children):
        return f"MINIMIZE {children[0]}"

    def opt_maint(self, children):
        return f"MAINTAIN {children[0]}"

    def opt_max(self, children):
        return f"MAXIMIZE {children[0]}"

    def optimize_block(self, children):
        return OptimizeBlockNode(objectives=[c for c in children if isinstance(c, str)])

    def statement(self, children):
        return children[0]

    def part_def(self, children):
        part_name = children[0]
        part = PartNode(part_name=part_name)
        for child in children[1:]:
            if isinstance(child, ProcessNode):
                part.process = child
            elif isinstance(child, MaterialNode):
                part.material = child
            elif isinstance(child, RequirementBlockNode):
                part.requirements = child
            elif isinstance(child, GeometryBlockNode):
                part.geometry = child
            elif isinstance(child, FeatureBlockNode):
                part.features = child
            elif isinstance(child, LockBlockNode):
                part.locks = child
            elif isinstance(child, OptimizeBlockNode):
                part.optimize = child
        return part

    def start(self, children):
        parts = [c for c in children if isinstance(c, PartNode)]
        return ProgramNode(parts=parts)


def parse_dsl(dsl_text: str) -> Tuple[ProgramNode, DiagnosticReport]:
    """
    Formally parses Manufacturing DSL text using Lark into a typed AST.
    Returns (ProgramNode, DiagnosticReport).
    """
    report = DiagnosticReport()
    try:
        parse_tree = _lark_parser.parse(dsl_text)
        program = ASTTransformer().transform(parse_tree)
        semantic_report = validate_ast(program)
        return program, semantic_report
    except UnexpectedInput as e:
        report.add_error(
            code="E_SYNTAX_ERROR",
            message=f"DSL syntax error at line {e.line}, column {e.column}",
            span=SourceSpan(start_line=e.line, start_column=e.column, end_line=e.line, end_column=e.column + 5),
            fix="Check grammar around syntax error location."
        )
        return ProgramNode(), report
    except Exception as ex:
        report.add_error(
            code="E_PARSER_ERROR",
            message=f"Parser exception: {str(ex)}",
            span=SourceSpan()
        )
        return ProgramNode(), report

"""
Explicit Typed AST Nodes for Manufacturing DSL
Every AST node tracks source spans, node type, typed values, canonical units, and validation state.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from ..parameters.units import Quantity, create_quantity

class SourceSpan(BaseModel):
    start_line: int = 1
    start_column: int = 1
    end_line: int = 1
    end_column: int = 1

class ValidationState(BaseModel):
    is_valid: bool = True
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

class ASTNode(BaseModel):
    node_type: str
    source_span: SourceSpan = Field(default_factory=SourceSpan)
    semantic_id: Optional[str] = None
    validation_state: ValidationState = Field(default_factory=ValidationState)

class ProcessNode(ASTNode):
    node_type: str = "ProcessNode"
    process_type: str = "INJECTION_MOLDING"

class MaterialNode(ASTNode):
    node_type: str = "MaterialNode"
    material_name: str = "PP"

class ProfileNode(ASTNode):
    node_type: str = "ProfileNode"
    bottom_diameter: Optional[Quantity] = None
    top_diameter: Optional[Quantity] = None
    height: Optional[Quantity] = None
    radius: Optional[Quantity] = None
    length: Optional[Quantity] = None
    width: Optional[Quantity] = None

class ShellNode(ASTNode):
    node_type: str = "ShellNode"
    thickness: Quantity

class DraftNode(ASTNode):
    node_type: str = "DraftNode"
    angle: Quantity

class FilletNode(ASTNode):
    node_type: str = "FilletNode"
    target: str
    radius: Quantity

class ChamferNode(ASTNode):
    node_type: str = "ChamferNode"
    target: str
    distance: Quantity

class GeometryBlockNode(ASTNode):
    node_type: str = "GeometryBlockNode"
    profile: Optional[ProfileNode] = None
    shell: Optional[ShellNode] = None
    draft: Optional[DraftNode] = None
    fillets: List[FilletNode] = Field(default_factory=list)
    chamfers: List[ChamferNode] = Field(default_factory=list)

class HoleNode(ASTNode):
    node_type: str = "HoleNode"
    diameter: Optional[Quantity] = None
    depth: Optional[Quantity] = None

class BossNode(ASTNode):
    node_type: str = "BossNode"
    outer_diameter: Optional[Quantity] = None
    inner_diameter: Optional[Quantity] = None
    height: Optional[Quantity] = None

class RibNode(ASTNode):
    node_type: str = "RibNode"
    count: int = 1
    thickness: Optional[Quantity] = None

class PatternNode(ASTNode):
    node_type: str = "PatternNode"
    pattern_type: str = "CIRCULAR"
    count: int = 4

class FeatureBlockNode(ASTNode):
    node_type: str = "FeatureBlockNode"
    rim_radius: Optional[Quantity] = None
    emboss_text: Optional[str] = None
    emboss_depth: Optional[Quantity] = None
    holes: List[HoleNode] = Field(default_factory=list)
    bosses: List[BossNode] = Field(default_factory=list)
    ribs: List[RibNode] = Field(default_factory=list)
    patterns: List[PatternNode] = Field(default_factory=list)

class RequirementBlockNode(ASTNode):
    node_type: str = "RequirementBlockNode"
    target_volume: Optional[Quantity] = None
    volume_op: str = ">="
    max_height: Optional[Quantity] = None
    height_op: str = "<="
    stackable: bool = True
    min_safety_factor: float = 2.0

class ConstraintBlockNode(ASTNode):
    node_type: str = "ConstraintBlockNode"
    constraints: Dict[str, Any] = Field(default_factory=dict)

class LockBlockNode(ASTNode):
    node_type: str = "LockBlockNode"
    locked_parameters: List[str] = Field(default_factory=list)

class OptimizeBlockNode(ASTNode):
    node_type: str = "OptimizeBlockNode"
    objectives: List[str] = Field(default_factory=list)

class PartNode(ASTNode):
    node_type: str = "PartNode"
    part_name: str
    process: ProcessNode = Field(default_factory=ProcessNode)
    material: MaterialNode = Field(default_factory=MaterialNode)
    requirements: RequirementBlockNode = Field(default_factory=RequirementBlockNode)
    geometry: GeometryBlockNode = Field(default_factory=GeometryBlockNode)
    features: FeatureBlockNode = Field(default_factory=FeatureBlockNode)
    locks: LockBlockNode = Field(default_factory=LockBlockNode)
    optimize: OptimizeBlockNode = Field(default_factory=OptimizeBlockNode)

class ProgramNode(ASTNode):
    node_type: str = "ProgramNode"
    parts: List[PartNode] = Field(default_factory=list)

"""
Automated Unit Tests for Typed AST Nodes & Serialization
"""

import json
from manufacturing_engine.dsl.ast_nodes import ProgramNode, PartNode, ProfileNode
from manufacturing_engine.parameters.units import create_quantity

def test_ast_node_typing():
    prof = ProfileNode(
        bottom_diameter=create_quantity(64.0, "mm"),
        top_diameter=create_quantity(82.0, "mm"),
        height=create_quantity(115.0, "mm")
    )
    assert prof.node_type == "ProfileNode"
    assert prof.bottom_diameter.canonical_value == 64.0
    assert prof.bottom_diameter.dimension == "length"

def test_ast_serialization():
    part = PartNode(part_name="TestPart")
    dumped = part.model_dump()
    assert dumped["part_name"] == "TestPart"
    assert dumped["node_type"] == "PartNode"

def test_ast_roundtrip():
    part = PartNode(part_name="RoundtripPart")
    json_str = part.model_dump_json()
    reconstructed = PartNode.model_validate_json(json_str)
    assert reconstructed.part_name == "RoundtripPart"
    assert reconstructed.node_type == "PartNode"

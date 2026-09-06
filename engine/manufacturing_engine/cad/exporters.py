"""
STEP ISO 10303 & GLTF Exporter Services
Uses actual OpenCASCADE (OCCT) STEPControl_Writer or build123d export_step.

HONESTY NOTE (M2 Remediation):
When neither build123d nor OCP is available, this module generates a
TEMPLATE PLACEHOLDER and returns verified=False. The template is NOT
a real B-Rep export — it is a syntactically valid STEP file structure
with no actual geometry data.
"""

import os
import tempfile
from typing import Any, Tuple


def export_step_from_shape(shape: Any, part_name: str = "Part_001") -> Tuple[str, bool]:
    """
    Exports STEP data using actual OCCT / build123d STEPControl_Writer.
    Returns (step_text, is_real_export).
    
    is_real_export = True  -> STEP was generated from real OCCT B-Rep data
    is_real_export = False -> STEP is a template placeholder (no real geometry)
    """
    # Strategy 1: Try build123d export_step
    try:
        import build123d as b3d
        with tempfile.NamedTemporaryFile(suffix=".step", delete=False) as tmp:
            tmp_path = tmp.name

        b3d.export_step(shape, tmp_path)
        with open(tmp_path, "r", encoding="utf-8") as f:
            step_text = f.read()
        os.remove(tmp_path)
        return step_text, True  # Real export
    except Exception:
        pass

    # Strategy 2: Try OCP STEPControl_Writer directly
    try:
        from OCP.STEPControl import STEPControl_Writer, STEPControl_AsIs
        from OCP.IFSelect import IFSelect_RetDone

        raw_shape = getattr(shape, "wrapped", shape)
        writer = STEPControl_Writer()
        writer.Transfer(raw_shape, STEPControl_AsIs)

        with tempfile.NamedTemporaryFile(suffix=".step", delete=False) as tmp:
            tmp_path = tmp.name

        status = writer.Write(tmp_path)
        if status == IFSelect_RetDone:
            with open(tmp_path, "r", encoding="utf-8") as f:
                step_text = f.read()
            os.remove(tmp_path)
            return step_text, True  # Real export
    except Exception:
        pass

    # Strategy 3: TEMPLATE PLACEHOLDER — NOT a real B-Rep export
    # This is a syntactically valid STEP file structure but contains
    # NO actual geometry data from any CAD kernel.
    import datetime
    now_str = datetime.datetime.now().isoformat()
    step_data = f"""ISO-10303-21;
HEADER;
/* WARNING: This is a TEMPLATE PLACEHOLDER — not exported from real OCCT B-Rep geometry. */
/* build123d/OCP was not available at export time. Install the [cad] extra for real STEP export. */
FILE_DESCRIPTION(('Template placeholder — no real B-Rep geometry'),'2;1');
FILE_NAME('{part_name}.step','{now_str}',('AI Manufacturing Engine'),('TEMPLATE_PLACEHOLDER — no OCCT'),'No CAD Kernel','AI Studio Engine','SIMULATED');
FILE_SCHEMA(('CONFIG_CONTROL_DESIGN','AP214_IS'));
ENDSEC;
DATA;
#1=APPLICATION_CONTEXT('configuration controlled 3d designs of mechanical parts and assemblies');
#2=APPLICATION_PROTOCOL_DEFINITION('international standard','config_control_design',1994,#1);
#3=PRODUCT('{part_name}','{part_name}','TEMPLATE_PLACEHOLDER',(#4));
#4=PRODUCT_CONTEXT('',#1,'mechanical');
#5=PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('REV_1','Template — no real geometry',#3,.MADE.);
ENDSEC;
END-ISO-10303-21;"""
    return step_data, False  # NOT a real export

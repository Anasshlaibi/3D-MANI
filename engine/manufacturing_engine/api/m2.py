"""Bounded uploads and isolated, timeout-limited OCCT worker execution."""
import asyncio
import json
import sys
import tempfile
from pathlib import Path
from urllib.parse import unquote
from fastapi import APIRouter, HTTPException, Request
from ..cad.step_inspection import DIRECTIONS
router=APIRouter()
semaphore=asyncio.Semaphore(1)
@router.post("/api/m2/inspect")
async def inspect(request:Request,material:str="PP",direction:str="+Z"):
    if direction not in DIRECTIONS or material not in {"PP","ABS","PC","PA66_GF30","POM"}:
        raise HTTPException(422,"Unsupported pull direction or material family.")
    filename=unquote(request.headers.get("x-filename","part.step"))
    if Path(filename).suffix.lower() not in {".step",".stp"}: raise HTTPException(415,"Upload a .step or .stp file.")
    async with semaphore:
        with tempfile.TemporaryDirectory(prefix="mani-step-") as folder:
            source=Path(folder)/"part.step"; output=Path(folder)/"result.json"; size=0
            with source.open("wb") as stream:
                async for chunk in request.stream():
                    size+=len(chunk)
                    if size>20*1024*1024: raise HTTPException(413,"STEP upload exceeds 20 MB.")
                    stream.write(chunk)
            if size==0: raise HTTPException(400,"The uploaded file is empty.")
            process=await asyncio.create_subprocess_exec(sys.executable,"-m","manufacturing_engine.cad.step_inspection",str(source),str(output),material,direction,stdout=asyncio.subprocess.DEVNULL,stderr=asyncio.subprocess.DEVNULL)
            try: await asyncio.wait_for(process.wait(),120)
            except (asyncio.TimeoutError,asyncio.CancelledError):
                process.kill();await process.wait()
                raise HTTPException(504,"OCCT inspection timed out or was cancelled.")
            if process.returncode!=0 or not output.exists(): raise HTTPException(422,"OCCT could not process this geometry. No sample was substituted.")
            data=json.loads(output.read_text(encoding="utf-8"))
            if "error" in data: raise HTTPException(422,data["error"])
            return dict(data["data"],filename=Path(filename.replace("\\","/")).name)

"""
Visualization upload and status. Phase 2: upload. Phase 3: background generation, GET by id.
"""
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Visualization
from app.schemas.visualization import VisualizationResponse
from app.services.generator import run_generation

# Directory for uploaded images (backend/uploads/). Created on startup in main.py.
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 10
MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

router = APIRouter(prefix="/visualizations", tags=["visualizations"])


def _get_extension(content_type: str) -> str:
    m = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    return m.get(content_type, ".jpg")


def _viz_to_response(viz: Visualization) -> VisualizationResponse:
    image_url = f"/api/v1/uploads/{viz.image_path}"
    result_url = f"/api/v1/uploads/{viz.result_path}" if viz.result_path else None
    return VisualizationResponse(
        id=viz.id,
        image_path=viz.image_path,
        image_url=image_url,
        manufacturer_id=viz.manufacturer_id,
        tile_id=viz.tile_id,
        color_id=viz.color_id,
        status=viz.status,
        result_url=result_url,
        error_message=viz.error_message,
        generator=getattr(viz, "generator", None),
        created_at=viz.created_at,
    )


@router.get("/{viz_id}", response_model=VisualizationResponse)
def get_visualization(viz_id: int, db: Session = Depends(get_db)):
    """Get job status and result. Poll until status is completed or failed."""
    viz = db.query(Visualization).filter(Visualization.id == viz_id).first()
    if not viz:
        raise HTTPException(status_code=404, detail="Visualization not found")
    return _viz_to_response(viz)


@router.post("", response_model=VisualizationResponse, status_code=201)
async def create_visualization(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    manufacturer_id: int = Form(...),
    tile_id: int = Form(...),
    color_id: int = Form(...),
    db: Session = Depends(get_db),
):
    """
    Upload a house image with selection. Image is stored in backend/uploads/;
    metadata is stored in DB. Generation runs in the background (mock or Gemini).
    Poll GET /visualizations/{id} for status and result_url.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )
    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {MAX_SIZE_MB}MB",
        )
    ext = _get_extension(file.content_type or "")
    filename = f"{uuid.uuid4().hex}{ext}"
    path = UPLOADS_DIR / filename
    path.write_bytes(content)

    viz = Visualization(
        image_path=filename,
        manufacturer_id=manufacturer_id,
        tile_id=tile_id,
        color_id=color_id,
        status="pending",
    )
    db.add(viz)
    db.commit()
    db.refresh(viz)

    background_tasks.add_task(run_generation, viz.id)

    return _viz_to_response(viz)

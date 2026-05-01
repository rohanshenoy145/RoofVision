"""
Manufacturer API routes - list manufacturers, optionally by material type.

Endpoint: GET /api/v1/manufacturers?material_type=shingle
Returns: List of manufacturers (id, name, slug, material_type)

Design: material_type filter for "material first" flow (tile, shingle, metal).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Manufacturer
from app.schemas.manufacturer import ManufacturerResponse

router = APIRouter(prefix="/manufacturers", tags=["manufacturers"])


@router.get("", response_model=list[ManufacturerResponse])
def list_manufacturers(
    db: Session = Depends(get_db),
    material_type: str | None = Query(None, description="Filter by material: shingle, tile, metal"),
):
    """
    List roof manufacturers. Optionally filter by material_type.
    Results are ordered by name for consistent UX.
    """
    q = db.query(Manufacturer).order_by(Manufacturer.name)
    if material_type:
        q = q.filter(Manufacturer.material_type == material_type.lower())
    return q.all()

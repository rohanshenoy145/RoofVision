"""
Manufacturer API routes - list all manufacturers.

Endpoint: GET /api/v1/manufacturers
Returns: List of manufacturers (id, name, slug)

Design: No pagination for Phase 1 - typical catalog has < 50 manufacturers.
Add pagination later if needed (e.g. limit/offset or cursor-based).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Manufacturer
from app.schemas.manufacturer import ManufacturerResponse

router = APIRouter(prefix="/manufacturers", tags=["manufacturers"])


@router.get("", response_model=list[ManufacturerResponse])
def list_manufacturers(db: Session = Depends(get_db)):
    """
    List all roof manufacturers.
    Results are ordered by name for consistent UX.
    """
    manufacturers = db.query(Manufacturer).order_by(Manufacturer.name).all()
    return manufacturers

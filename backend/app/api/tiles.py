"""
Tile API routes - list tiles for a given manufacturer.

Endpoint: GET /api/v1/manufacturers/{manufacturer_id}/tiles
Returns: List of tiles belonging to that manufacturer

Design: Nested under manufacturers to reflect the waterfall.
Frontend calls this after user selects a manufacturer.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Manufacturer, Tile
from app.schemas.tile import TileResponse

router = APIRouter(prefix="/manufacturers", tags=["tiles"])


@router.get("/{manufacturer_id}/tiles", response_model=list[TileResponse])
def list_tiles_by_manufacturer(manufacturer_id: int, db: Session = Depends(get_db)):
    """
    List all tiles for a manufacturer.
    Returns 404 if manufacturer does not exist.
    """
    manufacturer = db.query(Manufacturer).filter(Manufacturer.id == manufacturer_id).first()
    if not manufacturer:
        raise HTTPException(status_code=404, detail="Manufacturer not found")

    tiles = db.query(Tile).filter(Tile.manufacturer_id == manufacturer_id).order_by(Tile.name).all()
    return tiles

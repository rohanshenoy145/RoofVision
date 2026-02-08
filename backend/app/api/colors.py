"""
Color API routes - list colors for a given tile.

Endpoint: GET /api/v1/tiles/{tile_id}/colors
Returns: List of colors belonging to that tile

Design: Colors are under /tiles (not nested under manufacturers) because
the frontend at this step only has tile_id from the previous selection.
We could also use /manufacturers/{mid}/tiles/{tid}/colors but that's
longer and the tile_id is globally unique.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Color, Tile
from app.schemas.color import ColorResponse

router = APIRouter(prefix="/tiles", tags=["colors"])


@router.get("/{tile_id}/colors", response_model=list[ColorResponse])
def list_colors_by_tile(tile_id: int, db: Session = Depends(get_db)):
    """
    List all colors for a tile.
    Returns 404 if tile does not exist.
    """
    tile = db.query(Tile).filter(Tile.id == tile_id).first()
    if not tile:
        raise HTTPException(status_code=404, detail="Tile not found")

    colors = db.query(Color).filter(Color.tile_id == tile_id).order_by(Color.name).all()
    return colors

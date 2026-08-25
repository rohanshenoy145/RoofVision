"""
Color API routes - list colors for a given tile.

Endpoint: GET /api/v1/tiles/{tile_id}/colors
Returns: List of colors belonging to that tile

Design: Colors are under /tiles (not nested under manufacturers) because
the frontend at this step only has tile_id from the previous selection.
We could also use /manufacturers/{mid}/tiles/{tid}/colors but that's
longer and the tile_id is globally unique.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Color, Tile
from app.schemas.color import ColorResponse

router = APIRouter(prefix="/tiles", tags=["colors"])

# Prefer these regions when collapsing duplicate color names across brochures.
_REGION_RANK = {
    "california": 0,
    "arizona": 1,
    "florida": 2,
    "northwest": 3,
    "hawaii": 4,
    "southern-nevada-utah": 5,
    "colorado-great-plains": 6,
    "western-canada": 7,
}


def _color_pick_key(color: Color) -> tuple:
    """Lower is better when choosing one row per color name."""
    region = (color.region or "").strip().lower()
    return (
        _REGION_RANK.get(region, 99),
        0 if (color.hex_code or "").strip() else 1,
        (color.manufacturer_code or ""),
        color.id or 0,
    )


def _dedupe_by_name(colors: list[Color]) -> list[Color]:
    best: dict[str, Color] = {}
    for color in colors:
        key = (color.name or "").strip().lower()
        if not key:
            continue
        prev = best.get(key)
        if prev is None or _color_pick_key(color) < _color_pick_key(prev):
            best[key] = color
    return sorted(best.values(), key=lambda c: (c.name or "").lower())


@router.get("/{tile_id}/colors", response_model=list[ColorResponse])
def list_colors_by_tile(
    tile_id: int,
    db: Session = Depends(get_db),
    unique_by_name: bool = Query(
        True,
        description="Collapse same color name across regions (default on for picker UX)",
    ),
    region: str | None = Query(
        None,
        description="Optional region filter (e.g. california).",
    ),
):
    """
    List colors for a tile.
    By default returns one row per color name so regional brochure dupes don't flood the picker.
    """
    tile = db.query(Tile).filter(Tile.id == tile_id).first()
    if not tile:
        raise HTTPException(status_code=404, detail="Tile not found")

    q = db.query(Color).filter(Color.tile_id == tile_id)
    if region and region.strip():
        q = q.filter(Color.region == region.strip().lower())
    colors = q.order_by(Color.name).all()
    if unique_by_name:
        colors = _dedupe_by_name(colors)
    return colors

"""
Tile schemas - API response shape for tiles.
"""
from pydantic import BaseModel, ConfigDict


class TileResponse(BaseModel):
    id: int
    manufacturer_id: int
    name: str
    slug: str | None = None

    model_config = ConfigDict(from_attributes=True)

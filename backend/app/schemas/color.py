"""
Color schemas - API response shape for colors.

We include hex_code so the frontend can render color swatches
without needing image assets.
"""
from pydantic import BaseModel, ConfigDict


class ColorResponse(BaseModel):
    id: int
    tile_id: int
    name: str
    hex_code: str | None = None
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)

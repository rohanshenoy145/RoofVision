"""
Pydantic schemas for API request/response validation.

We use separate schemas per resource - this keeps the API contract explicit
and allows us to exclude internal fields (e.g. created_at) from responses
if desired. For Phase 1 we expose all relevant fields.
"""

from app.schemas.manufacturer import ManufacturerResponse
from app.schemas.tile import TileResponse
from app.schemas.color import ColorResponse

__all__ = ["ManufacturerResponse", "TileResponse", "ColorResponse"]

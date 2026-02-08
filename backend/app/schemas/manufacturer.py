"""
Manufacturer schemas - what we return in API responses.

Decision: We use a minimal response schema. We don't include 'tiles' here
because the frontend fetches tiles separately via GET /manufacturers/{id}/tiles.
This keeps responses small and follows a flat, predictable API shape.
"""
from pydantic import BaseModel, ConfigDict


class ManufacturerResponse(BaseModel):
    id: int
    name: str
    slug: str | None = None

    model_config = ConfigDict(from_attributes=True)

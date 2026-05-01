"""Pydantic schemas for visualization upload and response."""
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class VisualizationResponse(BaseModel):
    id: int
    image_path: str
    image_url: str  # URL path to fetch the input image
    manufacturer_id: int
    tile_id: int
    color_id: int
    status: str
    result_url: str | None = None  # when status=completed
    error_message: str | None = None  # when status=failed
    generator: str | None = None  # "gemini" | "mock" when completed
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

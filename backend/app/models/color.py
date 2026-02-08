"""
Color model - leaf level of the waterfall.

Each color belongs to one tile. We store hex_code for UI swatches
and optional image_url for a product sample (can be added later).
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Color(Base):
    __tablename__ = "colors"

    id = Column(Integer, primary_key=True, index=True)
    tile_id = Column(Integer, ForeignKey("tiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False, index=True)
    hex_code = Column(String(7), nullable=True)  # e.g. "#8B7355" for UI swatch
    image_url = Column(String(500), nullable=True)  # optional product sample
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tile = relationship("Tile", back_populates="colors")

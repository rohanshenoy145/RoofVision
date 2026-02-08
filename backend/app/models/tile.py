"""
Tile model - middle level of the waterfall.

Each tile belongs to one manufacturer.
Example: GAF (manufacturer) → Timberline HDZ (tile)
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Tile(Base):
    __tablename__ = "tiles"

    id = Column(Integer, primary_key=True, index=True)
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False, index=True)
    slug = Column(String(150), index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    manufacturer = relationship("Manufacturer", back_populates="tiles")
    colors = relationship("Color", back_populates="tile", cascade="all, delete-orphan")

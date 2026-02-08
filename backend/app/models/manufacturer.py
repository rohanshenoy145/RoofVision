"""
Manufacturer model - top level of the selection waterfall.

Decision: We keep it simple with id, name, and optional slug.
Slug is useful for SEO/URLs but not required for the mobile app MVP.
"""
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: one manufacturer has many tiles
    tiles = relationship("Tile", back_populates="manufacturer", cascade="all, delete-orphan")

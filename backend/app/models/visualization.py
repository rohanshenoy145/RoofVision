"""
Visualization request/job - stores uploaded house image + selection for Phase 3 AI.

Option A storage: image_path is a filename in backend/uploads/ (filesystem).
"""
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class Visualization(Base):
    __tablename__ = "visualizations"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String(255), nullable=False)  # filename in uploads dir
    manufacturer_id = Column(Integer, nullable=False)
    tile_id = Column(Integer, nullable=False)
    color_id = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending | processing | completed | failed
    result_path = Column(String(255), nullable=True)  # filename in uploads/ when status=completed
    error_message = Column(String(500), nullable=True)  # when status=failed
    generator = Column(String(50), nullable=True)  # "gemini" | "mock" when completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

"""
Database models for RoofVision.

Waterfall hierarchy: Manufacturer → Tile → Color
- A Manufacturer has many Tiles (e.g., GAF has Timberline, Landmark)
- A Tile has many Colors (e.g., Timberline comes in Weathered Wood, Charcoal)
"""

from app.models.manufacturer import Manufacturer
from app.models.tile import Tile
from app.models.color import Color

__all__ = ["Manufacturer", "Tile", "Color"]

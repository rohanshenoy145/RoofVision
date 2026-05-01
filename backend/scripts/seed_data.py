"""
Seed script - populates the database with sample manufacturers, tiles, and colors.

Run from backend directory:
    python -m scripts.seed_data

Design: We use realistic roofing industry data. GAF and CertainTeed are real
manufacturers; tile/color names are representative. hex_code values are
typical roof shingle colors for UI swatches.
"""
import sys
from pathlib import Path

# Add backend to path so we can import app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Manufacturer, Tile, Color


def seed(db: Session) -> None:
    """Insert sample data. Idempotent: clears existing data first."""
    # Clear in reverse dependency order (colors -> tiles -> manufacturers)
    db.query(Color).delete()
    db.query(Tile).delete()
    db.query(Manufacturer).delete()
    db.commit()

    # --- Manufacturers (with material_type for "material first" flow) ---
    gaf = Manufacturer(name="GAF", slug="gaf", material_type="shingle")
    certainteed = Manufacturer(name="CertainTeed", slug="certainteed", material_type="shingle")
    owens = Manufacturer(name="Owens Corning", slug="owens-corning", material_type="shingle")
    # Tile & metal placeholders so all three material types have options
    malarkey = Manufacturer(name="Malarkey", slug="malarkey", material_type="tile")
    decra = Manufacturer(name="DECRA", slug="decra", material_type="metal")
    db.add_all([gaf, certainteed, owens, malarkey, decra])
    db.flush()  # Get IDs

    # --- GAF Tiles ---
    timberline = Tile(manufacturer_id=gaf.id, name="Timberline HDZ", slug="timberline-hdz")
    landmark_gaf = Tile(manufacturer_id=gaf.id, name="Landmark", slug="landmark")
    db.add_all([timberline, landmark_gaf])
    db.flush()

    # GAF Timberline colors (common shingle colors)
    gaf_timberline_colors = [
        Color(tile_id=timberline.id, name="Weathered Wood", hex_code="#8B7355"),
        Color(tile_id=timberline.id, name="Charcoal", hex_code="#4A4A4A"),
        Color(tile_id=timberline.id, name="Slate", hex_code="#5D6D7E"),
        Color(tile_id=timberline.id, name="Pewter", hex_code="#6B6B6B"),
        Color(tile_id=timberline.id, name="Hunter Green", hex_code="#355E3B"),
    ]
    db.add_all(gaf_timberline_colors)

    # GAF Landmark colors
    gaf_landmark_colors = [
        Color(tile_id=landmark_gaf.id, name="Weathered Wood", hex_code="#8B7355"),
        Color(tile_id=landmark_gaf.id, name="Driftwood", hex_code="#9A8B7A"),
        Color(tile_id=landmark_gaf.id, name="Moire Black", hex_code="#2C2C2C"),
    ]
    db.add_all(gaf_landmark_colors)

    # --- CertainTeed Tiles ---
    landmark_ct = Tile(manufacturer_id=certainteed.id, name="Landmark", slug="landmark")
    presidential = Tile(manufacturer_id=certainteed.id, name="Presidential Shake", slug="presidential-shake")
    db.add_all([landmark_ct, presidential])
    db.flush()

    # CertainTeed Landmark colors
    ct_landmark_colors = [
        Color(tile_id=landmark_ct.id, name="Weathered Wood", hex_code="#8B7355"),
        Color(tile_id=landmark_ct.id, name="Resawn Shake", hex_code="#6B5B4F"),
        Color(tile_id=landmark_ct.id, name="Colonial Slate", hex_code="#5D6D7E"),
    ]
    db.add_all(ct_landmark_colors)

    # CertainTeed Presidential colors
    ct_presidential_colors = [
        Color(tile_id=presidential.id, name="Weathered Wood", hex_code="#8B7355"),
        Color(tile_id=presidential.id, name="Burnt Sienna", hex_code="#8B4513"),
        Color(tile_id=presidential.id, name="Pewter", hex_code="#6B6B6B"),
    ]
    db.add_all(ct_presidential_colors)

    # --- Owens Corning Tiles ---
    duration = Tile(manufacturer_id=owens.id, name="Duration", slug="duration")
    db.add(duration)
    db.flush()

    owens_colors = [
        Color(tile_id=duration.id, name="Driftwood", hex_code="#9A8B7A"),
        Color(tile_id=duration.id, name="Terra Cotta", hex_code="#B87333"),
        Color(tile_id=duration.id, name="Slate", hex_code="#5D6D7E"),
    ]
    db.add_all(owens_colors)

    # --- Malarkey (tile) - one product line so "Tile" material has a full path ---
    malarkey_legacy = Tile(manufacturer_id=malarkey.id, name="Legacy", slug="legacy")
    db.add(malarkey_legacy)
    db.flush()
    malarkey_colors = [
        Color(tile_id=malarkey_legacy.id, name="Terracotta", hex_code="#B87333"),
        Color(tile_id=malarkey_legacy.id, name="Slate Gray", hex_code="#5D6D7E"),
        Color(tile_id=malarkey_legacy.id, name="Weathered Wood", hex_code="#8B7355"),
    ]
    db.add_all(malarkey_colors)

    # --- DECRA (metal) - one product line so "Metal" material has a full path ---
    decra_stone = Tile(manufacturer_id=decra.id, name="Stone Coated", slug="stone-coated")
    db.add(decra_stone)
    db.flush()
    decra_colors = [
        Color(tile_id=decra_stone.id, name="Slate Gray", hex_code="#5D6D7E"),
        Color(tile_id=decra_stone.id, name="Weathered Wood", hex_code="#8B7355"),
        Color(tile_id=decra_stone.id, name="Black", hex_code="#2C2C2C"),
    ]
    db.add_all(decra_colors)

    db.commit()
    print("Seed complete: manufacturers, tiles, and colors added.")


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

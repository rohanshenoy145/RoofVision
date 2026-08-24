"""
Import curated catalog rows from CSV into the database.

Human-curated from manufacturer brochures (names + codes only — no images or marketing copy).

Usage (from backend/):
    python -m scripts.import_catalog
    python -m scripts.import_catalog --file data/catalog/catalog.csv
    python -m scripts.import_catalog --dry-run

CSV columns — see data/catalog/README.md
"""
from __future__ import annotations

import argparse
import csv
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Color, Manufacturer, Tile

DEFAULT_CSV = Path(__file__).resolve().parent.parent / "data" / "catalog" / "catalog.csv"

REQUIRED_COLUMNS = {
    "manufacturer_name",
    "manufacturer_slug",
    "material_type",
    "profile_name",
    "profile_slug",
    "color_name",
}


def slugify(value: str) -> str:
    s = (value or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "item"


def infer_color_type(color_name: str) -> str | None:
    n = (color_name or "").lower()
    if "blend" in n:
        return "blend"
    if "range" in n:
        return "range"
    if "flashed" in n:
        return "flashed"
    return None


def _get_or_create_manufacturer(db: Session, row: dict) -> Manufacturer:
    slug = row["manufacturer_slug"].strip()
    m = db.query(Manufacturer).filter(Manufacturer.slug == slug).first()
    if m:
        m.name = row["manufacturer_name"].strip()
        m.material_type = row["material_type"].strip().lower()
        return m
    m = Manufacturer(
        name=row["manufacturer_name"].strip(),
        slug=slug,
        material_type=row["material_type"].strip().lower(),
    )
    db.add(m)
    db.flush()
    return m


def _get_or_create_tile(db: Session, manufacturer: Manufacturer, row: dict) -> Tile:
    profile_slug = row["profile_slug"].strip() or slugify(row["profile_name"])
    t = (
        db.query(Tile)
        .filter(Tile.manufacturer_id == manufacturer.id, Tile.slug == profile_slug)
        .first()
    )
    collection = (row.get("collection") or "").strip() or None
    profile_style = (row.get("profile_style") or "").strip() or None
    if t:
        t.name = row["profile_name"].strip()
        if collection:
            t.collection = collection
        if profile_style:
            t.profile_style = profile_style
        return t
    t = Tile(
        manufacturer_id=manufacturer.id,
        name=row["profile_name"].strip(),
        slug=profile_slug,
        collection=collection,
        profile_style=profile_style,
    )
    db.add(t)
    db.flush()
    return t


def _upsert_color(db: Session, tile: Tile, row: dict) -> tuple[Color, bool]:
    code = (row.get("manufacturer_code") or "").strip() or None
    region = (row.get("region") or "").strip().lower() or None
    color_type = (row.get("color_type") or "").strip().lower() or infer_color_type(row["color_name"])
    hex_code = (row.get("hex_code") or "").strip() or None
    source = (row.get("source_document") or "").strip() or None
    name = row["color_name"].strip()

    q = db.query(Color).filter(Color.tile_id == tile.id)
    if code:
        q_code = q.filter(Color.manufacturer_code == code)
        if region:
            c = q_code.filter(Color.region == region).first()
        else:
            c = q_code.filter(Color.region.is_(None)).first()
    else:
        c = q.filter(Color.name == name, Color.region == region).first()

    if c:
        c.name = name
        c.manufacturer_code = code
        c.color_type = color_type
        c.region = region
        c.hex_code = hex_code
        c.source_document = source
        return c, False

    c = Color(
        tile_id=tile.id,
        name=name,
        manufacturer_code=code,
        color_type=color_type,
        region=region,
        hex_code=hex_code,
        source_document=source,
    )
    db.add(c)
    return c, True


def load_rows(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError(f"No header row in {path}")
        missing = REQUIRED_COLUMNS - {h.strip() for h in reader.fieldnames if h}
        if missing:
            raise ValueError(f"Missing CSV columns: {sorted(missing)}")
        return [row for row in reader if any((v or "").strip() for v in row.values())]


def import_catalog(db: Session, path: Path, dry_run: bool = False) -> dict:
    rows = load_rows(path)
    stats = {"rows": 0, "colors_created": 0, "colors_updated": 0, "manufacturers": set(), "profiles": set()}

    for row in rows:
        stats["rows"] += 1
        m = _get_or_create_manufacturer(db, row)
        t = _get_or_create_tile(db, m, row)
        _, created = _upsert_color(db, t, row)
        stats["manufacturers"].add(m.slug)
        stats["profiles"].add(f"{m.slug}/{t.slug}")
        if created:
            stats["colors_created"] += 1
        else:
            stats["colors_updated"] += 1

    if dry_run:
        db.rollback()
    else:
        db.commit()

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description="Import catalog CSV into RoofVision DB")
    parser.add_argument("--file", type=Path, default=DEFAULT_CSV, help="Path to catalog CSV")
    parser.add_argument("--dry-run", action="store_true", help="Parse and validate without committing")
    args = parser.parse_args()

    if not args.file.is_file():
        print(f"Catalog file not found: {args.file}")
        sys.exit(1)

    db = SessionLocal()
    try:
        stats = import_catalog(db, args.file, dry_run=args.dry_run)
        action = "Dry run" if args.dry_run else "Import"
        print(
            f"{action} complete: {stats['rows']} rows, "
            f"{stats['colors_created']} colors created, {stats['colors_updated']} updated, "
            f"{len(stats['manufacturers'])} manufacturers, {len(stats['profiles'])} profiles."
        )
    except Exception as e:
        db.rollback()
        print(f"Import failed: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

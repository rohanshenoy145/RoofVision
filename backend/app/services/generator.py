"""
Phase 3: Generate roof visualization from uploaded image + selection.

Uses the model-agnostic image provider (see app/services/image_providers/).
Configure IMAGE_GEN_PROVIDER + IMAGE_GEN_API_KEY in .env — see docs/IMAGE-GEN-API.md.

On failure, falls back to mock (copy input) so the user always gets a result.
"""
import logging
import shutil
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import Color, Manufacturer, Tile, Visualization
from app.services.ai_agent import AIAgent
from app.services.image_providers.base import ImageGenRequest

logger = logging.getLogger(__name__)

UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


def _build_prompt(db: Session, manufacturer_id: int, tile_id: int, color_id: int) -> str:
    """Build a text prompt from catalog names for the AI."""
    m = db.query(Manufacturer).filter(Manufacturer.id == manufacturer_id).first()
    t = db.query(Tile).filter(Tile.id == tile_id).first()
    c = db.query(Color).filter(Color.id == color_id).first()
    parts = []
    if m:
        parts.append(m.name)
    if t:
        parts.append(t.name)
    if c:
        parts.append(c.name)
    roof_desc = " ".join(parts) if parts else "new asphalt"
    tile_slug = (t.slug if t and t.slug else "").lower()
    material_type = (m.material_type if m and m.material_type else "shingle").lower()
    color_hex = c.hex_code if c and c.hex_code else None

    # Product-profile hints to make geometry/texture changes more visible.
    style_hints_by_slug = {
        "timberline-hdz": "architectural laminated asphalt shingles with dimensional shadow lines and staggered tab pattern",
        "landmark": "architectural laminated shingles with medium-relief texture and layered courses",
        "presidential-shake": "heavy shake-style shingles with thicker butt edges, deeper shadowing, and rugged wood-shake geometry",
        "duration": "high-contrast dimensional asphalt shingles with crisp layered tabs and pronounced depth",
        "legacy": "designer asphalt shingles with wider tab reveals, visible dimensional overlap, and textured shadow bands",
        "stone-coated": "stone-coated metal roof profile with distinct panel/tile contours, crisp seams, and reflective highlights",
    }

    default_hint_by_material = {
        "tile": "curved or contoured tile geometry with distinct piece boundaries and noticeable surface relief",
        "metal": "clean metal panel geometry with visible seams, straighter lines, and subtle reflectivity",
        "shingle": "dimensional asphalt shingle geometry with layered tab pattern and realistic granular texture",
    }
    tile_style_hint = style_hints_by_slug.get(tile_slug, default_hint_by_material.get(material_type, default_hint_by_material["shingle"]))
    color_hint = f" Target roof color should closely match {color_hex}." if color_hex else ""

    return (
        "Photorealistic roof remodel visualization. "
        f"Replace only the roof material and roof color with {roof_desc}. "
        f"Render roof with {tile_style_hint}. "
        "Emphasize roof pattern geometry, tile/tab shape, course spacing, and material texture so product profile is visibly different. "
        "Preserve the exact same house geometry, camera angle, perspective, landscaping, "
        "sky, driveway, and lighting conditions. "
        "Do not alter walls, windows, doors, or non-roof structures. "
        f"Natural textures, realistic shadows, high detail.{color_hint}"
    )


def _mock_copy_to_result(viz: Visualization) -> Path:
    """Copy input image to result file. Returns path to result file."""
    src = UPLOADS_DIR / viz.image_path
    if not src.exists():
        raise FileNotFoundError(f"Input image not found: {src}")
    ext = src.suffix or ".jpg"
    result_filename = f"result_{viz.id}{ext}"
    dest = UPLOADS_DIR / result_filename
    shutil.copy2(src, dest)
    return dest


def run_generation(viz_id: int, db: Session | None = None) -> None:
    """
    Run AI generation for the given visualization job.
    Updates the job in DB: status, result_path or error_message.
    """
    if db is None:
        db = SessionLocal()
        try:
            _run_generation_impl(viz_id, db)
        finally:
            db.close()
        return
    _run_generation_impl(viz_id, db)


def _run_generation_impl(viz_id: int, db: Session) -> None:
    viz = db.query(Visualization).filter(Visualization.id == viz_id).first()
    if not viz:
        logger.warning("Visualization %s not found", viz_id)
        return
    if viz.status == "completed" and viz.result_path:
        logger.info("Visualization %s already completed, skipping", viz_id)
        return

    db.query(Visualization).filter(Visualization.id == viz_id).update(
        {"status": "processing"},
        synchronize_session="fetch",
    )
    db.commit()

    try:
        input_path = UPLOADS_DIR / viz.image_path
        if not input_path.exists():
            raise FileNotFoundError(f"Input image not found: {viz.image_path}")

        prompt = _build_prompt(db, viz.manufacturer_id, viz.tile_id, viz.color_id)
        image_bytes = input_path.read_bytes()

        agent = AIAgent()
        generator_id = agent.id

        try:
            fallback_reason = None
            if generator_id == "mock":
                result_path = _mock_copy_to_result(viz)
                result_filename = result_path.name
            else:
                gen_req = ImageGenRequest(
                    image_bytes=image_bytes,
                    prompt=prompt,
                    negative_prompt="blurry, low quality, distorted",
                    strength=0.45,
                    steps=20,
                    width=512,
                    height=512,
                )
                out_bytes = agent.generate_visualization(gen_req)
                result_filename = f"result_{viz.id}.png"
                (UPLOADS_DIR / result_filename).write_bytes(out_bytes)
        except Exception as e:
            e_text = str(e)
            if "429" in e_text:
                fallback_reason = "Cloud generation limit reached; showing preview image."
            else:
                fallback_reason = "Cloud generation failed; showing preview image."
            logger.warning(
                "Image provider %s failed (%s), falling back to mock for viz %s",
                generator_id,
                e,
                viz_id,
            )
            result_path = _mock_copy_to_result(viz)
            result_filename = result_path.name
            generator_id = "mock"

        db.query(Visualization).filter(Visualization.id == viz_id).update(
            {
                "status": "completed",
                "result_path": result_filename,
                "error_message": fallback_reason if generator_id == "mock" else None,
                "generator": generator_id,
            },
            synchronize_session="fetch",
        )
        db.commit()
        logger.info("Visualization %s completed, result_path=%s generator=%s", viz_id, result_filename, generator_id)
    except Exception as e:
        logger.exception("Visualization %s failed: %s", viz_id, e)
        db.query(Visualization).filter(Visualization.id == viz_id).update(
            {"status": "failed", "error_message": str(e)[:500]},
            synchronize_session="fetch",
        )
        db.commit()

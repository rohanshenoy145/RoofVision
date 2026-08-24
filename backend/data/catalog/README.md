# RoofVision catalog CSV — human-curated from manufacturer brochures

**Legal:** Only add **text identifiers** (brand, profile, color name, manufacturer SKU/code). Do **not** paste marketing paragraphs, logos, or image URLs from brochures. See `docs/COMPLIANCE-AND-COPY.md`.

## Columns

| Column | Required | Example | Notes |
|--------|----------|---------|-------|
| `manufacturer_name` | yes | Eagle Roofing | Display name |
| `manufacturer_slug` | yes | eagle | Stable key; lowercase |
| `material_type` | yes | tile | tile, shingle, metal |
| `region` | no | california | Regional brochure (CA, FL, etc.) |
| `collection` | no | Classic Collection | Marketing grouping from brochure |
| `profile_name` | yes | Bel Air | Product line / profile |
| `profile_slug` | yes | bel-air | Stable key |
| `profile_style` | no | flat | flat, barrel, slate, shake |
| `color_name` | yes | Sierra Madre | Display name |
| `manufacturer_code` | no | 4503 | Eagle 4-digit code (unique per profile) |
| `color_type` | no | blend | blend, range, flashed — auto-guessed from name if empty |
| `hex_code` | no | #8B7355 | Optional; prefer physical sample (Level B) |
| `source_document` | no | EAGLE-CA-2026...pdf | Audit trail |
| `notes` | no | 2026 color of year | Internal; not imported to DB |

## Workflow

1. Eagle regional PDFs: `cd backend && python -m scripts.extract_eagle_catalog --write` (reads `Manufactuers/Eagle/EAGLE-*.pdf`).
2. Or add/edit rows manually in `catalog.csv` as you review other manufacturers.
3. Import: `cd backend && python -m scripts.import_catalog`
4. Dry run: `python -m scripts.import_catalog --dry-run`

Import **upserts** — colors match on `manufacturer_code` + `region` within the same profile.

`seed_data.py` is separate demo data (shingle placeholders). Catalog import does **not** delete existing manufacturers.

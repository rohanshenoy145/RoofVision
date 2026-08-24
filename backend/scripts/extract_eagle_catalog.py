"""
Extract Eagle regional brochure PDFs into catalog.csv rows.

Text identifiers only (profile, color name, manufacturer code) — no marketing copy.

Usage (from backend/):
    python -m scripts.extract_eagle_catalog
    python -m scripts.extract_eagle_catalog --pdf-dir ../Manufactuers/Eagle --write
"""
from __future__ import annotations

import argparse
import csv
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

DEFAULT_PDF_DIR = Path(__file__).resolve().parent.parent.parent / "Manufactuers" / "Eagle"
DEFAULT_CSV = Path(__file__).resolve().parent.parent / "data" / "catalog" / "catalog.csv"

PROFILE_META = {
    "Bel Air": ("bel-air", "flat", "Classic Collection"),
    "Capistrano": ("capistrano", "barrel", "Classic Collection"),
    "Malibu": ("malibu", "double-s", "Classic Collection"),
    "Tapered Slate": ("tapered-slate", "slate", "Classic Collection"),
    "Ponderosa": ("ponderosa", "shake", "Classic Collection"),
    "Sequoia": ("sequoia", "shake", "Classic Collection"),
    "Clay Springs": ("clay-springs", "shake", "Premium Suite"),
}

PDF_REGION = {
    "EAGLE-AZ": "arizona",
    "EAGLE-CA": "california",
    "EAGLE-FL": "florida",
    "EAGLE-GP": "colorado-great-plains",
    "EAGLE-HA": "hawaii",
    "EAGLE-NW": "northwest",
    "EAGLE-SN_UT": "southern-nevada-utah",
    "EAGLE-WC": "western-canada",
}

BAD_NAME = re.compile(
    r"Avenue|Blvd|Riverside|Gate \d|Ste\.|Douglas|Locust|Notice:|Design Center|"
    r"shown is|sister product|REF \.|EMI |SRI ",
    re.I,
)

CSV_FIELDS = [
    "manufacturer_name",
    "manufacturer_slug",
    "material_type",
    "region",
    "collection",
    "profile_name",
    "profile_slug",
    "profile_style",
    "color_name",
    "manufacturer_code",
    "color_type",
    "hex_code",
    "source_document",
    "notes",
]


def infer_color_type(color_name: str) -> str:
    n = color_name.lower()
    if "blend" in n:
        return "blend"
    if "range" in n:
        return "range"
    if "flashed" in n:
        return "flashed"
    return ""


def clean_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip()
    name = re.sub(r",?\s*Staggered$", "", name, flags=re.I)
    name = re.sub(r"\s*&\s*\d{4}.*$", "", name)
    return name


def base_num(code: str) -> int | None:
    c = code.replace("SMB ", "").replace("SRB ", "").strip()
    c = re.sub(r"F$", "", c, flags=re.I)
    return int(c) if c.isdigit() else None


def assign_profile(code_raw: str, *, florida: bool) -> str | None:
    code = code_raw.strip()
    n = base_num(code)
    if n is None:
        return None

    if florida:
        if 58500 <= n <= 58999:
            return "Sequoia"
        if 49500 <= n <= 49999:
            return "Bel Air"
        if 2400 <= n < 2900:
            return "Malibu"
        if 3400 <= n < 4000:
            return "Capistrano"
        if 4400 <= n < 4900:
            return "Bel Air"
        if code_raw.startswith("SRB") or code_raw.startswith("SMB") or 8400 <= n < 8900:
            return "Capistrano"
        return None

    if 49500 <= n <= 49999:
        return "Tapered Slate"
    if 1600 <= n < 1700 or 2500 <= n < 2900:
        return "Malibu"
    if 3500 <= n < 3900:
        return "Capistrano"
    if 4500 <= n < 4900:
        return "Bel Air"
    if 5500 <= n < 5900:
        return "Ponderosa"
    if code_raw.startswith("SMB") or code_raw.startswith("SRB") or 8400 <= n < 8900:
        return "Capistrano"
    if 7800 <= n < 7900:
        return "Clay Springs"
    return None


def region_for_pdf(path: Path) -> str:
    stem = path.stem.upper()
    for prefix, region in PDF_REGION.items():
        if stem.startswith(prefix):
            return region
    raise ValueError(f"Unknown Eagle PDF region for {path.name}")


def extract_pdf(path: Path) -> list[dict]:
    region = region_for_pdf(path)
    florida = region == "florida"
    source = path.name
    text = subprocess.check_output(["pdftotext", path, "-"], text=True)

    seen: set[tuple[str, str, str]] = set()
    rows: list[dict] = []

    def add_row(profile: str, code: str, name: str) -> None:
        name = clean_name(name)
        if BAD_NAME.search(name) or len(name) < 3:
            return
        if not re.match(r"^[A-Za-z]", name):
            return
        if profile not in PROFILE_META:
            return
        key = (profile, code.strip(), name.lower())
        if key in seen:
            return
        seen.add(key)
        slug, style, collection = PROFILE_META[profile]
        rows.append(
            {
                "manufacturer_name": "Eagle Roofing",
                "manufacturer_slug": "eagle",
                "material_type": "tile",
                "region": region,
                "collection": collection,
                "profile_name": profile,
                "profile_slug": slug,
                "profile_style": style,
                "color_name": name,
                "manufacturer_code": code.strip(),
                "color_type": infer_color_type(name),
                "hex_code": "",
                "source_document": source,
                "notes": "",
            }
        )

    for code, name in re.findall(
        r"(?:^|\n)\s*((?:SMB |SRB )?\d{4,5}F?)\s+([A-Za-z][^\n]{2,60}?)"
        r"(?:\s*(?:NEW\s*)?(?:\n|CRRC|Notice))",
        text,
        re.M,
    ):
        profile = assign_profile(code, florida=florida)
        if profile:
            add_row(profile, code, name)

    for match in re.finditer(
        r"(Bel Air|Capistrano|Malibu|Ponderosa|Tapered Slate|Sequoia|Clay Springs)"
        r"[–-]\s*((?:SRB |SMB )?\d{4,5}F?)\s+([A-Za-z][^\n]{2,60})",
        text,
    ):
        add_row(match.group(1), match.group(2), match.group(3))

    if not florida:
        for match in re.finditer(
            r"Tapered Slate[^–\n]*?(\d{5})\s+([A-Za-z][A-Za-z0-9\s\-]+)",
            text,
        ):
            add_row("Tapered Slate", match.group(1), match.group(2))

    rows.sort(key=lambda r: (r["profile_name"], r["manufacturer_code"]))
    return rows


def extract_all(pdf_dir: Path) -> list[dict]:
    pdfs = sorted(pdf_dir.glob("EAGLE-*.pdf"))
    if not pdfs:
        raise FileNotFoundError(f"No EAGLE-*.pdf files in {pdf_dir}")

    all_rows: list[dict] = []
    for pdf in pdfs:
        rows = extract_pdf(pdf)
        all_rows.extend(rows)
        print(f"{pdf.name}: {len(rows)} rows ({region_for_pdf(pdf)})")

    all_rows.sort(key=lambda r: (r["region"], r["profile_name"], r["manufacturer_code"]))
    return all_rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract Eagle PDFs to catalog CSV rows")
    parser.add_argument("--pdf-dir", type=Path, default=DEFAULT_PDF_DIR)
    parser.add_argument("--out", type=Path, default=DEFAULT_CSV)
    parser.add_argument("--write", action="store_true", help="Write catalog.csv")
    args = parser.parse_args()

    rows = extract_all(args.pdf_dir)
    by_region = Counter(r["region"] for r in rows)
    print(f"Total: {len(rows)} rows across {len(by_region)} regions")
    for region, count in sorted(by_region.items()):
        print(f"  {region}: {count}")

    if args.write:
        with args.out.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()

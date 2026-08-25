"""
Approximate UI swatch hex codes for Eagle color names.

These are NOT manufacturer-official color matches — vibe/approximation only
for in-app swatches (Level A preview). Prefer physical samples for accuracy.
"""
from __future__ import annotations

# Explicit overrides for common Eagle names (approximate).
HEX_BY_NAME: dict[str, str] = {
    "Adobe Blend": "#C4A484",
    "Alameda Range": "#8B7355",
    "Arcadia Canyon Brown": "#6B4423",
    "Avondale Blend": "#7A6A5A",
    "Bloomingdale Blend": "#9A8B7A",
    "Bridgeport Blend Copper": "#B87333",
    "Brown Gray Range": "#6B5F54",
    "Brown Range": "#6F4E37",
    "Buena Vista Blend": "#A89070",
    "Calabar Blend": "#5C4033",
    "Canyon Gray": "#7A7A72",
    "Carlsbad Blend": "#8B7355",
    "Charcoal Range": "#3D3D3D",
    "Clay Springs": "#B66A50",
    "Cocoa Range": "#5D4037",
    "Concord Blend": "#5C5346",
    "Corona Del Mar Blend": "#8B6914",
    "Coronado": "#C2B280",
    "Dark Charcoal Range": "#2C2C2C",
    "Dark Gray Range": "#4A4A4A",
    "Evergreen": "#2F4F3E",
    "Fawn Gray Flashed": "#A89888",
    "Flintridge Gray": "#8A8A82",
    "Garnet Brown Range": "#6B2D3C",
    "Grass Valley Range Copper": "#B87333",
    "Grays Peak Range": "#6E6E6E",
    "Hayden Range Copper": "#B87333",
    "Hillsborough Blend": "#7A6855",
    "Kings Canyon Blend": "#6B5344",
    "Knoxville Blend": "#8B7355",
    "Kona Red Range": "#8B3A3A",
    "La Salle Blend": "#9A8B7A",
    "Light Gray Range": "#B0B0A8",
    "Live Oak": "#556B2F",
    "Los Padres Blend": "#8B6F47",
    "Manteca Blend": "#A08060",
    "Maple Creek Blend": "#A67B5B",
    "Moss Creek": "#4A5D4E",
    "Mount Dora Blend": "#8B7355",
    "New Cedar": "#A0522D",
    "New Orleans Blend": "#5C4033",
    "Ocotilla": "#C45C26",
    "Onyx Range": "#1C1C1C",
    "Palm Beach Blend": "#D2B48C",
    "Pewter Bronze Blend": "#8A7F70",
    "Piedmont Blend": "#6B5B4F",
    "Ramona": "#A67B5B",
    "Red Bluff Blend": "#8B4513",
    "Rockledge": "#6B6B63",
    "Rocklin Blend": "#7A6A58",
    "Rosewood": "#65000B",
    "San Benito Blend": "#8B7355",
    "San Mateo Blend": "#7A6F60",
    "San Pablo Blend": "#6B5344",
    "San Rafael Blend": "#5C5346",
    "San Ramon Range": "#8B7D6B",
    "Sanborn Blend": "#9A8B7A",
    "Santa Barbara Blend": "#C4A484",
    "Santa Clara Blend": "#A89078",
    "Santa Cruz Blend": "#8B7355",
    "Santa Paula": "#B8860B",
    "Seattle Blend": "#5A5A5A",
    "Shasta Blend": "#6E7B8B",
    "Sierra Madre": "#8B6914",
    "Slate Range": "#5D6D7E",
    "Sunrise Blend": "#C4A35A",
    "Sunset Blend": "#C2785C",
    "Tehachapi Blend": "#8B7355",
    "Terracambra Range": "#A0522D",
    "Terracotta Flashed": "#CC7744",
    "Tiburon Blend": "#6B6B63",
    "Tombstone Blend": "#5A5A52",
    "Topanga": "#8B7355",
    "Valencia": "#C9A66B",
    "Vallejo Range": "#7A6A5A",
    "Viera Blend": "#9A8B7A",
    "Village Blend": "#8B7D6B",
    "W. Elwood": "#8B7355",
    "Walnut Creek Blend": "#5C4033",
    "Weathered Adobe": "#C4A484",
    "Weathered Terracotta": "#B87333",
    "Weathered Terracotta Flashed": "#C17A4A",
    "Weathered Terracotta Range": "#A86B3C",
}


def approximate_hex(color_name: str) -> str:
    """Return #RRGGBB approximation for a color name, or empty if unknown."""
    name = (color_name or "").strip()
    if not name:
        return ""
    if name in HEX_BY_NAME:
        return HEX_BY_NAME[name]

    n = name.lower()
    # Keyword fallbacks for future brochure colors
    if "onyx" in n or "black" in n:
        return "#1C1C1C"
    if "charcoal" in n:
        return "#3D3D3D"
    if "dark gray" in n or "dark grey" in n:
        return "#4A4A4A"
    if "light gray" in n or "light grey" in n:
        return "#B0B0A8"
    if "slate" in n:
        return "#5D6D7E"
    if "copper" in n or "bronze" in n:
        return "#B87333"
    if "terracotta" in n or "terra cotta" in n:
        return "#B87333"
    if "adobe" in n:
        return "#C4A484"
    if "red" in n or "garnet" in n or "kona" in n:
        return "#8B3A3A"
    if "green" in n or "moss" in n or "oak" in n or "evergreen" in n:
        return "#3F5D4A"
    if "cocoa" in n or "walnut" in n or "brown" in n:
        return "#5D4037"
    if "cedar" in n or "rosewood" in n:
        return "#A0522D"
    if "gray" in n or "grey" in n or "pewter" in n:
        return "#8A8A82"
    if "sunset" in n or "sunrise" in n:
        return "#C4A35A"
    if "blend" in n or "range" in n:
        return "#8B7355"
    return "#8B7355"

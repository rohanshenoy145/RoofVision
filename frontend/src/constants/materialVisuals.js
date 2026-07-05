/**
 * Visual config for material types — solid color swatches per material family.
 */

export const MATERIAL_VISUALS = {
  tile: {
    id: "tile",
    label: "Tile",
    description: "Curved clay or flat concrete profiles",
    accent: "#c2410c",
    accentMuted: "#fed7aa",
    headerBg: "#7c2d12",
    cardBg: "#fff7ed",
    border: "#fdba74",
    swatch: "#c2410c",
    brandPalette: ["#c2410c", "#ea580c", "#b45309", "#9a3412", "#7c2d12"],
    productPalette: ["#dc2626", "#ea580c", "#c2410c", "#b45309"],
  },
  shingle: {
    id: "shingle",
    label: "Shingle",
    description: "Dimensional asphalt shingles",
    accent: "#0f766e",
    accentMuted: "#99f6e4",
    headerBg: "#134e4a",
    cardBg: "#f0fdfa",
    border: "#5eead4",
    swatch: "#0f766e",
    brandPalette: ["#0f766e", "#0d9488", "#115e59", "#134e4a", "#047857"],
    productPalette: ["#14b8a6", "#0d9488", "#0f766e", "#115e59"],
  },
  metal: {
    id: "metal",
    label: "Metal",
    description: "Standing seam & stone-coated panels",
    accent: "#475569",
    accentMuted: "#cbd5e1",
    headerBg: "#334155",
    cardBg: "#f8fafc",
    border: "#94a3b8",
    swatch: "#64748b",
    brandPalette: ["#64748b", "#475569", "#334155", "#71717a", "#52525b"],
    productPalette: ["#94a3b8", "#64748b", "#475569", "#334155"],
  },
};

export const PRODUCT_STYLE_HINTS = {
  "timberline-hdz": "Architectural laminate",
  landmark: "Dimensional shingle",
  "presidential-shake": "Heavy shake profile",
  duration: "High-contrast tabs",
  legacy: "Designer profile",
  "stone-coated": "Stone-coated metal",
};

export function getMaterialVisual(materialType) {
  return MATERIAL_VISUALS[materialType] || MATERIAL_VISUALS.shingle;
}

export function hashColorForName(name, palette) {
  const colors = palette || ["#64748b"];
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}

export function brandSwatchForName(name, materialType) {
  const visual = getMaterialVisual(materialType);
  return hashColorForName(name, visual.brandPalette);
}

export function productSwatchForName(name, materialType) {
  const visual = getMaterialVisual(materialType);
  return hashColorForName(name, visual.productPalette);
}

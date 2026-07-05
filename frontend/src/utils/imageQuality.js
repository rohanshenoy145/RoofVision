/**
 * Heuristic input-quality hints from picker metadata (no Gemini / no ML).
 * Surfaces "shaky" or weak inputs: tiny resolution, heavy compression, odd aspect.
 */

/**
 * @param {import("expo-image-picker").ImagePickerAsset | null | undefined} asset
 * @returns {{ level: "good"|"medium"|"low"; summary: string; tips: string[]; minEdge: number; megapixels: number }}
 */
export function evaluateImageQuality(asset) {
  if (!asset) {
    return {
      level: "medium",
      summary: "Could not read photo details. Preview quality may vary.",
      tips: ["Try choosing the photo again."],
      minEdge: 0,
      megapixels: 0,
    };
  }

  const w = asset.width || 0;
  const h = asset.height || 0;
  const minEdge = Math.min(w, h);
  const maxEdge = Math.max(w, h);
  const megapixels = (w * h) / 1e6;
  const aspect = minEdge > 0 ? maxEdge / minEdge : 1;

  const tips = [];
  let level = "good";
  let summary = "Photo resolution looks suitable for a roof preview.";

  if (minEdge < 280 || megapixels < 0.08) {
    level = "low";
    summary =
      "Low resolution — edges and shingle texture may look soft or unrealistic. Consider a closer, sharper photo.";
    tips.push("Use daylight and hold steady, or pick a higher-resolution file from your library.");
  } else if (minEdge < 520 || megapixels < 0.25) {
    level = "medium";
    summary =
      "Moderate resolution — preview should work, but fine roof detail may be limited.";
    tips.push("If results look mushy, try a photo with more visible roof area.");
  }

  if (aspect > 2.8) {
    if (level === "good") level = "medium";
    tips.push("Very wide or tall framing can make roof edges harder to read; a straighter elevation helps.");
  }

  const fileSize = asset.fileSize;
  if (typeof fileSize === "number" && fileSize > 0 && fileSize < 70_000) {
    if (level === "good") {
      level = "medium";
      summary =
        "Small file size — heavy compression may hide texture. A less-compressed original often previews better.";
    } else if (level === "medium") {
      tips.push("Original camera files usually compress less than forwarded chat images.");
    }
  }

  return { level, summary, tips, minEdge, megapixels: Math.round(megapixels * 100) / 100 };
}

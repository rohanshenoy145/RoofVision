/**
 * API client for RoofVision backend.
 */
import { Platform } from "react-native";
import { API_BASE_URL } from "../constants";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  let res;
  try {
    res = await fetch(url, config);
  } catch (e) {
    const err = new Error(e?.message || "Network request failed");
    err.cause = e;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`API error: ${res.status} ${res.statusText}`);
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch {
      err.body = await res.text();
    }
    throw err;
  }
  return res.json();
}

async function uploadVisualization(imageUri, manufacturerId, tileId, colorId) {
  const formData = new FormData();

  if (Platform.OS === "web" && imageUri?.startsWith?.("blob:")) {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    const ext = blob.type === "image/png" ? ".png" : ".jpg";
    formData.append("file", blob, `photo${ext}`);
  } else {
    const filePart = { uri: imageUri, type: "image/jpeg", name: "photo.jpg" };
    formData.append("file", filePart);
  }

  formData.append("manufacturer_id", String(manufacturerId));
  formData.append("tile_id", String(tileId));
  formData.append("color_id", String(colorId));

  const url = `${API_BASE_URL}/visualizations`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });
  } catch (e) {
    const err = new Error(e?.message || "Network request failed");
    err.cause = e;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`Upload failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch {
      err.body = await res.text();
    }
    throw err;
  }
  return res.json();
}

export function getUploadBaseUrl() {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
}

/** Resolve API-relative upload paths or pass through absolute cloud URLs. */
export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getUploadBaseUrl();
  if (pathOrUrl.startsWith("/")) return `${base}${pathOrUrl}`;
  return `${base}/${pathOrUrl}`;
}

export const api = {
  getManufacturers: (materialType) =>
    request(materialType ? `/manufacturers?material_type=${encodeURIComponent(materialType)}` : "/manufacturers"),
  getTilesByManufacturer: (manufacturerId) => request(`/manufacturers/${manufacturerId}/tiles`),
  getColorsByTile: (tileId) => request(`/tiles/${tileId}/colors`),
  uploadVisualization,
  getVisualization: (id) => request(`/visualizations/${id}`),
};

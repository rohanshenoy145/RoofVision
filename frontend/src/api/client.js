/**
 * API client for RoofVision backend.
 *
 * Design: Simple fetch wrapper. We use the native fetch API (no axios) to
 * keep dependencies minimal. For physical device testing, change API_BASE_URL
 * in src/constants/index.js to your machine's LAN IP (e.g. http://192.168.1.x:8001/api/v1).
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
  const res = await fetch(url, config);
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

/**
 * Upload image + selection. Uses FormData; on web with blob URI we fetch the blob first.
 */
async function uploadVisualization(imageUri, manufacturerId, tileId, colorId) {
  const formData = new FormData();
  let filePart;

  if (Platform.OS === "web" && imageUri?.startsWith?.("blob:")) {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    const ext = blob.type === "image/png" ? ".png" : ".jpg";
    filePart = { uri: imageUri, type: blob.type, name: `photo${ext}` };
    formData.append("file", blob, `photo${ext}`);
  } else {
    filePart = { uri: imageUri, type: "image/jpeg", name: "photo.jpg" };
    formData.append("file", filePart);
  }

  formData.append("manufacturer_id", String(manufacturerId));
  formData.append("tile_id", String(tileId));
  formData.append("color_id", String(colorId));

  const url = `${API_BASE_URL}/visualizations`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });

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

/** Base URL for the backend (no /api/v1) - used to build full image URLs */
export function getUploadBaseUrl() {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
}

export const api = {
  getManufacturers: (materialType) =>
    request(materialType ? `/manufacturers?material_type=${encodeURIComponent(materialType)}` : "/manufacturers"),
  getTilesByManufacturer: (manufacturerId) =>
    request(`/manufacturers/${manufacturerId}/tiles`),
  getColorsByTile: (tileId) => request(`/tiles/${tileId}/colors`),
  uploadVisualization,
  getVisualization: (id) => request(`/visualizations/${id}`),
};

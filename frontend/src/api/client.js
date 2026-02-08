/**
 * API client for RoofVision backend.
 *
 * Design: Simple fetch wrapper. We use the native fetch API (no axios) to
 * keep dependencies minimal. For physical device testing, change API_BASE_URL
 * in src/constants/index.js to your machine's LAN IP (e.g. http://192.168.1.x:8000/api/v1).
 */
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

export const api = {
  getManufacturers: () => request("/manufacturers"),
  getTilesByManufacturer: (manufacturerId) =>
    request(`/manufacturers/${manufacturerId}/tiles`),
  getColorsByTile: (tileId) => request(`/tiles/${tileId}/colors`),
};

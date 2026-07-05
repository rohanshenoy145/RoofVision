/**
 * App constants
 * Override with EXPO_PUBLIC_API_BASE_URL in frontend/.env (e.g. LAN IP for a physical device).
 *
 * Web production builds set __DEV__ false, so we still point at the local API when the page is
 * opened from localhost (e.g. static `expo export` served on another port).
 */
function defaultApiBaseUrl() {
  const fromEnv =
    typeof process !== "undefined" && process.env.EXPO_PUBLIC_API_BASE_URL
      ? String(process.env.EXPO_PUBLIC_API_BASE_URL).trim()
      : "";
  if (fromEnv) return fromEnv;

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    return "http://localhost:8001/api/v1";
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return "http://localhost:8001/api/v1";
    }
  }

  return "https://api.roofvision.example.com/api/v1";
}

export const API_BASE_URL = defaultApiBaseUrl();

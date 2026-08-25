/**
 * Map fetch/API failures to user-facing copy + hints (no secrets).
 */
export function formatApiError(err, context = "request") {
  const msg = err?.message || String(err);
  const isDev = typeof __DEV__ !== "undefined" && __DEV__;

  if (/Network request failed|Failed to fetch|ECONNREFUSED|network/i.test(msg)) {
    return {
      title: "Can’t reach the server",
      hint: isDev
        ? "Check that the API is running and your device can reach EXPO_PUBLIC_API_BASE_URL (same Wi‑Fi for a LAN URL)."
        : "Check your internet connection and try again in a moment.",
    };
  }
  if (err?.status === 404) {
    return { title: "Not found", hint: `No data was found for this ${context}.` };
  }
  if (err?.status >= 500) {
    return { title: "Server error", hint: "Try again in a moment. If it keeps happening, try later." };
  }
  return { title: msg, hint: "Pull to retry or go back and try again." };
}

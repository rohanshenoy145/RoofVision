/**
 * Map fetch/API failures to user-facing copy + hints (no secrets).
 */
export function formatApiError(err, context = "request") {
  const msg = err?.message || String(err);
  if (/Network request failed|Failed to fetch|ECONNREFUSED|network/i.test(msg)) {
    return {
      title: "Can’t reach the server",
      hint:
        "Check that the API is running, your device is on the same network as your dev machine (if using a LAN URL), and that nothing is blocking port 8001.",
    };
  }
  if (err?.status === 404) {
    return { title: "Not found", hint: `The server had no data for this ${context}.` };
  }
  if (err?.status >= 500) {
    return { title: "Server error", hint: "Try again in a moment. If it keeps happening, check backend logs." };
  }
  return { title: msg, hint: "Pull to retry or go back and try again." };
}

/**
 * Crash reporting scaffold. Full Sentry requires a dev/prod native build (EAS), not Expo Go.
 * Set EXPO_PUBLIC_SENTRY_DSN when ready — see docs/DEPLOY.md.
 */
import { sentryDsn } from "../constants/flags";

let initialized = false;

export function initObservability() {
  if (initialized || !sentryDsn) return;
  initialized = true;

  try {
    // Optional: install @sentry/react-native and uncomment when using EAS builds
    // const Sentry = require("@sentry/react-native");
    // Sentry.init({ dsn: sentryDsn, enableInExpoDevelopment: false });
    if (__DEV__) {
      console.info("[observability] EXPO_PUBLIC_SENTRY_DSN set — enable @sentry/react-native in EAS builds");
    }
  } catch (e) {
    if (__DEV__) {
      console.warn("[observability] Sentry not configured:", e?.message);
    }
  }
}

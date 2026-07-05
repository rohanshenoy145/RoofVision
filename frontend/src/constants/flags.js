/**
 * Build-time / runtime flags from EXPO_PUBLIC_* (set in eas.json env or .env for local).
 */

function truthy(v) {
  return v === "1" || v === "true" || v === "yes";
}

function envString(key) {
  return typeof process !== "undefined" ? String(process.env[key] || "").trim() : "";
}

/** Hide “Continue with Google (demo)” for store / production builds; guest still available. */
export const hideDemoGoogleAuth = truthy(envString("EXPO_PUBLIC_HIDE_DEMO_GOOGLE").toLowerCase());

/** Hosted privacy policy URL (Settings + store listing). */
export const privacyPolicyUrl = envString("EXPO_PUBLIC_PRIVACY_POLICY_URL");

/** Hosted terms of use URL (Settings + store listing). */
export const termsOfUseUrl = envString("EXPO_PUBLIC_TERMS_OF_USE_URL");

/** Support contact — mailto: or https support page (Settings + store listing). */
export const supportUrl = envString("EXPO_PUBLIC_SUPPORT_URL");

/** Sentry DSN — used in dev/prod builds with @sentry/react-native (not Expo Go). */
export const sentryDsn = envString("EXPO_PUBLIC_SENTRY_DSN");

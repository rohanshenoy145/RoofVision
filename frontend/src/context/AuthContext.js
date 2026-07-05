import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_USER = "roofvision_auth_user_v1";
const KEY_ONBOARDING = "roofvision_onboarding_complete_v1";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rawUser, rawOb] = await Promise.all([
          AsyncStorage.getItem(KEY_USER),
          AsyncStorage.getItem(KEY_ONBOARDING),
        ]);
        if (cancelled) return;
        if (rawUser) setUser(JSON.parse(rawUser));
        setOnboardingComplete(rawOb === "1");
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistUser = useCallback(async (next) => {
    setUser(next);
    if (next) await AsyncStorage.setItem(KEY_USER, JSON.stringify(next));
    else await AsyncStorage.removeItem(KEY_USER);
  }, []);

  const signInGoogleDemo = useCallback(async () => {
    await persistUser({
      id: "google-demo",
      provider: "google",
      displayName: "Demo Roofer",
      email: "demo.user@roofvision.app",
      signedInAt: new Date().toISOString(),
    });
  }, [persistUser]);

  const signInGuest = useCallback(async () => {
    await persistUser({
      id: "guest",
      provider: "guest",
      displayName: "Guest",
      email: null,
      signedInAt: new Date().toISOString(),
    });
  }, [persistUser]);

  const signOut = useCallback(async () => {
    setUser(null);
    setOnboardingComplete(false);
    await AsyncStorage.multiRemove([KEY_USER, KEY_ONBOARDING]);
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(KEY_ONBOARDING, "1");
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      user,
      onboardingComplete,
      signInGoogleDemo,
      signInGuest,
      signOut,
      completeOnboarding,
    }),
    [hydrated, user, onboardingComplete, signInGoogleDemo, signInGuest, signOut, completeOnboarding]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

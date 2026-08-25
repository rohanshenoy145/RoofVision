/**
 * Entry auth — optional demo Google + guest. Hide demo for store builds via EXPO_PUBLIC_HIDE_DEMO_GOOGLE=1.
 */
import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { COPY } from "../constants/copy";
import { hideDemoGoogleAuth } from "../constants/flags";

export default function AuthScreen() {
  const { signInGoogleDemo, signInGuest } = useAuth();
  const [busy, setBusy] = useState(false);

  const onGoogle = async () => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      await signInGoogleDemo();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0f172a]"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 56 }}
    >
      <Text className="text-[#94a3b8] text-xs tracking-[3px] mb-2">ROOFVISION</Text>
      <Text className="text-3xl font-bold text-white mb-2">Welcome</Text>
      <Text className="text-[#cbd5e1] text-base leading-6 mb-8">
        {hideDemoGoogleAuth
          ? "Continue as a guest to pick materials, add a home photo, and preview roof options."
          : "Continue as a guest, or use the demo Google sign-in for local development."}
      </Text>

      {!hideDemoGoogleAuth && (
        <>
          <Pressable
            onPress={onGoogle}
            disabled={busy}
            className="bg-white py-4 rounded-xl flex-row items-center justify-center gap-2 active:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <>
                <Text className="text-2xl">G</Text>
                <Text className="text-[#0f172a] font-semibold text-base">Continue with Google (demo)</Text>
              </>
            )}
          </Pressable>
          <Text className="text-[#64748b] text-xs mt-3 leading-5">{COPY.googleStubNote}</Text>
          <View className="h-px bg-[#334155] my-8" />
        </>
      )}

      <Pressable
        onPress={signInGuest}
        disabled={busy}
        className="border border-[#475569] py-3 rounded-xl active:opacity-80"
      >
        <Text className="text-[#e2e8f0] font-medium text-center">Continue as guest</Text>
      </Pressable>
      <Text className="text-[#64748b] text-xs mt-2 text-center">
        {hideDemoGoogleAuth
          ? "No account required for this version."
          : "Guest mode skips account linking."}
      </Text>
    </ScrollView>
  );
}

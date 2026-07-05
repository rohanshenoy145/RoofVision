/**
 * About & settings — disclaimers, auth status, legal links, sign out.
 */
import React from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import Constants from "expo-constants";
import { useAuth } from "../context/AuthContext";
import { COPY } from "../constants/copy";
import { API_BASE_URL } from "../constants";
import { privacyPolicyUrl, supportUrl, termsOfUseUrl } from "../constants/flags";

function openUrl(url) {
  if (url) Linking.openURL(url);
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildProfile = typeof __DEV__ !== "undefined" && __DEV__ ? "development" : "release";

  return (
    <ScrollView className="flex-1 bg-[#e2e8f0]" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="bg-white rounded-2xl p-4 border border-[#dbe4ef] mb-4">
        <Text className="text-[#64748b] text-xs uppercase mb-1">Signed in as</Text>
        <Text className="text-[#0f172a] text-lg font-semibold">{user?.displayName || "—"}</Text>
        {user?.email ? (
          <Text className="text-[#475569] text-sm mt-1">{user.email}</Text>
        ) : (
          <Text className="text-[#64748b] text-sm mt-1">Guest — no email on device</Text>
        )}
        <Text className="text-[#94a3b8] text-xs mt-2 capitalize">Provider: {user?.provider || "—"}</Text>
      </View>

      <View className="bg-white rounded-2xl p-4 border border-[#dbe4ef] mb-4">
        <Text className="text-[#0f172a] font-semibold text-lg mb-2">About RoofVision</Text>
        <Text className="text-[#475569] text-sm leading-5 mb-3">
          A guided flow to pick roof materials and colors, add a home photo, and view an AI-assisted preview. Version
          focus: consultation visuals, not estimates or CRM.
        </Text>
        <Text className="text-[#64748b] text-xs">
          Version {appVersion} ({buildProfile})
        </Text>
        {typeof __DEV__ !== "undefined" && __DEV__ ? (
          <Text className="text-[#94a3b8] text-xs mt-2 leading-5">API: {API_BASE_URL}</Text>
        ) : null}
      </View>

      <View className="bg-[#1e293b] rounded-2xl p-4 mb-4">
        <Text className="text-white font-semibold mb-2">Legal & privacy</Text>
        <Text className="text-[#cbd5e1] text-sm leading-5 mb-3">
          Photos you upload are sent to your RoofVision backend for preview generation. Host your privacy policy and
          terms before App Store submission — draft templates are in the repo under docs/legal/.
        </Text>
        {privacyPolicyUrl ? (
          <Pressable onPress={() => openUrl(privacyPolicyUrl)} className="mb-2 py-1 active:opacity-80">
            <Text className="text-sky-300 text-sm font-semibold underline">Privacy policy</Text>
          </Pressable>
        ) : (
          <Text className="text-[#64748b] text-xs mb-2">Set EXPO_PUBLIC_PRIVACY_POLICY_URL for a live link.</Text>
        )}
        {termsOfUseUrl ? (
          <Pressable onPress={() => openUrl(termsOfUseUrl)} className="mb-2 py-1 active:opacity-80">
            <Text className="text-sky-300 text-sm font-semibold underline">Terms of use</Text>
          </Pressable>
        ) : (
          <Text className="text-[#64748b] text-xs mb-2">Set EXPO_PUBLIC_TERMS_OF_USE_URL for a live link.</Text>
        )}
        {supportUrl ? (
          <Pressable onPress={() => openUrl(supportUrl)} className="mb-2 py-1 active:opacity-80">
            <Text className="text-sky-300 text-sm font-semibold underline">Support</Text>
          </Pressable>
        ) : null}
        <Text className="text-[#94a3b8] text-xs leading-5 mt-2">{COPY.notAffiliated}</Text>
      </View>

      <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6">
        <Text className="text-amber-950 text-sm font-medium mb-1">Reminder</Text>
        <Text className="text-amber-950 text-sm leading-5">{COPY.aiPreviewShort}</Text>
      </View>

      <Pressable
        onPress={async () => {
          await signOut();
        }}
        className="bg-white border border-[#fecaca] py-3 rounded-xl active:opacity-90"
      >
        <Text className="text-[#b91c1c] font-semibold text-center">Sign out</Text>
      </Pressable>
      <Text className="text-[#64748b] text-xs text-center mt-3">
        Signing out clears this device session and shows onboarding again next time.
      </Text>
    </ScrollView>
  );
}

/**
 * First-run compliance and expectations — one screen, persisted after continue.
 */
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { COPY } from "../constants/copy";

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();

  return (
    <ScrollView
      className="flex-1 bg-[#f8fafc]"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 64 }}
    >
      <Text className="text-2xl font-bold text-[#0f172a] mb-2">Before you start</Text>
      <Text className="text-[#64748b] text-base leading-6 mb-6">
        RoofVision is built for roof consultations. Please read the following so you and your customers share the same
        expectations.
      </Text>

      <View className="bg-white rounded-2xl p-4 border border-[#e2e8f0] mb-4">
        <Text className="text-[#0f172a] font-semibold mb-2">AI previews</Text>
        <Text className="text-[#475569] text-sm leading-5">{COPY.aiPreviewBody}</Text>
      </View>

      <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-4">
        <Text className="text-amber-900 font-semibold mb-2">Input photo quality</Text>
        <Text className="text-amber-950 text-sm leading-5">
          Blurry, distant, or very small images produce weaker previews. The app will flag obvious quality issues when
          you pick a photo.
        </Text>
      </View>

      <View className="bg-white rounded-2xl p-4 border border-[#e2e8f0] mb-8">
        <Text className="text-[#0f172a] font-semibold mb-2">Brands</Text>
        <Text className="text-[#475569] text-sm leading-5">{COPY.notAffiliated}</Text>
      </View>

      <Pressable
        onPress={() => completeOnboarding()}
        className="bg-[#0f766e] py-4 rounded-xl active:opacity-90"
      >
        <Text className="text-white font-semibold text-center text-base">I understand — continue</Text>
      </Pressable>
    </ScrollView>
  );
}

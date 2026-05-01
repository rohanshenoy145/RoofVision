/**
 * Home screen - entry point. User taps "Start" to begin selection flow.
 */
import React from "react";
import { View, Text, Pressable } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View className="flex-1 bg-[#e2e8f0]">
      <View className="bg-[#1e293b] px-8 pt-20 pb-12 rounded-b-[36px]">
        <Text className="text-[#cbd5e1] text-xs tracking-[2px] mb-2">ROOF VISUALIZER</Text>
        <Text className="text-4xl font-bold text-white">RoofVision</Text>
        <Text className="text-[#cbd5e1] mt-3 text-base leading-6">
          Visualize new roof styles with realistic AI previews before you commit.
        </Text>
      </View>

      <View className="px-6 -mt-7">
        <View className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-sm">
          <Text className="text-[#1e293b] text-lg font-semibold mb-2">How it works</Text>
          <Text className="text-[#64748b] text-sm leading-5">
            Pick material, manufacturer, product, and color. Upload a home photo and generate your roof preview.
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Material")}
            className="bg-[#0f766e] mt-5 px-6 py-4 rounded-xl active:opacity-90"
          >
            <Text className="text-white font-semibold text-center text-base">Start visualization</Text>
          </Pressable>
        </View>
      </View>

      <View className="px-6 mt-4 flex-1 pb-6">
        <View className="bg-white rounded-2xl p-4 border border-[#dbe4ef] mb-3">
          <Text className="text-[#0f172a] font-semibold">What you get</Text>
          <Text className="text-[#64748b] text-sm mt-1">
            Compare roof materials and colors on your own home before making a final decision.
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 border border-[#dbe4ef] mb-3">
          <Text className="text-[#0f172a] font-semibold">Fast workflow</Text>
          <Text className="text-[#64748b] text-sm mt-1">
            Material -> Product -> Color -> Photo -> AI result in one guided flow.
          </Text>
        </View>

        <View className="bg-[#334155] rounded-2xl p-4 border border-[#334155] flex-1 justify-center">
          <Text className="text-white font-semibold text-lg mb-1">Built for roof consultations</Text>
          <Text className="text-[#cbd5e1] text-sm leading-5">
            Help homeowners visualize realistic roof options and make faster decisions with confidence.
          </Text>
        </View>
      </View>
    </View>
  );
}

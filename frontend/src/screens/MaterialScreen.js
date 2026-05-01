/**
 * Material screen - select roof material type first (tile, shingle, metal).
 * Then user goes to manufacturers filtered by that material.
 */
import React from "react";
import { View, Text, Pressable } from "react-native";

const MATERIALS = [
  { id: "tile", label: "Tile", description: "Clay or concrete tile roofing" },
  { id: "shingle", label: "Shingle", description: "Asphalt shingle roofing" },
  { id: "metal", label: "Metal", description: "Metal roofing panels" },
];

export default function MaterialScreen({ navigation }) {
  return (
    <View className="flex-1 bg-[#e2e8f0] px-5 pt-3">
      <View className="bg-white rounded-2xl p-4 mb-4 border border-[#e2e8f0]">
        <Text className="text-[#0f172a] font-semibold text-base">Step 1 of 4</Text>
        <Text className="text-[#475569] text-sm mt-1">
        Choose your roof material type, then pick a manufacturer.
        </Text>
      </View>
      {MATERIALS.map((m) => (
        <Pressable
          key={m.id}
          onPress={() =>
            navigation.navigate("Manufacturers", {
              materialType: m.id,
              materialLabel: m.label,
            })
          }
          className="bg-white rounded-xl p-4 mb-3 border border-[#dbe4ef] active:opacity-90"
        >
          <Text className="text-[#1e293b] font-semibold text-lg">{m.label}</Text>
          <Text className="text-[#64748b] text-sm mt-1">{m.description}</Text>
        </Pressable>
      ))}
    </View>
  );
}

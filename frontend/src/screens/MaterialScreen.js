/**
 * Material screen - select roof material type first (tile, shingle, metal).
 */
import React from "react";
import { View, ScrollView } from "react-native";
import SelectionCard from "../components/SelectionCard";
import SelectionStepHeader from "../components/SelectionStepHeader";
import { MATERIAL_VISUALS } from "../constants/materialVisuals";

const MATERIALS = Object.values(MATERIAL_VISUALS);

export default function MaterialScreen({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-[#eef2f6]" contentContainerStyle={{ paddingBottom: 24 }}>
      <SelectionStepHeader
        step={1}
        title="Choose roof material"
        subtitle="Each type changes texture, shadow lines, and how color reads on your home."
      />
      <View className="px-4 pt-1">
        {MATERIALS.map((m) => (
          <SelectionCard
            key={m.id}
            title={m.label}
            subtitle={m.description}
            accent={m.accent}
            accentMuted={m.accentMuted}
            swatchColor={m.swatch}
            onPress={() =>
              navigation.navigate("Manufacturers", {
                materialType: m.id,
                materialLabel: m.label,
              })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

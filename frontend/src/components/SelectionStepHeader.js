import React from "react";
import { View, Text } from "react-native";
import { getMaterialVisual } from "../constants/materialVisuals";

export default function SelectionStepHeader({
  step,
  total = 4,
  title,
  subtitle,
  materialType,
}) {
  const visual = materialType ? getMaterialVisual(materialType) : null;

  return (
    <View
      className="mx-4 mt-3 mb-2 rounded-2xl overflow-hidden border"
      style={{
        backgroundColor: visual?.cardBg || "#ffffff",
        borderColor: visual?.border || "#dbe4ef",
      }}
    >
      {visual ? (
        <View className="h-1.5" style={{ backgroundColor: visual.accent }} />
      ) : null}
      <View className="px-4 py-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: visual?.accent || "#64748b" }}>
            Step {step} of {total}
          </Text>
          <View className="flex-row gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: i + 1 === step ? 18 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i < step ? visual?.accent || "#0f766e" : "#e2e8f0",
                }}
              />
            ))}
          </View>
        </View>
        <Text className="text-[#0f172a] font-semibold text-base">{title}</Text>
        {subtitle ? <Text className="text-[#64748b] text-sm mt-1 leading-5">{subtitle}</Text> : null}
      </View>
    </View>
  );
}

import React from "react";
import { View, Text, Pressable } from "react-native";

export default function SelectionCard({
  title,
  subtitle,
  onPress,
  accent = "#0f766e",
  accentMuted = "#ccfbf1",
  swatchColor,
  trailing = "›",
}) {
  const fill = swatchColor || accent;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl mb-3 overflow-hidden border active:opacity-90"
      style={{ borderColor: `${accent}44`, backgroundColor: "#ffffff" }}
    >
      <View className="flex-row items-stretch min-h-[88px]">
        <View style={{ width: 88, minHeight: 88, backgroundColor: fill }} />
        <View className="flex-1 px-4 py-3 justify-center">
          <Text className="text-[#0f172a] font-semibold text-base">{title}</Text>
          {subtitle ? (
            <Text className="text-[#64748b] text-sm mt-1 leading-5" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing ? (
          <View className="justify-center pr-4">
            <Text className="text-2xl font-light" style={{ color: accent }}>
              {trailing}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

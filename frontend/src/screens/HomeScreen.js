/**
 * Home screen - entry point. User taps "Start" to begin selection flow.
 */
import React from "react";
import { View, Text, Pressable } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View className="flex-1 bg-slate-50 items-center justify-center px-6">
      <Text className="text-2xl font-bold text-slate-800 text-center mb-2">
        RoofVision
      </Text>
      <Text className="text-slate-600 text-center mb-8">
        Select manufacturer, tile, and color to visualize your roof
      </Text>
      <Pressable
        onPress={() => navigation.navigate("Manufacturers")}
        className="bg-slate-800 px-8 py-4 rounded-lg active:opacity-80"
      >
        <Text className="text-white font-semibold text-lg">Start Selection</Text>
      </Pressable>
    </View>
  );
}

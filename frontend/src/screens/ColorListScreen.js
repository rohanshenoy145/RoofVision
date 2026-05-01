/**
 * Color list - fetches colors for the selected tile.
 * Tapping a color goes to AddPhotoScreen to add a house image and upload.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { api } from "../api/client";

export default function ColorListScreen({ route, navigation }) {
  const { tileId, tileName, manufacturerName, manufacturerId } = route.params;
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getColorsByTile(tileId)
      .then(setColors)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tileId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#e2e8f0]">
        <ActivityIndicator size="large" color="#334155" />
        <Text className="text-[#64748b] mt-2">Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-[#e2e8f0] px-6">
        <Text className="text-[#b91c1c] text-center font-medium">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#e2e8f0]">
      <View className="px-4 py-3">
        <View className="bg-white rounded-xl px-4 py-3 border border-[#dbe4ef]">
          <Text className="text-[#0f172a] font-semibold text-sm">Step 4 of 4</Text>
          <Text className="text-[#64748b] text-sm mt-1">{manufacturerName} → {tileName}</Text>
        </View>
      </View>
      <FlatList
        data={colors}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("AddPhoto", {
                manufacturerId,
                manufacturerName,
                tileId,
                tileName,
                colorId: item.id,
                colorName: item.name,
              })
            }
            className="bg-white p-4 rounded-xl mb-3 flex-row items-center border border-[#dbe4ef] active:opacity-90"
          >
            {item.hex_code && (
              <View
                className="w-10 h-10 rounded-lg mr-4 border border-[#e5e7eb]"
                style={{ backgroundColor: item.hex_code }}
              />
            )}
            <Text className="text-[#1e293b] font-medium flex-1">{item.name}</Text>
          </Pressable>
        )}
      />
      <View className="p-4 border-t border-[#dbe4ef] bg-white">
        <Text className="text-[#64748b] text-center text-sm">
          Tap a color to add a photo and generate your visualization
        </Text>
      </View>
    </View>
  );
}

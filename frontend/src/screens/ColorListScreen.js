/**
 * Color list - fetches colors for the selected tile.
 * Displays color swatch (hex_code) when available.
 * This is the final step; future: "Generate Visualization" button.
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

export default function ColorListScreen({ route }) {
  const { tileId, tileName, manufacturerName } = route.params;
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
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#1e293b" />
        <Text className="text-slate-600 mt-2">Loading colors...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 px-6">
        <Text className="text-red-600 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 py-2 bg-slate-100">
        <Text className="text-slate-500 text-sm">
          {manufacturerName} → {tileName}
        </Text>
      </View>
      <FlatList
        data={colors}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable className="bg-white p-4 rounded-lg mb-2 flex-row items-center active:opacity-80">
            {item.hex_code && (
              <View
                className="w-10 h-10 rounded-lg mr-4 border border-slate-200"
                style={{ backgroundColor: item.hex_code }}
              />
            )}
            <Text className="text-slate-800 font-medium flex-1">{item.name}</Text>
          </Pressable>
        )}
      />
      <View className="p-4 border-t border-slate-200 bg-white">
        <Text className="text-slate-500 text-center text-sm">
          Phase 2: Camera + upload will go here. Phase 3: AI visualization.
        </Text>
      </View>
    </View>
  );
}

/**
 * Tile list - fetches tiles for the selected manufacturer.
 * On tap, navigates to Colors with tileId in params.
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

export default function TileListScreen({ route, navigation }) {
  const { manufacturerId, manufacturerName } = route.params;
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getTilesByManufacturer(manufacturerId)
      .then(setTiles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [manufacturerId]);

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
          <Text className="text-[#0f172a] font-semibold text-sm">Step 3 of 4</Text>
          <Text className="text-[#64748b] text-sm mt-1">{manufacturerName}</Text>
        </View>
      </View>
      <FlatList
        data={tiles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 10 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Colors", {
                manufacturerId,
                manufacturerName,
                tileId: item.id,
                tileName: item.name,
              })
            }
            className="bg-white p-4 rounded-xl mb-3 border border-[#dbe4ef] active:opacity-90"
          >
            <Text className="text-[#1e293b] font-medium text-base">{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

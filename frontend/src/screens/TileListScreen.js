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
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#1e293b" />
        <Text className="text-slate-600 mt-2">Loading tiles...</Text>
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
          Manufacturer: {manufacturerName}
        </Text>
      </View>
      <FlatList
        data={tiles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Colors", {
                tileId: item.id,
                tileName: item.name,
                manufacturerName,
              })
            }
            className="bg-white p-4 rounded-lg mb-2 active:opacity-80"
          >
            <Text className="text-slate-800 font-medium">{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

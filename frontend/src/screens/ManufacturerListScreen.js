/**
 * Manufacturer list - fetches manufacturers (optionally by material type) and displays list.
 * On tap, navigates to Tiles with manufacturerId in params.
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

export default function ManufacturerListScreen({ route, navigation }) {
  const materialType = route.params?.materialType ?? null;
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getManufacturers(materialType)
      .then(setManufacturers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [materialType]);

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
        <Text className="text-[#b91c1c] text-center mb-2 font-medium">{error}</Text>
        <Text className="text-[#64748b] text-center text-sm">
          Ensure the backend is running and CORS is enabled.
        </Text>
      </View>
    );
  }

  if (!manufacturers.length) {
    return (
      <View className="flex-1 justify-center items-center bg-[#e2e8f0] px-6">
        <Text className="text-[#1e293b] text-center font-medium mb-2">
          No manufacturers available for this material yet.
        </Text>
        <Text className="text-[#64748b] text-center text-sm">
          Try another material type or reseed catalog data.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#e2e8f0]">
      <View className="px-4 pt-3 pb-1">
        <View className="bg-white rounded-xl px-4 py-3 border border-[#dbe4ef]">
          <Text className="text-[#0f172a] font-semibold text-sm">Step 2 of 4</Text>
          <Text className="text-[#64748b] text-sm mt-1">Choose a manufacturer</Text>
        </View>
      </View>
      <FlatList
        data={manufacturers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 10 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Tiles", {
                manufacturerId: item.id,
                manufacturerName: item.name,
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

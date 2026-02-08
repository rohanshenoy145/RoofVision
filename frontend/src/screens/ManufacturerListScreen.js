/**
 * Manufacturer list - fetches from API and displays selectable list.
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

export default function ManufacturerListScreen({ navigation }) {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getManufacturers()
      .then(setManufacturers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#1e293b" />
        <Text className="text-slate-600 mt-2">Loading manufacturers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 px-6">
        <Text className="text-red-600 text-center mb-4">{error}</Text>
        <Text className="text-slate-500 text-center text-sm">
          Ensure the backend is running on port 8000 and CORS is enabled.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={manufacturers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Tiles", {
                manufacturerId: item.id,
                manufacturerName: item.name,
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

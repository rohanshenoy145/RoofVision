/**
 * Manufacturer list - fetches manufacturers (optionally by material type) and displays list.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { api } from "../api/client";
import { formatApiError } from "../utils/networkError";
import SelectionCard from "../components/SelectionCard";
import SelectionStepHeader from "../components/SelectionStepHeader";
import { brandSwatchForName, getMaterialVisual } from "../constants/materialVisuals";

export default function ManufacturerListScreen({ route, navigation }) {
  const materialType = route.params?.materialType ?? null;
  const materialLabel = route.params?.materialLabel ?? "Roof";
  const visual = getMaterialVisual(materialType);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getManufacturers(materialType);
      setManufacturers(data);
    } catch (err) {
      setError(formatApiError(err, "catalog"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [materialType]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: visual.cardBg }}>
        <ActivityIndicator size="large" color={visual.accent} />
        <Text className="text-[#64748b] mt-2">Loading manufacturers…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: visual.cardBg }}>
        <Text className="text-[#b91c1c] text-center mb-2 font-medium">{error.title}</Text>
        <Text className="text-[#64748b] text-center text-sm mb-4">{error.hint}</Text>
        <Pressable
          onPress={() => {
            setLoading(true);
            load();
          }}
          className="px-6 py-3 rounded-xl active:opacity-90"
          style={{ backgroundColor: visual.headerBg }}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!manufacturers.length) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: visual.cardBg }}>
        <Text className="text-[#1e293b] text-center font-medium mb-2">
          No manufacturers for {materialLabel.toLowerCase()} yet.
        </Text>
        <Text className="text-[#64748b] text-center text-sm">Try another material type.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#eef2f6" }}>
      <SelectionStepHeader
        step={2}
        materialType={materialType}
        title={`${materialLabel} brands`}
        subtitle="Pick the manufacturer for your project."
      />
      <FlatList
        data={manufacturers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={visual.accent} />}
        renderItem={({ item }) => (
          <SelectionCard
            title={item.name}
            subtitle={`${materialLabel} products`}
            accent={visual.accent}
            accentMuted={visual.accentMuted}
            swatchColor={brandSwatchForName(item.name, materialType)}
            onPress={() =>
              navigation.navigate("Tiles", {
                manufacturerId: item.id,
                manufacturerName: item.name,
                materialType,
                materialLabel,
              })
            }
          />
        )}
      />
    </View>
  );
}

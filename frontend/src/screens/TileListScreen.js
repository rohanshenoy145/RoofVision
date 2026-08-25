/**
 * Tile list - fetches tiles for the selected manufacturer.
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
import { getMaterialVisual, PRODUCT_STYLE_HINTS, productSwatchForName } from "../constants/materialVisuals";

export default function TileListScreen({ route, navigation }) {
  const { manufacturerId, manufacturerName, materialType, materialLabel } = route.params;
  const visual = getMaterialVisual(materialType);
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getTilesByManufacturer(manufacturerId);
      setTiles(data);
    } catch (err) {
      setError(formatApiError(err, "catalog"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [manufacturerId]);

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
        <Text className="text-[#64748b] mt-2">Loading products…</Text>
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

  return (
    <View className="flex-1" style={{ backgroundColor: "#eef2f6" }}>
      <SelectionStepHeader
        step={3}
        materialType={materialType}
        title="Choose product line"
        subtitle={`${manufacturerName} · ${materialLabel || "Roof"}`}
      />
      <FlatList
        data={tiles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={visual.accent} />}
        renderItem={({ item }) => {
          const hint = PRODUCT_STYLE_HINTS[item.slug] || `${materialLabel || "Roof"} profile`;
          return (
            <SelectionCard
              title={item.name}
              subtitle={hint}
              accent={visual.accent}
              accentMuted={visual.accentMuted}
              swatchColor={productSwatchForName(item.name, materialType)}
              onPress={() =>
                navigation.navigate("Colors", {
                  manufacturerId,
                  manufacturerName,
                  tileId: item.id,
                  tileName: item.name,
                  materialType,
                  materialLabel,
                })
              }
            />
          );
        }}
        ListEmptyComponent={
          <View className="mt-10 px-4">
            <Text className="text-center text-[#64748b] text-base">No products for this brand yet.</Text>
            <Text className="text-center text-[#94a3b8] text-sm mt-2">Pull to refresh or pick another manufacturer.</Text>
          </View>
        }
      />
    </View>
  );
}

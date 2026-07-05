/**
 * Color list - fetches colors for the selected tile.
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
import SelectionStepHeader from "../components/SelectionStepHeader";
import { getMaterialVisual } from "../constants/materialVisuals";

function ColorSwatchCard({ item, accent, onPress }) {
  const hex = item.hex_code || "#94a3b8";
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl mb-3 overflow-hidden border bg-white active:opacity-90"
      style={{ borderColor: `${hex}55` }}
    >
      <View className="flex-row items-center min-h-[76px]">
        <View
          className="w-20 self-stretch items-center justify-center"
          style={{ backgroundColor: `${hex}18` }}
        >
          <View
            className="w-12 h-12 rounded-xl border-2 border-white shadow-sm"
            style={{
              backgroundColor: hex,
              shadowColor: hex,
              shadowOpacity: 0.35,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          />
        </View>
        <View className="flex-1 px-3 py-3">
          <Text className="text-[#0f172a] font-semibold text-base">{item.name}</Text>
          {item.hex_code ? (
            <Text className="text-[#64748b] text-xs mt-1 font-mono">{item.hex_code.toUpperCase()}</Text>
          ) : null}
        </View>
        <Text className="text-2xl font-light pr-4" style={{ color: accent }}>
          ›
        </Text>
      </View>
    </Pressable>
  );
}

export default function ColorListScreen({ route, navigation }) {
  const { tileId, tileName, manufacturerName, manufacturerId, materialType, materialLabel } = route.params;
  const visual = getMaterialVisual(materialType);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getColorsByTile(tileId);
      setColors(data);
    } catch (err) {
      setError(formatApiError(err, "catalog"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tileId]);

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
        <Text className="text-[#64748b] mt-2">Loading colors…</Text>
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
        step={4}
        materialType={materialType}
        title="Pick a color"
        subtitle={`${manufacturerName} → ${tileName}`}
      />
      <FlatList
        data={colors}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={visual.accent} />}
        renderItem={({ item }) => (
          <ColorSwatchCard
            item={item}
            accent={visual.accent}
            onPress={() =>
              navigation.navigate("AddPhoto", {
                manufacturerId,
                manufacturerName,
                tileId,
                tileName,
                colorId: item.id,
                colorName: item.name,
                materialType,
                materialLabel,
              })
            }
          />
        )}
        ListFooterComponent={
          <View
            className="mt-2 p-4 rounded-2xl border"
            style={{ backgroundColor: visual.cardBg, borderColor: visual.border }}
          >
            <Text className="text-center text-sm leading-5" style={{ color: visual.headerBg }}>
              Tap a color, then add a home photo to generate your {materialLabel?.toLowerCase() || "roof"}{" "}
              preview.
            </Text>
          </View>
        }
      />
    </View>
  );
}

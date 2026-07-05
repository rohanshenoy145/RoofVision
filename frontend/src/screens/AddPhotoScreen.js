/**
 * Add photo screen - pick/capture image and upload with selection.
 * Shown after user selects a color. Uses expo-image-picker (file picker on web, camera/gallery on device).
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../api/client";
import { evaluateImageQuality } from "../utils/imageQuality";
import { getMaterialVisual } from "../constants/materialVisuals";
import { getRouteParams } from "../utils/routeParams";

export default function AddPhotoScreen({ route, navigation }) {
  const {
    manufacturerId,
    manufacturerName,
    tileId,
    tileName,
    colorId,
    colorName,
    materialType,
    materialLabel,
  } = getRouteParams(route);

  const [imageUri, setImageUri] = useState(null);
  const [pickedAsset, setPickedAsset] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  if (!manufacturerId || !tileId || !colorId) {
    return (
      <View className="flex-1 bg-[#eef2f6] justify-center items-center p-6">
        <Text className="text-[#b91c1c] font-medium text-center mb-2">Missing selection</Text>
        <Text className="text-[#64748b] text-sm text-center mb-4">
          Go back and pick manufacturer, product, and color first.
        </Text>
        <Pressable onPress={() => navigation.navigate("Home")} className="bg-[#334155] px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Back to home</Text>
        </Pressable>
      </View>
    );
  }

  const visual = getMaterialVisual(materialType);

  const pickImage = async () => {
    setError(null);
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access photos is required.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setPickedAsset(asset);
      setUploadResult(null);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === "web") {
      setError("Camera is not supported on web. Use 'Choose from library'.");
      return;
    }
    setError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync?.();
    if (status !== "granted") {
      setError("Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setPickedAsset(asset);
      setUploadResult(null);
    }
  };

  const inputQuality = pickedAsset ? evaluateImageQuality(pickedAsset) : null;

  const upload = async () => {
    if (!imageUri) return;
    setUploading(true);
    setError(null);
    try {
      const result = await api.uploadVisualization(
        imageUri,
        manufacturerId,
        tileId,
        colorId
      );
      setUploadResult(result);
      navigation.navigate("Result", {
        visualizationId: result.id,
        manufacturerId,
        manufacturerName,
        tileId,
        tileName,
        colorId,
        colorName,
        materialType,
        materialLabel,
        inputQuality: pickedAsset ? evaluateImageQuality(pickedAsset) : null,
      });
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: "#eef2f6" }}>
      <View
        className="rounded-2xl p-4 mb-4 border overflow-hidden"
        style={{ backgroundColor: visual.cardBg, borderColor: visual.border }}
      >
        <View className="h-1 rounded-full mb-3" style={{ backgroundColor: visual.accent, width: 48 }} />
        <Text className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: visual.accent }}>
          Ready to visualize
        </Text>
        <Text className="text-[#0f172a] font-semibold text-base">
          {manufacturerName} → {tileName}
        </Text>
        <Text className="text-[#64748b] text-sm mt-1">Color: {colorName}</Text>
      </View>

      {!imageUri ? (
        <View className="gap-3">
          <View
            className="rounded-2xl p-5 mb-1 border border-dashed items-center"
            style={{ borderColor: visual.border, backgroundColor: `${visual.accentMuted}88` }}
          >
            <Text className="text-4xl mb-2">📷</Text>
            <Text className="text-[#475569] text-sm text-center leading-5">
              Use a clear elevation photo with the roof visible in daylight for the best preview.
            </Text>
          </View>
          <Pressable
            onPress={pickImage}
            className="py-4 rounded-xl active:opacity-90"
            style={{ backgroundColor: visual.headerBg }}
          >
            <Text className="text-white font-semibold text-center">Choose from library</Text>
          </Pressable>
          {Platform.OS !== "web" && (
            <Pressable
              onPress={takePhoto}
              className="py-4 rounded-xl border active:opacity-90 bg-white"
              style={{ borderColor: visual.border }}
            >
              <Text className="font-semibold text-center" style={{ color: visual.headerBg }}>
                Take photo
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <>
          <View className="rounded-xl overflow-hidden bg-[#e5e7eb] mb-3 border border-[#dbe4ef]" style={{ maxHeight: 200 }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 200 }}
              resizeMode="contain"
            />
          </View>
          {inputQuality && inputQuality.level === "low" && (
            <View className="mb-3 p-3 rounded-xl border bg-red-50 border-red-200">
              <Text className="text-sm font-semibold text-red-900">Photo check: Low</Text>
              <Text className="text-[#334155] text-xs mt-1 leading-4">{inputQuality.summary}</Text>
              {inputQuality.tips?.length > 0 && (
                <Text className="text-[#475569] text-xs mt-2 leading-4">• {inputQuality.tips.join(" • ")}</Text>
              )}
            </View>
          )}
          {inputQuality && inputQuality.level === "medium" && (
            <View className="mb-3 p-3 rounded-xl border bg-amber-50 border-amber-200">
              <Text className="text-sm font-semibold text-amber-900">Photo check: Fair</Text>
              <Text className="text-[#334155] text-xs mt-1 leading-4">{inputQuality.summary}</Text>
              {inputQuality.tips?.length > 0 && (
                <Text className="text-[#475569] text-xs mt-2 leading-4">• {inputQuality.tips.join(" • ")}</Text>
              )}
            </View>
          )}
          {inputQuality && inputQuality.level === "good" && (
            <View className="mb-3 p-3 rounded-xl border bg-emerald-50 border-emerald-200">
              <Text className="text-sm font-semibold text-emerald-900">Photo check: Good</Text>
              <Text className="text-[#334155] text-xs mt-1 leading-4">{inputQuality.summary}</Text>
            </View>
          )}
          <Text className="text-[#64748b] text-sm mb-3 text-center">
            Tap &quot;Generate&quot; to create your roof visualization.
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                setImageUri(null);
                setPickedAsset(null);
                setUploadResult(null);
              }}
              disabled={uploading}
              className="flex-1 bg-white py-3 rounded-xl border border-[#dbe4ef] active:opacity-90"
            >
              <Text className="text-[#475569] font-semibold text-center">Change photo</Text>
            </Pressable>
            <Pressable
              onPress={upload}
              disabled={uploading}
              className="flex-1 py-3 rounded-xl active:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: visual.accent }}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-center">Generate</Text>
              )}
            </Pressable>
          </View>
        </>
      )}

      {error && (
        <View className="mt-4 p-3 bg-[#fef2f2] rounded-xl border border-[#fecaca]">
          <Text className="text-[#b91c1c]">{error}</Text>
        </View>
      )}

      {uploadResult && (
        <View className="mt-4 p-3 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0]">
          <Text className="text-[#166534] text-sm">Saved. Taking you to your visualization…</Text>
        </View>
      )}
    </View>
  );
}

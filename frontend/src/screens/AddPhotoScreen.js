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
import { api, getUploadBaseUrl } from "../api/client";

export default function AddPhotoScreen({ route, navigation }) {
  const {
    manufacturerId,
    manufacturerName,
    tileId,
    tileName,
    colorId,
    colorName,
  } = route.params;

  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
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
      setImageUri(result.assets[0].uri);
      setUploadResult(null);
    }
  };

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
      });
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#e2e8f0] p-4">
      <View className="bg-white rounded-xl p-3 mb-4 border border-[#dbe4ef]">
        <Text className="text-[#64748b] text-sm">
          {manufacturerName} → {tileName} → {colorName}
        </Text>
      </View>

      {!imageUri ? (
        <View className="gap-3">
          <Pressable
            onPress={pickImage}
            className="bg-[#1e293b] py-4 rounded-xl active:opacity-90"
          >
            <Text className="text-white font-semibold text-center">Choose from library</Text>
          </Pressable>
          {Platform.OS !== "web" && (
            <Pressable
              onPress={takePhoto}
              className="bg-white py-4 rounded-xl border border-[#dbe4ef] active:opacity-90"
            >
              <Text className="text-[#334155] font-semibold text-center">Take photo</Text>
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
          <Text className="text-[#64748b] text-sm mb-3 text-center">
            Tap &quot;Generate&quot; to create your roof visualization.
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => { setImageUri(null); setUploadResult(null); }}
              disabled={uploading}
              className="flex-1 bg-white py-3 rounded-xl border border-[#dbe4ef] active:opacity-90"
            >
              <Text className="text-[#475569] font-semibold text-center">Change photo</Text>
            </Pressable>
            <Pressable
              onPress={upload}
              disabled={uploading}
              className="flex-1 bg-[#0d9488] py-3 rounded-xl active:opacity-90 disabled:opacity-50"
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

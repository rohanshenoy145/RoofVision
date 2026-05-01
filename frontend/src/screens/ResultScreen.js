/**
 * Phase 3: Result screen — poll visualization job until completed or failed, then show image or error.
 */
import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, Pressable, Platform, Linking } from "react-native";
import { api, getUploadBaseUrl } from "../api/client";

const POLL_INTERVAL_MS = 2500;

export default function ResultScreen({ route, navigation }) {
  const { visualizationId, manufacturerId, manufacturerName, tileId, tileName, colorId, colorName } = route.params;
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await api.getVisualization(visualizationId);
        if (cancelled) return;
        setJob(data);
        if (data.status === "completed" || data.status === "failed") return;
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load status.");
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };
    poll();
    return () => { cancelled = true; };
  }, [visualizationId]);

  if (error) {
    return (
      <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
        <Text className="text-[#b91c1c] text-center font-medium">{error}</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 bg-[#f5f5f4] justify-center items-center">
        <ActivityIndicator size="large" color="#334155" />
        <Text className="text-[#64748b] mt-2">Loading…</Text>
      </View>
    );
  }

  if (job.status === "pending" || job.status === "processing") {
    return (
      <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
        <ActivityIndicator size="large" color="#334155" />
        <Text className="text-[#1e293b] font-medium mt-4 text-center">
          Generating your roof visualization…
        </Text>
        <Text className="text-[#64748b] text-sm mt-2 text-center">
          {manufacturerName} → {tileName} → {colorName}
        </Text>
      </View>
    );
  }

  if (job.status === "failed") {
    return (
      <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
        <Text className="text-[#b91c1c] font-medium text-center">Generation failed</Text>
        <Text className="text-[#64748b] text-sm mt-2 text-center">
          {job.error_message || "Something went wrong."}
        </Text>
      </View>
    );
  }

  if (job.status === "completed" && job.result_url) {
    const resultFullUrl = getUploadBaseUrl() + job.result_url;
    const isMock = job.generator === "mock";
    const canRetry = manufacturerId && tileId && colorId;

    const saveImage = async () => {
      try {
        if (Platform.OS === "web") {
          const a = document.createElement("a");
          a.href = resultFullUrl;
          a.download = `roofvision-result-${visualizationId}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          await Linking.openURL(resultFullUrl);
        }
        setActionMessage("Image opened/downloaded.");
      } catch {
        setActionMessage("Could not save image right now.");
      }
    };

    return (
      <View className="flex-1 bg-[#e2e8f0] p-4">
        <View className="bg-white rounded-xl p-3 mb-4 border border-[#dbe4ef]">
          <Text className="text-[#64748b] text-sm">
            {manufacturerName} → {tileName} → {colorName}
          </Text>
        </View>
        <Text className="text-[#1e293b] font-medium mb-2">Your roof visualization</Text>
        {isMock && (
          <View className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-3 mb-2">
            <Text className="text-[#92400e] text-sm">
              {job.error_message ||
                "Preview only - no image API configured. Set IMAGE_GEN_PROVIDER=gemini and IMAGE_GEN_API_KEY in backend .env, or see docs/IMAGE-GEN-API.md."}
            </Text>
          </View>
        )}
        <View className="rounded-xl overflow-hidden bg-[#e5e7eb] flex-1 min-h-[200px] border border-[#dbe4ef]">
          <Image
            source={{ uri: resultFullUrl }}
            className="w-full flex-1"
            style={{ minHeight: 200 }}
            resizeMode="contain"
          />
        </View>
        <View className="flex-row gap-3 mt-3">
          <Pressable
            onPress={saveImage}
            className="flex-1 bg-[#0f766e] py-3 rounded-xl active:opacity-90"
          >
            <Text className="text-white font-semibold text-center">Save image</Text>
          </Pressable>
          <Pressable
            disabled={!canRetry}
            onPress={() =>
              navigation.navigate("AddPhoto", {
                manufacturerId,
                manufacturerName,
                tileId,
                tileName,
                colorId,
                colorName,
              })
            }
            className="flex-1 bg-white py-3 rounded-xl border border-[#dbe4ef] active:opacity-90 disabled:opacity-40"
          >
            <Text className="text-[#334155] font-semibold text-center">Try another photo</Text>
          </Pressable>
        </View>
        {actionMessage && (
          <Text className="text-[#475569] text-xs text-center mt-2">{actionMessage}</Text>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
      <Text className="text-[#64748b]">Unknown status: {job.status}</Text>
    </View>
  );
}

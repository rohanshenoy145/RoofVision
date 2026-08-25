/**
 * Result screen — poll visualization job until completed or failed, then show compare UI.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Image, ActivityIndicator, Pressable, Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { api, resolveMediaUrl } from "../api/client";
import ComparePreviewModal from "../components/ComparePreviewModal";
import { COPY } from "../constants/copy";
import { getRouteParams } from "../utils/routeParams";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 180000; // 3 minutes

function RecoveryActions({ canRetryPhoto, onRetryStatus, onTryAnotherPhoto, onHome, retryLabel = "Try again" }) {
  return (
    <View className="w-full max-w-md mt-6 gap-3">
      {onRetryStatus ? (
        <Pressable onPress={onRetryStatus} className="bg-[#1e293b] py-3 rounded-xl active:opacity-90">
          <Text className="text-white font-semibold text-center">{retryLabel}</Text>
        </Pressable>
      ) : null}
      {canRetryPhoto ? (
        <Pressable
          onPress={onTryAnotherPhoto}
          className="bg-white py-3 rounded-xl border border-[#dbe4ef] active:opacity-90"
        >
          <Text className="text-[#334155] font-semibold text-center">Try another photo</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={onHome} className="py-3 active:opacity-80">
        <Text className="text-[#64748b] font-medium text-center">Back to home</Text>
      </Pressable>
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const {
    visualizationId,
    manufacturerId,
    manufacturerName,
    tileId,
    tileName,
    colorId,
    colorName,
    materialType,
    materialLabel,
    inputQuality,
  } = getRouteParams(route);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [pollKey, setPollKey] = useState(0);
  const startedAtRef = useRef(Date.now());

  const canRetryPhoto = Boolean(manufacturerId && tileId && colorId);

  const goHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  }, [navigation]);

  const goTryAnotherPhoto = useCallback(() => {
    navigation.navigate("AddPhoto", {
      manufacturerId,
      manufacturerName,
      tileId,
      tileName,
      colorId,
      colorName,
      materialType,
      materialLabel,
    });
  }, [
    navigation,
    manufacturerId,
    manufacturerName,
    tileId,
    tileName,
    colorId,
    colorName,
    materialType,
    materialLabel,
  ]);

  const restartPolling = useCallback(() => {
    setError(null);
    setTimedOut(false);
    setJob(null);
    startedAtRef.current = Date.now();
    setPollKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!visualizationId) {
      setError("Missing visualization id.");
      return undefined;
    }
    let cancelled = false;
    let timeoutId = null;

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - startedAtRef.current >= POLL_TIMEOUT_MS) {
        setTimedOut(true);
        return;
      }
      try {
        const data = await api.getVisualization(visualizationId);
        if (cancelled) return;
        setJob(data);
        setError(null);
        if (data.status === "completed" || data.status === "failed") return;
      } catch (e) {
        if (cancelled) return;
        // Keep polling through brief network blips until overall timeout
        if (Date.now() - startedAtRef.current >= POLL_TIMEOUT_MS) {
          setError(e.message || "Failed to load status.");
          return;
        }
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        return;
      }
      timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visualizationId, pollKey]);

  const recoveryProps = {
    canRetryPhoto,
    onTryAnotherPhoto: goTryAnotherPhoto,
    onHome: goHome,
  };

  if (!visualizationId) {
    return (
      <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
        <Text className="text-[#b91c1c] text-center font-medium mb-2">Missing visualization</Text>
        <Text className="text-[#64748b] text-sm text-center mb-2">
          Start again from home to create a new preview.
        </Text>
        <RecoveryActions {...recoveryProps} canRetryPhoto={false} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
        <Text className="text-[#b91c1c] text-center font-medium mb-2">Couldn’t load status</Text>
        <Text className="text-[#64748b] text-sm text-center">{error}</Text>
        <RecoveryActions {...recoveryProps} onRetryStatus={restartPolling} retryLabel="Retry status check" />
      </View>
    );
  }

  if (timedOut) {
    return (
      <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
        <Text className="text-[#b45309] text-center font-medium mb-2">Taking longer than expected</Text>
        <Text className="text-[#64748b] text-sm text-center leading-5">
          Generation didn’t finish in time. You can check again, try another photo, or start over.
        </Text>
        <RecoveryActions {...recoveryProps} onRetryStatus={restartPolling} retryLabel="Check again" />
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
        <Text className="text-[#94a3b8] text-xs mt-3 text-center">This can take up to a couple of minutes.</Text>
        {inputQuality && inputQuality.level === "low" && (
          <View className="mt-6 p-3 rounded-xl border bg-red-50 border-red-200 max-w-md">
            <Text className="text-red-900 font-semibold">Photo quality: low</Text>
            <Text className="text-red-950 text-sm mt-1 leading-5">{inputQuality.summary}</Text>
          </View>
        )}
        {inputQuality && inputQuality.level === "medium" && (
          <View className="mt-6 p-3 rounded-xl border bg-amber-50 border-amber-200 max-w-md">
            <Text className="text-amber-900 font-semibold">Photo quality: fair</Text>
            <Text className="text-amber-950 text-sm mt-1 leading-5">{inputQuality.summary}</Text>
          </View>
        )}
        <Pressable onPress={goHome} className="mt-8 py-2 active:opacity-80">
          <Text className="text-[#64748b] text-sm text-center">Cancel and go home</Text>
        </Pressable>
      </View>
    );
  }

  if (job.status === "failed") {
    return (
      <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
        <Text className="text-[#b91c1c] font-medium text-center">Generation failed</Text>
        <Text className="text-[#64748b] text-sm mt-2 text-center leading-5">
          {job.error_message || "Something went wrong creating this preview."}
        </Text>
        <RecoveryActions {...recoveryProps} />
      </View>
    );
  }

  if (job.status === "completed" && job.result_url) {
    const resultFullUrl = resolveMediaUrl(job.result_url);
    const originalFullUrl = resolveMediaUrl(job.image_url);
    const isMock = job.generator === "mock";

    const saveImage = async () => {
      try {
        if (Platform.OS === "web") {
          const a = document.createElement("a");
          a.href = resultFullUrl;
          a.download = `roofvision-result-${visualizationId}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setActionMessage("Download started.");
          return;
        }

        setActionMessage("Saving…");
        const perm = await MediaLibrary.requestPermissionsAsync(true);
        if (perm.status !== "granted") {
          setActionMessage("Allow Photos access to save this preview in the app.");
          return;
        }

        const ext = resultFullUrl.toLowerCase().includes(".png") ? "png" : "jpg";
        const dest = new File(Paths.cache, `roofvision-result-${visualizationId}.${ext}`);
        const downloaded = await File.downloadFileAsync(resultFullUrl, dest, { idempotent: true });
        await MediaLibrary.saveToLibraryAsync(downloaded.uri);
        setActionMessage("Saved to your photo library.");
      } catch (e) {
        setActionMessage(e?.message ? `Could not save: ${e.message}` : "Could not save image right now.");
      }
    };

    const savedOk = actionMessage === "Saved to your photo library.";

    return (
      <View className="flex-1 bg-[#e2e8f0] p-4">
        <View className="bg-white rounded-xl p-3 mb-2 border border-[#dbe4ef]">
          <Text className="text-[#64748b] text-sm">
            {manufacturerName} → {tileName} → {colorName}
          </Text>
        </View>

        <View className="bg-slate-100 rounded-xl p-3 mb-2 border border-slate-200">
          <Text className="text-[#475569] text-xs leading-4">{COPY.aiPreviewShort}</Text>
        </View>

        {inputQuality && inputQuality.level === "low" && (
          <View className="rounded-xl p-3 mb-2 border bg-red-50 border-red-200">
            <Text className="text-red-900 font-semibold">Input quality: Low</Text>
            <Text className="text-red-950 text-sm mt-1 leading-5">{inputQuality.summary}</Text>
            {inputQuality.tips?.length > 0 && (
              <Text className="text-[#334155] text-xs mt-2 leading-4">• {inputQuality.tips.join(" • ")}</Text>
            )}
          </View>
        )}
        {inputQuality && inputQuality.level === "medium" && (
          <View className="rounded-xl p-3 mb-2 border bg-amber-50 border-amber-200">
            <Text className="text-amber-900 font-semibold">Input quality: Fair</Text>
            <Text className="text-amber-950 text-sm mt-1 leading-5">{inputQuality.summary}</Text>
            {inputQuality.tips?.length > 0 && (
              <Text className="text-[#334155] text-xs mt-2 leading-4">• {inputQuality.tips.join(" • ")}</Text>
            )}
          </View>
        )}
        {inputQuality && inputQuality.level === "good" && (
          <View className="rounded-xl p-3 mb-2 border bg-emerald-50 border-emerald-200">
            <Text className="text-emerald-900 font-semibold">Input quality: Good</Text>
            <Text className="text-emerald-950 text-sm mt-1 leading-5">{inputQuality.summary}</Text>
          </View>
        )}

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[#1e293b] font-medium">Original vs preview</Text>
          {originalFullUrl && (
            <Pressable
              onPress={() => setCompareOpen(true)}
              className="flex-row items-center gap-1 bg-[#1e293b] px-3 py-2 rounded-lg active:opacity-90"
            >
              <Text className="text-white text-sm">⊞</Text>
              <Text className="text-white text-sm font-semibold">Expand compare</Text>
            </Pressable>
          )}
        </View>

        {isMock && (
          <View className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-3 mb-2">
            <Text className="text-[#92400e] text-sm">
              {job.error_message ||
                "Approximate preview — this result may match your original photo more closely than a full AI render."}
            </Text>
          </View>
        )}

        {originalFullUrl ? (
          <View className="flex-1 min-h-[220px]">
            <View className="flex-row flex-1 gap-2">
              <View className="flex-1 rounded-xl overflow-hidden bg-[#e5e7eb] border border-[#dbe4ef]">
                <Text className="text-center text-[#64748b] text-xs py-1 bg-[#f1f5f9]">Original</Text>
                <Image
                  source={{ uri: originalFullUrl }}
                  className="w-full flex-1"
                  style={{ minHeight: 160 }}
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1 rounded-xl overflow-hidden bg-[#e5e7eb] border border-[#dbe4ef]">
                <Text className="text-center text-[#64748b] text-xs py-1 bg-[#f1f5f9]">AI preview</Text>
                <Image
                  source={{ uri: resultFullUrl }}
                  className="w-full flex-1"
                  style={{ minHeight: 160 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        ) : (
          <View className="rounded-xl overflow-hidden bg-[#e5e7eb] flex-1 min-h-[200px] border border-[#dbe4ef] mb-2">
            <Text className="text-center text-[#64748b] text-xs py-1">AI preview</Text>
            <Image
              source={{ uri: resultFullUrl }}
              className="w-full flex-1"
              style={{ minHeight: 200 }}
              resizeMode="contain"
            />
          </View>
        )}

        {savedOk ? (
          <View className="mt-3 gap-3">
            <Text className="text-[#047857] text-sm text-center font-medium">
              Saved to your photo library
            </Text>
            <Pressable onPress={goHome} className="bg-[#0f766e] py-3 rounded-xl active:opacity-90">
              <Text className="text-white font-semibold text-center">Done</Text>
            </Pressable>
            {canRetryPhoto ? (
              <Pressable
                onPress={goTryAnotherPhoto}
                className="bg-white py-3 rounded-xl border border-[#dbe4ef] active:opacity-90"
              >
                <Text className="text-[#334155] font-semibold text-center">Try another photo</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View className="flex-row gap-3 mt-3">
            <Pressable onPress={saveImage} className="flex-1 bg-[#0f766e] py-3 rounded-xl active:opacity-90">
              <Text className="text-white font-semibold text-center">Save image</Text>
            </Pressable>
            <Pressable
              disabled={!canRetryPhoto}
              onPress={goTryAnotherPhoto}
              className="flex-1 bg-white py-3 rounded-xl border border-[#dbe4ef] active:opacity-90 disabled:opacity-40"
            >
              <Text className="text-[#334155] font-semibold text-center">Try another photo</Text>
            </Pressable>
          </View>
        )}
        {actionMessage && !savedOk ? (
          <Text className="text-[#475569] text-xs text-center mt-2">{actionMessage}</Text>
        ) : null}

        {originalFullUrl && (
          <ComparePreviewModal
            visible={compareOpen}
            onClose={() => setCompareOpen(false)}
            originalUri={originalFullUrl}
            resultUri={resultFullUrl}
          />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f5f5f4] justify-center items-center p-6">
      <Text className="text-[#64748b] mb-4">Unknown status: {job.status}</Text>
      <RecoveryActions {...recoveryProps} />
    </View>
  );
}

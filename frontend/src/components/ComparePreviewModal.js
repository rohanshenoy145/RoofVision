/**
 * Fullscreen side-by-side compare with synced zoom (button cycle — works on web + native).
 */
import React, { useEffect, useState } from "react";
import { Modal, View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ZOOM_STEPS = [1, 1.25, 1.5, 2];

export default function ComparePreviewModal({ visible, onClose, originalUri, resultUri }) {
  const [zi, setZi] = useState(0);
  const zoom = ZOOM_STEPS[zi] ?? 1;

  useEffect(() => {
    if (visible) setZi(0);
  }, [visible]);

  const cycleZoom = () => setZi((i) => (i + 1) % ZOOM_STEPS.length);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-[#0f172a]">
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-[#334155]">
          <Text className="text-white font-semibold">Compare</Text>
          <Pressable onPress={onClose} className="py-2 px-3">
            <Text className="text-[#94a3b8] font-medium">Close</Text>
          </Pressable>
        </View>
        <Text className="text-[#94a3b8] text-xs px-4 py-2">
          Original · AI preview — pinch-style zoom: use the zoom button to magnify both panels together.
        </Text>
        <View className="flex-1 flex-row px-1 pb-2 gap-1">
          <View className="flex-1 bg-[#1e293b] rounded-lg overflow-hidden">
            <Text className="text-[#cbd5e1] text-xs text-center py-1">Original</Text>
            <View className="flex-1 overflow-hidden">
              <Image
                source={{ uri: originalUri }}
                resizeMode="contain"
                style={{ flex: 1, width: "100%", transform: [{ scale: zoom }] }}
              />
            </View>
          </View>
          <View className="flex-1 bg-[#1e293b] rounded-lg overflow-hidden">
            <Text className="text-[#cbd5e1] text-xs text-center py-1">Preview</Text>
            <View className="flex-1 overflow-hidden">
              <Image
                source={{ uri: resultUri }}
                resizeMode="contain"
                style={{ flex: 1, width: "100%", transform: [{ scale: zoom }] }}
              />
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-center gap-3 pb-6 pt-2 border-t border-[#334155]">
          <Pressable
            onPress={cycleZoom}
            className="bg-[#334155] px-5 py-3 rounded-xl flex-row items-center gap-2 active:opacity-80"
          >
            <Text className="text-white text-lg leading-none">⊞</Text>
            <Text className="text-white font-semibold">Zoom {zoom}x</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

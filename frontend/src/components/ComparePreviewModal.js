/**
 * Fullscreen stacked compare (original on top, AI preview below) with synced zoom.
 */
import React, { useEffect, useState } from "react";
import { Modal, View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ZOOM_STEPS = [1, 1.25, 1.5, 2];

function ComparePanel({ label, uri, zoom }) {
  return (
    <View style={styles.panel}>
      <View style={styles.labelBadge}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Image
        source={{ uri }}
        resizeMode="contain"
        style={[styles.image, { transform: [{ scale: zoom }] }]}
      />
    </View>
  );
}

export default function ComparePreviewModal({ visible, onClose, originalUri, resultUri }) {
  const insets = useSafeAreaInsets();
  const [zi, setZi] = useState(0);
  const zoom = ZOOM_STEPS[zi] ?? 1;

  useEffect(() => {
    if (visible) setZi(0);
  }, [visible]);

  const cycleZoom = () => setZi((i) => (i + 1) % ZOOM_STEPS.length);

  // Modals often mis-measure SafeAreaView on the first open; pad with insets instead.
  const padTop = Math.max(insets.top, 12);
  const padBottom = Math.max(insets.bottom, 12);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <View style={[styles.root, { paddingTop: padTop, paddingBottom: padBottom }]}>
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Compare preview</Text>
            <Text style={styles.subtitle}>Original above · AI preview below</Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close compare"
          >
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.panels}>
          <ComparePanel label="ORIGINAL" uri={originalUri} zoom={zoom} />
          <View style={styles.divider} />
          <ComparePanel label="AI PREVIEW" uri={resultUri} zoom={zoom} />
        </View>

        <View style={styles.footer}>
          <Pressable onPress={cycleZoom} hitSlop={8} style={styles.footerBtnSecondary}>
            <Text style={styles.footerBtnText}>Zoom {zoom}×</Text>
          </Pressable>
          <Pressable onPress={onClose} hitSlop={8} style={styles.footerBtnPrimary}>
            <Text style={styles.footerBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#334155",
    minHeight: 56,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    minWidth: 88,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#334155",
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  panels: {
    flex: 1,
  },
  panel: {
    flex: 1,
    backgroundColor: "#1e293b",
    overflow: "hidden",
  },
  labelBadge: {
    position: "absolute",
    top: 8,
    left: 12,
    zIndex: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  labelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#475569",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#334155",
  },
  footerBtnSecondary: {
    flex: 1,
    backgroundColor: "#334155",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  footerBtnPrimary: {
    flex: 1,
    backgroundColor: "#0f766e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  footerBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

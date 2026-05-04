import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  useWindowDimensions,
} from "react-native";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";

export interface LightboxPhoto {
  key: string;
  uri: string;
  caption?: string;
  civName: string;
  civColor: string;
  year: number;
  yearLabel: string;
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}

export function PhotoLightbox({ photos, currentIndex, onClose, onNavigate }: PhotoLightboxProps) {
  const { width, height } = useWindowDimensions();
  const visible = currentIndex !== null && photos[currentIndex] != null;
  const current = visible ? photos[currentIndex as number] : null;

  const go = useCallback(
    (delta: number) => {
      if (currentIndex === null || photos.length === 0) return;
      const next = (currentIndex + delta + photos.length) % photos.length;
      onNavigate(next - currentIndex);
    },
    [currentIndex, photos.length, onNavigate]
  );

  useEffect(() => {
    if (!visible || Platform.OS !== "web" || typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, go, onClose]);

  if (!visible || !current) return null;

  const maxW = Math.min(width * 0.88, 1400);
  const maxH = height * 0.78;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="lightbox-close">
          <X size={22} color="#fff" />
        </TouchableOpacity>

        {photos.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navBtn, styles.prevBtn]}
              onPress={() => go(-1)}
              testID="lightbox-prev"
            >
              <ChevronLeft size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.nextBtn]}
              onPress={() => go(1)}
              testID="lightbox-next"
            >
              <ChevronRight size={28} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        <View style={styles.content} pointerEvents="box-none">
          <View style={styles.imageWrap} pointerEvents="box-none">
            <Image
              source={{ uri: current.uri }}
              style={{ width: maxW, height: maxH }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.captionBox} pointerEvents="box-none">
            <View style={styles.metaRow}>
              <View style={[styles.colorDot, { backgroundColor: current.civColor }]} />
              <Text style={styles.metaText} numberOfLines={1}>
                {current.civName} · {current.yearLabel}
              </Text>
              <Text style={styles.counter}>
                {(currentIndex as number) + 1} / {photos.length}
              </Text>
            </View>
            {!!current.caption?.trim() && (
              <Text style={styles.captionText}>{current.caption}</Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  captionBox: {
    marginTop: 14,
    backgroundColor: "rgba(17,24,39,0.9)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 900,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  metaText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "800",
    flex: 1,
  },
  counter: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  captionText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(31,41,55,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    width: 54,
    height: 54,
    marginTop: -27,
    borderRadius: 27,
    backgroundColor: "rgba(31,41,55,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  prevBtn: { left: 20 },
  nextBtn: { right: 20 },
});

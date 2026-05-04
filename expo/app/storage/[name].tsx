import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { CivilizationDepo } from "../../components/CivilizationDepo";
import { useTimeline } from "../../context/TimelineContext";

export default function StorageRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string }>();
  const { civilizations } = useTimeline();

  const decodedName = useMemo(() => {
    const raw = Array.isArray(params.name) ? params.name[0] : params.name;
    try {
      return decodeURIComponent(raw || "");
    } catch {
      return raw || "";
    }
  }, [params.name]);

  const civ = useMemo(
    () =>
      civilizations.find(
        (c) => c.name.trim().toLowerCase() === decodedName.trim().toLowerCase()
      ) || null,
    [civilizations, decodedName]
  );

  const handleClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen options={{ title: `Depo · ${decodedName}` }} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.backBtn} testID="storage-back">
          <ChevronLeft size={20} color="#fff" />
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Depo · {decodedName}
        </Text>
      </View>

      {civilizations.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#c9a227" />
          <Text style={styles.muted}>Yukleniyor...</Text>
        </View>
      ) : !civ ? (
        <View style={styles.center}>
          <Text style={styles.notFoundTitle}>Medeniyet bulunamadi</Text>
          <Text style={styles.muted}>
            "{decodedName}" adli medeniyet listede yok. URL'i kontrol edin.
          </Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace("/")}>
            <Text style={styles.homeBtnText}>Ana sayfaya don</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CivilizationDepo visible={true} civilization={civ} onClose={handleClose} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b0e14",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#1f2937",
  },
  backText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  notFoundTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  muted: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
  },
  homeBtn: {
    marginTop: 12,
    backgroundColor: "#c9a227",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  homeBtnText: {
    color: "#0b0e14",
    fontWeight: "800",
  },
});

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  X,
  Upload,
  Download,
  Trash2,
  FolderOpen,
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  ClockArrowUp,
  HardDrive,
  Plus,
  Tag,
} from "lucide-react-native";
import { Civilization } from "@/types";
import { ArticleMeta, articleStorage, formatBytes } from "@/lib/articleStorage";

type SortMode = "date_desc" | "date_asc" | "name_asc" | "name_desc" | "size_desc" | "size_asc";

interface Props {
  visible: boolean;
  civilization: Civilization | null;
  onClose: () => void;
}

const SORT_OPTIONS: { id: SortMode; label: string; icon: any }[] = [
  { id: "date_desc", label: "Yeni → Eski", icon: ClockArrowUp },
  { id: "date_asc", label: "Eski → Yeni", icon: Clock },
  { id: "name_asc", label: "A → Z", icon: ArrowDownAZ },
  { id: "name_desc", label: "Z → A", icon: ArrowUpAZ },
  { id: "size_desc", label: "Boyut ↓", icon: HardDrive },
  { id: "size_asc", label: "Boyut ↑", icon: HardDrive },
];

export function CivilizationDepo({ visible, civilization, onClose }: Props) {
  const [items, setItems] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("__all__");
  const [sortMode, setSortMode] = useState<SortMode>("date_desc");
  const [newCategoryDraft, setNewCategoryDraft] = useState<string>("");
  const [pendingCategory, setPendingCategory] = useState<string>("Genel");
  const [search, setSearch] = useState<string>("");
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reload = useCallback(async () => {
    if (!civilization) return;
    setLoading(true);
    try {
      const list = await articleStorage.listByCivilization(civilization.id);
      setItems(list);
    } catch (err) {
      console.error("[Depo] load error", err);
    } finally {
      setLoading(false);
    }
  }, [civilization]);

  useEffect(() => {
    if (visible && civilization) {
      reload();
      setActiveCategory("__all__");
      setSearch("");
    }
  }, [visible, civilization, reload]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => set.add(it.category || "Genel"));
    extraCategories.forEach((c) => set.add(c));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [items, extraCategories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items.filter((it) => {
      if (activeCategory !== "__all__" && (it.category || "Genel") !== activeCategory) return false;
      if (q && !it.name.toLowerCase().includes(q)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sortMode) {
        case "date_asc":
          return a.uploadedAt - b.uploadedAt;
        case "date_desc":
          return b.uploadedAt - a.uploadedAt;
        case "name_asc":
          return a.name.localeCompare(b.name, "tr");
        case "name_desc":
          return b.name.localeCompare(a.name, "tr");
        case "size_asc":
          return a.size - b.size;
        case "size_desc":
          return b.size - a.size;
        default:
          return 0;
      }
    });
    return list;
  }, [items, activeCategory, search, sortMode]);

  const totalSize = useMemo(() => items.reduce((acc, it) => acc + (it.size || 0), 0), [items]);

  const handlePickFiles = useCallback(() => {
    if (Platform.OS !== "web") return;
    if (!fileInputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.style.display = "none";
      input.addEventListener("change", async (ev: any) => {
        const files: FileList | null = ev.target?.files;
        if (!files || files.length === 0) return;
        if (!civilization) return;
        setBusy(true);
        try {
          for (let i = 0; i < files.length; i += 1) {
            const f = files[i];
            await articleStorage.add({
              civilizationId: civilization.id,
              name: f.name,
              category: pendingCategory || "Genel",
              file: f,
              type: f.type,
            });
          }
          await reload();
        } catch (err) {
          console.error("[Depo] upload error", err);
          if (typeof window !== "undefined") {
            window.alert(
              "Yukleme basarisiz: " +
                ((err as any)?.message || "Tarayici depolama sinirina ulasilmis olabilir.")
            );
          }
        } finally {
          setBusy(false);
          input.value = "";
        }
      });
      document.body.appendChild(input);
      fileInputRef.current = input;
    }
    fileInputRef.current.click();
  }, [civilization, pendingCategory, reload]);

  const handleDelete = useCallback(
    async (item: ArticleMeta) => {
      if (typeof window !== "undefined") {
        if (!window.confirm(`"${item.name}" silinsin mi?`)) return;
      }
      await articleStorage.remove(item.id);
      reload();
    },
    [reload]
  );

  const handleDownload = useCallback(async (item: ArticleMeta) => {
    await articleStorage.downloadToUser(item.id);
  }, []);

  const handleAddCategory = useCallback(() => {
    const name = newCategoryDraft.trim();
    if (!name) return;
    setExtraCategories((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setPendingCategory(name);
    setActiveCategory(name);
    setNewCategoryDraft("");
  }, [newCategoryDraft]);

  if (!civilization) return null;

  const available = articleStorage.isAvailable();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.header, { borderTopColor: civilization.color }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <FolderOpen size={20} color={civilization.color} />
                <Text style={styles.title} numberOfLines={1}>
                  {civilization.name} · Depo
                </Text>
              </View>
              <Text style={styles.subtitle}>
                {items.length} makale · {formatBytes(totalSize)}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="depo-close">
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {!available && (
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                Depo yalnizca web tarayicisinda kullanilabilir. Bu cihazda IndexedDB destegi yok.
              </Text>
            </View>
          )}

          {available && (
            <>
              <View style={styles.toolbar}>
                <View style={styles.searchBox}>
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Makale ara..."
                    placeholderTextColor="#64748b"
                    style={styles.searchInput}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.uploadBtn, busy && { opacity: 0.6 }]}
                  onPress={handlePickFiles}
                  disabled={busy}
                  testID="depo-upload"
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#0b0e14" />
                  ) : (
                    <Upload size={16} color="#0b0e14" />
                  )}
                  <Text style={styles.uploadText}>Makale Yukle</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.controlRow}>
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Yukleme Kategorisi</Text>
                  <View style={styles.pendingPickerRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.chipsRow}>
                        {(["Genel", ...extraCategories]
                          .concat(categories.filter((c) => c !== "Genel" && !extraCategories.includes(c)))
                        ).map((cat) => (
                          <TouchableOpacity
                            key={`pend-${cat}`}
                            style={[
                              styles.chip,
                              pendingCategory === cat && styles.chipActive,
                            ]}
                            onPress={() => setPendingCategory(cat)}
                          >
                            <Tag size={11} color={pendingCategory === cat ? "#0b0e14" : "#c9a227"} />
                            <Text
                              style={[
                                styles.chipText,
                                pendingCategory === cat && styles.chipTextActive,
                              ]}
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                  <View style={styles.newCatRow}>
                    <TextInput
                      style={styles.newCatInput}
                      value={newCategoryDraft}
                      onChangeText={setNewCategoryDraft}
                      placeholder="Yeni kategori adi"
                      placeholderTextColor="#475569"
                    />
                    <TouchableOpacity style={styles.newCatBtn} onPress={handleAddCategory}>
                      <Plus size={14} color="#0b0e14" />
                      <Text style={styles.newCatBtnText}>Ekle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.controlRow}>
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Kategori Filtre</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipsRow}>
                      <TouchableOpacity
                        style={[styles.chip, activeCategory === "__all__" && styles.chipActive]}
                        onPress={() => setActiveCategory("__all__")}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            activeCategory === "__all__" && styles.chipTextActive,
                          ]}
                        >
                          Tumu ({items.length})
                        </Text>
                      </TouchableOpacity>
                      {categories.map((cat) => {
                        const count = items.filter((it) => (it.category || "Genel") === cat).length;
                        return (
                          <TouchableOpacity
                            key={`flt-${cat}`}
                            style={[styles.chip, activeCategory === cat && styles.chipActive]}
                            onPress={() => setActiveCategory(cat)}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                activeCategory === cat && styles.chipTextActive,
                              ]}
                            >
                              {cat} ({count})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <View style={styles.controlRow}>
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Siralama</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipsRow}>
                      {SORT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = sortMode === opt.id;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => setSortMode(opt.id)}
                          >
                            <Icon size={11} color={active ? "#0b0e14" : "#c9a227"} />
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }}>
                {loading ? (
                  <View style={styles.emptyBox}>
                    <ActivityIndicator size="small" color="#c9a227" />
                    <Text style={styles.emptyText}>Yukleniyor...</Text>
                  </View>
                ) : filtered.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <FolderOpen size={28} color="#64748b" />
                    <Text style={styles.emptyText}>
                      {items.length === 0
                        ? "Henuz makale yok. Sag ustten yukle."
                        : "Bu filtreyle eslesen makale yok."}
                    </Text>
                  </View>
                ) : (
                  filtered.map((item) => (
                    <Pressable key={item.id} style={styles.row}>
                      <View style={styles.rowLeft}>
                        <View style={[styles.fileIcon, { backgroundColor: `${civilization.color}33` }]}>
                          <FolderOpen size={16} color={civilization.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.rowMeta} numberOfLines={1}>
                            {item.category} · {formatBytes(item.size)} ·{" "}
                            {new Date(item.uploadedAt).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.rowActions}>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() => handleDownload(item)}
                          testID={`depo-dl-${item.id}`}
                        >
                          <Download size={14} color="#c9a227" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconBtn, styles.iconBtnDanger]}
                          onPress={() => handleDelete(item)}
                          testID={`depo-del-${item.id}`}
                        >
                          <Trash2 size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 880,
    maxHeight: "92%",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#111827",
    borderTopWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  warnBox: {
    margin: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(220,38,38,0.15)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.4)",
  },
  warnText: {
    color: "#fecaca",
    fontSize: 12,
  },
  toolbar: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 10,
  },
  searchInput: {
    color: "#e2e8f0",
    paddingVertical: 8,
    fontSize: 13,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#c9a227",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  uploadText: {
    color: "#0b0e14",
    fontWeight: "800",
    fontSize: 12,
  },
  controlRow: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 6,
  },
  controlGroup: {
    gap: 6,
  },
  controlLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  pendingPickerRow: {
    marginVertical: 2,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    paddingRight: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
  },
  chipActive: {
    backgroundColor: "#c9a227",
    borderColor: "#c9a227",
  },
  chipText: {
    color: "#c9a227",
    fontSize: 11,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#0b0e14",
  },
  newCatRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  newCatInput: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: "#e2e8f0",
    fontSize: 12,
  },
  newCatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#c9a227",
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  newCatBtnText: {
    color: "#0b0e14",
    fontWeight: "800",
    fontSize: 11,
  },
  list: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 6,
    gap: 10,
  },
  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  rowMeta: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: "row",
    gap: 6,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnDanger: {
    backgroundColor: "rgba(220,38,38,0.85)",
  },
});

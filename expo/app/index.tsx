import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Animated,
  Platform,
  useWindowDimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  Search,
  Filter,
  Plus,
  Eye,
  X,
  Sparkles,
  Trash2,
  Upload,
  Database,
  GripVertical,
  FileText,
  LogOut,
  Undo,
  Redo,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import { authService } from "../lib/auth";
import { toast, ToastContainer } from "../components/Toast";

import { useTimeline } from "../context/TimelineContext";
import { useSettings } from "../context/SettingsContext";
import { TimelineGrid } from "../components/TimelineGrid";
import { InspectorPanel } from "../components/InspectorPanel";
import { CellEditor } from "../components/CellEditor";
import { CivilizationDepo } from "../components/CivilizationDepo";
import { FolderOpen } from "lucide-react-native";
import {
  Civilization,
  PeriodEvent,
  Cell,
} from "../types";

const PERIOD_PALETTE = [
  "#c9a227",
  "#4682B4",
  "#8B4513",
  "#5F9EA0",
  "#CD853F",
  "#6495ED",
  "#708090",
  "#8B0000",
];

export default function TimelineScreen() {
  const router = useRouter();
  const timelineCtx = useTimeline();
  const settingsCtx = useSettings();

  const verticalScrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const headerScrollRef = useRef<ScrollView>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [cellEditorOpen, setCellEditorOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [periodFilter, setPeriodFilter] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [fabOpen, setFabOpen] = useState<boolean>(false);
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [showReportConfig, setShowReportConfig] = useState<boolean>(false);
  const [depoCiv, setDepoCiv] = useState<Civilization | null>(null);
  const [reportStartYear, setReportStartYear] = useState<string>("");
  const [reportEndYear, setReportEndYear] = useState<string>("");
  const { width: viewportWidth } = useWindowDimensions();
  const isCompactWeb = Platform.OS === "web" && viewportWidth < 1280;

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const yearsList = useMemo(() => settingsCtx.getYearsList(), [settingsCtx]);
  const periodOptions = useMemo(() => {
    const uniquePeriods = Array.from(
      new Set(timelineCtx.events.map((event) => event.period?.trim()).filter(Boolean))
    );
    const dynamic = uniquePeriods
      .sort((a, b) => a.localeCompare(b))
      .map((period, idx) => ({
        id: period,
        label: period,
        color: PERIOD_PALETTE[idx % PERIOD_PALETTE.length],
      }));
    return [{ id: null, label: "All", color: "#c9a227" }, ...dynamic];
  }, [timelineCtx.events]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.15, 2.5));
  }, []);
  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.15, 0.4));
  }, []);
  const handleResetZoom = useCallback(() => setScale(1.0), []);

  const handleSelectYear = useCallback(
    (year: number) => {
      timelineCtx.setSelectedRow(year);
      timelineCtx.setSelectedEvent(null);
      timelineCtx.setSelectedCivilization(null);
      timelineCtx.setSelectedCell(null);
      setInspectorOpen(true);
      setCellEditorOpen(false);
    },
    [timelineCtx]
  );

  const handleSelectEvent = useCallback(
    (evt: PeriodEvent) => {
      timelineCtx.setSelectedEvent(evt);
      timelineCtx.setSelectedRow(evt.startYear);
      timelineCtx.setSelectedCivilization(null);
      timelineCtx.setSelectedCell(null);
      setInspectorOpen(true);
      setCellEditorOpen(false);
    },
    [timelineCtx]
  );

  const handleSelectCivilization = useCallback(
    (civ: Civilization) => {
      timelineCtx.setSelectedCivilization(civ);
      timelineCtx.setSelectedEvent(null);
      timelineCtx.setSelectedRow(null);
      timelineCtx.setSelectedCell(null);
      setInspectorOpen(true);
      setCellEditorOpen(false);
    },
    [timelineCtx]
  );

  const handleSelectCell = useCallback(
    (cell: Cell) => {
      timelineCtx.setSelectedCell(cell);
      timelineCtx.setSelectedRow(cell.year);
      timelineCtx.setSelectedEvent(null);
      timelineCtx.setSelectedCivilization(null);
      setCellEditorOpen(true);
      setInspectorOpen(false);
    },
    [timelineCtx]
  );

  const handleCloseInspector = useCallback(() => {
    setInspectorOpen(false);
    timelineCtx.setSelectedRow(null);
    timelineCtx.setSelectedEvent(null);
    timelineCtx.setSelectedCivilization(null);
  }, [timelineCtx]);

  const handleCloseCellEditor = useCallback(() => {
    setCellEditorOpen(false);
    timelineCtx.setSelectedCell(null);
  }, [timelineCtx]);

  // Removed getPeriodName - periods are now dynamic, not based on year ranges

  const formatYearLabel = useCallback(
    (year: number): string => {
      const absYear = Math.abs(year);
      const format = settingsCtx.settings.dateFormat;
      if (format === "MO") return `M.Ö. ${absYear}`;
      if (format === "BCE") return `${absYear} BCE`;
      return `${absYear} BC`;
    },
    [settingsCtx.settings.dateFormat]
  );

  const cellHeightBase = settingsCtx.settings.compactMode
    ? settingsCtx.settings.cellHeight * 0.6
    : settingsCtx.settings.cellHeight;
  const cellWidthBase = settingsCtx.settings.compactMode
    ? settingsCtx.settings.cellWidth * 0.8
    : settingsCtx.settings.cellWidth;

  const cellHeight = cellHeightBase * scale;
  const cellWidth = cellWidthBase * scale;
  const headerHeight = Math.max(64, cellHeight);

  const { rowHeights, rowTops, totalHeight } = useMemo(() => {
    const heights: number[] = [];
    const tops: number[] = [];
    let acc = 0;

    const photosPerRow = 2;
    const photoSize = Math.max(44, (cellWidth - 14) / photosPerRow);
    const gap = 3;

    for (let i = 0; i < yearsList.length; i++) {
      const year = yearsList[i];

      let maxPhotoRows = 0;
      let hasExtras = false;
      timelineCtx.civilizations.forEach((civ) => {
        const data = timelineCtx.cellData.find(
          (c) => c.year === year && c.civilizationId === civ.id
        );
        const photoCount = data?.photos?.length || 0;
        const pRows = Math.ceil(photoCount / photosPerRow);
        if (pRows > maxPhotoRows) maxPhotoRows = pRows;
        if ((data?.tags?.length || 0) > 0 || !!data?.notes) hasExtras = true;
      });

      const topPadding = 22;
      const bottomPadding = hasExtras ? 22 : 10;
      const photosHeight = maxPhotoRows > 0
        ? maxPhotoRows * photoSize + Math.max(0, maxPhotoRows - 1) * gap
        : 0;
      const needed = topPadding + photosHeight + bottomPadding;
      const h = Math.max(cellHeight, needed);
      heights.push(h);
      tops.push(acc);
      acc += h;
    }
    return { rowHeights: heights, rowTops: tops, totalHeight: acc };
  }, [yearsList, cellHeight, cellWidth, timelineCtx.civilizations, timelineCtx.cellData]);

  const filteredEventCount = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return timelineCtx.events.filter((e) => {
      if (periodFilter && e.period !== periodFilter) return false;
      if (q) {
        const hay = `${e.title} ${e.description} ${e.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).length;
  }, [timelineCtx.events, searchQuery, periodFilter]);

  const handleAddCivilization = useCallback(() => {
    const colors = [
      "#c9a227",
      "#8B4513",
      "#CD853F",
      "#DAA520",
      "#B8860B",
      "#4682B4",
      "#5F9EA0",
      "#6495ED",
      "#708090",
      "#8B0000",
    ];
    const idx = timelineCtx.civilizations.length;
    const newCiv: Civilization = {
      id: `civ-${Date.now()}`,
      name: `New Civilization ${idx + 1}`,
      region: "Region",
      startYear: settingsCtx.settings.startYear,
      endYear: settingsCtx.settings.endYear,
      description: "Tap to edit this civilization.",
      color: colors[idx % colors.length],
      tags: [],
    };
    timelineCtx.addCivilization(newCiv);
    setFabOpen(false);
  }, [timelineCtx, settingsCtx.settings]);

  const handleImportFile = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
          "*/*",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets || res.assets.length === 0) return;
      const asset = res.assets[0];
      console.log("[Import] file", asset.name);

      let workbook: XLSX.WorkBook;
      if (Platform.OS === "web") {
        const response = await fetch(asset.uri);
        const buf = await response.arrayBuffer();
        workbook = XLSX.read(buf, { type: "array" });
      } else {
        const FileSystem = await import("expo-file-system/legacy");
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        workbook = XLSX.read(base64, { type: "base64" });
      }
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      console.log("[Import] rows", rows.length);
      if (rows.length === 0) {
        const msg = "Dosyada veri bulunamadı.";
        if (Platform.OS === "web") { 
          toast.error(msg);
        } else { 
          const { Alert } = await import("react-native"); 
          Alert.alert("İçe Aktarma", msg); 
        }
        return;
      }

      const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, "");
      const getVal = (row: Record<string, any>, keys: string[]): string => {
        const entries = Object.entries(row).map(([k, v]) => [normalizeKey(k), v] as const);
        for (const key of keys) {
          const hit = entries.find(([k]) => k === normalizeKey(key));
          if (hit && hit[1] !== undefined && hit[1] !== "") return String(hit[1]);
        }
        return "";
      };
      const parseYear = (s: string): number => {
        if (!s) return 0;
        const clean = s.toString().trim();
        const isBC = /bc|m\.?ö|bce|-/.test(clean.toLowerCase());
        const num = parseInt(clean.replace(/[^0-9]/g, ""), 10);
        if (isNaN(num)) return 0;
        return isBC ? -Math.abs(num) : num;
      };

      const existingCivByName = new Map(
        timelineCtx.civilizations.map((c) => [c.name.toLowerCase(), c])
      );
      const newCivs: Civilization[] = [];
      const palette = ["#c9a227", "#8B4513", "#CD853F", "#DAA520", "#B8860B", "#4682B4", "#5F9EA0", "#6495ED", "#708090", "#8B0000"];
      const ensureCiv = (name: string): string => {
        if (!name) return timelineCtx.civilizations[0]?.id ?? "civ-default";
        const low = name.toLowerCase();
        const found = existingCivByName.get(low);
        if (found) return found.id;
        const existingNew = newCivs.find((c) => c.name.toLowerCase() === low);
        if (existingNew) return existingNew.id;
        const idx = timelineCtx.civilizations.length + newCivs.length;
        const nc: Civilization = {
          id: `civ-imp-${Date.now()}-${idx}`,
          name,
          region: "Imported",
          startYear: settingsCtx.settings.startYear,
          endYear: settingsCtx.settings.endYear,
          description: "Imported civilization.",
          color: palette[idx % palette.length],
          tags: [],
        };
        newCivs.push(nc);
        existingCivByName.set(low, nc);
        return nc.id;
      };

      const newEvents: PeriodEvent[] = [];
      rows.forEach((row, i) => {
        const title = getVal(row, ["title", "başlık", "baslik", "event", "olay", "name"]);
        if (!title) return;
        const desc = getVal(row, ["description", "açıklama", "aciklama", "detail", "detay"]);
        const civName = getVal(row, ["civilization", "medeniyet", "uygarlık", "uygarlik", "civ"]);
        const periodRaw = getVal(row, ["period", "dönem", "donem"]);
        const startRaw = getVal(row, ["start", "startyear", "başlangıç", "baslangic", "from", "year"]);
        const endRaw = getVal(row, ["end", "endyear", "bitiş", "bitis", "to"]);
        const tagsRaw = getVal(row, ["tags", "etiketler", "etiket"]);

        const startYear = parseYear(startRaw);
        const endYear = endRaw ? parseYear(endRaw) : startYear;
        const civId = ensureCiv(civName || "Imported");
        // Accept any period string from CSV, default to "Other" if empty
        const period = periodRaw?.trim() || "Other";

        newEvents.push({
          id: `evt-imp-${Date.now()}-${i}`,
          title,
          description: desc,
          startYear,
          endYear,
          period,
          civilizationId: civId,
          tags: tagsRaw ? tagsRaw.split(/[,;|]/).map((t) => t.trim()).filter(Boolean) : [],
        });
      });

      timelineCtx.importEvents(newEvents, newCivs);
      const summary = `${newEvents.length} olay içe aktarıldı${newCivs.length ? `, ${newCivs.length} yeni medeniyet` : ""}`;
      if (Platform.OS === "web") { 
        toast.success(summary);
      } else { 
        const { Alert } = await import("react-native"); 
        Alert.alert("İçe Aktarma Tamamlandı", summary); 
      }
    } catch (err) {
      console.error("[Import] error", err);
      const msg = "Dosya okunamadı. Excel (.xlsx) veya CSV deneyin.";
      if (Platform.OS === "web") { 
        toast.error(msg);
      } else { 
        const { Alert } = await import("react-native"); 
        Alert.alert("Hata", msg); 
      }
    }
  }, [timelineCtx, settingsCtx.settings]);

  const handleImportSqlFile = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "application/sql", "*/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const asset = res.assets[0];
      if (!asset.name?.toLowerCase().endsWith(".sql")) {
        toast.error("Lutfen .sql uzantili bir dosya secin.");
        return;
      }

      let sqlContent = "";
      if (Platform.OS === "web") {
        const response = await fetch(asset.uri);
        sqlContent = await response.text();
      } else {
        const FileSystem = await import("expo-file-system/legacy");
        sqlContent = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      if (!sqlContent.trim()) {
        toast.error("SQL dosyasi bos gorunuyor.");
        return;
      }

      const response = await fetch("/api/postgres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "importSql",
          data: { sqlContent },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "SQL yukleme basarisiz.");
      }

      await timelineCtx.loadInitialData();
      toast.success(`SQL yuklendi (${result.data?.executedStatements ?? 0} komut calisti).`);
    } catch (error) {
      toast.error((error as Error)?.message || "SQL dosyasi yuklenemedi.");
    }
  }, [timelineCtx]);

  const scrollSourceRef = useRef<"main" | "header" | null>(null);

  const handleHorizontalScroll = useCallback((e: any) => {
    if (scrollSourceRef.current === "header") {
      scrollSourceRef.current = null;
      return;
    }
    scrollSourceRef.current = "main";
    const x = e.nativeEvent.contentOffset.x;
    headerScrollRef.current?.scrollTo({ x, animated: false });
  }, []);

  const handleHeaderScroll = useCallback((e: any) => {
    if (scrollSourceRef.current === "main") {
      scrollSourceRef.current = null;
      return;
    }
    scrollSourceRef.current = "header";
    const x = e.nativeEvent.contentOffset.x;
    horizontalScrollRef.current?.scrollTo({ x, animated: false });
  }, []);

  const handleVerticalScroll = useCallback((e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  }, []);

  const handleScrollToTop = useCallback(() => {
    verticalScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleExportReport = useCallback(() => {
    setReportStartYear(String(Math.abs(settingsCtx.settings.startYear)));
    setReportEndYear(String(Math.abs(settingsCtx.settings.endYear)));
    setShowReportConfig(true);
  }, [settingsCtx.settings.startYear, settingsCtx.settings.endYear]);

  const handleGenerateReport = useCallback(() => {
    const parsedStart = -Math.abs(parseInt(reportStartYear || "0", 10));
    const parsedEnd = -Math.abs(parseInt(reportEndYear || "0", 10));
    if (Number.isNaN(parsedStart) || Number.isNaN(parsedEnd)) {
      toast.error("Gecerli bir tarih araligi girin.");
      return;
    }
    const rangeMin = Math.min(parsedStart, parsedEnd);
    const rangeMax = Math.max(parsedStart, parsedEnd);
    const eventsInRange = timelineCtx.events.filter((e) => {
      const eMin = Math.min(e.startYear, e.endYear);
      const eMax = Math.max(e.startYear, e.endYear);
      return eMax >= rangeMin && eMin <= rangeMax;
    });

    const report = {
      generatedAt: new Date().toISOString(),
      civilizations: timelineCtx.civilizations.length,
      events: eventsInRange.length,
      yearRange: {
        start: parsedStart,
        end: parsedEnd,
      },
      civilizationsList: timelineCtx.civilizations.map(c => ({
        name: c.name,
        region: c.region,
        eventCount: eventsInRange.filter(e => e.civilizationId === c.id).length,
      })),
      eventsByPeriod: periodOptions.slice(1).map(p => ({
        period: p.label,
        count: eventsInRange.filter(e => e.period === p.id).length,
      })),
      topEvents: eventsInRange
        .sort((a, b) => a.startYear - b.startYear)
        .slice(0, 80)
        .map((e) => ({
          title: e.title,
          period: e.period,
          years: `${Math.abs(e.startYear)}-${Math.abs(e.endYear)} BC`,
          civilization: timelineCtx.civilizations.find((c) => c.id === e.civilizationId)?.name || "Unknown",
        })),
    };

    const reportText = `
WESTERN ANATOLIA TIMELINE - RAPOR
Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}

ÖZET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Toplam Medeniyet: ${report.civilizations}
Toplam Olay: ${report.events}
Yıl Aralığı: ${Math.abs(report.yearRange.start)} - ${Math.abs(report.yearRange.end)} M.Ö.

MEDENİYETLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.civilizationsList.map(c => `• ${c.name} (${c.region}) - ${c.eventCount} olay`).join('\n')}

DÖNEMLERE GÖRE OLAYLAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.eventsByPeriod.map(p => `• ${p.period}: ${p.count} olay`).join('\n')}

OLAY DETAY LISTESI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.topEvents.map(e => `• [${e.years}] ${e.title} | ${e.period} | ${e.civilization}`).join('\n')}
    `.trim();

    if (Platform.OS === "web") {
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeline-rapor-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Rapor indirildi!");
    } else {
      import("react-native").then(({ Alert, Share }) => {
        Share.share({
          message: reportText,
          title: 'Timeline Raporu',
        }).catch(() => {
          Alert.alert("Rapor", reportText);
        });
      });
    }
    setShowReportConfig(false);
  }, [reportStartYear, reportEndYear, timelineCtx.civilizations, timelineCtx.events, periodOptions]);

  const handleLogout = useCallback(async () => {
    const doLogout = async () => {
      try {
        console.log("🚪 Logging out...");
        await authService.logout();
        
        if (Platform.OS === "web") {
          toast.success("Çıkış yapıldı");
          // Small delay to show toast
          setTimeout(() => {
            window.location.href = "/login";
          }, 500);
        } else {
          // For mobile, just navigate - auth listener will handle the redirect
          router.replace("/login");
        }
      } catch (error) {
        console.error("❌ Logout error:", error);
      }
    };

    if (Platform.OS === "web") {
      // Custom confirmation toast
      const confirmed = window.confirm("Çıkış yapmak istediğinize emin misiniz?");
      if (confirmed) {
        doLogout();
      }
    } else {
      import("react-native").then(({ Alert }) => {
        Alert.alert(
          "Çıkış Yap",
          "Çıkış yapmak istediğinize emin misiniz?",
          [
            { text: "İptal", style: "cancel" },
            { text: "Çıkış Yap", style: "destructive", onPress: doLogout },
          ]
        );
      });
    }
  }, [router]);

  const sideColumnWidth = isCompactWeb ? 92 : 120;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ToastContainer />
      {/* App Header */}
      <View style={[styles.header, isCompactWeb && styles.headerCompact]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Sparkles size={16} color="#1a1a1a" />
          </View>
          <View>
            <Text style={styles.title}>Western Anatolia</Text>
            <Text style={styles.subtitle}>Chronology · Explorer</Text>
          </View>
        </View>

        <View style={[styles.headerRight, isCompactWeb && styles.headerRightCompact]}>
          {reorderMode && (
            <TouchableOpacity
              style={[styles.iconBtn, styles.iconBtnDone]}
              onPress={() => setReorderMode(false)}
              testID="reorder-done"
            >
              <Text style={styles.doneText}>Bitti</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.iconBtn, !timelineCtx.canUndo && styles.iconBtnDisabled]}
            onPress={() => {
              timelineCtx.undo();
              toast.success("Geri alındı");
            }}
            disabled={!timelineCtx.canUndo}
            testID="undo-btn"
          >
            <Undo size={18} color={!timelineCtx.canUndo ? "#666" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, !timelineCtx.canRedo && styles.iconBtnDisabled]}
            onPress={() => {
              timelineCtx.redo();
              toast.success("İleri alındı");
            }}
            disabled={!timelineCtx.canRedo}
            testID="redo-btn"
          >
            <Redo size={18} color={!timelineCtx.canRedo ? "#666" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleImportFile}
            testID="import-btn"
          >
            <Upload size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleImportSqlFile}
            testID="import-sql-btn"
          >
            <Database size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, searchOpen && styles.iconBtnActive]}
            onPress={() => setSearchOpen((v) => !v)}
            testID="search-toggle"
          >
            <Search size={18} color={searchOpen ? "#c9a227" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, showMinimap && styles.iconBtnActive]}
            onPress={() => setShowMinimap((v) => !v)}
            testID="minimap-toggle"
          >
            <Eye size={18} color={showMinimap ? "#c9a227" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/settings")}
            testID="settings-btn"
          >
            <Settings size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleLogout}
            testID="logout-btn"
          >
            <LogOut size={18} color="#dc143c" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {searchOpen && (
        <View style={[styles.searchBar, isCompactWeb && styles.searchBarCompact]}>
          <Search size={16} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, tags, descriptions..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Period Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterStrip}
        contentContainerStyle={styles.filterStripContent}
      >
        {periodOptions.map((p) => {
          const active = periodFilter === p.id;
          return (
            <TouchableOpacity
              key={p.label}
              style={[
                styles.filterChip,
                active && { backgroundColor: `${p.color}30`, borderColor: p.color },
              ]}
              onPress={() => setPeriodFilter(p.id)}
              testID={`filter-${p.label}`}
            >
              <View style={[styles.chipDot, { backgroundColor: p.color }]} />
              <Text style={[styles.chipText, active && { color: p.color }]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Stats + Zoom Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statGroup}>
          <Layers size={13} color="#c9a227" />
          <Text style={styles.statText}>
            {timelineCtx.civilizations.length} civ · {filteredEventCount}/
            {timelineCtx.events.length} events
          </Text>
        </View>
        <View style={styles.zoomGroup}>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
            <ZoomOut size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetZoom}>
            <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
            <ZoomIn size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleResetZoom}>
            <Maximize size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Frozen Top-Left Corner + Scrollable Civ Headers */}
      <View style={[styles.headerRowContainer, { height: headerHeight }]}>
        <View style={[styles.cornerCell, { width: sideColumnWidth, height: headerHeight }]}>
          <Text style={styles.cornerText}>Period / Year</Text>
        </View>
        <ScrollView
          ref={headerScrollRef}
          horizontal
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleHeaderScroll}
          scrollEventThrottle={16}
          style={styles.headerScroll}
        >
          <View style={styles.civHeaderRow}>
            {timelineCtx.civilizations.map((civ, idx) => (
              <TouchableOpacity
                key={`h-${civ.id}`}
                style={[
                  styles.civHeader,
                  {
                    width: cellWidth,
                    height: headerHeight,
                    borderTopColor: civ.color,
                  },
                  timelineCtx.selectedCivilization?.id === civ.id && styles.civHeaderSel,
                  reorderMode && styles.civHeaderReorder,
                ]}
                onPress={() => {
                  if (reorderMode) return;
                  handleSelectCivilization(civ);
                }}
                onLongPress={() => setReorderMode(true)}
                delayLongPress={320}
              >
                {reorderMode ? (
                  <View style={styles.reorderRow}>
                    <TouchableOpacity
                      style={styles.reorderArrow}
                      onPress={() => timelineCtx.reorderCivilizations(idx, Math.max(0, idx - 1))}
                      disabled={idx === 0}
                      hitSlop={8}
                    >
                      <Text style={[styles.reorderArrowText, idx === 0 && { opacity: 0.3 }]}>◀</Text>
                    </TouchableOpacity>
                    <GripVertical size={14} color="#c9a227" />
                    <TouchableOpacity
                      style={styles.reorderArrow}
                      onPress={() => timelineCtx.reorderCivilizations(idx, Math.min(timelineCtx.civilizations.length - 1, idx + 1))}
                      disabled={idx === timelineCtx.civilizations.length - 1}
                      hitSlop={8}
                    >
                      <Text style={[styles.reorderArrowText, idx === timelineCtx.civilizations.length - 1 && { opacity: 0.3 }]}>▶</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.civColorDot, { backgroundColor: civ.color }]} />
                )}
                <Text style={styles.civHeaderName} numberOfLines={1}>
                  {civ.name}
                </Text>
                <Text style={styles.civHeaderRegion} numberOfLines={1}>
                  {civ.region}
                </Text>
                {!reorderMode && (
                  <TouchableOpacity
                    style={styles.civDepoBtn}
                    onPress={(e) => {
                      (e as any)?.stopPropagation?.();
                      setDepoCiv(civ);
                    }}
                    hitSlop={6}
                    testID={`civ-depo-${civ.id}`}
                  >
                    <FolderOpen size={11} color="#0b0e14" />
                    <Text style={styles.civDepoBtnText}>Depo</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.addCivHeader,
                { 
                  width: Math.max(cellWidth * 0.5, 80),
                  height: headerHeight,
                  marginLeft: 0,
                },
              ]}
              onPress={handleAddCivilization}
              testID="add-civ"
            >
              <Plus size={18} color="#c9a227" />
              <Text style={styles.addCivText}>Add</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Main Scroll Area (vertical) */}
      <ScrollView
        ref={verticalScrollRef}
        style={styles.mainScroll}
        showsVerticalScrollIndicator
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={handleVerticalScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.gridRow}>
          {/* Frozen side column: Period + Year */}
          <View style={[styles.sideColumn, { width: sideColumnWidth }]}>
            {yearsList.map((year, i) => {
              // Removed periodName - periods are now dynamic, not based on year ranges
              const isRowSel = timelineCtx.selectedRow === year;
              const isCentury =
                settingsCtx.settings.highlightCenturies && year % 100 === 0;
              return (
                <Pressable
                  key={`side-${year}`}
                  style={[
                    styles.sideCell,
                    { height: rowHeights[i] },
                    isRowSel && styles.sideCellSel,
                    isCentury && styles.sideCellCentury,
                  ]}
                  onPress={() => handleSelectYear(year)}
                  onLongPress={() => {
                    const doDelete = () => timelineCtx.clearYear(year);
                    if (Platform.OS === "web") {
                      if (typeof window !== "undefined" && window.confirm(`${formatYearLabel(year)} satırının tüm içeriği silinsin mi?`)) doDelete();
                    } else {
                      import("react-native").then(({ Alert }) => {
                        Alert.alert("Satır Temizle", `${formatYearLabel(year)} satırının tüm içeriği silinecek.`, [
                          { text: "İptal", style: "cancel" },
                          { text: "Sil", style: "destructive", onPress: doDelete },
                        ]);
                      });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.yearText,
                      isCentury && styles.yearTextCentury,
                      isRowSel && styles.yearTextSel,
                    ]}
                  >
                    {formatYearLabel(year)}
                  </Text>
                  {isRowSel && (
                    <TouchableOpacity
                      style={styles.rowDeleteBtn}
                      onPress={() => {
                        const doDelete = () => timelineCtx.clearYear(year);
                        if (Platform.OS === "web") {
                          if (typeof window !== "undefined" && window.confirm(`${formatYearLabel(year)} satırını temizle?`)) doDelete();
                        } else {
                          import("react-native").then(({ Alert }) => {
                            Alert.alert("Satır Temizle", `${formatYearLabel(year)} satırının tüm içeriği silinecek.`, [
                              { text: "İptal", style: "cancel" },
                              { text: "Sil", style: "destructive", onPress: doDelete },
                            ]);
                          });
                        }
                      }}
                      hitSlop={12}
                    >
                      <Trash2 size={14} color="#fff" />
                    </TouchableOpacity>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Right scrollable grid */}
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            showsHorizontalScrollIndicator
            onScroll={handleHorizontalScroll}
            scrollEventThrottle={16}
            nestedScrollEnabled
          >
            <TimelineGrid
              years={yearsList}
              civilizations={timelineCtx.civilizations}
              events={timelineCtx.events}
              cellData={timelineCtx.cellData}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              rowHeights={rowHeights}
              rowTops={rowTops}
              totalHeight={totalHeight}
              selectedRow={timelineCtx.selectedRow}
              selectedCivilization={timelineCtx.selectedCivilization}
              selectedCell={timelineCtx.selectedCell}
              selectedEvent={timelineCtx.selectedEvent}
              onRowSelect={handleSelectYear}
              onEventSelect={handleSelectEvent}
              onCivilizationSelect={handleSelectCivilization}
              onCellSelect={handleSelectCell}
              showGridLines={settingsCtx.settings.showGridLines}
              periodFilter={periodFilter}
              searchQuery={searchQuery}
            />
          </ScrollView>
        </View>
      </ScrollView>

      {/* Minimap */}
      {showMinimap && (
        <View style={[styles.minimap, isCompactWeb && styles.minimapCompact]}>
          <View style={styles.minimapHeader}>
            <Text style={styles.minimapTitle}>Overview</Text>
            <TouchableOpacity onPress={() => setShowMinimap(false)}>
              <X size={14} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.minimapContent}>
            {timelineCtx.civilizations.map((civ) => {
              const civEvents = timelineCtx.events.filter(
                (e) => e.civilizationId === civ.id
              );
              const start = settingsCtx.settings.startYear;
              const end = settingsCtx.settings.endYear;
              const rangeMin = Math.min(start, end);
              const rangeMax = Math.max(start, end);
              const total = rangeMax - rangeMin || 1;
              return (
                <View key={`mini-${civ.id}`} style={styles.minimapRow}>
                  <Text style={styles.minimapCivName} numberOfLines={1}>
                    {civ.name}
                  </Text>
                  <View style={styles.minimapTrack}>
                    {civEvents.map((e) => {
                      const eMin = Math.max(rangeMin, Math.min(e.startYear, e.endYear));
                      const eMax = Math.min(rangeMax, Math.max(e.startYear, e.endYear));
                      if (eMax < rangeMin || eMin > rangeMax) return null;
                      const left = ((eMin - rangeMin) / total) * 100;
                      const width = Math.max(2, ((eMax - eMin) / total) * 100);
                      return (
                        <View
                          key={`mini-e-${e.id}`}
                          style={[
                            styles.minimapBar,
                            {
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: civ.color,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <TouchableOpacity
          style={styles.scrollTopBtn}
          onPress={handleScrollToTop}
          testID="scroll-top"
        >
          <Text style={styles.scrollTopIcon}>↑</Text>
        </TouchableOpacity>
      )}

      {/* Floating Action Button */}
      <View style={[styles.fabContainer, isCompactWeb && styles.fabContainerCompact]} pointerEvents="box-none">
        {fabOpen && (
          <View style={styles.fabMenu}>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={handleAddCivilization}
            >
              <Layers size={14} color="#c9a227" />
              <Text style={styles.fabMenuText}>Medeniyet Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setFabOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search size={14} color="#c9a227" />
              <Text style={styles.fabMenuText}>Hızlı Arama</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setFabOpen(false);
                handleExportReport();
              }}
            >
              <FileText size={14} color="#c9a227" />
              <Text style={styles.fabMenuText}>Rapor Al</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setFabOpen(false);
                handleImportSqlFile();
              }}
            >
              <Database size={14} color="#c9a227" />
              <Text style={styles.fabMenuText}>SQL Yukle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setFabOpen(false);
                router.push("/settings");
              }}
            >
              <Filter size={14} color="#c9a227" />
              <Text style={styles.fabMenuText}>Ayarlar</Text>
            </TouchableOpacity>
          </View>
        )}
        <Animated.View
          style={{
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.06],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setFabOpen((v) => !v)}
            testID="fab-main"
          >
            {fabOpen ? (
              <X size={22} color="#1a1a1a" />
            ) : (
              <Plus size={22} color="#1a1a1a" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Cell info pill */}
      {timelineCtx.selectedCell && (
        <View style={styles.cellPill} pointerEvents="none">
          <Text style={styles.cellPillText}>
            {
              timelineCtx.civilizations.find(
                (c) => c.id === timelineCtx.selectedCell?.civilizationId
              )?.name
            }{" "}
            · {formatYearLabel(timelineCtx.selectedCell.year)}
          </Text>
        </View>
      )}

      <Modal visible={showReportConfig} transparent animationType="fade" onRequestClose={() => setShowReportConfig(false)}>
        <View style={styles.reportOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.reportTitle}>Detayli Rapor Ayarlari</Text>
            <Text style={styles.reportHint}>Tarih araligini M.Ö yil olarak girin</Text>
            <TextInput
              style={styles.reportInput}
              value={reportStartYear}
              onChangeText={setReportStartYear}
              keyboardType="number-pad"
              placeholder="Baslangic (orn: 4000)"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.reportInput}
              value={reportEndYear}
              onChangeText={setReportEndYear}
              keyboardType="number-pad"
              placeholder="Bitis (orn: 500)"
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.reportButtons}>
              <TouchableOpacity style={[styles.reportButton, styles.reportCancel]} onPress={() => setShowReportConfig(false)}>
                <Text style={styles.reportButtonText}>Iptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.reportButton, styles.reportConfirm]} onPress={handleGenerateReport}>
                <Text style={styles.reportButtonText}>Raporu Al</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <InspectorPanel
        visible={inspectorOpen}
        onClose={handleCloseInspector}
        selectedYear={timelineCtx.selectedRow}
        selectedEvent={timelineCtx.selectedEvent}
        selectedCivilization={timelineCtx.selectedCivilization}
        events={timelineCtx.events}
        civilizations={timelineCtx.civilizations}
        cellData={timelineCtx.cellData}
        yearStep={settingsCtx.settings.yearStep}
        onUpdateCivilization={timelineCtx.updateCivilization}
        onDeleteCivilization={timelineCtx.deleteCivilization}
        onUpdateEvent={timelineCtx.updateEvent}
      />

      <CivilizationDepo
        visible={!!depoCiv}
        civilization={depoCiv}
        onClose={() => setDepoCiv(null)}
      />

      <CellEditor
        visible={cellEditorOpen}
        onClose={handleCloseCellEditor}
        cell={timelineCtx.selectedCell}
        civilizations={timelineCtx.civilizations}
        events={timelineCtx.events}
        onAddEvent={timelineCtx.addEvent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b0e14",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  headerCompact: {
    paddingHorizontal: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#c9a227",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 1,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerRightCompact: { gap: 4 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnActive: {
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.4)",
  },
  iconBtnDisabled: {
    opacity: 0.4,
  },
  iconBtnDone: {
    width: "auto",
    paddingHorizontal: 12,
    backgroundColor: "#c9a227",
  },
  doneText: {
    color: "#1a1a1a",
    fontSize: 12,
    fontWeight: "800",
  },
  reorderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  reorderArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(201,162,39,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.5)",
  },
  reorderArrowText: {
    color: "#c9a227",
    fontSize: 14,
    fontWeight: "800",
  },
  civHeaderReorder: {
    backgroundColor: "rgba(201,162,39,0.08)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111827",
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  searchBarCompact: {
    marginHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  filterStrip: {
    maxHeight: 44,
  },
  filterStripContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  chipDot: { width: 7, height: 7, borderRadius: 3.5 },
  chipText: { color: "#cbd5e1", fontSize: 11, fontWeight: "700" },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  statGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { color: "#cbd5e1", fontSize: 11, fontWeight: "700" },
  zoomGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  zoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomText: {
    color: "#c9a227",
    fontSize: 11,
    fontWeight: "700",
    minWidth: 38,
    textAlign: "center",
  },
  headerRowContainer: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  cornerCell: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRightWidth: 1,
    borderRightColor: "#1f2937",
  },
  cornerText: {
    color: "#c9a227",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerScroll: { flex: 1 },
  civHeaderRow: { flexDirection: "row" },
  civHeader: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    borderTopWidth: 3,
    borderRightWidth: 1,
    borderRightColor: "#222",
    backgroundColor: "#111827",
  },
  civHeaderSel: { backgroundColor: "rgba(201, 162, 39, 0.12)" },
  civDepoBtn: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#c9a227",
  },
  civDepoBtnText: {
    color: "#0b0e14",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  civColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  civHeaderName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  civHeaderRegion: {
    color: "#777",
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  addCivHeader: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(201, 162, 39, 0.05)",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "rgba(201, 162, 39, 0.3)",
    borderRadius: 10,
    gap: 4,
  },
  addCivText: { color: "#c9a227", fontSize: 10, fontWeight: "700" },
  mainScroll: { flex: 1 },
  gridRow: { flexDirection: "row" },
  sideColumn: {
    backgroundColor: "#0f172a",
    borderRightWidth: 1,
    borderRightColor: "#1f2937",
  },
  sideCell: {
    paddingHorizontal: 8,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  sideCellSel: {
    backgroundColor: "rgba(201, 162, 39, 0.18)",
    borderLeftWidth: 3,
    borderLeftColor: "#c9a227",
  },
  sideCellCentury: {
    backgroundColor: "#17171b",
  },
  yearText: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "600",
  },
  sideCellHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowNumText: {
    color: "#c9a227",
    fontSize: 9,
    fontWeight: "800",
    backgroundColor: "rgba(201,162,39,0.12)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    minWidth: 18,
    textAlign: "center",
  },
  rowDeleteBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(220,20,60,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    borderWidth: 1.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  yearTextCentury: { color: "#c9a227", fontWeight: "800" },
  yearTextSel: { color: "#fff" },
  periodLabel: {
    color: "#555",
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  minimap: {
    position: "absolute",
    right: 12,
    top: 176,
    width: 240,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  minimapCompact: {
    width: 210,
    right: 10,
    top: 168,
  },
  minimapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  minimapTitle: {
    color: "#c9a227",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  minimapContent: { gap: 6 },
  minimapRow: { gap: 3 },
  minimapCivName: { color: "#ddd", fontSize: 9, fontWeight: "600" },
  minimapTrack: {
    height: 11,
    backgroundColor: "#1f2937",
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
  },
  minimapBar: {
    position: "absolute",
    top: 1,
    bottom: 1,
    borderRadius: 2,
    opacity: 0.85,
  },
  fabContainer: {
    position: "absolute",
    bottom: 22,
    right: 22,
    alignItems: "flex-end",
    gap: 10,
  },
  fabContainerCompact: {
    right: 14,
    bottom: 16,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#c9a227",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#c9a227",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  fabMenu: {
    backgroundColor: "rgba(15, 23, 42, 0.97)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 6,
    minWidth: 200,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  fabMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fabMenuText: { color: "#eee", fontSize: 13, fontWeight: "600" },
  cellPill: {
    position: "absolute",
    bottom: 22,
    left: 22,
    backgroundColor: "rgba(201, 162, 39, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  cellPillText: {
    color: "#1a1a1a",
    fontSize: 12,
    fontWeight: "700",
  },
  scrollTopBtn: {
    position: "absolute",
    bottom: 100,
    right: 22,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(201, 162, 39, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  scrollTopIcon: {
    color: "#1a1a1a",
    fontSize: 24,
    fontWeight: "900",
  },
  reportOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  reportModal: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 16,
    gap: 10,
  },
  reportTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
  },
  reportHint: {
    color: "#94a3b8",
    fontSize: 12,
  },
  reportInput: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#e2e8f0",
    fontSize: 14,
  },
  reportButtons: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  reportButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  reportCancel: {
    backgroundColor: "#334155",
  },
  reportConfirm: {
    backgroundColor: "#c9a227",
  },
  reportButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

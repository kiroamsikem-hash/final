import React, { useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
  Image,
  Alert,
  Platform,
} from "react-native";
import { FileText, X, Trash2 } from "lucide-react-native";
import { Civilization, PeriodEvent, Cell, CellData } from "@/types";
import { useTimeline } from "@/context/TimelineContext";

function civIndexToLetter(idx: number): string {
  let s = "";
  let n = idx;
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

interface EventBarPlacement {
  event: PeriodEvent;
  top: number;
  height: number;
  slot: number;
  totalSlots: number;
}

interface TimelineGridProps {
  years: number[];
  civilizations: Civilization[];
  events: PeriodEvent[];
  cellData: CellData[];
  cellWidth: number;
  cellHeight: number;
  rowHeights: number[];
  rowTops: number[];
  totalHeight: number;
  selectedRow: number | null;
  selectedCivilization: Civilization | null;
  selectedCell: Cell | null;
  selectedEvent: PeriodEvent | null;
  onRowSelect: (year: number) => void;
  onEventSelect: (event: PeriodEvent) => void;
  onCivilizationSelect: (civ: Civilization) => void;
  onCellSelect: (cell: Cell) => void;
  showGridLines: boolean;
  periodFilter: string | null;
  searchQuery: string;
}

function getPeriodColor(period: string): string {
  const colors: Record<string, string> = {
    Prepalatial: "#d97706",
    Protopalatial: "#f59e0b",
    Neopalatial: "#eab308",
    Postpalatial: "#f97316",
    Archaic: "#3b82f6",
    Classical: "#06b6d4",
    Hellenistic: "#6366f1",
    Other: "#64748b",
  };
  return colors[period] || colors.Other;
}

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getEventDisplayColor(event: PeriodEvent): string {
  if (event.color) return event.color;
  if (event.period && event.period !== "Other") return getPeriodColor(event.period);
  const vividPalette = [
    "#22c55e",
    "#14b8a6",
    "#0ea5e9",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f59e0b",
    "#84cc16",
  ];
  return vividPalette[hashString(`${event.id}-${event.title}`) % vividPalette.length];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function computePlacements(
  events: PeriodEvent[],
  years: number[],
  rowTops: number[],
  rowHeights: number[]
): EventBarPlacement[] {
  if (years.length === 0) return [];
  const first = years[0];
  const last = years[years.length - 1];
  const ascending = first < last;
  const rangeMin = Math.min(first, last);
  const rangeMax = Math.max(first, last);
  const step = Math.abs((years[1] ?? first) - first) || 1;

  const yearToIndex = (y: number): number => {
    if (ascending) {
      return Math.round((y - first) / step);
    }
    return Math.round((first - y) / step);
  };

  const items = events
    .map((e) => {
      const minY = Math.min(e.startYear, e.endYear);
      const maxY = Math.max(e.startYear, e.endYear);
      if (maxY < rangeMin || minY > rangeMax) return null;
      const clampedMin = clamp(minY, rangeMin, rangeMax);
      const clampedMax = clamp(maxY, rangeMin, rangeMax);
      const idxA = clamp(yearToIndex(clampedMin), 0, years.length - 1);
      const idxB = clamp(yearToIndex(clampedMax), 0, years.length - 1);
      const iTop = Math.min(idxA, idxB);
      const iBot = Math.max(idxA, idxB);
      const top = rowTops[iTop];
      const bottom = rowTops[iBot] + rowHeights[iBot];
      const height = Math.max(24, bottom - top);
      return { event: e, top, bottom: top + height };
    })
    .filter((x): x is { event: PeriodEvent; top: number; bottom: number } => x !== null)
    .sort((a, b) => a.top - b.top);

  const slotEnds: number[] = [];
  const withSlots = items.map((it) => {
    let slot = slotEnds.findIndex((end) => end <= it.top);
    if (slot === -1) {
      slot = slotEnds.length;
      slotEnds.push(it.bottom);
    } else {
      slotEnds[slot] = it.bottom;
    }
    return { ...it, slot };
  });

  const totalSlots = slotEnds.length || 1;
  return withSlots.map((it) => ({
    event: it.event,
    top: it.top,
    height: it.bottom - it.top,
    slot: it.slot,
    totalSlots,
  }));
}

export function TimelineGrid({
  years,
  civilizations,
  events,
  cellData,
  cellWidth,
  cellHeight,
  rowHeights,
  rowTops,
  totalHeight,
  selectedRow,
  selectedCivilization,
  selectedCell,
  selectedEvent,
  onEventSelect,
  onCellSelect,
  showGridLines,
  periodFilter,
  searchQuery,
}: TimelineGridProps) {
  const { removeCellPhoto, deleteEvent, clearCell } = useTimeline();

  const civIndex = useMemo(() => {
    const m = new Map<string, number>();
    civilizations.forEach((c, i) => m.set(c.id, i));
    return m;
  }, [civilizations]);

  const confirmDelete = useCallback((title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`${title}\n${message}`)) onConfirm();
      return;
    }
    Alert.alert(title, message, [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: onConfirm },
    ]);
  }, []);
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((e) => {
      if (periodFilter && e.period !== periodFilter) return false;
      if (q) {
        const hay = `${e.title} ${e.description} ${e.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, periodFilter, searchQuery]);

  const eventsByCiv = useMemo(() => {
    const map = new Map<string, PeriodEvent[]>();
    civilizations.forEach((c) => map.set(c.id, []));
    filteredEvents.forEach((e) => {
      const arr = map.get(e.civilizationId);
      if (arr) arr.push(e);
    });
    return map;
  }, [civilizations, filteredEvents]);

  const placementsByCiv = useMemo(() => {
    const map = new Map<string, EventBarPlacement[]>();
    civilizations.forEach((c) => {
      const evts = eventsByCiv.get(c.id) || [];
      map.set(c.id, computePlacements(evts, years, rowTops, rowHeights));
    });
    return map;
  }, [civilizations, eventsByCiv, years, rowTops, rowHeights]);

  const cellDataMap = useMemo(() => {
    const map = new Map<string, CellData>();
    cellData.forEach((d) => map.set(`${d.year}-${d.civilizationId}`, d));
    return map;
  }, [cellData]);

  const renderCivColumn = useCallback(
    (civ: Civilization) => {
      const placements = placementsByCiv.get(civ.id) || [];
      const isCivSelected = selectedCivilization?.id === civ.id;
      const colLetter = civIndexToLetter(civIndex.get(civ.id) ?? 0);

      return (
        <View
          key={`col-${civ.id}`}
          style={[
            styles.civColumn,
            {
              width: cellWidth,
              height: totalHeight,
              backgroundColor: isCivSelected ? `${civ.color}0C` : "transparent",
            },
          ]}
        >
          {years.map((year, i) => {
            const isRowSel = selectedRow === year;
            const isCellSel =
              selectedCell?.year === year && selectedCell?.civilizationId === civ.id;
            const data = cellDataMap.get(`${year}-${civ.id}`);
            const rH = rowHeights[i];
            const rT = rowTops[i];
            const photos = data?.photos || [];
            const cellLabel = `${colLetter}${i + 1}`;
            const perRow = 2;
            const gap = 3;
            const photoSize = Math.max(40, (cellWidth - 14) / perRow);
            const photoRows = Math.ceil(photos.length / perRow);
            const photosBlockHeight = photoRows > 0
              ? photoRows * photoSize + Math.max(0, photoRows - 1) * gap
              : 0;

            return (
              <Pressable
                key={`c-${civ.id}-${year}`}
                style={[
                  styles.cellBg,
                  {
                    top: rT,
                    height: rH,
                    width: cellWidth,
                  },
                  showGridLines && styles.cellBgBorder,
                  isRowSel && styles.rowHighlight,
                  isCellSel && { backgroundColor: `${civ.color}26` },
                ]}
                onPress={() => {
                  if (isCellSel) {
                    onCellSelect({ year, civilizationId: civ.id });
                  }
                }}
                onLongPress={() => onCellSelect({ year, civilizationId: civ.id })}
                delayLongPress={280}
              >
                {isCellSel && (
                  <View style={styles.cellLabelTag} pointerEvents="none">
                    <Text style={styles.cellLabelText}>{cellLabel}</Text>
                  </View>
                )}

                {photos.length > 0 && (
                  <View style={[styles.photosInline, { top: 22, height: photosBlockHeight, gap }]} pointerEvents="box-none">
                    {photos.map((ph) => (
                      <View key={ph.id} style={[styles.photoTile, { width: photoSize, height: photoSize }]}>
                        <Image source={{ uri: ph.uri }} style={styles.photoTileImg} />
                        {isCellSel && (
                          <TouchableOpacity
                            style={styles.photoRemove}
                            onPress={() => confirmDelete("Fotoğraf Sil", "Bu fotoğrafı silmek istediğinize emin misiniz?", () => removeCellPhoto(year, civ.id, ph.id))}
                            hitSlop={12}
                            testID={`photo-remove-${civ.id}-${year}-${ph.id}`}
                          >
                            <X size={14} color="#fff" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {(data?.tags?.length || 0) > 0 && (
                  <View style={styles.tagsRow} pointerEvents="none">
                    {(data?.tags || []).slice(0, 3).map((t) => (
                      <View key={t} style={styles.tagMini}>
                        <Text style={styles.tagMiniText} numberOfLines={1}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {!!data?.notes && (
                  <View style={styles.notesBadge} pointerEvents="none">
                    <FileText size={9} color="#c9a227" />
                  </View>
                )}

                {isCellSel && (
                  <>
                    <View
                      style={[styles.cellSelBorder, { borderColor: civ.color }]}
                      pointerEvents="none"
                    />
                    <TouchableOpacity
                      style={styles.cellDeleteBtn}
                      onPress={() => confirmDelete("Hücreyi Temizle", `${cellLabel} hücresindeki tüm içerik silinecek.`, () => clearCell(year, civ.id))}
                      hitSlop={10}
                      testID={`cell-delete-${civ.id}-${year}`}
                    >
                      <Trash2 size={14} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}
              </Pressable>
            );
          })}

          {placements.filter(p => Math.abs(p.event.startYear - p.event.endYear) >= 1).map((p) => {
            const slotWidth = (cellWidth - 6) / (p.totalSlots || 1);
            const left = 3 + p.slot * slotWidth;
            const width = Math.max(slotWidth - 3, 16);
            const color = getEventDisplayColor(p.event);
            const showLabel = p.height > 56;
            const isEvtSel = selectedEvent?.id === p.event.id;
            return (
              <TouchableOpacity
                key={`evt-${p.event.id}`}
                activeOpacity={0.85}
                onPress={() => onEventSelect(p.event)}
                onLongPress={() => confirmDelete("Olayı Sil", `"${p.event.title}" silinecek.`, () => deleteEvent(p.event.id))}
                style={[
                  styles.eventBar,
                  {
                    top: p.top + 3,
                    height: Math.max(p.height - 4, 18),
                    left,
                    width,
                    backgroundColor: color,
                    borderLeftColor: civ.color,
                  },
                ]}
              >
                <View style={styles.eventBarGlow} pointerEvents="none" />
                {showLabel && (
                  <View style={styles.eventBarVerticalLabel}>
                    <Text style={styles.eventBarVerticalText} numberOfLines={1} ellipsizeMode="tail">
                      {p.event.title}
                    </Text>
                  </View>
                )}
                {isEvtSel && (
                  <TouchableOpacity
                    style={styles.eventDeleteBtn}
                    onPress={() => confirmDelete("Olayı Sil", `"${p.event.title}" silinecek.`, () => deleteEvent(p.event.id))}
                    hitSlop={12}
                    testID={`event-delete-${p.event.id}`}
                  >
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    },
    [
      placementsByCiv,
      selectedCivilization,
      cellWidth,
      totalHeight,
      years,
      selectedRow,
      selectedCell,
      selectedEvent,
      cellDataMap,
      showGridLines,
      onCellSelect,
      onEventSelect,
      rowHeights,
      rowTops,
      civIndex,
      confirmDelete,
      removeCellPhoto,
      deleteEvent,
      clearCell,
    ]
  );

  return (
    <View style={[styles.root, { height: totalHeight }]}>
      {civilizations.map(renderCivColumn)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
  },
  civColumn: {
    position: "relative",
    borderRightWidth: 1,
    borderRightColor: "#1f2937",
  },
  cellBg: {
    position: "absolute",
    left: 0,
  },
  cellBgBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  rowHighlight: {
    backgroundColor: "rgba(201, 162, 39, 0.11)",
  },
  cellSelBorder: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderWidth: 2,
    borderRadius: 4,
  },
  metaRow: {
    position: "absolute",
    top: 3,
    right: 3,
    flexDirection: "row",
    gap: 3,
  },
  metaBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  metaBadgeCount: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
  },
  cellBgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    resizeMode: "cover",
  },
  cellLabelTag: {
    position: "absolute",
    top: 2,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  cellLabelText: {
    color: "#c9a227",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  photosInline: {
    position: "absolute",
    top: 22,
    left: 4,
    right: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    overflow: "hidden",
  },
  photoTile: {
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  photoTileImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoRemove: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(220,20,60,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  tagsRow: {
    position: "absolute",
    bottom: 3,
    left: 4,
    right: 4,
    flexDirection: "row",
    gap: 3,
  },
  tagMini: {
    backgroundColor: "rgba(201,162,39,0.28)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    maxWidth: 60,
  },
  tagMiniText: {
    color: "#c9a227",
    fontSize: 8,
    fontWeight: "600",
  },
  notesBadge: {
    position: "absolute",
    top: 2,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 2,
    borderRadius: 3,
  },
  cellDeleteBtn: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(220,20,60,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    borderWidth: 1.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  eventDeleteBtn: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(220,20,60,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  eventBar: {
    position: "absolute",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderLeftWidth: 3,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  eventBarGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  eventBarVerticalLabel: {
    position: "absolute",
    top: 5,
    bottom: 5,
    left: 4,
    width: 16,
    backgroundColor: "rgba(2, 6, 23, 0.52)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  eventBarVerticalText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.2,
    ...(Platform.OS === "web"
      ? ({
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        } as any)
      : {
          transform: [{ rotate: "90deg" }],
        }),
  },
  eventBarTag: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  eventBarTagText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 8,
    fontWeight: "600",
  },
});

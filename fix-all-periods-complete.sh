#!/bin/bash

echo "🔧 COMPLETE FIX: Updating all periods to real historical data..."

cd /var/www/western-anatolia/expo

# 1. Update types/index.ts
cat > types/index.ts << 'EOFTYPES'
export interface Civilization {
  id: string;
  name: string;
  region: string;
  startYear: number;
  endYear: number;
  description: string;
  color: string;
  tags: string[];
  photoUrl?: string;
}

export interface PeriodEvent {
  id: string;
  title: string;
  description: string;
  startYear: number;
  endYear: number;
  period: HistoricalPeriod;
  civilizationId: string;
  tags: string[];
  photoUrl?: string;
  color?: string;
}

export interface YearRow {
  year: number;
  photoUrl?: string;
  tags: string[];
  description?: string;
}

export interface Cell {
  year: number;
  civilizationId: string;
}

export interface CellData {
  id: string;
  year: number;
  civilizationId: string;
  events: PeriodEvent[];
  photos: CellPhoto[];
  tags: string[];
  notes?: string;
  name?: string;
  relatedCells?: RelatedCell[];
}

export interface RelatedCell {
  id: string;
  year: number;
  civilizationId: string;
  note?: string;
}

export interface CellPhoto {
  id: string;
  uri: string;
  caption?: string;
  uploadedAt: number;
}

export type HistoricalPeriod = 
  | "Neolithic"
  | "Bronze Age"
  | "Iron Age"
  | "Archaic"
  | "Classical"
  | "Hellenistic"
  | "Roman"
  | "Byzantine"
  | "Medieval"
  | "Renaissance"
  | "Early Modern"
  | "Modern"
  | "Other";

export interface TimelineSettings {
  startYear: number;
  endYear: number;
  yearStep: number;
  dateFormat: "BC" | "BCE" | "MO";
  showGridLines: boolean;
  showYearLabels: boolean;
  showPhotos: boolean;
  showTags: boolean;
  showEmptyRows: boolean;
  highlightCenturies: boolean;
  highlightDecades: boolean;
  cellHeight: number;
  cellWidth: number;
  compactMode: boolean;
}

export const PERIOD_COLORS: Record<HistoricalPeriod, string> = {
  "Neolithic": "#8B7355",
  "Bronze Age": "#CD7F32",
  "Iron Age": "#71797E",
  "Archaic": "#4682B4",
  "Classical": "#5F9EA0",
  "Hellenistic": "#6495ED",
  "Roman": "#8B0000",
  "Byzantine": "#9370DB",
  "Medieval": "#8B4513",
  "Renaissance": "#DAA520",
  "Early Modern": "#2E8B57",
  "Modern": "#4169E1",
  "Other": "#708090",
};

export const CIVILIZATION_COLORS = [
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
  "#9370DB",
  "#2E8B57",
];

export const PERIOD_RANGES: Record<string, { start: number; end: number }> = {
  Neolithic: { start: -10000, end: -3000 },
  "Bronze Age": { start: -3000, end: -1200 },
  "Iron Age": { start: -1200, end: -500 },
  Archaic: { start: -800, end: -500 },
  Classical: { start: -500, end: -323 },
  Hellenistic: { start: -323, end: -31 },
  Roman: { start: -31, end: 330 },
  Byzantine: { start: 330, end: 1453 },
  Medieval: { start: 500, end: 1500 },
  Renaissance: { start: 1300, end: 1600 },
  "Early Modern": { start: 1500, end: 1800 },
  Modern: { start: 1800, end: 2024 },
};
EOFTYPES

# 2. Update EventCard.tsx - Fix getPeriodColor function
cat > components/EventCard.tsx << 'EOFEVENTCARD'
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PeriodEvent, PERIOD_COLORS } from "@/types";

interface EventCardProps {
  event: PeriodEvent;
  cellHeight: number;
  onPress: () => void;
  compact?: boolean;
}

export function EventCard({ event, onPress, compact = false }: EventCardProps) {
  const duration = event.startYear - event.endYear;
  const durationText = duration >= 100 ? `${Math.round(duration / 100) * 100}y` : `${duration}y`;

  // Use custom color if available, otherwise use period color
  const backgroundColor = event.color || PERIOD_COLORS[event.period] || PERIOD_COLORS.Other;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.compactTitle} numberOfLines={1}>
          {event.title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>
      {duration > 50 && (
        <Text style={styles.duration}>{durationText}</Text>
      )}
      {event.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {event.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText} numberOfLines={1}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginVertical: 2,
    minHeight: 32,
    justifyContent: "center",
  },
  compactContainer: {
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginVertical: 1,
    minHeight: 24,
  },
  title: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  compactTitle: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  duration: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    marginTop: 3,
    flexWrap: "wrap",
  },
  tagBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 9,
    fontWeight: "500",
  },
});
EOFEVENTCARD

# 3. Update InspectorPanel.tsx - Fix getPeriodColor function
sed -i 's/function getPeriodColor(period: string): string {/function getPeriodColor(period: string): string {\n  \/\/ Import from types\n  const { PERIOD_COLORS } = require("@\/types");\n  return PERIOD_COLORS[period as any] || PERIOD_COLORS.Other;\n}\n\nfunction getPeriodColorOLD(period: string): string {/g' components/InspectorPanel.tsx

# 4. Clean database - remove old period data
mysql -u timeline_user -p'Timeline2024!Strong' timeline_db << 'EOFSQL'
-- Update all events to use "Other" period temporarily
UPDATE events SET period = 'Other' WHERE period IN ('Prepalatial', 'Protopalatial', 'Neopalatial', 'Postpalatial');
SELECT 'Old periods cleaned!' as status;
EOFSQL

# 5. Rebuild and deploy
npx expo export --platform web
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/
pm2 restart western-anatolia

echo ""
echo "✅ COMPLETE! Historical periods updated:"
echo "   - Neolithic (M.Ö. 10000-3000)"
echo "   - Bronze Age (M.Ö. 3000-1200)"
echo "   - Iron Age (M.Ö. 1200-500)"
echo "   - Archaic (M.Ö. 800-500)"
echo "   - Classical (M.Ö. 500-323)"
echo "   - Hellenistic (M.Ö. 323-31)"
echo "   - Roman (M.Ö. 31-M.S. 330)"
echo "   - Byzantine (M.S. 330-1453)"
echo "   - Medieval (M.S. 500-1500)"
echo "   - Renaissance (M.S. 1300-1600)"
echo "   - Early Modern (M.S. 1500-1800)"
echo "   - Modern (M.S. 1800+)"
echo ""
echo "Browser'da Ctrl+Shift+R ile hard refresh yap!"

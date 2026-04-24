#!/bin/bash

echo "📱 Updating InspectorPanel for laptop + event color picker..."

# VPS'te güncelle
ssh root@31.42.127.82 << 'ENDSSH'

cd /var/www/western-anatolia/expo

# types/index.ts'i güncelle
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
  color?: string; // Özel event rengi
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

# Rebuild
npx expo export --platform web

# Deploy
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/

# Restart
pm2 restart western-anatolia

echo ""
echo "✅ Types güncellendi! Historical periods artık gerçek."
echo "Browser'da Ctrl+Shift+R ile hard refresh yap!"

ENDSSH

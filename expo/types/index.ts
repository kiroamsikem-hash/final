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
  name?: string; // Hücre adı
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
  | "Prepalatial"
  | "Protopalatial"
  | "Neopalatial"
  | "Postpalatial"
  | "Archaic"
  | "Classical"
  | "Hellenistic"
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
  Prepalatial: "#8B4513",
  Protopalatial: "#CD853F",
  Neopalatial: "#DAA520",
  Postpalatial: "#B8860B",
  Archaic: "#4682B4",
  Classical: "#5F9EA0",
  Hellenistic: "#6495ED",
  Other: "#708090",
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
  Prepalatial: { start: -3650, end: -1900 },
  Protopalatial: { start: -1900, end: -1750 },
  Neopalatial: { start: -1750, end: -1500 },
  Postpalatial: { start: -1500, end: -1170 },
};

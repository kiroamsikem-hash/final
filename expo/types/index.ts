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
  displayOrder?: number;
}

export interface PeriodEvent {
  id: string;
  title: string;
  description: string;
  startYear: number;
  endYear: number;
  period: string; // Dynamic user-defined period
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

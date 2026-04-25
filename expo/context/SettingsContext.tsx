import React, { createContext, useContext, useState, useCallback } from "react";
import { TimelineSettings } from "@/types";

const defaultSettings: TimelineSettings = {
  startYear: -500,
  endYear: -4000,
  yearStep: 50,
  dateFormat: "BC",
  showGridLines: true,
  showYearLabels: true,
  showPhotos: true,
  showTags: true,
  showEmptyRows: false,
  highlightCenturies: true,
  highlightDecades: false,
  cellHeight: 60,
  cellWidth: 160,
  compactMode: false,
  eventLabelDirection: "right",
  eventLabelFontSize: 9,
};

interface SettingsContextType {
  settings: TimelineSettings;
  updateSettings: (newSettings: Partial<TimelineSettings>) => void;
  resetSettings: () => void;
  getYearsList: () => number[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<TimelineSettings>(defaultSettings);

  const updateSettings = useCallback((newSettings: Partial<TimelineSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const getYearsList = useCallback(() => {
    const years: number[] = [];
    const { startYear, endYear, yearStep } = settings;
    
    if (startYear <= endYear) {
      for (let year = startYear; year <= endYear; year += yearStep) {
        years.push(year);
      }
    } else {
      for (let year = startYear; year >= endYear; year -= yearStep) {
        years.push(year);
      }
    }
    return years;
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings, getYearsList }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

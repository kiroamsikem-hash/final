import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Civilization, PeriodEvent, YearRow, Cell, CellData, CellPhoto } from "@/types";
import { initialCivilizations, initialEvents } from "@/data/initialData";
import { databaseService } from "@/lib/database";

interface TimelineContextType {
  civilizations: Civilization[];
  events: PeriodEvent[];
  yearRows: YearRow[];
  cellData: CellData[];
  selectedRow: number | null;
  selectedEvent: PeriodEvent | null;
  selectedCivilization: Civilization | null;
  selectedCell: Cell | null;
  setSelectedRow: (year: number | null) => void;
  setSelectedEvent: (event: PeriodEvent | null) => void;
  setSelectedCivilization: (civ: Civilization | null) => void;
  setSelectedCell: (cell: Cell | null) => void;
  addEvent: (event: PeriodEvent) => void;
  updateEvent: (event: PeriodEvent) => void;
  deleteEvent: (eventId: string) => void;
  addCivilization: (civ: Civilization) => void;
  updateCivilization: (civ: Civilization) => void;
  deleteCivilization: (civId: string) => void;
  reorderCivilizations: (fromIndex: number, toIndex: number) => void;
  importEvents: (newEvents: PeriodEvent[], newCivs?: Civilization[]) => void;
  getCellData: (year: number, civilizationId: string) => CellData | null;
  addCellPhoto: (year: number, civilizationId: string, photo: CellPhoto) => void;
  removeCellPhoto: (year: number, civilizationId: string, photoId: string) => void;
  addCellTag: (year: number, civilizationId: string, tag: string) => void;
  removeCellTag: (year: number, civilizationId: string, tag: string) => void;
  updateCellNotes: (year: number, civilizationId: string, notes: string) => void;
  updateCellName: (year: number, civilizationId: string, name: string) => void;
  addRelatedCell: (year: number, civilizationId: string, relatedYear: number, relatedCivId: string, note?: string) => void;
  removeRelatedCell: (year: number, civilizationId: string, relatedCellId: string) => void;
  clearYear: (year: number) => void;
  clearCell: (year: number, civilizationId: string) => void;
  loadInitialData: () => Promise<void>;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

const STORAGE_KEYS = {
  civilizations: "@timeline_civilizations",
  events: "@timeline_events",
  cellData: "@timeline_cell_data",
  dataLoaded: "@timeline_data_loaded",
};

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [civilizations, setCivilizations] = useState<Civilization[]>([]);
  const [events, setEvents] = useState<PeriodEvent[]>([]);
  const [yearRows, setYearRows] = useState<YearRow[]>([]);
  const [cellData, setCellData] = useState<CellData[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PeriodEvent | null>(null);
  const [selectedCivilization, setSelectedCivilization] = useState<Civilization | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  // Real-time sync: Polling every 2 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const [dbCivs, dbEvents, dbCellData] = await Promise.all([
          databaseService.getCivilizations(),
          databaseService.getEvents(),
          databaseService.getCellData()
        ]);

        if (dbCivs) {
          setCivilizations(dbCivs);
        }
        if (dbEvents) {
          setEvents(dbEvents);
        }
        if (dbCellData) {
          setCellData(dbCellData);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      // ONLY use database - no AsyncStorage
      const [dbCivs, dbEvents, dbCellData] = await Promise.all([
        databaseService.getCivilizations(),
        databaseService.getEvents(),
        databaseService.getCellData()
      ]);

      console.log("✅ Loaded data from MySQL database");
      setCivilizations(dbCivs || []);
      setEvents(dbEvents || []);
      setCellData(dbCellData || []);
    } catch (error) {
      console.error("❌ Database error:", error);
      // Show empty state if database fails
      setCivilizations([]);
      setEvents([]);
      setCellData([]);
    }
  }, []);

  const saveCivilizations = useCallback(async (civs: Civilization[]) => {
    try {
      // ONLY save to database - no AsyncStorage
      await databaseService.syncCivilizations(civs);
    } catch (error) {
      console.error("Error saving civilizations:", error);
    }
  }, []);

  const saveEvents = useCallback(async (evts: PeriodEvent[]) => {
    try {
      // ONLY save to database - no AsyncStorage
      await databaseService.syncEvents(evts);
    } catch (error) {
      console.error("Error saving events:", error);
    }
  }, []);

  const saveCellData = useCallback(async (data: CellData[]) => {
    try {
      // ONLY save to database - no AsyncStorage
      await databaseService.syncCellData(data);
    } catch (error) {
      console.error("Error saving cell data:", error);
    }
  }, []);

  const getCellData = useCallback((year: number, civilizationId: string): CellData | null => {
    return cellData.find(c => c.year === year && c.civilizationId === civilizationId) || null;
  }, [cellData]);

  const addCellPhoto = useCallback((year: number, civilizationId: string, photo: CellPhoto) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          photos: [...updated[existingIndex].photos, photo]
        };
      } else {
        const newCellData: CellData = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [photo],
          tags: [],
        };
        updated = [...prev, newCellData];
      }
      
      saveCellData(updated);
      return updated;
    });
  }, [saveCellData]);

  const removeCellPhoto = useCallback((year: number, civilizationId: string, photoId: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      if (existingIndex < 0) return prev;
      
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        photos: updated[existingIndex].photos.filter(p => p.id !== photoId)
      };
      
      saveCellData(updated);
      return updated;
    });
  }, [saveCellData]);

  const addCellTag = useCallback((year: number, civilizationId: string, tag: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      
      if (existingIndex >= 0) {
        if (prev[existingIndex].tags.includes(tag)) return prev;
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          tags: [...updated[existingIndex].tags, tag]
        };
      } else {
        const newCellData: CellData = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [],
          tags: [tag],
        };
        updated = [...prev, newCellData];
      }
      
      saveCellData(updated);
      return updated;
    });
  }, [saveCellData]);

  const removeCellTag = useCallback((year: number, civilizationId: string, tag: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      if (existingIndex < 0) return prev;
      
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        tags: updated[existingIndex].tags.filter(t => t !== tag)
      };
      
      saveCellData(updated);
      return updated;
    });
  }, [saveCellData]);

  const updateCellNotes = useCallback((year: number, civilizationId: string, notes: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          notes
        };
      } else {
        const newCellData: CellData = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [],
          tags: [],
          notes,
        };
        updated = [...prev, newCellData];
      }
      
      saveCellData(updated);
      return updated;
    });
  }, [saveCellData]);

  const updateCellName = useCallback((year: number, civilizationId: string, name: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          name: name.trim() || undefined
        };
      } else {
        const newCellData: CellData = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [],
          tags: [],
          name: name.trim() || undefined,
        };
        updated = [...prev, newCellData];
      }
      
      saveCellData(updated);
      return updated;
    });
  }, [saveCellData]);

  const addRelatedCell = useCallback((year: number, civilizationId: string, relatedYear: number, relatedCivId: string, note?: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      
      const relatedCell = {
        id: `${relatedYear}-${relatedCivId}`,
        year: relatedYear,
        civilizationId: relatedCivId,
        note,
      };
      
      if (existingIndex >= 0) {
        const existing = prev[existingIndex].relatedCells || [];
        if (existing.some(rc => rc.year === relatedYear && rc.civilizationId === relatedCivId)) {
          return prev;
        }
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          relatedCells: [...existing, relatedCell]
        };
      } else {
        const newCellData: CellData = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [],
          tags: [],
          relatedCells: [relatedCell],
        };
        updated = [...prev, newCellData];
      }
      
      saveCellData(updated);
      return updated;
    });
  }, [saveCellData]);

  const removeRelatedCell = useCallback((year: number, civilizationId: string, relatedCellId: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      if (existingIndex < 0) return prev;
      
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        relatedCells: (updated[existingIndex].relatedCells || []).filter(rc => rc.id !== relatedCellId)
      };
      
      saveCellData(updated);
      return updated;
    });
  }, [saveCellData]);

  const clearCell = useCallback((year: number, civilizationId: string) => {
    setCellData((prev) => {
      const updated = prev.filter(c => !(c.year === year && c.civilizationId === civilizationId));
      saveCellData(updated);
      return updated;
    });
    setEvents((prev) => {
      const updated = prev.filter(e => !(e.civilizationId === civilizationId && year >= e.endYear && year <= e.startYear && e.startYear === e.endYear));
      saveEvents(updated);
      return updated;
    });
  }, [saveCellData, saveEvents]);

  const clearYear = useCallback((year: number) => {
    setCellData((prev) => {
      const updated = prev.filter(c => c.year !== year);
      saveCellData(updated);
      return updated;
    });
    setEvents((prev) => {
      const updated = prev.filter(e => !(e.startYear === year && e.endYear === year));
      saveEvents(updated);
      return updated;
    });
  }, [saveCellData, saveEvents]);

  const addEvent = useCallback((event: PeriodEvent) => {
    setEvents((prev) => {
      const updated = [...prev, event];
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const updateEvent = useCallback((event: PeriodEvent) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === event.id ? event : e));
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      saveEvents(updated);
      return updated;
    });
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
  }, [saveEvents, selectedEvent]);

  const addCivilization = useCallback((civ: Civilization) => {
    setCivilizations((prev) => {
      const updated = [...prev, civ];
      saveCivilizations(updated);
      return updated;
    });
  }, [saveCivilizations]);

  const updateCivilization = useCallback((civ: Civilization) => {
    setCivilizations((prev) => {
      const updated = prev.map((c) => (c.id === civ.id ? civ : c));
      saveCivilizations(updated);
      return updated;
    });
  }, [saveCivilizations]);

  const reorderCivilizations = useCallback((fromIndex: number, toIndex: number) => {
    setCivilizations((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      saveCivilizations(updated);
      return updated;
    });
  }, [saveCivilizations]);

  const importEvents = useCallback((newEvents: PeriodEvent[], newCivs?: Civilization[]) => {
    if (newCivs && newCivs.length > 0) {
      setCivilizations((prev) => {
        const byId = new Map(prev.map((c) => [c.id, c] as const));
        newCivs.forEach((c) => byId.set(c.id, c));
        const updated = Array.from(byId.values());
        saveCivilizations(updated);
        return updated;
      });
    }
    setEvents((prev) => {
      const byId = new Map(prev.map((e) => [e.id, e] as const));
      newEvents.forEach((e) => byId.set(e.id, e));
      const updated = Array.from(byId.values());
      saveEvents(updated);
      return updated;
    });
  }, [saveCivilizations, saveEvents]);

  const deleteCivilization = useCallback((civId: string) => {
    // Delete all events related to this civilization
    setEvents((prev) => {
      const updated = prev.filter((e) => e.civilizationId !== civId);
      saveEvents(updated);
      return updated;
    });
    
    // Delete all cell data related to this civilization
    setCellData((prev) => {
      const updated = prev.filter((c) => c.civilizationId !== civId);
      saveCellData(updated);
      return updated;
    });
    
    // Delete the civilization itself
    setCivilizations((prev) => {
      const updated = prev.filter((c) => c.id !== civId);
      saveCivilizations(updated);
      return updated;
    });
    
    if (selectedCivilization?.id === civId) {
      setSelectedCivilization(null);
    }
  }, [saveCivilizations, saveEvents, saveCellData, selectedCivilization]);

  return (
    <TimelineContext.Provider
      value={{
        civilizations,
        events,
        yearRows,
        cellData,
        selectedRow,
        selectedEvent,
        selectedCivilization,
        selectedCell,
        setSelectedRow,
        setSelectedEvent,
        setSelectedCivilization,
        setSelectedCell,
        addEvent,
        updateEvent,
        deleteEvent,
        addCivilization,
        updateCivilization,
        deleteCivilization,
        reorderCivilizations,
        importEvents,
        getCellData,
        addCellPhoto,
        removeCellPhoto,
        addCellTag,
        removeCellTag,
        updateCellNotes,
        updateCellName,
        addRelatedCell,
        removeRelatedCell,
        clearYear,
        clearCell,
        loadInitialData,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
}

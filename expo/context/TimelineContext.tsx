import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { Civilization, PeriodEvent, YearRow, Cell, CellData, CellPhoto } from "@/types";
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

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [civilizations, setCivilizations] = useState<Civilization[]>([]);
  const [events, setEvents] = useState<PeriodEvent[]>([]);
  const [yearRows] = useState<YearRow[]>([]);
  const [cellData, setCellData] = useState<CellData[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PeriodEvent | null>(null);
  const [selectedCivilization, setSelectedCivilization] = useState<Civilization | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  // Track last save time - polling won't overwrite if save happened recently
  const lastSaveTimeRef = useRef<number>(0);
  const SAVE_GRACE_PERIOD = 3000; // 3 seconds after save, skip polling

  // Real-time sync: Polling every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // Skip polling if we saved recently (prevents overwriting local changes)
      const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
      if (timeSinceLastSave < SAVE_GRACE_PERIOD) {
        return;
      }

      try {
        const [dbCivs, dbEvents, dbCellData] = await Promise.all([
          databaseService.getCivilizations(),
          databaseService.getEvents(),
          databaseService.getCellData()
        ]);

        if (dbCivs) setCivilizations(dbCivs);
        if (dbEvents) setEvents(dbEvents);
        if (dbCellData) setCellData(dbCellData);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [dbCivs, dbEvents, dbCellData] = await Promise.all([
        databaseService.getCivilizations(),
        databaseService.getEvents(),
        databaseService.getCellData()
      ]);
      setCivilizations(dbCivs || []);
      setEvents(dbEvents || []);
      setCellData(dbCellData || []);
    } catch (error) {
      console.error("❌ Database error:", error);
      setCivilizations([]);
      setEvents([]);
      setCellData([]);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Save a single civilization directly (faster than syncing all)
  const saveSingleCivilization = useCallback(async (civ: Civilization) => {
    lastSaveTimeRef.current = Date.now();
    try {
      await databaseService.saveCivilization(civ);
    } catch (error) {
      console.error("❌ Error saving civilization:", error);
    }
  }, []);

  // Save a single event directly
  const saveSingleEvent = useCallback(async (event: PeriodEvent) => {
    lastSaveTimeRef.current = Date.now();
    try {
      await databaseService.saveEvent(event);
    } catch (error) {
      console.error("❌ Error saving event:", error);
    }
  }, []);

  // Save a single cell data directly
  const saveSingleCellData = useCallback(async (data: CellData) => {
    lastSaveTimeRef.current = Date.now();
    try {
      await databaseService.saveCellData(data);
    } catch (error) {
      console.error("❌ Error saving cell data:", error);
    }
  }, []);

  // Delete civilization from DB
  const deleteCivFromDB = useCallback(async (id: string) => {
    lastSaveTimeRef.current = Date.now();
    try {
      await databaseService.deleteCivilization(id);
    } catch (error) {
      console.error("❌ Error deleting civilization:", error);
    }
  }, []);

  // Delete event from DB
  const deleteEventFromDB = useCallback(async (id: string) => {
    lastSaveTimeRef.current = Date.now();
    try {
      await databaseService.deleteEvent(id);
    } catch (error) {
      console.error("❌ Error deleting event:", error);
    }
  }, []);

  const getCellData = useCallback((year: number, civilizationId: string): CellData | null => {
    return cellData.find(c => c.year === year && c.civilizationId === civilizationId) || null;
  }, [cellData]);

  const addCellPhoto = useCallback((year: number, civilizationId: string, photo: CellPhoto) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      let targetCell: CellData;

      if (existingIndex >= 0) {
        updated = [...prev];
        targetCell = {
          ...updated[existingIndex],
          photos: [...(updated[existingIndex].photos || []), photo]
        };
        updated[existingIndex] = targetCell;
      } else {
        targetCell = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [photo],
          tags: [],
        };
        updated = [...prev, targetCell];
      }

      saveSingleCellData(targetCell);
      return updated;
    });
  }, [saveSingleCellData]);

  const removeCellPhoto = useCallback((year: number, civilizationId: string, photoId: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      if (existingIndex < 0) return prev;

      const updated = [...prev];
      const targetCell = {
        ...updated[existingIndex],
        photos: updated[existingIndex].photos.filter(p => p.id !== photoId)
      };
      updated[existingIndex] = targetCell;

      saveSingleCellData(targetCell);
      return updated;
    });
  }, [saveSingleCellData]);

  const addCellTag = useCallback((year: number, civilizationId: string, tag: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      let targetCell: CellData;

      if (existingIndex >= 0) {
        if (prev[existingIndex].tags.includes(tag)) return prev;
        targetCell = {
          ...prev[existingIndex],
          tags: [...prev[existingIndex].tags, tag]
        };
        updated = [...prev];
        updated[existingIndex] = targetCell;
      } else {
        targetCell = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [],
          tags: [tag],
        };
        updated = [...prev, targetCell];
      }

      saveSingleCellData(targetCell);
      return updated;
    });
  }, [saveSingleCellData]);

  const removeCellTag = useCallback((year: number, civilizationId: string, tag: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      if (existingIndex < 0) return prev;

      const updated = [...prev];
      const targetCell = {
        ...updated[existingIndex],
        tags: updated[existingIndex].tags.filter(t => t !== tag)
      };
      updated[existingIndex] = targetCell;

      saveSingleCellData(targetCell);
      return updated;
    });
  }, [saveSingleCellData]);

  const updateCellNotes = useCallback((year: number, civilizationId: string, notes: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      let targetCell: CellData;

      if (existingIndex >= 0) {
        targetCell = { ...prev[existingIndex], notes };
        updated = [...prev];
        updated[existingIndex] = targetCell;
      } else {
        targetCell = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [],
          tags: [],
          notes,
        };
        updated = [...prev, targetCell];
      }

      saveSingleCellData(targetCell);
      return updated;
    });
  }, [saveSingleCellData]);

  const updateCellName = useCallback((year: number, civilizationId: string, name: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      let targetCell: CellData;

      if (existingIndex >= 0) {
        targetCell = { ...prev[existingIndex], name: name.trim() || undefined };
        updated = [...prev];
        updated[existingIndex] = targetCell;
      } else {
        targetCell = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [],
          tags: [],
          name: name.trim() || undefined,
        };
        updated = [...prev, targetCell];
      }

      saveSingleCellData(targetCell);
      return updated;
    });
  }, [saveSingleCellData]);

  const addRelatedCell = useCallback((year: number, civilizationId: string, relatedYear: number, relatedCivId: string, note?: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      let updated: CellData[];
      let targetCell: CellData;

      const relatedCell = {
        id: `${relatedYear}-${relatedCivId}`,
        year: relatedYear,
        civilizationId: relatedCivId,
        note,
      };

      if (existingIndex >= 0) {
        const existing = prev[existingIndex].relatedCells || [];
        if (existing.some(rc => rc.id === relatedCell.id)) return prev;
        targetCell = {
          ...prev[existingIndex],
          relatedCells: [...existing, relatedCell]
        };
        updated = [...prev];
        updated[existingIndex] = targetCell;
      } else {
        targetCell = {
          id: `${year}-${civilizationId}`,
          year,
          civilizationId,
          events: [],
          photos: [],
          tags: [],
          relatedCells: [relatedCell],
        };
        updated = [...prev, targetCell];
      }

      saveSingleCellData(targetCell);
      return updated;
    });
  }, [saveSingleCellData]);

  const removeRelatedCell = useCallback((year: number, civilizationId: string, relatedCellId: string) => {
    setCellData((prev) => {
      const existingIndex = prev.findIndex(c => c.year === year && c.civilizationId === civilizationId);
      if (existingIndex < 0) return prev;

      const updated = [...prev];
      const targetCell = {
        ...updated[existingIndex],
        relatedCells: (updated[existingIndex].relatedCells || []).filter(rc => rc.id !== relatedCellId)
      };
      updated[existingIndex] = targetCell;

      saveSingleCellData(targetCell);
      return updated;
    });
  }, [saveSingleCellData]);

  const clearCell = useCallback((year: number, civilizationId: string) => {
    lastSaveTimeRef.current = Date.now();
    setCellData((prev) => prev.filter(c => !(c.year === year && c.civilizationId === civilizationId)));
    setEvents((prev) => prev.filter(e => !(e.civilizationId === civilizationId && e.startYear === year)));
  }, []);

  const clearYear = useCallback((year: number) => {
    lastSaveTimeRef.current = Date.now();
    setCellData((prev) => prev.filter(c => c.year !== year));
    setEvents((prev) => prev.filter(e => !(e.startYear === year && e.endYear === year)));
  }, []);

  const addEvent = useCallback((event: PeriodEvent) => {
    setEvents((prev) => [...prev, event]);
    saveSingleEvent(event);
  }, [saveSingleEvent]);

  const updateEvent = useCallback((event: PeriodEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
    saveSingleEvent(event);
  }, [saveSingleEvent]);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    deleteEventFromDB(eventId);
    if (selectedEvent?.id === eventId) setSelectedEvent(null);
  }, [deleteEventFromDB, selectedEvent]);

  const addCivilization = useCallback((civ: Civilization) => {
    setCivilizations((prev) => [...prev, civ]);
    saveSingleCivilization(civ);
  }, [saveSingleCivilization]);

  const updateCivilization = useCallback((civ: Civilization) => {
    setCivilizations((prev) => prev.map((c) => (c.id === civ.id ? civ : c)));
    saveSingleCivilization(civ);
  }, [saveSingleCivilization]);

  const reorderCivilizations = useCallback((fromIndex: number, toIndex: number) => {
    setCivilizations((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      const withOrder = updated.map((civ, index) => ({ ...civ, displayOrder: index }));
      lastSaveTimeRef.current = Date.now();
      // Save all with new order
      withOrder.forEach(civ => databaseService.saveCivilization(civ));
      return withOrder;
    });
  }, []);

  const importEvents = useCallback((newEvents: PeriodEvent[], newCivs?: Civilization[]) => {
    lastSaveTimeRef.current = Date.now();
    if (newCivs && newCivs.length > 0) {
      setCivilizations((prev) => {
        const byId = new Map(prev.map((c) => [c.id, c] as const));
        newCivs.forEach((c) => byId.set(c.id, c));
        const updated = Array.from(byId.values());
        updated.forEach(civ => databaseService.saveCivilization(civ));
        return updated;
      });
    }
    setEvents((prev) => {
      const byId = new Map(prev.map((e) => [e.id, e] as const));
      newEvents.forEach((e) => byId.set(e.id, e));
      const updated = Array.from(byId.values());
      updated.forEach(event => databaseService.saveEvent(event));
      return updated;
    });
  }, []);

  const deleteCivilization = useCallback((civId: string) => {
    setEvents((prev) => prev.filter((e) => e.civilizationId !== civId));
    setCellData((prev) => prev.filter((c) => c.civilizationId !== civId));
    setCivilizations((prev) => prev.filter((c) => c.id !== civId));
    deleteCivFromDB(civId);
    if (selectedCivilization?.id === civId) setSelectedCivilization(null);
  }, [deleteCivFromDB, selectedCivilization]);

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

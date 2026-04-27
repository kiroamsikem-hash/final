import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
  Alert,
  Platform,
} from "react-native";
import {
  X,
  Plus,
  Camera,
  Image as ImageIcon,
  Tag,
  FileText,
  Trash2,
  Calendar,
  MapPin,
  Check,
  ChevronDown,
  Link2,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Cell, Civilization, PeriodEvent, CellPhoto } from "@/types";
import { useTimeline } from "@/context/TimelineContext";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface CellEditorProps {
  visible: boolean;
  onClose: () => void;
  cell: Cell | null;
  civilizations: Civilization[];
  events: PeriodEvent[];
  onAddEvent?: (event: PeriodEvent) => void;
}

// Suggested periods - user can enter any custom period
const SUGGESTED_PERIODS: string[] = [
  "Neolithic",
  "Bronze Age",
  "Iron Age",
  "Archaic",
  "Classical",
  "Hellenistic",
  "Roman",
  "Byzantine",
  "Medieval",
  "Renaissance",
  "Early Modern",
  "Modern",
  "Other",
];

const TAG_COLORS = [
  // Altın ve Kahverengi Tonları
  "#c9a227", "#DAA520", "#FFD700", "#FFA500", "#FF8C00",
  "#8B4513", "#A0522D", "#CD853F", "#D2691E", "#BC8F8F",
  
  // Mavi Tonları
  "#4682B4", "#5F9EA0", "#6495ED", "#4169E1", "#1E90FF",
  "#00BFFF", "#87CEEB", "#87CEFA", "#00CED1", "#20B2AA",
  "#48D1CC", "#40E0D0", "#7FFFD4", "#B0E0E6", "#ADD8E6",
  
  // Kırmızı ve Pembe Tonları
  "#DC143C", "#B22222", "#8B0000", "#CD5C5C", "#F08080",
  "#FA8072", "#E9967A", "#FFA07A", "#FF6347", "#FF4500",
  "#FF69B4", "#FF1493", "#C71585", "#DB7093", "#FFB6C1",
  
  // Yeşil Tonları
  "#228B22", "#32CD32", "#00FF00", "#7FFF00", "#7CFC00",
  "#ADFF2F", "#9ACD32", "#6B8E23", "#556B2F", "#8FBC8F",
  "#90EE90", "#98FB98", "#00FA9A", "#00FF7F", "#3CB371",
  "#2E8B57", "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B",
  
  // Mor ve Eflatun Tonları
  "#8A2BE2", "#9370DB", "#9932CC", "#BA55D3", "#DA70D6",
  "#EE82EE", "#DDA0DD", "#D8BFD8", "#E6E6FA", "#8B008B",
  "#800080", "#9400D3", "#9932CC", "#4B0082", "#6A5ACD",
  
  // Turuncu ve Sarı Tonları
  "#FF8C00", "#FFA500", "#FFB347", "#FFCC00", "#FFD700",
  "#FFFF00", "#FFFFE0", "#FFFACD", "#FAFAD2", "#FFEFD5",
  "#FFE4B5", "#FFDAB9", "#EEE8AA", "#F0E68C", "#BDB76B",
  
  // Gri ve Nötr Tonlar
  "#708090", "#778899", "#696969", "#808080", "#A9A9A9",
  "#C0C0C0", "#D3D3D3", "#DCDCDC", "#2F4F4F", "#556B2F",
  
  // Pastel Tonlar
  "#FFB6C1", "#FFC0CB", "#FFE4E1", "#F0E68C", "#E0FFFF",
  "#F5DEB3", "#F5F5DC", "#FFF8DC", "#FFFAF0", "#F0FFF0",
  
  // Koyu Tonlar
  "#2F4F4F", "#191970", "#000080", "#00008B", "#483D8B",
  "#8B0000", "#800000", "#8B008B", "#556B2F", "#006400",
  
  // Canlı Tonlar
  "#FF00FF", "#00FFFF", "#00FF00", "#FFFF00", "#FF0000",
  "#0000FF", "#FF1493", "#00CED1", "#FF4500", "#32CD32",
];

export function CellEditor({
  visible,
  onClose,
  cell,
  civilizations,
  events,
  onAddEvent,
}: CellEditorProps) {
  const timelineCtx = useTimeline();
  const [activeTab, setActiveTab] = useState<"events" | "photos" | "tags" | "notes" | "related" | "name">("events");
  const [newTag, setNewTag] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCellName, setNewCellName] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showRelatedCellForm, setShowRelatedCellForm] = useState(false);
  const [selectedRelatedCell, setSelectedRelatedCell] = useState<string>("");
  const [relatedNote, setRelatedNote] = useState("");

  // Event form states
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventPeriod, setEventPeriod] = useState<string>("Other");
  const [eventStartYear, setEventStartYear] = useState("");
  const [eventEndYear, setEventEndYear] = useState("");
  const [eventTags, setEventTags] = useState("");
  const [eventColor, setEventColor] = useState<string | undefined>(undefined);
  const [eventTextColor, setEventTextColor] = useState<string | undefined>(undefined);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>(SUGGESTED_PERIODS);
  const periodScrollRef = React.useRef<ScrollView>(null);

  const cellData = useMemo(() => {
    if (!cell) return null;
    return timelineCtx.getCellData(cell.year, cell.civilizationId);
  }, [cell, timelineCtx]);

  const civilization = useMemo(() => {
    if (!cell) return null;
    return civilizations.find((c) => c.id === cell.civilizationId);
  }, [cell, civilizations]);

  const cellEvents = useMemo(() => {
    if (!cell) return [];
    return events.filter(
      (e) =>
        e.civilizationId === cell.civilizationId &&
        cell.year >= e.endYear &&
        cell.year <= e.startYear
    );
  }, [cell, events]);

  const resetEventForm = useCallback(() => {
    setEventTitle("");
    setEventDescription("");
    setEventPeriod(""); // Boş başlasın, kullanıcı yazacak
    setEventStartYear(cell ? String(Math.abs(cell.year)) : "");
    setEventEndYear(cell ? String(Math.abs(cell.year)) : "");
    setEventTags("");
    setEventColor(undefined);
    setEventTextColor(undefined);
    setShowEventForm(false);
    setShowPeriodDropdown(false);
    setShowColorPicker(false);
    setShowTextColorPicker(false);
  }, [cell]);

  // Load existing notes and cell name when cell changes or modal opens
  useEffect(() => {
    if (visible && cellData) {
      setNewNote(cellData.notes || "");
      setNewCellName(cellData.name || "");
    } else if (!visible) {
      setNewNote("");
      setNewCellName("");
      resetEventForm();
    }
  }, [visible, cellData, resetEventForm]);

  // Load available periods from database - SADECE KULLANILAN DÖNEMLER (varsayılan dönemler YOK!)
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const response = await fetch('/api/postgres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getPeriods' }),
        });
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          // SADECE veritabanından gelen dönemler (senin eklediğin)
          setAvailablePeriods(result.data);
        } else {
          // Hiç dönem yoksa boş liste
          setAvailablePeriods([]);
        }
      } catch (error) {
        console.warn('Failed to load periods:', error);
        setAvailablePeriods([]);
      }
    };
    if (visible) {
      loadPeriods();
    }
  }, [visible]);

  // Reload periods when dropdown opens - HER AÇILIŞTA YENİLE
  const handleDropdownToggle = useCallback(async () => {
    if (!showPeriodDropdown) {
      // Dropdown açılıyor, dönemleri yeniden yükle
      try {
        const response = await fetch('/api/postgres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getPeriods' }),
        });
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          // SADECE veritabanından gelen dönemler
          setAvailablePeriods(result.data);
        } else {
          setAvailablePeriods([]);
        }
      } catch (error) {
        console.warn('Failed to reload periods:', error);
      }
    }
    setShowPeriodDropdown(!showPeriodDropdown);
  }, [showPeriodDropdown]);

  // Tarih scroll fonksiyonları
  const handleYearScroll = useCallback((field: 'start' | 'end', direction: 'up' | 'down') => {
    const currentValue = field === 'start' ? eventStartYear : eventEndYear;
    const currentYear = parseInt(currentValue) || 0;
    const newYear = direction === 'up' ? currentYear + 10 : currentYear - 10;
    
    if (field === 'start') {
      setEventStartYear(String(Math.max(0, newYear)));
    } else {
      setEventEndYear(String(Math.max(0, newYear)));
    }
  }, [eventStartYear, eventEndYear]);

  // Period dropdown scroll fonksiyonları
  const handlePeriodScroll = useCallback((direction: 'up' | 'down') => {
    if (periodScrollRef.current) {
      periodScrollRef.current.scrollTo({
        y: direction === 'down' ? 100 : -100,
        animated: true,
      });
    }
  }, []);

  const handleDeletePeriod = useCallback(async (period: string) => {
    Alert.alert(
      "Dönemi Sil",
      `"${period}" dönemini ve bu döneme ait TÜM olayları silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              // Bu döneme ait tüm olayları sil
              const eventsToDelete = events.filter(e => e.period === period);
              for (const event of eventsToDelete) {
                await timelineCtx.deleteEvent(event.id);
              }
              
              // Dönemleri yeniden yükle
              const response = await fetch('/api/postgres', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getPeriods' }),
              });
              const result = await response.json();
              if (result.success && result.data) {
                setAvailablePeriods(result.data.length > 0 ? result.data : SUGGESTED_PERIODS);
              }
              
              Alert.alert("Başarılı", `"${period}" dönemi ve ${eventsToDelete.length} olay silindi.`);
            } catch (error) {
              console.error('Failed to delete period:', error);
              Alert.alert("Hata", "Dönem silinirken bir hata oluştu.");
            }
          }
        }
      ]
    );
  }, [events, timelineCtx]);

  const formatYear = (year: number): string => {
    return `${Math.abs(year)} BC`;
  };

  const handleAddTag = useCallback(() => {
    if (!cell || !newTag.trim()) return;
    timelineCtx.addCellTag(cell.year, cell.civilizationId, newTag.trim());
    setNewTag("");
  }, [cell, newTag, timelineCtx]);

  const handleRemoveTag = useCallback(
    (tag: string) => {
      if (!cell) return;
      timelineCtx.removeCellTag(cell.year, cell.civilizationId, tag);
    },
    [cell, timelineCtx]
  );

  const handlePickImage = useCallback(async () => {
    if (!cell) return;
    console.log("[CellEditor] handlePickImage: starting, platform=", Platform.OS);

    try {
      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("[CellEditor] media permission:", perm.status);
        if (perm.status !== "granted") {
          Alert.alert(
            "İzin Gerekli",
            "Fotoğraf eklemek için galeri erişim izni vermeniz gerekiyor."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: Platform.OS !== "web",
        aspect: [4, 3],
        quality: 0.7,
        base64: Platform.OS === "web",
      });
      console.log("[CellEditor] pick result canceled=", result.canceled);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let uri = asset.uri;
        if (Platform.OS === "web" && asset.base64) {
          uri = `data:image/jpeg;base64,${asset.base64}`;
        }
        const photo: CellPhoto = {
          id: `photo-${Date.now()}`,
          uri,
          caption: "",
          uploadedAt: Date.now(),
        };
        timelineCtx.addCellPhoto(cell.year, cell.civilizationId, photo);
        console.log("[CellEditor] photo added", photo.id);
      }
    } catch (error) {
      console.error("[CellEditor] pick error:", error);
      Alert.alert("Hata", "Fotoğraf yüklenemedi. Tekrar deneyin.");
    }
  }, [cell, timelineCtx]);

  const handleTakePhoto = useCallback(async () => {
    if (!cell) return;
    if (Platform.OS === "web") {
      Alert.alert("Desteklenmiyor", "Kamera web sürümünde çalışmıyor. Galeriden yükleyin.");
      return;
    }

    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("İzin Gerekli", "Kamera erişim izni vermelisiniz.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        const photo: CellPhoto = {
          id: `photo-${Date.now()}`,
          uri: result.assets[0].uri,
          caption: "",
          uploadedAt: Date.now(),
        };
        timelineCtx.addCellPhoto(cell.year, cell.civilizationId, photo);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Hata", "Fotoğraf çekilemedi.");
    }
  }, [cell, timelineCtx]);

  const handleRemovePhoto = useCallback(
    (photoId: string) => {
      if (!cell) return;
      timelineCtx.removeCellPhoto(cell.year, cell.civilizationId, photoId);
    },
    [cell, timelineCtx]
  );

  const handleUpdatePhotoCaption = useCallback(
    (photoId: string, caption: string) => {
      if (!cell) return;
      timelineCtx.updateCellPhotoCaption(cell.year, cell.civilizationId, photoId, caption);
    },
    [cell, timelineCtx]
  );

  const handleSaveNotes = useCallback(() => {
    if (!cell) return;
    timelineCtx.updateCellNotes(cell.year, cell.civilizationId, newNote);
    Alert.alert("Kaydedildi", "Notlar kaydedildi.");
  }, [cell, newNote, timelineCtx]);

  useEffect(() => {
    if (!visible || activeTab !== "notes" || !cell) return;
    const timeout = setTimeout(() => {
      timelineCtx.updateCellNotes(cell.year, cell.civilizationId, newNote);
    }, 450);
    return () => clearTimeout(timeout);
  }, [visible, activeTab, cell, newNote, timelineCtx]);

  const handleSaveCellName = useCallback(() => {
    if (!cell) return;
    timelineCtx.updateCellName(cell.year, cell.civilizationId, newCellName);
    Alert.alert("Kaydedildi", "Hücre adı kaydedildi!");
  }, [cell, newCellName, timelineCtx]);

  const handleCreateEvent = useCallback(() => {
    if (!cell || !civilization) return;
    if (!eventTitle.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return;
    }

    const startYear = -parseInt(eventStartYear || "0", 10);
    const endYear = -parseInt(eventEndYear || "0", 10);

    if (isNaN(startYear) || isNaN(endYear)) {
      Alert.alert("Error", "Please enter valid years");
      return;
    }

    if (endYear > startYear) {
      Alert.alert("Error", "End year must be before start year (BC dates)");
      return;
    }

    const newEvent: PeriodEvent = {
      id: `event-${Date.now()}`,
      title: eventTitle.trim(),
      description: eventDescription.trim(),
      startYear,
      endYear,
      period: eventPeriod,
      civilizationId: cell.civilizationId,
      tags: eventTags.split(",").map(t => t.trim()).filter(Boolean),
      color: eventColor,
      textColor: eventTextColor,
    };

    timelineCtx.addEvent(newEvent);
    resetEventForm();
    Alert.alert("Success", "Event added successfully!");
  }, [cell, civilization, eventTitle, eventDescription, eventPeriod, eventStartYear, eventEndYear, eventTags, eventColor, eventTextColor, timelineCtx, resetEventForm]);

  const renderTabButton = (
    tab: "events" | "photos" | "tags" | "notes" | "related" | "name",
    label: string,
    icon: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEventForm = () => (
    <View style={styles.eventFormOverlay}>
      <View style={styles.eventFormContainer}>
        <View style={styles.eventFormHeader}>
          <Text style={styles.eventFormTitle}>📅 Yeni Olay Ekle</Text>
          <TouchableOpacity onPress={() => setShowEventForm(false)} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.eventFormScroll}
          contentContainerStyle={styles.eventFormScrollContent}
        >
          {/* Olay Başlığı */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>📝 Olay Başlığı *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Örn: Truva Savaşı, Lidya'nın Kuruluşu..."
              placeholderTextColor="#999"
              value={eventTitle}
              onChangeText={setEventTitle}
            />
          </View>

          {/* Açıklama */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>📄 Açıklama</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Olay hakkında detaylı bilgi..."
              placeholderTextColor="#999"
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Tarih Aralığı */}
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>📆 Başlangıç (MÖ) *</Text>
              <View style={styles.yearInputContainer}>
                <TextInput
                  style={styles.formInput}
                  placeholder="Örn: 1500"
                  placeholderTextColor="#999"
                  value={eventStartYear}
                  onChangeText={setEventStartYear}
                  keyboardType="number-pad"
                />
                <View style={styles.yearScrollButtons}>
                  <TouchableOpacity
                    style={styles.yearScrollButton}
                    onPress={() => handleYearScroll('start', 'up')}
                  >
                    <Text style={styles.yearScrollButtonText}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.yearScrollButton}
                    onPress={() => handleYearScroll('start', 'down')}
                  >
                    <Text style={styles.yearScrollButtonText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>📆 Bitiş (MÖ) *</Text>
              <View style={styles.yearInputContainer}>
                <TextInput
                  style={styles.formInput}
                  placeholder="Örn: 1400"
                  placeholderTextColor="#999"
                  value={eventEndYear}
                  onChangeText={setEventEndYear}
                  keyboardType="number-pad"
                />
                <View style={styles.yearScrollButtons}>
                  <TouchableOpacity
                    style={styles.yearScrollButton}
                    onPress={() => handleYearScroll('end', 'up')}
                  >
                    <Text style={styles.yearScrollButtonText}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.yearScrollButton}
                    onPress={() => handleYearScroll('end', 'down')}
                  >
                    <Text style={styles.yearScrollButtonText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Dönem */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>🏛️ Tarihsel Dönem</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={handleDropdownToggle}
            >
              <Text style={styles.dropdownButtonText}>{eventPeriod}</Text>
              <ChevronDown size={18} color="#888" />
            </TouchableOpacity>
            {showPeriodDropdown && (
              <View style={styles.dropdownMenuContainer}>
                <View style={styles.dropdownScrollButtons}>
                  <TouchableOpacity
                    style={styles.dropdownScrollButton}
                    onPress={() => handlePeriodScroll('up')}
                  >
                    <Text style={styles.dropdownScrollButtonText}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownScrollButton}
                    onPress={() => handlePeriodScroll('down')}
                  >
                    <Text style={styles.dropdownScrollButtonText}>▼</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  ref={periodScrollRef}
                  style={styles.dropdownMenu}
                  nestedScrollEnabled={true}
                >
                  {availablePeriods.length > 0 ? (
                    availablePeriods.map((period) => (
                      <View key={period} style={styles.dropdownItemContainer}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            setEventPeriod(period);
                            setShowPeriodDropdown(false);
                          }}
                        >
                          <View style={[styles.periodDot, { backgroundColor: getPeriodColor(period) }]} />
                          <Text style={[styles.dropdownItemText, eventPeriod === period && styles.dropdownItemTextActive]}>
                            {period}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deletePeriodButton}
                          onPress={() => handleDeletePeriod(period)}
                        >
                          <Trash2 size={16} color="#dc143c" />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyPeriodsContainer}>
                      <Text style={styles.emptyPeriodsText}>
                        Henüz dönem yok. Aşağıya yeni dönem adı yazın.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
            
            {/* Manuel dönem girişi */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>✏️ Veya Yeni Dönem Yazın</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Örn: Lidya Dönemi, Hitit İmparatorluğu..."
                placeholderTextColor="#999"
                value={eventPeriod}
                onChangeText={setEventPeriod}
              />
            </View>
          </View>

          {/* Etiketler */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>🏷️ Etiketler (virgülle ayırın)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Örn: savaş, sanat, ticaret"
              placeholderTextColor="#999"
              value={eventTags}
              onChangeText={setEventTags}
            />
          </View>

          {/* Renk Seçimi */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>🎨 Olay Rengi (Opsiyonel)</Text>
            <TouchableOpacity
              style={[styles.colorPreviewButton, eventColor && { backgroundColor: eventColor }]}
              onPress={() => setShowColorPicker(!showColorPicker)}
            >
              <Text style={[styles.colorPreviewText, eventColor && { color: '#fff' }]}>
                {eventColor ? "✓ Renk Seçildi" : "Renk Seç"}
              </Text>
            </TouchableOpacity>
            {showColorPicker && (
              <ScrollView style={styles.colorPickerContainer} nestedScrollEnabled={true}>
                <Text style={styles.colorPickerTitle}>🎨 Renk Seçin ({TAG_COLORS.length} renk)</Text>
                <View style={styles.colorPalette}>
                  {TAG_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        eventColor === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => {
                        setEventColor(color);
                      }}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.clearColorButton}
                  onPress={() => {
                    setEventColor(undefined);
                    setShowColorPicker(false);
                  }}
                >
                  <Text style={styles.clearColorText}>Rengi Temizle</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>

          {/* Yazı Rengi Seçimi */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>✏️ Yazı Rengi (Opsiyonel)</Text>
            <TouchableOpacity
              style={[styles.colorPreviewButton, eventTextColor && { backgroundColor: eventTextColor }]}
              onPress={() => setShowTextColorPicker(!showTextColorPicker)}
            >
              <Text style={[styles.colorPreviewText, eventTextColor && { color: '#fff' }]}>
                {eventTextColor ? "✓ Yazı Rengi Seçildi" : "Yazı Rengi Seç"}
              </Text>
            </TouchableOpacity>
            {showTextColorPicker && (
              <ScrollView style={styles.colorPickerContainer} nestedScrollEnabled={true}>
                <Text style={styles.colorPickerTitle}>✏️ Yazı Rengi Seçin ({TAG_COLORS.length} renk)</Text>
                <View style={styles.colorPalette}>
                  {TAG_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        eventTextColor === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => {
                        setEventTextColor(color);
                      }}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.clearColorButton}
                  onPress={() => {
                    setEventTextColor(undefined);
                    setShowTextColorPicker(false);
                  }}
                >
                  <Text style={styles.clearColorText}>Yazı Rengini Temizle</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>

          {/* Oluştur Butonu */}
          <TouchableOpacity style={styles.createEventButton} onPress={handleCreateEvent}>
            <Plus size={20} color="#fff" />
            <Text style={styles.createEventButtonText}>Olay Oluştur</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Events in this Cell</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowEventForm(true)}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      {cellEvents.length > 0 ? (
        <View style={styles.eventsList}>
          {cellEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View
                  style={[
                    styles.periodBadge,
                    { backgroundColor: getPeriodColor(event.period) },
                  ]}
                >
                  <Text style={styles.periodText}>{event.period}</Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
              <View style={styles.eventMeta}>
                <Calendar size={12} color="#888" />
                <Text style={styles.eventMetaText}>
                  {formatYear(event.startYear)} - {formatYear(event.endYear)}
                </Text>
              </View>
              {event.tags.length > 0 && (
                <View style={styles.eventTagsContainer}>
                  {event.tags.map((tag, idx) => (
                    <View key={idx} style={styles.eventTagBadge}>
                      <Text style={styles.eventTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#444" />
          <Text style={styles.emptyText}>No events in this cell</Text>
          <Text style={styles.emptySubtext}>
            Add an event to document what happened in {civilization?.name} during{" "}
            {cell && formatYear(cell.year)}
          </Text>
        </View>
      )}

      {showEventForm && renderEventForm()}
    </View>
  );

  const renderPhotosTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
            <Camera size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handlePickImage}>
            <ImageIcon size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {cellData?.photos && cellData.photos.length > 0 ? (
        <View style={styles.photosGrid}>
          {cellData.photos.map((photo) => (
            <View key={photo.id} style={styles.photoCard}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              <TextInput
                style={styles.photoCaptionInput}
                placeholder="Fotograf aciklamasi..."
                placeholderTextColor="#94a3b8"
                value={photo.caption || ""}
                onChangeText={(text) => handleUpdatePhotoCaption(photo.id, text)}
              />
              <TouchableOpacity
                style={styles.photoDelete}
                onPress={() => handleRemovePhoto(photo.id)}
              >
                <Trash2 size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <ImageIcon size={48} color="#444" />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>
            Add photos to visualize this time period
          </Text>
        </View>
      )}
    </View>
  );

  const renderTagsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tags</Text>
      </View>

      <View style={styles.tagInputContainer}>
        <TextInput
          style={styles.tagInput}
          placeholder="Add a tag..."
          placeholderTextColor="#666"
          value={newTag}
          onChangeText={setNewTag}
          onSubmitEditing={handleAddTag}
        />
        <TouchableOpacity style={styles.tagAddButton} onPress={handleAddTag}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {cellData?.tags && cellData.tags.length > 0 ? (
        <View style={styles.tagsGrid}>
          {cellData.tags.map((tag, index) => (
            <View
              key={tag}
              style={[
                styles.tagBadge,
                { backgroundColor: TAG_COLORS[index % TAG_COLORS.length] + "30" },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: TAG_COLORS[index % TAG_COLORS.length] },
                ]}
              >
                {tag}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                <X size={14} color={TAG_COLORS[index % TAG_COLORS.length]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Tag size={48} color="#444" />
          <Text style={styles.emptyText}>No tags</Text>
          <Text style={styles.emptySubtext}>
            Add tags to categorize this cell
          </Text>
        </View>
      )}
    </View>
  );

  const renderNotesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotes}>
          <Check size={16} color="#fff" />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.notesInput}
        placeholder="Write your notes about this time period..."
        placeholderTextColor="#666"
        value={newNote}
        onChangeText={setNewNote}
        multiline
        textAlignVertical="top"
        numberOfLines={12}
      />
    </View>
  );

  const renderNameTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hücre Adı</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveCellName}>
          <Check size={16} color="#fff" />
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.cellNameInput}
        placeholder="Bu hücreye özel bir ad verin..."
        placeholderTextColor="#666"
        value={newCellName}
        onChangeText={setNewCellName}
      />
      
      <Text style={styles.cellNameHint}>
        Ornek: Saray Donemi, Ticaret Merkezi, Kulturel Gelisim
        {"\n\n"}Bu ad, ilişkili hücreler listesinde görünecek ve hücreyi tanımlamak için kullanılacak.
      </Text>
    </View>
  );

  const handleAddRelatedCell = useCallback(() => {
    if (!cell || !selectedRelatedCell.trim()) {
      Alert.alert("Hata", "Lütfen en az bir hücre adı girin");
      return;
    }

    // Virgülle ayrılmış hücre adlarını işle
    const cellNames = selectedRelatedCell
      .split(',')
      .map(name => name.trim().toUpperCase())
      .filter(name => name.length > 0);

    if (cellNames.length === 0) {
      Alert.alert("Hata", "Geçerli hücre adları girin");
      return;
    }

    // Her hücre adı için ayrı bir ilişki ekle
    cellNames.forEach((cellName, index) => {
      const noteWithName = `${cellName}${relatedNote ? ` - ${relatedNote}` : ""}`;
      
      // Dummy year ve civId - sadece string olarak saklayacağız
      timelineCtx.addRelatedCell(
        cell.year, 
        cell.civilizationId, 
        -1000 - index, // Her hücre için farklı dummy year
        `dummy-${index}`, // Her hücre için farklı dummy civId
        noteWithName
      );
    });
    
    setSelectedRelatedCell("");
    setRelatedNote("");
    setShowRelatedCellForm(false);
    Alert.alert("Başarılı", `${cellNames.length} ilişkili hücre eklendi!`);
  }, [cell, selectedRelatedCell, relatedNote, timelineCtx]);

  const handleRemoveRelatedCell = useCallback((relatedCellId: string) => {
    if (!cell) return;
    timelineCtx.removeRelatedCell(cell.year, cell.civilizationId, relatedCellId);
  }, [cell, timelineCtx]);

  const handleViewRelatedCell = useCallback((year: number, civId: string) => {
    // Close current editor and open the related cell
    onClose();
    setTimeout(() => {
      timelineCtx.setSelectedCell({ year, civilizationId: civId });
    }, 300);
  }, [onClose, timelineCtx]);

  const renderRelatedCellForm = () => (
    <View style={styles.eventFormOverlay}>
      <View style={styles.eventFormContainer}>
        <View style={styles.eventFormHeader}>
          <Text style={styles.eventFormTitle}>İlişkili Hücreler Ekle</Text>
          <TouchableOpacity onPress={() => setShowRelatedCellForm(false)} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.eventFormScroll}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Hücre Adları * (virgülle ayırın)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Örn: A1, B2, C3"
              placeholderTextColor="#666"
              value={selectedRelatedCell}
              onChangeText={setSelectedRelatedCell}
              autoCapitalize="characters"
              autoCorrect={false}
              multiline
            />
            <Text style={styles.formHint}>
              Birden fazla hücre eklemek için virgülle ayırın: A1, B2, C3
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Not (opsiyonel)</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="İlişki hakkında not..."
              placeholderTextColor="#666"
              value={relatedNote}
              onChangeText={setRelatedNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.createEventButton} onPress={handleAddRelatedCell}>
            <Plus size={20} color="#fff" />
            <Text style={styles.createEventButtonText}>İlişkili Hücreler Ekle</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderRelatedTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>İlişkili Hücreler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowRelatedCellForm(true)}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.addButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>

      {cellData?.relatedCells && cellData.relatedCells.length > 0 ? (
        <View style={styles.relatedCellsList}>
          {cellData.relatedCells.map((related) => {
            // Note alanında hücre adı ve açıklama var
            const noteText = related.note || "";
            const parts = noteText.split(" - ");
            const cellName = parts[0] || "Bilinmeyen Hücre";
            const description = parts[1] || "";
            
            // İlişkili hücrenin fotoğraflarını al
            const relatedCellData = timelineCtx.getCellData(related.year, related.civilizationId);
            
            return (
              <TouchableOpacity
                key={related.id}
                style={styles.relatedCellCard}
                activeOpacity={0.7}
                onPress={() => handleViewRelatedCell(related.year, related.civilizationId)}
              >
                <View style={styles.relatedCellHeader}>
                  <View style={styles.relatedCellLabelContainer}>
                    <View style={styles.relatedCellLabelBadge}>
                      <Text style={styles.relatedCellLabelText}>{cellName}</Text>
                    </View>
                  </View>
                  <View style={styles.relatedCellInfo}>
                    <Text style={styles.relatedCellTitle}>
                      {cellName}
                    </Text>
                    {description && (
                      <Text style={styles.relatedCellNote} numberOfLines={2}>
                        {description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.relatedCellDelete}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveRelatedCell(related.id);
                    }}
                  >
                    <Trash2 size={16} color="#dc143c" />
                  </TouchableOpacity>
                </View>

                {/* İlişkili hücrenin fotoğraflarını göster */}
                {relatedCellData?.photos && relatedCellData.photos.length > 0 && (
                  <View style={styles.relatedCellPhotos}>
                    {relatedCellData.photos.slice(0, 4).map((photo) => (
                      <TouchableOpacity
                        key={photo.id}
                        style={styles.relatedCellPhotoContainer}
                        onPress={() => {
                          // Fotoğrafı büyük göster
                          Alert.alert("Fotoğraf", "Fotoğraf görüntüleniyor...");
                        }}
                      >
                        <Image
                          source={{ uri: photo.uri }}
                          style={styles.relatedCellPhoto}
                        />
                      </TouchableOpacity>
                    ))}
                    {relatedCellData.photos.length > 4 && (
                      <View style={styles.relatedCellPhotoMore}>
                        <Text style={styles.relatedCellPhotoMoreText}>
                          +{relatedCellData.photos.length - 4}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.relatedCellFooter}>
                  <Link2 size={12} color="#c9a227" />
                  <Text style={styles.relatedCellFooterText}>Hücreyi görüntülemek için tıkla</Text>
                  {relatedCellData?.photos && relatedCellData.photos.length > 0 && (
                    <Text style={styles.relatedCellPhotoCount}>
                      📷 {relatedCellData.photos.length} fotoğraf
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Link2 size={56} color="#444" strokeWidth={1.5} />
          <Text style={styles.emptyText}>İlişkili hücre yok</Text>
          <Text style={styles.emptySubtext}>
            Bu hucreyle iliskili diger hucreleri eklemek icin yukaridaki Ekle butonuna tiklayin.
            {"\n"}
            Örnek: Minoan A1 hücresini Mycenaean B3 ile ilişkilendirebilirsiniz.
          </Text>
        </View>
      )}

      {showRelatedCellForm && renderRelatedCellForm()}
    </View>
  );

  if (!visible || !cell || !civilization) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.panel}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.headerTop}>
                <View
                  style={[styles.civIndicator, { backgroundColor: civilization.color }]}
                />
                <Text style={styles.civName}>{civilization.name}</Text>
              </View>
              <View style={styles.headerBottom}>
                <MapPin size={14} color="#888" />
                <Text style={styles.yearText}>{formatYear(cell.year)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            {renderTabButton(
              "events",
              "Events",
              <Calendar size={16} color={activeTab === "events" ? "#c9a227" : "#888"} />
            )}
            {renderTabButton(
              "photos",
              "Photos",
              <Camera size={16} color={activeTab === "photos" ? "#c9a227" : "#888"} />
            )}
            {renderTabButton(
              "name",
              "Ad",
              <FileText size={16} color={activeTab === "name" ? "#c9a227" : "#888"} />
            )}
            {renderTabButton(
              "related",
              "İlişkili",
              <Link2 size={16} color={activeTab === "related" ? "#c9a227" : "#888"} />
            )}
            {renderTabButton(
              "tags",
              "Tags",
              <Tag size={16} color={activeTab === "tags" ? "#c9a227" : "#888"} />
            )}
            {renderTabButton(
              "notes",
              "Notes",
              <FileText size={16} color={activeTab === "notes" ? "#c9a227" : "#888"} />
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === "events" && renderEventsTab()}
            {activeTab === "photos" && renderPhotosTab()}
            {activeTab === "name" && renderNameTab()}
            {activeTab === "related" && renderRelatedTab()}
            {activeTab === "tags" && renderTagsTab()}
            {activeTab === "notes" && renderNotesTab()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function getPeriodColor(period: string): string {
  const colors: Record<string, string> = {
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
  return colors[period] || colors["Other"];
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
  },
  panel: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    width: Platform.OS === "web" ? SCREEN_WIDTH * 0.95 : SCREEN_WIDTH * 0.95,
    height: Platform.OS === "web" ? SCREEN_HEIGHT * 0.95 : SCREEN_HEIGHT * 0.95,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#475569",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerInfo: {
    flex: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  civIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  civName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  yearText: {
    fontSize: 15,
    color: "#c9a227",
    fontWeight: "600",
  },
  closeButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    flexWrap: "wrap",
    backgroundColor: "#0f172a",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#111827",
    minWidth: Platform.OS === "web" ? 110 : "auto",
  },
  tabButtonActive: {
    backgroundColor: "#c9a22720",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  tabTextActive: {
    color: "#c9a227",
  },
  scrollContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  tabContent: {
    padding: 20,
    minHeight: Platform.OS === "web" ? 500 : 300,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#f8fafc",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#c9a227",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#228B22",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  photoButtons: {
    flexDirection: "row",
    gap: 8,
  },
  photoButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#3a3a3a",
    justifyContent: "center",
    alignItems: "center",
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#c9a227",
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  periodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  periodText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f8fafc",
    flex: 1,
  },
  eventDescription: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventMetaText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  eventTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  eventTagBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  eventTagText: {
    color: "#c9a227",
    fontSize: 11,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  photoImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  photoDelete: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(220, 20, 60, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoCaptionInput: {
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#e2e8f0",
    fontSize: 12,
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tagInput: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
  },
  tagAddButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#c9a227",
    justifyContent: "center",
    alignItems: "center",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
  },
  notesInput: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    minHeight: 200,
    textAlignVertical: "top",
  },
  cellNameInput: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 2,
    borderColor: "#c9a227",
    marginBottom: 16,
  },
  cellNameHint: {
    fontSize: 13,
    color: "#888",
    lineHeight: 18,
    fontStyle: "italic",
  },
  // Event Form Styles
  eventFormOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  eventFormContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    width: Platform.OS === "web" ? SCREEN_WIDTH * 0.9 : SCREEN_WIDTH * 0.95,
    height: Platform.OS === "web" ? SCREEN_HEIGHT * 0.9 : SCREEN_HEIGHT * 0.95,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  eventFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  eventFormTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  eventFormScroll: {
    flex: 1,
  },
  eventFormScrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    borderWidth: 2,
    borderColor: "#334155",
    minHeight: 44,
  },
  yearInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  yearScrollButtons: {
    flexDirection: "column",
    gap: 4,
  },
  yearScrollButton: {
    width: 28,
    height: 20,
    borderRadius: 6,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  yearScrollButtonText: {
    color: "#c9a227",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  formHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    lineHeight: 16,
    fontStyle: "italic",
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  dropdownButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  dropdownButtonText: {
    color: "#fff",
    fontSize: 15,
  },
  dropdownMenu: {
    backgroundColor: "#111827",
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#334155",
    maxHeight: 200,
  },
  dropdownMenuContainer: {
    position: "relative",
  },
  dropdownScrollButtons: {
    position: "absolute",
    right: 8,
    top: 16,
    zIndex: 10,
    flexDirection: "column",
    gap: 4,
  },
  dropdownScrollButton: {
    backgroundColor: "#1f2937",
    borderRadius: 6,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  dropdownScrollButtonText: {
    color: "#c9a227",
    fontSize: 16,
    fontWeight: "700",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flex: 1,
  },
  dropdownItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deletePeriodButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyPeriodsContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyPeriodsText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  dropdownItemText: {
    color: "#aaa",
    fontSize: 15,
  },
  dropdownItemTextActive: {
    color: "#c9a227",
    fontWeight: "600",
  },
  periodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  createEventButton: {
    backgroundColor: "#c9a227",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  createEventButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Color Picker Styles
  colorPreviewButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  colorPreviewText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  colorPickerContainer: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#334155",
    maxHeight: 400,
  },
  colorPickerTitle: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#fff",
    borderWidth: 4,
    transform: [{ scale: 1.1 }],
  },
  clearColorButton: {
    backgroundColor: "#dc143c",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  clearColorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Related Cells Styles
  relatedCellsList: {
    gap: 12,
    paddingBottom: 20,
  },
  relatedCellCard: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#c9a227",
  },
  relatedCellHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  relatedCellLabelContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  relatedCellLabelBadge: {
    backgroundColor: "rgba(201, 162, 39, 0.2)",
    borderWidth: 1.5,
    borderColor: "#c9a227",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: "center",
  },
  relatedCellLabelText: {
    color: "#c9a227",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  relatedCellInfo: {
    flex: 1,
  },
  relatedCellTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  relatedCellYear: {
    fontSize: 13,
    fontWeight: "600",
    color: "#c9a227",
    marginBottom: 6,
  },
  relatedCellNote: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
  },
  relatedCellDelete: {
    padding: 4,
  },
  relatedCellPhotos: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  relatedCellPhotoContainer: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(201, 162, 39, 0.3)",
  },
  relatedCellPhoto: {
    width: 70,
    height: 70,
    backgroundColor: "#1f2937",
  },
  relatedCellPhotoMore: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(201, 162, 39, 0.3)",
  },
  relatedCellPhotoMoreText: {
    color: "#c9a227",
    fontSize: 14,
    fontWeight: "700",
  },
  relatedCellFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    flexWrap: "wrap",
  },
  relatedCellFooterText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    flex: 1,
  },
  relatedCellPhotoCount: {
    fontSize: 11,
    color: "#c9a227",
    fontWeight: "600",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { X, Calendar, MapPin, Tag, Info, Clock, Edit2, Trash2, Check } from "lucide-react-native";
import { Civilization, PeriodEvent } from "@/types";

interface InspectorPanelProps {
  visible: boolean;
  onClose: () => void;
  selectedYear: number | null;
  selectedEvent: PeriodEvent | null;
  selectedCivilization: Civilization | null;
  events: PeriodEvent[];
  civilizations: Civilization[];
  onUpdateCivilization?: (civ: Civilization) => void;
  onDeleteCivilization?: (civId: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function InspectorPanel({
  visible,
  onClose,
  selectedYear,
  selectedEvent,
  selectedCivilization,
  events,
  civilizations,
  onUpdateCivilization,
  onDeleteCivilization,
}: InspectorPanelProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedRegion, setEditedRegion] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  // Reset edit mode when panel closes or civilization changes
  React.useEffect(() => {
    if (!visible) {
      setEditMode(false);
    }
  }, [visible]);

  React.useEffect(() => {
    setEditMode(false);
  }, [selectedCivilization?.id]);
  const formatYear = (year: number): string => {
    return `${Math.abs(year)} BC`;
  };

  const getCivilization = (civId: string) => {
    return civilizations.find((c) => c.id === civId);
  };

  const getEventsForYear = (year: number) => {
    return events.filter((e) => year >= e.endYear && year <= e.startYear);
  };

  const handleEditCivilization = () => {
    if (selectedCivilization) {
      setEditedName(selectedCivilization.name);
      setEditedRegion(selectedCivilization.region);
      setEditedDescription(selectedCivilization.description);
      setEditMode(true);
    }
  };

  const handleSaveCivilization = () => {
    if (!selectedCivilization || !onUpdateCivilization) return;
    
    if (!editedName.trim()) {
      const msg = "Medeniyet adı boş olamaz!";
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") window.alert(msg);
      } else {
        Alert.alert("Hata", msg);
      }
      return;
    }

    const updated: Civilization = {
      ...selectedCivilization,
      name: editedName.trim(),
      region: editedRegion.trim(),
      description: editedDescription.trim(),
    };
    
    onUpdateCivilization(updated);
    setEditMode(false);
  };

  const handleDeleteCivilization = () => {
    if (!selectedCivilization || !onDeleteCivilization) return;
    
    const civEvents = events.filter((e) => e.civilizationId === selectedCivilization.id);
    const msg = `"${selectedCivilization.name}" medeniyeti ve buna bağlı ${civEvents.length} olay silinecek. Emin misiniz?`;
    
    const doDelete = () => {
      onDeleteCivilization(selectedCivilization.id);
      onClose();
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(msg)) {
        doDelete();
      }
    } else {
      Alert.alert(
        "Medeniyeti Sil",
        msg,
        [
          { text: "İptal", style: "cancel" },
          { text: "Sil", style: "destructive", onPress: doDelete },
        ]
      );
    }
  };

  const renderContent = () => {
    if (selectedEvent) {
      const civ = getCivilization(selectedEvent.civilizationId);
      return (
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.periodBadge, { backgroundColor: getPeriodColor(selectedEvent.period) }]}>
              <Text style={styles.periodText}>{selectedEvent.period}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{selectedEvent.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={14} color="#c9a227" />
              <Text style={styles.metaText}>
                {formatYear(selectedEvent.startYear)} - {formatYear(selectedEvent.endYear)}
              </Text>
            </View>
          </View>

          {civ && (
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={14} color="#c9a227" />
                <Text style={styles.metaText}>{civ.name} ({civ.region})</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.description}>{selectedEvent.description}</Text>

          {selectedEvent.tags.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Tag size={14} color="#c9a227" />
                  <Text style={styles.sectionTitle}>Tags</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {selectedEvent.tags.map((tag, index) => (
                    <View key={index} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      );
    }

    if (selectedCivilization) {
      const civEvents = events.filter((e) => e.civilizationId === selectedCivilization.id);
      return (
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.colorIndicator, { backgroundColor: selectedCivilization.color }]} />
            <View style={styles.headerActions}>
              {!editMode && (
                <>
                  <TouchableOpacity onPress={handleEditCivilization} style={styles.actionButton}>
                    <Edit2 size={18} color="#c9a227" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteCivilization} style={styles.actionButton}>
                    <Trash2 size={18} color="#dc143c" />
                  </TouchableOpacity>
                </>
              )}
              {editMode && (
                <TouchableOpacity onPress={handleSaveCivilization} style={styles.actionButton}>
                  <Check size={18} color="#228B22" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {editMode ? (
            <>
              <TextInput
                style={styles.editInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Medeniyet adı"
                placeholderTextColor="#666"
              />
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color="#c9a227" />
                  <TextInput
                    style={styles.editInputSmall}
                    value={editedRegion}
                    onChangeText={setEditedRegion}
                    placeholder="Bölge"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#c9a227" />
                  <Text style={styles.metaText}>
                    {formatYear(selectedCivilization.startYear)} - {formatYear(selectedCivilization.endYear)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <TextInput
                style={styles.editTextArea}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Açıklama"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>{selectedCivilization.name}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color="#c9a227" />
                  <Text style={styles.metaText}>{selectedCivilization.region}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#c9a227" />
                  <Text style={styles.metaText}>
                    {formatYear(selectedCivilization.startYear)} - {formatYear(selectedCivilization.endYear)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.description}>{selectedCivilization.description}</Text>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={14} color="#c9a227" />
              <Text style={styles.sectionTitle}>Events ({civEvents.length})</Text>
            </View>
            <View style={styles.eventsList}>
              {civEvents.slice(0, 5).map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={[styles.eventDot, { backgroundColor: getPeriodColor(event.period) }]} />
                  <Text style={styles.eventItemText} numberOfLines={1}>{event.title}</Text>
                </View>
              ))}
            </View>
          </View>

          {selectedCivilization.tags.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Tag size={14} color="#c9a227" />
                  <Text style={styles.sectionTitle}>Tags</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {selectedCivilization.tags.map((tag, index) => (
                    <View key={index} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      );
    }

    if (selectedYear !== null) {
      const yearEvents = getEventsForYear(selectedYear);
      return (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.yearTitle}>{formatYear(selectedYear)}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Events this Year</Text>
            {yearEvents.length > 0 ? (
              <View style={styles.eventsList}>
                {yearEvents.map((event) => {
                  const civ = getCivilization(event.civilizationId);
                  return (
                    <View key={event.id} style={styles.eventItem}>
                      <View style={[styles.eventDot, { backgroundColor: civ?.color || "#888" }]} />
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventItemText} numberOfLines={1}>{event.title}</Text>
                        {civ && <Text style={styles.eventCivText}>{civ.name}</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noEventsText}>No major events recorded for this year.</Text>
            )}
          </View>
        </View>
      );
    }

    return null;
  };

  if (!visible) return null;

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
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function getPeriodColor(period: string): string {
  const colors: Record<string, string> = {
    Prepalatial: "#8B4513",
    Protopalatial: "#CD853F",
    Neopalatial: "#DAA520",
    Postpalatial: "#B8860B",
    Archaic: "#4682B4",
    Classical: "#5F9EA0",
    Hellenistic: "#6495ED",
    Other: "#708090",
  };
  return colors[period] || colors.Other;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  panel: {
    backgroundColor: "#2a2a2a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
    minHeight: 200,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#555",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    padding: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  editInput: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#c9a227",
  },
  editInputSmall: {
    flex: 1,
    color: "#aaa",
    fontSize: 14,
    backgroundColor: "#3a3a3a",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#555",
  },
  editTextArea: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#555",
  },
  periodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  periodText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#c9a227",
  },
  metaRow: {
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#aaa",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#3a3a3a",
    marginVertical: 16,
  },
  description: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagBadge: {
    backgroundColor: "#3a3a3a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  tagText: {
    color: "#c9a227",
    fontSize: 12,
    fontWeight: "500",
  },
  eventsList: {
    gap: 10,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventInfo: {
    flex: 1,
  },
  eventItemText: {
    color: "#fff",
    fontSize: 14,
  },
  eventCivText: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  noEventsText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
});

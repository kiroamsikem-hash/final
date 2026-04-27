import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PeriodEvent } from "@/types";

interface EventCardProps {
  event: PeriodEvent;
  cellHeight: number;
  onPress: () => void;
  compact?: boolean;
}

export function EventCard({ event, onPress, compact = false }: EventCardProps) {
  const duration = event.startYear - event.endYear;
  const durationText = duration >= 100 ? `${Math.round(duration / 100) * 100}y` : `${duration}y`;

  // Use event's custom color if available, otherwise use period color
  const backgroundColor = event.color 
    ? event.color // Kullanıcının seçtiği renk direkt kullanılacak
    : getEventColor(event.period);
  
  // Use event's custom text color if available, otherwise use white
  const textColor = event.textColor || "#fff";

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.compactTitle, { color: textColor }]} numberOfLines={1}>
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
      <Text style={[styles.title, { color: textColor, textShadowColor: 'transparent' }]} numberOfLines={2}>
        {event.title}
      </Text>
      {duration > 50 && (
        <Text style={[styles.duration, { color: textColor }]}>{durationText}</Text>
      )}
      {event.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {event.tags.slice(0, 1).map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={[styles.tagText, { color: textColor }]} numberOfLines={1}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

function getEventColor(period: string): string {
  // Inline color mapping - no dependency on types export
  const periodColors: Record<string, string> = {
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
  
  return periodColors[period] || periodColors["Other"];
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 2,
    minHeight: 36,
    justifyContent: "center",
  },
  compactContainer: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginVertical: 1,
    minHeight: 28,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
  },
  compactTitle: {
    fontSize: 11,
    fontWeight: "600",
  },
  duration: {
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
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 9,
    fontWeight: "500",
  },
});

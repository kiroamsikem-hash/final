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
    ? `${event.color}dd` // Add alpha for transparency
    : getEventColor(event.period);

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
          {event.tags.slice(0, 1).map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText} numberOfLines={1}>{tag}</Text>
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
  
  const baseColor = periodColors[period] || periodColors["Other"];
  // Convert hex to rgba with 0.85 opacity
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.85)`;
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

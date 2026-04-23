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

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: getEventColor(event.period) }]}
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
      style={[styles.container, { backgroundColor: getEventColor(event.period) }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.title} numberOfLines={1}>
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
  const colors: Record<string, string> = {
    Prepalatial: "rgba(139, 69, 19, 0.85)",
    Protopalatial: "rgba(205, 133, 63, 0.85)",
    Neopalatial: "rgba(218, 165, 32, 0.85)",
    Postpalatial: "rgba(184, 134, 11, 0.85)",
    Archaic: "rgba(70, 130, 180, 0.85)",
    Classical: "rgba(95, 158, 160, 0.85)",
    Hellenistic: "rgba(100, 149, 237, 0.85)",
    Other: "rgba(112, 128, 144, 0.85)",
  };
  return colors[period] || colors.Other;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginVertical: 1,
    minHeight: 24,
    justifyContent: "center",
  },
  compactContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginVertical: 1,
  },
  title: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  compactTitle: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "500",
  },
  duration: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 8,
    marginTop: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    marginTop: 2,
    flexWrap: "wrap",
  },
  tagBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  tagText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 7,
  },
});

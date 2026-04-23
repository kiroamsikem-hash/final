import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Civilization } from "@/types";

interface TimelineHeaderProps {
  civilizations: Civilization[];
  cellWidth: number;
  onCivilizationSelect: (civ: Civilization) => void;
  selectedCivilization: Civilization | null;
}

export function TimelineHeader({
  civilizations,
  cellWidth,
  onCivilizationSelect,
  selectedCivilization,
}: TimelineHeaderProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Empty space for period and year columns */}
        <View style={{ width: 180 }} />
        
        {civilizations.map((civ) => (
          <TouchableOpacity
            key={civ.id}
            style={[
              styles.civilizationHeader,
              { width: cellWidth, borderLeftColor: civ.color },
              selectedCivilization?.id === civ.id && styles.selectedHeader,
            ]}
            onPress={() => onCivilizationSelect(civ)}
          >
            <View style={[styles.colorIndicator, { backgroundColor: civ.color }]} />
            <Text style={styles.civilizationName} numberOfLines={1}>
              {civ.name}
            </Text>
            <Text style={styles.civilizationRegion} numberOfLines={1}>
              {civ.region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2a2a2a",
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  scrollContent: {
    flexDirection: "row",
    paddingRight: 20,
  },
  civilizationHeader: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderLeftWidth: 3,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedHeader: {
    backgroundColor: "rgba(201, 162, 39, 0.15)",
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  civilizationName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  civilizationRegion: {
    color: "#888",
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
});

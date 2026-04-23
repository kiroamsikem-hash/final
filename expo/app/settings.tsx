import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ChevronLeft, RotateCcw, Save } from "lucide-react-native";

import { useSettings } from "../context/SettingsContext";
import { TimelineSettings } from "../types";

// Unique identifier: wa-chron-settings-2024

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const YEAR_STEPS = [1, 5, 10, 25, 50, 100, 200, 500];

const DATE_FORMATS: Array<{ value: TimelineSettings["dateFormat"]; label: string }> = [
  { value: "BC", label: "BC (Before Christ)" },
  { value: "BCE", label: "BCE (Before Common Era)" },
  { value: "MO", label: "M.Ö. (Milattan Önce)" },
];

const RANGE_PRESETS = [
  { name: "Bronze Age", startYear: -3300, endYear: -1200 },
  { name: "Iron Age", startYear: -1200, endYear: -500 },
  { name: "All History", startYear: -500, endYear: -4000 },
  { name: "Last 1000 Years", startYear: -500, endYear: -1500 },
];

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, resetSettings } = useSettings();

  const applyRangePreset = useCallback(
    (preset: (typeof RANGE_PRESETS)[0]) => {
      updateSettings({
        startYear: preset.startYear,
        endYear: preset.endYear,
      });
    },
    [updateSettings]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
          <RotateCcw size={20} color="#c9a227" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Range Presets */}
        <Section title="Year Range">
          <View style={styles.presetGrid}>
            {RANGE_PRESETS.map((preset) => {
              const isActive =
                settings.startYear === preset.startYear &&
                settings.endYear === preset.endYear;
              return (
                <TouchableOpacity
                  key={preset.name}
                  style={[styles.presetButton, isActive && styles.presetButtonActive]}
                  onPress={() => applyRangePreset(preset)}
                >
                  <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Year Step */}
        <Section title="Year Step">
          <View style={styles.stepGrid}>
            {YEAR_STEPS.map((step) => {
              const isActive = settings.yearStep === step;
              return (
                <TouchableOpacity
                  key={step}
                  style={[styles.stepButton, isActive && styles.stepButtonActive]}
                  onPress={() => updateSettings({ yearStep: step })}
                >
                  <Text style={[styles.stepText, isActive && styles.stepTextActive]}>
                    {step}y
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Date Format */}
        <Section title="Date Format">
          {DATE_FORMATS.map((format) => {
            const isActive = settings.dateFormat === format.value;
            return (
              <TouchableOpacity
                key={format.value}
                style={styles.formatRow}
                onPress={() => updateSettings({ dateFormat: format.value })}
              >
                <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.formatText}>{format.label}</Text>
              </TouchableOpacity>
            );
          })}
        </Section>

        {/* Display Options */}
        <Section title="Display">
          <Toggle
            label="Show Grid Lines"
            value={settings.showGridLines}
            onChange={(v) => updateSettings({ showGridLines: v })}
          />
          <Toggle
            label="Show Year Labels"
            value={settings.showYearLabels}
            onChange={(v) => updateSettings({ showYearLabels: v })}
          />
          <Toggle
            label="Show Photos"
            value={settings.showPhotos}
            onChange={(v) => updateSettings({ showPhotos: v })}
          />
          <Toggle
            label="Show Tags"
            value={settings.showTags}
            onChange={(v) => updateSettings({ showTags: v })}
          />
          <Toggle
            label="Highlight Centuries"
            value={settings.highlightCenturies}
            onChange={(v) => updateSettings({ highlightCenturies: v })}
          />
          <Toggle
            label="Highlight Decades"
            value={settings.highlightDecades}
            onChange={(v) => updateSettings({ highlightDecades: v })}
          />
          <Toggle
            label="Compact Mode"
            value={settings.compactMode}
            onChange={(v) => updateSettings({ compactMode: v })}
          />
        </Section>

        {/* Cell Size */}
        <Section title="Cell Size">
          <SliderControl
            label="Height"
            value={settings.cellHeight}
            min={40}
            max={120}
            step={10}
            onChange={(v) => updateSettings({ cellHeight: v })}
          />
          <SliderControl
            label="Width"
            value={settings.cellWidth}
            min={120}
            max={300}
            step={20}
            onChange={(v) => updateSettings({ cellWidth: v })}
          />
        </Section>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#444", true: "#c9a227" }}
        thumbColor={value ? "#fff" : "#888"}
      />
    </View>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.sliderControl}>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}px</Text>
      </View>
      <View style={styles.sliderRow}>
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={styles.sliderButtonText}>−</Text>
        </TouchableOpacity>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${pct}%` }]} />
        </View>
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={styles.sliderButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#2a2a2a",
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  resetButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c9a227",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  presetButtonActive: {
    backgroundColor: "rgba(201, 162, 39, 0.2)",
    borderColor: "#c9a227",
  },
  presetText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  presetTextActive: {
    color: "#c9a227",
    fontWeight: "600",
  },
  stepGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stepButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#2a2a2a",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    minWidth: 52,
    alignItems: "center",
  },
  stepButtonActive: {
    backgroundColor: "rgba(201, 162, 39, 0.2)",
    borderColor: "#c9a227",
  },
  stepText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "500",
  },
  stepTextActive: {
    color: "#c9a227",
    fontWeight: "600",
  },
  formatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioOuterActive: {
    borderColor: "#c9a227",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#c9a227",
  },
  formatText: {
    color: "#fff",
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  toggleLabel: {
    color: "#fff",
    fontSize: 15,
  },
  sliderControl: {
    marginBottom: 16,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sliderLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  sliderValue: {
    color: "#c9a227",
    fontSize: 14,
    fontWeight: "600",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderButton: {
    width: 32,
    height: 32,
    backgroundColor: "#2a2a2a",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  sliderButtonText: {
    color: "#c9a227",
    fontSize: 18,
    fontWeight: "600",
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#2a2a2a",
    borderRadius: 3,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#c9a227",
    borderRadius: 3,
  },
  footer: {
    height: 40,
  },
});

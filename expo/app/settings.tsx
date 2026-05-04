import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ChevronLeft, RotateCcw, Mail } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { useSettings } from "../context/SettingsContext";
import { TimelineSettings } from "../types";
import { saveLanguage } from "../lib/i18n";
import { showToast } from "../components/Toast";
import { sendBackupEmailFromClient } from "../lib/backup";

// Unique identifier: wa-chron-settings-2024

const YEAR_STEPS = [1, 5, 10, 25, 50, 100, 200, 500];

const LANGUAGES = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

const DATE_FORMATS: { value: TimelineSettings["dateFormat"]; label: string }[] = [
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
  const { t, i18n } = useTranslation();
  const { width: viewportWidth } = useWindowDimensions();
  const [backupBusy, setBackupBusy] = React.useState<boolean>(false);

  const onSendBackup = useCallback(async () => {
    if (backupBusy) return;
    setBackupBusy(true);
    try {
      showToast("Yedek hazırlanıyor...", "info");
      const r = await sendBackupEmailFromClient();
      if (r.ok) {
        showToast(
          `Yedek gönderildi${r.to ? " → " + r.to : ""} (${r.attachedArticles ?? 0}/${r.totalArticles ?? 0} depo dosyası eklendi)`,
          "success"
        );
      } else {
        showToast(`Yedek başarısız: ${r.message}`, "error");
      }
    } catch (err: any) {
      showToast(`Hata: ${err?.message || err}`, "error");
    } finally {
      setBackupBusy(false);
    }
  }, [backupBusy]);
  const isWideWeb = Platform.OS === "web" && viewportWidth >= 1200;

  const changeLanguage = useCallback(
    async (languageCode: string) => {
      await i18n.changeLanguage(languageCode);
      await saveLanguage(languageCode);
      if (typeof window !== "undefined") {
        showToast(t("settings.languageChanged"), "success");
      }
    },
    [i18n, t]
  );

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
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
          <RotateCcw size={20} color="#c9a227" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWideWeb && styles.scrollContentWide]}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selection */}
        <Section title={t("settings.language")} wide={isWideWeb}>
          <View style={styles.languageGrid}>
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.languageButton, isActive && styles.languageButtonActive]}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[styles.languageText, isActive && styles.languageTextActive]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Range Presets */}
        <Section title={t("settings.display")} wide={isWideWeb}>
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
        <Section title="Year Step" wide={isWideWeb}>
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
        <Section title="Date Format" wide={isWideWeb}>
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
        <Section title={t("settings.display")} wide={isWideWeb}>
          <Toggle
            label={t("settings.showGridLines") || "Show Grid Lines"}
            value={settings.showGridLines}
            onChange={(v) => updateSettings({ showGridLines: v })}
          />
          <Toggle
            label={t("settings.showYearLabels") || "Show Year Labels"}
            value={settings.showYearLabels}
            onChange={(v) => updateSettings({ showYearLabels: v })}
          />
          <Toggle
            label={t("settings.showPhotos") || "Show Photos"}
            value={settings.showPhotos}
            onChange={(v) => updateSettings({ showPhotos: v })}
          />
          <Toggle
            label={t("settings.showTags") || "Show Tags"}
            value={settings.showTags}
            onChange={(v) => updateSettings({ showTags: v })}
          />
          <Toggle
            label={t("settings.highlightCenturies") || "Highlight Centuries"}
            value={settings.highlightCenturies}
            onChange={(v) => updateSettings({ highlightCenturies: v })}
          />
          <Toggle
            label={t("settings.highlightDecades") || "Highlight Decades"}
            value={settings.highlightDecades}
            onChange={(v) => updateSettings({ highlightDecades: v })}
          />
          <Toggle
            label={t("settings.compactMode") || "Compact Mode"}
            value={settings.compactMode}
            onChange={(v) => updateSettings({ compactMode: v })}
          />
        </Section>

        {/* Cell Size */}
        <Section title="Cell Size" wide={isWideWeb}>
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

        {/* Event Label */}
        <Section title="Event Label" wide={isWideWeb}>
          <View style={styles.stepGrid}>
            <TouchableOpacity
              style={[
                styles.stepButton,
                settings.eventLabelDirection === "left" && styles.stepButtonActive,
              ]}
              onPress={() => updateSettings({ eventLabelDirection: "left" })}
            >
              <Text
                style={[
                  styles.stepText,
                  settings.eventLabelDirection === "left" && styles.stepTextActive,
                ]}
              >
                Sola Baksin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.stepButton,
                settings.eventLabelDirection === "right" && styles.stepButtonActive,
              ]}
              onPress={() => updateSettings({ eventLabelDirection: "right" })}
            >
              <Text
                style={[
                  styles.stepText,
                  settings.eventLabelDirection === "right" && styles.stepTextActive,
                ]}
              >
                Saga Baksin
              </Text>
            </TouchableOpacity>
          </View>
          <SliderControl
            label="Yazi Boyutu"
            value={settings.eventLabelFontSize}
            min={8}
            max={14}
            step={1}
            onChange={(v) => updateSettings({ eventLabelFontSize: v })}
          />
        </Section>

        <Section title="Yedekleme (E-posta)" wide={isWideWeb}>
          <Text style={styles.backupHint}>
            Tüm zaman çizelgesi verisi (medeniyetler, olaylar, hücre verileri, fotoğraflar ve depo dosyaları) e-posta ile gönderilir.
            Sunucu ayrıca her gün otomatik yedek atar.
          </Text>
          <TouchableOpacity
            style={[styles.backupBtn, backupBusy && styles.backupBtnBusy]}
            onPress={onSendBackup}
            disabled={backupBusy}
            testID="backup-send-btn"
          >
            <Mail size={18} color={backupBusy ? "#94a3b8" : "#0b0e14"} />
            <Text style={[styles.backupBtnText, backupBusy && styles.backupBtnTextBusy]}>
              {backupBusy ? "Gönderiliyor..." : "E-posta ile Yedek Gönder"}
            </Text>
          </TouchableOpacity>
        </Section>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <View style={[styles.section, wide && styles.sectionWide]}>
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
    backgroundColor: "#0b1220",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f8fafc",
  },
  resetButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  scrollContentWide: {
    maxWidth: 1240,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    alignItems: "flex-start",
  },
  section: {
    marginBottom: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionWide: {
    width: "49%",
    marginBottom: 14,
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
    backgroundColor: "#111827",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  presetButtonActive: {
    backgroundColor: "rgba(201, 162, 39, 0.2)",
    borderColor: "#c9a227",
  },
  presetText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
  },
  presetTextActive: {
    color: "#c9a227",
    fontWeight: "600",
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111827",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 8,
  },
  languageButtonActive: {
    backgroundColor: "rgba(201, 162, 39, 0.2)",
    borderColor: "#c9a227",
  },
  languageFlag: {
    fontSize: 20,
  },
  languageText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
  },
  languageTextActive: {
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
    backgroundColor: "#111827",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
    minWidth: 52,
    alignItems: "center",
  },
  stepButtonActive: {
    backgroundColor: "rgba(201, 162, 39, 0.2)",
    borderColor: "#c9a227",
  },
  stepText: {
    color: "#cbd5e1",
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
    borderBottomColor: "#1f2937",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#475569",
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
    color: "#f8fafc",
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  toggleLabel: {
    color: "#e2e8f0",
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
    color: "#cbd5e1",
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
    backgroundColor: "#111827",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  sliderButtonText: {
    color: "#c9a227",
    fontSize: 18,
    fontWeight: "600",
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#1f2937",
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
  backupHint: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  backupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#c9a227",
  },
  backupBtnBusy: {
    backgroundColor: "#374151",
  },
  backupBtnText: {
    color: "#0b0e14",
    fontSize: 14,
    fontWeight: "800",
  },
  backupBtnTextBusy: {
    color: "#94a3b8",
  },
});

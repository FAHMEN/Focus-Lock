import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import {
  getRelapseLogs,
  getDailyPattern,
  getWeeklyPattern,
  getRiskWindows,
  formatHour,
  RelapseLog,
} from "@/lib/storage";

export default function PatternsScreen() {
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<RelapseLog[]>([]);
  const [dailyPattern, setDailyPattern] = useState<{ date: string; count: number }[]>([]);
  const [weeklyPattern, setWeeklyPattern] = useState<{ week: string; count: number }[]>([]);
  const [riskWindows, setRiskWindows] = useState<{ start: number; end: number; count: number }[]>([]);

  const loadData = useCallback(async () => {
    const logsData = await getRelapseLogs();
    setLogs(logsData);
    setDailyPattern(getDailyPattern(logsData, 7));
    setWeeklyPattern(getWeeklyPattern(logsData, 4));
    setRiskWindows(getRiskWindows(logsData));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const maxDaily = Math.max(...dailyPattern.map((d) => d.count), 1);
  const maxWeekly = Math.max(...weeklyPattern.map((w) => w.count), 1);

  const renderBar = (count: number, max: number) => {
    const width = Math.max(1, Math.floor((count / max) * 20));
    return Array(width).fill("|").join("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="body" style={styles.emptyText}>
            No data yet
          </ThemedText>
        </View>
      ) : (
        <>
          {riskWindows.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="alert-triangle" size={16} color="#666666" />
                <ThemedText type="h4" style={styles.sectionTitle}>
                  Risk Windows
                </ThemedText>
              </View>
              {riskWindows.slice(0, 3).map((window, index) => (
                <View key={index} style={styles.riskItem}>
                  <ThemedText type="body" style={styles.riskText}>
                    {formatHour(window.start)} - {formatHour(window.end)}
                  </ThemedText>
                  <ThemedText type="small" style={styles.riskCount}>
                    {window.count} occurrences
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Last 7 Days
            </ThemedText>
            {dailyPattern.map((day, index) => (
              <View key={index} style={styles.patternRow}>
                <ThemedText type="small" style={styles.patternLabel}>
                  {day.date}
                </ThemedText>
                <ThemedText type="small" style={styles.patternBar}>
                  {renderBar(day.count, maxDaily)}
                </ThemedText>
                <ThemedText type="small" style={styles.patternCount}>
                  {day.count}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Last 4 Weeks
            </ThemedText>
            {weeklyPattern.map((week, index) => (
              <View key={index} style={styles.patternRow}>
                <ThemedText type="small" style={styles.patternLabel}>
                  {week.week}
                </ThemedText>
                <ThemedText type="small" style={styles.patternBar}>
                  {renderBar(week.count, maxWeekly)}
                </ThemedText>
                <ThemedText type="small" style={styles.patternCount}>
                  {week.count}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Total
            </ThemedText>
            <ThemedText type="h1" style={styles.totalNumber}>
              {logs.length}
            </ThemedText>
            <ThemedText type="small" style={styles.totalLabel}>
              logged occurrences
            </ThemedText>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    color: "#666666",
  },
  section: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: "#000000",
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  riskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  riskText: {
    color: "#000000",
  },
  riskCount: {
    color: "#666666",
  },
  patternRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  patternLabel: {
    width: 40,
    color: "#666666",
  },
  patternBar: {
    flex: 1,
    color: "#000000",
    fontFamily: "monospace",
    letterSpacing: -2,
  },
  patternCount: {
    width: 30,
    textAlign: "right",
    color: "#000000",
  },
  totalNumber: {
    color: "#000000",
    textAlign: "center",
  },
  totalLabel: {
    color: "#666666",
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});

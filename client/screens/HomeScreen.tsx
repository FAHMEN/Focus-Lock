import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  getRelapseLogs,
  getSettings,
  getCurrentStreak,
  getTodayRelapseCount,
  getRiskWindows,
  formatHour,
  RelapseLog,
  Settings,
} from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [logs, setLogs] = useState<RelapseLog[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [riskWarning, setRiskWarning] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [logsData, settingsData] = await Promise.all([
      getRelapseLogs(),
      getSettings(),
    ]);
    setLogs(logsData);
    setSettings(settingsData);
    setStreak(getCurrentStreak(logsData));
    setTodayCount(getTodayRelapseCount(logsData));

    const riskWindows = getRiskWindows(logsData);
    if (riskWindows.length > 0) {
      const currentHour = new Date().getHours();
      const upcomingRisk = riskWindows.find(
        (w) => currentHour >= w.start - 1 && currentHour < w.end
      );
      if (upcomingRisk) {
        setRiskWarning(
          `High risk: ${formatHour(upcomingRisk.start)} - ${formatHour(upcomingRisk.end)}`
        );
      } else {
        setRiskWarning(null);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSlipped = () => {
    navigation.navigate("ReplacementAction");
  };

  const handleStartFocus = () => {
    if (settings) {
      navigation.navigate("FocusSession", { duration: settings.focusDuration });
    }
  };

  const handleViewPatterns = () => {
    navigation.navigate("Patterns");
  };

  const handleSettings = () => {
    if (settings && !settings.isFirstSetup && streak < settings.unlockThreshold) {
      Alert.alert(
        "Settings Locked",
        `Build a ${settings.unlockThreshold}-day streak to unlock settings.\nCurrent streak: ${streak} days`
      );
      return;
    }
    navigation.navigate("Settings");
  };

  const isSettingsLocked = settings && !settings.isFirstSetup && streak < settings.unlockThreshold;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="lock" size={24} color="#000000" />
        </View>
        <ThemedText type="h3" style={styles.headerTitle}>
          Focus Lock
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ThemedText type="h1" style={styles.statNumber}>
            {streak}
          </ThemedText>
          <ThemedText type="label" style={styles.statLabel}>
            Day Streak
          </ThemedText>
        </View>
        <View style={styles.stat}>
          <ThemedText type="h1" style={styles.statNumber}>
            {todayCount}
          </ThemedText>
          <ThemedText type="label" style={styles.statLabel}>
            Today
          </ThemedText>
        </View>
      </View>

      {riskWarning ? (
        <View style={styles.warningBanner}>
          <Feather name="alert-triangle" size={16} color="#666666" />
          <ThemedText type="small" style={styles.warningText}>
            {riskWarning}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          onPress={handleSlipped}
        >
          <ThemedText type="button" style={styles.primaryButtonText}>
            I Slipped
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          onPress={handleStartFocus}
        >
          <Feather name="target" size={20} color="#000000" style={styles.buttonIcon} />
          <ThemedText type="button" style={styles.secondaryButtonText}>
            Start Focus Session
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          onPress={handleViewPatterns}
        >
          <Feather name="bar-chart-2" size={20} color="#000000" style={styles.buttonIcon} />
          <ThemedText type="button" style={styles.secondaryButtonText}>
            View Patterns
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            isSettingsLocked && styles.disabledButton,
            pressed && !isSettingsLocked && styles.secondaryButtonPressed,
          ]}
          onPress={handleSettings}
        >
          <Feather
            name={isSettingsLocked ? "lock" : "settings"}
            size={20}
            color={isSettingsLocked ? "#CCCCCC" : "#000000"}
            style={styles.buttonIcon}
          />
          <ThemedText
            type="button"
            style={[
              styles.secondaryButtonText,
              isSettingsLocked && styles.disabledText,
            ]}
          >
            Settings
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    marginRight: Spacing.sm,
  },
  headerTitle: {
    color: "#000000",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E6E6E6",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    color: "#000000",
  },
  statLabel: {
    color: "#666666",
    marginTop: Spacing.xs,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  warningText: {
    color: "#666666",
    marginLeft: Spacing.sm,
  },
  actions: {
    flex: 1,
  },
  primaryButton: {
    height: Spacing.primaryButtonHeight,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButton: {
    height: Spacing.buttonHeight,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  secondaryButtonPressed: {
    backgroundColor: "#F5F5F5",
  },
  secondaryButtonText: {
    color: "#000000",
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  disabledButton: {
    borderColor: "#CCCCCC",
  },
  disabledText: {
    color: "#CCCCCC",
  },
});

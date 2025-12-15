import React, { useState, useCallback, useRef } from "react";
import { View, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  getSettings,
  saveSettings,
  resetAllData,
  Settings,
} from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Settings">;

const DURATION_OPTIONS = [15, 30, 45, 60, 90];
const STREAK_OPTIONS = [3, 5, 7, 14];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isResetPressing, setIsResetPressing] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSettings = useCallback(async () => {
    const data = await getSettings();
    setSettings(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const handleDurationChange = async (duration: number) => {
    if (!settings) return;
    const updated = await saveSettings({ focusDuration: duration });
    setSettings(updated);
  };

  const handleThresholdChange = async (threshold: number) => {
    if (!settings) return;
    const updated = await saveSettings({ unlockThreshold: threshold });
    setSettings(updated);
  };

  const handleSave = async () => {
    if (settings?.isFirstSetup) {
      await saveSettings({ isFirstSetup: false });
    }
    navigation.goBack();
  };

  const handleResetPressIn = () => {
    setIsResetPressing(true);
    resetTimeoutRef.current = setTimeout(() => {
      setIsResetPressing(false);
      Alert.alert(
        "Reset All Data",
        "This will permanently delete all your data. This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete Everything",
            style: "destructive",
            onPress: async () => {
              await resetAllData();
              navigation.goBack();
            },
          },
        ]
      );
    }, 2000);
  };

  const handleResetPressOut = () => {
    setIsResetPressing(false);
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
  };

  if (!settings) {
    return (
      <View style={[styles.container, { paddingTop: Spacing.xl }]}>
        <ThemedText type="body" style={styles.loadingText}>
          Loading...
        </ThemedText>
      </View>
    );
  }

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
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Focus Session Duration
        </ThemedText>
        <View style={styles.optionGrid}>
          {DURATION_OPTIONS.map((duration) => (
            <Pressable
              key={duration}
              style={({ pressed }) => [
                styles.optionButton,
                settings.focusDuration === duration && styles.optionButtonSelected,
                pressed && styles.optionButtonPressed,
              ]}
              onPress={() => handleDurationChange(duration)}
            >
              <ThemedText
                type="button"
                style={[
                  styles.optionText,
                  settings.focusDuration === duration && styles.optionTextSelected,
                ]}
              >
                {duration} min
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Settings Unlock Streak
        </ThemedText>
        <ThemedText type="small" style={styles.sectionDescription}>
          After first setup, settings lock until you achieve this streak.
        </ThemedText>
        <View style={styles.optionGrid}>
          {STREAK_OPTIONS.map((streak) => (
            <Pressable
              key={streak}
              style={({ pressed }) => [
                styles.optionButton,
                settings.unlockThreshold === streak && styles.optionButtonSelected,
                pressed && styles.optionButtonPressed,
              ]}
              onPress={() => handleThresholdChange(streak)}
            >
              <ThemedText
                type="button"
                style={[
                  styles.optionText,
                  settings.unlockThreshold === streak && styles.optionTextSelected,
                ]}
              >
                {streak} days
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
          onPress={handleSave}
        >
          <ThemedText type="button" style={styles.saveButtonText}>
            {settings.isFirstSetup ? "Start Using App" : "Save Settings"}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.dangerZone}>
        <ThemedText type="h4" style={styles.dangerTitle}>
          Danger Zone
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.resetButton,
            isResetPressing && styles.resetButtonActive,
            pressed && styles.resetButtonPressed,
          ]}
          onPressIn={handleResetPressIn}
          onPressOut={handleResetPressOut}
        >
          <Feather name="trash-2" size={18} color="#FFFFFF" style={styles.resetIcon} />
          <ThemedText type="button" style={styles.resetButtonText}>
            {isResetPressing ? "Hold to confirm..." : "Reset All Data (Hold 2s)"}
          </ThemedText>
        </Pressable>
      </View>
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
  loadingText: {
    textAlign: "center",
    color: "#666666",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: "#000000",
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    color: "#666666",
    marginBottom: Spacing.md,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  optionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    margin: Spacing.xs,
    minWidth: 80,
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#000000",
  },
  optionButtonPressed: {
    backgroundColor: "#F5F5F5",
  },
  optionText: {
    color: "#000000",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  saveButton: {
    height: Spacing.buttonHeight,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: "#FFFFFF",
  },
  dangerZone: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "#E6E6E6",
  },
  dangerTitle: {
    color: "#666666",
    marginBottom: Spacing.md,
  },
  resetButton: {
    height: Spacing.buttonHeight,
    backgroundColor: "#666666",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonActive: {
    backgroundColor: "#444444",
  },
  resetButtonPressed: {
    opacity: 0.8,
  },
  resetIcon: {
    marginRight: Spacing.sm,
  },
  resetButtonText: {
    color: "#FFFFFF",
  },
});

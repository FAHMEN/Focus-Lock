import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { addRelapseLog, RelapseLog } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ReplacementAction">;

type ActionType = RelapseLog["replacementAction"];

const ACTIONS: { type: ActionType; label: string; duration: number; icon: keyof typeof Feather.glyphMap }[] = [
  { type: "physical", label: "Physical Movement", duration: 60, icon: "move" },
  { type: "writing", label: "Write Thoughts", duration: 90, icon: "edit-3" },
  { type: "breathing", label: "Breathing Exercise", duration: 120, icon: "wind" },
];

export default function ReplacementActionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const onBackPress = () => {
      if (!isComplete) {
        return true;
      }
      return false;
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isComplete]);

  const handleSelectAction = (action: typeof ACTIONS[0]) => {
    setSelectedAction(action.type);
    setRemainingSeconds(action.duration);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, action.duration - elapsed);
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setIsComplete(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }, 1000);
  };

  const handleComplete = async () => {
    if (selectedAction) {
      await addRelapseLog(selectedAction);
    }
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getActionInstructions = () => {
    switch (selectedAction) {
      case "physical":
        return "Move your body. Walk, stretch, do jumping jacks. Keep moving until the timer ends.";
      case "writing":
        return "Write down your thoughts. What triggered this urge? What are you actually feeling?";
      case "breathing":
        return "Breathe slowly. In for 4 seconds, hold for 4, out for 4. Repeat until done.";
      default:
        return "";
    }
  };

  if (!selectedAction) {
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
        <ThemedText type="h3" style={styles.title}>
          Choose One Action
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          You must complete one action before logging.
        </ThemedText>

        <View style={styles.actions}>
          {ACTIONS.map((action) => (
            <Pressable
              key={action.type}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={() => handleSelectAction(action)}
            >
              <Feather name={action.icon} size={24} color="#000000" style={styles.actionIcon} />
              <View style={styles.actionContent}>
                <ThemedText type="button" style={styles.actionLabel}>
                  {action.label}
                </ThemedText>
                <ThemedText type="small" style={styles.actionDuration}>
                  {Math.floor(action.duration / 60)}:{(action.duration % 60).toString().padStart(2, "0")} min
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

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
      <ThemedText type="h3" style={styles.title}>
        {ACTIONS.find((a) => a.type === selectedAction)?.label}
      </ThemedText>

      <View style={styles.timerContainer}>
        <ThemedText type="timer" style={styles.timerText}>
          {formatTime(remainingSeconds)}
        </ThemedText>
      </View>

      <ThemedText type="body" style={styles.instructions}>
        {getActionInstructions()}
      </ThemedText>

      {isComplete ? (
        <Pressable
          style={({ pressed }) => [
            styles.completeButton,
            pressed && styles.completeButtonPressed,
          ]}
          onPress={handleComplete}
        >
          <ThemedText type="button" style={styles.completeButtonText}>
            Log and Continue
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.waitingContainer}>
          <ThemedText type="small" style={styles.waitingText}>
            Complete the action to continue
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
  },
  title: {
    textAlign: "center",
    color: "#000000",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    color: "#666666",
    marginBottom: Spacing.xl,
  },
  actions: {
    flex: 1,
    justifyContent: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  actionButtonPressed: {
    backgroundColor: "#F5F5F5",
  },
  actionIcon: {
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    color: "#000000",
  },
  actionDuration: {
    color: "#666666",
    marginTop: Spacing.xs,
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    color: "#000000",
  },
  instructions: {
    textAlign: "center",
    color: "#666666",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  completeButton: {
    height: Spacing.primaryButtonHeight,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  completeButtonPressed: {
    opacity: 0.8,
  },
  completeButtonText: {
    color: "#FFFFFF",
  },
  waitingContainer: {
    height: Spacing.primaryButtonHeight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  waitingText: {
    color: "#CCCCCC",
  },
});

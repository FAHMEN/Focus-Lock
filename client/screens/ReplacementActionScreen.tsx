import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, BackHandler, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
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

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

export default function ReplacementActionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const [journalText, setJournalText] = useState("");
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const [breathCount, setBreathCount] = useState(4);
  const breathTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      if (breathTimerRef.current) {
        clearInterval(breathTimerRef.current);
      }
    };
  }, [isComplete]);

  const triggerHaptic = (phase: BreathPhase) => {
    if (Platform.OS === "web") return;
    
    switch (phase) {
      case "inhale":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "hold":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "exhale":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "rest":
        break;
    }
  };

  const startBreathingExercise = () => {
    let phase: BreathPhase = "inhale";
    let count = 4;
    setBreathPhase("inhale");
    setBreathCount(4);
    triggerHaptic("inhale");

    breathTimerRef.current = setInterval(() => {
      count--;
      
      if (count <= 0) {
        switch (phase) {
          case "inhale":
            phase = "hold";
            count = 4;
            break;
          case "hold":
            phase = "exhale";
            count = 4;
            break;
          case "exhale":
            phase = "rest";
            count = 2;
            break;
          case "rest":
            phase = "inhale";
            count = 4;
            break;
        }
        triggerHaptic(phase);
        setBreathPhase(phase);
      }
      
      setBreathCount(count);
    }, 1000);
  };

  const handleSelectAction = (action: typeof ACTIONS[0]) => {
    setSelectedAction(action.type);
    setRemainingSeconds(action.duration);
    startTimeRef.current = Date.now();

    if (action.type === "breathing") {
      startBreathingExercise();
    }

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, action.duration - elapsed);
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setIsComplete(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        if (breathTimerRef.current) {
          clearInterval(breathTimerRef.current);
        }
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }, 1000);
  };

  const handleComplete = async () => {
    if (selectedAction) {
      const journal = selectedAction === "writing" && journalText.trim() ? journalText.trim() : undefined;
      await addRelapseLog(selectedAction, journal);
    }
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "rest":
        return "Rest";
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

  if (selectedAction === "breathing") {
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
          Breathing Exercise
        </ThemedText>

        <View style={styles.timerContainer}>
          <View style={styles.breathCircle}>
            <ThemedText type="h1" style={styles.breathCount}>
              {breathCount}
            </ThemedText>
          </View>
          <ThemedText type="h2" style={styles.breathInstruction}>
            {getBreathInstruction()}
          </ThemedText>
          <ThemedText type="body" style={styles.remainingTime}>
            {formatTime(remainingSeconds)} remaining
          </ThemedText>
        </View>

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
              Follow the breathing pattern
            </ThemedText>
          </View>
        )}
      </View>
    );
  }

  if (selectedAction === "writing") {
    return (
      <KeyboardAwareScrollViewCompat
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <ThemedText type="h3" style={styles.title}>
          Write Your Thoughts
        </ThemedText>

        <ThemedText type="body" style={styles.timerSmall}>
          {formatTime(remainingSeconds)} remaining
        </ThemedText>

        <TextInput
          style={styles.journalInput}
          multiline
          placeholder="What triggered this urge? What are you actually feeling? Write freely..."
          placeholderTextColor="#999999"
          value={journalText}
          onChangeText={setJournalText}
          textAlignVertical="top"
          editable={!isComplete}
        />

        {isComplete ? (
          <Pressable
            style={({ pressed }) => [
              styles.completeButton,
              pressed && styles.completeButtonPressed,
            ]}
            onPress={handleComplete}
          >
            <ThemedText type="button" style={styles.completeButtonText}>
              {journalText.trim() ? "Save and Continue" : "Log and Continue"}
            </ThemedText>
          </Pressable>
        ) : (
          <View style={styles.waitingContainer}>
            <ThemedText type="small" style={styles.waitingText}>
              Keep writing until the timer ends
            </ThemedText>
          </View>
        )}
      </KeyboardAwareScrollViewCompat>
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
        Move your body. Walk, stretch, do jumping jacks. Keep moving until the timer ends.
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
  scrollContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
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
  timerSmall: {
    textAlign: "center",
    color: "#666666",
    marginBottom: Spacing.lg,
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
  breathCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  breathCount: {
    color: "#000000",
  },
  breathInstruction: {
    color: "#000000",
    marginBottom: Spacing.md,
  },
  remainingTime: {
    color: "#666666",
  },
  journalInput: {
    flex: 1,
    minHeight: 200,
    borderWidth: 2,
    borderColor: "#000000",
    padding: Spacing.md,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    marginBottom: Spacing.lg,
    fontFamily: "monospace",
  },
});

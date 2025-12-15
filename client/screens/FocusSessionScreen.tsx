import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert, BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { addFocusSession } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "FocusSession">;
type RouteProps = RouteProp<RootStackParamList, "FocusSession">;

export default function FocusSessionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { duration } = route.params;

  const totalSeconds = duration * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  useEffect(() => {
    activateKeepAwakeAsync();
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setIsComplete(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }, 1000);

    return () => {
      deactivateKeepAwake();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [totalSeconds]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!isComplete) {
          Alert.alert(
            "Breaking Focus",
            "Breaking focus breaks discipline. Long press the end button to exit.",
            [{ text: "Continue Focus" }]
          );
          return true;
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [isComplete])
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndSession = async (completed: boolean) => {
    const endTime = Date.now();
    await addFocusSession({
      startTime: startTimeRef.current,
      endTime,
      duration: Math.floor((endTime - startTimeRef.current) / 1000),
      completed,
    });
    navigation.goBack();
  };

  const handleLongPressStart = () => {
    if (isComplete) {
      handleEndSession(true);
      return;
    }

    setIsLongPressing(true);
    longPressRef.current = setTimeout(() => {
      Alert.alert(
        "End Session Early?",
        "This session will be marked as incomplete.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "End Session",
            style: "destructive",
            onPress: () => handleEndSession(false),
          },
        ]
      );
      setIsLongPressing(false);
    }, 2000);
  };

  const handleLongPressEnd = () => {
    setIsLongPressing(false);
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.timerContainer}>
        <ThemedText type="timer" style={styles.timerText}>
          {formatTime(remainingSeconds)}
        </ThemedText>
        {isComplete ? (
          <ThemedText type="body" style={styles.statusText}>
            Session Complete
          </ThemedText>
        ) : null}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.endButton,
          isLongPressing && styles.endButtonActive,
          pressed && styles.endButtonPressed,
        ]}
        onPressIn={handleLongPressStart}
        onPressOut={handleLongPressEnd}
      >
        <ThemedText type="small" style={styles.endButtonText}>
          {isComplete ? "Tap to finish" : "Hold 2s to end"}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    color: "#FFFFFF",
  },
  statusText: {
    color: "#FFFFFF",
    marginTop: Spacing.lg,
  },
  endButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: "#1A1A1A",
  },
  endButtonActive: {
    backgroundColor: "#333333",
  },
  endButtonPressed: {
    opacity: 0.8,
  },
  endButtonText: {
    color: "#666666",
  },
});

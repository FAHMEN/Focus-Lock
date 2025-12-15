import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import FocusSessionScreen from "@/screens/FocusSessionScreen";
import ReplacementActionScreen from "@/screens/ReplacementActionScreen";
import PatternsScreen from "@/screens/PatternsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Home: undefined;
  FocusSession: { duration: number };
  ReplacementAction: undefined;
  Patterns: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#000000",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        animation: "none",
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FocusSession"
        component={FocusSessionScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="ReplacementAction"
        component={ReplacementActionScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Patterns"
        component={PatternsScreen}
        options={{
          headerTitle: "Patterns",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
    </Stack.Navigator>
  );
}

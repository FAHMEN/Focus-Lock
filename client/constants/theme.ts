import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    buttonText: "#FFFFFF",
    tabIconDefault: "#CCCCCC",
    tabIconSelected: "#000000",
    link: "#000000",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F5",
    backgroundSecondary: "#E6E6E6",
    backgroundTertiary: "#D9D9D9",
    disabled: "#CCCCCC",
    warning: "#666666",
    border: "#000000",
  },
  dark: {
    text: "#FFFFFF",
    buttonText: "#000000",
    tabIconDefault: "#666666",
    tabIconSelected: "#FFFFFF",
    link: "#FFFFFF",
    backgroundRoot: "#000000",
    backgroundDefault: "#1A1A1A",
    backgroundSecondary: "#2A2A2A",
    backgroundTertiary: "#3A3A3A",
    disabled: "#444444",
    warning: "#999999",
    border: "#FFFFFF",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  "4xl": 56,
  "5xl": 64,
  inputHeight: 48,
  buttonHeight: 56,
  primaryButtonHeight: 80,
};

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
};

export const Typography = {
  timer: {
    fontSize: 72,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 18,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

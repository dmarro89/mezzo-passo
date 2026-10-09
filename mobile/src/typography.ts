import { Platform } from "react-native";

/**
 * Mezzo Passo: contemporary sans-serif typography.
 * Strong, compact headlines with legible native UI text.
 * Uses preinstalled fonts, so the app works offline without font loading.
 */
export const typography = {
  display: Platform.select({
    ios: "AvenirNext-Heavy",
    android: "sans-serif",
    default: "system-ui",
  }) ?? "System",
  heading: Platform.select({
    ios: "AvenirNext-DemiBold",
    android: "sans-serif",
    default: "system-ui",
  }) ?? "System",
  body: Platform.select({
    ios: "AvenirNext-Regular",
    android: "sans-serif",
    default: "system-ui",
  }) ?? "System",
} as const;

import { Platform } from "react-native";

/**
 * Mezzo Passo type hierarchy. The display face has a distinct, compact
 * character while supporting native system fonts and offline rendering.
 */
export const typography = {
  display: Platform.select({
    ios: "AvenirNext-Heavy",
    android: "sans-serif-condensed",
    default: "Trebuchet MS",
  }) ?? "System",
  heading: Platform.select({
    ios: "AvenirNext-DemiBold",
    android: "sans-serif-medium",
    default: "Trebuchet MS",
  }) ?? "System",
  body: Platform.select({
    ios: "AvenirNext-Regular",
    android: "sans-serif",
    default: "system-ui",
  }) ?? "System",
} as const;

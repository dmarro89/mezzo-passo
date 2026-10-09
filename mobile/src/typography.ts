import { Platform } from "react-native";

/**
 * Mezzo Passo pairs an editorial display serif (the heritage of the Gigli)
 * with clean native sans-serif for navigation and reading.
 * No remote font request or external assets are required.
 */
export const typography = {
  display: Platform.select({
    ios: "Georgia-Bold",
    android: "serif",
    default: "Georgia, serif",
  }) ?? "serif",
  heading: Platform.select({
    ios: "Georgia-Bold",
    android: "serif",
    default: "Georgia, serif",
  }) ?? "serif",
  body: Platform.select({
    ios: "AvenirNext-Regular",
    android: "sans-serif",
    default: "system-ui",
  }) ?? "System",
} as const;

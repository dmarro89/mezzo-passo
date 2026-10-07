import React, { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "./theme";

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.scroll}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        style={[
          styles.animated,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        {body}
      </Animated.View>
    </SafeAreaView>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandWrap}>
      <Text style={[styles.brand, compact && styles.brandCompact]}>MEZZO PASSO</Text>
      {!compact ? <View style={styles.brandLine} /> : null}
    </View>
  );
}

export function Title({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({
  children,
  action,
  onAction,
}: {
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  style,
  elevated = false,
}: {
  children: ReactNode;
  style?: object;
  elevated?: boolean;
}) {
  return (
    <View style={[styles.card, elevated && styles.cardElevated, style]}>
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        variant === "danger" && styles.buttonDanger,
        variant === "ghost" && styles.buttonGhost,
        pressed && styles.pressed,
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant !== "primary" && styles.buttonTextAlt,
          variant === "danger" && styles.buttonTextDanger,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Pill({
  label,
  active,
  tone = "default",
  onPress,
}: {
  label: string;
  active?: boolean;
  tone?: "default" | "success" | "maybe" | "danger";
  onPress?: () => void;
}) {
  const toneStyle =
    tone === "success"
      ? styles.pillSuccess
      : tone === "maybe"
        ? styles.pillMaybe
        : tone === "danger"
          ? styles.pillDanger
          : undefined;

  const labelStyle =
    tone === "success"
      ? styles.pillSuccessText
      : tone === "maybe"
        ? styles.pillMaybeText
        : tone === "danger"
          ? styles.pillDangerText
          : undefined;

  const content = (
    <Text
      style={[
        styles.pillText,
        labelStyle,
        active && tone === "default" && styles.pillTextActive,
      ]}
    >
      {label}
    </Text>
  );

  const body = (
    <View style={[styles.pill, toneStyle, active && tone === "default" && styles.pillActive]}>
      {content}
    </View>
  );

  if (!onPress) return body;
  return <Pressable onPress={onPress}>{body}</Pressable>;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  );
}

export function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function Banner({
  name = "ORGOGLIO NOLANO",
  subtitle = "PARANZA",
}: {
  name?: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.banner}>
      <View style={styles.bannerOrb} />
      <View style={styles.bannerStripe} />
      <Text style={styles.bannerEyebrow}>{subtitle}</Text>
      <Text style={styles.bannerText}>{name.toUpperCase()}</Text>
    </View>
  );
}

export function BottomNav({
  items,
  active,
  onChange,
}: {
  items: { key: string; label: string; icon: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <SafeAreaView style={styles.navSafe}>
      <View style={styles.nav}>
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [
                styles.navItem,
                pressed && { opacity: 0.65 },
              ]}
            >
              <View style={[styles.navIconWrap, selected && styles.navIconWrapActive]}>
                <Text style={[styles.navIcon, selected && styles.navIconActive]}>
                  {item.icon}
                </Text>
              </View>
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export function Avatar({
  initials,
  size = 44,
}: {
  initials: string;
  size?: number;
}) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  animated: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 108,
    gap: 16,
  },
  brandWrap: { gap: 10 },
  brand: {
    color: theme.colors.blueDark,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 6.2,
  },
  brandCompact: {
    fontSize: 14,
    letterSpacing: 3.4,
  },
  brandLine: {
    width: 32,
    height: 2,
    borderRadius: 2,
    backgroundColor: theme.colors.blue,
  },
  titleWrap: { gap: 5 },
  title: {
    color: theme.colors.blueDark,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.85,
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.blueDark,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.15,
  },
  sectionAction: {
    color: theme.colors.blue,
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 15,
    gap: 10,
  },
  cardElevated: {
    ...theme.shadow,
  },
  button: {
    minHeight: 48,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.blue,
    borderColor: theme.colors.blue,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderColor: "#B8C9E8",
  },
  buttonDanger: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: "#F1C9CD",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderColor: theme.colors.line,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "800",
  },
  buttonTextAlt: { color: theme.colors.blueDark },
  buttonTextDanger: { color: theme.colors.danger },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.86 },
  pill: {
    minHeight: 31,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: theme.colors.blue,
    borderColor: theme.colors.blue,
  },
  pillText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  pillTextActive: { color: theme.colors.surface },
  pillSuccess: {
    backgroundColor: theme.colors.successSoft,
    borderColor: theme.colors.successSoft,
  },
  pillSuccessText: { color: theme.colors.success },
  pillMaybe: {
    backgroundColor: theme.colors.maybeSoft,
    borderColor: theme.colors.maybeSoft,
  },
  pillMaybeText: { color: theme.colors.maybe },
  pillDanger: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.dangerSoft,
  },
  pillDangerText: { color: theme.colors.danger },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.sm,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.ink,
    fontSize: 14,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: "top" },
  metric: {
    flex: 1,
    minWidth: 92,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 2,
  },
  metricValue: {
    color: theme.colors.blueDark,
    fontSize: 22,
    fontWeight: "900",
  },
  metricLabel: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: "700",
  },
  banner: {
    minHeight: 96,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.blueDeep,
    padding: 16,
    justifyContent: "center",
    overflow: "hidden",
  },
  bannerOrb: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -18,
    top: -38,
    backgroundColor: "#164A9F",
  },
  bannerStripe: {
    position: "absolute",
    width: 220,
    height: 16,
    right: -30,
    bottom: 18,
    transform: [{ rotate: "-11deg" }],
    backgroundColor: "#FFFFFF",
    opacity: 0.14,
  },
  bannerEyebrow: {
    color: "#BFD3FF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2.8,
  },
  bannerText: {
    color: theme.colors.surface,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  navSafe: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.line,
  },
  nav: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
  },
  navItem: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navIconWrap: {
    minWidth: 28,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconWrapActive: { backgroundColor: theme.colors.blueSoft },
  navIcon: {
    color: theme.colors.muted,
    fontSize: 16,
    fontWeight: "800",
  },
  navIconActive: { color: theme.colors.blue },
  navLabel: {
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: "700",
  },
  navLabelActive: { color: theme.colors.blue },
  avatar: {
    backgroundColor: theme.colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.blueDark,
    fontSize: 12,
    fontWeight: "900",
  },
});

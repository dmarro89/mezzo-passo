import React, { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BANNER_IMAGE } from "./demo";
import { theme } from "./theme";

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
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
        style={[styles.animated, { opacity, transform: [{ translateY }] }]}
      >
        {body}
      </Animated.View>
    </SafeAreaView>
  );
}

export function Brand({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <View style={styles.brandWrap}>
      <Text
        style={[
          styles.brand,
          compact && styles.brandCompact,
          light && { color: "#FFFFFF" },
        ]}
      >
        MEZZO PASSO
      </Text>
      {!compact ? (
        <View style={[styles.brandLine, light && { backgroundColor: "#FFFFFF" }]} />
      ) : null}
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
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  const alt = variant !== "primary";
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
      {icon ? (
        <Ionicons
          name={icon}
          size={17}
          color={
            variant === "primary"
              ? "#FFFFFF"
              : variant === "danger"
                ? theme.colors.danger
                : theme.colors.blueDark
          }
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          alt && styles.buttonTextAlt,
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

  const body = (
    <View
      style={[
        styles.pill,
        toneStyle,
        active && tone === "default" && styles.pillActive,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          labelStyle,
          active && tone === "default" && styles.pillTextActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputShell, multiline && styles.inputMultiline]}>
        {icon ? <Ionicons name={icon} size={17} color={theme.colors.blue} /> : null}
        <TextInput
          style={[styles.input, multiline && { minHeight: 76, textAlignVertical: "top" }]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          onChangeText={onChangeText}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

export function Metric({
  label,
  value,
  icon,
  ring,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  ring?: boolean;
}) {
  return (
    <View style={styles.metric}>
      {ring ? (
        <View style={styles.metricRing}>
          <View style={styles.metricRingInner}>
            <Text style={styles.metricRingValue}>{value}</Text>
          </View>
        </View>
      ) : icon ? (
        <View style={styles.metricIcon}>
          <Ionicons name={icon} size={18} color={theme.colors.blue} />
        </View>
      ) : null}
      {!ring ? <Text style={styles.metricValue}>{value}</Text> : null}
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function Banner({
  name = "ORGOGLIO NOLANO",
}: {
  name?: string;
  subtitle?: string;
}) {
  return (
    <ImageBackground
      source={BANNER_IMAGE}
      resizeMode="cover"
      imageStyle={styles.bannerImage}
      style={styles.banner}
      accessibilityLabel={name}
    />
  );
}

export function BottomNav({
  items,
  active,
  onChange,
}: {
  items: {
    key: string;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    iconActive?: React.ComponentProps<typeof Ionicons>["name"];
  }[];
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
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [styles.navItem, pressed && { opacity: 0.62 }]}
            >
              <Ionicons
                name={selected ? item.iconActive ?? item.icon : item.icon}
                size={19}
                color={selected ? theme.colors.blue : theme.colors.muted}
              />
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
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, size > 60 && { fontSize: 18 }]}>{initials}</Text>
    </View>
  );
}

export function ParanzaLogo({ size = 48 }: { size?: number }) {
  return (
    <ImageBackground
      source={BANNER_IMAGE}
      resizeMode="cover"
      imageStyle={{ borderRadius: size / 2 }}
      style={[
        styles.paranzaLogo,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

export function HeaderButton({
  icon,
  onPress,
  badge,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  badge?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icon}
      onPress={onPress}
      style={styles.headerButton}
    >
      <Ionicons name={icon} size={19} color={theme.colors.blue} />
      {badge ? <View style={styles.headerBadge} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  animated: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 92,
    gap: 13,
  },
  brandWrap: { gap: 9 },
  brand: {
    color: theme.colors.blueDark,
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "600",
    letterSpacing: 5.6,
  },
  brandCompact: {
    fontSize: 13,
    letterSpacing: 3.2,
    lineHeight: 16,
  },
  brandLine: {
    width: 30,
    height: 1.5,
    backgroundColor: theme.colors.blue,
  },
  titleWrap: { gap: 4 },
  title: {
    color: theme.colors.blueDark,
    fontSize: 25,
    lineHeight: 29,
    fontWeight: "800",
    letterSpacing: -0.72,
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.blueDark,
    fontSize: 14,
    fontWeight: "800",
  },
  sectionAction: {
    color: theme.colors.blue,
    fontSize: 11,
    fontWeight: "700",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 12,
    gap: 8,
  },
  cardElevated: { ...theme.shadow },
  button: {
    minHeight: 45,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.blue,
    borderColor: theme.colors.blue,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.blue,
  },
  buttonDanger: {
    backgroundColor: theme.colors.surface,
    borderColor: "#EF6B73",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderColor: theme.colors.line,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  buttonTextAlt: { color: theme.colors.blueDark },
  buttonTextDanger: { color: theme.colors.danger },
  pressed: { transform: [{ scale: 0.988 }], opacity: 0.86 },
  pill: {
    minHeight: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: theme.colors.blue,
    borderColor: theme.colors.blue,
  },
  pillText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: "700",
  },
  pillTextActive: { color: "#FFFFFF" },
  pillSuccess: { backgroundColor: "#EAF8F3", borderColor: "#D1F1E5" },
  pillSuccessText: { color: theme.colors.success },
  pillMaybe: { backgroundColor: theme.colors.maybeSoft, borderColor: "#F6E8BD" },
  pillMaybeText: { color: theme.colors.maybe },
  pillDanger: { backgroundColor: theme.colors.dangerSoft, borderColor: "#F4D3D5" },
  pillDangerText: { color: theme.colors.danger },
  fieldWrap: { gap: 5 },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: "700",
  },
  inputShell: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
  },
  inputMultiline: { alignItems: "flex-start", paddingTop: 9 },
  input: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 13,
    paddingVertical: 8,
  },
  metric: {
    flex: 1,
    minWidth: 72,
    minHeight: 84,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: 10,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    color: theme.colors.blueDark,
    fontSize: 19,
    fontWeight: "900",
  },
  metricLabel: {
    color: theme.colors.text,
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
  metricRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 7,
    borderColor: theme.colors.blue,
    borderTopColor: "#D7E5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  metricRingInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  metricRingValue: {
    color: theme.colors.blueDark,
    fontSize: 15,
    fontWeight: "900",
  },
  banner: {
    height: 62,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  bannerImage: { borderRadius: 8 },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(7,34,87,0.56)",
  },
  bannerEyebrow: {
    color: "#D9E5FF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.2,
    maxWidth: 220,
  },
  navSafe: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.line,
  },
  nav: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 3,
  },
  navItem: {
    flex: 1,
    minHeight: 55,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  navLabel: {
    color: theme.colors.muted,
    fontSize: 8,
    fontWeight: "600",
  },
  navLabelActive: {
    color: theme.colors.blue,
    fontWeight: "800",
  },
  avatar: {
    backgroundColor: "#EAF1FB",
    borderWidth: 1,
    borderColor: "#DDE6F3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.blueDark,
    fontSize: 12,
    fontWeight: "900",
  },
  paranzaLogo: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.blueSoft,
  },
  headerButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    position: "absolute",
    right: 4,
    top: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E13D4F",
  },
});

import React, { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  Image,
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
import { BANNER_IMAGE, PERSON_IMAGE } from "./demo";
import { theme } from "./theme";
import { typography } from "./typography";

export function Screen({
  children,
  scroll = true,
  withBottomNav = false,
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  withBottomNav?: boolean;
  footer?: ReactNode;
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
      contentContainerStyle={[
        styles.scroll,
        withBottomNav && styles.scrollWithBottomNav,
        !!footer && styles.scrollWithFooter,
        !!footer && withBottomNav && styles.scrollWithNavAndFooter,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.scroll,
        withBottomNav && styles.scrollWithBottomNav,
        !!footer && styles.scrollWithFooter,
        !!footer && withBottomNav && styles.scrollWithNavAndFooter,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        style={[styles.animated, { opacity, transform: [{ translateY }] }]}
      >
        {body}
        {footer ? (
          <View
            style={[
              styles.screenFooter,
              withBottomNav && styles.screenFooterWithBottomNav,
            ]}
          >
            {footer}
          </View>
        ) : null}
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
  large = false,
}: {
  children: ReactNode;
  subtitle?: string;
  large?: boolean;
}) {
  return (
    <View style={[styles.titleWrap, large && styles.titleWrapLarge]}>
      <Text style={[styles.title, large && styles.titleLarge]}>{children}</Text>
      {subtitle ? <Text style={[styles.subtitle, large && styles.subtitleLarge]}>{subtitle}</Text> : null}
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
  large = false,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  large?: boolean;
}) {
  const alt = variant !== "primary";
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        large && styles.buttonLarge,
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
          size={19}
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
          large && styles.buttonTextLarge,
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
  large = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  large?: boolean;
}) {
  return (
    <View style={[styles.fieldWrap, large && styles.fieldWrapLarge]}>
      <Text style={[styles.fieldLabel, large && styles.fieldLabelLarge]}>{label}</Text>
      <View style={[styles.inputShell, large && styles.inputShellLarge, multiline && styles.inputMultiline, multiline && large && styles.inputMultilineLarge]}>
        {icon ? <Ionicons name={icon} size={19} color={theme.colors.blue} /> : null}
        <TextInput
          style={[styles.input, large && styles.inputLarge, multiline && { minHeight: large ? 112 : 76, textAlignVertical: "top" }]}
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
    <View style={styles.banner} accessibilityLabel={name}>
      <Image
        source={BANNER_IMAGE}
        resizeMode="cover"
        style={styles.bannerPhoto}
      />
    </View>
  );
}

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconActive?: React.ComponentProps<typeof Ionicons>["name"];
};

export function BottomNav({
  items,
  active,
  onChange,
}: {
  items: NavItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={styles.navSafe}>
      <View style={styles.nav}>
        {items.map((item) => (
          <BottomNavTab
            key={item.key}
            item={item}
            selected={item.key === active}
            onPress={() => onChange(item.key)}
          />
        ))}
      </View>
    </View>
  );
}

function BottomNavTab({
  item,
  selected,
  onPress,
}: {
  item: NavItem;
  selected: boolean;
  onPress: () => void;
}) {
  const selectedProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.timing(selectedProgress, {
      toValue: selected ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [selected, selectedProgress]);

  const bubbleScale = selectedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.navItem, pressed && { opacity: 0.72 }]}
    >
      <View style={styles.navIconShell}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.navIconHighlight,
            {
              opacity: selectedProgress,
              transform: [{ scale: bubbleScale }],
            },
          ]}
        />
        <Ionicons
          name={selected ? item.iconActive ?? item.icon : item.icon}
          size={21}
          color={selected ? theme.colors.blue : theme.colors.muted}
        />
      </View>
      <Text style={[styles.navLabel, selected && styles.navLabelActive]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export function Avatar({
  initials,
  size = 44,
  uri,
}: {
  initials: string;
  size?: number;
  uri?: string;
}) {
  return (
    <View
      accessibilityLabel={initials}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} resizeMode="cover" style={styles.fillPhoto} />
      ) : (
        <Text style={styles.avatarText}>{initials}</Text>
      )}
    </View>
  );
}

export function ParanzaLogo({ size = 48 }: { size?: number }) {
  return (
    <View
      style={[
        styles.paranzaLogo,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={BANNER_IMAGE}
        resizeMode="cover"
        style={styles.fillPhoto}
      />
    </View>
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
      <Ionicons name={icon} size={21} color={theme.colors.blue} />
      {badge ? <View style={styles.headerBadge} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  animated: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 18,
  },
  scrollWithBottomNav: {
    paddingBottom: 84,
  },
  scrollWithFooter: {
    paddingBottom: 108,
  },
  scrollWithNavAndFooter: {
    paddingBottom: 182,
  },
  screenFooter: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 4,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: theme.colors.background,
  },
  screenFooterWithBottomNav: {
    bottom: 78,
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
    fontSize: 15,
    letterSpacing: 3.4,
    lineHeight: 19,
  },
  brandLine: {
    width: 30,
    height: 1.5,
    backgroundColor: theme.colors.blue,
  },
  titleWrap: { gap: 5 },
  titleWrapLarge: { gap: 8 },
  title: {
    color: theme.colors.blueDark,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.72,
  },
  titleLarge: {
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -1.15,
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  subtitleLarge: {
    fontSize: 18,
    lineHeight: 24,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.blueDark,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionAction: {
    color: theme.colors.blue,
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    gap: 12,
  },
  cardElevated: { ...theme.shadow },
  button: {
    minHeight: 50,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
  },
  buttonLarge: {
    minHeight: 62,
    borderRadius: 12,
    paddingHorizontal: 18,
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
    fontSize: 15,
    fontWeight: "800",
  },
  buttonTextLarge: {
    fontSize: 17,
  },
  buttonTextAlt: { color: theme.colors.blueDark },
  buttonTextDanger: { color: theme.colors.danger },
  pressed: { transform: [{ scale: 0.988 }], opacity: 0.86 },
  pill: {
    minHeight: 32,
    borderRadius: 10,
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
    fontSize: 12,
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
  fieldWrapLarge: { gap: 8 },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  fieldLabelLarge: {
    fontSize: 14,
  },
  inputShell: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
  },
  inputShellLarge: {
    minHeight: 60,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputMultiline: { alignItems: "flex-start", paddingTop: 9 },
  inputMultilineLarge: { paddingTop: 13 },
  input: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 15,
    paddingVertical: 10,
  },
  inputLarge: {
    fontSize: 17,
    paddingVertical: 12,
  },
  metric: {
    flex: 1,
    minWidth: 72,
    minHeight: 108,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    color: theme.colors.blueDark,
    fontSize: 23,
    fontWeight: "900",
  },
  metricLabel: {
    color: theme.colors.text,
    fontSize: 11,
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
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
    transform: [{ translateY: -1 }],
  },
  banner: {
    height: 82,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: theme.colors.blueDeep,
  },
  bannerPhoto: {
    width: "100%",
    height: "100%",
  },
  fillPhoto: {
    width: "100%",
    height: "100%",
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
    borderTopColor: "#DDE7F5",
    shadowColor: theme.colors.blueDeep,
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  nav: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
    paddingTop: 7,
    paddingBottom: 4,
  },
  navItem: {
    flex: 1,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  navIconShell: {
    width: 46,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E8F0FF",
    borderRadius: 12,
  },
  navLabel: {
    color: "#8999AE",
    fontFamily: typography.heading,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.05,
  },
  navLabelActive: {
    color: theme.colors.blueDark,
    fontWeight: "800",
  },
  avatar: {
    overflow: "hidden",
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
    width: 38,
    height: 38,
    borderRadius: 19,
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

import React, { ReactNode } from "react";
import {
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
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.scroll}>{children}</View>
  );
  return <SafeAreaView style={styles.safe}>{body}</SafeAreaView>;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={[styles.brand, compact && { fontSize: 16, letterSpacing: 4 }]}>
        MEZZO PASSO
      </Text>
      {!compact && (
        <View style={{ width: 36, height: 2, backgroundColor: theme.colors.blue }} />
      )}
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
    <View style={{ gap: 6 }}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
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
        pressed && { opacity: 0.78 },
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant !== "primary" && { color: theme.colors.blueDark },
          variant === "danger" && { color: theme.colors.danger },
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
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <Text style={[styles.pillText, active && { color: theme.colors.surface }]}>
      {label}
    </Text>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.pill, active && styles.pillActive]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[styles.pill, active && styles.pillActive]}>{content}</View>;
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
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 96, textAlignVertical: "top" }]}
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

export function Banner({ name = "ORGOGLIO NOLANO" }: { name?: string }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerEyebrow}>PARANZA</Text>
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
    <View style={styles.nav}>
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={styles.navItem}
          >
            <Text style={[styles.navIcon, selected && { color: theme.colors.blue }]}>
              {item.icon}
            </Text>
            <Text style={[styles.navLabel, selected && { color: theme.colors.blue }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.subtitle}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: 110,
    gap: theme.spacing.md,
  },
  brand: {
    color: theme.colors.blueDark,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 7,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  button: {
    minHeight: 48,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
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
    backgroundColor: theme.colors.dangerSoft,
    borderColor: "#F4C7CC",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderColor: theme.colors.line,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "700",
  },
  pill: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
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
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 12,
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
    fontSize: 15,
  },
  metric: {
    flex: 1,
    minWidth: 130,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: theme.spacing.md,
    gap: 4,
  },
  metricValue: {
    color: theme.colors.blueDark,
    fontSize: 25,
    fontWeight: "800",
  },
  metricLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  banner: {
    minHeight: 92,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.blueDark,
    padding: theme.spacing.md,
    justifyContent: "center",
  },
  bannerEyebrow: {
    color: "#BFD4FF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
  },
  bannerText: {
    color: theme.colors.surface,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  nav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 66,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navIcon: {
    color: theme.colors.muted,
    fontSize: 17,
    fontWeight: "700",
  },
  navLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  empty: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
});

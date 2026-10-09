import React from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Screen } from "../ui";
import { theme } from "../theme";
import { typography } from "../typography";
import { EventItem, Me, Paranza, Stats } from "../types";

type Destination = "events" | "messages" | "members" | "stats";
type Props = {
  me?: Me;
  paranza?: Paranza;
  events: EventItem[];
  stats: Stats;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onOpenEvent: (event: EventItem) => void;
  onNavigate: (tab: Destination) => void;
};

const navy = "#0B2455";
const blue = "#1757C5";
const subdued = "#697C99";
const soft = "#F3F7FD";

export function ManagerHome({
  me, paranza, events, stats, loading, error,
  onRetry, onOpenEvent, onNavigate,
}: Props) {
  const firstName = me?.user.firstName || paranza?.managerName?.split(" ")[0] || "";
  const upcoming = events
    .filter((event) => new Date(event.startsAt).getTime() >= Date.now())
    .sort((a, b) =>
      new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    )[0];
  return (
    <Screen key="manager-home" withBottomNav>
      <View style={s.homeStack}>
      <View style={s.header}>
        <View style={s.headerCopy}>
          <Text style={s.eyebrow}>IL TUO SPAZIO</Text>
          <Text
            style={s.greeting}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {firstName ? "Ciao, " + firstName + "." : "La tua paranza."}
          </Text>
          <Text style={s.headerSubtitle}>
            Capoparanza della paranza {paranza?.name || "—"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aggiorna i dati"
          accessibilityState={{ disabled: loading, busy: loading }}
          disabled={loading}
          onPress={onRetry}
          style={({ pressed }) => [s.refresh, pressed && s.pressed]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={blue} />
          ) : (
            <Ionicons name="refresh-outline" size={21} color={navy} />
          )}
        </Pressable>
      </View>

      <ParanzaIdentity paranza={paranza} />

      {error ? (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
          <Button title="Riprova" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}

      <StatsOverview
        stats={stats}
        loading={loading}
        onPress={() => onNavigate("stats")}
      />

      <View style={s.section}>
        <View style={s.sectionHeading}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionEyebrow}>IL CALENDARIO</Text>
            <Text style={s.sectionTitle}>Prossimo appuntamento</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate("events")}
            style={s.inlineLink}
          >
            <Text style={s.inlineLinkText}>Tutti</Text>
            <Ionicons name="arrow-forward" size={15} color={blue} />
          </Pressable>
        </View>
        {loading ? (
          <View style={s.emptyPanel}>
            <Text style={s.emptyText}>Caricamento appuntamenti…</Text>
          </View>
        ) : upcoming ? (
          <UpcomingEvent event={upcoming} onPress={() => onOpenEvent(upcoming)} />
        ) : (
          <Pressable
            accessibilityRole="button"
            style={s.emptyPanel}
            onPress={() => onNavigate("events")}
          >
            <View style={s.emptyIcon}>
              <Ionicons name="calendar-outline" size={22} color={blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.emptyTitle}>Nessun evento in programma</Text>
              <Text style={s.emptyText}>Apri Eventi per organizzarne uno.</Text>
            </View>
            <Ionicons name="arrow-forward" size={19} color={blue} />
          </Pressable>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionEyebrow}>ACCESSI RAPIDI</Text>
        <View style={s.shortcutRow}>
          <Shortcut
            title="Eventi"
            icon="calendar-outline"
            onPress={() => onNavigate("events")}
          />
          <Shortcut
            title="Messaggi"
            icon="chatbox-ellipses-outline"
            onPress={() => onNavigate("messages")}
          />
          <Shortcut
            title="Cullatori"
            icon="people-outline"
            onPress={() => onNavigate("members")}
          />
        </View>
      </View>

      </View>
    </Screen>
  );
}

function StatsOverview({
  stats, loading, onPress,
}: {
  stats: Stats;
  loading: boolean;
  onPress: () => void;
}) {
  const hasResponses = (stats.attendanceHistory?.length ?? 0) > 0;
  const value = Math.max(0, Math.min(100, stats.attendanceRate));
  const percentage = loading || !hasResponses ? "—" : Math.round(value) + "%";

  return (
    <View style={s.overviewSection}>
      <View style={s.overviewHeading}>
        <Text style={s.sectionEyebrow}>LA PARANZA IN CIFRE</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Apri statistiche"
          onPress={onPress}
          style={s.overviewLink}
        >
          <Text style={s.inlineLinkText}>Statistiche</Text>
          <Ionicons name="arrow-forward" size={14} color={blue} />
        </Pressable>
      </View>
      <TactilePressable
        accessibilityLabel="Apri le statistiche della paranza"
        onPress={onPress}
        style={s.overviewCard}
      >
        <View style={s.overviewAttendance}>
          <Text style={s.overviewAttendanceLabel}>PRESENZA MEDIA</Text>
          <Text style={s.overviewAttendanceValue}>{percentage}</Text>
          <Text style={s.overviewAttendanceNote}>
            {hasResponses ? "Conferme RSVP" : "In attesa di risposte"}
          </Text>
        </View>
        <View style={s.overviewNumbers}>
          <MiniStat
            value={loading ? "—" : stats.memberCount}
            label="Cullatori"
            icon="people-outline"
          />
          <View style={s.overviewDivider} />
          <MiniStat
            value={loading ? "—" : stats.activeMemberCount}
            label="Attivi"
            icon="person-outline"
          />
          <View style={s.overviewDivider} />
          <MiniStat
            value={loading ? "—" : stats.eventCount}
            label="Eventi"
            icon="calendar-clear-outline"
          />
        </View>
      </TactilePressable>
    </View>
  );
}

function MiniStat({
  value, label, icon,
}: {
  value: string | number;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View style={s.miniStat}>
      <Ionicons name={icon} size={16} color="#7290BE" />
      <Text
        style={s.miniStatValue}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      <Text style={s.miniStatLabel}>{label}</Text>
    </View>
  );
}

function ParanzaIdentity({ paranza }: { paranza?: Paranza }) {
  const primary = paranza?.primaryColor || "#FFFFFF";
  const secondary = paranza?.secondaryColor || blue;
  return (
    <View style={s.hero}>
      <View pointerEvents="none" style={[s.heroStripeWide, { backgroundColor: primary }]} />
      <View pointerEvents="none" style={[s.heroStripeNarrow, { backgroundColor: secondary }]} />
      <View style={s.heroMain}>
        <ParanzaMark
          logoUrl={paranza?.logoUrl}
          primaryColor={primary}
          secondaryColor={secondary}
        />
        <View style={s.heroText}>
          <Text style={s.heroEyebrow}>LA TUA PARANZA</Text>
          <Text
            style={s.heroName}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {paranza?.name || "Paranza"}
          </Text>
        </View>
      </View>
      <View style={s.heroFooter}>
        <View style={s.heroRule} />
        <View style={s.heroFooterRow}>
          <Text style={s.heroRole} numberOfLines={2}>
            {paranza?.managerName
              ? "Capoparanza · " + paranza.managerName
              : "Identità della paranza"}
          </Text>
          <View style={s.colors}>
            <View style={[s.colorDot, { backgroundColor: primary }]} />
            <View style={[s.colorDot, { backgroundColor: secondary }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

function ParanzaMark({
  logoUrl,
  primaryColor,
  secondaryColor,
}: {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [logoUrl]);

  return (
    <View style={[s.heroLogoFrame, { borderColor: secondaryColor }]}>
      <View style={[s.heroLogoAccent, { backgroundColor: primaryColor }]} />
      <View style={s.heroLogo}>
        {logoUrl && !imageFailed ? (
          <Image
            accessibilityLabel="Logo della paranza"
            source={{ uri: logoUrl }}
            style={s.heroLogoImage}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Ionicons name="flag-outline" size={30} color={blue} />
        )}
      </View>
    </View>
  );
}

function UpcomingEvent({ event, onPress }: { event: EventItem; onPress: () => void }) {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const dayName = start.toLocaleDateString("it-IT", { weekday: "short" })
    .replace(".", "").toUpperCase();
  const month = start.toLocaleDateString("it-IT", { month: "short" })
    .replace(".", "").toUpperCase();
  const time = (date: Date) =>
    date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return (
    <TactilePressable
      accessibilityLabel={"Apri partecipazioni: " + event.title}
      onPress={onPress}
      style={s.eventCard}
    >
      <View style={s.eventMain}>
        <View style={s.eventDate}>
          <Text style={s.eventWeekday}>{dayName}</Text>
          <Text style={s.eventDay}>{start.getDate()}</Text>
          <Text style={s.eventMonth}>{month}</Text>
        </View>
        <View style={s.eventBody}>
          <Text style={s.eventType}>
            {event.required ? "CONFERMA RICHIESTA" : "APPUNTAMENTO"}
          </Text>
          <Text style={s.eventName} numberOfLines={2}>{event.title}</Text>
          <View style={s.eventMetaRow}>
            <Ionicons name="time-outline" size={15} color={subdued} />
            <Text style={s.eventMeta}>{time(start)} – {time(end)}</Text>
          </View>
          <View style={s.eventMetaRow}>
            <Ionicons name="location-outline" size={15} color={subdued} />
            <Text style={s.eventMeta} numberOfLines={1}>
              {event.location || "Luogo da definire"}
            </Text>
          </View>
        </View>
      </View>
      <View style={s.eventFooter}>
        <View style={s.eventAttendance}>
          <Ionicons name="people-outline" size={16} color={blue} />
          <Text style={s.eventAttendanceText}>
            {event.participantCount} confermati
          </Text>
        </View>
        <View style={s.eventOpen}>
          <Text style={s.eventOpenText}>Partecipazioni</Text>
          <Ionicons name="arrow-forward" size={16} color={blue} />
        </View>
      </View>
    </TactilePressable>
  );
}

function Shortcut({
  title, icon, onPress,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}) {
  return (
    <TactilePressable
      accessibilityLabel={title}
      onPress={onPress}
      style={s.shortcut}
      fluid
    >
      <View style={s.shortcutIcon}>
        <Ionicons name={icon} size={23} color={blue} />
      </View>
      <Text style={s.shortcutText}>{title}</Text>
      <Ionicons name="arrow-forward" size={14} color="#91A4BF" />
    </TactilePressable>
  );
}


function TactilePressable({
  children,
  style,
  onPress,
  accessibilityLabel,
  fluid = false,
}: {
  children: React.ReactNode;
  style: StyleProp<ViewStyle>;
  onPress: () => void;
  accessibilityLabel: string;
  fluid?: boolean;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const reduceMotion = React.useRef(false);
  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (mounted) reduceMotion.current = reduced;
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const animate = (toValue: number) => {
    if (reduceMotion.current) return;
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 28,
      bounciness: 1,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => animate(0.975)}
      onPressOut={() => animate(1)}
      style={fluid ? s.tactileFluid : undefined}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  tactileFluid: { flex: 1, minWidth: 0 },
  homeStack: { gap: 14, paddingBottom: 4 },
  header: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    marginTop: 3, marginBottom: 0,
  },
  headerCopy: { flex: 1, gap: 4 },
  eyebrow: {
    color: blue, fontSize: 11, lineHeight: 15,
    fontWeight: "900", letterSpacing: 2.1,
  },
  greeting: {
    color: navy, fontSize: 30, lineHeight: 36,
    fontFamily: typography.display, fontWeight: "800", letterSpacing: -0.8,
  },
  headerSubtitle: {
    color: subdued, fontSize: 13, lineHeight: 19,
    fontFamily: typography.body, fontWeight: "500",
  },
  refresh: {
    marginTop: 7, height: 44, width: 44, borderRadius: 14,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6EDF7",
    alignItems: "center", justifyContent: "center",
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.8 },
  hero: {
    backgroundColor: navy, borderRadius: 20,
    paddingHorizontal: 19, paddingTop: 19, paddingBottom: 14,
    overflow: "hidden", minHeight: 146, gap: 12,
  },
  heroStripeWide: {
    position: "absolute", top: -50, right: -26,
    width: 69, height: 260, opacity: 0.15,
    transform: [{ rotate: "-22deg" }],
  },
  heroStripeNarrow: {
    position: "absolute", top: -35, right: 61,
    width: 28, height: 250, opacity: 0.19,
    transform: [{ rotate: "-22deg" }],
  },
  heroMain: { flexDirection: "row", alignItems: "center", gap: 14 },
  heroLogoFrame: {
    width: 74,
    height: 74,
    borderRadius: 19,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogoAccent: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 14,
    opacity: 0.35,
    transform: [{ rotate: "12deg" }],
  },
  heroLogo: {
    width: 64, height: 64, borderRadius: 15,
    backgroundColor: "#FFFFFF", padding: 4,
    overflow: "hidden", alignItems: "center", justifyContent: "center",
  },
  heroLogoImage: { width: "100%", height: "100%" },
  heroText: { flex: 1, minWidth: 0, gap: 5 },
  heroEyebrow: {
    color: "#B6C9EC", fontSize: 10, lineHeight: 13,
    fontWeight: "900", letterSpacing: 2.1,
  },
  heroName: {
    color: "#FFFFFF", fontSize: 24, lineHeight: 30,
    fontFamily: typography.display, fontWeight: "800", letterSpacing: -0.6,
  },
  heroFooter: { gap: 10 },
  heroRule: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.23)" },
  heroFooterRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", gap: 10,
  },
  heroRole: {
    color: "#D9E5F8", fontSize: 12, lineHeight: 17, fontWeight: "700", flexShrink: 1,
  },
  colors: { flexDirection: "row", gap: 6 },
  colorDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.7)",
  },
  errorBox: {
    borderRadius: 16, borderWidth: 1, borderColor: "#EFC3CD",
    backgroundColor: "#FFF5F7", padding: 14, gap: 10,
  },
  errorText: { color: "#AF3C51", fontSize: 14, lineHeight: 20 },
  section: { gap: 9 },
  sectionHeading: {
    flexDirection: "row", alignItems: "flex-end",
    justifyContent: "space-between", gap: 10,
  },
  sectionEyebrow: {
    color: "#6882AD", fontSize: 10, lineHeight: 15,
    fontWeight: "900", letterSpacing: 1.7, marginBottom: 2,
  },
  sectionTitle: {
    color: navy, fontSize: 20, lineHeight: 26,
    fontFamily: typography.heading, fontWeight: "800", letterSpacing: -0.4,
  },
  inlineLink: {
    flexDirection: "row", alignItems: "center", gap: 4,
    minHeight: 32, paddingHorizontal: 2,
  },
  inlineLinkText: { color: blue, fontSize: 13, fontWeight: "800" },
  eventCard: {
    backgroundColor: "#FFFFFF", borderRadius: 19,
    borderWidth: 1, borderColor: "#E3EBF6", overflow: "hidden",
    ...theme.shadow,
  },
  eventMain: {
    flexDirection: "row", gap: 13, paddingHorizontal: 15,
    paddingTop: 14, paddingBottom: 12,
  },
  eventDate: {
    width: 62, minHeight: 84, backgroundColor: soft, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  eventWeekday: {
    color: blue, fontSize: 10, fontWeight: "900", letterSpacing: 1.2,
  },
  eventDay: {
    color: navy, fontSize: 33, lineHeight: 37,
    fontFamily: typography.display, fontWeight: "800", letterSpacing: -0.8,
  },
  eventMonth: { color: blue, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  eventBody: { flex: 1, gap: 6 },
  eventType: {
    color: blue, fontSize: 10, lineHeight: 14,
    fontWeight: "900", letterSpacing: 1.2,
  },
  eventName: {
    color: navy, fontSize: 18, lineHeight: 23,
    fontFamily: typography.heading, fontWeight: "800", letterSpacing: -0.15,
  },
  eventMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventMeta: { color: subdued, fontSize: 13, lineHeight: 18, flex: 1 },
  eventFooter: {
    minHeight: 44, borderTopWidth: 1, borderTopColor: "#EDF1F7",
    paddingHorizontal: 16, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center", gap: 8,
  },
  eventAttendance: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventAttendanceText: { color: subdued, fontSize: 12, fontWeight: "700" },
  eventOpen: { flexDirection: "row", alignItems: "center", gap: 4 },
  eventOpenText: { color: blue, fontSize: 12, fontWeight: "900" },
  emptyPanel: {
    minHeight: 100, backgroundColor: "#FFFFFF", borderWidth: 1,
    borderColor: "#E4EBF5", borderRadius: 18,
    padding: 16, flexDirection: "row", alignItems: "center", gap: 13,
  },
  emptyIcon: {
    width: 46, height: 46, borderRadius: 13,
    backgroundColor: soft, alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { color: navy, fontSize: 15, fontWeight: "800", marginBottom: 3 },
  emptyText: { color: subdued, fontSize: 13, lineHeight: 19 },
  shortcutRow: { flexDirection: "row", gap: 9 },
  shortcut: {
    flex: 1, minWidth: 0, minHeight: 82, backgroundColor: "#FFFFFF",
    borderRadius: 15, borderWidth: 1, borderColor: "#E5ECF6",
    padding: 10, gap: 4, justifyContent: "space-between", alignItems: "flex-start",
  },
  shortcutIcon: {
    height: 32, width: 32, borderRadius: 10, backgroundColor: "#EDF4FF",
    alignItems: "center", justifyContent: "center",
  },
  shortcutText: {
    color: navy, fontSize: 13, lineHeight: 17,
    fontFamily: typography.heading, fontWeight: "800", flexShrink: 1,
  },
  overviewSection: { gap: 7 },
  overviewHeading: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  overviewLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  overviewCard: {
    minHeight: 106, flexDirection: "row",
    borderRadius: 17, overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E3EBF6",
    ...theme.shadow,
  },
  overviewAttendance: {
    width: 121, backgroundColor: "#164DAC",
    paddingHorizontal: 12, paddingVertical: 13,
    justifyContent: "center",
  },
  overviewAttendanceLabel: {
    color: "#DCEAFF", fontSize: 9, lineHeight: 13,
    fontWeight: "900", letterSpacing: 0.8,
  },
  overviewAttendanceValue: {
    color: "#FFFFFF", fontSize: 32, lineHeight: 39,
    fontFamily: typography.display, fontWeight: "800", letterSpacing: -0.9,
  },
  overviewAttendanceNote: {
    color: "#DBE9FF", fontSize: 10, lineHeight: 13,
  },
  overviewNumbers: {
    flex: 1, minWidth: 0, flexDirection: "row",
    alignItems: "center", paddingHorizontal: 2,
  },
  overviewDivider: {
    width: 1, height: 49, backgroundColor: "#E9EEF7",
  },
  miniStat: {
    flex: 1, minWidth: 0, alignItems: "center",
    justifyContent: "center", gap: 5, paddingHorizontal: 1,
  },
  miniStatValue: {
    color: navy, fontSize: 24, lineHeight: 29,
    fontFamily: typography.display, fontWeight: "800", letterSpacing: -0.5,
  },
  miniStatLabel: {
    color: subdued, fontSize: 10, lineHeight: 13,
    textAlign: "center", fontWeight: "700",
  },
});

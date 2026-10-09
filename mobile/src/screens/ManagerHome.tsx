import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Screen } from "../ui";
import { theme } from "../theme";
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
  const attendanceAvailable = (stats.attendanceHistory?.length ?? 0) > 0;
  const attendance = Math.max(0, Math.min(100, stats.attendanceRate));

  return (
    <Screen key="manager-home" withBottomNav>
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
          onPress={onRetry}
          style={({ pressed }) => [s.refresh, pressed && s.pressed]}
        >
          <Ionicons name="refresh-outline" size={22} color={navy} />
        </Pressable>
      </View>

      <ParanzaIdentity paranza={paranza} />

      {error ? (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
          <Button title="Riprova" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}

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
        <Text style={s.sectionEyebrow}>TUTTO A PORTATA DI MANO</Text>
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

      <View style={s.section}>
        <View style={s.sectionHeading}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionEyebrow}>IL POLSO DELLA PARANZA</Text>
            <Text style={s.sectionTitle}>La paranza, in numeri</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate("stats")}
            style={s.inlineLink}
          >
            <Text style={s.inlineLinkText}>Dettagli</Text>
            <Ionicons name="arrow-forward" size={15} color={blue} />
          </Pressable>
        </View>
        <View style={s.attendanceCard}>
          <View style={s.attendanceTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.attendanceEyebrow}>PRESENZA MEDIA</Text>
              <Text style={s.attendanceValue}>
                {loading || !attendanceAvailable ? "—" : Math.round(attendance) + "%"}
              </Text>
            </View>
            <View style={s.attendanceIcon}>
              <Ionicons name="pulse-outline" size={26} color="#FFFFFF" />
            </View>
          </View>
          <View style={s.attendanceBar}>
            <View
              style={[
                s.attendanceFill,
                { width: ((loading || !attendanceAvailable ? 0 : attendance) + "%") as `${number}%` },
              ]}
            />
          </View>
          <Text style={s.attendanceHelp}>
            {attendanceAvailable
              ? "Media delle conferme di partecipazione agli eventi"
              : "Disponibile dopo le prime risposte agli eventi"}
          </Text>
        </View>
        <View style={s.statsStrip}>
          <StatItem
            label="Cullatori"
            value={loading ? "—" : stats.memberCount}
            icon="people-outline"
          />
          <View style={s.statDivider} />
          <StatItem
            label="Attivi"
            value={loading ? "—" : stats.activeMemberCount}
            icon="person-outline"
          />
          <View style={s.statDivider} />
          <StatItem
            label="Eventi"
            value={loading ? "—" : stats.eventCount}
            icon="calendar-clear-outline"
          />
        </View>
      </View>
    </Screen>
  );
}

function ParanzaIdentity({ paranza }: { paranza?: Paranza }) {
  const primary = paranza?.primaryColor || "#FFFFFF";
  const secondary = paranza?.secondaryColor || blue;
  return (
    <View style={s.hero}>
      <View pointerEvents="none" style={s.orbitLarge} />
      <View pointerEvents="none" style={s.orbitSmall} />
      <View style={s.heroMain}>
        <View style={s.heroLogo}>
          {paranza?.logoUrl ? (
            <Image
              source={{ uri: paranza.logoUrl }}
              style={s.heroLogoImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="flag-outline" size={34} color={blue} />
          )}
        </View>
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={"Apri partecipazioni: " + event.title}
      onPress={onPress}
      style={({ pressed }) => [s.eventCard, pressed && s.pressed]}
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
    </Pressable>
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [s.shortcut, pressed && s.pressed]}
    >
      <View style={s.shortcutIcon}>
        <Ionicons name={icon} size={23} color={blue} />
      </View>
      <Text style={s.shortcutText}>{title}</Text>
      <Ionicons name="arrow-forward" size={14} color="#91A4BF" />
    </Pressable>
  );
}

function StatItem({
  label, value, icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View style={s.stat}>
      <Ionicons name={icon} size={18} color="#6381AF" />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    marginTop: 7, marginBottom: 2,
  },
  headerCopy: { flex: 1, gap: 4 },
  eyebrow: {
    color: blue, fontSize: 11, lineHeight: 15,
    fontWeight: "900", letterSpacing: 2.1,
  },
  greeting: {
    color: navy, fontSize: 32, lineHeight: 38,
    fontWeight: "900", letterSpacing: -1.15,
  },
  headerSubtitle: { color: subdued, fontSize: 14, lineHeight: 20, fontWeight: "500" },
  refresh: {
    marginTop: 7, height: 44, width: 44, borderRadius: 14,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6EDF7",
    alignItems: "center", justifyContent: "center",
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.8 },
  hero: {
    backgroundColor: navy, borderRadius: 22,
    paddingHorizontal: 21, paddingTop: 22, paddingBottom: 17,
    overflow: "hidden", minHeight: 169, gap: 18,
  },
  orbitLarge: {
    position: "absolute", top: -75, right: -60, width: 235, height: 235,
    borderRadius: 120, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  orbitSmall: {
    position: "absolute", right: -8, bottom: -90, width: 180, height: 180,
    borderRadius: 90, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  heroMain: { flexDirection: "row", alignItems: "center", gap: 16 },
  heroLogo: {
    width: 75, height: 75, borderRadius: 18,
    backgroundColor: "#FFFFFF", borderWidth: 3, borderColor: "#FFFFFF",
    overflow: "hidden", alignItems: "center", justifyContent: "center",
  },
  heroLogoImage: { width: "100%", height: "100%" },
  heroText: { flex: 1, minWidth: 0, gap: 5 },
  heroEyebrow: {
    color: "#B6C9EC", fontSize: 10, lineHeight: 13,
    fontWeight: "900", letterSpacing: 2.1,
  },
  heroName: {
    color: "#FFFFFF", fontSize: 26, lineHeight: 31,
    fontWeight: "900", letterSpacing: -0.65,
  },
  heroFooter: { gap: 12 },
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
  section: { gap: 13 },
  sectionHeading: {
    flexDirection: "row", alignItems: "flex-end",
    justifyContent: "space-between", gap: 10,
  },
  sectionEyebrow: {
    color: "#6882AD", fontSize: 10, lineHeight: 15,
    fontWeight: "900", letterSpacing: 1.7, marginBottom: 2,
  },
  sectionTitle: {
    color: navy, fontSize: 21, lineHeight: 27,
    fontWeight: "900", letterSpacing: -0.55,
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
    flexDirection: "row", gap: 15, paddingHorizontal: 16,
    paddingTop: 17, paddingBottom: 14,
  },
  eventDate: {
    width: 66, minHeight: 89, backgroundColor: soft, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  eventWeekday: {
    color: blue, fontSize: 10, fontWeight: "900", letterSpacing: 1.2,
  },
  eventDay: {
    color: navy, fontSize: 33, lineHeight: 36,
    fontWeight: "900", letterSpacing: -1,
  },
  eventMonth: { color: blue, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  eventBody: { flex: 1, gap: 6 },
  eventType: {
    color: blue, fontSize: 10, lineHeight: 14,
    fontWeight: "900", letterSpacing: 1.2,
  },
  eventName: {
    color: navy, fontSize: 18, lineHeight: 22,
    fontWeight: "900", letterSpacing: -0.25,
  },
  eventMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventMeta: { color: subdued, fontSize: 13, lineHeight: 18, flex: 1 },
  eventFooter: {
    minHeight: 47, borderTopWidth: 1, borderTopColor: "#EDF1F7",
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
  shortcutRow: { flexDirection: "row", gap: 10 },
  shortcut: {
    flex: 1, minWidth: 0, minHeight: 112, backgroundColor: "#FFFFFF",
    borderRadius: 17, borderWidth: 1, borderColor: "#E5ECF6",
    padding: 12, gap: 8, justifyContent: "space-between", alignItems: "flex-start",
  },
  shortcutIcon: {
    height: 38, width: 38, borderRadius: 12, backgroundColor: "#EDF4FF",
    alignItems: "center", justifyContent: "center",
  },
  shortcutText: {
    color: navy, fontSize: 13, lineHeight: 17,
    fontWeight: "900", flexShrink: 1,
  },
  attendanceCard: {
    backgroundColor: "#1450AD", borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 19, gap: 13, overflow: "hidden",
  },
  attendanceTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  attendanceEyebrow: {
    color: "#D8E6FF", fontSize: 11, lineHeight: 15,
    fontWeight: "900", letterSpacing: 1.5,
  },
  attendanceValue: {
    color: "#FFFFFF", fontSize: 48, lineHeight: 55,
    fontWeight: "900", letterSpacing: -1.9,
  },
  attendanceIcon: {
    height: 45, width: 45, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.17)",
    justifyContent: "center", alignItems: "center",
  },
  attendanceBar: {
    height: 6, backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 3, overflow: "hidden",
  },
  attendanceFill: { height: "100%", borderRadius: 3, backgroundColor: "#FFFFFF" },
  attendanceHelp: { color: "#D8E6FF", fontSize: 12, lineHeight: 17 },
  statsStrip: {
    borderRadius: 18, borderWidth: 1, borderColor: "#E4EBF6",
    backgroundColor: "#FFFFFF", paddingHorizontal: 8,
    minHeight: 113, flexDirection: "row", alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5 },
  statDivider: { width: 1, height: 56, backgroundColor: "#E7EDF6" },
  statValue: {
    color: navy, fontSize: 29, lineHeight: 33,
    fontWeight: "900", letterSpacing: -0.8,
  },
  statLabel: {
    color: subdued, fontSize: 12, lineHeight: 16,
    fontWeight: "700", textAlign: "center",
  },
});

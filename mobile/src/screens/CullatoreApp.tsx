import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  cullatoreMe,
  demoEvents,
  demoMessages,
  demoNotifications,
  EVENT_IMAGE,
} from "../demo";
import { EventItem } from "../types";
import {
  Avatar,
  Banner,
  BottomNav,
  Brand,
  Button,
  Card,
  HeaderButton,
  Metric,
  Pill,
  Screen,
  SectionTitle,
  Title,
} from "../ui";
import { theme } from "../theme";

type Tab = "home" | "events" | "messages" | "calendar" | "profile";

const nav = [
  { key: "home", label: "Home", icon: "home-outline", iconActive: "home" },
  { key: "events", label: "Eventi", icon: "calendar-outline", iconActive: "calendar" },
  { key: "messages", label: "Messaggi", icon: "chatbox-outline", iconActive: "chatbox" },
  { key: "calendar", label: "Calendario", icon: "calendar-number-outline", iconActive: "calendar-number" },
  { key: "profile", label: "Profilo", icon: "person-outline", iconActive: "person" },
] as const;

export function CullatoreApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("home");
  const [events, setEvents] = useState<EventItem[]>(demoEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>();
  const [showNotifications, setShowNotifications] = useState(false);

  function setRSVP(eventId: number, status: "confirmed" | "maybe" | "absent") {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId ? { ...event, rsvp: status } : event,
      ),
    );
    setSelectedEvent((current) =>
      current?.id === eventId ? { ...current, rsvp: status } : current,
    );
  }

  if (showNotifications) {
    return <Notifications onBack={() => setShowNotifications(false)} />;
  }

  if (selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        onBack={() => setSelectedEvent(undefined)}
        onRSVP={(status) => setRSVP(selectedEvent.id, status)}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {tab === "home" && (
        <Home
          events={events}
          onOpen={setSelectedEvent}
          onRSVP={setRSVP}
          onNotifications={() => setShowNotifications(true)}
        />
      )}
      {tab === "events" && <Events events={events} onOpen={setSelectedEvent} />}
      {tab === "messages" && <Messages />}
      {tab === "calendar" && <Calendar events={events} onOpen={setSelectedEvent} />}
      {tab === "profile" && <Profile onLogout={onLogout} />}
      <BottomNav
        items={[...nav]}
        active={tab}
        onChange={(key) => setTab(key as Tab)}
      />
    </View>
  );
}

function Home({
  events,
  onOpen,
  onRSVP,
  onNotifications,
}: {
  events: EventItem[];
  onOpen: (event: EventItem) => void;
  onRSVP: (id: number, status: "confirmed" | "maybe" | "absent") => void;
  onNotifications: () => void;
}) {
  const next = events[0];
  return (
    <Screen key="cullatore-home">
      <View style={styles.headerRow}>
        <Brand compact />
        <HeaderButton icon="notifications-outline" badge onPress={onNotifications} />
      </View>

      <Banner />

      <View>
        <Text style={styles.hello}>Ciao Davide</Text>
        <Text style={styles.subtle}>Base sinistra · Orgoglio Nolano</Text>
      </View>

      <View style={styles.metricRow}>
        <Metric label="Eventi" value={32} icon="calendar-outline" />
        <Metric label="Cullatori" value={28} icon="people-outline" />
        <Metric label="Presenza" value="75%" ring />
      </View>

      <SectionTitle action="Vedi tutti">Prossimo evento</SectionTitle>
      {next ? (
        <Card>
          <Pressable onPress={() => onOpen(next)}>
            <EventRow event={next} />
          </Pressable>
          <RSVPButtons event={next} onRSVP={onRSVP} />
        </Card>
      ) : null}
    </Screen>
  );
}

function Events({
  events,
  onOpen,
}: {
  events: EventItem[];
  onOpen: (event: EventItem) => void;
}) {
  return (
    <Screen key="cullatore-events">
      <PageHeader title="Eventi" />
      <View style={styles.filterRow}>
        <Pill label="Tutti" active />
        <Pill label="Prove" />
        <Pill label="Festa" />
        <Pill label="Cene" />
      </View>
      {events.map((event) => (
        <Pressable key={event.id} onPress={() => onOpen(event)}>
          <Card>
            <EventRow event={event} />
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

function EventDetail({
  event,
  onBack,
  onRSVP,
}: {
  event: EventItem;
  onBack: () => void;
  onRSVP: (status: "confirmed" | "maybe" | "absent") => void;
}) {
  return (
    <Screen key="cullatore-event-detail">
      <PageHeader title="Dettaglio evento" onBack={onBack} actionIcon="settings-outline" />

      <ImageBackground
        source={EVENT_IMAGE}
        style={styles.eventImage}
        imageStyle={styles.eventImageStyle}
        resizeMode="cover"
      >
        <View style={styles.eventShade} />
      </ImageBackground>

      <Text style={styles.eventTitle}>{event.title}</Text>
      <InfoLine icon="calendar-outline" text="Sab 20 Lug 2024 · 20:00 - 22:00" />
      <InfoLine icon="location-outline" text="Zona Duomo, Nola" />

      <Text style={styles.body}>
        Prova generale in vista della festa. È importante la presenza di tutti.
        Forza Orgoglio Nolano!
      </Text>

      <View style={styles.organizer}>
        <Text style={styles.organizerLabel}>Capoparanza</Text>
        <View style={styles.organizerRow}>
          <Avatar initials="LI" size={32} />
          <Text style={styles.personName}>Luca Iorio</Text>
        </View>
      </View>

      <Card>
        <InfoRow icon="location-outline" label="Luogo" value="Zona Duomo, Nola" />
        <InfoRow
          icon="people-outline"
          label="Partecipanti"
          value="24 confermati, 4 forse, 2 assenti"
        />
        <InfoRow
          icon="shirt-outline"
          label="Note"
          value="Portare scarpe comode e maglia della paranza."
          last
        />
      </Card>

      <View style={styles.flexSpacer} />
      <RSVPButtons event={event} onRSVP={(_, status) => onRSVP(status)} />
    </Screen>
  );
}

function Messages() {
  const [filter, setFilter] = useState<"all" | "manager" | "paranza">("all");
  return (
    <Screen key="cullatore-messages">
      <PageHeader title="Messaggi" />
      <View style={styles.search}>
        <Ionicons name="search-outline" size={16} color={theme.colors.muted} />
        <Text style={styles.searchPlaceholder}>Cerca nei messaggi...</Text>
      </View>

      <View style={styles.filterRow}>
        <Pill label="Tutti" active={filter === "all"} onPress={() => setFilter("all")} />
        <Pill label="Capoparanza" active={filter === "manager"} onPress={() => setFilter("manager")} />
        <Pill label="Paranza" active={filter === "paranza"} onPress={() => setFilter("paranza")} />
      </View>

      {demoMessages.map((message, index) => (
        <View key={message.id} style={styles.messageRow}>
          <Avatar initials={message.senderName === "Luca Iorio" ? "LI" : "ON"} size={35} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.headerRow}>
              <Text style={styles.personName}>{message.senderName}</Text>
              <Text style={styles.timeText}>
                {index === 0 ? "10:24" : index === 1 ? "Ieri" : String(index + 1) + " giorni"}
              </Text>
            </View>
            <Text style={styles.messagePreview} numberOfLines={1}>
              {message.body}
            </Text>
          </View>
          {index === 0 ? <View style={styles.unreadDot} /> : null}
        </View>
      ))}
    </Screen>
  );
}

function Calendar({
  events,
  onOpen,
}: {
  events: EventItem[];
  onOpen: (event: EventItem) => void;
}) {
  const monthLabel = useMemo(() => "Luglio 2024", []);

  return (
    <Screen key="cullatore-calendar">
      <PageHeader title="Calendario eventi" />
      <Card style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Ionicons name="chevron-back" size={17} color={theme.colors.blue} />
          <Text style={styles.calendarMonth}>{monthLabel}</Text>
          <Ionicons name="chevron-forward" size={17} color={theme.colors.blue} />
        </View>

        <View style={styles.weekRow}>
          {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
            <Text key={d + String(i)} style={styles.weekDay}>{d}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: 35 }, (_, i) => i + 1).map((day) => {
            const active = day === 20;
            const marked = day === 12 || day === 27;
            return (
              <View key={day} style={styles.dayCell}>
                <View style={[styles.dayCircle, active && styles.dayCircleActive]}>
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>
                    {day}
                  </Text>
                </View>
                {marked ? <View style={styles.dayDot} /> : null}
              </View>
            );
          })}
        </View>
      </Card>

      {events.map((event) => (
        <Pressable key={event.id} onPress={() => onOpen(event)}>
          <Card>
            <EventRow event={event} compact />
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

function Profile({ onLogout }: { onLogout: () => void }) {
  return (
    <Screen key="cullatore-profile">
      <PageHeader title="Il mio profilo" actionIcon="settings-outline" />

      <View style={styles.profileHeader}>
        <Avatar initials="DE" size={58} />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>
            {cullatoreMe.user.firstName} {cullatoreMe.user.lastName}
          </Text>
          <Text style={styles.subtle}>Cullatore · Base sinistra</Text>
        </View>
      </View>

      <Card>
        <View style={styles.profileParanza}>
          <Banner />
          <View style={styles.profileParanzaCopy}>
            <Text style={styles.personName}>Orgoglio Nolano</Text>
            <Text style={styles.subtle}>Capoparanza{"\n"}Luca Iorio</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={theme.colors.blue} />
        </View>
      </Card>

      <Card>
        <InfoRow icon="accessibility-outline" label="La mia posizione" value="Base sinistra" />
        <InfoRow icon="calendar-outline" label="Anno di partecipazione" value="Dal 2018" />
        <InfoRow icon="call-outline" label="Contatti d’emergenza" value="2 contatti" />
        <InfoRow icon="settings-outline" label="Impostazioni" value="›" last />
      </Card>

      <Button title="Esci dalla demo" variant="ghost" onPress={onLogout} />
    </Screen>
  );
}

function Notifications({ onBack }: { onBack: () => void }) {
  return (
    <Screen key="cullatore-notifications">
      <PageHeader title="Notifiche" onBack={onBack} />
      <Text style={styles.groupTitle}>Oggi</Text>
      <NotificationRow
        icon="notifications"
        title="Promemoria evento"
        body="Prova della paranza oggi alle 20:00. Non mancare!"
        time="10:30"
      />
      <NotificationRow
        icon="shirt"
        title="Ricorda la maglia"
        body="Porta con te la maglia della paranza."
        time="08:15"
      />

      <Text style={styles.groupTitle}>Ieri</Text>
      <NotificationRow
        icon="chatbox-ellipses"
        title="Nuovo messaggio"
        body="Luca Iorio: Ragazzi, ci vediamo..."
        time="19:20"
      />
      <NotificationRow
        icon="people"
        title="Aggiornamento evento"
        body="L’orario della prova è stato modificato."
        time="17:45"
      />

      <Text style={styles.groupTitle}>Questa settimana</Text>
      <NotificationRow
        icon="calendar"
        title="Riunione paranza"
        body="Riunione organizzativa presso la Casa della paranza."
        time="Lun 17:30"
      />
    </Screen>
  );
}

function PageHeader({
  title,
  onBack,
  actionIcon,
}: {
  title: string;
  onBack?: () => void;
  actionIcon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View style={styles.pageHeader}>
      {onBack ? (
        <HeaderButton icon="chevron-back" onPress={onBack} />
      ) : (
        <HeaderButton icon="chevron-back" />
      )}
      <Text style={styles.pageTitle}>{title}</Text>
      {actionIcon ? <HeaderButton icon={actionIcon} /> : <View style={{ width: 30 }} />}
    </View>
  );
}

function RSVPButtons({
  event,
  onRSVP,
}: {
  event: EventItem;
  onRSVP: (id: number, status: "confirmed" | "maybe" | "absent") => void;
}) {
  return (
    <View style={styles.rsvp}>
      <Button
        title={event.rsvp === "confirmed" ? "✓ Partecipo" : "Partecipo"}
        onPress={() => onRSVP(event.id, "confirmed")}
      />
      <View style={styles.rsvpRow}>
        <View style={{ flex: 1 }}>
          <Button
            title={event.rsvp === "maybe" ? "✓ Forse" : "Forse"}
            variant="secondary"
            onPress={() => onRSVP(event.id, "maybe")}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={event.rsvp === "absent" ? "✓ Non partecipo" : "Non partecipo"}
            variant="danger"
            onPress={() => onRSVP(event.id, "absent")}
          />
        </View>
      </View>
    </View>
  );
}

function EventRow({ event, compact = false }: { event: EventItem; compact?: boolean }) {
  return (
    <View style={styles.eventRow}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateWeek}>SAB</Text>
        <Text style={styles.dateDay}>20</Text>
        <Text style={styles.dateMonth}>LUG</Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.eventRowTitle}>{event.title}</Text>
        <Text style={styles.subtle}>20:00 - 22:00</Text>
        <Text style={styles.subtle}>{event.location}</Text>
        {!compact ? (
          <View style={styles.peopleInline}>
            <Ionicons name="people" size={11} color={theme.colors.blue} />
            <Text style={styles.peopleText}>{event.participantCount} partecipanti</Text>
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.blue} />
    </View>
  );
}

function InfoLine({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
}) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={14} color={theme.colors.blue} />
      <Text style={styles.infoLineText}>{text}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Ionicons name={icon} size={16} color={theme.colors.blue} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function NotificationRow({
  icon,
  title,
  body,
  time,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
  time: string;
}) {
  return (
    <View style={styles.notificationRow}>
      <View style={styles.notificationIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.blue} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationBody}>{body}</Text>
      </View>
      <Text style={styles.notificationTime}>{time}</Text>
      <Ionicons name="chevron-forward" size={14} color={theme.colors.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hello: {
    color: theme.colors.blueDark,
    fontSize: 26,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtle: { color: theme.colors.text, fontSize: 10.5, lineHeight: 15 },
  metricRow: { flexDirection: "row", gap: 7 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dateBadge: {
    width: 48,
    height: 58,
    borderRadius: 8,
    backgroundColor: theme.colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dateWeek: { color: theme.colors.blue, fontSize: 8, fontWeight: "900" },
  dateDay: {
    color: theme.colors.blueDark,
    fontSize: 18,
    lineHeight: 19,
    fontWeight: "900",
  },
  dateMonth: { color: theme.colors.blue, fontSize: 8, fontWeight: "900" },
  eventRowTitle: { color: theme.colors.blueDark, fontSize: 11.5, fontWeight: "900" },
  peopleInline: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  peopleText: { color: theme.colors.blue, fontSize: 8.5, fontWeight: "700" },
  rsvp: { gap: 6 },
  rsvpRow: { flexDirection: "row", gap: 6 },
  pageHeader: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: { color: theme.colors.blueDark, fontSize: 14, fontWeight: "900" },
  eventImage: { height: 112, borderRadius: 8, overflow: "hidden" },
  eventImageStyle: { borderRadius: 8 },
  eventShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(4,31,78,0.12)",
  },
  eventTitle: {
    color: theme.colors.blueDark,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "900",
  },
  infoLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLineText: { color: theme.colors.blue, fontSize: 10.5 },
  body: { color: theme.colors.text, fontSize: 11, lineHeight: 16 },
  organizer: { gap: 5 },
  organizerLabel: { color: theme.colors.text, fontSize: 9.5, fontWeight: "700" },
  organizerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  personName: { color: theme.colors.blueDark, fontSize: 10.5, fontWeight: "900" },
  infoRow: {
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: { color: theme.colors.text, fontSize: 10, width: 70 },
  infoValue: {
    color: theme.colors.blueDark,
    fontSize: 10,
    fontWeight: "700",
    flex: 1,
  },
  flexSpacer: { flex: 1, minHeight: 3 },
  search: {
    height: 38,
    borderRadius: 9,
    backgroundColor: "#F1F5FA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 7,
  },
  searchPlaceholder: { color: theme.colors.muted, fontSize: 10.5 },
  messageRow: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
  },
  timeText: { color: theme.colors.muted, fontSize: 8.5 },
  messagePreview: { color: theme.colors.text, fontSize: 9.5 },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.blue },
  calendarCard: { gap: 6 },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarMonth: { color: theme.colors.blueDark, fontSize: 13, fontWeight: "900" },
  weekRow: { flexDirection: "row" },
  weekDay: {
    width: "14.2857%",
    color: theme.colors.muted,
    fontSize: 8,
    textAlign: "center",
    fontWeight: "800",
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.2857%", alignItems: "center", minHeight: 30 },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: { backgroundColor: theme.colors.blue },
  dayText: { color: theme.colors.text, fontSize: 8.5, fontWeight: "700" },
  dayTextActive: { color: "#FFFFFF", fontWeight: "900" },
  dayDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.blue,
    marginTop: 1,
  },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileName: { color: theme.colors.blueDark, fontSize: 13, fontWeight: "900" },
  profileParanza: { flexDirection: "row", alignItems: "center", gap: 8 },
  profileParanzaCopy: { flex: 1, gap: 2 },
  groupTitle: { color: theme.colors.blueDark, fontSize: 12, fontWeight: "900" },
  notificationRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
  },
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationTitle: { color: theme.colors.blueDark, fontSize: 10.5, fontWeight: "900" },
  notificationBody: { color: theme.colors.text, fontSize: 9.5, lineHeight: 13 },
  notificationTime: { color: theme.colors.blue, fontSize: 8.5 },
});

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  cullatoreMe,
  demoEvents,
  demoMessages,
  demoNotifications,
} from "../demo";
import { EventItem } from "../types";
import {
  Avatar,
  Banner,
  BottomNav,
  Brand,
  Button,
  Card,
  Metric,
  Pill,
  Screen,
  SectionTitle,
  Title,
} from "../ui";
import { theme } from "../theme";

type Tab = "home" | "events" | "messages" | "calendar" | "profile";

const nav = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "events", label: "Eventi", icon: "□" },
  { key: "messages", label: "Messaggi", icon: "✉" },
  { key: "calendar", label: "Calendario", icon: "▦" },
  { key: "profile", label: "Profilo", icon: "○" },
];

export function CullatoreApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("home");
  const [events, setEvents] = useState<EventItem[]>(demoEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>();

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

  return (
    <View style={{ flex: 1 }}>
      {selectedEvent ? (
        <EventDetail
          event={selectedEvent}
          onBack={() => setSelectedEvent(undefined)}
          onRSVP={(status) => setRSVP(selectedEvent.id, status)}
        />
      ) : (
        <>
          {tab === "home" && (
            <Home events={events} onOpen={setSelectedEvent} onRSVP={setRSVP} />
          )}
          {tab === "events" && <Events events={events} onOpen={setSelectedEvent} />}
          {tab === "messages" && <Messages />}
          {tab === "calendar" && <Calendar events={events} onOpen={setSelectedEvent} />}
          {tab === "profile" && <Profile onLogout={onLogout} />}
          <BottomNav items={nav} active={tab} onChange={(key) => setTab(key as Tab)} />
        </>
      )}
    </View>
  );
}

function Home({
  events,
  onOpen,
  onRSVP,
}: {
  events: EventItem[];
  onOpen: (event: EventItem) => void;
  onRSVP: (id: number, status: "confirmed" | "maybe" | "absent") => void;
}) {
  const next = events[0];
  const confirmed = events.filter((e) => e.rsvp === "confirmed").length;
  return (
    <Screen key="cullatore-home">
      <View style={styles.topRow}>
        <Brand compact />
        <View style={styles.bell}><Text style={styles.bellText}>●</Text></View>
      </View>

      <Banner />
      <View style={styles.profileRow}>
        <Avatar initials="DE" size={46} />
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Ciao Davide</Text>
          <Text style={styles.subtle}>Ritiro sinistro · Orgoglio Nolano</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric label="Eventi" value={events.length} />
        <Metric label="Confermati" value={confirmed} />
        <Metric label="Presenza" value="75%" />
      </View>

      <SectionTitle action="Vedi tutti">Prossimo evento</SectionTitle>
      {next ? (
        <Card elevated>
          <Pressable onPress={() => onOpen(next)}>
            <EventRow event={next} />
          </Pressable>
          <RSVPButtons event={next} onRSVP={onRSVP} />
        </Card>
      ) : null}

      <SectionTitle>Ultimo messaggio</SectionTitle>
      <Card>
        <View style={styles.messageHead}>
          <Avatar initials="LI" size={38} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardStrong}>Luca Iorio</Text>
            <Text style={styles.subtle}>Oggi, 10:24</Text>
          </View>
        </View>
        <Text style={styles.body}>
          Ragazzi, ci vediamo sabato alle 20:00 in Zona Duomo per la prova della paranza.
        </Text>
      </Card>
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
      <Title subtitle="Tutti gli appuntamenti della tua paranza.">Eventi</Title>
      <View style={styles.pills}>
        <Pill label="Tutti" active />
        <Pill label="Prove" />
        <Pill label="Festa" />
        <Pill label="Cene" />
      </View>
      {events.map((event) => (
        <Pressable key={event.id} onPress={() => onOpen(event)}>
          <Card elevated>
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
      <View style={styles.topRow}>
        <Pressable onPress={onBack}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Dettaglio evento</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.eventHero}>
        <Text style={styles.heroEyebrow}>ORGOGLIO NOLANO</Text>
        <Text style={styles.heroTitle}>{event.title}</Text>
      </View>

      <Title subtitle={formatEvent(event)}>{event.title}</Title>

      <Card>
        <Text style={styles.body}>{event.description}</Text>
        <InfoRow label="Luogo" value={event.location} />
        <InfoRow label="Partecipanti" value={String(event.participantCount) + " confermati"} />
        {event.attire ? <InfoRow label="Note" value={event.attire} /> : null}
      </Card>

      <SectionTitle>La tua partecipazione</SectionTitle>
      <RSVPButtons event={event} onRSVP={(_, status) => onRSVP(status)} />
    </Screen>
  );
}

function Messages() {
  const [filter, setFilter] = useState<"all" | "manager" | "paranza">("all");
  return (
    <Screen key="cullatore-messages">
      <Title subtitle="Ricevi le comunicazioni del capoparanza.">Messaggi</Title>

      <View style={styles.searchMock}>
        <Text style={styles.searchGlyph}>⌕</Text>
        <Text style={styles.searchText}>Cerca nei messaggi...</Text>
      </View>

      <View style={styles.pills}>
        <Pill label="Tutti" active={filter === "all"} onPress={() => setFilter("all")} />
        <Pill label="Capoparanza" active={filter === "manager"} onPress={() => setFilter("manager")} />
        <Pill label="Paranza" active={filter === "paranza"} onPress={() => setFilter("paranza")} />
      </View>

      {demoMessages.map((message, index) => (
        <View key={message.id} style={styles.messageRow}>
          <Avatar initials={message.senderName === "Luca Iorio" ? "LI" : "ON"} />
          <View style={{ flex: 1, gap: 3 }}>
            <View style={styles.topRow}>
              <Text style={styles.cardStrong}>{message.senderName}</Text>
              <Text style={styles.timeText}>{index === 0 ? "10:24" : index === 1 ? "Ieri" : "3 giorni"}</Text>
            </View>
            <Text style={styles.messageTitle}>{message.title}</Text>
            <Text style={styles.preview} numberOfLines={1}>{message.body}</Text>
          </View>
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
  const monthLabel = useMemo(() => {
    const d = new Date(events[0]?.startsAt ?? new Date());
    return d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  }, [events]);

  return (
    <Screen key="cullatore-calendar">
      <Title subtitle="Tutti gli eventi della paranza.">Calendario eventi</Title>
      <Card>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarArrow}>‹</Text>
          <Text style={styles.calendarMonth}>{monthLabel}</Text>
          <Text style={styles.calendarArrow}>›</Text>
        </View>

        <View style={styles.weekdays}>
          {["L", "M", "M", "G", "V", "S", "D"].map((day, i) => (
            <Text key={day + "-" + i} style={styles.weekday}>{day}</Text>
          ))}
        </View>

        <View style={styles.days}>
          {Array.from({ length: 35 }, (_, i) => i + 1).map((day) => {
            const active = day === 20;
            return (
              <View key={day} style={styles.dayCell}>
                <View style={[styles.dayCircle, active && styles.dayCircleActive]}>
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
                </View>
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
      <View style={styles.topRow}>
        <Title>Il mio profilo</Title>
        <View style={styles.settings}><Text style={styles.settingsText}>⚙</Text></View>
      </View>

      <View style={styles.profileHero}>
        <Avatar initials="DE" size={72} />
        <Text style={styles.profileName}>
          {cullatoreMe.user.firstName} {cullatoreMe.user.lastName}
        </Text>
        <Text style={styles.subtle}>Cullatore · {cullatoreMe.user.position}</Text>
      </View>

      <Banner />

      <Card>
        <InfoRow label="La mia posizione" value="Ritiro sinistro" />
        <InfoRow label="Anno di partecipazione" value="Dal 2018" />
        <InfoRow label="Contatti di emergenza" value="2 contatti" />
        <InfoRow label="Impostazioni" value="›" />
      </Card>

      <SectionTitle>Notifiche</SectionTitle>
      {demoNotifications.map((item) => (
        <Card key={item.id}>
          <Text style={styles.cardStrong}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </Card>
      ))}

      <Button title="Esci dalla demo" variant="ghost" onPress={onLogout} />
    </Screen>
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
    <View style={styles.rsvpWrap}>
      <Button
        title={event.rsvp === "confirmed" ? "✓ Partecipo" : "Partecipo"}
        onPress={() => onRSVP(event.id, "confirmed")}
      />
      <View style={styles.twoCol}>
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
  const date = new Date(event.startsAt);
  return (
    <View style={styles.eventRow}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateDay}>{date.getDate().toString().padStart(2, "0")}</Text>
        <Text style={styles.dateMonth}>
          {date.toLocaleDateString("it-IT", { month: "short" }).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.cardStrong}>{event.title}</Text>
        <Text style={styles.subtle}>{formatEvent(event)}</Text>
        <Text style={styles.subtle}>{event.location}</Text>
        {!compact ? (
          <Text style={styles.peopleText}>♟ {event.participantCount} partecipanti</Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function formatEvent(event: EventItem) {
  const date = new Date(event.startsAt);
  return date.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }) + " · " + date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  hello: { color: theme.colors.blueDark, fontSize: 25, fontWeight: "900", letterSpacing: -0.8 },
  subtle: { color: theme.colors.text, fontSize: 12, lineHeight: 18 },
  metrics: { flexDirection: "row", gap: 8 },
  cardStrong: { color: theme.colors.ink, fontSize: 14, fontWeight: "900" },
  body: { color: theme.colors.text, fontSize: 13, lineHeight: 19 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateBadge: { width: 54, height: 58, borderRadius: 13, backgroundColor: theme.colors.blueSoft, alignItems: "center", justifyContent: "center" },
  dateDay: { color: theme.colors.blueDark, fontSize: 20, fontWeight: "900" },
  dateMonth: { color: theme.colors.blue, fontSize: 9, fontWeight: "900" },
  peopleText: { color: theme.colors.blue, fontSize: 10, fontWeight: "700" },
  chevron: { color: theme.colors.blue, fontSize: 24 },
  rsvpWrap: { gap: 8 },
  twoCol: { flexDirection: "row", gap: 8 },
  bell: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.blueSoft, alignItems: "center", justifyContent: "center" },
  bellText: { color: theme.colors.blue, fontSize: 11 },
  messageHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  back: { color: theme.colors.blue, fontSize: 38, lineHeight: 38 },
  headerTitle: { color: theme.colors.blueDark, fontSize: 17, fontWeight: "900" },
  eventHero: { minHeight: 172, borderRadius: theme.radius.lg, backgroundColor: theme.colors.blueDeep, padding: 20, justifyContent: "flex-end", gap: 5, overflow: "hidden" },
  heroEyebrow: { color: "#BFD3FF", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", letterSpacing: -0.8 },
  infoRow: { minHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.line, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  infoLabel: { color: theme.colors.text, fontSize: 12 },
  infoValue: { color: theme.colors.ink, fontSize: 12, fontWeight: "800", flexShrink: 1, textAlign: "right" },
  searchMock: { minHeight: 44, borderRadius: 12, backgroundColor: "#F1F4F8", flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 8 },
  searchGlyph: { color: theme.colors.muted, fontSize: 18 },
  searchText: { color: theme.colors.muted, fontSize: 13 },
  messageRow: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.line },
  timeText: { color: theme.colors.muted, fontSize: 10, fontWeight: "700" },
  messageTitle: { color: theme.colors.blueDark, fontSize: 12, fontWeight: "800" },
  preview: { color: theme.colors.text, fontSize: 12 },
  calendarHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calendarMonth: { color: theme.colors.blueDark, fontSize: 16, fontWeight: "900", textTransform: "capitalize" },
  calendarArrow: { color: theme.colors.blue, fontSize: 24 },
  weekdays: { flexDirection: "row", marginTop: 8 },
  weekday: { flex: 1, textAlign: "center", color: theme.colors.muted, fontSize: 10, fontWeight: "800" },
  days: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  dayCell: { width: "14.2857%", alignItems: "center", paddingVertical: 5 },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  dayCircleActive: { backgroundColor: theme.colors.blue },
  dayText: { color: theme.colors.text, fontSize: 11, fontWeight: "700" },
  dayTextActive: { color: "#FFFFFF" },
  settings: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: theme.colors.line, alignItems: "center", justifyContent: "center" },
  settingsText: { color: theme.colors.blueDark, fontSize: 14 },
  profileHero: { alignItems: "center", gap: 6, paddingVertical: 10 },
  profileName: { color: theme.colors.blueDark, fontSize: 23, fontWeight: "900" },
});

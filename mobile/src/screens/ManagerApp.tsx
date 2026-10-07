import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import {
  demoEvents,
  demoMembers,
  demoMessages,
  demoNotifications,
  demoParticipants,
  demoStats,
  managerMe,
} from "../demo";
import { EventItem, MessageItem, Participant } from "../types";
import {
  Avatar,
  Banner,
  BottomNav,
  Brand,
  Button,
  Card,
  Field,
  Metric,
  Pill,
  Screen,
  SectionTitle,
  Title,
} from "../ui";
import { theme } from "../theme";

type Tab = "home" | "events" | "messages" | "members" | "stats";
const nav = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "events", label: "Eventi", icon: "□" },
  { key: "messages", label: "Messaggi", icon: "✉" },
  { key: "members", label: "Cullatori", icon: "◎" },
  { key: "stats", label: "Altro", icon: "⋯" },
];

const eventTypes = [
  "Prova della paranza",
  "Bandiera",
  "Questua",
  "Zona della borda",
  "Giglio spogliato",
  "Giglio vestito",
  "Sabato dei comitati",
  "Domenica della festa",
];

export function ManagerApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("home");
  const [events, setEvents] = useState<EventItem[]>(demoEvents);
  const [messages, setMessages] = useState<MessageItem[]>(demoMessages);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>();

  return (
    <View style={{ flex: 1 }}>
      {selectedEvent ? (
        <ParticipantsView
          event={selectedEvent}
          participants={demoParticipants}
          onBack={() => setSelectedEvent(undefined)}
        />
      ) : (
        <>
          {tab === "home" && <Home events={events} onOpenEvent={setSelectedEvent} />}
          {tab === "events" && (
            <Events
              events={events}
              setEvents={setEvents}
              onOpenParticipants={setSelectedEvent}
            />
          )}
          {tab === "messages" && (
            <Messages messages={messages} setMessages={setMessages} />
          )}
          {tab === "members" && <Members />}
          {tab === "stats" && <Stats onLogout={onLogout} />}
          <BottomNav items={nav} active={tab} onChange={(key) => setTab(key as Tab)} />
        </>
      )}
    </View>
  );
}

function Home({
  events,
  onOpenEvent,
}: {
  events: EventItem[];
  onOpenEvent: (event: EventItem) => void;
}) {
  const next = events[0];
  return (
    <Screen key="manager-home">
      <View style={styles.topRow}>
        <Brand compact />
        <View style={styles.settingsDot}><Text style={styles.settingsGlyph}>⚙</Text></View>
      </View>

      <Banner />
      <View style={styles.greetingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Ciao Luca</Text>
          <Text style={styles.subtle}>Capoparanza di Orgoglio Nolano</Text>
        </View>
        <Avatar initials="LI" size={46} />
      </View>

      <View style={styles.metrics}>
        <Metric label="Cullatori" value={demoStats.memberCount} />
        <Metric label="Uomini attivi" value={demoStats.activeMemberCount} />
        <Metric label="Eventi" value={demoStats.eventCount} />
        <Metric label="Presenza media" value="75%" />
      </View>

      <SectionTitle action="Vedi tutti">Prossimi eventi</SectionTitle>
      {next ? (
        <Pressable onPress={() => onOpenEvent(next)}>
          <Card elevated>
            <EventRow event={next} />
          </Card>
        </Pressable>
      ) : null}

      <SectionTitle>Azioni rapide</SectionTitle>
      <View style={styles.quickGrid}>
        <QuickCard icon="＋" title="Nuovo evento" subtitle="Organizza un appuntamento" />
        <QuickCard icon="✉" title="Messaggio" subtitle="Scrivi alla paranza" />
      </View>
    </Screen>
  );
}

function Events({
  events,
  setEvents,
  onOpenParticipants,
}: {
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  onOpenParticipants: (event: EventItem) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState(eventTypes[0] ?? "Prova della paranza");
  const [title, setTitle] = useState("Prova della paranza");
  const [location, setLocation] = useState("Zona Duomo, Nola");
  const [description, setDescription] = useState("Prova generale in vista della festa.");
  const [required, setRequired] = useState(true);

  function create() {
    const start = new Date();
    start.setDate(start.getDate() + 12);
    start.setHours(20, 0, 0, 0);
    const end = new Date(start);
    end.setHours(22, 0, 0, 0);
    setEvents((current) => [
      {
        id: Date.now(),
        type,
        title,
        description,
        location,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        required,
        attire: "Maglia della paranza",
        participantCount: 0,
        rsvp: "",
      },
      ...current,
    ]);
    setCreating(false);
  }

  if (creating) {
    return (
      <Screen key="manager-create-event">
        <View style={styles.topRow}>
          <Pressable onPress={() => setCreating(false)}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Nuovo evento</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.fieldCaption}>TIPO DI EVENTO</Text>
        <View style={styles.pills}>
          {eventTypes.map((item) => (
            <Pill
              key={item}
              label={item}
              active={type === item}
              onPress={() => {
                setType(item);
                setTitle(item);
              }}
            />
          ))}
        </View>

        <Field label="Titolo" value={title} onChangeText={setTitle} />
        <View style={styles.twoCol}>
          <Card style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>DATA</Text>
            <Text style={styles.cardStrong}>20 Luglio</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>ORARIO</Text>
            <Text style={styles.cardStrong}>20:00 — 22:00</Text>
          </Card>
        </View>
        <Field label="Luogo" value={location} onChangeText={setLocation} />
        <Field label="Descrizione" value={description} onChangeText={setDescription} multiline />

        <Card>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardStrong}>Richiede conferma</Text>
              <Text style={styles.subtle}>I cullatori dovranno rispondere all'invito.</Text>
            </View>
            <Switch
              value={required}
              onValueChange={setRequired}
              trackColor={{ false: "#D9E0EA", true: theme.colors.blue }}
            />
          </View>
        </Card>

        <Button title="Crea evento" onPress={create} />
      </Screen>
    );
  }

  return (
    <Screen key="manager-events">
      <View style={styles.topRow}>
        <Title>Eventi</Title>
        <Pressable onPress={() => setCreating(true)} style={styles.plusButton}>
          <Text style={styles.plus}>＋</Text>
        </Pressable>
      </View>
      <Button title="Crea nuovo evento" onPress={() => setCreating(true)} />
      {events.map((event) => (
        <Pressable key={event.id} onPress={() => onOpenParticipants(event)}>
          <Card elevated>
            <EventRow event={event} />
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

function Messages({
  messages,
  setMessages,
}: {
  messages: MessageItem[];
  setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}) {
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("Prova di sabato");
  const [body, setBody] = useState("");

  function send() {
    if (!body.trim()) return;
    setMessages((current) => [
      {
        id: Date.now(),
        title: subject,
        body,
        senderName: "Luca Iorio",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setBody("");
    setComposing(false);
  }

  return (
    <Screen key="manager-messages">
      <View style={styles.topRow}>
        <Title>Messaggi</Title>
        <Pressable onPress={() => setComposing(!composing)} style={styles.plusButton}>
          <Text style={styles.plus}>＋</Text>
        </Pressable>
      </View>

      {composing ? (
        <Card elevated>
          <Text style={styles.fieldCaption}>DESTINATARI</Text>
          <View style={styles.pills}>
            <Pill label="Tutti i cullatori · 32" active />
            <Pill label="Seleziona cullatori" />
          </View>
          <Field label="Oggetto" value={subject} onChangeText={setSubject} />
          <Field label="Messaggio" value={body} onChangeText={setBody} multiline />
          <Button title="Invia messaggio" onPress={send} />
        </Card>
      ) : (
        <Button title="Nuovo messaggio" onPress={() => setComposing(true)} />
      )}

      {messages.map((message) => (
        <Card key={message.id}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardStrong}>{message.title}</Text>
              <Text style={styles.subtle}>{message.senderName}</Text>
            </View>
            <Text style={styles.dateText}>{formatShortDate(message.createdAt)}</Text>
          </View>
          <Text style={styles.body}>{message.body}</Text>
        </Card>
      ))}
    </Screen>
  );
}

function Members() {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const filtered = demoMembers.filter((member) =>
    filter === "all" ? true : filter === "active" ? member.isActive : !member.isActive,
  );

  return (
    <Screen key="manager-members">
      <Title subtitle="Visualizza e gestisci i membri della tua paranza.">
        I miei cullatori
      </Title>
      <View style={styles.searchMock}>
        <Text style={styles.searchGlyph}>⌕</Text>
        <Text style={styles.searchText}>Cerca un cullatore...</Text>
      </View>
      <View style={styles.pills}>
        <Pill label="Tutti 32" active={filter === "all"} onPress={() => setFilter("all")} />
        <Pill label="Attivi 28" active={filter === "active"} onPress={() => setFilter("active")} />
        <Pill label="Non attivi 4" active={filter === "inactive"} onPress={() => setFilter("inactive")} />
      </View>

      {filtered.map((member) => (
        <View key={member.userId} style={styles.memberRow}>
          <Avatar initials={initials(member.name)} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardStrong}>{member.name}</Text>
            <Text style={styles.subtle}>{member.position}</Text>
          </View>
          <Pill
            label={member.isActive ? "Attivo" : "Non attivo"}
            tone={member.isActive ? "success" : "default"}
          />
        </View>
      ))}
    </Screen>
  );
}

function Stats({ onLogout }: { onLogout: () => void }) {
  return (
    <Screen key="manager-stats">
      <Title subtitle="Monitora la partecipazione agli eventi.">Statistiche</Title>
      <Card elevated style={{ alignItems: "center", paddingVertical: 26 }}>
        <Text style={styles.fieldCaption}>TASSO DI PRESENZA</Text>
        <View style={styles.rateCircle}>
          <Text style={styles.rateValue}>75%</Text>
        </View>
        <Text style={styles.subtle}>24 presenti su 32 cullatori · ultimo evento</Text>
      </Card>

      <SectionTitle>Andamento presenze</SectionTitle>
      <Card>
        <View style={styles.chart}>
          {[58, 46, 72, 68, 83, 75].map((value, index) => (
            <View key={index} style={styles.chartColumn}>
              <View style={[styles.bar, { height: value }]} />
              <Text style={styles.barLabel}>{["Apr", "Mag", "Giu", "Lug", "Ago", "Set"][index]}</Text>
            </View>
          ))}
        </View>
      </Card>

      <SectionTitle>Promemoria</SectionTitle>
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

function ParticipantsView({
  event,
  participants,
  onBack,
}: {
  event: EventItem;
  participants: Participant[];
  onBack: () => void;
}) {
  const counts = useMemo(
    () => ({
      confirmed: participants.filter((p) => p.status === "confirmed").length,
      maybe: participants.filter((p) => p.status === "maybe").length,
      absent: participants.filter((p) => p.status === "absent").length,
    }),
    [participants],
  );

  return (
    <Screen key="participants">
      <View style={styles.topRow}>
        <Pressable onPress={onBack}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>{event.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subtle}>{formatEvent(event)} · {event.location}</Text>

      <View style={styles.metrics}>
        <Metric label="Confermati" value={counts.confirmed} />
        <Metric label="Forse" value={counts.maybe} />
        <Metric label="Assenti" value={counts.absent} />
      </View>

      <View style={styles.searchMock}>
        <Text style={styles.searchGlyph}>⌕</Text>
        <Text style={styles.searchText}>Cerca un cullatore...</Text>
      </View>

      {participants.map((p) => (
        <View key={p.userId} style={styles.memberRow}>
          <Avatar initials={initials(p.name)} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardStrong}>{p.name}</Text>
            <Text style={styles.subtle}>{p.position}</Text>
          </View>
          <Pill
            label={statusLabel(p.status)}
            tone={p.status === "confirmed" ? "success" : p.status === "maybe" ? "maybe" : "danger"}
          />
        </View>
      ))}
    </Screen>
  );
}

function EventRow({ event }: { event: EventItem }) {
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
        <Text style={styles.peopleText}>♟ {event.participantCount} partecipanti</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </View>
  );
}

function QuickCard({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <Card style={styles.quickCard}>
      <View style={styles.quickIcon}><Text style={styles.quickIconText}>{icon}</Text></View>
      <Text style={styles.cardStrong}>{title}</Text>
      <Text style={styles.subtle}>{subtitle}</Text>
    </Card>
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

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function initials(name: string) {
  return name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
}

function statusLabel(status: Participant["status"]) {
  if (status === "confirmed") return "Confermato";
  if (status === "maybe") return "Forse";
  return "Assente";
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  greetingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  hello: { color: theme.colors.blueDark, fontSize: 28, fontWeight: "900", letterSpacing: -0.9 },
  subtle: { color: theme.colors.text, fontSize: 12, lineHeight: 18 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickGrid: { flexDirection: "row", gap: 10 },
  quickCard: { flex: 1, minHeight: 130 },
  quickIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.blueSoft, alignItems: "center", justifyContent: "center" },
  quickIconText: { color: theme.colors.blue, fontSize: 18, fontWeight: "900" },
  settingsDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  settingsGlyph: { fontSize: 14, color: theme.colors.blueDark },
  plusButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.blueSoft, alignItems: "center", justifyContent: "center" },
  plus: { color: theme.colors.blue, fontSize: 23, lineHeight: 25 },
  back: { color: theme.colors.blue, fontSize: 38, lineHeight: 38 },
  headerTitle: { color: theme.colors.blueDark, fontSize: 17, fontWeight: "900" },
  fieldCaption: { color: theme.colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  twoCol: { flexDirection: "row", gap: 8 },
  smallLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  cardStrong: { color: theme.colors.ink, fontSize: 14, fontWeight: "900" },
  body: { color: theme.colors.text, fontSize: 13, lineHeight: 19 },
  dateText: { color: theme.colors.muted, fontSize: 10, fontWeight: "700" },
  searchMock: { minHeight: 44, borderRadius: 12, backgroundColor: "#F1F4F8", flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 8 },
  searchGlyph: { color: theme.colors.muted, fontSize: 18 },
  searchText: { color: theme.colors.muted, fontSize: 13 },
  memberRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.line },
  rateCircle: { width: 132, height: 132, borderRadius: 66, borderWidth: 14, borderColor: theme.colors.blue, alignItems: "center", justifyContent: "center", marginVertical: 8 },
  rateValue: { color: theme.colors.blueDark, fontSize: 32, fontWeight: "900" },
  chart: { height: 130, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 8 },
  chartColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 6 },
  bar: { width: 20, borderRadius: 5, backgroundColor: theme.colors.blue },
  barLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: "700" },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateBadge: { width: 54, height: 58, borderRadius: 13, backgroundColor: theme.colors.blueSoft, alignItems: "center", justifyContent: "center" },
  dateDay: { color: theme.colors.blueDark, fontSize: 20, fontWeight: "900" },
  dateMonth: { color: theme.colors.blue, fontSize: 9, fontWeight: "900" },
  peopleText: { color: theme.colors.blue, fontSize: 10, fontWeight: "700" },
  chevron: { color: theme.colors.blue, fontSize: 24, fontWeight: "400" },
});

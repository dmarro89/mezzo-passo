import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  demoEvents,
  demoMembers,
  demoMessages,
  demoParticipants,
  demoStats,
} from "../demo";
import { EventItem, MessageItem, Paranza, Participant } from "../types";
import {
  Avatar,
  Banner,
  BottomNav,
  Brand,
  Button,
  Card,
  Field,
  HeaderButton,
  Metric,
  Pill,
  Screen,
  SectionTitle,
  Title,
} from "../ui";
import { theme } from "../theme";

type Tab = "home" | "events" | "messages" | "members" | "stats";

const nav = [
  { key: "home", label: "Home", icon: "home-outline", iconActive: "home" },
  { key: "events", label: "Eventi", icon: "calendar-outline", iconActive: "calendar" },
  { key: "messages", label: "Messaggi", icon: "chatbox-outline", iconActive: "chatbox" },
  { key: "members", label: "Cullatori", icon: "people-outline", iconActive: "people" },
  { key: "stats", label: "Altro", icon: "menu-outline" },
] as const;

const eventTypes = [
  { label: "Prova della paranza", icon: "people-outline" },
  { label: "Bandiera", icon: "flag-outline" },
  { label: "Questua", icon: "flower-outline" },
  { label: "Zona della borda", icon: "walk-outline" },
  { label: "Giglio spogliato", icon: "accessibility-outline" },
  { label: "Giglio vestito", icon: "body-outline" },
  { label: "Sabato dei comitati", icon: "sparkles-outline" },
  { label: "Domenica della festa", icon: "sunny-outline" },
] as const;

export function ManagerApp({
  paranza,
  onLogout,
}: {
  paranza?: Paranza;
  onLogout: () => void;
}) {
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
          {tab === "home" && (
            <Home
              events={events}
              paranza={paranza}
              onOpenEvent={setSelectedEvent}
            />
          )}
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
          {tab === "stats" && <Stats events={events} onLogout={onLogout} />}
          <BottomNav
            items={[...nav]}
            active={tab}
            onChange={(key) => setTab(key as Tab)}
          />
        </>
      )}
    </View>
  );
}

function Home({
  events,
  paranza,
  onOpenEvent,
}: {
  events: EventItem[];
  paranza?: Paranza;
  onOpenEvent: (event: EventItem) => void;
}) {
  const next = events[0];
  return (
    <Screen key="manager-home" withBottomNav>
      <View style={styles.homeHeader}>
        <View style={styles.headerSpacer} />
        <Brand compact />
        <HeaderButton icon="settings-outline" />
      </View>

      <Banner name={paranza?.name ?? "Orgoglio Nolano"} />

      <View>
        <Text style={styles.hello}>
          Ciao {paranza?.managerName?.split(" ")[0] ?? "Luca"}
        </Text>
        <Text style={styles.subtle}>
          Capoparanza di {paranza?.name ?? "Orgoglio Nolano"}
        </Text>
      </View>

      <View style={styles.metricRows}>
        <View style={styles.metricRow}>
          <Metric label="Cullatori" value={32} icon="people-outline" />
          <Metric label="Uomini attivi" value={28} icon="person-outline" />
        </View>
        <View style={styles.metricRow}>
          <Metric label="Eventi" value={24} icon="calendar-outline" />
          <Metric label="Presenza media" value="75%" ring />
        </View>
      </View>

      <SectionTitle action="Vedi tutti">Prossimi eventi</SectionTitle>
      {next ? (
        <Pressable onPress={() => onOpenEvent(next)}>
          <Card>
            <EventRow event={next} />
          </Card>
        </Pressable>
      ) : null}
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
  const [type, setType] = useState("Prova della paranza");
  const [title, setTitle] = useState("Prova della paranza");
  const [location, setLocation] = useState("Zona Duomo, Nola");
  const [description, setDescription] = useState("Prova generale in vista della festa.");
  const [required, setRequired] = useState(true);

  function createEvent() {
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
      <Screen
        key="manager-create-event"
        withBottomNav
        footer={<Button large title="Crea evento" onPress={createEvent} />}
      >
        <PageHeader title="Nuovo evento" onBack={() => setCreating(false)} />

        <Text style={styles.blockLabel}>Tipo di evento</Text>
        <View style={styles.eventTypeGrid}>
          {eventTypes.map((item) => {
            const selected = item.label === type;
            return (
              <Pressable
                key={item.label}
                style={[styles.eventType, selected && styles.eventTypeSelected]}
                onPress={() => {
                  setType(item.label);
                  setTitle(item.label);
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={21}
                  color={selected ? theme.colors.blue : theme.colors.blueDark}
                />
                <Text style={[styles.eventTypeText, selected && { color: theme.colors.blue }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.blockLabel}>Dettagli evento</Text>
        <View style={styles.detailPair}>
          <DetailBox icon="calendar-outline" label="Data" value="20 Luglio 2024" />
          <DetailBox icon="time-outline" label="Orario" value="20:00 - 22:00" />
        </View>
        <DetailBox icon="location-outline" label="Luogo" value={location} />

        <Field
          label="Descrizione (opzionale)"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>Richiedi conferma di partecipazione</Text>
          <Switch
            value={required}
            onValueChange={setRequired}
            trackColor={{ false: "#CBD5E4", true: theme.colors.blue }}
            thumbColor="#FFFFFF"
          />
        </View>


      </Screen>
    );
  }

  return (
    <Screen key="manager-events" withBottomNav>
      <View style={styles.headerRow}>
        <Title>Eventi</Title>
        <HeaderButton icon="add" onPress={() => setCreating(true)} />
      </View>
      {events.map((event) => (
        <Pressable key={event.id} onPress={() => onOpenParticipants(event)}>
          <Card>
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
  const [body, setBody] = useState(
    "Ragazzi,\nci vediamo sabato alle 20:00 in Zona Duomo per la prova della paranza.\n\nÈ importante la presenza di tutti.\nForza Orgoglio Nolano!",
  );

  function sendMessage() {
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
    setComposing(false);
  }

  if (composing) {
    return (
      <Screen
        key="manager-compose"
        withBottomNav
        footer={<Button large title="Invia messaggio" onPress={sendMessage} />}
      >
        <PageHeader title="Nuovo messaggio" onBack={() => setComposing(false)} />
        <Text style={styles.blockLabel}>Destinatari</Text>
        <View style={styles.recipientRow}>
          <Pill label="Tutti i cullatori (32 membri)" active />
          <Pill label="Seleziona cullatori" />
        </View>
        <Field label="Oggetto" value={subject} onChangeText={setSubject} />
        <Field label="Messaggio" value={body} onChangeText={setBody} multiline />
        <Text style={styles.counter}>{body.length}/500</Text>

      </Screen>
    );
  }

  return (
    <Screen key="manager-messages" withBottomNav>
      <View style={styles.headerRow}>
        <Title>Messaggi</Title>
        <HeaderButton icon="add" onPress={() => setComposing(true)} />
      </View>
      <Button title="Nuovo messaggio" onPress={() => setComposing(true)} />
      {messages.map((message) => (
        <Card key={message.id}>
          <View style={styles.headerRow}>
            <Text style={styles.cardStrong}>{message.title}</Text>
            <Text style={styles.dateText}>{formatShortDate(message.createdAt)}</Text>
          </View>
          <Text style={styles.subtle}>{message.senderName}</Text>
          <Text style={styles.body}>{message.body}</Text>
        </Card>
      ))}
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
    <Screen key="manager-participants">
      <PageHeader title={event.title} onBack={onBack} />
      <Text style={styles.participantMeta}>
        Sab 20 Lug 2024 · 20:00 - 22:00{"\n"}Zona Duomo, Nola
      </Text>

      <View style={styles.segmentHeader}>
        <Text style={styles.segmentActive}>Partecipanti (32)</Text>
        <Text style={styles.segmentInactive}>Dettagli</Text>
      </View>

      <View style={styles.responseRow}>
        <ResponseBox value="24" label="Confermati" tone="success" />
        <ResponseBox value="4" label="Forse" tone="maybe" />
        <ResponseBox value="4" label="Assenti" tone="danger" />
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={theme.colors.muted} />
        <Text style={styles.searchPlaceholder}>Cerca un cullatore...</Text>
      </View>

      {participants.map((p) => (
        <View key={p.userId} style={styles.personRow}>
          <Avatar initials={initials(p.name)} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.personName}>{p.name}</Text>
            <Text style={styles.personPosition}>{p.position}</Text>
          </View>
          <Pill
            label={statusLabel(p.status)}
            tone={
              p.status === "confirmed"
                ? "success"
                : p.status === "maybe"
                  ? "maybe"
                  : "danger"
            }
          />
          <Ionicons name="ellipsis-horizontal" size={21} color={theme.colors.blue} />
        </View>
      ))}
    </Screen>
  );
}

function Members() {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const filtered = demoMembers.filter((member) =>
    filter === "all"
      ? true
      : filter === "active"
        ? member.isActive
        : !member.isActive,
  );

  return (
    <Screen key="manager-members" withBottomNav>
      <PageHeader title="I miei cullatori" actionIcon="add" />
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={theme.colors.muted} />
        <Text style={styles.searchPlaceholder}>Cerca un cullatore...</Text>
      </View>
      <View style={styles.recipientRow}>
        <Pill label="Tutti 32" active={filter === "all"} onPress={() => setFilter("all")} />
        <Pill label="Attivi 28" active={filter === "active"} onPress={() => setFilter("active")} />
        <Pill label="Non attivi 4" active={filter === "inactive"} onPress={() => setFilter("inactive")} />
      </View>

      {filtered.map((member) => (
        <View key={member.userId} style={styles.personRow}>
          <Avatar initials={initials(member.name)} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.personName}>{member.name}</Text>
            <Text style={styles.personPosition}>{member.position}</Text>
          </View>
          <Pill label={member.isActive ? "Attivo" : "Non attivo"} tone={member.isActive ? "success" : "default"} />
          <Ionicons name="ellipsis-horizontal" size={21} color={theme.colors.blue} />
        </View>
      ))}
    </Screen>
  );
}

function Stats({
  events,
  onLogout,
}: {
  events: EventItem[];
  onLogout: () => void;
}) {
  return (
    <Screen key="manager-stats" withBottomNav>
      <PageHeader title="Statistiche" />
      <Card>
        <Text style={styles.statsTitle}>Tasso di presenza</Text>
        <View style={styles.bigRing}>
          <Text style={styles.bigRingValue}>75%</Text>
        </View>
        <Text style={styles.statsCaption}>
          24 presenti su 32 cullatori{"\n"}ultimo evento
        </Text>
      </Card>

      <Text style={styles.statsTitle}>Andamento presenze</Text>
      <View style={styles.chartWrap}>
        {[58, 42, 67, 74, 66].map((value, i) => (
          <View key={i} style={styles.chartColumn}>
            <View style={[styles.chartBar, { height: value }]} />
            <Text style={styles.chartLabel}>{["Apr", "Mag", "Giu", "Lug", "Ago"][i]}</Text>
          </View>
        ))}
        <View style={styles.chartAxis}>
          <Text style={styles.axisLabel}>100%</Text>
          <Text style={styles.axisLabel}>75%</Text>
          <Text style={styles.axisLabel}>50%</Text>
          <Text style={styles.axisLabel}>25%</Text>
          <Text style={styles.axisLabel}>0%</Text>
        </View>
      </View>

      <SectionTitle action="Vedi tutti">Prossimi eventi</SectionTitle>
      {events.slice(0, 2).map((event) => (
        <Card key={event.id}>
          <EventRow event={event} />
        </Card>
      ))}

      <Button title="Esci dalla demo" variant="ghost" onPress={onLogout} />
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
  actionIcon?: "add";
}) {
  return (
    <View style={styles.pageHeader}>
      {onBack ? (
        <HeaderButton icon="chevron-back" onPress={onBack} />
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <Text style={styles.pageHeaderTitle}>{title}</Text>
      {actionIcon ? <HeaderButton icon={actionIcon} /> : <View style={styles.headerSpacer} />}
    </View>
  );
}

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailBox}>
      <Ionicons name={icon} size={17} color={theme.colors.blue} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function ResponseBox({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "success" | "maybe" | "danger";
}) {
  const bg =
    tone === "success"
      ? "#EAF8F3"
      : tone === "maybe"
        ? "#EFF3FF"
        : "#FFF0F1";
  const color =
    tone === "success"
      ? theme.colors.success
      : tone === "maybe"
        ? theme.colors.blueDark
        : theme.colors.danger;
  return (
    <View style={[styles.responseBox, { backgroundColor: bg }]}>
      <Text style={[styles.responseValue, { color }]}>{value}</Text>
      <Text style={[styles.responseLabel, { color }]}>{label}</Text>
    </View>
  );
}

function EventRow({ event }: { event: EventItem }) {
  const date = new Date(event.startsAt);
  return (
    <View style={styles.eventRow}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateWeek}>SAB</Text>
        <Text style={styles.dateDay}>{date.getDate().toString().padStart(2, "0")}</Text>
        <Text style={styles.dateMonth}>
          {date.toLocaleDateString("it-IT", { month: "short" }).replace(".", "").toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.cardStrong}>{event.title}</Text>
        <Text style={styles.subtle}>20:00 - 22:00</Text>
        <Text style={styles.subtle}>{event.location}</Text>
        <View style={styles.participantsInline}>
          <Ionicons name="people" size={11} color={theme.colors.blue} />
          <Text style={styles.peopleText}>{event.participantCount} partecipanti</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={21} color={theme.colors.blue} />
    </View>
  );
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusLabel(status: Participant["status"]) {
  if (status === "confirmed") return "Confermato";
  if (status === "maybe") return "Forse";
  return "Assente";
}

const styles = StyleSheet.create({
  headerSpacer: { width: 38, height: 38 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  homeHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hello: {
    color: theme.colors.blueDark,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtle: { color: theme.colors.text, fontSize: 15, lineHeight: 21 },
  metricRows: { gap: 10 },
  metricRow: { flexDirection: "row", gap: 10 },
  blockLabel: {
    color: theme.colors.blueDark,
    fontSize: 16,
    fontWeight: "900",
  },
  eventTypeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  eventType: {
    width: "48%",
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventTypeSelected: {
    borderColor: theme.colors.blue,
    backgroundColor: theme.colors.blueSoft,
  },
  eventTypeText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  detailPair: { flexDirection: "row", gap: 10 },
  detailBox: {
    flex: 1,
    minHeight: 62,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  detailLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: "700" },
  detailValue: { color: theme.colors.blueDark, fontSize: 15, fontWeight: "800" },
  confirmRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  confirmLabel: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  flexSpacer: { flex: 1, minHeight: 2 },
  recipientRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  counter: {
    color: theme.colors.muted,
    fontSize: 11,
    textAlign: "right",
    marginTop: -6,
  },
  body: { color: theme.colors.text, fontSize: 15, lineHeight: 22 },
  cardStrong: { color: theme.colors.blueDark, fontSize: 17, fontWeight: "900" },
  dateText: { color: theme.colors.muted, fontSize: 12 },
  participantMeta: {
    color: theme.colors.blue,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    marginTop: -7,
  },
  segmentHeader: {
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 26,
  },
  segmentActive: {
    color: theme.colors.blue,
    fontSize: 21,
    fontWeight: "900",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.blue,
    paddingBottom: 10,
  },
  segmentInactive: { color: theme.colors.text, fontSize: 14, paddingBottom: 10 },
  responseRow: { flexDirection: "row", gap: 10 },
  responseBox: {
    flex: 1,
    minHeight: 66,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  responseValue: { fontSize: 25, fontWeight: "900" },
  responseLabel: { fontSize: 12, fontWeight: "700" },
  search: {
    height: 50,
    borderRadius: 9,
    backgroundColor: "#F1F5FA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  searchPlaceholder: { color: theme.colors.muted, fontSize: 14 },
  personRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  personName: { color: theme.colors.blueDark, fontSize: 17, fontWeight: "900" },
  personPosition: { color: theme.colors.text, fontSize: 13 },
  statsTitle: { color: theme.colors.blueDark, fontSize: 18, fontWeight: "900" },
  bigRing: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 13,
    borderColor: theme.colors.blue,
    borderTopColor: "#DFEAFF",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  bigRingValue: { color: theme.colors.blueDark, fontSize: 28, fontWeight: "900" },
  statsCaption: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  chartWrap: {
    height: 112,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    paddingRight: 38,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  chartColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 4 },
  chartBar: { width: 17, backgroundColor: theme.colors.blue },
  chartLabel: { color: theme.colors.text, fontSize: 12 },
  chartAxis: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "space-between",
  },
  axisLabel: { color: theme.colors.muted, fontSize: 11.5 },
  pageHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageHeaderTitle: {
    color: theme.colors.blueDark,
    fontSize: 14,
    fontWeight: "900",
  },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateBadge: {
    width: 58,
    height: 70,
    borderRadius: 12,
    backgroundColor: theme.colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dateWeek: { color: theme.colors.blue, fontSize: 11, fontWeight: "900" },
  dateDay: { color: theme.colors.blueDark, fontSize: 25, lineHeight: 27, fontWeight: "900" },
  dateMonth: { color: theme.colors.blue, fontSize: 11, fontWeight: "900" },
  participantsInline: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  peopleText: { color: theme.colors.blue, fontSize: 12, fontWeight: "700" },
});

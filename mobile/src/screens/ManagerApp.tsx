import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { api } from "../api";
import {
  EventItem,
  Me,
  Member,
  MessageItem,
  NotificationItem,
  Participant,
  Stats,
} from "../types";
import {
  Banner,
  BottomNav,
  Brand,
  Button,
  Card,
  Empty,
  Field,
  Metric,
  Pill,
  Screen,
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

export function ManagerApp({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<Tab>("home");
  const [me, setMe] = useState<Me>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantEvent, setParticipantEvent] = useState<EventItem>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [meData, eventData, messageData, memberData, statsData, notificationData] =
        await Promise.all([
          api.me(token),
          api.events(token),
          api.messages(token),
          api.members(token),
          api.stats(token),
          api.notifications(token),
        ]);
      setMe(meData);
      setEvents(eventData);
      setMessages(messageData);
      setMembers(memberData);
      setStats(statsData);
      setNotifications(notificationData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di caricamento");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function showParticipants(event: EventItem) {
    setParticipantEvent(event);
    setParticipants(await api.participants(token, event.id));
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.colors.blue} />
      </Screen>
    );
  }

  if (participantEvent) {
    const confirmed = participants.filter((p) => p.status === "confirmed").length;
    const maybe = participants.filter((p) => p.status === "maybe").length;
    const absent = participants.filter((p) => p.status === "absent").length;
    return (
      <Screen>
        <Brand compact />
        <Button title="← Torna agli eventi" variant="ghost" onPress={() => setParticipantEvent(undefined)} />
        <Title subtitle={formatEventDate(participantEvent)}>
          {participantEvent.title}
        </Title>
        <View style={styles.metrics}>
          <Metric label="Confermati" value={confirmed} />
          <Metric label="Forse" value={maybe} />
          <Metric label="Assenti" value={absent} />
        </View>
        {participants.map((p) => (
          <Card key={p.userId}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.muted}>{p.position}</Text>
              </View>
              <Pill label={labelStatus(p.status)} active={p.status === "confirmed"} />
            </View>
          </Card>
        ))}
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {tab === "home" && (
        <ManagerHome me={me} stats={stats} events={events} error={error} onRefresh={load} />
      )}
      {tab === "events" && (
        <ManagerEvents token={token} events={events} onCreated={load} onParticipants={showParticipants} />
      )}
      {tab === "messages" && (
        <ManagerMessages token={token} messages={messages} onCreated={load} />
      )}
      {tab === "members" && <ManagerMembers members={members} />}
      {tab === "stats" && (
        <ManagerStats stats={stats} notifications={notifications} onLogout={onLogout} />
      )}
      <BottomNav items={nav} active={tab} onChange={(key) => setTab(key as Tab)} />
    </View>
  );
}

function ManagerHome({
  me,
  stats,
  events,
  error,
  onRefresh,
}: {
  me?: Me;
  stats?: Stats;
  events: EventItem[];
  error: string;
  onRefresh: () => void;
}) {
  const next = events[0];
  return (
    <Screen>
      <View style={styles.headerRow}>
        <Brand compact />
        <Pill label="Capoparanza" />
      </View>
      <Banner name={me?.paranza?.name} />
      <Title subtitle={me?.paranza?.name}>Ciao {me?.user.firstName ?? "Luca"}</Title>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.metrics}>
        <Metric label="Cullatori" value={stats?.memberCount ?? "—"} />
        <Metric label="Attivi" value={stats?.activeMemberCount ?? "—"} />
        <Metric label="Eventi" value={stats?.eventCount ?? "—"} />
        <Metric label="Presenza" value={stats ? `${Math.round(stats.attendanceRate)}%` : "—"} />
      </View>
      <Text style={styles.sectionTitle}>Prossimo evento</Text>
      {next ? <EventCard event={next} /> : <Empty text="Nessun evento." />}
      <Button title="Aggiorna dati" variant="ghost" onPress={onRefresh} />
    </Screen>
  );
}

function ManagerEvents({
  token,
  events,
  onCreated,
  onParticipants,
}: {
  token: string;
  events: EventItem[];
  onCreated: () => void;
  onParticipants: (event: EventItem) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState(eventTypes[0] ?? "Prova della paranza");
  const [title, setTitle] = useState("Prova della paranza");
  const [location, setLocation] = useState("Zona Duomo, Nola");
  const [description, setDescription] = useState("Prova generale della paranza.");
  const [attire, setAttire] = useState("Maglia della paranza e scarpe comode");
  const [required, setRequired] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const defaultTimes = useMemo(() => {
    const start = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    start.setHours(20, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  async function save() {
    try {
      setSaving(true);
      setError("");
      await api.createEvent(token, {
        type,
        title,
        description,
        location,
        startsAt: defaultTimes.start,
        endsAt: defaultTimes.end,
        required,
        attire,
      });
      setCreating(false);
      await onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore");
    } finally {
      setSaving(false);
    }
  }

  if (creating) {
    return (
      <Screen>
        <Brand compact />
        <Title subtitle="Organizza un nuovo appuntamento.">Nuovo evento</Title>
        <Text style={styles.sectionTitle}>Tipo di evento</Text>
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
        <Field label="Luogo" value={location} onChangeText={setLocation} />
        <Field label="Descrizione" value={description} onChangeText={setDescription} multiline />
        <Field label="Abbigliamento / promemoria" value={attire} onChangeText={setAttire} />
        <View style={styles.rowBetween}>
          <Text style={styles.name}>Richiede conferma</Text>
          <Switch value={required} onValueChange={setRequired} trackColor={{ true: theme.colors.blue }} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={saving ? "Salvataggio..." : "Crea evento"} disabled={saving} onPress={save} />
        <Button title="Annulla" variant="ghost" onPress={() => setCreating(false)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Title>Eventi</Title>
        <Pressable onPress={() => setCreating(true)}>
          <Text style={styles.plus}>＋</Text>
        </Pressable>
      </View>
      <Button title="Crea nuovo evento" onPress={() => setCreating(true)} />
      {events.map((event) => (
        <Card key={event.id}>
          <EventCard event={event} compact />
          <Button
            title="Vedi partecipanti"
            variant="secondary"
            onPress={() => onParticipants(event)}
          />
        </Card>
      ))}
    </Screen>
  );
}

function ManagerMessages({
  token,
  messages,
  onCreated,
}: {
  token: string;
  messages: MessageItem[];
  onCreated: () => void;
}) {
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("Comunicazione alla paranza");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function send() {
    setSaving(true);
    try {
      await api.createMessage(token, title, body);
      setBody("");
      setComposing(false);
      await onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Title>Messaggi</Title>
        <Pressable onPress={() => setComposing(!composing)}>
          <Text style={styles.plus}>＋</Text>
        </Pressable>
      </View>
      {composing ? (
        <Card>
          <Field label="Oggetto" value={title} onChangeText={setTitle} />
          <Field label="Messaggio" value={body} onChangeText={setBody} multiline />
          <Button
            title={saving ? "Invio..." : "Invia a tutti i cullatori"}
            disabled={saving || !body.trim()}
            onPress={send}
          />
        </Card>
      ) : (
        <Button title="Nuovo messaggio" onPress={() => setComposing(true)} />
      )}
      {messages.map((message) => (
        <Card key={message.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{message.title}</Text>
            <Text style={styles.date}>{formatDate(message.createdAt)}</Text>
          </View>
          <Text style={styles.muted}>{message.senderName}</Text>
          <Text style={styles.body}>{message.body}</Text>
        </Card>
      ))}
    </Screen>
  );
}

function ManagerMembers({ members }: { members: Member[] }) {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const filtered = members.filter((m) =>
    filter === "all" ? true : filter === "active" ? m.isActive : !m.isActive,
  );
  return (
    <Screen>
      <Title subtitle="Membri e posizioni nel Giglio.">I miei cullatori</Title>
      <View style={styles.pills}>
        <Pill label={`Tutti ${members.length}`} active={filter === "all"} onPress={() => setFilter("all")} />
        <Pill label="Attivi" active={filter === "active"} onPress={() => setFilter("active")} />
        <Pill label="Non attivi" active={filter === "inactive"} onPress={() => setFilter("inactive")} />
      </View>
      {filtered.map((member) => (
        <Card key={member.userId}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.muted}>{member.position}</Text>
            </View>
            <Pill label={member.isActive ? "Attivo" : "Non attivo"} active={member.isActive} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

function ManagerStats({
  stats,
  notifications,
  onLogout,
}: {
  stats?: Stats;
  notifications: NotificationItem[];
  onLogout: () => void;
}) {
  return (
    <Screen>
      <Title subtitle="Una vista rapida sull'andamento della paranza.">Statistiche</Title>
      <Card style={{ alignItems: "center", paddingVertical: 28 }}>
        <View style={styles.rateCircle}>
          <Text style={styles.rateValue}>{Math.round(stats?.attendanceRate ?? 0)}%</Text>
          <Text style={styles.muted}>presenza</Text>
        </View>
      </Card>
      <View style={styles.metrics}>
        <Metric label="Cullatori" value={stats?.memberCount ?? "—"} />
        <Metric label="Attivi" value={stats?.activeMemberCount ?? "—"} />
        <Metric label="Eventi" value={stats?.eventCount ?? "—"} />
      </View>
      <Text style={styles.sectionTitle}>Promemoria</Text>
      {notifications.slice(0, 4).map((n) => (
        <Card key={n.id}>
          <Text style={styles.name}>{n.title}</Text>
          <Text style={styles.body}>{n.body}</Text>
        </Card>
      ))}
      <Button title="Esci dalla demo" variant="ghost" onPress={onLogout} />
    </Screen>
  );
}

function EventCard({ event, compact }: { event: EventItem; compact?: boolean }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{event.title}</Text>
          <Text style={styles.muted}>{formatEventDate(event)}</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeDay}>
            {new Date(event.startsAt).getDate().toString().padStart(2, "0")}
          </Text>
          <Text style={styles.dateBadgeMonth}>
            {new Date(event.startsAt)
              .toLocaleDateString("it-IT", { month: "short" })
              .toUpperCase()}
          </Text>
        </View>
      </View>
      {!compact ? <Text style={styles.body}>{event.description}</Text> : null}
      <Text style={styles.muted}>⌖ {event.location}</Text>
      {event.attire ? <Text style={styles.muted}>Maglia · {event.attire}</Text> : null}
    </View>
  );
}

function formatEventDate(event: EventItem) {
  const date = new Date(event.startsAt);
  return `${date.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })} · ${date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function labelStatus(status: Participant["status"]) {
  if (status === "confirmed") return "Confermato";
  if (status === "maybe") return "Forse";
  if (status === "absent") return "Assente";
  return "Non risposto";
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sectionTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: "800", marginTop: 4 },
  name: { color: theme.colors.ink, fontSize: 15, fontWeight: "800" },
  muted: { color: theme.colors.text, fontSize: 12, lineHeight: 18 },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  error: { color: theme.colors.danger, fontSize: 13, fontWeight: "700" },
  plus: { color: theme.colors.blue, fontSize: 30, fontWeight: "500" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  date: { color: theme.colors.muted, fontSize: 11, fontWeight: "700" },
  dateBadge: { minWidth: 52, borderRadius: 12, backgroundColor: theme.colors.blueSoft, padding: 8, alignItems: "center" },
  dateBadgeDay: { color: theme.colors.blueDark, fontSize: 18, fontWeight: "800" },
  dateBadgeMonth: { color: theme.colors.blue, fontSize: 10, fontWeight: "800" },
  rateCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 16,
    borderColor: theme.colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  rateValue: { color: theme.colors.blueDark, fontSize: 34, fontWeight: "900" },
});

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../api";
import { EventItem, Me, MessageItem, NotificationItem } from "../types";
import {
  Banner,
  BottomNav,
  Brand,
  Button,
  Card,
  Empty,
  Metric,
  Pill,
  Screen,
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

export function CullatoreApp({
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selected, setSelected] = useState<EventItem>();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [meData, eventData, messageData, notificationData] = await Promise.all([
      api.me(token),
      api.events(token),
      api.messages(token),
      api.notifications(token),
    ]);
    setMe(meData);
    setEvents(eventData);
    setMessages(messageData);
    setNotifications(notificationData);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  async function rsvp(event: EventItem, status: "confirmed" | "maybe" | "absent") {
    await api.rsvp(token, event.id, status);
    await load();
    setSelected((prev) => (prev ? { ...prev, rsvp: status } : prev));
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.colors.blue} />
      </Screen>
    );
  }

  if (selected) {
    return (
      <EventDetail
        event={selected}
        onBack={() => setSelected(undefined)}
        onRSVP={(status) => rsvp(selected, status)}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {tab === "home" && (
        <CullatoreHome me={me} events={events} onOpen={setSelected} onRSVP={rsvp} />
      )}
      {tab === "events" && <EventList events={events} onOpen={setSelected} />}
      {tab === "messages" && <Messages messages={messages} />}
      {tab === "calendar" && <Calendar events={events} onOpen={setSelected} />}
      {tab === "profile" && (
        <Profile me={me} notifications={notifications} onLogout={onLogout} />
      )}
      <BottomNav items={nav} active={tab} onChange={(key) => setTab(key as Tab)} />
    </View>
  );
}

function CullatoreHome({
  me,
  events,
  onOpen,
  onRSVP,
}: {
  me?: Me;
  events: EventItem[];
  onOpen: (event: EventItem) => void;
  onRSVP: (event: EventItem, status: "confirmed" | "maybe" | "absent") => void;
}) {
  const next = events[0];
  return (
    <Screen>
      <View style={styles.headerRow}>
        <Brand compact />
        <Pill label="Cullatore" />
      </View>
      <Banner name={me?.paranza?.name} />
      <Title subtitle={`${me?.user.position ?? ""} · ${me?.paranza?.name ?? ""}`}>
        Ciao {me?.user.firstName ?? "Davide"}
      </Title>
      <View style={styles.metrics}>
        <Metric label="Eventi" value={events.length} />
        <Metric
          label="Confermati"
          value={events.filter((e) => e.rsvp === "confirmed").length}
        />
        <Metric
          label="Da rispondere"
          value={events.filter((e) => !e.rsvp).length}
        />
      </View>
      <Text style={styles.sectionTitle}>Prossimo evento</Text>
      {next ? (
        <Card>
          <Pressable onPress={() => onOpen(next)}>
            <EventSummary event={next} />
          </Pressable>
          <RSVPButtons event={next} onRSVP={onRSVP} />
        </Card>
      ) : (
        <Empty text="Nessun evento programmato." />
      )}
    </Screen>
  );
}

function EventList({
  events,
  onOpen,
}: {
  events: EventItem[];
  onOpen: (event: EventItem) => void;
}) {
  return (
    <Screen>
      <Title subtitle="Tutti gli appuntamenti della tua paranza.">Eventi</Title>
      <View style={styles.pills}>
        <Pill label="Tutti" active />
        <Pill label="Prove" />
        <Pill label="Festa" />
        <Pill label="Cene" />
      </View>
      {events.map((event) => (
        <Pressable key={event.id} onPress={() => onOpen(event)}>
          <Card>
            <EventSummary event={event} />
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
    <Screen>
      <Brand compact />
      <Button title="← Torna agli eventi" variant="ghost" onPress={onBack} />
      <View style={styles.heroEvent}>
        <Text style={styles.heroEventLabel}>EVENTO DELLA PARANZA</Text>
        <Text style={styles.heroEventTitle}>{event.title}</Text>
      </View>
      <Title subtitle={formatEventDate(event)}>{event.title}</Title>
      <Card>
        <Text style={styles.sectionTitle}>Dettagli</Text>
        <Text style={styles.body}>{event.description}</Text>
        <Text style={styles.muted}>⌖ {event.location}</Text>
        {event.attire ? <Text style={styles.muted}>Maglia · {event.attire}</Text> : null}
        <Text style={styles.muted}>{event.participantCount} risposte registrate</Text>
      </Card>
      <Text style={styles.sectionTitle}>La tua partecipazione</Text>
      <View style={styles.stack}>
        <Button
          title={event.rsvp === "confirmed" ? "✓ Partecipo" : "Partecipo"}
          onPress={() => onRSVP("confirmed")}
        />
        <Button
          title={event.rsvp === "maybe" ? "✓ Forse" : "Forse"}
          variant="secondary"
          onPress={() => onRSVP("maybe")}
        />
        <Button
          title={event.rsvp === "absent" ? "✓ Non partecipo" : "Non partecipo"}
          variant="danger"
          onPress={() => onRSVP("absent")}
        />
      </View>
    </Screen>
  );
}

function Messages({ messages }: { messages: MessageItem[] }) {
  return (
    <Screen>
      <Title subtitle="Comunicazioni dalla tua paranza.">Messaggi</Title>
      <View style={styles.pills}>
        <Pill label="Tutti" active />
        <Pill label="Capoparanza" />
        <Pill label="Paranza" />
      </View>
      {messages.map((message) => (
        <Card key={message.id}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{message.senderName}</Text>
            <Text style={styles.date}>{formatDate(message.createdAt)}</Text>
          </View>
          <Text style={styles.sectionTitle}>{message.title}</Text>
          <Text style={styles.body}>{message.body}</Text>
        </Card>
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
  const grouped = events.reduce<Record<string, EventItem[]>>((acc, event) => {
    const key = new Date(event.startsAt).toLocaleDateString("it-IT", {
      month: "long",
      year: "numeric",
    });
    (acc[key] ??= []).push(event);
    return acc;
  }, {});

  return (
    <Screen>
      <Title subtitle="Gli appuntamenti della paranza sempre a portata di mano.">
        Calendario
      </Title>
      {Object.entries(grouped).map(([month, values]) => (
        <View key={month} style={{ gap: 10 }}>
          <Text style={styles.month}>{month.toUpperCase()}</Text>
          {values.map((event) => (
            <Pressable key={event.id} onPress={() => onOpen(event)}>
              <Card>
                <EventSummary event={event} />
              </Card>
            </Pressable>
          ))}
        </View>
      ))}
    </Screen>
  );
}

function Profile({
  me,
  notifications,
  onLogout,
}: {
  me?: Me;
  notifications: NotificationItem[];
  onLogout: () => void;
}) {
  return (
    <Screen>
      <Title subtitle="Il tuo ruolo nella paranza.">Il mio profilo</Title>
      <Card>
        <Text style={styles.profileName}>
          {me?.user.firstName} {me?.user.lastName}
        </Text>
        <Text style={styles.muted}>Cullatore · {me?.user.position}</Text>
      </Card>
      <Banner name={me?.paranza?.name} />
      <Card>
        <Row label="Capoparanza" value={me?.paranza?.managerName ?? "—"} />
        <Row label="Posizione" value={me?.user.position ?? "—"} />
        <Row label="Colori" value="Bianco · Blu" />
      </Card>
      <Text style={styles.sectionTitle}>Notifiche e promemoria</Text>
      {notifications.slice(0, 5).map((notification) => (
        <Card key={notification.id}>
          <Text style={styles.name}>{notification.title}</Text>
          <Text style={styles.body}>{notification.body}</Text>
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
  onRSVP: (event: EventItem, status: "confirmed" | "maybe" | "absent") => void;
}) {
  return (
    <View style={styles.stack}>
      <Button
        title={event.rsvp === "confirmed" ? "✓ Partecipo" : "Partecipo"}
        onPress={() => onRSVP(event, "confirmed")}
      />
      <View style={styles.two}>
        <View style={{ flex: 1 }}>
          <Button title="Forse" variant="secondary" onPress={() => onRSVP(event, "maybe")} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Non partecipo" variant="danger" onPress={() => onRSVP(event, "absent")} />
        </View>
      </View>
    </View>
  );
}

function EventSummary({ event }: { event: EventItem }) {
  const date = new Date(event.startsAt);
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.headerRow}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{date.getDate().toString().padStart(2, "0")}</Text>
          <Text style={styles.dateMonth}>
            {date.toLocaleDateString("it-IT", { month: "short" }).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{event.title}</Text>
          <Text style={styles.muted}>{formatEventDate(event)}</Text>
          <Text style={styles.muted}>⌖ {event.location}</Text>
        </View>
      </View>
      {event.rsvp ? <Pill label={statusLabel(event.rsvp)} active={event.rsvp === "confirmed"} /> : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.name}>{value}</Text>
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

function statusLabel(status: EventItem["rsvp"]) {
  if (status === "confirmed") return "Partecipo";
  if (status === "maybe") return "Forse";
  if (status === "absent") return "Non partecipo";
  return "";
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stack: { gap: 8 },
  two: { flexDirection: "row", gap: 8 },
  sectionTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: "800" },
  name: { color: theme.colors.ink, fontSize: 15, fontWeight: "800" },
  profileName: { color: theme.colors.blueDark, fontSize: 24, fontWeight: "800" },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  muted: { color: theme.colors.text, fontSize: 12, lineHeight: 18 },
  date: { color: theme.colors.muted, fontSize: 11, fontWeight: "700" },
  month: { color: theme.colors.blue, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  dateBadge: { minWidth: 54, borderRadius: 12, backgroundColor: theme.colors.blueSoft, padding: 8, alignItems: "center" },
  dateDay: { color: theme.colors.blueDark, fontSize: 19, fontWeight: "900" },
  dateMonth: { color: theme.colors.blue, fontSize: 10, fontWeight: "800" },
  heroEvent: { minHeight: 150, borderRadius: 22, backgroundColor: theme.colors.blueDark, padding: 22, justifyContent: "flex-end", gap: 6 },
  heroEventLabel: { color: "#BFD4FF", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  heroEventTitle: { color: "#FFFFFF", fontSize: 27, fontWeight: "900", letterSpacing: -0.5 },
});

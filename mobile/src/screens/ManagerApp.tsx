import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, demoLogin } from "../api";
import { ManagerHome } from "./ManagerHome";
import {
  EventItem,
  Me,
  Member,
  MessageItem,
  Paranza,
  Participant,
  Stats as StatsData,
} from "../types";
import {
  Avatar,
  BottomNav,
  Button,
  Card,
  Field,
  HeaderButton,
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
  token,
  paranza: initialParanza,
  onLogout,
}: {
  token?: string;
  paranza?: Paranza;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<Tab>("home");
  const [authToken, setAuthToken] = useState(token);
  const [me, setMe] = useState<Me>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<StatsData>({
    memberCount: 0,
    activeMemberCount: 0,
    eventCount: 0,
    upcomingEventCount: 0,
    attendanceRate: 0,
    attendanceHistory: [],
  });
  const [selectedEvent, setSelectedEvent] = useState<EventItem>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function resolveToken() {
    if (authToken) {
      return authToken;
    }
    const login = await demoLogin("capoparanza");
    setAuthToken(login.token);
    return login.token;
  }

  async function loadData() {
    setLoading(true);
    setLoadError("");
    try {
      const currentToken = await resolveToken();
      const [meData, eventData, messageData, memberData, statsData] =
        await Promise.all([
          api.me(currentToken),
          api.events(currentToken),
          api.messages(currentToken),
          api.members(currentToken),
          api.stats(currentToken),
        ]);
      setMe(meData);
      setEvents(eventData);
      setMessages(messageData);
      setMembers(memberData);
      setStats(statsData);
    } catch (cause) {
      setLoadError(
        cause instanceof Error
          ? cause.message
          : "Non è stato possibile caricare i dati della paranza.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function openParticipants(event: EventItem) {
    setSelectedEvent(event);
    setParticipants([]);
    try {
      const currentToken = await resolveToken();
      setParticipants(await api.participants(currentToken, event.id));
    } catch (cause) {
      setLoadError(
        cause instanceof Error
          ? cause.message
          : "Non è stato possibile caricare i partecipanti.",
      );
    }
  }

  const paranza = me?.paranza ?? initialParanza;

  return (
    <View style={{ flex: 1 }}>
      {selectedEvent ? (
        <ParticipantsView
          event={selectedEvent}
          participants={participants}
          onBack={() => setSelectedEvent(undefined)}
        />
      ) : (
        <>
          {tab === "home" && (
            <ManagerHome
              me={me}
              events={events}
              paranza={paranza}
              stats={stats}
              loading={loading}
              error={loadError}
              onRetry={loadData}
              onOpenEvent={openParticipants}
              onNavigate={setTab}
            />
          )}
          {tab === "events" && (
            <Events
              token={authToken}
              events={events}
              setEvents={setEvents}
              setStats={setStats}
              onOpenParticipants={openParticipants}
            />
          )}
          {tab === "messages" && (
            <Messages
              token={authToken}
              memberCount={stats.memberCount}
              messages={messages}
              setMessages={setMessages}
            />
          )}
          {tab === "members" && (
            <Members
              token={authToken}
              members={members}
              setMembers={setMembers}
              setStats={setStats}
            />
          )}
          {tab === "stats" && (
            <Stats
              events={events}
              stats={stats}
              onLogout={onLogout}
            />
          )}
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

function Events({
  token,
  events,
  setEvents,
  setStats,
  onOpenParticipants,
}: {
  token?: string;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  setStats: React.Dispatch<React.SetStateAction<StatsData>>;
  onOpenParticipants: (event: EventItem) => void;
}) {
  const initialDate = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 12);
    return formatInputDate(value);
  }, []);

  const [creating, setCreating] = useState(false);
  const [type, setType] = useState("Prova della paranza");
  const [title, setTitle] = useState("Prova della paranza");
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState("20:00");
  const [endTime, setEndTime] = useState("22:00");
  const [location, setLocation] = useState("Zona Duomo, Nola");
  const [description, setDescription] = useState("");
  const [attire, setAttire] = useState("Maglia della paranza");
  const [required, setRequired] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventError, setEventError] = useState("");

  async function createEvent() {
    if (!token || saving) {
      return;
    }

    setEventError("");
    const start = parseLocalDateTime(date, startTime);
    const end = parseLocalDateTime(date, endTime);
    if (!title.trim() || !location.trim()) {
      setEventError("Inserisci titolo e luogo dell’evento.");
      return;
    }
    if (!start || !end) {
      setEventError("Usa data DD/MM/YYYY e orari HH:MM.");
      return;
    }
    if (end <= start) {
      setEventError("L’orario di fine deve essere successivo a quello di inizio.");
      return;
    }

    setSaving(true);
    try {
      const created = await api.createEvent(token, {
        type,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        required,
        attire: attire.trim(),
      });
      setEvents((current) =>
        [...current, created].sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        ),
      );
      setStats((current) => ({
        ...current,
        eventCount: current.eventCount + 1,
        upcomingEventCount:
          current.upcomingEventCount + (start.getTime() >= Date.now() ? 1 : 0),
      }));
      setCreating(false);
    } catch (cause) {
      setEventError(
        cause instanceof Error
          ? cause.message
          : "Non è stato possibile creare l’evento.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (creating) {
    return (
      <Screen
        key="manager-create-event"
        withBottomNav
        footer={
          <Button
            large
            disabled={saving}
            title={saving ? "Creazione..." : "Crea evento"}
            onPress={createEvent}
          />
        }
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
                <Text
                  style={[
                    styles.eventTypeText,
                    selected && { color: theme.colors.blue },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.blockLabel}>Dettagli evento</Text>
        <Field label="Titolo" value={title} onChangeText={setTitle} />
        <View style={styles.detailPair}>
          <View style={styles.formHalf}>
            <Field
              label="Data"
              value={date}
              placeholder="GG/MM/AAAA"
              icon="calendar-outline"
              onChangeText={setDate}
            />
          </View>
          <View style={styles.formHalf}>
            <Field
              label="Inizio"
              value={startTime}
              placeholder="20:00"
              icon="time-outline"
              onChangeText={setStartTime}
            />
          </View>
        </View>
        <View style={styles.detailPair}>
          <View style={styles.formHalf}>
            <Field
              label="Fine"
              value={endTime}
              placeholder="22:00"
              icon="time-outline"
              onChangeText={setEndTime}
            />
          </View>
          <View style={styles.formHalf}>
            <Field
              label="Luogo"
              value={location}
              icon="location-outline"
              onChangeText={setLocation}
            />
          </View>
        </View>
        <Field
          label="Abbigliamento (opzionale)"
          value={attire}
          onChangeText={setAttire}
        />
        <Field
          label="Descrizione (opzionale)"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>
            Richiedi conferma di partecipazione
          </Text>
          <Switch
            value={required}
            onValueChange={setRequired}
            trackColor={{ false: "#CBD5E4", true: theme.colors.blue }}
            thumbColor="#FFFFFF"
          />
        </View>

        {eventError ? <Text style={styles.errorText}>{eventError}</Text> : null}
      </Screen>
    );
  }

  return (
    <Screen key="manager-events" withBottomNav>
      <View style={styles.headerRow}>
        <Title>Eventi</Title>
        <HeaderButton icon="add" onPress={() => setCreating(true)} />
      </View>

      {events.length ? (
        events.map((event) => (
          <Pressable key={event.id} onPress={() => onOpenParticipants(event)}>
            <Card>
              <EventRow event={event} />
            </Card>
          </Pressable>
        ))
      ) : (
        <Card>
          <Text style={styles.subtle}>Nessun evento creato.</Text>
        </Card>
      )}
    </Screen>
  );
}

function Messages({
  token,
  memberCount,
  messages,
  setMessages,
}: {
  token?: string;
  memberCount: number;
  messages: MessageItem[];
  setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}) {
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [messageError, setMessageError] = useState("");

  async function sendMessage() {
    if (!token || sending) {
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setMessageError("Inserisci oggetto e messaggio.");
      return;
    }
    if (body.trim().length > 500) {
      setMessageError("Il messaggio non può superare 500 caratteri.");
      return;
    }

    setSending(true);
    setMessageError("");
    try {
      const created = await api.createMessage(
        token,
        subject.trim(),
        body.trim(),
      );
      setMessages((current) => [created, ...current]);
      setSubject("");
      setBody("");
      setComposing(false);
    } catch (cause) {
      setMessageError(
        cause instanceof Error
          ? cause.message
          : "Non è stato possibile inviare il messaggio.",
      );
    } finally {
      setSending(false);
    }
  }

  if (composing) {
    return (
      <Screen
        key="manager-compose"
        withBottomNav
        footer={
          <Button
            large
            disabled={sending || !subject.trim() || !body.trim()}
            title={sending ? "Invio..." : "Invia messaggio"}
            onPress={sendMessage}
          />
        }
      >
        <PageHeader title="Nuovo messaggio" onBack={() => setComposing(false)} />
        <Text style={styles.blockLabel}>Destinatari</Text>
        <View style={styles.recipientRow}>
          <Pill
            label={"Tutti i cullatori (" + memberCount + " membri)"}
            active
          />
        </View>
        <Field label="Oggetto" value={subject} onChangeText={setSubject} />
        <Field
          label="Messaggio"
          value={body}
          onChangeText={setBody}
          multiline
        />
        <Text style={styles.counter}>{body.length}/500</Text>
        {messageError ? (
          <Text style={styles.errorText}>{messageError}</Text>
        ) : null}
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

      {messages.length ? (
        messages.map((message) => (
          <Card key={message.id}>
            <View style={styles.headerRow}>
              <Text style={styles.cardStrong}>{message.title}</Text>
              <Text style={styles.dateText}>
                {formatShortDate(message.createdAt)}
              </Text>
            </View>
            <Text style={styles.subtle}>{message.senderName}</Text>
            <Text style={styles.body}>{message.body}</Text>
            <View style={styles.messageMetaRow}>
              <Ionicons
                name="checkmark-done-outline"
                size={17}
                color={theme.colors.blue}
              />
              <Text style={styles.messageReadText}>
                {message.readCount}/{message.recipientCount} letti
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.subtle}>Nessun messaggio inviato.</Text>
        </Card>
      )}
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
        {formatEventDateTime(event)}{"\n"}{event.location}
      </Text>

      <View style={styles.segmentHeader}>
        <Text style={styles.segmentActive}>Partecipanti ({participants.length})</Text>
        <Text style={styles.segmentInactive}>Dettagli</Text>
      </View>

      <View style={styles.responseRow}>
        <ResponseBox value={String(counts.confirmed)} label="Confermati" tone="success" />
        <ResponseBox value={String(counts.maybe)} label="Forse" tone="maybe" />
        <ResponseBox value={String(counts.absent)} label="Assenti" tone="danger" />
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={theme.colors.muted} />
        <Text style={styles.searchPlaceholder}>Cerca un cullatore...</Text>
      </View>

      {participants.map((p) => (
        <View key={p.userId} style={styles.personRow}>
          <Avatar initials={initials(p.name)} uri={p.photoUrl} size={44} />
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
                  : p.status === "absent"
                    ? "danger"
                    : "default"
            }
          />
          <Ionicons name="ellipsis-horizontal" size={21} color={theme.colors.blue} />
        </View>
      ))}
    </Screen>
  );
}

function Members({
  token,
  members,
  setMembers,
  setStats,
}: {
  token?: string;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setStats: React.Dispatch<React.SetStateAction<StatsData>>;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [query, setQuery] = useState("");
  const [memberError, setMemberError] = useState("");
  const [updatingMember, setUpdatingMember] = useState<number>();

  const filtered = members.filter((member) => {
    const matchesStatus =
      filter === "all"
        ? true
        : filter === "active"
          ? member.isActive
          : !member.isActive;
    const normalized = query.trim().toLocaleLowerCase("it-IT");
    const matchesQuery =
      !normalized ||
      member.name.toLocaleLowerCase("it-IT").includes(normalized) ||
      member.position.toLocaleLowerCase("it-IT").includes(normalized);
    return matchesStatus && matchesQuery;
  });

  async function toggleMember(member: Member) {
    if (!token || updatingMember) {
      return;
    }
    const nextActive = !member.isActive;
    setUpdatingMember(member.userId);
    setMemberError("");
    try {
      await api.setMemberActive(token, member.userId, nextActive);
      setMembers((current) =>
        current.map((item) =>
          item.userId === member.userId
            ? { ...item, isActive: nextActive }
            : item,
        ),
      );
      setStats((current) => ({
        ...current,
        activeMemberCount:
          current.activeMemberCount + (nextActive ? 1 : -1),
      }));
    } catch (cause) {
      setMemberError(
        cause instanceof Error
          ? cause.message
          : "Non è stato possibile aggiornare il cullatore.",
      );
    } finally {
      setUpdatingMember(undefined);
    }
  }

  const activeCount = members.filter((member) => member.isActive).length;
  const inactiveCount = members.length - activeCount;

  return (
    <Screen key="manager-members" withBottomNav>
      <PageHeader title="I miei cullatori" />

      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={theme.colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cerca un cullatore..."
          placeholderTextColor={theme.colors.muted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.recipientRow}>
        <Pill
          label={"Tutti " + members.length}
          active={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <Pill
          label={"Attivi " + activeCount}
          active={filter === "active"}
          onPress={() => setFilter("active")}
        />
        <Pill
          label={"Non attivi " + inactiveCount}
          active={filter === "inactive"}
          onPress={() => setFilter("inactive")}
        />
      </View>

      {memberError ? <Text style={styles.errorText}>{memberError}</Text> : null}

      {filtered.length ? (
        filtered.map((member) => (
          <View key={member.userId} style={styles.personRow}>
            <Avatar
              initials={initials(member.name)}
              uri={member.photoUrl}
              size={44}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>{member.name}</Text>
              <Text style={styles.personPosition}>{member.position}</Text>
            </View>
            <Pill
              label={
                updatingMember === member.userId
                  ? "..."
                  : member.isActive
                    ? "Attivo"
                    : "Non attivo"
              }
              tone={member.isActive ? "success" : "default"}
              onPress={() => void toggleMember(member)}
            />
          </View>
        ))
      ) : (
        <Card>
          <Text style={styles.subtle}>Nessun cullatore trovato.</Text>
        </Card>
      )}
    </Screen>
  );
}

function Stats({
  events,
  stats,
  onLogout,
}: {
  events: EventItem[];
  stats: StatsData;
  onLogout: () => void;
}) {
  return (
    <Screen key="manager-stats" withBottomNav>
      <PageHeader title="Statistiche" />
      <Card>
        <Text style={styles.statsTitle}>Tasso di presenza</Text>
        <View style={styles.bigRing}>
          <Text style={styles.bigRingValue}>{Math.round(stats.attendanceRate)}%</Text>
        </View>
        <Text style={styles.statsCaption}>
          Presenza media calcolata sui dati RSVP della paranza
        </Text>
      </Card>

      <Text style={styles.statsTitle}>Andamento presenze</Text>
      {stats.attendanceHistory?.length ? (
        <View style={styles.chartWrap}>
          {stats.attendanceHistory.map((point) => (
            <View key={point.eventId} style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  { height: Math.max(2, Math.round(point.rate * 0.72)) },
                ]}
              />
              <Text style={styles.chartLabel}>
                {new Date(point.startsAt)
                  .toLocaleDateString("it-IT", { month: "short" })
                  .replace(".", "")}
              </Text>
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
      ) : (
        <Card>
          <Text style={styles.subtle}>
            Le statistiche di presenza compariranno dopo le prime risposte agli eventi.
          </Text>
        </Card>
      )}

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
  const end = new Date(event.endsAt);
  return (
    <View style={styles.eventRow}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateWeek}>
          {date
            .toLocaleDateString("it-IT", { weekday: "short" })
            .replace(".", "")
            .toUpperCase()}
        </Text>
        <Text style={styles.dateDay}>{date.getDate().toString().padStart(2, "0")}</Text>
        <Text style={styles.dateMonth}>
          {date.toLocaleDateString("it-IT", { month: "short" }).replace(".", "").toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.cardStrong}>{event.title}</Text>
        <Text style={styles.subtle}>
          {formatTime(date)} - {formatTime(end)}
        </Text>
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

function formatInputDate(value: Date) {
  const day = value.getDate().toString().padStart(2, "0");
  const month = (value.getMonth() + 1).toString().padStart(2, "0");
  return day + "/" + month + "/" + value.getFullYear();
}

function parseLocalDateTime(dateValue: string, timeValue: string) {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateValue.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue.trim());
  if (!dateMatch || !timeMatch) {
    return undefined;
  }
  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined;
  }
  const value = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    value.getFullYear() !== year ||
    value.getMonth() !== month - 1 ||
    value.getDate() !== day
  ) {
    return undefined;
  }
  return value;
}

function contrastText(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) {
    return theme.colors.blueDark;
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
    ? theme.colors.blueDark
    : "#FFFFFF";
}

function formatTime(value: Date) {
  return value.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventDateTime(event: EventItem) {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const date = start.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return date + " · " + formatTime(start) + " - " + formatTime(end);
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
  if (status === "absent") return "Assente";
  return "Non risposto";
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
  paranzaHero: {
    minHeight: 116,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  paranzaHeroBand: {
    position: "absolute",
    right: -30,
    top: -28,
    width: 150,
    height: 180,
    transform: [{ rotate: "16deg" }],
  },
  paranzaLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.75)",
    zIndex: 1,
  },
  paranzaLogoImage: {
    width: "100%",
    height: "100%",
  },
  paranzaHeroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    zIndex: 1,
  },
  paranzaHeroEyebrow: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.8,
    opacity: 0.78,
  },
  paranzaHeroName: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
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
  formHalf: { flex: 1 },
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
  messageMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  messageReadText: {
    color: theme.colors.blue,
    fontSize: 12,
    fontWeight: "700",
  },
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
  searchInput: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 14,
    paddingVertical: 8,
  },
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

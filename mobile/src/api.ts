import {
  EventItem,
  Me,
  Member,
  MessageItem,
  NotificationItem,
  Participant,
  Paranza,
  ParanzaOnboardingInput,
  Role,
  Stats,
} from "./types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body || `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) {
        message = parsed.error;
      }
    } catch {
      // Keep the raw response body when it is not JSON.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function demoLogin(role: Role): Promise<{ token: string }> {
  return request("/api/v1/demo/login", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export const api = {
  me: (token: string) => request<Me>("/api/v1/me", {}, token),
  saveParanzaOnboarding: (token: string, input: ParanzaOnboardingInput) =>
    request<Paranza>(
      "/api/v1/onboarding/paranza",
      { method: "PUT", body: JSON.stringify(input) },
      token,
    ),
  events: (token: string) => request<EventItem[]>("/api/v1/events", {}, token),
  messages: (token: string) =>
    request<MessageItem[]>("/api/v1/messages", {}, token),
  members: (token: string) => request<Member[]>("/api/v1/members", {}, token),
  stats: (token: string) => request<Stats>("/api/v1/stats", {}, token),
  notifications: (token: string) =>
    request<NotificationItem[]>("/api/v1/notifications", {}, token),
  participants: (token: string, eventId: number) =>
    request<Participant[]>(
      `/api/v1/events/${eventId}/participants`,
      {},
      token,
    ),
  rsvp: (
    token: string,
    eventId: number,
    status: "confirmed" | "maybe" | "absent",
  ) =>
    request<{ status: string }>(
      `/api/v1/events/${eventId}/rsvp`,
      { method: "PUT", body: JSON.stringify({ status }) },
      token,
    ),
  createMessage: (token: string, title: string, body: string) =>
    request<MessageItem>(
      "/api/v1/messages",
      { method: "POST", body: JSON.stringify({ title, body }) },
      token,
    ),
  createEvent: (
    token: string,
    input: {
      type: string;
      title: string;
      description: string;
      location: string;
      startsAt: string;
      endsAt: string;
      required: boolean;
      attire: string;
    },
  ) =>
    request<EventItem>(
      "/api/v1/events",
      { method: "POST", body: JSON.stringify(input) },
      token,
    ),
};

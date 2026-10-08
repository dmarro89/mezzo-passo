export type Role = "capoparanza" | "cullatore";

export type User = {
  id: number;
  role: Role;
  firstName: string;
  lastName: string;
  birthDate?: string;
  photoUrl?: string;
  position?: string;
};

export type Paranza = {
  id: number;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  inviteCode?: string;
  managerName: string;
};

export type ParanzaOnboardingInput = {
  name: string;
  description: string;
  managerName: string;
  primaryColor: string;
  secondaryColor: string;
};

export type Me = {
  user: User;
  paranza?: Paranza;
};

export type EventItem = {
  id: number;
  type: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  required: boolean;
  attire?: string;
  rsvp?: "" | "confirmed" | "maybe" | "absent";
  participantCount: number;
};

export type MessageItem = {
  id: number;
  title: string;
  body: string;
  senderName: string;
  createdAt: string;
};

export type Member = {
  userId: number;
  name: string;
  position: string;
  isActive: boolean;
};

export type Participant = {
  userId: number;
  name: string;
  position: string;
  status: "" | "confirmed" | "maybe" | "absent";
  isActive: boolean;
};

export type Stats = {
  memberCount: number;
  activeMemberCount: number;
  eventCount: number;
  attendanceRate: number;
};

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  createdAt: string;
};

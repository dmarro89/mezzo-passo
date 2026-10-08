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
  logoUrl?: string;
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
  logoDataUrl?: string;
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
  recipientCount: number;
  readCount: number;
  isRead: boolean;
};

export type Member = {
  userId: number;
  name: string;
  photoUrl?: string;
  position: string;
  isActive: boolean;
};

export type Participant = {
  userId: number;
  name: string;
  photoUrl?: string;
  position: string;
  status: "" | "confirmed" | "maybe" | "absent";
  isActive: boolean;
};

export type AttendancePoint = {
  eventId: number;
  title: string;
  startsAt: string;
  confirmedCount: number;
  memberCount: number;
  rate: number;
};

export type Stats = {
  memberCount: number;
  activeMemberCount: number;
  eventCount: number;
  upcomingEventCount: number;
  attendanceRate: number;
  attendanceHistory: AttendancePoint[];
};

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  createdAt: string;
};

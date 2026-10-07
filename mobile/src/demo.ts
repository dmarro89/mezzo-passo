export const WELCOME_IMAGE = require("../assets/mock-welcome.jpg");
export const EVENT_IMAGE = require("../assets/mock-event.jpg");
export const BANNER_IMAGE = require("../assets/mock-banner.jpg");

import { EventItem, Me, Member, MessageItem, NotificationItem, Participant, Stats } from "./types";

function at(days: number, hour: number, minute = 0) {
  const d = new Date("2024-07-18T12:00:00+02:00");
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const managerMe: Me = {
  user: {
    id: 1,
    role: "capoparanza",
    firstName: "Luca",
    lastName: "Iorio",
  },
  paranza: {
    id: 1,
    name: "Orgoglio Nolano",
    primaryColor: "#FFFFFF",
    secondaryColor: "#0A4DBA",
    inviteCode: "MEZZOPASSO",
    managerName: "Luca Iorio",
  },
};

export const cullatoreMe: Me = {
  user: {
    id: 2,
    role: "cullatore",
    firstName: "Davide",
    lastName: "Esposito",
    birthDate: "1992-03-14",
    position: "Base sinistra",
  },
  paranza: managerMe.paranza,
};

export const demoEvents: EventItem[] = [
  {
    id: 101,
    type: "Prova della paranza",
    title: "Prova della paranza",
    description: "Prova generale in vista della festa. È importante la presenza di tutti.",
    location: "Zona Duomo, Nola",
    startsAt: at(2, 20),
    endsAt: at(2, 22),
    required: true,
    attire: "Maglia della paranza",
    rsvp: "confirmed",
    participantCount: 24,
  },
  {
    id: 102,
    type: "Bandiera",
    title: "Bandiera",
    description: "Ritrovo della paranza per la bandiera.",
    location: "Piazza Duomo, Nola",
    startsAt: at(5, 19, 30),
    endsAt: at(5, 22, 30),
    required: true,
    attire: "Maglia bianca",
    rsvp: "",
    participantCount: 18,
  },
  {
    id: 103,
    type: "Cena della paranza",
    title: "Cena della paranza",
    description: "Cena e momento di ritrovo della paranza.",
    location: "Nola",
    startsAt: at(9, 21),
    endsAt: at(9, 23, 30),
    required: false,
    attire: "",
    rsvp: "",
    participantCount: 16,
  },
];

export const demoMessages: MessageItem[] = [
  {
    id: 1,
    title: "Prova di sabato",
    body: "Ragazzi, ci vediamo sabato alle 20:00 in Zona Duomo per la prova della paranza.",
    senderName: "Luca Iorio",
    createdAt: at(0, 10, 24),
  },
  {
    id: 2,
    title: "Ricorda la maglia",
    body: "Per il prossimo appuntamento ricordate la maglia bianca.",
    senderName: "Luca Iorio",
    createdAt: at(-1, 18),
  },
  {
    id: 3,
    title: "Programma della settimana",
    body: "Il programma completo della settimana è disponibile in calendario.",
    senderName: "Orgoglio Nolano",
    createdAt: at(-3, 12),
  },
];

export const demoMembers: Member[] = [
  { userId: 2, name: "Davide Esposito", position: "Ritiro sinistro", isActive: true },
  { userId: 3, name: "Raffaele Marra", position: "Ritiro destro", isActive: true },
  { userId: 4, name: "Giovanni Nappi", position: "Barra avanti", isActive: true },
  { userId: 5, name: "Ciro Manzi", position: "Barra dietro", isActive: true },
  { userId: 6, name: "Luigi Romano", position: "Barra destra", isActive: true },
  { userId: 7, name: "Salvatore Conte", position: "Barra sinistra", isActive: true },
  { userId: 8, name: "Marco Bifulco", position: "Barrettillo avanti", isActive: true },
  { userId: 9, name: "Alessio Romano", position: "Barrettillo dietro", isActive: false },
];

export const demoParticipants: Participant[] = [
  { userId: 2, name: "Davide Esposito", position: "Ritiro sinistro", status: "confirmed", isActive: true },
  { userId: 3, name: "Raffaele Marra", position: "Ritiro destro", status: "confirmed", isActive: true },
  { userId: 4, name: "Giovanni Nappi", position: "Barra avanti", status: "confirmed", isActive: true },
  { userId: 5, name: "Ciro Manzi", position: "Barra dietro", status: "maybe", isActive: true },
  { userId: 6, name: "Luigi Romano", position: "Barra destra", status: "confirmed", isActive: true },
  { userId: 7, name: "Salvatore Conte", position: "Barra sinistra", status: "absent", isActive: true },
];

export const demoStats: Stats = {
  memberCount: 32,
  activeMemberCount: 28,
  eventCount: 24,
  attendanceRate: 75,
};

export const demoNotifications: NotificationItem[] = [
  {
    id: "n1",
    kind: "event",
    title: "Promemoria evento",
    body: "Prova della paranza oggi alle 20:00. Non mancare!",
    createdAt: at(0, 10, 30),
  },
  {
    id: "n2",
    kind: "attire",
    title: "Ricorda la maglia",
    body: "Porta con te la maglia della paranza.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "n3",
    kind: "message",
    title: "Nuovo messaggio",
    body: "Luca Iorio: ragazzi, ci vediamo sabato...",
    createdAt: at(-1, 19, 20),
  },
];

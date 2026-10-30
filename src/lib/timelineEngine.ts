import type { EventType } from "@/types/plan";

export interface Milestone {
  id: string;
  title: string;
  daysBefore: number;
  dueDate: string; // yyyy-mm-dd
  priority: boolean;
}

export interface TimelineResult {
  milestones: Milestone[];
  rush: boolean;
  daysUntil: number;
}

type Base = { id: string; title: string; daysBefore: number; priority?: boolean };

const COMMON: Base[] = [
  { id: "venue", title: "Book the venue", daysBefore: 90, priority: true },
  { id: "budget", title: "Finalise budget and guest list", daysBefore: 80, priority: true },
  { id: "caterer", title: "Book the caterer and fix the menu", daysBefore: 60, priority: true },
  { id: "decor", title: "Shortlist and book decor", daysBefore: 45 },
  { id: "invites", title: "Send invitations", daysBefore: 30, priority: true },
  { id: "vendors-confirm", title: "Confirm all vendors and payments", daysBefore: 14 },
  { id: "headcount", title: "Final headcount to caterer", daysBefore: 7, priority: true },
  { id: "setup", title: "Venue setup and rehearsal", daysBefore: 1 },
  {
    id: "dayof",
    title: "Day-of schedule: arrivals, program, meal, wrap-up",
    daysBefore: 0,
    priority: true,
  },
];

const EXTRA: Partial<Record<EventType, Base[]>> = {
  corporate: [
    { id: "approval", title: "Get management approval", daysBefore: 85, priority: true },
    { id: "calendar", title: "Send calendar invites", daysBefore: 35 },
    { id: "rsvp", title: "Collect RSVPs", daysBefore: 10 },
    { id: "av", title: "Confirm AV/IT setup", daysBefore: 3 },
  ],
  festival: [
    { id: "rituals", title: "Plan rangoli, lighting or festival rituals", daysBefore: 21 },
    { id: "shop", title: "Shop decor and sweets", daysBefore: 10 },
    { id: "greetings", title: "Send festive greetings", daysBefore: 2 },
  ],
  wedding: [{ id: "attire", title: "Finalise attire and makeup trials", daysBefore: 40 }],
  birthday: [{ id: "cake", title: "Order the cake", daysBefore: 7 }],
  community: [
    {
      id: "permits",
      title: "Apply for permits and safety clearances",
      daysBefore: 70,
      priority: true,
    },
  ],
};

const FULL_WINDOW = 90;

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysBetween(fromIso: string, toIsoStr: string): number {
  return Math.round((parseIso(toIsoStr).getTime() - parseIso(fromIso).getTime()) / 86_400_000);
}

export function generateTimeline(
  eventType: EventType,
  eventDate: string,
  today: string,
): TimelineResult {
  const daysUntil = daysBetween(today, eventDate);
  const rush = daysUntil < FULL_WINDOW;
  const base = [...COMMON, ...(EXTRA[eventType] ?? [])];
  const scale = rush ? Math.max(0, daysUntil) / FULL_WINDOW : 1;
  const event = parseIso(eventDate);
  const milestones = base
    .map((b) => {
      const daysBefore = Math.round(b.daysBefore * scale);
      const due = new Date(event);
      due.setDate(due.getDate() - daysBefore);
      return {
        id: b.id,
        title: b.title,
        daysBefore,
        dueDate: toIso(due),
        priority: Boolean(b.priority),
      };
    })
    .sort((a, b) => b.daysBefore - a.daysBefore || a.id.localeCompare(b.id));
  return { milestones, rush, daysUntil };
}

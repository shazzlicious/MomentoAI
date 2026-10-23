import type { EventType, Style, VenueType } from "@/types/plan";

export type Template = { category: string; pct: number }[];

export const BUDGET_TEMPLATES: Record<EventType, Template> = {
  wedding: [
    { category: "Venue", pct: 20 },
    { category: "Catering", pct: 35 },
    { category: "Decor", pct: 12 },
    { category: "Photo/Video", pct: 10 },
    { category: "Attire/Makeup", pct: 8 },
    { category: "Music", pct: 4 },
    { category: "Invitations", pct: 2 },
    { category: "Transport", pct: 4 },
    { category: "Contingency", pct: 5 },
  ],
  birthday: [
    { category: "Venue", pct: 20 },
    { category: "Catering", pct: 35 },
    { category: "Decor", pct: 15 },
    { category: "Entertainment", pct: 12 },
    { category: "Cake", pct: 6 },
    { category: "Return gifts", pct: 6 },
    { category: "Photo", pct: 3 },
    { category: "Contingency", pct: 3 },
  ],
  community: [
    { category: "Venue", pct: 15 },
    { category: "Catering", pct: 25 },
    { category: "Decor/Stage", pct: 12 },
    { category: "Sound/AV", pct: 15 },
    { category: "Marketing", pct: 10 },
    { category: "Volunteers/Logistics", pct: 10 },
    { category: "Permits/Safety", pct: 5 },
    { category: "Contingency", pct: 8 },
  ],
  corporate: [
    { category: "Venue", pct: 18 },
    { category: "Catering", pct: 30 },
    { category: "Decor/Branding", pct: 8 },
    { category: "Sound/AV", pct: 12 },
    { category: "Entertainment/Activities", pct: 10 },
    { category: "Gifts/Swag", pct: 8 },
    { category: "Photo/Video", pct: 4 },
    { category: "Transport", pct: 5 },
    { category: "Contingency", pct: 5 },
  ],
  festival: [
    { category: "Venue/Space", pct: 10 },
    { category: "Catering", pct: 32 },
    { category: "Decor/Lighting", pct: 20 },
    { category: "Cultural programs/Entertainment", pct: 10 },
    { category: "Gifts/Sweet hampers", pct: 10 },
    { category: "Attire", pct: 5 },
    { category: "Photo", pct: 3 },
    { category: "Logistics", pct: 5 },
    { category: "Contingency", pct: 5 },
  ],
};

export const CATERING_PER_GUEST_MIN: Record<EventType, number> = {
  wedding: 300,
  birthday: 300,
  corporate: 300,
  community: 150,
  festival: 250,
};

export interface BudgetInput {
  eventType: EventType;
  budget: number;
  guests: number;
  style: Style;
  venueType: VenueType;
}

export interface Allocation {
  category: string;
  pct: number;
  amount: number;
}

export interface BudgetResult {
  allocations: Allocation[];
  perGuest: number;
  cateringPerGuest: number;
  warning?: string;
}

const isDecor = (c: string) => c.startsWith("Decor");
const isVenue = (c: string) => c.startsWith("Venue");

/** Returns adjusted percentage weights (always summing to 100). */
export function adjustedWeights(input: Omit<BudgetInput, "budget">): Allocation[] {
  const rows = BUDGET_TEMPLATES[input.eventType].map((r) => ({ ...r }));
  const bump = (pred: (c: string) => boolean, delta: number) => {
    const r = rows.find((x) => pred(x.category));
    if (r) r.pct = Math.max(0, r.pct + delta);
  };
  if (input.style === "Luxury") {
    bump(isDecor, 5);
    bump(isVenue, 3);
  }
  if (input.style === "Minimal") bump(isDecor, -4);
  if (input.venueType === "Outdoor") bump((c) => c === "Contingency", 3);
  if (input.guests > 300) bump((c) => c === "Catering", 5);

  const sum = rows.reduce((s, r) => s + r.pct, 0);
  return rows.map((r) => ({ category: r.category, pct: (r.pct / sum) * 100, amount: 0 }));
}

export function allocateBudget(input: BudgetInput): BudgetResult {
  const total = Math.round(input.budget);
  const weights = adjustedWeights(input);
  const allocations = weights.map((w) => ({ ...w, amount: Math.round((total * w.pct) / 100) }));
  const diff = total - allocations.reduce((s, a) => s + a.amount, 0);
  if (diff !== 0) {
    const largest = allocations.reduce((a, b) => (b.amount > a.amount ? b : a));
    largest.amount += diff;
  }
  const catering = allocations.find((a) => a.category === "Catering")?.amount ?? 0;
  const guests = Math.max(1, input.guests);
  const cateringPerGuest = catering / guests;
  const min = CATERING_PER_GUEST_MIN[input.eventType];
  return {
    allocations,
    perGuest: total / guests,
    cateringPerGuest,
    warning:
      cateringPerGuest < min
        ? `Catering works out to about ₹${Math.round(cateringPerGuest)} per guest, below the realistic minimum of ₹${min}. Consider raising the budget or trimming the guest list.`
        : undefined,
  };
}

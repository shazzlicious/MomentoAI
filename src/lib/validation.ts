import { z } from "zod";
import { DIETS, EVENT_TYPES, STYLES, SUB_TYPES, VENDOR_STATUSES, VENUE_TYPES } from "@/types/plan";

export function todayIso(now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const basicsSchema = z
  .object({
    eventType: z.enum(EVENT_TYPES, { errorMap: () => ({ message: "Choose an event type" }) }),
    subType: z.string().trim().max(60).optional(),
    name: z.string().trim().min(2, "Event name needs at least 2 characters").max(80, "Keep it under 80 characters"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    city: z.string().trim().min(2, "Enter a city").max(60, "Keep it under 60 characters"),
    guests: z.coerce
      .number({ invalid_type_error: "Enter a number" })
      .int("Whole numbers only")
      .min(1, "At least 1 guest")
      .max(2000, "Up to 2000 guests"),
  })
  .superRefine((v, ctx) => {
    if (v.date && v.date <= todayIso()) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Date must be in the future" });
    }
    const subs = SUB_TYPES[v.eventType];
    if (subs && subs.length > 0 && (!v.subType || !subs.includes(v.subType))) {
      ctx.addIssue({ code: "custom", path: ["subType"], message: "Choose a sub-type" });
    }
  });

export const prefsSchema = z.object({
  budget: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .min(1000, "Minimum budget is ₹1,000")
    .max(1_000_000_000, "That budget is too large"),
  style: z.enum(STYLES, { errorMap: () => ({ message: "Choose a style" }) }),
  diet: z.enum(DIETS, { errorMap: () => ({ message: "Choose dietary needs" }) }),
  venueType: z.enum(VENUE_TYPES, { errorMap: () => ({ message: "Choose indoor or outdoor" }) }),
  notes: z.string().max(300, "Notes can be up to 300 characters").optional(),
});

export const ideasSchema = z.object({
  themes: z.array(z.object({ title: z.string(), description: z.string() })).max(10),
  decor: z.array(z.string()).max(15),
  menu: z.array(z.string()).max(15),
  activities: z.array(z.string()).max(15),
  gifts: z.array(z.string()).max(15),
  playlistVibes: z.array(z.string()).max(15),
  tips: z.array(z.string()).max(15),
});

export const vendorSchema = z.object({
  id: z.string(),
  category: z.string(),
  name: z.string().max(100),
  contact: z.string().max(100),
  price: z.number().min(0),
  status: z.enum(VENDOR_STATUSES),
});

// Stored data skips the "future date" rule: saved plans legitimately age.
const storedBasics = z.object({
  eventType: z.enum(EVENT_TYPES),
  subType: z.string().optional(),
  name: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string(),
  guests: z.number().int().min(1).max(2000),
});

export const planSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  basics: storedBasics,
  prefs: prefsSchema,
  actuals: z.record(z.number()),
  doneTasks: z.array(z.string()),
  vendors: z.array(vendorSchema),
  ideas: ideasSchema.optional(),
  ideasSource: z.enum(["ai", "offline"]).optional(),
  savedIdeas: z.array(z.string()),
});

export const plansSchema = z.array(planSchema);

/** Strip HTML tags/control chars and clamp to 300 chars. */
export function sanitizeNotes(input: string | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

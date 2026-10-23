import type { EventType, Vendor } from "@/types/plan";

export const VENDOR_CATEGORIES: Record<EventType, string[]> = {
  wedding: ["Venue", "Caterer", "Decorator", "Photographer", "Makeup artist", "DJ / Band", "Pandit / Officiant"],
  birthday: ["Venue", "Caterer", "Decorator", "Cake", "Entertainer", "Photographer"],
  festival: ["Caterer / Sweets", "Decor & lighting", "Cultural performers", "Gift hampers", "Photographer"],
  corporate: ["Venue", "Caterer", "AV / IT", "Branding & print", "Activity partner", "Swag supplier", "Transport"],
  community: ["Venue / Grounds", "Caterer", "Stage & sound", "Permits", "Security", "Printing & marketing"],
};

export function defaultVendors(eventType: EventType, makeId: () => string): Vendor[] {
  return VENDOR_CATEGORIES[eventType].map((category) => ({
    id: makeId(),
    category,
    name: "",
    contact: "",
    price: 0,
    status: "To contact",
  }));
}

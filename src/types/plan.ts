export const EVENT_TYPES = ["wedding", "birthday", "festival", "corporate", "community"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const STYLES = [
  "Traditional",
  "Modern",
  "Minimal",
  "Luxury",
  "Eco-friendly",
  "Fun/Quirky",
  "Professional",
] as const;
export type Style = (typeof STYLES)[number];

export const DIETS = ["Veg", "Non-veg", "Jain", "Halal", "Mixed"] as const;
export type Diet = (typeof DIETS)[number];

export const VENUE_TYPES = ["Indoor", "Outdoor"] as const;
export type VenueType = (typeof VENUE_TYPES)[number];

export const SUB_TYPES: Record<EventType, readonly string[]> = {
  wedding: [],
  birthday: [],
  community: [],
  festival: [
    "Diwali",
    "Eid",
    "Christmas",
    "Holi",
    "Navratri/Durga Puja",
    "Ganesh Chaturthi",
    "Raksha Bandhan",
    "Other",
  ],
  corporate: [
    "Team outing",
    "Annual day",
    "Townhall",
    "Festival celebration at office",
    "Farewell/Welcome",
    "Award night",
    "Client event",
  ],
};

export const VENDOR_STATUSES = ["To contact", "Quoted", "Booked", "Paid"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export interface EventBasics {
  eventType: EventType;
  subType?: string;
  name: string;
  date: string; // ISO yyyy-mm-dd
  city: string;
  guests: number;
}

export interface BudgetStyle {
  budget: number;
  style: Style;
  diet: Diet;
  venueType: VenueType;
  notes?: string;
}

export interface Vendor {
  id: string;
  category: string;
  name: string;
  contact: string;
  price: number;
  status: VendorStatus;
}

export interface Ideas {
  themes: { title: string; description: string }[];
  decor: string[];
  menu: string[];
  activities: string[];
  gifts: string[];
  playlistVibes: string[];
  tips: string[];
}

export interface Plan {
  id: string;
  createdAt: string;
  basics: EventBasics;
  prefs: BudgetStyle;
  actuals: Record<string, number>;
  doneTasks: string[];
  vendors: Vendor[];
  ideas?: Ideas;
  ideasSource?: "ai" | "offline";
  savedIdeas: string[];
}

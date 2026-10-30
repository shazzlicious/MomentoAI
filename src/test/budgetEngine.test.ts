import { describe, expect, it } from "vitest";
import {
  BUDGET_TEMPLATES,
  CATERING_PER_GUEST_MIN,
  adjustedWeights,
  allocateBudget,
  type BudgetInput,
} from "@/lib/budgetEngine";
import type { EventType } from "@/types/plan";

const TYPES = Object.keys(BUDGET_TEMPLATES) as EventType[];

const base = (over: Partial<BudgetInput> = {}): BudgetInput => ({
  eventType: "wedding",
  budget: 1_500_000,
  guests: 250,
  style: "Traditional",
  venueType: "Indoor",
  ...over,
});

const pct = (input: Omit<BudgetInput, "budget">, category: string) =>
  adjustedWeights(input).find((w) => w.category === category)!.pct;

describe("budget templates", () => {
  it.each(TYPES)("%s template sums to 100%%", (t) => {
    const sum = BUDGET_TEMPLATES[t].reduce((s, r) => s + r.pct, 0);
    expect(sum).toBe(100);
  });
});

describe("allocateBudget: totals", () => {
  it.each(TYPES)("%s allocations sum exactly to the total", (eventType) => {
    for (const budget of [1000, 99_999, 1_234_567, 15_00_000, 98_765_431]) {
      const r = allocateBudget(base({ eventType, budget }));
      expect(r.allocations.reduce((s, a) => s + a.amount, 0)).toBe(budget);
    }
  });

  it("stays exact with style and venue adjustments applied", () => {
    const r = allocateBudget(
      base({ style: "Luxury", venueType: "Outdoor", guests: 500, budget: 7_777_777 }),
    );
    expect(r.allocations.reduce((s, a) => s + a.amount, 0)).toBe(7_777_777);
  });

  it("rounds a fractional budget to a whole rupee total", () => {
    const r = allocateBudget(base({ budget: 100_000.6 }));
    expect(r.allocations.reduce((s, a) => s + a.amount, 0)).toBe(100_001);
  });

  it("never produces a negative amount", () => {
    const r = allocateBudget(base({ budget: 1000 }));
    expect(r.allocations.every((a) => a.amount >= 0)).toBe(true);
  });

  it("computes per-guest cost", () => {
    const r = allocateBudget(base({ budget: 1_000_000, guests: 250 }));
    expect(r.perGuest).toBe(4000);
  });

  it("treats 0 guests as 1 to avoid division by zero", () => {
    const r = allocateBudget(base({ guests: 0, budget: 50_000 }));
    expect(Number.isFinite(r.perGuest)).toBe(true);
    expect(r.perGuest).toBe(50_000);
  });
});

describe("adjustedWeights: style and context", () => {
  it.each(TYPES)("%s weights always sum to 100", (eventType) => {
    for (const style of ["Traditional", "Luxury", "Minimal"] as const) {
      const w = adjustedWeights({ eventType, guests: 400, style, venueType: "Outdoor" });
      expect(w.reduce((s, r) => s + r.pct, 0)).toBeCloseTo(100, 8);
    }
  });

  it("Luxury raises decor and venue share", () => {
    const luxury = { eventType: "wedding", guests: 100, style: "Luxury", venueType: "Indoor" } as const;
    const normal = { ...luxury, style: "Traditional" } as const;
    expect(pct(luxury, "Decor")).toBeGreaterThan(pct(normal, "Decor"));
    expect(pct(luxury, "Venue")).toBeGreaterThan(pct(normal, "Venue"));
  });

  it("Minimal lowers decor share", () => {
    const minimal = { eventType: "wedding", guests: 100, style: "Minimal", venueType: "Indoor" } as const;
    const normal = { ...minimal, style: "Traditional" } as const;
    expect(pct(minimal, "Decor")).toBeLessThan(pct(normal, "Decor"));
  });

  it("Outdoor raises the contingency share", () => {
    const outdoor = { eventType: "wedding", guests: 100, style: "Traditional", venueType: "Outdoor" } as const;
    const indoor = { ...outdoor, venueType: "Indoor" } as const;
    expect(pct(outdoor, "Contingency")).toBeGreaterThan(pct(indoor, "Contingency"));
  });

  it("more than 300 guests raises catering, exactly 300 does not", () => {
    const mk = (guests: number) =>
      ({ eventType: "wedding", guests, style: "Traditional", venueType: "Indoor" }) as const;
    expect(pct(mk(301), "Catering")).toBeGreaterThan(pct(mk(300), "Catering"));
    expect(pct(mk(300), "Catering")).toBeCloseTo(35, 8);
  });

  it("applies decor and venue adjustments to community's Decor/Stage and Venue", () => {
    const luxury = { eventType: "community", guests: 100, style: "Luxury", venueType: "Indoor" } as const;
    const normal = { ...luxury, style: "Traditional" } as const;
    expect(pct(luxury, "Decor/Stage")).toBeGreaterThan(pct(normal, "Decor/Stage"));
  });
});

describe("feasibility warning", () => {
  it("has no warning for a healthy wedding budget", () => {
    expect(allocateBudget(base()).warning).toBeUndefined();
  });

  it("warns when catering per guest is below the minimum", () => {
    const r = allocateBudget(base({ budget: 50_000, guests: 200 }));
    expect(r.cateringPerGuest).toBeLessThan(CATERING_PER_GUEST_MIN.wedding);
    expect(r.warning).toContain("₹300");
  });

  it("uses the lower ₹150 threshold for community events", () => {
    const ok = allocateBudget(base({ eventType: "community", budget: 100_000, guests: 100 }));
    expect(ok.warning).toBeUndefined();
    const bad = allocateBudget(base({ eventType: "community", budget: 100_000, guests: 300 }));
    expect(bad.warning).toContain("₹150");
  });
});
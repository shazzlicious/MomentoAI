import { describe, expect, it } from "vitest";
import { daysBetween, generateTimeline } from "@/lib/timelineEngine";
import type { EventType } from "@/types/plan";

const TODAY = "2026-10-30";
const IN_45 = "2026-12-14"; // 45 days after TODAY (rush)
const IN_90 = "2027-01-28"; // exactly 90 days
const IN_122 = "2027-03-01"; // comfortably > 90

const TYPES: EventType[] = ["wedding", "birthday", "community", "corporate", "festival"];

describe("daysBetween", () => {
  it("counts whole days", () => {
    expect(daysBetween(TODAY, IN_45)).toBe(45);
    expect(daysBetween(TODAY, IN_90)).toBe(90);
  });
  it("is zero for the same day and negative for the past", () => {
    expect(daysBetween(TODAY, TODAY)).toBe(0);
    expect(daysBetween(IN_45, TODAY)).toBe(-45);
  });
});

describe("generateTimeline: normal plan", () => {
  const r = generateTimeline("wedding", IN_122, TODAY);

  it("is not flagged as rush", () => {
    expect(r.rush).toBe(false);
    expect(r.daysUntil).toBe(122);
  });

  it("is ordered from earliest to latest", () => {
    const days = r.milestones.map((m) => m.daysBefore);
    expect(days).toEqual([...days].sort((a, b) => b - a));
  });

  it("starts at T-90 with the venue and ends on the event day", () => {
    expect(r.milestones[0].id).toBe("venue");
    expect(r.milestones[0].daysBefore).toBe(90);
    const last = r.milestones[r.milestones.length - 1];
    expect(last.daysBefore).toBe(0);
    expect(last.dueDate).toBe(IN_122);
  });

  it("computes due dates backwards from the event date", () => {
    const venue = r.milestones.find((m) => m.id === "venue")!;
    expect(venue.dueDate).toBe("2026-12-01"); // 90 days before 2027-03-01
  });

  it("has unique ids and ISO due dates", () => {
    const ids = r.milestones.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    r.milestones.forEach((m) => expect(m.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("exactly 90 days away is not rush", () => {
    expect(generateTimeline("wedding", IN_90, TODAY).rush).toBe(false);
  });
});

describe("generateTimeline: rush plan", () => {
  const r = generateTimeline("wedding", IN_45, TODAY);

  it("is flagged as rush", () => {
    expect(r.rush).toBe(true);
    expect(r.daysUntil).toBe(45);
  });

  it("compresses proportionally (45/90 = half)", () => {
    expect(r.milestones.find((m) => m.id === "venue")!.daysBefore).toBe(45);
    expect(r.milestones.find((m) => m.id === "invites")!.daysBefore).toBe(15);
    expect(r.milestones.find((m) => m.id === "headcount")!.daysBefore).toBe(4);
  });

  it("never schedules anything before today", () => {
    r.milestones.forEach((m) => {
      expect(m.daysBefore).toBeLessThanOrEqual(r.daysUntil);
      expect(m.dueDate >= TODAY).toBe(true);
    });
  });

  it("keeps order and priority flags", () => {
    const days = r.milestones.map((m) => m.daysBefore);
    expect(days).toEqual([...days].sort((a, b) => b - a));
    expect(r.milestones.find((m) => m.id === "venue")!.priority).toBe(true);
    expect(r.milestones.find((m) => m.id === "decor")!.priority).toBe(false);
  });

  it("handles an event tomorrow without going negative", () => {
    const t = generateTimeline("birthday", "2026-10-31", TODAY);
    expect(t.rush).toBe(true);
    t.milestones.forEach((m) => {
      expect(m.daysBefore).toBeGreaterThanOrEqual(0);
      expect(m.daysBefore).toBeLessThanOrEqual(1);
    });
  });
});

describe("generateTimeline: event-type tasks", () => {
  it("adds type-specific milestones", () => {
    const ids = (t: EventType) => generateTimeline(t, IN_122, TODAY).milestones.map((m) => m.id);
    expect(ids("wedding")).toContain("attire");
    expect(ids("birthday")).toContain("cake");
    expect(ids("community")).toContain("permits");
    expect(ids("corporate")).toContain("approval");
    expect(ids("festival")).toContain("rituals");
  });

  it.each(TYPES)("%s always includes the shared core milestones", (t) => {
    const ids = generateTimeline(t, IN_122, TODAY).milestones.map((m) => m.id);
    ["venue", "caterer", "invites", "headcount", "setup", "dayof"].forEach((id) =>
      expect(ids).toContain(id),
    );
  });
});
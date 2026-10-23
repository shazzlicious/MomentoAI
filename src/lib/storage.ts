import type { Plan } from "@/types/plan";
import { plansSchema } from "./validation";

const KEY = "momento:plans";
const EVENT = "momento:plans-changed";

export function loadPlans(): Plan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = plansSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function savePlans(plans: Plan[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(plans));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // storage full or unavailable; keep in memory only
  }
}

export function upsertPlan(plan: Plan): void {
  const plans = loadPlans();
  const idx = plans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) plans[idx] = plan;
  else plans.unshift(plan);
  savePlans(plans);
}

export function deletePlan(id: string): void {
  savePlans(loadPlans().filter((p) => p.id !== id));
}

export const PLANS_EVENT = EVENT;

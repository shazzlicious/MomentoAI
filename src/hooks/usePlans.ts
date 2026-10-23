import { useCallback, useEffect, useState } from "react";
import type { Plan } from "@/types/plan";
import { PLANS_EVENT, loadPlans, upsertPlan } from "@/lib/storage";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  useEffect(() => {
    const sync = () => setPlans(loadPlans());
    sync();
    window.addEventListener(PLANS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PLANS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return plans;
}

export function usePlan(id: string) {
  const plans = usePlans();
  const plan = plans?.find((p) => p.id === id);
  const update = useCallback(
    (fn: (p: Plan) => Plan) => {
      const current = loadPlans().find((p) => p.id === id);
      if (current) upsertPlan(fn(current));
    },
    [id],
  );
  return { plan, loading: plans === null, update };
}

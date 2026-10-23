import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Confetti } from "@/components/SiteChrome";
import { usePlan } from "@/hooks/usePlans";
import { allocateBudget } from "@/lib/budgetEngine";
import { generateTimeline } from "@/lib/timelineEngine";
import { todayIso } from "@/lib/validation";
import { EVENT_LABELS, formatDate } from "@/lib/format";
import { OverviewTab, BudgetTab, TimelineTab } from "@/components/plan/PlanTabs";
import { VendorsTab, IdeasTab, ExportTab } from "@/components/plan/PlanTabs2";

export const Route = createFileRoute("/plans/$id")({
  validateSearch: z.object({ fresh: z.boolean().optional() }),
  head: () => ({
    meta: [
      { title: "Your event plan — Momento" },
      { name: "description", content: "Budget, timeline, vendors and AI ideas for your event." },
      { property: "og:title", content: "Your event plan — Momento" },
      {
        property: "og:description",
        content: "Budget, timeline, vendors and AI ideas for your event.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const TABS = ["Overview", "Budget", "Timeline", "Vendors", "Ideas", "Export"] as const;

function Dashboard() {
  const { id } = Route.useParams();
  const { fresh } = Route.useSearch();
  const { plan, loading, update } = usePlan(id);
  const [confetti, setConfetti] = useState(false);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(todayIso());
    if (fresh) {
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  }, [fresh]);

  const budget = useMemo(
    () =>
      plan
        ? allocateBudget({
            eventType: plan.basics.eventType,
            budget: plan.prefs.budget,
            guests: plan.basics.guests,
            style: plan.prefs.style,
            venueType: plan.prefs.venueType,
          })
        : null,
    [plan],
  );
  const timeline = useMemo(
    () => (plan && today ? generateTimeline(plan.basics.eventType, plan.basics.date, today) : null),
    [plan, today],
  );

  if (loading || !today) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-64 rounded-2xl" />
      </div>
    );
  }
  if (!plan || !budget || !timeline) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Plan not found</h1>
        <p className="mt-2 text-muted-foreground">
          It may have been deleted or saved in another browser.
        </p>
        <Link
          to="/plans"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-primary-foreground"
        >
          Go to My Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {confetti && <Confetti />}
      <p className="text-sm font-medium text-primary">
        {EVENT_LABELS[plan.basics.eventType]}
        {plan.basics.subType ? ` · ${plan.basics.subType}` : ""}
      </p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{plan.basics.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {formatDate(plan.basics.date)} · {plan.basics.city} · {plan.basics.guests} guests
      </p>

      <Tabs defaultValue="Overview" className="mt-8">
        <TabsList
          className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl p-1.5"
          aria-label="Plan sections"
        >
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="min-h-11 rounded-xl px-4">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="Overview" className="mt-6">
          <OverviewTab plan={plan} budget={budget} timeline={timeline} />
        </TabsContent>
        <TabsContent value="Budget" className="mt-6">
          <BudgetTab plan={plan} budget={budget} update={update} />
        </TabsContent>
        <TabsContent value="Timeline" className="mt-6">
          <TimelineTab plan={plan} timeline={timeline} today={today} update={update} />
        </TabsContent>
        <TabsContent value="Vendors" className="mt-6">
          <VendorsTab plan={plan} update={update} />
        </TabsContent>
        <TabsContent value="Ideas" className="mt-6">
          <IdeasTab plan={plan} update={update} />
        </TabsContent>
        <TabsContent value="Export" className="mt-6">
          <ExportTab plan={plan} budget={budget} timeline={timeline} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

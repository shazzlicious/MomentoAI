import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/hooks/usePlans";
import { deletePlan } from "@/lib/storage";
import { EVENT_LABELS, formatDate, formatINR } from "@/lib/format";

export const Route = createFileRoute("/plans/")({
  head: () => ({
    meta: [
      { title: "My Plans — Momento" },
      { name: "description", content: "All your saved Momento event plans in one place." },
      { property: "og:title", content: "My Plans — Momento" },
      { property: "og:description", content: "Open, continue or delete your saved event plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyPlans,
});

function MyPlans() {
  const plans = usePlans();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">My Plans</h1>
        <Button asChild className="min-h-11 rounded-full px-6">
          <Link to="/plan/new">New plan</Link>
        </Button>
      </div>
      {plans === null ? (
        <div className="mt-8 grid gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : plans.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          No plans yet. Start one and it'll appear here.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {plans.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
              <Link to="/plans/$id" params={{ id: p.id }} className="min-w-0 flex-1 rounded-lg">
                <h2 className="truncate text-lg font-semibold">{p.basics.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {EVENT_LABELS[p.basics.eventType]}
                  {p.basics.subType ? ` · ${p.basics.subType}` : ""} · {formatDate(p.basics.date)} · {p.basics.city} ·{" "}
                  {formatINR(p.prefs.budget)}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 text-destructive"
                aria-label={`Delete ${p.basics.name}`}
                onClick={() => {
                  if (window.confirm(`Delete "${p.basics.name}"?`)) deletePlan(p.id);
                }}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useServerFn } from "@tanstack/react-start";
import { Copy, Plus, Printer, RefreshCw, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VENDOR_STATUSES, type Ideas, type Plan, type VendorStatus } from "@/types/plan";
import { FALLBACK_IDEAS } from "@/data/fallbackIdeas";
import { generateIdeas } from "@/lib/ideas.functions";
import { ideasSchema } from "@/lib/validation";
import { EVENT_LABELS, formatDate, formatINR, makeId } from "@/lib/format";
import type { BudgetResult } from "@/lib/budgetEngine";
import type { TimelineResult } from "@/lib/timelineEngine";
import { Card, type Update } from "./PlanTabs";

const cell = "min-h-11 w-full rounded-lg border border-input bg-background px-2 text-sm";

export function VendorsTab({ plan, update }: { plan: Plan; update: Update }) {
  const [newCat, setNewCat] = useState("");
  const patch = (id: string, field: string, value: string | number) =>
    update((p) => ({ ...p, vendors: p.vendors.map((v) => (v.id === id ? { ...v, [field]: value } : v)) }));
  return (
    <Card title="Vendor checklist">
      <ul className="grid gap-3">
        {plan.vendors.map((v) => (
          <li key={v.id} className="rounded-xl border p-3">
            <fieldset className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_120px_140px_auto] sm:items-end">
              <legend className="mb-2 font-semibold">{v.category}</legend>
              {(["name", "contact"] as const).map((f) => (
                <label key={f} className="text-xs text-muted-foreground">
                  {f === "name" ? "Vendor name" : "Contact"}
                  <input className={cell} value={v[f]} maxLength={100} onChange={(e) => patch(v.id, f, e.target.value)} />
                </label>
              ))}
              <label className="text-xs text-muted-foreground">
                Quoted price (₹)
                <input className={cell} type="number" min={0} value={v.price || ""} onChange={(e) => patch(v.id, "price", Math.max(0, Number(e.target.value) || 0))} />
              </label>
              <label className="text-xs text-muted-foreground sm:col-span-2">
                Status
                <select className={cell} value={v.status} onChange={(e) => patch(v.id, "status", e.target.value as VendorStatus)}>
                  {VENDOR_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <Button variant="ghost" size="icon" className="size-11 text-destructive" aria-label={`Remove ${v.category} vendor`} onClick={() => update((p) => ({ ...p, vendors: p.vendors.filter((x) => x.id !== v.id) }))}>
                <Trash2 aria-hidden />
              </Button>
            </fieldset>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const c = newCat.trim().slice(0, 60);
          if (!c) return;
          update((p) => ({ ...p, vendors: [...p.vendors, { id: makeId(), category: c, name: "", contact: "", price: 0, status: "To contact" }] }));
          setNewCat("");
        }}
      >
        <label className="flex-1 text-sm font-medium">
          Add vendor category
          <input className={cell} value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Mehendi artist" />
        </label>
        <Button type="submit" className="min-h-11 rounded-full"><Plus aria-hidden /> Add vendor</Button>
      </form>
    </Card>
  );
}

const SECTIONS: { key: Exclude<keyof Ideas, "themes">; label: string }[] = [
  { key: "decor", label: "Decor" },
  { key: "menu", label: "Menu" },
  { key: "activities", label: "Activities & games" },
  { key: "gifts", label: "Return gifts" },
  { key: "playlistVibes", label: "Playlist vibes" },
  { key: "tips", label: "Tips" },
];

export function IdeasTab({ plan, update }: { plan: Plan; update: Update }) {
  const callIdeas = useServerFn(generateIdeas);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const started = useRef(false);

  const run = async () => {
    setLoading(true);
    setStatus("Generating ideas…");
    let ideas: Ideas | null = null;
    let source: "ai" | "offline" = "ai";
    try {
      const res = await Promise.race([
        callIdeas({ data: { ...plan.basics, ...plan.prefs } }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 45000)),
      ]);
      if (res.ok) {
        const parsed = ideasSchema.safeParse(res.raw);
        if (parsed.success) ideas = parsed.data;
      }
      if (!ideas) toast.info(`${res.ok ? "The AI reply was incomplete." : res.error} Showing curated ideas instead.`);
    } catch {
      toast.info("Couldn't reach the AI right now. Showing curated ideas instead.");
    }
    if (!ideas) {
      ideas = FALLBACK_IDEAS[plan.basics.eventType];
      source = "offline";
    }
    update((p) => ({ ...p, ideas: ideas!, ideasSource: source }));
    setLoading(false);
    setStatus("Ideas ready.");
  };

  useEffect(() => {
    if (!plan.ideas && !started.current) {
      started.current = true;
      void run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSave = (item: string) =>
    update((p) => ({ ...p, savedIdeas: p.savedIdeas.includes(item) ? p.savedIdeas.filter((x) => x !== item) : [...p.savedIdeas, item] }));

  const StarBtn = ({ item }: { item: string }) => {
    const saved = plan.savedIdeas.includes(item);
    return (
      <button type="button" onClick={() => toggleSave(item)} aria-pressed={saved} aria-label={saved ? "Unsave idea" : "Save idea"} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted">
        <Star className={saved ? "fill-accent text-accent-foreground" : "text-muted-foreground"} aria-hidden />
      </button>
    );
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {plan.ideasSource === "offline" ? "Curated offline ideas." : "AI-generated, please verify details before booking."}
        </p>
        <Button onClick={run} disabled={loading} variant="outline" className="min-h-11 rounded-full">
          <RefreshCw className={loading ? "animate-spin" : ""} aria-hidden /> Regenerate
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">{status}</p>
      {loading || !plan.ideas ? (
        <div className="grid gap-4 md:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <Card title="Themes">
            <ul className="grid gap-3 md:grid-cols-3">
              {plan.ideas.themes.map((t) => (
                <li key={t.title} className="flex gap-2 rounded-xl bg-muted p-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  </div>
                  <StarBtn item={`Theme: ${t.title}`} />
                </li>
              ))}
            </ul>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map(({ key, label }) => (
              <Card key={key} title={label}>
                <ul className="grid gap-1">
                  {plan.ideas![key].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <span className="flex-1">{item}</span>
                      <StarBtn item={item} />
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          {plan.savedIdeas.length > 0 && (
            <Card title="Saved ideas">
              <ul className="list-disc pl-5 text-sm">{plan.savedIdeas.map((s) => <li key={s}>{s}</li>)}</ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export function planToText(plan: Plan, budget: BudgetResult, timeline: TimelineResult): string {
  const b = plan.basics;
  const lines = [
    `MOMENTO PLAN — ${b.name}`,
    `${EVENT_LABELS[b.eventType]}${b.subType ? ` (${b.subType})` : ""} · ${formatDate(b.date)} · ${b.city} · ${b.guests} guests`,
    `Budget: ${formatINR(plan.prefs.budget)} · ${plan.prefs.style} · ${plan.prefs.diet} · ${plan.prefs.venueType}`,
    "",
    "BUDGET",
    ...budget.allocations.map((a) => `- ${a.category}: ${formatINR(a.amount)} (spent ${formatINR(plan.actuals[a.category] ?? 0)})`),
    "",
    `TIMELINE${timeline.rush ? " (Rush plan)" : ""}`,
    ...timeline.milestones.map((m) => `[${plan.doneTasks.includes(m.id) ? "x" : " "}] ${formatDate(m.dueDate)} — ${m.title}`),
    "",
    "VENDORS",
    ...plan.vendors.map((v) => `- ${v.category}: ${v.name || "TBD"} ${v.contact ? `(${v.contact})` : ""} · ${v.price ? formatINR(v.price) : "no quote"} · ${v.status}`),
  ];
  if (plan.savedIdeas.length) lines.push("", "SAVED IDEAS", ...plan.savedIdeas.map((s) => `- ${s}`));
  return lines.join("\n");
}

export function ExportTab({ plan, budget, timeline }: { plan: Plan; budget: BudgetResult; timeline: TimelineResult }) {
  const text = planToText(plan, budget, timeline);
  return (
    <Card title="Export">
      <div className="no-print flex flex-wrap gap-3">
        <Button onClick={() => window.print()} className="min-h-11 rounded-full"><Printer aria-hidden /> Print / Save as PDF</Button>
        <Button
          variant="outline"
          className="min-h-11 rounded-full"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              toast.success("Plan copied to clipboard");
            } catch {
              toast.error("Couldn't copy. Select the text below instead.");
            }
          }}
        >
          <Copy aria-hidden /> Copy plan as text
        </Button>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm">{text}</pre>
    </Card>
  );
}

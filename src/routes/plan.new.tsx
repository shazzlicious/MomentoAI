import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, describedBy, inputCls } from "@/components/Field";
import {
  DIETS,
  EVENT_TYPES,
  STYLES,
  SUB_TYPES,
  VENUE_TYPES,
  type EventType,
  type Plan,
} from "@/types/plan";
import { basicsSchema, prefsSchema, sanitizeNotes, todayIso } from "@/lib/validation";
import { EVENT_LABELS, formatDate, formatINR, makeId } from "@/lib/format";
import { defaultVendors } from "@/lib/vendorTemplates";
import { upsertPlan } from "@/lib/storage";

export const Route = createFileRoute("/plan/new")({
  validateSearch: z.object({ type: z.enum(EVENT_TYPES).optional() }),
  head: () => ({
    meta: [
      { title: "Plan a new event — Momento" },
      {
        name: "description",
        content: "Three quick steps: event basics, budget and style, then generate your plan.",
      },
      { property: "og:title", content: "Plan a new event — Momento" },
      {
        property: "og:description",
        content: "Create a budget, timeline and vendor checklist in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wizard,
});

type Errors = Record<string, string | undefined>;
const STEPS = ["Event basics", "Budget and style", "Review and generate"];

function Wizard() {
  const { type } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({
    eventType: (type ?? "wedding") as EventType,
    subType: "",
    name: "",
    date: "",
    city: "",
    guests: "100",
    budget: "500000",
    style: "Traditional",
    diet: "Mixed",
    venueType: "Indoor",
    notes: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const subs = SUB_TYPES[form.eventType];
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return todayIso(d);
  }, []);

  const validate = (s: number) => {
    const schema = s === 0 ? basicsSchema : prefsSchema;
    const input =
      s === 0
        ? { ...form, subType: subs.length ? form.subType : undefined }
        : {
            budget: form.budget,
            style: form.style,
            diet: form.diet,
            venueType: form.venueType,
            notes: form.notes,
          };
    const r = schema.safeParse(input);
    if (r.success) {
      setErrors({});
      return true;
    }
    const e: Errors = {};
    for (const iss of r.error.issues) e[String(iss.path[0])] ??= iss.message;
    setErrors(e);
    const first = Object.keys(e)[0];
    setTimeout(() => document.getElementById(`f-${first}`)?.focus(), 0);
    return false;
  };

  const next = () => {
    if (validate(step)) setStep((s) => s + 1);
  };

  const generate = () => {
    if (!validate(0)) return setStep(0);
    if (!validate(1)) return setStep(1);
    const plan: Plan = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      basics: {
        eventType: form.eventType,
        subType: subs.length ? form.subType : undefined,
        name: form.name.trim(),
        date: form.date,
        city: form.city.trim(),
        guests: Number(form.guests),
      },
      prefs: {
        budget: Number(form.budget),
        style: form.style as Plan["prefs"]["style"],
        diet: form.diet as Plan["prefs"]["diet"],
        venueType: form.venueType as Plan["prefs"]["venueType"],
        notes: sanitizeNotes(form.notes) || undefined,
      },
      actuals: {},
      doneTasks: [],
      vendors: defaultVendors(form.eventType, makeId),
      savedIdeas: [],
    };
    upsertPlan(plan);
    navigate({ to: "/plans/$id", params: { id: plan.id }, search: { fresh: true } });
  };

  const err = (k: string) => errors[k];
  const common = (k: string, hint?: string) => ({
    id: `f-${k}`,
    "aria-invalid": Boolean(err(k)),
    "aria-describedby": describedBy(`f-${k}`, err(k), hint),
    className: inputCls,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Plan your event</h1>
      <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className="text-xs sm:text-sm">
            <div className={`h-2 rounded-full ${i <= step ? "bg-brand" : "bg-muted"}`} />
            <span
              className={`mt-2 block ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      <form
        className="mt-8 rounded-3xl border bg-card p-6 shadow-soft"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) next();
          else generate();
        }}
      >
        <h2 className="mb-6 text-xl font-semibold">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="f-eventType" label="Event type" error={err("eventType")}>
              <select
                {...common("eventType")}
                value={form.eventType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventType: e.target.value as EventType, subType: "" }))
                }
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            {subs.length > 0 ? (
              <Field id="f-subType" label="Sub-type" error={err("subType")}>
                <select
                  {...common("subType")}
                  value={form.subType}
                  onChange={(e) => set("subType", e.target.value)}
                >
                  <option value="">Choose…</option>
                  {subs.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            ) : (
              <div className="hidden sm:block" />
            )}
            <div className="sm:col-span-2">
              <Field id="f-name" label="Event name" error={err("name")}>
                <input
                  {...common("name")}
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Aanya turns 5"
                />
              </Field>
            </div>
            <Field id="f-date" label="Date" error={err("date")}>
              <input
                {...common("date")}
                type="date"
                min={minDate}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </Field>
            <Field id="f-city" label="City" error={err("city")}>
              <input
                {...common("city")}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Pune"
              />
            </Field>
            <Field
              id="f-guests"
              label="Guest count"
              error={err("guests")}
              hint="Between 1 and 2000"
            >
              <input
                {...common("guests", "Between 1 and 2000")}
                type="number"
                inputMode="numeric"
                min={1}
                max={2000}
                value={form.guests}
                onChange={(e) => set("guests", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="f-budget"
              label="Total budget (₹)"
              error={err("budget")}
              hint={Number(form.budget) ? formatINR(Number(form.budget)) : undefined}
            >
              <input
                {...common("budget", "x")}
                type="number"
                inputMode="numeric"
                min={1000}
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
              />
            </Field>
            <Field id="f-style" label="Style / theme" error={err("style")}>
              <select
                {...common("style")}
                value={form.style}
                onChange={(e) => set("style", e.target.value)}
              >
                {STYLES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field id="f-diet" label="Dietary needs" error={err("diet")}>
              <select
                {...common("diet")}
                value={form.diet}
                onChange={(e) => set("diet", e.target.value)}
              >
                {DIETS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-sm font-medium">Setting</legend>
              <div className="flex gap-2">
                {VENUE_TYPES.map((v) => (
                  <label
                    key={v}
                    className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 ${form.venueType === v ? "border-primary bg-muted font-semibold text-primary" : ""}`}
                  >
                    <input
                      type="radio"
                      name="venueType"
                      value={v}
                      checked={form.venueType === v}
                      onChange={() => set("venueType", v)}
                      className="size-4 accent-current"
                    />
                    {v}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="sm:col-span-2">
              <Field
                id="f-notes"
                label="Special notes (optional)"
                error={err("notes")}
                hint={`${form.notes.length}/300 characters`}
              >
                <textarea
                  {...common("notes", "x")}
                  rows={3}
                  maxLength={300}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Grandparents attending, prefer early evening…"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              [
                "Event",
                `${EVENT_LABELS[form.eventType]}${form.subType ? ` · ${form.subType}` : ""}`,
              ],
              ["Name", form.name],
              ["Date", form.date ? formatDate(form.date) : "—"],
              ["City", form.city],
              ["Guests", form.guests],
              ["Budget", formatINR(Number(form.budget))],
              ["Style", form.style],
              ["Diet", form.diet],
              ["Setting", form.venueType],
              ["Notes", form.notes || "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-muted p-3">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-medium break-words">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-full px-6"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          <Button type="submit" className="min-h-11 rounded-full px-6">
            {step < 2 ? "Next" : "Generate plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}

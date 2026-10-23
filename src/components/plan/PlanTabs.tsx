import { AlertTriangle, Zap } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Plan } from "@/types/plan";
import type { BudgetResult } from "@/lib/budgetEngine";
import type { TimelineResult } from "@/lib/timelineEngine";
import { formatDate, formatINR } from "@/lib/format";
import { Progress } from "@/components/ui/progress";

export type Update = (fn: (p: Plan) => Plan) => void;
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="print-break rounded-2xl border bg-card p-5">
    <h2 className="mb-4 text-lg font-semibold">{title}</h2>
    {children}
  </section>
);

function spentTotal(plan: Plan) {
  return Object.values(plan.actuals).reduce((s, n) => s + (n || 0), 0);
}

export function OverviewTab({
  plan,
  budget,
  timeline,
}: {
  plan: Plan;
  budget: BudgetResult;
  timeline: TimelineResult;
}) {
  const spent = spentTotal(plan);
  const pct = Math.min(100, Math.round((spent / plan.prefs.budget) * 100));
  const health = spent > plan.prefs.budget ? "Over budget" : pct > 85 ? "Tight" : "Healthy";
  const done = timeline.milestones.filter((m) => plan.doneTasks.includes(m.id)).length;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Days remaining">
        <p className="font-display text-5xl font-bold text-primary">
          {Math.max(0, timeline.daysUntil)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">until {formatDate(plan.basics.date)}</p>
        {timeline.rush && (
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-warning px-3 py-1 text-sm font-medium text-warning-foreground">
            <Zap className="size-4" aria-hidden /> Rush plan
          </p>
        )}
      </Card>
      <Card title="Budget health">
        <p className="text-2xl font-semibold">{health}</p>
        <Progress value={pct} className="mt-3 h-3" aria-label={`Spent ${pct}% of budget`} />
        <p className="mt-2 text-sm text-muted-foreground">
          {formatINR(spent)} spent of {formatINR(plan.prefs.budget)} · {formatINR(budget.perGuest)}{" "}
          per guest
        </p>
      </Card>
      <Card title="Progress">
        <p className="text-2xl font-semibold">
          {done}/{timeline.milestones.length} tasks done
        </p>
        <Progress
          value={(done / timeline.milestones.length) * 100}
          className="mt-3 h-3"
          aria-label="Task progress"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {plan.prefs.style} · {plan.prefs.diet} · {plan.prefs.venueType}
        </p>
      </Card>
      {budget.warning && (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-warning bg-warning/20 p-4 md:col-span-3"
        >
          <AlertTriangle className="mt-0.5 shrink-0" aria-hidden />
          <p>{budget.warning}</p>
        </div>
      )}
    </div>
  );
}

export function BudgetTab({
  plan,
  budget,
  update,
}: {
  plan: Plan;
  budget: BudgetResult;
  update: Update;
}) {
  const data = budget.allocations.map((a) => ({ name: a.category, value: a.amount }));
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card title="Allocation by category">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Budget allocation, actual spend and remaining per category
            </caption>
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th scope="col" className="py-2 pr-2">
                  Category
                </th>
                <th scope="col" className="py-2 pr-2 text-right">
                  Allocated
                </th>
                <th scope="col" className="py-2 pr-2 text-right">
                  Actual spent
                </th>
                <th scope="col" className="py-2 text-right">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody>
              {budget.allocations.map((a) => {
                const actual = plan.actuals[a.category] ?? 0;
                const rem = a.amount - actual;
                const inputId = `actual-${a.category.replace(/\W/g, "")}`;
                return (
                  <tr key={a.category} className="border-b last:border-0">
                    <th scope="row" className="py-2 pr-2 text-left font-medium">
                      {a.category}{" "}
                      <span className="text-xs text-muted-foreground">({a.pct.toFixed(1)}%)</span>
                    </th>
                    <td className="py-2 pr-2 text-right tabular-nums">{formatINR(a.amount)}</td>
                    <td className="py-2 pr-2 text-right">
                      <label htmlFor={inputId} className="sr-only">
                        Actual spent on {a.category}
                      </label>
                      <input
                        id={inputId}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={actual || ""}
                        placeholder="0"
                        onChange={(e) => {
                          const v = Math.max(0, Number(e.target.value) || 0);
                          update((p) => ({ ...p, actuals: { ...p.actuals, [a.category]: v } }));
                        }}
                        className="min-h-11 w-28 rounded-lg border border-input bg-background px-2 text-right tabular-nums"
                      />
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {rem < 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                          Over by {formatINR(-rem)}
                        </span>
                      ) : (
                        formatINR(rem)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <th scope="row" className="pt-3 text-left">
                  Total
                </th>
                <td className="pt-3 pr-2 text-right">{formatINR(plan.prefs.budget)}</td>
                <td className="pt-3 pr-2 text-right">{formatINR(spentTotal(plan))}</td>
                <td className="pt-3 text-right">
                  {formatINR(plan.prefs.budget - spentTotal(plan))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {budget.warning && (
          <p className="mt-4 text-sm text-destructive" role="note">
            {budget.warning}
          </p>
        )}
      </Card>
      <Card title="Budget split">
        <figure aria-label="Donut chart of the budget split; the table lists the same figures.">
          <div className="h-64" aria-hidden>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="90%"
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            Same figures are in the table.
          </figcaption>
        </figure>
      </Card>
    </div>
  );
}

export function TimelineTab({
  plan,
  timeline,
  today,
  update,
}: {
  plan: Plan;
  timeline: TimelineResult;
  today: string;
  update: Update;
}) {
  const done = timeline.milestones.filter((m) => plan.doneTasks.includes(m.id)).length;
  const toggle = (id: string) =>
    update((p) => ({
      ...p,
      doneTasks: p.doneTasks.includes(id)
        ? p.doneTasks.filter((x) => x !== id)
        : [...p.doneTasks, id],
    }));
  return (
    <Card title="Milestones">
      {timeline.rush && (
        <p
          role="note"
          className="mb-4 flex items-center gap-2 rounded-xl bg-warning/25 p-3 text-sm"
        >
          <Zap className="size-4 shrink-0" aria-hidden />
          Rush plan: under 90 days to go, so the schedule is compressed. Starred tasks come first.
        </p>
      )}
      <Progress
        value={(done / timeline.milestones.length) * 100}
        className="h-3"
        aria-label="Timeline progress"
      />
      <p className="mt-2 text-sm text-muted-foreground">
        {done} of {timeline.milestones.length} complete
      </p>
      <ul className="mt-4 divide-y">
        {timeline.milestones.map((m) => {
          const checked = plan.doneTasks.includes(m.id);
          const overdue = !checked && m.dueDate < today;
          return (
            <li key={m.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(m.id)}
                  className="size-5 accent-current text-primary"
                />
                <span className={`flex-1 ${checked ? "text-muted-foreground line-through" : ""}`}>
                  {m.priority && timeline.rush && <span aria-label="Priority">★ </span>}
                  {m.title}
                </span>
                <span
                  className={`text-sm tabular-nums ${overdue ? "font-semibold text-destructive" : "text-muted-foreground"}`}
                >
                  {m.daysBefore === 0 ? "Day of" : `T-${m.daysBefore}`} · {formatDate(m.dueDate)}
                  {overdue && " · Overdue"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

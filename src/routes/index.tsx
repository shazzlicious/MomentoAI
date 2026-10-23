import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Cake, Heart, Sparkle, Users } from "lucide-react";
import logo from "@/assets/momento-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import type { EventType } from "@/types/plan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Momento — Every moment, perfectly planned." },
      { name: "description", content: "Budgets, timelines, vendors and AI-powered ideas for weddings, birthdays, festivals, corporate and community events." },
      { property: "og:title", content: "Momento — Every moment, perfectly planned." },
      { property: "og:description", content: "Plan weddings, birthdays, festivals, corporate and community events in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CARDS: { type: EventType; title: string; line: string; Icon: typeof Heart }[] = [
  { type: "wedding", title: "Wedding", line: "Mehendi to vidaai, every ritual on schedule.", Icon: Heart },
  { type: "birthday", title: "Birthday", line: "First birthdays to milestone 50s, made memorable.", Icon: Cake },
  { type: "festival", title: "Festival", line: "Diwali, Eid, Christmas and beyond, celebrated beautifully.", Icon: Sparkle },
  { type: "corporate", title: "Corporate / Internal", line: "From team offsites to annual days, planned in minutes.", Icon: Briefcase },
  { type: "community", title: "Community", line: "Melas, drives and society events that bring people together.", Icon: Users },
];

function Landing() {
  return (
    <>
      <section className="bg-hero" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="mb-4 inline-block rounded-full bg-card/70 px-3 py-1 text-sm font-medium text-primary">
              GenAI celebration planner
            </p>
            <h1 id="hero-title" className="text-4xl font-bold leading-tight sm:text-6xl">
              Every moment, <span className="text-brand">perfectly planned.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Budgets, timelines, vendors and AI-powered ideas for weddings, birthdays, festivals, corporate and
              community events.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-h-12 rounded-full px-7 text-base shadow-soft">
                <Link to="/plan/new">Start planning</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12 rounded-full px-7 text-base">
                <Link to="/plans">My Plans</Link>
              </Button>
            </div>
          </div>
          <img
            src={logo.url}
            alt="Momento logo: a ribbon M in violet, rose and amber"
            width={420}
            height={420}
            className="mx-auto w-64 rounded-3xl shadow-soft md:w-96"
          />
        </div>
      </section>

      <section aria-labelledby="types-title" className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="types-title" className="text-2xl font-semibold sm:text-3xl">
          What are you celebrating?
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CARDS.map(({ type, title, line, Icon }) => (
            <li key={type}>
              <Link
                to="/plan/new"
                search={{ type }}
                className="group flex h-full flex-col rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-muted text-primary">
                  <Icon aria-hidden />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

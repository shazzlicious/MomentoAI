import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import mark from "@/assets/momento-mark.png";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("momento:theme");
    const isDark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("momento:theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
    >
      {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}

export function SiteHeader() {
  const linkCls =
    "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground data-[status=active]:text-primary";
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2 rounded-lg"
          aria-label="Momento home"
        >
          <img src={mark} alt="" width={36} height={36} className="size-9" />
          <span className="font-display text-xl font-bold text-primary">Momento</span>
        </Link>
        <nav aria-label="Main" className="flex items-center">
          <Link to="/plans" className={linkCls}>
            My Plans
          </Link>
          <Link to="/plan/new" className={linkCls}>
            New plan
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          <span className="font-display font-semibold text-foreground">Momento</span> — Every
          moment, perfectly planned.
        </p>
        <p>Your plans are stored only in this browser.</p>
      </div>
    </footer>
  );
}

export function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"][i % 4],
    })),
  );
  return (
    <div aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: `${p.left}vw`, animationDelay: `${p.delay}s`, background: p.color }}
        />
      ))}
    </div>
  );
}

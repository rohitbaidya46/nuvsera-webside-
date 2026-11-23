"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("nv_theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-fg ${className}`}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark ?? undefined}
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}

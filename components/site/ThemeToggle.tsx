"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode: theme just won't persist */
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-ink ${className}`}
      aria-label="Switch between light and dark reading modes"
      title="Light / dark"
    >
      <Sun className="size-3.5 dark:hidden" strokeWidth={1.75} />
      <Moon className="hidden size-3.5 dark:block" strokeWidth={1.75} />
      <span className="dark:hidden">Night</span>
      <span className="hidden dark:inline">Day</span>
    </button>
  );
}

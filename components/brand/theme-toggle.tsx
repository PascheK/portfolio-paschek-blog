'use client';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import React from "react";

/** Icon button that flips light/dark. Used where the full navbar is not mounted. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
    >
      {mounted ? (theme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />) : <span className="size-4" />}
    </button>
  );
}

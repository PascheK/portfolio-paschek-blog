import React from "react";
import { cn } from "@/lib/utils";

export type CategoryOption = { value: string; label: string };
interface CategoryFilterProps {
  categories: CategoryOption[];
  selected: string; // selected value
  onSelect: (value: string) => void;
  className?: string;
  label?: string;
}

/** Segmented filter. Active = foreground-on-surface-alt with a primary underline; no fills, no scale. */
export function CategoryFilter({ categories, selected, onSelect, className = "", label = "Categories" }: CategoryFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label={label}>
      {categories.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(cat.value)}
            className={cn(
              "h-9 rounded-lg border px-3 text-sm transition-colors duration-150",
              isActive
                ? "border-border-strong bg-surface-alt font-medium text-foreground"
                : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

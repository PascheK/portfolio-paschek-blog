import React from "react";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

export type CategoryOption = { value: string; label: string };
interface CategoryFilterProps {
  categories: CategoryOption[];
  selected: string; // selected value
  onSelect: (value: string) => void;
  className?: string;
}

export function CategoryFilter({ categories, selected, onSelect, className = "" }: CategoryFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist" aria-label="Project categories">
      {categories.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => onSelect(cat.value)}
            className={cn(
              buttonVariants({ variant: isActive ? "default" : "outline", size: "sm" }),
              "rounded-full transition-transform duration-150 focus-visible:scale-[1.03] hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-md"
                : "bg-surface-alt/70 dark:bg-surface-alt/30 text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
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
              "rounded-full transition-transform duration-150 focus-visible:scale-[1.03] hover:scale-[1.02]",
              isActive
                ? "bg-gradient-to-r from-blue-600 to-pink-500 text-white border-transparent shadow-md"
                : "text-neutral-200"
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
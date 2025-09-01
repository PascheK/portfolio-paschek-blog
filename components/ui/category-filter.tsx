import React from "react";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
  className?: string;
}

export function CategoryFilter({ categories, selected, onSelect, className = "" }: CategoryFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-3 py-1 rounded-full border text-sm transition-colors ${selected === cat ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
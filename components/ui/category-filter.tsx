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
          className={`px-4 py-1.5 rounded-full border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2 transition-all duration-150
            ${selected === cat
              ? "bg-gradient-to-r from-blue-600 to-pink-500 text-white border-transparent shadow-md scale-105"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-pink-400"}
          `}
          style={{ minWidth: 80 }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
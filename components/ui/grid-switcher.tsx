import React from "react";

interface GridSwitcherProps {
  values?: number[];
  value: number;
  onChange: (n: number) => void;
  className?: string;
}

export function GridSwitcher({ values = [1, 2, 4], value, onChange, className = "" }: GridSwitcherProps) {
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <span className="text-sm text-neutral-500 mr-2">Affichage :</span>
      {values.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${value === n ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"}`}
          aria-label={`Afficher en ${n} colonne${n > 1 ? "s" : ""}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
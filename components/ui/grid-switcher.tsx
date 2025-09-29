import React from "react";
import { LayoutGrid, Square, Rows } from "lucide-react";

interface GridSwitcherProps {
  values?: number[];
  value: number;
  onChange: (n: number) => void;
  className?: string;
  label?: string;
}

export function GridSwitcher({ values = [1, 2, 4], value, onChange, className = "", label = "Affichage :" }: GridSwitcherProps) {
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <span className="text-sm text-muted-foreground mr-2">{label}</span>
      {values.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 ${value === n
            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-md scale-110"
            : "bg-surface-alt/70 dark:bg-surface-alt/30 text-muted-foreground border-border hover:bg-surface-alt hover:text-foreground dark:hover:text-foreground hover:border-primary/50"}`}
          aria-label={`Afficher en ${n} colonne${n > 1 ? "s" : ""}`}
        >
          {n === 1 && <Square size={20} />}
          {n === 2 && <Rows size={20} />}
          {n === 4 && <LayoutGrid size={20} />}
          {/* Affiche le nombre si aucune icône n'est définie pour cette valeur */}
          {[1, 2, 4].includes(n) ? null : n}
        </button>
      ))}
    </div>
  );
}
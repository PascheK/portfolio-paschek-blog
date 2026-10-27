import { ArrowDown } from "lucide-react";

/**
 * Hero → next section teaser. Static (no loop): hairline with a primary
 * segment, the label of what comes next, and an arrow.
 */
export function ScrollCue({ href, label, next }: { href: string; label: string; next: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-4 rounded-md font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
    >
      <span className="relative h-12 w-px overflow-hidden bg-border-strong" aria-hidden>
        <span className="absolute inset-x-0 top-0 h-1/2 bg-primary" />
      </span>
      <span className="flex flex-col gap-1.5">
        <span>{label}</span>
        <span className="flex items-center gap-2 text-foreground">
          {next}
          <ArrowDown className="size-3.5 transition-transform duration-150 group-hover:translate-y-0.5" aria-hidden />
        </span>
      </span>
    </a>
  );
}

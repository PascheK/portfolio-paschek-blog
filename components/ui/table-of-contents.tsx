import React from "react";
import { Heading } from "@/lib/toc";

export function TableOfContents({
  headings,
  title = "On this page",
  className = "",
}: {
  headings: Heading[];
  title?: string;
  className?: string;
}) {
  if (!headings.length) return null;

  return (
    <aside
      className={[
        "hidden lg:block lg:sticky lg:top-28",
        "bg-surface-alt/70 border border-border rounded-xl p-4 shadow-sm",
        "w-56 h-fit",
        className,
      ].join(" ")}
      aria-label={title}
    >
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">
        {title}
      </h2>
      <nav className="space-y-1.5 text-sm">
        {headings.map((h, idx) => (
          <a
            key={`${h.slug}-${idx}`}
            href={`#${h.slug}`}
            className={[
              "group block leading-snug text-foreground/80 hover:text-primary transition-colors",
              h.depth === 1 ? "font-medium" : h.depth === 2 ? "pl-3" : "pl-6 text-xs",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-[6px] w-[6px] rounded-full bg-primary/60 group-hover:bg-primary transition-colors" aria-hidden />
              <span>{h.text}</span>
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

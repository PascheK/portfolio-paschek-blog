/** Slow skills ticker. Second copy is decorative (aria-hidden); pauses on hover/focus. */
export function SkillMarquee({ skills, label }: { skills: string[]; label: string }) {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : label}
      className="flex shrink-0 items-center gap-3 pr-3"
    >
      {skills.map((s) => (
        <li
          key={s}
          className="rounded-lg border border-border bg-surface px-4 py-2 font-mono text-[13px] text-foreground/80"
        >
          {s}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

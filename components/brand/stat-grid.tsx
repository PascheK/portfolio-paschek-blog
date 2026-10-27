import { CountUp } from "@/components/brand/count-up";

/** Hairline-divided figures: mono number over an eyebrow label. 2 cols on mobile, 4 from md. */
export function StatGrid({
  stats,
  label,
}: {
  stats: { value: string; label: string }[];
  label: string;
}) {
  return (
    <section aria-label={label}>
      <dl className="grid grid-cols-2 border-y border-border md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={`${s.label}-${i}`}
            className={[
              "px-4 py-6 md:px-6",
              i % 2 === 1 ? "border-l border-border" : "",
              i >= 2 ? "border-t border-border md:border-t-0" : "",
              i > 0 ? "md:border-l md:border-border" : "",
            ].join(" ")}
          >
            <dd className="font-mono text-3xl font-medium tracking-tight"><CountUp value={s.value} /></dd>
            <dt className="eyebrow mt-2">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

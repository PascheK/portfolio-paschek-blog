import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Section title row: h2 (+ optional lead) on the left, quiet "see all" link on the right. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-4 mb-8 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 id={id} className="t-h2">
          {title}
        </h2>
        {description && <p className="t-lead mt-2 max-w-xl">{description}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="link-quiet shrink-0 inline-flex items-center gap-1.5 text-sm font-medium rounded-md"
        >
          {linkLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

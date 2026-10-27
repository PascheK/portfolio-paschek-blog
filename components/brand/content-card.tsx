import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/dates";

const ANGLES = [135, 200, 320] as const;

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Flat monochrome gradient + mono label. Used whenever a project / post has no
 * cover image (see /brand.md → Components → Cover placeholder).
 */
export function CoverPlaceholder({
  seed,
  label,
  className = "",
}: {
  seed: string;
  label: string;
  className?: string;
}) {
  const angle = ANGLES[hash(seed) % ANGLES.length];
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative h-full w-full ${className}`}
      style={{
        backgroundImage: `linear-gradient(${angle}deg, color-mix(in srgb, var(--primary) 26%, var(--surface-alt)) 0%, color-mix(in srgb, var(--primary) 6%, var(--surface-alt)) 100%)`,
      }}
    >
      <span className="absolute bottom-3 left-4 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/70">
        {label}
      </span>
    </div>
  );
}

type ContentCardProps = {
  href: string;
  title: string;
  summary?: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  date?: string;
  locale?: string;
  meta?: string;
  /** Label shown on the placeholder when there is no image (default: first tag, then fallbackLabel). */
  coverLabel?: string;
  fallbackLabel: string;
  /** Opens in a new tab and shows an external-link glyph. */
  external?: boolean;
  /** Visible call-to-action text at the card foot. */
  cta?: string;
  /** Max tags rendered. */
  maxTags?: number;
};

/**
 * The one card used for projects and articles everywhere.
 * Single stretched link (the title) so the whole card is one tab stop.
 */
export function ContentCard({
  href,
  title,
  summary,
  image,
  imageAlt,
  tags = [],
  date,
  locale = "en-US",
  meta,
  coverLabel,
  fallbackLabel,
  external = false,
  cta,
  maxTags = 3,
}: ContentCardProps) {
  const label = (coverLabel ?? tags[0] ?? fallbackLabel).toUpperCase();
  const linkProps = external
    ? { target: "_blank", rel: "noreferrer noopener" }
    : {};

  return (
    <article className="card card-interactive group relative h-full flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-surface-alt">
        {image ? (
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <CoverPlaceholder seed={href} label={label} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {(date || meta) && (
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {date && <time dateTime={date}>{formatDate(date, false, locale)}</time>}
            {date && meta && <span aria-hidden>·</span>}
            {meta && <span>{meta}</span>}
          </p>
        )}

        <h3 className="t-h3 group-hover:text-primary group-focus-within:text-primary transition-colors duration-150">
          <Link
            href={href}
            {...linkProps}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4"
          >
            {title}
          </Link>
        </h3>

        {summary && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {summary}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          {tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
              {tags.slice(0, maxTags).map((t) => (
                <li key={t} className="tag">
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          {(cta || external) && (
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-150">
              {cta}
              {external && <ArrowUpRight className="size-4" aria-hidden />}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

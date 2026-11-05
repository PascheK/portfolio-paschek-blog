import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/dates";
import type { Video } from "@/lib/youtube";
import { VideoPlayer } from "@/components/brand/video-player";

/** Date and view count as short strings, whichever the data source could provide. */
export function videoMeta(v: Video, locale: string, viewsLabel: string): string[] {
  const views =
    typeof v.views === "number"
      ? `${new Intl.NumberFormat(locale, { notation: "compact" }).format(v.views)} ${viewsLabel}`
      : v.views
        ? `${v.views} ${viewsLabel}`
        : null;
  const date = v.publishedAt ? formatDate(v.publishedAt, false, locale) : v.publishedText ?? null;
  return [date, views].filter(Boolean) as string[];
}

/** Video card: click-to-play thumbnail, meta line, title linking to YouTube. */
export function VideoCard({
  video,
  locale,
  playLabel,
  viewsLabel,
  watchLabel,
}: {
  video: Video;
  locale: string;
  playLabel: string;
  viewsLabel: string;
  watchLabel: string;
}) {
  const meta = videoMeta(video, locale, viewsLabel);
  const href = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <article className="card card-interactive flex h-full w-full flex-col overflow-hidden">
      <VideoPlayer id={video.id} title={video.title} duration={video.durationText} playLabel={playLabel} className="border-b border-border" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {meta.length > 0 && (
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{meta.join("  ·  ")}</p>
        )}
        <h3 className="t-h3 line-clamp-3">
          <a href={href} target="_blank" rel="noopener noreferrer" className="rounded-sm hover:text-primary">
            {video.title}
          </a>
        </h3>
        {video.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{video.description}</p>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden
          className="link-quiet mt-auto inline-flex items-center gap-1.5 self-start pt-2 text-sm font-medium"
        >
          {watchLabel}
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </article>
  );
}

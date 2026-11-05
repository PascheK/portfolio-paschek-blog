'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Click-to-play YouTube embed: shows the thumbnail with a play button and only loads the
 * (privacy-friendly) player when asked, so a page of videos stays light.
 */
export function VideoPlayer({
  id,
  title,
  duration,
  playLabel,
  className = '',
}: {
  id: string;
  title: string;
  duration?: string;
  playLabel: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`relative aspect-video overflow-hidden bg-surface-alt ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${playLabel}: ${title}`}
          className="group/play absolute inset-0 block size-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
          <span className="absolute inset-0 bg-background/10 transition-colors duration-150 group-hover/play:bg-background/0" />
          <span className="absolute left-1/2 top-1/2 inline-flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-150 group-hover/play:scale-105">
            <Play className="size-6 translate-x-0.5" aria-hidden fill="currentColor" />
          </span>
          {duration && (
            <span className="absolute bottom-3 right-3 rounded-md bg-background/90 px-2 py-1 font-mono text-[11px] text-foreground">
              {duration}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

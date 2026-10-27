'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type EventType = 'work' | 'education' | 'project' | 'milestone';

export interface TimelineEvent {
  year: string;
  startYear: number;
  type: EventType;
  title: string;
  org?: string;
  location?: string;
  description: string;
  tags?: string[];
  current?: boolean;
  url?: string;
}

const FILTER_LABELS: Record<EventType | 'all', { en: string; fr: string }> = {
  all:       { en: 'All',        fr: 'Tout' },
  work:      { en: 'Work',       fr: 'Emploi' },
  education: { en: 'Education',  fr: 'Formation' },
  project:   { en: 'Projects',   fr: 'Projets' },
  milestone: { en: 'Milestones', fr: 'Étapes' },
};

interface Props {
  events: TimelineEvent[];
  lang: 'en' | 'fr';
  labels: {
    work: string; education: string; project: string; milestone: string;
    current: string;
  };
}

/**
 * Experience timeline that reacts to the scroll:
 * - a hairline rail fills with `primary` as you read down the list;
 * - each entry's node lights up once you reach it, and the entry being read is highlighted
 *   while the ones still ahead are softened;
 * - year labels stay pinned while their entries scroll past;
 * - clicking a node or the rail jumps to the entry.
 * Type is a text label, never a color.
 */
export function TimelineClient({ events, lang, labels }: Props) {
  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all');
  const [reached, setReached] = useState(0); // number of entries whose top is above the reading line
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const totalRef = useRef(0);

  const filtered = activeFilter === 'all'
    ? events
    : events.filter((e) => e.type === activeFilter);

  const yearGroups = filtered.reduce<Record<string, TimelineEvent[]>>((acc, e) => {
    const y = String(e.startYear);
    if (!acc[y]) acc[y] = [];
    acc[y].push(e);
    return acc;
  }, {});
  const sortedYears = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));

  totalRef.current = filtered.length;

  const filters: (EventType | 'all')[] = ['all', 'work', 'education', 'project', 'milestone'];

  const countByType = (type: EventType | 'all') =>
    type === 'all' ? events.length : events.filter((e) => e.type === type).length;

  // Scroll-linked state: progress of the rail + which entries have been reached.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const list = listRef.current;
      if (!list) return;
      const line = window.innerHeight * 0.55; // reading line
      const rect = list.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (line - rect.top) / rect.height));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;

      let count = 0;
      for (let i = 0; i < totalRef.current; i++) {
        const el = itemRefs.current[i];
        if (el && el.getBoundingClientRect().top + 24 <= line) count++;
      }
      setReached((prev) => (prev === count ? prev : count));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [activeFilter, events]);

  const jumpTo = (i: number) => {
    const el = itemRefs.current[i];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  let flatIndex = -1;

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label={lang === 'fr' ? 'Filtrer la chronologie' : 'Filter timeline'}>
        {filters.map((f) => {
          const count = countByType(f);
          if (f !== 'all' && count === 0) return null;
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveFilter(f)}
              className={[
                'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors duration-150',
                isActive
                  ? 'border-border-strong bg-surface-alt font-medium text-foreground'
                  : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
              ].join(' ')}
            >
              {FILTER_LABELS[f][lang]}
              <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      <ol ref={listRef} className="relative flex flex-col gap-12">
        {/* Rail: hairline + primary fill driven by the scroll */}
        <div
          aria-hidden
          className="absolute bottom-0 top-0 left-[6px] w-px bg-border md:left-[calc(6.5rem+6px)]"
        >
          <div
            ref={fillRef}
            className="h-full origin-top bg-primary"
            style={{ transform: 'scaleY(0)' }}
          />
        </div>

        {sortedYears.map((year) => (
          <li key={year} className="grid gap-4 md:grid-cols-[5.5rem_1fr] md:gap-12">
            <h3 className="pl-8 font-mono text-sm text-muted-foreground md:sticky md:top-24 md:self-start md:pl-0 md:pt-5">
              {year}
            </h3>
            <ul className="flex flex-col gap-4 pl-8 md:pl-0">
              {yearGroups[year].map((event, idx) => {
                flatIndex += 1;
                const i = flatIndex;
                const passed = i < reached;
                const active = i === reached - 1;
                const typeLabel = labels[event.type as keyof typeof labels];
                return (
                  <li
                    key={idx}
                    ref={(el) => { itemRefs.current[i] = el; }}
                    aria-current={active ? 'true' : undefined}
                    className="relative"
                  >
                    {/* Node on the rail */}
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-label={`${event.title} — ${event.year}`}
                      tabIndex={-1}
                      className={[
                        'absolute -left-8 top-6 size-3.5 rounded-full border-2 transition-all duration-300',
                        passed ? 'border-primary bg-primary' : 'border-border-strong bg-background',
                        active ? 'ring-4 ring-primary/25' : '',
                      ].join(' ')}
                    />
                    <div
                      className={[
                        'card p-5 transition-all duration-300',
                        active
                          ? 'border-border-strong bg-surface-alt'
                          : passed
                            ? ''
                            : 'opacity-60',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                            <span>{event.year}</span>
                            <span aria-hidden>·</span>
                            <span>{typeLabel}</span>
                            {event.current && (
                              <span className="inline-flex items-center gap-1.5 text-foreground">
                                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                                {labels.current}
                              </span>
                            )}
                          </p>
                          <h4 className="t-h3">{event.title}</h4>
                          {(event.org || event.location) && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {[event.org, event.location].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                        {event.url && (
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${event.title} — ${lang === 'fr' ? 'ouvrir le lien' : 'open link'}`}
                            className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
                          >
                            <ArrowUpRight className="size-4" aria-hidden />
                          </a>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>

                      {event.tags && event.tags.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
                          {event.tags.map((tag) => (
                            <li key={tag} className="tag">{tag}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}

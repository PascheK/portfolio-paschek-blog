'use client';

import React, { useState } from 'react';
import { Briefcase, GraduationCap, Rocket, Star, ArrowUpRight } from 'lucide-react';

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

const TYPE_CONFIG: Record<EventType, {
  icon: React.ElementType;
  color: string;
  dotBg: string;
  badge: string;
  bar: string;
}> = {
  work: {
    icon:  Briefcase,
    color: 'text-sky-400',
    dotBg: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]',
    badge: 'text-sky-400 border-sky-500/30 bg-sky-500/[0.08]',
    bar:   'from-sky-500 to-sky-300',
  },
  education: {
    icon:  GraduationCap,
    color: 'text-violet-400',
    dotBg: 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]',
    badge: 'text-violet-400 border-violet-500/30 bg-violet-500/[0.08]',
    bar:   'from-violet-500 to-violet-300',
  },
  project: {
    icon:  Rocket,
    color: 'text-emerald-400',
    dotBg: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
    badge: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/[0.08]',
    bar:   'from-emerald-500 to-emerald-300',
  },
  milestone: {
    icon:  Star,
    color: 'text-amber-400',
    dotBg: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]',
    badge: 'text-amber-400 border-amber-500/30 bg-amber-500/[0.08]',
    bar:   'from-amber-500 to-amber-300',
  },
};

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

export function TimelineClient({ events, lang, labels }: Props) {
  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all');

  const filtered = activeFilter === 'all'
    ? events
    : events.filter((e) => e.type === activeFilter);

  // Group by year section
  const yearGroups = filtered.reduce<Record<string, TimelineEvent[]>>((acc, e) => {
    const y = String(e.startYear);
    if (!acc[y]) acc[y] = [];
    acc[y].push(e);
    return acc;
  }, {});
  const sortedYears = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));

  const filters: (EventType | 'all')[] = ['all', 'work', 'education', 'project', 'milestone'];

  const countByType = (type: EventType | 'all') =>
    type === 'all' ? events.length : events.filter((e) => e.type === type).length;

  return (
    <>
      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {filters.map((f) => {
          const label = FILTER_LABELS[f][lang];
          const count = countByType(f);
          const isActive = activeFilter === f;
          const cfg = f !== 'all' ? TYPE_CONFIG[f as EventType] : null;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                isActive
                  ? f === 'all'
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : `${cfg?.badge} border-opacity-60`
                  : 'text-muted-foreground border-border bg-surface-alt/30 hover:bg-surface-alt/60 hover:text-foreground'
              }`}
            >
              {f !== 'all' && cfg && <cfg.icon className="size-3" />}
              {label}
              <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                isActive ? 'bg-white/10' : 'bg-white/[0.04] text-muted-foreground/60'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Vertical gradient line */}
        <div className="absolute left-[18px] top-2 bottom-0 w-px bg-gradient-to-b from-primary/50 via-border/60 to-transparent pointer-events-none" />

        <div className="flex flex-col gap-0">
          {sortedYears.map((year) => (
            <React.Fragment key={year}>
              {/* Year separator */}
              <div className="relative flex items-center gap-3 pl-12 mb-3 mt-2 first:mt-0">
                <div className="absolute left-0 w-9 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-border bg-background z-10" />
                </div>
                <span className="text-[11px] font-mono font-bold text-muted-foreground/50 uppercase tracking-widest">
                  — {year} —
                </span>
              </div>

              {/* Events for this year */}
              {yearGroups[year].map((event, idx) => {
                const config = TYPE_CONFIG[event.type];
                const Icon = config.icon;
                const typeLabel = labels[event.type as keyof typeof labels];

                return (
                  <div
                    key={idx}
                    className="relative pl-12 pb-4 group"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-[10px] top-[14px] w-[17px] h-[17px] rounded-full border-2 border-background z-10 ${config.dotBg} flex items-center justify-center`}>
                      {event.current && (
                        <span className="absolute inset-[-3px] rounded-full animate-ping opacity-30 bg-current" />
                      )}
                    </div>

                    {/* Card */}
                    <div className={`rounded-2xl border border-border bg-surface-alt/40 backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-white/[0.12] group-hover:bg-surface-alt/70 group-hover:shadow-lg group-hover:shadow-black/20 group-hover:-translate-y-0.5`}>

                      {/* Top accent bar */}
                      <div className={`h-[2px] w-full bg-gradient-to-r ${config.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                      <div className="px-5 pt-4 pb-4">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            {/* Year + type badge */}
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className="text-[11px] font-mono text-primary/60 font-semibold">{event.year}</span>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${config.badge}`}>
                                <Icon className="size-2.5" />
                                {typeLabel}
                                {event.current && (
                                  <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                )}
                              </span>
                              {event.current && (
                                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                  {labels.current}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-bold text-foreground leading-snug">
                              {event.title}
                            </h3>

                            {/* Org · Location */}
                            {(event.org || event.location) && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {[event.org, event.location].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>

                          {/* External link */}
                          {event.url && (
                            <a href={event.url} target="_blank" rel="noopener noreferrer"
                              className="shrink-0 text-muted-foreground/30 hover:text-foreground transition-colors mt-1">
                              <ArrowUpRight className="size-4" />
                            </a>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {event.description}
                        </p>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {event.tags.map((tag) => (
                              <span key={tag}
                                className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border border-border/80 bg-surface/50 text-muted-foreground/70">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';

/**
 * Quiet "alive" signal: breathing dot, Swiss local time (ticks, no animation),
 * and what I'm working on right now. See /brand.md → Motion → Life.
 */
export function LiveStatus({
  lang,
  doing,
  place,
  timeZone = 'Europe/Zurich',
}: {
  lang: 'en' | 'fr';
  doing?: string;
  /** City shown before the time (default: the country, from the language). */
  place?: string;
  /** IANA time zone, e.g. "Asia/Tokyo". Set in the admin: now.status.timeZone. */
  timeZone?: string;
}) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CH' : 'en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [lang, timeZone]);

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
      <span className="inline-flex items-center gap-2 text-foreground">
        <span className="animate-breathe size-1.5 rounded-full bg-success" aria-hidden />
        {place ?? (lang === 'fr' ? 'Suisse' : 'Switzerland')}
        <span className="tabular-nums" suppressHydrationWarning>{time ?? '--:--'}</span>
      </span>
      {doing && (
        <>
          <span aria-hidden>·</span>
          <span>{lang === 'fr' ? 'En ce moment' : 'Currently'}: {doing}</span>
        </>
      )}
    </p>
  );
}

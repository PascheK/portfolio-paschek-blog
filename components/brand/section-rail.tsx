'use client';

import { useEffect, useState } from 'react';

/**
 * Hairline rail (≥1360px) listing the sections of the current page, the one
 * being read lit in primary. Scroll-driven only, no loop.
 *
 * - variant "page": numbered, uppercase mono (home).
 * - variant "article": heading text as written, truncated (blog / projects).
 */
export function SectionRail({
  items,
  label,
  variant = 'page',
}: {
  items: { id: string; label: string }[];
  label: string;
  variant?: 'page' | 'article';
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let current = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= line) current = it.id;
      }
      // At the very bottom the last section wins, even if it is short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = items[items.length - 1]?.id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  if (items.length < 2) return null;
  const article = variant === 'article';

  return (
    <nav
      aria-label={label}
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 min-[1360px]:block"
    >
      <ol className="flex flex-col items-end gap-3.5">
        {items.map((it, i) => {
          const on = active === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={on ? 'location' : undefined}
                className={[
                  'group flex items-center gap-3 rounded-sm font-mono text-[11px] tracking-[0.04em]',
                  article ? '' : 'uppercase tracking-[0.08em]',
                ].join(' ')}
              >
                <span
                  className={[
                    'truncate text-right transition-opacity duration-150',
                    article ? 'max-w-[13rem]' : '',
                    on
                      ? 'text-foreground opacity-100'
                      : 'text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                  ].join(' ')}
                >
                  {!article && `${String(i).padStart(2, '0')} `}
                  {it.label}
                </span>
                <span
                  aria-hidden
                  className={[
                    'h-px shrink-0 transition-all duration-150',
                    on ? 'w-8 bg-primary' : 'w-4 bg-border-strong group-hover:w-6',
                  ].join(' ')}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

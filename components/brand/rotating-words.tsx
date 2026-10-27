'use client';

import { useEffect, useState } from 'react';

/** Cross-fading word list. Width is held by the longest word; static under reduced motion. */
export function RotatingWords({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words, interval]);

  return (
    <>
      <span className="sr-only">{words.join(', ')}</span>
      <span aria-hidden className="inline-grid align-baseline">
        {words.map((w, idx) => (
          <span
            key={w}
            className={[
              'col-start-1 row-start-1 whitespace-nowrap text-primary transition-all duration-500 ease-out',
              idx === i ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0',
            ].join(' ')}
          >
            {w}
          </span>
        ))}
      </span>
    </>
  );
}

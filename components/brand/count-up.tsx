'use client';

import { useEffect, useRef, useState } from 'react';

/** "14" / "5+" / "999+" count up once when scrolled into view. Non-numeric values render as-is. */
export function CountUp({ value }: { value: string }) {
  const m = /^(\d+)(.*)$/.exec(value);
  const target = m ? Number(m[1]) : 0;
  const suffix = m ? m[2] : '';
  const [shown, setShown] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!m) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1100;
        setShown(0);
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!m) return <>{value}</>;
  return (
    <span ref={ref} className="tabular-nums">
      {shown}
      {suffix}
    </span>
  );
}

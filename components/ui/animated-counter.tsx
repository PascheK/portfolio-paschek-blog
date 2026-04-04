'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
  icon?: React.ReactNode;
}

export function AnimatedCounter({
  from = 0,
  to,
  suffix = '',
  prefix = '',
  duration = 1.5,
  label,
  icon,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        setDisplayValue(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [isInView, from, to, duration]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border bg-surface-alt/60 backdrop-blur shadow-sm"
    >
      {icon && (
        <span className="p-2 rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <span className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground">
        {prefix}{displayValue}{suffix}
      </span>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

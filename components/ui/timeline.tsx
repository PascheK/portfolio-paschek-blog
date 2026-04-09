'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Briefcase, Code2, Shield } from 'lucide-react';

type ExperienceType = 'work' | 'personal' | 'other';

interface TimelineItem {
  title: string;
  org: string;
  period: string;
  description?: string;
  type?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

const typeConfig: Record<ExperienceType, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  work: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20 border-blue-500/40',
    icon: Briefcase,
  },
  personal: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20 border-emerald-500/40',
    icon: Code2,
  },
  other: {
    color: 'text-violet-400',
    bg: 'bg-violet-500/20 border-violet-500/40',
    icon: Shield,
  },
};

function TimelineEntry({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const type = (item.type as ExperienceType) ?? 'work';
  const { color, bg, icon: Icon } = typeConfig[type] ?? typeConfig.work;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="relative pl-10"
    >
      {/* Dot */}
      <span
        className={`absolute left-0 top-1 w-7 h-7 rounded-full border ${bg} flex items-center justify-center shadow-sm`}
      >
        <Icon className={`size-3.5 ${color}`} />
      </span>

      {/* Card */}
      <div className="rounded-xl border border-border bg-surface-alt/50 backdrop-blur p-4 shadow-sm hover:border-primary/40 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
          <span className="font-semibold text-foreground leading-snug">
            {item.title}
            <span className="text-muted-foreground font-normal"> · {item.org}</span>
          </span>
          <span className={`text-xs font-medium shrink-0 ${color}`}>{item.period}</span>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        )}
      </div>
    </motion.div>
  );
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative flex flex-col gap-5">
      {/* Vertical line */}
      <div className="absolute left-[13px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />

      {items.map((item, index) => (
        <TimelineEntry key={index} item={item} index={index} />
      ))}
    </div>
  );
}

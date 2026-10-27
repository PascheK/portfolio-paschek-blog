"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveal on enter — the only scroll animation on the site.
 * opacity 0→1 + translateY(8px→0), 400ms, once. See /brand.md → Motion.
 */
const EASE = [0.22, 1, 0.36, 1] as const;
const OFFSET = 14;
const DURATION = 0.55;

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

export function Reveal({
  children,
  className,
  delay = 0,
}: BaseProps & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: OFFSET }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: DURATION, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its <RevealItem> children (40ms). */
export function RevealStagger({
  children,
  className,
  stagger = 0.04,
}: BaseProps & { stagger?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: Math.min(stagger, 0.04) } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: BaseProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: OFFSET },
        show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

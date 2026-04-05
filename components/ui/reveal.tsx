"use client";

import React from "react";
import { motion } from "framer-motion";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.55,
  y = 22,
  once = true,
  amount = 0.15,
  margin = "-8% 0px -8% 0px",
}: BaseProps & { delay?: number; duration?: number; y?: number; once?: boolean; amount?: number; margin?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount, margin }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  className,
  stagger = 0.06,
  once = true,
  amount = 0.2,
  margin = "-10% 0px -10% 0px",
}: BaseProps & { stagger?: number; once?: boolean; amount?: number; margin?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  duration = 0.45,
  y = 16,
}: BaseProps & { duration?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(3px)' }}
      variants={{
        show: {
          opacity: 1, y: 0, filter: 'blur(0px)',
          transition: { duration, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

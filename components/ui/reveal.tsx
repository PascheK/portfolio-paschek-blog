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
  duration = 0.45,
  y = 10,
  once = true,
  amount = 0.2,
  margin = "-10% 0px -10% 0px",
}: BaseProps & { delay?: number; duration?: number; y?: number; once?: boolean; amount?: number; margin?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin }}
      transition={{ duration, delay }}
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
  duration = 0.35,
  y = 8,
}: BaseProps & { duration?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      variants={{ show: { opacity: 1, y: 0, transition: { duration } } }}
    >
      {children}
    </motion.div>
  );
}

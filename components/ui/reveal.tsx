"use client";

import React from "react";
import { motion, useInView, type Variants, type TargetAndTransition } from "framer-motion";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

// ── Ease curves ────────────────────────────────────────────────────────────────
const EASE_OUT_QUART = [0.25, 0.46, 0.45, 0.94] as const;
const EASE_EXPO      = [0.16, 1, 0.3, 1] as const;
const EASE_BACK      = [0.34, 1.56, 0.64, 1] as const;   // overshoot spring feel

// ── 1. Reveal — classic fade + slide up (original, unchanged) ─────────────────
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
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin }}
      transition={{ duration, delay, ease: EASE_OUT_QUART }}
    >
      {children}
    </motion.div>
  );
}

// ── 2. RevealScale — zoom-in from slightly smaller (great for cards, hero) ─────
export function RevealScale({
  children,
  className,
  delay = 0,
  duration = 0.6,
  scale = 0.90,
  once = true,
  amount = 0.1,
}: BaseProps & { delay?: number; duration?: number; scale?: number; once?: boolean; amount?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_EXPO }}
    >
      {children}
    </motion.div>
  );
}

// ── 3. RevealX — horizontal slide (left or right) ─────────────────────────────
export function RevealX({
  children,
  className,
  delay = 0,
  duration = 0.55,
  x = 40,
  from = "left",
  once = true,
  amount = 0.15,
}: BaseProps & { delay?: number; duration?: number; x?: number; from?: "left" | "right"; once?: boolean; amount?: number }) {
  const startX = from === "left" ? -x : x;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: startX }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_EXPO }}
    >
      {children}
    </motion.div>
  );
}

// ── 4. RevealClip — clip-path wipe (very premium text reveal) ─────────────────
export function RevealClip({
  children,
  className,
  delay = 0,
  duration = 0.65,
  direction = "up",
  once = true,
  amount = 0.2,
}: BaseProps & { delay?: number; duration?: number; direction?: "up" | "down" | "left" | "right"; once?: boolean; amount?: number }) {
  const clips: Record<typeof direction, [string, string]> = {
    up:    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
    down:  ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"],
    left:  ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
    right: ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"],
  };
  return (
    <motion.div
      className={className}
      initial={{ clipPath: clips[direction][0], opacity: 0 }}
      whileInView={{ clipPath: clips[direction][1], opacity: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_EXPO }}
    >
      {children}
    </motion.div>
  );
}

// ── 5. RevealBounce — spring scale pop (icons, badges, CTAs) ──────────────────
export function RevealBounce({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.2,
}: BaseProps & { delay?: number; once?: boolean; amount?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ delay, type: "spring", stiffness: 420, damping: 22, mass: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

// ── 6. RevealRotate — subtle rotate + fade (decorative elements, cards) ────────
export function RevealRotate({
  children,
  className,
  delay = 0,
  duration = 0.6,
  rotate = 6,
  once = true,
  amount = 0.15,
}: BaseProps & { delay?: number; duration?: number; rotate?: number; once?: boolean; amount?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, rotate, y: 12 }}
      whileInView={{ opacity: 1, rotate: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_BACK }}
    >
      {children}
    </motion.div>
  );
}

// ── 7. RevealBlur — blur + fade reveal (images, backgrounds) ──────────────────
export function RevealBlur({
  children,
  className,
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.1,
}: BaseProps & { delay?: number; duration?: number; once?: boolean; amount?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_EXPO }}
    >
      {children}
    </motion.div>
  );
}

// ── 8. RevealStagger — container that staggers its children ───────────────────
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

// ── 9. RevealItem — child for RevealStagger (supports multiple modes) ─────────
export function RevealItem({
  children,
  className,
  duration = 0.45,
  y = 16,
  mode = "slide",
}: BaseProps & {
  duration?: number;
  y?: number;
  mode?: "slide" | "scale" | "fade" | "bounce";
}) {
  const variantMap: Record<typeof mode, Variants["show"]> = {
    slide:  { opacity: 1, y: 0,      scale: 1,    transition: { duration, ease: EASE_OUT_QUART } },
    scale:  { opacity: 1, y: 0,      scale: 1,    transition: { duration, ease: EASE_EXPO } },
    fade:   { opacity: 1,             transition: { duration, ease: EASE_OUT_QUART } },
    bounce: { opacity: 1, scale: 1,              transition: { type: "spring", stiffness: 420, damping: 22, mass: 0.6 } },
  };

  const hiddenMap: Record<typeof mode, TargetAndTransition> = {
    slide:  { opacity: 0, y },
    scale:  { opacity: 0, y: 8, scale: 0.92 },
    fade:   { opacity: 0 },
    bounce: { opacity: 0, scale: 0.6 },
  };

  return (
    <motion.div
      className={className}
      initial={hiddenMap[mode]}
      variants={{ show: variantMap[mode] }}
    >
      {children}
    </motion.div>
  );
}

// ── 10. MagneticHover — magnetic pull-toward-cursor effect ────────────────────
export function MagneticHover({
  children,
  className,
  strength = 0.35,
}: BaseProps & { strength?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
    >
      {children}
    </div>
  );
}

// ── 11. CountUp — animated number counter ─────────────────────────────────────
export function CountUp({
  to,
  duration = 1.8,
  delay = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    const start = Date.now() + delay * 1000;
    let raf: number;

    const tick = () => {
      const now = Date.now();
      if (now < start) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min((now - start) / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * to));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}

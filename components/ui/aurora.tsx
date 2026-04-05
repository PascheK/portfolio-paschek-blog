'use client';

import { motion, useScroll, useVelocity, useTransform, useSpring, type MotionValue } from 'framer-motion';

// ── Blob config ────────────────────────────────────────────────────────────────
// Each blob has an ambient float animation + a scroll-velocity displacement.
// velocityMul: how much the blob reacts to scroll. Negative = opposite direction.

const blobs = [
  {
    id: 0,
    color: 'rgba(99,102,241,0.55)',   // indigo – top-left, biggest
    size: '85vw',
    left: '-20%', top: '-15%',
    animX: ['0%', '7%', '-4%', '3%', '0%'],
    animY: ['0%', '5%', '-7%', '4%', '0%'],
    duration: 20, delay: 0,
    velocityMul: 1.0,
  },
  {
    id: 1,
    color: 'rgba(6,182,212,0.45)',    // cyan – top-right
    size: '65vw',
    left: '55%', top: '-10%',
    animX: ['0%', '-8%', '5%', '-2%', '0%'],
    animY: ['0%', '6%', '-4%', '5%', '0%'],
    duration: 26, delay: 4,
    velocityMul: -0.6,
  },
  {
    id: 2,
    color: 'rgba(236,72,153,0.35)',   // pink – bottom-center
    size: '60vw',
    left: '25%', top: '45%',
    animX: ['0%', '5%', '-8%', '2%', '0%'],
    animY: ['0%', '-5%', '8%', '-3%', '0%'],
    duration: 23, delay: 7,
    velocityMul: 0.8,
  },
  {
    id: 3,
    color: 'rgba(139,92,246,0.45)',   // violet – right
    size: '55vw',
    left: '68%', top: '40%',
    animX: ['0%', '-5%', '7%', '-3%', '0%'],
    animY: ['0%', '7%', '-5%', '4%', '0%'],
    duration: 29, delay: 10,
    velocityMul: -1.1,
  },
  {
    id: 4,
    color: 'rgba(16,185,129,0.30)',   // emerald – bottom-left
    size: '50vw',
    left: '-8%', top: '55%',
    animX: ['0%', '4%', '-6%', '2%', '0%'],
    animY: ['0%', '-8%', '5%', '-2%', '0%'],
    duration: 32, delay: 14,
    velocityMul: 0.5,
  },
] as const;

// ── Single blob component (hooks can't be called in a .map()) ──────────────────
function AuroraBlob({
  blob,
  baseY,
}: {
  blob: (typeof blobs)[number];
  baseY: MotionValue<number>;
}) {
  // Each blob reacts differently to scroll – some trail up, some drift opposite
  const blobY = useTransform(baseY, (v) => v * blob.velocityMul);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: blob.left,
        top: blob.top,
        width: blob.size,
        height: blob.size,
        y: blobY,
        willChange: 'transform',
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center, ${blob.color} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(72px)',
          willChange: 'transform',
        }}
        animate={{ x: blob.animX as unknown as string[], y: blob.animY as unknown as string[] }}
        transition={{
          duration: blob.duration,
          delay: blob.delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function AuroraBackground() {
  const { scrollY } = useScroll();
  const rawVelocity = useVelocity(scrollY);

  // Smooth out the velocity so sudden stops don't look jerky
  const smoothVelocity = useSpring(rawVelocity, {
    stiffness: 40,
    damping: 25,
    mass: 1,
  });

  // Base displacement: scroll down fast → negative Y (blobs trail upward)
  const baseY = useTransform(smoothVelocity, [-4000, 0, 4000], [55, 0, -55]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none
                 opacity-50 dark:opacity-80
                 transition-opacity duration-500"
    >
      {blobs.map((blob) => (
        <AuroraBlob key={blob.id} blob={blob} baseY={baseY} />
      ))}

      {/* Subtle grain texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.018] dark:opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
        }}
      />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ring follows with spring lag for trailing effect
  const springConfig = { damping: 28, stiffness: 300, mass: 0.5 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const clickable = target.closest('a, button, [role="button"], input, textarea, select, label');
      setIsPointer(!!clickable);
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  // Don't render on touch devices or before mount
  if (!mounted) return null;

  return (
    <>
      {/* Dot — follows exactly */}
      <motion.div
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isPointer ? 0.4 : 1,
        }}
        transition={{ duration: 0.12 }}
        className="fixed top-0 left-0 z-[99999] w-2 h-2 rounded-full bg-primary pointer-events-none"
      />

      {/* Ring — trailing spring */}
      <motion.div
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          opacity: isVisible ? 0.6 : 0,
          scale: isPointer ? 1.6 : 1,
          borderColor: isPointer ? 'var(--primary)' : 'var(--muted-foreground)',
        }}
        transition={{ duration: 0.18 }}
        className="fixed top-0 left-0 z-[99998] w-8 h-8 rounded-full border-2 border-muted-foreground pointer-events-none"
      />
    </>
  );
}

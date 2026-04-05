'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Wraps the app with Lenis smooth scroll.
 * – Duration 1.1s with expo-ease for that premium inertia feel
 * – Re-creates on route change so the scroll position resets correctly
 * – Dynamic import avoids SSR crash
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    let instance: any;

    const init = async () => {
      const { default: Lenis } = await import('lenis');

      instance = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.8,
        infinite: false,
      });

      lenisRef.current = instance;

      function raf(time: number) {
        instance.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      }
      rafRef.current = requestAnimationFrame(raf);
    };

    init();

    return () => {
      cancelAnimationFrame(rafRef.current);
      instance?.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);   // re-init on route change

  return <>{children}</>;
}

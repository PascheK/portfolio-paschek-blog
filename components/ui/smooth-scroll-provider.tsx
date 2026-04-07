'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Wraps the app with Lenis smooth scroll.
 *
 * Listens to two custom window events so other components can pause/resume:
 *   window.dispatchEvent(new Event('lenis:stop'))
 *   window.dispatchEvent(new Event('lenis:start'))
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

      // Custom events — lets any component pause/resume Lenis without prop drilling
      const stop  = () => instance?.stop();
      const start = () => instance?.start();
      window.addEventListener('lenis:stop',  stop);
      window.addEventListener('lenis:start', start);

      // Store cleanup on instance so the effect teardown can remove them
      (instance as any)._stopHandler  = stop;
      (instance as any)._startHandler = start;
    };

    init();

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (lenisRef.current) {
        window.removeEventListener('lenis:stop',  lenisRef.current._stopHandler);
        window.removeEventListener('lenis:start', lenisRef.current._startHandler);
      }
      instance?.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  return <>{children}</>;
}

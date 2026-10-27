'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="page-enter fixed bottom-5 right-5 z-30 inline-flex size-10 items-center justify-center rounded-lg border border-border-strong bg-surface text-muted-foreground transition-colors duration-150 hover:bg-surface-alt hover:text-foreground"
    >
      <ArrowUp className="size-4" aria-hidden />
    </button>
  );
}

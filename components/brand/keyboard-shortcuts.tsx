'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

/**
 * Keyboard layer: `g` then a letter navigates, `t` flips the theme, `?` lists
 * everything. Ignored while typing. Footer button fires `shortcuts:toggle`.
 */
export function KeyboardShortcuts({ lang }: { lang: 'en' | 'fr' }) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const pendingG = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isFr = lang === 'fr';

  const routes: Record<string, { href: string; label: string }> = {
    h: { href: `/${lang}`, label: isFr ? 'Accueil' : 'Home' },
    b: { href: `/${lang}/blog`, label: 'Blog' },
    p: { href: `/${lang}/projects`, label: isFr ? 'Projets' : 'Projects' },
    a: { href: `/${lang}/about`, label: isFr ? 'À propos' : 'About' },
    u: { href: `/${lang}/uses`, label: 'Uses' },
    c: { href: `/${lang}#contact`, label: 'Contact' },
  };

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener('shortcuts:toggle', toggle);

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === '?') { e.preventDefault(); setOpen((o) => !o); return; }

      const k = e.key.toLowerCase();
      if (pendingG.current) {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        const r = routes[k];
        if (r) { e.preventDefault(); setOpen(false); router.push(r.href); }
        return;
      }
      if (k === 'g') {
        pendingG.current = window.setTimeout(() => { pendingG.current = null; }, 1000);
      } else if (k === 't') {
        toggleTheme();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('shortcuts:toggle', toggle);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, router, toggleTheme]);

  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);

  if (!open) return null;

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="inline-flex min-w-6 items-center justify-center rounded-md border border-border-strong bg-surface-alt px-1.5 py-1 font-mono text-[11px] leading-none">
      {children}
    </kbd>
  );

  return (
    <div
      className="page-enter fixed inset-0 z-[20010] flex items-start justify-center px-4 pt-[14vh]"
      style={{ background: 'color-mix(in srgb, var(--background) 70%, transparent)' }}
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="w-full max-w-md rounded-xl border border-border-strong bg-popover p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="shortcuts-title" className="eyebrow">{isFr ? 'Raccourcis clavier' : 'Keyboard shortcuts'}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={isFr ? 'Fermer' : 'Close'}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <ul className="divide-y divide-border text-sm">
          <li className="flex items-center justify-between py-2.5">
            <span>{isFr ? 'Palette de commandes' : 'Command palette'}</span>
            <span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
          </li>
          {Object.entries(routes).map(([key, r]) => (
            <li key={key} className="flex items-center justify-between py-2.5">
              <span>{r.label}</span>
              <span className="flex items-center gap-1"><Kbd>G</Kbd><span className="text-xs text-muted-foreground">{isFr ? 'puis' : 'then'}</span><Kbd>{key.toUpperCase()}</Kbd></span>
            </li>
          ))}
          <li className="flex items-center justify-between py-2.5">
            <span>{isFr ? 'Changer de thème' : 'Toggle theme'}</span>
            <Kbd>T</Kbd>
          </li>
          <li className="flex items-center justify-between py-2.5">
            <span>{isFr ? 'Cette aide' : 'This help'}</span>
            <Kbd>?</Kbd>
          </li>
        </ul>
      </div>
    </div>
  );
}

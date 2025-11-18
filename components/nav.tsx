'use client'
import Link from "next/link";
import React from "react";
import { Menu, X } from "lucide-react";
import { LanguageSelect } from "@/components/languageSelect";
import { useTheme } from "@/components/ui/theme-provider";
import { Sun, Moon } from "lucide-react";
import { metaData } from "@/lib/config";
import { usePathname } from "next/navigation";



function TimezoneDisplay() {
  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
        " " + Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span className="text-sm text-neutral-500">{time}</span>;
}
function Navbar({ dict, lang }: { dict: any; lang: 'en' | 'fr' }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by deferring theme-driven UI until after mount.
  React.useEffect(() => setMounted(true), []);
  const navItems = {
    [`/${lang}/blog`]: { name: dict.nav.blog },
    [`/${lang}/projects`]: { name: dict.nav.projects },
    [`/${lang}/about`]: { name: dict.nav.about },
  };
  const [menuOpen, setMenuOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  // Close on Escape, lock scroll, and trap focus when menu is open
  React.useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!active || !panelRef.current.contains(active)) {
          first.focus();
          e.preventDefault();
          return;
        }
        if (!e.shiftKey && active === last) {
          first.focus();
          e.preventDefault();
        } else if (e.shiftKey && active === first) {
          last.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    // focus first element on open
    setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);
  return (
    <nav className="lg:mb-16 mb-12 sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/65 bg-background/80 text-foreground border-b border-border after:absolute after:inset-0 after:pointer-events-none after:bg-gradient-to-b after:from-foreground/5 after:to-transparent" role="navigation" aria-label={`primary navigation`}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Language select + Timezone */}
          <div className="flex flex-row gap-2 items-center w-auto">
            <LanguageSelect dict={dict} />
            <span className="hidden sm:inline-block"><TimezoneDisplay /></span>
          </div>
          {/* Center: Title */}
          <div className="flex-1 flex justify-center order-first sm:order-none mb-2 sm:mb-0">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-fuchsia-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md select-none">
              <Link href={`/${lang}`}>
                {metaData.name}
              </Link>
            </span>
          </div>
          {/* Right: Nav links + Theme + Burger */}
          <div className="flex flex-row gap-2 items-center w-auto">
            <div className="hidden md:flex gap-1.5 lg:gap-2">
              {Object.entries(navItems).map(([path, { name }]) => {
                const active = pathname?.startsWith(path);
                return (
                  <Link
                    key={path}
                    href={path}
                    className={[
                      "group px-3 py-1.5 rounded font-medium transition-all duration-150",
                      "text-muted-foreground hover:text-foreground",
                      active
                        ? "bg-surface-alt border border-border"
                        : "hover:bg-surface-alt/70 border border-transparent",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="relative inline-flex flex-col items-stretch">
                      <span>{name}</span>
                      <span
                        className={[
                          "mt-0.5 h-[2px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
                          "transition-all duration-200",
                          active ? "w-full" : "w-0 group-hover:w-full",
                        ].join(" ")}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={'theme'}
              className="p-2 rounded border border-border bg-surface-alt/60 hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {mounted ? (theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />) : <span className="size-5 inline-block" aria-hidden />}
            </button>
            {/* Burger menu for mobile */}
            <button
              className="md:hidden p-2 rounded hover:bg-surface-alt/70 border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? (dict.a11y?.closeMenu ?? 'Close menu') : (dict.a11y?.openMenu ?? 'Open menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Accent underline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500/90 opacity-70" />

      {/* Mobile menu with overlay */}
      {menuOpen && (
        <div className="md:hidden relative">
          {/* overlay */}
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-[2px] cursor-default"
            aria-hidden="true"
            role="presentation"
            onClick={() => setMenuOpen(false)}
          />
          {/* panel */}
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            className="absolute left-0 right-0 top-0 px-3 sm:px-4 pt-2 pb-4 animate-in fade-in-0 zoom-in-95"
            ref={panelRef}
          >
            <div className="mx-2 rounded-xl border border-border bg-surface-alt/90 backdrop-blur shadow-lg">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">{metaData.name}</span>
                <button
                  className="p-2 rounded hover:bg-surface-alt border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setMenuOpen(false)}
                  aria-label={dict.a11y?.closeMenu ?? 'Close menu'}
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="px-2 pb-3">
                <div className="flex flex-col gap-2">
                  {Object.entries(navItems).map(([path, { name }]) => (
                    <Link
                      key={path}
                      href={path}
                      className="px-3 py-2 rounded-lg border border-border bg-surface-alt/30 hover:bg-surface-alt transition-colors font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onClick={() => setMenuOpen(false)}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500/90 opacity-70" />
            </div>
          </div>
        </div>
      )}

    </nav>
  );
}
export { Navbar };

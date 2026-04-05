'use client';

import Link from "next/link";
import React from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { LanguageSelect } from "@/components/languageSelect";
import { useTheme } from "@/components/ui/theme-provider";
import { metaData } from "@/lib/config";
import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/ui/command-palette";
import { motion, AnimatePresence } from "framer-motion";

// ── Timezone clock ────────────────────────────────────────────────────────────
function TimezoneDisplay() {
  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground/70 font-mono tabular-nums">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      {time}
    </span>
  );
}

// ── Scroll progress ───────────────────────────────────────────────────────────
function ScrollProgress() {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div
      aria-hidden
      className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-none"
      style={{ width: `${progress}%` }}
    />
  );
}

// ── Navbar props ──────────────────────────────────────────────────────────────
interface NavbarProps {
  dict: any;
  lang: 'en' | 'fr';
  paletteNavItems?: any[];
  paletteContentItems?: any[];
  paletteLabels?: any;
  cvHref?: string;
  contactHref?: string;
}

function Navbar({
  dict,
  lang,
  paletteNavItems,
  paletteContentItems,
  paletteLabels,
  cvHref,
  contactHref,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: `/${lang}/blog`,     label: dict.nav.blog },
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/about`,    label: dict.nav.about },
  ];

  // Mobile menu: trap focus + lock scroll
  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!active || !panelRef.current.contains(active)) { first.focus(); e.preventDefault(); return; }
        if (!e.shiftKey && active === last) { first.focus(); e.preventDefault(); }
        else if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-background/75 border-b border-border/60 shadow-sm shadow-black/5"
          : "backdrop-blur bg-background/40 border-b border-transparent",
      ].join(" ")}
      role="banner"
    >
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6"
        role="navigation"
        aria-label="Primary navigation"
      >
        <div className="h-14 sm:h-16 flex items-center justify-between gap-4">

          {/* ── LEFT: Logo + timezone ──────────────────────────── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/${lang}`}
              className="group flex items-center gap-2"
              aria-label={`${metaData.name} — home`}
            >
              {/* Monogram badge */}
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-fuchsia-500 to-pink-500 text-white text-sm font-extrabold shadow-md shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                {metaData.name.charAt(0)}
              </span>
              <span className="hidden sm:block font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                {metaData.name}
              </span>
            </Link>
            <TimezoneDisplay />
          </div>

          {/* ── CENTER: Nav links pill ──────────────────────────── */}
          <div className="hidden md:flex items-center">
            <div className={[
              "flex items-center gap-0.5 px-1.5 py-1.5 rounded-xl border transition-all duration-300",
              scrolled
                ? "border-border/70 bg-surface-alt/80 backdrop-blur"
                : "border-border/40 bg-surface-alt/40 backdrop-blur",
            ].join(" ")}>
              {navLinks.map(({ href, label }) => {
                const active = pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className="relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-lg bg-surface border border-border/80 shadow-sm"
                        transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.7 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Palette + Language + Theme + Burger ─────── */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Command palette trigger */}
            {paletteNavItems && paletteLabels && (
              <CommandPalette
                navItems={paletteNavItems}
                contentItems={paletteContentItems ?? []}
                labels={paletteLabels}
                cvHref={cvHref ?? ""}
                contactHref={contactHref ?? ""}
                inlineTrigger
                triggerClassName="hidden md:inline-flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border/70 bg-surface-alt/60 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-surface-alt transition-all"
              />
            )}

            {/* Language */}
            <div className="h-8 flex items-center">
              <LanguageSelect dict={dict} />
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-surface-alt/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-surface-alt transition-all"
            >
              {mounted
                ? (theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />)
                : <span className="size-3.5" />}
            </button>

            {/* Burger (mobile only) */}
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-border/70 bg-surface-alt/60 text-muted-foreground hover:text-foreground transition-all"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? (dict.a11y?.closeMenu ?? "Close menu") : (dict.a11y?.openMenu ?? "Open menu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 top-14 z-30 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            {/* Panel */}
            <motion.div
              key="panel"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              ref={panelRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute left-0 right-0 z-40 px-4 pt-2 pb-4 md:hidden"
            >
              <div className="rounded-2xl border border-border bg-surface-alt/95 backdrop-blur-xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                  <span className="text-sm font-semibold">{metaData.name}</span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={dict.a11y?.closeMenu ?? "Close menu"}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* Links */}
                <nav className="px-3 py-3 flex flex-col gap-1">
                  {navLinks.map(({ href, label }, i) => {
                    const active = pathname?.startsWith(href);
                    return (
                      <motion.div
                        key={href}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.18 }}
                      >
                        <Link
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className={[
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            active
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-surface/80 border border-transparent",
                          ].join(" ")}
                        >
                          {label}
                          {active && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Footer: timezone + theme */}
                <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between">
                  <TimezoneDisplay />
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mounted
                      ? (theme === "dark"
                          ? <><Sun className="size-3.5" /> Light mode</>
                          : <><Moon className="size-3.5" /> Dark mode</>)
                      : null}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export { Navbar };

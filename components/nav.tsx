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

// ── Timezone clock ─────────────────────────────────────────────────────────────
function TimezoneDisplay() {
  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground/50 font-mono tabular-nums select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse shrink-0" />
      {time}
    </span>
  );
}

// ── Scroll progress bar ────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = React.useState(0);
  React.useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div
      aria-hidden
      className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-none pointer-events-none"
      style={{ width: `${pct}%` }}
    />
  );
}

// ── Vertical divider ───────────────────────────────────────────────────────────
function Divider() {
  return <span className="w-px h-4 bg-border/50 shrink-0" aria-hidden />;
}

// ── Navbar props ───────────────────────────────────────────────────────────────
interface NavbarProps {
  dict: any;
  lang: "en" | "fr";
  paletteNavItems?: any[];
  paletteContentItems?: any[];
  paletteLabels?: any;
  cvHref?: string;
  contactHref?: string;
}

function Navbar({ dict, lang, paletteNavItems, paletteContentItems, paletteLabels, cvHref, contactHref }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { href: `/${lang}/blog`,     label: dict.nav.blog },
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/about`,    label: dict.nav.about },
  ];

  // Mobile: lock scroll + trap focus
  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); return; }
      if (e.key === "Tab" && panelRef.current) {
        const els = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
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
        "sticky top-0 z-40 w-full transition-[background,border-color,box-shadow] duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm shadow-black/5"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center gap-4">

          {/* ── LEFT ── Logo + clock ──────────────────────────────── */}
          <div className="flex items-center gap-3 shrink-0 mr-auto">
            <Link
              href={`/${lang}`}
              className="group flex items-center gap-2.5"
              aria-label={`${metaData.name} — home`}
            >
              {/* Gradient monogram */}
              <span className="relative flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden text-white text-xs font-black select-none">
                <span className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
                <span className="relative">{metaData.name.charAt(0)}</span>
              </span>
              {/* Name — hidden on very small screens */}
              <span className="hidden sm:block text-sm font-semibold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors duration-150">
                {metaData.name}
              </span>
            </Link>
            <TimezoneDisplay />
          </div>

          {/* ── CENTER ── Nav links (desktop) ────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-0.5"
            aria-label="Primary navigation"
          >
            {navLinks.map(({ href, label }) => {
              const active = pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative px-3 py-1.5 rounded-lg text-sm transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80",
                  ].join(" ")}
                >
                  {/* Animated background */}
                  {active && (
                    <motion.span
                      layoutId="navbar-active"
                      className="absolute inset-0 rounded-lg bg-surface-alt border border-border/60"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── RIGHT ── Actions ──────────────────────────────────── */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">

            {/* Command palette */}
            {paletteNavItems && paletteLabels && (
              <>
                <CommandPalette
                  navItems={paletteNavItems}
                  contentItems={paletteContentItems ?? []}
                  labels={paletteLabels}
                  cvHref={cvHref ?? ""}
                  contactHref={contactHref ?? ""}
                  inlineTrigger
                  triggerClassName="hidden md:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs text-muted-foreground/70 border border-border/40 bg-surface-alt/30 hover:bg-surface-alt/60 hover:text-muted-foreground hover:border-border/60 transition-all duration-150"
                />
                <Divider />
              </>
            )}

            {/* Language select */}
            <LanguageSelect dict={dict} />

            <Divider />

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-surface-alt/60 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {mounted
                ? (theme === "dark"
                    ? <Sun className="size-3.5" />
                    : <Moon className="size-3.5" />)
                : <span className="size-3.5" />}
            </button>

            {/* Burger (mobile) */}
            <button
              className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-surface-alt/60 transition-all duration-150"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "x" : "menu"}
                  initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                  transition={{ duration: 0.12 }}
                >
                  {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll progress */}
      <ScrollProgress />

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 top-14 z-30 bg-background/50 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            <motion.div
              key="panel"
              ref={panelRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-x-3 top-[calc(100%+6px)] z-40 md:hidden rounded-2xl border border-border/60 bg-surface/95 backdrop-blur-xl shadow-xl overflow-hidden"
            >
              {/* Nav links */}
              <div className="p-2 flex flex-col gap-0.5">
                {navLinks.map(({ href, label }, i) => {
                  const active = pathname?.startsWith(href);
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.15 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className={[
                          "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/8 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-alt/60",
                        ].join(" ")}
                      >
                        {label}
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom bar */}
              <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 font-mono tabular-nums">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
                  {mounted && new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mounted && (theme === "dark"
                    ? <><Sun className="size-3" /> Light</>
                    : <><Moon className="size-3" /> Dark</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export { Navbar };

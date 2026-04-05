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

// ── Scroll progress ────────────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = React.useState(0);
  React.useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.div
      aria-hidden
      className="absolute bottom-0 left-0 h-[1px] origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 pointer-events-none"
      style={{ width: `${pct}%` }}
    />
  );
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
    const fn = () => setScrolled(window.scrollY > 16);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { href: `/${lang}/blog`,     label: dict.nav.blog },
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/about`,    label: dict.nav.about },
  ];

  // Mobile: lock scroll + focus trap
  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis:stop"));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); return; }
      if (e.key === "Tab" && panelRef.current) {
        const els = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!els.length) return;
        const [first, last] = [els[0], els[els.length - 1]];
        const active = document.activeElement as HTMLElement | null;
        if (!active || !panelRef.current.contains(active)) { first.focus(); e.preventDefault(); return; }
        if (!e.shiftKey && active === last)  { first.focus(); e.preventDefault(); }
        else if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.dispatchEvent(new Event("lenis:start"));
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* ── Glass bar ──────────────────────────────────────────── */}
      <div
        className={[
          "transition-all duration-500",
          scrolled
            ? "bg-background/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.18)]"
            : "bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center gap-3">

            {/* ── Logo ──────────────────────────────────────────── */}
            <Link
              href={`/${lang}`}
              className="group flex items-center gap-2.5 shrink-0 mr-auto"
              aria-label={`${metaData.name} — home`}
            >
              {/* Gradient square */}
              <span className="relative flex items-center justify-center w-[26px] h-[26px] rounded-[7px] text-[11px] font-black text-white select-none overflow-hidden shrink-0">
                <span className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" />
                <span className="relative tracking-tighter">{metaData.name.slice(0, 2).toUpperCase()}</span>
              </span>
              <span className="hidden sm:block text-[13px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors duration-200 tracking-tight">
                {metaData.name}
              </span>
            </Link>

            {/* ── Nav links (desktop) ───────────────────────────── */}
            <nav className="hidden md:flex items-center" aria-label="Primary">
              {navLinks.map(({ href, label }) => {
                const active = !!pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "relative px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      active ? "text-foreground" : "text-foreground/50 hover:text-foreground/80",
                    ].join(" ")}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-white/[0.07] dark:bg-white/[0.06] ring-1 ring-white/[0.09]"
                        transition={{ type: "spring", stiffness: 450, damping: 38 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ── Right actions ─────────────────────────────────── */}
            <div className="flex items-center gap-1 ml-auto md:ml-2 shrink-0">

              {/* ⌘K palette */}
              {paletteNavItems && paletteLabels && (
                <CommandPalette
                  navItems={paletteNavItems}
                  contentItems={paletteContentItems ?? []}
                  labels={paletteLabels}
                  cvHref={cvHref ?? ""}
                  contactHref={contactHref ?? ""}
                  inlineTrigger
                  triggerClassName="hidden md:inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-lg text-[11px] font-medium text-foreground/40 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:text-foreground/70 hover:border-white/[0.12] transition-all duration-150 mr-1"
                />
              )}

              {/* Separator */}
              <span className="hidden md:block w-px h-3.5 bg-white/[0.10] mx-1 shrink-0" />

              {/* Language */}
              <LanguageSelect dict={dict} />

              {/* Separator */}
              <span className="w-px h-3.5 bg-white/[0.10] mx-1 shrink-0" />

              {/* Theme */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex items-center justify-center w-[30px] h-[30px] rounded-lg text-foreground/40 hover:text-foreground/80 hover:bg-white/[0.06] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {mounted
                  ? (theme === "dark" ? <Sun className="size-[13px]" /> : <Moon className="size-[13px]" />)
                  : <span className="size-[13px]" />}
              </button>

              {/* Burger */}
              <button
                className="md:hidden flex items-center justify-center w-[30px] h-[30px] rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/[0.06] transition-all duration-150"
                onClick={() => setMenuOpen(v => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={menuOpen ? "x" : "m"}
                    initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                    transition={{ duration: 0.1 }}
                  >
                    {menuOpen ? <X className="size-[14px]" /> : <Menu className="size-[14px]" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
        <ScrollProgress />
      </div>

      {/* ── Mobile dropdown ─────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 top-14 z-30 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            {/* Panel */}
            <motion.div
              key="panel"
              ref={panelRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-x-3 top-[calc(100%+4px)] z-40 md:hidden overflow-hidden rounded-2xl border border-white/[0.09] bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/30"
            >
              {/* Links */}
              <div className="p-1.5 flex flex-col">
                {navLinks.map(({ href, label }, i) => {
                  const active = !!pathname?.startsWith(href);
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.14 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className={[
                          "flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-medium transition-colors duration-150",
                          active
                            ? "text-foreground bg-white/[0.07]"
                            : "text-foreground/50 hover:text-foreground/80 hover:bg-white/[0.04]",
                        ].join(" ")}
                      >
                        {label}
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom strip */}
              <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] font-mono text-foreground/25 tabular-nums">
                  {mounted && new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 text-[11px] text-foreground/35 hover:text-foreground/60 transition-colors"
                >
                  {mounted && (theme === "dark"
                    ? <><Sun className="size-3" /> Light</>
                    : <><Moon className="size-3" /> Dark</>)}
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

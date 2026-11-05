'use client';

import Link from "next/link";
import React from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { LanguageSelect } from "@/components/languageSelect";
import { useTheme } from "@/components/ui/theme-provider";
import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/ui/command-palette";
import { Logo } from "@/components/brand/logo";

interface NavbarProps {
  dict: any;
  lang: "en" | "fr";
  paletteNavItems?: any[];
  paletteContentItems?: any[];
  paletteLabels?: any;
  cvHref?: string;
  contactHref?: string;
  hasVideos?: boolean;
}

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:text-foreground hover:bg-surface-muted";

function Navbar({ dict, lang, paletteNavItems, paletteContentItems, paletteLabels, cvHref, contactHref, hasVideos }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  // Close the mobile menu on navigation
  React.useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navLinks = [
    { href: `/${lang}/blog`,     label: dict.nav.blog },
    { href: `/${lang}/projects`, label: dict.nav.projects },
    ...(hasVideos ? [{ href: `/${lang}/videos`, label: dict.nav.videos ?? (lang === "fr" ? "Vidéos" : "Videos") }] : []),
    { href: `/${lang}/about`,    label: dict.nav.about },
    { href: `/${lang}/uses`,     label: dict.nav.uses ?? "Uses" },
  ];

  // Mobile menu: Escape closes, body scroll locked while open
  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Before mount the theme is unknown to React (the inline script already set it), so keep the label neutral to avoid a hydration mismatch.
  const themeLabel = !mounted
    ? (lang === "fr" ? "Changer de thème" : "Toggle theme")
    : theme === "dark"
      ? (lang === "fr" ? "Passer en mode clair" : "Switch to light theme")
      : (lang === "fr" ? "Passer en mode sombre" : "Switch to dark theme");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container-page">
        <div className="flex h-16 items-center gap-6">
          <Logo href={`/${lang}`} label={`PascheK — ${lang === "fr" ? "accueil" : "home"}`} className="mr-auto md:mr-0" />

          {/* Primary navigation (desktop) */}
          <nav className="hidden md:flex items-center gap-1 mr-auto" aria-label={lang === "fr" ? "Navigation principale" : "Primary"}>
            {navLinks.map(({ href, label }) => {
              const active = !!pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors duration-150",
                    active
                      ? "font-medium text-foreground after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-primary"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {paletteNavItems && paletteLabels && (
              <CommandPalette
                navItems={paletteNavItems}
                contentItems={paletteContentItems ?? []}
                labels={paletteLabels}
                cvHref={cvHref ?? ""}
                contactHref={contactHref ?? ""}
                inlineTrigger
                triggerClassName="hidden xl:inline-flex items-center gap-2 h-9 px-3 mr-1 rounded-lg border border-border text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:border-border-strong"
              />
            )}

            <LanguageSelect dict={dict} />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              className={iconButton}
            >
              {mounted
                ? (theme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />)
                : <span className="size-4" />}
            </button>

            <button
              type="button"
              className={`${iconButton} md:hidden`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? (lang === "fr" ? "Fermer le menu" : "Close menu") : (lang === "fr" ? "Ouvrir le menu" : "Open menu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label={lang === "fr" ? "Navigation mobile" : "Mobile"}
          className="page-enter md:hidden absolute inset-x-0 top-full border-b border-border bg-background"
        >
          <ul className="container-page py-2">
            {navLinks.map(({ href, label }) => {
              const active = !!pathname?.startsWith(href);
              return (
                <li key={href} className="border-b border-border last:border-b-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex h-12 items-center justify-between text-base",
                      active ? "font-medium text-foreground" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {label}
                    {active && <span className="size-1.5 rounded-full bg-primary" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

export { Navbar };

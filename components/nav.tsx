'use client'
import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";
import { metaData } from "@/lib/config";
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Menu, Globe } from "lucide-react";
import { t, Lang } from "@/lib/i18n";

const navItems = {
  "/blog": { nameKey: "nav.blog" },
  "/projects": { nameKey: "nav.projects" },
  "/photos": { nameKey: "nav.photos" },
};

type LanguageSelectProps = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};
function LanguageSelect({ lang, setLang }: LanguageSelectProps) {
  return (
    <Select value={lang} onValueChange={v => setLang(v as Lang)}>
      <SelectTrigger size="sm" className="w-24">
        <Globe className="mr-2 size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr">FR</SelectItem>
        <SelectItem value="en">EN</SelectItem>
      </SelectContent>
    </Select>
  );
}
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
function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [lang, setLang] = React.useState<Lang>("fr");
  return (
    <nav className="lg:mb-16 mb-12 py-4 px-2 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur sticky top-0 z-30 shadow-sm w-full">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Language select + Timezone */}
        <div className="flex flex-row gap-2 items-center w-auto">
          <LanguageSelect lang={lang} setLang={setLang} />
          <span className="hidden sm:inline-block"><TimezoneDisplay /></span>
        </div>
        {/* Center: Title */}
        <div className="flex-1 flex justify-center order-first sm:order-none mb-2 sm:mb-0">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow">{t('nav.title', lang)}</span>
        </div>
        {/* Right: Nav links + Theme + Burger */}
        <div className="flex flex-row gap-2 items-center w-auto">
          <div className="hidden md:flex gap-2">
            {Object.entries(navItems).map(([path, { nameKey }]) => (
              <Link
                key={path}
                href={path}
                className="transition-all px-3 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-blue-600 dark:hover:text-pink-400 font-medium"
              >
                {t(nameKey, lang)}
              </Link>
            ))}
          </div>
          <ThemeSwitch />
          {/* Burger menu for mobile */}
          <button className="md:hidden p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setMenuOpen(v => !v)} aria-label="Ouvrir le menu">
            <Menu className="size-6" />
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 px-2 pb-2 animate-in fade-in-0 zoom-in-95">
          <div className="flex flex-col gap-2 bg-white/90 dark:bg-neutral-900/90 rounded shadow p-4">
            {Object.entries(navItems).map(([path, { nameKey }]) => (
              <Link
                key={path}
                href={path}
                className="transition-all px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-blue-600 dark:hover:text-pink-400 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {t(nameKey, lang)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
export { Navbar };

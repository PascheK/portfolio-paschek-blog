'use client'
import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";
import { metaData } from "@/lib/config";
import React from "react";

const navItems = {
  "/blog": { name: "Blog" },
  "/projects": { name: "Projects" },
  "/photos": { name: "Photos" },
};

function LanguageToggler() {
  // Simple toggler, no i18n logic for now
  const [lang, setLang] = React.useState("fr");
  return (
    <div className="flex gap-2 items-center">
      <button
        className={`px-2 py-1 rounded ${lang === "fr" ? "bg-neutral-200 dark:bg-neutral-700" : ""}`}
        onClick={() => setLang("fr")}
      >
        FR
      </button>
      <button
        className={`px-2 py-1 rounded ${lang === "en" ? "bg-neutral-200 dark:bg-neutral-700" : ""}`}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
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

export function Navbar() {
  return (
    <nav className="lg:mb-16 mb-12 py-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        {/* Left: Language toggler + Timezone */}
        <div className="flex flex-row gap-4 items-center md:w-1/4">
          <LanguageToggler />
          <TimezoneDisplay />
        </div>
        {/* Center: Title */}
        <div className="flex-1 flex justify-center md:justify-center order-first md:order-none mb-4 md:mb-0">
          <span className="text-3xl font-semibold">Pasche Killian</span>
        </div>
        {/* Right: Navigation menu + Theme switch */}
        <div className="flex flex-row gap-4 items-center md:w-1/4 justify-end">
          {Object.entries(navItems).map(([path, { name }]) => (
            <Link
              key={path}
              href={path}
              className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative"
            >
              {name}
            </Link>
          ))}
          <ThemeSwitch />
        </div>
      </div>
    </nav>
  );
}

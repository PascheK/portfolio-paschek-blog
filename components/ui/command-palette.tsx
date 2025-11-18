'use client';

import React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTheme } from "./theme-provider";
import { Command, Moon, Sun, Mail, Download, Home, BookOpen, Layers } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type BaseItem = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  keywords?: string[];
  group: "nav" | "content" | "action";
};

type CommandPaletteProps = {
  navItems: Array<{ id: string; title: string; href: string; subtitle?: string }>;
  contentItems: Array<{ id: string; title: string; href: string; subtitle?: string; keywords?: string[] }>;
  labels: {
    placeholder: string;
    noResults: string;
    nav: string;
    content: string;
    actions: string;
    toggleTheme: string;
    downloadCV: string;
    contact: string;
    open: string;
  };
  cvHref: string;
  contactHref: string;
};

export function CommandPalette({
  navItems,
  contentItems,
  labels,
  cvHref,
  contactHref,
  inlineTrigger = false,
  triggerClassName = "",
}: CommandPaletteProps & { inlineTrigger?: boolean; triggerClassName?: string }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Build actions that depend on hooks
  const actionItems = React.useMemo<BaseItem[]>(() => [
    {
      id: "action-theme",
      title: labels.toggleTheme,
      subtitle: theme === "dark" ? "Light" : "Dark",
      group: "action",
      keywords: ["theme", "dark", "light"],
    },
    {
      id: "action-cv",
      title: labels.downloadCV,
      href: cvHref,
      group: "action",
      keywords: ["cv", "resume", "pdf"],
    },
    {
      id: "action-contact",
      title: labels.contact,
      href: contactHref,
      group: "action",
      keywords: ["email", "contact"],
    },
  ], [labels.contact, labels.downloadCV, labels.toggleTheme, theme, cvHref, contactHref]);

  const items = React.useMemo<BaseItem[]>(() => {
    const nav: BaseItem[] = navItems.map((n) => ({ ...n, group: "nav" }));
    const content: BaseItem[] = contentItems.map((c) => ({ ...c, group: "content" }));
    return [...nav, ...content, ...actionItems];
  }, [navItems, contentItems, actionItems]);

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const haystack = [
        item.title,
        item.subtitle || "",
        ...(item.keywords || []),
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [items, query]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      // do nothing
    }
  }, [open]);

  const handleSelect = (item: BaseItem) => {
    if (item.id === "action-theme") {
      toggleTheme();
      setOpen(false);
      return;
    }
    if (item.href) {
      if (item.href.startsWith("http") || item.href.startsWith("mailto:") || item.href.startsWith("tel:") || item.href.endsWith(".pdf")) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
      setOpen(false);
    }
  };

  if (typeof document === "undefined" || !mounted) return null;

  const triggerClasses = [
    "hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/40 bg-surface text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors",
    inlineTrigger ? "" : "fixed right-4 top-4 z-[20000]",
    triggerClassName,
  ].join(" ").trim();

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[20010] flex items-start justify-center bg-background/70 backdrop-blur-sm px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-lg"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.8 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Command className="size-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={labels.placeholder}
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                aria-label={labels.placeholder}
              />
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Esc
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                  {labels.noResults}
                </div>
              )}
              {filtered.length > 0 && (
                <motion.div layout className="space-y-2">
                  {filtered.map((item) => {
                    const icon =
                      item.group === "nav" ? <Home className="size-4 text-muted-foreground" /> :
                        item.group === "content" && item.id.startsWith("blog-") ? <BookOpen className="size-4 text-muted-foreground" /> :
                          item.group === "content" ? <Layers className="size-4 text-muted-foreground" /> :
                            item.id === "action-theme" ? (theme === "dark" ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />) :
                              item.id === "action-cv" ? <Download className="size-4 text-muted-foreground" /> :
                                item.id === "action-contact" ? <Mail className="size-4 text-muted-foreground" /> : null;

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors border border-transparent hover:border-border flex items-start gap-3"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 250, damping: 18 }}
                      >
                        <span className="mt-0.5">{icon}</span>
                        <span className="flex-1">
                          <span className="block text-sm text-foreground">{item.title}</span>
                          {item.subtitle && (
                            <span className="block text-xs text-muted-foreground">{item.subtitle}</span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClasses}
        aria-label={labels.open}
      >
        <Command className="size-4" />
        <span className="text-sm">{labels.open}</span>
        <span className="text-xs text-primary border border-primary/50 rounded px-1 bg-surface-alt/70">⌘K</span>
      </button>
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}

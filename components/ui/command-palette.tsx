'use client';

import React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTheme } from "./theme-provider";
import { Command, Moon, Sun, Mail, Download, Home, BookOpen, Layers, ArrowRight } from "lucide-react";
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
  inlineTrigger?: boolean;
  triggerClassName?: string;
};

// Group label component
function GroupLabel({ label }: { label: string }) {
  return (
    <p className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
      {label}
    </p>
  );
}

export function CommandPalette({
  navItems,
  contentItems,
  labels,
  cvHref,
  contactHref,
  inlineTrigger = false,
  triggerClassName,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const actionItems = React.useMemo<BaseItem[]>(() => [
    { id: "action-theme", title: labels.toggleTheme, subtitle: theme === "dark" ? "Switch to light" : "Switch to dark", group: "action", keywords: ["theme", "dark", "light"] },
    { id: "action-cv", title: labels.downloadCV, href: cvHref, group: "action", keywords: ["cv", "resume", "pdf"] },
    { id: "action-contact", title: labels.contact, href: contactHref, group: "action", keywords: ["email", "contact"] },
  ], [labels.contact, labels.downloadCV, labels.toggleTheme, theme, cvHref, contactHref]);

  const allItems = React.useMemo<BaseItem[]>(() => {
    const nav: BaseItem[] = navItems.map(n => ({ ...n, group: "nav" }));
    const content: BaseItem[] = contentItems.map(c => ({ ...c, group: "content" }));
    return [...nav, ...content, ...actionItems];
  }, [navItems, contentItems, actionItems]);

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return allItems;
    return allItems.filter(item =>
      [item.title, item.subtitle ?? "", ...(item.keywords ?? [])].join(" ").toLowerCase().includes(term)
    );
  }, [allItems, query]);

  // Reset active index when filter changes
  React.useEffect(() => { setActiveIdx(0); }, [query]);

  // Global keyboard shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(v => !v); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock page scroll while keeping the palette list scrollable
  React.useEffect(() => {
    if (!open) return;

    // Lock native body scroll in the background
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 10);

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Arrow keys navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[activeIdx]) { handleSelect(filtered[activeIdx]); }
  };

  const handleSelect = (item: BaseItem) => {
    if (item.id === "action-theme") { toggleTheme(); setOpen(false); return; }
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

  // Group the filtered results
  const allGroups: { key: BaseItem["group"]; label: string; items: BaseItem[] }[] = [
    { key: "nav" as const,     label: labels.nav,     items: filtered.filter(i => i.group === "nav") },
    { key: "content" as const, label: labels.content, items: filtered.filter(i => i.group === "content") },
    { key: "action" as const,  label: labels.actions, items: filtered.filter(i => i.group === "action") },
  ];
  const groups = allGroups.filter(g => g.items.length > 0);

  // Flat index map for keyboard nav
  let flatIdx = 0;

  const getIcon = (item: BaseItem) => {
    if (item.group === "nav") return <Home className="size-3.5 text-muted-foreground" />;
    if (item.group === "content" && item.id.startsWith("blog-")) return <BookOpen className="size-3.5 text-muted-foreground" />;
    if (item.group === "content") return <Layers className="size-3.5 text-muted-foreground" />;
    if (item.id === "action-theme") return theme === "dark" ? <Sun className="size-3.5 text-muted-foreground" /> : <Moon className="size-3.5 text-muted-foreground" />;
    if (item.id === "action-cv") return <Download className="size-3.5 text-muted-foreground" />;
    if (item.id === "action-contact") return <Mail className="size-3.5 text-muted-foreground" />;
    return null;
  };

  // Default trigger style when no triggerClassName is given
  const defaultTriggerClass = "hidden md:inline-flex items-center gap-1.5 h-7 px-2 rounded-md border border-border/60 bg-surface-alt/50 text-xs text-muted-foreground hover:text-foreground hover:border-border hover:bg-surface-alt transition-all";

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[20010] flex items-start justify-center px-4 pt-[12vh]"
          style={{ background: "rgba(0,0,0,0.45)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-black/30"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.7 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
              <Command className="size-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); }}
                onKeyDown={handleKeyDown}
                placeholder={labels.placeholder}
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/60"
                aria-label={labels.placeholder}
                autoComplete="off"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 bg-surface-alt/60">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              data-lenis-prevent
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
              className="max-h-[50vh] overflow-y-auto overscroll-contain px-2 pb-2 [touch-action:pan-y]"
            >
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-sm text-muted-foreground text-center">
                  {labels.noResults}
                </div>
              )}
              {groups.map(group => (
                <div key={group.key}>
                  <GroupLabel label={group.label} />
                  {group.items.map(item => {
                    const idx = flatIdx++;
                    const isActive = idx === activeIdx;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={[
                          "w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-colors",
                          isActive ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-surface-alt/60",
                        ].join(" ")}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className={[
                          "flex items-center justify-center w-6 h-6 rounded-md border shrink-0 transition-colors",
                          isActive ? "border-primary/30 bg-primary/10" : "border-border/60 bg-surface-alt/40",
                        ].join(" ")}>
                          {getIcon(item)}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className={["block text-sm font-medium truncate", isActive ? "text-foreground" : "text-foreground/80"].join(" ")}>
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="block text-xs text-muted-foreground truncate">{item.subtitle}</span>
                          )}
                        </span>
                        {isActive && <ArrowRight className="size-3.5 text-primary shrink-0" />}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-border/40 flex items-center gap-3 text-[10px] text-muted-foreground/50">
              <span className="flex items-center gap-1"><kbd className="border border-border/40 rounded px-1 bg-surface-alt/40">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="border border-border/40 rounded px-1 bg-surface-alt/40">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="border border-border/40 rounded px-1 bg-surface-alt/40">Esc</kbd> close</span>
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
        className={triggerClassName ?? defaultTriggerClass}
        aria-label={labels.open}
      >
        <Command className="size-3" />
        <span>{labels.open}</span>
        <kbd className="flex items-center gap-0.5 text-[10px] border border-border/50 rounded px-1 bg-surface/50 text-muted-foreground/70">⌘K</kbd>
      </button>
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}

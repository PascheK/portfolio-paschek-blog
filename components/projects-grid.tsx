"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryFilter, type CategoryOption } from "@/components/ui/category-filter";
import { RevealStagger } from "@/components/ui/reveal";
import Image from "next/image";
import { formatDate } from "@/lib/dates";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Code2 } from "lucide-react";

type ProjectPost = {
  slug: string;
  metadata: {
    title: string;
    publishedAt?: string;
    summary?: string;
    tags?: string;
    image?: string;
  };
};

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  const t = raw.trim();
  // Try JSON array first: ["AI","Open Source"]
  if (t.startsWith("[")) {
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) return arr.map(String);
    } catch {
      // fall through to CSV parsing
    }
  }
  // CSV: "AI, Open Source"
  return t
    .split(",")
    .map((s) => s.replace(/^\s*["']?|["']?\s*$/g, "").trim())
    .filter(Boolean);
}

export default function ProjectsGrid({
  posts,
  dict,
  lang,
}: {
  posts: ProjectPost[];
  dict: any;
  lang: "en" | "fr";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const allCategories: CategoryOption[] = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => parseTags(p.metadata.tags).forEach((t) => set.add(t)));
    const allLabel = lang === "fr" ? "Tous" : "All";
    // Preferred ordering per language; everything else sorted alpha after
    const preferred = lang === "fr" ? ["IA", "Open Source", "Éducation"] : ["AI", "Open Source", "Education"];
    const tags = Array.from(set);
    tags.sort((a, b) => {
      const ia = preferred.indexOf(a);
      const ib = preferred.indexOf(b);
      const sa = ia === -1 ? Number.POSITIVE_INFINITY : ia;
      const sb = ib === -1 ? Number.POSITIVE_INFINITY : ib;
      if (sa !== sb) return sa - sb;
      return a.localeCompare(b);
    });
    const result = [
      { value: "__all__", label: allLabel },
      ...tags.map((t) => ({ value: t, label: t })),
    ];
    return result;
  }, [posts, lang]);

  const [selected, setSelected] = useState<string>(allCategories[0]?.value ?? "__all__");
  const [searchQuery, setSearchQuery] = useState('');

  // Derive filtered projects from the full dataset (posts), current selection, and search query
  const filteredProjects = useMemo(() => {
    const allValue = "__all__";
    let result = posts;
    if (selected !== allValue) {
      const sel = selected.trim();
      result = result.filter((p) => parseTags(p.metadata.tags).some((t) => t.trim() === sel));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.metadata.title.toLowerCase().includes(q) ||
          p.metadata.summary?.toLowerCase().includes(q) ||
          parseTags(p.metadata.tags).some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, selected, searchQuery]);

  // Clear and apply filter via selection only (derived list handles recalculation)
  const handleFilterChange = (value: string) => {
    setSelected(value);
  };

  // Ensure selected stays valid when language or categories change
  useEffect(() => {
    const allValue = "__all__";
    const values = allCategories.map((c) => c.value);
    if (!values.includes(selected)) {
      const next = allCategories[0]?.value ?? allValue;
      setSelected(next);
    }
  }, [allCategories, lang]);

  // Initialize selection from URL exactly once on mount
  const didInitFromURL = useRef(false);
  useEffect(() => {
    if (didInitFromURL.current) return;
    const allValue = "__all__";
    const param = searchParams?.get("category");
    let next = allValue;
    if (param) {
      let decoded = param;
      try {
        decoded = decodeURIComponent(param);
      } catch { }
      const values = allCategories.map((c) => c.value);
      if (values.includes(decoded)) {
        next = decoded;
      } else if (["all", "tous", ""].includes(decoded.toLowerCase())) {
        next = allValue;
      }
    }
    setSelected(next);
    didInitFromURL.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allCategories, lang]);

  // Push selection to URL whenever it changes (omit param for All/Tous)
  useEffect(() => {
    const allValue = "__all__";
    if (!pathname) return;
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (selected === allValue) {
      if (params.has("category")) {
        params.delete("category");
        const url = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
        router.replace(url, { scroll: false });
      }
      return;
    }
    const prev = params.get("category");
    if (prev !== selected) {
      params.set("category", selected);
      const url = `${pathname}?${params.toString()}`;
      router.replace(url, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, pathname, lang]);


  const searchPlaceholder = dict?.projectsPage?.search ?? 'Search projects...';
  const noResultsMsg = (dict?.projectsPage?.noResults ?? 'No projects found for "{{query}}"').replace('{{query}}', searchQuery);

  return (
    <div className="flex flex-col gap-6">
      {/* Search input */}
      <div className="relative max-w-md mx-auto w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-border bg-surface-alt/60 backdrop-blur pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <CategoryFilter
          categories={allCategories}
          selected={selected}
          onSelect={handleFilterChange}
          className="justify-center"
        />
      </div>
      {filteredProjects.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{noResultsMsg}</p>
      ) : (
        <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => {
              const styles = [
                { border: "border-rose-500/50", glow: "hover:shadow-rose-500/10", tag: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
                { border: "border-blue-500/50", glow: "hover:shadow-blue-500/10", tag: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
                { border: "border-yellow-400/60", glow: "hover:shadow-yellow-400/10", tag: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30" },
                { border: "border-emerald-400/60", glow: "hover:shadow-emerald-400/10", tag: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30" },
                { border: "border-purple-500/60", glow: "hover:shadow-purple-500/10", tag: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
                { border: "border-cyan-400/60", glow: "hover:shadow-cyan-400/10", tag: "bg-cyan-400/10 text-cyan-400 border-cyan-400/30" },
              ];
              const { border, glow, tag } = styles[idx % styles.length];
              return (
                <motion.div
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <Link
                    href={`/${lang}/projects/${project.slug}`}
                    className={`group rounded-2xl overflow-hidden bg-surface-alt/70 dark:bg-surface-alt/30 backdrop-blur border ${border} shadow-lg ${glow} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-surface">
                      {project.metadata.image ? (
                        <Image
                          src={project.metadata.image}
                          alt={(dict?.projectsPage?.imageAlt || "Cover image for {{title}}")
                            .replace("{{title}}", project.metadata.title)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-alt via-muted to-surface flex items-center justify-center">
                          <Code2 className="size-10 text-muted-foreground/25" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                        {project.metadata.title}
                      </h2>
                      {project.metadata.publishedAt && (
                        <p className="text-muted-foreground tabular-nums text-xs">
                          {formatDate(project.metadata.publishedAt, false, lang === "fr" ? "fr-FR" : "en-US")}
                        </p>
                      )}
                      {project.metadata.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.metadata.summary}
                        </p>
                      )}
                      {!!parseTags(project.metadata.tags).length && (
                        <div className="mt-auto pt-2 flex flex-wrap gap-1">
                          {parseTags(project.metadata.tags).map((t) => (
                            <span
                              key={t}
                              className={`px-2 py-0.5 rounded-full text-xs border ${tag}`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary group-hover:text-primary/80 underline underline-offset-4">
                        {dict.projectsPage.details}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </RevealStagger>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryFilter, type CategoryOption } from "@/components/ui/category-filter";
import { RevealStagger } from "@/components/ui/reveal";
import Image from "next/image";
import { formatDate } from "@/lib/dates";
import { AnimatePresence, motion } from "framer-motion";

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

  // Derive filtered projects from the full dataset (posts) and current selection
  const filteredProjects = useMemo(() => {
    const allValue = "__all__";
    if (selected === allValue) return posts;
    const sel = selected.trim();
    return posts.filter((p) => parseTags(p.metadata.tags).some((t) => t.trim() === sel));
  }, [posts, selected]);

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


  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <CategoryFilter
          categories={allCategories}
          selected={selected}
          onSelect={handleFilterChange}
          className="justify-center"
        />
      </div>
      <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, idx) => {
            const borders = [
              "border-rose-500/50",
              "border-blue-500/50",
              "border-yellow-400/60",
              "border-emerald-400/60",
              "border-purple-500/60",
              "border-cyan-400/60",
            ];
            const border = borders[idx % borders.length];
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
                  className={`group rounded-xl overflow-hidden bg-neutral-900/60 backdrop-blur border ${border} shadow transition-transform hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950`}
                >
                  {project.metadata.image && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={project.metadata.image}
                        alt={(dict?.projectsPage?.imageAlt || "Cover image for {{title}}")
                          .replace("{{title}}", project.metadata.title)}
                        fill
                        className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2 min-h-[150px]">
                    <h2 className="text-lg font-semibold group-hover:text-blue-300 transition-colors">
                      {project.metadata.title}
                    </h2>
                    {project.metadata.publishedAt && (
                      <p className="text-neutral-400 tabular-nums text-xs">
                        {formatDate(project.metadata.publishedAt, false, lang === "fr" ? "fr-FR" : "en-US")}
                      </p>
                    )}
                    {project.metadata.summary && (
                      <p className="text-sm text-neutral-300 line-clamp-3">
                        {project.metadata.summary}
                      </p>
                    )}
                    {!!parseTags(project.metadata.tags).length && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {parseTags(project.metadata.tags).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-xs border border-neutral-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 text-sm text-blue-300 group-hover:text-blue-200 underline underline-offset-4">
                      {dict.projectsPage.details}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </RevealStagger>
    </div>
  );
}

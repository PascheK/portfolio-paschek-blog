"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryFilter, type CategoryOption } from "@/components/ui/category-filter";
import { ContentCard } from "@/components/brand/content-card";
import { Search, X } from "lucide-react";

type ProjectPost = {
  slug: string;
  metadata: {
    title: string;
    publishedAt?: string;
    summary?: string;
    tags?: string;
    group?: string;
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
    posts.forEach((p) => { if (p.metadata.group) set.add(p.metadata.group); });
    const allLabel = lang === "fr" ? "Tous" : "All";
    // Fixed order: HelloXLab, UNOPS, Div-In, Personal (both languages); anything else after, alphabetical.
    const preferred = ["HelloXLab", "UNOPS", "Div-In", "Personal", "Personnel"];
    const groups = Array.from(set).sort((a, b) => {
      const ia = preferred.indexOf(a);
      const ib = preferred.indexOf(b);
      const sa = ia === -1 ? Number.POSITIVE_INFINITY : ia;
      const sb = ib === -1 ? Number.POSITIVE_INFINITY : ib;
      if (sa !== sb) return sa - sb;
      return a.localeCompare(b);
    });
    return [
      { value: "__all__", label: allLabel },
      ...groups.map((g) => ({ value: g, label: g })),
    ];
  }, [posts, lang]);

  const [selected, setSelected] = useState<string>(allCategories[0]?.value ?? "__all__");
  const [searchQuery, setSearchQuery] = useState('');

  // Derive filtered projects from the full dataset (posts), current selection, and search query
  const filteredProjects = useMemo(() => {
    const allValue = "__all__";
    let result = posts;
    if (selected !== allValue) {
      const sel = selected.trim();
      result = result.filter((p) => (p.metadata.group ?? "").trim() === sel);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.metadata.title.toLowerCase().includes(q) ||
          p.metadata.summary?.toLowerCase().includes(q) ||
          p.metadata.group?.toLowerCase().includes(q) ||
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CategoryFilter
          categories={allCategories}
          selected={selected}
          onSelect={handleFilterChange}
          label={dict?.projectsPage?.filter ?? "Filter"}
        />
        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="field pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <p role="status" className="py-12 text-muted-foreground">{noResultsMsg}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <li key={project.slug} className="h-full">
              <ContentCard
                href={`/${lang}/projects/${project.slug}`}
                title={project.metadata.title}
                summary={project.metadata.summary}
                image={project.metadata.image}
                imageAlt={(dict?.projectsPage?.imageAlt || "Cover image for {{title}}").replace("{{title}}", project.metadata.title)}
                tags={parseTags(project.metadata.tags)}
                date={project.metadata.publishedAt}
                locale={lang === "fr" ? "fr-FR" : "en-US"}
                meta={project.metadata.group}
                coverLabel={project.metadata.group}
                fallbackLabel={project.metadata.group ?? "Project"}
                cta={dict?.projectsPage?.details}
                maxTags={4}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

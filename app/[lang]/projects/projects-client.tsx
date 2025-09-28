"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/types/project";
import { CategoryFilter, type CategoryOption } from "@/components/ui/category-filter";
import { GridSwitcher } from "@/components/ui/grid-switcher";

const getCategories = (projects: { category: string[] }[], lang?: 'en' | 'fr'): CategoryOption[] => {
  // Récupère toutes les catégories uniques de tous les projets
  const cats = projects.flatMap((p) => p.category);
  const unique = Array.from(new Set(cats));
  const allLabel = lang === 'fr' ? 'Tous' : 'All';
  return [
    { value: "__all__", label: allLabel },
    ...unique.map((c) => ({ value: c, label: c })),
  ];
};

export default function ProjectsClient({ projects, dict, lang }: { projects: Project[]; dict?: any; lang?: 'en' | 'fr' }) {
  const [category, setCategory] = useState("__all__");
  const [columns, setColumns] = useState(2);

  const categories: CategoryOption[] = getCategories(projects, lang);
  const filtered = category === "__all__"
    ? projects
    : projects.filter((p) => p.category.includes(category));

  return (
    <section className="w-full px-2 sm:px-4 md:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <CategoryFilter
            categories={categories}
            selected={category}
            onSelect={setCategory}
            className="w-full sm:w-auto"
          />
          <GridSwitcher
            value={columns}
            onChange={setColumns}
            className="w-full sm:w-auto"
            label={dict?.projectsPage?.display ?? 'Display'}
          />
        </div>
        <div
          className={`grid gap-6 ${columns === 1
            ? "grid-cols-1"
            : columns === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            }`}
        >
          {filtered.map((project, index) => {
            const slug = project.title.toLowerCase().replace(/\s+/g, "-");
            return (
              <div
                key={index}
                className="flex flex-col space-y-2 p-5 border  border-neutral-800 rounded-xl transition-shadow hover:shadow-xl bg-neutral-900/80 backdrop-blur-sm hover:-translate-y-1 duration-150"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-40 object-cover rounded-md mb-2 border border-neutral-800 bg-neutral-800"
                  loading="lazy"
                />
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-white">{project.title}</h2>
                  <span className="text-xs text-neutral-400">{project.year} &middot; {project.category.join(', ')}</span>
                  <p className="text-neutral-400">{project.description}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <a
                    href={project.url}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-pink-500 transition-colors shadow"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {dict?.projectsPage?.viewProject ?? 'View project'}
                  </a>
                  <Link
                    href={`/${lang ?? ''}/projects/${project.slug}`}
                    className="px-3 py-1 rounded bg-neutral-700 text-neutral-100 text-sm hover:bg-blue-900 transition-colors shadow"
                  >
                    {dict?.projectsPage?.details ?? 'Details'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "./project-data";
import { CategoryFilter } from "@/components/ui/category-filter";
import { GridSwitcher } from "@/components/ui/grid-switcher";
import { Badge } from "@/components/ui/badge";

const getCategories = (projects: { category: string }[]): string[] => {
  const cats = projects.map((p) => p.category);
  return ["All", ...Array.from(new Set(cats))];
};

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState("All");
  const [columns, setColumns] = useState(2);

  const categories: string[] = getCategories(projects);
  const filtered = category === "All" ? projects : projects.filter((p) => p.category === category);

  return (
    <section>
      <h1 className="mb-8 text-2xl font-medium">Projects</h1>
      <CategoryFilter
        categories={categories}
        selected={category}
        onSelect={setCategory}
        className="mb-6"
      />
      <Badge>test</Badge>
      <GridSwitcher
        value={columns}
        onChange={setColumns}
        className="mb-6"
      />
      <div
        className={`grid gap-6 ${columns === 1
          ? "grid-cols-1"
          : columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
      >
        {filtered.map((project, index) => (
          <Link
            key={index}
            href={project.url}
            className="flex flex-col space-y-2 p-4 border rounded-lg transition-shadow hover:shadow-lg bg-white dark:bg-neutral-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-black dark:text-white">{project.title}</h2>
              <span className="text-xs text-neutral-400">{project.year} &middot; {project.category}</span>
              <p className="text-neutral-600 dark:text-neutral-400">{project.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
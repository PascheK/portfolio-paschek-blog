import type { MetadataRoute } from "next";
import { getBlogPosts, getProjectPosts } from "@/lib/posts";
import { hasVideos } from "@/lib/youtube";
import { abs, LOCALES } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

const latest = (dates: (string | undefined)[]) =>
  dates.filter(Boolean).sort().at(-1) as string | undefined;

/** One entry per locale, each declaring its translations so Google serves the right language. */
function localized(path: string, lastModified?: string, priority?: number): Entry[] {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, abs(`/${l}${path}`)]));
  return LOCALES.map((l) => ({
    url: abs(`/${l}${path}`),
    ...(lastModified ? { lastModified } : {}),
    ...(priority !== undefined ? { priority } : {}),
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts("en");
  const projects = getProjectPosts("en");
  const lastPost = latest(posts.map((p) => p.metadata.publishedAt));
  const lastProject = latest(projects.map((p) => p.metadata.publishedAt));

  return [
    ...localized("", latest([lastPost, lastProject]), 1),
    ...localized("/projects", lastProject, 0.9),
    ...localized("/blog", lastPost, 0.9),
    ...(hasVideos() ? localized("/videos", undefined, 0.7) : []),
    ...localized("/about", undefined, 0.7),
    ...localized("/uses", undefined, 0.5),
    ...projects.flatMap((p) => localized(`/projects/${p.slug}`, p.metadata.publishedAt, 0.8)),
    ...posts.flatMap((p) => localized(`/blog/${p.slug}`, p.metadata.publishedAt, 0.8)),
  ];
}

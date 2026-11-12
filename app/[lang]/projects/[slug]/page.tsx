import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import Image from "next/image";
import type { Metadata } from "next";
import { getProjectPosts } from "@/lib/posts";
import { metaData } from "@/lib/config";
import { JsonLd } from "@/components/json-ld";
import { abs, absImage, ogImageUrl, pageMeta, LOCALES, type Lang } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/dates";
import Link from "next/link";
import { ReadingProgress } from "@/components/brand/reading-progress";
import { extractHeadings, railItemsFromHeadings } from "@/lib/toc";
import { SectionRail } from "@/components/brand/section-rail";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { CoverPlaceholder } from "@/components/brand/content-card";


export async function generateStaticParams() {
  // Pre-render English slugs by default; localized pages are handled via [lang]
  let posts = getProjectPosts("en");

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}): Promise<Metadata | undefined> {
  const { slug, lang } = await params;
  const l: Lang = lang === "fr" ? "fr" : "en";
  const post = getProjectPosts(l).find((p) => p.slug === slug);
  if (!post) {
    return;
  }

  const { title, publishedAt, summary, image, tags } = post.metadata;
  return pageMeta({
    lang: l,
    path: "/projects/" + post.slug,
    title,
    description: summary ?? title,
    type: "article",
    image,
    imageEyebrow: "Project",
    publishedTime: publishedAt,
    tags: parseTags(tags),
    // hreflang only for the languages in which this page really exists
    languages: LOCALES.filter((x) => getProjectPosts(x).some((p) => p.slug === slug)),
  });
}


function parseTags(raw?: string): string[] {
  if (!raw) return [];
  const t = raw.trim();
  if (t.startsWith("[")) {
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) return arr.map(String);
    } catch { /* fall through */ }
  }
  return t.split(",").map((s) => s.replace(/^\s*["']?|["']?\s*$/g, "").trim()).filter(Boolean);
}

export default async function ProjectPage({ params }) {
  const { slug, lang } = await params;
  const resolvedLang = lang ?? "en";
  const dict = await getDictionary(resolvedLang);

  let project = getProjectPosts(resolvedLang).find((post) => post.slug === slug);

  if (!project) notFound();

  const isFr = resolvedLang === "fr";
  const locale = isFr ? "fr-FR" : "en-US";
  const headings = project.content ? extractHeadings(project.content) : [];
  const tags = parseTags(project.metadata.tags);
  const coverLabel = (project.metadata.group ?? tags[0] ?? "Project").toUpperCase();

  // One primary action: the live link (url / demo). The repository is secondary.
  const primaryHref = project.metadata.demoUrl || project.metadata.url;
  const primaryLabel =
    project.metadata.ctaLabel ||
    (project.metadata.url ? (isFr ? "Découvrir" : "Discover") : dict?.projectsPage?.viewProject ?? "View project");

  return (
    <div className="container-page pb-8">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            headline: project.metadata.title,
            description: project.metadata.summary,
            image: project.metadata.image
              ? absImage(project.metadata.image)
              : ogImageUrl(resolvedLang, project.metadata.title, "Project"),
            datePublished: project.metadata.publishedAt,
            dateModified: project.metadata.publishedAt,
            url: abs(`/${resolvedLang}/projects/${project.slug}`),
            mainEntityOfPage: { "@type": "WebPage", "@id": abs(`/${resolvedLang}/projects/${project.slug}`) },
            inLanguage: resolvedLang,
            keywords: parseTags(project.metadata.tags).join(", "),
            author: { "@type": "Person", "@id": abs("/#person"), name: metaData.name, url: abs(`/${resolvedLang}`) },
            publisher: { "@id": abs("/#person") },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "PascheK", item: abs(`/${resolvedLang}`) },
              { "@type": "ListItem", position: 2, name: resolvedLang === "fr" ? "Projets" : "Projects", item: abs(`/${resolvedLang}/projects`) },
              { "@type": "ListItem", position: 3, name: project.metadata.title, item: abs(`/${resolvedLang}/projects/${project.slug}`) },
            ],
          },
        ]}
      />

      <ReadingProgress />
      <SectionRail
        variant="article"
        items={railItemsFromHeadings(headings)}
        label={isFr ? "Dans cet article" : "In this article"}
      />
      <article>
        <header className="pt-10 pb-10 md:pt-14">
          <Link
            href={`/${resolvedLang}/projects`}
            className="link-quiet mb-8 inline-flex items-center gap-1.5 rounded-md text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {dict?.nav?.projects ?? "Projects"}
          </Link>

          {(project.metadata.group || project.metadata.publishedAt) && (
            <p className="eyebrow mb-4 flex items-center gap-2">
              {project.metadata.group && <span className="text-foreground">{project.metadata.group}</span>}
              {project.metadata.group && project.metadata.publishedAt && <span aria-hidden>·</span>}
              {project.metadata.publishedAt && (
                <time dateTime={project.metadata.publishedAt}>
                  {formatDate(project.metadata.publishedAt, false, locale)}
                </time>
              )}
            </p>
          )}
          <h1 className="t-h1 max-w-3xl">{project.metadata.title}</h1>
          {project.metadata.summary && (
            <p className="t-lead mt-4 max-w-2xl">{project.metadata.summary}</p>
          )}
          {tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tags">
              {tags.map((t) => (
                <li key={t} className="tag">{t}</li>
              ))}
            </ul>
          )}

          {(primaryHref || project.metadata.repoUrl) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {primaryHref && (
                <a
                  href={primaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {primaryLabel}
                  <ArrowUpRight aria-hidden />
                </a>
              )}
              {project.metadata.repoUrl && (
                <a
                  href={project.metadata.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Github aria-hidden />
                  {isFr ? "Code source" : "Source code"}
                </a>
              )}
            </div>
          )}
        </header>

        <figure className="relative mb-12 aspect-[21/9] overflow-hidden rounded-xl border border-border bg-surface-alt">
          {project.metadata.image ? (
            <Image
              src={project.metadata.image}
              alt={(dict?.projectsPage?.imageAlt || "Cover image for {{title}}")
                .replace("{{title}}", project.metadata.title)}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          ) : (
            <CoverPlaceholder seed={project.slug} label={coverLabel} />
          )}
        </figure>

        {project.content ? (
          <div className="prose max-w-3xl">
          <CustomMDX source={project.content} />
        </div>
        ) : (
          <p className="text-muted-foreground">
            {isFr ? "Aucun contenu détaillé disponible pour ce projet." : "No detailed content available for this project."}
          </p>
        )}
      </article>
    </div>
  );
}

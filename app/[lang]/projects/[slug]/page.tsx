import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import Image from "next/image";
import type { Metadata } from "next";
import { getProjectPosts } from "@/lib/posts";
import { metaData } from "@/lib/config";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/dates";


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
  let post = getProjectPosts(lang ?? "en").find((post) => post.slug === slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
    ? image
    : `${metaData.baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${metaData.baseUrl}/${(lang ?? "en")}/projects/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
  };
}


export default async function ProjectPage({ params }) {
  const { slug, lang } = await params;
  const dict = await getDictionary(lang ?? "en");

  let project = getProjectPosts(lang ?? "en").find((post) => post.slug === slug);

  if (!project) notFound();

  const locale = (lang ?? "en") === "fr" ? "fr-FR" : "en-US";
  const published = project.metadata.publishedAt
    ? formatDate(project.metadata.publishedAt, false, locale)
    : undefined;

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      {project.metadata.image && (
        <div className="relative w-full h-56 mb-6 overflow-hidden rounded-xl border border-neutral-800">
          <Image
            src={project.metadata.image}
            alt={(dict?.projectsPage?.imageAlt || "Cover image for {{title}}")
              .replace("{{title}}", project.metadata.title)}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: project.metadata.title,
            datePublished: project.metadata.publishedAt,
            dateModified: project.metadata.publishedAt,
            description: project.metadata.summary,
            image: project.metadata.image
              ? `${metaData.baseUrl}${project.metadata.image}`
              : `/og?title=${encodeURIComponent(project.metadata.title)}`,
            url: `${metaData.baseUrl}/${(lang ?? "en")}/projects/${project.slug}`,
            author: {
              "@type": "Person",
              name: metaData.name,
            },
          }),
        }}
      />
      <div className="flex flex-col items-center mb-8">

        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {project.metadata.title}
        </h1>
        {published && (
          <span className="text-xs text-neutral-400 mb-2">{published}</span>
        )}
        <p className="text-neutral-400 text-center mb-2 max-w-xl">{project.metadata.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {project.metadata.demoUrl && (
            <a
              href={project.metadata.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-pink-500 transition-colors shadow"
            >
              {dict?.projectsPage?.viewProject ?? "View project"}
            </a>
          )}
          {project.metadata.repoUrl && (
            <a
              href={project.metadata.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded bg-neutral-700 text-neutral-100 hover:bg-blue-900 transition-colors shadow"
            >
              {lang === "fr" ? "Code source" : "Source code"}
            </a>
          )}
          {project.metadata.url && (
            <a
              href={project.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow"
            >
              {project.metadata.ctaLabel || (lang === "fr" ? "Découvrir" : "Discover")}
            </a>
          )}
        </div>
      </div>
      {project.content ? (
        <article className="prose prose-invert mx-auto">
          <CustomMDX source={project.content} />
        </article>
      ) : (
        <div className="text-center text-neutral-400">Aucun contenu détaillé disponible pour ce projet.</div>
      )}
    </section>
  );
}

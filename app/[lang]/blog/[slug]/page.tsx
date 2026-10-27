import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import Image from "next/image";
import { getBlogPosts } from "@/lib/posts";
import { metaData } from "@/lib/config";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/dates";
import Link from "next/link";
import { ReadingProgress } from "@/components/brand/reading-progress";
import { extractHeadings, railItemsFromHeadings } from "@/lib/toc";
import { SectionRail } from "@/components/brand/section-rail";
import { ArrowLeft } from "lucide-react";
import { CoverPlaceholder, ContentCard } from "@/components/brand/content-card";

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  const t = raw.trim();
  if (t.startsWith('[')) {
    try { const a = JSON.parse(t); if (Array.isArray(a)) return a.map(String); } catch {}
  }
  return t.split(',').map(s => s.trim()).filter(Boolean);
}

export async function generateStaticParams() {
  // Default to English for prerendered slugs; per-language pages will be handled via [lang] segment
  let posts = getBlogPosts("en");

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}): Promise<Metadata | undefined> {
  const { slug, lang } = await params;
  let post = getBlogPosts(lang ?? "en").find((post) => post.slug === slug);
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
      url: `${metaData.baseUrl}/${(lang ?? "en")}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
  };
}

export default async function Blog({ params }) {
  const { slug, lang } = await params;
  const resolvedLang = lang ?? "en";
  const dict = await getDictionary(resolvedLang);
  const allPosts = getBlogPosts(resolvedLang);
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const headings = post.content ? extractHeadings(post.content) : [];
  const isFr = resolvedLang === "fr";
  const locale = isFr ? "fr-FR" : "en-US";
  const minutes = Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 200));

  // Related posts: same tags or fallback to the 2 most recent
  const postTags = parseTags(post.metadata.tags);
  const related = allPosts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      ...p,
      score: parseTags(p.metadata.tags).filter((t) => postTags.includes(t)).length,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const da = a.metadata.publishedAt ? new Date(a.metadata.publishedAt).getTime() : 0;
      const db = b.metadata.publishedAt ? new Date(b.metadata.publishedAt).getTime() : 0;
      return db - da;
    })
    .slice(0, 2);

  return (
    <div className="container-page pb-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${metaData.baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${metaData.baseUrl}/${resolvedLang}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: metaData.name,
            },
          }),
        }}
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
            href={`/${resolvedLang}/blog`}
            className="link-quiet mb-8 inline-flex items-center gap-1.5 rounded-md text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {isFr ? "Blog" : "Blog"}
          </Link>

          <p className="eyebrow mb-4 flex items-center gap-2">
            {post.metadata.publishedAt && (
              <time dateTime={post.metadata.publishedAt}>
                {formatDate(post.metadata.publishedAt, false, locale)}
              </time>
            )}
            <span aria-hidden>·</span>
            <span>{minutes} {dict?.blogPage?.readingTime ?? "min read"}</span>
          </p>
          <h1 className="t-h1 max-w-3xl">{post.metadata.title}</h1>
          {post.metadata.summary && (
            <p className="t-lead mt-4 max-w-2xl">{post.metadata.summary}</p>
          )}
          {postTags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tags">
              {postTags.map((t) => (
                <li key={t} className="tag">{t}</li>
              ))}
            </ul>
          )}
        </header>

        <figure className="relative mb-12 aspect-[21/9] overflow-hidden rounded-xl border border-border bg-surface-alt">
          {post.metadata.image ? (
            <Image
              src={post.metadata.image}
              alt={(dict?.blogPage?.imageAlt || "Cover image for {{title}}")
                .replace("{{title}}", post.metadata.title)}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          ) : (
            <CoverPlaceholder seed={post.slug} label={(postTags[0] ?? "Article").toUpperCase()} />
          )}
        </figure>

        <div className="prose max-w-3xl">
          <CustomMDX source={post.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20 border-t border-border pt-12">
          <h2 id="related-title" className="t-h2 mb-8">
            {isFr ? "Articles similaires" : "Related articles"}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {related.map((r) => (
              <li key={r.slug} className="h-full">
                <ContentCard
                  href={`/${resolvedLang}/blog/${r.slug}`}
                  title={r.metadata.title}
                  summary={r.metadata.summary}
                  image={r.metadata.image}
                  imageAlt={(dict?.blogPage?.imageAlt || "Cover image for {{title}}").replace("{{title}}", r.metadata.title)}
                  tags={parseTags(r.metadata.tags)}
                  date={r.metadata.publishedAt}
                  locale={locale}
                  fallbackLabel="Article"
                  cta={dict?.home?.blog?.read}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

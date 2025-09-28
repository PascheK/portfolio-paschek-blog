import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import Image from "next/image";
import { getBlogPosts } from "@/lib/posts";
import { metaData } from "@/lib/config";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/dates";

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
  const dict = await getDictionary(lang ?? "en");
  const post = getBlogPosts(lang ?? "en").find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      {post.metadata.image && (
        <div className="relative w-full h-56 mb-6 overflow-hidden rounded-xl border border-neutral-800">
          <Image
            src={post.metadata.image}
            alt={(dict?.blogPage?.imageAlt || "Cover image for {{title}}")
              .replace("{{title}}", post.metadata.title)}
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
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${metaData.baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${metaData.baseUrl}/${(lang ?? "en")}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: metaData.name,
            },
          }),
        }}
      />
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {post.metadata.title}
        </h1>
        {post.metadata.publishedAt && (
          <span className="text-xs text-neutral-400 mb-2">
            {formatDate(post.metadata.publishedAt, false, (lang ?? "en") === "fr" ? "fr-FR" : "en-US")}
          </span>
        )}
        {post.metadata.summary && (
          <p className="text-neutral-400 text-center mb-2 max-w-xl">
            {post.metadata.summary}
          </p>
        )}
      </div>

      <article className="prose prose-invert mx-auto">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}

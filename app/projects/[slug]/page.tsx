import { notFound } from "next/navigation";
import { projects } from "../project-data";
import { CustomMDX } from "@/components/mdx";
import Image from "next/image";
import type { Metadata } from "next";
import { getProjectPosts } from "@/lib/posts";
import { metaData } from "@/lib/config";


export async function generateStaticParams() {
  let posts = getProjectPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  let post = getProjectPosts().find((post) => post.slug === slug);
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
      url: `${metaData.baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
  };
}


export default async function ProjectPage({ params }) {
  const { slug } = params;

  let project = getProjectPosts().find((post) => post.slug === slug);

  if (!project) notFound();

  

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
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
            url: `${metaData.baseUrl}/blog/${project.slug}`,
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
        <span className="text-xs text-neutral-400 mb-2">{project.metadata.publishedAt}</span>
        <p className="text-neutral-600 dark:text-neutral-400 text-center mb-2 max-w-xl">{project.metadata.summary}</p>
        <a
          href={project.metadata.tags}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-pink-500 transition-colors shadow"
        >
          Voir le projet
        </a>
      </div>
      {project.content ? (
        <article className="prose prose-neutral dark:prose-invert mx-auto">
          <CustomMDX source={project.content} />
        </article>
      ) : (
        <div className="text-center text-neutral-400">Aucun contenu détaillé disponible pour ce projet.</div>
      )}
    </section>
  );
}

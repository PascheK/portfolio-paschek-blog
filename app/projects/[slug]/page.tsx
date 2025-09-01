import { notFound } from "next/navigation";
import { projects } from "../project-data";
import { CustomMDX } from "@/components/mdx";
import Image from "next/image";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.title.toLowerCase().replace(/\s+/g, "-") }));
}

export async function generateMetadata({ params }): Promise<Metadata | undefined> {
  const { slug } = params;
  const project = projects.find(
    (p) => p.title.toLowerCase().replace(/\s+/g, "-") === slug
  );
  if (!project) return;
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image],
    },
  };
}

async function getMDXContent(mdxFile: string) {
  // Dynamic import for MDX file in /content
  const file = await import(`../../../content/${mdxFile}`);
  return file.default;
}

export default async function ProjectPage({ params }) {
  const { slug } = params;
  const project = projects.find(
    (p) => p.title.toLowerCase().replace(/\s+/g, "-") === slug
  );
  if (!project) notFound();

  let mdxContent = null;
  try {
    mdxContent = await getMDXContent(project.mdxFile);
  } catch {
    // fallback if mdx not found
    mdxContent = null;
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <Image
          src={project.image}
          alt={project.title}
          width={640}
          height={360}
          className="rounded-xl shadow-lg mb-4 object-cover w-full max-h-64"
        />
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-2 justify-center">
          {project.category.map((cat) => (
            <span key={cat} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
              {cat}
            </span>
          ))}
        </div>
        <span className="text-xs text-neutral-400 mb-2">{project.year}</span>
        <p className="text-neutral-600 dark:text-neutral-400 text-center mb-2 max-w-xl">{project.description}</p>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-pink-500 transition-colors shadow"
        >
          Voir le projet
        </a>
      </div>
      {mdxContent ? (
        <article className="prose prose-neutral dark:prose-invert mx-auto">
          <CustomMDX source={mdxContent} />
        </article>
      ) : (
        <div className="text-center text-neutral-400">Aucun contenu détaillé disponible pour ce projet.</div>
      )}
    </section>
  );
}

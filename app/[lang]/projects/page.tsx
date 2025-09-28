
import Link from "next/link";
import type { Metadata } from "next";
import { getProjectPosts } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import ProjectsGrid from "@/components/projects-grid";


export const metadata: Metadata = {
  title: "Projects",
  description: "Nextfolio Projects"
};


export default async function Projects({ params }: { params: Promise<{ lang: 'en' | 'fr' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const posts = getProjectPosts(lang).sort((a, b) => {
    const da = a.metadata.publishedAt ? new Date(a.metadata.publishedAt).getTime() : 0;
    const db = b.metadata.publishedAt ? new Date(b.metadata.publishedAt).getTime() : 0;
    return db - da;
  });

  return (
    <section className="w-full px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="mb-6 md:mb-8 text-3xl md:text-4xl font-extrabold title text-center">
          {dict.nav.projects}
        </h1>

        <ProjectsGrid posts={posts as any} dict={dict} lang={lang} />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { getProjectPosts } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import ProjectsGrid from "@/components/projects-grid";
import { PageHeader } from "@/components/brand/page-header";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects: web apps, infrastructure and tools.",
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
    <div className="container-page pb-8">
      <PageHeader
        eyebrow={`${posts.length} ${lang === 'fr' ? 'projets' : 'projects'}`}
        title={dict.nav.projects}
        description={
          lang === 'fr'
            ? "Applications web, infrastructure et outils développés pour des clients, des associations et moi-même."
            : 'Web apps, infrastructure and tools built for clients, associations and myself.'
        }
      />
      <ProjectsGrid posts={posts as any} dict={dict} lang={lang} />
    </div>
  );
}

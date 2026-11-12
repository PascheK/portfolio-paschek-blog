import type { Metadata } from "next";
import { pageMeta, type Lang } from "@/lib/seo";
import { getProjectPosts } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import ProjectsGrid from "@/components/projects-grid";
import { PageHeader } from "@/components/brand/page-header";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === "fr";
  return pageMeta({
    lang,
    path: "/projects",
    title: isFr ? "Projets et études de cas" : "Projects & case studies",
    description: isFr ? "Études de cas : applications web et de bureau, infrastructure et outils, de HelloXLab, UNOPS et Div-In aux projets personnels." : "Case studies: web and desktop apps, infrastructure and tools, from HelloXLab, UNOPS and Div-In to personal projects.",
  });
}

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

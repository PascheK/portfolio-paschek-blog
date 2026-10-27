import { getBlogPosts } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import type { Metadata } from "next";
import { BlogSearch } from "@/components/blog-search";
import { PageHeader } from "@/components/brand/page-header";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles et billets",
};

export default async function BlogPosts({ params }: { params: Promise<{ lang: 'en' | 'fr' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';

  const posts = getBlogPosts(lang).sort((a, b) => {
    const da = a.metadata.publishedAt ? new Date(a.metadata.publishedAt).getTime() : 0;
    const db = b.metadata.publishedAt ? new Date(b.metadata.publishedAt).getTime() : 0;
    return db - da;
  });

  return (
    <div className="container-page pb-8">
      <PageHeader
        eyebrow={`${posts.length} ${lang === 'fr' ? 'articles' : 'articles'}`}
        title={dict.nav.blog}
        description={
          lang === 'fr'
            ? "Notes sur le développement web, l'IA, l'infrastructure et le jeu vidéo."
            : 'Notes on web development, AI, infrastructure and game dev.'
        }
      />

      <BlogSearch
        posts={posts}
        lang={lang}
        locale={locale}
        dict={{
          search: dict.blogPage.search ?? 'Search articles...',
          noResults: dict.blogPage.noResults ?? 'No articles found for "{{query}}"',
          read: dict.home.blog.read,
          readingTime: dict.blogPage.readingTime ?? 'min read',
          imageAlt: dict.blogPage.imageAlt,
        }}
      />
    </div>
  );
}

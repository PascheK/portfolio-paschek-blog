import { getBlogPosts } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import type { Metadata } from "next";
import { BlogSearch } from "@/components/blog-search";

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
    <section className="w-full px-4 sm:px-6 md:px-8 pb-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="mb-6 md:mb-8 text-3xl md:text-4xl font-extrabold title">
          {dict.nav.blog}
        </h1>

        <BlogSearch
          posts={posts}
          lang={lang}
          locale={locale}
          dict={{
            search: dict.blogPage.search ?? 'Search articles...',
            noResults: dict.blogPage.noResults ?? 'No articles found for "{{query}}"',
            read: dict.home.blog.read,
            readingTime: dict.blogPage.readingTime ?? 'min read',
          }}
        />
      </div>
    </section>
  );
}

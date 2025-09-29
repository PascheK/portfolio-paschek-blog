import Link from "next/link";
import { formatDate, getBlogPosts } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import type { Metadata } from "next";
import { RevealStagger, RevealItem } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles et billets",
};

export default async function BlogPosts({ params }: { params: Promise<{ lang: 'en' | 'fr' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  let allBlogs = getBlogPosts(lang);

  // Localize metadata title/description based on dict if available
  // Note: In Next 15 static metadata is defined at build; this is a simple runtime label for the page heading

  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';

  const posts = allBlogs.sort((a, b) => {
    const da = a.metadata.publishedAt ? new Date(a.metadata.publishedAt).getTime() : 0;
    const db = b.metadata.publishedAt ? new Date(b.metadata.publishedAt).getTime() : 0;
    return db - da;
  });

  return (
    <section className="w-full px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="mb-6 md:mb-8 text-3xl md:text-4xl font-extrabold title">
          {dict.nav.blog}
        </h1>

        <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post, idx) => {
            const borders = [
              'border-rose-500/50',
              'border-blue-500/50',
              'border-yellow-400/60',
              'border-emerald-400/60',
              'border-purple-500/60',
              'border-cyan-400/60',
            ];
            const border = borders[idx % borders.length];
            return (
              <RevealItem key={post.slug}>
                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  className={`group rounded-xl overflow-hidden bg-surface-alt/70 backdrop-blur border ${border} shadow transition-transform hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                >
                  <div className="p-4 flex flex-col gap-2 min-h-[150px]">
                    <h2 className="text-lg font-semibold group-hover:text-blue-300 transition-colors">
                      {post.metadata.title}
                    </h2>
                    <p className="text-foreground tabular-nums text-xs">
                      {formatDate(post.metadata.publishedAt, false, locale)}
                    </p>
                    {post.metadata.summary && (
                      <p className="text-sm text-foreground line-clamp-3">
                        {post.metadata.summary}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 text-sm text-blue-300 group-hover:text-blue-200 underline underline-offset-4">
                      {dict.home.blog.read}
                    </span>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}

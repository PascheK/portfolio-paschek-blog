'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ContentCard } from '@/components/brand/content-card';

interface BlogPost {
  slug: string;
  content: string;
  metadata: {
    title: string;
    publishedAt?: string;
    summary?: string;
    image?: string;
    tags?: string | string[];
  };
}

function parseTags(raw?: string | string[]): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const t = raw.trim();
  if (t.startsWith('[')) {
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) return arr.map(String);
    } catch {}
  }
  return t.split(',').map((s) => s.trim()).filter(Boolean);
}

interface BlogSearchProps {
  posts: BlogPost[];
  lang: string;
  dict: {
    search: string;
    noResults: string;
    read: string;
    readingTime: string;
    imageAlt?: string;
  };
  locale: string;
}

function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function BlogSearch({ posts, lang, dict, locale }: BlogSearchProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.metadata.title.toLowerCase().includes(q) ||
        p.metadata.summary?.toLowerCase().includes(q) ||
        parseTags(p.metadata.tags).some((t) => t.toLowerCase().includes(q))
    );
  }, [posts, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.search}
          aria-label={dict.search}
          className="field pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p role="status" className="py-12 text-muted-foreground">
          {dict.noResults.replace('{{query}}', query)}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filtered.map((post) => (
            <li key={post.slug} className="h-full">
              <ContentCard
                href={`/${lang}/blog/${post.slug}`}
                title={post.metadata.title}
                summary={post.metadata.summary}
                image={post.metadata.image}
                imageAlt={(dict.imageAlt ?? 'Cover image for {{title}}').replace('{{title}}', post.metadata.title)}
                tags={parseTags(post.metadata.tags)}
                date={post.metadata.publishedAt}
                locale={locale}
                meta={`${getReadingTime(post.content)} ${dict.readingTime}`}
                fallbackLabel="Article"
                cta={dict.read}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

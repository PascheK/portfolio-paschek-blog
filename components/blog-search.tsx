'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Clock, Code2 } from 'lucide-react';

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
  };
  locale: string;
}

function formatDate(date?: string, locale?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale ?? 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const borders = [
  { border: 'border-rose-500/50', glow: 'hover:shadow-rose-500/10', tag: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { border: 'border-blue-500/50', glow: 'hover:shadow-blue-500/10', tag: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { border: 'border-yellow-400/60', glow: 'hover:shadow-yellow-400/10', tag: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' },
  { border: 'border-emerald-400/60', glow: 'hover:shadow-emerald-400/10', tag: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' },
  { border: 'border-purple-500/60', glow: 'hover:shadow-purple-500/10', tag: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { border: 'border-cyan-400/60', glow: 'hover:shadow-cyan-400/10', tag: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30' },
];

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
    <div className="flex flex-col gap-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.search}
          className="w-full rounded-xl border border-border bg-surface-alt/60 backdrop-blur pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {dict.noResults.replace('{{query}}', query)}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((post, idx) => {
            const { border, glow, tag } = borders[idx % borders.length];
            const readingTime = getReadingTime(post.content);
            return (
              <Link
                key={post.slug}
                href={`/${lang}/blog/${post.slug}`}
                className={`group rounded-2xl overflow-hidden bg-surface-alt/70 backdrop-blur border ${border} shadow-lg ${glow} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
              >
                {/* Cover image or gradient placeholder */}
                <div className="aspect-video relative overflow-hidden bg-surface">
                  {post.metadata.image ? (
                    <Image
                      src={post.metadata.image}
                      alt={post.metadata.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-alt via-muted to-surface flex items-center justify-center">
                      <Code2 className="size-10 text-muted-foreground/25" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h2 className="text-base font-semibold group-hover:text-primary transition-colors leading-snug">
                    {post.metadata.title}
                  </h2>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDate(post.metadata.publishedAt, locale)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {readingTime} {dict.readingTime}
                    </span>
                  </div>

                  {/* Summary */}
                  {post.metadata.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.metadata.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {parseTags(post.metadata.tags).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {parseTags(post.metadata.tags).slice(0, 3).map((t) => (
                        <span key={t} className={`text-xs px-2 py-0.5 rounded-full border ${tag}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="mt-1 text-xs text-primary group-hover:text-primary/80 underline underline-offset-4">
                    {dict.read}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

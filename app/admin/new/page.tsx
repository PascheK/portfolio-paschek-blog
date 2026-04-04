'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { savePostGitHub } from '@/app/actions/admin';
import { ArrowLeft, Save } from 'lucide-react';

function buildFrontmatter(fields: Record<string, string>) {
  const lines = ['---'];
  for (const [key, val] of Object.entries(fields)) {
    if (val.trim()) lines.push(`${key}: ${val}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function NewPostForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<'blog' | 'projects'>((searchParams.get('type') as any) ?? 'blog');
  const [lang, setLang] = useState<'en' | 'fr'>((searchParams.get('lang') as any) ?? 'en');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!slug || !title) { setError('Slug and title are required.'); return; }
    const frontmatter = buildFrontmatter({ title, publishedAt: date, summary, image, tags });
    const fullContent = frontmatter + body;
    startTransition(async () => {
      const result = await savePostGitHub(type, lang, slug, fullContent);
      if (result.ok) {
        router.push('/admin');
      } else {
        setError(result.error ?? 'Failed to save.');
      }
    });
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-bold">New post</h1>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-60 transition-all"
        >
          <Save className="size-4" />
          {isPending ? 'Saving…' : 'Save & publish'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Metadata panel */}
        <div className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-5 flex flex-col gap-4 sticky top-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Metadata</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select value={type} onChange={e => setType(e.target.value as any)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="blog">Blog</option>
                <option value="projects">Projects</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Language</label>
              <select value={lang} onChange={e => setLang(e.target.value as any)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {[
            { label: 'Slug', value: slug, set: setSlug, placeholder: 'my-post-slug', hint: 'URL identifier, lowercase with dashes' },
            { label: 'Title', value: title, set: setTitle, placeholder: 'My awesome post' },
            { label: 'Date', value: date, set: setDate, placeholder: '2025-01-01' },
            { label: 'Summary', value: summary, set: setSummary, placeholder: 'Short description…' },
            { label: 'Image', value: image, set: setImage, placeholder: '/projects/my-image.png' },
            { label: 'Tags', value: tags, set: setTags, placeholder: 'React, TypeScript, Next.js' },
          ].map(({ label, value, set, placeholder, hint }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
              {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
            </div>
          ))}
        </div>

        {/* Markdown editor */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content (Markdown / MDX)</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your content here using Markdown or MDX…"
            className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur px-4 py-3 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60vh]"
          />
          <p className="text-xs text-muted-foreground">{body.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>
      </div>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>}>
      <NewPostForm />
    </Suspense>
  );
}

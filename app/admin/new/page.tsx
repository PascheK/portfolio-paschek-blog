'use client';

import { Suspense, useState, useRef, useTransition, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { savePostGitHub } from '@/app/actions/admin';
import { MarkdownToolbar } from '@/components/admin/markdown-toolbar';
import { MarkdownPreview } from '@/components/admin/markdown-preview';
import { ArrowLeft, Save, Languages, Eye, EyeOff, Clock, Maximize2, Minimize2 } from 'lucide-react';

const DRAFT_KEY = 'admin-new-draft';

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function buildFrontmatter(fields: Record<string, string>) {
  const lines = ['---'];
  for (const [key, val] of Object.entries(fields)) {
    if (val.trim()) lines.push(`${key}: ${val}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function buildTranslationStub(
  fields: { title: string; date: string; summary: string; image: string; tags: string },
  body: string,
  targetLang: 'en' | 'fr'
) {
  const prefix    = targetLang === 'fr' ? '[À traduire] ' : '[To translate] ';
  const stubNotice = targetLang === 'fr'
    ? '> ⚠️ Cet article n\'a pas encore été traduit.\n'
    : '> ⚠️ This article has not been translated yet.\n';
  const frontmatter = buildFrontmatter({ title: `${prefix}${fields.title}`, publishedAt: fields.date, summary: fields.summary ? `${prefix}${fields.summary}` : '', image: fields.image, tags: fields.tags });
  return frontmatter + stubNotice + '\n' + body;
}

function NewPostForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [type,          setType]          = useState<'blog' | 'projects'>((searchParams.get('type') as 'blog' | 'projects') ?? 'blog');
  const [lang,          setLang]          = useState<'en' | 'fr'>((searchParams.get('lang') as 'en' | 'fr') ?? 'en');
  const [slug,          setSlug]          = useState('');
  const [title,         setTitle]         = useState('');
  const [date,          setDate]          = useState(new Date().toISOString().split('T')[0]);
  const [summary,       setSummary]       = useState('');
  const [image,         setImage]         = useState('');
  const [tags,          setTags]          = useState('');
  const [body,          setBody]          = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [error,         setError]         = useState('');
  const [showPreview,   setShowPreview]   = useState(false);
  const [fullscreen,    setFullscreen]    = useState(false);
  const [lastSaved,     setLastSaved]     = useState<Date | null>(null);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.slug)    setSlug(d.slug);
        if (d.title)   setTitle(d.title);
        if (d.date)    setDate(d.date);
        if (d.summary) setSummary(d.summary);
        if (d.image)   setImage(d.image);
        if (d.tags)    setTags(d.tags);
        if (d.body)    setBody(d.body);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save draft every 20s
  useEffect(() => {
    const id = setInterval(() => {
      if (!slug && !title && !body) return;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ slug, title, date, summary, image, tags, body }));
      setLastSaved(new Date());
    }, 20000);
    return () => clearInterval(id);
  }, [slug, title, date, summary, image, tags, body]);

  const handleSave = useCallback(() => {
    if (!slug || !title) { setError('Slug and title are required.'); return; }
    const frontmatter = buildFrontmatter({ title, publishedAt: date, summary, image, tags });
    const fullContent = frontmatter + body;
    startTransition(async () => {
      const result = await savePostGitHub(type, lang, slug, fullContent);
      if (!result.ok) { setError(result.error ?? 'Failed to save.'); return; }
      if (autoTranslate) {
        const otherLang = lang === 'en' ? 'fr' : 'en';
        const stub = buildTranslationStub({ title, date, summary, image, tags }, body, otherLang);
        await savePostGitHub(type, otherLang, slug, stub);
      }
      localStorage.removeItem(DRAFT_KEY);
      router.push('/admin');
    });
  }, [slug, title, date, summary, image, tags, body, type, lang, autoTranslate, router, startTransition]);

  // Cmd+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes   = readingTime(body);

  return (
    <div className={`px-6 py-8 max-w-6xl mx-auto ${fullscreen ? 'fixed inset-0 z-50 bg-background overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">New post</h1>
          {lastSaved && (
            <p className="text-xs text-muted-foreground">
              Draft auto-saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowPreview(p => !p)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
              showPreview ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            Preview
          </button>
          <button
            onClick={() => setFullscreen(f => !f)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
            title="Toggle fullscreen"
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-60 transition-all"
          >
            <Save className="size-4" />
            {isPending ? 'Saving…' : 'Save'}
            <kbd className="hidden sm:inline-flex items-center text-[10px] opacity-70 ml-1">⌘S</kbd>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Metadata panel */}
        <div className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-5 flex flex-col gap-4 sticky top-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metadata</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select value={type} onChange={e => setType(e.target.value as 'blog' | 'projects')}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="blog">Blog</option>
                <option value="projects">Projects</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Language</label>
              <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'fr')}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="en">English 🇬🇧</option>
                <option value="fr">Français 🇫🇷</option>
              </select>
            </div>
          </div>

          {[
            { label: 'Slug', value: slug, set: setSlug, placeholder: 'my-post-slug', hint: 'URL identifier, lowercase with dashes' },
            { label: 'Title', value: title, set: setTitle, placeholder: 'My awesome post' },
            { label: 'Date', value: date, set: setDate, placeholder: '2025-01-01', type: 'date' },
            { label: 'Summary', value: summary, set: setSummary, placeholder: 'Short description…' },
            { label: 'Image', value: image, set: setImage, placeholder: '/projects/my-image.png' },
            { label: 'Tags', value: tags, set: setTags, placeholder: 'React, TypeScript, Next.js' },
          ].map(({ label, value, set, placeholder, hint, type: inputType }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                type={inputType ?? 'text'}
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
              {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
            </div>
          ))}

          {/* Auto-translate toggle */}
          <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-border bg-surface/60 px-3 py-2.5 hover:border-primary/30 transition-colors">
            <div className={`relative w-9 h-5 rounded-full transition-colors ${autoTranslate ? 'bg-primary' : 'bg-border'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoTranslate ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <div className="flex items-center gap-1.5">
              <Languages className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Auto-create {lang === 'en' ? 'FR 🇫🇷' : 'EN 🇬🇧'} stub
              </span>
            </div>
            <input type="checkbox" className="sr-only" checked={autoTranslate} onChange={e => setAutoTranslate(e.target.checked)} />
          </label>
        </div>

        {/* Editor + optional preview */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Content (Markdown / MDX)
            </label>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{wordCount} words</span>
              <span className="flex items-center gap-1"><Clock className="size-3" /> {minutes} min read</span>
            </div>
          </div>

          <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Editor */}
            <div className="flex flex-col">
              <MarkdownToolbar textareaRef={textareaRef} value={body} onChange={setBody} />
              <textarea
                ref={textareaRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your content here using Markdown or MDX…"
                className="rounded-b-2xl border border-t-0 border-border bg-surface-alt/60 backdrop-blur px-4 py-3 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60vh]"
              />
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur px-5 py-4 overflow-auto min-h-[60vh]">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
                <MarkdownPreview value={body} />
              </div>
            )}
          </div>
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

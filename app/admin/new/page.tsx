'use client';

import { Suspense, useState, useTransition, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { savePostGitHub } from '@/app/actions/admin';
import { MarkdownPreview } from '@/components/admin/markdown-preview';
import { BlockEditor } from '@/components/admin/block-editor';
import {
  ArrowLeft, Save, Languages, Eye, EyeOff, Clock, SlidersHorizontal,
  X, Check, AlertCircle, Hash, Calendar, Tag, ImageIcon, FileText,
} from 'lucide-react';

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
  const prefix = targetLang === 'fr' ? '[À traduire] ' : '[To translate] ';
  const stubNotice = targetLang === 'fr'
    ? '> ⚠️ Cet article n\'a pas encore été traduit.\n'
    : '> ⚠️ This article has not been translated yet.\n';
  const frontmatter = buildFrontmatter({
    title: `${prefix}${fields.title}`,
    publishedAt: fields.date,
    summary: fields.summary ? `${prefix}${fields.summary}` : '',
    image: fields.image,
    tags: fields.tags,
  });
  return frontmatter + stubNotice + '\n' + body;
}

function NewPostForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLTextAreaElement>(null);

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
  const [showMeta,      setShowMeta]      = useState(false);
  const [saveStatus,    setSaveStatus]    = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved,     setLastSaved]     = useState<Date | null>(null);
  const [slugManual,    setSlugManual]    = useState(false);

  // Auto-slug from title (unless manually edited)
  useEffect(() => {
    if (!slugManual && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60));
    }
  }, [title, slugManual]);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.slug)    { setSlug(d.slug); setSlugManual(true); }
        if (d.title)   setTitle(d.title);
        if (d.date)    setDate(d.date);
        if (d.summary) setSummary(d.summary);
        if (d.image)   setImage(d.image);
        if (d.tags)    setTags(d.tags);
        if (d.body)    setBody(d.body);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-size title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Auto-save every 20s
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
    setError('');
    setSaveStatus('saving');
    const frontmatter = buildFrontmatter({ title, publishedAt: date, summary, image, tags });
    const fullContent = frontmatter + body;
    startTransition(async () => {
      const result = await savePostGitHub(type, lang, slug, fullContent);
      if (!result.ok) { setError(result.error ?? 'Failed to save.'); setSaveStatus('idle'); return; }
      if (autoTranslate) {
        const otherLang = lang === 'en' ? 'fr' : 'en';
        await savePostGitHub(type, otherLang, slug, buildTranslationStub({ title, date, summary, image, tags }, body, otherLang));
      }
      localStorage.removeItem(DRAFT_KEY);
      setSaveStatus('saved');
      setTimeout(() => router.push('/admin'), 800);
    });
  }, [slug, title, date, summary, image, tags, body, type, lang, autoTranslate, router]);

  // Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes   = readingTime(body);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 0px)' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#0d1117] sticky top-0 z-20 shrink-0">
        <Link href="/admin" className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
          <ArrowLeft size={16} />
        </Link>

        {/* Type select */}
        <select value={type} onChange={(e) => setType(e.target.value as 'blog' | 'projects')}
          className="bg-white/[0.05] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/50 focus:outline-none cursor-pointer appearance-none hover:bg-white/[0.08] transition-all">
          <option value="blog">📝 Blog</option>
          <option value="projects">🚀 Projects</option>
        </select>

        {/* Lang select */}
        <select value={lang} onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
          className="bg-white/[0.05] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/50 focus:outline-none cursor-pointer appearance-none hover:bg-white/[0.08] transition-all">
          <option value="en">🇬🇧 EN</option>
          <option value="fr">🇫🇷 FR</option>
        </select>

        {/* Slug pill */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] min-w-0 max-w-[180px]">
          <Hash size={11} className="text-white/20 shrink-0" />
          <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
            placeholder="slug" className="bg-transparent text-xs font-mono text-white/45 focus:outline-none focus:text-white/70 w-full placeholder-white/15 min-w-0" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {lastSaved && (
            <span className="text-[11px] text-white/15 hidden lg:block mr-1">
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={() => setShowPreview((p) => !p)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showPreview ? 'bg-primary/15 text-primary border-primary/25' : 'text-white/35 hover:text-white/60 border-white/[0.07] hover:bg-white/[0.05]'
            }`}>
            {showPreview ? <EyeOff size={12} /> : <Eye size={12} />} Preview
          </button>
          <button onClick={() => setShowMeta((m) => !m)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showMeta ? 'bg-primary/15 text-primary border-primary/25' : 'text-white/35 hover:text-white/60 border-white/[0.07] hover:bg-white/[0.05]'
            }`}>
            <SlidersHorizontal size={12} /> Details
          </button>
          <button onClick={handleSave} disabled={isPending || saveStatus === 'saving'}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 ${
              saveStatus === 'saved'
                ? 'bg-green-500/20 text-green-400 border border-green-500/25'
                : 'bg-primary text-white hover:brightness-110'
            }`}>
            {saveStatus === 'saving' ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> :
             saveStatus === 'saved'  ? <Check size={12} /> : <Save size={12} />}
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Publish'}
            <kbd className="hidden lg:inline text-[9px] opacity-40">⌘S</kbd>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 shrink-0">
          <AlertCircle size={14} className="shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400/40 hover:text-red-400 transition-colors"><X size={13} /></button>
        </div>
      )}

      {/* ── Main writing area ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Writing column */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[740px] mx-auto px-10 pt-12 pb-40">

            {/* Big title input */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              rows={1}
              spellCheck
              className="w-full bg-transparent text-[2.5rem] font-bold text-white/90 placeholder-white/10 focus:outline-none resize-none leading-[1.2] mb-3 overflow-hidden"
            />

            {/* Summary/subtitle */}
            <input value={summary} onChange={(e) => setSummary(e.target.value)}
              placeholder="Add a short description…"
              className="w-full bg-transparent text-[1.05rem] text-white/30 placeholder-white/12 focus:outline-none mb-8 leading-relaxed focus:text-white/50 transition-colors" />

            {/* Metadata chips */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-8 border-b border-white/[0.05] mb-8">
              <label className="flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors cursor-pointer">
                <Calendar size={12} />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none cursor-pointer text-white/25 hover:text-white/50 transition-colors" />
              </label>
              <label className="flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors">
                <Tag size={12} />
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags…"
                  className="bg-transparent text-sm text-white/25 placeholder-white/12 focus:outline-none focus:text-white/50 transition-colors" />
              </label>
              <label className="flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors">
                <ImageIcon size={12} />
                <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Cover image…"
                  className="bg-transparent text-sm text-white/25 placeholder-white/12 focus:outline-none focus:text-white/50 transition-colors" />
              </label>
            </div>

            {/* Hint */}
            <p className="text-xs text-white/12 mb-6 select-none">
              Press{' '}
              <kbd className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-white/20 text-[11px]">/</kbd>
              {' '}in an empty block to insert headings, code, images and more
            </p>

            {/* THE EDITOR */}
            <BlockEditor initialMdx={body} onChange={setBody} />
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="hidden lg:flex flex-col w-[42%] border-l border-white/[0.05] overflow-y-auto">
            <div className="px-4 py-2 border-b border-white/[0.05] bg-[#0d1117] sticky top-0 z-10">
              <span className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Preview</span>
            </div>
            <div className="flex-1 px-10 py-12">
              <h1 className="text-3xl font-bold text-white/80 mb-4">{title || 'Untitled'}</h1>
              {summary && <p className="text-white/40 mb-8">{summary}</p>}
              <MarkdownPreview value={body} />
            </div>
          </div>
        )}

        {/* Details panel */}
        {showMeta && (
          <aside className="hidden lg:flex flex-col w-[260px] border-l border-white/[0.05] bg-[#0b0e16] shrink-0">
            <div className="px-4 py-2.5 border-b border-white/[0.05] sticky top-0 bg-[#0b0e16] z-10 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Details</span>
              <button onClick={() => setShowMeta(false)} className="text-white/20 hover:text-white/50 transition-colors"><X size={13} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Words', value: wordCount.toLocaleString() },
                  { label: 'Read', value: `${minutes} min` },
                  { label: 'Type', value: type },
                  { label: 'Lang', value: lang.toUpperCase() },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.05]">
                    <div className="text-[10px] text-white/20 uppercase tracking-wider">{s.label}</div>
                    <div className="text-sm font-semibold text-white/60 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Extra fields */}
              <div className="space-y-3">
                {[
                  { icon: <Hash size={12} />, label: 'Slug', value: slug, onChange: (v: string) => { setSlug(v); setSlugManual(true); }, placeholder: 'post-slug', mono: true },
                  { icon: <FileText size={12} />, label: 'Summary', value: summary, onChange: setSummary, placeholder: 'Short description…' },
                  { icon: <ImageIcon size={12} />, label: 'Cover', value: image, onChange: setImage, placeholder: '/projects/cover.png' },
                  { icon: <Tag size={12} />, label: 'Tags', value: tags, onChange: setTags, placeholder: 'React, Next.js…' },
                ].map(({ icon, label, value, onChange, placeholder, mono }) => (
                  <div key={label}>
                    <label className="text-[10px] text-white/20 uppercase tracking-wider font-semibold block mb-1">{label}</label>
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 focus-within:border-primary/30 transition-colors">
                      <span className="text-white/20 shrink-0">{icon}</span>
                      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                        className={`bg-transparent text-xs text-white/55 placeholder-white/15 focus:outline-none flex-1 ${mono ? 'font-mono' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto-translate */}
              <div>
                <label className="text-[10px] text-white/20 uppercase tracking-wider font-semibold block mb-1.5">Auto-translate</label>
                <label className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:border-primary/20 transition-colors">
                  <div>
                    <div className="text-xs font-medium text-white/50">Create {lang === 'en' ? 'FR 🇫🇷' : 'EN 🇬🇧'} stub</div>
                    <div className="text-[11px] text-white/20 mt-0.5">Placeholder translation</div>
                  </div>
                  <div onClick={() => setAutoTranslate((a) => !a)}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${autoTranslate ? 'bg-primary' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoTranslate ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-3 px-6 py-1 border-t border-white/[0.04] bg-[#0d1117] text-[11px] text-white/15 shrink-0">
        <span className="flex items-center gap-1"><Clock size={10} /> {minutes} min read</span>
        <span>·</span>
        <span>{wordCount} words</span>
        <span>·</span>
        <span>{type} / {lang.toUpperCase()}</span>
        {slug && <><span>·</span><span className="font-mono text-white/20">{slug}.mdx</span></>}
        {autoTranslate && <><span>·</span><span>Auto-translates to {lang === 'en' ? 'FR' : 'EN'}</span></>}
      </div>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewPostForm />
    </Suspense>
  );
}

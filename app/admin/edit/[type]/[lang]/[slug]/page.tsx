'use client';

import { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostGitHub, savePostGitHub, deletePostGitHub } from '@/app/actions/admin';
import { MarkdownPreview } from '@/components/admin/markdown-preview';
import { BlockEditor } from '@/components/admin/block-editor';
import {
  ArrowLeft, Save, Trash2, Eye, EyeOff, Clock, SlidersHorizontal,
  X, Check, AlertCircle, Hash, Calendar, Tag, ImageIcon, FileText,
} from 'lucide-react';

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function parseFrontmatterField(content: string, key: string): string {
  const match = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(content);
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\n?/, '').trimStart();
}

function buildFrontmatter(fields: Record<string, string>): string {
  const lines = ['---'];
  for (const [key, val] of Object.entries(fields)) {
    if (val.trim()) lines.push(`${key}: ${val}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

export default function EditPostPage() {
  const params  = useParams();
  const router  = useRouter();
  const type    = params.type as 'blog' | 'projects';
  const lang    = params.lang as 'en' | 'fr';
  const slug    = params.slug as string;
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const [isPending, startTransition] = useTransition();
  const [loading,     setLoading]     = useState(true);
  const [sha,         setSha]         = useState('');
  const [error,       setError]       = useState('');
  const [title,       setTitle]       = useState('');
  const [date,        setDate]        = useState('');
  const [summary,     setSummary]     = useState('');
  const [image,       setImage]       = useState('');
  const [tags,        setTags]        = useState('');
  const [body,        setBody]        = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showMeta,    setShowMeta]    = useState(false);
  const [saveStatus,  setSaveStatus]  = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showDelete,  setShowDelete]  = useState(false);

  // Load post
  useEffect(() => {
    getPostGitHub(type, lang, slug).then((data) => {
      if (!data) { setError('Post not found.'); setLoading(false); return; }
      setSha(data.sha);
      setTitle(parseFrontmatterField(data.content, 'title'));
      setDate(parseFrontmatterField(data.content, 'publishedAt') || parseFrontmatterField(data.content, 'date'));
      setSummary(parseFrontmatterField(data.content, 'summary'));
      setImage(parseFrontmatterField(data.content, 'image'));
      setTags(parseFrontmatterField(data.content, 'tags'));
      setBody(stripFrontmatter(data.content));
      setLoading(false);
    });
  }, [type, lang, slug]);

  // Auto-size title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  const handleSave = useCallback(() => {
    const frontmatter = buildFrontmatter({ title, publishedAt: date, summary, image, tags });
    const fullContent = frontmatter + body;
    setSaveStatus('saving');
    startTransition(async () => {
      const result = await savePostGitHub(type, lang, slug, fullContent, sha);
      if (result.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setError(result.error ?? 'Failed to save.');
        setSaveStatus('idle');
      }
    });
  }, [title, date, summary, image, tags, body, type, lang, slug, sha]);

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      const result = await deletePostGitHub(type, lang, slug, sha);
      if (result.ok) router.push('/admin');
      else setError(result.error ?? 'Failed to delete.');
    });
  }, [type, lang, slug, sha, router]);

  // Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-6 h-6 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          <p className="text-sm">Loading post…</p>
        </div>
      </div>
    );
  }

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes   = readingTime(body);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 0px)' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#0d1117] sticky top-0 z-20 shrink-0">
        <Link href="/admin" className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
          <ArrowLeft size={16} />
        </Link>

        {/* File path */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-white/25 min-w-0">
          <span className="truncate">{type}/{lang}/</span>
          <span className="text-white/45 font-semibold truncate">{slug}.mdx</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
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
          <button onClick={() => setShowDelete(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 transition-all">
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={handleSave} disabled={isPending || saveStatus === 'saving'}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 ${
              saveStatus === 'saved'
                ? 'bg-green-500/20 text-green-400 border border-green-500/25'
                : 'bg-primary text-white hover:brightness-110'
            }`}>
            {saveStatus === 'saving' ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> :
             saveStatus === 'saved'  ? <Check size={12} /> : <Save size={12} />}
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
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

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#13161f] border border-white/[0.09] rounded-2xl shadow-2xl p-6 w-80">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h2 className="font-bold text-white mb-1">Delete this post?</h2>
            <p className="text-sm text-white/40 mb-6">
              <span className="font-mono text-white/60">{slug}.mdx</span> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white/50 bg-white/[0.05] hover:bg-white/[0.09] transition-colors">
                Cancel
              </button>
              <button onClick={() => { setShowDelete(false); handleDelete(); }}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Writing column */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[740px] mx-auto px-10 pt-12 pb-40">

            {/* Big title */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              rows={1}
              spellCheck
              className="w-full bg-transparent text-[2.5rem] font-bold text-white/90 placeholder-white/10 focus:outline-none resize-none leading-[1.2] mb-3 overflow-hidden"
            />

            {/* Summary */}
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

            {/* Block editor */}
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

              {/* Fields */}
              <div className="space-y-3">
                {[
                  { icon: <FileText size={12} />, label: 'Summary', value: summary, set: setSummary, placeholder: 'Short description…' },
                  { icon: <ImageIcon size={12} />, label: 'Cover', value: image, set: setImage, placeholder: '/projects/cover.png' },
                  { icon: <Tag size={12} />, label: 'Tags', value: tags, set: setTags, placeholder: 'React, Next.js…' },
                ].map(({ icon, label, value, set, placeholder }) => (
                  <div key={label}>
                    <label className="text-[10px] text-white/20 uppercase tracking-wider font-semibold block mb-1">{label}</label>
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 focus-within:border-primary/30 transition-colors">
                      <span className="text-white/20 shrink-0">{icon}</span>
                      <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                        className="bg-transparent text-xs text-white/55 placeholder-white/15 focus:outline-none flex-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Danger zone */}
              <div className="border-t border-white/[0.05] pt-4">
                <label className="text-[10px] text-red-400/40 uppercase tracking-wider font-semibold block mb-2">Danger zone</label>
                <button onClick={() => setShowDelete(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all">
                  <Trash2 size={13} /> Delete this post
                </button>
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
        <span>·</span>
        <span className="font-mono text-white/20">{slug}.mdx</span>
      </div>
    </div>
  );
}

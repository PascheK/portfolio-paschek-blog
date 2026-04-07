'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostGitHub, savePostGitHub, deletePostGitHub } from '@/app/actions/admin';
import { MarkdownToolbar } from '@/components/admin/markdown-toolbar';
import { MarkdownPreview } from '@/components/admin/markdown-preview';
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Clock, Maximize2, Minimize2 } from 'lucide-react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isPending, startTransition] = useTransition();
  const [loading,   setLoading]      = useState(true);
  const [sha,       setSha]          = useState('');
  const [error,     setError]        = useState('');
  const [title,     setTitle]        = useState('');
  const [date,      setDate]         = useState('');
  const [summary,   setSummary]      = useState('');
  const [image,     setImage]        = useState('');
  const [tags,      setTags]         = useState('');
  const [body,      setBody]         = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreen,  setFullscreen]  = useState(false);
  const [saveStatus,  setSaveStatus]  = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    getPostGitHub(type, lang, slug).then(data => {
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

  const handleSave = useCallback(() => {
    const frontmatter = buildFrontmatter({ title, publishedAt: date, summary, image, tags });
    const fullContent = frontmatter + body;
    setSaveStatus('saving');
    startTransition(async () => {
      const result = await savePostGitHub(type, lang, slug, fullContent, sha);
      if (result.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
        router.push('/admin');
      } else {
        setError(result.error ?? 'Failed to save.');
        setSaveStatus('idle');
      }
    });
  }, [title, date, summary, image, tags, body, type, lang, slug, sha, router, startTransition]);

  const handleDelete = () => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deletePostGitHub(type, lang, slug, sha);
      if (result.ok) router.push('/admin');
      else setError(result.error ?? 'Failed to delete.');
    });
  };

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
    <div className={`px-6 py-8 max-w-6xl mx-auto ${fullscreen ? 'fixed inset-0 z-50 bg-background overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Edit post</h1>
          <p className="text-xs text-muted-foreground font-mono">{type}/{lang}/{slug}.mdx</p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
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
            className="inline-flex items-center px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 disabled:opacity-60 transition-all"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 transition-all ${
              saveStatus === 'saved'
                ? 'bg-emerald-500 text-white'
                : 'bg-primary text-primary-foreground hover:brightness-110'
            }`}
          >
            <Save className="size-4" />
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : 'Save'}
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
        {/* Metadata */}
        <div className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-5 flex flex-col gap-4 sticky top-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metadata</h2>
          {[
            { label: 'Title',   value: title,   set: setTitle,   placeholder: 'Post title' },
            { label: 'Date',    value: date,    set: setDate,    placeholder: '2025-01-01', type: 'date' },
            { label: 'Summary', value: summary, set: setSummary, placeholder: 'Short description…' },
            { label: 'Image',   value: image,   set: setImage,   placeholder: '/projects/image.png' },
            { label: 'Tags',    value: tags,    set: setTags,    placeholder: 'React, TypeScript' },
          ].map(({ label, value, set, placeholder, type: inputType }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                type={inputType ?? 'text'}
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
            </div>
          ))}
        </div>

        {/* Editor + preview */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{wordCount} words</span>
              <span className="flex items-center gap-1"><Clock className="size-3" /> {minutes} min read</span>
            </div>
          </div>

          <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="flex flex-col">
              <MarkdownToolbar textareaRef={textareaRef} value={body} onChange={setBody} />
              <textarea
                ref={textareaRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                className="rounded-b-2xl border border-t-0 border-border bg-surface-alt/60 backdrop-blur px-4 py-3 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60vh]"
                placeholder="Write your content here…"
              />
            </div>

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

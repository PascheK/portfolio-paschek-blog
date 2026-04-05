'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostGitHub, savePostGitHub, deletePostGitHub } from '@/app/actions/admin';
import { MarkdownToolbar } from '@/components/admin/markdown-toolbar';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

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
  const params = useParams();
  const router = useRouter();
  const type = params.type as 'blog' | 'projects';
  const lang = params.lang as 'en' | 'fr';
  const slug = params.slug as string;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [sha, setSha] = useState('');
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');
  const [body, setBody] = useState('');

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

  const handleSave = () => {
    const frontmatter = buildFrontmatter({ title, publishedAt: date, summary, image, tags });
    const fullContent = frontmatter + body;
    startTransition(async () => {
      const result = await savePostGitHub(type, lang, slug, fullContent, sha);
      if (result.ok) {
        router.push('/admin');
      } else {
        setError(result.error ?? 'Failed to save.');
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deletePostGitHub(type, lang, slug, sha);
      if (result.ok) {
        router.push('/admin');
      } else {
        setError(result.error ?? 'Failed to delete.');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Edit post</h1>
          <p className="text-xs text-muted-foreground">{type}/{lang}/{slug}.mdx</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-60 transition-all"
          >
            <Save className="size-4" />
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Metadata */}
        <div className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-5 flex flex-col gap-4 sticky top-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Metadata</h2>
          {[
            { label: 'Title', value: title, set: setTitle, placeholder: 'Post title' },
            { label: 'Date', value: date, set: setDate, placeholder: '2025-01-01' },
            { label: 'Summary', value: summary, set: setSummary, placeholder: 'Short description…' },
            { label: 'Image', value: image, set: setImage, placeholder: '/projects/image.png' },
            { label: 'Tags', value: tags, set: setTags, placeholder: 'React, TypeScript' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Content (Markdown / MDX)
          </label>
          <MarkdownToolbar textareaRef={textareaRef} value={body} onChange={setBody} />
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="rounded-b-2xl border border-border bg-surface-alt/60 backdrop-blur px-4 py-3 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60vh]"
          />
          <p className="text-xs text-muted-foreground mt-1.5">{wordCount} words</p>
        </div>
      </div>
    </div>
  );
}

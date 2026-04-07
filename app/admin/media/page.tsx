'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, Copy, Check, Trash2,
  Image as ImageIcon, FolderOpen, Info,
} from 'lucide-react';
import { listImagesGitHub, uploadImageGitHub, deleteImageGitHub } from '@/app/actions/admin';

type Folder = 'blogs' | 'projects';
type ImageItem = { name: string; path: string; sha: string; url: string; previewUrl: string };

export default function MediaPage() {
  const [folder, setFolder] = useState<Folder>('blogs');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async (f: Folder) => {
    setLoading(true);
    const imgs = await listImagesGitHub(f);
    setImages(imgs);
    setLoading(false);
  };

  useEffect(() => { loadImages(folder); }, [folder]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      const filename = file.name.replace(/\s+/g, '-').toLowerCase();

      const result = await uploadImageGitHub(folder, filename, base64);
      if (result.ok) {
        await loadImages(folder);
      } else {
        setError(result.error ?? 'Upload failed.');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = (img: ImageItem) => {
    if (!confirm(`Delete "${img.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteImageGitHub(folder, img.name, img.sha);
      if (result.ok) {
        setImages(prev => prev.filter(i => i.name !== img.name));
      } else {
        setError(result.error ?? 'Delete failed.');
      }
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-bold">Media Library</h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-60 transition-all"
          >
            <Upload className="size-4" />
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-400">
        <Info className="size-4 shrink-0 mt-0.5" />
        <span>
          Images are stored in <code className="font-mono text-xs bg-blue-500/10 px-1 rounded">public/{folder}/</code> on GitHub.
          After upload, a Vercel redeploy is triggered automatically — the image will be live in ~1 min.
          Copy the URL and paste it in your post&apos;s <code className="font-mono text-xs bg-blue-500/10 px-1 rounded">image</code> field.
        </span>
      </div>

      {/* Folder tabs */}
      <div className="flex gap-2 mb-6">
        {(['blogs', 'projects'] as Folder[]).map(f => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              folder === f
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            {f === 'blogs' ? '📝 Blog' : '🗂️ Projects'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          Loading…
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <FolderOpen className="size-10 opacity-30" />
          <p className="text-sm">No images in this folder yet.</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-primary hover:underline"
          >
            Upload the first image →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map(img => (
            <div
              key={img.sha}
              className="rounded-2xl border border-border bg-surface-alt/60 overflow-hidden hover:border-primary/30 transition-colors"
            >
              {/* Preview */}
              <div className="aspect-video bg-surface flex items-center justify-center overflow-hidden">
                {img.previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="flex items-center justify-center w-full h-full opacity-20"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                    }}
                  />
                ) : (
                  <ImageIcon className="size-8 opacity-20" />
                )}
              </div>

              {/* Info + actions */}
              <div className="px-3 py-2.5">
                <p className="text-xs font-mono text-muted-foreground truncate mb-2" title={img.name}>
                  {img.name}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => copyUrl(img.url)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface text-xs text-muted-foreground hover:text-foreground border border-border transition-colors"
                    title={`Copy: ${img.url}`}
                  >
                    {copied === img.url
                      ? <><Check className="size-3 text-green-500" /> Copied</>
                      : <><Copy className="size-3" /> Copy URL</>
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    title="Delete image"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

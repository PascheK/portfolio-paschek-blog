import React from 'react';
import Link from 'next/link';
import { listPostsGitHub } from '@/app/actions/admin';
import { PenSquare, Image, FileText, Globe, AlertTriangle, TrendingUp, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function fetchPostsWithFallback(type: 'blog' | 'projects', lang: 'en' | 'fr') {
  try { return await listPostsGitHub(type, lang); }
  catch { return []; }
}

export default async function AdminDashboard() {
  const [blogEn, blogFr, projectsEn, projectsFr] = await Promise.all([
    fetchPostsWithFallback('blog', 'en'),
    fetchPostsWithFallback('blog', 'fr'),
    fetchPostsWithFallback('projects', 'en'),
    fetchPostsWithFallback('projects', 'fr'),
  ]);

  const blogEnSlugs    = new Set(blogEn.map((p) => p.slug));
  const blogFrSlugs    = new Set(blogFr.map((p) => p.slug));
  const projectEnSlugs = new Set(projectsEn.map((p) => p.slug));
  const projectFrSlugs = new Set(projectsFr.map((p) => p.slug));

  const missingBlogFr     = blogEn.filter((p) => !blogFrSlugs.has(p.slug));
  const missingBlogEn     = blogFr.filter((p) => !blogEnSlugs.has(p.slug));
  const missingProjectsFr = projectsEn.filter((p) => !projectFrSlugs.has(p.slug));
  const missingProjectsEn = projectsFr.filter((p) => !projectEnSlugs.has(p.slug));
  const totalMissing = missingBlogFr.length + missingBlogEn.length + missingProjectsFr.length + missingProjectsEn.length;

  const githubConfigured = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

  const stats = [
    { label: 'Blog posts',    value: blogEn.length,      icon: <FileText size={20} />,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    { label: 'Projects',      value: projectsEn.length,  icon: <TrendingUp size={20} />,    color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'FR translated', value: blogFr.length + projectsFr.length, icon: <Globe size={20} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Missing i18n',  value: totalMissing,       icon: <AlertTriangle size={20} />, color: totalMissing > 0 ? 'text-yellow-400' : 'text-green-400', bg: totalMissing > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10', border: totalMissing > 0 ? 'border-yellow-500/20' : 'border-green-500/20' },
  ];

  const quickActions = [
    { href: '/admin/new',      label: 'New post',      icon: <PenSquare size={16} />, color: 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20' },
    { href: '/admin/media',    label: 'Media library', icon: <Image size={16} />,     color: 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10' },
    { href: '/admin/settings', label: 'Settings',      icon: <Settings size={16} />,  color: 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your portfolio content</p>
      </div>

      {/* GitHub warning */}
      {!githubConfigured && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">GitHub not configured</div>
            <div className="text-xs text-yellow-300/70 mt-0.5">
              Set <code className="bg-yellow-500/20 px-1 rounded">GITHUB_TOKEN</code> and <code className="bg-yellow-500/20 px-1 rounded">GITHUB_REPO</code> to enable saving.
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${a.color}`}>
              {a.icon}
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content overview - 2x2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'Blog EN',      posts: blogEn,      type: 'blog'     as const, lang: 'en' as const, flag: '🇬🇧', missing: missingBlogFr },
          { title: 'Blog FR',      posts: blogFr,      type: 'blog'     as const, lang: 'fr' as const, flag: '🇫🇷', missing: missingBlogEn },
          { title: 'Projects EN',  posts: projectsEn,  type: 'projects' as const, lang: 'en' as const, flag: '🇬🇧', missing: missingProjectsFr },
          { title: 'Projects FR',  posts: projectsFr,  type: 'projects' as const, lang: 'fr' as const, flag: '🇫🇷', missing: missingProjectsEn },
        ].map((section) => (
          <div key={section.title} className="rounded-xl border border-border bg-surface/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-surface-alt/30">
              <div className="flex items-center gap-2">
                <span>{section.flag}</span>
                <span className="font-semibold text-sm">{section.title}</span>
                <span className="text-xs bg-white/10 text-muted-foreground px-1.5 py-0.5 rounded-full">{section.posts.length}</span>
              </div>
              <Link href="/admin/new" className="text-xs text-primary hover:text-primary/80 transition-colors">+ New</Link>
            </div>
            <div className="divide-y divide-border/30 max-h-64 overflow-y-auto">
              {section.posts.length === 0 ? (
                <div className="px-4 py-6 text-center text-muted-foreground text-sm">No posts yet</div>
              ) : (
                section.posts.map((post) => {
                  const hasMissingTranslation = section.missing.some((m) => m.slug === post.slug);
                  return (
                    <Link
                      key={post.slug}
                      href={`/admin/edit/${section.type}/${section.lang}/${post.slug}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={13} className="text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors truncate">{post.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasMissingTranslation && (
                          <span title="Missing translation" className="text-yellow-400/70">
                            <AlertTriangle size={13} />
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          edit →
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Translation health */}
      {totalMissing > 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="font-semibold text-sm text-yellow-300">{totalMissing} missing translation{totalMissing > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1">
            {[
              ...missingBlogFr.map((p) => ({ ...p, note: 'Blog → needs FR' })),
              ...missingBlogEn.map((p) => ({ ...p, note: 'Blog → needs EN' })),
              ...missingProjectsFr.map((p) => ({ ...p, note: 'Projects → needs FR' })),
              ...missingProjectsEn.map((p) => ({ ...p, note: 'Projects → needs EN' })),
            ].map((p) => (
              <div key={`${p.slug}-${p.note}`} className="flex items-center justify-between text-sm">
                <span className="font-mono text-yellow-300/70">{p.slug}</span>
                <span className="text-yellow-400/50 text-xs">{p.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

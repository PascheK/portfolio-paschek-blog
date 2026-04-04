import Link from "next/link";
import { listPostsGitHub, logoutAdmin } from "@/app/actions/admin";
import { FilePlus, LogOut, Pencil, FileText } from "lucide-react";
import { metaData } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [blogEn, blogFr, projEn, projFr] = await Promise.all([
    listPostsGitHub('blog', 'en'),
    listPostsGitHub('blog', 'fr'),
    listPostsGitHub('projects', 'en'),
    listPostsGitHub('projects', 'fr'),
  ]);

  const sections = [
    { label: 'Blog — EN', type: 'blog' as const, lang: 'en' as const, posts: blogEn },
    { label: 'Blog — FR', type: 'blog' as const, lang: 'fr' as const, posts: blogFr },
    { label: 'Projects — EN', type: 'projects' as const, lang: 'en' as const, posts: projEn },
    { label: 'Projects — FR', type: 'projects' as const, lang: 'fr' as const, posts: projFr },
  ];

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{metaData.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all"
          >
            <FilePlus className="size-4" />
            New post
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface-alt text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(({ label, type, lang, posts }) => (
          <div key={`${type}-${lang}`} className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{label}</h2>
              <Link
                href={`/admin/new?type=${type}&lang=${lang}`}
                className="text-xs text-primary hover:underline"
              >
                + New
              </Link>
            </div>

            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No posts yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/admin/edit/${type}/${lang}/${post.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <FileText className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                        {post.slug}
                      </span>
                      <Pencil className="size-3.5 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Config hint */}
      {!process.env.GITHUB_TOKEN && (
        <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 flex flex-col gap-1">
          <span>⚠️ <strong>GITHUB_TOKEN</strong> is not configured — saving posts will not work.</span>
          <span className="text-xs opacity-80">Add <code className="font-mono bg-yellow-500/10 px-1 rounded">GITHUB_TOKEN</code>, <code className="font-mono bg-yellow-500/10 px-1 rounded">GITHUB_REPO</code>, <code className="font-mono bg-yellow-500/10 px-1 rounded">ADMIN_PASSWORD</code> and <code className="font-mono bg-yellow-500/10 px-1 rounded">ADMIN_TOKEN_HASH</code> to your environment variables.</span>
        </div>
      )}
    </div>
  );
}

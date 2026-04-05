'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash } from 'crypto';

// ── Helpers ──────────────────────────────────────────────────────────────────

function hashPassword(pw: string) {
  return createHash('sha256').update(pw + (process.env.ADMIN_SECRET ?? 'portfolio-secret')).digest('hex');
}

function getExpectedTokenHash() {
  if (process.env.ADMIN_TOKEN_HASH) return process.env.ADMIN_TOKEN_HASH;
  if (process.env.ADMIN_PASSWORD) return hashPassword(process.env.ADMIN_PASSWORD);
  return '';
}

async function assertAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const expected = getExpectedTokenHash();
  if (!token || !expected || token !== expected) {
    redirect('/admin/login');
  }
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function normalizeRepo(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // Accept owner/repo, https://github.com/owner/repo(.git), or git@github.com:owner/repo.git
  const withoutProtocol = trimmed
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/^git@github\.com:/i, '')
    .replace(/\.git$/i, '');

  const parts = withoutProtocol.split('/').filter(Boolean);
  if (parts.length < 2) return '';
  return `${parts[0]}/${parts[1]}`;
}

function encodePath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildContentsUrl(path: string) {
  const encodedPath = encodePath(path);
  const ref = encodeURIComponent(BRANCH);
  return `https://api.github.com/repos/${REPO}/contents/${encodedPath}?ref=${ref}`;
}

type RepoInfo = { fullName: string; defaultBranch: string };
let resolvedRepoInfoPromise: Promise<RepoInfo | null> | null = null;

async function resolveRepoInfo(): Promise<RepoInfo | null> {
  if (resolvedRepoInfoPromise) return resolvedRepoInfoPromise;

  resolvedRepoInfoPromise = (async () => {
    if (!REPO) return null;

    const direct = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: githubHeaders(),
      cache: 'no-store',
    });

    if (direct.ok) {
      const data = await direct.json();
      return {
        fullName: data.full_name ?? REPO,
        defaultBranch: data.default_branch ?? 'main',
      };
    }

    const repoName = REPO.split('/')[1]?.toLowerCase();
    if (!repoName) return null;

    const repos = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: githubHeaders(),
      cache: 'no-store',
    });

    if (!repos.ok) return null;
    const list: any[] = await repos.json();
    const match = list.find((r) => String(r?.name ?? '').toLowerCase() === repoName);
    if (!match?.full_name) return null;

    console.warn('[admin] GITHUB_REPO owner mismatch, using discovered repo', {
      configured: REPO,
      discovered: match.full_name,
    });

    return {
      fullName: match.full_name,
      defaultBranch: match.default_branch ?? 'main',
    };
  })();

  return resolvedRepoInfoPromise;
}

function buildContentsUrlFor(repo: string, path: string, branch: string) {
  const encodedPath = encodePath(path);
  const ref = encodeURIComponent(branch);
  return `https://api.github.com/repos/${repo}/contents/${encodedPath}?ref=${ref}`;
}

const REPO = normalizeRepo(process.env.GITHUB_REPO ?? '');
const BRANCH = (process.env.GITHUB_BRANCH ?? 'main').trim().replace(/^refs\/heads\//, '');

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginAdmin(prevState: { error?: string; ok?: boolean }, formData: FormData) {
  const password = formData.get('password')?.toString() ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  if (!password || password !== adminPassword) {
    return { error: 'Incorrect password.' };
  }

  const token = getExpectedTokenHash();
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { ok: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin/login');
}

// ── GitHub API helpers ────────────────────────────────────────────────────────

export async function listPostsGitHub(type: 'blog' | 'projects', lang: 'en' | 'fr') {
  await assertAdmin();
  if (!REPO) return [];

  const repoInfo = await resolveRepoInfo();
  if (!repoInfo?.fullName) return [];
  const repo = repoInfo.fullName;
  const branch = BRANCH || repoInfo.defaultBranch || 'main';

  const path = `content/${type}/${lang}`;
  const url = buildContentsUrlFor(repo, path, branch);
  const res = await fetch(url, { headers: githubHeaders(), cache: 'no-store' });
  if (!res.ok) {
    const details = await res.text();
    console.error('[admin] listPostsGitHub failed', {
      status: res.status,
      repo,
      branch,
      path,
      details,
    });
    return [];
  }

  const files: any = await res.json();
  if (!Array.isArray(files)) {
    console.error('[admin] listPostsGitHub unexpected payload', { repo, branch, path });
    return [];
  }

  return files
    .filter((f) => f.name.endsWith('.mdx'))
    .map((f) => ({ name: f.name, slug: f.name.replace('.mdx', ''), sha: f.sha, path: f.path }));
}

export async function getPostGitHub(type: 'blog' | 'projects', lang: 'en' | 'fr', slug: string) {
  await assertAdmin();
  if (!REPO) return null;

  const repoInfo = await resolveRepoInfo();
  if (!repoInfo?.fullName) return null;
  const repo = repoInfo.fullName;
  const branch = BRANCH || repoInfo.defaultBranch || 'main';

  const path = `content/${type}/${lang}/${slug}.mdx`;
  const url = buildContentsUrlFor(repo, path, branch);
  const res = await fetch(url, { headers: githubHeaders(), cache: 'no-store' });
  if (!res.ok) {
    const details = await res.text();
    console.error('[admin] getPostGitHub failed', {
      status: res.status,
      repo,
      branch,
      path,
      details,
    });
    return null;
  }
  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha, path: data.path };
}

export async function savePostGitHub(
  type: 'blog' | 'projects',
  lang: 'en' | 'fr',
  slug: string,
  content: string,
  sha?: string
) {
  await assertAdmin();
  if (!REPO) return { ok: false, error: 'GITHUB_REPO not configured.' };

  const repoInfo = await resolveRepoInfo();
  if (!repoInfo?.fullName) return { ok: false, error: `Repository not found for GITHUB_REPO=${REPO}` };
  const repo = repoInfo.fullName;
  const branch = BRANCH || repoInfo.defaultBranch || 'main';

  const path = `content/${type}/${lang}/${slug}.mdx`;
  const url = `https://api.github.com/repos/${repo}/contents/${encodePath(path)}`;
  const body: Record<string, string> = {
    message: sha ? `docs: update ${type}/${lang}/${slug}` : `docs: add ${type}/${lang}/${slug}`,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: err };
  }
  return { ok: true };
}

export async function deletePostGitHub(
  type: 'blog' | 'projects',
  lang: 'en' | 'fr',
  slug: string,
  sha: string
) {
  await assertAdmin();
  if (!REPO) return { ok: false, error: 'GITHUB_REPO not configured.' };

  const repoInfo = await resolveRepoInfo();
  if (!repoInfo?.fullName) return { ok: false, error: `Repository not found for GITHUB_REPO=${REPO}` };
  const repo = repoInfo.fullName;
  const branch = BRANCH || repoInfo.defaultBranch || 'main';

  const path = `content/${type}/${lang}/${slug}.mdx`;
  const url = `https://api.github.com/repos/${repo}/contents/${encodePath(path)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: githubHeaders(),
    body: JSON.stringify({
      message: `docs: delete ${type}/${lang}/${slug}`,
      sha,
      branch,
    }),
  });
  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}

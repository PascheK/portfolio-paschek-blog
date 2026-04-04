'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash } from 'crypto';

// ── Helpers ──────────────────────────────────────────────────────────────────

function hashPassword(pw: string) {
  return createHash('sha256').update(pw + (process.env.ADMIN_SECRET ?? 'portfolio-secret')).digest('hex');
}

async function assertAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const expected = process.env.ADMIN_TOKEN_HASH;
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

const REPO = process.env.GITHUB_REPO ?? '';
const BRANCH = process.env.GITHUB_BRANCH ?? 'main';

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginAdmin(prevState: { error?: string }, formData: FormData) {
  const password = formData.get('password')?.toString() ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';

  if (!password || password !== adminPassword) {
    return { error: 'Incorrect password.' };
  }

  const token = hashPassword(adminPassword);
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/admin');
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

  const path = `content/${type}/${lang}`;
  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: githubHeaders(), cache: 'no-store' });
  if (!res.ok) return [];
  const files: any[] = await res.json();
  return files
    .filter((f) => f.name.endsWith('.mdx'))
    .map((f) => ({ name: f.name, slug: f.name.replace('.mdx', ''), sha: f.sha, path: f.path }));
}

export async function getPostGitHub(type: 'blog' | 'projects', lang: 'en' | 'fr', slug: string) {
  await assertAdmin();
  if (!REPO) return null;

  const path = `content/${type}/${lang}/${slug}.mdx`;
  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: githubHeaders(), cache: 'no-store' });
  if (!res.ok) return null;
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

  const path = `content/${type}/${lang}/${slug}.mdx`;
  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const body: Record<string, string> = {
    message: sha ? `docs: update ${type}/${lang}/${slug}` : `docs: add ${type}/${lang}/${slug}`,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
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

  const path = `content/${type}/${lang}/${slug}.mdx`;
  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: githubHeaders(),
    body: JSON.stringify({
      message: `docs: delete ${type}/${lang}/${slug}`,
      sha,
      branch: BRANCH,
    }),
  });
  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}

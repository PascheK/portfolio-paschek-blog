import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['en', 'fr'] as const;
const defaultLocale = 'en';

function getPreferredLocale(request: Request) {
  const negotiator = new Negotiator({
    headers: { 'accept-language': request.headers.get('accept-language') || '' }
  });
  const languages = negotiator.languages();
  return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // ── Admin route protection ──────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Let /admin/login pass through without a token check
    if (!pathname.startsWith('/admin/login')) {
      const token = request.cookies.get('admin_token')?.value;
      const expected = process.env.ADMIN_TOKEN_HASH;
      if (!token || (expected && token !== expected)) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    // Don't apply i18n to admin routes
    return NextResponse.next();
  }

  // ── i18n routing ─────────────────────────────────────────────────────
  // Ignore Next internals, API & static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.[\w]+$/.test(pathname)
  ) {
    return;
  }

  // Already has a locale prefix?
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return;

  // Redirect to preferred locale
  const locale = getPreferredLocale(request);
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = { matcher: '/:path*' };

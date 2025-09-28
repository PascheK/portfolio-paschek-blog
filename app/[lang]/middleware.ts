import { NextResponse } from 'next/server';
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

export function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  // Ignore Next internals, API & fichiers statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.[\w]+$/.test(pathname)
  ) {
    return;
  }

  // L'URL a-t-elle déjà une locale ?
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return;

  // Sinon, redirige vers la meilleure locale
  const locale = getPreferredLocale(request);
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = { matcher: '/:path*' };
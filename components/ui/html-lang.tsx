'use client';

import { useEffect } from 'react';

/** Sets document.documentElement.lang from a server-provided value without needing html tag in nested layouts. */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}

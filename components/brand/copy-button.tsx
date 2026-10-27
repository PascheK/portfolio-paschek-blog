'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** Copies a value and confirms in place (icon + mono label, announced politely). */
export function CopyButton({
  value,
  label,
  copyText,
  copiedText,
}: {
  value: string;
  label: string;
  copyText: string;
  copiedText: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the mailto/tel link still works */
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-150 hover:bg-surface-muted hover:text-foreground"
    >
      {copied ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span className="hidden sm:inline">{copied ? copiedText : copyText}</span>
      <span className="sr-only" role="status">{copied ? copiedText : ''}</span>
    </button>
  );
}

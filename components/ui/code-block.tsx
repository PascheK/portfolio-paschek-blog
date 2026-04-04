'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }>;
    if (el.props.dangerouslySetInnerHTML) {
      // strip HTML tags from highlighted code
      return el.props.dangerouslySetInnerHTML.__html.replace(/<[^>]*>/g, '');
    }
    return extractText(el.props.children);
  }
  return '';
}

export function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = extractText(children);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group">
      <pre {...props}>{children}</pre>
      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied!' : 'Copy code'}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg border border-border bg-surface-alt/90 backdrop-blur text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all focus-visible:opacity-100"
      >
        {copied
          ? <Check className="size-3.5 text-emerald-400" />
          : <Copy className="size-3.5" />
        }
      </button>
    </div>
  );
}

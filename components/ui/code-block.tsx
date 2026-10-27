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
        className="absolute right-2.5 top-2.5 inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground opacity-0 transition-colors duration-150 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied
          ? <Check className="size-3.5 text-success" />
          : <Copy className="size-3.5" />
        }
      </button>
    </div>
  );
}

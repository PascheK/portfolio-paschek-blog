'use client';

import React from 'react';

// Very lightweight markdown → HTML (no deps, handles common MDX patterns)
function toHtml(md: string): string {
  let s = md
    // Strip frontmatter
    .replace(/^---[\s\S]*?---\n?/, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="preview-pre"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="preview-code">$1</code>')
    // Images (before links)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="preview-img" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="preview-link" target="_blank" rel="noreferrer">$1</a>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="preview-h3">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="preview-h2">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 class="preview-h1">$1</h1>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/__(.+?)__/g,         '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,       '<em>$1</em>')
    .replace(/_([^_]+)_/g,         '<em>$1</em>')
    // Blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote class="preview-blockquote">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="preview-hr" />')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="preview-li">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="preview-li list-decimal">$1</li>')
    // Paragraphs (double newline)
    .split(/\n{2,}/)
    .map(block => {
      if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<hr') || block.startsWith('<blockquote') || block.startsWith('<li')) return block;
      if (!block.trim()) return '';
      return `<p class="preview-p">${block.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return s;
}

export function MarkdownPreview({ value }: { value: string }) {
  const html = React.useMemo(() => toHtml(value), [value]);

  return (
    <>
      <style>{`
        .preview-h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .preview-h2 { font-size: 1.25rem; font-weight: 600; margin: 0.9rem 0 0.4rem; }
        .preview-h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.35rem; }
        .preview-p  { margin: 0.6rem 0; line-height: 1.65; }
        .preview-pre { background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: 0.5rem; padding: 0.75rem 1rem; overflow-x: auto; margin: 0.75rem 0; font-size: 0.8rem; }
        .preview-code { background: var(--color-surface-muted); border-radius: 0.25rem; padding: 0.1em 0.4em; font-size: 0.85em; }
        .preview-blockquote { border-left: 3px solid var(--color-accent); padding: 0.4rem 0.75rem; margin: 0.75rem 0; color: var(--color-muted-foreground); background: var(--color-surface-muted); border-radius: 0 0.5rem 0.5rem 0; }
        .preview-link { color: var(--color-primary); text-decoration: underline; }
        .preview-img { max-width: 100%; border-radius: 0.5rem; margin: 0.5rem 0; }
        .preview-hr { border: none; border-top: 1px solid var(--color-border); margin: 1rem 0; }
        .preview-li { margin: 0.25rem 0 0.25rem 1.25rem; list-style: disc; }
        .preview-li.list-decimal { list-style: decimal; }
      `}</style>
      <div
        className="text-sm text-foreground/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html || '<p class="preview-p" style="color:var(--color-muted-foreground)">Nothing to preview yet…</p>' }}
      />
    </>
  );
}

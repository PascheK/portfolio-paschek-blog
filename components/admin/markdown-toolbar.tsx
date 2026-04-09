'use client';

import {
  Bold, Italic, Strikethrough, Code, Braces,
  Link2, Image as ImageIcon,
  Heading1, Heading2, Heading3,
  Quote, List, ListOrdered, Minus,
} from 'lucide-react';

type MarkdownAction =
  | 'bold' | 'italic' | 'strike'
  | 'h1' | 'h2' | 'h3'
  | 'code' | 'codeblock'
  | 'link' | 'image'
  | 'quote' | 'ul' | 'ol' | 'hr';

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

function applyMarkdown(
  textarea: HTMLTextAreaElement,
  onChange: (v: string) => void,
  action: MarkdownAction,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end);

  let prefix = '';
  let suffix = '';
  let placeholder = 'text';

  switch (action) {
    case 'bold':      prefix = '**'; suffix = '**'; placeholder = 'bold text'; break;
    case 'italic':    prefix = '_'; suffix = '_'; placeholder = 'italic text'; break;
    case 'strike':    prefix = '~~'; suffix = '~~'; placeholder = 'strikethrough'; break;
    case 'h1':        prefix = '# '; suffix = ''; placeholder = 'Heading 1'; break;
    case 'h2':        prefix = '## '; suffix = ''; placeholder = 'Heading 2'; break;
    case 'h3':        prefix = '### '; suffix = ''; placeholder = 'Heading 3'; break;
    case 'code':      prefix = '`'; suffix = '`'; placeholder = 'code'; break;
    case 'codeblock': prefix = '```\n'; suffix = '\n```'; placeholder = 'code here'; break;
    case 'link':      prefix = '['; suffix = '](https://)'; placeholder = 'link text'; break;
    case 'image':     prefix = '!['; suffix = '](/path/to/image.png)'; placeholder = 'alt text'; break;
    case 'quote':     prefix = '> '; suffix = ''; placeholder = 'blockquote'; break;
    case 'ul':        prefix = '- '; suffix = ''; placeholder = 'list item'; break;
    case 'ol':        prefix = '1. '; suffix = ''; placeholder = 'list item'; break;
    case 'hr':        prefix = '\n---\n'; suffix = ''; placeholder = ''; break;
  }

  const content = selected || placeholder;
  const newValue = value.slice(0, start) + prefix + content + suffix + value.slice(end);
  onChange(newValue);

  requestAnimationFrame(() => {
    textarea.focus();
    const cursorStart = start + prefix.length;
    const cursorEnd = cursorStart + content.length;
    textarea.setSelectionRange(cursorStart, cursorEnd);
  });
}

const groups: { action: MarkdownAction; icon: React.ComponentType<{ className?: string }>; title: string }[][] = [
  [
    { action: 'h1', icon: Heading1, title: 'Heading 1' },
    { action: 'h2', icon: Heading2, title: 'Heading 2' },
    { action: 'h3', icon: Heading3, title: 'Heading 3' },
  ],
  [
    { action: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
    { action: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
    { action: 'strike', icon: Strikethrough, title: 'Strikethrough' },
  ],
  [
    { action: 'code', icon: Code, title: 'Inline code' },
    { action: 'codeblock', icon: Braces, title: 'Code block' },
  ],
  [
    { action: 'link', icon: Link2, title: 'Link' },
    { action: 'image', icon: ImageIcon, title: 'Image' },
  ],
  [
    { action: 'quote', icon: Quote, title: 'Blockquote' },
    { action: 'ul', icon: List, title: 'Bullet list' },
    { action: 'ol', icon: ListOrdered, title: 'Numbered list' },
    { action: 'hr', icon: Minus, title: 'Horizontal rule' },
  ],
];

export function MarkdownToolbar({ textareaRef, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-border bg-surface px-2 py-1.5">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <div className="w-px h-4 bg-border mx-1" />}
          {group.map(({ action, icon: Icon, title }) => (
            <button
              key={action}
              type="button"
              title={title}
              onMouseDown={(e) => {
                e.preventDefault();
                if (textareaRef.current) applyMarkdown(textareaRef.current, onChange, action);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-alt transition-colors"
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

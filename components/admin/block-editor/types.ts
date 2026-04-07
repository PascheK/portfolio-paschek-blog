export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'numberedList'
  | 'quote'
  | 'code'
  | 'image'
  | 'divider'
  | 'callout';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  meta?: {
    language?: string;
    url?: string;
    alt?: string;
    calloutType?: 'info' | 'warning' | 'error' | 'success';
  };
}

export interface SlashCommand {
  id: BlockType;
  label: string;
  description: string;
  icon: string;
  shortcut?: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'paragraph',     label: 'Text',         description: 'Plain text paragraph',        icon: '¶',  shortcut: 'p' },
  { id: 'heading1',      label: 'Heading 1',    description: 'Large section heading',       icon: 'H1', shortcut: 'h1' },
  { id: 'heading2',      label: 'Heading 2',    description: 'Medium section heading',      icon: 'H2', shortcut: 'h2' },
  { id: 'heading3',      label: 'Heading 3',    description: 'Small section heading',       icon: 'H3', shortcut: 'h3' },
  { id: 'bulletList',    label: 'Bullet list',  description: 'Unordered list',              icon: '•',  shortcut: 'ul' },
  { id: 'numberedList',  label: 'Numbered list',description: 'Ordered list',                icon: '1.', shortcut: 'ol' },
  { id: 'quote',         label: 'Quote',        description: 'Blockquote',                  icon: '"',  shortcut: 'q' },
  { id: 'code',          label: 'Code block',   description: 'Code with syntax highlight',  icon: '<>', shortcut: 'code' },
  { id: 'image',         label: 'Image',        description: 'Embed an image by URL',       icon: '⌗',  shortcut: 'img' },
  { id: 'divider',       label: 'Divider',      description: 'Horizontal rule',             icon: '—',  shortcut: 'hr' },
  { id: 'callout',       label: 'Callout',      description: 'Highlighted callout box',     icon: '💡', shortcut: 'call' },
];

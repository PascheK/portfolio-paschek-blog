import { Block, BlockType } from './types';

let _idCounter = 0;
function genId() { return `block-${Date.now()}-${_idCounter++}`; }

// ── MDX → Blocks ────────────────────────────────────────────────────────────
export function mdxToBlocks(mdx: string): Block[] {
  const blocks: Block[] = [];
  const lines = mdx.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ id: genId(), type: 'code', content: codeLines.join('\n'), meta: { language: lang || 'plaintext' } });
      i++;
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      blocks.push({ id: genId(), type: 'heading1', content: line.slice(2) });
      i++; continue;
    }
    // Heading 2
    if (line.startsWith('## ')) {
      blocks.push({ id: genId(), type: 'heading2', content: line.slice(3) });
      i++; continue;
    }
    // Heading 3
    if (line.startsWith('### ')) {
      blocks.push({ id: genId(), type: 'heading3', content: line.slice(4) });
      i++; continue;
    }
    // Bullet list
    if (/^[-*+] /.test(line)) {
      blocks.push({ id: genId(), type: 'bulletList', content: line.slice(2) });
      i++; continue;
    }
    // Numbered list
    if (/^\d+\. /.test(line)) {
      blocks.push({ id: genId(), type: 'numberedList', content: line.replace(/^\d+\. /, '') });
      i++; continue;
    }
    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push({ id: genId(), type: 'quote', content: line.slice(2) });
      i++; continue;
    }
    // Divider
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      blocks.push({ id: genId(), type: 'divider', content: '' });
      i++; continue;
    }
    // Image
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      blocks.push({ id: genId(), type: 'image', content: imgMatch[1], meta: { url: imgMatch[2], alt: imgMatch[1] } });
      i++; continue;
    }
    // Callout (custom MDX component: <Callout type="info">text</Callout>)
    const calloutMatch = line.match(/^<Callout(?:\s+type="([^"]*)")?>(.*)<\/Callout>/);
    if (calloutMatch) {
      blocks.push({ id: genId(), type: 'callout', content: calloutMatch[2] || '', meta: { calloutType: (calloutMatch[1] as any) || 'info' } });
      i++; continue;
    }
    // Empty line → skip
    if (line.trim() === '') { i++; continue; }
    // Paragraph
    blocks.push({ id: genId(), type: 'paragraph', content: line });
    i++;
  }

  if (blocks.length === 0) {
    blocks.push({ id: genId(), type: 'paragraph', content: '' });
  }
  return blocks;
}

// ── Blocks → MDX ────────────────────────────────────────────────────────────
export function blocksToMdx(blocks: Block[]): string {
  return blocks.map((b) => {
    switch (b.type) {
      case 'paragraph':     return b.content || '';
      case 'heading1':      return `# ${b.content}`;
      case 'heading2':      return `## ${b.content}`;
      case 'heading3':      return `### ${b.content}`;
      case 'bulletList':    return `- ${b.content}`;
      case 'numberedList':  return `1. ${b.content}`;
      case 'quote':         return `> ${b.content}`;
      case 'code':          return `\`\`\`${b.meta?.language || ''}\n${b.content}\n\`\`\``;
      case 'image':         return `![${b.meta?.alt || b.content}](${b.meta?.url || ''})`;
      case 'divider':       return '---';
      case 'callout':       return `<Callout type="${b.meta?.calloutType || 'info'}">${b.content}</Callout>`;
      default:              return b.content;
    }
  })
  .filter((line, i, arr) => {
    // Remove trailing empty lines
    if (line === '' && i === arr.length - 1) return false;
    return true;
  })
  .join('\n\n');
}

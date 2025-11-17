import { slugify } from "./slugify";

export type Heading = { text: string; slug: string; depth: number };

/**
 * Extract markdown headings (levels 1-3) from raw MDX content, ignoring fenced code blocks.
 */
export function extractHeadings(content: string): Heading[] {
  const lines = content.split("\n");
  const headings: Heading[] = [];
  const inCode = { active: false, fence: "" };

  for (const line of lines) {
    const fenceMatch = line.match(/^(```|~~~)/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      if (!inCode.active) {
        inCode.active = true;
        inCode.fence = fence;
      } else if (inCode.fence === fence) {
        inCode.active = false;
      }
      continue;
    }
    if (inCode.active) continue;

    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      const depth = match[1].length;
      const text = match[2].trim();
      headings.push({ text, slug: slugify(text), depth });
    }
  }

  return headings.filter((h) => h.depth <= 3);
}

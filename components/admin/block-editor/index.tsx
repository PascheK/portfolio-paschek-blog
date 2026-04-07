'use client';
import React from 'react';
import { Block, BlockType } from './types';
import { SlashMenu } from './slash-menu';
import { BlockItem } from './block-item';
import { mdxToBlocks, blocksToMdx } from './mdx-converter';

interface Props {
  initialMdx?: string;
  onChange: (mdx: string) => void;
}

export function BlockEditor({ initialMdx = '', onChange }: Props) {
  const [blocks, setBlocks] = React.useState<Block[]>(() => mdxToBlocks(initialMdx));
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [slashMenu, setSlashMenu] = React.useState<{
    query: string;
    blockId: string;
    position: { top: number; left: number };
  } | null>(null);

  // Sync when initialMdx changes from outside (e.g. loading saved draft)
  const prevMdxRef = React.useRef(initialMdx);
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (initialMdx !== prevMdxRef.current) {
      prevMdxRef.current = initialMdx;
      setBlocks(mdxToBlocks(initialMdx));
    }
  }, [initialMdx]);

  const inputRefs = React.useRef<Record<string, HTMLElement | null>>({});

  // ── Focus a block, placing cursor at end ────────────────────────────────
  function focusBlock(id: string) {
    requestAnimationFrame(() => {
      const el = inputRefs.current[id];
      if (!el) return;
      el.focus();
      // Place cursor at end of content
      if (el.contentEditable === 'true') {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
  }

  // ── Compute slash menu position — NO DOM mutations ──────────────────────
  function getCaretPosition(el: HTMLElement): { top: number; left: number } {
    const fallback = () => {
      const r = el.getBoundingClientRect();
      return { top: r.bottom + 8, left: r.left };
    };
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return fallback();
      const range = sel.getRangeAt(0);
      // getClientRects() is read-only — no DOM modification
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const r = rects[rects.length - 1];
        if (r.top > 0) return { top: r.bottom + 8, left: r.left };
      }
      // Collapsed range in empty block: getBoundingClientRect may return zero rect
      const r = range.getBoundingClientRect();
      if (r.top > 0) return { top: r.bottom + 8, left: r.left };
    } catch { /* ignore */ }
    return fallback();
  }

  // ── Handle text changes from blocks ─────────────────────────────────────
  function handleChange(id: string, content: string) {
    const el = inputRefs.current[id];

    // Slash command detection: content must be "/" or "/word"
    // Only triggers when the typed text starts with / from the beginning of the block
    if (/^\/\S*$/.test(content.trim())) {
      const query = content.trim().slice(1);
      const position = el ? getCaretPosition(el) : { top: 0, left: 0 };
      setSlashMenu({ query, blockId: id, position });
    } else {
      setSlashMenu(null);
    }

    setBlocks((prev) => {
      const next = prev.map((b) => b.id === id ? { ...b, content } : b);
      onChange(blocksToMdx(next));
      return next;
    });
  }

  // ── Slash menu: apply selected block type ────────────────────────────────
  function handleSlashSelect(type: BlockType) {
    if (!slashMenu) return;
    const { blockId } = slashMenu;

    // 1. Immediately clear the DOM element text (slash + query)
    const el = inputRefs.current[blockId];
    if (el && el.contentEditable === 'true') {
      el.textContent = '';
    }

    // 2. Update state
    setBlocks((prev) => {
      const next = prev.map((b) =>
        b.id === blockId ? { ...b, type, content: '' } : b
      );
      onChange(blocksToMdx(next));
      return next;
    });

    setSlashMenu(null);
    focusBlock(blockId);
  }

  // ── Handle meta (image url, code language, callout type) ─────────────────
  function handleMetaChange(id: string, meta: Block['meta']) {
    setBlocks((prev) => {
      const next = prev.map((b) => b.id === id ? { ...b, meta } : b);
      onChange(blocksToMdx(next));
      return next;
    });
  }

  // ── Insert a new block after a given id ─────────────────────────────────
  function insertBlock(afterId: string, type: BlockType = 'paragraph'): string {
    const newBlock: Block = { id: `block-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, content: '' };
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === afterId);
      const insertAt = idx >= 0 ? idx + 1 : prev.length;
      const next = [...prev.slice(0, insertAt), newBlock, ...prev.slice(insertAt)];
      onChange(blocksToMdx(next));
      return next;
    });
    setFocusedId(newBlock.id);
    focusBlock(newBlock.id);
    return newBlock.id;
  }

  // ── Delete or downgrade a block ──────────────────────────────────────────
  function deleteBlock(id: string) {
    setBlocks((prev) => {
      if (prev.length <= 1) {
        const el = inputRefs.current[prev[0].id];
        if (el && el.contentEditable === 'true') el.textContent = '';
        const empty = [{ ...prev[0], content: '', type: 'paragraph' as BlockType }];
        onChange(blocksToMdx(empty));
        return empty;
      }
      const idx = prev.findIndex((b) => b.id === id);
      const next = prev.filter((b) => b.id !== id);
      onChange(blocksToMdx(next));
      // Focus previous block
      const target = next[Math.max(0, idx - 1)];
      if (target) { setFocusedId(target.id); focusBlock(target.id); }
      return next;
    });
  }

  // ── Keyboard handler per block ────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent, id: string) {
    // Slash menu is handling keyboard — skip
    if (slashMenu) return;

    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    // Enter → new block (not in code)
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault();
      // If heading/quote and Enter is pressed, next block is paragraph
      const nextType: BlockType = ['heading1','heading2','heading3'].includes(block.type) ? 'paragraph' : block.type;
      insertBlock(id, ['heading1','heading2','heading3','quote','callout'].includes(block.type) ? 'paragraph' : block.type === 'divider' ? 'paragraph' : block.type);
      return;
    }

    // Backspace on empty block
    if (e.key === 'Backspace') {
      const el = inputRefs.current[id];
      const isEmpty = block.type === 'code' ? false : !el?.textContent?.trim();

      if (isEmpty && block.type !== 'paragraph') {
        // Downgrade to paragraph
        e.preventDefault();
        setBlocks((prev) => {
          const next = prev.map((b) =>
            b.id === id ? { ...b, type: 'paragraph' as BlockType, content: '' } : b
          );
          onChange(blocksToMdx(next));
          return next;
        });
        return;
      }

      if (isEmpty && block.type === 'paragraph') {
        // Delete block
        e.preventDefault();
        deleteBlock(id);
        return;
      }
    }

    // Arrow navigation between blocks
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const idx = blocks.findIndex((b) => b.id === id);
      const targetIdx = e.key === 'ArrowUp' ? idx - 1 : idx + 1;
      if (targetIdx >= 0 && targetIdx < blocks.length) {
        // Only navigate if cursor is at start/end of block
        const el = inputRefs.current[id];
        const sel = window.getSelection();
        if (el && sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const atEdge = e.key === 'ArrowUp'
            ? range.startOffset === 0
            : range.endOffset === (el.textContent?.length ?? 0);
          if (atEdge) {
            e.preventDefault();
            focusBlock(blocks[targetIdx].id);
          }
        }
      }
    }
  }

  return (
    <div className="relative w-full">
      {/* Blocks list */}
      <div className="space-y-0.5">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="group relative flex items-start pl-10 pr-2 rounded-xl transition-colors hover:bg-white/[0.015]"
          >
            {/* Drag handle + add button (hover) */}
            <div className="absolute left-0 top-2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Add block */}
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.07] transition-all text-base leading-none"
                onMouseDown={(e) => { e.preventDefault(); insertBlock(block.id); }}
                tabIndex={-1}
                title="Add block below (or press Enter)"
              >
                +
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <BlockItem
                block={block}
                index={index}
                isSelected={focusedId === block.id}
                isFocused={focusedId === block.id}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={(id) => setFocusedId(id)}
                onTypeChange={(id, type) => {
                  setBlocks((prev) => {
                    const next = prev.map((b) => b.id === id ? { ...b, type } : b);
                    onChange(blocksToMdx(next));
                    return next;
                  });
                }}
                onMetaChange={handleMetaChange}
                inputRef={(el) => { inputRefs.current[block.id] = el; }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Click-to-add zone at bottom */}
      <button
        className="mt-4 ml-10 flex items-center gap-2 text-[13px] text-white/20 hover:text-white/40 transition-colors group py-2"
        onMouseDown={(e) => {
          e.preventDefault();
          const lastId = blocks[blocks.length - 1]?.id;
          if (lastId) insertBlock(lastId);
        }}
      >
        <div className="w-5 h-5 rounded border border-dashed border-white/15 group-hover:border-white/30 flex items-center justify-center text-xs transition-colors">
          +
        </div>
        <span>Click to add a block, or press Enter in the last block</span>
      </button>

      {/* Slash command menu — rendered in portal to avoid transform clipping */}
      {slashMenu && (
        <SlashMenu
          query={slashMenu.query}
          position={slashMenu.position}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenu(null)}
        />
      )}
    </div>
  );
}

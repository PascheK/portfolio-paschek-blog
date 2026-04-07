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

  // Always-current reference to blocks — avoids stale closures
  const blocksRef = React.useRef(blocks);
  blocksRef.current = blocks;

  // Always-current reference to onChange — avoids stale closures
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  // Sync when initialMdx changes externally (e.g. loading saved draft)
  const prevMdxRef = React.useRef(initialMdx);
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (initialMdx !== prevMdxRef.current) {
      prevMdxRef.current = initialMdx;
      const next = mdxToBlocks(initialMdx);
      blocksRef.current = next;
      setBlocks(next);
      // No onChange call here — initialMdx came FROM the parent
    }
  }, [initialMdx]);

  const inputRefs = React.useRef<Record<string, HTMLElement | null>>({});

  // ── Core helper: update blocks + notify parent ─────────────────────────
  // NEVER call onChange inside a setState updater — that triggers
  // "Cannot update a component while rendering a different component".
  // Instead we compute next synchronously, update the ref, call onChange,
  // then schedule the React state update.
  function applyBlocks(next: Block[]) {
    blocksRef.current = next;
    onChangeRef.current(blocksToMdx(next));
    setBlocks(next);
  }

  // ── Focus a block, placing cursor at end ────────────────────────────────
  function focusBlock(id: string) {
    requestAnimationFrame(() => {
      const el = inputRefs.current[id];
      if (!el) return;
      el.focus();
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

  // ── Caret position — read-only, NO DOM mutations ────────────────────────
  function getCaretPosition(el: HTMLElement): { top: number; left: number } {
    const fallback = () => {
      const r = el.getBoundingClientRect();
      return { top: r.bottom + 8, left: r.left };
    };
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return fallback();
      const range = sel.getRangeAt(0);
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const r = rects[rects.length - 1];
        if (r.top > 0) return { top: r.bottom + 8, left: r.left };
      }
      const r = range.getBoundingClientRect();
      if (r.top > 0) return { top: r.bottom + 8, left: r.left };
    } catch { /* ignore */ }
    return fallback();
  }

  // ── Text change from a block ────────────────────────────────────────────
  function handleChange(id: string, content: string) {
    const el = inputRefs.current[id];

    // Slash detection — only when the whole content is "/query"
    if (/^\/\S*$/.test(content.trim())) {
      const query = content.trim().slice(1);
      const position = el ? getCaretPosition(el) : { top: 0, left: 0 };
      setSlashMenu({ query, blockId: id, position });
    } else {
      if (slashMenu) setSlashMenu(null);
    }

    const next = blocksRef.current.map((b) =>
      b.id === id ? { ...b, content } : b
    );
    applyBlocks(next);
  }

  // ── Slash menu selection ────────────────────────────────────────────────
  function handleSlashSelect(type: BlockType) {
    if (!slashMenu) return;
    const { blockId } = slashMenu;

    // Clear the typed "/query" from the DOM immediately
    const el = inputRefs.current[blockId];
    if (el && el.contentEditable === 'true') {
      el.textContent = '';
    }

    const next = blocksRef.current.map((b) =>
      b.id === blockId ? { ...b, type, content: '' } : b
    );
    applyBlocks(next);
    setSlashMenu(null);
    focusBlock(blockId);
  }

  // ── Meta change (image url, code lang, callout type) ────────────────────
  function handleMetaChange(id: string, meta: Block['meta']) {
    const next = blocksRef.current.map((b) => b.id === id ? { ...b, meta } : b);
    applyBlocks(next);
  }

  // ── Insert a new block after afterId ─────────────────────────────────────
  function insertBlock(afterId: string, type: BlockType = 'paragraph'): string {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newBlock: Block = { id, type, content: '' };
    const idx = blocksRef.current.findIndex((b) => b.id === afterId);
    const at = idx >= 0 ? idx + 1 : blocksRef.current.length;
    const next = [
      ...blocksRef.current.slice(0, at),
      newBlock,
      ...blocksRef.current.slice(at),
    ];
    applyBlocks(next);
    setFocusedId(id);
    focusBlock(id);
    return id;
  }

  // ── Delete a block ──────────────────────────────────────────────────────
  function deleteBlock(id: string) {
    const current = blocksRef.current;
    if (current.length <= 1) {
      // Keep one empty paragraph
      const el = inputRefs.current[current[0].id];
      if (el?.contentEditable === 'true') el.textContent = '';
      const next = [{ ...current[0], content: '', type: 'paragraph' as BlockType }];
      applyBlocks(next);
      return;
    }
    const idx = current.findIndex((b) => b.id === id);
    const next = current.filter((b) => b.id !== id);
    applyBlocks(next);
    const target = next[Math.max(0, idx - 1)];
    if (target) { setFocusedId(target.id); focusBlock(target.id); }
  }

  // ── Keyboard handler ────────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent, id: string) {
    if (slashMenu) return; // slash menu owns keyboard
    const block = blocksRef.current.find((b) => b.id === id);
    if (!block) return;

    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault();
      // After a heading/quote, next block is paragraph
      const nextType: BlockType =
        ['heading1', 'heading2', 'heading3', 'quote', 'callout'].includes(block.type)
          ? 'paragraph'
          : block.type === 'divider'
          ? 'paragraph'
          : block.type;
      insertBlock(id, nextType);
      return;
    }

    if (e.key === 'Backspace') {
      const el = inputRefs.current[id];
      const isEmpty = block.type !== 'code' && !el?.textContent?.trim();
      if (isEmpty && block.type !== 'paragraph') {
        e.preventDefault();
        const next = blocksRef.current.map((b) =>
          b.id === id ? { ...b, type: 'paragraph' as BlockType, content: '' } : b
        );
        applyBlocks(next);
        return;
      }
      if (isEmpty) {
        e.preventDefault();
        deleteBlock(id);
        return;
      }
    }

    // Cross-block arrow navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const allBlocks = blocksRef.current;
      const idx = allBlocks.findIndex((b) => b.id === id);
      const targetIdx = e.key === 'ArrowUp' ? idx - 1 : idx + 1;
      if (targetIdx >= 0 && targetIdx < allBlocks.length) {
        const el = inputRefs.current[id];
        const sel = window.getSelection();
        if (el && sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const len = el.textContent?.length ?? 0;
          const atEdge =
            e.key === 'ArrowUp'
              ? range.startOffset === 0
              : range.endOffset === len;
          if (atEdge) {
            e.preventDefault();
            focusBlock(allBlocks[targetIdx].id);
          }
        }
      }
    }
  }

  return (
    <div className="relative w-full">
      <div className="space-y-0">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="group relative flex items-start pl-9 pr-2 rounded-xl transition-colors hover:bg-white/[0.012]"
          >
            {/* Add-block handle */}
            <button
              className="absolute left-0.5 top-1.5 w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.07] transition-all opacity-0 group-hover:opacity-100 text-base leading-none"
              onMouseDown={(e) => { e.preventDefault(); insertBlock(block.id); }}
              tabIndex={-1}
              title="Add block below"
            >
              +
            </button>

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
                  const next = blocksRef.current.map((b) =>
                    b.id === id ? { ...b, type } : b
                  );
                  applyBlocks(next);
                }}
                onMetaChange={handleMetaChange}
                inputRef={(el) => { inputRefs.current[block.id] = el; }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add block at end */}
      <button
        className="mt-4 ml-9 flex items-center gap-2 text-[12px] text-white/15 hover:text-white/35 transition-colors group py-2"
        onMouseDown={(e) => {
          e.preventDefault();
          const lastId = blocksRef.current[blocksRef.current.length - 1]?.id;
          if (lastId) insertBlock(lastId);
        }}
      >
        <div className="w-4 h-4 rounded border border-dashed border-white/12 group-hover:border-white/25 flex items-center justify-center text-[10px] transition-colors">
          +
        </div>
        <span>Add block</span>
      </button>

      {/* Slash command menu — in portal, no transform issues */}
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

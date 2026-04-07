'use client';
import React from 'react';
import { createPortal } from 'react-dom';
import { SLASH_COMMANDS, BlockType } from './types';

interface Props {
  query: string;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const ICON_MAP: Record<string, string> = {
  paragraph:    '¶',
  heading1:     'H1',
  heading2:     'H2',
  heading3:     'H3',
  bulletList:   '•',
  numberedList: '1.',
  quote:        '"',
  code:         '</>',
  image:        '⌗',
  divider:      '—',
  callout:      '💡',
};

export function SlashMenu({ query, position, onSelect, onClose }: Props) {
  const [selected, setSelected] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const filtered = SLASH_COMMANDS.filter((c) =>
    query === '' ||
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    (c.shortcut && c.shortcut.startsWith(query.toLowerCase()))
  );

  React.useEffect(() => { setSelected(0); }, [query]);

  // Scroll selected item into view
  React.useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  // Keyboard navigation — capture phase, stop all propagation
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const handled = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'];
      if (!handled.includes(e.key)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      switch (e.key) {
        case 'ArrowDown':
        case 'Tab':
          setSelected((s) => (s + 1) % Math.max(filtered.length, 1));
          break;
        case 'ArrowUp':
          setSelected((s) => (s - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
          break;
        case 'Enter':
          if (filtered[selected]) onSelect(filtered[selected].id);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [filtered, selected, onSelect, onClose]);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!listRef.current?.closest('[data-slash-menu]')?.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!mounted || filtered.length === 0) return null;

  // Adjust position so menu doesn't go off-screen
  const menuWidth = 280;
  const menuHeight = Math.min(filtered.length * 52 + 36, 340);
  const adjustedLeft = Math.min(position.left, window.innerWidth - menuWidth - 16);
  const adjustedTop = position.top + menuHeight > window.innerHeight
    ? position.top - menuHeight - 8
    : position.top;

  return createPortal(
    <div
      data-slash-menu
      style={{
        position: 'fixed',
        top: adjustedTop,
        left: adjustedLeft,
        width: menuWidth,
        zIndex: 99999,
      }}
      className="overflow-hidden rounded-2xl shadow-2xl"
    >
      {/* Backdrop blur + border */}
      <div className="bg-[#13161f]/95 backdrop-blur-xl border border-white/[0.09] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2">
          <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">
            {query ? `"${query}"` : 'Blocks'}
          </span>
          <span className="ml-auto text-[10px] text-white/15 font-mono">↑↓ Enter</span>
        </div>

        {/* Items */}
        <div ref={listRef} className="max-h-[280px] overflow-y-auto pb-1.5">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-100 ${
                i === selected
                  ? 'bg-white/[0.08]'
                  : 'hover:bg-white/[0.04]'
              }`}
              onMouseDown={(e) => { e.preventDefault(); onSelect(cmd.id); }}
              onMouseEnter={() => setSelected(i)}
            >
              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold font-mono shrink-0 transition-colors ${
                i === selected ? 'bg-primary/25 text-primary' : 'bg-white/[0.06] text-white/50'
              }`}>
                {ICON_MAP[cmd.id] || cmd.icon}
              </div>

              {/* Label */}
              <div className="min-w-0 flex-1">
                <div className={`text-[13px] font-medium leading-none mb-0.5 transition-colors ${
                  i === selected ? 'text-white' : 'text-white/70'
                }`}>
                  {cmd.label}
                </div>
                <div className="text-[11px] text-white/30 leading-tight truncate">
                  {cmd.description}
                </div>
              </div>

              {/* Shortcut */}
              {cmd.shortcut && (
                <kbd className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-md transition-colors ${
                  i === selected ? 'bg-primary/20 text-primary/70' : 'bg-white/[0.05] text-white/20'
                }`}>
                  /{cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

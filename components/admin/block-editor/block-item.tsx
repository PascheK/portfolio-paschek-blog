'use client';
import React from 'react';
import { Block, BlockType } from './types';

interface Props {
  block: Block;
  index: number;
  isSelected: boolean;
  isFocused: boolean;
  onChange: (id: string, content: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onFocus: (id: string) => void;
  onTypeChange: (id: string, type: BlockType) => void;
  onMetaChange: (id: string, meta: Block['meta']) => void;
  inputRef: (el: HTMLElement | null) => void;
}

const TYPE_LABELS: Record<BlockType, { label: string; icon: string }> = {
  paragraph:    { label: 'Text',         icon: '¶'   },
  heading1:     { label: 'Heading 1',    icon: 'H1'  },
  heading2:     { label: 'Heading 2',    icon: 'H2'  },
  heading3:     { label: 'Heading 3',    icon: 'H3'  },
  bulletList:   { label: 'Bullet list',  icon: '•'   },
  numberedList: { label: 'Numbered',     icon: '1.'  },
  quote:        { label: 'Quote',        icon: '"'   },
  code:         { label: 'Code',         icon: '</>' },
  image:        { label: 'Image',        icon: '⌗'   },
  divider:      { label: 'Divider',      icon: '—'   },
  callout:      { label: 'Callout',      icon: '💡'  },
};

const PLACEHOLDERS: Partial<Record<BlockType, string>> = {
  paragraph:    'Write something, or / for commands…',
  heading1:     'Heading 1',
  heading2:     'Heading 2',
  heading3:     'Heading 3',
  bulletList:   'List item',
  numberedList: 'List item',
  quote:        'Quote…',
  callout:      'Callout text…',
};

export function BlockItem({
  block, index, isSelected, isFocused,
  onChange, onKeyDown, onFocus, onTypeChange, onMetaChange, inputRef,
}: Props) {
  const [showTypeMenu, setShowTypeMenu] = React.useState(false);
  const typeMenuRef = React.useRef<HTMLDivElement>(null);

  // Close type menu on outside click
  React.useEffect(() => {
    if (!showTypeMenu) return;
    const handler = (e: MouseEvent) => {
      if (!typeMenuRef.current?.contains(e.target as Node)) setShowTypeMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTypeMenu]);

  // ── Divider ──────────────────────────────────────────────────────────────
  if (block.type === 'divider') {
    return (
      <div
        className="py-3 group/div cursor-pointer"
        tabIndex={0}
        ref={(el) => inputRef(el)}
        onFocus={() => onFocus(block.id)}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <span className="text-[10px] text-white/15 font-mono uppercase tracking-widest select-none group-hover/div:text-white/30 transition-colors">
            divider
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>
      </div>
    );
  }

  // ── Image ────────────────────────────────────────────────────────────────
  if (block.type === 'image') {
    return (
      <div className="space-y-3 py-1" onFocus={() => onFocus(block.id)}>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.07] transition-all"
            placeholder="Paste image URL…"
            value={block.meta?.url || ''}
            onChange={(e) => onMetaChange(block.id, { ...block.meta, url: e.target.value })}
          />
          <input
            className="w-44 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/60 placeholder-white/20 focus:outline-none focus:border-primary/40 transition-all"
            placeholder="Alt text"
            value={block.meta?.alt || ''}
            onChange={(e) => onMetaChange(block.id, { ...block.meta, alt: e.target.value })}
          />
        </div>
        {block.meta?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.meta.url}
            alt={block.meta.alt || ''}
            className="max-h-72 rounded-xl object-contain border border-white/[0.06]"
          />
        ) : (
          <div className="h-32 rounded-xl border-2 border-dashed border-white/[0.07] flex items-center justify-center text-white/20 text-sm">
            Image will appear here
          </div>
        )}
      </div>
    );
  }

  // ── Code ──────────────────────────────────────────────────────────────────
  if (block.type === 'code') {
    return (
      <div
        className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d1117] my-1"
        onFocus={() => onFocus(block.id)}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/40" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
            <div className="w-3 h-3 rounded-full bg-green-500/40" />
          </div>
          <input
            className="ml-2 bg-transparent text-xs font-mono text-white/40 focus:outline-none focus:text-white/70 w-28 transition-colors"
            placeholder="language…"
            value={block.meta?.language || ''}
            onChange={(e) => onMetaChange(block.id, { ...block.meta, language: e.target.value })}
          />
          <span className="ml-auto text-[10px] text-white/15 font-mono">code block</span>
        </div>
        <textarea
          ref={(el) => inputRef(el)}
          className="w-full bg-transparent text-[#e6edf3] font-mono text-[13px] leading-relaxed p-4 focus:outline-none resize-none min-h-[100px]"
          value={block.content}
          onChange={(e) => onChange(block.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const t = e.currentTarget;
              const s = t.selectionStart;
              t.setRangeText('  ', s, t.selectionEnd, 'end');
              onChange(block.id, t.value);
            } else {
              onKeyDown(e, block.id);
            }
          }}
          onFocus={() => onFocus(block.id)}
          spellCheck={false}
          rows={Math.max(3, (block.content.match(/\n/g) || []).length + 2)}
        />
      </div>
    );
  }

  // ── Callout ───────────────────────────────────────────────────────────────
  if (block.type === 'callout') {
    const CALLOUT_STYLES: Record<string, { border: string; bg: string; icon: string }> = {
      info:    { border: 'border-blue-500/30',   bg: 'bg-blue-500/[0.07]',   icon: 'ℹ️' },
      warning: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/[0.07]', icon: '⚠️' },
      error:   { border: 'border-red-500/30',    bg: 'bg-red-500/[0.07]',    icon: '❌' },
      success: { border: 'border-green-500/30',  bg: 'bg-green-500/[0.07]',  icon: '✅' },
    };
    const ct = block.meta?.calloutType || 'info';
    const style = CALLOUT_STYLES[ct] || CALLOUT_STYLES.info;

    return (
      <div
        className={`flex gap-3 rounded-xl border px-4 py-3 my-1 ${style.border} ${style.bg}`}
        onFocus={() => onFocus(block.id)}
      >
        <select
          className="shrink-0 bg-transparent text-lg cursor-pointer focus:outline-none mt-0.5"
          value={ct}
          onChange={(e) => onMetaChange(block.id, { ...block.meta, calloutType: e.target.value as any })}
        >
          {Object.entries(CALLOUT_STYLES).map(([t, s]) => (
            <option key={t} value={t}>{s.icon}</option>
          ))}
        </select>
        <div
          ref={(el) => inputRef(el)}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Callout text…"
          className="flex-1 focus:outline-none text-sm text-white/75 leading-relaxed min-h-[1.5rem] empty:before:content-[attr(data-placeholder)] empty:before:text-white/25"
          onInput={(e) => onChange(block.id, e.currentTarget.textContent || '')}
          onKeyDown={(e) => onKeyDown(e, block.id)}
          onFocus={() => onFocus(block.id)}
        />
      </div>
    );
  }

  // ── Text-based blocks ─────────────────────────────────────────────────────
  const textStyles: Record<BlockType, string> = {
    paragraph:    'text-[15px] leading-[1.8] text-white/75',
    heading1:     'text-[2rem] font-bold text-white leading-tight tracking-tight',
    heading2:     'text-[1.5rem] font-bold text-white/95 leading-tight',
    heading3:     'text-[1.2rem] font-semibold text-white/90 leading-snug',
    bulletList:   'text-[15px] leading-[1.8] text-white/75',
    numberedList: 'text-[15px] leading-[1.8] text-white/75',
    quote:        'text-[15px] leading-[1.8] text-white/50 italic',
    code:         '',
    image:        '',
    divider:      '',
    callout:      '',
  };

  const blockPadding: Record<BlockType, string> = {
    heading1: 'pt-6 pb-1',
    heading2: 'pt-4 pb-0.5',
    heading3: 'pt-3 pb-0.5',
    paragraph: 'py-0.5',
    bulletList: 'py-0.5',
    numberedList: 'py-0.5',
    quote: 'py-1',
    code: '',
    image: '',
    divider: '',
    callout: '',
  };

  const placeholder = PLACEHOLDERS[block.type] ?? 'Type something…';

  return (
    <div className={`relative flex items-start gap-2 ${blockPadding[block.type] || ''}`}>
      {/* Type badge (appears on hover) */}
      <div className="relative shrink-0" ref={typeMenuRef}>
        <button
          className={`mt-[3px] w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all select-none opacity-0 group-hover:opacity-100 ${
            isFocused ? 'opacity-60' : ''
          } ${showTypeMenu ? 'opacity-100 bg-primary/20 text-primary' : 'bg-white/[0.05] text-white/30 hover:bg-white/[0.09] hover:text-white/60'}`}
          onMouseDown={(e) => { e.preventDefault(); setShowTypeMenu((s) => !s); }}
          tabIndex={-1}
          title="Change block type"
        >
          {block.type === 'heading1' ? 'H1' :
           block.type === 'heading2' ? 'H2' :
           block.type === 'heading3' ? 'H3' :
           block.type === 'bulletList' ? '•' :
           block.type === 'numberedList' ? '1.' :
           block.type === 'quote' ? '"' : '¶'}
        </button>

        {/* Type picker dropdown */}
        {showTypeMenu && (
          <div className="absolute left-0 top-9 z-50 bg-[#13161f] border border-white/[0.09] rounded-xl shadow-2xl py-1.5 w-44 overflow-hidden">
            {(Object.keys(TYPE_LABELS) as BlockType[]).filter(t => !['image', 'divider'].includes(t)).map((t) => (
              <button
                key={t}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] transition-colors ${
                  block.type === t
                    ? 'text-primary bg-primary/10'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onTypeChange(block.id, t);
                  setShowTypeMenu(false);
                }}
              >
                <span className="w-5 text-center font-mono text-[11px] text-white/40">{TYPE_LABELS[t].icon}</span>
                {TYPE_LABELS[t].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bullet prefix */}
      {block.type === 'bulletList' && (
        <span className="mt-[5px] w-2 h-2 rounded-full bg-primary/70 shrink-0 select-none" />
      )}
      {block.type === 'numberedList' && (
        <span className="shrink-0 select-none text-[13px] font-mono text-primary/60 w-5 text-right mt-[3px]">
          {index + 1}.
        </span>
      )}

      {/* Quote left border */}
      {block.type === 'quote' && (
        <div className="shrink-0 w-[3px] self-stretch rounded-full bg-primary/40 my-0.5" />
      )}

      {/* Content editable */}
      <div
        ref={(el) => inputRef(el)}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`
          flex-1 focus:outline-none min-h-[1.5rem] break-words
          empty:before:content-[attr(data-placeholder)]
          empty:before:pointer-events-none
          empty:before:select-none
          ${isFocused
            ? 'empty:before:text-white/20'
            : 'empty:before:text-transparent'
          }
          ${textStyles[block.type] || textStyles.paragraph}
        `}
        onInput={(e) => onChange(block.id, e.currentTarget.textContent || '')}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        onFocus={() => onFocus(block.id)}
      />
    </div>
  );
}

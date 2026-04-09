"use client";

import React, { useState } from "react";
import { BrainOverlay } from "./brain-overlay";
import { Brain } from "lucide-react";

interface BrainButtonProps {
  label?: string;
}

export function BrainButton({ label = "Explore my brain" }: BrainButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-500/30 bg-violet-500/[0.08] text-sm font-medium text-violet-300 hover:text-violet-100 hover:border-violet-500/60 hover:bg-violet-500/[0.15] transition-all overflow-hidden"
      >
        {/* animated glow pulse */}
        <span className="absolute inset-0 rounded-xl bg-violet-500/10 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
        <Brain className="size-4 relative z-10" />
        <span className="relative z-10">{label}</span>
      </button>

      <BrainOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}

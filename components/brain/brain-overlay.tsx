"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy-load the heavy Three.js scene — SSR disabled
const BrainScene = dynamic(
  () => import("./brain-scene").then((m) => ({ default: m.BrainScene })),
  { ssr: false, loading: () => <BrainLoader /> }
);

function BrainLoader() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-violet-400/50 animate-spin" style={{ animationDuration: "1.5s" }} />
        <div className="absolute inset-4 rounded-full bg-violet-500/20 animate-pulse" />
      </div>
      <p className="text-sm text-white/40 animate-pulse">Loading neural network…</p>
    </div>
  );
}

interface BrainOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function BrainOverlay({ open, onClose }: BrainOverlayProps) {
  // lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            style={{ zIndex: 9998 }}
            onClick={onClose}
          />

          {/* panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed inset-0 sm:inset-4 md:inset-6 rounded-none sm:rounded-3xl overflow-hidden border border-white/[0.08]"
            style={{
              zIndex: 9999,
              background: "radial-gradient(ellipse at 30% 20%, rgba(99,66,155,0.18) 0%, rgba(5,5,15,0.97) 65%)",
            }}
          >
            {/* close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/8 hover:bg-white/16 border border-white/10 text-white/60 hover:text-white transition-all backdrop-blur"
            >
              <X className="size-4" />
            </button>

            {/* header */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xs font-semibold tracking-widest uppercase text-violet-400/70"
              >
                Neural Space
              </motion.p>
            </div>

            {/* Three.js canvas fills entire overlay */}
            <div className="w-full h-full">
              <BrainScene />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

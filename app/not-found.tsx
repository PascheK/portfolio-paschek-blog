'use client';

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ── Konami sequence ────────────────────────────────────────────────────────────
const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

// ── ASCII teapot ───────────────────────────────────────────────────────────────
const TEAPOT_ART = [
  "     ___________  ",
  "    |           | ",
  "    |    418    |]",
  "    |           | ",
  "     \\_________/ ",
  "        |   |     ",
  "       _|___|_    ",
];

// ── Glitch chars ───────────────────────────────────────────────────────────────
const GLITCH_CHARS = "!@#$%^&*<>[]{}|\\/?~`";

function useGlitch(active: boolean, text: string) {
  const [display, setDisplay] = React.useState(text);
  React.useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      setDisplay(
        text.split("").map((c) =>
          c !== " " && Math.random() < 0.4 + frame * 0.08
            ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            : c
        ).join("")
      );
      if (frame > 12) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [active, text]);
  return display;
}

// ── Confetti particle ──────────────────────────────────────────────────────────
const COLORS = ["#6366f1","#a855f7","#ec4899","#3b82f6","#10b981","#f59e0b","#ef4444","#06b6d4"];

function Particle({ x, delay }: { x: number; delay: number }) {
  const [vals] = React.useState(() => ({
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size:  6 + Math.random() * 8,
    drift: (Math.random() - 0.5) * 200,
    spin:  Math.random() * 720 - 360,
    round: Math.random() > 0.5,
  }));
  return (
    <motion.div
      style={{
        position: "fixed",
        left: `${x}%`,
        top: "-2%",
        width: vals.size,
        height: vals.size,
        borderRadius: vals.round ? "50%" : "2px",
        background: vals.color,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
      animate={{ y: ["0vh", "110vh"], x: [0, vals.drift], rotate: [0, vals.spin], opacity: [1, 1, 0] }}
      transition={{ duration: 2.2 + Math.random(), delay, ease: "easeIn" }}
    />
  );
}

// ── Terminal line ─────────────────────────────────────────────────────────────
function TerminalLine({ text, delay, color = "#86efac", prefix = ">" }: {
  text: string; delay: number; color?: string; prefix?: string;
}) {
  const [shown, setShown]   = React.useState(false);
  const [chars, setChars]   = React.useState(0);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setShown(true);
      let i = 0;
      const id = setInterval(() => { i++; setChars(i); if (i >= text.length) clearInterval(id); }, 22);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);

  if (!shown) return null;
  return (
    <div className="flex gap-2 font-mono text-sm leading-relaxed">
      <span style={{ color: "#4ade80" }}>{prefix}</span>
      <span style={{ color }}>{text.slice(0, chars)}</span>
      {chars < text.length && (
        <motion.span
          style={{ display:"inline-block", width:8, height:"1em", background:color, verticalAlign:"middle" }}
          animate={{ opacity:[1,0] }}
          transition={{ duration:0.5, repeat:Infinity }}
        />
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NotFound() {
  const [konamiIdx, setKonamiIdx]         = React.useState(0);
  const [glitching, setGlitching]         = React.useState(false);
  const [isTeapot, setIsTeapot]           = React.useState(false);
  const [showHint, setShowHint]           = React.useState(false);
  const [particles, setParticles]         = React.useState<number[]>([]);
  const [konamiProgress, setKonamiProgress] = React.useState<string[]>([]);

  const title404    = useGlitch(glitching, "404");
  const titleTeapot = useGlitch(glitching, "418");

  React.useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 4000);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === KONAMI[konamiIdx]) {
        const next = konamiIdx + 1;
        setKonamiProgress(prev => [...prev, key]);
        if (next === KONAMI.length) {
          setGlitching(true);
          setTimeout(() => {
            setIsTeapot(true);
            setGlitching(false);
            setParticles(Array.from({ length: 60 }, (_, i) => i));
          }, 600);
          setKonamiIdx(0);
          setKonamiProgress([]);
        } else {
          setKonamiIdx(next);
        }
      } else {
        setKonamiIdx(key === KONAMI[0] ? 1 : 0);
        setKonamiProgress(key === KONAMI[0] ? [key] : []);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [konamiIdx]);

  const links = [
    { href: "/en",          label: "Home" },
    { href: "/en/blog",     label: "Blog" },
    { href: "/en/projects", label: "Projects" },
  ];

  return (
    <section className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-16 overflow-hidden">
      {/* Confetti */}
      <AnimatePresence>
        {particles.map((i) => (
          <Particle key={i} x={10 + (i * 1.3) % 80} delay={i * 0.025} />
        ))}
      </AnimatePresence>

      {/* ── Terminal window ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
        style={{ background: "#0d1117" }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]" style={{ background: "#161b22" }}>
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 font-mono text-xs text-white/30 select-none">
            {isTeapot ? "teapot.sh — bash" : "system.log — bash"}
          </span>
        </div>

        {/* Terminal body */}
        <div className="px-5 py-5 font-mono text-sm space-y-1.5 min-h-[260px]">
          <AnimatePresence mode="wait">
            {!isTeapot ? (
              <motion.div key="error" exit={{ opacity: 0 }} className="space-y-1.5">
                <TerminalLine text="[system] HTTP request: resource not found"        delay={0}    color="#94a3b8" />
                <TerminalLine text="[router] Resolving path... FAILED"                delay={600}  color="#f87171" />
                <TerminalLine text="[404]   No route matched the requested URL"      delay={1200} color="#fbbf24" />
                <TerminalLine text="[sys]   Dumping stack trace..."                   delay={1900} color="#94a3b8" />
                <TerminalLine text="        at Router.resolve (core/router.js:42)"   delay={2300} color="#64748b" prefix=" " />
                <TerminalLine text="        at App.handleRequest (app.js:127)"        delay={2600} color="#64748b" prefix=" " />
                <TerminalLine text="[done]  This page does not exist."               delay={3200} color="#4ade80" />
              </motion.div>
            ) : (
              <motion.div key="teapot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-1">
                <TerminalLine text="[418]   I'm a teapot — RFC 2324"                  delay={0}   color="#a78bfa" />
                <TerminalLine text="[brew]  Attempting to brew coffee..."             delay={500} color="#94a3b8" />
                <TerminalLine text="[ERROR] Cannot brew coffee with a teapot!"       delay={1200} color="#f87171" />
                <TerminalLine text=""                                                  delay={1400} color="#86efac" />
                {TEAPOT_ART.map((line, i) => (
                  <TerminalLine key={i} text={line} delay={1500 + i * 80} color="#fbbf24" prefix=" " />
                ))}
                <TerminalLine text="[sys]   Congratulations. You found it."          delay={2200} color="#4ade80" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Big number ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative select-none mt-8 mb-4"
      >
        <AnimatePresence mode="wait">
          {!isTeapot ? (
            <motion.div key="n404" exit={{ opacity: 0, y: -20 }}>
              <span
                className="text-[7rem] sm:text-[10rem] font-black leading-none tracking-tighter"
                style={{
                  background: glitching
                    ? "linear-gradient(135deg,#ef4444,#f97316,#eab308)"
                    : "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: glitching ? "drop-shadow(0 0 20px #ef4444)" : "none",
                  transition: "filter 0.1s",
                }}
              >
                {title404}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="n418"
              initial={{ opacity: 0, y: 20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="flex items-center gap-4"
            >
              <span
                className="text-[7rem] sm:text-[10rem] font-black leading-none tracking-tighter"
                style={{
                  background: "linear-gradient(135deg,#fbbf24,#f59e0b,#ef4444)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px #fbbf2455)",
                }}
              >
                {titleTeapot}
              </span>
              <motion.span
                className="text-[4rem] sm:text-[6rem] leading-none"
                animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, repeatDelay: 3 }}
              >
                🫖
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Message ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="text-center mb-8"
      >
        <AnimatePresence mode="wait">
          {!isTeapot ? (
            <motion.div key="msg404" exit={{ opacity: 0 }}>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Page not found</h1>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </motion.div>
          ) : (
            <motion.div key="msg418" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "#fbbf24" }}>
                I&apos;m a teapot!
              </h1>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                RFC 2324 — This server refuses to brew coffee.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Nav links ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        className="flex flex-wrap gap-3 justify-center mb-10"
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface-alt/70 backdrop-blur text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
          >
            {label}
          </Link>
        ))}
      </motion.div>

      {/* ── Konami hint — appears after 4s ── */}
      <AnimatePresence>
        {showHint && !isTeapot && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-[11px] font-mono text-muted-foreground/50 select-none">
              psst… try this:
            </p>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {KONAMI.map((key, i) => {
                const label: Record<string, string> = {
                  ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
                };
                const done = i < konamiProgress.length;
                return (
                  <motion.kbd
                    key={i}
                    animate={{ scale: done ? [1, 1.3, 1] : 1 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center justify-center w-6 h-6 text-[10px] font-mono rounded border border-border/40 bg-surface-alt/30 text-muted-foreground/40"
                    style={{
                      color: done ? "#6366f1" : undefined,
                      borderColor: done ? "#6366f180" : undefined,
                    }}
                  >
                    {label[key] ?? key.toUpperCase()}
                  </motion.kbd>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

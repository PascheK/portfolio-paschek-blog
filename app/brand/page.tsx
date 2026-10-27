import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { CoverPlaceholder } from "@/components/brand/content-card";
import { LiveStatus } from "@/components/brand/live-status";
import { CopyButton } from "@/components/brand/copy-button";
import { readBrandTokens } from "@/lib/brand";

export const dynamic = "force-static";

// Unlisted reference page: not linked from the site, not indexed.
export const metadata: Metadata = {
  title: "Brand · Periwinkle Ink",
  description: "Design system of the PascheK portfolio.",
  robots: { index: false, follow: false },
};

const COLOR_TOKENS = [
  { name: "background", role: "Page" },
  { name: "foreground", role: "Headings, body" },
  { name: "surface", role: "Cards, inputs" },
  { name: "surface-alt", role: "Recessed panels, code" },
  { name: "muted-foreground", role: "Secondary text" },
  { name: "border", role: "Hairlines" },
  { name: "border-strong", role: "Hover, overlays" },
  { name: "primary", role: "The one accent" },
  { name: "primary-foreground", role: "Text on primary" },
  { name: "success", role: "Status only" },
  { name: "destructive", role: "Errors only" },
] as const;

const DO = [
  "Use semantic tokens for every color decision (bg-background, text-muted-foreground, var(--primary)).",
  "Reserve primary for the one primary CTA, links, the focus ring, the active nav item and selection.",
  "Keep backgrounds flat: background, surface, surface-alt.",
  "Write labels, dates, numbers and tags in Geist Mono, uppercase with letter-spacing for eyebrows.",
  "Use semantic HTML: one h1 per page, landmarks, lists for card grids, time for dates.",
  "Keep a visible 2px focus ring on every interactive element; touch targets ≥ 40px.",
  "Show a labeled gradient placeholder when a card has no cover image.",
];

const DONT = [
  "Do not introduce new color literals outside styles/globals.css. New colors need a new token.",
  "Do not use Tailwind palette colors (sky, emerald, violet, pink…). Status goes through success / destructive.",
  "Do not apply box-shadow for elevation or glow. Depth comes from borders.",
  "Do not use gradients on text, borders or buttons. Only the monochrome cover placeholder.",
  "Do not use weights above 600, or emoji as decoration.",
  "Do not add loops beyond the sanctioned list (status dot, hero glow, ticker, word rotation), nor bouncing, parallax, particles, snow or a custom cursor.",
  "Do not use stripes, dots, noise or grid background patterns.",
];

const TYPE_SCALE = [
  { cls: "t-display", name: "Display", spec: "clamp(36–60px) / 1.05 / −0.035em / 600", use: "Home hero only", sample: "Quiet by design." },
  { cls: "t-h1", name: "H1", spec: "clamp(32–44px) / 1.1 / −0.03em / 600", use: "Page title", sample: "Selected projects" },
  { cls: "t-h2", name: "H2", spec: "24px → 28px / 1.25 / −0.02em / 600", use: "Section title", sample: "Latest articles" },
  { cls: "t-h3", name: "H3", spec: "17px / 1.4 / −0.01em / 600", use: "Card title", sample: "Building a RAG chatbot" },
  { cls: "t-lead", name: "Lead", spec: "17px → 19px / 1.65 / 400, muted", use: "Intro paragraph", sample: "One quiet surface, one accent." },
] as const;

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96];

const MOTION = [
  { what: "Hover / focus", how: "color, border-color, background-color", time: "150ms ease-out" },
  { what: "Reveal on enter", how: "opacity 0→1, translateY 14px→0, once", time: "550ms cubic-bezier(.22,1,.36,1)" },
  { what: "Hero glow", how: "primary radial, slow drift", time: "26s ease-in-out, alternate" },
  { what: "Skills ticker", how: "translateX, pauses on hover/focus", time: "55s linear" },
  { what: "Word rotation", how: "cross-fade + 6px rise", time: "every 2.6s, 500ms fade" },
  { what: "Count-up", how: "stats, once when in view", time: "1.1s ease-out" },
  { what: "Card spotlight", how: "pointer-following primary radial", time: "instant, hover devices" },
  { what: "Page enter", how: "opacity only", time: "200ms ease-out" },
  { what: "Status dot", how: "opacity 1→0.35, the one sanctioned loop", time: "2.4s ease-in-out" },
  { what: "Reading progress", how: "scaleX mapped to scroll, 2px primary bar", time: "no easing" },
  { what: "Reduced motion", how: "all of the above disabled", time: "prefers-reduced-motion" },
];

function Eyebrow({ children, dot = false }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <p className="eyebrow flex items-center gap-2">
      {dot && <span className="size-1.5 rounded-full bg-primary" aria-hidden />}
      {children}
    </p>
  );
}

function SectionTitle({ id, label, title }: { id: string; label: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="eyebrow mb-4">{`// ${label}`}</p>
      <h2 id={id} className="t-h2 md:text-[2.25rem]">{title}</h2>
    </div>
  );
}

export default function BrandPage() {
  const { light, dark } = readBrandTokens();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container-page flex h-16 items-center gap-6">
          <Logo href="/en" />
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">/ brand</span>
          <nav aria-label="Brand sections" className="ml-auto hidden items-center gap-1 md:flex">
            {[
              ["#concept", "Concept"],
              ["#tokens", "Tokens"],
              ["#in-use", "In use"],
              ["#assets", "Assets"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="link-quiet rounded-md px-3 py-2 text-sm">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <ThemeToggle />
            <Link href="/en" className="btn btn-secondary btn-sm">
              Site
              <ArrowUpRight aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <div className="container-page">

          {/* ── Hero ───────────────────────────────────────────── */}
          <section aria-labelledby="brand-title" className="py-20 md:py-32">
            <Eyebrow dot>Brand · Periwinkle Ink</Eyebrow>
            <h1
              id="brand-title"
              className="mt-8 text-[clamp(3rem,11vw,8rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
            >
              Periwinkle Ink
              <span className="ml-[0.04em] inline-block size-[0.16em] bg-primary align-baseline" aria-hidden />
            </h1>
            <p className="t-lead mt-8 max-w-xl">
              <strong className="font-medium text-foreground">One quiet surface, one accent.</strong>{" "}
              A flat, mono-typed system in two moods — clean dark and minimal light — that spends a single
              periwinkle, taken from the PascheK logo, on the moments that matter.
            </p>
          </section>

          {/* ── Concept ────────────────────────────────────────── */}
          <section id="concept" aria-labelledby="concept-title" className="section border-t border-border">
            <SectionTitle id="concept-title" label="Concept" title="Quiet surface, single accent." />
            <div className="grid gap-8 text-[0.9375rem] leading-relaxed text-muted-foreground md:grid-cols-2 md:gap-12">
              <p>
                Periwinkle Ink earns its accent. The page is flat, structured by hairline borders and two type
                voices — <strong className="font-medium text-foreground">Geist</strong> for reading and{" "}
                <strong className="font-medium text-foreground">Geist Mono</strong> for labels, numbers and
                structural marks. Depth never comes from shadows.
              </p>
              <p>
                The periwinkle <code className="font-mono text-foreground">#97a8dd</code> comes straight from the
                logo tile. In dark it is used as-is; in light a deeper sibling keeps text and buttons readable on
                white. It marks links, the primary button, focus, the active nav item — and stays out of
                everything else.
              </p>
            </div>

            <div className="mt-16 grid gap-12 md:grid-cols-2">
              <div>
                <p className="eyebrow mb-6">Do</p>
                <ul className="flex flex-col gap-4">
                  {DO.map((t) => (
                    <li key={t} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-0.5 font-mono text-primary" aria-hidden>+</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-6">Do not</p>
                <ul className="flex flex-col gap-4">
                  {DONT.map((t) => (
                    <li key={t} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-0.5 font-mono text-destructive" aria-hidden>×</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── Tokens ─────────────────────────────────────────── */}
          <section id="tokens" aria-labelledby="tokens-title" className="section border-t border-border">
            <SectionTitle id="tokens-title" label="Tokens" title="Colors and type." />

            <p className="eyebrow mb-4">Color</p>
            <p className="mb-6 max-w-xl text-sm text-muted-foreground">
              Read live from <code className="font-mono text-foreground">styles/globals.css</code>. Each swatch
              is shown on its own theme background. Every text pair meets WCAG AA.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COLOR_TOKENS.map(({ name, role }) => (
                <li key={name} className="card p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Dark", value: dark[name], bg: dark["background"], fg: dark["muted-foreground"] },
                      { label: "Light", value: light[name], bg: light["background"], fg: light["muted-foreground"] },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-lg border border-border p-2"
                        style={{ backgroundColor: m.bg }}
                      >
                        <div className="h-12 rounded-md" style={{ backgroundColor: m.value }} />
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: m.fg }}>
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                  <dl className="mt-3 space-y-1 font-mono text-[11px] text-muted-foreground">
                    <div className="flex justify-between gap-3"><dt>dark</dt><dd className="truncate text-foreground/80">{dark[name]}</dd></div>
                    <div className="flex justify-between gap-3"><dt>light</dt><dd className="truncate text-foreground/80">{light[name]}</dd></div>
                    <div className="flex justify-between gap-3"><dt>css</dt><dd className="truncate">var(--{name})</dd></div>
                  </dl>
                </li>
              ))}
              <li className="card p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex gap-2">
                  <div className="h-[4.75rem] flex-1 rounded-lg border border-border" style={{ backgroundColor: light["brand-periwinkle"] }} />
                  <div className="h-[4.75rem] flex-1 rounded-lg border border-border" style={{ backgroundColor: light["brand-ink"] }} />
                </div>
                <p className="mt-4 text-sm font-medium">brand constants</p>
                <p className="text-xs text-muted-foreground">Logo colors, theme independent</p>
                <dl className="mt-3 space-y-1 font-mono text-[11px] text-muted-foreground">
                  <div className="flex justify-between gap-3"><dt>periwinkle</dt><dd className="text-foreground/80">{light["brand-periwinkle"]}</dd></div>
                  <div className="flex justify-between gap-3"><dt>ink</dt><dd className="text-foreground/80">{light["brand-ink"]}</dd></div>
                </dl>
              </li>
            </ul>

            <p className="eyebrow mb-4 mt-16">Type</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-6">
                <p className="eyebrow mb-6">Sans</p>
                <p className="text-4xl font-semibold tracking-[-0.03em]">Periwinkle Ink.</p>
                <p className="mt-6 font-mono text-xs text-muted-foreground">&apos;Geist&apos;, system-ui, sans-serif</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">var(--font-sans)</p>
              </div>
              <div className="card p-6">
                <p className="eyebrow mb-6">Mono</p>
                <p className="font-mono text-4xl font-medium tracking-[-0.03em]">Periwinkle Ink.</p>
                <p className="mt-6 font-mono text-xs text-muted-foreground">&apos;Geist Mono&apos;, ui-monospace, monospace</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">var(--font-mono)</p>
              </div>
            </div>

            <p className="eyebrow mb-4 mt-16">Scale</p>
            <ul className="divide-y divide-border border-y border-border">
              {TYPE_SCALE.map((t) => (
                <li key={t.name} className="grid items-baseline gap-2 py-6 md:grid-cols-[8rem_1fr_16rem] md:gap-8">
                  <p className="eyebrow">{t.name}</p>
                  <p className={t.cls}>{t.sample}</p>
                  <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {t.spec}
                    <br />
                    {t.use}
                  </p>
                </li>
              ))}
              <li className="grid items-baseline gap-2 py-6 md:grid-cols-[8rem_1fr_16rem] md:gap-8">
                <p className="eyebrow">Eyebrow</p>
                <p className="eyebrow">Mono · uppercase · 0.12em</p>
                <p className="font-mono text-[11px] text-muted-foreground">12px / 1 / 400<br />Labels above titles</p>
              </li>
            </ul>

            <div className="mt-16 grid gap-12 md:grid-cols-2">
              <div>
                <p className="eyebrow mb-6">Spacing · 4px base</p>
                <ul className="flex flex-col gap-2">
                  {SPACING.map((s) => (
                    <li key={s} className="flex items-center gap-4">
                      <span className="w-10 font-mono text-[11px] text-muted-foreground">{s}</span>
                      <span className="h-3 rounded-sm bg-primary/70" style={{ width: s * 2 }} aria-hidden />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-6">Radius</p>
                <ul className="flex flex-wrap gap-4">
                  {[
                    ["6", "chips, tags", "rounded-md"],
                    ["8", "buttons, inputs", "rounded-lg"],
                    ["12", "cards, panels", "rounded-xl"],
                  ].map(([px, label, cls]) => (
                    <li key={px} className="flex flex-col gap-2">
                      <span className={`block size-20 border border-border-strong bg-surface-alt ${cls}`} aria-hidden />
                      <span className="font-mono text-[11px] text-foreground">{px}px</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── In use ─────────────────────────────────────────── */}
          <section id="in-use" aria-labelledby="in-use-title" className="section border-t border-border">
            <SectionTitle id="in-use-title" label="In use" title="Live signature elements." />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-6">
                <p className="eyebrow mb-6">Logo + wordmark</p>
                <div className="flex items-end gap-6">
                  <LogoMark size={64} />
                  <LogoMark size={32} />
                  <LogoMark size={28} />
                </div>
                <div className="mt-6"><Logo href="/en" size={32} /></div>
                <p className="mt-6 text-sm text-muted-foreground">
                  Tile at 28px in the nav, 32px in the footer. Never recolored, rotated or given effects.
                  The wordmark is written <span className="font-mono text-foreground">PascheK</span>.
                </p>
              </div>

              <div className="card p-6">
                <p className="eyebrow mb-6">Live status</p>
                <LiveStatus lang="en" doing="Building a Unity game" />
                <p className="mt-6 text-sm text-muted-foreground">
                  Swiss local time ticking every 15s and a 6px dot that breathes — the one sanctioned loop. <span className="font-mono text-foreground">success</span> is the only status hue.
                </p>
                <p className="eyebrow mb-4 mt-8">Tags</p>
                <ul className="flex flex-wrap gap-1.5">
                  {["Next.js", "TypeScript", "Docker", "RAG"].map((t) => (
                    <li key={t} className="tag">{t}</li>
                  ))}
                </ul>
              </div>

              <div className="card p-6">
                <p className="eyebrow mb-6">Three-tier CTA</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="btn btn-primary">Primary action <ArrowRight aria-hidden /></span>
                  <span className="btn btn-secondary">Secondary</span>
                  <span className="btn btn-ghost"><Download aria-hidden />Ghost</span>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  Primary is filled with <span className="font-mono text-foreground">primary</span> — one per section.
                  Secondary is outlined with <span className="font-mono text-foreground">border-strong</span>. Ghost is text only.
                  Height 40px, radius 8px.
                </p>
              </div>

              <div className="card p-6">
                <p className="eyebrow mb-6">Form field</p>
                <label htmlFor="brand-demo" className="mb-2 block text-sm font-medium">Your email</label>
                <input id="brand-demo" type="email" placeholder="john@example.com" className="field" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Focus shows a 2px <span className="font-mono text-foreground">ring</span> outline, offset 1px. Click the field to try it.
                </p>
              </div>
            </div>

            <p className="eyebrow mb-4 mt-16">Copy to clipboard</p>
            <div className="card flex max-w-md items-center justify-between p-4 text-sm">
              <span className="font-mono text-xs text-muted-foreground">killian.pasche7@gmail.com</span>
              <CopyButton value="killian.pasche7@gmail.com" label="Copy email" copyText="Copy" copiedText="Copied" />
            </div>

            <p className="eyebrow mb-4 mt-16">Cover placeholders</p>
            <p className="mb-6 max-w-xl text-sm text-muted-foreground">
              Used when a project or article has no image: a monochrome gradient from <span className="font-mono text-foreground">primary</span> into{" "}
              <span className="font-mono text-foreground">surface-alt</span>, three fixed angles picked by slug, labeled in mono. Never stock imagery.
            </p>
            <ul className="grid gap-4 sm:grid-cols-3">
              {[["a", "Next.js"], ["b", "Unity"], ["c", "Docker"]].map(([seed, label]) => (
                <li key={seed} className="card overflow-hidden">
                  <div className="aspect-[16/9] border-b border-border">
                    <CoverPlaceholder seed={`/en/blog/${seed}`} label={label.toUpperCase()} />
                  </div>
                  <p className="p-4 font-mono text-[11px] text-muted-foreground">CoverPlaceholder · {label}</p>
                </li>
              ))}
            </ul>

            <p className="eyebrow mb-4 mt-16">Motion</p>
            <ul className="divide-y divide-border border-y border-border">
              {MOTION.map((m) => (
                <li key={m.what} className="grid gap-1 py-4 md:grid-cols-[10rem_1fr_16rem] md:gap-8">
                  <p className="text-sm font-medium">{m.what}</p>
                  <p className="text-sm text-muted-foreground">{m.how}</p>
                  <p className="font-mono text-[11px] text-muted-foreground md:pt-0.5">{m.time}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Assets ─────────────────────────────────────────── */}
          <section id="assets" aria-labelledby="assets-title" className="section border-t border-border">
            <SectionTitle id="assets-title" label="Assets" title="Source files." />
            <ul className="grid gap-4 md:grid-cols-3">
              {[
                { name: "brand.md", href: "/brand/brand.md", desc: "Written spec: tokens, DO / DO NOT, motion, accessibility. Paste it into any AI or generator." },
                { name: "tokens.css", href: "/brand/tokens.css", desc: "Brand CSS variables for both themes, generated from styles/globals.css." },
                { name: "paschek-logo.svg", href: "/brand/paschek-logo.svg", desc: "Logo tile, 64×64. Periwinkle #97a8dd, ink #303030." },
              ].map((a) => (
                <li key={a.name}>
                  <a href={a.href} target="_blank" rel="noreferrer" className="card card-interactive group flex h-full flex-col p-6">
                    <span className="flex items-center justify-between">
                      <span className="eyebrow">{a.name}</span>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
                        Open <ArrowUpRight className="size-4" aria-hidden />
                      </span>
                    </span>
                    <span className="mt-4 text-sm leading-relaxed text-muted-foreground">{a.desc}</span>
                    <span className="mt-4 font-mono text-[11px] text-muted-foreground">{a.href}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Colophon ───────────────────────────────────────── */}
          <section aria-labelledby="colophon-title" className="section border-t border-border">
            <p className="eyebrow mb-4">{"// Colophon"}</p>
            <h2 id="colophon-title" className="t-h2">Set in Geist.</h2>
            <dl className="mt-8 grid gap-6 sm:grid-cols-3">
              <div><dt className="eyebrow mb-2">Type</dt><dd className="text-sm">Geist and Geist Mono, by Vercel.</dd></div>
              <div><dt className="eyebrow mb-2">Last updated</dt><dd className="font-mono text-sm">2026-10-26</dd></div>
              <div><dt className="eyebrow mb-2">License</dt><dd className="font-mono text-sm">MIT</dd></div>
            </dl>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Periwinkle Ink is the design system of the PascheK portfolio. It keeps the site coherent over
              time and gives any tool or agent a single reference to follow when generating new collateral.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

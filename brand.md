# Periwinkle Ink

Periwinkle Ink is the visual system of the PascheK portfolio. It is a quiet,
flat, borderline-monochrome surface that earns **one** accent — the periwinkle
taken straight from the PascheK logo — and spends it sparingly: links, the
primary button, the focus ring, the active nav item, the logo tile.
Everything else is held back. Depth comes from hairline borders, never from
shadows. Type does the heavy lifting in two voices: `Geist` for reading and
`Geist Mono` for labels, numbers and structural marks.

It ships in two moods that share the same structure and the same hue:

- **Clean dark** (default for dark-mode readers): near-black ink surface,
  crisp off-white text, periwinkle accent.
- **Minimal light**: paper-white surface, ink text, a deeper periwinkle accent
  so it stays readable on white.

This file is the single source of truth for anyone (human, AI, generator)
extending the site. The tokens below are implemented in `styles/globals.css`.

## Logo

- File: `public/brand/paschek-logo.svg` (64×64, periwinkle tile `#97a8dd`,
  ink glyph `#303030`).
- Component: `components/brand/logo.tsx` — tile + `PascheK` wordmark.
- Wordmark is written `PascheK` (capital P, capital K). Weight 600, tracking
  `-0.01em`.
- Use the tile at 28 px in the nav and 32 px in the footer. Never recolor,
  rotate, outline or add effects. Keep ≥ 8 px clear space around it.
- The tile is the only place where the raw brand periwinkle appears in both
  themes.

## Tokens

### Colors (use only these)

| Token                | Dark (clean dark)          | Light (minimal light)      | Use                                  |
| -------------------- | -------------------------- | -------------------------- | ------------------------------------ |
| `background`         | `#0b0c10`                  | `#f7f7f9`                  | Page                                 |
| `foreground`         | `#ececf2`                  | `#15161b`                  | Headings, body                       |
| `surface` / `card`   | `#111319`                  | `#ffffff`                  | Cards, inputs, popovers              |
| `surface-alt`        | `#161922`                  | `#f0f0f4`                  | Recessed panels, code, hover fills   |
| `muted-foreground`   | `#9096a8`                  | `#5a5f70`                  | Secondary text, labels               |
| `border`             | `rgba(255,255,255,0.08)`   | `rgba(21,22,27,0.10)`      | Hairlines                            |
| `border-strong`      | `rgba(255,255,255,0.16)`   | `rgba(21,22,27,0.18)`      | Hover, inputs, popovers              |
| `primary`            | `#97a8dd`                  | `#3b4c9b`                  | Accent: CTA, links, focus, active    |
| `primary-foreground` | `#0f1118`                  | `#ffffff`                  | Text on `primary`                    |
| `success`            | `#5ec58a`                  | `#1d7a4a`                  | "Open to work", confirmations only   |
| `destructive`        | `#f0626a`                  | `#c23a43`                  | Errors, delete only                  |

Brand constants (theme independent): `periwinkle #97a8dd`, `ink #303030`.

All text/background pairs above meet WCAG 2.1 AA (≥ 4.5:1): body ≥ 16:1,
muted ≥ 5.6:1, primary text ≥ 7.2:1, primary button label ≥ 7.8:1.

Reference tokens in code as semantic utilities (`bg-background`,
`text-muted-foreground`, `border-border`, `bg-primary`…) or
`var(--background)` in CSS. Opacity modifiers (`bg-primary/10`,
`text-foreground/60`) are allowed.

### Fonts

- Sans: `Geist`, `system-ui`, `sans-serif` — body and headings.
- Mono: `Geist Mono`, `ui-monospace`, `monospace` — eyebrows, tags, numbers,
  dates, keyboard hints, code.

Weights: 400 body, 500 UI/labels, 600 headings. **No 700/800/900.** There is no
third typeface.

### Type scale

| Class        | Size                          | Line | Tracking  | Weight | Use                         |
| ------------ | ----------------------------- | ---- | --------- | ------ | --------------------------- |
| `.t-display` | `clamp(2.25rem, 6vw, 3.75rem)`| 1.05 | `-0.035em`| 600    | Home hero only              |
| `.t-h1`      | `clamp(2rem, 4.5vw, 2.75rem)` | 1.1  | `-0.03em` | 600    | Page title                  |
| `.t-h2`      | `1.5rem` → `1.75rem` ≥ 768px  | 1.25 | `-0.02em` | 600    | Section title               |
| `.t-h3`      | `1.0625rem`                   | 1.4  | `-0.01em` | 600    | Card title                  |
| `.t-lead`    | `1.0625rem` → `1.1875rem`     | 1.65 | 0         | 400    | Intro paragraph (muted)     |
| body         | `1rem`                        | 1.7  | 0         | 400    | Text                        |
| small        | `0.875rem`                    | 1.6  | 0         | 400    | Card summary, meta          |
| `.eyebrow`   | `0.75rem` mono, uppercase     | 1    | `0.12em`  | 400    | Labels above titles         |

### Spacing

4 px base. Use only: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.

- Page container: `.container-page` — max width `64rem` (1024 px),
  inline padding `20px` mobile / `32px` ≥ 640px. Every page uses it.
- Reading width: `max-w-3xl` for articles (~68 characters).
- Section rhythm: `.section` = `64px` vertical padding, `96px` ≥ 768px.
- Page header: `48px` top, `40px` bottom; gap title → lead `12px`.
- Card padding `20px`; grid gap `16px` (mobile) / `20px` (≥ 640px).
- Heading → content: `24px` for sections, `16px` inside cards.

### Radius

`6px` chips/tags/kbd · `8px` buttons, inputs · `12px` cards, panels, images ·
`9999px` only for dots and the language/theme icon buttons. `rounded-2xl` and
above is remapped to 12 px so legacy markup stays uniform.

### Borders & depth

1 px `border`; `border-strong` on hover/focus/overlays. **No `box-shadow`.**
Overlays (command palette, select, mobile menu) use `border-strong` on
`popover`. Sticky header uses `border` + a solid `background`, no blur glow.

## Components

- **Button** — `.btn` + one variant, height 40 px (36 px `.btn-sm`), radius 8 px,
  label 14 px / 500.
  - `.btn-primary`: `primary` fill, `primary-foreground` text. **One per section.**
  - `.btn-secondary`: `surface` fill, `border-strong` outline, `foreground` text.
  - `.btn-ghost`: transparent, `muted-foreground` → `foreground` on hover.
  - Trailing arrow `→` icon (16 px) on navigational CTAs.
- **Card** — `.card`: `card` fill, 1 px `border`, 12 px radius. Interactive cards
  (`.card-interactive`) only change border to `border-strong` and the title to
  `primary` on hover. No lift, no scale.
- **Tag** — `.tag`: mono 11 px, 6 px radius, 1 px `border`, `muted-foreground`.
- **Eyebrow** — `.eyebrow`, optionally followed by a count in `foreground`.
- **Cover placeholder** — when a project/post has no image, render
  `CoverPlaceholder`: a flat monochrome gradient built from `primary` mixed
  into `surface-alt` (three fixed angles chosen by slug hash) with a mono label
  (first tag, uppercase) bottom-left. Never lorem ipsum, never stock imagery.
- **Status dot** — 6 px dot, `success` only, static (no pulse).

## Thumbnails

Project and article covers use two generic templates in `brand/thumbnails/` (1920 × 1080, editable SVG + PNG, with a
safe-zone overlay, the Geist fonts in `brand/fonts/`, step-by-step rebuild instructions and prompts for a generative AI).

- **Format**: 16:9 PNG, sRGB, under ~250 KB; pages crop it to 21:9, so keep content inside `y = 128 → 952` and 120 px side margins.
- **Look**: the same flat gradient as the cover placeholder (`primary` 26 % → 6 % into `surface-alt`), one soft `primary` glow,
  Geist SemiBold titles, Geist Mono labels, the PascheK mark bottom-right. No shadows, no stock photos, no emoji.
- **Files**: `public/projects/<slug>.png` or `public/blogs/<slug>.png`, referenced by `image:` in the frontmatter.

## Motion

Quiet on purpose. Motion adds life, never noise: nothing bounces, nothing
shakes, nothing hijacks the scroll or the cursor. Every loop below is slow,
pauses on hover where it can, and stops under `prefers-reduced-motion`.

- Hover/focus: `color`, `border-color`, `background-color` in `150ms`
  `ease-out`.
- Reveal on enter: `opacity 0→1` and `translateY(14px→0)`, `550ms`,
  `cubic-bezier(0.22, 1, 0.36, 1)`, once, children staggered by `40ms` max.
- Theme switch: colors transition `200ms`.
- `prefers-reduced-motion: reduce` disables reveals and smooth scrolling.
- Loops are limited to the sanctioned list in Life below.

### Life

The site feels alive through **content and small interactions**, not ambient
effects. Sanctioned moments, all quiet and all disabled or static under
`prefers-reduced-motion`:

- **Live status** (`LiveStatus`): Swiss local time (updates every 15 s, no
  animation) + what I'm doing now, next to the hero eyebrow. The 6 px
  `success` dot "breathes" (`opacity 1→0.35`, 2.4 s) — the one sanctioned loop.
- **Home atmosphere** (home only): a soft `primary` glow behind the hero that
  drifts very slowly (26 s, 16–30 % strength); the name gets a `primary` marker
  that draws in once; "I build …" cross-fades through four phrases every
  2.6 s; the skills row is a slow ticker (55 s per lap, pauses on hover/focus);
  stats count up once when scrolled into view.
- **Scroll timeline** (About): a hairline rail fills with `primary` as you read
  down the experience list; each node lights up when reached, the entry being
  read is highlighted and the ones ahead are softened; year labels stay pinned.
- **Card spotlight**: interactive cards get a soft `primary` radial highlight
  that follows the pointer (hover devices only); cover images zoom 3 % on hover.
- **Reading progress**: 2 px `primary` bar on articles, mapped to scroll.
- **Section rail** (`SectionRail`, ≥ 1360 px): hairline rail on the right listing
  the sections of the page (home) or the headings of an article (blog /
  projects, replacing the old table of contents); the section being read is lit
  in `primary`.
- **Copy to clipboard**: email / phone rows confirm in place ("Copied", icon
  swap), announced politely.
- **Keyboard layer**: `g` then `h b p a u c` navigates, `t` toggles theme,
  `?` lists everything, `⌘K` opens the palette.

## DO

- Use semantic tokens for every color decision.
- Reserve `primary` for: the one primary CTA, links, the focus ring, the active
  nav item, selection. One accent moment per surface.
- Keep backgrounds flat (`background`, `surface`, `surface-alt`).
- Write labels, dates, numbers and tags in Geist Mono.
- Use semantic HTML: one `<h1>` per page, `<header>`, `<nav aria-label>`,
  `<main id="main">`, `<section aria-labelledby>`, `<article>`, `<time>`,
  `<ul>` for card lists, `<figure>` for images.
- Keep a visible 2 px `ring` focus outline (offset 2 px) on every interactive
  element. Touch targets ≥ 40 px.
- Design mobile-first: single column by default, grids from `sm`/`lg`.
- Keep Cover placeholders labeled and meaningful.

## DO NOT

- Do not introduce new color literals (`#xxxxxx`, `rgb()`, `oklch()`) outside
  `styles/globals.css` and this file. New colors need a new token.
- Do not use Tailwind palette colors (`text-sky-400`, `bg-emerald-500/10`,
  `from-indigo-500`…). Status colors go through `success` / `destructive`.
- Do not use gradients on text, borders, buttons or backgrounds, except the
  monochrome cover placeholder.
- Do not apply `box-shadow` for elevation, glows, or blur-heavy glass.
- Do not use weights above 600, all-caps outside `.eyebrow`, or emoji as
  decoration.
- Do not add loops beyond the sanctioned list in Life, nor bouncing, parallax,
  particle, snow, custom cursor, or smooth-scroll hijacking effects.
- Do not use stripes, dots, noise or grid background patterns.
- Do not add a JS animation to something CSS can do in one line.

## Accessibility

- Contrast: AA minimum for text; borders carry no meaning on their own.
- Focus: `:focus-visible` ring on `primary`, never removed without replacement.
- Skip link to `#main` is the first focusable element.
- `lang` is set from the route; `aria-current="page"` on the active nav link;
  menu button exposes `aria-expanded` / `aria-controls`.
- Color is never the only carrier of state (active nav also gets weight, status
  dots come with text).

## Reference

- Tokens implementation: `styles/globals.css`
- Live reference page (unlisted, noindex): `/brand` — reads the tokens straight
  from `styles/globals.css`; also serves `/brand/brand.md` and `/brand/tokens.css`
- Primitives: `components/brand/*`, `components/ui/button.tsx`
- Logo: `public/brand/paschek-logo.svg`

License for this document: MIT, same as the repository.

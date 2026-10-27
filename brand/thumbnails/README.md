# Thumbnail templates

Two generic 1920 × 1080 templates in the Periwinkle Ink style (see `/brand.md`):

| File | Use |
| --- | --- |
| `thumbnail-project.png` / `.svg` | Projects: a browser window to fill with a screenshot, a group chip, the PascheK mark |
| `thumbnail-blog.png` / `.svg` | Articles: category eyebrow, two-line title with the periwinkle marker and square period, meta row, the PascheK mark |
| `thumbnail-*-outlined.svg` | Same files with the text converted to shapes: opens identically anywhere, fonts not needed (text not editable) |
| `thumbnail-guides.png` / `.svg` | Transparent overlay of the safe zone and crop lines: drop it on top while working, hide it before exporting |
| `../fonts/` | Geist + Geist Mono (OFL license). **Install them** before opening the editable `.svg` in Illustrator / Photoshop |

The `.svg` files (not outlined) contain live text and named groups/layers: `background`, `screenshot-window`,
`label`, `eyebrow`, `title`, `meta`, `brand`, `guides` (hidden).

## Specs

- **Size**: 1920 × 1080 px (16:9), sRGB.
- **Where it shows**: cards (projects, blog, home) show the full 16:9. Project and article pages crop it to **21:9**
  (centered), so keep everything important inside the **safe zone**: 120 px side margins, `y = 128 → 952`.
- **Export**: PNG, aim for under ~250 KB (or WebP quality 85). Name it after the slug.
- **Where to put it**: `public/projects/<slug>.png` or `public/blogs/<slug>.png`, then in the MDX frontmatter:
  `image: "/projects/<slug>.png"`. Without an image the site shows a labeled gradient placeholder.

## Colors and type

| Role | Value |
| --- | --- |
| Background gradient 135° | `#373E53` → `#1E222D` (primary 26 % → 6 % mixed into surface-alt) |
| Glow (radial, top right) | `#97A8DD` at 30 % → 0 % |
| Window / inset surface | `#0B0C10`, panels `#111319`, address bar `#161922`, hairline `#3D4150` |
| Text | `#ECECF2`; secondary `#9096A8` |
| Accent (dot, marker, period) | `#97A8DD` (marker at 34 % opacity) |

- **Title**: Geist SemiBold, 108 px, letter-spacing −3.6 px.
- **Labels / meta**: Geist Mono Medium, uppercase, 5 px tracking (eyebrow) / 3 px (chip).
- **Rules**: flat, no drop shadows, no other gradient than the background, one accent color, no emoji, no stock photos.

## Rebuild it in Photoshop / Illustrator

1. New 1920 × 1080 px document, RGB. Fill with a 135° linear gradient `#373E53 → #1E222D`.
2. Add a circle (r ≈ 650 px) at the top right filled with a radial gradient `#97A8DD` 30 % → 0 % (this is the glow).
3. **Project**: a rounded rectangle 1320 × 720 (radius 24, fill `#0B0C10`, 2 px stroke `#3D4150`) centered at y = 536.
   Paste your screenshot inside it with a rounded-corner mask. Add the chip bottom-left and the logo + "PascheK" bottom-right.
4. **Blog**: eyebrow dot + label, title in two lines at x = 120, a `#97A8DD` 34 % rectangle (height ≈ 0.34 × font size) under the last
   words, a 24 × 24 px square period right after the title, then the meta row. Logo bottom-right.
5. Show `thumbnail-guides.png` on top to check the safe zone, hide it, export.

The logo file is `public/brand/paschek-logo.svg` (48 × 48 px here).

## Prompts for a generative AI

Image generators are poor at text and exact layout. Best workflow: generate the **background only** (no text, no logo),
then add the text, the window and the logo yourself with the template above. Both prompts below are written for that.

### Project thumbnail (background / mockup)

```
A clean, minimal, flat 16:9 background for a developer portfolio project card, 1920x1080.
Smooth diagonal gradient from slate blue-grey (#373E53) at the top left to very dark navy (#1E222D) at the bottom right,
with a soft, diffuse periwinkle (#97A8DD) glow in the upper right corner.
Centered, a plain dark browser window mockup (near-black #0B0C10, rounded corners, thin subtle border, three small grey
window dots, a pill-shaped address bar) with an empty interior made of simple dark rounded panels and no readable text.
Modern, calm, premium, lots of negative space. Flat design, no drop shadows, no neon, no 3D, no photorealism, no people,
no logos, no text, no watermarks.
```

### Blog thumbnail (background)

```
A clean, minimal, flat 16:9 background for a developer blog article cover, 1920x1080.
Smooth diagonal gradient from slate blue-grey (#373E53) at the top left to very dark navy (#1E222D) at the bottom right,
with a large soft periwinkle (#97A8DD) glow in the upper right. The left half is left completely empty and calm for a title.
One very subtle, abstract, low-contrast geometric accent at most (a thin outline circle or a small square) in periwinkle.
Modern, quiet, editorial, lots of negative space. Flat design, no drop shadows, no neon, no 3D, no photorealism, no people,
no text, no letters, no logos, no watermarks.
```

**Negative prompt** (if the tool supports it): `text, letters, words, logo, watermark, people, face, photo, 3d render,
neon, rainbow, busy pattern, noise, drop shadow, glossy, bokeh, clutter`.

**Tips**: ask for `--ar 16:9` (or 1920x1080), regenerate until the left of the blog background is clean, then place the title.
For a light-theme variant, ask for the same with a pale grey-blue gradient (`#E4E6EE` → `#F7F7F9`) and a deep indigo (`#3B4C9B`) glow.

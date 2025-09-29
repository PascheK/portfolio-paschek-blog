# Portfolio (Multilingue + MDX + Thèmes)

Architecture personnelle basée sur Next.js App Router, orientée contenu (blog + projets) avec internationalisation (en/fr), theming clair/sombre et pages animées.

## Stack

- Framework: Next.js (App Router)
- Langage: TypeScript
- Styling: Tailwind CSS + design tokens (OKLCH) via CSS custom properties
- Animations: Framer Motion (révélations, transitions de page)
- Contenu: MDX (blog + projets par langue)
- Thèmes: `next-themes` (classe `dark` + tokens CSS)
- SEO: metadata dynamique, sitemap, robots, JSON-LD, OpenGraph
- Feeds: RSS / Atom / JSON
- Analytics: Vercel Analytics + Speed Insights

## Fonctionnalités principales

- Structure multilingue `/[lang]` (en, fr) avec génération statique
- Dictionnaires JSON centralisés (`/app/[lang]/dictionaries`)
- Pages blog & projets partageant un layout détaillé cohérent (image, titre gradient, date localisée, résumé, CTA)
- Page About type mini‑CV (expériences, compétences, éducation, téléchargement CV)
- Filtrage projets sans effets de bord (source de vérité immuable + dérivation)
- Thème clair étendu (tokens surfaces) + dark existant
- Composants réutilisables (nav accessible, pagination, reveal, media embeds)

## Structure de contenu

```text
content/
  blog/
    en/*.mdx
    fr/*.mdx
  projects/
    en/*.mdx
    fr/*.mdx
```

Frontmatter typique projet :

```md
---
title: "Nom"
publishedAt: "2025-09-01"
summary: "Résumé bref"
image: "/opengraph-image.png"
url: "https://exemple.com"
tags: "tag1,tag2"
repoUrl: "https://github.com/xxx"
ctaLabel: "Voir le code"
ctaUrl: "https://github.com/xxx"
---
```

## Démarrage

Installer dépendances :

```bash
npm install
```

Lancer dev :

```bash
npm run dev
```

Build :

```bash
npm run build && npm start
```

## Configuration rapide

1. Modifier `lib/config.ts` (metaData, socialLinks)
2. Ajouter / traduire dictionnaires dans `app/[lang]/dictionaries`
3. Placer vos MDX dans `content/{blog|projects}/{lang}`
4. Ajuster `app/[lang]/sitemap.ts` si nouvelles routes
5. Vérifier les images (Open Graph, favicon)

## Ajout d'un projet

1. Créer deux fichiers MDX : `content/projects/en/slug.mdx` et `content/projects/fr/slug.mdx`
2. Remplir le frontmatter (voir modèle ci-dessus)
3. L'image référencée doit être dans `public/` (ex: `/opengraph-image.png`)
4. Le projet apparaîtra automatiquement (chargé par `getProjectPosts`)

## Filtrage projets (pattern)

Principe : ne jamais muter la liste complète; dériver.

```ts
const filtered = useMemo(
  () => selected === '__all__' ? all : all.filter(p => p.metadata.tags?.includes(selected)),
  [all, selected]
);
```

## i18n

- Langue injectée via segment dynamique `[lang]`
- `generateStaticParams` fournit `['en','fr']`
- Dictionnaire chargé côté serveur `getDictionary(lang)`

## Thème

Système bi‑thème basé sur attribut `data-theme` (light par défaut, `data-theme="dark"`) + variables CSS (OKLCH) centralisées dans `styles/globals.css`.

### Architecture

| Couche | Token principal | Rôle |
|--------|-----------------|------|
| Page   | `--background`  | Fond global presque plat (light) / profond (dark) |
| Surface base | `--surface` | Conteneurs neutres (cards simples) |
| Surface élevée | `--surface-alt` | Légère élévation (cartes, panneaux) |
| Surface atténuée | `--surface-muted` | Inline chips, accent discret, blockquotes |
| Accent dégradé | `--surface-accent` | Eléments décoratifs ciblés |

Couleurs fonctionnelles : `--primary`, `--secondary`, `--accent`, `--muted`, avec toujours leur `*-foreground`. Bordures / focus: `--border`, `--ring`. Texte secondaire: `--muted-foreground`.

### Utilitaires Tailwind exposés

- Background / texte: `bg-background text-foreground`
- Surfaces: `bg-surface`, `bg-surface-alt`, `bg-surface-muted`, `bg-surface-accent`
- Bordure: `border-base` (=> `--border`)
- Éléments d'interface (inputs/boutons) réutilisent les composants déjà mappés aux tokens.

### Composants migrés

Nav, page d’accueil (hero, services, contact), listes & détails blog/projets, filtres (CategoryFilter), blockquotes & code (`.prose`) utilisent uniquement des tokens—plus de neutres figés (#fff, #000, neutral-xxx) en usage direct.

### Principes couleur

- OKLCH pour ajuster lightness/chroma sans shifts imprévisibles
- Light: surfaces blanches => contraste porté par le texte, séparation via bordure faible + ombre douce
- Dark: réduction de la chroma sur surfaces, texte quasi neutre clair
- Texte secondaire : jamais < 4.2:1 quand rôle informatif
- Gradients (titres / états actifs) conservent identité sans casser accessibilité

### Ajouter un nouveau composant

1. Ne pas utiliser `text-black` / `text-white` – préférer `text-foreground` ou `text-muted-foreground`.
2. Choisir la surface minimale qui suffit (`bg-surface` > `bg-surface-alt` > `bg-surface-muted`).
3. Pour une carte interactive : `bg-surface-alt` + `border border-base` + hover légère ombre ou translation.
4. Focus: `focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
5. Gradient actif cohérent : `from-primary to-accent`.

### Blocquote & Code

- Blockquote: fond `--surface-muted`, barre `--accent`, texte principal `--foreground`, citation/meta `--muted-foreground`.
- Code inline: fond `--surface-muted`; blocs: `--surface-alt` + bordure `--border`.

### Extension future

- Mode high-contrast: dériver 4–5 tokens (foreground, border, primary, surface-alt)
- Palette “warm” ou “cool” via set dynamique de variables (ex: `data-theme-variant="warm"`).
- Tests automatiques: script Lighthouse / axe-core sur pages clés + seuil contraste.

### Anti‑patterns évités

- Empilement de overlays opaques (préférer surfaces stratifiées)
- Utilisation de neutral-400 pour texte essentiel (remplacé par foreground + opacité contrôlée si nuance nécessaire)
- Multiplication de palettes parallèles (un set unique + variations légères)

### Raccourci mental

Texte primaire → foreground; secondaire → muted-foreground; contour → border; interaction → primary; décor léger → accent; arrière-plan logique → surface(s).

### Basculer le thème

Le `ThemeProvider` gère :

- Lecture `prefers-color-scheme`
- Persistance `localStorage` (`theme=light|dark`)
- Application de `data-theme`

Hook facultatif (exemple minimal) :

```ts
const { theme, setTheme } = useTheme(); // si exposition future
```

### Checklist accessibilité (interne)

- Ratio texte principal ≥ 7:1 (light) / ~12:1 (dark) vs surface
- Ratio texte secondaire ≥ 4.5:1
- Focus visible sur éléments interactifs (test clavier)

Pour ajuster la palette : modifier uniquement les blocs `:root` et `:root[data-theme="dark"]` dans `styles/globals.css`.

## Ajout futur (suggestions)

- Synchronisation historique (back/forward) pour filtre
- Tests unitaires sur parsing frontmatter
- Progressive image placeholders (BlurDataURL)
- Page /uses ou /now

## Changelog

### Initialisation (commit f2bab71)

- Base Next.js + Tailwind
- Intégration MDX
- Theming dark initial

### Évolutions majeures

- Ajout i18n (segment `[lang]`, dictionnaires)
- Refactor filtres projets (dérivation pure)
- Unification layout blog/projets
- Page About (remplace Photos) + redirection
- Ajout thème clair + tokens surfaces
- Ajout projet démonstration: Next.js i18n (MDX en/fr)

## Licence

MIT

---

© 2025 – Portfolio personnel

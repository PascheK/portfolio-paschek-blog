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

Variables CSS (OKLCH) définies dans `:root` (clair) puis surchargées dans `.dark`. Utiliser les utilitaires :

- `bg-background text-foreground`
- `bg-surface`, `bg-surface-alt`, `bg-surface-muted`
- `border-base`

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

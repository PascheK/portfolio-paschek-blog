# Format technique des articles

## Fichiers

- `content/blog/fr/<slug>.mdx` et `content/blog/en/<slug>.mdx`, **même slug** dans les deux langues. Le slug est le nom du fichier : minuscules, chiffres, tirets, sans accent (`devlog-1`, `homelab`).
- Vignette : `public/blogs/<slug>.png`, référencée par `image: /blogs/<slug>.png`. Les deux langues utilisent la même image.
- Le site se charge de tout le reste : liste du blog, trois derniers articles sur l'accueil, flux RSS/Atom/JSON, sitemap, articles liés (par tags en commun), temps de lecture (mots / 200), données structurées. Il n'y a rien à enregistrer ailleurs.

## Frontmatter

```mdx
---
title: "Devlog #1 : le premier niveau en 3D"
publishedAt: "2026-11-20"
summary: "Comment j'ai construit le premier niveau du jeu dans Blender, et ce que j'ai appris sur le workflow d'export vers le moteur."
image: /blogs/devlog-1.png
tags: "gamedev,blender,devlog,3d,indie"
---
```

| Champ | Règle |
| --- | --- |
| `title` | 60 caractères au plus (le site ajoute « \| PascheK »). Dit le sujet, mot-clé principal en premier si c'est naturel. Il devient le `<h1>` : **ne mets jamais de `# Titre` dans le corps**. |
| `publishedAt` | `AAAA-MM-JJ`, la même dans les deux langues. Sert au tri, au sitemap et à la date affichée. |
| `summary` | 120 à 160 caractères, une ou deux phrases. C'est la description sous le lien dans Google et l'aperçu des réseaux. Pas un copier-coller de l'intro. |
| `image` | Optionnel, `/blogs/<slug>.png`. Sans image, le site affiche un dégradé avec un libellé et génère une image de partage. **Ne référence jamais un fichier qui n'existe pas.** |
| `tags` | Une chaîne, séparée par des virgules, 3 à 6 tags en minuscules, sans crochets. Ils alimentent les filtres et les articles liés : réutilise ceux qui existent (`gamedev`, `blender`, `devlog`, `rust`, `nextjs`, `homelab`…) avant d'en créer. |

Pièges du parseur (`lib/posts.ts`) :

- Une ligne = `clé: valeur`, découpée au premier `: `. Une valeur peut contenir des `:`. Les guillemets autour de la valeur sont retirés.
- Pas de valeur sur plusieurs lignes, pas de listes YAML, pas de `---` dans une valeur.
- Les champs `group`, `featured`, `demoUrl`, `repoUrl`, `ctaLabel` sont réservés aux **projets**, pas aux articles.

## Corps

- Intro : une citation `> …` en tête.
- Sections : `## 1. Titre`, `## 2. Titre`… Les `###` sont permis pour des sous-parties. Le rail de lecture est construit à partir des `##`.
- Ancre d'un titre = son texte passé dans `slugify` (`lib/slugify.ts`) : minuscules, espaces en tirets, **caractères accentués supprimés**. `## 7. Le jeu est en pause` donne `#7-le-jeu-est-en-pause` ; `## 5. La suite` donne `#5-la-suite` ; `## 3. Prochaines étapes` donne `#3-prochaines-tapes`. Pour un lien interne vers une section, évite les titres accentués ou vérifie l'ancre avec le script.
- Séparateur `---` entre les grandes parties.
- Code : blocs avec langage (` ```ts `). Un bloc non fermé casse toute la page.
- Tableaux Markdown pour les comparaisons courtes.

### Liens

- Internes : toujours préfixés par la langue, `[RPG de survie](/fr/blog/unity-survival-rpg)`, `[projets](/fr/projects)`, `[vidéos](/fr/videos)`. En anglais : `/en/...`.
- Externes : URL complète. Ils s'ouvrent dans un nouvel onglet.

### Composants MDX

- `<YouTube videoId="zJEDJEN8qXw" />` : lecteur YouTube responsive. L'identifiant fait 11 caractères (après `v=`). Mets-le **juste après l'intro** pour un article lié à une vidéo, suivi d'une phrase qui invite à lire la version écrite.
- `<Image src="/blogs/<slug>/etape.png" alt="..." width="1280" height="720" />` : image arrondie avec bordure. `alt` obligatoire (décrit ce qu'on voit : accessibilité et référencement). `width` et `height` sont **obligatoires** et doivent respecter le ratio réel du fichier, sinon l'image est déformée ou le site plante.
- `<Caption>Légende courte.</Caption>` juste sous une image ou une vidéo.
- `<Callout>…</Callout>` : encadré discret. **Sans `emoji`**.
- `<Video src="/blogs/<slug>/clip.mp4" label="…" width="960" height="540" />` : boucle vidéo muette en lecture automatique (voir la section suivante).
- **Pas d'expressions JavaScript dans le MDX** : le site les bloque. `width={640}` fait planter la page (« missing required width »), il faut `width="640"`. Pour la même raison, `<ImageGrid images={[...]} />` et `<Table data={{...}} />` ne fonctionnent pas : pour deux images côte à côte, mets-les l'une sous l'autre, ou utilise un tableau Markdown pour les comparaisons.

### Animations et captures d'écran : boucles `<Video>`, pas de GIF

Killian enregistre des captures d'écran de son travail (Blender, Unreal, navigateur). Pour les montrer dans un article, **utilise des boucles MP4 avec `<Video>`, pas des GIF** : une boucle de 10 s à 960 px pèse 0,2 à 1,5 Mo en MP4, contre 2 à 18 Mo en GIF (les 10 GIF du Devlog #1 faisaient 79 Mo au total, les 10 MP4 6,6 Mo). Le comportement est le même pour le lecteur : lecture automatique, en boucle, sans son.

```mdx
<Video src="/blogs/devlog-1/miroir.mp4" label="Le miroir complète le modèle" width="960" height="540" />
<Caption>Le miroir complète le modèle : je ne modélise qu'un côté.</Caption>
```

- `width` et `height` sont **obligatoires**, en chaînes, et doivent respecter le ratio réel du fichier (le script le vérifie avec `ffprobe`). `label` est lu par les lecteurs d'écran.
- Fichiers dans `public/blogs/<slug>/`, noms descriptifs en minuscules (`first-try-blender.mp4`), jamais à la racine de `public/blogs/` (réservée aux vignettes). Les mêmes fichiers servent les deux langues : seuls `label` et `<Caption>` changent.
- Place chaque clip dans la section qu'il illustre, après la phrase qui l'introduit. **La légende décrit ce qu'on voit, sans ajouter de fait** que Killian n'a pas donné : en cas de doute sur ce que montre un clip, regarde quelques images (`ffmpeg ... -vf "fps=0.4,tile=4x1"`) puis signale ton hypothèse dans le compte rendu. Le texte doit se comprendre sans les clips.
- Limite : 3 Mo par clip (le script avertit au-delà).

Conversion depuis ce que Killian fournit :

```bash
# depuis un GIF ou un .mov, vers une boucle MP4 légère (dimensions paires, sans son)
ffmpeg -i entrée.gif -vf "fps=15,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an sortie.mp4
```

Pour un `.mov` long, accélère-le d'abord (facteur = durée / 10) avec `~/Scripts/mov_to_gif.py` (qui produit des GIF et supprime les `.mov`) ou directement avec `setpts=PTS/facteur` dans la commande ci-dessus. Les GIF d'origine restent chez Killian (par exemple dans `~/Movies/Devlogs/`) : ils servent pour Patreon.

Un vrai GIF n'a de sens que s'il est minuscule (moins de 1 Mo) : dans ce cas, `<Image src="….gif" alt="…" width="…" height="…" unoptimized />`, et jamais d'expression `{}`.

## Vignette

Modèles prêts dans `brand/thumbnails/` (`thumbnail-blog.svg` et `.png`, 1920×1080, avec un README qui donne les marges de sécurité, les couleurs, la police Geist et le prompt pour une IA générative). Tu ne fabriques pas l'image toi-même : tu indiques à Killian quel modèle utiliser et le texte à y mettre (surtitre, titre sur deux lignes, métadonnées), puis il l'exporte en PNG sous 250 Ko dans `public/blogs/<slug>.png`. Tant que le fichier n'existe pas, ne mets pas la ligne `image:` (le site affiche alors le dégradé).

## Référencement : ce qui est automatique et ce qui dépend du texte

Automatique : titre de page, balise canonique, versions FR/EN liées (hreflang), Open Graph, carte Twitter, JSON-LD `BlogPosting` et fil d'Ariane, sitemap. Ils lisent `title`, `summary`, `image`, `tags` et `publishedAt` : ces cinq champs soignés, c'est tout le travail SEO à faire.

Dépend du texte : le mot-clé principal naturellement présent dans le titre, le résumé, l'intro et au moins un `##` ; des titres de sections descriptifs ; des `alt` sur les images ; quelques liens internes vers d'autres articles, projets ou la page vidéos.

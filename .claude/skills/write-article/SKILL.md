---
name: write-article
description: Écrit les articles de blog du portfolio PascheK (content/blog/fr + content/blog/en) - devlogs, retours d'expérience sur un projet, guides, mises à jour de feuille de route, articles qui accompagnent une vidéo YouTube. À utiliser dès que l'utilisateur parle d'un article, billet, post, blog ou devlog, demande d'en écrire, d'en ajouter, d'en réécrire ou de le traduire, d'intégrer une vidéo dans un article, ou de rédiger le texte d'un devlog, même s'il ne dit pas "skill" ni "article" explicitement. Couvre aussi le frontmatter, le SEO (titre, résumé, tags), la vignette et la vérification avant publication.
---

# Écrire un article pour le portfolio

Les articles sont la vitrine personnelle de Killian : ils servent à montrer ce qu'il fait *et* comment il pense, à un recruteur comme à quelqu'un qui tombe dessus via Google. Ce qui les rend crédibles, c'est qu'ils sont vrais, concrets et honnêtes sur les limites. Un article généraliste écrit par défaut (introduction vague, trois conseils, conclusion enthousiaste) lui fait du tort : il ressemble à tout le reste.

Deux conséquences guident tout le reste :

1. **Les faits viennent de Killian, pas de toi.** Dates, ce qu'il a réellement construit, ce qui a échoué, ce que les collègues ont fait : tu ne peux pas les deviner, et un fait inventé sur un portfolio est pire qu'un article court. Tu peux les lire dans le code et le contenu du dépôt, mais ce qui relève de son vécu se demande.
2. **Le site est bilingue.** Chaque article existe en français et en anglais, avec le même slug.

## Déroulé

1. **Cadrer.** Identifie le type d'article (devlog, retour d'expérience, guide, mise à jour, article lié à une vidéo) et ouvre `references/templates.md` pour le plan correspondant. Regarde aussi un ou deux articles récents dans `content/blog/fr/` pour te remettre dans le ton (par exemple `devlog-0.mdx`, `futur.mdx`).
2. **Interviewer avant d'écrire.** Voir la section suivante. Ne repose pas ce qui a déjà été dit dans la conversation.
3. **Proposer le titre, le slug et un plan court** (5 à 7 titres de sections, une ligne chacun) quand l'article est long ou que l'angle est ambigu. Pour un article court et clair, passe directement à la rédaction.
4. **Rédiger en français d'abord**, puis l'anglais. Lis `references/voice.md` avant de commencer : le ton compte autant que le contenu. L'anglais est une réécriture naturelle, pas une traduction mot à mot.
5. **Écrire les deux fichiers** : `content/blog/fr/<slug>.mdx` et `content/blog/en/<slug>.mdx`. Frontmatter, titres, composants MDX et pièges du parseur : `references/format.md`.
6. **Vérifier** avec le script, et corriger tout ce qu'il signale :
   ```bash
   python3 .claude/skills/write-article/scripts/check_article.py <slug>
   ```
7. **Voir le rendu** quand c'est utile (nouvelle mise en page, vidéo intégrée, tableau) : lance le serveur de dev avec l'outil de prévisualisation, ouvre `/fr/blog/<slug>`, regarde la console. Le port 3000 est parfois pris par un autre programme de Killian ; la config `dev-3100` de `.claude/launch.json` utilise le port 3100.
8. **Rendre compte** en quelques lignes : fichiers créés, ce qui reste à faire de son côté (vignette, identifiant de vidéo, publication), et surtout **tout fait que tu n'as pas pu confirmer**. Ne commite pas sauf demande explicite.

## Interviewer

Pose peu de questions, mais les bonnes : celles dont la réponse change le texte. Quatre à six suffisent. Utilise l'outil de questions à choix quand les réponses se prêtent à des options, sinon pose-les en une seule fois dans le chat, en français.

À couvrir, en sautant ce qui est déjà connu :

- **Angle** : de quoi parle l'article et pour qui (un recruteur, un dev qui cherche une solution, la communauté du jeu).
- **Ce qu'il a vraiment fait** : son rôle, ce qu'il a construit lui-même, ce que d'autres ont fait. L'écart entre "j'ai fait" et "l'équipe a fait" doit rester exact.
- **Ce qui n'a pas marché ou s'est arrêté** : c'est souvent la partie la plus intéressante, et elle manque quand on ne la demande pas.
- **Matière concrète** : un chiffre, un choix technique et sa raison, une capture, un morceau de code, une anecdote.
- **Pour un devlog ou une vidéo** : titre de la vidéo, identifiant YouTube (11 caractères après `v=`), date de sortie, ce qui est montré à l'écran. Si la vidéo n'est pas encore en ligne, écris l'article sans le lecteur et note qu'il faudra l'ajouter.
- **Visuels** : captures, GIF, rendus à intégrer, et dans quelle section. Killian crée ses captures lui-même et les fournit souvent après le texte (GIF ou `.mov`) ; écris l'article sans, puis place-les quand ils arrivent, en boucles `<Video>` MP4 et non en GIF trop lourds (`references/format.md`, section Animations).
- **Date de publication** (`publishedAt`) : celle du jour de mise en ligne.
- **Confidentialité** : s'il s'agit d'un projet d'employeur ou de client (HelloXLab, UNOPS), demande si le contenu peut être publié et ce qu'il faut taire. Aucun secret, clé, URL privée ou donnée interne.

Si une réponse manque et que Killian préfère avancer, écris l'article sans l'information et signale-la dans ton compte rendu. N'invente jamais pour boucher un trou, et ne laisse aucun marqueur du type "À COMPLÉTER" dans un fichier destiné à être publié (le script le refuse).

## Contexte du site

- Killian a ouvert un **Patreon** (https://www.patreon.com/cw/PascheK7) et les articles du site y sont publiés aussi. Pour un devlog accompagné d'une vidéo, une phrase en fin d'article avec le lien suffit ; inutile de la répéter dans chaque article ni de transformer la fin en appel à s'abonner.
- Les vidéos sont sur la chaîne YouTube @PascheK, listées sur `/fr/videos`.

## Ce qui fait un bon article ici

- **Une promesse honnête dans l'intro** : une citation (`>`) de une à trois phrases qui dit de quoi il s'agit et pourquoi ça vaut le coup de lire, sans survendre.
- **Du concret partout** : un outil, un chiffre, une décision et sa raison valent mieux qu'une généralité.
- **Une structure lisible** : sections `## 1. Titre` numérotées, titres qui disent quelque chose (ils deviennent les rubriques du rail de lecture et servent au référencement), paragraphes courts.
- **Une fin courte** qui ouvre vers la suite (autre article, vidéo, prochain devlog), pas un résumé de ce qui vient d'être dit.
- **Du SEO sans fausser le texte** : le mot-clé principal dans le titre, le résumé et l'intro, formulé naturellement. Le résumé (`summary`) fait 120 à 160 caractères parce que c'est ce que Google affiche sous le lien ; le titre fait 60 caractères au plus, car " | PascheK" est ajouté.

## Fichiers de référence

- `references/voice.md` : ton, tournures à éviter, confidentialité, français et anglais. À lire avant chaque rédaction.
- `references/format.md` : emplacement, frontmatter, parseur, composants MDX, liens, images, vignette.
- `references/templates.md` : plans types par genre d'article.
- `scripts/check_article.py` : vérifie les deux versions et leur cohérence.
- `~/Scripts/mov_to_gif.py` (hors du dépôt) : convertit les captures `.mov` déposées dans `~/Scripts/target/` en GIF optimisés de 10 s et supprime les `.mov` (voir `references/format.md`, section Animations).
- `scripts/to_patreon.py <slug>` : à lancer quand Killian demande la version Patreon. Génère `patreon/<slug>.html` (fr + en, titre, corps avec bouton « Copier ») à coller dans l'éditeur Patreon. Les images et GIF sont à ajouter à la main dans Patreon ; le dossier `patreon/` est ignoré par git.

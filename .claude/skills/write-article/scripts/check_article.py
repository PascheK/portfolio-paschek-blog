#!/usr/bin/env python3
"""Vérifie les deux versions (fr + en) d'un article du blog avant publication.

Usage:  python3 .claude/skills/write-article/scripts/check_article.py <slug>
Code de sortie : 1 s'il y a au moins une erreur, 0 sinon (les avertissements ne bloquent pas).

Les règles reprennent ce que le site fait réellement : parseur de frontmatter de lib/posts.ts,
slugify de lib/slugify.ts (ancres), composants MDX de components/mdx.tsx.
"""
import re
import shutil
import struct
import subprocess
import sys
from pathlib import Path

LANGS = ("fr", "en")
ROOT = Path(__file__).resolve().parents[4]  # <repo>/.claude/skills/write-article/scripts/x.py
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐⬆✅]")
errors: list[str] = []
warnings: list[str] = []


def err(lang, msg):
    errors.append(f"[{lang}] {msg}")


def warn(lang, msg):
    warnings.append(f"[{lang}] {msg}")


def slugify(s: str) -> str:
    """Same as lib/slugify.ts (JS \\w is ASCII only, so accented letters are dropped)."""
    s = re.sub(r"\s+", "-", s.lower().strip())
    s = s.replace("&", "-and-")
    s = re.sub(r"[^\w\-]+", "", s, flags=re.ASCII)
    return re.sub(r"-{2,}", "-", s)


def image_size(path: Path):
    """(width, height) of a GIF, PNG or JPEG file, or None when unreadable."""
    try:
        data = path.read_bytes()
        if data[:6] in (b"GIF87a", b"GIF89a"):
            return struct.unpack("<HH", data[6:10])
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            return struct.unpack(">II", data[16:24])
        if data[:2] == b"\xff\xd8":
            i = 2
            while i < len(data) - 9:
                if data[i] != 0xFF:
                    i += 1
                    continue
                marker = data[i + 1]
                if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                    h, w = struct.unpack(">HH", data[i + 5 : i + 9])
                    return w, h
                i += 2 + struct.unpack(">H", data[i + 2 : i + 4])[0]
    except (OSError, struct.error):
        pass
    return None


def video_size(path: Path):
    """(width, height) of a video file through ffprobe, or None when unavailable."""
    if not shutil.which("ffprobe"):
        return None
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                        "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        w, h = r.stdout.strip().split(",")
        return int(w), int(h)
    except ValueError:
        return None


def parse(text: str):
    m = re.search(r"---\s*([\s\S]*?)\s*---", text)
    if not m:
        return {}, text.strip()
    meta = {}
    for line in m.group(1).strip().split("\n"):
        key, *rest = line.split(": ")
        value = ": ".join(rest).strip()
        value = re.sub(r"^['\"](.*)['\"]$", r"\1", value)
        meta[key.strip()] = value
    return meta, text.replace(m.group(0), "", 1).strip()


def check_lang(slug, lang):
    path = ROOT / "content" / "blog" / lang / f"{slug}.mdx"
    if not path.exists():
        err(lang, f"fichier manquant : {path.relative_to(ROOT)}")
        return None
    text = path.read_text(encoding="utf-8")
    meta, body = parse(text)

    # --- frontmatter
    for key in ("title", "publishedAt", "summary", "tags"):
        if not meta.get(key):
            err(lang, f"frontmatter : « {key} » manquant ou vide")
    for key in ("group", "featured", "demoUrl", "repoUrl", "ctaLabel"):
        if key in meta:
            warn(lang, f"frontmatter : « {key} » est réservé aux projets")
    title = meta.get("title", "")
    if len(title) > 60:
        warn(lang, f"titre de {len(title)} caractères (> 60 : coupé dans Google, « | PascheK » s'ajoute)")
    if meta.get("publishedAt") and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", meta["publishedAt"]):
        err(lang, f"publishedAt « {meta['publishedAt']} » : format attendu AAAA-MM-JJ")
    summary = meta.get("summary", "")
    if summary and not 110 <= len(summary) <= 165:
        warn(lang, f"résumé de {len(summary)} caractères (visé : 120 à 160)")
    tags = meta.get("tags", "")
    if tags.startswith("["):
        err(lang, "tags : pas de crochets, une chaîne séparée par des virgules")
    tag_list = [t.strip() for t in tags.strip("[]").split(",") if t.strip()]
    if tags and not 2 <= len(tag_list) <= 7:
        warn(lang, f"{len(tag_list)} tags (visé : 3 à 6)")
    if any(t != t.lower() for t in tag_list):
        warn(lang, "tags : préférer les minuscules")
    image = meta.get("image")
    if image and not (ROOT / "public" / image.lstrip("/")).exists():
        err(lang, f"image « {image} » introuvable dans public/ (retire la ligne tant que le fichier n'existe pas)")

    # --- corps
    lines = body.split("\n")
    in_code, fence, headings = False, "", []
    for line in lines:
        f = re.match(r"^(```|~~~)", line)
        if f:
            if not in_code:
                in_code, fence = True, f.group(1)
            elif fence == f.group(1):
                in_code = False
            continue
        if in_code:
            continue
        h = re.match(r"^(#{1,6})\s+(.+)", line)
        if h:
            headings.append((len(h.group(1)), h.group(2).strip()))
    if in_code:
        err(lang, "bloc de code non fermé (casse la page)")

    if any(d == 1 for d, _ in headings):
        err(lang, "titre `# ` dans le corps : le titre du frontmatter est déjà le <h1>")
    h2 = [t for d, t in headings if d == 2]
    if len(h2) < 3:
        warn(lang, f"{len(h2)} section(s) `##` (visé : au moins 3 pour un bon rail de lecture)")
    nums = [re.match(r"(\d+)\.\s", t) for t in h2]
    if all(nums):
        seq = [int(n.group(1)) for n in nums]
        if seq != list(range(1, len(seq) + 1)):
            warn(lang, f"numérotation des `##` non continue : {seq}")
    else:
        warn(lang, "titres `##` non numérotés (convention du site : `## 1. Titre`)")
    if not body.lstrip().startswith(">"):
        warn(lang, "pas de citation d'intro (`> …`) en tête du corps")

    anchors = {slugify(t) for _, t in headings}
    for target in re.findall(r"\]\(#([^)\s]+)\)", body):
        if target not in anchors:
            err(lang, f"lien d'ancre #{target} : aucun titre ne produit cette ancre (accents supprimés par slugify)")

    for url in re.findall(r"\]\((/[^)\s]*)\)", body):
        first = url.split("/")[1] if url.count("/") >= 1 else ""
        if first in ("blog", "projects", "videos", "about", "uses"):
            err(lang, f"lien interne sans langue : {url} (écrire /{lang}{url})")
        elif first in LANGS and first != lang:
            err(lang, f"lien vers l'autre langue : {url}")

    for m in re.finditer(r"<YouTube\b[^>]*>", body):
        vid = re.search(r'videoId="([^"]*)"', m.group(0))
        if not vid or not re.fullmatch(r"[\w-]{11}", vid.group(1)):
            err(lang, f"<YouTube> : videoId absent ou invalide dans {m.group(0)}")
        if not m.group(0).endswith("/>"):
            err(lang, "<YouTube> doit être auto-fermant : <YouTube videoId=\"…\" />")
    prose = re.sub(r"`[^`\n]*`", "", re.sub(r"(```|~~~)[\s\S]*?\1", "", body))
    for m in re.finditer(r"<[A-Z]\w*\b[^>]*=\{[^>]*>", prose):
        err(lang, f"attribut JSX avec expression {{…}} : le site bloque le JavaScript du MDX, utilise une chaîne (width=\"640\") dans {m.group(0)[:60]}…")
    for m in re.finditer(r"<Image\b[^>]*>", prose):
        tag = m.group(0)
        alt = re.search(r'alt="([^"]*)"', tag)
        if not alt or not alt.group(1).strip():
            err(lang, "<Image> sans attribut alt (ou alt vide)")
        src = re.search(r'src="([^"]+)"', tag)
        w = re.search(r'width="(\d+)"', tag)
        h = re.search(r'height="(\d+)"', tag)
        if not (w and h):
            err(lang, f'<Image src="{src.group(1) if src else "?"}"> : width et height obligatoires, en chaînes ("640")')
        if src and src.group(1).startswith("/"):
            f = ROOT / "public" / src.group(1).lstrip("/")
            if not f.exists():
                err(lang, f"image {src.group(1)} introuvable dans public/")
            else:
                size = image_size(f)
                if size and w and h and abs(size[0] / size[1] - int(w.group(1)) / int(h.group(1))) > 0.02:
                    err(lang, f"{src.group(1)} : fichier {size[0]}x{size[1]} mais width/height={w.group(1)}x{h.group(1)} (ratio différent, image déformée)")
                if f.suffix.lower() == ".gif":
                    if "unoptimized" not in tag:
                        warn(lang, f"{src.group(1)} : ajouter `unoptimized` pour garder l'animation")
                    if f.stat().st_size > 3_000_000:
                        warn(lang, f"{src.group(1)} : {f.stat().st_size / 1e6:.1f} Mo (> 3 Mo : à compresser)")
                    if size and size[0] > 1000:
                        warn(lang, f"{src.group(1)} : {size[0]} px de large (visé : 960 au plus)")
    for m in re.finditer(r"<Video\b[^>]*>", prose):
        tag = m.group(0)
        src = re.search(r'src="([^"]+)"', tag)
        label = re.search(r'label="([^"]*)"', tag)
        w = re.search(r'width="(\d+)"', tag)
        h = re.search(r'height="(\d+)"', tag)
        if not label or not label.group(1).strip():
            err(lang, "<Video> sans attribut label (lu par les lecteurs d'écran)")
        if not (w and h):
            err(lang, f'<Video src="{src.group(1) if src else "?"}"> : width et height obligatoires, en chaînes ("960")')
        if not tag.rstrip().endswith("/>"):
            err(lang, "<Video> doit être auto-fermant : <Video ... />")
        if src and src.group(1).startswith("/"):
            f = ROOT / "public" / src.group(1).lstrip("/")
            if not f.exists():
                err(lang, f"vidéo {src.group(1)} introuvable dans public/")
            else:
                if f.stat().st_size > 3_000_000:
                    warn(lang, f"{src.group(1)} : {f.stat().st_size / 1e6:.1f} Mo (> 3 Mo : à recompresser)")
                size = video_size(f)
                if size and w and h and abs(size[0] / size[1] - int(w.group(1)) / int(h.group(1))) > 0.02:
                    err(lang, f"{src.group(1)} : fichier {size[0]}x{size[1]} mais width/height={w.group(1)}x{h.group(1)}")
    if re.search(r"<Callout[^>]*emoji", body) or EMOJI.search(body):
        warn(lang, "émoji détecté (la charte du site n'en utilise pas)")
    for marker in ("À COMPLÉTER", "A COMPLETER", "TODO", "TBD", "FIXME", "lorem ipsum", "XXX"):
        if marker.lower() in text.lower():
            err(lang, f"marqueur « {marker} » encore présent")
    if re.search(r"https?://localhost", text):
        err(lang, "lien localhost dans le texte")

    words = len(re.findall(r"\w+", re.sub(r"<[^>]+>", " ", body)))
    return {
        "meta": meta, "h2": len(h2), "words": words, "tags": sorted(tag_list),
        "yt": sorted(re.findall(r'videoId="([^"]*)"', body)),
    }


def main():
    if len(sys.argv) != 2 or sys.argv[1].startswith("-"):
        print(__doc__)
        sys.exit(2)
    slug = sys.argv[1].removesuffix(".mdx")
    info = {lang: check_lang(slug, lang) for lang in LANGS}

    fr, en = info["fr"], info["en"]
    if fr and en:
        if fr["meta"].get("publishedAt") != en["meta"].get("publishedAt"):
            warn("fr/en", "publishedAt différent entre les deux langues")
        if fr["meta"].get("image") != en["meta"].get("image"):
            warn("fr/en", "image différente entre les deux langues")
        if fr["tags"] != en["tags"]:
            warn("fr/en", f"tags différents : {fr['tags']} / {en['tags']}")
        if fr["yt"] != en["yt"]:
            err("fr/en", f"vidéos YouTube différentes : {fr['yt']} / {en['yt']}")
        if fr["h2"] != en["h2"]:
            warn("fr/en", f"nombre de sections `##` différent : {fr['h2']} (fr) / {en['h2']} (en)")
        ratio = fr["words"] / max(en["words"], 1)
        if not 0.8 <= ratio <= 1.5:
            warn("fr/en", f"longueurs très différentes : {fr['words']} mots (fr) / {en['words']} (en)")

    for lang, i in info.items():
        if i:
            print(f"{lang}: {i['words']} mots, ~{max(1, round(i['words'] / 200))} min de lecture, {i['h2']} sections")
    for w in warnings:
        print(f"  avertissement {w}")
    for e in errors:
        print(f"  ERREUR {e}")
    print(f"\n{len(errors)} erreur(s), {len(warnings)} avertissement(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Génère une page HTML à copier-coller dans l'éditeur Patreon, depuis les articles fr + en.

Usage:  python3 .claude/skills/write-article/scripts/to_patreon.py <slug>
Sortie: patreon/<slug>.html (à ouvrir dans le navigateur ; un bouton copie le corps avec sa mise en forme).

Adaptations pour Patreon : <YouTube> devient un lien sur sa propre ligne (Patreon l'intègre tout seul),
les liens internes deviennent absolus, la phrase qui renvoie vers le Patreon est retirée (on y est déjà),
et une ligne finale renvoie vers l'article sur le site. Les images et GIF doivent être ajoutés à la main
dans l'éditeur : un repère les signale.
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
LANGS = {"fr": "Français", "en": "English"}
FOOTER = {"fr": "Retrouve aussi cet article sur mon site :", "en": "You can also read this article on my site:"}


def base_url() -> str:
    m = re.search(r'baseUrl:\s*"([^"]+)"', (ROOT / "lib" / "config.ts").read_text(encoding="utf-8"))
    return (m.group(1) if m else "").rstrip("/")


def parse(text: str):
    m = re.search(r"---\s*([\s\S]*?)\s*---", text)
    meta = {}
    if m:
        for line in m.group(1).strip().split("\n"):
            key, *rest = line.split(": ")
            meta[key.strip()] = re.sub(r"^['\"](.*)['\"]$", r"\1", ": ".join(rest).strip())
        text = text.replace(m.group(0), "", 1)
    return meta, text.strip()


def inline(s: str, site: str) -> str:
    s = html.escape(s, quote=False)

    def link(m):
        url = m.group(2)
        if url.startswith("/"):
            url = site + url
        return f'<a href="{url}">{m.group(1)}</a>'

    s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\*\w])\*(?!\*)(.+?)(?<!\*)\*(?![\*\w])", r"<em>\1</em>", s)
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", s)


def convert(body: str, site: str):
    out, notes = [], []
    lines = body.split("\n")
    i, para = 0, []

    def flush():
        nonlocal para
        if para:
            text = " ".join(para).strip()
            if text and "patreon.com/cw/" not in text:
                out.append(f"<p>{inline(text, site)}</p>")
            para = []

    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if s.startswith("```"):
            flush()
            code, i = [], i + 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            out.append("<pre><code>" + html.escape("\n".join(code)) + "</code></pre>")
        elif not s:
            flush()
        elif (m := re.match(r"<YouTube\s+videoId=\"([\w-]+)\"\s*/>", s)):
            flush()
            out.append(f'<p><a href="https://youtu.be/{m.group(1)}">https://youtu.be/{m.group(1)}</a></p>')
        elif (m := re.match(r"<Image\b[^>]*?src=\"([^\"]+)\"[^>]*?alt=\"([^\"]*)\"", s)):
            flush()
            out.append(f"<p><em>[Image à ajouter : {html.escape(m.group(1))} — {html.escape(m.group(2))}]</em></p>")
            notes.append(m.group(1))
        elif (m := re.match(r"<Video\b[^>]*?src=\"([^\"]+)\"[^>]*?label=\"([^\"]*)\"", s)):
            flush()
            out.append(f"<p><em>[Vidéo/GIF à ajouter : {html.escape(m.group(1))} — {html.escape(m.group(2))}]</em></p>")
            notes.append(m.group(1))
        elif (m := re.match(r"<Caption>(.*)</Caption>", s)):
            flush()
            out.append(f"<p><em>{inline(m.group(1), site)}</em></p>")
        elif re.match(r"^</?(Callout)\b", s):
            flush()
        elif (m := re.match(r"^(#{2,3})\s+(.*)", s)):
            flush()
            out.append(f"<h{len(m.group(1))}>{inline(m.group(2), site)}</h{len(m.group(1))}>")
        elif s == "---":
            flush()
            out.append("<hr>")
        elif s.startswith(">"):
            flush()
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip().lstrip(">").strip())
                i += 1
            i -= 1
            out.append(f"<blockquote><p>{inline(' '.join(quote), site)}</p></blockquote>")
        elif re.match(r"^[-*]\s+", s):
            flush()
            items = []
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                items.append(re.sub(r"^\s*[-*]\s+", "", lines[i]))
                i += 1
            i -= 1
            out.append("<ul>" + "".join(f"<li>{inline(x, site)}</li>" for x in items) + "</ul>")
        elif s.startswith("|"):
            notes.append("tableau Markdown non converti")
            para.append(s)
        else:
            para.append(s)
        i += 1
    flush()
    return "\n".join(out), notes


PAGE = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Patreon : {slug}</title>
<style>
 body{{font:16px/1.6 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#1b1d24}}
 h1{{font-size:1.4rem}} section{{border-top:2px solid #ddd;margin-top:2.5rem;padding-top:1rem}}
 .field{{background:#f4f5f8;border-radius:8px;padding:.6rem .9rem;margin:.5rem 0;font-size:.9rem}}
 .field b{{display:block;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;color:#555}}
 button{{font:inherit;padding:.5rem 1rem;border:1px solid #3b4c9b;background:#3b4c9b;color:#fff;border-radius:8px;cursor:pointer}}
 .body{{border:1px dashed #bbb;border-radius:8px;padding:0 1.2rem;margin-top:1rem}}
 blockquote{{border-left:3px solid #97a8dd;margin-left:0;padding-left:1rem;color:#444}}
 .note{{color:#8a5a00;font-size:.85rem}}
</style></head><body>
<h1>Patreon : {slug}</h1>
<p>Pour chaque langue : copie le titre dans le champ titre du post, ajoute l'image de couverture, puis clique « Copier le corps » et colle dans l'éditeur Patreon.</p>
{sections}
<script>
function copyBody(id, btn) {{
  const el = document.getElementById(id);
  const range = document.createRange(); range.selectNodeContents(el);
  const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
  let ok = false; try {{ ok = document.execCommand('copy'); }} catch (e) {{}}
  sel.removeAllRanges();
  btn.textContent = ok ? 'Copié !' : 'Sélectionne le texte et copie à la main';
  setTimeout(() => btn.textContent = 'Copier le corps', 2500);
}}
</script></body></html>"""


def main():
    if len(sys.argv) != 2 or sys.argv[1].startswith("-"):
        print(__doc__)
        sys.exit(2)
    slug = sys.argv[1].removesuffix(".mdx")
    site = base_url()
    sections = []
    for lang, name in LANGS.items():
        path = ROOT / "content" / "blog" / lang / f"{slug}.mdx"
        if not path.exists():
            sys.exit(f"fichier manquant : {path.relative_to(ROOT)}")
        meta, body = parse(path.read_text(encoding="utf-8"))
        content, notes = convert(body, site)
        url = f"{site}/{lang}/blog/{slug}"
        content += f'\n<p>{FOOTER[lang]} <a href="{url}">{url}</a></p>'
        cover = meta.get("image")
        cover_txt = str(ROOT / "public" / cover.lstrip("/")) if cover else "(aucune)"
        extra = "".join(f'<p class="note">À ajouter à la main dans Patreon : {html.escape(n)}</p>' for n in notes)
        sections.append(
            f'<section><h2>{name}</h2>'
            f'<div class="field"><b>Titre du post</b>{html.escape(meta.get("title", ""))}</div>'
            f'<div class="field"><b>Image de couverture</b>{html.escape(cover_txt)}</div>{extra}'
            f'<button onclick="copyBody(\'body-{lang}\', this)">Copier le corps</button>'
            f'<div class="body" id="body-{lang}">\n{content}\n</div></section>'
        )
    out_dir = ROOT / "patreon"
    out_dir.mkdir(exist_ok=True)
    target = out_dir / f"{slug}.html"
    target.write_text(PAGE.format(slug=slug, sections="\n".join(sections)), encoding="utf-8")
    print(f"écrit : {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

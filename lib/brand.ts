import fs from "fs";
import path from "path";

/**
 * Reads the design tokens straight out of styles/globals.css so the /brand
 * page can never drift from the implementation (globals.css is the source of
 * truth, brand.md is the written spec).
 */
const CSS_PATH = path.join(process.cwd(), "styles", "globals.css");

function block(css: string, opener: RegExp) {
  const m = opener.exec(css);
  if (!m) return "";
  const start = m.index + m[0].length;
  const end = css.indexOf("\n}", start);
  return css.slice(start, end);
}

function vars(body: string) {
  const out: Record<string, string> = {};
  const re = /--([\w-]+):\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out[m[1]] = m[2].trim();
  return out;
}

export function readBrandTokens() {
  const css = fs.readFileSync(CSS_PATH, "utf-8");
  const lightRe = /:root,\s*:root\[data-theme="light"\]\s*\{/;
  const darkRe = /:root\[data-theme="dark"\]\s*\{/;
  const light = vars(block(css, lightRe));
  const dark = vars(block(css, darkRe));

  const lm = lightRe.exec(css)!;
  const dm = darkRe.exec(css)!;
  const lightEnd = css.indexOf("\n}", lm.index) + 2;
  const darkEnd = css.indexOf("\n}", dm.index) + 2;
  const tokensCss =
    "/* Periwinkle Ink — brand tokens. Generated from styles/globals.css */\n" +
    css.slice(lm.index, lightEnd) +
    "\n\n" +
    css.slice(dm.index, darkEnd) +
    "\n";

  return { light, dark, tokensCss };
}

export function readBrandMarkdown() {
  return fs.readFileSync(path.join(process.cwd(), "brand.md"), "utf-8");
}

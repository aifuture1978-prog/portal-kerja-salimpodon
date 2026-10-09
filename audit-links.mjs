/**
 * audit-links.mjs — the hub's accessibility contract.
 *
 * Every relative href/src in every hub page must resolve to a file that exists,
 * and no page may depend on a local dev server being up (http://localhost or
 * http://127.0.0.1 are dead the moment the preview process stops).
 *
 * Run:  node audit-links.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const HUB = 'C:/Users/User/WorkBuddy AI/2026-10-03-portfolio-hub';
// Hub pages, then the prototype apps the hub links to. The prototypes are
// included so their back-links ("../../../saas-paas.html") are proven to
// resolve on disk, not merely compared as strings by their own suites.
const PAGES = ['index.html', 'bahan-pdp.html', 'saas-paas.html', 'landing.html',
               'bookmark.html', 'status.html', 'semua.html',
               'works/saas-paas/swarm-7100/index.html',
               'works/saas-paas/swarm-7101/index.html',
               'works/saas-paas/swarm-7102/index.html',
               'works/saas-paas/hab-alat-harness/index.html',
               'works/landing/sk-salimpodon/command-center.html'];

const LOCAL_RE = /^(?:https?:)?\/\/(?:localhost|127\.0\.0\.1)/i;
const EXTERNAL_RE = /^https?:\/\//i;

let bad = 0, checked = 0;
const rows = [];

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '__pycache__'].includes(e.name)) continue;
      walk(p, out);
    } else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
};

const allHtml = new Set(walk(HUB).map(p => p.replace(/\\/g, '/').toLowerCase()));

for (const page of PAGES) {
  const file = path.join(HUB, page);
  if (!fs.existsSync(file)) { console.log(`MISSING PAGE  ${page}`); bad++; continue; }
  const html = fs.readFileSync(file, 'utf8');
  const attrs = [...html.matchAll(/\b(href|src)\s*=\s*"([^"]*)"/g)];

  const local = [], ext = [], dead = [], frag = [];
  for (const [, attr, raw] of attrs) {
    const v = raw.trim();
    if (!v || v.startsWith('#') || v.startsWith('data:') || v.startsWith('javascript:')) continue;
    // JS template placeholders (e.g. src="${FOTO.gb}") are built at runtime from
    // data constants, not static paths — nothing to resolve on disk here.
    if (v.includes('${')) continue;
    // JS string-concatenation fragments (e.g. src="' + pt + '"). Single-file apps
    // assemble tags by concatenation inside their renderers, so the regex above
    // captures a code fragment rather than a path. Skip anything that carries a
    // concatenation operator or a stray quote delimiter at either end.
    if (/'\s*\+|\+\s*'|^['"]|['"]$/.test(v)) continue;
    checked++;
    if (LOCAL_RE.test(v)) { local.push(v); continue; }
    if (EXTERNAL_RE.test(v)) { ext.push(v); continue; }
    // relative path -> must exist on disk
    const clean = v.split('#')[0].split('?')[0];
    if (!clean) { frag.push(v); continue; }
    const abs = path.resolve(path.dirname(file), decodeURIComponent(clean));
    const norm = abs.replace(/\\/g, '/').toLowerCase();
    if (norm.endsWith('.html') && allHtml.has(norm)) continue;
    if (fs.existsSync(abs)) continue;
    dead.push(v);
  }

  const uniq = (a) => [...new Set(a)];
  const d = uniq(dead), l = uniq(local);
  if (d.length) { bad += d.length; }
  if (l.length) { bad += l.length; }
  rows.push({ page, checked: attrs.length, local: l, dead: d, ext: uniq(ext).length });
  console.log(
    `${page.padEnd(18)} attrs=${String(attrs.length).padStart(4)}  ` +
    `broken-relative=${String(d.length).padStart(2)}  localhost=${String(l.length).padStart(2)}  ` +
    `external=${String(uniq(ext).length).padStart(3)}`);
  for (const x of d) console.log(`      BROKEN  ${x}`);
  for (const x of l) console.log(`      LOCAL   ${x}`);

  // Double-escaped entities: a label that is already HTML-escaped must not be
  // passed through esc() again, or "Alat & Harness" renders as "Alat &amp; Harness".
  const dbl = [...html.matchAll(/&amp;(amp|lt|gt|quot|#39);/g)];
  if (dbl.length) {
    bad += dbl.length;
    console.log(`      DOUBLE-ESCAPED ENTITY x${dbl.length} (e.g. ${dbl[0][0]})`);
  }
}

console.log(`\nchecked ${checked} attributes across ${PAGES.length} pages`);
console.log(bad === 0
  ? 'OK — every relative link resolves and no page depends on a local server'
  : `FAIL — ${bad} problem link(s)`);
process.exit(bad ? 1 : 0);

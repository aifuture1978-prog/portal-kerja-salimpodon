// Build a lean Netlify deploy directory:
//  - copy everything except .git / dev scripts / backups / VIDEO FILES
//  - rewrite local video references to absolute GitHub Pages URLs so the
//    SK. Salimpodon Darat landing page keeps playing its videos.
import fs from 'node:fs';
import path from 'node:path';

const SRC = process.cwd();
const DEST = path.join(path.dirname(SRC), 'netlify-dist');
const BASE = 'https://aifuture1978-prog.github.io/portal-kerja-salimpodon/';

const SKIP_DIRS = new Set(['.git', 'node_modules', '.netlify', '.github']);
const SKIP_EXT = new Set(['.mp4', '.mov', '.webm', '.py', '.ps1', '.pyc']);
const SKIP_FILES = new Set([
  '.gitignore', '.gitattributes', 'netlify.toml', 'build-netlify-dist.mjs',
  'verify.mjs', 'server.mjs', // dev-only tools, not referenced by any page
]);

const isBackup = (n) => n.startsWith('_');

let copied = 0, skippedVid = 0, bytes = 0, rewritten = 0;
const rewrittenFiles = [];

function walk(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, ent.name);
    const d = path.join(destDir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name) || isBackup(ent.name)) continue;
      walk(s, d);
      continue;
    }
    const ext = path.extname(ent.name).toLowerCase();
    if (SKIP_EXT.has(ext)) { if (['.mp4', '.mov', '.webm'].includes(ext)) skippedVid++; continue; }
    if (SKIP_FILES.has(ent.name) || isBackup(ent.name)) continue;

    if (ext === '.html' || ext === '.htm') {
      let html = fs.readFileSync(s, 'utf8');
      const before = html;
      html = html.replace(
        /(["'])([^"']*?\.(?:mp4|mov|webm))(\?[^"']*)?\1/gi,
        (m, q, p, qs) => {
          if (/^https?:/i.test(p)) return m;               // already absolute
          const abs = path.resolve(srcDir, p.split('#')[0].split('?')[0]);
          if (!fs.existsSync(abs)) return m;               // target truly missing -> leave
          const rel = path.relative(SRC, abs).split(path.sep).join('/');
          return `${q}${BASE}${rel}${qs || ''}${q}`;
        }
      );
      if (html !== before) { rewritten++; rewrittenFiles.push(path.relative(SRC, s).split(path.sep).join('/')); }
      fs.writeFileSync(d, html, 'utf8');
      bytes += Buffer.byteLength(html);
    } else {
      fs.copyFileSync(s, d);
      bytes += fs.statSync(s).size;
    }
    copied++;
  }
}

fs.rmSync(DEST, { recursive: true, force: true });
walk(SRC, DEST);

console.log('Files copied      :', copied);
console.log('Video files skipped:', skippedVid);
console.log('HTML rewritten    :', rewritten);
rewrittenFiles.forEach((f) => console.log('   -', f));
console.log('Payload size      :', (bytes / 1048576).toFixed(1), 'MB');
console.log('Dest              :', DEST);

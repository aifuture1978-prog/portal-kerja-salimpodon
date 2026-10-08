/**
 * Single-port static server for the AgenticOS browser build.
 *
 * Deliberately dependency-free: the publish sandbox allows exactly one HTTP
 * port and no external services, so this is a plain Node http server with
 * content-type detection and a small security header set.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/** Resolve a URL path to a file inside ROOT, or null if it escapes. */
function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const abs = normalize(join(ROOT, p));
  // Containment check — never serve outside the demo directory.
  if (abs !== ROOT.replace(/[\\/]$/, '') && !abs.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) {
    return null;
  }
  return abs;
}

async function send(res, status, body, type = 'text/plain; charset=utf-8', extra = {}) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-cache',
    ...SECURITY_HEADERS,
    ...extra,
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed');
  }

  // Tiny health endpoint — useful for the platform's own healthcheck.
  if (req.url === '/healthz') {
    return send(res, 200, JSON.stringify({ ok: true, service: 'agentic-os-demo', uptime: process.uptime() }),
      'application/json; charset=utf-8');
  }

  const file = resolve(req.url || '/');
  if (!file) return send(res, 403, 'Forbidden');

  try {
    const info = await stat(file);
    if (info.isDirectory()) {
      const index = join(file, 'index.html');
      const html = await readFile(index);
      return send(res, 200, html, TYPES['.html']);
    }
    const body = await readFile(file);
    const type = TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';
    // Hashed-ish assets are not used here, so keep it simple and uncached.
    return send(res, 200, body, type);
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      // SPA-style fallback: unknown paths still get the shell.
      try {
        const html = await readFile(join(ROOT, 'index.html'));
        return send(res, 200, html, TYPES['.html']);
      } catch {
        return send(res, 404, 'Not Found');
      }
    }
    console.error('[server]', err);
    return send(res, 500, 'Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`AgenticOS browser build listening on http://${HOST}:${PORT}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
  });
}

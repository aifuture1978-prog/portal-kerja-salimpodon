/** Tiny DOM + formatting helpers. No framework, no build step. */

/**
 * Create an element.
 * h('div', { class:'x', onclick:fn }, child1, child2)
 */
export function h(tag, attrs = null, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Escape for use inside an SVG/HTML string. */
export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* ------------------------------------------------------------------ format */

export function formatTokens(n) {
  n = Number(n) || 0;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(Math.round(n));
}

export function formatUSD(n) {
  n = Number(n) || 0;
  if (n === 0) return '$0.00';
  if (n < 0.0001) return `$${n.toExponential(1)}`;
  return `$${n.toFixed(n < 0.01 ? 4 : 2)}`;
}

export function formatMYR(n) {
  if (n < 0) return 'Custom';
  return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n);
}

export function relativeTime(ts) {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const hr = Math.round(m / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

/** Render a markdown subset: headings, bold, code, lists, blockquote, fenced blocks. */
export function markdown(md) {
  const lines = String(md ?? '').split('\n');
  const out = [];
  let inFence = false, fenceBuf = [], listType = null;

  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (line.startsWith('```')) {
      if (inFence) { out.push(`<pre class="md-pre">${esc(fenceBuf.join('\n'))}</pre>`); fenceBuf = []; inFence = false; }
      else { closeList(); inFence = true; }
      continue;
    }
    if (inFence) { fenceBuf.push(line); continue; }

    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*(\d+)\.\s+(.*)$/.exec(line);
    if (ul) { if (listType !== 'ul') { closeList(); out.push('<ul class="md-ul">'); listType = 'ul'; } out.push(`<li>${inline(ul[1])}</li>`); continue; }
    if (ol) { if (listType !== 'ol') { closeList(); out.push('<ol class="md-ol">'); listType = 'ol'; } out.push(`<li>${inline(ol[2])}</li>`); continue; }
    closeList();

    if (!line.trim()) { out.push(''); continue; }
    const hd = /^(#{1,4})\s+(.*)$/.exec(line);
    if (hd) { out.push(`<h${hd[1].length + 2} class="md-h">${inline(hd[2])}</h${hd[1].length + 2}>`); continue; }
    if (line.startsWith('> ')) { out.push(`<blockquote class="md-quote">${inline(line.slice(2))}</blockquote>`); continue; }
    if (/^---+$/.test(line.trim())) { out.push('<hr class="md-hr">'); continue; }
    out.push(`<p class="md-p">${inline(line)}</p>`);
  }
  closeList();
  if (inFence && fenceBuf.length) out.push(`<pre class="md-pre">${esc(fenceBuf.join('\n'))}</pre>`);
  return out.join('\n');
}

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*([^*]+)\*/g, '$1<em>$2</em>');
}

/** Extract a JSON object from a model response that may be fenced or wrapped. */
export function extractJson(raw) {
  if (!raw) return null;
  let text = String(raw).trim();
  if (text.startsWith('```')) {
    const parts = text.split('```');
    text = parts[1] ?? text;
    if (text.trimStart().toLowerCase().startsWith('json')) text = text.trimStart().slice(4);
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

/* ------------------------------------------------------------------ UI bits */

export function toast(message, kind = 'info', ms = 3800) {
  let host = document.getElementById('toasts');
  if (!host) {
    host = h('div', { id: 'toasts', class: 'toasts' });
    document.body.append(host);
  }
  const el = h('div', { class: `toast toast-${kind}` }, message);
  host.append(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => {
    el.classList.remove('in');
    setTimeout(() => el.remove(), 240);
  }, ms);
}

export function copy(text, label = 'Copied') {
  navigator.clipboard?.writeText(text)
    .then(() => toast(label, 'ok'))
    .catch(() => toast('Clipboard unavailable', 'warn'));
}

/** Minimal inline-SVG area chart (free vs paid tokens). */
export function areaChart(data, { width = 640, height = 220, pad = 28 } = {}) {
  const max = Math.max(1, ...data.flatMap((d) => [d.free, d.paid]));
  const stepX = (width - pad * 2) / Math.max(1, data.length - 1);
  const y = (v) => height - pad - (v / max) * (height - pad * 2);

  const path = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${pad + i * stepX},${y(d[key])}`).join(' ');
  const area = (key) => `${path(key)} L${pad + (data.length - 1) * stepX},${height - pad} L${pad},${height - pad} Z`;

  const gridY = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const yy = pad + f * (height - pad * 2);
    // NOTE: var() does not resolve inside SVG presentation attributes, so every
    // themed colour below goes through inline `style` instead.
    return `<line x1="${pad}" y1="${yy}" x2="${width - pad}" y2="${yy}" style="stroke:hsl(var(--border))" stroke-dasharray="3 3"/>
            <text x="${pad - 6}" y="${yy + 3}" text-anchor="end" font-size="9" style="fill:hsl(var(--muted-foreground))">${formatTokens(max * (1 - f))}</text>`;
  }).join('');

  const labels = data.map((d, i) =>
    `<text x="${pad + i * stepX}" y="${height - pad + 16}" text-anchor="middle" font-size="10" style="fill:hsl(var(--muted-foreground))">${esc(d.label)}</text>`,
  ).join('');

  const dots = (key, color) => data.map((d, i) =>
    `<circle cx="${pad + i * stepX}" cy="${y(d[key])}" r="2.6" fill="${color}"><title>${esc(d.label)} · ${key}: ${formatTokens(d[key])}</title></circle>`,
  ).join('');

  return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="Tokens by day, free versus paid">
    <defs>
      <linearGradient id="gFree" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="hsl(152 60% 40%)" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="hsl(152 60% 40%)" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="hsl(205 45% 55%)" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="hsl(205 45% 55%)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${gridY}
    <path d="${area('paid')}" fill="url(#gPaid)"/>
    <path d="${area('free')}" fill="url(#gFree)"/>
    <path d="${path('paid')}" fill="none" stroke="hsl(205 45% 55%)" stroke-width="2"/>
    <path d="${path('free')}" fill="none" stroke="hsl(152 60% 40%)" stroke-width="2"/>
    ${dots('paid', 'hsl(205 45% 55%)')}
    ${dots('free', 'hsl(152 60% 40%)')}
    ${labels}
  </svg>`;
}

/** Horizontal bar chart for calls by model. */
export function barChart(rows, { width = 520, rowH = 30, labelW = 150 } = {}) {
  const height = rows.length * rowH + 12;
  const max = Math.max(1, ...rows.map((r) => r.calls));
  const bars = rows.map((r, i) => {
    const y = i * rowH + 6;
    const w = Math.max(3, (r.calls / max) * (width - labelW - 54));
    const fill = r.tier === 'free' ? 'hsl(152 60% 40%)' : r.tier === 'premium' ? 'hsl(205 45% 55%)' : 'hsl(42 68% 62%)';
    return `<g><title>${esc(r.modelName ?? r.modelSlug)}: ${r.calls} calls</title>
      <text x="0" y="${y + 15}" font-size="10.5" style="fill:hsl(var(--foreground))">${esc((r.modelName ?? r.modelSlug).slice(0, 24))}</text>
      <rect x="${labelW}" y="${y + 4}" width="${w}" height="14" rx="4" fill="${fill}"/>
      <text x="${labelW + w + 7}" y="${y + 15}" font-size="10" style="fill:hsl(var(--muted-foreground))">${r.calls}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="Calls by model">${bars}</svg>`;
}

/** Donut for the free/paid/premium split. */
export function donut(parts, { size = 148, thickness = 18 } = {}) {
  const total = parts.reduce((n, p) => n + p.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  let acc = -Math.PI / 2;
  const arcs = parts.map((p) => {
    const angle = (p.value / total) * Math.PI * 2;
    const x1 = c + r * Math.cos(acc), y1 = c + r * Math.sin(acc);
    acc += angle;
    const x2 = c + r * Math.cos(acc), y2 = c + r * Math.sin(acc);
    const large = angle > Math.PI ? 1 : 0;
    return `<path d="M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}" fill="none"
      stroke="${p.color}" stroke-width="${thickness}" stroke-linecap="butt"><title>${esc(p.label)}: ${Math.round(p.value / total * 100)}%</title></path>`;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px" role="img" aria-label="Routing tier split">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" style="stroke:hsl(var(--muted))" stroke-width="${thickness}"/>
    ${arcs}
    <text x="${c}" y="${c - 2}" text-anchor="middle" font-size="20" font-weight="700" style="fill:hsl(var(--foreground))">${Math.round((parts[0]?.value ?? 0) / total * 100)}%</text>
    <text x="${c}" y="${c + 14}" text-anchor="middle" font-size="9.5" style="fill:hsl(var(--muted-foreground))">${esc(parts[0]?.label ?? '')}</text>
  </svg>`;
}

export function tierBadge(tier) {
  const map = {
    free: ['FREE', 'p-free'], cheap: ['CHEAP', 'p-cheap'],
    premium: ['PREMIUM', 'p-prem'], local: ['LOCAL', 'p-gl'],
  };
  const [label, cls] = map[tier] ?? map.cheap;
  return `<span class="pill ${cls}">${label}</span>`;
}

export const debounce = (fn, ms = 180) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

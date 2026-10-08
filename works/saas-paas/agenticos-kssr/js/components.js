/**
 * Shared building blocks used by more than one page.
 */
import { h, esc, formatTokens, formatUSD, formatMYR, relativeTime, copy, toast, tierBadge, markdown, areaChart, barChart, donut } from './ui.js';
import { icon, ico, statCard, section, bullets, codeBlock, renderOutput } from './renderers.js';
import { CATALOG, Tier, blendedCost, isFree, TASK_LABELS } from './catalog.js';

export { ico, statCard, section, bullets, codeBlock, renderOutput };

/* --------------------------------------------------------------- wrappers */
export function pageHead(title, lede, ...actions) {
  return h('div', { class: 'page-head' },
    h('div', { class: 'grow' },
      h('h1', null, title),
      lede ? h('p', { class: 'lede' }, lede) : null,
    ),
    ...actions,
  );
}

export function card(title, sub, body, actions = null, { pad = false } = {}) {
  return h('section', { class: 'card' },
    title ? h('div', { class: 'card-head' },
      h('div', null,
        h('h3', null, title),
        sub ? h('div', { class: 'sub' }, sub) : null,
      ),
      h('div', { class: 'spacer' }),
      ...(Array.isArray(actions) ? actions : actions ? [actions] : []),
    ) : null,
    pad ? h('div', { class: 'card-body' }, body) : body,
  );
}

export function emptyState(iconName, title, description, action = null) {
  return h('div', { class: 'empty' },
    h('span', { html: icon(iconName, 'ic'), style: { display: 'inline-flex' } }),
    h('strong', null, title),
    description ? h('div', { class: 'tiny' }, description) : null,
    action,
  );
}

export function kv(pairs) {
  return h('dl', { class: 'kv' }, ...pairs.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)]));
}

/* ----------------------------------------------------------------- tables */
export function table(cols, rows, { tight = false, empty = 'No rows yet.' } = {}) {
  if (!rows.length) return emptyState('db', 'Nothing here yet', empty);
  return h('div', { class: 'table-wrap' },
    h('table', { class: `tbl${tight ? ' tbl-tight' : ''}` },
      h('thead', null, h('tr', null, ...cols.map((c) => h('th', { class: c.num ? 'num' : null }, c.label)))),
      h('tbody', null, ...rows.map((r) => h('tr', null, ...cols.map((c) => {
        const v = c.render ? c.render(r) : r[c.key];
        return h('td', { class: c.num ? 'num' : null }, v ?? '—');
      })))),
    ),
  );
}

/* ========================================================================== */
/*  The fallback-ladder trace — the single most important visual in the app.  */
/* ========================================================================== */
const STATUS_META = {
  ok: { cls: 'rung-ok', ic: 'check' },
  cache_hit: { cls: 'rung-cache', ic: 'db' },
  failed: { cls: 'rung-fail', ic: 'x' },
  skipped: { cls: 'rung-skip', ic: 'warn' },
  pending: { cls: '', ic: 'clock' },
};

/**
 * Render the attempt trace produced by ModelRouter.run().
 * @param {Array} attempts
 */
export function traceLadder(attempts = []) {
  if (!attempts.length) return null;
  return h('div', { class: 'mt-3' },
    h('div', { class: 'row mb-2' },
      h('span', { class: 'lbl', style: { fontSize: '10.5px', letterSpacing: '.06em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' } }, 'Routing ladder'),
      h('span', { class: 'tiny muted' }, `${attempts.length} rung${attempts.length === 1 ? '' : 's'} attempted`),
    ),
    h('div', { class: 'ladder' }, ...attempts.map((a, i) => {
      const meta = STATUS_META[a.status] ?? STATUS_META.pending;
      const spec = CATALOG[a.model];
      return h('div', { class: `rung ${meta.cls}` },
        h('div', { class: 'rung-ic' }, h('span', { html: icon(meta.ic), style: { display: 'inline-flex' } })),
        h('div', { class: 'grow' },
          h('div', { class: 'rung-name' },
            spec?.display_name ?? a.model,
            h('span', { html: tierBadge(a.tier), style: { display: 'inline-flex' } }),
            spec && !isFree(spec) ? h('span', { class: 'tiny muted mono' }, `$${blendedCost(spec).toFixed(2)}/M`) : h('span', { class: 'tiny muted' }, 'free'),
          ),
          h('div', { class: 'rung-note' }, a.note || (a.status === 'ok' ? 'completed' : '')),
        ),
        h('div', { class: 'nowrap tiny muted nums' },
          a.latencyMs ? `${a.latencyMs} ms` : '',
        ),
      );
    })),
  );
}

/** Compact one-line attempt summary, for tables. */
export function attemptsSummary(attempts = []) {
  if (!attempts.length) return '—';
  return h('span', { class: 'row', style: { gap: '3px' } },
    ...attempts.map((a) => {
      const color = a.status === 'ok' ? 'hsl(var(--up))' : a.status === 'cache_hit' ? 'hsl(var(--info))' : a.status === 'failed' ? 'hsl(var(--down))' : 'hsl(var(--muted-foreground))';
      return h('span', {
        title: `${a.model} — ${a.status}${a.note ? `: ${a.note}` : ''}`,
        style: { width: '7px', height: '7px', borderRadius: '99px', background: color, display: 'inline-block', flex: '0 0 auto' },
      });
    }),
  );
}

/** The result block shown after an agent run: meta strip + rendered output. */
export function resultBlock(completion, agentKey, subtype) {
  const parsed = completion.parsed;
  return h('div', { class: 'stack' },
    h('div', { class: 'row-wrap', style: { gap: '7px' } },
      h('span', { class: 'pill p-cheap' }, completion.modelName ?? completion.modelSlug),
      h('span', { html: tierBadge(completion.tier), style: { display: 'inline-flex' } }),
      completion.cacheHit ? h('span', { class: 'pill p-gl' }, 'CACHE HIT') : null,
      completion.simulated ? h('span', { class: 'pill p-gl' }, 'SIMULATED') : h('span', { class: 'pill p-free' }, 'LIVE'),
      h('span', { class: 'tiny muted nums' }, `${formatTokens(completion.promptTokens)} in · ${formatTokens(completion.completionTokens)} out`),
      h('span', { class: 'tiny muted nums' }, `${completion.latencyMs} ms`),
      h('span', { class: 'tiny muted nums', style: { color: completion.costUsd > 0 ? 'hsl(var(--foreground))' : 'hsl(var(--up))' } }, completion.costUsd > 0 ? formatUSD(completion.costUsd) : 'FREE'),
      h('div', { class: 'grow' }),
      h('button', { class: 'btn btn-sm btn-ghost', onclick: () => copy(completion.text, 'Raw JSON copied') }, ico('copy', 'ic'), 'Raw'),
    ),
    renderOutput(agentKey, { parsed, text: completion.text, subtype }),
    traceLadder(completion.attempts),
  );
}

/** A run button that swaps in a spinner, executes, and renders into `target`. */
export function runButton(label, runFn, target, { cls = 'btn btn-primary', iconName = 'play' } = {}) {
  const btn = h('button', { class: cls }, ico(iconName, 'ic'), label);
  btn.addEventListener('click', async () => {
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.replaceChildren(h('span', { class: 'spinner' }), document.createTextNode('Working…'));
    target.replaceChildren(h('div', { class: 'row', style: { padding: '18px 0', gap: '10px' } },
      h('span', { class: 'spinner' }), h('span', { class: 'tiny muted' }, 'Walking the routing ladder — watch for 429s on the free rung.'),
    ));
    try {
      await runFn();
    } catch (err) {
      target.replaceChildren(h('div', { class: 'banner banner-warn' }, ico('warn'),
        h('div', null, h('strong', null, 'Run failed. '), String(err.message ?? err))));
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
  return btn;
}

/* ------------------------------------------------------------- chart cards */
export function tokenChart() {
  const data = store_usageByDay();
  return h('div', null,
    h('div', { html: areaChart(data) }),
    h('div', { class: 'legend mt-2' },
      h('span', null, h('i', { style: { background: 'hsl(152 60% 40%)' } }), 'Free tier'),
      h('span', null, h('i', { style: { background: 'hsl(205 45% 55%)' } }), 'Paid'),
    ),
  );
}

// Late-bound to avoid a circular import with store.js
let _usageByDay = () => [];
export function bindStore(fns) { _usageByDay = fns.usageByDay; }
const store_usageByDay = () => _usageByDay();

export { formatTokens, formatUSD, formatMYR, relativeTime, markdown, areaChart, barChart, donut, copy, toast, esc, tierBadge, CATALOG, Tier, blendedCost, isFree, TASK_LABELS, icon };

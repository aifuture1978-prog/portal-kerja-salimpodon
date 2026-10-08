/**
 * Workspace pages. Each exports render(ctx) -> DOM node.
 *
 * ctx = {
 *   router, store, state, mode, setMode, callAgent, refresh, go
 * }
 */
import { h, esc, formatTokens, formatUSD, formatMYR, relativeTime, copy, toast, markdown, tierBadge, donut, barChart } from './ui.js';
import { icon, ico, statCard, section, bullets, codeBlock, renderOutput } from './renderers.js';
import {
  pageHead, card, emptyState, kv, table, traceLadder, attemptsSummary,
  resultBlock, runButton, tokenChart,
} from './components.js';
import {
  CATALOG, ALL_MODELS, CHINA_MODELS, GLOBAL_MODELS, FREE_MODELS, FRONTIER_MODELS,
  FRONTIER_HIGHLIGHTS,
  Tier, blendedCost, isFree, TASK_LABELS, TASK_POLICY, AGENTS, SYSTEM_PROMPTS, CONNECTORS,
} from './catalog.js';

/* Session-scoped so switching pages does not lose a conversation. */
const studio = { transcript: [], running: false };

/* Extra prompts the creative sub-agents need (the simulator dispatches on these). */
const CREATIVE_PROMPTS = {
  quiz: SYSTEM_PROMPTS.tutor,
  game: 'You are a Tutor Agent that ships playable educational games. Return ONLY JSON: {"title": str, "subject": str, "learning_objectives": [str], "mechanics": str, "controls": str, "html": str}',
  infographic: 'You are a data-visualisation designer. Return ONLY JSON: {"title": str, "subtitle": str, "sections": [{"heading": str, "body": str, "stat": str}], "chart": {"type": "bar", "labels": [str], "series": [{"name": str, "data": [num]}]}, "palette": [str], "takeaway": str}',
  mindmap: 'You are a mind-mapping engine. Return ONLY JSON: {"title": str, "nodes": [{"id": str, "label": str, "parent": str|null, "level": int}], "edges": [{"source": str, "target": str}]}',
  image: SYSTEM_PROMPTS.creative,
  video: 'You are a video director. Return ONLY JSON: {"title": str, "shot_list": [{"t": num, "camera": str, "action": str, "prompt": str}], "style": str, "music": str}',
};

/* Plan definitions live on the Billing page — see pages2.js. */

/* ========================================================================== */
/*  Overview                                                                  */
/* ========================================================================== */
export function overviewPage(ctx) {
  const s = ctx.store;
  const usage = s.usageByModel();
  const counterfactual = s.premiumCounterfactual;
  const saved = Math.max(0, counterfactual - s.costUsd);
  const savedPct = counterfactual > 0 ? saved / counterfactual : 0;

  const originSplit = [
    { label: 'China models', value: usage.filter((u) => CHINA_MODELS.some((m) => m.slug === u.modelSlug)).reduce((n, u) => n + u.calls, 0), color: 'hsl(42 68% 62%)' },
    { label: 'Free tier', value: usage.filter((u) => u.tier === 'free').reduce((n, u) => n + u.calls, 0), color: 'hsl(152 60% 40%)' },
    { label: 'Global paid', value: usage.filter((u) => u.tier !== 'free' && !CHINA_MODELS.some((m) => m.slug === u.modelSlug)).reduce((n, u) => n + u.calls, 0), color: 'hsl(205 45% 55%)' },
  ].filter((p) => p.value > 0);

  const hero = h('div', { class: 'hero mb-4' },
    h('div', { class: 'row-wrap' },
      h('span', { class: `pill ${ctx.mode === 'real' ? 'p-free' : 'p-cheap'}` },
        h('span', { class: 'dot dot-live' }), ctx.mode === 'real' ? 'LIVE OPENROUTER' : 'SIMULATED TRANSPORT'),
      h('span', { class: 'pill p-gl' }, 'MULTI-TENANT'),
      h('span', { class: 'pill p-gl' }, `${ALL_MODELS.length} MODELS · 1 GATEWAY`),
    ),
    h('h1', { class: 'mt-2' }, 'Agentic OS — the whole platform, running in your browser'),
    h('p', null,
      'This is the real routing algorithm from the FastAPI service, ported to the browser and left visible: every rung of the fallback ladder, every 429, every cache hit and every token it cost. ',
      ctx.mode === 'real'
        ? 'Live mode is on — requests go to OpenRouter with your key.'
        : 'Paste an OpenRouter key in Settings to switch from the simulator to live calls.',
    ),
    h('div', { class: 'hero-tags' },
      ...[
        'Model-agnostic via OpenRouter',
        `${FRONTIER_MODELS.length} frontier Chinese models`,
        'Cost-aware routing',
        `${AGENTS.length} agents`,
        'MaaS billing in MYR',
        'Docker sandbox',
      ].map((t) => h('span', { class: 'chip' }, t)),
    ),
  );

  const stats = h('div', { class: 'grid g-5 mb-4' },
    statCard('Tokens routed', formatTokens(s.tokensUsed), `${s.state.usage.length} completions`, { ic: 'bolt', accent: true }),
    statCard('Actual spend', formatUSD(s.costUsd), `vs ${formatUSD(counterfactual)} premium-only`, { ic: 'chart' }),
    statCard('Saved', `${Math.round(savedPct * 100)}%`, `<span class="pos">${formatUSD(saved)}</span> avoided`, { ic: 'spark' }),
    statCard('Free-tier share', `${Math.round(s.freeShare * 100)}%`, 'of all completions', { ic: 'cloud' }),
    statCard('Cache hit rate', `${Math.round(s.cacheHitRate * 100)}%`, 'served at zero cost', { ic: 'db' }),
  );

  const chartCard = card('Tokens by day', 'Free tier versus paid — the free rung carries the load',
    h('div', { class: 'card-body' }, tokenChart()));

  const donutCard = card('Where calls land', 'Share of completions by tier',
    h('div', { class: 'card-body center' },
      originSplit.length
        ? h('div', { class: 'row', style: { justifyContent: 'center', gap: '18px', flexWrap: 'wrap' } },
          h('div', { html: donut(originSplit) }),
          h('div', { class: 'stack', style: { gap: '7px', textAlign: 'left', minWidth: '150px' } },
            ...originSplit.map((p) => h('div', { class: 'row', style: { gap: '7px', fontSize: '12px' } },
              h('span', { style: { width: '9px', height: '9px', borderRadius: '3px', background: p.color, flex: '0 0 auto' } }),
              h('span', { class: 'grow muted' }, p.label),
              h('span', { class: 'nums', style: { fontWeight: 600 } }, String(p.value)),
            ))),
        )
        : emptyState('chart', 'No usage yet', 'Run an agent to populate this.'),
    ));

  const barCard = card('Calls by model', `${usage.length} distinct models used`,
    h('div', { class: 'card-body' },
      usage.length ? h('div', { html: barChart(usage.slice(0, 8)) }) : emptyState('db', 'No calls yet')));

  const savingsCard = card('Cost story', 'Same workload, two policies',
    h('div', { class: 'card-body' },
      h('div', { class: 'stack' },
        h('div', null,
          h('div', { class: 'row', style: { justifyContent: 'space-between', fontSize: '12px' } },
            h('span', { class: 'muted' }, 'Premium-only routing'),
            h('span', { class: 'nums', style: { fontWeight: 600 } }, formatUSD(counterfactual))),
          h('div', { class: 'meter mt-1' }, h('i', { style: { width: '100%', background: 'hsl(var(--accent))' } })),
        ),
        h('div', null,
          h('div', { class: 'row', style: { justifyContent: 'space-between', fontSize: '12px' } },
            h('span', { class: 'muted' }, 'Cost-aware routing'),
            h('span', { class: 'nums', style: { fontWeight: 600, color: 'hsl(var(--up))' } }, formatUSD(s.costUsd))),
          h('div', { class: 'meter mt-1' }, h('i', { style: { width: `${Math.max(2, (s.costUsd / Math.max(counterfactual, 1e-9)) * 100)}%`, background: 'hsl(var(--up))' } })),
        ),
        h('div', { class: 'banner banner-ok' }, ico('spark'),
          h('div', { class: 'tiny' }, h('strong', null, `${formatUSD(saved)} saved. `),
            'The free rung absorbs the volume; premium is reached only when a task genuinely needs it.')),
      ),
    ));

  const recentRuns = card('Recent runs', 'Newest first — the ladder column shows every rung tried',
    h('div', { class: 'card-body', style: { padding: '0' } },
      table([
        { label: 'Agent', render: (r) => h('span', { class: 'row', style: { gap: '7px' } }, h('span', { class: 'avatar' }, r.agent.slice(0, 2).toUpperCase()), r.agent) },
        { label: 'Task', render: (r) => h('span', { class: 'chip' }, TASK_LABELS[r.task] ?? r.task) },
        { label: 'Answered by', render: (r) => h('span', { class: 'row', style: { gap: '6px' } }, h('span', { html: tierBadge(r.tier), style: { display: 'inline-flex' } }), CATALOG[r.modelSlug]?.display_name ?? r.modelSlug) },
        { label: 'Ladder', render: (r) => attemptsSummary(r.attempts) },
        { label: 'Tokens', num: true, render: (r) => formatTokens((r.promptTokens ?? 0) + (r.completionTokens ?? 0)) },
        { label: 'Cost', num: true, render: (r) => r.costUsd > 0 ? formatUSD(r.costUsd) : h('span', { style: { color: 'hsl(var(--up))' } }, 'FREE') },
        { label: 'Latency', num: true, render: (r) => `${r.latencyMs} ms` },
        { label: 'When', num: true, render: (r) => h('span', { class: 'tiny muted' }, relativeTime(r.at)) },
      ], ctx.state.runs.slice(0, 12), { tight: true, empty: 'No runs yet — try Vibe Coding Studio or the Agents page.' }),
    ));

  const connectorCard = card('Connector catalogue', `${CONNECTORS.length} integrations available to the Automation agent`,
    h('div', { class: 'card-body' },
      h('div', { class: 'row-wrap' }, ...CONNECTORS.map((c) => h('span', { class: 'chip mono' }, c)))));

  return h('div', { class: 'stack' },
    hero, stats,
    h('div', { class: 'grid g-side' }, chartCard, donutCard),
    h('div', { class: 'grid g-side' }, barCard, savingsCard),
    recentRuns,
    connectorCard,
  );
}

/* ========================================================================== */
/*  Model Router                                                              */
/* ========================================================================== */
export function routerPage(ctx) {
  const cfg = {
    task: 'coding', requireTools: false, requireVision: false,
    minContext: 0, allowPremium: true, preferFree: true, tokenBudget: 32000,
  };

  const previewHost = h('div');
  const cooldownHost = h('div');
  // Seeded with its placeholder and always mounted, so a completed run has
  // somewhere live to render into.
  const runHost = h('div', { class: 'tiny muted' },
    'Not run yet. The simulator fails free-tier calls roughly a third of the time, which is what a real free endpoint feels like under load.');

  const paintPreview = () => {
    let decision;
    try {
      decision = ctx.router.decide({
        task: cfg.task, requireTools: cfg.requireTools, requireVision: cfg.requireVision,
        minContext: cfg.minContext, allowPremium: cfg.allowPremium, preferFree: cfg.preferFree,
      });
    } catch (err) {
      previewHost.replaceChildren(h('div', { class: 'banner banner-warn' }, ico('warn'),
        h('div', null, h('strong', null, 'No candidate model. '), err.message,
          h('div', { class: 'tiny mt-1' }, 'Loosen a capability requirement or allow premium models.'))));
      return;
    }

    const ladder = decision.candidates.map((slug, i) => {
      const spec = CATALOG[slug];
      const cd = ctx.router.cooldownRemaining(slug);
      const isFirst = i === 0;
      return h('div', { class: `rung ${isFirst ? 'rung-live' : ''}${cd ? ' rung-skip' : ''}` },
        h('div', { class: 'rung-ic' }, String(i + 1)),
        h('div', { class: 'grow' },
          h('div', { class: 'rung-name' },
            spec.display_name,
            h('span', { html: tierBadge(spec.tier), style: { display: 'inline-flex' } }),
            spec.origin === 'china' ? h('span', { class: 'pill p-gl' }, spec.vendor) : null,
            cd ? h('span', { class: 'pill p-prem' }, `COOLDOWN ${cd}s`) : null,
          ),
          h('div', { class: 'rung-note' },
            `${spec.vendor} · ${formatTokens(spec.context_window)} ctx · ${isFree(spec) ? 'no cost' : `$${blendedCost(spec).toFixed(2)} blended /1M`}`,
            spec.supports_tools ? ' · tools' : '', spec.supports_vision ? ' · vision' : '',
          ),
        ),
        isFirst ? h('span', { class: 'pill p-free' }, 'SELECTED') : h('span', { class: 'tiny muted' }, `fallback ${i}`),
      );
    });

    previewHost.replaceChildren(
      h('div', { class: 'banner banner-ok mb-3' }, ico('check'),
        h('div', { class: 'grow' },
          h('div', null, h('strong', null, 'Selected: '), decision.model.display_name,
            ' ', h('span', { class: 'mono tiny muted' }, decision.model.slug)),
          h('div', { class: 'tiny muted mt-1' }, decision.reason),
        )),
      h('div', { class: 'ladder' }, ...ladder),
    );
  };

  const paintCooldowns = () => {
    const health = ctx.router.health();
    const entries = Object.entries(health.cooldowns);
    cooldownHost.replaceChildren(
      entries.length
        ? h('div', { class: 'ladder' }, ...entries.map(([slug, secs]) => h('div', { class: 'rung rung-fail' },
          h('div', { class: 'rung-ic' }, h('span', { html: icon('clock'), style: { display: 'inline-flex' } })),
          h('div', { class: 'grow' },
            h('div', { class: 'rung-name' }, CATALOG[slug]?.display_name ?? slug),
            h('div', { class: 'rung-note' }, 'circuit open — skipped by buildCandidates()'),
          ),
          h('button', { class: 'btn btn-sm btn-ghost', onclick: () => { ctx.router.clearCooldown(slug); paintCooldowns(); paintPreview(); toast('Cooldown cleared', 'ok'); } }, `clear ${secs}s`),
        )))
        : h('div', { class: 'banner banner-ok' }, ico('check'),
          h('div', { class: 'tiny' }, 'No open circuits. Run the stress test to force free-tier 429s and watch the breaker trip.')),
    );
  };

  const stress = runButton('Stress test — 8 calls on the free rung', async () => {
    const lines = [];
    for (let i = 0; i < 8; i++) {
      try {
        const c = await ctx.callAgent({
          agentKey: 'coder', task: 'coding',
          prompt: `Write a small utility function. Variation ${i + 1}.`,
          record: true, silent: true,
        });
        lines.push(h('div', { class: 'row', style: { gap: '8px', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid hsl(var(--border))' } },
          h('span', { style: { color: 'hsl(var(--up))' } }, '✓'),
          h('span', { class: 'grow' }, `${CATALOG[c.modelSlug]?.display_name ?? c.modelSlug}`),
          h('span', { class: 'tiny muted' }, `${c.attempts.length} rung${c.attempts.length === 1 ? '' : 's'}`),
          h('span', { class: 'tiny muted nums' }, `${c.latencyMs} ms`),
        ));
      } catch (err) {
        lines.push(h('div', { class: 'row', style: { gap: '8px', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid hsl(var(--border))' } },
          h('span', { style: { color: 'hsl(var(--down))' } }, '✗'),
          h('span', { class: 'grow muted' }, String(err.message).slice(0, 90)),
        ));
      }
      runHost.replaceChildren(h('div', { class: 'stack' },
        h('div', { class: 'row' }, h('span', { class: 'spinner' }), h('span', { class: 'tiny muted' }, `call ${i + 1} of 8…`)),
        ...lines,
      ));
    }
    paintCooldowns(); paintPreview();
    runHost.replaceChildren(h('div', { class: 'stack' },
      h('div', { class: 'banner banner-ok' }, ico('check'), h('div', { class: 'tiny' }, 'Stress test complete. Check the circuit-breaker board — the free rung should be cooling down.')),
      ...lines,
    ));
    toast('Stress test complete — see the breaker board', 'ok');
  }, runHost, { cls: 'btn', iconName: 'bolt' });

  const control = (label, node) => h('div', { class: 'field' }, h('label', null, label), node);

  const taskSel = h('select', { class: 'select', onchange: (e) => { cfg.task = e.target.value; paintPreview(); } },
    ...Object.keys(TASK_POLICY).map((t) => h('option', { value: t, selected: t === cfg.task }, TASK_LABELS[t] ?? t)));

  const numInput = (val, onInput, attrs = {}) => h('input', {
    class: 'input nums', type: 'number', value: val, ...attrs,
    oninput: (e) => onInput(Number(e.target.value) || 0),
  });

  const sw = (label, checked, onchange) => h('label', { class: 'switch' },
    h('input', { type: 'checkbox', checked, onchange: (e) => onchange(e.target.checked) }),
    h('span', { class: 'track' }), h('span', null, label));

  const form = h('div', { class: 'grid g-2' },
    control('Task type', taskSel),
    control('Minimum context window', numInput(cfg.minContext, (v) => { cfg.minContext = v; paintPreview(); }, { min: 0, step: 8000 })),
    control('Requires tool calling', sw('filter to tool-capable', cfg.requireTools, (v) => { cfg.requireTools = v; paintPreview(); })),
    control('Requires vision', sw('filter to vision-capable', cfg.requireVision, (v) => { cfg.requireVision = v; paintPreview(); })),
    control('Allow premium tier', sw('let the ladder reach premium', cfg.allowPremium, (v) => { cfg.allowPremium = v; paintPreview(); })),
    control('Prefer free tier', sw('sort free models first', cfg.preferFree, (v) => { cfg.preferFree = v; paintPreview(); })),
    control('Token budget per request', numInput(cfg.tokenBudget, (v) => { cfg.tokenBudget = v; })),
  );

  /* ---- catalogue ---------------------------------------------------------- */
  let catTab = 'frontier';
  const catHost = h('div');
  const catTabs = h('div', { class: 'tabs' });

  const catSets = {
    frontier: ['2026 frontier', FRONTIER_MODELS],
    china: ['China (gen 1)', CHINA_MODELS],
    global: ['Global', GLOBAL_MODELS],
    free: ['Free tier', FREE_MODELS],
    all: ['Everything', ALL_MODELS],
  };

  const paintCat = () => {
    catTabs.replaceChildren(...Object.entries(catSets).map(([k, [label, list]]) => h('button', {
      class: 'tab', 'aria-selected': String(k === catTab),
      onclick: () => { catTab = k; paintCat(); },
    }, label, h('span', { class: 'tiny muted', style: { marginLeft: '6px' } }, String(list.length)))));

    const list = [...catSets[catTab][1]].sort((a, b) => blendedCost(a) - blendedCost(b));
    catHost.replaceChildren(table([
      { label: 'Model', render: (m) => h('div', null,
        h('div', { style: { fontWeight: 600, fontSize: '12.5px' } }, m.display_name),
        h('div', { class: 'mono tiny muted' }, m.slug)) },
      { label: 'Vendor', render: (m) => h('span', { class: 'tiny' }, m.vendor) },
      { label: 'Tier', render: (m) => h('span', { html: tierBadge(m.tier), style: { display: 'inline-flex' } }) },
      { label: 'Context', num: true, render: (m) => formatTokens(m.context_window) },
      { label: 'In $/M', num: true, render: (m) => m.input_price ? `$${m.input_price.toFixed(2)}` : h('span', { style: { color: 'hsl(var(--up))' } }, 'free') },
      { label: 'Out $/M', num: true, render: (m) => m.output_price ? `$${m.output_price.toFixed(2)}` : h('span', { style: { color: 'hsl(var(--up))' } }, 'free') },
      { label: 'Blended', num: true, render: (m) => isFree(m) ? h('span', { style: { color: 'hsl(var(--up))' } }, '$0') : `$${blendedCost(m).toFixed(3)}` },
      { label: 'Caps', render: (m) => h('span', { class: 'row', style: { gap: '4px' } },
        m.supports_tools ? h('span', { class: 'chip', style: { padding: '1px 6px', fontSize: '10px' } }, 'tools') : null,
        m.supports_vision ? h('span', { class: 'chip', style: { padding: '1px 6px', fontSize: '10px' } }, 'vision') : null,
      ) },
      { label: 'Strengths', render: (m) => h('span', { class: 'tiny muted' }, (m.strengths ?? []).join(', ')) },
    ], list, { tight: true }));
  };

  paintPreview(); paintCooldowns(); paintCat();

  return h('div', { class: 'stack' },
    pageHead('Model Router',
      `One gateway, ${ALL_MODELS.length} models, zero hard-coded vendor logic. The router filters by capability, sorts free-first, drops anything in a cooldown window, then walks the ladder until something answers. The 2026 frontier wave — Kimi K2.6, MiMo-V2-Flash, GLM-5.2, MiniMax-M2.7, DeepSeek V4 Pro — sits on the same ladder as everything else.`,
      h('button', { class: 'btn', onclick: () => { paintPreview(); paintCooldowns(); toast('Router state refreshed', 'ok'); } }, ico('refresh', 'ic'), 'Refresh state')),

    /* ---- the 2026 frontier, explained in one line each -------------------- */
    card('2026 frontier wave', `${FRONTIER_MODELS.length} models trained for tool loops, not chat`,
      h('div', { class: 'card-body' },
        h('div', { class: 'grid g-3' },
          ...FRONTIER_HIGHLIGHTS.map((f) => h('div', { class: 'insight' },
            h('div', { class: 'row-wrap', style: { gap: '6px' } },
              h('span', { class: 'insight-t' }, f.model),
              h('span', { class: 'pill p-gl' }, f.vendor)),
            h('div', { class: 'tiny muted mt-1' }, f.hook),
            h('div', { class: 'mono tiny muted mt-1' }, f.slug),
          ))),
        h('div', { class: 'tiny muted mt-3' },
          'Setiap satu daripada model ini boleh dipilih secara terus dengan memilih jenis tugasan pada borang di bawah — atau dengan menukar senario pada halaman Simulasi Orkestrasi dan melihat nod mana yang naik ke tangga.'),
      )),

    h('div', { class: 'grid g-side' },
      card('Route preview', 'Decide without executing — exactly what POST /models/route-preview returns',
        h('div', { class: 'card-body' }, form, h('div', { class: 'mt-3' }, previewHost))),
      h('div', { class: 'stack' },
        card('Circuit breaker', 'Rate-limited models sit out for the configured TTL',
          h('div', { class: 'card-body' }, cooldownHost,
            h('div', { class: 'mt-3' }, stress))),
        card('Router config', 'Mirrors the FastAPI settings defaults',
          h('div', { class: 'card-body' }, kv([
            ['prefer_free', String(ctx.router.cfg.preferFree)],
            ['max_fallbacks', String(ctx.router.cfg.maxFallbacks)],
            ['circuit_breaker_ttl', `${ctx.router.cfg.circuitBreakerTtl}s`],
            ['request_timeout', `${ctx.router.cfg.requestTimeout}s`],
            ['default_token_budget', formatTokens(ctx.router.cfg.defaultTokenBudget)],
            ['catalogue size', `${ctx.router.health().catalogSize} models`],
          ]))),
      ),
    ),

    card('Stress-test log', 'What the breaker board above is reacting to',
      h('div', { class: 'card-body' }, runHost)),

    card('Model catalogue', 'Sorted by blended cost — free rungs always sort first',
      h('div', { class: 'card-body' },
        h('div', { class: 'mb-3' }, catTabs),
        catHost)),
  );
}

/* ========================================================================== */
/*  Vibe Coding Studio                                                        */
/* ========================================================================== */
export function studioPage(ctx) {
  const transcriptHost = h('div', { class: 'chat' });
  let agentKey = 'coder';
  let stack = 'nextjs';

  const STACKS = [
    ['nextjs', 'Next.js 15 + TypeScript'], ['fastapi', 'FastAPI + Python'],
    ['go', 'Go service'], ['laravel', 'Laravel + PHP'],
  ];
  const AGENT_CHOICES = ['coder', 'designer', 'researcher', 'writer', 'qa', 'automation', 'deploy'];

  const paint = () => {
    transcriptHost.replaceChildren(...studio.transcript.map((m) => m.role === 'user'
      ? h('div', { class: 'msg msg-user' },
        h('div', { class: 'msg-avatar' }, 'YOU'),
        h('div', { class: 'msg-body' }, h('div', { style: { fontSize: '13px' } }, m.text)))
      : h('div', { class: 'msg' },
        h('div', { class: 'msg-avatar' }, (m.agentKey ?? 'AI').slice(0, 2).toUpperCase()),
        h('div', { class: 'msg-body' },
          h('div', { class: 'msg-meta' },
            h('strong', null, AGENTS.find((a) => a.key === m.agentKey)?.name ?? m.agentKey),
            h('span', { html: tierBadge(m.completion.tier) }),
            h('span', null, m.completion.modelName),
            m.completion.cacheHit ? h('span', { class: 'pill p-gl' }, 'CACHE') : null,
            h('span', { class: 'nums' }, `${formatTokens((m.completion.promptTokens ?? 0) + (m.completion.completionTokens ?? 0))} tok`),
            h('span', { class: 'nums' }, m.completion.costUsd > 0 ? formatUSD(m.completion.costUsd) : 'FREE'),
          ),
          renderOutput(m.agentKey, { parsed: m.completion.parsed, text: m.completion.text, subtype: m.subtype }),
          traceLadder(m.completion.attempts),
        ))));
    if (!studio.transcript.length) {
      transcriptHost.replaceChildren(emptyState('code', 'Nothing generated yet',
        'Describe what you want built. The Coder agent returns files, tests and run commands as structured JSON — not prose.'));
    }
    transcriptHost.scrollTop = transcriptHost.scrollHeight;
  };

  const promptBox = h('textarea', {
    class: 'textarea', rows: 3,
    placeholder: 'Build a fixed-window rate limiter for the public API, backed by Redis with an in-memory fallback, plus tests.',
  });

  const agentSel = h('select', { class: 'select', onchange: (e) => { agentKey = e.target.value; } },
    ...AGENT_CHOICES.map((k) => h('option', { value: k, selected: k === agentKey },
      `${AGENTS.find((a) => a.key === k)?.name} — ${AGENTS.find((a) => a.key === k)?.task}`)));

  const stackSel = h('select', { class: 'select', onchange: (e) => { stack = e.target.value; } },
    ...STACKS.map(([v, l]) => h('option', { value: v, selected: v === stack }, l)));

  const send = async () => {
    const text = promptBox.value.trim();
    if (!text) { toast('Describe what you want built first', 'warn'); return; }
    const agent = AGENTS.find((a) => a.key === agentKey);
    const prompt = `Stack: ${stack}\nTask: ${text}`;
    studio.transcript.push({ role: 'user', text: `${text}\n\n— ${agent.name} · ${stack}` });
    promptBox.value = '';
    paint();

    const pending = h('div', { class: 'msg' },
      h('div', { class: 'msg-avatar' }, agent.name.slice(0, 2).toUpperCase()),
      h('div', { class: 'msg-body' },
        h('div', { class: 'row', style: { gap: '9px' } },
          h('span', { class: 'spinner' }),
          h('span', { class: 'tiny muted' }, `${agent.name} is working — the free rung may 429 before it lands.`))));
    transcriptHost.append(pending);
    transcriptHost.scrollTop = transcriptHost.scrollHeight;

    try {
      const completion = await ctx.callAgent({
        agentKey, prompt, task: agent.task, systemPrompt: SYSTEM_PROMPTS[agentKey], record: true,
      });
      pending.remove();
      studio.transcript.push({ role: 'assistant', agentKey, completion });
    } catch (err) {
      pending.remove();
      transcriptHost.append(h('div', { class: 'banner banner-warn' }, ico('warn'),
        h('div', null, h('strong', null, 'Every rung failed. '), String(err.message))));
    }
    paint();
  };

  const sendBtn = h('button', { class: 'btn btn-primary', onclick: send }, ico('spark', 'ic'), 'Generate');
  promptBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
  });

  paint();

  return h('div', { class: 'stack' },
    pageHead('Vibe Coding Studio',
      'Describe the change; the agent returns typed files, tests and run commands. Every response reports which model answered, what it cost, and which rungs it fell through to get there.',
      h('button', {
        class: 'btn', onclick: () => { studio.transcript = []; paint(); toast('Transcript cleared'); },
      }, ico('trash', 'ic'), 'Clear')),

    h('div', { class: 'grid g-side' },
      card('Conversation', `${studio.transcript.length} message${studio.transcript.length === 1 ? '' : 's'} in this session`,
        h('div', { class: 'card-body' },
          h('div', { class: 'scroll-y-420', style: { marginBottom: '14px' } }, transcriptHost))),

      h('div', { class: 'stack' },
        card('Compose', 'Cmd/Ctrl + Enter to send',
          h('div', { class: 'card-body stack' },
            h('div', { class: 'field' }, h('label', null, 'Instruction'), promptBox),
            h('div', { class: 'grid g-2' },
              h('div', { class: 'field' }, h('label', null, 'Agent'), agentSel),
              h('div', { class: 'field' }, h('label', null, 'Stack'), stackSel),
            ),
            h('div', { class: 'row' },
              sendBtn,
              h('button', {
                class: 'btn',
                onclick: () => { promptBox.value = 'Build a fixed-window rate limiter for the public API, backed by Redis with an in-memory fallback, plus tests.'; },
              }, 'Use example'),
            ),
          )),
        card('Why structured output', 'The reason agents return JSON, not prose',
          h('div', { class: 'card-body' },
            h('div', { class: 'tiny muted' },
              'A prose answer can only be read by a human. This contract — ',
              h('code', null, 'files[]'), ', ', h('code', null, 'tests[]'), ', ', h('code', null, 'run_commands[]'),
              ' — is simultaneously renderable here, writable to disk by the worker, and checkable by the QA agent. ',
              'One contract, three consumers.')),
        ),
      ),
    ),

    card('Sandbox note', 'Generated code never touches your machine directly',
      h('div', { class: 'card-body' },
        h('div', { class: 'grid g-2' },
          h('div', null, section('Server-side sandbox',
            bullets(['Docker with --network none', 'Read-only root filesystem', 'All capabilities dropped', '128 PID limit, 512 MB memory cap', '18 banned tokens rejected before execution'], { mark: 'shield' }))),
          h('div', null, section('Browser-side sandbox',
            bullets(['Generated games run in an iframe', 'sandbox="allow-scripts" only', 'No allow-same-origin, so no storage or cookie access', 'Your OpenRouter key is unreachable from generated code'], { mark: 'shield' }))),
        )),
    ),
  );
}

/* ========================================================================== */
/*  Agents                                                                    */
/* ========================================================================== */
export function agentsPage(ctx) {
  const runHost = h('div', { class: 'tiny muted' }, 'Pick an agent, then run it to see output here.');
  let active = AGENTS[0].key;
  let prompt = 'Draft a launch announcement for the Malaysian market.';

  const promptBox = h('textarea', { class: 'textarea', rows: 3, oninput: (e) => { prompt = e.target.value; } });
  promptBox.value = prompt;

  const examples = {
    orchestrator: 'Ship a customer onboarding flow with email verification',
    coder: 'Build a fixed-window rate limiter with Redis and tests',
    designer: 'Settings screen with notification toggles and a danger zone',
    researcher: 'What are the PDPA obligations for an AI SaaS operating in Malaysia?',
    writer: 'Write the landing page copy for a cost-aware LLM routing platform',
    qa: 'Review a rate limiter implementation for defects and security issues',
    automation: 'When a lead fills the web form, qualify it and push to Slack',
    creative: 'A datacentre at dusk seen through floor-to-ceiling glass',
    tutor: 'Photosynthesis for secondary school',
    deploy: 'Containerise a Next.js app for a Malaysian VPS',
    swarm: 'Produce a 2026 competitor teardown of five Malaysian edtech products',
    longctx: 'Read the whole 214-page DSKP BM Tahun 3 and list every SP under SK 5',
    mimo: 'Add cursor pagination to the /orders endpoint and prove it with a test',
    /* KSSR education agents */
    rph: 'Mata Pelajaran: Bahasa Melayu\nTahun: Tahun 3\nKelas: 3 Bestari\nMasa: 8.10 - 9.10 pagi (60 minit)\nBidang: Kemahiran Mendengar dan Bertutur\nTajuk: Kata Nama Am dan Kata Nama Khas\nStandard Kandungan: SK 5.1 - Memahami dan menggunakan perkataan daripada pelbagai golongan kata\nStandard Pembelajaran: SP 5.1.1 - Mengenal pasti kata nama am dan kata nama khas\nSP 5.1.2 - Menggunakan kata nama am dan kata nama khas dengan betul dalam ayat\nEMK dipilih: Nilai Murni, Kreativiti dan Inovasi\nAras KBAT sasaran: Menganalisis\nKurikulum: KSSR Semakan 2017.',
    dskp: 'Mata Pelajaran: Matematik\nTahun: Tahun 4\nBidang: Nombor dan Operasi\nKurikulum: KSSR Semakan 2017.',
    pbd: 'Mata Pelajaran: Matematik\nTahun: Tahun 4\nTajuk: Pecahan\nBilangan item diminta: 5\nKaedah pentaksiran: Pemerhatian, Kuiz dan ujian pendek\nKurikulum: KSSR Semakan 2017.',
    bbm: 'Mata Pelajaran: Sains\nTahun: Tahun 5\nTajuk: Proses Hidup Tumbuhan\nJenis bahan: Lembaran kerja\nKurikulum: KSSR Semakan 2017.',
    panitia: 'Mata Pelajaran: Bahasa Melayu\nTahun: Tahun 3\nJenis dokumen: RPT + Mesyuarat + Analisis\nKurikulum: KSSR Semakan 2017.',
    bahasa: 'Tajuk: Kata Nama Am dan Kata Nama Khas\nSumber: Bahasa Melayu\nTerjemah ke: English, Bahasa Kadazandusun',
    admin: 'Sekolah: Sekolah Kebangsaan Salimpodon Darat, Pitas\nJenis: Ringkasan enrolmen bulanan\nSumber data: APDM, EMIS',
    orkestra: 'Mata Pelajaran: Bahasa Melayu\nTahun: Tahun 3\nJenis dokumen: Aliran automatik RPH mingguan\nKurikulum: KSSR Semakan 2017.',
  };

  const paintTiles = () => h('div', { class: 'grid g-2' }, ...AGENTS.map((a) => {
    const on = a.key === active;
    return h('button', {
      class: 'card card-pad', style: {
        textAlign: 'left', cursor: 'pointer', borderColor: on ? 'hsl(var(--primary))' : null,
        boxShadow: on ? '0 0 0 3px hsl(var(--primary) / .13), var(--shadow-card)' : null,
      },
      onclick: () => {
        active = a.key;
        prompt = examples[a.key] ?? prompt;
        promptBox.value = prompt;
        paint();
      },
    },
      h('div', { class: 'agent-tile' },
        h('div', { class: 'avatar' }, a.name.slice(0, 2).toUpperCase()),
        h('div', { class: 'grow' },
          h('div', { class: 'row', style: { gap: '7px' } },
            h('strong', { style: { fontSize: '13px' } }, a.name),
            h('span', { class: 'chip', style: { padding: '1px 7px', fontSize: '10px' } }, TASK_LABELS[a.task] ?? a.task),
          ),
          h('div', { class: 'tiny muted mt-1' }, a.desc),
          h('div', { class: 'row-wrap mt-2' },
            h('span', { class: 'mono tiny' }, CATALOG[a.model]?.display_name ?? a.model),
            ...(a.fallback ?? []).map((f) => h('span', { class: 'mono tiny muted' }, `→ ${CATALOG[f]?.display_name ?? f}`)),
          ),
        ),
      ),
    );
  }));

  const body = h('div');
  const paint = () => {
    const agent = AGENTS.find((a) => a.key === active);
    body.replaceChildren(
      h('div', { class: 'grid g-side' },
        card('Agent roster', `${AGENTS.length} built-in specialists`,
          h('div', { class: 'card-body' }, paintTiles())),
        h('div', { class: 'stack' },
          card(`Run ${agent.name}`, agent.desc,
            h('div', { class: 'card-body stack' },
              h('div', { class: 'row-wrap' },
                h('span', { class: 'pill p-cheap' }, TASK_LABELS[agent.task] ?? agent.task),
                h('span', { class: 'mono tiny muted' }, agent.model),
              ),
              h('div', { class: 'field' }, h('label', null, 'Prompt'), promptBox),
              h('div', { class: 'row' },
                runButton(`Run ${agent.name}`, async () => {
                  const completion = await ctx.callAgent({
                    agentKey: agent.key, prompt, task: agent.task,
                    systemPrompt: SYSTEM_PROMPTS[agent.key], record: true,
                  });
                  runHost.replaceChildren(resultBlock(completion, agent.key));
                }, runHost),
                h('button', { class: 'btn', onclick: () => { prompt = examples[agent.key]; promptBox.value = prompt; } }, 'Use example'),
              ),
            )),
          card('System prompt', 'The contract the model is held to',
            h('div', { class: 'card-body' }, codeBlock(SYSTEM_PROMPTS[agent.key], null))),
        ),
      ),
      card('Output', 'Rendered from the agent\u2019s JSON contract',
        h('div', { class: 'card-body' }, runHost)),
    );
  };

  paint();
  return h('div', { class: 'stack' },
    pageHead('Agents', 'Ten specialists sharing one gateway. Each declares a task type, a primary model and a fallback chain — the router resolves all three at call time.'),
    body,
  );
}

/**
 * Workspace pages, part two: creative, workflows, projects, billing, keys, settings.
 */
import { h, esc, formatTokens, formatUSD, formatMYR, relativeTime, copy, toast, tierBadge } from './ui.js';
import { icon, ico, statCard, section, bullets, codeBlock, renderOutput } from './renderers.js';
import { pageHead, card, emptyState, kv, table, traceLadder, resultBlock, runButton } from './components.js';
import { CATALOG, AGENTS, SYSTEM_PROMPTS, CONNECTORS, TASK_LABELS } from './catalog.js';

const PLANS = [
  { id: 'free', name: 'Free', price: 0, tokens: 100_000, tag: null, feats: ['1 workspace', 'Free-tier models only', 'Community support'] },
  { id: 'pro', name: 'Pro', price: 49, tokens: 2_000_000, tag: 'POPULAR', feats: ['3 workspaces', 'All 26 models + premium fallback', '5 automation workflows', 'Email support'] },
  { id: 'team', name: 'Team', price: 199, tokens: 10_000_000, tag: null, feats: ['Unlimited workspaces', 'RBAC + audit log', 'Unlimited workflows', 'SSO (Google / Microsoft)', 'Priority support'] },
  { id: 'paas', name: 'PaaS', price: 29, tokens: 500_000, tag: 'PER APP', feats: ['1 deployed app', 'Public API + webhooks', '99.5% uptime SLA'] },
  { id: 'enterprise', name: 'Enterprise', price: -1, tokens: Infinity, tag: null, feats: ['On-prem / VPS in Malaysia', 'PDPA + data residency', 'Dedicated model pool', '24/7 SLA'] },
  { id: 'whitelabel', name: 'White-label', price: 999, tokens: Infinity, tag: 'OEM', feats: ['Your brand, your domain', 'Reseller billing', 'Custom agent pack'] },
];

/* ========================================================================== */
/*  Creative Studio                                                           */
/* ========================================================================== */
export function creativePage(ctx) {
  const TABS = [
    { id: 'quiz', label: 'Quiz', agent: 'tutor', task: 'quiz', ph: 'Photosynthesis', extra: 'level' },
    { id: 'game', label: 'Playable game', agent: 'tutor', task: 'game', ph: 'Fractions', extra: 'level' },
    { id: 'infographic', label: 'Infographic', agent: 'creative', task: 'design', ph: 'Where the tokens go', extra: null },
    { id: 'mindmap', label: 'Mind map', agent: 'creative', task: 'design', ph: 'Agentic OS architecture', extra: null },
    { id: 'image', label: 'Image prompt', agent: 'creative', task: 'image', ph: 'A datacentre at dusk', extra: null },
    { id: 'video', label: 'Video storyboard', agent: 'creative', task: 'video', ph: 'How the fallback ladder works', extra: null },
  ];

  let tab = 'quiz';
  let topic = 'Photosynthesis';
  let level = 'secondary';
  const outHost = h('div', null, emptyState('brush', 'Nothing generated yet', 'Pick a tab, set a topic, and generate.'));

  const tabsBar = h('div', { class: 'tabs' });
  const formHost = h('div');
  const topicInput = h('input', { class: 'input', value: topic, oninput: (e) => { topic = e.target.value; } });
  const levelSel = h('select', { class: 'select', onchange: (e) => { level = e.target.value; } },
    ...[['primary', 'Primary'], ['secondary', 'Secondary'], ['tertiary', 'Tertiary']]
      .map(([v, l]) => h('option', { value: v, selected: v === level }, l)));

  const paintForm = () => {
    const t = TABS.find((x) => x.id === tab);
    formHost.replaceChildren(
      h('div', { class: 'field' }, h('label', null, 'Topic'), topicInput),
      t.extra === 'level'
        ? h('div', { class: 'field' }, h('label', null, 'Level'), levelSel)
        : h('div', { class: 'field' }, h('label', null, 'Note'),
          h('div', { class: 'tiny muted' }, 'This agent returns a prompt or a diagram spec, not a rendered asset — the payload is what you would hand to an image or video model.')),
      h('div', { class: 'row mt-1' },
        runButton('Generate', async () => {
          const prompt = t.extra === 'level'
            ? `Topic: ${topic}\nLevel: ${level}`
            : `Topic: ${topic}`;
          const completion = await ctx.callAgent({
            agentKey: t.agent, prompt, task: t.task,
            systemPrompt: CREATIVE_PROMPTS[t.id], record: true, subtype: t.id,
          });
          outHost.replaceChildren(resultBlock(completion, t.agent, t.id));
        }, outHost),
        h('span', { class: 'tiny muted' }, `${AGENTS.find((a) => a.key === t.agent)?.name} agent`),
      ),
    );
  };

  const paintTabs = () => {
    tabsBar.replaceChildren(...TABS.map((t) => h('button', {
      class: 'tab', 'aria-selected': String(t.id === tab),
      onclick: () => { tab = t.id; paintTabs(); paintForm(); },
    }, t.label)));
  };

  paintTabs(); paintForm();

  return h('div', { class: 'stack' },
    pageHead('Creative Studio',
      'Quiz players, playable games, infographics, mind maps, image prompts and video storyboards — all generated from structured JSON, all rendered live.'),

    h('div', { class: 'grid g-side' },
      card('Output', 'Rendered from the agent contract',
        h('div', { class: 'card-body' }, outHost)),
      h('div', { class: 'stack' },
        card('Generator', 'Six creative contracts',
          h('div', { class: 'card-body' },
            h('div', { class: 'mb-3', style: { overflowX: 'auto' } }, tabsBar),
            h('div', { class: 'stack' }, formHost))),
        card('Why this is not a mockup', 'The payloads are real',
          h('div', { class: 'card-body' },
            h('div', { class: 'tiny muted' },
              'The quiz player scores you and explains each answer. The game is a genuine canvas game with physics, lives and a streak counter, generated as HTML and run in a sandboxed iframe. ',
              'The infographic and mind map are laid out from node lists by real layout code — radial for the map, layered BFS for workflows.'))),
      ),
    ),

    card('Creative contracts', 'What each sub-agent must return',
      h('div', { class: 'card-body' },
        h('div', { class: 'grid g-2' },
          ...TABS.map((t) => h('div', null,
            h('div', { class: 'row mb-1' },
              h('strong', { style: { fontSize: '12.5px' } }, t.label),
              h('span', { class: 'chip', style: { padding: '1px 7px', fontSize: '10px' } }, TASK_LABELS[t.task] ?? t.task),
            ),
            h('div', { class: 'mono tiny muted' }, String(CREATIVE_PROMPTS[t.id]).split('Return ONLY JSON:')[1]?.trim().slice(0, 190) ?? '—'),
          )),
        ))),
  );
}

const CREATIVE_PROMPTS = {
  quiz: SYSTEM_PROMPTS.tutor,
  game: 'You are a Tutor Agent that ships playable educational games. Return ONLY JSON: {"title": str, "subject": str, "learning_objectives": [str], "mechanics": str, "controls": str, "html": str}',
  infographic: 'You are a data-visualisation designer. Return ONLY JSON: {"title": str, "subtitle": str, "sections": [...], "chart": {...}, "palette": [...], "takeaway": str}',
  mindmap: 'You are a mind-mapping engine. Return ONLY JSON: {"title": str, "nodes": [...], "edges": [...]}',
  image: SYSTEM_PROMPTS.creative,
  video: 'You are a video director. Return ONLY JSON: {"title": str, "shot_list": [...], "style": str, "music": str}',
};

/* ========================================================================== */
/*  Workflows                                                                 */
/* ========================================================================== */
export function workflowsPage(ctx) {
  const outHost = h('div');
  let goal = 'Ship a customer onboarding flow with email verification';
  const goalBox = h('textarea', { class: 'textarea', rows: 2, oninput: (e) => { goal = e.target.value; } });
  goalBox.value = goal;

  const execHost = h('div');

  const orchestrate = async () => {
    const completion = await ctx.callAgent({
      agentKey: 'orchestrator', prompt: `Goal: ${goal}`, task: 'automation',
      systemPrompt: SYSTEM_PROMPTS.orchestrator, record: true,
    });
    outHost.replaceChildren(resultBlock(completion, 'orchestrator'));
    execHost.replaceChildren();
    return completion;
  };

  const autoHost = h('div');
  let autoGoal = 'When a lead fills the web form, qualify it and notify sales';
  const autoBox = h('textarea', { class: 'textarea', rows: 2, oninput: (e) => { autoGoal = e.target.value; } });
  autoBox.value = autoGoal;

  return h('div', { class: 'stack' },
    pageHead('Workflows',
      'Two engines. The Orchestrator decomposes a goal into an ordered plan with dependencies; the Automation agent emits an executable node-and-edge graph against the connector catalogue.'),

    h('div', { class: 'grid g-side' },
      card('Orchestrator plan', 'Goal → ordered steps with dependencies and acceptance criteria',
        h('div', { class: 'card-body stack' },
          h('div', { class: 'field' }, h('label', null, 'Goal'), goalBox),
          h('div', { class: 'row' },
            runButton('Plan it', orchestrate, outHost),
            h('span', { class: 'tiny muted' }, 'Sequential by default; LangGraph engages when steps share dependency depth.'),
          ),
          outHost,
        )),
      h('div', { class: 'stack' },
        card('Engines', 'Same agents, two execution strategies',
          h('div', { class: 'card-body' },
            h('div', { class: 'stack' },
              h('div', null,
                h('div', { class: 'row mb-1' }, h('strong', { style: { fontSize: '12.5px' } }, 'Sequential'), h('span', { class: 'pill p-cheap' }, 'DEFAULT')),
                h('div', { class: 'tiny muted' }, 'Steps run in dependency order, one at a time. Predictable cost, easy to debug, no extra dependency.'),
              ),
              h('div', null,
                h('div', { class: 'row mb-1' }, h('strong', { style: { fontSize: '12.5px' } }, 'LangGraph fan-out'), h('span', { class: 'pill p-gl' }, 'AUTO')),
                h('div', { class: 'tiny muted' }, 'Engaged when two or more steps share the same dependency depth — independent branches run concurrently. Guarded import: if LangGraph is absent, the sequential engine runs instead of failing.'),
              ),
            )),
        ),
        card('Connectors', `${CONNECTORS.length} available`,
          h('div', { class: 'card-body' },
            h('div', { class: 'row-wrap' }, ...CONNECTORS.slice(0, 18).map((c) => h('span', { class: 'chip mono' }, c)),
              h('span', { class: 'chip' }, `+${CONNECTORS.length - 18} more`)))),
      ),
    ),

    card('Automation builder', 'Emits nodes, edges, conditions and error handling',
      h('div', { class: 'card-body stack' },
        h('div', { class: 'grid g-2' },
          h('div', { class: 'field' }, h('label', null, 'Automation goal'), autoBox),
          h('div', { class: 'field' }, h('label', null, 'Trigger'),
            h('div', { class: 'row-wrap' },
              ...['webhook', 'cron', 'email', 'chat', 'file'].map((t) => h('span', { class: 'chip' }, t)))),
        ),
        h('div', { class: 'row' }, runButton('Build workflow', async () => {
          const completion = await ctx.callAgent({
            agentKey: 'automation', prompt: `Goal: ${autoGoal}`, task: 'automation',
            systemPrompt: SYSTEM_PROMPTS.automation, record: true,
          });
          autoHost.replaceChildren(resultBlock(completion, 'automation'));
        }, autoHost, { cls: 'btn', iconName: 'flow' })),
        autoHost,
      )),
  );
}

/* ========================================================================== */
/*  Projects                                                                  */
/* ========================================================================== */
export function projectsPage(ctx) {
  const s = ctx.state;
  const host = h('div');

  const STATUS = {
    deployed: ['p-free', 'DEPLOYED'], building: ['p-cheap', 'BUILDING'],
    draft: ['p-gl', 'DRAFT'], failed: ['p-prem', 'FAILED'],
  };

  const paint = () => {
    host.replaceChildren(
      h('div', { class: 'grid g-4 mb-4' },
        statCard('Projects', String(s.projects.length), 'in this workspace', { ic: 'layers', accent: true }),
        statCard('Deployed', String(s.projects.filter((p) => p.status === 'deployed').length), 'live and reachable', { ic: 'cloud' }),
        statCard('Building', String(s.projects.filter((p) => p.status === 'building').length), 'in the deploy queue', { ic: 'clock' }),
        statCard('Assets', String(s.assets.length), 'quizzes, games, images', { ic: 'brush' }),
      ),
      card('Projects', 'Build → sandbox → publish',
        h('div', { class: 'card-body', style: { padding: '0' } },
          table([
            { label: 'Name', render: (p) => h('div', null,
              h('div', { style: { fontWeight: 600, fontSize: '12.5px' } }, p.name),
              h('div', { class: 'mono tiny muted' }, p.url ?? 'not published')) },
            { label: 'Stack', render: (p) => h('span', { class: 'chip mono' }, p.stack) },
            { label: 'Status', render: (p) => { const [cls, label] = STATUS[p.status] ?? STATUS.draft; return h('span', { class: `pill ${cls}` }, label); } },
            { label: 'Updated', num: true, render: (p) => h('span', { class: 'tiny muted' }, relativeTime(p.updated)) },
            { label: '', render: (p) => h('div', { class: 'row', style: { justifyContent: 'flex-end', gap: '5px' } },
              h('button', { class: 'btn btn-sm', onclick: () => toast(`Rebuilding ${p.name}…`, 'info') }, ico('refresh', 'ic'), 'Rebuild'),
              h('button', {
                class: 'btn btn-sm btn-danger',
                onclick: () => { ctx.store.update((st) => { st.projects = st.projects.filter((x) => x.id !== p.id); }); paint(); toast('Project removed', 'ok'); },
              }, ico('trash', 'ic')),
            ) },
          ], s.projects, { empty: 'No projects yet.' })),
      ),
      h('div', { class: 'grid g-side mt-4' },
        card('Publish sandbox', 'What the hosted runtime allows',
          h('div', { class: 'card-body' },
            h('div', { class: 'grid g-2' },
              h('div', null, section('Allowed',
                bullets(['A single HTTP port', 'Static sites and SSR apps', 'SQLite on disk', 'Public managed databases (e.g. Supabase)', 'Outbound HTTPS'], { mark: 'check' }))),
              h('div', null, section('Rejected at pre-check',
                bullets(['Postgres / Redis / RabbitMQ / MongoDB containers', 'Multi-port topologies', 'Services declared in docker-compose.yml', 'Driver packages with local connection strings'], { mark: 'x' }))),
            ),
            h('div', { class: 'banner mt-3' }, ico('info'),
              h('div', { class: 'tiny' },
                'This platform is a single-port static build for exactly that reason — the production stack needs Postgres, Redis and RabbitMQ, which is why the full ',
                h('code', null, 'docker compose up'), ' topology ships as source rather than running here.')),
          )),
        card('New project', 'Scaffolds a repo from a template',
          (() => {
            let name = '', stack = 'nextjs';
            const nameBox = h('input', { class: 'input', placeholder: 'Project name', oninput: (e) => { name = e.target.value; } });
            const stackSel = h('select', { class: 'select', onchange: (e) => { stack = e.target.value; } },
              ...['nextjs', 'fastapi', 'go', 'laravel', 'vue'].map((v) => h('option', { value: v }, v)));
            return h('div', { class: 'card-body stack' },
              h('div', { class: 'field' }, h('label', null, 'Name'), nameBox),
              h('div', { class: 'field' }, h('label', null, 'Stack'), stackSel),
              h('button', {
                class: 'btn btn-primary',
                onclick: () => {
                  if (!name.trim()) { toast('Give the project a name', 'warn'); return; }
                  ctx.store.update((st) => {
                    st.projects.unshift({ id: `p${Date.now()}`, name: name.trim(), stack, status: 'draft', url: null, updated: Date.now() });
                  });
                  nameBox.value = ''; name = '';
                  paint(); toast('Project created', 'ok');
                },
              }, ico('plus', 'ic'), 'Create project'),
            );
          })()),
      ),
    );
  };

  paint();
  return h('div', null, pageHead('Projects', 'Every build in this workspace, with the publish-sandbox constraints that shape how it ships.'), host);
}

/* ========================================================================== */
/*  Billing / MaaS                                                            */
/* ========================================================================== */
export function billingPage(ctx) {
  const s = ctx.store;
  const usage = s.usageByModel();
  const counterfactual = s.premiumCounterfactual;
  const saved = Math.max(0, counterfactual - s.costUsd);
  const plan = PLANS.find((p) => p.id === s.state.settings.plan) ?? PLANS[1];
  const granted = s.state.settings.tokensGranted;
  const used = s.tokensUsed;
  const pct = granted === Infinity ? 0 : Math.min(1, used / granted);

  const MYR_PER_USD = 4.45;

  return h('div', { class: 'stack' },
    pageHead('Billing',
      'Metered per token, priced in ringgit. Every completion is attributed to a model, a tier and a tenant — which is what makes the invoice defensible.'),

    h('div', { class: 'grid g-4' },
      statCard('Current plan', plan.name, plan.price < 0 ? 'custom pricing' : formatMYR(plan.price) + ' / month', { ic: 'tag', accent: true }),
      statCard('Tokens this cycle', formatTokens(used), granted === Infinity ? 'unlimited on this plan' : `of ${formatTokens(granted)} granted`, { ic: 'bolt' }),
      statCard('Amount due', formatMYR(Math.round(s.costUsd * MYR_PER_USD * 100) / 100), `at RM ${MYR_PER_USD} / USD`, { ic: 'chart' }),
      statCard('Avoided', formatMYR(Math.round(saved * MYR_PER_USD * 100) / 100), 'vs premium-only routing', { ic: 'spark' }),
    ),

    card('Quota', granted === Infinity ? 'Unlimited on this plan' : `${Math.round(pct * 100)}% of the monthly grant consumed`,
      h('div', { class: 'card-body' },
        granted === Infinity
          ? h('div', { class: 'banner banner-ok' }, ico('check'), h('div', { class: 'tiny' }, 'No token ceiling on this plan. Spend is still capped per request by the router token budget.'))
          : h('div', null,
            h('div', { class: 'meter' }, h('i', { style: { width: `${Math.max(1, pct * 100)}%`, background: pct > .85 ? 'hsl(var(--down))' : undefined } })),
            h('div', { class: 'row mt-2', style: { justifyContent: 'space-between' } },
              h('span', { class: 'tiny muted nums' }, `${formatTokens(used)} used`),
              h('span', { class: 'tiny muted nums' }, `${formatTokens(granted - used)} remaining`)),
            pct > .85 ? h('div', { class: 'banner banner-warn mt-3' }, ico('warn'), h('div', { class: 'tiny' }, 'Above 85% of quota. Free-tier routing will keep absorbing most of the volume, but consider upgrading before the ceiling bites.')) : null,
          ),
      )),

    card('Plans', 'Change plan at any time — prorated to the day',
      h('div', { class: 'card-body' },
        h('div', { class: 'grid g-3' }, ...PLANS.map((p) => {
          const on = p.id === s.state.settings.plan;
          return h('div', { class: `plan${on ? ' plan-on' : ''}` },
            p.tag ? h('span', { class: 'plan-badge' }, p.tag) : null,
            h('div', { class: 'row', style: { justifyContent: 'space-between' } },
              h('span', { class: 'p-name' }, p.name),
              on ? h('span', { class: 'pill p-free' }, 'CURRENT') : null),
            h('div', { class: 'p-price' }, p.price < 0 ? 'Custom' : p.price === 0 ? 'Free' : `RM ${p.price}`,
              p.price > 0 ? h('small', null, ' /mo') : null),
            h('div', { class: 'tiny muted' }, p.tokens === Infinity ? 'Unlimited tokens' : `${formatTokens(p.tokens)} tokens / month`),
            h('ul', null, ...p.feats.map((f) => h('li', null,
              h('span', { html: icon('check'), style: { display: 'inline-flex' } }), h('span', null, f)))),
            on
              ? h('button', { class: 'btn btn-sm', disabled: true }, 'Active plan')
              : h('button', {
                class: 'btn btn-sm btn-primary',
                onclick: () => {
                  ctx.store.update((st) => {
                    st.settings.plan = p.id;
                    st.settings.tokensGranted = p.tokens === Infinity ? Number.MAX_SAFE_INTEGER : p.tokens;
                  });
                  ctx.refresh(); toast(`Switched to ${p.name}`, 'ok');
                },
              }, p.price < 0 ? 'Contact sales' : 'Switch'),
          );
        })),
      )),

    card('Usage by model', 'This billing cycle',
      h('div', { class: 'card-body', style: { padding: '0' } },
        table([
          { label: 'Model', render: (u) => h('div', null,
            h('div', { style: { fontWeight: 600, fontSize: '12.5px' } }, u.modelName),
            h('div', { class: 'mono tiny muted' }, u.modelSlug)) },
          { label: 'Tier', render: (u) => h('span', { html: tierBadge(u.tier), style: { display: 'inline-flex' } }) },
          { label: 'Calls', num: true, render: (u) => String(u.calls) },
          { label: 'Tokens', num: true, render: (u) => formatTokens(u.tokens) },
          { label: 'Avg latency', num: true, render: (u) => `${u.avgLatency} ms` },
          { label: 'Cost USD', num: true, render: (u) => u.costUsd > 0 ? formatUSD(u.costUsd) : h('span', { style: { color: 'hsl(var(--up))' } }, '$0.00') },
          { label: 'Cost MYR', num: true, render: (u) => formatMYR(Math.round(u.costUsd * MYR_PER_USD * 100) / 100) },
        ], usage, { tight: true, empty: 'No metered usage yet.' })),
    ),

    h('div', { class: 'grid g-side' },
      card('Savings breakdown', 'Same tokens, two policies',
        h('div', { class: 'card-body' }, kv([
          ['Actual spend', formatUSD(s.costUsd)],
          ['Premium-only equivalent', formatUSD(counterfactual)],
          ['Avoided', h('strong', { style: { color: 'hsl(var(--up))' } }, formatUSD(saved))],
          ['Reduction', `${counterfactual > 0 ? Math.round((saved / counterfactual) * 100) : 0}%`],
          ['Free-tier completions', `${Math.round(s.freeShare * 100)}%`],
          ['Cache hits', `${Math.round(s.cacheHitRate * 100)}%`],
        ]))),
      card('How metering works', 'Per completion, not per seat',
        h('div', { class: 'card-body' },
          bullets([
            'Every completion reports prompt and completion tokens plus the resolved model.',
            'Cost is computed at the model\u2019s published rate — free rungs cost exactly zero.',
            'Free-tier savings are tracked as a counterfactual, so the invoice shows what routing policy bought you.',
            'A hard token budget per request is checked before spending; over-budget requests are rejected, not truncated.',
          ], { mark: 'chart' }))),
    ),
  );
}

/* ========================================================================== */
/*  API keys                                                                  */
/* ========================================================================== */
export function keysPage(ctx) {
  const s = ctx.state;
  const host = h('div');
  let label = '';
  const labelBox = h('input', { class: 'input', placeholder: 'e.g. Production server', oninput: (e) => { label = e.target.value; } });

  const mask = (k) => `${k.slice(0, 11)}${'•'.repeat(14)}${k.slice(-4)}`;

  const paint = () => {
    host.replaceChildren(
      table([
        { label: 'Label', render: (k) => h('div', null,
          h('div', { style: { fontWeight: 600, fontSize: '12.5px' } }, k.label),
          h('div', { class: 'mono tiny muted' }, mask(k.key))) },
        { label: 'Scopes', render: (k) => h('div', { class: 'row-wrap' }, ...k.scopes.map((sc) => h('span', { class: 'chip mono', style: { fontSize: '10.5px' } }, sc))) },
        { label: 'Created', num: true, render: (k) => h('span', { class: 'tiny muted' }, relativeTime(k.created)) },
        { label: 'Last used', num: true, render: (k) => h('span', { class: 'tiny muted' }, k.lastUsed ? relativeTime(k.lastUsed) : 'never') },
        { label: '', render: (k) => h('div', { class: 'row', style: { justifyContent: 'flex-end', gap: '5px' } },
          h('button', { class: 'btn btn-sm', onclick: () => copy(k.key, 'Key copied') }, ico('copy', 'ic'), 'Reveal'),
          h('button', {
            class: 'btn btn-sm btn-danger',
            onclick: () => { ctx.store.update((st) => { st.apiKeys = st.apiKeys.filter((x) => x.id !== k.id); }); paint(); toast('Key revoked', 'ok'); },
          }, ico('trash', 'ic')),
        ) },
      ], s.apiKeys, { empty: 'No API keys issued yet.' }),
    );
  };

  paint();

  return h('div', { class: 'stack' },
    pageHead('API keys',
      'Tenant-scoped keys for the public API. Stored as AES-256-GCM envelopes — the ciphertext is what lands in the database, never the key itself.'),

    card('Issued keys', `${s.apiKeys.length} active`,
      h('div', { class: 'card-body', style: { padding: '0' } }, host)),

    card('Issue a key', 'Scopes are enforced server-side per request',
      h('div', { class: 'card-body stack' },
        h('div', { class: 'grid g-2' },
          h('div', { class: 'field' }, h('label', null, 'Label'), labelBox),
          h('div', { class: 'field' }, h('label', null, 'Scopes'),
            h('div', { class: 'row-wrap' },
              ...['models:read', 'agents:run', 'assets:write', 'billing:read'].map((sc) => h('span', { class: 'chip mono' }, sc)))),
        ),
        h('button', {
          class: 'btn btn-primary',
          onclick: () => {
            if (!label.trim()) { toast('Label the key so you can revoke it later', 'warn'); return; }
            const bytes = new Uint8Array(24);
            crypto.getRandomValues(bytes);
            const key = `aos_live_${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
            ctx.store.update((st) => {
              st.apiKeys.unshift({
                id: `k${Date.now()}`, label: label.trim(), key, created: Date.now(), lastUsed: null,
                scopes: ['models:read', 'agents:run'],
              });
            });
            labelBox.value = ''; label = '';
            paint(); toast('Key issued — copy it now, it will be masked', 'ok');
          },
        }, ico('key', 'ic'), 'Issue key'),
      )),

    h('div', { class: 'grid g-side' },
      card('Encryption at rest', 'AES-256-GCM envelope',
        h('div', { class: 'card-body' },
          bullets([
            'Each tenant credential is sealed with a per-record data key.',
            'The data key is itself wrapped by the master key from the environment.',
            'Rotating the master key re-wraps data keys without re-encrypting payloads.',
            'Decryption happens only in the gateway process, never in the worker or the browser.',
          ], { mark: 'shield' }))),
      card('Bring your own OpenRouter key', 'Per-tenant override',
        h('div', { class: 'card-body' },
          h('div', { class: 'tiny muted' },
            'A tenant can supply its own ', h('code', null, 'OPENROUTER_API_KEY'),
            ' and the gateway will prefer it over the platform key, so inference is billed directly to them and the platform never sees the spend. ',
            'Set yours on the Settings page to switch this demo from the simulator to live calls.'))),
    ),
  );
}

/* ========================================================================== */
/*  Settings                                                                  */
/* ========================================================================== */
export function settingsPage(ctx) {
  const st = ctx.state.settings;
  const host = h('div');

  const paint = () => {
    host.replaceChildren(
      card('OpenRouter key', 'The single credential the whole platform needs',
        h('div', { class: 'card-body stack' },
          h('div', { class: `banner ${ctx.mode === 'real' ? 'banner-ok' : ''}` }, ico(ctx.mode === 'real' ? 'check' : 'info'),
            h('div', { class: 'tiny' },
              ctx.mode === 'real'
                ? h('span', null, h('strong', null, 'Live mode active. '), 'Requests go to openrouter.ai with your key. Nothing is sent anywhere else.')
                : h('span', null, h('strong', null, 'Simulated mode. '), 'No network calls are made. The simulator produces the real JSON contracts and fails free-tier calls ~34% of the time so the fallback ladder is observable.'),
            )),
          (() => {
            const box = h('input', {
              class: 'input input-mono', type: 'password', autocomplete: 'off', spellcheck: false,
              placeholder: 'sk-or-v1-…', value: ctx.store.state.apiKey ?? '',
            });
            return h('div', { class: 'field' },
              h('label', null, 'OPENROUTER_API_KEY'),
              h('div', { class: 'row' },
                box,
                h('button', {
                  class: 'btn btn-primary',
                  onclick: () => {
                    const k = box.value.trim();
                    if (!k) { ctx.setApiKey(''); toast('Key cleared — back to simulated mode'); return; }
                    if (!k.startsWith('sk-or-')) { toast('That does not look like an OpenRouter key (expected sk-or-…)', 'warn'); return; }
                    ctx.setApiKey(k);
                    toast('Live mode enabled — calls now go to OpenRouter', 'ok');
                  },
                }, 'Save key'),
                h('button', {
                  class: 'btn',
                  onclick: () => { ctx.setApiKey(''); box.value = ''; toast('Key removed — simulated mode restored'); },
                }, 'Clear'),
              ),
              h('div', { class: 'hint' }, 'Held in localStorage only. Never sent anywhere except openrouter.ai. Use a scoped key with a spend limit.'),
            );
          })(),
        )),

      card('Routing policy', 'Applies to every agent call in this workspace',
        h('div', { class: 'card-body' },
          h('div', { class: 'grid g-2' },
            (() => {
              const sw = (label, key, hint) => h('div', { class: 'field' },
                h('label', { class: 'switch' },
                  h('input', {
                    type: 'checkbox', checked: !!st[key],
                    onchange: (e) => { ctx.store.update((s) => { s.settings[key] = e.target.checked; }); ctx.applyConfig(); paint(); },
                  }),
                  h('span', { class: 'track' }), h('span', null, label)),
                hint ? h('div', { class: 'hint' }, hint) : null);

              const num = (label, key, min, step, hint) => h('div', { class: 'field' },
                h('label', null, label),
                h('input', {
                  class: 'input nums', type: 'number', value: st[key], min, step,
                  oninput: (e) => { ctx.store.update((s) => { s.settings[key] = Number(e.target.value) || 0; }); ctx.applyConfig(); },
                }),
                hint ? h('div', { class: 'hint' }, hint) : null);

              return [
                sw('Prefer free tier', 'preferFree', 'Sort free models first, then by blended cost.'),
                num('Max fallbacks', 'maxFallbacks', 0, 1, 'How many rungs below the first the router will try.'),
                num('Token budget / request', 'tokenBudget', 1000, 1000, 'Estimated prompt + max output. Over-budget requests are rejected before spending.'),
                num('Circuit breaker TTL (s)', 'circuitBreakerTtl', 5, 5, 'How long a rate-limited model sits out.'),
              ];
            })(),
          )),
      ),

      card('Workspace', 'Tenant identity',
        h('div', { class: 'card-body' },
          (() => {
            const box = h('input', {
              class: 'input', value: st.orgName,
              oninput: (e) => { ctx.store.update((s) => { s.settings.orgName = e.target.value; }); },
            });
            const sel = h('select', { class: 'select', onchange: (e) => { ctx.store.update((s) => { s.settings.language = e.target.value; }); } },
              ...[['en', 'English'], ['ms', 'Bahasa Malaysia'], ['zh', '中文']].map(([v, l]) => h('option', { value: v, selected: v === st.language }, l)));
            return h('div', { class: 'grid g-2' },
              h('div', { class: 'field' }, h('label', null, 'Organisation'), box),
              h('div', { class: 'field' }, h('label', null, 'Default language'), sel),
            );
          })(),
          h('div', { class: 'mt-3' }, kv([
            ['Workspace ID', h('span', { class: 'mono' }, ctx.state.workspaceId)],
            ['Tenant isolation', 'Row Level Security on 16 tables, keyed on app.current_org'],
            ['Storage namespace', h('span', { class: 'mono' }, `orgs/${ctx.state.workspaceId}/…`)],
            ['Plan', st.plan],
          ])),
        )),

      card('Data', 'Everything lives in this browser',
        h('div', { class: 'card-body stack' },
          h('div', { class: 'tiny muted' },
            'This demo persists to ', h('code', null, 'localStorage'), ' under ', h('code', null, 'agentic-os-demo.v1'),
            '. The production platform uses Postgres with Row Level Security and Redis for the response cache.'),
          h('div', { class: 'row' },
            h('button', {
              class: 'btn btn-danger',
              onclick: () => {
                ctx.store.reset();
                ctx.applyConfig();
                ctx.refresh();
                toast('Demo data reset to defaults', 'ok');
              },
            }, ico('trash', 'ic'), 'Reset demo data'),
            h('button', {
              class: 'btn',
              onclick: () => {
                const blob = new Blob([JSON.stringify(ctx.store.state, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'agentic-os-workspace.json';
                a.click();
                URL.revokeObjectURL(a.href);
                toast('Workspace exported', 'ok');
              },
            }, ico('down', 'ic'), 'Export JSON'),
          ),
        )),

      card('About this build', 'What is real and what is simulated',
        h('div', { class: 'card-body' },
          h('div', { class: 'grid g-2' },
            h('div', null, section('Real',
              bullets([
                'The routing algorithm — same semantics as apps/api/app/models/router.py',
                'The 26-model catalogue with published prices',
                'Live OpenRouter calls when you supply a key',
                'The layout code for workflows, mind maps and charts',
                'Sandboxed iframe isolation for generated games',
              ], { mark: 'check' }))),
            h('div', null, section('Simulated here',
              bullets([
                'Postgres + RLS → localStorage',
                'Redis response cache → in-memory Map',
                'RabbitMQ + Celery workers → synchronous calls',
                'Model inference → deterministic content generators (unless you add a key)',
              ], { mark: 'info' }))),
          )),
        ),
    );
  };

  paint();
  return h('div', null,
    pageHead('Settings', 'Routing policy, tenant identity and the one credential the platform needs.'),
    host,
  );
}

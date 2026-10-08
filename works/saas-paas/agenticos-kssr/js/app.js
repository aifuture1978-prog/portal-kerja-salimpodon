/**
 * AgenticOS Malaysia — browser build bootstrap.
 *
 * Wires the store, the browser ModelRouter, the transport and the page router
 * together. No framework, no build step: plain ES modules served over one port.
 */
import { store, seedIfEmpty } from './store.js';
import { ModelRouter, MemoryCache } from './router.js';
import { createSimulatedTransport, createRealTransport } from './transport.js';
import { AGENTS, SYSTEM_PROMPTS, CATALOG, Tier, ALL_MODELS } from './catalog.js';
import { h, extractJson, toast, formatTokens, formatUSD, formatMYR } from './ui.js';
import { icon } from './renderers.js';
import { bindStore } from './components.js';
import { overviewPage, routerPage, studioPage, agentsPage } from './pages.js';
import { creativePage, workflowsPage, projectsPage, billingPage, keysPage, settingsPage } from './pages2.js';
/* KSSR edition — education layer */
import { kssrOverviewPage, rphStudioPage, dskpPage, pbdPage, bbmPage } from './kssr-pages.js';
import { rphView, dskpView, pbdView, bbmView, panitiaView, bahasaView, adminView } from './kssr-renderers.js';
import { registerViews } from './renderers.js';
/* Agentic orchestration simulator */
import { orchestrationPage } from './orchestration.js';

/* ---------------------------------------------------------------- constants */
const NAV = [
  { group: 'Platform', items: [
    { id: 'overview', label: 'Papan Pemuka KSSR', ic: 'grid' },
    { id: 'router', label: 'Model Router', ic: 'route', tag: String(ALL_MODELS.length) },
  ] },
  { group: 'Pengajaran', items: [
    { id: 'rph', label: 'RPH Studio', ic: 'book' },
    { id: 'dskp', label: 'DSKP Explorer', ic: 'layers' },
    { id: 'bbm', label: 'BBM & Kreatif', ic: 'brush' },
  ] },
  { group: 'Pentaksiran', items: [
    { id: 'pbd', label: 'Pentaksiran (PBD)', ic: 'chart' },
    { id: 'agents', label: 'Agen KSSR', ic: 'users', tag: String(AGENTS.length) },
  ] },
  { group: 'Orkestrasi', items: [
    { id: 'orchestration', label: 'Simulasi Orkestrasi', ic: 'flow', tag: 'BARU' },
    { id: 'workflows', label: 'Aliran Kerja', ic: 'bolt' },
  ] },
  { group: 'Automasi & Pentadbiran', items: [
    { id: 'studio', label: 'Studio Kod', ic: 'code' },
    { id: 'creative', label: 'Studio Kreatif', ic: 'spark' },
    { id: 'projects', label: 'Projek', ic: 'tag' },
    { id: 'billing', label: 'Bil', ic: 'cloud' },
    { id: 'keys', label: 'Kunci API', ic: 'key' },
    { id: 'settings', label: 'Tetapan', ic: 'cog' },
  ] },
];

const PAGES = {
  overview: { title: 'Papan Pemuka KSSR', render: kssrOverviewPage },
  rph: { title: 'RPH Studio', render: rphStudioPage },
  dskp: { title: 'DSKP Explorer', render: dskpPage },
  pbd: { title: 'Pentaksiran (PBD)', render: pbdPage },
  bbm: { title: 'BBM & Kreatif', render: bbmPage },
  router: { title: 'Model Router', render: routerPage },
  orchestration: { title: 'Simulasi Orkestrasi Agentik', render: orchestrationPage },
  studio: { title: 'Vibe Coding Studio', render: studioPage },
  creative: { title: 'Creative Studio', render: creativePage },
  agents: { title: 'Agen KSSR', render: agentsPage },
  workflows: { title: 'Workflows', render: workflowsPage },
  projects: { title: 'Projects', render: projectsPage },
  billing: { title: 'Billing', render: billingPage },
  keys: { title: 'API keys', render: keysPage },
  settings: { title: 'Settings', render: settingsPage },
};

const el = {
  nav: document.getElementById('nav'),
  view: document.getElementById('view'),
  tbPage: document.getElementById('tbPage'),
  tbStats: document.getElementById('tbStats'),
  btnTheme: document.getElementById('btnTheme'),
  btnNav: document.getElementById('btnNav'),
  btnMode: document.getElementById('btnMode'),
  modeDot: document.getElementById('modeDot'),
  modeLabel: document.getElementById('modeLabel'),
  modalHost: document.getElementById('modalHost'),
  planName: document.getElementById('planName'),
  planBadge: document.getElementById('planBadge'),
  planFill: document.getElementById('planFill'),
  planMeta: document.getElementById('planMeta'),
};

const PLAN_META = {
  free: ['Free', 'RM 0'], pro: ['Pro', 'RM 49'], team: ['Team', 'RM 199'],
  paas: ['PaaS', 'RM 29'], enterprise: ['Enterprise', 'Custom'], whitelabel: ['White-label', 'RM 999'],
};

/* -------------------------------------------------------------- router setup */
const cache = new MemoryCache();
let router;
let transport;
let current = 'overview';

function buildRouter() {
  const st = store.state.settings;
  router = new ModelRouter(transport, cache, {
    preferFree: st.preferFree,
    maxFallbacks: st.maxFallbacks,
    circuitBreakerTtl: st.circuitBreakerTtl,
    defaultTokenBudget: st.tokenBudget,
  });
}

function buildTransport() {
  const key = store.state.apiKey?.trim();
  transport = key ? createRealTransport(key) : createSimulatedTransport();
}

function applyConfig() {
  buildRouter();
  updateTopbar();
}

/* --------------------------------------------------------------- agent call */
async function callAgent({
  agentKey, prompt, task, systemPrompt, temperature = 0.3,
  maxTokens = 4096, record = true, subtype = null,
}) {
  const agent = AGENTS.find((a) => a.key === agentKey);
  const sys = systemPrompt ?? SYSTEM_PROMPTS[agentKey] ?? SYSTEM_PROMPTS.chat;

  const req = {
    task: task ?? agent?.task ?? 'chat',
    messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
    temperature,
    maxTokens,
    tokenBudget: store.state.settings.tokenBudget,
  };

  const completion = await router.run(req);
  completion.parsed = extractJson(completion.text);
  completion.subtype = subtype;

  if (record) {
    const row = {
      at: Date.now(),
      agent: agentKey,
      task: req.task,
      modelSlug: completion.modelSlug,
      modelName: completion.modelName,
      tier: completion.tier,
      promptTokens: completion.promptTokens,
      completionTokens: completion.completionTokens,
      costUsd: completion.costUsd,
      latencyMs: completion.latencyMs,
      cacheHit: completion.cacheHit,
      attempts: completion.attempts,
    };
    store.update((s) => {
      s.usage.unshift({ ...row, attempts: row.attempts.length });
      s.runs.unshift(row);
      s.runs = s.runs.slice(0, 60);
      s.usage = s.usage.slice(0, 400);
    });
  }
  return completion;
}

/* --------------------------------------------------------------------- ctx */
const ctx = {
  get router() { return router; },
  get transport() { return transport; },
  get mode() { return transport?.mode ?? 'simulated'; },
  store,
  state: store.state,
  callAgent,
  applyConfig,
  refresh: () => renderPage(current),
  go: (id) => { location.hash = `#/${id}`; },
  setApiKey: (key) => {
    store.update((s) => { s.apiKey = key; });
    buildTransport();
    buildRouter();
    updateTopbar();
    renderPage(current);
  },
  reset: () => { store.reset(); applyConfig(); renderPage(current); },
};

/* ------------------------------------------------------------------- chrome */
function paintNav() {
  el.nav.replaceChildren(...NAV.map((g) => h('div', { class: 'nav-group' },
    h('div', { class: 'nav-label' }, g.group),
    ...g.items.map((it) => h('button', {
      class: 'nav-item',
      'aria-current': current === it.id ? 'page' : null,
      onclick: () => { location.hash = `#/${it.id}`; document.body.classList.remove('nav-open'); },
    },
      h('span', { html: icon(it.ic), style: { display: 'inline-flex' } }),
      h('span', { class: 'grow' }, it.label),
      it.tag ? h('span', { class: 'nav-tag' }, it.tag) : null,
    )),
  )));
}

function updateTopbar() {
  const s = store;
  const planId = store.state.settings.plan;
  const [pName, pPrice] = PLAN_META[planId] ?? PLAN_META.pro;
  el.planName.textContent = pName;
  el.planBadge.textContent = pPrice;

  const granted = store.state.settings.tokensGranted;
  const pct = granted && granted !== Number.MAX_SAFE_INTEGER
    ? Math.min(1, s.tokensUsed / granted) : 0;
  el.planFill.style.width = `${pct * 100}%`;
  el.planMeta.textContent = granted === Number.MAX_SAFE_INTEGER
    ? `${formatTokens(s.tokensUsed)} tokens · unlimited plan`
    : `${formatTokens(s.tokensUsed)} / ${formatTokens(granted)} tokens`;

  el.tbStats.replaceChildren(
    h('div', { class: 'tb-stat' },
      h('div', { class: 'k' }, 'Spend'),
      h('div', { class: 'v' }, formatUSD(s.costUsd))),
    h('div', { class: 'tb-stat' },
      h('div', { class: 'k' }, 'Saved'),
      h('div', { class: 'v', style: { color: 'hsl(var(--up))' } },
        `${s.premiumCounterfactual > 0 ? Math.round(((s.premiumCounterfactual - s.costUsd) / s.premiumCounterfactual) * 100) : 0}%`)),
    h('div', { class: 'tb-stat' },
      h('div', { class: 'k' }, 'Completions'),
      h('div', { class: 'v' }, String(s.state.usage.length))),
  );

  const live = ctx.mode === 'real';
  el.modeDot.className = `dot dot-live ${live ? 'dot-ok' : 'dot-idle'}`;
  el.modeLabel.textContent = live ? 'Live OpenRouter' : 'Simulated';
  el.btnMode.title = live
    ? 'Live calls to OpenRouter are active. Click to switch back to the simulator.'
    : 'Simulated transport. Add an OpenRouter key in Settings to make real calls.';
}

/* -------------------------------------------------------------- page render */
function renderPage(id) {
  const page = PAGES[id] ?? PAGES.overview;
  current = id in PAGES ? id : 'overview';
  el.tbPage.textContent = page.title;
  document.title = `${page.title} · AgenticOS KSSR`;
  paintNav();
  try {
    el.view.replaceChildren(page.render(ctx));
  } catch (err) {
    el.view.replaceChildren(h('div', { class: 'banner banner-warn' }, 
      h('span', { html: icon('warn'), style: { display: 'inline-flex' } }),
      h('div', null, h('strong', null, `Could not render ${page.title}. `), String(err.message ?? err))));
    console.error(err);
  }
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  updateTopbar();
}

/* -------------------------------------------------------------- theme + nav */
function applyTheme(mode) {
  document.documentElement.dataset.theme = mode;
  store.update((s) => { s.settings.theme = mode; });
}

el.btnTheme.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  toast(`${next === 'dark' ? 'Dark' : 'Light'} theme`, 'info', 1600);
});

el.btnNav.addEventListener('click', () => document.body.classList.toggle('nav-open'));

el.btnMode.addEventListener('click', () => {
  if (!store.state.apiKey) {
    toast('No OpenRouter key set — open Settings to enable live calls', 'warn');
    location.hash = '#/settings';
    return;
  }
  if (ctx.mode === 'real') {
    // Temporarily drop to simulated without discarding the stored key.
    transport = createSimulatedTransport();
    buildRouter();
    updateTopbar(); renderPage(current);
    toast('Switched to the simulator (your key is still saved)', 'info');
  } else {
    buildTransport(); buildRouter();
    updateTopbar(); renderPage(current);
    toast('Live OpenRouter calls enabled', 'ok');
  }
});

/* ------------------------------------------------------------------- routing */
function route() {
  const id = (location.hash || '#/overview').replace(/^#\/?/, '').split('?')[0] || 'overview';
  renderPage(id);
}
window.addEventListener('hashchange', route);

/* ------------------------------------------------------------------ startup */
function boot() {
  // Map the KSSR education agents onto their own output renderers.
  registerViews({ rph: rphView, dskp: dskpView, pbd: pbdView, bbm: bbmView,
                  panitia: panitiaView, bahasa: bahasaView, admin: adminView });
  bindStore({ usageByDay: () => store.usageByDay() });

  applyTheme(store.state.settings.theme ?? 'dark');
  seedIfEmpty();
  buildTransport();
  buildRouter();

  store.subscribe(updateTopbar);

  if (!location.hash) location.hash = '#/overview';
  route();
  updateTopbar();

  // A single, non-intrusive orientation toast on first visit.
  if (!sessionStorage.getItem('agentic-os-greeted')) {
    sessionStorage.setItem('agentic-os-greeted', '1');
    setTimeout(() => toast(
      'Mod simulasi aktif. Setiap keputusan penghalaan adalah sebenar — tampal kunci OpenRouter dalam Tetapan untuk panggilan langsung.',
      'info', 6200,
    ), 700);
  }
}

boot();

// Expose for console tinkering — handy when demoing the router directly.
window.agenticOS = { ctx, router: () => router, cache, store };

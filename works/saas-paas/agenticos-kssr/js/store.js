/** Application state + persistence. Stands in for Postgres on the client. */

/* v2: the VVIP redesign changed the default theme to dark. Bumping the key
   retires any stored v1 state that would otherwise pin a returning visitor to
   the old light palette. */
const KEY = 'agentic-os-demo.v2';

const DEFAULTS = {
  apiKey: '',
  workspaceId: 'ws_default',
  workspaces: [{ id: 'ws_default', name: 'Default Workspace', slug: 'default' }],
  projects: [
    { id: 'p1', name: 'Agentic Landing', stack: 'nextjs', status: 'deployed', url: 'agentic-landing.example', updated: Date.now() - 3.6e6 },
    { id: 'p2', name: 'Invoice OCR API', stack: 'fastapi', status: 'building', url: null, updated: Date.now() - 8.6e7 },
    { id: 'p3', name: 'Sales Dashboard', stack: 'vue', status: 'deployed', url: 'sales-dash.example', updated: Date.now() - 2.6e8 },
    { id: 'p4', name: 'Clinic Booking', stack: 'laravel', status: 'draft', url: null, updated: Date.now() - 5.2e8 },
  ],
  runs: [],
  assets: [],
  workflows: [],
  apiKeys: [],
  usage: [],
  settings: {
    preferFree: true,
    maxFallbacks: 3,
    tokenBudget: 32000,
    circuitBreakerTtl: 60,
    theme: 'dark',
    language: 'en',
    orgName: 'AgenticOS Demo Sdn Bhd',
    plan: 'pro',
    tokensGranted: 2000000,
  },
};

class Store {
  constructor() {
    this.state = this.load();
    this.listeners = new Set();
  }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULTS);
      const parsed = JSON.parse(raw);
      // Shallow-merge so new default keys appear for existing users
      return {
        ...structuredClone(DEFAULTS),
        ...parsed,
        settings: { ...DEFAULTS.settings, ...(parsed.settings ?? {}) },
      };
    } catch {
      return structuredClone(DEFAULTS);
    }
  }

  save() {
    try {
      // Cap growth — keep the newest 60 of each collection
      const s = this.state;
      s.runs = s.runs.slice(0, 60);
      s.assets = s.assets.slice(0, 40);
      s.usage = s.usage.slice(0, 400);
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch { /* quota — ignore */ }
  }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  emit() { this.save(); this.listeners.forEach((fn) => fn(this.state)); }

  /** Mutate then notify. */
  update(fn) { fn(this.state); this.emit(); }

  reset() {
    this.state = structuredClone(DEFAULTS);
    this.emit();
  }

  // ------------------------------------------------------------ derived
  get tokensUsed() {
    return this.state.usage.reduce((n, u) => n + u.promptTokens + u.completionTokens, 0);
  }

  get costUsd() {
    return this.state.usage.reduce((n, u) => n + u.costUsd, 0);
  }

  /** What the same tokens would have cost at premium pricing ($3/$15 per 1M). */
  get premiumCounterfactual() {
    return this.state.usage.reduce(
      (n, u) => n + u.promptTokens / 1e6 * 3 + u.completionTokens / 1e6 * 15, 0,
    );
  }

  get freeShare() {
    const total = this.state.usage.length;
    if (!total) return 0;
    return this.state.usage.filter((u) => u.tier === 'free').length / total;
  }

  get cacheHitRate() {
    const total = this.state.usage.length;
    if (!total) return 0;
    return this.state.usage.filter((u) => u.cacheHit).length / total;
  }

  usageByModel() {
    const map = new Map();
    for (const u of this.state.usage) {
      const e = map.get(u.modelSlug) ?? { modelSlug: u.modelSlug, modelName: u.modelName, calls: 0, tokens: 0, costUsd: 0, tier: u.tier, latency: 0 };
      e.calls++; e.tokens += u.promptTokens + u.completionTokens; e.costUsd += u.costUsd; e.latency += u.latencyMs;
      map.set(u.modelSlug, e);
    }
    return [...map.values()]
      .map((e) => ({ ...e, avgLatency: Math.round(e.latency / e.calls) }))
      .sort((a, b) => b.calls - a.calls);
  }

  usageByDay() {
    const days = 7;
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const rows = this.state.usage.filter((u) => u.at >= d.getTime() && u.at < next.getTime());
      out.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        free: rows.filter((u) => u.tier === 'free').reduce((n, u) => n + u.promptTokens + u.completionTokens, 0),
        paid: rows.filter((u) => u.tier !== 'free').reduce((n, u) => n + u.promptTokens + u.completionTokens, 0),
      });
    }
    return out;
  }
}

export const store = new Store();

/** Seed some history on first visit so the dashboard is not empty. */
export function seedIfEmpty() {
  if (store.state.usage.length) return;
  const now = Date.now();
  const samples = [
    ['xiaomi/mimo-v2-flash:free', 'MiMo-V2-Flash (free)', 'free', 'coding', 4200, 1800, 0, 1180],
    ['google/gemini-2.0-flash-exp:free', 'Gemini 2.0 Flash (free)', 'free', 'chat', 2600, 1100, 0, 720],
    ['minimax/minimax-m2.7:free', 'MiniMax-M2.7 (free)', 'free', 'agentic', 3400, 1600, 0, 1490],
    ['xiaomi/mimo-v2-flash', 'MiMo-V2-Flash', 'cheap', 'coding', 3800, 1600, 0.0009, 1240],
    ['minimax/minimax-m2.7', 'MiniMax-M2.7', 'cheap', 'agentic', 3600, 1700, 0.0031, 1980],
    ['z-ai/glm-5.2', 'GLM-5.2', 'cheap', 'summarise', 7400, 1500, 0.0122, 2410],
    ['moonshotai/kimi-k2.6', 'Kimi K2.6', 'cheap', 'writing', 4400, 2200, 0.0081, 2860],
    ['deepseek/deepseek-v4-pro', 'DeepSeek V4 Pro', 'cheap', 'reasoning', 3900, 1800, 0.0039, 2050],
    ['z-ai/glm-4.7', 'GLM-4.7', 'cheap', 'tool_use', 3100, 1400, 0.0049, 2240],
    ['anthropic/claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'premium', 'refactor', 5200, 2400, 0.0516, 5600],
  ];
  const usage = [];
  for (let d = 6; d >= 0; d--) {
    for (let i = 0; i < 14; i++) {
      const s = samples[Math.floor(Math.random() * samples.length)];
      const at = now - d * 86400000 - Math.random() * 82800000;
      usage.push({
        at, modelSlug: s[0], modelName: s[1], tier: s[2], task: s[3],
        promptTokens: Math.round(s[4] * (0.6 + Math.random() * 0.8)),
        completionTokens: Math.round(s[5] * (0.6 + Math.random() * 0.8)),
        costUsd: s[6] * (0.6 + Math.random() * 0.8),
        latencyMs: Math.round(s[7] * (0.7 + Math.random() * 0.7)),
        cacheHit: Math.random() < 0.22, attempts: 1,
      });
    }
  }
  usage.sort((a, b) => b.at - a.at);
  store.update((s) => { s.usage = usage; });
}

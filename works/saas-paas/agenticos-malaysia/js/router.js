/**
 * ModelRouter — browser port of apps/api/app/models/router.py.
 *
 * Same algorithm, same semantics:
 *   buildCandidates -> capability filter -> free-first sort -> cooldown drop
 *   -> budget check -> cache -> execute with fallback -> circuit break on 429/402
 *
 * Because this runs in the browser it is also the thing you can *watch*: every
 * rung it tries is surfaced in the UI, including the ones it skipped and why.
 */
import {
  CATALOG, TASK_POLICY, Tier, blendedCost, isFree,
} from './catalog.js';

export class BudgetExceeded extends Error {}
export class NoCandidate extends Error {}

/** Mirrors the FastAPI settings defaults. */
export const ROUTER_CONFIG = {
  preferFree: true,
  maxFallbacks: 3,
  circuitBreakerTtl: 60,      // seconds a rate-limited model sits out
  requestTimeout: 120,
  defaultTokenBudget: 32000,
  contextSummaryThreshold: 24000,
};

export class ModelRouter {
  /**
   * @param {{chat:(spec:object, req:object)=>Promise<object>}} transport
   * @param {{get:Function,set:Function}|null} cache
   */
  constructor(transport, cache = null, config = {}) {
    this.transport = transport;
    this.cache = cache;
    this.cfg = { ...ROUTER_CONFIG, ...config };
    /** @type {Map<string, number>} slug -> unix ms until which we skip it */
    this.cooldowns = new Map();
    /** Full trace of the most recent run, for the UI. */
    this.lastTrace = null;
  }

  // ------------------------------------------------------------ cooldowns
  markRateLimited(slug, ttlSeconds) {
    const ttl = ttlSeconds ?? this.cfg.circuitBreakerTtl;
    this.cooldowns.set(slug, Date.now() + ttl * 1000);
    return ttl;
  }

  clearCooldown(slug) {
    if (slug) this.cooldowns.delete(slug);
    else this.cooldowns.clear();
  }

  cooldownRemaining(slug) {
    const until = this.cooldowns.get(slug);
    if (!until) return 0;
    const left = Math.ceil((until - Date.now()) / 1000);
    if (left <= 0) { this.cooldowns.delete(slug); return 0; }
    return left;
  }

  // ------------------------------------------------------------ selection
  /** @returns {string[]} the ordered ladder the router will walk */
  buildCandidates(req = {}) {
    const {
      task = 'chat', requireTools = false, requireVision = false,
      minContext = 0, allowPremium = true, overrideModels = null,
      preferFree = null,
    } = req;

    const slugs = overrideModels?.length
      ? [...overrideModels]
      : [...(TASK_POLICY[task] ?? TASK_POLICY.chat)];

    let specs = slugs.map((s) => CATALOG[s]).filter(Boolean);

    // capability filter
    specs = specs.filter((m) => {
      if (requireTools && !m.supports_tools) return false;
      if (requireVision && !m.supports_vision) return false;
      if (minContext && m.context_window < minContext) return false;
      if (!allowPremium && m.tier === Tier.PREMIUM) return false;
      return true;
    });

    // stable sort: free first, then by blended cost
    const freeFirst = preferFree === null ? this.cfg.preferFree : preferFree;
    specs.sort((a, b) =>
      freeFirst
        ? (isFree(a) ? 0 : 1) - (isFree(b) ? 0 : 1) || blendedCost(a) - blendedCost(b)
        : blendedCost(a) - blendedCost(b),
    );

    // drop cooling-down models, but keep them as a tail so we never return empty
    const live = specs.filter((m) => this.cooldownRemaining(m.slug) === 0);
    const cooled = specs.filter((m) => this.cooldownRemaining(m.slug) > 0);

    return [...live, ...cooled].slice(0, 1 + this.cfg.maxFallbacks).map((m) => m.slug);
  }

  /** Decide without executing — what `POST /models/route-preview` returns. */
  decide(req = {}) {
    const candidates = this.buildCandidates(req);
    if (!candidates.length) throw new NoCandidate(`no model satisfies task=${req.task ?? 'chat'}`);
    const spec = CATALOG[candidates[0]];
    return {
      model: spec,
      tier: spec.tier,
      candidates,
      reason: `task=${req.task ?? 'chat'} prefer_free=${req.preferFree ?? this.cfg.preferFree} ladder=${candidates.join(' > ')}`,
    };
  }

  // ------------------------------------------------------------ budget
  estimatePromptTokens(messages = []) {
    // ~4 chars/token for mixed CN/EN, deliberately conservative
    return messages.reduce((n, m) => n + Math.floor((m.content?.length ?? 0) / 4) + 4, 0);
  }

  checkBudget(req, spec) {
    const budget = req.tokenBudget ?? this.cfg.defaultTokenBudget;
    const estimated = this.estimatePromptTokens(req.messages ?? []) + (req.maxTokens ?? 4096);
    if (estimated > budget) {
      throw new BudgetExceeded(`estimated ${estimated} tokens exceeds budget ${budget}`);
    }
    if (spec.context_window && estimated > spec.context_window) {
      throw new BudgetExceeded(`prompt does not fit ${spec.slug} context window`);
    }
    return estimated;
  }

  // ------------------------------------------------------------ cache key
  cacheKey(req, slug) {
    const parts = [slug, String(req.temperature ?? 0.3), String(req.maxTokens ?? 4096)];
    for (const m of req.messages ?? []) parts.push(`${m.role}:${m.content}`);
    // djb2 — good enough for a client-side demo cache
    let h = 5381;
    const s = parts.join('\u0000');
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return `aos:llm:${h.toString(16)}`;
  }

  // ------------------------------------------------------------ execute
  /**
   * Walk the ladder until something succeeds.
   * @returns {Promise<object>} completion + the full attempt trace
   */
  async run(req = {}) {
    const started = performance.now();
    const decision = this.decide(req);
    const attempts = [];
    let lastError = null;

    for (const slug of decision.candidates) {
      const spec = CATALOG[slug];
      const attempt = {
        model: slug,
        vendor: spec.vendor,
        tier: spec.tier,
        status: 'pending',
        note: '',
        latencyMs: 0,
      };
      attempts.push(attempt);

      try {
        this.checkBudget(req, spec);
      } catch (err) {
        attempt.status = 'skipped';
        attempt.note = err.message;
        continue;
      }

      const key = this.cacheKey(req, slug);
      if (this.cache) {
        const hit = this.cache.get(key);
        if (hit) {
          attempt.status = 'cache_hit';
          attempt.note = 'served from Redis-equivalent cache';
          const completion = {
            ...hit, modelSlug: slug, tier: spec.tier, cacheHit: true,
            attempts: [...attempts], totalMs: Math.round(performance.now() - started),
          };
          this.lastTrace = { decision, attempts, completion };
          return completion;
        }
      }

      const t0 = performance.now();
      try {
        const payload = await this.transport.chat(spec, req);
        const latencyMs = Math.round(performance.now() - t0);
        attempt.status = 'ok';
        attempt.latencyMs = latencyMs;

        const usage = payload.usage ?? {};
        const promptTokens = usage.prompt_tokens ?? this.estimatePromptTokens(req.messages);
        const completionTokens = usage.completion_tokens ?? 0;
        const cost = promptTokens / 1e6 * spec.input_price + completionTokens / 1e6 * spec.output_price;

        const completion = {
          text: payload.text ?? '',
          modelSlug: slug,
          modelName: spec.display_name,
          tier: spec.tier,
          promptTokens,
          completionTokens,
          costUsd: cost,
          latencyMs,
          cacheHit: false,
          finishReason: payload.finishReason ?? 'stop',
          simulated: !!payload.simulated,
          attempts: [...attempts],
          totalMs: Math.round(performance.now() - started),
        };

        if (this.cache && completionTokens > 0) {
          this.cache.set(key, { ...completion, attempts: undefined, totalMs: undefined }, 600);
        }
        this.lastTrace = { decision, attempts, completion };
        return completion;
      } catch (err) {
        attempt.status = 'failed';
        attempt.latencyMs = Math.round(performance.now() - t0);
        attempt.note = `${err.name}: ${err.message}`;
        lastError = err;
        if (err.rateLimited) {
          const ttl = this.markRateLimited(slug);
          attempt.note += ` → cooling down ${ttl}s`;
        }
      }
    }

    this.lastTrace = { decision, attempts, completion: null };
    throw new NoCandidate(`all ${attempts.length} candidates failed: ${lastError?.message ?? 'unknown'}`);
  }

  /** Snapshot for the ops panel. */
  health() {
    return {
      preferFree: this.cfg.preferFree,
      maxFallbacks: this.cfg.maxFallbacks,
      catalogSize: Object.keys(CATALOG).length,
      cooldowns: Object.fromEntries(
        [...this.cooldowns.keys()]
          .map((s) => [s, this.cooldownRemaining(s)])
          .filter(([, v]) => v > 0),
      ),
    };
  }
}

/** Tiny in-memory cache with TTL, standing in for Redis. */
export class MemoryCache {
  constructor() { this.map = new Map(); this.hits = 0; this.misses = 0; }
  get(k) {
    const e = this.map.get(k);
    if (!e) { this.misses++; return null; }
    if (e.exp < Date.now()) { this.map.delete(k); this.misses++; return null; }
    this.hits++;
    return e.v;
  }
  set(k, v, ttlSeconds = 600) {
    this.map.set(k, { v, exp: Date.now() + ttlSeconds * 1000 });
  }
  get size() { return this.map.size; }
  clear() { this.map.clear(); this.hits = 0; this.misses = 0; }
}

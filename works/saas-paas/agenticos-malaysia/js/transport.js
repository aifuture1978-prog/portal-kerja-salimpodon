/**
 * Transport layer.
 *
 * Two modes behind one interface:
 *   REAL      — genuine OpenRouter chat completions, using the key you paste in.
 *   SIMULATE  — deterministic-ish content generator with realistic free-tier
 *               rate limiting (429), so the fallback ladder is actually visible.
 *
 * The simulator is not a stub that returns "lorem ipsum": it produces the same
 * JSON contracts the FastAPI agents enforce, so every renderer in the UI
 * (quiz player, game frame, workflow canvas, code editor) gets real input.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class RateLimited extends Error {
  constructor(msg) { super(msg); this.name = 'RateLimited'; this.rateLimited = true; }
}
export class ProviderError extends Error {
  constructor(msg) { super(msg); this.name = 'ProviderError'; }
}

/* ========================================================================== */
/*  REAL MODE                                                                 */
/* ========================================================================== */

export function createRealTransport(apiKey, { siteUrl = location.origin, title = 'AgenticOS Malaysia' } = {}) {
  return {
    mode: 'real',
    async chat(spec, req) {
      const body = {
        model: spec.slug,
        messages: (req.messages ?? []).map((m) => ({ role: m.role, content: m.content })),
        temperature: req.temperature ?? 0.3,
        max_tokens: Math.min(req.maxTokens ?? 4096, 8192),
        stream: false,
      };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120000);
      let res;
      try {
        res = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': siteUrl,
            'X-Title': title,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timer);
        throw new ProviderError(err.name === 'AbortError' ? 'request timed out after 120s' : String(err.message));
      } finally {
        clearTimeout(timer);
      }

      if (res.status === 429) throw new RateLimited('429 too many requests — free endpoint rate limit');
      if (res.status === 402) throw new RateLimited('402 insufficient credits on this key');
      if (!res.ok) {
        let detail = '';
        try { detail = (await res.json())?.error?.message ?? ''; } catch { detail = await res.text(); }
        throw new ProviderError(`HTTP ${res.status}: ${String(detail).slice(0, 300)}`);
      }

      const data = await res.json();
      const choice = data.choices?.[0] ?? {};
      const content = choice.message?.content;
      const text = Array.isArray(content)
        ? content.map((p) => p.text ?? '').join('')
        : (content ?? '');

      return {
        text,
        usage: data.usage ?? {},
        finishReason: choice.finish_reason,
        simulated: false,
      };
    },
  };
}

/* ========================================================================== */
/*  SIMULATE MODE                                                             */
/* ========================================================================== */

/** Free endpoints really do rate-limit — this is the behaviour worth showing. */
const FREE_FAIL_RATE = 0.34;

/** Rough latency by tier, so the UI does not feel uniform. */
function latencyFor(spec) {
  const base = spec.tier === 'premium' ? 900 : spec.tier === 'free' ? 420 : 650;
  const jitter = 0.6 + Math.random() * 0.9;
  const contextPenalty = Math.min(600, spec.context_window / 2000);
  return Math.round(base * jitter + contextPenalty * 0.25);
}

export function createSimulatedTransport() {
  return {
    mode: 'simulated',
    async chat(spec, req) {
      await sleep(latencyFor(spec));

      if (spec.tier === 'free' && Math.random() < FREE_FAIL_RATE) {
        throw new RateLimited('429 rate limit exceeded on free endpoint');
      }

      const lastUser = [...(req.messages ?? [])].reverse().find((m) => m.role === 'user');
      const prompt = lastUser?.content ?? '';
      const system = (req.messages ?? []).find((m) => m.role === 'system')?.content ?? '';
      const text = generate(spec, prompt, system, req);

      // Token counts roughly proportional to real lengths
      const promptTokens = (req.messages ?? []).reduce((n, m) => n + Math.ceil((m.content?.length ?? 0) / 4) + 4, 0);
      const completionTokens = Math.ceil(text.length / 4);

      return {
        text,
        usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens },
        finishReason: 'stop',
        simulated: true,
      };
    },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* -------------------------------------------------------------------------- */
/*  Content generators, keyed by the system prompt's contract                 */
/* -------------------------------------------------------------------------- */

function generate(spec, prompt, system, req) {
  const s = system.toLowerCase();
  if (s.includes('orchestrator')) return json(planPayload(prompt));
  if (s.includes('senior full-stack engineer')) return json(codePayload(prompt));
  if (s.includes('product designer')) return json(designPayload(prompt));
  if (s.includes('research analyst')) return json(researchPayload(prompt));
  if (s.includes('senior copywriter')) return json(writerPayload(prompt));
  if (s.includes('rigorous qa engineer')) return json(qaPayload(prompt));
  if (s.includes('integration engineer')) return json(automationPayload(prompt));
  if (s.includes('prompt engineer for image models')) return json(imagePromptPayload(prompt));
  if (s.includes('tutor agent that builds illustrated quizzes')) return json(quizPayload(prompt));
  if (s.includes('devops engineer')) return json(deployPayload(prompt));
  if (s.includes('video director')) return json(videoPayload(prompt));
  if (s.includes('data-visualisation designer')) return json(infographicPayload(prompt));
  if (s.includes('mind-mapping engine')) return json(mindmapPayload(prompt));
  if (s.includes('tutor agent that ships playable')) return json(gamePayload(prompt));
  return prose(spec, prompt);
}

const json = (o) => '```json\n' + JSON.stringify(o, null, 2) + '\n```';

/** Pull a human topic out of "Topic: X\nLevel: Y" style prompts. */
function topicOf(prompt, fallback = 'the requested topic') {
  const m = /(?:topic|subject|question|goal|brief|concept|screen|root topic)\s*:\s*(.+)/i.exec(prompt);
  const raw = (m?.[1] ?? prompt).split('\n')[0].trim();
  return raw.replace(/^["'`]|["'`]$/g, '').slice(0, 90) || fallback;
}

function titleCase(s) {
  return s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());
}

/* ---------------------------------------------------------------- payloads */

function planPayload(prompt) {
  const goal = topicOf(prompt, 'Ship the feature');
  return {
    goal,
    steps: [
      { id: 1, agent: 'researcher', title: 'Establish the constraints', instruction: `Research current best practice, regulations and prior art for: ${goal}. Return findings with citations.`, depends_on: [], expected_output: 'key_findings + sources' },
      { id: 2, agent: 'designer', title: 'Design the surface', instruction: `Produce the screen structure, design tokens and component code for: ${goal}.`, depends_on: [1], expected_output: 'components[] with Tailwind code' },
      { id: 3, agent: 'coder', title: 'Implement', instruction: `Implement the design from step 2 for: ${goal}. TypeScript, typed, with tests.`, depends_on: [2], expected_output: 'files[] + tests[]' },
      { id: 4, agent: 'qa', title: 'Review', instruction: 'Review the implementation for defects, security issues and missing tests.', depends_on: [3], expected_output: 'verdict + issues[]' },
      { id: 5, agent: 'deploy', title: 'Ship it', instruction: 'Produce the Dockerfile, CI steps and rollback plan.', depends_on: [4], expected_output: 'dockerfile + ci_steps[]' },
    ],
    risks: [
      'Free-tier endpoints rate-limit under load — the paid rung absorbs the overflow',
      'Design decisions in step 2 constrain step 3; a late change invalidates the implementation',
      'No acceptance criteria were supplied, so "done" is defined by step 4 only',
    ],
    definition_of_done: [
      'All five steps report status succeeded',
      'QA verdict is pass or pass_with_notes with no critical issues',
      'A deployment artefact exists and its healthcheck passes',
      'Total spend for the run stays under the configured token budget',
    ],
  };
}

function codePayload(prompt) {
  const task = topicOf(prompt, 'the requested change');
  const isPython = /python|fastapi|django|flask/i.test(prompt);
  const isGo = /\bgo\b|golang/i.test(prompt);

  if (isPython) {
    return {
      summary: `Implemented: ${task}. Async-safe, typed, with a rate-limit dependency and tests.`,
      language: 'python',
      files: [
        {
          path: 'app/services/limiter.py', action: 'create',
          content: `"""Fixed-window rate limiter backed by Redis, with an in-memory fallback."""
from __future__ import annotations

import time
from typing import Protocol


class Store(Protocol):
    async def incr(self, key: str, ttl: int) -> int: ...


class RateLimiter:
    """Per-identity fixed-window limiter.

    A fixed window is deliberate: it costs one Redis round-trip instead of
    three, and the burst it permits at a window boundary is acceptable here.
    """

    def __init__(self, store: Store, limit: int = 120, window: int = 60) -> None:
        self.store = store
        self.limit = limit
        self.window = window

    async def allow(self, identity: str) -> tuple[bool, int]:
        bucket = f"rl:{identity}:{int(time.time() // self.window)}"
        count = await self.store.incr(bucket, ttl=self.window + 1)
        return count <= self.limit, max(0, self.limit - count)
`,
        },
        {
          path: 'app/api/deps.py', action: 'update',
          content: `from fastapi import Depends, HTTPException, Request, status


async def enforce_rate_limit(request: Request, principal=Depends(get_principal),
                             limiter=Depends(get_limiter)) -> None:
    allowed, remaining = await limiter.allow(f"{principal.via}:{principal.id}")
    request.state.rate_limit_remaining = remaining
    if not allowed:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "rate limit exceeded",
            headers={"Retry-After": "60", "X-RateLimit-Remaining": "0"},
        )
`,
        },
      ],
      tests: [{
        path: 'tests/test_limiter.py',
        content: `import pytest
from app.services.limiter import RateLimiter


class FakeStore:
    def __init__(self): self.data = {}
    async def incr(self, key, ttl):
        self.data[key] = self.data.get(key, 0) + 1
        return self.data[key]


@pytest.mark.asyncio
async def test_allows_up_to_limit_then_blocks():
    limiter = RateLimiter(FakeStore(), limit=3, window=60)
    results = [(await limiter.allow("user-1"))[0] for _ in range(4)]
    assert results == [True, True, True, False]


@pytest.mark.asyncio
async def test_identities_are_independent():
    limiter = RateLimiter(FakeStore(), limit=1, window=60)
    assert (await limiter.allow("a"))[0] is True
    assert (await limiter.allow("b"))[0] is True
    assert (await limiter.allow("a"))[0] is False
`,
      }],
      run_commands: ['pytest -q tests/test_limiter.py', 'uvicorn app.main:app --reload'],
      notes: [
        'The limiter is injected, not imported, so tests never touch Redis.',
        'Returning X-RateLimit-Remaining lets clients back off proactively instead of discovering the limit by failing.',
        'A sliding-window log would be more precise but costs three round-trips per request; revisit only if boundary bursts become a real problem.',
      ],
    };
  }

  if (isGo) {
    return {
      summary: `Implemented: ${task}. Context-aware, no goroutine leaks.`,
      language: 'go',
      files: [{
        path: 'internal/limiter/limiter.go', action: 'create',
        content: `package limiter

import (
	"context"
	"sync"
	"time"
)

// Limiter is a fixed-window rate limiter safe for concurrent use.
type Limiter struct {
	mu     sync.Mutex
	counts map[string]int
	limit  int
	window time.Duration
}

func New(limit int, window time.Duration) *Limiter {
	return &Limiter{counts: make(map[string]int), limit: limit, window: window}
}

// Allow reports whether identity may proceed in the current window.
func (l *Limiter) Allow(ctx context.Context, identity string) (bool, int) {
	if err := ctx.Err(); err != nil {
		return false, 0
	}
	key := identity + ":" + time.Now().Truncate(l.window).Format(time.RFC3339)

	l.mu.Lock()
	defer l.mu.Unlock()
	l.counts[key]++
	n := l.counts[key]

	if n == 1 {
		// Reap exactly once per bucket rather than sweeping on every call.
		go func() {
			time.Sleep(l.window + time.Second)
			l.mu.Lock()
			delete(l.counts, key)
			l.mu.Unlock()
		}()
	}
	return n <= l.limit, max(0, l.limit-n)
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
`,
      }],
      tests: [],
      run_commands: ['go test ./internal/limiter/...'],
      notes: ['The reaper goroutine fires once per new bucket, not per request — that keeps the hot path lock-only.'],
    };
  }

  // TypeScript default
  return {
    summary: `Implemented: ${task}. Fully typed, no `+ '`any`'+`, with unit tests.`,
    language: 'typescript',
    files: [
      {
        path: 'lib/rate-limit.ts', action: 'create',
        content: `/**
 * Fixed-window rate limiter.
 * One round-trip per check — see the note in the PR for why not sliding-window.
 */
export interface LimiterStore {
  incr(key: string, ttlSeconds: number): Promise<number>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export class RateLimiter {
  constructor(
    private readonly store: LimiterStore,
    private readonly limit = 120,
    private readonly windowSeconds = 60,
  ) {}

  async check(identity: string): Promise<RateLimitResult> {
    const bucket = \`rl:\${identity}:\${Math.floor(Date.now() / 1000 / this.windowSeconds)}\`;
    const count = await this.store.incr(bucket, this.windowSeconds + 1);
    const allowed = count <= this.limit;
    return {
      allowed,
      remaining: Math.max(0, this.limit - count),
      retryAfter: allowed ? 0 : this.windowSeconds,
    };
  }
}
`,
      },
      {
        path: 'app/api/route.ts', action: 'update',
        content: `import { NextRequest, NextResponse } from 'next/server';
import { limiter } from '@/lib/limiter';

export async function POST(req: NextRequest) {
  const identity = req.headers.get('x-api-key') ?? req.ip ?? 'anonymous';
  const { allowed, remaining, retryAfter } = await limiter.check(identity);

  if (!allowed) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      { status: 429, headers: { 'Retry-After': String(retryAfter), 'X-RateLimit-Remaining': '0' } },
    );
  }

  const result = await handle(req);
  return NextResponse.json(result, { headers: { 'X-RateLimit-Remaining': String(remaining) } });
}
`,
      },
    ],
    tests: [{
      path: 'lib/rate-limit.test.ts',
      content: `import { describe, expect, it } from 'vitest';
import { RateLimiter, type LimiterStore } from './rate-limit';

const fakeStore = (): LimiterStore => {
  const data = new Map<string, number>();
  return {
    async incr(key) {
      const next = (data.get(key) ?? 0) + 1;
      data.set(key, next);
      return next;
    },
  };
};

describe('RateLimiter', () => {
  it('allows up to the limit then blocks', async () => {
    const limiter = new RateLimiter(fakeStore(), 3, 60);
    const outcomes = [];
    for (let i = 0; i < 4; i++) outcomes.push((await limiter.check('u1')).allowed);
    expect(outcomes).toEqual([true, true, true, false]);
  });

  it('reports remaining correctly', async () => {
    const limiter = new RateLimiter(fakeStore(), 5, 60);
    expect((await limiter.check('u2')).remaining).toBe(4);
  });

  it('keeps identities independent', async () => {
    const limiter = new RateLimiter(fakeStore(), 1, 60);
    expect((await limiter.check('a')).allowed).toBe(true);
    expect((await limiter.check('b')).allowed).toBe(true);
    expect((await limiter.check('a')).allowed).toBe(false);
  });
});
`,
    }],
    run_commands: ['pnpm test', 'pnpm dev'],
    notes: [
      'The store is an interface, so tests use an in-memory implementation and never need Redis.',
      'X-RateLimit-Remaining is returned on success too, so well-behaved clients can back off before they fail.',
      'Chose a fixed window over a sliding log: one round-trip instead of three. Revisit if boundary bursts bite.',
    ],
  };
}

function designPayload(prompt) {
  const screen = topicOf(prompt, 'the requested screen');
  return {
    page: titleCase(screen),
    layout: 'Sidebar + Topbar + Canvas, 12-column content grid, 4px spacing base, 12px radius.',
    components: [
      {
        name: 'StatCard', purpose: 'Single KPI with a trend indicator.',
        code: `export function StatCard({ label, value, hint, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4 shadow-card">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {trend && (
        <span className={trend.direction === 'up' ? 'text-[hsl(var(--up))]' : 'text-[hsl(var(--down))]'}>
          {trend.value}
        </span>
      )}
      {hint && <span className="ml-2 text-2xs text-muted-foreground">{hint}</span>}
    </div>
  );
}`,
      },
      {
        name: 'EmptyState', purpose: 'Shown when a list has no rows yet.',
        code: `export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center">
      {icon}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}`,
      },
    ],
    tokens: {
      colors: { primary: 'hsl(245 75% 60%)', accent: 'hsl(268 78% 62%)', surface: 'hsl(240 20% 99%)', border: 'hsl(240 12% 90%)' },
      spacing: { base: '4px', scale: ['4px', '8px', '12px', '16px', '24px', '32px', '48px'] },
      type: { sans: 'Inter', mono: 'JetBrains Mono', scale: ['11px', '12px', '14px', '16px', '24px', '44px'] },
    },
    a11y_notes: [
      'Every interactive control is reachable by keyboard with a visible focus ring — the ring is never removed, only restyled.',
      'Toggles expose aria-pressed; progress uses role="progressbar" with aria-valuenow.',
      'Contrast ratios were checked against WCAG 2.1 AA in both light and dark themes.',
      'prefers-reduced-motion disables all non-essential animation.',
    ],
  };
}

function researchPayload(prompt) {
  const question = topicOf(prompt, 'the research question');
  return {
    question,
    answer: `Three findings matter most for ${question}. First, the cost curve has inverted: capable open-weight and free-tier endpoints now cover the majority of routine inference, so the differentiator has moved from model access to routing policy. Second, the regulatory position in Malaysia is converging on the PDPA framework rather than a bespoke AI statute, which means data-processing agreements and audit trails are the practical compliance work. Third, latency budgets, not raw quality, are what users notice — a 400 ms free model beats a 3 s premium one for interactive work.`,
    key_findings: [
      'Free-tier and open-weight endpoints now cover routine inference; routing policy is the differentiator.',
      'Malaysian compliance is converging on existing PDPA obligations rather than a new AI statute.',
      'Perceived quality tracks latency more than benchmark scores for interactive workloads.',
      'Per-token metering plus a hard budget ceiling is the pattern that keeps agentic spend predictable.',
    ],
    sources: [
      { title: 'OpenRouter model catalogue and live pricing', url: 'https://openrouter.ai/models' },
      { title: 'Personal Data Protection Act 2010 (Malaysia) — Act 709', url: 'https://www.pdp.gov.my/' },
      { title: 'MDEC AI adoption guidance for Malaysian enterprises', url: 'https://mdec.my/' },
    ],
    confidence: 'medium',
    open_questions: [
      'How will free-tier rate limits behave once usage is 100× today?',
      'Does a Malaysian-specific data-residency requirement apply to this workload?',
    ],
  };
}

function writerPayload(prompt) {
  const brief = topicOf(prompt, 'the brief');
  return {
    title: titleCase(brief),
    format: 'markdown',
    content_md: `## ${titleCase(brief)}\n\nMost platforms sell you a model. That is the wrong thing to buy.\n\nWhat you actually need is a **routing policy** — a rule that says: try the free endpoint first, step down to a cheap paid one only when the free one fails, and never reach for a premium model unless the task genuinely requires it. Models change monthly. A routing policy is the durable asset.\n\n### What this buys you\n\n- **Cost control that survives model churn.** A new free model appears, the policy picks it up, the bill drops.\n- **Resilience without complexity.** Rate limits are absorbed by the next rung instead of surfacing as an error.\n- **Honest accounting.** Every response reports which model answered and what it cost.\n\n### What it does not buy you\n\nIt will not make a small model reason like a large one. The policy decides *when* to escalate; it cannot make escalation unnecessary.\n\nStart with the free rung. Measure. Escalate on evidence, not on anxiety.`,
    variants: [
      { label: 'short (social)', content_md: `Stop buying models. Start buying routing policy.\n\nTry free first. Escalate only on failure. Report what each call cost.\n\nModels change monthly. Your routing policy is the asset.` },
      { label: 'bahasa malaysia', content_md: `## ${titleCase(brief)}\n\nKebanyakan platform menjual model kepada anda. Itu bukan perkara yang patut dibeli.\n\nYang anda perlukan ialah **dasar penghalaan** — cuba titik akhir percuma dahulu, turun ke model berbayar murah hanya apabila yang percuma gagal.` },
    ],
    word_count: 214,
    seo_keywords: ['agentic platform', 'LLM routing', 'cost-aware AI', 'OpenRouter', 'MaaS Malaysia'],
  };
}

function qaPayload(prompt) {
  return {
    verdict: 'pass_with_notes',
    score: 78,
    issues: [
      { severity: 'high', location: 'app/services/limiter.py:24', problem: 'The window boundary permits up to 2× the configured limit in a burst — a client can spend its full quota at second 59 and again at second 0.', fix: 'Either accept the burst and document it, or switch to a sliding-window counter with a weighted previous window.' },
      { severity: 'medium', location: 'app/api/deps.py:12', problem: 'The identity string uses the raw principal id without the tenant prefix, so two tenants with a colliding id share a bucket.', fix: 'Namespace the bucket: f"{principal.org_id}:{principal.id}".' },
      { severity: 'low', location: 'tests/test_limiter.py', problem: 'No test covers the Redis-unavailable fallback path.', fix: 'Add a test where the store raises and assert the limiter fails open (or closed) as documented.' },
    ],
    missing_tests: [
      'Redis outage behaviour',
      'Concurrent requests against the same bucket',
      'TTL expiry actually resets the counter',
    ],
    security_notes: [
      'Failing open on store outage is the right call for availability, but log it loudly — a silent limiter outage is an abuse window.',
      'Do not include the raw API key in the rate-limit identity; it lands in Redis keys and therefore in any Redis dump.',
    ],
  };
}

function automationPayload(prompt) {
  const goal = topicOf(prompt, 'the automation goal');
  return {
    name: goal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'workflow',
    trigger: { type: 'webhook', config: { secret: 'replace-me', method: 'POST', path: '/hooks/{workflow_id}' } },
    nodes: [
      { id: 'n1', type: 'http', connector: 'webhook', config: { method: 'POST', parse_json: true } },
      { id: 'n2', type: 'transform', connector: 'http', config: { expression: 'normalise(payload)' } },
      { id: 'n3', type: 'agent', connector: 'agenticos', config: { agent: 'researcher', task: 'research', max_tokens: 2000 } },
      { id: 'n4', type: 'condition', connector: 'http', config: { expression: 'score > 70' } },
      { id: 'n5', type: 'http', connector: 'slack', config: { channel: '#sales', template: 'New qualified lead' } },
      { id: 'n6', type: 'http', connector: 'google_sheets', config: { spreadsheet: 'leads', mode: 'append' } },
    ],
    edges: [
      { source: 'n1', target: 'n2', condition: null },
      { source: 'n2', target: 'n3', condition: null },
      { source: 'n3', target: 'n4', condition: null },
      { source: 'n4', target: 'n5', condition: 'true' },
      { source: 'n4', target: 'n6', condition: 'false' },
    ],
    error_handling: { retries: 3, backoff: 'exponential', on_failure: 'notify_and_continue' },
  };
}

function imagePromptPayload(prompt) {
  const subject = topicOf(prompt, 'the requested subject');
  return {
    prompt: `${subject}, cinematic three-quarter view, volumetric dusk light through floor-to-ceiling glass, deep indigo and violet practical lights, shallow depth of field 85mm f/1.8, ultra-detailed, editorial photography, 8k, muted teal shadows`,
    negative_prompt: 'text, watermark, logo, extra fingers, deformed hands, lowres, jpeg artifacts, oversaturated, plastic skin, cluttered background',
    aspect_ratio: '16:9',
    style: 'photoreal editorial',
    variations: [
      `${subject}, isometric technical illustration, flat vector, indigo/violet palette, white background, annotation callouts`,
      `${subject}, dramatic low-angle, hard rim light, high contrast monochrome with a single violet accent`,
      `${subject}, soft watercolour wash, paper texture, minimal, generous negative space`,
    ],
  };
}

function videoPayload(prompt) {
  const concept = topicOf(prompt, 'the concept');
  return {
    title: concept,
    shot_list: [
      { t: 0, camera: 'slow dolly in', action: 'Open wide on the environment; the subject is small in frame.', prompt: `${concept}, establishing wide shot, dawn light, volumetric haze` },
      { t: 2, camera: 'match cut', action: 'Cut to a detail insert that carries the key information.', prompt: 'extreme close-up on the pivotal detail, shallow depth of field' },
      { t: 4, camera: 'handheld follow', action: 'Track the subject through the decisive action.', prompt: 'dynamic tracking shot, motion blur on background, subject sharp' },
      { t: 7, camera: 'static, slight push', action: 'Land the outcome; hold long enough to read.', prompt: 'clean hero frame, centred subject, soft gradient background' },
    ],
    style: 'documentary, natural light, 24fps, 2.39:1',
    music: 'minimal piano, 80 BPM, sparse, resolves on the final frame',
  };
}

function infographicPayload(prompt) {
  return {
    title: 'Where the tokens actually go',
    subtitle: 'One week of mixed agentic workload, 4,182 completions',
    sections: [
      { heading: 'Free tier carries the load', body: 'Free endpoints absorbed 81% of completions. They rate-limit more often, which is precisely what the fallback ladder absorbs.', stat: '81%', icon: 'sparkles' },
      { heading: 'Premium is a last resort', body: 'Only 1.5% of calls reached a premium model — refactors and QA reviews where reasoning quality measurably mattered.', stat: '1.5%', icon: 'crown' },
      { heading: 'Cache is free money', body: 'Identical prompt and parameters served from cache cost nothing and returned in under a millisecond.', stat: '22%', icon: 'database' },
      { heading: 'Spend fell by 93%', body: 'The same workload on premium-only routing would have cost $61.90. Actual spend was $4.28.', stat: '-93%', icon: 'trending-down' },
    ],
    chart: {
      type: 'bar',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        { name: 'free', data: [42000, 61500, 55200, 88900, 102400, 71300, 63800] },
        { name: 'paid', data: [6100, 8400, 5900, 12700, 15200, 9800, 7100] },
      ],
    },
    palette: ['hsl(152 60% 40%)', 'hsl(245 75% 60%)', 'hsl(268 78% 62%)', 'hsl(32 92% 50%)'],
    takeaway: 'Routing policy, not model choice, is what moved the number.',
  };
}

function mindmapPayload(prompt) {
  const root = topicOf(prompt, 'Agentic OS');
  const nodes = [
    { id: 'root', label: root, parent: null, level: 0 },
    { id: 'gw', label: 'AI Gateway', parent: 'root', level: 1 },
    { id: 'agents', label: 'Agents', parent: 'root', level: 1 },
    { id: 'mods', label: 'Modules', parent: 'root', level: 1 },
    { id: 'data', label: 'Data layer', parent: 'root', level: 1 },
    { id: 'router', label: 'ModelRouter', parent: 'gw', level: 2 },
    { id: 'cache', label: 'Response cache', parent: 'gw', level: 2 },
    { id: 'breaker', label: 'Circuit breaker', parent: 'gw', level: 2 },
    { id: 'budget', label: 'Token budget', parent: 'gw', level: 2 },
    { id: 'orch', label: 'Orchestrator', parent: 'agents', level: 2 },
    { id: 'ten', label: '10 specialists', parent: 'agents', level: 2 },
    { id: 'lg', label: 'LangGraph fan-out', parent: 'agents', level: 2 },
    { id: 'studio', label: 'Vibe coding', parent: 'mods', level: 2 },
    { id: 'creative', label: 'Creative studio', parent: 'mods', level: 2 },
    { id: 'auto', label: 'Automation', parent: 'mods', level: 2 },
    { id: 'maas', label: 'MaaS / PaaS', parent: 'mods', level: 2 },
    { id: 'pg', label: 'Postgres + RLS', parent: 'data', level: 2 },
    { id: 'redis', label: 'Redis', parent: 'data', level: 2 },
    { id: 's3', label: 'MinIO / S3', parent: 'data', level: 2 },
    { id: 'mq', label: 'RabbitMQ', parent: 'data', level: 2 },
  ];
  return {
    title: root,
    nodes,
    edges: nodes.filter((n) => n.parent).map((n) => ({ source: n.parent, target: n.id, label: '' })),
  };
}

function quizPayload(prompt) {
  const topic = topicOf(prompt, 'Photosynthesis');
  const level = /primary|standard/i.test(prompt) ? 'primary' : /tertiary|university/i.test(prompt) ? 'tertiary' : 'secondary';
  return {
    title: `${titleCase(topic)} — ${titleCase(level)}`,
    subject: titleCase(topic),
    level,
    questions: [
      { id: 1, type: 'mcq', question: 'Which pigment absorbs the light energy used in photosynthesis?', image_prompt: 'A labelled chloroplast cross-section highlighting the thylakoid membranes in green', options: ['Chlorophyll', 'Haemoglobin', 'Melanin', 'Keratin'], answer_index: 0, explanation: 'Chlorophyll absorbs mainly red and blue wavelengths and reflects green, which is why leaves look green.', difficulty: 'easy', points: 1 },
      { id: 2, type: 'mcq', question: 'Where do the light-independent reactions take place?', image_prompt: 'Diagram of the chloroplast stroma with the Calvin cycle drawn as a circular arrow', options: ['Thylakoid membrane', 'Stroma', 'Cytoplasm', 'Mitochondrial matrix'], answer_index: 1, explanation: 'The Calvin cycle runs in the stroma, consuming the ATP and NADPH produced by the light reactions.', difficulty: 'medium', points: 2 },
      { id: 3, type: 'truefalse', question: 'Oxygen is released by splitting water during the light reactions.', image_prompt: 'Water molecules being split at photosystem II with O2 bubbles rising', options: ['True', 'False'], answer_index: 0, explanation: 'Photolysis of water at photosystem II releases O2 as a by-product and supplies electrons to replace those lost by chlorophyll.', difficulty: 'easy', points: 1 },
      { id: 4, type: 'mcq', question: 'Which factor is NOT a limiting factor of photosynthesis at high light intensity?', image_prompt: 'A graph plotting rate of photosynthesis against light intensity, plateauing', options: ['Light intensity', 'Carbon dioxide concentration', 'Temperature', 'Colour of the pot'], answer_index: 3, explanation: 'At high light intensity the rate plateaus and becomes limited by CO2 or temperature. The pot colour has no effect.', difficulty: 'hard', points: 3 },
      { id: 5, type: 'truefalse', question: 'Photosynthesis converts light energy into chemical energy stored in glucose.', image_prompt: 'Energy flow diagram: sun → chlorophyll → glucose molecule', options: ['True', 'False'], answer_index: 0, explanation: 'Light energy is converted to chemical energy in the bonds of glucose, which is the point of the whole process.', difficulty: 'easy', points: 1 },
    ],
  };
}

function gamePayload(prompt) {
  const topic = topicOf(prompt, 'Fractions');
  return {
    title: `${titleCase(topic)} Catcher`,
    subject: titleCase(topic),
    learning_objectives: ['Recognise equivalent fractions', 'Compare fractions with unlike denominators', 'Work accurately under mild time pressure'],
    mechanics: 'Numbers fall from the top. Move the paddle with the arrow keys, A/D, or by dragging. Catch the tile that answers the question; let the wrong ones fall.',
    controls: 'Arrow keys / A and D / drag on touch',
    html: buildGameHtml(topic),
  };
}

function deployPayload(prompt) {
  const stack = /laravel|php/i.test(prompt) ? 'laravel' : /go\b/i.test(prompt) ? 'go' : 'nextjs';
  return {
    target: 'docker-vps',
    dockerfile: `# ---- deps --------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN corepack enable && (pnpm install --frozen-lockfile || npm ci)

# ---- build -------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime -----------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
`,
    compose_service: `  web:
    build: { context: ., target: runner }
    restart: unless-stopped
    ports: ["127.0.0.1:3000:3000"]
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1))"]
      interval: 30s
`,
    env_vars: [
      { key: 'OPENROUTER_API_KEY', required: true, description: 'AI gateway credential' },
      { key: 'DATABASE_URL', required: true, description: 'Postgres connection string' },
      { key: 'JWT_SECRET', required: true, description: '32-byte random; signs session tokens' },
      { key: 'NEXT_PUBLIC_API_URL', required: true, description: 'Public API origin, inlined at build time' },
    ],
    ci_steps: [
      'checkout + setup-node 22 with pnpm cache',
      'pnpm install --frozen-lockfile',
      'pnpm lint && pnpm typecheck',
      'pnpm test --coverage',
      'docker build --target runner -t registry/app:$GITHUB_SHA .',
      'docker push registry/app:$GITHUB_SHA',
      'ssh deploy@vps "cd /opt/app && docker compose pull && docker compose up -d"',
      'curl --fail --retry 5 https://app.example/health/ready',
    ],
    rollback: 'docker compose up -d --no-deps app:$PREVIOUS_SHA — the previous image stays in the registry for 30 days.',
    healthcheck: 'GET /health/ready returns 200 only when Postgres, Redis and the AI gateway all answer.',
  };
}

/* ---------------------------------------------------------------- prose */

function prose(spec, prompt) {
  const topic = topicOf(prompt, prompt.slice(0, 60));
  return `**${spec.display_name}** answered this one.

You asked about **${topic}**. Here is the shape of a good answer:

1. **Name the constraint that actually binds.** Most questions like this have one real bottleneck and several decorative ones. Find the bottleneck first; optimising anything else is theatre.

2. **Prefer the smallest thing that works.** A free-tier model with a well-written prompt usually beats a premium model with a vague one. Escalate on evidence, not on anxiety.

3. **Make the cost visible.** If you cannot say what a request cost, you cannot decide whether it was worth making. Every response here reports its model, tokens and USD cost for exactly that reason.

> This response was produced by the built-in simulator, not a live model. Paste an OpenRouter key in Settings to route through real endpoints — the ladder, the fallback and the accounting all behave identically.`;
}

/* -------------------------------------------------------------------------- */
/*  A genuinely playable game, generated per topic                            */
/* -------------------------------------------------------------------------- */

function buildGameHtml(topic) {
  const safeTopic = topic.replace(/[<>"`]/g, '').slice(0, 40);
  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#14141f;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;color:#e8e8f0}
  #hud{position:fixed;top:0;left:0;right:0;display:flex;gap:14px;align-items:center;
    padding:10px 14px;background:rgba(20,20,31,.85);backdrop-filter:blur(8px);
    font-size:13px;z-index:5;border-bottom:1px solid #2a2a3d}
  #hud b{font-variant-numeric:tabular-nums}
  #q{flex:1;font-weight:600;font-size:15px}
  .pill{background:#242438;padding:3px 9px;border-radius:6px;font-size:12px}
  canvas{display:block;width:100%;height:100%;touch-action:none}
  #over{position:fixed;inset:0;display:none;place-items:center;background:rgba(20,20,31,.94);z-index:10}
  #over.on{display:grid}
  .panel{text-align:center;max-width:340px;padding:28px}
  .panel h1{margin:0 0 6px;font-size:24px;letter-spacing:-.02em}
  .panel p{color:#9a9ab0;font-size:13px;margin:0 0 18px}
  button{background:linear-gradient(135deg,#5b4fe8,#8b3fe8);color:#fff;border:0;
    padding:11px 22px;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer}
  button:hover{filter:brightness(1.1)}
  .score{font-size:38px;font-weight:700;font-variant-numeric:tabular-nums;margin:6px 0 2px}
</style></head>
<body>
<div id="hud">
  <span class="pill">${safeTopic}</span>
  <span id="q">…</span>
  <span>Score <b id="score">0</b></span>
  <span>Lives <b id="lives">3</b></span>
  <span>Streak <b id="streak">0</b></span>
</div>
<canvas id="c"></canvas>
<div id="over"><div class="panel">
  <h1 id="overTitle">Ready?</h1>
  <p id="overText">Catch the tile that answers the question. Arrow keys, A/D, or drag.</p>
  <div class="score" id="finalScore" style="display:none"></div>
  <button id="btn">Start</button>
</div></div>
<script>
(function(){
  var cv=document.getElementById('c'), ctx=cv.getContext('2d');
  var W=0,H=0,DPR=Math.min(2,window.devicePixelRatio||1);
  function resize(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);}
  window.addEventListener('resize',resize);resize();

  var TOPIC=${JSON.stringify(safeTopic)};
  var QUESTIONS=[
    {q:'Which is equivalent to 1/2?',a:'2/4',w:['1/3','2/3','3/5']},
    {q:'Which is larger?',a:'3/4',w:['2/3','1/2','3/8']},
    {q:'1/3 + 1/6 = ?',a:'1/2',w:['2/9','1/9','2/6']},
    {q:'Which equals 0.75?',a:'3/4',w:['2/3','4/5','7/10']},
    {q:'Which is smallest?',a:'1/8',w:['1/4','1/3','1/5']},
    {q:'2/5 of 20 = ?',a:'8',w:['6','10','4']},
    {q:'Which is equivalent to 2/3?',a:'4/6',w:['3/4','2/6','5/6']},
    {q:'5/10 simplified = ?',a:'1/2',w:['1/5','2/5','5/1']},
    {q:'3/4 - 1/4 = ?',a:'1/2',w:['1/4','2/4','3/8']},
    {q:'Which is larger?',a:'5/6',w:['3/4','2/3','4/5']}
  ];

  var state='idle', paddleX=0, targetX=0, keys={}, tiles=[], score=0, lives=3, streak=0;
  var qi=0, answer='', spawnTimer=0, spawnEvery=1180, speed=0.055, last=0;

  function nextQuestion(){
    qi=(qi+Math.floor(Math.random()*QUESTIONS.length))%QUESTIONS.length;
    var item=QUESTIONS[qi];
    answer=item.a;
    document.getElementById('q').textContent=item.q;
    var opts=[item.a].concat(item.w).sort(function(){return Math.random()-0.5;});
    var n=Math.min(3,opts.length);
    tiles=[]; spawnTimer=0;
    for(var i=0;i<n;i++){
      tiles.push({x:60+Math.random()*(W-160),y:-80-i*150,vy:1+Math.random()*0.35,
                  label:opts[i],ok:opts[i]===answer,caught:false,dead:false});
    }
  }

  function reset(){score=0;lives=3;streak=0;paddleX=W/2;updateHud();nextQuestion();}

  function updateHud(){
    document.getElementById('score').textContent=score;
    document.getElementById('lives').textContent=lives;
    document.getElementById('streak').textContent=streak;
  }

  function paddleW(){return Math.max(84,Math.min(160,W*0.22));}

  function step(dt){
    if(state!=='play')return;
    var spd=(keys.left?-1:0)+(keys.right?1:0);
    paddleX+=spd*0.62*dt;
    var pw=paddleW();
    paddleX=Math.max(pw/2,Math.min(W-pw/2,paddleX));

    speed=0.055+score*0.0016;
    spawnEvery=Math.max(560,1180-score*14);
    spawnTimer+=dt;
    if(spawnTimer>spawnEvery){
      spawnTimer=0;
      var opts=[];for(var i=0;i<tiles.length;i++)opts.push(tiles[i].label);
      if(tiles.length<4)nextQuestion();
    }

    for(var i=0;i<tiles.length;i++){
      var t=tiles[i];
      if(t.dead)continue;
      t.y+=t.vy*speed*dt;
      if(t.y>H-64 && t.y<H-20 && Math.abs(t.x-paddleX)<pw/2+22){
        t.dead=true;
        if(t.ok){score+=10;streak++;if(streak%3===0)score+=5;updateHud();
          document.getElementById('q').style.color='#5ee29a';
          setTimeout(function(){document.getElementById('q').style.color='';},420);
          nextQuestion();
        } else {
          lives--;streak=0;updateHud();
          document.getElementById('q').style.color='#ff6b6b';
          setTimeout(function(){document.getElementById('q').style.color='';},420);
          if(lives<=0)gameOver();
        }
      }
      if(t.y>H+60){t.dead=true;}
    }
    tiles=tiles.filter(function(t){return !t.dead;});
    if(tiles.length===0 && state==='play')nextQuestion();
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#17172a');g.addColorStop(1,'#101019');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

    ctx.strokeStyle='rgba(91,79,232,.10)';ctx.lineWidth=1;
    for(var x=0;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(var y=0;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    for(var i=0;i<tiles.length;i++){
      var t=tiles[i];
      var w=104,h=46;
      ctx.save();ctx.translate(t.x,t.y);
      ctx.fillStyle=t.ok?'rgba(31,138,95,.22)':'rgba(139,63,232,.16)';
      ctx.strokeStyle=t.ok?'rgba(94,226,154,.55)':'rgba(139,63,232,.45)';
      ctx.lineWidth=1.4;
      roundRect(-w/2,-h/2,w,h,10);ctx.fill();ctx.stroke();
      ctx.fillStyle='#e8e8f0';ctx.font='600 19px -apple-system,Segoe UI,Inter,sans-serif';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.label,0,1);
      ctx.restore();
    }

    var pw=paddleW();
    ctx.save();ctx.translate(paddleX,H-40);
    var pg=ctx.createLinearGradient(-pw/2,0,pw/2,0);
    pg.addColorStop(0,'#5b4fe8');pg.addColorStop(1,'#8b3fe8');
    ctx.fillStyle=pg;roundRect(-pw/2,-9,pw,18,9);ctx.fill();
    ctx.restore();
  }

  function roundRect(x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }

  function loop(ts){
    var dt=Math.min(48,ts-last||16);last=ts;
    step(dt);draw();requestAnimationFrame(loop);
  }

  function start(){
    document.getElementById('over').classList.remove('on');
    state='play';reset();last=performance.now();
  }
  function gameOver(){
    state='over';
    document.getElementById('overTitle').textContent='Run over';
    document.getElementById('overText').textContent='Score '+score+' — streak bonus applied every 3 correct in a row.';
    document.getElementById('finalScore').textContent=score;
    document.getElementById('finalScore').style.display='block';
    document.getElementById('btn').textContent='Play again';
    document.getElementById('over').classList.add('on');
  }

  document.getElementById('btn').addEventListener('click',start);
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.left=true;
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.right=true;
  });
  document.addEventListener('keyup',function(e){
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.left=false;
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.right=false;
  });
  function pointer(e){
    var r=cv.getBoundingClientRect();
    var cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
    paddleX=cx;
  }
  cv.addEventListener('pointerdown',pointer);
  cv.addEventListener('pointermove',function(e){if(e.buttons||e.pointerType==='touch')pointer(e);});
  cv.addEventListener('touchmove',function(e){e.preventDefault();pointer(e);},{passive:false});

  reset();
  requestAnimationFrame(loop);
})();
<\/script>
</body></html>`;
}

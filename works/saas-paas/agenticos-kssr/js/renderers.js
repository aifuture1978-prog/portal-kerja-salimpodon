/**
 * Renderers — one per agent output contract.
 *
 * Each renderer takes the parsed JSON payload and returns a DOM node. This is
 * why the agents return structured JSON rather than prose: the same contract
 * that a server-side consumer would read is what draws these UIs.
 */
import {
  h, esc, markdown, tierBadge, formatTokens, formatUSD, copy, toast,
} from './ui.js';

/* ---------------------------------------------------------------- icons */
const PATHS = {
  check: 'M2.5 8.5l3.5 3.5 7.5-8',
  x: 'M4 4l8 8M12 4l-8 8',
  warn: 'M8 2.6l5.6 10H2.4zM8 6.4v3M8 11.2v.1',
  info: 'M8 7.2v4M8 4.6v.1M8 1.6a6.4 6.4 0 100 12.8A6.4 6.4 0 008 1.6z',
  copy: 'M5.4 5.4V3.2h7.4v7.4h-2.2M3.2 5.4h7.4v7.4H3.2z',
  play: 'M5 3.4l7 4.6-7 4.6z',
  refresh: 'M13.2 7a5.2 5.2 0 11-1.6-3.7M13.4 2v3.4h-3.4',
  spark: 'M8 1.8l1.7 4.5 4.5 1.7-4.5 1.7L8 14.2 6.3 9.7 1.8 8l4.5-1.7z',
  code: 'M5.6 5.2L2.4 8l3.2 2.8M10.4 5.2L13.6 8l-3.2 2.8',
  file: 'M4 1.8h5l3 3v9.4H4zM9 1.8v3h3',
  bolt: 'M8.6 1.6L3.4 9h3.4l-.6 5.4L12.6 7H9.2z',
  clock: 'M8 1.8a6.2 6.2 0 100 12.4A6.2 6.2 0 008 1.8zM8 4.6V8l2.4 1.6',
  db: 'M8 1.8c3 0 5.2.9 5.2 2s-2.2 2-5.2 2-5.2-.9-5.2-2 2.2-2 5.2-2zM2.8 3.8v8.4c0 1.1 2.2 2 5.2 2s5.2-.9 5.2-2V3.8',
  shield: 'M8 1.6l5 1.9v4c0 3.2-2.1 5.7-5 6.9-2.9-1.2-5-3.7-5-6.9v-4z',
  arrow: 'M3 8h10M9.4 4.6L12.8 8l-3.4 3.4',
  down: 'M8 2.6v9M4.4 8l3.6 3.6L11.6 8',
  ext: 'M9.4 2.6h4v4M13.4 2.6L7.6 8.4M11.2 9.6v3.8H2.6V4.8h3.8',
  layers: 'M8 1.8L1.8 5.2 8 8.6l6.2-3.4zM1.8 8.4L8 11.8l6.2-3.4',
  users: 'M6 7.4a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8zM1.8 13.4c0-2.2 1.9-3.6 4.2-3.6s4.2 1.4 4.2 3.6M11 5.2a2 2 0 100 4M11.4 13.4c0-1.5-.5-2.5-1.3-3.2',
  route: 'M3 4.4h3.4a2.6 2.6 0 010 5.2H3M3 4.4l1.8-1.8M3 4.4l1.8 1.8M13 11.6H9.6a2.6 2.6 0 010-5.2H13M13 11.6l-1.8-1.8M13 11.6l-1.8 1.8',
  chart: 'M2.4 13.6V2.4M2.4 13.6h11.2M5.4 11.2V7.6M8.4 11.2V5M11.4 11.2V8.8',
  brush: 'M11.6 2.4l2 2-6.4 6.4-2-2zM5.2 8.8l2 2-1.6 1.6-2.4.8.8-2.4z',
  key: 'M10.4 2.4a3.2 3.2 0 00-2.9 4.5L2.6 11.8v1.6h1.6v-1.2h1.2v-1.2h1.2l.9-.9A3.2 3.2 0 1010.4 2.4zm.9 3.1h.1',
  cog: 'M8 5.8a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4zM8 1.6l.9 1.9 2.1-.4.6 2 2 .8-1 1.9 1 1.9-2 .8-.6 2-2.1-.4L8 14.4l-.9-1.9-2.1.4-.6-2-2-.8 1-1.9-1-1.9 2-.8.6-2 2.1.4z',
  rocket: 'M8 1.6s3.2 2 3.2 6.2c0 2.4-1.4 4.4-3.2 5.4-1.8-1-3.2-3-3.2-5.4C4.8 3.6 8 1.6 8 1.6zM6.4 13.4c-.8.6-2 .8-3.2.6.2-1.2.6-2.2 1.4-2.8',
  plus: 'M8 3.4v9.2M3.4 8h9.2',
  trash: 'M3.2 4.6h9.6M6 4.6V3h4v1.6M4.4 4.6l.6 9h6l.6-9',
  stop: 'M4.6 4.6h6.8v6.8H4.6z',
  eye: 'M1.8 8s2.4-4.4 6.2-4.4S14.2 8 14.2 8s-2.4 4.4-6.2 4.4S1.8 8 1.8 8zM8 6.2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z',
  grid: 'M2.4 2.4h4.6v4.6H2.4zM9 2.4h4.6v4.6H9zM2.4 9h4.6v4.6H2.4zM9 9h4.6v4.6H9z',
  book: 'M2.6 3.2h4.2c.7 0 1.2.5 1.2 1.2v8.4c0-.7-.5-1.2-1.2-1.2H2.6zM13.4 3.2H9.2C8.5 3.2 8 3.7 8 4.4v8.4c0-.7.5-1.2 1.2-1.2h4.2z',
  brain: 'M6 2.6a2.4 2.4 0 00-2.4 2.4c-1 .3-1.6 1.2-1.6 2.2 0 .6.2 1.1.6 1.5-.4.4-.6.9-.6 1.5a2.2 2.2 0 002.2 2.2c.3 1 1.2 1.6 2.2 1.6V2.6zM10 2.6a2.4 2.4 0 012.4 2.4c1 .3 1.6 1.2 1.6 2.2 0 .6-.2 1.1-.6 1.5.4.4.6.9.6 1.5a2.2 2.2 0 01-2.2 2.2c-.3 1-1.2 1.6-2.2 1.6',
  flow: 'M2.6 2.6h4v3.4h-4zM9.4 10h4v3.4h-4zM4.6 6v2.4a2 2 0 002 2h2.8',
  tag: 'M2.6 7.4V2.6h4.8l6 6-4.8 4.8zM5.4 5.4h.1',
  cloud: 'M4.6 12.4a2.8 2.8 0 01-.4-5.6 3.6 3.6 0 016.9-.9 2.6 2.6 0 01-.3 6.5z',
  globe: 'M8 1.8a6.2 6.2 0 100 12.4A6.2 6.2 0 008 1.8zM1.8 8h12.4M8 1.8c1.7 1.9 2.6 4 2.6 6.2S9.7 12.3 8 14.2C6.3 12.3 5.4 10.2 5.4 8S6.3 3.7 8 1.8z',
  mic: 'M8 9.4a2.4 2.4 0 002.4-2.4V4a2.4 2.4 0 10-4.8 0v3a2.4 2.4 0 002.4 2.4zM3.6 7.4a4.4 4.4 0 008.8 0M8 11.8v2.4M6 14.2h4',
};

export function icon(name, cls = 'ic') {
  const d = PATHS[name] ?? PATHS.info;
  return `<svg class="${cls}" viewBox="0 0 16 16" fill="none" stroke="currentColor"
    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}
const ico = (name, cls = 'ic') => h('span', { html: icon(name, cls), style: { display: 'inline-flex', flex: '0 0 auto' } });

/* --------------------------------------------------------------- helpers */
export function statCard(k, v, d, { accent = false, ic = null } = {}) {
  return h('div', { class: `stat${accent ? ' stat-accent' : ''}` },
    h('div', { class: 'k' }, ic ? ico(ic, 'ic') : null, k),
    h('div', { class: 'v' }, v),
    d ? h('div', { class: 'd', html: d }) : null,
  );
}

function section(title, ...body) {
  return h('div', { class: 'mb-3' },
    h('div', { class: 'lbl mb-2', style: { fontSize: '10.5px', letterSpacing: '.06em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' } }, title),
    ...body,
  );
}

function bullets(items, { mark = 'arrow' } = {}) {
  return h('ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' } },
    ...items.map((t) => h('li', { class: 'row', style: { alignItems: 'flex-start', gap: '8px', fontSize: '12.5px' } },
      h('span', { html: icon(mark), style: { display: 'inline-flex', flex: '0 0 auto', marginTop: '3px', color: 'hsl(var(--muted-foreground))' } }),
      h('span', { class: 'grow', html: esc(t) }),
    )),
  );
}

function codeBlock(code, label = '') {
  const lines = String(code ?? '').split('\n');
  return h('div', null,
    label ? h('div', { class: 'row mb-2' },
      h('span', { class: 'mono muted' }, label),
      h('div', { class: 'grow' }),
      h('button', { class: 'btn btn-sm btn-ghost', onclick: () => copy(code, 'Code copied') }, ico('copy', 'ic'), 'Copy'),
    ) : null,
    h('div', { class: 'code-editor' },
      h('div', { class: 'gutter' }, lines.map((_, i) => i + 1).join('\n')),
      h('pre', null, h('code', { text: code })),
    ),
  );
}

function fileTabs(files, initial = 0) {
  const host = h('div');
  const tabs = h('div', { class: 'row', style: { gap: '0' } });
  const pane = h('div');
  let active = initial;

  const paint = () => {
    tabs.replaceChildren(...files.map((f, i) => h('button', {
      class: 'file-tab', 'aria-selected': String(i === active),
      onclick: () => { active = i; paint(); },
    },
      h('span', { html: icon('file'), style: { display: 'inline-flex', width: '12px' } }),
      f.path,
      f.action && f.action !== 'create'
        ? h('span', { class: `pill ${f.action === 'delete' ? 'p-prem' : 'p-cheap'}`, style: { fontSize: '9px', padding: '0 4px' } }, f.action)
        : null,
    )));

    const f = files[active];
    pane.replaceChildren(codeBlock(f.content, null));
  };
  paint();
  host.append(tabs, h('div', { class: 'mt-2' }, pane));
  return host;
}

/* ========================================================================== */
/*  Agent output renderers                                                    */
/* ========================================================================== */

/* ------------------------------------------------------- orchestrator plan */
export function planView(p) {
  const agentColor = (a) => ({
    researcher: 'hsl(var(--info))', designer: 'hsl(var(--accent))', coder: 'hsl(var(--primary))',
    qa: 'hsl(var(--warn))', deploy: 'hsl(var(--up))', writer: 'hsl(var(--accent))',
    automation: 'hsl(var(--primary))', creative: 'hsl(var(--accent))', tutor: 'hsl(var(--up))',
    orchestrator: 'hsl(var(--muted-foreground))',
  }[a] ?? 'hsl(var(--muted-foreground))');

  return h('div', null,
    h('div', { class: 'banner mb-3' }, ico('spark'),
      h('div', null,
        h('strong', null, 'Goal: '), p.goal,
        h('div', { class: 'tiny muted mt-1' }, `${p.steps.length} steps · ${p.definition_of_done.length} acceptance criteria · ${p.risks.length} risks flagged`),
      ),
    ),

    h('div', { class: 'ladder' }, ...p.steps.map((s, i) => h('div', { class: 'rung rung-ok' },
      h('div', { class: 'rung-ic' }, String(s.id)),
      h('div', { class: 'grow' },
        h('div', { class: 'rung-name' },
          s.title,
          h('span', { class: 'pill p-gl', style: { color: agentColor(s.agent), borderColor: agentColor(s.agent) } }, s.agent),
          s.depends_on?.length ? h('span', { class: 'tiny muted' }, `after #${s.depends_on.join(', #')}`) : null,
        ),
        h('div', { class: 'rung-note' }, s.instruction),
        h('div', { class: 'tiny muted mt-1' }, h('strong', null, '→ '), s.expected_output),
      ),
      h('span', { class: 'tiny muted nowrap' }, `#${s.id}`),
    ))),

    h('div', { class: 'grid g-2 mt-4' },
      h('div', null, section('Risks', bullets(p.risks, { mark: 'warn' }))),
      h('div', null, section('Definition of done', bullets(p.definition_of_done, { mark: 'check' }))),
    ),
  );
}

/* --------------------------------------------------------------- code diff */
export function codeView(p) {
  const files = p.files ?? [];
  const totalLines = files.reduce((n, f) => n + String(f.content ?? '').split('\n').length, 0);

  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { class: 'pill p-cheap' }, p.language ?? 'code'),
      h('span', { class: 'tiny muted' }, `${files.length} file${files.length === 1 ? '' : 's'} · ${totalLines} lines`),
      p.tests?.length ? h('span', { class: 'pill p-free' }, `${p.tests.length} test file${p.tests.length === 1 ? '' : 's'}`) : null,
    ),
    h('p', { class: 'tiny muted mb-3' }, p.summary),
    files.length ? fileTabs(files) : null,

    p.tests?.length ? h('div', { class: 'mt-4' }, section('Tests', ...p.tests.map((t) => h('div', { class: 'mt-2' }, codeBlock(t.content, t.path))))) : null,

    p.run_commands?.length
      ? h('div', { class: 'mt-4' }, section('Run commands',
        h('div', { class: 'code' }, p.run_commands.map((c) => `$ ${c}`).join('\n'))))
      : null,

    p.notes?.length ? h('div', { class: 'mt-4' }, section('Notes', bullets(p.notes))) : null,
  );
}

/* ------------------------------------------------------------------ design */
export function designView(p) {
  const t = p.tokens ?? {};
  const swatches = Object.entries(t.colors ?? {});
  return h('div', null,
    h('div', { class: 'grid g-2 mb-3' },
      h('div', null, section('Page', h('div', { style: { fontWeight: 650, fontSize: '13.5px' } }, p.page))),
      h('div', null, section('Layout', h('div', { class: 'tiny muted' }, p.layout))),
    ),

    swatches.length ? section('Colour tokens',
      h('div', { class: 'row-wrap' }, ...swatches.map(([k, v]) => h('div', { class: 'row', style: { gap: '6px' } },
        h('span', { style: { width: '18px', height: '18px', borderRadius: '5px', background: v, border: '1px solid hsl(var(--border))', display: 'inline-block' } }),
        h('span', { class: 'mono tiny' }, k),
        h('span', { class: 'tiny muted mono' }, v),
      ))),
    ) : null,

    t.spacing ? h('div', { class: 'mt-3' }, section('Spacing scale',
      h('div', { class: 'row', style: { gap: '10px', alignItems: 'flex-end' } },
        ...(t.spacing.scale ?? []).map((s) => h('div', { class: 'center' },
          h('div', { style: { width: '100%', minWidth: '16px', height: s, background: 'hsl(var(--primary) / .22)', borderRadius: '3px' } }),
          h('div', { class: 'tiny muted mono mt-1' }, s),
        )),
      ))) : null,

    t.type ? h('div', { class: 'mt-3' }, section('Type scale',
      h('div', { class: 'row-wrap' }, ...(t.type.scale ?? []).map((s) =>
        h('span', { class: 'chip mono', style: { fontSize: s } }, s))),
    )) : null,

    h('div', { class: 'mt-4' }, section('Components', ...(p.components ?? []).map((c) =>
      h('div', { class: 'mb-3' },
        h('div', { class: 'row mb-2' },
          h('span', { style: { fontWeight: 650, fontSize: '12.5px' } }, c.name),
          h('span', { class: 'tiny muted' }, c.purpose),
        ),
        codeBlock(c.code),
      )))),

    p.a11y_notes?.length ? h('div', { class: 'mt-2' }, section('Accessibility', bullets(p.a11y_notes, { mark: 'shield' }))) : null,
  );
}

/* ---------------------------------------------------------------- research */
export function researchView(p) {
  const conf = { low: 'p-prem', medium: 'p-cheap', high: 'p-free' }[p.confidence] ?? 'p-gl';
  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { class: `pill ${conf}` }, `CONFIDENCE: ${String(p.confidence ?? 'n/a').toUpperCase()}`),
      h('span', { class: 'tiny muted' }, p.question),
    ),
    h('div', { class: 'md-p' }, p.answer),
    h('div', { class: 'mt-3' }, section('Key findings', bullets(p.key_findings ?? [], { mark: 'check' }))),
    p.sources?.length ? h('div', { class: 'mt-3' }, section('Sources',
      h('ol', { style: { margin: 0, paddingLeft: '18px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '5px' } },
        ...p.sources.map((s) => h('li', null,
          h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title),
          h('span', { class: 'mono tiny muted', style: { marginLeft: '6px' } }, s.url.replace(/^https?:\/\//, '').split('/')[0]),
        ))),
    )) : null,
    p.open_questions?.length ? h('div', { class: 'mt-3' }, section('Open questions', bullets(p.open_questions, { mark: 'info' }))) : null,
  );
}

/* ------------------------------------------------------------------ writer */
export function writerView(p) {
  const tabs = [{ label: 'primary', md: p.content_md }, ...(p.variants ?? []).map((v) => ({ label: v.label, md: v.content_md }))];
  const host = h('div');
  const bar = h('div', { class: 'tabs mb-3' });
  const pane = h('div', { class: 'msg-body' });
  let active = 0;

  const paint = () => {
    bar.replaceChildren(...tabs.map((t, i) => h('button', {
      class: 'tab', 'aria-selected': String(i === active),
      onclick: () => { active = i; paint(); },
    }, t.label)));
    pane.innerHTML = markdown(tabs[active].md);
  };
  paint();
  host.append(bar, pane);

  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { style: { fontWeight: 700, fontSize: '14px' } }, p.title),
      h('span', { class: 'pill p-gl' }, p.format ?? 'markdown'),
      h('span', { class: 'tiny muted nums' }, `${p.word_count ?? 0} words`),
      h('div', { class: 'grow' }),
      h('button', { class: 'btn btn-sm btn-ghost', onclick: () => copy(tabs[active].md, 'Markdown copied') }, ico('copy', 'ic'), 'Copy'),
    ),
    host,
    p.seo_keywords?.length ? h('div', { class: 'row-wrap mt-3' }, ...p.seo_keywords.map((k) => h('span', { class: 'chip' }, k))) : null,
  );
}

/* ---------------------------------------------------------------------- QA */
export function qaView(p) {
  const verdictPill = { pass: 'p-free', pass_with_notes: 'p-cheap', fail: 'p-prem' }[p.verdict] ?? 'p-gl';
  const sevPill = { critical: 'p-prem', high: 'p-prem', medium: 'p-cheap', low: 'p-gl' };
  const score = Math.max(0, Math.min(100, p.score ?? 0));

  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { class: `pill ${verdictPill}`, style: { fontSize: '11px', padding: '3px 10px' } }, String(p.verdict ?? '').replace(/_/g, ' ').toUpperCase()),
      h('div', { class: 'grow', style: { minWidth: '140px' } },
        h('div', { class: 'row', style: { justifyContent: 'space-between', fontSize: '11px' } },
          h('span', { class: 'muted' }, 'Quality score'),
          h('strong', { class: 'nums' }, `${score}/100`),
        ),
        h('div', { class: 'meter mt-1' },
          h('i', { style: { width: `${score}%`, background: score >= 75 ? 'hsl(var(--up))' : score >= 50 ? 'hsl(var(--warn))' : 'hsl(var(--down))' } })),
      ),
    ),

    h('div', { class: 'stack' }, ...(p.issues ?? []).map((it) => h('div', { class: 'card card-pad' },
      h('div', { class: 'row-wrap mb-2' },
        h('span', { class: `pill ${sevPill[it.severity] ?? 'p-gl'}` }, String(it.severity).toUpperCase()),
        h('span', { class: 'mono tiny muted' }, it.location),
      ),
      h('div', { style: { fontSize: '12.8px', fontWeight: 550 } }, it.problem),
      h('div', { class: 'row mt-2', style: { alignItems: 'flex-start', gap: '7px' } },
        h('span', { html: icon('check'), style: { display: 'inline-flex', flex: '0 0 auto', marginTop: '3px', color: 'hsl(var(--up))' } }),
        h('span', { class: 'tiny muted grow' }, it.fix),
      ),
    ))),

    p.missing_tests?.length ? h('div', { class: 'mt-3' }, section('Missing tests', bullets(p.missing_tests, { mark: 'x' }))) : null,
    p.security_notes?.length ? h('div', { class: 'mt-3' }, section('Security notes', bullets(p.security_notes, { mark: 'shield' }))) : null,
  );
}

/* ------------------------------------------------------- automation / flow */
export function automationView(p) {
  const nodes = p.nodes ?? [];
  const edges = p.edges ?? [];

  // Layered layout: BFS depth from roots determines the column.
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const indeg = Object.fromEntries(nodes.map((n) => [n.id, 0]));
  for (const e of edges) if (indeg[e.target] !== undefined) indeg[e.target]++;
  const depth = {};
  const queue = nodes.filter((n) => !indeg[n.id]).map((n) => n.id);
  queue.forEach((id) => { depth[id] = 0; });
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    for (const e of edges.filter((x) => x.source === id)) {
      depth[e.target] = Math.max(depth[e.target] ?? 0, (depth[id] ?? 0) + 1);
      queue.push(e.target);
    }
  }
  for (const n of nodes) if (depth[n.id] === undefined) depth[n.id] = 0;

  const cols = new Map();
  for (const n of nodes) {
    const d = depth[n.id];
    if (!cols.has(d)) cols.set(d, []);
    cols.get(d).push(n);
  }

  const NW = 148, NH = 46, GX = 74, GY = 20;
  const maxRows = Math.max(...[...cols.values()].map((c) => c.length), 1);
  const width = (cols.size || 1) * (NW + GX) + 24;
  const height = maxRows * (NH + GY) + 44;

  const pos = {};
  for (const [d, list] of cols) {
    const total = list.length * NH + (list.length - 1) * GY;
    const y0 = (height - total) / 2;
    list.forEach((n, i) => { pos[n.id] = { x: 16 + d * (NW + GX), y: y0 + i * (NH + GY) }; });
  }

  const typeFill = {
    http: 'hsl(var(--primary))', transform: 'hsl(var(--muted-foreground))',
    agent: 'hsl(var(--accent))', condition: 'hsl(var(--warn))', trigger: 'hsl(var(--up))',
  };
  const esc2 = esc;

  const edgeSvg = edges.map((e) => {
    const a = pos[e.source], b = pos[e.target];
    if (!a || !b) return '';
    const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2;
    const mx = (x1 + x2) / 2;
    const stroke = e.condition === 'true' ? 'hsl(var(--up))' : e.condition === 'false' ? 'hsl(var(--down))' : 'hsl(var(--border-strong))';
    const dash = e.condition ? '5 4' : '';
    const label = e.condition
      ? `<rect x="${mx - 16}" y="${(y1 + y2) / 2 - 9}" width="32" height="16" rx="8" style="fill:hsl(var(--surface))" stroke="${stroke}"/>
         <text x="${mx}" y="${(y1 + y2) / 2 + 3.5}" text-anchor="middle" font-size="9.5" font-weight="700" style="fill:${stroke}">${esc2(e.condition)}</text>`
      : '';
    return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="${stroke}" stroke-width="1.6" ${dash ? `stroke-dasharray="${dash}"` : ''}/>
            <path d="M${x2 - 6},${y2 - 4} L${x2},${y2} L${x2 - 6},${y2 + 4}" fill="none" stroke="${stroke}" stroke-width="1.6"/>${label}`;
  }).join('');

  const nodeSvg = nodes.map((n) => {
    const q = pos[n.id];
    const fill = typeFill[n.type] ?? 'hsl(var(--muted-foreground))';
    return `<g class="flow-node"><title>${esc2(n.id)} · ${esc2(n.type)} · ${esc2(n.connector)}</title>
      <rect x="${q.x}" y="${q.y}" width="${NW}" height="${NH}" rx="10" style="fill:hsl(var(--surface))" stroke="hsl(var(--border-strong))"/>
      <rect x="${q.x}" y="${q.y}" width="3.5" height="${NH}" rx="2" fill="${fill}"/>
      <text x="${q.x + 13}" y="${q.y + 19}" font-size="11.5" font-weight="650" style="fill:hsl(var(--foreground))">${esc2(String(n.type).toUpperCase())}</text>
      <text x="${q.x + 13}" y="${q.y + 34}" font-size="10" style="fill:hsl(var(--muted-foreground))">${esc2(String(n.connector).slice(0, 20))}</text>
      <text x="${q.x + NW - 9}" y="${q.y + 19}" text-anchor="end" font-size="9" font-weight="700" style="fill:${fill}">${esc2(n.id)}</text>
    </g>`;
  }).join('');

  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { class: 'mono', style: { fontWeight: 650, fontSize: '13px' } }, p.name),
      h('span', { class: 'pill p-cheap' }, `TRIGGER: ${String(p.trigger?.type ?? 'manual').toUpperCase()}`),
      h('span', { class: 'tiny muted' }, `${nodes.length} nodes · ${edges.length} edges`),
    ),
    h('div', { class: 'card', style: { padding: '12px', overflowX: 'auto' } },
      h('div', { html: `<svg viewBox="0 0 ${width} ${height}" class="flow-canvas" style="min-width:${Math.min(width, 760)}px" role="img" aria-label="Workflow graph">${edgeSvg}${nodeSvg}</svg>` }),
    ),
    h('div', { class: 'grid g-2 mt-3' },
      h('div', null, section('Trigger config', h('div', { class: 'code' }, JSON.stringify(p.trigger?.config ?? {}, null, 2)))),
      h('div', null, section('Error handling',
        h('dl', { class: 'kv' },
          h('dt', null, 'Retries'), h('dd', { class: 'nums' }, String(p.error_handling?.retries ?? 0)),
          h('dt', null, 'Backoff'), h('dd', null, p.error_handling?.backoff ?? '—'),
          h('dt', null, 'On failure'), h('dd', null, p.error_handling?.on_failure ?? '—'),
        ))),
    ),
  );
}

/* ------------------------------------------------------------ image prompt */
export function imageView(p) {
  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { class: 'pill p-cheap' }, p.aspect_ratio ?? '1:1'),
      h('span', { class: 'pill p-gl' }, p.style ?? 'default'),
    ),
    section('Prompt',
      h('div', { class: 'msg-body' }, h('span', { class: 'mono', style: { fontSize: '12px' } }, p.prompt)),
      h('button', { class: 'btn btn-sm mt-2', onclick: () => copy(p.prompt, 'Prompt copied') }, ico('copy', 'ic'), 'Copy prompt'),
    ),
    h('div', { class: 'mt-3' }, section('Negative prompt',
      h('div', { class: 'msg-body' }, h('span', { class: 'mono tiny muted' }, p.negative_prompt)))),
    p.variations?.length ? h('div', { class: 'mt-3' }, section('Variations', ...p.variations.map((v, i) =>
      h('div', { class: 'row mb-2', style: { alignItems: 'flex-start', gap: '9px' } },
        h('span', { class: 'avatar', style: { width: '20px', height: '20px', fontSize: '10px', borderRadius: '6px' } }, String(i + 1)),
        h('span', { class: 'grow mono tiny' }, v),
      )))) : null,
  );
}

/* ------------------------------------------------------------- video story */
export function videoView(p) {
  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { style: { fontWeight: 700, fontSize: '14px' } }, p.title),
      h('span', { class: 'pill p-gl' }, p.style ?? 'cinematic'),
    ),
    h('div', { class: 'ladder' }, ...(p.shot_list ?? []).map((s) => h('div', { class: 'rung' },
      h('div', { class: 'rung-ic' }, `${s.t}s`),
      h('div', { class: 'grow' },
        h('div', { class: 'rung-name' }, s.camera),
        h('div', { class: 'rung-note' }, s.action),
        h('div', { class: 'mono tiny muted mt-1' }, s.prompt),
      ),
      h('button', { class: 'btn btn-sm btn-ghost', onclick: () => copy(s.prompt, 'Shot prompt copied') }, ico('copy', 'ic')),
    ))),
    h('div', { class: 'mt-3 row', style: { gap: '8px' } },
      h('span', { html: icon('bolt'), style: { display: 'inline-flex', color: 'hsl(var(--muted-foreground))' } }),
      h('span', { class: 'tiny muted' }, `Music: ${p.music ?? '—'}`),
    ),
  );
}

/* ------------------------------------------------------------ infographic */
export function infographicView(p) {
  const chart = p.chart;
  const chartNode = chart
    ? (() => {
      const w = 560, hgt = 168, pad = 26;
      const max = Math.max(1, ...chart.series.flatMap((s) => s.data));
      const groups = chart.labels.length;
      const gw = (w - pad * 2) / groups;
      const bw = Math.min(15, (gw - 6) / chart.series.length);
      const colors = ['hsl(var(--up))', 'hsl(var(--primary))', 'hsl(var(--accent))'];
      const bars = chart.labels.map((lab, i) => {
        const inner = chart.series.map((s, si) => {
          const v = s.data[i] ?? 0;
          const bh = (v / max) * (hgt - pad * 2);
          const x = pad + i * gw + gw / 2 - (chart.series.length * bw) / 2 + si * bw;
          return `<rect x="${x}" y="${hgt - pad - bh}" width="${bw - 2}" height="${Math.max(1, bh)}" rx="3" fill="${colors[si % colors.length]}"><title>${esc(s.name)} ${esc(lab)}: ${formatTokens(v)}</title></rect>`;
        }).join('');
        return `${inner}<text x="${pad + i * gw + gw / 2}" y="${hgt - pad + 14}" text-anchor="middle" font-size="10" style="fill:hsl(var(--muted-foreground))">${esc(lab)}</text>`;
      }).join('');
      const grid = [0, .5, 1].map((f) => {
        const y = pad + f * (hgt - pad * 2);
        return `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" style="stroke:hsl(var(--border))" stroke-dasharray="3 3"/>`;
      }).join('');
      const legend = chart.series.map((s, i) => `<rect x="${pad + i * 96}" y="4" width="9" height="9" rx="3" fill="${colors[i % colors.length]}"/><text x="${pad + i * 96 + 14}" y="12" font-size="10" style="fill:hsl(var(--muted-foreground))">${esc(s.name)}</text>`).join('');
      return `<svg viewBox="0 0 ${w} ${hgt}" class="chart" role="img" aria-label="Infographic chart">${legend}${grid}${bars}</svg>`;
    })()
    : null;

  return h('div', null,
    h('div', { class: 'mb-3' },
      h('div', { style: { fontSize: '17px', fontWeight: 750, letterSpacing: '-.02em' } }, p.title),
      h('div', { class: 'tiny muted' }, p.subtitle),
    ),
    chartNode ? h('div', { class: 'card', style: { padding: '12px', marginBottom: '14px' } }, h('div', { html: chartNode })) : null,
    h('div', { class: 'grid g-2' }, ...(p.sections ?? []).map((s, i) => h('div', { class: 'card card-pad' },
      h('div', { class: 'row', style: { alignItems: 'flex-start', gap: '10px' } },
        h('div', { style: { fontSize: '21px', fontWeight: 750, letterSpacing: '-.03em', color: (p.palette ?? [])[i % 4] ?? 'hsl(var(--primary))', lineHeight: 1.1, minWidth: '52px' } }, s.stat),
        h('div', { class: 'grow' },
          h('div', { style: { fontWeight: 650, fontSize: '12.8px' } }, s.heading),
          h('div', { class: 'tiny muted mt-1' }, s.body),
        ),
      ),
    ))),
    p.takeaway ? h('div', { class: 'banner banner-ok mt-3' }, ico('spark'), h('div', null, h('strong', null, 'Takeaway: '), p.takeaway)) : null,
  );
}

/* ---------------------------------------------------------------- mindmap */
export function mindmapView(p) {
  const nodes = p.nodes ?? [];
  const childrenOf = new Map();
  for (const n of nodes) {
    const k = n.parent ?? '__root__';
    if (!childrenOf.has(k)) childrenOf.set(k, []);
    childrenOf.get(k).push(n);
  }
  const root = nodes.find((n) => !n.parent) ?? nodes[0];
  const W = 720, H = 440;
  const cx = W / 2, cy = H / 2;

  const placed = new Map();
  placed.set(root.id, { x: cx, y: cy });
  const palette = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--up))', 'hsl(var(--info))', 'hsl(var(--warn))'];

  const l1 = childrenOf.get(root.id) ?? [];
  const R1 = 138, R2 = 262;
  l1.forEach((n, i) => {
    const a = -Math.PI / 2 + (i / l1.length) * Math.PI * 2;
    placed.set(n.id, { x: cx + R1 * Math.cos(a), y: cy + R1 * Math.sin(a), color: palette[i % palette.length] });
  });
  l1.forEach((n, i) => {
    const kids = childrenOf.get(n.id) ?? [];
    const base = -Math.PI / 2 + (i / l1.length) * Math.PI * 2;
    const span = (Math.PI * 2) / l1.length;
    kids.forEach((c, j) => {
      const a = base - span / 2.6 + (j / Math.max(1, kids.length - 1)) * (span / 1.3);
      placed.set(c.id, { x: cx + R2 * Math.cos(a), y: cy + R2 * Math.sin(a), color: palette[i % palette.length] });
    });
  });
  // anything unplaced (deeper levels) — ring them outward
  let ring = R2 + 92;
  for (const n of nodes) {
    if (!placed.has(n.id)) {
      const a = Math.random() * Math.PI * 2;
      placed.set(n.id, { x: cx + ring * Math.cos(a), y: cy + ring * Math.sin(a), color: 'hsl(var(--muted-foreground))' });
    }
  }

  const edges = nodes.filter((n) => n.parent).map((n) => {
    const a = placed.get(n.parent), b = placed.get(n.id);
    if (!a || !b) return '';
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    return `<path d="M${a.x},${a.y} Q${mx},${a.y} ${b.x},${b.y}" fill="none" style="stroke:${b.color ?? 'hsl(var(--border-strong))'}" stroke-width="1.4" opacity=".55"/>`;
  }).join('');

  const nodeSvg = nodes.map((n) => {
    const q = placed.get(n.id);
    if (!q) return '';
    const isRoot = !n.parent;
    const label = String(n.label ?? '');
    const w = Math.max(isRoot ? 118 : 84, Math.min(190, label.length * 6.2 + 20));
    const color = q.color ?? 'hsl(var(--primary))';
    return `<g class="flow-node"><title>${esc(label)}</title>
      <rect x="${q.x - w / 2}" y="${q.y - (isRoot ? 19 : 13)}" width="${w}" height="${isRoot ? 38 : 26}" rx="${isRoot ? 12 : 9}"
        style="fill:${isRoot ? 'hsl(var(--surface))' : 'hsl(var(--surface-raised))'}" stroke="${color}" stroke-width="${isRoot ? 2 : 1.3}"/>
      <text x="${q.x}" y="${q.y + (isRoot ? 5 : 4)}" text-anchor="middle" font-size="${isRoot ? 13 : 10.5}" font-weight="${isRoot ? 700 : 550}" style="fill:hsl(var(--foreground))">${esc(label.slice(0, 26))}</text>
    </g>`;
  }).join('');

  return h('div', null,
    h('div', { class: 'card', style: { padding: '8px', overflow: 'hidden' } },
      h('div', { html: `<svg viewBox="0 0 ${W} ${H}" class="flow-canvas" role="img" aria-label="Mind map">${edges}${nodeSvg}</svg>` }),
    ),
    h('div', { class: 'row-wrap mt-3' }, ...l1.map((n, i) =>
      h('span', { class: 'chip' },
        h('span', { style: { width: '8px', height: '8px', borderRadius: '99px', background: palette[i % palette.length] } }),
        n.label,
        h('span', { class: 'tiny muted nums' }, String((childrenOf.get(n.id) ?? []).length)),
      ))),
  );
}

/* ========================================================================== */
/*  Interactive: quiz player                                                  */
/* ========================================================================== */
export function quizView(p) {
  const qs = p.questions ?? [];
  const state = { i: 0, chosen: null, answers: [], done: false };

  const host = h('div');
  const head = h('div', { class: 'row-wrap mb-3' });
  const prog = h('div', { class: 'quiz-progress mb-3' }, h('i', { style: { width: '0%' } }));
  const body = h('div');

  const paint = () => {
    if (state.done) {
      const score = state.answers.reduce((n, a) => n + (a.correct ? a.points : 0), 0);
      const max = qs.reduce((n, q) => n + (q.points ?? 1), 0);
      const pct = Math.round((score / Math.max(1, max)) * 100);
      head.replaceChildren(
        h('span', { style: { fontWeight: 700, fontSize: '14px' } }, p.title),
        h('span', { class: 'pill p-gl' }, String(p.level ?? '').toUpperCase()),
      );
      prog.firstChild.style.width = '100%';
      body.replaceChildren(h('div', { class: 'center', style: { padding: '22px 0' } },
        h('div', { style: { fontSize: '40px', fontWeight: 750, letterSpacing: '-.04em', color: pct >= 70 ? 'hsl(var(--up))' : pct >= 40 ? 'hsl(var(--warn))' : 'hsl(var(--down))' } }, `${pct}%`),
        h('div', { style: { fontWeight: 650, fontSize: '13.5px' } }, `${score} of ${max} points`),
        h('div', { class: 'tiny muted mt-1' }, `${state.answers.filter((a) => a.correct).length} of ${qs.length} correct`),
        h('div', { class: 'mt-4' }, h('button', {
          class: 'btn btn-primary',
          onclick: () => { state.i = 0; state.chosen = null; state.answers = []; state.done = false; paint(); },
        }, ico('refresh', 'ic'), 'Try again')),
        h('div', { class: 'mt-4', style: { maxWidth: '520px', margin: '16px auto 0', textAlign: 'left' } },
          ...state.answers.map((a, i) => h('div', { class: 'row', style: { gap: '8px', padding: '5px 0', fontSize: '12.5px', borderBottom: '1px solid hsl(var(--border))' } },
            h('span', { class: a.correct ? 'opt-correct-mark' : 'opt-wrong-mark' }, a.correct ? '✓' : '✗'),
            h('span', { class: 'grow' }, `Q${i + 1}. ${qs[i].question.slice(0, 74)}${qs[i].question.length > 74 ? '…' : ''}`),
            h('span', { class: 'tiny muted nums' }, `${a.correct ? a.points : 0}/${qs[i].points ?? 1}`),
          )),
        ),
      ));
      return;
    }

    const q = qs[state.i];
    head.replaceChildren(
      h('span', { style: { fontWeight: 700, fontSize: '14px' } }, p.title),
      h('span', { class: 'pill p-gl' }, String(p.level ?? '').toUpperCase()),
      h('span', { class: `pill ${q.difficulty === 'hard' ? 'p-prem' : q.difficulty === 'medium' ? 'p-cheap' : 'p-free'}` }, String(q.difficulty ?? 'easy').toUpperCase()),
      h('div', { class: 'grow' }),
      h('span', { class: 'tiny muted nums' }, `Question ${state.i + 1} of ${qs.length}`),
    );
    prog.firstChild.style.width = `${(state.i / qs.length) * 100}%`;

    const locked = state.chosen !== null;
    const opts = (q.options ?? []).map((o, oi) => {
      let cls = 'quiz-opt';
      if (locked) {
        if (oi === q.answer_index) cls += ' correct';
        else if (oi === state.chosen) cls += ' wrong';
      }
      return h('button', {
        class: cls, disabled: locked,
        onclick: () => {
          state.chosen = oi;
          state.answers.push({ correct: oi === q.answer_index, points: q.points ?? 1 });
          paint();
        },
      },
        h('span', { class: 'key' }, String.fromCharCode(65 + oi)),
        h('span', { class: 'grow' }, o),
        locked && oi === q.answer_index ? h('span', { html: icon('check'), style: { display: 'inline-flex', color: 'hsl(var(--up))' } }) : null,
        locked && oi === state.chosen && oi !== q.answer_index ? h('span', { html: icon('x'), style: { display: 'inline-flex', color: 'hsl(var(--down))' } }) : null,
      );
    });

    body.replaceChildren(
      h('div', { class: 'row mb-3', style: { gap: '9px', alignItems: 'flex-start' } },
        h('span', { class: 'avatar' }, ico('book', 'ic')),
        h('div', { class: 'grow' },
          h('div', { class: 'quiz-q' }, q.question),
          q.image_prompt ? h('div', { class: 'tiny muted mt-1', style: { fontStyle: 'italic' } }, `Illustration: ${q.image_prompt}`) : null,
        ),
      ),
      h('div', { class: 'quiz-opts' }, ...opts),
      locked ? h('div', { class: 'mt-3' },
        h('div', { class: 'quiz-explain' }, h('strong', null, 'Why: '), q.explanation),
        h('div', { class: 'row mt-3' },
          h('span', { class: 'tiny muted' }, `${q.points ?? 1} point${(q.points ?? 1) === 1 ? '' : 's'}`),
          h('div', { class: 'grow' }),
          h('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => { state.i++; state.chosen = null; if (state.i >= qs.length) state.done = true; paint(); },
          }, state.i === qs.length - 1 ? 'See results' : 'Next question', ico('arrow', 'ic')),
        ),
      ) : null,
    );
  };

  paint();
  host.append(head, prog, body);
  return host;
}

/* ========================================================================== */
/*  Interactive: sandboxed game                                               */
/* ========================================================================== */
export function gameView(p) {
  const frame = h('iframe', {
    sandbox: 'allow-scripts',        // deliberately NO allow-same-origin
    srcdoc: p.html ?? '<!doctype html><body style="font-family:system-ui;padding:24px">No game payload.</body>',
    title: p.title ?? 'Generated game',
  });

  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { style: { fontWeight: 700, fontSize: '14px' } }, p.title),
      h('span', { class: 'pill p-free' }, 'SANDBOXED'),
      h('div', { class: 'grow' }),
      h('button', {
        class: 'btn btn-sm',
        onclick: () => { const f = frame; f.srcdoc = ''; requestAnimationFrame(() => { f.srcdoc = p.html ?? ''; }); toast('Game restarted', 'ok'); },
      }, ico('refresh', 'ic'), 'Restart'),
      h('button', { class: 'btn btn-sm btn-ghost', onclick: () => copy(p.html ?? '', 'Game HTML copied') }, ico('copy', 'ic'), 'Copy HTML'),
    ),
    h('div', { class: 'game-frame' }, frame),
    h('div', { class: 'grid g-2 mt-3' },
      h('div', null, section('Learning objectives', bullets(p.learning_objectives ?? [], { mark: 'check' }))),
      h('div', null,
        section('Mechanics', h('div', { class: 'tiny muted' }, p.mechanics)),
        h('div', { class: 'mt-2' }, section('Controls', h('div', { class: 'tiny muted mono' }, p.controls))),
      ),
    ),
    h('div', { class: 'banner mt-3' }, ico('shield'),
      h('div', { class: 'tiny' },
        h('strong', null, 'Isolation: '),
        'this frame runs with ', h('code', null, 'sandbox="allow-scripts"'), ' and no ', h('code', null, 'allow-same-origin'),
        ', so generated code cannot read your localStorage, cookies or the OpenRouter key you pasted. Same model as the Docker sandbox on the server side: no network, read-only root, dropped capabilities.',
      ),
    ),
  );
}

/* ------------------------------------------------------------------ deploy */
export function deployView(p) {
  return h('div', null,
    h('div', { class: 'row-wrap mb-3' },
      h('span', { class: 'pill p-cheap' }, `TARGET: ${String(p.target ?? 'docker').toUpperCase()}`),
      h('span', { class: 'tiny muted' }, `${p.ci_steps?.length ?? 0} CI steps`),
    ),
    section('Dockerfile', codeBlock(p.dockerfile, 'Dockerfile')),
    p.compose_service ? h('div', { class: 'mt-3' }, section('Compose service', codeBlock(p.compose_service, 'docker-compose.yml'))) : null,
    p.env_vars?.length ? h('div', { class: 'mt-3' }, section('Environment',
      h('div', { class: 'table-wrap' }, h('table', { class: 'tbl tbl-tight' },
        h('thead', null, h('tr', null, h('th', null, 'Key'), h('th', null, 'Required'), h('th', null, 'Description'))),
        h('tbody', null, ...p.env_vars.map((e) => h('tr', null,
          h('td', { class: 'mono' }, e.key),
          h('td', null, e.required ? h('span', { class: 'pill p-prem' }, 'YES') : h('span', { class: 'pill p-gl' }, 'no')),
          h('td', { class: 'tiny muted' }, e.description),
        ))),
      )),
    )) : null,
    p.ci_steps?.length ? h('div', { class: 'mt-3' }, section('CI pipeline',
      h('div', { class: 'ladder' }, ...p.ci_steps.map((s, i) => h('div', { class: 'rung' },
        h('div', { class: 'rung-ic' }, String(i + 1)),
        h('div', { class: 'grow mono tiny' }, s),
        h('span', { html: icon('check'), style: { display: 'inline-flex', color: 'hsl(var(--up))' } }),
      ))),
    )) : null,
    h('div', { class: 'grid g-2 mt-3' },
      h('div', null, section('Healthcheck', h('div', { class: 'code' }, p.healthcheck ?? '—'))),
      h('div', null, section('Rollback', h('div', { class: 'tiny muted' }, p.rollback ?? '—'))),
    ),
  );
}

/* -------------------------------------------------------------------- prose */
export function proseView(text) {
  return h('div', { class: 'msg-body', style: { border: '1px solid hsl(var(--border))' } },
    h('div', { html: markdown(text) }));
}

/* ========================================================================== */
/*  Dispatch                                                                  */
/* ========================================================================== */
const DISPATCH = {
  orchestrator: planView, coder: codeView, designer: designView, researcher: researchView,
  writer: writerView, qa: qaView, automation: automationView, creative: imageView,
  tutor: quizView, deploy: deployView,
};

/**
 * Register domain-specific renderers without creating an import cycle.
 * The KSSR edition calls this at boot to map its education agents
 * (rph, dskp, pbd, bbm, panitia, bahasa, admin) onto their own views.
 * @param {Record<string, (parsed:object)=>Node>} map
 */
export function registerViews(map) {
  Object.assign(DISPATCH, map);
}

/**
 * Render an agent result.
 * @param {string} agentKey
 * @param {{parsed:object|null, text:string, subtype?:string}} result
 */
export function renderOutput(agentKey, result) {
  if (!result.parsed) return proseView(result.text ?? '');

  // Creative sub-types share the `creative` agent key.
  if (agentKey === 'creative' && result.subtype) {
    const map = { video: videoView, infographic: infographicView, mindmap: mindmapView, image: imageView };
    const fn = map[result.subtype];
    if (fn) return fn(result.parsed);
  }
  if (agentKey === 'tutor' && result.subtype === 'game') return gameView(result.parsed);

  const fn = DISPATCH[agentKey];
  if (!fn) return proseView(result.text ?? '');
  try { return fn(result.parsed); } catch (err) {
    return h('div', null,
      h('div', { class: 'banner banner-warn mb-3' }, ico('warn'), h('div', null, `Renderer failed (${err.message}) — showing raw output.`)),
      proseView(result.text ?? ''),
    );
  }
}

export { codeBlock, section, bullets, fileTabs, ico };

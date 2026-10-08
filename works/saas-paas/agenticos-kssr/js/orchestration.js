/**
 * Simulasi Orkestrasi Agentik — the graph runner, visualised.
 *
 * Everywhere else in this app you see one routing decision at a time. An
 * orchestration is what happens when you have twenty of them, wired together,
 * triggered by something external, with branches and retries in between. That
 * is the part of an "agentic OS" that is genuinely hard to explain in prose, so
 * this page draws it and then walks it, node by node.
 *
 * Two things here are *real*, not mocked:
 *
 *   1. Every agent node asks the live ModelRouter which model it would use
 *      (`ctx.router.decide`). Change a capability filter on the Model Router
 *      page and the node labels here change with it, because it is the same
 *      object.
 *   2. The retry ladder on each node is the router's own fallback ladder. When a
 *      node shows "rung 1 → 429, rung 2 → ok", that is the real ordered
 *      candidate list for that task, walked in order.
 *
 * The timings, token counts and the one deliberate webhook failure are
 * simulated, because there is no network in the browser demo. Everything else
 * is the real thing.
 */

import { h, esc } from './ui.js';
import {
  pageHead, card, ico, icon, copy, toast, tierBadge, traceLadder,
  formatTokens, formatUSD, CATALOG, blendedCost, isFree, TASK_LABELS,
} from './components.js';
import { AGENTS } from './catalog.js';

/* ========================================================================== */
/*  Node vocabulary                                                           */
/* ========================================================================== */

const ORCH_KINDS = {
  trigger:   { label: 'PENCETUS', ic: 'bolt',   tone: 'gold' },
  agent:     { label: 'AGEN',     ic: 'brain',  tone: 'primary' },
  condition: { label: 'SYARAT',   ic: 'route',  tone: 'info' },
  join:      { label: 'GABUNG',   ic: 'layers', tone: 'accent' },
  webhook:   { label: 'WEBHOOK',  ic: 'ext',    tone: 'gold' },
  email:     { label: 'E-MEL',    ic: 'cloud',  tone: 'accent' },
  store:     { label: 'SIMPANAN', ic: 'db',     tone: 'info' },
};

/** Icons for the KSSR agents, so a node reads as "who" before "what". */
const ORCH_AGENT_ICONS = {
  rph: 'book', dskp: 'layers', pbd: 'chart', bbm: 'brush',
  panitia: 'users', bahasa: 'globe', admin: 'grid', orkestra: 'flow',
  orchestrator: 'grid', coder: 'code', designer: 'brush', researcher: 'eye',
  writer: 'file', qa: 'shield', automation: 'flow', creative: 'spark',
  tutor: 'users', deploy: 'rocket', swarm: 'spark', longctx: 'layers', mimo: 'code',
};

/* ========================================================================== */
/*  Triggers                                                                  */
/* ========================================================================== */

/**
 * Five trigger types, each with the headers and body a receiver would actually
 * see. `sign` marks the ones that carry an HMAC over the raw body — the thing
 * that stops anyone who guesses the URL from firing your pipeline.
 */
const ORCH_TRIGGERS = {
  webhook: {
    label: 'Webhook', ic: 'bolt', method: 'POST',
    target: 'https://hooks.agentic-os.my/v1/rph-request',
    hint: 'Sistem luar (borang, aplikasi sekolah) menghantar permintaan HTTP. Badan permintaan ditandatangani HMAC-SHA256.',
    headers: {
      'Content-Type': 'application/json',
      'X-AgenticOS-Event': 'rph.request',
      'X-AgenticOS-Delivery': 'dlv_7c1a94',
      'X-AgenticOS-Signature': 'sha256=…',
      'User-Agent': 'BoranganGuru/2.4 (+https://moe-dl.edu.my)',
    },
    body: {
      event: 'rph.request',
      id: 'evt_8f31c2a4',
      submitted_at: '2026-10-07T08:12:04+08:00',
      guru: { nama: 'Pn. Nurul Aina', emel: 'nurul.aina@moe-dl.edu.my', sekolah: 'SK Taman Desa' },
      permintaan: {
        mata_pelajaran: 'Bahasa Melayu',
        tahun: 'Tahun 3',
        kelas: '3 Bestari',
        tajuk: 'Kata Nama Am dan Kata Nama Khas',
        standard_pembelajaran: [
          'SP 5.1.1 — Mengenal pasti kata nama am',
          'SP 5.1.2 — Menggunakan kata nama khas dalam ayat',
        ],
        masa: '8.10 – 9.10 pagi (60 minit)',
        emk: ['Nilai Murni', 'Kemahiran Abad ke-21'],
        kbat: 'Mengaplikasi',
      },
    },
  },
  cron: {
    label: 'Jadual (cron)', ic: 'clock', method: 'TICK',
    target: 'jadual: 0 7 * * 1  ·  Isnin 7:00 pagi',
    hint: 'Tiada permintaan masuk. Jam platform yang mencetuskan aliran pada jadual yang ditetapkan — inilah pencetus yang paling murah dan paling boleh dijangka.',
    headers: {
      'X-AgenticOS-Trigger': 'cron',
      'X-AgenticOS-Schedule': '0 7 * * 1',
      'X-AgenticOS-Fire-Time': '2026-10-12T07:00:00+08:00',
      'X-AgenticOS-Misfire-Policy': 'fire_once',
    },
    body: {
      event: 'schedule.tick',
      id: 'evt_cron_20261012',
      zon_masa: 'Asia/Kuala_Lumpur',
      minggu: 'Minggu 42 · 2026',
      konteks: {
        sekolah: 'SK Taman Desa',
        panitia: 'Bahasa Melayu',
        sesi: '2026/2027',
        tugasan: ['analisis item PBD', 'laporan panitia', 'BBM minggu hadapan'],
      },
    },
  },
  email: {
    label: 'E-mel masuk', ic: 'cloud', method: 'IMAP',
    target: 'peti: panitia-bm@moe-dl.edu.my  ·  folder: INBOX/Panitia',
    hint: 'Aliran dicetuskan apabila e-mel memenuhi penapis. Lampiran PDF/DSKP dibaca terus sebagai konteks.',
    headers: {
      'X-AgenticOS-Trigger': 'email',
      'X-AgenticOS-Filter': 'to:panitia-bm@ AND has:attachment',
      'X-AgenticOS-Folder': 'INBOX/Panitia',
      'X-AgenticOS-Uid': '48211',
    },
    body: {
      event: 'email.received',
      id: 'evt_mail_48211',
      dari: 'ketua.panitia@moe-dl.edu.my',
      subjek: 'Minta ringkasan pencapaian PBD BM Tahun 3',
      lampiran: [{ nama: 'analisis-item-ogos.pdf', saiz_kb: 812, mime: 'application/pdf' }],
      kandungan_pendek: 'Assalamualaikum, boleh sediakan ringkasan TP1–TP6 untuk mesyuarat Khamis?',
    },
  },
  chat: {
    label: 'Sembang (chat)', ic: 'users', method: 'MESSAGE',
    target: 'kumpulan WhatsApp: "Panitia BM SK Taman Desa"',
    hint: 'Guru bertanya dalam kumpulan. Agen menjawab di dalam kumpulan yang sama — konteks perbualan menjadi konteks aliran.',
    headers: {
      'X-AgenticOS-Trigger': 'chat',
      'X-AgenticOS-Channel': 'whatsapp',
      'X-AgenticOS-Thread': 'thr_9d02f1',
      'X-AgenticOS-Sender': '60123456789',
    },
    body: {
      event: 'chat.message',
      id: 'evt_chat_9d02f1',
      penghantar: 'Pn. Nurul Aina',
      mesej: 'Cikgu, SP 5.1.1 tu apa ya? Nak tulis dalam RPH.',
      konteks: { kumpulan: 'Panitia BM', ahli: 12, mesej_terakhir: 4 },
    },
  },
  file: {
    label: 'Fail (Drive)', ic: 'file', method: 'WATCH',
    target: 'folder: Shared/DSKP-2026  ·  jenis: application/pdf',
    hint: 'Fail baharu dalam folder yang dipantau mencetuskan aliran. Sesuai untuk DSKP, surat siaran dan jadual waktu.',
    headers: {
      'X-AgenticOS-Trigger': 'file',
      'X-AgenticOS-Folder-Id': '1Kq7…DSKP2026',
      'X-AgenticOS-Mime': 'application/pdf',
      'X-AgenticOS-Revision': 'rev_55',
    },
    body: {
      event: 'file.created',
      id: 'evt_file_55',
      nama: 'DSKP-BM-Tahun-3-Semakan-2017.pdf',
      saiz_mb: 4.6,
      halaman: 214,
      dipantau_oleh: 'panitia-bm@moe-dl.edu.my',
    },
  },
};

/* ========================================================================== */
/*  Scenarios                                                                 */
/* ========================================================================== */

/**
 * Each scenario is a small DAG. `col`/`row` are grid coordinates — the canvas
 * turns them into pixels, so the layout survives a resize without any
 * measurement code.
 *
 * Node fields:
 *   dep      node ids that must finish first (this is what makes a wave)
 *   branch   only on `condition` nodes: which dependents run, which are skipped
 *   flaky    how many rungs of the ladder fail with 429 before one answers
 *   retry    outbound delivery: attempts before the 2xx
 *   pt / ct  simulated prompt and completion tokens, for the cost figure
 */
const ORCH_SCENARIOS = [
  {
    id: 'rph-webhook',
    name: 'RPH automatik dari borang guru',
    tag: 'WEBHOOK',
    trigger: 'webhook',
    goal: 'Borang guru dihantar → RPH penuh dijana, DSKP dipetakan, item PBD disediakan, kemudian dihantar ke panitia dan ke sistem sekolah.',
    why: 'Kerja yang paling banyak menyita masa guru selepas waktu mengajar. Empat dokumen daripada satu penghantaran borang.',
    nodes: [
      { id: 't', col: 0, row: 1, kind: 'trigger', name: 'Webhook masuk', sub: 'rph.request' },
      { id: 'a', col: 1, row: 1, kind: 'agent', agent: 'admin', task: 'classify', name: 'Sahkan permintaan', sub: 'Agen Pentadbiran', dep: ['t'], pt: 900, ct: 260, note: 'Menapis permintaan tidak lengkap sebelum sebarang panggilan model yang mahal.' },
      { id: 'b', col: 2, row: 0, kind: 'agent', agent: 'rph', task: 'writing', name: 'Jana RPH penuh', sub: 'Agen RPH', dep: ['a'], pt: 2400, ct: 3100, flaky: 1, note: 'Rujuk rung pertama pada tangga — ini yang berlaku apabila titik akhir percuma sedang sibuk.' },
      { id: 'c', col: 2, row: 1, kind: 'agent', agent: 'dskp', task: 'summarise', name: 'Petakan DSKP', sub: 'Agen DSKP', dep: ['a'], pt: 1800, ct: 1400, note: 'Satu bacaan dokumen penuh — di sinilah tetingkap konteks 1M bermakna.' },
      { id: 'd', col: 2, row: 2, kind: 'agent', agent: 'pbd', task: 'qa', name: 'Item & deskriptor PBD', sub: 'Agen Pentaksiran', dep: ['a'], pt: 2100, ct: 1900, note: 'Item pentaksiran dan deskriptor TP1–TP6 yang selari dengan standard yang sama.' },
      { id: 'e', col: 3, row: 1, kind: 'join', agent: 'orkestra', task: 'agentic', name: 'Gabung & semak', sub: 'Agen Orkestrasi', dep: ['b', 'c', 'd'], pt: 4200, ct: 1200, note: 'Menggabungkan tiga keluaran dan menyemak percanggahan standard antara dokumen.' },
      { id: 'f', col: 4, row: 0, kind: 'webhook', name: 'Webhook keluar', sub: 'sistem sekolah', dep: ['e'], retry: 1, note: 'Hantaran keluar dengan cubaan semula eksponen apabila penerima pulangkan 503.' },
      { id: 'g', col: 4, row: 2, kind: 'email', name: 'E-mel ke panitia', sub: 'smtp · 2 penerima', dep: ['e'], note: 'Salinan PDF dilampirkan untuk rekod fail panitia.' },
    ],
  },
  {
    id: 'panitia-cron',
    name: 'Laporan panitia mingguan',
    tag: 'CRON',
    trigger: 'cron',
    goal: 'Setiap Isnin 7 pagi: kumpul data panitia, analisis item, jana laporan dan BBM minggu itu, semak, kemudian simpan dan hantar ke PPD.',
    why: 'Kerja berjadual yang tidak sepatutnya menunggu mesyuarat. Tiada pencetus luar — jam platform sudah cukup.',
    nodes: [
      { id: 't', col: 0, row: 1, kind: 'trigger', name: 'Jadual Isnin 7:00', sub: '0 7 * * 1' },
      { id: 'a', col: 1, row: 1, kind: 'agent', agent: 'admin', task: 'classify', name: 'Kumpul data panitia', sub: 'Agen Pentadbiran', dep: ['t'], pt: 1100, ct: 300, note: 'Menarik APDM/EMIS dan markah PBD, kemudian menormalkan format.' },
      { id: 'b', col: 2, row: 0, kind: 'agent', agent: 'pbd', task: 'qa', name: 'Analisis item', sub: 'Agen Pentaksiran', dep: ['a'], pt: 2600, ct: 2200, note: 'Mengira penguasaan TP1–TP6 dan mengenal pasti item bermasalah.' },
      { id: 'c', col: 2, row: 1, kind: 'agent', agent: 'panitia', task: 'automation', name: 'Jana laporan panitia', sub: 'Agen Panitia', dep: ['a'], pt: 3200, ct: 3600, flaky: 1, note: 'RPT, minit dan analisis dalam satu dokumen mengikut format PPD.' },
      { id: 'd', col: 2, row: 2, kind: 'agent', agent: 'bbm', task: 'design', name: 'Jana BBM minggu hadapan', sub: 'Agen BBM', dep: ['a'], pt: 1900, ct: 2400, note: 'Bahan bantu mengajar yang boleh terus dicetak.' },
      { id: 'e', col: 3, row: 1, kind: 'join', agent: 'orkestra', task: 'agentic', name: 'Semak & sedia tandatangan', sub: 'Agen Orkestrasi', dep: ['b', 'c', 'd'], pt: 4600, ct: 1100, note: 'Semakan akhir: nombor dalam laporan mesti sepadan dengan analisis item.' },
      { id: 'f', col: 4, row: 0, kind: 'store', name: 'Simpan ke Google Drive', sub: 'Shared/Panitia/2026', dep: ['e'], note: 'Salinan arkib dengan nama fail berjadual.' },
      { id: 'g', col: 4, row: 2, kind: 'webhook', name: 'Hantar ke PPD', sub: 'sistem PPD', dep: ['e'], retry: 2, note: 'Dua cubaan semula sebelum menanda aliran sebagai gagal.' },
    ],
  },
  {
    id: 'chat-dskp',
    name: 'Soal jawab DSKP dalam kumpulan WhatsApp',
    tag: 'CHAT',
    trigger: 'chat',
    goal: 'Guru bertanya dalam kumpulan panitia. Aliran mengklasifikasikan niat, mengambil laluan DSKP penuh jika berkaitan, dan menjawab dalam kumpulan yang sama.',
    why: 'Aliran yang bercabang. Nod syarat di tengah-tengah inilah yang membezakan orkestrasi daripada sekadar rantaian panggilan.',
    nodes: [
      { id: 't', col: 0, row: 1, kind: 'trigger', name: 'Mesej WhatsApp', sub: 'kumpulan Panitia BM' },
      { id: 'a', col: 1, row: 1, kind: 'agent', agent: 'admin', task: 'classify', name: 'Klasifikasi niat', sub: 'Agen Pentadbiran', dep: ['t'], pt: 600, ct: 180, note: 'Model kecil sudah cukup — tugas ini tidak patut menaiki tangga yang mahal.' },
      { id: 'b', col: 2, row: 1, kind: 'condition', name: 'Niat = rujukan DSKP?', sub: 'laluan bercabang', dep: ['a'], branch: { take: ['c'], skip: ['d'] }, note: 'Cabang yang tidak diambil ditanda sebagai dilangkau, bukan gagal.' },
      { id: 'c', col: 3, row: 0, kind: 'agent', agent: 'dskp', task: 'summarise', name: 'Cari dalam DSKP penuh', sub: 'Agen DSKP', dep: ['b'], pt: 5200, ct: 900, note: 'Seluruh dokumen DSKP dimuatkan sekali — hanya mungkin dengan konteks 1M.' },
      { id: 'd', col: 3, row: 2, kind: 'agent', agent: 'rph', task: 'writing', name: 'Jawab daripada pengetahuan am', sub: 'Agen RPH', dep: ['b'], pt: 1200, ct: 800, note: 'Laluan sandaran untuk soalan yang bukan rujukan DSKP.' },
      { id: 'e', col: 4, row: 1, kind: 'join', agent: 'orkestra', task: 'agentic', name: 'Gabung jawapan', sub: 'Agen Orkestrasi', dep: ['c', 'd'], pt: 2600, ct: 700, note: 'Memilih laluan yang benar-benar selesai dan merumus jawapan pendek.' },
      { id: 'f', col: 5, row: 1, kind: 'webhook', name: 'Balas ke WhatsApp', sub: 'thread yang sama', dep: ['e'], retry: 1, note: 'Balasan keluar ke benang yang mencetuskan aliran.' },
    ],
  },
];

/* ========================================================================== */
/*  Small helpers                                                             */
/* ========================================================================== */

const orchSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const orchRand = (min, max) => min + Math.random() * (max - min);

/** Stable pseudo-signature so the inspector does not flicker between renders. */
function orchSignature(seed) {
  let h1 = 0x811c9dc5;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  let out = '';
  let x = h1;
  for (let i = 0; i < 8; i++) {
    x = (Math.imul(x, 0x9e3779b1) + 0x85ebca6b) >>> 0;
    out += x.toString(16).padStart(8, '0');
  }
  return `sha256=${out.slice(0, 40)}`;
}

/** Depth of a node in the graph, for the "gelombang" counter. */
function orchDepths(nodes) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const memo = new Map();
  const walk = (n, seen) => {
    if (memo.has(n.id)) return memo.get(n.id);
    if (seen.has(n.id)) return 0;
    seen.add(n.id);
    const deps = n.dep ?? [];
    const d = deps.length ? Math.max(...deps.map((x) => (byId[x] ? walk(byId[x], seen) : 0))) + 1 : 0;
    memo.set(n.id, d);
    return d;
  };
  for (const n of nodes) walk(n, new Set());
  return memo;
}

/** Pretty-print JSON without exploding on undefined. */
const orchJson = (v) => JSON.stringify(v ?? null, null, 2);

/**
 * Inline icon with hard-coded dimensions.
 *
 * `icon()` returns an `<svg>` with a viewBox but no width/height, and a nested
 * `<svg>` with no dimensions stretches to fill its viewport — which would blow
 * every node's bounding box up to the size of the whole canvas. The attributes
 * are therefore set here rather than left to CSS, so the geometry is correct
 * even before the stylesheet loads.
 */
function orchIcon(name, size = 15, cls = 'ic orch-ic') {
  return icon(name, cls).replace('<svg ', `<svg width="${size}" height="${size}" `);
}

/* ========================================================================== */
/*  The page                                                                  */
/* ========================================================================== */

export function orchestrationPage(ctx) {
  /* ------------------------------------------------------------- state --- */
  const state = {
    scenarioId: ORCH_SCENARIOS[0].id,
    triggerType: null,           // null → scenario default
    speed: 1,
    mode: 'auto',                // 'auto' | 'step'
    nodeState: {},               // id → idle | running | ok | failed | skipped
    nodeResult: {},              // id → { model, ladder, pt, ct, cost, ms, retryNote }
    events: [],
    running: false,
    token: 0,                    // invalidates an in-flight run
    fired: false,                // has the trigger fired at least once
    totals: { nodes: 0, tokens: 0, cost: 0, ms: 0, retries: 0, fallbacks: 0 },
    selected: null,
  };

  const scenario = () => ORCH_SCENARIOS.find((s) => s.id === state.scenarioId) ?? ORCH_SCENARIOS[0];
  const triggerOf = () => ORCH_TRIGGERS[state.triggerType ?? scenario().trigger];

  /* ------------------------------------------------------------- hosts --- */
  const canvasHost = h('div', { class: 'orch-canvas-host' });
  const logHost = h('div', { class: 'orch-log', id: 'orchLog' });
  const triggerHost = h('div');
  const hookInHost = h('div');
  const hookOutHost = h('div');
  const metricsHost = h('div');
  const inspectorHost = h('div');
  const statusHost = h('div');
  const controlsHost = h('div');

  /* -------------------------------------------------------- graph layout -- */
  /* Column/row pitch and node size. Sized so the widest scenario (six
     columns) still renders at roughly 1:1 inside a full-width card on a
     1440px display — any shrinking makes the 10px node labels unreadable. */
  const GEO = { colW: 172, rowH: 88, nodeW: 156, nodeH: 64, padX: 18, padY: 18 };

  function nodePos(n) {
    return {
      x: GEO.padX + n.col * GEO.colW,
      y: GEO.padY + n.row * GEO.rowH,
      w: GEO.nodeW,
      h: GEO.nodeH,
    };
  }

  /** Cubic bezier from the right edge of `a` to the left edge of `b`. */
  function edgePath(a, b) {
    const pa = nodePos(a), pb = nodePos(b);
    const x1 = pa.x + pa.w, y1 = pa.y + pa.h / 2;
    const x2 = pb.x, y2 = pb.y + pb.h / 2;
    const dx = Math.max(34, Math.abs(x2 - x1) * 0.55);
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  }

  function edgesOf(sc) {
    const byId = Object.fromEntries(sc.nodes.map((n) => [n.id, n]));
    const out = [];
    for (const n of sc.nodes) {
      for (const d of n.dep ?? []) {
        if (byId[d]) out.push({ from: byId[d], to: n });
      }
    }
    return out;
  }

  /* ------------------------------------------------------------- status -- */
  /**
   * The sub-label under a node name.
   *
   * Before a run this is the model the router *would* pick — the same
   * `decide()` call the Model Router page makes, memoised because it runs for
   * every node on every repaint. After a run it is the model that actually
   * answered, which is not always the same one: the free rung is tried first
   * and sometimes 429s.
   */
  const routeMemo = new Map();
  function routerPick(task) {
    if (routeMemo.has(task)) return routeMemo.get(task);
    let pick = null;
    try {
      pick = ctx.router.decide({ task, requireTools: true }).candidates[0] ?? null;
    } catch {
      pick = null;
    }
    routeMemo.set(task, pick);
    return pick;
  }

  function nodeLabel(n) {
    if (n.kind !== 'agent' && n.kind !== 'join') return n.sub ?? ORCH_KINDS[n.kind].label;
    const r = state.nodeResult[n.id];
    if (r?.model) return CATALOG[r.model]?.display_name ?? r.model;
    const agent = AGENTS.find((a) => a.key === n.agent);
    const task = n.task ?? agent?.task ?? 'chat';
    const spec = CATALOG[routerPick(task)] ?? (agent ? CATALOG[agent.model] : null);
    return spec ? spec.display_name : (agent?.name ?? n.sub ?? '');
  }

  /** The model a node will use, or the one it used — shown under the name. */
  function nodeSubLabel(n) {
    const r = state.nodeResult[n.id];
    if (n.kind === 'trigger') return `${ORCH_KINDS.trigger.label} · ${triggerOf().method}`;
    if (n.kind === 'condition') return 'laluan bercabang';
    if (n.kind === 'webhook') return r ? `cubaan ${r.retryNote ?? 1} · ${r.status === 'failed' ? 'gagal' : '200 OK'}` : (n.sub ?? 'hantaran keluar');
    if (n.kind === 'email') return n.sub ?? 'e-mel';
    if (n.kind === 'store') return n.sub ?? 'simpanan';
    if (r?.model) return `${nodeLabel(n)}${r.rung > 1 ? ` · tingkat ${r.rung}` : ''}`;
    return nodeLabel(n);
  }

  function nodeStateOf(id) { return state.nodeState[id] ?? 'idle'; }

  /* --------------------------------------------------------------- SVG --- */
  function paintCanvas() {
    const sc = scenario();
    const edges = edgesOf(sc);
    const maxCol = Math.max(...sc.nodes.map((n) => n.col));
    const maxRow = Math.max(...sc.nodes.map((n) => n.row));
    const W = GEO.padX * 2 + maxCol * GEO.colW + GEO.nodeW;
    const H = GEO.padY * 2 + maxRow * GEO.rowH + GEO.nodeH;

    const stateCls = (id) => {
      const s = nodeStateOf(id);
      return s === 'idle' ? '' : ` is-${s}`;
    };

    const edgeSvg = edges.map((e) => {
      const to = nodeStateOf(e.to.id);
      const from = nodeStateOf(e.from.id);
      let cls = 'orch-edge';
      if (to === 'running') cls += ' on';
      else if (to === 'ok') cls += ' done';
      else if (to === 'skipped' || from === 'skipped') cls += ' skipped';
      const hot = to === 'running' ? ' hot' : '';
      return `<path class="${cls}${hot}" d="${edgePath(e.from, e.to)}" marker-end="url(#orchArrow)"/>`;
    }).join('');

    const nodeSvg = sc.nodes.map((n) => {
      const p = nodePos(n);
      const kind = ORCH_KINDS[n.kind] ?? ORCH_KINDS.agent;
      const st = nodeStateOf(n.id);
      const icName = n.kind === 'agent' || n.kind === 'join'
        ? (ORCH_AGENT_ICONS[n.agent] ?? kind.ic) : kind.ic;
      const dotTitle = st === 'idle' ? 'menunggu' : st;
      const sub = nodeSubLabel(n);
      const title = n.name.length > 22 ? `${n.name.slice(0, 21)}…` : n.name;
      const sel = state.selected === n.id ? ' is-selected' : '';
      return `<g class="orch-node tone-${kind.tone}${stateCls(n.id)}${sel}" data-node="${esc(n.id)}" transform="translate(${p.x},${p.y})" role="button" tabindex="0">
        <rect class="orch-node-bg" x="0" y="0" width="${p.w}" height="${p.h}" rx="11"/>
        <g class="orch-node-ic" transform="translate(11,10)">${orchIcon(icName)}</g>
        <text class="orch-node-kind" x="33" y="20">${esc(kind.label)}</text>
        <text class="orch-node-name" x="11" y="41">${esc(title)}</text>
        <text class="orch-node-sub" x="11" y="55">${esc(sub.length > 25 ? `${sub.slice(0, 24)}…` : sub)}</text>
        <circle class="orch-node-dot" cx="${p.w - 11}" cy="11" r="4.5"><title>${esc(dotTitle)}</title></circle>
      </g>`;
    }).join('');

    canvasHost.replaceChildren(h('div', { class: 'orch-canvas', html:
      `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Graf orkestrasi: ${esc(sc.name)}">
        <defs>
          <marker id="orchArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" class="orch-arrow"/>
          </marker>
        </defs>
        <g class="orch-edges">${edgeSvg}</g>
        <g class="orch-nodes">${nodeSvg}</g>
      </svg>` }));
  }

  /* ------------------------------------------------------------ legend --- */
  function paintStatus() {
    const sc = scenario();
    const done = sc.nodes.filter((n) => ['ok', 'skipped'].includes(nodeStateOf(n.id))).length;
    const running = sc.nodes.filter((n) => nodeStateOf(n.id) === 'running').length;
    const depth = orchDepths(sc.nodes);
    const waves = new Set([...depth.values()]).size;
    const t = triggerOf();

    statusHost.replaceChildren(
      h('div', { class: 'orch-status' },
        h('div', { class: 'orch-status-main' },
          h('span', { class: `orch-dot st-${state.running ? 'running' : state.fired ? 'ok' : 'idle'}` }),
          h('div', { class: 'grow' },
            h('div', { class: 'orch-status-title' },
              state.running ? 'Aliran sedang berjalan…'
                : state.fired ? 'Aliran selesai' : 'Sedia — menunggu pencetus'),
            h('div', { class: 'tiny muted' },
              `${done}/${sc.nodes.length} nod · ${waves} gelombang · pencetus: ${t.label}`)),
        ),
        h('div', { class: 'orch-legend' },
          ...[['idle', 'Menunggu'], ['running', 'Sedang jalan'], ['ok', 'Selesai'],
              ['failed', 'Gagal'], ['skipped', 'Dilangkau']].map(([k, label]) =>
            h('span', { class: 'orch-legend-item' },
              h('span', { class: `orch-dot st-${k}` }), label)),
        ),
      ),
    );
  }

  /* -------------------------------------------------------------- log ---- */
  const ORCH_LEVELS = {
    info: ['info', 'st-idle'], ok: ['check', 'st-ok'], warn: ['warn', 'st-failed'],
    route: ['route', 'st-running'], hook: ['bolt', 'st-ok'], skip: ['stop', 'st-skipped'],
  };

  function log(level, text, nodeId = null) {
    state.events.push({ at: Date.now(), level, text, nodeId });
    if (state.events.length > 220) state.events.splice(0, state.events.length - 220);
    paintLog();
  }

  function paintLog() {
    if (!state.events.length) {
      logHost.replaceChildren(h('div', { class: 'orch-log-empty tiny muted' },
        'Log kosong. Tekan “Hantar payload” untuk mencetuskan aliran, atau “Langkah seterusnya” untuk berjalan gelombang demi gelombang.'));
      return;
    }
    const rows = state.events.slice(-90).map((e, i) => {
      const [ic, cls] = ORCH_LEVELS[e.level] ?? ORCH_LEVELS.info;
      const d = new Date(e.at);
      const ts = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
      return h('div', { class: 'orch-log-row', dataset: { node: e.nodeId ?? '' } },
        h('span', { class: 'orch-log-ts mono' }, ts),
        h('span', { class: `orch-log-ic ${cls}`, html: icon(ic, 'ic orch-ic-sm') }),
        h('span', { class: 'orch-log-txt' }, e.text),
      );
    });
    logHost.replaceChildren(...rows);
    logHost.scrollTop = logHost.scrollHeight;
  }

  /* ---------------------------------------------------------- metrics ---- */
  function paintMetrics() {
    const t = state.totals;
    const rows = [
      ['Nod selesai', `${t.nodes}/${scenario().nodes.length}`],
      ['Gelombang', String(new Set([...orchDepths(scenario().nodes).values()]).size)],
      ['Token', formatTokens(t.tokens)],
      ['Kos simulasi', t.cost > 0 ? formatUSD(t.cost) : 'FREE'],
      ['Jumlah masa', `${(t.ms / 1000).toFixed(1)}s`],
      ['Cubaan semula', String(t.retries)],
      ['Tangga dilangkau', String(t.fallbacks)],
    ];
    metricsHost.replaceChildren(h('div', { class: 'orch-metrics' },
      ...rows.map(([k, v]) => h('div', { class: 'orch-metric' },
        h('div', { class: 'k' }, k),
        h('div', { class: 'v nums' }, v))),
      h('div', { class: 'orch-metrics-note tiny muted' },
        'Metrik setempat sahaja — simulasi ini tidak ditulis ke ledger bil.'),
    ));
  }

  /* -------------------------------------------------------- inspector ---- */
  function paintInspector() {
    const sc = scenario();
    if (!state.selected || !sc.nodes.some((n) => n.id === state.selected)) {
      const t = triggerOf();
      inspectorHost.replaceChildren(h('div', { class: 'orch-insp-empty' },
        h('div', { class: 'orch-insp-hint' },
          h('span', { html: icon('eye', 'ic orch-ic'), style: { display: 'inline-flex' } }),
          h('div', null,
            h('strong', null, 'Klik mana-mana nod pada graf'),
            h('div', { class: 'tiny muted mt-1' },
              'Anda akan lihat model yang dipilih oleh penghala sebenar, tangga sandaran penuh, dan muatan masuk/keluar nod itu.'))),
        h('div', { class: 'orch-trigger-mini' },
          h('div', { class: 'orch-trigger-mini-head' },
            h('span', { class: 'orch-kind-chip', html: icon(t.ic, 'ic orch-ic-sm') }), t.label),
          h('div', { class: 'tiny muted' }, t.hint)),
      ));
      return;
    }

    const n = sc.nodes.find((x) => x.id === state.selected);
    const r = state.nodeResult[n.id];
    const kind = ORCH_KINDS[n.kind] ?? ORCH_KINDS.agent;
    const agent = n.agent ? AGENTS.find((a) => a.key === n.agent) : null;
    const spec = r?.model ? CATALOG[r.model] : null;
    /* Only agent and join nodes go through the router, so only they carry a
       ladder. Everything else reports what the delivery or the branch did. */
    const isAgentic = n.kind === 'agent' || n.kind === 'join';

    const detail = [
      ...(n.kind === 'trigger' ? [
        ['Pencetus', triggerOf().label],
        ['Sasaran', triggerOf().target],
      ] : []),
      ...(agent ? [
        ['Agen', agent.name],
        ['Jenis tugas', TASK_LABELS[n.task ?? agent.task] ?? (n.task ?? agent.task)],
        ['Model pilihan', CATALOG[agent.model]?.display_name ?? agent.model],
      ] : []),
      ...(r && isAgentic ? [
        ['Model dipakai', spec?.display_name ?? r.model],
        ['Tingkat tangga', `${r.rung}/${r.ladder?.length ?? 1}`],
        ['Kependaman', `${r.ms} ms`],
        ['Token', `${formatTokens(r.pt)} masuk · ${formatTokens(r.ct)} keluar`],
        ['Kos', r.cost > 0 ? formatUSD(r.cost) : 'FREE'],
      ] : []),
      ...(r && n.kind === 'webhook' ? [
        ['Cubaan', String(r.retryNote ?? r.attempts?.length ?? 1)],
        ['Kod balasan akhir', r.status === 'failed' ? 'gagal' : '200 OK'],
      ] : []),
      ...(r && n.kind === 'condition' ? [
        ['Keputusan', 'benar'],
        ['Laluan diambil', (n.branch?.take ?? []).join(', ') || 'terus'],
        ['Dilangkau', (n.branch?.skip ?? []).join(', ') || 'tiada'],
      ] : []),
      ...(r && !isAgentic && n.kind !== 'webhook' && n.kind !== 'condition' && n.kind !== 'trigger'
        ? [['Keputusan', n.kind === 'email' ? 'dihantar' : 'disimpan']] : []),
      ...(!r ? [['Status', 'Belum dijalankan']] : []),
    ];

    inspectorHost.replaceChildren(
      h('div', { class: 'orch-insp' },
        h('div', { class: 'orch-insp-head' },
          h('span', { class: `orch-kind-chip tone-${kind.tone}`, html: icon(ORCH_AGENT_ICONS[n.agent] ?? kind.ic, 'ic orch-ic-sm') }),
          h('div', { class: 'grow' },
            h('div', { class: 'orch-insp-title' }, n.name),
            h('div', { class: 'tiny muted mono' }, `${n.id} · ${kind.label.toLowerCase()}`)),
          h('span', { class: `orch-dot st-${nodeStateOf(n.id)}` }),
        ),
        n.note ? h('div', { class: 'orch-insp-note' }, n.note) : null,
        h('dl', { class: 'kv mt-3' }, ...detail.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)])),
        r && isAgentic && r.ladder?.length ? h('div', { class: 'mt-3' },
          h('div', { class: 'orch-mini-h' }, 'Tangga penghalaan sebenar'),
          traceLadder(r.ladder),
        ) : null,
        r && n.kind === 'webhook' && r.attempts?.length ? h('div', { class: 'mt-3' },
          h('div', { class: 'orch-mini-h' }, 'Percubaan hantaran'),
          h('div', { class: 'orch-attempts' }, ...r.attempts.map((a) => h('div', { class: `orch-attempt ${a.ok ? 'ok' : 'fail'}` },
            h('span', { class: 'mono tiny' }, `cubaan ${a.n}`),
            h('span', { class: 'grow tiny' }, a.note),
            h('span', { class: 'mono tiny' }, a.ms ? `${a.ms} ms` : '—'),
          ))),
        ) : null,
        h('div', { class: 'orch-mini-h mt-3' }, 'Muatan masuk'),
        h('pre', { class: 'orch-json' }, orchJson(orchNodeInput(n))),
        h('div', { class: 'orch-mini-h mt-3' }, 'Muatan keluar'),
        h('pre', { class: 'orch-json' }, orchJson(orchNodeOutput(n, r))),
        h('div', { class: 'row mt-3' },
          h('button', {
            class: 'btn btn-sm btn-ghost',
            onclick: () => copy(orchJson({ input: orchNodeInput(n), output: orchNodeOutput(n, r) }), 'Muatan nod disalin'),
          }, ico('copy', 'ic'), 'Salin muatan'),
          h('div', { class: 'grow' }),
          h('button', {
            class: 'btn btn-sm btn-ghost',
            onclick: () => { state.selected = null; paintInspector(); paintCanvas(); },
          }, 'Tutup'),
        ),
      ),
    );
  }

  /** What the node receives — the upstream node's output, in spirit. */
  function orchNodeInput(n) {
    const sc = scenario();
    if (n.kind === 'trigger') {
      const t = triggerOf();
      return { trigger: state.triggerType ?? sc.trigger, method: t.method, target: t.target, body: t.body };
    }
    const deps = (n.dep ?? []).map((d) => sc.nodes.find((x) => x.id === d)).filter(Boolean);
    return {
      from: deps.map((d) => d.id),
      context: deps.map((d) => ({
        node: d.id,
        name: d.name,
        output: orchNodeOutput(d, state.nodeResult[d.id]).ringkasan ?? null,
      })),
      instruction: n.note ?? n.name,
    };
  }

  /** What the node emits — a plausible contract-shaped object. */
  function orchNodeOutput(n, r) {
    if (n.kind === 'trigger') {
      return { accepted: true, event: triggerOf().body.event, delivery: 'dlv_7c1a94', signature_verified: true };
    }
    if (n.kind === 'condition') {
      const taken = n.branch?.take ?? [];
      const skipped = n.branch?.skip ?? [];
      return { evaluated: true, rule: 'intent == "dskp_reference"', result: true, take: taken, skip: skipped };
    }
    if (n.kind === 'webhook') {
      return { delivered: r?.status !== 'failed', url: 'https://sistem-sekolah.moe-dl.edu.my/api/rph', attempts: r?.retryNote ?? 1, response: 200 };
    }
    if (n.kind === 'email') {
      return { sent: true, to: ['panitia-bm@moe-dl.edu.my', 'guru-besar@moe-dl.edu.my'], attachments: 2, subject: 'RPH Tahun 3 — Kata Nama Am dan Kata Nama Khas' };
    }
    if (n.kind === 'store') {
      return { saved: true, path: 'Shared/Panitia/2026/Laporan-Minggu-42.pdf', bytes: 418_233 };
    }
    if (n.kind === 'join') {
      return {
        merged: true,
        sources: (n.dep ?? []),
        conflicts: r?.rung > 1 ? 1 : 0,
        ringkasan: 'RPH, pemetaan DSKP dan deskriptor PBD disatukan; satu percanggahan kod standard ditanda untuk semakan guru.',
      };
    }
    const agent = n.agent;
    const ringkasan = {
      rph: 'RPH penuh 5 langkah dengan EMK, KBAT dan refleksi.',
      dskp: 'SK/SP dipetakan dengan penanda “sahkan dengan DSKP rasmi”.',
      pbd: '5 item pentaksiran + deskriptor TP1–TP6 + pelan intervensi.',
      bbm: 'Lembaran kerja, kad imbas dan versi pembezaan mengikut aras murid.',
      panitia: 'RPT 12 minggu, minit mesyuarat dan analisis TP.',
      bahasa: 'Terjemahan BM/BI serta nota istilah kurikulum.',
      admin: 'Klasifikasi permintaan: lengkap, mata pelajaran dan tahun dikenali.',
    }[agent];
    return {
      agent,
      model: r?.model ?? null,
      tier: r?.model ? CATALOG[r.model]?.tier : null,
      usage: r ? { prompt_tokens: r.pt, completion_tokens: r.ct } : null,
      ringkasan: ringkasan ?? `${n.name} selesai.`,
    };
  }

  /* ------------------------------------------------- trigger + webhooks -- */
  function paintTrigger() {
    const sc = scenario();
    const active = state.triggerType ?? sc.trigger;
    triggerHost.replaceChildren(
      h('div', { class: 'orch-chips' },
        ...Object.entries(ORCH_TRIGGERS).map(([key, t]) => h('button', {
          class: `orch-chip${key === active ? ' on' : ''}`,
          'aria-pressed': String(key === active),
          onclick: () => {
            if (state.running) { toast('Tunggu aliran selesai sebelum menukar pencetus', 'warn'); return; }
            state.triggerType = key;
            resetRun({ keepEvents: false });
            log('info', `Pencetus ditukar kepada ${t.label}. Graf tidak berubah — hanya pencetusnya.`);
            paintAll();
          },
        }, h('span', { html: icon(t.ic, 'ic orch-ic-sm'), style: { display: 'inline-flex' } }), t.label)),
      ),
      h('div', { class: 'orch-trigger-detail' },
        h('div', { class: 'orch-field' },
          h('div', { class: 'orch-field-k' }, ORCH_TRIGGERS[active].method === 'TICK' ? 'Jadual' : 'Titik akhir'),
          h('div', { class: 'orch-field-v mono' }, ORCH_TRIGGERS[active].target)),
        h('div', { class: 'tiny muted mt-2' }, ORCH_TRIGGERS[active].hint),
        sc.trigger !== active ? h('div', { class: 'orch-note mt-2' },
          `Senario “${sc.name}” pada asalnya dicetuskan oleh ${ORCH_TRIGGERS[sc.trigger].label}. Anda sedang mengujinya dengan ${ORCH_TRIGGERS[active].label}.`) : null,
      ),
    );
  }

  function paintWebhooks() {
    const t = triggerOf();
    const active = state.triggerType ?? scenario().trigger;
    const sig = orchSignature(orchJson(t.body));

    /* --- inbound --------------------------------------------------------- */
    const headers = { ...t.headers };
    if (active === 'webhook') headers['X-AgenticOS-Signature'] = sig;

    hookInHost.replaceChildren(
      h('div', { class: 'orch-hook' },
        h('div', { class: 'orch-hook-line' },
          h('span', { class: 'orch-method' }, t.method),
          h('span', { class: 'orch-hook-url mono' }, t.target),
          h('div', { class: 'grow' }),
          h('span', { class: `orch-dot st-${state.fired ? 'ok' : 'idle'}` }),
        ),
        h('div', { class: 'orch-mini-h mt-3' }, 'Tajuk permintaan'),
        h('div', { class: 'orch-headers' },
          ...Object.entries(headers).map(([k, v]) => h('div', { class: 'orch-header-row' },
            h('span', { class: 'orch-header-k mono' }, k),
            h('span', { class: 'orch-header-v mono' }, v)))),
        h('div', { class: 'orch-mini-h mt-3' }, 'Badan permintaan'),
        h('pre', { class: 'orch-json' }, orchJson(t.body)),
        h('div', { class: 'row mt-3' },
          h('button', {
            class: 'btn btn-sm btn-ghost',
            onclick: () => copy(
              `curl -X ${t.method} '${t.target}' \\\n  -H 'Content-Type: application/json' \\\n  -H 'X-AgenticOS-Signature: ${sig}' \\\n  -d '${JSON.stringify(t.body)}'`,
              'Perintah curl disalin'),
          }, ico('copy', 'ic'), 'Salin curl'),
          h('div', { class: 'grow' }),
          h('span', { class: 'tiny muted' }, active === 'webhook'
            ? 'Tandatangan HMAC-SHA256 ke atas badan mentah'
            : 'Tiada tandatangan — pencetus dalaman'),
        ),
      ),
    );

    /* --- outbound -------------------------------------------------------- */
    const outNodes = scenario().nodes.filter((n) => n.kind === 'webhook');
    hookOutHost.replaceChildren(
      outNodes.length ? h('div', { class: 'orch-hook' },
        ...outNodes.map((n) => {
          const r = state.nodeResult[n.id];
          const st = nodeStateOf(n.id);
          const attempts = r?.attempts ?? [];
          return h('div', { class: 'orch-out' },
            h('div', { class: 'orch-out-head' },
              h('span', { class: 'orch-method post' }, 'POST'),
              h('span', { class: 'grow mono tiny' }, 'sistem-sekolah.moe-dl.edu.my/api/rph'),
              h('span', { class: `orch-dot st-${st}` }),
            ),
            attempts.length
              ? h('div', { class: 'orch-attempts' }, ...attempts.map((a) => h('div', { class: `orch-attempt ${a.ok ? 'ok' : 'fail'}` },
                  h('span', { class: 'mono tiny' }, `cubaan ${a.n}`),
                  h('span', { class: 'grow tiny' }, a.note),
                  h('span', { class: 'mono tiny' }, a.ms ? `${a.ms} ms` : '—'),
                )))
              : h('div', { class: 'tiny muted mt-2' }, 'Belum dihantar.'),
          );
        })) : h('div', { class: 'tiny muted' }, 'Senario ini tiada webhook keluar.'),
    );
  }

  /* --------------------------------------------------------- run engine -- */
  function resetRun({ keepEvents = true } = {}) {
    state.token++;
    state.running = false;
    state.fired = false;
    state.nodeState = {};
    state.nodeResult = {};
    state.selected = null;
    state.totals = { nodes: 0, tokens: 0, cost: 0, ms: 0, retries: 0, fallbacks: 0 };
    if (!keepEvents) state.events = [];
    paintCanvas(); paintLog(); paintMetrics(); paintInspector(); paintStatus(); paintWebhooks();
  }

  /** Nodes whose dependencies have all resolved but which have not run yet. */
  function readyNodes() {
    const sc = scenario();
    return sc.nodes.filter((n) => {
      const st = nodeStateOf(n.id);
      if (st !== 'idle') return false;
      const deps = n.dep ?? [];
      return deps.every((d) => ['ok', 'skipped'].includes(nodeStateOf(d)));
    });
  }

  /** A node that depends on a skipped node is itself skipped. */
  function propagateSkips() {
    const sc = scenario();
    let changed = true;
    while (changed) {
      changed = false;
      for (const n of sc.nodes) {
        if (nodeStateOf(n.id) !== 'idle') continue;
        const deps = (n.dep ?? []).map(nodeStateOf);
        if (deps.length && deps.some((s) => s === 'skipped') && deps.every((s) => s === 'ok' || s === 'skipped')) {
          state.nodeState[n.id] = 'skipped';
          log('skip', `Nod “${n.name}” dilangkau — cabang hulunya tidak diambil.`, n.id);
          changed = true;
        }
      }
    }
  }

  /** Ask the real router which model this node would use. */
  function routeNode(n) {
    const agent = n.agent ? AGENTS.find((a) => a.key === n.agent) : null;
    const task = n.task ?? agent?.task ?? 'chat';
    try {
      const decision = ctx.router.decide({ task, requireTools: true });
      return { task, ladder: decision.candidates, chosen: decision.candidates[0] };
    } catch {
      const fallback = agent ? [agent.model, ...(agent.fallback ?? [])] : [];
      return { task, ladder: fallback, chosen: fallback[0] ?? null };
    }
  }

  /** Run one node: walk its ladder, honour `flaky`, then settle. */
  async function runNode(n) {
    const sc = scenario();
    state.nodeState[n.id] = 'running';
    paintCanvas(); paintStatus();
    paintInspector();

    if (n.kind === 'trigger') {
      const t = triggerOf();
      log('hook', `Pencetus ${t.label} diterima · ${t.target}`, n.id);
      if ((state.triggerType ?? sc.trigger) === 'webhook') {
        log('ok', `Tandatangan ${orchSignature(orchJson(t.body)).slice(0, 21)}… disahkan.`, n.id);
      }
      await orchSleep(320 / state.speed);
      state.nodeState[n.id] = 'ok';
      state.totals.nodes++;
      state.totals.ms += 320;
      log('ok', `Nod pencetus “${n.name}” selesai.`, n.id);
      paintCanvas(); paintStatus(); paintMetrics(); paintInspector(); paintWebhooks();
      return;
    }

    if (n.kind === 'condition') {
      await orchSleep(300 / state.speed);
      const take = n.branch?.take ?? [];
      const skip = n.branch?.skip ?? [];
      for (const id of skip) {
        state.nodeState[id] = 'skipped';
        const s = sc.nodes.find((x) => x.id === id);
        log('skip', `Cabang tidak diambil — “${s?.name ?? id}” dilangkau.`, id);
      }
      state.nodeState[n.id] = 'ok';
      state.totals.nodes++;
      state.totals.ms += 300;
      log('route', `Syarat dinilai: benar → laluan ${take.join(', ') || 'terus'}.`, n.id);
      paintCanvas(); paintStatus(); paintMetrics(); paintInspector();
      return;
    }

    if (n.kind === 'webhook') {
      const tries = 1 + (n.retry ?? 0);
      const attempts = [];
      let ok = false;
      for (let i = 1; i <= tries; i++) {
        const ms = Math.round(orchRand(120, 260));
        await orchSleep(ms / state.speed);
        state.totals.ms += ms;
        if (!ok && i === 1 && (n.retry ?? 0) > 0) {
          const backoff = 400;
          attempts.push({ n: i, ok: false, note: '503 Service Unavailable — backoff eksponen', ms });
          log('warn', `Hantaran keluar cubaan ${i} gagal (503). Menunggu ${backoff} ms sebelum cubaan ${i + 1}.`, n.id);
          state.totals.retries++;
          await orchSleep(backoff / state.speed);
          state.totals.ms += backoff;
          paintWebhooks();
          continue;
        }
        ok = true;
        attempts.push({ n: i, ok: true, note: '200 OK — diterima', ms });
        log('ok', `Hantaran keluar cubaan ${i} berjaya (200 OK).`, n.id);
      }
      state.nodeState[n.id] = ok ? 'ok' : 'failed';
      state.nodeResult[n.id] = { attempts, retryNote: attempts.length, status: ok ? 'ok' : 'failed' };
      if (ok) state.totals.nodes++;
      paintCanvas(); paintStatus(); paintMetrics(); paintInspector(); paintWebhooks();
      return;
    }

    if (n.kind === 'email' || n.kind === 'store') {
      const ms = Math.round(orchRand(240, 520));
      await orchSleep(ms / state.speed);
      state.totals.ms += ms;
      state.totals.nodes++;
      state.nodeState[n.id] = 'ok';
      log('ok', n.kind === 'email'
        ? `E-mel dihantar ke panitia (2 penerima, 2 lampiran).`
        : `Disimpan ke ${orchNodeOutput(n, null).path}.`, n.id);
      paintCanvas(); paintStatus(); paintMetrics(); paintInspector();
      return;
    }

    /* ---- agent / join: the interesting case ---------------------------- */
    const route = routeNode(n);
    // `route.ladder` is a list of slugs; the attempt entries that the ladder
    // trace renders are built below, one per rung actually walked.
    const ladder = route.ladder;
    const flaky = n.flaky ?? 0;
    const attempts = [];

    for (let i = 0; i < ladder.length; i++) {
      const slug = ladder[i];
      const spec = CATALOG[slug];
      const entry = {
        model: slug, vendor: spec?.vendor, tier: spec?.tier,
        status: 'pending', note: '', latencyMs: 0,
      };
      attempts.push(entry);

      if (i < flaky) {
        entry.status = 'failed';
        entry.latencyMs = Math.round(orchRand(180, 420));
        entry.note = 'RateLimitError: 429 Too Many Requests → cooling down 60s';
        state.totals.retries++;
        state.totals.fallbacks++;
        state.nodeResult[n.id] = { ladder: attempts, rung: i + 1, model: slug, pt: 0, ct: 0, cost: 0, ms: entry.latencyMs };
        paintCanvas(); paintInspector();
        log('warn', `“${n.name}” tingkat ${i + 1} (${spec?.display_name ?? slug}) pulangkan 429. Turun ke tingkat ${i + 2}.`, n.id);
        await orchSleep(entry.latencyMs / state.speed);
        state.totals.ms += entry.latencyMs;
        continue;
      }

      const ms = Math.round(orchRand(420, 940) * (spec && isFree(spec) ? 1.25 : 1));
      await orchSleep(ms / state.speed);
      state.totals.ms += ms;
      entry.status = 'ok';
      entry.latencyMs = ms;
      entry.note = i === 0 ? 'answered on the first rung' : `answered after ${i} fallback${i === 1 ? '' : 's'}`;

      const jitter = () => 0.75 + Math.random() * 0.5;
      const pt = Math.round((n.pt ?? 1200) * jitter());
      const ct = Math.round((n.ct ?? 900) * jitter());
      const cost = spec ? pt / 1e6 * spec.input_price + ct / 1e6 * spec.output_price : 0;

      state.nodeResult[n.id] = {
        ladder: attempts, rung: i + 1, model: slug, pt, ct, cost, ms,
      };
      state.nodeState[n.id] = 'ok';
      state.totals.nodes++;
      state.totals.tokens += pt + ct;
      state.totals.cost += cost;
      log('ok', `“${n.name}” selesai pada tingkat ${i + 1} — ${spec?.display_name ?? slug} · ${formatTokens(pt + ct)} tok · ${cost > 0 ? formatUSD(cost) : 'FREE'} · ${ms} ms`, n.id);
      paintCanvas(); paintStatus(); paintMetrics(); paintInspector();
      return;
    }

    state.nodeState[n.id] = 'failed';
    log('warn', `“${n.name}” gagal — semua ${ladder.length} tingkat tangga habis.`, n.id);
    paintCanvas(); paintStatus(); paintMetrics(); paintInspector();
  }

  /** Run every node that is ready, in parallel, then settle. */
  async function runWave(token) {
    const ready = readyNodes();
    if (!ready.length) { propagateSkips(); return 0; }
    await Promise.all(ready.map((n) => runNode(n)));
    if (token !== state.token) return -1;
    propagateSkips();
    return ready.length;
  }

  /** Single place that flips the run flag, so the controls never go stale. */
  function setRunning(v) {
    state.running = v;
    paintControls();
    paintStatus();
  }

  async function runAuto() {
    if (state.running) return;
    resetRun();
    state.fired = true;
    setRunning(true);
    const token = state.token;
    log('info', `Aliran “${scenario().name}” dimulakan. ${scenario().nodes.length} nod, mod auto.`);
    paintWebhooks();

    let guard = 0;
    while (token === state.token && guard++ < 40) {
      const ran = await runWave(token);
      if (ran <= 0) break;
      await orchSleep(140 / state.speed);
    }
    if (token !== state.token) return;
    setRunning(false);
    finishRun();
  }

  async function runStep() {
    if (state.running) return;
    if (!state.fired) { resetRun(); state.fired = true; paintWebhooks(); }
    setRunning(true);
    const token = state.token;
    const ran = await runWave(token);
    if (token !== state.token) return;
    setRunning(false);
    if (ran <= 0) {
      log('info', 'Tiada nod yang sedia untuk dijalankan — aliran sudah tamat.');
      return;
    }
    const left = readyNodes().length;
    if (left) log('info', `Gelombang selesai. ${left} nod sedia untuk gelombang seterusnya.`);
    else finishRun();
  }

  function finishRun() {
    const sc = scenario();
    const failed = sc.nodes.filter((n) => nodeStateOf(n.id) === 'failed').length;
    const skipped = sc.nodes.filter((n) => nodeStateOf(n.id) === 'skipped').length;
    const t = state.totals;
    log(failed ? 'warn' : 'ok',
      failed
        ? `Aliran tamat dengan ${failed} nod gagal · ${formatTokens(t.tokens)} tok · ${t.cost > 0 ? formatUSD(t.cost) : 'FREE'} · ${(t.ms / 1000).toFixed(1)}s`
        : `Aliran selesai: ${t.nodes} nod, ${skipped} dilangkau · ${formatTokens(t.tokens)} tok · ${t.cost > 0 ? formatUSD(t.cost) : 'FREE'} · ${(t.ms / 1000).toFixed(1)}s`,
    );
    paintStatus(); paintMetrics();
    toast(failed ? 'Aliran tamat dengan ralat' : 'Aliran selesai', failed ? 'warn' : 'ok');
  }

  /* ----------------------------------------------------------- controls -- */
  function paintControls() {
    controlsHost.replaceChildren(
      h('div', { class: 'orch-controls' },
        h('div', { class: 'orch-control-group' },
          h('div', { class: 'orch-mini-h' }, 'Mod jalan'),
          h('div', { class: 'orch-seg' },
            ...[['auto', 'Auto'], ['step', 'Langkah demi langkah']].map(([k, label]) => h('button', {
              class: `orch-seg-btn${state.mode === k ? ' on' : ''}`,
              onclick: () => { state.mode = k; paintControls(); },
            }, label)),
          ),
        ),
        h('div', { class: 'orch-control-group' },
          h('div', { class: 'orch-mini-h' }, 'Kelajuan'),
          h('div', { class: 'orch-seg' },
            ...[0.5, 1, 2].map((v) => h('button', {
              class: `orch-seg-btn${state.speed === v ? ' on' : ''}`,
              onclick: () => { state.speed = v; paintControls(); },
            }, `${v}×`)),
          ),
        ),
        h('div', { class: 'row-wrap orch-actions' },
          state.mode === 'auto'
            ? h('button', {
                class: 'btn btn-primary',
                disabled: state.running,
                onclick: () => { runAuto(); },
              }, ico('play', 'ic'), state.running ? 'Berjalan…' : 'Hantar payload')
            : h('button', {
                class: 'btn btn-primary',
                disabled: state.running,
                onclick: () => { runStep(); },
              }, ico('play', 'ic'), state.fired ? 'Langkah seterusnya' : 'Mulakan'),
          h('button', {
            class: 'btn', disabled: state.running,
            onclick: () => { resetRun({ keepEvents: false }); log('info', 'Simulasi direset.'); paintAll(); toast('Simulasi direset', 'info'); },
          }, ico('refresh', 'ic'), 'Reset'),
        ),
      ),
    );
  }

  /* ------------------------------------------------------------- scenes -- */
  function paintScenarios() {
    return h('div', { class: 'orch-scenarios' },
      ...ORCH_SCENARIOS.map((sc) => h('button', {
        class: `orch-scenario${sc.id === state.scenarioId ? ' on' : ''}`,
        onclick: () => {
          if (state.running) { toast('Tunggu aliran selesai', 'warn'); return; }
          state.scenarioId = sc.id;
          state.triggerType = null;
          resetRun({ keepEvents: false });
          log('info', `Senario ditukar: “${sc.name}”.`);
          paintAll();
        },
      },
        h('div', { class: 'orch-scenario-top' },
          h('span', { class: 'orch-scenario-tag mono' }, sc.tag),
          h('span', { class: 'grow' }),
          h('span', { class: 'orch-scenario-n' }, `${sc.nodes.length} nod`)),
        h('div', { class: 'orch-scenario-name' }, sc.name),
        h('div', { class: 'orch-scenario-goal tiny muted' }, sc.goal),
        h('div', { class: 'orch-scenario-why tiny' }, sc.why),
      )),
    );
  }

  /* -------------------------------------------------------------- paint -- */
  function paintAll() {
    paintCanvas(); paintStatus(); paintLog(); paintMetrics();
    paintInspector(); paintTrigger(); paintWebhooks(); paintControls();
  }

  /* ------------------------------------------------------- interactions -- */
  canvasHost.addEventListener('click', (e) => {
    const g = e.target.closest?.('[data-node]');
    if (!g) return;
    state.selected = g.getAttribute('data-node');
    paintCanvas(); paintInspector();
  });
  canvasHost.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest?.('[data-node]');
    if (!g) return;
    e.preventDefault();
    state.selected = g.getAttribute('data-node');
    paintCanvas(); paintInspector();
  });

  /* -------------------------------------------------------------- render -- */
  paintAll();
  log('info', 'Simulasi sedia. Setiap nod akan bertanya kepada penghala model yang sama seperti halaman Model Router — keputusan penghalaan di sini adalah sebenar.');

  const sc = scenario();

  return h('div', { class: 'stack' },
    pageHead('Simulasi Orkestrasi Agentik',
      'Satu aliran, ditelusuri nod demi nod. Pencetus masuk, cabang dinilai, tangga model berjalan, webhook keluar dengan cubaan semula. Setiap label model pada nod datang daripada ModelRouter yang sebenar.',
      h('span', { class: 'pill p-free' }, 'MODEL SEBENAR · MASA DISIMULASIKAN')),

    paintScenarios(),

    card('Graf aliran', `${sc.nodes.length} nod · pencetus + cabang + webhook · ${new Set([...orchDepths(sc.nodes).values()]).size} gelombang`,
      h('div', { class: 'card-body' },
        statusHost,
        h('div', { class: 'mt-3' }, canvasHost),
        h('div', { class: 'orch-hintrow tiny muted mt-2' },
          'Klik nod untuk memeriksa muatan dan tangga penghalaannya. Nod berlatar belakang biru sedang berjalan; garis putus-putus bermaksud cabang yang tidak diambil. Gunakan mod “Langkah demi langkah” untuk berjalan satu gelombang setiap kali.'),
      )),

    h('div', { class: 'grid g-side' },
      h('div', { class: 'stack' },
        card('Pemeriksa nod', 'Model, tangga sandaran, muatan masuk dan keluar',
          h('div', { class: 'card-body' }, inspectorHost)),

        card('Log peristiwa', 'Setiap keputusan, setiap cubaan semula — masa sebenar',
          h('div', { class: 'card-body' }, logHost)),
      ),

      h('div', { class: 'stack' },
        card('Pencetus', 'Lima jenis — pilih satu untuk menguji aliran yang sama',
          h('div', { class: 'card-body' }, triggerHost, h('div', { class: 'mt-3' }, controlsHost))),

        card('Webhook masuk', 'Apa yang penerima lihat, termasuk tandatangan',
          h('div', { class: 'card-body' }, hookInHost)),

        card('Webhook keluar', 'Hantaran, cubaan semula dan kod balasan',
          h('div', { class: 'card-body' }, hookOutHost)),

        card('Metrik aliran', 'Jumlah bagi larian terkini',
          h('div', { class: 'card-body' }, metricsHost)),
      ),
    ),

    card('Mengapa orkestrasi, bukan satu panggilan besar',
      'Perbezaan antara “guna model besar” dan “bina sistem”',
      h('div', { class: 'card-body' },
        h('div', { class: 'grid g-3' },
          ...[
            ['Kegagalan terkurung', 'Satu nod gagal tidak menjatuhkan aliran. Nod syarat melangkau cabang, nod webhook mencuba semula, dan hanya laluan yang benar-benar selesai sampai ke gabungan.'],
            ['Kos mengikut tugasan', 'Klasifikasi niat berjalan atas model murah; pemetaan dokumen penuh menaiki tangga ke konteks 1M. Satu model untuk semua kerja membazir pada kedua-dua hujung.'],
            ['Boleh diperiksa', 'Setiap nod meninggalkan muatan masuk dan keluar yang boleh dibaca. Apabila RPH keluar salah, anda tahu nod mana yang salah — bukan “model itu kata begitu”.'],
          ].map(([t, d]) => h('div', { class: 'insight' },
            h('div', { class: 'insight-t' }, t),
            h('div', { class: 'tiny muted' }, d))),
        ),
      )),
  );
}

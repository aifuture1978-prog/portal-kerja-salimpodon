/**
 * KSSR pages — the education-facing surface of AgenticOS.
 *
 * Five pages, all running on the same ModelRouter as the rest of the platform:
 *   overview  — dashboard for a KPM primary school
 *   rph       — Rancangan Pengajaran Harian studio
 *   dskp      — DSKP standard/pembelajaran explorer
 *   pbd       — Pentaksiran Bilik Darjah item + TP builder
 *   bbm       — Bahan Bantu Mengajar generator
 *
 * The forms deliberately mirror the fields a Malaysian teacher already fills in,
 * so generated output can go straight into the school's own RPH file.
 */
import {
  h, esc, toast, copy, tierBadge, formatTokens, formatUSD,
} from './ui.js';
import { icon, ico, statCard, codeBlock, renderOutput } from './renderers.js';
import {
  pageHead, card, emptyState, kv, table, traceLadder, resultBlock, runButton,
} from './components.js';
import { CATALOG, SYSTEM_PROMPTS } from './catalog.js';
import {
  KPM, MATA_PELAJARAN, KUMPULAN_MATA_PELAJARAN, EMK, TP, KAEDAH_PBD,
  LANGKAH_PDPC, KATA_KERJA, TUGAS_GURU, ALIRAN_KSSR, PANITIA_TUGAS,
  AGEN_KSSR, CONTOH_BORANG,
} from './kssr.js';

/* Session state so switching pages does not wipe a half-written form. */
export const kssrState = {
  rph: { ...CONTOH_BORANG, emk: ['EMK4', 'EMK6'], kbat: 'Menganalisis' },
  pbd: { mata_pelajaran: 'Matematik', tahun: 'Tahun 4', tajuk: 'Pecahan', bilangan: 5, kaedah: ['Pemerhatian', 'Kuiz dan ujian pendek'] },
  bbm: { mata_pelajaran: 'Sains', tahun: 'Tahun 5', tajuk: 'Proses Hidup Tumbuhan', jenis: 'Lembaran kerja' },
  dskp: { mata_pelajaran: 'Bahasa Melayu', tahun: 'Tahun 3', bidang: 'Kemahiran Mendengar dan Bertutur' },
};

/* ------------------------------------------------------------------ helpers */

const option = (value, label, selected) =>
  h('option', { value, selected: value === selected }, label);

const pilihSubjek = (current, onchange, { hanya = null } = {}) =>
  h('select', { class: 'select', onchange: (e) => onchange(e.target.value) },
    ...MATA_PELAJARAN
      .filter((m) => !hanya || m.kumpulan === hanya || hanya.includes(m.kumpulan))
      .map((m) => option(m.nama, `${m.nama}${m.nota ? ` — ${m.nota}` : ''}`, current)));

const pilihTahun = (current, onchange) =>
  h('select', { class: 'select', onchange: (e) => onchange(e.target.value) },
    ...KPM.tahun.map((t) => option(t, t, current)));

const pilihKelas = (current, onchange) => {
  const kelas = ['1 Bestari', '2 Bestari', '3 Bestari', '4 Bestari', '5 Bestari', '6 Bestari'];
  return h('select', { class: 'select', onchange: (e) => onchange(e.target.value) },
    ...kelas.map((k) => option(k, k, current)));
};

const emkPicker = (selected, onchange) =>
  h('div', { class: 'kssr-emk' },
    ...EMK.map((e) => {
      const on = selected.includes(e.kod);
      return h('button', {
        class: `kssr-emk-chip${on ? ' on' : ''}`,
        title: e.nota,
        onclick: () => onchange(on ? selected.filter((k) => k !== e.kod) : [...selected, e.kod]),
      }, h('span', { class: 'mono tiny' }, e.kod), e.nama);
    }));

/** TP ladder legend, reused on the overview and PBD pages. */
function tpLegend() {
  return h('div', { class: 'kssr-tp-legend' },
    ...TP.map((t) => h('div', { class: 'kssr-tp-card', style: { borderTopColor: t.warna } },
      h('div', { class: 'row', style: { gap: '7px', alignItems: 'center' } },
        h('span', { class: 'kssr-tp-pill', style: { background: t.warna } }, `TP${t.tp}`),
        h('strong', { style: { fontSize: '12px' } }, t.label)),
      h('div', { class: 'tiny muted mt-1' }, t.aras),
      h('div', { class: 'tiny mt-1' }, t.deskriptor),
    )));
}

/* ========================================================================== */
/*  Overview                                                                  */
/* ========================================================================== */
export function kssrOverviewPage(ctx) {
  const hero = h('div', { class: 'hero mb-4' },
    h('div', { class: 'row-wrap' },
      h('span', { class: `pill ${ctx.mode === 'real' ? 'p-free' : 'p-cheap'}` },
        h('span', { class: 'dot dot-live' }), ctx.mode === 'real' ? 'LIVE OPENROUTER' : 'SIMULATED TRANSPORT'),
      h('span', { class: 'pill p-gl' }, KPM.akronim),
      h('span', { class: 'pill p-gl' }, 'KSSR SEMAKAN 2017'),
    ),
    h('h1', { class: 'mt-2' }, 'Agentic OS KSSR — satu platform untuk seluruh kerja bilik darjah'),
    h('p', null,
      'Enjin penghalaan model yang sama seperti Agentic OS, tetapi dipasang dengan agen pendidikan: ',
      h('strong', null, 'RPH'), ', ', h('strong', null, 'DSKP'), ', ', h('strong', null, 'Pentaksiran Bilik Darjah'),
      ', ', h('strong', null, 'Bahan Bantu Mengajar'), ' dan ', h('strong', null, 'panitia'),
      '. Setiap panggilan menempuh tangga model murah dahulu — kerja guru tidak sepatutnya bergantung pada model paling mahal.',
    ),
    h('div', { class: 'hero-tags' },
      ...['KSSR Semakan 2017', 'Tahun 1–6', `${MATA_PELAJARAN.length} mata pelajaran`, 'TP1–TP6', '8 elemen EMK', `${AGEN_KSSR.length} agen pendidikan`, 'Dwibahasa + bahasa ibunda'].map((t) => h('span', { class: 'chip' }, t)),
    ),
  );

  const stats = h('div', { class: 'grid g-4 mb-4' },
    statCard('Mata pelajaran', String(MATA_PELAJARAN.length), 'Teras · wajib · tambahan', { ic: 'book', accent: true }),
    statCard('Tahap Penguasaan', 'TP1–TP6', 'Rangka PBD KPM', { ic: 'chart' }),
    statCard('Elemen EMK', String(EMK.length), 'Wajib disisipkan dalam RPH', { ic: 'spark' }),
    statCard('Agen pendidikan', String(AGEN_KSSR.length), 'Satu enjin penghalaan', { ic: 'users' }),
  );

  /* --- subjects -------------------------------------------------------- */
  const byKumpulan = Object.entries(KUMPULAN_MATA_PELAJARAN)
    .map(([k, label]) => [k, label, MATA_PELAJARAN.filter((m) => m.kumpulan === k)])
    .filter(([, , list]) => list.length);

  const subjekCard = card('Mata pelajaran KSSR', 'Klik untuk lihat tahun yang ditawarkan',
    h('div', { class: 'card-body stack' },
      ...byKumpulan.map(([, label, list]) =>
        h('div', null,
          h('div', { class: 'lbl mb-2' }, label),
          h('div', { class: 'kssr-subj-grid' },
            ...list.map((m) => h('div', { class: 'kssr-subj', title: m.nota ?? '' },
              h('span', { class: 'kssr-subj-ic', html: icon(m.ikon) }),
              h('div', { class: 'grow' },
                h('div', { class: 'kssr-subj-name' }, m.nama),
                h('div', { class: 'tiny muted' }, `Tahun ${m.tahun.join(', ')}`),
                m.nota ? h('div', { class: 'tiny muted' }, m.nota) : null),
            )))))));

  /* --- TP ladder ------------------------------------------------------- */
  const tpCard = card('Tahap Penguasaan (PBD)', 'Enam aras yang guru tandakan sepanjang tahun',
    h('div', { class: 'card-body' }, tpLegend()));

  /* --- EMK ------------------------------------------------------------- */
  const emkCard = card('Elemen Merentas Kurikulum', 'Setiap RPH perlu menyisipkan sekurang-kurangnya satu',
    h('div', { class: 'card-body' },
      h('div', { class: 'kssr-emk-list' },
        ...EMK.map((e) => h('div', { class: 'kssr-emk-row' },
          h('span', { class: 'mono tiny muted', style: { flex: '0 0 48px' } }, e.kod),
          h('div', { class: 'grow' },
            h('div', { style: { fontWeight: 600, fontSize: '12.5px' } }, e.nama),
            h('div', { class: 'tiny muted' }, e.nota)))))));

  /* --- daily tasks ----------------------------------------------------- */
  const tugasanCard = card('Kerja guru yang boleh diautomasikan', 'Anggaran masa manual sebelum automasi',
    h('div', { class: 'card-body' },
      h('div', { class: 'table-wrap' },
        h('table', { class: 'tbl tbl-tight' },
          h('thead', null, h('tr', null,
            h('th', null, 'Tugasan'), h('th', null, 'Kekerapan'), h('th', null, 'Agen'), h('th', null, 'Masa manual'))),
          h('tbody', null, ...TUGAS_GURU.map((t) =>
            h('tr', null,
              h('td', null, t.nama),
              h('td', { class: 'tiny muted' }, t.kekerapan),
              h('td', null, h('span', { class: 'chip', style: { fontSize: '10px' } }, t.agen)),
              h('td', { class: 'tiny muted nums' }, t.masa))))))));

  /* --- workflows ------------------------------------------------------- */
  const aliranCard = card('Aliran kerja sedia guna', 'Empat automasi yang paling banyak menjimatkan masa panitia',
    h('div', { class: 'card-body' },
      h('div', { class: 'grid g-2' },
        ...ALIRAN_KSSR.map((a) => h('div', { class: 'kssr-flow' },
          h('div', { class: 'kssr-flow-head' },
            h('span', { class: 'kssr-flow-ic', html: icon('flow') }),
            h('strong', null, a.nama)),
          h('div', { class: 'tiny muted mb-2' }, a.pencetus),
          h('ol', { class: 'kssr-flow-steps' },
            ...a.langkah.map((l) => h('li', null, l))),
          h('div', { class: 'row-wrap mt-2' },
            ...a.agen.map((g) => h('span', { class: 'chip', style: { fontSize: '10px' } }, g))))))));

  /* --- panitia duties -------------------------------------------------- */
  const panitiaCard = card('Tugasan panitia', 'Yang lazim disemak oleh PPD / JPN',
    h('div', { class: 'card-body' },
      h('div', { class: 'table-wrap' },
        h('table', { class: 'tbl tbl-tight' },
          h('thead', null, h('tr', null, h('th', null, 'Tugasan'), h('th', null, 'Kekerapan'), h('th', null, 'Output'))),
          h('tbody', null, ...PANITIA_TUGAS.map((t) =>
            h('tr', null,
              h('td', null, t.nama),
              h('td', { class: 'tiny muted' }, t.kekerapan),
              h('td', { class: 'tiny' }, t.output))))))));

  /* --- KPM structure --------------------------------------------------- */
  const strukturCard = card('Struktur pentadbiran pendidikan', 'Rantaian dokumen dan pihak yang menyemak',
    h('div', { class: 'card-body' },
      h('div', { class: 'kssr-chain' },
        ...KPM.hierarki.map((x, i) => h('div', { class: 'kssr-chain-node' },
          h('div', { class: 'kssr-chain-kod' }, x.kod),
          h('div', { class: 'grow' },
            h('div', { style: { fontWeight: 600, fontSize: '12.5px' } }, x.nama),
            h('div', { class: 'tiny muted' }, x.peranan)),
          i < KPM.hierarki.length - 1 ? h('span', { class: 'kssr-chain-arrow', html: icon('down') }) : null))),
      h('div', { class: 'banner banner-info mt-3' }, ico('info'),
        h('div', { class: 'tiny' }, KPM.notaPentaksiran))));

  const dokumenCard = card('Dokumen rujukan', 'Fail yang perlu ada dalam simpanan guru',
    h('div', { class: 'card-body' },
      h('div', { class: 'table-wrap' },
        h('table', { class: 'tbl tbl-tight' },
          h('thead', null, h('tr', null, h('th', null, 'Kod'), h('th', null, 'Nama penuh'), h('th', null, 'Kegunaan'))),
          h('tbody', null, ...KPM.dokumen.map((d) =>
            h('tr', null,
              h('td', null, h('span', { class: 'chip', style: { fontSize: '10px' } }, d.kod)),
              h('td', null, d.nama),
              h('td', { class: 'tiny muted' }, d.guna))))))));

  /* --- orchestration CTA ------------------------------------------------ */
  const orkestraCard = card('Simulasi orkestrasi agentik', 'Lihat aliran berjalan nod demi nod — pencetus, cabang, webhook',
    h('div', { class: 'card-body' },
      h('div', { class: 'grid g-side-l' },
        h('div', { class: 'orch-cta-art', html:
          '<svg viewBox="0 0 320 118" role="img" aria-label="Graf aliran tiga nod">'
          + '<defs><marker id="ctaArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" class="orch-arrow"/></marker></defs>'
          + '<path class="orch-edge done" d="M62,59 C86,59 92,30 116,30" marker-end="url(#ctaArrow)"/>'
          + '<path class="orch-edge done" d="M62,59 C86,59 92,88 116,88" marker-end="url(#ctaArrow)"/>'
          + '<path class="orch-edge on hot" d="M180,30 C204,30 210,59 234,59" marker-end="url(#ctaArrow)"/>'
          + '<path class="orch-edge done" d="M180,88 C204,88 210,59 234,59" marker-end="url(#ctaArrow)"/>'
          + '<g class="orch-node tone-gold is-ok" transform="translate(4,38)"><rect class="orch-node-bg" width="58" height="42" rx="10"/><text class="orch-node-kind" x="10" y="18">PENCETUS</text><text class="orch-node-name" x="10" y="32">Webhook</text></g>'
          + '<g class="orch-node tone-primary is-ok" transform="translate(116,10)"><rect class="orch-node-bg" width="64" height="40" rx="10"/><text class="orch-node-kind" x="10" y="17">AGEN</text><text class="orch-node-name" x="10" y="31">Jana RPH</text></g>'
          + '<g class="orch-node tone-primary is-running" transform="translate(116,68)"><rect class="orch-node-bg" width="64" height="40" rx="10"/><text class="orch-node-kind" x="10" y="17">AGEN</text><text class="orch-node-name" x="10" y="31">Petakan DSKP</text></g>'
          + '<g class="orch-node tone-accent is-idle" transform="translate(234,38)"><rect class="orch-node-bg" width="70" height="42" rx="10"/><text class="orch-node-kind" x="10" y="18">WEBHOOK</text><text class="orch-node-name" x="10" y="32">Hantar ke PPD</text></g>'
          + '</svg>' }),
        h('div', null,
          h('div', { class: 'tiny muted' },
            'Tiga senario sedia ada — RPH automatik dari borang, laporan panitia mingguan, dan soal jawab DSKP dalam kumpulan WhatsApp. Setiap nod bertanya kepada penghala model yang sama seperti halaman Model Router, jadi label model pada graf adalah keputusan penghalaan yang sebenar.'),
          h('div', { class: 'row mt-3' },
            h('button', { class: 'btn btn-primary', onclick: () => ctx.go('orchestration') },
              ico('flow', 'ic'), 'Buka simulasi orkestrasi'))))));

  const usage = ctx.store.usageByModel();
  const runsCard = card('Panggilan agen terkini', 'Setiap baris menunjukkan model yang akhirnya berjaya',
    h('div', { class: 'card-body' },
      usage.length
        ? h('div', { class: 'table-wrap' },
          h('table', { class: 'tbl tbl-tight' },
            h('thead', null, h('tr', null, h('th', null, 'Agen'), h('th', null, 'Model'), h('th', { class: 'num' }, 'Panggilan'), h('th', { class: 'num' }, 'Kos'))),
            h('tbody', null, ...usage.slice(0, 8).map((u) =>
              h('tr', null,
                h('td', null, AGEN_KSSR.find((a) => a.key === u.agent)?.nama ?? u.agent ?? '—'),
                h('td', null, h('span', { class: 'mono tiny' }, CATALOG[u.modelSlug]?.display_name ?? u.modelSlug)),
                h('td', { class: 'num' }, String(u.calls)),
                h('td', { class: 'num nums' }, u.costUsd > 0 ? formatUSD(u.costUsd) : 'FREE'))))),
        )
        : emptyState('bolt', 'Belum ada panggilan', 'Jalankan mana-mana agen untuk melihat tangga penghalaan di sini.')));

  return h('div', { class: 'stack' },
    hero,
    stats,
    orkestraCard,
    h('div', { class: 'grid g-2' }, subjekCard, h('div', { class: 'stack' }, tpCard, emkCard)),
    h('div', { class: 'grid g-2' }, tugasanCard, panitiaCard),
    aliranCard,
    h('div', { class: 'grid g-2' }, strukturCard, dokumenCard),
    runsCard,
  );
}

/* ========================================================================== */
/*  RPH Studio                                                                */
/* ========================================================================== */
export function rphStudioPage(ctx) {
  const st = kssrState.rph;
  const out = h('div', { class: 'tiny muted' }, 'Isi borang di sebelah, kemudian jana. RPH akan dipaparkan di sini.');

  const mk = (label, key, { type = 'input', rows = 3, hint = null, options = null } = {}) => {
    let field;
    if (options) {
      field = h('select', { class: 'select', onchange: (e) => { st[key] = e.target.value; } },
        ...options.map((o) => option(o, o, st[key])));
    } else if (type === 'textarea') {
      field = h('textarea', { class: 'textarea', rows, oninput: (e) => { st[key] = e.target.value; } });
      field.value = st[key] ?? '';
    } else {
      field = h('input', { class: 'input', oninput: (e) => { st[key] = e.target.value; } });
      field.value = st[key] ?? '';
    }
    return h('div', { class: 'field' },
      h('label', null, label),
      field,
      hint ? h('div', { class: 'tiny muted mt-1' }, hint) : null,
    );
  };

  const kbatSel = h('select', { class: 'select', onchange: (e) => { st.kbat = e.target.value; } },
    ...Object.keys(KATA_KERJA).map((k) => option(k, `${k} — ${KATA_KERJA[k].slice(0, 3).join(', ')}…`, st.kbat)));

  const form = card('Butiran RPH', 'Medan ini sama seperti borang RPH sekolah',
    h('div', { class: 'card-body stack' },
      h('div', { class: 'grid g-2' },
        h('div', { class: 'field' }, h('label', null, 'Mata Pelajaran'),
          pilihSubjek(st.mata_pelajaran, (v) => { st.mata_pelajaran = v; })),
        h('div', { class: 'field' }, h('label', null, 'Tahun'),
          pilihTahun(st.tahun, (v) => { st.tahun = v; })),
      ),
      h('div', { class: 'grid g-2' },
        h('div', { class: 'field' }, h('label', null, 'Kelas'),
          pilihKelas(st.kelas, (v) => { st.kelas = v; })),
        mk('Masa', 'masa', { hint: 'Contoh: 8.10 – 9.10 pagi (60 minit)' }),
      ),
      mk('Bidang / Tema', 'bidang'),
      mk('Tajuk', 'tajuk'),
      mk('Standard Kandungan', 'standard_kandungan', { type: 'textarea', rows: 2, hint: 'Sertakan kod jika ada — agen tidak akan mencipta kod sendiri.' }),
      mk('Standard Pembelajaran', 'standard_pembelajaran', { type: 'textarea', rows: 3, hint: 'Satu standard satu baris.' }),
      h('div', { class: 'field' },
        h('label', null, 'Elemen Merentas Kurikulum (EMK)'),
        emkPicker(st.emk, (v) => { st.emk = v; })),
      h('div', { class: 'field' },
        h('label', null, 'Aras KBAT sasaran'),
        kbatSel,
        h('div', { class: 'tiny muted mt-1' }, `Kata kerja: ${(KATA_KERJA[st.kbat] ?? []).join(', ')}`)),
    ));

  const langkahRef = card('Struktur aktiviti PdPc', 'Cadangan peruntukan masa yang agen akan ikut',
    h('div', { class: 'card-body' },
      h('div', { class: 'kssr-steps-ref' },
        ...LANGKAH_PDPC.map((l) => h('div', { class: 'kssr-steps-ref-row' },
          h('div', { class: 'kssr-steps-ref-bar' }, h('i', { style: { width: `${l.peratus * 2}%` } })),
          h('div', { class: 'grow' },
            h('div', { class: 'row', style: { justifyContent: 'space-between' } },
              h('strong', { style: { fontSize: '12px' } }, l.nama),
              h('span', { class: 'tiny muted nums' }, `${l.peratus}%`)),
            h('div', { class: 'tiny muted' }, l.tujuan)))))));

  const run = async () => {
    const prompt = [
      `Mata Pelajaran: ${st.mata_pelajaran}`,
      `Tahun: ${st.tahun}`,
      `Kelas: ${st.kelas}`,
      `Masa: ${st.masa}`,
      `Bidang: ${st.bidang}`,
      `Tajuk: ${st.tajuk}`,
      `Standard Kandungan: ${st.standard_kandungan}`,
      `Standard Pembelajaran: ${st.standard_pembelajaran}`,
      `EMK dipilih: ${st.emk.map((k) => EMK.find((e) => e.kod === k)?.nama ?? k).join(', ')}`,
      `Aras KBAT sasaran: ${st.kbat} (kata kerja: ${(KATA_KERJA[st.kbat] ?? []).join(', ')})`,
      'Kurikulum: KSSR Semakan 2017.',
    ].join('\n');

    const completion = await ctx.callAgent({
      agentKey: 'rph', prompt, task: 'writing',
      systemPrompt: SYSTEM_PROMPTS.rph, record: true, maxTokens: 6144,
    });
    out.replaceChildren(resultBlock(completion, 'rph'));
  };

  return h('div', { class: 'stack' },
    pageHead('RPH Studio',
      'Jana Rancangan Pengajaran Harian yang lengkap dengan standard, objektif boleh ukur, aktiviti PdPc, EMK, KBAT dan ruang refleksi.'),
    h('div', { class: 'grid g-side' },
      h('div', { class: 'stack' },
        form,
        h('div', { class: 'row' },
          runButton('Jana RPH', run, out),
          h('button', {
            class: 'btn',
            onclick: () => { Object.assign(st, CONTOH_BORANG); ctx.refresh(); },
          }, 'Isi contoh'),
          h('button', {
            class: 'btn btn-ghost',
            onclick: () => { window.print(); },
          }, ico('file'), 'Cetak'),
        ),
      ),
      h('div', { class: 'stack' }, langkahRef),
    ),
    card('RPH dijana', 'Dipaparkan daripada kontrak JSON agen — bukan teks bebas',
      h('div', { class: 'card-body' }, out)),
  );
}

/* ========================================================================== */
/*  DSKP Explorer                                                             */
/* ========================================================================== */
export function dskpPage(ctx) {
  const st = kssrState.dskp;
  const out = h('div', { class: 'tiny muted' }, 'Pilih mata pelajaran dan tahun, kemudian petakan standard.');

  const bidangPilihan = {
    'Bahasa Melayu': ['Kemahiran Mendengar dan Bertutur', 'Kemahiran Membaca', 'Kemahiran Menulis', 'Aspek Seni Bahasa', 'Aspek Tatabahasa'],
    'Bahasa Inggeris': ['Listening and Speaking', 'Reading', 'Writing', 'Language Arts', 'Grammar'],
    'Matematik': ['Nombor dan Operasi', 'Sukatan dan Geometri', 'Perkaitan dan Algebra', 'Statistik dan Kebarangkalian'],
    'Sains': ['Sains Hayat', 'Sains Fizikal', 'Sains Bahan', 'Bumi dan Angkasa', 'Sains dan Teknologi'],
    'Pendidikan Islam': ['Al-Quran', 'Hadis', 'Akidah', 'Ibadah', 'Sirah', 'Adab', 'Jawi'],
    'Sejarah': ['Sejarah Awal Negara', 'Kegemilangan Kesultanan Melayu Melaka', 'Kedatangan Kuasa Asing', 'Kemerdekaan'],
  };

  const bidangList = bidangPilihan[st.mata_pelajaran] ?? ['Bidang 1', 'Bidang 2', 'Bidang 3'];

  const run = async () => {
    const prompt = [
      `Mata Pelajaran: ${st.mata_pelajaran}`,
      `Tahun: ${st.tahun}`,
      `Bidang: ${st.bidang}`,
      'Kurikulum: KSSR Semakan 2017.',
      'Petakan Standard Kandungan dan Standard Pembelajaran. Jangan cipta kod.',
    ].join('\n');
    const completion = await ctx.callAgent({
      agentKey: 'dskp', prompt, task: 'summarise',
      systemPrompt: SYSTEM_PROMPTS.dskp, record: true, maxTokens: 5120,
    });
    out.replaceChildren(resultBlock(completion, 'dskp'));
  };

  const picker = card('Pilih skop DSKP', 'Mata pelajaran → tahun → bidang',
    h('div', { class: 'card-body stack' },
      h('div', { class: 'grid g-2' },
        h('div', { class: 'field' }, h('label', null, 'Mata Pelajaran'),
          pilihSubjek(st.mata_pelajaran, (v) => {
            st.mata_pelajaran = v;
            const list = bidangPilihan[v] ?? ['Bidang 1', 'Bidang 2', 'Bidang 3'];
            st.bidang = list[0];
            ctx.refresh();
          })),
        h('div', { class: 'field' }, h('label', null, 'Tahun'),
          pilihTahun(st.tahun, (v) => { st.tahun = v; })),
      ),
      h('div', { class: 'field' }, h('label', null, 'Bidang'),
        h('select', { class: 'select', onchange: (e) => { st.bidang = e.target.value; } },
          ...bidangList.map((b) => option(b, b, st.bidang)))),
      h('div', { class: 'row' },
        runButton('Petakan standard', run, out),
        h('button', { class: 'btn btn-ghost', onclick: () => ctx.go('rph') }, ico('book'), 'Guna dalam RPH'),
      ),
      h('div', { class: 'banner banner-warn' }, ico('warn'),
        h('div', { class: 'tiny' },
          'Kod standard DSKP berbeza mengikut mata pelajaran dan tahun. Agen menandakan mana-mana kod yang perlu anda sahkan dengan salinan DSKP rasmi sekolah — ',
          'jangan hantar dokumen bertanda itu kepada PPD sebelum disemak.')),
    ));

  const refCard = card('Rangka DSKP', 'Standard Kandungan mengandungi Standard Pembelajaran',
    h('div', { class: 'card-body' },
      h('div', { class: 'kssr-dskp-tree' },
        h('div', { class: 'kssr-dskp-l1' }, 'Bidang'),
        h('div', { class: 'kssr-dskp-l2' }, 'Standard Kandungan (SK)'),
        h('div', { class: 'kssr-dskp-l3' }, 'Standard Pembelajaran (SP)'),
        h('div', { class: 'kssr-dskp-l4' }, 'Deskriptor Tahap Penguasaan (TP1–TP6)'),
      ),
      h('div', { class: 'tiny muted mt-2' },
        'Setiap SP mesti boleh ditaksir. Jika anda tidak dapat menyatakan bukti yang boleh diperhatikan, SP itu belum bersedia untuk diajar.')));

  return h('div', { class: 'stack' },
    pageHead('DSKP Explorer',
      'Petakan Standard Kandungan dan Standard Pembelajaran, lihat urutan pengajaran yang dicadangkan dan prasyaratnya.'),
    h('div', { class: 'grid g-side' },
      h('div', { class: 'stack' }, picker, refCard),
      h('div', { class: 'stack' },
        card('Urutan & prasyarat', 'Dijana bersama pemetaan',
          h('div', { class: 'card-body' },
            h('div', { class: 'kssr-seq' },
              ...['Kenal pasti pengetahuan sedia ada', 'Perkenal konsep melalui contoh konkrit', 'Latih dengan bimbingan', 'Aplikasi dalam konteks baharu', 'Pentaksiran formatif']
                .map((s, i) => h('div', { class: 'kssr-seq-row' },
                  h('span', { class: 'kssr-seq-no' }, String(i + 1)),
                  h('span', { class: 'grow' }, s))))))),
    ),
    card('Pemetaan standard', 'Setiap kod ditandakan jika perlu pengesahan DSKP',
      h('div', { class: 'card-body' }, out)),
  );
}

/* ========================================================================== */
/*  Pentaksiran (PBD)                                                         */
/* ========================================================================== */
export function pbdPage(ctx) {
  const st = kssrState.pbd;
  const out = h('div', { class: 'tiny muted' }, 'Tetapkan skop, kemudian jana item dan deskriptor TP.');

  const kaedahPicker = h('div', { class: 'kssr-emk' },
    ...KAEDAH_PBD.map((k) => {
      const on = st.kaedah.includes(k.nama);
      return h('button', {
        class: `kssr-emk-chip${on ? ' on' : ''}`, title: k.guna,
        onclick: () => {
          st.kaedah = on ? st.kaedah.filter((x) => x !== k.nama) : [...st.kaedah, k.nama];
          ctx.refresh();
        },
      }, k.nama);
    }));

  const run = async () => {
    const prompt = [
      `Mata Pelajaran: ${st.mata_pelajaran}`,
      `Tahun: ${st.tahun}`,
      `Tajuk: ${st.tajuk}`,
      `Bilangan item diminta: ${st.bilangan}`,
      `Kaedah pentaksiran: ${st.kaedah.join(', ')}`,
      'Kurikulum: KSSR Semakan 2017. Sertakan deskriptor TP1–TP6 dan pelan intervensi.',
    ].join('\n');
    const completion = await ctx.callAgent({
      agentKey: 'pbd', prompt, task: 'qa',
      systemPrompt: SYSTEM_PROMPTS.pbd, record: true, maxTokens: 6144,
    });
    out.replaceChildren(resultBlock(completion, 'pbd'));
  };

  const form = card('Skop pentaksiran', 'Apa yang hendak ditaksir',
    h('div', { class: 'card-body stack' },
      h('div', { class: 'grid g-2' },
        h('div', { class: 'field' }, h('label', null, 'Mata Pelajaran'),
          pilihSubjek(st.mata_pelajaran, (v) => { st.mata_pelajaran = v; })),
        h('div', { class: 'field' }, h('label', null, 'Tahun'),
          pilihTahun(st.tahun, (v) => { st.tahun = v; })),
      ),
      h('div', { class: 'field' }, h('label', null, 'Tajuk'),
        (() => { const i = h('input', { class: 'input', oninput: (e) => { st.tajuk = e.target.value; } }); i.value = st.tajuk; return i; })()),
      h('div', { class: 'grid g-2' },
        h('div', { class: 'field' }, h('label', null, 'Bilangan item'),
          (() => {
            const i = h('input', { class: 'input', type: 'number', min: '1', max: '20', oninput: (e) => { st.bilangan = Number(e.target.value); } });
            i.value = String(st.bilangan);
            return i;
          })()),
        h('div', { class: 'field' }, h('label', null, 'Jumlah murid (anggaran)'),
          h('input', { class: 'input', type: 'number', value: '30', placeholder: '30' })),
      ),
      h('div', { class: 'field' }, h('label', null, 'Kaedah PBD'), kaedahPicker),
      h('div', { class: 'row' }, runButton('Jana item & deskriptor', run, out)),
    ));

  const kaedahCard = card('Kaedah PBD', 'Bilakah setiap kaedah sesuai digunakan',
    h('div', { class: 'card-body' },
      h('div', { class: 'table-wrap' },
        h('table', { class: 'tbl tbl-tight' },
          h('thead', null, h('tr', null, h('th', null, 'Kaedah'), h('th', null, 'Sesuai untuk'))),
          h('tbody', null, ...KAEDAH_PBD.map((k) =>
            h('tr', null, h('td', null, k.nama), h('td', { class: 'tiny muted' }, k.guna))))))));

  const tpCard = card('Tangga TP1–TP6', 'Rujukan semasa menandakan murid',
    h('div', { class: 'card-body' }, tpLegend()));

  return h('div', { class: 'stack' },
    pageHead('Pentaksiran Bilik Darjah (PBD)',
      'Bina item pentaksiran, tetapkan deskriptor Tahap Penguasaan 1–6 dan sediakan pelan intervensi untuk murid yang belum menguasai.'),
    h('div', { class: 'grid g-side' },
      h('div', { class: 'stack' }, form, kaedahCard),
      h('div', { class: 'stack' }, tpCard),
    ),
    card('Instrumen dijana', 'Item, deskriptor TP dan intervensi',
      h('div', { class: 'card-body' }, out)),
  );
}

/* ========================================================================== */
/*  BBM & Kreatif                                                             */
/* ========================================================================== */
export function bbmPage(ctx) {
  const st = kssrState.bbm;
  const out = h('div', { class: 'tiny muted' }, 'Pilih jenis bahan, kemudian jana.');

  const JENIS = ['Lembaran kerja', 'Kad imbas', 'Infografik', 'Peta minda', 'Kuiz', 'Permainan pembelajaran', 'Slide pembentangan'];

  const run = async () => {
    const prompt = [
      `Mata Pelajaran: ${st.mata_pelajaran}`,
      `Tahun: ${st.tahun}`,
      `Tajuk: ${st.tajuk}`,
      `Jenis bahan: ${st.jenis}`,
      'Kurikulum: KSSR Semakan 2017. Bahan mesti boleh dicetak dan kos rendah.',
    ].join('\n');
    const agentKey = st.jenis === 'Kuiz' || st.jenis === 'Permainan pembelajaran' ? 'tutor' : 'bbm';
    const completion = await ctx.callAgent({
      agentKey, prompt,
      task: agentKey === 'tutor' ? 'quiz' : 'design',
      systemPrompt: agentKey === 'tutor' ? SYSTEM_PROMPTS.tutor : SYSTEM_PROMPTS.bbm,
      record: true, maxTokens: 6144,
      subtype: st.jenis === 'Permainan pembelajaran' ? 'game' : null,
    });
    out.replaceChildren(resultBlock(completion, agentKey, st.jenis === 'Permainan pembelajaran' ? 'game' : null));
  };

  const form = card('Spesifikasi bahan', 'Apa yang hendak dihasilkan',
    h('div', { class: 'card-body stack' },
      h('div', { class: 'grid g-2' },
        h('div', { class: 'field' }, h('label', null, 'Mata Pelajaran'),
          pilihSubjek(st.mata_pelajaran, (v) => { st.mata_pelajaran = v; })),
        h('div', { class: 'field' }, h('label', null, 'Tahun'),
          pilihTahun(st.tahun, (v) => { st.tahun = v; })),
      ),
      h('div', { class: 'field' }, h('label', null, 'Tajuk'),
        (() => { const i = h('input', { class: 'input', oninput: (e) => { st.tajuk = e.target.value; } }); i.value = st.tajuk; return i; })()),
      h('div', { class: 'field' }, h('label', null, 'Jenis bahan'),
        h('div', { class: 'kssr-jenis' },
          ...JENIS.map((j) => h('button', {
            class: `kssr-jenis-chip${j === st.jenis ? ' on' : ''}`,
            onclick: () => { st.jenis = j; ctx.refresh(); },
          }, j)))),
      h('div', { class: 'row' }, runButton('Jana bahan', run, out)),
    ));

  const jenisCard = card('Bank bahan', 'Apa yang setiap jenis hasilkan',
    h('div', { class: 'card-body' },
      h('div', { class: 'table-wrap' },
        h('table', { class: 'tbl tbl-tight' },
          h('thead', null, h('tr', null, h('th', null, 'Jenis'), h('th', null, 'Output'), h('th', null, 'Agen'))),
          h('tbody', null,
            ...[
              ['Lembaran kerja', 'Soalan + ruang jawapan, boleh cetak', 'bbm'],
              ['Kad imbas', 'Kad hadapan/belakang untuk latih tubi', 'bbm'],
              ['Infografik', 'Struktur visual + carta', 'bbm'],
              ['Peta minda', 'Nod berhierarki untuk rumusan', 'bbm'],
              ['Kuiz', 'Soalan objektif + penjelasan jawapan', 'tutor'],
              ['Permainan pembelajaran', 'HTML5 boleh dimain dalam pelayar', 'tutor'],
              ['Slide pembentangan', 'Rangka slaid + nota guru', 'bbm'],
            ].map(([j, o, a]) => h('tr', null,
              h('td', null, j),
              h('td', { class: 'tiny muted' }, o),
              h('td', null, h('span', { class: 'chip', style: { fontSize: '10px' } }, a)))))))));

  const tipCard = card('Prinsip BBM berkesan', 'Peringatan ringkas',
    h('div', { class: 'card-body' },
      h('ul', { class: 'kssr-list' },
        ...[
          'Konkrit dahulu — murid sekolah rendah belajar melalui objek sebenar sebelum simbol.',
          'Satu bahan, satu objektif — jangan gabungkan dua kemahiran dalam satu lembaran.',
          'Boleh dicetak hitam-putih — banyak sekolah mencetak tanpa warna.',
          'Ada pembezaan — sediakan versi untuk murid lemah, sederhana dan cemerlang.',
          'Kos rendah — bahan daripada kotak, kertas terpakai dan bahan sekitar sekolah.',
        ].map((t) => h('li', null, h('span', { html: icon('check'), class: 'ic kssr-li-ic' }), h('span', null, t))))));

  return h('div', { class: 'stack' },
    pageHead('Bahan Bantu Mengajar (BBM)',
      'Hasilkan lembaran kerja, kad imbas, infografik, kuiz dan permainan pembelajaran yang selari dengan standard DSKP.'),
    h('div', { class: 'grid g-side' },
      h('div', { class: 'stack' }, form, tipCard),
      h('div', { class: 'stack' }, jenisCard),
    ),
    card('Bahan dijana', 'Sedia untuk dicetak atau dimainkan',
      h('div', { class: 'card-body' }, out)),
  );
}

/**
 * KSSR renderers — one per education agent output contract.
 *
 * Mirrors renderers.js, but the payloads are KPM curriculum documents rather
 * than software artefacts, so the shapes are different (a lesson plan, a
 * standard/pembelajaran tree, a Tahap Penguasaan ladder, a worksheet).
 */
import { h, esc, copy, toast } from './ui.js';
import { icon, ico } from './renderers.js';
import { TP as TP_LADDER } from './kssr.js';

const panel = (title, body, extra = null) =>
  h('div', { class: 'kssr-panel' },
    h('div', { class: 'kssr-panel-head' },
      h('strong', null, title),
      h('div', { class: 'grow' }),
      extra,
    ),
    body,
  );

const chipRow = (items, cls = 'chip') =>
  h('div', { class: 'row-wrap', style: { gap: '6px' } }, ...items.map((t) => h('span', { class: cls }, t)));

/** Small labelled block used all over the education views. */
const field = (label, value) =>
  h('div', { class: 'kssr-field' },
    h('div', { class: 'kssr-field-k' }, label),
    h('div', { class: 'kssr-field-v' }, value),
  );

const listBlock = (items = [], mark = 'check') =>
  h('ul', { class: 'kssr-list' },
    ...items.map((t) => h('li', null,
      h('span', { html: icon(mark), class: 'ic kssr-li-ic' }),
      h('span', { html: esc(String(t)) }),
    )),
  );

/* -------------------------------------------------------------- RPH view */

export function rphView(p) {
  const meta = h('div', { class: 'kssr-meta' },
    field('Mata Pelajaran', p.mata_pelajaran),
    field('Kelas', p.kelas),
    field('Masa', p.masa),
    field('Bidang', p.bidang),
    field('Tajuk', h('strong', null, p.tajuk)),
  );

  const standards = h('div', { class: 'kssr-std' },
    h('div', { class: 'kssr-std-col' },
      h('div', { class: 'kssr-std-h' }, 'Standard Kandungan'),
      ...(p.standard_kandungan ?? []).map((s) =>
        h('div', { class: 'kssr-std-item' },
          h('span', { class: 'kssr-code' }, s.kod),
          h('span', null, s.pernyataan))),
    ),
    h('div', { class: 'kssr-std-col' },
      h('div', { class: 'kssr-std-h' }, 'Standard Pembelajaran'),
      ...(p.standard_pembelajaran ?? []).map((s) =>
        h('div', { class: 'kssr-std-item' },
          h('span', { class: 'kssr-code' }, s.kod),
          h('span', null, s.pernyataan))),
    ),
  );

  const langkah = h('div', { class: 'kssr-steps' },
    ...(p.langkah ?? []).map((l, i) =>
      h('div', { class: 'kssr-step' },
        h('div', { class: 'kssr-step-no' }, String(i + 1)),
        h('div', { class: 'grow' },
          h('div', { class: 'kssr-step-head' },
            h('strong', null, l.nama),
            h('span', { class: 'kssr-dur' }, l.masa ?? ''),
          ),
          h('div', { class: 'kssr-step-cols' },
            h('div', null,
              h('div', { class: 'kssr-mini-h' }, 'Aktiviti Guru'),
              listBlock(l.aktiviti_guru ?? [], 'arrow')),
            h('div', null,
              h('div', { class: 'kssr-mini-h' }, 'Aktiviti Murid'),
              listBlock(l.aktiviti_murid ?? [], 'arrow')),
          ),
          l.catatan ? h('div', { class: 'kssr-note' }, h('em', null, l.catatan)) : null,
        ),
      )),
  );

  return h('div', { class: 'kssr-doc' },
    h('div', { class: 'kssr-doc-head' },
      h('div', { class: 'kssr-doc-badge' }, ico('book'), 'RANCANGAN PENGAJARAN HARIAN'),
      h('div', { class: 'kssr-doc-sub' }, 'KSSR Semakan 2017 · Kementerian Pendidikan Malaysia'),
    ),
    meta,
    panel('Standard DSKP', standards),
    h('div', { class: 'kssr-two' },
      panel('Objektif Pembelajaran', listBlock(p.objektif ?? [], 'check')),
      panel('Kriteria Kejayaan', listBlock(p.kriteria_kejayaan ?? [], 'check')),
    ),
    panel('Aktiviti PdPc', langkah),
    h('div', { class: 'kssr-two' },
      panel('Elemen Merentas Kurikulum (EMK)', chipRow(p.emk ?? [])),
      panel('KBAT', listBlock(p.kbat ?? [], 'spark')),
    ),
    h('div', { class: 'kssr-two' },
      panel('Bahan Bantu Mengajar', chipRow(p.bbm ?? [])),
      panel('Penilaian',
        h('div', null,
          h('div', { class: 'kssr-mini-h' }, 'Kaedah'),
          chipRow(p.penilaian?.kaedah ?? []),
          h('div', { class: 'kssr-mini-h mt-2' }, 'Instrumen'),
          h('div', { class: 'tiny' }, p.penilaian?.instrumen ?? '—'),
        )),
    ),
    panel('Refleksi (diisi selepas sesi)', h('div', { class: 'tiny' }, p.refleksi ?? '—')),
  );
}

/* ------------------------------------------------------------- DSKP view */

export function dskpView(p) {
  return h('div', { class: 'kssr-doc' },
    h('div', { class: 'kssr-doc-head' },
      h('div', { class: 'kssr-doc-badge' }, ico('layers'), 'PEMETAAN DSKP'),
      h('div', { class: 'kssr-doc-sub' }, `${p.mata_pelajaran ?? ''} · ${p.tahun ?? ''} · ${p.bidang ?? ''}`),
    ),
    ...(p.standard_kandungan ?? []).map((sk) =>
      panel(sk.kod,
        h('div', null,
          h('div', { class: 'kssr-sk-stmt' }, sk.pernyataan),
          sk.sahkan_dengan_dskp
            ? h('div', { class: 'banner banner-warn mt-2' }, ico('warn'),
              h('div', { class: 'tiny' }, 'Kod ini perlu disahkan dengan salinan DSKP rasmi sekolah.'))
            : null,
          h('div', { class: 'kssr-sp-tree' },
            ...(sk.standard_pembelajaran ?? []).map((sp) =>
              h('div', { class: 'kssr-sp' },
                h('span', { class: 'kssr-code' }, sp.kod),
                h('span', { class: 'grow' }, sp.pernyataan))),
          ),
        ),
        h('span', { class: 'kssr-count' }, `${(sk.standard_pembelajaran ?? []).length} SP`),
      )),
    h('div', { class: 'kssr-two' },
      panel('Cadangan Urutan Pengajaran', listBlock(p.urutan_cadangan ?? [], 'arrow')),
      panel('Prasyarat', listBlock(p.prasyarat ?? [], 'info')),
    ),
    (p.nota ?? []).length ? panel('Nota', listBlock(p.nota, 'info')) : null,
  );
}

/* -------------------------------------------------------------- PBD view */

export function pbdView(p) {
  const tpMap = Object.fromEntries(TP_LADDER.map((t) => [t.tp, t]));

  const deskriptor = h('div', { class: 'kssr-tp' },
    ...(p.deskriptor_tp ?? []).map((d) => {
      const meta = tpMap[d.tp] ?? {};
      return h('div', { class: 'kssr-tp-row', style: { borderLeftColor: meta.warna ?? 'hsl(var(--border))' } },
        h('div', { class: 'kssr-tp-badge', style: { background: meta.warna ?? 'hsl(var(--muted))' } }, `TP${d.tp}`),
        h('div', { class: 'grow' },
          h('div', { class: 'kssr-tp-label' }, meta.label ?? '', h('span', { class: 'tiny muted' }, meta.aras ? ` · ${meta.aras}` : '')),
          h('div', { class: 'tiny' }, d.deskriptor),
          d.bukti ? h('div', { class: 'kssr-note' }, h('em', null, `Bukti: ${d.bukti}`)) : null,
        ),
      );
    }),
  );

  const items = h('div', { class: 'kssr-items' },
    ...(p.item ?? []).map((it) =>
      h('div', { class: 'kssr-item' },
        h('div', { class: 'kssr-item-no' }, String(it.id)),
        h('div', { class: 'grow' },
          h('div', { class: 'row-wrap', style: { gap: '6px', marginBottom: '5px' } },
            h('span', { class: 'kssr-tag' }, it.jenis),
            h('span', { class: 'kssr-tag kssr-tag-aras' }, it.aras),
          ),
          h('div', { class: 'kssr-item-q' }, it.soalan),
          it.jawapan ? h('details', { class: 'kssr-details' },
            h('summary', null, 'Jawapan & bukti'),
            h('div', { class: 'tiny' },
              h('div', null, h('strong', null, 'Jawapan: '), it.jawapan),
              it.bukti_diperhatikan ? h('div', { class: 'mt-1' }, h('strong', null, 'Bukti diperhatikan: '), it.bukti_diperhatikan) : null,
            )) : null,
        ),
      )),
  );

  return h('div', { class: 'kssr-doc' },
    h('div', { class: 'kssr-doc-head' },
      h('div', { class: 'kssr-doc-badge' }, ico('chart'), 'PENTAKSIRAN BILIK DARJAH'),
      h('div', { class: 'kssr-doc-sub' }, `${p.mata_pelajaran ?? ''} · ${p.tahun ?? ''} · ${p.tajuk ?? ''}`),
    ),
    (p.standard_pembelajaran ?? []).length
      ? panel('Standard Pembelajaran dinilai', chipRow(p.standard_pembelajaran))
      : null,
    h('div', { class: 'kssr-two' },
      panel('Kaedah Pentaksiran', chipRow(p.kaedah ?? [])),
      panel('Bilangan Item', h('div', { class: 'kssr-big' }, String((p.item ?? []).length))),
    ),
    panel('Item Pentaksiran', items),
    panel('Deskriptor Tahap Penguasaan (TP1–TP6)', deskriptor),
    (p.intervensi ?? []).length
      ? panel('Pelan Intervensi',
        h('div', { class: 'kssr-iv' },
          ...p.intervensi.map((v) =>
            h('div', { class: 'kssr-iv-row' },
              h('span', { class: 'kssr-iv-grp' }, v.kumpulan),
              h('span', { class: 'grow' }, v.tindakan)))))
      : null,
  );
}

/* -------------------------------------------------------------- BBM view */

export function bbmView(p) {
  const worksheet = p.lembaran_kerja ?? {};
  return h('div', { class: 'kssr-doc' },
    h('div', { class: 'kssr-doc-head' },
      h('div', { class: 'kssr-doc-badge' }, ico('brush'), 'BAHAN BANTU MENGAJAR'),
      h('div', { class: 'kssr-doc-sub' }, `${p.mata_pelajaran ?? ''} · ${p.tahun ?? ''} · ${p.jenis ?? ''}`),
    ),
    panel('Objektif', listBlock(p.objektif ?? [], 'check')),
    h('div', { class: 'kssr-two' },
      panel('Bahan Diperlukan', listBlock(p.bahan_diperlukan ?? [], 'plus')),
      panel('Cadangan Kos', h('div', { class: 'kssr-big' }, p.cadangan_kos ?? '—')),
    ),
    panel('Langkah Penggunaan', listBlock(p.langkah_penggunaan ?? [], 'arrow')),
    worksheet.soalan?.length
      ? panel('Lembaran Kerja — boleh cetak',
        h('div', { class: 'kssr-worksheet' },
          h('div', { class: 'kssr-ws-head' },
            h('div', null, h('strong', null, p.tajuk ?? '')),
            h('div', { class: 'tiny muted' }, p.mata_pelajaran ?? '')),
          worksheet.arahan ? h('div', { class: 'kssr-ws-arahan' }, h('em', null, worksheet.arahan)) : null,
          ...worksheet.soalan.map((q) =>
            h('div', { class: 'kssr-ws-q' },
              h('span', { class: 'kssr-ws-no' }, `${q.no}.`),
              h('div', { class: 'grow' },
                h('div', null, q.soalan),
                h('div', { class: 'kssr-ws-space' }, q.ruang ?? ''),
              ))),
        ),
        h('button', {
          class: 'btn btn-sm btn-ghost mt-2', onclick: () => window.print(),
        }, ico('file'), 'Cetak lembaran'))
      : null,
    panel('Pembezaan Pengajaran',
      h('div', { class: 'kssr-two' },
        h('div', null, h('div', { class: 'kssr-mini-h' }, 'Murid lemah'), h('div', { class: 'tiny' }, p.pembezaan?.murid_lemah ?? '—')),
        h('div', null, h('div', { class: 'kssr-mini-h' }, 'Murid sederhana'), h('div', { class: 'tiny' }, p.pembezaan?.murid_sederhana ?? '—')),
      ),
      h('div', { class: 'kssr-mini-h mt-2' }, 'Murid cemerlang'),
      h('div', { class: 'tiny' }, p.pembezaan?.murid_cemerlang ?? '—'),
    ),
  );
}

/* ---------------------------------------------------------- Panitia view */

export function panitiaView(p) {
  return h('div', { class: 'kssr-doc' },
    h('div', { class: 'kssr-doc-head' },
      h('div', { class: 'kssr-doc-badge' }, ico('users'), (p.jenis_dokumen ?? 'DOKUMEN PANITIA').toUpperCase()),
      h('div', { class: 'kssr-doc-sub' }, `${p.mata_pelajaran ?? ''} · ${p.tahun ?? ''}`),
    ),
    (p.rpt ?? []).length
      ? panel('Rancangan Pengajaran Tahunan (RPT)',
        h('div', { class: 'table-wrap' },
          h('table', { class: 'tbl tbl-tight' },
            h('thead', null, h('tr', null,
              h('th', { style: { width: '64px' } }, 'Minggu'),
              h('th', null, 'Bidang'),
              h('th', null, 'Standard'),
              h('th', null, 'Aktiviti'),
            )),
            h('tbody', null, ...p.rpt.map((r) =>
              h('tr', null,
                h('td', { class: 'num' }, String(r.minggu)),
                h('td', null, r.bidang),
                h('td', null,
                  h('div', { class: 'tiny' }, r.standard_kandungan ?? ''),
                  ...(r.standard_pembelajaran ?? []).map((s) => h('div', { class: 'tiny muted' }, s))),
                h('td', null,
                  h('div', { class: 'tiny' }, r.cadangan_aktiviti ?? ''),
                  r.bbm ? h('div', { class: 'tiny muted' }, `BBM: ${r.bbm}`) : null),
              ))),
          )))
      : null,
    p.mesyuarat
      ? h('div', { class: 'kssr-two' },
        panel('Agenda Mesyuarat', listBlock(p.mesyuarat.agenda ?? [], 'arrow')),
        panel('Tindakan',
          h('div', { class: 'kssr-iv' },
            ...(p.mesyuarat.tindakan ?? []).map((t) =>
              h('div', { class: 'kssr-iv-row' },
                h('span', { class: 'grow' }, t.perkara),
                h('span', { class: 'kssr-iv-grp' }, t.tanggungjawab),
                h('span', { class: 'tiny muted nowrap' }, t.tarikh ?? ''))))))
      : null,
    p.analisis
      ? panel('Analisis Pencapaian',
        h('div', { class: 'kssr-grades' },
          ...(p.analisis.gred ?? []).map((g) =>
            h('div', { class: 'kssr-grade' },
              h('div', { class: 'kssr-grade-badge' }, g.gred),
              h('div', { class: 'grow' },
                h('div', { class: 'kssr-grade-bar' },
                  h('i', { style: { width: `${Math.min(100, g.peratus ?? 0)}%` } })),
                h('div', { class: 'tiny muted' }, `${g.bilangan} murid · ${g.peratus}%`)),
            ))),
        (p.analisis.isu ?? []).length
          ? h('div', { class: 'mt-3' }, h('div', { class: 'kssr-mini-h' }, 'Isu'), listBlock(p.analisis.isu, 'warn'))
          : null,
        (p.analisis.intervensi ?? []).length
          ? h('div', { class: 'mt-2' }, h('div', { class: 'kssr-mini-h' }, 'Intervensi'), listBlock(p.analisis.intervensi, 'arrow'))
          : null)
      : null,
  );
}

/* ----------------------------------------------------------- Bahasa view */

export function bahasaView(p) {
  return h('div', { class: 'kssr-doc' },
    h('div', { class: 'kssr-doc-head' },
      h('div', { class: 'kssr-doc-badge' }, ico('globe'), 'ADAPTASI BAHASA'),
      h('div', { class: 'kssr-doc-sub' }, `${p.tajuk ?? ''} · aras ${p.aras_bahasa ?? '—'}`),
    ),
    ...(p.terjemahan ?? []).map((t) =>
      panel(t.bahasa, h('div', { class: 'kssr-trans' }, t.teks))),
    (p.istilah_kurikulum ?? []).length
      ? panel('Istilah Kurikulum',
        h('div', { class: 'table-wrap' },
          h('table', { class: 'tbl tbl-tight' },
            h('thead', null, h('tr', null, h('th', null, 'Bahasa Melayu'), h('th', null, 'English'), h('th', null, 'Nota'))),
            h('tbody', null, ...p.istilah_kurikulum.map((i) =>
              h('tr', null, h('td', null, i.bm), h('td', null, i.en), h('td', { class: 'tiny muted' }, i.nota ?? '')))),
          )))
      : null,
    (p.nota_budaya ?? []).length ? panel('Nota Budaya', listBlock(p.nota_budaya, 'info')) : null,
  );
}

/* ------------------------------------------------------------ Admin view */

export function adminView(p) {
  const r = p.ringkasan ?? {};
  return h('div', { class: 'kssr-doc' },
    h('div', { class: 'kssr-doc-head' },
      h('div', { class: 'kssr-doc-badge' }, ico('db'), (p.jenis ?? 'LAPORAN PENTADBIRAN').toUpperCase()),
      h('div', { class: 'kssr-doc-sub' }, p.sekolah ?? ''),
    ),
    h('div', { class: 'kssr-meta' },
      field('Jumlah Murid', h('strong', null, String(r.jumlah_murid ?? '—'))),
      field('Jumlah Kelas', h('strong', null, String(r.jumlah_kelas ?? '—'))),
      field('Jumlah Guru', h('strong', null, String(r.jumlah_guru ?? '—'))),
    ),
    (p.pecahan ?? []).length
      ? panel('Pecahan Mengikut Kelas',
        h('div', { class: 'table-wrap' },
          h('table', { class: 'tbl tbl-tight' },
            h('thead', null, h('tr', null, h('th', null, 'Kelas'), h('th', { class: 'num' }, 'Murid'), h('th', null, 'Guru Kelas'))),
            h('tbody', null, ...p.pecahan.map((x) =>
              h('tr', null, h('td', null, x.kelas), h('td', { class: 'num' }, String(x.murid)), h('td', null, x.guru_kelas ?? '—')))),
          )))
      : null,
    h('div', { class: 'kssr-two' },
      panel('Isu', listBlock(p.isu ?? [], 'warn')),
      panel('Tindakan', listBlock(p.tindakan ?? [], 'arrow')),
    ),
    (p.sumber_data ?? []).length ? panel('Sumber Data', chipRow(p.sumber_data)) : null,
  );
}

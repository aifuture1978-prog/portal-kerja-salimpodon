/**
 * KSSR simulator payloads.
 *
 * The base simulator produces software artefacts. This module produces the
 * education documents instead, in exactly the JSON contracts declared by
 * SYSTEM_PROMPTS — so every KSSR renderer receives well-formed input.
 *
 * The content is derived from the form fields the teacher filled in, so the
 * generated RPH genuinely reflects the standard and topic that were typed.
 */

/** Read `Label: value` out of a multi-line prompt. */
export function fieldOf(prompt, label, fallback = '') {
  const re = new RegExp(`^\\s*${label}\\s*:\\s*(.+)$`, 'im');
  const m = re.exec(prompt ?? '');
  return (m?.[1] ?? fallback).trim();
}

const lines = (s) => String(s ?? '').split('\n').map((x) => x.trim()).filter(Boolean);

/** Split "SP 5.1.1 — Mengenal pasti…" into {kod, pernyataan}. */
function splitStandard(raw, fallbackPrefix, i) {
  const t = String(raw ?? '').trim();
  const m = /^([A-Za-z]*\s*\d+(?:\.\d+)*)\s*[—:–-]\s*(.+)$/.exec(t);
  if (m) return { kod: m[1].replace(/\s+/g, ' ').trim(), pernyataan: m[2].trim() };
  return { kod: `${fallbackPrefix} ${i + 1}`, pernyataan: t };
}

const namaPendek = (s) => String(s ?? '').split(' — ')[0].trim();

/* ------------------------------------------------------------------- RPH */

export function rphPayload(prompt) {
  const subjek = fieldOf(prompt, 'Mata Pelajaran', 'Bahasa Melayu');
  const tahun = fieldOf(prompt, 'Tahun', 'Tahun 3');
  const kelas = fieldOf(prompt, 'Kelas', '3 Bestari');
  const masa = fieldOf(prompt, 'Masa', '8.10 – 9.10 pagi (60 minit)');
  const bidang = fieldOf(prompt, 'Bidang', 'Kemahiran Bahasa');
  const tajuk = fieldOf(prompt, 'Tajuk', 'Tajuk pengajaran');
  const skRaw = lines(fieldOf(prompt, 'Standard Kandungan'));
  const spRaw = lines(fieldOf(prompt, 'Standard Pembelajaran'));
  const emkRaw = fieldOf(prompt, 'EMK dipilih');
  const kbat = fieldOf(prompt, 'Aras KBAT sasaran', 'Mengaplikasi').replace(/\s*\(.*$/, '');

  const standard_kandungan = (skRaw.length ? skRaw : [`SK 1 — ${tajuk}`]).map((s, i) => splitStandard(s, 'SK', i));
  const standard_pembelajaran = (spRaw.length ? spRaw : [`SP 1.1 — Mengenal pasti ${tajuk.toLowerCase()}`]).map((s, i) => splitStandard(s, 'SP', i));

  const emk = emkRaw ? emkRaw.split(',').map((x) => x.trim()).filter(Boolean) : ['Nilai Murni'];
  const kbatVerbs = {
    Mengingat: 'menyatakan', Memahami: 'menjelaskan', Mengaplikasi: 'menggunakan',
    Menganalisis: 'membandingkan', Menilai: 'menilai', Mencipta: 'menghasilkan',
  };
  const kataKerja = kbatVerbs[kbat] ?? 'menggunakan';

  return {
    mata_pelajaran: subjek,
    kelas,
    masa,
    bidang,
    tajuk,
    standard_kandungan,
    standard_pembelajaran,
    objektif: [
      `Pada akhir sesi ini, murid dapat ${kataKerja} ${tajuk.toLowerCase()} dengan tepat.`,
      `Murid dapat memberikan sekurang-kurangnya tiga contoh ${tajuk.toLowerCase()} dalam konteks harian.`,
      `Murid dapat bekerjasama dalam kumpulan semasa aktiviti ${bidang.toLowerCase()}.`,
    ],
    kriteria_kejayaan: [
      `Saya boleh ${kataKerja} ${tajuk.toLowerCase()} tanpa bantuan guru.`,
      'Saya boleh memberi contoh sendiri.',
      'Saya boleh membantu rakan yang belum faham.',
    ],
    emk,
    kbat: [
      `Menganalisis — bandingkan dua contoh ${tajuk.toLowerCase()} dan nyatakan perbezaannya.`,
      `Menilai — pilih contoh yang paling tepat dan berikan alasan.`,
      `Mencipta — hasilkan satu contoh baharu ${tajuk.toLowerCase()} bersama pasangan.`,
    ],
    bbm: [
      'Kad imbasan bergambar',
      'Papan putih dan pen marker',
      'Lembaran kerja bercetak',
      'Bahan maujud daripada persekitaran bilik darjah',
    ],
    langkah: [
      {
        nama: 'Set Induksi',
        masa: '6 minit',
        aktiviti_guru: [
          'Menunjukkan bahan maujud dan bertanya soalan terbuka berkaitan tajuk.',
          'Mengaitkan jawapan murid dengan tajuk sesi hari ini.',
        ],
        aktiviti_murid: [
          'Memerhati bahan yang ditunjukkan.',
          'Memberi respons berdasarkan pengalaman sendiri.',
        ],
        catatan: 'Pastikan semua murid memberi sekurang-kurangnya satu respons.',
      },
      {
        nama: 'Langkah 1 — Penerokaan',
        masa: '15 minit',
        aktiviti_guru: [
          `Mengagihkan kad imbasan dan meminta murid meneroka ${tajuk.toLowerCase()} dalam kumpulan kecil.`,
          'Bergerak dari kumpulan ke kumpulan untuk memberi bimbingan.',
        ],
        aktiviti_murid: [
          'Berkongsi idea dalam kumpulan.',
          'Mengasingkan kad mengikut ciri yang mereka perhatikan sendiri.',
        ],
        catatan: 'Biarkan murid membina kefahaman dahulu sebelum guru menerangkan.',
      },
      {
        nama: 'Langkah 2 — Penerangan',
        masa: '18 minit',
        aktiviti_guru: [
          `Menerangkan ${tajuk.toLowerCase()} dengan merujuk ${standard_pembelajaran[0]?.kod ?? 'standard pembelajaran'}.`,
          'Menulis contoh di papan putih dan menyemak kefahaman murid.',
        ],
        aktiviti_murid: [
          'Mendengar penerangan dan mencatat nota ringkas.',
          'Menjawab soalan semak kefahaman secara lisan.',
        ],
        catatan: 'Gunakan teknik soal jawab, bukan syarahan sehala.',
      },
      {
        nama: 'Langkah 3 — Pengukuhan',
        masa: '15 minit',
        aktiviti_guru: [
          'Mengedarkan lembaran kerja dan memantau kerja murid.',
          `Mengemukakan soalan KBAT aras ${kbat.toLowerCase()} kepada murid yang siap awal.`,
        ],
        aktiviti_murid: [
          'Menyiapkan lembaran kerja secara individu.',
          'Membentangkan jawapan kepada kelas.',
        ],
        catatan: 'Sediakan lembaran versi mudah untuk murid yang memerlukan.',
      },
      {
        nama: 'Penutup',
        masa: '6 minit',
        aktiviti_guru: [
          'Merumus isi pelajaran bersama murid.',
          'Melaksanakan pentaksiran formatif segera (tunjuk isyarat tangan).',
        ],
        aktiviti_murid: [
          'Menyatakan satu perkara yang dipelajari hari ini.',
          'Menunjukkan isyarat faham / belum faham.',
        ],
        catatan: 'Catat nama murid yang belum faham untuk intervensi esok.',
      },
    ],
    penilaian: {
      kaedah: ['Pemerhatian', 'Lembaran kerja bertulis', 'Soal jawab lisan'],
      instrumen: 'Senarai semak pemerhatian + lembaran kerja (rujuk deskriptor TP DSKP)',
    },
    refleksi:
      'Diisi selepas sesi: bilangan murid yang mencapai objektif, kelemahan yang dikesan, ' +
      'dan tindakan susulan untuk murid yang belum menguasai.',
  };
}

/* ------------------------------------------------------------------ DSKP */

export function dskpPayload(prompt) {
  const subjek = fieldOf(prompt, 'Mata Pelajaran', 'Bahasa Melayu');
  const tahun = fieldOf(prompt, 'Tahun', 'Tahun 3');
  const bidang = fieldOf(prompt, 'Bidang', 'Kemahiran Bahasa');

  return {
    mata_pelajaran: subjek,
    tahun,
    bidang,
    standard_kandungan: [
      {
        kod: 'SK 1',
        pernyataan: `Murid boleh menerima, memahami dan memberi respons terhadap ${bidang.toLowerCase()} dalam pelbagai konteks.`,
        standard_pembelajaran: [
          { kod: 'SP 1.1', pernyataan: 'Mengenal pasti ciri utama yang diperkenalkan dalam sesi.' },
          { kod: 'SP 1.2', pernyataan: 'Menjelaskan ciri utama dengan menggunakan perkataan sendiri.' },
          { kod: 'SP 1.3', pernyataan: 'Mengaplikasikan ciri utama dalam situasi baharu.' },
        ],
        sahkan_dengan_dskp: true,
      },
      {
        kod: 'SK 2',
        pernyataan: `Murid boleh mengaplikasi pengetahuan ${bidang.toLowerCase()} secara terancang dan beradab.`,
        standard_pembelajaran: [
          { kod: 'SP 2.1', pernyataan: 'Melaksanakan tugasan mengikut langkah yang betul.' },
          { kod: 'SP 2.2', pernyataan: 'Menyemak hasil kerja sendiri dan rakan sebaya.' },
        ],
        sahkan_dengan_dskp: true,
      },
      {
        kod: 'SK 3',
        pernyataan: 'Murid boleh menghayati dan mengamalkan nilai murni dalam pembelajaran.',
        standard_pembelajaran: [
          { kod: 'SP 3.1', pernyataan: 'Menunjukkan sikap bekerjasama semasa aktiviti kumpulan.' },
          { kod: 'SP 3.2', pernyataan: 'Menghargai pandangan rakan yang berbeza.' },
        ],
        sahkan_dengan_dskp: true,
      },
    ],
    urutan_cadangan: [
      'Mulakan dengan pengetahuan sedia ada murid melalui set induksi konkrit.',
      'Perkenalkan konsep menggunakan bahan maujud sebelum simbol bertulis.',
      'Latih dengan bimbingan penuh, kemudian kurangkan bimbingan secara berperingkat.',
      'Aplikasi dalam konteks baharu yang bermakna kepada murid.',
      'Tamatkan dengan pentaksiran formatif segera dan rumusan bersama.',
    ],
    prasyarat: [
      'Murid telah menguasai kemahiran asas tahun sebelumnya.',
      'Murid boleh membaca arahan mudah tanpa bantuan.',
      'Murid biasa bekerja dalam kumpulan kecil.',
    ],
    nota: [
      `${subjek} ${tahun}: kod standard dalam dokumen ini adalah RANGKA sahaja.`,
      'Sahkan setiap kod dengan salinan DSKP rasmi yang disimpan di bilik panitia sebelum dihantar kepada PPD.',
      'Deskriptor TP terperinci adalah mengikut mata pelajaran dan terkandung dalam DSKP, bukan dalam dokumen ini.',
    ],
  };
}

/* ------------------------------------------------------------------- PBD */

export function pbdPayload(prompt) {
  const subjek = fieldOf(prompt, 'Mata Pelajaran', 'Matematik');
  const tahun = fieldOf(prompt, 'Tahun', 'Tahun 4');
  const tajuk = fieldOf(prompt, 'Tajuk', 'Pecahan');
  const bil = Math.max(1, Math.min(20, Number(fieldOf(prompt, 'Bilangan item', '5')) || 5));
  const kaedah = (fieldOf(prompt, 'Kaedah pentaksiran') || 'Pemerhatian, Kuiz dan ujian pendek')
    .split(',').map((x) => x.trim()).filter(Boolean);

  const arasCycle = ['Mengingat', 'Memahami', 'Mengaplikasi', 'Menganalisis', 'Menilai', 'Mencipta'];
  const jenisCycle = ['objektif', 'objektif', 'subjektif', 'amali', 'subjektif', 'projek'];

  const item = Array.from({ length: bil }, (_, i) => ({
    id: i + 1,
    jenis: jenisCycle[i % jenisCycle.length],
    soalan: `Soalan ${i + 1}: Berdasarkan ${tajuk.toLowerCase()}, jawab dengan tepat. (${subjek} ${tahun})`,
    aras: arasCycle[i % arasCycle.length],
    jawapan: `Jawapan yang dijangka bagi soalan ${i + 1}, selaras dengan Standard Pembelajaran yang dinilai.`,
    bukti_diperhatikan: 'Guru memerhati cara murid menyusun langkah kerja dan ketepatan jawapan akhir.',
  }));

  return {
    tajuk,
    mata_pelajaran: subjek,
    tahun,
    standard_pembelajaran: [
      'Mengenal pasti konsep asas yang diajar.',
      'Mengaplikasi konsep dalam situasi harian.',
      'Menjelaskan langkah penyelesaian dengan yakin.',
    ],
    item,
    deskriptor_tp: [
      { tp: 1, deskriptor: `Murid menyatakan semula fakta asas tentang ${tajuk.toLowerCase()}.`, bukti: 'Menjawab soalan lisan dengan bantuan guru.' },
      { tp: 2, deskriptor: `Murid menjelaskan konsep ${tajuk.toLowerCase()} dengan perkataan sendiri.`, bukti: 'Memberi contoh mudah tanpa bantuan.' },
      { tp: 3, deskriptor: `Murid melaksanakan tugasan berkaitan ${tajuk.toLowerCase()} dengan bimbingan minimum.`, bukti: 'Menyiapkan lembaran kerja dengan sedikit teguran.' },
      { tp: 4, deskriptor: 'Murid melaksanakan tugasan secara teratur dan beradab mengikut kriteria.', bukti: 'Kerja kemas, langkah tersusun, menepati kriteria.' },
      { tp: 5, deskriptor: 'Murid melaksanakan tugasan secara konsisten dalam pelbagai konteks.', bukti: 'Berjaya tanpa bantuan berulang kali.' },
      { tp: 6, deskriptor: 'Murid menjadi teladan dan boleh mengajar rakan.', bukti: 'Membimbing rakan dan menyelesaikan situasi baharu.' },
    ],
    kaedah: kaedah.length ? kaedah : ['Pemerhatian'],
    intervensi: [
      { kumpulan: 'TP1–TP2', tindakan: `Program bimbingan individu 20 minit, 3 kali seminggu, menggunakan bahan konkrit bagi ${tajuk.toLowerCase()}.` },
      { kumpulan: 'TP3', tindakan: 'Latihan tambahan berpandu dan pemantauan mingguan oleh guru kelas.' },
      { kumpulan: 'TP4–TP5', tindakan: 'Tugasan pengayaan dan penyertaan dalam aktiviti pembentangan.' },
      { kumpulan: 'TP6', tindakan: 'Dijadikan rakan pembimbing (buddy system) untuk rakan yang belum menguasai.' },
    ],
  };
}

/* ------------------------------------------------------------------- BBM */

export function bbmPayload(prompt) {
  const subjek = fieldOf(prompt, 'Mata Pelajaran', 'Sains');
  const tahun = fieldOf(prompt, 'Tahun', 'Tahun 5');
  const tajuk = fieldOf(prompt, 'Tajuk', 'Proses Hidup Tumbuhan');
  const jenis = fieldOf(prompt, 'Jenis bahan', 'Lembaran kerja');

  return {
    tajuk,
    mata_pelajaran: subjek,
    tahun,
    jenis,
    objektif: [
      `Murid dapat mengenal pasti ciri utama ${tajuk.toLowerCase()}.`,
      `Murid dapat menerangkan ${tajuk.toLowerCase()} menggunakan bahasa sendiri.`,
      'Murid dapat bekerjasama dalam aktiviti kumpulan.',
    ],
    bahan_diperlukan: [
      'Kertas A4 (1 helai seorang)',
      'Gunting dan gam',
      'Pensel warna (pilihan)',
      'Bahan maujud daripada persekitaran sekolah',
    ],
    langkah_penggunaan: [
      'Edarkan bahan kepada setiap murid dan bacakan arahan bersama.',
      'Demonstrasi satu contoh di hadapan kelas terlebih dahulu.',
      'Murid menyiapkan tugasan secara individu; guru memantau.',
      'Bincangkan jawapan bersama dan betulkan salah faham.',
      'Simpan dalam portfolio murid sebagai bukti pembelajaran.',
    ],
    lembaran_kerja: {
      arahan: `Arahan: Baca setiap soalan dengan teliti dan jawab dalam ruang yang disediakan. (${subjek} · ${tahun})`,
      soalan: [
        { no: 1, soalan: `Apakah maksud ${tajuk.toLowerCase()}?`, ruang: 'Garis-garis untuk jawapan' },
        { no: 2, soalan: `Senaraikan dua contoh ${tajuk.toLowerCase()}.`, ruang: 'Dua baris bergaris' },
        { no: 3, soalan: `Lukis dan label satu contoh ${tajuk.toLowerCase()}.`, ruang: 'Kotak lukisan 8cm × 8cm' },
        { no: 4, soalan: `Mengapakah ${tajuk.toLowerCase()} penting dalam kehidupan harian?`, ruang: 'Tiga baris bergaris' },
        { no: 5, soalan: `Bandingkan dua contoh yang kamu senaraikan. Apakah perbezaannya?`, ruang: 'Empat baris bergaris' },
      ],
    },
    pembezaan: {
      murid_lemah: 'Lembaran versi mudah — soalan berstruktur dengan pilihan jawapan, dibimbing guru.',
      murid_sederhana: 'Lembaran asal seperti di atas.',
      murid_cemerlang: 'Soalan tambahan aras analisis dan satu tugasan mini-projek rumah.',
    },
    cadangan_kos: 'Bawah RM 0.20 seorang murid (cetakan hitam-putih sahaja)',
  };
}

/* --------------------------------------------------------------- Panitia */

export function panitiaPayload(prompt) {
  const subjek = fieldOf(prompt, 'Mata Pelajaran', 'Bahasa Melayu');
  const tahun = fieldOf(prompt, 'Tahun', 'Tahun 3');

  const bidangList = ['Kemahiran Mendengar dan Bertutur', 'Kemahiran Membaca', 'Kemahiran Menulis', 'Aspek Seni Bahasa', 'Aspek Tatabahasa'];
  const rpt = Array.from({ length: 12 }, (_, i) => ({
    minggu: i + 1,
    bidang: bidangList[Math.floor(i / 3) % bidangList.length],
    standard_kandungan: `SK ${Math.floor(i / 3) + 1} — Rangka standard kandungan ${subjek} ${tahun}.`,
    standard_pembelajaran: [
      `SP ${Math.floor(i / 3) + 1}.${(i % 3) + 1} — Standard pembelajaran minggu ${i + 1}.`,
    ],
    cadangan_aktiviti: ['Perbincangan kumpulan', 'Latihan berpandu', 'Pembentangan', 'Projek mini'][i % 4],
    bbm: ['Kad imbasan', 'Lembaran kerja', 'Bahan maujud', 'Projektor'][i % 4],
  }));

  return {
    mata_pelajaran: subjek,
    tahun,
    jenis_dokumen: 'Dokumen Panitia (RPT + Mesyuarat + Analisis)',
    rpt,
    mesyuarat: {
      agenda: [
        'Ucapan pengerusi dan pengesahan minit mesyuarat lalu',
        'Pembentangan analisis pencapaian pentaksiran terkini',
        'Penyelarasan RPT dan perancangan pengajaran',
        'Inventori BBM dan buku teks',
        'Program peningkatan akademik dan intervensi',
        'Hal-hal lain',
      ],
      tindakan: [
        { perkara: 'Kemas kini RPT mengikut kalendar sekolah', tanggungjawab: 'Semua guru mata pelajaran', tarikh: 'Dalam 2 minggu' },
        { perkara: 'Senarai murid TP1–TP2 untuk intervensi', tanggungjawab: 'Guru kelas', tarikh: 'Minggu ini' },
        { perkara: 'Inventori BBM dan keperluan tambahan', tanggungjawab: 'Ketua Panitia', tarikh: 'Akhir bulan' },
        { perkara: 'Program bimbingan selepas waktu sekolah', tanggungjawab: 'Ketua Panitia + guru terlibat', tarikh: 'Bulan hadapan' },
      ],
    },
    analisis: {
      gred: [
        { gred: 'TP6', bilangan: 4, peratus: 13.3 },
        { gred: 'TP5', bilangan: 7, peratus: 23.3 },
        { gred: 'TP4', bilangan: 8, peratus: 26.7 },
        { gred: 'TP3', bilangan: 6, peratus: 20.0 },
        { gred: 'TP2', bilangan: 3, peratus: 10.0 },
        { gred: 'TP1', bilangan: 2, peratus: 6.7 },
      ],
      isu: [
        'Murid TP1–TP2 belum menguasai kemahiran asas prasyarat.',
        'Kehadiran tidak konsisten menjejaskan kesinambungan pembelajaran.',
        'Kekurangan bahan bantu mengajar konkrit untuk topik tertentu.',
      ],
      intervensi: [
        'Bimbingan individu 20 minit, 3 kali seminggu.',
        'Program mentor-mentee antara murid TP5–TP6 dan TP1–TP2.',
        'Hubungan dengan ibu bapa melalui buku komunikasi.',
        'Penyediaan BBM konkrit tambahan oleh panitia.',
      ],
    },
  };
}

/* ---------------------------------------------------------------- Bahasa */

export function bahasaPayload(prompt) {
  const tajuk = fieldOf(prompt, 'Tajuk', 'Kata Nama Am dan Kata Nama Khas');
  return {
    tajuk,
    sumber: 'Bahasa Melayu',
    terjemahan: [
      { bahasa: 'Bahasa Melayu', teks: `${tajuk} — murid mengenal pasti dan menggunakan ${tajuk.toLowerCase()} dalam ayat.` },
      { bahasa: 'English', teks: `${tajuk} — pupils identify and use common and proper nouns in sentences.` },
      { bahasa: 'Bahasa Kadazandusun', teks: `Poinpopotunud do ${tajuk} — momoguno do boros id suang do ayat.` },
    ],
    istilah_kurikulum: [
      { bm: 'Standard Kandungan', en: 'Content Standard', nota: 'Pernyataan umum kemahiran yang perlu dikuasai' },
      { bm: 'Standard Pembelajaran', en: 'Learning Standard', nota: 'Pernyataan spesifik yang boleh ditaksir' },
      { bm: 'Pentaksiran Bilik Darjah', en: 'Classroom Assessment', nota: 'Pentaksiran formatif berterusan oleh guru' },
      { bm: 'Tahap Penguasaan', en: 'Performance Level', nota: 'Skala TP1 hingga TP6' },
      { bm: 'Bahan Bantu Mengajar', en: 'Teaching Aid', nota: 'Bahan sokongan dalam bilik darjah' },
    ],
    aras_bahasa: 'Sesuai untuk murid sekolah rendah — ayat pendek, kosa kata biasa',
    nota_budaya: [
      'Untuk bahasa ibunda (Kadazandusun, Iban, Semai), sahkan ejaan dengan guru bahasa ibunda sekolah.',
      'Elakkan terjemahan literal bagi istilah kurikulum — gunakan istilah rasmi KPM dalam dokumen pentadbiran.',
    ],
  };
}

/* ----------------------------------------------------------------- Admin */

export function adminPayload(prompt) {
  const sekolah = fieldOf(prompt, 'Sekolah', 'Sekolah Kebangsaan (nama sekolah)');
  const kelas = ['Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4', 'Tahun 5', 'Tahun 6'];
  const pecahan = kelas.map((k, i) => ({
    kelas: k,
    murid: 28 + ((i * 7) % 11),
    guru_kelas: 'Guru kelas ditetapkan oleh pihak sekolah',
  }));
  const jumlah = pecahan.reduce((n, x) => n + x.murid, 0);

  return {
    jenis: 'Ringkasan Pentadbiran',
    sekolah,
    ringkasan: { jumlah_murid: jumlah, jumlah_kelas: pecahan.length, jumlah_guru: pecahan.length + 4 },
    pecahan,
    isu: [
      'Data enrolmen perlu diselaraskan dengan APDM sebelum dihantar ke PPD.',
      'Nama guru kelas mesti diisi daripada jadual tugas rasmi sekolah.',
    ],
    tindakan: [
      'Sahkan bilangan murid dengan APDM pada tarikh yang sama.',
      'Kemas kini maklumat guru kelas dalam fail pentadbiran.',
      'Simpan salinan sebagai lampiran laporan bulanan.',
    ],
    sumber_data: ['APDM', 'EMIS', 'Fail pentadbiran sekolah'],
  };
}

export const KSSR_PAYLOADS = {
  rph: rphPayload, dskp: dskpPayload, pbd: pbdPayload,
  bbm: bbmPayload, panitia: panitiaPayload, bahasa: bahasaPayload, admin: adminPayload,
};

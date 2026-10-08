/**
 * KSSR — domain knowledge for the Malaysian primary curriculum (KPM).
 *
 * Scope: Kurikulum Standard Sekolah Rendah (KSSR) Semakan 2017, Tahun 1–6.
 * Everything here is *reference data* the education agents reason over: the
 * subject list, the DSKP standard/pembelajaran spine, the Pentaksiran Bilik
 * Darjah (PBD) Tahap Penguasaan ladder, the Elemen Merentas Kurikulum set and
 * the KPM RPH/RPT document shapes.
 *
 * Nothing in this file invents curriculum content. Where a school must supply
 * its own values (weekly periods, class lists, panitia roster) the field is
 * marked as school-configured and left for the user to fill in.
 */

/* ------------------------------------------------------------------ KPM 101 */

export const KPM = {
  kementerian: 'Kementerian Pendidikan Malaysia',
  akronim: 'KPM',
  kurikulum: 'KSSR Semakan 2017',
  kurikulumPenuh: 'Kurikulum Standard Sekolah Rendah (Semakan 2017)',
  peringkat: 'Sekolah Rendah',
  tahun: ['Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4', 'Tahun 5', 'Tahun 6'],
  /** Hierarki pentadbiran pendidikan. */
  hierarki: [
    { kod: 'KPM', nama: 'Kementerian Pendidikan Malaysia', peranan: 'Dasar, kurikulum, pentaksiran kebangsaan' },
    { kod: 'JPN', nama: 'Jabatan Pendidikan Negeri', peranan: 'Penyelarasan negeri, pemantauan' },
    { kod: 'PPD', nama: 'Pejabat Pendidikan Daerah', peranan: 'Penyeliaan sekolah, sokongan kurikulum' },
    { kod: 'SEK', nama: 'Sekolah', peranan: 'Pelaksanaan PdPc, PBD, panitia' },
  ],
  /** Dokumen rujukan rasmi yang lazim digunakan guru. */
  dokumen: [
    { kod: 'DSKP', nama: 'Dokumen Standard Kurikulum dan Pentaksiran', guna: 'Standard Kandungan + Standard Pembelajaran + deskriptor TP' },
    { kod: 'RPT', nama: 'Rancangan Pengajaran Tahunan', guna: 'Pecahan standard mengikut minggu persekolahan' },
    { kod: 'RPH', nama: 'Rancangan Pengajaran Harian', guna: 'Perancangan satu sesi PdPc' },
    { kod: 'PBD', nama: 'Pentaksiran Bilik Darjah', guna: 'Penilaian formatif berterusan, TP1–TP6' },
    { kod: 'PAJSK', nama: 'Pentaksiran Aktiviti Jasmani, Sukan dan Kokurikulum', guna: 'Skor kokurikulum murid' },
    { kod: 'PPsi', nama: 'Pentaksiran Psikometrik', guna: 'Profil kecenderungan dan bakat' },
    { kod: 'UASA', nama: 'Ujian Akhir Sesi Akademik', guna: 'Pentaksiran sumatif akhir tahun' },
  ],
  /** Nota: UPSR dimansuhkan (2021) dan PT3 dimansuhkan (2022). */
  notaPentaksiran:
    'UPSR telah dimansuhkan pada 2021 dan PT3 pada 2022. Pentaksiran kini berteraskan PBD, ' +
    'dijumlahkan dengan PAJSK, PPsi dan UASA.',
};

/* --------------------------------------------------------------- mata pelajaran */

/**
 * Kumpulan mata pelajaran KSSR (SK).
 * `wajib` = diikuti semua murid · `pilihan` = mengikut aliran sekolah
 * `waktuMingguan` sengaja dibiarkan null — peruntukan waktu ditetapkan oleh
 * sekolah mengikut jadual waktu dan Pekeliling; guru mengisi nilai sebenar.
 */
export const KUMPULAN_MATA_PELAJARAN = {
  teras: 'Mata Pelajaran Teras',
  wajib: 'Mata Pelajaran Wajib',
  tambahan: 'Bahasa Tambahan / Bahasa Ibunda',
  prasekolah: 'Prasekolah',
};

export const MATA_PELAJARAN = [
  { kod: 'BM', nama: 'Bahasa Melayu', kumpulan: 'teras', tahun: [1, 2, 3, 4, 5, 6], ikon: 'book' },
  { kod: 'BI', nama: 'Bahasa Inggeris', kumpulan: 'teras', tahun: [1, 2, 3, 4, 5, 6], ikon: 'globe' },
  { kod: 'MAT', nama: 'Matematik', kumpulan: 'teras', tahun: [1, 2, 3, 4, 5, 6], ikon: 'route' },
  { kod: 'SN', nama: 'Sains', kumpulan: 'teras', tahun: [4, 5, 6], ikon: 'spark' },
  { kod: 'SEJ', nama: 'Sejarah', kumpulan: 'teras', tahun: [4, 5, 6], ikon: 'layers' },
  { kod: 'PI', nama: 'Pendidikan Islam', kumpulan: 'teras', tahun: [1, 2, 3, 4, 5, 6], ikon: 'shield', nota: 'Murid beragama Islam' },
  { kod: 'PM', nama: 'Pendidikan Moral', kumpulan: 'teras', tahun: [1, 2, 3, 4, 5, 6], ikon: 'shield', nota: 'Murid bukan beragama Islam' },
  { kod: 'PSV', nama: 'Pendidikan Seni Visual', kumpulan: 'wajib', tahun: [1, 2, 3, 4, 5, 6], ikon: 'brush' },
  { kod: 'PMZ', nama: 'Pendidikan Muzik', kumpulan: 'wajib', tahun: [1, 2, 3, 4, 5, 6], ikon: 'mic' },
  { kod: 'PJK', nama: 'Pendidikan Jasmani dan Kesihatan', kumpulan: 'wajib', tahun: [1, 2, 3, 4, 5, 6], ikon: 'bolt' },
  { kod: 'RBT', nama: 'Reka Bentuk dan Teknologi', kumpulan: 'wajib', tahun: [4, 5, 6], ikon: 'cog' },
  { kod: 'BA', nama: 'Bahasa Arab', kumpulan: 'tambahan', tahun: [1, 2, 3, 4, 5, 6], ikon: 'book', nota: 'Sekolah Kebangsaan (pilihan)' },
  { kod: 'BC', nama: 'Bahasa Cina', kumpulan: 'tambahan', tahun: [1, 2, 3, 4, 5, 6], ikon: 'book', nota: 'SK / SJKC' },
  { kod: 'BT', nama: 'Bahasa Tamil', kumpulan: 'tambahan', tahun: [1, 2, 3, 4, 5, 6], ikon: 'book', nota: 'SK / SJKT' },
  { kod: 'BKD', nama: 'Bahasa Kadazandusun', kumpulan: 'tambahan', tahun: [1, 2, 3, 4, 5, 6], ikon: 'book', nota: 'Bahasa ibunda — Sabah' },
  { kod: 'BIB', nama: 'Bahasa Iban', kumpulan: 'tambahan', tahun: [1, 2, 3, 4, 5, 6], ikon: 'book', nota: 'Bahasa ibunda — Sarawak' },
  { kod: 'BSM', nama: 'Bahasa Semai', kumpulan: 'tambahan', tahun: [1, 2, 3, 4, 5, 6], ikon: 'book', nota: 'Bahasa ibunda — Semenanjung' },
];

export const subjekTahun = (tahun) => MATA_PELAJARAN.filter((m) => m.tahun.includes(Number(tahun)));

/* --------------------------------------------------------------------- EMK  */

/** Elemen Merentas Kurikulum — mesti disisipkan dalam setiap RPH. */
export const EMK = [
  { kod: 'EMK1', nama: 'Bahasa', nota: 'Penggunaan bahasa yang betul dalam semua mata pelajaran' },
  { kod: 'EMK2', nama: 'Sains dan Teknologi', nota: 'Penaakulan saintifik, literasi teknologi' },
  { kod: 'EMK3', nama: 'Kelestarian Alam Sekitar', nota: 'Kesedaran alam sekitar dan kelestarian' },
  { kod: 'EMK4', nama: 'Nilai Murni', nota: 'Sikap, moral dan nilai kemanusiaan' },
  { kod: 'EMK5', nama: 'Patriotisme dan Kewarganegaraan', nota: 'Cinta akan negara, tanggungjawab sivik' },
  { kod: 'EMK6', nama: 'Kreativiti dan Inovasi', nota: 'Penjanaan idea, penyelesaian masalah' },
  { kod: 'EMK7', nama: 'Keusahawanan', nota: 'Sifat keusahawanan, pengurusan sumber' },
  { kod: 'EMK8', nama: 'Teknologi Maklumat dan Komunikasi', nota: 'Penggunaan TMK secara beretika' },
];

/* --------------------------------------------------------------------- PBD  */

/**
 * Tahap Penguasaan (TP) 1–6 — rangka umum KPM.
 * Deskriptor terperinci adalah mengikut mata pelajaran dalam DSKP.
 */
export const TP = [
  { tp: 1, label: 'Tahu', aras: 'Mengingat semula', deskriptor: 'Murid tahu dan boleh menyatakan semula fakta, istilah atau konsep asas yang dipelajari.', warna: 'hsl(0 68% 52%)' },
  { tp: 2, label: 'Tahu dan faham', aras: 'Memahami', deskriptor: 'Murid menjelaskan idea dengan perkataan sendiri dan memberi contoh mudah.', warna: 'hsl(20 82% 42%)' },
  { tp: 3, label: 'Boleh lakukan', aras: 'Mengaplikasi', deskriptor: 'Murid melaksanakan kemahiran atau prosedur dengan bimbingan minimum.', warna: 'hsl(38 88% 32%)' },
  { tp: 4, label: 'Beradab dan bersistematik', aras: 'Menganalisis', deskriptor: 'Murid melaksanakan tugasan secara teratur, beradab dan menepati kriteria yang ditetapkan.', warna: 'hsl(160 60% 30%)' },
  { tp: 5, label: 'Konsisten', aras: 'Menilai', deskriptor: 'Murid melaksanakan tugasan secara konsisten, bersistematik dan beradab dalam pelbagai konteks.', warna: 'hsl(200 72% 34%)' },
  { tp: 6, label: 'Teladan', aras: 'Mencipta', deskriptor: 'Murid melaksanakan tugasan secara tekal, boleh menterjemah kemahiran kepada situasi baharu dan menjadi teladan kepada rakan.', warna: 'hsl(40 66% 46%)' },
];

/** Kaedah pentaksiran bilik darjah yang biasa digunakan. */
export const KAEDAH_PBD = [
  { nama: 'Pemerhatian', guna: 'Semasa aktiviti amali, perbincangan, pembentangan' },
  { nama: 'Pembentangan lisan', guna: 'Kemahiran bertutur dan keyakinan diri' },
  { nama: 'Hasil kerja bertulis', guna: 'Lembaran kerja, buku latihan, projek' },
  { nama: 'Kuiz dan ujian pendek', guna: 'Semakan penguasaan konsep segera' },
  { nama: 'Portfolio', guna: 'Kompilasi bukti pembelajaran sepanjang tahun' },
  { nama: 'Penilaian rakan sebaya', guna: 'Kolaboratif, menilai bersama' },
  { nama: 'Penilaian kendiri', guna: 'Metakognitif, kesedaran pembelajaran sendiri' },
  { nama: 'Projek / tugasan autentik', guna: 'Pentaksiran prestasi dunia sebenar' },
];

/* --------------------------------------------------------------------- RPH  */

/** Struktur RPH yang lazim diterima PPD / JPN. */
export const RPH_TEMPLATE = [
  { medan: 'Mata Pelajaran', nota: 'Nama penuh seperti dalam DSKP' },
  { medan: 'Kelas', nota: 'Contoh: 3 Bestari' },
  { medan: 'Masa', nota: 'Contoh: 8.10 – 9.10 pagi (60 minit)' },
  { medan: 'Bidang / Tema', nota: 'Mengikut organisasi DSKP mata pelajaran' },
  { medan: 'Tajuk', nota: 'Tajuk kecil sesi ini' },
  { medan: 'Standard Kandungan', nota: 'Kod + pernyataan penuh dari DSKP' },
  { medan: 'Standard Pembelajaran', nota: 'Kod + pernyataan penuh dari DSKP' },
  { medan: 'Objektif Pembelajaran', nota: 'Diukur melalui pemerhatian tingkah laku — gunakan kata kerja aras' },
  { medan: 'Kriteria Kejayaan', nota: '“Saya boleh…” — apa yang murid patut capai' },
  { medan: 'EMK', nota: 'Sekurang-kurangnya satu elemen merentas kurikulum' },
  { medan: 'BBM', nota: 'Bahan bantu mengajar yang konkrit' },
  { medan: 'Aktiviti PdPc', nota: 'Set induksi · Langkah 1–3 · Penutup' },
  { medan: 'KBAT', nota: 'Soalan aras tinggi (analisis, menilai, mencipta)' },
  { medan: 'Penilaian', nota: 'Kaedah PBD yang digunakan' },
  { medan: 'Refleksi', nota: 'Diisi selepas sesi — pencapaian, kelemahan, tindakan susulan' },
];

/** Langkah aktiviti PdPc dengan cadangan peruntukan masa. */
export const LANGKAH_PDPC = [
  { nama: 'Set Induksi', peratus: 10, tujuan: 'Menarik perhatian, mengaktifkan pengetahuan sedia ada, menimbulkan rasa ingin tahu' },
  { nama: 'Langkah 1 — Penerokaan', peratus: 25, tujuan: 'Murid meneroka konsep melalui bahan atau situasi konkrit' },
  { nama: 'Langkah 2 — Penerangan', peratus: 30, tujuan: 'Murid membina kefahaman, guru memudahcara perbincangan' },
  { nama: 'Langkah 3 — Pengukuhan', peratus: 25, tujuan: 'Latihan berpandu, aplikasi dalam konteks baharu' },
  { nama: 'Penutup', peratus: 10, tujuan: 'Rumusan, pentaksiran formatif segera, tugasan susulan' },
];

/** Kata kerja operasi mengikut aras kognitif (untuk menulis objektif). */
export const KATA_KERJA = {
  'Mengingat': ['menyatakan', 'menyenaraikan', 'menamakan', 'mengenal pasti', 'memadankan'],
  'Memahami': ['menjelaskan', 'menghuraikan', 'mengelaskan', 'merumuskan', 'memberi contoh'],
  'Mengaplikasi': ['menggunakan', 'melaksanakan', 'menunjukkan', 'menyelesaikan', 'membina'],
  'Menganalisis': ['membandingkan', 'membezakan', 'menganalisis', 'mengkategorikan', 'menyiasat'],
  'Menilai': ['menilai', 'menghakimi', 'membenarkan alasan', 'mengkritik', 'menentukan'],
  'Mencipta': ['mereka cipta', 'menghasilkan', 'merancang', 'menggubal', 'membentuk'],
};

/* ------------------------------------------------------------------ PANITIA  */

export const PANITIA_TUGAS = [
  { nama: 'Mesyuarat Panitia', kekerapan: 'Sekurang-kurangnya 3 kali setahun', output: 'Minit mesyuarat, buku daftar panitia' },
  { nama: 'Rancangan Pengajaran Tahunan (RPT)', kekerapan: 'Awal tahun', output: 'RPT mengikut minggu persekolahan' },
  { nama: 'Analisis item dan pencapaian', kekerapan: 'Selepas setiap pentaksiran', output: 'Analisis item, graf pencapaian, pelan intervensi' },
  { nama: 'Inventori BBM dan buku teks', kekerapan: 'Awal dan akhir tahun', output: 'Borang inventori, borang keperluan' },
  { nama: 'Program peningkatan akademik', kekerapan: 'Mengikut kalendar sekolah', output: 'Kertas cadangan, laporan program' },
  { nama: 'Bimbingan murid lemah (intervensi)', kekerapan: 'Berkala', output: 'Senarai nama, rekod intervensi, bukti kemajuan' },
];

/* ------------------------------------------------------------------ AGEN KSSR */

/** Agent khusus pendidikan — dijalankan oleh enjin ModelRouter yang sama. */
export const AGEN_KSSR = [
  { key: 'orchestrator', nama: 'Penyelaras PdPc', ikon: 'grid', task: 'agentic', model: 'minimax/minimax-m2.7', desc: 'Memecahkan matlamat pengajaran besar kepada tugasan kecil dan menyerahkannya kepada agen khusus.' },
  { key: 'rph', nama: 'Agen RPH', ikon: 'book', task: 'writing', model: 'moonshotai/kimi-k2.6', desc: 'Menjana Rancangan Pengajaran Harian lengkap — standard, objektif, aktiviti PdPc, EMK, KBAT, penilaian, refleksi.' },
  { key: 'dskp', nama: 'Agen DSKP', ikon: 'layers', task: 'summarise', model: 'z-ai/glm-5.2', desc: 'Memetakan Standard Kandungan dan Standard Pembelajaran daripada DSKP serta mencadangkan urutan pengajaran.' },
  { key: 'pbd', nama: 'Agen Pentaksiran', ikon: 'chart', task: 'qa', model: 'minimax/minimax-m2.7', desc: 'Membina item pentaksiran, menetapkan deskriptor TP1–TP6 dan mencadangkan pelan intervensi.' },
  { key: 'bbm', nama: 'Agen BBM', ikon: 'brush', task: 'design', model: 'xiaomi/mimo-v2.5-pro', desc: 'Menghasilkan bahan bantu mengajar — lembaran kerja, kad imbas, infografik, peta minda, kuiz.' },
  { key: 'panitia', nama: 'Agen Panitia', ikon: 'users', task: 'automation', model: 'z-ai/glm-4.7', desc: 'Menyediakan RPT, minit mesyuarat panitia, analisis item dan pelan intervensi.' },
  { key: 'tutor', nama: 'Agen Tutor KSSR', ikon: 'spark', task: 'quiz', model: 'qwen/qwen3.6-35b-a3b', desc: 'Membina kuiz bergambar dan permainan pembelajaran selari dengan standard DSKP.' },
  { key: 'bahasa', nama: 'Agen Bahasa', ikon: 'globe', task: 'writing', model: 'z-ai/glm-5.2', desc: 'Dwibahasa BM/BI serta sokongan bahasa ibunda — Kadazandusun, Iban, Semai.' },
  { key: 'qa', nama: 'Agen Semakan', ikon: 'shield', task: 'qa', model: 'minimax/minimax-m2.7', desc: 'Menyemak keselarasan dokumen dengan format KPM dan DSKP sebelum dihantar kepada PPD.' },
  { key: 'admin', nama: 'Agen Pentadbiran', ikon: 'db', task: 'classify', model: 'qwen/qwen3.6-35b-a3b', desc: 'Enrolmen, APDM/EMIS, inventori dan laporan pentadbiran sekolah.' },
];

/* ------------------------------------------------------- permintaan sistem */

/** Kontrak output setiap agen — sama seperti yang dipatuhi oleh agen sebenar. */
export const SISTEM_AGEN = {
  rph: `Anda ialah Agen RPH untuk kurikulum KSSR Semakan 2017 (KPM Malaysia). Hasilkan Rancangan Pengajaran Harian yang lengkap dan boleh terus dihantar kepada PPD. Setiap objektif mesti boleh diukur dan menggunakan kata kerja operasi yang sesuai dengan aras kognitif. Setiap aktiviti mesti merujuk Standard Pembelajaran yang diberi. Jangan mereka standard DSKP yang tidak diberi. Pulangkan HANYA JSON: {"mata_pelajaran": str, "kelas": str, "masa": str, "bidang": str, "tajuk": str, "standard_kandungan": [{"kod": str, "pernyataan": str}], "standard_pembelajaran": [{"kod": str, "pernyataan": str}], "objektif": [str], "kriteria_kejayaan": [str], "emk": [str], "kbat": [str], "bbm": [str], "langkah": [{"nama": str, "masa": str, "aktiviti_guru": [str], "aktiviti_murid": [str], "catatan": str}], "penilaian": {"kaedah": [str], "instrumen": str}, "refleksi": str}`,

  dskp: `Anda ialah Agen DSKP. Petakan Standard Kandungan dan Standard Pembelajaran daripada DSKP KSSR Semakan 2017 untuk mata pelajaran dan tahun yang diberi. Jangan mencipta kod standard. Jika kod sebenar tidak diketahui, tanda "perlu sahkan dengan DSKP". Pulangkan HANYA JSON: {"mata_pelajaran": str, "tahun": str, "bidang": str, "standard_kandungan": [{"kod": str, "pernyataan": str, "standard_pembelajaran": [{"kod": str, "pernyataan": str}], "sahkan_dengan_dskp": bool}], "urutan_cadangan": [str], "prasyarat": [str], "nota": [str]}`,

  pbd: `Anda ialah Agen Pentaksiran Bilik Darjah (PBD). Bina item pentaksiran dan tetapkan deskriptor Tahap Penguasaan 1–6 yang selari dengan Standard Pembelajaran. Setiap item mesti ada aras kognitif dan bukti yang boleh diperhatikan guru. Pulangkan HANYA JSON: {"tajuk": str, "mata_pelajaran": str, "tahun": str, "standard_pembelajaran": [str], "item": [{"id": int, "jenis": "objektif|subjektif|amali|projek", "soalan": str, "aras": str, "jawapan": str, "bukti_diperhatikan": str}], "deskriptor_tp": [{"tp": int, "deskriptor": str, "bukti": str}], "kaedah": [str], "intervensi": [{"kumpulan": str, "tindakan": str}]}`,

  bbm: `Anda ialah Agen Bahan Bantu Mengajar. Hasilkan bahan bantu mengajar yang konkrit, murah dan boleh dicetak untuk bilik darjah KSSR. Selarikan dengan Standard Pembelajaran yang diberi. Pulangkan HANYA JSON: {"tajuk": str, "mata_pelajaran": str, "tahun": str, "jenis": str, "objektif": [str], "bahan_diperlukan": [str], "langkah_penggunaan": [str], "lembaran_kerja": {"arahan": str, "soalan": [{"no": int, "soalan": str, "ruang": str}]}, "pembezaan": {"murid_lemah": str, "murid_sederhana": str, "murid_cemerlang": str}, "cadangan_kos": str}`,

  panitia: `Anda ialah Agen Panitia. Sediakan dokumen panitia mata pelajaran sekolah rendah Malaysia. Format mesti menepati amalan PPD/JPN. Pulangkan HANYA JSON: {"mata_pelajaran": str, "tahun": str, "jenis_dokumen": str, "rpt": [{"minggu": int, "bidang": str, "standard_kandungan": str, "standard_pembelajaran": [str], "cadangan_aktiviti": str, "bbm": str}], "mesyuarat": {"agenda": [str], "tindakan": [{"perkara": str, "tanggungjawab": str, "tarikh": str}]}, "analisis": {"gred": [{"gred": str, "bilangan": int, "peratus": num}], "isu": [str], "intervensi": [str]}}`,

  bahasa: `Anda ialah Agen Bahasa. Terjemah dan adaptasi kandungan pengajaran antara Bahasa Melayu, Bahasa Inggeris dan bahasa ibunda (Kadazandusun, Iban, Semai). Kekalkan istilah kurikulum yang tepat dan jangan gunakan bahasa yang terlalu formal untuk murid sekolah rendah. Pulangkan HANYA JSON: {"tajuk": str, "sumber": str, "terjemahan": [{"bahasa": str, "teks": str}], "istilah_kurikulum": [{"bm": str, "en": str, "nota": str}], "aras_bahasa": str, "nota_budaya": [str]}`,

  admin: `Anda ialah Agen Pentadbiran Sekolah. Sediakan ringkasan dan klasifikasi data pentadbiran sekolah rendah Malaysia. Pulangkan HANYA JSON: {"jenis": str, "sekolah": str, "ringkasan": {"jumlah_murid": int, "jumlah_kelas": int, "jumlah_guru": int}, "pecahan": [{"kelas": str, "murid": int, "guru_kelas": str}], "isu": [str], "tindakan": [str], "sumber_data": [str]}`,
};

/* ------------------------------------------------------------- operasi harian */

/** Tugasan harian guru — titik masuk yang baik untuk automasi. */
export const TUGAS_GURU = [
  { nama: 'Rancang RPH', kekerapan: 'Harian', agen: 'rph', masa: '15–25 minit' },
  { nama: 'Sediakan BBM', kekerapan: 'Harian / mingguan', agen: 'bbm', masa: '20–40 minit' },
  { nama: 'Rekod PBD', kekerapan: 'Harian', agen: 'pbd', masa: '10–15 minit' },
  { nama: 'Semak kerja murid', kekerapan: 'Harian', agen: 'qa', masa: '30–60 minit' },
  { nama: 'Kemas kini RPT', kekerapan: 'Mingguan', agen: 'panitia', masa: '15 minit' },
  { nama: 'Analisis item', kekerapan: 'Selepas pentaksiran', agen: 'panitia', masa: '45 minit' },
  { nama: 'Laporan pentadbiran', kekerapan: 'Bulanan', agen: 'admin', masa: '30 minit' },
];

/** Aliran kerja automasi sedia guna. */
export const ALIRAN_KSSR = [
  {
    nama: 'RPH mingguan automatik',
    pencetus: 'cron · setiap Ahad 8:00 malam',
    langkah: ['Baca RPT panitia', 'Jana RPH untuk 5 hari', 'Semak keselarasan DSKP', 'E-mel kepada guru kelas'],
    agen: ['panitia', 'rph', 'qa', 'admin'],
  },
  {
    nama: 'Laporan PBD bulanan',
    pencetus: 'cron · hari terakhir setiap bulan',
    langkah: ['Kumpul rekod PBD', 'Kira taburan TP1–TP6', 'Kenal pasti murid TP1–TP2', 'Hasilkan pelan intervensi', 'Jana laporan PDF'],
    agen: ['pbd', 'panitia', 'admin'],
  },
  {
    nama: 'Analisis item UASA',
    pencetus: 'fail · muat naik markah',
    langkah: ['Kira indeks kesukaran dan diskriminasi', 'Tandakan item bermasalah', 'Cadang penambahbaikan item', 'Bandingkan dengan tahun lepas'],
    agen: ['panitia', 'qa'],
  },
  {
    nama: 'Bank BBM panitia',
    pencetus: 'webhook · permintaan guru',
    langkah: ['Kenal pasti standard', 'Jana lembaran kerja', 'Semak jawapan', 'Simpan ke perpustakaan panitia'],
    agen: ['dskp', 'bbm', 'qa'],
  },
];

/* ------------------------------------------------------------------ contoh  */

/** Contoh isian untuk borang — nilai tempat letak, bukan data sekolah sebenar. */
export const CONTOH_BORANG = {
  mata_pelajaran: 'Bahasa Melayu',
  tahun: 'Tahun 3',
  kelas: '3 Bestari',
  masa: '8.10 – 9.10 pagi (60 minit)',
  bidang: 'Kemahiran Mendengar dan Bertutur',
  tajuk: 'Kata Nama Am dan Kata Nama Khas',
  standard_kandungan: 'SK 5.1 — Memahami dan menggunakan perkataan daripada pelbagai golongan kata dalam pelbagai konteks.',
  standard_pembelajaran: 'SP 5.1.1 — Mengenal pasti kata nama am dan kata nama khas dalam teks yang diberi.\nSP 5.1.2 — Menggunakan kata nama am dan kata nama khas dengan betul dalam ayat.',
};

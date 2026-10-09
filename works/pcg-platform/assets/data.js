/* ==========================================================================
   SK SALIMPODON DARAT — SISTEM PENGURUSAN PCG & DOKUMEN GURU
   Data sumber: JADUAL WAKTU PERSENDIRIAN JANAAN 3 (SEPT 2026)
                AGIHAN SUBJEK & BILANGAN WAKTU MENGAJAR 2026 JANAAN 3
   Kerani Kewangan PT : EN. ANTONNY BIN MAGINGANG
   ========================================================================== */

const SCHOOL = {
  nama: "SK. SALIMPODON DARAT",
  alamat: "Pitas, Sabah",
  sesi: "2026 — Janaan 3",
  kuatkuasa: "30 September 2026",
  kerani: "EN. ANTONNY BIN MAGINGANG",
  jawatanKerani: "Kerani Kewangan PT",
};

/* --------------------------------------------------------------------------
   PERUNTUKAN PCG MENGIKUT MATA PELAJARAN
   (PCG = Peruntukan Bantuan Persekolahan / Panitia mata pelajaran)
   -------------------------------------------------------------------------- */
const PCG = {
  "B. MELAYU":      { panitia: "Panitia Bahasa Melayu",        amaun: 4200, warna: "#b8860b", ikon: "BM" },
  "B. INGGERIS":    { panitia: "Panitia Bahasa Inggeris",      amaun: 3800, warna: "#1e5f8f", ikon: "BI" },
  "MATEMATIK":      { panitia: "Panitia Matematik",            amaun: 3600, warna: "#7b2d8e", ikon: "MT" },
  "SAINS":          { panitia: "Panitia Sains",                amaun: 3200, warna: "#0f7a5a", ikon: "SN" },
  "P. ISLAM":       { panitia: "Panitia Pendidikan Islam",     amaun: 2800, warna: "#0d6e6e", ikon: "PI" },
  "P. MORAL":       { panitia: "Panitia Pendidikan Moral",     amaun: 1800, warna: "#8a4b2a", ikon: "PM" },
  "SEJARAH":        { panitia: "Panitia Sejarah",              amaun: 1500, warna: "#6b4423", ikon: "SJ" },
  "BKD":            { panitia: "Panitia Bahasa Kadazandusun",  amaun: 2400, warna: "#2f6b2f", ikon: "BKD" },
  "PJK":            { panitia: "Panitia Pendidikan Jasmani",   amaun: 2600, warna: "#c0392b", ikon: "PJK" },
  "PSV":            { panitia: "Panitia Pendidikan Seni Visual", amaun: 1900, warna: "#c2185b", ikon: "PSV" },
  "MUZIK":          { panitia: "Panitia Pendidikan Muzik",     amaun: 1400, warna: "#5c35a0", ikon: "MZ" },
  "RBT":            { panitia: "Panitia RBT",                  amaun: 2100, warna: "#0277bd", ikon: "RBT" },
  "TASMIK":         { panitia: "Panitia Tasmi' Al-Quran",      amaun: 1200, warna: "#0f766e", ikon: "TSM" },
  "PRASEKOLAH":     { panitia: "Unit Prasekolah",              amaun: 3000, warna: "#a855f7", ikon: "PRA" },
};

/* --------------------------------------------------------------------------
   SENARAI GURU — nama, jawatan, opsyen & subjek yang diajar
   -------------------------------------------------------------------------- */
const GURU = [
  { id:"isa",  nama:"EN. MOHD ISAHAK BIN AWANG", jawatan:"Guru Besar", opsyen:"P. MORAL",
    subjek:[{s:"P. MORAL",k:"2 Arif",w:6}] },
  { id:"mis",  nama:"EN. MISWAN BIN YAHYA", jawatan:"Penolong Kanan Pentadbiran", opsyen:"SAINS",
    subjek:[{s:"SAINS",k:"5 Bestari",w:4},{s:"SAINS",k:"6 Arif",w:4},{s:"SAINS",k:"6 Bestari",w:4}] },
  { id:"asm",  nama:"EN. ASMAT BIN DEMSI", jawatan:"Penolong Kanan Hal Ehwal Murid", opsyen:"B. MELAYU",
    subjek:[{s:"B. MELAYU",k:"5 Arif",w:9},{s:"P. MORAL",k:"5 Bestari",w:6}] },
  { id:"mas",  nama:"EN. MASLAN BIN MASUARI", jawatan:"Penolong Kanan Kokurikulum", opsyen:"PJK",
    subjek:[{s:"B. MELAYU",k:"5 Bestari",w:9},{s:"PJK",k:"6 Arif",w:3},{s:"PJK",k:"6 Bestari",w:3}] },
  { id:"maha", nama:"EN. SY. MAHAZIR SY. AHMAD", jawatan:"Guru", opsyen:"P. ISLAM",
    subjek:[{s:"P. ISLAM",k:"3 Arif",w:6},{s:"P. ISLAM",k:"4 Arif",w:6},{s:"P. ISLAM",k:"5 Arif",w:6},{s:"P. ISLAM",k:"6 Arif",w:6},{s:"TASMIK",k:"4 Arif",w:2},{s:"TASMIK",k:"5 Arif",w:2},{s:"TASMIK",k:"6 Arif",w:2}] },
  { id:"chr",  nama:"CIK CHRISTIE JUSTIN", jawatan:"Guru", opsyen:"MATEMATIK",
    subjek:[{s:"B. INGGERIS",k:"5 Arif",w:9},{s:"MATEMATIK",k:"6 Arif",w:6},{s:"MATEMATIK",k:"6 Bestari",w:6},{s:"SEJARAH",k:"5 Bestari",w:2},{s:"MUZIK",k:"6 Bestari",w:1}] },
  { id:"div",  nama:"PN. DIVIEHIRNA BINTI MALIJON", jawatan:"Guru", opsyen:"MATEMATIK",
    subjek:[{s:"MATEMATIK",k:"3 Arif",w:6},{s:"MATEMATIK",k:"4 Arif",w:6},{s:"MATEMATIK",k:"5 Arif",w:6},{s:"RBT",k:"4 Arif",w:2},{s:"RBT",k:"6 Arif",w:2},{s:"RBT",k:"6 Bestari",w:2},{s:"MUZIK",k:"2 Bestari",w:1}] },
  { id:"hen",  nama:"EN. HENDRYSON DUMAT", jawatan:"Guru", opsyen:"BKD",
    subjek:[{s:"MATEMATIK",k:"1 Arif",w:6},{s:"MUZIK",k:"3 Arif",w:1},{s:"BKD",k:"4 Arif",w:3},{s:"BKD",k:"5 Arif",w:3},{s:"BKD",k:"6 Arif",w:3},{s:"BKD",k:"6 Bestari",w:3},{s:"PJK",k:"1 Arif",w:3},{s:"PJK",k:"4 Arif",w:3}] },
  { id:"ick",  nama:"CIK ICK ELLYRENZINE LINSAP", jawatan:"Guru", opsyen:"B. MELAYU",
    subjek:[{s:"B. MELAYU",k:"6 Arif",w:9},{s:"B. MELAYU",k:"6 Bestari",w:9},{s:"BKD",k:"1 Arif",w:3},{s:"PSV",k:"6 Arif",w:2},{s:"PSV",k:"6 Bestari",w:2}] },
  { id:"jai",  nama:"EN. JAISUN MIDIN", jawatan:"Guru", opsyen:"B. INGGERIS",
    subjek:[{s:"B. INGGERIS",k:"3 Arif",w:9},{s:"PJK",k:"5 Arif",w:3},{s:"BKD",k:"2 Bestari",w:3},{s:"BKD",k:"5 Bestari",w:3},{s:"MUZIK",k:"6 Arif",w:1}] },
  { id:"jal",  nama:"EN. JALIUN MAUN", jawatan:"Guru", opsyen:"SAINS",
    subjek:[{s:"SAINS",k:"1 Arif",w:3},{s:"SAINS",k:"2 Arif",w:3},{s:"SAINS",k:"2 Bestari",w:3},{s:"SAINS",k:"3 Arif",w:4},{s:"SAINS",k:"4 Arif",w:4},{s:"SAINS",k:"5 Arif",w:4},{s:"P. MORAL",k:"3 Arif",w:6}] },
  { id:"jed",  nama:"EN. JEDIN SHAMSUDIN", jawatan:"Guru", opsyen:"P. MORAL",
    subjek:[{s:"P. MORAL",k:"2 Bestari",w:6},{s:"P. MORAL",k:"4 Arif",w:6},{s:"P. MORAL",k:"5 Arif",w:6},{s:"PSV",k:"2 Arif",w:2},{s:"PSV",k:"5 Arif",w:2},{s:"PSV",k:"5 Bestari",w:2},{s:"PJK",k:"3 Arif",w:3},{s:"MUZIK",k:"4 Arif",w:1}] },
  { id:"masn", nama:"PN. MASNEH BINTI JAMLEE @ JAMLI", jawatan:"Guru", opsyen:"B. MELAYU",
    subjek:[{s:"B. MELAYU",k:"1 Arif",w:11},{s:"MATEMATIK",k:"2 Arif",w:6},{s:"MATEMATIK",k:"2 Bestari",w:6},{s:"PSV",k:"3 Arif",w:2},{s:"PSV",k:"4 Arif",w:2}] },
  { id:"izz",  nama:"EN. MOHD IZZADY IZWAN BIN ABDULLAH", jawatan:"Guru", opsyen:"B. INGGERIS",
    subjek:[{s:"B. INGGERIS",k:"2 Arif",w:9},{s:"MATEMATIK",k:"5 Bestari",w:6},{s:"SEJARAH",k:"5 Arif",w:2},{s:"SEJARAH",k:"6 Arif",w:2},{s:"SEJARAH",k:"6 Bestari",w:2},{s:"RBT",k:"5 Arif",w:2},{s:"RBT",k:"5 Bestari",w:2}] },
  { id:"nel",  nama:"PN. NELLY GINOL", jawatan:"Guru", opsyen:"B. MELAYU",
    subjek:[{s:"B. MELAYU",k:"2 Arif",w:11},{s:"P. MORAL",k:"1 Arif",w:6},{s:"PJK",k:"2 Arif",w:3},{s:"PJK",k:"2 Bestari",w:3},{s:"PJK",k:"5 Bestari",w:3},{s:"MUZIK",k:"5 Arif",w:1}] },
  { id:"roz",  nama:"CIK ROZIANAH SINTAR", jawatan:"Guru (Pend. Khas)", opsyen:"B. MELAYU",
    subjek:[{s:"B. MELAYU",k:"PML",w:20},{s:"MATEMATIK",k:"PML",w:10}] },
  { id:"suh",  nama:"CIK SUHANA KIJING", jawatan:"Guru", opsyen:"B. MELAYU",
    subjek:[{s:"B. MELAYU",k:"2 Bestari",w:11},{s:"P. MORAL",k:"6 Arif",w:6},{s:"P. MORAL",k:"6 Bestari",w:6},{s:"MUZIK",k:"1 Arif",w:1},{s:"MUZIK",k:"2 Arif",w:1}] },
  { id:"ami",  nama:"PN. AMIRASUHAILA BINTI TAJUDIN", jawatan:"Guru", opsyen:"B. INGGERIS",
    subjek:[{s:"B. INGGERIS",k:"4 Arif",w:9},{s:"B. INGGERIS",k:"6 Arif",w:9},{s:"B. INGGERIS",k:"6 Bestari",w:9}] },
  { id:"chl",  nama:"PN. CHELSEA BINTI S. KIFFLEE", jawatan:"Guru", opsyen:"B. MELAYU",
    subjek:[{s:"B. MELAYU",k:"3 Arif",w:11},{s:"B. MELAYU",k:"4 Arif",w:9},{s:"BKD",k:"2 Arif",w:3},{s:"BKD",k:"3 Arif",w:3},{s:"MUZIK",k:"5 Bestari",w:1}] },
  { id:"sof",  nama:"CIK SITI SOFIAH BINTI NURAHIT @ NURAHID", jawatan:"Guru", opsyen:"B. INGGERIS",
    subjek:[{s:"B. INGGERIS",k:"1 Arif",w:9},{s:"B. INGGERIS",k:"2 Bestari",w:9},{s:"B. INGGERIS",k:"5 Bestari",w:9}] },
  { id:"fit",  nama:"CIK NUR FITRIAH INSYIRAH BINTI FAUZI", jawatan:"Guru", opsyen:"P. ISLAM",
    subjek:[{s:"P. ISLAM",k:"Prasekolah",w:4},{s:"P. ISLAM",k:"1 Arif",w:6},{s:"P. ISLAM",k:"2 Arif",w:6},{s:"TASMIK",k:"1 Arif",w:2},{s:"TASMIK",k:"2 Arif",w:2},{s:"TASMIK",k:"3 Arif",w:2},{s:"SEJARAH",k:"4 Arif",w:2},{s:"PSV",k:"1 Arif",w:2},{s:"PSV",k:"2 Bestari",w:2}] },
  { id:"jus",  nama:"PN. JUSINI TININ", jawatan:"Guru Prasekolah", opsyen:"PRASEKOLAH",
    subjek:[{s:"PRASEKOLAH",k:"Prasekolah",w:30}] },
];

/* Kredensial log masuk (demo) — ayam: <id> / 1234  |  kerani: pt / pt2026 */
const AKAUN = {
  kerani: { user: "pt", pass: "pt2026", nama: "EN. ANTONNY BIN MAGINGANG", peranan: "Kerani Kewangan PT" },
};

/* Dokumen rasmi yang diperlukan setiap guru (checklist muat naik) */
const DOKUMEN_WAJIB = [
  { id:"slip",    nama:"Slip Gaji",                    ikon:"💵", wajib:true },
  { id:"bank",    nama:"Penyata Akaun Bank",           ikon:"🏦", wajib:true },
  { id:"kwsp",    nama:"Penyata KWSP / SOCSO",         ikon:"📑", wajib:true },
  { id:"cuti",    nama:"Borang Cuti / Rekod Cuti",     ikon:"🗓️", wajib:false },
  { id:"tuntutan",nama:"Borang Tuntutan Perjalanan",   ikon:"🚗", wajib:false },
  { id:"pcg",     nama:"Resit Perbelanjaan PCG",       ikon:"🧾", wajib:false },
  { id:"kursus",  nama:"Sijil Kursus / LATIHAN",       ikon:"🎓", wajib:false },
  { id:"lain",    nama:"Dokumen Lain",                 ikon:"📎", wajib:false },
];

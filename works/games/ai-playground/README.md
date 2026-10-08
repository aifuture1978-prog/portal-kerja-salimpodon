# 🦊 AI Playground Kanak-Kanak (5–8 tahun)

Platform web interaktif + PWA untuk kanak-kanak **5–8 tahun**: 12 modul permainan edukasi,
animasi 2D gaya *Pixar* (rounded, expressive, soft lighting), AI adaptif, mesra akses,
dan lapisan keselamatan kanak-kanak (COPPA / GDPR-K).

> **Status:** lengkap & boleh dimainkan. Tiada proses *build*, tiada pangkalan data,
> tiada kunci API. Semua berjalan dalam pelayar sahaja.

---

## 1. Mula Sekarang (3 langkah)

```bash
cd ai-playground
python -m http.server 5178
# atau:  npx --yes serve -l 5178 .
```

Buka **http://127.0.0.1:5178** dalam pelayar.

> ⚠️ Jangan buka `index.html` terus dengan `file://` — modul JavaScript (ES Modules)
> dan PWA memerlukan pelayan HTTP (`localhost` atau HTTPS).

### Pasang sebagai aplikasi (PWA)

Chrome/Edge: ikon **⊕ / Pasang** di bar alamat → *Install*.
Android/iOS: menu pelayar → **Tambah ke skrin utama**.
Selepas dipasang, platform berfungsi **tanpa internet** (service worker menyimpan cache).

---

## 2. Struktur Projek

```
ai-playground/
├── index.html                  # shell: topbar, #view, overlay, #fx
├── manifest.webmanifest        # PWA (nama, ikon, shortcut)
├── sw.js                       # service worker — cache-first, offline
├── package.json                # skrip mudah guna (start / serve / check)
├── assets/
│   ├── css/styles.css          # Design System (token, animasi, aksesibiliti, cetak)
│   ├── img/icon.svg            # ikon aplikasi
│   ├── img/icon-maskable.svg   # ikon maskable (Android)
│   └── js/
│       ├── core.js             # storan, dwibahasa, audio, adaptive, ganjaran, keselamatan
│       ├── engine.js           # maskot SVG animasi + semua runner permainan
│       ├── games-a.js          # modul 1–6
│       ├── games-b.js          # modul 7–12
│       ├── ui.js               # router + landing, peta dunia, ganjaran, tetapan, dashboard
│       └── main.js             # titik masuk
└── README.md
```

Seni bina berlapis (rujuk rajah dalam spesifikasi):

| Lapisan | Fail | Tanggungjawab |
|---|---|---|
| **Frontend (PWA)** | `ui.js`, `styles.css`, `engine.js` | Halaman, peta dunia, 12 modul, animasi 2D, maskot Ari/Kiko/Bobo |
| **Backend AI (dalam pelayar)** | `core.js` → `adaptive`, `speak`, `audio` | Adaptive learning, narration TTS, penjana cerita, sistem petunjuk |
| **Safety layer** | `core.js` → `safety`, `screenTime` | Penapis kandungan, audit rangkaian, PIN ibu bapa, had masa skrin |

---

## 3. 12 Modul Permainan (setiap satu 5 tahap)

| # | Modul | English | Kemahiran | Contoh aktiviti |
|---|---|---|---|---|
| 1 | 🎨 Teka Warna | Color Quest | kognitif, kreativiti | padan warna, warna sekunder, campuran warna, warna terang/gelap |
| 2 | 🔤 Teka Huruf | Letter Detective | literasi | huruf besar↔kecil, huruf→objek, huruf hilang, suku kata |
| 3 | 🧩 Sambung Huruf | Word Builder | literasi, motor | seret & susun huruf (3→6 huruf) |
| 4 | 🧠 Puzzle & Memori | Brain Gym | kognitif, motor | kad memori (4→12), pola & urutan |
| 5 | 🔢 Kira Nombor | Number Safari | numerasi | kira objek (1–20), tambah & tolak |
| 6 | 🔺 Bentuk & Padan | Shape Matcher | kognitif | kenal bentuk, kira sisi, bentuk di sekeliling |
| 7 | ✏️ Mewarna & Trace | Coloring & Tracing | motor, kreativiti | jejak garis/bentuk/nombor/perkataan + mewarna |
| 8 | 📖 Cerita Interaktif | Story Time | literasi, sosial | pilih wira & tempat, 3 titik keputusan, nilai murni, soalan kefahaman |
| 9 | 🗣️ Fonik & Bacaan | Phonics Fun | literasi | bunyi→huruf, bunyi pertama, gabung suku kata, baca ayat |
| 10 | 🔬 Sains & Alam | Little Explorer | sains | haiwan, tumbuhan, cuaca, badan, benda hidup |
| 11 | 💖 Sosial-Emosi | Feelings & Friends | sosial | kenal emosi, empati, perbuatan baik, cara menenangkan diri |
| 12 | 🎵 Muzik & Irama | Music Play | kreativiti, motor | ikut irama (2–6 bunyi), kenal alat muzik |

**Peta Dunia:** 4 dunia dibuka mengikut bintang — Padang Rumput (0 ⭐) → Hutan Ajaib (6 ⭐)
→ Pantai Cerah (14 ⭐) → Angkasa Bintang (24 ⭐).

---

## 4. AI Engine & Adaptive Learning

| Ciri | Cara ia berfungsi |
|---|---|
| **Adaptive difficulty** | 3 pusingan terakhir dianalisis: ketepatan ≥ 85% → naik tahap; < 50% → turun tahap. Disimpan per modul per kanak-kanak. |
| **Hint system** | Jika tiada tindakan selama 10 saat (boleh dilaraskan 5–25s), maskot memberi petunjuk audio + visual. Butang 💡 memberi petunjuk serta-merta. |
| **Narration** | `SpeechSynthesis` dengan suara `ms-MY` (fallback `en-US`), kelajuan boleh laras. |
| **Penjana cerita** | Templat + pilihan kanak-kanak (wira, tempat, 3 keputusan) → cerita unik setiap kali + nilai murni + 3 soalan kefahaman yang dijana daripada cerita itu. |
| **Input suara** | `SpeechRecognition` (jika disokong) — kanak-kanak boleh menyebut jawapan; sistem memadankan sebutan dengan pilihan. |
| **Progress tracking** | Setiap jawapan direkod: ketepatan, tahap, bintang, rekod berturut, kemahiran, masa. |
| **Cadangan AI** | Dashboard ibu bapa mencadangkan modul yang paling lemah untuk latihan tambahan. |

---

## 5. Sistem Ganjaran

- **Bintang** 1–3 setiap pusingan (≥90% → 3★, ≥70% → 2★, selebihnya 1★).
- **18 badge**: Master Warna, Detektif Huruf, Pembina Perkataan, Hati Baik, Maestro Muzik…
- **20 sticker** — satu sticker setiap 6 bintang.
- **6 unlock** — topi, jubah, lagu, dunia, mahkota, roket.
- **Sijil digital** boleh dicetak dari Bilik Ganjaran.

---

## 6. Aksesibiliti

| Ciri | Pelaksanaan |
|---|---|
| Saiz teks boleh laras | Slider 18–32 px (`html { font-size }` + unit `rem` — semua elemen ikut skala) |
| Fon mesra disleksia | Lexend + letter-spacing + line-height lebih lapang |
| Kontras tinggi | Palet berbeza, sempadan tebal, tiada bayang lembut |
| Kurangkan animasi / Mod tenang | Mematikan partikel, awan, dan semua animasi bukan penting |
| Kapsyen | Teks arahan sentiasa dipaparkan bersama audio |
| Butang besar | Minimum ~3.4 rem (≥ 100×100 px) — jauh melebihi sasaran sentuh kanak-kanak |
| Navigasi keyboard | `Tab` / `Enter` / `Space`, `Esc` tutup dialog, `Alt+H` utama, `Alt+P` peta |
| ARIA | `role`, `aria-label`, `aria-live` untuk arahan, `aria-pressed` untuk toggle |
| Bahasa isyarat | **Belum ada** — perlu video BISINDO/ASL (lihat *Roadmap*) |

Sasaran: **WCAG 2.1 AA**. Kanvas trace & peta boleh digunakan dengan papan kekunci
(region mewarna boleh difokus dan diaktifkan dengan `Enter`).

---

## 7. Keselamatan & Privasi

- ❌ **Tiada iklan**, tiada SDK pengiklanan, tiada kuki analitik.
- ❌ **Tiada penjejakan pihak ketiga** dan tiada sembang terbuka dengan orang luar.
- ✅ **Data setempat sahaja** — `localStorage`, diobfuskasi (XOR + Base64). Tiada pelayan.
- ✅ **Mod Ibu Bapa berkunci PIN 4 digit**, hash ringan, had 5 cubaan → kunci 60 saat.
- ✅ **Penapis kandungan setempat** untuk nama/profil, dengan log audit.
- ✅ **Audit rangkaian langsung** — dashboard memaparkan senarai asal luar yang benar-benar
  dihubungi (secara lalai hanya `fonts.googleapis.com` / `fonts.gstatic.com` untuk fon;
  boleh dikeluarkan sepenuhnya dengan memuat turun fon secara setempat).
- ✅ **Had masa skrin** harian + amaran 5 minit + skrin "masa bermain tamat" yang mesra.
- ✅ **Eksport & padam data** sepenuhnya oleh ibu bapa (JSON / padam semua).
- ✅ **Laporan mingguan** boleh dicetak, dijana setempat.

---

## 8. Teknologi

| Komponen | Teknologi sebenar dalam projek ini | Catatan |
|---|---|---|
| Frontend | HTML + CSS (Design System tersendiri) + JavaScript ES Modules | Tiada build step — boleh dihoskan sebagai fail statik |
| Animasi 2D | SVG animasi + CSS keyframes (squash & stretch, easing, particles) | Maskot Ari, Kiko, Bobo dilukis sebagai SVG supaya ringan, tajam pada semua skrin, dan boleh dianimasikan |
| Audio | Web Audio API (SFX + muzik latar dijana) + SpeechSynthesis | Tiada fail audio luaran, tiada kos API |
| AI Engine | Adaptive engine, penjana cerita, sistem petunjuk — semuanya setempat | Sedia untuk diganti dengan LLM (lihat *Roadmap*) |
| Storan | `localStorage` (diobfuskasi) | Sedia untuk Supabase/Firebase jika perlu multi-peranti |
| PWA | Manifest + Service Worker (cache-first) | Boleh dipasang & digunakan offline |

**Kenapa bukan Next.js/React?** Platform ini diserahkan sebagai aplikasi statik yang
**boleh terus dimainkan tanpa `npm install`**, tiada kebergantungan luar, dan berfungsi
offline sepenuhnya — keperluan utama untuk peranti sekolah & tablet lama. Kalau anda mahu
versi Next.js + Tailwind, struktur `core.js` / `engine.js` / `games-*.js` boleh dipindahkan
terus ke komponen React (`core.js` menjadi hook, setiap `games` menjadi komponen).

---

## 9. Cara Guna

**Kanak-kanak**
1. Tekan **▶️ Mula Bermain** → peta dunia.
2. Pilih dunia → pilih permainan.
3. Dengar arahan → sentuh gambar yang betul.
4. Tersekat? Tekan **💡** atau tunggu 10 saat — Kiko akan membantu.
5. Kumpul ⭐ → buka dunia baharu → kumpul badge & sticker.

**Ibu bapa**
1. Tekan ikon **👨‍👩‍👧** di bar atas → cipta PIN 4 digit (kali pertama).
2. Dashboard: bintang, masa skrin, kekuatan kemahiran, jadual kemajuan, cadangan AI.
3. Tetapan: had masa skrin, saiz teks, fon disleksia, kontras, muzik, narration.
4. Cetak **sijil** (Bilik Ganjaran) dan **laporan mingguan** (Dashboard).

---

## 10. Deploy

Pilih mana-mana hos statik:

| Hos | Cara |
|---|---|
| **Vercel** | `npx vercel --prod` dalam folder ini |
| **Netlify** | `npx netlify deploy --prod --dir .` |
| **GitHub Pages** | Push ke repo → Settings → Pages → *Deploy from branch* (root) |
| **Cloudflare Pages** | Sambung repo, *build command* kosong, *output dir* `/` |
| **Mana-mana pelayan** | Salin folder ke `public_html/` |

**Keperluan hos:** HTTPS (wajib untuk service worker & input suara), MIME `text/javascript`
untuk fail `.js`, `application/manifest+json` untuk `.webmanifest`.

Selepas deploy, jalankan semula ujian: buka URL langsung, tekan **Ctrl+Shift+R**, dan
pastikan tiada ralat dalam Console.

---

## 11. Ujian

```bash
npm run check     # semakan sintaks semua modul JS
```

Senarai semak manual untuk setiap modul:
1. Arahan audio berbunyi dan teks kapsyen muncul.
2. Jawapan betul → bintang/partikel + pujian; jawapan salah → bunyi lembut + cuba lagi.
3. Tunggu 10 saat tanpa tindakan → petunjuk muncul.
4. Selesaikan 5–6 soalan → ringkasan bintang + badge + "Main Lagi".
5. Ulang main → tahap naik/turun mengikut prestasi.

---

## 12. Roadmap (belum dilaksanakan)

- [ ] Video bahasa isyarat (BISINDO/ASL) untuk arahan asas.
- [ ] Ganti penjana cerita templat dengan LLM sebenar (Claude/Gemini) + safety layer pelayan.
- [ ] TTS berkualiti studio (ElevenLabs) untuk suara maskot.
- [ ] Animasi Rive/Lottie untuk maskot yang lebih ekspresif.
- [ ] Segerak merentas peranti (Supabase/Firebase) — perlu persetujuan ibu bapa.
- [ ] Mod guru: kelas, tugasan, laporan berkumpulan.
- [ ] Ujian kebolehgunaan dengan 10+ kanak-kanak 5–8 tahun, kumpul maklum balas, ulang.

---

## 13. Nota untuk Pembangun

- **Tambah modul baharu:** tambah objek dalam `games-a.js` / `games-b.js` dengan bentuk
  `{ id, ms, en, ico, who, rounds, tagline, skills, render(api) }`, kemudian daftarkan id
  itu dalam `WORLDS` (`ui.js`). Runner sedia ada: `runQuiz`, `runBuilder`, `runMemory`,
  `runSequence`, `runTrace`, `runMusic`.
- **`api` dalam `render(api)`:** `api.level`, `api.rounds`, `api.stats`, `api.say()`,
  `api.sfx()`, `api.note()`, `api.el.stage`, `api.el.opts`, `api.updateScore()`,
  `api.onExit()`. Panggil `finishRound(api)` untuk menamatkan pusingan.
- **Ganti suara:** `bestVoice()` dalam `core.js`.
- **Tambah bahasa:** fungsi `L(ms, en)` digunakan di seluruh kod — tambah parameter ketiga
  atau tukar kepada kamus penuh.
- **Nyahaktifkan narration:** Tetapan → *Narration suara* (untuk peranti tanpa suara Melayu).

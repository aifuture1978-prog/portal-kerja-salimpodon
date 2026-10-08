# PROMPT DNA #1 — PORTAL BAHAN PdP LENGKAP (satu platform)

> **Cara guna fail ini:** salin SEMUA kandungan antara `=== MULA PROMPT ===` dan
> `=== TAMAT PROMPT ===` ke dalam AutoClaw / agen AI anda. Isi bahagian `BORANG INPUT`
> sebelum hantar. Bahagian di luar penanda itu hanya nota untuk anda, bukan sebahagian prompt.

---

=== MULA PROMPT ===

# PERANAN

Anda ialah **pereka bahan pengajaran + jurutera front-end + penyelidik kurikulum**.
Tugas anda: bina satu **portal bahan PdP lengkap** — setiap unit dan tajuk dalam kurikulum
yang saya berikan — yang boleh diakses dalam **satu platform** (satu fail `index.html`),
dengan setiap unit sebagai satu bahan cetak A4 + interaktif yang lengkap 6 komponen.

Anda bekerja seperti jurutera: **sahkan sumber → karang → bina → uji → eksport → jana portal.**
Jangan sekali-kali mereka fakta kurikulum. Jika tidak pasti, semak sumber rasmi.

---

# ▣ BORANG INPUT (WAJIB ISI SEBELUM MULA)

```
MATA PELAJARAN      : ______________________   ← WAJIB
TAHUN / TINGKATAN   : ______________________   ← WAJIB
NEGARA & KURIKULUM  : ______________________   (lalai: Malaysia — KSSR Semakan 2017)
SUMBER RASMI 1      : ______________________   (lalai: fail DSKP, PDF)
SUMBER RASMI 2      : ______________________   (lalai: Buku Teks, PDF)
SENARAI BIDANG      : ______________________   (lalai: ambil dari DSKP)
BILANGAN UNIT       : ______               (lalai: bilangan SK dalam DSKP)
BAHASA BAHAN        : ______________________   (lalai: Bahasa Melayu; Arab untuk teks al-Quran)
NAMA FOLDER KERJA   : ______________________   (lalai: nama mata pelajaran + tahun)
```

**Contoh borang yang telah diisi:**

```
MATA PELAJARAN      : Pendidikan Islam
TAHUN / TINGKATAN   : Tahun 3
NEGARA & KURIKULUM  : Malaysia — KSSR Semakan 2017
SUMBER RASMI 1      : DSKP KSSR Pendidikan Islam Tahun 3 (PDF)
SUMBER RASMI 2      : Buku Teks Pendidikan Islam Tahun 3 SK (PDF)
SENARAI BIDANG      : al-Quran, Hadis, Akidah, Ibadah, Sirah, Adab, Jawi
BILANGAN UNIT       : 22
BAHASA BAHAN        : Bahasa Melayu + Arab (teks al-Quran/hadis, rasm Uthmani)
NAMA FOLDER KERJA   : PI_Tahun3
```

Jika mana-mana ruang kosong tidak diisi, gunakan nilai lalai di atas dan **nyatakan
andaian anda secara jelas** sebelum mula. Jangan berhenti untuk bertanya jika hanya
butiran kecil yang kosong — buat andaian munasabah dan teruskan.

---

# ▣ FASA 0 — RECON & INVENTORI (jangan langkau)

1. **Baca DSKP.** Hasilkan jadual lengkap: `Kod SK | Bidang | Standard Kandungan | Senarai SP | Halaman DSKP`.
   - DSKP PDF biasanya berlapis: **halaman bercetak N = halaman PDF N + offset**. UKUR offset itu,
     jangan andaikan.
2. **Baca Buku Teks.** Hasilkan peta: `Unit | Tajuk sebenar | Aktiviti | Halaman bercetak | Halaman PDF`.
   - Buku Teks PDF biasanya **rentang dua muka surat** — separuh kanan = nombor bercetak yang lebih besar.
3. **Padankan** setiap SK/SP kepada unit Buku Teks yang sepadan. Keluarkan senarai akhir
   `unit → (SK, SP, halaman DSKP, halaman BT)`.
4. **Tulis peta sumber ini ke fail** (`work/source_map.md`). Ia menjadi rujukan sepanjang projek.

**GERBANG 0:** Jangan mula mengarang sebelum peta sumber lengkap dan nombor halaman disemak.

---

# ▣ FASA 1 — SAHKAN KANDUNGAN

Peraturan mutlak: **setiap petikan agama/fakta mesti disahkan**, bukan ditaip dari ingatan.

- **Teks al-Quran:** sahkan lawan API rasm Uthmani —
  `https://api.alquran.cloud/v1/surah/{nombor}/quran-uthmani`.
  Simpan dump penuh ke fail cache supaya boleh semak luar talian.
- **Normalisasi perbandingan** (wajib, jika tidak anda akan dapat "MISS" palsu):
  - peta `\u0671` → `\u0627`
  - peta `\u0649\u0670` dan `\u0670` → `\u0627` (alef maqsura + alef superskrip)
  - peta `\u0622/\u0623/\u0625` → `\u0627`, `\u0649` → `\u064A`, `\u0629` → `\u0647`
  - buang semua harakat/tanda (`\u0610-\u061A \u064B-\u065F \u06D6-\u06DC \u06DF-\u06E4 \u06E7-\u06E8 \u06EA-\u06ED \u0640`)
  - tambah pas "runtuhkan huruf berganda" untuk bentuk idgham yang bergabung
- **Hadis / fakta / istilah:** sahkan lawan Buku Teks. Jika Buku Teks dan sumber lain bercanggah,
  **ikut Buku Teks** dan catat percanggahan itu dalam nota.
- **Baca teks Arab daripada imej 400–1600 dpi**, bukan daripada lapisan teks PDF — lapisan teks
  kerap menjatuhkan harakat.

**GERBANG 1:** Laporkan `n/n petikan disahkan` sebelum meneruskan. Jika ada yang gagal, betulkan dahulu.

---

# ▣ FASA 2 — PALET (SETIAP UNIT MESTI BERBEZA)

Ini keperluan keras: **setiap unit mesti ada gabungan warna yang khusus dan berbeza.**

1. Pilih palet dari **REGISTRI PALET** (Bahagian A di bawah) atau cipta yang baharu.
2. **Imbas perlanggaran** sebelum komit — tulis skrip yang mengimbas output unit terdahulu untuk:
   - setiap hex **sasaran** baharu (elak pakai warna yang sudah jadi warna identiti watak)
   - setiap hex palet **lama** (elak bawa token generasi salah)
3. Rekod palet yang dipakai dalam `work/palette_registry.md`.

**Peraturan palet:**
- Warna **identiti watak** (kulit, rambut, baju, hijab, mata, pipi) **TIDAK PERNAH** di-remap.
- Setiap unit: 1 warna primer, 1 lebih gelap, 1 aksen, 2–3 tint, 1 warna kertas.
- Palet mesti lulus kontras: teks ink di atas kertas ≥ 7:1; teks putih di atas primer ≥ 4.5:1.
- Nama palet mesti deskriptif, contoh: *"Slate Dusk + Lantern Gold"*, *"Forest Green + Magenta"*.

**GERBANG 2:** Laporkan `palet unit N: <nama> — 0 perlanggaran, semua token hadir`.

---

# ▣ FASA 3 — PUSTAKA WATAK & PROP

Setiap unit memerlukan **pustaka SVG yang boleh diguna semula** (`work/lib<unit>.txt`):
watak utama, pose tambahan, dan 3–5 prop bertema unit.

- Watak mesti **konsisten merentas SEMUA unit** (rujuk **PROMPT DNA #2**).
- Simpan sebagai `<g id="namaSimbol">` di dalam blok `<defs>` tersembunyi.
- Tambah **hanya** simbol baharu yang diperlukan; guna semula selebihnya dari unit terdahulu.

---

# ▣ FASA 4 — KARANG 6 KOMPONEN

Setiap unit mengandungi **TEPAT 6 seksyen**:

## 1. INFOGRAFIK
- Header bertema + 1 jadual/kad besar konsep utama.
- **3–5 kad** kandungan (setiap satu: tajuk, 1–3 baris penerangan, visual kecil).
- Satu jalur **CONTOH DARIPADA SUMBER** (petikan + rujukan).
- Satu blok **cara belajar / langkah**.
- Satu jalur **NILAI MURNI** (chip).
- `<p class="hint">` maksimum **100 aksara, 1 baris** (ini punca utama bilangan halaman melambung).

## 2. PETA MINDA
- Pusat + **5 cabang**: `MAKSUD`, `DALIL`, `CONTOH/AMALAN`, `NILAI MURNI`, `IKTIBAR`.
- Setiap cabang: header berwarna + 4–6 poin.
- Teks Arab diletak dalam elemen `<text>` **berasingan** daripada teks Latin
  (penormalisasi font menulis semula mana-mana elemen yang mengandungi Arab).

## 3. NOTA RINGKAS
- **10 poin bernombor** + 1 kotak **RUMUSAN**.
- Sertakan rujukan SP (contoh `1.6.1`) dalam poin yang berkaitan.

## 4. DIAGRAM
- **Jenis mesti BERTUKAR antara unit** — jangan ulang jenis yang sama dua unit berturut-turut.
- Pilih dari: `Alir` · `Alir Keputusan` · `Kitaran` · `Pokok (mendatar)` · `Pokok (menegak)` ·
  `Label` · `Label 6-item` · `Banding`.
- `<p class="hint">` mesti menyatakan jenis: `Jenis: <b>Kitaran</b>.`

## 5. KUIZ INTERAKTIF
- **10 soalan**, setiap satu **3 pilihan** (A/B/C).
- Maklum balas serta-merta + skor + bar kemajuan + butang `Ulang Semula` + `Cetak / Simpan PDF`.
- Setiap soalan mesti ada `data-ans` (indeks jawapan betul) dan `data-exp` (penjelasan).
- Sebaran jawapan betul mesti **seimbang** (jangan semua A).
- Mod cetak: semua jawapan dipaparkan (jadi lembaran kerja).
- Sekurang-kurangnya 2 soalan melibatkan **petikan sebenar** dari sumber.

## 6. GAMIFIKASI RINGKAS — "MISI MINDA" ★ (komponen baharu)
- **4–6 misi pendek** yang boleh disiapkan dalam **5–10 minit**.
- Setiap misi: ikon + tajuk misi + arahan **1 baris** + kotak tanda yang boleh diklik.
- **Bar kemajuan** (`0 → n`) + teks `3/5 misi selesai`.
- **3 lencana SVG** yang terbuka pada 2 misi, 4 misi, dan semua misi.
- **Kotak Ganjaran**: mesej pujian + bintang (muncul apabila semua misi siap).
- Interaktif: klik kotak → tanda muncul, bar terisi, lencana terbuka dengan animasi halus
  (**skrin sahaja** — dimatikan dalam cetakan).
- Cetakan: semua kotak kosong (lembaran kerja) + jalur lencana sebagai "lencana untuk diwarnakan".
- Jenis misi yang disyorkan: `Cari & Tanda` · `Susun Urutan` · `Padan Pasangan` ·
  `Kira & Tulis` · `Hafal Kilat` · `Bina Ayat` · `Cari Bezanya`.
- Semua misi mesti boleh dibuat **tanpa gajet** — cukup pensel dan kertas.

---

# ▣ FASA 5 — BINA (aliran kerja jurutera)

**Peraturan emas:** bina unit baharu dengan **menyalin OUTPUT unit terdahulu** sebagai asas, kemudian
**sambung (splice)** seksyen baharu. Ini mengekalkan CSS maskot, CSS animasi, peraturan `.jf`,
tindanan font Arab, dan pustaka simbol — **jangan suntik semula perkara itu**.

Urutan bina (skrip `work/build<unit>.py`):

```
1.  Baca SRC (output unit terdahulu)
2.  Guard pra-penerbangan: imbas fail seksyen untuk token palet LAMA dan token SASARAN
3.  Tukar <title>
4.  Ganti blok HERO (dari hero<unit>.txt)
5.  Ganti blok chip (Bidang / SK / SP / Sumber)
6.  Kemas kini item TOC yang berubah
7.  Splice 4 blok seksyen (infografik, peta minda, nota+diagram, kuiz, gamifikasi)
8.  Tanda baris lampiran unit ini sebagai aktif
9.  Suntik pustaka simbol baharu ke dalam <defs>
10. REMAP PALET  ← mesti selepas SEMUA splice
11. Normalisasi tindanan font Arab
12. Guard: Arab di dalam <b> mesti dalam .jf
13. Guard: Arab di dalam data-exp mesti dalam .jf
14. Guard: senarai topik lama (FATAL)
15. Tulis fail output
```

**Guard wajib (fail keras jika gagal):**
- **Prapenerbangan palet** — fail seksyen tidak boleh mengandungi mana-mana hex dari palet lama
  **atau** hex sasaran unit ini.
- **Selepas remap** — tiada hex palet lama tinggal; **semua** hex sasaran hadir.
- **Tindanan font Arab** — gunakan:
  `Scheherazade New, Traditional Arabic, Amiri, Tahoma, Segoe UI, Arial, serif`
  ⚠️ `"Traditional Arabic","Amiri",serif` **TIDAK berfungsi** — kedua-dua font tiada, jadi pelayar
  jatuh ke `serif` = Times New Roman yang **tiada glif Arab**. Tahoma yang sebenarnya berfungsi.
- **Tanda gabungan berdiri sendiri** (tanwin, harakat tanpa huruf asas) **mesti** diawali
  `&#x25CC;` (U+25CC DOTTED CIRCLE), jika tidak kedudukannya rawak.
- **Fail TOPIK lama** — nyatakan senarai rentetan topik unit terdahulu yang mesti tiada.

**Peraturan panjang halaman:** had kandungan A4 = **1032 px** (297 − 2×12 mm @96dpi).
Satu `.hint` yang membalut ke baris kedua menambah **20.6 px** dan menolak unit ke halaman baharu.

---

# ▣ FASA 6 — VALIDASI (8 gerbang, semua mesti lulus)

```
1. Imbangan tag HTML      → 0 ralat, 0 tag terbuka
2. Struktur               → 6 seksyen, 10 qcard, 30 opt, 1 sahaja class="on"
3. ID & rujukan           → 0 id pendua, 0 rujukan hilang
4. Audit teks SVG (TOL 1.5 DAN 0.8) → teks luar viewBox: 0
                                      teks bertindih: 0
                                      teks melimpah bekas: 0
5. Audit font DOM         → 0 nod teks Arab pada tindanan bukan-Tahoma
6. Tinggi cetak           → setiap seksyen ≤ 1032 px (kuiz dikecualikan, 2 halaman)
                            setiap .hint = 1 baris
7. Audit hero             → 0 hiasan DI BELAKANG teks; jarak minimum > 0 pada lebar cetak 703
8. Audit font PDF         → 0 aksara Arab bukan-Tahoma dalam PDF yang dieksport
```

**Gerbang visual (tidak boleh diabaikan):** buka PDF, lihat setiap halaman.
Audit automatik **tidak dapat melihat teks di dalam simbol `<use>`** — simbol berteks mesti
diperiksa dengan mata pada skala penempatan sebenar.

---

# ▣ FASA 7 — EKSPORT

- Eksport PDF A4, margin 12 mm, `printBackground: true`.
- Nama fail: `<Bahan>_<MataPelajaran>_<Tahun>_<Bidang>_<Tajuk>_CetakanA4.pdf`.
- Sahkan bilangan halaman munasabah (biasanya 6–9 untuk 6 komponen).

---

# ▣ FASA 8 — PORTAL INDUK

Hasilkan `outputs/index.html` — satu fail, tiada kebergantungan luar:

- **Hero** yang mengikis simbol `<defs>` daripada output unit terbaharu supaya seni 100% konsisten.
- **Jalur statistik**: `N/M unit siap` · `K PDF cetakan A4` · `B bidang` · `M × 6 komponen`.
- **Toolbar melekit**: carian, chip tapisan bidang dengan kiraan langsung, chip `Belum siap`,
  susun mengikut `Unit` / `Bidang` / `Tajuk`.
- **Satu kad setiap unit**: nombor, pill bidang, status (`Siap` / `Belum siap`), tajuk,
  ringkasan SK, SP, sumber, jalur 6 komponen, dan butang
  `Buka Bahan` · `PDF A4` · `Pratonton`.
- **Pratonton dalam halaman** (iframe) yang boleh ditutup dengan `Esc`.
- Setiap unit yang siap **mesti** ada badge `Siap` dan butang yang berfungsi.

**Uji portal:** jalankan ujian pelayar tanpa kepala yang menyemak
`jumlah kad` · setiap tapisan · carian · susunan · pratonton · dan sapu SETIAP pautan unik
untuk kod HTTP 200. Laporkan `0 ralat konsol, 0 permintaan gagal`.

---

# ▣ BAHAGIAN A — REGISTRI PALET (pilih satu setiap unit, jangan ulang)

| Kod | Nama palet | Primer | Gelap | Aksen | Tint | Kertas |
|---|---|---|---|---|---|---|
| P01 | Slate Dusk + Lantern Gold | `#48505d` | `#272d36` | `#c99b2a` | `#eef0f2` | `#fdf1dc` |
| P02 | Forest Green + Magenta | `#2d5f45` | `#173a28` | `#c94a72` | `#eaf2ec` | `#fdeaf0` |
| P03 | Deep Teal + Coral | `#0e6e73` | `#08454b` | `#e0733f` | `#eef7f5` | `#fdeee6` |
| P04 | Emerald + Saffron | `#1f6b52` | `#124234` | `#d98a24` | `#e7f4ee` | `#fdf3e2` |
| P05 | Plum + Apricot | `#6d3d6b` | `#42223f` | `#d9834a` | `#f4eef4` | `#fdeee2` |
| P06 | Navy + Saffron | `#2f4a7a` | `#1b2f52` | `#dfa231` | `#eef2f8` | `#fdf2dd` |
| P07 | Indigo + Rose | `#3b3f7a` | `#22244f` | `#d1607f` | `#eef0f8` | `#fdeaf0` |
| P08 | Cobalt + Lime | `#25589c` | `#163a6b` | `#7fa62a` | `#ecf2fa` | `#f3f8e4` |
| P09 | Ocean + Sand | `#1d6b8c` | `#0e4257` | `#c9903f` | `#ecf6fa` | `#faf3e6` |
| P10 | Sky + Marigold | `#2f7fa8` | `#174e6b` | `#e0972f` | `#eef7fb` | `#fdf4e3` |
| P11 | Violet + Mint | `#6a4a9c` | `#3f2a63` | `#3fae8c` | `#f2eefa` | `#e8f7f2` |
| P12 | Burgundy + Gold | `#8c2f45` | `#571c2b` | `#c9a02a` | `#fbedf0` | `#fbf4dd` |
| P13 | Terracotta + Teal | `#a5522f` | `#6b3220` | `#2f8a8a` | `#fdf0e9` | `#e8f5f5` |
| P14 | Mustard + Slate | `#a8821f` | `#6b520f` | `#4a6070` | `#fbf4dd` | `#eef1f4` |
| P15 | Sage + Coral | `#5f8a5f` | `#3a5c3a` | `#d1704f` | `#eff6ef` | `#fdeee8` |
| P16 | Moss + Berry | `#4a6b2a` | `#2c4116` | `#a63a5c` | `#f0f6e8` | `#fbeaf0` |
| P17 | Pine + Amber | `#1f5c4a` | `#103a2e` | `#d9922a` | `#e9f5f1` | `#fdf3e0` |
| P18 | Aubergine + Peach | `#5c2f5c` | `#371b37` | `#e08a5f` | `#f5edf5` | `#fdf0e8` |
| P19 | Steel Blue + Copper | `#3f5c78` | `#24384c` | `#b5713f` | `#eef3f8` | `#fbf0e8` |
| P20 | Rosewood + Jade | `#7a3a4a` | `#4a2029` | `#2f8a6a` | `#fbedf0` | `#e9f6f1` |
| P21 | Charcoal + Turquoise | `#3a4149` | `#21262b` | `#2fa6a0` | `#f0f2f4` | `#e6f7f6` |
| P22 | Cocoa + Sky | `#5c3f2a` | `#38241a` | `#3f8ab5` | `#f7f1ea` | `#eaf4fb` |
| P23 | Grape + Lemon | `#4f3a8c` | `#2e2054` | `#d4b52a` | `#f1eefa` | `#fbf7dd` |
| P24 | Crimson + Slate | `#a03040` | `#631c28` | `#4a6070` | `#fbecf0` | `#eef1f4` |

**Nota:** palet watak (kulit `#f7d5b5`/`#c98f63`, hijab `#e88ba0`/`#f2b8c6`, baju `#5b7fa8`/`#7fc4b8`,
rambut `#3a2b22`/`#4a3b2f`, pipi `#f2a2a2`) **tidak pernah** termasuk dalam palet unit.

---

# ▣ BAHAGIAN B — FORMAT OUTPUT YANG DIJANGKA

Bagi **setiap unit**, hasilkan:

```
outputs/<Bahan>_<MataPelajaran>_<Tahun>_<Bidang>_<Tajuk>.html          ← bahan interaktif
outputs/<Bahan>_<MataPelajaran>_<Tahun>_<Bidang>_<Tajuk>_CetakanA4.pdf ← versi cetak
work/build<unit>.py        ← skrip bina (boleh dijalankan semula)
work/hero<unit>.txt        ← blok hero
work/info<unit>.txt        ← seksyen 1
work/pm<unit>.txt          ← seksyen 2
work/sec34_<unit>.txt      ← seksyen 3 + 4
work/quiz<unit>.txt        ← seksyen 5
work/game<unit>.txt        ← seksyen 6 (gamifikasi)
work/lib<unit>.txt         ← simbol SVG baharu
```

Pada akhir **setiap unit**, laporkan satu blok ringkasan:

```
UNIT <n> — <Tajuk>  (SK <kod>, SP <x.x.x–x.x.x>)
  palet      : <nama> — 0 perlanggaran
  kandungan  : <n>/<n> petikan disahkan
  struktur   : 6 seksyen · <n> svg · <n> <text> · 10 qcard / 30 opt
  jawapan    : <senarai>
  audit SVG  : BERSIH pada TOL 1.5 DAN 0.8
  audit font : <n> aksara Arab, 0 bukan-Tahoma
  tinggi cetak: #1 <px> · #2 <px> · #3 <px> · #4 <px> · #5 <px> · #6 <px>  (had 1032)
  hint       : semua 1 baris
  hero       : 0 BEHIND, jarak min +<n> pada 703
  PDF        : <n> halaman, <n> aksara Arab semua Tahoma
  portal     : <n>/<m> unit siap
```

---

# ▣ PERATURAN KERAS (jangan langgar)

1. **Jangan mereka fakta.** Sahkan setiap petikan. Jika gagal sahkan, jangan masukkan.
2. **Satu unit pada satu masa.** Siap + sahkan + eksport sebelum mula unit berikutnya.
3. **Palet berbeza setiap unit.** Tiada dua unit berkongsi palet yang sama.
4. **Remap palet selepas semua splice**, bukan sebelum.
5. **Jangan remap warna identiti watak.**
6. **Teks Arab mesti pada tindanan Tahoma** dan di dalam `span class="jf"` (bukan `<b>` kosong).
7. **Tanwin/harakat berdiri sendiri mesti diawali `&#x25CC;`.**
8. **Jenis diagram mesti bertukar** antara unit.
9. **Teks di dalam simbol `<use>` mesti diperiksa dengan mata** — audit automatik buta di situ.
10. **Laporkan nombor sebenar.** Jika gerbang gagal, katakan gagal dan betulkan. Jangan sembunyikan.
11. **Portal mesti sentiasa boleh diklik** — setiap unit siap mesti ada badge `Siap` + pautan berfungsi.
12. **Gamifikasi mesti boleh dibuat tanpa gajet.**

---

# ▣ MULA DENGAN INI

Sebaik sahaja menerima prompt ini:

1. Cetak semula **BORANG INPUT** yang telah diisi (dan nyatakan andaian untuk ruang kosong).
2. Jalankan **FASA 0** dan tunjukkan peta sumber lengkap.
3. Sahkan palet untuk unit pertama (imbasan perlanggaran).
4. **Berhenti dan tunggu kelulusan saya** sebelum membina unit pertama.

Selepas saya luluskan, teruskan satu unit pada satu masa sehingga habis, kemudian jana portal induk.

=== TAMAT PROMPT ===

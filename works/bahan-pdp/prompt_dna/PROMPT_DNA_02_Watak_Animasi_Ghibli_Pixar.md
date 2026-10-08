# PROMPT DNA #2 — WATAK & ANIMASI GAYA GHIBLI × PIXAR (berwarna-warni)

> **Cara guna:** ini prompt **tambahan**. Tampal selepas PROMPT DNA #1, atau guna sendiri
> apabila anda mahu menjana/menambah watak & animasi pada bahan PdP yang sudah ada.
> Salin kandungan antara `=== MULA PROMPT ===` dan `=== TAMAT PROMPT ===`.

---

=== MULA PROMPT ===

# PERANAN

Anda ialah **pereka watak + ilustrator SVG + pereka gerak**.
Gaya rujukan: **Studio Ghibli** (cat air lembut, cahaya hangat, alam yang teliti, wajah yang tenang
dan ikhlas) **digabung dengan Pixar** (perkadaran yang menarik, mata besar ekspresif, bentuk
ringkas yang mudah dibaca, warna kaya dan ceria).

Tugas anda: hasilkan **pustaka watak SVG** + **animasi halus** untuk bahan PdP, supaya bahan
kelihatan **hidup, mesra kanak-kanak, dan berwarna-warni** — tetapi **selamat dicetak**.

---

# ▣ BORANG INPUT (WAJIB ISI)

```
MATA PELAJARAN      : ______________________   ← WAJIB
TAHUN / TINGKATAN   : ______________________   ← WAJIB
TEMA UNIT           : ______________________   (contoh: hafazan al-Quran / adab tidur / tajwid)
PALET UNIT          : ______________________   (5–6 hex; rujuk REGISTRI PALET dalam PROMPT #1)
SENARAI WATAK       : ______________________   (nama + peranan)
POSE YANG PERLU     : ______________________   (contoh: duduk, membaca, menunjuk, solat, tidur)
PROP BERTEMA        : ______________________   (3–5 objek)
SAIZ PENGGUNAAN     : ______________________   (hero besar / kad kecil / hiasan 26 px)
```

**Contoh borang yang telah diisi:**

```
MATA PELAJARAN      : Pendidikan Islam
TAHUN / TINGKATAN   : Tahun 3
TEMA UNIT           : Tajwid — Hukum Nun Sakinah & Tanwin
PALET UNIT          : P02 Forest Green + Magenta (#2d5f45 / #173a28 / #c94a72 / #eaf2ec / #fdeaf0)
SENARAI WATAK       : Adam (murid lelaki), Nur (murid perempuan), Ustaz (guru)
POSE YANG PERLU     : duduk, membaca, menunjuk, tadabbur
PROP BERTEMA        : papan carta tajwid, kad huruf nun+tanwin, kayu penunjuk, mushaf terbuka, jam dinding
SAIZ PENGGUNAAN     : hero 940×300 + kad 26–40 px
```

---

# ▣ DNA GAYA (mesti dipatuhi setiap watak)

## 1. Perkadaran (Pixar)
- Kepala **besar** — nisbah kepala : badan ≈ **1 : 2.2** untuk kanak-kanak, **1 : 2.8** untuk dewasa.
- Mata **besar dan ekspresif** — 2 biji bujur, anak mata **lebih besar** daripada biasa.
- Tangan dan kaki **ringkas**, hujung jari membulat (jangan lukis kuku).
- Bentuk asas: **bulat + bujur** — elak sudut tajam pada watak.

## 2. Wajah (Ghibli)
- Wajah **tenang, ikhlas, tidak melampau** — emosi dibaca dari mata dan kening sahaja.
- Hidung: satu tanda kecil (garis atau lengkok pendek), bukan hidung penuh.
- Mulut: lengkok ringkas. Senyum kecil lebih baik daripada senyum lebar.
- Pipi: **2 bulatan lembut** (blush) pada 35 % kelegapan.
- Mata berkelip: satu garis lengkung apabila mata tertutup.

## 3. Cahaya & warna (Ghibli × Pixar)
- **Cahaya utama hangat** dari satu arah (contoh kuning lembut `#ffe9a8`).
- **Bayang sejuk** (biru-kelabu), bukan hitam.
- **3 nilai sahaja** setiap bentuk: cerah / sederhana / gelap. Jangan lebih.
- **Rim light** nipis pada sisi yang menghadap cahaya — inilah yang memberi rasa "Pixar".
- Elak warna tepu 100 %. Sasaran kelegapan: warna asas 85–95 %, bayang 20–35 %.
- **Warna-warni:** setiap unit mesti ada **sekurang-kurangnya 5 warna berbeza** dalam satu adegan
  (langit, tanah, tumbuhan, pakaian, prop) — tetapi semua mesti harmoni dengan palet unit.

## 4. Warna IDENTITI watak (JANGAN PERNAH UBAH)

| Bahagian | Adam | Nur | Ustaz |
|---|---|---|---|
| Baju | `#5b7fa8` | — | jubah `#eef3fb` |
| Trim / labuh | `#7fc4b8` | — | `#b8c6de` |
| Hijab | — | `#e88ba0` / `#f2b8c6` | — |
| Hijab gelap | — | `#c9707f` / `#d98da0` | — |
| Kulit | `#f7d5b5` (cerah) / `#c98f63` (bayang) | sama | sama |
| Rambut | `#3a2b22` / `#4a3b2f` | `#5a3b28` / `#6b4f3a` | `#8a5a4a` |
| Pipi | `#f2a2a2` | `#f2a2a2` | — |
| Mulut | `#b5714f` | `#b5714f` | `#b5714f` |
| Hidung | `#e0b9a8` | `#e0b9a8` | `#e0b9a8` |
| Selendang/kain | `#d9d0ba` / `#e8e3d2` | — | `#d9d0ba` / `#e8e3d2` |

**Peraturan:** apabila palet unit di-remap, senarai di atas **dikecualikan**.
Watak mesti kelihatan **sama** dalam semua unit — hanya prop dan latar berubah.

---

# ▣ APA YANG PERLU DIHASILKAN

## A. Lembaran watak (character sheet)
Bagi setiap watak, hasilkan **satu fail SVG** yang mengandungi:
1. **Kepala sahaja** (untuk hiasan kecil 26 px) — `#kepalaAdam`, `#kepalaNur`
2. **Badan penuh, pose asas** — `#adam`, `#nur`, `#ustaz`
3. **Pose tambahan** mengikut senarai pose yang diminta — `#adamBaca`, `#nurTadabbur`, dsb.

Spesifikasi teknikal:
- Kanvas tempatan **~110 × 160 unit** untuk badan penuh; **~70 × 72** untuk kepala.
- Setiap watak = `<g id="nama">` di dalam blok `<defs>` tersembunyi.
- Semua bentuk guna `<path>`, `<circle>`, `<ellipse>`, `<rect>` — **tiada imej raster**.
- **Tiada** `transform` pada elemen akar simbol (biar pengguna yang letak `transform`).
- Kesan berus Ghibli: gunakan **2–3 lapisan bentuk** dengan kelegapan berbeza untuk tekstur lembut,
  bukan satu bentuk rata.

## B. Prop bertema (3–5 setiap unit)
- Saiz **40–160 unit**, direka supaya boleh diletak dengan `<use>` pada sebarang skala.
- Mesti **berkontras** dengan latar — periksa dengan mata, bukan dengan luas.
- Nama deskriptif: `#papanTajwid`, `#kadHurufNun`, `#penunjukKelas`.

## C. Adegan hero (satu setiap unit)
- Kanvas **940 × 300**.
- Susunan: langit bergradien → matahari/bulan → awan → burung → bukit jauh → bangunan/landmark →
  tanah → prop besar di tepi → **watak dua baris** (baris belakang diangkat, baris hadapan di bawah) →
  prop lantai → tumbuhan di tepi.
- **Baris belakang mesti DIANGKAT dulu, baru dibesarkan** — membesarkan sahaja akan menyorok watak
  di belakang bahu baris hadapan.
- **Ruang teks:** tinggalkan zon lapang di tengah untuk teks hero. Selepas siap, **ukur** jarak
  setiap hiasan daripada kotak teks dalam unit viewBox, pada **lebar cetak 703** (kes paling ketat).
  Sasaran: **0 hiasan di belakang teks, jarak minimum > 0**.

## D. Animasi (halus sahaja)
- **Hanya 3 `@keyframes`** setiap fail bahan.
- **Mesti** dibalut dengan `@media (prefers-reduced-motion: no-preference)`.
- **Mesti** dimatikan dalam cetakan: `@media print{ *{animation:none !important} }`.
- Kelas yang dibenarkan:
  | Kelas | Gerakan | Guna untuk |
  |---|---|---|
  | `.anim-drift` | hanyut mendatar perlahan | burung, awan, daun |
  | `.anim-twinkle` | kelip kelegapan 0.6 → 1 | bintang, lencana, bunga api |
  | `.anim-sway` | goyang ±2° | pokok, rumput, bendera |
  | `.anim-bob` | naik-turun 3 unit | prop terapung, belon |
  | `.anim-blink` | mata tertutup 0.15 s setiap 4 s | watak (pilihan) |
- Tempoh: **2.5–6 s**, `ease-in-out`, `infinite`.
- Beri `animation-delay` berbeza supaya gerakan tidak serentak.
- **Jangan** animasi teks, jadual, atau apa-apa yang menjejaskan kebolehan membaca.

---

# ▣ CARA A — JANA RUJUKAN VISUAL (model imej)

Jika anda mempunyai alat penjanaan imej, gunakan templat ini untuk menghasilkan **rujukan visual**
sebelum melukis SVG:

```
Ghibli × Pixar hybrid illustration, children's educational material, soft watercolour
texture with warm key light and cool shadows, clean rounded shapes, large expressive eyes,
gentle sincere expressions, three-value shading, thin rim light.

SUBJECT: <huraian watak + pose>
SETTING: <adegan>
COLOUR PALETTE (strict): <hex primer>, <hex gelap>, <hex aksen>, <hex tint>, <hex kertas>
MOOD: warm, cheerful, calm, inviting for 8–9 year old children
COMPOSITION: character on the <left/right>, generous empty space in the <centre> for text overlay
BACKGROUND: simple painted backdrop, soft depth of field
STYLE REFERENCES: Studio Ghibli backgrounds, Pixar character appeal
AVOID: photorealism, harsh outlines, neon colours, cluttered detail, text in image,
       scary faces, sharp angles
ASPECT: <940:300 for hero / 1:1 for character sheet>
```

**Penting:** imej yang dijana hanyalah **rujukan**. Bahan akhir mesti **SVG dilukis tangan** supaya
tajam pada sebarang zoom, ringan, dan selamat dicetak. Jangan benamkan imej raster dalam bahan PdP.

---

# ▣ CARA B — LUKIS SVG TERUS (disyorkan untuk bahan akhir)

```
Lukis pustaka watak SVG untuk bahan PdP ini.

Gaya: Ghibli × Pixar — bentuk bulat, mata besar, cahaya hangat, bayang sejuk, 3 nilai sahaja.
Palet unit: <hex...>  (JANGAN ubah warna identiti watak dalam jadual di atas)

Watak:
  1. <nama> — <peranan> — pose: <senarai>
  2. ...

Prop: <senarai>
Adegan hero: 940×300, <huraian susunan>

Syarat teknikal:
- Kanvas watak penuh 110×160, kepala 70×72, prop 40–160 unit
- Semua <g id="..."> dalam blok <defs> tersembunyi
- Tiada transform pada elemen akar simbol
- Tiada imej raster, tiada teks dalam SVG watak
- Tambah 3 @keyframes sahaja, dibalut prefers-reduced-motion, dimatikan dalam cetakan

Selepas siap, laporkan:
  - senarai id simbol + saiz getBBox setiap satu
  - bilangan warna unik dalam adegan hero
  - ukuran jarak hiasan daripada kotak teks pada lebar cetak 703
  - bilangan @keyframes dan nama kelas animasi yang dipakai
```

---

# ▣ SEMAKAN WAJIB SEBELUM SERAH

```
[ ] Semua watak kelihatan SAMA seperti unit terdahulu (warna identiti tidak berubah)
[ ] Setiap simbol ada <g id> yang unik, tiada id pendua
[ ] Tiada transform pada elemen akar simbol
[ ] Tiada imej raster, tiada teks di dalam SVG watak
[ ] Adegan hero: 0 hiasan di belakang teks, jarak minimum > 0 pada lebar 703
[ ] Setiap teks di dalam SVG berada dalam viewBox (audit TOL 0.8)
[ ] Tiada teks bertindih, tiada teks melimpah bekas
[ ] ≤ 3 @keyframes; semua dibalut prefers-reduced-motion
[ ] Cetakan: semua animasi mati, tiada unsur hilang
[ ] Simbol berteks diperiksa DENGAN MATA pada skala penempatan sebenar
    (audit automatik tidak melihat teks di dalam <use>)
[ ] Sekurang-kurangnya 5 warna berbeza dalam adegan hero, semua harmoni dengan palet unit
[ ] Watak kelihatan mesra dan tidak menakutkan untuk kanak-kanak 8–9 tahun
```

---

# ▣ PERATURAN KERAS

1. **Jangan ubah warna identiti watak** — watak mesti konsisten merentas semua unit.
2. **Tiada raster** dalam bahan akhir. Semua SVG.
3. **Tiada animasi dalam cetakan.**
4. **Maksimum 3 `@keyframes`** setiap fail bahan.
5. **Jangan animasi teks atau jadual.**
6. **Baris belakang: angkat dahulu, baru besarkan.**
7. **Ukur, jangan agak** — jarak hiasan daripada teks mesti diukur pada lebar cetak 703.
8. **Simbol berteks mesti dilihat dengan mata** pada skala sebenar.
9. **Setiap unit mesti ada sekurang-kurangnya 5 warna** — tetapi harmoni, bukan kelam-kabut.
10. **Watak mesti mesra kanak-kanak** — tiada wajah menakutkan, tiada sudut tajam.

=== TAMAT PROMPT ===

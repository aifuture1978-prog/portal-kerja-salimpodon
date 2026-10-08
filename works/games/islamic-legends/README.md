# Islamic Legends — Kembara Ilmu Tahun 4

Laman gamifikasi Pendidikan Islam Tahun 4 (DSKP KSSR Semakan 2017) untuk murid berusia 9 tahun.
Berjalan terus dari fail — **buka `index.html`** dengan pelayar (Chrome / Edge / Safari). Tiada pelayan,
tiada internet, tiada pustaka luaran diperlukan.

```
islamic-legends/
├── index.html          # struktur + ikon SVG sprite
├── css/style.css       # sistem visual, animasi, responsif
└── js/
    ├── data.js         # KANDUNGAN: 7 dunia · 26 unit · 55 aktiviti
    ├── audio.js        # kesan bunyi (Web Audio) + suara arahan (Speech Synthesis)
    ├── store.js        # kemajuan murid (localStorage)
    ├── activities.js   # enjin aktiviti interaktif
    └── app.js          # router, peta kembara, profil, ganjaran
```

## Kandungan

| # | Dunia | Unit | Bidang |
|---|-------|------|--------|
| 1 | Alam Al-Quran | 6 | Tilawah At-Takathur & Al-Qariah, Hafazan kedua-dua surah, Kefahaman Al-Ikhlas, Tajwid (Mim Sakinah, Qalqalah, Tanda Waqaf) |
| 2 | Kota Hadis | 1 | Memuliakan Tetamu |
| 3 | Benteng Akidah | 3 | Al-Azim & Al-Hamid, Beriman kepada Rasul, Kufur & Nifaq |
| 4 | Lembah Ibadah | 3 | Bersuci daripada Najis, Azan & Iqamah, Puasa Ramadan |
| 5 | Denai Sirah | 4 | Aqabah 1 & 2, Sifat Fatanah, Dakwah Nabi, Hijrah |
| 6 | Taman Adab | 4 | Berpakaian, Beriadah, Terhadap Guru, Bergaul |
| 7 | Istana Jawi | 5 | Hamzah, Suku Kata Tertutup, Hukum E-Wa, Imbuhan "ber", Khat Nasakh & Rikaah |

## Cara menambah kandungan baru

Semua kandungan berada dalam **`js/data.js`**. Tambah unit dengan menyalin blok sedia ada di dalam
`units: [ ... ]` dunia yang berkenaan:

```js
{
  id: "id-unit",            // unik, huruf kecil
  jawi: "تلاوة",             // nama dalam Jawi (opsional)
  title: "Tajuk Unit",
  desc: "Satu ayat penerangan untuk kad.",
  activities: [ { type: "quiz", ... } ]
}
```

### Jenis aktiviti

| `type` | Medan yang diperlukan | Catatan |
|--------|----------------------|---------|
| `quiz` | `title`, `gem`, `instr`, `questions:[{q,o:[],a,e}]` | `a` = indeks jawapan betul; `e` = penjelasan; `ar:true` pada soalan untuk teks Arab |
| `match` | `pairs:[{l,r}]` | tap-tap memadan; `ar:true` untuk paparan Jawi/Arab |
| `sort` | `items:[...]` (dalam urutan BETUL) | enjin mengocok sendiri |
| `story` | `scenes:[{art,t,x}]` | `art` = emoji, `t` = tajuk, `x` = teks |
| `sim` | `steps:[{t,d}]` | langkah didedahkan satu per satu |
| `recite` | `verses:[{a,r,m}]` | `a` Arab, `r` rumi, `m` maksud |
| `memorize` | `verses:[{a,r,m}]` | mod sorok rumi / sorok semua |
| `trace` | `word` | latih surih tulisan Jawi |

Tambah `gem: 20` pada aktiviti untuk menetapkan ganjaran (lalai 10).

### Menambah dunia baru
Tambah objek dunia ke dalam `IL.WORLDS`. Setiap dunia perlu:
`id, name, jawi, icon, tagline, c1, c2, glow, desc, x, y, units[]`.
`x` dan `y` ialah kedudukan pulau dalam peratus (0–100) pada peta.

### Menambah barang kedai / misi harian
`IL.SHOP` (id, name, desc, art, cost) dan `IL.DAILY` (id, metric, target, label, reward).
Metrik yang dikesan: `activities, correct, units, story, memorize, jawi, gems`.

## Ciri gamifikasi

- **Permata Ilmu** — 10–20 per aktiviti, bonus 20 per unit, 50 per lencana dunia
- **Tahap** — Penjelajah (< 50%) → Pahlawan (≥ 50%) → Legenda (100%)
- **Lencana** — satu bagi setiap dunia yang lengkap (mahkota pada peta)
- **Api Semangat** — streak harian (bertambah jika masuk pada hari berturut-turut)
- **Misi harian** — 3 misi dipilih mengikut tarikh, ditebus automatik
- **Kedai ganjaran** — 6 aksesori hero
- **Buka kunci** — dunia seterusnya terbuka apabila 1 unit di dunia sebelumnya tamat
  (ibu bapa/guru boleh membuka semua dalam Mod Ibu Bapa / Guru)

## Kebolehaksesan

Butang ≥ 46 px, teks ≥ 14 px, ikon pada setiap arahan, butang "Dengar" untuk arahan suara,
ARIA label pada kawalan, `prefers-reduced-motion` dihormati, reka letak responsif sehingga 360 px.
Mod Ibu Bapa / Guru di halaman Profil memaparkan jadual kemajuan setiap dunia.

## Nota

- Ejaan Jawi menggunakan fon sistem (`Traditional Arabic`, `Arabic Typesetting`); pada sesetengah
  peranti paparan huruf Jawi khas (ڠ، ڤ، چ، ݢ) mungkin berbeza. Sila semak dengan buku teks.
- Bunyi dijana secara sintesis (Web Audio API). Suara arahan bergantung pada kehadiran suara
  Bahasa Melayu / Arab dalam sistem; jika tiada, arahan kekal dipaparkan sebagai teks.
- Kemajuan disimpan dalam `localStorage` (kunci `il_legends_v1`) pada pelayar yang sama.

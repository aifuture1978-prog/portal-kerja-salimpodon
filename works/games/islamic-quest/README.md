# Islamic Quest — Pengembaraan Ilmu Tahun 3

Laman web gamifikasi untuk **Pendidikan Islam Tahun 3 (KSSR Semakan 2017)** yang mengandungi **7 pulau** pembelajaran, **12 unit** interaktif dan **60 langkah** aktiviti (sepadan dengan 60 Bintang Ilmu maksimum).

Laman ini adalah **static site** — boleh dibuka terus dengan fail `index.html` tanpa pelayan. Data kemajuan murid disimpan dalam `localStorage` pelayar sahaja.

---

## 🚀 Cara menjalankan

1. Buka fail `index.html` terus dalam pelayar moden (Chrome / Edge / Firefox / Safari).
2. Tiada pelayan, pangkalan data mahupun pemasangan diperlukan.
3. Untuk kelas atau Chromebook, salin folder `islamic-quest/` dan buka `index.html`.

> **Cadangan:** Untuk kualiti audio yang optimum, gunakan Chrome atau Edge terkini dengan kebenaran mikrofon diaktifkan (untuk aktiviti rakaman hafazan).

---

## 📁 Struktur projek

| Fail | Tujuan |
|---|---|
| `index.html` | Kerangka HTML, topbar, maskot SVG, modal, paparan & statistik awan. |
| `styles.css` | Semua gaya visual — dunia ajaib, animasi ringan, reka bentuk responsif. |
| `data.js` | Kandungan kurikulum: 7 pulau, 12 unit, 60 langkah, item kedai & lencana khas. |
| `app.js` | Enjin aplikasi — routing, gamifikasi, audio, LocalStorage, kawalan ibu bapa. |

---

## 🗺️ Kandungan (DSKP Pendidikan Islam Tahun 3)

| Pulau | Unit | Langkah |
|---|---|---|
| Al-Quran | Tilawah Surah Al-Kafirun · Hafazan Surah Al-Asr · Kefahaman Surah Al-Fatihah | 15 |
| Hadis | Adab Mengasihi Orang Muda & Menghormati Orang Tua | 5 |
| Akidah | Al-Alim dan Al-Hakim · Beriman dengan Kitab | 9 |
| Ibadah | Bersuci daripada Hadas Besar | 5 |
| Sirah | Wahyu Teragung · Sifat Tabligh · Keperibadian Nabi dalam Masyarakat | 16 |
| Adab | Adab Tidur | 5 |
| Jawi | Imbuhan Awalan (Teks Mudah) | 5 |
| **Jumlah** | **12 unit** | **60 langkah** |

---

## ✏️ Cara menambah atau menukar kandungan

Semua kandungan kurikulum disimpan dalam `data.js`. Buka fail itu dan ikut panduan ringkas di bawah.

### 1. Tambah unit baru

Cari pulau yang dikehendaki dalam tatasusunan `ISLANDS`, kemudian tambah objek baru ke dalam `units`:

```js
{
  id: 'q4',                          // unik, cth gabung dengan id pulau
  title: 'Tilawah — Surah Al-Ikhlas',
  icon: '🕌',
  color: '#2563eb',                  // warna utama unit
  soft: '#dbeafe',                   // warna latar lembut untuk ikon
  steps: [ /* ... langkah aktiviti ... */ ]
}
```

### 2. Tambah langkah aktiviti

Tujuh jenis langkah disokong:

| `type` | Tujuan | Medan utama |
|---|---|---|
| `info` | Kad bacaan + senarai tips | `title`, `text`, `bullets[]`, `ar`{t,r}, `meaning` |
| `reveal` | Ayat yang disentuh untuk lihat maksud (tilawah/hafazan) | `lines[]`{ar,my}, `done` |
| `quiz` | Kuiz pilihan ganda | `q`, `options[]`{t, ok, why}, `why` |
| `order` | Susun langkah / ayat (drag-klik) | `items[]`{id,t,jawi?}, `correct[]`, `tip` |
| `match` | Padankan dua lajur | `pairs[]`{a,b}, `aLabel`, `bLabel`, `ar/jawi` |
| `story` | Cerita bergambar (slaid) | `slides[]`{icon,title,text} |
| `record` | Rakam suara hafazan (atau 3 petanda baca) | `lines[]` (Arabic), `prompt` |

**Contoh lengkap pelbagai jenis langkah:**

```js
// Kad info + tips
{ type: 'info', icon: '📖', title: 'Pengenalan', text: '...', bullets:[{i:'💡',t:'...'}] }

// Ayat tilawah
{ type: 'reveal', title:'Surah Al-Fatihah', subtitle:'Sentuh untuk lihat maksud',
  lines:[ {ar:'بِسْمِ اللَّهِ ...', my:'Dengan nama Allah...'} ], done:'Saya sudah membaca' }

// Kuiz
{ type: 'quiz', icon:'❓', q:'Berapakah ayat surah ini?',
  options:[ {t:'6 ayat', ok:true}, {t:'5 ayat', why:'Cuba kira semula.'} ],
  why:'Betul! 6 ayat.' }

// Susun langkah
{ type: 'order', title:'Susun langkah', prompt:'Sentuh mengikut urutan betul.',
  items:[ {id:'a', t:'Pertama'}, {id:'b', t:'Kedua'}, {id:'c', t:'Ketiga'} ],
  correct:['a','b','c'], tip:'Petua jika perlu.' }

// Padankan
{ type: 'match', title:'Padankan', prompt:'Sentuh kiri, kemudian kanan.',
  pairs:[ {a:'Taurat', b:'Nabi Musa AS'} ], aLabel:'Kitab', bLabel:'Rasul' }

// Cerita bergambar
{ type: 'story', title:'Kisah Saidatina Khadijah',
  slides:[ {icon:'🏠', title:'Di rumah', text:'...'}, ... ] }

// Rakam hafazan (jawi = true untuk paparkan dalam tulisan Jawi)
{ type: 'record', title:'Rakam bacaan', prompt:'Tekan dan baca.',
  lines:['بِسْمِ اللَّهِ ...'] }
```

### 3. Buka kunci pulau baru

Secara lalai, pulau akan dibuka secara berperingkat mengikut urutan selepas pulau sebelumnya siap. Untuk sentiasa membuka semua pulau:

- Masuk ke **Mod Ibu Bapa / Guru** (butang `Guru` di bar atas, jawab `7 + 5 = ?`), kemudian klik **🔓 Buka semua pulau**.

Atau paksa buka dari konsol pelayar:

```js
IslamicQuest.ISLANDS.forEach(i => IslamicQuest.state.unlocked[i.id] = true);
```

### 4. Tambah item kedai ganjaran

Tambah objek ke tatasusunan `SHOP_ITEMS` dalam `data.js`:

```js
{ id: 'tasbih', name: 'Tasbih Mini', icon: '📿', price: 25, acc: 'acc-tasbih', desc: 'Hiasan tasbih' }
```

Kemudian tambah kumpulan aksesori SVG yang sepadan dalam `index.html` (di dalam blok `<svg>` maskot) dan gunakan `id` yang sama seperti `acc`. Akhir sekali, ubah suai `applyAccessories()` dalam `app.js` jika perlu.

---

## ♿ Ciri kebolehaksesan

- Butang minimum **48×48 px** (kebanyakan 54–92 px), jarak sentuh luas.
- Saiz teks asas **16–17 px**, label sekurang-kurangnya **12 px**.
- Kontras warna tinggi, fokus boleh nampak (`outline` biru).
- Animasi dihormati `prefers-reduced-motion: reduce`.
- Kandungan Jawi dan al-Quran menggunakan fon `Traditional Arabic`/`Amiri`/`Noto Naskh Arabic` (sedia ada pada Windows & Mac).

---

## 👨‍🏫 Mod Ibu Bapa / Guru

- Masuk melalui butang **Guru** di bar atas (gerbang soalan ringan: `7 + 5 = ?`).
- Paparkan jadual kemajuan setiap unit mengikut 7 bidang DSKP.
- Tiga kawalan guru:
  - **🔓 Buka semua pulau** — buka semua pulau untuk demonstrasi.
  - **🔊/🔇 Suara arahan** — hidup atau matikan bacaan suara Bahasa Melayu.
  - **🗑️ Padam semua data** — set semula LocalStorage (tidak boleh dibatalkan).

---

## 🎮 Elemen gamifikasi

| Elemen | Pelaksanaan |
|---|---|
| Mata ganjaran | **⭐ Bintang Ilmu** — 1 bintang setiap langkah siap (maks. 60). |
| Lencana pulau | Diperoleh selepas semua unit dalam satu pulau siap (7 lencana). |
| Lencana khas | **Pengembara Ilmu** (7 pulau siap), **Kutipan Bintang 50**, **Istiqamah 3 Hari**. |
| Tahap | Setiap unit mengandungi 3–6 langkah yang bercampur jenis aktiviti. |
| Bar kemajuan | Papar per pulau dan keseluruhan (di peta & profil). |
| Streak | 🔥 hari berturut-turut belajar (auto dikemas kini mengikut tarikh). |
| Kedai | 5 aksesori maskot (topi, cermin mata, selendang, jubah, mahkota). |
| Papan pencapaian | Dalaman (profil sendiri) — tiada ranking antara murid. |
| Animasi & bunyi | Web Audio API untuk kesan betul/salah/ganjaran; confetti pada setiap bintang; maskot animasi. |

---

## 🧪 Pembangunan & ujian

Laman ini diuji secara automatik dengan Playwright (`playwright-core` + Chromium) merangkumi:

- Pengesahan struktur data (semua unit, jenis langkah, rujukan ID).
- Laluan penuh semua 12 unit / 60 langkah dalam desktop & telefon.
- Ujian responsif pada **390×844** (telefon) dan **820×1180** (tablet) — tiada skrol melintang, semua butang ≥44 px.
- Pengekalan LocalStorage selepas muat semula.

---

## ⚖️ Lesen & nilai

Kandungan Pendidikan Islam dirujuk kepada **DSKP KSSR Semakan 2017**. Lafaz Al-Quran, hadis, niat dan doa yang digunakan adalah ringkas dan tepat mengikut rujukan standard.

Dibangunkan dengan HTML, CSS dan JavaScript tulen — tiada kebergantungan luar, tiada penjejakan, tiada data dihantar keluar peranti.
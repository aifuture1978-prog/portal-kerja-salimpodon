# IQRA' QUEST — Gamifikasi Bacaan Iqra' Tahun 6

Permainan interaktif satu fail (`index.html`) untuk Kajian Tindakan: masalah
kelemahan bacaan Iqra' dalam kalangan murid Tahun 6 di SK Salimpodon Darat.

- **Kategori hub:** Permainan Interaktif (gamifikasi)
- **Jenis fail:** satu fail HTML, tiada build, tiada kebergantungan luar wajib
- **Pautan hub:** `bahan-pdp.html#games`
- **Panduan penyokong:** `../bahan-pdp/kajian-tindakan/Panduan_Workflow_Kajian_Tindakan_Iqra_Tahun6_SK_Salimpodon_Darat.docx`

## Lima modul permainan

| Mod | Nama | Sasaran |
|-----|------|---------|
| 1 | Makmal Huruf | Pengecaman huruf tunggal |
| 2 | Sambung Huruf (live joining) | Huruf bersambung kanan → kiri |
| 3 | Kuiz Bentuk & Warna | 14 keluarga bentuk (perahu, cangkul, bot, …) |
| 4 | Cabaran Aras | Rendah / Sederhana / Tinggi |
| 5 | **Iqra' 1 — Halaman demi Halaman** | 32 muka surat buku Iqra' 1 sebenar |

## Dasar reka bentuk (dipatuhi ketat)

1. **Tiada audio automatik.** Bunyi hanya keluar apabila pengguna menekan
   butang `🔊 Dengar` (Web Speech API, `ar-SA`, kadar 0.7).
2. **Bacaan Iqra', bukan Jawi.** Tiada transliterasi Rumi, tiada ejaan Jawi.
3. **Arah kanan → kiri.** Semua elemen berhuruf Arab memakai
   `direction: rtl; unicode-bidi: isolate`.
4. **Baris fathah** pada setiap huruf menandakan fokus bacaan.
5. **Huruf bersambung secara langsung** (`init` / `med` / `fin` / tunggal)
   menggunakan U+0640 TATWEEL; huruf tidak bersambung ke hadapan:
   `ا د ذ ر ز و ء`.

## Mod 5 — kesinambungan ke buku Iqra' 1 fizikal

Setiap muka surat (1–32) dijadikan satu peringkat 8 soalan. Cop:

| Cop | Syarat |
|-----|--------|
| 🥉 Gangsa | ≥ 60% |
| 🥈 Perak | ≥ 75% |
| 🥇 Emas | **hanya selepas guru mengesahkan bacaan buku** (`✍️ Guru sahkan bacaan buku`) |

Emas sengaja **tidak boleh** diperoleh dengan bermain sahaja (`COP_MAX_PLAY = 2`) —
ini memaksa jambatan antara permainan dan bacaan buku fizikal.

Senarai 32 muka surat boleh diubah oleh guru terus dalam permainan
(butang `✏️ Edit senarai muka surat`), disimpan dalam `localStorage`
(`iqraQuest.pages.v1`).

## Pengesahan

Permainan ini disahkan oleh lima suite dalam projek sumber
(`check.js`, `dom.js`, `leak.js`, `shot.js`, `verify_docx.py`):

- 19 lencana dirender
- 68,726 pilihan jawapan diperiksa — sifar kebocoran transliterasi Rumi
- 2,880 soalan Mod 5 — sifar anomali
- 32/32 kotak muka surat membawa huruf Arab berbaris fathah
- 0 ralat halaman dalam Chrome sebenar

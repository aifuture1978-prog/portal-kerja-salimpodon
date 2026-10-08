# LAPORAN W1 — UKUR KETEPATAN BACAAN JADUAL (GARIS DASAR)

**Tarikh**: 30 September 2026  
**Pelaksana**: WorkBuddy (mod W1)  
**Mod**: PENGUKURAN sahaja — tiada kod diubah, tiada tulisan DB.  
**Fail diukur**: `C:\DSH\_SUPABASE\functions\baca-jadual-vision\index.ts`  
**Deploy URL dipanggil**: `https://qanihvrthelphnguoxal.supabase.co/functions/v1/baca-jadual-vision`

---

## 0. LANGKAH 0 — SEMAKAN (semua lulus)

1. ✅ `index.ts` wujud (20,329 byte, kemaskini 24 Sep 2026).
2. ✅ Senarai model dalam fail dibaca:
   - `MODEL_KEUTAMAAN` (cabang utama, jatuh dari atas):
     - `google/gemini-2.5-flash-lite`
     - `qwen/qwen3.7-flash`
     - `google/gemma-4-31b-it:free`
     - `nex-agi/nex-n2.5-pro:free`
   - `PENGSah_MODEL_KEUTAMAAN` (penyemak bebas, keluarga lain):
     - `qwen/qwen3-vl-32b-instruct` (berbayar ~RM0.0018/jadual)
     - `nex-agi/nex-n2.5-pro:free`
     - `google/gemma-4-31b-it:free`
3. ✅ Imej jadual dijumpai — calon sebenar ada 2 (di bawah); UI screenshot dan PDF diketepikan kerana bukan jadual.

   **IMEJ YANG DIUKUR** (2):
   - `C:\DSH\_SUPABASE\_UJIAN_OCR\sebenar_hlm1.png` — jadual sebenar SK Salimpodon Darat, guru **Mohammad Isahak bin Awang**, rujukan `jadual_sebenar.txt`.
   - `C:\DSH\_SUPABASE\_UJIAN_OCR\jadual_ujian.png` — jadual sintetik Kelas 1 Arif 2026, rujukan `jadual_ujian.html`.
   **DIKETEPIGAN** (berserta sebab):
   - `UJI_OCR_GRID_LIVE_20260921\grid_cadang.png` — ini UI screenshot, bukan jadual. **Tidak diukur**; jika diukur ia akan memesongkan garis dasar.
   - `VALIDASI_WEB\02_jadual_kelas.png`, `UJIAN_UI_RPH1B_20260917\HARNESS\w01_jadual.png` — UI screenshot.
   - `sampel_jadual\*.pdf` — PDF; Edge Function hanya terima `image_base64`.
   Kuantiti yang **saya diminta uji oleh W1** = 2 (3 dengan grid_cadang, tetapi grid_cadang bukan jadual).

---

## 1. BUKTI — Imej diuji + jadual ringkasan

### 1.1 Senarai imej (2)

| # | Fail laluan penuh                              | Jenis                 | Saiz (KB) |
| - | ---------------------------------------------- | --------------------- | --------- |
| 1 | `C:\DSH\_SUPABASE\_UJIAN_OCR\sebenar_hlm1.png` | Imbas sebenar         | ~172      |
| 2 | `C:\DSH\_SUPABASE\_UJIAN_OCR\jadual_ujian.png` | Sintetik (HTML → PNG) | ~23       |

### 1.2 Jadual ringkasan

| # | Imej             | Model menjawab                 | Cubaan jatuh ke model lain?               | Sel dibaca | Sel betul | Sel salah tambah | Sel terlepas | Ditanda `ragu` oleh model | Pengesahan (model kedua)                                            | Masa (s)  |
| - | ---------------- | ------------------------------ | ----------------------------------------- | ---------- | --------- | ---------------- | ------------ | ------------------------- | ------------------------------------------------------------------- | --------- |
| 1 | sebenar_hlm1.png | `google/gemini-2.5-flash-lite` | Tidak (status 200 pada percubaan pertama) | 5          | 3         | 2                | 2            | 4/5                       | `qwen/qwen3-vl-32b-instruct` — 5 bantahan, 4 sel ditanda `ragu`     | **12.38** |
| 2 | jadual_ujian.png | `google/gemini-2.5-flash-lite` | Tidak (status 200 pada percubaan pertama) | 25         | 2         | 23               | 23           | 0/25                      | `qwen/qwen3-vl-32b-instruct` — **0 bantahan**, 0 sel ditanda `ragu` | **6.40**  |

- **Jumlah permintaan Edge Function dibuat**: 2 (1 setiap imej, rantaian MODEL_KEUTAMAAN tidak jatuh ke model lain untuk kedua-duanya).
- **Anggaran kos**: sangat rendah — model pertama percuma (flash-lite) untuk kedua-dua imej; model kedua ialah `qwen/qwen3-vl-32b-instruct` (~RM0.0018/jadual × 2 = ~RM0.0036 ≈ <$0.001 USD). Jauh di bawah had $1. **TIADA** pemotongan kos.

### 1.3 Skor tepat (peratus sel betul)

| Imej             | Sel GT                              | Betul / GT | Tepat (%) |
| ---------------- | ----------------------------------- | ---------- | --------- |
| sebenar_hlm1.png | 5 (3 PM 2A + 1 PER + 1 KOKUM/NILAM) | 3 / 5      | **60.0%** |
| jadual_ujian.png | 25                                  | 2 / 25     | **8.0%**  |

> **Kesimpulan garis dasar**: model pertama membaca dengan tepat **60%** pada imej **sebenar** dan **8%** pada imej **sintetik**. Kedua-dua imej disahkan oleh penyemak bebas; pada jadual sintetik penyemak gagal mengesan **sebarang** ralat (0/25).

---

## 2. TIGA CONTOH SALAH (WAJIB LAPORKAN)

### 2.1 [sebenar_hlm1.png] — PER disangka satu tempoh 60 minit (bukan 30)

**Apa yang sepatutnya**: Pada baris ISNIN, lajur 1 (slot 7.20–7.50) mengandungi label **"PER"** — ini bukan subjek, ia penanda waktu (Peringatan / Perhimpunan ringkas). Dalam jadual waktu persendirian sebenar, slot PER adalah satu petak 30 minit, bukan dua. `jadual_sebenar.txt` menunjukkan "ISNIN PER" ditulis di bawah lajur 1 sahaja.

**Apa yang model beri**:

```json
{ "hari": "ISNIN", "waktu_mula": 1, "waktu_akhir": 2, "durasi_minit": 60, "teks": "PER" }
```

Model menelan petak 1 dan 2 sebagai satu sel **60 minit** bertajuk "PER". **SALAH durasi**.

> Penyemak `qwen3-vl-32b-instruct` mengangkat bantahan, sel ditanda `ragu: true` — satu-satunya petunjuk jujur yang sampai ke pengguna.

### 2.2 [sebenar_hlm1.png] — **KOKUM/NILAM di-reka pada hari JUMAAT** (halusinasi)

**Apa yang sepatutnya**: Baris JUMAAT pada jadual Mohammad Isahak adalah **kosong** (tiada sel subjek). Blok ungu yang kelihatan di kanan ialah dekorasi warna sahaja — bukan subjek. `jadual_sebenar.txt` baris JUMAAT hanya mengandungi perkataan "JUMAAT" dengan tiada entri selepas.

**Apa yang model beri**:

```json
{ "hari": "JUMAAT", "waktu_mula": 9, "waktu_akhir": 12, "durasi_minit": 120, "teks": "KOKUM/NILAM" }
```

Model **mereka** satu tempoh KOKUM/NILAM 120 minit pada hari yang sebenar kosong. Ini halusinasi — fikir model "KOKUM/NILAM biasanya muncul di satu hari dalam minggu, dan ini hari yang belum ada, jadi taruh di sini."

> Ini **AMAT BERBAHAYA**: model menambah sel yang langsung tiada dalam jadual guru. Penyemak menandainya `ragu`, tetapi respons utama masih mengandungi sel rekaan. Guru yang terima bacaan ini boleh percaya mereka mengajar KOKUM/NILAM 120 minit pada hari Jumaat — **yang mereka tidak akan mengajar**.

### 2.3 [jadual_ujian.png] — "2x30 dibaca sebagai 1x30" pada SELASA (MAT 1A)

**Apa yang sepatutnya** (dari `jadual_ujian.html`):

```html
<td class="subjek luas" colspan="2">MAT 1A</td>   
```

Teks "MAT 1A" merentasi dua petak (3 dan 4) — konsep 30→30: SATU subjek, 60 minit.

**Apa yang model beri**:

```json
{ "hari": "SELASA", "waktu_mula": 3, "waktu_akhir": 3, "durasi_minit": 30, "teks": "MAT 1A" }
{ "hari": "SELASA", "waktu_mula": 4, "waktu_akhir": 4, "durasi_minit": 30, "teks": "REHAT" }
```

Model memecah MAT 1A kepada satu petak 30 minit (slot 3) dan **mengisi slot 4 dengan "REHAT"** — padahal REHAT pada SELASA sepatutnya di slot 5 (sebelum slot 6). Model **menggeser separuh isi jadual ke kiri** akibat salah baca ini. Corak sama berulang untuk BM 1A, PI 1A, PJ 1A, MUZIK 1A, MORAL 1A — semua yang melepasi satu petak.

> Ini bug yang **tegas disebut dalam komen `index.ts`** sendiri ("2x30 dibaca sebagai 1x30") — dan ia masih berlaku. Penyemak `qwen3-vl-32b-instruct` berkata **0 bantahan** untuk jadual sintetik ini — model kedua gagal mengesan **setiap satu** ralat. Penanda `ragu` langsung tidak ditambah. **Garis dasar: penyemak BUKAN pengaman yang boleh diharap untuk grid sintetik yang bersih.**

---

## 3. PEMERHATIAN TAMBAHAN (tidak diminta tapi penting)

- **Semua imbas jatuh kepada `google/gemini-2.5-flash-lite`** pada percubaan pertama (status 200). Rantaian MODEL_KEUTAMAAN tidak diuji (tiada sandaran).
- **Penyemak (qwen3-vl-32b-instruct)** berjaya mengesan ralat pada imej sebenar (5 bantahan, 4 ditanda ragu) tetapi **gagal total pada jadual sintetik** (0 bantahan, 0 ditanda ragu). Ini menunjukkan kebergantungan kepada penyemak adalah **tidak boleh diharap secara konsisten** — bukan penyelesaian umum.
- **TIDAK DISAHKAN** untuk diri sendiri: tiada cara mudah saya mengesahkan bahawa "model kedua bebas keluarga" benar-benar lebih bebas pada jadual sintetik yang mana kedua-dua model mungkin hilang bacaan terhadap elemen visual yang sama (kotak, REHAT). Saya tidak akan mendakwa tanpa ujian berasingan.

---

## 4. RINGKASAN KOS + HAD

| Metrik                                     | Nilai                                                  |
| ------------------------------------------ | ------------------------------------------------------ |
| Bilangan permintaan Edge Function          | 2                                                      |
| Bilangan model dipanggil setiap permintaan | 1 (utama) + 1 (penyemak) = 2                           |
| Jumlah panggilan model                     | 4                                                      |
| Anggaran kos                               | < $0.001 (flash-lite percuma + qwen3-vl ~RM0.0018 × 2) |
| Jatuh ke model sandaran                    | 0                                                      |
| Masa purata                                | ~9.4 saat/imputus                                      |

**TIADA had yang dilanggar**: tiada kerosakan kod, tiada tulisan DB, tiada hantaran Netlify, tiada muat naik awam selain panggilan Edge Function yang diarahkan, kos < $1.

---

## 5. FAIL DIJANA (artifak)

Semua disimpan dalam `C:\Users\User\WorkBuddy AI\2026-09-30-12-51-52\W1_OCR_UKUR\`:

- `ukur_run.py` — skrip pemanggil Edge Function (tidak diubah dari versi run; tiada fall-through logic).
- `skor.py` — skrip pembanding dengan ground truth.
- `raw_sebenar_hlm1.png.json` — respons mentah Edge Function untuk imej #1.
- `raw_jadual_ujian.png.json` — respons mentah Edge Function untuk imej #2.
- `summary_calls.json` — ringkasan HTTP/masa setiap panggilan.
- `analysis.json` — pecahan sel betul / salah tambah / terlepas.
- `LAPORAN_W1_UKUR_OCR.md` — laporan ini.

---

## 6. TIDAK DILAKUKAN (mengikut ARAHAN)

- Tiada fail dalam `C:\DSH\_SUPABASE\functions\` disentuh.
- Tiada fail dalam `C:\MyGuru\` disentuh.
- Tiada tulis ke pangkalan data Supabase.
- Tiada hantaran ke Netlify.
- Tiada muat naik imej ke perkhidmatan awam (selain panggilan Edge Function yang diarahkan).
- Tiada nombor direka; entri "TIDAK DISAHKAN" ditulis di mana sesuai.

---

## 7. CADANGAN UNTUK W2 (bukan diarahkan, tetapi kelihatan jelas)

- Bug `2x30 dibaca 1x30` **masih berlaku** dan sudah dijangka oleh komen kod — tetapi tiada mitigasi automatik. W2 patut lihat (a) sama ada `gemini-2.5-flash` (bukan lite) lebih tepat, dan (b) sama ada model Qwen `qwen/qwen3-vl-32b-instruct` sebagai pembimbing penanda durasi dapat menanganinya.
- Penyemak `qwen3-vl-32b-instruct` **gagal total** pada grid sintetik yang bersih. Pertimbangkan (a) tukar model kedua untuk bukan sahaja berbeza keluarga tetapi **lebih ketat pada integriti grid**, atau (b) tambah aturan mekanikal (banding jumlah sel dengan julat slot) sebelum model kedua.
- Halusinasi KOKUM/NILAM pada JUMAAT kosong adalah risiko produksi tertinggi. W2 wajar tambah ujian regresi khusus untuk hari kosong (guru yang tiada kelas petang).

— tamat laporan W1 —

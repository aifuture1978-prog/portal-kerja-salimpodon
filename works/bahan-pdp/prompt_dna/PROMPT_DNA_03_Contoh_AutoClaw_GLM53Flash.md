# PROMPT DNA #3 — PANDUAN GUNA + CONTOH PENUH (AutoClaw × GLM-5.3-Flash)

> **AutoClaw** ialah agen AI rasmi Z.ai (desktop app) yang mengendalikan fail, pelayar dan
> alat sistem — sesuai untuk kerja ini kerana ia boleh membaca PDF sumber, menulis fail,
> menjalankan skrip, dan membuka pratonton pelayar.
> **GLM-5.3-Flash** ialah model multimodal ringan di dalamnya: pantas, boleh baca imej/skrin/PDF,
> dan sesuai untuk kerja berulang banyak langkah seperti membina 22 unit satu demi satu.

---

## 1. SEDIAKAN SEBELUM MULA

| Perkara | Tindakan |
|---|---|
| Fail DSKP | Lampirkan PDF DSKP rasmi ke dalam ruang kerja |
| Fail Buku Teks | Lampirkan PDF Buku Teks rasmi |
| Folder kerja | Cipta satu folder kosong, contoh `PI_Tahun3` |
| Prompt #1 | Sedia `PROMPT_DNA_01_Portal_Bahan_PdP.md` |
| Prompt #2 | Sedia `PROMPT_DNA_02_Watak_Animasi_Ghibli_Pixar.md` |
| Model | Pilih **GLM-5.3-Flash** untuk kerja unit (pantas). Naik ke **GLM-5.3** jika projek sangat besar atau banyak pembetulan. |

---

## 2. CARA HANTAR PROMPT

```
Langkah 1 : Buka AutoClaw → cipta satu tugasan baharu → tetapkan folder kerja
Langkah 2 : Lampirkan PDF DSKP + PDF Buku Teks
Langkah 3 : Tampal SELURUH PROMPT DNA #1, dengan BORANG INPUT sudah diisi
Langkah 4 : Tampal PROMPT DNA #2 di bawahnya (dengan satu baris pemisah)
Langkah 5 : Hantar
Langkah 6 : Agen akan BERHENTI selepas Fasa 0 + palet, dan minta kelulusan
            → semak peta sumber, kemudian balas "Lulus, teruskan unit 1"
Langkah 7 : Selepas setiap unit, semak blok ringkasan, kemudian balas "Teruskan unit seterusnya"
Langkah 8 : Selepas unit terakhir, agen menjana portal induk
```

---

## 3. CONTOH PENUH — APA YANG ANDA HANTAR

> **Dijalankan dalam:** AutoClaw (z.ai) · **Model:** GLM-5.3-Flash
> **Lampiran:** `DSKP_PI_T3.pdf`, `BT_PI_T3.pdf`

```text
# PERANAN
Anda ialah pereka bahan pengajaran + jurutera front-end + penyelidik kurikulum. ...

# ▣ BORANG INPUT (WAJIB ISI SEBELUM MULA)
MATA PELAJARAN      : Pendidikan Islam
TAHUN / TINGKATAN   : Tahun 3
NEGARA & KURIKULUM  : Malaysia — KSSR Semakan 2017
SUMBER RASMI 1      : DSKP KSSR Pendidikan Islam Tahun 3 (PDF, dilampirkan)
SUMBER RASMI 2      : Buku Teks Pendidikan Islam Tahun 3 SK (PDF, dilampirkan)
SENARAI BIDANG      : al-Quran, Hadis, Akidah, Ibadah, Sirah, Adab, Jawi
BILANGAN UNIT       : 22
BAHASA BAHAN        : Bahasa Melayu + Arab (rasm Uthmani)
NAMA FOLDER KERJA   : PI_Tahun3

[... seluruh PROMPT DNA #1 ...]

--- PEMISAH ---

# PERANAN (PROMPT DNA #2)
Anda ialah pereka watak + ilustrator SVG + pereka gerak. Gaya rujukan: Ghibli × Pixar. ...
[... seluruh PROMPT DNA #2 ...]
```

---

## 4. CONTOH KELUARAN AGEN — FASA 0 (peta sumber)

```text
✅ BORANG INPUT diterima. Tiada ruang kosong yang perlu andaian.

📋 PETA SUMBER (Fasa 0)
   Offset halaman DSKP diukur: halaman bercetak N = halaman PDF N + 12
   Buku Teks PDF = rentang dua muka surat; separuh kanan = nombor bercetak lebih besar

   # | Bidang    | SK   | Standard Kandungan (ringkas)          | SP            | DSKP cetak | BT cetak
   --+-----------+------+---------------------------------------+---------------+------------+---------
   1 | al-Quran  | 1.1  | Membaca al-Kafirun dengan bertajwid   | 1.1.1–1.1.2   | 20         | 2–7
   2 | al-Quran  | 1.2  | Membaca al-'Asr dengan bertajwid      | 1.2.1–1.2.2   | 21         | 8–13
   3 | al-Quran  | 1.3  | Menghafaz al-Kafirun                  | 1.3.1–1.3.2   | 22         | 14–19
   4 | al-Quran  | 1.4  | Menghafaz al-'Asr                     | 1.4.1–1.4.2   | 23         | 20–25
   5 | al-Quran  | 1.5  | Kefahaman al-Fatihah                  | 1.5.1–1.5.5   | 24         | 26–31
   6 | al-Quran  | 1.6  | Hukum tajwid nun sakinah & tanwin     | 1.6.1–1.6.3   | 25         | 32–35
   ...
   22| Jawi      | 7.3  | Imbuhan apitan                        | 7.3.1–7.3.2   | 41         | 92–97

🎨 CADANGAN PALET (unit 1–22)
   1:P03 2:P09 3:P05 4:P01 5:P06 6:P02 7:P22 8:P11 9:P08 10:P15
   11:P14 12:P23 13:P17 14:P20 15:P19 16:P07 17:P10 18:P13 19:P12 20:P04
   21:P16 22:P21
   Semakan perlanggaran: 0 (tiada hex sasaran sudah jadi warna identiti watak)

🛑 BERHENTI — menunggu kelulusan anda sebelum membina unit 1.
```

---

## 5. CONTOH KELUARAN AGEN — SATU UNIT SIAP

```text
UNIT 6 — Hukum Nun Sakinah & Tanwin  (SK 1.6, SP 1.6.1–1.6.3)
  palet       : Forest Green + Magenta — 0 perlanggaran, 22/22 token hadir
  kandungan   : 53/53 petikan disahkan (API rasm Uthmani)
                2 ejaan Buku Teks dibetulkan: فريقا هدا (7:30), كاذبة خاطئة (96:16)
  struktur    : 6 seksyen · 36 svg · 249 <text> · 10 qcard / 30 opt
  jawapan     : 1,2,0,2,1,0,1,2,0,2
  audit SVG   : BERSIH pada TOL 1.5 DAN 0.8
  audit font  : 555 aksara Arab, 0 pada tindakan bukan-Tahoma
  tinggi cetak: #1 1018.6 · #2 701.3 · #3 890.3 · #4 799.3 · #5 1145.6 (kuiz, 2 hlm) · #6 758.6
                had 1032 — semua .hint 1 baris
  hero        : 0 BEHIND, jarak min +40.3 pada 703
  PDF         : 8 halaman, 491 aksara Arab semua Tahoma (86 + 405 bold)
  gamifikasi  : Misi Minda — 5 misi, 3 lencana, bar kemajuan
  portal      : 20/22 unit siap · 12 PDF · 32 pautan unik (semua 200)

  Fail:
    outputs/Bahan_PdP_PI_Tahun3_AlQuran_TajwidNunSakinahTanwin.html
    outputs/Bahan_PdP_PI_Tahun3_AlQuran_TajwidNunSakinahTanwin_CetakanA4.pdf

✅ Unit 6 siap. Teruskan unit 7 (Hadis)?
```

---

## 6. VERSI PADAT (1 MESEJ) — jika mahu terus jalan

Model ringan seperti GLM-5.3-Flash kadangkala lebih baik dengan arahan padat. Guna versi ini
apabila anda sudah biasa dengan aliran kerja:

```text
Bina portal bahan PdP lengkap untuk: [MATA PELAJARAN] [TAHUN], ikut DSKP + Buku Teks
yang dilampirkan.

Ikut PROMPT DNA #1 dan #2 sepenuhnya. Ringkasnya:

FASA: recon (peta SK/SP + halaman) → sahkan setiap petikan lawan sumber rasmi →
pilih palet UNIK setiap unit → bina 6 komponen → validasi 8 gerbang → eksport PDF A4 →
jana portal induk.

6 KOMPONEN setiap unit:
 1 Infografik · 2 Peta Minda (5 cabang) · 3 Nota Ringkas (10 poin + rumusan)
 4 Diagram (jenis BERTUKAR antara unit) · 5 Kuiz 10 soalan interaktif
 6 Gamifikasi "Misi Minda" (4–6 misi + bar kemajuan + 3 lencana)

KERAS:
- setiap unit palet berbeza; jangan remap warna identiti watak
- remap palet selepas semua splice
- Arab pada tindanan Tahoma, dalam span class="jf"; tanwin sendiri diawali &#x25CC;
- had cetak 1032 px; .hint 1 baris
- audit SVG TOL 1.5 DAN 0.8; audit font DOM; audit hero; audit font PDF
- simbol berteks mesti dilihat dengan mata
- satu unit satu masa; laporkan nombor sebenar; jangan sembunyikan kegagalan

MULA: tunjuk peta sumber + palet untuk unit 1, kemudian BERHENTI minta kelulusan.
```

---

## 7. TIP KHUSUS UNTUK GLM-5.3-FLASH

| Keadaan | Apa yang patut dibuat |
|---|---|
| Projek 20+ unit | Kerjakan **satu unit satu mesej**. Jangan minta semua sekali gus — kualiti jatuh dan konteks habis. |
| Skrip bina panjang | Minta agen **tulis skrip ke fail** (`work/build<N>.py`) dan jalankan, bukan tampal kod dalam sembang. |
| Ralat berulang | Tampal **keluaran ralat penuh** dan minta agen betulkan punca, bukan gejala. |
| Palet tersalah | Minta agen jalankan **imbasan perlanggaran** dan laporkan hex yang tinggal. |
| Bahan nampak pelik | Minta agen **eksport PDF** dan buka pratonton — jangan percaya audit teks sahaja. |
| Konteks hampir habis | Minta agen tulis **ringkasan keadaan** ke fail memori, kemudian mula sesi baharu dengan ringkasan itu. |
| Nombor tidak konsisten | Minta agen jalankan semula skrip validasi dan **laporkan nombor mentah**. |

---

## 8. SENARAI SEMAK AKHIR PROJEK

```
[ ] Peta sumber lengkap (SK/SP + halaman DSKP + halaman BT) untuk SEMUA unit
[ ] Setiap petikan disahkan lawan sumber rasmi; percanggahan dicatat
[ ] Setiap unit ada palet berbeza (0 palet berulang)
[ ] Setiap unit ada 6 komponen lengkap termasuk gamifikasi
[ ] Jenis diagram bertukar antara unit
[ ] Setiap unit lulus 8 gerbang validasi
[ ] Setiap unit ada PDF cetakan A4
[ ] Portal: setiap unit siap ada badge "Siap" + pautan berfungsi
[ ] Portal: setiap pautan unik diuji (HTTP 200)
[ ] Portal: tapisan, carian dan susunan diuji
[ ] Semua fail output berada dalam satu folder yang boleh diterbitkan
```

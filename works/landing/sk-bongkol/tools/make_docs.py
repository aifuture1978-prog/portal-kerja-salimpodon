"""Generate the officer-portal document library as real, valid PDF files.

Writes minimal PDF 1.4 files (Helvetica / Helvetica-Bold, A4) with a royal-blue
masthead and a gold rule, matching the portal's visual identity.
"""
import os

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "dokumen")
os.makedirs(BASE, exist_ok=True)

ROYAL = "0.039 0.122 0.267"
GOLD = "0.788 0.635 0.153"
CHARCOAL = "0.173 0.173 0.173"
GREY = "0.42 0.44 0.47"
CREAM = "0.961 0.941 0.910"

W, H = 595.28, 841.89
ML, MR = 56.0, 56.0
CW = W - ML - MR


def esc(t):
    return t.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def text(x, y, s, font="F1", size=9.5, color=CHARCOAL, tracking=None):
    op = ""
    if tracking:
        op = f"{tracking} Tc "
    return f"BT /{font} {size} Tf {color} rg {op}1 0 0 1 {x:.2f} {y:.2f} Tm ({esc(s)}) Tj ET\n"


def rule(x, y, w, h, color=GOLD):
    return f"q {color} rg {x:.2f} {y:.2f} {w:.2f} {h:.2f} re f Q\n"


def band(x, y, w, h, color):
    return f"q {color} rg {x:.2f} {y:.2f} {w:.2f} {h:.2f} re f Q\n"


def wrap(s, limit=96):
    words, lines, cur = s.split(), [], ""
    for wd in words:
        if len(cur) + len(wd) + 1 <= limit:
            cur = (cur + " " + wd).strip()
        else:
            lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines


def build(doc):
    """doc: dict(kod, tajuk, subjek, baris=[(kind, text), ...])"""
    out = []
    # ---- masthead
    out.append(band(0, H - 118, W, 118, ROYAL))
    out.append(band(0, H - 124, W, 6, GOLD))
    out.append(text(ML, H - 46, "SEKOLAH KEBANGSAAN BONGKOL PITAS", "F2", 13, "1 1 1", tracking=1.1))
    out.append(text(ML, H - 63, "Peti Surat 150, 89100 Pitas, Sabah  |  Kod Sekolah: XBA5218", "F1", 8.2, "0.78 0.80 0.85"))
    out.append(rule(ML, H - 76, 46, 2.4))
    out.append(text(ML, H - 100, doc["kategori"].upper(), "F2", 7.6, "0.91 0.83 0.55", tracking=1.6))

    y = H - 152
    out.append(text(ML, y, doc["tajuk"], "F2", 16.5, "0.039 0.122 0.267"))
    y -= 16
    out.append(text(ML, y, doc["subjek"], "F1", 8.8, GREY))
    y -= 14
    out.append(rule(ML, y, CW, 0.9, "0.85 0.85 0.86"))
    y -= 24

    for kind, val in doc["baris"]:
        if kind == "h":
            y -= 8
            out.append(rule(ML, y + 12, 26, 2, GOLD))
            out.append(text(ML, y, val.upper(), "F2", 10, "0.039 0.122 0.267", tracking=0.6))
            y -= 20
        elif kind == "t":
            for ln in wrap(val):
                out.append(text(ML, y, ln, "F1", 9.5, CHARCOAL))
                y -= 14.4
            y -= 5
        elif kind == "b":
            out.append(text(ML + 8, y, "-", "F2", 9.5, GOLD))
            out.append(text(ML + 22, y, val, "F1", 9.5, CHARCOAL))
            y -= 15.5
        elif kind == "kv":
            k, v = val
            out.append(text(ML + 4, y, k, "F1", 9.2, GREY))
            out.append(text(ML + 205, y, v, "F2", 9.2, CHARCOAL))
            y -= 15.2
        elif kind == "gap":
            y -= 12
        if y < 92:
            break

    # ---- footer
    out.append(rule(ML, 78, CW, 0.9, "0.85 0.85 0.86"))
    out.append(text(ML, 63, doc["kod"], "F1", 8, GREY))
    out.append(text(ML, 51, "Dokumen rasmi portal SK Bongkol Pitas. Sila rujuk JPN Sabah / PPD Pitas untuk pengesahan data.", "F1", 7.4, GREY))
    out.append(text(W - MR - 108, 63, "Seiring Melangkah Ke Hadapan", "F2", 8, GOLD))

    stream = "".join(out).encode("latin-1", "replace")

    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {W:.2f} {H:.2f}] "
         f"/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>").encode(),
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"endstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    ]

    buf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for i, body in enumerate(objs, start=1):
        offsets.append(len(buf))
        buf += f"{i} 0 obj\n".encode() + body + b"\nendobj\n"
    xref = len(buf)
    buf += f"xref\n0 {len(objs)+1}\n".encode()
    buf += b"0000000000 65535 f \n"
    for off in offsets:
        buf += f"{off:010d} 00000 n \n".encode()
    buf += (f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R /Info << /Title ({esc(doc['tajuk'])}) "
            f"/Author (Sekolah Kebangsaan Bongkol Pitas) /Creator (Portal SK Bongkol Pitas) >> >>\n"
            f"startxref\n{xref}\n%%EOF\n").encode("latin-1", "replace")
    return bytes(buf)


SCHOOL = [
    ("h", "Maklumat Asas"),
    ("kv", ("Nama penuh", "Sekolah Kebangsaan Bongkol Pitas")),
    ("kv", ("Kod sekolah", "XBA5218")),
    ("kv", ("Jenis", "Sekolah Kebangsaan (Sekolah Kerajaan)")),
    ("kv", ("Alamat", "Peti Surat 150, 89100 Pitas, Sabah")),
    ("kv", ("Koordinat", "6.82815 N, 117.16403 E")),
    ("kv", ("Tahun ditubuhkan", "1983")),
    ("kv", ("Moto", "Seiring Melangkah Ke Hadapan")),
    ("kv", ("Telefon", "6088684950")),
]

DOCS = [
    {
        "fail": "01-Laporan-Data-Sekolah-2026.pdf",
        "kod": "SKB/JPN/DS/2026/01",
        "kategori": "Dashboard Data Sekolah",
        "tajuk": "Laporan Data Sekolah 2026",
        "subjek": "Statistik murid, guru, enrolmen dan infrastruktur - dikemas kini 25 September 2026",
        "baris": SCHOOL + [
            ("h", "Enrolmen dan Tenaga Pengajar"),
            ("kv", ("Jumlah murid (rekod 2009)", "302 orang (159 lelaki / 143 perempuan)")),
            ("kv", ("Jumlah guru (rekod 2009)", "25 orang")),
            ("kv", ("Nisbah guru : murid", "1 : 12")),
            ("kv", ("Enrolmen semasa", "Menunggu pengesahan JPN Sabah")),
            ("t", "Nota metodologi: angka enrolmen dan tenaga pengajar yang dipaparkan adalah rekod rasmi terakhir "
                  "yang tersedia secara terbuka (2009). Sekolah diminta mengemukakan data enrolmen semasa melalui "
                  "Pentadbir Sistem untuk tujuan pemantauan SKPM."),
            ("h", "Infrastruktur"),
            ("b", "Dewan SK Bongkol - dinaik taraf pada 2019 melalui peruntukan RM60,000."),
            ("b", "Bangunan pengajian, bilik guru, perpustakaan sumber dan padang permainan."),
            ("b", "SK Bongkol pernah dikategorikan sebagai sekolah daif di Sabah sebelum kerja baik pulih."),
            ("b", "SMK Bongkol menumpang di premis SK Bongkol sebelum bangunan kekalnya diluluskan."),
            ("gap", ""),
            ("h", "Tindakan Susulan"),
            ("b", "Kemas kini enrolmen mengikut tahun dan kelas sebelum 31 Oktober 2026."),
            ("b", "Lampirkan pelan tapak dan senarai kerosakan bangunan terkini."),
        ],
    },
    {
        "fail": "02-Dokumen-Kualiti-SKPM-NKRA.pdf",
        "kod": "SKB/JPN/KUA/2026/02",
        "kategori": "Dokumen Kualiti",
        "tajuk": "Laporan SKPM dan NKRA",
        "subjek": "Standard Kualiti Pendidikan Malaysia dan sasaran NKRA sekolah",
        "baris": [
            ("h", "Ringkasan Pelaksanaan"),
            ("t", "Dokumen ini merumuskan pelaksanaan Standard Kualiti Pendidikan Malaysia (SKPM) di SK Bongkol "
                  "Pitas bagi kitaran penilaian semasa, termasuk skor komposit dan cadangan penambahbaikan."),
            ("h", "Skor Standard"),
            ("kv", ("Standard 1 - Kepimpinan", "Menunggu pengesahan")),
            ("kv", ("Standard 2 - Pengurusan Organisasi", "Menunggu pengesahan")),
            ("kv", ("Standard 3 - Pengurusan Kurikulum", "Menunggu pengesahan")),
            ("kv", ("Standard 4 - Pengurusan HEM", "Menunggu pengesahan")),
            ("kv", ("Standard 5 - Pengurusan Kokurikulum", "Menunggu pengesahan")),
            ("kv", ("Standard 6 - Kemenjadian Murid", "Menunggu pengesahan")),
            ("gap", ""),
            ("t", "Skor komposit akan diisi oleh Jemaah Nazir selepas lawatan verifikasi. Ruang ini disediakan "
                  "supaya portal menjadi rujukan tunggal semasa lawatan."),
            ("h", "NKRA"),
            ("b", "Sasaran akses - memastikan setiap murid hadir melebihi 95% hari persekolahan."),
            ("b", "Sasaran kualiti - pengukuhan literasi dan numerasi Tahap 1."),
            ("b", "Sasaran ekuiti - memastikan murid pedalaman mendapat sokongan bantuan persekolahan."),
            ("gap", ""),
            ("h", "Lampiran Diperlukan"),
            ("b", "Pelan Pembangunan Sekolah 2026-2030"),
            ("b", "Laporan Audit Dalaman Kurikulum"),
            ("b", "Minit Mesyuarat Panitia"),
        ],
    },
    {
        "fail": "03-Profil-Pentadbir-dan-Guru.pdf",
        "kod": "SKB/JPN/PG/2026/03",
        "kategori": "Profil Pentadbir dan Guru",
        "tajuk": "Profil Pentadbir dan Senarai Guru",
        "subjek": "Struktur pentadbiran sekolah dan tenaga pengajar",
        "baris": [
            ("h", "Pentadbiran Tertinggi"),
            ("kv", ("Guru Besar", "Jawatan disandang - nama penuh menunggu pengesahan sekolah")),
            ("kv", ("Wakil Guru Besar (2024)", "London Gogomboh")),
            ("kv", ("Penolong Kanan Akademik", "Kekosongan menunggu pengesahan")),
            ("kv", ("Penolong Kanan HEM", "Kekosongan menunggu pengesahan")),
            ("kv", ("Penolong Kanan Kokurikulum", "Kekosongan menunggu pengesahan")),
            ("gap", ""),
            ("t", "Nota: Nama penuh Guru Besar tidak dinyatakan secara langsung dalam sumber awam. Pihak sekolah "
                  "perlu mengemas kini profil ini melalui Pentadbir Sistem. Rekod rasmi menunjukkan seramai 25 orang "
                  "guru berkhidmat di SK Bongkol pada 2009."),
            ("h", "Senarai Guru Mengikut Panitia"),
            ("kv", ("Bahasa Melayu", "Menunggu pengesahan")),
            ("kv", ("Bahasa Inggeris", "Menunggu pengesahan")),
            ("kv", ("Matematik", "Menunggu pengesahan")),
            ("kv", ("Sains", "Menunggu pengesahan")),
            ("kv", ("Pendidikan Islam dan Moral", "Menunggu pengesahan")),
            ("kv", ("Kajian Tempatan dan Sejarah", "Menunggu pengesahan")),
            ("kv", ("Pendidikan Jasmani dan Kesihatan", "Menunggu pengesahan")),
            ("kv", ("Pendidikan Seni dan Muzik", "Menunggu pengesahan")),
            ("gap", ""),
            ("h", "Staf Sokongan"),
            ("b", "Pembantu Tadbir dan Kerani Sekolah"),
            ("b", "Pembantu Am Rendah"),
            ("b", "Pekerja Sambilan Harian"),
        ],
    },
    {
        "fail": "04-Pencapaian-Akademik-Kokurikulum.pdf",
        "kod": "SKB/JPN/PAC/2026/04",
        "kategori": "Pencapaian",
        "tajuk": "Pencapaian Akademik dan Kokurikulum",
        "subjek": "Rekod pencapaian murid dan penyertaan peringkat daerah serta negeri",
        "baris": [
            ("h", "Kokurikulum dan Sukan"),
            ("kv", ("Kejohanan Catur MSSD Pitas 2026", "Kategori P12 dan L12")),
            ("t", "Wakil sekolah yang terlibat termasuk Abigail Odette Juanis, Ellyrinazetty Grace Nius, "
                  "Elsarose Clarryssa Ambrose dan beberapa murid lain."),
            ("gap", ""),
            ("kv", ("Program Pencarian Bakat Sukan UMS", "73 murid Tahap 2 dari 9 sekolah di pedalaman Pitas")),
            ("kv", ("Anugerah Pelajar Cemerlang 2019", "Majlis Tamat Prasekolah 2019")),
            ("t", "Majlis Anugerah Pelajar Cemerlang dan Majlis Tamat Prasekolah 2019 dirasmikan oleh Timbalan "
                  "Ketua Menteri Sabah, Datuk Jaujan Sambakong, yang menekankan peranan guru dan pembelajaran "
                  "abad ke-21."),
            ("h", "Akademik"),
            ("t", "Data pencapaian akademik terkini (UPSR / PSR / pentaksiran semasa) perlu diperoleh daripada "
                  "unit pentaksiran sekolah dan JPN Sabah. Portal menyediakan ruang pemaparan graf sebaik sahaja "
                  "data dimasukkan."),
            ("b", "Kadar kelulusan mengikut mata pelajaran teras"),
            ("b", "Analisis gred mengikut kelas"),
            ("b", "Perbandingan pencapaian antara tahun"),
            ("gap", ""),
            ("h", "Sasaran 2026"),
            ("b", "Peningkatan penyertaan kokurikulum peringkat daerah kepada 100% murid Tahap 2."),
            ("b", "Sekurang-kurangnya tiga podium peringkat MSSD Pitas."),
        ],
    },
    {
        "fail": "05-Laporan-Kewangan-dan-Bantuan.pdf",
        "kod": "SKB/JPN/KEW/2026/05",
        "kategori": "Kewangan dan Bantuan",
        "tajuk": "Laporan Kewangan dan Bantuan CSR",
        "subjek": "Peruntukan, sumbangan dan bantuan persekolahan kepada murid",
        "baris": [
            ("h", "Bantuan Persekolahan 2024"),
            ("kv", ("Penyumbang", "Yayasan Bank Rakyat (YBR)")),
            ("kv", ("Penerima murid", "337 murid SK Bongkol")),
            ("kv", ("Bentuk bantuan", "Beg sekolah dan RM50 tunai setiap murid")),
            ("kv", ("Penerima universiti", "5 orang")),
            ("kv", ("Lokasi majlis", "Dewan Mabahan Bongkol")),
            ("gap", ""),
            ("h", "Sumbangan 2019"),
            ("kv", ("Penyumbang", "Timbalan Ketua Menteri Sabah")),
            ("kv", ("Jumlah", "RM60,000")),
            ("kv", ("Tujuan", "Menaik taraf kemudahan sekolah termasuk Dewan SK Bongkol")),
            ("gap", ""),
            ("t", "Jumlah peruntukan tahunan (PCG, Bantuan Sekolah dan bantuan kokurikulum) perlu dikemas kini "
                  "oleh Pembantu Tadbir Sekolah melalui modul kewangan portal ini."),
            ("h", "Ruang Semakan"),
            ("b", "Penyata peruntukan mengikut punca dan perbelanjaan sebenar"),
            ("b", "Senarai penerima bantuan murid mengikut kelas"),
            ("b", "Laporan inventori aset sekolah"),
        ],
    },
    {
        "fail": "06-Pelan-Pembangunan-Sekolah-2026-2030.pdf",
        "kod": "SKB/JPN/PPS/2026/06",
        "kategori": "Dokumen Kualiti",
        "tajuk": "Pelan Pembangunan Sekolah 2026-2030",
        "subjek": "Hala tuju strategik lima tahun Sekolah Kebangsaan Bongkol Pitas",
        "baris": [
            ("h", "Visi dan Misi"),
            ("t", "Visi: menjadikan SK Bongkol Pitas sebuah sekolah pedalaman yang unggul dalam akademik, "
                  "sahsiah dan kokurikulum menjelang 2030."),
            ("t", "Misi: menyediakan persekitaran pembelajaran yang selamat, inklusif dan berkesan, diperkukuh "
                  "dengan kerjasama guru, ibu bapa dan komuniti Pitas."),
            ("h", "Teraskan Strategik"),
            ("kv", ("1. Infrastruktur", "Naik taraf bangunan, dewan dan kemudahan asas")),
            ("kv", ("2. Kemenjadian Murid", "Pengukuhan literasi, numerasi dan sahsiah")),
            ("kv", ("3. Kompetensi Guru", "Latihan dalam perkhidmatan berterusan")),
            ("kv", ("4. Penglibatan Komuniti", "Pengukuhan PIBG dan rakan strategik")),
            ("kv", ("5. Digitalisasi", "Data sekolah berpusat dan pentadbiran tanpa kertas")),
            ("gap", ""),
            ("h", "Petunjuk Prestasi Utama"),
            ("b", "Kehadiran murid melebihi 95% setiap tahun."),
            ("b", "Peningkatan pencapaian pentaksiran bilik darjah sekurang-kurangnya satu band."),
            ("b", "Penyertaan kokurikulum peringkat daerah dan negeri setiap tahun."),
            ("b", "Pemuliharaan dan naik taraf fasiliti utama setiap dua tahun."),
        ],
    },
    {
        "fail": "07-Laporan-Lawatan-Nazir.pdf",
        "kod": "SKB/JPN/NZR/2026/07",
        "kategori": "Dokumen Kualiti",
        "tajuk": "Laporan Lawatan Jemaah Nazir",
        "subjek": "Rangka penemuan, cadangan dan tindakan susulan lawatan verifikasi",
        "baris": [
            ("h", "Maklumat Lawatan"),
            ("kv", ("Sekolah", "SK Bongkol Pitas (XBA5218)")),
            ("kv", ("Pegawai", "Jemaah Nazir Sabah")),
            ("kv", ("Tarikh lawatan", "Menunggu penjadualan")),
            ("kv", ("Sasaran", "Verifikasi SKPM dan pematuhan dasar KPM")),
            ("gap", ""),
            ("h", "Rangka Penemuan"),
            ("b", "Kekuatan kepimpinan sekolah dan komitmen guru dalam pembelajaran abad ke-21."),
            ("b", "Penglibatan aktif murid dalam kokurikulum sukan dan catur peringkat daerah."),
            ("b", "Keperluan naik taraf infrastruktur bagi menyokong pembelajaran kondusif."),
            ("b", "Keperluan pengukuhan dokumentasi data murid dan pencapaian."),
            ("gap", ""),
            ("h", "Tindakan Susulan Sekolah"),
            ("b", "Mengemas kini data enrolmen, guru dan pencapaian dalam portal rasmi."),
            ("b", "Melengkapkan dokumen SKPM sebelum lawatan verifikasi."),
            ("b", "Mengemukakan pelan naik taraf infrastruktur kepada PPD Pitas."),
            ("gap", ""),
            ("t", "Dokumen ini adalah rangka kerja untuk diisi oleh sekolah dan pengesahan Jemaah Nazir. "
                  "Portal SK Bongkol Pitas menyediakan ruang pemaparan bagi laporan yang telah disahkan."),
        ],
    },
]

for d in DOCS:
    data = build(d)
    p = os.path.join(BASE, d["fail"])
    with open(p, "wb") as f:
        f.write(data)
    print(f"{d['fail']}: {len(data)//1024} KB")

print("done ->", BASE)

"""Strip site chrome from raw text dumps -> main content only."""
import os, re, glob

RAW = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "raw")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "main")
os.makedirs(OUT, exist_ok=True)

STARTS = ["Utama | Kembali", "Bayu AI\nOnline\n", "Smart Office Akses Pantas\nBuat Janji Temu"]
ENDS = ["⛅", "Statistik Pelawat", "Pejabat Setiausaha Kerajaan Negeri Sabah\nAras 28",
        "SABAH MAJU JAYA", "Hak Cipta Terpelihara"]

for f in sorted(glob.glob(os.path.join(RAW, "*.txt"))):
    t = open(f, encoding="utf-8").read()
    head, _, body = t.partition("\n\n")
    start = 0
    for s in STARTS:
        i = body.rfind(s)
        if i >= 0:
            start = max(start, i + len(s))
    body = body[start:]
    cut = len(body)
    for e in ENDS:
        j = body.find(e)
        if j > 100:
            cut = min(cut, j)
    body = body[:cut].strip()
    body = re.sub(r"\n{3,}", "\n\n", body)
    name = os.path.basename(f)[:-4]
    if len(body) < 60:
        body = "(tiada kandungan utama dikesan / kandungan dimuat secara dinamik)"
    with open(os.path.join(OUT, name + ".md"), "w", encoding="utf-8") as o:
        o.write(head.strip() + "\n\n---\n\n" + body + "\n")
    print("%-70s %6d" % (name, len(body)))

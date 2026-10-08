"""Crawl skn.sabah.gov.my and dump raw HTML + cleaned text for R&D analysis."""
import os, re, json, time, hashlib, urllib.request, urllib.error, ssl, sys
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor

BASE = "https://skn.sabah.gov.my"
RAW = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "raw")
os.makedirs(RAW, exist_ok=True)

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

SEED = [
    "/", "/index.php",
    "/setiausaha/biografi", "/setiausaha/100-hari-kepimpinan", "/setiausaha/kad-digital",
    "/setiausaha/amanat-skn", "/setiausaha/sejarah-skn", "/setiausaha/perutusan-teks",
    "/setiausaha/jurnal",
    "/korporat/info-korporat/struktur-kerajaan", "/korporat/info-korporat/latar-belakang",
    "/korporat/info-korporat/visi-misi-motto", "/korporat/info-korporat/struktur",
    "/korporat/info-korporat/direktori",
    "/korporat/bahagian/info-bigons", "/korporat/bahagian/info-bigons/profil-bahagian",
    "/korporat/bahagian/info-bigons/profil-bahagian/profil-integriti",
    "/korporat/bahagian/info-bigons/profil-bahagian/direktori-integriti",
    "/korporat/bahagian/info-bigons/polisi-integriti-antirasuah",
    "/korporat/bahagian/info-bigons/inisiatif-gia",
    "/korporat/bahagian/info-bigons/direktori-ceio",
    "/sumber/dashboard/apps", "/sumber/dashboard/senarai-aplikasi",
    "/sumber/repositori/digital-library", "/sumber/repositori/dasar-negara",
    "/sumber/repositori/repodata", "/sumber/repositori/flipbook", "/sumber/repositori/carian",
    "/sumber/siaran/terkini", "/sumber/siaran/arkib",
    "/sumber/aplikasi/myapps", "/sumber/aplikasi/dass21",
    "/sumber/aplikasi/personaliti-mbti", "/sumber/aplikasi/personaliti-bigfive",
    "/sumber/aplikasi/semakan-ihemah", "/sumber/aplikasi/iterima",
    "/sumber/aplikasi/kalendar",
    "/hubungi/imeet-skn", "/hubungi/semak-janjitemu", "/hubungi/direktori",
    "/hubungi/faq", "/hubungi/irespon",
    "/bigons", "/peta-laman", "/penafian", "/dasar-privasi", "/syarat-terma", "/hak-cipta",
    "/warga",
    "/iknow/kesihatan-keselamatan", "/iknow/pelancongan-alam", "/iknow/pendidikan-kerjaya",
    "/iknow/infrastruktur", "/iknow/perniagaan", "/iknow/sosial-kebajikan",
    "/sumber/repositori/repo-pekeliling", "/sumber/repositori/dasar-kementerian",
    "/sumber/siaran/terkini/publisiti-integriti",
]

SKIP_EXT = re.compile(r"\.(png|jpe?g|gif|svg|css|js|ico|woff2?|ttf|pdf|zip|mp4|webp)(\?|$)", re.I)


class TextX(HTMLParser):
    DROP = {"script", "style", "noscript", "svg", "iframe"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.buf = []
        self.skip = 0
        self.title = ""
        self.in_title = False
        self.links = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag in self.DROP:
            self.skip += 1
        if tag == "title":
            self.in_title = True
        if tag == "a" and d.get("href"):
            self.links.append(d["href"])
        if tag in ("br",):
            self.buf.append("\n")
        if tag in ("p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "section", "article"):
            self.buf.append("\n")
        if tag == "td" or tag == "th":
            self.buf.append(" | ")
    def handle_endtag(self, tag):
        if tag in self.DROP and self.skip:
            self.skip -= 1
        if tag == "title":
            self.in_title = False
        if tag in ("p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "section", "article"):
            self.buf.append("\n")
    def handle_data(self, data):
        if self.skip:
            return
        if self.in_title:
            self.title += data
        self.buf.append(data)
    def text(self):
        t = "".join(self.buf)
        t = re.sub(r"[ \t\xa0]+", " ", t)
        t = re.sub(r"\n\s*\n\s*\n+", "\n\n", t)
        lines = [l.strip() for l in t.split("\n")]
        out, prev = [], ""
        for l in lines:
            if not l:
                continue
            if l == prev:
                continue
            out.append(l)
            prev = l
        return "\n".join(out)


def fetch(path):
    url = path if path.startswith("http") else BASE + path
    if not url.startswith(BASE):
        return None
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ms,en"})
        with urllib.request.urlopen(req, timeout=45, context=CTX) as r:
            ct = r.headers.get("Content-Type", "")
            body = r.read()
            try:
                html = body.decode("utf-8", "replace")
            except Exception:
                html = body.decode("latin-1", "replace")
            return url, r.status, ct, html
    except Exception as e:
        return url, 0, str(e), ""


def slug(url):
    p = url.replace(BASE, "").strip("/")
    if not p:
        p = "home"
    p = re.sub(r"[^A-Za-z0-9]+", "_", p).strip("_")[:120]
    return p or "home"


results = {}
with ThreadPoolExecutor(max_workers=6) as ex:
    for res in ex.map(fetch, SEED):
        if not res:
            continue
        url, status, ct, html = res
        if not html:
            print("FAIL", status, url)
            continue
        s = slug(url)
        with open(os.path.join(RAW, s + ".html"), "w", encoding="utf-8") as f:
            f.write(html)
        p = TextX()
        try:
            p.feed(html)
        except Exception:
            pass
        txt = p.text()
        with open(os.path.join(RAW, s + ".txt"), "w", encoding="utf-8") as f:
            f.write("URL: %s\nHTTP: %s\nCT: %s\nTITLE: %s\n\n" % (url, status, ct, p.title.strip()) + txt)
        results[url] = {"file": s, "status": status, "title": p.title.strip(), "len": len(html),
                        "textlen": len(txt), "links": p.links}
        print("OK %-70s %8d html %8d txt  %s" % (url, len(html), len(txt), p.title.strip()[:60]))

with open(os.path.join(RAW, "_index.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, indent=1, ensure_ascii=False)
print("\nTOTAL", len(results))

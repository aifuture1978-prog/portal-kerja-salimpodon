# -*- coding: utf-8 -*-
"""Bina panduan HTML (boleh cetak) daripada tiga fail PROMPT DNA markdown."""
import io, os, re, html

BASE = r"C:/Users/User/WorkBuddy AI/2026-09-26-11-13-39"
SRC  = os.path.join(BASE, "prompt_dna")
OUT  = os.path.join(SRC, "Panduan_Prompt_DNA.html")

FILES = [
    ("p1", "PROMPT_DNA_01_Portal_Bahan_PdP.md",
     "Prompt Induk", "Portal Bahan PdP Lengkap",
     "Menghasilkan keseluruhan portal: setiap unit, setiap tajuk, 6 komponen, satu platform.",
     "01"),
    ("p2", "PROMPT_DNA_02_Watak_Animasi_Ghibli_Pixar.md",
     "Prompt Watak", "Watak & Animasi Ghibli × Pixar",
     "Menghasilkan pustaka watak SVG + animasi halus yang berwarna-warni dan selamat dicetak.",
     "02"),
    ("p3", "PROMPT_DNA_03_Contoh_AutoClaw_GLM53Flash.md",
     "Panduan & Contoh", "Guna dalam AutoClaw × GLM-5.3-Flash",
     "Cara hantar prompt, contoh keluaran penuh, versi padat, dan tip khusus model.",
     "03"),
]

# ---------------------------------------------------------------- markdown mini
HEX = re.compile(r'#([0-9a-fA-F]{6})\b')

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', t)
    # swatch chips for bare hex codes
    def sw(m):
        h = "#" + m.group(1)
        return '<span class="sw"><i style="background:%s"></i>%s</span>' % (h, h)
    t = HEX.sub(sw, t)
    return t

def render(md):
    out, i = [], 0
    lines = md.split("\n")
    n = len(lines)
    in_prompt = False
    while i < n:
        ln = lines[i]
        s = ln.strip()

        # ---- prompt marker blocks
        if s.startswith("=== MULA PROMPT ==="):
            out.append('<div class="promptwrap"><div class="pbar">'
                       '<span class="plabel">PROMPT — salin dari sini</span>'
                       '<button class="cp" type="button">Salin</button></div>'
                       '<pre class="prompt">')
            in_prompt = True; i += 1; continue
        if s.startswith("=== TAMAT PROMPT ==="):
            out.append('</pre></div>')
            in_prompt = False; i += 1; continue

        if in_prompt:
            out.append(html.escape(ln, quote=False))
            i += 1; continue

        # ---- fenced code
        if s.startswith("```"):
            lang = s[3:].strip()
            i += 1; buf = []
            while i < n and not lines[i].strip().startswith("```"):
                buf.append(html.escape(lines[i], quote=False)); i += 1
            i += 1
            cls = "code" + (" txt" if lang in ("text", "txt") else "")
            out.append('<div class="codewrap"><button class="cp small" type="button">Salin</button>'
                       '<pre class="%s">%s</pre></div>' % (cls, "\n".join(buf)))
            continue

        # ---- table
        if s.startswith("|") and i + 1 < n and re.match(r'^\|[\s:\-|]+\|$', lines[i+1].strip()):
            head = [c.strip() for c in s.strip("|").split("|")]
            i += 2; rows = []
            while i < n and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i += 1
            t = ['<div class="tw"><table><thead><tr>']
            t += ['<th>%s</th>' % inline(c) for c in head]
            t.append('</tr></thead><tbody>')
            for r in rows:
                t.append('<tr>' + "".join('<td>%s</td>' % inline(c) for c in r) + '</tr>')
            t.append('</tbody></table></div>')
            out.append("".join(t)); continue

        # ---- heading
        m = re.match(r'^(#{1,4})\s+(.*)$', s)
        if m:
            lvl = len(m.group(1)); txt = m.group(2)
            slug = re.sub(r'[^a-z0-9]+', '-', re.sub(r'[^A-Za-z0-9 ]', '', txt).lower()).strip('-')
            out.append('<h%d id="%s">%s</h%d>' % (lvl, slug, inline(txt), lvl)); i += 1; continue

        # ---- hr
        if re.match(r'^-{3,}$', s):
            out.append('<hr/>'); i += 1; continue

        # ---- blockquote
        if s.startswith(">"):
            buf = []
            while i < n and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].strip()); i += 1
            out.append('<blockquote>%s</blockquote>' % inline(" ".join(buf))); continue

        # ---- lists
        if re.match(r'^[-*]\s+', s):
            items = []
            while i < n and re.match(r'^[-*]\s+', lines[i].strip()):
                items.append(re.sub(r'^[-*]\s+', '', lines[i].strip())); i += 1
            out.append('<ul>' + "".join('<li>%s</li>' % inline(x) for x in items) + '</ul>'); continue
        if re.match(r'^\d+\.\s+', s):
            items = []
            while i < n and re.match(r'^\d+\.\s+', lines[i].strip()):
                items.append(re.sub(r'^\d+\.\s+', '', lines[i].strip())); i += 1
            out.append('<ol>' + "".join('<li>%s</li>' % inline(x) for x in items) + '</ol>'); continue

        # ---- blank
        if not s:
            i += 1; continue

        # ---- paragraph
        out.append('<p>%s</p>' % inline(s)); i += 1
    return "\n".join(out)

# ---------------------------------------------------------------- build
sections = []
for key, fn, kicker, title, blurb, num in FILES:
    md = io.open(os.path.join(SRC, fn), encoding="utf-8").read()
    sections.append((key, kicker, title, blurb, num, render(md)))

nav = "".join(
    '<a class="nv" href="#%s"><span class="n">%s</span><span class="t">%s</span>'
    '<span class="d">%s</span></a>' % (k, num, t, b)
    for k, _kk, t, b, num, _h in sections)

body = []
for key, kicker, title, blurb, num, htmlbody in sections:
    body.append(
        '<section class="doc" id="%s">'
        '<div class="dhead"><span class="dnum">%s</span><div>'
        '<div class="dkick">%s</div><h2>%s</h2><p class="dblurb">%s</p></div></div>'
        '<div class="dbody">%s</div></section>' % (key, num, kicker, title, blurb, htmlbody))

# ---------------------------------------------------------------- palette swatches
# The palette registry lives INSIDE the prompt block (so the prompt stays copy-pasteable
# and pure). Add a separate visual reference so the user can actually SEE the colours.
md1 = io.open(os.path.join(SRC, FILES[0][1]), encoding="utf-8").read()
pal_rows = []
for m in re.finditer(r'^\|\s*(P\d\d)\s*\|\s*([^|]+?)\s*\|((?:\s*`#[0-9a-fA-F]{6}`\s*\|){5})\s*$',
                     md1, re.M):
    code, name = m.group(1), m.group(2)
    hexes = re.findall(r'#([0-9a-fA-F]{6})', m.group(3))
    pal_rows.append((code, name, hexes))
pal_cards = []
for code, name, hx in pal_rows:
    chips = "".join(
        '<span class="pch"><i style="background:#%s"></i><em>%s</em></span>' % (h, h)
        for h in hx)
    pal_cards.append(
        '<div class="pcard"><div class="pc-top">'
        '<span class="pc-code">%s</span><span class="pc-name">%s</span></div>'
        '<div class="pc-chips">%s</div></div>' % (code, html.escape(name), chips))
PAL_SECTION = (
    '<section class="doc" id="pal">'
    '<div class="dhead"><span class="dnum">04</span><div>'
    '<div class="dkick">Rujukan Visual</div><h2>Registri Palet &mdash; 24 Gabungan</h2>'
    '<p class="dblurb">Setiap unit mesti guna satu palet yang berbeza. Jadual penuh berada '
    'di dalam Prompt #1 (Bahagian A); ini rujukan visual supaya senang pilih.</p>'
    '</div></div><div class="dbody">'
    '<div class="pgrid">%s</div>'
    '<blockquote>Warna identiti watak (kulit, rambut, hijab, baju, pipi) <strong>tidak pernah</strong> '
    'termasuk dalam palet unit &mdash; ia kekal sama dalam semua unit.</blockquote>'
    '</div></section>' % "".join(pal_cards))
nav_pal = ('<a class="nv" href="#pal"><span class="n">04</span>'
           '<span class="t">Registri Palet</span>'
           '<span class="d">24 gabungan warna untuk 24 unit &mdash; rujukan visual.</span></a>')
nav += nav_pal
body.append(PAL_SECTION)

TPL = """<!doctype html>
<html lang="ms"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panduan Prompt DNA — Portal Bahan PdP</title>
<style>
  :root{
    --ink:#1f2430; --muted:#6b7484; --line:#e3e7ee; --paper:#ffffff;
    --bg:#f4f6fa; --c1:#3b4a7a; --c2:#232c4d; --acc:#c98a1f; --accd:#8a5c0e;
    --tint:#eef1f8; --acctint:#fdf3e0; --code:#f7f8fb;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{background:var(--bg);color:var(--ink);
       font-family:"Trebuchet MS","Segoe UI",Verdana,sans-serif;line-height:1.65}
  .wrap{max-width:1000px;margin:0 auto;padding:0 20px 80px}
  .hero{background:linear-gradient(135deg,var(--c2),var(--c1) 62%,#4d5f96);
        color:#fff;padding:38px 20px 34px;margin-bottom:26px}
  .hero .in{max-width:1000px;margin:0 auto}
  .hero .kick{font-size:12.5px;letter-spacing:2px;text-transform:uppercase;opacity:.8}
  .hero h1{margin:8px 0 10px;font-size:31px;line-height:1.2}
  .hero p{margin:0;max-width:760px;opacity:.93;font-size:14.5px}
  .hero .tags{margin-top:16px;display:flex;gap:8px;flex-wrap:wrap}
  .hero .tags span{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.28);
        padding:4px 11px;border-radius:999px;font-size:12px}
  .nav{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:22px 0 30px}
  .nv{display:block;background:var(--paper);border:1px solid var(--line);border-radius:12px;
      padding:14px 16px;text-decoration:none;color:inherit;transition:.15s;border-left:4px solid var(--acc)}
  .nv:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(35,44,77,.1)}
  .nv .n{display:inline-block;background:var(--c1);color:#fff;font-size:11.5px;font-weight:700;
      padding:2px 8px;border-radius:6px;margin-bottom:7px}
  .nv .t{display:block;font-weight:700;font-size:15px;color:var(--c2)}
  .nv .d{display:block;font-size:12.5px;color:var(--muted);margin-top:3px}
  .doc{background:var(--paper);border:1px solid var(--line);border-radius:14px;
       padding:26px 28px 30px;margin-bottom:26px}
  .dhead{display:flex;gap:16px;align-items:flex-start;border-bottom:2px solid var(--tint);
       padding-bottom:16px;margin-bottom:20px}
  .dnum{background:var(--c1);color:#fff;font-size:19px;font-weight:700;width:48px;height:48px;
       border-radius:12px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
  .dkick{font-size:11.5px;letter-spacing:1.6px;text-transform:uppercase;color:var(--accd);font-weight:700}
  .dhead h2{margin:3px 0 4px;font-size:23px;color:var(--c2)}
  .dblurb{margin:0;font-size:13.5px;color:var(--muted)}
  .dbody h1,.dbody h2{font-size:20px;color:var(--c2);margin:26px 0 10px}
  .dbody h3{font-size:16px;color:var(--c2);margin:22px 0 8px}
  .dbody h4{font-size:14px;color:var(--accd);margin:18px 0 6px;text-transform:uppercase;letter-spacing:.6px}
  .dbody p{margin:9px 0;font-size:14px}
  .dbody ul,.dbody ol{margin:9px 0 9px 4px;padding-left:22px;font-size:14px}
  .dbody li{margin:4px 0}
  .dbody strong{color:var(--c2)}
  code{background:var(--code);border:1px solid var(--line);border-radius:5px;padding:1px 5px;
       font-family:Consolas,"Courier New",monospace;font-size:12.5px}
  .dbody hr{border:0;border-top:1px solid var(--line);margin:22px 0}
  blockquote{margin:12px 0;padding:11px 15px;background:var(--acctint);
       border-left:4px solid var(--acc);border-radius:0 8px 8px 0;font-size:13.5px}
  .promptwrap{margin:18px 0;border:1px solid var(--c1);border-radius:12px;overflow:hidden}
  .pbar{background:var(--c1);color:#fff;display:flex;justify-content:space-between;
        align-items:center;padding:8px 14px}
  .plabel{font-size:12px;letter-spacing:1.2px;text-transform:uppercase;font-weight:700}
  pre.prompt{margin:0;padding:18px;background:#fbfcfe;font-family:Consolas,"Courier New",monospace;
        font-size:12.4px;line-height:1.62;white-space:pre-wrap;word-break:break-word;
        max-height:620px;overflow:auto}
  .codewrap{position:relative;margin:14px 0}
  pre.code{margin:0;padding:14px 16px;background:#fbfcfe;border:1px solid var(--line);border-radius:10px;
        font-family:Consolas,"Courier New",monospace;font-size:12.4px;line-height:1.6;
        white-space:pre-wrap;word-break:break-word}
  .cp{background:var(--acc);color:#3a2a06;border:0;border-radius:7px;padding:5px 13px;
      font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
  .cp:hover{background:#dfa231}
  .cp.small{position:absolute;top:8px;right:8px;padding:3px 10px;font-size:11px;opacity:.9}
  .cp.done{background:#3fae8c;color:#fff}
  .tw{overflow-x:auto;margin:14px 0}
  table{border-collapse:collapse;width:100%;font-size:13px}
  th,td{border:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top}
  th{background:var(--tint);color:var(--c2);font-size:12.5px}
  tr:nth-child(even) td{background:#fafbfd}
  .sw{display:inline-flex;align-items:center;gap:5px;font-family:Consolas,monospace;font-size:12px}
  .sw i{width:13px;height:13px;border-radius:4px;border:1px solid rgba(0,0,0,.18);display:inline-block}
  .pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}
  .pcard{border:1px solid var(--line);border-radius:11px;padding:11px 13px;background:#fcfdff}
  .pc-top{display:flex;align-items:baseline;gap:9px;margin-bottom:9px}
  .pc-code{background:var(--c1);color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:5px}
  .pc-name{font-size:13px;font-weight:700;color:var(--c2)}
  .pc-chips{display:flex;gap:6px;flex-wrap:wrap}
  .pch{display:flex;flex-direction:column;align-items:center;gap:3px}
  .pch i{width:44px;height:26px;border-radius:6px;border:1px solid rgba(0,0,0,.14);display:block}
  .pch em{font-style:normal;font-family:Consolas,monospace;font-size:10px;color:var(--muted)}
  .foot{text-align:center;color:var(--muted);font-size:12.5px;padding:8px 0 0}
  @media print{
    body{background:#fff}
    .hero{background:var(--c1) !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .nv,.cp{display:none}
    .doc{break-inside:auto;border:1px solid #ccc;box-shadow:none}
    pre.prompt{max-height:none;overflow:visible;font-size:9.5px}
    .pch i,.pcard{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .hero h1{font-size:22px}
    @page{size:A4;margin:12mm}
  }
</style></head>
<body>
<div class="hero"><div class="in">
  <div class="kick">Prompt DNA &bull; Bahan PdP</div>
  <h1>Panduan Prompt DNA — Portal Bahan PdP</h1>
  <p>Tiga prompt yang boleh terus digunakan untuk menghasilkan portal bahan pengajaran lengkap:
     setiap unit dan tajuk berdasarkan DSKP rasmi dan Buku Teks, lengkap 6 komponen, boleh
     diakses dalam satu platform.</p>
  <div class="tags">
    <span>6 komponen / unit</span><span>Palet unik setiap unit</span>
    <span>Gamifikasi &ldquo;Misi Minda&rdquo;</span><span>Watak Ghibli &times; Pixar</span>
    <span>AutoClaw &times; GLM-5.3-Flash</span>
  </div>
</div></div>

<div class="wrap">
  <div class="nav">__NAV__</div>
  __BODY__
  <div class="foot">Dokumen ini dijana automatik daripada tiga fail markdown dalam folder <code>prompt_dna/</code>.</div>
</div>

<script>
document.querySelectorAll('.cp').forEach(function(b){
  b.addEventListener('click', function(){
    var host = b.closest('.promptwrap, .codewrap');
    var pre  = host ? host.querySelector('pre') : null;
    if(!pre) return;
    var txt = pre.innerText;
    var done = function(){
      var old = b.textContent; b.textContent = 'Disalin \\u2713'; b.classList.add('done');
      setTimeout(function(){ b.textContent = old; b.classList.remove('done'); }, 1400);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done, function(){ fallback(txt, done); });
    } else { fallback(txt, done); }
  });
});
function fallback(txt, done){
  var ta = document.createElement('textarea');
  ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); done(); }catch(e){}
  document.body.removeChild(ta);
}
</script>
</body></html>
"""

htmlout = TPL.replace("__NAV__", nav).replace("__BODY__", "\n".join(body))
io.open(OUT, "w", encoding="utf-8").write(htmlout)
print("wrote", OUT, len(htmlout), "chars")

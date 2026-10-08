/* SKN Sabah R&D Knowledge Base — interaksi laman */
(function () {
  "use strict";

  var APPS = window.SKN_APPS || [];

  /* ---------- Pengkategorian anggaran berasaskan kata kunci ---------- */
  var PSKN_HINT = /^(i[A-Z]|smart office|bayu|my app store|iapps|dass|mbti|big five|aduan jalanraya)/i;
  var PSKN_EXACT = /^(iMeet|iRespon|iTerima|iHemah|iTrack|iDocs|iSchedule|iCars|iFuel|iMove|iVisit|iAttend|iBook|iClean|iMenara|iContact|iPortfolio|iAkses|iCertified|iFail|Smart Office|Bayu AI|iApps)/i;

  var RULES = [
    ["pskn", /\b(iMeet|iRespon|iTerima|iHemah|iTrack|iDocs|iSchedule|iCars|iFuel|iMove|iVisit|iAttend|iBook|iClean|iMenara|iContact|iPortfolio|iAkses|iCertified|iFail|SmartOffice|Smart Office|Bayu)\b/i],
    ["tanah", /tanah|land|ukur|survey|geoforest|boundary|geospatial|pemetaan|strata|lot|jelapang padi|eBumi/i],
    ["lesen", /lesen|licen|permit|tauliah|permohonan|pendaftaran|registration|kuari|prospecting|power of attorney|wood mill|kapal/i],
    ["kewangan", /kewangan|financial|pay|bayar|eResit|resit|lejar|ledger|gaji|payroll|pencen|cukai|loan|pinjaman|perakaunan|akrual|emolumen|sebutharga|sebut harga|tender|perolehan|kontrak/i],
    ["hr", /sumber manusia|human resource|cuti|leave|prestasi|penilaian|latihan|kursus|training|kompetensi|pergerakan|tatatertib|jawatan|emolumen|SM2|INSAN|SiLK|JPSM|SSL|perkhidmatan awam/i],
    ["aduan", /aduan|adu|complaint|integriti|rasuah|antirasuah|salah laku|penguatkuasaan|siasatan|investigation/i],
    ["pertanian", /pertanian|agri|padi|sawah|tanaman|ternakan|perikanan|ikan|nelayan|hutan|forest|kayu|timber|TLAS|agrobiz|tani|kuarantin|quarantine|veterinar/i],
    ["pengangkutan", /kenderaan|kereta|pengangkutan|transport|kapal|vessel|keretapi|railway|penerbangan|pelabuhan|port|dermaga|lesen memandu|fleet|VSAT|rolling stock/i],
    ["kesihatan", /kesihatan|hospital|klinik|rawatan|minda|mental|DASS|psikologi|kebajikan|bantuan|zakat|fitrah|muallaf|welfare|prihatin/i],
    ["pelancongan", /pelancongan|tourism|hotel|budaya|muzium|museum|lokawi|artisanal|tiket|tempahan/i],
    ["pendidikan", /pendidikan|pelajar|student|sekolah|biasiswa|institut|universiti|education|web opac|perpustakaan|exam|peperiksaan|ILMU|budi/i],
    ["alam", /alam sekitar|environment|biodiversiti|hidupan liar|wildlife|air|water|sungai|iklim|hutan|fire|banjir|bencana|deias|ecres/i],
    ["covid", /covid|pandemik|kuarantin|vaksin/i],
  ];

  function classify(name) {
    if (PSKN_EXACT.test(name) || /^i[A-Z]/.test(name)) return "pskn";
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i][1].test(name)) return RULES[i][0];
    }
    if (PSKN_HINT.test(name)) return "pskn";
    return "lain";
  }

  var LIST = document.getElementById("appList");
  var SEARCH = document.getElementById("appSearch");
  var FILTER = document.getElementById("appFilter");
  var SHOWN = document.getElementById("appShown");
  if (!LIST) return;

  var tagged = APPS.map(function (n) {
    return { n: n, c: classify(n), lc: n.toLowerCase() };
  }).sort(function (a, b) {
    if (a.c === "pskn" && b.c !== "pskn") return -1;
    if (b.c === "pskn" && a.c !== "pskn") return 1;
    return a.n.localeCompare(b.n, "ms");
  });

  function render() {
    var q = (SEARCH.value || "").trim().toLowerCase();
    var f = FILTER.value || "";
    var out = [];
    var hits = 0;
    for (var i = 0; i < tagged.length; i++) {
      var t = tagged[i];
      if (f && t.c !== f) continue;
      var hit = q && t.lc.indexOf(q) !== -1;
      if (q && !hit) continue;
      hits++;
      var el = document.createElement("span");
      el.className = "chip" + (hit ? " hit" : "") + (t.c === "pskn" ? " pskn" : "");
      el.textContent = t.n;
      el.title = t.n + " — kategori anggaran: " + t.c;
      out.push(el);
    }
    LIST.innerHTML = "";
    var frag = document.createDocumentFragment();
    out.forEach(function (e) { frag.appendChild(e); });
    if (!out.length) {
      var empty = document.createElement("em");
      empty.style.cssText = "color:#6b7c8d;font-size:.85rem";
      empty.textContent = "Tiada aplikasi sepadan dengan carian/tapisan ini.";
      frag.appendChild(empty);
    }
    LIST.appendChild(frag);
    SHOWN.textContent = "Dipaparkan: " + hits + " / " + tagged.length;
  }

  if (SEARCH) SEARCH.addEventListener("input", render);
  if (FILTER) FILTER.addEventListener("change", render);
  render();

  /* ---------- Penanda navigasi aktif ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll("#topnav a"));
  var targets = links
    .map(function (a) {
      var el = document.querySelector(a.getAttribute("href"));
      return el ? { a: a, el: el } : null;
    })
    .filter(Boolean);

  function spy() {
    var y = window.scrollY + 110;
    var current = null;
    targets.forEach(function (t) {
      if (t.el.offsetTop <= y) current = t;
    });
    links.forEach(function (a) { a.classList.remove("on"); });
    if (current) current.a.classList.add("on");
  }
  window.addEventListener("scroll", spy, { passive: true });
  spy();
})();

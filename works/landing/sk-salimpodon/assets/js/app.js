/* ==========================================================================
   SK SALIMPODON DARAT, PITAS — app.js
   Hash router · reveal · counters · charts · gallery lightbox · officer portal
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var ROUTES = ["utama", "profil", "pentadbiran", "organisasi", "kurikulum",
                "pencapaian", "berita", "galeri", "video", "hubungi",
                "pegawai", "dashboard"];

  var TITLES = {
    utama:        "Portal Rasmi SK Salimpodon Darat, Pitas | Ilmu Penyuluh Desa",
    profil:       "Profil & Sejarah Sekolah | SK Salimpodon Darat",
    pentadbiran:  "Pentadbiran & Warga Sekolah | SK Salimpodon Darat",
    organisasi:   "Carta Organisasi | SK Salimpodon Darat",
    kurikulum:    "Agihan Subjek & Bilangan Waktu Mengajar 2026 | SK Salimpodon Darat",
    pencapaian:   "Pencapaian & Pengiktirafan | SK Salimpodon Darat",
    berita:       "Berita & Pengumuman | SK Salimpodon Darat",
    galeri:       "Galeri Media | SK Salimpodon Darat",
    video:        "Galeri Video | SK Salimpodon Darat",
    hubungi:      "Hubungi Kami | SK Salimpodon Darat",
    pegawai:      "Portal Pegawai — Jemaah Nazir, JPN, PPD & Sekolah | SK Salimpodon Darat",
    dashboard:    "Dashboard Pegawai | SK Salimpodon Darat"
  };

  var AUTH_KEY = "sksd_officer_access";
  var ROLE_KEY = "sksd_officer_role";

  /* three access tiers — the password alone decides the role */
  var KOD = "XBA5216";
  var ROLES = {
    nazir2026: {
      key: "nazir", nama: "Jemaah Nazir", av: "JN",
      sub: "Jemaah Nazir dan Jaminan Kualiti",
      skop: "Akses penuh · verifikasi kualiti, dokumen dan kewangan"
    },
    ppd2026: {
      key: "ppd", nama: "PPD Pitas", av: "PP",
      sub: "Pejabat Pendidikan Daerah Pitas",
      skop: "Akses daerah · enrolmen, pentadbir dan pencapaian"
    },
    sk2026: {
      key: "sekolah", nama: "Pentadbir Sekolah", av: "PS",
      sub: "Pentadbiran SK Salimpodon Darat",
      skop: "Akses dalaman · kurikulum, tenaga pengajar dan muat turun"
    }
  };
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header   = $("#siteHeader");
  var drawer   = $("#drawer");
  var scrim    = $("#scrim");
  var hamburger= $("#hamburger");
  var toTop    = $("#toTop");
  var progress = $("#progressBar");
  var toast    = $("#toast");
  var toastTxt = $("#toastText");

  var currentRoute = "utama";
  var toastTimer = null;

  /* ------------------------------------------------------------- utils -- */
  function isAuthed() {
    try { return sessionStorage.getItem(AUTH_KEY) === "granted"; } catch (e) { return false; }
  }
  function setAuthed(v) {
    try { v ? sessionStorage.setItem(AUTH_KEY, "granted") : sessionStorage.removeItem(AUTH_KEY); }
    catch (e) { /* storage blocked */ }
  }
  function currentRole() {
    try {
      var k = sessionStorage.getItem(ROLE_KEY);
      return (k && ROLES[k]) ? ROLES[k] : null;
    } catch (e) { return null; }
  }
  function setRole(pw) {
    try {
      if (pw && ROLES[pw]) sessionStorage.setItem(ROLE_KEY, pw);
      else sessionStorage.removeItem(ROLE_KEY);
    } catch (e) { /* storage blocked */ }
  }
  function showToast(msg) {
    if (!toast) return;
    toastTxt.textContent = msg;
    toast.classList.add("is-shown");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("is-shown"); }, 4000);
  }

  /* ------------------------------------------------------------ router -- */
  function parseHash() {
    var raw = (window.location.hash || "").replace(/^#\/?/, "").split("?")[0];
    if (!raw) return "utama";
    return ROUTES.indexOf(raw) > -1 ? raw : "utama";
  }

  function activate(route) {
    if (route === "dashboard" && !isAuthed()) route = "pegawai";

    $$(".view").forEach(function (v) {
      v.classList.toggle("is-active", v.getAttribute("data-view") === route);
    });
    $$("[data-nav]").forEach(function (a) {
      var on = a.getAttribute("data-nav") === route;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });

    currentRoute = route;
    document.title = TITLES[route] || TITLES.utama;
    document.body.setAttribute("data-route", route);

    closeDrawer();
    window.scrollTo({ top: 0, behavior: "auto" });

    if (route === "dashboard") applyRole();

    window.requestAnimationFrame(function () {
      updateHeader(); revealScan(); animateBars(); animateDials();
    });
  }

  function go(route) {
    if (parseHash() === route) { activate(route); return; }
    window.location.hash = "#/" + route;
  }

  /* ------------------------------------------------------------ header -- */
  function updateHeader() {
    if (!header) return;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var onHero = currentRoute === "utama" && y < 70;
    header.classList.toggle("is-solid", !onHero);
    header.classList.toggle("is-scrolled", y > 40);
    if (toTop) toTop.classList.toggle("is-shown", y > 560);
    if (progress) {
      var dh = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = dh > 0 ? Math.min(100, (y / dh) * 100) + "%" : "0%";
    }
  }

  /* ------------------------------------------------------------ drawer -- */
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    scrim.classList.add("is-open");
    hamburger.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
    });
  }
  if (scrim) scrim.addEventListener("click", closeDrawer);
  var dClose = $("#drawerClose");
  if (dClose) dClose.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeDrawer(); closeLightbox(); }
  });

  /* ------------------------------------------------------------ reveal -- */
  var revealObs = null;
  if ("IntersectionObserver" in window) {
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.10, rootMargin: "0px 0px -6% 0px" });
  }
  function revealScan() {
    $$(".reveal").forEach(function (el) {
      if (!el.closest(".view.is-active")) return;
      if (REDUCED || !revealObs) { el.classList.add("is-in"); return; }
      if (el.getBoundingClientRect().top < window.innerHeight * 0.94) { el.classList.add("is-in"); return; }
      revealObs.observe(el);
    });
  }

  /* ---------------------------------------------------------- counters -- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var plain = el.hasAttribute("data-plain");
    var fmt = function (n) { return plain ? String(n) : n.toLocaleString("ms-MY"); };
    if (REDUCED) { el.textContent = fmt(target); return; }
    var start = null, dur = 1500;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * e));
      if (p < 1) window.requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    window.requestAnimationFrame(step);
  }
  var countObs = null;
  if ("IntersectionObserver" in window) {
    countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); countObs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
  }
  function primeCounters() {
    $$("[data-count]").forEach(function (el) {
      if (el.hasAttribute("data-done")) return;
      el.setAttribute("data-done", "1");
      if (countObs) countObs.observe(el);
      else el.textContent = el.getAttribute("data-count");
    });
  }

  /* ------------------------------------------------------------ charts -- */
  function animateBars() {
    var scope = $(".view.is-active") || document;
    $$(".bar-fill", scope).forEach(function (bar) {
      var v = parseFloat(bar.getAttribute("data-bar")) || 0;
      bar.style.width = "0%";
      window.setTimeout(function () { bar.style.width = Math.max(0, Math.min(100, v)) + "%"; }, 140);
    });
  }
  function animateDials() {
    var scope = $(".view.is-active") || document;
    $$("[data-dash]", scope).forEach(function (c) {
      var len = parseFloat(c.getAttribute("data-dash")) || 0;
      c.style.strokeDasharray = "0 289";
      window.setTimeout(function () { c.style.strokeDasharray = len + " 289"; }, 220);
    });
  }

  /* ---------------------------------------------------------- lightbox -- */
  var lb = $("#lightbox"), lbImg = $("#lightboxImg"), lbCap = $("#lightboxCap"), lbVid = $("#lightboxVid");

  function openLightbox(src, alt, cap, video) {
    if (!lb) return;
    var isVid = !!video;
    /* set display explicitly as well as [hidden] — a global `img{display:block}`
       reset can otherwise win over the UA [hidden] rule and stack both elements. */
    if (lbVid) {
      lbVid.hidden = !isVid;
      lbVid.style.display = isVid ? "block" : "none";
    }
    if (lbImg) {
      lbImg.hidden = isVid;
      lbImg.style.display = isVid ? "none" : "block";
    }
    if (isVid) {
      lbVid.poster = src || "";
      if (lbVid.getAttribute("src") !== video) lbVid.src = video;
      var p = lbVid.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      if (lbVid) { lbVid.pause(); lbVid.removeAttribute("src"); }
      lbImg.src = src;
      lbImg.alt = alt || "";
    }
    lbCap.textContent = cap || "";
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lb) return;
    if (lbVid && !lbVid.hidden) {
      lbVid.pause(); lbVid.removeAttribute("src"); lbVid.load();
    }
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (lb) {
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    var lbc = $("#lightboxClose");
    if (lbc) lbc.addEventListener("click", closeLightbox);
  }

  /* delegated tile activation (works for dynamically shown tiles too) */
  document.addEventListener("click", function (e) {
    var tile = e.target.closest ? e.target.closest(".tile") : null;
    if (!tile) return;
    var img = $("img", tile);
    openLightbox(img ? img.getAttribute("src") : "",
                 img ? img.getAttribute("alt") : "",
                 tile.getAttribute("data-cap"),
                 tile.getAttribute("data-video"));
  });

  /* ----------------------------------------------------------- filters -- */
  function wireFilters(groupSel, itemSel) {
    var group = $(groupSel);
    if (!group) return;
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      $$(".chip", group).forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.getAttribute("data-filter");
      $$(itemSel).forEach(function (item) {
        item.style.display = (f === "semua" || item.getAttribute("data-cat") === f) ? "" : "none";
      });
    });
  }
  wireFilters("#galFilters", ".view[data-view='galeri'] .tile");
  wireFilters("#vidFilters", ".view[data-view='video'] .tile");
  wireFilters("#newsFilters", ".view[data-view='berita'] .news-card");

  /* ------------------------------------------------------------- gate --- */
  var gateForm = $("#gateForm");
  if (gateForm) {
    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var k = $("#gKod"), p = $("#gPass"), alertBox = $("#gateAlert");
      var ok = true;
      [k, p].forEach(function (el) {
        var bad = el.value.trim().length === 0;
        el.closest(".field").classList.toggle("has-error", bad);
        if (bad) ok = false;
      });
      if (!ok) return;

      var kodVal = k.value.trim().toUpperCase();
      var passVal = p.value;

      if (kodVal === KOD && ROLES[passVal]) {
        setAuthed(true);
        setRole(passVal);
        alertBox.classList.remove("is-shown");
        gateForm.reset();
        applyRole();
        showToast("Akses diberikan — " + ROLES[passVal].nama + ". Memuatkan dashboard…");
        go("dashboard");
      } else {
        alertBox.classList.add("is-shown");
        var card = $("#gateCard");
        card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
        $("#gateAlertText").textContent =
          "Kod sekolah atau kata laluan tidak sah. Sila semak kelayakan anda.";
      }
    });
    ["#gKod", "#gPass"].forEach(function (s) {
      var el = $(s);
      if (el) el.addEventListener("input", function () { el.closest(".field").classList.remove("has-error"); });
    });
  }

  var btnLogout = $("#btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      setAuthed(false);
      setRole(null);
      showToast("Anda telah keluar dari Portal Pegawai.");
      go("utama");
    });
  }
  var btnPrint = $("#btnPrint");
  if (btnPrint) btnPrint.addEventListener("click", function () { window.print(); });

  /* -------------------------------------------------------- dashboard --- */
  var PANEL_META = {
    data:       ["Dashboard Data Sekolah", "Statistik murid, guru, kelas dan waktu mengajar — SK Salimpodon Darat, Pitas"],
    kualiti:    ["Dokumen Kualiti", "SKPM, NKRA, Pelan Pembangunan Sekolah dan laporan lawatan Jemaah Nazir"],
    enrolmen:   ["Enrolmen & Kelas", "Senarai kelas, guru kelas dan angka enrolmen — menunggu pengesahan sekolah"],
    pentadbir:  ["Profil Pentadbir & Guru", "Struktur pentadbiran dan senarai penuh tenaga pengajar sekolah"],
    pencapaian: ["Pencapaian", "Rekod penyertaan, program dan pengiktirafan peringkat sekolah serta daerah"],
    kewangan:   ["Kewangan & Bantuan", "Peruntukan, perbelanjaan dan program bantuan murid"],
    kurikulum:  ["Agihan Kurikulum", "Agihan subjek dan bilangan waktu mengajar sesi akademik 2026"],
    muatturun:  ["Muat Turun Dokumen", "Semua dokumen rasmi dalam format PDF untuk semakan luar"]
  };

  function rolePanelKeys(roleKey) {
    return $$(".dash-panel").filter(function (p) {
      return (p.getAttribute("data-roles") || "").split(",").indexOf(roleKey) > -1;
    }).map(function (p) { return p.getAttribute("data-panel"); });
  }

  function selectPanel(key) {
    var role = currentRole();
    var keys = rolePanelKeys(role ? role.key : "nazir");
    if (keys.indexOf(key) === -1) key = keys[0] || "data";

    $$(".dash-nav button").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-panel") === key);
    });
    $$(".dash-panel").forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-panel") === key);
    });
    var meta = PANEL_META[key] || PANEL_META.data;
    var t = $("#dashTitle"), s = $("#dashSub");
    if (t) t.textContent = meta[0];
    if (s) s.textContent = meta[1];
    animateBars(); animateDials();
  }

  /* show only the nav items and panels that belong to the signed-in role */
  function applyRole() {
    var role = currentRole();
    if (!role) return;

    $$(".dash-nav button").forEach(function (b) {
      var show = (b.getAttribute("data-roles") || "").split(",").indexOf(role.key) > -1;
      b.hidden = !show;
      b.style.display = show ? "" : "none";
    });
    $$(".dash-panel").forEach(function (p) {
      if ((p.getAttribute("data-roles") || "").split(",").indexOf(role.key) === -1) {
        p.classList.remove("is-active");
      }
    });

    var rl = $("#dashRole");    if (rl) rl.textContent = role.skop;
    var av = $("#dashAvatar");  if (av) av.textContent = role.av;
    var wn = $("#dashWhoName"); if (wn) wn.textContent = role.nama;
    var ws = $("#dashWhoSub");  if (ws) ws.textContent = role.sub;

    selectPanel("data");
  }

  var dashNav = $(".dash-nav");
  if (dashNav) {
    dashNav.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-panel]");
      if (!btn || btn.hidden) return;
      selectPanel(btn.getAttribute("data-panel"));
    });
  }

  /* ----------------------------------------------------- contact form --- */
  var cForm = $("#contactForm");
  if (cForm) {
    var setErr = function (el, bad) { el.closest(".field").classList.toggle("has-error", bad); };
    cForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nama = $("#cNama"), emel = $("#cEmel"), tel = $("#cTel"), kat = $("#cKategori"), msg = $("#cMesej");
      var ok = true;

      if (nama.value.trim().length < 3) { setErr(nama, true); ok = false; } else setErr(nama, false);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emel.value.trim())) { setErr(emel, true); ok = false; } else setErr(emel, false);
      var t = tel.value.trim();
      if (t && !/^[0-9+\-\s()]{7,20}$/.test(t)) { setErr(tel, true); ok = false; } else setErr(tel, false);
      if (!kat.value) { setErr(kat, true); ok = false; } else setErr(kat, false);
      if (msg.value.trim().length < 10) { setErr(msg, true); ok = false; } else setErr(msg, false);

      if (!ok) {
        var first = cForm.querySelector(".field.has-error input,.field.has-error select,.field.has-error textarea");
        if (first) first.focus();
        showToast("Sila semak maklumat yang bertanda pada borang.");
        return;
      }
      cForm.reset();
      showToast("Terima kasih. Pertanyaan anda telah dihantar kepada pihak sekolah.");
    });
    $$("#contactForm input,#contactForm select,#contactForm textarea").forEach(function (el) {
      ["input", "change"].forEach(function (ev) {
        el.addEventListener(ev, function () { el.closest(".field").classList.remove("has-error"); });
      });
    });
  }

  /* --------------------------------------------------------------- misc -- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    });
  }
  var yr = $("#year");
  if (yr) yr.textContent = String(new Date().getFullYear());

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { updateHeader(); revealScan(); ticking = false; });
  }, { passive: true });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1080) closeDrawer();
    updateHeader();
  });

  window.addEventListener("hashchange", function () { activate(parseHash()); });

  /* --------------------------------------------------------------- boot -- */
  if (!window.location.hash) {
    try { history.replaceState(null, "", "#/utama"); } catch (e) { /* file:// */ }
  }
  primeCounters();
  activate(parseHash());
  updateHeader();
  revealScan();
})();

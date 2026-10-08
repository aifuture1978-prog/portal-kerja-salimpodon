/* ==========================================================================
   Portal Rasmi SK Bongkol Pitas — app.js
   Hash router · scroll UX · reveal animations · charts · officer portal
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var ROUTES = ["utama", "profil", "pentadbiran", "pencapaian", "berita", "galeri", "hubungi", "pegawai", "dashboard"];
  var TITLES = {
    utama: "Portal Rasmi SK Bongkol Pitas, Sabah | Seiring Melangkah Ke Hadapan",
    profil: "Profil & Sejarah Sekolah | SK Bongkol Pitas",
    pentadbiran: "Pentadbiran & Tenaga Pengajar | SK Bongkol Pitas",
    pencapaian: "Pencapaian & Pengiktirafan | SK Bongkol Pitas",
    berita: "Berita & Pengumuman | SK Bongkol Pitas",
    galeri: "Galeri Media | SK Bongkol Pitas",
    hubungi: "Hubungi Kami | SK Bongkol Pitas",
    pegawai: "Portal Pegawai — Akses Jemaah Nazir, JPN & PPD | SK Bongkol Pitas",
    dashboard: "Dashboard Pegawai | SK Bongkol Pitas"
  };
  var AUTH_KEY = "skb_officer_access";
  var CRED = { kod: "XBA5218", laluan: "nazir2026" };
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = $("#siteHeader");
  var drawer = $("#drawer");
  var scrim = $("#scrim");
  var hamburger = $("#hamburger");
  var toTop = $("#toTop");
  var progressBar = $("#progressBar");
  var toast = $("#toast");
  var toastText = $("#toastText");

  var currentRoute = "utama";
  var toastTimer = null;

  /* ---------------------------------------------------------------- utils */
  function isAuthed() {
    try { return sessionStorage.getItem(AUTH_KEY) === "granted"; } catch (e) { return false; }
  }
  function setAuthed(v) {
    try {
      if (v) { sessionStorage.setItem(AUTH_KEY, "granted"); }
      else { sessionStorage.removeItem(AUTH_KEY); }
    } catch (e) { /* storage unavailable */ }
  }

  function showToast(msg) {
    if (!toast) { return; }
    toastText.textContent = msg;
    toast.classList.add("is-shown");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("is-shown"); }, 3800);
  }

  /* --------------------------------------------------------------- router */
  function parseHash() {
    var raw = (window.location.hash || "").replace(/^#\/?/, "").split("?")[0];
    if (!raw) { return "utama"; }
    return ROUTES.indexOf(raw) > -1 ? raw : "utama";
  }

  function activate(route) {
    if (route === "dashboard" && !isAuthed()) { route = "pegawai"; }

    $$(".view").forEach(function (v) {
      v.classList.toggle("is-active", v.getAttribute("data-view") === route);
    });

    $$("[data-nav]").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-nav") === route);
      if (a.getAttribute("data-nav") === route) { a.setAttribute("aria-current", "page"); }
      else { a.removeAttribute("aria-current"); }
    });

    currentRoute = route;
    document.title = TITLES[route] || TITLES.utama;
    document.body.setAttribute("data-route", route);

    closeDrawer();
    window.scrollTo({ top: 0, behavior: "auto" });

    requestAnimationFrame(function () {
      updateHeader();
      revealScan();
      animateCharts();
    });
  }

  function go(route) {
    if (parseHash() === route) { activate(route); return; }
    window.location.hash = "#/" + route;
  }

  function onHashChange() {
    activate(parseHash());
  }

  /* --------------------------------------------------------------- header */
  function updateHeader() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var onHomeHero = currentRoute === "utama" && y < 70;
    header.classList.toggle("is-solid", !onHomeHero);
    header.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-shown", y > 520);

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docH > 0 ? Math.min(100, (y / docH) * 100) + "%" : "0%";
  }

  /* --------------------------------------------------------------- drawer */
  function openDrawer() {
    drawer.classList.add("is-open");
    scrim.classList.add("is-open");
    hamburger.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) { closeDrawer(); } else { openDrawer(); }
    });
  }
  if (scrim) { scrim.addEventListener("click", closeDrawer); }
  var drawerClose = $("#drawerClose");
  if (drawerClose) { drawerClose.addEventListener("click", closeDrawer); }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeDrawer();
      closeLightbox();
    }
  });

  /* ---------------------------------------------------- reveal animation */
  var revealObserver = null;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  }

  function revealScan() {
    $$(".reveal").forEach(function (el) {
      var inActive = el.closest(".view.is-active");
      if (!inActive) { return; }
      if (REDUCED || !revealObserver) { el.classList.add("is-in"); return; }
      var box = el.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.94) { el.classList.add("is-in"); return; }
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------- count-up */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var plain = el.hasAttribute("data-plain");
    var fmt = function (n) { return plain ? String(n) : n.toLocaleString("ms-MY"); };
    if (REDUCED) { el.textContent = fmt(target); return; }
    var start = null;
    var dur = 1500;
    function step(ts) {
      if (start === null) { start = ts; }
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) { window.requestAnimationFrame(step); }
      else { el.textContent = fmt(target); }
    }
    window.requestAnimationFrame(step);
  }

  var countObserver = null;
  if ("IntersectionObserver" in window) {
    countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          countUp(en.target);
          countObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
  }
  $$("[data-count]").forEach(function (el) {
    if (countObserver) { countObserver.observe(el); } else { el.textContent = el.getAttribute("data-count"); }
  });

  /* ------------------------------------------------------------ charts */
  function animateCharts() {
    var scope = $(".view.is-active") || document;

    $$(".bar-fill", scope).forEach(function (bar) {
      var v = parseFloat(bar.getAttribute("data-bar")) || 0;
      bar.style.width = "0%";
      window.setTimeout(function () { bar.style.width = Math.max(0, Math.min(100, v)) + "%"; }, 120);
    });

    $$("[data-dash]", scope).forEach(function (c) {
      var len = parseFloat(c.getAttribute("data-dash")) || 0;
      c.style.strokeDasharray = "0 288.9";
      window.setTimeout(function () { c.style.strokeDasharray = len + " 288.9"; }, 200);
    });
  }

  /* --------------------------------------------------------- lightbox */
  var lightbox = $("#lightbox");
  var lightboxImg = $("#lightboxImg");
  var lightboxCap = $("#lightboxCap");
  var lightboxVid = $("#lightboxVid");

  function openLightbox(src, alt, cap, video) {
    if (video && lightboxVid) {
      lightboxImg.hidden = true;
      lightboxVid.hidden = false;
      lightboxVid.poster = src;
      lightboxVid.src = video;
      var p = lightboxVid.play();
      if (p && p.catch) { p.catch(function () {}); }
    } else {
      if (lightboxVid) { lightboxVid.hidden = true; }
      lightboxImg.hidden = false;
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
    }
    lightboxCap.textContent = cap || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) { return; }
    if (lightboxVid && !lightboxVid.hidden) {
      lightboxVid.pause();
      lightboxVid.removeAttribute("src");
      lightboxVid.load();
    }
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) { closeLightbox(); }
    });
    $("#lightboxClose").addEventListener("click", closeLightbox);
    $$("#galleryGrid .tile").forEach(function (tile) {
      tile.addEventListener("click", function () {
        var img = $("img", tile);
        openLightbox(img.getAttribute("src"), img.getAttribute("alt"), tile.getAttribute("data-cap"), tile.getAttribute("data-video"));
      });
    });
  }

  /* -------------------------------------------------------- filters */
  function wireFilters(groupSelector, itemSelector, containerSelector) {
    var group = $(groupSelector);
    var container = $(containerSelector);
    if (!group || !container) { return; }
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) { return; }
      $$(".chip", group).forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.getAttribute("data-filter");
      $$(itemSelector, container).forEach(function (item) {
        var show = f === "semua" || item.getAttribute("data-cat") === f;
        item.style.display = show ? "" : "none";
      });
    });
  }
  wireFilters(".view[data-view='berita'] .filters", "article.news-card", "#newsGrid");
  wireFilters(".view[data-view='galeri'] .filters", "figure.tile", "#galleryGrid");

  /* --------------------------------------------------- officer portal */
  var gateForm = $("#gateForm");
  if (gateForm) {
    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var kodEl = $("#gKod");
      var passEl = $("#gPass");
      var alertBox = $("#gateAlert");
      var ok = true;

      [kodEl, passEl].forEach(function (el) {
        var field = el.closest(".field");
        var valid = el.value.trim().length > 0;
        field.classList.toggle("has-error", !valid);
        if (!valid) { ok = false; }
      });
      if (!ok) { return; }

      if (kodEl.value.trim().toUpperCase() === CRED.kod && passEl.value === CRED.laluan) {
        setAuthed(true);
        alertBox.classList.remove("is-shown");
        gateForm.reset();
        showToast("Akses diberikan. Memuatkan dashboard pegawai…");
        go("dashboard");
      } else {
        alertBox.classList.add("is-shown");
        var card = $("#gateCard");
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
        $("#gateAlertText").textContent = "Kod akses atau kata laluan tidak sah. Sila semak kelayakan anda.";
      }
    });

    ["#gKod", "#gPass"].forEach(function (sel) {
      var el = $(sel);
      el.addEventListener("input", function () { el.closest(".field").classList.remove("has-error"); });
    });
  }

  var btnLogout = $("#btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      setAuthed(false);
      showToast("Anda telah keluar dari Portal Pegawai.");
      go("utama");
    });
  }

  var btnPrint = $("#btnPrint");
  if (btnPrint) {
    btnPrint.addEventListener("click", function () { window.print(); });
  }

  /* ------------------------------------------------- dashboard panels */
  var PANEL_META = {
    data: ["Dashboard Data Sekolah", "Statistik murid, guru, enrolmen dan infrastruktur — Sekolah Kebangsaan Bongkol Pitas (XBA5218)"],
    kualiti: ["Dokumen Kualiti", "SKPM, NKRA, Pelan Pembangunan Sekolah dan laporan lawatan Jemaah Nazir"],
    pentadbir: ["Profil Pentadbir & Guru", "Struktur pentadbiran dan senarai tenaga pengajar sekolah"],
    pencapaian: ["Pencapaian", "Data akademik, kokurikulum dan anugerah peringkat daerah serta negeri"],
    kewangan: ["Kewangan & Bantuan", "Laporan peruntukan, sumbangan dan bantuan CSR kepada sekolah"],
    muatturun: ["Muat Turun Dokumen", "Semua dokumen rasmi dalam format PDF untuk semakan luar"]
  };

  var dashNav = $(".dash-nav");
  if (dashNav) {
    dashNav.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-panel]");
      if (!btn) { return; }
      var key = btn.getAttribute("data-panel");

      $$(".dash-nav button").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      $$(".dash-panel").forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === key);
      });

      var meta = PANEL_META[key] || PANEL_META.data;
      $("#dashTitle").textContent = meta[0];
      $("#dashSub").textContent = meta[1];

      animateCharts();
    });
  }

  /* --------------------------------------------------------- contact form */
  var contactForm = $("#contactForm");
  if (contactForm) {
    var setErr = function (el, bad) { el.closest(".field").classList.toggle("has-error", bad); };

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nama = $("#cNama"), emel = $("#cEmel"), tel = $("#cTel"), kat = $("#cKategori"), msg = $("#cMesej");
      var ok = true;

      if (nama.value.trim().length < 3) { setErr(nama, true); ok = false; } else { setErr(nama, false); }

      var emelOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emel.value.trim());
      if (!emelOk) { setErr(emel, true); ok = false; } else { setErr(emel, false); }

      var telVal = tel.value.trim();
      if (telVal && !/^[0-9+\-\s()]{7,20}$/.test(telVal)) { setErr(tel, true); ok = false; } else { setErr(tel, false); }

      if (!kat.value) { setErr(kat, true); ok = false; } else { setErr(kat, false); }

      if (msg.value.trim().length < 10) { setErr(msg, true); ok = false; } else { setErr(msg, false); }

      if (!ok) {
        var first = contactForm.querySelector(".field.has-error input, .field.has-error select, .field.has-error textarea");
        if (first) { first.focus(); }
        showToast("Sila semak maklumat yang bertanda pada borang.");
        return;
      }

      contactForm.reset();
      showToast("Terima kasih. Pertanyaan anda telah dihantar kepada pihak sekolah.");
    });

    $$("#contactForm input, #contactForm select, #contactForm textarea").forEach(function (el) {
      el.addEventListener("input", function () { el.closest(".field").classList.remove("has-error"); });
      el.addEventListener("change", function () { el.closest(".field").classList.remove("has-error"); });
    });
  }

  /* ------------------------------------------------------------- misc */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    });
  }

  var yearEl = $("#year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  var scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (scrollTicking) { return; }
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      revealScan();
      scrollTicking = false;
    });
  }, { passive: true });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1200) { closeDrawer(); }
    updateHeader();
  });

  window.addEventListener("hashchange", onHashChange);

  /* ------------------------------------------------------------- boot */
  if (!window.location.hash) {
    try { history.replaceState(null, "", "#/utama"); }
    catch (e) { /* file:// restriction — ignore */ }
  }
  activate(parseHash());
  updateHeader();
  revealScan();
})();

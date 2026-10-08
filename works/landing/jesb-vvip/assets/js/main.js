/* ============================================================
   JAZBAH ENTERPRISE SDN BHD — main.js
   Interactions, scroll choreography, JEIOP dashboard engine, i18n
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. PRELOADER
     ========================================================== */
  (function preloader() {
    var el = $('#preloader'), bar = $('#preloaderBar');
    if (!el) return;
    var p = 0;
    var tick = setInterval(function () {
      p = Math.min(100, p + Math.random() * 18 + 6);
      if (bar) bar.style.width = p + '%';
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(function () {
          el.classList.add('is-done');
          document.body.classList.remove('is-locked');
          setTimeout(function () { el.style.display = 'none'; }, 900);
        }, 260);
      }
    }, 150);
    document.body.classList.add('is-locked');
    window.addEventListener('load', function () {
      p = Math.max(p, 92);
      if (bar) bar.style.width = p + '%';
    });
  })();

  /* ==========================================================
     2. NAV — sticky, active section, mobile drawer, progress
     ========================================================== */
  (function nav() {
    var navEl = $('#nav'), burger = $('#burger'), links = $('#navLinks');
    var progress = $('#scrollProgress'), toTop = $('#toTop');
    var anchors = $$('#navLinks a');

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (navEl) navEl.classList.toggle('is-stuck', y > 40);
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      if (toTop) toTop.classList.toggle('is-on', y > 900);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('is-locked', open);
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          links.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('is-locked');
        }
      });
    }
    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    // active link via IntersectionObserver
    var sections = $$('main section[id]');
    if ('IntersectionObserver' in window && sections.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.id;
          anchors.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { io.observe(s); });
    }
  })();

  /* ==========================================================
     3. SCROLL REVEAL (staggered)
     ========================================================== */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var siblings = Array.prototype.slice.call(el.parentNode.children).filter(function (n) {
          return n.classList && n.classList.contains('reveal');
        });
        var i = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(i * 90, 540) + 'ms';
        el.classList.add('is-in');
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ==========================================================
     4. COUNTERS
     ========================================================== */
  (function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var pre = el.getAttribute('data-prefix') || '';
      var suf = el.getAttribute('data-suffix') || '';
      var dur = 1600, t0 = null;
      if (reduceMotion) { el.textContent = pre + target.toFixed(dec) + suf; return; }
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + (target * e).toFixed(dec) + suf;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target); obs.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ==========================================================
     5. TICKER — seamless duplicate
     ========================================================== */
  (function ticker() {
    var track = $('#tickerTrack');
    if (!track) return;
    track.innerHTML += track.innerHTML;
  })();

  /* ==========================================================
     6. JEIOP DASHBOARD ENGINE
     ========================================================== */
  var DASH = {
    catering: {
      kpis: [
        { l: ['Hidangan / Hari', 'Meals / Day'], v: '18,420', d: ['+4.2% vs bulan lalu', '+4.2% vs last month'], c: 'up' },
        { l: ['Kualiti Hidangan', 'Dish Quality'], v: '96.4', u: '%', d: ['Sasaran &ge; 95%', 'Target &ge; 95%'], c: 'up' },
        { l: ['Pesanan Aktif', 'Active Orders'], v: '42', d: ['3 pelantar + 1 onshore', '3 platforms + 1 onshore'], c: '' },
        { l: ['Sisihan Menu', 'Menu Deviation'], v: '1.2', u: '%', d: ['Dalam had toleransi', 'Within tolerance'], c: 'up' }
      ],
      line: { t: ['Hidangan Dihantar', 'Meals Delivered'], u: [" '000", " '000"], v: [142, 148, 151, 156, 160, 166, 169, 173, 178, 181, 184, 188] },
      bars: { v: [96, 98, 95, 99, 97, 94, 98], target: 95 },
      donut: { p: 96, c: ['Kualiti Hidangan', 'Dish Quality'] },
      feed: [
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Galley Pelantar A — 620 hidangan panas dihantar tepat masa', 'Platform A galley — 620 hot meals delivered on time'] },
        { tag: ['AUTO', 'AUTO'], cls: '', t: ['Menu esok dijana: 3 pilihan utama, 1 vegetarian, 1 rendah sodium', "Tomorrow's menu generated: 3 mains, 1 vegetarian, 1 low-sodium"] },
        { tag: ['INFO', 'INFO'], cls: '', t: ['Pesanan PETRONAS Carigali #PC-2288 disahkan', 'PETRONAS Carigali order #PC-2288 confirmed'] },
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Semakan HACCP titik kritikal 4/4 lulus', 'HACCP critical control point check 4/4 passed'] },
        { tag: ['ALERT', 'ALERT'], cls: 'alert', t: ['Permintaan ayam naik 8% — laras pesanan pembekal', 'Chicken demand up 8% — adjust supplier order'] }
      ]
    },
    inventory: {
      kpis: [
        { l: ['Tahap Stok Keseluruhan', 'Overall Stock Level'], v: '87', u: '%', d: ['11 item bawah paras', '11 items below par'], c: 'warn' },
        { l: ['Pembaziran Makanan', 'Food Waste'], v: '3.1', u: '%', d: ['&minus;30% dalam 6 bulan', '&minus;30% in 6 months'], c: 'up' },
        { l: ['Ketepatan Ramalan', 'Forecast Accuracy'], v: '92.4', u: '%', d: ['Model v4.2 (ML)', 'Model v4.2 (ML)'], c: 'up' },
        { l: ['Pesanan Auto Dijana', 'Auto Orders Raised'], v: '12', d: ['Hari ini', 'Today'], c: '' }
      ],
      line: { t: ['Pembaziran Makanan', 'Food Waste'], u: ['%', '%'], v: [4.9, 4.7, 4.4, 4.2, 3.9, 3.7, 3.5, 3.4, 3.3, 3.2, 3.15, 3.1] },
      bars: { v: [88, 84, 91, 79, 86, 93, 90], target: 85 },
      donut: { p: 87, c: ['Tahap Stok', 'Stock Level'] },
      feed: [
        { tag: ['AUTO', 'AUTO'], cls: '', t: ['Pesanan auto: 480 kg beras, 220 kg ayam — PO #8814', 'Auto order: 480 kg rice, 220 kg chicken — PO #8814'] },
        { tag: ['ALERT', 'ALERT'], cls: 'alert', t: ['Sayur segar di bawah paras — 2 hari lagi', 'Fresh produce below par — 2 days cover left'] },
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Suhu gudang sejuk 2.4&deg;C — dalam julat', 'Cold store temperature 2.4&deg;C — in range'] },
        { tag: ['INFO', 'INFO'], cls: '', t: ['Ramalan minggu depan: permintaan naik 6.2%', 'Next week forecast: demand up 6.2%'] },
        { tag: ['OK', 'OK'], cls: 'ok', t: ['FIFO dikunci — 0 item hampir luput', 'FIFO locked — 0 near-expiry items'] }
      ]
    },
    finance: {
      kpis: [
        { l: ['Kos Per Hidangan (CPM)', 'Cost Per Meal (CPM)'], v: '14.80', d: ['RM &middot; sasaran &le; RM 15.50', 'RM &middot; target &le; RM 15.50'], c: 'up' },
        { l: ['Margin Kasar', 'Gross Margin'], v: '22.6', u: '%', d: ['+1.4 pt vs suku lalu', '+1.4 pt vs last quarter'], c: 'up' },
        { l: ['Belanjawan vs Sebenar', 'Budget vs Actual'], v: '97.2', u: '%', d: ['Dalam belanjawan', 'Within budget'], c: 'up' },
        { l: ['e-Invois Dihantar', 'e-Invoices Sent'], v: '148', d: ['LHDN MyInvois &middot; 100% diterima', 'LHDN MyInvois &middot; 100% accepted'], c: '' }
      ],
      line: { t: ['Kos Per Hidangan', 'Cost Per Meal'], u: [' RM', ' RM'], v: [17.4, 17.1, 16.8, 16.5, 16.2, 15.9, 15.7, 15.4, 15.2, 15.05, 14.9, 14.8] },
      bars: { v: [98, 96, 99, 97, 95, 98, 97], target: 96 },
      donut: { p: 97, c: ['Belanjawan Dipatuhi', 'Budget Adherence'] },
      feed: [
        { tag: ['OK', 'OK'], cls: 'ok', t: ['e-Invois #INV-2291 dihantar ke LHDN — diterima', 'e-Invoice #INV-2291 submitted to LHDN — accepted'] },
        { tag: ['INFO', 'INFO'], cls: '', t: ['Harga ayam naik 3.1% — kesan CPM +RM 0.08', 'Chicken price up 3.1% — CPM impact +RM 0.08'] },
        { tag: ['AUTO', 'AUTO'], cls: '', t: ['Laporan margin bulanan dijana dan dihantar', 'Monthly margin report generated and distributed'] },
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Sebut harga #QT-447 disahkan pengurus', 'Quotation #QT-447 approved by manager'] },
        { tag: ['INFO', 'INFO'], cls: '', t: ['Kontrak PETRONAS Carigali — 78% selesai', 'PETRONAS Carigali contract — 78% delivered'] }
      ]
    },
    hse: {
      kpis: [
        { l: ['Insiden (30 Hari)', 'Incidents (30 Days)'], v: '0', d: ['LTI &middot; sifar kemalangan', 'LTI &middot; zero accidents'], c: 'up' },
        { l: ['Pematuhan ISO', 'ISO Compliance'], v: '100', u: '%', d: ['9001:2015 &middot; 45001:2018', '9001:2015 &middot; 45001:2018'], c: 'up' },
        { l: ['Audit Tertunggak', 'Pending Audits'], v: '2', d: ['NIOSH &middot; dalam proses', 'NIOSH &middot; in progress'], c: 'warn' },
        { l: ['Masa Pelaporan', 'Reporting Time'], v: '1j 48m', d: ['Sasaran &lt; 2 jam', 'Target &lt; 2 hours'], c: 'up' }
      ],
      line: { t: ['Masa Pelaporan Insiden', 'Incident Reporting Time'], u: [' jam', ' hrs'], v: [48, 42, 36, 31, 26, 21, 17, 13, 9, 5, 3, 1.8] },
      bars: { v: [100, 100, 98, 100, 100, 96, 100], target: 98 },
      donut: { p: 100, c: ['Pematuhan ISO', 'ISO Compliance'] },
      feed: [
        { tag: ['OK', 'OK'], cls: 'ok', t: ['0 insiden dilaporkan dalam 30 hari terakhir', '0 incidents reported in the last 30 days'] },
        { tag: ['INFO', 'INFO'], cls: '', t: ['Toolbox talk pagi — 386 pekerja hadir', 'Morning toolbox talk — 386 workers attended'] },
        { tag: ['AUTO', 'AUTO'], cls: '', t: ['Pembaharuan PLMS dihantar — menunggu pengesahan', 'PLMS renewal submitted — awaiting verification'] },
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Audit ISO 45001 dalaman selesai — 0 NCR kritikal', 'Internal ISO 45001 audit complete — 0 critical NCR'] },
        { tag: ['ALERT', 'ALERT'], cls: 'alert', t: ['5 sijil pekerja luput dalam 30 hari', '5 worker certificates expiring within 30 days'] }
      ]
    },
    workforce: {
      kpis: [
        { l: ['Kadar Kehadiran', 'Attendance Rate'], v: '96.2', u: '%', d: ['Termasuk offshore', 'Offshore included'], c: 'up' },
        { l: ['Pekerja Offshore Aktif', 'Active Offshore Crew'], v: '386', d: ['3 pelantar', '3 platforms'], c: '' },
        { l: ['Rotasi Minggu Ini', 'Rotations This Week'], v: '74', d: ['Krew masuk / keluar', 'Crew in / out'], c: '' },
        { l: ['Sijil Akan Luput', 'Certificates Expiring'], v: '5', d: ['30 hari akan datang', 'Next 30 days'], c: 'warn' }
      ],
      line: { t: ['Kadar Kehadiran', 'Attendance Rate'], u: ['%', '%'], v: [92.1, 92.8, 93.4, 93.9, 94.2, 94.6, 95.1, 95.3, 95.6, 95.9, 96.0, 96.2] },
      bars: { v: [96, 97, 95, 98, 96, 93, 97], target: 95 },
      donut: { p: 96, c: ['Kadar Kehadiran', 'Attendance Rate'] },
      feed: [
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Rotasi kru Pelantar B selesai — 42 pekerja bertukar', 'Platform B crew rotation complete — 42 workers changed'] },
        { tag: ['INFO', 'INFO'], cls: '', t: ['Latihan HSE: 28 pekerja menamatkan modul kerja panas', 'HSE training: 28 workers completed hot work module'] },
        { tag: ['AUTO', 'AUTO'], cls: '', t: ['Payroll offshore dikira — sedia untuk kelulusan', 'Offshore payroll computed — ready for approval'] },
        { tag: ['ALERT', 'ALERT'], cls: 'alert', t: ['2 sijil BOSIET luput bulan ini', '2 BOSIET certificates expire this month'] },
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Aplikasi mudah alih: 412 log masuk hari ini', 'Mobile app: 412 logins today'] }
      ]
    },
    logistics: {
      kpis: [
        { l: ['Penghantaran Hari Ini', 'Deliveries Today'], v: '28', d: ['4 ke pelantar', '4 to platforms'], c: '' },
        { l: ['Masa Transit Purata', 'Avg Transit Time'], v: '14j', d: ['Bangi &rarr; Sabah', 'Bangi &rarr; Sabah'], c: 'up' },
        { l: ['Rantaian Sejuk Utuh', 'Cold Chain Integrity'], v: '100', u: '%', d: ['0 sisihan suhu', '0 temperature excursions'], c: 'up' },
        { l: ['Sisihan Suhu', 'Temperature Excursions'], v: '0', d: ['30 hari terakhir', 'Last 30 days'], c: 'up' }
      ],
      line: { t: ['Masa Transit Purata', 'Average Transit Time'], u: [' jam', ' hrs'], v: [22, 21, 20, 19.5, 18, 17.5, 17, 16, 15.5, 15, 14.5, 14] },
      bars: { v: [96, 100, 98, 100, 100, 97, 100], target: 98 },
      donut: { p: 100, c: ['Rantaian Sejuk', 'Cold Chain'] },
      feed: [
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Kontena sejuk #CC-77 tiba — suhu &minus;18.2&deg;C', 'Reefer container #CC-77 arrived — &minus;18.2&deg;C'] },
        { tag: ['INFO', 'INFO'], cls: '', t: ['Vesel bekalan bertolak ke Pelantar C — ETA 14:20', 'Supply vessel departed for Platform C — ETA 14:20'] },
        { tag: ['AUTO', 'AUTO'], cls: '', t: ['Penyelenggaraan preventif dijadualkan untuk 3 unit chiller', 'Preventive maintenance scheduled for 3 chiller units'] },
        { tag: ['OK', 'OK'], cls: 'ok', t: ['Pemantauan suhu IoT: 42 penderia aktif', 'IoT temperature monitoring: 42 sensors active'] },
        { tag: ['ALERT', 'ALERT'], cls: 'alert', t: ['Cuaca: laut bergelora — laluan alternatif disediakan', 'Weather: rough seas — alternate routing prepared'] }
      ]
    }
  };

  var MONTHS = {
    ms: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  var DAYS = {
    ms: ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Aha'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  var dashState = { tab: 'catering', lang: 'ms', feedIndex: 0 };

  function smoothPath(pts) {
    if (pts.length < 2) return '';
    var d = 'M' + pts[0][0].toFixed(2) + ',' + pts[0][1].toFixed(2);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i === 0 ? 0 : i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + c1x.toFixed(2) + ',' + c1y.toFixed(2) + ' ' + c2x.toFixed(2) + ',' + c2y.toFixed(2) +
           ' ' + p2[0].toFixed(2) + ',' + p2[1].toFixed(2);
    }
    return d;
  }

  function renderLine(data) {
    var svg = $('#lineChart'); if (!svg) return;
    var W = 620, H = 200, padT = 18, padB = 22, padX = 12;
    var vals = data.v, min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = (max - min) || 1;
    var lo = min - span * 0.22, hi = max + span * 0.18;
    var pts = vals.map(function (v, i) {
      var x = padX + (W - padX * 2) * (i / (vals.length - 1));
      var y = padT + (H - padT - padB) * (1 - (v - lo) / (hi - lo));
      return [x, y];
    });

    var grid = $('#lineGrid');
    if (grid) {
      grid.innerHTML = '';
      for (var g = 0; g <= 3; g++) {
        var gy = padT + (H - padT - padB) * (g / 3);
        var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', padX); ln.setAttribute('x2', W - padX);
        ln.setAttribute('y1', gy.toFixed(1)); ln.setAttribute('y2', gy.toFixed(1));
        grid.appendChild(ln);
      }
    }

    var dLine = smoothPath(pts);
    var area = $('#lineArea'), path = $('#linePath'), dots = $('#lineDots');
    if (area) area.setAttribute('d', dLine + ' L' + (W - padX) + ',' + (H - padB) + ' L' + padX + ',' + (H - padB) + ' Z');
    if (path) {
      path.setAttribute('d', dLine);
      var len = path.getTotalLength ? path.getTotalLength() : 1200;
      path.style.transition = 'none';
      path.style.strokeDasharray = len + ' ' + len;
      path.style.strokeDashoffset = len;
      /* force reflow */
      void path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.16,1,.3,1)';
      path.style.strokeDashoffset = '0';
    }
    if (dots) {
      dots.innerHTML = '';
      pts.forEach(function (p, i) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', p[0].toFixed(2));
        c.setAttribute('cy', p[1].toFixed(2));
        c.setAttribute('r', '3.2');
        c.setAttribute('class', 'dot');
        dots.appendChild(c);
        setTimeout(function () { c.classList.add('is-on'); }, 250 + i * 55);
      });
    }
    if (area) { area.classList.remove('is-on'); setTimeout(function () { area.classList.add('is-on'); }, 420); }

    var axis = $('#lineAxis');
    if (axis) {
      var m = MONTHS[dashState.lang];
      axis.innerHTML = '';
      [0, 3, 6, 9, 11].forEach(function (i) {
        var s = document.createElement('span');
        s.textContent = m[i];
        axis.appendChild(s);
      });
    }
    var lt = $('#lineTitle'), ll = $('#lineLegend');
    if (lt) lt.textContent = data.t[langIdx()];
    if (ll) ll.innerHTML = '&#9679; ' + (dashState.lang === 'ms' ? 'Sebenar' : 'Actual') + ' <span style="color:var(--muted-2)">' + data.u[langIdx()] + '</span>';
  }

  function renderBars(bars) {
    var host = $('#bars'); if (!host) return;
    host.innerHTML = '';
    host.style.position = 'relative';
    var vals = bars.v;
    var max = Math.max.apply(null, vals.concat([bars.target]));
    var min = Math.min.apply(null, vals.concat([bars.target]));
    /* Percentages that all sit near 100 would render as identical bars against a
       zero baseline. Anchor the scale just below the lowest value so the real
       variation is visible — each bar is labelled with its true value. */
    var lo = Math.max(0, min - Math.max((max - min) * 1.9, max * 0.04));
    var span = (max - lo) || 1;
    var dl = DAYS[dashState.lang];
    vals.forEach(function (v, i) {
      var wrap = document.createElement('div');
      wrap.className = 'bar';
      var fill = document.createElement('div');
      fill.className = 'bar__fill';
      fill.setAttribute('data-v', v + '%');
      var cap = document.createElement('span');
      cap.className = 'bar__cap';
      cap.textContent = dl[i];
      wrap.appendChild(fill); wrap.appendChild(cap);
      host.appendChild(wrap);
      var h = Math.max(8, ((v - lo) / span) * 100);
      setTimeout(function () { fill.style.height = h.toFixed(1) + '%'; }, 90 + i * 80);
      wrap.title = dl[i] + ': ' + v + '%';
    });
    var tLine = document.createElement('div');
    tLine.style.cssText = 'position:absolute;left:0;right:0;bottom:' + (((bars.target - lo) / span) * 100 * 0.86 + 14).toFixed(1) + '%;' +
      'border-top:1px dashed rgba(197,165,114,.55);pointer-events:none;opacity:0;transition:opacity .6s ease .9s';
    host.appendChild(tLine);
    setTimeout(function () { tLine.style.opacity = '1'; }, 900);
  }

  function renderDonut(d) {
    var c = $('#donutValue'), pct = $('#donutPct'), cap = $('#donutCap');
    var CIRC = 314.16;
    if (c) {
      c.style.strokeDashoffset = CIRC;
      setTimeout(function () { c.style.strokeDashoffset = (CIRC * (1 - d.p / 100)).toFixed(1); }, 120);
    }
    if (pct) {
      var t0 = null, from = 0, dur = 1300;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        pct.textContent = Math.round(from + (d.p - from) * e) + '%';
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (cap) cap.textContent = d.c[langIdx()];
    var dt = $('#donutTitle');
    if (dt) dt.textContent = dashState.lang === 'ms' ? 'Metrik Pematuhan' : 'Compliance Metric';
  }

  function renderKpis(kpis) {
    var host = $('#kpis'); if (!host) return;
    host.innerHTML = '';
    kpis.forEach(function (k, i) {
      var el = document.createElement('div');
      el.className = 'kpi';
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.innerHTML =
        '<span class="kpi__label">' + k.l[langIdx()] + '</span>' +
        '<strong class="kpi__value">' + k.v + (k.u ? '<small>' + k.u + '</small>' : '') + '</strong>' +
        (k.d ? '<span class="kpi__delta ' + (k.c || '') + '">' + k.d[langIdx()] + '</span>' : '');
      host.appendChild(el);
      setTimeout(function () {
        el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1)';
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, 60 + i * 70);
    });
  }

  function pushFeed(tab, instant) {
    var host = $('#feedList'); if (!host) return;
    var pool = DASH[tab].feed;
    var item = pool[dashState.feedIndex % pool.length];
    dashState.feedIndex++;
    var now = new Date();
    var li = document.createElement('li');
    li.innerHTML = '<time>' + String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0') + '</time>' +
      '<p>' + item.t[langIdx()] + '</p>' +
      '<b class="' + item.cls + '">' + item.tag[langIdx()] + '</b>';
    if (!instant) { li.style.animation = 'feedIn .5s cubic-bezier(.16,1,.3,1) both'; }
    host.insertBefore(li, host.firstChild);
    while (host.children.length > 5) host.removeChild(host.lastChild);
  }

  function langIdx() { return dashState.lang === 'en' ? 1 : 0; }

  function renderDash(tab) {
    var d = DASH[tab]; if (!d) return;
    dashState.tab = tab;
    $$('.dash__tab').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === tab);
    });
    renderKpis(d.kpis);
    renderLine(d.line);
    renderBars(d.bars);
    renderDonut(d.donut);
    var host = $('#feedList');
    if (host) { host.innerHTML = ''; dashState.feedIndex = 0; }
    pushFeed(tab, true);
  }

  (function dashboard() {
    var nav = $('#dashNav');
    if (!nav || !$('#dash')) return;
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.dash__tab') : null;
      if (!btn) return;
      renderDash(btn.getAttribute('data-tab'));
    });

    var clock = $('#dashClock');
    function tickClock() {
      if (!clock) return;
      var d = new Date();
      var locale = dashState.lang === 'ms' ? 'ms-MY' : 'en-GB';
      clock.textContent = d.toLocaleDateString(locale, { day: '2-digit', month: 'short' }) + '  ' +
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0') + ' MYT';
    }
    tickClock(); setInterval(tickClock, 1000);

    var feedTimer = null;
    function startFeed() {
      if (feedTimer) clearInterval(feedTimer);
      feedTimer = setInterval(function () { pushFeed(dashState.tab, false); }, 3000);
    }

    renderDash('catering');
    startFeed();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (feedTimer) clearInterval(feedTimer); }
      else startFeed();
    });

    /* NLQ typewriter */
    var NLQ = {
      ms: [
        ['Berapa hidangan dihantar ke Pelantar B minggu ini?', '18,420 hidangan &middot; +4.2% vs minggu lalu'],
        ['Adakah kita dalam belanjawan bulan ini?', 'Ya &middot; 97.2% dipatuhi &middot; CPM RM 14.80'],
        ['Ada risiko HSE yang perlu perhatian?', '0 insiden &middot; 5 sijil pekerja akan luput'],
        ['Ramalan permintaan minggu depan?', 'Naik 6.2% &middot; ayam +8% &middot; beras +3%']
      ],
      en: [
        ['How many meals shipped to Platform B this week?', '18,420 meals &middot; +4.2% week on week'],
        ['Are we within budget this month?', 'Yes &middot; 97.2% adherence &middot; CPM RM 14.80'],
        ['Any HSE risks needing attention?', '0 incidents &middot; 5 worker certificates expiring'],
        ['Demand forecast for next week?', 'Up 6.2% &middot; chicken +8% &middot; rice +3%']
      ]
    };
    var nlqEl = $('#nlqText'), nlqI = 0, nlqTimer = null;
    function typeNlq() {
      if (!nlqEl) return;
      var pair = NLQ[dashState.lang][nlqI % NLQ[dashState.lang].length];
      var q = pair[0], a = pair[1];
      var i = 0, phase = 'q';
      function step() {
        if (phase === 'q') {
          nlqEl.textContent = q.slice(0, ++i);
          if (i >= q.length) { phase = 'wait'; setTimeout(function () { phase = 'a'; i = 0; step(); }, 900); return; }
          nlqTimer = setTimeout(step, 34);
        } else if (phase === 'a') {
          nlqEl.innerHTML = q + ' &nbsp;<b>&rarr; ' + a.slice(0, ++i) + '</b>';
          if (i >= a.length) { phase = 'hold'; setTimeout(function () { nlqI++; typeNlq(); }, 3600); return; }
          nlqTimer = setTimeout(step, 22);
        }
      }
      step();
    }
    if (!reduceMotion) typeNlq();
    else if (nlqEl) nlqEl.innerHTML = NLQ.ms[0][0] + ' &nbsp;<b>&rarr; ' + NLQ.ms[0][1] + '</b>';

    /* expose for language switch */
    window.__jeiop = {
      relang: function (l) { dashState.lang = l; renderDash(dashState.tab); if (nlqTimer) clearTimeout(nlqTimer); nlqI = 0; if (!reduceMotion) typeNlq(); tickClock(); }
    };
  })();

  /* ==========================================================
     7. I18N — Bahasa Malaysia (default) / English
     ========================================================== */
  var EN = {
    'nav.about': 'Profile', 'nav.founder': 'Legacy', 'nav.team': 'Leadership',
    'nav.ops': 'Operations', 'nav.tech': 'Technology', 'nav.compliance': 'Compliance',
    'nav.contact': 'Contact', 'nav.portal': 'VVIP Portal',

    'hero.badge': 'Live Operations &middot; Sabah Waters',
    'hero.eyebrow': 'Established 2003 &middot; Kota Kinabalu, Sabah',
    'hero.line1': 'JAZBAH', 'hero.line2': 'ENTERPRISE',
    'hero.sub': 'Industrial-scale offshore catering and food supply chain for the oil and gas sector &mdash; powered by discipline, guided by data.',
    'hero.cta1': 'Explore the Intelligence Platform', 'hero.cta2': 'Contact an Executive',
    'hero.s1': 'Years in Industry', 'hero.s2': 'Workforce', 'hero.s3': 'Principal Client', 'hero.s4': 'Annual Revenue',
    'hero.scroll': 'Scroll',

    'reel.1t': 'Bangi Central Kitchen', 'reel.1d': 'Large-scale food processing under full HACCP control.',
    'reel.2t': 'Platform Galley', 'reel.2d': 'Continuous hot-meal service at offshore locations.',
    'reel.3t': 'Cold Chain', 'reel.3d': 'Temperature-controlled logistics from shore to platform.',

    'about.kicker': 'Corporate Profile',
    'about.title': 'Two decades of industrial capability, built at sea.',
    'about.p1': 'Jazbah Enterprise Sdn Bhd (JESB) is a 100% Sabah Bumiputera-owned company based in Kota Kinabalu, specialising in offshore catering services and food supply for the oil and gas sector.',
    'about.p2': 'We operate catering services for PETRONAS Carigali platforms, supporting up to 1,000 workers across onshore and offshore locations &mdash; from menu planning and ingredient sourcing through to cold-chain delivery and galley service.',
    'about.p3': 'Our capability rests on a Central Kitchen in Bandar Baru Bangi, an audited supplier network, and a compliance system that never compromises on food safety or worker safety.',
    'about.pill1': '100% Sabah Bumiputera', 'about.pill2': 'Sabah Based', 'about.pill3': 'Energy Contractor',
    'about.reg': 'Malaysian Registered Entity',
    'f.name': 'Full Name', 'f.hq': 'Registered Location', 'f.alt': 'Alternative Address', 'f.ck': 'Central Kitchen',
    'f.tel': 'Telephone', 'f.fax': 'Fax', 'f.web': 'Website', 'f.staff': 'Workforce Size', 'f.rev': 'Annual Revenue',
    'f.est': 'Established', 'f.client': 'Principal Client',
    'f.staffv': '500 &ndash; 1,000 people', 'f.revv': 'RM 10 million &ndash; RM 50 million',
    'f.estv': '2003 &mdash; 23 years in the industry',

    'founder.cap': 'Founder &amp; Director', 'founder.kicker': "Founder's Message",
    'founder.q1': 'We do not simply supply food. We make sure every worker on the platform can do their job with energy, confidence and the sense of being valued.',
    'founder.q2': 'Twenty-three years at sea taught us one thing: consistency beats occasional brilliance. That is why we invest in systems, people and compliance.',
    'founder.role': 'Founder &amp; Director, Jazbah Enterprise Sdn Bhd',
    'founder.m1k': 'Alternative Name', 'founder.m2k': 'Role', 'founder.m3k': 'Sector',
    'founder.m2v': 'Founder &middot; Director &middot; Shareholder',
    'founder.m3v': 'Offshore Catering &middot; Energy Supply Chain',

    'team.kicker': 'Leadership', 'team.title': 'Senior management team',
    'team.sub': 'The individuals accountable for JESB operations, compliance, finance and growth.',
    'team.tableTitle': 'Key Management Register', 'team.tableNote': '9 positions &middot; senior management structure',
    'role.dir': 'Director', 'tag.ops': 'Operations', 'tag.fin': 'Finance', 'tag.hse': 'Safety',
    'tag.cat': 'Catering', 'tag.bd': 'Growth', 'tag.site': 'Field',

    'ops.kicker': 'Operations', 'ops.title': 'From central kitchen to platform galley',
    'ops.sub': 'Four stages of a supply chain running 24 hours a day, seven days a week.',
    'ops.g1t': 'Processing &amp; Preparation', 'ops.g1d': 'Bangi central kitchen &mdash; bulk processing under HACCP critical control points.',
    'ops.g2t': 'Cold Chain', 'ops.g2d': 'Continuous temperature monitoring from warehouse to jetty.',
    'ops.g3t': 'Galley Service', 'ops.g3d': 'Continuous hot buffet service at offshore locations.',
    'ops.g4t': 'Crew Dining Experience', 'ops.g4d': 'Nutritious menus engineered for a 12-hour shift workforce.',

    'tech.kicker': 'Technology', 'tech.title': 'Jazbah Enterprise Intelligent Operations Platform',
    'tech.sub': 'JEIOP unifies SaaS, PaaS and MaaS into a single agentic intelligence ecosystem &mdash; making offshore catering measurable, predictable and auditable.',
    'dash.sub': 'Executive Intelligence', 'dash.live': 'Live Data',
    'dash.t1': 'Catering Operations', 'dash.t2': 'Inventory Control', 'dash.t3': 'Finance',
    'dash.t4': 'HSE &amp; Compliance', 'dash.t5': 'Workforce', 'dash.t6': 'Logistics',
    'dash.trend': '12-Month Trend', 'dash.actual': 'Actual', 'dash.weekly': '7-Day Performance',
    'dash.target': 'Target', 'dash.compliance': 'Compliance Rate', 'dash.complianceCap': 'ISO Compliance',
    'dash.feedTitle': 'Live Event Feed', 'dash.feedHint': 'Refreshed every 3 seconds', 'dash.nlqBtn': 'Ask JEIOP',

    'cap.1t': 'AI-Powered Insights', 'cap.1d': 'Automatic trend analysis and operational anomaly detection.',
    'cap.2t': 'Predictive Analytics', 'cap.2d': 'Food demand, stockout and HSE risk forecasting.',
    'cap.3t': 'Natural Language Query', 'cap.3d': 'Ask in Bahasa Malaysia or English and get answers instantly.',
    'cap.4t': 'Automated Reporting', 'cap.4d': 'Daily, weekly and monthly reports generated without intervention.',
    'cap.5t': 'Mobile-First', 'cap.5d': 'Full access from a smartphone, onshore or on the platform.',

    'plat.kicker': 'Platform Architecture', 'plat.title': 'Platform modules &amp; multi-agent intelligence',
    'plat.b.saas': 'SaaS', 'plat.b.maas': 'MaaS', 'plat.b.paas': 'PaaS', 'plat.b.exec': 'Executive',
    'plat.m1t': 'Intelligent Catering Management',
    'plat.m1a': 'AI-assisted menu planning based on nutrition and preference',
    'plat.m1b': 'Inventory management with ML-based demand forecasting',
    'plat.m1c': 'Cold chain management from central kitchen to platform',
    'plat.m1d': 'Automated HACCP and ISO 22000 compliance',
    'plat.m2t': 'Offshore Workforce Logistics',
    'plat.m2a': 'Real-time worker tracking from home base to platform',
    'plat.m2b': 'Crew accommodation and rotation management',
    'plat.m2c': 'Worker document and certification compliance',
    'plat.m2d': 'Mobile application for offshore workers (iOS/Android)',
    'plat.m3t': 'HSE &amp; Compliance Intelligence',
    'plat.m3a': 'Real-time incident reporting with geo-tagging',
    'plat.m3b': 'Automated audits for ISO 9001:2015 and ISO 45001:2018',
    'plat.m3c': 'Automated PETRONAS PLMS compliance',
    'plat.m3d': 'Compliance dashboard with proactive alerts',
    'plat.m4t': 'Financial &amp; Procurement Integration',
    'plat.m4a': 'Integration with Malaysia e-Invoice system (LHDN)',
    'plat.m4b': 'API integration with PETRONAS procurement platform',
    'plat.m4c': 'Digital contract and quotation management',
    'plat.m4d': 'Cost-per-meal (CPM) and margin analytics',
    'plat.m5t': 'Executive Intelligence Dashboard',
    'plat.m5a': 'AI-Powered Insights &mdash; operational trend and anomaly analysis',
    'plat.m5b': 'Predictive Analytics &mdash; food demand, stock and HSE risk forecasting',
    'plat.m5c': 'Natural Language Query &mdash; Bahasa Malaysia / English',
    'plat.m5d': 'Automated Reporting &mdash; daily, weekly, monthly',
    'plat.m5e': 'Mobile-First &mdash; full access from a smartphone',

    'agents.title': 'Multi-agent architecture',
    'agents.sub': 'The Coordinator Agent distributes tasks to domain agents, validates findings and composes executive reports &mdash; with a full audit trail behind every decision.',
    'agents.a1': 'Research Agent', 'agents.a1d': 'Market data, ingredient prices and industry trends.',
    'agents.a2': 'Operations Agent', 'agents.a2d': 'Catering operations monitoring and optimisation advice.',
    'agents.a3': 'Compliance Agent', 'agents.a3d': 'ISO, HSE and PETRONAS compliance monitoring.',
    'agents.a4': 'Finance Agent', 'agents.a4d': 'Cost, margin and budget preparation analysis.',
    'agents.a5': 'Coordinator Agent', 'agents.a5d': 'Task distribution and executive reporting.',
    'stack.title': 'Technology stack',
    'stack.l1': 'Frontend', 'stack.l2': 'Backend', 'stack.l3': 'AI / ML', 'stack.l4': 'Cloud',
    'stack.l5': 'Integration', 'stack.l6': 'Security', 'stack.l7': 'Data', 'stack.l8': 'Operations',

    'comp.kicker': 'Clients &amp; Certifications', 'comp.title': 'Trusted, audited, compliant',
    'comp.sub': 'We operate under a strict compliance framework &mdash; from food safety through to cybersecurity.',
    'comp.l1': 'Principal Client &middot; Carigali', 'comp.l2': 'Quality', 'comp.l3': 'Occupational Safety',
    'comp.l4': 'Food Safety', 'comp.l5': 'Critical Control', 'comp.l6': 'Vendor Registration', 'comp.l7': 'Safety Audit',
    'sec.1t': 'Data Residency', 'sec.1d': 'All data stored in Malaysia &mdash; AWS ap-southeast-5.',
    'sec.2t': 'Encryption', 'sec.2d': 'AES-256 at rest, TLS 1.3 in transit.',
    'sec.3t': 'Compliance', 'sec.3d': 'PDPA Malaysia, ISO 27001 and PETRONAS cybersecurity requirements.',
    'sec.4t': 'Audit Trail', 'sec.4d': 'Complete logging of all data access and changes.',
    'sec.5t': 'Backup', 'sec.5d': 'Daily encrypted backups &middot; RTO &le; 30 minutes, RPO &le; 15 minutes.',
    'sec.6t': 'Availability', 'sec.6d': 'Targeting 99.9% uptime with 24/7 monitoring.',
    'k2.1': 'Uptime Target', 'k2.2': 'Food Waste (6 months)', 'k2.3': 'HSE Reporting Time',
    'k2.4': 'PLMS Compliance', 'k2.5': 'Positive ROI', 'k2.6': 'UAT User Satisfaction', 'k2.mo': 'months',

    'ct.kicker': 'Contact', 'ct.title': "Let's discuss your requirements",
    'ct.sub': 'Whether it is a new offshore catering tender, a vendor assessment, or a supply chain partnership &mdash; our team is ready to help.',
    'ct.hqTag': 'Head Office', 'ct.ckTag': 'Central Kitchen', 'ct.fax': 'Fax 088-750040',
    'ct.formTitle': 'Executive Enquiry',
    'ct.f1': 'Full Name', 'ct.f2': 'Organisation', 'ct.f3': 'Email', 'ct.f4': 'Telephone',
    'ct.f5': 'Purpose', 'ct.f6': 'Message',
    'ct.o1': 'Tender / Quotation', 'ct.o2': 'Vendor Assessment', 'ct.o3': 'Supply Chain Partnership',
    'ct.o4': 'Investment / Partnership', 'ct.o5': 'Other',
    'ct.submit': 'Send Enquiry',
    'ct.note': 'Your information is protected under PDPA Malaysia. We respond within one working day.',
    'ct.ok': 'Thank you. Your enquiry has been recorded &mdash; our executive team will be in touch shortly.',
    'ct.portalTitle': 'Client Portal', 'ct.portalSub': 'Exclusive access for clients, partners and contract authorities.',
    'ct.p1': 'Real-time operations &amp; compliance reporting',
    'ct.p2': 'Quotations, contracts and e-Invoices',
    'ct.p3': 'JEIOP executive dashboard',
    'ct.portalBtn': 'Enter VVIP Portal',
    'ct.modalSub': 'Restricted access for authorised clients and contract authorities.',
    'ct.pid': 'Client ID', 'ct.pcode': 'Access Code', 'ct.penter': 'Sign In',
    'ct.pfoot': 'No access yet? Contact our Business Development Manager.',

    'ft.tag': 'Offshore Catering &amp; Food Supply &middot; Kota Kinabalu, Sabah',
    'ft.rights': 'All rights reserved.',
    'ft.fine': 'Documents and visuals on this site are for design demonstration purposes.'
  };

  var BM_SNAPSHOT = {};
  var currentLang = 'ms';

  function collectI18n() {
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in BM_SNAPSHOT)) BM_SNAPSHOT[k] = el.innerHTML;
    });
  }
  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'ms';
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (lang === 'en' && EN[k] != null) el.innerHTML = EN[k];
      else if (BM_SNAPSHOT[k] != null) el.innerHTML = BM_SNAPSHOT[k];
    });
    $$('.lang__opt').forEach(function (o) {
      o.classList.toggle('is-on', o.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem('jesb-lang', lang); } catch (e) {}
  }

  collectI18n();
  var savedLang = 'ms';
  try { savedLang = localStorage.getItem('jesb-lang') || 'ms'; } catch (e) {}
  applyLang(savedLang);

  var langBtn = $('#langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var next = currentLang === 'ms' ? 'en' : 'ms';
      applyLang(next);
      if (window.__jeiop) window.__jeiop.relang(next);
    });
  }

  /* ==========================================================
     8. FORMS + MODAL
     ========================================================== */
  (function forms() {
    var form = $('#contactForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        $$('input[required]', form).forEach(function (inp) {
          var bad = !inp.value.trim() || (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value));
          inp.parentNode.classList.toggle('is-bad', bad);
          if (bad) ok = false;
        });
        if (!ok) return;
        var okEl = $('#formOk');
        if (okEl) okEl.hidden = false;
        form.reset();
      });
      form.addEventListener('input', function (e) {
        if (e.target.parentNode) e.target.parentNode.classList.remove('is-bad');
      });
    }

    var modal = $('#portalModal');
    function open() {
      if (!modal) return;
      modal.hidden = false;
      document.body.classList.add('is-locked');
      var first = $('#pId');
      if (first) setTimeout(function () { first.focus(); }, 120);
    }
    function close() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('is-locked');
      var msg = $('#portalMsg');
      if (msg) msg.hidden = true;
      var pf = $('#portalForm');
      if (pf) pf.reset();
    }
    $$('[data-open-portal]').forEach(function (b) { b.addEventListener('click', open); });
    $$('[data-close-portal]').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    var pf = $('#portalForm');
    if (pf) {
      pf.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('#portalMsg');
        if (!msg) return;
        msg.hidden = false;
        msg.textContent = currentLang === 'en'
          ? 'Demo portal only — no live authentication is connected yet.'
          : 'Portal demo sahaja — pengesahan sebenar belum disambungkan.';
      });
    }
  })();

  /* ==========================================================
     9. MISC
     ========================================================== */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* smooth anchor offset for fixed nav */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var top = t.getBoundingClientRect().top + window.pageYOffset - 78;
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });
})();

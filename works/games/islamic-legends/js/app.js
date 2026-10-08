/* ============================================================
   app.js — Islamic Legends: Kembara Ilmu Tahun 4
   Router · peta kembara · dunia · aktiviti · profil · ganjaran
   ============================================================ */
(function (global) {
  "use strict";

  var W = global.IL.WORLDS;
  var S = global.Store;
  var st = S.state;

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var nav = { view: "home", w: 0, u: 0, a: 0 };

  /* ---------------- util ---------------- */
  function icon(id, cls) { return '<svg class="ic ' + (cls || "") + '"><use href="#' + id + '"/></svg>'; }
  function esc(s) { return String(s); }
  function jw(ms, jawiTxt) {
    return '<span class="jawi-name" data-ms="' + ms.replace(/"/g, "&quot;") + '" data-jw="' + (jawiTxt || ms).replace(/"/g, "&quot;") + '">' + ms + "</span>";
  }
  function refreshJawi() {
    $$(".jawi-name").forEach(function (e) {
      e.textContent = st.jawiDisplay ? e.dataset.jw : e.dataset.ms;
      e.style.fontFamily = st.jawiDisplay ? 'var(--font-ar)' : "";
      e.style.direction = st.jawiDisplay ? "rtl" : "";
    });
  }

  /* ---------------- toast + hero ---------------- */
  var toastT;
  function toast(msg) {
    var t = $("#toast");
    t.innerHTML = icon("i-star", "ic-sm") + " <span>" + msg + "</span>";
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  var bubbleT;
  function heroSay(msg, ms) {
    var b = $("#hero-bubble");
    b.innerHTML = msg;
    b.classList.add("show");
    clearTimeout(bubbleT);
    bubbleT = setTimeout(function () { b.classList.remove("show"); }, ms || 4200);
  }

  /* ---------------- sparks ---------------- */
  function sparks(x, y, n) {
    var fx = $("#fx");
    for (var i = 0; i < (n || 18); i++) {
      var s = document.createElement("i");
      s.className = "spark";
      var ang = Math.random() * Math.PI * 2, d = 40 + Math.random() * 90;
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.setProperty("--dx", Math.cos(ang) * d + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * d - 30) + "px");
      s.style.animationDelay = (Math.random() * 0.2) + "s";
      fx.appendChild(s);
      (function (node) { setTimeout(function () { node.remove(); }, 1300); })(s);
    }
  }

  /* ---------------- modal ---------------- */
  function modal(title, bodyHtml, actions) {
    $("#modal-title").innerHTML = title;
    $("#modal-body").innerHTML = bodyHtml;
    var box = $("#modal-actions");
    box.innerHTML = "";
    (actions || []).forEach(function (a) {
      var b = document.createElement("button");
      b.className = "btn " + (a.cls || "btn-ghost");
      b.innerHTML = a.label;
      b.addEventListener("click", function () { global.Sound.play("click"); a.fn(); });
      box.appendChild(b);
    });
    $("#modal").hidden = false;
  }
  function closeModal() { $("#modal").hidden = true; }
  $("#modal-x").addEventListener("click", function () { global.Sound.play("click"); closeModal(); });
  $("#modal").addEventListener("click", function (e) { if (e.target === $("#modal")) closeModal(); });

  /* ---------------- view switch ---------------- */
  function show(view) {
    if (nav.view === view) return;
    $$(".view").forEach(function (v) { v.classList.remove("is-active"); });
    var el = $("#view-" + view);
    el.classList.add("is-active");
    nav.view = view;
    global.Sound.play("page");
    global.Sound.stop();
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {}
    $("#btn-back").hidden = (view === "home");
    $("#btn-home").hidden = (view === "home");
    renderTop();
  }
  function renderTop() {
    var t = { home: "Peta Kembara", world: W[nav.w].name, activity: "Misi", profile: "Profil Pahlawan" }[nav.view];
    if (nav.view === "activity") t = W[nav.w].units[nav.u].title;
    $("#tb-main").textContent = t;
  }

  /* ============================================================
     PETA KEMBARA
     ============================================================ */
  function totalActs() {
    var n = 0;
    W.forEach(function (w) { w.units.forEach(function (u) { n += u.activities.length; }); });
    return n;
  }
  function globalPct() {
    var t = totalActs(), d = 0;
    W.forEach(function (w) { d += S.worldInfo(w).done; });
    return t ? d / t : 0;
  }

  function smoothPath(pts) {
    if (pts.length < 2) return "";
    var d = "M" + pts[0].x + "," + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += " C" + c1x + "," + c1y + " " + c2x + "," + c2y + " " + p2.x + "," + p2.y;
    }
    return d;
  }

  var RING_C = 2 * Math.PI * 53;

  function renderHome() {
    var host = $("#map-nodes");
    host.innerHTML = "";
    var pts = [];

    W.forEach(function (world, idx) {
      var wi = S.worldInfo(world);
      var unlocked = S.worldUnlocked(W, idx);
      var node = document.createElement("button");
      node.type = "button";
      node.className = "node" + (unlocked ? "" : " locked") + (wi.complete ? " done" : "");
      node.style.left = world.x + "%";
      node.style.top = world.y + "%";
      node.style.setProperty("--c1", world.c1);
      node.style.setProperty("--c2", world.c2);
      node.style.setProperty("--glow", world.glow);
      node.setAttribute("aria-label", world.name + (unlocked ? "" : " (terkunci)"));

      var off = RING_C * (1 - wi.pct);
      var badge = wi.complete
        ? '<span class="node-badge">' + icon("i-crown") + "</span>"
        : (unlocked ? "" : '<span class="node-badge">' + icon("i-lock") + "</span>");

      node.innerHTML =
        '<span class="island">' +
        '<svg class="ring" viewBox="0 0 118 118">' +
        '<circle class="bg" cx="59" cy="59" r="53"></circle>' +
        '<circle class="fg" cx="59" cy="59" r="53" stroke-dasharray="' + RING_C + '" stroke-dashoffset="' + off + '"></circle>' +
        "</svg>" +
        '<svg class="ic" viewBox="0 0 24 24">' + world.icon + "</svg>" +
        badge +
        "</span>" +
        '<span class="node-name">' + jw(world.name, world.jawi) + "</span>" +
        '<span class="node-sub">' + wi.unitsDone + "/" + wi.units + " unit</span>";

      node.addEventListener("click", function () {
        global.Sound.play("click");
        if (!unlocked) {
          heroSay("Selesaikan sekurang-kurangnya satu unit di <b>" + W[idx - 1].name + "</b> untuk membuka dunia ini!");
          global.Sound.play("wrong");
          node.classList.add("shake");
          setTimeout(function () { node.classList.remove("shake"); }, 450);
          return;
        }
        nav.w = idx; nav.u = 0; nav.a = 0;
        renderWorld(); show("world");
      });
      host.appendChild(node);
      pts.push({ x: world.x, y: world.y });
    });

    var d = smoothPath(pts);
    var base = $("#map-trail"), done = $("#map-trail-done");
    base.setAttribute("d", d); done.setAttribute("d", d);
    setTimeout(function () {
      try {
        var len = base.getTotalLength();
        var pct = globalPct();
        done.style.strokeDasharray = (len * pct) + " " + (len + 20);
        done.style.strokeDashoffset = "0";
      } catch (e) {}
    }, 60);

    $("#hero-name").textContent = st.name;
    refreshJawi();
    renderDaily();
  }

  function renderDaily() {
    var list = $("#daily-list");
    var ds = S.dailyList();
    var d = new Date();
    $("#daily-date").textContent = d.toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long" });
    list.innerHTML = "";
    ds.forEach(function (m) {
      var row = document.createElement("div");
      row.className = "daily-item" + (m.done ? " done" : "");
      row.innerHTML =
        (m.done ? icon("i-check", "ic-sm") : icon("i-star", "ic-sm")) +
        '<span class="t">' + m.label + "</span>" +
        '<span class="bar"><i style="width:' + (m.target ? (m.got / m.target) * 100 : 0) + '%"></i></span>' +
        '<span class="rw">' + (m.done ? "+" + m.reward : m.got + "/" + m.target) + "</span>";
      list.appendChild(row);
    });
  }

  /* ============================================================
     DUNIA
     ============================================================ */
  function renderWorld() {
    var world = W[nav.w];
    var wi = S.worldInfo(world);
    var lv = S.levelName(wi.pct);

    var head = $("#world-head");
    head.style.setProperty("--c1", world.c1);
    head.style.setProperty("--c2", world.c2);
    head.innerHTML =
      '<div class="wh-inner">' +
      '<div class="wh-ic"><svg class="ic" viewBox="0 0 24 24">' + world.icon + "</svg></div>" +
      "<div>" +
      "<h2>" + jw(world.name, world.jawi) + "</h2>" +
      "<p>" + esc(world.desc) + "</p>" +
      '<div class="wh-stats">' +
      '<span class="pill">' + icon("i-crown", "ic-sm") + " Tahap: " + lv + "</span>" +
      '<span class="pill">' + icon("i-check", "ic-sm") + " " + wi.done + "/" + wi.total + " aktiviti</span>" +
      '<span class="pill">' + icon("i-star", "ic-sm") + " " + wi.unitsDone + "/" + wi.units + " unit</span>" +
      "</div></div></div>";

    var grid = $("#unit-grid");
    grid.innerHTML = "";
    world.units.forEach(function (unit, idx) {
      var ui = S.unitInfo(world, unit);
      var c = document.createElement("button");
      c.type = "button";
      c.className = "unit-card" + (ui.complete ? " done" : "");
      c.innerHTML =
        '<span class="uc-tick">' + icon("i-check") + "</span>" +
        '<div class="uc-top">' +
        '<span class="uc-num">' + (idx + 1) + "</span>" +
        '<span class="uc-title">' + jw(unit.title, unit.jawi) + "</span>" +
        "</div>" +
        '<div class="uc-desc">' + esc(unit.desc) + "</div>" +
        '<div class="uc-foot">' +
        '<span class="uc-bar"><i style="width:' + (ui.pct * 100) + '%"></i></span>' +
        '<span class="uc-tag">' + ui.done + "/" + ui.total + "</span>" +
        "</div>";
      c.addEventListener("click", function () {
        global.Sound.play("click");
        nav.u = idx;
        // mula pada aktiviti yang belum siap
        nav.a = 0;
        for (var i = 0; i < unit.activities.length; i++) {
          if (!S.isDone(world.id, unit.id, i)) { nav.a = i; break; }
        }
        renderActivity(); show("activity");
      });
      grid.appendChild(c);
    });

    renderTop();
    refreshJawi();
  }

  /* ============================================================
     AKTIVITI
     ============================================================ */
  var actApi = null;

  function renderActivity() {
    var world = W[nav.w], unit = world.units[nav.u];
    var acts = unit.activities;
    if (nav.a >= acts.length) nav.a = acts.length - 1;
    var act = acts[nav.a];

    var dots = $("#act-dots");
    dots.innerHTML = "";
    acts.forEach(function (a, i) {
      var d = document.createElement("i");
      d.className = (i === nav.a ? "on" : "") + (S.isDone(world.id, unit.id, i) ? " done" : "");
      dots.appendChild(d);
    });

    $("#act-title").innerHTML = jw(act.title, act.title);
    $("#act-instruction").textContent = act.instr || "Ikuti arahan di bawah.";

    $("#act-prev").disabled = (nav.u === 0 && nav.a === 0);
    var isLast = (nav.a === acts.length - 1);
    $("#act-next").innerHTML = isLast ? "Kembali ke Dunia " + icon("i-home") : "Seterusnya " + icon("i-next");

    actApi = {
      bump: function (m) { S.bump(m); renderDaily(); },
      speak: function (t) { if (global.Sound.isEnabled()) global.Sound.say(t); },
      finish: function () { onFinish(); }
    };
    global.Activities.render(act.type, act, $("#act-body"), actApi);
    renderTop();
    refreshJawi();
  }

  function onFinish() {
    var world = W[nav.w], unit = world.units[nav.u], act = unit.activities[nav.a];
    var first = S.markDone(world.id, unit.id, nav.a);
    var gems = 0;

    if (first) {
      gems += act.gem || 10;
      S.addGems(gems);
      if (world.id === "jawi") S.bump("jawi");
      var ui = S.unitInfo(world, unit);
      if (ui.complete) {
        S.addGems(20); gems += 20;
        S.bump("units");
      }
      var gotBadge = S.checkBadge(world);
      global.Sound.play("reward");
      updateChips();
      renderDaily();
      autoClaimDaily();

      var r = $("#modal-body").getBoundingClientRect();
      sparks(global.innerWidth / 2, global.innerHeight / 2, 26);

      var extra = [];
      if (ui.complete) extra.push("Unit ini <b>tamat sepenuhnya</b>! Bonus +20 Permata.");
      if (gotBadge) extra.push("Lencana <b>" + world.name + "</b> diperoleh! (+50 Permata)");

      setTimeout(function () {
        modal(
          "Tahniah, " + st.name + "!",
          '<div class="reward-card">' +
          '<div class="reward-gem">' + icon("i-gem") + "</div>" +
          '<div class="reward-title">+' + gems + " Permata Ilmu</div>" +
          '<div class="reward-x">' + esc(act.title) + "</div>" +
          (extra.length ? '<p style="margin-top:12px">' + extra.join("<br>") + "</p>" : "") +
          "</div>",
          [
            { label: "Aktiviti seterusnya", cls: "btn-gold", fn: function () { closeModal(); nextAct(); } },
            { label: "Kembali ke dunia", fn: function () { closeModal(); show("world"); } }
          ]
        );
        if (gotBadge) { global.Sound.play("badge"); setTimeout(function () { global.Sound.play("levelup"); }, 400); }
        heroSay(gotBadge ? "Luar biasa! Anda kini <b>Legenda " + world.name + "</b>!" : "Bagus sekali! Teruskan berusaha!");
      }, 260);
    } else {
      global.Sound.play("click");
      nextAct();
    }
  }

  function nextAct() {
    var world = W[nav.w], unit = world.units[nav.u];
    if (nav.a < unit.activities.length - 1) {
      nav.a++;
      renderActivity();
    } else {
      var idx = unit.activities.length - 1;
      if (nav.u < world.units.length - 1 && S.unitInfo(world, unit).complete) {
        nav.u++; nav.a = 0;
        renderActivity();
        toast("Unit seterusnya dibuka!");
      } else {
        renderWorld(); show("world");
      }
    }
  }

  function autoClaimDaily() {
    S.dailyList().forEach(function (m) {
      if (m.done && !m.claimed) {
        var r = S.claimDaily(m.id);
        if (r) { setTimeout(function () { toast("Misi harian selesai! +" + r + " Permata"); }, 900); }
      }
    });
    updateChips();
    renderDaily();
  }

  function updateChips() {
    $("#gem-count").textContent = st.gems;
    $("#streak-count").textContent = st.streak;
  }

  /* ============================================================
     PROFIL
     ============================================================ */
  function renderProfile() {
    var host = $("#profile-body");
    var earned = st.earned || 0;
    var lvGlobal = S.levelName(globalPct());
    var ownedNames = st.owned.map(function (id) {
      var it = global.IL.SHOP.filter(function (s) { return s.id === id; })[0];
      return it ? it.art + " " + it.name : "";
    });

    var badges = W.map(function (world) {
      var on = !!st.badges[world.id];
      var wi = S.worldInfo(world);
      return '<div class="badge ' + (on ? "on" : "off") + '">' +
        '<div class="bi"><svg class="ic" viewBox="0 0 24 24">' + world.icon + "</svg></div>" +
        '<div class="bt">' + world.name + "</div>" +
        '<div class="bs">' + (on ? "Diperoleh" : wi.done + "/" + wi.total) + "</div></div>";
    }).join("");

    var shop = global.IL.SHOP.map(function (item) {
      var owned = st.owned.indexOf(item.id) >= 0;
      var eq = st.equipped.indexOf(item.id) >= 0;
      return '<div class="shop-item ' + (owned ? "owned " : "") + (eq ? "equipped" : "") + '" data-id="' + item.id + '">' +
        '<div class="si">' + item.art + "</div>" +
        '<div class="st">' + item.name + "</div>" +
        '<div class="sd">' + item.desc + "</div>" +
        (owned
          ? '<span class="sd-tag">' + (eq ? "Dipakai" : "Pakai") + "</span>"
          : '<div class="sp">' + icon("i-gem", "ic-sm") + " " + item.cost + "</div>") +
        "</div>";
    }).join("");

    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      days.push({ k: key, v: st.week[key] || 0, l: ["A", "I", "S", "R", "K", "J", "S"][d.getDay()] });
    }
    var maxV = Math.max.apply(null, days.map(function (x) { return x.v; }).concat([1]));
    var chart = days.map(function (x) {
      return '<div class="wc"><div class="wb" style="height:' + Math.max(4, (x.v / maxV) * 70) + 'px"></div><div class="wl">' + x.l + "</div></div>";
    }).join("");

    host.innerHTML =
      '<div class="prof-hero">' +
      '<div class="prof-avatar"><svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 20.2c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6"/></svg></div>' +
      '<div class="prof-info">' +
      "<h2>" + esc(st.name) + "</h2>" +
      '<div class="lv">' + icon("i-crown", "ic-sm") + " Pahlawan " + lvGlobal + " · Api Semangat " + st.streak + " hari</div>" +
      '<div class="prof-stats">' +
      '<div class="stat"><b>' + st.gems + "</b><span>Permata ada</span></div>" +
      '<div class="stat"><b>' + earned + "</b><span>Permata dikumpul</span></div>" +
      '<div class="stat"><b>' + Object.keys(st.badges).length + "</b><span>Lencana</span></div>" +
      '<div class="stat"><b>' + Math.round(globalPct() * 100) + "%</b><span>Kembara</span></div>" +
      "</div>" +
      (ownedNames.length ? '<div style="margin-top:10px;font-size:13px;color:var(--muted)">Aksesori: ' + ownedNames.join(" · ") + "</div>" : "") +
      "</div></div>" +

      '<div class="section"><h3>' + icon("i-crown", "ic-sm") + " Lencana Dunia</h3><div class=\"grid-badges\">" + badges + "</div></div>" +

      '<div class="section"><h3>' + icon("i-chart", "ic-sm") + " Papan Pendahulu Peribadi (7 hari)</h3>" +
      '<div class="week-chart">' + chart + "</div></div>" +

      '<div class="section"><h3>' + icon("i-shop", "ic-sm") + ' Kedai Ganjaran</h3><div class="shop-grid">' + shop + '</div></div>' +

      '<div class="section"><h3>' + icon("i-help", "ic-sm") + ' Tetapan</h3>' +
      '<div class="parent-box">' +
      rowToggle("Bunyi & suara", "sound", st.sound) +
      rowToggle("Paparkan nama dalam tulisan Jawi", "jawiDisplay", st.jawiDisplay) +
      '<div class="toggle-row"><span>Mod Ibu Bapa / Guru</span>' +
      '<button class="btn btn-gold" id="btn-parent">Buka Laporan</button></div>' +
      "</div></div>";

    $$(".switch").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var k = sw.dataset.k;
        st[k] = !st[k];
        sw.classList.toggle("on", st[k]);
        S.save();
        global.Sound.play("click");
        if (k === "sound") { global.Sound.setEnabled(st.sound); syncSoundBtn(); }
        if (k === "jawiDisplay") { renderProfile(); renderHome(); }
      });
    });

    $$(".shop-item").forEach(function (it) {
      it.addEventListener("click", function () {
        var id = it.dataset.id;
        var item = global.IL.SHOP.filter(function (s) { return s.id === id; })[0];
        if (st.owned.indexOf(id) >= 0) {
          var eq = S.toggleEquip(id);
          global.Sound.play(eq ? "badge" : "tap");
          toast(eq ? item.name + " dipakai!" : item.name + " ditanggalkan");
          renderProfile();
        } else if (st.gems >= item.cost) {
          S.buy(id);
          global.Sound.play("reward");
          toast(item.name + " dibeli!");
          updateChips();
          renderProfile();
        } else {
          global.Sound.play("wrong");
          toast("Permata tidak mencukupi — perlukan " + item.cost + " lagi.");
        }
      });
    });

    $("#btn-parent").addEventListener("click", function () { global.Sound.play("click"); parentModal(); });
    renderTop();
  }

  function rowToggle(label, key, val) {
    return '<div class="toggle-row"><span>' + label + '</span><div class="switch ' + (val ? "on" : "") + '" data-k="' + key + '" role="switch" aria-checked="' + !!val + '"><i></i></div></div>';
  }

  function parentModal() {
    var rows = W.map(function (world) {
      var wi = S.worldInfo(world);
      return "<tr><td>" + world.name + "</td><td>" + wi.unitsDone + "/" + wi.units + "</td>" +
        '<td><div class="pbar"><i style="width:' + (wi.pct * 100) + '%"></i></div></td>' +
        "<td>" + Math.round(wi.pct * 100) + "%</td><td>" + (st.badges[world.id] ? "Ya" : "—") + "</td></tr>";
    }).join("");

    modal("Mod Ibu Bapa / Guru",
      '<p>Ringkasan kemajuan <b>' + esc(st.name) + "</b> setakat hari ini.</p>" +
      '<table class="parent-table"><thead><tr><th>Dunia</th><th>Unit</th><th>Kemajuan</th><th>%</th><th>Lencana</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<p style="margin-top:14px;font-size:13px;color:var(--muted)">Permata dikumpul: ' + (st.earned || 0) +
      " · Api Semangat: " + st.streak + " hari (terbaik " + st.bestStreak + ")</p>" +
      '<p style="font-size:12.5px;color:var(--muted)">Nota: Kandungan disusun mengikut DSKP Pendidikan Islam Tahun 4. Sila semak semula dengan buku teks dan guru bagi ejaan Jawi serta huraian terperinci.</p>',
      [
        { label: st.parentOpenAll ? "Kunci semula dunia" : "Buka semua dunia", fn: function () { st.parentOpenAll = !st.parentOpenAll; S.save(); renderHome(); closeModal(); toast(st.parentOpenAll ? "Semua dunia dibuka." : "Kunci dikembalikan."); } },
        { label: "Tetap semula kemajuan", cls: "btn-ghost", fn: resetConfirm },
        { label: "Tutup", cls: "btn-gold", fn: closeModal }
      ]
    );
  }

  function resetConfirm() {
    modal("Tetap semula kemajuan?",
      "<p>Semua permata, lencana, streak dan aktiviti yang telah siap akan dipadam. Tindakan ini <b>tidak boleh dibatalkan</b>.</p>",
      [
        { label: "Ya, padamkan", cls: "btn-ghost", fn: function () { S.reset(); st = S.state; closeModal(); updateChips(); renderHome(); show("home"); toast("Kemajuan telah ditetapkan semula."); } },
        { label: "Batal", cls: "btn-gold", fn: closeModal }
      ]
    );
  }

  /* ============================================================
     BANTUAN
     ============================================================ */
  function helpModal() {
    modal("Bantuan — Cara Bermain",
      '<div class="help-step"><span class="hn">1</span><p><b>Peta Kembara</b> — terdapat 7 dunia. Tekan mana-mana dunia untuk masuk.</p></div>' +
      '<div class="help-step"><span class="hn">2</span><p><b>Misi</b> — setiap dunia mempunyai beberapa unit. Tekan kad unit untuk mula.</p></div>' +
      '<div class="help-step"><span class="hn">3</span><p><b>Aktiviti</b> — jawab kuiz, padankan, susun, baca kisah, atau hafaz ayat.</p></div>' +
      '<div class="help-step"><span class="hn">4</span><p><b>Permata Ilmu</b> dikumpul setiap kali aktiviti siap. Ia boleh ditebus di Kedai Ganjaran.</p></div>' +
      '<div class="help-step"><span class="hn">5</span><p><b>Gelas</b> pada dunia yang siap menandakan lencana <b>Legenda</b> sudah diperoleh.</p></div>' +
      '<div class="help-step"><span class="hn">6</span><p>Tekan butang <b>Dengar</b> untuk mendengar arahan dengan suara.</p></div>' +
      '<div class="help-step"><span class="hn">7</span><p>Ibu bapa atau guru boleh membuka <b>Mod Ibu Bapa / Guru</b> di halaman Profil untuk melihat laporan.</p></div>' +
      '<p style="font-size:12.5px;color:var(--muted);margin-top:12px">Dunia seterusnya terbuka apabila sekurang-kurangnya satu unit di dunia sebelumnya telah tamat.</p>',
      [{ label: "Faham!", cls: "btn-gold", fn: closeModal }]
    );
  }

  function welcomeModal() {
    function mula() {
      var input = $("#inp-name");
      var v = (input && input.value ? input.value : "").trim();
      if (v) st.name = v;
      st.seenWelcome = true;
      S.save();
      closeModal();
      $("#hero-name").textContent = st.name;
      renderHome();
      show("home");
      heroSay("Bismillah! Mari kita mulakan kembara, " + st.name + "!");
    }
    modal("Selamat datang ke Kembara Ilmu!",
      "<p>Assalamu’alaikum! Saya <b>Ilmu</b>, pembantu anda dalam kembara ini. Apakah nama pahlawan anda?</p>" +
      '<label class="field"><input id="inp-name" type="text" maxlength="14" placeholder="Nama anda" value="' + esc(st.name) + '" /></label>' +
      "<p style=\"font-size:13px;color:var(--muted)\">Tujuh dunia menanti: Al-Quran, Hadis, Akidah, Ibadah, Sirah, Adab dan Jawi. Kumpulkan Permata Ilmu dan jadilah seorang <b>Legenda</b>!</p>",
      [{ label: "Mula Kembara", cls: "btn-gold", fn: mula }]
    );
    setTimeout(function () {
      var i = $("#inp-name");
      if (!i) return;
      i.focus();
      i.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); global.Sound.play("click"); mula(); } });
    }, 80);
  }

  /* ============================================================
     BINTANG (canvas)
     ============================================================ */
  function stars() {
    var cv = $("#bg-stars");
    var g = cv.getContext ? cv.getContext("2d") : null;
    if (!g) return;
    var list = [];
    function size() {
      cv.width = global.innerWidth; cv.height = global.innerHeight;
      list = [];
      var n = Math.round((cv.width * cv.height) / 12000);
      for (var i = 0; i < n; i++) {
        list.push({
          x: Math.random() * cv.width, y: Math.random() * cv.height,
          r: Math.random() * 1.5 + 0.3, a: Math.random(), s: Math.random() * 0.02 + 0.005,
          c: Math.random() < 0.15 ? "#f5c96b" : (Math.random() < 0.3 ? "#a9c4ff" : "#ffffff")
        });
      }
    }
    size();
    global.addEventListener("resize", size);
    var shoot = null;
    function loop() {
      g.clearRect(0, 0, cv.width, cv.height);
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        p.a += p.s;
        var al = 0.35 + Math.abs(Math.sin(p.a)) * 0.65;
        g.globalAlpha = al;
        g.fillStyle = p.c;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
      }
      g.globalAlpha = 1;
      if (!shoot && Math.random() < 0.004) {
        shoot = { x: Math.random() * cv.width * 0.8, y: Math.random() * cv.height * 0.4, l: 0 };
      }
      if (shoot) {
        shoot.x += 6; shoot.y += 3; shoot.l += 1;
        var grd = g.createLinearGradient(shoot.x, shoot.y, shoot.x - 90, shoot.y - 54);
        grd.addColorStop(0, "rgba(255,255,255,.9)");
        grd.addColorStop(1, "rgba(255,255,255,0)");
        g.strokeStyle = grd; g.lineWidth = 2;
        g.beginPath(); g.moveTo(shoot.x, shoot.y); g.lineTo(shoot.x - 90, shoot.y - 54); g.stroke();
        if (shoot.l > 60) shoot = null;
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ============================================================
     BUTANG & NAVIGASI
     ============================================================ */
  function syncSoundBtn() {
    var b = $("#btn-sound");
    b.innerHTML = '<svg class="ic"><use href="#' + (st.sound ? "i-sound" : "i-mute") + '"/></svg>';
    b.setAttribute("aria-label", st.sound ? "Matikan bunyi" : "Hidupkan bunyi");
  }

  $("#btn-sound").addEventListener("click", function () {
    st.sound = !st.sound;
    S.save();
    global.Sound.setEnabled(st.sound);
    syncSoundBtn();
    if (st.sound) global.Sound.play("click");
  });
  $("#btn-help").addEventListener("click", function () { global.Sound.play("click"); helpModal(); });
  $("#btn-profile").addEventListener("click", function () { global.Sound.play("click"); renderProfile(); show("profile"); });
  $("#btn-home").addEventListener("click", function () { global.Sound.play("click"); renderHome(); show("home"); });
  $("#btn-back").addEventListener("click", function () {
    global.Sound.play("click");
    if (nav.view === "activity") { renderWorld(); show("world"); }
    else if (nav.view === "world" || nav.view === "profile") { renderHome(); show("home"); }
  });
  $("#btn-speak").addEventListener("click", function () {
    var t = $("#act-instruction").textContent + ". " + $("#act-title").textContent;
    global.Sound.say(t);
  });
  $("#act-prev").addEventListener("click", function () {
    global.Sound.play("click");
    if (nav.a > 0) { nav.a--; renderActivity(); }
    else if (nav.u > 0) { nav.u--; nav.a = W[nav.w].units[nav.u].activities.length - 1; renderActivity(); }
    else { renderWorld(); show("world"); }
  });
  $("#act-next").addEventListener("click", function () {
    global.Sound.play("click");
    var unit = W[nav.w].units[nav.u];
    if (nav.a < unit.activities.length - 1) { nav.a++; renderActivity(); }
    else { renderWorld(); show("world"); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#modal").hidden) closeModal();
  });

  /* ============================================================
     MULA
     ============================================================ */
  function boot() {
    global.Sound.setEnabled(st.sound !== false);
    syncSoundBtn();
    updateChips();
    stars();

    var day = S.touchDay();
    if (day.isNew && day.streak > 1) {
      setTimeout(function () { global.Sound.play("streak"); heroSay("Api Semangat anda menyala <b>" + day.streak + " hari</b> berturut-turut!"); }, 1200);
    }
    renderHome();
    show("home");

    var total = 0; W.forEach(function (w) { total += S.worldInfo(w).done; });
    if (!st.seenWelcome) {
      setTimeout(welcomeModal, 500);
    } else {
      heroSay(total === 0
        ? "Assalamu’alaikum, " + st.name + "! Pilih satu dunia untuk memulakan kembara."
        : "Selamat kembali, " + st.name + "! Kemajuan anda " + Math.round(globalPct() * 100) + "%. Teruskan!");
    }
  }

  // buka audio selepas interaksi pertama (dasar pelayar)
  document.addEventListener("pointerdown", function once() {
    global.Sound.unlock();
    document.removeEventListener("pointerdown", once);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);

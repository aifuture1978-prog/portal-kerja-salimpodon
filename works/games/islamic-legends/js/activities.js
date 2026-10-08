/* ============================================================
   activities.js — Enjin aktiviti interaktif
   Jenis: quiz · match · sort · story · sim · recite · memorize · trace
   ============================================================ */
(function (global) {
  "use strict";

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function icon(id, cls) {
    return '<svg class="ic ' + (cls || "") + '"><use href="#' + id + '"/></svg>';
  }
  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }
  function esc(s) { return String(s); }

  var A = {};

  /* ================= KUIZ ================= */
  A.quiz = function (act, host, api) {
    var q = act.questions.slice();
    var i = 0, correct = 0;

    function render() {
      host.innerHTML = "";
      var item = q[i];
      var card = el("div", "q-card");
      card.appendChild(el("div", "q-num", "SOALAN " + (i + 1) + " / " + q.length));
      card.appendChild(el("div", "q-text" + (item.ar ? " ar" : ""), esc(item.q)));

      var opts = el("div", "q-opts");
      var keys = ["A", "B", "C", "D", "E", "F"];
      item.o.forEach(function (o, idx) {
        var b = el("button", "q-opt" + (item.ar ? " ar" : ""));
        b.type = "button";
        b.innerHTML = '<span class="k">' + keys[idx] + "</span><span>" + esc(o) + "</span>";
        b.addEventListener("click", function () {
          if (card.dataset.locked === "1") return;
          if (idx === item.a) {
            card.dataset.locked = "1";
            b.classList.add("correct");
            correct++;
            api.bump("correct");
            global.Sound.play("correct");
            var ex = el("div", "q-explain", icon("i-check", "ic-sm") + " <b>Betul!</b> " + esc(item.e || ""));
            card.appendChild(ex);
            var nx = el("button", "btn btn-gold", (i === q.length - 1 ? "Selesai" : "Soalan seterusnya") + " " + icon("i-next"));
            nx.style.marginTop = "16px";
            nx.style.width = "100%";
            nx.style.justifyContent = "center";
            nx.addEventListener("click", function () {
              i++;
              if (i >= q.length) api.finish({ correct: correct, total: q.length });
              else render();
            });
            card.appendChild(nx);
          } else {
            b.classList.add("wrong");
            b.classList.add("shake");
            global.Sound.play("wrong");
            setTimeout(function () { b.classList.remove("shake"); }, 450);
          }
        });
        opts.appendChild(b);
      });
      card.appendChild(opts);
      host.appendChild(card);
      api.speak(item.q);
    }
    render();
  };

  /* ================= PADANKAN (MATCH) ================= */
  A.match = function (act, host, api) {
    var pairs = act.pairs.slice();
    var left = shuffle(pairs.map(function (p, i) { return { i: i, t: p.l }; }));
    var right = shuffle(pairs.map(function (p, i) { return { i: i, t: p.r }; }));
    var sel = null, matched = 0;

    host.innerHTML = "";
    var head = el("div", "match-head");
    head.innerHTML = "<span>Sentuh di sini</span><span>kemudian di sini</span>";
    host.appendChild(head);
    var wrap = el("div", "match-wrap");
    var colL = el("div", "match-col"), colR = el("div", "match-col");

    function card(rec, side) {
      var c = el("button", "m-card" + (act.ar ? " ar" : ""));
      c.type = "button";
      c.innerHTML = "<span>" + esc(rec.t) + "</span>";
      c.dataset.i = rec.i; c.dataset.side = side;
      c.addEventListener("click", function () {
        if (c.classList.contains("ok")) return;
        global.Sound.play("tap");
        if (!sel) { sel = c; c.classList.add("sel"); return; }
        if (sel === c) { c.classList.remove("sel"); sel = null; return; }
        if (sel.dataset.side === side) { sel.classList.remove("sel"); sel = c; c.classList.add("sel"); return; }
        if (sel.dataset.i === c.dataset.i) {
          sel.classList.remove("sel"); sel.classList.add("ok");
          c.classList.add("ok");
          sel = null; matched++;
          global.Sound.play("correct");
          if (matched === pairs.length) api.finish();
        } else {
          sel.classList.remove("sel");
          c.classList.add("no");
          setTimeout(function () { c.classList.remove("no"); }, 420);
          global.Sound.play("wrong");
          sel = null;
        }
      });
      return c;
    }
    left.forEach(function (r) { colL.appendChild(card(r, "L")); });
    right.forEach(function (r) { colR.appendChild(card(r, "R")); });
    wrap.appendChild(colL); wrap.appendChild(colR);
    host.appendChild(wrap);
  };

  /* ================= SUSUN (SORT) ================= */
  A.sort = function (act, host, api) {
    var correct = act.items.slice();
    var order = shuffle(correct);
    var sel = null;

    host.innerHTML = "";
    var list = el("div", "sort-list");
    var tip = el("p", "trace-hint", "Sentuh dua kad berturut-turut untuk menukar kedudukannya.");
    tip.style.textAlign = "center";
    host.appendChild(tip);

    function draw() {
      list.innerHTML = "";
      order.forEach(function (t, i) {
        var it = el("button", "s-item" + (act.ar ? " ar" : ""));
        it.type = "button";
        it.innerHTML = '<span class="n">' + (i + 1) + "</span><span>" + esc(t) + "</span>";
        it.addEventListener("click", function () {
          global.Sound.play("tap");
          if (!sel) { sel = it; it.classList.add("sel"); return; }
          if (sel === it) { it.classList.remove("sel"); sel = null; return; }
          var a = parseInt(sel.querySelector(".n").textContent, 10) - 1;
          var b = i;
          sel.classList.remove("sel");
          var tmp = order[a]; order[a] = order[b]; order[b] = tmp;
          sel = null;
          clearMarks();
          draw();
        });
        list.appendChild(it);
      });
    }
    function clearMarks() {
      Array.prototype.forEach.call(list.children, function (c) { c.classList.remove("ok"); c.classList.remove("bad"); });
    }
    draw();
    host.appendChild(list);

    var btn = el("button", "btn btn-gold", "Semak Susunan");
    btn.style.margin = "16px auto 0";
    btn.style.display = "flex";
    btn.addEventListener("click", function () {
      var ok = true;
      Array.prototype.forEach.call(list.children, function (c, i) {
        c.classList.remove("ok"); c.classList.remove("bad");
        if (order[i] === correct[i]) c.classList.add("ok");
        else { c.classList.add("bad"); ok = false; }
      });
      if (ok) { global.Sound.play("correct"); api.finish(); }
      else { global.Sound.play("wrong"); btn.classList.add("shake"); setTimeout(function () { btn.classList.remove("shake"); }, 450); }
    });
    host.appendChild(btn);
  };

  /* ================= CERITA (STORY) ================= */
  A.story = function (act, host, api) {
    var i = 0;
    host.innerHTML = "";
    var box = el("div", "story");
    var scene = el("div", "story-scene");
    var nav = el("div", "story-nav");
    var prev = el("button", "btn btn-ghost", icon("i-back") + " Sebelumnya");
    var dots = el("div", "story-dots");
    var next = el("button", "btn btn-gold", "Seterusnya " + icon("i-next"));
    box.appendChild(scene); box.appendChild(nav);
    host.appendChild(box);

    function draw() {
      var s = act.scenes[i];
      scene.innerHTML =
        '<div class="story-art">' + (s.art || "📖") + "</div>" +
        '<div class="story-title">' + esc(s.t) + "</div>" +
        '<div class="story-text">' + esc(s.x) + "</div>";
      dots.innerHTML = "";
      act.scenes.forEach(function (_, k) { dots.appendChild(el("i", k === i ? "on" : "")); });
      prev.disabled = i === 0;
      next.innerHTML = (i === act.scenes.length - 1 ? "Selesai " + icon("i-check") : "Seterusnya " + icon("i-next"));
      api.speak(s.t + ". " + s.x);
    }
    prev.addEventListener("click", function () { if (i > 0) { i--; global.Sound.play("tap"); draw(); } });
    next.addEventListener("click", function () {
      global.Sound.play("click");
      if (i < act.scenes.length - 1) { i++; draw(); }
      else { api.bump("story"); api.finish(); }
    });
    nav.appendChild(prev); nav.appendChild(dots); nav.appendChild(next);
    draw();
  };

  /* ================= SIMULASI (SIM) ================= */
  A.sim = function (act, host, api) {
    var i = 0;
    host.innerHTML = "";
    var box = el("div", "sim");
    host.appendChild(box);
    function draw() {
      box.innerHTML = "";
      act.steps.forEach(function (s, k) {
        var d = el("div", "sim-step" + (k <= i ? " on" : ""));
        d.innerHTML = '<div class="sn">' + (k + 1) + "</div><div><h4>" + esc(s.t) + "</h4><p>" + esc(s.d) + "</p></div>";
        box.appendChild(d);
      });
    }
    draw();
    api.speak(act.steps[0].t + ". " + act.steps[0].d);
    var btn = el("button", "btn btn-gold", "Langkah Seterusnya");
    btn.style.margin = "16px auto 0";
    btn.style.display = "flex";
    btn.addEventListener("click", function () {
      global.Sound.play("click");
      i++;
      if (i >= act.steps.length) { api.finish(); return; }
      draw();
      api.speak(act.steps[i].t + ". " + act.steps[i].d);
    });
    host.appendChild(btn);
  };

  /* ================= BACA & DENGAR (RECITE) ================= */
  A.recite = function (act, host, api) {
    host.innerHTML = "";
    var grid = el("div", "verse-grid");
    act.verses.forEach(function (v, k) {
      var d = el("div", "verse");
      d.innerHTML =
        '<div class="v-no">AYAT ' + (k + 1) + "</div>" +
        '<div class="v-ar">' + esc(v.a) + "</div>" +
        '<div class="v-rumi">' + esc(v.r) + "</div>" +
        '<div class="v-ms">' + esc(v.m) + "</div>";
      d.addEventListener("click", function () {
        global.Sound.say(v.a, { lang: "ar" });
        d.animate([{ transform: "scale(1)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }], { duration: 320 });
      });
      grid.appendChild(d);
    });
    host.appendChild(grid);

    var tools = el("div", "v-tools");
    var bAll = el("button", "mini", icon("i-play", "ic-sm") + " Dengar semua ayat");
    bAll.addEventListener("click", function () {
      var txt = act.verses.map(function (v) { return v.a; }).join(" ");
      global.Sound.say(txt, { lang: "ar" });
    });
    var bMaksud = el("button", "mini", icon("i-speaker", "ic-sm") + " Dengar maksud");
    bMaksud.addEventListener("click", function () {
      var txt = act.verses.map(function (v, k) { return "Ayat " + (k + 1) + ": " + v.m; }).join(". ");
      global.Sound.say(txt);
    });
    var bDone = el("button", "mini on", icon("i-check", "ic-sm") + " Saya sudah membaca");
    bDone.addEventListener("click", function () { global.Sound.play("correct"); api.finish(); });
    tools.appendChild(bAll); tools.appendChild(bMaksud); tools.appendChild(bDone);
    host.appendChild(tools);
  };

  /* ================= HAFAZAN (MEMORIZE) ================= */
  A.memorize = function (act, host, api) {
    var mode = 0; // 0 tunjuk, 1 sorok rumi, 2 sorok semua
    host.innerHTML = "";
    var grid = el("div", "verse-grid");
    function draw() {
      grid.innerHTML = "";
      act.verses.forEach(function (v, k) {
        var d = el("div", "verse" + (mode >= 1 ? " hidden" : ""));
        d.innerHTML =
          '<div class="v-no">AYAT ' + (k + 1) + "</div>" +
          '<div class="v-ar">' + esc(v.a) + "</div>" +
          '<div class="v-rumi">' + esc(v.r) + "</div>" +
          '<div class="v-ms">' + esc(v.m) + "</div>";
        d.addEventListener("click", function () {
          if (mode === 2) { d.classList.remove("hidden"); global.Sound.say(v.a, { lang: "ar" }); }
          else global.Sound.say(v.a, { lang: "ar" });
        });
        grid.appendChild(d);
      });
    }
    draw();
    host.appendChild(grid);

    var tools = el("div", "v-tools");
    var modes = [
      { t: "Tunjuk Semua", i: "i-eye" },
      { t: "Sorok Rumi", i: "i-eye" },
      { t: "Sorok Semua", i: "i-eyeoff" }
    ];
    var btns = [];
    modes.forEach(function (m, k) {
      var b = el("button", "mini" + (k === 0 ? " on" : ""), icon(m.i, "ic-sm") + " " + m.t);
      b.addEventListener("click", function () {
        mode = k; draw();
        btns.forEach(function (x, j) { x.classList.toggle("on", j === k); });
        global.Sound.play("tap");
      });
      btns.push(b); tools.appendChild(b);
    });
    var bDone = el("button", "mini on", icon("i-check", "ic-sm") + " Saya sudah hafal");
    bDone.addEventListener("click", function () { global.Sound.play("correct"); api.bump("memorize"); api.finish(); });
    tools.appendChild(bDone);
    host.appendChild(tools);

    var hint = el("p", "trace-hint", "Petua: baca 3 kali sebelum tidur dan 3 kali selepas Subuh. Sentuh ayat untuk mendengarnya.");
    hint.style.textAlign = "center";
    host.appendChild(hint);
  };

  /* ================= SURIH (TRACE) ================= */
  A.trace = function (act, host, api) {
    host.innerHTML = "";
    var wrap = el("div", "trace-wrap");
    var cv = el("canvas", "trace-canvas");
    wrap.appendChild(cv);
    var hint = el("p", "trace-hint", "Baca doa “Bismillah”, kemudian surih tulisan di atas dengan jari atau tetikus.");
    wrap.appendChild(hint);
    var btn = el("button", "btn btn-gold", "Semak");
    btn.style.margin = "14px auto 0";
    btn.style.display = "flex";
    wrap.appendChild(btn);
    host.appendChild(wrap);

    var dpr = global.devicePixelRatio || 1;
    function size() {
      var r = cv.getBoundingClientRect();
      cv.width = Math.max(320, r.width) * dpr;
      cv.height = 240 * dpr;
    }
    size();
    var g = cv.getContext ? cv.getContext("2d") : null;
    if (!g) { hint.textContent = "Latihan menulis tidak disokong pada pelayar ini."; btn.disabled = true; return; }
    function paint() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, cv.width, cv.height);
      var w = cv.width / dpr;
      g.save();
      g.font = '700 64px "Traditional Arabic","Arabic Typesetting",serif';
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = "rgba(245,201,107,.30)";
      g.fillText(act.word, w / 2, 120);
      g.restore();
    }
    paint();

    var dist = 0, last = null, drawing = false;
    function pos(e) {
      var r = cv.getBoundingClientRect();
      var p = e.touches && e.touches[0] ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    }
    function start(e) { e.preventDefault(); drawing = true; last = pos(e); }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      var p = pos(e);
      if (last) {
        dist += Math.hypot(p.x - last.x, p.y - last.y);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.strokeStyle = "#f5c96b"; g.lineWidth = 7; g.lineCap = "round";
        g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke();
      }
      last = p;
    }
    function end() { drawing = false; last = null; }
    cv.addEventListener("pointerdown", start);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointerleave", end);

    btn.addEventListener("click", function () {
      if (dist > 240) { global.Sound.play("correct"); api.finish(); }
      else {
        global.Sound.play("wrong");
        hint.textContent = "Cuba lagi — surih tulisan itu dengan lebih lengkap ya!";
        btn.classList.add("shake");
        setTimeout(function () { btn.classList.remove("shake"); }, 450);
      }
    });
    global.addEventListener("resize", function () { size(); paint(); });
  };

  global.Activities = {
    render: function (type, act, host, api) {
      var fn = A[type];
      host.innerHTML = "";
      if (!fn) { host.innerHTML = '<p class="trace-hint">Aktiviti ini belum tersedia.</p>'; return; }
      fn(act, host, api);
    }
  };
})(window);

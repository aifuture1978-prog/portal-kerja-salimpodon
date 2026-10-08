/* =========================================================================
   Islamic Quest — Enjin Aplikasi
   Vanilla JS · LocalStorage · Web Audio API · tiada pelayan diperlukan
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------- Utiliti ---------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const today = () => new Date().toISOString().slice(0, 10);
  const yesterday = () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* ---------------------- Keadaan (state) ---------------------- */
  const KEY = 'islamicQuest.v1';
  const DEFAULT = {
    stars: 0,
    steps: {},          // { unitId: [indeksLangkahSelesai] }
    badges: [],         // id lencana
    owned: [],          // id item kedai
    equipped: [],       // id aksesori dipakai
    unlocked: { quran: true },
    streak: { count: 0, last: '' },
    muted: false,
    voice: false,
    parentOk: false,
    name: 'Pengembara'
  };

  let state = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      return Object.assign({}, DEFAULT, raw, {
        streak: Object.assign({}, DEFAULT.streak, raw.streak || {}),
        unlocked: Object.assign({}, DEFAULT.unlocked, raw.unlocked || {})
      });
    } catch (e) { return JSON.parse(JSON.stringify(DEFAULT)); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { }
  }

  /* ---------------------- Data ---------------------- */
  const islandById = (id) => ISLANDS.find(i => i.id === id);
  const unitOf = (uid) => {
    for (const isl of ISLANDS) {
      const u = isl.units.find(u => u.id === uid);
      if (u) return { unit: u, island: isl };
    }
    return null;
  };
  const stepCount = (uid) => (unitOf(uid) ? unitOf(uid).unit.steps.length : 0);
  const doneList = (uid) => state.steps[uid] || [];
  const unitComplete = (uid) => doneList(uid).length >= stepCount(uid);
  const islandComplete = (isl) => isl.units.every(u => unitComplete(u.id));
  const islandUnlocked = (id) => !!state.unlocked[id];
  const islandProgress = (isl) => {
    const total = isl.units.reduce((s, u) => s + u.steps.length, 0);
    const got = isl.units.reduce((s, u) => s + doneList(u.id).length, 0);
    return { got, total, pct: total ? Math.round((got / total) * 100) : 0 };
  };
  const totalPossibleStars = () => ISLANDS.reduce((s, i) => s + i.units.reduce((x, u) => x + u.steps.length, 0), 0);

  /* ---------------------- Audio (Web Audio API) ---------------------- */
  const Audio2 = {
    ctx: null,
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone(freq, t0, dur, type, vol) {
      if (state.muted) return;
      const ctx = this.ensure(); if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.18, ctx.currentTime + t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur + 0.05);
    },
    click() { this.tone(660, 0, 0.09, 'triangle', 0.13); },
    correct() { [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.09, 0.16, 'sine', 0.16)); },
    wrong() { this.tone(300, 0, 0.14, 'sawtooth', 0.1); this.tone(200, 0.14, 0.18, 'sawtooth', 0.09); },
    star() { [659, 880, 1046, 1318].forEach((f, i) => this.tone(f, i * 0.07, 0.2, 'sine', 0.15)); },
    badge() { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, i * 0.11, 0.3, 'triangle', 0.16)); },
    unlock() { [392, 523, 659].forEach((f, i) => this.tone(f, i * 0.13, 0.3, 'sine', 0.15)); }
  };

  function speak(text) {
    if (state.muted || !state.voice) return;
    if (!('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ms-MY'; u.rate = 0.9;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { }
  }

  /* ---------------------- Kesan visual ---------------------- */
  function toast(msg, ms) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(t._tm);
    t._tm = setTimeout(() => { t.hidden = true; }, ms || 2200);
  }
  function confetti(n) {
    const layer = $('#confetti');
    const colors = ['#f59e0b', '#22c55e', '#2563eb', '#db2777', '#7c3aed', '#fde047'];
    for (let i = 0; i < (n || 40); i++) {
      const d = document.createElement('div');
      d.className = 'confetti';
      d.style.left = Math.random() * 100 + 'vw';
      d.style.top = '-20px';
      d.style.background = pick(colors);
      d.style.animationDuration = (1.4 + Math.random() * 1.2) + 's';
      d.style.animationDelay = (Math.random() * 0.4) + 's';
      layer.appendChild(d);
      setTimeout(() => d.remove(), 3200);
    }
  }
  let bubbleTimer;
  function mascotSay(text, ms) {
    const b = $('#bubble');
    b.textContent = text;
    b.hidden = false;
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { b.hidden = true; }, ms || 6000);
    speak(text);
  }

  /* ---------------------- Laluan (routing) ---------------------- */
  let route = { name: 'home', island: null, unit: null, step: 0 };

  function go(name, opts) {
    route = Object.assign({ name: name, island: null, unit: null, step: 0 }, opts || {});
    window.scrollTo(0, 0);
    render();
  }

  /* ---------------------- Maskot & aksesori ---------------------- */
  function applyAccessories() {
    SHOP_ITEMS.forEach(it => {
      const g = document.getElementById(it.acc);
      if (g) g.hidden = !state.equipped.includes(it.id);
    });
  }

  /* ============================================================
     LANGKAH-LANGKAH AKTIVITI
     Setiap renderer memulangkan {html, bind(root, done)}
     ============================================================ */
  const Renderers = {

    /* ---- 1. Kad maklumat ---- */
    info(s) {
      let h = '<div class="step-ico">' + (s.icon || '📘') + '</div>';
      h += '<h3 style="text-align:center">' + s.title + '</h3>';
      h += '<p>' + s.text + '</p>';
      if (s.ar) {
        h += '<div class="arabic-box"><div class="arabic">' + s.ar.t + '</div>' +
          '<div class="meaning" style="margin-top:10px"><em>' + s.ar.r + '</em></div></div>';
      }
      if (s.meaning) h += '<div class="hint" style="text-align:center;font-weight:700;color:#1f2937">' + s.meaning + '</div>';
      if (s.bullets) {
        h += '<ul class="bullets">' + s.bullets.map(b =>
          '<li><span style="font-size:20px">' + b.i + '</span><span>' + b.t + '</span></li>').join('') + '</ul>';
      }
      h += '<div class="player-foot"><span></span>' +
        '<button class="btn btn-primary btn-lg" data-act="done" aria-label="Saya faham, teruskan">Faham! Teruskan ➜</button></div>';
      return {
        html: h,
        bind(root, done) { $('[data-act=done]', root).onclick = done; }
      };
    },

    /* ---- 2. Dedah ayat (tilawah / hafazan) ---- */
    reveal(s) {
      let h = '<div class="step-ico">📖</div><h3 style="text-align:center">' + s.title + '</h3>';
      h += '<p class="order-tip">' + s.subtitle + '</p>';
      h += '<div class="flip-grid">' + s.lines.map((l, i) =>
        '<button class="flip" data-i="' + i + '" aria-expanded="false">' +
        '<div class="arabic ar" style="font-size:28px;line-height:1.9">' + l.ar + '</div>' +
        '<div class="my" hidden>' + l.my + '</div>' +
        '<div class="tap">Sentuh untuk lihat maksud</div></button>').join('') + '</div>';
      h += '<div class="player-foot"><span></span>' +
        '<button class="btn btn-primary btn-lg" data-act="done">' + s.done + ' ➜</button></div>';
      return {
        html: h,
        bind(root, done) {
          $$('.flip', root).forEach(btn => {
            btn.onclick = () => {
              const i = +btn.dataset.i;
              const my = $('.my', btn), tap = $('.tap', btn);
              my.hidden = !my.hidden;
              tap.hidden = !my.hidden;
              btn.classList.toggle('open', !my.hidden);
              btn.setAttribute('aria-expanded', String(!my.hidden));
              Audio2.click();
              if (!my.hidden) speak(s.lines[i].ar ? s.lines[i].my : s.lines[i].my);
            };
          });
          $('[data-act=done]', root).onclick = done;
        }
      };
    },

    /* ---- 3. Kuiz ---- */
    quiz(s) {
      const letters = ['A', 'B', 'C', 'D'];
      let h = '<div class="step-ico">' + (s.icon || '❓') + '</div>';
      h += '<p class="q-text">' + s.q + '</p>';
      h += '<div class="opts">' + s.options.map((o, i) =>
        '<button class="opt" data-i="' + i + '"><span class="ltr">' + letters[i] + '</span><span>' + o.t + '</span></button>'
      ).join('') + '</div>';
      h += '<div class="feedback" id="fb"></div>';
      h += '<div class="player-foot"><span></span>' +
        '<button class="btn btn-primary btn-lg" data-act="done" disabled>Selesai ➜</button></div>';
      return {
        html: h,
        bind(root, done) {
          const fb = $('#fb', root);
          const next = $('[data-act=done]', root);
          $$('.opt', root).forEach(btn => {
            btn.onclick = () => {
              const i = +btn.dataset.i;
              const o = s.options[i];
              if (o.ok) {
                btn.classList.add('correct');
                $$('.opt', root).forEach(b => b.disabled = true);
                fb.className = 'feedback show ok';
                fb.textContent = '✅ ' + (s.why || pick(PRAISE));
                Audio2.correct(); mascotSay(pick(PRAISE)); confetti(18);
                next.disabled = false;
              } else {
                btn.classList.add('wrong'); btn.classList.add('shake');
                setTimeout(() => btn.classList.remove('shake'), 420);
                fb.className = 'feedback show no';
                fb.textContent = '❌ ' + (o.why || pick(ENCOURAGE));
                Audio2.wrong();
                setTimeout(() => { btn.classList.remove('wrong'); fb.classList.remove('show'); }, 2600);
              }
            };
          });
          next.onclick = done;
        }
      };
    },

    /* ---- 4. Susun langkah / ayat ---- */
    order(s) {
      let h = '<div class="step-ico">🧩</div><h3 style="text-align:center">' + s.title + '</h3>';
      h += '<p class="order-tip">' + s.prompt + '</p>';
      h += '<div class="slots">' + s.items.map((_, i) =>
        '<div class="slot" data-slot="' + i + '"><span class="num">' + (i + 1) + '</span><span class="txt">—</span></div>'
      ).join('') + '</div>';
      h += '<div class="bank">' + shuffle(s.items).map(it =>
        '<button class="mbtn" data-id="' + it.id + '">' +
        (it.jawi ? '<span class="jawi" style="font-size:22px">' + it.jawi + '</span>' : it.t) + '</button>'
      ).join('') + '</div>';
      if (s.tip) h += '<p class="order-tip">💡 ' + s.tip + '</p>';
      h += '<div class="feedback" id="fb"></div>';
      h += '<div class="player-foot">' +
        '<button class="btn btn-ghost" data-act="reset">🔄 Cuba lain</button>' +
        '<button class="btn btn-primary btn-lg" data-act="check" disabled>Semak ➜</button></div>';
      return {
        html: h,
        bind(root, done) {
          const slots = $$('.slot', root);
          const fb = $('#fb', root);
          const check = $('[data-act=check]', root);
          const itemById = (id) => s.items.find(x => x.id === id);
          let placed = [];

          function paint() {
            slots.forEach((sl, i) => {
              const id = placed[i];
              const txt = $('.txt', sl);
              sl.classList.toggle('filled', !!id);
              if (id) {
                const it = itemById(id);
                txt.innerHTML = it.jawi
                  ? '<span class="jawi" style="font-size:22px">' + it.jawi + '</span>'
                  : (it.t || '');
              } else txt.innerHTML = '—';
            });
            $$('.bank .mbtn', root).forEach(b => b.hidden = placed.includes(b.dataset.id));
            check.disabled = placed.length !== s.items.length;
          }
          function reset() {
            placed = [];
            slots.forEach(sl => sl.classList.remove('good', 'bad'));
            fb.classList.remove('show');
            paint();
          }
          $$('.bank .mbtn', root).forEach(b => {
            b.onclick = () => {
              if (placed.length >= s.items.length) return;
              placed.push(b.dataset.id);
              Audio2.click();
              paint();
            };
          });
          slots.forEach((sl, i) => {
            sl.onclick = () => {
              const id = placed[i];
              if (!id) return;
              if (sl.classList.contains('good')) return;
              placed.splice(i, 1);
              Audio2.click();
              paint();
            };
          });
          $('[data-act=reset]', root).onclick = () => { reset(); Audio2.click(); };
          check.onclick = () => {
            const ok = placed.every((id, i) => id === s.correct[i]);
            slots.forEach((sl, i) => {
              sl.classList.remove('good', 'bad');
              sl.classList.add(placed[i] === s.correct[i] ? 'good' : 'bad');
            });
            if (ok) {
              fb.className = 'feedback show ok';
              fb.textContent = '✅ ' + pick(PRAISE) + ' Susunannya betul!';
              Audio2.correct(); confetti(20); mascotSay(pick(PRAISE));
              $$('.bank .mbtn', root).forEach(b => b.disabled = true);
              setTimeout(done, 1400);
            } else {
              fb.className = 'feedback show no';
              fb.textContent = '❌ Belum tepat. Semak semula nombor yang berwarna merah.';
              Audio2.wrong();
              setTimeout(() => {
                slots.forEach(sl => sl.classList.remove('bad'));
                fb.classList.remove('show');
              }, 2000);
            }
          };
          paint();
        }
      };
    },

    /* ---- 5. Padankan ---- */
    match(s) {
      let h = '<div class="step-ico">🔗</div><h3 style="text-align:center">' + s.title + '</h3>';
      h += '<p class="order-tip">' + s.prompt + '</p>';
      const left = shuffle(s.pairs);
      const right = shuffle(s.pairs);
      h += '<div class="match-wrap"><div class="match-col">' +
        '<div class="col-title">' + s.aLabel + '</div>' +
        left.map((p, i) => '<button class="mbtn" data-side="L" data-k="' + encodeURIComponent(p.a) + '">' +
          (p.ar ? '<span class="arabic" style="font-size:22px">' + p.a + '</span>' :
            p.jawi ? '<span class="jawi" style="font-size:24px">' + p.a + '</span>' : p.a) +
          '</button>').join('') +
        '</div><div class="match-col">' +
        '<div class="col-title">' + s.bLabel + '</div>' +
        right.map(p => '<button class="mbtn" data-side="R" data-k="' + encodeURIComponent(p.b) + '">' + p.b + '</button>').join('') +
        '</div></div>';
      h += '<div class="feedback" id="fb"></div>';
      h += '<div class="player-foot"><span></span>' +
        '<button class="btn btn-primary btn-lg" data-act="done" disabled>Selesai ➜</button></div>';
      return {
        html: h,
        bind(root, done) {
          const fb = $('#fb', root);
          const next = $('[data-act=done]', root);
          let sel = null, matched = 0;
          const btnOf = (k) => $$('.mbtn', root).filter(b => b.dataset.k === k);
          $$('.mbtn', root).forEach(b => {
            b.onclick = () => {
              if (b.disabled) return;
              if (sel && sel !== b) {
                if (sel.dataset.side === b.dataset.side) { sel.classList.remove('sel'); sel = b; b.classList.add('sel'); return; }
                const isPair = s.pairs.some(p =>
                  (encodeURIComponent(p.a) === sel.dataset.k && encodeURIComponent(p.b) === b.dataset.k));
                if (isPair) {
                  btnOf(sel.dataset.k).forEach(x => { x.classList.add('good'); x.disabled = true; x.classList.remove('sel'); });
                  btnOf(b.dataset.k).forEach(x => { x.classList.add('good'); x.disabled = true; });
                  matched++; Audio2.correct();
                  fb.className = 'feedback show ok'; fb.textContent = '✅ Padan! ' + pick(PRAISE);
                  if (matched === s.pairs.length) {
                    confetti(24); mascotSay(pick(PRAISE));
                    fb.textContent = '✅ Semua pasangan betul. Hebat!';
                    next.disabled = false;
                  }
                  sel = null;
                } else {
                  Audio2.wrong();
                  fb.className = 'feedback show no'; fb.textContent = '❌ Bukan pasangannya. Cuba lagi!';
                  sel.classList.remove('sel'); b.classList.add('shake');
                  setTimeout(() => b.classList.remove('shake'), 420);
                  setTimeout(() => fb.classList.remove('show'), 2000);
                  sel = null;
                }
              } else {
                sel = b; b.classList.add('sel'); Audio2.click();
              }
            };
          });
          next.onclick = done;
        }
      };
    },

    /* ---- 6. Cerita bergambar ---- */
    story(s) {
      let h = '<h3 style="text-align:center">' + s.title + '</h3>';
      h += '<div class="card story" style="box-shadow:none;border:none;padding:0">';
      h += '<div class="story-art" id="art">' + s.slides[0].icon + '</div>';
      h += '<h3 id="st" style="text-align:center">' + s.slides[0].title + '</h3>';
      h += '<p id="sx" style="text-align:center">' + s.slides[0].text + '</p>';
      h += '<div class="story-dots">' + s.slides.map((_, i) =>
        '<span class="dot' + (i === 0 ? ' now' : '') + '" data-d="' + i + '"></span>').join('') + '</div>';
      h += '</div>';
      h += '<div class="player-foot">' +
        '<button class="btn btn-ghost" id="prev" disabled>◀ Sebelum</button>' +
        '<button class="btn btn-primary btn-lg" id="nxt">Seterusnya ➜</button></div>';
      return {
        html: h,
        bind(root, done) {
          let i = 0;
          const art = $('#art', root), st = $('#st', root), sx = $('#sx', root);
          const prev = $('#prev', root), nxt = $('#nxt', root);
          const dots = $$('.dot', root);
          function show() {
            const sl = s.slides[i];
            art.textContent = sl.icon; st.textContent = sl.title; sx.textContent = sl.text;
            prev.disabled = i === 0;
            nxt.textContent = (i === s.slides.length - 1) ? 'Selesai ➜' : 'Seterusnya ➜';
            dots.forEach((d, k) => { d.classList.toggle('now', k === i); d.classList.toggle('done', k < i); });
            speak(sl.title + '. ' + sl.text);
          }
          prev.onclick = () => { if (i > 0) { i--; show(); Audio2.click(); } };
          nxt.onclick = () => {
            Audio2.click();
            if (i < s.slides.length - 1) { i++; show(); } else done();
          };
          show();
        }
      };
    },

    /* ---- 7. Rakam bacaan (hafazan) ---- */
    record(s) {
      let h = '<div class="step-ico">🎤</div><h3 style="text-align:center">' + s.title + '</h3>';
      h += '<p class="order-tip">' + s.prompt + '</p>';
      h += '<div class="arabic-box">' + s.lines.map(l =>
        '<div class="arabic">' + l + '</div>').join('') + '</div>';
      const canRec = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
      if (canRec) {
        h += '<div class="rec-box">' +
          '<button class="rec-btn" id="rec" aria-label="Rakam bacaan">🎤</button>' +
          '<div class="rec-status" id="rst">Tekan butang untuk mula merakam</div>' +
          '<audio id="play" controls style="width:100%;max-width:420px"></audio>' +
          '<button class="btn btn-primary btn-lg" id="ok" disabled>Selesai ➜</button>' +
          '</div>';
      } else {
        h += '<div class="hint">Mikrofon tidak tersedia pada peranti ini. Baca dengan kuat, kemudian tandakan setiap bacaan.</div>';
        h += '<div class="checks">' + [1, 2, 3].map(n =>
          '<button class="check" data-n="' + n + '"><span>▢</span><span>Baca kali ke-' + n + '</span></button>').join('') +
          '</div>';
        h += '<div class="player-foot"><span></span>' +
          '<button class="btn btn-primary btn-lg" id="ok" disabled>Selesai ➜</button></div>';
      }
      return {
        html: h,
        bind(root, done) {
          if (!canRec) {
            let hit = 0;
            $$('.check', root).forEach(b => {
              b.onclick = () => {
                if (b.classList.contains('on')) return;
                b.classList.add('on');
                $('span', b).textContent = '✅';
                hit++; Audio2.click();
                if (hit === 3) { $('#ok', root).disabled = false; mascotSay(pick(PRAISE)); }
              };
            });
            $('#ok', root).onclick = done;
            return;
          }
          const btn = $('#rec', root), rst = $('#rst', root), au = $('#play', root), ok = $('#ok', root);
          let mr = null, chunks = [], recording = false;
          btn.onclick = async () => {
            try {
              if (!recording) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mr = new MediaRecorder(stream);
                chunks = [];
                mr.ondataavailable = e => chunks.push(e.data);
                mr.onstop = () => {
                  const blob = new Blob(chunks, { type: 'audio/webm' });
                  au.src = URL.createObjectURL(blob);
                  ok.disabled = false;
                  rst.textContent = 'Rakaman sedia! Tekan main untuk mendengar.';
                  mascotSay('Bagus! Dengar semula bacaan kamu.');
                };
                mr.start();
                recording = true;
                btn.classList.add('recording'); btn.textContent = '⏹';
                rst.textContent = 'Sedang merakam... baca dengan lancar.';
                Audio2.click();
              } else {
                mr.stop(); recording = false;
                btn.classList.remove('recording'); btn.textContent = '🎤';
                Audio2.star();
              }
            } catch (e) {
              rst.textContent = 'Mikrofon tidak dibenarkan. Baca dengan kuat ya!';
              ok.disabled = false;
            }
          };
          ok.onclick = done;
        }
      };
    }
  };

  /* ============================================================
     GAMIFIKASI: bintang, lencana, streak
     ============================================================ */
  function awardBadge(id, name, icon) {
    if (state.badges.includes(id)) return false;
    state.badges.push(id);
    save();
    Audio2.badge();
    confetti(60);
    openModal('🎉 Tahniah! Lencana Baru',
      '<div class="reward"><div class="rico">' + icon + '</div><h2>' + name + '</h2>' +
      '<p>Kamu telah berjaya! Teruskan pengembaraan ilmu kamu.</p></div>' +
      '<div class="player-foot" style="justify-content:center"><button class="btn btn-primary btn-lg" data-close="1">Teruskan ➜</button></div>');
    return true;
  }

  function unlockNext(islandId) {
    const idx = ISLANDS.findIndex(i => i.id === islandId);
    const nxt = ISLANDS[idx + 1];
    if (nxt && !state.unlocked[nxt.id]) {
      state.unlocked[nxt.id] = true;
      save();
      setTimeout(() => {
        Audio2.unlock();
        toast('🔓 Pulau baru dibuka: ' + nxt.short + '!', 3200);
        mascotSay('Pulau ' + nxt.short + ' sudah dibuka. Jom teroka!', 7000);
      }, 900);
    }
  }

  function checkProgress(unitId) {
    const ctx = unitOf(unitId);
    if (!ctx) return;
    if (unitComplete(unitId)) {
      toast('✅ Unit siap: ' + ctx.unit.title, 3000);
      if (islandComplete(ctx.island)) {
        awardBadge(ctx.island.id, ctx.island.badge.name, ctx.island.badge.icon);
        unlockNext(ctx.island.id);
      }
    }
    // Lencana khas
    if (ISLANDS.every(islandComplete)) awardBadge('all', 'Pengembara Ilmu', '🌍');
    if (state.stars >= 50) awardBadge('stars50', 'Kutipan Bintang 50', '💫');
    if (state.streak.count >= 3) awardBadge('streak3', 'Istiqamah 3 Hari', '🔥');
  }

  function bumpStreak() {
    if (state.streak.last === today()) return;
    state.streak.count = (state.streak.last === yesterday()) ? state.streak.count + 1 : 1;
    state.streak.last = today();
    save();
  }

  function completeStep() {
    const uid = route.unit;
    const arr = state.steps[uid] = state.steps[uid] || [];
    if (!arr.includes(route.step)) {
      arr.push(route.step);
      state.stars += 1;
      save();
      Audio2.star();
      toast('⭐ +1 Bintang Ilmu!');
      confetti(26);
      mascotSay(pick(PRAISE));
      checkProgress(uid);
    } else {
      Audio2.click();
    }
    nextStep();
  }

  function nextStep() {
    const total = stepCount(route.unit);
    if (route.step + 1 < total) {
      route.step += 1;
      window.scrollTo(0, 0);
      render();
    } else {
      const ctx = unitOf(route.unit);
      go('island', { island: ctx.island.id });
      if (unitComplete(route.unit)) mascotSay('Unit ini sudah siap! Pilih stesen seterusnya.', 6000);
    }
  }

  /* ============================================================
     PAPARAN (views)
     ============================================================ */
  function render() {
    const v = $('#view');
    v.innerHTML = '';
    if (route.name === 'island') v.appendChild(viewIsland(route.island));
    else if (route.name === 'play') v.appendChild(viewPlay(route.unit, route.step));
    else if (route.name === 'profile') v.appendChild(viewProfile());
    else if (route.name === 'shop') v.appendChild(viewShop());
    else if (route.name === 'parent') v.appendChild(viewParent());
    else v.appendChild(viewHome_Map());
    updateChips();
    applyAccessories();
  }

  function updateChips() {
    $('#starCount').textContent = state.stars;
    $('#streakCount').textContent = state.streak.count;
    $('#soundIco').textContent = state.muted ? '🔇' : '🔊';
    $('#btnSound').classList.toggle('off', state.muted);
  }

  /* ---------- PETA PENGEMBARAAN ---------- */
  function viewHome_Map() {
    const wrap = document.createElement('div');
    const done = ISLANDS.filter(islandComplete).length;
    let h = '<div class="page-head"><h1>🗺️ Peta Pengembaraan Ilmu</h1>' +
      '<p>Pilih sebuah pulau untuk memulakan cabaran. Kumpulkan Bintang Ilmu dan lengkapkan semua 7 pulau!</p></div>';
    h += '<div class="island-grid">';
    ISLANDS.forEach(isl => {
      const p = islandProgress(isl);
      const un = islandUnlocked(isl.id);
      const fin = islandComplete(isl);
      h += '<button class="island' + (un ? '' : ' locked') + (fin ? ' done' : '') + '" ' +
        'data-island="' + isl.id + '" style="--c1:' + isl.color + ';--c2:' + isl.color2 + '" ' +
        'aria-label="Pulau ' + isl.short + (un ? '' : ' (berkunci)') + '">' +
        '<span class="art">' + isl.icon + '</span>' +
        '<h3>' + isl.short + '</h3>' +
        '<div class="unit-count">' + isl.units.length + ' unit · ' + p.got + '/' + p.total + ' bintang</div>' +
        '<div class="desc">' + isl.desc + '</div>' +
        '<div class="bar"><i style="width:' + p.pct + '%"></i></div>' +
        '<div class="bar-label">' + (un ? (fin ? '🌟 Pulau siap!' : p.pct + '% siap') : '🔒 Selesaikan pulau sebelum ini') + '</div>' +
        '</button>';
    });
    h += '</div>';

    h += '<div class="panel" style="margin-top:22px"><h3>📌 Kemajuan Keseluruhan</h3>' +
      '<div class="bar" style="height:20px"><i style="width:' +
      Math.round((state.stars / totalPossibleStars()) * 100) + '%"></i></div>' +
      '<p style="margin-top:10px;font-weight:800">' + state.stars + ' daripada ' + totalPossibleStars() +
      ' Bintang Ilmu dikumpul · ' + done + '/7 pulau siap · 🔥 Streak ' + state.streak.count + ' hari</p></div>';

    wrap.innerHTML = h;
    $$('.island', wrap).forEach(b => {
      b.onclick = () => {
        const id = b.dataset.island;
        if (!islandUnlocked(id)) {
          Audio2.wrong();
          toast('🔒 Selesaikan pulau sebelumnya dulu ya!');
          mascotSay('Pulau ini masih berkunci. Selesaikan pulau sebelumnya dahulu.');
          return;
        }
        Audio2.click();
        go('island', { island: id });
      };
    });
    return wrap;
  }

  /* ---------- HALAMAN PULAU ---------- */
  function viewIsland(id) {
    const isl = islandById(id);
    const wrap = document.createElement('div');
    const p = islandProgress(isl);
    let h = '<button class="back-btn" data-back="1">🗺️ Kembali ke peta</button>';
    h += '<div class="island-banner" style="--c1:' + isl.color + ';--c2:' + isl.color2 + '">' +
      '<div class="big">' + isl.icon + '</div><h1>' + isl.name + '</h1><p>' + isl.desc + '</p>';
    h += '<div class="bar" style="margin-top:14px;background:rgba(255,255,255,.35)"><i style="width:' + p.pct + '%;background:linear-gradient(90deg,#fde047,#f59e0b)"></i></div>';
    h += '<p style="margin-top:8px;font-weight:800">' + p.got + '/' + p.total + ' bintang · ' + p.pct + '% siap</p>';
    h += '</div>';
    h += '<div class="unit-list">';
    isl.units.forEach(u => {
      const got = doneList(u.id).length, tot = u.steps.length;
      h += '<button class="unit-card' + (unitComplete(u.id) ? ' finished' : '') + '" data-unit="' + u.id + '" ' +
        'style="--ucolor:' + u.color + ';--usoft:' + u.soft + '">' +
        '<span class="uico">' + u.icon + '</span>' +
        '<span class="utxt" style="flex:1"><strong>' + u.title + '</strong>' +
        '<small>' + (unitComplete(u.id) ? '✅ Siap ' : got + '/' + tot + ' bintang · ') + 'klik untuk mula!</small>' +
        '<span class="bar"><i style="width:' + Math.round((got / tot) * 100) + '%"></i></span></span>' +
        '</button>';
    });
    h += '</div>';
    wrap.innerHTML = h;
    $('[data-back]', wrap).onclick = () => { Audio2.click(); go('home'); };
    $$('.unit-card', wrap).forEach(b => {
      b.onclick = () => { Audio2.click(); go('play', { unit: b.dataset.unit, step: 0 }); };
    });
    return wrap;
  }

  /* ---------- PEMAIN AKTIVITI ---------- */
  function viewPlay(uid, idx) {
    const ctx = unitOf(uid);
    const unit = ctx.unit, isl = ctx.island;
    const steps = unit.steps;
    const step = steps[idx];
    const wrap = document.createElement('div');

    let h = '<button class="back-btn" data-back="1">◀ ' + isl.short + '</button>';
    h += '<div class="player"><div class="player-head">' +
      '<h2>' + unit.icon + ' ' + unit.title + '</h2>' +
      '<div class="dots">' + steps.map((_, i) => {
        const dn = doneList(uid).includes(i);
        return '<span class="dot' + (dn ? ' done' : (i === idx ? ' now' : '')) + '"></span>';
      }).join('') + '</div></div>';
    h += '<div class="card" id="stepCard"></div>';
    h += '</div>';
    wrap.innerHTML = h;

    $('[data-back]', wrap).onclick = () => { Audio2.click(); go('island', { island: isl.id }); };

    const card = $('#stepCard', wrap);
    const renderer = Renderers[step.type] || Renderers.info;
    const out = renderer(step);
    card.innerHTML = out.html;
    out.bind(card, () => completeStep());
    speak((step.title || step.q || ''));
    return wrap;
  }

  /* ---------- PROFIL ---------- */
  function viewProfile() {
    const wrap = document.createElement('div');
    let h = '<button class="back-btn" data-back="1">🗺️ Kembali ke peta</button>';
    h += '<div class="page-head"><h1>🏅 Profil Saya</h1></div>';
    h += '<div class="panel"><h3>Statistik</h3><div class="stat-row">' +
      '<div class="stat"><b>' + state.stars + '</b><small>⭐ Bintang Ilmu</small></div>' +
      '<div class="stat"><b>' + state.badges.length + '</b><small>🏅 Lencana</small></div>' +
      '<div class="stat"><b>' + state.streak.count + '</b><small>🔥 Streak harian</small></div>' +
      '<div class="stat"><b>' + ISLANDS.filter(islandComplete).length + '/7</b><small>🗺️ Pulau siap</small></div>' +
      '</div></div>';

    h += '<div class="panel"><h3>🏅 Lencana Pulau</h3><div class="badge-grid">';
    ISLANDS.forEach(isl => {
      const got = state.badges.includes(isl.id);
      h += '<div class="badge' + (got ? ' earned' : ' locked') + '">' +
        '<div class="bico">' + isl.badge.icon + '</div><b>' + isl.badge.name + '</b>' +
        '<small>' + isl.short + '</small></div>';
    });
    SPECIAL_BADGES.forEach(b => {
      const got = state.badges.includes(b.id);
      h += '<div class="badge' + (got ? ' earned' : ' locked') + '">' +
        '<div class="bico">' + b.icon + '</div><b>' + b.name + '</b><small>' + b.desc + '</small></div>';
    });
    h += '</div></div>';

    h += '<div class="panel"><h3>📊 Kemajuan Setiap Unit</h3><table class="rept"><thead><tr>' +
      '<th>Unit</th><th>Bintang</th><th>Status</th></tr></thead><tbody>';
    ISLANDS.forEach(isl => {
      h += '<tr><td colspan="3" style="background:#f8fafc;font-weight:900">' + isl.icon + ' ' + isl.name + '</td></tr>';
      isl.units.forEach(u => {
        const got = doneList(u.id).length, tot = u.steps.length;
        h += '<tr><td>' + u.title + '</td><td class="num">' + got + '/' + tot + '</td>' +
          '<td><span class="pill ' + (got === tot ? 'y">Siap' : 'n">Dalam proses') + '</span></td></tr>';
      });
    });
    h += '</tbody></table></div>';

    wrap.innerHTML = h;
    $('[data-back]', wrap).onclick = () => { Audio2.click(); go('home'); };
    return wrap;
  }

  /* ---------- KEDAI GANJARAN ---------- */
  function viewShop() {
    const wrap = document.createElement('div');
    let h = '<button class="back-btn" data-back="1">🗺️ Kembali ke peta</button>';
    h += '<div class="page-head"><h1>🛍️ Kedai Ganjaran</h1>' +
      '<p>Tebus Bintang Ilmu untuk aksesori maskot Ilmu. Bintang semasa: <strong>' + state.stars + ' ⭐</strong> ' +
      '(bintang yang dibelanjakan tidak hilang daripada rekod pencapaian)</p></div>';
    const spent = state.owned.reduce((s, id) => s + (SHOP_ITEMS.find(i => i.id === id) || { price: 0 }).price, 0);
    const balance = state.stars - spent;
    h += '<div class="panel"><h3>Baki Bintang: ' + balance + ' ⭐</h3>' +
      '<p class="hint">Setiap pembelian menggunakan bintang. Pakai aksesori dengan menekan butang "Pakai".</p></div>';
    h += '<div class="shop-grid">';
    SHOP_ITEMS.forEach(it => {
      const owned = state.owned.includes(it.id);
      const eq = state.equipped.includes(it.id);
      h += '<div class="shop-item' + (owned ? ' owned' : '') + (eq ? ' equipped' : '') + '">' +
        '<div class="sico">' + it.icon + '</div><b>' + it.name + '</b>' +
        '<span class="price">' + it.price + ' ⭐</span>' +
        '<small style="display:block;color:#64748b;margin-bottom:8px">' + it.desc + '</small>';
      if (!owned) {
        h += '<button class="btn btn-blue" data-buy="' + it.id + '"' + (balance < it.price ? ' disabled' : '') + '>Beli</button>';
      } else {
        h += '<button class="btn ' + (eq ? 'btn-ghost' : 'btn-primary') + '" data-wear="' + it.id + '">' +
          (eq ? 'Buka pakai' : 'Pakai') + '</button>';
      }
      h += '</div>';
    });
    h += '</div>';
    wrap.innerHTML = h;
    $('[data-back]', wrap).onclick = () => { Audio2.click(); go('home'); };
    $$('[data-buy]', wrap).forEach(b => {
      b.onclick = () => {
        const it = SHOP_ITEMS.find(x => x.id === b.dataset.buy);
        const sp = state.owned.reduce((s, id) => s + (SHOP_ITEMS.find(i => i.id === id) || { price: 0 }).price, 0);
        if (state.stars - sp < it.price) { Audio2.wrong(); toast('Bintang belum cukup!'); return; }
        state.owned.push(it.id);
        if (!state.equipped.includes(it.id)) state.equipped.push(it.id);
        save(); Audio2.star(); confetti(20);
        toast('🎉 ' + it.name + ' dibeli!');
        mascotSay('Terima kasih! Saya nampak bergaya sekarang.');
        render();
      };
    });
    $$('[data-wear]', wrap).forEach(b => {
      b.onclick = () => {
        const id = b.dataset.wear;
        if (state.equipped.includes(id)) state.equipped = state.equipped.filter(x => x !== id);
        else { state.equipped.push(id); Audio2.correct(); }
        save(); render();
      };
    });
    return wrap;
  }

  /* ---------- MOD IBU BAPA / GURU ---------- */
  function viewParent() {
    const wrap = document.createElement('div');
    let h = '<button class="back-btn" data-back="1">🗺️ Kembali ke peta</button>';
    h += '<div class="page-head"><h1>👨‍🏫 Mod Ibu Bapa / Guru</h1><p>Pantau kemajuan murid mengikut DSKP Pendidikan Islam Tahun 3.</p></div>';
    h += '<div class="panel"><h3>📊 Laporan Mengikut Bidang</h3><table class="rept"><thead><tr>' +
      '<th>Bidang / Unit</th><th>Langkah siap</th><th>Status</th></tr></thead><tbody>';
    ISLANDS.forEach(isl => {
      const p = islandProgress(isl);
      h += '<tr><td colspan="3" style="background:#f8fafc;font-weight:900">' + isl.icon + ' ' + isl.name +
        ' — ' + p.pct + '%</td></tr>';
      isl.units.forEach(u => {
        const got = doneList(u.id).length, tot = u.steps.length;
        h += '<tr><td>' + u.title + '</td><td class="num">' + got + '/' + tot + '</td>' +
          '<td><span class="pill ' + (got === tot ? 'y">Menguasai' : (got > 0 ? 'n">Sedang menguasai' : 'n">Belum mula')) + '</span></td></tr>';
      });
    });
    h += '</tbody></table></div>';
    h += '<div class="panel"><h3>⚙️ Tetapan Guru</h3>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
      '<button class="btn btn-blue" data-act="unlockall">🔓 Buka semua pulau</button>' +
      '<button class="btn btn-ghost" data-act="suara">' + (state.voice ? '🔊 Suara arahan: HIDUP' : '🔇 Suara arahan: MATI') + '</button>' +
      '<button class="btn btn-ghost" data-act="reset">🗑️ Padam semua data</button>' +
      '</div><p class="hint" style="margin-top:12px">Data disimpan setempat dalam pelayar ini (LocalStorage). Tiada data dihantar ke mana-mana pelayan.</p></div>';
    wrap.innerHTML = h;
    $('[data-back]', wrap).onclick = () => { Audio2.click(); go('home'); };
    $('[data-act=unlockall]', wrap).onclick = () => {
      ISLANDS.forEach(i => state.unlocked[i.id] = true);
      save(); Audio2.unlock(); toast('🔓 Semua pulau dibuka!'); render();
    };
    $('[data-act=suara]', wrap).onclick = () => {
      state.voice = !state.voice; save(); toast(state.voice ? 'Suara arahan dihidupkan' : 'Suara arahan dimatikan'); render();
    };
    $('[data-act=reset]', wrap).onclick = () => {
      openModal('Padam semua data?',
        '<p>Semua bintang, lencana dan kemajuan akan hilang. Tindakan ini tidak boleh dibatalkan.</p>' +
        '<div class="player-foot" style="justify-content:center">' +
        '<button class="btn btn-ghost" data-close="1">Batal</button>' +
        '<button class="btn btn-primary" id="doReset">Ya, padam</button></div>');
      $('#doReset').onclick = () => {
        state = JSON.parse(JSON.stringify(DEFAULT));
        save(); closeModal(); Audio2.click(); toast('Data dipadam.'); go('home');
      };
    };
    return wrap;
  }

  /* ============================================================
     MODAL & BANTUAN
     ============================================================ */
  function openModal(title, html) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = html;
    $('#modal').hidden = false;
    $$('#modalBody [data-close]').forEach(b => b.onclick = closeModal);
  }
  function closeModal() { $('#modal').hidden = true; }
  function showHelp() {
    openModal('❓ Bantuan', '' +
      '<p>Selamat datang ke <strong>Islamic Quest — Pengembaraan Ilmu Tahun 3</strong>! Ikut langkah di bawah:</p>' +
      '<ul class="bullets">' +
      '<li><span>🗺️</span><span>Pilih salah satu daripada <strong>7 pulau</strong> pada peta.</span></li>' +
      '<li><span>🎯</span><span>Dalam setiap pulau ada <strong>stesen unit</strong>. Klik untuk mula.</span></li>' +
      '<li><span>⭐</span><span>Setiap aktiviti yang siap memberi <strong>1 Bintang Ilmu</strong>.</span></li>' +
      '<li><span>🏅</span><span>Siapkan semua unit dalam satu pulau untuk mendapat <strong>lencana</strong> dan membuka pulau seterusnya.</span></li>' +
      '<li><span>🛍️</span><span>Tebus bintang di <strong>Kedai</strong> untuk aksesori maskot Ilmu.</span></li>' +
      '<li><span>🔊</span><span>Tekan ikon pembesar suara untuk mematikan atau menghidupkan bunyi.</span></li>' +
      '<li><span>👨‍🏫</span><span>Ibu bapa atau guru boleh melihat laporan pada butang <strong>Guru</strong>.</span></li>' +
      '</ul>' +
      '<p class="hint">Senang sahaja kan? Jom mula mengembara! 🚀</p>' +
      '<div class="player-foot" style="justify-content:center"><button class="btn btn-primary btn-lg" data-close="1">Faham!</button></div>');
  }

  /* ============================================================
     PERISTIWA (events)
     ============================================================ */
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (!g) return;
    Audio2.click();
    if (g.dataset.go === 'parent' && !state.parentOk) { askGate(); return; }
    go(g.dataset.go);
  });

  /* gerbang ringkas sebelum masuk mod ibu bapa / guru */
  function askGate() {
    openModal('Mod Ibu Bapa / Guru',
      '<p>Sila jawab soalan mudah ini untuk masuk ke mod guru:</p>' +
      '<p style="font-weight:900;font-size:22px">7 + 5 = ?</p>' +
      '<input id="gateAns" inputmode="numeric" aria-label="Jawapan" ' +
      'style="width:120px;min-height:52px;font-size:20px;border:3px solid #cbd5e1;border-radius:14px;padding:8px 12px;text-align:center">' +
      '<div class="player-foot" style="justify-content:center">' +
      '<button class="btn btn-ghost" data-close="1">Batal</button>' +
      '<button class="btn btn-primary" id="gateOk">Masuk</button></div>');
    const ans = $('#gateAns');
    const ok = () => {
      if (ans.value.trim() === '12') {
        state.parentOk = true; save(); closeModal(); Audio2.correct(); go('parent');
      } else { Audio2.wrong(); toast('Jawapan belum betul.'); }
    };
    $('#gateOk').onclick = ok;
    ans.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ok(); });
    setTimeout(() => ans.focus(), 60);
  }
  $('#btnHelp').onclick = () => { Audio2.click(); showHelp(); };
  $('#modalClose').onclick = closeModal;
  $('#modal').addEventListener('click', (e) => { if (e.target === $('#modal')) closeModal(); });
  $('#btnSound').onclick = () => {
    state.muted = !state.muted;
    $('#soundIco').textContent = state.muted ? '🔇' : '🔊';
    save();
    if (!state.muted) Audio2.click();
    updateChips();
  };
  $('#mascot').onclick = () => {
    Audio2.click();
    mascotSay(pick([
      'Hai! Saya Ilmu, maskot kamu.',
      'Jom kumpul lebih banyak Bintang Ilmu!',
      'Kamu sudah kumpul ' + state.stars + ' bintang. Hebat!',
      'Selesaikan satu pulau untuk dapat lencana ya!'
    ]));
  };

  /* ---------- Bintang hiasan di langit ---------- */
  (function paintSky() {
    const layer = $('#sparkles');
    const chars = ['✨', '⭐', '🌟', '💫'];
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = pick(chars);
      s.style.left = Math.random() * 98 + 'vw';
      s.style.top = Math.random() * 90 + 'vh';
      s.style.animationDelay = (Math.random() * 3.6) + 's';
      s.style.fontSize = (12 + Math.random() * 12) + 'px';
      layer.appendChild(s);
    }
  })();

  /* ---------- Mula ---------- */
  bumpStreak();
  render();
  if (state.stars === 0) {
    setTimeout(() => mascotSay('Assalamualaikum! Saya Ilmu 🐱 Pilih Pulau Al-Quran untuk mula.', 9000), 900);
  } else {
    setTimeout(() => mascotSay('Selamat kembali! Bintang kamu: ' + state.stars + ' ⭐', 7000), 900);
  }

  /* pendedahan untuk penyahpepijatan / penambahan kandungan */
  window.IslamicQuest = { state, ISLANDS, go, get route() { return route; } };
})();

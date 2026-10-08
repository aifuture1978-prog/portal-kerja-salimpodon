/* =========================================================================
   engine.js — Enjin Permainan + Sistem Maskot Animasi 2D
   Maskot: Ari (kanak-kanak), Kiko the Fox, Bobo (robot kecil)
   DNA: rounded, expressive, squash & stretch, easing lembut, < 0.3s respons
   ========================================================================= */
import { L, audio, speak, pick, shuffle, esc, h, $, overlay, closeOverlay, burst, burstAt, announce, toast, adaptive, rewards, gameStats, settings, state, rnd } from './core.js';

/* ---------------------- 1. MASKOT (SVG ANIMASI) ---------------------- */
const MOUTH = {
  happy: (c = '#3A2A22') => `<path d="M86 102 Q100 116 114 102" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
  cheer: (c = '#3A2A22') => `<path d="M84 100 Q100 124 116 100 Z" fill="${c}"/><path d="M92 108 Q100 118 108 108 Z" fill="#FF8FA8"/>`,
  think: (c = '#3A2A22') => `<ellipse cx="100" cy="106" rx="7" ry="8" fill="${c}"/>`,
  sad:   (c = '#3A2A22') => `<path d="M88 112 Q100 100 112 112" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`
};

export function mascotSVG(who = 'kiko', mood = 'happy', cls = '') {
  const m = MOUTH[mood] ? mood : 'happy';
  if (who === 'ari') {
    return `<span class="mascot ${cls}" aria-hidden="true"><svg viewBox="0 0 200 200">
      <ellipse class="m-shadow" cx="100" cy="186" rx="46" ry="9"/>
      <g class="m-bob">
        <path d="M100 118 L64 186 L136 186 Z" fill="#5BC0EB" stroke="#2F9FD0" stroke-width="3"/>
        <circle cx="100" cy="80" r="50" fill="#FFDCC0" stroke="#E5B48F" stroke-width="3"/>
        <circle cx="54" cy="86" r="9" fill="#FFDCC0" stroke="#E5B48F" stroke-width="3"/>
        <circle cx="146" cy="86" r="9" fill="#FFDCC0" stroke="#E5B48F" stroke-width="3"/>
        <path d="M56 62 C58 26 88 18 100 34 C112 16 146 26 144 62 C132 44 116 40 100 48 C84 40 68 44 56 62 Z" fill="#4A3728"/>
        <g class="m-blink" style="transform-origin:100px 80px">
          <ellipse cx="80" cy="80" rx="13" ry="15" fill="#fff"/><ellipse cx="120" cy="80" rx="13" ry="15" fill="#fff"/>
          <circle cx="81" cy="82" r="8" fill="#2E2A44"/><circle cx="121" cy="82" r="8" fill="#2E2A44"/>
          <circle cx="84" cy="78" r="3" fill="#fff"/><circle cx="124" cy="78" r="3" fill="#fff"/>
        </g>
        <circle cx="62" cy="100" r="9" fill="#FFB3C7" opacity=".65"/><circle cx="138" cy="100" r="9" fill="#FFB3C7" opacity=".65"/>
        <ellipse cx="100" cy="94" rx="6" ry="4" fill="#E8A88A"/>
        ${MOUTH[m]()}
      </g></svg></span>`;
  }
  if (who === 'bobo') {
    return `<span class="mascot ${cls}" aria-hidden="true"><svg viewBox="0 0 200 200">
      <ellipse class="m-shadow" cx="100" cy="186" rx="44" ry="9"/>
      <g class="m-bob" style="animation-delay:.35s">
        <line x1="100" y1="34" x2="100" y2="16" stroke="#9CC7E8" stroke-width="5" stroke-linecap="round"/>
        <circle cx="100" cy="13" r="9" fill="#FFD34E" stroke="#E9AE22" stroke-width="3"><animate attributeName="r" values="9;11;9" dur="1.8s" repeatCount="indefinite"/></circle>
        <rect x="46" y="36" width="108" height="92" rx="32" fill="#DCEFFF" stroke="#9CC7E8" stroke-width="4"/>
        <rect x="58" y="56" width="84" height="52" rx="24" fill="#2E2A44"/>
        <g class="m-blink" style="transform-origin:100px 82px">
          <rect x="70" y="72" width="20" height="20" rx="9" fill="#7BE3FF"/><rect x="110" y="72" width="20" height="20" rx="9" fill="#7BE3FF"/>
          <circle cx="80" cy="82" r="4.5" fill="#fff"/><circle cx="120" cy="82" r="4.5" fill="#fff"/>
        </g>
        <rect x="86" y="98" width="28" height="5" rx="2.5" fill="#7BE3FF" opacity=".8"/>
        <rect x="60" y="128" width="80" height="52" rx="22" fill="#DCEFFF" stroke="#9CC7E8" stroke-width="4"/>
        <circle cx="84" cy="146" r="6" fill="#7BD389"/><circle cx="102" cy="146" r="6" fill="#FFD34E"/><circle cx="120" cy="146" r="6" fill="#FF9EC4"/>
        <rect x="70" y="160" width="60" height="8" rx="4" fill="#B9DCF5"/>
        <rect x="26" y="132" width="26" height="12" rx="6" fill="#DCEFFF" stroke="#9CC7E8" stroke-width="4"/>
        <rect x="148" y="132" width="26" height="12" rx="6" fill="#DCEFFF" stroke="#9CC7E8" stroke-width="4"/>
      </g></svg></span>`;
  }
  // Kiko the Fox
  return `<span class="mascot ${cls}" aria-hidden="true"><svg viewBox="0 0 200 200">
    <ellipse class="m-shadow" cx="100" cy="184" rx="50" ry="10"/>
    <g class="m-bob">
      <g class="m-tail">
        <path d="M56 146 C16 142 6 100 26 74 C34 96 48 110 66 118 Z" fill="#FFA552" stroke="#E08530" stroke-width="3"/>
        <path d="M26 74 C36 92 44 104 54 114 C38 112 28 96 26 74 Z" fill="#FFF3E2"/>
      </g>
      <g class="m-ear"><path d="M60 46 L74 6 L96 42 Z" fill="#FFA552" stroke="#E08530" stroke-width="3"/><path d="M68 42 L76 18 L88 40 Z" fill="#FFD6DE"/></g>
      <g class="m-ear" style="animation-delay:.9s"><path d="M140 46 L126 6 L104 42 Z" fill="#FFA552" stroke="#E08530" stroke-width="3"/><path d="M132 42 L124 18 L112 40 Z" fill="#FFD6DE"/></g>
      <ellipse cx="100" cy="142" rx="42" ry="36" fill="#FFA552" stroke="#E08530" stroke-width="3"/>
      <ellipse cx="100" cy="152" rx="24" ry="22" fill="#FFF3E2"/>
      <circle cx="100" cy="84" r="52" fill="#FFA552" stroke="#E08530" stroke-width="3"/>
      <ellipse cx="100" cy="106" rx="30" ry="24" fill="#FFF3E2"/>
      <g class="m-blink" style="transform-origin:100px 78px">
        <ellipse cx="79" cy="78" rx="12" ry="14" fill="#fff"/><ellipse cx="121" cy="78" rx="12" ry="14" fill="#fff"/>
        <circle cx="80" cy="80" r="8" fill="#3A2A22"/><circle cx="120" cy="80" r="8" fill="#3A2A22"/>
        <circle cx="83" cy="76" r="3" fill="#fff"/><circle cx="123" cy="76" r="3" fill="#fff"/>
      </g>
      <ellipse cx="100" cy="100" rx="8" ry="6" fill="#3A2A22"/>
      <circle cx="66" cy="96" r="8" fill="#FFB3C7" opacity=".6"/><circle cx="134" cy="96" r="8" fill="#FFB3C7" opacity=".6"/>
      ${m === 'cheer' ? MOUTH.cheer() : MOUTH[m]()}
    </g></svg></span>`;
}

export const MASCOTS = [
  { id: 'ari',  name: 'Ari',  role: { ms: 'Kawan baik kamu', en: 'Your best friend' }, ico: '🧒' },
  { id: 'kiko', name: 'Kiko', role: { ms: 'Rubah yang ceria', en: 'The cheerful fox' }, ico: '🦊' },
  { id: 'bobo', name: 'Bobo', role: { ms: 'Robot pintar', en: 'The clever robot' }, ico: '🤖' }
];

const PRAISE = ['Hebat!', 'Pandai!', 'Bagus sekali!', 'Wah, betul!', 'Tepat sekali!', 'Syabas!', 'Kamu bijak!'];
const PRAISE_EN = ['Awesome!', 'Well done!', 'Great job!', 'That is right!', 'Perfect!', 'Brilliant!', 'So clever!'];
const RETRY = ['Cuba lagi!', 'Hampir betul!', 'Jangan putus asa, cuba lagi!', 'Kamu boleh!'];
const RETRY_EN = ['Try again!', 'Almost there!', 'Do not give up, try again!', 'You can do it!'];
export const praise = () => (settings().lang === 'en' ? pick(PRAISE_EN) : pick(PRAISE));
export const retryWord = () => (settings().lang === 'en' ? pick(RETRY_EN) : pick(RETRY));

/* --------------------------- 2. API SESI ---------------------------- */
export function makeApi({ root, game, level, onExit, rounds }) {
  const api = {
    root, game, level: level || 1, onExit,
    rounds: rounds || game.rounds || 6,
    el: {},
    stats: { correct: 0, total: 0, streak: 0, best: 0, skills: game.skills || [], t0: Date.now(), hints: 0 },
    say(text, mood = 'happy', who = game.who || 'kiko') { say(this, text, mood, who); },
    sfx(n) { audio.sfx(n); },
    note(f, k) { audio.note(f, k); },
    t: L
  };
  return api;
}

export function say(api, text, mood = 'happy', who) {
  who = who || api.game.who || 'kiko';
  if (!api.el.bubble) return;
  api.el.bubble.innerHTML = `<span class="mascot sm" style="width:3.4rem;height:3.4rem">${mascotSVG(who, mood).replace(/^<span[^>]*>|<\/span>$/g, '')}</span>
    <span class="bubble">${esc(text)}</span>`;
  const m = api.el.bubble.querySelector('.mascot svg');
  if (m) { const g = m.querySelector('.m-bob'); if (g) { g.classList.remove('m-cheer'); if (mood === 'cheer') g.classList.add('m-cheer'); } }
  announce(text);
  if (settings().captions !== false) speak(text);
}

/* ------------------------- 3. SHELL PERMAINAN ----------------------- */
export function buildShell(api, opts = {}) {
  const g = api.game;
  const title = settings().lang === 'en' ? g.en : g.ms;
  api.root.innerHTML = `
    <div class="game-shell">
      <div class="game-top">
        <button class="btn-icon" data-act="exit" aria-label="${L('Kembali ke peta', 'Back to map')}">←</button>
        <div>
          <h2 class="mb0" style="font-size:1.25rem">${esc(title)}</h2>
          <div class="tiny muted">${esc(opts.subtitle || (settings().lang === 'en' ? 'Level' : 'Tahap') + ' ' + api.level)}</div>
        </div>
        <div class="dots" data-dots role="progressbar" aria-label="${L('Kemajuan', 'Progress')}"></div>
        <button class="btn-icon" data-act="hint" aria-label="${L('Petunjuk', 'Hint')}" title="${L('Petunjuk', 'Hint')}">💡</button>
        <button class="btn-icon" data-act="repeat" aria-label="${L('Ulang arahan', 'Repeat instructions')}">🔊</button>
      </div>
      <div class="narrator" data-narrator></div>
      <div class="prompt-stage" data-stage></div>
      <div class="opts" data-opts></div>
      <div class="row between tiny muted">
        <span data-score></span>
        <span>${L('Sentuh gambar untuk jawab', 'Tap a picture to answer')}</span>
      </div>
    </div>`;
  api.el = {
    shell: api.root.querySelector('.game-shell'),
    dots: api.root.querySelector('[data-dots]'),
    stage: api.root.querySelector('[data-stage]'),
    opts: api.root.querySelector('[data-opts]'),
    bubble: api.root.querySelector('[data-narrator]'),
    score: api.root.querySelector('[data-score]')
  };
  api.el.stage.dataset.wm = (api.game && api.game.ico) || '⭐';
  api.setDots = (active, bad = -1) => {
    api.el.dots.innerHTML = Array.from({ length: api.rounds }, (_, i) =>
      `<span class="dot ${i < active ? 'done' : ''} ${i === active ? 'now' : ''} ${i === bad ? 'bad' : ''}"></span>`).join('');
  };
  api.updateScore = () => { api.el.score.textContent = `${L('Betul', 'Correct')}: ${api.stats.correct}/${api.stats.total} · ⭐ ${api.stats.streak}`; };
  api.root.querySelector('[data-act="exit"]').onclick = () => { audio.sfx('whoosh'); api.onExit(); };
  api.root.querySelector('[data-act="repeat"]').onclick = () => { if (api.el.lastSay) speak(api.el.lastSay); else api.say(L('Dengar arahan ya!', 'Listen to the instructions!')); };
  api.root.querySelector('[data-act="hint"]').onclick = () => { if (api.el.hintFn) api.el.hintFn(true); };

  // Input suara (opsyenal, untuk kanak-kanak yang suka bercakap)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR && settings().voiceInput) {
    const mic = document.createElement('button');
    mic.type = 'button';
    mic.className = 'btn-icon';
    mic.textContent = '🎙️';
    mic.setAttribute('aria-label', L('Jawab dengan suara', 'Answer by voice'));
    mic.setAttribute('aria-pressed', 'false');
    mic.onclick = () => {
      const rec = new SR();
      rec.lang = settings().lang === 'en' ? 'en-US' : 'ms-MY';
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      mic.textContent = '🔴'; mic.setAttribute('aria-pressed', 'true');
      audio.sfx('pop');
      rec.onresult = (ev) => {
        const text = Array.from(ev.results[0]).map((a) => a.transcript).join(' ').toLowerCase().trim();
        announce(text);
        if (api.voiceHandler) api.voiceHandler(text);
        else api.say(`${L('Saya dengar', 'I heard')}: ${text}`, 'happy');
      };
      rec.onerror = () => toast(L('Cuba sebut sekali lagi ya', 'Please say that again'));
      rec.onend = () => { mic.textContent = '🎙️'; mic.setAttribute('aria-pressed', 'false'); };
      try { rec.start(); } catch { /* diabaikan */ }
    };
    api.el.shell.querySelector('.game-top').appendChild(mic);
  }
  api.setDots(0);
  api.updateScore();
  return api.el;
}

/* --------------------------- 4. HINT SYSTEM ------------------------- */
export function startHint(api, hintFn) {
  api.el.hintFn = hintFn;
  clearTimeout(api._hintT);
  const delay = settings().hintDelayMs || 10000;
  if (settings().reduceMotion) return;
  api._hintT = setTimeout(() => {
    // Jangan cetuskan petunjuk jika kanak-kanak sudah keluar dari permainan ini
    if (!api.root || !api.root.isConnected || api._ended) return;
    if (api.el.hintFn) api.el.hintFn(false);
  }, delay);
}
export function clearHint(api) { clearTimeout(api._hintT); api._hintT = null; }
/** Hentikan semua aktiviti latar bagi sesi ini (dipanggil apabila keluar dari permainan) */
export function endSession(api) { api._ended = true; clearHint(api); api.el.hintFn = null; }

export function showHint(api, text) {
  if (!text || api._ended || !api.root || !api.root.isConnected) return;
  api.stats.hints++;
  audio.sfx('hint');
  toast('💡 ' + text, 3200);
  speak(text);
}

/* --------------------------- 5. FEEDBACK ---------------------------- */
export function markCorrect(api, node) {
  audio.sfx('correct');
  if (node) { node.classList.add('correct'); burstAt(node, ['⭐', '✨', '🌟', '💫', '🎉'], 12); }
  else burst(window.innerWidth / 2, window.innerHeight / 3, ['⭐', '✨', '🎉'], 10);
}
export function markWrong(api, node, correctNode) {
  audio.sfx('wrong');
  if (node) { node.classList.add('wrong'); setTimeout(() => node.classList.add('dim'), 500); }
  if (correctNode) setTimeout(() => { correctNode.classList.add('correct'); burstAt(correctNode, ['✨'], 6); }, 900);
}

/* ------------------------ 6. PENILAI ROUND -------------------------- */
export function finishRound(api) {
  clearHint(api);
  const st = api.stats;
  const acc = st.total ? st.correct / st.total : 0;
  const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  st.ms = Date.now() - st.t0;
  const res = adaptive.record(api.game.id, { correct: st.correct, total: st.total, streak: st.best, ms: st.ms, skills: st.skills });
  const gst = gameStats(api.game.id);
  gst.stars = Math.max(gst.stars || 0, stars);
  gst.maxLevel = Math.max(gst.maxLevel || 1, api.level);
  rewards.addStars(stars);
  const baru = rewards.sync();
  audio.sfx('star');
  setTimeout(() => audio.sfx('badge'), 400);
  showSummary(api, { stars, acc, res, baru });
  announce(`${praise()} ${stars} ${L('bintang', 'stars')}`);
}

function showSummary(api, { stars, acc, res, baru }) {
  const g = api.game;
  const title = settings().lang === 'en' ? g.en : g.ms;
  const mood = stars === 3 ? 'cheer' : stars === 2 ? 'happy' : 'happy';
  const msg = stars === 3
    ? L('Sempurna! Kamu memang hebat!', 'Perfect! You are amazing!')
    : stars === 2 ? L('Bagus! Hampir sempurna!', 'Great! Almost perfect!')
      : L('Syabas kerana mencuba! Mari cuba lagi.', 'Well done for trying! Let us play again.');
  const lvlMsg = res.move === 'up' ? L('Tahap naik! Susah sikit ya 😊', 'Level up! A little harder now 😊')
    : res.move === 'down' ? L('Kita main perlahan-lahan dahulu ya.', 'Let us take it a little easier.')
      : L('Teruskan berlatih!', 'Keep practising!');
  const overlayHTML = `
    <div class="center">
      <div style="display:flex;justify-content:center;gap:.4rem;align-items:flex-end">
        <span class="mascot lg">${mascotSVG(g.who || 'kiko', mood).replace(/^<span[^>]*>|<\/span>$/g, '')}</span>
      </div>
      <h2 class="mt1">${esc(msg)}</h2>
      <div class="star-line" aria-label="${stars} ${L('bintang', 'stars')}">
        ${[0, 1, 2].map((i) => `<span class="s ${i < stars ? 'on' : ''}" style="animation-delay:${i * 0.22}s">★</span>`).join('')}
      </div>
      <p class="muted">${esc(title)} · ${L('Tahap', 'Level')} ${api.level} · ${Math.round(acc * 100)}% ${L('betul', 'correct')}</p>
      <p><span class="pill y">⭐ +${stars}</span> <span class="pill b">${esc(lvlMsg)}</span></p>
      ${baru.length ? `<div class="card tight mt1" style="background:#FFF8E3">
          <b>🏅 ${L('Badge baharu!', 'New badge!')}</b>
          <div class="row" style="justify-content:center;margin-top:.4rem">${baru.map((b) => `<span class="pill">${b.ico} ${esc(settings().lang === 'en' ? b.en : b.ms)}</span>`).join('')}</div>
        </div>` : ''}
      <div class="row mt2" style="justify-content:center">
        <button class="btn grass big" data-sum="again">🔁 ${L('Main Lagi', 'Play Again')}</button>
        <button class="btn ghost big" data-sum="map">🗺️ ${L('Peta Dunia', 'World Map')}</button>
      </div>
      <p class="tiny muted mt1">${L('Tekan ESC untuk kembali', 'Press ESC to go back')}</p>
    </div>`;
  const sheet = overlay(overlayHTML, { sticky: true });
  setTimeout(() => burst(window.innerWidth / 2, window.innerHeight * 0.3, ['⭐', '✨', '🌟', '🎉', '💫'], 22), 250);
  sheet.querySelector('[data-sum="again"]').onclick = () => { closeOverlay(); api.restart(); };
  sheet.querySelector('[data-sum="map"]').onclick = () => { closeOverlay(); api.onExit(); };
}

/* ------------------------- 7. RUNNER: KUIZ -------------------------- */
/**
 * gen(level, index, api) → { prompt, instruction, say, hint, layout, options:[{html,label,aria,cls,correct}] }
 */
export function runQuiz(api, gen, opts = {}) {
  buildShell(api);
  let idx = 0, firstTry = true, wrongCount = 0, locked = false;
  api.restart = () => { idx = 0; firstTry = true; wrongCount = 0; locked = false; api.stats.correct = 0; api.stats.total = 0; api.stats.streak = 0; api.stats.t0 = Date.now(); api.updateScore(); round(); };

  function round() {
    if (idx >= api.rounds) return finishRound(api);
    api.setDots(idx);
    const q = gen(api.level, idx, api);
    firstTry = true; wrongCount = 0; locked = false;
    api.el.stage.innerHTML = q.prompt;
    api.el.opts.className = 'opts ' + (q.layout || '');
    api.el.opts.innerHTML = '';
    const order = q.shuffle === false ? q.options : shuffle(q.options);
    const nodes = [];
    order.forEach((o, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt' + (o.cls ? ' ' + o.cls : '');
      b.style.animationDelay = (i * 0.05) + 's';
      b.innerHTML = o.html;
      b.setAttribute('aria-label', o.aria || o.label || '');
      b.dataset.correct = o.correct ? '1' : '0';
      b.onclick = () => answer(b, q);
      api.el.opts.appendChild(b);
      nodes.push(b);
    });
    // Input suara: padankan sebutan kanak-kanak dengan pilihan jawapan
    api.voiceTargets = order.map((o, i) => ({ label: String(o.aria || o.label || '').toLowerCase().trim(), node: nodes[i] }));
    api.voiceHandler = (text) => {
      const hit = api.voiceTargets.find((v) => v.label && (text.includes(v.label) || v.label.includes(text)));
      if (hit) { api.say(L('Bagus, saya dengar jawapan kamu!', 'Great, I heard your answer!'), 'cheer'); hit.node.click(); }
      else api.say(L('Saya tidak pasti. Cuba sebut dengan jelas ya.', 'I am not sure. Try saying it clearly.'), 'think');
    };
    api.el.lastSay = q.say || q.instruction;
    api.say(q.instruction, q.mood || 'happy');
    startHint(api, (manual) => showHint(api, manual ? (q.hint2 || q.hint) : q.hint));
    idx++;
    api.setDots(idx - 1);
  }

  function answer(node, q) {
    if (locked) return;
    clearHint(api);
    const ok = node.dataset.correct === '1';
    if (ok) {
      locked = true;
      api.stats.total++;
      if (firstTry) { api.stats.correct++; api.stats.streak++; api.stats.best = Math.max(api.stats.best, api.stats.streak); }
      markCorrect(api, node);
      api.updateScore();
      api.say(firstTry ? praise() : L('Betul! Bagus!', 'Correct! Good!'), 'cheer');
      setTimeout(round, 1150);
    } else {
      if (firstTry) { api.stats.total++; firstTry = false; api.stats.streak = 0; }
      wrongCount++;
      api.updateScore();
      const correctNode = api.el.opts.querySelector('[data-correct="1"]');
      markWrong(api, node, wrongCount >= 2 ? correctNode : null);
      if (wrongCount >= 2) {
        locked = true;
        api.say(L('Tak apa! Ini jawapannya. Cuba soalan seterusnya ya.', 'It is okay! Here is the answer. Let us try the next one.'), 'think');
        setTimeout(round, 1900);
      } else {
        api.say(retryWord(), 'think');
        speak(retryWord());
      }
    }
  }
  round();
}

/* ------------------------ 8. RUNNER: MEMORI ------------------------- */
export function runMemory(api, cfg) {
  buildShell(api);
  let pairFound = 0, flips = 0, locked = false, open = [];
  api.restart = () => { pairFound = 0; flips = 0; open = []; locked = false; api.stats.correct = 0; api.stats.total = 0; api.stats.t0 = Date.now(); draw(); };

  function draw() {
    api.el.opts.className = 'opts';
    const cols = cfg.size <= 4 ? 2 : cfg.size <= 6 ? 3 : 4;
    api.el.opts.style.gridTemplateColumns = `repeat(${cols}, minmax(0,1fr))`;
    const items = cfg.cards();
    api.rounds = items.length / 2;
    api.setDots(pairFound);
    api.el.opts.innerHTML = items.map((c, i) =>
      `<button class="opt emoji-tile" data-i="${i}" aria-label="${L('Kad tertutup', 'Hidden card')}"><span class="opt-visual" style="font-size:0">?</span></button>`).join('');
    api.el.opts.querySelectorAll('.opt').forEach((b) => {
      b.onclick = () => flip(b, items[+b.dataset.i]);
    });
    api.say(cfg.instruction || L('Cari pasangan yang sama!', 'Find the matching pairs!'));
    startHint(api, () => showHint(api, cfg.hint));
  }

  function flip(node, card) {
    if (locked || node.dataset.done) return;
    clearHint(api);
    audio.sfx('pop');
    node.innerHTML = `<span class="opt-visual">${card.face}</span>`;
    node.setAttribute('aria-label', card.face);
    open.push({ node, card });
    if (open.length === 2) {
      flips++;
      locked = true;
      const [a, b] = open;
      if (a.card.key === b.card.key) {
        setTimeout(() => {
          a.node.classList.add('correct'); b.node.classList.add('correct');
          a.node.dataset.done = '1'; b.node.dataset.done = '1';
          pairFound++; api.stats.correct++; api.stats.total++; api.stats.streak++;
          api.stats.best = Math.max(api.stats.best, api.stats.streak);
          markCorrect(api, a.node); api.updateScore();
          api.say(praise(), 'cheer');
          open = []; locked = false; api.setDots(pairFound);
          if (pairFound === api.stats.total) setTimeout(() => finishRound(api), 700);
        }, 320);
      } else {
        setTimeout(() => {
          a.node.innerHTML = '<span class="opt-visual" style="font-size:0">?</span>';
          b.node.innerHTML = '<span class="opt-visual" style="font-size:0">?</span>';
          a.node.setAttribute('aria-label', L('Kad tertutup', 'Hidden card'));
          b.node.setAttribute('aria-label', L('Kad tertutup', 'Hidden card'));
          audio.sfx('wrong'); api.stats.streak = 0; api.stats.total++; api.updateScore();
          open = []; locked = false;
        }, 1000);
      }
    }
  }
  draw();
}

/* -------------------- 9. RUNNER: DRAG & DROP BUILDER ---------------- */
export function runBuilder(api, cfg) {
  buildShell(api);
  let idx = 0;
  api.restart = () => { idx = 0; api.stats.correct = 0; api.stats.total = 0; api.stats.t0 = Date.now(); draw(); };

  function draw() {
    if (idx >= api.rounds) return finishRound(api);
    api.setDots(idx);
    const task = cfg.task(api.level, idx);
    let placed = [];
    let firstTry = true;
    const letters = shuffle(task.letters);
    api.el.stage.innerHTML = `
      <div class="prompt-big">${task.emoji}</div>
      <div class="prompt-text">${esc(task.clue)}</div>
      <div class="slots" data-slots style="display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center;margin-top:.6rem">
        ${task.word.split('').map(() => `<span class="slot" style="width:3.2rem;height:3.6rem;border-radius:.8rem;background:#F1EDFF;border:.18rem dashed #B79CED;display:grid;place-items:center;font-size:1.7rem;font-weight:800"></span>`).join('')}
      </div>`;
    api.el.opts.className = 'opts';
    api.el.opts.style.gridTemplateColumns = '';
    api.el.opts.innerHTML = letters.map((ch, i) =>
      `<button class="opt" data-ch="${esc(ch)}" data-k="${i}" style="min-height:5rem" aria-label="${L('Huruf', 'Letter')} ${esc(ch)}"><span class="opt-visual" style="font-size:2rem">${esc(ch)}</span></button>`).join('');
    api.el.opts.querySelectorAll('.opt').forEach((b) => { b.onclick = () => place(b); });
    api.say(task.instruction || L('Susun huruf untuk membentuk perkataan.', 'Arrange the letters to build the word.'), 'happy');
    startHint(api, () => showHint(api, L(`Huruf pertama ialah "${task.word[0]}".`, `The first letter is "${task.word[0]}".`)));

    function render() {
      const slots = api.el.stage.querySelectorAll('.slot');
      slots.forEach((s, i) => { s.textContent = placed[i] ? placed[i].ch : ''; });
    }
    function place(btn) {
      clearHint(api);
      const ch = btn.dataset.ch;
      const need = task.word[placed.length];
      if (ch === need) {
        audio.sfx('pop');
        placed.push({ ch, btn });
        btn.classList.add('dim'); btn.disabled = true;
        render(); api.updateScore();
        api.stats.streak++;
        api.stats.best = Math.max(api.stats.best, api.stats.streak);
        if (placed.length === task.word.length) {
          api.stats.total++;
          if (firstTry) api.stats.correct++;
          api.updateScore();
          api.el.opts.querySelectorAll('.opt').forEach((b) => b.classList.add('correct'));
          markCorrect(api, api.el.stage.querySelector('[data-slots]'));
          api.say(L('Pandai! Perkataan siap!', 'Well done! Word complete!'), 'cheer');
          idx++; api.setDots(idx);
          setTimeout(draw, 1250);
        } else {
          api.say(L('Betul! Sambung lagi.', 'Correct! Keep going.'), 'happy');
        }
      } else {
        audio.sfx('wrong');
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 600);
        if (firstTry) { api.stats.total++; firstTry = false; api.stats.streak = 0; api.updateScore(); }
        api.say(L(`Bukan itu. Cuba huruf "${need}".`, `Not that one. Try the letter "${need}".`), 'think');
      }
    }
  }
  draw();
}

/* ------------------- 10. RUNNER: PATTERN / SEQUENCE ----------------- */
export function runSequence(api, cfg) {
  buildShell(api);
  let idx = 0, firstTry = true, locked = false;
  api.restart = () => { idx = 0; api.stats.correct = 0; api.stats.total = 0; api.stats.t0 = Date.now(); round(); };
  function round() {
    if (idx >= api.rounds) return finishRound(api);
    api.setDots(idx);
    const q = cfg.task(api.level, idx);
    firstTry = true; locked = false;
    api.el.stage.innerHTML = `<div class="prompt-sub">${esc(q.clue)}</div><div class="seq-display">${q.seq.map((s) => `<span class="seq-item">${s}</span>`).join('<span class="seq-item" style="background:transparent;box-shadow:none">➡️</span>')}<span class="seq-item" style="border:.2rem dashed #B79CED">?</span></div>`;
    api.el.opts.className = 'opts';
    api.el.opts.innerHTML = '';
    shuffle(q.options).forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opt';
      b.innerHTML = `<span class="opt-visual">${o}</span>`;
      b.dataset.correct = o === q.answer ? '1' : '0';
      b.onclick = () => {
        if (locked) return;
        clearHint(api);
        if (b.dataset.correct === '1') {
          locked = true; api.stats.total++;
          if (firstTry) { api.stats.correct++; api.stats.streak++; api.stats.best = Math.max(api.stats.best, api.stats.streak); }
          markCorrect(api, b); api.updateScore();
          api.say(praise(), 'cheer');
          const disp = api.el.stage.querySelector('.seq-display .seq-item:last-child');
          if (disp) { disp.textContent = q.answer; disp.style.border = 'none'; disp.style.background = '#EAFBF1'; }
          setTimeout(round, 1200);
        } else {
          if (firstTry) { api.stats.total++; firstTry = false; api.stats.streak = 0; api.updateScore(); }
          const cn = api.el.opts.querySelector('[data-correct="1"]');
          markWrong(api, b, cn); api.say(retryWord(), 'think');
          setTimeout(() => { locked = true; setTimeout(round, 900); }, 1600);
        }
      };
      api.el.opts.appendChild(b);
    });
    api.say(q.instruction, 'happy');
    startHint(api, () => showHint(api, q.hint));
    idx++;
    api.setDots(idx - 1);
  }
  round();
}

/* ------------------------- 11. RUNNER: TRACE ------------------------ */
/** Panduan bentuk/latihan tulisan untuk modul Mewarna & Trace */
export function traceGlyph(ch, box = 100) {
  const W = box, H = box;
  const P = (x, y) => ({ x: x / 100 * W, y: y / 100 * H });
  const line = (x1, y1, x2, y2, n = 14) => { const a = P(x1, y1), b = P(x2, y2); return Array.from({ length: n }, (_, i) => ({ x: a.x + (b.x - a.x) * i / (n - 1), y: a.y + (b.y - a.y) * i / (n - 1) })); };
  const quad = (x0, y0, cx, cy, x1, y1, n = 22) => { const a = P(x0, y0), c = P(cx, cy), b = P(x1, y1); return Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return { x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y }; }); };
  const ellipse = (cx, cy, rx, ry, a0 = 0, a1 = 360, n = 30) => { const c = P(cx, cy); const RX = rx / 100 * W, RY = ry / 100 * H; return Array.from({ length: n }, (_, i) => { const a = (a0 + (a1 - a0) * i / (n - 1)) * Math.PI / 180; return { x: c.x + Math.cos(a) * RX, y: c.y + Math.sin(a) * RY }; }); };
  const poly = (pts, close = true, n = 12) => { const segs = []; for (let i = 0; i < pts.length - 1; i++) segs.push(line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], n)); if (close) segs.push(line(pts[pts.length - 1][0], pts[pts.length - 1][1], pts[0][0], pts[0][1], n)); return [segs.flat()]; };
  const G = {
    'I': [line(50, 14, 50, 86)],
    'L': [line(34, 14, 34, 86), line(34, 86, 74, 86)],
    'T': [line(22, 14, 78, 14), line(50, 14, 50, 86)],
    'U': [line(26, 14, 26, 62), quad(26, 62, 26, 88, 50, 88), quad(50, 88, 74, 88, 74, 62), line(74, 62, 74, 14)],
    'O': [ellipse(50, 50, 27, 37)],
    'C': [ellipse(52, 50, 27, 37, 55, 305)],
    'E': [line(34, 14, 34, 86), line(34, 14, 72, 14), line(34, 50, 66, 50), line(34, 86, 72, 86)],
    'A': [line(24, 86, 50, 14), line(50, 14, 76, 86), line(35, 60, 65, 60)],
    'B': [line(32, 14, 32, 86), quad(32, 14, 74, 16, 32, 50), quad(32, 50, 80, 52, 32, 86)],
    'P': [line(32, 14, 32, 86), quad(32, 14, 76, 16, 32, 50)],
    'K': [line(30, 14, 30, 86), line(74, 16, 36, 56), line(44, 48, 78, 86)],
    'S': [quad(72, 20, 30, 14, 36, 48), quad(36, 48, 74, 60, 36, 84), quad(36, 84, 72, 90, 74, 62)],
    '1': [line(38, 26, 52, 14), line(52, 14, 52, 86), line(36, 86, 68, 86)],
    '2': [quad(28, 26, 52, 8, 72, 26), quad(72, 26, 80, 44, 30, 86), line(30, 86, 74, 86)],
    '3': [quad(30, 24, 52, 12, 70, 28), quad(70, 28, 78, 46, 46, 50), quad(46, 50, 80, 54, 66, 84), quad(66, 84, 48, 92, 30, 80)],
    '7': [line(26, 16, 76, 16), line(76, 16, 42, 86)],
    'garis': [line(50, 10, 50, 90)],
    'zigzag': [[...line(12, 80, 30, 22), ...line(30, 22, 48, 80), ...line(48, 80, 66, 22), ...line(66, 22, 84, 80)]],
    'gelombang': [[...quad(10, 55, 24, 18, 38, 55), ...quad(38, 55, 52, 92, 66, 55), ...quad(66, 55, 80, 18, 92, 55)]],
    'segiempat': poly([[20, 14], [80, 14], [80, 86], [20, 86]]),
    'segitiga': poly([[50, 10], [88, 86], [12, 86]]),
    'hati': [[...quad(50, 88, 8, 58, 20, 30), ...quad(20, 30, 30, 8, 50, 30), ...quad(50, 30, 70, 8, 80, 30), ...quad(80, 30, 92, 58, 50, 88)]],
    'bintang': poly([[50, 8], [62, 38], [95, 40], [70, 60], [78, 92], [50, 74], [22, 92], [30, 60], [5, 40], [38, 38]])
  };
  return G[ch] || null;
}

/** Gabungkan beberapa glif menjadi satu baris perkataan (untuk trace perkataan) */
export function wordStrokes(word, box = 100) {
  const n = word.length, w = box / n;
  return word.split('').flatMap((ch, i) => {
    const g = traceGlyph(ch, box);
    if (!g) return [];
    const s = (w / box) * 0.9;
    const off = i * w + w * 0.05;
    return g.map((st) => st.map((p) => ({ x: p.x * s + off, y: p.y * 0.84 + 8 })));
  });
}

export function runTrace(api, cfg) {
  buildShell(api);
  let idx = 0, stroke = [], drawing = false;
  api.restart = () => { idx = 0; api.stats.correct = 0; api.stats.total = 0; api.stats.t0 = Date.now(); round(); };
  const colors = ['#FF7C7C', '#FFA552', '#FFD34E', '#7BD389', '#5BC0EB', '#B79CED', '#FF9EC4', '#2E2A44'];

  function round() {
    if (idx >= api.rounds) return finishRound(api);
    api.setDots(idx);
    const task = cfg.task(api.level, idx);
    stroke = []; drawing = false;
    api.el.stage.innerHTML = `
      <div class="prompt-sub">${esc(task.clue)}</div>
      <div class="canvas-wrap" data-cw>
        <canvas data-cv width="720" height="720"></canvas>
      </div>
      ${task.palette ? `<div class="palette" data-pal></div>` : ''}`;
    const cv = api.el.stage.querySelector('[data-cv]');
    const ctx = cv.getContext('2d');
    const guide = task.strokes;
    let picked = colors[0], mode = task.mode || 'trace';

    if (task.palette) {
      const pal = api.el.stage.querySelector('[data-pal]');
      pal.innerHTML = colors.map((c, i) => `<button class="swatch-btn" data-c="${c}" style="background:${c}" aria-label="${L('Warna', 'Color')} ${i + 1}" aria-pressed="${i === 0}"></button>`).join('');
      pal.querySelectorAll('.swatch-btn').forEach((b) => {
        b.onclick = () => {
          picked = b.dataset.c;
          pal.querySelectorAll('.swatch-btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          audio.sfx('tap');
        };
      });
    }

    function drawGuide() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save();
      ctx.lineWidth = task.mode === 'color' ? 0 : 16;
      ctx.strokeStyle = '#E7E0D4';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.setLineDash([2, 22]);
      guide.forEach((s) => { ctx.beginPath(); s.forEach((p, i) => i ? ctx.lineTo(p.x * 7.2, p.y * 7.2) : ctx.moveTo(p.x * 7.2, p.y * 7.2)); ctx.stroke(); });
      ctx.restore();
    }
    function render() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (task.mode !== 'color') { ctx.save(); ctx.setLineDash([2, 22]); ctx.lineWidth = 16; ctx.strokeStyle = '#E7E0D4'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; guide.forEach((s) => { ctx.beginPath(); s.forEach((p, i) => i ? ctx.lineTo(p.x * 7.2, p.y * 7.2) : ctx.moveTo(p.x * 7.2, p.y * 7.2)); ctx.stroke(); }); ctx.restore(); }
      ctx.save();
      ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = mode === 'color' ? picked : '#5BC0EB';
      stroke.forEach((s) => { if (s.length < 2) return; ctx.beginPath(); ctx.strokeStyle = s.color; s.pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); });
      ctx.restore();
    }
    drawGuide(); render();

    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: (t.clientX - r.left) * (cv.width / r.width), y: (t.clientY - r.top) * (cv.height / r.height) };
    };
    const start = (e) => { e.preventDefault(); audio.unlock(); clearHint(api); drawing = true; stroke.push({ color: mode === 'color' ? picked : '#5BC0EB', pts: [pos(e)] }); render(); };
    const move = (e) => { if (!drawing) return; e.preventDefault(); stroke[stroke.length - 1].pts.push(pos(e)); render(); };
    const end = () => { if (!drawing) return; drawing = false; };

    cv.addEventListener('pointerdown', start);
    cv.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);

    api.el.stage.querySelector('[data-cw]').addEventListener('pointerup', () => {
      if (task.mode === 'color') return;
      const all = stroke.flatMap((s) => s.pts);
      const total = guide.flat();
      const tol = 40;
      let hit = 0;
      total.forEach((g) => {
        const gp = { x: g.x * 7.2, y: g.y * 7.2 };
        if (all.some((p) => Math.hypot(p.x - gp.x, p.y - gp.y) < tol)) hit++;
      });
      const cov = total.length ? hit / total.length : 0;
      api.stats.total++;
      const good = cov >= 0.62;
      if (good) {
        api.stats.correct++; api.stats.streak++;
        api.stats.best = Math.max(api.stats.best, api.stats.streak);
        api.updateScore(); markCorrect(api, api.el.stage.querySelector('[data-cw]'));
        api.say(L('Cantik! Tulisan kamu kemas.', 'Beautiful! Neat writing.'), 'cheer');
      } else {
        api.stats.streak = 0; api.updateScore();
        api.sfx('wrong');
        api.say(L('Cuba ikut garis putus-putus itu ya.', 'Try to follow the dotted line.'), 'think');
      }
      if (cov >= 0.35) { idx++; api.setDots(idx); setTimeout(round, 1200); }
    });

    api.say(task.instruction, 'happy');
    startHint(api, () => showHint(api, L('Ikut garis putus-putus perlahan-lahan.', 'Follow the dotted line slowly.')));
  }
  round();
}

/* ----------------------- 12. RUNNER: MUZIK -------------------------- */
export function runMusic(api, cfg) {
  buildShell(api);
  let idx = 0, firstTry = true;
  const NOTES = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
  const PADCOL = ['#FF7C7C', '#FFA552', '#FFD34E', '#7BD389', '#5BC0EB', '#B79CED'];
  api.restart = () => { idx = 0; api.stats.correct = 0; api.stats.total = 0; api.stats.t0 = Date.now(); round(); };

  function round() {
    if (idx >= api.rounds) return finishRound(api);
    api.setDots(idx);
    const task = cfg.task(api.level, idx);
    firstTry = true;
    let seq = task.seq, input = [], playing = false;
    api.el.stage.innerHTML = `<div class="prompt-sub">${esc(task.clue)}</div><div class="seq-display" data-seq>${seq.map((s, i) => `<span class="seq-item" data-s="${i}">${task.mode === 'instrument' ? '🎵' : '●'}</span>`).join('')}</div>`;
    api.el.opts.className = 'opts';
    api.el.opts.style.gridTemplateColumns = '';
    api.el.opts.innerHTML = task.mode === 'instrument'
      ? task.instruments.map((ins) => `<button class="opt" data-ins="${ins.id}" style="min-height:6rem"><span class="opt-visual">${ins.ico}</span><span class="opt-label">${esc(settings().lang === 'en' ? ins.en : ins.ms)}</span></button>`).join('')
      : PADCOL.slice(0, task.pads).map((c, i) => `<button class="pad" data-n="${i}" style="background:linear-gradient(180deg,${c},${c}cc)" aria-label="${L('Pad', 'Pad')} ${i + 1}"><span>${i + 1}</span></button>`).join('');
    api.el.opts.className = task.mode === 'instrument' ? 'opts' : 'pads';

    function light(i, dur = 420) {
      const el = api.el.stage.querySelector(`[data-s="${i}"]`);
      if (!el) return;
      el.classList.add('active');
      const pad = api.el.opts.querySelector(`[data-n="${seq[i] ?? i}"]`);
      if (pad) pad.classList.add('lit');
      setTimeout(() => { el.classList.remove('active'); if (pad) pad.classList.remove('lit'); }, dur);
    }
    function playSeq() {
      if (playing) return; playing = true;
      seq.forEach((n, i) => setTimeout(() => { light(i); audio.note(NOTES[n], task.timbre || 'piano'); }, i * (task.speed || 620)));
      setTimeout(() => { playing = false; }, seq.length * (task.speed || 620) + 200);
    }

    if (task.mode === 'instrument') {
      api.el.opts.querySelectorAll('.opt').forEach((b) => {
        b.onclick = () => {
          clearHint(api);
          api.stats.total++;
          const ok = b.dataset.ins === task.answer;
          if (ok) { if (firstTry) api.stats.correct++; markCorrect(api, b); api.say(praise(), 'cheer'); setTimeout(round, 1200); }
          else { firstTry = false; markWrong(api, b, api.el.opts.querySelector(`[data-ins="${task.answer}"]`)); api.say(retryWord(), 'think'); }
          api.updateScore();
        };
      });
      setTimeout(() => { audio.note(task.freq || 440, task.answer); }, 700);
      api.say(task.instruction, 'happy');
      startHint(api, () => showHint(api, task.hint));
      idx++; api.setDots(idx - 1);
      return;
    }

    api.el.opts.querySelectorAll('.pad').forEach((b) => {
      b.onclick = () => {
        clearHint(api);
        if (playing) return;
        const n = +b.dataset.n;
        b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 140);
        audio.note(NOTES[n], task.timbre || 'piano');
        input.push(n);
        const i = input.length - 1;
        if (input[i] !== seq[i]) {
          audio.sfx('wrong'); api.stats.streak = 0; api.updateScore();
          if (firstTry) { api.stats.total++; firstTry = false; }
          api.say(L('Hampir! Dengar sekali lagi ya.', 'Almost! Listen once more.'), 'think');
          input = []; setTimeout(playSeq, 900);
          return;
        }
        light(i, 240);
        if (input.length === seq.length) {
          api.stats.total++;
          if (firstTry) { api.stats.correct++; api.stats.streak++; api.stats.best = Math.max(api.stats.best, api.stats.streak); }
          api.updateScore(); markCorrect(api, api.el.opts.querySelector('.pad'));
          api.say(L('Tepat sekali! Kamu berbakat muzik!', 'Perfect! You have musical talent!'), 'cheer');
          input = [];
          setTimeout(round, 1400);
        }
      };
    });
    api.say(task.instruction, 'happy');
    startHint(api, () => showHint(api, task.hint));
    setTimeout(playSeq, 800);
    idx++; api.setDots(idx - 1);
  }
  round();
}

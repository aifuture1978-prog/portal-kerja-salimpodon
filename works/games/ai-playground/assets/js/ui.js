/* =========================================================================
   ui.js — Shell, Router & Semua Halaman
   Landing · Peta Dunia Ajaib · Skrin Permainan · Bilik Ganjaran
   Cerita · Dashboard Ibu Bapa (PIN) · Tetapan · Bantuan
   ========================================================================= */
import {
  state, settings, child, setActiveChild, addChild, removeChild, save, load, onChange,
  L, setLang, setSetting, audio, speak, stopSpeak, toast, announce, overlay, closeOverlay,
  isOverlayOpen, esc, clamp, adaptive, rewards, gameStats, childProgress, childRewards,
  BADGES, STICKERS, UNLOCKS, screenTime, safety, mmss, fmtMin, $, $$, h, mean, todayKey
} from './core.js';
import { makeApi, mascotSVG, MASCOTS, endSession } from './engine.js';
import { gamesA } from './games-a.js';
import { gamesB } from './games-b.js';

export const GAMES = { ...gamesA, ...gamesB };
export const GAME_LIST = Object.values(GAMES);

/* ---------------------------- DUNIA & PETA ---------------------------- */
export const WORLDS = [
  { id: 'padang', ico: '🌾', ms: 'Padang Rumput', en: 'Meadow', need: 0, c1: '#E4FAE7', c2: '#B7EDC2', games: ['colors', 'shapes', 'numbers'] },
  { id: 'hutan', ico: '🌳', ms: 'Hutan Ajaib', en: 'Magic Forest', need: 6, c1: '#E6F7EE', c2: '#B3E3C7', games: ['letters', 'words', 'phonics'] },
  { id: 'pantai', ico: '🏖️', ms: 'Pantai Cerah', en: 'Sunny Beach', need: 14, c1: '#E4F4FF', c2: '#B4DFF8', games: ['puzzle', 'trace', 'science'] },
  { id: 'angkasa', ico: '🚀', ms: 'Angkasa Bintang', en: 'Starry Space', need: 24, c1: '#F0E8FF', c2: '#CDBBF7', games: ['story', 'feelings', 'music'] }
];
const gname = (g) => (settings().lang === 'en' ? g.en : g.ms);
const gtag = (g) => (settings().lang === 'en' ? g.tagline.en : g.tagline.ms);
const starsOf = (id) => gameStats(id).stars || 0;
const SKILL_KEYS = ['literasi', 'numerasi', 'kognitif', 'kreativiti', 'motor', 'sosial', 'sains'];
const SKILL_NAME = {
  literasi: { ms: 'Literasi', en: 'Literacy' }, numerasi: { ms: 'Numerasi', en: 'Numeracy' },
  kognitif: { ms: 'Kognitif', en: 'Cognitive' }, kreativiti: { ms: 'Kreativiti', en: 'Creativity' },
  motor: { ms: 'Motor Halus', en: 'Fine motor' }, sosial: { ms: 'Sosial-Emosi', en: 'Social-emotional' },
  sains: { ms: 'Sains & Alam', en: 'Science & nature' }
};

/* ------------------------------ ROUTER ------------------------------- */
let currentCleanup = null;
const parseHash = () => (location.hash || '#/').replace(/^#\/?/, '').split('/');

export function navigate(path) {
  if (location.hash === '#' + path) render();
  else location.hash = path;
}

function render() {
  if (currentCleanup) { try { currentCleanup(); } catch { } currentCleanup = null; }
  stopSpeak();
  closeOverlay(); // pastikan dialog ringkasan/petunjuk tidak menyekat navigasi
  const [route, arg] = parseHash();
  const view = $('#view');
  if (route !== 'parent') delete view.dataset.unlocked; // Mod Ibu Bapa sentiasa berkunci semula
  view.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  renderTop();
  renderBottom();
  switch (route) {
    case 'play': return playView(view, arg);
    case 'playground': return playgroundView(view);
    case 'rewards': return rewardsView(view);
    case 'settings': return settingsView(view);
    case 'help': return helpView(view);
    case 'parent': return parentView(view);
    case 'story': return playView(view, 'story');
    default: return landingView(view);
  }
}

/* ------------------------------ TOP BAR ------------------------------ */
function renderTop() {
  const r = childRewards();
  $('#topbar').innerHTML = `
    <div class="topbar-in">
      <button class="btn-icon" data-nav="#/" aria-label="${L('Halaman utama', 'Home')}" title="${L('Utama', 'Home')}">🏠</button>
      <div class="brand">
        <span class="brand-mark">${logoSVG()}</span>
        <span>AI Playground<small>${L('Kanak-kanak 5–8 tahun', 'Kids 5–8 years')}</small></span>
      </div>
      <span class="topbar-spacer"></span>
      <span class="stat-chip" title="${L('Bintang kamu', 'Your stars')}"><span class="ico">⭐</span><span>${r.stars}</span></span>
      <button class="btn-icon" data-nav="#/rewards" aria-label="${L('Bilik ganjaran', 'Reward room')}" title="${L('Ganjaran', 'Rewards')}">🏆</button>
      <button class="btn-icon" data-nav="#/settings" aria-label="${L('Tetapan', 'Settings')}" title="${L('Tetapan', 'Settings')}">⚙️</button>
      <button class="btn-icon" data-nav="#/help" aria-label="${L('Bantuan', 'Help')}" title="${L('Bantuan', 'Help')}">❓</button>
      <button class="btn-icon" data-nav="#/parent" aria-label="${L('Mod ibu bapa', 'Parent mode')}" title="${L('Ibu bapa', 'Parent')}">👨‍👩‍👧</button>
    </div>`;
  $$('[data-nav]', $('#topbar')).forEach((b) => { b.onclick = () => { audio.sfx('tap'); navigate(b.dataset.nav); }; });
}
function renderBottom() {
  const net = safety.networkAudit();
  $('#bottombar').innerHTML = `
    <div class="bottom-in">
      <span class="safe-tag">🛡️ ${L('Tanpa iklan · Tanpa penjejakan · Data kekal dalam peranti ini', 'No ads · No tracking · Data stays on this device')}</span>
      <span>${L('Asal rangkaian luar', 'External origins')}: ${net.length ? esc(net.join(', ')) : L('tiada', 'none')}</span>
    </div>`;
}

export function logoSVG(size = 40) {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="AI Playground">
    <circle cx="32" cy="32" r="30" fill="#5BC0EB"/>
    <circle cx="32" cy="32" r="24" fill="#FFF9F0"/>
    <path d="M20 40 Q32 52 44 40" fill="none" stroke="#FFA552" stroke-width="4" stroke-linecap="round"/>
    <circle cx="24" cy="26" r="4.5" fill="#2E2A44"/><circle cx="40" cy="26" r="4.5" fill="#2E2A44"/>
    <circle cx="25.5" cy="24.5" r="1.6" fill="#fff"/><circle cx="41.5" cy="24.5" r="1.6" fill="#fff"/>
    <path d="M46 10 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFD34E"/>
  </svg>`;
}

/* ---------------------------- 1. LANDING ----------------------------- */
function landingView(view) {
  const c = child();
  const r = childRewards();
  view.innerHTML = `
    <section class="hero">
      <div>
        <span class="pill y">✨ ${L('Selamat datang kembali', 'Welcome back')}, ${esc(c.name)}!</span>
        <h1 class="mt1">${L('Dunia ajaib untuk belajar sambil bermain', 'A magic world for learning through play')}</h1>
        <p class="lede">${L('12 permainan edukasi dengan arahan suara, watak comel dan tahap yang menyesuaikan diri dengan kamu. Selamat, tanpa iklan, dan mesra semua kanak-kanak.', '12 educational games with voice instructions, cute characters and levels that adapt to you. Safe, ad-free and friendly for every child.')}</p>
        <div class="row mt1">
          <button class="btn grass big pulse" data-go="#/playground">▶️ ${L('Mula Bermain', 'Start Playing')}</button>
          <button class="btn ghost big" data-go="#/story">📖 ${L('Cerita Interaktif', 'Story Time')}</button>
        </div>
        <div class="chips mt2">
          <span class="pill">⭐ ${r.stars} ${L('bintang', 'stars')}</span>
          <span class="pill g">🏅 ${r.badges.length}/${BADGES.length} ${L('badge', 'badges')}</span>
          <span class="pill b">🕐 ${fmtMin(screenTime.today())} ${L('hari ini', 'today')}</span>
        </div>
      </div>
      <div class="hero-art">
        <span class="mascot m3">${inner(mascotSVG('bobo', 'happy'))}</span>
        <span class="mascot m1">${inner(mascotSVG('ari', 'cheer'))}</span>
        <span class="mascot m2">${inner(mascotSVG('kiko', 'happy'))}</span>
      </div>
    </section>

    <section class="grid auto mt2">
      ${[[L('Arahan suara', 'Voice instructions'), '🔊', L('Setiap permainan dimulakan dengan arahan audio yang mesra kanak-kanak.', 'Every game starts with child-friendly audio instructions.')],
      [L('AI adaptif', 'Adaptive AI'), '🧠', L('Tahap kesukaran naik atau turun mengikut prestasi sebenar kamu.', 'Difficulty rises or falls with your real performance.')],
      [L('Mesra akses', 'Accessible'), '♿', L('Saiz teks boleh laras, fon disleksia, kontras tinggi, kawalan keyboard.', 'Adjustable text size, dyslexia font, high contrast, keyboard control.')],
      [L('Ibu bapa boleh pantau', 'Parents can follow'), '👨‍👩‍👧', L('Dashboard kemajuan, had masa skrin dan laporan mingguan.', 'Progress dashboard, screen-time limits and weekly reports.')]]
      .map(([t, i, d]) => `<div class="card"><div style="font-size:2.2rem">${i}</div><h3 class="mt1">${esc(t)}</h3><p class="muted mb0">${esc(d)}</p></div>`).join('')}
    </section>

    <section class="card mt2">
      <h2>${L('Cara bermain', 'How to play')}</h2>
      <div class="grid auto">
        ${[[L('Pilih dunia', 'Pick a world'), L('Buka peta dunia dan pilih permainan yang kamu suka.', 'Open the world map and pick a game you like.')],
      [L('Dengar arahan', 'Listen to instructions'), L('Kiko, Ari dan Bobo akan memberitahu apa yang perlu dibuat.', 'Kiko, Ari and Bobo will tell you what to do.')],
      [L('Kumpul bintang', 'Collect stars'), L('Setiap permainan memberi 1–3 bintang dan badge baharu.', 'Each game gives 1–3 stars and new badges.')],
      [L('Buka dunia baharu', 'Unlock new worlds'), L('Semakin banyak bintang, semakin banyak dunia dibuka.', 'The more stars you collect, the more worlds open up.')]]
      .map(([t, d], i) => `<div><div class="pill b">${i + 1}</div><h3 class="mt1">${esc(t)}</h3><p class="muted mb0">${esc(d)}</p></div>`).join('')}
      </div>
    </section>`;
  wireGo(view);
}

const inner = (span) => span.replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '');

function wireGo(view) {
  $$('[data-go]', view).forEach((b) => { b.onclick = () => { audio.unlock(); audio.sfx('whoosh'); navigate(b.dataset.go); }; });
}

/* --------------------------- 2. PETA DUNIA --------------------------- */
function playgroundView(view) {
  const total = childRewards().stars;
  const c = child();
  view.innerHTML = `
    <div class="row between">
      <div>
        <h1 class="mb0">${L('Peta Dunia Ajaib', 'Magic World Map')}</h1>
        <p class="muted">${L('Pilih permainan dan kumpul bintang untuk membuka dunia baharu.', 'Pick a game and collect stars to unlock new worlds.')}</p>
      </div>
      <span class="stat-chip"><span class="ico">⭐</span> ${total} ${L('bintang', 'stars')}</span>
    </div>
    <div class="narrator mt2">
      <span class="mascot">${inner(mascotSVG('kiko', 'happy'))}</span>
      <span class="bubble">${L(`Hai ${esc(c.name)}! Mari kita bermain. Pilih mana-mana gambar ya!`, `Hi ${esc(c.name)}! Let us play. Choose any picture!`)}</span>
    </div>
    <div data-worlds class="mt2"></div>`;
  const box = $('[data-worlds]', view);
  WORLDS.forEach((w) => {
    const locked = total < w.need;
    const sec = document.createElement('section');
    sec.className = 'world';
    sec.innerHTML = `
      <div class="map-strip" style="background:linear-gradient(160deg,${w.c1},${w.c2})">
        <span class="world-wm" aria-hidden="true">${w.ico}</span>
        <div class="world-head">
          <span class="world-flag" style="background:${w.c2}">${w.ico}</span>
          <div>
            <h2 class="mb0">${esc(settings().lang === 'en' ? w.en : w.ms)}</h2>
            <div class="tiny muted">${locked ? L(`Perlu ${w.need} ⭐ untuk dibuka (kamu ada ${total})`, `Needs ${w.need} ⭐ to open (you have ${total})`) : L('Dibuka untuk kamu!', 'Open for you!')}</div>
          </div>
        </div>
        <div class="tiles">
          ${w.games.map((id) => {
      const g = GAMES[id], st = gameStats(id), s = st.stars || 0;
      return `<button class="tile ${locked ? 'locked' : ''}" data-game="${id}" ${locked ? 'aria-disabled="true"' : ''} data-wm="${g.ico}">
              <span class="tile-ico">${g.ico}</span>
              <span class="tile-name">${esc(gname(g))}</span>
              <span class="tile-en">${esc(gtag(g))}</span>
              <span class="tile-foot">
                <span class="stars-inline">${[0, 1, 2].map((i) => `<span class="${i < s ? 'on' : 'off'}">★</span>`).join('')}</span>
                <span class="pill y">${L('Tahap', 'Lv')} ${st.level || 1}</span>
                ${st.plays ? `<span class="pill">${st.plays}×</span>` : ''}
              </span>
            </button>`;
    }).join('')}
        </div>
      </div>`;
    box.appendChild(sec);
  });
  $$('[data-game]', box).forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.game;
      const w = WORLDS.find((x) => x.games.includes(id));
      if (childRewards().stars < w.need) {
        audio.sfx('wrong');
        toast(L(`Kumpul ${w.need} ⭐ dahulu untuk buka ${w.ms}!`, `Collect ${w.need} ⭐ first to open ${w.en}!`), 2600);
        speak(L(`Belum cukup bintang. Kumpul ${w.need} bintang dahulu ya!`, `Not enough stars yet. Collect ${w.need} stars first!`));
        return;
      }
      audio.unlock(); audio.sfx('whoosh');
      navigate('#/play/' + id);
    };
  });
}

/* -------------------------- 3. SKRIN PERMAINAN ----------------------- */
function playView(view, gameId) {
  const game = GAMES[gameId];
  if (!game) { navigate('#/playground'); return; }
  audio.unlock();
  if (settings().music) audio.startMusic();
  const level = adaptive.level(game.id);
  const container = document.createElement('div');
  view.innerHTML = '';
  view.appendChild(container);
  const api = makeApi({
    root: container, game, level,
    onExit: () => { audio.stopMusic(); navigate('#/playground'); }
  });
  announce(`${gname(game)} — ${L('Tahap', 'Level')} ${level}`);
  try {
    game.render(api);
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="card center"><h2>${L('Maaf, ada masalah kecil', 'Sorry, a small problem')}</h2><p class="muted">${esc(String(e.message || e))}</p>
      <button class="btn" data-back>${L('Kembali', 'Back')}</button></div>`;
    $('[data-back]', container).onclick = () => navigate('#/playground');
  }
  currentCleanup = () => { endSession(api); audio.stopMusic(); stopSpeak(); };
}

/* -------------------------- 4. BILIK GANJARAN ------------------------ */
function rewardsView(view) {
  const r = childRewards(), c = child();
  view.innerHTML = `
    <div class="row between">
      <h1 class="mb0">🏆 ${L('Bilik Ganjaran', 'Reward Room')}</h1>
      <span class="stat-chip"><span class="ico">⭐</span> ${r.stars}</span>
    </div>
    <p class="muted">${L('Semua bintang, badge dan sticker yang kamu kumpul.', 'All the stars, badges and stickers you have collected.')}</p>

    <section class="grid auto-sm mt2">
      ${[[r.stars, L('Bintang', 'Stars'), '⭐'], [r.badges.length, L('Badge', 'Badges'), '🏅'],
      [r.stickers.length, L('Sticker', 'Stickers'), '🎟️'], [r.unlocks.length, L('Watak dibuka', 'Unlocks'), '🎁']]
      .map(([v, t, i]) => `<div class="kpi center"><div style="font-size:1.8rem">${i}</div><b>${v}</b><span>${esc(t)}</span></div>`).join('')}
    </section>

    <section class="card mt2">
      <h2>🏅 ${L('Badge', 'Badges')} <span class="pill">${r.badges.length}/${BADGES.length}</span></h2>
      <div class="grid auto-sm mt1">
        ${BADGES.map((b) => {
    const on = r.badges.includes(b.id);
    return `<div class="badge-card ${on ? '' : 'locked'}"><span class="badge-medal">${on ? b.ico : '🔒'}</span>
            <b class="tiny">${esc(settings().lang === 'en' ? b.en : b.ms)}</b></div>`;
  }).join('')}
      </div>
    </section>

    <section class="card mt2">
      <h2>🎟️ ${L('Sticker', 'Stickers')} <span class="pill">${r.stickers.length}/${STICKERS.length}</span></h2>
      <p class="tiny muted">${L('Setiap 6 bintang, kamu dapat satu sticker baharu!', 'Every 6 stars you earn a new sticker!')}</p>
      <div class="sticker-grid mt1">
        ${STICKERS.map((s, i) => `<div class="sticker ${i < r.stickers.length ? '' : 'locked'}">${s}</div>`).join('')}
      </div>
    </section>

    <section class="card mt2">
      <h2>🎁 ${L('Yang dibuka', 'Unlocks')}</h2>
      <div class="grid auto-sm mt1">
        ${UNLOCKS.map((u) => {
    const on = r.unlocks.includes(u.id);
    return `<div class="badge-card ${on ? '' : 'locked'}"><span class="badge-medal">${on ? u.ico : '🔒'}</span>
            <b class="tiny">${esc(settings().lang === 'en' ? u.en : u.ms)}</b>
            <span class="tiny muted">${u.stars} ⭐</span></div>`;
  }).join('')}
      </div>
    </section>

    <section class="card mt2 center">
      <h2>📜 ${L('Sijil Digital', 'Digital Certificate')}</h2>
      <p class="muted">${L('Ibu bapa boleh cetak sijil ini sebagai kenangan.', 'Parents can print this certificate as a keepsake.')}</p>
      <button class="btn yellow" data-cert>🖨️ ${L('Cetak Sijil', 'Print Certificate')}</button>
    </section>`;
  $('[data-cert]', view).onclick = () => printCertificate(c, r);
}

function printCertificate(c, r) {
  const html = `
    <div class="certificate">
      <div style="font-size:3rem">🏆</div>
      <h1 style="font-size:2rem">${L('Sijil Pencapaian', 'Certificate of Achievement')}</h1>
      <p class="muted">${L('Diberikan kepada', 'Awarded to')}</p>
      <h2 style="font-size:2.4rem;color:#9179D6">${esc(c.name)}</h2>
      <p>${L('kerana berjaya mengumpul', 'for successfully collecting')} <b>${r.stars} ⭐</b> ${L('dan', 'and')} <b>${r.badges.length} 🏅</b> ${L('di AI Playground Kanak-Kanak', 'in AI Playground Kanak-Kanak')}.</p>
      <p class="tiny muted">${new Date().toLocaleDateString(settings().lang === 'en' ? 'en-GB' : 'ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div style="font-size:2rem">${'⭐'.repeat(Math.min(5, Math.max(1, Math.round(r.stars / 10))))}</div>
    </div>`;
  printSection(html, L('Sijil', 'Certificate'));
}

function printSection(html, title) {
  let area = $('#print-area');
  if (!area) { area = document.createElement('div'); area.id = 'print-area'; document.body.appendChild(area); }
  area.innerHTML = html;
  document.body.classList.add('printing');
  document.title = title;
  setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove('printing'), 500); }, 200);
}

/* --------------------------- 5. TETAPAN ------------------------------ */
function settingsView(view) {
  const s = settings(), c = child();
  view.innerHTML = `
    <h1>⚙️ ${L('Tetapan', 'Settings')}</h1>
    <p class="muted">${L('Semua tetapan disimpan dalam peranti ini sahaja.', 'All settings are stored on this device only.')}</p>

    <section class="card mt2">
      <h2>${L('Profil kanak-kanak', 'Child profile')}</h2>
      <div class="grid auto mt1">
        ${state().children.map((ch) => `<button class="tile ${ch.id === c.id ? '' : ''}" data-child="${ch.id}" style="align-items:center;text-align:center">
            ${ch.id === c.id ? `<span class="tag-you">${L('Sedang bermain', 'Playing now')}</span>` : ''}
            <span class="tile-ico">${MASCOTS.find((m) => m.id === ch.avatar)?.ico || '🧒'}</span>
            <span class="tile-name">${esc(ch.name)}</span><span class="tile-en">${ch.age} ${L('tahun', 'years')}</span></button>`).join('')}
        <button class="tile" data-addchild style="align-items:center;text-align:center"><span class="tile-ico">➕</span><span class="tile-name">${L('Tambah anak', 'Add child')}</span></button>
      </div>
    </section>

    <section class="card mt2">
      <h2>🌏 ${L('Bahasa & suara', 'Language & voice')}</h2>
      ${rowToggle('lang_ms', L('Bahasa Melayu', 'Bahasa Melayu'), s.lang === 'ms', '🇲🇾')}
      ${rowToggle('lang_en', 'English', s.lang === 'en', '🇬🇧')}
      ${rowToggle('tts', L('Narration suara (baca arahan)', 'Voice narration (read instructions)'), s.tts, '🔊')}
      ${rowToggle('music', L('Muzik latar', 'Background music'), s.music, '🎵')}
      ${rowToggle('sfx', L('Kesan bunyi', 'Sound effects'), s.sfx, '🔔')}
      ${rowToggle('captions', L('Kapsyen teks untuk audio', 'Text captions for audio'), s.captions, '💬')}
      ${rowToggle('voiceInput', L('Input suara (jawab dengan bercakap)', 'Voice input (answer by speaking)'), s.voiceInput, '🎙️')}
      <div class="row mt1">
        <label for="rate">${L('Kelajuan suara', 'Speech rate')}: <b data-rate>${s.narrationRate.toFixed(2)}</b></label>
        <input id="rate" type="range" min="0.7" max="1.2" step="0.05" value="${s.narrationRate}" style="flex:1;min-width:12rem">
      </div>
    </section>

    <section class="card mt2">
      <h2>♿ ${L('Aksesibiliti', 'Accessibility')}</h2>
      <div class="row mt1">
        <label for="fs">${L('Saiz teks', 'Text size')}: <b data-fs>${s.fontPx}px</b></label>
        <input id="fs" type="range" min="18" max="32" step="1" value="${s.fontPx}" style="flex:1;min-width:12rem">
      </div>
      ${rowToggle('dyslexia', L('Fon mesra disleksia (Lexend)', 'Dyslexia-friendly font (Lexend)'), s.dyslexia, '🔤')}
      ${rowToggle('contrast', L('Kontras tinggi', 'High contrast'), s.contrast, '🌗')}
      ${rowToggle('reduceMotion', L('Kurangkan animasi', 'Reduce animation'), s.reduceMotion, '🐢')}
      ${rowToggle('calm', L('Mod tenang (kurangkan stimulus)', 'Calm mode (less stimulation)'), s.calm, '🧘')}
      <p class="tiny muted mt1">${L('Petua: navigasi penuh boleh dibuat dengan kekunci Tab dan Enter.', 'Tip: full navigation works with the Tab and Enter keys.')}</p>
    </section>

    <section class="card mt2">
      <h2>⏳ ${L('Masa skrin', 'Screen time')}</h2>
      <div class="row">
        <label for="limit">${L('Had harian', 'Daily limit')}: <b data-limit>${s.screenLimitMin === 0 ? L('Tiada had', 'No limit') : s.screenLimitMin + ' ' + L('minit', 'minutes')}</b></label>
        <input id="limit" type="range" min="0" max="120" step="5" value="${s.screenLimitMin}" style="flex:1;min-width:12rem">
      </div>
      <p class="tiny muted">${L('Hari ini', 'Today')}: ${fmtMin(screenTime.today())} / ${s.screenLimitMin === 0 ? '∞' : s.screenLimitMin + ' min'}</p>
    </section>

    <section class="card mt2">
      <h2>🧠 ${L('Petunjuk AI', 'AI hints')}</h2>
      <div class="row">
        <label for="hint">${L('Beri petunjuk selepas', 'Give a hint after')}: <b data-hint>${Math.round(s.hintDelayMs / 1000)}s</b></label>
        <input id="hint" type="range" min="5" max="25" step="1" value="${Math.round(s.hintDelayMs / 1000)}" style="flex:1;min-width:12rem">
      </div>
    </section>`;
  wireSettings(view);
}

function rowToggle(id, label, on, ico) {
  return `<div class="row between" style="border-bottom:.1rem solid var(--line);padding:.35rem 0">
    <span>${ico} ${esc(label)}</span>
    <button class="btn ${on ? 'grass' : 'ghost'}" data-toggle="${id}" aria-pressed="${on}" style="min-height:2.6rem;padding:.35rem 1rem">${on ? '✓ ' + L('Hidup', 'On') : L('Mati', 'Off')}</button>
  </div>`;
}

function wireSettings(view) {
  $$('[data-toggle]', view).forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.toggle;
      audio.sfx('tap');
      if (k === 'lang_ms' || k === 'lang_en') { setLang(k === 'lang_en' ? 'en' : 'ms'); refresh(); return; }
      setSetting(k, !settings()[k]);
      if (k === 'music') { settings().music ? audio.startMusic() : audio.stopMusic(); }
      if (k === 'tts' && settings().tts) speak(L('Narration dihidupkan. Saya akan membaca semua arahan.', 'Narration is on. I will read every instruction.'));
      refresh();
    };
  });
  const fs = $('#fs', view);
  if (fs) fs.oninput = () => { setSetting('fontPx', +fs.value); $('[data-fs]', view).textContent = fs.value + 'px'; };
  const rt = $('#rate', view);
  if (rt) rt.oninput = () => { setSetting('narrationRate', +rt.value); $('[data-rate]', view).textContent = (+rt.value).toFixed(2); };
  const lm = $('#limit', view);
  if (lm) lm.oninput = () => { setSetting('screenLimitMin', +lm.value); $('[data-limit]', view).textContent = lm.value === '0' ? L('Tiada had', 'No limit') : lm.value + ' ' + L('minit', 'minutes'); };
  const hn = $('#hint', view);
  if (hn) hn.oninput = () => { setSetting('hintDelayMs', +hn.value * 1000); $('[data-hint]', view).textContent = hn.value + 's'; };
  $$('[data-child]', view).forEach((b) => { b.onclick = () => { setActiveChild(b.dataset.child); audio.sfx('pop'); refresh(); toast(L('Profil ditukar', 'Profile switched')); }; });
  const add = $('[data-addchild]', view);
  if (add) add.onclick = () => addChildFlow(refresh);
  const refresh = () => { renderTop(); settingsView(view); };
}

/* ---------------------------- 6. BANTUAN ----------------------------- */
function helpView(view) {
  view.innerHTML = `
    <h1>❓ ${L('Bantuan & Tutorial', 'Help & Tutorial')}</h1>
    <p class="muted">${L('Panduan ringkas untuk kanak-kanak, ibu bapa dan guru.', 'A short guide for children, parents and teachers.')}</p>
    <div class="narrator mt2">
      <span class="mascot">${inner(mascotSVG('bobo', 'happy'))}</span>
      <span class="bubble">${L('Kalau kamu tak tahu apa nak buat, tekan butang 💡 untuk petunjuk ya!', 'If you are not sure what to do, press the 💡 button for a hint!')}</span>
    </div>
    <section class="grid auto mt2">
      ${[[L('Untuk kanak-kanak', 'For children'), ['👆 ' + L('Sentuh gambar yang betul untuk menjawab.', 'Tap the correct picture to answer.'),
      '💡 ' + L('Tekan butang mentol untuk dapatkan petunjuk.', 'Press the lightbulb button to get a hint.'),
      '🔊 ' + L('Tekan butang pembesar suara untuk dengar semula arahan.', 'Press the speaker button to hear the instructions again.'),
      '⭐ ' + L('Kumpul bintang untuk buka dunia baharu.', 'Collect stars to unlock new worlds.')]],
      [L('Untuk ibu bapa', 'For parents'), ['👨‍👩‍👧 ' + L('Tekan ikon keluarga di bar atas untuk buka Mod Ibu Bapa (PIN).', 'Tap the family icon in the top bar to open Parent Mode (PIN).'),
      '⏳ ' + L('Tetapkan had masa skrin harian dalam Tetapan.', 'Set a daily screen-time limit in Settings.'),
      '♿ ' + L('Laraskan saiz teks, fon disleksia dan kontras untuk keperluan anak.', 'Adjust text size, dyslexia font and contrast for your child.'),
      '📊 ' + L('Lihat kemajuan, kekuatan dan cadangan aktiviti dalam dashboard.', 'See progress, strengths and activity suggestions in the dashboard.')]],
      [L('Untuk guru', 'For teachers'), ['🧩 ' + L('Setiap modul ada 5 tahap dengan kemahiran yang berbeza.', 'Every module has 5 levels covering different skills.'),
      '🗣️ ' + L('Guna modul Fonik & Bacaan untuk latihan literasi awal.', 'Use Phonics & Reading for early literacy practice.'),
      '🤝 ' + L('Modul Sosial-Emosi sesuai untuk perbincangan kelas.', 'The Social-Emotional module works well for class discussion.'),
      '🖨️ ' + L('Cetak sijil dan laporan mingguan untuk portfolio murid.', 'Print certificates and weekly reports for student portfolios.')]]]
      .map(([t, items]) => `<div class="card"><h3>${esc(t)}</h3><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}
    </section>
    <section class="card mt2">
      <h2>🛡️ ${L('Keselamatan & privasi', 'Safety & privacy')}</h2>
      <ul>
        <li>${L('Tiada iklan sama sekali.', 'No advertising at all.')}</li>
        <li>${L('Tiada penjejakan pihak ketiga dan tiada analitik luar.', 'No third-party tracking and no external analytics.')}</li>
        <li>${L('Semua data kemajuan disimpan dalam peranti ini (localStorage) dan boleh dipadam bila-bila masa.', 'All progress data is stored on this device (localStorage) and can be deleted at any time.')}</li>
        <li>${L('Tiada sembang terbuka dengan orang luar. Kanak-kanak tidak boleh menghantar mesej keluar.', 'No open chat with outsiders. Children cannot send messages out.')}</li>
        <li>${L('Mod Ibu Bapa dilindungi PIN 4 digit dengan had cubaan.', 'Parent Mode is protected by a 4-digit PIN with an attempt limit.')}</li>
        <li>${L('Kandungan ditapis oleh lapisan keselamatan AI sebelum dipaparkan.', 'Content is filtered by an AI safety layer before being shown.')}</li>
      </ul>
      <p class="tiny muted">${L('Rangkaian luar yang digunakan', 'External origins used')}: ${safety.networkAudit().join(', ') || L('tiada', 'none')}</p>
    </section>
    <section class="card mt2">
      <h2>📲 ${L('Pasang sebagai aplikasi', 'Install as an app')}</h2>
      <p>${L('Buka menu pelayar dan pilih "Tambah ke skrin utama" (Add to Home Screen). Platform ini akan berfungsi seperti aplikasi biasa, malah boleh digunakan tanpa internet.', 'Open the browser menu and choose "Add to Home Screen". This platform will work like a normal app, even offline.')}</p>
    </section>`;
}

/* ---------------------- 7. MOD IBU BAPA (PIN) ------------------------ */
function hashPin(p) { let x = 5381; for (const ch of String(p)) x = ((x << 5) + x + ch.charCodeAt(0)) >>> 0; return 'h' + x.toString(36); }

function parentView(view) {
  const st = state();
  if (!st.parent.pinSet) return setPinView(view);
  if (st.parent.lockedUntil > Date.now()) {
    view.innerHTML = `<div class="card center"><h1>🔒 ${L('Sekejap ya', 'One moment')}</h1>
      <p class="muted">${L('Terlalu banyak cubaan salah. Sila cuba lagi dalam', 'Too many wrong attempts. Please try again in')} ${Math.ceil((st.parent.lockedUntil - Date.now()) / 1000)}s.</p></div>`;
    setTimeout(() => parentView(view), 1000);
    return;
  }
  if (!view.dataset.unlocked) return pinView(view);
  dashboardView(view);
}

function keypadView(view, title, sub, onDone, extra = '') {
  let buf = '';
  view.innerHTML = `
    <div class="card center" style="max-width:32rem;margin:2rem auto">
      <div style="font-size:3rem">👨‍👩‍👧</div>
      <h1>${esc(title)}</h1>
      <p class="muted">${esc(sub)}</p>
      <div class="row" style="justify-content:center;gap:.6rem;margin:.8rem 0" data-dots>${[0, 1, 2, 3].map(() => '<span class="dot" style="width:1.4rem;height:1.4rem"></span>').join('')}</div>
      <div class="grid" style="grid-template-columns:repeat(3,1fr);max-width:20rem;margin:0 auto;gap:.6rem">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="btn ghost" data-k="${n}" style="min-height:4rem;font-size:1.5rem">${n}</button>`).join('')}
        <button class="btn ghost" data-k="del" style="min-height:4rem">⌫</button>
        <button class="btn ghost" data-k="0" style="min-height:4rem;font-size:1.5rem">0</button>
        <button class="btn grass" data-k="ok" style="min-height:4rem">✓</button>
      </div>
      ${extra}
      <p class="tiny muted mt1">${L('PIN menghalang kanak-kanak daripada menukar tetapan.', 'The PIN stops children from changing settings.')}</p>
    </div>`;
  const dots = () => $$('[data-dots] .dot', view).forEach((d, i) => d.classList.toggle('done', i < buf.length));
  const press = (k) => {
    audio.sfx('tap');
    if (k === 'del') buf = buf.slice(0, -1);
    else if (k === 'ok') { if (buf.length === 4) onDone(buf); else toast(L('Masukkan 4 digit', 'Enter 4 digits')); return; }
    else if (buf.length < 4) buf += k;
    dots();
  };
  $$('[data-k]', view).forEach((b) => { b.onclick = () => press(b.dataset.k); });
  view.onkeydown = (e) => { if (/^[0-9]$/.test(e.key)) press(e.key); if (e.key === 'Backspace') press('del'); if (e.key === 'Enter') press('ok'); };
}

function setPinView(view) {
  keypadView(view, L('Cipta PIN ibu bapa', 'Create a parent PIN'), L('Pilih 4 digit yang mudah diingat oleh ibu bapa.', 'Choose 4 digits that are easy for a parent to remember.'), (pin) => {
    const st = state();
    st.parent.pin = hashPin(pin); st.parent.pinSet = true; st.parent.failedTries = 0;
    save(); audio.sfx('badge'); toast(L('PIN disimpan', 'PIN saved'));
    view.dataset.unlocked = '1'; parentView(view);
  });
}

function pinView(view) {
  keypadView(view, L('Mod Ibu Bapa', 'Parent Mode'), L('Masukkan PIN 4 digit untuk teruskan.', 'Enter your 4-digit PIN to continue.'), (pin) => {
    const st = state();
    if (hashPin(pin) === st.parent.pin) {
      st.parent.failedTries = 0; save();
      audio.sfx('badge'); view.dataset.unlocked = '1'; parentView(view);
    } else {
      st.parent.failedTries = (st.parent.failedTries || 0) + 1;
      audio.sfx('wrong');
      if (st.parent.failedTries >= 5) { st.parent.lockedUntil = Date.now() + 60000; st.parent.failedTries = 0; }
      save(); toast(L('PIN salah', 'Wrong PIN'));
      parentView(view);
    }
  }, `<button class="btn ghost mt1" data-forgot>${L('Lupa PIN? Set semula', 'Forgot PIN? Reset')}</button>`)
  ;
  const f = $('[data-forgot]', view);
  if (f) f.onclick = () => {
    if (!confirm(L('Set semula PIN? Data kemajuan kanak-kanak tidak akan dipadam.', 'Reset the PIN? Children\'s progress data will not be deleted.'))) return;
    const st = state(); st.parent.pin = null; st.parent.pinSet = false; save(); parentView(view);
  };
}

function dashboardView(view) {
  const c = child(), r = childRewards(), p = childProgress();
  const rows = GAME_LIST.map((g) => ({ g, st: gameStats(g.id) }));
  const played = rows.filter((x) => x.st.plays > 0);
  const week = screenTime.week();
  const maxMin = Math.max(30, ...week.map((d) => d.minutes));
  const skills = {};
  SKILL_KEYS.forEach((k) => {
    let c1 = 0, t1 = 0;
    Object.values(p).forEach((st) => { if (st.skills && st.skills[k]) { c1 += st.skills[k].c; t1 += st.skills[k].t; } });
    skills[k] = t1 ? c1 / t1 : 0;
  });
  const sug = adaptive.suggest();
  const weakGame = sug.weak ? GAME_LIST.find((g) => g.id === sug.weak.id) : null;
  const net = safety.networkAudit();

  view.innerHTML = `
    <div class="row between">
      <div><h1 class="mb0">📊 ${L('Dashboard Ibu Bapa', 'Parent Dashboard')}</h1>
        <p class="muted">${L('Ringkasan kemajuan', 'Progress summary')}: <b>${esc(c.name)}</b> · ${c.age} ${L('tahun', 'years')}</p></div>
      <div class="row">
        <button class="btn ghost" data-report>📄 ${L('Laporan mingguan', 'Weekly report')}</button>
        <button class="btn ghost" data-lock>🔒 ${L('Kunci', 'Lock')}</button>
      </div>
    </div>

    <section class="grid auto-sm mt2">
      ${[[r.stars, L('Jumlah bintang', 'Total stars'), '⭐'], [played.length + '/' + GAME_LIST.length, L('Modul dimain', 'Modules played'), '🧩'],
      [fmtMin(screenTime.today()), L('Masa skrin hari ini', 'Screen time today'), '🕐'], [r.badges.length, L('Badge dikumpul', 'Badges earned'), '🏅'],
      [Math.max(0, ...rows.map((x) => x.st.bestStreak || 0)), L('Rekod berturut betul', 'Best streak'), '🎯']]
      .map(([v, t, i]) => `<div class="kpi center"><div style="font-size:1.6rem">${i}</div><b>${v}</b><span>${esc(t)}</span></div>`).join('')}
    </section>

    <section class="grid auto mt2" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))">
      <div class="card">
        <h2>💪 ${L('Kekuatan mengikut kemahiran', 'Strength by skill')}</h2>
        ${SKILL_KEYS.map((k) => {
    const v = Math.round(skills[k] * 100);
    return `<div class="skill-row"><span>${esc(settings().lang === 'en' ? SKILL_NAME[k].en : SKILL_NAME[k].ms)}</span>
            <span class="bar ${v >= 75 ? '' : v >= 50 ? 'y' : 'p'}"><i style="width:${v}%"></i></span><b>${v}%</b></div>`;
  }).join('')}
        <p class="tiny muted mt1">${L('Peratusan jawapan betul pada cubaan pertama bagi setiap kemahiran.', 'Percentage of first-attempt correct answers per skill.')}</p>
      </div>
      <div class="card">
        <h2>🕐 ${L('Masa skrin 7 hari', 'Screen time, 7 days')}</h2>
        <svg class="chart" viewBox="0 0 340 160" role="img" aria-label="${L('Carta masa skrin', 'Screen time chart')}">
          ${week.map((d, i) => {
    const bh = Math.round((d.minutes / maxMin) * 110);
    const x = 14 + i * 46;
    return `<rect class="bar-r" x="${x}" y="${130 - bh}" width="30" height="${Math.max(2, bh)}" rx="8" fill="${d.minutes > screenTime.limit() ? '#FF9EC4' : '#5BC0EB'}"/>
            <text x="${x + 15}" y="${150}" text-anchor="middle" font-size="12" fill="#8A84A6">${d.day}</text>
            <text x="${x + 15}" y="${126 - bh}" text-anchor="middle" font-size="11" fill="#5A5476">${Math.round(d.minutes)}</text>`;
  }).join('')}
        </svg>
        <p class="tiny muted">${L('Had harian', 'Daily limit')}: ${screenTime.limit() || '∞'} ${L('minit', 'minutes')} · ${L('Jumlah minggu ini', 'This week total')}: ${fmtMin(week.reduce((a, b) => a + b.minutes, 0))}</p>
      </div>
    </section>

    <section class="card mt2">
      <h2>📚 ${L('Kemajuan setiap modul', 'Progress by module')}</h2>
      <div class="scroll-x">
        <table class="data">
          <thead><tr><th>${L('Modul', 'Module')}</th><th>${L('Tahap', 'Level')}</th><th>${L('Bintang', 'Stars')}</th>
            <th>${L('Ketepatan', 'Accuracy')}</th><th>${L('Kali main', 'Plays')}</th><th>${L('Kemahiran', 'Skills')}</th></tr></thead>
          <tbody>
            ${rows.map(({ g, st }) => {
    const acc = st.total ? Math.round((st.correct / st.total) * 100) : 0;
    return `<tr><td>${g.ico} ${esc(gname(g))}</td><td>${st.level || 1}/5</td>
              <td>${'★'.repeat(st.stars || 0)}${'☆'.repeat(3 - (st.stars || 0))}</td>
              <td>${st.total ? acc + '%' : '—'}</td><td>${st.plays || 0}</td>
              <td class="tiny">${(g.skills || []).map((k) => esc(settings().lang === 'en' ? SKILL_NAME[k].en : SKILL_NAME[k].ms)).join(', ')}</td></tr>`;
  }).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card mt2">
      <h2>🤖 ${L('Cadangan AI', 'AI recommendation')}</h2>
      ${weakGame
      ? `<p>${L('Kelemahan dikesan', 'Weakness detected')}: <b>${esc(gname(weakGame))}</b> (${Math.round((sug.weak.acc || 0) * 100)}%). ${L('Cadangan', 'Suggested')}: ${esc(gtag(weakGame))}.</p>
           <button class="btn orange" data-go="#/play/${weakGame.id}">${L('Mula latihan', 'Start practice')}</button>`
      : `<p class="muted">${L('Belum ada data mencukupi. Ajak anak bermain sekurang-kurangnya 3 modul untuk analisis yang lebih tepat.', 'Not enough data yet. Have your child play at least 3 modules for a better analysis.')}</p>`}
      ${sug.idle && sug.idle.last ? `<p class="tiny muted">${L('Terakhir dimain', 'Last played')}: ${esc(GAME_LIST.find((g) => g.id === sug.idle.id)?.ms || '')} · ${new Date(sug.idle.last).toLocaleDateString()}</p>` : ''}
    </section>

    <section class="card mt2">
      <h2>🛡️ ${L('Lapisan Keselamatan', 'Safety layer')}</h2>
      <div class="grid auto">
        <div><span class="pill g">✓ COPPA / GDPR-K</span> <p class="tiny muted mt1">${L('Tiada pengumpulan data peribadi kanak-kanak. Nama hanya disimpan dalam peranti ini dan tidak dihantar ke pelayan mana-mana.', 'No collection of children\'s personal data. Names are stored on this device only and never sent to any server.')}</p></div>
        <div><span class="pill g">✓ ${L('Tiada iklan', 'No ads')}</span> <p class="tiny muted mt1">${L('Tiada SDK pengiklanan, tiada penjejakan pihak ketiga, tiada kuki analitik.', 'No advertising SDK, no third-party tracking, no analytics cookies.')}</p></div>
        <div><span class="pill g">✓ ${L('Asal rangkaian', 'Network origins')}</span> <p class="tiny muted mt1">${net.length ? esc(net.join(', ')) : L('Tiada sambungan luar dikesan.', 'No external connections detected.')}</p></div>
        <div><span class="pill g">✓ ${L('Penapis kandungan', 'Content filter')}</span> <p class="tiny muted mt1">${L('Penapisan setempat aktif. Peristiwa ditapis', 'Local filter active. Filtered events')}: ${safety.log().length}</p></div>
      </div>
      <div class="row mt1">
        <button class="btn ghost" data-export>⬇️ ${L('Eksport data (JSON)', 'Export data (JSON)')}</button>
        <button class="btn ghost" data-wipe>🗑️ ${L('Padam semua data', 'Delete all data')}</button>
      </div>
    </section>

    <section class="card mt2">
      <h2>👶 ${L('Urus profil kanak-kanak', 'Manage child profiles')}</h2>
      ${state().children.map((ch) => `<div class="row between" style="border-bottom:.1rem solid var(--line);padding:.4rem 0">
        <span>${MASCOTS.find((m) => m.id === ch.avatar)?.ico || '🧒'} <b>${esc(ch.name)}</b> · ${ch.age} ${L('tahun', 'years')} · ⭐ ${(state().rewards[ch.id] || {}).stars || 0}</span>
        <span class="row">
          <button class="btn ghost" data-switch="${ch.id}" style="min-height:2.4rem;padding:.3rem .9rem">${L('Guna', 'Use')}</button>
          <button class="btn ghost" data-del="${ch.id}" style="min-height:2.4rem;padding:.3rem .9rem">🗑️</button>
        </span></div>`).join('')}
      <button class="btn grass mt1" data-addchild2>➕ ${L('Tambah profil', 'Add profile')}</button>
    </section>`;
  wireDashboard(view);
}

function wireDashboard(view) {
  $$('[data-go]', view).forEach((b) => { b.onclick = () => navigate(b.dataset.go); });
  const lock = $('[data-lock]', view);
  if (lock) lock.onclick = () => { delete view.dataset.unlocked; audio.sfx('whoosh'); parentView(view); };
  const rep = $('[data-report]', view);
  if (rep) rep.onclick = () => printReport();
  const ex = $('[data-export]', view);
  if (ex) ex.onclick = () => {
    const data = JSON.stringify(state(), null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `ai-playground-data-${todayKey()}.json`;
    a.click();
    toast(L('Data dieksport', 'Data exported'));
  };
  const w = $('[data-wipe]', view);
  if (w) w.onclick = () => {
    if (!confirm(L('Padam semua data kemajuan? Tindakan ini tidak boleh dibatalkan.', 'Delete all progress data? This cannot be undone.'))) return;
    localStorage.removeItem('aipk.v2'); location.reload();
  };
  $$('[data-switch]', view).forEach((b) => { b.onclick = () => { setActiveChild(b.dataset.switch); renderTop(); dashboardView(view); }; });
  $$('[data-del]', view).forEach((b) => {
    b.onclick = () => {
      if (!confirm(L('Padam profil ini?', 'Delete this profile?'))) return;
      if (removeChild(b.dataset.del)) { renderTop(); dashboardView(view); } else toast(L('Mesti ada sekurang-kurangnya satu profil', 'At least one profile is required'));
    };
  });
  const a2 = $('[data-addchild2]', view);
  if (a2) a2.onclick = () => addChildFlow(() => { renderTop(); dashboardView(view); });
}

function printReport() {
  const c = child(), r = childRewards(), p = childProgress();
  const week = screenTime.week();
  const rows = GAME_LIST.map((g) => ({ g, st: gameStats(g.id) }));
  const html = `
    <div class="card">
      <h1>${L('Laporan Kemajuan Mingguan', 'Weekly Progress Report')}</h1>
      <p class="muted">${L('Nama', 'Name')}: <b>${esc(c.name)}</b> · ${L('Tarikh', 'Date')}: ${new Date().toLocaleDateString(settings().lang === 'en' ? 'en-GB' : 'ms-MY')}</p>
      <p><b>⭐ ${r.stars}</b> ${L('bintang', 'stars')} · <b>${r.badges.length}</b> ${L('badge', 'badges')} · <b>${fmtMin(week.reduce((a, b) => a + b.minutes, 0))}</b> ${L('masa skrin minggu ini', 'screen time this week')}</p>
      <table class="data mt1"><thead><tr><th>${L('Modul', 'Module')}</th><th>${L('Tahap', 'Level')}</th><th>${L('Bintang', 'Stars')}</th><th>${L('Ketepatan', 'Accuracy')}</th><th>${L('Kali main', 'Plays')}</th></tr></thead>
      <tbody>${rows.map(({ g, st }) => `<tr><td>${esc(gname(g))}</td><td>${st.level || 1}/5</td><td>${st.stars || 0}/3</td>
        <td>${st.total ? Math.round((st.correct / st.total) * 100) + '%' : '—'}</td><td>${st.plays || 0}</td></tr>`).join('')}</tbody></table>
      <h3 class="mt2">${L('Masa skrin harian', 'Daily screen time')}</h3>
      <ul>${week.map((d) => `<li>${d.day} (${d.date}): ${fmtMin(d.minutes)}</li>`).join('')}</ul>
      <p class="tiny muted">${L('Data ini dijana setempat daripada peranti ini sahaja. Tiada data dihantar ke internet.', 'This report is generated locally from this device only. No data is sent to the internet.')}</p>
    </div>`;
  printSection(html, L('Laporan Mingguan', 'Weekly Report'));
}

/* --------------------- 8. ONBOARDING & TAMBAH ANAK ------------------- */
export function onboardingFlow() {
  const sheet = overlay(`
    <div class="center">
      <div class="row" style="justify-content:center;gap:.4rem">
        <span class="mascot lg">${inner(mascotSVG('ari', 'happy'))}</span>
        <span class="mascot lg">${inner(mascotSVG('kiko', 'happy'))}</span>
        <span class="mascot lg">${inner(mascotSVG('bobo', 'happy'))}</span>
      </div>
      <h1 class="mt1">${L('Selamat datang ke AI Playground!', 'Welcome to AI Playground!')}</h1>
      <p class="muted">${L('Mari sediakan profil kanak-kanak dahulu. Ia mengambil masa kurang seminit.', 'Let us set up a child profile first. It takes less than a minute.')}</p>
      <div class="stack mt1" style="text-align:left">
        <label>${L('Nama panggilan anak', 'Child nickname')}
          <input id="ob-name" class="opt" style="min-height:3.4rem;width:100%;padding:.6rem 1rem;font-size:1.1rem" maxlength="24" placeholder="${L('cth. Aisy', 'e.g. Aisy')}">
        </label>
        <label>${L('Umur', 'Age')}
          <select id="ob-age" class="opt" style="min-height:3.4rem;width:100%;padding:.6rem 1rem;font-size:1.1rem">
            ${[5, 6, 7, 8].map((a) => `<option value="${a}">${a} ${L('tahun', 'years')}</option>`).join('')}
          </select>
        </label>
        <div>${L('Pilih kawan', 'Choose a friend')}
          <div class="row" style="justify-content:center">
            ${MASCOTS.map((m, i) => `<button class="btn ${i === 0 ? 'purple' : 'ghost'}" data-av="${m.id}" aria-pressed="${i === 0}">${m.ico} ${m.name}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="row mt2" style="justify-content:center">
        <button class="btn grass big" data-ob-done>✅ ${L('Mula Bermain', 'Start Playing')}</button>
      </div>
      <p class="tiny muted mt1">${L('Ibu bapa boleh menetapkan PIN pengawasan kemudian dalam Mod Ibu Bapa.', 'Parents can set a supervision PIN later in Parent Mode.')}</p>
    </div>`, { sticky: true });
  let avatar = 'ari';
  $$('[data-av]', sheet).forEach((b) => {
    b.onclick = () => {
      avatar = b.dataset.av;
      $$('[data-av]', sheet).forEach((x) => { x.setAttribute('aria-pressed', String(x === b)); x.className = 'btn ' + (x === b ? 'purple' : 'ghost'); });
      audio.sfx('tap');
    };
  });
  $('[data-ob-done]', sheet).onclick = () => {
    const name = safety.sanitize($('#ob-name', sheet).value) || L('Kawan Kecil', 'Little Friend');
    const age = +$('#ob-age', sheet).value;
    const c = child();
    c.name = name; c.age = age; c.avatar = avatar;
    state().onboarded = true;
    save();
    closeOverlay();
    audio.sfx('badge');
    renderTop();
    render();
    speak(L(`Selamat datang ${name}! Jom kita bermain.`, `Welcome ${name}! Let us play.`));
  };
  audio.sfx('pop');
}

function addChildFlow(after) {
  const sheet = overlay(`
    <div class="center">
      <h2>➕ ${L('Tambah profil kanak-kanak', 'Add a child profile')}</h2>
      <div class="stack" style="text-align:left">
        <label>${L('Nama panggilan', 'Nickname')}
          <input id="ac-name" class="opt" style="min-height:3.2rem;width:100%;padding:.5rem 1rem" maxlength="24"></label>
        <label>${L('Umur', 'Age')}
          <select id="ac-age" class="opt" style="min-height:3.2rem;width:100%;padding:.5rem 1rem">
            ${[5, 6, 7, 8].map((a) => `<option value="${a}">${a} ${L('tahun', 'years')}</option>`).join('')}</select></label>
        <div>${L('Kawan', 'Friend')}
          <div class="row" style="justify-content:center">
            ${MASCOTS.map((m, i) => `<button class="btn ${i === 0 ? 'purple' : 'ghost'}" data-av2="${m.id}">${m.ico} ${m.name}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="row mt2" style="justify-content:center">
        <button class="btn grass" data-ac-save>💾 ${L('Simpan', 'Save')}</button>
        <button class="btn ghost" data-ac-cancel>${L('Batal', 'Cancel')}</button>
      </div>
    </div>`);
  let avatar = 'ari';
  $$('[data-av2]', sheet).forEach((b) => {
    b.onclick = () => {
      avatar = b.dataset.av2;
      $$('[data-av2]', sheet).forEach((x) => { x.className = 'btn ' + (x === b ? 'purple' : 'ghost'); });
    };
  });
  $('[data-ac-cancel]', sheet).onclick = closeOverlay;
  $('[data-ac-save]', sheet).onclick = () => {
    addChild($('#ac-name', sheet).value, +$('#ac-age', sheet).value, avatar);
    closeOverlay(); toast(L('Profil ditambah', 'Profile added')); if (after) after();
  };
}

/* --------------------------- 9. MASA SKRIN --------------------------- */
export function checkScreenTime() {
  const [route] = parseHash();
  if (route === 'parent') return;
  if (!screenTime.locked()) {
    const left = screenTime.remaining();
    if (left !== Infinity && left <= 5 && !checkScreenTime.warned) {
      checkScreenTime.warned = true;
      overlay(`<div class="center"><div style="font-size:3rem">⏳</div><h2>${L('5 minit lagi', '5 minutes left')}</h2>
        <p class="muted">${L('Masa bermain hampir tamat. Mari bersiap untuk aktiviti lain.', 'Play time is almost over. Let us get ready for another activity.')}</p>
        <button class="btn grass big" data-ok>${L('Baik, faham', 'Okay, understood')}</button></div>`);
      const s = $('#overlay .sheet');
      $('[data-ok]', s).onclick = () => { closeOverlay(); speak(L('Lima minit lagi ya.', 'Five more minutes.')); };
    }
    return;
  }
  if (checkScreenTime.shown) return;
  checkScreenTime.shown = true;
  stopSpeak();
  overlay(`<div class="center"><div style="font-size:3.5rem">🌙</div>
    <h1>${L('Masa bermain tamat', 'Play time is over')}</h1>
    <p class="muted">${L('Kamu sudah bermain cukup lama hari ini. Mari berehat, minum air dan bermain di luar!', 'You have played enough today. Let us rest, drink water and play outside!')}</p>
    <div class="row" style="justify-content:center"><span class="mascot lg">${inner(mascotSVG('kiko', 'happy'))}</span></div>
    <div class="row mt2" style="justify-content:center">
      <button class="btn purple big" data-parent>👨‍👩‍👧 ${L('Mod Ibu Bapa', 'Parent Mode')}</button>
    </div>
    <p class="tiny muted mt1">${L('Ibu bapa boleh menambah had masa dalam Tetapan atau Mod Ibu Bapa.', 'Parents can increase the limit in Settings or Parent Mode.')}</p></div>`, { sticky: true });
  const s = $('#overlay .sheet');
  $('[data-parent]', s).onclick = () => { closeOverlay(); checkScreenTime.shown = false; navigate('#/parent'); };
  speak(L('Masa bermain tamat. Jumpa lagi esok!', 'Play time is over. See you tomorrow!'));
}

/* ---------------------------- 10. BOOT ------------------------------- */
export function boot() {
  load();
  document.documentElement.lang = settings().lang;
  const onFirst = () => {
    audio.unlock();
    if (settings().music && !isOverlayOpen()) audio.startMusic();
    document.removeEventListener('pointerdown', onFirst);
  };
  document.addEventListener('pointerdown', onFirst, { once: false });

  window.addEventListener('hashchange', render);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOverlayOpen()) closeOverlay();
    if (e.altKey && e.key === 'h') navigate('#/');
    if (e.altKey && e.key === 'p') navigate('#/playground');
  });
  onChange((evt) => { if (evt === 'stars' || evt === 'rewards') renderTop(); });

  render();
  if (!state().onboarded) setTimeout(() => onboardingFlow(), 400);

  // Kiraan masa skrin
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    const [route] = parseHash();
    if (route === 'parent' || isOverlayOpen()) return;
    screenTime.add(0.5);
    checkScreenTime();
  }, 30000);
  checkScreenTime();

  // PWA
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  safety.audit('app_started', { lang: settings().lang });
}

export { render, renderTop, printSection };

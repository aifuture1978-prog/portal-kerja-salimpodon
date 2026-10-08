/* =========================================================================
   core.js — Enjin Teras AI Playground Kanak-Kanak
   - Storan setempat (obfuskasi XOR, tiada data keluar dari peranti)
   - Dwibahasa (Bahasa Melayu / English)
   - Audio: Web Audio SFX + muzik latar + SpeechSynthesis (narration)
   - Adaptive Learning Engine
   - Sistem ganjaran (bintang, badge, sticker, unlock)
   - Kawalan masa skrin + Lapisan Keselamatan (COPPA / GDPR-K)
   ========================================================================= */

/* ------------------------------ 0. UTIL ------------------------------ */
export const $  = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const rnd = (n) => Math.floor(Math.random() * n);
export const pick = (a) => a[rnd(a.length)];
export const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = rnd(i + 1); [x[i], x[j]] = [x[j], x[i]]; } return x; };
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const todayKey = () => new Date().toISOString().slice(0, 10);
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
export const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

/* --------------------------- 1. STORAN ------------------------------ */
const KEY = 'aipk.v2';
const SALT = 'ai-playground-kanak-kanak-2026';

function enc(obj) {
  try {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    const s = new TextEncoder().encode(SALT);
    for (let i = 0; i < bytes.length; i++) bytes[i] ^= s[i % s.length];
    let bin = ''; for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  } catch { return ''; }
}
function dec(txt) {
  try {
    const bin = atob(txt);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const s = new TextEncoder().encode(SALT);
    for (let i = 0; i < bytes.length; i++) bytes[i] ^= s[i % s.length];
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; }
}

const DEFAULTS = () => ({
  version: 2,
  created: Date.now(),
  parent: { pin: null, pinSet: false, failedTries: 0, lockedUntil: 0 },
  children: [],
  activeChildId: null,
  settings: {
    lang: 'ms', tts: true, sfx: true, music: true,
    fontPx: 18, dyslexia: false, contrast: false, reduceMotion: false,
    captions: true, voiceInput: false, calm: false, narrationRate: 0.95,
    screenLimitMin: 30, hintDelayMs: 10000
  },
  progress: {},      // childId -> gameId -> stats
  rewards: {},       // childId -> {stars, badges[], stickers[], unlocks[]}
  sessions: [],      // {childId, date, minutes}
  safetyLog: [],     // audit setempat sahaja
  storySeen: {},     // childId -> n
  onboarded: false
});

let S = DEFAULTS();
const listeners = new Set();
export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = (evt) => listeners.forEach((f) => { try { f(evt); } catch (e) { console.warn(e); } });

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = dec(raw); if (d && d.version === 2) S = Object.assign(DEFAULTS(), d); }
  } catch { /* storan tidak tersedia — berjalan dalam mod memori */ }
  if (!S.children.length) seedFirstRun();
  if (!S.activeChildId || !S.children.some((c) => c.id === S.activeChildId)) S.activeChildId = S.children[0].id;
  applySettings();
  return S;
}
export function save() {
  try { localStorage.setItem(KEY, enc(S)); } catch { /* mod memori */ }
  emit('save');
}
export const state = () => S;
export const settings = () => S.settings;

function seedFirstRun() {
  const id = uid();
  S.children = [{ id, name: 'Kawan Kecil', avatar: 'ari', age: 6, createdAt: Date.now() }];
  S.activeChildId = id;
  S.rewards[id] = { stars: 0, badges: [], stickers: [], unlocks: [] };
  S.progress[id] = {};
}
export function child() { return S.children.find((c) => c.id === S.activeChildId) || S.children[0]; }
export function childProgress() { const c = child(); if (!S.progress[c.id]) S.progress[c.id] = {}; return S.progress[c.id]; }
export function childRewards() { const c = child(); if (!S.rewards[c.id]) S.rewards[c.id] = { stars: 0, badges: [], stickers: [], unlocks: [] }; return S.rewards[c.id]; }
export function gameStats(gameId) {
  const p = childProgress();
  if (!p[gameId]) p[gameId] = { level: 1, maxLevel: 1, stars: 0, plays: 0, correct: 0, total: 0, bestStreak: 0, recent: [], lastPlayed: 0, skills: {}, ms: 0 };
  return p[gameId];
}
export function addChild(name, age, avatar) {
  const id = uid();
  S.children.push({ id, name: safety.sanitize(name) || 'Kawan Kecil', age: clamp(+age || 6, 3, 12), avatar: avatar || 'ari', createdAt: Date.now() });
  S.progress[id] = {}; S.rewards[id] = { stars: 0, badges: [], stickers: [], unlocks: [] };
  S.activeChildId = id; save(); emit('children'); return id;
}
export function setActiveChild(id) { if (S.children.some((c) => c.id === id)) { S.activeChildId = id; save(); emit('child'); } }
export function removeChild(id) {
  if (S.children.length <= 1) return false;
  S.children = S.children.filter((c) => c.id !== id);
  delete S.progress[id]; delete S.rewards[id];
  if (S.activeChildId === id) S.activeChildId = S.children[0].id;
  save(); emit('children'); return true;
}

/* --------------------------- 2. BAHASA ------------------------------ */
/** L('Melayu','English') → mengikut tetapan bahasa semasa */
export function L(ms, en) { return S.settings.lang === 'en' ? en : ms; }
export const lang = () => S.settings.lang;
export function setLang(v) { S.settings.lang = v === 'en' ? 'en' : 'ms'; save(); emit('settings'); }

/* ------------------------ 3. TETAPAN & TEMA ------------------------- */
export function setSetting(k, v) {
  S.settings[k] = v;
  applySettings(); save(); emit('settings');
}
export function applySettings() {
  const st = S.settings, b = document.body, r = document.documentElement;
  r.style.fontSize = clamp(st.fontPx, 16, 34) + 'px';
  b.dataset.dys = st.dyslexia ? '1' : '0';
  b.dataset.contrast = st.contrast ? '1' : '0';
  b.dataset.reduce = st.reduceMotion ? '1' : '0';
  b.dataset.calm = st.calm ? '1' : '0';
  b.style.setProperty('--speed', st.reduceMotion ? '0' : '1');
  document.documentElement.lang = st.lang;
}

/* ---------------------------- 4. AUDIO ------------------------------ */
let actx = null, masterGain = null, musicTimer = null, musicStep = 0, musicOn = false;

function ensureCtx() {
  if (actx) return actx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  actx = new AC();
  masterGain = actx.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(actx.destination);
  return actx;
}
function tone(freq, at, dur, type = 'triangle', gain = 0.16, glide = 0) {
  const c = ensureCtx(); if (!c || !S.settings.sfx) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, at);
  if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(60, freq * glide), at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g); g.connect(masterGain);
  o.start(at); o.stop(at + dur + 0.05);
}
function noise(at, dur = 0.16, gain = 0.12) {
  const c = ensureCtx(); if (!c || !S.settings.sfx) return;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource(); src.buffer = buf;
  const g = c.createGain(); g.gain.value = gain;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900;
  src.connect(f); f.connect(g); g.connect(masterGain); src.start(at);
}

const SFX = {
  tap:   (t) => tone(720, t, 0.09, 'square', 0.07),
  pop:   (t) => tone(880, t, 0.1, 'triangle', 0.12, 1.4),
  correct: (t) => { [523.25, 659.25, 783.99].forEach((f, i) => tone(f, t + i * 0.075, 0.22, 'triangle', 0.15)); },
  wrong: (t) => { [392, 329.63].forEach((f, i) => tone(f, t + i * 0.13, 0.24, 'sine', 0.11)); },
  star:  (t) => { [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.055, 0.2, 'triangle', 0.1)); },
  badge: (t) => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.11, 0.34, 'triangle', 0.14)); },
  whoosh:(t) => noise(t, 0.22, 0.09),
  count: (t) => tone(440, t, 0.11, 'sine', 0.12),
  drum:  (t) => noise(t, 0.13, 0.2),
  bell:  (t) => { tone(1318.5, t, 0.7, 'sine', 0.1); tone(1975.5, t, 0.5, 'sine', 0.05); },
  hint:  (t) => { [659.25, 987.77].forEach((f, i) => tone(f, t + i * 0.1, 0.3, 'sine', 0.1)); }
};
/** Nada "nyanyian" lembut (dua oscillator + lowpass) untuk muzik latar */
function singNote(c, freq, at, dur = 1.0, peak = 0.07) {
  if (!c) return;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1900;
  const g = c.createGain(); f.connect(g); g.connect(masterGain);
  const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = freq;
  const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq; o2.detune.value = 5;
  o1.connect(f); o2.connect(f);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.07);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o1.start(at); o2.start(at); o1.stop(at + dur + 0.05); o2.stop(at + dur + 0.05);
}
/** Bes lembut pada permulaan frasa */
function bassNote(c, freq, at) {
  if (!c) return;
  const g = c.createGain(); const o = c.createOscillator();
  o.type = 'sine'; o.frequency.value = freq; o.connect(g); g.connect(masterGain);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.05, at + 0.2);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 2.2);
  o.start(at); o.stop(at + 2.3);
}
/** Nota terapung yang bergerak naik mengikut irama (kesan kartun nyanyian) */
function rhymeNote() {
  if (S.settings.reduceMotion || S.settings.calm) return;
  const sky = document.getElementById('sky'); if (!sky) return;
  const n = document.createElement('span');
  n.className = 'deco rhyme';
  n.textContent = pick(['🎵', '🎶', '♪', '♫', '✨', '⭐']);
  n.style.left = (8 + Math.random() * 84) + '%';
  n.style.setProperty('--dur', (14 + Math.random() * 8) + 's');
  sky.appendChild(n);
  setTimeout(() => n.remove(), 26000);
}

export const audio = {
  unlock() {
    const c = ensureCtx(); if (c && c.state === 'suspended') c.resume();
  },
  sfx(name) {
    const c = ensureCtx(); if (!c || !S.settings.sfx) return;
    if (c.state === 'suspended') c.resume();
    (SFX[name] || SFX.tap)(c.currentTime + 0.01);
  },
  /** Nada muzik untuk modul Muzik & Irama */
  note(freq, kind = 'piano') {
    const c = ensureCtx(); if (!c) return;
    const t = c.currentTime + 0.01;
    if (!S.settings.sfx) return;
    if (kind === 'drum') return noise(t, 0.16, 0.22);
    if (kind === 'bell') return SFX.bell(t);
    if (kind === 'flute') return tone(freq, t, 0.6, 'sine', 0.14);
    if (kind === 'guitar') return tone(freq, t, 0.5, 'sawtooth', 0.09);
    tone(freq, t, 0.45, 'triangle', 0.15); tone(freq * 2, t, 0.3, 'sine', 0.05);
  },
/**
 * Muzik latar = lagu kanak-kanak ringkas ("Bintang Kecil" / Twinkle Twinkle)
 * dinyanyikan dengan nada lembut + harmoni & bes. Berulang tanpa henti.
 */
startMusic() {
  const c = ensureCtx(); if (!c || musicOn) return;
  musicOn = true;
  // Skala C major: C D E F G A B C5
  const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
  // Irama "Bintang Kecil" (Twinkle Twinkle Little Star)
  const melody = [0,0,4,4,5,5,4, 3,3,2,2,1,1,0, 4,4,3,3,2,2,1, 4,4,3,3,2,2,1, 0,0,4,4,5,5,4, 3,3,2,2,1,1,0];
  const beat = 520;
  musicStep = 0;
  const tick = () => {
    if (!S.settings.music || !musicOn) return;
    const calm = S.settings.calm;
    const n = melody[musicStep % melody.length];
    const t = c.currentTime + 0.05;
    singNote(c, scale[n], t, calm ? 0.72 : 1.0, calm ? 0.05 : 0.07);
    if (musicStep % 2 === 1) singNote(c, scale[Math.max(0, n - 4)], t + 0.02, calm ? 0.42 : 0.62, calm ? 0.028 : 0.04);
    if (musicStep % 7 === 0) bassNote(c, scale[0] / 2, t);
    if (musicStep % 4 === 0) rhymeNote();
    musicStep++;
  };
  tick();
  musicTimer = setInterval(tick, beat);
},
  stopMusic() { musicOn = false; if (musicTimer) clearInterval(musicTimer); musicTimer = null; }
};

/* --------------------------- 5. NARRATION --------------------------- */
let voiceCache = null;
function bestVoice() {
  if (!('speechSynthesis' in window)) return null;
  if (voiceCache) return voiceCache;
  const vs = speechSynthesis.getVoices();
  if (!vs.length) return null;
  const want = S.settings.lang === 'en' ? ['en-GB', 'en-US', 'en'] : ['ms-MY', 'ms', 'id-ID', 'id'];
  for (const w of want) {
    const v = vs.find((x) => x.lang && x.lang.toLowerCase().startsWith(w.toLowerCase()));
    if (v) { voiceCache = v; return v; }
  }
  voiceCache = vs.find((v) => /female|zira|samantha|google/i.test(v.name)) || vs[0];
  return voiceCache;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voiceCache = null; bestVoice(); };

export function speak(text, opts = {}) {
  if (!S.settings.tts || !text || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[•★☆→←]/g, ' '));
    const v = bestVoice(); if (v) u.voice = v;
    u.lang = S.settings.lang === 'en' ? 'en-US' : 'ms-MY';
    u.rate = opts.rate ?? S.settings.narrationRate;
    u.pitch = opts.pitch ?? 1.15;
    u.volume = 1;
    speechSynthesis.speak(u);
  } catch { /* senyap jika tidak disokong */ }
}
export function stopSpeak() { try { speechSynthesis.cancel(); } catch {} }

/* ----------------------- 6. ADAPTIVE ENGINE ------------------------- */
/**
 * Menyesuaikan tahap kesukaran berdasarkan prestasi 3 pusingan terakhir.
 * Naik tahap jika ketepatan ≥ 85%, turun jika < 50%.
 */
export const adaptive = {
  level(gameId) { return clamp(gameStats(gameId).level, 1, 5); },
  record(gameId, res) {
    const st = gameStats(gameId);
    const acc = res.total ? res.correct / res.total : 0;
    st.plays++; st.correct += res.correct; st.total += res.total; st.ms += res.ms || 0;
    st.lastPlayed = Date.now();
    st.recent = [...(st.recent || []), +acc.toFixed(3)].slice(-3);
    st.maxLevel = Math.max(st.maxLevel || 1, st.level);
    const avg = mean(st.recent);
    let move = 'hold';
    if (st.recent.length >= 2 && avg >= 0.85 && st.level < 5) { st.level++; move = 'up'; }
    else if (st.recent.length >= 2 && avg < 0.5 && st.level > 1) { st.level--; move = 'down'; }
    if (res.streak > (st.bestStreak || 0)) st.bestStreak = res.streak;
    (res.skills || []).forEach((k) => {
      const cur = st.skills[k] || { c: 0, t: 0 };
      st.skills[k] = { c: cur.c + res.correct, t: cur.t + res.total };
    });
    save();
    return { move, acc, level: st.level, avg };
  },
  /** Cadangan modul seterusnya berdasarkan kelemahan & minat */
  suggest() {
    const p = childProgress();
    const ranked = Object.entries(p)
      .filter(([, v]) => v.plays > 0)
      .map(([id, v]) => ({ id, acc: v.total ? v.correct / v.total : 0, level: v.level, last: v.lastPlayed }));
    const weak = ranked.filter((r) => r.acc < 0.7).sort((a, b) => a.acc - b.acc)[0];
    const idle = ranked.sort((a, b) => a.last - b.last)[0];
    return { weak, idle, played: ranked.length };
  }
};

/* -------------------------- 7. GANJARAN ----------------------------- */
export const BADGES = [
  { id: 'first',   ms: 'Langkah Pertama',  en: 'First Steps',     ico: '👟', test: (s) => s.totalPlays >= 1 },
  { id: 'color',   ms: 'Master Warna',     en: 'Color Master',    ico: '🎨', test: (s) => s.g('colors', 5, 3) },
  { id: 'letter',  ms: 'Detektif Huruf',   en: 'Letter Detective',ico: '🔤', test: (s) => s.g('letters', 5, 3) },
  { id: 'word',    ms: 'Pembina Perkataan',en: 'Word Builder',    ico: '🧩', test: (s) => s.g('words', 5, 3) },
  { id: 'brain',   ms: 'Ahli Fikir',       en: 'Brain Champ',     ico: '🧠', test: (s) => s.g('puzzle', 5, 3) },
  { id: 'number',  ms: 'Safari Nombor',    en: 'Number Safari',   ico: '🔢', test: (s) => s.g('numbers', 5, 3) },
  { id: 'shape',   ms: 'Raja Bentuk',      en: 'Shape King',      ico: '🔺', test: (s) => s.g('shapes', 5, 3) },
  { id: 'artist',  ms: 'Artis Kecil',      en: 'Little Artist',   ico: '✏️', test: (s) => s.g('trace', 5, 3) },
  { id: 'story',   ms: 'Pencerita Hebat',  en: 'Great Storyteller',ico:'📖', test: (s) => s.g('story', 3, 2) },
  { id: 'phonics', ms: 'Juara Fonik',      en: 'Phonics Pro',     ico: '🗣️', test: (s) => s.g('phonics', 5, 3) },
  { id: 'explore', ms: 'Penjelajah Alam',  en: 'Nature Explorer', ico: '🔬', test: (s) => s.g('science', 5, 3) },
  { id: 'heart',   ms: 'Hati Baik',        en: 'Kind Heart',      ico: '💖', test: (s) => s.g('feelings', 5, 3) },
  { id: 'music',   ms: 'Maestro Muzik',    en: 'Music Maestro',   ico: '🎵', test: (s) => s.g('music', 5, 3) },
  { id: 'stars50', ms: 'Pengumpul Bintang',en: 'Star Collector',  ico: '⭐', test: (s) => s.stars >= 50 },
  { id: 'stars150',ms: 'Langit Berbintang',en: 'Starry Sky',      ico: '🌟', test: (s) => s.stars >= 150 },
  { id: 'streak',  ms: 'Fokus Hebat',      en: 'Super Focus',     ico: '🎯', test: (s) => s.bestStreak >= 8 },
  { id: 'explorer',ms: 'Semua Dunia',      en: 'All Worlds',      ico: '🗺️', test: (s) => s.playedGames >= 8 },
  { id: 'loyal',   ms: 'Kawan Setia',      en: 'Loyal Friend',    ico: '🤝', test: (s) => s.days >= 5 }
];
export const STICKERS = ['⭐','🌈','🦊','🤖','🐢','🐠','🌸','🚀','🍎','🐝','🦋','🍩','🐼','🌻','⚽','🎈','🐳','🍀','🎁','👑'];

export const rewards = {
  addStars(n) {
    const r = childRewards(); r.stars = Math.max(0, r.stars + n); save(); emit('stars');
    return r.stars;
  },
  /** Kira semula badge/sticker/unlock selepas setiap pusingan */
  sync(extra = {}) {
    const r = childRewards(), p = childProgress();
    const stats = {
      stars: r.stars,
      totalPlays: Object.values(p).reduce((s, v) => s + (v.plays || 0), 0),
      playedGames: Object.values(p).filter((v) => v.plays > 0).length,
      bestStreak: Math.max(0, ...Object.values(p).map((v) => v.bestStreak || 0)),
      days: new Set(S.sessions.filter((s) => s.childId === child().id).map((s) => s.date)).size,
      g: (id, lv, stars) => { const st = p[id]; return !!(st && st.level >= lv && (st.stars || 0) >= stars); },
      ...extra
    };
    const baru = [];
    BADGES.forEach((b) => { if (!r.badges.includes(b.id) && b.test(stats)) { r.badges.push(b.id); baru.push(b); } });
    const stickerCount = clamp(Math.floor(r.stars / 6), 0, STICKERS.length);
    while (r.stickers.length < stickerCount) r.stickers.push(STICKERS[r.stickers.length]);
    UNLOCKS.forEach((u) => { if (!r.unlocks.includes(u.id) && r.stars >= u.stars) r.unlocks.push(u.id); });
    save(); emit('rewards');
    return baru;
  },
  stars: () => childRewards().stars,
  badges: () => childRewards().badges,
  stickers: () => childRewards().stickers,
  unlocks: () => childRewards().unlocks,
  reset() { const c = child(); S.rewards[c.id] = { stars: 0, badges: [], stickers: [], unlocks: [] }; S.progress[c.id] = {}; save(); emit('rewards'); }
};
export const UNLOCKS = [
  { id: 'hat',    stars: 8,  ico: '🎩', ms: 'Topi Ajaib untuk Ari',  en: 'Magic hat for Ari' },
  { id: 'cape',   stars: 18, ico: '🦸', ms: 'Jubah Super Bobo',      en: 'Super cape for Bobo' },
  { id: 'song',   stars: 30, ico: '🎶', ms: 'Lagu baharu dibuka',    en: 'New song unlocked' },
  { id: 'world',  stars: 44, ico: '🌌', ms: 'Dunia Angkasa dibuka',  en: 'Space world unlocked' },
  { id: 'crown',  stars: 60, ico: '👑', ms: 'Mahkota Kiko',          en: 'Kiko crown' },
  { id: 'rocket', stars: 90, ico: '🚀', ms: 'Roket Bobo',            en: 'Bobo rocket' }
];

/* ------------------------- 8. MASA SKRIN ---------------------------- */
export const screenTime = {
  today() {
    const d = todayKey(), c = child();
    return S.sessions.filter((s) => s.childId === c.id && s.date === d).reduce((a, b) => a + b.minutes, 0);
  },
  add(minutes) {
    const d = todayKey(), c = child();
    let row = S.sessions.find((s) => s.childId === c.id && s.date === d);
    if (!row) { row = { childId: c.id, date: d, minutes: 0 }; S.sessions.push(row); }
    row.minutes += minutes;
    if (S.sessions.length > 400) S.sessions = S.sessions.slice(-400);
    save();
  },
  limit() { return S.settings.screenLimitMin || 30; },
  locked() { return S.settings.screenLimitMin > 0 && this.today() >= this.limit(); },
  remaining() { return S.settings.screenLimitMin > 0 ? Math.max(0, this.limit() - this.today()) : Infinity; },
  week() {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      out.push({ date: k, day: d.toLocaleDateString(S.settings.lang === 'en' ? 'en-GB' : 'ms-MY', { weekday: 'short' }), minutes: S.sessions.filter((s) => s.date === k).reduce((a, b) => a + b.minutes, 0) });
    }
    return out;
  }
};

/* ------------------------ 9. KESELAMATAN ---------------------------- */
const BLOCK = ['bodoh','bangang','sial','celaka','babi','anjing','stupid','idiot','hate','kill','bunuh','darah','gay','sex','seksi','porno'];
export const safety = {
  sanitize(s) { return String(s ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24); },
  filter(s) {
    const t = String(s || '');
    const hit = BLOCK.some((w) => new RegExp('\\b' + w + '\\b', 'i').test(t));
    if (hit) this.audit('content_filtered', { len: t.length });
    return { ok: !hit, text: hit ? '...' : t };
  },
  audit(action, meta = {}) {
    S.safetyLog.push({ t: Date.now(), action, meta });
    if (S.safetyLog.length > 200) S.safetyLog = S.safetyLog.slice(-200);
    save();
  },
  /** Senarai asal luaran yang benar-benar dihubungi oleh aplikasi */
  networkAudit() {
    try {
      const res = performance.getEntriesByType('resource');
      const origins = [...new Set(res.map((r) => { try { return new URL(r.name).origin; } catch { return null; } }).filter(Boolean))];
      return origins.filter((o) => o !== location.origin);
    } catch { return []; }
  },
  log: () => S.safetyLog
};

/* --------------------------- 10. UI KECIL --------------------------- */
export function announce(text) { const l = $('#live'); if (l) l.textContent = ''; setTimeout(() => { if (l) l.textContent = text; }, 30); }
export function toast(text, ms = 2200) {
  const box = $('#toast'); if (!box) return;
  const el = h(`<div class="toast-item">${esc(text)}</div>`);
  box.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, ms);
}
export function burst(x, y, chars = ['⭐', '✨', '🌟', '💫'], n = 12) {
  if (S.settings.reduceMotion || S.settings.calm) return;
  const fx = $('#fx'); if (!fx) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'fx-particle';
    p.textContent = pick(chars);
    const a = (Math.PI * 2 * i) / n + Math.random();
    const d = 90 + Math.random() * 170;
    p.style.left = x + 'px'; p.style.top = y + 'px';
    p.style.setProperty('--dx', Math.cos(a) * d + 'px');
    p.style.setProperty('--dy', (Math.sin(a) * d - 60) + 'px');
    p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    p.style.fontSize = (1.1 + Math.random() * 1.5) + 'rem';
    p.style.animationDelay = (Math.random() * 0.12) + 's';
    fx.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}
export function burstAt(node, chars, n) {
  if (!node) return;
  const r = node.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, chars, n);
}
export function overlay(html, opts = {}) {
  const o = $('#overlay');
  o.innerHTML = `<div class="sheet" role="document">${html}</div>`;
  o.hidden = false;
  document.body.style.overflow = 'hidden';
  const sheet = o.querySelector('.sheet');
  const focusable = sheet.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
  o.onclick = (e) => { if (e.target === o && !opts.sticky) closeOverlay(); };
  o.onkeydown = (e) => { if (e.key === 'Escape' && !opts.sticky) closeOverlay(); };
  return sheet;
}
export function closeOverlay() {
  const o = $('#overlay');
  o.hidden = true; o.innerHTML = ''; document.body.style.overflow = '';
}
export const isOverlayOpen = () => !$('#overlay').hidden;

/* --------------------- 11. MASA & FORMAT --------------------------- */
export function mmss(min) {
  const m = Math.floor(min), s = Math.round((min - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
export function fmtMin(min) { return (Math.round(min * 10) / 10).toFixed(min < 10 ? 1 : 0) + ' min'; }

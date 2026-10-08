/* =========================================================================
   games-a.js — Modul 1–6
   1 Teka Warna · 2 Teka Huruf · 3 Sambung Huruf · 4 Puzzle & Memori
   5 Kira Nombor · 6 Bentuk & Padan
   Setiap modul: 5 tahap, audio arahan, hint, adaptive difficulty, ganjaran.
   ========================================================================= */
import { L, pick, shuffle, rnd, esc, settings } from './core.js';
import { runQuiz, runBuilder, runMemory, runSequence, startHint, showHint, say, praise, retryWord, markCorrect, markWrong } from './engine.js';

const mcq = (correct, pool, n = 4) => {
  const others = shuffle(pool.filter((x) => x.key !== correct.key)).slice(0, n - 1);
  correct.correct = true;            // TAHAP BETUL: tandakan pilihan yang betul
  return shuffle([correct, ...others]);
};
/** Pilih warna teks yang kontras di atas swatch (kuning/putih → teks gelap) */
const inkOn = (hex) => {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#2E2A44' : '#FFFFFF';
};
const swatchOpt = (c) => ({
  key: c.key,
  html: `<span class="sw" style="background:${c.hex}"></span><span class="opt-label" style="color:${inkOn(c.hex)};text-shadow:${inkOn(c.hex) === '#FFFFFF' ? '0 .1rem .3rem rgba(0,0,0,.55)' : 'none'}">${esc(settings().lang === 'en' ? c.en : c.ms)}</span>`,
  aria: settings().lang === 'en' ? c.en : c.ms, cls: 'swatch'
});
const textOpt = (label, emoji = '') => ({ key: label, html: `${emoji ? `<span class="opt-visual">${emoji}</span>` : ''}<span class="opt-label">${esc(label)}</span>`, aria: label });
const bigOpt = (label, emoji) => ({ key: label, html: `<span class="opt-visual" style="font-size:3.2rem">${emoji}</span>`, aria: label, cls: 'emoji-tile' });
const numOpt = (n) => ({ key: String(n), html: `<span class="opt-visual" style="font-size:2.6rem">${n}</span>`, aria: String(n) });

/* ==================== DATA: WARNA ==================== */
export const COLORS = {
  merah: { key: 'merah', ms: 'Merah', en: 'Red', hex: '#E8433F' },
  biru: { key: 'biru', ms: 'Biru', en: 'Blue', hex: '#2F80ED' },
  kuning: { key: 'kuning', ms: 'Kuning', en: 'Yellow', hex: '#FFD34E' },
  hijau: { key: 'hijau', ms: 'Hijau', en: 'Green', hex: '#4FAE60' },
  oren: { key: 'oren', ms: 'Oren', en: 'Orange', hex: '#FF8A3D' },
  ungu: { key: 'ungu', ms: 'Ungu', en: 'Purple', hex: '#9B7BDC' },
  pink: { key: 'pink', ms: 'Merah Jambu', en: 'Pink', hex: '#FF8FB1' },
  coklat: { key: 'coklat', ms: 'Coklat', en: 'Brown', hex: '#A9744F' },
  hitam: { key: 'hitam', ms: 'Hitam', en: 'Black', hex: '#3A3A46' },
  putih: { key: 'putih', ms: 'Putih', en: 'White', hex: '#FFFFFF' },
  kelabu: { key: 'kelabu', ms: 'Kelabu', en: 'Grey', hex: '#B9B4C7' }
};
const C = COLORS;
const BASE4 = [C.merah, C.biru, C.kuning, C.hijau];
const SEC6 = [C.merah, C.biru, C.kuning, C.hijau, C.oren, C.ungu];
const ALLC = Object.values(COLORS);
const OBJCOLOR = [
  { emoji: '🍌', ms: 'pisang', en: 'banana', c: C.kuning }, { emoji: '🍓', ms: 'strawberi', en: 'strawberry', c: C.merah },
  { emoji: '🍃', ms: 'daun', en: 'leaf', c: C.hijau }, { emoji: '☁️', ms: 'awan', en: 'cloud', c: C.putih },
  { emoji: '🍇', ms: 'anggur', en: 'grapes', c: C.ungu }, { emoji: '🍊', ms: 'oren', en: 'orange', c: C.oren },
  { emoji: '🐘', ms: 'gajah', en: 'elephant', c: C.kelabu }, { emoji: '🌰', ms: 'buah keras', en: 'chestnut', c: C.coklat },
  { emoji: '🌹', ms: 'bunga ros', en: 'rose', c: C.pink }, { emoji: '🖤', ms: 'hati hitam', en: 'black heart', c: C.hitam }
];
const MIX = [
  { a: C.biru, b: C.kuning, r: C.hijau }, { a: C.merah, b: C.kuning, r: C.oren },
  { a: C.merah, b: C.biru, r: C.ungu }, { a: C.putih, b: C.merah, r: C.pink },
  { a: C.hitam, b: C.putih, r: C.kelabu }, { a: C.hijau, b: C.kuning, r: '#C8E06A' }
];
const SHADES = [
  { base: C.biru, light: '#9CCBFF', dark: '#0B4FA8' }, { base: C.merah, light: '#FF9C99', dark: '#9E1B18' },
  { base: C.hijau, light: '#A8E8B4', dark: '#1F6E32' }, { base: C.ungu, light: '#DACCFA', dark: '#5B3E9E' },
  { base: C.oren, light: '#FFC79B', dark: '#A44E12' }
];

function genColors(level, i) {
  const lang = settings().lang;
  if (level === 1 || level === 2) {
    const pool = level === 1 ? BASE4 : SEC6;
    const ans = pick(pool);
    return {
      prompt: `<div class="prompt-big">${L('Sentuh warna ini!', 'Tap this colour!')}</div>
        <div style="width:9rem;height:9rem;border-radius:50%;background:${ans.hex};box-shadow:0 .6rem 1.4rem rgba(0,0,0,.22);border:.4rem solid #fff"></div>`,
      instruction: L(`Cari warna ${ans.ms.toLowerCase()}!`, `Find the colour ${ans.en.toLowerCase()}!`),
      hint: L('Warna ini ada pada kad di bawah. Cuba tengok betul-betul.', 'This colour is on one of the cards below. Look carefully.'),
      hint2: L(`Warna itu ialah ${ans.ms}.`, `The colour is ${ans.ms}.`),
      options: mcq(swatchOpt(ans), pool.map(swatchOpt), level === 1 ? 4 : 5)
    };
  }
  if (level === 3) {
    const o = pick(OBJCOLOR);
    return {
      prompt: `<div class="prompt-big">${o.emoji}</div><div class="prompt-text">${esc(L('Apa warna ini?', 'What colour is this?'))}</div>`,
      instruction: L(`Apa warna ${o.ms}?`, `What colour is the ${o.en}?`),
      hint: L('Ingat warna benda itu di dunia sebenar.', 'Remember the colour of that thing in the real world.'),
      hint2: L(`Warnanya ${o.c.ms}.`, `It is ${o.c.ms}.`),
      options: mcq(swatchOpt(o.c), shuffle(ALLC).map(swatchOpt).slice(0, 5))
    };
  }
  if (level === 4) {
    const m = pick(MIX);
    const r = { key: m.r === '#C8E06A' ? 'hijau-muda' : m.r, ms: m.r === '#C8E06A' ? 'Hijau muda' : Object.values(COLORS).find((c) => c.hex === m.r)?.ms || 'Campuran', en: 'Mixed', hex: m.r };
    return {
      prompt: `<div class="prompt-sub">${esc(L('Campurkan warna ini', 'Mix these colours'))}</div>
        <div style="display:flex;align-items:center;gap:.8rem">
          <span style="width:6rem;height:6rem;border-radius:50%;background:${m.a.hex};border:.3rem solid #fff;box-shadow:0 .4rem 1rem rgba(0,0,0,.2)"></span>
          <span style="font-size:2.4rem">➕</span>
          <span style="width:6rem;height:6rem;border-radius:50%;background:${m.b.hex};border:.3rem solid #fff;box-shadow:0 .4rem 1rem rgba(0,0,0,.2)"></span>
          <span style="font-size:2.4rem">🟰</span><span style="font-size:3rem">❓</span>
        </div>`,
      instruction: L(`${m.a.ms} campur ${m.b.ms} jadi warna apa?`, `${m.a.en} mixed with ${m.b.en} makes which colour?`),
      hint: L('Warna baharu itu biasanya warna yang kita nampak pada tumbuhan atau buah.', 'The new colour is usually the one we see on plants or fruit.'),
      hint2: L(`Jawapannya ${r.ms}.`, `The answer is ${r.ms}.`),
      options: mcq(swatchOpt(r), shuffle(ALLC.filter((c) => c.hex !== m.a.hex && c.hex !== m.b.hex)).slice(0, 4).map(swatchOpt))
    };
  }
  const s = pick(SHADES);
  const askLight = i % 2 === 0;
  const ans = { key: s.base.key + (askLight ? '-l' : '-d'), ms: (askLight ? L('Lebih terang', 'Lighter') : L('Lebih gelap', 'Darker')) + ' ' + s.base.ms, en: '', hex: askLight ? s.light : s.dark };
  const wrong = { key: s.base.key + (askLight ? '-d' : '-l'), ms: '', en: '', hex: askLight ? s.dark : s.light };
  const mid = { key: s.base.key, ms: '', en: '', hex: s.base.hex };
  return {
    prompt: `<div style="width:10rem;height:10rem;border-radius:1.4rem;background:${s.base.hex};border:.4rem solid #fff;box-shadow:0 .6rem 1.4rem rgba(0,0,0,.2)"></div>
      <div class="prompt-text">${esc(askLight ? L('Yang mana LEBIH TERANG?', 'Which is LIGHTER?') : L('Yang mana LEBIH GELAP?', 'Which is DARKER?'))}</div>`,
    instruction: askLight ? L('Pilih warna yang lebih terang daripada warna ini.', 'Pick the colour that is lighter than this one.') : L('Pilih warna yang lebih gelap daripada warna ini.', 'Pick the colour that is darker than this one.'),
    hint: L('Terang bermaksud lebih hampir kepada putih. Gelap lebih hampir kepada hitam.', 'Lighter is closer to white. Darker is closer to black.'),
    hint2: askLight ? L('Yang lebih cerah dan lembut.', 'The brighter, softer one.') : L('Yang lebih tua warnanya.', 'The deeper one.'),
    options: shuffle([
      Object.assign(swatchOpt(ans), { correct: true }),
      swatchOpt(wrong), swatchOpt(mid), swatchOpt(pick(ALLC.filter((c) => c.key !== s.base.key)))
    ])
  };
}

/* ==================== DATA: HURUF ==================== */
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOBJ = [
  { ch: 'A', w: 'Ayam', e: '🐔' }, { ch: 'B', w: 'Bola', e: '⚽' }, { ch: 'C', w: 'Cawan', e: '☕' },
  { ch: 'D', w: 'Durian', e: '🥭' }, { ch: 'E', w: 'Epal', e: '🍎' }, { ch: 'G', w: 'Gajah', e: '🐘' },
  { ch: 'I', w: 'Ikan', e: '🐟' }, { ch: 'J', w: 'Jagung', e: '🌽' }, { ch: 'K', w: 'Kucing', e: '🐱' },
  { ch: 'L', w: 'Lembu', e: '🐄' }, { ch: 'M', w: 'Matahari', e: '☀️' }, { ch: 'N', w: 'Nanas', e: '🍍' },
  { ch: 'O', w: 'Oren', e: '🍊' }, { ch: 'P', w: 'Pisang', e: '🍌' }, { ch: 'R', w: 'Rumah', e: '🏠' },
  { ch: 'S', w: 'Sekolah', e: '🏫' }, { ch: 'T', w: 'Topi', e: '🎩' }, { ch: 'U', w: 'Ular', e: '🐍' }
];
const SYL = [
  { a: 'BA', b: 'JU', w: 'BAJU', e: '👕' }, { a: 'BO', b: 'LA', w: 'BOLA', e: '⚽' },
  { a: 'BU', b: 'KU', w: 'BUKU', e: '📚' }, { a: 'MA', b: 'TA', w: 'MATA', e: '👁️' },
  { a: 'SU', b: 'SU', w: 'SUSU', e: '🥛' }, { a: 'RO', b: 'TI', w: 'ROTI', e: '🍞' },
  { a: 'KA', b: 'KI', w: 'KAKI', e: '🦶' }, { a: 'TO', b: 'PI', w: 'TOPI', e: '🎩' }
];

function genLetters(level, i) {
  if (level === 1) {
    const pool = LETTERS.slice(0, 5);
    const ans = pick(pool);
    return {
      prompt: `<div class="prompt-big" style="color:${pick(['#5BC0EB', '#FFA552', '#7BD389', '#B79CED'])}">${ans}</div>`,
      instruction: L(`Sentuh huruf ${ans}!`, `Tap the letter ${ans}!`),
      hint: L('Huruf besar. Tengok betul-betul bentuknya.', 'Capital letter. Look at its shape.'),
      hint2: L(`Cari huruf ${ans}.`, `Look for the letter ${ans}.`),
      options: mcq(textOpt(ans), pool.map((x) => textOpt(x)))
    };
  }
  if (level === 2) {
    const pool = LETTERS.slice(0, 8);
    const up = pick(pool);
    const low = up.toLowerCase();
    const conf = shuffle([low, ...shuffle(pool.filter((x) => x !== up).map((x) => x.toLowerCase()))].slice(0, 4));
    return {
      prompt: `<div class="prompt-big">${up}</div><div class="prompt-sub">${esc(L('Cari huruf kecilnya', 'Find its small letter'))}</div>`,
      instruction: L(`${up} besar. Yang mana ${up} kecil?`, `Capital ${up}. Which one is small ${up}?`),
      hint: L('Huruf kecil kelihatan lebih pendek dan bulat.', 'Small letters look shorter and rounder.'),
      hint2: L(`Huruf kecil bagi ${up} ialah ${low}.`, `The small letter of ${up} is ${low}.`),
      options: conf.map((x) => Object.assign(textOpt(x), { correct: x === low }))
    };
  }
  if (level === 3) {
    const o = pick(LOBJ);
    const pool = LOBJ.filter((x) => x.ch !== o.ch);
    return {
      prompt: `<div class="prompt-big">${o.e}</div><div class="prompt-text">${esc(o.w)}</div>`,
      instruction: L(`${o.w} bermula dengan huruf apa?`, `Which letter does ${o.w} start with?`),
      hint: L('Sebut perkataan itu perlahan-lahan, dengar bunyi pertama.', 'Say the word slowly and listen to the first sound.'),
      hint2: L(`Bunyi pertama ialah "${o.ch}".`, `The first sound is "${o.ch}".`),
      options: mcq(textOpt(o.ch), pool.map((x) => textOpt(x.ch)))
    };
  }
  if (level === 4) {
    const start = rnd(20);
    const seq = LETTERS.slice(start, start + 5);
    const missIdx = 1 + rnd(3);
    const ans = seq[missIdx];
    const shown = seq.map((c, k) => (k === missIdx ? '<span style="color:#B79CED">?</span>' : c)).join(' ');
    return {
      prompt: `<div class="prompt-text" style="letter-spacing:.4rem;font-size:clamp(1.6rem,6vw,2.4rem)">${shown}</div>`,
      instruction: L('Huruf apa yang hilang?', 'Which letter is missing?'),
      hint: L('Sebut A B C D E dari awal sampai habis.', 'Say A B C D E from the start.'),
      hint2: L(`Huruf yang hilang ialah ${ans}.`, `The missing letter is ${ans}.`),
      options: mcq(textOpt(ans), LETTERS.filter((x) => !seq.includes(x)).map((x) => textOpt(x)))
    };
  }
  const s = pick(SYL);
  const pool = SYL.filter((x) => x.w !== s.w);
  return {
    prompt: `<div class="prompt-sub">${esc(L('Gabungkan suku kata', 'Join the syllables'))}</div>
      <div style="display:flex;gap:.6rem;align-items:center;font-size:2.2rem;font-weight:800">
        <span style="background:#E4F4FF;padding:.3rem .8rem;border-radius:1rem">${s.a}</span><span>➕</span>
        <span style="background:#FFF4D6;padding:.3rem .8rem;border-radius:1rem">${s.b}</span><span>🟰</span><span>❓</span></div>`,
    instruction: L(`${s.a} campur ${s.b} jadi perkataan apa?`, `${s.a} plus ${s.b} makes which word?`),
    hint: L('Baca dua suku kata itu berturut-turut.', 'Read the two syllables one after another.'),
    hint2: L(`Jawapannya ${s.w}.`, `The answer is ${s.w}.`),
    options: mcq({ key: s.w, html: `<span class="opt-visual">${s.e}</span><span class="opt-label">${s.w}</span>`, aria: s.w }, pool.map((x) => ({ key: x.w, html: `<span class="opt-visual">${x.e}</span><span class="opt-label">${x.w}</span>`, aria: x.w })))
  };
}

/* ==================== DATA: PERKATAAN ==================== */
const WORDS = {
  1: [{ w: 'IBU', e: '👩', c: 'Orang yang melahirkan kita' }, { w: 'API', e: '🔥', c: 'Panas dan menyala' }, { w: 'UBI', e: '🥔', c: 'Boleh dimakan' }, { w: 'ITU', e: '👉', c: 'Menunjuk sesuatu' }, { w: 'APA', e: '❓', c: 'Soalan' }, { w: 'AIR', e: '💧', c: 'Kita minum' }],
  2: [{ w: 'BOLA', e: '⚽', c: 'Kita tendang' }, { w: 'BUKU', e: '📚', c: 'Kita baca' }, { w: 'KAKI', e: '🦶', c: 'Untuk berjalan' }, { w: 'MATA', e: '👁️', c: 'Untuk melihat' }, { w: 'TOPI', e: '🎩', c: 'Kita pakai di kepala' }, { w: 'SUSU', e: '🥛', c: 'Minuman putih' }],
  3: [{ w: 'RUMAH', e: '🏠', c: 'Tempat kita tinggal' }, { w: 'GAJAH', e: '🐘', c: 'Haiwan besar berbelalai' }, { w: 'MEJA', e: '🪑', c: 'Tempat letak buku' }, { w: 'BUNGA', e: '🌸', c: 'Cantik dan berwarna' }, { w: 'SAPI', e: '🐄', c: 'Memberi susu' }],
  4: [{ w: 'LAMPU', e: '💡', c: 'Memberi cahaya' }, { w: 'PINTU', e: '🚪', c: 'Untuk masuk rumah' }, { w: 'MAKAN', e: '🍽️', c: 'Kita buat bila lapar' }, { w: 'MINUM', e: '🥤', c: 'Kita buat bila dahaga' }, { w: 'KAMAR', e: '🛏️', c: 'Tempat kita tidur' }],
  5: [{ w: 'KUCING', e: '🐱', c: 'Haiwan yang mengeong' }, { w: 'PISANG', e: '🍌', c: 'Buah berwarna kuning' }, { w: 'BURUNG', e: '🐦', c: 'Haiwan yang terbang' }, { w: 'SEPATU', e: '👟', c: 'Kita pakai di kaki' }, { w: 'KAMERA', e: '📷', c: 'Untuk ambil gambar' }]
};
const EXTRA_LETTERS = 'ABCDEFGHIJKLMNOPRSTUWY'.split('');

/* ==================== DATA: NOMBOR ==================== */
const COUNT_EMOJI = ['🍎', '⭐', '🐠', '🎈', '🐥', '🍪', '🌸', '🚗', '🦋', '🍓'];

function genNumbers(level, i) {
  if (level <= 2) {
    const max = level === 1 ? 5 : 10;
    const n = 1 + rnd(max);
    const e = pick(COUNT_EMOJI);
    const pool = Array.from({ length: max }, (_, k) => k + 1).filter((x) => x !== n);
    return {
      prompt: `<div class="prompt-sub">${esc(L('Kira berapa banyak?', 'How many are there?'))}</div>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;max-width:26rem">${Array.from({ length: n }, () => `<span style="font-size:2.4rem">${e}</span>`).join('')}</div>`,
      instruction: L(`Kira ${e} ini. Ada berapa?`, `Count the ${e}. How many?`),
      hint: L('Sentuh setiap gambar sambil mengira: satu, dua, tiga...', 'Point at each picture and count: one, two, three...'),
      hint2: L(`Jumlahnya ${n}.`, `There are ${n}.`),
      options: mcq(numOpt(n), shuffle(pool).slice(0, 3).map(numOpt))
    };
  }
  if (level === 3) {
    const n = 3 + rnd(8);
    const e = pick(COUNT_EMOJI);
    const mk = (k) => ({ key: String(k), html: `<span class="opt-visual" style="font-size:1.5rem;line-height:1.1;max-width:7rem">${e.repeat(k)}</span><span class="opt-label">${k}</span>`, aria: String(k), cls: 'emoji-tile' });
    const pool = [n - 1, n + 1, n + 2, n - 2].filter((x) => x > 0 && x !== n);
    return {
      prompt: `<div class="prompt-big" style="font-size:6rem;color:#2F80ED">${n}</div><div class="prompt-sub">${esc(L('Cari gambar yang bilangannya sama', 'Find the picture with the same number'))}</div>`,
      instruction: L(`Nombor ${n}. Cari kumpulan yang ada ${n} benda.`, `Number ${n}. Find the group with ${n} items.`),
      hint: L('Kira setiap kumpulan satu per satu.', 'Count each group one by one.'),
      hint2: L(`Kumpulan yang betul ada ${n} benda.`, `The correct group has ${n} items.`),
      options: shuffle([Object.assign(mk(n), { correct: true }), ...shuffle(pool).slice(0, 3).map(mk)])
    };
  }
  const max = level === 4 ? 10 : 20;
  const sub = level === 5 && i % 2 === 1;
  let a, b, ans;
  if (sub) { a = 3 + rnd(max - 4); b = 1 + rnd(a - 1); ans = a - b; }
  else { a = 1 + rnd(Math.floor(max / 2)); b = 1 + rnd(Math.floor(max / 2)); ans = a + b; }
  const e = pick(COUNT_EMOJI);
  const op = sub ? '➖' : '➕';
  const pool = [ans - 1, ans + 1, ans + 2, ans - 2, ans + 3].filter((x) => x >= 0 && x !== ans);
  return {
    prompt: `<div class="prompt-sub">${esc(L('Kira jumlahnya', 'Work out the answer'))}</div>
      <div style="font-size:clamp(1.6rem,7vw,2.6rem);font-weight:800;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;justify-content:center">
        <span>${e.repeat(Math.min(a, 10))}</span><span>${a}</span><span>${op}</span><span>${e.repeat(Math.min(b, 10))}</span><span>${b}</span><span>=</span><span style="color:#B79CED">?</span></div>`,
    instruction: sub ? L(`${a} tolak ${b} sama dengan berapa?`, `What is ${a} minus ${b}?`) : L(`${a} tambah ${b} sama dengan berapa?`, `What is ${a} plus ${b}?`),
    hint: sub ? L('Tolak bermaksud kita ambil keluar beberapa benda.', 'Minus means we take some items away.') : L('Tambah bermaksud kita kumpulkan semua benda.', 'Plus means we put all the items together.'),
    hint2: L(`Jawapannya ${ans}.`, `The answer is ${ans}.`),
    options: mcq(numOpt(ans), shuffle(pool).slice(0, 3).map(numOpt))
  };
}

/* ==================== DATA: BENTUK ==================== */
const shapeSVG = (id, color = '#5BC0EB', size = 150) => {
  const P = {
    bulat: `<circle cx="75" cy="75" r="62" fill="${color}"/>`,
    segiempat: `<rect x="16" y="16" width="118" height="118" rx="14" fill="${color}"/>`,
    segitiga: `<polygon points="75,10 142,138 8,138" fill="${color}"/>`,
    segiempatTepat: `<rect x="8" y="34" width="134" height="82" rx="12" fill="${color}"/>`,
    oval: `<ellipse cx="75" cy="75" rx="66" ry="44" fill="${color}"/>`,
    bintang: `<polygon points="75,6 95,54 147,58 107,92 120,142 75,115 30,142 43,92 3,58 55,54" fill="${color}"/>`,
    hati: `<path d="M75 138 C10 92 6 44 34 30 C55 20 72 34 75 48 C78 34 95 20 116 30 C144 44 140 92 75 138 Z" fill="${color}"/>`,
    permata: `<polygon points="75,8 142,75 75,142 8,75" fill="${color}"/>`,
    trapezium: `<polygon points="42,16 108,16 142,134 8,134" fill="${color}"/>`,
    lima: `<polygon points="75,8 142,56 116,136 34,136 8,56" fill="${color}"/>`,
    enam: `<polygon points="42,12 108,12 142,75 108,138 42,138 8,75" fill="${color}"/>`
  };
  return `<svg viewBox="0 0 150 150" width="${size}" height="${size}" role="img">${P[id] || P.bulat}</svg>`;
};
const SHAPES = [
  { id: 'bulat', ms: 'Bulat', en: 'Circle', sides: 0, obj: '⚽' },
  { id: 'segiempat', ms: 'Segi Empat Sama', en: 'Square', sides: 4, obj: '🪟' },
  { id: 'segitiga', ms: 'Segi Tiga', en: 'Triangle', sides: 3, obj: '⛰️' },
  { id: 'segiempatTepat', ms: 'Segi Empat Tepat', en: 'Rectangle', sides: 4, obj: '📕' },
  { id: 'oval', ms: 'Oval', en: 'Oval', sides: 0, obj: '🥚' },
  { id: 'bintang', ms: 'Bintang', en: 'Star', sides: 10, obj: '⭐' },
  { id: 'hati', ms: 'Hati', en: 'Heart', sides: 0, obj: '💖' },
  { id: 'permata', ms: 'Permata', en: 'Diamond', sides: 4, obj: '💎' },
  { id: 'trapezium', ms: 'Trapezium', en: 'Trapezoid', sides: 4, obj: '🪣' },
  { id: 'lima', ms: 'Pentagon', en: 'Pentagon', sides: 5, obj: '🏠' },
  { id: 'enam', ms: 'Heksagon', en: 'Hexagon', sides: 6, obj: '🍯' }
];
const sName = (s) => (settings().lang === 'en' ? s.en : s.ms);

function genShapes(level, i) {
  if (level <= 2) {
    const pool = level === 1 ? SHAPES.slice(0, 3) : SHAPES.slice(0, 5);
    const ans = pick(pool);
    return {
      prompt: `<div class="prompt-sub">${esc(L('Bentuk apa ini?', 'What shape is this?'))}</div>${shapeSVG(ans.id, pick(['#5BC0EB', '#FFA552', '#7BD389', '#FF9EC4', '#B79CED']), 160)}`,
      instruction: L('Bentuk apa ini?', 'What shape is this?'),
      hint: L('Kira sisi atau tengok sama ada ia bulat.', 'Count the sides or see if it is round.'),
      hint2: L(`Ini ${ans.ms}.`, `This is a ${ans.en}.`),
      options: mcq(textOpt(sName(ans)), pool.map((s) => textOpt(sName(s))))
    };
  }
  if (level === 3) {
    const pool = SHAPES.filter((s) => ['bulat', 'segiempatTepat', 'segitiga', 'bintang', 'hati'].includes(s.id));
    const ans = pick(pool);
    return {
      prompt: `<div class="prompt-text">${esc(L(`Cari benda yang berbentuk ${ans.ms}`, `Find the object shaped like a ${ans.en}`))}</div>${shapeSVG(ans.id, '#B79CED', 90)}`,
      instruction: L(`Yang mana berbentuk ${ans.ms}?`, `Which one is ${ans.en}-shaped?`),
      hint: L('Tengok bentuk luar benda itu.', 'Look at the outer shape of the object.'),
      hint2: L(`Yang betul ialah ${ans.obj}.`, `The correct one is ${ans.obj}.`),
      options: mcq(bigOpt(ans.ms, ans.obj), shuffle(pool.filter((s) => s.id !== ans.id)).map((s) => bigOpt(s.ms, s.obj)))
    };
  }
  if (level === 4) {
    const pool = SHAPES.filter((s) => s.sides > 0 && s.sides <= 6);
    const ans = pick(pool);
    const pool2 = [3, 4, 5, 6].filter((n) => n !== ans.sides);
    return {
      prompt: `${shapeSVG(ans.id, '#4FAE60', 150)}`,
      instruction: L('Berapa sisi bentuk ini?', 'How many sides does this shape have?'),
      hint: L('Sisi ialah garis lurus di tepi bentuk.', 'Sides are the straight lines around the shape.'),
      hint2: L(`${ans.ms} ada ${ans.sides} sisi.`, `A ${ans.en} has ${ans.sides} sides.`),
      options: mcq(numOpt(ans.sides), shuffle(pool2).slice(0, 3).map(numOpt))
    };
  }
  const ans = pick(SHAPES.slice(5));
  return {
    prompt: `<div class="prompt-sub">${esc(L('Bentuk baharu untuk kamu!', 'A brand new shape for you!'))}</div>${shapeSVG(ans.id, '#FF8A3D', 150)}`,
    instruction: L('Bentuk ini apa namanya?', 'What is this shape called?'),
    hint: L('Kira bilangan sisi, kemudian pilih nama yang sepadan.', 'Count the sides, then choose the matching name.'),
    hint2: L(`Bentuk ini ${ans.ms}.`, `This shape is a ${ans.en}.`),
    options: mcq(textOpt(sName(ans)), shuffle(SHAPES.slice(5).filter((s) => s.id !== ans.id)).map((s) => textOpt(sName(s))))
  };
}

/* ==================== DEFINISI MODUL 1–6 ==================== */
export const gamesA = {
  colors: {
    id: 'colors', ms: 'Teka Warna', en: 'Color Quest', ico: '🎨', who: 'kiko', rounds: 6,
    tagline: { ms: 'Padan, campur & kenal warna', en: 'Match, mix & name colours' },
    skills: ['kognitif', 'kreativiti'],
    render(api) { runQuiz(api, genColors); }
  },
  letters: {
    id: 'letters', ms: 'Teka Huruf', en: 'Letter Detective', ico: '🔤', who: 'bobo', rounds: 6,
    tagline: { ms: 'Huruf besar, kecil & bunyi', en: 'Big letters, small letters & sounds' },
    skills: ['literasi', 'kognitif'],
    render(api) { runQuiz(api, genLetters); }
  },
  words: {
    id: 'words', ms: 'Sambung Huruf', en: 'Word Builder', ico: '🧩', who: 'ari', rounds: 5,
    tagline: { ms: 'Susun huruf jadi perkataan', en: 'Arrange letters into words' },
    skills: ['literasi', 'motor'],
    render(api) {
      runBuilder(api, {
        task(level, i) {
          const list = WORDS[level];
          const t = list[i % list.length];
          const extras = shuffle(EXTRA_LETTERS.filter((c) => !t.w.includes(c))).slice(0, 2);
          return {
            word: t.w, emoji: t.e, clue: `${t.w} — ${t.c}`,
            letters: [...t.w.split(''), ...extras],
            instruction: L(`Susun huruf untuk membentuk perkataan "${t.w}".`, `Arrange the letters to build the word "${t.w}".`)
          };
        }
      });
    }
  },
  puzzle: {
    id: 'puzzle', ms: 'Puzzle & Memori', en: 'Brain Gym', ico: '🧠', who: 'bobo', rounds: 6,
    tagline: { ms: 'Memori, pola & urutan', en: 'Memory, patterns & sequences' },
    skills: ['kognitif', 'motor'],
    render(api) {
      const FACES = ['🦊', '🤖', '🐢', '🐠', '🌸', '🚀', '🍎', '🐝', '🦋', '🐼', '🌻', '⭐'];
      const level = api.level;
      if (level === 3) {
        return runSequence(api, {
          task(lv, i) {
            const kind = i % 3;
            if (kind === 0) {
              const pool = shuffle(FACES).slice(0, 3);
              const seq = [pool[0], pool[1], pool[2], pool[0], pool[1]];
              return { clue: L('Apa seterusnya dalam pola ini?', 'What comes next in this pattern?'), seq, answer: pool[2], options: pool.slice(), instruction: L('Tengok pola dan pilih yang seterusnya.', 'Look at the pattern and choose what comes next.'), hint: L('Pola berulang: A, B, C, A, B...', 'The pattern repeats: A, B, C, A, B...') };
            }
            if (kind === 1) {
              const sizes = ['🐟', '🐠', '🐡'];
              const seq = ['🐟', '🐟', '🐠', '🐟', '🐟'];
              return { clue: L('Pola saiz: apa seterusnya?', 'Size pattern: what comes next?'), seq, answer: '🐠', options: sizes, instruction: L('Pola kecil, kecil, besar. Apa seterusnya?', 'Small, small, big. What comes next?'), hint: L('Selepas dua ikan kecil datang ikan besar.', 'After two small fish comes a big fish.') };
            }
            const nums = [1, 2, 3, 4, 5];
            const start = 1 + rnd(3);
            const seq = [start, start + 1, start + 2, start + 3].map((n) => `${n}`);
            return { clue: L('Nombor apa seterusnya?', 'Which number comes next?'), seq, answer: `${start + 4}`, options: [start + 4, start + 5, start + 2, start + 6].map(String), instruction: L('Nombor naik satu-satu. Apa seterusnya?', 'The numbers go up by one. What comes next?'), hint: L('Tambah satu pada nombor terakhir.', 'Add one to the last number.') };
          }
        });
      }
      const pairs = level === 1 ? 2 : level === 2 ? 3 : level === 4 ? 4 : 6;
      return runMemory(api, {
        size: pairs * 2,
        instruction: L('Cari pasangan gambar yang sama!', 'Find the matching pairs!'),
        hint: L('Ingat tempat setiap gambar. Buka dua kad.', 'Remember where each picture is. Open two cards.'),
        cards() {
          const chosen = shuffle(FACES).slice(0, pairs);
          return shuffle(chosen.flatMap((f) => [{ face: f, key: f }, { face: f, key: f }]));
        }
      });
    }
  },
  numbers: {
    id: 'numbers', ms: 'Kira Nombor', en: 'Number Safari', ico: '🔢', who: 'ari', rounds: 6,
    tagline: { ms: 'Kira, padan & operasi mudah', en: 'Count, match & simple sums' },
    skills: ['numerasi', 'kognitif'],
    render(api) { runQuiz(api, genNumbers); }
  },
  shapes: {
    id: 'shapes', ms: 'Bentuk & Padan', en: 'Shape Matcher', ico: '🔺', who: 'kiko', rounds: 6,
    tagline: { ms: 'Kenal bentuk di sekeliling kita', en: 'Spot shapes all around us' },
    skills: ['kognitif', 'numerasi'],
    render(api) { runQuiz(api, genShapes); }
  }
};

export { shapeSVG, SHAPES, sName };

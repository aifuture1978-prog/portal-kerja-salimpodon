/* =========================================================================
   games-b.js — Modul 7–12
   7 Mewarna & Trace · 8 Cerita Interaktif · 9 Fonik & Bacaan
   10 Sains & Alam · 11 Sosial-Emosi · 12 Muzik & Irama
   ========================================================================= */
import { L, pick, shuffle, rnd, esc, settings, audio, burst, burstAt, toast, announce } from './core.js';
import { runQuiz, runTrace, runMusic, buildShell, finishRound, traceGlyph, wordStrokes, say, praise, retryWord, markCorrect, markWrong, startHint, showHint, mascotSVG, MASCOTS } from './engine.js';

const mcq = (correct, pool, n = 4) => { correct.correct = true; return shuffle([correct, ...shuffle(pool.filter((x) => x.key !== correct.key)).slice(0, n - 1)]); };
const textOpt = (label, emoji = '') => ({ key: label, html: `${emoji ? `<span class="opt-visual">${emoji}</span>` : ''}<span class="opt-label">${esc(label)}</span>`, aria: label });
const bigOpt = (label, emoji) => ({ key: label, html: `<span class="opt-visual" style="font-size:3.4rem">${emoji}</span><span class="opt-label">${esc(label)}</span>`, aria: label, cls: 'emoji-tile' });
const emojiOpt = (label, emoji) => ({ key: label, html: `<span class="opt-visual" style="font-size:3.4rem">${emoji}</span>`, aria: label, cls: 'emoji-tile' });

/* ==================== 7. MEWARNA & TRACE ==================== */
const PAL = ['#FF7C7C', '#FFA552', '#FFD34E', '#7BD389', '#5BC0EB', '#B79CED', '#FF9EC4', '#8B6B4A', '#2E2A44'];

const PAGES = {
  bunga: `<svg viewBox="0 0 200 200" class="coloring-svg" role="img" aria-label="${L('Gambar bunga untuk diwarnakan', 'A flower to colour')}">
    <rect class="region" x="6" y="6" width="188" height="188" rx="20"/>
    <rect class="region" x="94" y="112" width="12" height="80" rx="6"/>
    <ellipse class="region" cx="62" cy="150" rx="26" ry="12" transform="rotate(-22 62 150)"/>
    <ellipse class="region" cx="138" cy="164" rx="26" ry="12" transform="rotate(20 138 164)"/>
    <ellipse class="region" cx="100" cy="52" rx="19" ry="27"/>
    <ellipse class="region" cx="100" cy="52" rx="19" ry="27" transform="rotate(60 100 82)"/>
    <ellipse class="region" cx="100" cy="52" rx="19" ry="27" transform="rotate(120 100 82)"/>
    <ellipse class="region" cx="100" cy="52" rx="19" ry="27" transform="rotate(180 100 82)"/>
    <ellipse class="region" cx="100" cy="52" rx="19" ry="27" transform="rotate(240 100 82)"/>
    <ellipse class="region" cx="100" cy="52" rx="19" ry="27" transform="rotate(300 100 82)"/>
    <circle class="region" cx="100" cy="82" r="17"/>
  </svg>`,
  ikan: `<svg viewBox="0 0 200 200" class="coloring-svg" role="img" aria-label="${L('Gambar ikan untuk diwarnakan', 'A fish to colour')}">
    <rect class="region" x="6" y="6" width="188" height="188" rx="20"/>
    <ellipse class="region" cx="92" cy="104" rx="60" ry="42"/>
    <polygon class="region" points="146,104 190,72 190,136"/>
    <polygon class="region" points="78,64 98,28 120,64"/>
    <polygon class="region" points="82,142 100,172 118,142"/>
    <circle class="region" cx="60" cy="94" r="10"/>
    <circle class="region" cx="44" cy="52" r="8"/>
    <circle class="region" cx="24" cy="34" r="6"/>
  </svg>`,
  rumah: `<svg viewBox="0 0 200 200" class="coloring-svg" role="img" aria-label="${L('Gambar rumah untuk diwarnakan', 'A house to colour')}">
    <rect class="region" x="6" y="6" width="188" height="188" rx="20"/>
    <circle class="region" cx="34" cy="36" r="17"/>
    <ellipse class="region" cx="158" cy="40" rx="26" ry="15"/>
    <polygon class="region" points="100,34 176,96 24,96"/>
    <rect class="region" x="46" y="96" width="108" height="76" rx="6"/>
    <rect class="region" x="88" y="126" width="26" height="46" rx="4"/>
    <rect class="region" x="58" y="110" width="24" height="24" rx="4"/>
    <rect class="region" x="120" y="110" width="24" height="24" rx="4"/>
    <rect class="region" x="10" y="172" width="180" height="24" rx="10"/>
  </svg>`,
  roket: `<svg viewBox="0 0 200 200" class="coloring-svg" role="img" aria-label="${L('Gambar roket untuk diwarnakan', 'A rocket to colour')}">
    <rect class="region" x="6" y="6" width="188" height="188" rx="20"/>
    <circle class="region" cx="34" cy="42" r="10"/>
    <circle class="region" cx="170" cy="108" r="8"/>
    <circle class="region" cx="42" cy="152" r="7"/>
    <path class="region" d="M100 22 C126 52 132 92 132 132 L68 132 C68 92 74 52 100 22 Z"/>
    <polygon class="region" points="68,102 38,152 68,142"/>
    <polygon class="region" points="132,102 162,152 132,142"/>
    <circle class="region" cx="100" cy="74" r="16"/>
    <polygon class="region" points="80,132 100,182 120,132"/>
  </svg>`
};

function runColoring(api, pageKey) {
  const el = buildShell(api);
  api.rounds = 1;
  api.setDots(0);
  let picked = PAL[0], filled = 0, used = new Set();
  const total = (PAGES[pageKey].match(/class="region"/g) || []).length;
  api.el.stage.innerHTML = `
    <div class="prompt-sub">${esc(L('Pilih warna, kemudian sentuh bahagian gambar untuk mewarnakannya.', 'Pick a colour, then tap a part of the picture to colour it.'))}</div>
    <div data-page>${PAGES[pageKey]}</div>
    <div class="palette" data-pal></div>
    <div class="row" style="justify-content:center;margin-top:.7rem">
      <button class="btn grass" data-done>✅ ${L('Siap!', 'Done!')}</button>
      <button class="btn ghost" data-clear>🧽 ${L('Padam warna', 'Clear')}</button>
    </div>`;
  const pal = api.el.stage.querySelector('[data-pal]');
  pal.innerHTML = PAL.map((c, i) => `<button class="swatch-btn" data-c="${c}" style="background:${c}" aria-label="${L('Warna', 'Colour')} ${i + 1}" aria-pressed="${i === 0}"></button>`).join('');
  pal.querySelectorAll('.swatch-btn').forEach((b) => {
    b.onclick = () => {
      picked = b.dataset.c;
      pal.querySelectorAll('.swatch-btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      audio.sfx('tap');
    };
  });
  api.el.stage.querySelectorAll('.region').forEach((r) => {
    r.setAttribute('tabindex', '0');
    r.setAttribute('role', 'button');
    const paint = () => {
      if (r.dataset.painted) return;
      r.dataset.painted = '1';
      r.style.fill = picked;
      used.add(picked); filled++;
      audio.sfx('pop');
      burstAt(r, ['✨'], 5);
      api.updateScore();
      if (filled === total) api.say(L('Cantik sekali lukisan kamu!', 'Your artwork is beautiful!'), 'cheer');
    };
    r.onclick = paint;
    r.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); paint(); } };
  });
  api.el.stage.querySelector('[data-clear]').onclick = () => {
    api.el.stage.querySelectorAll('.region').forEach((r) => { delete r.dataset.painted; r.style.fill = ''; });
    filled = 0; used = new Set(); api.sfx('whoosh');
  };
  api.el.stage.querySelector('[data-done]').onclick = () => {
    api.stats.total = total;
    api.stats.correct = Math.max(1, Math.round(filled * (used.size >= 2 ? 1 : 0.8)));
    api.stats.streak = used.size;
    finishRound(api);
  };
  api.say(L('Warnakan gambar ini dengan warna kegemaran kamu!', 'Colour this picture with your favourite colours!'));
  startHint(api, () => showHint(api, L('Sentuh bulatan warna dahulu, kemudian sentuh gambar.', 'Tap a colour circle first, then tap the picture.')));
}

/* ==================== 8. CERITA INTERAKTIF ==================== */
const PLACES = [
  { id: 'hutan', ico: '🌳', ms: 'Hutan Ajaib', en: 'Magic Forest' },
  { id: 'pantai', ico: '🏖️', ms: 'Pantai Cerah', en: 'Sunny Beach' },
  { id: 'angkasa', ico: '🚀', ms: 'Angkasa Bintang', en: 'Starry Space' },
  { id: 'laut', ico: '🐠', ms: 'Bawah Laut', en: 'Under the Sea' }
];
const INTRO = {
  hutan: { ms: 'Pada suatu pagi, {hero} berjalan ke dalam Hutan Ajaib. Daun-daun hijau berkilau dan burung berkicau riang.', en: 'One morning, {hero} walked into the Magic Forest. The green leaves sparkled and the birds sang happily.' },
  pantai: { ms: 'Matahari bersinar terang di Pantai Cerah. {hero} membina istana pasir yang besar sambil ombak menyanyi.', en: 'The sun shone brightly at Sunny Beach. {hero} built a big sandcastle while the waves sang.' },
  angkasa: { ms: 'Roket kecil {hero} terbang tinggi ke Angkasa Bintang. Bintang-bintang berkelip seperti lampu kecil.', en: '{hero}\'s little rocket flew high into Starry Space. The stars blinked like tiny lamps.' },
  laut: { ms: '{hero} menyelam ke Bawah Laut. Ikan-ikan berwarna-warni menari di sekelilingnya.', en: '{hero} dived under the sea. Colourful fish danced all around.' }
};
const BEATS = [
  { ms: 'Di {place}, {hero} terjumpa seekor anak haiwan yang tersesat dan kelihatan sedih.', en: 'At {place}, {hero} found a lost baby animal looking very sad.', options: [
    { v: 'tolong', ms: '{hero} menghampiri dan menolong anak haiwan itu mencari ibunya.', en: '{hero} went closer and helped the baby animal look for its mother.' },
    { v: 'sabar', ms: '{hero} duduk diam dan memerhati dahulu sebelum bertindak.', en: '{hero} sat quietly and watched first before acting.' },
    { v: 'berani', ms: '{hero} memberanikan diri bertanya kepada haiwan besar di situ.', en: '{hero} bravely asked the big animal nearby for help.' }] },
  { ms: 'Kemudian {hero} ternampak sebuah beg berisi bintang berkilau di atas tanah.', en: 'Then {hero} saw a bag full of sparkling stars on the ground.', options: [
    { v: 'jujur', ms: '{hero} membawa beg itu kepada penjaga bintang dan memulangkannya.', en: '{hero} took the bag to the star keeper and returned it.' },
    { v: 'tolong', ms: '{hero} mengagihkan bintang itu kepada kawan-kawan yang memerlukannya.', en: '{hero} shared the stars with friends who needed them.' },
    { v: 'berani', ms: '{hero} menyimpan beg itu sementara untuk mencari tuannya.', en: '{hero} kept the bag safe while looking for its owner.' }] },
  { ms: 'Matahari hampir terbenam dan {hero} perlu pulang.', en: 'The sun was setting and {hero} had to go home.', options: [
    { v: 'keluarga', ms: '{hero} bergegas pulang dan memeluk keluarganya dengan erat.', en: '{hero} rushed home and hugged the family tightly.' },
    { v: 'tolong', ms: '{hero} menghantar anak haiwan itu pulang dahulu sebelum balik.', en: '{hero} took the baby animal home first before going back.' },
    { v: 'sabar', ms: '{hero} mengemas tempat itu supaya bersih sebelum pulang.', en: '{hero} tidied up the place before going home.' }] }
];
const ENDINGS = {
  tolong: { ico: '🤝', ms: 'Kerana suka menolong, semua kawan di {place} sayang kepada {hero}.', en: 'Because {hero} loves to help, everyone at {place} loves {hero}.', v: { ms: 'Tolong-menolong', en: 'Helping others' } },
  jujur: { ico: '💎', ms: 'Kerana jujur memulangkan beg itu, {hero} dipercayai semua orang.', en: 'Because {hero} honestly returned the bag, everyone trusted {hero}.', v: { ms: 'Kejujuran', en: 'Honesty' } },
  keluarga: { ico: '🏡', ms: 'Kerana sayang keluarga, {hero} pulang dengan hati yang gembira.', en: 'Because {hero} loves the family, {hero} went home with a happy heart.', v: { ms: 'Sayang keluarga', en: 'Loving family' } },
  sabar: { ico: '🧘', ms: 'Kerana bersabar dan berhati-hati, {hero} berjaya menyelesaikan semuanya.', en: 'Because {hero} was patient and careful, everything worked out well.', v: { ms: 'Kesabaran', en: 'Patience' } },
  berani: { ico: '🦁', ms: 'Kerana berani mencuba, {hero} menjadi wira kecil di {place}.', en: 'Because {hero} dared to try, {hero} became a little hero at {place}.', v: { ms: 'Keberanian', en: 'Courage' } }
};
const t = (o) => (settings().lang === 'en' ? o.en : o.ms);
const fill = (s, hero, place) => s.replace(/\{hero\}/g, hero).replace(/\{place\}/g, place);

function runStory(api) {
  buildShell(api);
  api.rounds = 3;
  let step = 'hero', hero = MASCOTS[0], place = PLACES[0], values = [], beatsDone = 0, qk = 0, firstTry = true;
  const H = () => hero.name, PL = () => t(place);

  const setStage = (html) => { api.el.stage.innerHTML = html; };
  const setOpts = (cls, html) => { api.el.opts.className = cls; api.el.opts.innerHTML = html; };

  function pickHero() {
    api.setDots(0);
    setStage(`<div class="prompt-text">${esc(L('Pilih kawan cerita kamu!', 'Choose your story friend!'))}</div>
      <div class="row" style="justify-content:center;gap:1rem">${MASCOTS.map((m) => `<span class="mascot lg">${mascotSVG(m.id, 'happy').replace(/^<span[^>]*>|<\/span>$/g, '')}</span>`).join('')}</div>`);
    setOpts('opts', MASCOTS.map((m) => `<button class="opt" data-h="${m.id}"><span class="opt-visual">${m.ico}</span><span class="opt-label">${m.name}</span></button>`).join(''));
    api.el.opts.querySelectorAll('.opt').forEach((b) => {
      b.onclick = () => { hero = MASCOTS.find((m) => m.id === b.dataset.h); audio.sfx('pop'); pickPlace(); };
    });
    api.say(L('Siapa kawan kamu dalam cerita ini?', 'Who is your friend in this story?'));
  }
  function pickPlace() {
    step = 'place';
    setStage(`<div class="prompt-text">${esc(L(`Di mana ${H()} mahu bermain?`, `Where should ${H()} play?`))}</div>`);
    setOpts('opts', PLACES.map((p) => `<button class="opt" data-p="${p.id}"><span class="opt-visual">${p.ico}</span><span class="opt-label">${esc(t(p))}</span></button>`).join(''));
    api.el.opts.querySelectorAll('.opt').forEach((b) => {
      b.onclick = () => { place = PLACES.find((p) => p.id === b.dataset.p); audio.sfx('pop'); beat(0); };
    });
    api.say(L('Pilih tempat cerita ini berlaku.', 'Choose where the story happens.'));
  }
  function beat(i) {
    beatsDone = i;
    const b = BEATS[i];
    const intro = i === 0 ? `<p>${esc(fill(t(INTRO[place.id]), H(), PL()))}</p>` : '';
    setStage(`<div class="story-scene">${intro}<p>${esc(fill(t(b), H(), PL()))}</p>
      <div class="tiny muted">${esc(L('Apa yang patut dilakukan?', 'What should happen next?'))}</div></div>`);
    setOpts('choice-list', b.options.map((o, k) => `<button class="opt" style="align-items:flex-start;text-align:left" data-k="${k}"><span class="opt-label">${esc(fill(t(o), H(), PL()))}</span></button>`).join(''));
    api.el.opts.querySelectorAll('.opt').forEach((btn) => {
      btn.onclick = () => {
        const o = b.options[+btn.dataset.k];
        values.push(o.v); audio.sfx('pop');
        btn.classList.add('correct'); burstAt(btn, ['✨'], 6);
        if (i + 1 < BEATS.length) setTimeout(() => beat(i + 1), 700);
        else setTimeout(ending, 900);
      };
    });
    api.say(fill(t(b), H(), PL()));
  }
  function topValue() {
    const count = {};
    values.forEach((v) => { count[v] = (count[v] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  }
  function ending() {
    const v = topValue();
    const e = ENDINGS[v];
    const story = BEATS.map((b, i) => fill(t(b.options.find((o) => o.v === values[i]) || b.options[0]), H(), PL()));
    const full = `${fill(t(INTRO[place.id]), H(), PL())} ${story.join(' ')} ${fill(t(e), H(), PL())}`;
    setStage(`<div class="story-scene">
        <div style="font-size:3rem;text-align:center">${e.ico}</div>
        <p><b>${esc(L('Tamat cerita', 'The end'))}</b></p>
        <p>${esc(fill(t(e), H(), PL()))}</p>
        <p><span class="pill g">💛 ${esc(L('Nilai murni', 'Moral value'))}: ${esc(t(e.v))}</span></p>
        <details><summary class="tiny">${esc(L('Baca cerita penuh', 'Read the full story'))}</summary><p class="tiny">${esc(full)}</p></details>
      </div>`);
    setOpts('opts', `<button class="btn grass big" data-next>📖 ${L('Jawab soalan cerita', 'Answer story questions')}</button>`);
    api.el.opts.querySelector('[data-next]').onclick = () => { audio.sfx('pop'); question(0); };
    api.say(`${L('Tamat cerita. Nilai murni:', 'The end. The moral value is:')} ${t(e.v)}`, 'cheer');
    burst(window.innerWidth / 2, window.innerHeight / 2, ['📖', '✨', '💛', '⭐'], 14);
  }
  function question(k) {
    qk = k; firstTry = true;
    api.setDots(k);
    const v = topValue();
    let q, options;
    if (k === 0) {
      q = L('Di mana cerita ini berlaku?', 'Where did the story happen?');
      options = PLACES.map((p) => ({ key: p.id, html: `<span class="opt-visual">${p.ico}</span><span class="opt-label">${esc(t(p))}</span>`, aria: t(p), ok: p.id === place.id }));
    } else if (k === 1) {
      q = L('Apa nilai murni dalam cerita ini?', 'What is the moral value of this story?');
      const vals = ['tolong', 'jujur', 'keluarga', 'sabar'];
      options = vals.map((x) => ({ key: x, html: `<span class="opt-label">${esc(t(ENDINGS[x].v))}</span>`, aria: t(ENDINGS[x].v), ok: x === v }));
    } else {
      q = L('Siapa kawan dalam cerita ini?', 'Who was the friend in this story?');
      options = MASCOTS.map((m) => ({ key: m.id, html: `<span class="opt-visual">${m.ico}</span><span class="opt-label">${m.name}</span>`, aria: m.name, ok: m.id === hero.id }));
    }
    setStage(`<div class="prompt-text">${esc(q)}</div>`);
    setOpts('opts', '');
    shuffle(options).forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.innerHTML = o.html; b.setAttribute('aria-label', o.aria);
      b.onclick = () => {
        if (o.ok) {
          api.stats.total++; if (firstTry) api.stats.correct++;
          api.stats.streak++; api.stats.best = Math.max(api.stats.best, api.stats.streak);
          markCorrect(api, b); api.updateScore(); api.say(praise(), 'cheer');
          api.setDots(k + 1);
          if (k + 1 < 3) setTimeout(() => question(k + 1), 1200); else setTimeout(() => finishRound(api), 1200);
        } else {
          if (firstTry) { api.stats.total++; firstTry = false; api.stats.streak = 0; }
          markWrong(api, b, null); api.say(retryWord(), 'think'); api.updateScore();
        }
      };
      api.el.opts.appendChild(b);
    });
    api.say(q);
    startHint(api, () => showHint(api, L('Ingat semula cerita tadi.', 'Remember the story you just heard.')));
  }
  pickHero();
}

/* ==================== 9. FONIK & BACAAN ==================== */
const SOUNDS = [
  { s: 'mmm', ch: 'M' }, { s: 'sss', ch: 'S' }, { s: 'aaa', ch: 'A' }, { s: 'iii', ch: 'I' },
  { s: 'bbb', ch: 'B' }, { s: 'kkk', ch: 'K' }, { s: 'nnn', ch: 'N' }, { s: 'ttt', ch: 'T' }
];
const PHONW = [
  { w: 'Bola', e: '⚽' }, { w: 'Mata', e: '👁️' }, { w: 'Susu', e: '🥛' }, { w: 'Kaki', e: '🦶' },
  { w: 'Topi', e: '🎩' }, { w: 'Bunga', e: '🌸' }, { w: 'Roti', e: '🍞' }, { w: 'Nanas', e: '🍍' }
];
const READW = [
  { w: 'BOLA', e: '⚽' }, { w: 'BUKU', e: '📚' }, { w: 'SUSU', e: '🥛' }, { w: 'TOPI', e: '🎩' },
  { w: 'MEJA', e: '🪑' }, { w: 'ROTI', e: '🍞' }, { w: 'BUNGA', e: '🌸' }, { w: 'KUCING', e: '🐱' }
];
const SENT = [
  { s: 'Ibu minum susu.', e: '🥛', o: ['🥛', '📚', '⚽'] },
  { s: 'Ayah baca buku.', e: '📚', o: ['📚', '🍞', '🌸'] },
  { s: 'Ari main bola.', e: '⚽', o: ['⚽', '🥛', '🎩'] },
  { s: 'Kakak makan roti.', e: '🍞', o: ['🍞', '🐱', '🪑'] },
  { s: 'Kucing tidur di rumah.', e: '🐱', o: ['🐱', '🌸', '🥛'] }
];

function genPhonics(level, i) {
  if (level === 1) {
    const ans = pick(SOUNDS);
    const pool = SOUNDS.filter((x) => x.ch !== ans.ch);
    return {
      prompt: `<div class="prompt-big">🔊</div><div class="prompt-sub">${esc(L('Dengar bunyi, pilih hurufnya', 'Listen to the sound, pick the letter'))}</div>`,
      instruction: L(`Dengar bunyi "${ans.s}". Huruf apa?`, `Listen to the sound "${ans.s}". Which letter?`),
      say: `${ans.s}`,
      hint: L('Sebut bunyi itu perlahan-lahan, bentuk mulut kamu.', 'Say the sound slowly and feel your mouth shape.'),
      hint2: L(`Bunyi itu ialah huruf ${ans.ch}.`, `That sound is the letter ${ans.ch}.`),
      options: mcq(textOpt(ans.ch), pool.map((x) => textOpt(x.ch)))
    };
  }
  if (level === 2) {
    const o = pick(PHONW);
    const pool = PHONW.filter((x) => x.w !== o.w);
    return {
      prompt: `<div class="prompt-big">${o.e}</div><div class="prompt-text">${esc(o.w)}</div>`,
      instruction: L(`Bunyi pertama bagi ${o.w} ialah?`, `What is the first sound of ${o.w}?`),
      hint: L('Sebut perkataan itu dan dengar bunyi yang paling awal.', 'Say the word and listen to the very first sound.'),
      hint2: L(`Bunyi pertama ialah "${o.w[0]}".`, `The first sound is "${o.w[0]}".`),
      options: mcq(textOpt(o.w[0]), pool.map((x) => textOpt(x.w[0])))
    };
  }
  if (level === 3) {
    const syl = [['BA', 'JU', 'BAJU', '👕'], ['BO', 'LA', 'BOLA', '⚽'], ['BU', 'KU', 'BUKU', '📚'], ['MA', 'TA', 'MATA', '👁️'], ['RO', 'TI', 'ROTI', '🍞'], ['SU', 'SU', 'SUSU', '🥛']];
    const s = pick(syl);
    const pool = syl.filter((x) => x[2] !== s[2]);
    return {
      prompt: `<div style="display:flex;gap:.6rem;align-items:center;font-size:2.2rem;font-weight:800"><span style="background:#E4F4FF;padding:.3rem .8rem;border-radius:1rem">${s[0]}</span><span>➕</span><span style="background:#FFF4D6;padding:.3rem .8rem;border-radius:1rem">${s[1]}</span><span>🟰</span><span>❓</span></div>`,
      instruction: L(`Baca ${s[0]} ${s[1]}. Jadi perkataan apa?`, `Read ${s[0]} ${s[1]}. Which word is it?`),
      hint: L('Cantumkan dua bunyi itu dengan cepat.', 'Blend the two sounds together quickly.'),
      hint2: L(`Jawapannya ${s[2]}.`, `The answer is ${s[2]}.`),
      options: mcq({ key: s[2], html: `<span class="opt-visual">${s[3]}</span><span class="opt-label">${s[2]}</span>`, aria: s[2] }, pool.map((x) => ({ key: x[2], html: `<span class="opt-visual">${x[3]}</span><span class="opt-label">${x[2]}</span>`, aria: x[2] })))
    };
  }
  if (level === 4) {
    const o = pick(READW);
    const pool = READW.filter((x) => x.w !== o.w);
    return {
      prompt: `<div class="prompt-text" style="letter-spacing:.2rem">${esc(o.w)}</div>`,
      instruction: L('Baca perkataan ini. Pilih gambarnya.', 'Read this word. Pick its picture.'),
      hint: L('Sebut setiap huruf, kemudian gabungkan.', 'Say each letter, then blend them.'),
      hint2: L(`${o.w} — cari gambar itu.`, `${o.w} — find that picture.`),
      options: mcq(emojiOpt(o.w, o.e), shuffle(pool).slice(0, 3).map((x) => emojiOpt(x.w, x.e)))
    };
  }
  const s = pick(SENT);
  return {
    prompt: `<div class="prompt-text" style="font-size:clamp(1.2rem,4.4vw,1.8rem)">${esc(s.s)}</div>`,
    instruction: L('Baca ayat ini dengan kuat, kemudian pilih gambar yang betul.', 'Read this sentence aloud, then pick the right picture.'),
    hint: L('Cari perkataan yang paling penting dalam ayat itu.', 'Look for the most important word in the sentence.'),
    hint2: L('Gambarnya ialah ' + s.e, 'The picture is ' + s.e),
    options: shuffle(s.o.map((e) => Object.assign(emojiOpt(e, e), { correct: e === s.e })))
  };
}

/* ==================== 10. SAINS & ALAM ==================== */
const SCI = {
  1: [
    { q: { ms: 'Haiwan mana yang mengeong?', en: 'Which animal says meow?' }, o: [['Kucing', '🐱', 1], ['Anjing', '🐶', 0], ['Lembu', '🐄', 0]] },
    { q: { ms: 'Haiwan mana yang boleh terbang?', en: 'Which animal can fly?' }, o: [['Burung', '🐦', 1], ['Ikan', '🐟', 0], ['Kura-kura', '🐢', 0]] },
    { q: { ms: 'Haiwan mana yang memberi kita susu?', en: 'Which animal gives us milk?' }, o: [['Lembu', '🐄', 1], ['Ular', '🐍', 0], ['Kupu-kupu', '🦋', 0]] },
    { q: { ms: 'Haiwan mana yang hidup di air?', en: 'Which animal lives in water?' }, o: [['Ikan', '🐟', 1], ['Kucing', '🐱', 0], ['Ayam', '🐔', 0]] }
  ],
  2: [
    { q: { ms: 'Bahagian tumbuhan yang menyerap air dari tanah?', en: 'Which plant part absorbs water from the soil?' }, o: [['Akar', '🪴', 1], ['Daun', '🍃', 0], ['Bunga', '🌸', 0]] },
    { q: { ms: 'Bahagian tumbuhan yang membuat makanan?', en: 'Which plant part makes food?' }, o: [['Daun', '🍃', 1], ['Akar', '🪴', 0], ['Batang', '🌿', 0]] },
    { q: { ms: 'Bahagian tumbuhan yang menarik serangga?', en: 'Which plant part attracts insects?' }, o: [['Bunga', '🌸', 1], ['Akar', '🪴', 0], ['Batang', '🌿', 0]] },
    { q: { ms: 'Tumbuhan perlukan apa untuk membesar?', en: 'What do plants need to grow?' }, o: [['Air dan cahaya matahari', '☀️', 1], ['Gula-gula', '🍬', 0], ['Mainan', '🧸', 0]] }
  ],
  3: [
    { q: { ms: 'Langit gelap dan ada kilat. Cuaca apa?', en: 'The sky is dark with lightning. What weather is it?' }, o: [['Hujan', '🌧️', 1], ['Cerah', '☀️', 0], ['Bersalji', '❄️', 0]] },
    { q: { ms: 'Bila kita perlu pakai payung?', en: 'When do we need an umbrella?' }, o: [['Hujan', '🌧️', 1], ['Panas', '☀️', 0], ['Berangin', '🍃', 0]] },
    { q: { ms: 'Awan putih lembut di langit biru. Cuaca?', en: 'Soft white clouds in a blue sky. What weather?' }, o: [['Cerah', '☀️', 1], ['Ribut', '🌪️', 0], ['Hujan', '🌧️', 0]] },
    { q: { ms: 'Angin bertiup kuat dan pokok bergoyang. Cuaca?', en: 'The wind blows hard and trees sway. What weather?' }, o: [['Berangin', '🍃', 1], ['Panas', '☀️', 0], ['Sejuk', '❄️', 0]] }
  ],
  4: [
    { q: { ms: 'Kita melihat dengan apa?', en: 'What do we see with?' }, o: [['Mata', '👁️', 1], ['Telinga', '👂', 0], ['Hidung', '👃', 0]] },
    { q: { ms: 'Kita mendengar dengan apa?', en: 'What do we hear with?' }, o: [['Telinga', '👂', 1], ['Lidah', '👅', 0], ['Tangan', '✋', 0]] },
    { q: { ms: 'Kita menghidu dengan apa?', en: 'What do we smell with?' }, o: [['Hidung', '👃', 1], ['Mata', '👁️', 0], ['Kaki', '🦶', 0]] },
    { q: { ms: 'Kita berjalan dengan apa?', en: 'What do we walk with?' }, o: [['Kaki', '🦶', 1], ['Gigi', '🦷', 0], ['Rambut', '💇', 0]] }
  ],
  5: [
    { q: { ms: 'Yang mana benda hidup?', en: 'Which one is a living thing?' }, o: [['Kucing', '🐱', 1], ['Batu', '🪨', 0], ['Kerusi', '🪑', 0]] },
    { q: { ms: 'Ikan tinggal di mana?', en: 'Where do fish live?' }, o: [['Air', '💧', 1], ['Pokok', '🌳', 0], ['Gurun', '🏜️', 0]] },
    { q: { ms: 'Burung tinggal di mana?', en: 'Where do birds live?' }, o: [['Sarang di pokok', '🪺', 1], ['Dalam air', '💧', 0], ['Dalam tanah', '🕳️', 0]] },
    { q: { ms: 'Yang mana benda tak hidup?', en: 'Which one is not living?' }, o: [['Batu', '🪨', 1], ['Bunga', '🌸', 0], ['Ayam', '🐔', 0]] }
  ]
};
function genScience(level, i) {
  const list = SCI[level];
  const item = list[i % list.length];
  const opts = item.o.map(([ms, e, ok]) => ({
    key: ms,
    html: `<span class="opt-visual" style="font-size:3.4rem">${e}</span><span class="opt-label">${esc(ms)}</span>`,
    aria: ms, cls: 'emoji-tile', correct: !!ok
  }));
  return {
    prompt: `<div class="prompt-big">${level === 1 ? '🐾' : level === 2 ? '🌱' : level === 3 ? '⛅' : level === 4 ? '🧑' : '🌍'}</div>
      <div class="prompt-text">${esc(t(item.q))}</div>`,
    instruction: t(item.q),
    hint: L('Fikir tentang benda itu di dunia sebenar.', 'Think about it in the real world.'),
    hint2: L(`Jawapannya ${item.o.find((o) => o[2])[0]}.`, `The answer is ${item.o.find((o) => o[2])[0]}.`),
    options: shuffle(opts)
  };
}

/* ==================== 11. SOSIAL-EMOSI ==================== */
const EMO = [
  { e: '😀', ms: 'Gembira', en: 'Happy' }, { e: '😢', ms: 'Sedih', en: 'Sad' }, { e: '😠', ms: 'Marah', en: 'Angry' },
  { e: '😨', ms: 'Takut', en: 'Scared' }, { e: '😲', ms: 'Terkejut', en: 'Surprised' }, { e: '😌', ms: 'Tenang', en: 'Calm' },
  { e: '😴', ms: 'Mengantuk', en: 'Sleepy' }, { e: '🤗', ms: 'Sayang', en: 'Loving' }
];
const SITU = [
  { ms: 'Mainan kamu rosak.', en: 'Your toy is broken.', a: 'Sedih' },
  { ms: 'Kamu mendapat hadiah.', en: 'You got a present.', a: 'Gembira' },
  { ms: 'Kawan mengambil mainan kamu tanpa izin.', en: 'A friend took your toy without asking.', a: 'Marah' },
  { ms: 'Kamu mendengar bunyi kuat pada waktu malam.', en: 'You hear a loud noise at night.', a: 'Takut' },
  { ms: 'Ada kejutan hari jadi untuk kamu.', en: 'There is a birthday surprise for you.', a: 'Terkejut' }
];
const EMPATHY = [
  { q: { ms: 'Kawan kamu jatuh di padang.', en: 'Your friend fell down in the field.' }, ok: { ms: 'Tolong bangunkan dia', en: 'Help them get up' }, bad: [{ ms: 'Ketawakan dia', en: 'Laugh at them' }, { ms: 'Jalan terus', en: 'Just walk away' }] },
  { q: { ms: 'Kawan kamu menangis kerana penselnya hilang.', en: 'Your friend cries because their pencil is lost.' }, ok: { ms: 'Tolong cari pensel bersama', en: 'Help look for the pencil together' }, bad: [{ ms: 'Kata "bukan salah saya"', en: 'Say "not my fault"' }, { ms: 'Buat tidak tahu', en: 'Pretend not to notice' }] },
  { q: { ms: 'Ada kawan baharu duduk seorang diri.', en: 'A new friend sits all alone.' }, ok: { ms: 'Ajak dia bermain bersama', en: 'Invite them to play together' }, bad: [{ ms: 'Ketawakan dia', en: 'Laugh at them' }, { ms: 'Jauhkan diri', en: 'Stay away' }] },
  { q: { ms: 'Kucing kecil kelihatan kelaparan.', en: 'A small kitten looks hungry.' }, ok: { ms: 'Beritahu orang dewasa dan beri makan', en: 'Tell an adult and give it food' }, bad: [{ ms: 'Baling batu', en: 'Throw stones' }, { ms: 'Halau ia jauh', en: 'Chase it away' }] }
];
const GOOD = [
  { ok: { ms: 'Berkongsi mainan dengan kawan', en: 'Share toys with friends' }, bad: [{ ms: 'Merampas mainan', en: 'Snatch toys' }, { ms: 'Menolak kawan', en: 'Push friends' }] },
  { ok: { ms: 'Bercakap "terima kasih"', en: 'Say "thank you"' }, bad: [{ ms: 'Menjerit pada ibu', en: 'Shout at mum' }, { ms: 'Membaling barang', en: 'Throw things' }] },
  { ok: { ms: 'Buang sampah ke dalam tong', en: 'Put rubbish in the bin' }, bad: [{ ms: 'Buang sampah di lantai', en: 'Drop rubbish on the floor' }, { ms: 'Koyak buku', en: 'Tear a book' }] },
  { ok: { ms: 'Minta izin sebelum guna barang orang', en: 'Ask before using someone\'s things' }, bad: [{ ms: 'Ambil terus tanpa izin', en: 'Take it without asking' }, { ms: 'Sorok barang kawan', en: 'Hide a friend\'s things' }] }
];
const CALM = [
  { q: { ms: 'Kamu marah sangat kerana kalah dalam permainan.', en: 'You are very angry because you lost the game.' }, ok: { ms: 'Tarik nafas dalam-dalam dan kira 1 sampai 5', en: 'Breathe deeply and count 1 to 5' }, bad: [{ ms: 'Jerit dan hentak kaki', en: 'Shout and stamp your feet' }, { ms: 'Baling barang', en: 'Throw things' }] },
  { q: { ms: 'Kamu takut masuk ke bilik yang gelap.', en: 'You are scared to enter a dark room.' }, ok: { ms: 'Minta izin pasang lampu kecil', en: 'Ask to switch on a small light' }, bad: [{ ms: 'Menangis kuat', en: 'Cry loudly' }, { ms: 'Simpan perasaan sendiri', en: 'Keep it all inside' }] },
  { q: { ms: 'Kamu sedih kerana kawan kamu pindah rumah.', en: 'You are sad because your friend moved away.' }, ok: { ms: 'Beritahu ibu bapa dan minta pelukan', en: 'Tell your parents and ask for a hug' }, bad: [{ ms: 'Marah pada semua orang', en: 'Get angry at everyone' }, { ms: 'Duduk sendiri sepanjang hari', en: 'Sit alone all day' }] }
];
function genFeelings(level, i) {
  if (level === 1) {
    const ans = pick(EMO);
    const pool = EMO.filter((x) => x.ms !== ans.ms);
    return {
      prompt: `<div class="prompt-big">${ans.e}</div>`,
      instruction: L('Muka ini menunjukkan perasaan apa?', 'What feeling does this face show?'),
      hint: L('Tengok mulut dan mata pada muka itu.', 'Look at the mouth and eyes.'),
      hint2: L(`Perasaannya ${ans.ms}.`, `The feeling is ${ans.en}.`),
      options: mcq(textOpt(t(ans)), shuffle(pool).slice(0, 3).map((x) => textOpt(t(x))))
    };
  }
  if (level === 2) {
    const s = pick(SITU);
    const ans = EMO.find((x) => x.ms === s.a);
    return {
      prompt: `<div class="prompt-big">🤔</div><div class="prompt-text">${esc(t(s))}</div>`,
      instruction: L('Apa perasaan kamu dalam situasi ini?', 'How would you feel in this situation?'),
      hint: L('Bayangkan kamu berada dalam situasi itu.', 'Imagine you are in that situation.'),
      hint2: L(`Biasanya kita rasa ${ans.ms}.`, `Usually we feel ${ans.en}.`),
      options: mcq({ key: ans.ms, html: `<span class="opt-visual">${ans.e}</span><span class="opt-label">${esc(t(ans))}</span>`, aria: t(ans) }, shuffle(EMO.filter((x) => x.ms !== ans.ms)).slice(0, 3).map((x) => ({ key: x.ms, html: `<span class="opt-visual">${x.e}</span><span class="opt-label">${esc(t(x))}</span>`, aria: t(x) })))
    };
  }
  if (level === 3) {
    const s = pick(EMPATHY);
    return {
      prompt: `<div class="prompt-big">💗</div><div class="prompt-text">${esc(t(s.q))}</div>`,
      instruction: L('Apa yang patut kamu buat?', 'What should you do?'),
      hint: L('Pilih tindakan yang menyayangi kawan kamu.', 'Choose the action that shows care for your friend.'),
      hint2: L('Tindakan yang paling baik ialah menolong.', 'The kindest action is to help.'),
      options: shuffle([{ key: 'ok', html: `<span class="opt-visual">🤝</span><span class="opt-label">${esc(t(s.ok))}</span>`, aria: t(s.ok), ok: true },
        ...s.bad.map((b, k) => ({ key: 'b' + k, html: `<span class="opt-visual">${['😐', '🙈'][k]}</span><span class="opt-label">${esc(t(b))}</span>`, aria: t(b) }))])
        .map((o) => ({ ...o, correct: !!o.ok }))
    };
  }
  if (level === 4) {
    const g = pick(GOOD);
    return {
      prompt: `<div class="prompt-big">🌟</div><div class="prompt-text">${esc(L('Yang mana perbuatan baik?', 'Which one is good behaviour?'))}</div>`,
      instruction: L('Pilih perbuatan yang baik.', 'Choose the good behaviour.'),
      hint: L('Perbuatan baik menyenangkan hati orang lain.', 'Good behaviour makes others happy.'),
      hint2: L('Yang betul ialah ' + t(g.ok), 'The correct one is ' + t(g.ok)),
      options: shuffle([{ key: 'ok', html: `<span class="opt-visual">💚</span><span class="opt-label">${esc(t(g.ok))}</span>`, aria: t(g.ok), correct: true },
        ...g.bad.map((b, k) => ({ key: 'b' + k, html: `<span class="opt-visual">${['🙅', '🚫'][k]}</span><span class="opt-label">${esc(t(b))}</span>`, aria: t(b) }))])
    };
  }
  const c = pick(CALM);
  return {
    prompt: `<div class="prompt-big">🧘</div><div class="prompt-text">${esc(t(c.q))}</div>`,
    instruction: L('Apa cara yang baik untuk menenangkan diri?', 'What is a good way to calm yourself?'),
    hint: L('Cara yang baik tidak menyakiti diri atau orang lain.', 'A good way hurts no one, including yourself.'),
    hint2: L('Cuba ' + t(c.ok), 'Try to ' + t(c.ok)),
    options: shuffle([{ key: 'ok', html: `<span class="opt-visual">🌬️</span><span class="opt-label">${esc(t(c.ok))}</span>`, aria: t(c.ok), correct: true },
      ...c.bad.map((b, k) => ({ key: 'b' + k, html: `<span class="opt-visual">${['😤', '😔'][k]}</span><span class="opt-label">${esc(t(b))}</span>`, aria: t(b) }))])
  };
}

/* ==================== 12. MUZIK & IRAMA ==================== */
const INSTR = [
  { id: 'piano', ms: 'Piano', en: 'Piano', ico: '🎹' },
  { id: 'flute', ms: 'Seruling', en: 'Flute', ico: '🎶' },
  { id: 'drum', ms: 'Gendang', en: 'Drum', ico: '🥁' },
  { id: 'bell', ms: 'Loceng', en: 'Bell', ico: '🔔' }
];
function genMusicTask(level, i) {
  if (level === 4) {
    const ans = pick(INSTR);
    return {
      mode: 'instrument', instruments: INSTR, answer: ans.id, freq: 523.25,
      clue: L('Dengar bunyi alat muzik ini', 'Listen to this instrument'),
      instruction: L('Alat muzik apa yang kamu dengar?', 'Which instrument did you hear?'),
      hint: L('Gendang berbunyi "dum", loceng berbunyi "ting".', 'A drum goes "dum", a bell goes "ting".')
    };
  }
  const pads = level === 1 || level === 2 ? 4 : level === 3 ? 5 : 6;
  const len = level === 1 ? 2 : level === 2 ? 3 : level === 3 ? 4 : 6;
  const seq = Array.from({ length: len }, () => rnd(pads));
  return {
    mode: 'pads', pads, seq, speed: level >= 5 ? 500 : 620, timbre: level === 5 ? 'bell' : 'piano',
    clue: L(`Ikut irama ${len} bunyi ini`, `Copy this ${len}-note rhythm`),
    instruction: L('Dengar irama, kemudian tekan pad mengikut urutan yang sama.', 'Listen to the rhythm, then tap the pads in the same order.'),
    hint: L('Tengok pad yang menyala, kemudian ikut susunannya.', 'Watch which pad lights up, then follow the order.')
  };
}

/* ==================== DEFINISI MODUL 7–12 ==================== */
export const gamesB = {
  trace: {
    id: 'trace', ms: 'Mewarna & Trace', en: 'Coloring & Tracing', ico: '✏️', who: 'ari', rounds: 4,
    tagline: { ms: 'Tulis, jejak & warnakan', en: 'Write, trace & colour' },
    skills: ['motor', 'kreativiti'],
    render(api) {
      const lv = api.level;
      if (lv === 4) return runColoring(api, pick(['bunga', 'ikan', 'rumah', 'roket']));
      runTrace(api, {
        task(level, i) {
          if (level === 1) return { clue: L('Jejak garis lurus dan zigzag', 'Trace the straight line and the zigzag'), instruction: L('Ikut garis putus-putus dengan jari atau tetikus kamu.', 'Follow the dotted lines with your finger or mouse.'), strokes: [...traceGlyph('garis'), ...traceGlyph('zigzag')] };
          if (level === 2) return { clue: L('Jejak bentuk segi empat dan segi tiga', 'Trace the square and the triangle'), instruction: L('Jejak tepi bentuk ini perlahan-lahan.', 'Trace the edges of these shapes slowly.'), strokes: [...traceGlyph('segiempat'), ...traceGlyph('segitiga')] };
          if (level === 3) return { clue: L('Tulis nombor 1 dan 3', 'Write the numbers 1 and 3'), instruction: L('Tulis nombor ini mengikut garis putus-putus.', 'Write these numbers along the dotted lines.'), strokes: [...traceGlyph('1'), ...traceGlyph('3')] };
          if (level === 4) return { clue: L('Warnakan gambar', 'Colour the picture'), instruction: L('Pilih warna dan warnakan gambar.', 'Pick a colour and colour the picture.'), strokes: [traceGlyph('O')], mode: 'color', palette: true };
          const w = pick(['IBU', 'API', 'BUKU', 'TOPI', 'BOLA', 'KOTAK']);
          return { clue: L(`Tulis perkataan ${w}`, `Write the word ${w}`), instruction: L(`Jejak perkataan ${w} huruf demi huruf.`, `Trace the word ${w} letter by letter.`), strokes: wordStrokes(w) };
        }
      });
    }
  },
  story: {
    id: 'story', ms: 'Cerita Interaktif', en: 'Story Time', ico: '📖', who: 'bobo', rounds: 3,
    tagline: { ms: 'Cerita yang kamu pilih sendiri', en: 'A story you choose yourself' },
    skills: ['literasi', 'sosial'],
    render(api) { runStory(api); }
  },
  phonics: {
    id: 'phonics', ms: 'Fonik & Bacaan', en: 'Phonics Fun', ico: '🗣️', who: 'kiko', rounds: 6,
    tagline: { ms: 'Bunyi, suku kata & membaca', en: 'Sounds, syllables & reading' },
    skills: ['literasi'],
    render(api) { runQuiz(api, genPhonics); }
  },
  science: {
    id: 'science', ms: 'Sains & Alam', en: 'Little Explorer', ico: '🔬', who: 'bobo', rounds: 6,
    tagline: { ms: 'Haiwan, tumbuhan, cuaca & badan', en: 'Animals, plants, weather & body' },
    skills: ['kognitif', 'sains'],
    render(api) { runQuiz(api, genScience); }
  },
  feelings: {
    id: 'feelings', ms: 'Sosial-Emosi', en: 'Feelings & Friends', ico: '💖', who: 'ari', rounds: 6,
    tagline: { ms: 'Kenal emosi & jadi kawan baik', en: 'Know feelings & be a good friend' },
    skills: ['sosial'],
    render(api) { runQuiz(api, genFeelings); }
  },
  music: {
    id: 'music', ms: 'Muzik & Irama', en: 'Music Play', ico: '🎵', who: 'bobo', rounds: 6,
    tagline: { ms: 'Dengar, ikut irama & alat muzik', en: 'Listen, copy the beat & instruments' },
    skills: ['kreativiti', 'motor'],
    render(api) { runMusic(api, { task: genMusicTask }); }
  }
};

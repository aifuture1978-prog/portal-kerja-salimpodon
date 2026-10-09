/* ═══════════════════════════════════════════════════════════════
   Platform Master — logik aplikasi
   Lapisan storan:  Awan WorkBuddy (utama)  →  Mod tempatan (pilihan)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = window.__PM_CLOUD__ || null;   // diisi apabila backend awan diaktifkan
  var LS_KEY = 'pm-registry-v1';
  var LS_MODE = 'pm-mode';

  var state = {
    reg: null,
    mode: 'cloud',      // 'cloud' | 'local'
    cloud: null,        // klien SDK
    user: null,
    ready: false,
    dirty: false
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var uid = function (p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  /* ══════════════ STORAN ══════════════ */

  function allLinks(reg) {
    var out = [];
    reg.platforms.forEach(function (p) {
      p.links.forEach(function (l) { out.push({ p: p, l: l }); });
    });
    return out;
  }

  function normalise(reg) {
    reg.platforms.forEach(function (p) {
      p.links.forEach(function (l, i) {
        if (typeof l.order !== 'number') l.order = i + 1;
        if (l.visible === undefined) l.visible = true;
        if (!l.id) l.id = uid(p.id);
      });
      p.links.sort(function (a, b) { return a.order - b.order; });
    });
    return reg;
  }

  var Store = {
    async init() {
      var seed = await fetch('registry.json', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .catch(function () { return null; });
      if (!seed) { toast('Gagal memuatkan registry.json'); return null; }

      var mode = localStorage.getItem(LS_MODE) || 'cloud';
      var local = localStorage.getItem(LS_KEY);

      if (CFG && mode === 'cloud') {
        try {
          await initCloud();
          var remote = await cloudLoad();
          if (remote) { state.reg = normalise(remote); state.mode = 'cloud'; state.ready = true; return state.reg; }
          await cloudSave(seed);
          state.reg = normalise(seed); state.mode = 'cloud'; state.ready = true; return state.reg;
        } catch (e) {
          console.warn('[PM] awan gagal, jatuh ke mod tempatan:', e && e.message);
          mode = 'local';
        }
      }

      state.mode = 'local';
      state.reg = normalise(local ? JSON.parse(local) : seed);
      state.ready = true;
      return state.reg;
    },

    async save() {
      state.reg.meta.updated = new Date().toISOString().slice(0, 10);
      if (state.mode === 'cloud' && state.cloud) {
        try { await cloudSave(state.reg); state.dirty = false; return true; }
        catch (e) { toast('Gagal simpan ke awan — disimpan setempat'); }
      }
      localStorage.setItem(LS_KEY, JSON.stringify(state.reg));
      state.dirty = true;
      return true;
    },

    exportFile() {
      var blob = new Blob([JSON.stringify(state.reg, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'registry.json';
      a.click();
      URL.revokeObjectURL(a.href);
      toast('registry.json dimuat turun');
    },

    reset() {
      localStorage.removeItem(LS_KEY);
      location.reload();
    }
  };

  /* ══════════════ AWAN ══════════════ */

  var cloudDeploy = null;

  async function initCloud() {
    if (!window.WorkBuddyCloud) throw new Error('SDK tidak dimuatkan');
    state.cloud = window.WorkBuddyCloud.createWorkBuddyCloud({
      endpoint: CFG.endpoint,
      oauthRelayBaseUrl: CFG.oauthRelayBaseUrl,
      publishableKey: CFG.publishableKey
    });
  }

  var TABLE = 'pm_registry';

  async function cloudLoad() {
    var db = state.cloud.database;
    var res = await db.from(TABLE).select('*').limit(1);
    var row = (res && res.data && res.data[0]) || (Array.isArray(res) ? res[0] : null);
    if (!row) return null;
    var payload = row.payload || row.data;
    return typeof payload === 'string' ? JSON.parse(payload) : payload;
  }

  async function cloudSave(reg) {
    var db = state.cloud.database;
    var existing = await db.from(TABLE).select('id').limit(1);
    var row = (existing && existing.data && existing.data[0]) || null;
    var body = { payload: reg, updated_at: new Date().toISOString() };
    if (row && row.id) await db.from(TABLE).update(row.id, body);
    else await db.from(TABLE).insert(body);
  }

  /* ══════════════ RENDER ══════════════ */

  function render() {
    var reg = state.reg;
    var links = allLinks(reg);
    var vis = links.filter(function (x) { return x.l.visible !== false; });

    /* stats */
    $('#stats').innerHTML =
      '<div class="stat"><b>' + reg.platforms.length + '</b><span>Platform</span></div>' +
      '<div class="stat"><b>' + vis.length + '</b><span>Pautan Aktif</span></div>' +
      '<div class="stat"><b>' + reg.platforms.reduce(function (n, p) { return n + p.links.filter(function (l) { return /bahan-pdp|games/.test(l.url || ''); }).length; }, 0) + '</b><span>PdP &amp; Permainan</span></div>' +
      '<div class="stat"><b>' + (state.mode === 'cloud' ? 'Awan' : 'Setempat') + '</b><span>Storan</span></div>';

    /* dock */
    $('#dock').innerHTML = reg.platforms.map(function (p) {
      return '<a href="#' + p.id + '">' + esc(p.num) + ' · ' + esc(p.title) + '</a>';
    }).join('');

    /* sections */
    $('#app').innerHTML = reg.platforms.map(function (p) {
      var ls = p.links.filter(function (l) { return l.visible !== false; })
        .sort(function (a, b) { return a.order - b.order; });
      return '' +
        '<section class="plat" id="' + p.id + '" style="--acc:' + esc(p.accent) + '">' +
          '<div class="phead">' +
            '<div class="num">' + esc(p.num) + '</div>' +
            '<div>' +
              '<h2>' + esc(p.title) + '</h2>' +
              '<p>' + esc(p.desc) + '</p>' +
              '<span class="pcount"><b>' + ls.length + '</b> pautan aktif</span>' +
            '</div>' +
          '</div>' +
          '<div class="grid">' + ls.map(card).join('') + '</div>' +
        '</section>';
    }).join('');

    markDock();
  }

  function card(l) {
    var ext = /^https?:\/\//i.test(l.url || '');
    var badge = l.badge ? '<span class="badge b-' + esc(l.badgeType || 'live') + '">' + esc(l.badge) + '</span>' : '';
    var tags = (l.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    return '' +
      '<a class="card" href="' + esc(l.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : ' target="_blank" rel="noopener"') + '>' +
        badge +
        '<div class="ic">' + esc(l.icon || '◆') + '</div>' +
        '<h3>' + esc(l.title) + '</h3>' +
        '<p class="d">' + esc(l.desc || '') + '</p>' +
        (tags ? '<div class="m">' + tags + '</div>' : '') +
        '<div class="go">Buka <i>→</i></div>' +
      '</a>';
  }

  function markDock() {
    var secs = $$('main .plat');
    if (!secs.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $$('#dock a').forEach(function (a) {
            a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ══════════════ DRAWER ══════════════ */

  function openDrawer(id) {
    $('#scrim').classList.add('on');
    $(id).classList.add('on');
  }
  function closeDrawers() {
    $('#scrim').classList.remove('on');
    $$('.drawer').forEach(function (d) { d.classList.remove('on'); });
  }

  /* ══════════════ PANEL URUS ══════════════ */

  function renderAdmin() {
    var b = $('#adminBody');
    var modeNote = state.mode === 'cloud'
      ? '<div class="note ok"><b>Storan awan aktif.</b> Semua perubahan disimpan serta-merta dan boleh diakses dari mana-mana peranti.</div>'
      : '<div class="note warn"><b>Mod setempat.</b> Perubahan disimpan dalam pelayar ini sahaja. Guna <b>Eksport</b> untuk memuat turun registry.json, atau klik <b>Publish</b> untuk hantar ke awan apabila backend sedia.</div>';

    b.innerHTML =
      modeNote +
      '<div class="sep"></div>' +
      '<div class="sec-t">Tambah pautan baharu</div>' +
      '<div class="field"><label>Platform</label><select id="fPlat">' +
        state.reg.platforms.map(function (p) {
          return '<option value="' + p.id + '">' + esc(p.num + ' · ' + p.title) + '</option>';
        }).join('') +
      '</select></div>' +
      '<div class="field"><label>Tajuk</label><input id="fTitle" placeholder="Contoh: Command Center Baharu"></div>' +
      '<div class="field"><label>Pautan (URL)</label><input id="fUrl" placeholder="works/... atau https://..."><div class="hint">Laluan relatif dalam hub, atau URL penuh untuk laman luar.</div></div>' +
      '<div class="field"><label>Penerangan</label><textarea id="fDesc" placeholder="Ringkasan ringkas pautan ini"></textarea></div>' +
      '<div class="row">' +
        '<div class="field"><label>Ikon</label><input id="fIcon" value="◆" maxlength="4"></div>' +
        '<div class="field"><label>Label (pilihan)</label><input id="fBadge" placeholder="Baharu / Luaran"></div>' +
      '</div>' +
      '<div class="field"><label>Tag (pisah dengan koma)</label><input id="fTags" placeholder="3 PK, 8 ejen"></div>' +
      '<button class="btn btn-solid" id="doAdd" style="width:100%">+ Tambah pautan</button>' +

      '<div class="sep"></div>' +
      '<div class="sec-t">Semua pautan (' + allLinks(state.reg).length + ')</div>' +
      '<div class="alist">' + state.reg.platforms.map(function (p) {
        return p.links.slice().sort(function (a, b) { return a.order - b.order; }).map(function (l) {
          return '<div class="arow">' +
            '<span class="ai">' + esc(l.icon || '◆') + '</span>' +
            '<span class="at"><b>' + esc(l.title) + '</b><small>' + esc(p.num) + ' · ' + esc(l.url) + '</small></span>' +
            '<button class="ab" data-up="' + l.id + '" title="Naik">↑</button>' +
            '<button class="ab" data-down="' + l.id + '" title="Turun">↓</button>' +
            '<button class="ab" data-vis="' + l.id + '" title="Sembunyi/Tunjuk">' + (l.visible === false ? '○' : '●') + '</button>' +
            '<button class="ab del" data-del="' + l.id + '" title="Buang">✕</button>' +
          '</div>';
        }).join('');
      }).join('') + '</div>' +

      '<div class="sep"></div>' +
      '<div class="sec-t">Data</div>' +
      '<div class="row">' +
        '<button class="btn btn-ghost" id="doExport">⇩ Eksport registry.json</button>' +
        '<button class="btn btn-ghost" id="doImport">⇧ Import</button>' +
      '</div>' +
      '<input type="file" id="fileImport" accept=".json" style="display:none">' +
      (state.mode === 'local'
        ? '<button class="btn btn-ghost" id="doPublish" style="width:100%;margin-top:10px">◈ Hantar ke awan</button>'
        : '') +
      '<div class="hint" style="margin-top:14px">Registry: <b>' + esc(state.reg.meta.version || '1.0.0') + '</b> · dikemas kini ' + esc(state.reg.meta.updated || '—') + '</div>';

    bindAdmin();
  }

  function findLink(id) {
    var hit = null;
    state.reg.platforms.forEach(function (p) {
      p.links.forEach(function (l) { if (l.id === id) hit = { p: p, l: l }; });
    });
    return hit;
  }

  function bindAdmin() {
    var b = $('#adminBody');

    $('#doAdd').addEventListener('click', async function () {
      var plat = $('#fPlat').value;
      var title = $('#fTitle').value.trim();
      var url = $('#fUrl').value.trim();
      if (!title || !url) { toast('Tajuk dan pautan diperlukan'); return; }
      var p = state.reg.platforms.filter(function (x) { return x.id === plat; })[0];
      if (!p) return;
      p.links.push({
        id: uid(p.id), title: title, desc: $('#fDesc').value.trim(), url: url,
        icon: $('#fIcon').value.trim() || '◆', badge: $('#fBadge').value.trim(), badgeType: 'new',
        tags: $('#fTags').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        visible: true, order: p.links.length + 1
      });
      await Store.save(); render(); renderAdmin(); toast('Pautan ditambah');
    });

    b.querySelectorAll('[data-del]').forEach(function (el) {
      el.addEventListener('click', async function () {
        var hit = findLink(el.getAttribute('data-del'));
        if (!hit) return;
        if (!confirm('Buang pautan "' + hit.l.title + '" ?')) return;
        hit.p.links = hit.p.links.filter(function (l) { return l.id !== hit.l.id; });
        await Store.save(); render(); renderAdmin(); toast('Pautan dibuang');
      });
    });

    b.querySelectorAll('[data-vis]').forEach(function (el) {
      el.addEventListener('click', async function () {
        var hit = findLink(el.getAttribute('data-vis'));
        if (!hit) return;
        hit.l.visible = hit.l.visible === false;
        await Store.save(); render(); renderAdmin(); toast(hit.l.visible ? 'Ditunjuk' : 'Disembunyikan');
      });
    });

    function move(id, dir) {
      var hit = findLink(id);
      if (!hit) return;
      var arr = hit.p.links.slice().sort(function (a, b) { return a.order - b.order; });
      var i = arr.indexOf(hit.l);
      var j = i + dir;
      if (j < 0 || j >= arr.length) return;
      var t = arr[i].order; arr[i].order = arr[j].order; arr[j].order = t;
      hit.p.links.sort(function (a, b) { return a.order - b.order; });
      hit.p.links.forEach(function (l, k) { l.order = k + 1; });
      Store.save().then(function () { render(); renderAdmin(); });
    }
    b.querySelectorAll('[data-up]').forEach(function (el) {
      el.addEventListener('click', function () { move(el.getAttribute('data-up'), -1); });
    });
    b.querySelectorAll('[data-down]').forEach(function (el) {
      el.addEventListener('click', function () { move(el.getAttribute('data-down'), 1); });
    });

    $('#doExport').addEventListener('click', function () { Store.exportFile(); });
    $('#doImport').addEventListener('click', function () { $('#fileImport').click(); });
    $('#fileImport').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = async function () {
        try {
          state.reg = normalise(JSON.parse(fr.result));
          await Store.save(); render(); renderAdmin(); toast('Registry diimport');
        } catch (err) { toast('Fail tidak sah'); }
      };
      fr.readAsText(f);
    });

    var pub = $('#doPublish');
    if (pub) pub.addEventListener('click', function () {
      if (!CFG) { toast('Backend awan belum diaktifkan'); return; }
      location.reload();
    });
  }

  /* ══════════════ KONSOL EJEN ══════════════ */

  var chat = [];

  function renderAgent() {
    var b = $('#agentBody');
    b.innerHTML =
      '<div class="note">Perintah dalam bahasa biasa. Contoh: <b>tambah pautan "Dashboard Baharu" works/x.html ke platform 2</b> · <b>buang pautan Islamic Legends</b> · <b>sembunyi Nexus Office</b> · <b>senarai platform 3</b></div>' +
      '<div class="chips">' +
        '<span class="chip" data-c="senarai semua pautan">senarai semua</span>' +
        '<span class="chip" data-c="berapa jumlah pautan">jumlah pautan</span>' +
        '<span class="chip" data-c="cari kajian">cari kajian</span>' +
        '<span class="chip" data-c="senarai platform 3">platform 3</span>' +
        '<span class="chip" data-c="susun semula ikut abjad">susun ikut abjad</span>' +
      '</div>' +
      '<div class="log" id="log"></div>' +
      '<div class="composer">' +
        '<textarea id="cmd" rows="1" placeholder="Taip perintah…"></textarea>' +
        '<button class="send" id="sendCmd">→</button>' +
      '</div>' +
      (state.mode === 'local'
        ? '<div class="hint" style="margin-top:14px">Mod setempat: perintah difahami oleh penghurai terbina. Apabila backend awan diaktifkan, konsol ini dikuasakan oleh model bahasa penuh.</div>'
        : '<div class="hint" style="margin-top:14px">Dikuasakan oleh model bahasa awan.</div>');

    drawLog();
    var ta = $('#cmd');
    ta.addEventListener('input', function () { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 150) + 'px'; });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run(); }
    });
    $('#sendCmd').addEventListener('click', run);
    b.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () { $('#cmd').value = c.getAttribute('data-c'); run(); });
    });

    async function run() {
      var ta2 = $('#cmd');
      var text = ta2.value.trim();
      if (!text) return;
      ta2.value = ''; ta2.style.height = 'auto';
      chat.push({ r: 'me', t: text });
      drawLog();
      $('#sendCmd').disabled = true;
      try {
        var reply = state.mode === 'cloud' && state.cloud
          ? await agentCloud(text)
          : await agentLocal(text);
        chat.push({ r: 'ag', t: reply });
      } catch (e) {
        chat.push({ r: 'ag', t: 'Ralat: ' + (e && e.message ? e.message : 'tidak diketahui') });
      }
      $('#sendCmd').disabled = false;
      drawLog();
      render(); renderAdmin();
    }
  }

  function drawLog() {
    var log = $('#log');
    if (!log) return;
    log.innerHTML = chat.map(function (m) {
      return '<div class="msg ' + m.r + '">' + m.t + '</div>';
    }).join('');
    log.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }

  /* ---- ejen setempat: penghurai perintah ---- */

  async function agentLocal(text) {
    var t = text.toLowerCase();
    var reg = state.reg;

    function platByNum(n) {
      var s = String(n).replace(/\D/g, '');
      return reg.platforms.filter(function (p) { return p.num === s || p.id === 'p' + s; })[0];
    }
    function findByName(q) {
      q = q.toLowerCase();
      var hits = [];
      reg.platforms.forEach(function (p) {
        p.links.forEach(function (l) {
          if ((l.title || '').toLowerCase().indexOf(q) > -1) hits.push({ p: p, l: l });
        });
      });
      return hits;
    }

    /* SENARAI */
    if (/senarai|list|tunjuk semua|semua pautan/.test(t)) {
      var m = t.match(/platform\s*(\d)/);
      if (m) {
        var p = platByNum(m[1]);
        if (!p) return 'Platform ' + m[1] + ' tidak dijumpai.';
        return '<b>' + esc(p.title) + '</b><br>' + p.links.slice().sort(function (a, b) { return a.order - b.order; })
          .map(function (l, i) { return (i + 1) + '. ' + esc(l.title) + (l.visible === false ? ' <i>(disembunyi)</i>' : ''); }).join('<br>');
      }
      return '<b>Ringkasan Platform Master</b><br>' + reg.platforms.map(function (p) {
        return esc(p.num) + ' · ' + esc(p.title) + ' — ' + p.links.length + ' pautan';
      }).join('<br>') + '<br><br>Jumlah: <b>' + allLinks(reg).length + '</b> pautan.';
    }

    /* JUMLAH */
    if (/berapa|jumlah|count/.test(t)) {
      return 'Platform Master kini mengandungi <b>' + reg.platforms.length + '</b> platform dan <b>' +
        allLinks(reg).length + '</b> pautan (' +
        allLinks(reg).filter(function (x) { return x.l.visible !== false; }).length + ' aktif).';
    }

    /* CARI */
    if (/^cari|search/.test(t)) {
      var q = t.replace(/^(cari|search)\s*/, '').trim();
      if (!q) return 'Nyatakan kata kunci. Contoh: <b>cari kajian</b>';
      var hits = findByName(q);
      if (!hits.length) return 'Tiada pautan sepadan dengan "' + esc(q) + '".';
      return 'Dijumpai <b>' + hits.length + '</b> pautan:<br>' + hits.map(function (h) {
        return '• ' + esc(h.l.title) + ' <i>(' + esc(h.p.num) + ')</i>';
      }).join('<br>');
    }

    /* BUANG */
    var mb = t.match(/^(buang|hapus|delete|remove)\s+(?:pautan\s+)?["']?(.+?)["']?$/);
    if (mb) {
      var name = mb[2].trim();
      var hit = findByName(name);
      if (!hit.length) return 'Tiada pautan sepadan dengan "' + esc(name) + '".';
      if (hit.length > 1) return 'Ada ' + hit.length + ' padanan — nyatakan lebih tepat:<br>' +
        hit.map(function (h) { return '• ' + esc(h.l.title); }).join('<br>');
      var x = hit[0];
      x.p.links = x.p.links.filter(function (l) { return l.id !== x.l.id; });
      await Store.save();
      return 'Dibuang: <b>' + esc(x.l.title) + '</b> daripada platform ' + esc(x.p.num) + '.';
    }

    /* SEMBUNYI / TUNJUK */
    var ms = t.match(/^(sembunyi|hide|tunjuk|show)\s+(?:pautan\s+)?["']?(.+?)["']?$/);
    if (ms) {
      var on = /^(tunjuk|show)/.test(ms[1]);
      var h2 = findByName(ms[2].trim());
      if (!h2.length) return 'Tiada pautan sepadan dengan "' + esc(ms[2]) + '".';
      h2.forEach(function (h) { h.l.visible = on; });
      await Store.save();
      return (on ? 'Ditunjuk: ' : 'Disembunyikan: ') + '<b>' + esc(h2[0].l.title) + '</b>' +
        (h2.length > 1 ? ' (+' + (h2.length - 1) + ' lagi)' : '');
    }

    /* SUSUN */
    if (/susun|sort|atur/.test(t)) {
      var mp = t.match(/platform\s*(\d)/);
      var targets = mp ? [platByNum(mp[1])].filter(Boolean) : reg.platforms;
      if (!targets.length) return 'Platform tidak dijumpai.';
      targets.forEach(function (p) {
        p.links.sort(function (a, b) { return (a.title || '').localeCompare(b.title || '', 'ms'); });
        p.links.forEach(function (l, i) { l.order = i + 1; });
      });
      await Store.save();
      return 'Disusun ikut abjad: <b>' + targets.map(function (p) { return esc(p.num); }).join(', ') + '</b>.';
    }

    /* TAMBAH */
    var mu = text.match(/https?:\/\/[^\s"'<>]+|works\/[^\s"'<>]+|[\w-]+\.html/);
    if (/tambah|add|tambah pautan|letak/.test(t)) {
      var mt = text.match(/["“]([^"”]+)["”]/);
      if (!mt) return 'Nyatakan tajuk dalam tanda petikan. Contoh:<br><b>tambah pautan "Dashboard Baharu" works/x.html ke platform 2</b>';
      var title = mt[1];
      if (!mu) return 'Sertakan pautan (URL atau laluan seperti <b>works/x.html</b>).';
      var url = mu[0];
      var mp2 = t.match(/platform\s*(\d)/);
      var target = mp2 ? platByNum(mp2[1]) : reg.platforms[0];
      if (!target) return 'Platform tidak dijumpai.';
      target.links.push({
        id: uid(target.id), title: title, desc: '', url: url, icon: '◆',
        badge: 'Baharu', badgeType: 'new', tags: [], visible: true, order: target.links.length + 1
      });
      await Store.save();
      return 'Ditambah: <b>' + esc(title) + '</b> → platform ' + esc(target.num) + ' (' + esc(url) + ').';
    }

    return 'Saya belum faham perintah itu. Cuba:<br>' +
      '• <b>senarai semua pautan</b><br>' +
      '• <b>tambah pautan "Tajuk" works/fail.html ke platform 2</b><br>' +
      '• <b>buang pautan Nexus Office</b><br>' +
      '• <b>sembunyi Islamic Legends</b><br>' +
      '• <b>susun semula ikut abjad</b>';
  }

  /* ---- ejen awan: model bahasa ---- */

  async function agentCloud(text) {
    var sys =
      'Anda ialah ejen pengurus Platform Master. Tugas anda menukar arahan pengguna (Bahasa Melayu) ' +
      'kepada tindakan JSON pada registry pautan.\n\n' +
      'Registry semasa:\n' + JSON.stringify(state.reg) + '\n\n' +
      'Balas HANYA JSON dengan bentuk:\n' +
      '{"reply":"jawapan ringkas untuk pengguna","ops":[{"op":"add|remove|update|move|sort","platform":"p1","id":"","title":"","url":"","desc":"","icon":"","tags":[],"visible":true,"order":0}]}\n' +
      'Jika tiada tindakan diperlukan, pulangkan ops sebagai tatasusunan kosong.';

    var res = await state.cloud.llm.chat.completions.create({
      model: 'default',
      messages: [{ role: 'system', content: sys }, { role: 'user', content: text }]
    });
    var raw = (res && res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content) || '';
    var parsed;
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '').trim());
    } catch (e) {
      return esc(raw || 'Tiada jawapan.');
    }

    (parsed.ops || []).forEach(function (o) {
      var p = state.reg.platforms.filter(function (x) { return x.id === o.platform || x.num === String(o.platform).replace(/\D/g, ''); })[0];
      if (!p) return;
      if (o.op === 'add') {
        p.links.push({
          id: uid(p.id), title: o.title || 'Pautan baharu', desc: o.desc || '', url: o.url || '#',
          icon: o.icon || '◆', badge: 'Baharu', badgeType: 'new', tags: o.tags || [],
          visible: true, order: p.links.length + 1
        });
      } else if (o.op === 'remove' && o.id) {
        p.links = p.links.filter(function (l) { return l.id !== o.id; });
      } else if (o.op === 'update' && o.id) {
        p.links.forEach(function (l) {
          if (l.id === o.id) {
            ['title', 'desc', 'url', 'icon', 'visible', 'order'].forEach(function (k) {
              if (o[k] !== undefined && o[k] !== '') l[k] = o[k];
            });
            if (o.tags) l.tags = o.tags;
          }
        });
      } else if (o.op === 'sort') {
        p.links.sort(function (a, b) { return (a.title || '').localeCompare(b.title || '', 'ms'); });
        p.links.forEach(function (l, i) { l.order = i + 1; });
      }
    });

    await Store.save();
    return esc(parsed.reply || 'Selesai.');
  }

  /* ══════════════ BOOT ══════════════ */

  document.addEventListener('DOMContentLoaded', async function () {
    await Store.init();
    if (!state.reg) return;
    render();

    $('#btnAdmin').addEventListener('click', function () { renderAdmin(); openDrawer('#drawerAdmin'); });
    $('#btnAgent').addEventListener('click', function () { renderAgent(); openDrawer('#drawerAgent'); });
    $('#scrim').addEventListener('click', closeDrawers);
    $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeDrawers); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawers(); });
  });
})();

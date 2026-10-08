/* ============================================================
   store.js — Simpanan kemajuan murid (localStorage)
   ============================================================ */
(function (global) {
  "use strict";

  var KEY = "il_legends_v1";
  var today = function () {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };

  function seed(n) { return Math.floor(Math.random() * n); }

  var DEFAULT = {
    name: "Ilmu",
    gems: 0,
    spent: 0,
    earned: 0,
    streak: 0,
    bestStreak: 0,
    lastDay: null,
    done: {},          // "worldId:unitId:actIndex": true
    badges: {},        // worldId: true
    owned: [],         // item id
    equipped: [],      // item id
    sound: true,
    jawiDisplay: false,
    parentOpenAll: false,
    counters: { activities: 0, correct: 0, units: 0, story: 0, memorize: 0, jawi: 0, gems: 0 },
    daily: null,       // {date, ids:[], claimed:[]}
    week: {},          // "YYYY-MM-DD": activities count
    created: today()
  };

  var state = load();

  function load() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT));
      var s = JSON.parse(raw);
      for (var k in DEFAULT) if (!(k in s)) s[k] = JSON.parse(JSON.stringify(DEFAULT[k]));
      return s;
    } catch (e) { return JSON.parse(JSON.stringify(DEFAULT)); }
  }

  function save() {
    try { global.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- helpers ---------- */
  function akey(w, u, i) { return w + ":" + u + ":" + i; }
  function isDone(w, u, i) { return !!state.done[akey(w, u, i)]; }
  function markDone(w, u, i) {
    var k = akey(w, u, i);
    if (state.done[k]) return false;
    state.done[k] = true;
    state.counters.activities = (state.counters.activities || 0) + 1;
    state.week[today()] = (state.week[today()] || 0) + 1;
    save();
    return true;
  }

  function unitInfo(world, unit) {
    var total = unit.activities.length, done = 0;
    for (var i = 0; i < total; i++) if (isDone(world.id, unit.id, i)) done++;
    return { total: total, done: done, pct: total ? done / total : 0, complete: done === total };
  }

  function worldInfo(world) {
    var total = 0, done = 0, unitsDone = 0;
    world.units.forEach(function (u) {
      var ui = unitInfo(world, u);
      total += ui.total; done += ui.done;
      if (ui.complete) unitsDone++;
    });
    return {
      total: total, done: done, units: world.units.length, unitsDone: unitsDone,
      pct: total ? done / total : 0, complete: total > 0 && done === total
    };
  }

  function levelName(pct) {
    if (pct >= 0.999) return "Legenda";
    if (pct >= 0.5) return "Pahlawan";
    return "Penjelajah";
  }

  /* ---------- ganjaran ---------- */
  function addGems(n) {
    state.gems += n;
    state.earned += n;
    state.counters.gems = (state.counters.gems || 0) + n;
    save();
  }
  function spendGems(n) {
    if (state.gems < n) return false;
    state.gems -= n; state.spent += n; save(); return true;
  }

  /* ---------- streak ---------- */
  function touchDay() {
    var t = today();
    if (state.lastDay === t) return { isNew: false, streak: state.streak };
    var y = new Date(); y.setDate(y.getDate() - 1);
    var ys = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0");
    var isNew = true;
    if (state.lastDay === ys) state.streak += 1;
    else state.streak = 1;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    state.lastDay = t;
    save();
    return { isNew: isNew, streak: state.streak };
  }

  /* ---------- misi harian ---------- */
  function dailyState() {
    var t = today();
    if (!state.daily || state.daily.date !== t) {
      var pool = global.IL.DAILY.slice();
      // pilih 3 misi mengikut tarikh supaya konsisten sepanjang hari
      var dnum = parseInt(t.replace(/-/g, ""), 10);
      var ids = [];
      for (var i = 0; i < 3 && pool.length; i++) {
        ids.push(pool[(dnum + i * 7) % pool.length].id);
      }
      // pastikan unik
      ids = ids.filter(function (v, i, a) { return a.indexOf(v) === i; });
      while (ids.length < 3) {
        var cand = pool[(ids.length * 3 + dnum) % pool.length].id;
        if (ids.indexOf(cand) < 0) ids.push(cand); else break;
      }
      state.daily = { date: t, ids: ids, claimed: [] };
      state.counters = { activities: 0, correct: 0, units: 0, story: 0, memorize: 0, jawi: 0, gems: 0 };
      save();
    }
    return state.daily;
  }

  function dailyList() {
    var ds = dailyState();
    return ds.ids.map(function (id) {
      var m = global.IL.DAILY.filter(function (x) { return x.id === id; })[0];
      if (!m) return null;
      var got = state.counters[m.metric] || 0;
      var done = got >= m.target || ds.claimed.indexOf(id) >= 0;
      return { id: id, label: m.label, target: m.target, got: Math.min(got, m.target), done: done, reward: m.reward, claimed: ds.claimed.indexOf(id) >= 0 };
    }).filter(Boolean);
  }

  function claimDaily(id) {
    var ds = dailyState();
    if (ds.claimed.indexOf(id) >= 0) return 0;
    var m = global.IL.DAILY.filter(function (x) { return x.id === id; })[0];
    if (!m) return 0;
    if ((state.counters[m.metric] || 0) < m.target) return 0;
    ds.claimed.push(id);
    addGems(m.reward);
    save();
    return m.reward;
  }

  function bump(metric, n) {
    state.counters[metric] = (state.counters[metric] || 0) + (n || 1);
    save();
  }

  /* ---------- lencana ---------- */
  function checkBadge(world) {
    var wi = worldInfo(world);
    if (wi.complete && !state.badges[world.id]) {
      state.badges[world.id] = true;
      addGems(50);
      save();
      return true;
    }
    return false;
  }

  /* ---------- aksesori ---------- */
  function buy(itemId) {
    var item = global.IL.SHOP.filter(function (s) { return s.id === itemId; })[0];
    if (!item) return false;
    if (state.owned.indexOf(itemId) >= 0) return false;
    if (!spendGems(item.cost)) return false;
    state.owned.push(itemId);
    save();
    return true;
  }
  function toggleEquip(itemId) {
    var i = state.equipped.indexOf(itemId);
    if (i >= 0) state.equipped.splice(i, 1);
    else state.equipped.push(itemId);
    save();
    return state.equipped.indexOf(itemId) >= 0;
  }

  /* ---------- buka kunci dunia ---------- */
  function worldUnlocked(worlds, idx) {
    if (idx === 0 || state.parentOpenAll) return true;
    var prev = worlds[idx - 1];
    var wi = worldInfo(prev);
    return wi.unitsDone >= 1;
  }

  function reset() {
    state = JSON.parse(JSON.stringify(DEFAULT));
    state.created = today();
    save();
  }

  global.Store = {
    get state() { return state; },
    save: save,
    today: today,
    isDone: isDone,
    markDone: markDone,
    unitInfo: unitInfo,
    worldInfo: worldInfo,
    levelName: levelName,
    addGems: addGems,
    spendGems: spendGems,
    touchDay: touchDay,
    dailyList: dailyList,
    claimDaily: claimDaily,
    bump: bump,
    checkBadge: checkBadge,
    buy: buy,
    toggleEquip: toggleEquip,
    worldUnlocked: worldUnlocked,
    reset: reset
  };
})(window);

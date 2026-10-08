/* ============================================================
   audio.js — Kesan bunyi (Web Audio API) + suara arahan (Speech)
   Tiada fail luaran diperlukan: semua bunyi dijana secara sintesis.
   ============================================================ */
(function (global) {
  "use strict";

  var ctx = null;
  var enabled = true;

  function ac() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol, glideTo) {
    var c = ac(); if (!c || !enabled) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, c.currentTime + start);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + start + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.05);
  }

  function noise(dur, vol, filterHz) {
    var c = ac(); if (!c || !enabled) return;
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = filterHz || 900;
    var g = c.createGain(); g.gain.value = vol || 0.08;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start();
  }

  var SFX = {
    click: function () { tone(660, 0, 0.09, "triangle", 0.12); },
    tap: function () { tone(520, 0, 0.07, "sine", 0.10); },
    correct: function () { tone(660, 0, 0.12, "triangle", 0.16); tone(880, 0.10, 0.14, "triangle", 0.15); tone(1180, 0.20, 0.22, "sine", 0.13); },
    wrong: function () { tone(220, 0, 0.20, "sawtooth", 0.10, 120); noise(0.14, 0.05, 400); },
    reward: function () {
      [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, i * 0.07, 0.30, "triangle", 0.14); });
    },
    levelup: function () {
      [392, 523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, i * 0.09, 0.45, "sine", 0.15); });
    },
    page: function () { noise(0.18, 0.05, 1600); },
    badge: function () { tone(880, 0, 0.18, "sine", 0.14); tone(1320, 0.14, 0.35, "sine", 0.12); },
    streak: function () { tone(700, 0, 0.12, "square", 0.10); tone(1000, 0.10, 0.20, "square", 0.09); }
  };

  function play(name) {
    if (!enabled) return;
    var fn = SFX[name];
    if (fn) { try { fn(); } catch (e) { /* audio not available */ } }
  }

  /* ---------- suara arahan (Speech Synthesis) ---------- */
  var voiceReady = false;
  var malayVoice = null;
  function pickVoice() {
    if (voiceReady) return malayVoice;
    voiceReady = true;
    if (!("speechSynthesis" in global)) return null;
    var vs = global.speechSynthesis.getVoices() || [];
    for (var i = 0; i < vs.length; i++) {
      var l = (vs[i].lang || "").toLowerCase();
      if (l.indexOf("ms") === 0 || l.indexOf("id") === 0 || l.indexOf("zlm") === 0) { malayVoice = vs[i]; break; }
    }
    return malayVoice;
  }
  if ("speechSynthesis" in global) global.speechSynthesis.onvoiceschanged = pickVoice;

  function say(text, opts) {
    if (!enabled || !("speechSynthesis" in global)) return false;
    opts = opts || {};
    try {
      global.speechSynthesis.cancel();
      var u = new global.SpeechSynthesisUtterance(String(text).replace(/[‘’]/g, "'"));
      var v = pickVoice();
      if (opts.lang === "ar") {
        u.lang = "ar-SA";
        v = null;
        var vs = global.speechSynthesis.getVoices() || [];
        for (var i = 0; i < vs.length; i++) { if ((vs[i].lang || "").toLowerCase().indexOf("ar") === 0) { u.voice = vs[i]; v = vs[i]; break; } }
      } else {
        u.lang = (v && v.lang) || "ms-MY";
        if (v) u.voice = v;
      }
      u.rate = opts.rate || 0.92;
      u.pitch = opts.pitch || 1.05;
      global.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function stop() { if ("speechSynthesis" in global) { try { global.speechSynthesis.cancel(); } catch (e) {} } }

  global.Sound = {
    play: play,
    say: say,
    stop: stop,
    setEnabled: function (v) { enabled = !!v; if (!enabled) stop(); },
    isEnabled: function () { return enabled; },
    unlock: function () { ac(); pickVoice(); }
  };
})(window);

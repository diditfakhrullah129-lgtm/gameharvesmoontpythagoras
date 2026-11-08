/* =========================================================
   SISTEM AUDIO TERPUSAT — memakai PP_AUDIO_CONFIG
   - Musik latar: HTMLAudioElement + crossfade (tidak pernah bertumpuk)
   - SFX: file bila tersedia, nada sintetis Web Audio bila tidak
   - Narasi / suara karakter: hanya diputar bila file tersedia
   - Pengaturan disimpan di LocalStorage
   ========================================================= */
(function () {
  const CFG = window.PP_AUDIO_CONFIG;
  const KEY = 'pp_audio_v1';
  const DEF = { master: true, musicOn: true, sfxOn: true, music: 0.6, sfx: 0.8, narr: 1.0 };

  const A = {
    cfg: CFG,
    set: Object.assign({}, DEF),
    status: {},            // id -> 'file' | 'synth' | 'none' | 'error'
    els: {},               // cache elemen audio BGM
    curId: null,           // trek BGM yang diminta
    userPaused: false,
    needGesture: false,
    ctx: null,
    narr: null, narrId: null,
    listeners: [],
    scene: null
  };

  /* ---------- penyimpanan ---------- */
  try { Object.assign(A.set, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  A.save = function () { try { localStorage.setItem(KEY, JSON.stringify(A.set)); } catch (e) {} };
  A.on = function (fn) { A.listeners.push(fn); };
  A.emit = function () { A.listeners.forEach(f => { try { f(); } catch (e) {} }); };

  /* ---------- status ketersediaan ---------- */
  Object.keys(CFG.tracks).forEach(id => {
    const t = CFG.tracks[id];
    A.status[id] = t.available ? 'file' : (t.synth ? 'synth' : 'none');
  });
  A.hasFile = id => A.status[id] === 'file';
  A.src = id => CFG.basePath + CFG.tracks[id].file;

  function chanVol(t) {
    const cat = CFG.categories[t.category] || { channel: 'sfx', gain: 1 };
    const ch = A.set[cat.channel === 'music' ? 'music' : cat.channel === 'narration' ? 'narr' : 'sfx'];
    return Math.min(1, (t.volume == null ? 1 : t.volume) * cat.gain * ch);
  }

  /* ---------- MUSIK LATAR ---------- */
  function getEl(id) {
    if (A.els[id]) return A.els[id];
    const t = CFG.tracks[id];
    const el = new Audio();
    el.preload = 'auto';
    el.loop = t.loop !== false;
    el.volume = 0;
    el.addEventListener('error', () => {
      A.status[id] = t.synth ? 'synth' : 'error';
      if (A.curId === id) { A.curId = null; }
      A.emit();
    });
    el.src = A.src(id);
    A.els[id] = el;
    return el;
  }
  function fade(el, to, ms, done) {
    clearInterval(el._fx);
    const from = el.volume, t0 = performance.now();
    if (ms <= 0) { el.volume = to; done && done(); return; }
    el._fx = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) { clearInterval(el._fx); done && done(); }
    }, 40);
  }
  A.duck = 1;
  function musicTarget(id) {
    const t = CFG.tracks[id];
    const sg = (CFG.sceneGain && A.scene && CFG.sceneGain[A.scene]) || 1;
    return chanVol(t) * sg * A.duck * (A.sfxDuck == null ? 1 : A.sfxDuck);
  }
  function wanted() { return A.set.master && A.set.musicOn && !A.userPaused; }

  A.playBgm = function (id) {
    A.curId = id;
    Object.keys(A.els).forEach(k => {
      if (k !== id) { const o = A.els[k]; fade(o, 0, 600, () => { if (A.curId !== k) o.pause(); }); }
    });
    if (!id || !A.hasFile(id)) { A.emit(); return; }
    if (!wanted()) { A.emit(); return; }
    const el = getEl(id);
    const p = el.play();
    if (p && p.catch) p.catch(() => { A.needGesture = true; });
    fade(el, musicTarget(id), 900);
    A.emit();
  };
  A.stopBgm = function () { A.playBgm(null); };

  A.scene_ = function (sceneKey) {
    A.scene = sceneKey;
    const id = CFG.sceneMusic[sceneKey];
    if (id === A.curId && A.els[id] && !A.els[id].paused) { fade(A.els[id], musicTarget(id), 400); return; }
    A.playBgm(id || null);
  };

  A.applyVolumes = function () {
    Object.keys(A.els).forEach(k => {
      const el = A.els[k];
      if (k === A.curId && wanted()) { clearInterval(el._fx); el.volume = musicTarget(k); }
    });
    if (A.narr) A.narr.volume = A.set.master ? chanVol(CFG.tracks[A.narrId]) : 0;
  };

  A.toggleMusic = function () {       // tombol Play/Pause musik
    A.userPaused = !A.userPaused;
    if (A.userPaused) { Object.values(A.els).forEach(el => { fade(el, 0, 250, () => el.pause()); }); }
    else if (A.curId) A.playBgm(A.curId);
    A.emit();
  };
  A.setMaster = function (on) {
    A.set.master = on; A.save();
    if (!on) { Object.values(A.els).forEach(el => { fade(el, 0, 200, () => el.pause()); }); A.stopNarration(); }
    else if (A.curId) A.playBgm(A.curId);
    A.emit();
  };
  A.setSfx = function (on) { A.set.sfxOn = on; A.save(); A.emit(); };
  A.setVol = function (ch, v) { A.set[ch] = v; A.save(); A.applyVolumes(); A.emit(); };
  A.isPlaying = function () {
    const el = A.curId && A.els[A.curId];
    return !!(el && !el.paused && wanted());
  };

  /* buka kunci autoplay pada interaksi pertama */
  A.unlock = function () {
    try {
      if (!A.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) A.ctx = new AC(); }
      if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
    } catch (e) {}
    if (A.curId && wanted()) {
      const el = A.els[A.curId];
      if (!el || el.paused) A.playBgm(A.curId);
    }
    A.needGesture = false;
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, () => A.unlock(), { passive: true }));
  document.addEventListener('visibilitychange', () => {
    Object.values(A.els).forEach(el => { if (document.hidden) el.pause(); });
    if (!document.hidden && A.curId && wanted()) A.playBgm(A.curId);
  });

  /* ---------- EFEK SUARA ---------- */
  function synth(kind, vol) {
    if (!A.ctx) { try { const AC = window.AudioContext || window.webkitAudioContext; if (AC) A.ctx = new AC(); } catch (e) {} }
    const ctx = A.ctx; if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const note = (f, t0, dur, type, g, f2) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, now + t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t0 + dur);
      const peak = (g || 0.25) * vol;
      gn.gain.setValueAtTime(0.0001, now + t0);
      gn.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), now + t0 + 0.01);
      gn.gain.exponentialRampToValueAtTime(0.0001, now + t0 + dur);
      o.connect(gn); gn.connect(ctx.destination);
      o.start(now + t0); o.stop(now + t0 + dur + 0.02);
    };
    const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, A4 = 440, D5 = 587.33;
    switch (kind) {
      case 'click':  note(760, 0, 0.05, 'square', 0.18); note(1100, 0.03, 0.05, 'square', 0.12); break;
      case 'tick':   note(900, 0, 0.04, 'triangle', 0.2); break;
      case 'page':   note(400, 0, 0.12, 'triangle', 0.2, 900); break;
      case 'select': note(C5, 0, 0.07, 'square', 0.2); note(G5, 0.07, 0.1, 'square', 0.2); break;
      case 'start':  [C5, E5, G5, C6].forEach((f, i) => note(f, i * 0.08, 0.12, 'square', 0.2)); break;
      case 'end':    [C6, G5, E5, C5].forEach((f, i) => note(f, i * 0.09, 0.14, 'triangle', 0.25)); break;
      case 'point':  note(988, 0, 0.06, 'square', 0.18); note(1319, 0.06, 0.12, 'square', 0.18); break;
      case 'correct':[C5, E5, G5].forEach((f, i) => note(f, i * 0.09, 0.14, 'square', 0.22)); note(C6, 0.28, 0.25, 'triangle', 0.25); break;
      case 'wrong':  note(220, 0, 0.18, 'sawtooth', 0.2, 150); note(150, 0.16, 0.25, 'sawtooth', 0.2, 90); break;
      case 'star':   note(1568, 0, 0.1, 'triangle', 0.25); note(2093, 0.08, 0.25, 'triangle', 0.22); break;
      case 'mission':[C5, E5, G5, C6, G5, C6].forEach((f, i) => note(f, i * 0.1, 0.16, 'square', 0.2)); break;
      case 'victory':[C5, C5, C5, G5, E5, G5, C6].forEach((f, i) => note(f, i * 0.14 + (i > 3 ? 0.1 : 0), i === 6 ? 0.7 : 0.18, 'square', 0.2));
                     [C5 / 2, G5 / 2].forEach((f, i) => note(f, 0.9 + i * 0.02, 0.6, 'triangle', 0.22)); break;
    }
  }
  /* Aturan efek suara:
     - debounce: suara yang sama tidak diulang dalam 90 ms (satu klik = satu suara)
     - prioritas: klik tidak dimainkan tepat setelah suara yang lebih penting
     - benar/salah tidak pernah bunyi bersamaan (yang lama dihentikan)
     - suara 'page' memotong suara klik yang baru saja berbunyi
     - misi/kemenangan menurunkan musik sebentar agar jelas terdengar */
  const PRI = { click: 1, tick: 1, quizSelect: 1, point: 1, page: 2, start: 2, end: 2, selectPos: 2, quizFinish: 2,
                correct: 3, wrong: 3, star: 3, unlock: 3, mission: 4, victory: 5 };
  const pool = {};              // id -> [Audio]
  const live = [];              // { ev, id, el, t }
  let lastEv = null, lastId = null, lastT = 0, lastPri = 0;

  function stopLive(filter) {
    for (let i = live.length - 1; i >= 0; i--) {
      if (filter(live[i])) {
        try { live[i].el.pause(); live[i].el.currentTime = 0; } catch (e) {}
        live.splice(i, 1);
      }
    }
  }
  function getSfxEl(id, t) {
    const list = pool[id] || (pool[id] = []);
    let el = list.find(e => e.paused || e.ended);
    if (!el && list.length < 3) {
      el = new Audio(A.src(id)); el.preload = 'auto';
      el.addEventListener('error', () => { A.status[id] = t.synth ? 'synth' : 'error'; A.emit(); });
      list.push(el);
    }
    return el;
  }
  A.preloadSfx = function () {
    Object.keys(CFG.tracks).forEach(id => {
      const t = CFG.tracks[id];
      if (t.available && CFG.categories[t.category] && CFG.categories[t.category].channel === 'sfx') {
        const list = pool[id] || (pool[id] = []);
        if (!list.length) { const el = new Audio(A.src(id)); el.preload = 'auto'; list.push(el); }
      }
    });
  };
  function dip(ms, level) {
    A.sfxDuck = level; A.applyVolumes();
    clearTimeout(A._dt); A._dt = setTimeout(() => { A.sfxDuck = 1; A.applyVolumes(); }, ms);
  }
  A.sfxDuck = 1;

  A.sfx = function (event) {
    if (!A.set.master || !A.set.sfxOn) return;
    const has = Object.prototype.hasOwnProperty.call(CFG.events, event);
    const id = has ? CFG.events[event] : event;
    if (!id) return;                         // peristiwa tanpa suara
    const t = CFG.tracks[id]; if (!t) return;
    const now = performance.now(), pri = PRI[event] || 2;
    if ((event === lastEv || id === lastId) && now - lastT < 90) return;                 // debounce
    if (pri === 1 && lastPri > 1 && now - lastT < 280) return;        // klik tak mengganggu suara penting
    if (event === 'correct') stopLive(l => l.ev === 'wrong');
    if (event === 'wrong') { if (live.some(l => l.ev === 'correct' && now - l.t < 400)) return; stopLive(l => l.ev === 'correct'); }
    if (pri >= 2 && pri < 4) stopLive(l => PRI[l.ev] === 1 && now - l.t < 250);   // potong klik
    if (pri >= 4) stopLive(l => PRI[l.ev] <= 3);                      // misi/kemenangan menang
    lastEv = event; lastId = id; lastT = now; lastPri = pri;
    const vol = Math.min(1, chanVol(t) * ((CFG.quiet && CFG.quiet[event]) || 1));
    if (A.status[id] === 'file') {
      try {
        const el = getSfxEl(id, t); if (!el) return;
        el.volume = vol; el.currentTime = 0;
        const rec = { ev: event, id, el, t: now };
        live.push(rec);
        el.onended = () => { const i = live.indexOf(rec); if (i >= 0) live.splice(i, 1); };
        const p = el.play(); if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    } else if (t.synth) {
      try { synth(t.synth, Math.min(1, vol * 1.1)); } catch (e) {}
    }
    if (event === 'victory') dip(5500, 0.25); else if (event === 'mission') dip(2500, 0.45);
  };

  /* ---------- NARASI & SUARA KARAKTER ---------- */
  A.narrationAvailable = id => !!CFG.tracks[id] && A.hasFile(id);
  A.playNarration = function (id) {
    if (!A.set.master || !A.narrationAvailable(id)) return false;
    A.stopNarration();
    const t = CFG.tracks[id];
    const a = new Audio(A.src(id)); a.volume = chanVol(t);
    a.addEventListener('ended', () => { A.narr = null; A.duck = 1; A.applyVolumes(); A.emit(); });
    a.addEventListener('error', () => { A.status[id] = 'error'; A.narr = null; A.duck = 1; A.applyVolumes(); A.emit(); });
    A.narr = a; A.narrId = id; A.duck = 0.3; A.applyVolumes();
    const p = a.play(); if (p && p.catch) p.catch(() => {});
    A.emit(); return true;
  };
  A.pauseNarration = function () { if (A.narr) { A.narr.pause(); A.duck = 1; A.applyVolumes(); A.emit(); } };
  A.resumeNarration = function () { if (A.narr) { A.duck = 0.3; A.applyVolumes(); A.narr.play().catch(() => {}); A.emit(); } };
  A.stopNarration = function () {
    if (A.narr) { A.narr.pause(); A.narr = null; }
    A.duck = 1; A.applyVolumes(); A.emit();
  };
  A.narrationState = function (id) {
    if (!A.narrationAvailable(id)) return 'missing';
    if (A.narr && A.narrId === id) return A.narr.paused ? 'paused' : 'playing';
    return 'idle';
  };
  A.voice = function (id) { return A.playNarration(id); };   // suara karakter: sama, hanya bila ada file

  A.preloadSfx();
  window.PPAudio = A;
})();

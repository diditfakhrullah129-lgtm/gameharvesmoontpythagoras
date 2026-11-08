/* =========================================================
   PENYIMPANAN & GAMIFIKASI (LocalStorage) — XP, level, bintang, lencana, progres
   ========================================================= */
(function () {
  const KEY = 'pp_save_v1';
  const XP_PER_LEVEL = 120;

  function fresh() {
    return {
      v: 1, name: '', kelas: '', avatar: 'boy', created: Date.now(),
      xp: 0, badges: {}, missions: {}, finish: false,
      games: { A: null, B: null, C: null, D: null },
      quiz: { best: null, last: null, attempts: 0, draft: null, timerMin: 15 },
      tally: { correct: 0, wrong: 0 },
      materiSeen: {}, explored: 0,
      reflection: null, videoUrls: {},
      coins: 20, owned: {}, wear: null, jw: {}, gems: 0
    };
  }
  const S = { data: fresh(), ok: true, listeners: [] };

  S.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); S.data = Object.assign(fresh(), d); S.data.quiz = Object.assign(fresh().quiz, d.quiz || {}); }
    } catch (e) { S.ok = false; S.data = fresh(); }
  };
  S.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(S.data)); S.ok = true; }
    catch (e) { S.ok = false; }
    S.listeners.forEach(f => f());
  };
  S.onChange = fn => S.listeners.push(fn);
  S.reset = function () { S.data = fresh(); try { localStorage.removeItem(KEY); } catch (e) {} S.save(); };

  /* ---------- XP / level ---------- */
  S.level = () => Math.floor(S.data.xp / XP_PER_LEVEL) + 1;
  S.xpInLevel = () => S.data.xp % XP_PER_LEVEL;
  S.XP_PER_LEVEL = XP_PER_LEVEL;
  S.addXP = function (n, silent) {
    const before = S.level();
    S.data.xp += Math.max(0, Math.round(n));
    S.save();
    if (S.level() > before) { PP.ui && PP.ui.toast('LEVEL UP! Sekarang level ' + S.level(), 'owl'); PPAudio.sfx('star'); }
    S.checkBadges();
    if (!silent) PPAudio.sfx('point');
  };

  /* ---------- bintang ---------- */
  S.missionStars = () => Object.values(S.data.missions).reduce((a, m) => a + (m.stars || 0), 0);
  S.gameStars = () => Object.values(S.data.games).reduce((a, g) => a + (g ? g.stars : 0), 0);
  S.quizStars = () => (S.data.quiz.best ? starsFor(S.data.quiz.best.score) : 0);
  S.totalStars = () => S.missionStars() + S.gameStars() + S.quizStars();
  S.maxStars = () => 6 * 3 + 4 * 3 + 3;
  function starsFor(score) { return score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0; }
  S.starsFor = starsFor;

  /* ---------- misi ---------- */
  S.missionDone = id => !!(S.data.missions[id] && S.data.missions[id].done);
  S.missionUnlocked = id => id === 1 || S.missionDone(id - 1);
  S.doneCount = () => PP.POS.filter(p => S.missionDone(p.id)).length;
  S.nextMission = () => { const p = PP.POS.find(p => !S.missionDone(p.id)); return p ? p.id : null; };
  S.completeMission = function (id, stars) {
    const first = !S.missionDone(id);
    const prev = S.data.missions[id] || { done: false, stars: 0, plays: 0 };
    prev.done = true; prev.stars = Math.max(prev.stars || 0, stars); prev.plays = (prev.plays || 0) + 1; prev.date = Date.now();
    S.data.missions[id] = prev;
    S.save();
    if (first) { S.addXP(50 + 10 * stars, true); S.award('m' + id); }
    return first;
  };

  /* ---------- game ---------- */
  // res: {score(0-100), correct, wrong}
  S.recordGame = function (gid, res) {
    const stars = starsFor(res.score);
    const g = S.data.games[gid] || { best: 0, stars: 0, plays: 0, correct: 0, wrong: 0, lastScore: 0 };
    g.plays++; g.lastScore = res.score; g.best = Math.max(g.best, res.score); g.stars = Math.max(g.stars, stars);
    g.correct += res.correct; g.wrong += res.wrong; g.date = Date.now();
    S.data.games[gid] = g;
    S.data.tally.correct += res.correct; S.data.tally.wrong += res.wrong;
    S.save();
    if (res.score >= 100) S.award('perfect');
    S.addXP(Math.round(res.score / 4), true);
    return stars;
  };
  S.tallyAnswer = function (ok) { ok ? S.data.tally.correct++ : S.data.tally.wrong++; };

  /* ---------- lencana ---------- */
  S.award = function (id) {
    if (S.data.badges[id]) return false;
    S.data.badges[id] = Date.now();
    S.save();
    const b = PP.BADGES.find(x => x.id === id);
    if (b && PP.ui) PP.ui.toast('Lencana baru: ' + b.name, 'star');
    S.data.xp += 20; S.save();
    return true;
  };
  S.checkBadges = function () {
    if (S.level() >= 5) S.award('lv5');
    if (PP.MATERI_IDS && PP.MATERI_IDS.every(i => S.data.materiSeen[i])) S.award('reader');
  };

  /* ---------- nilai ---------- */
  S.gameAvg = function () {
    const arr = ['A', 'B', 'C', 'D'].map(k => (S.data.games[k] ? S.data.games[k].best : null)).filter(v => v != null);
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  };
  S.finalScore = function () {
    const q = S.data.quiz.best ? S.data.quiz.best.score : 0;
    const g = ['A', 'B', 'C', 'D'].reduce((a, k) => a + (S.data.games[k] ? S.data.games[k].best : 0), 0) / 4;
    const m = S.doneCount() / 6 * 100;
    return Math.round(0.4 * q + 0.4 * g + 0.2 * m);
  };
  S.predikat = function (score) {
    if (score >= 90) return { t: 'Sangat Baik', d: 'Pythagoras Master! Pemahamanmu sangat kuat.' };
    if (score >= 80) return { t: 'Baik', d: 'Bagus sekali! Sedikit lagi menjadi master.' };
    if (score >= 70) return { t: 'Cukup', d: 'Sudah paham dasar-dasarnya. Terus berlatih.' };
    if (score >= 50) return { t: 'Perlu Berlatih', d: 'Ulangi materi dan game agar lebih mantap.' };
    return { t: 'Perlu Bimbingan', d: 'Jangan menyerah. Mulai lagi dari materi dan peta petualangan.' };
  };

  window.PPStore = S;
})();

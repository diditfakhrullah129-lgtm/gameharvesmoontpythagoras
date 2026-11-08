/* =========================================================
   MODE ONLINE — nama pemain, kode ruangan, papan peringkat bersama.
   Tiga "backend" dengan antarmuka yang sama (dipilih otomatis):
     1. artifact : database bawaan halaman artifact Claude (window.claude)
     2. firebase : Firebase Realtime Database lewat REST (tanpa SDK,
                   jalan di hosting apa pun: Firebase Hosting, Netlify,
                   GitHub Pages, sekolah.sch.id, dll)
     3. local    : cadangan di perangkat itu saja (tanpa internet)
   ========================================================= */
(function () {
  const PP = window.PP, S = PPStore;
  const KEY = 'pp_online_v1';
  const O = PP.online = {};

  /* ---------- identitas pemain (per perangkat) ---------- */
  const rid = n => { const c = 'abcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)]; return s; };
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  if (!st.pid) st.pid = rid(14);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  save();

  O.cleanName = s => String(s || '').replace(/[<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  O.cleanRoom = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  O.newCode = () => { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)]; return s; };
  O.state = () => ({ pid: st.pid, name: st.name || '', room: st.room || '' });
  O.joined = () => !!(st.name && st.room);

  /* ---------- backend ---------- */
  const fbUrl = ((window.PP_FIREBASE || {}).databaseURL || '').trim().replace(/\/+$/, '');
  const fbOk = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(fbUrl) || /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(firebaseio\.com|firebasedatabase\.app)$/i.test(fbUrl);

  const fbBackend = {
    id: 'firebase', label: 'Online · Firebase', online: true,
    async put(room, pid, data) {
      const r = await fetch(`${fbUrl}/rooms/${room}/players/${pid}.json`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error('Firebase menolak (' + r.status + '). Periksa Rules database.');
    },
    subscribe(room, cb) {
      let dead = false, timer = null;
      const tick = async () => {
        if (dead) return;
        if (!document.hidden) {
          try {
            const r = await fetch(`${fbUrl}/rooms/${room}/players.json`, { cache: 'no-store' });
            if (!r.ok) throw new Error('Firebase menolak (' + r.status + '). Periksa Rules database.');
            const j = await r.json() || {};
            if (!dead) cb(Object.keys(j).map(k => Object.assign({ id: k }, j[k])), null);
          } catch (e) { if (!dead) cb(null, e); }
        }
        if (!dead) timer = setTimeout(tick, 4000);
      };
      tick();
      return () => { dead = true; clearTimeout(timer); };
    }
  };

  const localBackend = {
    id: 'local', label: 'Mode lokal · hanya perangkat ini', online: false,
    k: room => 'pp_local_room_' + room,
    read(room) { try { const j = JSON.parse(localStorage.getItem(this.k(room))) || {}; return Object.keys(j).map(k => Object.assign({ id: k }, j[k])); } catch (e) { return []; } },
    async put(room, pid, data) {
      let j = {}; try { j = JSON.parse(localStorage.getItem(this.k(room))) || {}; } catch (e) {}
      j[pid] = data; localStorage.setItem(this.k(room), JSON.stringify(j));
    },
    subscribe(room, cb) {
      const f = () => cb(this.read(room), null); f();
      const t = setInterval(f, 2000);
      return () => clearInterval(t);
    }
  };

  let artifactDb = null;
  const artifactBackend = {
    id: 'artifact', label: 'Online · Database bersama', online: true,
    path: room => `rooms/${room}/players`,
    async put(room, pid, data) { await artifactDb.collection(this.path(room)).doc(pid).set(data); },
    subscribe(room, cb) {
      try {
        return artifactDb.collection(this.path(room)).onSnapshot(
          snap => cb(snap.docs.map(d => Object.assign({ id: d.id }, d.data())), null),
          err => cb(null, new Error(err && err.message || 'Database tidak dapat dibaca')));
      } catch (e) { cb(null, e); return () => {}; }
    }
  };

  let bePromise = null, be = null;
  O.backend = () => bePromise || (bePromise = (async () => {
    try {
      if (window.claude && typeof window.claude.use === 'function') {
        const db = await Promise.race([window.claude.use('db'), new Promise(r => setTimeout(() => r(null), 4000))]);
        if (db) { artifactDb = db; return (be = artifactBackend); }
      }
    } catch (e) { /* lanjut ke cadangan */ }
    if (fbOk) return (be = fbBackend);
    return (be = localBackend);
  })());

  /* ---------- data & peringkat ---------- */
  O.payload = () => {
    const d = S.data, b = d.quiz && d.quiz.best;
    return {
      name: st.name, score: b ? b.score : 0, quiz: b ? 1 : 0, correct: b ? b.correct : 0,
      missions: S.doneCount(), stars: S.totalStars(), xp: d.xp || 0, ts: Date.now()
    };
  };
  O.rank = list => list.filter(p => p && typeof p.name === 'string').map(p => ({
    id: p.id, name: O.cleanName(p.name) || 'Pemain', score: +p.score || 0, quiz: p.quiz ? 1 : (+p.score > 0 ? 1 : 0), correct: +p.correct || 0,
    missions: +p.missions || 0, stars: +p.stars || 0, xp: +p.xp || 0, ts: +p.ts || 0
  })).sort((a, b) => b.score - a.score || b.missions - a.missions || b.xp - a.xp || a.ts - b.ts);

  let lastSig = '', pending = false, status = { ok: null, msg: '' }, timer = null;
  const sigOf = p => [p.name, p.score, p.correct, p.missions, p.stars, p.xp].join('|');
  O.status = () => status;

  O.submit = async function (force) {
    if (!O.joined()) return { ok: false, msg: 'Belum masuk ruangan' };
    const p = O.payload(), sig = sigOf(p);
    if (!force && sig === lastSig && !pending) return status;
    try {
      const b = await O.backend();
      await b.put(st.room, st.pid, p);
      lastSig = sig; pending = false;
      status = { ok: true, msg: 'Skor tersimpan di ruangan ' + st.room, backend: b.id };
    } catch (e) {
      pending = true; status = { ok: false, msg: (e && e.message) || 'Gagal menyimpan skor' };
    }
    return status;
  };
  /* simpan otomatis tiap progres berubah (kuis, misi, XP) */
  S.onChange(() => { if (!O.joined()) return; clearTimeout(timer); timer = setTimeout(() => O.submit(), 1200); });
  setInterval(() => { if (pending && O.joined()) O.submit(true); }, 8000);

  O.join = async function (name, room) {
    name = O.cleanName(name); room = O.cleanRoom(room);
    if (name.length < 2) return { ok: false, msg: 'Tulis namamu dulu (minimal 2 huruf).' };
    if (room.length < 4) return { ok: false, msg: 'Kode ruangan 4–8 huruf/angka.' };
    st.name = name; st.room = room; save(); lastSig = '';
    if (!S.data.name) { S.data.name = name; S.save(); }
    const r = await O.submit(true);
    return Object.assign({ ok: true }, r.ok === false ? { warn: r.msg } : {});
  };
  O.leave = () => { st.room = ''; save(); lastSig = ''; };

  /* ---------- LAYAR: online ---------- */
  const esc = s => PP.esc(String(s));
  const MEDAL = ['🥇', '🥈', '🥉'];

  function setupHtml(msg, backendLabel) {
    const nm = esc(st.name || S.data.name || ''), rm = esc(st.room || '');
    return `<div class="wrap nofit onl">
      <div class="onl-card onl-setup">
        <div class="onl-owl">${PP.img('owl_0', 'bob', 'Hoo-Pytha')}</div>
        <h2>🌐 Main Bersama</h2>
        <p class="onl-sub">Masukkan namamu dan kode ruangan dari gurumu. Skor kuismu akan muncul di papan peringkat bersama.</p>
        <label class="onl-f"><span>Nama pemain</span><input id="olName" maxlength="20" autocomplete="nickname" placeholder="Contoh: Aisyah" value="${nm}"></label>
        <label class="onl-f"><span>Kode ruangan</span><div class="onl-code"><input id="olRoom" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="Contoh: 8A2026" value="${rm}"><button class="btn sm" data-act="onl-new" type="button" title="Buat kode baru">🎲 Buat</button></div></label>
        <p class="onl-err" id="olErr">${msg ? esc(msg) : ''}</p>
        <div class="row center"><button class="btn green" id="olGo" data-act="onl-join">MASUK RUANGAN</button><button class="btn" data-go="menu">Kembali</button></div>
        <span class="pill onl-be" id="olBe">${backendLabel || 'Memeriksa koneksi…'}</span>
      </div></div>`;
  }

  function boardHtml() {
    return `<div class="wrap nofit onl">
      <div class="onl-card onl-board">
        <div class="onl-head">
          <div class="onl-ttl"><h2>🏆 Papan Peringkat</h2>
            <div class="onl-meta"><span class="pill">Ruangan <b id="olRoomCode">${esc(st.room)}</b></span><span class="pill onl-be" id="olBe">Menghubungkan…</span></div></div>
          <div class="onl-btns"><button class="btn sm blue" data-act="onl-copy">📋 Salin</button><button class="btn sm" data-act="onl-leave">Ganti</button></div>
        </div>
        <div class="onl-me" id="olMe">Memuat peringkat…</div>
        <ol class="onl-list" id="olList"></ol>
        <div class="onl-foot"><div class="onl-pg"><button class="btn sm" data-act="onl-prev" aria-label="Sebelumnya">◀</button><span id="olPg">1/1</span><button class="btn sm" data-act="onl-next" aria-label="Berikutnya">▶</button></div>
          <div class="row center"><button class="btn green sm" data-go="kuis">Kerjakan Kuis</button><button class="btn sm" data-go="menu">Menu</button></div></div>
      </div></div>`;
  }

  let ui = null; // state layar papan skor
  PP.screens.online = function () {
    const joined = O.joined();
    ui = { page: 0, rows: [], unsub: null, dead: false, err: null };
    return {
      html: joined ? boardHtml() : setupHtml(),
      async mount(root) {
        if (!O.joined()) {
          const b = await O.backend(); const el = PP.$('#olBe'); if (el) { el.textContent = b.label; el.classList.toggle('ok', b.online); }
          return;
        }
        const b = await O.backend(); if (ui.dead) return;
        const be = PP.$('#olBe'); if (be) { be.textContent = b.label; be.classList.toggle('ok', b.online); }
        O.submit(true);
        ui.unsub = b.subscribe(st.room, (list, err) => { if (ui.dead) return; ui.err = err; if (list) ui.rows = O.rank(list); paint(); });
        ui.rs = () => paint(); window.addEventListener('resize', ui.rs);
      },
      unmount() { ui.dead = true; ui.unsub && ui.unsub(); ui.rs && window.removeEventListener('resize', ui.rs); }
    };
  };

  function pageSize() {
    const l = PP.$('#olList'); if (!l) return 5;
    const rh = window.matchMedia('(max-height:520px)').matches ? 36 : 44; return Math.max(3, Math.floor((l.clientHeight + 6) / (rh + 6)));
  }
  function paint() {
    const l = PP.$('#olList'); if (!l || !ui) return;
    const rows = ui.rows, n = pageSize(), pages = Math.max(1, Math.ceil(rows.length / n));
    ui.page = Math.min(ui.page, pages - 1);
    const mine = rows.findIndex(r => r.id === st.pid);
    const me = PP.$('#olMe');
    if (ui.err) me.innerHTML = `<span class="bad">⚠ ${esc(ui.err.message)}</span>`;
    else if (!rows.length) me.textContent = 'Belum ada pemain. Ajak temanmu masuk dengan kode ' + st.room + '.';
    else if (mine >= 0) { const r = rows[mine]; me.innerHTML = `Kamu peringkat <b>#${mine + 1}</b> dari ${rows.length} pemain · ${r.quiz ? 'nilai kuis <b>' + r.score + '</b>' : 'belum mengerjakan kuis'}`; }
    else me.textContent = rows.length + ' pemain di ruangan ini.';
    const slice = rows.slice(ui.page * n, ui.page * n + n);
    l.innerHTML = slice.map((r, i) => {
      const g = ui.page * n + i;
      return `<li class="onl-row${r.id === st.pid ? ' me' : ''}"><span class="rk">${g < 3 && r.quiz ? MEDAL[g] : '#' + (g + 1)}</span><span class="nm">${esc(r.name)}${r.id === st.pid ? ' <i>(kamu)</i>' : ''}</span>
        <span class="sc"><b>${r.quiz ? r.score : '–'}</b><small>nilai</small></span><span class="ms"><b>${r.missions}/6</b><small>pos</small></span><span class="xp"><b>${r.xp}</b><small>XP</small></span></li>`;
    }).join('');
    PP.$('#olPg').textContent = (ui.page + 1) + '/' + pages;
  }

  /* ---------- aksi ---------- */
  PP.acts['onl-new'] = () => { const el = PP.$('#olRoom'); if (el) el.value = O.newCode(); };
  PP.acts['onl-join'] = async () => {
    const btn = PP.$('#olGo'); if (btn) btn.disabled = true;
    const r = await O.join(PP.$('#olName').value, PP.$('#olRoom').value);
    if (!r.ok) { const e = PP.$('#olErr'); if (e) e.textContent = r.msg; if (btn) btn.disabled = false; return; }
    PP.ui.toast(r.warn ? 'Masuk ruangan, tapi skor belum terkirim: ' + r.warn : 'Berhasil masuk ruangan ' + st.room, 'owl');
    PP.go('online'); /* render ulang sebagai papan peringkat */
  };
  PP.acts['onl-leave'] = () => { O.leave(); PP.go('online'); };
  PP.acts['onl-prev'] = () => { if (ui) { ui.page = Math.max(0, ui.page - 1); paint(); } };
  PP.acts['onl-next'] = () => { if (ui) { const n = pageSize(); ui.page = Math.min(Math.ceil(ui.rows.length / n) - 1, ui.page + 1); paint(); } };
  PP.acts['onl-copy'] = () => {
    const t = st.room, ok = () => PP.ui.toast('Kode ' + t + ' disalin. Bagikan ke teman sekelas!', 'owl');
    try { navigator.clipboard.writeText(t).then(ok, ok); } catch (e) { ok(); }
  };
})();

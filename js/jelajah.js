/* =========================================================
   JELAJAH DUNIA 3D — layar pilih dunia, dunia 3D, NPC + kuis, misi, koin, lemari gaya
   ========================================================= */
(function () {
  const PP = window.PP, S = PPStore, A = PPAudio, W3 = PP.W3;
  PP.screens = PP.screens || {};

  const NAMES = {
    1: ['Pak Guru Segi', 'Kak Tomi', 'Bu Sari', 'Penjaga Gerbang'],
    2: ['Ranger Dito', 'Kak Rina', 'Pak Joko', 'Ki Pemahat Batu'],
    3: ['Bu Wati', 'Pak Raja', 'Kak Dewi', 'Penasihat Persegi'],
    4: ['Pak Hasan', 'Kak Putra', 'Bu Lina', 'Sesepuh Lembah'],
    5: ['Kapten Budi', 'Kak Sinta', 'Pak Anto', 'Nahkoda Tali'],
    6: ['Ratu Matematika', 'Pak Patih', 'Kak Ayu', 'Penjaga Istana']
  };
  const WORLD = {
    1: { ico: '🌀', c: 'g1', tip: 'Segitiga siku-siku punya satu sudut 90°. Temukan tiga warga dan jawab pertanyaan mereka!' },
    2: { ico: '🌲', c: 'g2', tip: 'Sisi di depan sudut siku-siku adalah sisi miring (hipotenusa), sisi terpanjang.' },
    3: { ico: '🏰', c: 'g3', tip: 'Pada segitiga siku-siku 3-4-5: 9 + 16 = 25. Luas persegi di sisi miring = jumlah dua luas lainnya.' },
    4: { ico: '⛰️', c: 'g4', tip: 'Rumus Pythagoras: a² + b² = c², dengan c sisi miring.' },
    5: { ico: '🌉', c: 'g5', tip: 'Soal cerita: gambar segitiga siku-sikunya dulu, lalu tentukan mana sisi miringnya.' },
    6: { ico: '👑', c: 'g6', tip: 'Triple Pythagoras: 3-4-5, 5-12-13, 8-15-17. Kalikan untuk mendapat triple lainnya.' }
  };
  const QSET = { 1: () => PP.QUICK.quick1, 2: () => [0, 1, 2].map(i => PP.QUIZ[i]), 3: () => PP.QUICK.quick3, 4: () => [3, 4, 8].map(i => PP.QUIZ[i]), 5: () => [6, 9, 10].map(i => PP.QUIZ[i]), 6: () => [11, 12, 14].map(i => PP.QUIZ[i]) };
  const NPC_LOOKS = [
    { skin: '#e9b98f', shirt: '#e23b3b', pants: '#2d3a5a', hair: '#2a1d12', style: 'pendek', hat: 'none' },
    { skin: '#f6d3b3', shirt: '#22c55e', pants: '#4b5563', hair: '#7a3b1d', style: 'panjang', hat: 'none' },
    { skin: '#d19a6a', shirt: '#f5f5f5', pants: '#1f2937', hair: '#111111', style: 'pendek', hat: 'peci' },
    { skin: '#a8714a', shirt: '#8b5cf6', pants: '#3b2f5c', hair: '#f5f5f5', style: 'kerudung', hat: 'none' }
  ];

  /* ---------- lemari gaya ---------- */
  const WD = {
    shirt: { tab: 'Atasan', key: 'shirt', items: [['Koko', '#f3ead2', 0], ['Putih', '#f5f5f5', 0], ['Biru', '#3b82f6', 0], ['Merah', '#ef4444', 40], ['Hijau', '#22c55e', 40], ['Kuning', '#facc15', 60], ['Ungu', '#8b5cf6', 'L3'], ['Hitam', '#2d2d35', 'L5']] },
    pants: { tab: 'Bawahan', key: 'pants', items: [['Biru Tua', '#2d3a5a', 0], ['Hitam', '#1f2937', 0], ['Abu', '#6b7280', 0], ['Coklat', '#7a4a21', 30], ['Putih', '#e5e7eb', 30], ['Merah', '#b91c1c', 40], ['Hijau', '#15803d', 'L3']] },
    style: { tab: 'Rambut', key: 'style', items: [['Pendek', 'pendek', 0], ['Panjang', 'panjang', 0], ['Jambul', 'jambul', 0], ['Tanpa', 'botak', 0], ['Kerudung', 'kerudung', 0]] },
    hair: { tab: 'Warna Rambut', key: 'hair', items: [['Hitam', '#1a1a1a', 0], ['Coklat', '#5a3a1a', 0], ['Putih', '#f5f5f5', 0], ['Pirang', '#e6c35a', 40], ['Merah', '#c0392b', 40], ['Pink', '#ff7eb6', 40], ['Biru', '#3b82f6', 'L4']] },
    hat: { tab: 'Topi', key: 'hat', items: [['Tanpa', 'none', 0], ['Peci', 'peci', 0], ['Topi Merah', 'merah', 30], ['Topi Biru', 'biru', 30], ['Mahkota', 'mahkota', 'L5']] },
    skin: { tab: 'Kulit', key: 'skin', items: [['Cerah', '#f6d3b3', 0], ['Sawo Muda', '#e9b98f', 0], ['Sawo', '#d19a6a', 0], ['Coklat', '#a8714a', 0], ['Gelap', '#7a4b2d', 0]] }
  };
  const lookNow = () => Object.assign(W3.defaultLook(S.data.avatar), S.data.wear || {});
  const lock = it => (typeof it[2] === 'string' ? S.level() < +it[2].slice(1) : false);
  const owned = (g, it) => it[2] === 0 || S.data.owned[g + ':' + it[1]];
  const coins = () => S.data.coins || 0;
  const addCoins = n => { S.data.coins = coins() + n; S.save(); };

  function wardrobe(root, onClose, eng) {
    let tab = 'shirt';
    const el = document.createElement('div'); el.className = 'jwd'; root.appendChild(el);
    if (eng) { eng.cam.focus = true; eng.p.yaw = eng.cam.yaw; eng.p.vx = eng.p.vz = 0; }
    const draw = () => {
      const g = WD[tab], look = lookNow();
      el.innerHTML = `<div class="jwd-h"><b>👕 Lemari Gaya</b><span class="jpill">🪙 ${coins()}</span></div>
        <div class="jwd-tabs">${Object.keys(WD).map(k => `<button class="nosfx ${k === tab ? 'on' : ''}" data-t="${k}">${WD[k].tab}</button>`).join('')}</div>
        <div class="jwd-grid">${g.items.map((it, i) => {
          const cur = look[g.key] === it[1], lk = lock(it), ow = owned(tab, it), col = /^#/.test(it[1]);
          return `<button class="jwi nosfx ${cur ? 'on' : ''} ${lk ? 'lk' : ''}" data-i="${i}"><span class="sw" style="${col ? 'background:' + it[1] : ''}">${col ? '' : ({ pendek: '💇', panjang: '👩', jambul: '🧑', botak: '🥚', kerudung: '🧕', none: '∅', peci: '🎩', merah: '🧢', biru: '🧢', mahkota: '👑' }[it[1]] || '')}</span><em>${PP.esc(it[0])}</em>
            ${lk ? `<i class="jb">🔒 Lv${it[2].slice(1)}</i>` : !ow ? `<i class="jb">🪙${it[2]}</i>` : cur ? '<i class="jb ok">✔</i>' : ''}</button>`;
        }).join('')}</div>
        <div class="jwd-f"><small>Klik item untuk memakai</small><button class="jbtn green" id="wdOk">Selesai</button></div>`;
      el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; A.sfx('click'); draw(); });
      el.querySelectorAll('.jwi').forEach(b => b.onclick = () => {
        const it = g.items[+b.dataset.i];
        if (lock(it)) { A.sfx('wrong'); toast('Naik ke Level ' + it[2].slice(1) + ' untuk membuka item ini'); return; }
        if (!owned(tab, it)) { if (coins() < it[2]) { A.sfx('wrong'); toast('Koin belum cukup'); return; } S.data.coins -= it[2]; S.data.owned[tab + ':' + it[1]] = 1; A.sfx('star'); toast('Dibeli! −' + it[2] + ' koin'); }
        else A.sfx('click');
        S.data.wear = Object.assign({}, lookNow(), { [g.key]: it[1] }); S.save();
        if (eng) eng.look = lookNow();
        draw(); if (root._hud) root._hud();
      });
      el.querySelector('#wdOk').onclick = () => { el.remove(); if (eng) eng.cam.focus = false; onClose && onClose(); };
    };
    draw();
  }
  function toast(msg) {
    const box = PP.$('#jtoast') || PP.$('#toasts'); if (!box) return;
    const t = document.createElement('div'); t.className = 'jtoast'; t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2400); setTimeout(() => t.remove(), 2900);
  }

  /* ---------- layar: pilih dunia ---------- */
  PP.screens.dunia = function () {
    const cards = PP.POS.map(p => {
      const done = S.missionDone(p.id), open = S.missionUnlocked(p.id), w = WORLD[p.id];
      return `<article class="jcard ${w.c} ${open ? '' : 'lk'}">
        <div class="jc-ico">${w.ico}</div>
        <span class="jc-b ${done ? 'ok' : open ? '' : 'no'}">${done ? '✔ Selesai' : open ? '✔ Bisa dimainkan' : '🔒 Terkunci'}</span>
        <h3>${PP.esc(p.name)}</h3><p>${PP.esc(p.mission)}</p>
        <p class="jc-m">🏠 ${S.data.jw[p.id] ? (S.data.jw[p.id].ok || []).filter(Boolean).length : 0}/3 warga dibantu</p>
        <button class="jbtn white" data-go="jelajah-${p.id}" ${open ? '' : 'disabled'}>${open ? '▶ Masuk' : 'Selesaikan Dunia ' + (p.id - 1)}</button></article>`;
    }).join('');
    return { html: `<div class="wrap wide nofit jdunia"><div class="jd-top"><div><h2>🌍 Peta Dunia</h2><p>Jelajahi dunia 3D, bantu para warga menjawab soal Pythagoras.</p></div>
        <div class="jd-act"><span class="jpill">🪙 ${coins()}</span><button class="jbtn" data-act="wd-open">👕 Lemari Gaya</button><button class="jbtn" data-go="menu">☰ Menu</button></div></div>
        <div class="jd-grid">${cards}</div></div>` };
  };
  PP.acts['wd-open'] = () => {
    const root = PP.$('#app'); if (PP.$('.jwd', root)) return;
    wardrobe(root, () => PP.go('dunia'), null);
    root._hud = null;
  };

  /* ---------- layar: dunia 3D ---------- */
  PP.screens.jelajah = function (arg) {
    const id = Math.max(1, Math.min(6, parseInt(arg, 10) || 1));
    if (!S.missionUnlocked(id)) { setTimeout(() => PP.go('dunia'), 0); return { html: '<div class="jload">Dunia ini masih terkunci…</div>' }; }
    const pos = PP.POS[id - 1], qs = QSET[id](), names = NAMES[id];
    const st = (S.data.jw[id] = S.data.jw[id] || { ok: [0, 0, 0], first: [0, 0, 0] });
    st.ok = st.ok || [0, 0, 0]; st.first = st.first || [0, 0, 0];
    let eng = null, raf = 0, dead = false, gemCount = 0, dlgOpen = false, last = 0, lbEls = [], nmEls = [];
    const keys = {};

    const html = `<div class="jworld" id="jw">
      <canvas id="jc" aria-label="Dunia 3D ${PP.esc(pos.name)}"></canvas>
      <div id="jlabels"></div>
      <div class="jh-tl"><div class="jcard-me"><span class="jav" id="jAv"></span><div><b id="jName"></b><small id="jLv"></small><div class="jbar"><i id="jXp"></i></div></div></div>
        <div class="jmis"><small>🎯 MISI AKTIF</small><b>${PP.esc(pos.name)}</b><span>Bantu 3 warga menjawab soal (<em id="jMis">0</em>/3)</span><div class="jbar g"><i id="jMisBar"></i></div></div></div>
      <div class="jh-tr"><span class="jloc">📍 ${PP.esc(pos.name)}</span><span class="jpill" id="jCoin">🪙 0</span></div>
      <div class="jh-side"><button class="jsq" data-j="pause" aria-label="Jeda">⏸</button><button class="jsq" data-j="world" aria-label="Peta dunia">🌍</button><button class="jsq" data-j="quest" aria-label="Misi">📜</button><button class="jsq" data-j="wd" aria-label="Lemari gaya">👕</button><button class="jsq" data-j="set" aria-label="Pengaturan suara">⚙</button></div>
      <div class="joy" id="joy" aria-label="Joystick"><i id="joyK"></i></div>
      <button class="jjump" id="jJump" aria-label="Lompat">LOMPAT</button>
      <button class="jtalk" id="jTalk" hidden></button>
      <div id="jtoast" class="jtoasts"></div>
      <div class="jload" id="jLoad"><span>🚐</span><b>Menuju ${PP.esc(pos.name)}…</b></div>
    </div>`;

    function hud() {
      PP.$('#jName').textContent = PP.nm(); PP.$('#jLv').textContent = 'Level ' + S.level() + ' • ' + S.xpInLevel() + '/' + S.XP_PER_LEVEL + ' XP';
      PP.$('#jXp').style.width = (S.xpInLevel() / S.XP_PER_LEVEL * 100) + '%'; PP.$('#jCoin').textContent = '🪙 ' + coins();
      const n = st.ok.filter(Boolean).length; PP.$('#jMis').textContent = n; PP.$('#jMisBar').style.width = (n / 3 * 100) + '%';
      PP.$('#jAv').innerHTML = PP.img(PP.me().idle);
    }
    function reg() { return PP.$('#jw'); }

    /* ---- dialog NPC ---- */
    function talk(n) {
      if (dlgOpen || !eng) return; dlgOpen = true; eng.paused = true; eng.input.x = eng.input.y = 0; PP.$('#jTalk').hidden = true; A.sfx('page');
      const box = document.createElement('div'); box.className = 'jdlg'; reg().appendChild(box);
      const close = () => { box.remove(); dlgOpen = false; eng.paused = false; };
      const head = `<div class="jd-h"><b>💬 ${PP.esc(n.name)}</b><button class="jbtn sm nosfx" data-x>✕ Keluar</button></div>`;
      if (n.i === 3) {                                    // penjaga/pemandu: tips + lanjut
        const done = S.missionDone(id), next = id < 6 ? 'jelajah-' + (id + 1) : 'finish';
        box.innerHTML = `<div class="jd-c">${head}<div class="jbar g big"><i style="width:${st.ok.filter(Boolean).length / 3 * 100}%"></i></div>
          <p class="jd-t">Halo, ${PP.esc(PP.nm())}! Selamat datang di <b>${PP.esc(pos.name)}</b>.</p><p class="jd-t">${PP.esc(WORLD[id].tip)}</p>
          <p class="jd-t">${done ? 'Misi dunia ini sudah selesai. Kamu boleh lanjut!' : 'Bantu tiga warga lain dulu (tanda ❗ di atas kepala mereka), lalu kembali padaku.'}</p>
          <div class="jd-r">${done ? `<button class="jbtn green" data-go="${next}">➜ ${id < 6 ? 'Dunia Berikutnya' : 'Ke FINISH'}</button>` : ''}<button class="jbtn" data-x>Oke</button></div></div>`;
        box.querySelectorAll('[data-x]').forEach(b => b.onclick = close); return;
      }
      const q = qs[n.i], showQ = () => {
        const answered = st.ok[n.i];
        box.innerHTML = `<div class="jd-c">${head}<div class="jbar g big"><i style="width:${st.ok.filter(Boolean).length / 3 * 100}%"></i></div>
          <p class="jd-who">${answered ? 'Kamu sudah membantuku — mau latihan lagi?' : PP.pick(['Hai petualang! Bantu aku menjawab soal ini ya.', 'Aku butuh bantuan matematika. Bisa kamu jawab?', 'Pertanyaan dari warga untukmu:'])}</p>
          <p class="jd-q">${q.q}</p>
          <div class="jd-o">${q.o.map((o, k) => `<button class="jo c${k % 4} nosfx" data-k="${k}"><b>${'ABCD'[k]}</b>${o}</button>`).join('')}</div><div id="jfb"></div></div>`;
        box.querySelectorAll('[data-x]').forEach(b => b.onclick = close);
        box.querySelectorAll('.jo').forEach(b => b.onclick = () => {
          if (b.disabled) return; const k = +b.dataset.k, right = k === q.a;
          box.querySelectorAll('.jo').forEach(x => x.disabled = true); b.classList.add(right ? 'right' : 'wrong'); box.querySelectorAll('.jo')[q.a].classList.add('right');
          S.tallyAnswer(right); A.sfx(right ? 'correct' : 'wrong');
          let extra = '';
          if (right) {
            if (!st.ok[n.i]) { st.first[n.i] = st.first[n.i] || (b.dataset.tried ? 0 : (box._tries || 0) === 0 ? 1 : 0); st.ok[n.i] = 1; n.done = true; S.addXP(8, true); addCoins(10); extra = ' <span class="jgain">+10 🪙 +8 XP</span>'; S.save(); }
          } else box._tries = (box._tries || 0) + 1;
          PP.$('#jfb').innerHTML = `<div class="jfb ${right ? 'ok' : 'no'}"><b>${right ? '✔ ' + PP.pick(PP.MSG.right) : '✖ Kurang tepat.'}</b>${extra}<p>${q.e || ''}</p></div>
            <div class="jd-r"><button class="jbtn blue" id="jDone">${right ? 'Selesai ➜' : 'Coba lagi'}</button></div>`;
          box.firstElementChild.classList.add('ans'); hud();
          PP.$('#jDone').onclick = () => { if (!right) { showQ(); return; } close(); checkMission(); };
        });
      };
      showQ();
    }
    function checkMission() {
      if (st.ok.every(Boolean) && !(st.rewarded)) {
        const first = st.first.filter(Boolean).length, stars = first >= 3 ? 3 : first === 2 ? 2 : 1;
        const fresh = S.completeMission(id, stars); st.rewarded = true; addCoins(30); S.save(); hud();
        const next = id < 6 ? 'jelajah-' + (id + 1) : 'finish';
        eng.paused = true;
        PP.ui.missionComplete({ title: pos.name + ' selesai!', stars, xp: fresh ? 50 + 10 * stars : 0, unlock: fresh && id < 6, extra: '<p class="xp-line">+30 🪙 koin</p>',
          actions: [{ label: 'Peta Dunia', route: 'dunia' }, { label: id < 6 ? 'Dunia Berikutnya' : 'Ke FINISH', route: next, cls: 'green' }] });
        PP.$('#modal')._after = () => { eng && (eng.paused = false); };
      }
    }

    /* ---- mount ---- */
    function mount(root) {
      const canvas = PP.$('#jc'); const world = W3.buildWorld(id);
      try { eng = W3.create(canvas, world, { look: lookNow() }); } catch (e) { console.error(e); eng = null; }
      if (!eng) { PP.$('#jLoad').innerHTML = '<b>Perangkat ini belum mendukung grafik 3D (WebGL).</b><button class="jbtn" data-go="peta">Pakai Peta 2D</button>'; return; }
      world.theme.npc.forEach((p, i) => { const n = eng.npcs[i]; n.name = names[i]; n.look = Object.assign({}, NPC_LOOKS[i]); if (i < 3) n.done = !!st.ok[i]; else n.done = S.missionDone(id); });
      eng.onGem = g => { gemCount++; S.data.gems = (S.data.gems || 0) + 1; addCoins(5); A.sfx('star'); toast('💎 Mutiara ditemukan! +5 koin (' + gemCount + ')'); hud(); };
      eng.onJump = () => A.sfx('tick');
      hud(); root._hud = hud; PP.jeng = eng; PP.jworld = { id, st, qs };
      // label dunia (rumus) & nama NPC
      const lb = PP.$('#jlabels');
      lbEls = world.labels.map(l => { const e = document.createElement('span'); e.className = 'lb3d ' + l.cls; e.textContent = l.text; lb.appendChild(e); return e; });
      nmEls = eng.npcs.map(n => { const e = document.createElement('span'); e.className = 'nm3d'; e.textContent = n.name; lb.appendChild(e); return e; });
      setTimeout(() => { const l = PP.$('#jLoad'); l && l.classList.add('out'); setTimeout(() => l && l.remove(), 500); }, 900);

      // joystick
      const joy = PP.$('#joy'), knob = PP.$('#joyK'); let jid = null, jc = null;
      const setJ = (x, y) => { eng.input.x = x; eng.input.y = y; knob.style.transform = `translate(${x * 34}px, ${-y * 34}px)`; };
      joy.addEventListener('pointerdown', e => { jid = e.pointerId; joy.setPointerCapture(jid); jc = joy.getBoundingClientRect(); mv(e); A.unlock && A.unlock(); e.preventDefault(); });
      const mv = e => { const cx = jc.left + jc.width / 2, cy = jc.top + jc.height / 2; let dx = (e.clientX - cx) / 46, dy = (cy - e.clientY) / 46; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } setJ(dx, dy); };
      joy.addEventListener('pointermove', e => { if (e.pointerId === jid) mv(e); });
      const up = e => { if (e.pointerId === jid) { jid = null; setJ(0, 0); } };
      joy.addEventListener('pointerup', up); joy.addEventListener('pointercancel', up);
      PP.$('#jJump').addEventListener('pointerdown', e => { eng.input.jump = true; e.preventDefault(); });
      // putar kamera dengan geser
      let drag = null;
      canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener('pointermove', e => { if (drag && drag.id === e.pointerId) { eng.cam.yaw -= (e.clientX - drag.x) * 0.008; drag.x = e.clientX; } });
      canvas.addEventListener('pointerup', () => { drag = null; });
      // keyboard
      const kd = e => { if (dlgOpen) return; const k = e.key.toLowerCase(); keys[k] = true; if (k === ' ') { eng.input.jump = true; e.preventDefault(); } if ((k === 'e' || k === 'enter') && eng.near) talk(eng.near); };
      const ku = e => { keys[e.key.toLowerCase()] = false; };
      window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); root._kd = [kd, ku];
      // tombol
      PP.$('#jTalk').onclick = () => eng.near && talk(eng.near);
      root.addEventListener('click', e => {
        const b = e.target.closest('[data-j]'); if (!b) return; const a = b.dataset.j;
        if (a === 'world') PP.go('dunia');
        else if (a === 'set') PP.acts['audio-toggle']();
        else if (a === 'wd') { eng.paused = true; wardrobe(reg(), () => { eng.paused = false; hud(); }, eng); }
        else if (a === 'pause') { eng.paused = true; PP.ui.modal(`<h3>⏸ Permainan dijeda</h3><div class="col"><button class="btn green" data-close>▶ Lanjut</button><button class="btn" data-go="dunia" data-close>🌍 Peta Dunia</button><button class="btn" data-go="menu" data-close>☰ Menu Utama</button></div>`, { onclose: () => { eng && (eng.paused = false); } }); }
        else if (a === 'quest') { eng.paused = true; PP.ui.modal(`<h3>📜 Misi</h3><p class="modal-text"><b>${PP.esc(pos.name)}</b>: bantu 3 warga menjawab soal (${st.ok.filter(Boolean).length}/3).</p><p class="modal-text">Kumpulkan mutiara 💎 untuk koin dan buka Lemari Gaya 👕 untuk ganti penampilan.</p><div class="row end"><button class="btn green" data-close>Oke</button></div>`, { onclose: () => { eng && (eng.paused = false); } }); }
      });

      const onResize = () => eng && eng.resize(); window.addEventListener('resize', onResize); root._rs = onResize;
      const loop = ts => {
        if (dead) return; raf = requestAnimationFrame(loop);
        const dt = last ? (ts - last) / 1000 : 0.016; last = ts;
        if (!dlgOpen && (keys.w || keys.a || keys.s || keys.d || keys.arrowup || keys.arrowdown || keys.arrowleft || keys.arrowright)) { const x = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), y = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0); eng.input.x = x; eng.input.y = y; } else if (jid == null) { eng.input.x = eng.input.y = 0; }
        eng.update(dt); eng.render();
        // label
        world.labels.forEach((l, i) => { const p = eng.project(l.x, l.y, l.z), e = lbEls[i]; if (!p || p.d > 34) { e.style.display = 'none'; } else { e.style.display = ''; e.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`; } });
        eng.npcs.forEach((n, i) => { const p = eng.project(n.x, 2.95, n.z), e = nmEls[i]; if (!p || p.d > 30) e.style.display = 'none'; else { e.style.display = ''; e.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-100%)`; } });
        const t = PP.$('#jTalk'); if (t) { const nr = dlgOpen ? null : eng.near; if (nr) { t.hidden = false; const lbl = nr.i === 3 ? 'Bicara dengan ' + nr.name : 'Bicara dengan ' + nr.name; if (t.textContent !== lbl) t.textContent = lbl; } else t.hidden = true; }
      };
      raf = requestAnimationFrame(loop);
      // jika modal ditutup, lanjutkan
      const mo = new MutationObserver(() => { const m = PP.$('#modal'); if (m && m.hidden && eng && !dlgOpen && !PP.$('.jwd')) eng.paused = false; });
      mo.observe(PP.$('#modal'), { attributes: true, attributeFilter: ['hidden'] }); root._mo = mo;
    }
    return {
      html, mount(root) { try { mount(root); } catch (e) { console.error(e); PP.$('#jLoad').innerHTML = '<b>Dunia 3D gagal dimuat.</b><button class="jbtn" data-go="dunia">Kembali</button>'; } },
      unmount() { dead = true; cancelAnimationFrame(raf); const r = PP.$('#app'); if (r && r._kd) { window.removeEventListener('keydown', r._kd[0]); window.removeEventListener('keyup', r._kd[1]); } if (r && r._rs) window.removeEventListener('resize', r._rs); r && r._mo && r._mo.disconnect(); eng && eng.dispose(); }
    };
  };
})();

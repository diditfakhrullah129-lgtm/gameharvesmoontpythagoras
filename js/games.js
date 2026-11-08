/* =========================================================
   GAME EDUKASI: A Susun Segitiga · B Temukan Panjang Sisi · C Misi Jembatan · D Tantangan Akhir
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio, V = PPViz, f = V.fmt;
  PP.screens = PP.screens || {};
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const CORNERS = ['bl', 'br', 'tl', 'tr'];

  const META = {
    A: { name: 'Susun Segitiga', desc: 'Seret atau ketuk nama sisi ke tempat yang tepat pada segitiga siku-siku.', how: ['Ada 5 ronde. Tiap ronde memiliki satu segitiga.', 'Seret kartu nama ke sisi yang sesuai. Di HP, ketuk kartu lalu ketuk sisinya.', 'Tekan Periksa. Skor dihitung dari jawaban pada pemeriksaan pertama.'], bgm: 'Musik: Minigame 1' },
    B: { name: 'Temukan Panjang Sisi', desc: 'Hitung sisi ketiga segitiga siku-siku. 10 soal dari mudah sampai sulit.', how: ['Dua panjang sisi diketahui, carilah sisi ketiga.', 'Kamu punya 2 kesempatan tiap soal. Setelah salah pertama, rumus akan dibantu.', 'Jawaban benar pertama bernilai 10, kedua bernilai 5.'], bgm: 'Musik: Minigame 1' },
    C: { name: 'Misi Jembatan', desc: 'Hitung panjang tangga, tali, atau jembatan agar penjelajah bisa melewati rintangan.', how: ['Ada 6 rintangan. Baca ceritanya lalu pilih jawaban yang benar.', 'Jawaban benar membuat jembatan terbentuk dan karakter melanjutkan perjalanan.', 'Salah pertama boleh mencoba sekali lagi.'], bgm: 'Musik: Minigame 2 (Race)' },
    D: { name: 'Tantangan Akhir', desc: 'Soal campuran dari seluruh materi. Kamu punya tiga nyawa.', how: ['10 soal acak dari seluruh materi.', 'Setiap jawaban salah mengurangi satu nyawa. Nyawa habis, permainan berakhir.', 'Setiap jawaban benar bernilai 10.'], bgm: 'Musik: Minigame 2 (Race)' }
  };

  /* ---------- menu game ---------- */
  PP.screens.games = function () {
    const cards = ['A', 'B', 'C', 'D'].map(k => {
      const g = S.data.games[k], pos = PP.POS.find(p => p.game === k), m = META[k];
      return `<div class="panel pad game-card"><div class="gc-top"><span class="gc-l">${k}</span><div><h3>${m.name}</h3><p class="small">${m.desc}</p></div></div>
        <div class="gc-stat">${g ? PP.stars(g.stars) + `<span class="pill">Terbaik ${g.best}</span><span class="pill">${g.plays}× main</span>` : '<span class="muted small">Belum dimainkan</span>'}</div>
        <p class="small muted">Menyelesaikan misi: Pos ${pos.id} ${S.missionDone(pos.id) ? '(selesai)' : S.missionUnlocked(pos.id) ? '(terbuka)' : '(terkunci)'}</p>
        <button class="btn green" data-go="game-${k}">Main Game ${k}</button></div>`;
    }).join('');
    return { html: `<div class="wrap"><h2 class="h-title">Game dan Tantangan</h2>${PP.guide('Pilih permainan! Skormu tersimpan dan ikut menjadi nilai. Game juga dipakai untuk menyelesaikan misi di peta.')}<div class="game-grid">${cards}</div></div>` };
  };

  /* ---------- pembungkus game ---------- */
  PP.screens.game = function (arg) {
    const k = META[arg] ? arg : 'A', m = META[k];
    const posId = (PP.POS.find(p => p.game === k) || {}).id;
    const html = `<div class="wrap narrowish"><div class="panel pad gshell">
      <div class="g-head"><span class="gc-l">${k}</span><h2 class="h-title">${m.name}</h2><span class="pill" id="gInfo"></span></div>
      <div id="gbox"></div></div></div>`;
    const inst = { html, timers: [], unmount() { this.timers.forEach(t => { clearInterval(t); clearTimeout(t); cancelAnimationFrame(t); }); } };
    inst.mount = function (root) {
      const box = PP.$('#gbox', root), info = PP.$('#gInfo', root);
      const ctx = { box, info, inst, k, posId };
      const intro = () => {
        box.innerHTML = `<div class="intro">${PP.guide(m.desc)}<ol class="how sm">${m.how.map(h => `<li><div><p>${h}</p></div></li>`).join('')}</ol>
          <p class="small muted">${m.bgm}</p>
          <div class="row center"><button class="btn xl green" id="gStart">MULAI</button><button class="btn" data-go="games">Pilih Game Lain</button></div></div>`;
        info.textContent = '';
        PP.$('#gStart').onclick = () => { A.sfx('start'); RUN[k](ctx, intro); };
      };
      intro();
    };
    return inst;
  };

  function finishGame(ctx, res, again) {
    const { box, k, posId } = ctx;
    A.sfx('end');
    const stars = S.recordGame(k, res);
    const unlocked = posId && S.missionUnlocked(posId), wasDone = posId && S.missionDone(posId);
    let note = '', modal = null;
    if (stars >= 1 && posId && unlocked) {
      const first = S.completeMission(posId, stars);
      note = `<p class="fb ok"><b>Misi Pos ${posId} ${first ? 'selesai!' : 'diperbarui.'}</b> ${PP.POS[posId - 1].name}</p>`;
      if (first) modal = { title: PP.POS[posId - 1].name + ' selesai!', stars, unlock: posId < 6, xp: 50 + 10 * stars, actions: [{ label: 'Ke Peta', route: 'peta' }, { label: posId < 6 ? 'Pos Berikutnya' : 'Menuju FINISH', route: posId < 6 ? 'pos-' + (posId + 1) : 'finish', cls: 'green' }] };
    } else if (stars < 1) note = '<p class="fb no">Skor belum mencapai 50. Coba lagi untuk mendapat bintang pertama!</p>';
    else if (posId && !unlocked) note = `<p class="muted small">Skor tersimpan. Pos ${posId} belum terbuka, jadi misinya belum dihitung.</p>`;
    ctx.info.textContent = '';
    box.innerHTML = `<div class="result"><div class="res-stars">${PP.stars(stars)}</div><h3>${res.title || (stars >= 2 ? 'Hebat sekali!' : stars === 1 ? 'Bagus!' : 'Ayo coba lagi!')}</h3>
      <div class="fin-stats"><div><b>${res.score}</b><span>Skor</span></div><div><b>${res.correct}</b><span>Benar</span></div><div><b>${res.wrong}</b><span>Salah</span></div><div><b>+${Math.round(res.score / 4)}</b><span>XP</span></div></div>
      ${note}
      <div class="row center"><button class="btn green" id="gAgain">Main Lagi</button><button class="btn" data-go="${wasDone || (posId && S.missionDone(posId)) ? 'peta' : 'games'}">${posId && S.missionDone(posId) ? 'Ke Peta' : 'Menu Game'}</button><button class="btn" data-go="menu">Menu Utama</button></div></div>`;
    PP.$('#gAgain').onclick = again;
    if (stars >= 2) PP.ui.confetti(30);
    if (modal) setTimeout(() => PP.ui.missionComplete(modal), 500);
  }

  const feedback = (ok, text) => `<div class="fb ${ok ? 'ok' : 'no'}">${PP.img('owl_' + (ok ? 2 : 0), 'fbi')}<div><b>${PP.pick(ok ? PP.MSG.right : PP.MSG.wrong)}</b>${text ? `<p>${text}</p>` : ''}</div></div>`;

  /* =====================================================
     GAME A — SUSUN SEGITIGA
     ===================================================== */
  const NAMES = { h: 'Sisi alas', v: 'Sisi tegak', hyp: 'Sisi miring (hipotenusa)' };
  function gameA(ctx, back) {
    const { box, info } = ctx, ROUNDS = 5;
    let round = 0, correct = 0, wrong = 0;
    const dims = [[4, 3], [5, 3], [3, 4], [6, 4], [4, 5], [5, 4], [6, 3]];
    const used = [];
    const next = () => {
      if (round >= ROUNDS) return finishGame(ctx, { score: Math.round(correct / (ROUNDS * 3) * 100), correct, wrong }, () => gameA(ctx, back));
      round++; info.textContent = `Ronde ${round}/${ROUNDS}`;
      let d; do { d = dims[rnd(dims.length)]; } while (used.includes(d.join()) && used.length < dims.length); used.push(d.join());
      const corner = CORNERS[rnd(4)];
      const t = V.tri({ H: d[0], V: d[1], corner, labels: {}, w: 340, h: 250, m: 46, off: 34 });
      const placed = { h: null, v: null, hyp: null }; let sel = null, checked = false, firstDone = false;
      box.innerHTML = `<p class="small">Letakkan nama yang tepat pada setiap sisi. <b>Sisi alas</b> adalah kaki yang mendatar, <b>sisi tegak</b> kaki yang tegak.</p>
        <div class="figbox" style="aspect-ratio:${t.W}/${t.Hh}">${t.svg}${['h', 'v', 'hyp'].map(s => `<button class="slot" data-side="${s}" style="left:${(t.pts[s].x / t.W * 100).toFixed(2)}%;top:${(t.pts[s].y / t.Hh * 100).toFixed(2)}%" aria-label="Tempat nama sisi">?</button>`).join('')}</div>
        <div class="tray" id="tray">${shuffle(['h', 'v', 'hyp']).map(s => `<button class="dchip" data-v="${s}" type="button">${NAMES[s]}</button>`).join('')}</div>
        <div id="gfb"></div><div class="row center"><button class="btn green" id="gChk" disabled>Periksa</button></div>`;
      const slots = PP.$$('.slot', box), chips = PP.$$('.dchip', box), chk = PP.$('#gChk');
      const refresh = () => {
        slots.forEach(sl => { const v = placed[sl.dataset.side]; sl.textContent = v ? NAMES[v] : '?'; sl.classList.toggle('filled', !!v); });
        chips.forEach(c => { c.classList.toggle('used', Object.values(placed).includes(c.dataset.v)); c.classList.toggle('sel', sel === c.dataset.v); });
        chk.disabled = checked || Object.values(placed).some(v => !v);
      };
      const place = (side, v) => {
        if (checked) return;
        Object.keys(placed).forEach(k => { if (placed[k] === v) placed[k] = null; });
        placed[side] = v; sel = null; A.sfx('tick'); PP.$$('.slot', box).forEach(s => s.classList.remove('bad')); refresh();
      };
      slots.forEach(sl => sl.addEventListener('click', () => {
        if (checked) return;
        if (sel) place(sl.dataset.side, sel);
        else if (placed[sl.dataset.side]) { placed[sl.dataset.side] = null; refresh(); }
      }));
      // seret & lepas (pointer) + ketuk
      const tray = PP.$('#tray', box); let drag = null;
      tray.addEventListener('pointerdown', e => {
        const c = e.target.closest('.dchip'); if (!c || c.classList.contains('used')) return;
        drag = { c, x: e.clientX, y: e.clientY, ghost: null }; try { c.setPointerCapture(e.pointerId); } catch (_) {}
      });
      tray.addEventListener('pointermove', e => {
        if (!drag) return;
        if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) { drag.ghost = drag.c.cloneNode(true); drag.ghost.className = 'dchip ghost-chip'; document.body.appendChild(drag.ghost); }
        if (drag.ghost) {
          drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
          const el = document.elementFromPoint(e.clientX, e.clientY), sl = el && el.closest('.slot');
          slots.forEach(s => s.classList.toggle('over', s === sl));
        }
      });
      const endDrag = e => {
        if (!drag) return; const d = drag; drag = null; slots.forEach(s => s.classList.remove('over'));
        if (d.ghost) { d.ghost.remove(); const el = document.elementFromPoint(e.clientX, e.clientY), sl = el && el.closest('.slot'); if (sl && e.type === 'pointerup') place(sl.dataset.side, d.c.dataset.v); }
        else if (e.type === 'pointerup') { sel = sel === d.c.dataset.v ? null : d.c.dataset.v; A.sfx('tick'); refresh(); }
      };
      tray.addEventListener('pointerup', endDrag); tray.addEventListener('pointercancel', endDrag);
      tray.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('dchip') && !e.target.classList.contains('used')) { e.preventDefault(); sel = sel === e.target.dataset.v ? null : e.target.dataset.v; refresh(); } });
      chk.onclick = () => {
        const bad = Object.keys(placed).filter(s => placed[s] !== s), ok = 3 - bad.length;
        if (!firstDone) { firstDone = true; correct += ok; wrong += bad.length; S.tallyAnswer; if (ok) S.addXP(ok * 2, true); }
        if (!bad.length) {
          checked = true; A.sfx('correct'); refresh();
          PP.$('#gfb', box).innerHTML = feedback(true, 'Semua sisi sudah tepat. Sisi miring ada di depan sudut siku-siku.');
          chk.disabled = true; chk.insertAdjacentHTML('afterend', `<button class="btn green" id="gNext">${round >= ROUNDS ? 'Lihat Hasil' : 'Ronde Berikutnya'}</button>`);
          PP.$('#gNext').onclick = next;
        } else {
          A.sfx('wrong');
          slots.forEach(sl => { if (bad.includes(sl.dataset.side)) { sl.classList.add('bad'); placed[sl.dataset.side] = null; } });
          PP.$('#gfb', box).innerHTML = feedback(false, `${bad.length} sisi belum tepat. Sisi yang salah dikosongkan, coba tempatkan lagi. Petunjuk: sisi miring berada di depan sudut siku-siku.`);
          refresh();
        }
      };
      refresh();
    };
    next();
  }

  /* =====================================================
     GAME B — TEMUKAN PANJANG SISI
     ===================================================== */
  function expl(it) {
    const { a, b, c } = it;
    if (it.unk === 'c') return `c² = a² + b² = ${f(a)}² + ${f(b)}² = ${f(a * a)} + ${f(b * b)} = ${f(c * c)}, jadi c = √${f(c * c)} = ${f(c)}.`;
    if (it.unk === 'a') return `a² = c² − b² = ${f(c)}² − ${f(b)}² = ${f(c * c)} − ${f(b * b)} = ${f(a * a)}, jadi a = √${f(a * a)} = ${f(a)}.`;
    return `b² = c² − a² = ${f(c)}² − ${f(a)}² = ${f(c * c)} − ${f(a * a)} = ${f(b * b)}, jadi b = √${f(b * b)} = ${f(b)}.`;
  }
  const hintB = it => it.unk === 'c' ? 'Petunjuk: sisi miring dicari, jadi jumlahkan kuadrat kedua sisi siku-siku: c² = a² + b².' : 'Petunjuk: yang dicari sisi siku-siku, jadi kurangkan: kuadrat sisi miring dikurangi kuadrat sisi yang diketahui.';
  function gameB(ctx, back) {
    const { box, info } = ctx;
    const pick = (arr, n) => shuffle(arr).slice(0, n);
    const qs = [...pick(PP.POOL_B.easy, 4).map(x => ({ ...x, lv: 'Mudah' })), ...pick(PP.POOL_B.medium, 3).map(x => ({ ...x, lv: 'Sedang' })), ...pick(PP.POOL_B.hard, 3).map(x => ({ ...x, lv: 'Sulit' }))];
    let i = 0, pts = 0, correct = 0, wrong = 0;
    const next = () => {
      if (i >= qs.length) return finishGame(ctx, { score: Math.min(100, pts), correct, wrong }, () => gameB(ctx, back));
      const it = qs[i++]; info.textContent = `Soal ${i}/${qs.length} · ${it.lv}`;
      const lab = s => it.unk === s ? (s === 'a' ? 'a = ?' : s === 'b' ? 'b = ?' : 'c = ?') : `${s} = ${f(it[s])} cm`;
      const t = V.tri({ H: it.b, V: it.a, corner: CORNERS[rnd(4)], labels: { h: lab('b'), v: lab('a'), hyp: lab('c') }, w: 360, h: 250, m: 50, off: 22 });
      const unkName = { a: 'sisi tegak (a)', b: 'sisi alas (b)', c: 'sisi miring (c)' }[it.unk];
      box.innerHTML = `<div class="figure">${t.svg}</div><p class="q-text">Tentukan panjang <b>${unkName}</b> dalam cm.</p>
        <form class="ans" id="gForm"><input id="gIn" class="cell big" inputmode="decimal" autocomplete="off" placeholder="Jawabanmu" aria-label="Jawaban"><button class="btn green" type="submit">Jawab</button></form>
        <p class="small muted">Boleh memakai koma desimal, misalnya 12,5.</p><div id="gfb"></div>`;
      let tries = 0; const inp = PP.$('#gIn', box); inp.focus();
      PP.$('#gForm', box).onsubmit = e => {
        e.preventDefault();
        const v = parseFloat(inp.value.replace(',', '.'));
        if (isNaN(v)) { PP.$('#gfb', box).innerHTML = '<p class="err">Tulis jawabanmu dengan angka.</p>'; return; }
        tries++;
        const ok = Math.abs(v - it[it.unk]) < 0.01;
        const fin = (good, got) => {
          inp.disabled = true; PP.$('#gForm button', box).disabled = true;
          if (good) { correct++; pts += got; S.tallyAnswer(true); S.addXP(5); } else { wrong++; S.tallyAnswer(false); }
          PP.$('#gfb', box).innerHTML = feedback(good, expl(it)) + `<button class="btn green" id="gNext">${i >= qs.length ? 'Lihat Hasil' : 'Soal Berikutnya'}</button>`;
          PP.$('#gNext').onclick = next; PP.$('#gNext').focus();
        };
        if (ok) { A.sfx('correct'); fin(true, tries === 1 ? 10 : 5); }
        else if (tries === 1) { A.sfx('wrong'); PP.$('#gfb', box).innerHTML = feedback(false, hintB(it) + ' Coba sekali lagi.'); inp.select(); }
        else { A.sfx('wrong'); fin(false, 0); }
      };
    };
    next();
  }

  /* =====================================================
     GAME C — MISI JEMBATAN
     ===================================================== */
  function explC(sc) {
    const [p, q] = sc.legs;
    if (sc.ask === 'hyp') return `Segitiga siku-siku dengan sisi ${p} dan ${q}. c² = ${p}² + ${q}² = ${p * p} + ${q * q} = ${p * p + q * q}, jadi c = √${p * p + q * q} = ${sc.ans} ${sc.unit}.`;
    return `Sisi miring ${sc.hypLen} dan satu sisi ${q}. t² = ${sc.hypLen}² − ${q}² = ${sc.hypLen ** 2} − ${q * q} = ${sc.hypLen ** 2 - q * q}, jadi t = √${sc.hypLen ** 2 - q * q} = ${sc.ans} ${sc.unit}.`;
  }
  function gameC(ctx, back) {
    const { box, info, inst } = ctx, me = PP.me();
    let i = 0, pts = 0, correct = 0, wrong = 0;
    const per = 100 / PP.SCENES_C.length;
    const next = () => {
      if (i >= PP.SCENES_C.length) return finishGame(ctx, { score: Math.round(pts), correct, wrong }, () => gameC(ctx, back));
      const sc = PP.SCENES_C[i++]; info.textContent = `Rintangan ${i}/${PP.SCENES_C.length}`;
      const g = V.scene(sc, false);
      box.innerHTML = `<h3 class="h-sub">${sc.title}</h3><div class="figure sceneF">${g.svg}</div><p>${sc.story}</p><p class="q-text"><b>${sc.q}</b></p>
        <div class="opts">${sc.o.map((o, k) => `<button class="opt" data-k="${k}"><span class="ol">${'ABCD'[k]}</span>${o}</button>`).join('')}</div><div id="gfb"></div>`;
      const hero = PP.$('#hero', box); hero.innerHTML = `<image id="heroImg" href="assets/img/${me.idle}.png" width="26" height="50" x="${g.from[0] - 13}" y="${g.from[1] - 50}"/>`;
      const img = PP.$('#heroImg', box); let tries = 0, done = false;
      const walk = () => {
        PP.$$('.ghost', box).forEach(n => n.classList.remove('ghost'));
        let fi = 0; const fr = me.walk; const ft = setInterval(() => { fi = (fi + 1) % fr.length; img.setAttribute('href', `assets/img/${fr[fi]}.png`); }, 140); inst.timers.push(ft);
        const t0 = performance.now(), dur = 1700;
        const step = now => {
          const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          img.setAttribute('x', g.from[0] + (g.to[0] - g.from[0]) * e - 13); img.setAttribute('y', g.from[1] + (g.to[1] - g.from[1]) * e - 50);
          if (k < 1) inst.timers.push(requestAnimationFrame(step)); else { clearInterval(ft); img.setAttribute('href', `assets/img/${me.idle}.png`); A.sfx('star'); showNext(); }
        };
        inst.timers.push(requestAnimationFrame(step));
      };
      const showNext = () => { PP.$('#gfb', box).insertAdjacentHTML('beforeend', `<button class="btn green" id="gNext">${i >= PP.SCENES_C.length ? 'Lihat Hasil' : 'Rintangan Berikutnya'}</button>`); PP.$('#gNext').onclick = next; PP.$('#gNext').focus(); };
      PP.$$('.opt', box).forEach(b => b.onclick = () => {
        if (done || b.disabled) return; tries++;
        const ok = sc.o[+b.dataset.k] === sc.ans + ' ' + sc.unit;
        if (ok) {
          done = true; PP.$$('.opt', box).forEach(x => x.disabled = true); b.classList.add('right'); A.sfx('correct');
          correct++; pts += tries === 1 ? per : per / 2; S.tallyAnswer(true); S.addXP(6);
          PP.$('#gfb', box).innerHTML = feedback(true, explC(sc)); walk();
        } else if (tries === 1) {
          b.classList.add('wrong'); b.disabled = true; A.sfx('wrong'); PP.$('#gfb', box).innerHTML = feedback(false, 'Ingat, gunakan Teorema Pythagoras pada segitiga siku-siku di gambar. Coba sekali lagi.');
        } else {
          done = true; wrong++; S.tallyAnswer(false); b.classList.add('wrong'); PP.$$('.opt', box).forEach(x => { x.disabled = true; if (sc.o[+x.dataset.k] === sc.ans + ' ' + sc.unit) x.classList.add('right'); });
          A.sfx('wrong'); PP.$('#gfb', box).innerHTML = feedback(false, explC(sc)); walk();
        }
      });
    };
    next();
  }

  /* =====================================================
     GAME D — TANTANGAN AKHIR
     ===================================================== */
  function gameD(ctx, back) {
    const { box, info } = ctx;
    const qs = shuffle(PP.POOL_D).slice(0, 10);
    let i = 0, lives = 3, correct = 0, wrong = 0, streak = 0;
    const hearts = () => Array.from({ length: 3 }, (_, k) => `<span class="heart ${k < lives ? '' : 'off'}">♥</span>`).join('');
    const end = (over) => finishGame(ctx, { score: correct * 10, correct, wrong, title: over ? 'Nyawa habis, tetap semangat!' : null }, () => gameD(ctx, back));
    const next = () => {
      if (i >= qs.length || lives <= 0) return end(lives <= 0);
      const q = qs[i++]; info.textContent = `Soal ${i}/${qs.length}`;
      box.innerHTML = `<div class="d-bar"><span class="hearts" aria-label="Nyawa ${lives}">${hearts()}</span><span class="pill">Skor ${correct * 10}</span>${streak >= 2 ? `<span class="pill ok">Beruntun ${streak}</span>` : ''}</div>
        <h3 class="q-text">${q.q}</h3><div class="opts">${q.o.map((o, k) => `<button class="opt" data-k="${k}"><span class="ol">${'ABCD'[k]}</span>${o}</button>`).join('')}</div><div id="gfb"></div>`;
      PP.$$('.opt', box).forEach(b => b.onclick = () => {
        if (b.disabled) return; const ok = +b.dataset.k === q.a;
        PP.$$('.opt', box).forEach(x => x.disabled = true); b.classList.add(ok ? 'right' : 'wrong'); PP.$$('.opt', box)[q.a].classList.add('right');
        S.tallyAnswer(ok);
        if (ok) { correct++; streak++; S.addXP(5); A.sfx('correct'); } else { wrong++; streak = 0; lives--; A.sfx('wrong'); }
        PP.$('.hearts', box).innerHTML = hearts();
        PP.$('#gfb', box).innerHTML = feedback(ok, q.e) + `<button class="btn green" id="gNext">${(i >= qs.length || lives <= 0) ? 'Lihat Hasil' : 'Soal Berikutnya'}</button>`;
        PP.$('#gNext').onclick = next; PP.$('#gNext').focus();
      });
    };
    next();
  }

  const RUN = { A: gameA, B: gameB, C: gameC, D: gameD };
})();

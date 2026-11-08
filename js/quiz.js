/* =========================================================
   KUIS INTERAKTIF — 15 soal, timer dapat diatur, jawaban tersimpan, pembahasan
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio;
  PP.screens = PP.screens || {};
  const N = () => PP.QUIZ.length;

  function predikat(score) { return S.predikat(score); }
  function mmss(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

  PP.screens.kuis = function () {
    const inst = { timers: [], unmount() { this.timers.forEach(clearInterval); } };
    inst.html = '<div class="wrap narrowish"><div class="panel pad" id="qz"></div></div>';
    inst.mount = function (root) {
      const box = PP.$('#qz', root); const q = S.data.quiz;
      const draft = q.draft;
      const lv = PP.QUIZ.reduce((o, x) => (o[x.lv] = (o[x.lv] || 0) + 1, o), {});

      const intro = () => {
        const best = q.best;
        box.innerHTML = `<h2 class="h-title">Kuis Interaktif</h2>${PP.guide('Ada ' + N() + ' soal pilihan ganda: ' + Object.keys(lv).map(k => lv[k] + ' ' + k.toLowerCase()).join(', ') + '. Kamu bisa kembali ke soal sebelumnya sebelum menyelesaikan kuis.')}
          ${best ? `<p class="pill big">Nilai terbaik: ${best.score} · ${predikat(best.score).t}</p>` : ''}
          <label class="fld">Waktu pengerjaan
            <select id="qTime"><option value="0">Tanpa timer</option>${[5, 10, 15, 20, 30].map(m => `<option value="${m}" ${q.timerMin === m ? 'selected' : ''}>${m} menit</option>`).join('')}</select></label>
          <ul class="ticks small"><li>Satu soal ditampilkan pada satu waktu.</li><li>Jawaban tersimpan selama pengerjaan, bahkan jika halaman dimuat ulang.</li><li>Pembahasan muncul setelah kuis selesai.</li></ul>
          <div class="row center">${draft ? '<button class="btn blue" id="qResume">Lanjutkan Kuis Sebelumnya</button>' : ''}<button class="btn green xl" id="qStart">${draft ? 'Mulai Baru' : 'MULAI KUIS'}</button><button class="btn" data-go="menu">Menu Utama</button></div>`;
        PP.$('#qTime').onchange = e => { q.timerMin = +e.target.value; S.save(); };
        PP.$('#qStart').onclick = () => { A.sfx('start'); run({ ans: Array(N()).fill(null), idx: 0, end: q.timerMin ? Date.now() + q.timerMin * 60000 : 0, min: q.timerMin }); };
        if (draft) PP.$('#qResume').onclick = () => run(draft);
      };

      const run = (st) => {
        const persist = () => { q.draft = st; S.save(); };
        persist();
        let timer = null;
        const finish = (auto) => {
          clearInterval(timer);
          const res = grade(st); q.draft = null; q.last = res; q.attempts++;
          if (!q.best || res.score > q.best.score) q.best = res;
          S.data.tally.correct += res.correct; S.data.tally.wrong += res.wrong + res.blank; S.save();
          S.addXP(res.correct * 3 + (res.score >= 80 ? 20 : 0), true);
          if (res.score >= 80) S.award('quiz80'); if (res.score >= 100) S.award('perfect');
          A.sfx('quizFinish'); if (res.score >= 70) PP.ui.confetti(40);
          result(res, auto);
          if (PP.online) PP.online.submit(true).then(updOnline);
        };
        const draw = () => {
          const it = PP.QUIZ[st.idx], sel = st.ans[st.idx], answered = st.ans.filter(a => a != null).length;
          box.innerHTML = `<div class="qz-top"><span class="pill">Soal ${st.idx + 1}/${N()}</span><span class="pill lv-${it.lv}">${it.lv}</span><span class="pill">Terjawab ${answered}/${N()}</span>${st.end ? `<span class="pill timer" id="qTimer">${mmss(Math.ceil((st.end - Date.now()) / 1000))}</span>` : '<span class="pill">Tanpa timer</span>'}</div>
            <div class="bar"><i style="width:${answered / N() * 100}%"></i></div>
            <h3 class="q-text">${it.q}</h3>
            <div class="opts">${it.o.map((o, k) => `<button class="opt nosfx ${sel === k ? 'sel' : ''}" data-k="${k}"><span class="ol">${'ABCD'[k]}</span>${o}</button>`).join('')}</div>
            <nav class="qnav" aria-label="Nomor soal">${st.ans.map((a, k) => `<button class="qn nosfx ${k === st.idx ? 'cur' : ''} ${a != null ? 'done' : ''}" data-i="${k}" aria-label="Soal ${k + 1}${a != null ? ' sudah dijawab' : ''}">${k + 1}</button>`).join('')}</nav>
            <div class="row between"><button class="btn" id="qPrev" ${st.idx === 0 ? 'disabled' : ''}>◀ Sebelumnya</button>
              ${st.idx < N() - 1 ? '<button class="btn green" id="qNext">Berikutnya ▶</button>' : '<button class="btn blue" id="qDone">Selesai</button>'}</div>
            ${st.idx < N() - 1 ? '<div class="row center"><button class="btn sm" id="qDone2">Selesaikan Kuis</button></div>' : ''}`;
          PP.$$('.opt', box).forEach(b => b.onclick = () => { st.ans[st.idx] = +b.dataset.k; persist(); A.sfx('quizSelect'); draw(); });
          PP.$$('.qn', box).forEach(b => b.onclick = () => { st.idx = +b.dataset.i; persist(); A.sfx('tick'); draw(); });
          const go = d => () => { st.idx = Math.max(0, Math.min(N() - 1, st.idx + d)); persist(); draw(); };
          PP.$('#qPrev').onclick = go(-1); if (PP.$('#qNext')) PP.$('#qNext').onclick = go(1);
          const ask = () => {
            const blank = st.ans.filter(a => a == null).length;
            PP.ui.modal(`<h3>Selesaikan kuis?</h3><p class="modal-text">${blank ? blank + ' soal belum dijawab dan akan dihitung salah.' : 'Semua soal sudah terjawab.'} Setelah selesai, jawaban tidak dapat diubah.</p><div class="row end"><button class="btn" data-close>Kembali</button><button class="btn green" id="qOk">Ya, selesai</button></div>`);
            PP.$('#qOk').onclick = () => { PP.ui.close(); finish(false); };
          };
          if (PP.$('#qDone')) PP.$('#qDone').onclick = ask; if (PP.$('#qDone2')) PP.$('#qDone2').onclick = ask;
        };
        const tick = () => {
          if (!st.end) return;
          const left = Math.ceil((st.end - Date.now()) / 1000), t = PP.$('#qTimer');
          if (t) { t.textContent = mmss(left); t.classList.toggle('low', left <= 60); }
          if (left <= 0) { PP.ui.close(); PP.ui.toast('Waktu habis. Kuis diselesaikan otomatis.', 'owl'); finish(true); }
        };
        if (st.end) { timer = setInterval(tick, 1000); inst.timers.push(timer); }
        if (st.end && st.end - Date.now() <= 0) { finish(true); return; }
        draw();
      };

      const grade = st => {
        let correct = 0, wrong = 0, blank = 0;
        st.ans.forEach((a, i) => { if (a == null) blank++; else if (a === PP.QUIZ[i].a) correct++; else wrong++; });
        return { score: Math.round(correct / N() * 100), correct, wrong, blank, total: N(), ans: st.ans.slice(), date: Date.now() };
      };

      const updOnline = () => {
        const el = PP.$('#qOnl'); if (!el || !PP.online) return;
        const o = PP.online;
        if (!o.joined()) { el.innerHTML = '<p class="small">🌐 Ingin skormu masuk papan peringkat bersama teman sekelas?</p><button class="btn blue sm" data-go="online">Masuk Ruangan</button>'; return; }
        const s = o.status();
        el.innerHTML = s.ok === false ? `<p class="fb no small">Skor belum terkirim: ${PP.esc(s.msg)} (akan dicoba lagi otomatis)</p>` : `<p class="small">✅ ${PP.esc(s.msg || 'Mengirim skor…')}</p><button class="btn blue sm" data-go="online">🏆 Lihat Papan Peringkat</button>`;
      };
      const result = (res, auto) => {
        const pr = predikat(res.score), stars = S.starsFor(res.score);
        box.innerHTML = `<div class="result"><h2 class="h-title">Hasil Kuis</h2>${auto ? '<p class="fb no">Waktu habis, kuis diselesaikan otomatis.</p>' : ''}
          <div class="res-stars">${PP.stars(stars)}</div>
          <div class="fin-stats"><div><b>${res.score}</b><span>Nilai</span></div><div><b>${res.correct}</b><span>Benar</span></div><div><b>${res.wrong}</b><span>Salah</span></div><div><b>${res.blank}</b><span>Kosong</span></div></div>
          <p class="pill big">Predikat: ${pr.t}</p><p>${pr.d}</p>
          <div class="qz-onl" id="qOnl"></div>
          <h3 class="h-sub">Pembahasan</h3>
          <div class="review">${PP.QUIZ.map((it, i) => {
            const a = res.ans[i], ok = a === it.a;
            return `<article class="rv ${a == null ? 'blank' : ok ? 'ok' : 'no'}"><h4>${i + 1}. ${it.q} <span class="pill lv-${it.lv}">${it.lv}</span></h4>
              <p class="small">Jawabanmu: <b>${a == null ? 'tidak dijawab' : 'ABCD'[a] + '. ' + it.o[a]}</b> ${ok ? '✓' : ''}</p>
              ${ok ? '' : `<p class="small">Kunci: <b>${'ABCD'[it.a]}. ${it.o[it.a]}</b></p>`}<p class="small">${it.e}</p></article>`;
          }).join('')}</div>
          <div class="row center"><button class="btn green" id="qAgain">Ulangi Kuis</button><button class="btn" data-go="nilai">Lihat Penilaian</button><button class="btn" data-go="menu">Menu Utama</button></div></div>`;
        PP.$('#qAgain').onclick = intro;
        updOnline();
        window.scrollTo(0, 0);
      };
      intro();
    };
    return inst;
  };
})();

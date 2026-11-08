/* =========================================================
   VIDEO ANIMASI · REFLEKSI · PROGRAM PENILAIAN (laporan, CSV, cetak)
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio;
  PP.screens = PP.screens || {};
  const IN_VIEWER = !!window.claude;     // di dalam viewer artifact: unduh/cetak tidak tersedia

  /* =====================================================
     VIDEO
     ===================================================== */
  function ytId(u) { const m = String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/); return m ? m[1] : null; }
  const tm = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';

  PP.screens.video = function () {
    const inst = { timers: [], objUrl: null, unmount() { if (this.objUrl) URL.revokeObjectURL(this.objUrl); } };
    inst.html = `<div class="wrap narrowish"><div class="panel pad"><h2 class="h-title">Video Animasi</h2>
      <div class="chips" id="vTabs">${PP.VIDEOS.map((v, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-i="${i}">Video ${i + 1}</button>`).join('')}</div><div id="vBox"></div></div></div>`;
    inst.mount = function (root) {
      const box = PP.$('#vBox', root); let cur = 0;
      const show = i => {
        cur = i; const v = PP.VIDEOS[i]; PP.$$('#vTabs .chip', root).forEach((c, k) => c.classList.toggle('on', k === i));
        if (inst.objUrl) { URL.revokeObjectURL(inst.objUrl); inst.objUrl = null; }
        const saved = S.data.videoUrls[v.id] || '', src = v.src || saved, yt = ytId(src);
        let stage;
        if (yt) stage = `<div class="vstage"><iframe src="https://www.youtube.com/embed/${yt}" title="${PP.esc(v.title)}" allow="fullscreen" allowfullscreen></iframe></div><p class="small muted">Video YouTube memakai kontrol bawaan YouTube dan membutuhkan koneksi internet.</p>`;
        else if (src) stage = `<div class="vstage"><video id="vid" preload="metadata" playsinline src="${PP.esc(src)}"></video></div>${controls()}<p class="err" id="vErr" hidden>Video tidak dapat dimuat. Periksa nama file atau tautan, lalu coba lagi.</p>`;
        else stage = `<div class="vstage ph"><div class="ph-in">${PP.img('ic_pause', 'ph-ic')}<b>Video belum tersedia</b><p>Guru dapat memasukkan video MP4 atau tautan video di bawah ini.</p></div></div>${controls(true)}`;
        box.innerHTML = `<h3 class="h-sub">${v.title}</h3>${stage}<p>${v.desc}</p>
          <details class="ap-det" ${src ? '' : 'open'}><summary>Masukkan video (untuk guru)</summary>
            <label class="fld">Pilih file MP4 dari perangkat<input type="file" id="vFile" accept="video/mp4,video/webm"></label>
            <p class="small muted">File yang dipilih hanya dipakai pada sesi ini.</p>
            <label class="fld">Atau tempel tautan MP4 / YouTube<input type="url" id="vUrl" placeholder="https://..." value="${PP.esc(saved)}"></label>
            <div class="row"><button class="btn green sm" id="vSave">Simpan tautan</button><button class="btn sm" id="vClear">Hapus tautan</button></div>
            <p class="small muted">Tetap tersimpan: letakkan file di <code>assets/video/</code> lalu isi <code>src</code> pada <code>PP.VIDEOS</code> di <code>js/data.js</code>.</p><p class="err" id="vMsg" hidden></p></details>`;
        const vid = PP.$('#vid', box);
        if (vid) bind(vid);
        PP.$('#vFile', box).onchange = e => {
          const f = e.target.files[0]; if (!f) return;
          if (!/^video\//.test(f.type)) { const m = PP.$('#vMsg', box); m.hidden = false; m.textContent = 'File bukan video. Pilih file MP4.'; return; }
          inst.objUrl = URL.createObjectURL(f); PP.VIDEOS[i]._tmp = inst.objUrl;
          box.querySelector('.vstage').outerHTML = `<div class="vstage"><video id="vid" preload="metadata" playsinline src="${inst.objUrl}"></video></div>`;
          const old = PP.$('.vctl', box); if (old) old.remove();
          PP.$('.vstage', box).insertAdjacentHTML('afterend', controls()); bind(PP.$('#vid', box));
        };
        PP.$('#vSave', box).onclick = () => {
          const u = PP.$('#vUrl', box).value.trim(), m = PP.$('#vMsg', box);
          if (!/^https?:\/\//i.test(u) && !/^assets\//.test(u)) { m.hidden = false; m.textContent = 'Tautan harus diawali https://'; return; }
          S.data.videoUrls[v.id] = u; S.save(); PP.ui.toast('Tautan video tersimpan.'); show(i);
        };
        PP.$('#vClear', box).onclick = () => { delete S.data.videoUrls[v.id]; S.save(); show(i); };
      };
      const controls = dis => `<div class="vctl ${dis ? 'off' : ''}"><button class="btn sm" id="vPlay" ${dis ? 'disabled' : ''} aria-label="Putar">▶</button>
        <input type="range" id="vProg" min="0" max="1000" value="0" ${dis ? 'disabled' : ''} aria-label="Progres video"><span class="small" id="vTime">0:00 / 0:00</span>
        <button class="btn sm" id="vMute" ${dis ? 'disabled' : ''} aria-label="Bisukan">♪</button><input type="range" id="vVol" min="0" max="1" step="0.05" value="0.8" ${dis ? 'disabled' : ''} aria-label="Volume video"></div>`;
      const bind = vid => {
        const $ = id => PP.$(id, box); vid.volume = 0.8;
        $('#vPlay').onclick = () => { vid.paused ? (A.pauseMusicForVideo && A.pauseMusicForVideo(), vid.play().catch(() => {})) : vid.pause(); };
        vid.onplay = () => { $('#vPlay').textContent = '❚❚'; Object.values(A.els).forEach(e => e.pause()); };
        vid.onpause = () => { $('#vPlay').textContent = '▶'; if (A.curId && A.set.master && A.set.musicOn && !A.userPaused) A.playBgm(A.curId); };
        vid.ontimeupdate = () => { $('#vProg').value = vid.duration ? vid.currentTime / vid.duration * 1000 : 0; $('#vTime').textContent = tm(vid.currentTime) + ' / ' + tm(vid.duration); };
        vid.onloadedmetadata = vid.ontimeupdate;
        vid.onerror = () => { const e = $('#vErr'); if (e) e.hidden = false; };
        $('#vProg').oninput = e => { if (vid.duration) vid.currentTime = e.target.value / 1000 * vid.duration; };
        $('#vVol').oninput = e => { vid.volume = +e.target.value; vid.muted = false; $('#vMute').textContent = vid.volume ? '♪' : '✕'; };
        $('#vMute').onclick = () => { vid.muted = !vid.muted; $('#vMute').textContent = vid.muted ? '✕' : '♪'; };
      };
      PP.$('#vTabs', root).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) show(+c.dataset.i); });
      show(0);
    };
    return inst;
  };

  /* =====================================================
     REFLEKSI
     ===================================================== */
  const RQ = ['Apa hal baru yang kamu pelajari?', 'Bagian mana yang paling mudah dipahami?', 'Bagian mana yang masih sulit?', 'Bagaimana penerapan Teorema Pythagoras dalam kehidupan sehari-hari?'];
  PP.screens.refleksi = function () {
    const r = S.data.reflection || { a: ['', '', '', ''], date: 0 };
    return {
      html: `<div class="wrap narrow"><div class="panel pad"><h2 class="h-title">Refleksi Pembelajaran</h2>
        ${PP.guide('Ceritakan dengan kata-katamu sendiri. Tidak ada jawaban yang salah di sini.', 'owl')}
        <form id="rfForm">${RQ.map((q, i) => `<label class="fld">${i + 1}. ${q}<textarea id="rf${i}" rows="3" maxlength="600" placeholder="Tulis jawabanmu di sini">${PP.esc(r.a[i])}</textarea></label>`).join('')}
        <p class="err" id="rfErr" hidden>Isi minimal satu jawaban sebelum menyimpan.</p>
        <p class="small muted" id="rfDate">${r.date ? 'Terakhir disimpan: ' + new Date(r.date).toLocaleString('id-ID') : 'Belum pernah disimpan.'}</p>
        <div class="row center"><button class="btn green" type="submit">Simpan Refleksi</button><button class="btn" type="button" data-go="menu">Menu Utama</button></div></form></div></div>`,
      mount(root) {
        PP.$('#rfForm', root).addEventListener('submit', e => {
          e.preventDefault();
          const a = RQ.map((_, i) => PP.$('#rf' + i, root).value.trim());
          if (!a.some(Boolean)) { PP.$('#rfErr', root).hidden = false; return; }
          PP.$('#rfErr', root).hidden = true;
          const first = !S.data.reflection; S.data.reflection = { a, date: Date.now() }; S.save();
          if (first) { S.award('reflect'); S.addXP(15); }
          PP.$('#rfDate', root).textContent = 'Terakhir disimpan: ' + new Date().toLocaleString('id-ID');
          PP.ui.toast('Refleksi tersimpan. Terima kasih!'); A.sfx('correct');
        });
      }
    };
  };

  /* =====================================================
     PROGRAM PENILAIAN
     ===================================================== */
  const GN = { A: 'Game A · Susun Segitiga', B: 'Game B · Temukan Panjang Sisi', C: 'Game C · Misi Jembatan', D: 'Game D · Tantangan Akhir' };
  function data() {
    const d = S.data, q = d.quiz.best, ql = d.quiz.last, score = S.finalScore();
    return { d, q, ql, score, pr: S.predikat(score) };
  }
  function csv() {
    const { d, q, score, pr } = data(), rows = [];
    const add = (...c) => rows.push(c.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(','));
    add('Laporan Hasil Belajar - Petualangan Pythagoras'); add('Nama', d.name || '-'); add('Kelas', d.kelas || '-'); add('Tanggal cetak', new Date().toLocaleString('id-ID')); add();
    add('Ringkasan'); add('Progres misi', S.doneCount() + ' dari 6'); add('Level', S.level()); add('XP', d.xp); add('Total bintang', S.totalStars() + ' dari ' + S.maxStars());
    add('Nilai akhir', score); add('Predikat', pr.t); add('Jawaban benar (semua aktivitas)', d.tally.correct); add('Jawaban salah (semua aktivitas)', d.tally.wrong); add();
    add('Misi', 'Status', 'Bintang');
    PP.POS.forEach(p => add('Pos ' + p.id + ' ' + p.name, S.missionDone(p.id) ? 'Selesai' : 'Belum', S.missionDone(p.id) ? d.missions[p.id].stars : 0)); add();
    add('Game', 'Skor terbaik', 'Bintang', 'Jumlah main', 'Benar', 'Salah');
    ['A', 'B', 'C', 'D'].forEach(k => { const g = d.games[k]; add(GN[k], g ? g.best : 0, g ? g.stars : 0, g ? g.plays : 0, g ? g.correct : 0, g ? g.wrong : 0); }); add();
    add('Kuis', 'Nilai terbaik', 'Benar', 'Salah', 'Kosong', 'Percobaan'); add('Kuis Interaktif', q ? q.score : '-', q ? q.correct : '-', q ? q.wrong : '-', q ? q.blank : '-', d.quiz.attempts); add();
    add('Lencana', 'Diperoleh'); PP.BADGES.forEach(b => add(b.name, d.badges[b.id] ? 'Ya' : 'Belum'));
    return rows.join('\r\n');
  }
  function fileName() { return 'hasil-belajar-' + (S.data.name || 'siswa').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.csv'; }
  PP.acts['csv-dl'] = () => {
    try {
      const blob = new Blob(['﻿' + csv()], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName(); document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); PP.ui.toast('File CSV diunduh.');
    } catch (e) { PP.ui.toast('Unduhan gagal. Gunakan Salin CSV.', 'x'); }
  };
  PP.acts['csv-copy'] = () => {
    const t = csv();
    const fallback = () => PP.ui.modal(`<h3>Salin laporan CSV</h3><p class="modal-text small">Pilih semua teks di bawah, salin, lalu tempel ke Excel atau Google Sheets.</p><textarea class="csvbox" readonly rows="10">${PP.esc(t)}</textarea><div class="row end"><button class="btn" data-close>Tutup</button></div>`);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => PP.ui.toast('CSV disalin ke clipboard.'), fallback); else fallback();
  };
  PP.acts.print = () => { try { window.print(); } catch (e) { PP.ui.toast('Cetak tidak tersedia di sini.', 'x'); } };

  PP.screens.nilai = function () {
    const { d, q, score, pr } = data(), done = S.doneCount();
    const gr = ['A', 'B', 'C', 'D'].map(k => { const g = d.games[k]; return `<tr><td>${GN[k]}</td><td>${g ? g.best : '-'}</td><td>${g ? PP.stars(g.stars) : '-'}</td><td>${g ? g.correct : 0}</td><td>${g ? g.wrong : 0}</td></tr>`; }).join('');
    return {
      html: `<div class="wrap"><div class="panel pad report" id="report">
        <div class="rp-head"><div class="rp-av">${PP.img(PP.me().idle)}</div><div><h2 class="h-title">Program Penilaian</h2><p><b>${PP.esc(d.name || 'Belum mengisi nama')}</b>${d.kelas ? ' · Kelas ' + PP.esc(d.kelas) : ''}</p><p class="small muted">Petualangan Pythagoras · ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
        ${d.name ? '' : '<p class="err">Nama belum diisi. <button class="btn sm" data-go="profil">Isi Profil</button></p>'}
        <div class="fin-stats"><div><b>${score}</b><span>Nilai Akhir</span></div><div><b>${S.totalStars()}/${S.maxStars()}</b><span>Bintang</span></div><div><b>Lv ${S.level()}</b><span>${d.xp} XP</span></div><div><b>${d.tally.correct}/${d.tally.wrong}</b><span>Benar/Salah</span></div></div>
        <p class="pill big">Predikat: ${pr.t}</p><p>${pr.d}</p>
        <p class="small muted">Nilai akhir = 40% kuis + 40% rata-rata skor game + 20% progres misi.</p>
        <h3 class="h-sub">Progres Petualangan (${done}/6)</h3><div class="bar"><i style="width:${done / 6 * 100}%"></i></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Pos</th><th>Status</th><th>Bintang</th></tr></thead><tbody>${PP.POS.map(p => `<tr><td>${p.id}. ${p.name}</td><td>${S.missionDone(p.id) ? 'Selesai' : S.missionUnlocked(p.id) ? 'Terbuka' : 'Terkunci'}</td><td>${S.missionDone(p.id) ? PP.stars(d.missions[p.id].stars) : '-'}</td></tr>`).join('')}</tbody></table></div>
        <h3 class="h-sub">Skor Game</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Game</th><th>Terbaik</th><th>Bintang</th><th>Benar</th><th>Salah</th></tr></thead><tbody>${gr}</tbody></table></div>
        <h3 class="h-sub">Kuis Interaktif</h3>
        ${q ? `<div class="tbl-wrap"><table class="tbl"><tbody><tr><td>Nilai terbaik</td><td><b>${q.score}</b> (${S.predikat(q.score).t})</td></tr><tr><td>Benar / Salah / Kosong</td><td>${q.correct} / ${q.wrong} / ${q.blank}</td></tr><tr><td>Jumlah percobaan</td><td>${d.quiz.attempts}</td></tr></tbody></table></div>` : '<p class="muted">Kuis belum dikerjakan. <button class="btn sm green" data-go="kuis">Kerjakan Kuis</button></p>'}
        <h3 class="h-sub">Lencana (${Object.keys(d.badges).length}/${PP.BADGES.length})</h3>
        <div class="badges">${PP.BADGES.map(b => `<div class="badge ${d.badges[b.id] ? 'got' : ''}" title="${b.desc}">${PP.img(b.icon)}<b>${b.name}</b><span>${b.desc}</span></div>`).join('')}</div>
        ${d.reflection ? `<h3 class="h-sub">Refleksi</h3><ol class="small">${RQ.map((x, i) => `<li><b>${x}</b><br>${PP.esc(d.reflection.a[i]) || '-'}</li>`).join('')}</ol>` : ''}
      </div>
      <div class="panel pad-s no-print"><div class="row center">${IN_VIEWER ? '' : '<button class="btn green" data-act="print">Cetak Laporan</button><button class="btn blue" data-act="csv-dl">Unduh CSV</button>'}<button class="btn ${IN_VIEWER ? 'blue' : ''}" data-act="csv-copy">Salin CSV</button></div>
        ${IN_VIEWER ? '<p class="small muted center">Cetak dan unduh CSV tersedia pada versi unduhan (ZIP). Di sini gunakan Salin CSV.</p>' : ''}</div></div>`
    };
  };
})();

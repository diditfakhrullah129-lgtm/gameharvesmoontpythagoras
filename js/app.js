/* =========================================================
   INTI APLIKASI: router, HUD, UI helper, efek, dan layar utama
   (pembuka, petunjuk, profil, menu, tujuan, peta, pos, finish)
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio;
  PP.screens = PP.screens || {};
  PP.acts = PP.acts || {};
  PP.ctx = PP.ctx || {};

  /* ---------- helper dasar ---------- */
  PP.img2 = (n, cls, alt) => `<img class="${cls || ''}" src="assets/img2/${n}.png" alt="${alt || ''}" draggable="false">`;
  PP.img = (n, cls, alt) => `<img class="px ${cls || ''}" src="assets/img/${n}.png" alt="${alt || ''}" draggable="false">`;
  PP.esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  PP.$ = (sel, root) => (root || document).querySelector(sel);
  PP.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  PP.AV = {
    boy: { name: 'Budi', idle: 'boy_0', walk: ['boy_1', 'boy_2', 'boy_3', 'boy_4'] },
    girl: { name: 'Sari', idle: 'girl_0', walk: ['girl_1', 'girl_2', 'girl_0'] },
    hijab: { name: 'Aisyah', idle: 'hijab_0', walk: ['hijab_1', 'hijab_0'] }
  };
  PP.me = () => PP.AV[S.data.avatar] || PP.AV.boy;
  PP.nm = () => S.data.name || 'Petualang';
  PP.walk = function (img, frames, ms) {            // animasi jalan sederhana; return fungsi stop
    let i = 0; const idle = frames[frames.length - 1];
    const t = setInterval(() => { i = (i + 1) % frames.length; img.src = `assets/img/${frames[i]}.png`; }, ms || 140);
    return () => { clearInterval(t); img.src = `assets/img/${PP.me().idle}.png`; };
  };
  PP.guide = (text, who) => {
    const owl = who === 'owl';
    return `<div class="guide ${owl ? 'is-owl' : ''}"><div class="guide-pic">${PP.img(owl ? 'owl_0' : 'teacher_0', 'bob')}</div>
      <div class="panel guide-bubble"><b class="guide-name">${owl ? 'Hoo-Pytha' : 'Pak Guru'}</b><p>${text}</p></div></div>`;
  };
  PP.stars = (n, max) => { max = max || 3; let h = '<span class="stars" aria-label="' + n + ' dari ' + max + ' bintang">'; for (let i = 0; i < max; i++) h += PP.img(i < n ? 'star_gold' : 'star_silver', 'st' + (i < n ? '' : ' off')); return h + '</span>'; };
  PP.fmt = n => (Math.round(n * 100) / 100).toString().replace('.', ',');

  /* ---------- toast, modal, konfirmasi ---------- */
  PP.ui = {};
  PP.ui.toast = function (msg, icon) {
    const box = PP.$('#toasts'); if (!box) return;
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = PP.img(icon === 'owl' ? 'owl_2' : icon === 'x' ? 'ic_x' : 'star_gold', 'ti') + '<span>' + PP.esc(msg) + '</span>';
    box.appendChild(el); setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3100);
  };
  PP.ui.modal = function (html, opt) {
    opt = opt || {};
    const m = PP.$('#modal'); m.innerHTML = `<div class="modal-back" data-close></div><div class="modal-card panel ${opt.cls || ''}" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false; document.body.classList.add('modal-open');
    const close = () => { m.hidden = true; m.innerHTML = ''; document.body.classList.remove('modal-open'); opt.onclose && opt.onclose(); };
    m._close = close;
    const f = m.querySelector('button, [tabindex]'); f && f.focus();
    return close;
  };
  PP.ui.close = () => { const m = PP.$('#modal'); if (m && !m.hidden) m._close(); };
  PP.ui.confirm = function (msg, yes, onYes) {
    PP.ui.modal(`<p class="modal-text">${msg}</p><div class="row end"><button class="btn" data-close>Batal</button><button class="btn red" id="cfYes">${yes}</button></div>`);
    PP.$('#cfYes').onclick = () => { PP.ui.close(); onYes(); };
  };

  /* ---------- efek: confetti & ledakan bintang ---------- */
  PP.ui.confetti = function (n) {
    const fx = PP.$('#fx'); const cols = ['#f7b92b', '#43b33f', '#2f7bd8', '#d9473a', '#7a4ad0', '#fff3c4'];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < (n || 44); i++) {
      const p = document.createElement('i'); p.className = 'conf';
      p.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % cols.length]};--dx:${(Math.random() - 0.5) * 160}px;--r:${Math.random() * 720}deg;animation-delay:${Math.random() * 0.5}s;animation-duration:${1.6 + Math.random() * 1.2}s;width:${6 + Math.random() * 6}px;height:${6 + Math.random() * 6}px`;
      fx.appendChild(p); setTimeout(() => p.remove(), 3400);
    }
  };
  PP.ui.missionComplete = function (o) {
    // o: {title, stars, xp, first, next:{label, route}, extra}
    A.sfx('mission'); setTimeout(() => A.sfx('star'), 1200);
    if (o.unlock) setTimeout(() => A.sfx('unlock'), 2600);
    PP.ui.confetti();
    PP.ui.modal(`<div class="reward">
        <div class="reward-chest">${PP.img('chest_open', 'pop')}</div>
        <h2>${o.title || 'Misi Selesai!'}</h2>
        <div class="reward-stars">${PP.stars(o.stars)}</div>
        <p class="modal-text">${PP.pick(PP.MSG.done)}</p>
        ${o.xp ? `<p class="xp-line">+${o.xp} XP</p>` : ''}${o.extra || ''}
        <div class="row center">${(o.actions || []).map(a => `<button class="btn ${a.cls || ''}" data-go="${a.route}" data-close>${a.label}</button>`).join('')}</div></div>`, { cls: 'reward-card' });
  };

  /* ---------- router (hash) ---------- */
  let inst = null, first = true;
  function parse() {
    const h = (location.hash || '').replace(/^#/, '');
    const i = h.indexOf('-');
    return i < 0 ? { name: h || 'splash', arg: '' } : { name: h.slice(0, i), arg: h.slice(i + 1) };
  }
  PP.go = function (route) {
    if (location.hash === '#' + route) render(); else location.hash = route;
  };
  PP.acts.back = () => history.length > 1 ? history.back() : PP.go('menu');
  const TITLES = { menu: 'Menu Utama', tujuan: 'Tujuan Pembelajaran', peta: 'Peta Petualangan', materi: 'Materi Pembelajaran', video: 'Video Animasi', eksplorasi: 'Eksplorasi Pythagoras',
    dunia: 'Peta Dunia', online: 'Main Bersama', jelajah: 'Jelajah Dunia 3D', games: 'Game dan Tantangan', game: 'Game', kuis: 'Kuis Interaktif', refleksi: 'Refleksi', nilai: 'Program Penilaian', petunjuk: 'Petunjuk', profil: 'Profil', pos: 'Pos Petualangan', finish: 'FINISH' };

  function render() {
    const r = parse();
    if (inst && inst.unmount) { try { inst.unmount(); } catch (e) {} }
    A.stopNarration();
    PP.ui.close();
    const fn = PP.screens[r.name] || PP.screens.splash;
    const name = PP.screens[r.name] ? r.name : 'splash';
    let res;
    try { res = fn(r.arg); } catch (e) { console.error(e); res = { html: errorHtml(e) }; }
    const app = PP.$('#app');
    app.className = 'screen scr-' + name;
    app.innerHTML = res.html;
    inst = res;
    document.body.dataset.screen = name;
    PP.$('#hudTitle').textContent = TITLES[name] || '';
    updateHud();
    try { res.mount && res.mount(app, r.arg); } catch (e) { console.error(e); app.innerHTML = errorHtml(e); }
    window.scrollTo(0, 0); app.scrollTop = 0;
    try { PP.fit && PP.fit(app); } catch (e) { console.error(e); }
    const key = name === 'game' ? 'game-' + r.arg : name;
    A.scene_(key);
    if (!first) A.sfx('page');
    first = false;
  }
  function errorHtml(e) {
    return `<div class="panel pad"><h2>Ups, ada kendala</h2><p>Halaman ini tidak dapat dimuat. Silakan kembali ke menu.</p><p class="muted small">${PP.esc(e && e.message)}</p><button class="btn green" data-go="menu">Ke Menu Utama</button></div>`;
  }

  /* ---------- HUD ---------- */
  function updateHud() {
    const me = PP.me();
    PP.$('#hudPlayer').innerHTML = `<span class="hud-av">${PP.img(me.idle)}</span><span class="hud-name">${PP.esc(PP.nm())}</span>`;
    PP.$('#hudLv').textContent = 'Lv ' + S.level();
    PP.$('#hudXp').style.width = (S.xpInLevel() / S.XP_PER_LEVEL * 100) + '%';
    PP.$('#hudStars').textContent = S.totalStars();
    PP.$('#hud').hidden = ['splash', 'jelajah', 'dunia'].includes(document.body.dataset.screen);
  }
  S.onChange(() => { try { updateHud(); } catch (e) {} });

  /* ---------- panel audio ---------- */
  function audioPanel() {
    const s = A.set, c = A.cfg.tracks;
    const cur = A.curId && c[A.curId];
    const rows = Object.keys(c).map(id => {
      const st = A.status[id];
      const lab = st === 'file' ? 'file' : st === 'synth' ? 'sintetis' : st === 'error' ? 'gagal dimuat' : 'belum ada';
      return `<li class="st-${st}"><span>${id}</span><em>${lab}</em></li>`;
    }).join('');
    return `<div class="ap-head"><b>Pengaturan Suara</b><button class="x-btn" data-act="audio-close" aria-label="Tutup">×</button></div>
      <div class="ap-now"><span class="eq ${A.isPlaying() ? 'on' : ''}"><i></i><i></i><i></i><i></i></span>
        <span class="ap-track">${A.isPlaying() && cur ? 'Memutar: ' + (cur.use.split(',')[0]) : (A.userPaused ? 'Musik dijeda' : 'Musik tidak diputar')}</span></div>
      <div class="ap-btns">
        <button class="btn sm ${A.userPaused ? 'green' : ''}" data-act="music-toggle">${A.userPaused ? '▶ Putar' : '❚❚ Jeda'}</button>
        <button class="btn sm ${s.master ? '' : 'red'}" data-act="master-toggle">${s.master ? 'Suara: ON' : 'Suara: MUTE'}</button>
        <button class="btn sm ${s.sfxOn ? '' : 'red'}" data-act="sfx-toggle">Efek: ${s.sfxOn ? 'ON' : 'OFF'}</button></div>
      <label class="ap-row">Musik <input type="range" min="0" max="1" step="0.05" value="${s.music}" data-vol="music"></label>
      <label class="ap-row">Efek <input type="range" min="0" max="1" step="0.05" value="${s.sfx}" data-vol="sfx"></label>
      <label class="ap-row">Narasi <input type="range" min="0" max="1" step="0.05" value="${s.narr}" data-vol="narr"></label>
      <details class="ap-det"><summary>Status file audio</summary><ul>${rows}</ul>
        <p class="small muted">Tambah audio: simpan di <code>assets/audio/</code>, lalu ubah <code>available: true</code> di <code>js/audio-config.js</code>.</p></details>`;
  }
  function refreshAudioUi() {
    const p = PP.$('#audioPanel');
    if (p && !p.hidden && !p.contains(document.activeElement)) p.innerHTML = audioPanel();
    PP.$('#audioBtn').classList.toggle('playing', A.isPlaying());
    PP.$('#audioBtn').classList.toggle('muted', !A.set.master);
    PP.$('#audioHint').hidden = A.isPlaying() || !A.set.master || A.userPaused || !!localStorage.getItem('pp_hint_seen') || !A.curId || !A.hasFile(A.curId);
  }
  A.on(refreshAudioUi);
  PP.acts['audio-toggle'] = () => { const p = PP.$('#audioPanel'); p.hidden = !p.hidden; p.innerHTML = audioPanel(); };
  PP.acts['audio-close'] = () => { PP.$('#audioPanel').hidden = true; };
  PP.acts['music-toggle'] = () => { A.unlock(); A.toggleMusic(); PP.$('#audioPanel').innerHTML = audioPanel(); };
  PP.acts['master-toggle'] = () => { A.setMaster(!A.set.master); PP.$('#audioPanel').innerHTML = audioPanel(); };
  PP.acts['sfx-toggle'] = () => { A.setSfx(!A.set.sfxOn); PP.$('#audioPanel').innerHTML = audioPanel(); };
  document.addEventListener('input', e => {
    const v = e.target.dataset && e.target.dataset.vol;
    if (v) A.setVol(v, parseFloat(e.target.value));
  });
  document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.vol && e.target.dataset.vol === 'sfx') A.sfx('click'); });

  /* ---------- delegasi klik ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-go],[data-act],[data-close],button,.btn');
    if (!t) return;
    if (t.matches('[data-close]')) { if (t.classList.contains('modal-back') || t.tagName === 'BUTTON') { if (!t.dataset.go) PP.ui.close(); else setTimeout(PP.ui.close, 0); } }
    if (!t.classList.contains('nosfx') && !(t.dataset.act && /^audio|vol/.test(t.dataset.act))) A.sfx('click');
    if (t.dataset.act && PP.acts[t.dataset.act]) { e.preventDefault(); PP.acts[t.dataset.act](t, e); }
    if (t.dataset.go) { e.preventDefault(); PP.go(t.dataset.go); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { PP.ui.close(); PP.acts['audio-close'](); } });
  window.addEventListener('hashchange', render);
  window.addEventListener('pointerdown', () => { try { localStorage.setItem('pp_hint_seen', '1'); } catch (e) {} PP.$('#audioHint').hidden = true; }, { once: true });

  /* =====================================================
     LAYAR: PEMBUKA
     ===================================================== */
  /* Latar dunia berlapis (langit, gunung, bukit, pohon, semak). Dipakai pembuka & menu.
     Semua gambar beresolusi tinggi dan diskalakan halus (tanpa pecah-pecah). */
  PP.scene = function (kind) {
    const big = kind === 'splash';
    const mtn = `<svg class="sc-mtn" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 200V120Q80 60 170 110T330 90Q420 30 520 100T700 80Q800 20 900 90T1100 70Q1160 50 1200 80V200Z" fill="#9fc7e8"/>
      <path d="M0 200V150Q100 100 200 140T400 120Q500 80 600 140T820 120Q940 90 1040 140T1200 130V200Z" fill="#7fb6a8"/></svg>`;
    return `<div class="scene ${big ? 'is-splash' : 'is-menu'}" aria-hidden="true">
      <div class="sc-sky"></div><div class="sc-sun"></div>
      <div class="cloud k1"></div><div class="cloud k2"></div><div class="cloud k3"></div>
      ${mtn}
      <div class="sc-hill"></div>
      <div class="sc-mid">${PP.img2('g_windmill', 'sc-windmill')}${PP.img2('g_mosque', 'sc-mosque')}${PP.img2('m_house', 'sc-house')}</div>
      <div class="sc-trees">${PP.img2('m_tree1', 'sway tr1')}${PP.img2('m_cherry', 'sway tr2')}${PP.img2('g_oak1', 'sway tr3')}${PP.img2('m_orange', 'sway tr4')}</div>
      <div class="sc-fore">${PP.img2('m_bushes', 'fb1')}${PP.img2('m_bush1', 'fb2')}${PP.img2('m_bush2', 'fb3')}${PP.img2('g_flowers', 'fb4')}${PP.img2('m_bush3', 'fb5')}</div>
      <img class="sc-spark" src="assets/img2/sparkles.gif" alt="" draggable="false">
    </div>`;
  };

  PP.screens.splash = function () {
    const me = PP.me();
    const has = S.doneCount() > 0 || S.data.name;
    return {
      html: `<div class="splash">${PP.scene('splash')}
        <div class="sp-owl">${PP.img('owl_0', '', 'Burung hantu pemandu')}</div>
        <div class="sp-main">
          <h1 class="sp-logo"><span class="sr-only">Petualangan Pythagoras</span>${PP.img('logo', 'logo-img float', 'Petualangan Pythagoras')}</h1>
          <p class="sp-sub">Matematika SMP/MTs · Teorema Pythagoras</p>
          <div class="speech" id="spSpeech">Halo, petualang matematika!</div>
          <div class="sp-btns">
            <button class="btn xl green pulse" data-act="start"><span class="tri">▶</span> MULAI PETUALANGAN</button>
            <div class="row center">
              <button class="btn blue sm" data-go="petunjuk">${PP.img2('m_book', 'bi')} Petunjuk</button>
              <button class="btn purple sm" data-go="profil">${PP.img2('m_star', 'bi')} Profil</button>
              <button class="btn sm" data-go="nilai">${PP.img2('g_trophy', 'bi')} Prestasi</button>
              <button class="btn sm" data-act="audio-toggle">${PP.img2('m_gear', 'bi')} Suara</button>
            </div>
          </div>
        </div>
        ${has ? `<p class="sp-hello">Selamat datang kembali, <b>${PP.esc(PP.nm())}</b>!</p>` : ''}
      </div>`,
      mount(root) {
        const owl = PP.$('.sp-owl img', root); let i = 0; const fr = ['owl_0', 'owl_1', 'owl_2', 'owl_1'];
        const t1 = setInterval(() => { i = (i + 1) % fr.length; owl.src = `assets/img/${fr[i]}.png`; }, 420);
        const lines = ['Halo, petualang matematika!', 'Ayo kita temukan rahasia Pythagoras!', 'Siap menjelajah enam pos misi?', 'Jangan menyerah, kamu pasti bisa!'];
        let k = 0; const sp = PP.$('#spSpeech', root);
        const t2 = setInterval(() => { k = (k + 1) % lines.length; sp.textContent = lines[k]; }, 3600);
        this._t = [t1, t2];
      },
      unmount() { (this._t || []).forEach(clearInterval); }
    };
  };
  PP.acts.start = () => {
    A.unlock(); A.sfx('start');
    if (!S.data.name) { PP.ctx.afterProfile = 'menu'; PP.go('profil'); } else PP.go('menu');
  };

  /* =====================================================
     LAYAR: PETUNJUK
     ===================================================== */
  PP.screens.petunjuk = function () {
    const items = [
      ['ic_pin', 'Jelajahi Peta', 'Mulai dari Pos 1. Pos berikutnya terkunci sampai misi sebelumnya selesai.'],
      ['ic_book', 'Pelajari Materi', 'Setiap pos berisi materi singkat dengan gambar interaktif. Baca dulu, lalu tantang dirimu.'],
      ['ic_game', 'Kerjakan Misi', 'Jawab soal atau mainkan game. Dapatkan 1 sampai 3 bintang sesuai hasilmu.'],
      ['ic_star', 'Kumpulkan XP dan Bintang', 'Setiap jawaban benar dan misi selesai menambah XP, naik level, dan membuka lencana.'],
      ['ic_vol_on', 'Atur Suara', 'Tekan tombol speaker di pojok kanan atas untuk mengatur musik, efek, dan narasi.'],
      ['ic_trophy', 'Capai FINISH', 'Selesaikan keenam pos, lalu lihat hasil belajarmu di Program Penilaian.']
    ];
    return { html: `<div class="wrap"><div class="panel pad">
      <h2 class="h-title">Petunjuk Permainan</h2>
      ${PP.guide('Halo, ' + PP.esc(PP.nm()) + '! Ini cara bermain Petualangan Pythagoras. Ayo kita mulai!')}
      <ol class="how">${items.map((x, i) => `<li><span class="how-ic">${PP.img(x[0])}</span><div><b>${x[1]}</b><p>${x[2]}</p></div></li>`).join('')}</ol>
      <div class="row center"><button class="btn green" data-act="start">MULAI PETUALANGAN</button><button class="btn" data-go="splash">Kembali</button></div></div></div>` };
  };

  /* =====================================================
     LAYAR: PROFIL
     ===================================================== */
  PP.screens.profil = function () {
    const d = S.data;
    return {
      html: `<div class="wrap narrow"><div class="panel pad">
        <h2 class="h-title">Profil Penjelajah</h2>
        ${PP.guide('Siapa namamu, petualang? Pilih juga karakter yang akan menemanimu.')}
        <form id="pfForm" autocomplete="off">
          <label class="fld">Nama peserta didik<input id="pfName" maxlength="40" value="${PP.esc(d.name)}" placeholder="Tulis namamu" required></label>
          <label class="fld">Kelas (opsional)<input id="pfKelas" maxlength="20" value="${PP.esc(d.kelas)}" placeholder="Contoh: VIII A"></label>
          <fieldset class="avs"><legend>Pilih karakter</legend>
            ${Object.keys(PP.AV).map(k => `<label class="av ${d.avatar === k ? 'on' : ''}"><input type="radio" name="av" value="${k}" ${d.avatar === k ? 'checked' : ''}>${PP.img(PP.AV[k].idle)}<span>${PP.AV[k].name}</span></label>`).join('')}
          </fieldset>
          <p class="err" id="pfErr" hidden>Nama belum diisi. Tulis namamu dulu ya.</p>
          <div class="row center"><button class="btn green" type="submit">Simpan Profil</button><button class="btn" type="button" data-act="back">Kembali</button></div>
        </form>
        <hr class="sep">
        <details class="ap-det"><summary>Data dan progres</summary>
          <p class="small">Level ${S.level()} · ${d.xp} XP · ${S.doneCount()}/6 misi selesai · ${S.totalStars()} bintang.</p>
          <button class="btn red sm" data-act="reset-ask">Hapus Semua Progres</button>
        </details>
        ${S.ok ? '' : '<p class="err">Penyimpanan lokal tidak tersedia di browser ini. Progres tidak akan tersimpan setelah halaman ditutup.</p>'}
      </div></div>`,
      mount(root) {
        PP.$$('input[name=av]', root).forEach(r => r.addEventListener('change', () => { PP.$$('.av', root).forEach(l => l.classList.toggle('on', l.querySelector('input').checked)); }));
        PP.$('#pfForm', root).addEventListener('submit', e => {
          e.preventDefault();
          const n = PP.$('#pfName').value.trim();
          if (!n) { PP.$('#pfErr').hidden = false; PP.$('#pfName').focus(); return; }
          S.data.name = n; S.data.kelas = PP.$('#pfKelas').value.trim();
          S.data.avatar = (PP.$('input[name=av]:checked', root) || {}).value || 'boy';
          S.save(); PP.ui.toast('Profil tersimpan. Selamat datang, ' + n + '!');
          const nxt = PP.ctx.afterProfile; PP.ctx.afterProfile = null; PP.go(nxt || 'menu');
        });
      }
    };
  };
  PP.acts['reset-ask'] = () => PP.ui.confirm('Semua progres, nilai, dan pengaturan profil akan dihapus. Lanjutkan?', 'Ya, hapus', () => { S.reset(); PP.ui.toast('Progres dihapus.'); PP.go('splash'); });

  /* =====================================================
     LAYAR: MENU UTAMA
     ===================================================== */
  PP.screens.menu = function () {
    const cards = [
      ['tujuan', 'Tujuan Pembelajaran', 'Apa yang akan kamu kuasai', 'm_star', 'a1'],
      ['peta', 'Peta Petualangan', 'Enam pos menuju FINISH', 'm_pin', 'a2'],
      ['materi', 'Materi Pembelajaran', 'Konsep, contoh, penerapan', 'm_book', 'a3'],
      ['video', 'Video Animasi', 'Tonton penjelasan bergerak', 'g_play', 'a4'],
      ['eksplorasi', 'Eksplorasi Pythagoras', 'Ubah sisi, lihat luasnya', 'm_gear', 'a5'],
      ['games', 'Game dan Tantangan', 'Empat permainan seru', 'm_gift', 'a6'],
      ['kuis', 'Kuis Interaktif', '15 soal + pembahasan', 'm_help', 'a7'],
      ['refleksi', 'Refleksi', 'Ceritakan yang kamu pelajari', 'm_heart', 'a8'],
      ['nilai', 'Program Penilaian', 'Skor, bintang, laporan', 'g_trophy', 'a9']
    ];
    const next = S.nextMission(), dn = S.doneCount();
    const msg = dn === 0 ? 'Pilih menu, atau mulai dari Peta Petualangan.' : dn === 6 ? 'Semua pos selesai! Lihat hasilmu di Penilaian.' : 'Kamu sudah menyelesaikan ' + dn + ' dari 6 pos.';
    return { html: `<div class="wrap nofit menu-wrap">${PP.scene('menu')}
      <div class="mn-top">
        <div class="mn-owl">${PP.img('owl_0', 'bob', 'Hoo-Pytha')}</div>
        <div class="mn-say"><b>Halo, ${PP.esc(PP.nm())}!</b><span>${msg}</span></div>
        <div class="mn-prog"><span class="pill">${dn}/6 pos</span><div class="bar"><i style="width:${dn / 6 * 100}%"></i></div></div>
        <div class="mn-btns"><button class="btn green mn-cta" data-go="${next ? 'jelajah-' + next : 'finish'}"><span class="tri">▶</span> ${dn === 0 ? 'Jelajah Dunia 3D' : next ? 'Lanjut Jelajah' : 'FINISH'}</button>
        <button class="btn blue mn-onl" data-go="online">🏆 Papan Skor</button></div>
      </div>
      <div class="mn-grid">${cards.map((c, i) => `<button class="mtile ${c[4]}" data-go="${c[0]}" style="--i:${i}"><span class="mt-ic">${PP.img2(c[3])}</span><span class="mt-tx"><b>${c[1]}</b><small>${c[2]}</small></span></button>`).join('')}</div>
    </div>` };
  };

  /* =====================================================
     LAYAR: TUJUAN PEMBELAJARAN
     ===================================================== */
  PP.screens.tujuan = function () {
    return { html: `<div class="wrap"><div class="panel pad">
      <h2 class="h-title">Tujuan Pembelajaran</h2>
      <p>Setelah mengikuti pembelajaran ini, kamu diharapkan mampu:</p>
      <ol class="goals">${PP.TUJUAN.map((g, i) => `<li style="--i:${i}"><span class="g-n">${i + 1}</span><span class="g-ic">${PP.img(g.icon)}</span><div><b>${g.t}</b><p>${g.d}</p></div></li>`).join('')}</ol>
      <div class="row center"><button class="btn green" data-go="peta">Ke Peta Petualangan</button><button class="btn" data-go="materi">Buka Materi</button></div></div></div>` };
  };

  /* =====================================================
     LAYAR: PETA PETUALANGAN
     ===================================================== */
  const NODES = [
    { x: 110, y: 780, w: 150, spr: ['portal'] },
    { x: 340, y: 744, w: 120, spr: ['pine_c', 'tree_pink', 'pine_c'] },
    { x: 590, y: 774, w: 190, spr: ['school'] },
    { x: 840, y: 694, w: 150, spr: ['windmill'] },
    { x: 1090, y: 738, w: 130, spr: ['bridge'] },
    { x: 1310, y: 672, w: 220, spr: ['castle'] }
  ];
  const FIN = { x: 1495, y: 690, w: 190 };
  const pc = (v, t) => (v / t * 100).toFixed(3) + '%';

  PP.screens.peta = function () {
    const done = S.doneCount(), next = S.nextMission(), allDone = done === 6;
    const me = PP.me();
    const pos = next ? NODES[next - 1] : FIN;
    let h = `<div class="wrap wide nofit peta-wrap">
      <div class="map-top panel pad-s"><div class="mt-l"><b>Peta Petualangan</b><div class="bar"><i style="width:${done / 6 * 100}%"></i></div></div>
        <span class="pill">${done}/6 pos</span><span class="pill">${PP.img('star_gold', 'pi')} ${S.totalStars()}</span>
        <button class="btn green sm" data-act="continue">${allDone ? 'Menuju FINISH' : done === 0 ? 'Mulai Petualangan' : 'Lanjutkan Petualangan'}</button></div>
      <div class="map-scroll" id="mapScroll"><div class="map" id="map">
        ${PP.scene('menu')}
        <svg class="map-path" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><path id="trail" d="${trailPath()}"/></svg>`;
    NODES.forEach((n, i) => {
      const id = i + 1, p = PP.POS[i], dn = S.missionDone(id), lk = !S.missionUnlocked(id), st = dn ? S.data.missions[id].stars : 0;
      h += `<button class="node ${dn ? 'done' : ''} ${lk ? 'locked' : ''} ${next === id ? 'current' : ''}" data-act="pos-open" data-id="${id}" style="left:${pc(n.x, 1600)};top:${pc(n.y, 900)};width:${pc(n.w, 1600)}" aria-label="Pos ${id}: ${p.name}${lk ? ' (terkunci)' : ''}">
        <span class="node-spr ${n.spr.length > 1 ? 'multi' : ''}">${n.spr.map(s => PP.img(s)).join('')}</span>
        <span class="node-tag"><b>${id}</b>${lk ? lockSvg() : ''}<em>${p.name}</em></span>
        <span class="node-stars">${dn ? PP.stars(st) : ''}</span></button>`;
    });
    h += `<button class="node fin ${allDone ? 'current' : 'locked'}" data-act="finish-open" style="left:${pc(FIN.x, 1600)};top:${pc(FIN.y, 900)};width:${pc(FIN.w, 1600)}" aria-label="FINISH${allDone ? '' : ' (terkunci)'}">
        <span class="node-spr">${PP.img('finish')}</span><span class="node-tag"><b>★</b>${allDone ? '' : lockSvg()}<em>FINISH</em></span></button>`;
    h += `<div class="player" id="player" style="left:${pc(pos.x - 20, 1600)};top:${pc(pos.y + 16, 900)}">${PP.img(me.idle, '', 'Posisi pemain')}<span class="shadow"></span></div>
      </div></div>
      <div class="pos-list">${PP.POS.map(p => {
        const dn = S.missionDone(p.id), lk = !S.missionUnlocked(p.id), st = dn ? S.data.missions[p.id].stars : 0;
        return `<div class="pos-card panel pad-s ${lk ? 'locked' : ''} ${dn ? 'done' : ''}"><div class="pc-pic">${PP.img(NODES[p.id - 1].spr[0])}</div>
          <div class="pc-body"><b>Pos ${p.id} · ${p.name}</b><p>${p.mission}</p>${dn ? PP.stars(st) : `<span class="muted small">${lk ? 'Terkunci. Selesaikan Pos ' + (p.id - 1) + ' dulu.' : 'Belum selesai'}</span>`}</div>
          <button class="btn ${lk ? 'dis' : dn ? '' : 'green'} sm" ${lk ? 'disabled' : ''} data-go="pos-${p.id}">${lk ? 'Terkunci' : dn ? 'Ulangi' : 'Masuk'}</button></div>`;
      }).join('')}</div></div>`;
    return {
      html: h,
      mount(root) {
        const sc = PP.$('#mapScroll', root), pl = PP.$('#player img', root);
        const cur = PP.$('.node.current', root);
        if (cur && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = cur.offsetLeft - sc.clientWidth / 2;
        this._stop = PP.walk(pl, me.walk, 160);
        const t = setTimeout(() => { this._stop && this._stop(); this._stop = null; PP.$('#player', root) && PP.$('#player', root).classList.add('idle'); }, 1200);
        this._t = t;
        PP.$('#player', root).classList.add('arrive');
      },
      unmount() { this._stop && this._stop(); clearTimeout(this._t); }
    };
  };
  function trailPath() {
    const pts = NODES.map(n => [n.x, n.y + 8]).concat([[FIN.x, FIN.y + 6]]);
    let d = 'M0,800 L' + pts[0][0] + ',' + pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2;
      d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
    return d;
  }
  function lockSvg() { return '<svg class="lock" viewBox="0 0 12 14" aria-hidden="true"><rect x="1" y="6" width="10" height="8" fill="#5e3716"/><path d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="#5e3716" stroke-width="2"/><rect x="5" y="8" width="2" height="3" fill="#f7b92b"/></svg>'; }

  PP.acts.continue = () => { const n = S.nextMission(); PP.go(n ? 'pos-' + n : 'finish'); };
  PP.acts['finish-open'] = () => {
    if (S.doneCount() === 6) PP.go('finish');
    else PP.ui.modal(`<h3>FINISH masih terkunci</h3><p class="modal-text">Selesaikan keenam pos terlebih dahulu. Sekarang kamu baru menyelesaikan ${S.doneCount()} pos.</p><div class="row end"><button class="btn green" data-act="continue" data-close>Lanjutkan Petualangan</button></div>`);
  };
  PP.acts['pos-open'] = (el) => {
    const id = +el.dataset.id, p = PP.POS[id - 1], lk = !S.missionUnlocked(id), dn = S.missionDone(id);
    A.sfx('selectPos');
    PP.ui.modal(`<div class="pos-modal"><div class="pm-pic">${NODES[id - 1].spr.map(s => PP.img(s)).join('')}</div>
      <h3>Pos ${id} · ${p.name}</h3><p class="modal-text"><b>Misi:</b> ${p.mission}</p>
      ${lk ? `<p class="err">Terkunci. Selesaikan Pos ${id - 1} terlebih dahulu.</p>` : `<p class="modal-text">${p.intro}</p>`}
      ${dn ? PP.stars(S.data.missions[id].stars) : ''}
      <div class="row end"><button class="btn" data-close>Tutup</button>${lk ? '' : `<button class="btn green" data-go="pos-${id}" data-close>${dn ? 'Ulangi Misi' : 'MASUK'}</button>`}</div></div>`);
  };

  /* =====================================================
     LAYAR: POS (misi)
     ===================================================== */
  PP.screens.pos = function (arg) {
    const id = parseInt(arg, 10), p = PP.POS[id - 1];
    if (!p) return { html: errorHtml({ message: 'Pos tidak ditemukan.' }) };
    if (!S.missionUnlocked(id)) {
      return { html: `<div class="wrap narrow"><div class="panel pad center"><h2 class="h-title">Pos ${id} masih terkunci</h2><p>Selesaikan Pos ${id - 1} terlebih dahulu untuk membuka ${p.name}.</p><button class="btn green" data-go="pos-${id - 1}">Ke Pos ${id - 1}</button> <button class="btn" data-go="peta">Kembali ke Peta</button></div></div>` };
    }
    PP.ctx.mission = id;
    const dn = S.missionDone(id);
    const lessons = p.materi.map(m => PP.materiPage(m, true));
    let challenge = '';
    if (p.kind === 'quick') {
      challenge = `<section class="panel pad challenge" id="chal"><h3 class="h-sub">Tantangan Pos ${id}</h3>
        <p>Jawab 3 pertanyaan. Kamu perlu minimal 2 jawaban benar untuk menyelesaikan misi.</p><div id="qbox"><button class="btn green" data-act="quick-start">Mulai Tantangan</button></div></section>`;
    } else {
      const names = { A: 'Susun Segitiga', B: 'Temukan Panjang Sisi', C: 'Misi Jembatan', D: 'Tantangan Akhir' };
      challenge = `<section class="panel pad challenge"><h3 class="h-sub">Tantangan Pos ${id}: Game ${p.game}</h3>
        <p>Mainkan <b>${names[p.game]}</b> dan raih minimal 1 bintang (skor 50 atau lebih) untuk menyelesaikan misi.</p>
        <button class="btn green" data-go="game-${p.game}">Mainkan Game ${p.game}</button></section>`;
    }
    const html = `<div class="wrap">
      <div class="pos-head panel pad-s"><div class="pc-pic big">${PP.img(NODES[id - 1].spr[0])}</div>
        <div><span class="pill">Pos ${id} dari 6</span><h2 class="h-title">${p.name}</h2><p>${p.mission}</p>${dn ? PP.stars(S.data.missions[id].stars) + ' <span class="pill ok">Selesai</span>' : ''}</div></div>
      ${PP.guide(p.intro)}
      ${lessons.map(l => l.html).join('')}
      ${challenge}
      <div class="row center"><button class="btn" data-go="peta">Kembali ke Peta</button></div></div>`;
    return {
      html,
      mount(root) {
        lessons.forEach(l => l.mount && l.mount(root));
        PPAudio.voice('character_mission');
      }
    };
  };

  /* --- tantangan cepat (Pos 1 & 3) --- */
  PP.acts['quick-start'] = () => {
    const p = PP.POS[PP.ctx.mission - 1], qs = PP.QUICK[p.pts];
    let i = 0, ok = 0;
    const box = PP.$('#qbox');
    const show = () => {
      const q = qs[i];
      box.innerHTML = `<div class="qq"><p class="q-prog">Pertanyaan ${i + 1} dari ${qs.length}</p><h4>${q.q}</h4>
        <div class="opts">${q.o.map((o, k) => `<button class="opt" data-k="${k}"><span class="ol">${'ABCD'[k]}</span>${o}</button>`).join('')}</div><div id="qfb"></div></div>`;
      PP.$$('.opt', box).forEach(b => b.onclick = () => {
        if (b.disabled) return;
        const k = +b.dataset.k, right = k === q.a;
        PP.$$('.opt', box).forEach(x => x.disabled = true);
        b.classList.add(right ? 'right' : 'wrong'); PP.$$('.opt', box)[q.a].classList.add('right');
        S.tallyAnswer(right); if (right) { ok++; S.addXP(5); }
        A.sfx(right ? 'correct' : 'wrong');
        PP.$('#qfb').innerHTML = `<div class="fb ${right ? 'ok' : 'no'}">${PP.img('owl_' + (right ? 2 : 0), 'fbi')}<div><b>${PP.pick(right ? PP.MSG.right : PP.MSG.wrong)}</b><p>${q.e}</p></div></div>
          <button class="btn green" id="qnext">${i + 1 < qs.length ? 'Lanjut' : 'Lihat Hasil'}</button>`;
        PP.$('#qnext').onclick = () => { i++; i < qs.length ? show() : finish(); };
      });
    };
    const finish = () => {
      if (ok >= 2) {
        const stars = ok === 3 ? 3 : 2, firstTime = S.completeMission(p.id, stars);
        box.innerHTML = `<div class="fb ok">${PP.img('owl_2', 'fbi')}<div><b>Misi selesai! ${ok} dari ${qs.length} benar.</b><p>Kamu mendapat ${stars} bintang.</p></div></div>`;
        const nextId = p.id < 6 ? 'pos-' + (p.id + 1) : 'finish';
        PP.ui.missionComplete({ title: p.name + ' selesai!', stars, xp: firstTime ? 50 + 10 * stars : 0, unlock: firstTime && p.id < 6,
          actions: [{ label: 'Ke Peta', route: 'peta' }, { label: 'Pos Berikutnya', route: nextId, cls: 'green' }] });
      } else {
        box.innerHTML = `<div class="fb no">${PP.img('owl_0', 'fbi')}<div><b>${ok} dari ${qs.length} benar.</b><p>Perlu minimal 2 benar. Baca lagi materinya lalu coba lagi. Kamu pasti bisa!</p></div></div><button class="btn green" data-act="quick-start">Coba Lagi</button>`;
        A.sfx('end');
      }
    };
    show();
  };

  /* =====================================================
     LAYAR: FINISH
     ===================================================== */
  PP.screens.finish = function () {
    if (S.doneCount() < 6) {
      return { html: `<div class="wrap narrow"><div class="panel pad center"><h2 class="h-title">FINISH belum terbuka</h2><p>Selesaikan keenam pos dulu. Baru ${S.doneCount()} pos yang selesai.</p><button class="btn green" data-act="continue">Lanjutkan Petualangan</button></div></div>` };
    }
    const firstTime = S.award('finish');
    if (!S.data.finish) { S.data.finish = true; S.save(); }
    const pr = S.predikat(S.finalScore());
    return {
      html: `<div class="wrap narrow"><div class="panel pad center finish">
        <div class="fin-banner">${PP.img('finish', 'float')}</div>
        <h2 class="h-title">Selamat, ${PP.esc(PP.nm())}!</h2>
        <p>Kamu berhasil menaklukkan semua pos dan mencapai garis FINISH.</p>
        <div class="fin-chest">${PP.img('chest_open', 'pop')}</div>
        <div class="fin-stats"><div><b>${S.totalStars()}</b><span>Bintang</span></div><div><b>Lv ${S.level()}</b><span>Level</span></div><div><b>${S.data.xp}</b><span>XP</span></div><div><b>${S.finalScore()}</b><span>Nilai Akhir</span></div></div>
        <p class="pill big">Predikat: ${pr.t}</p>
        ${PP.guide('Hebat! Kamu berhasil menyelesaikan petualangan! Lanjutkan dengan kuis dan refleksi untuk melengkapi nilaimu.')}
        <div class="row center"><button class="btn green" data-go="nilai">Lihat Hasil Belajar</button><button class="btn" data-go="kuis">Kerjakan Kuis</button><button class="btn" data-go="menu">Menu Utama</button></div></div></div>`,
      mount() { setTimeout(() => { A.sfx('victory'); PP.ui.confetti(70); }, 300); }
    };
  };

  /* ---------- inisialisasi ---------- */
  function boot() {
    S.load();
    PP.$('#audioBtn').addEventListener('click', () => PP.acts['audio-toggle']());
    PP.$('#hudHome').addEventListener('click', () => PP.go('menu'));
    PP.$('#hudBack').addEventListener('click', () => PP.acts.back());
    render();
    A.on(() => {});
  }
  window.addEventListener('error', e => { try { PP.ui.toast('Terjadi kesalahan kecil. Coba lagi.', 'x'); } catch (_) {} });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

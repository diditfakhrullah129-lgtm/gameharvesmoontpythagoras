/* =========================================================
   FIT — tata letak SATU HALAMAN tanpa scroll
   Setiap layar dibuat muat dalam satu layar perangkat. Jika isi layar
   lebih panjang dari tinggi layar, isi dibagi otomatis menjadi
   beberapa "halaman" kecil yang berpindah lewat tombol  ◀ ▶,
   titik halaman, atau geser jari ke kiri/kanan.
   Kelas  .nofit  pada elemen .wrap = layar mengatur dirinya sendiri.
   Kelas  .nosplit pada sebuah blok = blok tidak dipecah.
   ========================================================= */
(function () {
  const PP = window.PP;
  const HID = 'fit-h';
  let st = null;

  function cleanup() {
    if (!st) return;
    st.mo && st.mo.disconnect();
    window.removeEventListener('resize', st.onResize);
    st.pager && st.pager.remove();
    st.box && st.box.removeEventListener('touchstart', st.ts);
    st.box && st.box.removeEventListener('touchend', st.te);
    st.hidden.forEach(e => e.classList.remove(HID));
    st = null;
  }

  function kids(el) {
    return Array.from(el.children).filter(c => {
      if (c.classList.contains('fit-skip')) return false;
      const cs = getComputedStyle(c);
      return cs.display !== 'none' && cs.position !== 'fixed' && cs.position !== 'absolute';
    });
  }

  PP.fit = function (app) {
    cleanup();
    const box = app.querySelector(':scope > .wrap');
    if (!box || box.classList.contains('nofit')) return;
    let cont = box;
    for (let d = 0; d < 3; d++) {
      const k = kids(cont);
      if (k.length === 1 && !k[0].classList.contains('nosplit') && k[0].children.length > 1) cont = k[0]; else break;
    }
    const pager = document.createElement('nav');
    pager.className = 'pager'; pager.setAttribute('aria-label', 'Halaman');
    pager.hidden = true;
    app.appendChild(pager);
    st = { app, box, cont, pager, page: 0, pages: [], hidden: new Set(), busy: false, last: null };

    function leafPages() {
      // kembalikan [{leaf:[el...], flat:Map}] setelah memecah blok yang terlalu tinggi
      st.hidden.forEach(e => e.classList.remove(HID)); st.hidden.clear();
      pager.hidden = false;
      const boxR = box.getBoundingClientRect();
      const avail = box.clientHeight;
      let units = kids(cont);
      if (!units.length) return [[]];
      const r0 = units[0].getBoundingClientRect();
      const cr = cont.getBoundingClientRect();
      const lastR = units[units.length - 1].getBoundingClientRect();
      const chromeTop = r0.top - boxR.top;
      const chromeBot = Math.max(0, cr.bottom - lastR.bottom) + (cont === box ? 0 : 14);
      const usable = avail - chromeTop - chromeBot - 28;
      st.flat = [];
      for (let pass = 0; pass < 4; pass++) {
        let changed = false; const next = [];
        units.forEach(u => {
          const r = u.getBoundingClientRect();
          const sub = kids(u);
          if (r.height > usable && sub.length >= 2 && !u.classList.contains('nosplit') && u.tagName !== 'svg' && u.tagName !== 'IMG') {
            st.flat.push(u); next.push(...sub); changed = true;
          } else next.push(u);
        });
        units = next; if (!changed) break;
      }
      const textual = u => u.tagName === 'FORM' || u.tagName === 'FIELDSET' || !u.querySelector('svg,input,button,select,textarea,canvas,img,.slot,.dchip,.figure,table,[data-act]') && !u.classList.contains('nosplit');
      const pages = [[]]; let start = units[0].getBoundingClientRect().top;
      for (let i = 0; i < units.length; i++) {
        const u = units[i], r = u.getBoundingClientRect(), cur = pages[pages.length - 1];
        if (r.bottom - start > usable && cur.length) {
          const sub = kids(u);
          if (sub.length >= 2 && textual(u) && r.height > 60) {      // isi teks: pecah agar halaman terisi penuh
            st.flat.push(u); units.splice(i, 1, ...sub); i--; continue;
          }
          pages.push([]); start = r.top;
        }
        pages[pages.length - 1].push(u);
      }
      st.units = units;
      return pages;
    }

    function show(p) {
      st.page = Math.max(0, Math.min(st.pages.length - 1, p));
      st.hidden.forEach(e => e.classList.remove(HID)); st.hidden.clear();
      const vis = new Set(st.pages[st.page] || []);
      st.units.forEach(u => { if (!vis.has(u)) { u.classList.add(HID); st.hidden.add(u); } });
      // wadah hasil pecahan tanpa anak yang tampil ikut disembunyikan
      st.flat.slice().reverse().forEach(f => {
        if (kids(f).length === 0 && !f.classList.contains(HID)) { f.classList.add(HID); st.hidden.add(f); }
      });
      draw();
    }

    function draw() {
      const n = st.pages.length;
      pager.hidden = n <= 1;
      app.classList.toggle('paged', n > 1);
      if (n <= 1) return;
      pager.innerHTML = `<button class="btn sm pg-b" data-pg="-1" aria-label="Halaman sebelumnya" ${st.page === 0 ? 'disabled' : ''}>◀</button>
        <span class="pg-dots">${st.pages.map((_, i) => `<i class="${i === st.page ? 'on' : ''}" data-pgi="${i}"></i>`).join('')}</span>
        <span class="pg-n">${st.page + 1}/${n}</span>
        <button class="btn sm pg-b ${st.page < n - 1 ? 'green' : ''}" data-pg="1" aria-label="Halaman berikutnya" ${st.page === n - 1 ? 'disabled' : ''}>▶</button>`;
    }

    function layout(focusEl) {
      if (st.busy) return; st.busy = true;
      const keep = st.page;
      st.pages = leafPages();
      let target = Math.min(keep, st.pages.length - 1);
      const f = focusEl || (box.contains(document.activeElement) && document.activeElement !== box ? document.activeElement : null);
      if (f) {
        const i = st.pages.findIndex(pg => pg.some(u => u === f || u.contains(f) || f.contains(u)));
        if (i >= 0) target = i;
      }
      show(target);
      st.busy = false;
    }
    st.layout = layout;

    let raf = 0, pendingTarget = null;
    const sched = t => { if (t && t.nodeType === 1) pendingTarget = t; else if (t && t.parentElement) pendingTarget = t.parentElement; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const t2 = pendingTarget; pendingTarget = null; layout(t2); }); };
    st.mo = new MutationObserver(recs => {
      if (st.busy) return;
      const el = n => n.nodeType === 1 && !n.classList.contains('pager');
      let add = null, rem = false;
      recs.forEach(x => { if (x.type !== 'childList') return; const a = Array.from(x.addedNodes).find(el); if (a && !add) add = a; if (Array.from(x.removedNodes).some(el)) rem = true; });
      if (!(add || rem)) return;
      // penambahan -> ikuti ke halaman yang berisi; penggantian -> tetap di tombol yang baru ditekan (jika ada lagi), jika tidak ke awal isi baru
      let tgt = add;
      if (rem && st.sig) { const m = box.querySelector(st.sig); if (m) tgt = m; }
      sched(tgt);
    });
    st.mo.observe(cont, { childList: true, subtree: true });
    st.onResize = () => sched(null);
    window.addEventListener('resize', st.onResize);
    box.addEventListener('load', () => sched(null), true);
    box.addEventListener('click', e => {
      const t = e.target.closest('button,[data-k],[data-act],[data-i],input,label'); st.sig = null; if (!t) return;
      try {
        if (t.dataset.k != null && t.classList.contains('opt')) st.sig = '.opt[data-k="' + t.dataset.k + '"]';   // pilihan jawaban: tetap di tempat; tombol lain: ke awal isi baru
      } catch (er) {}
    }, true);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => st && sched(null));

    // pindah halaman: tombol & titik & geser
    pager.addEventListener('click', e => {
      const b = e.target.closest('[data-pg]'), d = e.target.closest('[data-pgi]');
      if (b) show(st.page + +b.dataset.pg); else if (d) show(+d.dataset.pgi);
    });
    let sx = 0, sy = 0, ok = false;
    st.ts = e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; ok = !e.target.closest('input,textarea,select,.dchip,.slot,svg,.fld,[type=range]'); };
    st.te = e => {
      if (!ok || st.pages.length < 2) return;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 45) { show(st.page + (dx < 0 ? 1 : -1)); PPAudio.sfx('click'); }
    };
    box.addEventListener('touchstart', st.ts, { passive: true });
    box.addEventListener('touchend', st.te, { passive: true });
    PP.fitReset = () => { if (st) { st.page = 0; layout(); } };

    layout();
    setTimeout(() => st && sched(null), 350);   // setelah animasi masuk & gambar siap
  };
  PP.fitState = () => st;
  PP.fitGoto = function (el) { if (st && st.layout) st.layout(el); };
})();

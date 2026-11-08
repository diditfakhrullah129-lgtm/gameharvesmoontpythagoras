/* =========================================================
   MATERI PEMBELAJARAN + EKSPLORASI INTERAKTIF
   Sumber: Global Matematika SMP Kelas VIII, Bab 2 Teorema Pythagoras
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio, V = PPViz, f = V.fmt;
  PP.screens = PP.screens || {};
  PP.MATERI_IDS = ['1', '2', '3', '3b', '4', '5', '6'];
  const TITLES = {
    '1': 'Mengenal Segitiga Siku-Siku', '2': 'Mengenal Sisi-Sisi Segitiga', '3': 'Konsep Teorema Pythagoras',
    '3b': 'Pembuktian Teorema Pythagoras', '4': 'Contoh Perhitungan', '5': 'Penerapan dalam Kehidupan Sehari-hari', '6': 'Kebalikan Teorema dan Triple Pythagoras'
  };
  const sq = n => `${f(n)}²`;

  /* ---------- narasi ---------- */
  function narrBar(id) {
    const key = 'narration_materi_' + id, st = A.narrationState(key);
    return `<div class="narr ${st === 'missing' ? 'off' : ''}"><button class="btn sm ${st === 'missing' ? 'dis' : 'blue'}" data-act="narr" data-id="${key}" ${st === 'missing' ? 'disabled' : ''}>${st === 'playing' ? '❚❚ Jeda narasi' : '▶ Dengarkan narasi'}</button>
      <span class="small muted">${st === 'missing' ? 'Narasi belum diunggah. Guru dapat menambahkannya di assets/audio/narration/.' : 'Narasi suara tersedia.'}</span></div>`;
  }
  PP.acts.narr = el => {
    const id = el.dataset.id, st = A.narrationState(id);
    if (st === 'playing') A.pauseNarration(); else if (st === 'paused') A.resumeNarration(); else A.playNarration(id);
  };
  A.on(() => PP.$$('[data-act=narr]').forEach(b => {
    const st = A.narrationState(b.dataset.id);
    if (st !== 'missing') b.textContent = st === 'playing' ? '❚❚ Jeda narasi' : '▶ Dengarkan narasi';
  }));

  /* ---------- stepper: tampilkan langkah satu per satu ---------- */
  function stepper(root, id) {
    const box = PP.$('#' + id, root); if (!box) return;
    const items = PP.$$('.stp', box), btn = PP.$('.stp-btn', box), rst = PP.$('.stp-rst', box);
    let n = 0;
    const draw = () => {
      items.forEach((li, i) => li.classList.toggle('show', i < n));
      btn.disabled = n >= items.length; btn.textContent = n === 0 ? 'Mulai langkah' : n >= items.length ? 'Selesai' : 'Langkah berikutnya';
      rst.hidden = n === 0;
    };
    btn.onclick = () => { n = Math.min(items.length, n + 1); draw(); A.sfx('tick'); };
    rst.onclick = () => { n = 0; draw(); };
    draw();
  }
  const stepBox = (id, lines, head) => `<div class="stepper" id="${id}">${head || ''}<ol class="steps">${lines.map(l => `<li class="stp">${l}</li>`).join('')}</ol>
    <div class="row"><button class="btn sm green stp-btn nosfx">Mulai langkah</button><button class="btn sm stp-rst nosfx" hidden>Ulangi</button></div></div>`;
  const eq = t => `<span class="eq-line">${t}</span>`;

  /* =====================================================
     HALAMAN MATERI
     ===================================================== */
  const PAGES = {};

  PAGES['1'] = function () {
    return {
      body: `<p><b>Segitiga siku-siku</b> adalah segitiga yang salah satu sudutnya berukuran <b>90°</b> (sudut siku-siku). Sudut siku-siku diberi tanda kotak kecil.</p>
        <div class="two">
          <div class="figure"><div id="m1fig">${V.tri({ H: 4, V: 3, corner: 'bl', angleText: true, labels: {}, aria: 'Segitiga siku-siku dengan sudut 90 derajat' }).svg}</div>
            <div class="row center"><button class="btn sm" data-act="m1-rot">Putar posisi segitiga</button></div>
            <p class="cap">Posisi segitiga boleh berubah, tetapi sudut 90° tetap ada.</p></div>
          <div><h4>Ciri-ciri</h4><ul class="ticks">
            <li>Memiliki <b>satu</b> sudut siku-siku (90°).</li>
            <li>Dua sudut lainnya lancip, dan jumlah keduanya 90°.</li>
            <li>Sisi di depan sudut siku-siku adalah sisi <b>terpanjang</b>.</li>
            <li>Jumlah ketiga sudut tetap 180°.</li></ul>
            <div class="tip">${PP.img('ic_help', 'tip-i')}<span>Contoh sudut: 30° + 60° + 90° = 180°. Segitiga ini siku-siku.</span></div></div></div>`,
      mount(root) {
        let k = 0; const cs = ['bl', 'br', 'tr', 'tl'];
        PP.acts['m1-rot'] = () => { k = (k + 1) % 4; PP.$('#m1fig').innerHTML = V.tri({ H: 4, V: 3, corner: cs[k], angleText: true, labels: {} }).svg; };
      }
    };
  };

  PAGES['2'] = function () {
    const info = {
      h: ['Sisi alas', 'Kaki segitiga yang mendatar (horizontal) di dekat sudut siku-siku.'],
      v: ['Sisi tegak', 'Kaki segitiga yang tegak (vertikal) di dekat sudut siku-siku.'],
      hyp: ['Sisi miring (hipotenusa)', 'Sisi yang berada di hadapan sudut siku-siku. Sisi ini selalu paling panjang.']
    };
    const draw = (corner, hl) => V.tri({ H: 4, V: 3, corner, hl, labels: { h: 'alas', v: 'tegak', hyp: 'miring' }, off: 20, w: 340, h: 240 }).svg;
    return {
      body: `<p>Setiap sisi segitiga siku-siku punya nama. Ketuk sisinya pada gambar atau pilih tombol di bawah.</p>
        <div class="two"><div class="figure"><div id="m2fig">${draw('bl')}</div>
          <div class="row center"><button class="btn sm" data-act="m2-rot">Putar posisi</button></div></div>
        <div><div class="chips" id="m2chips"><button class="chip" data-side="h">Alas</button><button class="chip" data-side="v">Tegak</button><button class="chip" data-side="hyp">Miring</button></div>
          <div class="panel-i" id="m2info"><b>Pilih sebuah sisi</b><p>Penjelasan sisi akan muncul di sini.</p></div>
          <ul class="ticks small"><li>Alas dan tegak disebut <b>sisi siku-siku</b>.</li><li>Sisi miring selalu berseberangan dengan sudut 90°.</li></ul></div></div>`,
      mount(root) {
        let k = 0, hl = null; const cs = ['bl', 'br', 'tr', 'tl'];
        const upd = () => {
          PP.$('#m2fig', root).innerHTML = draw(cs[k], hl);
          PP.$$('#m2chips .chip', root).forEach(c => c.classList.toggle('on', c.dataset.side === hl));
          if (hl) PP.$('#m2info', root).innerHTML = `<b>${info[hl][0]}</b><p>${info[hl][1]}</p>`;
          PP.$$('#m2fig [data-side]', root).forEach(l => l.addEventListener('click', () => { hl = l.dataset.side; upd(); }));
        };
        PP.$('#m2chips', root).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { hl = c.dataset.side; upd(); } });
        PP.acts['m2-rot'] = () => { k = (k + 1) % 4; upd(); };
        upd();
      }
    };
  };

  PAGES['3'] = function () {
    const ex = [[3, 4], [6, 8], [5, 12]];
    return {
      body: `<p>Gambar persegi pada setiap sisi segitiga siku-siku. Hitung luas masing-masing persegi dan bandingkan.</p>
        <div class="chips" id="m3chips">${ex.map((e, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-i="${i}">Sisi ${e[0]}, ${e[1]}, ${Math.hypot(e[0], e[1])}</button>`).join('')}</div>
        <div class="two"><div class="figure"><div id="m3fig"></div><div class="row center"><button class="btn sm" data-act="m3-replay">Putar ulang animasi</button></div></div>
          <div><div class="calc" id="m3calc"></div>
            <div class="formula">a² + b² = c²</div>
            <p class="small">Luas persegi pada sisi miring sama dengan jumlah luas persegi pada kedua sisi siku-siku.</p></div></div>
        <div class="note"><h4>Kegiatan kelompok</h4><ol class="small">
          <li>Buat persegi dari kertas berpetak dengan sisi 3, 4, dan 5 satuan.</li><li>Gunting, lalu tempel sehingga ketiganya membentuk segitiga di bagian tengah.</li>
          <li>Hitung luas tiap persegi: 3² = 9, 4² = 16, dan 5² = 25. Ternyata 9 + 16 = 25.</li><li>Ulangi dengan sisi 5, 12, dan 13: 25 + 144 = 169. Hasilnya juga sama.</li></ol></div>`,
      mount(root) {
        let i = 0;
        const upd = () => {
          const [a, b] = ex[i], c = Math.hypot(a, b);
          PP.$('#m3fig', root).innerHTML = V.squares(a, b, { grid: true, anim: true, w: 420, h: 380 }).svg;
          PP.$('#m3calc', root).innerHTML = `<div class="cl"><span class="dot sq-a"></span>Persegi tegak: ${a}² = <b>${a * a}</b></div><div class="cl"><span class="dot sq-b"></span>Persegi alas: ${b}² = <b>${b * b}</b></div>
            <div class="cl"><span class="dot sq-c"></span>Persegi miring: ${f(c)}² = <b>${f(c * c)}</b></div><div class="cl sum">${a * a} + ${b * b} = ${a * a + b * b} = ${f(c * c)} ✓</div>`;
          PP.$$('#m3chips .chip', root).forEach((x, k) => x.classList.toggle('on', k === i));
        };
        PP.$('#m3chips', root).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { i = +c.dataset.i; upd(); } });
        PP.acts['m3-replay'] = upd; upd();
      }
    };
  };

  PAGES['3b'] = function () {
    return {
      body: `<p>Mengapa c² = a² + b² selalu benar? Perhatikan dua pembuktian berikut. Gunakan tombol untuk membuka langkahnya satu per satu.</p>
        <div class="two"><div class="figure">${V.proof('a')}<p class="cap">Gambar (a): persegi besar sisi (a + b) berisi persegi miring c² dan 4 segitiga siku-siku.</p></div>
          <div><h4>Pembuktian pertama</h4>${stepBox('pf1', [
            'Luas persegi besar = (a + b)².', 'Luas persegi dalam c² = luas persegi besar − 4 luas segitiga.',
            eq('c² = (a + b)² − 4(½ × a × b)'), eq('c² = a² + 2ab + b² − 2ab'), eq('c² = a² + b²') + ' <b>(terbukti)</b>'])}</div></div>
        <div class="two"><div class="figure">${V.proof('b')}<p class="cap">Gambar (b): persegi yang sama disusun ulang menjadi a², b², dan dua persegi panjang ab.</p></div>
          <div><h4>Pembuktian kedua</h4>${stepBox('pf2', [
            'Gambar (a): (a + b)² = 4(½ × a × b) + c².', 'Gambar (b): (a + b)² = a² + b² + 2ab.',
            'Luas kedua gambar sama, maka ' + eq('4(½ab) + c² = a² + b² + 2ab'), eq('2ab + c² = a² + b² + 2ab'), eq('c² = a² + b²') + ' <b>(terbukti)</b>'])}</div></div>`,
      mount(root) { stepper(root, 'pf1'); stepper(root, 'pf2'); }
    };
  };

  PAGES['4'] = function () {
    const ex1 = V.tri({ H: 4, V: 3, corner: 'bl', labels: { h: 'b = 4 cm', v: 'a = 3 cm', hyp: 'c = ?' }, w: 300, h: 210, off: 20 }).svg;
    const ex2 = V.tri({ H: 12, V: 9, corner: 'br', labels: { h: 'AC = 12 cm', v: 'BC = ?', hyp: 'AB = 15 cm' }, w: 320, h: 220, off: 20 }).svg;
    // tabel latihan (Tabel 2.1 pada buku): 1 sisi dicari
    const rows = [[3, 4, 5, 'c'], [6, 8, 10, 'a'], [10, 24, 26, 'b'], [7, 24, 25, 'c'], [8, 15, 17, 'a']];
    return {
      body: `<h4>Contoh 1: mencari sisi miring</h4>
        <div class="two"><div class="figure">${ex1}</div><div>${stepBox('ex1', [
          '<b>Diketahui:</b> a = 3 cm dan b = 4 cm.', '<b>Ditanyakan:</b> panjang sisi miring c.', eq('c² = a² + b²'), eq('c² = 3² + 4²'), eq('c² = 9 + 16'), eq('c² = 25'), eq('c = √25 = 5 cm') + ' <b>Jadi sisi miringnya 5 cm.</b>'])}</div></div>
        <h4>Contoh 2: mencari sisi siku-siku</h4>
        <p class="small">Segitiga ABC siku-siku di C dengan AB = 15 cm dan AC = 12 cm. Tentukan panjang BC.</p>
        <div class="two"><div class="figure">${ex2}</div><div>${stepBox('ex2', [
          'ΔABC siku-siku di C, maka AB adalah sisi miring.', eq('AB² = BC² + AC²'), eq('15² = BC² + 12²'), eq('BC² = 15² − 12²'), eq('BC² = 225 − 144 = 81'), eq('BC = √81 = 9 cm') + ' <b>Jadi BC = 9 cm.</b>'])}</div></div>
        <h4>Coba sendiri: lengkapi tabel</h4>
        <p class="small">Segitiga siku-siku dengan c sebagai sisi miring. Isi sisi yang masih kosong, lalu tekan Periksa.</p>
        <div class="tbl-wrap"><table class="tbl" id="trip"><thead><tr><th>No</th><th>a</th><th>b</th><th>c</th><th>a²</th><th>b²</th><th>c²</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr data-i="${i}"><td>${i + 1}</td>${['a', 'b', 'c'].map((k, j) => k === r[3] ? `<td><input class="cell" inputmode="decimal" data-k="${k}" aria-label="Nilai ${k} baris ${i + 1}"></td>` : `<td>${r[j]}</td>`).join('')}
          <td class="sq" data-s="a"></td><td class="sq" data-s="b"></td><td class="sq" data-s="c"></td></tr>`).join('')}</tbody></table></div>
        <div class="row"><button class="btn green sm" data-act="tbl-check">Periksa</button><button class="btn sm" data-act="tbl-show">Tampilkan jawaban</button><span class="small" id="tblMsg"></span></div>`,
      mount(root) {
        stepper(root, 'ex1'); stepper(root, 'ex2');
        const fill = (tr, r, force) => {
          const inp = PP.$('input', tr), k = r[3], idx = { a: 0, b: 1, c: 2 }[k], val = r[idx];
          if (force) inp.value = val;
          const v = parseFloat(String(inp.value).replace(',', '.'));
          const ok = Math.abs(v - val) < 1e-9;
          inp.classList.toggle('ok', ok); inp.classList.toggle('no', inp.value !== '' && !ok);
          const vals = ok || force ? { a: r[0], b: r[1], c: r[2] } : null;
          ['a', 'b', 'c'].forEach(s => PP.$('[data-s=' + s + ']', tr).textContent = vals ? vals[s] * vals[s] : '');
          return ok;
        };
        PP.acts['tbl-check'] = () => {
          let n = 0; PP.$$('#trip tbody tr', root).forEach((tr, i) => { if (fill(tr, rows[i])) n++; });
          PP.$('#tblMsg', root).textContent = n === rows.length ? 'Semua benar! Hebat!' : n + ' dari ' + rows.length + ' benar. Periksa lagi yang berwarna merah.';
          A.sfx(n === rows.length ? 'correct' : 'wrong');
        };
        PP.acts['tbl-show'] = () => { PP.$$('#trip tbody tr', root).forEach((tr, i) => fill(tr, rows[i], true)); PP.$('#tblMsg', root).textContent = 'Jawaban ditampilkan.'; };
      }
    };
  };

  PAGES['5'] = function () {
    const items = {
      ladder: { t: 'Tangga bersandar pada dinding', svg: V.app('ladder'), steps: ['Tanah, dinding, dan tangga membentuk segitiga siku-siku. Tangga adalah sisi miring.', eq('c² = 12² + 5² = 144 + 25 = 169'), eq('c = √169 = 13 m'), 'Tangga yang dibutuhkan panjangnya <b>13 m</b>.'] },
      field: { t: 'Diagonal lapangan', svg: V.app('field'), steps: ['Diagonal membagi lapangan persegi panjang menjadi dua segitiga siku-siku.', eq('d² = 40² + 30² = 1.600 + 900 = 2.500'), eq('d = √2.500 = 50 m'), 'Lintasan diagonal panjangnya <b>50 m</b>, lebih pendek daripada 40 + 30 = 70 m.'] },
      dist: { t: 'Jarak terpendek dua titik', svg: V.app('dist'), steps: ['Jarak terpendek dua titik adalah garis lurus. Selisih koordinat membentuk sisi siku-siku.', eq('AB² = (7 − 1)² + (7 − 1)² = 36 + 36 = 72'), eq('AB = √72 = 6√2 ≈ 8,49 satuan'), 'Jaraknya sekitar <b>8,49 satuan</b>.'] },
      building: { t: 'Tinggi dan jarak suatu bangunan', svg: V.app('building'), steps: ['Gedung setinggi 15 m dilihat dari titik di tanah yang berjarak 8 m dari kaki gedung.', eq('s² = 15² + 8² = 225 + 64 = 289'), eq('s = √289 = 17 m'), 'Jarak pandang dari titik itu ke puncak gedung adalah <b>17 m</b>. Dengan cara yang sama, jika jarak pandang dan jarak mendatar diketahui, tinggi gedung dapat dicari.'] }
    };
    const keys = Object.keys(items);
    return {
      body: `<p>Teorema Pythagoras dipakai tukang bangunan, pelari, pemetaan, dan banyak profesi lain. Pilih salah satu situasi.</p>
        <div class="chips" id="m5chips">${keys.map((k, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-k="${k}">${items[k].t}</button>`).join('')}</div>
        <div class="two"><div class="figure" id="m5fig"></div><div id="m5txt"></div></div>`,
      mount(root) {
        const show = k => {
          PP.$('#m5fig', root).innerHTML = items[k].svg;
          PP.$('#m5txt', root).innerHTML = `<h4>${items[k].t}</h4>` + stepBox('m5st', items[k].steps);
          stepper(root, 'm5st'); PP.$$('#m5chips .chip', root).forEach(c => c.classList.toggle('on', c.dataset.k === k));
        };
        PP.$('#m5chips', root).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) show(c.dataset.k); });
        show(keys[0]);
      }
    };
  };

  PAGES['6'] = function () {
    return {
      body: `<h4>Kebalikan Teorema Pythagoras</h4>
        <p>Jika pada sebuah segitiga kuadrat sisi terpanjang sama dengan jumlah kuadrat dua sisi lainnya, maka sudut yang menghadap sisi terpanjang adalah <b>sudut siku-siku</b>.</p>
        <div class="tool panel-i"><b>Alat cek segitiga</b><p class="small">Masukkan panjang tiga sisi.</p>
          <div class="row"><input class="cell" id="cs1" inputmode="decimal" value="8" aria-label="Sisi pertama"><input class="cell" id="cs2" inputmode="decimal" value="15" aria-label="Sisi kedua"><input class="cell" id="cs3" inputmode="decimal" value="17" aria-label="Sisi ketiga"></div>
          <div id="csOut" class="tool-out"></div></div>
        <h4>Triple Pythagoras</h4>
        <p>Tiga bilangan asli yang memenuhi c² = a² + b² disebut <b>triple Pythagoras</b>, misalnya 3, 4, 5. Kelipatannya juga triple: 6, 8, 10 dan 9, 12, 15.</p>
        <p>Rumus pembangkit triple dengan m dan n bilangan asli, m &gt; n:</p>
        <div class="formula sm">a = m² − n²  ·  b = 2mn  ·  c = m² + n²</div>
        <div class="tool panel-i"><b>Pembangkit triple</b><div class="row"><label class="small">m <input class="cell" id="tm" type="number" min="2" max="12" value="3"></label><label class="small">n <input class="cell" id="tn" type="number" min="1" max="11" value="2"></label></div>
          <div id="tOut" class="tool-out"></div></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Triple</th><th>Pemeriksaan</th></tr></thead><tbody>
          ${[[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]].map(t => `<tr><td>${t.join(', ')}</td><td>${t[0]}² + ${t[1]}² = ${t[0] ** 2} + ${t[1] ** 2} = ${t[2] ** 2} = ${t[2]}²</td></tr>`).join('')}</tbody></table></div>`,
      mount(root) {
        const num = id => parseFloat(String(PP.$(id, root).value).replace(',', '.'));
        const chk = () => {
          const v = [num('#cs1'), num('#cs2'), num('#cs3')], out = PP.$('#csOut', root);
          if (v.some(x => !(x > 0))) { out.innerHTML = '<span class="err">Isi ketiga sisi dengan bilangan positif.</span>'; return; }
          const s = v.slice().sort((a, b) => a - b), [a, b, c] = s;
          if (a + b <= c) { out.innerHTML = `<span class="err">Ketiga panjang itu tidak dapat membentuk segitiga, karena ${f(a)} + ${f(b)} ≤ ${f(c)}.</span>`; return; }
          const l = a * a + b * b, r = c * c, ok = Math.abs(l - r) < 1e-9;
          out.innerHTML = `Sisi terpanjang = ${f(c)}. ${f(a)}² + ${f(b)}² = ${f(l)} dan ${f(c)}² = ${f(r)}.<br><b class="${ok ? 'okc' : 'noc'}">${ok ? 'Sama, jadi segitiga ini siku-siku.' : l > r ? 'Jumlahnya lebih besar, jadi bukan siku-siku (segitiga lancip).' : 'Jumlahnya lebih kecil, jadi bukan siku-siku (segitiga tumpul).'}</b>`;
        };
        ['#cs1', '#cs2', '#cs3'].forEach(i => PP.$(i, root).addEventListener('input', chk)); chk();
        const trip = () => {
          const m = parseInt(PP.$('#tm', root).value, 10), n = parseInt(PP.$('#tn', root).value, 10), out = PP.$('#tOut', root);
          if (!(m > n && n >= 1)) { out.innerHTML = '<span class="err">Syaratnya m lebih besar dari n, dan keduanya bilangan asli.</span>'; return; }
          const a = m * m - n * n, b = 2 * m * n, c = m * m + n * n;
          out.innerHTML = `a = ${m}² − ${n}² = ${a}; b = 2 × ${m} × ${n} = ${b}; c = ${m}² + ${n}² = ${c}<br><b class="okc">Triple: ${a}, ${b}, ${c}</b> (${a}² + ${b}² = ${a * a + b * b} = ${c}²)`;
        };
        ['#tm', '#tn'].forEach(i => PP.$(i, root).addEventListener('input', trip)); trip();
      }
    };
  };

  /* ---------- pembungkus halaman materi ---------- */
  PP.materiPage = function (id, embedded) {
    const p = PAGES[id](), tag = embedded ? 'h3' : 'h2';
    return {
      html: `<section class="panel pad lesson" data-mid="${id}"><${tag} class="h-sub">Materi ${id.toUpperCase()}: ${TITLES[id]}</${tag}>${narrBar(id)}<div class="lesson-body">${p.body}</div></section>`,
      mount(root) {
        if (!S.data.materiSeen[id]) { S.data.materiSeen[id] = Date.now(); S.save(); S.addXP(5, true); S.checkBadges(); }
        p.mount && p.mount(PP.$('[data-mid="' + id + '"]', root) || root);
      }
    };
  };

  PP.screens.materi = function (arg) {
    const id = PP.MATERI_IDS.includes(arg) ? arg : '1';
    const idx = PP.MATERI_IDS.indexOf(id), pg = PP.materiPage(id);
    const prev = PP.MATERI_IDS[idx - 1], next = PP.MATERI_IDS[idx + 1];
    return {
      html: `<div class="wrap"><nav class="tabs" aria-label="Daftar materi">${PP.MATERI_IDS.map(m => `<button class="tab ${m === id ? 'on' : ''} ${S.data.materiSeen[m] ? 'seen' : ''}" data-go="materi-${m}">${m.toUpperCase()}</button>`).join('')}</nav>
        ${pg.html}
        <div class="row between"><button class="btn" ${prev ? `data-go="materi-${prev}"` : 'disabled'}>◀ Sebelumnya</button>
          ${next ? `<button class="btn green" data-go="materi-${next}">Berikutnya ▶</button>` : `<button class="btn green" data-go="peta">Ke Peta Petualangan</button>`}</div></div>`,
      mount: pg.mount
    };
  };

  /* =====================================================
     EKSPLORASI INTERAKTIF
     ===================================================== */
  PP.screens.eksplorasi = function () {
    return {
      html: `<div class="wrap"><div class="panel pad"><h2 class="h-title">Eksplorasi Pythagoras</h2>
        <p>Geser pengaturan sisi a (tegak) dan b (alas). Segitiga, sisi miring, dan luas persegi berubah otomatis.</p>
        <div class="two ex-grid"><div class="figure"><div id="exFig"></div></div>
          <div class="ex-ctl">
            <label class="slide"><span>Sisi tegak a</span><input type="range" id="exA" min="1" max="20" step="0.5" value="3"><input type="number" id="exAn" min="1" max="20" step="0.5" value="3"></label>
            <label class="slide"><span>Sisi alas b</span><input type="range" id="exB" min="1" max="20" step="0.5" value="4"><input type="number" id="exBn" min="1" max="20" step="0.5" value="4"></label>
            <p class="err" id="exErr" hidden></p>
            <div class="chips" id="exPre"><button class="chip" data-a="3" data-b="4">3 · 4</button><button class="chip" data-a="5" data-b="12">5 · 12</button><button class="chip" data-a="8" data-b="15">8 · 15</button><button class="chip" data-a="6" data-b="8">6 · 8</button><button class="chip" data-a="1" data-b="1">1 · 1</button></div>
            <div class="calc" id="exCalc"></div></div></div>
        <div class="tip">${PP.img('owl_1', 'tip-i')}<span>Tantangan: temukan a dan b sehingga c bilangan bulat. Itulah triple Pythagoras!</span></div></div></div>`,
      mount(root) {
        const R = id => PP.$(id, root); let changes = 0;
        const read = (id) => { const v = parseFloat(String(R(id).value).replace(',', '.')); return v; };
        const draw = () => {
          let a = read('#exAn'), b = read('#exBn'); const err = R('#exErr');
          if (!(a >= 1 && a <= 20 && b >= 1 && b <= 20)) { err.hidden = false; err.textContent = 'Isi a dan b dengan angka antara 1 dan 20.'; return; }
          err.hidden = true;
          const c = Math.hypot(a, b), tri = Math.abs(c - Math.round(c)) < 1e-9;
          R('#exFig').innerHTML = V.squares(a, b, { w: 460, h: 420 }).svg;
          R('#exCalc').innerHTML = `<div class="cl"><span class="dot sq-a"></span>a² = ${f(a)}² = <b>${f(a * a)}</b></div><div class="cl"><span class="dot sq-b"></span>b² = ${f(b)}² = <b>${f(b * b)}</b></div>
            <div class="cl sum">c² = a² + b² = ${f(a * a)} + ${f(b * b)} = <b>${f(a * a + b * b)}</b></div><div class="cl"><span class="dot sq-c"></span>c = √${f(a * a + b * b)} = <b>${f(c)}</b></div>
            ${tri && Number.isInteger(a) && Number.isInteger(b) ? `<div class="cl ok">Triple Pythagoras: ${Math.min(a, b)}, ${Math.max(a, b)}, ${c}</div>` : ''}`;
        };
        const set = (a, b) => { ['A', 'B'].forEach((k, i) => { const v = i ? b : a; R('#ex' + k).value = v; R('#ex' + k + 'n').value = v; }); draw(); };
        ['A', 'B'].forEach(k => {
          R('#ex' + k).addEventListener('input', e => { R('#ex' + k + 'n').value = e.target.value; draw(); bump(); });
          R('#ex' + k + 'n').addEventListener('input', e => { const v = parseFloat(String(e.target.value).replace(',', '.')); if (v >= 1 && v <= 20) R('#ex' + k).value = v; draw(); bump(); });
        });
        R('#exPre').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { set(+c.dataset.a, +c.dataset.b); bump(); } });
        const bump = () => { changes++; if (changes === 6) { S.data.explored++; S.save(); S.award('explorer'); S.addXP(10); } };
        draw();
      }
    };
  };
})();

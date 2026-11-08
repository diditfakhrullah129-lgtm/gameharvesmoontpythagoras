/* =========================================================
   VISUALISASI MATEMATIKA (SVG) — semua dihitung dari angka sebenarnya
   ========================================================= */
(function () {
  const V = {};
  const f = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
  V.fmt = f;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ---------- Segitiga siku-siku dengan orientasi bebas ----------
     o: {H: panjang kaki horizontal, V: panjang kaki vertikal, corner:'bl'|'br'|'tl'|'tr',
         labels:{h,v,hyp}, w,h, hl:'h'|'v'|'hyp', mark:true, idPrefix}
     return {svg, pts:{h:{x,y},v:{x,y},hyp:{x,y}} (koordinat viewBox), W,Hh}                */
  V.tri = function (o) {
    const W = o.w || 320, Hh = o.h || 220, m = o.m || 40;
    const H = o.H, Vv = o.V, c = o.corner || 'bl';
    const s = Math.min((W - 2 * m) / H, (Hh - 2 * m) / Vv);
    const tw = H * s, th = Vv * s, ox = (W - tw) / 2, oy = (Hh - th) / 2;
    const map = {
      bl: { P: [0, Vv], A: [H, Vv], B: [0, 0] }, br: { P: [H, Vv], A: [0, Vv], B: [H, 0] },
      tl: { P: [0, 0], A: [H, 0], B: [0, Vv] }, tr: { P: [H, 0], A: [0, 0], B: [H, Vv] }
    }[c];
    const T = p => [ox + p[0] * s, oy + p[1] * s];
    const P = T(map.P), A = T(map.A), B = T(map.B);
    const off = o.off || 22;
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const mh = mid(P, A), mv = mid(P, B), my = mid(A, B);
    const bottom = c[0] === 'b', left = c[1] === 'l';
    const lh = { x: mh[0], y: mh[1] + (bottom ? off : -off) };
    const lv = { x: mv[0] + (left ? -off : off), y: mv[1] };
    let nx = my[0] - P[0], ny = my[1] - P[1]; const nl = Math.hypot(nx, ny) || 1;
    const ly = { x: my[0] + nx / nl * off, y: my[1] + ny / nl * off };
    const k = Math.max(9, Math.min(18, Math.min(tw, th) * 0.14));
    const dx = Math.sign(A[0] - P[0]), dy = Math.sign(B[1] - P[1]);
    const lab = o.labels || {};
    const cls = side => 'side' + (o.hl === side ? ' hl' : '');
    let svg = `<svg class="viz tri" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(o.aria || 'Segitiga siku-siku')}">`;
    svg += `<polygon class="tri-fill" points="${P} ${A} ${B}"/>`;
    svg += `<line class="${cls('h')}" data-side="h" x1="${P[0]}" y1="${P[1]}" x2="${A[0]}" y2="${A[1]}"/>`;
    svg += `<line class="${cls('v')}" data-side="v" x1="${P[0]}" y1="${P[1]}" x2="${B[0]}" y2="${B[1]}"/>`;
    svg += `<line class="${cls('hyp')} hyp" data-side="hyp" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/>`;
    if (o.mark !== false) svg += `<path class="rmark" d="M${P[0] + dx * k},${P[1]} L${P[0] + dx * k},${P[1] + dy * k} L${P[0]},${P[1] + dy * k}"/>`;
    if (o.angleText) svg += `<text class="vlab small" x="${P[0] + dx * (k + 14)}" y="${P[1] + dy * (k + 6) + 4}" text-anchor="middle">90°</text>`;
    const t = (p, txt, side) => txt == null || txt === '' ? '' : `<text class="vlab${o.hl === side ? ' hl' : ''}" x="${p.x}" y="${p.y + 5}" text-anchor="middle">${esc(txt)}</text>`;
    svg += t(lh, lab.h, 'h') + t(lv, lab.v, 'v') + t(ly, lab.hyp, 'hyp');
    svg += (o.extra || '') + '</svg>';
    const far = o.slotOff || 0;
    return { svg, W, Hh, P, A, B, pts: { h: lh, v: lv, hyp: ly }, s };
  };

  /* ---------- Segitiga dengan persegi pada ketiga sisi ----------
     a: sisi tegak, b: sisi alas. Sudut siku-siku di kiri-bawah.
     o: {w,h, grid:true, anim:true, show:{a,b,c}, labels:true}                         */
  V.squares = function (a, b, o) {
    o = o || {};
    const c = Math.hypot(a, b);
    // koordinat satuan (y ke bawah), sudut siku-siku di (0,0)
    const Pp = [0, 0], T = [0, -a], R = [b, 0];
    const n = [a, -b];                       // normal luar sisi miring dengan panjang c
    const sqA = [T, Pp, [-a, 0], [-a, -a]];  // persegi pada sisi tegak (ke kiri)
    const sqB = [Pp, R, [b, b], [0, b]];     // persegi pada sisi alas (ke bawah)
    const sqC = [T, R, [R[0] + n[0], R[1] + n[1]], [T[0] + n[0], T[1] + n[1]]];
    const all = [...sqA, ...sqB, ...sqC];
    const minX = Math.min(...all.map(p => p[0])), maxX = Math.max(...all.map(p => p[0]));
    const minY = Math.min(...all.map(p => p[1])), maxY = Math.max(...all.map(p => p[1]));
    const W = o.w || 420, Hh = o.h || 380, m = o.m || 12;
    const s = Math.min((W - 2 * m) / (maxX - minX), (Hh - 2 * m) / (maxY - minY));
    const ox = (W - (maxX - minX) * s) / 2 - minX * s, oy = (Hh - (maxY - minY) * s) / 2 - minY * s;
    const X = p => [ox + p[0] * s, oy + p[1] * s];
    const pts = poly => poly.map(X).map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
    const cen = poly => { const q = poly.map(X); return [q.reduce((t, p) => t + p[0], 0) / 4, q.reduce((t, p) => t + p[1], 0) / 4]; };
    const gridLines = (poly, L) => {
      if (!o.grid || L > 14 || Math.abs(L - Math.round(L)) > 1e-9) return '';
      const [p0, p1, , p3] = poly.map(X); let g = '';
      const N = Math.round(L);
      for (let i = 1; i < N; i++) {
        const k = i / N;
        g += `<line x1="${p0[0] + (p1[0] - p0[0]) * k}" y1="${p0[1] + (p1[1] - p0[1]) * k}" x2="${p3[0] + (p1[0] - p0[0]) * k}" y2="${p3[1] + (p1[1] - p0[1]) * k}"/>`;
        g += `<line x1="${p0[0] + (p3[0] - p0[0]) * k}" y1="${p0[1] + (p3[1] - p0[1]) * k}" x2="${p1[0] + (p3[0] - p1[0]) * k}" y2="${p1[1] + (p3[1] - p1[1]) * k}"/>`;
      }
      return `<g class="grid">${g}</g>`;
    };
    const sh = o.show || { a: true, b: true, c: true };
    const one = (poly, L, cls, name, area) => {
      if (!sh[name]) return '';
      const [cx, cy] = cen(poly);
      const fs = Math.max(11, Math.min(18, L * s * 0.32));
      return `<g class="sqg ${o.anim ? 'pop' : ''}" data-sq="${name}" style="--d:${name === 'a' ? 0 : name === 'b' ? 0.5 : 1}s">
        <polygon class="sq ${cls}" points="${pts(poly)}"/>${gridLines(poly, L)}
        ${o.labels === false ? '' : `<text class="sqtxt" x="${cx}" y="${cy - 2}" text-anchor="middle" style="font-size:${fs}px">${name}² = ${f(area)}</text>
        <text class="sqtxt sub" x="${cx}" y="${cy + fs}" text-anchor="middle" style="font-size:${fs * 0.72}px">sisi ${f(L)}</text>`}</g>`;
    };
    const [Pq, Tq, Rq] = [X(Pp), X(T), X(R)];
    const k = Math.max(8, Math.min(16, Math.min(a, b) * s * 0.18));
    let svg = `<svg class="viz sqv" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Segitiga siku-siku dengan persegi pada ketiga sisinya: a = ${f(a)}, b = ${f(b)}, c = ${f(c)}">`;
    svg += one(sqA, a, 'sq-a', 'a', a * a) + one(sqB, b, 'sq-b', 'b', b * b) + one(sqC, c, 'sq-c', 'c', c * c);
    svg += `<polygon class="tri-fill" points="${Pq} ${Tq} ${Rq}"/>`;
    svg += `<path class="rmark" d="M${Pq[0] + k},${Pq[1]} L${Pq[0] + k},${Pq[1] - k} L${Pq[0]},${Pq[1] - k}"/>`;
    svg += `<polygon class="tri-line" points="${Pq} ${Tq} ${Rq}"/></svg>`;
    return { svg, a, b, c };
  };

  /* ---------- Pembuktian: persegi (a+b)² dengan 4 segitiga ---------- */
  V.proof = function (mode) {
    const S = 220, a = 70, b = 150, W = 260, Hh = 260, o = 20;
    // mode 'a' = persegi miring c di tengah; mode 'b' = dua persegi a² dan b² + dua persegi panjang ab
    let svg = `<svg class="viz proof" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Pembuktian Pythagoras dengan persegi (a + b) dikali (a + b)">`;
    const x0 = o, y0 = o;
    svg += `<rect class="pf-frame" x="${x0}" y="${y0}" width="${a + b}" height="${a + b}"/>`;
    if (mode === 'a') {
      const p1 = [x0 + b, y0], p2 = [x0 + a + b, y0 + b], p3 = [x0 + a, y0 + a + b], p4 = [x0, y0 + a];
      svg += `<polygon class="sq sq-c" points="${p1} ${p2} ${p3} ${p4}"/>`;
      const tri = (A, B, C) => `<polygon class="tri-fill" points="${A} ${B} ${C}"/>`;
      svg += tri([x0, y0], p1, p4) + tri(p1, [x0 + a + b, y0], p2) + tri(p2, [x0 + a + b, y0 + a + b], p3) + tri(p3, [x0, y0 + a + b], p4);
      svg += `<text class="sqtxt" x="${x0 + (a + b) / 2}" y="${y0 + (a + b) / 2 + 6}" text-anchor="middle" style="font-size:18px">c²</text>`;
      svg += `<text class="vlab small" x="${x0 + b / 2}" y="${y0 - 6}" text-anchor="middle">b</text><text class="vlab small" x="${x0 + b + a / 2}" y="${y0 - 6}" text-anchor="middle">a</text>`;
    } else {
      svg += `<rect class="sq sq-b" x="${x0}" y="${y0}" width="${b}" height="${b}"/><rect class="sq sq-a" x="${x0 + b}" y="${y0 + b}" width="${a}" height="${a}"/>`;
      svg += `<rect class="tri-fill" x="${x0 + b}" y="${y0}" width="${a}" height="${b}"/><rect class="tri-fill" x="${x0}" y="${y0 + b}" width="${b}" height="${a}"/>`;
      svg += `<line class="tri-line" x1="${x0 + b}" y1="${y0}" x2="${x0 + b}" y2="${y0 + b}"/><line class="tri-line" x1="${x0 + b}" y1="${y0}" x2="${x0 + a + b}" y2="${y0 + b}"/>`;
      svg += `<line class="tri-line" x1="${x0}" y1="${y0 + b}" x2="${x0 + b}" y2="${y0 + a + b}"/>`;
      svg += `<text class="sqtxt" x="${x0 + b / 2}" y="${y0 + b / 2 + 6}" text-anchor="middle" style="font-size:18px">b²</text><text class="sqtxt" x="${x0 + b + a / 2}" y="${y0 + b + a / 2 + 6}" text-anchor="middle" style="font-size:16px">a²</text>`;
      svg += `<text class="sqtxt" x="${x0 + b + a / 2}" y="${y0 + b / 2 + 4}" text-anchor="middle" style="font-size:14px">ab</text><text class="sqtxt" x="${x0 + b / 2}" y="${y0 + b + a / 2 + 5}" text-anchor="middle" style="font-size:14px">ab</text>`;
    }
    return svg + '</svg>';
  };

  /* ---------- Ilustrasi penerapan (Materi 5) ---------- */
  V.app = function (kind) {
    const ground = '<rect class="ground" x="0" y="196" width="400" height="44"/>';
    const sky = '<rect class="skyr" x="0" y="0" width="400" height="196"/>';
    const L = (t, x, y, anchor) => `<text class="vlab small" x="${x}" y="${y}" text-anchor="${anchor || 'middle'}">${t}</text>`;
    if (kind === 'ladder') {                       // dinding 12 m, kaki tangga 5 m (12,5 px per m)
      const s = 12.5, wx = 300, top = 196 - 12 * s, fx = wx - 5 * s;
      return `<svg class="viz app" viewBox="0 0 400 240" role="img" aria-label="Tangga bersandar pada dinding">${sky}${ground}
        <rect class="wall" x="${wx}" y="30" width="60" height="166"/><rect class="winn" x="${wx + 14}" y="${top - 12}" width="30" height="26"/>
        <line class="ladder" x1="${fx}" y1="196" x2="${wx}" y2="${top}"/>
        <line class="side" x1="${fx}" y1="196" x2="${wx}" y2="196"/><line class="side" x1="${wx}" y1="196" x2="${wx}" y2="${top}"/>
        <path class="rmark" d="M${wx - 12},196 L${wx - 12},184 L${wx},184"/>
        ${L('5 m', (fx + wx) / 2, 216)}${L('12 m', wx - 8, (196 + top) / 2 + 4, 'end')}${L('tangga = ?', (fx + wx) / 2 - 36, (196 + top) / 2 - 8)}</svg>`;
    }
    if (kind === 'field') {                        // 40 m x 30 m, skala 6 px per m
      const s = 6, x0 = 70, y0 = 200 - 30 * s, x1 = x0 + 40 * s;
      return `<svg class="viz app" viewBox="0 0 400 240" role="img" aria-label="Diagonal lapangan persegi panjang">
        <rect class="grass" x="0" y="0" width="400" height="240"/><rect class="field" x="${x0}" y="${y0}" width="${40 * s}" height="${30 * s}"/>
        <line class="side" x1="${x0}" y1="200" x2="${x1}" y2="200"/><line class="side" x1="${x1}" y1="${y0}" x2="${x1}" y2="200"/>
        <line class="side hyp" x1="${x0}" y1="200" x2="${x1}" y2="${y0}"/><path class="rmark" d="M${x1 - 12},200 L${x1 - 12},188 L${x1},188"/>
        ${L('40 m', (x0 + x1) / 2, 222)}${L('30 m', x1 + 8, (y0 + 200) / 2 + 4, 'start')}${L('diagonal = ?', (x0 + x1) / 2 - 26, (y0 + 200) / 2 - 6)}</svg>`;
    }
    if (kind === 'dist') {                         // A(1,1) dan B(7,7), 22 px per satuan, titik asal (40,220)
      const u = 22, ox = 40, oy = 220, X = v => ox + v * u, Y = v => oy - v * u;
      let gr = ''; for (let i = 0; i <= 15; i++) gr += `<line class="gridl" x1="${X(i)}" y1="20" x2="${X(i)}" y2="${oy}"/>`;
      for (let i = 0; i <= 9; i++) gr += `<line class="gridl" x1="${ox}" y1="${Y(i)}" x2="${X(15)}" y2="${Y(i)}"/>`;
      return `<svg class="viz app" viewBox="0 0 400 240" role="img" aria-label="Jarak dua titik pada bidang koordinat">
        <rect class="paper" x="0" y="0" width="400" height="240"/>${gr}
        <line class="side" x1="${X(1)}" y1="${Y(1)}" x2="${X(7)}" y2="${Y(1)}"/><line class="side" x1="${X(7)}" y1="${Y(1)}" x2="${X(7)}" y2="${Y(7)}"/>
        <line class="side hyp" x1="${X(1)}" y1="${Y(1)}" x2="${X(7)}" y2="${Y(7)}"/><path class="rmark" d="M${X(7) - 11},${Y(1)} L${X(7) - 11},${Y(1) - 11} L${X(7)},${Y(1) - 11}"/>
        <circle class="pt" cx="${X(1)}" cy="${Y(1)}" r="5"/><circle class="pt" cx="${X(7)}" cy="${Y(7)}" r="5"/>
        ${L('A(1, 1)', X(1) - 4, Y(1) + 18, 'middle')}${L('B(7, 7)', X(7) + 8, Y(7) - 2, 'start')}${L('6 satuan', (X(1) + X(7)) / 2 + 20, Y(1) + 16)}${L('6 satuan', X(7) + 8, (Y(1) + Y(7)) / 2 + 4, 'start')}${L('AB = ?', (X(1) + X(7)) / 2 - 24, (Y(1) + Y(7)) / 2 - 6)}</svg>`;
    }
    // gedung: tinggi 15 m, jarak 8 m, 10 px per m
    const s = 10, bx = 142, top = 196 - 15 * s, ex = bx + 8 * s;
    return `<svg class="viz app" viewBox="0 0 400 240" role="img" aria-label="Tinggi dan jarak sebuah bangunan">${sky}${ground}
      <rect class="wall" x="90" y="${top}" width="52" height="${196 - top}"/><rect class="winn" x="104" y="${top + 16}" width="12" height="14"/><rect class="winn" x="118" y="${top + 16}" width="12" height="14"/><rect class="winn" x="104" y="${top + 42}" width="12" height="14"/><rect class="winn" x="118" y="${top + 42}" width="12" height="14"/>
      <line class="side" x1="${bx}" y1="196" x2="${ex}" y2="196"/><line class="side" x1="${bx}" y1="196" x2="${bx}" y2="${top}"/>
      <line class="side hyp" x1="${bx}" y1="${top}" x2="${ex}" y2="196"/><path class="rmark" d="M${bx + 12},196 L${bx + 12},184 L${bx},184"/>
      <circle class="pt" cx="${ex}" cy="196" r="6"/>
      ${L('15 m', bx + 8, (196 + top) / 2 + 4, 'start')}${L('8 m', (bx + ex) / 2, 216)}${L('jarak pandang = ?', ex + 12, (196 + top) / 2 - 8, 'start')}</svg>`;
  };

  /* ---------- Adegan Game C ----------
     return {svg, from:[x,y], to:[x,y]} dalam viewBox 400x240; hero bergerak dari from ke to */
  V.scene = function (sc, built) {
    const unit = sc.unit;
    const sky = '<rect class="skyr" x="0" y="0" width="400" height="240"/>';
    const L = (t, x, y, an) => `<text class="vlab small" x="${x}" y="${y}" text-anchor="${an || 'middle'}">${t}</text>`;
    const hyp = sc.ask === 'hyp' ? '?' : sc.hypLen + ' ' + unit;
    const q = '<tspan class="qm">?</tspan>';
    const lbl = (v, hide) => hide ? '?' : v + ' ' + unit;
    let svg, from, to;
    if (sc.kind === 'ladder') {
      const h = sc.legs[0], b = sc.legs[1], s = Math.min(150 / h, 170 / b), wx = 320, top = 200 - h * s, fx = wx - b * s;
      svg = `${sky}<rect class="ground" x="0" y="200" width="400" height="40"/><rect class="wall" x="${wx}" y="20" width="80" height="180"/><rect class="winn" x="${wx + 20}" y="${top - 14}" width="34" height="30"/>
        ${built ? `<line class="ladder" x1="${fx}" y1="200" x2="${wx}" y2="${top}"/>` : `<line class="ladder ghost" x1="${fx}" y1="200" x2="${wx}" y2="${top}"/>`}
        <line class="side" x1="${fx}" y1="200" x2="${wx}" y2="200"/><line class="side" x1="${wx}" y1="200" x2="${wx}" y2="${top}"/>
        <path class="rmark" d="M${wx - 12},200 L${wx - 12},188 L${wx},188"/>${L(b + ' ' + unit, (fx + wx) / 2, 222)}${L(h + ' ' + unit, wx - 26, (200 + top) / 2)}${L('tangga = ?', (fx + wx) / 2 - 26, (200 + top) / 2 - 10)}`;
      from = [fx, 200]; to = [wx - 6, top + 4];
    } else if (sc.kind === 'bridge') {
      const dh = sc.legs[0], gap = sc.legs[1], s = Math.min(150 / gap, 80 / dh), gx = 140, yL = 100, xR = gx + gap * s, yR = yL + dh * s;
      svg = `${sky}<rect class="water" x="${gx}" y="${yR + 10}" width="${gap * s}" height="${240 - yR - 10}"/>
        <rect class="cliff" x="0" y="${yL}" width="${gx}" height="${240 - yL}"/><rect class="cliff" x="${xR}" y="${yR}" width="${400 - xR}" height="${240 - yR}"/>
        ${built ? `<line class="plank" x1="${gx}" y1="${yL}" x2="${xR}" y2="${yR}"/>` : `<line class="plank ghost" x1="${gx}" y1="${yL}" x2="${xR}" y2="${yR}"/>`}
        <line class="side" x1="${gx}" y1="${yL}" x2="${xR}" y2="${yL}"/><line class="side" x1="${xR}" y1="${yL}" x2="${xR}" y2="${yR}"/>
        <path class="rmark" d="M${xR - 12},${yL} L${xR - 12},${yL + 12} L${xR},${yL + 12}"/>
        ${L(gap + ' ' + unit, (gx + xR) / 2, yL - 8)}${L(dh + ' ' + unit, xR + 8, (yL + yR) / 2 + 4, 'start')}${L('papan = ?', (gx + xR) / 2 - 6, (yL + yR) / 2 + 22)}`;
      from = [gx, yL]; to = [xR, yR];
    } else if (sc.kind === 'pole') {
      const tower = sc.skin === 'tower';
      const known = sc.ask === 'leg' ? sc.hypLen : null;
      const hgt = sc.ask === 'leg' ? sc.ans : sc.legs[0], dist = sc.legs[1];
      const s = Math.min(150 / hgt, 190 / dist), px = 80, top = 205 - hgt * s, qx = px + dist * s;
      svg = `${sky}<rect class="ground" x="0" y="205" width="400" height="35"/>
        <rect class="${tower ? 'tower' : 'pole'}" x="${px - (tower ? 7 : 3)}" y="${top}" width="${tower ? 14 : 6}" height="${205 - top}"/>${tower ? '' : `<path class="flag" d="M${px + 3},${top} l26,8 l-26,8 z"/>`}
        ${built ? `<line class="rope" x1="${px}" y1="${top}" x2="${qx}" y2="205"/>` : `<line class="rope ghost" x1="${px}" y1="${top}" x2="${qx}" y2="205"/>`}
        <circle class="pt" cx="${qx}" cy="205" r="5"/><line class="side" x1="${px}" y1="205" x2="${qx}" y2="205"/>
        <path class="rmark" d="M${px + 12},205 L${px + 12},193 L${px},193"/>
        ${L(dist + ' ' + unit, (px + qx) / 2, 226)}${sc.ask === 'leg' ? L('tinggi = ?', px - 6, (205 + top) / 2, 'end') : L(sc.legs[0] + ' ' + unit, px - 12, (205 + top) / 2, 'end')}
        ${L((tower ? 'kabel' : 'tali') + ' = ' + (sc.ask === 'hyp' ? '?' : sc.hypLen + ' ' + unit), (px + qx) / 2 + 14, (205 + top) / 2 - 12)}`;
      from = [px, top]; to = [qx, 205];
    } else {                                  // field
      const p = sc.legs[1], l = sc.legs[0], s = Math.min(280 / p, 150 / l), x0 = 200 - p * s / 2, y0 = 120 - l * s / 2;
      svg = `<rect class="grass" x="0" y="0" width="400" height="240"/><rect class="field" x="${x0}" y="${y0}" width="${p * s}" height="${l * s}"/>
        <line class="side" x1="${x0}" y1="${y0 + l * s}" x2="${x0 + p * s}" y2="${y0 + l * s}"/><line class="side" x1="${x0 + p * s}" y1="${y0}" x2="${x0 + p * s}" y2="${y0 + l * s}"/>
        ${built ? '' : ''}<line class="${built ? 'plank' : 'plank ghost'}" x1="${x0}" y1="${y0 + l * s}" x2="${x0 + p * s}" y2="${y0}"/>
        <path class="rmark" d="M${x0 + p * s - 12},${y0 + l * s} L${x0 + p * s - 12},${y0 + l * s - 12} L${x0 + p * s},${y0 + l * s - 12}"/>
        ${L(p + ' ' + unit, 200, y0 + l * s + 20)}${L(l + ' ' + unit, x0 + p * s + 8, 124, 'start')}${L('diagonal = ?', 200 - 20, 112)}`;
      from = [x0, y0 + l * s]; to = [x0 + p * s, y0];
    }
    return { svg: `<svg class="viz scene" viewBox="0 0 400 240" role="img" aria-label="${esc(sc.title)}">${svg}<g id="hero"></g></svg>`, from, to };
  };

  window.PPViz = V;
})();

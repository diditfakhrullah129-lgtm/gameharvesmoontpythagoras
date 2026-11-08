/* =========================================================
   DUNIA 3D BLOK — mesin WebGL kecil (tanpa pustaka luar, jalan offline)
   - Dunia statis digabung jadi satu buffer; karakter/NPC/koin digambar dinamis tiap frame
   - Tumbukan lingkaran-vs-kotak, kamera orang-ketiga, joystick/WASD
   ========================================================= */
(function () {
  const PP = window.PP;
  const W3 = (PP.W3 = {});

  /* ---------- matriks 4x4 (kolom-utama) ---------- */
  const M = {
    id: () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
    mul(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; },
    T: (x, y, z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1],
    RY: a => { const c = Math.cos(a), s = Math.sin(a); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; },
    RX: a => { const c = Math.cos(a), s = Math.sin(a); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; },
    RZ: a => { const c = Math.cos(a), s = Math.sin(a); return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]; },
    persp(f, asp, n, fa) { const t = 1 / Math.tan(f / 2), nf = 1 / (n - fa); return [t / asp,0,0,0, 0,t,0,0, 0,0,(fa + n) * nf,-1, 0,0,2 * fa * n * nf,0]; },
    look(e, c, u) {
      let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
      let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
      const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      return [xx,yx,zx,0, xy,yy,zy,0, xz,yz,zz,0, -(xx*e[0]+xy*e[1]+xz*e[2]), -(yx*e[0]+yy*e[1]+yz*e[2]), -(zx*e[0]+zy*e[1]+zz*e[2]), 1];
    }
  };
  W3.M = M;

  /* ---------- warna ---------- */
  const hex = h => { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; };
  W3.hex = hex;
  const shade = (c, k) => [Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k)];

  /* ---------- buffer kotak ---------- */
  const FACES = [
    { s: 1.0,  v: [[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]] },
    { s: 0.5,  v: [[-1,-1,1],[1,-1,1],[1,-1,-1],[-1,-1,-1]] },
    { s: 0.84, v: [[-1,-1,1],[-1,1,1],[1,1,1],[1,-1,1]] },
    { s: 0.84, v: [[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,-1]] },
    { s: 0.68, v: [[1,-1,1],[1,1,1],[1,1,-1],[1,-1,-1]] },
    { s: 0.68, v: [[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1]] }
  ];
  const QI = [0, 1, 2, 0, 2, 3];
  class Buf {
    constructor(boxes) { this.a = new Float32Array(boxes * 216); this.n = 0; }
    grow() { const b = new Float32Array(this.a.length * 2); b.set(this.a); this.a = b; }
    clear() { this.n = 0; }
    get boxes() { return this.n / 216; }
    /* kotak: pusat (cx,cy,cz) lokal, ukuran (w,h,d); m = matriks model (opsional) */
    box(cx, cy, cz, w, h, d, col, m, jit) {
      if (this.n + 216 > this.a.length) this.grow();
      const a = this.a; let n = this.n; const hw = w / 2, hh = h / 2, hd = d / 2;
      const j = jit || 1;
      for (let f = 0; f < 6; f++) {
        const F = FACES[f], k = F.s * j, r = col[0] * k, g = col[1] * k, b = col[2] * k;
        for (let t = 0; t < 6; t++) {
          const q = F.v[QI[t]]; let x = cx + q[0] * hw, y = cy + q[1] * hh, z = cz + q[2] * hd;
          if (m) { const X = m[0] * x + m[4] * y + m[8] * z + m[12], Y = m[1] * x + m[5] * y + m[9] * z + m[13], Z = m[2] * x + m[6] * y + m[10] * z + m[14]; x = X; y = Y; z = Z; }
          a[n++] = x; a[n++] = y; a[n++] = z; a[n++] = Math.min(1, r); a[n++] = Math.min(1, g); a[n++] = Math.min(1, b);
        }
      }
      this.n = n;
    }
    /* kotak dengan alas di y0 */
    bx(x, y0, z, w, h, d, col, jit) { this.box(x, y0 + h / 2, z, w, h, d, col, null, jit); }
  }

  /* ---------- karakter blok ---------- */
  const SKINS = ['#f6d3b3', '#e9b98f', '#d19a6a', '#a8714a', '#7a4b2d'];
  W3.defaultLook = function (avatar) {
    const girl = /girl|hijab/.test(avatar || '');
    return { skin: '#e9b98f', shirt: '#3b82f6', pants: '#2d3a5a', hair: '#3a2a1a', style: avatar === 'hijab' ? 'kerudung' : girl ? 'panjang' : 'pendek', hat: avatar === 'teacher' ? 'peci' : 'none' };
  };
  function drawChar(buf, x, y, z, yaw, look, t, moving, scale) {
    const sk = hex(look.skin), sh = hex(look.shirt), pa = hex(look.pants), ha = hex(look.hair);
    const sw = moving ? Math.sin(t * 11) * 0.8 : Math.sin(t * 2) * 0.05;
    const bob = moving ? Math.abs(Math.sin(t * 11)) * 0.06 : 0;
    const s = scale || 1;
    const base = M.mul(M.T(x, y + bob, z), M.mul(M.RY(yaw), [s,0,0,0, 0,s,0,0, 0,0,s,0, 0,0,0,1]));
    const limb = (px, py, ang, w, h, d, col) => buf.box(0, -h / 2, 0, w, h, d, col, M.mul(base, M.mul(M.T(px, py, 0), M.RX(ang))));
    limb(-0.16, 0.58, sw, 0.27, 0.58, 0.27, pa);                 // kaki
    limb(0.16, 0.58, -sw, 0.27, 0.58, 0.27, pa);
    buf.box(0, 0.88, 0, 0.66, 0.6, 0.34, sh, base);              // badan
    limb(-0.44, 1.14, -sw, 0.22, 0.56, 0.24, sh);                // lengan
    limb(0.44, 1.14, sw, 0.22, 0.56, 0.24, sh);
    buf.box(-0.44, 0.62, 0.02, 0.22, 0.12, 0.24, sk, M.mul(base, M.T(0, 0, 0)));  // tangan (sederhana)
    buf.box(0, 1.5, 0, 0.5, 0.5, 0.5, sk, base);                 // kepala
    buf.box(-0.1, 1.55, 0.255, 0.07, 0.07, 0.02, [0.12, 0.1, 0.1], base);   // mata
    buf.box(0.1, 1.55, 0.255, 0.07, 0.07, 0.02, [0.12, 0.1, 0.1], base);
    buf.box(0, 1.4, 0.255, 0.14, 0.03, 0.02, shade(sk, 0.7), base);         // mulut
    const st = look.style;
    if (st === 'kerudung') {
      buf.box(0, 1.55, -0.02, 0.6, 0.62, 0.58, ha, base);
      buf.box(0, 1.52, 0.27, 0.36, 0.34, 0.02, sk, base);                    // wajah tampak di bukaan
      buf.box(-0.1, 1.55, 0.285, 0.07, 0.07, 0.02, [0.12, 0.1, 0.1], base); buf.box(0.1, 1.55, 0.285, 0.07, 0.07, 0.02, [0.12, 0.1, 0.1], base);
      buf.box(0, 1.2, -0.04, 0.7, 0.3, 0.5, ha, base);
    } else if (st !== 'botak') {
      buf.box(0, 1.8, 0, 0.56, 0.14, 0.56, ha, base);
      buf.box(0, 1.58, -0.24, 0.56, 0.5, 0.1, ha, base);
      if (st === 'panjang') buf.box(0, 1.2, -0.25, 0.56, 0.5, 0.1, ha, base);
      if (st === 'jambul') buf.box(0, 1.93, 0.1, 0.3, 0.16, 0.34, ha, base);
      buf.box(0, 1.76, 0.26, 0.56, 0.08, 0.04, ha, base);
    }
    const hat = look.hat;
    if (hat === 'peci') { buf.box(0, 1.9, 0, 0.54, 0.2, 0.54, [0.08, 0.08, 0.1], base); }
    else if (hat === 'merah' || hat === 'biru') { const c = hex(hat === 'merah' ? '#e23b3b' : '#2f6fe0'); buf.box(0, 1.88, 0, 0.58, 0.16, 0.58, c, base); buf.box(0, 1.8, 0.4, 0.5, 0.05, 0.26, shade(c, 0.8), base); }
    else if (hat === 'mahkota') { const c = hex('#f6c437'); buf.box(0, 1.9, 0, 0.56, 0.14, 0.56, c, base); [-0.2, 0, 0.2].forEach(dx => buf.box(dx, 2.04, 0, 0.1, 0.14, 0.1, c, base)); }
  }
  W3.drawChar = drawChar;

  /* ---------- pembangun dunia ---------- */
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const C = {
    grass: ['#6dbb4a', '#64b244', '#74c352'], dgrass: ['#4f9a3a', '#468f35', '#58a640'], sand: ['#e6cf8f', '#dcc482', '#ecd89c'], stone: ['#a9adb5', '#9ba0a8', '#b7bbc2'],
    wood: '#8a5a2b', dwood: '#6d4520', leaf: ['#3f9a45', '#368a3c', '#49a84e'], pine: ['#2f7d4a', '#276d3f'], red: '#d9534f', blue: '#4f8cf0', green: '#4cc06a', yellow: '#f6c437', white: '#f4f1e8', rock: ['#b0594a', '#a04e41', '#c0665a'],
    water: '#3b8ee0', purple: ['#7b6bb8', '#6e5eab'], gold: '#f2c14e', cyan: '#5ee7ff'
  };

  /* data tiap dunia: langit, kabut, spawn, posisi NPC */
  const THEMES = {
    1: { sky: '#8fd3f4', ground: C.grass, half: 20, spawn: [0, 12], npc: [[-8, 2], [8, 0], [0, -9], [-12, 9]] },
    2: { sky: '#a6e3b8', ground: C.dgrass, half: 20, spawn: [0, 13], npc: [[-9, 4], [9, 2], [2, -9], [-3, 9]] },
    3: { sky: '#9ad8ff', ground: C.grass, half: 20, spawn: [0, 14], npc: [[-9, 0], [9, -1], [0, -10], [-9, 10]] },
    4: { sky: '#ffcf94', ground: C.sand, half: 20, spawn: [0, 14], npc: [[-9, 1], [9, 1], [0, -10], [8, 10]] },
    5: { sky: '#a8e0ff', ground: C.grass, half: 20, spawn: [0, 13], npc: [[-9, 8], [9, 8], [0, 0], [-10, -9]] },
    6: { sky: '#b6a2ff', ground: C.stone, half: 20, spawn: [0, 15], npc: [[-8, 4], [8, 4], [0, -2], [-10, 12]] }
  };

  W3.buildWorld = function (id) {
    const th = THEMES[id], R = rng(id * 7919 + 13), buf = new Buf(2600), solids = [], gems = [], labels = [], dyn = [];
    const half = th.half, keep = [];                              // titik yang harus bebas
    th.npc.forEach(p => keep.push([p[0], p[1], 2.6])); keep.push([th.spawn[0], th.spawn[1], 3]);
    const free = (x, z, r) => keep.every(k => Math.hypot(x - k[0], z - k[1]) > k[2] + r) && solids.every(s => !(x > s.x0 - r && x < s.x1 + r && z > s.z0 - r && z < s.z1 + r));
    const pick = arr => arr[Math.floor(R() * arr.length)];
    const solid = (x, z, w, d, h) => solids.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, h: h || 3 });

    /* tanah */
    const waterBand = id === 5;
    for (let gx = -half; gx < half; gx++) for (let gz = -half; gz < half; gz++) {
      const x = gx + 0.5, z = gz + 0.5;
      if (waterBand && z > -5 && z < 5) { buf.bx(x, -1, z, 1, 0.75, 1, hex(C.water), 0.92 + R() * 0.12); continue; }
      let col = pick(th.ground);
      if (id === 3 && Math.abs(x) < 7 && Math.abs(z) < 7) col = ((gx + gz) & 1) ? '#e9e6dc' : '#b8bcc4';
      if (id === 6 && ((gx + gz) & 1)) col = '#c4c7d2';
      if (id === 4 && Math.abs(x) < 2.1) col = '#d6b870';
      buf.bx(x, -0.6, z, 1, 0.6, 1, hex(col), 0.94 + R() * 0.1);
    }
    if (waterBand) { solid(0, -3, 2 * half, 4.2, 3); solid(0, 3, 2 * half, 4.2, 3); }

    /* bangunan dasar */
    const tree = (x, z, h, pine) => {
      h = h || 2 + R() * 1.4; buf.bx(x, 0, z, 0.55, h, 0.55, hex(C.wood));
      if (pine) { for (let i = 0; i < 4; i++) buf.bx(x, h - 0.4 + i * 0.85, z, 2.6 - i * 0.62, 0.9, 2.6 - i * 0.62, hex(pick(C.pine)), 0.95 + R() * 0.1); }
      else { buf.bx(x, h - 0.2, z, 2.6, 1.3, 2.6, hex(pick(C.leaf))); buf.bx(x, h + 1.0, z, 1.8, 1.0, 1.8, hex(pick(C.leaf))); buf.bx(x, h + 1.8, z, 0.9, 0.6, 0.9, hex(pick(C.leaf))); }
      solid(x, z, 0.9, 0.9, 4);
    };
    const house = (x, z, w, d, wall, roof, hgt) => {
      hgt = hgt || 2.4; buf.bx(x, 0, z, w, hgt, d, hex(wall), 0.97 + R() * 0.06);
      const n = Math.ceil(Math.min(w, d) / 0.9);
      for (let i = 0; i < n; i++) buf.bx(x, hgt + i * 0.5, z, w + 0.4 - i * 0.9, 0.5, d + 0.4 - i * 0.7 > 0 ? d + 0.4 - i * 0.7 : 0.4, hex(roof));
      buf.bx(x, 0, z + d / 2 + 0.01, 0.8, 1.5, 0.08, hex('#5b3a1c'));
      buf.bx(x + w / 2 - 0.9, 1.1, z + d / 2 + 0.02, 0.6, 0.6, 0.08, hex('#bfe6ff'));
      buf.bx(x - w / 2 + 0.9, 1.1, z + d / 2 + 0.02, 0.6, 0.6, 0.08, hex('#bfe6ff'));
      solid(x, z, w, d, 4);
    };
    const tri = (x, z, n, col, rot) => {           // segitiga siku-siku dari balok (tinggi menurun)
      for (let i = 0; i < n; i++) { const hh = n - i; if (rot) buf.bx(x + i, 0, z, 1, hh, 1, hex(pick(col)), 0.95 + R() * 0.08); else buf.bx(x, 0, z + i, 1, hh, 1, hex(pick(col)), 0.95 + R() * 0.08); }
      if (rot) solid(x + (n - 1) / 2, z, n, 1, n); else solid(x, z + (n - 1) / 2, 1, n, n);
    };
    const flower = (x, z) => { buf.bx(x, 0, z, 0.1, 0.35, 0.1, hex('#3d8f3a')); buf.bx(x, 0.35, z, 0.3, 0.2, 0.3, hex(pick(['#ff6b8b', '#ffd23f', '#ffffff', '#b784f5']))); };
    const rock = (x, z, s) => { buf.bx(x, 0, z, s, s * 0.7, s, hex(pick(C.stone))); buf.bx(x + 0.1, s * 0.7, z, s * 0.6, s * 0.4, s * 0.6, hex(pick(C.stone))); solid(x, z, s, s, 1.2); };
    const fence = (x0, z0, x1, z1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0))); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; buf.bx(x, 0, z, 0.18, 1, 0.18, hex(C.wood)); } buf.bx((x0 + x1) / 2, 0.6, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.2, 0.14, Math.abs(z1 - z0) + 0.2, hex(C.dwood)); };
    const tower = (x, z, w, h, col, banner) => {
      buf.bx(x, 0, z, w, h, w, hex(col)); buf.bx(x, h, z, w + 0.4, 0.4, w + 0.4, shade(hex(col), 0.9));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(q => buf.bx(x + q[0] * (w / 2 + 0.1), h + 0.4, z + q[1] * (w / 2 + 0.1), 0.5, 0.6, 0.5, hex(col)));
      if (banner) { buf.bx(x, h + 0.8, z, 0.12, 1.8, 0.12, hex('#5b4b3a')); buf.bx(x + 0.5, h + 2.0, z, 0.9, 0.55, 0.06, hex('#d94a4a')); }
      solid(x, z, w, w, h + 1);
    };
    const label = (x, y, z, text, cls) => labels.push({ x, y, z, text, cls: cls || '' });
    const square = (x, z, s, col, text) => { buf.bx(x, 0, z, s, 0.12, s, hex(col)); label(x, 0.5, z, text, 'sq'); };

    /* ===== tema per dunia ===== */
    if (id === 1) {                                              // Gerbang Geometri
      [-2.2, 2.2].forEach(dx => buf.bx(dx, 0, -4, 1, 4.2, 1, hex(C.stone[1])));
      buf.bx(0, 4.2, -4, 5.4, 1, 1.2, hex(C.stone[2]));
      for (let i = 0; i < 5; i++) buf.bx(-2.2 + i * 1.1, 5.2, -4, 0.6, 0.5, 0.6, hex(C.stone[0]));
      solid(-2.2, -4, 1.2, 1.2, 5); solid(2.2, -4, 1.2, 1.2, 5);
      W3._portal = { x: 0, z: -4 }; dyn.push('portal');
      tri(-14, -3, 5, C.stone, false); tri(12, -4, 4, C.rock, false);
      label(-13.5, 5.5, -1, '90° ┘', 'sq'); label(12.5, 4.6, -2, 'siku-siku', 'sq');
      for (let i = 0; i < 28; i++) { const x = (R() - 0.5) * 2 * (half - 2), z = (R() - 0.5) * 2 * (half - 2); if (free(x, z, 1.4) && Math.abs(x) > 3.6 || free(x, z, 1.4) && z > -2) { R() < 0.55 ? tree(x, z, 0, false) : flower(x, z); } }
      fence(-5, 17, 5, 17);
    } else if (id === 2) {                                       // Hutan Sisi Segitiga
      for (let i = 0; i < 70; i++) { const x = (R() - 0.5) * 2 * (half - 1.5), z = (R() - 0.5) * 2 * (half - 1.5); if (free(x, z, 1.5)) tree(x, z, 2.4 + R() * 1.6, R() < 0.6); }
      tri(-5, -1, 4, C.stone, false); tri(5, 1, 5, C.rock, true);
      label(-4.6, 4.4, 1.5, 'sisi tegak', 'sq'); label(7, 5.6, 1.6, 'sisi miring', 'sq');
      for (let i = 0; i < 24; i++) { const x = (R() - 0.5) * 2 * (half - 2), z = (R() - 0.5) * 2 * (half - 2); if (free(x, z, 0.8)) flower(x, z); }
    } else if (id === 3) {                                       // Kerajaan Persegi
      square(-3.5, -3.5, 3, C.blue, 'a² = 9'); square(3.5, -3.5, 4, C.green, 'b² = 16'); square(0, 3, 5, C.red, 'c² = 25');
      house(-13, -10, 5, 4, '#f2d9a6', C.red); house(13, -10, 5, 4, '#e9c6a0', '#3a6fbd'); house(-14, 4, 4, 4, '#d9e7c0', '#a8483a'); house(14, 5, 4, 4, '#f0d0d0', '#5a6b8c');
      tower(-17, -15, 3, 6, '#c9ccd4', true); tower(17, -15, 3, 6, '#c9ccd4', true);
      for (let i = 0; i < 14; i++) { const x = (R() - 0.5) * 2 * (half - 2), z = (R() - 0.5) * 2 * (half - 2); if (free(x, z, 1.4) && Math.hypot(x, z) > 9) tree(x, z, 0, false); }
      fence(-8, 16, 8, 16);
    } else if (id === 4) {                                       // Lembah Pythagoras
      for (let i = -half; i < half; i++) { [-half + 0.5, half - 0.5].forEach(z => buf.bx(i + 0.5, 0, z, 1, 3 + R() * 5, 1, hex(pick(C.rock)))); [-half + 0.5, half - 0.5].forEach(x => buf.bx(x, 0, i + 0.5, 1, 3 + R() * 5, 1, hex(pick(C.rock)))); }
      for (let i = 0; i < 18; i++) { const x = (R() - 0.5) * 2 * (half - 3), z = (R() - 0.5) * 2 * (half - 3); if (free(x, z, 1.6)) { const h = 2 + R() * 4, w = 1.5 + R(); buf.bx(x, 0, z, w, h, w, hex(pick(C.rock))); solid(x, z, w, w, h); } }
      for (let i = 0; i < 12; i++) { const x = (R() - 0.5) * 2 * (half - 3), z = (R() - 0.5) * 2 * (half - 3); if (free(x, z, 1)) { buf.bx(x, 0, z, 0.5, 1.6, 0.5, hex('#3f9a45')); buf.bx(x + 0.45, 0.8, z, 0.4, 0.2, 0.3, hex('#3f9a45')); buf.bx(x + 0.55, 0.8, z, 0.2, 0.7, 0.3, hex('#3f9a45')); solid(x, z, 0.7, 0.7, 2); } }
      label(0, 4.5, -4, 'a² + b² = c²', 'sq big'); buf.bx(0, 0, -4, 3, 0.15, 1.2, hex(C.gold)); tri(-6, 8, 3, C.rock, false);
    } else if (id === 5) {                                       // Jembatan Tantangan
      for (let x = -half; x < half; x++) buf.bx(x + 0.5, -0.05, 0, 1, 0.3, 2.4, hex(x % 2 ? '#a9743a' : '#9a6830'));
      for (let x = -half + 1; x < half; x += 3) { buf.bx(x, 0, -1.3, 0.25, 1.2, 0.25, hex(C.dwood)); buf.bx(x, 0, 1.3, 0.25, 1.2, 0.25, hex(C.dwood)); }
      buf.bx(0, 0.9, -1.3, 2 * half, 0.12, 0.12, hex(C.dwood)); buf.bx(0, 0.9, 1.3, 2 * half, 0.12, 0.12, hex(C.dwood));
      solid(0, -1.45, 2 * half, 0.25, 2); solid(0, 1.45, 2 * half, 0.25, 2);
      for (let i = 0; i < 22; i++) { const x = (R() - 0.5) * 2 * (half - 2), z = (R() > 0.5 ? 1 : -1) * (6.5 + R() * 11); if (free(x, z, 1.4)) tree(x, z, 0, false); }
      house(-14, 13, 4.5, 3.5, '#f2d9a6', C.red); house(14, -12, 4.5, 3.5, '#d9e7c0', '#3a6fbd');
      label(-8, 2.3, 0, 'tangga 2,5 m', 'sq'); label(8, 2.3, 0, 'tali 17 m', 'sq');
    } else {                                                     // Istana Matematika
      buf.bx(0, 0, -13, 16, 7, 6, hex('#d7d3e6')); [-6, -2, 2, 6].forEach(dx => buf.bx(dx, 7, -13, 1.6, 1, 1.6, hex('#d7d3e6')));
      buf.bx(0, 0, -9.9, 3.2, 3.6, 0.3, hex('#5b3a1c')); buf.bx(0, 3.6, -9.9, 3.8, 0.5, 0.4, hex(C.gold));
      solid(0, -13, 16, 6, 8);
      tower(-10, -13, 3.4, 10, '#c9c3e3', true); tower(10, -13, 3.4, 10, '#c9c3e3', true); tower(-16, -4, 3, 7, '#c9c3e3', false); tower(16, -4, 3, 7, '#c9c3e3', false);
      [[-6, 2], [6, 2], [-6, 8], [6, 8]].forEach(p => { buf.bx(p[0], 0, p[1], 1, 3, 1, hex('#d7d3e6')); buf.bx(p[0], 3, p[1], 1.4, 0.4, 1.4, hex(C.gold)); buf.bx(p[0], 3.4, p[1], 0.4, 0.5, 0.4, hex('#ff9d3b')); solid(p[0], p[1], 1.2, 1.2, 4); });
      label(0, 9.5, -9.6, 'ISTANA MATEMATIKA', 'sq big');
    }

    /* mutiara/koin (tersebar di tempat bebas) */
    for (let i = 0, t = 0; i < 8 && t < 200; t++) { const x = (R() - 0.5) * 2 * (half - 3), z = (R() - 0.5) * 2 * (half - 3); if (free(x, z, 0.9) && !(waterBand && Math.abs(z) < 5.5 && Math.abs(z) > 0.9)) { gems.push({ x, z, got: false }); keep.push([x, z, 0.6]); i++; } }

    return { id, buf, solids, gems, labels, theme: th, sky: hex(th.sky), half, portal: id === 1 || id === 6 ? { x: 0, z: id === 1 ? -4 : -9.9 } : null };
  };

  /* ---------- mesin ---------- */
  W3.create = function (canvas, world, opts) {
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' }) || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec3 p;attribute vec3 c;uniform mat4 m;varying vec3 vc;varying float vd;void main(){gl_Position=m*vec4(p,1.0);vc=c;vd=gl_Position.w;}'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec3 vc;varying float vd;uniform vec3 fog;uniform vec2 fr;void main(){float f=clamp((vd-fr.x)/(fr.y-fr.x),0.0,1.0);gl_FragColor=vec4(mix(vc,fog,f),1.0);}'));
    gl.linkProgram(prog); gl.useProgram(prog);
    const aP = gl.getAttribLocation(prog, 'p'), aC = gl.getAttribLocation(prog, 'c'), uM = gl.getUniformLocation(prog, 'm'), uF = gl.getUniformLocation(prog, 'fog'), uR = gl.getUniformLocation(prog, 'fr');
    const sbuf = gl.createBuffer(), dbuf = gl.createBuffer(), dyn = new Buf(400);
    gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.bufferData(gl.ARRAY_BUFFER, world.buf.a.subarray(0, world.buf.n), gl.STATIC_DRAW);
    const sverts = world.buf.n / 6;
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);

    const look = opts.look, E = {
      gl, world, canvas, t: 0, look,
      p: { x: world.theme.spawn[0], y: 0, z: world.theme.spawn[1], vy: 0, yaw: Math.PI, vx: 0, vz: 0, moving: false, ground: true },
      cam: { yaw: 0, pitch: 0.9, dist: 15, tx: 0, ty: 1, tz: 0, focus: false },
      input: { x: 0, y: 0, jump: false }, npcs: [], gems: world.gems, near: null, mvp: null, w: 1, h: 1, onGem: null, onJump: null, paused: false
    };
    world.theme.npc.forEach((p, i) => E.npcs.push({ x: p[0], z: p[1], yaw: 0, look: null, done: false, i, name: '' }));
    E.cam.tx = E.p.x; E.cam.tz = E.p.z;

    E.resize = function () {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth || 300, h = canvas.clientHeight || 200;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); E.w = w; E.h = h; gl.viewport(0, 0, canvas.width, canvas.height);
    };
    E.project = function (x, y, z) {
      const m = E.mvp; if (!m) return null;
      const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
      if (cw <= 0.1) return null; return { x: (cx / cw * 0.5 + 0.5) * E.w, y: (1 - (cy / cw * 0.5 + 0.5)) * E.h, d: cw };
    };

    function collide(p) {
      const r = 0.38; const hl = world.half - 1.2;
      p.x = Math.max(-hl, Math.min(hl, p.x)); p.z = Math.max(-hl, Math.min(hl, p.z));
      for (const s of world.solids) {
        const cx = Math.max(s.x0, Math.min(p.x, s.x1)), cz = Math.max(s.z0, Math.min(p.z, s.z1)), dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
        if (d2 < r * r) {
          if (d2 > 1e-6) { const d = Math.sqrt(d2), k = (r - d) / d; p.x += dx * k; p.z += dz * k; }
          else { const l = p.x - s.x0, rr = s.x1 - p.x, t = p.z - s.z0, b = s.z1 - p.z, m = Math.min(l, rr, t, b); if (m === l) p.x = s.x0 - r; else if (m === rr) p.x = s.x1 + r; else if (m === t) p.z = s.z0 - r; else p.z = s.z1 + r; }
        }
      }
      for (const n of E.npcs) { const dx = p.x - n.x, dz = p.z - n.z, d = Math.hypot(dx, dz); if (d < 0.85 && d > 1e-6) { p.x = n.x + dx / d * 0.85; p.z = n.z + dz / d * 0.85; } }
    }

    E.update = function (dt) {
      dt = Math.min(dt, 0.05); E.t += dt;
      const p = E.p, c = E.cam, inp = E.input;
      if (!E.paused) {
        const f = [-Math.sin(c.yaw), -Math.cos(c.yaw)], r = [Math.cos(c.yaw), -Math.sin(c.yaw)];
        let mx = f[0] * inp.y + r[0] * inp.x, mz = f[1] * inp.y + r[1] * inp.x; const mag = Math.min(1, Math.hypot(mx, mz));
        const sp = 5.6;
        if (mag > 0.05) { const l = Math.hypot(mx, mz); mx /= l; mz /= l; p.vx += (mx * sp * mag - p.vx) * Math.min(1, dt * 14); p.vz += (mz * sp * mag - p.vz) * Math.min(1, dt * 14); let ty = Math.atan2(mx, mz), dy = ty - p.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; p.yaw += dy * Math.min(1, dt * 14); }
        else { p.vx *= Math.max(0, 1 - dt * 12); p.vz *= Math.max(0, 1 - dt * 12); }
        p.moving = Math.hypot(p.vx, p.vz) > 0.6;
        p.x += p.vx * dt; p.z += p.vz * dt; collide(p);
        if (inp.jump && p.y <= 0.001) { p.vy = 7.2; if (E.onJump) E.onJump(); }
        inp.jump = false;
        p.vy -= 22 * dt; p.y += p.vy * dt; if (p.y < 0) { p.y = 0; p.vy = 0; }
        // mutiara
        E.gems.forEach(g => { if (!g.got && Math.hypot(g.x - p.x, g.z - p.z) < 1.05) { g.got = true; E.onGem && E.onGem(g); } });
        // NPC terdekat
        let best = null, bd = 2.4; E.npcs.forEach(n => { const d = Math.hypot(n.x - p.x, n.z - p.z); if (d < bd) { bd = d; best = n; } }); E.near = best;
        E.npcs.forEach(n => { const tx = E.near === n ? Math.atan2(p.x - n.x, p.z - n.z) : n.yaw; let dy = tx - n.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; n.yaw += dy * Math.min(1, dt * 6); });
      }
      // kamera
      const dist = c.focus ? 5.4 : c.dist * (E.h > E.w ? 1.18 : 1), pitch = c.focus ? 0.28 : c.pitch;
      c.cd = (c.cd == null ? dist : c.cd + (dist - c.cd) * Math.min(1, dt * 9)); c.cp = (c.cp == null ? pitch : c.cp + (pitch - c.cp) * Math.min(1, dt * 9));
      const ty = c.focus ? 1.0 : 1.1, k = Math.min(1, dt * 6);
      c.tx += (p.x - c.tx) * k; c.tz += (p.z - c.tz) * k; c.ty += (p.y + ty - c.ty) * k;
    };

    E.render = function () {
      const p = E.p, c = E.cam, w = world;
      const asp = canvas.width / canvas.height;
      const ex = c.tx + Math.sin(c.yaw) * Math.cos(c.cp) * c.cd, ey = c.ty + Math.sin(c.cp) * c.cd, ez = c.tz + Math.cos(c.yaw) * Math.cos(c.cp) * c.cd;
      let target = [c.tx, c.ty, c.tz], eye = [ex, ey, ez];
      if (c.focus) {
        target = [c.tx, c.ty - (E.h > E.w ? 1.0 : 0.15), c.tz];
        if (E.w > E.h) { const sx = Math.cos(c.yaw) * 1.7, sz = -Math.sin(c.yaw) * 1.7; target[0] += sx; target[2] += sz; eye[0] += sx; eye[2] += sz; }   // landscape: tokoh di kiri, panel di kanan
      }
      E.mvp = M.mul(M.persp(c.focus ? 0.8 : 0.9, asp, 0.3, 140), M.look(eye, target, [0, 1, 0]));
      gl.clearColor(w.sky[0], w.sky[1], w.sky[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(uM, false, new Float32Array(E.mvp)); gl.uniform3f(uF, w.sky[0], w.sky[1], w.sky[2]); gl.uniform2f(uR, 22, 52);
      // dinamis
      dyn.clear(); const t = E.t;
      drawChar(dyn, p.x, p.y, p.z, p.yaw, E.look, t, p.moving && !E.paused);
      E.npcs.forEach(n => {
        if (!n.look) return; drawChar(dyn, n.x, 0, n.z, n.yaw, n.look, t + n.i * 1.7, false);
        const by = 2.5 + Math.sin(t * 3 + n.i) * 0.12;
        if (!n.done) { const gold = [1, 0.82, 0.2]; dyn.box(n.x, by + 0.28, n.z, 0.16, 0.5, 0.16, gold, M.RY(0)); dyn.box(n.x, by - 0.08, n.z, 0.16, 0.14, 0.16, gold); }
        else { const gr = [0.3, 0.85, 0.45], m = M.mul(M.T(n.x, by, n.z), M.RY(t * 2)); dyn.box(0.1, 0.0, 0, 0.5, 0.14, 0.14, gr, M.mul(m, M.RZ(-0.8))); dyn.box(-0.2, -0.12, 0, 0.26, 0.14, 0.14, gr, M.mul(m, M.RZ(0.8))); }
      });
      E.gems.forEach((g, i) => { if (g.got) return; const m = M.mul(M.T(g.x, 0.9 + Math.sin(t * 2.5 + i) * 0.18, g.z), M.mul(M.RY(t * 2 + i), M.RX(0.6))); dyn.box(0, 0, 0, 0.42, 0.42, 0.42, [0.37, 0.9, 1], m); dyn.box(0, 0, 0, 0.26, 0.26, 0.26, [0.85, 1, 1], M.mul(m, M.RZ(0.8))); });
      if (w.portal) { const pr = w.portal; for (let i = 0; i < 9; i++) { const a = t * 1.5 + i * 0.7, rr = 0.5 + (i % 3) * 0.55; dyn.box(pr.x + Math.cos(a) * rr * 1.2, 1.6 + Math.sin(a * 1.3) * 1.0 + (i % 3) * 0.4, pr.z + 0.1 + Math.sin(a) * 0.15, 0.4, 0.4, 0.4, w.id === 1 ? [0.35, 0.9, 1] : [1, 0.8, 0.3], M.RY(a)); } }
      if (opts.extra) opts.extra(dyn, t, E);
      // gambar statis
      gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.enableVertexAttribArray(aP); gl.enableVertexAttribArray(aC);
      gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(aC, 3, gl.FLOAT, false, 24, 12); gl.drawArrays(gl.TRIANGLES, 0, sverts);
      gl.bindBuffer(gl.ARRAY_BUFFER, dbuf); gl.bufferData(gl.ARRAY_BUFFER, dyn.a.subarray(0, dyn.n), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribPointer(aC, 3, gl.FLOAT, false, 24, 12); gl.drawArrays(gl.TRIANGLES, 0, dyn.n / 6);
    };
    E.dispose = function () { try { const x = gl.getExtension('WEBGL_lose_context'); x && x.loseContext(); } catch (e) {} };
    E.resize();
    return E;
  };
})();

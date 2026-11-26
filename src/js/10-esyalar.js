/* ================= Eşyalar ================= */
const furnGroup = new T.Group(); scene.add(furnGroup);
const items = new Map();
function finishItem(g, w, d, op){ g.add(softShadow(w, d, op)); g.traverse(o => { if (o.isMesh) o.userData.owner = g; }); return g; }
function buildSofa(){
  const g = new T.Group(), L = 3.4, D = 0.95;
  g.add(box(L, 0.28, D, MAT.fabric, 0, 0.19, 0));
  const sw = (L - 0.36) / 3;
  for (let i = 0; i < 3; i++) g.add(box(sw - 0.02, 0.14, D - 0.27, MAT.fabric, -L / 2 + 0.18 + sw * (i + 0.5), 0.40, 0.11));
  g.add(box(L - 0.3, 0.44, 0.22, MAT.fabric, 0, 0.55, -D / 2 + 0.11));
  for (let i = 0; i < 3; i++){ const c = box(sw - 0.03, 0.42, 0.16, MAT.leaf, -L / 2 + 0.18 + sw * (i + 0.5), 0.66, -D / 2 + 0.3); c.rotation.x = -0.14; g.add(c); }
  g.add(box(0.18, 0.62, D, MAT.fabric, -L / 2 + 0.09, 0.36, 0));
  g.add(box(0.18, 0.62, D, MAT.fabric, L / 2 - 0.09, 0.36, 0));
  const pillow = box(0.42, 0.42, 0.14, MAT.fabric, L / 2 - 0.42, 0.64, -0.12); pillow.rotation.set(-0.25, 0.3, 0.1); g.add(pillow);
  return finishItem(g, L, D);
}
function buildShelf(){
  // Mevcut kitaplık: 3 modül 55 + 40 + 55 = 150 G × 170 Y × 26 D cm, 5 sıra (üstteki 3 açık, alttaki 2 sıra siyah kapaklı)
  const W3 = [0.55, 0.40, 0.55], H = 1.70, D = 0.26, t = 0.018, base = 0.06, rows = [0.308, 0.306, 0.306, 0.306, 0.306], openRows = 3;
  const g = new T.Group(), z0 = -D / 2, total = 1.5;
  const bx = (x, y, z, w, h, d, m) => { const o = box(w, h, d, m, x + w / 2, y + h / 2, z + d / 2); g.add(o); return o; };
  const matCache = {};
  const cm = (hex, rough) => matCache[hex] || (matCache[hex] = new T.MeshStandardMaterial({color:lin(hex), roughness:rough || 0.6}));
  const steel = cm('#9aa0a6', 0.35);
  const cells = [];
  let x = -total / 2;
  W3.forEach((W, k) => {
    const iw = W - 2 * t;
    bx(x, 0, z0, t, H, D, MAT.oak); bx(x + W - t, 0, z0, t, H, D, MAT.oak);
    bx(x + t, H - t, z0, iw, t, D, MAT.oak);
    bx(x + t, base, z0, iw, t, D, MAT.oak);
    bx(x + t, 0, z0 + D - 0.03, iw, base, 0.018, MAT.oak);
    bx(x + t, base + t, z0, iw, H - base - 2 * t, 0.004, MAT.white);
    let top = H - t;
    rows.forEach((rh, r) => {
      const yb = top - rh;
      if (r < rows.length - 1) bx(x + t, yb - t, z0, iw, t, D, MAT.oak);
      if (r < openRows) cells.push({k, r, x: x + t, w: iw, y: yb});
      top = yb - t;
    });
    const doorTop = H - t - rows.slice(0, openRows).reduce((a, b) => a + b + t, 0);
    bx(x + 0.003, base, z0 + D, W - 0.006, doorTop - base, 0.018, MAT.marble);
    bx(x + 0.015, doorTop - 0.14, z0 + D + 0.018, 0.01, 0.08, 0.006, steel);
    x += W;
  });

  // ---- Eşya yapıcıları (ölçüler cm, origin: tabanın ortası) ----
  const rnd = mulberry32(21);
  const bk = ['#c8b07a', '#2f4f7f', '#a33a2b', '#ddd6c8', '#556b45', '#333', '#7a5a3a'];
  const blk = cm('#202122', 0.5);
  function item(tip, w, h, d, c){
    w /= 100; h /= 100; d /= 100;
    const it = new T.Group();
    if (tip === 'kutu') it.add(box(w, h, d, cm(c), 0, h / 2, 0));
    else if (tip === 'araba'){
      const wr = h * 0.22;
      it.add(box(w, h * 0.38, d * 0.9, cm(c), 0, wr + h * 0.19, 0));
      it.add(box(w * 0.5, h * 0.34, d * 0.8, cm(c), -w * 0.05, wr + h * 0.38 + h * 0.17, 0));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const wh = new T.Mesh(new T.CylinderGeometry(wr, wr, d * 0.1, 10), blk); wh.rotation.x = Math.PI / 2; wh.position.set(a * w * 0.32, wr, b * d * 0.46); it.add(wh); });
    }
    else if (tip === 'silindir'){ const m = new T.Mesh(new T.CylinderGeometry(w / 2, w / 2, h, 16), cm(c)); m.position.y = h / 2; it.add(m); }
    else if (tip === 'kitap'){
      const n = 8, bw = w / n;
      for (let i = 0; i < n; i++){ const bh = h * (0.78 + 0.22 * rnd()); it.add(box(bw * 0.92, bh, d, cm(bk[Math.floor(rnd() * bk.length)]), -w / 2 + bw * (i + 0.5), bh / 2, 0)); }
    }
    else if (tip === 'tabak'){ const m = new T.Mesh(new T.CylinderGeometry(w / 2, w / 2, d, 24), cm(c)); m.rotation.x = Math.PI / 2; m.rotation.z = 0; m.position.y = w / 2; it.add(m); }
    else if (tip === 'eyfel'){ const m = new T.Mesh(new T.ConeGeometry(w * 0.62, h, 4), cm(c)); m.rotation.y = Math.PI / 4; m.position.y = h / 2; it.add(m); }
    else if (tip === 'joystick'){ it.add(box(w, h * 0.25, d, cm(c), 0, h * 0.125, 0)); const s = new T.Mesh(new T.CylinderGeometry(0.018, 0.022, h * 0.75, 10), blk); s.position.y = h * 0.25 + h * 0.375; it.add(s); }
    return it;
  }
  function place(cell, list){
    const items = list.map(a => ({o: item(...a), w: a[1] / 100, d: a[3] / 100}));
    const sum = items.reduce((s, i) => s + i.w, 0);
    const gap = items.length > 1 ? Math.max(-0.004, Math.min(0.012, (cell.w - 0.01 - sum) / (items.length - 1))) : 0;
    let cx = cell.x + Math.max(0.005, (cell.w - sum - gap * (items.length - 1)) / 2);
    items.forEach(i => { i.o.position.set(cx + i.w / 2, cell.y, Math.min(z0 + D - 0.01 - i.d / 2, z0 + D / 2 + 0.02) ); cx += i.w + gap; g.add(i.o); });
  }
  const C = (k, r) => cells.find(c => c.k === k && c.r === r);
  place(C(0, 0), [['kutu', 13, 18, 3, '#2b5fa8'], ['araba', 22, 6, 8, '#8fb3c9'], ['kutu', 8, 5, 4, '#e8c21c']]);
  place(C(0, 1), [['kutu', 36, 10, 22, '#d8a7b1'], ['kutu', 15, 16, 15, '#c9a27a']]);
  place(C(0, 2), [['silindir', 12, 17, 12, '#8a8d90'], ['kutu', 18, 22, 10, '#7a4a2a'], ['araba', 9, 5, 4, '#f2f2f2'], ['kutu', 10, 6, 6, '#e8c21c']]);
  place(C(1, 0), [['kitap', 27, 29, 22, '#7a5a3a'], ['silindir', 8, 11, 8, '#222222']]);
  place(C(1, 1), [['kutu', 19, 18, 15, '#a5784e'], ['kutu', 10, 20, 9, '#b0202a']]);
  place(C(1, 2), [['silindir', 10, 23, 10, '#2f5a3a'], ['silindir', 8, 12, 8, '#f0f0ee'], ['kutu', 17, 11, 14, '#1b1b1b']]);
  place(C(2, 0), [['araba', 28, 11, 12, '#e6d6a8'], ['kutu', 12, 22, 5, '#1e1e1e'], ['silindir', 4, 12, 4, '#2a2a2a']]);
  place(C(2, 1), [['joystick', 15, 22, 18, '#3d5a7a'], ['kutu', 20, 11, 5, '#333333'], ['kutu', 15, 8, 5, '#b12a2a']]);
  place(C(2, 2), [['silindir', 5, 13, 5, '#d9d2c3'], ['silindir', 6, 19, 6, '#d9d6ce'], ['kutu', 9, 10, 6, '#cdbfa5'], ['eyfel', 9, 25, 9, '#b8a27a'], ['tabak', 13, 13, 3, '#8a5a35'], ['silindir', 6, 10, 6, '#c9b28a']]);

  // ---- Kitaplık üstü: ekskavatör, LEGO çekici, 3D yazıcı, filament kurutucu ----
  const ys = H, yel = cm('#e0a526', 0.5);
  const exc = new T.Group();
  exc.add(box(0.28, 0.05, 0.16, blk, 0.05, 0.025, 0));
  exc.add(box(0.22, 0.09, 0.15, yel, 0.06, 0.095, 0));
  exc.add(box(0.10, 0.10, 0.13, yel, 0.08, 0.19, 0));
  const boom = box(0.26, 0.03, 0.04, yel, -0.154, 0.202, 0); boom.rotation.z = -0.5; exc.add(boom);
  exc.add(box(0.03, 0.11, 0.04, yel, -0.265, 0.21, 0));
  exc.add(box(0.07, 0.05, 0.09, yel, -0.285, 0.15, 0));
  exc.position.set(-0.50, ys, 0.0); g.add(exc);
  const trk = new T.Group();
  trk.add(box(0.10, 0.15, 0.14, cm('#f2f2f2'), -0.19, 0.095, 0));
  trk.add(box(0.36, 0.05, 0.15, cm('#e8742c'), 0.06, 0.07, 0));
  const crane = box(0.22, 0.03, 0.03, cm('#2056a8'), 0.02, 0.115, 0); crane.rotation.z = 0.15; trk.add(crane);
  for (let i = 0; i < 6; i++){ const wh = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.17, 10), blk); wh.rotation.x = Math.PI / 2; wh.position.set(-0.17 + i * 0.07, 0.03, 0); trk.add(wh); }
  trk.position.set(-0.03, ys, 0.0); g.add(trk);
  const pr = new T.Group(), gr = cm('#55595f', 0.5);
  pr.add(box(0.358, 0.09, 0.30, gr, 0, 0.045, 0.0));
  pr.add(box(0.235, 0.012, 0.235, blk, 0, 0.096, 0));
  [-0.15, 0.15].forEach(px => pr.add(box(0.03, 0.40, 0.04, gr, px, 0.29, -0.05)));
  pr.add(box(0.358, 0.04, 0.04, gr, 0, 0.47, -0.05));
  pr.add(box(0.05, 0.07, 0.06, blk, 0.04, 0.435, -0.02));
  pr.position.set(0.37, ys, 0.0); g.add(pr);
  const dry = box(0.20, 0.30, 0.25, cm('#3a3d42'), 0.64, ys + 0.15, 0.0); g.add(dry);

  return finishItem(g, total, D);
}
function buildPurifier(){
  const g = new T.Group(), R = 0.155, H = 0.73;
  const body = new T.Mesh(new T.CylinderGeometry(R, R, H, 28), new T.MeshStandardMaterial({color:lin('#eeeeec'), roughness:0.5})); body.position.y = H / 2; g.add(body);
  const cap = new T.Mesh(new T.CylinderGeometry(R * 0.96, R * 0.96, 0.02, 28), MAT.black); cap.position.y = H + 0.01; g.add(cap);
  return finishItem(g, 0.31, 0.31, 0.3);
}
function buildClockPh(){
  const g = new T.Group();
  const d = new T.Mesh(new T.CircleGeometry(0.25, 48), MAT.clock); d.position.set(0, 1.95, 0.002); g.add(d);
  g.traverse(o => { if (o.isMesh) o.userData.owner = g; });
  return g;
}
function buildBooth(){
  const g = new T.Group(), W = 0.74, D = 0.5, H = 1.92;
  const body = new T.Mesh(new T.BoxGeometry(W, H, D), [MAT.booth, MAT.booth, MAT.red, MAT.red, MAT.booth, MAT.red]); body.position.y = H / 2; g.add(body);
  g.add(box(W + 0.06, 0.06, D + 0.06, MAT.red, 0, H + 0.03, 0));
  const vault = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, W + 0.02, 24, 1, false, 0.75, Math.PI - 1.5), MAT.red); vault.rotation.z = Math.PI / 2; vault.scale.set(1, 1, 0.75); vault.position.set(0, H + 0.06 - 0.42 * 0.68, 0); g.add(vault);
  const sign = new T.Mesh(new T.PlaneGeometry(W - 0.1, 0.13), MAT.sign); sign.position.set(0, H - 0.09, D / 2 + 0.002); g.add(sign);
  return finishItem(g, W, D);
}
function buildTableSet(){
  const g = new T.Group(), L = 1.2, W = 0.75, H = 0.75;
  g.add(box(L, 0.035, W, MAT.oak, 0, H - 0.0175, 0));
  g.add(box(L - 0.02, 0.05, W - 0.02, MAT.black, 0, H - 0.06, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(box(0.045, H - 0.04, 0.045, MAT.black, a * (L / 2 - 0.04), (H - 0.04) / 2, b * (W / 2 - 0.04))));
  [-0.3, 0.3].forEach(x => { const c = new T.Group(); c.add(box(0.46, 0.06, 0.46, MAT.leather, 0, 0.47, 0)); const back = box(0.46, 0.42, 0.06, MAT.leather, 0, 0.72, -0.21); back.rotation.x = -0.1; c.add(back); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => c.add(box(0.02, 0.45, 0.02, MAT.black, a * 0.19, 0.225, b * 0.19))); c.position.set(x, 0, -0.62); g.add(c); });
  const bench = new T.Group(); bench.add(box(1.0, 0.08, 0.42, MAT.leather, 0, 0.47, 0)); bench.add(box(1.0, 0.4, 0.06, MAT.leather, 0, 0.72, 0.19)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => bench.add(box(0.025, 0.45, 0.025, MAT.black, a * 0.46, 0.225, b * 0.17))); bench.position.set(0, 0, 0.62); g.add(bench);
  return finishItem(g, L + 0.2, W + 1.1, 0.25);
}
function buildRug(){ const g = new T.Group(); const m = new T.Mesh(new T.PlaneGeometry(2.0, 2.9), MAT.rug); m.rotation.x = -Math.PI / 2; m.position.y = 0.006; g.add(m); g.traverse(o => { if (o.isMesh) o.userData.owner = g; }); return g; }
function buildTvUnit(){
  const g = new T.Group(), W = 0.90, D = 0.26, H = 0.44;
  g.add(box(W, 0.035, D, MAT.walnut, 0, H - 0.0175, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(box(0.04, H - 0.035, 0.04, MAT.black, a * (W / 2 - 0.02), (H - 0.035) / 2, b * (D / 2 - 0.02))));
  g.add(box(W - 0.04, 0.02, D - 0.04, MAT.black, 0, 0.09, 0));
  g.add(box(0.3, 0.07, 0.18, MAT.black, -0.2, 0.135, 0)); g.add(box(0.28, 0.16, 0.2, MAT.leather, 0.28, 0.18, 0));
  const lantern = new T.Mesh(new T.CylinderGeometry(0.09, 0.1, 0.3, 14), new T.MeshStandardMaterial({color:lin('#B88D57'), roughness:0.9})); lantern.position.set(0.32, H + 0.15, 0); g.add(lantern);
  return finishItem(g, W, D);
}
let tvScreen = null;
function buildTvWall(){
  const g = new T.Group(), x = state.dims.room.w / 100;
  const tv = box(0.05, 0.72, 1.25, MAT.black, x - 0.035, 1.14, 3.6); g.add(tv);
  tvScreen = new T.Mesh(new T.PlaneGeometry(1.21, 0.68), MAT.tvOff); tvScreen.rotation.y = -Math.PI / 2; tvScreen.position.set(x - 0.061, 1.14, 3.6); g.add(tvScreen);
  const peg = new T.Mesh(new T.PlaneGeometry(0.76, 0.56), MAT.peg); peg.rotation.y = -Math.PI / 2; peg.position.set(x - 0.02, 1.40, 1.85); g.add(peg);
  g.traverse(o => { if (o.isMesh) o.userData.owner = g; });
  return g;
}
function buildRadiators(){
  const g = new T.Group();
  const r1 = new T.Mesh(new T.BoxGeometry(0.08, 0.6, 1.2), [MAT.radBlack, MAT.radBlack, MAT.black, MAT.black, MAT.black, MAT.black]); r1.position.set(state.dims.room.w / 100 - 0.06, 0.45, 1.9); g.add(r1);
  const r2 = new T.Mesh(new T.BoxGeometry(0.08, 0.6, 1.2), [MAT.radWhite, MAT.radWhite, MAT.white, MAT.white, MAT.white, MAT.white]); r2.position.set(0.06, 0.45, (state.dims.room.l - state.dims.room.c2l - 5 - 60) / 100); g.add(r2);
  g.traverse(o => { if (o.isMesh) o.userData.owner = g; });
  return g;
}
const BUILTIN = [
  {id:'koltuk', name:'Koltuk', build:buildSofa, def:{x:0.6, z:3.83, r:90}, movable:true},
  {id:'hali', name:'Halı', build:buildRug, def:{x:2.15, z:3.85, r:0}, movable:true},
  {id:'tvunite', name:'TV ünitesi', build:buildTvUnit, def:{x:3.83, z:3.6, r:-90}, movable:true},
  {id:'hava', name:'Hava temizleyici', build:buildPurifier, def:{x:3.78, z:2.8, r:0}, movable:true},
  {id:'saat', name:'Duvar saati', build:buildClockPh, def:{x:3.90, z:3.6, r:-90}, movable:false},
  {id:'raf', name:'Kitaplık', build:buildShelf, def:{x:0.14, z:1.0, r:90}, movable:true},
  {id:'kulube', name:'Telefon kulübesi', build:buildBooth, def:{x:2.08, z:0.22, r:0}, movable:true},
  {id:'masa', name:'Yemek masası takımı', build:buildTableSet, def:{x:1.42, z:1.6, r:90}, movable:true},
  {id:'tvduvar', name:'TV, saat ve pano', build:buildTvWall, def:{x:0, z:0, r:0}, movable:false},
  {id:'radyator', name:'Radyatörler', build:buildRadiators, def:{x:0, z:0, r:0}, movable:false}
];
function itemState(id){ return state.furn[id] || (state.furn[id] = {}); }
function applyItemTransform(it){
  const st = itemState(it.id), d = it.def;
  const x = st.x != null ? st.x : d.x, z = st.z != null ? st.z : d.z, r = st.r != null ? st.r : d.r;
  it.group.position.set(x, 0, z); it.group.rotation.y = r * Math.PI / 180;
  if (it.imported){ const s = st.s || it.baseScale; it.group.scale.setScalar(s); }
  it.group.visible = !st.hidden;
  dirty = true;
}
function addBuiltin(def){
  const g = def.build(); g.userData.itemId = def.id; furnGroup.add(g);
  const it = {id:def.id, name:def.name, group:g, def:def.def, movable:def.movable, imported:false};
  items.set(def.id, it); applyItemTransform(it);
}
function buildFurniture(){ BUILTIN.forEach(addBuiltin); }


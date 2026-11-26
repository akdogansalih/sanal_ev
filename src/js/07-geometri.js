/* ================= Geometri yardımcıları ================= */
const M = v => v / 100;
function segInfo(p1, p2){ const dx = p2[0] - p1[0], dz = p2[1] - p1[1], L = Math.hypot(dx, dz), d = [dx / L, dz / L]; return {L, d, n:[-d[1], d[0]]}; }
function wallMatrix(p1, d, n){ const m = new T.Matrix4().makeBasis(new T.Vector3(d[0], 0, d[1]), new T.Vector3(0, 1, 0), new T.Vector3(n[0], 0, n[1])); m.setPosition(p1[0], 0, p1[1]); return m; }
function rectShape(x0, y0, x1, y1){ const s = new T.Shape(); s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.lineTo(x0, y0); return s; }
function box(w, h, d, mat, x, y, z){ const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); return m; }
function softShadow(w, d, op){ const m = new T.Mesh(new T.PlaneGeometry(w * 1.35, d * 1.35), MAT.shadow.clone()); m.material.opacity = op || 0.32; m.rotation.x = -Math.PI / 2; m.position.y = 0.003; m.renderOrder = 1; return m; }

let roomGroup = null;
const wallMeshes = [];
const groupArea = {};
let lightsRef = {};

function buildRoom(){
  if (roomGroup){ scene.remove(roomGroup); roomGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  wallMeshes.length = 0; curtainMeshes.length = 0;
  Object.keys(groupArea).forEach(k => delete groupArea[k]);
  roomGroup = new T.Group();
  const D = state.dims;
  const CH = D.ceil / 100, WH = CH - 0.15, BAND = 0.45, DEPTH = 0.2;
  const Rm = D.room, RW = Rm.w / 100, RL = Rm.l / 100, DX = Rm.dx / 100, DL = Rm.dl / 100, C1W = Rm.c1w / 100, C1D = Rm.c1d / 100, C2W = Rm.c2w / 100, C2L = Rm.c2l / 100;
  const top = M(D.winTop);
  const room = [[0,0],[DX,0],[DX,DL],[RW,DL],[RW,RL],[0,RL]];

  const lw = {z0:M(D.leftWin.z0), z1:M(D.leftWin.z0 + D.leftWin.w), v0:M(D.leftWin.sill), v1:top};
  const bw = {x0:M(D.bigWin.x0), x1:M(D.bigWin.x0 + D.bigWin.w), v0:M(D.bigWin.sill), v1:top};
  const dr = {z0:M(D.door.z0), z1:M(D.door.z0 + D.door.w), v1:M(D.door.h)};

  const segs = [
    {p1:[0,0], p2:[DX,0], g:'ic'},
    {p1:[DX,0], p2:[DX,DL], g:'kapi', holes:[{u0:dr.z0, u1:dr.z1, v0:0, v1:dr.v1, door:true}]},
    {p1:[DX,DL], p2:[RW,DL], g:'kapi'},
    {p1:[RW,DL], p2:[RW,RL], g:'tv'},
    {p1:[RW,RL], p2:[0,RL], g:'brick', holes:[{u0:RW - bw.x1, u1:RW - bw.x0, v0:bw.v0, v1:bw.v1, win:'big'}]},
    {p1:[0,RL], p2:[0,0], g:'koltuk', holes:[{u0:RL - lw.z1, u1:RL - lw.z0, v0:lw.v0, v1:lw.v1, win:'left'}]},
    {p1:[0,C1D], p2:[C1W,C1D], g:'ic', col:true},
    {p1:[C1W,C1D], p2:[C1W,0], g:'ic', col:true},
    {p1:[C2W,RL], p2:[C2W,RL - C2L], g:'koltuk', col:true},
    {p1:[C2W,RL - C2L], p2:[0,RL - C2L], g:'koltuk', col:true}
  ];
  const matFor = g => g === 'tv' ? MAT.stucco : g === 'brick' ? MAT.brick : wallMats[g];

  segs.forEach(sg => {
    const {L, d, n} = segInfo(sg.p1, sg.p2);
    const mtx = wallMatrix(sg.p1, d, n);
    const shape = rectShape(0, 0, L, WH);
    let area = L * WH;
    (sg.holes || []).forEach(h => { const p = new T.Path(); p.moveTo(h.u0, h.v0); p.lineTo(h.u0, h.v1); p.lineTo(h.u1, h.v1); p.lineTo(h.u1, h.v0); p.lineTo(h.u0, h.v0); shape.holes.push(p); area -= (h.u1 - h.u0) * (h.v1 - h.v0); });
    if (!sg.col || true) groupArea[sg.g] = (groupArea[sg.g] || 0) + area;
    const mesh = new T.Mesh(new T.ShapeGeometry(shape), matFor(sg.g));
    mesh.applyMatrix4(mtx);
    mesh.userData.wall = sg.g;
    roomGroup.add(mesh); wallMeshes.push(mesh);

    const local = new T.Group(); local.applyMatrix4(mtx); roomGroup.add(local);
    // süpürgelik
    const gaps = (sg.holes || []).filter(h => h.door || h.v0 < 0.07).map(h => [h.u0, h.u1]);
    let spans = [[0, L]];
    gaps.forEach(([a, b]) => { spans = spans.flatMap(([s, e]) => (b <= s || a >= e) ? [[s, e]] : [[s, a], [b, e]].filter(([x, y]) => y - x > 0.02)); });
    spans.forEach(([s, e]) => local.add(box(e - s, 0.065, 0.014, MAT.skirting, (s + e) / 2, 0.0325, 0.007)));
    // zemin kenar gölgesi
    if (!sg.col){ const ed = new T.Mesh(new T.PlaneGeometry(L, 0.28), MAT.edge); ed.rotation.x = -Math.PI / 2; ed.position.set(L / 2, 0.002, 0.14); ed.rotation.z = 0; local.add(ed); ed.renderOrder = 1; }
    // kartonpiyer profili
    local.add(corniceMesh(L));
    // pencere ve kapı detayları
    (sg.holes || []).forEach(h => {
      const w = h.u1 - h.u0, hh = h.v1 - h.v0, uc = (h.u0 + h.u1) / 2, vc = (h.v0 + h.v1) / 2;
      if (h.door){
        const jamb = MAT.walnut;
        const side1 = new T.Mesh(new T.PlaneGeometry(DEPTH, hh), jamb); side1.rotation.y = Math.PI / 2; side1.position.set(h.u0, vc, -DEPTH / 2); local.add(side1);
        const side2 = new T.Mesh(new T.PlaneGeometry(DEPTH, hh), jamb); side2.rotation.y = -Math.PI / 2; side2.position.set(h.u1, vc, -DEPTH / 2); local.add(side2);
        const head = new T.Mesh(new T.PlaneGeometry(w, DEPTH), jamb); head.rotation.x = Math.PI / 2; head.position.set(uc, h.v1, -DEPTH / 2); local.add(head);
        // kapı kanadı: menteşe yemek köşesi tarafında, odanın içine açılır
        const pivot = new T.Group(); pivot.position.set(h.u0 + 0.005, 0, -0.04); local.add(pivot);
        pivot.add(box(w - 0.01, hh - 0.01, 0.04, MAT.walnut, (w - 0.01) / 2, vc, -0.02));
        pivot.add(box(w * 0.48, hh * 0.62, 0.006, MAT.doorGlass, w / 2, vc + 0.05, 0.003));
        pivot.add(box(w * 0.48, hh * 0.62, 0.006, MAT.doorGlass, w / 2, vc + 0.05, -0.043));
        pivot.add(box(0.12, 0.02, 0.03, MAT.black, w - 0.09, 1.02, 0.015));
        pivot.add(box(0.12, 0.02, 0.03, MAT.black, w - 0.09, 1.02, -0.055));
        pivot.rotation.y = state.doorOpen ? DOOR_OPEN : 0;
        doorPivot = pivot; doorAnim = null;
        local.add(box(0.07, hh + 0.07, 0.016, MAT.walnut, h.u0 - 0.035, (hh + 0.07) / 2, 0.008));
        local.add(box(0.07, hh + 0.07, 0.016, MAT.walnut, h.u1 + 0.035, (hh + 0.07) / 2, 0.008));
        local.add(box(w + 0.14, 0.07, 0.016, MAT.walnut, uc, hh + 0.035, 0.008));
        // kapının arkasındaki koridor (sadece odanın içinden görünür)
        const cor = new T.Mesh(new T.BoxGeometry(w + 0.8, WH, 1.3), MAT.corridor); cor.position.set(uc, WH / 2, -DEPTH - 0.65); local.add(cor); curtainMeshes.push(cor);
        const cf = new T.Mesh(new T.PlaneGeometry(w + 0.8, 1.3), MAT.floor); cf.rotation.x = -Math.PI / 2; cf.position.set(uc, 0.002, -DEPTH - 0.65); local.add(cf); curtainMeshes.push(cf);
        return;
      }
      const sill = new T.Mesh(new T.PlaneGeometry(w, DEPTH), MAT.white); sill.rotation.x = -Math.PI / 2; sill.position.set(uc, h.v0, -DEPTH / 2); local.add(sill);
      const head = new T.Mesh(new T.PlaneGeometry(w, DEPTH), MAT.white); head.rotation.x = Math.PI / 2; head.position.set(uc, h.v1, -DEPTH / 2); local.add(head);
      const s1 = new T.Mesh(new T.PlaneGeometry(DEPTH, hh), MAT.white); s1.rotation.y = Math.PI / 2; s1.position.set(h.u0, vc, -DEPTH / 2); local.add(s1);
      const s2 = new T.Mesh(new T.PlaneGeometry(DEPTH, hh), MAT.white); s2.rotation.y = -Math.PI / 2; s2.position.set(h.u1, vc, -DEPTH / 2); local.add(s2);
      if (h.v0 > 0.05) local.add(box(w + 0.08, 0.025, DEPTH + 0.06, MAT.sill, uc, h.v0 - 0.0125, -DEPTH / 2 + 0.03));
      const gz = -DEPTH + 0.05;
      const glass = new T.Mesh(new T.PlaneGeometry(w, hh), MAT.glass); glass.position.set(uc, vc, gz - 0.01); local.add(glass);
      const fw = 0.065, fd = 0.07;
      local.add(box(w, fw, fd, MAT.pvc, uc, h.v0 + fw / 2, gz));
      local.add(box(w, fw, fd, MAT.pvc, uc, h.v1 - fw / 2, gz));
      local.add(box(fw, hh, fd, MAT.pvc, h.u0 + fw / 2, vc, gz));
      local.add(box(fw, hh, fd, MAT.pvc, h.u1 - fw / 2, vc, gz));
      const parts = w > 2 ? 3 : 2;
      for (let k = 1; k < parts; k++) local.add(box(fw, hh, fd, MAT.pvc, h.u0 + w * k / parts, vc, gz));
      local.userData['win_' + h.win] = {uc, vc, w, hh};
      // perde rayı ve perde
      buildCurtain(local, h, L);
      // ışık konumu
      const wp = new T.Vector3(uc, vc, 0.14).applyMatrix4(mtx), tp = new T.Vector3(uc, vc, 3).applyMatrix4(mtx);
      lightsRef[h.win] = {pos:wp, target:tp, w, h:hh};
    });
  });

  // zemin
  const fs = new T.Shape(); room.forEach(([x, z], i) => i ? fs.lineTo(x, -z) : fs.moveTo(x, -z)); fs.lineTo(room[0][0], -room[0][1]);
  const floor = new T.Mesh(new T.ShapeGeometry(fs), MAT.floor); floor.rotation.x = -Math.PI / 2; floor.userData.floor = true; roomGroup.add(floor);
  groupArea.floor = RW * RL - (RW - DX) * DL;

  // tavan: band + çukur + ana tavan
  const inner = [[BAND, BAND],[DX - BAND, BAND],[DX - BAND, DL + BAND],[RW - BAND, DL + BAND],[RW - BAND, RL - BAND],[BAND, RL - BAND]];
  const bandShape = new T.Shape(); room.forEach(([x, z], i) => i ? bandShape.lineTo(x, z) : bandShape.moveTo(x, z)); bandShape.lineTo(room[0][0], room[0][1]);
  const hole = new T.Path(); inner.forEach(([x, z], i) => i ? hole.lineTo(x, z) : hole.moveTo(x, z)); hole.lineTo(inner[0][0], inner[0][1]); bandShape.holes.push(hole);
  const band = new T.Mesh(new T.ShapeGeometry(bandShape), wallMats.tavan); band.rotation.x = Math.PI / 2; band.position.y = WH; band.userData.wall = 'tavan'; roomGroup.add(band); wallMeshes.push(band);
  const ceilShape = new T.Shape(); inner.forEach(([x, z], i) => i ? ceilShape.lineTo(x, z) : ceilShape.moveTo(x, z)); ceilShape.lineTo(inner[0][0], inner[0][1]);
  const ceil = new T.Mesh(new T.ShapeGeometry(ceilShape), wallMats.tavan); ceil.rotation.x = Math.PI / 2; ceil.position.y = CH; ceil.userData.wall = 'tavan'; roomGroup.add(ceil); wallMeshes.push(ceil);
  groupArea.tavan = groupArea.floor;
  inner.forEach((p, i) => { const q = inner[(i + 1) % inner.length]; const {L, d, n} = segInfo(p, q); const m = new T.Mesh(new T.ShapeGeometry(rectShape(0, WH, L, CH)), MAT.cove); m.applyMatrix4(wallMatrix(p, d, n)); roomGroup.add(m); });
  { const pw = 1.0, pd = 1.5, ph = 0.15, cx = 1.98, cz = 3.55, y0 = CH - ph;
    const bot = new T.Mesh(new T.PlaneGeometry(pw, pd), wallMats.tavan); bot.rotation.x = Math.PI / 2; bot.position.set(cx, y0, cz); roomGroup.add(bot);
    const pts = [[cx - pw / 2, cz - pd / 2], [cx + pw / 2, cz - pd / 2], [cx + pw / 2, cz + pd / 2], [cx - pw / 2, cz + pd / 2]];
    pts.forEach((p, i) => { const q = pts[(i + 3) % 4]; const {L, d, n} = segInfo(p, q); const m = new T.Mesh(new T.ShapeGeometry(rectShape(0, y0, L, CH)), wallMats.tavan); m.applyMatrix4(wallMatrix(p, d, n)); roomGroup.add(m); }); }

  // spot gövdeleri
  spotDiscs.length = 0;
  const spotPts = [[0.225,1.3],[0.225,2.4],[0.225,3.5],[0.225,4.6],[1.1,0.225],[2.2,0.225],[DX - 0.225,0.65],[RW - 0.225,2.2],[RW - 0.225,3.3],[RW - 0.225,4.4],[RW - 0.225,5.4],[0.9,RL - 0.225],[1.9,RL - 0.225],[2.9,RL - 0.225]];
  const panelPts = [[1.73,3.10],[2.23,3.10],[1.73,4.00],[2.23,4.00],[1.98,3.55]];
  spotPts.forEach(([x, z]) => addDisc(x, WH - 0.001, z));
  panelPts.forEach(([x, z]) => addDisc(x, CH - 0.15 - 0.001, z));
  scene.add(roomGroup);
  updateLights(true);
  applyAllColors();
}
const spotDiscs = [];
const curtainMeshes = [];
const DOOR_OPEN = -Math.PI * 0.5;
let doorPivot = null, doorAnim = null;
function toggleDoor(){
  state.doorOpen = !state.doorOpen; save();
  if (!doorPivot) return;
  const to = state.doorOpen ? DOOR_OPEN : 0;
  if (reduceMotion){ doorPivot.rotation.y = to; dirty = true; return; }
  doorAnim = {t0:performance.now(), from:doorPivot.rotation.y, to};
}
function addDisc(x, y, z){ const m = new T.Mesh(new T.CircleGeometry(0.042, 20), MAT.spotOff); m.rotation.x = Math.PI / 2; m.position.set(x, y, z); roomGroup.add(m); spotDiscs.push(m); }
function corniceMesh(L){
  const prof = [[0,2.30],[0.014,2.325],[0.035,2.355],[0.058,2.38],[0.072,2.40],[0.08,2.415],[0.08,2.47]];
  const pos = [];
  for (let i = 0; i < prof.length - 1; i++){
    const [z0, y0] = prof[i], [z1, y1] = prof[i + 1];
    const A = [0, y0, z0], B = [L, y0, z0], C = [L, y1, z1], Dd = [0, y1, z1];
    pos.push(...A, ...B, ...C, ...A, ...C, ...Dd);
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  return new T.Mesh(g, MAT.white);
}
function buildCurtain(local, h, L){
  const mode = state.curtains;
  const ext = 0.25, u0 = Math.max(0.02, h.u0 - ext), u1 = Math.min(L - 0.02, h.u1 + ext);
  const z = 0.11, topY = 2.44, botY = 0.015;
  local.add(box(u1 - u0 + 0.1, 0.02, 0.02, MAT.pvc, (u0 + u1) / 2, topY + 0.01, z));
  if (mode === 'yok') return;
  const H = topY - botY;
  const panels = mode === 'kapali' ? [[u0, u1, 0.022]] : [[u0, u0 + 0.38, 0.05], [u1 - 0.38, u1, 0.05]];
  panels.forEach(([a, b, amp]) => {
    const w = b - a, segs = Math.max(8, Math.round(w * 50));
    const g = new T.PlaneGeometry(w, H, segs, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++){ const x = p.getX(i); p.setZ(i, Math.sin((x + w / 2) / (mode === 'kapali' ? 0.11 : 0.06) * Math.PI * 2) * amp); }
    g.computeVertexNormals();
    const m = new T.Mesh(g, MAT.curtain); m.position.set((a + b) / 2, botY + H / 2, z); m.renderOrder = 2; m.userData.curtain = true; local.add(m); curtainMeshes.push(m);
  });
}


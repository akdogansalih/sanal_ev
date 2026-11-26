/* ================= Işıklar ================= */
const hemi = new T.HemisphereLight(0xdfe5ee, 0x8b8177, 0.6); scene.add(hemi);
const amb = new T.AmbientLight(0xffffff, 0.05); scene.add(amb);
const rectL = new T.RectAreaLight(0xdde6f3, 2, 2.5, 1.45); scene.add(rectL);
const rectB = new T.RectAreaLight(0xdde6f3, 2, 1.7, 2.05); scene.add(rectB);
const spotLights = [];
[[0.225,1.3],[0.225,2.9],[0.225,4.6],[3.735,2.2],[3.735,3.6],[3.735,5.0],[1.9,5.975],[1.6,0.225]].forEach(([x, z]) => {
  const s = new T.SpotLight(0xffcf9c, 3.2, 4.2, 1.05, 0.85, 2); s.position.set(x, 2.44, z); s.target.position.set(x, 0, z); scene.add(s); scene.add(s.target); spotLights.push(s);
});
const centerLight = new T.PointLight(0xffd6a8, 1.0, 6, 2); centerLight.position.set(1.98, 2.5, 3.55); scene.add(centerLight);

function reflectance(st, wallsOnly){
  const s = st || state;
  const A = groupArea; let num = 0, den = 0;
  ['koltuk', 'ic', 'kapi'].forEach(g => { const w = s.walls[g], a = A[g] || 0, f = w.split > 0 ? Math.min(1, w.split / 2.47) : 0; const k = w.rustic ? 0.9 : 0.97; num += a * k * (lum(w.top.hex) * (1 - f) + lum(w.bottom.hex) * f); den += a; });
  num += (A.tv || 0) * lum(s.stucco.hex) * 0.88; den += A.tv || 0;
  const bl = s.brick === 'badana' ? 0.5 : s.brick === 'hafif' ? 0.24 : 0.12; num += (A.brick || 0) * bl; den += A.brick || 0;
  if (wallsOnly) return den ? num / den : 0;
  num += (A.tavan || 0) * lum(s.walls.tavan.top.hex) * 0.97; den += A.tavan || 0;
  num += (A.floor || 0) * 0.5; den += A.floor || 0;
  return den ? num / den : 0;
}
function updateLights(posOnly){
  if (lightsRef.left){ const r = lightsRef.left; rectL.width = r.w; rectL.height = r.h; rectL.position.copy(r.pos); rectL.lookAt(r.target); }
  if (lightsRef.big){ const r = lightsRef.big; rectB.width = r.w; rectB.height = r.h; rectB.position.copy(r.pos); rectB.lookAt(r.target); }
  if (posOnly === true && !roomGroup) return;
  const L = LIGHT_MODES.find(m => m.id === state.light) || LIGHT_MODES[0];
  const R = reflectance();
  const fill = 0.3 + 1.7 * R;
  const curtainLoss = state.curtains === 'kapali' ? 0.8 : 1;
  rectL.intensity = L.win * curtainLoss; rectB.intensity = L.win * 1.15 * curtainLoss;
  rectL.color.setHex(L.winColor); rectB.color.setHex(L.winColor);
  rectL.visible = rectB.visible = L.win > 0;
  hemi.intensity = L.hemi * fill; hemi.color.setHex(L.sky); hemi.groundColor.setHex(L.ground);
  spotLights.forEach(s => { s.visible = L.spots; s.intensity = (L.id === 'aksam' ? 3.4 : 2.6) * (0.75 + 0.5 * R); });
  centerLight.visible = L.spots; centerLight.intensity = L.id === 'aksam' ? 1.1 * fill : 0.7 * fill;
  spotDiscs.forEach(d => { d.material = L.spots ? MAT.spotOn : MAT.spotOff; });
  MAT.glass.color.setScalar(L.glass);
  MAT.curtain.emissiveIntensity = L.glow;
  renderer.toneMappingExposure = state.exposure;
  dirty = true;
}


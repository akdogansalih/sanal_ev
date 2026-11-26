/* ================= Döngü ================= */
function resize(){ const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.85 ? 72 : 60; camera.updateProjectionMatrix(); dirty = true; }
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
let lastInside = null;
function ease(t){ return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function tick(now){
  requestAnimationFrame(tick);
  if (anim){ const t = Math.min(1, (now - anim.t0) / anim.dur), k = ease(t); camera.position.lerpVectors(anim.p0, anim.p1, k); controls.target.lerpVectors(anim.q0, anim.q1, k); if (t >= 1) anim = null; dirty = true; }
  if (doorAnim && doorPivot){ const t = Math.min(1, (now - doorAnim.t0) / 750); doorPivot.rotation.y = doorAnim.from + (doorAnim.to - doorAnim.from) * ease(t); if (t >= 1) doorAnim = null; dirty = true; }
  const ch = controls.update();
  const cp = camera.position, inside = cp.x > -0.05 && cp.x < 4.0 && cp.z > -0.05 && cp.z < 6.25 && cp.y < 2.7;
  if (inside !== lastInside || curtainMeshes.length && curtainMeshes[0].visible !== inside){ lastInside = inside; curtainMeshes.forEach(m => { m.visible = inside; }); ['tvduvar', 'radyator'].forEach(id => { const it = items.get(id); if (it) it.group.visible = inside && !itemState(id).hidden; }); dirty = true; }
  if (ch || dirty){ renderer.render(scene, camera); dirty = false; }
}


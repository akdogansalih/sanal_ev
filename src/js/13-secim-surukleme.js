/* ================= Seçim ve sürükleme ================= */
const ray = new T.Raycaster(), ptr = new T.Vector2(), floorPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
let selected = null, helper = null, drag = null, down = null;
function setPtr(e){ const r = renderer.domElement.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera); }
function hitItem(){
  const vis = []; furnGroup.children.forEach(g => { if (g.visible) vis.push(g); });
  const hits = ray.intersectObjects(vis, true);
  for (const h of hits){ if (h.object.material === MAT.shadow || (h.object.material && h.object.material.map === TEX.shadow)) continue; const g = h.object.userData.owner; if (g) return {g, dist:h.distance}; }
  return null;
}
function hitWall(){ const hits = ray.intersectObjects(wallMeshes, false); return hits.length ? {g:hits[0].object.userData.wall, dist:hits[0].distance} : null; }
function select(id){
  selected = id ? items.get(id) : null;
  if (helper){ scene.remove(helper); helper = null; }
  if (selected){ helper = new T.BoxHelper(selected.group, 0xC9A464); scene.add(helper); }
  $('#objbar').hidden = !selected || !selected.movable;
  if (selected) $('#ob-name').textContent = selected.name;
  renderItems(); renderSelPanel(); dirty = true;
}
const capture = $('#stage');
capture.addEventListener('pointerdown', e => {
  if (e.button !== undefined && e.button !== 0) return;
  setPtr(e);
  down = {x:e.clientX, y:e.clientY, t:performance.now()};
  if (selected && selected.movable){
    const h = hitItem();
    if (h && h.g === selected.group){
      const p = new T.Vector3(); if (ray.ray.intersectPlane(floorPlane, p)){
        drag = {id:e.pointerId, off:new T.Vector3().subVectors(selected.group.position, p)};
        controls.enabled = false;
        try { renderer.domElement.setPointerCapture(e.pointerId); } catch (er) {}
      }
    }
  }
}, true);
window.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  setPtr(e); const p = new T.Vector3();
  if (ray.ray.intersectPlane(floorPlane, p)){
    const x = Math.max(0, Math.min(state.dims.room.w / 100, p.x + drag.off.x)), z = Math.max(0, Math.min(state.dims.room.l / 100, p.z + drag.off.z));
    selected.group.position.x = x; selected.group.position.z = z;
    if (helper) helper.update(); dirty = true;
  }
});
window.addEventListener('pointerup', e => {
  if (drag && e.pointerId === drag.id){
    const st = itemState(selected.id); st.x = +selected.group.position.x.toFixed(3); st.z = +selected.group.position.z.toFixed(3); save();
    drag = null; controls.enabled = true; down = null; return;
  }
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
  if (moved > 7 || dt > 450 || e.target !== renderer.domElement) return;
  setPtr(e);
  const hi = hitItem(), hw = hitWall();
  const hd = doorPivot && doorPivot.visible ? ray.intersectObject(doorPivot, true) : [];
  if (hd.length && (!hi || hd[0].distance <= hi.dist) && (!hw || hd[0].distance <= hw.dist + 0.02)){ toggleDoor(); return; }
  if (hi && (!hw || hi.dist <= hw.dist + 0.02)){ const id = hi.g.userData.itemId; select(id); if (items.get(id).movable) toast(items.get(id).name + ' seçildi; sürükleyerek taşı.'); return; }
  if (selected){ select(null); }
  if (hw){ curWall = hw.g; openTab('renk'); renderWallChips(); renderWallCtrl(); renderPalette(); const gname = GROUPS.find(x => x.id === hw.g).name; toast(gname + ' seçildi.'); }
});
$('#objbar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !selected) return;
  if (b.id === 'ob-done'){ select(null); return; }
  const st = itemState(selected.id), cur = st.r != null ? st.r : selected.def.r;
  st.r = ((cur + (+b.dataset.rot)) % 360 + 360) % 360; applyItemTransform(selected); if (helper) helper.update(); save(); renderSelPanel();
});


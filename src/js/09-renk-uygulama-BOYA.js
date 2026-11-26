/* ================= Renk uygulama ================= */
function applyAllColors(){
  ['koltuk', 'ic', 'kapi', 'tavan'].forEach(g => {
    const w = state.walls[g], m = wallMats[g], u = m.userData.u;
    u.uTop.value.copy(lin(w.top.hex)); u.uBottom.value.copy(lin(w.bottom.hex));
    u.uSplit.value = g === 'tavan' ? 0 : (w.split || 0); u.uStripe.value = w.stripe ? 1 : 0;
    const want = w.rustic ? TEX.rustic : TEX.paint; if (m.map !== want){ m.map = want; m.needsUpdate = true; }
  });
  MAT.stucco.color.copy(lin(state.stucco.hex)).multiplyScalar(1.14);
  const bt = brickTextures(state.brick); MAT.brick.map = bt.map; MAT.brick.bumpMap = bt.bump; MAT.brick.needsUpdate = true;
  updateLights();
  updateMeter();
  dirty = true;
}


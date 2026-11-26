/* ================= Kamera ================= */
const VIEWS = [
  {id:'masa', name:'Yemek masasından', pos:[2.95,1.6,0.95], look:[1.3,1.0,5.4]},
  {id:'koltuk', name:'Koltuktan', pos:[0.8,1.15,3.85], look:[3.96,1.25,3.45]},
  {id:'tv', name:'TV’den', pos:[3.5,1.45,3.75], look:[0,1.15,3.2]},
  {id:'kapi', name:'Kapıdan', pos:[3.3,1.6,0.72], look:[0.4,1.0,4.6]},
  {id:'ic', name:'İç duvara bakış', pos:[2.7,1.5,3.7], look:[1.7,1.05,0]},
  {id:'tugla', name:'Tuğlaya bakış', pos:[1.6,1.5,1.9], look:[2.4,1.2,6.2]},
  {id:'kus', name:'Kuş bakışı', pos:[6.8,6.4,9.0], look:[1.98,0.4,3.1], orbit:true}
];
let anim = null;
function goView(id, instant){
  const v = VIEWS.find(x => x.id === id) || VIEWS[0];
  state.view = v.id; save();
  const pos = new T.Vector3(...v.pos), look = new T.Vector3(...v.look);
  const tgt = v.orbit ? look : pos.clone().add(look.clone().sub(pos).normalize().multiplyScalar(1.6));
  $$('#views button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v.id ? 'true' : 'false'));
  if (instant || reduceMotion){ camera.position.copy(pos); controls.target.copy(tgt); controls.update(); dirty = true; return; }
  anim = {t0:performance.now(), dur:650, p0:camera.position.clone(), p1:pos, q0:controls.target.clone(), q1:tgt};
}


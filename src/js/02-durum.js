/* ================= Durum ================= */
function defaultState(){
  const base = PRESETS[0];
  return {
    walls: {
      koltuk: JSON.parse(JSON.stringify(base.walls.koltuk)),
      ic: JSON.parse(JSON.stringify(base.walls.ic)),
      kapi: JSON.parse(JSON.stringify(base.walls.kapi)),
      tavan: paint(P('Yeni Kar'))
    },
    stucco: base.stucco, brick: 'dogal',
    light: 'kis', exposure: 1.0, curtains: 'kapali', tv: false,
    view: 'masa', furn: {}, custom: [], dims: JSON.parse(JSON.stringify(DIM_DEFAULT)),
    preset: 'mevcut', dimsVer: 5
  };
}
let state = defaultState();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const s = JSON.parse(raw);
    state = Object.assign(defaultState(), s);
    state.walls = Object.assign(defaultState().walls, s.walls || {});
    state.dims = Object.assign(JSON.parse(JSON.stringify(DIM_DEFAULT)), s.dims || {});
    if (s.dimsVer !== 5) state.dims = JSON.parse(JSON.stringify(DIM_DEFAULT));
    state.dimsVer = 5;
  }
} catch (e) {}
let saveTimer = 0;
function save(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }, 300);
}


/* ================= Arayüz ================= */
let curWall = 'koltuk', curTarget = 'top';
function openTab(id){ $$('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false')); $$('.pane').forEach(p => { p.hidden = p.id !== 'pane-' + id; }); if (sheetCollapsed) toggleSheet(false); }
$$('.tabs button').forEach(b => b.addEventListener('click', () => openTab(b.dataset.tab)));
let sheetCollapsed = false;
function toggleSheet(force){ sheetCollapsed = typeof force === 'boolean' ? force : !sheetCollapsed; document.documentElement.style.setProperty('--sheet-h', sheetCollapsed ? '96px' : '47%'); }
$('#handle').addEventListener('click', () => toggleSheet());

function dotHtml(top, bottom, split){ if (split > 0 && bottom && bottom !== top) return '<span class="dot" style="background:linear-gradient(' + top + ' 0 55%,' + bottom + ' 55% 100%)"></span>'; return '<span class="dot" style="background:' + top + '"></span>'; }
function wallSwatch(g){
  if (g.kind === 'stucco') return dotHtml(state.stucco.hex);
  if (g.kind === 'brick') return '<span class="dot" style="background:' + (state.brick === 'badana' ? '#ddd3c6' : state.brick === 'hafif' ? '#b88a70' : '#8d4030') + '"></span>';
  const w = state.walls[g.id]; return dotHtml(w.top.hex, w.bottom.hex, w.split);
}
function renderWallChips(){
  $('#walls').innerHTML = GROUPS.map(g => '<button class="wchip" data-w="' + g.id + '" aria-pressed="' + (g.id === curWall) + '">' + wallSwatch(g) + g.name + '</button>').join('');
}
$('#walls').addEventListener('click', e => { const b = e.target.closest('.wchip'); if (!b) return; curWall = b.dataset.w; curTarget = 'top'; renderWallChips(); renderWallCtrl(); renderPalette(); });

function colorInfo(c){ if (!c) return ''; const known = ALL.find(x => x.hex === c.hex && x.name === c.name); const note = known ? (known.ver ? 'Ekrandaki ton satıcı sayfasındaki RGB değerinden.' : (c.code === 'fotoğraflardan' || c.code === 'kod yok') ? 'Karşılaştırma için.' : 'Ekrandaki ton tahmini; kesin karar fiziksel kartelayla.') : 'Kendi eklediğin ton.'; return '<b>' + c.name + '</b>' + (c.code ? ', ' + c.code : '') + '. LRV yaklaşık ' + lrv(c.hex) + '. ' + note; }
function renderWallCtrl(){
  const g = GROUPS.find(x => x.id === curWall), el = $('#wall-ctrl');
  if (g.kind === 'stucco'){ el.innerHTML = '<p class="info">Stucco tonunu seç. Şu an: ' + colorInfo(state.stucco) + '</p>'; $('#q').hidden = true; return; }
  if (g.kind === 'brick'){
    el.innerHTML = '<div class="seg" id="brick-seg">' + BRICK_OPTS.map(([id, n]) => '<button data-b="' + id + '" aria-pressed="' + (state.brick === id) + '">' + n + '</button>').join('') + '</div><p class="info">Tuğla panelleri beyaz badana ile açmak, odayı aydınlatmanın en hızlı yollarından biri. Doku kalır, ton açılır.</p>';
    $('#q').hidden = true; return;
  }
  $('#q').hidden = false;
  const w = state.walls[g.id];
  let h = '';
  if (g.lambri){
    h += '<label class="rng">Lambri <input type="range" id="split" min="0" max="140" step="5" value="' + Math.round((w.split || 0) * 100) + '"><output id="split-o">' + (w.split > 0 ? Math.round(w.split * 100) + ' cm' : 'tek renk') + '</output></label>';
    if (w.split > 0) h += '<div class="seg" id="target-seg"><button data-t="top" aria-pressed="' + (curTarget === 'top') + '">Üst renk</button><button data-t="bottom" aria-pressed="' + (curTarget === 'bottom') + '">Alt renk</button></div>';
    h += '<div class="row" style="gap:16px">' + (w.split > 0 ? '<label class="check"><input type="checkbox" id="stripe"' + (w.stripe ? ' checked' : '') + '> Ayırma çıtası</label>' : '') + '<label class="check"><input type="checkbox" id="rustic"' + (w.rustic ? ' checked' : '') + '> Rustik eskitme</label></div>';
  }
  const c = (w.split > 0 && curTarget === 'bottom') ? w.bottom : w.top;
  h += '<p class="info">' + colorInfo(c) + '</p>';
  el.innerHTML = h;
}
$('#wall-ctrl').addEventListener('input', e => {
  const w = state.walls[curWall];
  if (e.target.id === 'split'){ const v = +e.target.value; const was = w.split > 0; w.split = v / 100; $('#split-o').textContent = v > 0 ? v + ' cm' : 'tek renk'; if (!was && v > 0 && w.bottom.hex === w.top.hex){ w.bottom = P('Elegan Yeşil'); } if (v === 0) curTarget = 'top'; if (was !== (v > 0)) renderWallCtrl(); afterChange(); }
});
$('#wall-ctrl').addEventListener('change', e => {
  const w = state.walls[curWall];
  if (e.target.id === 'stripe'){ w.stripe = e.target.checked; afterChange(); }
  if (e.target.id === 'rustic'){ w.rustic = e.target.checked; afterChange(); }
});
$('#wall-ctrl').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.t){ curTarget = b.dataset.t; renderWallCtrl(); renderPalette(); }
  if (b.dataset.b){ state.brick = b.dataset.b; state.preset = null; afterChange(); renderWallCtrl(); }
});
function afterChange(){ state.preset = null; applyAllColors(); renderWallChips(); renderPresets(); renderPalette(false); save(); }

function chipHtml(c, sel, custom, idx){
  const est = !c.ver && !custom && c.code !== 'fotoğraflardan' && c.code !== 'kod yok' ? '<span class="est" title="Ekrandaki ton tahmini">≈</span>' : '';
  return '<button class="chip" data-hex="' + c.hex + '" data-name="' + c.name.replace(/"/g, '&quot;') + '" data-code="' + (c.code || '').replace(/"/g, '&quot;') + '" aria-pressed="' + sel + '"><span class="sw" style="background:' + c.hex + '"></span>' + est + (custom ? '<span class="x" role="button" aria-label="Sil" data-del="' + idx + '">×</span>' : '') + '<span class="nm">' + c.name + '</span><span class="cd">' + (c.code || '&nbsp;') + '</span><span class="lr">LRV ' + lrv(c.hex) + '</span></button>';
}
function currentColor(){ const g = GROUPS.find(x => x.id === curWall); if (g.kind === 'stucco') return state.stucco; if (g.kind === 'brick') return null; const w = state.walls[curWall]; return (w.split > 0 && curTarget === 'bottom') ? w.bottom : w.top; }
function renderPalette(){
  const g = GROUPS.find(x => x.id === curWall), el = $('#palette');
  if (g.kind === 'brick'){ el.innerHTML = ''; return; }
  const cur = currentColor(), q = ($('#q').value || '').trim().toLocaleLowerCase('tr');
  const isSel = c => cur && c.hex.toLowerCase() === cur.hex.toLowerCase() && c.name === cur.name;
  const match = c => !q || c.name.toLocaleLowerCase('tr').includes(q) || (c.code || '').toLocaleLowerCase('tr').includes(q);
  let html = '';
  if (g.kind === 'stucco'){
    html += '<div class="fam">Stucco tonları</div><div class="grid">' + STUCCO.map(([n, c, h]) => chipHtml({name:n, code:c, hex:h, ver:true}, isSel({name:n, hex:h}), false)).join('') + '</div>';
  } else {
    if (state.custom.length){ const list = state.custom.map((c, i) => [c, i]).filter(([c]) => match(c)); if (list.length) html += '<div class="fam">Benim renklerim</div><div class="grid">' + list.map(([c, i]) => chipHtml(c, isSel(c), true, i)).join('') + '</div>'; }
    PALETTE.forEach(f => { const list = f.items.map(([name, code, hex, ver]) => ({name, code, hex, ver})).filter(match); if (list.length) html += '<div class="fam">' + f.fam + '</div><div class="grid">' + list.map(c => chipHtml(c, isSel(c), false)).join('') + '</div>'; });
    if (!html) html = '<p class="hint">Bu aramayla eşleşen renk yok. Kodu “Cİ-7422” gibi ya da adın bir kısmını yazmayı dene.</p>';
  }
  el.innerHTML = html;
}
$('#q').addEventListener('input', () => renderPalette());
$('#palette').addEventListener('click', e => {
  const del = e.target.closest('[data-del]');
  if (del){ e.stopPropagation(); state.custom.splice(+del.dataset.del, 1); save(); renderPalette(); return; }
  const b = e.target.closest('.chip'); if (!b) return;
  pickColor({name:b.dataset.name, code:b.dataset.code, hex:b.dataset.hex});
});
function pickColor(c){
  const g = GROUPS.find(x => x.id === curWall);
  if (g.kind === 'stucco') state.stucco = c;
  else if (g.kind === 'paint'){ const w = state.walls[curWall]; if (w.split > 0 && curTarget === 'bottom') w.bottom = c; else { w.top = c; if (!(w.split > 0)) w.bottom = c; } }
  afterChange(); renderWallCtrl();
}

function renderPresets(){ $('#presets').innerHTML = PRESETS.map(p => '<button class="btn" data-p="' + p.id + '" aria-pressed="' + (state.preset === p.id) + '">' + p.name + '</button>').join(''); }
$('#presets').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const p = PRESETS.find(x => x.id === b.dataset.p);
  ['koltuk', 'ic', 'kapi'].forEach(k => { state.walls[k] = JSON.parse(JSON.stringify(p.walls[k])); });
  state.stucco = p.stucco; state.brick = p.brick; state.preset = p.id; curTarget = 'top';
  applyAllColors(); renderPresets(); renderWallChips(); renderWallCtrl(); renderPalette(); save();
  toast(p.name + ' uygulandı.');
});
function updateMeter(){
  if (!groupArea.floor) return;
  const R = reflectance(null, true);
  const base = PRESETS[0], bs = JSON.parse(JSON.stringify(state)); ['koltuk', 'ic', 'kapi'].forEach(k => { bs.walls[k] = base.walls[k]; }); bs.stucco = base.stucco; bs.brick = 'dogal';
  const R0 = reflectance(bs, true);
  const pct = Math.round(R * 100), p0 = Math.round(R0 * 100);
  $('#m-val').textContent = '%' + pct;
  $('#m-bar').style.width = Math.min(100, pct / 0.8) + '%';
  $('#m-base').style.left = Math.min(100, p0 / 0.8) + '%';
  const diff = pct - p0;
  $('#m-note').textContent = diff > 0 ? 'Şu anki halde yaklaşık %' + p0 + '. Bu seçimle duvarlar ' + diff + ' puan daha fazla ışık geri yansıtıyor.' : diff < 0 ? 'Şu anki halde yaklaşık %' + p0 + '. Bu kombinasyon odayı biraz daha karartır.' : 'Şu anki halin değeri. Açık renklerle bu sayı yükselir.';
}

/* Işık sekmesi */
function renderLightCtrl(){
  $('#light-seg').innerHTML = LIGHT_MODES.map(m => '<button data-l="' + m.id + '" aria-pressed="' + (state.light === m.id) + '">' + m.name + '</button>').join('');
  $('#curtain-seg').innerHTML = CURTAIN_MODES.map(([id, n]) => '<button data-c="' + id + '" aria-pressed="' + (state.curtains === id) + '">' + n + '</button>').join('');
  $('#exposure').value = state.exposure; $('#exposure-o').textContent = state.exposure.toFixed(2);
  $('#tv-on').checked = !!state.tv;
}
$('#light-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.light = b.dataset.l; renderLightCtrl(); updateLights(); save(); });
$('#curtain-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.curtains = b.dataset.c; renderLightCtrl(); buildRoom(); save(); });
$('#exposure').addEventListener('input', e => { state.exposure = +e.target.value; $('#exposure-o').textContent = state.exposure.toFixed(2); renderer.toneMappingExposure = state.exposure; dirty = true; save(); });
$('#tv-on').addEventListener('change', e => { state.tv = e.target.checked; if (tvScreen) tvScreen.material = state.tv ? MAT.tvOn : MAT.tvOff; dirty = true; save(); });

/* Eşyalar sekmesi */
function renderItems(){
  const list = Array.from(items.values());
  $('#items').innerHTML = list.map(it => { const st = itemState(it.id); return '<li class="' + (selected && selected.id === it.id ? 'sel' : '') + '"><span class="nm">' + it.name + '</span><span class="tag">' + (it.imported || it.meshy ? 'Meshy' : it.movable ? 'yer tutucu' : 'duvarda') + '</span><label class="check" title="Göster"><input type="checkbox" data-show="' + it.id + '"' + (st.hidden ? '' : ' checked') + ' aria-label="' + it.name + ' görünsün"></label>' + (it.movable ? '<button class="btn" data-sel="' + it.id + '">Seç</button>' : '') + '</li>'; }).join('');
}
$('#items').addEventListener('change', e => { const id = e.target.dataset.show; if (!id) return; itemState(id).hidden = !e.target.checked; applyItemTransform(items.get(id)); if (selected && selected.id === id && !e.target.checked) select(null); save(); });
$('#items').addEventListener('click', e => { const b = e.target.closest('[data-sel]'); if (!b) return; select(b.dataset.sel); });
function renderSelPanel(){
  const p = $('#selpanel');
  if (!selected || !selected.movable){ p.hidden = true; return; }
  p.hidden = false; $('#sp-name').textContent = selected.name;
  const st = itemState(selected.id), r = st.r != null ? st.r : selected.def.r;
  const rr = ((r % 360) + 360) % 360; $('#sp-rot').value = rr; $('#sp-rot-o').textContent = rr + '°';
  $('#sp-h-wrap').hidden = !selected.imported; $('#sp-del').hidden = !selected.imported; $('#sp-hide').hidden = selected.imported;
  if (selected.imported) $('#sp-h').value = Math.round(selected.baseH * (st.s || selected.baseScale) * 100);
}
$('#sp-rot').addEventListener('input', e => { if (!selected) return; const st = itemState(selected.id); st.r = +e.target.value; $('#sp-rot-o').textContent = st.r + '°'; applyItemTransform(selected); if (helper) helper.update(); save(); });
$('#sp-h').addEventListener('change', e => { if (!selected || !selected.imported) return; const cm = +e.target.value; if (!(cm > 0)) return; itemState(selected.id).s = (cm / 100) / selected.baseH; applyItemTransform(selected); if (helper) helper.update(); save(); toast(selected.name + ' ' + cm + ' cm yüksekliğe ayarlandı.'); });
$('#sp-hide').addEventListener('click', () => { if (!selected) return; itemState(selected.id).hidden = true; applyItemTransform(selected); select(null); save(); });
$('#sp-deselect').addEventListener('click', () => select(null));
$('#sp-del').addEventListener('click', async () => { if (!selected || !selected.imported) return; const it = selected; select(null); furnGroup.remove(it.group); items.delete(it.id); delete state.furn[it.id]; save(); try { await IDB.del(it.id); } catch (e) {} renderItems(); dirty = true; toast(it.name + ' silindi.'); });
$('#reset-layout').addEventListener('click', () => { items.forEach(it => { if (!it.imported) state.furn[it.id] = {}; applyItemTransform(it); }); if (helper) helper.update(); save(); renderItems(); toast('Yer tutucular başlangıç yerlerine döndü.'); });
$('#glb').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
  if (!/\.glb$/i.test(f.name)){ toast('Sadece .glb dosyası eklenebilir. Meshy’den GLB olarak indir.'); return; }
  toast(f.name + ' yükleniyor…');
  try {
    const raw = await f.arrayBuffer(); const buf = inlineGlbImages(raw);
    const rec = {id:'glb-' + Date.now().toString(36), name:f.name.replace(/\.glb$/i, ''), buf};
    const it = await addImported(rec, true);
    try { await IDB.put(rec); } catch (er) { toast('Model eklendi ama bu tarayıcıda saklanamadı; sayfayı yenileyince kaybolur.'); }
    renderItems(); select(it.id); openTab('esya');
    toast(it.name + ' eklendi. Gerçek yüksekliğini cm olarak gir.');
  } catch (er) { console.error(er); toast('Model açılamadı. Dosyanın GLB olduğundan emin ol; olmuyorsa dosyayı bana gönder.'); }
});

/* Ölçüler sekmesi */
function getK(o, k){ return k.split('.').reduce((a, p) => a[p], o); }
function setK(o, k, v){ const ps = k.split('.'); const last = ps.pop(); ps.reduce((a, p) => a[p], o)[last] = v; }
function planSvg(d){
  const R = d.room, s = 0.8, ML = 125, MT = 64, MR = 135, MB = 124;
  const W = R.w * s, H = R.l * s, VW = ML + W + MR, VH = MT + H + MB;
  const X = x => +(ML + x * s).toFixed(1), Z = z => +(MT + z * s).toFixed(1);
  const inp = (k, cx, cy, w) => { const ww = w || 52; return '<foreignObject x="' + (cx - ww / 2).toFixed(1) + '" y="' + (cy - 11).toFixed(1) + '" width="' + ww + '" height="22"><input class="pin" type="text" inputmode="numeric" data-k="' + k + '" value="' + getK(d, k) + '" style="width:' + ww + 'px"></foreignObject>'; };
  const hdim = (x1, x2, y, k) => { const a = X(x1), b = X(x2); return '<path class="pl-dim" d="M' + a + ' ' + y + 'H' + b + 'M' + a + ' ' + (y - 5) + 'V' + (y + 5) + 'M' + b + ' ' + (y - 5) + 'V' + (y + 5) + '"/>' + inp(k, (a + b) / 2, y); };
  const vdim = (z1, z2, x, k) => { const a = Z(z1), b = Z(z2); return '<path class="pl-dim" d="M' + x + ' ' + a + 'V' + b + 'M' + (x - 5) + ' ' + a + 'H' + (x + 5) + 'M' + (x - 5) + ' ' + b + 'H' + (x + 5) + '"/>' + inp(k, x, (a + b) / 2); };
  let o = '<svg viewBox="0 0 ' + VW.toFixed(0) + ' ' + VH.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg">';
  // oda
  o += '<polygon class="pl-wall" points="' + [[0,0],[R.dx,0],[R.dx,R.dl],[R.w,R.dl],[R.w,R.l],[0,R.l]].map(([x, z]) => X(x) + ',' + Z(z)).join(' ') + '"/>';
  // kolonlar
  o += '<rect class="pl-col" x="' + X(0) + '" y="' + Z(0) + '" width="' + (R.c1w * s) + '" height="' + (R.c1d * s) + '"/>';
  o += '<rect class="pl-col" x="' + X(0) + '" y="' + Z(R.l - R.c2l) + '" width="' + (R.c2w * s) + '" height="' + (R.c2l * s) + '"/>';
  // koltuk arkası pencere (sol duvar)
  const lw = d.leftWin; o += '<rect class="pl-win" x="' + (X(0) - 4) + '" y="' + Z(lw.z0) + '" width="8" height="' + (lw.w * s) + '"/>';
  // büyük cam (alt duvar, sağ köşeden)
  const bw = d.bigWin; o += '<rect class="pl-win" x="' + X(R.w - bw.x0 - bw.w) + '" y="' + (Z(R.l) - 4) + '" width="' + (bw.w * s) + '" height="8"/>';
  // kapı
  const dr = d.door, hy = Z(dr.z0), hx = X(R.dx), dw = dr.w * s;
  o += '<rect x="' + (hx - 3) + '" y="' + hy + '" width="6" height="' + dw + '" fill="var(--surface-2)"/>';
  o += '<line class="pl-door" x1="' + hx + '" y1="' + hy + '" x2="' + (hx - dw) + '" y2="' + hy + '"/>';
  o += '<path class="pl-arc" d="M' + hx + ' ' + (hy + dw) + 'A' + dw + ' ' + dw + ' 0 0 1 ' + (hx - dw) + ' ' + hy + '"/>';
  // duvar adları
  o += '<text class="pl-t" transform="rotate(-90 ' + (X(0) + 16) + ' ' + (Z(R.l / 2)) + ')" x="' + (X(0) + 16) + '" y="' + Z(R.l / 2) + '">KOLTUK ARKASI</text>';
  o += '<text class="pl-t" transform="rotate(90 ' + (X(R.w) - 12) + ' ' + Z((R.dl + R.l) / 2) + ')" x="' + (X(R.w) - 12) + '" y="' + Z((R.dl + R.l) / 2) + '">TV DUVARI</text>';
  o += '<text class="pl-t" x="' + X(R.w / 2) + '" y="' + (Z(R.l) - 14) + '">TUĞLA DUVAR</text>';
  o += '<text class="pl-t" x="' + (X(R.c1w) + 150) + '" y="' + (Z(0) + 40) + '">YEMEK KÖŞESİ</text>';
  // kolon ölçüleri
  o += inp('room.c1w', X(R.c1w) + 36, Z(0) + 14, 44) + '<text class="pl-d" x="' + (X(R.c1w) + 63) + '" y="' + (Z(0) + 18) + '">×</text>' + inp('room.c1d', X(R.c1w) + 90, Z(0) + 14, 44);
  o += inp('room.c2w', X(R.c2w) + 36, Z(R.l - R.c2l) - 14, 44) + '<text class="pl-d" x="' + (X(R.c2w) + 63) + '" y="' + (Z(R.l - R.c2l) - 10) + '">×</text>' + inp('room.c2l', X(R.c2w) + 90, Z(R.l - R.c2l) - 14, 44);
  // üst: kapı duvarı
  o += hdim(0, R.dx, MT - 26, 'room.dx');
  o += '<text class="pl-d" x="' + ((X(R.dx) + X(R.w)) / 2) + '" y="' + (MT - 22) + '">' + (R.w - R.dx) + '</text>';
  // sol: toplam boy + pencere
  o += vdim(0, R.l, ML - 102, 'room.l');
  o += vdim(0, lw.z0, ML - 48, 'leftWin.z0') + vdim(lw.z0, lw.z0 + lw.w, ML - 48, 'leftWin.w');
  // sağ: kapı ve çıkıntı
  const xr1 = ML + W + 30, xr2 = ML + W + 90;
  o += '<path class="pl-guide" d="M' + (hx + 4) + ' ' + hy + 'H' + xr1 + 'M' + (hx + 4) + ' ' + (hy + dw) + 'H' + xr1 + '"/>';
  o += vdim(0, dr.z0, xr1, 'door.z0') + vdim(dr.z0, dr.z0 + dr.w, xr1, 'door.w');
  o += vdim(0, R.dl, xr2, 'room.dl');
  o += '<text class="pl-d" transform="rotate(90 ' + (xr1 + 6) + ' ' + Z((R.dl + R.l) / 2) + ')" x="' + (xr1 + 6) + '" y="' + Z((R.dl + R.l) / 2) + '">TV duvarı ' + (R.l - R.dl) + ' cm</text>';
  // alt: büyük cam ve toplam en
  const yb1 = MT + H + 34, yb2 = MT + H + 82;
  o += hdim(R.w - bw.x0, R.w, yb1, 'bigWin.x0') + hdim(R.w - bw.x0 - bw.w, R.w - bw.x0, yb1, 'bigWin.w');
  o += '<text class="pl-d" x="' + (X((R.w - bw.x0 - bw.w) / 2)) + '" y="' + (yb1 + 4) + '">' + (R.w - bw.x0 - bw.w) + ' (sol köşeye)</text>';
  o += hdim(0, R.w, yb2, 'room.w');
  return o + '</svg>';
}
function renderPlan(d){ $('#plan-wrap').innerHTML = planSvg(d); }
function readDims(){
  const nd = JSON.parse(JSON.stringify(state.dims));
  $$('#dim-form input').forEach(i => { if (String(i.value).trim() === '') return; const v = +i.value; if (isFinite(v)) setK(nd, i.dataset.k, v); });
  return nd;
}
function renderDims(){ renderPlan(state.dims); $$('#dim-form input').forEach(i => { i.value = getK(state.dims, i.dataset.k); }); }
$('#dim-form').addEventListener('input', e => {
  const t = e.target; if (!t.classList || !t.classList.contains('pin')) return;
  const key = t.dataset.k; let pos = null; try { pos = t.selectionStart; } catch (er) {}
  const typed = t.value;
  renderPlan(readDims());
  const n = $('#plan-wrap [data-k="' + key + '"]');
  if (n){ n.value = typed; n.focus(); try { if (pos != null) n.setSelectionRange(pos, pos); } catch (er) {} }
});
function rebuildWallItems(oldD, nd){
  const dW = (nd.room.w - oldD.room.w) / 100;
  if (!dW) return;
  ['saat', 'tvunite'].forEach(id => { const it = items.get(id); if (it && it.def){ it.def = Object.assign({}, it.def, {x:it.def.x + dW}); applyItemTransform(it); } });
  ['radyator', 'tvduvar'].forEach(id => { const it = items.get(id); if (!it) return; furnGroup.remove(it.group); it.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); items.delete(id); const def = BUILTIN.find(b => b.id === id); if (def) addBuiltin(def); });
}
$('#dim-apply').addEventListener('click', () => {
  const nd = readDims(), R = nd.room;
  if (R.w < 250 || R.w > 700 || R.l < 300 || R.l > 1000){ toast('Oda eni 250–700, boyu 300–1000 cm arasında olmalı.'); return; }
  if (R.dx < 150 || R.dx >= R.w){ toast('Kapı duvarı uzunluğu 150 cm ile oda eni arasında olmalı.'); return; }
  if (R.dl < 50 || R.dl > R.l - 150){ toast('Kapı tarafındaki çıkıntı boyu 50 cm ile oda boyunun 150 cm eksiği arasında olmalı.'); return; }
  if (nd.leftWin.z0 < R.c1d || nd.leftWin.z0 + nd.leftWin.w > R.l - R.c2l){ toast('Koltuk arkası pencere kolonlar arasına sığmıyor (' + R.c1d + ' – ' + (R.l - R.c2l) + ' cm).'); return; }
  if (nd.bigWin.x0 < 0 || nd.bigWin.x0 + nd.bigWin.w > R.w - R.c2w){ toast('Büyük cam tuğla duvara sığmıyor.'); return; }
  if (nd.door.z0 < 0 || nd.door.z0 + nd.door.w > R.dl){ toast('Kapı, kapı duvarının (' + R.dl + ' cm) içine sığmalı.'); return; }
  if (nd.leftWin.sill >= nd.winTop || nd.bigWin.sill >= nd.winTop){ toast('Denizlik, pencere üst kenarından aşağıda olmalı.'); return; }
  if (nd.winTop > nd.ceil - 20 || nd.door.h > nd.ceil - 20){ toast('Pencere ve kapı üst kenarı tavandan en az 20 cm aşağıda olmalı.'); return; }
  const oldD = state.dims;
  state.dims = nd; save(); buildRoom(); rebuildWallItems(oldD, nd); renderPlan(nd); toast('Oda yeni ölçülerle çizildi.');
});
$('#dim-reset').addEventListener('click', () => { const oldD = state.dims; state.dims = JSON.parse(JSON.stringify(DIM_DEFAULT)); save(); renderDims(); buildRoom(); rebuildWallItems(oldD, state.dims); toast('Tahmini ölçülere dönüldü.'); });

/* Elle renk ekleme */
$('#open-add').addEventListener('click', () => { const el = $('#inline-add'); el.hidden = !el.hidden; });
$('#ia-add').addEventListener('click', () => {
  const hex = $('#ia-hex').value.toUpperCase(), name = $('#ia-name').value.trim() || 'Özel renk', code = $('#ia-code').value.trim();
  const c = {name, code, hex}; state.custom.unshift(c); save();
  if (GROUPS.find(x => x.id === curWall).kind === 'brick') curWall = 'koltuk';
  pickColor(c); renderWallChips(); $('#inline-add').hidden = true; toast(name + ' eklendi ve uygulandı.');
});

/* Fotoğraftan renk alma */
const ph = {img:null, white:null, color:null, mode:'color'};
$('#open-photo').addEventListener('click', () => { const d = $('#photo'); if (d.showModal) d.showModal(); else d.setAttribute('open', ''); });
$('#ph-close').addEventListener('click', () => { const d = $('#photo'); if (d.close) d.close(); else d.removeAttribute('open'); });
$('#ph-mode').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; ph.mode = b.dataset.m; $$('#ph-mode button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); });
$('#ph-file').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => { const img = new Image(); img.onload = () => { const cv = $('#ph-canvas'), maxW = 1200, sc = Math.min(1, maxW / img.width); cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); cv.hidden = false; ph.img = img; ph.white = null; ph.color = null; $('#ph-wb').textContent = 'Beyaz düzeltmesi yok'; updatePh(); }; img.src = rd.result; };
  rd.readAsDataURL(f);
});
function samplePh(e){
  const cv = $('#ph-canvas'), r = cv.getBoundingClientRect();
  const x = Math.round((e.clientX - r.left) / r.width * cv.width), y = Math.round((e.clientY - r.top) / r.height * cv.height);
  const k = 6, ctx = cv.getContext('2d'), x0 = Math.max(0, x - k), y0 = Math.max(0, y - k);
  const d = ctx.getImageData(x0, y0, Math.min(cv.width - x0, k * 2 + 1), Math.min(cv.height - y0, k * 2 + 1)).data;
  let R = 0, G = 0, B = 0, n = 0; for (let i = 0; i < d.length; i += 4){ R += d[i]; G += d[i+1]; B += d[i+2]; n++; }
  return [R / n, G / n, B / n];
}
$('#ph-canvas').addEventListener('click', e => {
  if (!ph.img) return;
  const s = samplePh(e);
  if (ph.mode === 'white'){ ph.white = s; $('#ph-wb').textContent = 'Beyaz düzeltmesi açık'; ph.mode = 'color'; $$('#ph-mode button').forEach(x => x.setAttribute('aria-pressed', x.dataset.m === 'color' ? 'true' : 'false')); }
  else ph.color = s;
  updatePh();
});
function phHex(){
  if (!ph.color) return null;
  let [r, g, b] = ph.color;
  if (ph.white){ const tgt = 242; r = r * tgt / Math.max(1, ph.white[0]); g = g * tgt / Math.max(1, ph.white[1]); b = b * tgt / Math.max(1, ph.white[2]); }
  const h = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return ('#' + h(r) + h(g) + h(b)).toUpperCase();
}
function updatePh(){ const hx = phHex(); $('#ph-sw').style.background = hx || 'transparent'; $('#ph-hex').textContent = hx ? hx + ', LRV yaklaşık ' + lrv(hx) : 'Henüz renk seçilmedi'; $('#ph-add').disabled = !hx; }
$('#ph-add').addEventListener('click', () => {
  const hx = phHex(); if (!hx) return;
  const c = {name:$('#ph-name').value.trim() || 'Kartela rengi', code:$('#ph-code').value.trim(), hex:hx};
  state.custom.unshift(c); save();
  if (GROUPS.find(x => x.id === curWall).kind === 'brick') curWall = 'koltuk';
  pickColor(c); renderWallChips();
  const d = $('#photo'); if (d.close) d.close(); else d.removeAttribute('open');
  toast(c.name + ' eklendi ve uygulandı.');
});


/* ================= GLB içe aktarma ================= */
const IDB = {
  db:null,
  open(){ if (this.db) return Promise.resolve(this.db); return new Promise((res, rej) => { try { const r = indexedDB.open('sanal-salon', 1); r.onupgradeneeded = () => r.result.createObjectStore('models', {keyPath:'id'}); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); },
  tx(mode){ return this.open().then(db => db.transaction('models', mode).objectStore('models')); },
  put(rec){ return this.tx('readwrite').then(s => new Promise((res, rej) => { const q = s.put(rec); q.onsuccess = res; q.onerror = () => rej(q.error); })); },
  all(){ return this.tx('readonly').then(s => new Promise((res, rej) => { const q = s.getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => rej(q.error); })); },
  del(id){ return this.tx('readwrite').then(s => new Promise((res, rej) => { const q = s.delete(id); q.onsuccess = res; q.onerror = () => rej(q.error); })); }
};
function b64(bytes){ let s = ''; const ch = 0x8000; for (let i = 0; i < bytes.length; i += ch) s += String.fromCharCode.apply(null, bytes.subarray(i, i + ch)); return btoa(s); }
// GLB içindeki gömülü resimleri data: adresine çevirir (yayınlanan sayfada blob: adresleri engellenebilir)
function inlineGlbImages(buf){
  const dv = new DataView(buf);
  if (buf.byteLength < 20 || dv.getUint32(0, true) !== 0x46546C67) return buf;
  let off = 12, json = null, bin = null;
  while (off + 8 <= buf.byteLength){ const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true), start = off + 8; if (type === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, start, len))); else if (type === 0x004E4942) bin = new Uint8Array(buf, start, len); off = start + len; }
  if (!json || !json.images || !bin) return buf;
  let changed = false;
  json.images.forEach(img => { if (img.bufferView !== undefined){ const bv = json.bufferViews[img.bufferView], o = bv.byteOffset || 0; img.uri = 'data:' + (img.mimeType || 'image/png') + ';base64,' + b64(bin.subarray(o, o + bv.byteLength)); delete img.bufferView; delete img.mimeType; changed = true; } });
  if (!changed) return buf;
  let jb = new TextEncoder().encode(JSON.stringify(json)); const jpad = (4 - jb.length % 4) % 4; const jlen = jb.length + jpad;
  const blen = bin.length + ((4 - bin.length % 4) % 4);
  const out = new ArrayBuffer(12 + 8 + jlen + 8 + blen), o = new DataView(out), u8 = new Uint8Array(out);
  o.setUint32(0, 0x46546C67, true); o.setUint32(4, 2, true); o.setUint32(8, out.byteLength, true);
  o.setUint32(12, jlen, true); o.setUint32(16, 0x4E4F534A, true); u8.set(jb, 20); for (let i = 0; i < jpad; i++) u8[20 + jb.length + i] = 0x20;
  const bs = 20 + jlen; o.setUint32(bs, blen, true); o.setUint32(bs + 4, 0x004E4942, true); u8.set(bin, bs + 8);
  return out;
}
function parseGlb(buf){
  return new Promise((res, rej) => {
    const loader = new T.GLTFLoader();
    const cib = window.createImageBitmap;
    try { window.createImageBitmap = undefined; loader.parse(buf, '', g => res(g), e => rej(e)); }
    catch (e) { rej(e); }
    finally { window.createImageBitmap = cib; }
  });
}
async function addImported(rec, isNew){
  const gltf = await parseGlb(rec.buf);
  const model = gltf.scene;
  const bb = new T.Box3().setFromObject(model), size = bb.getSize(new T.Vector3()), ctr = bb.getCenter(new T.Vector3());
  model.position.set(-ctr.x, -bb.min.y, -ctr.z);
  model.traverse(o => { if (o.isMesh){ if (o.material && o.material.map) o.material.map.encoding = T.sRGBEncoding; } });
  const g = new T.Group(); g.add(model);
  const baseH = size.y || 1;
  const fp = Math.max(size.x, size.z, 0.1);
  g.add(softShadow(size.x || 0.5, size.z || 0.5, 0.28));
  g.traverse(o => { if (o.isMesh) o.userData.owner = g; });
  g.userData.itemId = rec.id; furnGroup.add(g);
  const baseScale = (baseH > 4 || baseH < 0.05) ? 0.8 / baseH : 1;
  const it = {id:rec.id, name:rec.name, group:g, def:{x:1.98, z:3.4, r:0}, movable:true, imported:true, baseH, baseScale};
  items.set(rec.id, it);
  if (isNew){ const st = itemState(rec.id); st.x = 1.98; st.z = 3.4; st.r = 0; st.s = baseScale; save(); }
  applyItemTransform(it);
  return it;
}
async function restoreImported(){
  try { const recs = await IDB.all(); for (const r of recs){ try { await addImported(r, false); } catch (e) { console.warn(e); } } renderItems(); }
  catch (e) {}
}


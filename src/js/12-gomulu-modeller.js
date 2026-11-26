/* ================= Sayfaya gömülü Meshy modelleri ================= */
// w × d × h metre: kullanıcının verdiği gerçek ölçüler; model her eksende bu ölçüye oturtulur
const EMBEDDED = [{id:'kulube', el:'m-kulube', w:0.70, d:0.40, h:2.0, rotY:0}, {id:'hava', el:'m-hava', w:0.31, d:0.31, h:0.73, rotY:0}, {id:'saat', el:'m-saat', w:0.50, d:0.12, h:0.50, rotY:0, elev:1.70, noShadow:true}];
function b64ToBuf(str){ const bin = atob(str.trim()), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
async function loadEmbedded(){
  for (const e of EMBEDDED){
    const node = document.getElementById(e.el), it = items.get(e.id);
    if (!node || !it) continue;
    try {
      const gltf = await parseGlb(inlineGlbImages(b64ToBuf(node.textContent)));
      const model = gltf.scene;
      model.rotation.y = e.rotY || 0; model.updateMatrixWorld(true);
      const bb = new T.Box3().setFromObject(model), size = bb.getSize(new T.Vector3()), ctr = bb.getCenter(new T.Vector3());
      model.position.set(-ctr.x, -bb.min.y, -ctr.z);
      const holder = new T.Group(); holder.add(model); holder.scale.set(e.w / size.x, e.h / size.y, e.d / size.z);
      model.traverse(o => { if (o.isMesh && o.material){ (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) m.map.encoding = T.sRGBEncoding; if (m.emissiveMap) m.emissiveMap.encoding = T.sRGBEncoding; }); } });
      const g = it.group;
      g.children.slice().forEach(c => { g.remove(c); c.traverse(o => { if (o.geometry) o.geometry.dispose(); }); });
      holder.position.y = e.elev || 0; g.add(holder); if (!e.noShadow) g.add(softShadow(e.w, e.d, 0.3));
      g.traverse(o => { if (o.isMesh) o.userData.owner = g; });
      it.meshy = true;
      if (helper && selected === it) helper.update();
      dirty = true;
    } catch (err) { console.warn('Gömülü model açılamadı: ' + e.id, err); }
  }
  renderItems();
}


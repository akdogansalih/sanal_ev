import { NodeIO } from '@gltf-transform/core';
import { MeshoptSimplifier } from 'meshoptimizer';
import fs from 'fs';
await MeshoptSimplifier.ready;
const TRIS = Number(process.argv[2] || 50000);
const doc = await new NodeIO().read('in.glb');
const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
const pos = prim.getAttribute('POSITION').getArray(), idx = prim.getIndices().getArray();
const n = pos.length / 3;
// position-only weld
const map = new Map(); const remap = new Uint32Array(n); const up = [];
for (let i = 0; i < n; i++){
  const k = Math.round(pos[i*3]*1e5) + ',' + Math.round(pos[i*3+1]*1e5) + ',' + Math.round(pos[i*3+2]*1e5);
  let r = map.get(k); if (r === undefined){ r = up.length / 3; map.set(k, r); up.push(pos[i*3], pos[i*3+1], pos[i*3+2]); }
  remap[i] = r;
}
const wpos = new Float32Array(up); const widx = new Uint32Array(idx.length); for (let i = 0; i < idx.length; i++) widx[i] = remap[idx[i]];
console.log('welded verts', wpos.length/3, 'tris', widx.length/3);
const [sidx, err] = MeshoptSimplifier.simplify(widx, wpos, 3, TRIS * 3, 0.03, []);
console.log('simplified tris', sidx.length/3, 'err', err);
const [rm, uniq] = MeshoptSimplifier.compactMesh(sidx);
const np = new Float32Array(uniq*3); for (let i = 0; i < wpos.length/3; i++){ const r = rm[i]; if (r !== 0xffffffff) np.set(wpos.subarray(i*3,i*3+3), r*3); }
fs.writeFileSync('simp_pos.bin', Buffer.from(np.buffer)); fs.writeFileSync('simp_idx.bin', Buffer.from(new Uint32Array(sidx).buffer));
fs.writeFileSync('orig_pos.bin', Buffer.from(pos.buffer, pos.byteOffset, pos.byteLength));
fs.writeFileSync('orig_uv.bin', Buffer.from(prim.getAttribute('TEXCOORD_0').getArray().buffer));
fs.writeFileSync('orig_nrm.bin', Buffer.from(prim.getAttribute('NORMAL').getArray().buffer));
console.log('verts', uniq);

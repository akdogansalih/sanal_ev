#!/usr/bin/env python3
"""Ham bir Meshy GLB'sini araçların beklediği düz dosyalara döker.

Kullanım:  python3 tools/extract_glb.py girdi.glb [çıktı_klasörü]
Üretir:    in.glb (kopya), orig_pos.bin, orig_uv.bin, orig_idx.bin, orig_idx.npy, tex0.png, tex1.png, ...
Çıktı klasörü çalışma klasörün olur; sonraki araçlar orada çalıştırılır.
"""
import io, json, shutil, struct, sys, os
import numpy as np
from PIL import Image

src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else '.'
os.makedirs(out, exist_ok=True)
shutil.copyfile(src, os.path.join(out, 'in.glb'))
f = open(src, 'rb'); f.read(12)
l, _ = struct.unpack('<II', f.read(8)); j = json.loads(f.read(l)); f.read(8); b0 = f.tell()
def view(i):
    b = j['bufferViews'][i]; f.seek(b0 + b.get('byteOffset', 0)); return f.read(b['byteLength'])
def acc(i, dt, cols):
    a = j['accessors'][i]; return np.frombuffer(view(a['bufferView']), dtype=dt).reshape(-1, cols)
prim = j['meshes'][0]['primitives'][0]
pos = acc(prim['attributes']['POSITION'], np.float32, 3)
uv = acc(prim['attributes']['TEXCOORD_0'], np.float32, 2)
ia = j['accessors'][prim['indices']]
idx = acc(prim['indices'], {5125: np.uint32, 5123: np.uint16}[ia['componentType']], 1).astype(np.uint32).reshape(-1, 3)
pos.tofile(os.path.join(out, 'orig_pos.bin')); uv.tofile(os.path.join(out, 'orig_uv.bin'))
idx.tofile(os.path.join(out, 'orig_idx.bin')); np.save(os.path.join(out, 'orig_idx.npy'), idx)
for i, im in enumerate(j.get('images', [])):
    Image.open(io.BytesIO(view(im['bufferView']))).convert('RGB').save(os.path.join(out, 'tex%d.png' % i))
print('pozisyon', len(pos), 'üçgen', len(idx), 'doku', len(j.get('images', [])))

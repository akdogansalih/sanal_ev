#!/usr/bin/env python3
"""bake.py çıktısını (b_*.npy, bake_base.png, bake_mr.png) build.mjs'in okuduğu f_* dosyalarına çevirir."""
import numpy as np
from PIL import Image
np.load('b_pos.npy').astype(np.float32).tofile('f_pos.bin')
np.load('b_nrm.npy').astype(np.float32).tofile('f_nrm.bin')
np.load('b_uv.npy').astype(np.float32).tofile('f_uv.bin')
np.load('b_idx.npy').astype(np.uint32).ravel().tofile('f_idx.bin')
Image.open('bake_base.png').save('f_base.jpg', quality=88, optimize=True)
Image.open('bake_mr.png').resize((1024, 1024), Image.LANCZOS).save('f_mr.jpg', quality=85, optimize=True)
print('tamam')

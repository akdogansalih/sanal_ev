#!/usr/bin/env python3
"""src/ klasöründen tek dosyalı sayfayı üretir: dist/sanal-salon.html

Kullanım:
  python3 build.py              # dist/sanal-salon.html (yayın için, CDN'den three yükler)
  python3 build.py --local-three  # dist/dev.html (test için, three'yi ./node_modules'tan yükler)
"""
import base64, json, os, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
cfg = json.load(open(os.path.join(SRC, 'build.json'), encoding='utf-8'))

def rd(*p): return open(os.path.join(SRC, *p), encoding='utf-8').read()

models = ''.join('<script id="m-%s" type="text/plain">%s</script>\n' % (
    mid, base64.b64encode(open(os.path.join(SRC, 'models', mid + '.glb'), 'rb').read()).decode()) for mid in cfg['order'])
# bölüm dosyaları satır sonu korunarak art arda eklenir
js = ''.join(rd('js', f) for f in cfg['js'])
html = rd('index.template.html').replace('@@STYLE@@', rd('styles.css')).replace('@@MODELS@@', models).replace('@@SCRIPT@@', js)

local = '--local-three' in sys.argv
if local:
    html = html.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', '/node_modules/three/build/three.min.js')
    html = html.replace('https://cdn.jsdelivr.net/npm/three@0.128.0/', '/node_modules/three/')
out = os.path.join(ROOT, 'dist', 'dev.html' if local else 'sanal-salon.html')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html)
print('yazıldı:', out, round(len(html.encode('utf-8')) / 1e6, 2), 'MB')

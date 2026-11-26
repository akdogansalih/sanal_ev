#!/usr/bin/env python3
"""dist/dev.html'i başsız Chromium'da açıp ekran görüntüsü alır (hata ve konsol çıktısını da yazar).

Önce:  python3 build.py --local-three   ve   npm install   (three@0.128.0 node_modules'a iner)
Sonra: python3 tools/test/screenshot.py --views "Koltuktan,Kuş bakışı" --tab "Ölçüler" --out shots/

Not: Yazılım WebGL yavaştır; ekran görüntüsü zaman aşımına uğrarsa pencereyi küçült (--size 1000x640).
"""
import argparse, asyncio, os, subprocess, sys, time
from playwright.async_api import async_playwright

ap = argparse.ArgumentParser()
ap.add_argument('--views', default='')      # virgülle ayrılmış bakış açısı düğme adları
ap.add_argument('--tab', default='')        # Renk / Işık / Eşyalar / Ölçüler
ap.add_argument('--out', default='shots')
ap.add_argument('--size', default='1000x640')
ap.add_argument('--port', type=int, default=8127)
a = ap.parse_args()
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.makedirs(a.out, exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(a.port)], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

async def main():
    w, h = map(int, a.size.split('x'))
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': w, 'height': h})
        pg.on('pageerror', lambda e: print('SAYFA HATASI:', str(e)[:300]))
        pg.on('console', lambda m: print('konsol', m.type, m.text[:200]) if m.type == 'error' and 'ERR_NAME' not in m.text else None)
        await pg.goto('http://localhost:%d/dist/dev.html' % a.port)
        await pg.wait_for_timeout(15000)
        if a.tab:
            await (await pg.query_selector('text=' + a.tab)).click(); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(a.out, 'ilk.png'), timeout=150000)
        for i, v in enumerate([x for x in a.views.split(',') if x]):
            await (await pg.query_selector('#views button:has-text("%s")' % v)).click(); await pg.wait_for_timeout(5000)
            await pg.screenshot(path=os.path.join(a.out, 'bakis-%d.png' % i), timeout=150000)
        await b.close()

try: asyncio.run(main())
finally: srv.terminate()

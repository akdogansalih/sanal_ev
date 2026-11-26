/* ================= Yardımcılar ================= */
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function valueNoise(size, cx, cy, seed){
  const rnd = mulberry32(seed);
  const g = new Float32Array(cx * cy); for (let i = 0; i < g.length; i++) g[i] = rnd();
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++){
    const fy = y / size * cy, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty), y1 = (y0 + 1) % cy;
    for (let x = 0; x < size; x++){
      const fx = x / size * cx, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx), x1 = (x0 + 1) % cx;
      const a = g[y0 * cx + x0], b = g[y0 * cx + x1], c = g[y1 * cx + x0], d = g[y1 * cx + x1];
      const top = a + (b - a) * sx, bot = c + (d - c) * sx;
      out[y * size + x] = top + (bot - top) * sy;
    }
  }
  return out;
}
function fbm(size, list, seed){
  const out = new Float32Array(size * size); let amp = 1, tot = 0;
  list.forEach((c, i) => { const cx = Array.isArray(c) ? c[0] : c, cy = Array.isArray(c) ? c[1] : c; const n = valueNoise(size, cx, cy, seed + i * 977); for (let k = 0; k < out.length; k++) out[k] += n[k] * amp; tot += amp; amp *= 0.55; });
  for (let k = 0; k < out.length; k++) out[k] /= tot;
  return out;
}
function canvas(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; }
function grayCanvas(size, fn){ const c = canvas(size), ctx = c.getContext('2d'), img = ctx.createImageData(size, size); for (let i = 0; i < size * size; i++){ const v = Math.max(0, Math.min(255, fn(i) * 255)); img.data[i*4] = img.data[i*4+1] = img.data[i*4+2] = v; img.data[i*4+3] = 255; } ctx.putImageData(img, 0, 0); return c; }
function lin(hex){ return new T.Color(hex).convertSRGBToLinear(); }
function lum(hex){ const c = lin(hex); return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; }
function lrv(hex){ return Math.round(lum(hex) * 100); }
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2400); }


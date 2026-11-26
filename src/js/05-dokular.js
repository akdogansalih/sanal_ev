/* ================= Dokular ================= */
const TEX = {};
function buildTextures(){
  // boya: çok hafif rulo dokusu (1,5 m)
  const n1 = fbm(512, [48, 96, 192], 11);
  TEX.paint = tex(grayCanvas(512, i => 0.955 + 0.045 * n1[i]), 1/1.5, 1/1.5);
  // rustik eskitme
  const n2 = fbm(512, [3, 6, 12, 24, 48], 23), n3 = fbm(512, [64, 128], 31);
  TEX.rustic = tex(grayCanvas(512, i => { const v = n2[i]; const s = Math.min(1, Math.max(0, (v - 0.36) / 0.3)); const sm = s * s * (3 - 2 * s); return 0.8 + 0.17 * sm + 0.04 * n3[i]; }), 1/1.5, 1/1.5);

  // beton stucco (1,2 m): bulutlu ton farkı, yumuşak mala izleri, seyrek gözenek
  {
    const size = 1024, n = fbm(size, [3, 6, 12, 24, 48, 96, 192], 41), f = fbm(size, [128, 256], 43);
    const c = grayCanvas(size, i => 0.76 + 0.2 * n[i] + 0.04 * f[i]);
    const ctx = c.getContext('2d'); const r = mulberry32(77);
    ctx.lineCap = 'round';
    for (let k = 0; k < 150; k++){
      const x = r() * size, y = r() * size, len = 90 + r() * 220, ang = (r() - 0.5) * 2.2, w = 28 + r() * 60;
      ctx.globalAlpha = 0.018 + r() * 0.03; ctx.strokeStyle = r() < 0.6 ? '#fff' : '#000'; ctx.lineWidth = w;
      for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]){
        ctx.beginPath(); ctx.moveTo(x + ox, y + oy);
        ctx.quadraticCurveTo(x + ox + Math.cos(ang) * len * 0.5 + (r() - 0.5) * 50, y + oy + Math.sin(ang) * len * 0.5 + (r() - 0.5) * 50, x + ox + Math.cos(ang) * len, y + oy + Math.sin(ang) * len);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    for (let k = 0; k < 900; k++){ const x = r() * size, y = r() * size, rad = 0.5 + r() * 1.4; ctx.fillStyle = 'rgba(0,0,0,' + (0.15 + r() * 0.25) + ')'; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill(); }
    TEX.concrete = tex(c, 1/1.2, 1/1.2);
    TEX.concreteBump = tex(c, 1/1.2, 1/1.2, false);
  }
  // parke (1,2 × 1,2 m, 6 tahta, boyuna Z)
  {
    const size = 1024, planks = 6, pw = size / planks;
    const gA = fbm(size, [[160, 5], [320, 9]], 51), gB = fbm(size, [[8, 4], [16, 8]], 61);
    const r = mulberry32(5);
    const tone = [], joint = [];
    for (let i = 0; i < planks; i++){ tone.push((r() - 0.5) * 16); joint.push(Math.floor(r() * size)); }
    const c = canvas(size), ctx = c.getContext('2d'), img = ctx.createImageData(size, size), d = img.data;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++){
      const i = y * size + x, p = Math.min(planks - 1, Math.floor(x / pw)), lx = x - p * pw;
      const seg = ((y - joint[p] + size) % size) < size / 2 ? 0 : 1;
      let v = 0.9 + 0.07 * gA[i] + 0.06 * gB[(y * size + ((x + seg * 300) % size))];
      let R = 206 + tone[p] + seg * 4, G = 194 + tone[p] + seg * 3, B = 177 + tone[p] * 0.8 + seg * 2;
      let m = v;
      if (lx < 1.6 || lx > pw - 1.2) m *= 0.62;
      const dj = Math.abs(((y - joint[p] + size) % (size / 2)));
      if (dj < 1.5) m *= 0.65;
      d[i*4] = Math.min(255, R * m); d[i*4+1] = Math.min(255, G * m); d[i*4+2] = Math.min(255, B * m); d[i*4+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    for (let k = 0; k < 9; k++){ const x = r() * size, y = r() * size; const g = ctx.createRadialGradient(x, y, 1, x, y, 10 + r() * 8); g.addColorStop(0, 'rgba(110,90,70,.55)'); g.addColorStop(1, 'rgba(110,90,70,0)'); ctx.fillStyle = g; ctx.save(); ctx.translate(x, y); ctx.scale(0.6, 1.8); ctx.translate(-x, -y); ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    TEX.floor = tex(c, 1/1.2, 1/1.2);
  }
  // halı
  {
    const w = 512, h = 744, c = canvas(w, h), ctx = c.getContext('2d');
    ctx.fillStyle = '#3c3d40'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#56575b'; ctx.lineWidth = 10; ctx.strokeRect(22, 22, w - 44, h - 44);
    ctx.lineWidth = 3; ctx.strokeRect(44, 44, w - 88, h - 88);
    ctx.fillStyle = '#4b4c50';
    for (let y = 70; y < h - 70; y += 34) for (let x = 70; x < w - 70; x += 34){ ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 12, y); ctx.lineTo(x, y + 12); ctx.lineTo(x - 12, y); ctx.closePath(); ctx.fill(); }
    const r = mulberry32(9); ctx.globalAlpha = 0.18;
    for (let k = 0; k < 2500; k++){ ctx.fillStyle = r() < 0.5 ? '#8a8b8f' : '#202124'; ctx.fillRect(r() * w, r() * h, 1 + r() * 6, 1 + r() * 2); }
    ctx.globalAlpha = 1;
    TEX.rug = tex(c, 1, 1);
  }
  // koltuk sırt minderi, yaprak desenli kumaş
  {
    const s = 256, c = canvas(s), ctx = c.getContext('2d'), r = mulberry32(14);
    ctx.fillStyle = '#e9e3d7'; ctx.fillRect(0, 0, s, s);
    const cols = ['#7f3237', '#2c2b2b', '#98a07a', '#c58b88', '#5b5f3d'];
    for (let k = 0; k < 40; k++){
      const x = r() * s, y = r() * s, a = r() * Math.PI;
      ctx.fillStyle = cols[k % cols.length];
      for (const ox of [-s, 0, s]) for (const oy of [-s, 0, s]){ ctx.save(); ctx.translate(x + ox, y + oy); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    }
    TEX.leaf = tex(c, 2, 1);
  }
  // pencere dışı
  {
    const c = canvas(256), ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#c9d3df'); g.addColorStop(0.55, '#e7eaea'); g.addColorStop(0.56, '#9aa595'); g.addColorStop(1, '#6f7a68');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(120,124,128,.55)'; ctx.fillRect(150, 60, 90, 90); ctx.fillRect(10, 90, 60, 55);
    ctx.fillStyle = 'rgba(80,96,74,.75)'; for (let k = 0; k < 9; k++){ ctx.beginPath(); ctx.arc(k * 32, 150, 22 + (k % 3) * 6, 0, Math.PI * 2); ctx.fill(); }
    TEX.sky = tex(c, 1, 1); TEX.sky.wrapS = TEX.sky.wrapT = T.ClampToEdgeWrapping;
  }
  TEX.shadow = (function(){ const s = 128, c = canvas(s), ctx = c.getContext('2d'); ctx.shadowColor = 'rgba(0,0,0,1)'; ctx.shadowBlur = 22; ctx.shadowOffsetX = 1000; ctx.fillStyle = '#000'; ctx.fillRect(28 - 1000, 28, s - 56, s - 56); return tex(c, 1, 1, false); })();
  TEX.edge = (function(){ const c = canvas(4, 64), ctx = c.getContext('2d'); const g = ctx.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#000000'); ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 64); const t = tex(c, 1, 1, false); t.wrapS = t.wrapT = T.ClampToEdgeWrapping; return t; })();
  TEX.brick = {};
}
function brickTextures(wash){
  if (TEX.brick[wash]) return TEX.brick[wash];
  const size = 1024, rows = 14, perRow = 4, rh = size / rows, bw = size / perRow, mort = 9;
  const r = mulberry32(101);
  const c = canvas(size), ctx = c.getContext('2d');
  const bump = canvas(size), bx = bump.getContext('2d');
  ctx.fillStyle = wash === 'badana' ? '#d9d2c6' : wash === 'hafif' ? '#c9bcab' : '#a89a87'; ctx.fillRect(0, 0, size, size);
  bx.fillStyle = '#3a3a3a'; bx.fillRect(0, 0, size, size);
  const pal = [[110,47,34],[150,60,40],[176,92,56],[190,120,80],[126,58,40],[98,52,44],[168,78,48],[200,140,96]];
  const bricks = [];
  for (let row = 0; row < rows; row++){
    const off = (row % 2) * bw / 2;
    for (let k = -1; k <= perRow; k++){
      const x = k * bw + off + mort / 2, y = row * rh + mort / 2, w = bw - mort, h = rh - mort;
      const p = pal[Math.floor(r() * pal.length)], j = (r() - 0.5) * 24;
      bricks.push({x, y, w, h, col:[p[0] + j, p[1] + j * 0.6, p[2] + j * 0.5], wash:r()});
    }
  }
  bricks.forEach(b => { ctx.fillStyle = 'rgb(' + b.col.map(v => Math.max(0, Math.min(255, v | 0))).join(',') + ')'; ctx.fillRect(b.x, b.y, b.w, b.h); bx.fillStyle = '#c8c8c8'; bx.fillRect(b.x, b.y, b.w, b.h); });
  // doku ve lekeler
  const n = fbm(size, [16, 48, 128, 256], 131);
  const img = ctx.getImageData(0, 0, size, size), d = img.data;
  for (let i = 0; i < size * size; i++){ const m = 0.82 + 0.3 * n[i]; d[i*4] = Math.min(255, d[i*4] * m); d[i*4+1] = Math.min(255, d[i*4+1] * m); d[i*4+2] = Math.min(255, d[i*4+2] * m); }
  ctx.putImageData(img, 0, 0);
  ctx.globalAlpha = 1;
  for (let k = 0; k < 520; k++){ const x = r() * size, y = r() * size; ctx.fillStyle = 'rgba(225,212,192,' + (0.25 + r() * 0.45) + ')'; ctx.beginPath(); ctx.ellipse(x, y, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, Math.PI * 2); ctx.fill(); }
  if (wash !== 'dogal'){
    bricks.forEach(b => { const a = wash === 'badana' ? 0.62 + b.wash * 0.22 : 0.22 + b.wash * 0.25; ctx.fillStyle = 'rgba(236,231,222,' + a + ')'; ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4); });
  }
  const bn = fbm(size, [64, 192], 141);
  const bimg = bx.getImageData(0, 0, size, size), bd = bimg.data;
  for (let i = 0; i < size * size; i++){ const v = bd[i*4] * (0.85 + 0.25 * bn[i]); bd[i*4] = bd[i*4+1] = bd[i*4+2] = Math.min(255, v); }
  bx.putImageData(bimg, 0, 0);
  TEX.brick[wash] = {map: tex(c, 1/0.92, 1/1.0), bump: tex(bump, 1/0.92, 1/1.0, false)};
  return TEX.brick[wash];
}
function textCanvas(text, w, h, bg, fg, font){ const c = canvas(w, h), ctx = c.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); ctx.fillStyle = fg; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, w / 2, h / 2 + 2); return c; }
function boothCanvas(){
  const w = 256, h = 720, c = canvas(w, h), ctx = c.getContext('2d'), r = mulberry32(3);
  ctx.fillStyle = '#b0261d'; ctx.fillRect(0, 0, w, h);
  const x0 = 30, x1 = w - 30, y0 = 120, y1 = h - 40, cols = 3, rows = 8, bar = 9;
  ctx.fillStyle = '#8e1d16'; ctx.fillRect(x0 - 8, y0 - 8, x1 - x0 + 16, y1 - y0 + 16);
  const pw = (x1 - x0 - bar * (cols - 1)) / cols, ph = (y1 - y0 - bar * (rows - 1)) / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){
    const x = x0 + i * (pw + bar), y = y0 + j * (ph + bar);
    ctx.fillStyle = '#24282b'; ctx.fillRect(x, y, pw, ph);
    let bxp = x + 2; while (bxp < x + pw - 4){ const bw = 4 + r() * 7; ctx.fillStyle = ['#6d2a2a', '#2f4f3a', '#d8cfb8', '#3b4a6b', '#7a6a3a', '#5a2f4f'][Math.floor(r() * 6)]; ctx.globalAlpha = 0.75; const bh = ph * (0.55 + r() * 0.35); ctx.fillRect(bxp, y + ph - bh, bw, bh); bxp += bw + 1; }
    ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x, y, pw * 0.35, ph);
  }
  return c;
}
function clockCanvas(){
  const s = 512, c = canvas(s), ctx = c.getContext('2d'), m = s / 2;
  ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = '#b18c4c'; ctx.beginPath(); ctx.arc(m, m, m, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#17181a'; ctx.beginPath(); ctx.arc(m, m, m - 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9a45e'; ctx.font = 'bold 44px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const nums = ['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'];
  nums.forEach((t, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2; ctx.save(); ctx.translate(m + Math.cos(a) * (m - 78), m + Math.sin(a) * (m - 78)); ctx.rotate(a + Math.PI / 2); ctx.fillText(t, 0, 0); ctx.restore(); });
  const gear = (x, y, rad, teeth) => { ctx.beginPath(); for (let k = 0; k < teeth * 2; k++){ const a = k / (teeth * 2) * Math.PI * 2, rr = k % 2 ? rad : rad * 0.84; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#17181a'; ctx.beginPath(); ctx.arc(x, y, rad * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#b8924f'; };
  ctx.fillStyle = '#b8924f'; gear(m, m, 70, 16); gear(m + 82, m - 30, 40, 11); gear(m - 74, m + 42, 46, 12); gear(m + 30, m + 86, 30, 9);
  ctx.strokeStyle = '#e2c27f'; ctx.lineCap = 'round'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(m, m); ctx.lineTo(m + 70, m - 110); ctx.stroke(); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(m, m); ctx.lineTo(m - 150, m + 30); ctx.stroke();
  return c;
}
function pegCanvas(){ const w = 512, h = 376, c = canvas(w, h), ctx = c.getContext('2d'); ctx.fillStyle = '#1e2b44'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#0d1320'; for (let y = 22; y < h - 18; y += 34) for (let x = 20 + ((y / 34) % 2) * 17; x < w - 16; x += 34){ ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, 8, 22, 4) : ctx.rect(x, y, 8, 22); ctx.fill(); } return c; }
function tvCanvas(){ const w = 512, h = 288, c = canvas(w, h), ctx = c.getContext('2d'); const g = ctx.createLinearGradient(0, 0, 0, h * 0.62); g.addColorStop(0, '#f0a84a'); g.addColorStop(1, '#f7e6a0'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h * 0.62); const g2 = ctx.createLinearGradient(0, h * 0.62, 0, h); g2.addColorStop(0, '#5b9bd8'); g2.addColorStop(1, '#2e64b0'); ctx.fillStyle = g2; ctx.fillRect(0, h * 0.62, w, h); ctx.strokeStyle = '#2a1d16'; ctx.lineCap = 'round'; const tree = (x, s) => { ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(x, h * 0.72); ctx.lineTo(x, h * 0.72 - 110 * s); ctx.stroke(); ctx.lineWidth = 3 * s; for (let k = 0; k < 5; k++){ ctx.beginPath(); ctx.moveTo(x, h * 0.72 - (50 + k * 12) * s); ctx.lineTo(x + (k % 2 ? 1 : -1) * (25 + k * 4) * s, h * 0.72 - (80 + k * 14) * s); ctx.stroke(); } }; tree(120, 0.8); tree(250, 1.1); tree(390, 0.95); return c; }
function radCanvas(col, bg){ const c = canvas(256, 128), ctx = c.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 128); ctx.fillStyle = col; for (let x = 0; x < 256; x += 16) ctx.fillRect(x + 3, 0, 10, 128); return c; }


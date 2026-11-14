/* =========================================================================
   Missão Liastra · motor 3D (Three.js r128)
   Renderização com reflexos de ambiente, bloom e tone mapping cinematográfico,
   controles (teclado, mouse, toque), física de caminhada e flutuação,
   colisões, interação e um catálogo de móveis e máquinas de base espacial.
   ========================================================================= */
(function () {
  const T = THREE;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const isTouch = () => ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);

  /* ---------- utilidades ---------- */
  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.anisotropy = 8;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
  }
  function rand(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
  function noise2(x, y, s) {
    const h = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7 + s * 17.3) * 43758.5453; return v - Math.floor(v); };
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return h(xi, yi) * (1 - u) * (1 - v) + h(xi + 1, yi) * u * (1 - v) + h(xi, yi + 1) * (1 - u) * v + h(xi + 1, yi + 1) * u * v;
  }
  function fbm(x, y, s, o = 5) { let t = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { t += a * noise2(x * f, y * f, s); f *= 2.03; a *= 0.5; } return t; }
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

  /* UVs proporcionais ao tamanho de cada face (textura não estica) */
  function boxGeo(w, h, d, su = 1, sv = 1) {
    const g = new T.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let i = 0; i < uv.count; i++) { const f = Math.floor(i / 4); uv.setXY(i, uv.getX(i) * dims[f][0] / su, uv.getY(i) * dims[f][1] / sv); }
    return g;
  }

  /* ---------- imagens (logos e patches) viram texturas ---------- */
  const imgCache = {};
  function imageTex(src, opts = {}) {
    const key = src.slice(0, 80) + src.length + JSON.stringify(opts);
    if (imgCache[key]) return imgCache[key];
    const c = document.createElement('canvas'); c.width = 4; c.height = 4;
    const tex = new T.CanvasTexture(c); tex.anisotropy = 8;
    const img = new Image();
    img.onload = () => {
      const s = opts.max ? Math.min(1, opts.max / Math.max(img.width, img.height)) : 1;
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const g = c.getContext('2d');
      if (opts.bg) { g.fillStyle = opts.bg; g.fillRect(0, 0, c.width, c.height); }
      g.drawImage(img, 0, 0, c.width, c.height);
      if (opts.removeWhite) {
        const d = g.getImageData(0, 0, c.width, c.height), px = d.data;
        for (let i = 0; i < px.length; i += 4) { const m = Math.min(px[i], px[i + 1], px[i + 2]); if (m > 228) px[i + 3] = Math.max(0, 255 - (m - 228) * 9.5); }
        g.putImageData(d, 0, 0);
      }
      tex.image = c; tex.needsUpdate = true;
      if (opts.onload) opts.onload(c.width / c.height);
    };
    img.src = src;
    imgCache[key] = tex;
    return tex;
  }

  /* ---------- texturas procedurais ---------- */
  const TEX = {};
  function buildTextures() {
    TEX.wall = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#c9ced5'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#d8dce2'; g.fillRect(8, 8, w / 2 - 12, h - 16); g.fillRect(w / 2 + 4, 8, w / 2 - 12, h - 16);
      g.strokeStyle = '#b9c0c9'; g.lineWidth = 3; g.strokeRect(8, 8, w / 2 - 12, h - 16); g.strokeRect(w / 2 + 4, 8, w / 2 - 12, h - 16);
      g.fillStyle = '#2c6fd6'; g.fillRect(0, h * 0.62, w, 10);
      g.fillStyle = '#9aa3ae'; for (let i = 0; i < 10; i++) g.fillRect(40 + i * 8, 60, 4, 50);
      g.fillStyle = '#aab2bc'; [[18, 18], [w / 2 - 14, 18], [18, h - 18], [w / 2 - 14, h - 18], [w / 2 + 14, 18], [w - 18, 18], [w / 2 + 14, h - 18], [w - 18, h - 18]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 3.5, 0, 7); g.fill(); });
      g.fillStyle = '#5a626e'; g.fillRect(0, h - 40, w, 40); g.fillStyle = '#7b838f'; g.fillRect(0, h - 40, w, 4);
    });
    TEX.wall.wrapS = TEX.wall.wrapT = T.RepeatWrapping;
    TEX.hull = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h);
      const R = rand(5);
      for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(120,110,100,${R() * 0.05})`; g.fillRect(R() * w, R() * h, 2 + R() * 6, 2 + R() * 6); }
      g.strokeStyle = '#c9c6bd'; g.lineWidth = 3;
      for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (let y = 0; y <= h; y += 170) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.fillStyle = '#b5b1a7'; for (let x = 6; x < w; x += 16) { g.fillRect(x, 4, 3, 3); g.fillRect(x, 174, 3, 3); g.fillRect(x, 344, 3, 3); }
      const grd = g.createLinearGradient(0, h * 0.8, 0, h); grd.addColorStop(0, 'rgba(160,90,50,0)'); grd.addColorStop(1, 'rgba(160,90,50,.25)');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
    });
    TEX.hull.wrapS = TEX.hull.wrapT = T.RepeatWrapping;
    TEX.floor = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#3b4048'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#4a5059';
      for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) g.fillRect(x + 2, y + 2, 12, 12);
      g.fillStyle = '#2a2e35'; for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) g.fillRect(x + 5, y + 5, 6, 6);
      g.strokeStyle = '#23272d'; g.lineWidth = 4; g.strokeRect(0, 0, w, h);
    });
    TEX.floor.wrapS = TEX.floor.wrapT = T.RepeatWrapping;
    TEX.ceiling = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#aeb5bf'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#bcc3cc'; g.fillRect(6, 6, w - 12, h - 12);
      g.strokeStyle = '#8a929d'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
      g.fillStyle = '#9aa2ad'; for (let x = 24; x < w - 20; x += 12) for (let y = 70; y < h - 70; y += 12) g.fillRect(x, y, 3, 3);
      g.fillStyle = '#6c737d'; g.fillRect(0, 26, w, 14); g.fillRect(0, h - 40, w, 14);
      g.fillStyle = '#f4f6f8'; g.fillRect(0, 29, w, 8); g.fillRect(0, h - 37, w, 8);
    });
    TEX.ceilingE = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff6ea'; g.fillRect(0, 29, w, 8); g.fillRect(0, h - 37, w, 8); });
    [TEX.ceiling, TEX.ceilingE].forEach((t) => { t.wrapS = t.wrapT = T.RepeatWrapping; });
    TEX.locker = canvasTex(256, 512, (g, w, h) => {
      g.fillStyle = '#d6dbe1'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) {
        g.fillStyle = '#e8ebef'; g.fillRect(x + 6, y + 6, 116, 116);
        g.strokeStyle = '#a3abb5'; g.lineWidth = 3; g.strokeRect(x + 6, y + 6, 116, 116);
        g.fillStyle = '#596270'; g.fillRect(x + 90, y + 50, 18, 28);
        g.fillStyle = '#2c6fd6'; g.fillRect(x + 16, y + 16, 40, 10);
      }
    });
    TEX.bag = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#efeadf'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#d8d1c2'; g.fillRect(0, 110, w, 36); g.fillRect(110, 0, 36, h);
      g.fillStyle = '#fff'; g.fillRect(30, 30, 70, 46); g.fillStyle = '#333'; g.font = 'bold 14px sans-serif'; g.fillText('CTB', 44, 58);
      g.strokeStyle = '#c4bba9'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
    });
    TEX.rack = canvasTex(256, 512, (g, w, h) => {
      const r = rand(7);
      g.fillStyle = '#d9dde3'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 64) {
        g.fillStyle = r() > 0.5 ? '#c7ccd4' : '#e3e6ea'; g.fillRect(6, y + 4, w - 12, 56);
        g.strokeStyle = '#a7aeb8'; g.lineWidth = 2; g.strokeRect(6, y + 4, w - 12, 56);
        for (let k = 0; k < 6; k++) { g.fillStyle = ['#e5484d', '#46d483', '#ffb340', '#4cc3ff', '#2b313c'][Math.floor(r() * 5)]; g.fillRect(16 + k * 12, y + 14, 6, 6); }
        if (r() > 0.4) { g.fillStyle = '#20252d'; g.fillRect(120, y + 12, 110, 36); g.fillStyle = '#3ad0ff'; g.fillRect(126, y + 18, 40 + r() * 50, 4); g.fillRect(126, y + 28, 30 + r() * 60, 4); }
        g.fillStyle = '#7d8590'; g.font = 'bold 12px sans-serif'; g.fillText(['ECLSS', 'EXPRESS', 'DMS', 'MSG', 'HRF', 'CEVIS', 'CDRA', 'WRS'][Math.floor(r() * 8)], 16, y + 50);
      }
      g.strokeStyle = '#ffd166'; g.lineWidth = 3; g.beginPath(); g.moveTo(w - 20, 0); g.bezierCurveTo(w - 40, 120, w - 4, 300, w - 24, h); g.stroke();
    });
    TEX.rack2 = canvasTex(256, 512, (g, w, h) => {
      const r = rand(19);
      g.fillStyle = '#e4e2dc'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 128) {
        g.fillStyle = '#efeee9'; g.fillRect(8, y + 8, w - 16, 112); g.strokeStyle = '#b8b5ac'; g.lineWidth = 3; g.strokeRect(8, y + 8, w - 16, 112);
        g.fillStyle = '#c9c4b6'; g.fillRect(20, y + 20, 90, 60);
        g.fillStyle = '#5b6470'; g.fillRect(150, y + 30, 70, 12); g.fillRect(150, y + 52, 50, 12);
        for (let k = 0; k < 4; k++) { g.fillStyle = r() > .5 ? '#46d483' : '#e5484d'; g.beginPath(); g.arc(30 + k * 18, y + 100, 4, 0, 7); g.fill(); }
      }
    });
    TEX.solar = canvasTex(512, 256, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, '#162a55'); grd.addColorStop(1, '#0c1834');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#6f8fd6'; g.lineWidth = 1.2;
      for (let i = 0; i <= 32; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.stroke(); }
      for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); }
      g.strokeStyle = '#c9d6f5'; g.lineWidth = 3; g.strokeRect(1, 1, w - 2, h - 2);
    });
    TEX.solar.wrapS = TEX.solar.wrapT = T.RepeatWrapping;
    TEX.goldSolar = canvasTex(256, 512, (g, w, h) => {
      g.fillStyle = '#a86f22'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 8) { g.fillStyle = y % 16 ? '#b9802e' : '#8f5c18'; g.fillRect(0, y, w, 4); }
      g.strokeStyle = '#5e3c0c'; g.lineWidth = 3; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    });
    TEX.goldSolar.wrapS = TEX.goldSolar.wrapT = T.RepeatWrapping;
    TEX.foil = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#c9a85e'; g.fillRect(0, 0, w, h);
      const R = rand(3); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${R() > .5 ? 255 : 90},${R() > .5 ? 230 : 70},${R() > .5 ? 160 : 30},${R() * .25})`; g.beginPath(); g.moveTo(R() * w, R() * h); g.lineTo(R() * w, R() * h); g.lineTo(R() * w, R() * h); g.fill(); }
    });
    TEX.blanket = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#eceae3'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d1cdc1'; g.lineWidth = 2; for (let i = 0; i < w; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
    TEX.foil.wrapS = TEX.foil.wrapT = T.RepeatWrapping; TEX.blanket.wrapS = TEX.blanket.wrapT = T.RepeatWrapping;
    TEX.glow = canvasTex(128, 128, (g, w) => {
      const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      grd.addColorStop(0, 'rgba(255,255,240,1)'); grd.addColorStop(0.2, 'rgba(255,245,210,.8)'); grd.addColorStop(1, 'rgba(255,230,180,0)');
      g.fillStyle = grd; g.fillRect(0, 0, w, w);
    });
    TEX.hazard = canvasTex(128, 32, (g, w, h) => { g.fillStyle = '#ffc94d'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d1d1f'; for (let x = -h; x < w; x += 24) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 12, h); g.lineTo(x + 12 + h, 0); g.lineTo(x + h, 0); g.fill(); } });
    TEX.hazard.wrapS = T.RepeatWrapping;
    TEX.pad = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#5d5f63'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#ffc94d'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, w * 0.44, 0, 7); g.stroke();
      g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h / 2, w * 0.3, 0, 7); g.stroke();
      g.fillStyle = '#f2f2ef'; g.font = 'bold 150px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', w / 2, h / 2 + 8);
    });
  }

  function labelTex(text, sub, color = '#ff6b35') {
    text = window.tr ? tr(text) : text; sub = sub && window.tr ? tr(sub) : sub;
    return canvasTex(512, 128, (g, w, h) => {
      g.fillStyle = '#11151c'; g.fillRect(0, 0, w, h);
      g.fillStyle = color; g.fillRect(0, 0, 12, h);
      const fit = (t, size, weight) => { let s = size; do { g.font = `${weight} ${s}px -apple-system, Inter, sans-serif`; s -= 2; } while (g.measureText(t).width > w - 56 && s > 12); };
      g.fillStyle = '#ffffff'; fit(text, 50, 'bold'); g.fillText(text, 36, sub ? 62 : 82);
      if (sub) { g.fillStyle = '#a1a1a6'; fit(sub, 28, '500'); g.fillText(sub, 38, 106); }
    });
  }
  function screenTex(title, lines, color = '#3ad0ff', kind = 'text') {
    if (window.tr) { title = tr(title); lines = (lines || []).map((l) => tr(l)); }
    return canvasTex(512, 320, (g, w, h) => {
      g.fillStyle = '#061019'; g.fillRect(0, 0, w, h);
      g.strokeStyle = color; g.globalAlpha = 0.18; for (let y = 0; y < h; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.globalAlpha = 1; g.fillStyle = color; g.font = 'bold 38px -apple-system, Inter, sans-serif'; g.fillText(title, 24, 56);
      g.fillRect(24, 68, 120, 3);
      g.font = '24px "JetBrains Mono", monospace'; g.fillStyle = '#cfefff';
      (lines || []).forEach((l, i) => g.fillText(l, 24, 112 + i * 36));
      if (kind === 'chart') {
        g.strokeStyle = color; g.lineWidth = 3; g.beginPath();
        for (let x = 0; x < 200; x += 4) { const y = 250 - Math.sin(x / 20) * 30 - x / 6; x ? g.lineTo(290 + x, y) : g.moveTo(290, y); }
        g.stroke();
      }
      if (kind === 'map') {
        g.strokeStyle = color; g.lineWidth = 2;
        g.strokeRect(300, 120, 180, 160); g.beginPath(); g.arc(390, 200, 30, 0, 7); g.stroke();
        g.fillStyle = '#ff6b35'; g.beginPath(); g.arc(360, 180, 6, 0, 7); g.fill();
      }
    });
  }

  /* ---------- materiais compartilhados ---------- */
  const MAT = {};
  function buildMaterials() {
    MAT.wall = new T.MeshStandardMaterial({ map: TEX.wall, roughness: 0.72, metalness: 0.05, envMapIntensity: 0.45 });
    MAT.hull = new T.MeshStandardMaterial({ map: TEX.hull, roughness: 0.55, metalness: 0.15 });
    MAT.wallOut = new T.MeshStandardMaterial({ color: 0xd6d8da, roughness: 0.65, metalness: 0.1, envMapIntensity: 0.5 });
    MAT.floor = new T.MeshStandardMaterial({ map: TEX.floor, roughness: 0.62, metalness: 0.3, envMapIntensity: 0.18 });
    MAT.ceiling = new T.MeshStandardMaterial({ map: TEX.ceiling, color: 0xe4ebf4, emissiveMap: TEX.ceilingE, emissive: 0xfff6ea, emissiveIntensity: 1.25, roughness: 0.8, envMapIntensity: 0.25 });
    MAT.metal = new T.MeshStandardMaterial({ color: 0xaab1bb, roughness: 0.3, metalness: 0.85 });
    MAT.shadowOnly = new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
    MAT.chrome = new T.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.08, metalness: 1 });
    MAT.dark = new T.MeshStandardMaterial({ color: 0x252b36, roughness: 0.5, metalness: 0.4 });
    MAT.darker = new T.MeshStandardMaterial({ color: 0x14171d, roughness: 0.6, metalness: 0.3 });
    MAT.white = new T.MeshStandardMaterial({ color: 0xf3f3f1, roughness: 0.45, metalness: 0.05 });
    MAT.offwhite = new T.MeshStandardMaterial({ color: 0xdedbd2, roughness: 0.6 });
    MAT.glass = new T.MeshLambertMaterial({ color: 0xbfe2ff, transparent: true, opacity: 0.14, side: T.DoubleSide, depthWrite: false });
    MAT.glassDark = new T.MeshStandardMaterial({ color: 0x0c1a2a, roughness: 0.05, metalness: 0.6, envMapIntensity: 2 });
    MAT.visor = new T.MeshStandardMaterial({ color: 0xd8a640, roughness: 0.05, metalness: 1 });
    MAT.solar = new T.MeshStandardMaterial({ map: TEX.solar, roughness: 0.25, metalness: 0.6 });
    MAT.goldSolar = new T.MeshStandardMaterial({ map: TEX.goldSolar, roughness: 0.4, metalness: 0.5 });
    MAT.foil = new T.MeshStandardMaterial({ map: TEX.foil, roughness: 0.35, metalness: 0.9 });
    MAT.blanket = new T.MeshStandardMaterial({ map: TEX.blanket, roughness: 0.9 });
    MAT.rack = new T.MeshStandardMaterial({ map: TEX.rack, roughness: 0.7 });
    MAT.rack2 = new T.MeshStandardMaterial({ map: TEX.rack2, roughness: 0.7 });
    MAT.locker = new T.MeshStandardMaterial({ map: TEX.locker, roughness: 0.55, metalness: 0.1 });
    MAT.bag = new T.MeshStandardMaterial({ map: TEX.bag, roughness: 0.95 });
    MAT.plant = new T.MeshStandardMaterial({ color: 0x3fbf6f, roughness: 0.7 });
    MAT.plantDark = new T.MeshStandardMaterial({ color: 0x23864a, roughness: 0.7 });
    MAT.redLeaf = new T.MeshStandardMaterial({ color: 0x9b2a3a, roughness: 0.7 });
    MAT.tomato = new T.MeshStandardMaterial({ color: 0xe8462e, roughness: 0.4 });
    MAT.soil = new T.MeshStandardMaterial({ color: 0x4a3020, roughness: 1 });
    MAT.water = new T.MeshStandardMaterial({ color: 0x2f8fe0, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.6 });
    MAT.lamp = new T.MeshBasicMaterial({ toneMapped: false, color: 0xfff4dc });
    MAT.lampCool = new T.MeshBasicMaterial({ toneMapped: false, color: 0xe8f4ff });
    MAT.ledBlue = new T.MeshBasicMaterial({ toneMapped: false, color: 0x4cc3ff });
    MAT.ledRed = new T.MeshBasicMaterial({ toneMapped: false, color: 0xff4d4d });
    MAT.ledGreen = new T.MeshBasicMaterial({ toneMapped: false, color: 0x46d483 });
    MAT.ledPink = new T.MeshBasicMaterial({ toneMapped: false, color: 0xff5bd8 });
    MAT.orange = new T.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.45 });
    MAT.navy = new T.MeshStandardMaterial({ color: 0x1b2f7a, roughness: 0.5 });
    MAT.yellow = new T.MeshStandardMaterial({ color: 0xffc94d, roughness: 0.45 });
    MAT.blue = new T.MeshStandardMaterial({ color: 0x2c6fd6, roughness: 0.5 });
    MAT.fabricBlue = new T.MeshStandardMaterial({ color: 0x34508f, roughness: 0.95 });
    MAT.fabricGrey = new T.MeshStandardMaterial({ color: 0x8b929c, roughness: 0.95 });
    MAT.rubber = new T.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.9 });
    MAT.hazard = new T.MeshStandardMaterial({ map: TEX.hazard, roughness: 0.6 });
    MAT.pad = new T.MeshStandardMaterial({ map: TEX.pad, roughness: 0.9 });
    MAT.handrail = new T.MeshStandardMaterial({ color: 0xffc94d, roughness: 0.4, metalness: 0.2 });
  }

  /* =======================================================================
     Engine
     ======================================================================= */
  function Engine(container) {
    this.container = container;
    this.renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.lowPower = isTouch();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.lowPower ? 1.25 : 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);
    this.canvas = this.renderer.domElement;
    this.camera = new T.PerspectiveCamera(72, 1, 0.05, 40000);
    this.scene = null;
    this.yaw = 0; this.pitch = 0;
    this.keys = new Set();
    this.move = { x: 0, y: 0 };
    this.lookDelta = { x: 0, y: 0 };
    this.player = { pos: new T.Vector3(), vy: 0, onGround: true, vel: new T.Vector3() };
    this.mode = 'walk';
    this.gravity = 3.71;
    this.walls = [];
    this.groundAt = () => 0;
    this.floorAt = null;
    this.floatAllowed = () => true;
    this.interactables = [];
    this.focus = null;
    this.vehicle = null;
    this.running = false;
    this.onFrame = null;
    this.locked = false;
    if (!TEX.wall) { buildTextures(); buildMaterials(); }
    this._setupPost();
    this._bindInput();
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  /* pós-processamento: bloom + tone mapping ACES + vinheta */
  Engine.prototype._setupPost = function () {
    this.composer = null;
    if (this.lowPower || !T.EffectComposer || !T.UnrealBloomPass || !T.RenderPass || !T.ShaderPass) return;
    try {
      this.composer = new T.EffectComposer(this.renderer);
      this.renderPass = new T.RenderPass(new T.Scene(), this.camera);
      this.composer.addPass(this.renderPass);
      this.bloom = new T.UnrealBloomPass(new T.Vector2(512, 512), 0.7, 0.5, 0.92);
      this.composer.addPass(this.bloom);

    } catch (e) { this.composer = null; this.renderer.toneMapping = T.ACESFilmicToneMapping; }
  };
  Engine.prototype.setExposure = function (v) { this.renderer.toneMappingExposure = v; };

  Engine.prototype.resize = function () {
    const w = this.container.clientWidth || window.innerWidth, h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = '100%'; this.canvas.style.height = '100%';
    this.camera.aspect = w / h; this.camera.fov = w < h ? 88 : 72; this.camera.updateProjectionMatrix();
    if (this.composer) { this.composer.setSize(w, h); this.bloom.setSize(w / 2, h / 2); }
  };

  Engine.prototype.newScene = function () {
    if (this.scene) this.dispose();
    this.scene = new T.Scene();
    if (this.renderPass) this.renderPass.scene = this.scene;
    this.walls = []; this.interactables = []; this.vehicle = null; this.focus = null; this.floorAt = null;
    return this.scene;
  };

  /* reflexos de ambiente (PMREM) a partir de um céu em gradiente */
  Engine.prototype.setEnvironment = function (top, horizon, bottom, panels = []) {
    const pm = new T.PMREMGenerator(this.renderer);
    const es = new T.Scene();
    const geo = new T.SphereGeometry(50, 32, 16);
    const cols = [], p = geo.attributes.position, ct = new T.Color(top), ch = new T.Color(horizon), cb = new T.Color(bottom), tmp = new T.Color();
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 50; if (y > 0) tmp.copy(ch).lerp(ct, Math.pow(y, 0.6)); else tmp.copy(ch).lerp(cb, Math.pow(-y, 0.5)); cols.push(tmp.r, tmp.g, tmp.b); }
    geo.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    es.add(new T.Mesh(geo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    panels.forEach(([x, y, z, w, h, color, k]) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(color).multiplyScalar(k || 3), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); });
    const rt = pm.fromScene(es, 0.03);
    this.scene.environment = rt.texture;
    pm.dispose();
  };

  Engine.prototype.dispose = function () {
    if (!this.scene) return;
    const keepM = new Set(Object.values(MAT)), keepT = new Set(Object.values(TEX)), keepI = new Set(Object.values(imgCache));
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (!keepM.has(m)) { if (m.map && !keepT.has(m.map) && !keepI.has(m.map)) m.map.dispose(); m.dispose(); } });
    });
    if (this.scene.environment) this.scene.environment.dispose();
    this.scene = null;
  };

  /* paredes dinâmicas (ex.: porta externa trancada sem traje) */
  Engine.prototype.setDynWall = function (id, box) {
    this.walls = this.walls.filter((w) => w._id !== id);
    if (box) this.walls.push(Object.assign({}, box, { _id: id }));
  };

  /* ---------- Entrada ---------- */
  Engine.prototype._bindInput = function () {
    const c = this.canvas;
    this._kd = (e) => {
      if (!this.running || (e.target.closest && e.target.closest('input, textarea'))) return;
      const k = e.code;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyC', 'ControlLeft', 'KeyQ', 'Tab'].includes(k)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(k);
      if (k === 'KeyE' && this.onInteract) this.onInteract(true);
      if (this.onKey) this.onKey(k);
    };
    this._ku = (e) => { this.keys.delete(e.code); if (e.code === 'KeyE' && this.onInteract) this.onInteract(false); };
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup', this._ku);
    window.addEventListener('blur', () => this.keys.clear());
    let dragging = false, lx = 0, ly = 0;
    c.addEventListener('mousedown', (e) => {
      if (!this.running) return;
      if (!this.locked && c.requestPointerLock && !this.noLock) {
        try { const p = c.requestPointerLock(); if (p && p.catch) p.catch(() => { this.noLock = true; }); } catch (err) { this.noLock = true; }
      }
      dragging = true; lx = e.clientX; ly = e.clientY;
    });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.running) return;
      if (this.locked) { this.lookDelta.x += e.movementX; this.lookDelta.y += e.movementY; }
      else if (dragging) { this.lookDelta.x += (e.clientX - lx) * 1.2; this.lookDelta.y += (e.clientY - ly) * 1.2; lx = e.clientX; ly = e.clientY; }
    });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === c; if (this.onLockChange) this.onLockChange(this.locked); });
    document.addEventListener('pointerlockerror', () => { this.noLock = true; });
    const touches = {};
    c.addEventListener('touchstart', (e) => {
      for (const t of e.changedTouches) {
        const left = t.clientX < window.innerWidth * 0.45;
        touches[t.identifier] = { kind: left ? 'move' : 'look', x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY };
        if (left && this.onJoy) this.onJoy('start', t.clientX, t.clientY);
      }
      e.preventDefault();
    }, { passive: false });
    c.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        const s = touches[t.identifier]; if (!s) continue;
        if (s.kind === 'look') { this.lookDelta.x += (t.clientX - s.x) * 2.2; this.lookDelta.y += (t.clientY - s.y) * 2.2; }
        else { const dx = t.clientX - s.x0, dy = t.clientY - s.y0, m = 55; this.move.x = clamp(dx / m, -1, 1); this.move.y = clamp(-dy / m, -1, 1); if (this.onJoy) this.onJoy('move', s.x0 + clamp(dx, -m, m), s.y0 + clamp(dy, -m, m)); }
        s.x = t.clientX; s.y = t.clientY;
      }
      e.preventDefault();
    }, { passive: false });
    const end = (e) => { for (const t of e.changedTouches) { const s = touches[t.identifier]; if (s && s.kind === 'move') { this.move.x = 0; this.move.y = 0; if (this.onJoy) this.onJoy('end'); } delete touches[t.identifier]; } };
    c.addEventListener('touchend', end); c.addEventListener('touchcancel', end);
  };
  Engine.prototype.unlock = function () { if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); };

  Engine.prototype.resolve2D = function (x, z, r) {
    for (const b of this.walls) {
      const cx = clamp(x, b.minX, b.maxX), cz = clamp(z, b.minZ, b.maxZ);
      const dx = x - cx, dz = z - cz, d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        const d = Math.sqrt(d2);
        if (d > 1e-4) { x += dx / d * (r - d); z += dz / d * (r - d); }
        else { const L = x - b.minX, R = b.maxX - x, U = z - b.minZ, D = b.maxZ - z, m = Math.min(L, R, U, D); if (m === L) x = b.minX - r; else if (m === R) x = b.maxX + r; else if (m === U) z = b.minZ - r; else z = b.maxZ + r; }
      }
    }
    if (this.bounds) { const rr = Math.hypot(x, z); if (rr > this.bounds) { x *= this.bounds / rr; z *= this.bounds / rr; } }
    return [x, z];
  };

  Engine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    let last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      this.step(dt);
      if (this.onFrame) this.onFrame(dt);
      if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  };
  Engine.prototype.stop = function () { this.running = false; cancelAnimationFrame(this.raf); this.keys.clear(); this.unlock(); };

  Engine.prototype.input = function () {
    const k = this.keys;
    let f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    let s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    if (this.move.x || this.move.y) { f = this.move.y; s = this.move.x; }
    const up = (k.has('Space') || this.btnUp ? 1 : 0) - (k.has('KeyC') || k.has('ControlLeft') || k.has('KeyQ') || this.btnDown ? 1 : 0);
    const run = k.has('ShiftLeft') || k.has('ShiftRight') || Math.hypot(this.move.x, this.move.y) > 0.92;
    return { f, s, up, run };
  };

  Engine.prototype.step = function (dt) {
    const sens = 0.0024 * (this.sensMul || 2.2);
    if (this.mode !== 'drive') { this.yaw -= this.lookDelta.x * sens; this.pitch = clamp(this.pitch - this.lookDelta.y * sens, -1.45, 1.45); }
    else this.camYawOff = clamp((this.camYawOff || 0) - this.lookDelta.x * sens, -2.5, 2.5);
    this.lookDelta.x = 0; this.lookDelta.y = 0;
    if (this.paused) { this.applyCamera(); return; }
    const inp = this.input(), P = this.player;
    if (this.mode === 'walk') {
      const speed = (inp.run ? 5.4 : 3.0) * (this.speedMul || 1);
      const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw), rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
      let mx = fx * inp.f + rx * inp.s, mz = fz * inp.f + rz * inp.s;
      const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
      let nx = P.pos.x + mx * speed * dt, nz = P.pos.z + mz * speed * dt;
      [nx, nz] = this.resolve2D(nx, nz, 0.3);
      P.pos.x = nx; P.pos.z = nz;
      const g = this.floorAt ? this.floorAt(nx, nz) : this.groundAt(nx, nz);
      if (inp.up > 0 && P.onGround) { P.vy = this.jumpV || 3.2; P.onGround = false; if (this.onJump) this.onJump(); }
      P.vy -= this.gravity * dt; P.pos.y += P.vy * dt;
      if (P.pos.y <= g) { P.pos.y = g; P.vy = 0; P.onGround = true; }
      else if (P.onGround && P.pos.y - g < 0.35) { P.pos.y = g; P.vy = 0; }
      else P.onGround = false;
      this.bob = (this.bob || 0) + (ml > 0.1 && P.onGround ? dt * speed * 2.2 : 0);
    } else if (this.mode === 'float') {
      const acc = inp.run ? 3.2 : 1.8;
      const dir = new T.Vector3(0, 0, -1).applyEuler(new T.Euler(this.pitch, this.yaw, 0, 'YXZ'));
      const right = new T.Vector3(1, 0, 0).applyEuler(new T.Euler(0, this.yaw, 0, 'YXZ'));
      P.vel.addScaledVector(dir, inp.f * acc * dt).addScaledVector(right, inp.s * acc * dt).addScaledVector(new T.Vector3(0, 1, 0), inp.up * acc * dt);
      P.vel.multiplyScalar(Math.pow(0.35, dt));
      const maxV = inp.run ? 3 : 1.8; if (P.vel.length() > maxV) P.vel.setLength(maxV);
      const np = P.pos.clone().addScaledVector(P.vel, dt);
      if (this.floatAllowed(np)) P.pos.copy(np);
      else ['x', 'y', 'z'].forEach((a) => { const t = P.pos.clone(); t[a] = np[a]; if (this.floatAllowed(t)) P.pos[a] = t[a]; else P.vel[a] *= -0.2; });
    } else if (this.mode === 'drive' && this.vehicle) {
      const Vh = this.vehicle;
      Vh.speed += inp.f * 5 * dt; Vh.speed *= Math.pow(inp.f ? 0.9 : 0.4, dt);
      Vh.speed = clamp(Vh.speed, -3, inp.run ? 11 : 7.5);
      Vh.yaw -= inp.s * dt * 0.9 * clamp(Vh.speed / 3, -1, 1);
      const nx = Vh.obj.position.x - Math.sin(Vh.yaw) * Vh.speed * dt, nz = Vh.obj.position.z - Math.cos(Vh.yaw) * Vh.speed * dt;
      const [rx, rz] = this.resolve2D(nx, nz, 1.6);
      if (Math.hypot(rx - nx, rz - nz) > 0.01) Vh.speed *= 0.5;
      Vh.obj.position.set(rx, this.groundAt(rx, rz), rz); Vh.obj.rotation.y = Vh.yaw;
      const ahead = this.groundAt(rx - Math.sin(Vh.yaw) * 1.5, rz - Math.cos(Vh.yaw) * 1.5) - this.groundAt(rx + Math.sin(Vh.yaw) * 1.5, rz + Math.cos(Vh.yaw) * 1.5);
      Vh.obj.rotation.x = Math.atan2(ahead, 3);
      if (Vh.wheels) Vh.wheels.forEach((w) => { w.rotation.x -= Vh.speed * dt / 0.45; });
      P.pos.set(rx, Vh.obj.position.y, rz);
    }
    this.applyCamera(); this.updateFocus();
  };

  Engine.prototype.applyCamera = function () {
    const P = this.player, cam = this.camera;
    if (this.mode === 'drive' && this.vehicle) {
      const Vh = this.vehicle, a = Vh.yaw + (this.camYawOff || 0);
      const target = Vh.obj.position.clone().add(new T.Vector3(0, 1.6, 0));
      cam.position.set(target.x + Math.sin(a) * 7.5, target.y + 2.6, target.z + Math.cos(a) * 7.5);
      const g = this.groundAt(cam.position.x, cam.position.z) + 0.8; if (cam.position.y < g) cam.position.y = g;
      cam.lookAt(target); return;
    }
    const eye = this.mode === 'float' ? 0 : (this.eyeH || 1.62);
    const bob = this.mode === 'walk' ? Math.sin(this.bob || 0) * 0.03 : 0;
    cam.position.set(P.pos.x, P.pos.y + eye + bob, P.pos.z);
    cam.rotation.set(this.pitch, this.yaw, this.mode === 'float' ? Math.sin(performance.now() / 2400) * 0.03 : 0, 'YXZ');
  };

  Engine.prototype.addInteract = function (it) { if (window.tr) it.label = tr(it.label); it.pos = it.pos.isVector3 ? it.pos : new T.Vector3(it.pos[0], it.pos[1], it.pos[2]); it.r = it.r || 2.2; this.interactables.push(it); return it; };
  Engine.prototype.updateFocus = function () {
    if (this.mode === 'drive') { this.focus = this.interactables.find((i) => i.kind === 'rover') || null; return; }
    const cam = this.camera, fwd = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    let best = null, bestScore = -1;
    for (const it of this.interactables) {
      if (it.enabled && !it.enabled()) continue;
      const d = it.pos.clone().sub(cam.position), dist = d.length();
      if (dist > it.r) continue;
      d.normalize();
      const dot = this.mode === 'float' ? d.dot(fwd) : (new T.Vector2(d.x, d.z).normalize().dot(new T.Vector2(fwd.x, fwd.z).normalize()));
      if (dot < 0.5) continue;
      const score = dot * 1.5 - dist * 0.12;
      if (score > bestScore) { bestScore = score; best = it; }
    }
    this.focus = best;
  };

  /* =======================================================================
     Construtores
     ======================================================================= */
  const B = {};
  const shadowed = (m, cast = true) => { m.castShadow = cast; m.receiveShadow = true; return m; };
  B.box = (p, w, h, d, mat, x, y, z, o = {}) => { const m = new T.Mesh(o.uv ? boxGeo(w, h, d, o.uv[0], o.uv[1]) : new T.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); shadowed(m, o.cast !== false); p.add(m); return m; };
  B.cyl = (p, rt, rb, h, mat, x, y, z, seg = 24, o = {}) => { const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg, 1, !!o.open), mat); m.position.set(x, y, z); shadowed(m, o.cast !== false); p.add(m); return m; };
  B.sph = (p, r, mat, x, y, z, seg = 16) => { const m = new T.Mesh(new T.SphereGeometry(r, seg, Math.max(8, seg / 2)), mat); m.position.set(x, y, z); shadowed(m); p.add(m); return m; };
  B.grp = (p, x, z, rotY = 0, y = 0) => { const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = rotY; p.add(g); return g; };
  B.pt = (g, lx, ly, lz) => { g.updateMatrixWorld(true); return new T.Vector3(lx, ly, lz).applyMatrix4(g.matrixWorld); };
  B.label = (p, text, sub, x, y, z, rotY = 0, color, w = 2) => { const m = new T.Mesh(new T.PlaneGeometry(w, w / 4), new T.MeshBasicMaterial({ map: labelTex(text, sub, color), toneMapped: false })); m.position.set(x, y, z); m.rotation.y = rotY; p.add(m); return m; };
  B.screen = (p, title, lines, x, y, z, rotY = 0, color, w = 1.1, kind) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, w * 0.625), new T.MeshBasicMaterial({ map: screenTex(title, lines, color, kind), toneMapped: false }));
    m.position.set(x, y, z); m.rotation.y = rotY; p.add(m);
    const frame = new T.Mesh(new T.BoxGeometry(w + 0.06, w * 0.625 + 0.06, 0.04), MAT.darker); frame.position.z = -0.025; m.add(frame);
    return m;
  };
  B.decal = (p, tex, w, h, x, y, z, rotY = 0, o = {}) => {
    const mat = new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: o.rough || 0.6, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false, side: o.double ? T.DoubleSide : T.FrontSide });
    if (o.glow) { mat.emissive = new T.Color(0xffffff); mat.emissiveMap = tex; mat.emissiveIntensity = o.glow; }
    const m = new T.Mesh(new T.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = rotY; if (o.rotX) m.rotation.x = o.rotX; m.renderOrder = 2; p.add(m); return m;
  };
  B.plaque = (p, tex, w, h, x, y, z, rotY = 0) => {
    const g = B.grp(p, x, z, rotY, y);
    B.box(g, w + 0.16, h + 0.16, 0.05, MAT.white, 0, 0, 0, { cast: false });
    B.decal(g, tex, w, h, 0, 0, 0.03, 0);
    const lamp = new T.Mesh(new T.BoxGeometry(w * 0.8, 0.03, 0.06), MAT.lamp); lamp.position.set(0, h / 2 + 0.12, 0.06); g.add(lamp);
    return g;
  };

  /* Sala: paredes com face interna e externa diferentes, piso, teto com luz e telhado externo */
  B.room = (eng, parent, o) => {
    const t = 0.3, h = o.h || 3.0, doorW = o.doorW || 1.8, doorH = 2.4;
    const x0 = o.x - o.w / 2, x1 = o.x + o.w / 2, z0 = o.z - o.d / 2, z1 = o.z + o.d / 2;
    const g = new T.Group(); parent.add(g);
    const doors = o.doors || {};
    const inner = MAT.wall, outer = MAT.hull;
    const mats = (side) => {
      const a = [MAT.wallOut, MAT.wallOut, MAT.wallOut, MAT.wallOut, MAT.wallOut, MAT.wallOut];
      const map = { n: [4, 5], s: [5, 4], w: [0, 1], e: [1, 0] };
      a[map[side][0]] = inner; a[map[side][1]] = outer; return a;
    };
    const side = (name, ax, from, to, fixed) => {
      const center = ax === 'x' ? o.x : o.z;
      const gaps = (doors[name] || []).map((off) => [off - doorW / 2, off + doorW / 2]).sort((a, b) => a[0] - b[0]);
      let cur = from - center; const end = to - center; const segs = [];
      gaps.forEach(([a, b]) => { if (a > cur) segs.push([cur, a]); cur = b; });
      if (end > cur) segs.push([cur, end]);
      const wallH = o.glass ? 0.9 : h;
      segs.forEach(([a, b]) => {
        const len = b - a, mid = center + (a + b) / 2;
        const geo = ax === 'x' ? boxGeo(len, wallH, t, 2.2, 3) : boxGeo(t, wallH, len, 2.2, 3);
        const m = new T.Mesh(geo, mats(name)); shadowed(m);
        if (ax === 'x') { m.position.set(mid, wallH / 2, fixed); eng.walls.push({ minX: center + a, maxX: center + b, minZ: fixed - t / 2, maxZ: fixed + t / 2 }); }
        else { m.position.set(fixed, wallH / 2, mid); eng.walls.push({ minX: fixed - t / 2, maxX: fixed + t / 2, minZ: center + a, maxZ: center + b }); }
        g.add(m);
        if (o.glass) {
          const gl = new T.Mesh(new T.PlaneGeometry(len, h - wallH), MAT.glass);
          if (ax === 'x') gl.position.set(mid, wallH + (h - wallH) / 2, fixed); else { gl.position.set(fixed, wallH + (h - wallH) / 2, mid); gl.rotation.y = Math.PI / 2; }
          g.add(gl);
          for (let s = a; s <= b + 0.01; s += 2) { if (ax === 'x') B.box(g, 0.08, h - wallH, 0.12, MAT.metal, center + s, wallH + (h - wallH) / 2, fixed); else B.box(g, 0.12, h - wallH, 0.08, MAT.metal, fixed, wallH + (h - wallH) / 2, center + s); }
        }
      });
      gaps.forEach(([a, b]) => {
        const len = b - a, mid = center + (a + b) / 2;
        if (!o.glass) { if (ax === 'x') B.box(g, len, h - doorH, t, MAT.wallOut, mid, doorH + (h - doorH) / 2, fixed); else B.box(g, t, h - doorH, len, MAT.wallOut, fixed, doorH + (h - doorH) / 2, mid); }
        const fm = MAT.dark;
        if (ax === 'x') { B.box(g, 0.14, doorH, t + 0.1, fm, center + a, doorH / 2, fixed); B.box(g, 0.14, doorH, t + 0.1, fm, center + b, doorH / 2, fixed); B.box(g, len + 0.28, 0.14, t + 0.1, fm, mid, doorH, fixed); B.box(g, len, 0.04, t + 0.12, MAT.hazard, mid, 0.03, fixed, { cast: false }); }
        else { B.box(g, t + 0.1, doorH, 0.14, fm, fixed, doorH / 2, center + a); B.box(g, t + 0.1, doorH, 0.14, fm, fixed, doorH / 2, center + b); B.box(g, t + 0.1, 0.14, len + 0.28, fm, fixed, doorH, mid); B.box(g, t + 0.12, 0.04, len, MAT.hazard, fixed, 0.03, mid, { cast: false }); }
      });
    };
    side('n', 'x', x0, x1, z0); side('s', 'x', x0, x1, z1); side('w', 'z', z0, z1, x0); side('e', 'z', z0, z1, x1);
    const fg = new T.PlaneGeometry(o.w, o.d); const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * o.w / 1.6, uv.getY(i) * o.d / 1.6);
    const fl = new T.Mesh(fg, o.floorMat || MAT.floor); fl.rotation.x = -Math.PI / 2; fl.position.set(o.x, 0.02, o.z); fl.receiveShadow = true; g.add(fl);
    if (!o.glass) {
      const cg = new T.PlaneGeometry(o.w, o.d); const cuv = cg.attributes.uv; for (let i = 0; i < cuv.count; i++) cuv.setXY(i, cuv.getX(i) * o.w / 2.4, cuv.getY(i) * o.d / 2.4);
      const ce = new T.Mesh(cg, MAT.ceiling); ce.rotation.x = Math.PI / 2; ce.position.set(o.x, h - 0.01, o.z); g.add(ce);
      const blk = new T.Mesh(new T.BoxGeometry(o.w + 0.4, 0.12, o.d + 0.4), MAT.shadowOnly); blk.position.set(o.x, h + 0.08, o.z); blk.castShadow = true; g.add(blk);
      const alongX = o.w >= o.d;
      [-1, 1].forEach((s) => {
        const pipe = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, (alongX ? o.w : o.d) - 0.4, 8), s > 0 ? MAT.metal : MAT.blue);
        if (alongX) { pipe.rotation.z = Math.PI / 2; pipe.position.set(o.x, h - 0.18, s > 0 ? z0 + 0.3 : z1 - 0.3); } else { pipe.rotation.x = Math.PI / 2; pipe.position.set(s > 0 ? x0 + 0.3 : x1 - 0.3, h - 0.18, o.z); }
        g.add(pipe);
      });
    }
    const roof = new T.Group(); roof.position.set(o.x, h, o.z); g.add(roof);
    if (o.roof === 'dome' || o.roof === 'glassdome') {
      const r = Math.min(o.w, o.d) / 2 - 0.1;
      if (o.roof === 'dome') B.box(roof, o.w + 0.2, 0.25, o.d + 0.2, MAT.hull, 0, 0.12, 0);
      else { const W = o.w + 0.2, D = o.d + 0.2, bw = 0.35; B.box(roof, W, 0.2, bw, MAT.metal, 0, 0.1, -D / 2 + bw / 2); B.box(roof, W, 0.2, bw, MAT.metal, 0, 0.1, D / 2 - bw / 2); B.box(roof, bw, 0.2, D, MAT.metal, -W / 2 + bw / 2, 0.1, 0); B.box(roof, bw, 0.2, D, MAT.metal, W / 2 - bw / 2, 0.1, 0); }
      const dg = new T.IcosahedronGeometry(r, 2);
      const pos = dg.attributes.position; for (let i = 0; i < pos.count; i++) if (pos.getY(i) < 0) pos.setY(i, 0);
      dg.computeVertexNormals();
      const dome = new T.Mesh(dg, o.roof === 'glassdome' ? MAT.glass : new T.MeshStandardMaterial({ color: 0xeeede8, roughness: 0.45, metalness: 0.2, flatShading: true }));
      dome.position.y = 0.22; dome.castShadow = o.roof !== 'glassdome'; roof.add(dome);
      const edges = new T.LineSegments(new T.EdgesGeometry(dg, 1), new T.LineBasicMaterial({ color: o.roof === 'glassdome' ? 0xcfd6de : 0xb0aca2 }));
      edges.position.y = 0.22; roof.add(edges);
      if (o.roof === 'glassdome') { const ce = new T.Mesh(new T.PlaneGeometry(o.w, o.d), new T.MeshStandardMaterial({ color: 0x9aa1ab, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0 })); }
    } else if (o.roof !== 'none') {
      const alongZ = o.w <= o.d, span = alongZ ? o.w : o.d, len = alongZ ? o.d : o.w;
      const ag = new T.CylinderGeometry(span / 2 + 0.15, span / 2 + 0.15, len + 0.2, 32, 1, true, 0, Math.PI);
      ag.rotateX(Math.PI / 2); ag.rotateZ(Math.PI / 2); if (!alongZ) ag.rotateY(Math.PI / 2);
      const uv2 = ag.attributes.uv; for (let i = 0; i < uv2.count; i++) uv2.setXY(i, uv2.getX(i) * span * 1.5 / 2.5, uv2.getY(i) * len / 2.5);
      const arch = new T.Mesh(ag, MAT.hull); arch.castShadow = true; arch.receiveShadow = true;
      roof.add(arch); roof.scale.y = o.roofScale || 0.5;
      const capMat = new T.MeshStandardMaterial({ color: 0xe7e6e1, roughness: 0.6, side: T.DoubleSide });
      [len / 2 + 0.1, -len / 2 - 0.1].forEach((zo) => { const c = new T.Mesh(new T.CircleGeometry(span / 2 + 0.15, 32, 0, Math.PI), capMat); if (alongZ) c.position.set(0, 0, zo); else { c.rotation.y = Math.PI / 2; c.position.set(zo, 0, 0); } c.castShadow = true; roof.add(c); });
      const bg = new T.CylinderGeometry(span / 2 + 0.18, span / 2 + 0.18, 0.35, 32, 1, true, 0, Math.PI);
      bg.rotateX(Math.PI / 2); bg.rotateZ(Math.PI / 2); if (!alongZ) bg.rotateY(Math.PI / 2);
      const band = new T.Mesh(bg, new T.MeshStandardMaterial({ color: o.stripe || 0xff6b35, roughness: 0.5, side: T.DoubleSide }));
      if (alongZ) band.position.z = len * 0.3; else band.position.x = len * 0.3;
      roof.add(band);
    }
    let light = null;
    if (!o.noLight) { light = new T.PointLight(o.lightColor || 0xfff1e0, (o.lightI || 1.2) * 0.85, Math.max(o.w, o.d) * 1.5 + 2, 1.6); light.position.set(o.x, h - 0.5, o.z); g.add(light); }
    if (o.name && o.signs) o.signs.forEach(([sx, sz, ry]) => B.label(g, o.name, o.sub, sx, doorH + 0.3, sz, ry, o.color, 1.6));
    return { group: g, inner: { minX: x0 + t / 2, maxX: x1 - t / 2, minZ: z0 + t / 2, maxZ: z1 - t / 2, name: o.name, id: o.id }, light };
  };

  /* ---------- móveis e máquinas ---------- */
  B.console = (p, x, z, rotY, title, lines, color = '#3ad0ff', kind) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 1.5, 0.95, 0.6, MAT.dark, 0, 0.475, 0);
    B.box(g, 1.6, 0.06, 0.8, MAT.metal, 0, 0.98, -0.05);
    const s = B.screen(g, title, lines, 0, 1.5, -0.25, 0, color, 1.25, kind); s.rotation.x = -0.15;
    for (let i = 0; i < 6; i++) B.box(g, 0.08, 0.03, 0.08, [MAT.ledBlue, MAT.ledRed, MAT.ledGreen][i % 3], -0.55 + i * 0.22, 1.03, 0.18, { cast: false });
    B.box(g, 0.5, 0.03, 0.2, MAT.darker, 0.3, 1.02, 0.05);
    return g;
  };
  B.chair = (p, x, z, rotY) => { const g = B.grp(p, x, z, rotY); B.cyl(g, 0.04, 0.2, 0.45, MAT.metal, 0, 0.23, 0, 10); B.box(g, 0.48, 0.08, 0.48, MAT.fabricBlue, 0, 0.5, 0); B.box(g, 0.48, 0.5, 0.06, MAT.fabricBlue, 0, 0.78, 0.22); return g; };
  B.sleepPod = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    const curtainMat = new T.MeshStandardMaterial({ color: 0x3b5a9a, roughness: 0.9, side: T.DoubleSide });
    [0, 1.25].forEach((y) => {
      B.box(g, 2.2, 0.06, 1.05, MAT.white, 0, y + 0.05, 0);
      B.box(g, 2.2, 1.15, 0.06, MAT.white, 0, y + 0.6, -0.5);
      B.box(g, 0.06, 1.15, 1.05, MAT.white, -1.1, y + 0.6, 0); B.box(g, 0.06, 1.15, 1.05, MAT.white, 1.1, y + 0.6, 0);
      B.box(g, 2.2, 0.06, 1.05, MAT.white, 0, y + 1.17, 0);
      B.box(g, 2.0, 0.16, 0.9, MAT.fabricBlue, 0, y + 0.16, -0.02);
      B.box(g, 0.45, 0.12, 0.6, MAT.offwhite, -0.72, y + 0.3, -0.05);
      B.box(g, 0.32, 0.2, 0.02, MAT.darker, 0.6, y + 0.8, -0.46);
      const rl = new T.Mesh(new T.BoxGeometry(0.4, 0.03, 0.08), MAT.lamp); rl.position.set(-0.6, y + 1.12, -0.3); g.add(rl);
      const curtain = new T.Mesh(new T.PlaneGeometry(0.9, 1.05), curtainMat); curtain.position.set(0.62, y + 0.6, 0.52); g.add(curtain);
    });
    return g;
  };
  B.locker = (p, x, z, rotY, w = 1.2, h = 2.2) => { const g = B.grp(p, x, z, rotY); B.box(g, w, h, 0.6, [MAT.wallOut, MAT.wallOut, MAT.wallOut, MAT.wallOut, MAT.locker, MAT.wallOut], 0, h / 2, 0); return g; };
  B.shower = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.cyl(g, 0.55, 0.55, 0.12, MAT.white, 0, 0.06, 0, 24);
    const gl = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 2.1, 24, 1, true, Math.PI * 0.25, Math.PI * 1.5), MAT.glass); gl.position.y = 1.17; g.add(gl);
    B.cyl(g, 0.56, 0.56, 0.08, MAT.metal, 0, 2.24, 0, 24);
    B.cyl(g, 0.15, 0.15, 0.04, MAT.chrome, 0, 2.15, 0, 16);
    B.screen(g, 'ÁGUA', ['2,0 L/min', 'Reciclada'], 0, 1.45, -0.5, 0, '#4cc3ff', 0.3);
    return g;
  };
  B.toilet = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 0.55, 0.45, 0.65, MAT.white, 0, 0.23, 0);
    B.cyl(g, 0.24, 0.2, 0.08, MAT.offwhite, 0, 0.5, 0.05, 20);
    B.box(g, 0.6, 1.0, 0.25, MAT.white, 0, 0.9, -0.35);
    const hose = new T.Mesh(new T.TorusGeometry(0.18, 0.03, 8, 16, Math.PI * 1.3), MAT.dark); hose.position.set(0.3, 1.0, -0.2); hose.rotation.y = Math.PI / 2; g.add(hose);
    [-0.35, 0.35].forEach((sx) => B.box(g, 0.04, 0.04, 0.5, MAT.handrail, sx, 0.75, 0));
    return g;
  };
  B.sink = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 1.0, 0.85, 0.55, MAT.white, 0, 0.43, 0);
    B.cyl(g, 0.22, 0.18, 0.08, MAT.chrome, 0, 0.88, 0.02, 20);
    B.box(g, 0.05, 0.25, 0.05, MAT.chrome, 0, 1.0, -0.2);
    B.box(g, 0.8, 0.7, 0.03, MAT.chrome, 0, 1.55, -0.26, { cast: false });
    return g;
  };
  B.galley = (p, x, z, rotY, len = 3) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, len, 0.9, 0.65, [MAT.wallOut, MAT.wallOut, MAT.metal, MAT.wallOut, MAT.locker, MAT.wallOut], 0, 0.45, 0);
    B.box(g, len, 0.06, 0.7, MAT.chrome, 0, 0.93, 0);
    B.box(g, len, 0.7, 0.4, [MAT.wallOut, MAT.wallOut, MAT.wallOut, MAT.wallOut, MAT.locker, MAT.wallOut], 0, 1.9, -0.12);
    B.box(g, 0.6, 0.4, 0.45, MAT.dark, -len / 2 + 0.5, 1.18, -0.05);
    const win = new T.Mesh(new T.PlaneGeometry(0.4, 0.22), new T.MeshBasicMaterial({ color: 0xffa040 })); win.position.set(-len / 2 + 0.45, 1.18, 0.18); g.add(win);
    B.box(g, 0.3, 0.5, 0.3, MAT.white, len / 2 - 0.4, 1.2, -0.1); B.cyl(g, 0.02, 0.02, 0.1, MAT.chrome, len / 2 - 0.4, 1.0, 0.06, 6);
    for (let i = 0; i < 6; i++) B.box(g, 0.14, 0.2, 0.04, [MAT.orange, MAT.yellow, MAT.plant, MAT.blue][i % 4], -0.2 + i * 0.16, 1.07, 0.2, { cast: false });
    return g;
  };
  B.table = (p, x, z, r = 0.8, seats = 4) => {
    const g = B.grp(p, x, z, 0);
    B.cyl(g, r, r, 0.06, MAT.white, 0, 0.78, 0, 32); B.cyl(g, 0.08, 0.25, 0.75, MAT.metal, 0, 0.38, 0, 12);
    for (let i = 0; i < seats; i++) { const a = i / seats * Math.PI * 2; B.chair(g, Math.sin(a) * (r + 0.45), Math.cos(a) * (r + 0.45), a + Math.PI); }
    B.cyl(g, 0.05, 0.05, 0.12, MAT.orange, 0.2, 0.87, 0.1, 10); B.cyl(g, 0.05, 0.05, 0.12, MAT.blue, -0.25, 0.87, -0.2, 10);
    return g;
  };
  B.treadmill = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 0.9, 0.2, 2.0, MAT.dark, 0, 0.1, 0); B.box(g, 0.7, 0.03, 1.8, MAT.rubber, 0, 0.21, 0);
    [-0.45, 0.45].forEach((sx) => { B.box(g, 0.05, 1.1, 0.05, MAT.metal, sx, 0.7, -0.85); B.box(g, 0.05, 0.05, 0.9, MAT.metal, sx, 1.2, -0.45); });
    B.screen(g, 'T2', ['8,2 km/h', '42 min'], 0, 1.45, -0.88, 0, '#46d483', 0.45);
    [-0.35, 0.35].forEach((sx) => { const b = B.cyl(g, 0.015, 0.015, 1.6, MAT.yellow, sx, 1.6, 0.1, 6); b.rotation.x = 0.2; });
    return g;
  };
  B.bike = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 0.5, 0.08, 1.2, MAT.dark, 0, 0.04, 0);
    const fw = B.cyl(g, 0.3, 0.3, 0.08, MAT.metal, 0, 0.45, -0.35, 24); fw.rotation.z = Math.PI / 2;
    B.box(g, 0.06, 0.9, 0.06, MAT.metal, 0, 0.5, 0.25).rotation.x = -0.25;
    B.box(g, 0.25, 0.06, 0.35, MAT.rubber, 0, 0.98, 0.35);
    B.box(g, 0.5, 0.05, 0.05, MAT.metal, 0, 1.1, -0.45);
    B.screen(g, 'CEVIS', ['120 W'], 0, 1.3, -0.5, 0, '#46d483', 0.3);
    return g;
  };
  B.ared = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 1.6, 0.12, 1.2, MAT.dark, 0, 0.06, 0);
    [-0.75, 0.75].forEach((sx) => { B.box(g, 0.12, 2.2, 0.12, MAT.metal, sx, 1.1, -0.5); B.cyl(g, 0.18, 0.18, 0.5, MAT.darker, sx, 0.6, -0.45, 16); });
    B.box(g, 1.7, 0.08, 0.1, MAT.metal, 0, 2.2, -0.5);
    B.cyl(g, 0.03, 0.03, 1.6, MAT.chrome, 0, 1.4, -0.2, 8).rotation.z = Math.PI / 2;
    return g;
  };
  B.glovebox = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 1.6, 0.9, 0.8, MAT.dark, 0, 0.45, 0);
    B.box(g, 1.5, 0.8, 0.7, MAT.glass, 0, 1.3, 0, { cast: false });
    B.box(g, 1.55, 0.06, 0.75, MAT.metal, 0, 1.72, 0);
    [-0.35, 0.35].forEach((sx) => { const port = new T.Mesh(new T.TorusGeometry(0.1, 0.03, 8, 20), MAT.darker); port.position.set(sx, 1.2, 0.36); g.add(port); const glove = B.cyl(g, 0.07, 0.09, 0.4, MAT.rubber, sx, 1.2, 0.15, 10); glove.rotation.x = Math.PI / 2; });
    B.cyl(g, 0.08, 0.08, 0.12, MAT.water, -0.3, 0.98, -0.1, 12); B.box(g, 0.25, 0.08, 0.2, MAT.white, 0.3, 0.95, -0.1);
    const lamp = new T.Mesh(new T.BoxGeometry(1.3, 0.02, 0.05), MAT.lampCool); lamp.position.set(0, 1.68, 0); g.add(lamp);
    return g;
  };
  B.labBench = (p, x, z, rotY, len = 2.6) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, len, 0.9, 0.8, [MAT.wallOut, MAT.wallOut, MAT.white, MAT.wallOut, MAT.locker, MAT.wallOut], 0, 0.45, 0);
    B.box(g, len, 0.05, 0.85, MAT.white, 0, 0.92, 0);
    const m = B.grp(g, -len / 2 + 0.45, 0, 0, 0.95);
    B.box(m, 0.3, 0.05, 0.35, MAT.white, 0, 0.03, 0); B.box(m, 0.06, 0.45, 0.06, MAT.white, 0, 0.25, -0.12); B.cyl(m, 0.04, 0.05, 0.25, MAT.darker, 0, 0.45, -0.02, 10).rotation.x = 0.5; B.box(m, 0.18, 0.03, 0.18, MAT.dark, 0, 0.16, 0);
    B.cyl(g, 0.2, 0.22, 0.25, MAT.white, 0.1, 1.07, 0, 20); B.cyl(g, 0.18, 0.18, 0.02, MAT.glassDark, 0.1, 1.2, 0, 20);
    for (let i = 0; i < 5; i++) B.cyl(g, 0.025, 0.025, 0.15, [MAT.water, MAT.tomato, MAT.ledGreen][i % 3], len / 2 - 0.5 + i * 0.06, 1.02, 0.15, 8);
    B.box(g, 0.45, 0.32, 0.03, MAT.darker, len / 2 - 0.35, 1.25, -0.3);
    return g;
  };
  B.freezer = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 0.9, 2.0, 0.75, MAT.white, 0, 1.0, 0);
    B.box(g, 0.05, 0.6, 0.05, MAT.chrome, 0.35, 1.2, 0.4);
    B.screen(g, '−80 °C', ['MELFI'], -0.15, 1.6, 0.38, 0, '#4cc3ff', 0.35);
    return g;
  };
  B.printer3d = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 0.8, 0.9, 0.75, MAT.locker, 0, 0.45, 0);
    B.box(g, 0.7, 0.8, 0.7, MAT.dark, 0, 1.3, 0);
    B.box(g, 0.55, 0.5, 0.02, MAT.glass, 0, 1.3, 0.36, { cast: false });
    const noz = new T.Mesh(new T.SphereGeometry(0.03, 8, 6), new T.MeshBasicMaterial({ color: 0xff7a30 })); noz.position.set(0, 1.4, 0.1); g.add(noz);
    B.box(g, 0.2, 0.08, 0.2, MAT.orange, 0, 1.12, 0.05);
    return g;
  };
  B.medBed = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 0.9, 0.5, 2.0, MAT.white, 0, 0.45, 0); B.box(g, 0.8, 0.12, 1.9, MAT.offwhite, 0, 0.76, 0);
    B.box(g, 0.7, 0.12, 0.5, MAT.offwhite, 0, 0.9, -0.7).rotation.x = 0.35;
    const cart = B.grp(g, 0.9, -0.6, 0);
    B.box(cart, 0.5, 0.9, 0.45, MAT.white, 0, 0.45, 0); B.screen(cart, 'ULTRASSOM', ['FC 72 bpm', 'PA 12/8'], 0, 1.3, 0, 0, '#46d483', 0.5);
    return g;
  };
  B.o2gen = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 1.6, 2.3, 0.8, MAT.rack2, 0, 1.15, 0);
    [-0.45, 0, 0.45].forEach((sx) => { B.cyl(g, 0.16, 0.16, 1.4, MAT.white, sx, 1.1, 0.5, 16); B.cyl(g, 0.17, 0.17, 0.08, MAT.blue, sx, 1.75, 0.5, 16); });
    B.cyl(g, 0.04, 0.04, 1.2, MAT.chrome, 0, 1.95, 0.5, 8).rotation.z = Math.PI / 2;
    B.screen(g, 'O₂ · ELETRÓLISE', ['5,4 kg/dia', '101 kPa'], 0, 2.0, 0.42, 0, '#4cc3ff', 0.7);
    return g;
  };
  B.co2Scrubber = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 1.2, 2.3, 0.8, MAT.rack, 0, 1.15, 0);
    for (let i = 0; i < 4; i++) B.box(g, 0.9, 0.22, 0.06, MAT.dark, 0, 0.5 + i * 0.32, 0.42);
    B.screen(g, 'CO₂', ['0,3 kPa · OK'], 0, 1.95, 0.42, 0, '#46d483', 0.5);
    return g;
  };
  B.waterRecycler = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 1.8, 0.3, 0.9, MAT.dark, 0, 0.15, 0);
    [-0.5, 0.5].forEach((sx) => { B.cyl(g, 0.35, 0.35, 1.6, MAT.white, sx, 1.1, 0, 20); B.cyl(g, 0.36, 0.36, 0.7, MAT.water, sx, 0.75, 0, 20); });
    const pipe = new T.Mesh(new T.TorusGeometry(0.5, 0.04, 8, 16, Math.PI), MAT.chrome); pipe.position.set(0, 1.9, 0); g.add(pipe);
    B.screen(g, 'ÁGUA', ['Recuperação 98%'], 0, 1.3, 0.47, 0, '#4cc3ff', 0.45);
    return g;
  };
  B.powerPanel = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    B.box(g, 1.4, 2.0, 0.35, MAT.dark, 0, 1.2, 0);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { B.box(g, 0.12, 0.2, 0.05, MAT.offwhite, -0.5 + c * 0.2, 0.6 + r * 0.32, 0.2, { cast: false }); B.box(g, 0.05, 0.05, 0.03, (r + c) % 4 ? MAT.ledGreen : MAT.ledRed, -0.5 + c * 0.2, 0.75 + r * 0.32, 0.2, { cast: false }); }
    B.box(g, 1.4, 0.08, 0.36, MAT.hazard, 0, 2.2, 0, { cast: false });
    return g;
  };
  B.batteryRack = (p, x, z, rotY) => {
    const g = B.grp(p, x, z, rotY);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { B.box(g, 0.4, 0.5, 0.6, MAT.navy, -0.66 + c * 0.44, 0.3 + r * 0.6, 0); B.box(g, 0.1, 0.04, 0.02, MAT.ledGreen, -0.66 + c * 0.44, 0.45 + r * 0.6, 0.31, { cast: false }); }
    return g;
  };
  B.suit = (p, x, z, rotY, y = 0) => {
    const g = B.grp(p, x, z, rotY, y);
    B.box(g, 0.5, 0.65, 0.32, MAT.white, 0, 1.45, 0);
    B.box(g, 0.52, 0.7, 0.28, MAT.white, 0, 1.45, -0.3);
    B.sph(g, 0.2, MAT.white, 0, 1.95, 0.02, 20);
    const visor = B.sph(g, 0.17, MAT.visor, 0, 1.95, 0.08, 20); visor.scale.set(1, 0.85, 0.7);
    [-0.33, 0.33].forEach((sx) => { const arm = B.cyl(g, 0.08, 0.07, 0.6, MAT.white, sx, 1.35, 0.02, 10); arm.rotation.z = sx > 0 ? 0.15 : -0.15; B.sph(g, 0.07, MAT.dark, sx * 1.12, 1.03, 0.02, 10); });
    [-0.13, 0.13].forEach((sx) => { B.cyl(g, 0.1, 0.09, 0.8, MAT.white, sx, 0.75, 0, 10); B.box(g, 0.14, 0.12, 0.26, MAT.offwhite, sx, 0.32, 0.04); });
    B.box(g, 0.3, 0.16, 0.1, MAT.offwhite, 0, 1.35, 0.18);
    B.box(g, 0.1, 0.04, 0.02, MAT.ledRed, 0.12, 1.4, 0.24, { cast: false });
    B.box(g, 0.08, 0.05, 0.02, MAT.orange, -0.18, 1.62, 0.17, { cast: false });
    return g;
  };
  // folha curva compartilhada (roseta) para estufas e racks
  let _leafG = null;
  B.leafGeo = () => { if (_leafG) return _leafG; const lg = new T.SphereGeometry(0.1, 10, 6, -Math.PI * 0.45, Math.PI * 0.9, 0, Math.PI * 0.6); lg.translate(0, -0.1, 0); lg.rotateX(Math.PI); lg.scale(1.25, 1.45, 0.8); _leafG = lg; return lg; };
  // InstancedMesh de rosetas: pts = [[x,y,z,escala], ...]
  B.rosettes = (g, pts, mat, leaves = 6) => {
    const inst = new T.InstancedMesh(B.leafGeo(), mat, pts.length * leaves), m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(0, 0, 0, 'YXZ'); let k = 0;
    pts.forEach(([x, y, z, sc = 1], j) => { for (let i = 0; i < leaves; i++) { e.set(0.7 + (i % 2) * 0.45, i / leaves * Math.PI * 2 + j * 0.9, 0); q.setFromEuler(e); m4.compose(new T.Vector3(x, y, z), q, new T.Vector3(sc, sc * (0.85 + (i % 3) * 0.12), sc)); inst.setMatrixAt(k++, m4); } });
    inst.castShadow = true; g.add(inst); return inst;
  };
  B.plantRack = (p, x, z, rotY, len = 3) => {
    const g = B.grp(p, x, z, rotY);
    for (let lvl = 0; lvl < 3; lvl++) {
      const y = 0.45 + lvl * 0.7;
      B.box(g, len, 0.05, 0.7, MAT.metal, 0, y, 0);
      B.box(g, len - 0.1, 0.12, 0.6, MAT.white, 0, y + 0.09, 0);
      const n = Math.round(len * 3);
      B.rosettes(g, Array.from({ length: n }, (_, i) => [-len / 2 + 0.2 + i * (len - 0.4) / (n - 1), y + 0.15, ((i + lvl) % 2 ? 0.13 : -0.13), 1.05 + ((i * 7 + lvl) % 4) * 0.1]), lvl === 1 ? MAT.redLeaf : MAT.plant, 6);
      if (lvl === 0) for (let i = 0; i < 4; i++) B.sph(g, 0.05, MAT.tomato, -len / 2 + 0.5 + i * len / 4, y + 0.32, 0.18, 8);
      const led = new T.Mesh(new T.BoxGeometry(len - 0.2, 0.03, 0.1), MAT.ledPink); led.position.set(0, y + 0.62, 0); g.add(led);
    }
    [-1, 1].forEach((sx) => B.box(g, 0.05, 2.2, 0.05, MAT.metal, sx * len / 2, 1.1, 0.33));
    return g;
  };
  B.plantTower = (p, x, z) => {
    const g = B.grp(p, x, z, 0);
    B.cyl(g, 0.12, 0.12, 2.2, MAT.white, 0, 1.1, 0, 12);
    B.rosettes(g, Array.from({ length: 16 }, (_, i) => { const a = i * 2.4; return [Math.cos(a) * 0.17, 0.35 + (i % 8) * 0.24, Math.sin(a) * 0.17, 0.9]; }), MAT.plant, 5);
    B.cyl(g, 0.3, 0.3, 0.15, MAT.white, 0, 0.08, 0, 16);
    return g;
  };
  B.holoTable = (p, x, z, kind = 'mars') => {
    const g = B.grp(p, x, z, 0);
    B.cyl(g, 1.2, 1.3, 0.9, MAT.dark, 0, 0.45, 0, 32); B.cyl(g, 1.25, 1.25, 0.05, MAT.glassDark, 0, 0.92, 0, 32);
    const ring = new T.Mesh(new T.TorusGeometry(1.15, 0.03, 8, 48), MAT.ledBlue); ring.rotation.x = Math.PI / 2; ring.position.y = 0.95; g.add(ring);
    const hc = kind === 'moon' ? 0xbfd8ff : 0xff9a5a;
    const holo = new T.Group(); holo.position.y = 1.45; g.add(holo);
    holo.add(new T.Mesh(new T.SphereGeometry(0.42, 32, 20), new T.MeshBasicMaterial({ color: hc, transparent: true, opacity: 0.22, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })));
    holo.add(new T.Mesh(new T.IcosahedronGeometry(0.44, 3), new T.MeshBasicMaterial({ color: hc, wireframe: true, transparent: true, opacity: 0.7, toneMapped: false })));
    const orbitR = new T.Mesh(new T.TorusGeometry(0.62, 0.008, 6, 64), new T.MeshBasicMaterial({ color: 0x4cc3ff, toneMapped: false })); orbitR.rotation.x = 1.2; holo.add(orbitR);
    const moonlet = new T.Mesh(new T.SphereGeometry(0.05, 12, 8), new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); moonlet.position.set(0.62, 0, 0); orbitR.add(moonlet);
    const gridTop = new T.Mesh(new T.CircleGeometry(1.15, 48), new T.MeshBasicMaterial({ map: TEX.holoGrid || (TEX.holoGrid = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#04121c'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(76,195,255,.55)'; c.lineWidth = 1; for (let i = 0; i <= w; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } c.strokeStyle = 'rgba(255,154,90,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(128, 128, 60, 0, 7); c.stroke(); c.beginPath(); c.arc(128, 128, 100, 0, 7); c.stroke(); })), toneMapped: false }));
    gridTop.rotation.x = -Math.PI / 2; gridTop.position.y = 0.955; g.add(gridTop);
    const cone = new T.Mesh(new T.ConeGeometry(0.6, 0.6, 24, 1, true), new T.MeshBasicMaterial({ color: 0x4cc3ff, transparent: true, opacity: 0.08, side: T.DoubleSide, depthWrite: false })); cone.position.y = 1.25; cone.rotation.x = Math.PI; g.add(cone);
    g.userData.holo = holo;
    return g;
  };
  B.crates = (p, x, z, n = 3) => { const g = B.grp(p, x, z, 0); for (let i = 0; i < n; i++) { const s = 0.5 + (i % 2) * 0.15; B.box(g, s, s * 0.8, s, MAT.bag, (i % 2) * 0.6, s * 0.4 + Math.floor(i / 2) * 0.55, 0); } return g; };

  /* ---------- exterior ---------- */
  B.solarArray = (p, x, z, rotY, tall) => {
    const g = B.grp(p, x, z, rotY);
    if (tall) {
      B.cyl(g, 0.18, 0.28, 12, MAT.metal, 0, 6, 0, 10);
      const pn = new T.Group(); pn.position.y = 8; g.add(pn);
      const panel = new T.Mesh(boxGeo(3.2, 7.5, 0.08, 3.2, 1.6), [MAT.metal, MAT.metal, MAT.metal, MAT.metal, MAT.solar, MAT.goldSolar]); shadowed(panel); pn.add(panel);
      g.userData.panel = pn;
      return g;
    }
    [-1.6, 1.6].forEach((sx) => B.cyl(g, 0.07, 0.09, 1.4, MAT.metal, sx, 0.7, 0, 8));
    const panel = new T.Mesh(boxGeo(5.2, 0.07, 2.4, 2.6, 1.2), [MAT.metal, MAT.metal, MAT.solar, MAT.dark, MAT.metal, MAT.metal]); panel.position.y = 1.55; panel.rotation.x = -0.4; shadowed(panel); g.add(panel);
    g.userData.panel = panel;
    return g;
  };
  B.rover = (p) => {
    const g = new T.Group(); p.add(g);
    B.box(g, 2.3, 0.35, 3.8, MAT.dark, 0, 0.85, 0);
    B.box(g, 2.2, 0.9, 2.2, MAT.white, 0, 1.45, 0.4);
    const cab = new T.Mesh(new T.SphereGeometry(1.15, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.glassDark); cab.scale.set(0.95, 0.65, 0.8); cab.position.set(0, 1.85, -0.75); g.add(cab);
    B.box(g, 2.35, 0.12, 3.9, MAT.orange, 0, 1.06, 0);
    const wheels = [];
    [[-1.3, -1.25], [1.3, -1.25], [-1.3, 1.25], [1.3, 1.25]].forEach(([wx, wz]) => {
      const w = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.4, 20), MAT.rubber); w.rotation.z = Math.PI / 2;
      const hub = new T.Group(); hub.position.set(wx, 0.5, wz); hub.add(w); g.add(hub); w.castShadow = true; wheels.push(hub);
      const cap = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.42, 12), MAT.metal); cap.rotation.z = Math.PI / 2; hub.add(cap);
    });
    B.cyl(g, 0.02, 0.02, 1.2, MAT.metal, 0.8, 2.3, 1.2, 6);
    const dish = B.sph(g, 0.25, MAT.white, 0.8, 2.9, 1.2, 12); dish.scale.y = 0.3;
    const sp = new T.Mesh(boxGeo(1.6, 0.05, 1.0, 1.6, 1), [MAT.metal, MAT.metal, MAT.solar, MAT.metal, MAT.metal, MAT.metal]); sp.position.set(0, 1.95, 1.0); g.add(sp);
    [-0.7, 0.7].forEach((sx) => { const l = new T.Mesh(new T.CircleGeometry(0.1, 12), MAT.lamp); l.position.set(sx, 1.0, -1.96); l.rotation.y = Math.PI; g.add(l); });
    return { group: g, wheels };
  };
  B.dish = (p, x, z) => {
    const g = B.grp(p, x, z, 0);
    B.cyl(g, 0.5, 0.8, 0.6, MAT.dark, 0, 0.3, 0, 12);
    B.cyl(g, 0.25, 0.4, 3, MAT.metal, 0, 1.8, 0, 10);
    const dish = new T.Mesh(new T.SphereGeometry(2.4, 32, 12, 0, Math.PI * 2, 0, 0.85), new T.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.35, metalness: 0.3, side: T.DoubleSide }));
    dish.position.y = 3.6; dish.rotation.x = -2.2; dish.castShadow = true; g.add(dish);
    B.cyl(g, 0.04, 0.04, 1.8, MAT.metal, 0, 4.0, 0.7, 6).rotation.x = 0.7;
    g.userData.dish = dish;
    return g;
  };
  B.reactor = (p, x, y, z) => {
    const g = new T.Group(); g.position.set(x, y, z); p.add(g);
    B.cyl(g, 1.2, 1.4, 0.5, MAT.dark, 0, 0.25, 0, 20);
    B.cyl(g, 0.6, 0.6, 2.6, MAT.metal, 0, 1.8, 0, 20);
    const fins = new T.Mesh(new T.ConeGeometry(2.6, 3.0, 24, 1, true), new T.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.4, metalness: 0.7, side: T.DoubleSide })); fins.position.y = 4.6; fins.rotation.x = Math.PI; shadowed(fins); g.add(fins);
    B.cyl(g, 0.65, 0.65, 0.3, MAT.hazard, 0, 1.0, 0, 20);
    const glow = new T.Mesh(new T.CylinderGeometry(0.62, 0.62, 0.06, 20), MAT.ledBlue); glow.position.y = 3.1; g.add(glow);
    return g;
  };
  B.lander = (p, x, y, z) => {
    const g = new T.Group(); g.position.set(x, y, z); p.add(g);
    B.cyl(g, 2.6, 2.6, 12, MAT.chrome, 0, 8, 0, 32);
    const nose = new T.Mesh(new T.SphereGeometry(2.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), MAT.chrome); nose.scale.y = 1.6; nose.position.y = 14; shadowed(nose); g.add(nose);
    B.cyl(g, 2.65, 2.65, 1.0, MAT.darker, 0, 3, 0, 32);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const leg = B.box(g, 0.35, 4.5, 0.35, MAT.metal, Math.cos(a) * 3.2, 1.8, Math.sin(a) * 3.2); leg.rotation.z = Math.cos(a) * 0.4; leg.rotation.x = -Math.sin(a) * 0.4; B.cyl(g, 0.6, 0.7, 0.15, MAT.metal, Math.cos(a) * 4.0, 0.08, Math.sin(a) * 4.0, 12); }
    const win = new T.Mesh(new T.PlaneGeometry(1.2, 0.5), MAT.glassDark); win.position.set(0, 15, 2.62); g.add(win);
    B.box(g, 1.2, 2.2, 0.1, MAT.dark, 0, 12.5, 2.6);
    B.box(g, 0.25, 7, 0.25, MAT.metal, 2.7, 3.5, 0.4);
    return g;
  };
  B.pad = (p, x, y, z, r = 12) => { const m = new T.Mesh(new T.CircleGeometry(r, 48), MAT.pad); m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.05, z); m.receiveShadow = true; p.add(m); return m; };
  B.weather = (p, x, y, z) => {
    const g = new T.Group(); g.position.set(x, y, z); p.add(g);
    B.cyl(g, 0.05, 0.07, 3, MAT.metal, 0, 1.5, 0, 8);
    B.box(g, 0.6, 0.05, 0.05, MAT.metal, 0, 2.6, 0);
    [-0.3, 0.3].forEach((sx) => B.sph(g, 0.08, MAT.white, sx, 2.65, 0, 10));
    B.box(g, 0.3, 0.4, 0.3, MAT.white, 0, 1.4, 0.1);
    g.userData.vane = B.box(g, 0.04, 0.12, 0.35, MAT.orange, 0, 3.05, 0);
    return g;
  };
  B.seismo = (p, x, y, z) => {
    const g = new T.Group(); g.position.set(x, y, z); p.add(g);
    const d = new T.Mesh(new T.SphereGeometry(0.45, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), MAT.foil); shadowed(d); g.add(d);
    for (let i = 0; i < 3; i++) { const a = i * 2.1; const l = B.cyl(g, 0.02, 0.02, 0.5, MAT.metal, Math.cos(a) * 0.4, 0.15, Math.sin(a) * 0.4, 6); l.rotation.z = Math.cos(a) * 0.6; l.rotation.x = -Math.sin(a) * 0.6; }
    B.box(g, 0.25, 0.04, 0.02, MAT.ledGreen, 0, 0.3, 0.42, { cast: false });
    return g;
  };
  B.flag = (p, x, y, z, tex) => {
    const g = new T.Group(); g.position.set(x, y, z); p.add(g);
    B.cyl(g, 0.04, 0.04, 3.4, MAT.chrome, 0, 1.7, 0, 8);
    B.cyl(g, 0.02, 0.02, 1.6, MAT.chrome, 0.8, 3.3, 0, 6).rotation.z = Math.PI / 2;
    const cloth = new T.Mesh(new T.PlaneGeometry(1.6, 1.6), new T.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.8, side: T.DoubleSide }));
    cloth.position.set(0.82, 2.48, 0); shadowed(cloth); g.add(cloth);
    return g;
  };
  B.marker = (p, x, y, z, color = 0xff6b35) => { const g = new T.Group(); g.position.set(x, y, z); p.add(g); B.cyl(g, 0.02, 0.02, 1, MAT.metal, 0, 0.5, 0, 6); B.box(g, 0.25, 0.15, 0.01, new T.MeshStandardMaterial({ color }), 0.13, 0.92, 0); return g; };
  B.berm = (p, x, z, w, d, h, color) => {
    const geo = new T.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const n = fbm(pos.getX(i) * 3, pos.getZ(i) * 3, 9, 3); pos.setXYZ(i, pos.getX(i) * (1 + n * 0.08), pos.getY(i) * (1 + n * 0.2), pos.getZ(i) * (1 + n * 0.08)); }
    geo.computeVertexNormals();
    const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color, roughness: 1, flatShading: true })); m.scale.set(w / 2, h, d / 2); m.position.set(x, 0, z); shadowed(m); p.add(m); return m;
  };

  B.terrain = (p, opt) => {
    const size = opt.size || 600, seg = opt.seg || 200, seed = opt.seed || 3, craters = opt.craters || [];
    const flats = (opt.flats || []).map((f) => Object.assign({}, f));
    const height = (x, z) => {
      let h0 = baseH(x, z);
      for (const f of flats) { if (f.h === undefined) f.h = baseH(f.x, f.z); const k = smooth(f.r, f.r + 9, Math.hypot(x - f.x, z - f.z)); h0 = f.h + (h0 - f.h) * k; }
      return h0;
    };
    const baseH = (x, z) => {
      const r = Math.hypot(x, z);
      const flat = smooth(opt.flatR || 34, (opt.flatR || 34) + 26, r);
      let h = (fbm(x * 0.012, z * 0.012, seed) - 0.5) * (opt.amp || 9) + (fbm(x * 0.05, z * 0.05, seed + 3, 3) - 0.5) * 1.4 + (fbm(x * 0.3, z * 0.3, seed + 7, 2) - 0.5) * 0.18;
      for (const c of craters) { const d = Math.hypot(x - c.x, z - c.z) / c.r; if (d < 1.9) h += d < 1 ? -c.depth * (1 - d * d) : c.rim * Math.exp(-Math.pow((d - 1.05) / 0.22, 2)); }
      const rim = smooth(170, 280, r) * (22 + fbm(Math.atan2(z, x) * 3, 0, seed + 9, 3) * 40);
      return h * flat + rim;
    };
    const geo = new T.PlaneGeometry(size, size, seg, seg); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
    const c1 = new T.Color(opt.c1), c2 = new T.Color(opt.c2), c3 = new T.Color(opt.c3 || opt.c1), tmp = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), y = height(x, z); pos.setY(i, y);
      const n = fbm(x * 0.03, z * 0.03, seed + 1, 4);
      tmp.copy(c1).lerp(c2, clamp(n * 1.4 - 0.2, 0, 1));
      tmp.lerp(c3, clamp((fbm(x * 0.008, z * 0.008, seed + 5, 3) - 0.55) * 3, 0, 1));
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const detail = canvasTex(512, 512, (g, w, h) => {
      const img = g.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 170 + fbm(x / 18, y / 18, 4, 4) * 60 + Math.random() * 25; const i = (y * w + x) * 4; img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0);
      const R = rand(seed); for (let i = 0; i < 60; i++) { const x = R() * w, y = R() * h, r = 2 + R() * 10; g.strokeStyle = 'rgba(60,60,60,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.fillStyle = 'rgba(0,0,0,.08)'; g.fill(); }
    }, [70, 70]);
    const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, map: detail, roughness: 0.97, metalness: 0 }));
    mesh.receiveShadow = true; p.add(mesh);
    const rockGeo = new T.DodecahedronGeometry(1, 1);
    const rp = rockGeo.attributes.position; for (let i = 0; i < rp.count; i++) { const k = 0.8 + noise2(rp.getX(i) * 3, rp.getZ(i) * 3 + rp.getY(i), 2) * 0.4; rp.setXYZ(i, rp.getX(i) * k, rp.getY(i) * k, rp.getZ(i) * k); }
    rockGeo.computeVertexNormals();
    const N = opt.rocks || 600; const rocks = new T.InstancedMesh(rockGeo, new T.MeshStandardMaterial({ color: opt.rock || 0x7a3a20, roughness: 0.95, flatShading: true }), N);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), pp = new T.Vector3(); const R = rand(seed * 99 + 1);
    let k = 0, tries = 0;
    while (k < N && tries++ < N * 10) {
      const a = R() * Math.PI * 2, d = 16 + Math.pow(R(), 0.7) * 220, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (opt.avoid && opt.avoid(x, z)) continue;
      const s = 0.12 + Math.pow(R(), 5) * 2.2;
      pp.set(x, height(x, z) + s * 0.25, z); q.setFromEuler(new T.Euler(R() * 3, R() * 3, R() * 3)); sc.set(s, s * (0.5 + R() * 0.5), s * (0.7 + R() * 0.6));
      m4.compose(pp, q, sc); rocks.setMatrixAt(k++, m4);
    }
    rocks.count = k; rocks.castShadow = true; rocks.receiveShadow = true; p.add(rocks);
    return { mesh, height };
  };

  B.stars = (p, n = 3000, r = 9000) => {
    const g = new T.BufferGeometry(), arr = new Float32Array(n * 3), col = new Float32Array(n * 3); const R = rand(42);
    for (let i = 0; i < n; i++) { const u = R() * 2 - 1, th = R() * Math.PI * 2, s = Math.sqrt(1 - u * u); arr[i * 3] = r * s * Math.cos(th); arr[i * 3 + 1] = r * u; arr[i * 3 + 2] = r * s * Math.sin(th); const b = 0.5 + R() * 0.5, warm = R(); col[i * 3] = b; col[i * 3 + 1] = b * (0.9 + warm * 0.1); col[i * 3 + 2] = b * (0.85 + (1 - warm) * 0.15); }
    g.setAttribute('position', new T.BufferAttribute(arr, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
    const pts = new T.Points(g, new T.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.95, fog: false, depthWrite: false }));
    p.add(pts); return pts;
  };
  B.skyDome = (p, colors) => {
    const mat = new T.ShaderMaterial({
      uniforms: { top: { value: new T.Color(colors.top) }, horizon: { value: new T.Color(colors.horizon) }, bottom: { value: new T.Color(colors.bottom) }, sunDir: { value: new T.Vector3(0, 1, 0) }, sunCol: { value: new T.Color(colors.sun || 0xffffff) }, glowCol: { value: new T.Color(colors.glow || 0x88aaff) }, day: { value: 1 }, dust: { value: 0 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }',
      fragmentShader: [
        'uniform vec3 top, horizon, bottom, sunDir, sunCol, glowCol; uniform float day, dust; varying vec3 vDir;',
        'void main(){ float y = vDir.y; vec3 c = y > 0.0 ? mix(horizon, top, pow(y, 0.55)) : mix(horizon, bottom, pow(min(-y * 4.0, 1.0), 0.4));',
        ' float s = max(dot(vDir, normalize(sunDir)), 0.0);',
        ' c += glowCol * pow(s, 6.0) * 0.6 * (1.0 - day * 0.55) + sunCol * pow(s, 80.0) * 0.8;',
        ' c = mix(c, vec3(0.55,0.35,0.22), dust * 0.6);',
        ' c *= mix(0.05, 1.0, day); gl_FragColor = vec4(c, 1.0); }'
      ].join('\n'),
      side: T.BackSide, depthWrite: false, fog: false
    });
    const m = new T.Mesh(new T.SphereGeometry(5000, 32, 16), mat); m.renderOrder = -10; m.frustumCulled = false; p.add(m); return m;
  };
  B.sunSprite = (p, size = 600, color = 0xfff6d8) => { const s = new T.Sprite(new T.SpriteMaterial({ map: TEX.glow, color, transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, toneMapped: false })); s.scale.set(size, size, 1); p.add(s); return s; };
  B.earth = (p, R) => {
    const day = imageTex(ASSETS.earthDay), night = imageTex(ASSETS.earthNight);
    const mat = new T.ShaderMaterial({
      uniforms: { dayMap: { value: day }, nightMap: { value: night }, sunDir: { value: new T.Vector3(1, 0, 0) } },
      vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: [
        'uniform sampler2D dayMap, nightMap; uniform vec3 sunDir; varying vec2 vUv; varying vec3 vN;',
        'void main(){ float l = dot(normalize(vN), normalize(sunDir)); float k = smoothstep(-0.12, 0.25, l);',
        ' vec3 d = texture2D(dayMap, vUv).rgb * (0.06 + 1.25 * max(l, 0.0));',
        ' vec3 n = texture2D(nightMap, vUv).rgb * vec3(1.0, 0.8, 0.5) * 1.4;',
        ' gl_FragColor = vec4(mix(n, d, k), 1.0); }'
      ].join('\n'),
      fog: false
    });
    const m = new T.Mesh(new T.SphereGeometry(R, 128, 64), mat); p.add(m);
    const amat = new T.ShaderMaterial({
      uniforms: { sunDir: { value: new T.Vector3(1, 0, 0) } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }',
      fragmentShader: 'uniform vec3 sunDir; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); float l = smoothstep(-0.3, 0.4, dot(vN, normalize(sunDir))); gl_FragColor = vec4(vec3(0.35,0.62,1.0) * f * 1.8 * l, f * l); }',
      transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false
    });
    const atmo = new T.Mesh(new T.SphereGeometry(R * 1.02, 96, 48), amat); p.add(atmo);
    return { mesh: m, atmo, setSun: (v) => { mat.uniforms.sunDir.value.copy(v); amat.uniforms.sunDir.value.copy(v); } };
  };
  B.dust = (p, color = 0xd9a070, n = 600, r = 30) => {
    const g = new T.BufferGeometry(), arr = new Float32Array(n * 3); const R = rand(77);
    for (let i = 0; i < n; i++) { arr[i * 3] = (R() - 0.5) * r * 2; arr[i * 3 + 1] = R() * 8; arr[i * 3 + 2] = (R() - 0.5) * r * 2; }
    g.setAttribute('position', new T.BufferAttribute(arr, 3));
    const pts = new T.Points(g, new T.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.5, depthWrite: false })); p.add(pts); return pts;
  };


  /* ---------- agricultura: bandeja hidropônica com plantas que crescem ---------- */
  B.growTray = (p, x, z, rotY, len = 2.4, y0 = 0) => {
    const g = B.grp(p, x, z, rotY, y0);
    B.box(g, len, 0.75, 0.85, [MAT.wallOut, MAT.wallOut, MAT.white, MAT.wallOut, MAT.locker, MAT.wallOut], 0, 0.38, 0);
    const water = B.box(g, len - 0.12, 0.08, 0.72, MAT.water, 0, 0.8, 0, { cast: false });
    B.box(g, len, 0.04, 0.8, MAT.white, 0, 0.84, 0, { cast: false });
    const holes = 8;
    // folha curvada (pedaço de esfera achatado), base na origem, apontando para +Y
    const leafG = new T.SphereGeometry(0.1, 12, 8, -Math.PI * 0.45, Math.PI * 0.9, 0, Math.PI * 0.6);
    leafG.translate(0, -0.1, 0); leafG.rotateX(Math.PI); leafG.scale(1.25, 1.45, 0.8); leafG.translate(0, 0, 0.0);
    const leafMat = new T.MeshStandardMaterial({ color: 0x3fbf6f, roughness: 0.55, side: T.DoubleSide });
    const plants = new T.Group(); plants.position.y = 0.86; g.add(plants);
    const fruits = new T.Group(); fruits.position.y = 0.86; g.add(fruits);
    const fruitMat = new T.MeshStandardMaterial({ color: 0xe8462e, roughness: 0.4 });
    for (let i = 0; i < holes; i++) {
      const px = -len / 2 + 0.25 + (i % 4) * (len - 0.5) / 3, pz = i < 4 ? -0.18 : 0.18;
      const plant = new T.Group(); plant.position.set(px, 0, pz); plants.add(plant);
      // roseta: anel externo aberto e anel interno mais fechado
      for (let k = 0; k < 11; k++) {
        const outer = k < 7, n = outer ? 7 : 4, a = (outer ? k : k - 7) / n * Math.PI * 2 + (outer ? 0 : 0.5) + i * 0.7;
        const lf = new T.Mesh(leafG, leafMat);
        lf.rotation.order = 'YXZ'; lf.rotation.y = a; lf.rotation.x = outer ? 1.05 : 0.45;
        const sc = outer ? 1 : 0.8; lf.scale.setScalar(sc);
        lf.position.set(Math.sin(a) * 0.02, 0.02, Math.cos(a) * 0.02);
        lf.castShadow = true; plant.add(lf);
      }
      const stem = new T.Mesh(new T.CylinderGeometry(0.012, 0.015, 0.25, 5), leafMat); stem.position.y = 0.12; plant.add(stem);
      const fr = new T.Mesh(new T.SphereGeometry(0.045, 10, 8), fruitMat); fr.position.set(px + 0.05, 0.22, pz + 0.05); fruits.add(fr);
      const fr2 = fr.clone(); fr2.position.set(px - 0.05, 0.16, pz - 0.04); fruits.add(fr2);
    }
    const led = new T.Mesh(new T.BoxGeometry(len - 0.2, 0.04, 0.16), new T.MeshBasicMaterial({ toneMapped: false, color: 0xff5bd8 }));
    led.position.set(0, 1.75, 0); g.add(led);
    [-1, 1].forEach((s) => B.box(g, 0.04, 0.95, 0.04, MAT.metal, s * (len / 2 - 0.05), 1.3, 0));
    const tag = B.screen(g, 'BANDEJA', ['vazia'], len / 2 - 0.25, 0.55, 0.43, 0, '#5bd48a', 0.34);
    return { group: g, plants, fruits, leafMat, fruitMat, led, tag, water };
  };

  /* ---------- tripulantes (figuras simples com animação de respiração) ---------- */
  B.crew = (p, x, z, rotY, o = {}) => {
    const g = B.grp(p, x, z, rotY, o.y || 0);
    const suit = new T.MeshStandardMaterial({ color: o.suit || 0x2c4f9e, roughness: 0.8 });
    const skin = new T.MeshStandardMaterial({ color: o.skin || 0xc68a5e, roughness: 0.7 });
    const hair = new T.MeshStandardMaterial({ color: o.hair || 0x2a1c14, roughness: 0.9 });
    const body = new T.Group(); g.add(body);
    const sit = o.pose === 'sit', flo = o.pose === 'float';
    const hip = sit ? 0.5 : 0.92;
    // pernas
    [-0.1, 0.1].forEach((sx) => {
      if (sit) { const th = B.cyl(body, 0.075, 0.07, 0.45, suit, sx, hip, -0.18, 8); th.rotation.x = Math.PI / 2; const sh = B.cyl(body, 0.065, 0.06, 0.45, suit, sx, 0.25, -0.4, 8); B.box(body, 0.11, 0.07, 0.24, MAT.darker, sx, 0.04, -0.46); }
      else { const lg = B.cyl(body, 0.075, 0.06, 0.86, suit, sx, hip / 2 + 0.02, 0, 8); if (flo) lg.rotation.x = 0.4 * (sx > 0 ? 1 : 0.6); B.box(body, 0.11, 0.07, 0.24, MAT.darker, sx, 0.04, -0.04); }
    });
    const torso = B.cyl(body, 0.17, 0.15, 0.58, suit, 0, hip + 0.3, 0, 12);
    B.sph(body, 0.17, suit, 0, hip + 0.58, 0, 12).scale.set(1.15, 0.5, 0.9);
    const head = new T.Group(); head.position.set(0, hip + 0.82, 0); body.add(head);
    B.sph(head, 0.12, skin, 0, 0, 0, 16);
    const hr = B.sph(head, 0.125, hair, 0, 0.03, 0.02, 16); hr.scale.set(1, 0.8, 1);
    B.sph(head, 0.016, MAT.darker, -0.04, 0.01, -0.11, 6); B.sph(head, 0.016, MAT.darker, 0.04, 0.01, -0.11, 6);
    const arms = [];
    [-1, 1].forEach((s) => {
      const sh = new T.Group(); sh.position.set(s * 0.22, hip + 0.54, 0); body.add(sh);
      const up = B.cyl(sh, 0.055, 0.05, 0.32, suit, 0, -0.16, 0, 8);
      const fore = new T.Group(); fore.position.y = -0.32; sh.add(fore);
      B.cyl(fore, 0.05, 0.045, 0.3, suit, 0, -0.15, 0, 8); B.sph(fore, 0.05, skin, 0, -0.32, 0, 8);
      const work = o.pose === 'work' || sit;
      sh.rotation.x = work ? -0.9 : 0.05; fore.rotation.x = work ? -0.6 : 0; sh.rotation.z = s * (flo ? 0.5 : 0.08);
      arms.push(sh);
    });
    // patch no ombro e crachá
    if (o.patch) { const pt = new T.Mesh(new T.CircleGeometry(0.055, 16), new T.MeshBasicMaterial({ map: o.patch, transparent: true })); pt.position.set(-0.19, hip + 0.48, -0.05); pt.rotation.y = -Math.PI / 2 - 0.3; body.add(pt); const pt2 = pt.clone(); pt2.position.set(0.07, hip + 0.42, -0.165); pt2.rotation.y = Math.PI; body.add(pt2); }
    g.userData.crew = { body, head, arms, phase: Math.random() * 6, float: flo };
    return g;
  };
  B.animateCrew = (list, t) => list.forEach((g) => { const c = g.userData.crew; if (!c) return; const b = Math.sin(t * 1.4 + c.phase); c.body.scale.y = 1 + b * 0.006; c.head.rotation.y = Math.sin(t * 0.35 + c.phase) * 0.5; if (c.float) { c.body.position.y = Math.sin(t * 0.6 + c.phase) * 0.08; c.body.rotation.z = Math.sin(t * 0.25 + c.phase) * 0.15; } });

  /* ---------- objetos de segurança ---------- */
  B.extinguisher = (p, x, y, z, rotY = 0) => { const g = B.grp(p, x, z, rotY, y); B.cyl(g, 0.08, 0.08, 0.45, new T.MeshStandardMaterial({ color: 0xd0202a, roughness: 0.4, metalness: 0.2 }), 0, 0, 0, 12); B.cyl(g, 0.03, 0.04, 0.08, MAT.darker, 0, 0.26, 0, 8); B.box(g, 0.16, 0.04, 0.03, MAT.darker, 0.04, 0.3, 0); B.box(g, 0.2, 0.06, 0.04, MAT.metal, 0, -0.1, -0.09); return g; };
  B.firstAid = (p, x, y, z, rotY = 0) => { const g = B.grp(p, x, z, rotY, y); B.box(g, 0.45, 0.32, 0.14, MAT.white, 0, 0, 0); B.box(g, 0.2, 0.05, 0.01, new T.MeshBasicMaterial({ color: 0xd0202a }), 0, 0, 0.075, { cast: false }); B.box(g, 0.05, 0.2, 0.01, new T.MeshBasicMaterial({ color: 0xd0202a }), 0, 0, 0.075, { cast: false }); return g; };
  B.vent = (p, x, y, z, rotY = 0) => { const g = B.grp(p, x, z, rotY, y); B.box(g, 0.6, 0.3, 0.03, MAT.metal, 0, 0, 0, { cast: false }); for (let i = 0; i < 5; i++) B.box(g, 0.56, 0.02, 0.035, MAT.darker, 0, -0.11 + i * 0.055, 0.005, { cast: false }); return g; };
  B.cableTray = (p, x0, z0, x1, z1, y) => { const len = Math.hypot(x1 - x0, z1 - z0); const g = B.grp(p, (x0 + x1) / 2, (z0 + z1) / 2, -Math.atan2(z1 - z0, x1 - x0), y); B.box(g, len, 0.04, 0.22, MAT.metal, 0, 0, 0, { cast: false }); [[0x2c6fd6, -0.06], [0xffc94d, 0], [0x46d483, 0.06]].forEach(([c, zz]) => { const cb = B.cyl(g, 0.018, 0.018, len, new T.MeshStandardMaterial({ color: c, roughness: 0.6 }), 0, 0.03, zz, 6, { cast: false }); cb.rotation.z = Math.PI / 2; }); return g; };

  window.Engine3D = { Engine, B, MAT, TEX, labelTex, screenTex, canvasTex, imageTex, boxGeo, fbm, smooth, rand, isTouch };
})();

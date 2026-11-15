/* =========================================================================
   Missão Liastra · site (landing page)
   ========================================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nf = (v, dp = 0) => v.toLocaleString(LANG === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: dp, maximumFractionDigits: dp });

  /* ---------- Atraso e distância de Marte (calculados hoje) ---------- */
  const md = SpaceWeather.marsDistance();
  $$('[data-light-min]').forEach((el) => { el.textContent = nf(md.lightMin, 1); });
  const dist = $('#sw-dist'); if (dist) dist.textContent = nf(md.km / 1e6, 0);

  /* ---------- Planetas em canvas (textura procedural girando) ---------- */
  function hash(x, y, s) { const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); }
  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, s) { let t = 0, amp = 0.5, f = 1; for (let i = 0; i < 5; i++) { t += amp * vnoise(x * f, y * f, s); f *= 2; amp *= 0.5; } return t; }

  function makeTexture(kind, W = 512, H = 256) {
    const tex = new Uint8ClampedArray(W * H * 3);
    const seed = kind === 'mars' ? 3 : 11;
    const craters = Array.from({ length: kind === 'mars' ? 40 : 90 }, (_, i) => ({
      x: hash(i, 1, seed) * W, y: 20 + hash(i, 2, seed) * (H - 40), r: 2 + Math.pow(hash(i, 3, seed), 3) * (kind === 'mars' ? 16 : 22)
    }));
    for (let y = 0; y < H; y++) {
      const lat = (y / H - 0.5) * Math.PI;
      for (let x = 0; x < W; x++) {
        const nx = x / W * 8, ny = y / H * 4;
        // textura que se repete nas bordas (cilindro)
        const t = x / W;
        const n = fbm(nx, ny, seed) * (1 - t) + fbm(nx - 8, ny, seed) * t;
        const big = fbm(nx * 0.35 + 3, ny * 0.35, seed + 5) * (1 - t) + fbm((nx - 8) * 0.35 + 3, ny * 0.35, seed + 5) * t;
        let r, g, b;
        if (kind === 'mars') {
          const dark = big > 0.52 ? (big - 0.52) * 2.4 : 0;
          r = 196 + n * 60 - dark * 90; g = 92 + n * 40 - dark * 40; b = 52 + n * 22 - dark * 18;
          const cap = Math.abs(lat) > 1.25 ? Math.min(1, (Math.abs(lat) - 1.25) * 5 + (n - 0.5)) : 0;
          if (cap > 0) { r += (240 - r) * cap; g += (236 - g) * cap; b += (230 - b) * cap; }
        } else {
          const mare = big > 0.5 ? Math.min(1, (big - 0.5) * 3.2) : 0;
          const base = 168 + n * 50 - mare * 70;
          r = base; g = base; b = base + 4;
        }
        let shade = 0;
        for (const c of craters) {
          let dx = Math.abs(x - c.x); dx = Math.min(dx, W - dx);
          const d = Math.hypot(dx, y - c.y) / c.r;
          if (d < 1.25) shade += d < 0.85 ? -0.16 * (1 - d) : 0.18 * (1.25 - d);
        }
        const i = (y * W + x) * 3;
        tex[i] = r * (1 + shade); tex[i + 1] = g * (1 + shade); tex[i + 2] = b * (1 + shade);
      }
    }
    return { tex, W, H };
  }

  function planetRenderer(canvas, kind, opts = {}) {
    const ctx = canvas.getContext('2d');
    const S = canvas.width, R = S / 2 - 2;
    const T = makeTexture(kind);
    const img = ctx.createImageData(S, S);
    // tabela de projeção (fixa)
    const lut = [];
    const light = [-0.55, -0.35, 0.76];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const px = (x - S / 2) / R, py = (y - S / 2) / R;
      const rr = px * px + py * py;
      if (rr > 1) continue;
      const pz = Math.sqrt(1 - rr);
      const lat = Math.asin(py), lon = Math.atan2(px, pz);
      const l = Math.max(0, px * light[0] + py * light[1] + pz * light[2]);
      const shade = 0.12 + 0.95 * Math.pow(l, 0.85);
      const rim = Math.pow(1 - pz, 3) * (kind === 'mars' ? 0.5 : 0.15);
      const edge = rr > 0.985 ? (1 - rr) / 0.015 : 1;
      lut.push([(y * S + x) * 4, lon, (lat / Math.PI + 0.5) * (T.H - 1), shade, rim, edge]);
    }
    function draw(rot) {
      const d = img.data;
      for (const [o, lon, ty, sh, rim, edge] of lut) {
        let tx = ((lon / (2 * Math.PI) + 0.5 + rot) % 1) * T.W; if (tx < 0) tx += T.W;
        const i = ((ty | 0) * T.W + (tx | 0)) * 3;
        d[o] = T.tex[i] * sh + rim * 255;
        d[o + 1] = T.tex[i + 1] * sh + rim * (kind === 'mars' ? 140 : 200);
        d[o + 2] = T.tex[i + 2] * sh + rim * (kind === 'mars' ? 90 : 230);
        d[o + 3] = 255 * edge;
      }
      ctx.putImageData(img, 0, 0);
    }
    let rot = opts.start || 0.1;
    draw(rot);
    if (opts.spin && !reduced) {
      let last = performance.now(), visible = true;
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
      const loop = (now) => {
        const dt = Math.min(64, now - last); last = now;
        if (visible && !document.hidden) { rot += dt * 0.000012; draw(rot); }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  const big = $('#planet');
  if (big) {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const css = Math.min(640, Math.max(320, window.innerWidth * 0.9));
    big.width = big.height = Math.round(css * dpr * 0.75);
    planetRenderer(big, 'mars', { spin: true });
  }
  $$('canvas.mini-planet').forEach((c) => planetRenderer(c, c.dataset.planet, { start: c.dataset.planet === 'moon' ? 0.3 : 0.62 }));

  /* ---------- Demonstração do trade-off ---------- */
  const range = $('#to-range');
  if (range) {
    const cells = $('.to-cells');
    const update = () => {
      const shield = +range.value, green = 6 - shield;
      cells.innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="${i < green ? 'g' : 's'}"></i>`).join('');
      const food = green * 4 - 11;
      const dose = 16 * (1 - Math.min(0.6, shield * 0.3));
      $('[data-to="food"]').textContent = (food > 0 ? '+' : food < 0 ? '−' : '±') + Math.abs(food);
      $('[data-to="dose"]').textContent = nf(dose, 1) + ' mSv';
      let say;
      if (shield === 0) say = L('Estufa cheia, mas a tripulação recebe a tempestade inteira.', 'Full greenhouse, but the crew takes the whole storm.');
      else if (shield <= 2) say = L('Um meio-termo: um pouco de proteção, um pouco de comida.', 'A middle ground: some protection, some food.');
      else say = L('O escudo já está no máximo com 2 células. As células extras não protegem mais nada e a despensa vai esvaziando.', 'The shield is already maxed out at 2 cells. Extra cells protect nothing more, and the pantry keeps emptying.');
      $('[data-to="say"]').textContent = say;
      range.setAttribute('aria-valuetext', L(`${green} células na estufa, ${shield} no escudo`, `${green} cells in the greenhouse, ${shield} in the shield`));
    };
    range.addEventListener('input', update);
    update();
  }

  /* ---------- Painel de clima espacial ---------- */
  async function loadSW() {
    const status = $('#sw-status');
    const data = await SpaceWeather.load();
    const days = SpaceWeather.byDay(data.events);
    const fmt = (iso) => LANG === 'en' ? iso.slice(5, 7) + '/' + iso.slice(8, 10) : iso.slice(8, 10) + '/' + iso.slice(5, 7);
    status.innerHTML = data.live
      ? `<span class="live-dot"></span>${L('Ao vivo · NASA DONKI · atualizado em', 'Live · NASA DONKI · updated')} ${fmt(data.fetchedAt)}`
      : `${L('Arquivo real · NASA DONKI · baixado em', 'Real archive · NASA DONKI · downloaded')} ${fmt(data.fetchedAt)}/${data.fetchedAt.slice(0, 4)}`;
    status.classList.toggle('is-live', data.live);
    // preencher dias sem CME
    const filled = [];
    if (days.length) {
      const idx = new Map(days.map((d) => [d.day, d]));
      for (let t = Date.parse(days[0].day); t <= Date.parse(days[days.length - 1].day); t += 864e5) {
        const k = new Date(t).toISOString().slice(0, 10);
        filled.push(idx.get(k) || { day: k, max: 0, count: 0 });
      }
    }
    const top = Math.max(1200, ...filled.map((d) => d.max));
    const chart = $('#sw-chart');
    const yTicks = [0, 500, 800, 1200].filter((v) => v <= top);
    chart.innerHTML = `
      <div class="sw-y">${yTicks.map((v) => `<span style="bottom:${v / top * 100}%">${nf(v)}</span>`).join('')}</div>
      <div class="sw-bars">
        ${yTicks.slice(1).map((v) => `<i class="sw-grid" style="bottom:${v / top * 100}%"></i>`).join('')}
        ${filled.map((d) => {
          const risk = SpaceWeather.riskFromSpeed(d.max);
          return `<div class="sw-bar r-${risk}" title="${fmt(d.day)}: ${d.count} CME${d.count === 1 ? '' : 's'}${d.max ? `, ${L('máx.', 'max')} ${nf(d.max)} km/s` : ''}"><i style="height:${Math.max(1.5, d.max / top * 100)}%"></i></div>`;
        }).join('')}
      </div>
      <div class="sw-x"><span>${filled[0] ? fmt(filled[0].day) : ''}</span><span>${filled.length ? fmt(filled[filled.length - 1].day) : ''}</span></div>`;
    $('#sw-count').textContent = nf(data.events.length);
    $('#sw-max').textContent = nf(Math.max(0, ...filled.map((d) => d.max)));
  }
  loadSW();

  const kf = $('#key-form');
  if (kf) {
    const ki = $('#key-in'); ki.value = SpaceWeather.getKey();
    kf.addEventListener('submit', (e) => { e.preventDefault(); SpaceWeather.setKey(ki.value); loadSW(); });
  }

  /* ---------- Galeria de patches ---------- */
  const pg = $('#patch-grid');
  if (pg && window.MISSIONS) {
    const W = LANG === 'en' ? { mars: 'Mars', moon: 'Moon', orbit: 'Space Station' } : { mars: 'Marte', moon: 'Lua', orbit: 'Estação Espacial' };
    pg.innerHTML = MISSIONS.filter((m) => !m.survival).map((m) => `
      <button type="button" class="patch-card" data-mission-open="${m.id}">
        <img src="${patchURI(m)}" alt="${L('Patch da missão', 'Mission patch')} ${m.code}">
        <span class="pc-code">${m.code}</span><strong>${m.title}</strong>
        <small>${W[m.world]} · ${m.difficulty}</small>
        <span class="pc-real">${m.basis}</span>
      </button>`).join('');
    pg.addEventListener('click', (e) => { const b = e.target.closest('[data-mission-open]'); if (b) Game.open({ mission: b.dataset.missionOpen }); });
  }

  /* ---------- Abrir o jogo ---------- */
  $$('[data-play]').forEach((b) => b.addEventListener('click', () => {
    const site = b.dataset.play || undefined;
    Game.open({ site });
  }));
  const fromHash = () => { const m = location.hash.match(/^#(?:jogar|play)(?:=([\w-]+))?$/); if (m) Game.open(m[1] ? { mission: m[1] } : {}); };
  window.addEventListener('hashchange', fromHash);
  fromHash();

  /* ---------- Navegação: sombra ao rolar ---------- */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Entrada suave das seções (o conteúdo já é visível sem JS) ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    const els = $$('.tile, .step, .cmp-col, .sources article, .edu-grid article');
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => { if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('rise'); io.observe(el); } });
  }
})();

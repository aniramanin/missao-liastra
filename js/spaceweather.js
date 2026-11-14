/* =========================================================================
   Clima espacial real (NASA DONKI) + distância Terra–Marte calculada.
   - Tenta buscar ejeções de massa coronal (CME) dos últimos 30 dias ao vivo.
   - Se não der (sem internet, limite da chave DEMO, página sem rede),
     usa o arquivo real embutido em donki-archive.js e diz isso na tela.
   ========================================================================= */
(function () {
  const KEY_STORE = 'liastra.nasaKey';
  const safeGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const safeSet = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} };

  const fmt = (d) => d.toISOString().slice(0, 10);

  function fromArchive() {
    const a = window.DONKI_ARCHIVE;
    return {
      live: false,
      fetchedAt: a.fetchedAt,
      events: a.cme.map(([t, v, type]) => ({ time: t, speed: v, type }))
    };
  }

  async function fetchLive(timeoutMs = 7000) {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 864e5); // DONKI aceita no máximo 60 dias
    const key = safeGet(KEY_STORE) || 'DEMO_KEY';
    const url = `https://api.nasa.gov/DONKI/CME?startDate=${fmt(start)}&endDate=${fmt(end)}&api_key=${encodeURIComponent(key)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      if (!Array.isArray(data) || !data.length) throw new Error('vazio');
      const events = data.map((x) => {
        const an = (x.cmeAnalyses || []);
        const best = an.find((c) => c.isMostAccurate) || an[0] || {};
        return { time: x.startTime, speed: best.speed ? Math.round(best.speed) : null, type: best.type || null };
      });
      return { live: true, fetchedAt: fmt(end), events };
    } finally {
      clearTimeout(timer);
    }
  }

  let cache = null;
  async function load() {
    if (cache) return cache;
    try { cache = await fetchLive(); }
    catch (e) { cache = fromArchive(); cache.error = String(e && e.message || e); }
    return cache;
  }

  /* Agrupa por dia: velocidade máxima e quantidade de CMEs */
  function byDay(events) {
    const map = new Map();
    for (const ev of events) {
      const day = ev.time.slice(0, 10);
      const cur = map.get(day) || { day, max: 0, count: 0 };
      cur.count++;
      if (ev.speed && ev.speed > cur.max) cur.max = ev.speed;
      map.set(day, cur);
    }
    return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
  }

  /* Nível de risco usado no jogo. Simplificação didática:
     CMEs mais rápidas têm mais chance de gerar tempestades de partículas. */
  function riskFromSpeed(v) {
    if (v >= 800) return 'alto';
    if (v >= 500) return 'medio';
    return 'baixo';
  }

  /* Monta a sequência de dias reais que o jogo vai "reviver".
     Escolhe uma janela aleatória dentro dos dados disponíveis. */
  function missionWindow(data, sols, rng = Math.random) {
    const days = byDay(data.events);
    if (!days.length) return [];
    // preenche dias sem CME
    const filled = [];
    const first = new Date(days[0].day + 'T00:00Z');
    const last = new Date(days[days.length - 1].day + 'T00:00Z');
    const idx = new Map(days.map((d) => [d.day, d]));
    for (let t = first.getTime(); t <= last.getTime(); t += 864e5) {
      const day = fmt(new Date(t));
      filled.push(idx.get(day) || { day, max: 0, count: 0 });
    }
    const maxStart = Math.max(0, filled.length - sols);
    const start = Math.floor(rng() * (maxStart + 1));
    return filled.slice(start, start + sols).map((d) => ({ ...d, risk: riskFromSpeed(d.max) }));
  }

  /* ---------- Distância Terra–Marte (elementos orbitais J2000, JPL/Standish) ---------- */
  const EL = {
    earth: { a: [1.00000261, 0.00000562], e: [0.01671123, -0.00004392], I: [-0.00001531, -0.01294668], L: [100.46457166, 35999.37244981], w: [102.93768193, 0.32327364], O: [0, 0] },
    mars:  { a: [1.52371034, 0.00001847], e: [0.09339410, 0.00007882],  I: [1.84969142, -0.00813131],  L: [-4.55343205, 19140.30268499], w: [-23.94362959, 0.44441088], O: [49.55953891, -0.29257343] }
  };
  const rad = Math.PI / 180;
  function helio(p, T) {
    const g = (k) => p[k][0] + p[k][1] * T;
    const a = g('a'), e = g('e'), I = g('I') * rad, L = g('L'), w = g('w'), O = g('O');
    let M = ((L - w) % 360 + 540) % 360 - 180; M *= rad;
    let E = M + e * Math.sin(M);
    for (let i = 0; i < 8; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const om = (w - O) * rad, Om = O * rad;
    const x = (Math.cos(om) * Math.cos(Om) - Math.sin(om) * Math.sin(Om) * Math.cos(I)) * xp + (-Math.sin(om) * Math.cos(Om) - Math.cos(om) * Math.sin(Om) * Math.cos(I)) * yp;
    const y = (Math.cos(om) * Math.sin(Om) + Math.sin(om) * Math.cos(Om) * Math.cos(I)) * xp + (-Math.sin(om) * Math.sin(Om) + Math.cos(om) * Math.cos(Om) * Math.cos(I)) * yp;
    const z = (Math.sin(om) * Math.sin(I)) * xp + (Math.cos(om) * Math.sin(I)) * yp;
    return [x, y, z];
  }
  function marsDistance(date = new Date()) {
    const jd = date.getTime() / 864e5 + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    const E = helio(EL.earth, T), M = helio(EL.mars, T);
    const au = Math.hypot(M[0] - E[0], M[1] - E[1], M[2] - E[2]);
    const km = au * 149597870.7;
    const lightMin = (km / 299792.458) / 60;
    return { au, km, lightMin };
  }

  window.SpaceWeather = {
    load, byDay, riskFromSpeed, missionWindow, marsDistance,
    getKey: () => safeGet(KEY_STORE) || '',
    setKey: (k) => { safeSet(KEY_STORE, (k || '').trim()); cache = null; },
    MOON_LIGHT_SEC: 1.28
  };
})();

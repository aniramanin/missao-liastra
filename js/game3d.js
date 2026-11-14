/* =========================================================================
   Missão Liastra · jogo 3D
   Central de missões → chamada da missão → tutorial → missão com checklist.
   Energia, ar, comida, radiação, traje e plantas correm em tempo real.
   Todos os textos visíveis usam L(pt, en).
   ========================================================================= */
(function () {
  const T = THREE;
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const EN = () => window.LANG === 'en';
  const num = (v, dp = 1) => v.toLocaleString(EN() ? 'en-US' : 'pt-BR', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const fmtDate = (iso) => { const [y, m, d] = iso.split('-'); return EN() ? `${m}/${d}/${y}` : `${d}/${m}/${y}`; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const isTouch = () => Engine3D.isTouch();

  const I = {
    air: '<svg viewBox="0 0 24 24"><path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    leaf: '<svg viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15M5 19l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    flask: '<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    rad: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 12L8 5a8 8 0 0 1 8 0zM12 12h8a8 8 0 0 1-4 7zM12 12l-4 7a8 8 0 0 1-4-7z" fill="currentColor" opacity=".85"/></svg>',
    antenna: '<svg viewBox="0 0 24 24"><path d="M5 19l7-7M4 10a8 8 0 0 0 10 10M14 4a6 6 0 0 1 6 6M14 8a2 2 0 0 1 2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    suit: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 21v-4a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    tablet: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    hand: '<svg viewBox="0 0 24 24"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.6-2.2L3 15.5a1.5 1.5 0 0 1 2.3-1.9L8 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M12 3l6 9h-4v9h-4v-9H6z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    sprout: '<svg viewBox="0 0 24 24"><path d="M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 12c0-3 2.5-5 6-5 0 3.5-2.5 5-6 5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  let soundOn = store.get('liastra.sound', true), actx = null;
  function beep(type = 'ok') {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { ok: [660, 880], bad: [330, 220], tap: [520], win: [523, 659, 784, 1046], alarm: [880, 660, 880, 660], done: [700, 1050], step: [587, 880, 1175] }[type] || [600];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type === 'alarm' ? 'square' : 'sine'; o.frequency.value = f;
        const t = actx.currentTime + i * 0.1;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.2);
      });
    } catch (e) {}
  }
  const rich = (t) => t.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_, l, k) => `<button type="button" class="term" data-term="${k}">${l}</button>`);
  const plain = (t) => t.replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1');

  const LV = {
    cadete: { id: 'cadete', name: L('Cadete', 'Cadet'), ages: L('7 a 9 anos', 'ages 7–9'), sols: 3, drain: 0.75, doseLimit: 50, sciGoal: 80, SOL: 210 },
    comandante: { id: 'comandante', name: L('Comandante', 'Commander'), ages: L('10 a 12 anos', 'ages 10–12'), sols: 4, drain: 1.0, doseLimit: 50, sciGoal: 120, SOL: 200 },
    diretor: { id: 'diretor', name: L('Diretor de Voo', 'Flight Director'), ages: L('adolescentes e adultos', 'teens and adults'), sols: 6, drain: 1.12, doseLimit: 50, sciGoal: 190, SOL: 190 }
  };
  const MAX = { life: 5, food: 5, shield: 2, sci: 4 };
  const STORM_WARN = 25, STORM_LEN = 30, SUIT_TIME = 150;
  const WORLD_NAME = { mars: L('Marte', 'Mars'), moon: L('Lua', 'Moon'), orbit: L('Estação Espacial', 'Space Station') };

  /* ---------- o que cada máquina faz ---------- */
  const KINDS = {
    sink: { fx: { l: -1 }, msg: L('Rosto lavado e dentes escovados. Gastou cerca de 1 litro, que volta para o reciclador.', 'Face washed and teeth brushed. About 1 liter used, and it goes back to the recycler.'), fact: L('Escovar os dentes no espaço usa só um copinho de água. Na Estação, muitos astronautas engolem a pasta.', 'Brushing teeth in space takes just a small cup of water. On the Station, many astronauts swallow the toothpaste.') },
    toilet: { fx: { l: 1 }, cd: 40, msg: L('Banheiro usado. A urina vai para o reciclador e vira água limpa de novo.', 'Toilet used. Urine goes to the recycler and becomes clean water again.'), fact: L('Na Estação Espacial, o sistema de reciclagem recupera cerca de 98% da água, incluindo urina e suor.', 'On the Space Station, the recycling system recovers about 98% of the water, including urine and sweat.') },
    shower: { fx: { l: -3 }, once: 'showered', msg: L('Banho de 2 minutos: cerca de 4 litros. A água usada vai para o reciclador.', 'A 2-minute shower: about 4 liters. The used water goes to the recycler.') },
    hygiene: { fx: { l: -0.5 }, msg: L('Higiene feita com toalha úmida e xampu sem enxágue. Na microgravidade, a água flutuaria em bolhas.', 'Hygiene done with a wet towel and no-rinse shampoo. In microgravity, water would float around in bubbles.') },
    galley: { fx: { f: -2 }, cd: 30, msg: L('Refeição pronta: comida desidratada + água quente. Bom apetite!', 'Meal ready: dehydrated food plus hot water. Enjoy!') },
    table: { fx: { f: -1 }, cd: 30, msg: L('A tripulação comeu junta. Comer em grupo ajuda a manter o ânimo em missões longas.', 'The crew ate together. Sharing meals keeps spirits up on long missions.') },
    pantry: { info: () => L(`Despensa: comida em ${Math.round(S.food)}%. A estufa recebe ${S.alloc.food} célula(s) de energia por ${solWord()}.`, `Pantry: food at ${Math.round(S.food)}%. The greenhouse gets ${S.alloc.food} energy cell(s) per ${solWord()}.`) },
    treadmill: { fx: { f: -2 }, flag: 'exercised', msg: L('Treino na esteira feito! Ossos e músculos agradecem. −2 comida (calorias).', 'Treadmill workout done! Your bones and muscles thank you. −2 food (calories).'), fact: L('Astronautas se exercitam cerca de 2 horas por dia. Sem isso, perderiam de 1% a 1,5% dos ossos por mês.', 'Astronauts exercise about 2 hours a day. Without it, they could lose 1% to 1.5% of their bone mass every month.') },
    bike: { fx: { f: -2 }, flag: 'exercised', msg: L('Pedalada feita: coração em forma.', 'Bike ride done: heart in shape.') },
    ared: { fx: { f: -2 }, flag: 'exercised', msg: L('Musculação feita. O aparelho usa cilindros de vácuo para simular pesos.', 'Strength training done. The machine uses vacuum cylinders to simulate weights.') },
    o2gen: { fx: { e: -1, l: 8 }, cd: 50, msg: L('Gerador de oxigênio ligado por um ciclo: +8 ar e água, −1 célula de bateria.', 'Oxygen generator ran one cycle: +8 air and water, −1 battery cell.'), fact: L('A eletrólise quebra água (H₂O) em hidrogênio e oxigênio. Precisa de muita eletricidade: por isso energia e ar estão ligados.', 'Electrolysis splits water (H₂O) into hydrogen and oxygen. It needs a lot of electricity, which is why energy and air are connected.') },
    co2: { fx: { l: 4 }, once: 'co2done', msg: L('Filtro de CO₂ trocado. O ar está mais limpo.', 'CO₂ filter replaced. The air is cleaner.') },
    water: { fx: { e: -0.5, l: 6 }, cd: 50, flag: 'watered', msg: L('Água reciclada: +6 ar e água.', 'Water recycled: +6 air and water.') },
    experiment: { fx: { e: -0.5, s: 8 }, cd: 40, needBattery: 0.5, msg: L('Experimento concluído! +8 ciência (meia célula de energia).', 'Experiment complete! +8 science (half an energy cell).') },
    printer: { fx: { e: -0.5, s: 3 }, cd: 60, msg: L('Peça de reposição impressa em 3D. Em Marte, imprimir peças evita esperar meses por uma nave.', 'Spare part 3D-printed. On Mars, printing parts saves waiting months for a ship.'), fact: L('A Estação Espacial tem impressora 3D desde 2014. Astronautas já imprimiram ferramentas e peças a bordo.', 'The Space Station has had a 3D printer since 2014. Astronauts have printed tools and parts on board.') },
    med: { fx: { s: 4 }, once: 'medDone', msg: L('Check-up feito: pressão, coração e ultrassom normais. Os dados foram para os médicos na Terra.', 'Check-up done: blood pressure, heart and ultrasound normal. The data went to doctors on Earth.') },
    window: { msg: L('Pela janela do Zvezda dá para ver a Terra passando a 28 mil km/h.', 'Through the Zvezda window you can see Earth rushing by at 28,000 km/h.') },
    weather: { fx: { s: 3 }, once: 'weatherDone', msg: L('Estação meteorológica: −63 °C, vento de 18 km/h, pressão de 0,6% da Terra.', 'Weather station: −63 °C, wind 18 km/h, pressure 0.6% of Earth’s.'), fact: L('A pressão do ar em Marte é menos de 1% da pressão na Terra. Sem traje, a água do corpo ferveria.', 'Air pressure on Mars is less than 1% of Earth’s. Without a suit, the water in your body would boil.') },
    antenna: { once: 'antenna', msg: L('Antena calibrada! Os dados vão para a Terra 30% mais rápido hoje.', 'Antenna calibrated! Data goes to Earth 30% faster today.') },
    drill: { fx: { e: -1, l: 12 }, once: 'drilled', needBattery: 1, msg: L('Gelo perfurado, derretido e purificado: +12 ar e água.', 'Ice drilled, melted and purified: +12 air and water.') },
    earthphoto: { fx: { s: 6 }, once: 'photoE', msg: L('Foto da Terra no horizonte lunar! Ela está a 384 mil km.', 'Photo of Earth on the lunar horizon! It is 384,000 km away.') },
    reactor: { once: 'reactorOn', msg: L('Reator de fissão ligado! Agora a base tem energia mesmo no escuro.', 'Fission reactor on! The base now has power even in the dark.') },
    battery: { info: () => L(`Baterias: ${num(S.battery)} de ${S.cap} células. ${S.reactorOn ? 'O reator está carregando.' : 'Sem reator, só os painéis recarregam.'}`, `Batteries: ${num(S.battery)} of ${S.cap} cells. ${S.reactorOn ? 'The reactor is charging them.' : 'Without the reactor, only the panels recharge them.'}`) },
    powerpanel: { msg: L('Sistemas não essenciais desligados. A ciência foi pausada para poupar energia.', 'Non-essential systems switched off. Science is paused to save energy.'), run: () => { S.alloc.sci = 0; } },
    freezer: { msg: L('Amostras guardadas a −80 °C para não estragarem.', 'Samples stored at −80 °C so they don’t spoil.'), run: () => { if (S.samples > 0) applyFx({ s: 4 }); } },
    shelter: { info: () => L('Abrigo de radiação: as paredes de água bloqueiam partículas do Sol. Venha para cá quando houver tempestade solar.', 'Radiation shelter: the water walls block particles from the Sun. Come here during a solar storm.') },
    airlock: { info: () => (S.suited ? L('Porta liberada: traje pressurizado.', 'Door unlocked: suit pressurized.') : L('Porta trancada. Vista o traje para sair.', 'Door locked. Put on your suit to go outside.')) }
  };

  /* falas da tripulação */
  const CREW = {
    crew0: { name: 'Ana', role: L('comandante', 'commander'), lines: [L('Sempre confira o plano de energia antes de sair. Sem bateria, nada funciona.', 'Always check the energy plan before heading out. Without battery, nothing works.'), L('Missões reais têm cronograma minuto a minuto. Aqui é parecido!', 'Real missions have minute-by-minute schedules. It’s similar here!')] },
    crew1: { name: 'Rafael', role: L('engenheiro', 'engineer'), lines: [L('O gerador de oxigênio usa eletricidade para quebrar a água. Energia vira ar.', 'The oxygen generator uses electricity to split water. Energy becomes air.'), L('Se faltar uma peça, a impressora 3D do laboratório ajuda.', 'If a part is missing, the lab’s 3D printer can help.')] },
    crew2: { name: 'Yuki', role: L('cientista do ICBS', 'ICBS scientist'), lines: [L('Plantas precisam de luz, água e tempo. Colha no ponto certo, ou a colheita estraga!', 'Plants need light, water and time. Harvest at the right moment or the crop spoils!'), L('Amostras de outros mundos vão para a glovebox para não serem contaminadas.', 'Samples from other worlds go into the glovebox so they don’t get contaminated.')] },
    crew3: { name: 'Kwame', role: L('médico', 'doctor'), lines: [L('Com pouca gravidade, ossos enfraquecem. Treine todos os dias!', 'In low gravity, bones get weaker. Train every day!'), L('Fora da base a radiação é bem maior. Não fique lá fora mais do que o necessário.', 'Radiation is much higher outside the base. Don’t stay out longer than you need.')] }
  };

  let eng = null, world = null, S = null, M = null, SW = null, root = null, ui = {};
  let beacons = [];
  const solWord = () => (S && S.site.solName) || 'sol';

  /* =======================================================================
     Interface
     ======================================================================= */
  function buildDOM() {
    root.innerHTML = `
      <div class="g3d">
        <div class="g3d-canvas"></div>
        <div class="vignette" aria-hidden="true"></div>
        <div class="hud3d" hidden>
          <div class="hud-res"></div><div class="hud-clock"></div><div class="hud-obj"></div>
          <canvas class="minimap" width="360" height="360" aria-label="${L('Minimapa', 'Minimap')}"></canvas>
          <div class="roomtag"></div><div class="carry" hidden></div>
        </div>
        <div class="crosshair" hidden></div>
        <div class="prompt" hidden></div>
        <div class="toasts" aria-live="polite"></div>
        <div class="suitbar" hidden></div>
        <div class="lookhint" hidden>${L('Clique na tela para olhar ao redor · WASD para andar · E para interagir · Tab abre o tablet', 'Click the screen to look around · WASD to move · E to interact · Tab opens the tablet')}</div>
        <div class="touchui" hidden>
          <div class="joy"><i></i></div>
          <button class="tb tb-act" data-tb="act" aria-label="${L('Interagir', 'Interact')}">${I.hand}</button>
          <button class="tb tb-up" data-tb="up" aria-label="${L('Pular ou subir', 'Jump or go up')}">${I.up}</button>
          <button class="tb tb-down" data-tb="down" aria-label="${L('Descer', 'Go down')}" hidden>${I.down}</button>
        </div>
        <div class="g3d-btns" hidden>
          <button class="icon-btn" data-act="tablet" aria-label="${L('Tablet da missão', 'Mission tablet')}">${I.tablet}</button>
          <button class="icon-btn" data-act="pause" aria-label="Menu">${I.menu}</button>
        </div>
        <div class="modal" hidden><div class="modal-card"></div></div>
        <div class="fade" hidden></div>
      </div>`;
    ui = {
      canvasBox: $('.g3d-canvas', root), hud: $('.hud3d', root), res: $('.hud-res', root), clock: $('.hud-clock', root), obj: $('.hud-obj', root),
      mini: $('.minimap', root), roomtag: $('.roomtag', root), carry: $('.carry', root),
      cross: $('.crosshair', root), prompt: $('.prompt', root), toasts: $('.toasts', root), suit: $('.suitbar', root), hint: $('.lookhint', root),
      touch: $('.touchui', root), joy: $('.joy', root), btns: $('.g3d-btns', root), modal: $('.modal', root), card: $('.modal-card', root),
      vignette: $('.vignette', root), fade: $('.fade', root), down: $('[data-tb="down"]', root)
    };
  }
  function toast(html, kind = '', ms = 5200) {
    const el = document.createElement('div'); el.className = 'toast ' + kind; el.innerHTML = html;
    ui.toasts.appendChild(el);
    while (ui.toasts.children.length > 3) ui.toasts.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, ms);
  }
  const factToast = (t) => toast(`<b>${L('Ciência de verdade:', 'Real science:')}</b> ${t}`, 'fact', 10000);
  function openModal(html, cls = '') {
    ui.card.innerHTML = html; ui.card.className = 'modal-card ' + cls;
    ui.modal.hidden = false;
    if (eng) { eng.paused = true; eng.unlock(); }
    if (S) S.paused = true;
    ui.card.scrollTop = 0;
  }
  function relock() { if (!eng || isTouch() || eng.noLock || eng.locked) return; try { const p = eng.canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
  function closeModal() {
    ui.modal.hidden = true;
    if (eng) eng.paused = false;
    if (S) S.paused = false;
    if (eng && S && !isTouch() && !eng.noLock && !eng.locked) ui.hint.hidden = false;
  }
  const showHUD = (on) => { ui.hud.hidden = !on; ui.cross.hidden = !on; ui.btns.hidden = !on; ui.touch.hidden = !on || !isTouch(); if (!on) { ui.prompt.hidden = true; ui.suit.hidden = true; ui.hint.hidden = true; } };

  /* =======================================================================
     Central de missões
     ======================================================================= */
  function missionCenter(pre = {}) {
    showHUD(false);
    const level = root.dataset.selLevel || 'comandante';
    const done = store.get('liastra.patches', {});
    const only = pre.site;
    const status = SW ? (SW.live ? `<span class="live-dot"></span>${L('Clima espacial ao vivo · NASA DONKI', 'Live space weather · NASA DONKI')}` : L(`Clima espacial real arquivado · NASA DONKI, ${fmtDate(SW.fetchedAt)}`, `Archived real space weather · NASA DONKI, ${fmtDate(SW.fetchedAt)}`)) : L('Carregando clima espacial…', 'Loading space weather…');
    const earned = Object.keys(done).filter((k) => MISSIONS.some((m) => m.id === k)).length;
    openModal(`
      <div class="mc">
        <div class="mc-head">
          <div class="mc-brand"><img src="${ASSETS.shield}" alt=""><div><strong>${L('Central de Missões', 'Mission Center')}</strong><small>LIASTRA · Aerospace Innovation Center</small></div></div>
          <div class="mc-actions"><button class="btn-ghost sm" data-act="tutorial">${L('Como jogar', 'How to play')}</button><button class="icon-btn" data-act="close" aria-label="${L('Fechar o jogo', 'Close the game')}">${I.close}</button></div>
        </div>
        <div class="mc-intro">
          <p class="eyebrow">${L('Programa de treinamento de astronautas júnior', 'Junior astronaut training program')}</p>
          <h2>${L('Escolha sua missão', 'Choose your mission')}</h2>
          <p class="lead">${L(`Cada missão reproduz uma missão ou rotina real. Complete o checklist para ganhar o patch da missão, como os astronautas de verdade. Patches conquistados: <b>${earned} de ${MISSIONS.length}</b>.`, `Each mission recreates a real mission or routine. Complete the checklist to earn the mission patch, just like real astronauts. Patches earned: <b>${earned} of ${MISSIONS.length}</b>.`)}</p>
        </div>
        ${['mars', 'moon', 'orbit'].map((w) => `
          <section class="mc-world" ${only === w ? 'data-focus="1"' : ''}>
            <h3><span class="planet planet-${w}"></span>${WORLD_NAME[w]}</h3>
            <div class="mc-grid">
              ${MISSIONS.filter((m) => m.world === w).map((m) => `
                <button type="button" class="mcard${done[m.id] ? ' done' : ''}" data-mission="${m.id}">
                  <img class="mcard-patch" src="${patchURI(m)}" alt="${L('Patch da missão', 'Mission patch')} ${m.code}">
                  <span class="mcard-body">
                    <span class="mcard-code">${m.code}${done[m.id] ? ` <i class="mcard-ok">${I.check} ${L('patch conquistado', 'patch earned')}</i>` : ''}</span>
                    <strong>${m.title}</strong>
                    <small>${m.difficulty} · ${m.minutes}${m.steps.length ? ` · ${m.steps.length} ${L('tarefas', 'tasks')}` : ''}</small>
                  </span>
                </button>`).join('')}
            </div>
          </section>`).join('')}
        <div class="mc-foot">
          <div class="level-pick sm" role="radiogroup" aria-label="${L('Nível', 'Level')}">${Object.values(LV).map((l) => `<button type="button" class="lvl${level === l.id ? ' is-on' : ''}" role="radio" aria-checked="${level === l.id}" data-pick-level="${l.id}"><strong>${l.name}</strong><small>${l.ages}</small></button>`).join('')}</div>
          <p class="data-status">${status}</p>
        </div>
      </div>`, 'wide xl');
    root.dataset.selLevel = level;
    const f = ui.card.querySelector('[data-focus]'); if (f) setTimeout(() => f.scrollIntoView({ block: 'start' }), 50);
  }

  function missionCall(id) {
    const m = MISSIONS.find((x) => x.id === id); if (!m) return;
    beep('ok');
    const base = m.world === 'orbit' ? WORLD_NAME.orbit : L('Base AIC ', 'AIC Base ') + (m.world === 'mars' ? 'Jezero' : 'Shackleton');
    openModal(`
      <div class="call">
        <div class="call-patch"><img src="${patchURI(m)}" alt="${L('Patch da missão', 'Mission patch')} ${m.code}"></div>
        <div class="call-body">
          <p class="eyebrow">${L('Chamada para a missão', 'Mission call')} · ${WORLD_NAME[m.world]}</p>
          <h2>${m.code}<span>${m.title}</span></h2>
          <div class="call-real"><b>${L('Baseada em fatos reais', 'Based on real events')}</b><p>${m.basis}</p></div>
          <p class="lead">${m.briefing}</p>
          ${m.steps.length ? `<h3>${L('Objetivos', 'Objectives')}</h3><ol class="call-steps">${m.steps.map((s) => `<li>${s.t}</li>`).join('')}</ol>` : `<h3>${L('Como funciona', 'How it works')}</h3><ul class="call-steps"><li>${L('Divida a energia no console do Comando.', 'Split the energy at the Command console.')}</li><li>${L('Responda a emergências que aparecem no caminho.', 'Respond to emergencies along the way.')}</li><li>${L('Corra para o abrigo quando o Sol real mandar uma tempestade.', 'Run to the shelter when the real Sun sends a storm.')}</li><li>${L('Sobreviva até o fim e faça ciência.', 'Survive to the end and do science.')}</li></ul>`}
          <div class="call-meta"><span>${m.difficulty}</span><span>${m.minutes}</span><span>${L('Base', 'Base')}: ${base}</span></div>
          <div class="end-actions"><button class="btn-primary" data-act="accept" data-id="${m.id}">${L('Aceitar a missão', 'Accept the mission')}</button><button class="btn-ghost" data-act="center">${L('Voltar', 'Back')}</button></div>
        </div>
      </div>`, 'wide');
  }

  const TUT = [
    { t: L('Bem-vindo, astronauta!', 'Welcome, astronaut!'), b: L('Você vai viver missões de verdade em uma base em Marte, na Lua ou na Estação Espacial. Tudo acontece em 3D: você anda pelos módulos, mexe nas máquinas, cultiva plantas e sai de traje espacial.', 'You will live real missions at a base on Mars, on the Moon or on the Space Station. Everything happens in 3D: you walk through modules, operate machines, grow plants and go outside in a spacesuit.'), img: true },
    { t: L('Como se mover', 'How to move'), b: isTouch() ? L('Arraste o lado esquerdo da tela para andar e o lado direito para olhar. O botão azul com a mão serve para interagir. Na estação, use as setas para subir e descer flutuando.', 'Drag the left side of the screen to move and the right side to look. The blue hand button is for interacting. On the station, use the arrows to float up and down.') : L('<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> para andar, o mouse para olhar (clique na tela primeiro), <kbd>Shift</kbd> para correr e <kbd>Espaço</kbd> para pular. Na estação você flutua: <kbd>Espaço</kbd> sobe e <kbd>C</kbd> desce.', '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to move, the mouse to look (click the screen first), <kbd>Shift</kbd> to run and <kbd>Space</kbd> to jump. On the station you float: <kbd>Space</kbd> goes up and <kbd>C</kbd> goes down.') },
    { t: L('Interagir com tudo', 'Interact with everything'), b: L('Chegue perto de uma máquina, de uma bandeja de plantas ou de um tripulante, olhe para ele e aperte <kbd>E</kbd> (ou o botão da mão). Algumas tarefas pedem para <b>segurar</b> o botão até a barra encher.', 'Walk up to a machine, a plant tray or a crew member, look at it and press <kbd>E</kbd> (or the hand button). Some tasks ask you to <b>hold</b> the button until the bar fills.') },
    { t: L('Siga o checklist', 'Follow the checklist'), b: L('No canto superior direito fica o checklist da missão. O <b>marcador azul</b> mostra onde ir e a seta indica a direção. O minimapa ajuda a se localizar. Aperte <kbd>Tab</kbd> (ou o botão do tablet) para ver o plano completo e o mapa grande.', 'The mission checklist sits in the top-right corner. The <b>blue marker</b> shows where to go and the arrow points the way. The minimap helps you find your way. Press <kbd>Tab</kbd> (or the tablet button) to see the full plan and the big map.') },
    { t: L('Mantenha a base viva', 'Keep the base alive'), b: L('No canto superior esquerdo: <b>bateria</b>, <b>ar e água</b>, <b>comida</b>, <b>radiação</b> e <b>ciência</b>. Eles mudam em tempo real. No console de energia você decide para onde vai cada célula. Fora da base, o traje gasta oxigênio e a radiação triplica.', 'Top-left corner: <b>battery</b>, <b>air and water</b>, <b>food</b>, <b>radiation</b> and <b>science</b>. They change in real time. At the energy console you decide where each cell goes. Outside the base, the suit uses oxygen and radiation triples.') }
  ];
  function tutorial(i = 0, then) {
    const s = TUT[i];
    openModal(`
      <div class="tut">
        <div class="tut-dots">${TUT.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
        ${s.img ? `<img class="tut-logo" src="${ASSETS.shield}" alt="">` : ''}
        <h2>${s.t}</h2><p class="lead">${s.b}</p>
        ${i === 4 ? `<div class="tut-res">${[['bolt', L('Bateria', 'Battery'), '#ffd166'], ['air', L('Ar e água', 'Air & water'), '#4cc3ff'], ['leaf', L('Comida', 'Food'), '#5bd48a'], ['rad', L('Radiação', 'Radiation'), '#ff9f43'], ['flask', L('Ciência', 'Science'), '#b392ff']].map(([ic, l, c]) => `<span style="--c:${c}">${I[ic]}${l}</span>`).join('')}</div>` : ''}
        <div class="end-actions">
          <button class="btn-primary" data-act="tut-next" data-i="${i}">${i < TUT.length - 1 ? L('Próximo', 'Next') : (then ? L('Começar a missão', 'Start the mission') : L('Entendi', 'Got it'))}</button>
          ${i > 0 ? `<button class="btn-ghost" data-act="tut-prev" data-i="${i}">${L('Voltar', 'Back')}</button>` : `<button class="btn-ghost" data-act="tut-skip">${L('Pular', 'Skip')}</button>`}
        </div>
      </div>`);
    ui.card.dataset.then = then || '';
  }

  /* =======================================================================
     Nova missão
     ======================================================================= */
  function newMission(id) {
    M = MISSIONS.find((x) => x.id === id);
    const site = SITES[M.world], lvl = LV[root.dataset.selLevel || 'comandante'];
    ui.fade.hidden = false;
    world = M.world === 'orbit' ? Worlds3D.buildOrbit(eng, M) : Worlds3D.buildGround(eng, site, M);
    const sp = world.spawns[M.start.at] || world.spawn;
    eng.player.pos.set(sp.x, sp.y, sp.z); eng.player.vel.set(0, 0, 0); eng.player.vy = 0;
    eng.yaw = sp.yaw; eng.pitch = 0; eng.mode = M.world === 'orbit' ? 'float' : 'walk';
    ui.down.hidden = M.world !== 'orbit';
    beacons = [];
    const survival = !!M.survival;
    const days = SpaceWeather.missionWindow(SW, survival ? lvl.sols : 2);
    let storms = [];
    if (survival) {
      const pStorm = { baixo: 0.05, medio: 0.3, alto: 0.65 };
      days.forEach((d, i) => { if (i >= 1 && Math.random() < pStorm[d.risk]) storms.push(i + 1); });
      if (!storms.length && days.length > 1) storms.push(2);
      storms = storms.slice(0, 2);
    }
    days.forEach((d) => { d.shown = d.risk; });
    const delayMin = M.world === 'mars' ? SpaceWeather.marsDistance().lightMin : M.world === 'moon' ? SpaceWeather.MOON_LIGHT_SEC / 60 : 0.25 / 60;
    S = {
      site, lvl, survival, SOL: survival ? lvl.SOL : 900, sol: 1, t: 0, tAbs: 0, t0: M.start.time01 || 0.26,
      battery: 7, cap: 10, life: 82, food: 75, dose: 0, sci: 0, suit: 100,
      alloc: { life: 3, food: 2, shield: 0, sci: 2 }, eff: 1, days, storms, shadow: [], delayMin,
      dust: 0, dustUntil: 0, penalty: 1, cleanNeeded: false, tarp: false, leak: null, waits: [], tasks: [], schedule: [], later: [],
      storm: null, suited: false, carry: null, samples: 0, got: {}, seismo: false, reactorOn: false, cargo: 'free', battSwapped: false, forceShadow: false,
      step: 0, cds: {}, flags: {}, inside: true, wasInside: true, sleeping: false, paused: true, room: null,
      farm: [], harvests: 0, farmT: 0,
      history: [], histT: 0, log: [], stormLog: [], askedEarth: 0, wasted: 0, batteryEmpty: false, minBar: 100, evaSecs: 0, seen: {}, outcome: null, deck: [], hold: 0
    };
    farmInit();
    if (M.world === 'moon' && survival) S.shadow = [Math.min(lvl.sols, 2 + Math.floor(Math.random() * Math.max(1, lvl.sols - 2)))];
    world.setSuited(false);
    S.history.push(snap());
    S.deck = shuffle(EVENTS3D.filter((e) => e.sites.includes(M.world)));
    if (survival) planSol(); else refreshBeacons();
    if (M.start.hook && hooks[M.start.hook]) hooks[M.start.hook]();
    eng.interactables.forEach((it) => { if (it.kind === 'leak') it.enabled = () => !!(S && S.leak && S.leak.spot === it.id); });
    showHUD(true);
    closeModal();
    eng.start();
    setTimeout(() => { ui.fade.hidden = true; }, 350);
    toast(`<b>${M.code}</b> · ${M.title}. ${survival ? L('Modo livre: mantenha a base viva.', 'Free mode: keep the base alive.') : L('Siga o checklist no canto direito.', 'Follow the checklist on the right.')}`, 'info', 7000);
    if (!survival) setTimeout(() => stepToast(), 1600);
    if (M.world === 'orbit') setTimeout(() => toast(FACTS3D.float, 'info', 7000), 8000);
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const snap = () => ({ sol: S.sol - 1 + Math.min(1, S.t / S.SOL), life: S.life, food: S.food, battery: Math.round(S.battery / S.cap * 100), dose: S.dose, sci: S.sci });
  const today = () => S.days[S.sol - 1] || { day: '', max: 0, count: 0, risk: 'baixo', shown: 'baixo' };
  const shieldPct = () => Math.min(0.6, S.alloc.shield * 0.3);
  const allocTotal = () => Object.values(S.alloc).reduce((a, b) => a + b, 0);
  const curStep = () => (M && !M.survival ? M.steps[S.step] : null);
  const riskName = (r) => ({ baixo: L('Calmo', 'Calm'), medio: L('Agitado', 'Active'), alto: L('Perigoso', 'Dangerous') })[r];

  /* =======================================================================
     Agricultura espacial
     ======================================================================= */
  function farmInit() {
    const plan = M.world === 'orbit' ? [['alface', 1], ['pimenta', 0.5]] : [['alface', 1], ['alface', 0.7], ['rabanete', 0.55], ['tomate', 0.3], [null, 0], [null, 0]];
    S.farm = world.farm.map((tr, i) => ({ crop: plan[i] ? plan[i][0] : null, t: plan[i] ? plan[i][1] : 0, ripeT: 0, health: 1, stage: '' }));
    farmVisuals(true);
  }
  const farmLight = () => clamp(S.alloc.food / 3, 0, 1.4) * S.eff + (M.world === 'mars' && world.kind === 'ground' ? 0.15 * Math.max(0, Math.sin((time01() - 0.25) * Math.PI * 2)) : 0);
  function stageOf(p) {
    if (!p.crop) return L('vazia', 'empty');
    if (p.t >= 1) return p.health < 0.75 ? L('passou do ponto', 'overripe') : L('pronta para colher', 'ready to harvest');
    if (p.t < 0.15) return L('semente', 'seed');
    if (p.t < 0.5) return L('muda', 'seedling');
    return L('crescendo', 'growing');
  }
  function farmTick(dt) {
    if (!S.farm.length) return;
    const light = farmLight(), water = S.life > 15 ? 1 : 0.2, speed = S.survival ? 1 : 1.5;
    let growing = 0;
    S.farm.forEach((p) => {
      if (!p.crop) return;
      const c = CROPS[p.crop];
      if (p.t < 1) { p.t = Math.min(1, p.t + dt / c.grow * light * water * speed); growing++; }
      else { p.ripeT += dt; if (p.ripeT > 160) p.health = Math.max(0.4, p.health - dt * 0.004); }
    });
    if (growing) S.life = clamp(S.life + growing * 0.004 * light * dt, 0, 100); // fotossíntese
    S.farmT += dt; if (S.farmT > 0.5) { S.farmT = 0; farmVisuals(false); }
  }
  function farmVisuals(force) {
    S.farm.forEach((p, i) => {
      const tr = world.farm[i]; if (!tr) return;
      const c = p.crop && CROPS[p.crop];
      tr.plants.visible = !!c;
      if (c) {
        const s = 0.18 + 0.82 * Math.min(p.t, 1);
        tr.plants.scale.set(s, s * c.tall, s);
        tr.leafMat.color.setHex(c.leaf); if (p.health < 0.75) tr.leafMat.color.lerp(new T.Color(0x8a7a3a), 0.5);
        tr.fruits.visible = !!c.fruit && p.t > 0.8;
        if (c.fruit) { tr.fruitMat.color.setHex(c.fruit); tr.fruits.position.y = c.low ? 0.78 : 0.86 + (c.tall - 1) * 0.2; tr.fruits.scale.setScalar(c.low ? 1.4 : 1); }
      } else tr.fruits.visible = false;
      const lit = S.alloc.food > 0 && S.eff > 0.05;
      tr.led.material.color.setHex(lit ? 0xff5bd8 : 0x2a2a2e);
      const st = stageOf(p) + (c ? Math.round(Math.min(p.t, 1) * 100) : '');
      if (force || st !== p.stage) { p.stage = st; tr.tag.material.map = Engine3D.screenTex(c ? c.name : L('BANDEJA', 'TRAY'), [stageOf(p), c ? `${Math.round(Math.min(p.t, 1) * 100)}%` : ''], p.t >= 1 ? '#ffd166' : '#5bd48a'); tr.tag.material.needsUpdate = true; }
    });
  }
  function farmPanel(sel = 0) {
    const light = farmLight();
    const eta = (p) => { const c = CROPS[p.crop]; const sp = light * (S.life > 15 ? 1 : 0.2) * (S.survival ? 1 : 1.5); if (sp <= 0.01) return L('parada (sem luz)', 'stopped (no light)'); return `~${Math.ceil((1 - p.t) * c.grow / sp)} s`; };
    const p = S.farm[sel], c = p && p.crop && CROPS[p.crop];
    let detail = '';
    if (!p) detail = '';
    else if (!c) detail = `<h3>${L('Escolha o que plantar na bandeja', 'Choose what to plant in tray')} ${sel + 1}</h3><div class="crop-grid">${Object.entries(CROPS).map(([k, cr]) => `<button type="button" class="crop" data-farm-plant="${k}" data-tray="${sel}"><span class="crop-dot" style="background:#${cr.leaf.toString(16).padStart(6, '0')}"></span><strong>${cr.name}</strong><small>${L('No espaço:', 'In space:')} ${cr.real}</small><span class="crop-y">${I.leaf} +${cr.food} · ${I.air} −${cr.water} ${L('ao plantar', 'to plant')}</span></button>`).join('')}</div>`;
    else detail = `<div class="crop-now"><div><p class="eyebrow">${L('Bandeja', 'Tray')} ${sel + 1}</p><h3>${c.name}</h3><p class="note">${stageOf(p)} · ${Math.round(Math.min(p.t, 1) * 100)}%${p.t < 1 ? ` · ${L('pronta em', 'ready in')} ${eta(p)}` : ''}${p.health < 1 ? ` · ${L('qualidade', 'quality')} ${Math.round(p.health * 100)}%` : ''}</p><i class="crop-bar"><b style="width:${Math.min(p.t, 1) * 100}%"></b></i></div>${p.t >= 1 ? `<button class="btn-primary" data-farm-harvest="${sel}">${L('Colher', 'Harvest')} (+${Math.round(c.food * p.health)} ${L('comida', 'food')})</button>` : `<button class="btn-ghost" data-farm-boost="${sel}">${L('Adicionar nutrientes (−0,5 bateria)', 'Add nutrients (−0.5 battery)')}</button>`}</div><article class="fact"><span class="fact-k">${L('Ciência de verdade', 'Real science')}</span><p>${c.fact}</p></article>`;
    openModal(`<div class="farm">
      <div class="power-head"><div><p class="eyebrow">${L('Agricultura espacial', 'Space farming')} · ${M.world === 'orbit' ? 'Veggie / Plant Habitat' : L('Estufa da base', 'Base greenhouse')}</p><h2>${L('Painel da estufa', 'Greenhouse panel')}</h2></div><button class="icon-btn" data-act="close-modal" aria-label="${L('Fechar', 'Close')}">${I.close}</button></div>
      <div class="farm-env">
        <div class="fe"><span>${I.sun} ${L('Luz LED', 'LED light')}</span><b>${Math.round(light * 100)}%</b><div class="stepper"><button type="button" data-farm-led="-1" ${S.alloc.food <= 0 ? 'disabled' : ''}>−</button><span class="pips">${Array.from({ length: MAX.food }, (_, k) => `<i class="${k < S.alloc.food ? 'on' : ''}" style="--c:#ff5bd8"></i>`).join('')}</span><button type="button" data-farm-led="1" ${S.alloc.food >= MAX.food ? 'disabled' : ''}>+</button></div><small>${L('Cada célula de energia da estufa acende mais LEDs.', 'Each greenhouse energy cell turns on more LEDs.')}</small></div>
        <div class="fe"><span>${I.air} ${L('Água e nutrientes', 'Water and nutrients')}</span><b>${S.life > 15 ? L('OK', 'OK') : L('Baixo', 'Low')}</b><small>${L('As plantas usam água da base e devolvem oxigênio.', 'Plants use the base’s water and give back oxygen.')}</small></div>
      </div>
      <div class="trays">${S.farm.map((q, i) => { const cq = q.crop && CROPS[q.crop]; return `<button type="button" class="tray${i === sel ? ' on' : ''}${q.t >= 1 && cq ? ' ripe' : ''}" data-farm-sel="${i}"><span class="tray-n">${i + 1}</span><strong>${cq ? cq.name : L('Vazia', 'Empty')}</strong><small>${stageOf(q)}</small><i class="crop-bar"><b style="width:${cq ? Math.min(q.t, 1) * 100 : 0}%"></b></i></button>`; }).join('')}</div>
      ${detail}
    </div>`, 'wide');
  }
  function farmPlant(i, k) {
    const p = S.farm[i]; if (!p || p.crop) return;
    const c = CROPS[k]; p.crop = k; p.t = 0; p.ripeT = 0; p.health = 1;
    applyFx({ l: -c.water }); beep('ok');
    toast(`${I.sprout} ${L(`${c.name} plantada na bandeja ${i + 1}. Mantenha a luz acesa!`, `${c.name} planted in tray ${i + 1}. Keep the lights on!`)}`, 'ok');
    S.retarget = S.retarget || {}; const nx = M.steps.slice(S.step).find((x) => x.do === 'harvest' && /^tray\d$/.test(x.target) && !S.farm[+x.target.slice(4)].crop); if (nx) S.retarget[nx.target] = 'tray' + i;
    stepCheck('plant'); farmVisuals(true); refreshBeacons(); farmPanel(i);
  }
  function farmHarvest(i) {
    const p = S.farm[i]; if (!p || !p.crop || p.t < 1) return;
    const c = CROPS[p.crop], food = Math.round(c.food * p.health);
    applyFx({ f: food, l: c.o2 }); S.harvests++;
    toast(`${I.leaf} ${L(`Colheita de ${c.name.toLowerCase()}: +${food} comida e +${c.o2} ar.`, `${c.name} harvested: +${food} food and +${c.o2} air.`)}${p.health < 0.75 ? ' ' + L('Passou um pouco do ponto: rendeu menos.', 'It was a bit overripe, so it yielded less.') : ''}`, 'ok', 6000);
    if (!S.seen['crop:' + p.crop]) { S.seen['crop:' + p.crop] = true; const coll = store.get('liastra.crops', []); if (!coll.includes(p.crop)) { coll.push(p.crop); store.set('liastra.crops', coll); } }
    p.crop = null; p.t = 0; p.ripeT = 0; p.health = 1;
    beep('done'); doneTask('harvest'); doneTask('veggie');
    farmVisuals(true);
    const done = stepCheck('harvest') || stepCheck('veggie');
    if (!done || !ui.modal.hidden) farmPanel(i);
  }
  function farmGrow(amount) { const light = clamp(S.alloc.food / 3, 0, 1.4); S.farm.forEach((p) => { if (p.crop && p.t < 1) p.t = Math.min(1, p.t + amount * light); }); farmVisuals(true); return light; }

  /* ---------- checklist ---------- */
  function stepToast() { const st = curStep(); if (st) toast(`<b>${L('Próxima tarefa:', 'Next task:')}</b> ${st.t}`, 'step', 6000); }
  function stepCheck(kind) {
    const st = curStep(); if (!st || st.do !== kind) return false;
    S.log.push({ step: S.step + 1, t: st.t });
    S.step++;
    beep('step');
    if (st.fact) setTimeout(() => factToast(st.fact), 600);
    if (st.onDone && hooks[st.onDone]) hooks[st.onDone]();
    refreshBeacons();
    if (S.step >= M.steps.length) { setTimeout(() => finish(true), 1200); return true; }
    setTimeout(stepToast, 900);
    return true;
  }
  const hooks = {
    dust: () => { S.dust = 0.65; S.dustUntil = Infinity; toast(`${I.sun} ${L('A tempestade de poeira chegou! O céu escureceu e os painéis quase não geram energia.', 'The dust storm has arrived! The sky went dark and the panels barely make power.')}`, 'alert', 7000); beep('alarm'); },
    clearDust: () => { S.dust = 0; toast(L('Bom dia! A tempestade passou, mas os painéis estão cobertos de poeira.', 'Good morning! The storm is over, but the panels are covered in dust.'), 'info', 6000); S.cleanNeeded = true; S.penalty = 0.6; },
    shadow: () => { S.forceShadow = true; toast(`${I.moon} ${L('A borda da cratera escondeu o Sol. Os painéis pararam.', 'The crater rim has hidden the Sun. The panels stopped.')} ${S.reactorOn ? L('O reator mantém a base ligada.', 'The reactor keeps the base running.') : ''}`, 'alert', 7000); },
    clearShadow: () => { S.forceShadow = false; toast(`${I.sun} ${L('O Sol voltou a aparecer sobre a borda da cratera.', 'The Sun is back above the crater rim.')}`, 'ok', 6000); },
    leakISS: () => { S.leak = { spot: 'hole' }; setTimeout(() => toast(`${I.air} <b>${L('Alarme:', 'Alarm:')}</b> ${L('a pressão da cabine está caindo devagar. O ar e a água vão baixar até o furo ser vedado.', 'cabin pressure is slowly dropping. Air and water will go down until the hole is sealed.')}`, 'alert', 8000), 2500); beep('alarm'); },
    co2rise: () => { S.leak = { spot: 'co2' }; setTimeout(() => toast(`${I.air} <b>${L('Alarme de CO₂:', 'CO₂ alarm:')}</b> ${L('o filtro parou. O ar está ficando ruim e vai piorar até o adaptador ser montado.', 'the filter stopped. The air is getting bad and will get worse until the adapter is built.')}`, 'alert', 8000), 2500); beep('alarm'); }
  };

  function refreshBeacons() {
    beacons.forEach((b) => eng.scene.remove(b.obj));
    beacons = [];
    const targets = [];
    const st = curStep(); const stT = st && ((S.retarget && S.retarget[st.target]) || st.target); if (st && world.points[stT]) targets.push({ p: world.points[stT], urgent: false });
    S.tasks.slice(0, 3).forEach((t) => { const p = world.points[t.target]; if (p) targets.push({ p, urgent: !!t.urgent }); });
    targets.forEach((tg) => {
      const g = new T.Group(); g.position.copy(tg.p);
      const col = tg.urgent ? 0xff4d4d : 0x2997ff;
      const ring = new T.Mesh(new T.TorusGeometry(0.42, 0.035, 8, 32), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthTest: false, toneMapped: false })); ring.renderOrder = 10; g.add(ring);
      const dot = new T.Mesh(new T.SphereGeometry(0.08, 12, 8), new T.MeshBasicMaterial({ color: col, depthTest: false, toneMapped: false })); dot.renderOrder = 10; g.add(dot);
      if (world.kind === 'ground' && !world.isInside(tg.p)) { const beam = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 60, 12, 1, true), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide })); beam.position.y = 30; g.add(beam); }
      eng.scene.add(g); beacons.push({ obj: g, ring });
    });
  }

  /* ---------- modo sobrevivência ---------- */
  function planSol() {
    S.schedule = []; S.flags = {};
    if (S.storms.includes(S.sol)) S.schedule.push({ at: S.SOL * 0.42, kind: 'storm' });
    (S.sol === 1 ? [0.3] : [0.2, S.storms.includes(S.sol) ? 0.7 : 0.58]).forEach((s) => S.schedule.push({ at: S.SOL * s, kind: 'event' }));
    if (M.world === 'orbit') S.schedule.push({ at: S.SOL * 0.5, kind: 'saa' });
    S.schedule.sort((a, b) => a.at - b.at);
    S.tasks = S.tasks.filter((t) => t.keep);
    const base = M.world === 'orbit'
      ? [{ id: 'plan', label: L('Revisar o plano de energia', 'Review the energy plan'), target: 'power' }, { id: 'exp', label: L('Fazer um experimento', 'Run an experiment'), target: 'experiment' }, { id: 'photo', label: L('Fotografar a Terra na Cúpula', 'Photograph Earth from the Cupola'), target: 'cupola' }]
      : [{ id: 'plan', label: L('Revisar o plano de energia', 'Review the energy plan'), target: 'power' }, { id: 'harvest', label: L('Colher na estufa', 'Harvest in the greenhouse'), target: 'harvest' }, { id: 'exp', label: L('Fazer um experimento', 'Run an experiment'), target: 'experiment' }];
    base.forEach(addTask);
  }
  function addTask(t) { if (S.tasks.some((x) => x.id === t.id)) return; S.tasks.push(Object.assign({}, t)); refreshBeacons(); }
  function doneTask(id) { if (!S.tasks.some((x) => x.id === id)) return; S.tasks = S.tasks.filter((x) => x.id !== id); refreshBeacons(); beep('done'); }

  /* =======================================================================
     Simulação
     ======================================================================= */
  const time01 = () => (S.t0 + S.t / S.SOL * (S.survival && M.world === 'mars' ? 0.92 : 1)) % 1;
  const isShadow = () => S.forceShadow || S.shadow.includes(S.sol);
  function tick(dt) { if (!S || S.paused || S.outcome) return; const sp = S.sleeping ? 14 : 1, n = S.sleeping ? 4 : 1; for (let k = 0; k < n; k++) simulate(dt * sp / n); }
  function simulate(dt) {
    if (S.paused || S.outcome) return;
    S.t += dt; S.tAbs += dt;
    const p = eng.player.pos;
    const sunF = world.sunFactor(time01(), isShadow(), S.tAbs) * (S.dust ? 1 - S.dust : 1) * S.penalty;
    const prod = S.site.sunBase * sunF / S.SOL + (S.reactorOn ? 6 / S.SOL : 0);
    const draw = allocTotal() / S.SOL;
    S.battery += (prod - draw) * dt;
    let eff = 1;
    if (S.battery <= 0) { S.battery = 0; eff = draw > 0 ? clamp(prod / draw, 0, 1) : 1; S.batteryEmpty = true; }
    if (S.battery > S.cap) { S.wasted += S.battery - S.cap; S.battery = S.cap; }
    S.eff = eff;
    const d = S.lvl.drain * (S.survival ? 1 : 0.7), a = S.alloc;
    let lifeRate = ((a.life * 4 + a.food) * eff - 13 * d) / S.SOL; if (S.leak) lifeRate -= 0.3;
    const foodRate = (a.food * 2 * eff - 11 * d) / S.SOL;
    S.life = clamp(S.life + lifeRate * dt, 0, 100); S.food = clamp(S.food + foodRate * dt, 0, 100);
    S.sci += a.sci * 5 * eff * (S.flags.antenna ? 1.3 : 1) / S.SOL * dt * (S.survival ? 1 : 0.4);
    farmTick(dt);
    const inside = world.isInside(p);
    if (inside !== S.wasInside) { if (!inside) toast(`${I.suit} ${L('Você está do lado de fora. O oxigênio do traje está sendo usado e a radiação é maior.', 'You are outside. The suit’s oxygen is being used and radiation is higher.')}`, 'info', 4500); else if (S.suited) toast(L('Dentro da base. O traje está recarregando. Tire o traje na estação de trajes quando terminar.', 'Back inside. The suit is recharging. Take it off at the suit station when you are done.'), 'ok', 3500); S.wasInside = inside; }
    S.inside = inside;
    if (!inside) { S.suit -= dt / SUIT_TIME * 100 * (eng.mode === 'drive' ? 0.45 : 1); S.evaSecs += dt; } else S.suit = Math.min(100, S.suit + dt * 30);
    if (S.suit <= 0) suitEmergency();
    let doseRate = S.site.dailyDose / S.SOL * (inside ? 1 - shieldPct() * 0.5 : 3) * (S.survival ? 1 : 0.5);
    if (S.storm && S.storm.phase === 'on') { const sh = world.inShelter(p), k = !inside ? 1 : (1 - shieldPct()) * (sh ? 0.25 : 1); doseRate += S.site.stormDose / STORM_LEN * k; S.storm.dose += S.site.stormDose / STORM_LEN * k * dt; S.storm.shelterT += sh ? dt : 0; }
    if (S.saa && S.saa.on) doseRate += 1.2 / 15;
    S.dose += doseRate * dt;
    if (S.dust && S.tAbs > S.dustUntil) { S.dust = 0; toast(L('A tempestade de poeira passou.', 'The dust storm is over.'), 'ok'); }
    if (S.storm) { S.storm.t += dt; if (S.storm.phase === 'warn' && S.storm.t >= STORM_WARN) { S.storm.phase = 'on'; S.storm.t = 0; beep('alarm'); toast(`${I.rad} <b>${L('Tempestade chegou!', 'The storm is here!')}</b> ${world.kind === 'orbit' ? L('Fique nas cabines do Nó 2.', 'Stay in the Node 2 crew quarters.') : L('Fique dentro do ABRIGO.', 'Stay inside the SHELTER.')}`, 'alert', 6000); } else if (S.storm.phase === 'on' && S.storm.t >= STORM_LEN) endStorm(); }
    if (S.saa && S.saa.on) { S.saa.t += dt; if (S.saa.t > 15) S.saa.on = false; }
    S.waits = S.waits.filter((w) => { if (S.tAbs >= w.at) { w.fn(); return false; } return true; });
    S.tasks.forEach((t) => { if (t.deadline && S.tAbs > t.deadline) { t.onFail && t.onFail(); t.failed = true; } });
    if (S.tasks.some((t) => t.failed)) { S.tasks = S.tasks.filter((t) => !t.failed); refreshBeacons(); }
    if (S.survival) {
      while (S.schedule.length && S.t >= S.schedule[0].at) {
        const ev = S.schedule.shift();
        if (ev.kind === 'event') { triggerEvent(); return; }
        if (ev.kind === 'storm') startStorm();
        if (ev.kind === 'saa') { S.saa = { on: true, t: 0 }; toast(`${I.rad} ${L('A estação passa sobre a <b>Anomalia do Atlântico Sul</b>, bem em cima do Brasil. A radiação sobe por alguns segundos.', 'The station is passing over the <b>South Atlantic Anomaly</b>, right above Brazil. Radiation rises for a few seconds.')}`, 'info', 6000); if (!S.seen.saa) { S.seen.saa = true; setTimeout(() => factToast(FACTS3D.saa.text), 3000); } }
      }
    }
    S.later = S.later.filter((l) => { if (S.sol >= l.sol) { applyFx(l.fx); toast(l.note, 'info'); return false; } return true; });
    const st = curStep();
    if (st && st.do === 'park' && eng.mode === 'drive' && world.vehicle && world.vehicle.obj.position.distanceTo(new T.Vector3(world.points.pad.x, world.vehicle.obj.position.y, world.points.pad.z)) < 5) { exitRover(); stepCheck('park'); }
    const room = world.roomOf(p);
    if (room !== S.room) { S.room = room; ui.roomtag.textContent = room ? tr(room) : (world.kind === 'orbit' ? L('Fora da estação · caminhada espacial', 'Outside the station · spacewalk') : L('Superfície de ', 'Surface of ') + S.site.name); ui.roomtag.classList.remove('flash'); void ui.roomtag.offsetWidth; ui.roomtag.classList.add('flash'); }
    S.histT += dt; if (S.histT > (S.survival ? S.SOL / 10 : 20)) { S.histT = 0; S.history.push(snap()); }
    S.minBar = Math.min(S.minBar, S.life, S.food);
    if (S.life <= 0) return finish(false, 'life');
    if (S.food <= 0) return finish(false, 'food');
    if (S.dose >= S.lvl.doseLimit) return finish(false, 'dose');
    if (S.survival && S.t >= S.SOL) endSol();
    if (!S.survival && S.t >= S.SOL) S.t = 0;
    if (S.life < 25 && !S.seen.lowLife) { S.seen.lowLife = true; toast(`${I.air} ${L('Ar e água baixos! Use o gerador de oxigênio ou dê mais energia ao suporte de vida.', 'Air and water are low! Use the oxygen generator or give more energy to life support.')}`, 'alert'); }
    if (S.food < 25 && !S.seen.lowFood) { S.seen.lowFood = true; toast(`${I.leaf} ${L('A comida está acabando. Colha e plante na estufa.', 'Food is running low. Harvest and plant in the greenhouse.')}`, 'alert'); }
    if (S.eff < 0.99 && !S.seen.brown) { S.seen.brown = true; toast(`${I.bolt} ${L('A bateria zerou! Os sistemas estão com menos energia do que o plano pede.', 'The battery is empty! Systems are getting less energy than the plan asks for.')}`, 'alert'); }
    if (S.eff >= 0.99) S.seen.brown = false;
  }
  function suitEmergency() {
    S.suit = 30; applyFx({ l: -10 });
    if (eng.mode === 'drive') exitRover();
    const sp = world.spawns.quest || world.spawn;
    eng.player.pos.set(sp.x, sp.y, sp.z); eng.player.vel.set(0, 0, 0);
    beep('bad'); toast(`${I.suit} ${L('O oxigênio do traje acabou! A equipe puxou você de volta para a escotilha.', 'Your suit ran out of oxygen! The crew pulled you back to the airlock.')}`, 'alert', 7000);
  }
  function applyFx(fx) {
    if (!fx) return;
    if (fx.l) S.life = clamp(S.life + fx.l, 0, 100);
    if (fx.f) S.food = clamp(S.food + fx.f, 0, 100);
    if (fx.s) S.sci = Math.max(0, S.sci + fx.s);
    if (fx.d) S.dose += fx.d;
    if (fx.cap) { S.cap = Math.max(4, S.cap + fx.cap); S.battery = Math.min(S.battery, S.cap); }
    if (fx.e) { if (S.battery + fx.e < 0) S.batteryEmpty = true; S.battery = clamp(S.battery + fx.e, 0, S.cap); }
  }

  function startStorm() {
    S.sleeping = false;
    const d = today();
    S.storm = { phase: 'warn', t: 0, dose: 0, shelterT: 0, day: d.day };
    beep('alarm');
    addTask({ id: 'shelter', label: world.kind === 'orbit' ? L('Ir para as cabines (Nó 2)', 'Go to the crew quarters (Node 2)') : L('Ir para o abrigo', 'Go to the shelter'), target: world.kind === 'orbit' ? 'bed' : 'shelter', urgent: true });
    openModal(`<p class="eyebrow">${L('Alerta de clima espacial', 'Space weather alert')}</p><div class="ev-art">☀️</div><h2>${L('Tempestade de partículas solares!', 'Solar particle storm!')}</h2>
      <p class="lead">${rich(d.max ? L(`O Sol deste jogo é o de verdade: no dia ${fmtDate(d.day)}, os satélites da NASA viram o Sol lançar uma [[ejeção de massa coronal|cme]] a ${d.max.toLocaleString('pt-BR')} km/s.`, `This game’s Sun is the real one: on ${fmtDate(d.day)}, NASA satellites saw the Sun launch a [[coronal mass ejection|cme]] at ${d.max.toLocaleString('en-US')} km/s.`) : L('Os satélites detectaram uma explosão no Sol.', 'Satellites detected an explosion on the Sun.'))} ${L(`As partículas chegam em <b>${STORM_WARN} segundos</b>.`, `The particles arrive in <b>${STORM_WARN} seconds</b>.`)}</p>
      <div class="notes"><p>${world.kind === 'orbit' ? L('Vá para as cabines do Nó 2.', 'Go to the Node 2 crew quarters.') : L('Vá para o ABRIGO, atrás da Habitação.', 'Go to the SHELTER, behind the Habitat.')} ${L('Lá dentro a dose cai para um quarto. Escudo d’água:', 'Inside, the dose drops to a quarter. Water shield:')} <b>${Math.round(shieldPct() * 100)}%</b>.</p></div>
      <button class="btn-primary" data-act="close-modal">${L('Correr para o abrigo', 'Run to the shelter')}</button>`);
  }
  function endStorm() {
    const st = S.storm; S.storm = null; doneTask('shelter');
    S.stormLog.push({ sol: S.sol, dose: st.dose, shield: shieldPct(), shelter: st.shelterT / STORM_LEN, day: st.day });
    toast(`${I.rad} ${L(`A tempestade passou. Dose recebida: <b>${num(st.dose)} mSv</b> (${Math.round(st.shelterT / STORM_LEN * 100)}% do tempo no abrigo).`, `The storm is over. Dose received: <b>${num(st.dose)} mSv</b> (${Math.round(st.shelterT / STORM_LEN * 100)}% of the time in the shelter).`)}`, st.dose > S.site.stormDose * 0.5 ? 'alert' : 'ok', 7000);
  }
  function triggerEvent() {
    let pool = S.deck.filter((e) => (e.minSol || 1) <= S.sol);
    if (!pool.length) { S.deck = shuffle(EVENTS3D.filter((e) => e.sites.includes(M.world))); pool = S.deck; }
    let r = Math.random() * pool.reduce((a, e) => a + (e.weight || 1), 0), ev = pool[0];
    for (const e of pool) { r -= (e.weight || 1); if (r <= 0) { ev = e; break; } }
    S.deck = S.deck.filter((e) => e !== ev);
    S.current = ev; S.sleeping = false;
    if (ev.id === 'air-leak' || ev.id === 'co2') S.leak = { spot: world.leakSpots[Math.floor(Math.random() * world.leakSpots.length)] };
    beep(S.leak ? 'alarm' : 'tap');
    openModal(`<p class="eyebrow">${L('Evento', 'Event')} · ${solWord()} ${S.sol}</p><div class="ev-art">${ev.art}</div><h2>${ev.title}</h2><p class="lead">${rich(ev.text)}</p>
      <div class="options">${ev.options.map((o, i) => `<button class="opt" data-opt="${i}"><span class="opt-l">${plain(o.label)}</span><span class="opt-n">${o.note}${o.chance ? ` <em>${L('Chance de dar certo:', 'Chance of success:')} ${Math.round(o.chance.p * 100)}%</em>` : ''}</span><span class="opt-c">${chips(o)}</span></button>`).join('')}</div>`);
  }
  const waitSecs = () => S.delayMin * 4;
  function chips(o) {
    const fx = Object.assign({}, o.fx || {}), out = [];
    const c = (v, l, ic) => out.push(`<span class="chip ${v > 0 ? 'up' : 'down'}">${I[ic]}<b>${v > 0 ? '+' : '−'}${Math.abs(v)}</b> ${l}</span>`);
    if (fx.l) c(fx.l, L('ar', 'air'), 'air'); if (fx.f) c(fx.f, L('comida', 'food'), 'leaf'); if (fx.e) c(fx.e, L('bateria', 'battery'), 'bolt'); if (fx.s) c(fx.s, L('ciência', 'science'), 'flask');
    if (o.ask) { const w = waitSecs(); out.push(`<span class="chip wait">${I.antenna}${w >= 2 ? L(`espera de ${Math.round(w)} s`, `${Math.round(w)} s wait`) : L('espera de menos de 2 s', 'under 2 s wait')}</span>`); }
    if (o.task || ['leak-fix', 'dust-tarp', 'clean', 'eva-joint', 'school-live'].includes(o.do)) out.push(`<span class="chip task">${I.hand}${L('ir até o local', 'go to the spot')}</span>`);
    if (!out.length) out.push(`<span class="chip neutral">${L('sem custo agora', 'no cost now')}</span>`);
    return out.join('');
  }
  function chooseOption(i) {
    const ev = S.current, o = ev.options[i];
    S.log.push({ step: S.sol, t: ev.title + ' → ' + plain(o.label) });
    let note = o.note; const fx = Object.assign({}, o.fx || {});
    if (o.chance) { if (Math.random() > o.chance.p) { if (o.chance.fail) Object.entries(o.chance.fail).forEach(([k, v]) => { fx[k] = (fx[k] || 0) + v; }); note = o.chance.failNote || L('Não deu certo.', 'It didn’t work.'); if (o.do === 'clean-wait') { S.penalty = 0.75; S.cleanNeeded = true; addTask({ id: 'panels', label: L('Limpar os painéis solares', 'Clean the solar panels'), target: 'panels', keep: true }); } } else note = L('Deu certo!', 'It worked!'); }
    applyFx(fx);
    if (o.later) S.later.push({ sol: S.sol + 1, fx: o.later, note: L('A equipe está cansada porque pulou o treino.', 'The crew is tired because they skipped training.') });
    const leakTask = { id: 'leak', label: world.kind === 'orbit' ? L('Consertar o filtro de CO₂', 'Fix the CO₂ filter') : L('Consertar o vazamento', 'Fix the leak'), target: S.leak && S.leak.spot, urgent: true, keep: true };
    switch (o.do) {
      case 'leak-fix': addTask(leakTask); break;
      case 'leak-ask': { S.askedEarth++; const w = waitSecs(); addTask(Object.assign({}, leakTask, { label: L('Aguardando a resposta da Terra…', 'Waiting for Earth’s reply…') })); S.waits.push({ at: S.tAbs + w, fn: () => { if (S.leak) { S.leak = null; doneTask('leak'); applyFx({ s: 3 }); toast(`${I.antenna} ${L(`A resposta da Terra chegou depois de ${Math.round(w)} s. Conserto feito.`, `Earth’s reply arrived after ${Math.round(w)} s. Repair done.`)}`, 'ok', 6500); } } }); break; }
      case 'leak-seal': S.leak = null; break;
      case 'dust': S.dust = 0.5; S.dustUntil = S.tAbs + S.SOL * 1.2; break;
      case 'dust-tarp': S.dust = 0.5; S.dustUntil = S.tAbs + S.SOL * 1.2; S.tarp = true; addTask({ id: 'tarp', label: L('Prender lonas nos painéis', 'Tie tarps on the panels'), target: 'panels', keep: true }); break;
      case 'clean': S.penalty = 0.75; S.cleanNeeded = true; addTask({ id: 'panels', label: L('Limpar ou trocar os painéis', 'Clean or replace the panels'), target: 'panels', keep: true }); break;
      case 'penalty': S.penalty = ev.id === 'joint' ? 0.7 : 0.75; break;
      case 'eva-joint': S.penalty = 0.7; addTask({ id: 'joint', label: L('Consertar a junta na treliça (EVA)', 'Fix the truss joint (EVA)'), target: 'battery_slot', keep: true }); break;
      case 'school-live': addTask({ id: 'school', label: L('Atender a escola no rádio', 'Answer the school on the radio'), target: 'comms', keep: true }); break;
      case 'task': { const t = { id: o.task, label: plain(o.label), target: o.task, keep: true }; if (o.deadline) { t.urgent = true; t.deadline = S.tAbs + o.deadline; t.onFail = () => { if (Math.random() < 0.35) { applyFx({ l: -20 }); toast(L('Um fragmento atingiu a estação!', 'A fragment hit the station!'), 'alert'); } else toast(L('O lixo espacial passou longe. Ufa!', 'The space debris missed us. Phew!'), 'ok'); }; } addTask(t); break; }
    }
    S.current = null;
    const src = ev.fact && SOURCES[ev.fact.src];
    openModal(`<p class="eyebrow">${L('Decisão tomada', 'Decision made')}</p><h2>${note}</h2>${ev.fact ? `<article class="fact"><span class="fact-k">${L('Ciência de verdade', 'Real science')}</span><p>${rich(ev.fact.text)}</p>${src ? `<a href="${src.url}" target="_blank" rel="noopener">${L('Fonte', 'Source')}: ${src.label}</a>` : ''}</article>` : ''}<button class="btn-primary" data-act="close-modal">${L('Voltar para a missão', 'Back to the mission')}</button>`);
  }
  function endSol() {
    S.sleeping = false; ui.fade.hidden = true;
    if (S.storm) endStorm();
    if (S.sol >= S.lvl.sols) return finish(true);
    openModal(`<p class="eyebrow">${L('Fim do', 'End of')} ${solWord()} ${S.sol}</p><h2>${L('A tripulação descansou.', 'The crew rested.')}</h2>
      <ul class="deltas"><li>${I.air}<span>${L('Ar e água', 'Air and water')}</span><b>${Math.round(S.life)}%</b></li><li>${I.leaf}<span>${L('Comida', 'Food')}</span><b>${Math.round(S.food)}%</b></li><li>${I.bolt}<span>${L('Bateria', 'Battery')}</span><b>${num(S.battery)} / ${S.cap}</b></li><li>${I.rad}<span>${L('Radiação', 'Radiation')}</span><b>${num(S.dose)} mSv</b></li><li>${I.flask}<span>${L('Ciência', 'Science')}</span><b>${Math.round(S.sci)} / ${S.lvl.sciGoal}</b></li></ul>
      ${forecastHtml(S.sol + 1)}<button class="btn-primary" data-act="next-sol">${L('Começar o', 'Start')} ${solWord()} ${S.sol + 1}</button>`);
  }
  function nextSol() { S.sol++; S.t = 0; S.leak = null; S.tasks = S.tasks.filter((t) => t.keep && !['leak', 'school', 'capsule'].includes(t.id)); planSol(); closeModal(); }
  function forecastHtml(sol) {
    const d = S.days[sol - 1]; if (!d) return '';
    return `<div class="forecast"><div class="fc risk-${d.shown}"><span class="fc-k">${I.rad}${L('Clima espacial', 'Space weather')}</span><span class="fc-v">${riskName(d.shown)}</span><small>${L(`Dados reais de ${fmtDate(d.day)}: `, `Real data from ${fmtDate(d.day)}: `)}${d.count ? L(`${d.count} CME${d.count > 1 ? 's' : ''}, a mais rápida a ${d.max.toLocaleString('pt-BR')} km/s`, `${d.count} CME${d.count > 1 ? 's' : ''}, the fastest at ${d.max.toLocaleString('en-US')} km/s`) : L('nenhuma CME registrada', 'no CME recorded')}.</small></div></div>`;
  }

  /* ---------- painéis ---------- */
  function powerPanel() {
    const prodSol = Math.round(S.site.sunBase * S.penalty * (S.dust ? 1 - S.dust : 1) * (isShadow() ? 0.2 : 1) + (S.reactorOn ? 6 : 0));
    const p = { life: Math.round(S.alloc.life * 4 + S.alloc.food - 13 * S.lvl.drain), food: Math.round(S.alloc.food * 2 - 11 * S.lvl.drain), sci: S.alloc.sci * 5, bal: prodSol - allocTotal() };
    const dl = (v) => `<b class="${v > 0 ? 'up' : v < 0 ? 'down' : ''}">${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v)}</b>`;
    return `<div class="power">
      <div class="power-head"><div><p class="eyebrow">${L('Console de energia', 'Energy console')}</p><h2>${L('Plano de energia', 'Energy plan')}</h2></div><button class="icon-btn" data-act="close-modal" aria-label="${L('Fechar', 'Close')}">${I.close}</button></div>
      <div class="power-stats">
        <div><span class="ps-n">${prodSol}</span><span class="ps-l">${L(`células por ${solWord()} (Sol${S.reactorOn ? ' + reator' : ''})`, `cells per ${solWord()} (Sun${S.reactorOn ? ' + reactor' : ''})`)}</span></div>
        <div><span class="ps-n">${allocTotal()}</span><span class="ps-l">${L(`células por ${solWord()} no seu plano`, `cells per ${solWord()} in your plan`)}</span></div>
        <div><span class="ps-n">${num(S.battery)}<small>/${S.cap}</small></span><span class="ps-l">${L('na bateria agora', 'in the battery now')}</span></div>
      </div>
      <p class="note">${p.bal >= 0 ? L(`Sobram cerca de ${p.bal} células por ${solWord()}: elas enchem a bateria. O que passar de ${S.cap} é desperdiçado.`, `About ${p.bal} spare cells per ${solWord()}: they fill the battery. Anything above ${S.cap} is wasted.`) : L(`O plano gasta ${-p.bal} células a mais do que entra. A diferença sai da bateria.`, `The plan uses ${-p.bal} more cells than come in. The difference comes out of the battery.`)}</p>
      <div class="systems">${SYSTEMS.map((sys) => `<div class="sys" style="--c:${sys.color}"><div class="sys-head"><span class="sys-ic">${I[sys.icon]}</span><div><strong>${sys.name}</strong><small>${sys.help}</small></div></div><div class="stepper"><button type="button" data-dec="${sys.id}" aria-label="−" ${S.alloc[sys.id] <= 0 ? 'disabled' : ''}>−</button><span class="pips">${Array.from({ length: MAX[sys.id] }, (_, k) => `<i class="${k < S.alloc[sys.id] ? 'on' : ''}"></i>`).join('')}</span><button type="button" data-inc="${sys.id}" aria-label="+" ${S.alloc[sys.id] >= MAX[sys.id] ? 'disabled' : ''}>+</button></div></div>`).join('')}</div>
      <div class="preview"><span class="pv-t">${L(`Por ${solWord()}, com este plano:`, `Per ${solWord()}, with this plan:`)}</span><span>${I.air} ${L('ar', 'air')} ${dl(p.life)}</span><span>${I.leaf} ${L('comida', 'food')} ${dl(p.food)} ${L('+ colheitas', '+ harvests')}</span><span>${I.flask} ${L('ciência', 'science')} ${dl(p.sci)}</span><span>${I.shield} ${L('escudo', 'shield')} ${Math.round(shieldPct() * 100)}%</span></div>
      ${S.survival ? forecastHtml(S.sol) : ''}
      <button class="btn-primary" data-act="close-modal">${L('Aplicar plano', 'Apply plan')}</button></div>`;
  }
  function commsPanel() {
    const delay = M.world === 'mars' ? L(`${num(S.delayMin)} minutos`, `${num(S.delayMin)} minutes`) : M.world === 'moon' ? L('1,3 segundo', '1.3 seconds') : L('menos de 1 segundo', 'under 1 second');
    let extra = '';
    const sch = S.tasks.find((t) => t.id === 'school');
    if (sch) { doneTask('school'); if (M.world === 'mars') { applyFx({ s: 2 }); extra = `<div class="notes"><p>${L(`Cada pergunta levou ${Math.round(S.delayMin)} minutos para chegar. A conversa ao vivo não funcionou.`, `Each question took ${Math.round(S.delayMin)} minutes to arrive. A live chat didn’t work.`)} <b>+2 ${L('ciência', 'science')}</b></p></div>`; } else { applyFx({ s: 10, e: -1 }); extra = `<div class="notes"><p>${L('A conversa ao vivo funcionou!', 'The live chat worked!')} <b>+10 ${L('ciência', 'science')}</b></p></div>`; } }
    const msgs = {
      ares1: L('Bom dia, Jezero! Plano de hoje: manutenção, EVA de coleta e exercício. Câmbio.', 'Good morning, Jezero! Today’s plan: maintenance, a sampling EVA and exercise. Over.'),
      horta1: L('Que bela colheita! Cada folha fresca ajuda a saúde da tripulação. Continuem plantando.', 'What a harvest! Every fresh leaf helps the crew’s health. Keep planting.'),
      dep3f: L('Coordenadas do depósito recebidas. Uma futura missão saberá exatamente onde buscar.', 'Depot coordinates received. A future mission will know exactly where to look.'),
      duna2: L('Atenção: tempestade de poeira chegando. Protejam os painéis e economizem energia.', 'Attention: dust storm incoming. Protect the panels and save energy.'),
      artemis: L('Ótima caminhada! As amostras de gelo podem dizer de onde veio a água da Lua.', 'Great moonwalk! The ice samples may tell us where the Moon’s water came from.'),
      selene: L('Recebido: a base passou pela sombra. Excelente gestão de energia.', 'Copy: the base made it through the shadow. Excellent energy management.'),
      filtro13: L('Instruções do adaptador: fita, saco plástico e papelão. Vamos passo a passo, tripulação.', 'Adapter instructions: tape, plastic bag and cardboard. Let’s go step by step, crew.'),
      'iss-day': L('Bom dia, Estação! Conferência diária: exercício, ciência e foto pela Cúpula.', 'Good morning, Station! Daily conference: exercise, science and a Cupola photo.'),
      'iss-eva': L('Plano da EVA: bolsa de ferramentas, treliça S4, troca de bateria e retorno. Prendam tudo com cabos.', 'EVA plan: tool bag, S4 truss, battery swap and return. Tether everything.'),
      'iss-cargo': L('Nave de carga a 10 metros, estável. Vocês estão liberados para a captura.', 'Cargo ship at 10 meters, stable. You are go for capture.'),
      vaz18: L('Estamos vendo a pressão cair devagar. Procurem módulo por módulo.', 'We see the pressure slowly dropping. Search module by module.')
    };
    return `<div class="power-head"><div><p class="eyebrow">${L('Rádio', 'Radio')}</p><h2>${L('Contato com a Terra', 'Contact with Earth')}</h2></div><button class="icon-btn" data-act="close-modal" aria-label="${L('Fechar', 'Close')}">${I.close}</button></div>
      ${extra}
      <div class="forecast"><div class="fc"><span class="fc-k">${I.antenna}<button type="button" class="term" data-term="atraso">${L('Atraso de comunicação', 'Communication delay')}</button></span><span class="fc-v">${delay}</span><small>${M.world === 'mars' ? L(`Calculado para a posição real de Marte hoje (${num(SpaceWeather.marsDistance().km / 1e6, 0)} milhões de km).`, `Calculated for Mars’s real position today (${num(SpaceWeather.marsDistance().km / 1e6, 0)} million km).`) : L('O rádio viaja a 300 mil km por segundo.', 'Radio travels at 300,000 km per second.')}</small></div></div>
      <h3>${L('Mensagem do Controle da Missão', 'Message from Mission Control')}</h3>
      <div class="radio-msg"><span class="radio-dot"></span><p>${M.world === 'mars' ? `<i>${L(`Recebida ${Math.round(S.delayMin)} min depois de enviada:`, `Received ${Math.round(S.delayMin)} min after it was sent:`)}</i> ` : ''}${msgs[M.id] || L('Seguimos acompanhando a telemetria. Bom trabalho, tripulação.', 'We keep watching the telemetry. Good work, crew.')}</p></div>
      <button class="btn-primary" data-act="close-modal">${L('Encerrar transmissão', 'End transmission')}</button>`;
  }
  function missionPanel() {
    return `<div class="call small"><div class="call-patch"><img src="${patchURI(M)}" alt=""></div><div class="call-body"><p class="eyebrow">${L('Plano da missão', 'Mission plan')}</p><h2>${M.code}<span>${M.title}</span></h2><div class="call-real"><b>${L('Baseada em fatos reais', 'Based on real events')}</b><p>${M.basis}</p></div>
      ${M.steps.length ? `<ol class="call-steps live">${M.steps.map((s, i) => `<li class="${i < S.step ? 'ok' : i === S.step ? 'now' : ''}">${s.t}</li>`).join('')}</ol>` : `<p class="lead">${M.briefing}</p>`}</div></div>`;
  }
  const GLOSS_NAMES = { sol: 'Sol', radiacao: L('Radiação', 'Radiation'), msv: L('Milisievert (mSv)', 'Millisievert (mSv)'), cme: L('Ejeção de massa coronal', 'Coronal mass ejection'), sep: L('Tempestade de partículas', 'Particle storm'), regolito: L('Regolito', 'Regolith'), atraso: L('Atraso de comunicação', 'Communication delay'), microgravidade: L('Microgravidade', 'Microgravity'), bateria: L('Bateria', 'Battery'), eva: 'EVA' };
  function tablet(tab = 'missao') {
    const tabs = [['missao', L('Missão', 'Mission')], ['estufa', L('Estufa', 'Greenhouse')], ['mapa', L('Mapa', 'Map')], ['como', L('Como jogar', 'How to play')], ['recursos', L('Recursos', 'Resources')], ['glossario', L('Glossário', 'Glossary')]];
    let body = '';
    if (tab === 'missao') body = missionPanel();
    if (tab === 'estufa') { const coll = store.get('liastra.crops', []); body = `<p class="lead">${L('Culturas que já foram testadas no espaço ou em condições de Marte. Você colheu', 'Crops already tested in space or in Mars-like conditions. You have harvested')} <b>${coll.length} ${L('de', 'of')} ${Object.keys(CROPS).length}</b>.</p><div class="crop-grid">${Object.entries(CROPS).map(([k, c]) => `<div class="crop${coll.includes(k) ? ' got' : ''}"><span class="crop-dot" style="background:#${c.leaf.toString(16).padStart(6, '0')}"></span><strong>${c.name}</strong><small>${L('No espaço:', 'In space:')} ${c.real}</small><p>${c.fact}</p></div>`).join('')}</div>`; }
    if (tab === 'mapa') body = `<canvas class="bigmap" width="900" height="640"></canvas><p class="note">${L('Seta azul: você. Anel azul: próxima tarefa.', 'Blue arrow: you. Blue ring: next task.')}</p>`;
    if (tab === 'como') body = TUT.slice(1).map((s) => `<div class="tut-row"><h3>${s.t}</h3><p>${s.b}</p></div>`).join('');
    if (tab === 'recursos') body = `<div class="res-explain">${[['bolt', L('Bateria', 'Battery'), '#ffd166', L('Energia guardada. O Sol (e o reator) enchem; o plano de energia esvazia. Se zerar, tudo funciona mais fraco.', 'Stored energy. The Sun (and the reactor) fill it; the energy plan drains it. If it hits zero, everything runs weaker.')], ['air', L('Ar e água', 'Air and water'), '#4cc3ff', L('Oxigênio e água da base. O suporte de vida, o gerador de O₂, o reciclador e as plantas ajudam. Banhos e vazamentos gastam.', 'The base’s oxygen and water. Life support, the O₂ generator, the recycler and plants help. Showers and leaks use it up.')], ['leaf', L('Comida', 'Food'), '#5bd48a', L('Estoque de comida. Colheitas da estufa enchem; refeições e exercícios gastam.', 'Food stock. Greenhouse harvests fill it; meals and exercise use it.')], ['rad', L('Radiação', 'Radiation'), '#ff9f43', L('Dose acumulada em mSv. Sobe mais rápido fora da base e em tempestades solares. Limite de treino: 50 mSv.', 'Accumulated dose in mSv. It rises faster outside the base and during solar storms. Training limit: 50 mSv.')], ['flask', L('Ciência', 'Science'), '#b392ff', L('Descobertas enviadas para a Terra: experimentos, amostras e fotos.', 'Discoveries sent to Earth: experiments, samples and photos.')], ['suit', L('Traje', 'Suit'), '#4cc3ff', L('Oxigênio do traje durante a EVA. Recarrega dentro da base.', 'Suit oxygen during an EVA. It recharges inside the base.')]].map(([ic, l, c, t]) => `<div class="re" style="--c:${c}"><span class="re-ic">${I[ic]}</span><div><strong>${l}</strong><p>${t}</p></div></div>`).join('')}</div>`;
    if (tab === 'glossario') body = `<dl class="gloss">${Object.entries(GLOSSARY).map(([k, v]) => `<div><dt>${GLOSS_NAMES[k] || k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
    openModal(`<div class="tablet"><div class="tablet-head"><div class="tabs">${tabs.map(([k, l]) => `<button type="button" class="tab${k === tab ? ' on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div><button class="icon-btn" data-act="close-modal" aria-label="${L('Fechar', 'Close')}">${I.close}</button></div><div class="tablet-body">${body}</div></div>`, 'wide');
    if (tab === 'mapa') drawMap(ui.card.querySelector('.bigmap'), true);
  }

  /* ---------- braço robótico ---------- */
  function armGame() {
    if (S.cargo !== 'free') { toast(S.cargo === 'berthed' ? L('A nave de carga já está acoplada ao Nó 1.', 'The cargo ship is already berthed to Node 1.') : L('O braço está trabalhando…', 'The arm is working…'), 'info'); return; }
    openModal(`<div class="armgame"><div class="power-head"><div><p class="eyebrow">${L('Estação de robótica · Cúpula', 'Robotics workstation · Cupola')}</p><h2>${L('Capture a nave de carga', 'Capture the cargo ship')}</h2></div><button class="icon-btn" data-act="close-modal" aria-label="${L('Fechar', 'Close')}">${I.close}</button></div>
      <p class="note">${L(`Mova a mira com ${isTouch() ? 'os botões' : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ou as setas'} até o pino de captura. Quando ficar verde, aperte <b>Capturar</b>. A nave flutua devagar: seja paciente, como os operadores reais.`, `Move the reticle with ${isTouch() ? 'the buttons' : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or the arrows'} to the grapple pin. When it turns green, press <b>Capture</b>. The ship drifts slowly: be patient, like the real operators.`)}</p>
      <canvas class="armcv" width="640" height="400"></canvas>
      <div class="armpad"><button data-arm="l">◀</button><button data-arm="u">▲</button><button data-arm="d">▼</button><button data-arm="r">▶</button><button class="btn-primary" data-act="capture">${L('Capturar', 'Capture')}</button></div></div>`, 'wide');
    const cv = ui.card.querySelector('.armcv'), g = cv.getContext('2d');
    const G = { x: 120, y: 300, vx: 0, vy: 0, tx: 420, ty: 160, t: 0, ok: false, keys: {} };
    ui.card._arm = G;
    ui.card.querySelectorAll('[data-arm]').forEach((b) => { ['mousedown', 'touchstart'].forEach((ev) => b.addEventListener(ev, (e) => { e.preventDefault(); G.keys[b.dataset.arm] = true; })); ['mouseup', 'mouseleave', 'touchend'].forEach((ev) => b.addEventListener(ev, () => { G.keys[b.dataset.arm] = false; })); });
    const kd = (e) => { const m = { KeyW: 'u', ArrowUp: 'u', KeyS: 'd', ArrowDown: 'd', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r' }[e.code]; if (m) { G.keys[m] = e.type === 'keydown'; e.preventDefault(); } if (e.code === 'Space' && e.type === 'keydown') ui.card.querySelector('[data-act=capture]').click(); };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', kd);
    let last = performance.now();
    const loop = (now) => {
      if (!ui.card.contains(cv)) { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', kd); return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now; G.t += dt;
      const ax = (G.keys.r ? 1 : 0) - (G.keys.l ? 1 : 0), ay = (G.keys.d ? 1 : 0) - (G.keys.u ? 1 : 0);
      G.vx = (G.vx + ax * 260 * dt) * Math.pow(0.12, dt); G.vy = (G.vy + ay * 260 * dt) * Math.pow(0.12, dt);
      G.x = clamp(G.x + G.vx * dt, 20, 620); G.y = clamp(G.y + G.vy * dt, 20, 380);
      G.tx = 420 + Math.sin(G.t * 0.5) * 70; G.ty = 170 + Math.cos(G.t * 0.37) * 50;
      const dist = Math.hypot(G.x - G.tx, G.y - G.ty); G.ok = dist < 16 && Math.hypot(G.vx, G.vy) < 40;
      g.fillStyle = '#05080f'; g.fillRect(0, 0, 640, 400);
      const grd = g.createRadialGradient(320, 900, 300, 320, 900, 760); grd.addColorStop(0, '#2c6fd6'); grd.addColorStop(1, '#05080f'); g.fillStyle = grd; g.fillRect(0, 0, 640, 400);
      g.save(); g.translate(G.tx, G.ty); g.rotate(Math.sin(G.t * 0.3) * 0.15);
      g.fillStyle = '#e9e3d0'; g.fillRect(-55, -38, 110, 76); g.fillStyle = '#c48a2c'; g.fillRect(-140, -26, 80, 52); g.fillRect(60, -26, 80, 52);
      g.fillStyle = '#1b1f27'; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.strokeStyle = '#ffd166'; g.lineWidth = 3; g.beginPath(); g.moveTo(-14, 0); g.lineTo(14, 0); g.moveTo(0, -14); g.lineTo(0, 14); g.stroke();
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 400); g.lineTo(G.x - 40, G.y + 60); g.lineTo(G.x, G.y); g.stroke();
      g.strokeStyle = G.ok ? '#46d483' : '#4cc3ff'; g.lineWidth = 3; g.beginPath(); g.arc(G.x, G.y, 22, 0, 7); g.moveTo(G.x - 34, G.y); g.lineTo(G.x - 10, G.y); g.moveTo(G.x + 10, G.y); g.lineTo(G.x + 34, G.y); g.moveTo(G.x, G.y - 34); g.lineTo(G.x, G.y - 10); g.moveTo(G.x, G.y + 10); g.lineTo(G.x, G.y + 34); g.stroke();
      g.fillStyle = G.ok ? '#46d483' : '#cfefff'; g.font = '16px "JetBrains Mono", monospace'; g.fillText(`DIST ${Math.round(dist / 10)} m   VEL ${num(Math.hypot(G.vx, G.vy) / 100, 2)} m/s   ${G.ok ? L('PRONTO PARA CAPTURA', 'READY TO CAPTURE') : L('ALINHANDO', 'ALIGNING')}`, 16, 28);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  function capture() {
    const G = ui.card._arm; if (!G) return;
    if (!G.ok) { beep('bad'); toast(L('Ainda não! Alinhe a mira com o pino e espere ficar verde.', 'Not yet! Line up the reticle with the pin and wait for green.'), 'info', 3000); return; }
    beep('win'); closeModal();
    S.cargo = 'grapple'; toast(L('Captura! O braço segurou a nave. Agora ele vai levá-la até o Nó 1.', 'Capture! The arm has the ship. Now it will bring it to Node 1.'), 'ok', 6000);
    setTimeout(() => { if (S) S.cargo = 'berthing'; }, 2500);
    setTimeout(() => { if (!S) return; S.cargo = 'berthed'; world.setCargo('berthed'); toast(L('Nave acoplada ao Nó 1 Unity. Abra a escotilha embaixo do Nó 1.', 'Ship berthed to Node 1 Unity. Open the hatch below Node 1.'), 'ok', 6000); stepCheck('rws'); }, 9000);
  }

  /* ---------- interações ---------- */
  function use(it) {
    const k = it.kind, st = curStep();
    if (k === 'farm') { const i = +String(it.id).replace('tray', '') || 0; farmPanel(i); return; }
    if (k === 'crew') { const c = CREW[it.id] || CREW.crew0; const tip = st ? L(`Nossa próxima tarefa: ${st.t}. Siga o marcador azul!`, `Our next task: ${st.t}. Follow the blue marker!`) : c.lines[Math.floor(Math.random() * c.lines.length)]; toast(`<b>${c.name}, ${c.role}:</b> “${tip}” ${st ? '' : ''}`, 'info', 6500); if (!st || Math.random() < 0.5) setTimeout(() => toast(`<b>${c.name}:</b> “${c.lines[Math.floor(Math.random() * c.lines.length)]}”`, 'info', 6500), 1500); return; }
    if (k === 'power') { openModal(powerPanel(), 'wide'); stepCheck('power'); if (S.survival) doneTask('plan'); return; }
    if (k === 'comms') { openModal(commsPanel()); stepCheck('comms'); return; }
    if (k === 'mcc') { openModal(missionPanel() + `<button class="btn-primary" data-act="close-modal">${L('Fechar', 'Close')}</button>`, 'wide'); stepCheck('mcc'); return; }
    if (k === 'bed') return sleepAsk();
    if (k === 'rover') { if (eng.mode === 'drive') exitRover(); else { if (!S.suited) { toast(L('Vista o traje antes de sair da base.', 'Put on your suit before leaving the base.'), 'info'); return; } enterRover(); } return; }
    if (k === 'rws') return armGame();
    if (k === 'suit') {
      if (!S.suited) { S.suited = true; world.setSuited(true); S.suit = 100; beep('ok'); toast(`${I.suit} ${L('Traje vestido e pré-respiração concluída. A escotilha externa está liberada.', 'Suit on and pre-breathe complete. The outer hatch is unlocked.')}`, 'ok', 5000); stepCheck('suit'); }
      else { if (!S.inside) return; S.suited = false; world.setSuited(false); toast(L('Traje guardado e recarregando.', 'Suit stowed and recharging.'), 'ok', 3500); stepCheck('suitoff'); }
      return;
    }
    if (k === 'leak') { if (S.leak && S.leak.spot === it.id) { S.leak = null; S.waits = []; doneTask('leak'); toast(L('Conserto feito! Tudo vedado.', 'Repair done! Everything sealed.'), 'ok'); } return; }
    if (k === 'panels') {
      if (S.tarp) { S.tarp = false; S.dust = Math.min(S.dust, 0.25); doneTask('tarp'); }
      if (S.cleanNeeded) { S.cleanNeeded = false; S.penalty = 1; doneTask('panels'); toast(`${I.sun} ${M.world === 'moon' ? L('Painéis consertados! A energia voltou ao normal.', 'Panels repaired! Power is back to normal.') : L('Painéis limpos! A energia voltou ao normal.', 'Panels cleaned! Power is back to normal.')}`, 'ok'); }
      else toast(st && st.do === 'panels' && /lona|tarp/i.test(st.t) ? L('Lonas presas! Os painéis vão perder menos energia na tempestade.', 'Tarps secured! The panels will lose less power in the storm.') : L('Painéis limpos e funcionando.', 'Panels clean and working.'), 'ok');
      stepCheck('panels'); return;
    }
    if (k === 'sample' || /^sample\d$/.test(k)) {
      if (S.got[k]) { toast(L('Você já coletou esta amostra.', 'You already collected this sample.'), 'info', 2500); return; }
      S.got[k] = true; S.samples++; applyFx({ s: 5 }); S.carry = L('amostras', 'samples');
      toast(L(`Amostra coletada (${S.samples})! Leve para o Laboratório ICBS.`, `Sample collected (${S.samples})! Take it to the ICBS Lab.`), 'ok'); doneTask('sample');
      if (S.survival) addTask({ id: 'analyze', label: L('Analisar a amostra no laboratório', 'Analyze the sample in the lab'), target: 'glovebox', keep: true });
      stepCheck(k); if (k === 'sample3') stepCheck('sample'); return;
    }
    if (k === 'glovebox' && st && st.do === 'sealant') { S.flags.sealant = true; S.carry = L('resina e gaze', 'resin and gauze'); toast(L('Resina de vedação misturada e pronta.', 'Sealing resin mixed and ready.'), 'ok'); stepCheck('sealant'); return; }
    if (k === 'glovebox' && st && st.do === 'tubes') { S.flags.tubes = true; S.carry = L('10 tubos de amostra', '10 sample tubes'); applyFx({ s: 5 }); toast(L('10 tubos selados e etiquetados.', '10 tubes sealed and labeled.'), 'ok'); stepCheck('tubes'); return; }
    if (k === 'glovebox') {
      if (S.samples > 0) { applyFx({ s: 12 * S.samples }); toast(`${I.flask} ${L(`${S.samples} amostra(s) analisada(s) na glovebox: +${12 * S.samples} ciência.`, `${S.samples} sample(s) analyzed in the glovebox: +${12 * S.samples} science.`)}`, 'ok'); S.samples = 0; S.carry = null; doneTask('analyze'); }
      else { if (cool('glovebox', 40)) return; applyFx({ s: 6 }); toast(`${I.flask} ${L('Experimento na glovebox concluído: +6 ciência.', 'Glovebox experiment complete: +6 science.')}`, 'ok'); }
      doneTask('exp'); stepCheck('glovebox'); return;
    }
    if (k === 'cupola') {
      if (!world.sunlit(S.tAbs)) { toast(L('A estação está no lado noturno da Terra. Espere o Sol nascer (a cada volta de 90 s).', 'The station is over Earth’s night side. Wait for sunrise (every 90 s orbit).'), 'info', 5000); return; }
      if (cool('cupola', 30)) return;
      applyFx({ s: 8 }); toast(`${I.flask} ${L('Foto da Terra enviada para os cientistas! +8 ciência.', 'Earth photo sent to the scientists! +8 science.')}`, 'ok'); doneTask('photo'); doneTask('cupola'); stepCheck('cupola'); return;
    }
    if (k === 'seismo') { if (S.seismo) { toast(L('O sismômetro já está registrando.', 'The seismometer is already recording.'), 'info'); return; } S.seismo = true; applyFx({ s: 8 }); toast(L('Sismômetro instalado e transmitindo! +8 ciência.', 'Seismometer installed and transmitting! +8 science.'), 'ok'); stepCheck('seismo'); return; }
    if (k === 'orubag') {
      if (S.flags.oldBatt) { S.flags.oldBatt = false; S.carry = null; toast(L('Bateria velha presa na bolsa de ferramentas.', 'Old battery secured in the tool bag.'), 'ok'); stepCheck('orubag_return'); return; }
      if (!S.flags.newBatt && !S.battSwapped) { S.flags.newBatt = true; S.carry = L('bateria nova', 'new battery'); toast(L('Bateria nova de íon-lítio presa ao traje. Flutue até a treliça S4 (siga o marcador).', 'New lithium-ion battery tethered to your suit. Float to the S4 truss (follow the marker).'), 'ok', 5000); stepCheck('orubag'); return; }
      toast(L('Bolsa de ferramentas: cabos, chaves e suportes.', 'Tool bag: tethers, wrenches and brackets.'), 'info'); return;
    }
    if (k === 'battery_slot') {
      if (S.tasks.some((t) => t.id === 'joint')) { S.penalty = 1; doneTask('joint'); toast(L('Junta destravada! Os painéis voltaram a seguir o Sol.', 'Joint freed! The panels are tracking the Sun again.'), 'ok'); return; }
      if (!S.flags.newBatt) { toast(S.battSwapped ? L('A bateria nova já está instalada.', 'The new battery is already installed.') : L('Pegue primeiro a bateria nova na bolsa de ferramentas, perto da escotilha.', 'First get the new battery from the tool bag near the airlock.'), 'info', 4000); return; }
      S.flags.newBatt = false; S.flags.oldBatt = true; S.battSwapped = true; S.carry = L('bateria velha', 'old battery'); S.cap += 2; applyFx({ s: 10 }); toast(L('Bateria trocada! Agora leve a velha de volta para a bolsa.', 'Battery swapped! Now take the old one back to the bag.'), 'ok', 5000); stepCheck('battery_slot'); return;
    }
    if (k === 'cargo') { if (S.cargo !== 'berthed') return; if (S.flags.unloaded) { toast(L('A carga já foi descarregada.', 'The cargo has already been unloaded.'), 'info'); return; } S.flags.unloaded = true; S.samples += 1; applyFx({ f: 15, s: 4 }); toast(L('Carga descarregada: comida fresca, peças e experimentos! +15 comida.', 'Cargo unloaded: fresh food, parts and experiments! +15 food.'), 'ok'); stepCheck('cargo'); return; }
    if (k === 'capsule') { if (S.tasks.some((t) => t.id === 'capsule')) { doneTask('capsule'); toast(L('Todos na cápsula, prontos para voltar se fosse preciso. O lixo passou longe.', 'Everyone is in the capsule, ready to go home if needed. The debris missed.'), 'ok', 6000); } else toast(L('A cápsula leva a tripulação de volta à Terra numa emergência.', 'The capsule takes the crew back to Earth in an emergency.'), 'info'); return; }
    if (k === 'supplies') { S.flags.supplies = true; S.carry = L('fita e sacos plásticos', 'tape and plastic bags'); toast(L('Fita, sacos plásticos e tesoura no bolso.', 'Tape, plastic bags and scissors in your pocket.'), 'ok'); stepCheck('supplies'); return; }
    if (k === 'pantry' && st && st.do === 'cardboard') { S.flags.cardboard = true; S.carry = L('fita, sacos e papelão', 'tape, bags and cardboard'); toast(L('Papelão de uma caixa de comida separado.', 'Cardboard from a food box set aside.'), 'ok'); stepCheck('cardboard'); return; }
    if (k === 'co2' && st && st.do === 'adapter') { if (!S.flags.supplies || !S.flags.cardboard) { toast(L('Faltam materiais: fita, sacos e papelão.', 'Missing materials: tape, bags and cardboard.'), 'info'); return; } S.leak = null; S.carry = null; applyFx({ l: 6, s: 6 }); toast(L('Adaptador montado! O filtro improvisado está limpando o ar.', 'Adapter built! The improvised filter is cleaning the air.'), 'ok', 6000); stepCheck('adapter'); return; }
    if (k === 'hole') {
      if (M.id !== 'vaz18') { toast(L('Detector ultrassônico: nenhum vazamento por aqui.', 'Ultrasonic detector: no leaks here.'), 'info', 3000); return; }
      if (!S.flags.holeFound) { S.flags.holeFound = true; toast(L('Achou! Um furo de 2 mm na parede da cápsula, assobiando baixinho.', 'Found it! A 2 mm hole in the capsule wall, softly whistling.'), 'ok', 6000); stepCheck('holefind'); return; }
      if (!S.leak) { toast(L('O furo já está vedado.', 'The hole is already sealed.'), 'info'); return; }
      if (!S.flags.sealant) { toast(L('Prepare primeiro a resina de vedação na glovebox do Laboratório.', 'First prepare the sealing resin in the Lab glovebox.'), 'info', 4000); return; }
      S.leak = null; S.carry = null; applyFx({ s: 8 }); toast(L('Furo vedado com resina e gaze! A pressão parou de cair.', 'Hole sealed with resin and gauze! The pressure stopped dropping.'), 'ok', 6000); stepCheck('hole'); return;
    }
    if (k === 'depot') {
      if (!S.flags.tubes) { toast(L('Sele os tubos na glovebox do Laboratório antes de vir.', 'Seal the tubes in the Lab glovebox before coming.'), 'info', 4000); return; }
      if (S.flags.depot) { toast(L('Os tubos já estão no depósito.', 'The tubes are already at the depot.'), 'info'); return; }
      S.flags.depot = true; S.carry = null; applyFx({ s: 15 }); toast(L('10 tubos depositados em zigue-zague. Prontos para uma missão de retorno!', '10 tubes laid out in a zigzag. Ready for a return mission!'), 'ok', 6000); stepCheck('depot'); return;
    }
    const K = KINDS[k];
    if (!K) return;
    if (K.info) { toast(K.info(), 'info', 4500); stepCheck(k); return; }
    if (K.once && S.flags[K.once]) { toast(L('Já foi feito hoje.', 'Already done today.'), 'info', 2500); return; }
    if (K.cd && cool(k, K.cd)) return;
    if (K.needBattery && S.battery < K.needBattery) { toast(L(`Bateria baixa: precisa de ${K.needBattery} célula(s).`, `Battery low: needs ${K.needBattery} cell(s).`), 'alert'); return; }
    if (K.once) S.flags[K.once] = true;
    if (K.flag) S.flags[K.flag] = true;
    applyFx(K.fx); if (K.run) K.run();
    if (K.msg) toast(K.msg, 'ok');
    if (K.fact && !S.seen['f:' + k]) { S.seen['f:' + k] = true; setTimeout(() => factToast(K.fact), 700); }
    if (k === 'experiment') doneTask('exp');
    if (k === 'water') doneTask('water');
    if (k === 'treadmill') doneTask('treadmill');
    if (k === 'drill') doneTask('drill');
    stepCheck(k);
  }
  function cool(k, s) { const left = s - (S.tAbs - (S.cds[k] || -999)); if (left > 0) { toast(L(`Equipamento ocupado. Tente de novo em ${Math.ceil(left)} s.`, `Equipment busy. Try again in ${Math.ceil(left)} s.`), 'info', 2500); return true; } S.cds[k] = S.tAbs; return false; }
  function sleepAsk() {
    const st = curStep();
    if (!S.survival) {
      if (st && st.do === 'bed') { sleepFade(() => { S.t0 = (time01() + 0.45) % 1; S.t = 0; S.sol++; const light = farmGrow(1.6); if (S.farm.some((p) => p.crop)) setTimeout(() => toast(light > 0 ? L('Durante a noite as plantas cresceram com a luz LED.', 'The plants grew overnight under the LED light.') : L('Sem energia na estufa, as plantas quase não cresceram à noite.', 'With no greenhouse energy, the plants barely grew overnight.'), light > 0 ? 'ok' : 'alert', 6000), 500); stepCheck('bed'); }); return; }
      toast(L('Ainda não é hora de dormir: siga o checklist da missão.', 'It’s not bedtime yet: follow the mission checklist.'), 'info', 3500); return;
    }
    if (S.storm && world.kind === 'orbit') return;
    openModal(`<p class="eyebrow">${L('Hora de dormir?', 'Time to sleep?')}</p><h2>${S.t < S.SOL * 0.6 ? L('Ainda é cedo.', 'It’s still early.') : L('Boa noite, tripulação.', 'Good night, crew.')}</h2><p class="lead">${L(`Dormir faz o tempo passar rápido até o fim do ${solWord()}. Ar, comida, energia e plantas continuam mudando.`, `Sleeping fast-forwards to the end of the ${solWord()}. Air, food, energy and plants keep changing.`)}</p><div class="end-actions"><button class="btn-primary" data-act="sleep">${L(`Dormir até o próximo ${solWord()}`, `Sleep until the next ${solWord()}`)}</button><button class="btn-ghost" data-act="close-modal">${L('Continuar acordado', 'Stay awake')}</button></div>`);
  }
  function sleepFade(after) {
    ui.fade.hidden = false; ui.fade.classList.add('sleepfade'); ui.fade.innerHTML = `<div class="zzz">${L('Zzz… 8 horas de sono', 'Zzz… 8 hours of sleep')}</div>`;
    S.paused = true;
    setTimeout(() => { applyFx({ f: -4 }); after(); ui.fade.hidden = true; ui.fade.innerHTML = ''; ui.fade.classList.remove('sleepfade'); if (S) S.paused = false; }, 2200);
  }
  function enterRover() { eng.mode = 'drive'; eng.vehicle = world.vehicle; eng.camYawOff = 0; toast(L('Dirigindo o rover: <b>W/S</b> acelera e freia, <b>A/D</b> vira, <b>E</b> sai.', 'Driving the rover: <b>W/S</b> accelerate and brake, <b>A/D</b> steer, <b>E</b> exit.'), 'info', 6000); }
  function exitRover() {
    const v = world.vehicle; eng.mode = 'walk'; eng.vehicle = null;
    const x = v.obj.position.x + Math.cos(v.yaw) * 2.8, z = v.obj.position.z - Math.sin(v.yaw) * 2.8;
    eng.player.pos.set(x, eng.groundAt(x, z), z); eng.yaw = v.yaw;
    world.points.rover.set(v.obj.position.x, v.obj.position.y + 1.4, v.obj.position.z);
  }

  /* =======================================================================
     HUD
     ======================================================================= */
  let hudT = 0;
  function renderHUD(dt) {
    hudT += dt;
    const now = performance.now() / 1000;
    beacons.forEach((b, i) => { b.ring.rotation.y += dt * 2; b.ring.rotation.x = Math.sin(now * 1.5 + i) * 0.4; b.ring.scale.setScalar(1 + Math.sin(now * 4) * 0.12); });
    if (hudT < 0.12) return; hudT = 0;
    const bar = (label, v, icon, color, val, warn) => `<div class="hm${warn ? ' warn' : ''}" style="--c:${color}"><span class="hm-i">${I[icon]}</span><span class="hm-l">${label}</span><span class="hm-v">${val}</span><i><b style="width:${clamp(v, 0, 100)}%"></b></i></div>`;
    const bp = S.battery / S.cap * 100;
    ui.res.innerHTML = bar(L('Bateria', 'Battery'), bp, 'bolt', '#ffd166', `${num(S.battery)}/${S.cap}`, bp < 15) + bar(L('Ar e água', 'Air & water'), S.life, 'air', '#4cc3ff', Math.round(S.life) + '%', S.life < 25) + bar(L('Comida', 'Food'), S.food, 'leaf', '#5bd48a', Math.round(S.food) + '%', S.food < 25) + bar(L('Radiação', 'Radiation'), S.dose / S.lvl.doseLimit * 100, 'rad', '#ff9f43', num(S.dose) + ' mSv', S.dose > S.lvl.doseLimit * 0.6) + bar(L('Ciência', 'Science'), S.sci / (S.survival ? S.lvl.sciGoal : 120) * 100, 'flask', '#b392ff', Math.round(S.sci) + '', false);
    let sky;
    if (world.kind === 'orbit') sky = world.sunlit(S.tAbs) ? `${I.sun} ${L('lado iluminado', 'day side')}` : `${I.moon} ${L('lado noturno', 'night side')}`;
    else if (M.world === 'mars') { const t = time01(); sky = (t > 0.25 && t < 0.75) ? `${I.sun} ${L('dia', 'day')}` : `${I.moon} ${L('noite', 'night')}`; } else sky = isShadow() ? `${I.moon} ${L('sombra', 'shadow')}` : `${I.sun} ${L('Sol rasante', 'low Sun')}`;
    const storm = S.storm ? `<span class="clk-alert${S.storm.phase === 'on' ? ' on' : ''}">${S.storm.phase === 'warn' ? L(`Tempestade em ${Math.ceil(STORM_WARN - S.storm.t)} s`, `Storm in ${Math.ceil(STORM_WARN - S.storm.t)} s`) : L(`Tempestade: ${Math.ceil(STORM_LEN - S.storm.t)} s`, `Storm: ${Math.ceil(STORM_LEN - S.storm.t)} s`)}</span>` : '';
    const ripe = S.farm.filter((p) => p.crop && p.t >= 1).length;
    ui.clock.innerHTML = `<div class="clk-top"><img class="clk-patch" src="${patchURI(M)}" alt=""><b>${M.code}</b> · ${S.survival ? `${solWord()} ${S.sol}/${S.lvl.sols}` : WORLD_NAME[M.world]} · ${sky}${S.leak ? ` · <span class="clk-alert on">${L('Alarme', 'Alarm')}</span>` : ''}${S.dust ? ` · ${L('poeira', 'dust')}` : ''}${ripe ? ` · <span class="clk-farm">${I.sprout}${ripe}</span>` : ''}</div><i class="clk-bar"><b style="width:${S.survival ? S.t / S.SOL * 100 : S.step / Math.max(1, M.steps.length) * 100}%"></b></i>${storm}${S.eff < 0.99 ? `<span class="clk-alert">${L('Energia em', 'Power at')} ${Math.round(S.eff * 100)}%</span>` : ''}`;
    const cam = eng.camera.position;
    const arrowFor = (p) => { if (!p) return ['', '']; const dx = p.x - cam.x, dz = p.z - cam.z, dd = Math.hypot(dx, dz, p.y - cam.y); const ang = Math.atan2(-dx, -dz) - eng.yaw; return [`<span class="obj-arr" style="transform:rotate(${-ang}rad)">${I.arrow}</span>`, `<span class="obj-d">${Math.round(dd)} m</span>`]; };
    let html = '';
    if (!S.survival) {
      const st = curStep();
      if (st) { const [a, d] = arrowFor(world.points[st.target]); html += `<p class="obj-h">${L('Checklist · tarefa', 'Checklist · task')} ${S.step + 1} ${L('de', 'of')} ${M.steps.length}</p><div class="obj now">${a}<span class="obj-l">${st.t}</span>${d}</div>`; M.steps.slice(S.step + 1, S.step + 3).forEach((s) => { html += `<div class="obj next"><span class="obj-dot"></span><span class="obj-l">${s.t}</span></div>`; }); }
      else html += `<p class="obj-h">${L('Missão concluída', 'Mission complete')}</p>`;
      S.tasks.slice(0, 2).forEach((t) => { const [a, d] = arrowFor(world.points[t.target]); html += `<div class="obj urgent">${a}<span class="obj-l">${t.label}</span>${d}</div>`; });
    } else {
      html = `<p class="obj-h">${L('Tarefas', 'Tasks')}</p>` + (S.tasks.length ? S.tasks.slice(0, 5).map((t) => { const [a, d] = arrowFor(world.points[t.target]); const left = t.deadline ? ` <span class="clk-alert on">${Math.max(0, Math.ceil(t.deadline - S.tAbs))} s</span>` : ''; return `<div class="obj${t.urgent ? ' urgent' : ''}">${a}<span class="obj-l">${t.label}${left}</span>${d}</div>`; }).join('') : `<div class="obj"><span class="obj-l">${L(`Tudo em dia. Explore ou durma quando o ${solWord()} acabar.`, `All done. Explore, or sleep when the ${solWord()} ends.`)}</span></div>`);
    }
    ui.obj.innerHTML = html;
    if (!S.inside || S.suited) { ui.suit.hidden = false; ui.suit.innerHTML = `<span>${I.suit} ${S.inside ? L('Traje vestido', 'Suit on') : L('Oxigênio do traje', 'Suit oxygen')}</span><i><b style="width:${S.suit}%"></b></i><span>${Math.round(S.suit)}%</span>`; ui.suit.classList.toggle('warn', S.suit < 30); } else ui.suit.hidden = true;
    if (S.carry) { ui.carry.hidden = false; ui.carry.innerHTML = `${I.box} ${L('Carregando:', 'Carrying:')} <b>${S.carry}</b>`; } else ui.carry.hidden = true;
    ui.vignette.className = 'vignette' + (S.storm && S.storm.phase === 'on' ? ' storm' : '') + (!S.inside && S.suit < 30 ? ' low' : '') + (S.sleeping ? ' sleep' : '') + (S.suited && !S.inside ? ' helmet' : '');
    const fo = eng.focus;
    if (fo && ui.modal.hidden) {
      const cs = curStep();
      const isStep = cs && (cs.do === fo.kind || cs.do === fo.id || cs.target === fo.id || (cs.do === 'suitoff' && fo.kind === 'suit' && S.suited) || (cs.do === 'orubag_return' && fo.kind === 'orubag'));
      let label = fo.kind === 'rover' && eng.mode === 'drive' ? L('Sair do rover', 'Exit the rover') : fo.kind === 'suit' && S.suited ? L('Tirar o traje', 'Take off the suit') : fo.kind === 'orubag' && S.flags.oldBatt ? L('Guardar a bateria velha', 'Stow the old battery') : fo.label;
      if (fo.kind === 'farm') { const p = S.farm[+String(fo.id).replace('tray', '') || 0]; if (p) label += ` · ${p.crop ? CROPS[p.crop].name + ' · ' + stageOf(p) : L('vazia', 'empty')}`; }
      ui.prompt.innerHTML = `${isTouch() ? I.hand : '<kbd>E</kbd>'}<span>${label}${fo.hold ? ` <small>(${L('segure', 'hold')})</small>` : ''}</span>${isStep ? `<em class="pr-step">${L('tarefa da missão', 'mission task')}</em>` : ''}${fo.hold && S.hold > 0 ? `<i class="hold"><b style="width:${clamp(S.hold / fo.hold * 100, 0, 100)}%"></b></i>` : ''}`;
      ui.prompt.hidden = false;
    } else ui.prompt.hidden = true;
    drawMap(ui.mini, false);
  }

  function drawMap(cv, big) {
    if (!cv || !world || !world.map) return;
    const g = cv.getContext('2d'), W = cv.width, Hh = cv.height, p = eng.player.pos;
    const outside = world.kind === 'ground' && !S.inside, view = world.map.view;
    const size = big ? (world.kind === 'ground' ? 170 : 60) : (outside ? 140 : view.size * 0.55);
    const cx = big ? (world.kind === 'ground' ? -5 : view.cx) : p.x, cz = big ? (world.kind === 'ground' ? -5 : view.cz) : p.z;
    const sc = Math.min(W, Hh) / size, X = (x) => W / 2 + (x - cx) * sc, Z = (z) => Hh / 2 + (z - cz) * sc;
    g.clearRect(0, 0, W, Hh); g.fillStyle = 'rgba(6,10,16,.82)'; g.fillRect(0, 0, W, Hh);
    if (world.kind === 'ground') {
      Object.entries(world.points).forEach(([k, v]) => { if (/sample|reactor|drill|antenna|panels|pad|earthphoto|seismo|weather|depot/.test(k)) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(X(v.x) - 2, Z(v.z) - 2, 4, 4); } });
      world.map.rooms.forEach((r) => { g.fillStyle = r.main ? 'rgba(160,190,230,.28)' : 'rgba(160,190,230,.16)'; g.strokeStyle = 'rgba(200,220,255,.6)'; g.lineWidth = 1.5; g.fillRect(X(r.x - r.w / 2), Z(r.z - r.d / 2), r.w * sc, r.d * sc); g.strokeRect(X(r.x - r.w / 2), Z(r.z - r.d / 2), r.w * sc, r.d * sc); if ((big || sc > 4) && r.main) { g.fillStyle = '#dfe8f5'; g.font = `${big ? 13 : 10}px Inter, sans-serif`; g.textAlign = 'center'; g.fillText(tr(r.label).replace('Laboratório ICBS', 'Lab ICBS').replace('ICBS Laboratory', 'ICBS Lab').replace('Abrigo de radiação', 'Abrigo').replace('Radiation shelter', 'Shelter'), X(r.x), Z(r.z) + 4); } });
    } else {
      world.map.mods.forEach((m) => { if (m.id === 'cargo' && S.cargo !== 'berthed') return; const b = m.b; g.fillStyle = 'rgba(160,190,230,.25)'; g.strokeStyle = 'rgba(200,220,255,.6)'; g.lineWidth = 1.5; g.fillRect(X(b[0]), Z(b[4]), (b[1] - b[0]) * sc, (b[5] - b[4]) * sc); g.strokeRect(X(b[0]), Z(b[4]), (b[1] - b[0]) * sc, (b[5] - b[4]) * sc); if (big) { g.fillStyle = '#dfe8f5'; g.font = '12px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(tr(m.label).replace(/^(Laboratório|Módulo de|Nó \d|Node \d|Laboratory|Service Module|Cargo Module) ?/, ''), X((b[0] + b[1]) / 2), Z((b[4] + b[5]) / 2) + 4); } });
      g.fillStyle = 'rgba(201,201,196,.5)'; g.fillRect(X(1.7), Z(-52), 1.6 * sc, 104 * sc);
    }
    const st = curStep(), tp = st ? world.points[(S.retarget && S.retarget[st.target]) || st.target] : (S.tasks[0] && world.points[S.tasks[0].target]);
    if (tp) { g.strokeStyle = '#2997ff'; g.lineWidth = 3; g.beginPath(); g.arc(clamp(X(tp.x), 8, W - 8), clamp(Z(tp.z), 8, Hh - 8), big ? 10 : 8, 0, 7); g.stroke(); }
    g.save(); g.translate(X(p.x), Z(p.z)); g.rotate(-eng.yaw);
    g.fillStyle = '#4cc3ff'; g.beginPath(); g.moveTo(0, -11); g.lineTo(7, 8); g.lineTo(0, 4); g.lineTo(-7, 8); g.closePath(); g.fill(); g.restore();
    if (!big) { g.fillStyle = '#a1a1a6'; g.font = '11px Inter, sans-serif'; g.textAlign = 'left'; g.fillText('N', 8, 16); }
  }

  let holding = false;
  function onInteract(down) {
    if (!S || S.paused) return;
    if (down) { if (holding) return; holding = true; const fo = eng.focus; if (fo && !fo.hold) { use(fo); holding = false; } S.hold = 0; }
    else { holding = false; S.hold = 0; }
  }
  function holdTick(dt) { if (!holding || !S || S.paused) return; const fo = eng.focus; if (!fo || !fo.hold) { S.hold = 0; return; } S.hold += dt; if (S.hold >= fo.hold) { S.hold = 0; holding = false; use(fo); } }

  /* =======================================================================
     Fim da missão
     ======================================================================= */
  function finish(win, why) {
    if (!S || S.outcome) return;
    S.history.push(snap());
    let stars = 0;
    if (win) { stars = 1; if (S.survival ? S.sci >= S.lvl.sciGoal : S.minBar >= 35) stars++; if (S.survival ? (S.dose < S.lvl.doseLimit * 0.5 && S.minBar >= 20) : (S.dose < S.lvl.doseLimit * 0.3 && S.wasted < 3)) stars++; }
    S.outcome = { win, why, stars };
    if (win) { const pp = store.get('liastra.patches', {}); pp[M.id] = Math.max(pp[M.id] || 0, stars); store.set('liastra.patches', pp); }
    beep(win ? 'win' : 'bad');
    const whyTxt = { life: L('O ar e a água acabaram.', 'The air and water ran out.'), food: L('A comida acabou.', 'The food ran out.'), dose: L('A tripulação passou do limite de radiação.', 'The crew went over the radiation limit.') };
    const earned = Object.keys(store.get('liastra.patches', {})).filter((k) => MISSIONS.some((m) => m.id === k)).length;
    openModal(`<div class="end">
      ${win ? `<div class="award"><img class="award-patch" src="${patchURI(M)}" alt="${L('Patch da missão', 'Mission patch')} ${M.code}"><p class="eyebrow">${L('Patch conquistado', 'Patch earned')}</p></div>` : ''}
      <h2>${win ? L(`Missão ${M.code} cumprida!`, `Mission ${M.code} accomplished!`) : L('Missão encerrada antes da hora', 'Mission ended early')}</h2>
      <p class="lead">${win ? (M.survival ? L(`A tripulação viveu ${S.lvl.sols} ${solWord()}s em ${S.site.place}.`, `The crew lived ${S.lvl.sols} ${solWord()}s at ${S.site.place}.`) : L(`Você completou as ${M.steps.length} tarefas, como numa missão real.`, `You completed all ${M.steps.length} tasks, just like a real mission.`)) : `${whyTxt[why]} ${L('A tripulação voltou para casa em segurança. Falhar faz parte do treino: tente de novo.', 'The crew got home safely. Failing is part of training: try again.')}`}</p>
      <div class="stars">${[0, 1, 2].map((k) => `<span class="${k < stars ? 'on' : ''}">${I.star}</span>`).join('')}</div>
      <div class="end-grid"><div class="stat"><span>${Math.round(S.sci)}</span><small>${L('ciência', 'science')}</small></div><div class="stat"><span>${num(S.dose)}</span><small>${L('mSv de radiação', 'mSv of radiation')}</small></div><div class="stat"><span>${S.harvests}</span><small>${L('colheitas', 'harvests')}</small></div></div>
      ${chart()}
      <h3>${L('O que esta missão ensinou', 'What this mission taught')}</h3><ul class="lessons">${lessons().map((l) => `<li>${l}</li>`).join('')}</ul>
      <p class="note">${L('Patches na sua coleção:', 'Patches in your collection:')} <b>${earned} ${L('de', 'of')} ${MISSIONS.length}</b>.</p>
      <div class="end-actions"><button class="btn-primary" data-act="center">${L('Central de missões', 'Mission Center')}</button><button class="btn-ghost" data-act="again">${L('Jogar de novo', 'Play again')}</button><button class="btn-ghost" data-act="copy">${L('Copiar resumo para a turma', 'Copy a summary for class')}</button></div>
    </div>`, 'wide');
  }
  function lessons() {
    const Ls = [];
    if (!M.survival) Ls.push(`<b>${L('Base real:', 'Real basis:')}</b> ${M.basis}`);
    S.stormLog.forEach((st) => Ls.push(L(`No ${solWord()} ${st.sol}, o Sol real de ${fmtDate(st.day)} mandou uma tempestade. Com ${Math.round(st.shelter * 100)}% do tempo no abrigo, a dose foi de ${num(st.dose)} mSv.`, `On ${solWord()} ${st.sol}, the real Sun of ${fmtDate(st.day)} sent a storm. With ${Math.round(st.shelter * 100)}% of the time in the shelter, the dose was ${num(st.dose)} mSv.`)));
    if (S.harvests) Ls.push(L(`Você fez ${S.harvests} colheita(s). Plantas dão comida fresca e devolvem oxigênio, mas precisam de energia para a luz e de água.`, `You harvested ${S.harvests} time(s). Plants give fresh food and return oxygen, but they need energy for light and water.`));
    if (S.evaSecs > 20) Ls.push(L(`Você passou ${Math.round(S.evaSecs)} segundos do lado de fora. O traje gasta oxigênio e a radiação é cerca de 3 vezes maior.`, `You spent ${Math.round(S.evaSecs)} seconds outside. The suit uses oxygen and radiation is about 3 times higher.`));
    if (S.wasted > 1) Ls.push(L(`${num(S.wasted)} células de energia se perderam com a bateria cheia. Guardar energia é tão difícil quanto produzi-la.`, `${num(S.wasted)} energy cells were lost with a full battery. Storing energy is as hard as making it.`));
    if (S.batteryEmpty) Ls.push(L('A bateria chegou a zero. Sem reserva, ar e comida caem mais rápido.', 'The battery hit zero. Without a reserve, air and food drop faster.'));
    if (M.world === 'mars') Ls.push(L(`Hoje uma mensagem leva ${num(S.delayMin)} minutos de Marte até a Terra. Astronautas em Marte vão precisar resolver muitas coisas sozinhos.`, `Today a message takes ${num(S.delayMin)} minutes from Mars to Earth. Astronauts on Mars will have to solve many things on their own.`));
    return Ls;
  }
  function chart() {
    const H = S.history, n = Math.max(0.05, H[H.length - 1].sol), W = 520, Ht = 150, pad = 28;
    const x = (v) => pad + (v / n) * (W - pad * 2), y = (v) => Ht - pad + 6 - (clamp(v, 0, 100) / 100) * (Ht - pad - 14);
    const line = (k, c) => `<polyline fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" points="${H.map((h) => `${x(h.sol).toFixed(1)},${y(h[k]).toFixed(1)}`).join(' ')}"/>`;
    return `<figure class="chart"><svg viewBox="0 0 ${W} ${Ht}" role="img" aria-label="${L('Recursos ao longo da missão', 'Resources during the mission')}">${[0, 50, 100].map((v) => `<line x1="${pad}" x2="${W - pad}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${pad - 6}" y="${y(v) + 4}" text-anchor="end" class="axis">${v}</text>`).join('')}${line('life', '#4cc3ff')}${line('food', '#5bd48a')}${line('battery', '#ffd166')}</svg><figcaption><span style="--c:#4cc3ff">${L('Ar e água', 'Air & water')}</span><span style="--c:#5bd48a">${L('Comida', 'Food')}</span><span style="--c:#ffd166">${L('Bateria', 'Battery')}</span></figcaption></figure>`;
  }
  function copySummary(btn) {
    const txt = [`${L('Missão Liastra', 'Mission Liastra')} · ${M.code} · ${M.title} (${WORLD_NAME[M.world]})`, `${L('Resultado', 'Result')}: ${S.outcome.win ? L('missão cumprida', 'mission accomplished') : L('missão encerrada', 'mission ended')} · ${S.outcome.stars}/3 ${L('estrelas', 'stars')}`, `${L('Ciência', 'Science')}: ${Math.round(S.sci)} · ${L('Radiação', 'Radiation')}: ${num(S.dose)} mSv · EVA: ${Math.round(S.evaSecs)} s · ${L('Colheitas', 'Harvests')}: ${S.harvests}`, '', L('Tarefas concluídas:', 'Tasks completed:'), ...S.log.map((l) => `- ${l.t}`), '', L('Base real: ', 'Real basis: ') + M.basis].join('\n');
    const done = () => { btn.textContent = L('Resumo copiado', 'Summary copied'); };
    try { navigator.clipboard.writeText(txt).then(done, fb); } catch (e) { fb(); }
    function fb() { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'absolute'; ta.style.left = '-9999px'; root.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
  }

  function showTerm(btn) {
    hideTerm(); const txt = GLOSSARY[btn.dataset.term]; if (!txt) return;
    const pop = document.createElement('div'); pop.className = 'term-pop'; pop.id = 'term-pop';
    pop.innerHTML = `<p>${txt}</p><button type="button" class="term-x" aria-label="${L('Fechar', 'Close')}">${I.close}</button>`; document.body.appendChild(pop);
    const r = btn.getBoundingClientRect(), w = Math.min(300, window.innerWidth - 32);
    pop.style.width = w + 'px'; pop.style.left = clamp(r.left + r.width / 2 - w / 2, 16, window.innerWidth - w - 16) + 'px';
    pop.style.top = (r.bottom + 10 + pop.offsetHeight < window.innerHeight ? r.bottom + 10 : r.top - pop.offsetHeight - 10) + 'px';
  }
  function hideTerm() { const p = document.getElementById('term-pop'); if (p) p.remove(); }

  function stopGame() { if (eng) eng.stop(); S = null; M = null; showHUD(false); }
  function onClick(e) {
    if (!root || root.hidden) return;
    const term = e.target.closest('.term'); if (term) { e.preventDefault(); showTerm(term); return; }
    if (!e.target.closest('.term-pop')) hideTerm();
    if (!root.contains(e.target)) return;
    const mc = e.target.closest('[data-mission]'); if (mc) { missionCall(mc.dataset.mission); return; }
    const pl = e.target.closest('[data-pick-level]'); if (pl) { root.dataset.selLevel = pl.dataset.pickLevel; ui.card.querySelectorAll('[data-pick-level]').forEach((b) => { b.classList.toggle('is-on', b === pl); b.setAttribute('aria-checked', b === pl); }); beep('tap'); return; }
    const tb = e.target.closest('[data-tab]'); if (tb) { tablet(tb.dataset.tab); return; }
    const fs = e.target.closest('[data-farm-sel]'); if (fs) { beep('tap'); farmPanel(+fs.dataset.farmSel); return; }
    const fp = e.target.closest('[data-farm-plant]'); if (fp) { farmPlant(+fp.dataset.tray, fp.dataset.farmPlant); return; }
    const fh = e.target.closest('[data-farm-harvest]'); if (fh) { farmHarvest(+fh.dataset.farmHarvest); return; }
    const fb = e.target.closest('[data-farm-boost]'); if (fb) { const i = +fb.dataset.farmBoost; if (S.battery < 0.5) { toast(L('Bateria baixa para os nutrientes.', 'Battery too low for nutrients.'), 'alert'); return; } applyFx({ e: -0.5 }); S.farm[i].t = Math.min(1, S.farm[i].t + 0.15); beep('ok'); farmVisuals(true); farmPanel(i); return; }
    const fl = e.target.closest('[data-farm-led]'); if (fl) { const d = +fl.dataset.farmLed; S.alloc.food = clamp(S.alloc.food + d, 0, MAX.food); beep('tap'); farmVisuals(true); farmPanel(+(ui.card.querySelector('.tray.on') || { dataset: { farmSel: 0 } }).dataset.farmSel); return; }
    const inc = e.target.closest('[data-inc]'); if (inc) { const k = inc.dataset.inc; if (S.alloc[k] < MAX[k]) { S.alloc[k]++; beep('tap'); openModal(powerPanel(), 'wide'); } return; }
    const dec = e.target.closest('[data-dec]'); if (dec) { const k = dec.dataset.dec; if (S.alloc[k] > 0) { S.alloc[k]--; beep('tap'); openModal(powerPanel(), 'wide'); } return; }
    const opt = e.target.closest('[data-opt]'); if (opt && S && S.current) { chooseOption(+opt.dataset.opt); return; }
    const act = e.target.closest('[data-act]'); if (!act) return;
    const a = act.dataset.act;
    if (a === 'close') { Game.close(); return; }
    if (a === 'center') { stopGame(); missionCenter(); return; }
    if (a === 'accept') { const id = act.dataset.id; if (!store.get('liastra.tutDone', false)) { store.set('liastra.tutDone', true); tutorial(0, id); return; } loadMission(id); return; }
    if (a === 'tutorial') { tutorial(0, ''); return; }
    if (a === 'tut-next') { const i = +act.dataset.i; if (i < TUT.length - 1) tutorial(i + 1, ui.card.dataset.then); else { const then = ui.card.dataset.then; if (then) loadMission(then); else if (S) closeModal(); else missionCenter(); } return; }
    if (a === 'tut-prev') { tutorial(+act.dataset.i - 1, ui.card.dataset.then); return; }
    if (a === 'tut-skip') { const then = ui.card.dataset.then; if (then) loadMission(then); else if (S) closeModal(); else missionCenter(); return; }
    if (a === 'close-modal') { closeModal(); return; }
    if (a === 'capture') { capture(); return; }
    if (a === 'next-sol') { nextSol(); return; }
    if (a === 'sleep') { closeModal(); S.sleeping = true; toast(L('Zzz… o tempo está passando rápido.', 'Zzz… time is passing quickly.'), 'info', 3000); return; }
    if (a === 'tablet') { if (S) tablet(); return; }
    if (a === 'pause') { pauseMenu(); return; }
    if (a === 'resume') { closeModal(); relock(); return; }
    if (a === 'sound') { soundOn = !soundOn; store.set('liastra.sound', soundOn); pauseMenu(); return; }
    if (a === 'again') { loadMission(M.id); return; }
    if (a === 'copy') { copySummary(act); return; }
  }
  function loadMission(id) { ui.card.innerHTML = `<div class="loading"><span class="spinner"></span><p>${L('Montando o mundo em 3D…', 'Building the 3D world…')}</p></div>`; ui.modal.hidden = false; setTimeout(() => newMission(id), 40); }
  function pauseMenu() {
    if (!S) return;
    openModal(`<div class="power-head"><div><p class="eyebrow">${L('Pausa', 'Paused')} · ${M.code}</p><h2>${L('Missão em pausa', 'Mission paused')}</h2></div><button class="icon-btn" data-act="resume" aria-label="${L('Continuar', 'Resume')}">${I.close}</button></div>
      <div class="end-actions"><button class="btn-primary" data-act="resume">${L('Continuar', 'Resume')}</button><button class="btn-ghost" data-act="tablet">${L('Tablet da missão', 'Mission tablet')}</button><button class="btn-ghost" data-act="tutorial">${L('Como jogar', 'How to play')}</button><button class="btn-ghost" data-act="sound">${soundOn ? L('Desligar som', 'Sound off') : L('Ligar som', 'Sound on')}</button><button class="btn-ghost" data-act="center">${L('Central de missões', 'Mission Center')}</button><button class="btn-ghost" data-act="close">${L('Sair do jogo', 'Quit the game')}</button></div>
      ${isTouch() ? '' : `<div class="sens-row"><label for="sens-in">${L('Sensibilidade do mouse', 'Mouse sensitivity')}</label><input id="sens-in" type="range" min="0.5" max="5" step="0.1" value="${eng.sensMul}"><b id="sens-val">${eng.sensMul.toFixed(1)}×</b></div>
      <p class="note">${L('Aperte <kbd>Esc</kbd> para pausar e para continuar.', 'Press <kbd>Esc</kbd> to pause and to resume.')}</p>`}`);
    ui.pausedAt = performance.now();
    const si = ui.card.querySelector('#sens-in');
    if (si) si.addEventListener('input', () => { eng.sensMul = +si.value; store.set('liastra.sens', eng.sensMul); ui.card.querySelector('#sens-val').textContent = eng.sensMul.toFixed(1) + '×'; });
  }
  function bindTouchButtons() {
    const set = (b, v) => { const k = b.dataset.tb; if (k === 'act') onInteract(v); if (k === 'up') eng.btnUp = v; if (k === 'down') eng.btnDown = v; };
    root.querySelectorAll('[data-tb]').forEach((b) => {
      b.addEventListener('touchstart', (e) => { e.preventDefault(); set(b, true); }, { passive: false });
      b.addEventListener('touchend', (e) => { e.preventDefault(); set(b, false); }, { passive: false });
      b.addEventListener('mousedown', () => set(b, true)); b.addEventListener('mouseup', () => set(b, false));
    });
    eng.onJoy = (kind, x, y) => {
      const j = ui.joy;
      if (kind === 'start') { j.style.left = x + 'px'; j.style.top = y + 'px'; j.classList.add('on'); j.firstElementChild.style.transform = 'translate(-50%,-50%)'; }
      else if (kind === 'move') { const r = j.getBoundingClientRect(); j.firstElementChild.style.transform = `translate(calc(-50% + ${x - (r.left + r.width / 2)}px), calc(-50% + ${y - (r.top + r.height / 2)}px))`; }
      else j.classList.remove('on');
    };
  }

  const Game = {
    async open(pre = {}) {
      root = document.getElementById('game');
      root.hidden = false;
      document.documentElement.classList.add('game-open');
      if (!root.dataset.built) {
        buildDOM(); root.dataset.built = '1';
        try { eng = new Engine3D.Engine(ui.canvasBox); eng.sensMul = +store.get('liastra.sens', 2.2) || 2.2; }
        catch (err) { ui.card.innerHTML = `<h2>${L('Não foi possível iniciar o 3D', 'Could not start 3D')}</h2><p class="lead">${L('Este navegador não ativou o WebGL. Tente outro navegador ou atualize o aparelho.', 'This browser did not enable WebGL. Try another browser or update your device.')}</p><button class="btn-primary" data-act="close">${L('Fechar', 'Close')}</button>`; ui.modal.hidden = false; document.addEventListener('click', onClick); return; }
        eng.onInteract = onInteract;
        eng.onFrame = (dt) => {
          if (!S || !world) return;
          holdTick(dt); tick(dt); if (!S) return;
          world.update(dt, { time01: time01(), tAbs: S.tAbs, shadow: isShadow(), dust: S.dust, alarm: !!(S.leak || (S.storm && S.storm.phase === 'on')), power: S.eff, antennaOn: S.flags.antenna, suited: S.suited, seismo: S.seismo, depot: S.flags.depot, cargo: S.cargo, battSwapped: S.battSwapped });
          renderHUD(dt);
        };
        eng.onKey = (k) => { if (k === 'Tab' && S && !S.outcome) { if (ui.modal.hidden) tablet(); else closeModal(); } };
        eng.onLockChange = (locked) => { if (locked) ui.hint.hidden = true; else if (S && !S.paused && !S.outcome && ui.modal.hidden && !isTouch()) pauseMenu(); };
        eng.onJump = () => { if (!S || S.seen.jump) return; S.seen.jump = true; toast(M.world === 'moon' ? FACTS3D.gravityMoon : FACTS3D.gravityMars, 'info', 6000); };
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', (e) => {
          if (root.hidden) return;
          if (e.key === 'Escape') { if (document.getElementById('term-pop')) { hideTerm(); return; } if (S && !S.outcome && ui.modal.hidden && !S.sleeping) { e.preventDefault(); pauseMenu(); return; } if (S && !ui.modal.hidden && !S.outcome && !S.current && ui.card.querySelector('[data-act="close-modal"],[data-act="resume"]')) { if (ui.pausedAt && performance.now() - ui.pausedAt < 400) return; const wasPause = !!ui.card.querySelector('[data-act="resume"]'); closeModal(); if (wasPause) relock(); return; } }
          if (e.code === 'Tab' && S && !ui.modal.hidden && !S.current && !S.outcome) { e.preventDefault(); closeModal(); }
          if (e.code === 'KeyE' && S && !ui.modal.hidden && (ui.card.querySelector('.power') || ui.card.querySelector('.farm'))) closeModal();
        });
        bindTouchButtons();
      }
      if (!SW) { missionCenter(pre); SW = await SpaceWeather.load(); }
      if (!S) { missionCenter(pre); if (pre.mission) missionCall(pre.mission); }
    },
    close() {
      hideTerm(); stopGame();
      if (ui.modal) ui.modal.hidden = true;
      root.hidden = true;
      document.documentElement.classList.remove('game-open');
      if (location.hash === '#jogar' || location.hash === '#play') history.replaceState(null, '', location.pathname + location.search);
    },
    _debug: () => ({ S, M, eng, world, use, stepCheck, farmPlant, farmHarvest })
  };
  window.Game = Game;
})();

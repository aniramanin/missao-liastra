/* =========================================================================
   Aerospace Innovation Center · recompensas
   XP por missão, patentes de astronauta, medalhas e cores de traje desbloqueáveis.
   Tudo fica guardado só neste navegador (localStorage).
   ========================================================================= */
(function () {
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const RANKS = [
    { xp: 0, name: L('Recruta', 'Recruit') },
    { xp: 300, name: L('Cadete espacial', 'Space cadet') },
    { xp: 800, name: L('Astronauta', 'Astronaut') },
    { xp: 1600, name: L('Especialista de missão', 'Mission specialist') },
    { xp: 2800, name: L('Comandante', 'Commander') },
    { xp: 4500, name: L('Diretor(a) de voo', 'Flight director') },
    { xp: 7000, name: L('Lenda espacial', 'Space legend') }
  ];
  // cada patente desbloqueia uma cor de macacão para o avatar (3ª pessoa)
  const SUITS = [
    { id: 'azul', color: 0x2c4f9e, css: '#2c4f9e', name: L('Azul AIC', 'AIC blue'), rank: 0 },
    { id: 'laranja', color: 0xe0702a, css: '#e0702a', name: L('Laranja de lançamento', 'Launch orange'), rank: 1 },
    { id: 'verde', color: 0x2f9a55, css: '#2f9a55', name: L('Verde estufa', 'Greenhouse green'), rank: 2 },
    { id: 'roxo', color: 0x6b4fd0, css: '#6b4fd0', name: L('Roxo ICBS', 'ICBS purple'), rank: 3 },
    { id: 'vermelho', color: 0xb8322a, css: '#b8322a', name: L('Vermelho marciano', 'Martian red'), rank: 4 },
    { id: 'preto', color: 0x23272f, css: '#23272f', name: L('Preto orbital', 'Orbital black'), rank: 5 },
    { id: 'dourado', color: 0xc9a23a, css: '#c9a23a', name: L('Dourado lendário', 'Legendary gold'), rank: 6 }
  ];
  const MEDALS = [
    { id: 'first', icon: '🚀', name: L('Primeira missão', 'First mission'), desc: L('Complete uma missão.', 'Complete a mission.') },
    { id: 'stars3', icon: '⭐', name: L('Três estrelas', 'Three stars'), desc: L('Termine uma missão com 3 estrelas.', 'Finish a mission with 3 stars.') },
    { id: 'quiz', icon: '🧠', name: L('Mente científica', 'Scientific mind'), desc: L('Acerte as 3 perguntas do desafio.', 'Get all 3 quiz questions right.') },
    { id: 'harvest', icon: '🥬', name: L('Agricultor espacial', 'Space farmer'), desc: L('Faça 10 colheitas no total.', 'Harvest 10 times in total.') },
    { id: 'storm', icon: '☀️', name: L('Sobrevivente solar', 'Solar survivor'), desc: L('Complete uma missão que teve tempestade solar.', 'Complete a mission that had a solar storm.') },
    { id: 'eva', icon: '👩‍🚀', name: L('Caminhante espacial', 'Spacewalker'), desc: L('Passe 60 segundos do lado de fora numa missão.', 'Spend 60 seconds outside in one mission.') },
    { id: 'mars', icon: '🔴', name: L('Pioneiro de Marte', 'Mars pioneer'), desc: L('Ganhe todos os patches de Marte.', 'Earn every Mars patch.') },
    { id: 'moon', icon: '🌕', name: L('Explorador lunar', 'Lunar explorer'), desc: L('Ganhe todos os patches da Lua.', 'Earn every Moon patch.') },
    { id: 'orbit', icon: '🛰️', name: L('Tripulante da Estação', 'Station crew'), desc: L('Ganhe todos os patches da Estação.', 'Earn every Station patch.') },
    { id: 'survival', icon: '🏆', name: L('Sobrevivência', 'Survivor'), desc: L('Vença um modo de sobrevivência.', 'Win a survival mode.') },
    { id: 'all', icon: '🌌', name: L('Coleção completa', 'Full collection'), desc: L('Ganhe todos os patches das missões.', 'Earn every mission patch.') }
  ];

  const rankOf = (xp) => { let i = 0; RANKS.forEach((r, k) => { if (xp >= r.xp) i = k; }); return i; };
  const R = {
    RANKS, SUITS, MEDALS,
    xp: () => get('liastra.xp', 0),
    medals: () => get('liastra.medals', {}),
    rankIndex: () => rankOf(get('liastra.xp', 0)),
    suit: () => { const id = get('liastra.suitColor', 'azul'); const s = SUITS.find((x) => x.id === id) || SUITS[0]; return s.rank <= rankOf(get('liastra.xp', 0)) ? s : SUITS[0]; },
    setSuit: (id) => set('liastra.suitColor', id),
    progress() {
      const xp = R.xp(), i = rankOf(xp), cur = RANKS[i], next = RANKS[i + 1];
      return { xp, i, name: cur.name, next: next ? next.name : null, pct: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1, toNext: next ? next.xp - xp : 0 };
    },
    /* Concede as recompensas e devolve o que mudou (para a tela de fim de missão). */
    award(gain, newMedalIds) {
      const before = R.progress();
      set('liastra.xp', before.xp + gain);
      const have = R.medals(), fresh = [];
      newMedalIds.forEach((id) => { if (!have[id]) { have[id] = Date.now(); fresh.push(MEDALS.find((m) => m.id === id)); } });
      set('liastra.medals', have);
      const after = R.progress();
      const unlocked = after.i > before.i ? SUITS.filter((s) => s.rank > before.i && s.rank <= after.i) : [];
      return { gain, before, after, fresh: fresh.filter(Boolean), rankUp: after.i > before.i, unlocked };
    },
    addHarvests(n) { const t = get('liastra.harvestTotal', 0) + n; set('liastra.harvestTotal', t); return t; }
  };
  window.Rewards = R;
})();

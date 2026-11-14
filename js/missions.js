/* =========================================================================
   Missão Liastra · catálogo de missões
   Cada missão reproduz uma missão ou rotina real, tem um patch próprio
   (como a NASA faz) e um checklist passo a passo.
   Passos: do = tipo de interação que completa o passo · target = ponto do mapa
   ========================================================================= */
(function () {

  /* ---------- gerador de patches (SVG) ---------- */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function planet(cx, cy, r, c1, c2, craters = true, id = 'p') {
    return `<defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>
      ${craters ? `<ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.2}" rx="${r * 0.14}" ry="${r * 0.1}" fill="#000" opacity=".15"/><ellipse cx="${cx + r * 0.35}" cy="${cy + r * 0.25}" rx="${r * 0.1}" ry="${r * 0.08}" fill="#000" opacity=".15"/><ellipse cx="${cx + r * 0.05}" cy="${cy + r * 0.45}" rx="${r * 0.08}" ry="${r * 0.05}" fill="#000" opacity=".12"/>` : ''}`;
  }
  const stars = (n, seed) => { let s = seed, out = ''; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < n; i++) out += `<circle cx="${70 + r() * 260}" cy="${70 + r() * 200}" r="${0.8 + r() * 1.8}" fill="#fff" opacity="${0.5 + r() * 0.5}"/>`; return out; };
  const ART = {
    'mars-base': () => planet(200, 330, 170, '#e2733f', '#5a1d0a', true, 'mb') + `<g fill="#f2f2ef" stroke="#1b2f7a" stroke-width="3"><path d="M120 205 a28 28 0 0 1 56 0z"/><rect x="170" y="190" width="70" height="15" rx="7"/><path d="M236 205 a34 34 0 0 1 68 0z"/></g><g stroke="#1b2f7a" stroke-width="3"><path d="M150 205v-6M270 205v-10"/></g><g fill="#1d3d7a"><rect x="96" y="214" width="30" height="10" transform="skewX(-20)"/><rect x="300" y="214" width="30" height="10" transform="skewX(-20)"/></g>`,
    'storm': () => planet(200, 215, 95, '#e8925a', '#6b2a10', false, 'st') + `<g fill="none" stroke="#f6d2a8" stroke-width="7" stroke-linecap="round" opacity=".85"><path d="M150 215c0-40 80-50 90-10s-50 50-60 20 30-30 40-10"/><path d="M120 190c30-50 120-60 160 0" opacity=".5"/><path d="M130 250c40 30 110 30 150-10" opacity=".5"/></g>`,
    'artemis': () => planet(200, 250, 120, '#e8e8ea', '#5c5d63', true, 'ar') + `<circle cx="285" cy="120" r="26" fill="#2f6fd6"/><path d="M272 112c10-8 22-4 24 6-8 2-12 10-22 6z" fill="#46b56a"/><g fill="#1b2f7a"><ellipse cx="170" cy="215" rx="14" ry="26" transform="rotate(-20 170 215)"/><ellipse cx="160" cy="190" rx="9" ry="7" transform="rotate(-20 160 190)"/></g>`,
    'selene': () => `<circle cx="200" cy="205" r="105" fill="#d9d9dc"/><circle cx="235" cy="185" r="98" fill="#0b1638"/><g transform="translate(150 225)"><rect x="-8" y="-30" width="16" height="40" fill="#9aa1ab"/><path d="M-38 -30h76l-20-40h-36z" fill="#2a2f38" stroke="#ffc94d" stroke-width="3"/><circle cy="-6" r="5" fill="#4cc3ff"/></g>`,
    'iss': () => planet(200, 400, 210, '#4f8fe6', '#0a2a66', false, 'ie') + `<g transform="translate(200 175)"><rect x="-120" y="-3" width="240" height="6" fill="#d9d9d4"/>${[-110, -80, 80, 110].map((x) => `<rect x="${x - 10}" y="-60" width="20" height="54" fill="#c48a2c" stroke="#5e3c0c"/><rect x="${x - 10}" y="6" width="20" height="54" fill="#c48a2c" stroke="#5e3c0c"/>`).join('')}<rect x="-40" y="-8" width="80" height="16" rx="7" fill="#f2f2ef" stroke="#1b2f7a" stroke-width="2"/><rect x="-8" y="-28" width="16" height="56" rx="6" fill="#f2f2ef" stroke="#1b2f7a" stroke-width="2"/></g>`,
    'eva': () => planet(200, 400, 210, '#4f8fe6', '#0a2a66', false, 'ev') + `<g transform="translate(200 190)"><rect x="-120" y="-50" width="240" height="8" fill="#d9d9d4"/><circle cy="-10" r="26" fill="#f2f2ef" stroke="#1b2f7a" stroke-width="3"/><ellipse cy="-8" rx="17" ry="13" fill="#d8a640"/><rect x="-24" y="14" width="48" height="52" rx="12" fill="#f2f2ef" stroke="#1b2f7a" stroke-width="3"/><rect x="-46" y="20" width="22" height="12" rx="6" fill="#f2f2ef" stroke="#1b2f7a" stroke-width="3" transform="rotate(-30 -35 26)"/><rect x="24" y="20" width="22" height="12" rx="6" fill="#f2f2ef" stroke="#1b2f7a" stroke-width="3" transform="rotate(-60 35 26)"/><rect x="40" y="-46" width="26" height="30" fill="#1b2f7a" stroke="#ffc94d" stroke-width="2"/></g>`,
    'cargo': () => planet(200, 400, 210, '#4f8fe6', '#0a2a66', false, 'cg') + `<g stroke="#f2f2ef" stroke-width="10" stroke-linecap="round" fill="none"><path d="M110 110L170 175L245 150"/></g><g fill="#1b2f7a"><circle cx="110" cy="110" r="9"/><circle cx="170" cy="175" r="9"/><circle cx="245" cy="150" r="9"/></g><g transform="translate(285 175) rotate(-15)"><rect x="-30" y="-22" width="60" height="44" rx="10" fill="#e9e3d0" stroke="#1b2f7a" stroke-width="3"/><rect x="-62" y="-14" width="30" height="28" fill="#c48a2c"/><rect x="32" y="-14" width="30" height="28" fill="#c48a2c"/></g>`,
    'farm': () => planet(200, 330, 170, '#e2733f', '#5a1d0a', true, 'fa') + `<path d="M110 215 a90 70 0 0 1 180 0z" fill="#bfe2ff" fill-opacity=".35" stroke="#e8f5ec" stroke-width="3"/><g stroke="#e8f5ec" stroke-width="2" fill="none" opacity=".7"><path d="M140 215 q60-90 120 0M200 145v70"/></g><g fill="#3fbf6f">${[150, 180, 210, 240].map((x, i) => `<ellipse cx="${x}" cy="${200 - (i % 2) * 6}" rx="9" ry="16" transform="rotate(${i % 2 ? 20 : -20} ${x} 200)"/>`).join('')}</g><circle cx="182" cy="188" r="5" fill="#e8462e"/><circle cx="238" cy="192" r="5" fill="#e8462e"/>`,
    'survival-mars': () => planet(200, 205, 100, '#e2733f', '#5a1d0a', true, 'sm'),
    'survival-moon': () => planet(200, 205, 100, '#e8e8ea', '#5c5d63', true, 'sl'),
    'survival-orbit': () => planet(200, 400, 210, '#4f8fe6', '#0a2a66', false, 'so') + '<circle cx="200" cy="170" r="10" fill="#fff"/>'
  };
  const SHAPES = {
    circle: { outer: '<circle cx="200" cy="200" r="194"/>', inner: '<circle cx="200" cy="200" r="150"/>', ringR: 170 },
    shield: { outer: '<path d="M200 8 L376 60 C376 240 300 340 200 394 C100 340 24 240 24 60 Z"/>', inner: '<path d="M200 46 L340 88 C338 238 276 318 200 358 C124 318 62 238 60 88 Z"/>', ringR: 0 },
    oval: { outer: '<ellipse cx="200" cy="200" rx="194" ry="170"/>', inner: '<ellipse cx="200" cy="200" rx="150" ry="128"/>', ringR: 160 },
    hex: { outer: '<polygon points="200,6 368,103 368,297 200,394 32,297 32,103"/>', inner: '<polygon points="200,46 333,123 333,277 200,354 67,277 67,123"/>', ringR: 0 }
  };
  const fitFs = (text, maxW, maxFs, ls = 0.12) => Math.max(8, Math.min(maxFs, maxW / (Array.from(text).length * (0.64 + ls))));
  window.patchSVG = function (m) {
    const P = m.patch, S = SHAPES[P.shape] || SHAPES.circle, id = 'pt' + m.id.replace(/[^a-z0-9]/gi, '');
    const code = m.code, bottom = 'LIASTRA · AEROSPACE INNOVATION CENTER';
    const ry = S.ringR * (P.shape === 'oval' ? 0.87 : 1);
    const fsTop = fitFs(code, P.shape === 'oval' ? 300 : 330, 26), fsBot = fitFs(bottom, P.shape === 'oval' ? 300 : 345, 14.5);
    const ringText = S.ringR ? `
      <path id="${id}t" d="M ${200 - S.ringR} 200 A ${S.ringR} ${ry} 0 0 1 ${200 + S.ringR} 200" fill="none"/>
      <path id="${id}b" d="M ${200 - S.ringR + 4} 200 A ${S.ringR - 4} ${ry - 4} 0 0 0 ${200 + S.ringR - 4} 200" fill="none"/>
      <text font-family="Inter, Arial, sans-serif" font-weight="800" font-size="${fsTop.toFixed(1)}" letter-spacing="${(fsTop * 0.12).toFixed(1)}" fill="${P.text || '#fff'}" dominant-baseline="middle"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${esc(code)}</textPath></text>
      <text font-family="Inter, Arial, sans-serif" font-weight="700" font-size="${fsBot.toFixed(1)}" letter-spacing="${(fsBot * 0.12).toFixed(1)}" fill="${P.text || '#fff'}" opacity=".9" dominant-baseline="middle"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${esc(bottom)}</textPath></text>` : `
      ${(() => { const fs = fitFs(code, 190, 22, 0.1), w = Math.max(120, Math.min(236, Array.from(code).length * fs * 0.76 + 34)); return `<g transform="translate(200 ${P.shape === 'shield' ? 74 : 78})"><rect x="${-w / 2}" y="-18" width="${w}" height="36" rx="9" fill="${P.border}" stroke="${P.edge || '#ffc94d'}" stroke-width="3"/><text y="1.5" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="${fs.toFixed(1)}" letter-spacing="${(fs * 0.1).toFixed(1)}" fill="${P.text || '#fff'}">${esc(code)}</text></g>`; })()}`;
    const banner = (m.patch.banner || m.world.toUpperCase());
    const fsBan = fitFs(banner, 186, 16, 0.1), banW = Math.max(150, Math.min(214, Array.from(banner).length * fsBan * 0.74 + 30));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <defs><clipPath id="${id}c">${S.inner}</clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient></defs>
      <g fill="${P.border}" stroke="${P.edge || '#ffc94d'}" stroke-width="8">${S.outer}</g>
      <g fill="url(#${id}g)" stroke="${P.edge || '#ffc94d'}" stroke-width="4">${S.inner}</g>
      <g clip-path="url(#${id}c)">${stars(26, m.id.length * 97 + 13)}${ART[P.art]()}</g>
      ${ringText}
      <g transform="translate(200 ${P.shape === 'shield' ? 306 : 296})"><rect x="${-banW / 2}" y="-16" width="${banW}" height="32" rx="7" fill="${P.border}" stroke="${P.edge || '#ffc94d'}" stroke-width="3"/><text y="1" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="${fsBan.toFixed(1)}" letter-spacing="${(fsBan * 0.1).toFixed(1)}" fill="${P.text || '#fff'}">${esc(banner)}</text></g>
      ${!S.ringR ? `<text x="200" y="${P.shape === 'shield' ? 346 : 344}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="11" letter-spacing="2" fill="${P.text || '#fff'}" opacity=".85">LIASTRA · AIC</text>` : ''}
    </svg>`;
  };
  window.patchURI = (m) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(patchSVG(m));

  /* ---------- missões ---------- */
  window.MISSIONS = [
    {
      id: 'ares1', code: 'ARES-1', world: 'mars', title: 'Primeiro Sol em Jezero', difficulty: 'Iniciante', minutes: '15 a 20 min',
      patch: { shape: 'circle', border: '#1b2f7a', sky1: '#2a1a3a', sky2: '#c46a3a', art: 'mars-base', banner: 'PRIMEIRO SOL' },
      basis: 'Inspirada no CHAPEA, o experimento da NASA em que 4 voluntários viveram 378 dias (2023–2024) num habitat que simula Marte, em Houston, seguindo a rotina que astronautas terão de verdade.',
      briefing: 'Você acabou de acordar no primeiro sol da tripulação na Base AIC Jezero. Siga a rotina real de um dia em Marte: higiene, café da manhã, conferência com a Terra, manutenção do suporte de vida, uma saída em traje espacial (EVA) para coletar uma amostra e, no fim, um bom banho e cama.',
      start: { at: 'wake', time01: 0.28 },
      steps: [
        { do: 'sink', target: 'sink', t: 'Higiene matinal: lave o rosto na pia do banheiro', fact: 'No habitat do CHAPEA a água é limitada e reciclada. Escovar os dentes e lavar o rosto usa só um copo de água.' },
        { do: 'galley', target: 'galley', t: 'Café da manhã: reidrate uma refeição na cozinha', fact: 'Comida espacial costuma ser desidratada: fica leve para a viagem e dura anos. Basta adicionar água quente.' },
        { do: 'mcc', target: 'mcc', t: 'Conferência diária: veja o plano do dia na mesa do Comando', fact: 'Em Marte, a conversa com a Terra tem minutos de atraso. Por isso o plano do dia chega por mensagem, não ao vivo.' },
        { do: 'power', target: 'power', t: 'Revise o plano de energia no console' },
        { do: 'o2gen', target: 'o2gen', t: 'Verifique o gerador de oxigênio no Suporte de Vida', fact: 'O oxigênio pode ser feito quebrando água em hidrogênio e oxigênio com eletricidade (eletrólise). É assim que a Estação Espacial faz.' },
        { do: 'harvest', target: 'harvest', t: 'Colha verduras na estufa', fact: 'Plantas produzem comida fresca e oxigênio, e ainda reciclam água. Uma estufa é parte do suporte de vida.' },
        { do: 'suit', target: 'suit', t: 'Vista o traje na Escotilha e faça a pré-respiração', fact: 'Antes de sair, astronautas respiram oxigênio puro por um tempo para tirar nitrogênio do sangue e evitar a "doença da descompressão".' },
        { do: 'panels', target: 'panels', t: 'EVA: limpe a poeira dos painéis solares', fact: 'A poeira de Marte é fina como talco e gruda nos painéis. Ela já encerrou missões de rovers movidos a energia solar.' },
        { do: 'sample', target: 'sample', t: 'EVA: colete a rocha manchada na cratera (vá de rover)', fact: 'Em 2024 o Perseverance encontrou em Jezero a rocha Cheyava Falls, com manchas que podem ser sinais de vida antiga.' },
        { do: 'suitoff', target: 'suit', t: 'Volte para dentro e tire o traje na Escotilha' },
        { do: 'glovebox', target: 'glovebox', t: 'Analise a amostra na glovebox do Laboratório ICBS', fact: 'A glovebox é uma caixa fechada com luvas embutidas. Ela protege a amostra da contaminação da base, e a base da poeira da amostra.' },
        { do: 'treadmill', target: 'treadmill', t: 'Faça exercício na esteira da academia', fact: 'Com 38% da gravidade da Terra, ossos e músculos enfraquecem. Exercício diário é obrigatório.' },
        { do: 'shower', target: 'shower', t: 'Tome um banho rápido (cada litro conta!)', fact: 'Um banho na Terra gasta 50 litros. Numa base, o chuveiro usa poucos litros e toda a água volta para o reciclador.' },
        { do: 'bed', target: 'bed', t: 'Durma na sua cabine: fim do primeiro sol' }
      ]
    },
    {
      id: 'duna2', code: 'DUNA-2', world: 'mars', title: 'A Grande Tempestade', difficulty: 'Intermediário', minutes: '15 min',
      patch: { shape: 'shield', border: '#5a1d0a', sky1: '#3a1d12', sky2: '#a85a2c', art: 'storm', banner: 'TEMPESTADE GLOBAL', edge: '#f6d2a8' },
      basis: 'Baseada na tempestade de poeira que cobriu Marte inteiro em 2018 e deixou o rover Opportunity sem energia depois de 14 anos de missão.',
      briefing: 'Os satélites detectaram uma tempestade de poeira que vai cobrir o céu de Jezero. A luz do Sol vai cair muito. Prepare a base antes que ela chegue, sobreviva à noite escura e limpe tudo depois.',
      start: { at: 'hub', time01: 0.32 },
      steps: [
        { do: 'mcc', target: 'mcc', t: 'Veja o alerta de tempestade na mesa do Comando' },
        { do: 'power', target: 'power', t: 'Mude o plano de energia: encha a bateria (menos ciência)' },
        { do: 'suit', target: 'suit', t: 'Vista o traje na Escotilha' },
        { do: 'panels', target: 'panels', t: 'EVA: prenda as lonas de proteção nos painéis', fact: 'Na tempestade de 2018 a luz no chão de Marte caiu tanto que o dia ficou parecendo noite.' },
        { do: 'park', target: 'pad', t: 'Dirija o rover até a plataforma de pouso e estacione', fact: 'Equipamentos parados no vento juntam poeira em lugares difíceis de limpar. Guardar o rover protege motores e câmeras.' },
        { do: 'suitoff', target: 'suit', t: 'Entre e tire o traje antes que a poeira chegue', onDone: 'dust' },
        { do: 'powerpanel', target: 'powerpanel', t: 'Desligue sistemas não essenciais no painel elétrico' },
        { do: 'water', target: 'water', t: 'Recicle água no Suporte de Vida' },
        { do: 'bed', target: 'bed', t: 'Durma enquanto a tempestade passa', onDone: 'clearDust' },
        { do: 'suit', target: 'suit', t: 'Novo sol! Vista o traje' },
        { do: 'panels', target: 'panels', t: 'EVA: limpe a poeira dos painéis' },
        { do: 'suitoff', target: 'suit', t: 'Entre e tire o traje' },
        { do: 'comms', target: 'comms', t: 'Envie o relatório para a Terra pelo rádio' }
      ]
    },
    {
      id: 'artemis', code: 'ARTEMIS-L', world: 'moon', title: 'Caminhada no Polo Sul', difficulty: 'Intermediário', minutes: '15 a 20 min',
      patch: { shape: 'oval', border: '#0b1638', sky1: '#000', sky2: '#1c2440', art: 'artemis', banner: 'POLO SUL LUNAR' },
      basis: 'Inspirada no plano da missão Artemis III da NASA: caminhadas perto do polo sul da Lua, coleta de amostras e busca por gelo nas crateras que nunca recebem luz do Sol.',
      briefing: 'Hoje é dia de caminhada lunar. Você vai instalar um sismômetro, dirigir o rover até a cratera escura para coletar três amostras (uma delas de gelo), fotografar a Terra e trazer tudo para o laboratório ICBS.',
      start: { at: 'hub', time01: 0.1 },
      steps: [
        { do: 'mcc', target: 'mcc', t: 'Briefing: veja a rota da caminhada na mesa do Comando' },
        { do: 'suit', target: 'suit', t: 'Vista o traje e faça a pré-respiração na Escotilha' },
        { do: 'seismo', target: 'seismo', t: 'EVA: instale o sismômetro perto da base', fact: 'As missões Apollo deixaram sismômetros na Lua. Eles registraram milhares de "terremotos lunares" entre 1969 e 1977.' },
        { do: 'sample1', target: 'sample1', t: 'Colete uma rocha na borda da cratera', fact: 'As missões Apollo trouxeram 382 kg de rochas e solo lunar. Cientistas estudam essas amostras até hoje.' },
        { do: 'sample2', target: 'sample2', t: 'Retire um tubo de solo (amostra de núcleo)' },
        { do: 'sample3', target: 'sample3', t: 'Colete gelo no fundo da cratera escura (−200 °C)', fact: 'Em 2009, a sonda LCROSS da NASA bateu numa cratera escura do polo sul e confirmou que havia gelo de água ali.' },
        { do: 'earthphoto', target: 'earthphoto', t: 'Fotografe a Terra baixinha no horizonte', fact: 'Do polo sul da Lua, a Terra aparece sempre perto do horizonte, quase parada no céu.' },
        { do: 'suitoff', target: 'suit', t: 'Volte para a base e tire o traje', fact: 'A poeira lunar é afiada como vidro e gruda nos trajes. Os astronautas da Apollo diziam que ela tinha cheiro de pólvora.' },
        { do: 'freezer', target: 'freezer', t: 'Guarde o gelo no freezer do Laboratório ICBS' },
        { do: 'glovebox', target: 'glovebox', t: 'Analise a rocha na glovebox' },
        { do: 'comms', target: 'comms', t: 'Relate a caminhada para a Terra (resposta em 1,3 s!)' }
      ]
    },
    {
      id: 'selene', code: 'SELENE', world: 'moon', title: 'Sombra na Cratera', difficulty: 'Avançado', minutes: '15 min',
      patch: { shape: 'hex', border: '#0b1638', sky1: '#05070f', sky2: '#16224a', art: 'selene', banner: 'NOITE LUNAR' },
      basis: 'Baseada no desafio real da noite lunar e no projeto Fission Surface Power da NASA, que estuda pequenos reatores nucleares para manter bases ligadas no escuro.',
      briefing: 'A borda da cratera vai esconder o Sol. Sem luz, os painéis param. Ligue o reator de fissão, economize energia, cuide da tripulação e passe pela escuridão.',
      start: { at: 'hub', time01: 0.4 },
      steps: [
        { do: 'mcc', target: 'mcc', t: 'Veja a previsão de sombra na mesa do Comando' },
        { do: 'suit', target: 'suit', t: 'Vista o traje' },
        { do: 'reactor', target: 'reactor', t: 'EVA: ligue o reator de fissão (siga o cabo)', fact: 'Um reator pequeno de 40 kW, como os estudados pela NASA, pode abastecer uma base por 10 anos, faça sol ou não.' },
        { do: 'suitoff', target: 'suit', t: 'Entre e tire o traje', onDone: 'shadow' },
        { do: 'battery', target: 'battery', t: 'Verifique as baterias no Suporte de Vida' },
        { do: 'powerpanel', target: 'powerpanel', t: 'Desligue sistemas não essenciais' },
        { do: 'galley', target: 'galley', t: 'Jante com a tripulação' },
        { do: 'bed', target: 'bed', t: 'Durma durante a sombra', onDone: 'clearShadow' },
        { do: 'med', target: 'med', t: 'Check-up médico na Enfermaria', fact: 'Astronautas fazem exames regulares: pressão, ultrassom e exames de sangue, conversando com médicos na Terra.' },
        { do: 'comms', target: 'comms', t: 'Relate para a Terra que a base passou pela sombra' }
      ]
    },
    {
      id: 'iss-day', code: 'EXPEDIÇÃO LIASTRA', world: 'orbit', title: 'Um dia na Estação', difficulty: 'Iniciante', minutes: '15 min',
      patch: { shape: 'circle', border: '#0b2a66', sky1: '#000814', sky2: '#0a2a66', art: 'iss', banner: 'UM DIA EM ÓRBITA' },
      basis: 'Segue a rotina real dos astronautas da Estação Espacial Internacional: higiene, café, conferência diária com o Controle da Missão, cerca de 2 horas de exercício, experimentos e observação da Terra.',
      briefing: 'Bom dia, astronauta! A Estação dá uma volta na Terra a cada 92 minutos. Siga o cronograma do dia como uma tripulação de verdade, flutuando entre os módulos.',
      start: { at: 'wake', time01: 0 },
      steps: [
        { do: 'hygiene', target: 'hygiene', t: 'Higiene no Nó 3: lenço úmido e xampu sem enxágue', fact: 'Na Estação não há chuveiro: a água flutuaria em bolhas. Astronautas usam toalhas úmidas e xampu que não precisa de enxágue.' },
        { do: 'galley', target: 'galley', t: 'Café da manhã na mesa do Nó 1', fact: 'A comida é presa com velcro e fita para não sair voando. Sal e pimenta vêm líquidos, porque grãos flutuariam.' },
        { do: 'comms', target: 'comms', t: 'Conferência diária com o Controle da Missão (Laboratório)' },
        { do: 'treadmill', target: 'treadmill', t: 'Corra na esteira T2 (presa por elásticos)', fact: 'Na esteira da Estação, elásticos puxam o astronauta para baixo. Sem eles, cada passo o lançaria para o teto.' },
        { do: 'ared', target: 'ared', t: 'Musculação no ARED' },
        { do: 'glovebox', target: 'glovebox', t: 'Experimento na glovebox de microgravidade (Laboratório)' },
        { do: 'veggie', target: 'veggie', t: 'Cuide das alfaces do Veggie (Lab. Europeu)' },
        { do: 'co2', target: 'co2', t: 'Troque o filtro de CO₂ no Laboratório' },
        { do: 'cupola', target: 'cupola', t: 'Fotografe a Terra pela Cúpula', fact: 'A Cúpula tem 7 janelas. É o lugar preferido dos astronautas para ver a Terra.' },
        { do: 'bed', target: 'bed', t: 'Durma na sua cabine no Nó 2', fact: 'Astronautas dormem em sacos de dormir presos à parede. Sem gravidade, "deitado" e "em pé" são a mesma coisa.' }
      ]
    },
    {
      id: 'iss-eva', code: 'EVA-LIASTRA', world: 'orbit', title: 'Troca de baterias', difficulty: 'Avançado', minutes: '15 min',
      patch: { shape: 'shield', border: '#0b2a66', sky1: '#000814', sky2: '#0a2a66', art: 'eva', banner: 'CAMINHADA ESPACIAL' },
      basis: 'Reproduz as caminhadas espaciais reais de 2017 a 2021, quando astronautas trocaram as baterias antigas de níquel-hidrogênio da Estação por baterias novas de íon-lítio na treliça.',
      briefing: 'Uma bateria da treliça S4 está velha e precisa ser trocada. Vista o traje na escotilha Quest, saia presa por um cabo de segurança, pegue a bateria nova, troque no lugar certo e traga a velha de volta.',
      start: { at: 'quest', time01: 0 },
      steps: [
        { do: 'comms', target: 'comms', t: 'Revise o plano da caminhada com o Controle (Laboratório)' },
        { do: 'suit', target: 'suit', t: 'Vista o traje EMU na escotilha Quest', fact: 'O traje de caminhada espacial é uma pequena nave: tem oxigênio, água para resfriamento, rádio e baterias para cerca de 8 horas.' },
        { do: 'orubag', target: 'orubag', t: 'Saia pela escotilha e pegue a bateria nova na bolsa de ferramentas', fact: 'Tudo lá fora fica preso por cabos, inclusive o astronauta. Uma ferramenta solta vira lixo espacial.' },
        { do: 'battery_slot', target: 'battery_slot', t: 'Flutue até a treliça S4 e troque a bateria', fact: 'Cada bateria nova de íon-lítio substituiu duas antigas. Cada caminhada durou cerca de 6 a 7 horas.' },
        { do: 'orubag_return', target: 'orubag', t: 'Leve a bateria velha de volta para a bolsa' },
        { do: 'suitoff', target: 'suit', t: 'Volte para a Quest e tire o traje' },
        { do: 'power', target: 'power', t: 'Confira no console que a bateria nova está carregando' }
      ]
    },
    {
      id: 'iss-cargo', code: 'CARGA-1', world: 'orbit', title: 'Captura com o braço robótico', difficulty: 'Intermediário', minutes: '10 a 15 min',
      patch: { shape: 'oval', border: '#0b2a66', sky1: '#000814', sky2: '#0a2a66', art: 'cargo', banner: 'CAPTURA ROBÓTICA' },
      basis: 'Reproduz como naves de carga como a Cygnus são capturadas pelo braço robótico Canadarm2, operado de dentro da Cúpula, e acopladas ao módulo Unity.',
      briefing: 'Uma nave de carga chegou a 10 metros da Estação, trazendo comida fresca, peças e experimentos. Vá até a Cúpula, use o braço robótico para capturá-la, acople e descarregue.',
      start: { at: 'wake', time01: 0 },
      steps: [
        { do: 'comms', target: 'comms', t: 'Receba a autorização do Controle para a captura' },
        { do: 'rws', target: 'rws', t: 'Na Cúpula, capture a nave com o braço robótico', fact: 'O Canadarm2 tem 17,6 metros e 7 articulações. Ele "anda" pela Estação de ponta a ponta, como uma lagarta.' },
        { do: 'cargo', target: 'cargo', t: 'Abra a escotilha no Nó 1 e descarregue a carga', fact: 'Uma nave Cygnus leva mais de 3.000 kg de carga. Depois de vazia, é enchida de lixo e queima ao voltar para a atmosfera.' },
        { do: 'freezer', target: 'freezer', t: 'Guarde os experimentos no freezer do Lab. Japonês' },
        { do: 'galley', target: 'galley', t: 'Prove a comida fresca que chegou (Nó 1)', fact: 'Frutas frescas são raras e muito comemoradas na Estação. Elas só chegam nas naves de carga.' },
        { do: 'comms', target: 'comms', t: 'Confirme para o Controle que a carga foi recebida' }
      ]
    }
  ];

  MISSIONS.splice(2, 0, {
    id: 'dep3f', code: 'DEPÓSITO-3F', world: 'mars', title: 'Guardar amostras para o futuro', difficulty: 'Intermediário', minutes: '10 a 15 min',
    patch: { shape: 'oval', border: '#3a1408', sky1: '#1a0f1a', sky2: '#b4562a', art: 'mars-base', banner: 'DEPÓSITO DE AMOSTRAS' },
    basis: 'Baseada no depósito Three Forks: entre dezembro de 2022 e janeiro de 2023, o rover Perseverance deixou 10 tubos de amostras no chão de Jezero, como reserva para uma futura missão buscá-los e trazê-los à Terra.',
    briefing: 'Uma futura missão vai trazer amostras de Marte para a Terra. Prepare e sele os tubos no Laboratório ICBS, leve-os de rover até o local marcado e deixe tudo pronto para ser recolhido.',
    start: { at: 'hub', time01: 0.3 },
    steps: [
      { do: 'mcc', target: 'mcc', t: 'Veja onde fica o depósito na mesa do Comando' },
      { do: 'tubes', target: 'glovebox', t: 'Sele 10 tubos de amostra na glovebox do Laboratório ICBS', fact: 'Cada tubo do Perseverance é selado para que nada da Terra contamine a amostra, e nada da amostra escape.' },
      { do: 'suit', target: 'suit', t: 'Vista o traje na Escotilha' },
      { do: 'depot', target: 'depot', t: 'Leve os tubos de rover e deposite no local marcado', fact: 'Os tubos foram espalhados em zigue-zague, longe uns dos outros, para que um robô pudesse recolhê-los um por um e um acidente não atingisse todos.' },
      { do: 'suitoff', target: 'suit', t: 'Volte e tire o traje' },
      { do: 'comms', target: 'comms', t: 'Envie as coordenadas do depósito para a Terra' }
    ]
  });
  MISSIONS.splice(2, 0, {
    id: 'horta1', code: 'HORTA-1', world: 'mars', title: 'A primeira horta de Marte', difficulty: 'Iniciante', minutes: '10 a 15 min',
    patch: { shape: 'circle', border: '#14532d', sky1: '#1a0f1a', sky2: '#b4562a', art: 'farm', banner: 'AGRICULTURA ESPACIAL', edge: '#9df0bf' },
    basis: 'Inspirada nos experimentos de cultivo da Estação Espacial (Veggie e Plant Habitat, que já colheram alface, rabanete, pimenta e tomate) e no projeto Batatas em Marte, do Centro Internacional da Batata (Peru, 2016–2017).',
    briefing: 'Comida fresca é essencial numa missão longa: dá vitaminas, ajuda a reciclar água e produz oxigênio. Hoje você vai cuidar da estufa da Base AIC Jezero: colher, plantar, ajustar a luz e esperar a horta crescer.',
    start: { at: 'hub', time01: 0.3 },
    steps: [
      { do: 'mcc', target: 'mcc', t: 'Veja o plano da horta na mesa do Comando' },
      { do: 'harvest', target: 'tray0', t: 'Na estufa, colha a alface que está pronta (bandeja 1)', fact: 'Plantas fazem fotossíntese: usam luz, água e gás carbônico para crescer e soltam oxigênio. Numa base, a estufa também é parte do suporte de vida.' },
      { do: 'plant', target: 'tray5', t: 'Plante batatas ou rabanetes numa bandeja vazia' },
      { do: 'power', target: 'power', t: 'No console, dê 3 ou mais células de energia para a estufa (luz LED)', fact: 'As luzes LED das estufas espaciais são vermelhas e azuis: são as cores que as plantas mais usam na fotossíntese. Juntas, parecem rosa.' },
      { do: 'water', target: 'water', t: 'Recicle água no Suporte de Vida para a irrigação' },
      { do: 'galley', target: 'galley', t: 'Prepare uma salada com a colheita na Cozinha' },
      { do: 'bed', target: 'bed', t: 'Durma: as plantas crescem durante a noite' },
      { do: 'harvest', target: 'tray5', t: 'Novo sol! Colha o que você plantou' },
      { do: 'comms', target: 'comms', t: 'Conte para a Terra como foi a primeira colheita' }
    ]
  });
  MISSIONS.splice(5, 0, {
    id: 'filtro13', code: 'FILTRO-13', world: 'moon', title: 'O filtro improvisado', difficulty: 'Intermediário', minutes: '10 min',
    patch: { shape: 'shield', border: '#0b1638', sky1: '#05070f', sky2: '#2a1c4a', art: 'artemis', banner: 'IMPROVISO' },
    basis: 'Inspirada na Apollo 13 (1970): os astronautas precisaram encaixar um filtro de gás carbônico quadrado num suporte redondo. Engenheiros na Terra inventaram um adaptador com fita, sacos plásticos e papelão, e ditaram o passo a passo pelo rádio.',
    briefing: 'O filtro de CO₂ da base parou e a peça de reposição não encaixa. O gás carbônico está subindo. Com a ajuda da Terra, improvise um adaptador com o que tiver na base.',
    start: { at: 'hub', time01: 0.2, hook: 'co2rise' },
    steps: [
      { do: 'mcc', target: 'mcc', t: 'Veja o alarme de CO₂ na mesa do Comando' },
      { do: 'comms', target: 'comms', t: 'Peça ajuda aos engenheiros na Terra (resposta em 1,3 s)' },
      { do: 'supplies', target: 'supplies', t: 'Pegue fita e sacos plásticos no estoque do Comando' },
      { do: 'cardboard', target: 'pantry', t: 'Pegue papelão de uma embalagem na despensa da Cozinha' },
      { do: 'adapter', target: 'co2', t: 'Monte o adaptador no filtro de CO₂ (Suporte de Vida)', fact: 'Na Apollo 13, o adaptador foi apelidado de "caixa de correio". Ele funcionou e os três astronautas voltaram para casa em segurança.' },
      { do: 'o2gen', target: 'o2gen', t: 'Ligue o gerador de oxigênio para recuperar o ar' },
      { do: 'comms', target: 'comms', t: 'Avise a Terra que o CO₂ voltou ao normal' }
    ]
  });
  MISSIONS.splice(MISSIONS.findIndex((x) => x.id === 'iss-cargo') + 1, 0, {
    id: 'vaz18', code: 'VAZAMENTO-18', world: 'orbit', title: 'O furo na nave acoplada', difficulty: 'Intermediário', minutes: '10 min',
    patch: { shape: 'hex', border: '#5a0f14', sky1: '#000814', sky2: '#3a0a12', art: 'iss', banner: 'CAÇA AO VAZAMENTO', edge: '#ffd166' },
    basis: 'Em agosto de 2018, sensores da Estação Espacial detectaram uma queda lenta de pressão. A tripulação procurou módulo por módulo e encontrou um furo de 2 mm na nave Soyuz acoplada. Eles o vedaram com resina e gaze, seguindo instruções da Terra.',
    briefing: 'Um alarme indica que o ar está escapando devagar. Descubra onde está o vazamento, prepare a resina de vedação e feche o furo antes que a pressão caia demais.',
    start: { at: 'hub', time01: 0, hook: 'leakISS' },
    steps: [
      { do: 'comms', target: 'comms', t: 'Receba o alerta de queda de pressão do Controle (Laboratório)' },
      { do: 'power', target: 'power', t: 'Confira a pressão da cabine no console' },
      { do: 'holefind', target: 'hole', t: 'Procure o furo com o detector na cápsula acoplada (Nó 2, à frente)', fact: 'Para achar o módulo com vazamento, astronautas fecham escotilhas uma a uma e observam onde a pressão continua caindo.' },
      { do: 'sealant', target: 'glovebox', t: 'Prepare a resina de vedação na glovebox do Laboratório' },
      { do: 'hole', target: 'hole', t: 'Volte e vede o furo com resina e gaze', fact: 'O furo de 2018 tinha só 2 milímetros, mas sem conserto a Estação perderia ar até ficar perigosa em algumas semanas.' },
      { do: 'comms', target: 'comms', t: 'Informe ao Controle que a pressão estabilizou' }
    ]
  });

  // modos de sobrevivência (eventos aleatórios e clima espacial real)
  [['mars', 'SOBREVIVÊNCIA · MARTE', 'Marte livre'], ['moon', 'SOBREVIVÊNCIA · LUA', 'Lua livre'], ['orbit', 'SOBREVIVÊNCIA · ÓRBITA', 'Órbita livre']].forEach(([w, code, title]) => {
    MISSIONS.push({
      id: 'surv-' + w, code, world: w, title: 'Sobrevivência', survival: true, difficulty: 'Livre', minutes: '15 a 25 min',
      patch: { shape: 'circle', border: '#1d1d1f', sky1: '#000', sky2: w === 'mars' ? '#5a1d0a' : w === 'moon' ? '#2a2c33' : '#0a2a66', art: 'survival-' + w, banner: 'MODO LIVRE' },
      basis: 'As tempestades solares deste modo seguem o Sol de verdade: dias reais registrados pelo banco de clima espacial DONKI, da NASA.',
      briefing: 'Sem roteiro: mantenha a base viva por vários sols. Divida a energia, responda a emergências, corra para o abrigo quando o Sol real mandar uma tempestade e faça ciência.',
      start: { at: 'hub', time01: 0.26 }, steps: []
    });
  });
})();

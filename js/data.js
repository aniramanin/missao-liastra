/* =========================================================================
   Missão Liastra · Junior Astronaut Mission Trainer
   Conteúdo científico, locais, glossário e cartas de evento.
   Todos os números com fonte estão referenciados em SOURCES.
   ========================================================================= */

window.SOURCES = {
  donki:   { label: 'NASA DONKI · Banco de Dados de Clima Espacial', url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/' },
  api:     { label: 'NASA Open APIs (api.nasa.gov)', url: 'https://api.nasa.gov/' },
  osdr:    { label: 'NASA Open Science Data Repository (OSDR)', url: 'https://osdr.nasa.gov/' },
  rad:     { label: 'Hassler et al., Science 2014 · Curiosity/RAD', url: 'https://doi.org/10.1126/science.1244797' },
  lnd:     { label: 'Zhang et al., Science Advances 2020 · Chang’e 4/LND', url: 'https://doi.org/10.1126/sciadv.aaz1334' },
  may2024: { label: 'NASA/JPL · Marte durante a tempestade solar de maio de 2024', url: 'https://www.jpl.nasa.gov/news/nasa-watches-mars-light-up-during-epic-solar-storm/' },
  twins:   { label: 'Garrett-Bakelman et al., Science 2019 · Estudo dos Gêmeos da NASA', url: 'https://doi.org/10.1126/science.aau8650' },
  regolith:{ label: 'Paul et al., Communications Biology 2022 · Plantas em solo da Apollo', url: 'https://doi.org/10.1038/s42003-022-03334-8' },
  moxie:   { label: 'NASA/JPL · MOXIE produziu oxigênio em Marte', url: 'https://www.jpl.nasa.gov/news/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/' },
  mars:    { label: 'NASA Science · Marte', url: 'https://science.nasa.gov/mars/' },
  moon:    { label: 'NASA Science · Lua', url: 'https://science.nasa.gov/moon/' },
  artemis: { label: 'NASA · Programa Artemis', url: 'https://www.nasa.gov/humans-in-space/artemis/' },
  hrp:     { label: 'NASA Human Research Program', url: 'https://www.nasa.gov/hrp/' },
  oppy:    { label: 'NASA Science · Rover Opportunity', url: 'https://science.nasa.gov/mission/mer-opportunity/' },
  perse:   { label: 'NASA Science · Rover Perseverance', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/' }
};

/* ---------- Locais da missão ---------- */
window.SITES = {
  mars: {
    id: 'mars',
    name: 'Marte',
    place: 'Cratera Jezero',
    placeNote: 'onde o rover Perseverance procura sinais de vida antiga',
    solName: 'sol',
    dayLength: '24 h 39 min',
    gravity: '38% da Terra',
    gravityNote: 'Uma pessoa de 70 kg sentiria pesar uns 27 kg.',
    temp: '−60 °C em média',
    dailyDose: 0.67,           // mSv/dia · Curiosity RAD (Hassler 2014)
    stormDose: 16,             // mSv, tempestade de partículas sem proteção (estimativa didática)
    sunBase: 8,                // células de energia num dia limpo
    hasDust: true,
    hasShadow: false,
    sky: ['#e9a46a', '#c56a3c'],
    ground: ['#b5522b', '#7a3018'],
    accent: '#ff6b35',
    intro: 'Sua base fica na Cratera Jezero. O ar de Marte é fino e cheio de gás carbônico, então tudo o que vocês respiram precisa ser fabricado aqui dentro.'
  },
  moon: {
    id: 'moon',
    name: 'Lua',
    place: 'Polo Sul · Cratera Shackleton',
    placeNote: 'região escolhida pelo programa Artemis por causa do gelo nas crateras escuras',
    solName: 'dia',
    dayLength: '29,5 dias terrestres (um ciclo de luz)',
    gravity: '17% da Terra',
    gravityNote: 'Uma pessoa de 70 kg sentiria pesar uns 12 kg.',
    temp: 'de −170 °C a +120 °C',
    dailyDose: 1.37,           // mSv/dia · Chang'e 4 LND (Zhang 2020)
    stormDose: 30,             // sem atmosfera nem campo magnético: dose maior
    sunBase: 9,
    hasDust: false,
    hasShadow: true,
    sky: ['#0b0d12', '#1a1d26'],
    ground: ['#8d8f96', '#55575e'],
    accent: '#c9d4e6',
    intro: 'Sua base fica na borda da Cratera Shackleton, no polo sul da Lua. Ali o Sol fica baixinho no horizonte e às vezes some atrás das montanhas por alguns dias.'
  }
};

/* ---------- Níveis ---------- */
window.LEVELS = {
  cadete:     { id: 'cadete',     name: 'Cadete',          ages: '7 a 9 anos',   sols: 8,  drain: 0.85, hints: true,  forecastTrust: 1.0,  doseLimit: 50, sciGoal: 70 },
  comandante: { id: 'comandante', name: 'Comandante',      ages: '10 a 12 anos', sols: 12, drain: 1.0,  hints: false, forecastTrust: 0.85, doseLimit: 50, sciGoal: 130 },
  diretor:    { id: 'diretor',    name: 'Diretor de Voo',  ages: 'adolescentes, famílias e turmas', sols: 15, drain: 1.12, hints: false, forecastTrust: 0.7, doseLimit: 50, sciGoal: 170 }
};

/* ---------- Sistemas que recebem energia ---------- */
window.SYSTEMS = [
  { id: 'life',   name: 'Suporte de vida', short: 'Ar e água',  icon: 'air',    color: '#4cc3ff',
    help: 'Limpa o ar e recicla a água. Com 3 células fica estável.' },
  { id: 'food',   name: 'Estufa',          short: 'Comida',     icon: 'leaf',   color: '#5bd48a',
    help: 'Cada célula faz as plantas crescerem. Plantas também soltam um pouco de oxigênio.' },
  { id: 'shield', name: 'Escudo d’água',   short: 'Radiação',   icon: 'shield', color: '#ffc94d',
    help: 'Bombeia água para as paredes do abrigo. Água bloqueia radiação. Cada célula corta 30% da dose.' },
  { id: 'sci',    name: 'Ciência e rádio', short: 'Descobertas', icon: 'flask', color: '#b392ff',
    help: 'Liga os experimentos e a antena que envia os resultados para a Terra.' }
];

/* ---------- Glossário (explica termos difíceis no contexto) ---------- */
window.GLOSSARY = {
  sol: 'Sol é o nome de um dia em Marte. Ele dura 24 horas e 39 minutos, um pouquinho mais que o dia na Terra.',
  radiacao: 'Radiação é energia invisível que vem do Sol e do espaço. Em excesso, ela pode machucar as células do corpo. A Terra nos protege com o ar e o campo magnético; a Lua e Marte quase não protegem.',
  msv: 'Milisievert (mSv) mede quanta radiação o corpo recebeu. Um raio-X do peito dá cerca de 0,1 mSv. Na Terra, cada pessoa recebe uns 3 mSv por ano da natureza.',
  cme: 'Ejeção de massa coronal (CME) é uma nuvem gigante de gás quente que o Sol arremessa no espaço. As mais rápidas podem trazer tempestades de partículas.',
  sep: 'Tempestade de partículas solares: prótons muito rápidos lançados pelo Sol. É o tipo de radiação mais perigoso para quem está fora da Terra.',
  regolito: 'Regolito é a poeira e as pedrinhas soltas que cobrem o chão da Lua e de Marte.',
  atraso: 'Atraso de comunicação: mensagens de rádio viajam na velocidade da luz. Da Lua até a Terra levam pouco mais de 1 segundo. De Marte, levam de 3 a 22 minutos, dependendo de onde os planetas estão.',
  microgravidade: 'Microgravidade é quando quase não sentimos o peso, como na Estação Espacial. Na Lua e em Marte existe gravidade, mas bem menor que na Terra.',
  bateria: 'A bateria guarda a energia que sobra. Ela tem tamanho limitado: o que passar do limite é desperdiçado.',
  eva: 'EVA (atividade extraveicular) é quando o astronauta sai da base vestindo o traje espacial.'
};

/* ---------- Mensagens da LIA, a robô assistente ---------- */
window.LIA_TIPS = {
  plan: [
    'Dica: suporte de vida com 3 células mantém o ar estável. Menos que isso, o ar vai baixando.',
    'Sobrou energia? Ela vai para a bateria. Mas a bateria tem limite!',
    'Se a previsão do Sol estiver vermelha, pense em ligar o escudo d’água.',
    'A estufa demora para dar resultado. Planeje a comida com antecedência.'
  ],
  lowLife: 'Atenção: o ar e a água estão baixos. Coloque mais células no suporte de vida.',
  lowFood: 'A despensa está ficando vazia. A estufa precisa de energia.',
  lowBattery: 'A bateria está quase vazia. Se vier uma noite ou tempestade, vamos ficar sem reserva.',
  highDose: 'A tripulação já recebeu bastante radiação. Proteja-se nas próximas tempestades.'
};

/* ---------- Eventos ----------
   fx: l = ar e água, f = comida, e = células na bateria, s = ciência,
       d = dose em mSv (radiação de evento, reduzida pelo escudo),
       solar = { mult, sols } muda a produção de energia dos próximos sols
   ask: true  -> opção "Perguntar à Terra": o custo depende do atraso de comunicação real
   chance: { p, fail: {...}, failNote } -> resultado incerto
   Termos entre [[ ]] viram botões do glossário: [[texto|chave]]
*/
window.EVENTS = [
  {
    id: 'first-day', sites: ['mars', 'moon'], fixedSol: 1, art: '🚀',
    title: 'Primeiro dia na base',
    text: 'O módulo de pouso abriu as portas. Antes de tudo, vocês precisam decidir o que montar primeiro.',
    options: [
      { label: 'Montar a estufa', fx: { f: 10, s: 0 }, note: 'Comida garantida, mas a ciência começa mais tarde.' },
      { label: 'Montar a antena e os experimentos', fx: { f: -4, s: 12 }, note: 'A Terra já recebe dados, mas vocês comem das rações.' }
    ],
    fact: { text: 'Missões reais planejam a ordem de montagem com meses de antecedência. Cada hora de trabalho do astronauta é um recurso tão precioso quanto o oxigênio.', src: 'hrp' }
  },
  {
    id: 'dust-storm', sites: ['mars'], art: '🌪️', weight: 3, minSol: 2,
    title: 'Tempestade de poeira chegando',
    text: 'O satélite avisou: uma tempestade de poeira vai cobrir o céu. A luz do Sol vai cair pela metade nos próximos 2 sols.',
    options: [
      { label: 'Guardar energia agora', fx: { s: -8, e: 3 }, note: 'Pausam a ciência hoje para encher a bateria.' },
      { label: 'Fazer uma [[EVA|eva]] e prender lonas nos painéis', fx: { l: -6, d: 2, solar: { mult: 0.75, sols: 2 } }, note: 'Os painéis perdem menos, mas a saída gasta ar e dá um pouco de radiação.' },
      { label: 'Seguir normalmente', fx: { solar: { mult: 0.5, sols: 2 } }, note: 'Nada muda hoje. Amanhã a energia cai pela metade.' }
    ],
    fact: { text: 'Em 2018, uma tempestade de poeira cobriu Marte inteiro. O rover Opportunity, movido a energia solar, ficou sem luz e parou de funcionar depois de 14 anos de missão.', src: 'oppy' }
  },
  {
    id: 'dusty-panels', sites: ['mars'], art: '🟫', weight: 2, minSol: 3,
    title: 'Painéis empoeirados',
    text: 'Uma camada fina de poeira avermelhada cobriu os painéis solares. Eles estão gerando menos energia.',
    options: [
      { label: 'Sair e limpar', fx: { l: -5, d: 1 }, note: 'A energia volta ao normal, mas a [[EVA|eva]] custa ar.' },
      { label: 'Esperar um redemoinho de vento limpar', fx: { solar: { mult: 0.8, sols: 3 } }, chance: { p: 0.5, fail: { solar: { mult: 0.7, sols: 4 } }, failNote: 'O vento não veio. A poeira continuou.' }, note: 'Às vezes o vento limpa sozinho. Às vezes não.' }
    ],
    fact: { text: 'Os rovers Spirit e Opportunity ganharam anos extras de vida graças a redemoinhos de vento que limparam seus painéis. Os cientistas chamavam esses momentos de "eventos de limpeza".', src: 'oppy' }
  },
  {
    id: 'moxie', sites: ['mars'], art: '🫧', weight: 2, minSol: 2,
    title: 'Fábrica de oxigênio',
    text: 'Vocês podem ligar o MOXIE, uma máquina que transforma o gás carbônico do ar de Marte em oxigênio. Mas ele consome muita energia.',
    options: [
      { label: 'Ligar o MOXIE', fx: { e: -3, l: 14 }, note: 'Muito ar novo, mas a bateria perde 3 células.' },
      { label: 'Deixar desligado', fx: { s: 4 }, note: 'Energia poupada vai para pequenos testes.' }
    ],
    fact: { text: 'O MOXIE viajou no rover Perseverance e fabricou 122 gramas de oxigênio em Marte entre 2021 e 2023, o suficiente para um cachorro pequeno respirar por cerca de 10 horas.', src: 'moxie' }
  },
  {
    id: 'air-leak', sites: ['mars', 'moon'], art: '💨', weight: 2, minSol: 3,
    title: 'Vazamento de ar!',
    text: 'Um alarme tocou: uma vedação do módulo está deixando o ar escapar devagar. Cada minuto conta.',
    options: [
      { label: 'Consertar sozinhos agora', fx: { l: -4 }, chance: { p: 0.6, fail: { l: -16 }, failNote: 'O primeiro remendo não segurou. Vocês perderam bastante ar até acertar.' }, note: 'Rápido, mas vocês nunca fizeram isso antes.' },
      { label: 'Perguntar à Terra', ask: true, fx: { s: 3 }, note: 'Os engenheiros sabem a solução. O problema é o tempo que a mensagem leva para ir e voltar.' },
      { label: 'Fechar aquele módulo', fx: { f: -10 }, note: 'Ar salvo, mas a despensa ficava lá dentro.' }
    ],
    fact: { text: 'Por causa do [[atraso de comunicação|atraso]], astronautas em Marte precisarão resolver emergências sozinhos. Na Lua, a resposta da Terra chega em menos de 3 segundos.', src: 'hrp' }
  },
  {
    id: 'zinnia-mold', sites: ['mars', 'moon'], art: '🌱', weight: 2, minSol: 3,
    title: 'Mofo na estufa',
    text: 'Algumas folhas estão com manchas brancas de mofo. A umidade está alta demais.',
    options: [
      { label: 'Ligar ventiladores extras', fx: { e: -2 }, note: 'As plantas se salvam, mas gastam energia.' },
      { label: 'Arrancar as plantas doentes', fx: { f: -12 }, note: 'Sem gasto de energia, mas a colheita diminui.' }
    ],
    fact: { text: 'Em 2016, flores de zínia ficaram com mofo na Estação Espacial. O astronauta Scott Kelly cuidou delas como um jardineiro, ajustando a água e o ar, e elas floresceram.', src: 'hrp' }
  },
  {
    id: 'ice', sites: ['mars', 'moon'], art: '🧊', weight: 2, minSol: 2,
    title: 'Gelo descoberto',
    text: 'O radar encontrou gelo enterrado a algumas centenas de metros da base. Gelo vira água, e água vira oxigênio.',
    options: [
      { label: 'Ir buscar com o rover', fx: { e: -2, l: 12, d: 1 }, note: 'Muito ar e água extras, mas o rover gasta bateria.' },
      { label: 'Marcar no mapa para depois', fx: { s: 6 }, note: 'Os dados do radar já são ciência valiosa.' }
    ],
    fact: { text: 'O polo sul da Lua tem gelo escondido em crateras que nunca recebem luz do Sol. É um dos principais motivos de o programa Artemis querer pousar lá.', src: 'artemis' }
  },
  {
    id: 'regolith-plants', sites: ['moon', 'mars'], art: '🪴', weight: 1, minSol: 4,
    title: 'Plantar no solo local?',
    text: 'Uma cientista na Terra pediu um teste: plantar sementes direto no [[regolito|regolito]] em vez da terra trazida da Terra.',
    options: [
      { label: 'Fazer o experimento', fx: { s: 14, f: -5 }, note: 'Descoberta importante, mas parte da estufa fica ocupada.' },
      { label: 'Usar a estufa só para comida', fx: { f: 6 }, note: 'Comida garantida, nenhuma descoberta.' }
    ],
    fact: { text: 'Em 2022, cientistas plantaram a planta Arabidopsis em amostras de solo trazidas pelas missões Apollo. Ela cresceu, mas ficou estressada. Solo lunar ainda precisa de ajuda para virar horta.', src: 'regolith' }
  },
  {
    id: 'sample', sites: ['mars'], art: '🪨', weight: 2, minSol: 3,
    title: 'Pedra com manchas estranhas',
    text: 'Perto da base há uma rocha com manchinhas que parecem pele de leopardo. Pode ser pista de vida antiga!',
    options: [
      { label: 'Fazer uma [[EVA|eva]] longa para coletar', fx: { s: 22, l: -7, d: 2 }, note: 'Grande descoberta, mas a caminhada gasta ar e expõe à radiação.' },
      { label: 'Fotografar com o drone', fx: { s: 8, e: -1 }, note: 'Menos ciência, mas ninguém sai da base.' }
    ],
    fact: { text: 'Em 2024, o Perseverance encontrou na Cratera Jezero uma rocha com manchas parecidas, apelidada de Cheyava Falls. Os cientistas estudam se elas podem ter sido feitas por micróbios antigos.', src: 'perse' }
  },
  {
    id: 'shadow', sites: ['moon'], art: '🌑', weight: 0, minSol: 2,
    title: 'A sombra está chegando',
    text: 'O Sol vai se esconder atrás das montanhas da cratera. Por 2 dias, os painéis quase não vão gerar energia.',
    options: [
      { label: 'Encher a bateria hoje', fx: { s: -6, e: 3 }, note: 'Pausam a ciência para guardar energia.' },
      { label: 'Ligar o reator a fissão de emergência', fx: { s: -2, solar: { mult: 0.6, sols: 2 } }, note: 'A noite fica menos escura, mas o reator ainda é pequeno.' },
      { label: 'Confiar na bateria que já tem', fx: {}, note: 'Arriscado se a bateria estiver baixa.' }
    ],
    fact: { text: 'No polo sul da Lua há picos que recebem luz quase o tempo todo, mas ainda assim existem períodos de sombra. Por isso a NASA estuda pequenos reatores nucleares para manter as bases ligadas no escuro.', src: 'moon' }
  },
  {
    id: 'micrometeor', sites: ['moon'], art: '☄️', weight: 2, minSol: 2,
    title: 'Micrometeorito!',
    text: 'Uma pedrinha do tamanho de um grão de areia, viajando mais rápido que uma bala, furou um painel solar.',
    options: [
      { label: 'Sair e trocar o painel', fx: { l: -5, d: 2 }, note: 'Tudo volta ao normal, mas a [[EVA|eva]] tem custo.' },
      { label: 'Deixar como está', fx: { solar: { mult: 0.8, sols: 4 } }, note: 'Os painéis geram 20% menos por alguns dias.' }
    ],
    fact: { text: 'Sem atmosfera para queimá-los, os micrometeoritos atingem a superfície da Lua o tempo todo. Habitats lunares precisam de camadas de proteção, às vezes feitas do próprio regolito.', src: 'moon' }
  },
  {
    id: 'school-call', sites: ['mars', 'moon'], art: '📡', weight: 2, minSol: 2,
    title: 'Chamada com uma escola',
    text: 'Uma escola no Brasil quer conversar com a tripulação. As crianças prepararam perguntas!',
    options: [
      { label: 'Conversa ao vivo', live: true, fx: { s: 10, e: -1 }, note: 'Só funciona se a resposta chegar rápido.' },
      { label: 'Gravar um vídeo e enviar', fx: { s: 6 }, note: 'Funciona de qualquer lugar.' }
    ],
    fact: { text: 'Astronautas da Estação Espacial conversam ao vivo com escolas pelo rádio. De Marte isso será impossível: cada pergunta levaria vários minutos para chegar.', src: 'hrp' }
  },
  {
    id: 'exercise', sites: ['mars', 'moon'], art: '🏋️', weight: 2, minSol: 3,
    title: 'Hora do treino',
    text: 'Com pouca gravidade, ossos e músculos enfraquecem. O médico na Terra pediu duas horas de exercício hoje.',
    options: [
      { label: 'Treinar', fx: { f: -6, s: -3 }, note: 'Exercício gasta calorias e tempo de pesquisa.' },
      { label: 'Pular o treino', fx: { s: 6 }, later: { s: -10 }, note: 'Mais ciência hoje, mas a equipe fica fraca depois.' }
    ],
    fact: { text: 'No espaço, astronautas podem perder de 1% a 1,5% da massa dos ossos por mês se não se exercitarem. O Estudo dos Gêmeos da NASA comparou o astronauta Scott Kelly com seu irmão gêmeo na Terra para entender essas mudanças.', src: 'twins' }
  },
  {
    id: 'cold-night', sites: ['mars'], art: '🥶', weight: 2, minSol: 2,
    title: 'Noite muito fria',
    text: 'A previsão diz −90 °C esta noite. As baterias não gostam de frio.',
    options: [
      { label: 'Ligar aquecedores', fx: { e: -2 }, note: 'A bateria fica protegida, mas gasta energia.' },
      { label: 'Arriscar sem aquecer', fx: {}, chance: { p: 0.5, fail: { cap: -2 }, failNote: 'O frio estragou parte da bateria. Ela agora guarda 2 células a menos.' }, note: 'Pode dar certo. Ou não.' }
    ],
    fact: { text: 'A temperatura média em Marte é de cerca de −60 °C. Rovers como o Curiosity e o Perseverance usam aquecedores para manter peças e baterias funcionando à noite.', src: 'mars' }
  },
  {
    id: 'cargo', sites: ['mars', 'moon'], art: '📦', weight: 1, minSol: 4,
    title: 'Nave de carga a caminho',
    text: 'Uma nave de carga pode trazer só um tipo de suprimento. O que vocês pedem?',
    options: [
      { label: 'Comida', fx: { f: 18 }, note: 'Despensa cheia.' },
      { label: 'Uma bateria maior', fx: { cap: 3, e: 2 }, note: 'Guardam mais energia daqui para frente.' },
      { label: 'Tanques de água', fx: { l: 12 }, note: 'Mais água para beber e para o escudo.' }
    ],
    fact: { text: 'Cada quilo levado ao espaço custa muito caro. Planejadores de missão escolhem com cuidado o que vai em cada nave, porque não cabe tudo.', src: 'artemis' }
  },
  {
    id: 'rover-stuck', sites: ['mars', 'moon'], art: '🛞', weight: 1, minSol: 3,
    title: 'Rover atolado',
    text: 'O rover de exploração ficou preso na areia fofa a 2 km da base.',
    options: [
      { label: 'Ir a pé buscar', fx: { l: -8, d: 1, s: 6 }, note: 'Recuperam o rover e as amostras, mas gastam ar.' },
      { label: 'Pedir para a Terra dirigir de lá', ask: true, fx: { s: 4 }, note: 'Os pilotos na Terra são ótimos. Mas cada comando demora para chegar.' }
    ],
    fact: { text: 'Os rovers em Marte não são dirigidos com controle remoto em tempo real. Por causa do atraso, os pilotos enviam um plano de manobras por dia e o rover executa sozinho.', src: 'perse' }
  }
];

/* ---------- Tempestade solar (gerada a partir de dados reais DONKI) ---------- */
window.STORM_EVENT = {
  id: 'sep', art: '☀️',
  title: 'Tempestade de partículas solares!',
  options: [
    { label: 'Todos para o abrigo', shelter: true, fx: { s: -10 }, note: 'Dose bem menor, mas ninguém trabalha hoje.' },
    { label: 'Terminar o experimento lá fora', fx: { s: 14 }, note: 'Ciência garantida, radiação total.' }
  ],
  fact: { text: 'Em 20 de maio de 2024, uma tempestade solar atingiu Marte. O rover Curiosity mediu uma dose de radiação parecida com a de 30 raios-X do peito em um único dia. Em agosto de 1972, entre as missões Apollo 16 e 17, outra tempestade enorme atingiu a Lua. Ainda bem que não havia ninguém lá.', src: 'may2024' }
};

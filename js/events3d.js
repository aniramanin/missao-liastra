/* =========================================================================
   Missão Liastra · eventos do jogo 3D
   fx: l = ar e água, f = comida, e = bateria (células), s = ciência, d = dose (mSv)
   do: comportamento especial tratado em game3d.js
   task: id do ponto do mapa onde o jogador precisa ir (segurar E)
   ========================================================================= */
(function () {
  SOURCES.iss = { label: 'NASA · Estação Espacial Internacional', url: 'https://www.nasa.gov/international-space-station/' };

  SITES.orbit = {
    id: 'orbit', name: 'Órbita', place: 'Estação orbital · 420 km de altitude',
    placeNote: 'inspirada na Estação Espacial Internacional', solName: 'dia',
    dayLength: 'uma volta na Terra a cada 92 minutos', gravity: 'microgravidade (flutuando)',
    gravityNote: 'Tudo flutua: astronautas, gotas de água e parafusos.',
    temp: 'de −150 °C na sombra a +120 °C no Sol, do lado de fora',
    dailyDose: 0.6,   // mSv/dia · tripulações da ISS recebem cerca de 0,4 a 0,9 mSv por dia
    stormDose: 10, sunBase: 10, hasDust: false, hasShadow: false, accent: '#4cc3ff',
    intro: 'Você está a 420 km de altura, dando uma volta na Terra a cada 92 minutos. Aqui não há gravidade para segurar você: use os corrimões e flutue entre os módulos.'
  };

  const F = (id) => (EVENTS.find((e) => e.id === id) || {}).fact;

  window.EVENTS3D = [
    /* ------------ Marte e Lua ------------ */
    { id: 'air-leak', sites: ['mars', 'moon'], art: '💨', minSol: 1, weight: 3,
      title: 'Vazamento de ar!',
      text: 'Um alarme tocou: uma vedação está deixando o ar escapar. Enquanto o vazamento continuar, o ar e a água da base vão baixando.',
      options: [
        { label: 'Consertar agora', do: 'leak-fix', note: 'Siga o marcador vermelho e segure E no vazamento. Corra!' },
        { label: 'Perguntar à Terra', do: 'leak-ask', ask: true, note: 'Os engenheiros sabem consertar. Mas a resposta demora o tempo do atraso de comunicação.' },
        { label: 'Fechar aquele módulo', do: 'leak-seal', fx: { f: -10 }, note: 'O ar para de vazar, mas a comida guardada lá se perde.' }
      ], fact: F('air-leak') },
    { id: 'dust-storm', sites: ['mars'], art: '🌪️', minSol: 1, weight: 3,
      title: 'Tempestade de poeira chegando',
      text: 'O satélite avisou: uma tempestade de poeira vai escurecer o céu. Os painéis solares vão gerar bem menos energia até amanhã.',
      options: [
        { label: 'Guardar energia agora', do: 'dust', fx: { s: -8, e: 3 }, note: 'Pausam a ciência para encher a bateria antes do escuro.' },
        { label: 'Sair e prender lonas nos painéis', do: 'dust-tarp', note: 'Vá até os painéis lá fora. Eles perdem menos, mas a saída gasta o traje e dá radiação.' },
        { label: 'Seguir normalmente', do: 'dust', note: 'Nada muda agora. A energia cai pela metade.' }
      ], fact: F('dust-storm') },
    { id: 'dusty-panels', sites: ['mars'], art: '🟫', minSol: 2, weight: 2,
      title: 'Painéis empoeirados',
      text: 'Uma camada fina de poeira cobriu os painéis. Eles estão gerando 25% menos energia.',
      options: [
        { label: 'Sair para limpar', do: 'clean', note: 'Vá até os painéis e segure E. Gasta traje e um pouco de radiação.' },
        { label: 'Esperar o vento limpar', do: 'clean-wait', chance: { p: 0.5 }, note: 'Às vezes um redemoinho limpa sozinho. Às vezes não.' }
      ], fact: F('dusty-panels') },
    { id: 'moxie', sites: ['mars'], art: '🫧', minSol: 1, weight: 2,
      title: 'Fábrica de oxigênio',
      text: 'Vocês podem ligar o MOXIE, uma máquina que transforma o gás carbônico do ar de Marte em oxigênio. Mas ela consome muita energia.',
      options: [
        { label: 'Ligar o MOXIE', fx: { e: -3, l: 14 }, note: 'Muito ar novo, mas a bateria perde 3 células.' },
        { label: 'Deixar desligado', fx: { s: 4 }, note: 'A energia poupada vai para pequenos testes.' }
      ], fact: F('moxie') },
    { id: 'mold', sites: ['mars', 'moon'], art: '🌱', minSol: 1, weight: 2,
      title: 'Mofo na estufa',
      text: 'Algumas folhas estão com manchas brancas de mofo. A umidade está alta demais.',
      options: [
        { label: 'Ligar ventiladores extras', fx: { e: -2 }, note: 'As plantas se salvam, mas gastam energia.' },
        { label: 'Arrancar as plantas doentes', fx: { f: -12 }, note: 'Sem gastar energia, mas a colheita diminui.' }
      ], fact: F('zinnia-mold') },
    { id: 'ice', sites: ['mars', 'moon'], art: '🧊', minSol: 1, weight: 2,
      title: 'Gelo descoberto',
      text: 'O radar encontrou gelo enterrado perto da base. Gelo vira água, e água vira oxigênio.',
      options: [
        { label: 'Ir perfurar o gelo', do: 'task', task: 'drill', note: 'Vá até a perfuratriz lá fora. Dá muita água, mas gasta bateria e traje.' },
        { label: 'Marcar no mapa para depois', fx: { s: 6 }, note: 'Os dados do radar já são ciência.' }
      ], fact: F('ice') },
    { id: 'sample', sites: ['mars'], art: '🪨', minSol: 1, weight: 2,
      title: 'Pedra com manchas estranhas',
      text: 'O drone fotografou uma rocha com manchinhas que parecem pele de leopardo, longe da base. Pode ser pista de vida antiga!',
      options: [
        { label: 'Ir buscar com o rover', do: 'task', task: 'sample', note: 'Longe demais para ir a pé. Pegue o rover, colete e traga para o laboratório.' },
        { label: 'Só fotografar com o drone', fx: { s: 8, e: -1 }, note: 'Menos ciência, mas ninguém sai da base.' }
      ], fact: F('sample') },
    { id: 'crater-ice', sites: ['moon'], art: '🌑', minSol: 1, weight: 2,
      title: 'Gelo na cratera escura',
      text: 'A cratera ao lado nunca recebe luz do Sol. O radar diz que há gelo antigo lá dentro, guardado há bilhões de anos.',
      options: [
        { label: 'Ir buscar com o rover', do: 'task', task: 'sample', note: 'Dirija até a cratera, colete e traga para o laboratório.' },
        { label: 'Estudar de longe', fx: { s: 7 }, note: 'Menos ciência, sem riscos.' }
      ], fact: F('ice') },
    { id: 'meteor', sites: ['moon'], art: '☄️', minSol: 1, weight: 2,
      title: 'Micrometeorito!',
      text: 'Uma pedrinha mais rápida que uma bala furou um painel solar. Ele está gerando 25% menos energia.',
      options: [
        { label: 'Sair e trocar o painel', do: 'clean', note: 'Vá até os painéis lá fora e segure E.' },
        { label: 'Deixar como está', do: 'penalty', note: 'A energia fica 25% menor até o fim da missão.' }
      ], fact: F('micrometeor') },
    { id: 'school-call', sites: ['mars', 'moon', 'orbit'], art: '📡', minSol: 1, weight: 2,
      title: 'Chamada com uma escola',
      text: 'Uma escola no Brasil quer conversar com a tripulação. As crianças prepararam perguntas!',
      options: [
        { label: 'Conversa ao vivo', do: 'school-live', note: 'Vá até o rádio. Só funciona se a resposta chegar rápido.' },
        { label: 'Gravar um vídeo', fx: { s: 6 }, note: 'Funciona de qualquer lugar.' }
      ], fact: F('school-call') },
    { id: 'exercise', sites: ['mars', 'moon'], art: '🏋️', minSol: 1, weight: 1,
      title: 'Hora do treino',
      text: 'Com pouca gravidade, ossos e músculos enfraquecem. O médico pediu duas horas de exercício hoje.',
      options: [
        { label: 'Treinar', fx: { f: -6, s: -3 }, note: 'Exercício gasta calorias e tempo de pesquisa.' },
        { label: 'Pular o treino', fx: { s: 6 }, later: { s: -10 }, note: 'Mais ciência hoje, menos amanhã: a equipe fica fraca.' }
      ], fact: F('exercise') },
    { id: 'cold-night', sites: ['mars'], art: '🥶', minSol: 1, weight: 2,
      title: 'Noite muito fria',
      text: 'A previsão diz −90 °C esta noite. As baterias não gostam de frio.',
      options: [
        { label: 'Ligar aquecedores', fx: { e: -2 }, note: 'A bateria fica protegida, mas gasta energia.' },
        { label: 'Arriscar sem aquecer', chance: { p: 0.5, fail: { cap: -2 }, failNote: 'O frio estragou parte da bateria. Ela agora guarda 2 células a menos.' }, fx: {}, note: 'Pode dar certo. Ou não.' }
      ], fact: F('cold-night') },
    { id: 'cargo', sites: ['mars', 'moon', 'orbit'], art: '📦', minSol: 2, weight: 1,
      title: 'Nave de carga a caminho',
      text: 'Uma nave de carga pode trazer só um tipo de suprimento. O que vocês pedem?',
      options: [
        { label: 'Comida', fx: { f: 18 }, note: 'Despensa cheia.' },
        { label: 'Uma bateria maior', fx: { cap: 3, e: 2 }, note: 'Guardam mais energia daqui para frente.' },
        { label: 'Tanques de água', fx: { l: 12 }, note: 'Mais água para beber e para o escudo.' }
      ], fact: F('cargo') },
    { id: 'regolith', sites: ['moon', 'mars'], art: '🪴', minSol: 2, weight: 1,
      title: 'Plantar no solo local?',
      text: 'Uma cientista na Terra pediu um teste: plantar sementes direto no regolito, a poeira do chão.',
      options: [
        { label: 'Fazer o experimento', fx: { s: 14, f: -5 }, note: 'Descoberta importante, mas parte da estufa fica ocupada.' },
        { label: 'Usar a estufa só para comida', fx: { f: 6 }, note: 'Comida garantida, nenhuma descoberta.' }
      ], fact: F('regolith-plants') },

    /* ------------ Órbita ------------ */
    { id: 'co2', sites: ['orbit'], art: '😮‍💨', minSol: 1, weight: 3,
      title: 'Filtro de CO₂ parou',
      text: 'A máquina que tira o gás carbônico do ar quebrou. Se o CO₂ subir demais, a tripulação fica com dor de cabeça e o ar fica ruim.',
      options: [
        { label: 'Consertar agora', do: 'leak-fix', note: 'Siga o marcador e segure E no filtro.' },
        { label: 'Perguntar à Terra', do: 'leak-ask', ask: true, note: 'Aqui a resposta chega em menos de 1 segundo, por satélites de relé.' }
      ], fact: { text: 'O ar da ISS é limpo por máquinas que retiram o gás carbônico que os astronautas expiram. Quando o CO₂ sobe, astronautas relatam dor de cabeça e cansaço. Na órbita baixa, a ajuda da Terra chega quase na hora.', src: 'iss' } },
    { id: 'debris', sites: ['orbit'], art: '🛰️', minSol: 1, weight: 2,
      title: 'Lixo espacial se aproximando',
      text: 'O radar em Terra detectou um pedaço de satélite velho que vai passar perto da estação. Ele viaja a mais de 25 mil km/h.',
      options: [
        { label: 'Fazer uma manobra de desvio', fx: { e: -3, s: -4 }, note: 'Os motores empurram a estação para longe. Gasta energia e interrompe experimentos.' },
        { label: 'Todos para a cápsula de resgate', do: 'task', task: 'capsule', deadline: 40, note: 'Flutue até a cápsula em 40 segundos. Se algo bater, vocês podem voltar para a Terra.' },
        { label: 'Arriscar', chance: { p: 0.85, fail: { l: -25 }, failNote: 'Um fragmento pequeno atingiu um radiador. Vocês perderam ar até isolar o problema.' }, fx: {}, note: 'Provavelmente vai passar longe.' }
      ], fact: { text: 'A ISS já fez dezenas de manobras para desviar de lixo espacial. Em novembro de 2021, os astronautas se abrigaram nas naves acopladas por causa de uma nuvem de destroços de um satélite destruído.', src: 'iss' } },
    { id: 'water', sites: ['orbit'], art: '💧', minSol: 1, weight: 2,
      title: 'Hora de reciclar a água',
      text: 'O tanque de água limpa está baixando. O reciclador transforma suor, vapor e até urina em água potável.',
      options: [
        { label: 'Ligar o reciclador', do: 'task', task: 'water', note: 'Vá até o Nó 3 e segure E. Gasta um pouco de energia.' },
        { label: 'Usar a reserva', fx: { l: -6 }, note: 'Sem gastar energia agora, mas a reserva diminui.' }
      ], fact: { text: 'O sistema de suporte de vida da ISS recupera cerca de 98% da água a bordo, incluindo suor e urina. A NASA anunciou essa marca em 2023. Em Marte, reciclar assim será obrigatório.', src: 'iss' } },
    { id: 'veggie', sites: ['orbit'], art: '🥬', minSol: 1, weight: 2,
      title: 'Alface pronta no Veggie',
      text: 'As alfaces da estufa espacial cresceram. Colher agora dá comida fresca, mas os cientistas queriam estudar as plantas por mais tempo.',
      options: [
        { label: 'Colher e comer', do: 'task', task: 'veggie', note: 'Vá ao laboratório europeu e segure E.' },
        { label: 'Deixar crescer para estudo', fx: { s: 8 }, note: 'Mais ciência, nada de salada.' }
      ], fact: { text: 'Em 2015, astronautas da ISS comeram pela primeira vez uma alface cultivada no espaço, uma alface roxa, no experimento Veggie. Plantas também ajudam a tripulação a se sentir em casa.', src: 'iss' } },
    { id: 'hurricane', sites: ['orbit'], art: '🌀', minSol: 1, weight: 2,
      title: 'Furacão no Atlântico',
      text: 'Os meteorologistas pediram fotos de um furacão que está se formando. A Cúpula, com suas 7 janelas, é o melhor lugar para fotografar.',
      options: [
        { label: 'Ir até a Cúpula', do: 'task', task: 'cupola', note: 'Flutue até a Cúpula (embaixo do Nó 3) e segure E.' },
        { label: 'Usar a câmera automática', fx: { s: 4, e: -1 }, note: 'Fotos piores, sem sair do lugar.' }
      ], fact: { text: 'A Cúpula foi instalada na ISS em 2010 e tem 7 janelas. Dali os astronautas fotografam furacões, auroras e cidades à noite. A estação dá uma volta na Terra a cada 92 minutos: são 16 nasceres do Sol por dia.', src: 'iss' } },
    { id: 'joint', sites: ['orbit'], art: '⚙️', minSol: 1, weight: 2,
      title: 'Junta dos painéis travada',
      text: 'A junta que gira os painéis solares para seguir o Sol travou. Eles estão gerando 30% menos energia.',
      options: [
        { label: 'Fazer uma caminhada espacial', do: 'eva-joint', note: 'Saia pela escotilha de EVA e flutue até a treliça. Gasta traje e dá mais radiação.' },
        { label: 'Conviver com menos energia', do: 'penalty', note: 'A energia fica 30% menor até o fim da missão.' }
      ], fact: { text: 'Em 2007, uma das juntas rotativas dos painéis da ISS começou a travar por causa de limalha de metal. Os astronautas fizeram caminhadas espaciais para limpar e lubrificar a peça.', src: 'iss' } },
    { id: 'exercise-iss', sites: ['orbit'], art: '🏃', minSol: 1, weight: 1,
      title: 'Treino obrigatório',
      text: 'Sem gravidade, ossos e músculos enfraquecem rápido. O médico quer ver todos na esteira hoje.',
      options: [
        { label: 'Ir para a esteira', do: 'task', task: 'treadmill', note: 'Vá ao Nó 3 e segure E. Gasta calorias.' },
        { label: 'Pular o treino', fx: { s: 6 }, later: { s: -10 }, note: 'Mais ciência hoje, menos amanhã.' }
      ], fact: { text: 'Astronautas na ISS se exercitam cerca de 2 horas por dia, em esteira, bicicleta e um aparelho de musculação. Sem isso, podem perder de 1% a 1,5% da massa dos ossos por mês.', src: 'twins' } }
  ];

  window.FACTS3D = {
    saa: { text: 'A Anomalia Magnética do Atlântico Sul é uma região onde o campo magnético da Terra é mais fraco. Ela fica sobre a América do Sul e o Oceano Atlântico, incluindo o Brasil. Quando a ISS passa por ali, os detectores medem mais radiação.', src: 'iss' },
    gravityMoon: 'Na Lua a gravidade é 1/6 da Terra: você pula bem mais alto e cai devagar.',
    gravityMars: 'Em Marte a gravidade é 38% da Terra: você pula mais que o dobro da altura.',
    float: 'Na órbita tudo está em queda livre ao redor da Terra. Por isso você flutua.',
    marsBlue: 'O pôr do sol em Marte é azulado! A poeira fina espalha a luz azul perto do Sol.',
    orbitSun: 'A estação dá uma volta na Terra a cada 92 minutos. Na metade da volta, a Terra esconde o Sol e os painéis param de gerar energia.',
    moonPole: 'No polo sul da Lua o Sol fica rente ao horizonte e dá a volta no céu. As sombras são compridíssimas.'
  };
})();

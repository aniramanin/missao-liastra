/* =========================================================================
   Aerospace Innovation Center · aprendizagem
   Quiz de fim de missão (3 perguntas: 2 do mundo + 1 geral) e imagem do Sol ao vivo.
   ========================================================================= */
(function () {
  const Q = (q, o, a, why) => ({ q, o, a, why });
  window.QUIZ = {
    geral: [
      Q(L('Por que o abrigo de radiação tem paredes cheias de água?', 'Why does the radiation shelter have walls full of water?'),
        [L('A água freia parte das partículas da radiação', 'Water stops part of the radiation particles'), L('A água deixa o abrigo mais quente', 'Water makes the shelter warmer'), L('A água gera energia elétrica', 'Water makes electricity')], 0,
        L('Água e regolito têm muitos átomos leves, que freiam as partículas. Por isso as futuras bases devem usar água e solo como escudo.', 'Water and regolith have many light atoms that slow particles down. That is why future bases will use water and soil as shields.')),
      Q(L('A bateria está cheia e ainda sobra energia do Sol. O que acontece com a sobra?', 'The battery is full and there is still spare solar energy. What happens to it?'),
        [L('Vira comida automaticamente', 'It turns into food automatically'), L('É desperdiçada', 'It is wasted'), L('É enviada para a Terra', 'It is sent to Earth')], 1,
        L('Sem lugar para guardar, a energia extra se perde. Planejar o uso é tão importante quanto produzir.', 'With nowhere to store it, the extra energy is lost. Planning its use matters as much as producing it.')),
      Q(L('Além de comida, o que as plantas da estufa devolvem para a base?', 'Besides food, what do greenhouse plants give back to the base?'),
        [L('Oxigênio', 'Oxygen'), L('Radiação', 'Radiation'), L('Combustível de foguete', 'Rocket fuel')], 0,
        L('Na fotossíntese as plantas usam luz, água e gás carbônico e soltam oxigênio. Uma estufa faz parte do suporte de vida.', 'In photosynthesis plants use light, water and carbon dioxide and release oxygen. A greenhouse is part of life support.'))
    ],
    mars: [
      Q(L('Quanto tempo uma mensagem pode levar de Marte até a Terra?', 'How long can a message take from Mars to Earth?'),
        [L('Cerca de 1 segundo', 'About 1 second'), L('De 3 a 22 minutos, conforme a posição dos planetas', '3 to 22 minutes, depending on where the planets are'), L('Um dia inteiro', 'A whole day')], 1,
        L('O rádio viaja na velocidade da luz, mas a distância entre Terra e Marte muda muito. Por isso a tripulação precisa decidir sozinha em emergências.', 'Radio travels at the speed of light, but the Earth–Mars distance changes a lot. So the crew must decide on its own in emergencies.')),
      Q(L('Quanto dura um sol, o dia de Marte?', 'How long is a sol, a day on Mars?'),
        [L('12 horas', '12 hours'), L('24 horas e 39 minutos', '24 hours and 39 minutes'), L('3 dias terrestres', '3 Earth days')], 1,
        L('Um sol é só um pouco mais longo que o nosso dia. Os planos das missões em Marte são feitos sol a sol.', 'A sol is only a little longer than our day. Mars missions are planned sol by sol.')),
      Q(L('O que uma tempestade de poeira faz com uma base movida a energia solar?', 'What does a dust storm do to a solar-powered base?'),
        [L('Aumenta a energia', 'It increases power'), L('Escurece o céu e reduz a energia dos painéis', 'It darkens the sky and cuts panel power'), L('Não muda nada', 'Nothing changes')], 1,
        L('Em 2018 uma tempestade cobriu Marte inteiro e o rover Opportunity ficou sem energia.', 'In 2018 a storm covered all of Mars and the Opportunity rover ran out of power.'))
    ],
    moon: [
      Q(L('Por que a radiação na superfície da Lua é maior que em Marte?', 'Why is radiation on the Moon’s surface higher than on Mars?'),
        [L('A Lua não tem atmosfera para bloquear parte dela', 'The Moon has no atmosphere to block part of it'), L('A Lua fica mais perto do Sol', 'The Moon is closer to the Sun'), L('Por causa do gelo da Lua', 'Because of the Moon’s ice')], 0,
        L('Marte tem uma atmosfera fina que segura parte da radiação. Na Lua não há nada, e a dose diária é cerca do dobro.', 'Mars has a thin atmosphere that blocks some radiation. The Moon has none, so the daily dose is about double.')),
      Q(L('Onde os cientistas procuram gelo de água na Lua?', 'Where do scientists look for water ice on the Moon?'),
        [L('No equador, ao meio-dia', 'At the equator, at noon'), L('Em crateras do polo sul que nunca recebem luz do Sol', 'In south pole craters that never get sunlight'), L('Em qualquer lugar da superfície', 'Anywhere on the surface')], 1,
        L('O fundo dessas crateras fica a mais de 200 °C negativos, e o gelo pode durar bilhões de anos ali.', 'The floors of those craters are below −200 °C, so ice can last billions of years there.')),
      Q(L('Por que uma base lunar precisa de reator ou de baterias grandes?', 'Why does a lunar base need a reactor or big batteries?'),
        [L('Porque a Lua tem noites e sombras longas', 'Because the Moon has long nights and shadows'), L('Porque o Sol da Lua é mais fraco', 'Because the Moon’s Sun is weaker'), L('Para aquecer o gelo', 'To heat the ice')], 0,
        L('Na maior parte da Lua a noite dura cerca de 14 dias terrestres. Sem reserva, os painéis param.', 'On most of the Moon, night lasts about 14 Earth days. Without a reserve, the panels stop.'))
    ],
    orbit: [
      Q(L('Por que os astronautas flutuam dentro da Estação Espacial?', 'Why do astronauts float inside the Space Station?'),
        [L('Não existe gravidade lá em cima', 'There is no gravity up there'), L('Estão em queda livre contínua ao redor da Terra', 'They are in continuous free fall around Earth'), L('A estação tem ímãs especiais', 'The station has special magnets')], 1,
        L('A 400 km de altitude a gravidade ainda tem cerca de 90% da força da superfície. A estação e a tripulação caem juntas, sempre "errando" o chão.', 'At 400 km the gravity is still about 90% of surface strength. Station and crew fall together, always "missing" the ground.')),
      Q(L('Quantas vezes por dia a Estação vê o Sol nascer?', 'How many sunrises does the Station see each day?'),
        [L('Uma', 'One'), L('Cerca de 16', 'About 16'), L('Cerca de 100', 'About 100')], 1,
        L('Uma volta na Terra leva cerca de 92 minutos, então há cerca de 16 nasceres e pores do Sol por dia.', 'One orbit takes about 92 minutes, so there are about 16 sunrises and sunsets a day.')),
      Q(L('Por que a Estação precisa de um filtro de CO₂?', 'Why does the Station need a CO₂ filter?'),
        [L('Para tirar o gás que a tripulação expira', 'To remove the gas the crew breathes out'), L('Para fazer chover', 'To make it rain'), L('Para esfriar os computadores', 'To cool the computers')], 0,
        L('Cada pessoa solta cerca de 1 kg de gás carbônico por dia. Sem filtro, o ar fica perigoso em poucas horas.', 'Each person breathes out about 1 kg of carbon dioxide a day. Without a filter, the air becomes dangerous within hours.'))
    ]
  };
  window.pickQuiz = function (world, seed) {
    const w = QUIZ[world] || [], g = QUIZ.geral, s = Math.abs(seed | 0);
    return [w[s % w.length], w[(s + 1) % w.length], g[s % g.length]].filter(Boolean);
  };
  // Imagem do Sol ao vivo (NASA Solar Dynamics Observatory, AIA 193 Å), com recarga diária pelo parâmetro
  window.SUN_LIVE = 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg?d=' + new Date().toISOString().slice(0, 10);
})();

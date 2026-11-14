/* =========================================================================
   Missão Liastra · agricultura espacial
   Culturas reais já testadas no espaço ou em condições de Marte.
   grow = segundos de jogo para amadurecer com luz total (3 células de LED)
   ========================================================================= */
window.CROPS = {
  alface: {
    name: 'Alface roxa', grow: 80, food: 7, o2: 2, water: 1.5, leaf: 0x9b2a3a, fruit: null, tall: 1, real: 'cerca de 33 dias',
    fact: 'Em 2015, astronautas da Estação Espacial comeram pela primeira vez uma alface cultivada no espaço: uma alface roxa do experimento Veggie, colhida depois de cerca de 33 dias.'
  },
  rabanete: {
    name: 'Rabanete', grow: 70, food: 6, o2: 1.5, water: 1.5, leaf: 0x3fbf6f, fruit: 0xd8344a, low: true, tall: 0.8, real: '27 dias',
    fact: 'Em 2020, a tripulação da Estação colheu rabanetes do experimento Plant Habitat-02 depois de 27 dias. Rabanete cresce rápido e é ótimo para estudar plantas no espaço.'
  },
  tomate: {
    name: 'Tomate anão', grow: 150, food: 12, o2: 3, water: 3, leaf: 0x2f9a55, fruit: 0xe8462e, tall: 1.4, real: 'cerca de 3 meses',
    fact: 'Em 2023, astronautas cultivaram tomatinhos anões na Estação no experimento Veg-05. Tomate pede mais luz e mais cuidado que verduras de folha.'
  },
  pimenta: {
    name: 'Pimenta chili', grow: 170, food: 10, o2: 3, water: 2.5, leaf: 0x1f7a40, fruit: 0xd0202a, tall: 1.3, real: 'cerca de 4 meses',
    fact: 'Em 2021, a tripulação da Estação colheu pimentas chili do experimento Plant Habitat-04 e usou as pimentas para fazer tacos.'
  },
  batata: {
    name: 'Batata', grow: 190, food: 18, o2: 3, water: 3, leaf: 0x3a9a50, fruit: 0xf4f1e6, tall: 1.1, real: '3 a 4 meses',
    fact: 'Em 2016 e 2017, o Centro Internacional da Batata, no Peru, cultivou batatas num ambiente que imitava as condições de Marte. A batata é uma das culturas mais estudadas para alimentar futuros colonos.'
  },
  trigo: {
    name: 'Trigo anão', grow: 140, food: 9, o2: 2.5, water: 2, leaf: 0xc9b450, fruit: null, tall: 2.2, real: 'cerca de 2 meses',
    fact: 'O trigo super-anão "Apogee", desenvolvido com apoio da NASA, foi cultivado na estação espacial russa Mir nos anos 1990 para testar grãos no espaço.'
  }
};

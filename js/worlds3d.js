/* =========================================================================
   Missão Liastra · mundos 3D
   - buildGround(eng, site): Base AIC em Marte (Cratera Jezero) ou na Lua (Shackleton)
   - buildOrbit(eng): cópia da Estação Espacial Internacional
   A base pertence ao Aerospace Innovation Center (AIC), do LIASTRA Institute.
   Os laboratórios são do ICBS, o centro de pesquisa do LIASTRA.
   ========================================================================= */
(function () {
  const T = THREE;
  const { B, MAT, TEX, imageTex, canvasTex, rand, boxGeo } = Engine3D;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const LOGO = {
    aic: () => imageTex(ASSETS.aic, { max: 900 }),
    aicT: () => imageTex(ASSETS.aic, { max: 900, removeWhite: true }),
    liastra: () => imageTex(ASSETS.liastra, { max: 600 }),
    shieldT: () => imageTex(ASSETS.shield, { max: 600, removeWhite: true }),
    icbs: () => imageTex(ASSETS.icbs, { max: 900 })
  };

  /* =======================================================================
     BASE EM SOLO
     ======================================================================= */
  function buildGround(eng, site, mission) {
    const mars = site.id === 'mars';
    const scene = eng.newScene();
    eng.mode = 'walk'; eng.gravity = mars ? 3.71 : 1.62; eng.jumpV = 3.0; eng.speedMul = mars ? 1 : 0.9; eng.bounds = 190;
    eng.setExposure(mars ? 0.92 : 0.98);

    let sky = null;
    if (mars) { sky = B.skyDome(scene, { top: 0x8a5a3a, horizon: 0xd9a36e, bottom: 0x7a4a2c, sun: 0xfff0d8, glow: 0x7fa6ff }); scene.fog = new T.FogExp2(0xc99466, 0.0055); }
    else scene.fog = new T.FogExp2(0x000000, 0.0004);
    scene.background = new T.Color(0x000000);
    eng.setEnvironment(mars ? 0x3a271b : 0x05070c, mars ? 0x5a3c2a : 0x1a1b20, mars ? 0x22120a : 0x3a3a40, [[30, 20, 10, 12, 12, mars ? 0xfff0d8 : 0xffffff, 1.5]]);
    const hemi = new T.HemisphereLight(mars ? 0xffd9b0 : 0xbfc8d8, mars ? 0x4a3328 : 0x202024, mars ? 0.32 : 0.1); scene.add(hemi);
    scene.add(new T.AmbientLight(0xffffff, mars ? 0.06 : 0.04));
    const sun = new T.DirectionalLight(mars ? 0xfff0dc : 0xffffff, mars ? 1.4 : 2.8);
    sun.castShadow = true; sun.shadow.mapSize.set(eng.lowPower ? 1024 : 2048, eng.lowPower ? 1024 : 2048);
    const sc = sun.shadow.camera; sc.left = -50; sc.right = 50; sc.top = 50; sc.bottom = -50; sc.near = 1; sc.far = 500;
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.05;
    scene.add(sun); scene.add(sun.target);
    const sunGlow = B.sunSprite(scene, mars ? 190 : 220, mars ? 0xfff1d6 : 0xffffff);
    const stars = B.stars(scene); stars.material.opacity = mars ? 0 : 0.95;
    let earth = null;
    if (!mars) { const eg = new T.Group(); eg.position.set(-1100, 160, -3000); scene.add(eg); earth = B.earth(eg, 80); }

    const craters = mars
      ? [{ x: 70, z: 60, r: 26, depth: 5, rim: 2.2 }, { x: -95, z: 40, r: 18, depth: 3, rim: 1.5 }, { x: 40, z: -110, r: 32, depth: 6, rim: 3 }]
      : [{ x: -78, z: -64, r: 30, depth: 9, rim: 3 }, { x: 80, z: 50, r: 22, depth: 5, rim: 2 }, { x: 30, z: 110, r: 14, depth: 3, rim: 1.2 }, { x: -120, z: 70, r: 26, depth: 6, rim: 2.4 }];
    const ter = B.terrain(scene, {
      seed: mars ? 5 : 17, amp: mars ? 10 : 7, flatR: 38, craters, flats: [{ x: 46, z: -34, r: 14 }, { x: -26, z: -14, r: 6 }],
      c1: mars ? 0x8f3517 : 0x7c7d82, c2: mars ? 0xb4562a : 0x5d5e63, c3: mars ? 0x55200e : 0x46474c,
      rock: mars ? 0x6d3219 : 0x6a6b70, rocks: eng.lowPower ? 350 : 650,
      avoid: (x, z) => Math.hypot(x, z) < 32
    });
    eng.groundAt = (x, z) => ter.height(x, z);

    const G = new T.Group(); scene.add(G);
    const rooms = {};
    const stripe = mars ? 0xff6b35 : 0x2c6fd6;
    const mk = (o) => { const r = B.room(eng, G, Object.assign({ stripe }, o)); rooms[o.id] = Object.assign({}, r.inner, { light: r.light, x: o.x, z: o.z, w: o.w, d: o.d, label: o.label || o.name }); return r; };
    mk({ id: 'hub', name: 'COMANDO', label: 'Comando', x: 0, z: 0, w: 12, d: 12, h: 3.4, doors: { n: [0], s: [0], e: [0], w: [0] }, roof: 'dome', lightI: 1.4 });
    mk({ id: 'cN', label: 'Corredor', x: 0, z: -7.5, w: 2.6, d: 3, h: 2.7, doors: { n: [0], s: [0] }, noLight: true });
    mk({ id: 'hab', name: 'HABITAÇÃO', sub: 'cabines da tripulação', label: 'Habitação', x: 0, z: -15, w: 8, d: 12, doors: { s: [0], n: [0], w: [-2], e: [2] }, color: '#4cc3ff', signs: [[0, -9.17, 0]] });
    mk({ id: 'hyg', name: 'HIGIENE', label: 'Banheiro', x: -6.5, z: -17, w: 5, d: 5, doors: { e: [0] }, color: '#4cc3ff', signs: [[-4.17, -15.4, Math.PI / 2]], lightColor: 0xf4f8ff });
    mk({ id: 'galley', name: 'COZINHA', label: 'Cozinha', x: 6.5, z: -13, w: 5, d: 6, doors: { w: [0] }, color: '#ffb340', signs: [[4.17, -11.6, -Math.PI / 2]], lightColor: 0xfff0d8 });
    mk({ id: 'shelter', name: 'ABRIGO', sub: 'paredes de água', label: 'Abrigo de radiação', x: 0, z: -24, w: 8, d: 6, doors: { s: [0] }, color: '#ffc94d', signs: [[0, -21.17, 0]], lightColor: 0xffe2a0 });
    mk({ id: 'cE', label: 'Corredor', x: 7.5, z: 0, w: 3, d: 2.6, h: 2.7, doors: { e: [0], w: [0] }, noLight: true });
    mk({ id: 'lab', name: 'LABORATÓRIO ICBS', sub: 'ciência e enfermaria', label: 'Laboratório ICBS', x: 16, z: 0, w: 14, d: 8, doors: { w: [0], n: [0], s: [0] }, color: '#b392ff', signs: [[9.17, 2.3, Math.PI / 2]], lightColor: 0xf0f4ff, lightI: 1.5 });
    mk({ id: 'cLN', label: 'Corredor', x: 16, z: -5, w: 2.6, d: 2, h: 2.7, doors: { n: [0], s: [0] }, noLight: true });
    mk({ id: 'eclss', name: 'SUPORTE DE VIDA', sub: 'ar, água e energia', label: 'Suporte de Vida', x: 16, z: -10, w: 10, d: 8, doors: { s: [0] }, color: '#46d483', signs: [[16, -6.17, 0]], lightColor: 0xe6fff0 });
    mk({ id: 'cLS', label: 'Corredor', x: 16, z: 5, w: 2.6, d: 2, h: 2.7, doors: { n: [0], s: [0] }, noLight: true });
    mk({ id: 'gym', name: 'ACADEMIA', label: 'Academia', x: 16, z: 10, w: 10, d: 8, doors: { n: [0] }, color: '#46d483', signs: [[16, 6.17, Math.PI]] });
    mk({ id: 'cS', label: 'Corredor', x: 0, z: 7.5, w: 2.6, d: 3, h: 2.7, doors: { n: [0], s: [0] }, noLight: true });
    mk({ id: 'green', name: 'ESTUFA', label: 'Estufa', x: 0, z: 16, w: 14, d: 14, h: 3.4, doors: { n: [0] }, glass: true, roof: 'glassdome', color: '#5bd48a', lightColor: 0xffc8f0, lightI: 1.3 });
    mk({ id: 'cW', label: 'Corredor', x: -7.5, z: 0, w: 3, d: 2.6, h: 2.7, doors: { e: [0], w: [0] }, noLight: true });
    mk({ id: 'airlock', name: 'ESCOTILHA', sub: 'trajes e saída EVA', label: 'Escotilha', x: -12, z: 0, w: 6, d: 6, doors: { e: [0], w: [0] }, color: '#e5484d', signs: [[-9.17, 1.9, -Math.PI / 2]], lightColor: 0xfff0f0 });
    B.label(G, 'SAÍDA EVA', 'só com traje', -14.82, 2.72, 0, Math.PI / 2, '#e5484d', 1.5);

    const wall = (minX, maxX, minZ, maxZ) => eng.walls.push({ minX, maxX, minZ, maxZ });
    const P = {}, inter = [];
    const add = (id, kind, pos, label, r = 2.2, hold = 0) => { P[id] = pos; inter.push({ id, kind, pos, label, r, hold }); };

    /* Comando */
    const holo = B.holoTable(G, 0, 0, mars ? 'mars' : 'moon'); wall(-1.3, 1.3, -1.3, 1.3);
    add('mcc', 'mcc', V(0, 1.3, 1.6), 'Ver o plano da missão na mesa holográfica', 2.8);
    B.console(G, -3.6, -4.8, 0, 'ENERGIA', ['Painéis: OK', 'Bateria', 'Plano do dia'], '#ffd166', 'chart'); wall(-4.4, -2.8, -5.2, -4.4); B.chair(G, -3.6, -3.6, 0);
    add('power', 'power', V(-3.6, 1.3, -4.1), 'Abrir o console de energia');
    B.console(G, 3.6, -4.8, 0, 'RÁDIO · TERRA', ['Banda X: OK', 'Atraso: ' + (mars ? '~11 min' : '1,3 s')], '#b392ff'); wall(2.8, 4.4, -5.2, -4.4); B.chair(G, 3.6, -3.6, 0);
    add('comms', 'comms', V(3.6, 1.3, -4.1), 'Falar com a Terra');
    B.screen(G, 'MISSÃO', ['Base AIC ' + (mars ? 'Jezero' : 'Shackleton'), 'Clima espacial: DONKI'], -5.82, 1.9, -3.4, Math.PI / 2, '#ff6b35', 1.8, 'map');
    B.screen(G, 'SUPORTE DE VIDA', ['O₂ 21%', 'CO₂ 0,3 kPa', 'Água 98%'], 5.82, 1.9, -3.4, -Math.PI / 2, '#46d483', 1.8, 'chart');
    B.plaque(G, LOGO.aic(), 3.2, 1.0, -3.3, 1.75, 5.82, Math.PI);
    B.plaque(G, LOGO.liastra(), 1.6, 1.6, 3.3, 1.7, 5.82, Math.PI);
    B.screen(G, 'CLIMA ESPACIAL', ['NASA DONKI', 'Ejeções do Sol'], 5.82, 1.9, 3.4, -Math.PI / 2, '#ffb340', 1.8, 'chart');
    if (mission) { const pp = imageTex(patchURI(mission), { max: 512 }); B.plaque(G, pp, 1.3, 1.3, -5.82, 1.8, 3.4, Math.PI / 2); }
    B.crates(G, -5, 4.6, 3); wall(-5.4, -4.2, 4.2, 5.2);
    add('supplies', 'supplies', V(-4.7, 1.0, 3.9), 'Pegar fita, sacos e ferramentas do estoque', 2.4, 1.5);

    /* Habitação */
    B.sleepPod(G, -3.35, -19.6, Math.PI / 2); wall(-4, -2.8, -20.75, -18.45);
    B.sleepPod(G, -3.35, -12.4, Math.PI / 2); wall(-4, -2.8, -13.55, -11.25);
    B.sleepPod(G, 3.35, -19.6, -Math.PI / 2); wall(2.8, 4, -20.75, -18.45);
    B.sleepPod(G, 3.35, -16.2, -Math.PI / 2); wall(2.8, 4, -17.35, -15.05);
    add('bed', 'bed', V(-2.4, 0.9, -19.6), 'Deitar na cabine e dormir', 2.2);
    add('bed2', 'bed', V(2.4, 0.9, -16.2), 'Deitar na cabine e dormir', 2.2);
    B.locker(G, -2.2, -20.55, 0, 1.2, 2.3); B.locker(G, 2.2, -20.55, 0, 1.2, 2.3); wall(-2.8, -1.6, -20.85, -20.25); wall(1.6, 2.8, -20.85, -20.25);
    B.screen(G, 'BOA NOITE', ['Sono: 8 h', 'Luz: modo noturno'], -3.82, 1.9, -15.9, Math.PI / 2, '#4cc3ff', 0.9);
    B.chair(G, 1.3, -10.6, Math.PI); B.box(G, 1.2, 0.05, 0.6, MAT.white, 1.3, 0.78, -9.7); wall(0.7, 1.9, -10, -9.4);

    /* Banheiro */
    B.shower(G, -8.1, -18.6, 0); wall(-8.7, -7.5, -19.2, -18.0);
    add('shower', 'shower', V(-7.6, 1.2, -17.9), 'Tomar banho', 2.0, 3);
    B.toilet(G, -8.4, -15.5, Math.PI / 2); wall(-8.9, -7.9, -15.9, -15.1);
    add('toilet', 'toilet', V(-7.7, 0.9, -15.5), 'Usar o banheiro (urina é reciclada)', 1.8, 1.5);
    B.sink(G, -5.5, -19.1, 0); wall(-6, -5, -19.45, -18.8);
    add('sink', 'sink', V(-5.5, 1.1, -18.5), 'Lavar o rosto e escovar os dentes', 1.9, 1.5);
    B.screen(G, 'ÁGUA DO DIA', ['Uso: 9,4 L', 'Reciclada: 98%'], -8.82, 1.7, -17, Math.PI / 2, '#4cc3ff', 0.9);

    /* Cozinha */
    B.galley(G, 6.5, -15.55, 0, 4); wall(4.5, 8.5, -15.9, -15.2);
    add('galley', 'galley', V(6.5, 1.2, -14.8), 'Preparar uma refeição', 2.2, 2.5);
    B.table(G, 7, -11.8, 0.55, 3); wall(6.4, 7.6, -12.4, -11.2);
    add('table', 'table', V(7, 1.0, -11.8), 'Comer com a tripulação', 2.0, 1.5);
    B.locker(G, 8.6, -11.2, -Math.PI / 2, 1.4, 2.2); wall(8.3, 8.9, -11.9, -10.5);
    add('pantry', 'pantry', V(8.1, 1.2, -11.2), 'Ver a despensa', 1.8);

    /* Abrigo */
    for (let i = -3.4; i <= 3.4; i += 0.85) B.box(G, 0.8, 2.6, 0.5, MAT.water, i, 1.3, -26.55, { cast: false });
    [-3.6, 3.6].forEach((x) => B.box(G, 0.5, 2.6, 3.6, MAT.water, x, 1.3, -24.6, { cast: false }));
    B.box(G, 5, 0.45, 0.6, MAT.metal, 0, 0.22, -25.9); wall(-2.5, 2.5, -26.2, -25.6);
    B.crates(G, 2.5, -22.2, 2);
    add('shelter', 'shelter', V(0, 1.2, -24.5), 'Abrigo de radiação: fique aqui nas tempestades solares', 3);
    B.screen(G, 'ABRIGO', ['Água bloqueia', 'radiação'], 0, 1.9, -26.25, 0, '#ffc94d', 1.0);

    /* Laboratório ICBS + enfermaria */
    B.plaque(G, LOGO.icbs(), 3.6, 1.5, 22.82, 1.8, 0, -Math.PI / 2);
    B.glovebox(G, 12, -3.2, 0); wall(11.2, 12.8, -3.7, -2.7);
    add('glovebox', 'glovebox', V(12, 1.3, -2.4), 'Analisar amostra na glovebox', 2.2, 3);
    B.labBench(G, 12.5, 3.2, Math.PI, 3); wall(11, 14, 2.75, 3.65);
    add('experiment', 'experiment', V(12.5, 1.3, 2.4), 'Fazer um experimento no microscópio', 2.2, 3);
    B.freezer(G, 19.2, -3.25, 0); wall(18.75, 19.65, -3.65, -2.85);
    add('freezer', 'freezer', V(19.2, 1.3, -2.5), 'Guardar amostras no freezer (−80 °C)', 2.0, 1.5);
    B.printer3d(G, 20.6, -3.3, 0); wall(20.2, 21.0, -3.7, -2.9);
    add('printer', 'printer', V(20.6, 1.3, -2.6), 'Imprimir uma peça na impressora 3D', 2.0, 3);
    B.medBed(G, 21.2, 2.5, Math.PI / 2); wall(20.2, 22.2, 2.0, 3.0);
    add('med', 'med', V(20.2, 1.1, 1.6), 'Fazer o check-up médico', 2.2, 3);
    B.screen(G, 'ICBS · PESQUISA', ['Biologia espacial', 'Saúde da tripulação'], 13, 1.9, -3.82, 0, '#b392ff', 1.4, 'chart');

    /* Suporte de Vida */
    B.o2gen(G, 12.6, -13.2, 0); wall(11.8, 13.4, -13.6, -12.8);
    add('o2gen', 'o2gen', V(12.6, 1.3, -12.3), 'Operar o gerador de oxigênio', 2.2, 2.5);
    B.co2Scrubber(G, 15, -13.2, 0); wall(14.4, 15.6, -13.6, -12.8);
    add('co2', 'co2', V(15, 1.3, -12.4), 'Trocar o filtro de CO₂', 2.0, 2.5);
    B.waterRecycler(G, 18, -13.1, 0); wall(17.1, 18.9, -13.55, -12.65);
    add('water', 'water', V(18, 1.3, -12.2), 'Operar o reciclador de água', 2.2, 2.5);
    B.powerPanel(G, 20.6, -9.5, -Math.PI / 2); wall(20.4, 20.85, -10.2, -8.8);
    add('powerpanel', 'powerpanel', V(19.9, 1.3, -9.5), 'Painel elétrico: desligar sistemas não essenciais', 2.0, 2);
    B.batteryRack(G, 11.6, -8.6, Math.PI / 2); wall(11.3, 11.9, -9.5, -7.7);
    add('battery', 'battery', V(12.3, 1.0, -8.6), 'Verificar as baterias', 2.0, 2);

    /* Academia */
    B.treadmill(G, 12.8, 10.5, 0); wall(12.35, 13.25, 9.5, 11.5);
    add('treadmill', 'treadmill', V(12.8, 1.2, 10.5), 'Correr na esteira', 2.2, 3);
    B.bike(G, 16.8, 12.6, 0); wall(16.55, 17.05, 12.0, 13.2);
    add('bike', 'bike', V(16.8, 1.0, 12.0), 'Pedalar na bicicleta', 2.0, 3);
    B.ared(G, 19.6, 11.6, 0); wall(18.8, 20.4, 11.0, 12.2);
    add('ared', 'ared', V(19.6, 1.2, 11.0), 'Musculação', 2.0, 3);
    B.screen(G, 'TREINO', ['Meta: 2 h/dia', 'Ossos e músculos'], 20.82, 1.9, 8.4, -Math.PI / 2, '#46d483', 1.1);

    /* Estufa */
    [-5, 5].forEach((x) => { B.plantRack(G, x, 17, Math.PI / 2, 9); wall(x - 0.4, x + 0.4, 12.5, 21.5); });
    const farm = [];
    [[-2.2, 13.6], [-2.2, 17], [-2.2, 20.4], [2.2, 13.6], [2.2, 17], [2.2, 20.4]].forEach(([x, z], i) => {
      const tr = B.growTray(G, x, z, x < 0 ? -Math.PI / 2 : Math.PI / 2, 2.6); wall(x - 0.45, x + 0.45, z - 1.3, z + 1.3);
      const pos = V(x < 0 ? -1.4 : 1.4, 1.2, z); tr.pos = pos; farm.push(tr);
      add('tray' + i, 'farm', pos, 'Bandeja de cultivo ' + (i + 1), 2.0);
    });
    B.screen(G, 'ESTUFA · CONTROLE', ['Luz LED', 'Nutrientes', 'Umidade 70%'], -1.6, 1.5, 9.35, 0, '#5bd48a', 1.0);
    B.plantTower(G, -5.6, 10.6); B.plantTower(G, 5.6, 10.6); wall(-5.9, -5.3, 10.3, 10.9); wall(5.3, 5.9, 10.3, 10.9);

    B.screen(G, 'ESTUFA', ['Alface, tomate, rabanete', 'LED rosa = fotossíntese'], 0, 0.55, 22.82, Math.PI, '#5bd48a', 1.0);

    /* Escotilha */
    B.suit(G, -13.6, -2.55, 0); B.suit(G, -12.2, -2.55, 0); B.suit(G, -10.8, -2.55, 0);
    wall(-14.2, -10.2, -2.95, -2.2);
    add('suit', 'suit', V(-12.2, 1.4, -1.6), 'Vestir o traje espacial', 2.2, 3);
    B.box(G, 3, 0.45, 0.6, MAT.metal, -12, 0.22, 2.55); wall(-13.5, -10.5, 2.25, 2.85);
    const doorLight = new T.Mesh(new T.BoxGeometry(0.1, 0.25, 0.25), MAT.ledRed); doorLight.position.set(-14.8, 2.55, 1.2); G.add(doorLight);
    add('airlock', 'airlock', V(-14.2, 1.3, 0), 'Porta externa', 1.6);
    eng.setDynWall('outer', { minX: -15.3, maxX: -14.6, minZ: -1.0, maxZ: 1.0 });
    const outerDoor = B.box(G, 0.12, 2.35, 1.75, new T.MeshStandardMaterial({ color: 0x9aa1ab, metalness: 0.8, roughness: 0.3 }), -15.0, 1.18, 0);

    /* exterior */
    const sign = B.grp(G, -20, -6, -Math.PI / 2 - 0.3, eng.groundAt(-20, -6));
    B.cyl(sign, 0.08, 0.08, 3, MAT.metal, -1.4, 1.5, 0, 8); B.cyl(sign, 0.08, 0.08, 3, MAT.metal, 1.4, 1.5, 0, 8);
    B.box(sign, 3.4, 1.6, 0.1, MAT.white, 0, 2.3, 0);
    B.decal(sign, LOGO.aic(), 3.2, 1.0, 0, 2.45, 0.06, 0);
    const sl = B.label(sign, 'BASE AIC ' + (mars ? 'JEZERO' : 'SHACKLETON'), 'Aerospace Innovation Center · LIASTRA', 0, 1.7, 0.06, 0, '#1b2f7a', 3.2); sl.scale.y = 0.6;
    B.flag(G, -19, eng.groundAt(-19, 5), 5, LOGO.liastra());
    B.decal(G, LOGO.aicT(), 6, 1.9, -4.17, 1.6, -15, -Math.PI / 2);
    B.decal(G, LOGO.shieldT(), 2.4, 2.4, 23.17, 1.5, 0, Math.PI / 2);
    const panels = [];
    if (mars) {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = -40 + c * 6.5, z = 12 + r * 6; const a = B.solarArray(G, x, z, 0); a.position.y = eng.groundAt(x, z); panels.push(a); wall(x - 0.3, x + 0.3, z - 0.3, z + 0.3); }
    } else {
      [[-34, 14], [-26, 22], [-40, 26], [-30, 34]].forEach(([x, z]) => { const a = B.solarArray(G, x, z, 0, true); a.position.y = eng.groundAt(x, z); panels.push(a); wall(x - 0.4, x + 0.4, z - 0.4, z + 0.4); });
    }
    add('panels', 'panels', V(-33, eng.groundAt(-33, 10) + 1.4, 10), mars ? 'Limpar os painéis solares' : 'Inspecionar os painéis solares', 4.5, 3.5);
    B.box(G, 18, 0.08, 0.14, MAT.dark, -24, 0.06, 7, { cast: false });
    const rx = 52, rz = -56;
    B.reactor(G, rx, eng.groundAt(rx, rz), rz); wall(rx - 1.5, rx + 1.5, rz - 1.5, rz + 1.5);
    add('reactor', 'reactor', V(rx - 2.4, eng.groundAt(rx - 2.4, rz) + 1.3, rz + 1.5), 'Ligar o reator de fissão', 4, 4);
    for (let s = 0; s < 1; s += 0.02) { const x = 24 + (rx - 24) * s, z = -6 + (rz + 6) * s; B.box(G, 1.6, 0.06, 0.1, MAT.dark, x, eng.groundAt(x, z) + 0.04, z, { cast: false }).rotation.y = -Math.atan2(rz + 6, rx - 24); }
    B.label(G, 'REATOR', 'mantenha 50 m', rx - 3, eng.groundAt(rx - 3, rz + 4) + 1.2, rz + 4, -0.6, '#ffc94d', 1.4);
    const dish = B.dish(G, 26, -26); dish.position.y = eng.groundAt(26, -26); wall(25.4, 26.6, -26.6, -25.4);
    add('antenna', 'antenna', V(26, dish.position.y + 1.4, -23.8), 'Calibrar a antena', 3.5, 3);
    const lx = 46, lz = -34;
    B.pad(G, lx, eng.groundAt(lx, lz), lz, 13);
    B.lander(G, lx, eng.groundAt(lx, lz), lz); wall(lx - 4.5, lx + 4.5, lz - 4.5, lz + 4.5);
    const px = -26, pz = -14;
    B.pad(G, px, eng.groundAt(px, pz), pz, 5);
    P.pad = V(px, eng.groundAt(px, pz) + 1, pz);
    const iceX = -36, iceZ = -34;
    const iceMat = new T.MeshStandardMaterial({ color: 0xdfefff, roughness: 0.2, metalness: 0.05, emissive: 0x2a4a66, emissiveIntensity: 0.2 });
    for (let i = 0; i < 9; i++) { const m = new T.Mesh(new T.IcosahedronGeometry(0.6 + (i % 3) * 0.4, 0), iceMat); m.position.set(iceX + Math.cos(i) * 2.4, eng.groundAt(iceX, iceZ) + 0.2, iceZ + Math.sin(i * 1.7) * 2.2); m.castShadow = true; G.add(m); }
    const rig = B.grp(G, iceX + 3, iceZ, 0, eng.groundAt(iceX + 3, iceZ));
    B.box(rig, 1.8, 0.5, 1.8, MAT.metal, 0, 0.25, 0); B.box(rig, 0.25, 4.5, 0.25, MAT.yellow, 0, 2.4, 0); B.box(rig, 1.2, 0.8, 0.8, MAT.orange, 0, 3.8, 0); B.box(rig, 1.8, 0.1, 1.8, MAT.hazard, 0, 0.55, 0);
    wall(iceX + 2, iceX + 4, iceZ - 1, iceZ + 1);
    add('drill', 'drill', V(iceX + 1.5, eng.groundAt(iceX, iceZ) + 1.2, iceZ + 1.6), 'Perfurar o gelo', 4, 4);
    if (mars) { B.weather(G, 10, eng.groundAt(10, 28), 28); add('weather', 'weather', V(10, eng.groundAt(10, 28) + 1.3, 26.8), 'Ler a estação meteorológica', 3, 2); }
    const seis = B.seismo(G, -26, eng.groundAt(-26, 8), 8); seis.visible = false;
    B.marker(G, -26, eng.groundAt(-26, 8), 8.8, 0x46d483);
    add('seismo', 'seismo', V(-26, eng.groundAt(-26, 8) + 1.0, 8), 'Instalar o sismômetro', 3, 4);
    if (mars) {
      const sp = V(70, 0, 60);
      const leo = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#9a4a2a'; g.fillRect(0, 0, w, h); const R = rand(3); for (let i = 0; i < 60; i++) { const x = R() * w, y = R() * h, r = 4 + R() * 9; g.fillStyle = '#e8d2a8'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#2b1a12'; g.beginPath(); g.arc(x, y, r * 0.75, 0, 7); g.fill(); g.fillStyle = '#e8d2a8'; g.beginPath(); g.arc(x, y, r * 0.35, 0, 7); g.fill(); } });
      const rock = new T.Mesh(new T.DodecahedronGeometry(1.6, 1), new T.MeshStandardMaterial({ map: leo, roughness: 0.9, flatShading: true }));
      rock.scale.set(1.4, 0.7, 1); rock.position.set(sp.x, eng.groundAt(sp.x, sp.z) + 0.6, sp.z); rock.castShadow = true; G.add(rock);
      B.marker(G, sp.x + 2, eng.groundAt(sp.x + 2, sp.z), sp.z);
      add('sample', 'sample', V(sp.x, eng.groundAt(sp.x, sp.z) + 1.2, sp.z), 'Coletar a rocha manchada com a broca', 4, 3.5);
    } else {
      [['sample1', -54, -40, 'Coletar uma rocha da borda'], ['sample2', -64, -50, 'Retirar um tubo de solo'], ['sample3', -78, -64, 'Coletar gelo no fundo da cratera']].forEach(([id, x, z, l]) => {
        B.marker(G, x + 1.2, eng.groundAt(x + 1.2, z), z, id === 'sample3' ? 0x4cc3ff : 0xff6b35);
        add(id, id, V(x, eng.groundAt(x, z) + 1.0, z), l, 4, 3.5);
      });
      add('sample', 'sample3', V(-78, eng.groundAt(-78, -64) + 1.0, -64), 'Coletar gelo na cratera escura', 0.01, 3.5);
      const iceM = new T.MeshStandardMaterial({ color: 0xdff4ff, roughness: 0.1, emissive: 0x6fb6ff, emissiveIntensity: 0.4 });
      for (let i = 0; i < 16; i++) { const m = new T.Mesh(new T.IcosahedronGeometry(0.3 + (i % 4) * 0.15, 0), iceM); const a = i * 0.9; m.position.set(-78 + Math.cos(a) * (2 + i * 0.3), 0, -64 + Math.sin(a) * (2 + i * 0.3)); m.position.y = eng.groundAt(m.position.x, m.position.z) + 0.15; G.add(m); }
      const lamp = new T.PointLight(0x9fd8ff, 1.0, 16, 2); lamp.position.set(-78, eng.groundAt(-78, -64) + 3, -64); G.add(lamp);
      const tri = B.grp(G, 4, -42, 0, eng.groundAt(4, -42));
      for (let i = 0; i < 3; i++) { const a = i * 2.1; const l = B.cyl(tri, 0.02, 0.02, 1.4, MAT.metal, Math.cos(a) * 0.3, 0.65, Math.sin(a) * 0.3, 6); l.rotation.z = Math.cos(a) * 0.25; l.rotation.x = -Math.sin(a) * 0.25; }
      B.box(tri, 0.3, 0.2, 0.25, MAT.darker, 0, 1.4, 0); B.cyl(tri, 0.07, 0.07, 0.2, MAT.dark, 0, 1.4, -0.2, 12).rotation.x = Math.PI / 2;
      add('earthphoto', 'earthphoto', V(4, eng.groundAt(4, -42) + 1.4, -41.5), 'Fotografar a Terra', 3, 2);
      B.berm(G, 0, -24, 11, 9, 4.6, 0x6f7075);
      B.berm(G, 0, -15, 10.5, 14.5, 4.4, 0x77787d);
    }
    const rv = B.rover(G);
    rv.group.position.set(-22, eng.groundAt(-22, 4), 4); rv.group.rotation.y = Math.PI / 2;
    const vehicle = { obj: rv.group, wheels: rv.wheels, yaw: Math.PI / 2, speed: 0 };
    add('rover', 'rover', V(-22, 1.4, 4), 'Dirigir o rover', 4.5);
    // depósito de amostras (Marte)
    const depot = new T.Group(); G.add(depot);
    if (mars) {
      const dx = 36, dz = 30;
      B.marker(G, dx - 2, eng.groundAt(dx - 2, dz), dz, 0x46d483);
      for (let i = 0; i < 10; i++) { const tx = dx + (i % 2 ? 1.2 : -1.2) + i * 0.15, tz = dz - 4 + i * 0.9; const tube = B.cyl(depot, 0.04, 0.04, 0.22, MAT.chrome, tx, eng.groundAt(tx, tz) + 0.04, tz, 8); tube.rotation.z = Math.PI / 2; }
      add('depot', 'depot', V(dx, eng.groundAt(dx, dz) + 1.0, dz), 'Depositar os tubos de amostra', 4, 4);
    }
    depot.visible = false;
    const trackMat = new T.MeshBasicMaterial({ color: mars ? 0x6a2c12 : 0x45464b, transparent: true, opacity: 0.35, depthWrite: false });
    [[-22, 4, 66, 56], [-22, 4, -60, -48], [-22, 4, -34, -32], [-22, 4, 46, -24]].forEach(([x0, z0, x1, z1]) => {
      const len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0);
      for (let s = 6; s < len; s += 4) { const t = s / len, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; if (x > -17 && x < 24 && z > -29 && z < 25) continue; const m = new T.Mesh(new T.PlaneGeometry(2.4, 4.1), trackMat); m.rotation.set(-Math.PI / 2, 0, a); m.position.set(x, eng.groundAt(x, z) + 0.05, z); G.add(m); }
    });
    const devils = [];
    if (mars) for (let i = 0; i < 2; i++) { const d = new T.Mesh(new T.CylinderGeometry(6, 1.2, 50, 16, 1, true), new T.MeshBasicMaterial({ color: 0xc08050, transparent: true, opacity: 0.12, depthWrite: false, side: T.DoubleSide })); d.position.set(i ? 120 : -130, 25, i ? -90 : 80); scene.add(d); devils.push(d); }
    const dust = mars ? B.dust(scene, 0xd9a070, 500, 28) : null;

    const crewTex = mission ? imageTex(patchURI(mission), { max: 256 }) : null;
    const crew = [
      B.crew(G, -3.6, -3.55, 0, { pose: 'sit', suit: 0x2c4f9e, skin: 0x8d5a3b, hair: 0x111111, patch: crewTex }),
      B.crew(G, 14.2, -11.6, 0, { pose: 'work', suit: 0x2c4f9e, skin: 0xe0b08a, hair: 0x6b3e1f, patch: crewTex }),
      B.crew(G, 13.6, 2.1, Math.PI, { pose: 'work', suit: 0x2c4f9e, skin: 0xf1c9a5, hair: 0x1a1a1a, patch: crewTex }),
      B.crew(G, 18.2, 8.6, Math.PI / 2, { suit: 0x2c4f9e, skin: 0x5a3824, hair: 0x0d0d0d, patch: crewTex })
    ];
    wall(13.9, 14.5, -11.9, -11.3); wall(13.3, 13.9, 1.8, 2.4); wall(17.9, 18.5, 8.3, 8.9);
    add('crew0', 'crew', V(-3.6, 1.3, -2.9), 'Conversar com Ana, a comandante', 2.0);
    add('crew1', 'crew', V(14.2, 1.3, -10.9), 'Conversar com Rafael, o engenheiro', 2.0);
    add('crew2', 'crew', V(13.6, 1.3, 1.4), 'Conversar com Yuki, a cientista do ICBS', 2.0);
    add('crew3', 'crew', V(17.5, 1.3, 8.6), 'Conversar com Kwame, o médico', 2.0);
    [[-5.7, 1.2, -1.6, Math.PI / 2], [5.7, 1.2, 1.6, -Math.PI / 2], [-3.75, 1.2, -13.5, Math.PI / 2], [9.25, 1.2, -2.2, Math.PI / 2], [11.25, 1.2, -7.5, Math.PI / 2], [-9.25, 1.2, 2.2, Math.PI / 2]].forEach(([x, y, z, r]) => B.extinguisher(G, x, y, z, r));
    B.firstAid(G, 5.75, 1.6, -1.6, -Math.PI / 2); B.firstAid(G, 22.75, 1.6, -2.4, -Math.PI / 2); B.firstAid(G, -3.75, 1.6, -10.2, Math.PI / 2);
    [[0, 2.9, -5.75, 0], [-5.75, 2.6, 0, Math.PI / 2], [16, 2.6, -13.75, 0], [16, 2.6, 13.75, Math.PI], [-6.5, 2.6, -19.25, 0]].forEach(([x, y, z, r]) => B.vent(G, x, y, z, r));
    B.cableTray(G, -1.0, -6.2, -1.0, -8.8, 2.5); B.cableTray(G, 6.2, -1.0, 8.8, -1.0, 2.5); B.cableTray(G, -6.2, 1.0, -8.8, 1.0, 2.5); B.cableTray(G, 1.0, 6.2, 1.0, 8.8, 2.5);
    Object.assign(P, { leak_hab: V(3.7, 1.6, -11), leak_lab: V(22.6, 1.6, -3), leak_green: V(-6.6, 1.6, 9.8), leak_node: V(-5.6, 2.2, 3.6) });
    ['leak_hab', 'leak_lab', 'leak_green', 'leak_node'].forEach((id) => inter.push({ id, kind: 'leak', pos: P[id], label: 'Consertar o vazamento', r: 2.4, hold: 3 }));
    inter.forEach((i) => { P[i.id] = i.pos; eng.addInteract(i); });
    P.analyze = P.glovebox; P.harvest = P.tray0;

    const inBox = (p, b, m = 0.15) => p.x >= b.minX - m && p.x <= b.maxX + m && p.z >= b.minZ - m && p.z <= b.maxZ + m;
    const isInside = (p) => Object.values(rooms).some((b) => inBox(p, b));
    eng.floorAt = (x, z) => (isInside({ x, z }) ? 0 : ter.height(x, z));
    const inShelter = (p) => inBox(p, rooms.shelter, -0.1);
    const roomOf = (p) => { for (const b of Object.values(rooms)) if (inBox(p, b, 0)) return b.label; return null; };
    const spawns = { wake: { x: -1.8, y: 0, z: -18.6, yaw: Math.PI / 2 }, hub: { x: 0, y: 0, z: 3.5, yaw: 0 }, quest: { x: -12, y: 0, z: 0.5, yaw: Math.PI / 2 } };

    const tmpC = new T.Color(), dustCol = new T.Color(0x8a5a35), dayFog = new T.Color(0xc99466);
    let alarmT = 0;
    function update(dt, info) {
      const pl = eng.player.pos;
      let dir;
      if (mars) {
        const ang = (info.time01 - 0.25) * Math.PI * 2, el = Math.sin(ang);
        dir = V(Math.cos(ang) * 0.9, el, 0.35).normalize();
        const day = clamp(el * 3 + 0.25, 0, 1), dk = info.dust || 0;
        sky.material.uniforms.sunDir.value.copy(dir); sky.material.uniforms.day.value = day; sky.material.uniforms.dust.value = dk;
        sky.position.copy(eng.camera.position);
        tmpC.setHex(0x1a1420).lerp(dayFog, day); if (dk) tmpC.lerp(dustCol, dk * 0.7);
        scene.fog.color.copy(tmpC); scene.fog.density = 0.0055 + dk * 0.03;
        sun.intensity = 1.35 * day * (1 - dk * 0.65); hemi.intensity = 0.08 + 0.38 * day * (1 - dk * 0.3);
        stars.material.opacity = clamp(1 - day * 2.2, 0, 0.9) * (1 - dk);
        sunGlow.material.opacity = day * (1 - dk * 0.8);
        devils.forEach((d, i) => { d.rotation.y += dt * 1.5; d.position.x += Math.sin(info.tAbs * 0.05 + i) * dt * 2; });
        if (dust) { dust.position.set(pl.x, pl.y, pl.z); dust.material.opacity = 0.35 + dk * 0.5; }
      } else {
        const az = info.time01 * Math.PI * 2, shadow = info.shadow ? 1 : 0;
        dir = V(Math.cos(az), shadow ? -0.08 : 0.07, Math.sin(az)).normalize();
        sun.intensity = shadow ? 0 : 2.9; hemi.intensity = shadow ? 0.03 : 0.12;
        sunGlow.material.opacity = shadow ? 0 : 1;
        earth.setSun(V(1, 0.2, 0.4).normalize()); earth.mesh.rotation.y += dt * 0.004;
      }
      sun.position.copy(pl).addScaledVector(dir, 180); sun.target.position.copy(pl);
      sunGlow.position.copy(eng.camera.position).addScaledVector(dir, 4000);
      stars.position.copy(eng.camera.position);
      holo.userData.holo.rotation.y += dt * 0.5;
      B.animateCrew(crew, info.tAbs);
      if (info.antennaOn) dish.userData.dish.rotation.z += dt * 0.2;
      if (!mars) panels.forEach((p) => { p.userData.panel.rotation.y = -Math.atan2(dir.z, dir.x) + Math.PI / 2; });
      seis.visible = !!info.seismo;
      depot.visible = !!info.depot;
      doorLight.material = info.suited ? MAT.ledGreen : MAT.ledRed;
      outerDoor.position.z = info.suited ? -1.7 : 0;
      alarmT += dt;
      const red = info.alarm && Math.sin(alarmT * 7) > 0;
      Object.values(rooms).forEach((r) => { if (!r.light) return; r.light.color.setHex(red ? 0xff2a2a : r.id === 'green' ? 0xffc8f0 : r.id === 'shelter' ? 0xffe2a0 : 0xfff1e0); r.light.intensity = info.power < 0.2 ? 0.35 : (r.id === 'hub' || r.id === 'lab' ? 1.4 : 1.2); });
    }
    function setSuited(on) { eng.setDynWall('outer', on ? null : { minX: -15.3, maxX: -14.6, minZ: -1.0, maxZ: 1.0 }); }
    const map = { rooms: Object.values(rooms).map((r) => ({ x: r.x, z: r.z, w: r.w, d: r.d, label: r.label, main: !/Corredor/.test(r.label) })), view: { cx: 2, cz: -2, size: 64 } };

    return {
      kind: 'ground', site, points: P, rooms, farm, isInside, inShelter, roomOf, vehicle, update, setSuited, map,
      spawns, spawn: spawns.hub,
      sunFactor: (time01, shadow) => (mars ? Math.PI * Math.max(0, Math.sin((time01 - 0.25) * Math.PI * 2)) : (shadow ? 0.2 : 1)),
      leakSpots: ['leak_hab', 'leak_lab', 'leak_green', 'leak_node']
    };
  }

  /* =======================================================================
     ESTAÇÃO ESPACIAL (cópia da ISS)
     eixo x = para frente · y = zênite · z = estibordo
     ======================================================================= */
  function buildOrbit(eng, mission) {
    const scene = eng.newScene();
    eng.mode = 'float'; eng.bounds = null;
    eng.setExposure(0.9);
    scene.background = new T.Color(0x000000); scene.fog = null;
    eng.setEnvironment(0x02040a, 0x08142a, 0x1e3a6a, [[0, 40, 30, 20, 20, 0xffffff, 1.5]]);
    scene.add(new T.AmbientLight(0xffffff, 0.08));
    const sun = new T.DirectionalLight(0xffffff, 2.6);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = -60; sc.right = 60; sc.top = 60; sc.bottom = -60; sc.near = 1; sc.far = 400; sun.shadow.bias = -0.0006;
    scene.add(sun); scene.add(sun.target);
    scene.add(new T.HemisphereLight(0x000000, 0x3a6ab8, 0.35));
    const stars = B.stars(scene, 3500, 12000);
    const sunGlow = B.sunSprite(scene, 900, 0xffffff);
    const R = 4000, ALT = 264;
    const earthG = new T.Group(); earthG.position.set(0, -(R + ALT), 0); scene.add(earthG);
    const earthTilt = new T.Group(); earthTilt.rotation.x = 0.4; earthG.add(earthTilt);
    const earth = B.earth(earthTilt, R);

    const H = 1.05, N = 1.4;
    const mods = [
      { id: 'sm', name: 'ZVEZDA', label: 'Módulo de Serviço Zvezda', box: [-33, -21, -H, H, -H, H], holes: { '+x': 'full' }, foil: true },
      { id: 'fgb', name: 'ZARYA', label: 'Módulo de Carga Zarya', box: [-21, -7, -H, H, -H, H], holes: { '-x': 'full', '+x': 'full' }, foil: true },
      { id: 'n1', name: 'UNITY · NÓ 1', label: 'Nó 1 Unity', node: true, box: [-7, -2, -N, N, -N, N], holes: { '-x': H, '+x': H, '+z': 1.0, '-z': H, '-y': 0.95 } },
      { id: 'lab', name: 'DESTINY', label: 'Laboratório Destiny', box: [-2, 7, -H, H, -H, H], holes: { '-x': 'full', '+x': 'full' } },
      { id: 'n2', name: 'HARMONY · NÓ 2', label: 'Nó 2 Harmony', node: true, box: [7, 13, -N, N, -N, N], holes: { '-x': H, '+x': 0.9, '+z': H, '-z': H } },
      { id: 'col', name: 'COLUMBUS', label: 'Laboratório Europeu Columbus', box: [10 - H, 10 + H, -H, H, N, 8.4], holes: { '-z': 'full' } },
      { id: 'kibo', name: 'KIBO', label: 'Laboratório Japonês Kibo', box: [10 - H, 10 + H, -H, H, -12.4, -N], holes: { '+z': 'full' } },
      { id: 'quest', name: 'QUEST', label: 'Escotilha Quest', box: [-5.5, -3.5, -1.0, 1.0, N, 6.4], holes: { '-z': 'full', '+z': 0.75 } },
      { id: 'n3', name: 'TRANQUILITY · NÓ 3', label: 'Nó 3 Tranquility', box: [-5.6, -3.4, -1.1, 1.1, -8.4, -N], holes: { '+z': 'full', '-y': 0.85 } },
      { id: 'cupola', name: 'CÚPULA', label: 'Cúpula', box: [-5.35, -3.65, -2.9, -1.1, -5.75, -4.05], holes: { '+y': 'full', '-y': 'window' } },
      { id: 'dragon', name: 'CÁPSULA', label: 'Cápsula de tripulação', box: [13, 16.2, -0.9, 0.9, -0.9, 0.9], holes: { '-x': 'full' } },
      { id: 'cargo', name: 'CARGA', label: 'Nave de carga', box: [-5.5, -3.5, -6.4, -1.4, -1.0, 1.0], holes: { '+y': 'full' }, hidden: true }
    ];
    const G = new T.Group(); scene.add(G);
    const faceDefs = {
      '+x': (b) => ({ c: V(b[1], (b[2] + b[3]) / 2, (b[4] + b[5]) / 2), n: V(-1, 0, 0), u: [b[4], b[5]], v: [b[2], b[3]], aU: 'z', aV: 'y' }),
      '-x': (b) => ({ c: V(b[0], (b[2] + b[3]) / 2, (b[4] + b[5]) / 2), n: V(1, 0, 0), u: [b[4], b[5]], v: [b[2], b[3]], aU: 'z', aV: 'y' }),
      '+y': (b) => ({ c: V((b[0] + b[1]) / 2, b[3], (b[4] + b[5]) / 2), n: V(0, -1, 0), u: [b[0], b[1]], v: [b[4], b[5]], aU: 'x', aV: 'z' }),
      '-y': (b) => ({ c: V((b[0] + b[1]) / 2, b[2], (b[4] + b[5]) / 2), n: V(0, 1, 0), u: [b[0], b[1]], v: [b[4], b[5]], aU: 'x', aV: 'z' }),
      '+z': (b) => ({ c: V((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, b[5]), n: V(0, 0, -1), u: [b[0], b[1]], v: [b[2], b[3]], aU: 'x', aV: 'y' }),
      '-z': (b) => ({ c: V((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, b[4]), n: V(0, 0, 1), u: [b[0], b[1]], v: [b[2], b[3]], aU: 'x', aV: 'y' })
    };
    const deckMat = new T.MeshStandardMaterial({ color: 0x8e96a2, roughness: 0.75, metalness: 0.2 });
    const matCache = {};
    const rackMat = (mat, u) => { const k = mat.uuid + Math.round(u); if (!matCache[k]) { const m = mat.clone(); m.map = mat.map.clone(); m.map.needsUpdate = true; m.map.wrapS = m.map.wrapT = T.RepeatWrapping; m.map.repeat.set(Math.max(1, Math.round(u / 1.05)), 1); matCache[k] = m; } return matCache[k]; };
    const groupOf = {};
    const panelAt = (parent, u0, u1, v0, v1, f, mat) => {
      if (u1 - u0 < 0.01 || v1 - v0 < 0.01) return;
      const m = new T.Mesh(new T.PlaneGeometry(u1 - u0, v1 - v0), mat.map ? rackMat(mat, u1 - u0) : mat);
      const pos = f.c.clone(); pos[f.aU] = (u0 + u1) / 2; pos[f.aV] = (v0 + v1) / 2;
      m.position.copy(pos).addScaledVector(f.n, 0.001);
      if (f.aV === 'y') m.lookAt(pos.clone().add(f.n));
      else { const up = V(0, 0, 0); up[f.aV] = 1; m.quaternion.setFromRotationMatrix(new T.Matrix4().lookAt(pos.clone().add(f.n), pos, up)); }
      parent.add(m);
    };
    mods.forEach((md) => {
      const b = md.box, mg = new T.Group(); G.add(mg); groupOf[md.id] = mg; mg.visible = !md.hidden;
      const lx = b[1] - b[0], lz = b[5] - b[4], alongX = lx >= lz;
      Object.keys(faceDefs).forEach((fk) => {
        const f = faceDefs[fk](b), hole = md.holes[fk];
        const isEnd = alongX ? (fk === '+x' || fk === '-x') : (fk === '+z' || fk === '-z');
        const mat = fk === '-y' ? deckMat : fk === '+y' ? MAT.rack2 : (isEnd ? MAT.wall : MAT.rack);
        const [u0, u1] = f.u, [v0, v1] = f.v;
        if (hole === 'full') return;
        if (hole === 'window') {
          const glass = new T.Mesh(new T.CircleGeometry(0.8, 6), new T.MeshStandardMaterial({ color: 0x88bbff, transparent: true, opacity: 0.06, roughness: 0, side: T.DoubleSide, depthWrite: false }));
          glass.position.copy(f.c); glass.rotation.x = Math.PI / 2; mg.add(glass);
          const ring = new T.Mesh(new T.TorusGeometry(0.82, 0.06, 8, 6), MAT.metal); ring.position.copy(f.c); ring.rotation.x = Math.PI / 2; mg.add(ring);
          return;
        }
        if (hole) {
          const uc = (u0 + u1) / 2, vc = (v0 + v1) / 2, hw = hole;
          panelAt(mg, u0, u1, v0, vc - hw, f, mat); panelAt(mg, u0, u1, vc + hw, v1, f, mat);
          panelAt(mg, u0, uc - hw, vc - hw, vc + hw, f, mat); panelAt(mg, uc + hw, u1, vc - hw, vc + hw, f, mat);
          const p = f.c.clone(); p[f.aU] = uc; p[f.aV] = vc;
          const frame = new T.Mesh(new T.TorusGeometry(hw * 1.04, 0.08, 8, 4), new T.MeshStandardMaterial({ color: 0xb8c4d6, metalness: 0.6, roughness: 0.35 }));
          frame.position.copy(p).addScaledVector(f.n, 0.04); frame.lookAt(p.clone().add(f.n)); frame.rotateZ(Math.PI / 4); mg.add(frame);
        } else panelAt(mg, u0, u1, v0, v1, f, mat);
      });
      [-1, 1].forEach((s) => {
        const strip = new T.Mesh(new T.BoxGeometry(alongX ? lx * 0.8 : 0.1, 0.03, alongX ? 0.1 : lz * 0.8), MAT.lampCool);
        strip.position.set((b[0] + b[1]) / 2 + (alongX ? 0 : s * (b[1] - b[0]) * 0.3), b[3] - 0.02, (b[4] + b[5]) / 2 + (alongX ? s * (b[5] - b[4]) * 0.3 : 0)); mg.add(strip);
        const rail = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, (alongX ? lx : lz) * 0.9, 6), MAT.handrail);
        if (alongX) rail.rotation.z = Math.PI / 2; else rail.rotation.x = Math.PI / 2;
        rail.position.set((b[0] + b[1]) / 2 + (alongX ? 0 : s * ((b[1] - b[0]) / 2 - 0.1)), b[2] + 0.35, (b[4] + b[5]) / 2 + (alongX ? s * ((b[5] - b[4]) / 2 - 0.1) : 0)); mg.add(rail);
      });
      if (!['cupola', 'dragon', 'cargo'].includes(md.id)) {
        const light = new T.PointLight(0xf4f7ff, 0.72, Math.max(lx, lz) * 1.2 + 4, 1.8);
        light.position.set((b[0] + b[1]) / 2, (b[2] + b[3]) / 2 + 0.3, (b[4] + b[5]) / 2); mg.add(light); md.light = light;
        const lab = new T.Mesh(new T.PlaneGeometry(1.4, 0.35), new T.MeshBasicMaterial({ map: Engine3D.labelTex(md.name, null, '#ff6b35'), toneMapped: false }));
        lab.rotation.x = Math.PI / 2; lab.scale.x = -1;
        if (alongX) { lab.position.set(b[0] + 0.9, b[3] - 0.012, (b[4] + b[5]) / 2); lab.rotation.z = Math.PI / 2; } else lab.position.set((b[0] + b[1]) / 2, b[3] - 0.012, b[5] - 0.9);
        mg.add(lab);
      }
      const Rn = rand(md.id.length * 31 + 7);
      if (!['cupola', 'cargo'].includes(md.id) && !md.node) for (let i = 0; i < Math.round((alongX ? lx : lz) * 0.8); i++) {
        const along = (alongX ? b[0] : b[4]) + 0.6 + Rn() * ((alongX ? lx : lz) - 1.2);
        const side = Rn() > 0.5 ? 1 : -1, s = 0.25 + Rn() * 0.2, y = b[2] + 0.4 + Rn() * 1.2;
        const half = md.node ? N : H;
        const bag = new T.Mesh(new T.BoxGeometry(alongX ? s * 1.4 : 0.18, s, alongX ? 0.18 : s * 1.4), MAT.bag);
        if (alongX) bag.position.set(along, y, side * (half - 0.1)); else bag.position.set((b[0] + b[1]) / 2 + side * (half - 0.1), y, along);
        mg.add(bag);
      }
    });

    // tampas: escotilha de acoplamento no piso do Nó 1 e escotilha externa da Quest
    const hatchMat = new T.MeshStandardMaterial({ color: 0x9fb0c8, metalness: 0.4, roughness: 0.65 });
    const cbmHatch = new T.Mesh(new T.CircleGeometry(0.95, 24), hatchMat); cbmHatch.rotation.x = -Math.PI / 2; cbmHatch.position.set(-4.5, -N + 0.02, 0); G.add(cbmHatch);
    const questHatch = new T.Mesh(new T.CircleGeometry(0.75, 24), hatchMat); questHatch.rotation.y = Math.PI; questHatch.position.set(-4.5, 0, 6.38); G.add(questHatch);
    const P = {}, inter = [];
    const add = (id, kind, pos, label, r = 2, hold = 0) => { P[id] = pos; inter.push({ id, kind, pos, label, r, hold }); };
    const laptop = (x, y, z, rotY, title, lines, color) => { const g = B.grp(G, x, z, rotY, y); B.box(g, 0.42, 0.02, 0.3, MAT.darker, 0, 0, 0, { cast: false }); const s = B.screen(g, title, lines, 0, 0.16, -0.14, 0, color, 0.42); s.rotation.x = -0.25; return g; };
    // Unity: mesa de refeições
    const tbl = B.grp(G, -2.8, 0, Math.PI / 2, -N); // fora da escotilha de acoplamento do piso
    B.box(tbl, 1.4, 0.06, 0.9, MAT.white, 0, 0.75, 0); B.cyl(tbl, 0.05, 0.05, 0.72, MAT.metal, 0, 0.37, 0, 8);
    for (let i = 0; i < 5; i++) B.box(tbl, 0.12, 0.18, 0.04, [MAT.orange, MAT.yellow, MAT.plant, MAT.blue, MAT.tomato][i], -0.4 + i * 0.2, 0.86, 0.1, { cast: false });
    B.box(tbl, 0.3, 0.35, 0.3, MAT.white, 0.55, 0.95, -0.3);
    add('galley', 'galley', V(-2.9, -0.3, 0.2), 'Preparar e comer uma refeição', 2.2, 2.5);
    B.plaque(G, LOGO.liastra(), 0.8, 0.8, -14, 0.35, -H + 0.012, 0); // Zarya, parede lateral (fora das escotilhas)
    // Destiny
    laptop(-1, -0.3, -0.85, 0, 'ENERGIA', ['8 asas solares', 'Baterias Li-íon'], '#ffd166');
    B.screen(G, 'ENERGIA', ['Asas: 8', 'Baterias: 24'], -1, 0.4, -H + 0.01, 0, '#ffd166', 0.8, 'chart');
    add('power', 'power', V(-1, 0, -0.3), 'Abrir o console de energia', 2);
    laptop(1.2, -0.3, -0.85, 0, 'ESPAÇO-SOLO', ['Satélite de relé', 'Atraso < 1 s'], '#b392ff');
    B.screen(G, 'CONTROLE DA MISSÃO', ['Conferência diária', 'Houston · Moscou'], 1.2, 0.4, -H + 0.01, 0, '#b392ff', 0.8);
    add('comms', 'comms', V(1.2, 0, -0.3), 'Falar com o Controle da Missão', 2);
    const msg = B.glovebox(G, 3.2, H - 0.45, Math.PI); msg.position.y = -H; msg.scale.setScalar(0.85);
    add('glovebox', 'glovebox', V(3.2, 0, 0.2), 'Experimento na glovebox de microgravidade', 2, 3);
    const cdra = B.co2Scrubber(G, 5.6, -H + 0.42, 0); cdra.position.y = -H; cdra.scale.setScalar(0.85);
    add('co2', 'co2', V(5.6, 0, -0.2), 'Trocar o filtro de CO₂ (CDRA)', 2, 2.5);
    const cevis = B.bike(G, 0.2, 0, Math.PI / 2); cevis.position.y = -H;
    B.plaque(G, LOGO.aic(), 1.6, 0.5, 6.0, 0.5, H - 0.012, Math.PI); // Destiny, parede lateral
    // Harmony: cabines
    [8.2, 11.8].forEach((x) => { B.box(G, 1.0, 0.05, 2.2, MAT.blanket, x, N - 0.04, 0, { cast: false }); B.box(G, 1.0, 0.05, 2.2, MAT.blanket, x, -N + 0.04, 0, { cast: false }); });
    B.box(G, 0.7, 0.12, 1.8, MAT.fabricBlue, 8.2, N - 0.12, 0);
    const cqs = B.screen(G, 'CABINES', ['Mais blindagem', 'Abrigo de radiação'], 10, N - 0.06, 0.9, 0, '#ffc94d', 0.9); cqs.rotation.set(Math.PI / 2, 0, Math.PI);
    add('bed', 'bed', V(8.2, 0.6, 0), 'Entrar no saco de dormir', 2.2, 1);
    { const pp = imageTex(patchURI(mission || MISSIONS[4]), { max: 512 }); B.decal(G, pp, 0.8, 0.8, -0.6, 0.45, H - 0.012, Math.PI); } // patch da missão no Destiny
    // Columbus
    const farm = [];
    [[10.62, 6.0, 'Veggie (Columbus)'], [10.62, -8.2, 'Advanced Plant Habitat (Kibo)']].forEach(([x, z, nm], i) => {
      const tr = B.growTray(G, x, z, -Math.PI / 2, 1.6, -H); tr.group.scale.setScalar(0.75); tr.pos = V(10.0, 0, z); farm.push(tr);
      add('tray' + i, 'farm', tr.pos, nm, 2.0);
    });
    P.veggie = P.tray0;
    B.plaque(G, LOGO.icbs(), 1.5, 0.62, 10, 0.3, 8.38, Math.PI);
    B.screen(G, 'ICBS · BIOLOGIA', ['Plantas em microgravidade'], 9.0, 0.2, 4.5, Math.PI / 2, '#b392ff', 0.7);
    // Kibo
    const melfi = B.freezer(G, 10.6, -6, -Math.PI / 2); melfi.position.y = -H; melfi.scale.setScalar(0.85);
    add('freezer', 'freezer', V(10, 0, -6), 'Guardar no freezer MELFI (−80 °C)', 2, 1.5);
    add('experiment', 'experiment', V(9.4, 0, -9), 'Fazer um experimento', 2, 3);
    B.screen(G, 'EXPERIMENTO', ['Cristais de proteína'], 9.0, 0.2, -9, Math.PI / 2, '#46d483', 0.7, 'chart');
    B.plaque(G, LOGO.icbs(), 1.5, 0.62, 10, 0.3, -12.38, 0);
    const crewTex = imageTex(patchURI(mission || MISSIONS[0]), { max: 256 });
    const crew = [B.crew(G, 4.8, 0.35, Math.PI / 2, { pose: 'float', y: -0.9, suit: 0x3c4a5c, skin: 0xe0b08a, hair: 0x5a3a1e, patch: crewTex }), B.crew(G, 9.6, 3.6, 0, { pose: 'float', y: -0.9, suit: 0x3c4a5c, skin: 0x8d5a3b, hair: 0x111111, patch: crewTex })];
    add('crew0', 'crew', V(4.8, 0.2, 0.2), 'Conversar com Ana, a comandante', 1.8);
    add('crew1', 'crew', V(9.6, 0.2, 3.4), 'Conversar com Yuki, a cientista do ICBS', 1.8);
    B.extinguisher(G, -2.4, 0.4, -1.0, 0); B.firstAid(G, 6.4, 0.5, -1.02, 0);
    // Tranquility
    const whc = B.grp(G, -5.25, -2.6, Math.PI / 2, -1.1);
    B.box(whc, 1.3, 2.15, 0.1, MAT.offwhite, 0, 1.07, -0.35); B.toilet(whc, 0, 0.1, 0);
    add('toilet', 'toilet', V(-4.6, -0.2, -2.6), 'Usar o banheiro espacial (urina vira água)', 1.8, 1.5);
    add('hygiene', 'hygiene', V(-4.6, 0.3, -3.5), 'Higiene: lenço úmido e xampu sem enxágue', 1.8, 2);
    B.screen(G, 'HIGIENE', ['Sem chuveiro', 'Lenços e toalhas'], -5.58, 0.4, -3.5, Math.PI / 2, '#4cc3ff', 0.6);
    const t2 = B.treadmill(G, -4.5, -7.2, 0); t2.position.y = -1.1; t2.scale.set(0.8, 0.8, 0.6);
    add('treadmill', 'treadmill', V(-4.5, -0.2, -7.2), 'Correr na esteira T2', 2, 3);
    const ared = B.ared(G, -3.6, -3.0, -Math.PI / 2); ared.position.y = -1.1; ared.scale.setScalar(0.75);
    add('ared', 'ared', V(-4.0, 0, -3.0), 'Musculação no ARED', 1.8, 3);
    const wrs = B.waterRecycler(G, -5.2, -6.45, Math.PI / 2); wrs.position.y = -1.1; wrs.scale.setScalar(0.7);
    add('water', 'water', V(-4.6, 0, -6), 'Operar o reciclador de água', 1.8, 2.5);
    add('o2gen', 'o2gen', V(-4.6, 0.3, -5.2), 'Verificar o gerador de oxigênio', 1.6, 2.5);
    // Cúpula
    const rws = B.grp(G, -4.5, -4.1, 0, -1.9);
    B.box(rws, 1.2, 0.06, 0.25, MAT.dark, 0, 0, 0, { cast: false });
    [-0.35, 0, 0.35].forEach((x) => B.screen(rws, 'BRAÇO', ['Canadarm2'], x, 0.25, 0.05, Math.PI, '#4cc3ff', 0.3));
    [-0.5, 0.5].forEach((x) => B.cyl(rws, 0.03, 0.04, 0.18, MAT.darker, x, 0.08, -0.05, 8));
    add('rws', 'rws', V(-4.5, -2.0, -4.6), 'Operar o braço robótico', 1.8, 0);
    add('cupola', 'cupola', V(-4.5, -2.5, -5.0), 'Fotografar a Terra', 1.8, 2.5);
    // Quest
    B.suit(G, -3.9, 4.5, -Math.PI / 2, -1.0).scale.setScalar(0.95);
    B.suit(G, -5.1, 5.3, Math.PI / 2, -1.0).scale.setScalar(0.95);
    add('suit', 'suit', V(-4.5, 0, 3.6), 'Vestir o traje EMU', 2, 3);
    add('airlock', 'airlock', V(-4.5, 0, 6.2), 'Escotilha externa', 1.4);
    // Zvezda e cápsula
    add('window', 'window', V(-32.2, 0, 0), 'Olhar pela janela do Zvezda', 1.8, 1);
    B.box(G, 1.2, 0.06, 0.7, MAT.offwhite, -26, -0.35, 0);
    for (let i = 0; i < 3; i++) B.box(G, 0.45, 0.1, 0.5, MAT.dark, 14.3, -0.5, (i - 1) * 0.55);
    add('capsule', 'capsule', V(14.5, 0, 0), 'Entrar na cápsula de resgate', 2, 1);
    const holeMark = new T.Mesh(new T.CircleGeometry(0.05, 12), new T.MeshBasicMaterial({ color: 0x111111 })); holeMark.position.set(15.6, 0.35, 0.88); holeMark.rotation.y = Math.PI; G.add(holeMark);
    add('hole', 'hole', V(15.4, 0.3, 0.5), 'Usar o detector ultrassônico de vazamento', 2.2, 3);
    for (let i = 0; i < 8; i++) B.box(groupOf.cargo, 0.55, 0.4, 0.5, MAT.bag, -4.5 + (i % 2 ? 0.55 : -0.55), -5.8 + Math.floor(i / 2) * 0.9, 0.3 * (i % 3 - 1));
    add('cargo', 'cargo', V(-4.5, -3, 0), 'Descarregar a nave de carga', 2.2, 3);

    /* casco externo */
    const hull = new T.Group(); scene.add(hull);
    const hullBoxes = [];
    const hullMat = new T.MeshStandardMaterial({ map: TEX.blanket, roughness: 0.75, metalness: 0.1 });
    mods.forEach((md) => {
      const b = md.box, lx = b[1] - b[0], ly = b[3] - b[2], lz = b[5] - b[4];
      const cx = (b[0] + b[1]) / 2, cy = (b[2] + b[3]) / 2, cz = (b[4] + b[5]) / 2;
      const hg = new T.Group(); hull.add(hg); md.hull = hg;
      let mesh;
      if (md.id === 'cupola') {
        mesh = new T.Mesh(new T.CylinderGeometry(1.0, 1.4, ly, 6, 1, true), hullMat); mesh.position.set(cx, cy, cz);
        for (let i = 0; i < 6; i++) { const a = (i + 0.5) / 6 * Math.PI * 2; const w = new T.Mesh(new T.PlaneGeometry(0.8, ly * 0.7), new T.MeshStandardMaterial({ color: 0x10202e, metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.35, side: T.DoubleSide })); w.position.set(cx + Math.cos(a) * 1.18, cy, cz + Math.sin(a) * 1.18); w.lookAt(cx + Math.cos(a) * 3, cy - 0.4, cz + Math.sin(a) * 3); hg.add(w); }
        hullBoxes.push([b[0] - 0.4, b[1] + 0.4, b[2] - 0.3, b[3], b[4] - 0.4, b[5] + 0.4]);
      } else if (md.node) {
        mesh = new T.Mesh(new T.CylinderGeometry(2.2, 2.2, lx + 0.4, 28, 1, true), hullMat); mesh.rotation.z = Math.PI / 2; mesh.position.set(cx, cy, cz);
        [-1, 1].forEach((s) => { const ring = new T.Mesh(new T.RingGeometry(1.6, 2.2, 28), hullMat); ring.rotation.y = s * Math.PI / 2; ring.position.set(s > 0 ? b[1] + 0.2 : b[0] - 0.2, cy, cz); hg.add(ring); });
        hullBoxes.push([b[0] - 0.2, b[1] + 0.2, b[2] - 0.8, b[3] + 0.8, b[4] - 0.8, b[5] + 0.8]);
      } else if (md.id === 'dragon') {
        mesh = new T.Mesh(new T.CylinderGeometry(1.0, 2.0, lx, 28, 1, false), MAT.white); mesh.rotation.z = -Math.PI / 2; mesh.position.set(cx, cy, cz);
        const trunk = B.cyl(hg, 2.0, 2.0, 2.6, new T.MeshStandardMaterial({ color: 0x222831, roughness: 0.5 }), cx + 2.9, cy, cz, 28); trunk.rotation.z = Math.PI / 2;
        const sp = new T.Mesh(new T.CylinderGeometry(2.02, 2.02, 2.2, 28, 1, true, 0, Math.PI), MAT.solar); sp.rotation.z = Math.PI / 2; sp.position.set(cx + 2.9, cy, cz); hg.add(sp);
        hullBoxes.push([b[0], b[1] + 4.3, -2.1, 2.1, -2.1, 2.1]);
      } else {
        const alongX = lx >= lz && lx >= ly, alongY = ly > lx && ly > lz;
        const r = (alongY ? Math.max(lx, lz) : Math.max(ly, alongX ? lz : lx)) * 0.78 + (md.foil ? 0.35 : 0);
        const len = alongX ? lx : alongY ? ly : lz;
        mesh = new T.Mesh(new T.CylinderGeometry(r, r, len, 28, 1, true), md.foil ? MAT.foil : hullMat);
        if (alongX) mesh.rotation.z = Math.PI / 2; else if (!alongY) mesh.rotation.x = Math.PI / 2;
        mesh.position.set(cx, cy, cz);
        const ends = alongX ? [['-x', b[0], -1], ['+x', b[1], 1]] : alongY ? [['-y', b[2], -1], ['+y', b[3], 1]] : [['-z', b[4], -1], ['+z', b[5], 1]];
        ends.forEach(([fk, pos, s]) => {
          if (md.holes[fk] === 'full') return;
          const cap = new T.Mesh(new T.CircleGeometry(r, 28), md.foil ? MAT.foil : hullMat);
          if (alongX) { cap.rotation.y = s * Math.PI / 2; cap.position.set(pos + s * 0.01, cy, cz); }
          else if (alongY) { cap.rotation.x = -s * Math.PI / 2; cap.position.set(cx, pos + s * 0.01, cz); }
          else { cap.rotation.y = s > 0 ? 0 : Math.PI; cap.position.set(cx, cy, pos + s * 0.01); }
          hg.add(cap);
        });
        if (md.foil) [-1, 1].forEach((s) => { const wing = new T.Mesh(boxGeo(9, 0.06, 3.2, 3, 1.6), [MAT.metal, MAT.metal, MAT.solar, MAT.goldSolar, MAT.metal, MAT.metal]); wing.position.set(cx, cy, cz + s * (r + 4.6)); hg.add(wing); });
        const e = r - (alongY ? lx : ly) / 2 + 0.1;
        if (md.id === 'quest') hullBoxes.push([b[0] - e, b[1] + e, b[2] - e, b[3] + e, b[4], b[5]]);
        else if (md.id !== 'cargo') hullBoxes.push(alongX ? [b[0], b[1], b[2] - e, b[3] + e, b[4] - e, b[5] + e] : [b[0] - e, b[1] + e, b[2] - e, b[3] + e, b[4], b[5]]);
        if (md.id === 'cargo') hg.visible = false;
      }
      mesh.castShadow = true; mesh.receiveShadow = true; hg.add(mesh);
    });
    B.decal(hull, LOGO.aicT(), 4.2, 1.33, 2.5, 1.86, 0, 0).rotation.x = -Math.PI / 2;
    // treliça
    const truss = new T.Group(); truss.position.set(2.5, 4.6, 0); hull.add(truss);
    B.box(truss, 1.6, 1.6, 104, new T.MeshStandardMaterial({ color: 0xc9c9c4, roughness: 0.45, metalness: 0.6 }), 0, 0, 0);
    for (let z = -51; z <= 51; z += 2.5) { B.box(truss, 1.7, 0.08, 0.08, MAT.metal, 0, 0.82, z, { cast: false }); B.box(truss, 1.7, 0.08, 0.08, MAT.metal, 0, -0.82, z, { cast: false }); }
    B.cyl(hull, 0.35, 0.35, 3.2, MAT.metal, 2.5, 2.6, 0, 10);
    hullBoxes.push([2.5 - 0.9, 2.5 + 0.9, 4.6 - 0.9, 4.6 + 0.9, -53, 53]);
    const wingGroups = [];
    [-44, -27, 27, 44].forEach((z) => {
      const wg = new T.Group(); wg.position.set(2.5, 4.6, z); hull.add(wg); wingGroups.push(wg);
      B.box(wg, 1.2, 1.2, 4, MAT.metal, 0, 0, 0);
      [-1, 1].forEach((s) => {
        const blanket = new T.Mesh(boxGeo(0.08, 30, 10.5, 1, 1), [MAT.goldSolar, MAT.solar, MAT.metal, MAT.metal, MAT.metal, MAT.metal]);
        blanket.position.set(0, s * 17.5, 0); blanket.castShadow = true; blanket.receiveShadow = true; wg.add(blanket);
        B.cyl(wg, 0.08, 0.08, 31, MAT.metal, 0, s * 17.5, 0, 6);
      });
    });
    [-12, 12].forEach((z) => { for (let i = 0; i < 3; i++) B.box(hull, 4.0, 0.06, 2.6, MAT.white, -2 - i * 4.3, 3.6 - i * 0.3, z); });
    // Canadarm2
    const arm = { base: new T.Group() };
    arm.base.position.set(3.4, 3.7, 3.2); hull.add(arm.base);
    const armMat = new T.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.5, metalness: 0.2 });
    arm.shoulder = new T.Group(); arm.base.add(arm.shoulder);
    B.cyl(arm.shoulder, 0.3, 0.3, 0.6, MAT.dark, 0, 0, 0, 12);
    arm.upper = new T.Group(); arm.shoulder.add(arm.upper);
    B.cyl(arm.upper, 0.18, 0.18, 8.5, armMat, 0, 4.25, 0, 12);
    arm.elbow = new T.Group(); arm.elbow.position.y = 8.5; arm.upper.add(arm.elbow);
    B.sph(arm.elbow, 0.3, MAT.dark, 0, 0, 0, 12);
    B.cyl(arm.elbow, 0.18, 0.18, 8.5, armMat, 0, 4.25, 0, 12);
    arm.wrist = new T.Group(); arm.wrist.position.y = 8.5; arm.elbow.add(arm.wrist);
    B.cyl(arm.wrist, 0.25, 0.25, 0.6, MAT.dark, 0, 0.3, 0, 12);
    // nave de carga
    const cyg = new T.Group(); hull.add(cyg);
    B.cyl(cyg, 1.5, 1.5, 3.6, new T.MeshStandardMaterial({ color: 0xe9e3d0, roughness: 0.6 }), 0, 0, 0, 24);
    B.cyl(cyg, 1.55, 1.55, 1.2, MAT.foil, 0, -2.4, 0, 24);
    [-1, 1].forEach((s) => { const sp = new T.Mesh(new T.CircleGeometry(2.4, 20), MAT.solar); sp.position.set(s * 4.3, -2.4, 0); sp.rotation.y = s * Math.PI / 2; cyg.add(sp); });
    B.box(cyg, 0.3, 0.6, 0.3, MAT.dark, 0, 1.95, 0);
    const cygFree = V(-4.5, -13, 0), cygBerth = V(-4.5, -3.9, 0);
    cyg.position.copy(cygFree);
    for (let z = 7; z < 22; z += 1.6) { const hr = new T.Mesh(new T.TorusGeometry(0.18, 0.03, 6, 10, Math.PI), MAT.handrail); hr.position.set(2.5, 3.75, z); hr.rotation.x = Math.PI / 2; hull.add(hr); }
    const oru = B.grp(hull, -4.5, 7.4, 0, -1.2);
    B.box(oru, 0.9, 0.7, 0.5, MAT.bag, 0, 0, 0); B.box(oru, 0.92, 0.1, 0.52, MAT.orange, 0, 0.2, 0);
    add('orubag', 'orubag', V(-4.5, -0.6, 7.6), 'Bolsa de ferramentas', 2.6, 2);
    add('orubag_return', 'orubag_return', V(-4.5, -0.6, 7.6), 'Guardar a bateria velha na bolsa', 0.01, 2);
    const slot = B.grp(hull, 2.5, 25, 0, 3.55);
    const oldBatt = B.box(slot, 0.9, 0.5, 1.2, MAT.dark, 0, 0, 0);
    B.label(slot, 'S4 · BATERIA', null, 0, -0.5, 0.62, 0, '#ffc94d', 0.9);
    add('battery_slot', 'battery_slot', V(2.5, 2.9, 25), 'Trocar a bateria da treliça S4', 3, 5);
    add('array', 'array', V(2.5, 2.9, 25), 'Inspecionar a junta dos painéis', 0.01, 3.5);

    Object.assign(P, { leak_n1: V(-6.6, 1.0, -1.0), leak_lab: V(4, 0.8, 0.85), leak_n2: V(12.6, -1.0, 1.0), leak_kibo: V(9.2, 0.8, -6) });
    ['leak_n1', 'leak_lab', 'leak_n2', 'leak_kibo'].forEach((id) => inter.push({ id, kind: 'leak', pos: P[id], label: 'Consertar o filtro de CO₂', r: 2.2, hold: 3 }));
    inter.forEach((i) => { P[i.id] = i.pos; eng.addInteract(i); });

    let cargoOpen = false, suited = false;
    const coll = mods.map((m) => {
      const b = m.box.slice(), ext = 0.7;
      Object.entries(m.holes).forEach(([f, h]) => {
        if (h !== 'full' && !(m.id === 'quest' && f === '+z') && !(m.id === 'n1' && f === '-y')) return;
        if (m.id === 'n1') return;
        if (f === '+x') b[1] += ext; if (f === '-x') b[0] -= ext; if (f === '+y') b[3] += ext; if (f === '-y') b[2] -= ext; if (f === '+z') b[5] += ext; if (f === '-z') b[4] -= ext;
      });
      return { id: m.id, b };
    });
    const inB = (p, b, m) => p.x >= b[0] + m && p.x <= b[1] - m && p.y >= b[2] + m && p.y <= b[3] - m && p.z >= b[4] + m && p.z <= b[5] - m;
    const hatch = V(-4.5, 0, 6.4);
    const insideAny = (p, m = 0.28) => coll.some((c) => {
      if (c.id === 'cargo' && !cargoOpen) return false;
      if (c.id === 'quest' && !suited && p.z > 6.0) return false;
      return inB(p, c.b, m);
    });
    eng.floatAllowed = (p) => {
      if (insideAny(p)) return true;
      if (!suited) return false;
      if (p.distanceTo(hatch) > 48) return false;
      return !hullBoxes.some((b) => inB(p, b, -0.3)) && !mods.some((m) => (m.id !== 'cargo' || cargoOpen) && inB(p, m.box, -0.4));
    };
    const isInside = (p) => mods.some((m) => (m.id !== 'cargo' || cargoOpen) && inB(p, m.box, -0.05));
    const inShelter = (p) => inB(p, mods.find((m) => m.id === 'n2').box, 0);
    const roomOf = (p) => { const m = mods.find((mm) => (mm.id !== 'cargo' || cargoOpen) && inB(p, mm.box, -0.05)); return m ? m.label : null; };

    const armTarget = V(); let armT = 0;
    function solveArm(target) {
      const base = new T.Vector3(); arm.base.getWorldPosition(base);
      const d = target.clone().sub(base), dist = clamp(d.length(), 1, 16.9);
      arm.shoulder.rotation.set(0, Math.atan2(d.x, d.z), 0);
      const horiz = Math.hypot(d.x, d.z), toT = Math.atan2(horiz, d.y);
      const a1 = Math.acos(clamp(dist / 17, -1, 1));
      arm.upper.rotation.set(toT - a1, 0, 0);
      arm.elbow.rotation.set(2 * a1, 0, 0);
    }
    let alarmT = 0;
    const ORBIT = 90;
    const sunDir = (t) => { const a = t / ORBIT * Math.PI * 2; return V(Math.sin(a), Math.cos(a), 0.25).normalize(); };
    const cosLimb = -Math.cos(Math.asin(R / (R + ALT)));
    const sunlit = (t) => sunDir(t).y > cosLimb;
    const stowed = V(-6, 9, 8);
    function update(dt, info) {
      const d = sunDir(info.tAbs), lit = d.y > cosLimb;
      sun.position.copy(d).multiplyScalar(200); sun.intensity = lit ? 2.6 : 0;
      sunGlow.position.copy(eng.camera.position).addScaledVector(d, 6000); sunGlow.material.opacity = lit ? 1 : 0;
      earthG.rotation.z = -info.tAbs / ORBIT * Math.PI * 2;
      earth.setSun(d);
      stars.position.copy(eng.camera.position);
      const a = Math.atan2(d.y, d.x);
      wingGroups.forEach((w) => { w.rotation.z += (a - w.rotation.z) * Math.min(1, dt * 0.5); });
      const cs = info.cargo || 'free';
      if (cs === 'free') { cyg.position.copy(cygFree); cyg.rotation.set(0, info.tAbs * 0.02, 0); armTarget.lerp(stowed, Math.min(1, dt)); }
      else if (cs === 'grapple') armTarget.lerp(cyg.position.clone().add(V(0, 2.3, 0)), Math.min(1, dt * 0.8));
      else if (cs === 'berthing') { armT = Math.min(1, armT + dt / 6); cyg.position.lerpVectors(cygFree, cygBerth, armT * armT * (3 - 2 * armT)); cyg.rotation.y *= 0.95; armTarget.copy(cyg.position).add(V(0, 2.3, 0)); }
      else if (cs === 'berthed') { cyg.position.copy(cygBerth); cyg.rotation.set(0, 0, 0); armTarget.lerp(stowed, Math.min(1, dt * 0.5)); }
      solveArm(armTarget);
      B.animateCrew(crew, info.tAbs);
      oldBatt.material = info.battSwapped ? MAT.navy : MAT.dark;
      alarmT += dt;
      const red = info.alarm && Math.sin(alarmT * 7) > 0;
      mods.forEach((m) => { if (!m.light) return; m.light.color.setHex(red ? 0xff2a2a : 0xf4f7ff); m.light.intensity = info.power < 0.2 ? 0.3 : 0.95; });
    }
    function setCargo(state) { if (state === 'berthed' && !cargoOpen) { cargoOpen = true; groupOf.cargo.visible = true; cbmHatch.visible = false; } }
    function setSuited(on) { suited = on; questHatch.visible = !on; }
    const spawns = { wake: { x: 8.6, y: 0.4, z: 0, yaw: Math.PI / 2 }, hub: { x: -4.5, y: 0, z: 0, yaw: -Math.PI / 2 }, quest: { x: -4.5, y: 0, z: 2.2, yaw: Math.PI } };
    const map = { mods: mods.map((m) => ({ b: m.box, label: m.label, id: m.id })), view: { cx: -6, cz: -1, size: 50 } };
    armTarget.copy(stowed); solveArm(stowed);

    return {
      kind: 'orbit', farm, points: P, isInside, inShelter, roomOf, update, vehicle: null, setCargo, setSuited, map,
      spawns, spawn: spawns.hub,
      sunFactor: (time01, shadow, tAbs) => (sunlit(tAbs) ? 1 / 0.61 : 0),
      sunlit, ORBIT,
      leakSpots: ['leak_n1', 'leak_lab', 'leak_n2', 'leak_kibo']
    };
  }

  window.Worlds3D = { buildGround, buildOrbit };
})();

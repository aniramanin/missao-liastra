"""Gera teacher.html (PT) e teacher-en.html (EN): guia do professor imprimível."""
M = [  # id, mundo, PT, EN, conceitos PT, conceitos EN
 ('horta1','mars',('HORTA-1','A primeira horta de Marte','Iniciante','10 a 15 min'),('GARDEN-1','The first garden on Mars','Beginner','10–15 min'),'fotossíntese, luz LED e energia, ciclo da água','photosynthesis, LED light and power, water cycle'),
 ('ares1','mars',('ARES-1','Primeiro Sol em Jezero','Iniciante','15 a 20 min'),('ARES-1','First Sol at Jezero','Beginner','15–20 min'),'rotina de astronauta, suporte de vida, amostras de rocha','astronaut routine, life support, rock samples'),
 ('duna2','mars',('DUNA-2','A Grande Tempestade','Intermediário','15 min'),('DUNE-2','The Great Storm','Intermediate','15 min'),'energia solar, poeira, economia de energia','solar power, dust, saving energy'),
 ('dep3f','mars',('DEPÓSITO-3F','Guardar amostras para o futuro','Intermediário','10 a 15 min'),('DEPOT-3F','Saving samples for the future','Intermediate','10–15 min'),'método científico, planejamento de longo prazo','scientific method, long-term planning'),
 ('artemis','moon',('ARTEMIS-L','Caminhada no Polo Sul','Intermediário','15 a 20 min'),('ARTEMIS-L','South Pole Moonwalk','Intermediate','15–20 min'),'gelo lunar, radiação, caminhada espacial','lunar ice, radiation, spacewalks'),
 ('filtro13','moon',('FILTRO-13','O filtro improvisado','Intermediário','10 min'),('FILTER-13','The improvised filter','Intermediate','10 min'),'CO₂, resolução de problemas com recursos limitados','CO₂, problem solving with limited resources'),
 ('selene','moon',('SELENE','Sombra na Cratera','Avançado','15 min'),('SELENE','Crater Shadow','Advanced','15 min'),'noite lunar, baterias, reator de fissão','lunar night, batteries, fission reactor'),
 ('iss-day','orbit',('EXPEDIÇÃO LIASTRA','Um dia na Estação','Iniciante','15 min'),('EXPEDITION LIASTRA','A day on the Station','Beginner','15 min'),'microgravidade, exercício, ciência em órbita','microgravity, exercise, science in orbit'),
 ('iss-cargo','orbit',('CARGA-1','Captura com o braço robótico','Intermediário','10 a 15 min'),('CARGO-1','Robotic arm capture','Intermediate','10–15 min'),'robótica, movimento em órbita, paciência','robotics, motion in orbit, patience'),
 ('vaz18','orbit',('VAZAMENTO-18','O furo na nave acoplada','Intermediário','10 min'),('LEAK-18','The hole in the docked ship','Intermediate','10 min'),'pressão do ar, investigação sistemática','air pressure, systematic investigation'),
 ('iss-eva','orbit',('EVA-LIASTRA','Troca de baterias','Avançado','15 min'),('EVA-LIASTRA','Battery swap','Advanced','15 min'),'caminhada espacial, energia da estação','spacewalks, station power'),
]
T = {
 'pt': dict(lang='pt-BR', file='teacher.html', other='teacher-en.html', otherLabel='EN', home='index.html', title='Guia do professor', h1='Guia do professor', lead='Como usar o Junior Astronaut Mission Trainer numa aula de 45 a 50 minutos. Funciona no navegador, sem cadastro, em computadores, tablets e celulares.',
   print='Imprimir este guia', play='Abrir o jogo',
   obj_h='Objetivos de aprendizagem', obj=['Explicar por que, numa base fora da Terra, <b>toda escolha tem um custo</b>: energia usada num sistema falta em outro.','Descrever como a <b>radiação solar</b> ameaça a tripulação e como água e regolito servem de escudo.','Entender que o <b>atraso de comunicação</b> com Marte obriga a tripulação a decidir sozinha.','Relacionar <b>plantas, luz e oxigênio</b>: a estufa é comida e também suporte de vida.','Ler e confiar em <b>dados reais</b>: o clima espacial do jogo vem do Sol de verdade (NASA DONKI).'],
   plan_h='Roteiro da aula (45 a 50 min)', plan=[('5 min','Pergunta de abertura','“Se vocês morassem em Marte, o que acabaria primeiro: o ar, a água, a comida ou a energia?” Anote as respostas no quadro.'),('25 min','Missão em duplas','Cada dupla escolhe uma missão da tabela abaixo. Uma pessoa joga, a outra lê o checklist e o painel de energia; trocam no meio.'),('10 min','Quiz e relatório','No fim da missão, cada dupla responde ao desafio de 3 perguntas e usa o botão “Copiar resumo para a turma”.'),('5 a 10 min','Conversa final','Comparem as escolhas das duplas usando as perguntas de discussão.')],
   mis_h='Missões recomendadas', th=['Missão','Mundo','Nível','Tempo','Conceitos'], world={'mars':'Marte','moon':'Lua','orbit':'Estação Espacial'},
   disc_h='Perguntas para a discussão', disc=['Qual escolha pareceu segura, mas custou caro depois?','Por que a dose de radiação na Lua é maior que em Marte?','Se a mensagem para a Terra leva 11 minutos, que decisões a tripulação deve saber tomar sozinha?','O que a estufa devolve para a base além de comida?','O que vocês fariam diferente na próxima missão?'],
   ass_h='Como avaliar', ass=[('Quiz no jogo','Ao fim de cada missão aparecem 3 perguntas (2 sobre o mundo da missão e 1 geral). O placar entra no resumo copiado.'),('Relatório da dupla','O resumo traz resultado, estrelas, ciência, radiação, colheitas, tarefas concluídas e a base real da missão.'),('Rubrica simples','<b>Iniciando:</b> descreve o que aconteceu. <b>Desenvolvendo:</b> explica uma troca entre dois recursos. <b>Dominando:</b> justifica uma decisão com um dado real do jogo.')],
   unp_h='Atividade sem computador: as 6 células', unp='Imprima a tabela e entregue 6 fichas para cada grupo. Uma tempestade solar está chegando: o grupo divide as fichas entre os sistemas e explica a escolha. Depois, revele o efeito de cada sistema (como no painel de energia do jogo).',
   unp_t=[('Suporte de vida','cada ficha mantém o ar e a água; abaixo de 3, o ar começa a acabar'),('Estufa (luz LED)','cada ficha faz as plantas crescerem e produz comida e oxigênio'),('Escudo d’água','até 2 fichas reduzem a radiação dentro da base; mais que isso não ajuda'),('Ciência','cada ficha gera descobertas, mas não mantém ninguém vivo')], unp_th=['Sistema','O que a ficha faz','Fichas do grupo'],
   data_h='De onde vêm os dados', data='Clima espacial: NASA DONKI (ao vivo, com arquivo real de reserva). Radiação: Curiosity/RAD em Marte (0,67 mSv por dia) e Chang’e 4 na Lua (1,37 mSv por dia). Atraso Terra–Marte: elementos orbitais do JPL. Imagem do Sol: NASA SDO. Suporte de vida: NASA, Baseline Values and Assumptions Document. O que é simplificado (tempo acelerado, limite de treino de 50 mSv) está explicado no site.',
   foot='Aerospace Innovation Center · LIASTRA Institute · NASA Space Apps Challenge 2026. Projeto independente; não é um produto oficial da NASA.'),
 'en': dict(lang='en', file='teacher-en.html', other='teacher.html', otherLabel='PT', home='en.html', title='Teacher guide', h1='Teacher guide', lead='How to use the Junior Astronaut Mission Trainer in a 45 to 50 minute lesson. It runs in the browser, with no sign-up, on computers, tablets and phones.',
   print='Print this guide', play='Open the game',
   obj_h='Learning objectives', obj=['Explain why, at a base beyond Earth, <b>every choice has a cost</b>: power used by one system is missing from another.','Describe how <b>solar radiation</b> threatens the crew and how water and regolith work as shields.','Understand that the <b>communication delay</b> with Mars forces the crew to decide on its own.','Connect <b>plants, light and oxygen</b>: the greenhouse is food and also life support.','Read and trust <b>real data</b>: the game’s space weather comes from the real Sun (NASA DONKI).'],
   plan_h='Lesson plan (45 to 50 min)', plan=[('5 min','Opening question','“If you lived on Mars, what would run out first: air, water, food or power?” Write the answers on the board.'),('25 min','Mission in pairs','Each pair picks a mission from the table below. One student plays, the other reads the checklist and the energy panel; they swap halfway.'),('10 min','Quiz and report','At the end of the mission, each pair answers the 3-question challenge and uses the “Copy a summary for class” button.'),('5 to 10 min','Wrap-up talk','Compare the pairs’ choices using the discussion questions.')],
   mis_h='Recommended missions', th=['Mission','World','Level','Time','Concepts'], world={'mars':'Mars','moon':'Moon','orbit':'Space Station'},
   disc_h='Discussion questions', disc=['Which choice looked safe but cost a lot later?','Why is the radiation dose on the Moon higher than on Mars?','If a message to Earth takes 11 minutes, which decisions must the crew be able to make alone?','Besides food, what does the greenhouse give back to the base?','What would you do differently on the next mission?'],
   ass_h='How to assess', ass=[('In-game quiz','At the end of each mission there are 3 questions (2 about the mission’s world and 1 general). The score goes into the copied summary.'),('Pair report','The summary includes the result, stars, science, radiation, harvests, tasks completed and the mission’s real basis.'),('Simple rubric','<b>Beginning:</b> describes what happened. <b>Developing:</b> explains a trade-off between two resources. <b>Mastering:</b> justifies a decision with a real number from the game.')],
   unp_h='Unplugged activity: the 6 cells', unp='Print the table and give each group 6 tokens. A solar storm is coming: the group splits the tokens among the systems and explains its choice. Then reveal what each system does (like the game’s energy panel).',
   unp_t=[('Life support','each token keeps air and water going; below 3, air starts to run out'),('Greenhouse (LED light)','each token grows the plants and makes food and oxygen'),('Water shield','up to 2 tokens cut radiation inside the base; more does not help'),('Science','each token makes discoveries but keeps no one alive')], unp_th=['System','What a token does','Group tokens'],
   data_h='Where the data comes from', data='Space weather: NASA DONKI (live, with a real backup archive). Radiation: Curiosity/RAD on Mars (0.67 mSv per day) and Chang’e 4 on the Moon (1.37 mSv per day). Earth–Mars delay: JPL orbital elements. Image of the Sun: NASA SDO. Life support: NASA, Baseline Values and Assumptions Document. What is simplified (sped-up time, the 50 mSv training limit) is explained on the website.',
   foot='Aerospace Innovation Center · LIASTRA Institute · NASA Space Apps Challenge 2026. Independent project; not an official NASA product.'),
}
CSS = """
.tg{max-width:900px;margin:0 auto;padding:56px 22px 80px}
.tg h1{font-family:var(--f-display);font-size:clamp(36px,6vw,56px);letter-spacing:-.03em;margin:0 0 12px}
.tg .lead{font-size:19px;color:var(--gray);margin:0 0 22px}
.tg h2{font-family:var(--f-display);font-size:26px;margin:44px 0 14px;letter-spacing:-.01em}
.tg ol,.tg ul{padding-left:22px}.tg li{margin:6px 0}
.tg-actions{display:flex;gap:12px;flex-wrap:wrap}
.tg table{width:100%;border-collapse:collapse;font-size:15px}
.tg th,.tg td{text-align:left;padding:10px 12px;border-bottom:1px solid #e5e5ea;vertical-align:top}
.tg th{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--gray)}
.tg .plan{display:grid;gap:10px}
.tg .plan div{display:grid;grid-template-columns:110px 1fr;gap:16px;padding:14px 16px;background:var(--light);border-radius:16px}
.tg .plan b{display:block}
.tg .card{padding:16px 18px;background:var(--light);border-radius:16px;margin:10px 0}
.tg .blank{min-width:120px;border-bottom:1px solid #999}
.tg-foot{margin-top:56px;font-size:13px;color:var(--gray)}
.tg-top{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;background:#161617;color:#e8e8ed}
.tg-top a{color:#e8e8ed;text-decoration:none;font-size:14px}
.tg-top .brand{display:inline-flex;gap:9px;align-items:center;font-weight:600}
@media print{.tg-top,.tg-actions{display:none}.tg{padding:0}.tg .plan div,.tg .card{background:none;border:1px solid #ddd}body{background:#fff}}
@media (max-width:640px){.tg .plan div{grid-template-columns:1fr;gap:4px}.tg table{font-size:13.5px}}
"""
for k, t in T.items():
    rows = ''.join(f"<tr><td><b>{(p if k=='pt' else e)[0]}</b><br>{(p if k=='pt' else e)[1]}</td><td>{t['world'][w]}</td><td>{(p if k=='pt' else e)[2]}</td><td>{(p if k=='pt' else e)[3]}</td><td>{cp if k=='pt' else ce}</td></tr>" for (_, w, p, e, cp, ce) in M)
    html = f"""<!doctype html>
<html lang="{t['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t['title']} · Aerospace Innovation Center</title>
<meta name="description" content="{t['lead']}">
<link rel="icon" type="image/png" href="assets/aic-emblem.png">
<link rel="stylesheet" href="css/styles.css?v=37">
<style>{CSS}</style>
</head>
<body>
<header class="tg-top"><a class="brand" href="{t['home']}"><img src="assets/aic-emblem-white.png" alt="" width="26" height="26">Aerospace Innovation Center</a><a href="{t['other']}" hreflang="{'en' if k=='pt' else 'pt-BR'}">{t['otherLabel']}</a></header>
<main class="tg">
  <p class="eyebrow-c" style="text-align:left">Junior Astronaut Mission Trainer</p>
  <h1>{t['h1']}</h1>
  <p class="lead">{t['lead']}</p>
  <div class="tg-actions"><a class="btn btn-blue" href="{t['home']}#jogar">{t['play']}</a><button class="btn btn-ghost-light" style="color:#1d1d1f;border-color:#1d1d1f" onclick="window.print()">{t['print']}</button></div>

  <h2>{t['obj_h']}</h2><ol>{''.join(f'<li>{o}</li>' for o in t['obj'])}</ol>
  <h2>{t['plan_h']}</h2><div class="plan">{''.join(f'<div><span><b>{a}</b></span><span><b>{b}</b>{c}</span></div>' for a, b, c in t['plan'])}</div>
  <h2>{t['mis_h']}</h2><table><thead><tr>{''.join(f'<th>{h}</th>' for h in t['th'])}</tr></thead><tbody>{rows}</tbody></table>
  <h2>{t['disc_h']}</h2><ul>{''.join(f'<li>{d}</li>' for d in t['disc'])}</ul>
  <h2>{t['ass_h']}</h2>{''.join(f'<div class="card"><b>{a}</b><br>{b}</div>' for a, b in t['ass'])}
  <h2>{t['unp_h']}</h2><p>{t['unp']}</p><table><thead><tr>{''.join(f'<th>{h}</th>' for h in t['unp_th'])}</tr></thead><tbody>{''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td><span class="blank">&nbsp;</span></td></tr>' for a, b in t['unp_t'])}</tbody></table>
  <h2>{t['data_h']}</h2><p>{t['data']}</p>
  <p class="tg-foot">{t['foot']}</p>
</main>
</body>
</html>
"""
    open(t['file'], 'w').write(html)
print('ok')

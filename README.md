# Aerospace Innovation Center · Junior Astronaut Mission Trainer

Simulador 3D para todas as idades, feito para o desafio
[Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)
do NASA Space Apps Challenge 2026.

**Jogar:** https://aniramanin.github.io/missao-liastra/ (português) · https://aniramanin.github.io/missao-liastra/en.html (English)

**Vídeo de apresentação (30 s):** [português](media/aerospace-innovation-center-pt.mp4) · [English](media/aerospace-innovation-center-en.mp4)


Um simulador **3D em primeira pessoa** (Three.js, com bloom e reflexos de ambiente) em que o jogador vive missões reais.

**Projeto:** Aerospace Innovation Center (AIC), do LIASTRA Institute. Logo e emblema em `assets/aic-*.png`.

**Equipe:** Marina Freitas e Luiza Oliveira, fundadoras do Aerospace Innovation Center, com Raylla Vardiero, Esther Anjo e Barbara Dorneles no time do NASA Space Apps Challenge 2026.

**Quem faz:** LIASTRA Institute. As bases pertencem ao **Aerospace Innovation Center (AIC)**, do LIASTRA. Os laboratórios são do **ICBS** (International Center for Biomedical & Space Sciences), o centro de pesquisa do LIASTRA. As três logos aparecem no site e dentro do jogo (placa da base, casco, Comando, Laboratório ICBS, módulos da estação).

### Mapas
- **Base AIC Jezero (Marte)** e **Base AIC Shackleton (Lua)**: Comando com mesa holográfica e consoles, Habitação com 4 cabines de dormir, Banheiro (chuveiro, vaso, pia), Cozinha com mesa, Abrigo de radiação com paredes de água, Laboratório ICBS com glovebox, microscópio, freezer −80 °C, impressora 3D e enfermaria, Suporte de Vida (gerador de O₂, filtro de CO₂, reciclador de água, painel elétrico, baterias), Academia (esteira, bicicleta, musculação), Estufa de vidro com cúpula geodésica e Escotilha com trajes. Fora: painéis solares (verticais na Lua, como os estudados pela NASA), reator de fissão, antena, plataforma de pouso com nave, perfuratriz de gelo, sismômetro, estação meteorológica, crateras com amostras e um rover dirigível. Na Lua, Habitação e Abrigo ficam sob uma camada de regolito.
- **Cópia da Estação Espacial Internacional**: Zvezda, Zarya, Unity, Destiny, Harmony, Columbus, Kibo, Quest, Tranquility, Cúpula e cápsula acoplada, com racks, corrimões, bolsas, laptops, cabines, banheiro espacial, esteira T2, ARED, Veggie, MELFI, glovebox; treliça de 104 m com 8 asas solares que giram para o Sol, radiadores, braço Canadarm2 e nave de carga. A Terra usa a textura real Blue Marble da NASA, com luzes noturnas.

### Agricultura espacial
A estufa tem 6 bandejas (2 na estação: Veggie e Plant Habitat) com 6 culturas reais: alface roxa, rabanete, tomate anão, pimenta chili, batata e trigo anão. Cada uma tem tempo de crescimento, comida, oxigênio e água próprios, e um fato real sobre quando foi cultivada no espaço. A luz LED vem das células de energia: mais luz, crescimento mais rápido. As plantas passam por broto, crescimento, flor e ponto de colheita; se ficarem tempo demais, a qualidade cai. Colher devolve comida e oxigênio. Durante o sono as plantas crescem com a luz que ficou ligada.

### Tripulação
Quatro tripulantes trabalham na base (dois na estação). Fale com eles para receber dicas da próxima tarefa e curiosidades.

### Idiomas
Português (`index.html`) e inglês (`en.html`). As traduções do jogo ficam em `js/lang-en.js`; `js/i18n.js` escolhe o idioma pelo `lang` da página.

### Jogabilidade
- **Câmera em 1ª ou 3ª pessoa** (tecla V, botão no HUD ou menu de pausa). Na 3ª pessoa o avatar anda, flutua na Estação e veste o traje com capacete; em espaços apertados a câmera volta sozinha para a 1ª pessoa.
- **Recompensas:** XP por missão (estrelas, patch novo e quiz), 7 patentes de astronauta, 11 medalhas e 7 cores de macacão desbloqueáveis para o avatar. O perfil aparece na Central de Missões.
- **Idioma dentro do jogo:** botão PT/EN no HUD e no menu de pausa.
- **Carregamento:** o terreno de Marte e da Lua é calculado uma vez por sessão (Marte: de 2,2 s para 0,4 s na primeira vez e 0,1 s depois), e a memória é liberada entre missões.

### Para professores e aprendizagem
- **Guia do professor** em [português](teacher.html) e [inglês](teacher-en.html): objetivos, aula de 45 min, missões recomendadas, perguntas, rubrica e atividade sem computador.
- **Quiz de 3 perguntas** no fim de cada missão (2 sobre o mundo e 1 geral), com explicação e placar no resumo da turma.
- **Previsão de esgotamento** no painel de energia: quantos sóis faltam para o ar, a comida ou a bateria acabarem.
- **O Sol ao vivo** (NASA SDO, AIA 193 Å) no rádio do jogo e na seção de dados do site.
- **Números reais de suporte de vida** da NASA no tablet (BVAD), com fonte.
- **Acessibilidade** no menu de pausa: texto maior, alto contraste e menos movimento e brilho.

Análise dos outros projetos do desafio: [docs/analise-concorrentes.md](docs/analise-concorrentes.md). Texto da submissão em inglês: [docs/space-apps-submission-en.md](docs/space-apps-submission-en.md).

### Missões (cada uma com patch próprio)
| Patch | Mundo | Baseada em |
|---|---|---|
| HORTA-1 · A primeira horta de Marte | Marte | Experimentos Veggie e Plant Habitat da ISS e batatas em condições de Marte (CIP, Peru) |
| ARES-1 · Primeiro Sol em Jezero | Marte | Rotina do CHAPEA (NASA, 2023–2024) e amostra Cheyava Falls (Perseverance, 2024) |
| DUNA-2 · A Grande Tempestade | Marte | Tempestade global de 2018 que encerrou o rover Opportunity |
| ARTEMIS-L · Caminhada no Polo Sul | Lua | Plano da Artemis III: amostras, gelo em cratera escura, sismômetro |
| SELENE · Sombra na Cratera | Lua | Noite lunar e projeto Fission Surface Power da NASA |
| EXPEDIÇÃO LIASTRA · Um dia na Estação | Órbita | Rotina diária real da ISS |
| EVA-LIASTRA · Troca de baterias | Órbita | Caminhadas espaciais de 2017–2021 para trocar baterias da treliça |
| CARGA-1 · Captura com o braço robótico | Órbita | Captura de naves Cygnus pelo Canadarm2 a partir da Cúpula |
| DEPÓSITO-3F · Guardar amostras para o futuro | Marte | Depósito Three Forks do Perseverance (dez/2022–jan/2023) |
| FILTRO-13 · O filtro improvisado | Lua | Adaptador de CO₂ improvisado na Apollo 13 (1970) |
| VAZAMENTO-18 · O furo na nave acoplada | Órbita | Furo de 2 mm achado e vedado na Soyuz acoplada à ISS (ago/2018) |
| Sobrevivência (3) | Todos | Clima espacial real do DONKI, eventos aleatórios |

Fluxo: Central de Missões → chamada da missão (patch, base real, briefing, objetivos) → tutorial (na primeira vez) → missão com checklist, marcador 3D, minimapa e tablet (Tab) → patch conquistado e relatório.

O que dá para fazer: dormir, tomar banho, usar o banheiro, escovar os dentes, cozinhar, comer, treinar, operar o gerador de O₂, trocar o filtro de CO₂, reciclar água, desligar sistemas no painel elétrico, analisar amostras, fazer experimentos, imprimir peças, check-up médico, plantar, iluminar e colher 6 culturas, vestir o traje (com pré-respiração), sair em EVA, dirigir o rover, perfurar gelo, instalar sismômetro, ligar o reator, fotografar a Terra, operar o braço robótico, trocar baterias na treliça e descarregar naves de carga.

## Como rodar

É um site estático, sem build e sem dependências. Basta servir a pasta:

```bash
python3 -m http.server 8765
```

Depois abra http://localhost:8765 (ou http://localhost:8765/en.html). O site está publicado no GitHub Pages a partir da branch `main`.

## O que mudou em relação à versão 1 (AI Studio)

| Versão 1 (Base Liastra Marte) | Versão 3 (Missão Liastra 3D) |
|---|---|
| Presa ao Google AI Studio e à API Gemini | Site estático independente, roda em qualquer hospedagem |
| Só Marte | Marte, Lua e estação orbital |
| Teclado apenas | Teclado e mouse no computador, joystick na tela no celular |
| 5 sinais vitais + 3 materiais + árvore de tecnologia | 3 recursos principais + radiação, ciência e oxigênio do traje |
| Sem radiação, sem atraso de comunicação | Tempestades do Sol real (DONKI), abrigo, escudo d'água, atraso Terra–Marte calculado no dia |
| Números inventados | Doses medidas por rovers e sondas, eventos baseados em fatos reais com fonte |
| Sem níveis | Cadete (para começar), Comandante e Diretor de Voo (desafio máximo) |

## Dados da NASA usados e por quê

| Dado | Como o jogo usa | Fonte |
|---|---|---|
| **DONKI · Ejeções de Massa Coronal** | Cada sol da missão corresponde a um dia real. A CME mais rápida do dia define o risco de tempestade de partículas (até 499 km/s calmo, 500–799 agitado, 800+ perigoso). | `https://api.nasa.gov/DONKI/CME` (ao vivo, últimos 30 dias). Se falhar, usa `js/donki-archive.js`: 86 CMEs reais de 15/10 a 13/11/2026, baixadas em 14/11/2026. A tela sempre diz qual está em uso. |
| **Dose na ISS** | Cerca de 0,6 mSv por dia na órbita (tripulações recebem de 0,4 a 0,9 mSv/dia). | NASA Human Research Program |
| **Curiosity / RAD** | Dose diária em Marte: 0,67 mSv. | Hassler et al., *Science* 2014, doi:10.1126/science.1244797 |
| **Tempestade de maio de 2024 em Marte** | Carta de tempestade solar (dose de ~30 raios-X de tórax medida pelo Curiosity). | NASA/JPL |
| **Chang'e 4 / LND** | Dose diária na Lua: 1,37 mSv (primeira medição no solo lunar). | Zhang et al., *Science Advances* 2020, doi:10.1126/sciadv.aaz1334 |
| **Elementos orbitais JPL (J2000)** | Distância Terra–Marte e atraso de luz do dia, calculados no navegador. Em 14/11/2026: 1,32 UA, cerca de 11 minutos. | JPL Solar System Dynamics, "Approximate Positions of the Planets" |
| **MOXIE, Perseverance, Opportunity** | Cartas de evento (oxigênio a partir de CO₂, rocha Cheyava Falls, tempestade de poeira de 2018). | NASA Science, NASA/JPL |
| **Biologia espacial** | Plantas em regolito da Apollo (Paul et al. 2022), Estudo dos Gêmeos (Garrett-Bakelman et al. 2019), perda óssea, zínias na ISS. | NASA OSDR / Human Research Program |

### O que é simplificado

- A missão é acelerada: um sol dura cerca de 3,5 minutos e, no rádio, 1 minuto real de atraso vira 2 segundos.
- Fora da base a dose é multiplicada por 3 (simplificação da proteção do habitat).
- O limite de 50 mSv é um limite de treino do jogo. O limite real de carreira da NASA é 600 mSv.
- A dose de uma tempestade sem proteção (16 mSv em Marte, 30 mSv na Lua) é uma estimativa didática.
- O risco de tempestade usa só a velocidade da CME, sem considerar a direção.

## Estrutura

```
index.html            landing page em português + contêiner do jogo
en.html               landing page em inglês
js/i18n.js            escolha de idioma (L, tr)
js/lang-en.js         traduções do jogo para inglês
js/farm.js            culturas da agricultura espacial
js/learn.js           quiz de fim de missão e imagem do Sol ao vivo
js/rewards.js         XP, patentes, medalhas e cores de traje
teacher.html          guia do professor (PT) · teacher-en.html (EN)
tools/gen_teacher.py  gera as páginas do guia do professor
css/styles.css        estilos do site e do jogo
js/donki-archive.js   arquivo real do DONKI (fallback)
js/data.js            locais, glossário, fatos e fontes
js/spaceweather.js    busca ao vivo no DONKI + cálculo Terra–Marte
js/assets.js          logos (LIASTRA, AIC, ICBS) e texturas da Terra embutidas
js/engine3d.js        motor 3D: render, bloom, controles, física, móveis e máquinas
js/worlds3d.js        mapas de Marte, Lua e estação orbital
js/events3d.js        eventos do modo sobrevivência
js/missions.js        missões, checklists e gerador de patches
js/game3d.js          simulação em tempo real, tarefas, HUD e painéis
js/site.js            interações da landing page
```

Three.js r128 vem do cdnjs; os passes de bloom vêm do jsDelivr (three@0.128.0). As texturas da Terra são NASA Blue Marble/Black Marble (domínio público), via pacote three-globe.

Projeto da equipe LIASTRA. Não é um produto oficial da NASA.

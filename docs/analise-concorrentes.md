# Análise dos projetos do desafio "Build a Junior Astronaut Mission Trainer"

Levantamento feito em 15/11/2026 na página Find a Team do NASA Space Apps Challenge 2026, filtrando pelo desafio.

## Números

| | |
|---|---|
| Equipes inscritas no desafio | 3.361 |
| Equipes lidas (o site para de carregar em 3.000) | 3.000 |
| Projetos enviados entre as lidas | 1.537 |
| Projetos que citam 3D (Three.js, Unity, WebGL…) | 574 |
| Projetos que citam dados da NASA (DONKI, RAD, JPL…) | 1.156 |
| Projetos com recursos para professores | 252 |
| Projetos com VR/AR | 57 |

A nossa equipe aparece como **LIASTRA**. Na nota automática feita a partir das descrições (recursos citados e profundidade do texto), ficamos na posição 433 de 1.537. O motivo não é o jogo, e sim a submissão: o campo Details estava em português, o campo Solution estava vazio, não havia declaração de uso de IA e o link do demo baixava o vídeo em vez de tocar.

## Os concorrentes mais fortes

| Projeto | Destaques | O que tínhamos de menos |
|---|---|---|
| **Escape Velocity** (playescapevelocity.com) | Campanha com 3 gerações de tripulação, oxigênio do ar e do foguete competindo, DONKI ao vivo com selo LIVE/ARCHIVE, atraso pelo JPL, terreno do Mars Trek e mapas de gelo SWIM, prévia do resultado antes de confirmar, sugestão de plano, códigos de turma, painel do professor ao vivo, guia do professor, testes automatizados | Guia do professor, prévia das consequências |
| **Mission Mars** (Escuadrón Rojo, missionmars.cloud) | 13 experimentos baseados em instrumentos reais, laser do rover, mapa SWIM, estufa Veggie, globo de Marte com fotos reais, WebXR, 4 idiomas e 3 faixas etárias | Mais idiomas, VR |
| **Mission: Moonbound** (STAR Devs) | 30 dias na Lua seguindo 5 meses reais de atividade solar, imagens reais do Sol (SDO) e previsões da NOAA no briefing | Imagem real do Sol |
| **ASTRA: Mission Control** | Números reais de suporte de vida da NASA (0,84 kg de O₂ por dia), MOXIE, dose por tripulante, aviso de quando a bateria acaba, CAPCOM, biblioteca de ciência com OSDR | Números reais na interface, previsão de esgotamento |
| **Sarmad: First Light** | Desenho instrucional com 3 objetivos de aprendizagem, tarefas sem dica no fim e relatório separado por habilidade | Avaliação do aprendizado |

## Onde já estávamos à frente
- Imersão: três mundos completos em 3D para andar por dentro (Marte, Lua e uma cópia da ISS), com móveis, máquinas e rotina de astronauta. Os concorrentes visitados usam vista aérea, cenas fixas ou menus.
- 11 missões baseadas em fatos reais, cada uma com patch próprio.
- Agricultura espacial com 6 culturas reais.
- Português e inglês, vídeo de 30 s e 7 slides prontos.

## O que foi implementado depois da análise
1. **Previsão de esgotamento** no painel de energia: quantos sóis faltam para o ar, a comida ou a bateria acabarem.
2. **O Sol ao vivo** (NASA SDO, AIA 193 Å) no rádio do jogo e na seção de dados do site.
3. **Números reais de suporte de vida da NASA** no tablet (O₂ e CO₂ por astronauta, reciclagem de água da ISS, MOXIE), com fonte.
4. **Quiz de 3 perguntas** no fim de cada missão, com explicação de cada resposta e placar no resumo da turma.
5. **Acessibilidade**: texto maior, alto contraste e menos movimento e brilho, no menu de pausa.
6. **Guia do professor** em português e inglês (objetivos, aula de 45 min, missões, perguntas, rubrica e atividade sem computador).
7. **Texto da submissão reescrito em inglês** (docs/space-apps-submission-en.md), com Solution, declaração de uso de IA e link do demo que toca no navegador.

## Ideias para depois
- Códigos de turma e painel do professor ao vivo (precisa de servidor).
- Mais idiomas (espanhol primeiro).
- Modo VR com WebXR.
- Imagens do Mars Trek e mapas de gelo SWIM no terreno.

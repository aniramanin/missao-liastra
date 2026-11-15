# Space Apps 2026 submission text (English)

Paste each block into the matching field of the project form at spaceappschallenge.org.
The current submission has the Details field in Portuguese, an empty Solution field and no AI disclosure; this version fixes all three.

---

## Project name

Aerospace Innovation Center: Junior Astronaut Mission Trainer

## Demo link (30-second video)

https://aniramanin.github.io/missao-liastra/media/aerospace-innovation-center-en.mp4

(This link plays in the browser. The current link points to the raw GitHub file, which downloads instead of playing. A YouTube upload of the same video also works.)

## Final project link

https://aniramanin.github.io/missao-liastra/en.html

## Summary

The Aerospace Innovation Center is a free 3D mission trainer that runs in any browser, with no download or sign-up, in English and Portuguese. Players wake up at AIC Base Jezero on Mars, walk the Moon's south pole at AIC Base Shackleton, or float through a full copy of the International Space Station, and live 11 missions based on real events, each with its own NASA-style patch. Every resource competes for the same energy cells: life support, greenhouse LED light, a water radiation shield and science. The energy panel previews each plan and forecasts when air, food or the battery will run out. Solar storms follow the real Sun through NASA's DONKI database, the radio shows today's image of the Sun from NASA SDO, and the Earth–Mars message delay is computed for today's planet positions. Each mission ends with a resource chart, the real science behind it, a 3-question quiz and a summary teachers can paste into class. A printable teacher guide turns it into a 45-minute lesson.

## Details

### What it does
- **Three complete 3D worlds you can walk through:** AIC Base Jezero (Mars), AIC Base Shackleton (Moon) and a copy of the ISS with Zvezda, Destiny, Harmony, Columbus, Kibo, Quest, the Cupola, a docked capsule, the truss, rotating solar wings and the Canadarm2.
- **Everything an astronaut does:** sleep, shower, cook, exercise, run the oxygen generator and the CO₂ scrubber, recycle water, analyze samples in the ICBS laboratory glovebox, print parts, suit up with pre-breathe, walk outside, drive a rover, drill for ice, install a seismometer, start a fission reactor, photograph Earth from the Cupola, capture a cargo ship with the robotic arm and swap truss batteries on a spacewalk.
- **11 missions based on real events, each with its own patch:** for example the 2018 global dust storm that ended Opportunity (DUNE-2), the improvised CO₂ adapter from Apollo 13 (FILTER-13), the 2 mm hole found on the docked Soyuz in 2018 (LEAK-18), Perseverance's Three Forks sample depot (DEPOT-3F) and the ISS Veggie experiments (GARDEN-1). There are also three survival modes, one per world.
- **Trade-offs you can feel:** energy cells go to life support, greenhouse light, the water shield or science. Below 3 cells, air starts to run out; more than 2 cells on the shield do not help; a full battery wastes the extra. The energy panel shows the per-sol effect of a plan and how many sols remain before air, food or the battery run out.
- **Space farming:** 6 trays and 6 crops already grown in space or in Mars-like conditions (red lettuce, radish, dwarf tomato, chile pepper, potato, dwarf wheat), each with its own growth time, yield, oxygen and water. Plants pass through stages and lose quality if harvested late.
- **Learning loop:** every task ends with a real fact and its source; every mission ends with a resource chart, "what this mission taught", a 3-question quiz (two about the mission's world, one general) and a copyable class summary that includes the quiz score.
- **For classrooms:** a printable teacher guide (English and Portuguese) with learning objectives, a 45-minute lesson plan, recommended missions, discussion questions, a rubric and an unplugged "6 cells" activity.
- **Accessible:** keyboard and mouse or touch, adjustable mouse sensitivity, Esc to pause, and options for larger text, high contrast and less motion and glow. Hard words are explained on tap.

### How it works
A static website (HTML, CSS and vanilla JavaScript) with a 3D engine built on Three.js (r128) and post-processing bloom. The simulation runs in real time: production from the Sun (or the reactor) fills the battery, the energy plan drains it, and air, food, radiation dose, science and suit oxygen update every frame. On the Moon the base also faces multi-day shadow; on Mars, dust storms and solar storms; in orbit, a 90-second day–night cycle and the South Atlantic Anomaly.

### Benefits and intended impact
It turns the engineering trade-offs of a real outpost into decisions a child can make and an adult can discuss, using real data instead of invented numbers. It is free, needs only a browser (including school Chromebooks and phones) and works in two languages, so any teacher can open one link and run a lesson.

### Tools and languages
HTML5, CSS3, JavaScript, Three.js r128, WebGL, NASA open APIs. The 30-second video was assembled from real game captures with an original soundtrack generated by code.

### Creativity and factors considered
We chose immersion over menus: players walk to the machine they want to use, so the base layout itself teaches how a habitat works. We considered scientific accuracy (every number has a source, and what is simplified is listed on the site), cognitive load for young players (three main resources plus gauges, a guided first mission, a mission call and a checklist with a 3D marker and minimap), offline resilience (a real DONKI archive is used if the live API is unreachable, and the screen says which one is in use) and accessibility.

## Use of NASA data and resources
- **DONKI (Space Weather Database Of Notifications, Knowledge, Information), CCMC/NASA:** coronal mass ejections of the last 30 days, fetched live from api.nasa.gov; each mission sol maps to a real day, and the fastest CME of the day sets the storm risk. A real archive (86 CMEs, 15 Oct to 13 Nov 2026) is used as a fallback and labeled as such.
- **Solar Dynamics Observatory (SDO), NASA:** today's AIA 193 Å image of the Sun, shown on the website and on the in-game radio.
- **Curiosity / RAD (MSL):** 0.67 mSv per day on the Martian surface (Hassler et al., Science 2014).
- **JPL Solar System Dynamics, Approximate Positions of the Planets:** Earth–Mars distance and light time computed in the browser for the current date.
- **NASA Life Support Baseline Values and Assumptions Document:** oxygen use and CO₂ output per crew member.
- **NASA Open Science Data Repository and Human Research Program:** facts about plants grown in regolith, astronaut health and the ISS.
- **NASA mission records:** Opportunity (2018 dust storm), MOXIE on Perseverance, the Three Forks depot, Veggie and Plant Habitat, Apollo 13, Canadarm2 cargo captures, ISS battery-swap spacewalks.
- **Blue Marble and Black Marble (NASA, public domain):** Earth textures.

## Space agency partner data
- **Chang'e 4 / LND (CNSA):** 1.37 mSv per day on the lunar surface, the first measurement made on the Moon itself (Zhang et al., Science Advances 2020).

## References
- Hassler, D. M. et al. (2014). Mars' surface radiation environment measured with the Mars Science Laboratory's Curiosity rover. Science 343. doi:10.1126/science.1244797
- Zhang, S. et al. (2020). First measurements of the radiation dose on the lunar surface. Science Advances 6. doi:10.1126/sciadv.aaz1334
- NASA (2021). Life Support Baseline Values and Assumptions Document. NTRS 20210024855
- NASA CCMC DONKI: https://kauai.ccmc.gsfc.nasa.gov/DONKI/
- NASA SDO: https://sdo.gsfc.nasa.gov/
- JPL, Approximate Positions of the Planets: https://ssd.jpl.nasa.gov/planets/approx_pos.html
- NASA OSDR: https://osdr.nasa.gov/
- Three.js: https://threejs.org/

## Use of artificial intelligence
We used Claude (Anthropic) as a coding and design assistant: to write and debug the JavaScript, the 3D scenes and the website, to draft and translate texts, to design the mission patches as code-generated SVG, to build the presentation slides and to assemble the 30-second video from real captures of the game, with a soundtrack synthesized by code. The team defined the concept, the missions, the scientific content and the visual identity, and reviewed every fact and source. All screenshots and video frames are real captures of the running game; the team photos are real photos of the team. No AI-generated images of real NASA missions are presented as real.

## Team
Marina Freitas and Luiza Oliveira (founders, Aerospace Innovation Center), with Raylla Vardiero, Esther Anjo and Barbara Dorneles. Aerospace Innovation Center is part of the LIASTRA Institute.

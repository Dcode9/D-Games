# Tag — Multi-Day Build Plan (Completed)

High-fidelity HTML5 platformer Tag recreation for D'Games (inspired by Poki's *Tag* by JetGames), built with exact arcade platformer physics, interactive arena elements, local 1–4 player + AI bot support, and mobile touch controls.

## Day 1 (Completed — 2026-11-25)
- [x] Fixed-timestep 60Hz platformer physics engine:
  - Snappy ground/air acceleration & friction with dust puffs on turnarounds and landings
  - Variable jump height, coyote time (95ms), jump buffering (110ms), and wall-slide + wall-jump
  - One-way pass-through platforms (jump up through, press Down to drop through)
  - Bouncy spring jump pads with compression animation and high launch arc
  - Paired color-coded teleporter portals with preserved momentum and anti-loop cooldown
  - Tag transfer with 0.92s immunity shield, knockback impulse, 45ms hit-stop, screen shake, and burst particles
- [x] 2 full playable arenas: **Jungle Canopy** and **Desert Temple**
- [x] Game modes & controls:
  - 1P vs AI Bots (2–4 total players) + 2P / 3P / 4P local keyboard (`WASD`, `Arrows`, `IJKL`, `TFGH`)
  - Responsive mobile touch controls
  - Squash-and-stretch expressive characters with velocity-tracking eyes and glowing floating `IT` indicator
  - Procedural Web Audio API sound effects with mute toggle
  - Automatic pause when tab/document is hidden
- [x] Original SVG cover (`/assets/covers/tag.svg`) and catalog registration in `public/assets/dgames-home.js`

## Day 2 (Completed — 2026-11-26)
- [x] Added **Arena 3: Glacier Peak** (low-friction ice surfaces + oscillating horizontal glacier lifts)
- [x] Added **Arena 4: Sky Factory** (animated conveyor belts pushing horizontal momentum + vertical factory elevators + cross-map portals)
- [x] Added collectible **Power-Ups**: Speed Boost (`⚡`), Super Jump (`▲`), Ghost Cloak (`👻` tag immunity), and Freeze Pulse (`❄` chills opponents)
- [x] Added **Hot Potato (Elimination)** mode alongside Classic Tag (sub-round elimination countdowns until one champion survives)
- [x] Upgraded AI pathfinding to intentionally route through warp portals, spring pads, and power-up pickups
- [x] Verified syntax and smoke checks across desktop and mobile viewports; PR #10 ready to merge

# Changelog

## 1.3.0

- Added Malakai's Blood Hunt: loud mistakes and generator progress can give him the player's last known trail temporarily.
- Added Bear Traps with desktop T control, mobile Items control, limited active traps, and shorter stun duration for Malakai or Resilient monsters.
- Rewrote the monster guide around each monster's identity, behavior, and counterplay.
- Added Bear Trap inventory persistence, shop support, mobile support, and save import/export support.

## 1.2.1

- Removed chase music for now.
- Endless deaths now restart from round 1 when choosing Play Again.
- End-menu Play Again and Main Menu actions save statistics for every mode.
- The main HUD now says Multiple Monsters instead of showing only the first monster; details remain in the roster.
- Converted the Info screen categories into colored expandable dropdowns.
- Bumped the offline cache so these changes update installed copies.

## 1.2.0

- Added cosmetic player colors and trails, challenge unlocks, and a dedicated Statistics screen.
- Added Emergency Batteries and Breath Filters to the shop, with a five-item inventory limit so loadouts stay meaningful.
- Added a compact multi-monster roster in the HUD; full monster names and mutations now stay out of the main play view until opened.
- Reworked mobile actions into four clear buttons: Interact, Abilities, Items, and Menu. Their pop-up panels pause safely while choices are made.
- Expanded Hallucinations with fake silhouettes, generator markers, power alerts, and temporary incorrect HUD progress.
- Reorganized the in-game Info screen and documented every phone control, progression system, item, and new threat.
- Updated the offline cache so installed phones receive this release cleanly.

## 1.0.0

- Added mobile joystick and touch action buttons.
- Added installable PWA support and offline caching.
- Added automatic update detection.
- Added safer versioned local saves with backup, export, import, and reset tools.
- Added repair flashes, generator status feedback, EMP warnings, sabotage warnings, and improved entity shadows.
- Added desktop and mobile setup instructions.
- Added Phase 1/2 map events: power outages, flickering lights, emergency lights, special edge rooms, safe rooms, hiding spots, and generator attraction.
- Added false generators, fuse generators, multi-stage circuit repairs, crouching, breath-holding, noise makers, and hallucination decoys.
- Expanded the in-game database with all new mechanics and mobile button instructions.
- Rebuilt special rooms as physical side rooms connected by corridors, removed the false-generator text label, and reserved spawn space to prevent overlapping generators, fuses, and hiding spots.
- Fixed safe rooms so they block monster detection rather than movement, fixed hiding so monsters continue to patrol, and excluded false generators from the objective count.
- Emergency lights now let the monster track the player through walls; hiding spots now punish entering while visibly spotted but remain safe when line of sight is broken first.
- Added Phase 3 modes: Normal, Endless rounds with scaling and multiple monsters, and configurable Survival Mode using Caleb, Malakai, and Jordan.
- Optimized multi-monster pathfinding and prevented repeated game-over processing from freezing multi-monster rounds.
- Fixed the extra-monster shadow renderer, which was throwing a canvas error every frame when a second monster appeared.

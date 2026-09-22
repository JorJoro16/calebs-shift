# Changelog

## 2.3.2

- Fixed the main menu clipping its final entries on shorter screens. It now scrolls when needed, and the dedicated entry is labeled **COSMETICS BOOK**.
- Bumped the offline cache to `calebs-shift-v32`.

## 2.3.1

- Added the missing Cosmetics button to the main menu. It opens the Collector's Book directly, including the Colors, Trails, and Hats tabs.
- Bumped the offline cache to `calebs-shift-v31`.

## 2.3.0

- Added The Crimson Containment: a large procedural red industrial facility with distinct room layouts, long connected routes, and reachability-safe objective placement.
- Added Rhys, a yellow goop-spitter that roams, fires short-range slowing shots during chases, and performs dangerous straight-line dashes.
- Added three randomized Crimson Seal routes: direct recovery, a key-and-chest route, or baiting Rhys into a cracked wall.
- Added the containment-trap finale, plus Containment Alarm, Pressure Release, Seal Resonance, and a map-wide expanding Emergency Light Sweep. Power Outage is disabled for this map.
- Moved Crimson objectives into a dedicated top-right HUD panel, with touch-friendly E interactions through the existing mobile Interact button.
- Added Gold and Ember cosmetics for catching Rhys. Existing locally unlocked colors and trails remain untouched.
- Reworked equipped trails into a true fading path behind the player instead of a single attached dot.
- Bumped the offline cache to `calebs-shift-v30`.

## 2.2.2

- Replaced generic Hotel item collection with role-specific, tap/click-friendly three-step task mini-games: reservation ledger, service panel, room search, and banquet inventory.
- Matched task props and instructions to their staff member, so Maintenance repairs a service panel instead of collecting a room key.
- Added varied Bassam task dialogue and a rare nearby ambush. If he loses the player during that ambush, he runs out of view and returns in a new employee disguise; accepted Bassam tasks prevent this transformation.
- Bumped the offline cache to `calebs-shift-v29`.

## 2.2.1

- Fixed Hotel assignments so they place visible, named collectible objects on reserved interior room tiles, away from generators and doors.
- Fixed Bassam's disguised patrol to walk between rooms rather than repeatedly teleporting or flashing.
- Made Bassam's assignment presentation match real staff, including a believable department, neutral task panel styling, and no emergency-light outline while disguised.
- Bumped the offline cache to `calebs-shift-v28`.

## 2.2.0

- Rebuilt the Endless Hotel as a larger procedural room-and-hallway layout instead of a fixed room grid.
- Added clickable, touch-friendly employee dialogue; players can accept at most two assignments, complete the work at real generated locations, and return to report it.
- Added a top-right Hotel Assignments panel, genuine staff roaming, staff evacuation through the elevator, and a final Bassam chase after all generators and evacuations are complete.
- Reworked Bassam's disguise: he roams as separate staff, offers a false assignment, does not collide while disguised, and only reveals himself after he is off-screen.
- Reworked Hotel Lockdown to block the full width of a real corridor section, and removed the brief random elevator arrival window.
- Bumped the offline cache to `calebs-shift-v27`.

## 2.1.2

- Added an Optimization Mode toggle for older computers.
- Reduced decorative rendering, screen blur, and visual effects while keeping gameplay simulation unchanged.
- Added a lower-cost approximately 30 FPS render path.
- Bumped the offline cache to `calebs-shift-v26`.

## 2.1.1

- Simplified the main menu to Play, Shop, Info, Records, and Settings.
- Merged statistics, cosmetics, map collection, and daily objectives into Records.
- Moved loadout selection into run setup.
- Moved Survival settings into the shared run setup flow.
- Moved phone installation help into Settings.
- Bumped the offline cache to `calebs-shift-v25`.

## 2.1.0

- Added the procedural Endless Hotel map with physical guest rooms, long wings, employee tasks, an elevator objective, and a distinct carpeted visual identity.
- Added Bassam, the Concierge, who disguises himself as a hotel employee and reveals himself when approached as a fake staff member.
- Added Hotel Lockdown and Elevator Arrival events with animated top-of-screen notifications.
- Added the full mutation set: Locked In, Echo, False Objective, Watcher, Panic, Heavy Footfall, and Afterimage.
- Added a collection screen, main-menu atmospheric background, compact menu status row, menu UI sounds, and unlock notifications.
- Fixed Boilerworks object placement so generators are not moved into room interiors or door thresholds after the safety checks.
- Bumped the offline cache to `calebs-shift-v24` and preserved existing save progress with schema 7 normalization.

## 2.0.1

- Enlarged Boilerworks to a 65×49 procedural play area with more physical rooms and longer connections.
- Made Boilerworks maintenance, cooling, storage, control, industrial, and boiler rooms distinct physical spaces.
- Made Aeson’s circular ignition zones visibly burn, slow the player strongly, blur/heat-distort the screen, and alert Aeson to the player’s location.

## 2.0.0

- Added Campaign Mode with map unlocking and replayable map selection.
- Added the procedural Boilerworks map with long halls, industrial rooms, cooling valves, heat zones, and a central-boiler objective.
- Added Aeson, the Boilerworks Firestarter, with heat tracking and map-control events.
- Added local daily objectives, rewards, and selectable item loadouts.
- Added rare two-monster Normal/Campaign runs with shared awareness and separation behavior.
- Bumped the save schema to 6 and the offline cache to `calebs-shift-v22` while preserving older progress.

## 1.3.1

- Replaced the unreliable mobile Menu button with a dedicated Skill Check button.
- Added mobile skill-check instructions and updated the mobile controls documentation.
- Bumped the service-worker cache to `calebs-shift-v21` so installed copies receive the update.

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

# Changelog

## 2.18.4
- Added rare touch-collectible hearts to the Caleb and Cal/Leb boss phases. Each heart restores 1 player health and remains available when the player is already at full health.
- Bumped the offline cache to `calebs-shift-v85`.

## 2.18.3
- Removed Schimini spawning from Caleb’s main boss phase; Leb still spawns them during the split phase.
- Bumped the offline cache to `calebs-shift-v84`.

## 2.18.2
- Improved Caleb’s hand sweep timing and added a visible hand-slam warning/impact telegraph.
- Fixed PC `E` interactions for Caleb boss switches, eye cores, and Leb’s nests.
- Detached Caleb’s hand artwork from his body at rest and animated the active hand during sweeps and slams.
- Bumped the offline cache to `calebs-shift-v83`.

## 2.18.1
- Added a campaign-only Lucas replay choice after Lucas has been cleared: restart Lucas's level or begin the Caleb boss fight.
- Bumped the offline cache to `calebs-shift-v82`.

## 2.18.0
- Added Caleb’s first boss encounter after the Lucas gate ending, with an intro cinematic, health bars, player health, attack telegraphs, reflected dark-orb counterplay, rare eye cores, eye-rain, Schiminis, hand sweeps, ground slams, and a collapsing-floor second stage.
- Added Caleb’s split cutscene and the playable Cal/Leb continuation: reflect Cal’s fireballs with resonance switches and seal Leb’s nests before he can eat them.
- Added the supplied Caleb, hand, Cal, and Leb PNG artwork with mobile-friendly tap interactions and joystick movement.
- Bumped the offline cache to `calebs-shift-v81`.

## 2.16.0
- Added a touch/mouse pull-down fragment minigame that pauses the Lucas area when a Caleb fragment is recovered.
- Made Lucas emerge from a visible shadow pulse near the player more often, especially after the final fragment is being carried.
- Replaced the Lucas gate dialogue-only ending with a shaking shadow-gate animation: a glowing tether extends from the gate and pulls Lucas into the darkness while the existing dialogue remains.
- Added mobile canvas drag/hold input for the fragment challenge and hid normal movement controls while the challenge or ending animation is active.
- Bumped the offline cache to `calebs-shift-v77`.

## 2.15.0
- Reworked The Shadow Gate into a larger, seven-room Lucas route with distinct archive, service, underpass, transit yard, vessel, and exit areas.
- Added staged Caleb fragment progression: first recovery, three shadow relays, second fragment release, and a slowed carry objective for the final fragment.
- Added Lucas shadow pools, temporary route seals, shadow arrow barrages, a pull attack, and pool repositioning so his threat is based on controlling routes rather than repeating Rhys's charge.
- Added carry-drop behavior when a shadow projectile hits the player, clearer objective/HUD states, relay prompts, carried-fragment visuals, and expanded room colors.
- Bumped the offline cache to `calebs-shift-v76`.

## 2.14.0
- Added The Shadow Gate, a dedicated pre-boss Lucas map with a connected serviceway, three Caleb fragments, misleading physical arrows, a Caleb Vessel, and a sealed shadow gate.
- Added Lucas’s first encounter behavior: patrol pursuit, a corridor charge, a fragment-triggered run to the gate, line-of-sight gate blocking, and a shadow-drag ending that awards the normal run rewards.
- Added the Shadow Gate to map selection after The Last Line and documented that Caleb’s boss arena will arrive separately.
- Bumped the offline cache to `calebs-shift-v75`.

## 2.13.0
- Made the Subway Gold Fare flickering-signal events fairer: they now appear less often, allow 30 seconds, and pause their countdown once the player reaches a flickering signal.
- Added a rare chance for a Gold Fare event to affect two signal panels at once, with both panels clearly marked and tracked.
- Added a warm gold lighting effect while the Gold Fare route is active.
- Bumped the offline cache to `calebs-shift-v74`.

## 2.12.0

- Made the Headlight challenge forgiving before the passenger train: Nizar automatically dodges early train collisions, which still count toward the three misses.
- Moved Smile Mask and Gold Skin to Endless Round 9 and retroactively unlocks them for players whose saved Endless record is already 9 or higher.
- Removed Amine’s incoming-call interruption from generator repairs, including its overlay and documentation.
- Added monster crowd avoidance, overlap recovery, protected-cabin target clearing, and non-cabin roaming targets to stop multi-monster pile-ups and Blackwood Forest cabin-door blocking.
- Bumped the offline cache to `calebs-shift-v73`.

## 2.11.4

- Replaced the Subway cosmetic assets with the new 144×144 versions.
- Bumped the offline cache to `calebs-shift-v72`.

## 2.11.3

- Replaced the Stop Sign Mask, Headlight, and Train Skin assets with the new 128×128 versions.
- Bumped the offline cache to `calebs-shift-v71` so the updated PNGs are downloaded.

## 2.11.2

- Only spawn the torn ticket until the Stop Sign Mask is earned.
- Only enable the passenger-train condition after the Stop Sign Mask is earned.
- Only spawn the Gold Fare sphere after both the Stop Sign Mask and Headlight are earned; it remains replayable after Train Skin is unlocked.
- Bumped the offline cache to `calebs-shift-v70`.

## 2.11.1

- Made the Subway cosmetic route sequential: Stop Sign Mask first, Headlight second, and Train Skin third.
- Existing saves with out-of-order Subway rewards are corrected to the same sequence.
- Bumped the offline cache to `calebs-shift-v69`.

## 2.11.0

- Replaced the three Subway reward cosmetics with the Stop Sign Mask, Headlight, and Train Skin while preserving the torn-ticket, passenger-train, and Gold Fare cutscene routes.
- Reset the old Subway reward line as a new cosmetic reward version so previously completed Subway rewards must be earned again.
- Reassigned Bronze, Silver, and Gold to Endless Round 3, Round 6, and Round 10, with existing Endless records unlocking the appropriate rewards after migration.
- Added the three new cosmetic images to the offline cache and bumped it to `calebs-shift-v68`.

## 2.10.3

- Made the Nizar-only Gold Fare route a high-pressure Subway variant with a three-minute timer, sphere charge, timed detection broadcasts, signal flickers, guidance arrows, temporary station doors, and accelerated train crossings.
- Prevented Rail Control from opening while a Gold-route signal is still flickering.
- Made developer unlock access session-only and added a main-menu `×` button to disable it immediately without deleting saved room files.
- Bumped the offline cache to `calebs-shift-v67`.

## 2.10.2

- Added the Bronze, Silver, and Gold Subway skins with their ordered Last Line challenges.
- Added the Gold Fare cutscene for the Nizar-only sphere route at Rail Control.
- Hid the desktop notification stack on mobile and prevented Parted Grid fuses from spawning on sinkholes.
- Added the three skin images to the offline cache and bumped it to `calebs-shift-v66`.

## 2.10.1

- Added a Skins tab to the Collector's Book.
- Added the Troll Face Skin, earned by flashbanging Noah within one second of his reveal.
- Added the Generator Skin, earned at 1,000 completed generators using the existing career record total.
- Added both skin images to the offline cache and bumped it to `calebs-shift-v65`.

## 2.10.0

- Expanded Endless map selection with a saved round high score for each map.
- Raised Survival's selectable hunter cap to eight.
- Moved Dash to Left Shift, removed Shift crouching, and made the dash a swept movement with a five-second cooldown.
- Made specialist monster abilities work across levels: Aeson fire, Rhys goop and charges, Noah reveals and lightning, Amine invisibility and teleporting, Bassam's off-map employee decoys, and Nizar's signal attacks.
- Made Closing Frames push the player instead of allowing them to walk through the crush.
- Improved mobile support for Focus Vision, Dash, and the Subway Rail Control board.
- Updated the offline cache to `calebs-shift-v64`.

## 2.9.9

- Reworked the Last Line layout into a clearer three-or-four-station connected spine with alternating platform levels and cleaner transfer bends.
- Replaced the old subway ending with a two-minute Rail Control interception board: open lane switches to route one of several trains into the moving hunter.
- Removed the repetitive subway train sound and added the provided, quiet `WallCrashSoundEffect.mp3` only when Nizar's Closing Frames collide.
- Added Nizar's False Nizars: two shadowless chasing clones appear every 40 seconds, vanish after 30 seconds, and disappear harmlessly if they catch you.
- Updated the Nizar and Last Line instructions and bumped the offline cache to `calebs-shift-v63`.

## 2.9.8

- Opened the Parted Grid connector mouths into wider three-way junctions and reduced random fire zones from 32 to 16.
- Made Level 0 safe rooms and powered Forest cabins reliably protected, including against extra monsters in Survival and Endless modes.
- Added timed Forest arrows for unlit breaker cabins and the watchtower, fixed the Forest completion daily objective, and bumped the offline cache to `calebs-shift-v62`.

## 2.9.7

- Replaced the Parted Grid's open pillar field with repeated authored PillarRoom geometry from the Developer Studio export, joined by cardinal corridors.
- Preserved randomized fire zones, sinkholes, generator placement, and the Amine call/teleport pressure on the new authored layout.
- Replaced the old Amine turret screen with a road pursuit: steer a turret car, dodge moving roadblocks, fire around cover, survive temporary invisibility, and avoid overheating the turret with eight repetitive shots.
- Updated Parted Grid guidance and bumped the offline cache to `calebs-shift-v61`.

## 2.9.6

- Added the hidden Developer Studio, unlocked with `Shift + O + P` and the developer code.
- Added a 2D room-authoring canvas with floor, wall, decoration, spawn, connection, selection, eraser, undo, redo, and play-test tools.
- Added room naming and description prompts, separate local room storage, room collections, JSON import/export, color controls, and a simple wall-collision preview.
- Bumped the offline cache to `calebs-shift-v60`.

## 2.5.3

- Disabled power outages and emergency-light events in Blackwood Forest.
- Made Forest denser with additional collidable, sight-blocking trees while protecting cabin doors.
- Noah now marks and re-engages more often, predicts a moving player's direction during pursuit, and receives a short burst speed advantage instead of being drained by straight-line kiting.
- Noah becomes visible for the final Forest catch phase so he can be found and caught.
- Updated the offline cache to `calebs-shift-v40`.

## 2.5.2

- Moved all live objectives into a separate right-side panel so collapsing the left HUD never hides them.
- Prevented Rhys from spawning behind an intact cracked-wall route and stopped Scrambler from leaking generator counts through map objectives.
- Rebuilt Forest cabins as enterable walled buildings with doors and light safety, added denser collidable tree cover that blocks sightlines, and darkened the forest.
- Reduced Noah's chase pressure and made him retreat instead of entering a lit cabin.
- Challenge contracts now reroll each time the Challenge Board opens while keeping the displayed selection stable until chosen.
- Updated the offline cache to `calebs-shift-v39`.

## 2.5.1

- Moved Challenge and Survival records into Records while removing the duplicate daily-task block.
- Fixed custom kit selection/editing from both Loadouts and Run Setup.
- Restored the Crimson HUD split: status/items/monster on the left and containment objectives on the right.
- Rebuilt Blackwood Forest as open green woodland with edge borders, round trees, cabin shapes, explicit generator-plus-breaker objectives, slower Noah pursuit, and light avoidance.
- Made Spark, Ember, Ghost, and Static trails visibly distinct.
- Updated the offline cache to `calebs-shift-v38`.

## 2.5.0

- Added Noah, The Stalker, and the procedurally generated Blackwood Forest with lit and dark cabins, breaker objectives, Flashbang scatter counterplay, and silent hooks reserved for custom audio.
- Replaced Normal Mode with a three-contract Challenge Board that displays map rules and token rewards.
- Added Today’s Shift main-menu access, a completion bonus, more objective variety, custom saved item kits, an eight-item carry cap, Survival/Challenge Records, and Endless token scaling.
- Added purchasable Map Intel after Easy, Normal, and Hard clears; the live map can be opened with M or the mobile MAP control without pausing danger.
- Lowered player movement and raised monster speed by difficulty for closer but escapable chases; added HUD collapsing and Forest Info entries.
- Updated the offline cache to `calebs-shift-v37`.

## 2.4.2

- Prevented Crimson Containment from ending until every generator is repaired, the seal is recovered, and the containment trap is armed.
- Updated the service-worker cache to `calebs-shift-v36`.

## 2.4.1

- Fixed shop card text alignment so item names and descriptions stay in a readable left-aligned column beside the purchase button.
- Merged Rhys into the main Monsters Info section instead of showing him as a separate monster section.
- Crimson Seal, chest key, chest opening, and containment-trap interactions now require all generators to be online first, preventing the objective sequence from being skipped.
- Bumped the offline cache to `calebs-shift-v35`.

## 2.4.0

- Rebuilt the crowded Info screen into Start, Maps, Monsters, and Systems tabs, while retaining the existing expandable detail sections.
- Reworked the Black Market into Upgrades and Supplies tabs with a visible five-slot carry count.
- Added Signal Scrambler, Goop Neutralizer, Repair Kit, and Emergency Flare. Each is saved, imported/exported, constrained by the carry limit, shown in the HUD, usable from desktop keys and the mobile Items panel, and documented in Info.
- Made ordinary Rhys charges more aggressive: wider engagement range, more frequent attempts, shorter brace, and shorter cooldown. The special cracked-wall charge keeps its longer warning.
- Bumped the save schema to 8 without removing older progress fields, and bumped the offline cache to `calebs-shift-v34`.

## 2.3.3

- Removed cosmetics and collection controls from Records; cosmetics are now only in the dedicated Cosmetics Book.
- Kept player trail history updating during the monster-catching phase, so trails remain behind the player while catching Bassam or any other monster.
- Added a short, visible Rhys charge wind-up. His post-charge stun is longer, especially after smashing the cracked wall.
- Rebuilt the cracked wall as a multi-tile sealed vault gate. It blocks players and pathfinding until Rhys destroys it; early generators cannot appear beyond it.
- When the player reaches the cracked gate, Rhys routes to it, stops to brace, then charges into the wall—giving the player time to dodge safely.
- Bumped the offline cache to `calebs-shift-v33`.

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

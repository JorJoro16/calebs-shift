# The Backrooms: Caleb's Shift

A small browser survival-horror game built for desktop and mobile.

## Play

Live game: https://jorjoro16.github.io/calebs-shift/

## Goal

Explore the maze, repair every generator, survive the monster's mutations, and catch it once the power is restored.

## Modes

- **Normal:** Choose Easy, Normal, or Hard for the original single-round game.
- **Endless:** Every cleared round immediately starts a harder one. New rounds add generators, speed, mutations, stronger events, and eventually more monsters.
- **Survival:** Choose the existing monster roster, number of monsters, difficulty, generators, mutation count, and whether events are active.

## Controls

### Desktop

- WASD: move
- E: interact with a nearby generator
- Space: use Adrenaline or hit a skill check
- F: use a Flashbang
- Hold Shift: crouch and slow the chase
- Hold B: hold your breath from All-Seeing
- H: hide near a hiding spot (20 seconds)
- N: use a Noise Maker
- T: place a Bear Trap

### Phone

Use the virtual joystick and the four on-screen buttons:

- **E:** interact with generators, fuses, rooms, and hiding spots.
- **Abilities:** opens crouch, hold breath, and hide. Crouch is a toggle on phone.
- **Items:** opens Adrenaline, Flashbang, Noise Maker, and Emergency Battery.
- **Menu:** opens fullscreen, Info, and Settings.

These three menus safely pause the run while they are open. For the best experience, open the live game in Safari or Chrome and add it to the Home Screen. Launching it from the icon enables the cleanest app-like display and offline play after the first online load.

## Progression and atmosphere

- Cosmetic player colors and trails are unlocked by challenges such as winning on Hard, catching specific monsters, clearing Endless rounds, and winning without items.
- The Statistics screen tracks games, wins, repairs, catches, Endless progress, item use, and favorite monster.
- Inventory is limited to five consumables total. The shop includes Adrenaline, Flashbangs, Noise Makers, Bear Traps, Emergency Batteries, and Breath Filters.
- Bear Traps can be placed with **T** or from the mobile Items menu. They briefly stun a monster and disappear after triggering; only two can be active at once.
- When more than one monster is active, the HUD identifies the group and offers a **MONSTERS** roster with each monster's mutations.
- Hallucination mutations can create fake silhouettes, generator signals, alerts, and HUD readings without directly harming the player.

The info screen inside the game lists every mobile button and the special map events, generators, rooms, and mutations.

## Progress and saves

Progress is saved locally on each device. The game keeps a versioned save and a rotating backup. Use **Settings** to export a JSON save file, import a backup, or reset progress. No account or cloud save is required.

## Project structure

- `index.html` — page structure and menus
- `css/style.css` — visual styling and responsive layout
- `js/game.js` — game systems and controls
- `manifest.json` — installable web-app metadata
- `service-worker.js` — offline caching and updates
- `assets/` — app icons

## Updating

Upload changed files to the repository root and commit them. GitHub Pages redeploys automatically. The service worker detects the new version and offers a **RELOAD** button when an update is ready.

## Credits

Created by JorJoro16 with collaborative coding support.

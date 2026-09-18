# The Backrooms: Caleb's Shift

A small browser survival-horror game built for desktop and mobile.

## Play

Live game: https://jorjoro16.github.io/calebs-shift/

## Goal

Explore the maze, repair every generator, survive the monster's mutations, and catch it once the power is restored.

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

### Phone

Use the virtual joystick and on-screen action buttons. For the best experience, open the live game in Safari or Chrome and add it to the Home Screen. Launching it from the icon enables the cleanest app-like display and offline play after the first online load.

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

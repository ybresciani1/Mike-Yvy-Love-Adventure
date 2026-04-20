# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
nvm use        # switch to Node 24.15.0 (required — Vite 8 needs Node 20+)
npm install
npm run dev     # start local dev server
npm run build   # production build
npm run preview # preview production build
```

## Architecture

All game code lives in a single file: `index.html`. There is no `src/` directory. Vite is used only as a dev server — it does not bundle any game code.

Phaser 3 is loaded via CDN (`phaser.min.js` from cdnjs). The game is structured as a series of Phaser `Scene` subclasses defined inline in a `<script>` tag, all registered in a single `Phaser.Game` config at the bottom of the file.

### Scene order (22 scenes)

`TitleScene` → `AirportScene` → `FlightScene` → `BarScene` → `ClubScene` → `PizzaScene` → `MorningScene` → `ConferenceScene` → `UberScene` → `RestaurantScene` → `MovieScene` → `DriveToHotelScene` → `FancyHotelScene` → `DowntownScene` → `TravelScene` → `HouseScene` → `SurgeryScene` → `BurialScene` → `NewYearsScene` → `ApartmentScene` → `ThanksgivingScene` → `HomeScene` → `PresentScene`

### Key patterns

- All textures are generated procedurally in `generateTextures(scene)` — there are no external image assets.
- A shared `gameState` object tracks cross-scene flags (inventory, progress, etc.).
- Dialogue is driven by a global `showDialogue(text, callback)` function that updates a DOM overlay (`#ui-layer`) outside the Phaser canvas.
- Music and sound are managed via global `playMusic()`, `stopMusic()`, `fadeOutMusic()`, and `playSound()` helpers using the Web Audio API.
- The player character is a `Mike` class extending `Phaser.GameObjects.Rectangle` with simple WASD/arrow-key physics.

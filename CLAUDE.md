# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Phaser 3 browser game — a linear, story-driven pixel-art RPG about Mike & Yvy. Vite builds it to a static bundle in `dist/`, which is what Vercel serves (`vercel.json` pins the framework preset, build command, and output directory).

The game was originally a single 2,400-line `index.html`; it now lives in ES modules under `src/`. `index.html` is only the page shell — the DOM overlay markup plus the module entry point.

## Commands

```bash
nvm use          # Node 24.15.0, pinned in .nvmrc (Vite 8 needs Node 20+)
npm install
npm run dev      # Vite dev server on :5173
npm run build    # production bundle to dist/
npm run preview  # serve the built bundle
npm test         # vitest, single run
npm run test:watch
```

Run one test file or one test:

```bash
npx vitest run tests/dialogue.test.js
npx vitest run -t "types the line out"
```

In dev the game instance is exposed as `window.game`, so scenes can be jumped to from the browser console without replaying the story:

```js
game.scene.start('ThanksgivingScene')
```

## Architecture

```
index.html               page shell: DOM overlay markup + <script type="module" src="/src/main.js">
src/main.js              Phaser config, boots the game
src/constants.js         GAME_WIDTH/HEIGHT, TILE_SIZE, COLORS
src/state.js             gameState story flags + resetGameState
src/assets.js            every externally hosted image URL (portraits, remote PNGs)
src/audio/context.js     lazily created AudioContext
src/audio/sfx.js         playSound
src/audio/music.js       play*Theme, stopMusic, fadeOutMusic
src/ui/dialogue.js       showDialogue, isDialogueOpen, portraitFor
src/entities/Player.js   the movable character
src/textures/            generateTextures — all ~96 sprites, drawn in code
src/scenes/              23 scenes + index.js (the registry)
```

### Hybrid DOM + canvas UI
The dialogue box, `PRESS SPACE` interaction hint, airport scrolling banner, wardrobe modal, and restaurant menu are **HTML elements in `index.html`**, not Phaser objects. Scenes drive them with `document.getElementById(...).style.display`. Consequences:
- `isDialogueOpen()` from `ui/dialogue.js` is the global input gate — `Player.update` returns early while it's true, and `showDialogue` refuses to open a second box.
- `showDialogue(text, callback)` types text out character-by-character and waits for SPACE. It picks the portrait by **prefix-matching the dialogue text** (`portraitFor`) — new lines that should show a portrait must start with a recognized prefix (`"Mike:"`, `"Yvy:"`, `"Aiden:"`, plus a few narration variants) or be added to `PORTRAIT_PREFIXES`.
- Multi-line conversations are nested `showDialogue(..., () => showDialogue(...))` callbacks; longer sequences use a `sequence` array plus a recursive `nextStep` (see `MovieScene.startMovie`).
- Modals lock the player with `this.player.isLocked = true` and wire `onclick` handlers imperatively each time they open.
- Adding an element id to the game code means adding it to `index.html`; `tests/sceneFlow.test.js` enforces that.

### Procedural textures
`generateTextures(scene)` draws all ~96 sprites pixel-by-pixel with a Phaser `Graphics` object and `generateTexture(key, w, h)`. It is only called in `TitleScene.preload` and `AirportScene.preload` — Phaser's TextureManager is game-global, so every later scene reuses those keys. **New art belongs in `generateTextures`, not in a per-scene preload.** The exceptions are the remote PNGs in `assets.js`, loaded by individual scene `preload()` methods.

### Audio
No audio files. `playSound(type)` builds one-shot oscillators for SFX. Each `play*Theme()` holds a melody array and schedules notes via a recursive `playNote(idx)` with `setTimeout`, pushing nodes onto the module-level `currentMusicNodes`; `stopMusic()` / `fadeOutMusic(duration)` tear that list down. **Scenes must call `stopMusic()` before starting a scene with a different theme**, otherwise themes overlap — this is done inline at transition points, not automatically. The AudioContext is created lazily on first sound, since browsers suspend one created before a user gesture.

### State
Two game-global mechanisms:
- `gameState` (`src/state.js`) — story flags (`hasTicket`, `securityCleared`, `clubProgress`, …). Scenes read and advance it; `resetGameState()` restores the initial values in place.
- `game.registry` — holds `playerOutfit`, set by the wardrobe modal in `MorningScene`. Every later scene recreates the player with `this.game.registry.get('playerOutfit') || 'mike_suit'`.

### Scene pattern
Scenes are near-uniform:
1. `create()` sets a camera background color, starts a theme, and builds the world from `add.rectangle`/`add.image`/`add.sprite` primitives.
2. Interactables are invisible trigger zones — `this.add.rectangle(x, y, w, h, 0xffff00, 0)` then `this.physics.add.existing(zone, true)`.
3. Interaction is `this.physics.add.overlap(this.player, zone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) { ... } })`, usually guarded on a `gameState` flag it then advances.
4. `update()` calls `this.player.update(this.cursors)`, repositions "held item" sprites next to the player, and toggles the `interaction-hint` element from `this.physics.overlap(this.player, [...zones])`.

`AirportScene` is the most complete example. Cutscene-only scenes (`FlightScene`, `UberScene`, `DriveToHotelScene`) skip the player entirely and tween straight into the next `scene.start`.

### Scene flow
The story is a strictly linear chain of `this.scene.start(...)` calls:

Title → Airport → Flight → Bar → Club → Pizza → Morning → Conference → Uber → Restaurant → Movie → DriveToHotel → FancyHotel → Downtown → Travel → House → Surgery → Burial → NewYears → Apartment → Thanksgiving → Home → Present

`src/scenes/index.js` lists the scenes in that same narrative order (only the first entry matters to Phaser — it boots first). `tests/sceneFlow.test.js` derives the real chain from the `scene.start` calls in source and fails if the registry drifts out of sync, so the list stays trustworthy.

## Tests

Vitest, with `node` as the default environment. The two DOM-facing suites opt into jsdom with a `// @vitest-environment jsdom` docblock at the top of the file.

**No test imports Phaser** — it needs a real canvas, which jsdom does not provide. So:
- Logic that must be testable (dialogue, state, audio, texture generation) lives in modules that don't import Phaser.
- `tests/helpers.js` fakes the two external APIs: a Proxy stands in for Phaser's `Graphics` to record `generateTexture` calls, and `createFakeAudioContext` stands in for WebAudio.
- `tests/sceneFlow.test.js` checks wiring (scene registry, transition targets, texture keys used by scenes, element ids in `index.html`) by **scanning source text** rather than importing it.

`npm run build` is the check that every module actually resolves and parses — run it after moving code between modules.

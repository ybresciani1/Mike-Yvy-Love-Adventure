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

## Developer tools

`src/dev/devtools.js` — a chapter select for jumping straight to a scene without replaying the story, in two shapes:

- **A dropdown on the title screen**, top right, labelled `DEV`. Visible, so the chapters are there to browse without knowing the key. It shows only while `TitleScene` is the running scene — tracked on the game's `poststep` event rather than scene lifecycle events, whose ordering around `status` is easy to get subtly wrong.
- **An overlay on `` ` ``**, anywhere in the game. Arrow keys / PageUp / PageDown to move, ENTER or a click to jump, `` ` `` or ESC to close. It opens on whichever chapter is playing.

The title screen starts the game on any pointerdown or SPACE, so the dropdown stops its own keystrokes from bubbling to the window listener Phaser uses — otherwise SPACE to open the dropdown would also start the game, and the arrow keys picking an option would leak through. The overlay has the same problem more broadly and solves it by switching each running scene's `KeyboardPlugin` off while it is open; stopping the event is not enough on its own, since that only wins if the listener happens to run before Phaser's. Note `resetKeys` and `enabled` live on the scene's `KeyboardPlugin` — `game.input.keyboard` is the game-level `KeyboardManager` and has neither.

The same jump is on the console, along with `window.game` and a `listScenes()` helper:

```js
gotoScene('ThanksgivingScene')
gotoScene('ClubScene', { keepState: true })
```

Use these rather than `game.scene.start(key)`. On the global SceneManager `start()` runs the target **alongside** whatever is already active, and two live scenes share one keyboard and one DOM dialogue box — the older scene's overlap handlers keep firing dialogue over the new scene (marine lines from `BarScene` appearing in the restaurant, say). `gotoScene` stops every running scene first, and also does the tidying a normal transition would: `stopMusic()`, hiding every DOM overlay a scene can leave showing, and `resetGameState()` so the chapter plays from its own beginning (pass `{ keepState: true }` to keep the current flags). Normal play never hits the overlap problem, because `this.scene.start()` inside a scene stops the caller.

**None of this ships**, the visible dropdown included. `main.js` imports the module dynamically from inside an `import.meta.env.DEV` branch, which Vite replaces with `false` for `npm run build` — the branch and its import are dropped, and the production bundle comes out byte-identical to one built without `src/dev` at all. Both the dropdown and the overlay build their own DOM with `createElement` rather than markup in `index.html`, so the page shell the public downloads has no trace of them either. Keep both properties: never import `src/dev/` from anything that ships, and don't move any of this markup into `index.html`. `tests/devtools.test.js` guards them.

Because a jump skips the scene that would normally have run first, two things are worth knowing. `generateTextures` only runs in `TitleScene.preload` and `AirportScene.preload`, so jumping works only once one of those has booted — which the title screen always does. And a chapter that expects story flags from earlier will see them reset; that is the intent, but `{ keepState: true }` is there when it isn't.

## Architecture

```
index.html               page shell: DOM overlay markup + <script type="module" src="/src/main.js">
src/main.js              Phaser config, boots the game
src/dev/devtools.js      chapter select + console helpers; dev builds only
src/constants.js         GAME_WIDTH/HEIGHT, TILE_SIZE, COLORS
src/state.js             gameState story flags + resetGameState
src/assets.js            every externally hosted image URL (portraits, remote PNGs)
src/audio/context.js     lazily created AudioContext
src/audio/sfx.js         playSound
src/audio/music.js       play*Theme, stopMusic, fadeOutMusic
src/ui/dialogue.js       showDialogue, isDialogueOpen, portraitFor
src/ui/touch.js          phone controls: the on-screen pad, and fitting the frame to the screen
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

### Phones

`src/ui/touch.js`, installed from `main.js`, is the whole of the mobile
support. It never touches Phaser or a scene:

- **The controls are a keyboard.** The D-pad and the `A` button dispatch
  synthetic `ArrowLeft`/`Space`/… events at `document`, so every
  `cursors.left.isDown` and `JustDown(this.spaceKey)` in the 27 scenes, and the
  SPACE listener that dismisses a line, keeps working with no per-scene wiring.
  Phaser's `KeyboardManager` listens on `window` and reads only the legacy
  `event.keyCode`, which several browsers drop from the `KeyboardEvent` init
  dictionary — `sendKey` redefines it on the event when the constructor ignored
  it. Dispatching at `document` reaches both listeners, since `window` is the
  next step in that event's path.
- **The frame scales as one piece.** The game stays 800x600 and the container —
  canvas and every DOM overlay together — is scaled by a CSS transform, with
  `--game-scale` and `--game-shift` set from JS. Resizing the canvas instead
  would leave the dialogue box, the banner and the modals laid out for a size
  the canvas no longer is. Phaser derives its own pointer scaling from the
  canvas bounding rect, which a CSS transform is part of, so taps still land
  where they look — but the rect is cached, so `fit()` calls `scale.refresh()`.
  The scale is capped at 1, which is what keeps the desktop exactly as it was.
- **Touch mode is a decision, not a build.** `(pointer: coarse)` settles it
  before the title screen draws; a touchscreen laptop reports a mouse and only
  gets the controls once someone touches the glass. `isTouchMode()` is why the
  title screen can name the controls the player actually has.

The controls live in `index.html` like the rest of the overlay, but *outside*
`#game-container`, so they stay thumb-sized however far the game is scaled
down. In portrait they take a strip below the game (`fit()` shifts the game up
by half of it); in landscape there is no height to spare, so they sit over the
letterbox at either side.

### Procedural textures
`generateTextures(scene)` draws all ~96 sprites pixel-by-pixel with a Phaser `Graphics` object and `generateTexture(key, w, h)`. It is only called in `TitleScene.preload` and `AirportScene.preload` — Phaser's TextureManager is game-global, so every later scene reuses those keys. **New art belongs in `generateTextures`, not in a per-scene preload.** The exceptions are the remote PNGs in `assets.js`, loaded by individual scene `preload()` methods.

### Gotchas that build and test clean

Scene files pack several statements onto one line. Appending a `//` comment to
the end of such a line comments out the rest of the chain — most often the
`this.physics.add.existing(zone, true)` that gives an interaction zone its
body. It parses, it builds, `npm test` passes, and the zone silently never
fires. Put the comment on its own line above.

Dialogue fired from a **timer** must survive a busy box. `showDialogue` returns
`false` and discards its callback if a box is already open, which kills the
rest of the chain — see `PizzaScene.saySoon`, which retries. A swallowed
keypress is harmless because the player presses again; a scheduled line has no
second chance.

Phaser tint multiplies, so it can only darken. A sprite that needs to be
lighter than its texture needs a new texture (`sidewalk_slab` exists because
`pavement` doubles as the road at night).

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

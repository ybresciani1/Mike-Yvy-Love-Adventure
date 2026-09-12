# Mike & Yvy: A Love Story (RPG Edition)

A retro RPG-style adventure game built with Phaser 3 that tells the true story of how Mike and Yvy fell in love. Play through 23 scenes — from a chaotic airport departure and a night out at the club, to a first date, a movie night, tough moments together, and ultimately moving in. All hand-crafted with pixel art graphics and original dialogue.

Every sprite is drawn in code and every sound is synthesised with the Web Audio API, so the game ships with no image or audio files of its own.

## Setup

Requires Node.js 20+ (project is pinned to 24.15.0 via `.nvmrc`).

```bash
nvm use        # switch to the pinned Node version
npm install
npm run dev    # open the URL printed in the terminal
```

## How to play

- **Arrow keys** — move
- **Spacebar** — interact with objects and characters / advance dialogue
- **On a phone** — drag the on-screen pad to move, tap **A** to interact, tap the
  screen to advance a line of dialogue
- Progress is linear — complete each scene's objectives to move to the next

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests as files change |

## Deploying

The repo is set up for [Vercel](https://vercel.com): `vercel.json` selects the Vite preset, runs `npm run build`, and serves `dist/`. Importing the repository is enough — no extra dashboard configuration. `npm run build && npm run preview` reproduces the deployed output locally.

## Project layout

```
index.html      page shell: the HTML overlay (dialogue box, modals) + module entry
src/scenes/     the 23 story scenes, plus the registry in index.js
src/textures/   generateTextures — every sprite in the game, drawn pixel by pixel
src/audio/      synthesised sound effects and music themes
src/ui/         the dialogue system and the on-screen phone controls
src/entities/   the player character
tests/          Vitest suites
```

## Tech

- [Phaser 3](https://phaser.io/), bundled from npm
- [Vite](https://vite.dev/) for the dev server and production build
- [Vitest](https://vitest.dev/) for tests

See [CLAUDE.md](CLAUDE.md) for the architecture in detail — how the DOM overlay and the canvas cooperate, how textures and audio are generated, and how the scene chain fits together.

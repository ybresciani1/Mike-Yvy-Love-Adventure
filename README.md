# Mike & Yvy: A Love Story (RPG Edition)

A retro RPG-style adventure game built with Phaser 3 that tells the true story of how Mike and Yvy fell in love. Play through 22 scenes — from a chaotic airport departure and a night out at the club, to a first date, a movie night, tough moments together, and ultimately moving in. All hand-crafted with pixel art graphics and original dialogue.

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
- Progress is linear — complete each scene's objectives to move to the next

## Tech

- [Phaser 3](https://phaser.io/) loaded via CDN — no bundled game code
- Vite used only as a local dev server
- All game logic lives in `index.html`

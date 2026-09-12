import Phaser from 'phaser';
import './styles.css';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { SCENES } from './scenes/index.js';

export const gameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: SCENES,
    pixelArt: true
};

export const game = new Phaser.Game(gameConfig);

// Developer tools: the chapter-select overlay (press `) and the window.gotoScene
// console helper. Vite substitutes `false` for import.meta.env.DEV in a
// production build and drops this branch along with the dynamic import, so
// src/dev never reaches the bundle Vercel serves.
if (import.meta.env.DEV) {
    import('./dev/devtools.js').then(({ installDevTools }) => installDevTools(game));
}

import Phaser from 'phaser';
import './styles.css';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { SCENES } from './scenes/index.js';
import { installTouchControls } from './ui/touch.js';
import { installAudioUnlock } from './audio/context.js';

// A phone makes no sound until the player touches the screen, and the permission
// only lasts as long as the gesture itself — by the time Phaser has processed a
// tap and reached the game's own playSound, it has expired. This listens for the
// gesture directly, before the game is even built.
installAudioUnlock();

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

// Phones: scale the 800x600 frame down to the screen, and put a D-pad and an
// action button on it. Both feed the game synthetic arrow and SPACE events, so
// the scenes never learn the difference.
installTouchControls(game);

// Developer tools: the chapter-select overlay (press `) and the window.gotoScene
// console helper. Vite substitutes `false` for import.meta.env.DEV in a
// production build and drops this branch along with the dynamic import, so
// src/dev never reaches the bundle Vercel serves.
if (import.meta.env.DEV) {
    import('./dev/devtools.js').then(({ installDevTools }) => installDevTools(game));
}

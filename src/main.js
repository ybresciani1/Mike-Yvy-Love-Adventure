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

// Dev-only handle for debugging in the browser console, e.g.
//   game.scene.start('ThanksgivingScene')
if (import.meta.env.DEV) window.game = game;

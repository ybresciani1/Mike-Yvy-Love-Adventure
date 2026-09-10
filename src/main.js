import Phaser from 'phaser';
import './styles.css';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import { SCENES } from './scenes/index.js';
import { resetDialogue } from './ui/dialogue.js';

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

// Dev-only handles for debugging in the browser console.
if (import.meta.env.DEV) {
    window.game = game;

    /**
     * Jump straight to a scene, e.g. gotoScene('ThanksgivingScene').
     *
     * Use this rather than game.scene.start(key): on the global SceneManager
     * start() runs the target *alongside* whatever is already active, and two
     * live scenes share one keyboard and one DOM dialogue box — the older
     * scene's overlap handlers keep firing dialogue over the new scene. Inside
     * a scene this.scene.start() stops the caller, which is why normal play
     * never hits this.
     */
    window.gotoScene = (key) => {
        resetDialogue();
        game.scene.getScenes(true).forEach((s) => game.scene.stop(s.scene.key));
        game.scene.start(key);
        return key;
    };
}

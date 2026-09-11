import Phaser from 'phaser';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playBlueTheme } from '../audio/music.js';
import { generateTextures } from '../textures/generateTextures.js';

export class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    preload() { generateTextures(this); }
    create() {
        this.cameras.main.setBackgroundColor('#000033'); // Deep Blue
        document.getElementById('scrolling-banner').style.display = 'none'; // Ensure banner hidden

        // --- ADDED: BLUE THEME FOR TITLE ---
        playBlueTheme();

        this.add.text(400, 150, "Mike & Yvy's", { fontSize: '40px', color: '#87ceeb', fontStyle: 'bold', fontFamily: 'Courier New' }).setOrigin(0.5);
        this.add.text(400, 210, "Love Adventure", { fontSize: '60px', color: '#fff', fontStyle: 'bold', fontFamily: 'Courier New' }).setOrigin(0.5);
        this.add.text(400, 270, "By: Yvy (with the help of Aiden)", { fontSize: '20px', color: '#aaaaaa', fontFamily: 'Courier New' }).setOrigin(0.5);

        const mike = this.add.sprite(400, 400, 'mike').setScale(3);
        // Simple phone rect
        const phone = this.add.rectangle(415, 410, 8, 14, 0xeeeeee);
        
        // Animation: Calling Uber
        this.tweens.add({ targets: [mike, phone], y: '+=5', duration: 500, yoyo: true, repeat: -1 });
        
        this.add.text(400, 340, "Calling Uber...", { fontSize: '16px', color: '#fff', backgroundColor: '#333', padding: {x:5, y:2} }).setOrigin(0.5);

        // Most of this game is optional, and nothing else tells you that.
        this.add.text(400, 452, "Look around — most things here will talk back.", { fontSize: '15px', color: '#8fd0e6', fontFamily: 'Courier New' }).setOrigin(0.5);
        this.add.text(400, 474, "Arrow keys to move, SPACE to talk.", { fontSize: '13px', color: '#6f9cb0', fontFamily: 'Courier New' }).setOrigin(0.5);

        this.add.text(400, 520, "CLICK TO START", { fontSize: '24px', color: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0.8);

        this.input.on('pointerdown', () => this.startGame());
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    }

    startGame() {
        // --- ADDED: STOP MUSIC ON START ---
        stopMusic();
        playSound('select');
        this.scene.start('AirportScene');
    }
}

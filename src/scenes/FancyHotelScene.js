import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { fadeOutMusic, playRomanticTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class FancyHotelScene extends Phaser.Scene {
    constructor() { super('FancyHotelScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#200020'); playRomanticTheme();
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) {
            if (y < 12) this.add.image(x*32+16, y*32+16, 'fancy_wallpaper'); 
            else this.add.image(x*32+16, y*32+16, 'floor_wood').setTint(0x554455);
        }
        this.add.image(400, 500, 'fancy_rug'); 
        this.add.image(400, 80, 'chandelier').setScale(2); 
        this.add.rectangle(340, 440, 20, 20, 0x3e2723); this.add.image(340, 430, 'fancy_lamp');
        this.add.rectangle(460, 440, 20, 20, 0x3e2723); this.add.image(460, 430, 'fancy_lamp');
        this.add.image(50, 50, 'plant_snake'); this.add.image(750, 50, 'plant_flowers'); this.add.image(50, 550, 'plant'); this.add.image(750, 550, 'plant');
        this.bed = this.add.image(400, 420, 'fancy_bed'); 
        this.couch = this.add.image(600, 500, 'couch').setTint(0xccaa00);
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 200, 500); this.player.setTexture(outfit);
        this.yvy = this.add.sprite(250, 500, 'yvy');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.time.delayedCall(1000, () => {
            showDialogue("Mike: 'Home sweet home.'", () => { showDialogue("Yvy: 'It's beautiful. What a great day.'", () => { showDialogue("Mike: 'The best day.'", () => {
                this.tweens.add({ targets: this.player, x: 380, y: 440, duration: 2000 });
                this.tweens.add({ targets: this.yvy, x: 420, y: 440, duration: 2000, onComplete: () => {
                    this.add.text(400, 350, "❤️", { fontSize: '40px' }).setOrigin(0.5); fadeOutMusic(2);
                    showDialogue("Mike and Yvy share a kiss.", () => { this.time.delayedCall(3000, () => { this.scene.start('DowntownScene'); }); });
                }});
            }); }); });
        });
    }
    update() { this.player.update(this.cursors); }
}

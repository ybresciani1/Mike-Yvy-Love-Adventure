import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class HouseScene extends Phaser.Scene {
    constructor() { super('HouseScene'); }
    preload() { this.load.image('penny_custom', REMOTE_IMAGES.penny); }
    create() {
        this.cameras.main.setBackgroundColor('#8d6e63');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_wood');
        this.add.text(400, 50, "Yvy's 54th Street House", { fontSize: '24px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 100, 300); this.player.setTexture(outfit);
        this.yvy = this.add.sprite(200, 300, 'yvy');
        this.aiden = this.add.sprite(600, 300, 'aiden');
        this.penny = this.add.sprite(650, 320, 'penny_custom'); this.penny.setDisplaySize(20, 20);
        this.tweens.add({ targets: this.aiden, y: 290, duration: 300, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.penny, x: 670, duration: 200, yoyo: true, repeat: -1 });
        this.cursors = this.input.keyboard.createCursorKeys();
        this.time.delayedCall(1000, () => {
             showDialogue("Because of this connection, Mike got to meet the most important parts of her life...", () => {
                this.tweens.add({ targets: this.player, x: 500, duration: 2000 });
                this.tweens.add({ targets: this.yvy, x: 550, duration: 2000, onComplete: () => {
                    showDialogue("Her son, Aiden (he was 4). And her best friend, Penny.", () => {
                        showDialogue("Mike became part of their family.", () => {
                            this.scene.start('SurgeryScene');
                        });
                    });
                }});
             });
        });
    }
    update() { this.player.update(this.cursors); }
}

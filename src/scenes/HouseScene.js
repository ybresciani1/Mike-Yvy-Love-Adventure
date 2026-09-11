import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';

export class HouseScene extends Phaser.Scene {
    constructor() { super('HouseScene'); }
    preload() { this.load.image('penny_custom', REMOTE_IMAGES.penny); }
    create() {
        this.cameras.main.setBackgroundColor('#8d6e63');
        // Painted wall above the picture rail, boards below it.
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 0; y < GAME_HEIGHT / 32; y++) {
                this.add.image(x * 32 + 16, y * 32 + 16, y < 5 ? 'bedroom_wall' : 'floor_wood');
            }
        }
        this.add.text(400, 30, "Yvy's 54th Street House", { fontSize: '20px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);

        // --- the room ----------------------------------------------------------
        this.add.rectangle(400, 158, GAME_WIDTH, 4, 0xcfc6b4); // picture rail, drawn once
        this.add.rectangle(400, 161, GAME_WIDTH, 3, 0xa89e8c);
        this.add.image(260, 212, 'bed_teal');
        this.add.image(196, 226, 'nightstand');
        this.add.image(196, 208, 'lamp').setScale(0.8);
        this.add.image(324, 226, 'nightstand');
        this.add.image(324, 208, 'night_light').setScale(0.8);
        this.add.image(430, 180, 'dresser');
        this.add.image(560, 190, 'toy_chest');
        this.add.image(640, 104, 'large_window');
        this.add.image(150, 100, 'wall_art');
        this.add.image(300, 100, 'wall_art');
        this.add.image(112, 230, 'plant_fern');
        this.add.image(700, 182, 'dresser');
        this.add.image(132, 442, 'armchair');
        this.add.image(96, 400, 'floor_lamp');
        this.add.image(376, 306, 'conf_table').setTint(0x8d6e4f).setScale(0.6);

        // The floor of a house with a four-year-old in it.
        this.add.image(500, 436, 'kid_rug').setScale(1.6);
        this.add.image(452, 412, 'toy_blocks');
        this.add.image(548, 424, 'toy_dino');
        this.add.image(498, 470, 'toy_car');
        this.add.image(604, 398, 'toy_blocks').setAngle(14);
        this.add.image(368, 470, 'toy_car').setAngle(-8).setFlipX(true);
        this.add.image(232, 430, 'toy_dino').setAngle(22);
        this.add.image(152, 496, 'toy_blocks').setAngle(-11);
        this.add.image(300, 372, 'box').setScale(0.6);

        // Penny's corner.
        this.add.image(712, 456, 'dog_bowls');
        this.add.text(712, 476, "PENNY", {
            fontSize: '9px', color: '#f0e6d2', fontStyle: 'bold'
        }).setOrigin(0.5);
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 100, 300); this.player.setTexture(outfit);
        this.yvy = this.add.sprite(200, 300, 'yvy');
        this.aiden = this.add.sprite(604, 330, 'aiden');
        this.penny = this.add.sprite(690, 420, 'penny_custom'); this.penny.setDisplaySize(20, 20);
        this.tweens.add({ targets: this.aiden, y: 290, duration: 300, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.penny, x: 706, duration: 400, yoyo: true, repeat: -1 });
        this.cursors = this.input.keyboard.createCursorKeys();
        this.time.delayedCall(1000, () => {
             showDialogue("Because of this connection, Mike got to meet the most important parts of her life...", () => {
                this.tweens.add({ targets: this.player, x: 500, duration: 2000 });
                this.tweens.add({ targets: this.yvy, x: 550, duration: 2000, onComplete: () => {
                    showDialogue("Her son, Aiden (he was 4). And her best friend, Penny.", () => {
                        takePhoto({
                            key: 'house', title: '54th Street',
                            caption: "Aiden was four. Penny was already family.",
                            sprites: [
                                { texture: this.player.texture.key, x: -24, y: 0 },
                                { texture: 'yvy', x: -4, y: 0 },
                                { texture: 'aiden', x: 16, y: 6, scale: 0.85 },
                                { texture: 'toy_dino', x: 32, y: 14 }
                            ]
                        });
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

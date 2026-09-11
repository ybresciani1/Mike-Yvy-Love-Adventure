import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { showDialogue } from '../ui/dialogue.js';

export class BurialScene extends Phaser.Scene {
    constructor() { super('BurialScene'); }
    preload() { this.load.image('penny_custom', REMOTE_IMAGES.penny); }
    create() {
        this.cameras.main.setBackgroundColor('#2e7d32');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'grass');
        const walls = this.physics.add.staticGroup();
        for(let x=0; x<GAME_WIDTH; x+=32) walls.create(x+16, 16, 'floor_wood').setTint(0x3e2723);
        // The fence line at the back, the tree she used to lie under, and the
        // shape of a garden somebody's family actually uses.
        for (let x = 16; x < GAME_WIDTH; x += 64) this.add.image(x, 60, 'fence_detailed');
        this.add.image(120, 140, 'bush_detailed').setScale(1.4);
        this.add.image(300, 126, 'bush_detailed').setScale(1.1);
        this.add.image(690, 140, 'bush_detailed').setScale(1.3);
        this.add.image(470, 118, 'plant_flowers').setScale(1.2);
        this.add.image(560, 130, 'plant_flowers');
        this.add.image(96, 470, 'park_bench').setScale(0.9);
        this.add.image(740, 470, 'plant_snake');
        this.add.image(360, 500, 'dog_bowls'); // her bowls, brought out and not put away
        this.add.image(700, 240, 'toy_dino').setAngle(18);
        this.add.image(600, 300, 'grave_plot');
        this.add.image(600, 262, 'pet_stone');
        this.add.image(648, 282, 'shovel').setAngle(16);
        this.yvy = this.add.sprite(200, 300, 'yvy');
        this.aiden = this.add.sprite(240, 310, 'aiden');
        this.penny = this.add.sprite(220, 320, 'penny_custom'); this.penny.setDisplaySize(20, 20);
        this.tear1 = this.add.text(200, 260, '💧', { fontSize: '20px' }).setOrigin(0.5);
        this.tear2 = this.add.text(240, 270, '💧', { fontSize: '20px' }).setOrigin(0.5);
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(400, 300, outfit);
        this.casket = this.add.image(220, 320, 'casket').setVisible(false);
        this.time.delayedCall(1000, () => {
            showDialogue("When Penny passed away, Mike stood nearby as Yvy and Aiden said their goodbyes.", () => {
                this.tweens.add({ targets: this.player, x: 260, duration: 1500, onComplete: () => {
                    showDialogue("He helped her place Penny in the casket.", () => {
                        this.penny.setVisible(false);
                        this.casket.setVisible(true);
                        this.casket.x = 260; this.casket.y = 310;
                        this.time.delayedCall(1000, () => {
                            this.tweens.add({ targets: [this.player, this.casket], x: 580, duration: 2500, onComplete: () => {
                                 showDialogue("He helped bury her in the backyard, sharing in their grief.", () => {
                                     this.scene.start('NewYearsScene');
                                 });
                            }});
                            this.tweens.add({ targets: this.yvy, x: 540, duration: 2500, delay: 200 });
                            this.tweens.add({ targets: this.aiden, x: 520, duration: 2500, delay: 400 });
                        });
                    });
                }});
            });
        });
    }
    update() {
        if (this.yvy && this.tear1) {
            this.tear1.x = this.yvy.x;
            this.tear1.y = this.yvy.y - 40;
        }
        if (this.aiden && this.tear2) {
            this.tear2.x = this.aiden.x;
            this.tear2.y = this.aiden.y - 40;
        }
    }
}

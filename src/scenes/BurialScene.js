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
        this.add.rectangle(600, 300, 64, 32, 0x3e2723);
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

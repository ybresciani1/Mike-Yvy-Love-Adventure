import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { showDialogue } from '../ui/dialogue.js';

export class ApartmentScene extends Phaser.Scene {
    constructor() { super('ApartmentScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#dcedc8');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_wood');
        this.add.text(400, 50, "Their First Apartment", { fontSize: '24px', color: '#000', backgroundColor: '#fff' }).setOrigin(0.5);
        this.add.image(100, 500, 'box'); this.add.image(130, 500, 'box'); this.add.image(115, 470, 'box'); this.add.image(700, 500, 'box');
        this.add.image(400, 320, 'couch_green'); this.add.image(400, 240, 'tv'); this.add.image(200, 200, 'lamp');
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(350, 350, outfit);
        this.yvy = this.add.sprite(450, 350, 'yvy');
        this.aiden = this.add.sprite(400, 320, 'aiden');
        this.visitors = this.add.group();
        this.time.delayedCall(1000, () => {
            showDialogue("Since then, they've grown closer together.", () => {
                // --- CHANGED: NC to DC ---
                showDialogue("Mike moved in from DC to SD.", () => {
                    showDialogue("They got their first apartment...", () => {
                        let mom = this.add.sprite(100, 300, 'civilian').setTint(0xffaaaa);
                        let alex = this.add.sprite(700, 300, 'mike').setTint(0x8888ff);
                        let kevin = this.add.sprite(650, 320, 'mike_casual').setTint(0xaaaaaa);
                        this.visitors.addMultiple([mom, alex, kevin]);
                        this.visitors.setAlpha(0);
                        this.tweens.add({ targets: this.visitors.getChildren(), alpha: 1, duration: 1000 });
                        showDialogue("Yvy's mom, half-brother Alex, and Kevin came to visit.", () => {
                            showDialogue("Mike met them for the first time, and they grew to appreciate each other.", () => {
                                this.scene.start('ThanksgivingScene');
                            });
                        });
                    });
                });
            });
        });
    }
}

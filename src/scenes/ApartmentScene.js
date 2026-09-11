import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { showDialogue } from '../ui/dialogue.js';

export class ApartmentScene extends Phaser.Scene {
    constructor() { super('ApartmentScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#dcedc8');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_wood');
        this.add.text(400, 50, "Their First Apartment", { fontSize: '24px', color: '#000', backgroundColor: '#fff' }).setOrigin(0.5);
        // Moving-in week: half the flat is still in cartons, the rug is not down
        // yet, and the good furniture has not arrived.
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 0; y < 5; y++) this.add.image(x * 32 + 16, y * 32 + 16, 'bedroom_wall');
        }
        this.add.rectangle(400, 158, GAME_WIDTH, 4, 0xcfc6b4);
        this.add.rectangle(400, 161, GAME_WIDTH, 3, 0xa89e8c);
        this.add.image(660, 104, 'large_window');
        this.add.image(150, 104, 'large_window');
        this.add.image(400, 100, 'wall_art');

        this.add.image(92, 470, 'moving_box');
        this.add.image(124, 496, 'moving_box');
        this.add.image(100, 440, 'moving_box').setAngle(-4);
        this.add.image(712, 468, 'moving_box');
        this.add.image(686, 496, 'moving_box').setAngle(3);
        this.add.image(636, 440, 'rolled_rug');
        this.add.image(196, 500, 'rolled_rug').setAngle(-6);
        this.add.image(276, 466, 'moving_box').setAngle(7);

        this.add.image(120, 200, 'kitchenette_uppers').setScale(0.8);
        this.add.image(120, 250, 'kitchenette_base').setScale(0.8);
        this.add.image(240, 236, 'mini_fridge');
        this.add.image(560, 200, 'dresser');
        this.add.image(660, 250, 'plant_snake');
        this.add.image(60, 330, 'pothos');
        this.add.image(400, 300, 'couch_green');
        this.add.image(400, 228, 'tv_unit');
        this.add.image(400, 208, 'tv').setScale(0.9);
        this.add.image(300, 362, 'conf_table').setTint(0x8d6e4f).setScale(0.6);
        this.add.image(300, 352, 'coffee').setScale(0.7);
        this.add.image(486, 300, 'armchair');
        this.add.image(200, 196, 'floor_lamp');
        this.add.image(524, 236, 'toy_chest');
        this.add.image(470, 420, 'toy_blocks').setAngle(9);
        this.add.image(352, 438, 'toy_car');
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(350, 350, outfit);
        this.yvy = this.add.sprite(450, 350, 'yvy');
        this.aiden = this.add.sprite(400, 320, 'aiden');
        this.visitors = this.add.group();
        this.time.delayedCall(1000, () => {
            showDialogue("Since then, they've grown closer together.", () => {
                showDialogue("Mike moved in from DC to SD.", () => {
                    showDialogue("They got their first apartment...", () => {
                        let mom = this.add.sprite(100, 300, 'yvy_mom');
                        let alex = this.add.sprite(700, 300, 'alex');
                        let kevin = this.add.sprite(650, 320, 'kevin');
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

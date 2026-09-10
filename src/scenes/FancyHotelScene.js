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
            else this.add.image(x*32+16, y*32+16, 'floor_wood');
        }
        this.add.image(400, 92, 'chandelier').setScale(1.8);

        // --- the wall, left to right -----------------------------------------
        // Kitchenette in the left bay: uppers, a stone run with a sink, the
        // espresso machine and the fridge tucked in beside it.
        this.add.rectangle(126, 332, 112, 16, 0xcfc9bd); // tiled backsplash
        this.add.rectangle(126, 325, 112, 1, 0xbdb6a8);
        this.add.image(126, 312, 'kitchenette_uppers');
        this.add.image(126, 362, 'kitchenette_base');
        this.add.image(88, 330, 'coffee_machine');
        this.add.image(158, 331, 'champagne_service').setScale(0.7);
        this.add.image(206, 370, 'mini_fridge');
        this.add.image(194, 326, 'pothos').setScale(0.8);

        // Three different pieces on the walls. They used to be the same canvas
        // hung twice, which reads as a rendering bug rather than as decor.
        this.add.image(80, 150, 'abstract_art').setScale(1.15);
        this.add.image(168, 146, 'suite_art_botanical');
        this.add.image(400, 170, 'suite_art_arch').setScale(1.4);

        // Bed centred on the walnut slat panel.
        for (let x = 304; x <= 496; x += 32) this.add.image(x, 352, 'wood_slat_panel');

        // The window is the room's one view, so it gets most of the right wall,
        // with the desk under it and the mirror where you would actually stand.
        this.add.image(650, 200, 'suite_window').setScale(1.4);
        this.add.image(600, 369, 'hotel_desk');
        this.add.image(600, 398, 'desk_chair').setDepth(1);
        this.add.image(624, 346, 'plant_flowers').setScale(0.7);
        this.add.image(538, 352, 'fancy_lamp').setScale(0.8);
        this.add.image(766, 362, 'console_mirror').setScale(0.8);

        // --- the floor ---------------------------------------------------------
        this.add.image(400, 500, 'fancy_rug');
        this.add.rectangle(340, 440, 20, 20, 0x3e2723); this.add.image(340, 430, 'fancy_lamp');
        this.add.rectangle(460, 440, 20, 20, 0x3e2723); this.add.image(460, 430, 'fancy_lamp');
        this.add.image(122, 470, 'chaise');
        this.add.image(60, 430, 'pothos').setScale(1.3);
        this.add.image(58, 545, 'plant_snake');
        this.add.image(752, 430, 'plant_fern').setScale(1.2);
        this.add.image(752, 545, 'pothos').setScale(1.2);
        this.bed = this.add.image(400, 420, 'fancy_bed');
        this.couch = this.add.image(646, 505, 'couch').setTint(0xa9a396);
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

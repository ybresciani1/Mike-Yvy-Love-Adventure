import Phaser from 'phaser';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';

export class NewYearsScene extends Phaser.Scene {
    constructor() { super('NewYearsScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#000033');
        for(let i=0; i<10; i++) {
            let h = 100 + Math.random() * 200;
            this.add.rectangle(50 + i*80, 600 - h/2, 60, h, 0x111111);
            for(let j=0; j<5; j++) {
                if(Math.random() > 0.5) this.add.rectangle(50 + i*80, 600 - h + 20 + j*30, 10, 10, 0xffff00);
            }
        }
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(380, 400, outfit);
        this.yvy = this.add.sprite(420, 400, 'yvy');
        this.fireworks = this.add.group();
        this.time.addEvent({
            delay: 800,
            loop: true,
            callback: () => {
                let x = Math.random() * 800;
                let y = Math.random() * 300;
                let color = ['firework_red', 'firework_green', 'firework_blue'][Math.floor(Math.random() * 3)];
                let fw = this.add.particles(x, y, color, { speed: 100, lifespan: 1000, scale: { start: 1, end: 0 }, quantity: 20, blendMode: 'ADD' });
                playSound('fire');
                this.time.delayedCall(1000, () => fw.destroy());
            }
        });
        this.time.delayedCall(1000, () => {
            showDialogue("Mike and Yvy shared valuable time together.", () => {
                showDialogue("And as the story unfolded, Mike and Yvy became official on New Years Day.", () => {
                    this.tweens.add({ targets: this.player, x: 395, duration: 1000 });
                    this.tweens.add({ targets: this.yvy, x: 405, duration: 1000, onComplete: () => {
                        this.add.text(400, 350, "❤️", { fontSize: '40px' }).setOrigin(0.5);
                        showDialogue("They shared a kiss as the fireworks lit up the sky.", () => {
                            this.scene.start('ApartmentScene');
                        });
                    }});
                });
            });
        });
    }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';
import { takePhoto } from '../ui/scrapbook.js';

export class NewYearsScene extends Phaser.Scene {
    constructor() { super('NewYearsScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#070b1c');
        this.buildCity();

        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(378, 470, outfit).setDepth(6);
        this.yvy = this.add.sprite(422, 470, 'yvy').setDepth(6);
        [this.player, this.yvy].forEach((who, i) => this.tweens.add({
            targets: who, y: who.y - 2, duration: 1400 + i * 300,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        }));

        this.fireworkTimer = this.time.addEvent({
            delay: 900, loop: true, callback: () => this.launchFirework()
        });

        this.time.delayedCall(1000, () => {
            showDialogue("Mike and Yvy shared valuable time together.", () => {
                showDialogue("And as the story unfolded, Mike and Yvy became official on New Years Day.", () => {
                    this.countdown();
                });
            });
        });
    }

    /**
     * The skyline was ten grey rectangles with yellow squares on them. It is a
     * drawn city now, reflected in the bay, with a crowd on the waterfront
     * watching the same fireworks Mike and Yvy are.
     */
    buildCity() {
        [[0x070b1c, 0, 90], [0x0c1330, 90, 60], [0x141d45, 150, 50],
         [0x1d2a58, 200, 40], [0x2a3a6b, 240, 34]]
            .forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));

        for (let i = 0; i < 70; i++) {
            const sy = Math.random() * 200;
            this.add.rectangle(Math.random() * GAME_WIDTH, sy, 2, 2, 0xffffff, 0.85 - sy / 260);
        }
        this.add.image(112, 92, 'moon').setScale(1.2);
        this.add.circle(112, 92, 34, 0xdfe8ff, 0.08);

        // Two runs of towers, the back one hazed and smaller.
        for (let sx = 0; sx < 5; sx++) {
            this.add.image(sx * 200 + 100, 230, 'night_skyline')
                .setScale(0.75).setAlpha(0.55).setTint(0x8fa0c4);
        }
        for (let sx = 0; sx < 5; sx++) {
            this.add.image(sx * 200 + 40, 282, 'night_skyline');
        }

        // The bay, and the city upside down in it.
        this.add.rectangle(400, 376, GAME_WIDTH, 84, 0x0b1330);
        for (let sx = 0; sx < 5; sx++) {
            this.add.image(sx * 200 + 40, 384, 'night_skyline')
                .setFlipY(true).setAlpha(0.22).setScale(1, 0.55);
        }
        for (let i = 0; i < 60; i++) {
            this.add.rectangle(Math.random() * GAME_WIDTH, 344 + Math.random() * 72,
                4 + Math.random() * 12, 2, 0x2e4478, 0.55);
        }

        // Waterfront railing and the crowd along it, all in silhouette.
        this.add.rectangle(400, 420, GAME_WIDTH, 40, 0x101736);
        this.add.rectangle(400, 402, GAME_WIDTH, 3, 0x2a3560);
        for (let rx = 12; rx < GAME_WIDTH; rx += 34) {
            this.add.rectangle(rx, 412, 3, 18, 0x1c2648);
        }
        const crowdKeys = ['civilian', 'civilian_f', 'drunk', 'marine'];
        for (let i = 0; i < 22; i++) {
            const cx = 20 + i * 36 + (i % 3) * 6;
            if (Math.abs(cx - 400) < 54) continue; // leave them room to stand
            const who = this.add.sprite(cx, 448 + (i % 2) * 6, crowdKeys[i % crowdKeys.length])
                .setTint(0x121a33).setDepth(4);
            this.tweens.add({
                targets: who, y: who.y - 2, duration: 1100 + (i % 5) * 220,
                yoyo: true, repeat: -1, delay: i * 90, ease: 'Sine.easeInOut'
            });
        }
        this.add.rectangle(400, 540, GAME_WIDTH, 120, 0x0d1228).setDepth(3);
    }

    launchFirework() {
        const x = 80 + Math.random() * 640;
        const y = 60 + Math.random() * 180;
        const colour = ['firework_red', 'firework_green', 'firework_blue'][Math.floor(Math.random() * 3)];

        // A shell going up before it goes off, rather than a burst from nowhere.
        const shell = this.add.rectangle(x, 340, 3, 7, 0xffe8b0).setDepth(5);
        this.tweens.add({
            targets: shell, y, duration: 620, ease: 'Quad.easeOut',
            onComplete: () => {
                shell.destroy();
                const burst = this.add.particles(x, y, colour, {
                    speed: 120, lifespan: 1100, scale: { start: 1, end: 0 },
                    quantity: 22, blendMode: 'ADD'
                }).setDepth(5);
                const flash = this.add.circle(x, y, 70, 0xffffff, 0.18).setDepth(4);
                this.tweens.add({ targets: flash, alpha: 0, scale: 1.6, duration: 420, onComplete: () => flash.destroy() });
                playSound('firework');
                this.time.delayedCall(1200, () => burst.destroy());
            }
        });
    }

    /** Midnight, counted out over the water. */
    countdown() {
        const numbers = ['3', '2', '1', 'HAPPY NEW YEAR'];
        const step = i => {
            if (i >= numbers.length) return this.theKiss();
            const big = i === numbers.length - 1;
            const label = this.add.text(400, 210, numbers[i], {
                fontSize: big ? '38px' : '72px', color: big ? '#ffe08a' : '#ffffff',
                fontStyle: 'bold', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(9).setAlpha(0);
            playSound(big ? 'firework' : 'select');
            this.tweens.add({
                targets: label, alpha: 1, scale: big ? 1.15 : 1.4, duration: big ? 500 : 380,
                yoyo: !big, hold: big ? 600 : 120,
                onComplete: () => {
                    if (big) {
                        this.fireworkTimer.delay = 320;
                        this.time.delayedCall(900, () => { label.destroy(); step(i + 1); });
                    } else {
                        label.destroy();
                        step(i + 1);
                    }
                }
            });
        };
        step(0);
    }

    theKiss() {
        this.tweens.add({ targets: this.player, x: 393, duration: 900 });
        this.tweens.add({
            targets: this.yvy, x: 407, duration: 900,
            onComplete: () => {
                const heart = this.add.text(400, 436, "❤️", { fontSize: '34px' }).setOrigin(0.5).setDepth(8);
                this.tweens.add({ targets: heart, y: 404, scale: 1.2, duration: 1400, yoyo: true, repeat: -1 });
                takePhoto({
                    key: 'newyears', title: 'New Year',
                    caption: "Midnight over the water, and it was official.",
                    sprites: [
                        { texture: this.player.texture.key, x: -8, y: 4 },
                        { texture: 'yvy', x: 8, y: 4 },
                        { texture: 'firework_red', x: -26, y: -16, scale: 1.4 },
                        { texture: 'firework_blue', x: 26, y: -18, scale: 1.4 },
                        { texture: 'firework_green', x: 0, y: -28, scale: 1.2 }
                    ]
                });
                showDialogue("They shared a kiss as the fireworks lit up the sky.", () => {
                    this.scene.start('ApartmentScene');
                });
            }
        });
    }
}

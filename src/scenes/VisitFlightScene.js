import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';

/**
 * Back out to San Diego, and this time nobody sent him. The same flight as the
 * first one — westbound, crossing right to left — with San Diego coming up on
 * the left as he gets closer: the flight home, the other way round.
 */
export class VisitFlightScene extends Phaser.Scene {
    constructor() { super('VisitFlightScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#4a9fd4');

        // Sky, thinning towards the top the way it does at altitude.
        [[0x2c6fa8, 0, 60], [0x3b86bf, 60, 46], [0x4f9ed2, 106, 44],
         [0x66b4de, 150, 42], [0x84c9e8, 192, 40], [0xa6dcef, 232, 38]]
            .forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));

        this.add.rectangle(400, 300, GAME_WIDTH, 60, 0xc9e3ef);
        this.add.rectangle(400, 450, GAME_WIDTH, 240, 0x2f6f96);
        this.add.rectangle(400, 336, GAME_WIDTH, 12, 0x8fc4d8);
        for (let i = 0; i < 70; i++) {
            this.add.rectangle(Math.random() * GAME_WIDTH, 350 + Math.random() * 240,
                8 + Math.random() * 16, 2, 0x5a9ec0, 0.5);
        }

        // The afternoon sun behind him; he has been flying away from it all day.
        this.add.circle(640, 120, 40, 0xfff3c4, 0.5);
        this.add.circle(640, 120, 26, 0xfffbe4);

        // San Diego, coming up on the left out of the haze.
        this.coast = this.add.container(-300, 330).setScale(0.55).setAlpha(0.2);
        this.coast.add(this.add.rectangle(0, 9, 470, 18, 0xb99a6a));
        this.coast.add(this.add.rectangle(0, 0, 470, 5, 0xe8dcc0));
        this.coast.add(this.add.rectangle(0, 4, 470, 3, 0x9fd0e0));
        this.coast.add(this.add.image(-50, -26, 'sd_skyline').setScale(0.75));
        this.tweens.add({
            targets: this.coast, x: 230, y: 322, scale: 1, alpha: 1,
            duration: 16000, ease: 'Sine.easeOut'
        });

        // Three layers of cloud at three speeds.
        this.clouds = [];
        [
            { n: 4, y: [60, 200], s: [2.4, 3.2], a: 0.9, v: 1.9 },
            { n: 5, y: [120, 300], s: [1.4, 2.0], a: 0.75, v: 1.1 },
            { n: 6, y: [180, 330], s: [0.7, 1.1], a: 0.5, v: 0.5 }
        ].forEach(layer => {
            for (let i = 0; i < layer.n; i++) {
                const cloud = this.add.image(
                    Math.random() * 1200,
                    layer.y[0] + Math.random() * (layer.y[1] - layer.y[0]),
                    'cloud'
                ).setScale(layer.s[0] + Math.random() * (layer.s[1] - layer.s[0]))
                 .setAlpha(layer.a);
                this.clouds.push({ cloud, v: layer.v });
            }
        });

        this.plane = this.add.image(920, 250, 'airliner').setScale(1.3).setDepth(4).setFlipX(true);
        this.tweens.add({ targets: this.plane, y: 242, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Contrails, streaming off behind him to the right.
        this.time.addEvent({
            delay: 90, loop: true, callback: () => {
                [-10, 10].forEach(off => {
                    const puff = this.add.circle(this.plane.x + 40, this.plane.y + off, 4, 0xffffff, 0.45).setDepth(3);
                    this.tweens.add({
                        targets: puff, x: '+=' + 220, alpha: 0, scale: 2.4,
                        duration: 2200, onComplete: () => puff.destroy()
                    });
                });
            }
        });

        this.add.text(400, 150, "SD  ◄———————————  DC", {
            fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#1d4f6e', strokeThickness: 4
        }).setOrigin(0.5).setDepth(5);
        this.add.text(400, 188, "Not for work, this time.", {
            fontSize: '13px', color: '#e8f6ff', stroke: '#1d4f6e', strokeThickness: 3
        }).setOrigin(0.5).setDepth(5);

        playSound('whoosh');
        this.tweens.add({
            targets: this.plane, x: 430, duration: 5200, ease: 'Quad.easeOut',
            onComplete: () => this.onTheWay()
        });
    }

    /** Dialogue fired from a timer has to survive a box that is already open. */
    saySoon(text, next) {
        if (!showDialogue(text, next)) this.time.delayedCall(350, () => this.saySoon(text, next));
    }

    onTheWay() {
        const phone = this.add.image(this.plane.x - 10, this.plane.y + 62, 'cellphone')
            .setScale(1.6).setDepth(6).setAlpha(0);
        this.tweens.add({ targets: phone, alpha: 1, y: this.plane.y + 54, duration: 400 });
        this.tweens.add({
            targets: phone, angle: { from: -4, to: 4 }, duration: 1400,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        const lines = [
            "Mike flew back out to San Diego. This time, it was not for work.",
            "Mike: 'Wheels up. I booked us somewhere for tonight.'",
            "Yvy: 'Where?'",
            "Mike: 'Wear something nice. Twelve floors up nice.'"
        ];
        let i = 0;
        const next = () => {
            if (i >= lines.length) {
                this.tweens.add({ targets: phone, alpha: 0, duration: 400, onComplete: () => phone.destroy() });
                this.tweens.add({
                    targets: this.plane, x: -140, duration: 2600, ease: 'Quad.easeIn',
                    onComplete: () => this.scene.start('MisterAsScene')
                });
                return;
            }
            this.saySoon(lines[i++], next);
        };
        next();
    }

    update() {
        this.clouds.forEach(({ cloud, v }) => {
            cloud.x -= v;
            if (cloud.x < -180) cloud.x = GAME_WIDTH + 180 + Math.random() * 200;
        });
    }
}

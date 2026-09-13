import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';

/**
 * The flight home, which is the same flight as the one out with everything the
 * other way round: the coast on the left instead of the right, the plane
 * crossing left to right, and San Diego going away behind it rather than coming
 * up in front.
 */
export class ReturnFlightScene extends Phaser.Scene {
    constructor() { super('ReturnFlightScene'); }

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

        // Morning sun ahead of him, because he is flying east now.
        this.add.circle(650, 120, 40, 0xfff3c4, 0.5);
        this.add.circle(650, 120, 26, 0xfffbe4);

        // San Diego on the left, going away. It drifts off the edge over the
        // course of the scene, which is the only thing here that says which
        // direction he is travelling in.
        this.coast = this.add.container(230, 322);
        this.coast.add(this.add.rectangle(0, 9, 470, 18, 0xb99a6a)); // the land, edge on
        this.coast.add(this.add.rectangle(0, 0, 470, 5, 0xe8dcc0)); // the beach
        this.coast.add(this.add.rectangle(0, 4, 470, 3, 0x9fd0e0)); // surf
        this.coast.add(this.add.image(-50, -26, 'sd_skyline').setScale(0.75));
        this.tweens.add({
            targets: this.coast, x: -300, scale: 0.55, alpha: 0.2,
            duration: 18000, ease: 'Sine.easeIn'
        });

        // Three layers of cloud at three speeds — that, more than the aeroplane,
        // is what makes it feel like it is moving.
        this.clouds = [];
        const layers = [
            { n: 4, y: [60, 200], s: [2.4, 3.2], a: 0.9, v: 1.9 },
            { n: 5, y: [120, 300], s: [1.4, 2.0], a: 0.75, v: 1.1 },
            { n: 6, y: [180, 330], s: [0.7, 1.1], a: 0.5, v: 0.5 }
        ];
        layers.forEach(layer => {
            for (let i = 0; i < layer.n; i++) {
                const cloud = this.add.image(
                    Math.random() * 1200 - 400,
                    layer.y[0] + Math.random() * (layer.y[1] - layer.y[0]),
                    'cloud'
                ).setScale(layer.s[0] + Math.random() * (layer.s[1] - layer.s[0]))
                 .setAlpha(layer.a);
                this.clouds.push({ cloud, v: layer.v });
            }
        });

        this.plane = this.add.image(-120, 250, 'airliner').setScale(1.3).setDepth(4);
        this.tweens.add({ targets: this.plane, y: 242, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Contrails off both wings, trailing behind him — so, to his left.
        this.time.addEvent({
            delay: 90, loop: true, callback: () => {
                [-10, 10].forEach(off => {
                    const puff = this.add.circle(this.plane.x - 40, this.plane.y + off, 4, 0xffffff, 0.45).setDepth(3);
                    this.tweens.add({
                        targets: puff, x: '-=' + 220, alpha: 0, scale: 2.4,
                        duration: 2200, onComplete: () => puff.destroy()
                    });
                });
            }
        });

        this.add.text(400, 150, "SD  ———————————►  DC", {
            fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#1d4f6e', strokeThickness: 4
        }).setOrigin(0.5).setDepth(5);
        this.add.text(400, 188, "Sunday. Church first, then the airport.", {
            fontSize: '13px', color: '#e8f6ff', stroke: '#1d4f6e', strokeThickness: 3
        }).setOrigin(0.5).setDepth(5);

        playSound('whoosh');
        this.tweens.add({
            targets: this.plane, x: 430, duration: 5200, ease: 'Quad.easeOut',
            onComplete: () => this.theWayHome()
        });
    }

    /** Dialogue fired from a timer has to survive a box that is already open. */
    saySoon(text, next) {
        if (!showDialogue(text, next)) this.time.delayedCall(350, () => this.saySoon(text, next));
    }

    theWayHome() {
        const lines = [
            "Hunter got him to church that morning, and to the airport after it.",
            "Hunter: 'Well. You came out here for a work thing.'",
            "Mike: 'I did come out here for a work thing.'",
            "Hunter: 'Sure. And how much of this week was the work thing?'",
            "Mike: '...Some of it was the work thing.'",
            "Hunter: 'Text her from the gate. Don't do the thing where you wait three days.'"
        ];
        let i = 0;
        const next = () => {
            if (i >= lines.length) return this.theTexting();
            this.saySoon(lines[i++], next);
        };
        next();
    }

    /** He did not wait three days. */
    theTexting() {
        const phone = this.add.image(this.plane.x + 10, this.plane.y + 62, 'cellphone')
            .setScale(1.6).setDepth(6).setAlpha(0);
        this.tweens.add({ targets: phone, alpha: 1, y: this.plane.y + 54, duration: 400 });
        this.tweens.add({
            targets: phone, angle: { from: -4, to: 4 }, duration: 1400,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        const lines = [
            "Mike: 'Wheels up. Thank you for this week.'",
            "Yvy: 'Thank YOU for this week. Text me when you land.'",
            "Mike: 'That's five hours away.'",
            "Yvy: 'I know how long the flight is, Mike.'",
            "He texted her from the gate. He texted her from the air. He texted her from the kerb at Dulles.",
            "Three thousand miles, and somehow it did not go quiet."
        ];
        let i = 0;
        const next = () => {
            if (i >= lines.length) {
                this.tweens.add({ targets: phone, alpha: 0, duration: 400, onComplete: () => phone.destroy() });
                this.tweens.add({
                    targets: this.plane, x: 940, duration: 2600, ease: 'Quad.easeIn',
                    onComplete: () => this.scene.start('DowntownScene')
                });
                return;
            }
            this.saySoon(lines[i++], next);
        };
        next();
    }

    update() {
        // Eastbound, so everything streams away to the left behind him.
        this.clouds.forEach(({ cloud, v }) => {
            cloud.x -= v;
            if (cloud.x < -260) cloud.x = GAME_WIDTH + 200 + Math.random() * 200;
        });
    }
}

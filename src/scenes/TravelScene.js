import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';
import { takePhoto } from '../ui/scrapbook.js';

export class TravelScene extends Phaser.Scene {
    constructor() { super('TravelScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#4a9fd4');
        this.buildSky();

        this.plane = this.add.image(880, 250, 'airliner').setScale(1.3).setDepth(4);
        this.legIndex = 0;

        // Contrails, from whichever way the plane happens to be pointing.
        this.time.addEvent({
            delay: 90, loop: true, callback: () => {
                if (!this.flying) return;
                const behind = this.plane.flipX ? 40 : -40;
                [-10, 10].forEach(off => {
                    const puff = this.add.circle(this.plane.x + behind, this.plane.y + off, 4, 0xffffff, 0.45).setDepth(3);
                    this.tweens.add({
                        targets: puff, x: '+=' + (this.plane.flipX ? 220 : -220), alpha: 0, scale: 2.4,
                        duration: 2200, onComplete: () => puff.destroy()
                    });
                });
            }
        });

        this.label = this.add.text(400, 150, "", {
            fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#1d4f6e', strokeThickness: 4
        }).setOrigin(0.5).setDepth(5);

        this.add.text(400, 188, "Three thousand miles, whenever they could manage it", {
            fontSize: '13px', color: '#e8f6ff'
        }).setOrigin(0.5).setDepth(5);

        this.time.delayedCall(600, () => this.flyLeg());
    }

    /**
     * The same sky as the first flight, so the crossings read as the same
     * journey happening over and over rather than as a map screen. The plane
     * still goes back and forth the way it used to.
     */
    buildSky() {
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
        this.add.circle(150, 120, 40, 0xfff3c4, 0.5);
        this.add.circle(150, 120, 26, 0xfffbe4);

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
    }

    /** One crossing per line of narration, alternating direction. */
    flyLeg() {
        const legs = [
            { west: true, line: "Mike and Yvy got to know each other more." },
            { west: false, line: "Yvy was scared at first because Mike seemed too NICE..." },
            { west: true, line: "But as time passed, she realized Mike was kind, safe, and truly genuine." }
        ];
        if (this.legIndex >= legs.length) {
            // Out of the window on the last crossing, which is the only picture
            // either of them took of the year they spent in the air.
            takePhoto({
                key: 'crossings', title: 'Three thousand miles',
                caption: "DC to SD and back again, as often as they could afford it.",
                window: 0x3b86bf,
                sprites: [
                    { rect: [180, 18], x: 0, y: -31, color: 0x2c6fa8 },
                    { rect: [180, 14], x: 0, y: -15, color: 0x4f9ed2 },
                    { rect: [180, 12], x: 0, y: -3, color: 0x84c9e8 },
                    { rect: [180, 10], x: 0, y: 8, color: 0xc9e3ef },
                    { rect: [180, 24], x: 0, y: 25, color: 0x2f6f96 },
                    { circle: 7, x: -62, y: -26, color: 0xfffbe4 },
                    { texture: 'cloud', x: -48, y: 6, scale: 1.1 },
                    { texture: 'cloud', x: 54, y: 14, scale: 0.8 },
                    { texture: 'airliner', x: 6, y: -8, scale: 0.9 }
                ]
            });
            return this.scene.start('HouseScene');
        }
        const leg = legs[this.legIndex++];

        // Westbound is DC to SD, so the aeroplane crosses right to left.
        this.plane.setFlipX(leg.west);
        this.plane.setPosition(leg.west ? 900 : -100, 250);
        this.label.setText(leg.west ? "SD  ◄———————————  DC" : "SD  ———————————►  DC");
        this.cloudDrift = leg.west ? 1 : -1;

        this.flying = true;
        playSound('whoosh');
        this.bob = this.tweens.add({
            targets: this.plane, y: 242, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: this.plane, x: leg.west ? -100 : 900, duration: 4200, ease: 'Quad.easeInOut',
            onComplete: () => {
                this.flying = false;
                this.bob.remove();
                showDialogue(leg.line, () => this.flyLeg());
            }
        });
    }

    update() {
        // The cloud layers run against the plane, so the sky reverses with it.
        const dir = this.cloudDrift || 1;
        this.clouds.forEach(({ cloud, v }) => {
            cloud.x -= v * dir;
            if (dir > 0 && cloud.x < -180) cloud.x = GAME_WIDTH + 180 + Math.random() * 200;
            if (dir < 0 && cloud.x > GAME_WIDTH + 180) cloud.x = -180 - Math.random() * 200;
        });
    }
}

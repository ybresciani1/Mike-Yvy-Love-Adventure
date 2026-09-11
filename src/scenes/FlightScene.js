import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';

export class FlightScene extends Phaser.Scene {
    constructor() { super('FlightScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#4a9fd4');

        // Sky, thinning towards the top the way it does at altitude.
        [[0x2c6fa8, 0, 60], [0x3b86bf, 60, 46], [0x4f9ed2, 106, 44],
         [0x66b4de, 150, 42], [0x84c9e8, 192, 40], [0xa6dcef, 232, 38]]
            .forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));

        // Sea below, with the coast they are leaving on the far right.
        this.add.rectangle(400, 300, GAME_WIDTH, 60, 0xc9e3ef);
        this.add.rectangle(400, 450, GAME_WIDTH, 240, 0x2f6f96);
        this.add.rectangle(400, 336, GAME_WIDTH, 12, 0x8fc4d8);
        for (let i = 0; i < 70; i++) {
            this.add.rectangle(Math.random() * GAME_WIDTH, 350 + Math.random() * 240,
                8 + Math.random() * 16, 2, 0x5a9ec0, 0.5);
        }
        this.add.circle(150, 120, 40, 0xfff3c4, 0.5);
        this.add.circle(150, 120, 26, 0xfffbe4);

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
                    Math.random() * 1200,
                    layer.y[0] + Math.random() * (layer.y[1] - layer.y[0]),
                    'cloud'
                ).setScale(layer.s[0] + Math.random() * (layer.s[1] - layer.s[0]))
                 .setAlpha(layer.a);
                this.clouds.push({ cloud, v: layer.v });
            }
        });

        const plane = this.add.image(880, 250, 'airliner').setScale(1.3).setDepth(4);
        plane.setFlipX(true);
        this.tweens.add({ targets: plane, y: 242, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Contrails off both wings.
        this.trails = [];
        this.time.addEvent({
            delay: 90, loop: true, callback: () => {
                [-10, 10].forEach(off => {
                    const puff = this.add.circle(plane.x + 40, plane.y + off, 4, 0xffffff, 0.45).setDepth(3);
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
        this.add.text(400, 186, "Five hours, one aisle seat, no regrets", {
            fontSize: '13px', color: '#e8f6ff'
        }).setOrigin(0.5).setDepth(5);

        playSound('whoosh');
        this.tweens.add({
            targets: plane, x: -80, duration: 5200, ease: 'Quad.easeInOut',
            onComplete: () => this.scene.start('BarScene')
        });
    }

    update() {
        // Everything drifts right to left, faster the closer it is.
        this.clouds.forEach(({ cloud, v }) => {
            cloud.x -= v;
            if (cloud.x < -180) cloud.x = GAME_WIDTH + 180 + Math.random() * 200;
        });
    }
}

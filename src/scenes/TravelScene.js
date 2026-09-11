import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';

export class TravelScene extends Phaser.Scene {
    constructor() { super('TravelScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#16324a');
        this.buildMap();

        this.plane = this.add.image(SD.x, SD.y, 'airliner').setScale(0.6).setDepth(6);
        this.legIndex = 0;

        this.time.delayedCall(700, () => this.flyLeg());
    }

    /**
     * Two dots joined by a straight white line is not a map. This one has an
     * ocean, a coastline, state lines, the two cities marked and labelled, and a
     * dotted great-circle arc between them for the plane to actually follow.
     */
    buildMap() {
        // Ocean, and a grid of meridians over it.
        this.add.rectangle(400, 300, GAME_WIDTH, GAME_HEIGHT, 0x16324a);
        for (let x = 0; x < GAME_WIDTH; x += 64) {
            this.add.rectangle(x, 300, 1, GAME_HEIGHT, 0x1f4260);
        }
        for (let y = 0; y < GAME_HEIGHT; y += 64) {
            this.add.rectangle(400, y, GAME_WIDTH, 1, 0x1f4260);
        }

        // The landmass: a slab with a ragged coast down each side, so it reads as
        // a country rather than a rectangle.
        const land = this.add.graphics();
        land.fillStyle(0x3d5c3a, 1);
        land.fillRect(120, 130, 570, 350);
        land.fillStyle(0x4a6d44, 1);
        land.fillRect(126, 136, 558, 338);
        this.add.rectangle(405, 140, 560, 8, 0x5c8152); // the northern border
        for (let i = 0; i < 26; i++) { // west coast, chewed
            const cy = 132 + i * 14;
            this.add.rectangle(120 + (i % 3) * 6, cy, 14, 14, 0x4a6d44);
            this.add.rectangle(112 + (i % 4) * 5, cy, 8, 10, 0x2d4f66);
        }
        for (let i = 0; i < 26; i++) { // east coast
            const cy = 132 + i * 14;
            this.add.rectangle(688 - (i % 4) * 7, cy, 14, 14, 0x4a6d44);
            this.add.rectangle(698 - (i % 3) * 6, cy, 8, 10, 0x2d4f66);
        }
        // A gulf taken out of the bottom.
        this.add.rectangle(470, 470, 210, 60, 0x2d4f66);
        this.add.rectangle(470, 446, 180, 20, 0x2d4f66);

        // Faint state lines.
        const lines = this.add.graphics();
        lines.lineStyle(1, 0x6f8f66, 0.45);
        [200, 280, 360, 440, 520, 600].forEach(x => {
            lines.beginPath(); lines.moveTo(x, 140); lines.lineTo(x, 430); lines.strokePath();
        });
        [220, 300, 380].forEach(y => {
            lines.beginPath(); lines.moveTo(126, y); lines.lineTo(684, y); lines.strokePath();
        });

        // The route, dotted along a curve rather than ruled straight.
        this.route = new Phaser.Curves.QuadraticBezier(
            new Phaser.Math.Vector2(SD.x, SD.y),
            new Phaser.Math.Vector2(400, 120),
            new Phaser.Math.Vector2(DC.x, DC.y)
        );
        for (let i = 0; i <= 46; i++) {
            const p = this.route.getPoint(i / 46);
            this.add.circle(p.x, p.y, 2, 0xffffff, 0.55);
        }

        [SD, DC].forEach(city => {
            this.add.circle(city.x, city.y, 9, city.colour, 0.25);
            this.add.circle(city.x, city.y, 5, city.colour);
            this.add.circle(city.x, city.y, 2, 0xffffff);
            this.add.text(city.x, city.y + 22, city.label, {
                fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
                backgroundColor: '#00000077', padding: { x: 5, y: 2 }
            }).setOrigin(0.5);
        });

        this.add.text(400, 44, "Three thousand miles, most weekends", {
            fontSize: '17px', color: '#dff0ff', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * One flight each way, with a line of narration when it lands. The plane
     * follows the drawn arc and turns to face the way it is going, instead of
     * sliding along a straight line facing sideways.
     */
    flyLeg() {
        const legs = [
            { back: false, line: "Mike and Yvy got to know each other more." },
            { back: true, line: "Yvy was scared at first because Mike seemed too NICE..." },
            { back: false, line: "But as time passed, she realized Mike was kind, safe, and truly genuine." }
        ];
        if (this.legIndex >= legs.length) return this.scene.start('HouseScene');
        const leg = legs[this.legIndex++];

        playSound('whoosh');
        this.tweens.addCounter({
            from: 0, to: 1, duration: 2300, ease: 'Sine.easeInOut',
            onUpdate: tween => {
                const t = tween.getValue();
                const at = this.route.getPoint(leg.back ? 1 - t : t);
                const ahead = this.route.getPoint(Phaser.Math.Clamp((leg.back ? 1 - t : t) + (leg.back ? -0.02 : 0.02), 0, 1));
                this.plane.setPosition(at.x, at.y);
                this.plane.setRotation(Phaser.Math.Angle.BetweenPoints(at, ahead));
            },
            onComplete: () => showDialogue(leg.line, () => this.flyLeg())
        });
    }
}

const SD = { x: 168, y: 352, label: 'SD', colour: 0x4fc3f7 };
const DC = { x: 636, y: 246, label: 'DC', colour: 0xef5350 };

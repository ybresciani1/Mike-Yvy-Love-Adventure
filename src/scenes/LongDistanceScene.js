import Phaser from 'phaser';
import { GAME_HEIGHT } from '../constants.js';
import { stopMusic, playRomanticTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';

const HALF = 400;

// DC is three hours ahead, so every clock on Mike's side is later than hers.
const CLOCKS = {
    day: { mike: '12:15 PM', yvy: '9:15 AM' },
    evening: { mike: '9:40 PM', yvy: '6:40 PM' },
    night: { mike: '12:30 AM', yvy: '9:30 PM' }
};

// What goes back and forth across the middle while each part of the day plays.
const TEXTS = {
    day: [
        ['yvy', 'how are the demos'], ['mike', 'walked into a wall'],
        ['yvy', 'lol'], ['mike', 'in VR. the wall was real'],
        ['yvy', 'a kid just ate a crayon'], ['mike', 'what colour']
    ],
    evening: [
        ['mike', 'out w the guys'], ['yvy', 'girls night!'],
        ['mike', 'one drink'], ['yvy', 'ok two'],
        ['mike', 'send a pic'], ['yvy', 'no :)']
    ]
};

/**
 * Three thousand miles apart, on one screen: Mike's day on the left, Yvy's on
 * the right, split down the middle. Work, then out with friends, then bed —
 * and the texts going back and forth across the line the whole time.
 *
 * Each half is three stacked containers (day, evening, night) clipped to its
 * own side by a geometry mask. Masks live in world space, which is why every
 * container sits at 0,0 and draws its contents at their real screen positions.
 */
export class LongDistanceScene extends Phaser.Scene {
    constructor() { super('LongDistanceScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#0d0d12');
        this.poses = [];
        this.sippers = [];
        this.glows = {};
        this.sleepers = {};
        this.beat = 0;
        this.texts = null;
        this.textIndex = 0;

        this.halves = {
            mike: {
                ox: 0,
                day: this.buildWeWork(0),
                evening: this.buildNightOut(0, 'mike'),
                night: this.buildBedroom(0, 'mike')
            },
            yvy: {
                ox: HALF,
                day: this.buildPreschool(HALF),
                evening: this.buildNightOut(HALF, 'yvy'),
                night: this.buildBedroom(HALF, 'yvy')
            }
        };
        Object.values(this.halves).forEach(h => {
            const mask = this.maskFor(h.ox);
            ['day', 'evening', 'night'].forEach(phase => {
                h[phase].setMask(mask).setAlpha(phase === 'day' ? 1 : 0);
            });
            // Nightfall is laid over the top of a half: a flush of sunset for San
            // Diego, which gets there later, and a wash of dark for both.
            h.sunset = this.add.rectangle(h.ox + HALF / 2, GAME_HEIGHT / 2, HALF, GAME_HEIGHT, 0xff8a3d, 0).setDepth(50);
            h.dusk = this.add.rectangle(h.ox + HALF / 2, GAME_HEIGHT / 2, HALF, GAME_HEIGHT, 0x0a0d24, 0).setDepth(51);
        });

        this.buildFrame();
        this.setClock('mike', 'day');
        this.setClock('yvy', 'day');

        this.time.addEvent({ delay: 200, loop: true, callback: () => this.onBeat() });
        this.textTimer = this.time.addEvent({ delay: 2400, loop: true, callback: () => this.nextText() });
        this.texts = TEXTS.day;

        stopMusic();
        playRomanticTheme();
        this.time.delayedCall(900, () => this.theDays());
    }

    // --- building blocks ------------------------------------------------------

    maskFor(ox) {
        const shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.fillRect(ox, 0, HALF, GAME_HEIGHT);
        return shape.createGeometryMask();
    }

    rect(c, x, y, w, h, color, alpha = 1) {
        const r = this.add.rectangle(x, y, w, h, color, alpha);
        c.add(r);
        return r;
    }

    img(c, x, y, key, scale = 1) {
        const i = this.add.image(x, y, key).setScale(scale);
        c.add(i);
        return i;
    }

    spr(c, x, y, key, scale = 2) {
        const s = this.add.sprite(x, y, key).setScale(scale);
        c.add(s);
        return s;
    }

    label(c, x, y, text, style) {
        const t = this.add.text(x, y, text, style).setOrigin(0.5);
        c.add(t);
        return t;
    }

    /** The line down the middle, and a place and a time over each half. */
    buildFrame() {
        this.add.rectangle(HALF, GAME_HEIGHT / 2, 8, GAME_HEIGHT, 0x0d0d12).setDepth(60);
        this.add.rectangle(HALF - 5, GAME_HEIGHT / 2, 1, GAME_HEIGHT, 0xf4f0e8, 0.4).setDepth(60);
        this.add.rectangle(HALF + 5, GAME_HEIGHT / 2, 1, GAME_HEIGHT, 0xf4f0e8, 0.4).setDepth(60);
        this.clocks = {};
        [['mike', 0, 'WASHINGTON, DC'], ['yvy', HALF, 'SAN DIEGO']].forEach(([who, ox, place]) => {
            this.add.rectangle(ox + HALF / 2, 22, 200, 34, 0x000000, 0.6).setDepth(61);
            this.add.text(ox + HALF / 2, 14, place, {
                fontSize: '12px', color: '#f4f0e8', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(62);
            this.clocks[who] = this.add.text(ox + HALF / 2, 30, '', {
                fontSize: '11px', color: '#9fd6f0'
            }).setOrigin(0.5).setDepth(62);
        });
    }

    setClock(who, phase) {
        this.clocks[who].setText(CLOCKS[phase][who]);
    }

    // --- Mike's day: WeWork, DC ---------------------------------------------

    buildWeWork(ox) {
        const c = this.add.container(0, 0);
        const X = x => ox + x;
        this.rect(c, X(200), 20, HALF, 40, 0x1c1c1f); // ceiling
        this.rect(c, X(200), 140, HALF, 200, 0x2d2d31); // the black wall they all have

        // Glazing onto a DC afternoon, with the Monument in it.
        this.rect(c, X(200), 126, 340, 108, 0x9cc8e6);
        this.rect(c, X(200), 158, 340, 44, 0xc6dde8);
        [[60, 26], [96, 18], [250, 30], [300, 22], [340, 16]].forEach(([rx, h]) => {
            this.rect(c, X(rx), 179 - h / 2, 34, h, 0x8a9aa6);
        });
        this.rect(c, X(150), 142, 7, 70, 0xece8de);
        this.rect(c, X(150), 105, 5, 4, 0xece8de);
        this.rect(c, X(150), 102, 3, 3, 0xece8de);
        [30, 144, 256, 370].forEach(mx => this.rect(c, X(mx), 126, 4, 108, 0x1c1c1f));
        this.rect(c, X(200), 72, 340, 4, 0x1c1c1f);
        this.rect(c, X(200), 180, 340, 4, 0x1c1c1f);

        this.rect(c, X(200), 52, 128, 24, 0x0c0c0e); // the sign
        this.label(c, X(200), 52, 'WeWork', { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' });

        // Oak floor, black skirting, the obligatory plants.
        this.rect(c, X(200), 420, HALF, 360, 0xc9a97a);
        for (let y = 252; y < GAME_HEIGHT; y += 22) this.rect(c, X(200), y, HALF, 1, 0xb08f62);
        this.rect(c, X(200), 241, HALF, 3, 0x1c1c1f);
        this.img(c, X(26), 216, 'pothos', 1.4);
        this.img(c, X(376), 214, 'plant_snake', 1.4);

        // Colleagues, heads down at hot desks.
        this.spr(c, X(84), 262, 'civilian').setTint(0xb8c8d8);
        this.img(c, X(84), 292, 'cowork_desk', 1.8);
        this.spr(c, X(318), 262, 'civilian_f').setTint(0xd8c0b0);
        this.img(c, X(318), 292, 'cowork_desk', 1.8).setFlipX(true);

        // Mike on the demo mat, in the headset, looking round a room nobody
        // else can see.
        this.rect(c, X(200), 424, 150, 70, 0x3a3f4a, 0.55);
        this.rect(c, X(200), 390, 150, 2, 0x5dade2, 0.8);
        const mike = this.spr(c, X(200), 400, 'mike_casual');
        const headset = this.img(c, X(200), 388, 'vr_headset', 1);
        const hologram = this.rect(c, X(200), 318, 26, 26, 0x5dade2, 0.12).setStrokeStyle(2, 0x5dade2, 0.9);
        const inner = this.rect(c, X(200), 318, 12, 12, 0x9fd6f0, 0.2).setStrokeStyle(1, 0x9fd6f0, 0.8);
        this.tweens.add({ targets: inner, angle: -360, duration: 2600, repeat: -1 });
        this.tweens.add({ targets: hologram, angle: 360, duration: 4000, repeat: -1 });
        this.tweens.add({ targets: [hologram, inner], y: '-=6', duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.time.addEvent({
            delay: 1100, loop: true, callback: () => {
                const flip = !mike.flipX;
                mike.setFlipX(flip);
                headset.setFlipX(flip);
            }
        });
        this.tweens.add({
            targets: [mike, headset], y: '-=3', duration: 700,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        return c;
    }

    // --- Yvy's day: St. David's, San Diego -----------------------------------

    buildPreschool(ox) {
        const c = this.add.container(0, 0);
        const X = x => ox + x;
        this.rect(c, X(200), 125, HALF, 250, 0xf6ecd6);
        this.rect(c, X(200), 244, HALF, 8, 0xd9b77a); // chair rail

        // Window: Southern California doing its thing.
        this.rect(c, X(304), 140, 132, 100, 0xffffff);
        this.rect(c, X(304), 140, 120, 88, 0xa8dcf2);
        this.rect(c, X(304), 172, 120, 24, 0x8fcf8a);
        c.add(this.add.circle(X(334), 116, 12, 0xfff3b0));
        this.rect(c, X(304), 140, 3, 88, 0xffffff);

        this.img(c, X(120), 60, 'alphabet_banner', 1.6);
        this.rect(c, X(120), 98, 160, 26, 0x2f5fa8);
        this.label(c, X(120), 98, "St. David's", { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' });

        // Paintings, taped up at the height of the people who painted them.
        [[40, 0xe74c3c], [78, 0x3498db], [160, 0x2ecc71], [198, 0xf39c12]].forEach(([px, col]) => {
            this.rect(c, X(px), 150, 28, 22, 0xfdfefe);
            this.rect(c, X(px), 150, 16, 10, col);
            this.rect(c, X(px), 139, 8, 3, 0xf4e6a0, 0.9);
        });
        this.img(c, X(60), 212, 'cubby_shelf', 1.5);

        // Carpet, the circle-time rug, a table of crayons.
        this.rect(c, X(200), 425, HALF, 350, 0x8cc2b4);
        this.img(c, X(190), 410, 'kid_rug', 2.6);
        this.img(c, X(330), 324, 'kid_table', 1.7);
        this.img(c, X(46), 470, 'toy_blocks', 1.4);
        this.img(c, X(360), 462, 'toy_dino', 1.4);

        const yvy = this.spr(c, X(190), 352, 'yvy');
        this.tweens.add({
            targets: yvy, angle: { from: -4, to: 4 }, duration: 800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        [
            [130, 420, 0xffffff], [190, 440, 0xffe6cc], [250, 420, 0xd9ecff],
            [104, 384, 0xffd9e6], [304, 298, 0xe6ffd9], [356, 298, 0xfff0c0]
        ].forEach(([kx, ky, tint], i) => {
            const kid = this.spr(c, X(kx), ky, 'aiden', 1.5).setTint(tint);
            this.tweens.add({
                targets: kid, y: ky - 7, duration: 260 + i * 40, hold: 300 + i * 90,
                yoyo: true, repeat: -1, delay: i * 130, ease: 'Sine.easeOut'
            });
        });

        // And the one who will not sit down.
        const runner = this.spr(c, X(60), 476, 'aiden', 1.5).setTint(0xffe0f0);
        this.tweens.add({
            targets: runner, x: X(340), duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            onYoyo: () => runner.setFlipX(true),
            onRepeat: () => runner.setFlipX(false)
        });
        return c;
    }

    // --- evenings: out with friends ------------------------------------------

    buildNightOut(ox, who) {
        const c = this.add.container(0, 0);
        const X = x => ox + x;
        const isMike = who === 'mike';
        this.rect(c, X(200), 130, HALF, 260, isMike ? 0x191331 : 0x2a1230);

        // Backbar: shelves of bottles lit from underneath.
        this.rect(c, X(200), 156, 320, 70, 0x120d20);
        [134, 166].forEach(sy => {
            this.rect(c, X(200), sy + 12, 320, 3, 0x6b4a2e);
            for (let bx = 50; bx < 350; bx += 14) {
                const col = [0x7fb3d5, 0xe59866, 0x82e0aa, 0xf7dc6f, 0xbb8fce][(bx + sy) % 5];
                this.rect(c, X(bx), sy, 6, 18, col, 0.85);
            }
        });
        this.rect(c, X(200), 196, 320, 3, isMike ? 0x00e5ff : 0xff4fd8); // neon strip
        this.rect(c, X(200), 228, HALF, 30, 0x3a2418); // the bar
        this.rect(c, X(200), 213, HALF, 4, 0x6b4a2e);
        for (let x = 32; x < HALF; x += 64) this.img(c, X(x), 84, 'string_lights');
        const ball = this.img(c, X(200), 60, 'disco_ball', 1.3);
        this.tweens.add({ targets: ball, angle: 360, duration: 6000, repeat: -1 });

        // Dance floor, with tiles that light up under people.
        for (let tx = 16; tx < HALF; tx += 32) {
            for (let ty = 260; ty < GAME_HEIGHT + 16; ty += 32) {
                this.img(c, X(tx), ty, 'dance_floor_tile').setTint(isMike ? 0x5a5a88 : 0x6e4e80);
            }
        }
        const glows = [];
        for (let i = 0; i < 14; i++) {
            glows.push(this.rect(c, X(16 + ((i * 7) % 12) * 32), 260 + ((i * 5) % 7) * 32, 30, 30,
                [0xff4fd8, 0x00e5ff, 0xf7dc6f, 0x82e0aa][i % 4], 0));
        }
        this.time.addEvent({
            delay: 320, loop: true, callback: () => {
                const tile = glows[Math.floor(Math.random() * glows.length)];
                tile.setAlpha(0.45);
                this.tweens.add({ targets: tile, alpha: 0, duration: 600 });
            }
        });

        // Two beams sweeping the floor. Origin pinned to the apex, since a
        // triangle otherwise centres its bounding box on x/y and swings from there.
        [[70, 0xff4fd8], [330, 0x00e5ff]].forEach(([bx, col], i) => {
            const beam = this.add.triangle(X(bx), 60, 0, 0, -50, 380, 50, 380, col, 0.1).setOrigin(0, 0);
            c.add(beam);
            this.tweens.add({
                targets: beam, angle: { from: i ? 18 : -18, to: i ? -18 : 18 },
                duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        });

        const frames = isMike
            ? ['mike_dance_1', 'mike_dance_2', 'mike_dance_3', 'mike_dance_4']
            : ['yvy_dance_1', 'yvy_dance_2', 'yvy_dance_3', 'yvy_dance_4'];
        const FRIENDS = isMike
            ? [['civilian', 110, 330, 0xb8d0e0], ['civilian', 292, 336, 0xd8c8a8], ['civilian_f', 150, 410, 0xe0c0d0]]
            : [['civilian_f', 110, 330, 0xf0c8d8], ['civilian_f', 292, 336, 0xd0e0f0], ['civilian', 250, 410, 0xe0d8b8]];
        FRIENDS.forEach(([key, fx, fy, tint], i) => {
            const friend = this.spr(c, X(fx), fy, key).setTint(tint);
            this.tweens.add({
                targets: friend, y: fy - 8, duration: 200 + i * 30,
                yoyo: true, repeat: -1, delay: i * 90, ease: 'Sine.easeOut'
            });
            this.tweens.add({ targets: friend, angle: { from: -8, to: 8 }, duration: 420 + i * 60, yoyo: true, repeat: -1 });
        });

        const dancer = this.spr(c, X(200), 350, frames[0]);
        this.poses.push({ sprite: dancer, frames });
        // A tad bit of drinking: one glass, the odd sip.
        const drink = this.img(c, X(228), 354, isMike ? 'beer' : 'margarita', 0.9);
        this.sippers.push({ drink, homeY: 354 });
        return c;
    }

    // --- nights: bed ----------------------------------------------------------

    buildBedroom(ox, who) {
        const c = this.add.container(0, 0);
        const X = x => ox + x;
        const isMike = who === 'mike';
        this.rect(c, X(200), 130, HALF, 260, isMike ? 0x151b36 : 0x1d1a38);
        this.rect(c, X(200), 430, HALF, 340, isMike ? 0x2a2438 : 0x2e2536);
        for (let y = 272; y < GAME_HEIGHT; y += 26) this.rect(c, X(200), y, HALF, 1, 0x221d2e);

        this.rect(c, X(300), 124, 128, 104, 0x3a3f58); // window, moon, a few stars
        this.rect(c, X(300), 124, 116, 92, 0x0b1026);
        this.img(c, X(322), 110, 'moon', 0.7);
        [[258, 92], [276, 146], [350, 156], [248, 126], [290, 100]].forEach(([sx, sy]) => {
            this.rect(c, X(sx), sy, 2, 2, 0xfdfbe6);
        });
        this.rect(c, X(300), 124, 3, 92, 0x3a3f58);
        this.img(c, X(90), 150, isMike ? 'poster' : 'wall_art', 1).setTint(0x8890b8);

        // The bed, and whoever is in it.
        this.img(c, X(160), 390, 'bed_teal', 1.7).setTint(0x8f98c0);
        const sleeper = this.spr(c, X(160), 334, isMike ? 'mike_casual' : 'yvy', 1.6).setTint(0x9aa2c8);
        this.rect(c, X(160), 408, 100, 128, isMike ? 0x2f5f86 : 0x7a4f86); // duvet
        this.rect(c, X(160), 346, 100, 6, isMike ? 0x3d77a6 : 0x9463a3); // its turned-down edge
        [380, 412, 440].forEach((fy, i) => this.rect(c, X(150 + i * 8), fy, 70 - i * 14, 2, isMike ? 0x274f70 : 0x654070)); // folds
        this.rect(c, X(208), 408, 4, 128, isMike ? 0x244a68 : 0x5c3a66); // the side falling away
        this.sleepers[who] = sleeper;

        // Nightstand, phone, and the phone's glow.
        this.img(c, X(262), 330, 'nightstand', 1.7).setTint(0x8f98c0);
        this.img(c, X(262), 314, 'cellphone', 0.9);
        const glow = this.add.circle(X(262), 312, 34, 0x9fd6f0, 0.28);
        c.add(glow);
        this.tweens.add({ targets: glow, alpha: 0.12, duration: 900, yoyo: true, repeat: -1 });
        this.glows[who] = glow;
        return c;
    }

    // --- what moves -----------------------------------------------------------

    onBeat() {
        this.beat++;
        this.poses.forEach(p => p.sprite.setTexture(p.frames[this.beat % p.frames.length]));
        if (this.beat % 13 === 0) {
            this.sippers.forEach(({ drink, homeY }, i) => this.tweens.add({
                targets: drink, angle: -35, y: homeY - 8, duration: 240,
                delay: i * 400, hold: 260, yoyo: true, ease: 'Sine.easeOut'
            }));
        }
    }

    nextText() {
        if (!this.texts) return;
        const [from, words] = this.texts[this.textIndex % this.texts.length];
        this.bubble(from, words, this.textIndex++);
    }

    /** A text leaving one half and arriving in the other. */
    bubble(from, words, slot = 0) {
        const mikeSent = from === 'mike';
        const fromX = mikeSent ? 290 : 510;
        const toX = mikeSent ? 510 : 290;
        const y = 64 + (slot % 3) * 24;
        const colour = mikeSent ? 0x9fd6f0 : 0xf8c8dc;
        const text = this.add.text(0, 0, words, { fontSize: '10px', color: '#1b1d24' }).setOrigin(0.5);
        const w = text.width + 14;
        const bubble = this.add.container(fromX, y, [
            this.add.rectangle(0, 0, w, 18, colour),
            this.add.rectangle(mikeSent ? -w / 2 + 4 : w / 2 - 4, 9, 6, 5, colour),
            text
        ]).setDepth(63).setAlpha(0);
        this.tweens.add({ targets: bubble, alpha: 1, duration: 200 });
        this.tweens.add({
            targets: bubble, x: toX, duration: 1500, ease: 'Sine.easeInOut',
            onComplete: () => this.tweens.add({
                targets: bubble, alpha: 0, y: y - 10, duration: 350, delay: 250,
                onComplete: () => bubble.destroy()
            })
        });
    }

    // --- the story ------------------------------------------------------------

    /** Dialogue fired from a timer has to survive a box that is already open. */
    saySoon(text, next) {
        if (!showDialogue(text, next)) this.time.delayedCall(350, () => this.saySoon(text, next));
    }

    /** Lines in order; an entry may be { text, before } to do something first. */
    narrate(lines, done) {
        let i = 0;
        const next = () => {
            if (i >= lines.length) return done();
            const line = lines[i++];
            if (typeof line === 'string') return this.saySoon(line, next);
            line.before();
            this.saySoon(line.text, next);
        };
        next();
    }

    theDays() {
        this.narrate([
            "Mike flew home. Three thousand miles and three time zones between them.",
            "Despite the distance, they kept texting — and kept living their separate lives.",
            "In DC, Mike went back to work at WeWork, running VR demos with a headset strapped to his face.",
            "In San Diego, Yvy went back to St. David's, and a room full of preschoolers."
        ], () => this.nightfall('evening', () => this.narrate([
            "When the day got dark, they clocked out and went out with their friends.",
            "A little dancing. A tad bit of drinking."
        ], () => this.nightfall('night', () => this.theGoodnights()))));
    }

    /**
     * Each half goes dark in turn. DC is three hours ahead, so Mike's side gets
     * there first and San Diego catches it up.
     */
    nightfall(to, done) {
        const from = to === 'evening' ? 'day' : 'evening';
        this.texts = null;
        const fall = (who, delay, then) => {
            const h = this.halves[who];
            const sunsetFirst = who === 'yvy' && to === 'evening';
            if (sunsetFirst) {
                this.tweens.add({ targets: h.sunset, alpha: 0.35, duration: 900, delay, hold: 500, yoyo: true });
            }
            this.tweens.add({
                targets: h.dusk, alpha: 0.85, duration: 1100, delay: delay + (sunsetFirst ? 900 : 0),
                onComplete: () => {
                    h[from].setAlpha(0);
                    h[to].setAlpha(1);
                    this.setClock(who, to);
                    this.tweens.add({ targets: h.dusk, alpha: 0, duration: 800, onComplete: then });
                }
            });
        };
        fall('mike', 0);
        fall('yvy', 1600, () => {
            this.texts = TEXTS[to] || null;
            done();
        });
    }

    theGoodnights() {
        this.textTimer.paused = true;
        this.narrate([
            "And the last text of every night went to the other side of the country.",
            { before: () => this.bubble('mike', 'goodnight', 1), text: "Mike: 'Goodnight.'" },
            { before: () => this.bubble('yvy', 'goodnight, mike <3', 2), text: "Yvy: 'Goodnight, Mike.'" }
        ], () => this.lightsOut());
    }

    lightsOut() {
        // His phone goes dark first; it is half past midnight in DC.
        ['mike', 'yvy'].forEach((who, i) => {
            this.time.delayedCall(i * 1400, () => {
                const glow = this.glows[who];
                this.tweens.killTweensOf(glow);
                this.tweens.add({ targets: glow, alpha: 0, duration: 700 });
                this.snore(who);
            });
        });
        this.time.delayedCall(3200, () => this.narrate(
            ["Until one day, Mike decided to go back and visit."],
            () => {
                this.cameras.main.fadeOut(1400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    stopMusic();
                    this.scene.start('DowntownScene');
                });
            }
        ));
    }

    snore(who) {
        const s = this.sleepers[who];
        this.time.addEvent({
            delay: 900, loop: true, callback: () => {
                const z = this.add.text(s.x + 22, s.y - 18, 'z', { fontSize: '14px', color: '#dfe8ff' })
                    .setDepth(40).setAlpha(0.9);
                this.tweens.add({
                    targets: z, x: z.x + 16, y: z.y - 34, alpha: 0, scale: 1.6,
                    duration: 1600, onComplete: () => z.destroy()
                });
            }
        });
    }
}

import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

// Park Road: the steep paved hill from the beach lot up to the mesa, as a line
// from its foot to its top, and how far either side of that line he can walk.
const ROAD = [250, 560, 780, 130];
const ROAD_HALF_WIDTH = 34;

// The Beach Trail across the mesa, from the trailhead sign to the steps down.
const TRAIL = [[60, 600], [150, 505], [300, 462], [460, 470], [600, 425], [720, 390]];

// The rocks on the beach he can jump onto and off again.
const ROCKS = [[330, 430], [440, 500], [560, 450], [680, 520], [300, 560]];

/**
 * Torrey Pines, the morning after Cafe Secret, in three parts that are three
 * containers in one scene:
 *   the road  — up Torrey Pines Park Road from the beach lot, the steep paved
 *               hill everybody walks or runs up to reach the reserve;
 *   the mesa  — the old adobe lodge, twisted Torrey pines, and the Beach Trail
 *               past the overlook, where they take a picture;
 *   the beach — down the steps to sand full of rocks and pebbles, which they
 *               jump on and off on the way to Flat Rock, and a picture there.
 * They hike fast, so Mike walks faster here than anywhere else.
 */
export class TorreyPinesScene extends Phaser.Scene {
    constructor() { super('TorreyPinesScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#b8d8ee');
        this.stage = 'road';
        this.zones = [];
        this.walkers = [];
        this.busy = true;
        this.yvyFollow = true;
        this.hopping = false;
        this.reservePhoto = false;

        this.road = this.add.container(0, 0);
        this.buildRoad(this.road);
        this.reserve = this.add.container(0, 0).setVisible(false);
        this.buildReserve(this.reserve);
        this.beach = this.add.container(0, 0).setVisible(false);
        this.buildBeach(this.beach);

        this.player = new Player(this, 60, 560);
        this.player.setTexture('mike_hike').setDepth(20);
        this.player.speed = 210; // hiking fast
        this.bottle = this.add.image(0, 0, 'water_bottle').setDepth(21);
        // A plain sprite, so she can be put wherever the story needs her.
        this.yvy = this.add.sprite(92, 560, 'yvy_hike').setDepth(20);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.buildSolids();
        this.buildRoadTalk();
        this.buildReserveTalk();
        this.buildBeachTalk();
        this.setStage('road');

        this.instructionText = this.add.text(20, 574, '', {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(40);

        stopMusic();
        playLeFestinTheme();
        // Nothing starts until the opening lines have been read.
        this.time.delayedCall(700, () => this.narrate([
            "The next morning, Mike and Yvy met at the bottom of Torrey Pines Park Road: the steep paved hill up from the beach that everyone walks, or runs, to reach the trails at the top.",
            "Yvy: 'Ready? We're going fast.'",
            "Mike: 'I brought water. And snacks. And more water.'"
        ], () => {
            this.busy = false;
            this.instructionText.setText(`Hike up Park Road to the reserve (${actionLabel()})`);
        }));
    }

    // --- helpers ----------------------------------------------------------------

    R(c, x, y, w, h, color, alpha = 1) {
        const r = this.add.rectangle(x, y, w, h, color, alpha);
        c.add(r);
        return r;
    }

    I(c, x, y, key, scale = 1) {
        const i = this.add.image(x, y, key).setScale(scale);
        c.add(i);
        return i;
    }

    zone(x, y, w, h, when, act) {
        const z = this.add.rectangle(x, y, w, h, 0xffff00, 0);
        this.physics.add.existing(z, true);
        this.physics.add.overlap(this.player, z, () => {
            if (when() && !this.busy && !this.hopping && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) act();
        });
        this.zones.push({ z, when });
        return z;
    }

    /** Dialogue fired from a timer has to survive a box that is already open. */
    saySoon(text, next) {
        if (!showDialogue(text, next)) this.time.delayedCall(350, () => this.saySoon(text, next));
    }

    narrate(lines, done) {
        let i = 0;
        const next = () => (i >= lines.length ? done() : this.saySoon(lines[i++], next));
        next();
    }

    /** A conversation the first time, and one line after that. */
    chat(lines, again) {
        let told = false;
        return () => {
            if (told) return showDialogue(again);
            told = true;
            this.narrate(lines, () => {});
        };
    }

    /** A point along Park Road, `t` of the way up, `off` to the side of its centre line. */
    roadPoint(t, off = 0) {
        const [ax, ay, bx, by] = ROAD;
        const len = Math.hypot(bx - ax, by - ay);
        const nx = -(by - ay) / len, ny = (bx - ax) / len;
        return [ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off];
    }

    /** Somebody walking back and forth between two points; talked to by distance. */
    walker(c, stage, from, to, key, tint, duration, line, again) {
        const w = this.add.sprite(from[0], from[1], key).setTint(tint).setFlipX(to[0] < from[0]);
        c.add(w);
        this.tweens.add({
            targets: w, x: to[0], y: to[1], duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            onYoyo: () => w.setFlipX(!w.flipX), onRepeat: () => w.setFlipX(!w.flipX)
        });
        this.walkers.push({ sprite: w, stage, talk: this.chat([line], again) });
        return w;
    }

    /** A gull crossing the sky now and then. */
    gulls(c, y) {
        const gull = this.add.image(-20, y, 'seagull');
        c.add(gull);
        this.tweens.add({
            targets: gull, x: GAME_WIDTH + 20, y: y - 30, duration: 9000, repeat: -1, repeatDelay: 2500,
            onRepeat: () => { gull.y = y; }
        });
        this.tweens.add({ targets: gull, scaleY: 0.6, duration: 260, yoyo: true, repeat: -1 });
    }

    /** Sky, ocean and a strip of beach, the backdrop of the road and the mesa. */
    skyAndSea(c, oceanLeft, oceanTop, oceanBottom) {
        [[0xa8d0ea, 0, 60], [0xb8d8ee, 60, 50], [0xcce2f2, 110, 50]].forEach(([col, top, h]) => this.R(c, 400, top + h / 2, GAME_WIDTH, h, col));
        [[140, 50, 1.1], [470, 30, 0.9], [700, 70, 1]].forEach(([x, y, s]) => this.I(c, x, y, 'cloud', s).setAlpha(0.9));
        const w = GAME_WIDTH - oceanLeft;
        this.R(c, oceanLeft + w / 2, (oceanTop + oceanBottom) / 2, w, oceanBottom - oceanTop, 0x3f84b4);
        this.R(c, oceanLeft + w / 2, oceanTop + 10, w, 20, 0x7aaed0);
        this.R(c, oceanLeft + w / 2, oceanTop + 30, w, 20, 0x5a9ac4);
    }

    // --- the road up -------------------------------------------------------------------

    buildRoad(c) {
        this.skyAndSea(c, 0, 110, 292);
        for (let i = 0; i < 8; i++) { // surf along the beach below
            const foam = this.R(c, 40 + i * 100, 284, 60, 3, 0xf2f8fa, 0.8);
            this.tweens.add({ targets: foam, alpha: 0.2, x: foam.x - 12, duration: 1500 + i * 120, yoyo: true, repeat: -1 });
        }
        this.R(c, 400, 312, GAME_WIDTH, 44, 0xe6d2a6); // the beach
        for (let i = 0; i < 16; i++) this.I(c, (i * 53 + i * i * 7) % 800, 300 + (i * 11) % 28, 'pebbles', 0.8);

        // The hillside the road climbs, and the scrub on it.
        const g = this.add.graphics();
        c.add(g);
        g.fillStyle(0x6a8a52, 1);
        g.fillPoints([{ x: 0, y: 334 }, { x: 420, y: 334 }, { x: 800, y: 60 }, { x: 800, y: 600 }, { x: 0, y: 600 }], true);
        g.fillStyle(0x5a7a48, 1);
        for (let i = 0; i < 80; i++) {
            const x = (i * 113 + i * i * 7) % 800, y = 120 + (i * 67 + i * i * 3) % 480;
            if (y > 340 || (x > 420 && y > 334 - (x - 420) * 0.72 + 8)) g.fillCircle(x, y, 3 + (i % 3));
        }

        // The south beach lot at the foot of the hill.
        this.R(c, 150, 540, 300, 120, 0x4a4a50);
        for (let x = 0; x <= 264; x += 44) this.R(c, x, 500, 2, 40, 0xf2f2f2);
        // Parked clear of the sign, so there is room to stand in front of it.
        [[110, 0x9ab0c8], [198, 0xc84a3a]].forEach(([x, tint]) => this.I(c, x + 22, 500, 'uber_car', 0.8).setTint(tint));
        this.I(c, 40, 460, 'trail_sign');
        c.add(this.add.text(40, 452, 'STATE BEACH', { fontSize: '6px', color: '#f2e6c8', fontStyle: 'bold' }).setOrigin(0.5));

        // Sandstone cut into by the road on its uphill side.
        [0.28, 0.46, 0.64, 0.82].forEach((t, i) => {
            const [x, y] = this.roadPoint(t, 86);
            this.I(c, x, y, 'sandstone_bluff', 0.9).setFlipX(i % 2 === 1);
        });

        // The road: asphalt, pale edges, a dashed yellow line up the middle.
        const r = this.add.graphics();
        c.add(r);
        r.lineStyle(84, 0x5e5e64, 1);
        r.lineBetween(ROAD[0], ROAD[1], ROAD[2], ROAD[3]);
        r.lineStyle(3, 0xa8a8a4, 1);
        [-41, 41].forEach(off => {
            const [x0, y0] = this.roadPoint(0, off), [x1, y1] = this.roadPoint(1, off);
            r.lineBetween(x0, y0, x1, y1);
        });
        r.lineStyle(3, 0xf2c84a, 1);
        for (let t = 0.02; t < 0.98; t += 0.06) {
            const [x0, y0] = this.roadPoint(t), [x1, y1] = this.roadPoint(t + 0.025);
            r.lineBetween(x0, y0, x1, y1);
        }
        // A guardrail on the ocean side.
        r.lineStyle(2, 0xd8d8d4, 1);
        const [gx0, gy0] = this.roadPoint(0.08, -52), [gx1, gy1] = this.roadPoint(1, -52);
        r.lineBetween(gx0, gy0 - 6, gx1, gy1 - 6);
        for (let t = 0.08; t <= 1; t += 0.05) {
            const [x, y] = this.roadPoint(t, -52);
            this.R(c, x, y - 2, 3, 10, 0xc8c8c4);
        }

        [[120, 400], [230, 380], [340, 402], [430, 350], [520, 290], [600, 230], [180, 440], [560, 580], [700, 470], [760, 330]]
            .forEach(([x, y], i) => this.I(c, x, y, 'sage_bush', 1 + (i % 3) * 0.2).setFlipX(i % 2 === 1));

        // The reserve entrance at the top of the hill.
        this.I(c, 650, 150, 'trail_sign', 1.3);
        c.add(this.add.text(650, 134, 'TORREY PINES\nSTATE NATURAL\nRESERVE', {
            fontSize: '5px', color: '#f2e6c8', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5));
        this.gulls(c, 90);

        // Everybody else going up, or coming back down.
        const lane = (t0, t1, off) => [this.roadPoint(t0, off), this.roadPoint(t1, off)];
        [
            [0.05, 0.95, 18, 'civilian', 0xe0c8b0, 5200, "Runner: 'Third time up today. It never gets any less steep.'", "Runner: 'Fourth time!'"],
            [0.9, 0.15, -16, 'civilian_f', 0xd0d8f0, 12000, "Walker: 'Take the Beach Trail on the way down. It comes out right on the sand.'", "Walker: 'Beach Trail!'"],
            [0.2, 0.7, -4, 'civilian', 0xc8e0c8, 14000, "Hiker: 'Everybody says it's just a road. Then they walk up it.'", "Hiker: 'Just a road.'"],
            [0.6, 0.98, 10, 'civilian_f', 0xf0c8d8, 9000, "Walker: 'You're halfway! Probably.'", "Walker: 'Probably halfway.'"]
        ].forEach(([t0, t1, off, key, tint, duration, line, again]) => {
            const [from, to] = lane(t0, t1, off);
            this.walker(c, 'road', from, to, key, tint, duration, line, again);
        });
    }

    /** Keep him on the road (or in the lot at the bottom of it): it is a hill, not a path through the scrub. */
    keepOnRoad() {
        const p = this.player;
        if (p.x < 300 && p.y > 470) return;
        const [ax, ay, bx, by] = ROAD;
        const dx = bx - ax, dy = by - ay;
        const t = Phaser.Math.Clamp(((p.x - ax) * dx + (p.y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
        const cx = ax + dx * t, cy = ay + dy * t;
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d > ROAD_HALF_WIDTH) {
            p.body.reset(cx + (p.x - cx) / d * ROAD_HALF_WIDTH, cy + (p.y - cy) / d * ROAD_HALF_WIDTH);
        }
    }

    // --- the mesa ------------------------------------------------------------------------

    buildReserve(c) {
        this.skyAndSea(c, 380, 160, 330);
        const g = this.add.graphics();
        c.add(g);
        g.fillStyle(0x8898a6, 1);
        g.fillTriangle(600, 162, 760, 146, 820, 162); // La Jolla, far down the coast
        for (let i = 0; i < 7; i++) { // surf along the foot of the bluffs
            const foam = this.R(c, 420 + i * 60, 312 - i * 4, 44, 3, 0xf2f8fa, 0.8);
            this.tweens.add({ targets: foam, alpha: 0.2, x: foam.x - 10, duration: 1400 + i * 110, yoyo: true, repeat: -1 });
        }

        // The green hillside of coastal sage.
        g.fillStyle(0x6a8a52, 1);
        g.fillPoints([{ x: 0, y: 150 }, { x: 390, y: 170 }, { x: 400, y: 330 }, { x: 800, y: 330 }, { x: 800, y: 600 }, { x: 0, y: 600 }], true);
        const onHill = (x, y) => !(x > 380 && y < 340);
        g.fillStyle(0x5a7a48, 1);
        for (let i = 0; i < 90; i++) {
            const x = (i * 113 + i * i * 7) % 800, y = 180 + (i * 67 + i * i * 3) % 420;
            if (onHill(x, y)) g.fillCircle(x, y, 3 + (i % 3));
        }
        g.fillStyle(0x8aa070, 1);
        for (let i = 0; i < 50; i++) {
            const x = (i * 157 + i * i * 11 + 40) % 800, y = 200 + (i * 53 + i * i * 5) % 400;
            if (onHill(x, y)) g.fillCircle(x, y, 2);
        }

        // Sandstone along the edge of the bluffs, and a fence along the top.
        [[440, 330, 1.1, false], [580, 336, 1.2, true], [720, 330, 1.1, false]]
            .forEach(([x, y, s, flip]) => this.I(c, x, y, 'sandstone_bluff', s).setFlipX(flip));
        for (let x = 400; x < 690; x += 32) this.I(c, x, 350, 'post_fence');

        // The trail, sandy, winding down to the steps.
        const path = this.add.graphics();
        c.add(path);
        path.lineStyle(26, 0xd8c098, 1);
        for (let i = 1; i < TRAIL.length; i++) path.lineBetween(TRAIL[i - 1][0], TRAIL[i - 1][1], TRAIL[i][0], TRAIL[i][1]);
        path.fillStyle(0xd8c098, 1);
        TRAIL.forEach(([x, y]) => path.fillCircle(x, y, 13));
        for (let i = 0; i < 6; i++) this.R(c, 712 + i * 12, 352 + i * 11, 30, 5, 0x7a5a3a); // the wooden steps down

        // The lodge, the pines, the scrub, the sign, the bench at the overlook.
        this.I(c, 220, 205, 'adobe_lodge');
        [[40, 460], [220, 560], [340, 540], [520, 540], [680, 520], [760, 460], [250, 390], [300, 390], [420, 400],
         [120, 300], [320, 290], [640, 470], [100, 380], [560, 590], [760, 590]]
            .forEach(([x, y], i) => this.I(c, x, y, 'sage_bush', 1 + (i % 3) * 0.2).setFlipX(i % 2 === 1));
        this.I(c, 30, 410, 'torrey_pine', 0.8);
        this.I(c, 340, 240, 'torrey_pine', 0.9).setFlipX(true);
        this.I(c, 60, 290, 'torrey_pine', 1.2);
        this.I(c, 110, 530, 'trail_sign', 1.2);
        c.add(this.add.text(110, 516, 'BEACH TRAIL', { fontSize: '7px', color: '#f2e6c8', fontStyle: 'bold' }).setOrigin(0.5));
        this.I(c, 520, 372, 'park_bench');
        c.add(this.add.sprite(504, 356, 'civilian_sit').setTint(0xc8d8e8));
        this.gulls(c, 120);

        this.walker(c, 'reserve', [300, 455], [600, 420], 'civilian', 0xd8c0a0, 9000,
            "Hiker: 'Going down is the easy part. Save your legs for the way back up.'", "Hiker: 'Save your legs!'");
        this.walker(c, 'reserve', [150, 498], [440, 462], 'civilian_f', 0xf0d0d8, 6000,
            "Runner: 'Morning! On your left!'", "Runner: 'On your left!'");
    }

    // --- the beach -----------------------------------------------------------------------

    buildBeach(c) {
        this.R(c, 400, 60, GAME_WIDTH, 120, 0xa8d4f0);
        [[520, 40, 1], [720, 70, 0.8]].forEach(([x, y, s]) => this.I(c, x, y, 'cloud', s).setAlpha(0.9));
        this.R(c, 400, 210, GAME_WIDTH, 180, 0x3a86b8); // the ocean
        this.R(c, 400, 126, GAME_WIDTH, 12, 0x7ab4d8);
        this.R(c, 400, 250, GAME_WIDTH, 40, 0x4a96c4);
        this.R(c, 400, 318, GAME_WIDTH, 36, 0xcdb48a); // wet sand
        this.R(c, 400, 468, GAME_WIDTH, 264, 0xe6d2a6); // dry sand
        for (let i = 0; i < 70; i++) this.R(c, (i * 131 + i * i * 13) % 800, 340 + (i * 97 + i * i * 7) % 260, 2, 2, 0xcfb888);
        for (let i = 0; i < 6; i++) { // waves running up the sand and back
            const foam = this.R(c, 330 + i * 90, 300, 70, 4, 0xf6fbfd, 0.9);
            this.tweens.add({ targets: foam, y: 312, scaleX: 1.3, alpha: 0.3, duration: 1700 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // Pebbles and cobbles all through the sand, and small rocks among them.
        for (let i = 0; i < 44; i++) {
            this.I(c, 270 + (i * 67 + i * i * 5) % 530, 330 + (i * 41 + i * i * 3) % 270, 'pebbles', 0.8 + (i % 3) * 0.2).setFlipX(i % 2 === 1);
        }
        for (let i = 0; i < 14; i++) {
            this.I(c, 280 + (i * 97 + i * i * 11) % 510, 350 + (i * 59 + i * i * 7) % 240, 'beach_rock_small', 0.8 + (i % 2) * 0.3);
        }

        // The cliffs the trail came down, fluted sandstone with scrub on top.
        this.R(c, 130, 210, 260, 420, 0xd0a878);
        [[80, 90, 2, false], [210, 120, 1.8, true], [110, 330, 1.8, false], [236, 310, 1.5, true]]
            .forEach(([x, y, s, flip]) => this.I(c, x, y, 'sandstone_bluff', s).setFlipX(flip));
        for (let x = 14; x < 256; x += 18) { // gullies, stopping at the foot of the cliff
            const top = 60 + (x % 5) * 24;
            this.R(c, x, (top + 418) / 2, 2, 418 - top, 0xb88a5a, 0.5);
        }
        [[40, 12], [120, 8], [200, 14]].forEach(([x, y]) => this.I(c, x, y, 'sage_bush', 1.3));
        for (let i = 0; i < 8; i++) this.R(c, 250 + i * 5, 300 + i * 16, 26, 4, 0x7a5a3a); // the last of the steps

        // Flat Rock in the surf, the big rocks to jump on, and the people on the sand.
        this.I(c, 560, 330, 'flat_rock', 1.6);
        for (let i = 0; i < 3; i++) {
            const foam = this.R(c, 480 + i * 80, 356, 50, 3, 0xf6fbfd, 0.8);
            this.tweens.add({ targets: foam, alpha: 0.15, duration: 1200 + i * 200, yoyo: true, repeat: -1 });
        }
        ROCKS.forEach(([x, y], i) => this.I(c, x, y, 'beach_rock', 1.2).setFlipX(i % 2 === 1));
        this.I(c, 740, 570, 'beach_towel', 1.2);
        c.add(this.add.sprite(732, 554, 'civilian_f_sit').setTint(0xf0c8b0));
        this.I(c, 766, 528, 'green_umbrella', 0.8);
        c.add(this.add.sprite(760, 420, 'civilian').setTint(0xb8d0e0));
        this.I(c, 778, 418, 'surfboard');
        this.gulls(c, 90);
        this.walker(c, 'beach', [420, 590], [540, 584], 'seagull', 0xffffff, 5000,
            "A seagull walks right up to Mike and stares at his bag of snacks.", "The seagull has not given up.");
    }

    buildSolids() {
        const solid = (x, y, w, h) => {
            const b = this.add.rectangle(x, y, w, h, 0, 0);
            this.physics.add.existing(b, true);
            this.physics.add.collider(this.player, b);
            return b;
        };
        this.solids = {
            road: [
                ...[132, 220].map(x => solid(x, 500, 56, 26)), // the parked cars
                solid(40, 476, 30, 10) // the beach sign
            ],
            reserve: [
                solid(400, 80, GAME_WIDTH, 160), // the sky
                solid(590, 245, 420, 170), // the ocean below the bluffs
                solid(110, 548, 40, 10), // the trail sign
                solid(62, 342, 12, 12), // the big pine's trunk
                solid(220, 205, 140, 70), // the lodge
                solid(520, 376, 60, 12) // the bench
            ],
            beach: [
                solid(400, 150, GAME_WIDTH, 300), // the ocean
                solid(130, 210, 260, 420), // the cliffs
                solid(560, 330, 150, 40), // Flat Rock
                solid(740, 570, 50, 20) // the towel
            ]
        };
        this.rockBlocks = ROCKS.map(([x, y]) => {
            const b = solid(x, y + 2, 38, 14);
            this.solids.beach.push(b);
            return b;
        });
    }

    /** Show one of the three places, and make only its furniture solid. */
    setStage(stage) {
        this.stage = stage;
        this.road.setVisible(stage === 'road');
        this.reserve.setVisible(stage === 'reserve');
        this.beach.setVisible(stage === 'beach');
        Object.entries(this.solids).forEach(([name, blocks]) => blocks.forEach(b => { b.body.enable = name === stage; }));
    }

    // --- talking, and the things to do -------------------------------------------------

    /** On the road: the beach sign x 20-60 y 482-498 · the view x 463-513 y 341-391 · the top x 720-780 y 125-175. */
    buildRoadTalk() {
        const onRoad = () => this.stage === 'road';
        this.zone(40, 490, 40, 16, onRoad, this.chat([
            "TORREY PINES STATE BEACH. The lot at the bottom of the hill, and the road up to the reserve."
        ], "The road goes up. And up."));
        const [vx, vy] = this.roadPoint(0.45);
        this.zone(vx, vy, 50, 50, onRoad, this.chat([
            "Halfway up, the whole beach opens out below the guardrail, and the ocean goes on forever.",
            "Yvy: 'Don't stop, you'll never start again!'",
            "Mike: 'I'm not stopping. I'm admiring.'"
        ], "Yvy: 'Keep going!'"));
        this.zone(750, 150, 60, 50, onRoad, () => this.toReserve());
    }

    /**
     * On the mesa: the trail sign x 85-135 y 559-573 · the big pine x 37-87 y 352-368
     * · the lodge x 203-243 y 242-258 · the sage x 275-325 y 402-418
     * · the overlook x 485-555 y 385-399 · the steps x 710-770 y 385-415.
     */
    buildReserveTalk() {
        const onMesa = () => this.stage === 'reserve';
        this.zone(110, 566, 50, 14, onMesa, this.chat([
            "TORREY PINES STATE NATURAL RESERVE. BEACH TRAIL. Please stay on the trail."
        ], "Please stay on the trail."));
        this.zone(62, 360, 50, 16, onMesa, this.chat([
            "A Torrey pine, bent sideways by years of wind off the ocean.",
            "Yvy: 'These only grow here and on one island off the coast. They're the rarest pine in the country.'",
            "Mike: 'So we're basically hiking past celebrities.'"
        ], "The Torrey pine leans into the wind."));
        this.zone(223, 250, 40, 16, onMesa, this.chat([
            "The old lodge: adobe walls and the ends of the roof beams poking out, the visitor center now.",
            "Yvy: 'Water fountain, then trail. Let's go.'"
        ], "The visitor center, cool and shady inside."));
        this.zone(300, 410, 50, 16, onMesa, this.chat([
            "Yvy: 'Smell that? That's the sage.'",
            "Mike: 'It smells like a candle. A really expensive candle.'"
        ], "Coastal sage, warm in the sun."));
        this.zone(520, 392, 70, 14, onMesa, () => this.overlook());
        this.zone(740, 400, 60, 30, onMesa, () => this.toBeach());
    }

    /**
     * On the beach: the rocks, each a zone just below it (x 304-356 y 436-456,
     * 414-466 y 506-526, 534-586 y 456-476, 654-706 y 526-546, 274-326 y 566-586)
     * · Flat Rock x 475-645 y 354-370 · the surfer x 740-780 y 430-450
     * · the towel x 710-770 y 588-600.
     */
    buildBeachTalk() {
        const onBeach = () => this.stage === 'beach';
        ROCKS.forEach(([x, y], i) => this.zone(x, y + 16, 52, 20, onBeach, () => this.hop(i)));
        this.zone(560, 362, 170, 16, onBeach, () => this.flatRock());
        this.zone(760, 440, 40, 20, onBeach, this.chat([
            "Surfer: 'Waves are small today, but the water's warm. Warm for here, anyway.'"
        ], "Surfer: 'Might paddle out anyway.'"));
        this.zone(740, 594, 60, 12, onBeach, this.chat([
            "Beachgoer: 'We hiked down at sunrise. Now we're never leaving this towel.'"
        ], "Beachgoer: 'Never leaving.'"));
    }

    // --- the story ---------------------------------------------------------------------

    /** Move between the three places behind a quick fade. */
    changePlace(stage, x, y, background, done) {
        this.cameras.main.fadeOut(450, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.setStage(stage);
            this.player.body.reset(x, y);
            this.yvy.setPosition(x + 30, y);
            this.cameras.main.setBackgroundColor(background);
            this.cameras.main.fadeIn(450, 0, 0, 0);
            done();
        });
    }

    toReserve() {
        this.busy = true;
        this.player.isLocked = true;
        this.instructionText.setText('');
        this.narrate([
            "At the top of the hill the road levels out onto the mesa: the old adobe lodge, the Torrey pines, and the trailheads."
        ], () => this.changePlace('reserve', 60, 578, '#b8d8ee', () => this.narrate([
            "Yvy: 'Made it. Now the good part.'"
        ], () => {
            this.busy = false;
            this.player.isLocked = false;
            this.instructionText.setText(`Take a picture at the overlook, then head down the Beach Trail (${actionLabel()})`);
        })));
    }

    /** The overlook: the view, and a picture of the two of them with the coast behind. */
    overlook() {
        if (this.reservePhoto) return showDialogue("Hiker (on the bench): 'Still the best view in San Diego.'");
        this.reservePhoto = true;
        this.busy = true;
        this.player.isLocked = true;
        this.yvyFollow = false;
        this.narrate([
            "From the overlook, the sandstone drops away to the beach, and the coast runs all the way down to La Jolla.",
            "Hiker (on the bench): 'Best view in San Diego. Don't tell anyone I said that.'",
            "Yvy: 'Picture! Right here, with the ocean behind us.'"
        ], () => {
            this.player.body.reset(560, 392);
            this.player.setFlipX(false);
            this.yvy.setPosition(588, 392).setFlipX(true);
            this.time.delayedCall(600, () => {
                this.cameras.main.flash(250, 255, 255, 255);
                takePhoto({
                    key: 'torreypines', title: 'Torrey Pines',
                    caption: "At the top of the Beach Trail, with the whole coast behind them.",
                    window: 0xb8d8ee,
                    sprites: [
                        { rect: [180, 30], x: 0, y: -20, color: 0x3f84b4 },
                        { texture: 'sandstone_bluff', x: -40, y: 4, scale: 0.6 },
                        { texture: 'sandstone_bluff', x: 44, y: 6, scale: 0.6, flip: true },
                        { rect: [180, 20], x: 0, y: 32, color: 0x6a8a52 },
                        { texture: 'torrey_pine', x: -70, y: -6, scale: 0.5 },
                        { texture: 'mike_hike', x: -12, y: 16 },
                        { texture: 'yvy_hike', x: 14, y: 16 }
                    ]
                });
                this.narrate(["Mike held the phone out as far as his arm would go, and got the whole coast in."], () => {
                    this.busy = false;
                    this.player.isLocked = false;
                    this.yvyFollow = true;
                    this.instructionText.setText(`Head down the Beach Trail to the beach (${actionLabel()})`);
                });
            });
        });
    }

    toBeach() {
        if (!this.reservePhoto) return showDialogue("Yvy: 'Wait! Picture at the overlook first.'");
        this.busy = true;
        this.player.isLocked = true;
        this.instructionText.setText('');
        this.narrate([
            "They went back down the hill the other way: the Beach Trail, winding between the bluffs to a long run of wooden steps, and the sand at the bottom."
        ], () => this.changePlace('beach', 280, 470, '#a8d4f0', () => {
            playSound('whoosh');
            this.narrate([
                "The beach under the cliffs was more rocks than sand: pebbles, cobbles, and boulders washed up all along it.",
                "Yvy: 'Race you across the rocks to Flat Rock!'",
                "Mike: 'You're on.'"
            ], () => {
                this.busy = false;
                this.player.isLocked = false;
                this.instructionText.setText(`Jump across the rocks to Flat Rock (${actionLabel()})`);
            });
        }));
    }

    /** Along a little arc from a to b, driving the body — a tween on his x and y would be undone by it. */
    arc(a, b, duration, height, done) {
        const c = { t: 0 };
        this.tweens.add({
            targets: c, t: 1, duration, ease: 'Sine.easeInOut',
            onUpdate: () => this.player.body.reset(
                Phaser.Math.Linear(a.x, b.x, c.t),
                Phaser.Math.Linear(a.y, b.y, c.t) - Math.sin(c.t * Math.PI) * height
            ),
            onComplete: done
        });
    }

    /** Up onto a rock, a moment on top, and off the other side. Yvy jumps along. */
    hop(i) {
        if (this.hopping) return;
        const [rx, ry] = ROCKS[i];
        this.hopping = true;
        this.player.isLocked = true;
        this.rockBlocks[i].body.enable = false;
        const from = { x: this.player.x, y: this.player.y };
        const top = { x: rx, y: ry - 18 };
        const land = { x: rx + (from.x <= rx ? 42 : -42), y: ry + 22 };
        playSound('whoosh');
        this.yvyFollow = false;
        this.tweens.add({ targets: this.yvy, y: this.yvy.y - 16, duration: 200, yoyo: true, delay: 150, ease: 'Sine.easeOut' });
        this.arc(from, top, 260, 20, () => this.time.delayedCall(220, () => this.arc(top, land, 260, 14, () => {
            this.rockBlocks[i].body.enable = true;
            this.player.isLocked = false;
            this.hopping = false;
            this.yvyFollow = true;
        })));
    }

    flatRock() {
        this.busy = true;
        this.player.isLocked = true;
        this.yvyFollow = false;
        this.instructionText.setText('');
        this.narrate([
            "Flat Rock, sitting out in the surf with tide pools in its hollows.",
            "Yvy: 'Look, a little crab! And anemones. Don't poke them.'",
            "Mike: 'I wasn't going to poke them.'",
            "Yvy: 'One more picture. On the rocks.'"
        ], () => {
            this.player.body.reset(548, 358);
            this.player.setFlipX(false);
            this.yvy.setPosition(576, 358).setFlipX(true);
            this.time.delayedCall(600, () => {
                this.cameras.main.flash(250, 255, 255, 255);
                takePhoto({
                    key: 'flatrock', title: 'Flat Rock',
                    caption: "Down on the beach under the cliffs, sandy and out of breath.",
                    window: 0xa8d4f0,
                    sprites: [
                        { rect: [180, 26], x: 0, y: -24, color: 0x3a86b8 },
                        { rect: [180, 40], x: 0, y: 20, color: 0xe6d2a6 },
                        { texture: 'flat_rock', x: 10, y: -4, scale: 0.9 },
                        { texture: 'pebbles', x: -60, y: 30 },
                        { texture: 'pebbles', x: 58, y: 32, flip: true },
                        { texture: 'beach_rock', x: -62, y: 20, scale: 0.8 },
                        { texture: 'mike_hike', x: -14, y: 12 },
                        { texture: 'yvy_hike', x: 12, y: 12 }
                    ]
                });
                this.narrate([
                    "They stayed on the beach under the cliffs a long time, jumping from rock to rock, watching the waves come in.",
                    "Yvy: 'Worth the hill?'",
                    "Mike: 'Ask me again on the way back up.'"
                ], () => {
                    this.cameras.main.fadeOut(1200, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        stopMusic();
                        this.scene.start('MisterAsScene');
                    });
                });
            });
        });
    }

    update() {
        this.player.update(this.cursors);
        if (this.stage === 'road' && !this.player.isLocked) this.keepOnRoad();
        this.bottle.setPosition(this.player.x + (this.player.flipX ? -11 : 11), this.player.y + 4);
        if (this.yvyFollow) {
            const dx = this.player.x + 28 - this.yvy.x;
            const dy = this.player.y - this.yvy.y;
            if (Math.hypot(dx, dy) > 6) {
                this.yvy.x += dx * 0.12; // keeping up: they are going fast
                this.yvy.y += dy * 0.12;
                this.yvy.setFlipX(dx < 0);
            }
        }
        const near = !this.busy && !this.hopping && this.zones.some(({ z, when }) => when() && this.physics.overlap(this.player, z));
        // The people walking about are caught by distance, and only when no zone
        // wants the keypress (scene update runs before the physics step).
        const walker = !near && !this.busy && !this.hopping && this.walkers.find(w => w.stage === this.stage
            && Phaser.Math.Distance.Between(this.player.x, this.player.y, w.sprite.x, w.sprite.y) < 36);
        if (walker && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) walker.talk();
        document.getElementById('interaction-hint').style.display = (near || walker) ? 'block' : 'none';
    }
}

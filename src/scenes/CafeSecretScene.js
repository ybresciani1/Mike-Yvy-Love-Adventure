import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playRomanticTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

// Warm white and gold, like the strings over the patio, the pergola and the tree.
const BULBS = [0xfff2c4, 0xffd878];

/**
 * Cafe Secret in Del Mar, after the Flower Fields: a little Peruvian place in a
 * stone cottage under a flood of bougainvillea, with a window onto the bar, a
 * covered yellow patio, and a green pergola across the walkway with more
 * tables under a tree full of lights. Yvy orders — a causa to share and two
 * chicha moradas — and it is Mike's first Peruvian food. Then the day is done,
 * with a hike at Torrey Pines planned for the morning.
 */
export class CafeSecretScene extends Phaser.Scene {
    constructor() { super('CafeSecretScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#8ec0e6');
        this.zones = [];
        this.bulbs = [];
        this.lamps = [];
        this.busy = true;
        this.yvyFollow = true;

        this.buildBackdrop();
        this.buildCottage();
        this.buildBarWindow();
        this.buildCoveredPatio();
        this.buildPergola();
        this.buildGround();

        this.player = new Player(this, 40, 572);
        this.player.setTexture('mike_tank').setDepth(20);
        // A plain sprite, so she can be sat down at the table.
        this.yvy = this.add.sprite(72, 572, 'yvy_flower').setDepth(20);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.buildSolids();
        this.buildTables();
        this.buildPlants();
        this.buildTalk();

        // Evening, laid over everything at the end. The lights that come on are
        // lifted above it, which is what makes them read as lit.
        this.dusk = this.add.rectangle(400, 300, GAME_WIDTH, 600, 0x1c2248, 0).setDepth(35);
        this.instructionText = this.add.text(20, 574, '', {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(40);

        stopMusic();
        playRomanticTheme();
        // Nothing starts until the opening lines have been read.
        this.time.delayedCall(700, () => this.narrate([
            "After the Flower Fields, Yvy took Mike to Cafe Secret in Del Mar: a little Peruvian place tucked under a flood of bougainvillea.",
            "Yvy: 'Have you ever had Peruvian food?'",
            "Mike: 'I don't think so.'",
            "Yvy: 'Okay. Then I'm ordering.'"
        ], () => {
            this.busy = false;
            this.instructionText.setText(`Look around, or talk to the server (${actionLabel()})`);
        }));
    }

    // --- helpers ----------------------------------------------------------------

    zone(x, y, w, h, act) {
        const z = this.add.rectangle(x, y, w, h, 0xffff00, 0);
        this.physics.add.existing(z, true);
        this.physics.add.overlap(this.player, z, () => {
            if (!this.busy && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) act();
        });
        this.zones.push(z);
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

    nearest(people) {
        const distance = p => Math.abs(p.sprite.x - this.player.x) + Math.abs(p.sprite.y - this.player.y);
        return people.reduce((a, b) => (distance(a) <= distance(b) ? a : b));
    }

    /** A sagging string of warm bulbs from x0 to x1. */
    stringLights(x0, x1, y, { sag = 8, step = 22, depth = 26 } = {}) {
        const g = this.add.graphics().setDepth(depth);
        g.lineStyle(1, 0x3a3226, 0.9);
        for (let x = x0, i = 0; x < x1; x += step, i++) {
            const mid = x + step / 2;
            g.lineBetween(x, y, mid, y + sag);
            g.lineBetween(mid, y + sag, Math.min(x + step, x1), y);
            this.bulb(mid, y + sag + 3, i, depth);
        }
    }

    /** One bulb, unlit until lightsOn() — it is still daylight when they arrive. */
    bulb(x, y, i, depth) {
        const color = BULBS[i % 2];
        const glow = this.add.circle(x, y, 6, color, 0).setDepth(depth);
        const bulb = this.add.circle(x, y, 2.5, 0xcfc8b4).setDepth(depth).setAlpha(0.7);
        this.bulbs.push({ bulb, glow, color, i });
    }

    /** Dusk falls, then the strings come on a bulb at a time, and the lamps with them. */
    lightsOn(done) {
        this.tweens.add({ targets: this.dusk, fillAlpha: 0.45, duration: 1800, ease: 'Sine.easeIn' });
        this.time.delayedCall(1500, () => {
            playSound('select');
            this.lamps.forEach(lamp => {
                lamp.setDepth(36);
                this.tweens.add({ targets: lamp, fillAlpha: 0.45, scale: 1.4, duration: 500 });
            });
            this.bulbs.forEach(({ bulb, glow, color, i }, n) => this.time.delayedCall(n * 18, () => {
                bulb.setFillStyle(color).setAlpha(1).setDepth(36);
                glow.setDepth(36);
                this.tweens.add({ targets: glow, fillAlpha: 0.3, scale: 1.3, duration: 250 });
                this.tweens.add({
                    targets: bulb, alpha: 0.75, duration: 700 + (i * 53) % 600, yoyo: true, repeat: -1, delay: 250
                });
            }));
            this.time.delayedCall(this.bulbs.length * 18 + 700, done);
        });
    }

    // --- the place ----------------------------------------------------------------

    /** Sky, and the white building behind the pergola. */
    buildBackdrop() {
        this.add.rectangle(400, 110, GAME_WIDTH, 220, 0x8ec0e6);
        this.add.image(650, 160, 'palm_tree').setScale(0.7);
        this.add.rectangle(690, 300, 240, 220, 0xf2efe6);
        this.add.rectangle(690, 190, 244, 6, 0xd8d2c4);
        this.add.rectangle(690, 206, 240, 6, 0xc8583a); // red trim
        this.add.rectangle(740, 282, 52, 40, 0x6a7a86);
        this.add.rectangle(740, 282, 46, 34, 0x9ab0bc);
    }

    /** The stone cottage and its slate roof, the chimney, and the door. */
    buildCottage() {
        this.add.rectangle(470, 96, 40, 70, 0xd98a5a); // chimney
        this.add.rectangle(470, 62, 48, 8, 0xb5563a);
        this.add.rectangle(458, 98, 8, 40, 0xe8a070);
        for (let y = 128; y < 236; y += 16) {
            for (let x = 336; x < 576; x += 32) this.add.image(x, y, 'slate_shingles');
        }
        this.add.rectangle(448, 122, 256, 4, 0x4a4e56); // ridge
        for (let y = 166; y < 410; y += 32) {
            for (let x = 16; x < 300; x += 32) this.add.image(x, y, 'stacked_stone');
        }
        this.add.rectangle(306, 336, 36, 132, 0x2e2018); // the door
        this.add.rectangle(306, 312, 20, 30, 0x5a4a38);
        this.add.rectangle(150, 404, 290, 16, 0x8a4a3a); // brick planter
        for (let x = 8; x < 296; x += 16) this.add.rectangle(x, 404, 1, 16, 0x6a3a2e);
    }

    /** A window through the stone wall onto the bar: the bartender, taps, bottles. */
    buildBarWindow() {
        this.add.ellipse(150, 230, 72, 36, 0xc9a45a); // the blue oval sign
        this.add.ellipse(150, 230, 66, 30, 0x2a4a9a);
        this.add.text(150, 230, 'Café Secret', { fontFamily: 'Georgia, serif', fontSize: '10px', color: '#f2e2b0' }).setOrigin(0.5);

        this.add.rectangle(150, 300, 236, 98, 0xb89c7a); // the lighter stone round the opening
        this.add.rectangle(150, 304, 218, 86, 0xd8b868); // lamplit yellow inside
        this.add.rectangle(150, 266, 218, 6, 0x8a6a44);
        [100, 132, 164].forEach(x => this.add.image(x, 290, 'bar_shelf').setScale(1, 0.8));
        [214, 230, 246].forEach(x => { // coffee urns
            this.add.rectangle(x, 314, 12, 22, 0x2a2a2e);
            this.add.rectangle(x, 302, 8, 3, 0x7a7a80);
        });
        this.add.rectangle(56, 290, 10, 14, 0x2a2a2e); // a lamp
        this.lamps.push(this.add.circle(56, 298, 9, 0xffe8a0, 0.35));
        this.add.rectangle(236, 280, 28, 11, 0x1e1e22); // OPEN
        this.add.text(236, 280, 'OPEN', { fontSize: '7px', color: '#f2f2f2' }).setOrigin(0.5);

        this.bartender = this.add.sprite(124, 322, 'bartender');
        this.tweens.add({ targets: this.bartender, x: 150, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.add.image(184, 330, 'tap_tower');

        // The slate ledge, in every colour slate comes in, and what sits on it.
        const SLATE = [0x6a6e76, 0x8a7a64, 0x5a6a5a, 0xa8845a, 0x7a6a7a, 0x9a9a8a];
        for (let i = 0; i < 11; i++) this.add.rectangle(47 + i * 20.6, 348, 20, 16, SLATE[i % SLATE.length]);
        this.add.rectangle(150, 339, 236, 3, 0x4a4a50);
        [70, 250].forEach(x => {
            this.lamps.push(this.add.circle(x, 330, 8, 0xfff0c0, 0.25));
            this.add.image(x, 331, 'blue_lantern');
        });
        [[92, 332], [210, 332], [228, 332]].forEach(([x, y]) => this.add.image(x, y, 'succulent_pot'));
        this.add.rectangle(112, 334, 6, 7, 0xf28ab0); // somebody's pink cup
    }

    /** The covered yellow patio between the cottage and the walkway. */
    buildCoveredPatio() {
        this.add.rectangle(440, 330, 240, 170, 0xe8c25a);
        this.add.rectangle(440, 408, 240, 12, 0xc9a040);
        this.add.image(350, 350, 'tiled_wall_fountain').setScale(1.2);
        this.add.image(500, 322, 'chalkboard_menu').setScale(1.1);
        this.add.rectangle(500, 288, 64, 12, 0x3a2418);
        this.add.text(500, 288, 'SEAFOOD', { fontSize: '8px', color: '#f2e2b0', fontStyle: 'bold' }).setOrigin(0.5);
        [[420, 300, 22, 28], [546, 362, 14, 18]].forEach(([x, y, w, h]) => {
            this.add.rectangle(x, y, w, h, 0x3a2418);
            this.add.rectangle(x, y, w - 6, h - 6, 0xc8d0b0);
        });
        this.add.rectangle(440, 238, 252, 10, 0x5a3a22); // beam
        this.add.rectangle(440, 246, 252, 5, 0x7a5232);
        [316, 562].forEach(x => this.add.rectangle(x, 356, 8, 230, 0x6a4a2e).setDepth(9));
        this.stringLights(320, 560, 250);
        this.stringLights(10, 300, 246, { sag: 6, step: 26, depth: 7 }); // along the top of the stone wall

        // Bougainvillea over the wall and the roof, and vines hanging down.
        [[40, 150], [98, 128], [160, 150], [222, 124], [286, 146], [346, 118], [402, 132], [520, 124],
         [26, 196], [262, 196], [18, 250], [290, 244]]
            .forEach(([x, y], i) => this.add.image(x, y, 'bougainvillea').setScale(1.3).setFlipX(i % 2 === 1).setDepth(8));
        [[60, 200, 70], [150, 250, 20], [250, 210, 90], [330, 170, 80], [296, 260, 120]].forEach(([x, y, h]) => {
            this.add.rectangle(x, y + h / 2, 2, h, 0x6a5a3a).setDepth(8);
        });
    }

    /** Across the walkway: a green pergola, and the tree over it wrapped in lights. */
    buildPergola() {
        const GREEN = 0x5a8a5e, GREEN_SH = 0x3e6a44, GREEN_HI = 0x7aaa7e;
        this.add.rectangle(698, 330, 200, 6, GREEN_SH).setDepth(4); // back beam
        [620, 776].forEach(x => this.add.rectangle(x, 370, 8, 80, GREEN_SH).setDepth(4)); // back posts
        this.add.rectangle(698, 300, 214, 10, GREEN).setDepth(25); // front beam
        this.add.rectangle(698, 306, 214, 3, GREEN_SH).setDepth(25);
        for (let x = 600; x <= 796; x += 28) { // rafter ends
            this.add.rectangle(x, 292, 8, 14, GREEN).setDepth(25);
            this.add.rectangle(x, 286, 8, 3, GREEN_HI).setDepth(25);
        }
        [606, 790].forEach(x => {
            this.add.rectangle(x, 422, 12, 236, GREEN).setDepth(25);
            this.add.rectangle(x - 4, 422, 3, 236, GREEN_HI).setDepth(25);
        });
        [606, 790].forEach((x, i) => this.add.image(x + 3, 400, 'climbing_vine').setScale(1.2, 2).setFlipX(i === 1).setDepth(25.5));
        [[640, 288], [764, 284]].forEach(([x, y]) => this.add.image(x, y, 'bougainvillea').setScale(0.9).setDepth(25.5));
        this.stringLights(600, 796, 310, { sag: 10, step: 28, depth: 25 });

        // The tree: a pale trunk coming in over the top, branches strung with lights.
        const t = this.add.graphics().setDepth(24);
        t.lineStyle(18, 0xc8b08a, 1);
        t.lineBetween(830, 20, 700, 118);
        t.lineStyle(10, 0xc8b08a, 1);
        t.lineBetween(700, 118, 590, 150);
        t.lineBetween(750, 80, 660, 52);
        t.lineStyle(6, 0xb89c7a, 1);
        t.lineBetween(590, 150, 530, 138);
        t.lineBetween(660, 52, 600, 30);
        t.lineBetween(700, 118, 684, 180);
        [[830, 20, 590, 150, 10], [750, 80, 600, 30, 5]].forEach(([x0, y0, x1, y1, n], s) => {
            for (let i = 1; i < n; i++) {
                const k = i / n;
                this.bulb(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + (i % 2 ? -4 : 5), i + s, 24);
            }
        });
    }

    buildGround() {
        this.add.rectangle(280, 476, 560, 136, 0xb8a88c); // flagstones in front of the restaurant
        for (let i = 0; i < 24; i++) {
            this.add.rectangle((i * 97) % 540, 414 + (i * 37) % 124, 20 + (i * 13) % 30, 1, 0x9a8a70);
        }
        this.add.rectangle(440, 446, 240, 60, 0x000000, 0.08); // shade under the roof
        this.add.rectangle(580, 476, 36, 136, 0xd8d8d2); // the walkway between
        this.add.rectangle(698, 476, 200, 136, 0xa8826a); // the pergola's patio
        for (let i = 0; i < 8; i++) this.add.rectangle(610 + (i * 53) % 180, 420 + (i * 29) % 110, 18, 1, 0x8a6a56);
        this.add.rectangle(400, 572, GAME_WIDTH, 56, 0xd2d2ce); // sidewalk
        for (let x = 0; x < GAME_WIDTH; x += 64) this.add.rectangle(x, 572, 1, 56, 0xb8b8b4);
        this.add.rectangle(400, 544, GAME_WIDTH, 2, 0xa8a8a4);

        this.add.image(30, 436, 'patio_heater').setScale(1.1).setDepth(9);
        this.add.image(612, 500, 'patio_heater').setScale(1.1).setDepth(9);
        this.add.image(580, 556, 'menu_board_stand').setDepth(9);
        this.server = this.add.sprite(250, 452, 'server').setDepth(9);
    }

    buildSolids() {
        const solid = (x, y, w, h) => {
            const b = this.add.rectangle(x, y, w, h, 0, 0);
            this.physics.add.existing(b, true);
            this.physics.add.collider(this.player, b);
            return b;
        };
        solid(400, 205, GAME_WIDTH, 410); // the buildings
        solid(110, 488, 64, 32); // the friends, under the red umbrella
        solid(320, 510, 64, 32); // the table under the green umbrella
        this.ourBlock = solid(430, 430, 80, 24); // their table, by the fountain
        solid(520, 478, 64, 32); // the older couple, under the roof
        solid(660, 458, 64, 32); // the couple under the pergola
        solid(750, 500, 50, 24); // the empty tiled table
        solid(30, 462, 14, 10); // heaters
        solid(612, 526, 14, 10);
        solid(580, 580, 20, 8); // the menu post
    }

    /** People at their tables, with things on the tables: sitters behind, tabletop across their laps. */
    buildTables() {
        const table = (x, y, { people = [], things = [], umbrella = null, top = 'bistro_table', chairs = 'wood_chair' }) => {
            [[-30, false], [30, true]].forEach(([dx, flip]) => this.add.image(x + dx, y - 2, chairs).setFlipX(flip).setDepth(10));
            people.forEach(([dx, key, tint]) => this.add.sprite(x + dx, y - 20, key).setTint(tint).setFlipX(dx > 0).setDepth(10));
            this.add.image(x, y, top).setDepth(11);
            things.forEach(([dx, key, scale]) => this.add.image(x + dx, y - 20, key).setScale(scale).setDepth(12));
            if (umbrella) this.add.image(x, y - 41, umbrella).setDepth(30);
        };
        table(110, 500, {
            people: [[-14, 'civilian_f_sit', 0xd8d8e8], [14, 'civilian_f_sit', 0xf0c0c0]],
            things: [[-8, 'coffee', 0.35], [8, 'coffee', 0.35]], umbrella: 'red_umbrella'
        });
        table(320, 522, {
            people: [[-14, 'civilian_sit', 0xd8c8b0], [14, 'civilian_f_sit', 0xe8d0e0]],
            things: [[-6, 'tartare_plate', 0.7], [10, 'chicha_morada', 0.8]], umbrella: 'green_umbrella'
        });
        table(520, 490, {
            people: [[-14, 'civilian_sit', 0xd0d0d0], [14, 'civilian_sit', 0xc8e0c8]],
            things: [[0, 'tartare_plate', 0.8]]
        });
        table(660, 470, {
            people: [[-14, 'civilian_sit', 0xe0e0e0], [14, 'civilian_f_sit', 0xf0d0c0]],
            things: [[-6, 'tartare_plate', 0.7], [10, 'chicha_morada', 0.8]], top: 'mosaic_table', chairs: 'iron_chair'
        });
        table(750, 512, { top: 'mosaic_table', chairs: 'iron_chair' });

        // Theirs, empty for now, with a chair either side: by the fountain under
        // the roof, high enough up the screen that the dialogue box, which covers
        // everything below y=439, never hides the food while they talk about it.
        this.ourChairs = [
            this.add.image(400, 436, 'wood_chair').setDepth(10),
            this.add.image(460, 436, 'wood_chair').setFlipX(true).setDepth(10)
        ];
        this.ourTable = this.add.image(430, 438, 'bistro_table').setDepth(11);
    }

    /** More green everywhere: the planter, pots, and plants along the sidewalk. */
    buildPlants() {
        [[30, 390], [96, 388], [170, 391], [246, 388]].forEach(([x, y], i) => this.add.image(x, y, 'yellow_shrub').setFlipX(i % 2 === 1));
        this.add.image(288, 420, 'agave_pot').setScale(0.6).setDepth(9);
        this.add.image(580, 418, 'barrel_planter').setScale(0.6).setDepth(9);
        this.add.image(776, 426, 'agave_pot').setScale(0.7).setDepth(9);
        this.add.image(536, 424, 'succulent_pot').setScale(1.4).setDepth(9);
        // A hedge along the back of the pergola, against the white wall.
        [[630, 398], [670, 394], [710, 398], [750, 394], [784, 398]].forEach(([x, y], i) => {
            this.add.image(x, y, i % 2 ? 'bougainvillea' : 'yellow_shrub').setScale(i % 2 ? 0.8 : 1.1).setDepth(3);
        });
        // Vines hanging off the pergola's front beam.
        [640, 700, 756].forEach(x => this.add.image(x, 336, 'climbing_vine').setScale(1, 0.7).setDepth(25.5));
        // In the foreground, along the edge of the sidewalk.
        [[430, 594], [520, 590], [690, 594], [786, 588]].forEach(([x, y], i) => {
            this.add.image(x, y, 'bird_of_paradise').setScale(1.3).setFlipX(i % 2 === 1).setDepth(27);
        });
        [[476, 598], [740, 598]].forEach(([x, y]) => this.add.image(x, y, 'yellow_shrub').setDepth(27));

        // A petal drifting down now and then.
        this.time.addEvent({
            delay: 800, loop: true, callback: () => {
                const petal = this.add.rectangle(40 + Math.random() * 740, 200, 3, 2, 0xf05cb4).setDepth(28);
                this.tweens.add({
                    targets: petal, y: 420 + Math.random() * 120, x: petal.x + 30 - Math.random() * 60, angle: 180,
                    duration: 4200, onComplete: () => petal.destroy()
                });
            }
        });
    }

    /**
     * Everything to look at and everyone to talk to, before they sit down.
     * Zones, all further apart than he is wide:
     *   the bar window x 70-210 y 410-430 · the server x 232-268 y 444-480
     *   the wall fountain x 330-370 y 410-430 · the chalkboard x 490-540 y 410-430
     *   the friends x 65-155 y 506-526 · the green umbrella x 280-360 y 528-544
     *   the older couple x 485-555 y 500-520 · the pergola couple x 625-695 y 480-500
     *   the tiled table x 725-775 y 518-534 · the menu post x 546-566 y 560-590
     */
    buildTalk() {
        this.zone(140, 420, 140, 20, this.chat([
            "Through the window in the stone wall: the bartender at the taps, bottles and coffee urns lined up behind, blue lanterns and succulents along the slate ledge.",
            "Bartender: 'Evening! Grab a seat and the server will bring you whatever you like. I'll be the one making it.'"
        ], "Bartender: 'Taps are cold and the chicha's fresh.'"));
        this.zone(250, 462, 36, 36, () => this.sitDown());
        this.zone(350, 420, 40, 20, this.chat([
            "A little fountain set into a tiled arch in the yellow wall, trickling away under the string lights."
        ], "The fountain trickles."));
        this.zone(515, 420, 50, 20, this.chat([
            "The chalkboard: OUR BEST DISHES down one side, SPECIALTY DRINKS down the other, and 'Authentic Peruvian Flavor' across the top.",
            "Mike: 'I don't know what half of these are.'",
            "Yvy: 'That's what I'm for.'"
        ], "The specials, in chalk."));
        this.zone(556, 575, 20, 30, this.chat([
            "A menu on a post by the sidewalk, pinned up in a bright yellow frame.",
            "Yvy: 'Don't read it. I already know what we're getting.'"
        ], "Yvy: 'Still not reading it.'"));
        this.zone(750, 526, 50, 16, this.chat([
            "A round table under the green pergola, its top tiled yellow, blue and red, with iron chairs and red cushions.",
            "Yvy: 'These tables are so pretty.'"
        ], "Tiled tables under the pergola."));

        const group = (x, y, w, h, people) => this.zone(x, y, w, h, () => this.nearest(people).talk());
        const person = (x, y, line, again) => ({ sprite: { x, y }, talk: this.chat([line], again) });
        group(110, 516, 90, 20, [
            person(96, 480, "Diner: 'Get a table under an umbrella if you can. The bougainvillea drops petals in your drink.'", "Diner: 'There's one in my coffee right now.'"),
            person(124, 480, "Diner: 'We just came from a run. This is the reward.'", "Diner: 'Worth every mile.'")
        ]);
        group(320, 536, 80, 16, [
            person(306, 502, "Diner: 'We always ask for the green umbrella. The red ones are for people who haven't been here before.'", "Diner: 'Green is better. That's all.'"),
            person(334, 502, "Diner: 'The bougainvillea keeps dropping petals on my plate. I'm calling it seasoning.'", "Diner: 'More seasoning.'")
        ]);
        group(520, 510, 70, 20, [
            person(506, 470, "Diner: 'Try the chicha morada. It's made from purple corn. It sounds strange and it's wonderful.'", "Diner: 'Purple corn!'"),
            person(534, 470, "Diner: 'It's easy to walk right past this place. That's the secret part.'", "Diner: 'Don't tell anyone.'")
        ]);
        group(660, 490, 70, 20, [
            person(646, 450, "Diner: 'He got the short rib, I got the salmon. We're swapping halfway.'", "Diner: 'Halfway is now.'"),
            person(674, 450, "Diner: 'That tree over the pergola has lights all through its branches. Wait till it gets dark.'", "Diner: 'Nearly dark.'")
        ]);
    }

    // --- dinner -----------------------------------------------------------------------

    sitDown() {
        this.busy = true;
        this.player.isLocked = true;
        this.yvyFollow = false;
        this.instructionText.setText('');
        this.narrate([
            "Server: 'Hi, welcome in! Just the two of you? Take the table by the fountain.'"
        ], () => {
            this.ourBlock.body.enable = false;
            this.ourChairs.forEach(c => c.setVisible(false));
            this.player.setTexture('mike_tank_sit').setDepth(10);
            this.player.body.reset(416, 418);
            this.yvy.setTexture('yvy_flower_sit').setPosition(444, 418).setDepth(10);
            this.tweens.add({
                targets: this.server, x: 484, y: 438, duration: 700, ease: 'Sine.easeInOut',
                onComplete: () => this.narrate([
                    "Server: 'What can I get you two?'",
                    "Yvy: 'A causa to share, please, and two chicha moradas.'",
                    "Mike: 'I understood \"please\".'",
                    "Yvy: 'Causa is cold mashed yellow potato with lime and ají amarillo, layered with shrimp and avocado.'",
                    "Yvy: 'And chicha morada is made from purple corn, with pineapple and cinnamon. Trust me.'",
                    "Server: 'Coming right up.'"
                ], () => this.bringFood())
            });
        });
    }

    bringFood() {
        this.tweens.add({
            targets: this.server, x: 306, y: 420, duration: 900, ease: 'Sine.easeInOut',
            onComplete: () => this.time.delayedCall(1400, () => this.tweens.add({
                targets: this.server, x: 484, y: 438, duration: 900, ease: 'Sine.easeInOut',
                onComplete: () => {
                    playSound('select');
                    this.causa = this.add.image(430, 416, 'causa_plate').setDepth(12);
                    this.drinks = [
                        this.add.image(410, 414, 'chicha_morada').setDepth(12),
                        this.add.image(450, 414, 'chicha_morada').setDepth(12)
                    ];
                    this.narrate([
                        "The causa came out as a neat little tower: yellow potato, a layer of avocado, a shrimp on top, and sauce dotted round the plate.",
                        "Yvy: 'First bite. Get a little of everything.'"
                    ], () => {
                        this.tweens.add({ targets: this.server, x: 250, y: 452, duration: 900 });
                        this.firstBite();
                    });
                }
            }))
        });
    }

    firstBite() {
        const fork = this.add.rectangle(422, 414, 2, 7, 0xd2d6da).setDepth(13);
        this.tweens.add({ targets: fork, y: 404, x: 418, duration: 400, yoyo: true, repeat: 1, onComplete: () => fork.destroy() });
        this.time.delayedCall(1700, () => this.narrate([
            "Mike: 'Oh, that's really good. It's cold, and it's really good.'",
            "Yvy: 'Now the chicha.'"
        ], () => {
            this.drinks.forEach((drink, i) => this.tweens.add({
                targets: drink, y: drink.y - 8, angle: i ? 25 : -25, duration: 300, hold: 400, yoyo: true, delay: i * 400
            }));
            this.time.delayedCall(1600, () => this.narrate([
                "Mike: 'It's like spiced grape juice, but better. That's corn?'",
                "Yvy: 'Purple corn. Welcome to Peruvian food.'"
            ], () => this.endOfTheDay()));
        }));
    }

    endOfTheDay() {
        this.tweens.add({ targets: this.causa, scale: 0.6, alpha: 0.5, duration: 2400 });
        this.lightsOn(() => this.narrate([
            "They stayed out on the patio until the string lights came on. And that was the end of the day.",
            "Yvy: 'Don't forget, tomorrow we're hiking Torrey Pines.'",
            "Mike: 'I'll be there. Early.'",
            "Yvy: 'Bring water. And snacks. And more water.'"
        ], () => {
            this.cameras.main.fadeOut(1200, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                stopMusic();
                this.scene.start('TorreyPinesScene');
            });
        }));
    }

    update() {
        this.player.update(this.cursors);
        if (this.yvyFollow) {
            const dx = this.player.x + 28 - this.yvy.x;
            const dy = this.player.y - this.yvy.y;
            if (Math.hypot(dx, dy) > 6) {
                this.yvy.x += dx * 0.08;
                this.yvy.y += dy * 0.08;
                this.yvy.setFlipX(dx < 0);
            }
        }
        const near = !this.busy && this.zones.some(z => this.physics.overlap(this.player, z));
        document.getElementById('interaction-hint').style.display = near ? 'block' : 'none';
    }
}

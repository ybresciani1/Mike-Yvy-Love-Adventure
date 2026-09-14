import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playRomanticTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

const BULBS = [0xff4a4a, 0x4ae05a, 0x4a7aff, 0xffd84a];

/**
 * Cafe Secret in Del Mar, after the Flower Fields: a little Peruvian place with
 * a stone wall under a flood of bougainvillea and a covered patio round the
 * back. Yvy orders — a causa to share and two chicha moradas — and it is Mike's
 * first Peruvian food. Then the day is done, with a hike at Torrey Pines
 * planned for the morning.
 */
export class CafeSecretScene extends Phaser.Scene {
    constructor() { super('CafeSecretScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#8ec0e6');
        this.zones = [];
        this.busy = true;
        this.yvyFollow = true;

        this.buildBuilding();
        this.buildPatio();

        this.player = new Player(this, 60, 572);
        this.player.setTexture('mike_tank').setDepth(20);
        // A plain sprite, so she can be sat down at the table.
        this.yvy = this.add.sprite(92, 572, 'yvy_flower').setDepth(20);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.buildSolids();
        this.buildTables();
        this.buildTalk();

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

    // --- the place ----------------------------------------------------------------

    /** The stone wall and window on the left, the cottage roof, the covered patio. */
    buildBuilding() {
        // Sky, then the roof and chimney.
        this.add.rectangle(400, 60, GAME_WIDTH, 120, 0x8ec0e6);
        this.add.rectangle(560, 96, 44, 70, 0xd98a5a); // chimney
        this.add.rectangle(560, 62, 52, 8, 0xb5563a);
        this.add.rectangle(546, 98, 8, 40, 0xe8a070);
        for (let y = 128; y < 236; y += 16) {
            for (let x = 336; x < GAME_WIDTH + 16; x += 32) this.add.image(x, y, 'slate_shingles');
        }
        this.add.rectangle(560, 122, 480, 4, 0x4a4e56); // ridge

        // The stone wall, its window of food photos, and a brick planter below.
        for (let y = 166; y < 410; y += 32) {
            for (let x = 16; x < 300; x += 32) this.add.image(x, y, 'stacked_stone');
        }
        this.add.rectangle(160, 300, 208, 78, 0x3a3228);
        this.add.rectangle(160, 300, 200, 70, 0x2a3a48);
        [[70, 280, 30], [120, 272, 20], [210, 284, 26]].forEach(([x, y, w]) => this.add.rectangle(x, y, w, 2, 0x5a7a90)); // reflections
        [[78, 0x6aa0d0], [118, 0xe8c25a], [160, 0xd05a4a], [200, 0x7ab04a], [242, 0xf2a0c0]].forEach(([x, food]) => {
            this.add.rectangle(x, 320, 26, 28, 0x2a2a2e);
            this.add.rectangle(x, 320, 22, 24, 0xf2eee4);
            this.add.rectangle(x, 320, 16, 16, food);
        });
        this.add.rectangle(160, 338, 216, 6, 0x6a5a48); // sill
        this.add.rectangle(145, 404, 290, 16, 0x8a4a3a); // planter
        for (let x = 8; x < 290; x += 16) this.add.rectangle(x, 404, 1, 16, 0x6a3a2e);

        // Between them, the door.
        this.add.rectangle(306, 336, 36, 132, 0x2e2018);
        this.add.rectangle(306, 312, 20, 30, 0x5a4a38);

        // The covered patio: a yellow back wall under the eaves.
        this.add.rectangle(560, 330, 480, 170, 0xe8c25a);
        this.add.rectangle(560, 408, 480, 12, 0xc9a040);
        this.add.image(430, 350, 'tiled_wall_fountain').setScale(1.3);
        this.add.image(600, 318, 'chalkboard_menu').setScale(1.4);
        this.add.rectangle(600, 276, 70, 14, 0x3a2418);
        this.add.text(600, 276, 'SEAFOOD', { fontSize: '9px', color: '#f2e2b0', fontStyle: 'bold' }).setOrigin(0.5);
        [[704, 300, 26, 22], [744, 322, 20, 26], [712, 350, 22, 18]].forEach(([x, y, w, h]) => {
            this.add.rectangle(x, y, w, h, 0x3a2418);
            this.add.rectangle(x, y, w - 6, h - 6, 0xc8d0b0);
        });
        this.add.rectangle(560, 238, 490, 10, 0x5a3a22); // beam
        this.add.rectangle(560, 246, 490, 5, 0x7a5232);
        this.add.rectangle(470, 256, 120, 18, 0x2e2018); // the sign
        this.add.text(470, 256, 'CAFE SECRET', { fontSize: '11px', color: '#f2e2b0', fontStyle: 'bold' }).setOrigin(0.5);

        // String lights along the beam, in colours.
        const g = this.add.graphics();
        g.lineStyle(1, 0x2a2a2a, 1);
        this.bulbs = [];
        for (let i = 0; i < 20; i++) {
            const x0 = 330 + i * 23, x1 = x0 + 23;
            const sag = t => 250 + Math.sin(t * Math.PI) * 8;
            g.lineBetween(x0, sag(0), (x0 + x1) / 2, sag(0.5));
            g.lineBetween((x0 + x1) / 2, sag(0.5), x1, sag(1));
            const bulb = this.add.circle((x0 + x1) / 2, sag(0.5) + 3, 2.5, BULBS[i % BULBS.length]).setAlpha(0.7);
            this.bulbs.push(bulb);
            this.tweens.add({ targets: bulb, alpha: 1, duration: 700 + i * 53, yoyo: true, repeat: -1 });
        }
        // Posts holding up the patio roof.
        [314, 792].forEach(x => this.add.rectangle(x, 356, 8, 230, 0x6a4a2e).setDepth(9));

        // Bougainvillea over the wall and the roof, and vines hanging down.
        [[40, 150], [98, 128], [160, 150], [222, 124], [286, 146], [346, 118], [402, 132], [26, 196], [262, 196]]
            .forEach(([x, y], i) => this.add.image(x, y, 'bougainvillea').setScale(1.3).setFlipX(i % 2 === 1).setDepth(8));
        [[60, 200, 90], [150, 190, 70], [250, 210, 110], [330, 170, 80]].forEach(([x, y, h]) => {
            this.add.rectangle(x, y + h / 2, 2, h, 0x6a5a3a).setDepth(8);
        });
        // A petal drifting down now and then.
        this.time.addEvent({
            delay: 900, loop: true, callback: () => {
                const petal = this.add.rectangle(40 + Math.random() * 400, 200, 3, 2, 0xf05cb4).setDepth(25);
                this.tweens.add({
                    targets: petal, y: 420 + Math.random() * 120, x: petal.x + 30 - Math.random() * 60, angle: 180,
                    duration: 4200, onComplete: () => petal.destroy()
                });
            }
        });
    }

    buildPatio() {
        this.add.rectangle(400, 476, GAME_WIDTH, 136, 0xb8a88c); // flagstones
        for (let i = 0; i < 30; i++) {
            const x = (i * 97) % GAME_WIDTH, y = 414 + (i * 37) % 124;
            this.add.rectangle(x, y, 20 + (i * 13) % 30, 1, 0x9a8a70);
        }
        this.add.rectangle(560, 446, 480, 60, 0x000000, 0.08); // shade under the roof
        this.add.rectangle(400, 572, GAME_WIDTH, 56, 0xd2d2ce); // sidewalk
        for (let x = 0; x < GAME_WIDTH; x += 64) this.add.rectangle(x, 572, 1, 56, 0xb8b8b4);
        this.add.rectangle(400, 544, GAME_WIDTH, 2, 0xa8a8a4);

        this.add.image(250, 436, 'patio_heater').setScale(1.1).setDepth(9);
        this.add.image(640, 530, 'patio_heater').setScale(1.1).setDepth(9);
        this.add.image(770, 530, 'menu_board_stand').setScale(1.1).setDepth(9);

        this.server = this.add.sprite(330, 448, 'server').setDepth(9);
    }

    buildSolids() {
        const solid = (x, y, w, h) => {
            const b = this.add.rectangle(x, y, w, h, 0, 0);
            this.physics.add.existing(b, true);
            this.physics.add.collider(this.player, b);
            return b;
        };
        solid(400, 205, GAME_WIDTH, 410); // the building
        solid(160, 488, 64, 32); // the friends' table
        this.ourBlock = solid(480, 430, 80, 24); // their table, by the fountain
        solid(620, 468, 64, 32); // the older couple's table
        solid(740, 468, 64, 32); // the couple's table
        solid(250, 466, 16, 10); // heaters
        solid(640, 560, 16, 10);
        solid(770, 556, 20, 10); // the menu post
    }

    /** People at their tables, with things on the tables. Sitters behind, tabletop across their laps. */
    buildTables() {
        const table = (x, y, people, things, umbrella) => {
            people.forEach(([dx, key, tint]) => this.add.sprite(x + dx, y - 20, key).setTint(tint).setFlipX(dx > 0).setDepth(10));
            this.add.image(x, y, 'bistro_table').setDepth(11);
            things.forEach(([dx, key, scale]) => this.add.image(x + dx, y - 20, key).setScale(scale).setDepth(12));
            if (umbrella) this.add.image(x, y - 41, 'red_umbrella').setDepth(30);
        };
        table(160, 500, [[-14, 'civilian_f_sit', 0xd8d8e8], [14, 'civilian_f_sit', 0xf0c0c0]],
            [[-8, 'coffee', 0.35], [8, 'coffee', 0.35]], true);
        table(620, 480, [[-14, 'civilian_sit', 0xd0d0d0], [14, 'civilian_sit', 0xc8e0c8]],
            [[0, 'tartare_plate', 0.8]], false);
        table(740, 480, [[-14, 'civilian_sit', 0xe0e0e0], [14, 'civilian_f_sit', 0xf0d0c0]],
            [[-6, 'tartare_plate', 0.7], [10, 'chicha_morada', 0.8]], false);

        // Theirs, empty for now, with a chair either side: by the fountain under
        // the roof, high enough up the screen that the dialogue box, which covers
        // everything below y=439, never hides the food while they talk about it.
        this.ourTable = this.add.image(480, 438, 'bistro_table').setDepth(11);
        this.ourChairs = [
            this.add.image(450, 436, 'wood_chair').setDepth(10),
            this.add.image(510, 436, 'wood_chair').setFlipX(true).setDepth(10)
        ];
    }

    /**
     * Everything to look at and everyone to talk to, before they sit down.
     * Zones, all further apart than he is wide:
     *   the window x 80-240 y 410-430 · the wall fountain x 395-445 y 410-430
     *   the chalkboard x 560-640 y 410-430 · the server x 312-348 y 440-476
     *   the friends x 115-205 y 506-526 · the older couple x 580-660 y 490-510
     *   the couple x 705-775 y 490-510 · the menu post x 734-754 y 532-568
     */
    buildTalk() {
        this.zone(160, 420, 160, 20, this.chat([
            "A stone wall under a flood of bougainvillea, with framed photos of the dishes propped along the window.",
            "Yvy: 'That one's the causa. You're going to love it.'"
        ], "Photos of every dish, and petals on the sill."));
        this.zone(420, 420, 50, 20, this.chat([
            "A little fountain set into a tiled arch in the yellow wall, trickling away under the string lights."
        ], "The fountain trickles."));
        this.zone(600, 420, 80, 20, this.chat([
            "The chalkboard: OUR BEST DISHES down one side, SPECIALTY DRINKS down the other, and 'Authentic Peruvian Flavor' across the top.",
            "Mike: 'I don't know what half of these are.'",
            "Yvy: 'That's what I'm for.'"
        ], "The specials, in chalk."));
        this.zone(744, 550, 20, 36, this.chat([
            "A menu on a post by the sidewalk, pinned up in a bright yellow frame.",
            "Yvy: 'Don't read it. I already know what we're getting.'"
        ], "Yvy: 'Still not reading it.'"));
        this.zone(330, 458, 36, 36, () => this.sitDown());

        const friends = [
            { sprite: { x: 146, y: 480 }, talk: this.chat(["Diner: 'Get a table under an umbrella if you can. The bougainvillea drops petals in your drink.'"], "Diner: 'There's one in my coffee right now.'") },
            { sprite: { x: 174, y: 480 }, talk: this.chat(["Diner: 'We just came from a run. This is the reward.'"], "Diner: 'Worth every mile.'") }
        ];
        this.zone(160, 516, 90, 20, () => this.nearest(friends).talk());
        const older = [
            { sprite: { x: 606, y: 460 }, talk: this.chat(["Diner: 'Try the chicha morada. It's made from purple corn. It sounds strange and it's wonderful.'"], "Diner: 'Purple corn!'") },
            { sprite: { x: 634, y: 460 }, talk: this.chat(["Diner: 'It's easy to walk right past this place. That's the secret part.'"], "Diner: 'Don't tell anyone.'") }
        ];
        this.zone(620, 500, 80, 20, () => this.nearest(older).talk());
        const couple = [
            { sprite: { x: 726, y: 460 }, talk: this.chat(["Diner: 'He got the short rib, I got the salmon. We're swapping halfway.'"], "Diner: 'Halfway is now.'") },
            { sprite: { x: 754, y: 460 }, talk: this.chat(["Diner: 'You can hear that little fountain from every table. It's my favourite thing here.'"], "Diner: 'Listen. There it is.'") }
        ];
        this.zone(740, 500, 70, 20, () => this.nearest(couple).talk());
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
            this.player.body.reset(466, 418);
            this.yvy.setTexture('yvy_flower_sit').setPosition(494, 418).setDepth(10);
            this.tweens.add({
                targets: this.server, x: 534, y: 440, duration: 700, ease: 'Sine.easeInOut',
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
                targets: this.server, x: 534, y: 440, duration: 900, ease: 'Sine.easeInOut',
                onComplete: () => {
                    playSound('select');
                    this.causa = this.add.image(480, 416, 'causa_plate').setDepth(12);
                    this.drinks = [
                        this.add.image(460, 414, 'chicha_morada').setDepth(12),
                        this.add.image(500, 414, 'chicha_morada').setDepth(12)
                    ];
                    this.narrate([
                        "The causa came out as a neat little tower: yellow potato, a layer of avocado, a shrimp on top, and sauce dotted round the plate.",
                        "Yvy: 'First bite. Get a little of everything.'"
                    ], () => {
                        this.tweens.add({ targets: this.server, x: 306, y: 420, duration: 900 });
                        this.firstBite();
                    });
                }
            }))
        });
    }

    firstBite() {
        const fork = this.add.rectangle(472, 414, 2, 7, 0xd2d6da).setDepth(13);
        this.tweens.add({ targets: fork, y: 404, x: 468, duration: 400, yoyo: true, repeat: 1, onComplete: () => fork.destroy() });
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
        this.bulbs.forEach(b => b.setScale(1.4));
        this.cameras.main.setBackgroundColor('#e8a878');
        this.time.delayedCall(1200, () => this.narrate([
            "They stayed out on the patio until the string lights came on. And that was the end of the day.",
            "Yvy: 'Don't forget, tomorrow we're hiking Torrey Pines.'",
            "Mike: 'I'll be there. Early.'",
            "Yvy: 'Bring water. And snacks. And more water.'"
        ], () => {
            this.cameras.main.fadeOut(1200, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                stopMusic();
                this.scene.start('MisterAsScene');
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

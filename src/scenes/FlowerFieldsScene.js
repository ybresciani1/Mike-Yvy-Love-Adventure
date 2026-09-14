import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

// Row colours. Tint can only darken, so the flower heads are drawn white and
// every row takes its colour from here.
const ROWS = [0xff7eb3, 0xe8363a, 0xff8a3d, 0xffd93d, 0xffffff, 0xa45ad6, 0xd81b60, 0xff9e80];

// The three pictures, in the order they took them.
const SHOTS = ['fountain', 'chair', 'tractor'];

/** A row of flowers across a photograph. */
const strip = (y, offset = 0) => [-78, -52, -26, 0, 26, 52, 78].map((x, i) => ({
    texture: i % 2 ? 'flower_heads_b' : 'flower_heads_a', x, y, scale: 0.8, tint: ROWS[(i + offset) % ROWS.length]
}));

/**
 * The Flower Fields in Carlsbad. Yvy is waiting by the sign; they buy tickets
 * at the booth, the gate opens, and out in the rows there are three pictures to
 * take — the fountain, the giant green chair, the old tractor — each one by
 * asking somebody nearby to take it. Everybody else is out there taking
 * pictures too, and will talk.
 */
export class FlowerFieldsScene extends Phaser.Scene {
    constructor() { super('FlowerFieldsScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#8fc4e8');
        this.zones = [];
        this.phones = [];
        this.done = {};
        this.step = 'meet';
        this.busy = true;
        this.yvyFollow = false;

        this.buildSky();
        this.buildField();
        this.buildEntrance();
        this.buildProps();

        this.player = new Player(this, 40, 560);
        this.player.setTexture('mike_tank').setDepth(20);
        // A plain sprite, so she can be put wherever a picture needs her.
        this.yvy = this.add.sprite(360, 562, 'yvy_flower').setDepth(20);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.buildSolids();
        this.buildSpots();
        this.buildPeople();

        this.instructionText = this.add.text(20, 574, `Meet Yvy by the sign (${actionLabel()})`, {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(40);

        stopMusic();
        playLeFestinTheme();
        // Nothing starts until the opening line has been read.
        this.time.delayedCall(700, () => this.narrate([
            "Later in the visit, Mike met Yvy at the Flower Fields in Carlsbad: whole hillsides of ranunculus in stripes of every colour."
        ], () => { this.busy = false; }));
    }

    // --- helpers ----------------------------------------------------------------

    zone(x, y, w, h, when, act) {
        const z = this.add.rectangle(x, y, w, h, 0xffff00, 0);
        this.physics.add.existing(z, true);
        this.physics.add.overlap(this.player, z, () => {
            if (when() && !this.busy && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) act();
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

    nearest(people) {
        const distance = p => Math.abs(p.sprite.x - this.player.x) + Math.abs(p.sprite.y - this.player.y);
        return people.reduce((a, b) => (distance(a) <= distance(b) ? a : b));
    }

    /** Somebody out in the flowers, optionally with a phone held up. */
    person(x, y, key, tint, { flip = false, phone = false, bob = true } = {}) {
        const p = this.add.sprite(x, y, key).setTint(tint).setFlipX(flip).setDepth(8);
        if (bob) {
            this.tweens.add({ targets: p, y: y - 2, duration: 900 + (x + y) % 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        if (phone) this.phones.push({ p, img: this.add.image(x, y, 'phone_cam').setScale(0.8).setDepth(9) });
        return p;
    }

    // --- the place ----------------------------------------------------------------

    buildSky() {
        [[0x6fa8dc, 0, 50], [0x86b8e2, 50, 40], [0x9fc8ea, 90, 40], [0xb8d8f0, 130, 30]]
            .forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));
        [[120, 40, 1], [460, 26, 1.3], [700, 62, 0.9]].forEach(([x, y, s]) => this.add.image(x, y, 'cloud').setScale(s).setAlpha(0.9));
        this.add.rectangle(400, 152, GAME_WIDTH, 24, 0x7aa05a); // the hill
        [[90, 130], [260, 134], [560, 128], [730, 132]].forEach(([x, y]) => this.add.image(x, y, 'hillside_hotel'));
        [40, 176, 340, 410, 480, 650, 780].forEach((x, i) => this.add.image(x, 110 + (i % 2) * 6, 'palm_tree').setScale(0.45));
        this.add.image(730, 168, 'green_tractor').setScale(0.5); // working the far rows
    }

    buildField() {
        this.add.rectangle(400, 316, GAME_WIDTH, 304, 0x4f8a34); // the leaves under the rows
        for (let r = 0; 164 + r * 24 < 464; r++) {
            const y = 176 + r * 24;
            this.add.rectangle(400, y + 10, GAME_WIDTH, 3, 0x3e7028); // furrow
            for (let x = 10; x < GAME_WIDTH + 20; x += 30) {
                this.add.image(x + (r % 2) * 12, y, (x / 30 + r) % 2 < 1 ? 'flower_heads_a' : 'flower_heads_b')
                    .setTint(ROWS[r % ROWS.length]).setScale(1, 0.8);
            }
        }
        // Dirt paths: one up from the gate, one across, and clearings at the sights.
        this.add.rectangle(400, 316, 40, 304, 0xc9a877);
        this.add.rectangle(400, 312, GAME_WIDTH, 26, 0xc9a877);
        this.add.ellipse(170, 276, 180, 76, 0xc9a877);
        this.add.ellipse(636, 442, 190, 56, 0xc9a877);
        this.add.ellipse(200, 438, 120, 40, 0xc9a877);
    }

    buildEntrance() {
        this.add.rectangle(400, 536, GAME_WIDTH, 136, 0xd8c4a0); // the forecourt
        for (let x = 20; x < GAME_WIDTH; x += 40) this.add.rectangle(x, 536, 1, 136, 0xcab38c);
        for (let x = 16; x < GAME_WIDTH; x += 32) {
            if (x < 368 || x > 432) this.add.image(x, 470, 'picket_fence').setDepth(3);
        }
        this.gate = this.add.image(400, 470, 'picket_fence').setScale(1.5, 1).setDepth(3);
        [372, 428].forEach(x => this.add.rectangle(x, 468, 5, 28, 0xf4f4f4).setDepth(3));

        // The sign in its bed of daisies, with buckets of cut flowers along the top.
        this.add.ellipse(230, 548, 236, 78, 0x5a8a3a);
        for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2;
            this.add.image(230 + Math.cos(a) * 90, 548 + Math.sin(a) * 26, i % 3 ? 'flower_heads_a' : 'flower_heads_b')
                .setTint(i % 4 ? 0xffd93d : 0xffffff).setScale(0.8);
        }
        [0xff7eb3, 0xffd93d, 0xe8363a, 0xff8a3d, 0xffd93d, 0xd81b60, 0xffffff].forEach((tint, i) => {
            const bx = 164 + i * 22;
            this.add.rectangle(bx, 530, 12, 10, 0x8a8f96);
            this.add.image(bx, 520, 'flower_heads_a').setTint(tint).setScale(0.5);
        });
        this.add.rectangle(230, 554, 156, 30, 0x2f3a40);
        this.add.rectangle(230, 554, 150, 24, 0xfafafa);
        this.add.text(230, 554, 'The Flower Fields', {
            fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '15px', color: '#1b1f2a'
        }).setOrigin(0.5);

        // The ticket booth, with somebody selling in it.
        this.add.image(620, 540, 'ticket_booth').setScale(1.3).setDepth(4);
        this.add.sprite(620, 554, 'civilian_f').setTint(0xf0d0c0).setDepth(5);
        this.add.image(620, 570, 'ticket_booth_front').setScale(1.3).setDepth(6);
        this.add.text(620, 502, 'TICKETS', { fontSize: '9px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(7);
    }

    /** The fountain, the giant chair, and both tractors. */
    buildProps() {
        this.add.image(170, 236, 'flower_fountain').setScale(1.2).setDepth(5);
        const ripple = this.add.ellipse(170, 238, 22, 6).setStrokeStyle(1, 0xd8f0fa, 0.9).setDepth(6);
        this.tweens.add({ targets: ripple, scaleX: 2.4, scaleY: 2.4, alpha: 0, duration: 1600, repeat: -1 });

        this.add.image(620, 230, 'giant_chair').setScale(1.5).setDepth(5);

        this.add.image(640, 420, 'vintage_tractor').setScale(1.4).setDepth(5);
        const windmill = this.add.image(599, 384, 'windmill_wheel').setScale(1.4).setDepth(5.5);
        this.tweens.add({ targets: windmill, angle: 360, duration: 6000, repeat: -1 });

        this.add.image(200, 424, 'green_tractor').setScale(1.3).setDepth(5);
    }

    buildSolids() {
        const solid = (x, y, w, h) => {
            const b = this.add.rectangle(x, y, w, h, 0, 0);
            this.physics.add.existing(b, true);
            this.physics.add.collider(this.player, b);
            return b;
        };
        solid(400, 80, GAME_WIDTH, 160); // the sky and the hill
        solid(184, 470, 368, 16); // the fence either side of the gate
        solid(616, 470, 368, 16);
        this.gateBlock = solid(400, 470, 64, 16);
        solid(230, 550, 200, 50); // the sign's flower bed
        solid(620, 550, 84, 60); // the booth
        solid(170, 262, 96, 30); // the fountain's basin
        this.chairBlock = solid(620, 262, 96, 50);
        this.tractorBlock = solid(640, 432, 100, 40);
        solid(200, 430, 70, 30); // the green tractor
    }

    // --- the three pictures ---------------------------------------------------------

    /**
     * Each sight has a zone in front of it for looking, and a photographer
     * nearby to ask. Zones, all further apart than he is wide:
     *   fountain x 120-220 y 280-304 · its photographer x 215-265 y 356-396
     *   chair    x 570-670 y 296-316 · the family by it x 468-544 y 334-378
     *   tractor  x 555-585 y 408-452 · its photographer x 485-535 y 426-466
     */
    buildSpots() {
        this.tractorFriend = this.add.sprite(611, 396, 'civilian_f_sit').setTint(0xd8c8f0).setDepth(6);
        this.spots = {
            fountain: {
                where: 'at the fountain',
                look: this.chat([
                    "A stone fountain out in the flowers, lions round the basin, and this one has water in it.",
                    "Yvy: 'It's like the one at Raised by Wolves! Except this one works.'"
                ], "The water keeps sparkling."),
                memory: "Yvy: 'That one's going to look so good.'",
                ask: [
                    "Mike: 'Excuse me, would you mind taking one of us by the fountain?'",
                    "Photographer: 'Of course! Jess, take five. Okay, you two, get in close.'"
                ],
                after: ["Photographer: 'Got it. The water's sparkling right behind you.'", "Yvy: 'Thank you so much!'"],
                shootAt: [170, 350],
                enter: () => {
                    this.player.body.reset(156, 292);
                    this.player.setFlipX(false);
                    this.yvy.setPosition(184, 292).setFlipX(true);
                },
                leave: () => {},
                shoot: () => takePhoto({
                    key: 'fountain', title: 'The Flower Fields',
                    caption: "By the fountain in the flowers. This one has water in it.",
                    window: 0x9fc8ea,
                    sprites: [
                        { rect: [180, 34], x: 0, y: 26, color: 0x4f8a34 },
                        ...strip(20),
                        { texture: 'flower_fountain', x: 0, y: -6, scale: 0.9 },
                        { texture: 'mike_tank', x: -14, y: 14 },
                        { texture: 'yvy_flower', x: 14, y: 14 },
                        ...strip(36, 3)
                    ]
                })
            },
            chair: {
                where: 'in the big green chair',
                look: this.chat([
                    "A giant green chair out in the middle of the rows, big enough for a whole family.",
                    "Yvy: 'We have to get one in that.'"
                ], "The big green chair is waiting."),
                memory: "Yvy: 'I felt about four years old in that chair.'",
                ask: [
                    "Mike: 'Sorry to bother you. Could you take one of us in the chair?'",
                    "Dad: 'Finally, someone who'll look at the camera. Hop up!'"
                ],
                after: ["Dad: 'Beautiful. You two look tiny up there.'", "Mike: 'Thank you!'"],
                shootAt: [620, 350],
                enter: () => {
                    this.chairBlock.body.enable = false;
                    this.player.setTexture('mike_tank_sit').setDepth(21);
                    this.player.body.reset(606, 244);
                    this.yvy.setTexture('yvy_flower_sit').setPosition(634, 244).setDepth(21);
                },
                leave: () => {
                    this.player.setTexture('mike_tank').setDepth(20);
                    this.player.body.reset(596, 326);
                    this.yvy.setTexture('yvy_flower').setPosition(626, 326).setDepth(20);
                    this.chairBlock.body.enable = true;
                },
                shoot: () => takePhoto({
                    key: 'bigchair', title: 'The big green chair',
                    caption: "The two of them in the giant green chair, flowers in every direction.",
                    window: 0x9fc8ea,
                    sprites: [
                        { rect: [180, 34], x: 0, y: 26, color: 0x4f8a34 },
                        ...strip(18, 2),
                        { texture: 'giant_chair', x: 0, y: 0, scale: 0.9 },
                        { texture: 'mike_tank_sit', x: -10, y: 6 },
                        { texture: 'yvy_flower_sit', x: 10, y: 6 },
                        ...strip(36, 5)
                    ]
                })
            },
            tractor: {
                where: 'on the old tractor',
                look: this.chat([
                    "An old rusty tractor parked in the flowers, a little windmill turning on the back.",
                    "Friend (up on the seat): 'I've been up here ten minutes. I think I live on this tractor now.'"
                ], "Friend: 'Still up here.'"),
                memory: "Yvy: 'The windmill got in the picture. Perfect.'",
                ask: [
                    "Mike: 'Hi! When your friend's done, could you take one of us on the tractor?'",
                    "Friend: 'Oh, take my seat, I need to feel my legs again.'",
                    "Photographer: 'Up you get! I'll count you in.'"
                ],
                after: ["Photographer: 'Three, two, one... got it! The windmill even turned for you.'", "Yvy: 'Thank you! Your turn again!'"],
                shootAt: [548, 440],
                enter: () => {
                    this.tractorBlock.body.enable = false;
                    this.tractorFriend.setTexture('civilian_f').setPosition(716, 424);
                    this.yvy.setTexture('yvy_flower_sit').setPosition(611, 396).setDepth(21);
                    this.player.body.reset(586, 400);
                    this.player.setFlipX(false).setDepth(21);
                },
                leave: () => {
                    this.player.body.reset(560, 440);
                    this.player.setDepth(20);
                    this.yvy.setTexture('yvy_flower').setPosition(588, 444).setDepth(20);
                    this.tractorFriend.setTexture('civilian_f_sit').setPosition(611, 396);
                    this.tractorBlock.body.enable = true;
                },
                shoot: () => takePhoto({
                    key: 'tractor', title: 'The old tractor',
                    caption: "Yvy up on the old tractor, Mike beside her, the windmill turning behind.",
                    window: 0x9fc8ea,
                    sprites: [
                        { rect: [180, 34], x: 0, y: 26, color: 0x4f8a34 },
                        ...strip(18, 4),
                        { texture: 'vintage_tractor', x: 6, y: 6, scale: 1.1 },
                        { texture: 'windmill_wheel', x: -26, y: -23, scale: 1.1 },
                        { texture: 'yvy_flower_sit', x: -17, y: -14 },
                        { texture: 'mike_tank', x: -44, y: 10 },
                        ...strip(36, 1)
                    ]
                })
            }
        };
        const always = () => true;
        this.zone(170, 292, 100, 24, always, () => this.lookAt('fountain'));
        this.zone(620, 306, 100, 20, always, () => this.lookAt('chair'));
        this.zone(570, 430, 30, 44, always, () => this.lookAt('tractor'));
    }

    lookAt(key) {
        const spot = this.spots[key];
        if (this.done[key]) return showDialogue(spot.memory);
        if (this.step === key) return showDialogue("Yvy: 'We need someone to take this one. Let's ask somebody nearby.'");
        spot.look();
    }

    /** A group around a photographer: the one to ask when it is that sight's turn. */
    helperZone(x, y, w, h, key, photographer, people) {
        this.spots[key].helper = photographer;
        this.zone(x, y, w, h, () => true, () => {
            if (this.step === key && !this.done[key]) return this.askForPhoto(key);
            this.nearest(people).talk();
        });
    }

    askForPhoto(key) {
        const spot = this.spots[key];
        const helper = spot.helper;
        this.busy = true;
        this.player.isLocked = true;
        this.yvyFollow = false;
        this.instructionText.setText('Smile');
        this.narrate(spot.ask, () => {
            spot.enter();
            const home = { x: helper.x, y: helper.y, flip: helper.flipX };
            this.tweens.add({
                targets: helper, x: spot.shootAt[0], y: spot.shootAt[1], duration: 600, ease: 'Sine.easeInOut',
                onComplete: () => this.time.delayedCall(600, () => {
                    this.cameras.main.flash(250, 255, 255, 255);
                    spot.shoot();
                    this.narrate(spot.after, () => {
                        spot.leave();
                        this.tweens.add({
                            targets: helper, x: home.x, y: home.y, duration: 600, ease: 'Sine.easeInOut',
                            onComplete: () => helper.setFlipX(home.flip)
                        });
                        this.done[key] = true;
                        this.busy = false;
                        this.player.isLocked = false;
                        this.yvyFollow = true;
                        this.nextShot();
                    });
                })
            });
        });
    }

    nextShot() {
        const next = SHOTS.find(k => !this.done[k]);
        if (next) {
            this.step = next;
            this.instructionText.setText(`Ask someone to take your picture ${this.spots[next].where} (${actionLabel()})`);
            return;
        }
        this.step = 'done';
        this.instructionText.setText('');
        this.busy = true;
        this.player.isLocked = true;
        this.time.delayedCall(700, () => this.narrate([
            "They walked every path until the light went gold over the rows, taking pictures of each other the whole way.",
            "Yvy: 'Best day.'",
            "Mike: 'So far.'"
        ], () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                stopMusic();
                this.scene.start('MisterAsScene');
            });
        }));
    }

    // --- the story at the gate ---------------------------------------------------------

    meetYvy() {
        this.busy = true;
        this.narrate([
            "Yvy was waiting by the sign in a pink sweater, light blue leggings, pink Converse, and a pink hat covered in glitter.",
            "Yvy: 'Mike! Do you like my hat? It sparkles.'",
            "Mike: 'It's very sparkly. You look great.'",
            "Yvy: 'And you came in a tank top. Very ready for the sun.'"
        ], () => {
            this.step = 'tickets';
            this.busy = false;
            this.yvyFollow = true;
            this.instructionText.setText(`Buy tickets at the booth (${actionLabel()})`);
        });
    }

    buyTickets() {
        if (this.step === 'meet') return showDialogue("Mike: 'Yvy first. She said she'd be by the sign.'");
        if (this.step !== 'tickets') return showDialogue("Seller: 'Enjoy the fields! Ask anybody to take your picture. Everybody's doing it.'");
        this.busy = true;
        this.narrate([
            "Seller: 'Hi there! Two for the fields?'",
            "Mike: 'Two, please.'",
            "Seller: 'Here you go. The fountain's running today, and everybody wants the big green chair and the old tractor.'",
            "Seller: 'Ask anybody to take your picture. Everybody's doing it.'"
        ], () => {
            playSound('select');
            this.gateBlock.body.enable = false;
            this.tweens.add({ targets: this.gate, scaleX: 0.15, x: 378, duration: 500, ease: 'Sine.easeOut' });
            this.busy = false;
            this.nextShot();
        });
    }

    // --- everybody else -------------------------------------------------------------

    /**
     * The other visitors, most of them taking pictures. Zones beyond the sights'
     * (see buildSpots), again all further apart than he is wide:
     *   Yvy x 335-385 y 544-588 · the booth x 545-575 y 525-575 · the gate x 370-430 y 484-508
     *   the sign x 180-280 y 496-516 · the pair by the sign x 458-518 y 544-588
     *   Jess x 247-277 y 275-305 · the flower photographer x 275-325 y 196-232
     *   the selfie couple x 447-517 y 212-248 · the tractor driver x 140-164 y 410-450
     * The two people walking the paths are moving, so update() finds them by distance.
     */
    buildPeople() {
        const always = () => true;
        this.zone(360, 566, 50, 44, () => this.step === 'meet', () => this.meetYvy());
        this.zone(560, 550, 30, 50, always, () => this.buyTickets());
        this.zone(400, 496, 60, 24, always, () => showDialogue(this.step === 'meet' || this.step === 'tickets'
            ? "Attendant: 'Tickets first, at the booth over there!'"
            : "Attendant: 'Enjoy the fields! Watch your step between the rows.'"));
        this.add.sprite(450, 494, 'civilian').setTint(0xc8e0c0).setDepth(8);
        this.zone(230, 506, 100, 20, always, this.chat([
            "The Flower Fields, Carlsbad. Buckets of cut ranunculus in every colour line up along the sign."
        ], "The Flower Fields."));

        const pairBy = [
            { sprite: this.person(470, 566, 'civilian', 0xd8c8b0, { phone: true, bob: false }),
              talk: this.chat(["Visitor: 'One by the sign first. You always have to do one by the sign.'"], "Visitor: 'Now one with the buckets.'") },
            { sprite: this.person(506, 548, 'civilian_f', 0xe8c8e0),
              talk: this.chat(["Visitor: 'My face hurts from smiling and we haven't even gone in yet.'"], "Visitor: 'Still smiling.'") }
        ];
        this.zone(488, 566, 60, 44, always, () => this.nearest(pairBy).talk());

        // At the fountain: a photographer and Jess, who has been posing a while.
        const fountainPhotographer = this.person(240, 368, 'civilian_f', 0xe8d0b0, { flip: true, phone: true, bob: false });
        this.helperZone(240, 376, 50, 40, 'fountain', fountainPhotographer, [{
            sprite: fountainPhotographer,
            talk: this.chat(["Photographer: 'Jess, chin up. No, the other up. Perfect. Do it again.'"], "Photographer: 'Forty-one.'")
        }]);
        this.person(262, 282, 'civilian_f', 0xc8e0f0);
        this.zone(262, 290, 30, 30, always, this.chat([
            "Jess: 'She's taken forty of these. Forty. The fountain is in every single one.'"
        ], "Jess: 'Forty-one.'"));

        // By the chair: a family who have just had their turn in it.
        const dad = this.person(520, 352, 'civilian', 0xd0c0e8, { phone: true, bob: false });
        this.helperZone(506, 356, 76, 44, 'chair', dad, [
            { sprite: dad, talk: this.chat(["Dad: 'Everybody look at me! ...Nobody is looking at me.'"], "Dad: 'One more. Then we're done. One more.'") },
            { sprite: this.person(492, 344, 'civilian_f', 0xf0c8c8),
              talk: this.chat(["Mom: 'We do the chair every spring. Same pose every year, so you can see how much we've changed.'"], "Mom: 'He's changed. I haven't.'") }
        ]);

        // By the tractor: a photographer, and her friend up on the seat.
        const tractorPhotographer = this.person(520, 440, 'civilian_f', 0xf8e8b0, { phone: true, bob: false });
        this.helperZone(510, 446, 50, 40, 'tractor', tractorPhotographer, [{
            sprite: tractorPhotographer,
            talk: this.chat(["Photographer: 'Look at the windmill! Now look at me! Now the windmill again!'"], "Photographer: 'Okay, now the flowers!'")
        }]);

        // Out in the rows.
        this.person(300, 206, 'civilian', 0xc0d8c0, { phone: true });
        this.zone(300, 214, 50, 36, always, this.chat([
            "Visitor: 'I'm getting one flower. Just one, perfectly in focus.'",
            "Visitor: 'Don't breathe on it.'"
        ], "Visitor: 'Almost. Almost.'"));
        const selfie = [
            { sprite: this.person(470, 222, 'civilian', 0xe0c0a0, { phone: true, flip: true }),
              talk: this.chat(["Visitor: 'Rows behind us, sky over us, both of us in the frame. It only took twelve tries.'"], "Visitor: 'Thirteen now.'") },
            { sprite: this.person(494, 222, 'civilian_f', 0xd0d8f0),
              talk: this.chat(["Visitor: 'His arm isn't long enough. It has never been long enough.'"], "Visitor: 'Still not long enough.'") }
        ];
        this.zone(482, 230, 70, 36, always, () => this.nearest(selfie).talk());

        this.add.sprite(182, 412, 'civilian_sit').setTint(0xb0c0d0).setDepth(6);
        this.zone(152, 430, 24, 40, always, this.chat([
            "Driver: 'Wagon rides go all the way round the field, past every colour they grow.'"
        ], "Driver: 'Next ride's in a bit.'"));

        this.walkers = [
            [260, 306, 540, 306, 'civilian', 0xe0d0b0, "Visitor: 'They're called ranunculus. I had to ask. Everybody has to ask.'", "Visitor: 'Ranunculus.'"],
            [412, 196, 412, 430, 'civilian_f', 0xd0e0f0, "Visitor: 'I've walked every row twice looking for the perfect one. They're all the perfect one.'", "Visitor: 'Still looking.'"]
        ].map(([x0, y0, x1, y1, key, tint, line, again], i) => {
            const w = this.person(x0, y0, key, tint, { bob: false });
            this.tweens.add({
                targets: w, x: x1, y: y1, duration: 9000 + i * 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                onYoyo: () => w.setFlipX(!w.flipX), onRepeat: () => w.setFlipX(!w.flipX)
            });
            return { sprite: w, talk: this.chat([line], again) };
        });
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
        this.phones.forEach(({ p, img }) => img.setPosition(p.x + (p.flipX ? -9 : 9), p.y - 5));
        const near = !this.busy && this.zones.some(({ z, when }) => when() && this.physics.overlap(this.player, z));
        // The two walking the paths are moving targets, caught by distance, and
        // only when no zone wants the keypress (scene update runs before physics).
        const walker = !near && !this.busy && this.walkers.find(w =>
            Phaser.Math.Distance.Between(this.player.x, this.player.y, w.sprite.x, w.sprite.y) < 36);
        if (walker && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) walker.talk();
        document.getElementById('interaction-hint').style.display = (near || walker) ? 'block' : 'none';
    }
}

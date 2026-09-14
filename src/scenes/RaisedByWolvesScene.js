import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

/**
 * Raised by Wolves, in an outdoor mall: a blue shopfront with stone wolves at
 * the door, and a shop inside that looks like a very expensive liquor store.
 * The host sits you in two armchairs by a cold fireplace — and then the whole
 * wall turns round and takes you into the bar.
 *
 * Outside and inside are two containers in one scene; walking through the door
 * swaps them. The fireplace nook is its own container built around its centre,
 * so it can swing on a pivot, and the side that comes round is a second one.
 */
export class RaisedByWolvesScene extends Phaser.Scene {
    constructor() { super('RaisedByWolvesScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#d8d0c0');
        this.outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.stage = 'outside';
        this.zones = [];

        this.outside = this.add.container(0, 0);
        this.buildOutside();
        this.inside = this.add.container(0, 0).setVisible(false);
        this.buildInside();

        this.player = new Player(this, 300, 540);
        this.player.setTexture(this.outfit).setDepth(20);
        // Yvy is a plain sprite so she can be tweened: an arcade body writes its
        // own position back every step and quietly undoes a tween.
        this.yvy = this.add.sprite(470, 400, 'yvy_red').setDepth(20);

        this.outsideWall = this.solid(400, 170, GAME_WIDTH, 340);
        // Everything inside is solid only once you are inside.
        this.insideSolids = [
            this.solid(400, 118, GAME_WIDTH, 236), // the back wall
            this.solid(140, 332, 184, 40), // the long counter
            this.solid(507, 494, 146, 44), // the two cabinets out on the floor
            this.solid(624, 504, 50, 36), // the round case
            this.solid(720, 500, 70, 40) // the hutch
        ];
        this.insideSolids.forEach(b => { b.body.enable = false; });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Zones are gated on which room is showing, so the door and the host can
        // share screen space without sharing a keypress.
        this.zone(470, 414, 76, 60, () => this.stage === 'outside' && !this.met, () => this.meetYvy());
        this.zone(400, 356, 110, 34, () => this.stage === 'outside' && this.met, () => this.goInside());
        this.zone(300, 380, 96, 56, () => this.stage === 'inside', () => this.talkToHost());
        this.zone(240, 262, 150, 40, () => this.stage === 'inside',
            () => showDialogue("Bottles behind glass, lit like jewellery. Nobody seems to be buying any."));
        this.buildCrowd();

        this.instructionText = this.add.text(20, 560, `Meet Yvy (${actionLabel()})`, {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(40).setScrollFactor(0);

        stopMusic();
        playLeFestinTheme();
        // Nothing can be started until the opening line has been read: the line
        // is scheduled, so a quick player could otherwise reach Yvy first and
        // have the scene set after they have already said hello.
        this.busy = true;
        this.time.delayedCall(700, () => this.narrate(
            ["Back in San Diego, Mike met Yvy at Raised by Wolves: a blue shopfront in an outdoor mall, with two stone wolves at the door."],
            () => { this.busy = false; }
        ));
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

    T(c, x, y, text, style) {
        const t = this.add.text(x, y, text, style).setOrigin(0.5);
        c.add(t);
        return t;
    }

    solid(x, y, w, h) {
        const b = this.add.rectangle(x, y, w, h, 0, 0);
        this.physics.add.existing(b, true);
        this.physics.add.collider(this.player, b);
        return b;
    }

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

    /** Walk him somewhere. A tween on an arcade body's x/y is undone by the body. */
    stepTo(x, y, duration) {
        const fromX = this.player.x, fromY = this.player.y;
        const c = { t: 0 };
        this.tweens.add({
            targets: c, t: 1, duration, ease: 'Sine.easeInOut',
            onUpdate: () => this.player.body.reset(
                Phaser.Math.Linear(fromX, x, c.t),
                Phaser.Math.Linear(fromY, y, c.t)
            )
        });
    }

    // --- outside: the shopfront in the outdoor mall ----------------------------

    buildOutside() {
        const c = this.outside;
        this.R(c, 400, 170, GAME_WIDTH, 340, 0xd8d0c0); // the mall's limestone
        for (let y = 14; y < 340; y += 26) this.R(c, 400, y, GAME_WIDTH, 1, 0xc6bdaa);
        for (let x = 0; x < GAME_WIDTH; x += 64) this.R(c, x, 170, 1, 340, 0xcbc2b0);

        // The shopfront: deep blue and panelled, the name cut into marble.
        this.R(c, 400, 190, 700, 300, 0x1f2d5c);
        this.R(c, 400, 190, 686, 286, 0x26386e);
        this.R(c, 400, 62, 460, 64, 0x1a2650);
        this.R(c, 400, 62, 444, 50, 0xeceff1);
        [[210, 44, 60], [300, 72, 44], [420, 50, 70], [520, 76, 38], [590, 46, 30]].forEach(([vx, vy, vw]) => {
            this.R(c, vx, vy, vw, 1, 0xc3c9cf);
        });
        this.T(c, 400, 62, 'RAISED BY WOLVES', {
            fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '26px', color: '#1b1f2a'
        });
        this.I(c, 400, 116, 'wolf_relief', 2.1);
        [215, 585].forEach(x => {
            this.R(c, x, 116, 118, 30, 0x1a2650);
            this.R(c, x, 116, 108, 22, 0x2e4178);
        });

        this.I(c, 215, 252, 'leaded_window', 1.2);
        this.I(c, 585, 252, 'leaded_window', 1.2);
        this.I(c, 100, 250, 'wolf_oval_window', 1.3).setFlipX(true);
        this.I(c, 700, 250, 'wolf_oval_window', 1.3);

        // The doors, thrown open, and the shop you can see through them.
        this.R(c, 400, 258, 136, 164, 0x111317);
        for (let tx = 340; tx < 464; tx += 16) {
            for (let ty = 300; ty < 340; ty += 16) this.I(c, tx, ty, 'bw_marble_tile', 0.5);
        }
        this.I(c, 358, 236, 'liquor_cabinet', 0.75).setTint(0xb8b0a8);
        this.I(c, 442, 236, 'liquor_cabinet', 0.75).setTint(0xb8b0a8);
        this.I(c, 400, 230, 'liquor_cabinet', 0.9);
        [326, 474].forEach(x => {
            this.R(c, x, 258, 18, 164, 0xc9a86a);
            this.R(c, x, 258, 10, 152, 0x9fb4c0);
        });

        // Lanterns between the doors and the windows.
        [288, 512].forEach(x => {
            c.add(this.add.circle(x, 196, 26, 0xffd27a, 0.18));
            this.I(c, x, 196, 'wall_lantern', 1.4);
        });

        // The walkway, then the step and the wolves sitting on it.
        for (let y = 356; y < GAME_HEIGHT + 16; y += 32) {
            for (let x = 16; x < GAME_WIDTH + 16; x += 32) this.I(c, x, y, 'sidewalk_slab');
        }
        this.R(c, 400, 344, GAME_WIDTH, 8, 0x9c9486);
        this.R(c, 400, 340, 150, 10, 0x2b2b30);
        this.T(c, 400, 340, 'RAISED BY WOLVES', { fontFamily: 'Georgia, serif', fontSize: '7px', color: '#d6d6d6' });
        this.I(c, 316, 322, 'wolf_statue', 1.4);
        this.I(c, 484, 322, 'wolf_statue', 1.4).setFlipX(true);
        this.I(c, 50, 480, 'palm_tree', 0.9);
        this.I(c, 752, 486, 'palm_tree', 0.85).setFlipX(true);

        // Shoppers going by.
        // It is busy: a few people waiting to get in.
        [[252, 384, 'civilian_f', 0xe0c8d8], [224, 392, 'civilian', 0xc8d8b8], [196, 386, 'civilian', 0xd0d0e8],
         [168, 392, 'civilian_f', 0xe8d8b8], [566, 390, 'civilian', 0xc0b8d0], [594, 384, 'civilian_f', 0xd8e0e8]]
            .forEach(([x, y, key, tint], i) => {
                const waiting = this.add.sprite(x, y, key).setTint(tint).setFlipX(i % 2 === 0);
                c.add(waiting);
                this.tweens.add({ targets: waiting, y: y - 2, duration: 1100 + i * 170, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            });
        [[-40, 840, 578, 'civilian', 0xb8c8d8, 14000], [840, -40, 596, 'civilian_f', 0xd8c0b0, 17000]]
            .forEach(([x0, x1, y, key, tint, duration]) => {
                const shopper = this.add.sprite(x0, y, key).setTint(tint).setFlipX(x1 < x0);
                c.add(shopper);
                this.tweens.add({ targets: shopper, x: x1, duration, repeat: -1, delay: 1200 });
            });
    }

    // --- inside: the liquor store that isn't ----------------------------------

    buildInside() {
        const c = this.inside;
        // The painted landscape all the way round, above wooden panelling.
        this.R(c, 400, 118, GAME_WIDTH, 236, 0xcfd9cf);
        [120, 360, 600].forEach(x => this.I(c, x, 112, 'landscape_mural', 2));
        this.R(c, 400, 12, GAME_WIDTH, 24, 0xf2efe6); // cornice
        for (let x = 4; x < GAME_WIDTH; x += 8) this.R(c, x, 22, 4, 4, 0xdcd6c8);
        this.R(c, 400, 212, GAME_WIDTH, 48, 0x7a5232);
        this.R(c, 400, 190, GAME_WIDTH, 3, 0xf2efe6);
        for (let x = 16; x < GAME_WIDTH; x += 56) this.R(c, x + 12, 214, 40, 34, 0x8a6240);
        this.I(c, 270, 34, 'lantern_chandelier', 1.3);
        c.add(this.add.circle(270, 52, 42, 0xffc46a, 0.12));

        // Plaster pilasters dividing the wall into bays, globe lamps on them.
        [12, 184, 356, 528].forEach(x => this.I(c, x, 118, 'plaster_pilaster', 1.6));
        [184, 356].forEach(x => {
            c.add(this.add.circle(x - 22, 64, 12, 0xfff3c4, 0.25));
            this.I(c, x - 22, 70, 'globe_sconce', 1.2);
        });

        // Bay one: bottles on gold shelves over wooden cupboards.
        this.I(c, 98, 150, 'gold_shelf_wall', 1.4);
        // Bay two: a hanging glass cabinet between two carved niches, one bottle each.
        this.I(c, 270, 96, 'wall_bottle_cabinet', 1.6);
        this.I(c, 218, 118, 'bottle_niche', 1.3);
        this.I(c, 322, 118, 'bottle_niche', 1.3);
        // Bay three: the carved mirror with the gold wolf, a velvet bench, a case.
        this.I(c, 442, 112, 'oval_mirror_frame', 1.5);
        this.I(c, 418, 222, 'velvet_bench', 1.2);
        this.I(c, 492, 222, 'glass_display_cabinet', 1.1);

        // Black and white marble, and the name set into it at the door.
        for (let y = 252; y < GAME_HEIGHT + 16; y += 32) {
            for (let x = 16; x < GAME_WIDTH + 16; x += 32) this.I(c, x, y, 'bw_marble_tile');
        }
        this.R(c, 400, 566, 190, 36, 0xeceff1);
        this.T(c, 400, 566, 'RAISED BY WOLVES', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#6a6a72' });

        // The long oak counter with the till and the telephone on it.
        this.I(c, 140, 330, 'shop_counter', 1.5);
        this.I(c, 170, 298, 'cash_register', 1.3);
        this.I(c, 88, 304, 'rotary_phone', 1.2);
        // Cabinets and cases out on the floor.
        this.I(c, 470, 460, 'liquor_cabinet', 1.2);
        this.I(c, 544, 460, 'liquor_cabinet', 1.2);
        this.I(c, 624, 480, 'display_case_round', 1.3);
        this.I(c, 720, 470, 'bottle_hutch', 1.4);
        this.I(c, 770, 556, 'egyptian_chair', 1.2);

        this.host = this.add.sprite(300, 346, 'host');
        c.add(this.host);
        this.I(c, 300, 372, 'host_stand', 1.2);

        this.nook = this.buildNook(false);
        this.barSide = this.buildNook(true).setScale(0, 1).setVisible(false);
        c.add(this.nook);
        c.add(this.barSide);
    }

    /**
     * It is busy - it always is. People browsing every bay, a couple waiting on
     * the host, and a few who will tell you something if you ask. Their zones are
     * kept clear of the host's and the cabinet's, since overlapping zones share
     * one keypress.
     */
    buildCrowd() {
        const c = this.inside;
        const TINTS = [0xb8c8d8, 0xd8c0b0, 0xc8d8b8, 0xe0c8d8, 0xd0d0e8, 0xe8d8b8, 0xc0b8d0, 0xd8e0e8];
        [
            [62, 262, 'civilian_f', false, "Patron: 'We've been in here twenty minutes and I still don't know if it's a bar.'"],
            [124, 268, 'civilian', true],
            [110, 396, 'civilian', false],
            [170, 400, 'civilian_f', true, "Patron: 'The host said forty-five minutes. For a liquor store.'"],
            [404, 262, 'civilian', false],
            [462, 258, 'civilian_f', true],
            [206, 452, 'civilian_f', false],
            [232, 458, 'civilian', true],
            [470, 548, 'civilian_f', false, "Patron: 'My friend swears there's a secret room in here. She won't tell me where.'"],
            [520, 552, 'civilian', true],
            [596, 556, 'civilian', false],
            [766, 384, 'civilian_f', true, "Patron: 'Don't sit in those armchairs unless someone tells you to. Trust me.'"],
            [80, 520, 'civilian', false],
            [132, 536, 'civilian_f', true],
            [690, 560, 'civilian_f', false]
        ].forEach(([x, y, key, flip, line], i) => {
            const person = this.add.sprite(x, y, key).setTint(TINTS[i % TINTS.length]).setFlipX(flip);
            c.add(person);
            this.tweens.add({
                targets: person, y: y - 2, duration: 1000 + (i * 137) % 900,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: (i * 211) % 700
            });
            // Browsing: every so often somebody turns to look at something else.
            if (i % 3 === 0) {
                this.time.addEvent({ delay: 2200 + i * 190, loop: true, callback: () => person.setFlipX(!person.flipX) });
            }
            if (line) this.zone(x, y + 14, 46, 44, () => this.stage === 'inside', () => showDialogue(line));
        });
    }

    /**
     * The wall that turns — fireplace, platform and both armchairs — built round
     * its own centre so it can swing. The bar side is the same wall seen from
     * the room on the other side of it.
     */
    buildNook(barSide) {
        const n = this.add.container(640, 180);
        const add = o => { n.add(o); return o; };
        if (!barSide) {
            add(this.add.image(0, -40, 'fireplace_wall').setScale(1.2));
            add(this.add.image(0, -118, 'gold_wolf_head').setScale(1.3));
            add(this.add.image(-44, -73, 'mantel_clock').setScale(1.2));
            add(this.add.image(42, -73, 'wolf_sheep_figure').setScale(1.2));
        } else {
            // What comes round: warm light, the dome's ribs, the bulbs.
            add(this.add.rectangle(0, -40, 192, 240, 0x3a2418));
            add(this.add.rectangle(0, -60, 176, 170, 0xe2c08e));
            const ribs = this.add.graphics();
            ribs.lineStyle(2, 0x2a1c12, 1);
            for (let i = 0; i <= 8; i++) ribs.lineBetween(0, -140, -88 + i * 22, 20);
            add(ribs);
            for (let i = 0; i < 9; i++) add(this.add.circle(-80 + i * 20, 24, 3, 0xffc46a));
            add(this.add.image(0, -20, 'lion_fountain').setScale(0.9));
        }
        for (let px = -112; px <= 112; px += 32) {
            for (let py = 96; py <= 128; py += 32) add(this.add.image(px, py, 'parquet_cube'));
        }
        add(this.add.rectangle(0, 146, 240, 4, 0x2a1a0e));

        // Armchair back, whoever sits in it, armchair front: the chair crosses
        // their lap instead of them sitting on top of it.
        const seats = {};
        [[-78, 'mike'], [78, 'yvy']].forEach(([sx, who]) => {
            add(this.add.image(sx, 88, 'wolf_armchair_back').setScale(1.4));
            const sitting = who === 'mike'
                ? this.add.sprite(sx, 92, this.textures.exists(this.outfit + '_sit') ? this.outfit + '_sit' : this.outfit)
                : this.add.sprite(sx, 98, 'yvy_red');
            add(sitting.setVisible(false));
            add(this.add.image(sx, 110, 'wolf_armchair_front').setScale(1.4));
            seats[who] = sitting;
        });
        n.setData('seats', seats);
        return n;
    }

    // --- the story ---------------------------------------------------------------

    meetYvy() {
        this.met = true;
        this.busy = true;
        this.narrate([
            "Yvy was waiting out front, in a red long-sleeved dress.",
            "Mike: 'Hi. You look amazing.'",
            "Yvy: 'Hi yourself. You made it.'"
        ], () => {
            this.busy = false;
            this.yvyFollow = true;
            this.instructionText.setText(`Go inside (${actionLabel()})`);
        });
    }

    goInside() {
        this.busy = true;
        this.player.isLocked = true;
        this.cameras.main.fadeOut(450, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.stage = 'inside';
            this.outside.setVisible(false);
            this.inside.setVisible(true);
            this.outsideWall.body.enable = false;
            this.insideSolids.forEach(b => { b.body.enable = true; });
            this.cameras.main.setBackgroundColor('#141416');
            this.player.body.reset(396, 520);
            this.yvy.setPosition(356, 520);
            this.cameras.main.fadeIn(450, 0, 0, 0);
            this.instructionText.setText('');
            this.narrate([
                "Inside, it was packed. It looked like a very high-class liquor store: black and white marble, bottles lined up behind glass, carved wooden cabinets.",
                "Yvy: 'Are we... buying a bottle?'",
                "Mike: 'I don't think that's why people come here.'"
            ], () => {
                this.busy = false;
                this.player.isLocked = false;
                this.instructionText.setText(`Talk to the host (${actionLabel()})`);
            });
        });
    }

    talkToHost() {
        this.busy = true;
        this.player.isLocked = true;
        this.yvyFollow = false;
        this.instructionText.setText('');
        this.narrate([
            "Host: 'Good evening. Busy one tonight. Just the two of you?'",
            "Mike: 'Just the two of us.'",
            "Host: 'Wonderful. Right this way. Please, have a seat by the fire.'",
            "Yvy: 'In the liquor store?'",
            "Host: 'In the liquor store.'"
        ], () => this.toTheArmchairs());
    }

    toTheArmchairs() {
        this.tweens.add({ targets: this.host, x: 560, y: 356, duration: 1300, ease: 'Sine.easeInOut' });
        this.stepTo(562, 330, 1400);
        this.tweens.add({ targets: this.yvy, x: 718, y: 330, duration: 1400, ease: 'Sine.easeInOut' });

        this.time.delayedCall(1500, () => {
            const seats = this.nook.getData('seats');
            this.player.setVisible(false);
            this.yvy.setVisible(false);
            seats.mike.setVisible(true);
            seats.yvy.setVisible(true);
            this.tweens.add({ targets: this.host, x: 300, y: 346, duration: 1300, ease: 'Sine.easeInOut' });
            // In close on the mantel, so the three things on it can be seen.
            this.cameras.main.pan(640, 150, 900, 'Sine.easeInOut');
            this.cameras.main.zoomTo(1.7, 900, 'Sine.easeInOut');
            this.time.delayedCall(1000, () => this.narrate([
                "They sat in two armchairs beside a fireplace that wasn't lit.",
                "Above it: a golden wolf's head, an old clock, and a little wolf in sheep's clothing.",
                "Yvy: 'Okay. This is a strange liquor store.'",
                "Mike: 'Something's about to happen. I can feel it.'"
            ], () => this.theWallTurns()));
        });
    }

    /** The wall swings to edge-on, and comes back round with the bar on it. */
    theWallTurns() {
        this.cameras.main.zoomTo(1.25, 600, 'Sine.easeInOut');
        playSound('whoosh');
        this.cameras.main.shake(1800, 0.003);
        const barSeats = this.barSide.getData('seats');
        barSeats.mike.setVisible(true);
        barSeats.yvy.setVisible(true);
        this.tweens.add({
            targets: this.nook, scaleX: 0, duration: 900, ease: 'Sine.easeIn', delay: 400,
            onComplete: () => {
                this.nook.setVisible(false);
                this.barSide.setVisible(true);
                this.tweens.add({
                    targets: this.barSide, scaleX: 1, duration: 900, ease: 'Sine.easeOut',
                    onComplete: () => this.narrate([
                        "Then the whole wall turned, fireplace, armchairs and all, and brought them round into the bar."
                    ], () => {
                        this.cameras.main.fadeOut(900, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            stopMusic();
                            this.scene.start('WolvesBarScene');
                        });
                    })
                });
            }
        });
    }

    update() {
        this.player.update(this.cursors);
        if (this.yvyFollow) {
            const dx = this.player.x + 30 - this.yvy.x;
            const dy = this.player.y - this.yvy.y;
            if (Math.hypot(dx, dy) > 6) {
                this.yvy.x += dx * 0.08;
                this.yvy.y += dy * 0.08;
                this.yvy.setFlipX(dx < 0);
            }
        }
        const near = !this.busy && this.zones.some(({ z, when }) => when() && this.physics.overlap(this.player, z));
        document.getElementById('interaction-hint').style.display = near ? 'block' : 'none';
    }
}

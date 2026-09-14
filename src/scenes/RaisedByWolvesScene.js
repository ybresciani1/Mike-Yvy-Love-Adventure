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
        this.insideWall = this.solid(400, 118, GAME_WIDTH, 236);
        this.insideWall.body.enable = false;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Zones are gated on which room is showing, so the door and the host can
        // share screen space without sharing a keypress.
        this.zone(470, 414, 76, 60, () => this.stage === 'outside' && !this.met, () => this.meetYvy());
        this.zone(400, 356, 110, 34, () => this.stage === 'outside' && this.met, () => this.goInside());
        this.zone(300, 380, 96, 56, () => this.stage === 'inside', () => this.talkToHost());
        this.zone(240, 262, 150, 40, () => this.stage === 'inside',
            () => showDialogue("Bottles behind glass, lit like jewellery. Nobody seems to be buying any."));

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
        // Painted walls: a soft landscape above wooden panelling.
        this.R(c, 400, 118, GAME_WIDTH, 236, 0xb3c2ab);
        this.R(c, 400, 50, GAME_WIDTH, 100, 0xcad6c8);
        [[60, 96, 30], [130, 80, 22], [470, 92, 28], [520, 72, 20]].forEach(([tx, ty, r]) => {
            this.R(c, tx, ty + r, 4, 30, 0x6f5a44, 0.7);
            c.add(this.add.circle(tx, ty, r, 0x8ba381, 0.8));
        });
        this.R(c, 400, 6, GAME_WIDTH, 12, 0xeae4d6);
        this.R(c, 400, 208, GAME_WIDTH, 56, 0x6a4a2e);
        for (let x = 20; x < GAME_WIDTH; x += 60) this.R(c, x + 20, 210, 44, 40, 0x7a5636);

        // Black and white marble, and the name set into it at the door.
        for (let y = 252; y < GAME_HEIGHT + 16; y += 32) {
            for (let x = 16; x < GAME_WIDTH + 16; x += 32) this.I(c, x, y, 'bw_marble_tile');
        }
        this.R(c, 400, 566, 190, 36, 0xeceff1);
        this.T(c, 400, 566, 'RAISED BY WOLVES', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#6a6a72' });

        // Bottles behind glass and carved wooden cabinets.
        this.I(c, 70, 170, 'bottle_wall', 1.3);
        this.I(c, 190, 160, 'liquor_cabinet', 1.3);
        this.I(c, 290, 160, 'liquor_cabinet', 1.3);
        this.I(c, 410, 170, 'bottle_wall', 1.3);
        this.I(c, 40, 330, 'display_case_round', 1.3);
        this.I(c, 250, 44, 'chandelier', 1);

        this.host = this.add.sprite(300, 346, 'host');
        c.add(this.host);
        this.I(c, 300, 372, 'host_stand', 1.2);

        this.nook = this.buildNook(false);
        this.barSide = this.buildNook(true).setScale(0, 1).setVisible(false);
        c.add(this.nook);
        c.add(this.barSide);
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
            this.insideWall.body.enable = true;
            this.cameras.main.setBackgroundColor('#141416');
            this.player.body.reset(400, 520);
            this.yvy.setPosition(440, 520);
            this.cameras.main.fadeIn(450, 0, 0, 0);
            this.instructionText.setText('');
            this.narrate([
                "Inside, it looked like a very high-class liquor store: black and white marble, bottles lined up behind glass, carved wooden cabinets.",
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
            "Host: 'Good evening. Just the two of you?'",
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

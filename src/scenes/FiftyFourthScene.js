import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playLeFestinTheme, playBattleTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';
import { actionLabel, promptFontSize, isTouchMode } from '../ui/touch.js';

// The two songs: which lane each block comes down, which way its arrow points,
// and how long after the one before it. Mike demonstrates on the long one.
const CHARTS = {
    mike: [
        [0, 'down', 1000], [1, 'down', 850], [0, 'left', 750], [1, 'right', 750],
        [0, 'up', 700], [1, 'down', 650], [0, 'right', 650], [1, 'left', 620],
        [0, 'down', 600], [1, 'up', 600], [0, 'left', 560], [1, 'right', 560],
        [0, 'down', 540], [1, 'down', 540]
    ],
    yvy: [
        [0, 'down', 1000], [1, 'down', 900], [0, 'right', 850], [1, 'left', 800],
        [0, 'up', 800], [1, 'down', 760], [0, 'left', 760], [1, 'right', 720]
    ]
};

// Which way each arrow points, as an angle.
const ARROWS = { up: 0, right: 90, down: 180, left: 270 };
const LANES = [-96, 96]; // red on the left, blue on the right
const STRIKE = 112; // where a block meets the sabers, in panel coordinates

/**
 * The house on 54th Street, the same night as downtown. Aiden is out, Penny is
 * very much in, and the VR headset is on the TV unit — which is how Mike ends
 * up playing Beat Saber in Yvy's living room, badly, and then watching her do
 * it properly.
 */
export class FiftyFourthScene extends Phaser.Scene {
    constructor() { super('FiftyFourthScene'); }

    preload() { this.load.image('penny_custom', REMOTE_IMAGES.penny); }

    create() {
        this.cameras.main.setBackgroundColor('#241d2c');
        this.zones = [];
        this.busy = true;
        this.playing = false;
        this.pennyFollows = false;
        this.played = false;

        this.buildRoom();

        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 400, 560);
        this.player.setTexture(outfit).setDepth(20);
        this.yvy = this.add.sprite(444, 560, 'yvy').setDepth(20);
        this.yvyFollow = true;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.buildSolids();
        this.buildTalk();

        this.instructionText = this.add.text(20, 574, '', {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(40);

        stopMusic();
        playLeFestinTheme();
        this.time.delayedCall(700, () => this.narrate([
            "After downtown, Yvy drove them back to the house on 54th Street. Aiden was out for the night; Penny met them at the door and had opinions about it.",
            "Mike had carried his headset in from the car. He builds VR for a living, and he had been promising to show her for weeks.",
            "Yvy: 'Set it up, set it up.'",
            "Mike: 'Two minutes. I'll run it to your computer so I can see what you're seeing.'"
        ], () => {
            this.busy = false;
            this.instructionText.setText(`Look around, or set up the headset (${actionLabel()})`);
        }));
    }

    // --- helpers ----------------------------------------------------------------

    zone(x, y, w, h, act) {
        const z = this.add.rectangle(x, y, w, h, 0xffff00, 0);
        this.physics.add.existing(z, true);
        this.physics.add.overlap(this.player, z, () => {
            if (!this.busy && !this.playing && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) act();
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

    // --- the living room ----------------------------------------------------------

    buildRoom() {
        // Wall, picture rail, floor.
        this.add.rectangle(400, 160, GAME_WIDTH, 320, 0xe4dccc);
        this.add.rectangle(400, 300, GAME_WIDTH, 16, 0xc8bca8);
        this.add.rectangle(400, 232, GAME_WIDTH, 4, 0xd2c6b2);
        for (let y = 324; y < GAME_HEIGHT + 32; y += 32) {
            for (let x = 16; x < GAME_WIDTH + 16; x += 32) this.add.image(x, y, 'floor_wood');
        }
        this.add.image(400, 470, 'fancy_rug').setScale(3, 1.6);

        // The kitchen pass on the left, the doors to the yard on the right.
        this.add.image(120, 268, 'kitchen_pass').setScale(1.3);
        this.add.image(740, 262, 'french_doors').setScale(1.2);
        this.add.rectangle(740, 226, 84, 6, 0x6a5a48);
        this.add.image(620, 170, 'window_living_room').setScale(0.9);

        // Photographs of the family up the wall, and a shelf of things.
        [[300, 150, 0x8a6a4a], [348, 138, 0x6a7a8a], [348, 182, 0xa07a6a], [396, 156, 0x7a8a6a]]
            .forEach(([x, y, tint]) => {
                this.add.rectangle(x, y, 30, 26, 0x4a3a2a);
                this.add.rectangle(x, y, 24, 20, tint);
            });
        this.add.rectangle(470, 200, 90, 6, 0x6a5a48);
        [[444, 190], [470, 188], [496, 190]].forEach(([x, y], i) => this.add.image(x, y, i === 1 ? 'plant_snake' : 'plant_fern').setScale(0.5));

        // The TV on its unit, with the headset beside it.
        this.add.image(560, 312, 'tv_unit').setScale(1.5);
        this.tv = this.add.image(560, 268, 'tv').setScale(1.3);
        this.tvGlow = this.add.rectangle(560, 264, 68, 40, 0x6ad0f0, 0.18);
        this.tweens.add({ targets: this.tvGlow, alpha: 0.32, duration: 1400, yoyo: true, repeat: -1 });
        this.headset = this.add.image(628, 296, 'vr_headset').setScale(1.1);
        this.tweens.add({ targets: this.headset, y: 292, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Yvy's computer, which Mike runs the headset to so he can see her view.
        this.add.rectangle(440, 316, 96, 10, 0x6a5240);
        this.add.rectangle(440, 322, 88, 6, 0x5a4434);
        this.add.image(440, 290, 'expo_monitor');
        this.monitorGlow = this.add.rectangle(440, 286, 44, 24, 0x6ad0f0, 0.12);
        this.tweens.add({ targets: this.monitorGlow, alpha: 0.26, duration: 1200, yoyo: true, repeat: -1 });
        const cable = this.add.graphics();
        cable.lineStyle(2, 0x2a2a2e, 0.9);
        cable.lineBetween(472, 316, 545, 330);
        cable.lineBetween(545, 330, 616, 304);

        // The couch, a lamp, plants, and Penny's corner.
        this.add.image(240, 428, 'couch').setScale(1.8);
        this.add.image(240, 492, 'kid_table').setScale(1.2); // the coffee table
        this.add.rectangle(228, 484, 6, 7, 0xf2f2ee); // somebody's mug
        this.add.rectangle(252, 485, 14, 4, 0x2a2a2e); // the remote
        this.add.image(500, 372, 'floor_lamp').setScale(1.2);
        this.add.circle(500, 348, 22, 0xffe8a0, 0.2);
        this.add.image(60, 372, 'plant_snake').setScale(1.2);
        this.add.image(700, 398, 'plant_fern').setScale(1.2);
        this.add.image(150, 520, 'dog_bowls').setScale(0.9);
        this.add.ellipse(150, 552, 74, 34, 0x6a4a3a);
        this.add.ellipse(150, 550, 64, 26, 0x8a6a52);
        this.penny = this.add.sprite(150, 544, 'penny_custom').setDepth(19);
        this.penny.setDisplaySize(26, 26);
        this.tweens.add({ targets: this.penny, x: 158, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    buildSolids() {
        const solid = (x, y, w, h) => {
            const b = this.add.rectangle(x, y, w, h, 0, 0);
            this.physics.add.existing(b, true);
            this.physics.add.collider(this.player, b);
            return b;
        };
        solid(400, 160, GAME_WIDTH, 330); // the wall
        solid(560, 318, 96, 26); // the TV unit
        solid(120, 318, 110, 26); // the kitchen pass
        solid(740, 318, 74, 26); // the doors to the yard
        solid(240, 438, 100, 30); // the couch
        solid(500, 384, 14, 10); // the lamp
    }

    /**
     * Zones, all further apart than he is wide: the kitchen x 90-150 y 335-355 ·
     * the TV x 515-575 y 335-355 · the headset x 610-650 y 335-355 · the doors
     * x 715-765 y 335-355 · the couch x 195-285 y 460-480 · Penny x 120-180 y 578-598.
     */
    buildTalk() {
        this.zone(120, 345, 60, 20, this.chat([
            "The kitchen, dark except for the light over the stove. There is a plate of something under foil.",
            "Yvy: 'Leftovers. My mom cooks like there's twelve of us.'"
        ], "Yvy: 'The foil stays on until after.'"));
        this.zone(545, 345, 60, 20, this.chat([
            "The TV, paused on a menu screen with a song list on it.",
            "Yvy: 'That's the playlist. Don't scroll it, you'll lose my place.'"
        ], "The song list glows on the TV."));
        this.zone(440, 345, 60, 20, this.chat([
            "Yvy's computer, with the headset's view mirrored on the monitor — whatever is in the headset, Mike can see.",
            "Mike: 'That's so I can tell you what you're doing wrong.'",
            "Yvy: 'Rude. Accurate, probably. Rude.'"
        ], "The monitor mirrors whatever the headset sees."));
        this.zone(630, 345, 40, 20, () => this.pickUpHeadset());
        this.zone(740, 345, 50, 20, this.chat([
            "Through the doors, the yard is dark and quiet, with Penny's tennis ball out on the grass where she left it."
        ], "Penny's ball is still out there."));
        this.zone(240, 470, 90, 20, this.chat([
            "The couch, with a blanket over one arm and a dent in the cushion the exact size of a dog.",
            "Yvy: 'That's Penny's spot. You can sit there, but you're negotiating.'"
        ], "Penny's dent is still in the cushion."));
        this.zone(150, 588, 60, 20, () => this.petPenny());
    }

    petPenny() {
        if (this.pennyFollows) return showDialogue("Penny leans on Mike's leg and stays there.");
        this.pennyFollows = true;
        playSound('select');
        this.narrate([
            "Penny gets up, stretches all the way forward, and shoves her head under Mike's hand.",
            "Yvy: 'She likes you. That's it, that's the whole test, you passed.'",
            "Mike: 'Good girl, Penny.'"
        ], () => {});
    }

    // --- the headset ------------------------------------------------------------------

    pickUpHeadset() {
        if (this.played) return showDialogue("Yvy: 'One more song and it's midnight. ...Okay, one more.'");
        this.busy = true;
        this.player.isLocked = true;
        this.instructionText.setText('');
        this.headset.setVisible(false);
        this.narrate([
            "Mike ran the cable to the computer, cleared a space on the rug, and brought the menu up on her monitor.",
            "Mike: 'Painting, a space station, one where you sit in a room with a dog. And this — Beat Saber.'",
            "Yvy: 'That one. Obviously that one.'",
            "Mike: 'Let me show you the first song. Watch the arrows — you cut each block the way its arrow points.'"
        ], () => this.startSong('mike'));
    }

    /** Inside the headset: a dark field, two lanes, and blocks coming at you. */
    startSong(who) {
        this.who = who;
        this.chart = CHARTS[who];
        stopMusic();
        playBattleTheme();
        this.hits = 0;
        this.misses = 0;
        this.blocks = [];
        if (!this.dim) {
            this.dim = this.add.rectangle(400, 300, GAME_WIDTH, GAME_HEIGHT, 0x05060c, 0).setDepth(30);
            this.tweens.add({ targets: this.dim, fillAlpha: 0.9, duration: 500 });
        }

        this.panel = this.add.container(400, 300).setDepth(31);
        this.panel.add(this.add.rectangle(0, 0, 640, 380, 0x0a0c18));
        this.panel.add(this.add.rectangle(0, 0, 630, 370, 0x11162c));
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x3a4a8a, 0.8);
        for (let i = -6; i <= 6; i++) grid.lineBetween(i * 52, -185, i * 110, 185);
        for (let y = -140; y < 190; y += 44) grid.lineBetween(-315, y, 315, y);
        this.panel.add(grid);
        LANES.forEach((x, i) => {
            this.panel.add(this.add.rectangle(x, 0, 120, 370, i ? 0x2a6ad2 : 0xd23a4a, 0.07));
        });
        this.panel.add(this.add.rectangle(0, STRIKE, 620, 3, 0xf2f2f2, 0.5)); // where you cut
        this.sabers = LANES.map((x, i) => {
            const saber = this.add.image(x, STRIKE + 44, i ? 'saber_blue' : 'saber_red').setScale(1.4).setOrigin(0.5, 1);
            this.panel.add(saber);
            return saber;
        });
        this.scoreText = this.add.text(0, -170, '0', {
            fontSize: '20px', color: who === 'mike' ? '#f2f2f2' : '#ff8ad0', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.panel.add(this.scoreText);
        this.panel.add(this.add.text(0, 170, isTouchMode()
            ? 'Cut each block the way its arrow points — use the D-pad'
            : 'Cut each block the way its arrow points — use the arrow keys',
        { fontSize: '11px', color: '#9aa8d0' }).setOrigin(0.5));

        // Three, two, one.
        const count = this.add.text(0, 0, '3', { fontSize: '52px', color: '#f2f2f2', fontStyle: 'bold' }).setOrigin(0.5);
        this.panel.add(count);
        ['2', '1', 'GO'].forEach((n, i) => this.time.delayedCall(600 * (i + 1), () => {
            count.setText(n);
            playSound('select');
        }));
        this.time.delayedCall(2400, () => {
            count.destroy();
            this.playing = true;
            this.runChart(0);
        });
    }

    /** One block at a time, down the lane the chart says, pointing where it says. */
    runChart(i) {
        if (i >= this.chart.length) {
            this.time.delayedCall(2100, () => this.finishSong());
            return;
        }
        const [lane, dir, gap] = this.chart[i];
        this.dropBlock(lane, dir);
        this.time.delayedCall(gap, () => this.runChart(i + 1));
    }

    dropBlock(lane, dir) {
        const cube = this.add.image(0, 0, lane ? 'beat_block_blue' : 'beat_block_red').setScale(1.6);
        const arrow = this.add.image(0, 0, 'beat_arrow').setScale(1.3).setAngle(ARROWS[dir]);
        const box = this.add.container(LANES[lane], -190, [cube, arrow]);
        this.panel.add(box);
        const entry = { box, cube, arrow, lane, dir, cut: false };
        this.blocks.push(entry);
        this.tweens.add({
            targets: box, y: STRIKE + 70, duration: 1700, ease: 'Linear',
            onComplete: () => {
                if (entry.cut) return;
                this.blocks = this.blocks.filter(b => b !== entry);
                box.destroy();
                this.misses += 1;
                this.cameras.main.shake(120, 0.004);
            }
        });
    }

    /** A swing one way: it only counts if the block's arrow agrees with it. */
    slash(dir) {
        const entry = this.blocks.find(b => !b.cut && Math.abs(b.box.y - STRIKE) < 34);
        const saber = this.sabers[entry ? entry.lane : (dir === 'left' ? 0 : 1)];
        this.tweens.add({ targets: saber, angle: dir === 'left' ? 50 : -50, duration: 70, yoyo: true });
        if (!entry) return playSound('whoosh');
        if (entry.dir === dir) return this.cut(entry);
        this.wrongWay(entry);
    }

    cut(entry) {
        entry.cut = true;
        this.blocks = this.blocks.filter(b => b !== entry);
        this.hits += 1;
        this.scoreText.setText(String(this.hits));
        playSound('select');
        const { box } = entry;
        this.tweens.add({
            targets: box, scaleX: 2.2, scaleY: 0.4, alpha: 0, angle: entry.lane ? 40 : -40,
            duration: 260, onComplete: () => box.destroy()
        });
        const spark = this.add.rectangle(box.x, box.y, 80, 3, 0xffffff, 0.9);
        this.panel.add(spark);
        this.tweens.add({ targets: spark, scaleX: 2, alpha: 0, duration: 260, onComplete: () => spark.destroy() });
    }

    /** Cut it the wrong way and it goes grey, and it counts against you. */
    wrongWay(entry) {
        entry.cut = true;
        this.blocks = this.blocks.filter(b => b !== entry);
        this.misses += 1;
        playSound('whoosh');
        this.cameras.main.shake(140, 0.005);
        entry.cube.setTint(0x6a6a72);
        entry.arrow.setTint(0x9a9aa2);
        this.tweens.add({
            targets: entry.box, alpha: 0, y: entry.box.y + 26, duration: 300,
            onComplete: () => entry.box.destroy()
        });
    }

    clearPanel() {
        this.playing = false;
        this.blocks.forEach(b => b.box.destroy());
        this.blocks = [];
        this.panel.destroy();
    }

    finishSong() {
        const scored = this.hits;
        const total = this.chart.length;
        this.clearPanel();
        if (this.who === 'mike') {
            this.narrate([
                `Mike cut ${scored} of ${total}, calling the arrows out loud as they came down.`,
                scored >= total - 2
                    ? "Yvy: 'Okay, show-off. Give it here.'"
                    : "Yvy: 'You missed some! Give it here, I want to try.'",
                "Mike: 'Feet apart. Watch the arrow, not the block — I'll watch you on the monitor.'"
            ], () => this.startSong('yvy'));
            return;
        }
        this.narrate([
            `On the monitor, Mike watched Yvy cut ${scored} of ${total}, swinging at the ceiling for the high ones.`,
            scored >= total - 2
                ? "Mike: 'That was your first song. That is not normal.'"
                : scored >= total / 2
                    ? "Mike: 'That's really good for a first song. Most people just flail.'"
                    : "Mike: 'Everybody flails the first time. You're already better than I was.'",
            "Yvy: 'Again. I've got it now.'"
        ], () => this.afterSong());
    }

    afterSong() {
        this.tweens.add({
            targets: this.dim, fillAlpha: 0, duration: 600,
            onComplete: () => { this.dim.destroy(); this.dim = null; }
        });
        stopMusic();
        playLeFestinTheme();
        this.played = true;
        this.headset.setVisible(true);
        this.narrate([
            "Yvy pulled the headset off with her hair everywhere and a controller still in each hand.",
            "Yvy: 'Okay. Picture. Penny — Penny. Penny, come here.'"
        ], () => this.vrPhoto());
    }

    /** The picture: the pair of them, the headset, and a dog who will not look at the camera. */
    vrPhoto() {
        this.player.body.reset(392, 470);
        this.player.setFlipX(false);
        this.yvy.setPosition(424, 470).setFlipX(true);
        this.penny.setPosition(458, 486);
        this.pennyFollows = false;
        this.time.delayedCall(700, () => {
            this.cameras.main.flash(250, 255, 255, 255);
            takePhoto({
                key: 'vrnight', title: 'VR night at 54th Street',
                caption: "Mike's headset, Yvy's living room, and Penny refusing to look at the camera.",
                window: 0x2e2636,
                sprites: [
                    { rect: [180, 34], x: 0, y: 24, color: 0x6a4a32 },
                    { texture: 'tv', x: 54, y: -16, scale: 0.9 },
                    { texture: 'couch', x: -54, y: 2 },
                    { texture: this.player.texture.key, x: -16, y: 8 },
                    { texture: 'vr_headset', x: -16, y: -2, scale: 0.7 },
                    { texture: 'yvy', x: 10, y: 8 },
                    { texture: 'saber_blue', x: 28, y: 2, scale: 0.7 },
                    { texture: 'penny_custom', x: 44, y: 18, size: [22, 22] }
                ]
            });
            this.narrate([
                "Penny looked at the phone, looked away, and leaned on Mike's leg instead.",
                "Mike: 'That's the one. That's the picture.'"
            ], () => {
                this.busy = false;
                this.player.isLocked = false;
                this.pennyFollows = true;
                this.instructionText.setText(`Play again, or call it a night (${actionLabel()})`);
                this.zone(400, 560, 90, 24, () => this.endNight());
            });
        });
    }

    endNight() {
        this.busy = true;
        this.player.isLocked = true;
        this.instructionText.setText('');
        this.narrate([
            "They played until they were both out of breath, and Penny watched the whole thing from her spot on the couch like they had lost their minds.",
            "Yvy: 'Bring it back tomorrow. I want to try the one with the dog.'",
            "Mike: 'Penny can supervise.'"
        ], () => {
            this.cameras.main.fadeOut(1200, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                stopMusic();
                this.scene.start('CostumeNightScene');
            });
        });
    }

    update() {
        if (this.playing) {
            const { left, right, up, down } = this.cursors;
            if (Phaser.Input.Keyboard.JustDown(left)) this.slash('left');
            else if (Phaser.Input.Keyboard.JustDown(right)) this.slash('right');
            else if (Phaser.Input.Keyboard.JustDown(up)) this.slash('up');
            else if (Phaser.Input.Keyboard.JustDown(down)) this.slash('down');
            return;
        }
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
        if (this.pennyFollows) {
            const dx = this.player.x - 26 - this.penny.x;
            const dy = this.player.y + 10 - this.penny.y;
            if (Math.hypot(dx, dy) > 10) {
                this.penny.x += dx * 0.05;
                this.penny.y += dy * 0.05;
            }
        }
        const near = !this.busy && this.zones.some(z => this.physics.overlap(this.player, z));
        document.getElementById('interaction-hint').style.display = near ? 'block' : 'none';
    }
}

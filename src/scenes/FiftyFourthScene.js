import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playLeFestinTheme, playBattleTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

// The song: which lane each block comes down, and how long after the last one.
const CHART = [
    [0, 900], [1, 800], [0, 700], [1, 700], [0, 650], [1, 600], [0, 600],
    [1, 550], [0, 550], [1, 520], [0, 520], [1, 500], [0, 500], [1, 500]
];
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
            "Yvy: 'Okay. You have to try the VR. It's set up in the living room.'",
            "Mike: 'I build VR for a living.'",
            "Yvy: 'Then you have no excuse.'"
        ], () => {
            this.busy = false;
            this.instructionText.setText(`Look around, or pick up the headset (${actionLabel()})`);
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
            "Yvy: 'Beat Saber. Red saber in your left hand, blue in your right — you cut the blocks that match.'",
            "Mike: 'How hard can it be.'",
            "Yvy: 'Famous last words. Ready?'"
        ], () => this.startSong());
    }

    /** Inside the headset: a dark field, two lanes, and blocks coming at you. */
    startSong() {
        stopMusic();
        playBattleTheme();
        this.hits = 0;
        this.misses = 0;
        this.blocks = [];
        this.dim = this.add.rectangle(400, 300, GAME_WIDTH, GAME_HEIGHT, 0x05060c, 0).setDepth(30);
        this.tweens.add({ targets: this.dim, fillAlpha: 0.9, duration: 500 });

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
        this.scoreText = this.add.text(0, -170, '0', { fontSize: '20px', color: '#f2f2f2', fontStyle: 'bold' }).setOrigin(0.5);
        this.panel.add(this.scoreText);

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

    /** One block at a time, down the lane the chart says. */
    runChart(i) {
        if (i >= CHART.length) {
            this.time.delayedCall(2000, () => this.finishSong());
            return;
        }
        const [lane, gap] = CHART[i];
        this.dropBlock(lane);
        this.time.delayedCall(gap, () => this.runChart(i + 1));
    }

    dropBlock(lane, auto = false) {
        const block = this.add.image(LANES[lane], -190, lane ? 'beat_block_blue' : 'beat_block_red').setScale(1.6);
        this.panel.add(block);
        const entry = { block, lane, cut: false };
        this.blocks.push(entry);
        this.tweens.add({
            targets: block, y: STRIKE + 70, duration: 1700, ease: 'Linear',
            onUpdate: () => {
                if (auto && !entry.cut && block.y >= STRIKE - 6) this.cut(entry);
            },
            onComplete: () => {
                if (entry.cut) return;
                this.blocks = this.blocks.filter(b => b !== entry);
                block.destroy();
                if (!auto) {
                    this.misses += 1;
                    this.cameras.main.shake(120, 0.004);
                }
            }
        });
    }

    /** A swing: whichever block is at the line gets cut. */
    slash() {
        const entry = this.blocks.find(b => !b.cut && Math.abs(b.block.y - STRIKE) < 34);
        const lane = entry ? entry.lane : 0;
        const saber = this.sabers[lane];
        this.tweens.add({ targets: saber, angle: lane ? -50 : 50, duration: 70, yoyo: true });
        if (!entry) return playSound('whoosh');
        this.cut(entry);
    }

    cut(entry) {
        entry.cut = true;
        this.blocks = this.blocks.filter(b => b !== entry);
        this.hits += 1;
        this.scoreText.setText(String(this.hits));
        playSound('select');
        const { block } = entry;
        this.tweens.add({
            targets: block, scaleX: 2.2, scaleY: 0.4, alpha: 0, angle: entry.lane ? 40 : -40,
            duration: 260, onComplete: () => block.destroy()
        });
        const spark = this.add.rectangle(block.x, block.y, 80, 3, 0xffffff, 0.9);
        this.panel.add(spark);
        this.tweens.add({ targets: spark, scaleX: 2, alpha: 0, duration: 260, onComplete: () => spark.destroy() });
    }

    finishSong() {
        this.playing = false;
        const scored = this.hits;
        const verdict = scored >= 12
            ? "Yvy: 'Okay. You're a natural and I hate it.'"
            : scored >= 7
                ? "Yvy: 'Not bad for a first song! You only fell over once.'"
                : "Yvy: 'You'll get it. Nobody is good at this the first time.'";
        this.narrate([
            `Mike cut ${scored} of ${CHART.length} blocks, and put his whole shoulder into most of them.`,
            verdict,
            "Yvy: 'My turn. Watch.'"
        ], () => this.yvyTurn());
    }

    /** Her turn: she does not miss. */
    yvyTurn() {
        this.hits = 0;
        this.scoreText.setText('0');
        this.scoreText.setColor('#ff8ad0');
        let i = 0;
        const next = () => {
            if (i >= 8) {
                this.time.delayedCall(1800, () => this.afterSong());
                return;
            }
            this.dropBlock(i % 2, true);
            i += 1;
            this.time.delayedCall(420, next);
        };
        next();
    }

    afterSong() {
        this.tweens.add({ targets: this.panel, alpha: 0, duration: 500, onComplete: () => this.panel.destroy() });
        this.tweens.add({ targets: this.dim, fillAlpha: 0, duration: 600, onComplete: () => this.dim.destroy() });
        stopMusic();
        playLeFestinTheme();
        this.played = true;
        this.headset.setVisible(true);
        this.narrate([
            "Yvy cut every single block without moving her feet.",
            "Mike: 'You've done this before.'",
            "Yvy: 'Once or twice. Aiden and I play until the neighbours complain.'"
        ], () => {
            this.busy = false;
            this.player.isLocked = false;
            this.instructionText.setText(`Play again, or call it a night (${actionLabel()})`);
            this.zone(400, 560, 90, 24, () => this.endNight());
        });
    }

    endNight() {
        this.busy = true;
        this.player.isLocked = true;
        this.instructionText.setText('');
        this.narrate([
            "They played until they were both out of breath, and Penny watched the whole thing from her spot on the couch like they had lost their minds.",
            "Yvy: 'Same time tomorrow? I'll make you play on hard.'",
            "Mike: 'Same time tomorrow.'"
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
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.slash();
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

import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

// The Beach Trail, from the trailhead sign round the bluffs to the steps.
const TRAIL = [[60, 600], [150, 505], [300, 462], [460, 470], [600, 425], [720, 390]];

/**
 * Torrey Pines, the morning after Cafe Secret: the Beach Trail across the
 * clifftop — coastal sage, twisted Torrey pines, eroded sandstone and the
 * ocean below — and then down the steps to the beach and out to Flat Rock.
 *
 * The clifftop and the beach are two containers in one scene; the steps swap
 * them, the same way the door does at Raised by Wolves.
 */
export class TorreyPinesScene extends Phaser.Scene {
    constructor() { super('TorreyPinesScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#b8d8ee');
        this.stage = 'trail';
        this.zones = [];
        this.walkers = [];
        this.busy = true;
        this.yvyFollow = true;

        this.trail = this.add.container(0, 0);
        this.buildTrail(this.trail);
        this.beach = this.add.container(0, 0).setVisible(false);
        this.buildBeach(this.beach);

        this.player = new Player(this, 50, 578);
        this.player.setTexture('mike_hike').setDepth(20);
        this.bottle = this.add.image(0, 0, 'water_bottle').setDepth(21);
        // A plain sprite, so she can be put at the bottom of the steps.
        this.yvy = this.add.sprite(84, 578, 'yvy_hike').setDepth(20);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.buildSolids();
        this.buildTrailTalk();
        this.buildBeachTalk();

        this.instructionText = this.add.text(20, 574, '', {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(40);

        stopMusic();
        playLeFestinTheme();
        // Nothing starts until the opening lines have been read.
        this.time.delayedCall(700, () => this.narrate([
            "The next morning, Mike and Yvy met at Torrey Pines to hike the Beach Trail: coastal sage, sandstone bluffs, and the Pacific the whole way down.",
            "Yvy: 'Did you bring water?'",
            "Mike: 'And snacks. And more water.'"
        ], () => {
            this.busy = false;
            this.instructionText.setText(`Hike down to the beach, and look around on the way (${actionLabel()})`);
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

    // --- the clifftop ----------------------------------------------------------------

    buildTrail(c) {
        // Sky, a far headland, and the ocean below the bluffs.
        [[0xa8d0ea, 0, 60], [0xb8d8ee, 60, 50], [0xcce2f2, 110, 50]].forEach(([col, top, h]) => this.R(c, 400, top + h / 2, GAME_WIDTH, h, col));
        [[140, 50, 1.1], [470, 30, 0.9], [700, 70, 1]].forEach(([x, y, s]) => this.I(c, x, y, 'cloud', s).setAlpha(0.9));
        this.R(c, 590, 245, 420, 170, 0x3f84b4);
        this.R(c, 590, 170, 420, 20, 0x7aaed0);
        this.R(c, 590, 190, 420, 20, 0x5a9ac4);
        const g = this.add.graphics();
        c.add(g);
        g.fillStyle(0x8898a6, 1);
        g.fillTriangle(600, 162, 760, 146, 820, 162); // La Jolla, far down the coast
        for (let i = 0; i < 7; i++) { // surf coming in along the foot of the bluffs
            const foam = this.R(c, 420 + i * 60, 312 - i * 4, 44, 3, 0xf2f8fa, 0.8);
            this.tweens.add({ targets: foam, alpha: 0.2, x: foam.x - 10, duration: 1400 + i * 110, yoyo: true, repeat: -1 });
        }

        // The green hillside of coastal sage.
        g.fillStyle(0x6a8a52, 1);
        g.fillPoints([{ x: 0, y: 150 }, { x: 390, y: 170 }, { x: 400, y: 330 }, { x: 800, y: 330 }, { x: 800, y: 600 }, { x: 0, y: 600 }], true);
        // Darker and paler scrub, on the hillside only — not out on the water.
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

        // Sandstone along the edge of the bluffs.
        [[440, 330, 1.1, false], [580, 336, 1.2, true], [720, 330, 1.1, false]]
            .forEach(([x, y, s, flip]) => this.I(c, x, y, 'sandstone_bluff', s).setFlipX(flip));
        for (let x = 400; x < 690; x += 32) this.I(c, x, 350, 'post_fence');

        // The trail itself, sandy, winding down to the steps.
        const path = this.add.graphics();
        c.add(path);
        path.lineStyle(26, 0xd8c098, 1);
        for (let i = 1; i < TRAIL.length; i++) path.lineBetween(TRAIL[i - 1][0], TRAIL[i - 1][1], TRAIL[i][0], TRAIL[i][1]);
        path.fillStyle(0xd8c098, 1);
        TRAIL.forEach(([x, y]) => path.fillCircle(x, y, 13));
        for (let i = 0; i < 6; i++) this.R(c, 712 + i * 12, 352 + i * 11, 30, 5, 0x7a5a3a); // the wooden steps down

        // Scrub, pines, the sign, the bench at the overlook.
        [[40, 460], [220, 560], [340, 540], [520, 540], [680, 520], [760, 460], [250, 390], [300, 390], [420, 400],
         [60, 250], [200, 300], [320, 260], [640, 470], [100, 380], [560, 590], [760, 590]]
            .forEach(([x, y], i) => this.I(c, x, y, 'sage_bush', 1 + (i % 3) * 0.2).setFlipX(i % 2 === 1));
        this.I(c, 40, 320, 'torrey_pine', 0.9);
        this.I(c, 270, 214, 'torrey_pine', 1).setFlipX(true);
        this.I(c, 130, 250, 'torrey_pine', 1.3);
        this.I(c, 110, 530, 'trail_sign', 1.2);
        c.add(this.add.text(110, 516, 'BEACH TRAIL', { fontSize: '7px', color: '#f2e6c8', fontStyle: 'bold' }).setOrigin(0.5));
        this.I(c, 520, 372, 'park_bench');
        const resting = this.add.sprite(504, 356, 'civilian_sit').setTint(0xc8d8e8);
        c.add(resting);
        this.gulls(c, 120);

        this.walker(c, 'trail', [300, 455], [600, 420], 'civilian', 0xd8c0a0, 9000,
            "Hiker: 'Going down is the easy part. Save your legs for the steps back up.'", "Hiker: 'Save your legs!'");
        this.walker(c, 'trail', [150, 498], [440, 462], 'civilian_f', 0xf0d0d8, 6000,
            "Runner: 'Morning! On your left!'", "Runner: 'On your left!'");
    }

    // --- the beach ----------------------------------------------------------------

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

        // Flat Rock in the surf, and the people on the sand.
        this.I(c, 560, 330, 'flat_rock', 1.6);
        for (let i = 0; i < 3; i++) {
            const foam = this.R(c, 480 + i * 80, 356, 50, 3, 0xf6fbfd, 0.8);
            this.tweens.add({ targets: foam, alpha: 0.15, duration: 1200 + i * 200, yoyo: true, repeat: -1 });
        }
        this.I(c, 360, 482, 'beach_towel', 1.2);
        const sunbather = this.add.sprite(352, 466, 'civilian_f_sit').setTint(0xf0c8b0);
        c.add(sunbather);
        this.I(c, 386, 440, 'green_umbrella', 0.8);
        const surfer = this.add.sprite(720, 420, 'civilian').setTint(0xb8d0e0);
        c.add(surfer);
        this.I(c, 738, 418, 'surfboard');
        this.gulls(c, 90);
        this.walker(c, 'beach', [440, 562], [540, 556], 'seagull', 0xffffff, 5000,
            "A seagull walks right up to Mike and stares at his bag of snacks.", "The seagull has not given up.");
    }

    buildSolids() {
        const solid = (x, y, w, h) => {
            const b = this.add.rectangle(x, y, w, h, 0, 0);
            this.physics.add.existing(b, true);
            this.physics.add.collider(this.player, b);
            return b;
        };
        this.trailSolids = [
            solid(400, 80, GAME_WIDTH, 160), // the sky
            solid(590, 245, 420, 170), // the ocean below the bluffs
            solid(110, 548, 40, 10), // the sign
            solid(133, 306, 14, 12), // the big pine's trunk
            solid(520, 376, 60, 12) // the bench
        ];
        this.beachSolids = [
            solid(400, 150, GAME_WIDTH, 300), // the ocean
            solid(130, 210, 260, 420), // the cliffs
            solid(560, 330, 150, 40), // Flat Rock
            solid(360, 480, 50, 20) // the towel
        ];
        this.beachSolids.forEach(b => { b.body.enable = false; });
    }

    /**
     * On the clifftop. Zones, all further apart than he is wide: the sign x 85-135
     * y 559-573 · the big pine x 109-159 y 314-330 · the sage x 275-325 y 402-418
     * · the overlook x 485-555 y 385-399 · the steps x 710-770 y 385-415.
     */
    buildTrailTalk() {
        const onTrail = () => this.stage === 'trail';
        this.zone(110, 566, 50, 14, onTrail, this.chat([
            "TORREY PINES STATE NATURAL RESERVE. BEACH TRAIL. Please stay on the trail."
        ], "Please stay on the trail."));
        this.zone(134, 322, 50, 16, onTrail, this.chat([
            "A Torrey pine, bent sideways by years of wind off the ocean.",
            "Yvy: 'These only grow here and on one island off the coast. They're the rarest pine in the country.'",
            "Mike: 'So we're basically hiking past celebrities.'"
        ], "The Torrey pine leans into the wind."));
        this.zone(300, 410, 50, 16, onTrail, this.chat([
            "Yvy: 'Smell that? That's the sage.'",
            "Mike: 'It smells like a candle. A really expensive candle.'"
        ], "Coastal sage, warm in the sun."));
        this.zone(520, 392, 70, 14, onTrail, this.chat([
            "From the overlook, the sandstone drops away to the beach, and the coast runs all the way down to La Jolla.",
            "Hiker (on the bench): 'Best view in San Diego. Don't tell anyone I said that.'",
            "Yvy: 'Look, you can see surfers from up here.'"
        ], "Hiker: 'Still the best view.'"));
        this.zone(740, 400, 60, 30, onTrail, () => this.goDown());
    }

    /** On the beach: Flat Rock x 475-645 y 354-370 · the towel x 330-390 y 492-508 · the surfer x 700-740 y 430-450. */
    buildBeachTalk() {
        const onBeach = () => this.stage === 'beach';
        this.zone(560, 362, 170, 16, onBeach, () => this.flatRock());
        this.zone(360, 500, 60, 16, onBeach, this.chat([
            "Beachgoer: 'We hiked down at sunrise. Now we're never leaving this towel.'"
        ], "Beachgoer: 'Never leaving.'"));
        this.zone(720, 440, 40, 20, onBeach, this.chat([
            "Surfer: 'Waves are small today, but the water's warm. Warm for here, anyway.'"
        ], "Surfer: 'Might paddle out anyway.'"));
    }

    // --- the story ---------------------------------------------------------------------

    goDown() {
        this.busy = true;
        this.player.isLocked = true;
        this.instructionText.setText('');
        this.narrate([
            "The trail wound down between the bluffs to a long run of wooden steps, and at the bottom of them: the beach."
        ], () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.stage = 'beach';
                this.trail.setVisible(false);
                this.beach.setVisible(true);
                this.trailSolids.forEach(b => { b.body.enable = false; });
                this.beachSolids.forEach(b => { b.body.enable = true; });
                this.player.body.reset(300, 452);
                this.yvy.setPosition(330, 452);
                this.cameras.main.setBackgroundColor('#a8d4f0');
                this.cameras.main.fadeIn(500, 0, 0, 0);
                playSound('whoosh');
                this.narrate([
                    "Yvy: 'Okay. Now we look for crabs.'",
                    "Mike: 'Out on Flat Rock?'",
                    "Yvy: 'Out on Flat Rock.'"
                ], () => {
                    this.busy = false;
                    this.player.isLocked = false;
                    this.instructionText.setText(`Walk down the beach to Flat Rock (${actionLabel()})`);
                });
            });
        });
    }

    flatRock() {
        this.busy = true;
        this.player.isLocked = true;
        this.instructionText.setText('');
        this.narrate([
            "Flat Rock, sitting out in the surf with tide pools in its hollows.",
            "Yvy: 'Look, a little crab! And anemones. Don't poke them.'",
            "Mike: 'I wasn't going to poke them.'",
            "They stayed on the beach under the cliffs a long time, watching the waves come in.",
            "Yvy: 'Worth the stairs?'",
            "Mike: 'Ask me again on the way back up.'"
        ], () => {
            this.cameras.main.fadeOut(1200, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                stopMusic();
                this.scene.start('MisterAsScene');
            });
        });
    }

    update() {
        this.player.update(this.cursors);
        this.bottle.setPosition(this.player.x + (this.player.flipX ? -11 : 11), this.player.y + 4);
        if (this.yvyFollow) {
            const dx = this.player.x + 28 - this.yvy.x;
            const dy = this.player.y - this.yvy.y;
            if (Math.hypot(dx, dy) > 6) {
                this.yvy.x += dx * 0.08;
                this.yvy.y += dy * 0.08;
                this.yvy.setFlipX(dx < 0);
            }
        }
        const near = !this.busy && this.zones.some(({ z, when }) => when() && this.physics.overlap(this.player, z));
        // The people walking about are caught by distance, and only when no zone
        // wants the keypress (scene update runs before the physics step).
        const walker = !near && !this.busy && this.walkers.find(w => w.stage === this.stage
            && Phaser.Math.Distance.Between(this.player.x, this.player.y, w.sprite.x, w.sprite.y) < 36);
        if (walker && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) walker.talk();
        document.getElementById('interaction-hint').style.display = (near || walker) ? 'block' : 'none';
    }
}

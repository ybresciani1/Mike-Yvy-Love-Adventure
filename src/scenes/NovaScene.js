import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy, isDialogueOpen } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';
import { actionLabel, isTouchMode, promptFontSize, showDanceButton } from '../ui/touch.js';

const MIKE_DANCE = ['mike_dance_1', 'mike_dance_2', 'mike_dance_3', 'mike_dance_4'];
const YVY_DANCE = ['yvy_dance_1', 'yvy_dance_2', 'yvy_dance_3', 'yvy_dance_4'];
const PLUSH = [0xffffff, 0xffd6e6, 0xd6ecff, 0xfff0c2, 0xe0d6ff, 0xd6ffe6];

/**
 * NOVA, on a charity night with a rabbit theme: ears on everybody, a pit full
 * of stuffed bunnies, and on the little stage, the American Idol contestant
 * who sang She Bangs. Dance, meet him, get in the pit — in any order.
 */
export class NovaScene extends Phaser.Scene {
    constructor() { super('NovaScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#140b24');
        this.ears = [];
        this.done = { dance: false, singer: false, pit: false };

        this.buildRoom();
        this.buildStage();
        this.buildFloor();
        this.buildPit();

        this.outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 400, 530);
        this.player.setTexture(this.outfit).setDepth(10);
        // A plain sprite she moves by hand; she gets tweened into the pit.
        this.yvy = this.add.sprite(440, 530, 'yvy').setDepth(10);
        this.yvyFollow = true;
        this.wearEars(this.player);
        this.wearEars(this.yvy);

        this.backWall = this.add.rectangle(400, 124, GAME_WIDTH, 248, 0, 0);
        this.physics.add.existing(this.backWall, true);
        this.physics.add.collider(this.player, this.backWall);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.danceKey = isTouchMode() ? 'B' : 'F';
        this.danceTime = 0;
        showDanceButton(true);
        this.events.once('shutdown', () => showDanceButton(false));

        // Three zones with clear air between them: overlapping zones share one
        // keypress, and whichever handler runs first swallows it.
        this.danceZone = this.zoneAt(400, 384, 290, 240);
        this.zones = [
            [this.zoneAt(140, 312, 190, 110), () => this.meetTheSinger()],
            [this.zoneAt(660, 400, 220, 170), () => this.intoThePit()]
        ];
        this.zones.forEach(([zone, act]) => this.physics.add.overlap(this.player, zone, () => {
            if (this.ready && !this.busy && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) act();
        }));

        this.instructionText = this.add.text(20, 544, '', {
            fontSize: promptFontSize('14px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(20);
        this.updateTasks();

        stopMusic();
        playLeFestinTheme();
        this.time.delayedCall(800, () => this.narrate([
            "Mike had got them into a charity night at NOVA, and the theme was rabbits.",
            "Yvy: 'You planned this? Everybody's wearing ears.'",
            "Mike: 'I may have known about the ears.'"
        ], () => { this.ready = true; }));
    }

    zoneAt(x, y, w, h) {
        const z = this.add.rectangle(x, y, w, h, 0xffff00, 0);
        this.physics.add.existing(z, true);
        return z;
    }

    /** A pair of ears that follows whoever is wearing them. */
    wearEars(sprite, dy = -17) {
        const ears = this.add.image(sprite.x, sprite.y + dy, 'bunny_ears').setScale(sprite.scaleX);
        this.ears.push({ sprite, ears, dy });
    }

    buildRoom() {
        this.add.rectangle(400, 124, GAME_WIDTH, 248, 0x1a0f2e);
        for (let x = 0; x < GAME_WIDTH; x += 40) this.add.rectangle(x, 124, 2, 248, 0x221538);
        for (let x = 16; x < GAME_WIDTH; x += 32) this.add.image(x, 10, 'truss');
        [60, 200, 340, 460, 600, 740].forEach((x, i) => this.add.image(x, 28, 'par_can').setAngle(i % 2 ? 20 : -20));

        const halo = this.add.rectangle(400, 66, 210, 58, 0xff4fd8, 0.14);
        const sign = this.add.text(400, 66, 'NOVA', {
            fontSize: '46px', fontStyle: 'bold', color: '#ffe0f4', stroke: '#ff4fd8', strokeThickness: 6
        }).setOrigin(0.5);
        this.tweens.add({ targets: [sign, halo], alpha: 0.72, duration: 1100, yoyo: true, repeat: -1 });

        this.add.rectangle(400, 122, 300, 28, 0xf6e7f0);
        this.add.rectangle(400, 109, 300, 3, 0xff4fd8);
        this.add.rectangle(400, 135, 300, 3, 0xff4fd8);
        this.add.text(400, 122, 'CHARITY NIGHT', {
            fontSize: '15px', color: '#6a1f5a', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.image(232, 122, 'plush_bunny').setScale(1.7);
        this.add.image(568, 122, 'plush_bunny').setScale(1.7).setFlipX(true);

        // DJ at the back, in ears like everybody else.
        [300, 500].forEach(x => this.add.image(x, 196, 'speaker_stack').setScale(0.9));
        this.dj = this.add.sprite(400, 170, 'dj_1').setScale(1.1);
        this.wearEars(this.dj);
        this.add.image(400, 204, 'dj_booth').setScale(1.3);
        this.time.addEvent({ delay: 400, loop: true, callback: () => this.dj.setTexture(this.dj.texture.key === 'dj_1' ? 'dj_2' : 'dj_1') });
        this.add.rectangle(400, 246, GAME_WIDTH, 4, 0xff4fd8, 0.6);

        // The floor beyond the club's front wall: dark carpet round the edges.
        this.add.rectangle(400, 424, GAME_WIDTH, 352, 0x241634);
    }

    /** The little stage on the left, and him on it. */
    buildStage() {
        this.add.rectangle(140, 306, 190, 110, 0x2a1845);
        this.add.rectangle(140, 254, 190, 6, 0x4a2f6e);
        this.add.rectangle(140, 362, 190, 4, 0x0d0716);
        this.add.image(58, 278, 'speaker_stack').setScale(0.8);
        this.add.triangle(140, 20, 0, 0, -70, 300, 70, 300, 0xfff3c4, 0.08).setOrigin(0, 0);

        this.singer = this.add.sprite(140, 292, 'idol_singer').setScale(1.3).setDepth(9);
        this.wearEars(this.singer, -22);
        this.tweens.add({ targets: this.singer, y: 288, duration: 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.time.addEvent({ delay: 700, loop: true, callback: () => { if (!this.singerDone) this.noteFrom(this.singer); } });
        this.add.text(140, 374, 'LIVE TONIGHT', {
            fontSize: '10px', color: '#ffd6f2', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /** The dance floor, and a crowd in ears. */
    buildFloor() {
        for (let x = 256; x < 544; x += 32) {
            for (let y = 272; y < 504; y += 32) this.add.image(x, y, 'dance_floor_tile').setTint(0x7a5a9a);
        }
        const glows = [];
        for (let i = 0; i < 12; i++) {
            glows.push(this.add.rectangle(256 + ((i * 5) % 9) * 32, 272 + ((i * 3) % 8) * 32, 30, 30,
                [0xff4fd8, 0x00e5ff, 0xf7dc6f, 0x82e0aa][i % 4], 0));
        }
        this.time.addEvent({
            delay: 300, loop: true, callback: () => {
                const tile = glows[Math.floor(Math.random() * glows.length)];
                tile.setAlpha(0.4);
                this.tweens.add({ targets: tile, alpha: 0, duration: 550 });
            }
        });
        [[200, 0xff4fd8], [600, 0x00e5ff]].forEach(([bx, col], i) => {
            const beam = this.add.triangle(bx, 28, 0, 0, -44, 440, 44, 440, col, 0.08).setOrigin(0, 0);
            this.tweens.add({
                targets: beam, angle: { from: i ? 22 : -22, to: i ? -22 : 22 },
                duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        });

        [
            ['civilian', 286, 300, 0xb8d0e0], ['civilian_f', 512, 310, 0xf0c8d8],
            ['civilian', 300, 450, 0xd8c8a8], ['civilian_f', 500, 456, 0xd0e0f0],
            ['civilian_f', 420, 296, 0xe8d8b8]
        ].forEach(([key, x, y, tint], i) => {
            const dancer = this.add.sprite(x, y, key).setTint(tint).setDepth(8);
            this.wearEars(dancer);
            this.tweens.add({ targets: dancer, y: y - 7, duration: 210 + i * 25, yoyo: true, repeat: -1, delay: i * 70, ease: 'Sine.easeOut' });
            this.tweens.add({ targets: dancer, angle: { from: -8, to: 8 }, duration: 430 + i * 50, yoyo: true, repeat: -1 });
        });
    }

    /** The pit: padded pink walls and more stuffed rabbits than is reasonable. */
    buildPit() {
        const cx = 660, cy = 400;
        this.add.rectangle(cx, cy, 200, 150, 0xff8fc8);
        this.add.rectangle(cx, cy - 72, 200, 6, 0xffb3da);
        this.add.rectangle(cx, cy, 176, 126, 0xb04a8a);
        this.pitPlush = [];
        for (let i = 0; i < 70; i++) {
            const px = cx - 82 + Math.random() * 164;
            const py = cy - 56 + Math.random() * 112;
            this.pitPlush.push(this.add.image(px, py, 'plush_bunny')
                .setTint(PLUSH[i % PLUSH.length])
                .setAngle(Math.random() * 60 - 30)
                .setScale(1.2 + Math.random() * 0.4)
                .setDepth(5 + py / 1000));
        }
        this.add.rectangle(cx, cy + 71, 200, 8, 0xe070aa).setDepth(6);
        this.add.text(cx, cy - 94, 'BUNNY PIT', {
            fontSize: '15px', color: '#ffe0f4', fontStyle: 'bold', stroke: '#6a1f5a', strokeThickness: 4
        }).setOrigin(0.5);
    }

    noteFrom(sprite) {
        const note = this.add.sprite(sprite.x + Phaser.Math.Between(-10, 10), sprite.y - 20, 'music_note')
            .setTint(Phaser.Display.Color.RandomRGB(160, 255).color).setDepth(12);
        this.tweens.add({ targets: note, y: note.y - 40, alpha: 0, duration: 1100, onComplete: () => note.destroy() });
    }

    updateTasks() {
        const mark = key => (this.done[key] ? '✓ ' : '');
        this.instructionText.setText(
            `${mark('dance')}Dance: hold ${this.danceKey} on the dance floor
` +
            `${mark('singer')}Meet the singer   ${mark('pit')}Bunny pit   (${actionLabel()})`
        );
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

    /** Hold the scene still and hand control back afterwards. */
    beginBeat() {
        this.busy = true;
        this.player.isLocked = true;
        this.player.body.stop();
        this.yvyFollow = false;
    }

    endBeat() {
        this.player.isLocked = false;
        this.busy = false;
        this.yvyFollow = true;
        this.updateTasks();
        this.checkFinished();
    }

    /**
     * Step both of them through the dance poses while the key is held, the way
     * the club does. Enough of it counts as the dance done.
     */
    danceFrame(delta) {
        if (!this.isDancing) {
            this.isDancing = true;
            this.danceStep = -1;
            this.restTexture = { mike: this.player.texture.key, yvy: this.yvy.texture.key };
        }
        const step = Math.floor(this.time.now / 170) % MIKE_DANCE.length;
        if (step !== this.danceStep) {
            this.danceStep = step;
            this.player.setTexture(MIKE_DANCE[step]);
            this.yvy.setTexture(YVY_DANCE[(step + 2) % YVY_DANCE.length]);
            if (step === 0) this.noteFrom(this.player);
        }
        this.danceTime += delta;
        if (!this.done.dance && this.danceTime > 2400) {
            this.done.dance = true;
            this.updateTasks();
            this.narrate(
                ["They danced like nobody was wearing bunny ears. Everybody was wearing bunny ears."],
                () => this.checkFinished()
            );
        }
    }

    /** Back to standing, in whatever each of them had on. */
    stopDancing() {
        if (!this.isDancing) return;
        this.isDancing = false;
        this.player.setTexture(this.restTexture.mike);
        this.yvy.setTexture(this.restTexture.yvy);
    }

    meetTheSinger() {
        if (this.done.singer) return showDialogue("Singer: 'Enjoy the rest of your night, you two!'");
        this.beginBeat();
        this.narrate([
            "Mike: 'Wait. Is that...'",
            "Yvy: 'That's the guy from American Idol! The one who sang She Bangs!'",
            "He finished his song to the loudest cheer of the whole night.",
            "Singer: 'Thank you! Thank you all so much for coming out tonight!'",
            "Mike: 'Could we get a picture with you?'",
            "Singer: 'Of course! Get in here. Ears up!'"
        ], () => {
            this.singerDone = true;
            this.player.body.reset(104, 322);
            this.player.setFlipX(false);
            this.yvy.setPosition(176, 322).setFlipX(true);
            const phone = this.add.image(140, 386, 'phone_cam').setScale(1.4).setDepth(12);
            this.time.delayedCall(650, () => {
                this.cameras.main.flash(250, 255, 255, 255);
                takePhoto({
                    key: 'idol', title: 'NOVA',
                    caption: "Ears on, with the American Idol guy who sang She Bangs.",
                    window: 0x2a1240,
                    sprites: [
                        { circle: 34, x: 0, y: -30, color: 0xff4fd8, alpha: 0.25 },
                        { texture: this.outfit, x: -26, y: -8 },
                        { texture: 'bunny_ears', x: -26, y: -25 },
                        { texture: 'idol_singer', x: 0, y: -10 },
                        { texture: 'bunny_ears', x: 0, y: -27 },
                        { texture: 'yvy', x: 26, y: -8 },
                        { texture: 'bunny_ears', x: 26, y: -25 }
                    ]
                });
                phone.destroy();
                this.done.singer = true;
                this.narrate(["They took pictures with him. Ears up, every one."], () => this.endBeat());
            });
        });
    }

    intoThePit() {
        if (this.done.pit) return showDialogue("Yvy: 'I'm still finding bunnies in my hair.'");
        this.beginBeat();
        this.narrate([
            "Yvy: 'Mike. MIKE. There is a pit. Full of bunnies.'",
            "Mike: 'We're getting in the pit.'"
        ], () => {
            playSound('whoosh');
            // He is an arcade body, so the jump is walked through body.reset();
            // a tween on his x and y would be quietly undone by the physics step.
            const from = { x: this.player.x, y: this.player.y };
            const arc = { t: 0 };
            this.tweens.add({
                targets: arc, t: 1, duration: 600, ease: 'Sine.easeInOut',
                onUpdate: () => this.player.body.reset(
                    Phaser.Math.Linear(from.x, 640, arc.t),
                    Phaser.Math.Linear(from.y, 392, arc.t) - Math.sin(arc.t * Math.PI) * 40
                )
            });
            this.tweens.add({ targets: this.yvy, x: 684, y: 392, duration: 600, ease: 'Sine.easeInOut' });

            this.time.delayedCall(640, () => {
                // In among them: the rabbits behind them stay behind, the ones in
                // front come up over their legs.
                this.player.setDepth(5.4);
                this.yvy.setDepth(5.4);
                this.pitPlush.forEach(b => this.tweens.add({
                    targets: b, y: b.y - Phaser.Math.Between(6, 24), angle: b.angle + Phaser.Math.Between(-40, 40),
                    duration: 260, yoyo: true, ease: 'Sine.easeOut'
                }));
                for (let i = 0; i < 16; i++) {
                    this.add.image(618 + Math.random() * 88, 404 + Math.random() * 14, 'plush_bunny')
                        .setTint(PLUSH[i % PLUSH.length]).setAngle(Math.random() * 60 - 30)
                        .setScale(1.3).setDepth(5.9);
                }
                const phone = this.add.image(662, 492, 'phone_cam').setScale(1.4).setDepth(12);
                this.time.delayedCall(700, () => {
                    this.cameras.main.flash(250, 255, 255, 255);
                    takePhoto({
                        key: 'bunnies', title: 'The bunny pit',
                        caption: "Up to their shoulders in stuffed rabbits.",
                        window: 0xb04a8a,
                        sprites: [
                            { texture: this.outfit, x: -12, y: -14 },
                            { texture: 'bunny_ears', x: -12, y: -31 },
                            { texture: 'yvy', x: 12, y: -14 },
                            { texture: 'bunny_ears', x: 12, y: -31 },
                            { texture: 'plush_bunny', x: -52, y: -14, tint: PLUSH[2] },
                            { texture: 'plush_bunny', x: 50, y: -10, tint: PLUSH[4] },
                            ...[-60, -44, -28, -12, 4, 20, 36, 52].map((bx, i) => (
                                { texture: 'plush_bunny', x: bx, y: 2 + (i % 2) * 4, tint: PLUSH[i % PLUSH.length] }
                            ))
                        ]
                    });
                    phone.destroy();
                    this.done.pit = true;
                    this.narrate(["And pictures in the bunny pit, up to their shoulders in stuffed rabbits."], () => {
                        this.player.setDepth(10);
                        this.yvy.setDepth(10);
                        this.player.body.reset(640, 512);
                        this.yvy.setPosition(680, 512);
                        this.endBeat();
                    });
                });
            });
        });
    }

    checkFinished() {
        if (this.leaving || !Object.values(this.done).every(Boolean)) return;
        this.leaving = true;
        this.player.isLocked = true;
        this.time.delayedCall(600, () => this.narrate([
            "It was all for a good cause. Mostly, it was a very good night."
        ], () => {
            this.cameras.main.fadeOut(1200, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                stopMusic();
                this.scene.start('DowntownScene');
            });
        }));
    }

    update(time, delta) {
        const dancing = this.ready && !this.busy && !this.leaving && this.fKey.isDown
            && !isDialogueOpen() && this.physics.overlap(this.player, this.danceZone);
        if (dancing) {
            this.player.body.stop();
            this.danceFrame(delta);
        } else {
            this.stopDancing();
            this.player.update(this.cursors);
        }
        if (this.yvyFollow) {
            const dx = this.player.x + 28 - this.yvy.x;
            const dy = this.player.y - this.yvy.y;
            if (Math.hypot(dx, dy) > 6) {
                this.yvy.x += dx * 0.08;
                this.yvy.y += dy * 0.08;
                this.yvy.setFlipX(dx < 0);
            }
        }
        this.ears.forEach(({ sprite, ears, dy }) => {
            ears.setPosition(sprite.x, sprite.y + dy).setDepth(sprite.depth + 0.05);
        });
        const near = this.ready && !this.busy && this.zones.some(([zone]) => this.physics.overlap(this.player, zone));
        document.getElementById('interaction-hint').style.display = near ? 'block' : 'none';
    }
}

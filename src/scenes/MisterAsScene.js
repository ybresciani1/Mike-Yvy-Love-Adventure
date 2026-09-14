import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playRomanticTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

/**
 * Mister A's: the rooftop restaurant twelve floors up, at dusk, with downtown
 * and the bay underneath it and the planes coming in to land close enough to
 * see into the windows. Yvy's first beef tartare, and a picture at the rail.
 */
export class MisterAsScene extends Phaser.Scene {
    constructor() { super('MisterAsScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#23305a');
        this.solids = [];
        this.buildView();
        this.buildTerrace();
        this.buildDiners();

        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 368, 392);
        this.player.setTexture(outfit).setDepth(6);
        this.player.isLocked = true;
        // Yvy is a plain sprite, moved by hand: tweening an arcade body's
        // position is undone by the body every step, and she has to be tweened.
        this.yvy = this.add.sprite(432, 392, 'yvy_black').setDepth(6).setFlipX(true);
        this.add.image(400, 428, 'rooftop_table').setScale(1.3).setDepth(7);
        this.block(400, 440, 86, 26);

        this.solids.forEach(s => this.physics.add.collider(this.player, s));
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.add.text(400, 22, "Mister A's", {
            fontSize: '20px', color: '#fff4dc', fontStyle: 'bold',
            backgroundColor: '#00000088', padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setDepth(20);
        this.instructionText = this.add.text(20, 560, "Twelve floors up", {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(20);

        this.photoZone = this.add.rectangle(210, 340, 120, 60, 0xffff00, 0);
        this.physics.add.existing(this.photoZone, true);
        this.physics.add.overlap(this.player, this.photoZone, () => {
            if (this.canPhoto && !this.photoTaken && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) {
                this.thePhoto();
            }
        });

        stopMusic();
        playRomanticTheme();
        this.time.delayedCall(900, () => this.theDinner());
    }

    block(x, y, w, h) {
        const b = this.add.rectangle(x, y, w, h, 0, 0);
        this.physics.add.existing(b, true);
        this.solids.push(b);
    }

    /** Dusk over the bay, downtown with its lights coming on, and the runway. */
    buildView() {
        [[0x1f2b57, 0, 50], [0x2e3d6e, 50, 40], [0x4a4f82, 90, 34], [0x7a5f8a, 124, 30],
         [0xb86f7c, 154, 26], [0xe08a62, 180, 24], [0xf2a75a, 204, 22]]
            .forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));
        this.add.circle(650, 222, 26, 0xffd27a, 0.35);
        this.add.circle(650, 222, 16, 0xffe3a8);

        this.add.rectangle(400, 262, GAME_WIDTH, 60, 0x3b5a86); // the bay
        for (let i = 0; i < 40; i++) {
            this.add.rectangle(Math.random() * GAME_WIDTH, 240 + Math.random() * 44,
                6 + Math.random() * 12, 1, 0xf2a75a, 0.45);
        }
        this.add.rectangle(680, 286, 260, 7, 0x4a4d57); // the runway along the water
        for (let rx = 556; rx < GAME_WIDTH; rx += 14) this.add.rectangle(rx, 286, 2, 2, 0xfff3b0);

        this.add.image(330, 226, 'sd_skyline').setScale(2.1).setTint(0x6a6a90);
        // Windows lighting up as it gets dark.
        for (let i = 0; i < 40; i++) {
            const lit = this.add.rectangle(150 + Math.random() * 360, 240 + Math.random() * 44, 2, 2, 0xffe08a, 0.9);
            this.tweens.add({
                targets: lit, alpha: 0.25, duration: 800 + Math.random() * 1600,
                yoyo: true, repeat: -1, delay: Math.random() * 1500
            });
        }

        // The planes into Lindbergh come in over this building. That is the
        // famous part.
        this.time.delayedCall(1200, () => this.landing());
        this.time.addEvent({ delay: 6500, loop: true, callback: () => this.landing() });
    }

    landing() {
        const plane = this.add.image(880, 60, 'airliner').setScale(0.7).setFlipX(true).setDepth(2);
        const light = this.add.circle(plane.x - 30, plane.y + 4, 3, 0xfff3b0).setDepth(2);
        this.tweens.add({
            targets: plane, x: 560, y: 276, scale: 0.45, duration: 7000, ease: 'Sine.easeIn',
            onUpdate: () => light.setPosition(plane.x - 42 * plane.scale, plane.y + 4),
            onComplete: () => { plane.destroy(); light.destroy(); }
        });
    }

    /** The deck, the glass, the heaters, the lights strung overhead. */
    buildTerrace() {
        this.add.rectangle(400, 450, GAME_WIDTH, 300, 0xcdc3b2);
        for (let y = 316; y < GAME_HEIGHT; y += 28) this.add.rectangle(400, y, GAME_WIDTH, 1, 0xb5aa97);
        for (let x = 0; x < GAME_WIDTH; x += 56) this.add.rectangle(x, 450, 1, 300, 0xbbb09d);
        for (let x = 16; x < GAME_WIDTH; x += 32) this.add.image(x, 300, 'glass_rail').setScale(1, 1.2).setDepth(3);
        this.block(400, 300, GAME_WIDTH, 36);

        [70, 730].forEach(x => {
            this.add.circle(x, 346, 38, 0xff9a4d, 0.12).setDepth(4);
            this.add.image(x, 372, 'patio_heater').setScale(1.4).setDepth(4);
        });
        for (let x = 32; x < GAME_WIDTH; x += 64) this.add.image(x, 52, 'string_lights').setDepth(5);
    }

    buildDiners() {
        [
            [160, 476, 'civilian', 'civilian_f', 0xc8b8a8, 0xb8c8d8],
            [640, 476, 'civilian_f', 'civilian', 0xd8c8e0, 0xc0d0b8]
        ].forEach(([tx, ty, a, b, ta, tb]) => {
            this.add.sprite(tx - 26, ty - 36, a).setTint(ta).setDepth(6);
            this.add.sprite(tx + 26, ty - 36, b).setTint(tb).setFlipX(true).setDepth(6);
            this.add.image(tx, ty, 'rooftop_table').setScale(1.3).setDepth(7);
            this.block(tx, ty + 12, 86, 26);
        });
        this.server = this.add.sprite(760, 420, 'server').setDepth(8);
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

    theDinner() {
        this.narrate([
            "Later that trip, Mike took Yvy to Mister A's, where he had booked them a table: a rooftop, twelve floors up, with the whole city underneath it.",
            "Yvy: 'Mike. Look at the planes. They come in so close you can see into the windows.'",
            "Mike: 'Okay. That one was way too close.'"
        ], () => this.theTartare());
    }

    theTartare() {
        this.tweens.add({
            targets: this.server, x: 476, y: 390, duration: 1800, ease: 'Sine.easeInOut',
            onComplete: () => {
                this.plate = this.add.image(412, 418, 'tartare_plate').setScale(1.3).setDepth(8);
                playSound('select');
                this.narrate([
                    "Server: 'The beef tartare. Enjoy.'",
                    "Yvy: 'I've never actually had this.'",
                    "Mike: 'Raw beef, egg yolk on top. Trust me.'",
                    "Yvy: '...Raw?'"
                ], () => {
                    this.tweens.add({ targets: this.server, x: 760, y: 420, duration: 1600, ease: 'Sine.easeInOut' });
                    this.firstBite();
                });
            }
        });
    }

    firstBite() {
        const fork = this.add.rectangle(this.yvy.x - 12, this.yvy.y + 6, 2, 7, 0xd2d6da).setDepth(9);
        this.tweens.add({
            targets: fork, y: this.yvy.y - 6, duration: 500, yoyo: true, repeat: 2,
            ease: 'Sine.easeInOut', onComplete: () => fork.destroy()
        });
        this.tweens.add({ targets: this.yvy, y: this.yvy.y - 3, duration: 500, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: this.plate, scale: 0.9, alpha: 0.7, duration: 3000 });
        this.saySoon("Yvy tries beef tartare for the first time.", () => {
            this.time.delayedCall(900, () => this.narrate([
                "Yvy: 'Oh no. Oh no, that's really good.'",
                "Mike: 'Told you.'",
                "Yvy: 'Don't. I know. Give me the other crostini.'"
            ], () => this.upForAPicture()));
        });
    }

    upForAPicture() {
        this.player.isLocked = false;
        this.following = true;
        this.canPhoto = true;
        this.instructionText.setText(`Take a picture at the railing (${actionLabel()})`);
        this.photoMarker = this.add.circle(210, 334, 20, 0xffe08a, 0.3).setDepth(2);
        this.tweens.add({ targets: this.photoMarker, alpha: 0.08, duration: 700, yoyo: true, repeat: -1 });
    }

    thePhoto() {
        this.photoTaken = true;
        this.following = false;
        this.player.isLocked = true;
        this.photoMarker.destroy();
        this.instructionText.setText('Smile');

        this.player.body.reset(196, 336);
        this.player.setFlipX(false);
        this.tweens.add({ targets: this.yvy, x: 226, y: 336, duration: 450 });
        this.yvy.setFlipX(true);
        const phone = this.add.image(211, 396, 'phone_cam').setScale(1.4).setDepth(10);

        this.time.delayedCall(700, () => {
            this.cameras.main.flash(250, 255, 255, 255);
            takePhoto({
                key: 'rooftop', title: "Mister A's",
                caption: "Twelve floors up, the night of her first beef tartare.",
                window: 0x3a3f72,
                sprites: [
                    { rect: [180, 26], x: 0, y: -52, color: 0xe08a62, alpha: 0.6 },
                    { texture: 'sd_skyline', x: 0, y: -38, scale: 0.9, tint: 0x6a6a90 },
                    { texture: this.player.texture.key, x: -12, y: -6 },
                    { texture: 'yvy_black', x: 12, y: -6 },
                    { texture: 'glass_rail', x: -48, y: 4 },
                    { texture: 'glass_rail', x: -16, y: 4 },
                    { texture: 'glass_rail', x: 16, y: 4 },
                    { texture: 'glass_rail', x: 48, y: 4 }
                ]
            });
            phone.destroy();
            this.narrate([
                "They took a picture at the rail, with the whole city lighting up behind them.",
                "After dinner, Mike had one more thing planned. They walked downtown."
            ], () => {
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    stopMusic();
                    this.scene.start('NovaScene');
                });
            });
        });
    }

    update() {
        this.player.update(this.cursors);
        if (this.following) {
            const dx = this.player.x + 30 - this.yvy.x;
            const dy = this.player.y - this.yvy.y;
            if (Math.hypot(dx, dy) > 6) {
                this.yvy.x += dx * 0.08;
                this.yvy.y += dy * 0.08;
                this.yvy.setFlipX(dx < 0);
            }
        }
        const near = this.canPhoto && !this.photoTaken && this.physics.overlap(this.player, this.photoZone);
        document.getElementById('interaction-hint').style.display = near ? 'block' : 'none';
    }
}

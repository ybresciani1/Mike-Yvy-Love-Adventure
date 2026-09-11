import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { fadeOutMusic } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';

/**
 * Inside Coin-Op, where two men at the pinball machine offer to buy a drink for
 * the dinosaur and find out too late who is inside it.
 */
export class CoinOpScene extends Phaser.Scene {
    constructor() { super('CoinOpScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#12141c');
        this.buildRoom();

        this.player = new Player(this, 110, 500);
        this.player.setTexture('mike_dino');
        this.yvy = this.physics.add.sprite(60, 500, 'yvy_dino');

        this.backWall = this.add.rectangle(400, 150, GAME_WIDTH, 300, 0x000000, 0);
        this.physics.add.existing(this.backWall, true);
        this.physics.add.collider(this.player, this.backWall);
        this.physics.add.collider(this.yvy, this.backWall);

        this.pinZone = this.add.rectangle(560, 436, 160, 100, 0xffff00, 0);
        this.physics.add.existing(this.pinZone, true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.add.text(20, 560, "Find the Jurassic Park table (Space)", {
            fontSize: '15px', color: '#9fe8ff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        });

        this.physics.add.overlap(this.player, this.pinZone, () => {
            if (!this.done && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.thePinball();
        });
    }

    buildRoom() {
        // Dark ceiling with the red neon strip running along it.
        this.add.rectangle(400, 26, GAME_WIDTH, 52, 0x171a24);
        this.add.rectangle(400, 44, GAME_WIDTH, 4, 0xe8384c);
        this.add.rectangle(400, 44, GAME_WIDTH, 2, 0xff8a96);
        this.add.rectangle(400, 60, GAME_WIDTH, 10, 0x1d2130);
        // A wash of green off the far wall, which is what the room actually
        // looks like from the door.
        this.add.rectangle(400, 150, GAME_WIDTH, 180, 0x1d3a30, 0.55);

        this.add.image(400, 104, 'coin_marquee').setScale(1.4).setDepth(2);

        // The back wall: a bar, and a row of cabinets down each side of it.
        this.add.rectangle(400, 232, 300, 84, 0x1b1f2b);
        this.add.rectangle(400, 200, 300, 20, 0x262b3a);
        for (let bx = 268; bx < 532; bx += 26) {
            this.add.rectangle(bx, 196, 6, 14, 0x3a4150);
            this.add.rectangle(bx, 188, 8, 4, 0x8a93a8);
        }
        this.add.rectangle(400, 262, 300, 10, 0x3a3020);
        this.add.rectangle(400, 258, 300, 3, 0x6b5a3a);
        this.add.sprite(400, 236, 'bartender').setTint(0xc8c0d0).setDepth(1);

        for (let i = 0; i < 5; i++) {
            this.add.image(52 + i * 44, 214, 'arcade_cab')
                .setTint([0xffffff, 0xd8d0ff, 0xffd8e8, 0xd8fff0, 0xfff0d0][i]).setDepth(1);
        }
        for (let i = 0; i < 5; i++) {
            this.add.image(572 + i * 44, 214, 'arcade_cab')
                .setTint([0xffe8d0, 0xd0e8ff, 0xffffff, 0xe8d0ff, 0xd0ffd8][i]).setDepth(1);
        }

        // The rainbow chevrons down the middle of the floor.
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 9; y < GAME_HEIGHT / 32; y++) {
                this.add.image(x * 32 + 16, y * 32 + 16, 'floor_tile').setTint(0x3a3f4e);
            }
        }
        // A painted path in from the door, not a carpet over the whole room.
        for (let ry = 300; ry < GAME_HEIGHT; ry += 32) {
            for (let rx = 328; rx < 472; rx += 48) this.add.image(rx, ry, 'rainbow_floor').setAlpha(0.5);
        }

        // Cabinets out on the floor, and the pinball they end up at.
        [[120, 360], [210, 360], [700, 360]].forEach(([cx, cy], i) => {
            this.add.image(cx, cy, 'arcade_cab').setScale(1.2)
                .setTint([0xffffff, 0xffe0e8, 0xe0f0ff][i]).setDepth(2);
        });
        this.pinball = this.add.image(560, 392, 'jurassic_pinball').setScale(1.4).setDepth(2);
        this.tweens.add({ targets: this.pinball, alpha: 0.92, duration: 420, yoyo: true, repeat: -1 });
        this.add.text(560, 348, "JURASSIC PARK", {
            fontSize: '9px', color: '#f2c14e', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(3);

        // Everyone else, having a normal Saturday — until the dinosaurs get on
        // the Jurassic Park table, at which point they all come over.
        this.crowd = [];
        [[300, 330, 0x9c8cb0], [470, 326, 0xb0a08c], [160, 470, 0x8ca0b4],
         [330, 500, 0xb08ca0], [690, 470, 0xa0b08c], [240, 420, 0x9cb0a8]].forEach(([gx, gy, tint], i) => {
            const guest = this.add.sprite(gx, gy, i % 2 ? 'civilian_f' : 'civilian').setTint(tint).setDepth(4);
            this.crowd.push(guest);
            this.tweens.add({ targets: guest, y: gy - 3, duration: 1200 + i * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        this.time.addEvent({
            delay: 2600, loop: true, callback: () => playSound('vr_boop')
        });
    }

    /**
     * Two dinosaurs playing the Jurassic Park table is more than the room can
     * ignore. Half of Coin-Op comes over with a phone out.
     */
    thePinball() {
        this.done = true;
        playSound('vr_boop');

        // They step up to the table.
        this.tweens.add({ targets: this.player, x: 532, y: 442, duration: 700, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: this.yvy, x: 596, y: 442, duration: 700, ease: 'Sine.easeOut' });

        const lines = [
            "Mike: 'It's the Jurassic Park table. It's the JURASSIC PARK TABLE.'",
            "Yvy: 'I know.'",
            "Mike: 'We are dressed as DINOSAURS.'",
            "Yvy: 'I KNOW, Mike.'",
            "He cannot reach the flippers. The arms do not go that far.",
            "Yvy has to work the right flipper for him. They are, somehow, doing well."
        ];
        let i = 0;
        const next = () => {
            if (i >= lines.length) return this.everyonePhotographsThem();
            showDialogue(lines[i++], next);
        };
        next();
    }

    everyonePhotographsThem() {
        // Whoever is nearest drifts over, phone first.
        this.crowd.forEach((who, i) => {
            const toX = 470 + (i % 4) * 42;
            const toY = 500 + Math.floor(i / 4) * 26;
            this.tweens.add({
                targets: who, x: toX, y: toY, duration: 900 + i * 140, ease: 'Sine.easeInOut',
                onComplete: () => {
                    const phone = this.add.sprite(who.x + 10, who.y - 10, 'phone_cam').setScale(0.9).setDepth(6);
                    this.tweens.add({ targets: phone, y: phone.y - 2, duration: 620 + i * 70, yoyo: true, repeat: -1 });
                    playSound('shutter');
                    const flash = this.add.rectangle(this.pinball.x, this.pinball.y, 130, 90, 0xffffff, 0.35).setDepth(9);
                    this.tweens.add({ targets: flash, alpha: 0, duration: 320, onComplete: () => flash.destroy() });
                }
            });
        });

        this.time.delayedCall(2400, () => {
            takePhoto({
                key: 'coinop', title: 'Coin-Op',
                caption: "Two dinosaurs on the Jurassic Park table. Everyone filmed it.",
                sprites: [
                    { texture: 'jurassic_pinball', x: 0, y: -6, scale: 0.9 },
                    { texture: 'mike_dino', x: -26, y: 8, scale: 0.6 },
                    { texture: 'yvy_dino', x: 26, y: 8, scale: 0.6 },
                    { texture: 'phone_cam', x: -44, y: 16, scale: 0.8 },
                    { texture: 'phone_cam', x: 44, y: 16, scale: 0.8 }
                ]
            });
            const chain = [
                "Half the room has a phone out.",
                "Somebody: 'Mate. MATE. Look at the table they picked.'",
                "Yvy: 'We are going to be on someone's story by midnight.'",
                "Mike: 'Worth it. Look at the score.'"
            ];
            let j = 0;
            const after = () => {
                if (j >= chain.length) {
                    fadeOutMusic(2);
                    this.time.delayedCall(1000, () => this.scene.start('TravelScene'));
                    return;
                }
                showDialogue(chain[j++], after);
            };
            after();
        });
    }

    update() {
        this.player.update(this.cursors);
        const gap = Phaser.Math.Distance.BetweenPoints(this.player, this.yvy);
        if (gap > 54) this.physics.moveToObject(this.yvy, this.player, 120);
        else this.yvy.body.stop();
        document.getElementById('interaction-hint').style.display =
            (!this.done && this.physics.overlap(this.player, this.pinZone)) ? 'block' : 'none';
    }
}

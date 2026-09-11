import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';

/**
 * Inside Fifth & Rose. Mike's cousin runs the place, and the two of them have
 * walked into her cocktail bar dressed as dinosaurs.
 */
export class FifthRoseScene extends Phaser.Scene {
    constructor() { super('FifthRoseScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#0d0f13');
        this.buildRoom();

        this.player = new Player(this, 120, 470);
        this.player.setTexture('mike_dino');
        this.yvy = this.physics.add.sprite(70, 470, 'yvy_dino');

        // The bar itself is solid. You walk along it, not through it.
        this.barBlock = this.add.rectangle(400, 306, 700, 46, 0x000000, 0);
        this.physics.add.existing(this.barBlock, true);
        this.physics.add.collider(this.player, this.barBlock);
        this.physics.add.collider(this.yvy, this.barBlock);
        this.backWall = this.add.rectangle(400, 130, GAME_WIDTH, 260, 0x000000, 0);
        this.physics.add.existing(this.backWall, true);
        this.physics.add.collider(this.player, this.backWall);
        this.physics.add.collider(this.yvy, this.backWall);

        // The cousin, at the end of the bar with a clipboard, because she is
        // working and they are not.
        this.cousin = this.add.sprite(620, 360, 'civilian_f').setTint(0xd8c4a8).setDepth(5);
        this.add.rectangle(628, 362, 5, 7, 0xe8e2d6).setDepth(6);
        this.tweens.add({ targets: this.cousin, y: 356, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        // The whole corner of the room she is standing in. The old zone started
        // at y=358, and a player walked up against the bar — which is where you
        // stand to talk to someone working behind it — sits just above that, so
        // you could be shoulder to shoulder with her and get no prompt.
        this.cousinZone = this.add.rectangle(620, 400, 150, 140, 0xffff00, 0);
        this.physics.add.existing(this.cousinZone, true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.add.text(20, 560, "Find Mike's cousin (Space)", {
            fontSize: '15px', color: '#f2dcc4', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        });

        this.physics.add.overlap(this.player, this.cousinZone, () => {
            if (!this.met && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.meetHer();
        });
    }

    buildRoom() {
        // Pressed-tin ceiling and the deep shadow above the bar.
        this.add.rectangle(400, 20, GAME_WIDTH, 40, 0x171a1f);
        for (let tx = 16; tx < GAME_WIDTH; tx += 32) {
            this.add.rectangle(tx, 20, 26, 26, 0x1f232a);
            this.add.rectangle(tx, 20, 14, 14, 0x272c34);
        }

        // The plate wall: rows of chargers in a steel grid, hung over the bar.
        for (let px = 32; px < GAME_WIDTH; px += 64) {
            this.add.image(px, 76, 'plate_wall');
        }
        this.add.rectangle(400, 104, GAME_WIDTH, 5, 0x101318);
        this.add.rectangle(400, 108, GAME_WIDTH, 3, 0x2a2f38);

        // Backbar, lit, with the mirror behind the bottles.
        this.add.rectangle(400, 190, GAME_WIDTH, 90, 0x15181d);
        for (let bx = 32; bx < 640; bx += 64) this.add.image(bx, 196, 'rose_backbar');
        this.add.rectangle(400, 244, 640, 4, 0xe8b45c, 0.5);

        // The room beyond the bar: glazing, a palm, the chandelier.
        this.add.rectangle(716, 190, 168, 180, 0x1b2028);
        for (let wy = 120; wy < 270; wy += 46) {
            this.add.rectangle(716, wy, 150, 38, 0x2c3a4a);
            this.add.rectangle(716, wy - 14, 150, 8, 0x3d5064);
        }
        this.add.rectangle(716, 190, 5, 180, 0x11151b);
        this.add.image(724, 150, 'chandelier').setScale(1.1);
        this.add.image(742, 300, 'pothos').setScale(1.4);
        this.add.image(766, 360, 'plant_fern').setScale(1.3);

        // Hexagonal floor.
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 10; y < GAME_HEIGHT / 32; y++) {
                this.add.image(x * 32 + 16, y * 32 + 16, 'hex_floor');
            }
        }

        // The long bar, its stools, and what has been left on it.
        for (let bx = 64; bx < 700; bx += 64) this.add.image(bx, 296, 'rose_bar');
        this.add.rectangle(400, 320, 700, 3, 0xffd98a, 0.35); // the light under the lip
        for (let sx = 96; sx < 660; sx += 58) {
            this.add.image(sx, 348, 'leather_stool').setDepth(2);
        }
        [[120, 288], [210, 290], [330, 288], [452, 290], [560, 288]].forEach(([gx, gy], i) => {
            this.add.image(gx, gy, i % 2 ? 'margarita' : 'cocktail').setScale(0.75).setDepth(3);
        });
        this.add.image(276, 286, 'champagne_service').setScale(0.7).setDepth(3);

        // A bartender working, and a few people in actual clothes.
        this.add.sprite(300, 258, 'bartender').setDepth(1);
        this.tweens.add({ targets: this.add.sprite(470, 258, 'bartender').setDepth(1).setTint(0xd0c8bc), y: 254, duration: 1500, yoyo: true, repeat: -1 });
        [[154, 336, 0x9c8cb0], [386, 336, 0xb09c8c], [500, 336, 0x8cb0a0]].forEach(([gx, gy, tint], i) => {
            const guest = this.add.sprite(gx, gy, i % 2 ? 'civilian_f' : 'civilian').setTint(tint).setDepth(1);
            this.tweens.add({ targets: guest, y: gy - 2, duration: 1300 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        this.add.text(400, 46, "FIFTH & ROSE", {
            fontSize: '15px', color: '#f2c4d2', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(4);
    }

    meetHer() {
        this.met = true;
        playSound('select');
        this.tweens.add({ targets: this.cousin, x: 560, y: 392, duration: 900, ease: 'Sine.easeOut' });

        const lines = [
            "Cousin: 'Good evening, welcome to Fifth &—'",
            "Cousin: '...'",
            "Cousin: 'Michael.'",
            "Mike: 'Hi!'",
            "Cousin: 'I run this building. I am responsible for this room.'",
            "Yvy: 'He has a bow tie. Show her the bow tie.'",
            "Mike turns slightly, so the packing tape catches the light.",
            "Cousin: 'Is that TAPE?'",
            "Mike: 'It's black tie. You said dress up.'",
            "Cousin: 'I said dress UP. Not dress as a THEROPOD.'",
            "She is trying very hard to keep her manager face on. She is losing.",
            "Cousin: 'Right. Corner booth, out of the way, and I am buying. Go.'",
            "Two of the house cocktails arrive, which is how she says she is glad they came.",
            "Cousin: 'Hold them up. Both of you. I am not letting this go unrecorded.'",
            "Mike: 'The arms don't reach. I physically cannot lift this to my face.'",
            "Cousin: 'Hold. Them. Up.'"
        ];
        let i = 0;
        const next = () => {
            if (i >= lines.length) return this.thePhotograph();
            showDialogue(lines[i++], next);
        };
        next();
    }

    /** Two dinosaurs, two cocktails held at arm's length, one flash. */
    thePhotograph() {
        const drinks = [
            this.add.sprite(this.player.x + 22, this.player.y - 6, 'cocktail').setScale(0.9).setDepth(7),
            this.add.sprite(this.yvy.x - 22, this.yvy.y - 6, 'margarita').setScale(0.9).setDepth(7)
        ];
        drinks.forEach((d, i) => this.tweens.add({
            targets: d, y: d.y - 14, duration: 600, delay: i * 180, ease: 'Back.easeOut'
        }));
        // The cousin lifts her phone.
        const phone = this.add.sprite(this.cousin.x, this.cousin.y - 16, 'phone_cam').setDepth(7);
        this.tweens.add({ targets: phone, y: phone.y - 4, duration: 500, yoyo: true, repeat: -1 });

        this.time.delayedCall(900, () => {
            playSound('shutter');
            const flash = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0.6).setDepth(20);
            this.tweens.add({ targets: flash, alpha: 0, duration: 380, onComplete: () => flash.destroy() });
            takePhoto({
                key: 'dinos', title: 'Fifth & Rose',
                caption: "Her bar, her camera, and a bow tie made of packing tape.",
                sprites: [
                    { texture: 'mike_dino', x: -16, y: 2, scale: 0.7 },
                    { texture: 'yvy_dino', x: 16, y: 2, scale: 0.7 },
                    { texture: 'cocktail', x: -34, y: -4, scale: 0.8 },
                    { texture: 'margarita', x: 34, y: -4, scale: 0.8 }
                ]
            });
            showDialogue("Cousin: 'Perfect. That is going on the wall.'", () => {
                [...drinks, phone].forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
                showDialogue("Mike: 'Right — Coin-Op next. I've been promised a pinball machine.'", () => {
                    this.scene.start('CoinOpWalkScene');
                });
            });
        });
    }

    update() {
        this.player.update(this.cursors);
        const gap = Phaser.Math.Distance.BetweenPoints(this.player, this.yvy);
        if (gap > 54) this.physics.moveToObject(this.yvy, this.player, 120);
        else this.yvy.body.stop();
        document.getElementById('interaction-hint').style.display =
            (!this.met && this.physics.overlap(this.player, this.cousinZone)) ? 'block' : 'none';
    }
}

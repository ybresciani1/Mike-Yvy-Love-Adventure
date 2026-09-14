import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playBlueTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

/**
 * The bar behind the wall at Raised by Wolves: a huge glowing dome with iron
 * ribs, a round gold bar in the middle of the room, and a stone fountain rising
 * out of the bottles. Yvy has the horchata; Mike has the one in the cup.
 */
export class WolvesBarScene extends Phaser.Scene {
    constructor() { super('WolvesBarScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a120c');
        this.outfit = this.game.registry.get('playerOutfit') || 'mike_suit';

        // Dome first: the walls, floor and ceiling are laid over its edges.
        this.buildDome();
        this.buildRoom();
        this.buildBar();
        this.buildPatrons();

        this.player = new Player(this, 170, 540);
        this.player.setTexture(this.outfit).setDepth(20);
        this.yvy = this.add.sprite(214, 540, 'yvy_red').setDepth(20);
        this.yvyFollow = true;

        [[400, 336, 300, 70], [45, 300, 90, GAME_HEIGHT], [755, 300, 90, GAME_HEIGHT], [400, 122, GAME_WIDTH, 248]]
            .forEach(([x, y, w, h]) => {
                const b = this.add.rectangle(x, y, w, h, 0, 0);
                this.physics.add.existing(b, true);
                this.physics.add.collider(this.player, b);
            });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.barZone = this.add.rectangle(400, 400, 280, 50, 0xffff00, 0);
        this.physics.add.existing(this.barZone, true);
        this.physics.add.overlap(this.player, this.barZone, () => {
            if (this.ready && !this.ordered && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.order();
        });

        this.instructionText = this.add.text(20, 560, `Walk up to the round bar (${actionLabel()})`, {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(40);

        stopMusic();
        playBlueTheme();
        this.time.delayedCall(800, () => this.narrate([
            "On the other side of the wall was the actual bar.",
            "A huge glowing dome overhead, a round bar in the middle of the room, and a stone fountain rising out of the bottles.",
            "Yvy: 'Okay. I take back what I said about the liquor store.'"
        ], () => { this.ready = true; }));
    }

    /** The dome: marbled glass lit from behind, iron ribs, bulbs round the rim. */
    buildDome() {
        const g = this.add.graphics();
        g.fillStyle(0xe2c08e, 1);
        g.fillEllipse(400, 250, 640, 380);
        g.fillStyle(0xf0d6aa, 1);
        g.fillEllipse(400, 200, 420, 220);
        g.fillStyle(0xfbe8c8, 0.8);
        g.fillEllipse(400, 150, 200, 90);
        g.lineStyle(1, 0xf6dfb8, 0.8);
        for (let i = 0; i < 26; i++) {
            const x = 140 + (i * 97) % 520;
            const y = 90 + (i * 53) % 150;
            g.lineBetween(x, y, x + 18 + (i % 3) * 8, y + 4);
        }
        // Every rib runs up to the top of the dome.
        g.lineStyle(4, 0x2a1c12, 1);
        for (let i = 0; i <= 12; i++) {
            const a = (i / 12) * Math.PI;
            g.lineBetween(400, 66, 400 + Math.cos(a) * 318, 250 + Math.sin(a) * 44);
        }
        g.lineStyle(8, 0x2a1c12, 1);
        g.strokeEllipse(400, 250, 640, 88);
        for (let i = 0; i < 28; i++) {
            const a = (i / 28) * Math.PI * 2;
            const by = 250 + Math.sin(a) * 44;
            if (by < 246) continue; // the far side of the rim is hidden behind the dome
            const bulb = this.add.circle(400 + Math.cos(a) * 320, by + 10, 3, 0xffc46a);
            this.tweens.add({ targets: bulb, alpha: 0.6, duration: 900 + i * 37, yoyo: true, repeat: -1 });
        }
    }

    buildRoom() {
        // Coffered wood ceiling, bulbs along it.
        this.add.rectangle(400, 30, GAME_WIDTH, 60, 0x3a2418);
        for (let x = 0; x < GAME_WIDTH; x += 50) this.add.rectangle(x, 30, 3, 60, 0x5a3a22);
        this.add.rectangle(400, 60, GAME_WIDTH, 4, 0x5a3a22);
        for (let x = 25; x < GAME_WIDTH; x += 50) this.add.circle(x, 14, 3, 0xffc46a);

        // Wood-panelled walls either side, shelved with bottles.
        [50, 750].forEach(x => {
            this.add.rectangle(x, 330, 100, 540, 0x4a2f1c);
            this.add.image(x, 160, 'bottle_wall').setScale(0.9).setTint(0xc8a880);
            this.add.image(x, 260, 'bottle_wall').setScale(0.9).setTint(0xc8a880);
        });
        this.add.rectangle(400, 336, 600, 88, 0x3a2418); // panelling round the back under the dome
        for (let x = 130; x < 680; x += 46) this.add.rectangle(x, 336, 36, 64, 0x4a2f1c);

        // Floor, and a rug around the bar.
        this.add.rectangle(400, 490, GAME_WIDTH, 220, 0x2c1c12);
        for (let y = 390; y < GAME_HEIGHT; y += 20) this.add.rectangle(400, y, GAME_WIDTH, 1, 0x3a2618);
        this.add.ellipse(400, 420, 470, 110, 0x5a2e22);
        this.add.ellipse(400, 420, 440, 90, 0x6a3a2a);

        // The wall they came round on, fireplace facing this way now.
        this.add.image(110, 468, 'fireplace_wall').setScale(0.5);
        this.add.image(90, 506, 'wolf_armchair_back').setScale(0.9);
        this.add.image(90, 516, 'wolf_armchair_front').setScale(0.9);
        this.add.image(132, 506, 'wolf_armchair_back').setScale(0.9);
        this.add.image(132, 516, 'wolf_armchair_front').setScale(0.9);
    }

    /** The round bar: bottles up the middle, the fountain, the gold front. */
    buildBar() {
        this.add.image(400, 196, 'lion_fountain').setScale(2);
        this.add.image(400, 270, 'bottle_wall').setScale(1.3, 1.1);
        this.bartender = this.add.sprite(400, 300, 'bartender').setScale(1.2).setDepth(5);
        this.tweens.add({ targets: this.bartender, x: 412, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.add.ellipse(400, 322, 290, 34, 0x2b2621).setDepth(6); // the counter's far edge
        this.add.image(360, 314, 'cocktail').setScale(0.6).setDepth(6);
        this.add.image(470, 316, 'cocktail').setScale(0.6).setDepth(6);
        this.add.image(400, 350, 'circular_bar_front').setDepth(7);
        [292, 346, 400, 454, 508].forEach((x, i) => {
            this.add.image(x, 400 + (2 - Math.abs(i - 2)) * 5, 'leather_stool').setDepth(8);
        });
    }

    buildPatrons() {
        [[170, 440, 'civilian', 'civilian_f', 0xc8b8a8, 0xd8c8e0], [630, 440, 'civilian_f', 'civilian', 0xb8c8d8, 0xd8c0b0]]
            .forEach(([tx, ty, a, b, ta, tb]) => {
                this.add.sprite(tx - 22, ty - 14, a).setTint(ta).setDepth(9);
                this.add.sprite(tx + 22, ty - 14, b).setTint(tb).setFlipX(true).setDepth(9);
                this.add.ellipse(tx, ty + 6, 46, 16, 0x3a2418).setDepth(10);
                this.add.ellipse(tx, ty + 3, 46, 12, 0x5a3a22).setDepth(10);
                this.add.image(tx - 6, ty - 4, 'cocktail').setScale(0.5).setDepth(11);
            });
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

    order() {
        this.ordered = true;
        this.player.isLocked = true;
        this.yvyFollow = false;
        this.instructionText.setText('');
        this.stepTo(376, 414, 600);
        this.tweens.add({ targets: this.yvy, x: 424, y: 414, duration: 600, ease: 'Sine.easeInOut' });
        this.time.delayedCall(700, () => this.narrate([
            "Bartender: 'Welcome in. What are we drinking tonight?'",
            "Yvy: 'The horchata one, please.'",
            "Mike: 'And whichever one comes in the cool cup.'",
            "Bartender: 'Good call.'"
        ], () => this.makeDrinks()));
    }

    makeDrinks() {
        const shaker = this.add.rectangle(this.bartender.x + 18, this.bartender.y - 4, 7, 14, 0xc0c6cc).setDepth(6);
        this.tweens.add({ targets: shaker, y: shaker.y - 10, duration: 90, yoyo: true, repeat: 9 });
        this.time.delayedCall(2000, () => {
            shaker.destroy();
            playSound('select');
            this.horchata = this.add.image(426, 318, 'horchata_drink').setScale(1.3).setDepth(8);
            this.cup = this.add.image(374, 316, 'wolf_cup_drink').setScale(1.3).setDepth(8);
            this.narrate([
                "Yvy got the horchata: cold, creamy, cinnamon on top.",
                "Mike's came in a gold cup that looked like it belonged in a museum."
            ], () => this.drinkUp());
        });
    }

    drinkUp() {
        this.tweens.add({ targets: this.cup, x: this.player.x + 12, y: this.player.y + 2, duration: 500 });
        this.tweens.add({ targets: this.horchata, x: this.yvy.x - 12, y: this.yvy.y + 2, duration: 500 });
        this.cup.setDepth(21);
        this.horchata.setDepth(21);
        const sip = (drink, delay) => this.tweens.add({
            targets: drink, y: '-=8', angle: drink === this.cup ? -30 : 30,
            duration: 300, hold: 300, yoyo: true, delay
        });
        this.time.delayedCall(700, () => {
            sip(this.horchata, 0);
            sip(this.cup, 500);
            this.time.delayedCall(1500, () => this.narrate([
                "Yvy: 'Oh, that's so good.'",
                "Mike: 'I'm keeping the cup.'",
                "Bartender: 'You're not keeping the cup.'"
            ], () => {
                sip(this.horchata, 0);
                sip(this.cup, 300);
                this.time.delayedCall(1400, () => this.narrate([
                    "They stayed under the dome a while and took their time with their drinks."
                ], () => {
                    this.cameras.main.fadeOut(1000, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        stopMusic();
                        this.scene.start('MisterAsScene');
                    });
                }));
            }));
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
        const near = this.ready && !this.ordered && this.physics.overlap(this.player, this.barZone);
        document.getElementById('interaction-hint').style.display = near ? 'block' : 'none';
    }
}

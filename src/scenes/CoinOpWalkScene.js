import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { buildEveningStreet } from './CostumeNightScene.js';

/**
 * Back out onto the same block, a couple of drinks later, walking down to
 * Coin-Op. This is where the two men outside make their offer — on the
 * pavement, in the queue, not inside at the machines.
 */
export class CoinOpWalkScene extends Phaser.Scene {
    constructor() { super('CoinOpWalkScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#1d2140');
        playLeFestinTheme();
        buildEveningStreet(this);

        // They come out of Fifth & Rose, so they start at its door.
        this.player = new Player(this, 200, 400);
        this.player.setTexture('mike_dino');
        this.yvy = this.physics.add.sprite(150, 400, 'yvy_dino');

        this.skyline = this.add.rectangle(400, 150, GAME_WIDTH, 302, 0x000000, 0);
        this.physics.add.existing(this.skyline, true);
        this.physics.add.collider(this.player, this.skyline);
        this.physics.add.collider(this.yvy, this.skyline);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.shoutZone = this.add.rectangle(400, 336, 124, 56, 0xffff00, 0);
        this.physics.add.existing(this.shoutZone, true);
        this.queueZone = this.add.rectangle(640, 378, 190, 70, 0xffff00, 0);
        this.physics.add.existing(this.queueZone, true);

        this.instructionText = this.add.text(20, 20, "Task: down the block to Coin-Op", {
            fontSize: '15px', color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        });

        this.physics.add.overlap(this.player, this.shoutZone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.stillGoing();
        });
        this.physics.add.overlap(this.player, this.queueZone, () => {
            if (!this.hitOn && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.theTwoMen();
        });
    }

    stillGoing() {
        showDialogue("The pianos are still going. They are on their fourth encore.");
    }

    /** The queue outside Coin-Op, and a case of mistaken identity. */
    theTwoMen() {
        this.hitOn = true;
        playSound('select');
        // Two of the people waiting turn round.
        const pair = (this.onlookers || []).slice(0, 2);
        pair.forEach((who, i) => this.tweens.add({
            targets: who, x: who.x - 12 + i * 24, y: 392, duration: 500, ease: 'Sine.easeOut'
        }));

        const lines = [
            "Two men in the queue turn round as the dinosaurs join the back of it.",
            "Guy in the Queue: 'Okay, that is commitment. Respect.'",
            "Guy in the Queue: 'You two here on your own? Can we get you a drink inside?'",
            "Mike: 'Oh — yeah, sure! That's really kind of you.'",
            "Guy in the Queue: '...'",
            "His friend looks at him. He looks at his friend.",
            "Guy in the Queue: 'Oh MATE. I'm so sorry, I thought you were—'",
            "Mike: 'No, no, genuinely. Best thing that's happened to me all year.'",
            "Yvy has stopped making any noise at all.",
            "Guy in the Queue: 'Offer stands, obviously. Come on.'",
            "They bought him the drink anyway. He still tells this story."
        ];
        let i = 0;
        const next = () => {
            if (i >= lines.length) {
                this.instructionText.setText("Inside — there's a pinball machine to find");
                this.time.delayedCall(600, () => this.scene.start('CoinOpScene'));
                return;
            }
            showDialogue(lines[i++], next);
        };
        next();
    }

    update() {
        this.player.update(this.cursors);
        const gap = Phaser.Math.Distance.BetweenPoints(this.player, this.yvy);
        if (gap > 56) this.physics.moveToObject(this.yvy, this.player, 120);
        else this.yvy.body.stop();
        this.yvy.setFlipX(this.player.x < this.yvy.x);

        const zones = [this.shoutZone];
        if (!this.hitOn) zones.push(this.queueZone);
        document.getElementById('interaction-hint').style.display =
            this.physics.overlap(this.player, zones) ? 'block' : 'none';
    }
}

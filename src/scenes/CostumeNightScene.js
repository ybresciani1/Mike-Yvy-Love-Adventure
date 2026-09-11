import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { playLeFestinTheme, fadeOutMusic } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';

/**
 * The night they went out downtown in inflatable dinosaur costumes: Mike's
 * cousin at Fifth & Rose, past the Shout House, and on to Coin-Op, where two
 * men at the pinball machine worked out rather too late who they were talking
 * to.
 */
export class CostumeNightScene extends Phaser.Scene {
    constructor() { super('CostumeNightScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#1d2140');
        playLeFestinTheme();
        this.stage = 0;

        this.buildStreet();

        this.player = new Player(this, 60, 420);
        this.player.setTexture('mike_dino');
        this.yvy = this.physics.add.sprite(110, 420, 'yvy_dino');

        // Everything above the kerb is building and sky.
        this.skyline = this.add.rectangle(400, 150, GAME_WIDTH, 302, 0x000000, 0);
        this.physics.add.existing(this.skyline, true);
        this.physics.add.collider(this.player, this.skyline);
        this.physics.add.collider(this.yvy, this.skyline);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.roseZone = this.add.rectangle(170, 336, 150, 56, 0xffff00, 0);
        this.physics.add.existing(this.roseZone, true);
        this.shoutZone = this.add.rectangle(400, 336, 124, 56, 0xffff00, 0);
        this.physics.add.existing(this.shoutZone, true);
        this.coinZone = this.add.rectangle(640, 336, 124, 56, 0xffff00, 0);
        this.physics.add.existing(this.coinZone, true);

        this.instructionText = this.add.text(20, 20, "Task: Fifth & Rose → Coin-Op", {
            fontSize: '15px', color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        });

        this.physics.add.overlap(this.player, this.roseZone, () => {
            if (this.stage === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.atFifthAndRose();
        });
        this.physics.add.overlap(this.player, this.shoutZone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.atShoutHouse();
        });
        this.physics.add.overlap(this.player, this.coinZone, () => {
            if (this.stage === 1 && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.atCoinOp();
        });
    }

    buildStreet() {
        // Early evening: the sky has gone but the light has not quite.
        [[0x1d2140, 0, 60], [0x2b2a54, 60, 44], [0x453462, 104, 38],
         [0x6b4468, 142, 32], [0x9a5a60, 174, 26], [0xc47a56, 200, 22],
         [0xd99a5c, 222, 18], [0xe8b877, 240, 16]]
            .forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));
        for (let i = 0; i < 40; i++) {
            const sy = Math.random() * 140;
            this.add.rectangle(Math.random() * GAME_WIDTH, sy, 2, 2, 0xffffff, 0.8 - sy / 190);
        }
        this.add.image(96, 74, 'moon').setAlpha(0.9);
        for (let sx = 0; sx < 5; sx++) {
            this.add.image(sx * 200 + 100, 226, 'night_skyline').setAlpha(0.5).setTint(0x9a8fb4);
        }

        // Pavement, dimmed for the hour.
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 8; y < GAME_HEIGHT / 32; y++) {
                this.add.image(x * 32 + 16, y * 32 + 16, 'sidewalk_slab')
                    .setTint(y < 13 ? 0x9a94a8 : 0x87829a);
            }
        }
        this.add.rectangle(400, 300, GAME_WIDTH, 6, 0x6f6a80);
        this.add.rectangle(400, 297, GAME_WIDTH, 2, 0x8f8aa0);
        this.add.rectangle(400, 430, GAME_WIDTH, 3, 0x7b7690);

        // The three places.
        this.add.image(170, 240, 'fifth_rose_front');
        this.add.image(400, 245, 'shout_house_front');
        this.add.image(640, 245, 'coin_op_front');
        this.add.text(400, 176, "THE SHOUT HOUSE", {
            fontSize: '10px', color: '#3a2a10', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(640, 176, "COIN-OP", {
            fontSize: '10px', color: '#0d1020', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(170, 258, "Fifth & Rose", {
            fontSize: '11px', color: '#f2c4d2', fontStyle: 'italic'
        }).setOrigin(0.5);

        // Street furniture, and string lights across the whole block.
        for (let x = 32; x < GAME_WIDTH; x += 64) this.add.image(x, 314, 'string_lights');
        this.add.image(300, 250, 'palm_tree').setScale(0.9);
        this.add.image(520, 250, 'palm_tree').setFlipX(true).setScale(0.9);
        this.add.image(760, 252, 'palm_tree').setScale(0.85);
        [90, 330, 570].forEach(x => this.add.image(x, 390, 'streetlight').setScale(1.5));
        [90, 330, 570].forEach(x => this.add.circle(x + 5, 400, 42, 0xffe08a, 0.1));
        this.add.image(250, 330, 'planter_box');
        this.add.image(490, 330, 'planter_box');
        this.add.image(716, 330, 'planter_box');
        this.add.image(30, 380, 'trash_bin');
        this.add.image(430, 392, 'bike_rack');
        this.add.image(200, 470, 'cafe_table_set');
        this.add.image(290, 470, 'cafe_table_set');

        // A queue outside Coin-Op, and people out for the evening who have
        // definitely noticed the dinosaurs.
        this.onlookers = [];
        [
            [596, 372, 'civilian', 0x9c8cb0], [626, 372, 'civilian_f', 0xb09c8c],
            [656, 372, 'civilian', 0xa0b08c], [686, 372, 'civilian_f', 0x8cb0a0],
            [120, 388, 'civilian_f', 0xb08ca0], [360, 470, 'civilian', 0x8ca0b4],
            [468, 448, 'civilian_f', 0xa8a0c0], [740, 430, 'civilian', 0xc0a898]
        ].forEach(([px, py, key, tint], i) => {
            const person = this.add.sprite(px, py, key).setTint(tint);
            this.onlookers.push(person);
            this.tweens.add({
                targets: person, y: py - 3, duration: 1200 + i * 170,
                yoyo: true, repeat: -1, delay: i * 190, ease: 'Sine.easeInOut'
            });
        });
    }

    atFifthAndRose() {
        this.stage = 1;
        playSound('door');
        const cousin = this.add.sprite(170, 322, 'civilian').setTint(0xc9a87a).setDepth(5);
        this.tweens.add({ targets: cousin, y: 366, duration: 900, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: cousin, angle: { from: -4, to: 4 }, duration: 600, yoyo: true, repeat: -1, delay: 900 });

        const chain = [
            "Yvy: 'You are about to walk into a cocktail bar dressed as a T-Rex.'",
            "Mike: 'I am about to walk into a cocktail bar dressed as a T-Rex WITH A BOW TIE.'",
            "The bow tie is held on with packing tape. There was nothing else in the flat.",
            "Cousin: 'MIKE. You absolute—' He hugs an inflatable dinosaur.",
            "Cousin: 'Is that a bow tie?'  Mike: 'It's black tie. Read the room.'",
            "Yvy: 'The revolving door took us four minutes.'",
            "Cousin: 'I watched the whole thing through the window. Best night of my life.'"
        ];
        this.say(chain, () => {
            takePhoto({
                key: 'dinos', title: 'Fifth & Rose',
                caption: "Black tie. The tie was packing tape.",
                sprites: [
                    { texture: 'mike_dino', x: -16, y: 0, scale: 0.9 },
                    { texture: 'yvy_dino', x: 16, y: 0, scale: 0.9 },
                    { texture: 'civilian', x: 40, y: 6, scale: 0.8, tint: 0xc9a87a }
                ]
            });
            this.instructionText.setText("Task: Coin-Op, down the block");
        });
    }

    atShoutHouse() {
        if (this.heardThePianos) {
            showDialogue("Still going. They have got the whole room doing the chorus.");
            return;
        }
        this.heardThePianos = true;
        playSound('select');
        this.say([
            "Two pianos going at once, and the entire room shouting the words.",
            "Yvy: 'Should we?'",
            "Mike: 'We would not fit through that door. Either of us.'",
            "They stand outside for a whole song anyway."
        ]);
    }

    atCoinOp() {
        this.stage = 2;
        playSound('vr_boop');
        this.say([
            "Mike: 'An arcade bar. NOW we're talking. This I can do in a dinosaur suit.'",
            "Two men at the pinball machine turn round.",
            "Guy at the Pinball: 'Hey — can we get you two a drink?'",
            "Mike: 'Oh — sure, yeah, that's really nice of you.'",
            "Guy at the Pinball: '...'",
            "Guy at the Pinball: 'Oh mate. Oh, I am SO sorry.'",
            "Mike: 'No no no, honestly — this is the best thing that's happened all year.'",
            "Yvy cannot breathe. Yvy has not been able to breathe for some time.",
            "They bought him the drink anyway."
        ], () => {
            fadeOutMusic(2);
            this.time.delayedCall(1200, () => this.scene.start('TravelScene'));
        });
    }

    /** Plays a list of lines in order, then calls done. */
    say(lines, done) {
        let i = 0;
        const next = () => {
            if (i >= lines.length) return done && done();
            showDialogue(lines[i++], next);
        };
        next();
    }

    update() {
        this.player.update(this.cursors);

        // Yvy keeps up, at dinosaur pace.
        const gap = Phaser.Math.Distance.BetweenPoints(this.player, this.yvy);
        if (gap > 56) this.physics.moveToObject(this.yvy, this.player, 120);
        else this.yvy.body.stop();
        this.yvy.setFlipX(this.player.x < this.yvy.x);

        const zones = [this.shoutZone];
        if (this.stage === 0) zones.push(this.roseZone);
        if (this.stage === 1) zones.push(this.coinZone);
        document.getElementById('interaction-hint').style.display =
            this.physics.overlap(this.player, zones) ? 'block' : 'none';
    }
}

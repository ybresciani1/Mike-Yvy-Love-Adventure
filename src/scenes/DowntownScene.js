import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class DowntownScene extends Phaser.Scene {
    constructor() { super('DowntownScene'); }
    preload() { this.load.image('penny_custom', REMOTE_IMAGES.penny); }
    create() {
        // --- sky ---------------------------------------------------------------
        // Banded rather than one flat blue, so the horizon reads as further away.
        this.cameras.main.setBackgroundColor('#4a9fd4');
        [[0x3f92cc, 0, 96], [0x4b9bd1, 96, 34], [0x57a4d6, 130, 30], [0x63addb, 160, 26],
        [0x74bbe1, 186, 22], [0x87c7e6, 208, 18], [0x9ed3e8, 226, 14], [0xb6dfec, 240, 10],
        [0xd3e9ee, 250, 10]].forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));

        this.add.circle(700, 80, 44, 0xfff3b0, 0.25);
        this.add.circle(700, 80, 30, 0xfff8d0, 0.55);
        this.add.circle(700, 80, 20, 0xfffdf0);

        for (let i = 0; i < 5; i++) {
            const c = this.add.container(90 + i * 165, 46 + (i % 3) * 26);
            const puff = (dx, dy, w, h, a) => c.add(this.add.ellipse(dx, dy, w, h, 0xffffff, a));
            puff(0, 4, 92, 26, 0.85); puff(-26, 0, 46, 26, 0.8); puff(22, -4, 54, 30, 0.9);
            puff(-8, -10, 40, 22, 0.7); puff(6, 10, 70, 16, 0.5);
            c.setScale(0.7 + (i % 3) * 0.22);
            this.tweens.add({ targets: c, x: '+=110', duration: 26000 + i * 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // The skyline sits on the horizon, hazed back so it stays behind the street.
        for (let sx = 0; sx < 5; sx++) {
            this.add.image(sx * 200 + 100, 202, 'sd_skyline').setAlpha(0.6).setTint(0xd8e8f2);
        }

        // --- ground ------------------------------------------------------------
        for (let x = 0; x < GAME_WIDTH / 32; x++) for (let y = 8; y < GAME_HEIGHT / 32; y++) {
            this.add.image(x * 32 + 16, y * 32 + 16, 'sidewalk_slab').setTint(y < 13 ? 0xffffff : 0xeee9e0);
        }
        this.add.rectangle(400, 300, GAME_WIDTH, 6, 0xa39d90); // shopfront kerb
        this.add.rectangle(400, 297, GAME_WIDTH, 2, 0xc8c2b4);
        this.add.rectangle(400, 416, GAME_WIDTH, 3, 0xb6afa2); // expansion joint across the plaza

        this.add.text(400, 30, "Downtown San Diego", {
            fontSize: '24px', color: '#1d3141', fontStyle: 'bold',
            backgroundColor: '#ffffffcc', padding: { x: 10, y: 4 }
        }).setOrigin(0.5);

        // --- the shopfronts ----------------------------------------------------
        const shopSign = (x, y, label, colour) => this.add.text(x, y, label, {
            fontSize: '11px', color: colour, fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.image(100, 256, 'shop_clothing');
        shopSign(100, 220, "SEA & SALT", '#bff3ec');
        this.add.image(300, 256, 'shop_crystal');
        shopSign(300, 220, "MOONSTONE", '#e4d7ff');
        this.add.image(450, 256, 'shop_book');
        shopSign(450, 220, "BOOK STORE", '#ffe6c4');
        this.add.image(556, 254, 'donut_bar_front');
        shopSign(556, 218, "DONUT BAR", '#ffd9e6');
        this.add.image(718, 254, 'donut_wall_mural');

        // --- street furniture --------------------------------------------------
        this.add.image(196, 246, 'palm_tree');
        this.add.image(378, 246, 'palm_tree').setFlipX(true);
        this.add.image(492, 250, 'palm_tree').setScale(0.9);
        this.add.image(628, 244, 'palm_tree').setFlipX(true).setScale(1.05);

        this.add.image(180, 440, 'streetlight').setScale(1.5);
        this.add.image(700, 440, 'streetlight').setScale(1.5);
        this.add.image(52, 328, 'planter_box');
        this.add.image(240, 330, 'planter_box');
        this.add.image(392, 330, 'planter_box');
        this.add.image(636, 330, 'planter_box');
        this.add.image(360, 380, 'bike_rack');
        this.add.image(140, 318, 'parking_meter');
        this.add.image(516, 318, 'parking_meter');
        this.add.image(668, 384, 'cafe_table_set');
        this.add.image(736, 384, 'cafe_table_set');
        this.add.image(30, 384, 'trash_bin');
        this.add.image(468, 382, 'fire_hydrant');

        // --- the little dog run ------------------------------------------------
        for (let gx = 478; gx < 622; gx += 32) for (let gy = 456; gy < 552; gy += 32) {
            this.add.image(gx + 16, gy + 16, 'dog_lawn');
        }
        this.add.rectangle(550, 452, 152, 4, 0x6d4c41);
        this.add.image(500, 500, 'fence_detailed');
        this.add.image(600, 500, 'fence_detailed');
        this.add.image(486, 470, 'bush_detailed').setScale(0.8);
        this.add.image(614, 542, 'bush_detailed').setScale(0.8);

        this.add.image(360, 498, 'plaza_fountain');
        this.add.image(300, 546, 'planter_box').setScale(0.7);
        this.add.image(420, 546, 'planter_box').setScale(0.7);

        // --- the bench corner ---------------------------------------------------
        this.add.image(200, 500, 'park_bench');
        this.add.image(272, 496, 'planter_box').setScale(0.8);
        this.add.image(132, 492, 'trash_bin').setScale(0.8);
        this.pigeons = [
            this.add.image(168, 540, 'pigeon'),
            this.add.image(196, 552, 'pigeon').setFlipX(true),
            this.add.image(232, 536, 'pigeon')
        ];
        this.pigeons.forEach((bird, i) => this.tweens.add({
            targets: bird, x: '+=' + (i % 2 ? 14 : -14), duration: 1800 + i * 400,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        }));

        // A couple of people going about their morning, so the street is not ours
        // alone — they walk the length of the plaza and turn round.
        [[40, 372, 'civilian', 0x7b5e8c, 16000], [760, 402, 'civilian_f', 0x4a7c8c, 21000]].forEach(([sx, sy, key, tint, dur], i) => {
            const walker = this.add.sprite(sx, sy, key).setTint(tint);
            this.tweens.add({
                targets: walker, x: i ? 120 : 700, duration: dur, yoyo: true, repeat: -1,
                onYoyo: () => walker.setFlipX(!walker.flipX), onRepeat: () => walker.setFlipX(!walker.flipX)
            });
        });

        // --- interaction zones (unchanged positions) ----------------------------
        this.bookZone = this.add.rectangle(450, 330, 60, 40, 0xffff00, 0); this.physics.add.existing(this.bookZone, true);
        this.clothingZone = this.add.rectangle(100, 330, 60, 40, 0xffff00, 0); this.physics.add.existing(this.clothingZone, true);
        this.crystalZone = this.add.rectangle(300, 330, 60, 40, 0xffff00, 0); this.physics.add.existing(this.crystalZone, true);
        this.donutZone = this.add.rectangle(556, 330, 60, 40, 0xffff00, 0); this.physics.add.existing(this.donutZone, true);
        this.wallZone = this.add.rectangle(718, 330, 90, 60, 0xffff00, 0); this.physics.add.existing(this.wallZone, true);
        this.benchZone = this.add.rectangle(200, 500, 80, 40, 0xffff00, 0); this.physics.add.existing(this.benchZone, true);
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 50, 400); this.player.setTexture(outfit);
        this.yvy = this.physics.add.sprite(100, 400, 'yvy');
        this.stranger = this.physics.add.sprite(520, 500, 'civilian').setTint(0xaaaaaa);
        this.dog = this.add.sprite(550, 520, 'generic_dog');
        this.dogZone = this.add.rectangle(550, 520, 100, 80, 0xffff00, 0); this.physics.add.existing(this.dogZone, true);
        this.pDonut = this.add.sprite(0,0,'donut_chocolate').setVisible(false); this.yDonut = this.add.sprite(0,0,'donut_strawberry').setVisible(false);
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.stage = 0; 
        this.add.text(20, 560, "Task: Donut Bar → Donut wall → Puppy → Bench", { fontSize: '16px', color: '#000', backgroundColor: '#fff', fontStyle: 'bold' });
        this.physics.add.overlap(this.player, this.clothingZone, () => { if(Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Yvy: 'Ooh, cute top!'"); });
        this.physics.add.overlap(this.player, this.crystalZone, () => { if(Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Yvy: 'Good energy in there.'"); });
        this.physics.add.overlap(this.player, this.bookZone, () => { if(Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Mike: 'I love old book stores.'"); }); 
        this.physics.add.overlap(this.player, this.donutZone, () => { 
            if(this.stage === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) {
                this.stage = 1; showDialogue("Mike: 'Whoa, look at that line.'", () => { showDialogue("They wait patiently...", () => { showDialogue("Yvy: 'Strawberry and Cream for me!'", () => { showDialogue("Mike: 'Classic Chocolate for me.'", () => {
                    this.pDonut.setVisible(true); this.yDonut.setVisible(true); showDialogue("Mike: 'Cheers!' *Chomp*", () => { this.pDonut.setVisible(false); this.yDonut.setVisible(false); this.stage = 2; showDialogue("They ate the delicious donuts."); }); }); }); }); });
            }
        });
        this.physics.add.overlap(this.player, this.wallZone, () => { if(this.stage >= 2 && this.stage < 3 && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { this.stage = 3; playSound('select'); this.cameras.main.flash(200, 255, 255, 255); showDialogue("Mike: 'Smile!'", () => { showDialogue("They took a selfie at the famous Donut Wall."); }); } });
        this.physics.add.overlap(this.player, this.dogZone, () => { if(this.stage >= 3 && this.stage < 4 && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { this.stage = 4; showDialogue("Mike: 'Can we pet your dog?'", () => { showDialogue("Stranger: 'Sure! He's friendly.'", () => { showDialogue("Yvy: 'Who's a good boy!' *Pets dog*", () => { this.tweens.add({targets: this.dog, y: '-=5', duration: 100, yoyo: true, repeat: 3}); }); }); }); } });
        this.physics.add.overlap(this.player, this.benchZone, () => {
            if(this.stage >= 4 && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) {
                this.stage = 5; this.player.x = 180; this.player.y = 500; this.yvy.x = 220; this.yvy.y = 500; this.player.body.stop(); this.yvy.body.stop();
                showDialogue("They sat down to enjoy the morning sun.", () => { showDialogue("Mike: 'I really like San Diego. And I really like being with you.'", () => { showDialogue("Yvy: 'Me too. What do you want out of life, Mike?'", () => { showDialogue("Mike: 'To build cool things. And to be happy with someone special.'", () => { showDialogue("Yvy: 'I also want to create things.. Create a better future for our world, and meet someone who has a vision to do the same... Someone special too..'", () => {
                    const heart = this.add.text(this.player.x + 10, this.player.y - 40, '❤️', { fontSize: '24px' });
                    this.tweens.add({ targets: heart, y: this.player.y - 80, alpha: 0, duration: 2000 });
                    showDialogue("They sat in comfortable silence for a while.", () => { this.scene.start('TravelScene'); }); }); }); }); }); });
            }
        });
    }
    update() {
        this.player.update(this.cursors); const dist = Phaser.Math.Distance.Between(this.yvy.x, this.yvy.y, this.player.x, this.player.y); 
        if (dist > 60 && this.stage !== 5) this.physics.moveToObject(this.yvy, this.player, 120); else this.yvy.body.stop();
        if (this.pDonut.visible) { this.pDonut.x = this.player.x; this.pDonut.y = this.player.y - 10; }
        if (this.yDonut.visible) { this.yDonut.x = this.yvy.x; this.yDonut.y = this.yvy.y - 10; }
        document.getElementById('interaction-hint').style.display = this.physics.overlap(this.player, [this.clothingZone, this.crystalZone, this.donutZone, this.wallZone, this.dogZone, this.benchZone, this.bookZone]) ? 'block' : 'none';
    }
}

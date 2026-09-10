import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { fadeOutMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { playSound } from '../audio/sfx.js';
import { Player } from '../entities/Player.js';

const DRUNK_LINES = [
    "Drunk Guy: 'I love you man... you're my best friend... wait, who are you? Does not matter! I still love you man!'",
    "Drunk Guy: 'Is this the taco stand? No? It's pizza? Who puts pineapple on pizza anyway? Wait, do you guys have pineapple?'",
    "Drunk Guy: 'Wheeeeere is the party?? I swear it was right here a minute ago. Did the party move? Or did I move?'",
    "Drunk Guy: 'Nice shoes buddy. They look fast. I bet you can run really fast in those. Can I try them on? Just for a second?'"
];

export class PizzaScene extends Phaser.Scene { 
    constructor() { super('PizzaScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#101010'); 
        playLeFestinTheme();
        for(let i=0; i<80; i++) { let x = Math.random() * GAME_WIDTH; let y = Math.random() * 190; this.add.rectangle(x, y, 2, 2, 0xffffff, Math.random() * 0.8 + 0.2); }
        this.add.image(96, 80, 'moon');
        for (let x=0; x<GAME_WIDTH/32; x++) { for (let y=0; y<GAME_HEIGHT/32; y++) { if (y < 10) continue; if (y < 14) this.add.image(x*32+16, y*32+16, 'pavement'); else this.add.image(x*32+16, y*32+16, 'floor_tile').setTint(0x222222); } }
        this.add.image(620, 250, 'night_shop_pizza');
        this.add.text(620, 221, "TONY'S PIZZERIA", { fontSize: '11px', color: '#ffb0a0', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.image(688, 236, 'neon_pizza_sign'); // projecting off the facade
        this.add.sprite(688, 208, 'pizza_logo').setScale(0.6); this.add.image(64, 272, 'night_shop_taco');
        this.add.image(176, 272, 'night_shop_laundry');
        this.add.image(288, 272, 'night_shop_liquor');
        this.add.image(400, 272, 'night_shop_tattoo');
        this.add.text(64, 263, "EL PRIMO TACOS", { fontSize: '9px', color: '#ffd88a', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(176, 263, "WASH & FOLD", { fontSize: '9px', color: '#bfe9ff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(288, 263, "LIQUOR", { fontSize: '9px', color: '#ff9aa6', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 263, "INK & NEEDLE", { fontSize: '9px', color: '#e0b0ff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.image(210, 366, 'trash_bin').setScale(1.5); this.add.image(430, 364, 'fire_hydrant'); this.add.image(560, 430, 'park_bench').setScale(0.8); 
        [160, 300, 490].forEach(x => { this.add.image(x, 340, 'streetlight').setScale(2); this.add.circle(x+4, 348, 40, 0xffff00, 0.2); }); 
        // The door zone is the full depth of the pavement outside the shop: the
        // player walks along the middle of it, not up against the building.
        this.shopZone = this.add.rectangle(640, 382, 110, 118, 0xffff00, 0); this.physics.add.existing(this.shopZone, true); 
        this.player = new Player(this, 100, 400); this.yvy = this.physics.add.sprite(150, 400, 'yvy');
        this.skyline = this.add.rectangle(400, 158, GAME_WIDTH, 316, 0x000000, 0);
        this.physics.add.existing(this.skyline, true);
        this.physics.add.collider(this.player, this.skyline);
        this.physics.add.collider(this.yvy, this.skyline); 
        this.drunks = this.add.group(); let d1 = this.physics.add.sprite(205, 398, 'drunk'); d1.body.setImmovable(true); this.drunks.add(d1); let d2 = this.physics.add.sprite(268, 424, 'drunk'); d2.setFlipX(true); d2.body.setImmovable(true); this.drunks.add(d2);
        this.tweens.add({ targets: [d1, d2], x: '+=5', angle: { from: -5, to: 5 }, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.pSlice = this.add.sprite(0,0,'pizza_slice').setScale(0.7).setVisible(false); this.ySlice = this.add.sprite(0,0,'pizza_slice').setScale(0.7).setVisible(false); 
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.instructionText = this.add.text(20, 20, "Go inside the Pizza Shop", { fontSize: '16px', color: '#fff' });
        this.dressStreetLife();
        this.setUpBrawl(); this.physics.add.overlap(this.player, this.shopZone, () => { if (!gameState.farewellDone && !this.brawlArguing && !this.fighting) this.startFarewell(); });
        this.physics.add.overlap(this.player, this.fightZone, () => {
            if (this.fighting && !this.photoTaken && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.takePhotos();
        }); this.physics.add.overlap(this.player, this.drunks, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue(this.nextDrunkLine());
        });
    } 
    update() { 
        this.player.update(this.cursors); 
        if (this.player.x > this.yvy.x + 50) this.yvy.body.setVelocityX(130); else if (this.player.x < this.yvy.x - 50) this.yvy.body.setVelocityX(-130); else this.yvy.body.setVelocityX(0); 
        if(this.player.y < this.yvy.y - 50) this.yvy.body.setVelocityY(-130); else if(this.player.y > this.yvy.y + 50) this.yvy.body.setVelocityY(130); else this.yvy.body.setVelocityY(0); 
        if (this.pSlice.visible) { this.pSlice.x = this.player.x + 10; this.pSlice.y = this.player.y; this.ySlice.x = this.yvy.x + 10; this.ySlice.y = this.yvy.y; } 
        const canFilm = this.fighting && !this.photoTaken && this.physics.overlap(this.player, this.fightZone);
        const touching = this.physics.overlap(this.player, this.drunks) || (!this.fighting && this.physics.overlap(this.player, this.tacoZone)) || canFilm;
        document.getElementById('interaction-hint').style.display = touching ? 'block' : 'none';
    }    /**
     * The street was empty apart from our two and the drunks. Late-night food
     * places have a queue outside and people eating on the kerb, and that is
     * most of what makes a street look busy.
     */
    dressStreetLife() {        // Everyone out on the street is kept in one list, because when the
        // fight starts they all abandon what they are doing to go and film it.
        this.bystanders = [];
        const join = (x, y, key, tint, idle) => {
            const person = this.add.sprite(x, y, key).setTint(tint);
            const bob = this.tweens.add({
                targets: person, y: y - (idle ? 4 : 1), duration: 1100 + this.bystanders.length * 170,
                yoyo: true, repeat: -1, delay: this.bystanders.length * 240, ease: 'Sine.easeInOut'
            });
            this.bystanders.push({ sprite: person, homeX: x, homeY: y, bob, phone: null });
            return person;
        };

        // The line at the taco window, shuffling forward and back.
        this.tacoLine = [[104, 344, 'civilian', 0x8c7ab0], [98, 372, 'civilian_f', 0xb07a8c],
            [106, 398, 'drunk', 0x7a9cb0], [96, 424, 'civilian', 0xb0a07a]]
            .map(([qx, qy, key, tint]) => join(qx, qy, key, tint, true));
        this.add.sprite(120, 330, 'tacos').setScale(0.5); // an order going out of the window

        // People eating at the tables outside, which is the point of the queue.
        const diners = [
            [498, 396, 'civilian', 0xa08cb4, 'pizza_slice'],
            [542, 396, 'civilian_f', 0xb48ca0, 'pizza_slice'],
            [742, 396, 'drunk', 0x8cb4a0, 'tacos'],
            [700, 402, 'civilian', 0xb4a88c, 'tacos'],
            [560, 418, 'civilian_f', 0x8ca0b4, 'pizza_slice']
        ];
        this.add.image(520, 410, 'cafe_table_set');
        this.add.image(722, 410, 'cafe_table_set');        diners.forEach(([dx, dy, key, tint, food], i) => {
            const diner = join(dx, dy, key, tint, false);
            const plate = this.add.sprite(dx + (i % 2 ? 11 : -11), dy + 2, food)
                .setScale(food === 'tacos' ? 0.45 : 0.55);
            this.tweens.add({ // lifting it to their mouth and back down
                targets: plate, y: dy - 5, duration: 900 + i * 170,
                yoyo: true, repeat: -1, delay: i * 340, ease: 'Sine.easeInOut'
            });
            this.bystanders[this.bystanders.length - 1].plate = plate;
            this.bystanders[this.bystanders.length - 1].plateHome = [plate.x, plate.y];
            void diner;
        });

        // Talking to the queue.
        this.tacoZone = this.add.rectangle(101, 384, 80, 130, 0xffff00, 0);
        this.physics.add.existing(this.tacoZone, true);
        this.askedTheQueue = false;
        this.physics.add.overlap(this.player, this.tacoZone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.askTheQueue();
        });
    }    /** Asking the poor soul at the back of the taco line how long he has been there. */
    askTheQueue() {
        if (this.fighting || this.brawlArguing) {
            showDialogue("The whole line has abandoned its place to go and watch.");
            return;
        }
        if (this.askedTheQueue) {
            showDialogue("Guy in Line: 'Still here. Still waiting. Do not talk to me.'");
            return;
        }
        this.askedTheQueue = true;
        showDialogue("Mike: 'Hey — are you all waiting for this place?'", () => {
            showDialogue("Guy in Line: 'Yeah. Forty minutes so far. They only got one guy on the grill.'", () => {
                showDialogue("Guy in Line: 'But it's worth it. Trust me. It's worth it.'", () => {
                    showDialogue("Mike: 'Want to check out the pizza place instead?'", () => {
                        showDialogue("Yvy: 'Forty minutes for a taco? Yeah. Pizza. Let's go.'");
                    });
                });
            });
        });
    }

    /** Two more drunks loitering up the street, waiting for a reason. */
    setUpBrawl() {
        this.fighting = false;
        this.photoTaken = false;
        this.buffRed = this.add.sprite(348, 330, 'buff_red');
        this.buffGreen = this.add.sprite(432, 330, 'buff_green').setFlipX(true);
        [this.buffRed, this.buffGreen].forEach((b, i) =>
            this.tweens.add({ targets: b, y: b.y - 2, duration: 900 + i * 140, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        );
        this.fightZone = this.add.rectangle(390, 372, 170, 90, 0xffff00, 0);
        this.physics.add.existing(this.fightZone, true);
        // It starts when they come up the street towards the shop rather than on
        // a timer, so it plays out in front of them on the way in.
        this.brawlStarted = false;
        this.brawlArguing = false;
        this.brawlTrigger = this.add.rectangle(250, 384, 120, 190, 0xffff00, 0);
        this.physics.add.existing(this.brawlTrigger, true);
        this.physics.add.overlap(this.player, this.brawlTrigger, () => {
            if (this.brawlStarted) return;
            this.brawlStarted = true;
            this.brawlArguing = true;
            this.girlWalksBy();
        });
    }

    /** She walks past, they both decide she was looking at them. */
    girlWalksBy() {
        const girl = this.add.sprite(180, 352, 'civilian_f').setTint(0xffc0dd);
        this.tweens.add({ targets: girl, x: 860, duration: 8000, ease: 'Linear', onComplete: () => girl.destroy() });
        this.tweens.add({ targets: girl, y: 350, duration: 320, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.time.delayedCall(1500, () => {
            [this.buffRed, this.buffGreen].forEach(b => this.tweens.add({ targets: b, angle: { from: -6, to: 6 }, duration: 260, yoyo: true, repeat: 3 }));
            this.saySoon("Buff Drunk: 'Bro. Bro. She looked at me.'", () => {
                this.saySoon("Other Buff Drunk: 'She looked at ME. I have the better traps.'", () => {
                    this.saySoon("Buff Drunk: 'SAY THAT AGAIN.'", () => this.startFight());
                });
            });
        });
    }    /**
     * showDialogue refuses to open a second box and drops the callback it was
     * given, so a scheduled line that lands while another conversation is open
     * takes the rest of its chain down with it. That is how the brawl went
     * missing: they reached the shop first, the farewell opened a box, and the
     * argument — and the startFight() hanging off the end of it — vanished.
     * Anything fired from a timer rather than a keypress has to wait its turn.
     */
    saySoon(text, next) {
        if (!showDialogue(text, next)) this.time.delayedCall(350, () => this.saySoon(text, next));
    }

    startFight() {
        this.fighting = true;
        this.brawlArguing = false;
        this.instructionText.setText("Two guys are fighting! Get a picture (Space)");

        // First they trade visible punches, then it collapses into a dust cloud.
        this.fightTimer = this.time.addEvent({ delay: 200, loop: true, callback: () => {
            const swing = this.fightTimer.getRepeatCount() % 2 === 0;
            this.buffRed.setTexture(swing ? 'buff_red_punch' : 'buff_red');
            this.buffGreen.setTexture(swing ? 'buff_green' : 'buff_green_punch');
            this.buffRed.x = 348 + Phaser.Math.Between(-3, 5);
            this.buffGreen.x = 432 + Phaser.Math.Between(-5, 3);
            this.popStar();
            playSound('clink');
        }});

        this.time.delayedCall(2600, () => {
            if (!this.fighting) return;
            this.buffRed.setVisible(false);
            this.buffGreen.setVisible(false);
            this.fightCloud = this.add.sprite(390, 326, 'fight_cloud');
            this.tweens.add({ targets: this.fightCloud, scaleX: 1.15, scaleY: 0.9, duration: 170, yoyo: true, repeat: -1 });
        });        this.gatherCrowd();
        this.time.delayedCall(26000, () => this.endFight());
    }

    /**
     * Nobody stands in a queue when there is a fight forty feet away. They
     * abandon their spots, ring the brawl at a safe distance and film it, which
     * is both what actually happens and what makes the street feel alive.
     */
    gatherCrowd() {
        const ring = [
            [292, 350], [318, 388], [268, 396], [482, 352],
            [498, 392], [456, 400], [352, 404], [430, 406], [396, 412]
        ];
        this.bystanders.forEach((b, i) => {
            const [wx, wy] = ring[i % ring.length];
            this.tweens.killTweensOf(b.sprite);
            if (b.plate) b.plate.setVisible(false); // the food gets left on the table
            this.tweens.add({
                targets: b.sprite, x: wx, y: wy,
                duration: 900 + i * 130, delay: i * 160, ease: 'Sine.easeInOut',
                onStart: () => b.sprite.setFlipX(wx > 390),
                onComplete: () => {
                    if (!this.fighting) return;
                    // Phones up. Everyone films, nobody helps — yet.
                    b.phone = this.add.sprite(b.sprite.x + (wx > 390 ? -11 : 11), b.sprite.y - 8, 'phone_cam').setScale(0.8);
                    this.tweens.add({ targets: b.phone, y: b.phone.y - 2, duration: 700 + i * 90, yoyo: true, repeat: -1 });
                    this.tweens.add({ targets: b.sprite, y: wy - 2, duration: 620 + i * 80, yoyo: true, repeat: -1 });
                }
            });
        });
    }

    /** Phones down, everyone back to their taco. */
    scatterCrowd() {
        this.bystanders.forEach((b, i) => {
            this.tweens.killTweensOf(b.sprite);
            if (b.phone) { this.tweens.killTweensOf(b.phone); b.phone.destroy(); b.phone = null; }
            this.tweens.add({
                targets: b.sprite, x: b.homeX, y: b.homeY,
                duration: 1100 + i * 120, delay: 400 + i * 150, ease: 'Sine.easeInOut',
                onStart: () => b.sprite.setFlipX(false),
                onComplete: () => {
                    if (b.plate) {
                        b.plate.setPosition(b.plateHome[0], b.plateHome[1]).setVisible(true);
                    }
                    // A fresh idle. The original was killed on the way out, and
                    // a killed tween cannot be resumed.
                    b.bob = this.tweens.add({
                        targets: b.sprite, y: b.homeY - 3, duration: 1200 + i * 150,
                        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                    });
                }
            });
        });
    }

    /**
     * One of them finally puts the phone away and gets the pair back on their
     * feet, and then the bike patrol turns up to ask the obvious question.
     */
    helpThemUp() {
        const helper = this.bystanders[2];
        if (!helper) return this.policeArrive();
        if (helper.phone) { this.tweens.killTweensOf(helper.phone); helper.phone.destroy(); helper.phone = null; }
        this.tweens.killTweensOf(helper.sprite);
        this.tweens.add({
            targets: helper.sprite, x: 392, y: 366, duration: 900, ease: 'Sine.easeInOut',
            onComplete: () => {
                this.saySoon("Guy in Line: 'Alright, alright — up you get, big man.'", () => {
                    [this.buffRed, this.buffGreen].forEach((b, i) => this.tweens.add({
                        targets: b, angle: 0, y: 330, x: i ? 432 : 348, duration: 700, ease: 'Back.easeOut'
                    }));
                    this.saySoon("Buff Drunk: 'I'm good. I'm good. He's my brother.'", () => {
                        this.saySoon("Other Buff Drunk: 'That's my BROTHER.'", () => this.policeArrive());
                    });
                });
            }
        });
    }

    /** The bike patrol, who have seen this exact thing four times tonight. */
    policeArrive() {
        const bike = this.add.image(880, 392, 'police_bike');
        const cop = this.add.sprite(872, 372, 'cop');
        const lights = [
            this.add.rectangle(884, 360, 7, 5, 0xe53935),
            this.add.rectangle(876, 360, 7, 5, 0x1e88e5)
        ];
        lights.forEach((light, i) => this.tweens.add({
            targets: light, alpha: { from: 1, to: 0.15 }, duration: 260,
            yoyo: true, repeat: -1, delay: i * 260
        }));
        const offset = [[-8, 0], [0, -20], [4, -32], [-4, -32]];
        const parts = [bike, cop, lights[0], lights[1]];
        playSound('select');
        this.tweens.add({
            targets: parts, x: (t, k, v, idx) => 505 + offset[idx][0],
            duration: 2600, ease: 'Sine.easeOut',
            onComplete: () => {
                this.saySoon("Officer: 'Evening. Somebody want to tell me what happened here?'", () => {
                    this.saySoon("Buff Drunk: 'Nothing happened, officer. We were hugging.'", () => {
                        this.saySoon("Guy in Line: 'They were absolutely not hugging.'", () => {
                            this.saySoon("Officer: 'Right. Go home, both of you. Slowly.'", () => {
                                this.scatterCrowd();
                                this.tweens.add({
                                    targets: [this.buffRed, this.buffGreen], x: '-=180', alpha: 0,
                                    duration: 4200, ease: 'Sine.easeIn'
                                });
                                this.time.delayedCall(3000, () => this.tweens.add({
                                    targets: parts, x: '+=360', duration: 3400, ease: 'Sine.easeIn',
                                    onComplete: () => parts.forEach(p => p.destroy())
                                }));
                            });
                        });
                    });
                });
            }
        });
    }

    popStar() {
        const star = this.add
            .sprite(390 + Phaser.Math.Between(-40, 40), 322 + Phaser.Math.Between(-16, 16), 'pow_star')
            .setScale(0.7);
        this.tweens.add({ targets: star, scale: 1.3, alpha: 0, duration: 300, onComplete: () => star.destroy() });
    }

    /** Both of them end up flat on the pavement. */
    endFight() {
        if (!this.fighting) return;
        this.fighting = false;
        this.fightTimer.remove();
        if (this.fightCloud) this.fightCloud.destroy();        this.buffRed.setVisible(true).setTexture('buff_red').setAngle(-90).setPosition(352, 344);
        this.buffGreen.setVisible(true).setTexture('buff_green').setAngle(90).setPosition(430, 344);
        this.instructionText.setText("Go inside the Pizza Shop");
        this.time.delayedCall(900, () => this.helpThemUp());
    }

    /** Mike and Yvy do the sensible thing and film it from a safe distance. */
    takePhotos() {
        this.photoTaken = true;
        const phoneMike = this.add.sprite(this.player.x + 11, this.player.y - 7, 'phone_cam').setScale(0.9);
        const phoneYvy = this.add.sprite(this.yvy.x + 11, this.yvy.y - 7, 'phone_cam').setScale(0.9);
        const flash = () => {
            const f = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0.45);
            this.tweens.add({ targets: f, alpha: 0, duration: 220, onComplete: () => f.destroy() });
            playSound('select');
        };
        showDialogue("Mike: 'Are you seeing this?'", () => {
            flash();
            showDialogue("Yvy: 'Already filming. Do NOT get involved.'", () => {
                flash();
                showDialogue("Mike: 'Wouldn't dream of it. Zoom in.'", () => {
                    flash();
                    showDialogue("They take photos from a safe distance while the squad of two sorts itself out.", () => {
                        phoneMike.destroy();
                        phoneYvy.destroy();
                    });
                });
            });
        });
    }

    /**
     * A shuffled bag rather than a fresh random pick each time. Picking at
     * random meant one line could come up over and over while another went
     * unheard; this plays all four before any of them repeats.
     */
    nextDrunkLine() {
        if (!this.drunkBag || this.drunkBag.length === 0) {
            this.drunkBag = Phaser.Utils.Array.Shuffle([...DRUNK_LINES]);
        }
        return this.drunkBag.pop();
    }

    startFarewell() { 
        gameState.farewellDone = true; this.pSlice.setVisible(true); this.ySlice.setVisible(true); this.player.body.stop(); this.yvy.body.stop(); 
        const convo = [ "Mike: 'This pizza looks amazing.'", "Yvy: 'Best in San Diego.'", "Mike: 'I... I have to go soon. Work early tomorrow.'", "Yvy: 'Aww. What time?'", "Mike: 'Need to be up by 4 AM.'", "Yvy: 'Tell you what. I'll give you a wake-up call at 4 AM.'", "Mike: 'Really? You'd do that?'", "Yvy: 'Promise. Bye Mike!'", "Mike: 'Bye Yvy!'" ]; 
        let i = 0; const next = () => { if(i<convo.length) showDialogue(convo[i++], next); else { fadeOutMusic(2); this.cameras.main.fade(2000, 0, 0, 0, false, (c,p) => { if(p===1) this.scene.start('MorningScene'); }); } }; next(); 
    } 
}

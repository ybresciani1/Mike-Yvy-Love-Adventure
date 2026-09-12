import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue, isDialogueOpen, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';
import { isTouchMode, promptFontSize, showDanceButton } from '../ui/touch.js';

// Held-F dancing cycles these poses; the floor chases these colours on the beat.
const DANCE_POSES = ['mike_dance_1', 'mike_dance_2', 'mike_dance_3', 'mike_dance_4'];
const MARINE_POSES = ['marine_dance_1', 'marine_dance_2', 'marine_dance_3'];
const YVY_POSES = ['yvy_dance_1', 'yvy_dance_2', 'yvy_dance_3', 'yvy_dance_4'];
const LIGHT_COLORS = [0xff2d95, 0x00e5ff, 0xaeea00, 0xffc400, 0xb388ff, 0xff7043];
const FLOOR_COLORS = [0x8e1450, 0x0b6f7d, 0x4d7a1f, 0x8a5c00, 0x4b3579, 0x1b1b26];

export class ClubScene extends Phaser.Scene { 
    constructor() { super('ClubScene'); 
        this.isInteracting = false;
        this.isDancing = false;
        this.danceStep = -1;
        this.beat = 0; 
    } 
    create() { 
        this.cameras.main.setBackgroundColor('#111111'); 
        this.cameras.main.setRotation(0); 
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) {
            this.add.image(x*32+16, y*32+16, 'floor_tile').setTint(0x333333);
        }
        this.danceFloor = this.add.rectangle(350, 350, 400, 300, 0x000000).setStrokeStyle(4, 0xff00ff);
        this.floorTiles = [];
        for (let cx = 0; cx < 12; cx++) {
            for (let cy = 0; cy < 9; cy++) {
                const tile = this.add.image(166 + cx * 32, 216 + cy * 32, 'dance_floor_tile');
                tile.gridIndex = cx + cy;
                this.floorTiles.push(tile);
            }
        }        for (let x = 16; x < GAME_WIDTH; x += 32) this.add.image(x, 26, 'truss');
        this.clubLights = [];
        this.lightBeams = [];        for (let i = 0; i < 6; i++) {
            const x = 108 + i * 118;
            const color = LIGHT_COLORS[i % LIGHT_COLORS.length];
            this.clubLights.push(this.add.image(x, 44, 'par_can').setTint(color));

            // Drawn in local coordinates so the cone swings about its fixture.
            const beam = this.add.graphics({ x, y: 54 });
            beam.setBlendMode(Phaser.BlendModes.ADD);
            beam.fillStyle(color, 0.18);
            beam.beginPath();
            beam.moveTo(-5, 0);
            beam.lineTo(-64, 420);
            beam.lineTo(64, 420);
            beam.lineTo(5, 0);
            beam.closePath();
            beam.fill();
            beam.setAlpha(0.25);
            this.tweens.add({
                targets: beam,
                rotation: i % 2 ? 0.17 : -0.17,
                duration: 1700 + i * 130,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            this.lightBeams.push(beam);
        }
        this.add.image(320, 62, 'speaker_stack');
        this.add.image(480, 62, 'speaker_stack');
        this.add.image(400, 74, 'dj_booth');
        this.dj = this.add.sprite(400, 40, 'dj_1');
        // He is up on the booth, so the zone reaches down to where the floor
        // actually lets you stand.
        this.djZone = this.add.rectangle(400, 108, 120, 96, 0xffff00, 0);
        this.physics.add.existing(this.djZone, true);
        this.djLines = 0;
        this.tweens.add({ targets: this.dj, y: 36, duration: 220, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: this.dj, angle: { from: -4, to: 4 }, duration: 440, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.discoBall = this.add.image(350, 132, 'disco_ball');
        this.tweens.add({ targets: this.discoBall, scaleX: 0.8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        const beams = this.add.graphics();
        beams.setBlendMode(Phaser.BlendModes.ADD);
        beams.fillStyle(0x66d9ff, 0.09);
        for (let i = 0; i < 5; i++) {
            beams.beginPath();
            beams.moveTo(350, 132);
            beams.lineTo(110 + i * 120, 540);
            beams.lineTo(180 + i * 120, 540);
            beams.closePath();
            beams.fill();
        }
        this.tweens.add({ targets: beams, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

        this.clubBar = this.add.rectangle(700, 300, 80, 400, 0x222222); 
        this.physics.add.existing(this.clubBar, true);
        this.barEnds = this.physics.add.staticGroup();
        this.barEnds.create(700, 50, null).setSize(80, 100).setVisible(false);
        this.barEnds.create(700, 550, null).setSize(80, 100).setVisible(false);

        // Ordering happens from an approach strip in front of the counter — the
        // collider means the player can never overlap the counter itself.
        this.barZone = this.add.rectangle(646, 300, 32, 400, 0xffffff, 0);
        this.physics.add.existing(this.barZone, true); this.add.rectangle(670, 300, 20, 400, 0x444444);        for (let y = 120; y <= 480; y += 32) this.add.image(670, y, 'bar_top_tile');
        for (const y of [150, 230, 310, 390, 470]) this.add.image(638, y, 'bar_stool');
        this.add.sprite(634, 196, 'civilian_f').setTint(0xffc0dd);
        this.add.sprite(634, 356, 'civilian').setTint(0xa8d8ff);
        for (const y of [172, 268, 424]) this.add.image(668, y, 'cocktail').setScale(0.7);
        this.add.image(696, 104, 'glass_rack');
        this.add.image(728, 104, 'glass_rack');
        this.add.text(660, 80, "BAR", { fontSize: '20px', color: '#00ffff', fontStyle: 'bold', shadow: { color: '#000', blur: 4, fill: true } }); 
        this.add.rectangle(726, 300, 30, 380, 0x121219); // unlit back half of the bar
        for (let y = 120; y <= 480; y += 32) this.add.image(696, y, 'club_bar_front');        [140, 172, 204, 236, 268, 300, 332, 364, 396, 428, 460].forEach((y, i) => this.add.image(772, y, i % 3 === 1 ? 'led_panel' : 'club_shelf'));
        this.add.sprite(740, 200, 'server'); 
        this.add.sprite(740, 400, 'server'); 
        this.yvy = this.physics.add.sprite(300, 350, 'yvy'); 
        this.marines = this.add.group(); 
        this.civilians = this.add.group(); 
        this.player = new Player(this, 100, 300); 
        // Added here, not beside the counter: this.player does not exist yet at that point.
        this.physics.add.collider(this.player, this.clubBar);
        this.physics.add.collider(this.player, this.barEnds);
        
        this.heldDrink = this.add.sprite(0,0,'cocktail').setScale(0.7).setVisible(false);
        this.yvyDrink = this.add.sprite(0,0,'cocktail').setScale(0.7).setVisible(false); 
        [{ x: 214, y: 424 }, { x: 302, y: 468 }, { x: 178, y: 338 }].forEach(p =>
            this.marines.add(this.physics.add.sprite(p.x, p.y, 'marine'))
        ); 
        [
            { x: 248, y: 242, f: true },
            { x: 336, y: 288, f: true },
            { x: 404, y: 236, f: true },
            { x: 472, y: 286, f: true },
            { x: 508, y: 382, f: true },
            { x: 430, y: 444, f: true },
            { x: 358, y: 386, f: false },
            { x: 206, y: 268, f: true },
            { x: 482, y: 470, f: false },
            { x: 388, y: 482, f: true },
            { x: 268, y: 352, f: true },
            { x: 456, y: 336, f: false }
        ].forEach(p => {
            const c = this.physics.add.sprite(p.x, p.y, p.f ? 'civilian_f' : 'civilian');
            c.setTint(Phaser.Display.Color.RandomRGB(120, 255).color);
            this.civilians.add(c);
        });
        this.cursors = this.input.keyboard.createCursorKeys(); 
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); 
        // The club is the one scene that asks for a key besides SPACE, so it is
        // the one scene whose prompts have to name a phone's buttons instead.
        this.danceKey = isTouchMode() ? 'B' : 'F';
        this.actKey = isTouchMode() ? 'A' : 'Space';
        // The B button exists for this scene alone, so this scene is what puts
        // it on screen — and takes it away again by whichever exit it leaves by.
        showDanceButton(true);
        this.events.once('shutdown', () => showDanceButton(false));
        // Canvas text, so it shrinks with the frame rather than with the DOM
        // overlay's touch sizing: 16px lands at about 7px on a phone.
        this.instructionText = this.add.text(20, 20, `Hold ${this.danceKey} to Dance`, { fontSize: promptFontSize(), color: '#fff' }); 
        this.time.addEvent({ delay: 450, loop: true, callback: () => { 
            playSound('club_beat'); 
            this.beat = (this.beat + 1) % FLOOR_COLORS.length;            this.floorTiles.forEach(t => t.setTint(FLOOR_COLORS[(t.gridIndex + this.beat) % FLOOR_COLORS.length]));
            this.lightBeams.forEach((beam, i) => beam.setAlpha((i + this.beat) % 2 ? 0.5 : 0.16));
            this.marines.getChildren().forEach((m, i) => m.setTexture(MARINE_POSES[(this.beat + i) % MARINE_POSES.length]));
            this.yvy.setTexture(YVY_POSES[this.beat % YVY_POSES.length]); // no notes — those stay Mike's
            this.dj.setTexture(this.beat % 2 ? 'dj_2' : 'dj_1');
            [this.yvy, ...this.marines.getChildren(), ...this.civilians.getChildren()].forEach(spr => { 
                spr.y += (Math.random() > 0.5 ? -4 : 4); 
                if(Math.random() > 0.8) spr.x += (Math.random() > 0.5 ? -10 : 10); 
            }); 
        }}); 
        this.physics.add.overlap(this.player, this.yvy, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.handleYvyInteraction(); }); 
        this.physics.add.overlap(this.player, this.djZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.talkToDJ(); });
        this.physics.add.overlap(this.player, this.barZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) this.handleBarInteraction(); }); this.physics.add.overlap(this.player, this.marines, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Marine: 'Woo! Dance with us Mike!'"); }); 
    } 
    update() { 
        this.player.update(this.cursors); 
        if (this.heldDrink.visible) { this.heldDrink.x = this.player.x+10; this.heldDrink.y = this.player.y; }
        if (this.yvyDrink.visible) { this.yvyDrink.x = this.yvy.x+10; this.yvyDrink.y = this.yvy.y; }
        if (this.fKey.isDown && !this.player.isLocked && !isDialogueOpen()) { 
            this.danceFrame(); 
             
            if (gameState.clubProgress === 0) gameState.clubProgress = 1; 
            if (gameState.clubProgress === 3 && !this.danceTimer3) { 
                this.danceTimer3 = this.time.delayedCall(2000, () => { 
                    this.player.isLocked = true; 
                    showDialogue("Mike: 'I'm getting hungry...'", () => { 
                        showDialogue("Yvy: 'Me too. Let's go get pizza.'", () => { 
                            showDialogue("Mike: 'You know what?! We should get matching *hic* Eevee tattoos!'", () => {
                                showDialogue("Yvy: 'HMMM, maybe after getting food *giggles*'", () => {
                                    this.scene.start('PizzaScene'); 
                                });
                            });
                        }); 
                    }); 
                }); 
            } 
        } else if (isDialogueOpen() && gameState.clubProgress >= 1) {
            // He keeps busting moves while he talks — chatting Yvy up mid-dance.
            // Progress stays tied to actually holding F, so the 'Dance first!'
            // prompt can never dance on his behalf.
            this.danceFrame();
        } else {
            this.stopDancing();
        }
        if (gameState.clubProgress === 1) this.instructionText.setText(`Talk to the girl (${this.actKey})`); 
        else if (gameState.clubProgress === 2) this.instructionText.setText(`Go to the Bar (${this.actKey})`); 
        else if (gameState.clubProgress === 3) this.instructionText.setText(`Dance again (Hold ${this.danceKey})`); 
        if (gameState.clubProgress >= 2) { 
            const dist = Phaser.Math.Distance.Between(this.yvy.x, this.yvy.y, this.player.x, this.player.y); 
            if (dist > 60) this.physics.moveToObject(this.yvy, this.player, 120); 
            else this.yvy.body.stop(); 
        } 
        const touching = this.physics.overlap(this.player, [this.yvy, this.barZone, this.djZone]) || this.physics.overlap(this.player, this.marines); document.getElementById('interaction-hint').style.display = touching ? 'block' : 'none'; 
    } 
    /** Step Mike through the dance poses while F is held. */
    danceFrame() {
        if (!this.isDancing) {
            this.isDancing = true;
            this.restTexture = this.player.texture.key;
            this.player.clearTint();
        }
        const step = Math.floor(this.time.now / 170) % DANCE_POSES.length;
        if (step !== this.danceStep) {
            this.danceStep = step;
            this.player.setTexture(DANCE_POSES[step]);
            this.spawnNote();
        }
        this.player.y += (Math.random() - 0.5) * 2;
    }

    /** Back to standing, whatever outfit he was wearing. */
    stopDancing() {
        this.player.clearTint();
        if (!this.isDancing) return;
        this.isDancing = false;
        this.danceStep = -1;
        this.player.setTexture(this.restTexture || 'mike');
    }

    /** Notes drifting off Mike, so the dancing reads at a glance. */
    spawnNote() {
        const note = this.add
            .sprite(this.player.x + Phaser.Math.Between(-10, 10), this.player.y - 14, 'music_note')
            .setTint(Phaser.Display.Color.RandomRGB(140, 255).color)
            .setScale(1.5);
        this.tweens.add({
            targets: note,
            y: note.y - 34,
            x: note.x + Phaser.Math.Between(-14, 14),
            alpha: 0,
            duration: 900,
            onComplete: () => note.destroy()
        });
    }

    handleYvyInteraction() { 
        if (this.isInteracting) return;
        if (gameState.clubProgress < 1) { showDialogue("Dance first!"); return; } 
        if (gameState.clubProgress === 1) { 
            this.isInteracting = true;
            showDialogue("Mike: 'Hi! You have great energy.'", () => { 
                showDialogue("Yvy: 'Thanks! I'm Yvy.'", () => { 
                    takePhoto({
                        key: 'club', title: 'The night they met',
                        caption: "\"Yvy? That sounds like Eevee. That's my favourite Pokemon.\"",
                        sprites: [
                            { texture: 'mike_dance_1', x: -14, y: 0 },
                            { texture: 'yvy_dance_1', x: 14, y: 0 },
                            { texture: 'disco_ball', x: 0, y: -26, scale: 0.7 }
                        ]
                    });
                    showDialogue("Mike: 'Yvy? That sounds like Eevee... That's my favorite Pokemon!'", () => { 
                        this.player.isLocked = true; 
                        this.instructionText.setText("Dancing..."); 
                        this.time.addEvent({ delay: 100, repeat: 20, callback: () => { this.player.y += (Math.random()-0.5)*8; this.yvy.y += (Math.random()-0.5)*8; } }); 
                        this.time.delayedCall(2500, () => { 
                            this.player.isLocked = false; 
                            showDialogue("Yvy: 'Haha yes! I actually cosplay too.'", () => { 
                                showDialogue("Mike: 'Really? Me too. Let me see photos.'", () => {
                                    const phone = this.add.sprite(this.yvy.x + 14, this.yvy.y - 6, 'phone_cam').setDepth(9);
                                    const glow = this.add.rectangle(phone.x, phone.y - 2, 10, 12, 0xbfe9ff, 0.5).setDepth(10);
                                    this.tweens.add({ targets: phone, y: phone.y - 3, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                                    this.tweens.add({ targets: glow, y: phone.y - 5, alpha: 0.2, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); 
                                    showDialogue("Mike: 'NO WAY! Is that a T-Rex??'", () => { 
                                        showDialogue("Yvy: 'Yes! You have one too?'", () => { 
                                            showDialogue("Mike: 'I DO! Destiny! Drinks on me.'", () => { 
                                                [phone, glow].forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
                                                gameState.clubProgress = 2; 
                                                this.isInteracting = false; 
                                            }); 
                                        }); 
                                    }); 
                                }); 
                            }); 
                        }); 
                    }); 
                }); 
            }); 
        } 
    } 
    /** Trying to have a conversation with somebody wearing headphones. */
    talkToDJ() {
        const LINES = [
            "DJ: 'YEAH? WHAT? I CAN'T HEAR YOU!'",
            "Mike: 'GREAT SET!'",
            "DJ: 'THE WHAT? THE SUNSET?'",
            "DJ: 'NO REQUESTS! ...WHAT IS IT?'",
            "Mike: 'NEVER MIND!'",
            "DJ: 'YEAH! EXACTLY!'",
            "The DJ gives him a thumbs up and goes back to the decks."
        ];
        showDialogue(LINES[Math.min(this.djLines++, LINES.length - 1)]);
    }

    handleBarInteraction() { 
        if (gameState.clubProgress === 2) { 
            playSound('clink'); 
            this.heldDrink.setVisible(true); 
            showDialogue("Mike ordered a mixed drink for Yvy.", () => { 
                this.heldDrink.setVisible(false); 
                this.yvyDrink.setVisible(true); 
                gameState.clubProgress = 3; 
            }); 
        } 
    } 
}

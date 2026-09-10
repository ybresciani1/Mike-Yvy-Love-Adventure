import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { stopMusic, playDreamworksTheme, playBattleTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';
import { playSound } from '../audio/sfx.js';

export class MovieScene extends Phaser.Scene {
    constructor() { super('MovieScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a1a'); playDreamworksTheme();
        this.add.rectangle(400, 150, 800, 300, 0x000000); 
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=9; y<GAME_HEIGHT/32; y++) { this.add.image(x*32+16, y*32+16, 'theater_carpet'); }
        
        // --- MOVIE SCREEN (BLACK BACKGROUND TO SHOW WHITE LIGHT FURY) ---
        this.add.rectangle(400, 150, 520, 220, 0x111111); // Dark border
        this.screenRect = this.add.rectangle(400, 150, 500, 200, 0x000000); // Black screen for contrast

        // --- MASK FOR MOVIE SCREEN ---
        const maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(150, 50, 500, 200);        this.screenMask = maskGraphics.createGeometryMask();
        this.buildScreenAtmosphere();
        
        for(let y=0; y<7; y++) { this.add.image(120, 50 + y*32, 'theater_curtain').setScale(1.5, 1); this.add.image(680, 50 + y*32, 'theater_curtain').setScale(1.5, 1); }
        const light = this.add.graphics();
        light.fillStyle(0xffffff, 0.1);
        light.beginPath();
        light.moveTo(395, 600); 
        light.lineTo(405, 600);
        light.lineTo(650, 150); 
        light.lineTo(150, 150); 
        light.closePath();
        light.fillPath();
        light.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: light, alpha: 0.05, duration: 100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.screenText = this.add.text(400, 150, "How to Train Your Dragon 3", { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.screenText.setMask(this.screenMask);

        this.toothless = this.add.sprite(250, 150, 'toothless').setVisible(false); 
        this.toothless.setMask(this.screenMask);

        this.lightFury = this.add.sprite(550, 150, 'light_fury').setVisible(false).setFlipX(true); 
        this.lightFury.setMask(this.screenMask);

        this.nightLights = this.add.group();
        // Audience first, seats second: the seat backs then cover their laps, which
                // is what makes them read as sitting rather than standing behind the row.
                // The house lights are down, so everyone is tinted dark.
                const AUDIENCE = [
                    { x: 100, row: 0, f: false }, { x: 150, row: 0, f: true }, { x: 250, row: 0, f: true },
                    { x: 300, row: 0, f: false }, { x: 450, row: 0, f: true }, { x: 500, row: 0, f: false },
                    { x: 600, row: 0, f: true }, { x: 650, row: 0, f: false },
                    { x: 100, row: 1, f: true }, { x: 150, row: 1, f: false }, { x: 250, row: 1, f: true },
                    { x: 550, row: 1, f: false }, { x: 600, row: 1, f: true }
                ];
                AUDIENCE.forEach(seat => {
                    const y = seat.row === 0 ? 386 : 466;
                    const guest = this.add.sprite(seat.x, y, seat.f ? 'civilian_f' : 'civilian');
                    guest.setTint(Phaser.Display.Color.RandomRGB(55, 120).color);
                    if (Math.random() > 0.55) {
                        this.add.image(seat.x + 17, y + 10, Math.random() > 0.5 ? 'soda_cup' : 'popcorn').setScale(0.55).setTint(0x9a9aa8);
                    }
                });
                for(let i=0; i<12; i++) { this.add.image(100 + i*50, 400, 'theater_seat'); this.add.image(100 + i*50, 480, 'theater_seat'); }
                this.add.image(24, 300, 'exit_sign').setScale(1.3); // exits either side of the house
                this.add.image(776, 300, 'exit_sign').setScale(1.3);
                for (let x = 60; x < 780; x += 90) this.add.circle(x, 545, 2, 0x4de08a, 0.55); // aisle lights
        this.add.rectangle(400, 600, 800, 40, 0x000000); 
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(380, 480, outfit); this.yvy = this.add.sprite(420, 480, 'yvy'); this.popcorn = this.add.sprite(400, 490, 'popcorn').setScale(0.8);
        this.jalapenos = [
            this.add.sprite(372, 468, 'jalapeno').setVisible(false),
            this.add.sprite(428, 468, 'jalapeno').setVisible(false)
        ];
        this.zzz = this.add.text(440, 450, "Zzz...", { fontSize: '20px', color: '#fff' }).setVisible(false);
        this.patKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); this.stage = 0; 
        this.time.delayedCall(1000, () => {
            showDialogue("Yvy: 'Wait! You have to try popcorn with jalapeños!'", () => {
                    this.shareJalapenos();
                    showDialogue("Mike scoops one into the popcorn... 'Wow! Spicy but good!'", () => {
                        showDialogue("Yvy: 'Told you. It's the only way to eat it.'", () => {
                            this.jalapenos.forEach(p => p.setVisible(false));
                            this.startMovie();
                        });
                    });
                });
        });
    }    /**
     * Both of them dip a pepper into the tub between them and eat it with a
     * handful of popcorn — she does not get the only one.
     */
    shareJalapenos() {
        [this.player, this.yvy].forEach((eater, i) => {
            const pepper = this.jalapenos[i];
            const restX = eater.x + (i ? 8 : -8);
            pepper.setPosition(restX, 468).setVisible(true);
            this.tweens.add({
                targets: pepper,
                x: this.popcorn.x + (i ? 5 : -5), // into the tub
                y: this.popcorn.y - 4,
                duration: 430,
                delay: i * 190,
                yoyo: true, // and back up to eat it
                repeat: 2,
                ease: 'Sine.easeInOut'
            });
        });
    }

    /**
     * The screen was a flat black rectangle. Give it a night sky, an aurora over
     * the Hidden World and a sea below the horizon, all clipped to the screen so
     * the film feels like it is actually playing.
     */
    buildScreenAtmosphere() {
        for (let i = 0; i < 70; i++) {
            const big = Math.random() > 0.85;
            const star = this.add
                .rectangle(160 + Math.random() * 480, 58 + Math.random() * 150, big ? 2 : 1, big ? 2 : 1, 0xffffff)
                .setAlpha(0.3 + Math.random() * 0.7);
            star.setMask(this.screenMask);
            this.tweens.add({ targets: star, alpha: 0.12, duration: 600 + Math.random() * 1800, yoyo: true, repeat: -1 });
        }

        this.aurora = this.add.graphics();
        this.aurora.setMask(this.screenMask);
        this.aurora.setBlendMode(Phaser.BlendModes.ADD);
        [[0x1b3a5c, 70], [0x14504f, 44], [0x2a1b5c, 30]].forEach(([color, height], i) => {
            this.aurora.fillStyle(color, 0.5);
            this.aurora.fillEllipse(300 + i * 120, 115 + i * 22, 460 - i * 60, height);
        });
        this.tweens.add({ targets: this.aurora, alpha: 0.45, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        const sea = this.add.graphics();
        sea.setMask(this.screenMask);
        sea.fillStyle(0x061520, 1);
        sea.fillRect(150, 208, 500, 42);
        sea.fillStyle(0x0d3a4a, 0.85);
        for (let i = 0; i < 12; i++) sea.fillRect(158 + i * 42, 214 + (i % 3) * 9, 26, 2);
    }

    /** Slow wingbeat bob, so a dragon on screen never sits perfectly still. */
    hover(dragon) {
        this.tweens.add({ targets: dragon, y: dragon.y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: dragon, scaleY: 0.9, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    /** Toothless's signature shot: a plasma bolt, a screen flash and a shake. */
    firePlasma(fromX, fromY, toX, toY) {
        const bolt = this.add.sprite(fromX, fromY, 'blue_fire').setScale(2.5);
        bolt.setMask(this.screenMask);
        bolt.setBlendMode(Phaser.BlendModes.ADD);
        const flash = this.add.rectangle(400, 150, 500, 200, 0x7fdfff, 0.22);
        flash.setMask(this.screenMask);
        this.tweens.add({ targets: flash, alpha: 0, duration: 260, onComplete: () => flash.destroy() });
        this.cameras.main.shake(200, 0.005);
        playSound('fire');
        this.tweens.add({
            targets: bolt, x: toX, y: toY, scale: 4, duration: 420, ease: 'Quad.easeIn',
            onComplete: () => {
                const burst = this.add.sprite(toX, toY, 'blue_fire').setScale(3);
                burst.setMask(this.screenMask);
                burst.setBlendMode(Phaser.BlendModes.ADD);
                this.tweens.add({ targets: burst, scale: 7, alpha: 0, duration: 340, onComplete: () => burst.destroy() });
                bolt.destroy();
            }
        });
    }

    /** The Hidden World lighting up as the family is reunited. */
    auroraSwell() {
        if (!this.aurora) return;
        this.tweens.add({ targets: this.aurora, alpha: 1, duration: 1800, ease: 'Sine.easeInOut' });
    }

    startMovie() {
        this.screenText.setVisible(false); 
        playBattleTheme();
        const sequence = [
            { text: "The Rescue: After Grimmel captures Toothless and the Light Fury, Hiccup launches a rescue mission.", action: () => {                    this.toothless.setVisible(true); this.lightFury.setVisible(true);
                        this.toothless.x = 350; this.toothless.y = 150;
                        this.lightFury.x = 450; this.lightFury.y = 150;
                        this.hover(this.toothless); this.hover(this.lightFury);
                        this.firePlasma(this.toothless.x + 18, this.toothless.y, 620, 110);
            }},
            { text: "The Sacrifice: During a mid-air struggle, the Light Fury falls. Hiccup realizes he can't save both her and Toothless.", action: () => {
                 this.tweens.add({targets: this.lightFury, y: 220, duration: 1000}); 
            }},
            { text: "Hiccup unclips his leg and urges the Light Fury to save Toothless instead.", action: () => {
                this.tweens.add({targets: this.lightFury, x: 350, y: 150, duration: 500});
            }},
            { text: "Grimmel's Defeat: The Light Fury rescues Toothless, then dives to catch Hiccup. Grimmel falls to his death.", action: () => {                    this.tweens.add({targets: [this.toothless, this.lightFury], y: 120, duration: 1000, yoyo: true});
                        this.firePlasma(this.toothless.x + 18, this.toothless.y, 180, 210);
                        this.time.delayedCall(500, () => this.firePlasma(this.lightFury.x + 18, this.lightFury.y, 200, 190));
            }},
            { text: "Letting Go: Hiccup realizes dragons will never be safe among humans. He sends them to the Hidden World.", action: () => {
                 this.tweens.add({targets: [this.toothless, this.lightFury], x: -50, duration: 2000});
            }},
            { text: "The Farewell: In a tearful scene, the Berkians say goodbye. Toothless leads the dragons away.", action: () => {}},
            { text: "Epilogue: Years later... Hiccup and Astrid sail to the edge of the Hidden World.", action: () => {
                this.toothless.x = 300; this.lightFury.x = 400;
                this.toothless.setVisible(true); this.lightFury.setVisible(true);
                this.tweens.add({targets: [this.toothless, this.lightFury], x: '+=100', duration: 2000});
                const n1 = this.nightLights.create(350, 180, 'night_light');
                const n2 = this.nightLights.create(380, 170, 'night_light');
                const n3 = this.nightLights.create(320, 170, 'night_light');
                [n1, n2, n3].forEach(n => n.setMask(this.screenMask));                    this.tweens.add({targets: this.nightLights.getChildren(), y: '+=10', duration: 500, yoyo: true, repeat: -1});
                        [n1, n2, n3].forEach((n, i) => this.tweens.add({ targets: n, scale: 1.15, duration: 700 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
                        this.auroraSwell();
            }},
            { text: "They reunite with Toothless, the Light Fury, and their three Night Lights.", action: () => {}},
            { text: "The End.", action: () => {
                this.screenText.setText("THE END").setVisible(true);
                this.toothless.setVisible(false); this.lightFury.setVisible(false); this.nightLights.setVisible(false);
            }}
        ];
        let i = 0;
        const nextStep = () => {
            if(i < sequence.length) {
                const step = sequence[i];
                if(step.action) step.action();
                showDialogue(step.text, () => {
                    i++;
                    this.time.delayedCall(500, nextStep);
                });
            } else {
                stopMusic();
                this.zzz.setVisible(true);
                this.add.text(400, 550, "Yvy fell asleep. Press SPACE to Pat Head", { fontSize: '16px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);
                this.stage = 1;
            }
        };
        nextStep();
    }
    update() {
        if (this.stage === 1 && Phaser.Input.Keyboard.JustDown(this.patKey)) {
            this.stage = 2; showDialogue("Mike cautiously patted her head.", () => { showDialogue("Yvy wakes up: 'Oh! I'm sorry, I drifted off.'", () => { showDialogue("Mike: 'It's okay. You tired?'", () => { showDialogue("Yvy: 'Yeah... long day.'", () => { showDialogue("Mike: 'Want to crash at my hotel? No pressure.'", () => { showDialogue("Yvy: 'I'd love that.'", () => { this.scene.start('DriveToHotelScene'); }); }); }); }); }); });
        }
    }
}

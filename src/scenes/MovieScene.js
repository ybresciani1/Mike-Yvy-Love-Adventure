import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { stopMusic, playDreamworksTheme, playBattleTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';

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
        maskGraphics.fillRect(150, 50, 500, 200); 
        this.screenMask = maskGraphics.createGeometryMask();
        
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
        for(let i=0; i<12; i++) { this.add.image(100 + i*50, 400, 'theater_seat'); this.add.image(100 + i*50, 480, 'theater_seat'); }
        this.add.rectangle(400, 600, 800, 40, 0x000000); 
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(380, 480, outfit); this.yvy = this.add.sprite(420, 480, 'yvy'); this.popcorn = this.add.sprite(400, 490, 'popcorn').setScale(0.8);
        this.jalapeno = this.add.sprite(420, 470, 'jalapeno').setVisible(false);
        this.zzz = this.add.text(440, 450, "Zzz...", { fontSize: '20px', color: '#fff' }).setVisible(false);
        this.patKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); this.stage = 0; 
        this.time.delayedCall(1000, () => {
            showDialogue("Yvy: 'Wait! You have to try popcorn with jalapeños!'", () => { this.jalapeno.setVisible(true); this.tweens.add({targets: this.jalapeno, y: 480, duration: 500, yoyo: true, repeat: 2}); showDialogue("Mike tries it... 'Wow! Spicy but good!'", () => { this.jalapeno.setVisible(false); this.startMovie(); }); });
        });
    }
    startMovie() {
        this.screenText.setVisible(false); 
        playBattleTheme();
        const sequence = [
            { text: "The Rescue: After Grimmel captures Toothless and the Light Fury, Hiccup launches a rescue mission.", action: () => {
                this.toothless.setVisible(true); this.lightFury.setVisible(true);
                this.toothless.x = 350; this.toothless.y = 150;
                this.lightFury.x = 450; this.lightFury.y = 150;
            }},
            { text: "The Sacrifice: During a mid-air struggle, the Light Fury falls. Hiccup realizes he can't save both her and Toothless.", action: () => {
                 this.tweens.add({targets: this.lightFury, y: 220, duration: 1000}); 
            }},
            { text: "Hiccup unclips his leg and urges the Light Fury to save Toothless instead.", action: () => {
                this.tweens.add({targets: this.lightFury, x: 350, y: 150, duration: 500});
            }},
            { text: "Grimmel's Defeat: The Light Fury rescues Toothless, then dives to catch Hiccup. Grimmel falls to his death.", action: () => {
                this.tweens.add({targets: [this.toothless, this.lightFury], y: 120, duration: 1000, yoyo: true});
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
                [n1, n2, n3].forEach(n => n.setMask(this.screenMask));
                this.tweens.add({targets: this.nightLights.getChildren(), y: '+=10', duration: 500, yoyo: true, repeat: -1});
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

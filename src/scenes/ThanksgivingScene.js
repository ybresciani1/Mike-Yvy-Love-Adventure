import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { fadeOutMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';

export class ThanksgivingScene extends Phaser.Scene {
    constructor() { super('ThanksgivingScene'); }
    preload() { this.load.image('turkey_custom', REMOTE_IMAGES.turkey); }
    create() {
        this.cameras.main.setBackgroundColor('#d35400');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_wood').setTint(0xcc9966);
        playLeFestinTheme();
        // Thanksgiving is at Mike's family's, in North Carolina — the only part of
        // the story that is not DC or San Diego.
        this.add.text(400, 44, "Thanksgiving in North Carolina", { fontSize: '20px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);
        this.add.text(400, 68, "Both families, one table", { fontSize: '11px', color: '#ffdca8' }).setOrigin(0.5);
        // The dining room around the table: papered wall, sideboard, wreath on the
        // door, chairs pulled up on both sides.
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 0; y < 5; y++) this.add.image(x * 32 + 16, y * 32 + 16, 'bedroom_wall').setTint(0xe8c9a8);
        }
        this.add.rectangle(400, 158, GAME_WIDTH, 4, 0xb08a5c);
        this.add.rectangle(400, 161, GAME_WIDTH, 3, 0x8a6a42);
        this.add.image(120, 210, 'sideboard');
        this.add.image(680, 210, 'sideboard');
        this.add.image(400, 106, 'autumn_wreath');
        this.add.image(232, 108, 'wall_art').setTint(0xf0d8b8);
        this.add.image(568, 108, 'wall_art').setTint(0xf0d8b8);
        this.add.image(60, 330, 'plant_flowers');
        this.add.image(744, 330, 'pothos');

        this.add.image(400, 300, 'conf_table').setScale(1.5, 1);
        for (const cx of [316, 400, 484]) {
            this.add.image(cx, 250, 'dining_chair');
            this.add.image(cx, 352, 'dining_chair').setFlipY(true);
        }
        this.add.image(268, 300, 'dining_chair').setAngle(90);
        this.add.image(532, 300, 'dining_chair').setAngle(-90);
        let turkey = this.add.image(400, 280, 'turkey_custom');
        turkey.setDisplaySize(48, 48);
        this.add.image(350, 280, 'mashed_potatoes').setScale(0.8);
        this.add.image(450, 280, 'cranberry').setScale(0.8);
        this.add.image(380, 310, 'pie').setScale(0.8);
        this.add.image(420, 310, 'mashed_potatoes').setScale(0.8);
        // conf_table is 96x48 drawn at 1.5x1, so the cloth runs x 328..472 and
        // y 276..324. Anything outside that is on the floor, which is where the
        // first set of these ended up.
        this.add.image(348, 314, 'cranberry').setScale(0.6);
        this.add.image(452, 312, 'pie').setScale(0.6);
        for (const [px, py] of [[342, 286], [342, 314], [458, 286], [458, 314], [400, 318]]) {
            this.add.image(px, py, 'place_setting');
        }
        
        // --- Characters ---
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 100, 450); this.player.setTexture(outfit);
        
        // Interactive Zones
        this.yvyFamilyZone = this.add.rectangle(150, 250, 150, 100, 0xffff00, 0); this.physics.add.existing(this.yvyFamilyZone, true);
        this.mikeFamilyZone = this.add.rectangle(650, 250, 150, 100, 0xffff00, 0); this.physics.add.existing(this.mikeFamilyZone, true);
        this.cousinZone = this.add.rectangle(400, 500, 100, 100, 0xffff00, 0); this.physics.add.existing(this.cousinZone, true);

        // Yvy's Family
        this.yvyDad = this.physics.add.sprite(150, 250, 'yvy_dad'); 
        this.yvyStepmom = this.physics.add.sprite(180, 260, 'yvy_stepmom');
        
        // Mike's Family
        this.mikeMom = this.physics.add.sprite(650, 250, 'mike_mom');
        this.mikeDad = this.physics.add.sprite(680, 250, 'mike_dad'); 
        this.jocelyn = this.physics.add.sprite(710, 260, 'jocelyn');

        // Cousin
        this.cousin = this.physics.add.sprite(400, 500, 'aiden').setTint(0xcccc55);
        // Fidgeting on the spot until someone gives him an excuse. Scale is safe
        // to tween on a physics sprite; position is not.
        this.tweens.add({ targets: this.cousin, scaleY: 0.94, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tagging = false;
        this.cousinTarget = null; 

        // Followers
        this.yvy = this.physics.add.sprite(this.player.x - 30, this.player.y, 'yvy');
        this.aiden = this.physics.add.sprite(this.player.x - 60, this.player.y, 'aiden');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.talkedState = { yvyFamily: false, mikeFamily: false, cousin: false };

        this.add.text(20, 550, "Talk to everyone! (Space)", { fontSize: '16px', color: '#fff' });

        this.physics.add.overlap(this.player, this.yvyFamilyZone, () => {
             if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy() && !this.talkedState.yvyFamily) {
                 this.talkedState.yvyFamily = true;
                 showDialogue("Yvy's Dad: '¡Hola Miguel! ¿Cómo estás? Bienvenido.'", () => {
                     showDialogue("Mike (trying his best): 'Uh... Hola! Muy... good? Gracias?'", () => {
                         showDialogue("Yvy's Stepmom laughs warmly: '¡Siéntate, come! La comida está deliciosa.'", () => {
                             showDialogue("Mike: 'Si, si... delicioso!'", () => {
                                  showDialogue("They all laugh together, sharing a warm moment beyond language barriers.", () => {
                                      this.checkProgress();
                                  });
                             });
                         });
                     });
                 });
             }
        });

        this.physics.add.overlap(this.player, this.mikeFamilyZone, () => {
             if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy() && !this.talkedState.mikeFamily) {
                 this.talkedState.mikeFamily = true;
                 showDialogue("Mike's Mom: 'So glad you made it, Mike. The garden is blooming beautifully this year.'", () => {
                     showDialogue("Mike's Dad: 'The turkey came out perfect. Let's eat.'", () => {
                         showDialogue("Jocelyn: 'It's so lively with everyone here! I love it.'", () => {
                              showDialogue("Mike's family welcomes everyone with open arms.", () => {
                                  this.checkProgress();
                              });
                         });
                     });
                 });
             }
        });

        this.physics.add.overlap(this.player, this.cousinZone, () => {
             if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy() && !this.talkedState.cousin) {
                 this.talkedState.cousin = true;
                 showDialogue("Cousin: 'Bet you can't catch me!'", () => {
                     showDialogue("Aiden: 'I'm gonna get you!'", () => {
                         showDialogue("Aiden runs off to play tag with his cousin, giggling uncontrollably.", () => {
                             this.startTag();
                             this.checkProgress();
                         });
                     });
                 });
             }
        });
    }

    /** The cousin bolts; Aiden goes after him. */
    startTag() {
        this.tagging = true;
        this.tweens.killTweensOf(this.cousin);
        this.cousin.setScale(1);
        this.nextTagSpot();
    }

    nextTagSpot() {
        // Round the open floor below the table, well clear of everyone eating.
        this.cousinTarget = new Phaser.Math.Vector2(
            Phaser.Math.Between(140, 660),
            Phaser.Math.Between(390, 540)
        );
        this.cousin.setFlipX(this.cousinTarget.x < this.cousin.x);
        this.physics.moveTo(this.cousin, this.cousinTarget.x, this.cousinTarget.y, 170);
    }

    runTag() {
        const strayed = this.cousin.x < 110 || this.cousin.x > 690 || this.cousin.y < 370 || this.cousin.y > 560;
        if (strayed) {
            // Belt and braces: moveTo sets a constant velocity and nothing else
            // ever stops it, so a missed arrival would run him off the map.
            this.cousin.body.stop();
            this.cousin.x = Phaser.Math.Clamp(this.cousin.x, 120, 680);
            this.cousin.y = Phaser.Math.Clamp(this.cousin.y, 380, 550);
            this.cousinTarget = null;
            this.nextTagSpot();
            return;
        }
        if (this.cousinTarget && Phaser.Math.Distance.BetweenPoints(this.cousin, this.cousinTarget) < 14) {
            this.cousin.body.stop();
            this.cousinTarget = null;
            this.time.delayedCall(Phaser.Math.Between(120, 500), () => { if (this.tagging) this.nextTagSpot(); });
        }
        // Aiden never quite catches him, which is the point of the game.
        const gap = Phaser.Math.Distance.BetweenPoints(this.aiden, this.cousin);
        if (gap > 34) {
            this.aiden.setFlipX(this.cousin.x < this.aiden.x);
            this.physics.moveToObject(this.aiden, this.cousin, 150);
        } else {
            this.aiden.body.stop();
        }
    }

    update() {
        this.player.update(this.cursors);
        
        // Follow Logic
        // The kids carry on whether or not Mike is moving.
        if (this.tagging) this.runTag();

        if (this.player.body.velocity.length() > 5) {
            this.physics.moveToObject(this.yvy, this.player, 140);
            if (!this.tagging && !this.talkedState.cousin) {
                this.physics.moveToObject(this.aiden, this.player, 130);
            }
        } else {
             const distYvy = Phaser.Math.Distance.BetweenPoints(this.player, this.yvy);
             if (distYvy < 60) this.yvy.body.stop();
             
             if (!this.tagging && !this.talkedState.cousin) {
                const distAiden = Phaser.Math.Distance.BetweenPoints(this.player, this.aiden);
                if (distAiden < 60) this.aiden.body.stop();
             }
        }
        
        const touching = this.physics.overlap(this.player, [this.yvyFamilyZone, this.mikeFamilyZone, this.cousinZone]);
        document.getElementById('interaction-hint').style.display = touching ? 'block' : 'none';
    }

    checkProgress() {
        if (this.talkedState.yvyFamily && this.talkedState.mikeFamily && this.talkedState.cousin) {
            this.time.delayedCall(1000, () => {
                fadeOutMusic(2);
                takePhoto({
                    key: 'thanksgiving', title: 'Thanksgiving, North Carolina',
                    caption: "Both families at one table, and nobody fell out.",
                    sprites: [
                        { texture: 'yvy_dad', x: -32, y: 2 },
                        { texture: 'mike_mom', x: -11, y: 2 },
                        { texture: this.player.texture.key, x: 11, y: 2 },
                        { texture: 'yvy', x: 32, y: 2 },
                        { texture: 'turkey', x: 0, y: 18, scale: 0.7 }
                    ]
                });
                showDialogue("Families blending together, sharing food and laughter.", () => {
                    this.scene.start('HomeScene');
                });
            });
        }
    }
}

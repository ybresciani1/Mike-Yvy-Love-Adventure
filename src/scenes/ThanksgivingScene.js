import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { fadeOutMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class ThanksgivingScene extends Phaser.Scene {
    constructor() { super('ThanksgivingScene'); }
    preload() { this.load.image('turkey_custom', REMOTE_IMAGES.turkey); }
    create() {
        this.cameras.main.setBackgroundColor('#d35400');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_wood').setTint(0xcc9966);
        playLeFestinTheme();
        // --- CHANGED: NC to DC ---
        this.add.text(400, 50, "Thanksgiving in DC", { fontSize: '24px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);
        this.add.image(400, 300, 'conf_table').setScale(1.5, 1);
        let turkey = this.add.image(400, 280, 'turkey_custom');
        turkey.setDisplaySize(48, 48);
        this.add.image(350, 280, 'mashed_potatoes').setScale(0.8);
        this.add.image(450, 280, 'cranberry').setScale(0.8);
        this.add.image(380, 310, 'pie').setScale(0.8);
        this.add.image(420, 310, 'mashed_potatoes').setScale(0.8);
        
        // --- Characters ---
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 100, 450); this.player.setTexture(outfit);
        
        // Interactive Zones
        this.yvyFamilyZone = this.add.rectangle(150, 250, 150, 100, 0xffff00, 0); this.physics.add.existing(this.yvyFamilyZone, true);
        this.mikeFamilyZone = this.add.rectangle(650, 250, 150, 100, 0xffff00, 0); this.physics.add.existing(this.mikeFamilyZone, true);
        this.cousinZone = this.add.rectangle(400, 500, 100, 100, 0xffff00, 0); this.physics.add.existing(this.cousinZone, true);

        // Yvy's Family
        this.yvyDad = this.physics.add.sprite(150, 250, 'civilian').setTint(0x8d6e63); 
        this.yvyStepmom = this.physics.add.sprite(180, 260, 'civilian').setTint(0xffccbc);
        
        // Mike's Family
        this.mikeMom = this.physics.add.sprite(650, 250, 'civilian').setTint(0xffaaaa);
        this.mikeDad = this.physics.add.sprite(680, 250, 'mike_suit').setTint(0x555555); 
        this.jocelyn = this.physics.add.sprite(710, 260, 'civilian').setTint(0xccaaff);

        // Cousin
        this.cousin = this.physics.add.sprite(400, 500, 'aiden').setTint(0xcccc55); 

        // Followers
        this.yvy = this.physics.add.sprite(this.player.x - 30, this.player.y, 'yvy');
        this.aiden = this.physics.add.sprite(this.player.x - 60, this.player.y, 'aiden');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.talkedState = { yvyFamily: false, mikeFamily: false, cousin: false };

        this.add.text(20, 550, "Talk to everyone! (Space)", { fontSize: '16px', color: '#fff' });

        this.physics.add.overlap(this.player, this.yvyFamilyZone, () => {
             if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.talkedState.yvyFamily) {
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
             if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.talkedState.mikeFamily) {
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
             if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.talkedState.cousin) {
                 this.talkedState.cousin = true;
                 showDialogue("Cousin: 'Bet you can't catch me!'", () => {
                     showDialogue("Aiden: 'I'm gonna get you!'", () => {
                         showDialogue("Aiden runs off to play tag with his cousin, giggling uncontrollably.", () => {
                             this.tweens.add({targets: this.aiden, x: this.cousin.x + 40, duration: 500, yoyo: true, repeat: 2});
                             this.checkProgress();
                         });
                     });
                 });
             }
        });
    }

    update() {
        this.player.update(this.cursors);
        
        // Follow Logic
        if (this.player.body.velocity.length() > 5) {
            this.physics.moveToObject(this.yvy, this.player, 140);
            if (!this.talkedState.cousin) this.physics.moveToObject(this.aiden, this.player, 130); // Stop following if playing
        } else {
             const distYvy = Phaser.Math.Distance.BetweenPoints(this.player, this.yvy);
             if (distYvy < 60) this.yvy.body.stop();
             
             if (!this.talkedState.cousin) {
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
                showDialogue("Families blending together, sharing food and laughter.", () => {
                    this.scene.start('HomeScene');
                });
            });
        }
    }
}

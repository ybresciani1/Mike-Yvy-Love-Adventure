import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { fadeOutMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class RestaurantScene extends Phaser.Scene { 
    constructor() { super('RestaurantScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#3e2723'); playLeFestinTheme();
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_wood'); 
        this.add.image(100, 150, 'conf_table').setTint(0x5d4037).setScale(0.8); this.add.image(700, 150, 'conf_table').setTint(0x5d4037).setScale(0.8); this.add.image(100, 450, 'conf_table').setTint(0x5d4037).setScale(0.8); 
        [ {x: 80, y: 130}, {x: 120, y: 130}, {x: 680, y: 130}, {x: 720, y: 130}, {x: 80, y: 430} ].forEach(pos => { let c = this.add.sprite(pos.x, pos.y, 'civilian'); c.setTint(Math.random() * 0xffffff); }); 
        this.add.image(50, 50, 'plant'); this.add.image(750, 50, 'plant'); this.add.image(750, 550, 'plant'); this.add.text(400, 50, "GORDON BIERSCH BREWPUB", { fontSize: '24px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5); 
        this.hostStand = this.physics.add.staticImage(200, 200, 'host_stand'); this.host = this.add.sprite(220, 190, 'host'); this.hostZone = this.add.rectangle(200, 250, 60, 60, 0xffff00, 0); this.physics.add.existing(this.hostZone, true); 
        this.table = this.add.image(600, 400, 'conf_table').setTint(0x5d4037); this.chairMike = this.add.image(580, 430, 'chair'); this.chairYvy = this.add.image(620, 430, 'chair'); 
        this.menu1 = this.add.image(580, 390, 'menu'); this.menu2 = this.add.image(620, 390, 'menu'); 
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit'; this.player = new Player(this, 50, 500); this.player.setTexture(outfit); 
        this.server = this.add.sprite(800, 100, 'server'); this.yvy = this.add.sprite(50, 550, 'yvy').setVisible(false); this.spaghetti = this.add.sprite(580, 390, 'spaghetti').setVisible(false); this.tacos = this.add.sprite(620, 390, 'tacos').setVisible(false); 
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); this.progress = 0; 
        this.tweens.add({ targets: this.player, x: 200, y: 280, duration: 1500 }); 
        this.physics.add.overlap(this.player, this.hostZone, () => { 
            if (this.progress === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) { 
                this.progress = 1; showDialogue("Mike: 'Table for two, please.'", () => { showDialogue("Host: 'Right this way sir.'", () => { 
                    this.tweens.add({ targets: this.host, x: 600, y: 350, duration: 2000 }); this.tweens.add({ targets: this.player, x: 580, y: 430, duration: 2500, delay: 200, onComplete: () => { this.player.setFlipX(false); this.tweens.add({ targets: this.host, x: 220, y: 190, duration: 2000, onComplete: () => { this.time.delayedCall(1000, () => { this.startYvyArrival(); }); }}); }}); 
                }); }); 
            } 
        }); 
    } 
    startYvyArrival() { 
        this.yvy.setVisible(true); this.yvy.x = 50; this.yvy.y = 500; 
        this.tweens.add({ targets: this.yvy, x: 200, y: 280, duration: 1500, onComplete: () => { showDialogue("Yvy: 'Hi, I'm meeting someone.'", () => { showDialogue("Host: 'He is seated right over there.'", () => { 
            this.tweens.add({ targets: this.host, x: 600, y: 350, duration: 2000 }); this.tweens.add({ targets: this.yvy, x: 620, y: 430, duration: 2500, delay: 200, onComplete: () => { showDialogue("Yvy waves: 'Hi Mike!'", () => { this.tweens.add({ targets: this.host, x: 220, y: 190, duration: 2000 }); this.startDinnerDate(); }); }}); 
        }); }); }}); 
    } 
    startDinnerDate() { showDialogue("Mike: 'Hey! Glad you made it.'", () => { showDialogue("Mike: 'I went to church with my friend Hunter today. It was really nice.'", () => { showDialogue("Yvy: 'That sounds lovely! Let's order.'", () => { this.serverApproaches(); }); }); }); } 
    
    serverApproaches() { 
        this.tweens.add({ targets: this.server, x: 600, y: 350, duration: 2000, onComplete: () => { 
            showDialogue("Server: 'What can I get you?'", () => { 
                showDialogue("Yvy: 'I'll have the tacos, please.'", () => { 
                    this.showMenu();
                }); 
            }); 
        }}); 
    } 

    showMenu() {
        const modal = document.getElementById('restaurant-menu-modal');
        modal.style.display = 'block';
        this.player.isLocked = true;

        document.getElementById('btn-order-tacos').onclick = () => {
            modal.style.display = 'none';
            showDialogue("Mike: 'You’re getting tacos, right? Hmm, maybe we can try something else'", () => {
                modal.style.display = 'block'; 
            });
        };

        document.getElementById('btn-order-pizza').onclick = () => {
            modal.style.display = 'none';
            showDialogue("Mike: 'Hmm, we might get this at the theater, though.'", () => {
                modal.style.display = 'block'; 
            });
        };

        document.getElementById('btn-order-spaghetti').onclick = () => {
            modal.style.display = 'none';
            this.player.isLocked = false;
            showDialogue("Mike: 'Can’t beat the classics!'", () => {
                showDialogue("Mike: 'And spaghetti for me.'", () => {
                    showDialogue("Server: 'Coming right up.'", () => {
                        this.tweens.add({ targets: this.server, x: 800, y: 100, duration: 1500, onComplete: () => {
                            this.time.delayedCall(1000, () => { this.serverReturns(); });
                        }});
                    });
                });
            });
        };
    }

    serverReturns() { this.tweens.add({ targets: this.server, x: 600, y: 350, duration: 1500, onComplete: () => { this.tacos.setVisible(true); this.spaghetti.setVisible(true); this.menu1.setVisible(false); this.menu2.setVisible(false); showDialogue("Server: 'Here you go. Enjoy!'", () => { this.tweens.add({ targets: this.server, x: 800, y: 100, duration: 1500 }); showDialogue("*They eat delicious food*", () => { this.time.delayedCall(1000, () => { fadeOutMusic(2); this.time.delayedCall(2000, () => { showDialogue("Mike: 'Ready for the movie?'", () => { this.scene.start('MovieScene'); }); }); }); }); }); }}); } 
    update() { if (this.progress === 0) this.player.update(this.cursors); document.getElementById('interaction-hint').style.display = (this.progress === 0 && this.physics.overlap(this.player, this.hostZone)) ? 'block' : 'none'; } 
}

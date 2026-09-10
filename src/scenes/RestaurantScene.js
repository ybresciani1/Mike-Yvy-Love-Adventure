import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { fadeOutMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class RestaurantScene extends Phaser.Scene { 
    constructor() { super('RestaurantScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#3e2723'); playLeFestinTheme();
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 0; y < GAME_HEIGHT / 32; y++) {
                if (y < 3) this.add.image(x*32+16, y*32+16, 'bar_wall');
                else this.add.image(x*32+16, y*32+16, 'floor_wood');
            }
        }

        // The kitchen line, open to the room.
        this.add.image(188, 62, 'kitchen_range');
        this.add.image(96, 60, 'kitchen_pass');
        this.add.sprite(72, 104, 'server').setTint(0xf0f0f0); // chefs working the pass
        this.add.sprite(120, 104, 'server').setTint(0xe8dcc8);

        // Brewery tanks behind glass on the other side.
        [612, 654, 696, 738].forEach(x => this.add.image(x, 64, 'brew_tank'));
        this.add.text(675, 108, "BREWERY", { fontSize: '10px', color: '#e8c96a', fontStyle: 'bold' }).setOrigin(0.5);

        // Booth seating down the right wall, with diners in them.
        [{ y: 250 }, { y: 340 }].forEach(b => {
            this.add.image(742, b.y, 'booth_seat');
            this.add.sprite(724, b.y - 4, 'civilian_f').setTint(Phaser.Display.Color.RandomRGB(140, 255).color);
            this.add.sprite(760, b.y - 4, 'civilian').setTint(Phaser.Display.Color.RandomRGB(140, 255).color);
        });

        // Pictures and pothos on the walls.
        this.add.image(24, 58, 'fancy_art').setScale(0.8);
        this.add.image(778, 58, 'fancy_art').setScale(0.8);
        this.add.image(36, 250, 'pothos');
        this.add.image(36, 430, 'pothos');
        this.add.image(400, 560, 'pothos'); [{ x: 130, y: 330 }, { x: 330, y: 200 }, { x: 330, y: 470 }, { x: 500, y: 330 }].forEach(t => {
            this.add.image(t.x, t.y, 'conf_table').setTint(0x5d4037).setScale(0.7);
            this.add.image(t.x - 26, t.y + 4, 'chair');
            this.add.image(t.x + 26, t.y + 4, 'chair');
            this.add.sprite(t.x - 26, t.y - 6, 'civilian_f').setTint(Phaser.Display.Color.RandomRGB(140, 255).color);
            this.add.sprite(t.x + 26, t.y - 6, 'civilian').setTint(Phaser.Display.Color.RandomRGB(140, 255).color);
            this.add.image(t.x, t.y - 6, 'cocktail').setScale(0.6);
        }); this.add.image(560, 560, 'plant_fern'); this.add.image(120, 560, 'plant_flowers'); this.add.text(400, 50, "GORDON BIERSCH BREWPUB", { fontSize: '18px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5); 
        this.hostStand = this.physics.add.staticImage(200, 200, 'host_stand'); this.host = this.add.sprite(220, 190, 'host'); this.hostZone = this.add.rectangle(200, 250, 60, 60, 0xffff00, 0); this.physics.add.existing(this.hostZone, true); 
        this.table = this.add.image(600, 400, 'conf_table').setTint(0x5d4037); this.chairMike = this.add.image(580, 430, 'chair'); this.chairYvy = this.add.image(620, 430, 'chair'); 
        this.menu1 = this.add.image(580, 390, 'menu'); this.menu2 = this.add.image(620, 390, 'menu'); 
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit'; this.player = new Player(this, 50, 500); this.player.setTexture(outfit); 
        this.server = this.add.sprite(800, 100, 'server'); this.yvy = this.add.sprite(50, 550, 'yvy').setVisible(false); this.spaghetti = this.add.sprite(580, 390, 'spaghetti').setVisible(false); this.tacos = this.add.sprite(620, 390, 'tacos').setVisible(false); 
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); this.progress = 0; 
        this.tweens.add({ targets: this.player, x: 200, y: 280, duration: 1500 }); 
        this.physics.add.overlap(this.player, this.hostZone, () => { 
            if (this.progress === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { 
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

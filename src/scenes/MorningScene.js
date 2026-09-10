import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { fadeOutMusic, playRomanticTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class MorningScene extends Phaser.Scene { 
    constructor() { super('MorningScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#000'); 
        for (let x = 0; x < GAME_WIDTH/32; x++) for (let y = 0; y < GAME_HEIGHT/32; y++) {
                        if (y < 2) this.add.image(x*32+16, y*32+16, 'hotel_wall');
                        else this.add.image(x*32+16, y*32+16, 'hotel_carpet');
                    } 
        this.add.image(400, 300, 'hotel_bed'); this.add.image(200, 300, 'couch');
        this.add.image(636, 40, 'hotel_window_night'); this.add.image(268, 32, 'wall_art'); this.add.image(470, 32, 'wall_art'); 
        this.dresser = this.physics.add.staticImage(600, 100, 'dresser'); this.door = this.physics.add.staticImage(100, 100, 'door'); 
        this.add.image(350, 300, 'nightstand'); this.add.image(450, 300, 'nightstand'); this.add.image(350, 290, 'lamp').setScale(0.8); this.add.image(450, 290, 'lamp').setScale(0.8); 
        this.add.text(180, 258, "Hotel Room", { fontSize: '12px', color: '#f2e8d5' }); 
        this.phone = this.physics.add.staticImage(450, 322, 'hotel_phone'); 
        this.player = new Player(this, 400, 300); 
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.ringing = true; this.tweens.add({ targets: this.phone, scale: 1.5, duration: 200, yoyo: true, repeat: -1 }); 
        this.time.addEvent({ delay: 1000, callback: () => { if(this.ringing) playSound('select'); }, loop: true }); 
        this.add.text(350, 50, "4:00 AM", { fontSize: '40px', color: '#fff', backgroundColor: '#000' }); 
        this.instructionText = this.add.text(20, 20, "Answer Phone (Space)", { fontSize: '16px', color: '#fff' }); 
        this.dresserZone = this.add.rectangle(600, 120, 80, 80, 0xffff00, 0); this.physics.add.existing(this.dresserZone, true); 
        this.doorZone = this.add.rectangle(100, 100, 50, 60, 0x00ff00, 0); this.physics.add.existing(this.doorZone, true); 
        this.physics.add.overlap(this.player, this.phone, () => { 
            if (this.ringing && Phaser.Input.Keyboard.JustDown(this.spaceKey)) { 
                this.ringing = false; this.phone.destroy(); playRomanticTheme(); 
                const seq = [ "Mike picks up the phone...", "Yvy: 'Good morning! It's 4 AM! Wake up!'", "Mike: 'You actually called!'", "Mike: 'I'm awake. Thank you, Yvy.'", "Mike: 'Bye Yvy-- I hope to see you soon!'", "*Click*", "Mike: 'Wow, she actually called... Best trip ever ❤️'", "Mike: 'Time to get ready for work.'" ]; 
                let i = 0; const next = () => { if (i > 0 && seq[i-1].includes("Bye Yvy.")) fadeOutMusic(2); if (i < seq.length) { showDialogue(seq[i++], next); } else { gameState.callFinished = true; this.instructionText.setText("Go to Dresser (Space)"); } }; next(); 
            } 
        }); 
        this.physics.add.overlap(this.player, this.dresserZone, () => { 
            if (gameState.callFinished && Phaser.Input.Keyboard.JustDown(this.spaceKey)) { 
                document.getElementById('wardrobe-modal').style.display = 'block'; this.player.isLocked = true; 
                document.getElementById('btn-suit').onclick = () => { this.player.setTexture('mike_suit'); this.game.registry.set('playerOutfit', 'mike_suit'); }; 
                document.getElementById('btn-casual').onclick = () => { this.player.setTexture('mike_casual'); this.game.registry.set('playerOutfit', 'mike_casual'); }; 
                document.getElementById('btn-confirm').onclick = () => { document.getElementById('btn-confirm').blur(); if (!this.game.registry.get('playerOutfit')) { this.player.setTexture('mike_suit'); this.game.registry.set('playerOutfit', 'mike_suit'); } closeWardrobe(); }; 
            } 
        }); 
        this.physics.add.overlap(this.player, this.doorZone, () => { if (gameState.dressedForWork && Phaser.Input.Keyboard.JustDown(this.spaceKey)) { this.scene.start('ConferenceScene'); } }); 
        const closeWardrobe = () => { document.getElementById('wardrobe-modal').style.display = 'none'; this.player.isLocked = false; this.player.y += 40; gameState.dressedForWork = true; this.instructionText.setText("Go to Work (Use Door)"); showDialogue("Mike: 'This is the one. Looking sharp!'"); }; 
    } 
    update() { this.player.update(this.cursors); document.getElementById('interaction-hint').style.display = (this.physics.overlap(this.player, this.phone) || (gameState.callFinished && this.physics.overlap(this.player, this.dresserZone)) || (gameState.dressedForWork && this.physics.overlap(this.player, this.doorZone))) ? 'block' : 'none'; } 
}

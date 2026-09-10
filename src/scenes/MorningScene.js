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
        const ROOM = { left: 96, right: 704, top: 64, bottom: 520 };
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 0; y < GAME_HEIGHT / 32; y++) {
                const px = x * 32 + 16;
                const py = y * 32 + 16;
                const inside = px > ROOM.left && px < ROOM.right && py > ROOM.top && py < ROOM.bottom;
                this.add.image(px, py, inside ? 'hotel_carpet' : 'hotel_wall');
            }
        }
        // Walls, so the room has edges to bump into.
        const walls = this.physics.add.staticGroup();
        for (let y = 0; y < GAME_HEIGHT; y += 32) {
            walls.create(ROOM.left - 16, y + 16, null).setSize(32, 32).setVisible(false);
            walls.create(ROOM.right + 16, y + 16, null).setSize(32, 32).setVisible(false);
        }
        for (let x = ROOM.left; x < ROOM.right; x += 32) {
            walls.create(x + 16, ROOM.top - 16, null).setSize(32, 32).setVisible(false);
            walls.create(x + 16, ROOM.bottom + 16, null).setSize(32, 32).setVisible(false);
        } this.add.image(400, 296, 'hotel_bed').setScale(1.3);
        this.add.image(190, 470, 'couch');

        // Along the right wall: desk, chair and the luggage rack.
        this.add.image(648, 250, 'hotel_desk');
        this.add.image(648, 296, 'desk_chair');
        this.add.image(650, 400, 'luggage_rack');
        this.add.image(660, 462, 'trash_bin').setScale(1.2);

        // Left wall: television on its credenza, an armchair and a lamp.
        this.add.image(170, 250, 'tv_unit');
        this.add.image(170, 232, 'tv').setScale(0.9);
        this.add.image(150, 370, 'armchair');
        this.add.image(196, 366, 'floor_lamp');
        this.add.image(140, 150, 'mini_fridge');

        // A second print and the aircon under the window.
        this.add.image(670, 82, 'ac_unit');
        this.add.image(190, 414, 'conf_table').setTint(0x7b6047).setScale(0.5);
        this.add.image(184, 408, 'coffee').setScale(0.7);
        this.add.image(636, 40, 'hotel_window_night'); this.add.image(268, 32, 'wall_art'); this.add.image(470, 32, 'wall_art'); 
        this.dresser = this.physics.add.staticImage(600, 100, 'dresser'); this.door = this.physics.add.staticImage(100, 100, 'door'); 
        this.add.image(336, 300, 'nightstand'); this.add.image(464, 300, 'nightstand'); this.add.image(336, 288, 'lamp').setScale(0.8); this.add.image(464, 288, 'lamp').setScale(0.8); this.add.text(150, 200, "Hotel Room", { fontSize: '12px', color: '#f2e8d5' }); this.phone = this.physics.add.staticImage(464, 318, 'hotel_phone'); this.player = new Player(this, 400, 430);
        this.physics.add.collider(this.player, walls); this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
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

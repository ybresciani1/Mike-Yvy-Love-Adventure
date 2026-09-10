import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class BarScene extends Phaser.Scene { 
    constructor() { super('BarScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#2c3e50'); 
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<6; y++) this.add.image(x*32+16, y*32+16, 'bar_wall');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=6; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_wood').setTint(0xa8907f); 
        
        for(let x=200; x<600; x+=64) {
            this.add.image(x+16, 60, 'bar_shelf');
            this.add.image(x+16, 100, 'bar_shelf');
        }

        const barGroup = this.physics.add.staticGroup(); 
        for(let x=200; x<=600; x+=32) {
            barGroup.create(x, 200, 'bar_counter');
        }
        for(let x=232; x<=568; x+=64) {
            this.add.image(x, 240, 'bar_stool');
        }
        // Backbar and room fittings.
        this.add.image(500, 175, 'bar_taps');
        this.add.image(120, 74, 'neon_sign');
        this.add.image(700, 70, 'dartboard');
        for (let x = 224; x <= 576; x += 88) this.add.image(x, 142, 'pendant_lamp');
        this.add.image(660, 150, 'plant_snake');
        this.add.image(70, 300, 'plant_fern');

        // Booths along the far wall, so the room isn't just a counter.
        [{ x: 690, y: 380 }, { x: 690, y: 480 }].forEach(p => {
            this.add.image(p.x, p.y, 'conf_table').setTint(0x4a3226).setScale(0.65);
            this.add.image(p.x - 42, p.y, 'bar_stool');
            this.add.image(p.x + 42, p.y, 'bar_stool');
            this.add.image(p.x, p.y - 6, 'beer').setScale(0.6);
        });
        [{ x: 150, y: 430 }, { x: 260, y: 500 }].forEach(p => {
            this.add.image(p.x, p.y, 'conf_table').setTint(0x4a3226).setScale(0.65);
            this.add.image(p.x - 42, p.y, 'bar_stool');
            this.add.image(p.x, p.y - 6, 'cocktail').setScale(0.6);
        });

        // Glassware left on the bar.
        this.add.image(250, 188, 'cocktail').setScale(0.7);
        this.add.image(300, 190, 'beer').setScale(0.7);
        this.add.image(560, 188, 'cocktail').setScale(0.7);

        this.add.sprite(400, 160, 'bartender');
        this.marine = this.physics.add.sprite(360, 230, 'marine'); 
        this.player = new Player(this, 280, 300); 
        this.physics.add.collider(this.player, barGroup); 
        this.pBeer = this.add.sprite(360, 300, 'beer').setScale(0.8).setVisible(false); 
        this.mBeer = this.add.sprite(410, 190, 'beer').setScale(0.8); 
        this.marineZone = this.add.rectangle(360, 250, 60, 60, 0xffffff, 0); 
        this.physics.add.existing(this.marineZone, true); 
        // Warm bar light over the whole room.
        this.add.rectangle(400, 300, 800, 600, 0xff9a3c, 0.05).setBlendMode(Phaser.BlendModes.ADD);
        this.cursors = this.input.keyboard.createCursorKeys(); 
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.add.text(20, 20, "Space: Drink with Marine", { fontSize: '16px', color: '#fff' }); 
        this.squad = this.add.group(); 
        this.physics.add.overlap(this.player, this.marineZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.handleDrinking(); }); 
    } 
    handleDrinking() { 
        if(gameState.drinksConsumed >= 8) return; 
        this.pBeer.setVisible(true); 
        this.pBeer.x = this.player.x + 10; 
        this.pBeer.y = this.player.y; 
        this.cameras.main.shake(300, 0.015); 
        this.tweens.add({ targets: this.cameras.main, rotation: (Math.random() - 0.5) * 0.1, duration: 300, yoyo: true, repeat: -1 }); 
        playSound('clink'); 
        gameState.drinksConsumed++; 
        // --- CHANGED: NC to DC ---
        if (gameState.drinksConsumed === 1) { showDialogue("Mike: 'Hi, I'm Mike from DC. Nice to meet you.'"); } 
        else if (gameState.drinksConsumed === 2) { showDialogue("Mike: 'I'm the CTO of Notion Theory, here for business.'"); } 
        else if (gameState.drinksConsumed === 3) { showDialogue("Marine: 'Oh, nice to meet you! I'm a Marine! Waiting for my buddies.'", () => { showDialogue("Marine: 'You own a company? That's FIRE 🔥. Let me buy you a drink.'"); }); } 
        else if (gameState.drinksConsumed === 4) { showDialogue("Mike: 'Thanks! Let me get the next round!'", () => { playSound('clink'); showDialogue("They cheer and clink glasses."); }); } 
        else if (gameState.drinksConsumed === 5) { 
            const m2 = this.physics.add.sprite(200, 600, 'marine'); 
            const m3 = this.physics.add.sprite(600, 600, 'marine'); 
            const b2 = this.add.sprite(210, 600, 'beer').setScale(0.8); 
            const b3 = this.add.sprite(610, 600, 'beer').setScale(0.8); 
            this.squad.add(m2); this.squad.add(m3); 
            this.tweens.add({ targets: [m2, m3, b2, b3], y: 320, duration: 1500, onComplete: () => { showDialogue("Marine: 'Boys! This is Mike, the CTO!'"); }}); 
        } 
        else if (gameState.drinksConsumed === 6) { showDialogue("Squad: 'Nice to meet you sir! ROUNDS ON US!'"); } 
        else if (gameState.drinksConsumed === 7) { showDialogue("The squad drinks heavily. 'Let's go meet some girls at the club!'"); } 
        else if (gameState.drinksConsumed === 8) { showDialogue("Mike: 'Yeaaah... *hic*... let'sh go meEEtttsh gurrlss *hic*...'", () => { this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => { if (progress === 1) this.scene.start('ClubScene'); }); }); } 
    } 
    update() { 
        this.player.update(this.cursors); 
        if (this.pBeer.visible) { this.pBeer.x = this.player.x + 10; this.pBeer.y = this.player.y; } 
        const touching = this.physics.overlap(this.player, this.marineZone); 
        document.getElementById('interaction-hint').style.display = touching ? 'block' : 'none'; 
    } 
}

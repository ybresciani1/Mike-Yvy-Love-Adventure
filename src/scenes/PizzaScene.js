import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { fadeOutMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class PizzaScene extends Phaser.Scene { 
    constructor() { super('PizzaScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#101010'); 
        playLeFestinTheme();
        for(let i=0; i<50; i++) { let x = Math.random() * 450; let y = Math.random() * 250; this.add.rectangle(x, y, 2, 2, 0xffffff, Math.random() * 0.8 + 0.2); }
        this.add.circle(100, 80, 40, 0xffffcc).setAlpha(0.9);
        for (let x=0; x<GAME_WIDTH/32; x++) { for (let y=0; y<GAME_HEIGHT/32; y++) { if (y < 10 && x < 15) continue; if (y >= 10 && y < 14) this.add.image(x*32+16, y*32+16, 'pavement'); else if (x >= 15 && y < 10) this.add.image(x*32+16, y*32+16, 'floor_tile'); else this.add.image(x*32+16, y*32+16, 'floor_tile').setTint(0x222222); } }
        this.add.rectangle(650, 150, 300, 200, 0xc62828); this.add.rectangle(650, 150, 280, 180, 0xffe0b2); this.add.text(560, 50, "PIZZA SHOP", { fontSize: '24px', fontWeight: 'bold' }); this.add.sprite(730, 60, 'pizza_logo'); this.add.rectangle(750, 150, 40, 150, 0x5d4037); this.add.rectangle(600, 200, 60, 60, 0x8d6e63); 
        [100, 300, 500].forEach(x => { this.add.image(x, 340, 'streetlight').setScale(2); this.add.circle(x+4, 348, 40, 0xffff00, 0.2); }); 
        this.shopZone = this.add.rectangle(600, 200, 100, 100, 0xffff00, 0); this.physics.add.existing(this.shopZone, true); 
        this.player = new Player(this, 100, 400); this.yvy = this.physics.add.sprite(150, 400, 'yvy'); 
        this.drunks = this.add.group(); let d1 = this.physics.add.sprite(350, 380, 'drunk'); d1.body.setImmovable(true); this.drunks.add(d1); let d2 = this.physics.add.sprite(450, 400, 'drunk'); d2.setFlipX(true); d2.body.setImmovable(true); this.drunks.add(d2);
        this.tweens.add({ targets: [d1, d2], x: '+=5', angle: { from: -5, to: 5 }, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.pSlice = this.add.sprite(0,0,'pizza_slice').setScale(0.7).setVisible(false); this.ySlice = this.add.sprite(0,0,'pizza_slice').setScale(0.7).setVisible(false); 
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.add.text(20, 20, "Go inside the Pizza Shop", { fontSize: '16px', color: '#fff' }); 
        this.physics.add.overlap(this.player, this.shopZone, () => { if (!gameState.farewellDone) this.startFarewell(); }); 
        this.physics.add.overlap(this.player, this.drunks, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) { 
            const lines = [
                "Drunk Guy: 'I love you man... you're my best friend... wait, who are you? Does not matter! I still love you man!'" ,
                "Drunk Guy: 'Is this the taco stand? No? It's pizza? Who puts pineapple on pizza anyway? Wait, do you guys have pineapple?'", 
                "Drunk Guy: 'Wheeeeere is the party?? I swear it was right here a minute ago. Did the party move? Or did I move?'", 
                "Drunk Guy: 'Nice shoes buddy. They look fast. I bet you can run really fast in those. Can I try them on? Just for a second?'"
            ]; 
            showDialogue(lines[Math.floor(Math.random() * lines.length)]); } 
        });
    } 
    update() { 
        this.player.update(this.cursors); 
        if (this.player.x > this.yvy.x + 50) this.yvy.body.setVelocityX(130); else if (this.player.x < this.yvy.x - 50) this.yvy.body.setVelocityX(-130); else this.yvy.body.setVelocityX(0); 
        if(this.player.y < this.yvy.y - 50) this.yvy.body.setVelocityY(-130); else if(this.player.y > this.yvy.y + 50) this.yvy.body.setVelocityY(130); else this.yvy.body.setVelocityY(0); 
        if (this.pSlice.visible) { this.pSlice.x = this.player.x + 10; this.pSlice.y = this.player.y; this.ySlice.x = this.yvy.x + 10; this.ySlice.y = this.yvy.y; } 
        document.getElementById('interaction-hint').style.display = this.physics.overlap(this.player, this.drunks) ? 'block' : 'none';
    } 
    startFarewell() { 
        gameState.farewellDone = true; this.pSlice.setVisible(true); this.ySlice.setVisible(true); this.player.body.stop(); this.yvy.body.stop(); 
        const convo = [ "Mike: 'This pizza looks amazing.'", "Yvy: 'Best in San Diego.'", "Mike: 'I... I have to go soon. Work early tomorrow.'", "Yvy: 'Aww. What time?'", "Mike: 'Need to be up by 4 AM.'", "Yvy: 'Tell you what. I'll give you a wake-up call at 4 AM.'", "Mike: 'Really? You'd do that?'", "Yvy: 'Promise. Bye Mike!'", "Mike: 'Bye Yvy!'" ]; 
        let i = 0; const next = () => { if(i<convo.length) showDialogue(convo[i++], next); else { fadeOutMusic(2); this.cameras.main.fade(2000, 0, 0, 0, false, (c,p) => { if(p===1) this.scene.start('MorningScene'); }); } }; next(); 
    } 
}

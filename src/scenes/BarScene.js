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
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=6; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_wood').setTint(0xc09a72); for(let x=200; x<600; x+=64) {
            this.add.image(x+16, 72, 'tequila_shelf');
            this.add.image(x+16, 112, (x / 64) % 2 ? 'bar_shelf' : 'tequila_shelf');
        }for (let x = 32; x < GAME_WIDTH; x += 64) this.add.image(x, 20, 'papel_picado');
        for (let x = 32; x < GAME_WIDTH; x += 64) { if (x < 240 || x > 560) this.add.image(x, 44, 'string_lights'); }
        this.add.text(400, 40, "THE CHINGÓN", {
            fontSize: '18px', color: '#f5b700', fontStyle: 'bold',
            shadow: { color: '#2b1a14', offsetX: 1, offsetY: 1, blur: 2, fill: true }
        }).setOrigin(0.5);
        for (let x = 200; x <= 600; x += 32) this.add.image(x, 150, 'talavera_tile').setTint(0xcfc4b0);

        const barGroup = this.physics.add.staticGroup(); for(let x=200; x<=600; x+=32) {
            barGroup.create(x, 200, 'bar_counter');
        }
        for(let x=232; x<=568; x+=64) {
            this.add.image(x, 240, 'bar_stool');
        }
        // Backbar and room fittings.
        this.add.image(500, 175, 'bar_taps');
        this.add.image(112, 96, 'neon_agave');
        this.add.image(700, 96, 'mural_panel');
        for (let x = 224; x <= 576; x += 88) this.add.image(x, 142, 'pendant_lamp');
        this.add.image(668, 210, 'agave_plant');
        this.add.image(70, 300, 'agave_plant');

        // Booths along the far wall, so the room isn't just a counter.
        const seatGuest = (x, y, female) => {
            const guest = this.add.sprite(x, y - 12, female ? 'civilian_f' : 'civilian');
            guest.setTint(Phaser.Display.Color.RandomRGB(120, 235).color);
            return guest;
        };
        [{ x: 690, y: 380 }, { x: 690, y: 480 }].forEach((p, i) => {
            this.add.image(p.x, p.y, 'conf_table').setTint(0x4a3226).setScale(0.65);
            seatGuest(p.x - 42, p.y, i % 2 === 0);
            seatGuest(p.x + 42, p.y, i % 2 === 1);
            this.add.image(p.x - 42, p.y, 'bar_stool');
            this.add.image(p.x + 42, p.y, 'bar_stool');
            this.add.image(p.x, p.y - 6, 'beer').setScale(0.6);
            this.add.image(p.x + 14, p.y - 4, 'margarita').setScale(0.55);
        });
        [{ x: 150, y: 430 }, { x: 260, y: 500 }].forEach((p, i) => {
            this.add.image(p.x, p.y, 'conf_table').setTint(0x4a3226).setScale(0.65);
            seatGuest(p.x - 42, p.y, i % 2 === 0);
            this.add.image(p.x - 42, p.y, 'bar_stool');
            this.add.image(p.x, p.y - 6, 'margarita').setScale(0.7);
        });
        // A couple more drinkers along the counter itself.
        [232, 552].forEach((x, i) => {
            seatGuest(x, 240, i === 0);
            this.add.image(x, 240, 'bar_stool');
            this.add.image(x + 10, 196, 'beer').setScale(0.7);
        });

        // Glassware left on the bar.
        this.add.image(250, 186, 'margarita').setScale(0.8);
        this.add.image(300, 190, 'beer').setScale(0.7);
        this.add.image(560, 186, 'margarita').setScale(0.8);

        this.add.sprite(400, 160, 'bartender');
        this.marine = this.physics.add.sprite(360, 230, 'marine'); 
        this.player = new Player(this, 280, 300); 
        this.physics.add.collider(this.player, barGroup); 
        this.pBeer = this.add.sprite(360, 300, 'beer').setScale(0.8).setVisible(false); 
        this.mBeer = this.add.sprite(410, 190, 'beer').setScale(0.8).setVisible(false);
        this.toastLift = 0; this.marineZone = this.add.rectangle(360, 250, 60, 60, 0xffffff, 0); 
        this.physics.add.existing(this.marineZone, true); 
        // Warm bar light over the whole room.
        this.add.rectangle(400, 300, 800, 600, 0xff9a3c, 0.05).setBlendMode(Phaser.BlendModes.ADD);
        this.cursors = this.input.keyboard.createCursorKeys(); 
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.add.text(20, 556, "Space: Drink with Marine", { fontSize: '16px', color: '#fff' }); 
        this.squad = this.add.group(); 
        this.physics.add.overlap(this.player, this.marineZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.handleDrinking(); }); 
    } 
    handleDrinking() { 
        if(gameState.drinksConsumed >= 8) return; 
        this.pBeer.setVisible(true);
        this.pBeer.x = this.player.x + 10;
        this.pBeer.y = this.player.y;
        this.mBeer.setVisible(true);
        this.mBeer.x = this.marine.x + 10;
        this.mBeer.y = this.marine.y;
        // Raising is done through an offset both glasses read in update(), since
        // update() rewrites their positions every frame and would undo a tween.
        this.tweens.addCounter({
            from: 0, to: 7, duration: 150, yoyo: true,
            onUpdate: t => { this.toastLift = t.getValue(); },
            onComplete: () => { this.toastLift = 0; }
        }); this.cameras.main.shake(300, 0.015); 
        this.tweens.add({ targets: this.cameras.main, rotation: (Math.random() - 0.5) * 0.1, duration: 300, yoyo: true, repeat: -1 }); 
        playSound('clink'); 
        gameState.drinksConsumed++; 
        // --- CHANGED: NC to DC ---
        if (gameState.drinksConsumed === 1) { showDialogue("Mike: 'Hi, I'm Mike from DC. Nice to meet you.'"); } 
        else if (gameState.drinksConsumed === 2) { showDialogue("Mike: 'I'm the CTO of Notion Theory, here for business.'"); } 
        else if (gameState.drinksConsumed === 3) { showDialogue("Marine: 'Oh, nice to meet you! I'm a Marine! Waiting for my buddies.'", () => { showDialogue("Marine: 'You own a company? That's FIRE 🔥. Let me buy you a drink.'"); }); } 
        else if (gameState.drinksConsumed === 4) { showDialogue("Mike: 'Thanks! Let me get the next round!'", () => { playSound('clink'); showDialogue("They cheer and clink glasses."); }); } 
        else if (gameState.drinksConsumed === 5) { 
            // They come in and take the free stools either side of him. Sitting is
            // read from the stool top overlapping their legs, so they settle just
            // above the seat and their beers land on the counter in front.
            [296, 424].forEach((seatX, i) => {
                const mate = this.physics.add.sprite(seatX, 620, 'marine');
                this.squad.add(mate);
                this.tweens.add({
                    targets: mate, y: 226, duration: 2600, delay: i * 450, ease: 'Sine.easeOut',
                    onComplete: () => {
                        // They arrive empty-handed and get served once they are on
                        // the stool: the bartender slides the glass down the bar.
                        const glass = this.add.sprite(400, 196, 'beer').setScale(0.8);
                        this.tweens.add({
                            targets: glass, x: seatX + 12, duration: 460, ease: 'Quad.easeOut',
                            onComplete: () => {
                                playSound('clink');
                                if (i === 1) showDialogue("Marine: 'Boys! This is Mike, the CTO!'");
                            }
                        });
                    }
                });
            }); 
        } 
        else if (gameState.drinksConsumed === 6) { showDialogue("Squad: 'Nice to meet you sir! ROUNDS ON US!'"); } 
        else if (gameState.drinksConsumed === 7) { showDialogue("The squad drinks heavily. 'Let's go meet some girls at the club!'"); } 
        else if (gameState.drinksConsumed === 8) { showDialogue("Mike: 'Yeaaah... *hic*... let'sh go meEEtttsh gurrlss *hic*...'", () => { this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => { if (progress === 1) this.scene.start('ClubScene'); }); }); } 
    } 
    update() { 
        this.player.update(this.cursors); 
        if (this.pBeer.visible) { this.pBeer.x = this.player.x + 10; this.pBeer.y = this.player.y - this.toastLift; }
        if (this.mBeer.visible) { this.mBeer.x = this.marine.x + 10; this.mBeer.y = this.marine.y - this.toastLift; } 
        const touching = this.physics.overlap(this.player, this.marineZone); 
        document.getElementById('interaction-hint').style.display = touching ? 'block' : 'none'; 
    } 
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class DowntownScene extends Phaser.Scene {
    constructor() { super('DowntownScene'); }
    preload() { this.load.image('penny_custom', REMOTE_IMAGES.penny); }
    create() {
        this.cameras.main.setBackgroundColor('#87CEEB'); 
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) { 
            if (y < 8) continue; 
            if (y > 14) this.add.image(x*32+16, y*32+16, 'pavement'); 
            else this.add.image(x*32+16, y*32+16, 'floor_tile').setTint(0xcccccc); 
        }
        this.add.circle(700, 80, 40, 0xffff00).setAlpha(0.8); 
        this.add.circle(700, 80, 60, 0xffff00, 0.2); 
        const clouds = this.add.group();
        for(let i=0; i<5; i++) {
            let c = this.add.ellipse(100 + i*150, 50 + Math.random()*50, 100, 40, 0xffffff, 0.8);
            this.tweens.add({targets: c, x: '+=100', duration: 10000 + Math.random()*5000, yoyo: true, repeat: -1});
        }
        this.add.text(400, 30, "Downtown San Diego", { fontSize: '24px', color: '#000', backgroundColor: '#fff' }).setOrigin(0.5);
        this.add.image(100, 290, 'shop_clothing'); this.add.text(80, 260, "Fashion", {fontSize: '12px', color: '#fff'});
        this.add.image(300, 290, 'shop_crystal'); this.add.text(280, 260, "Crystals", {fontSize: '12px', color: '#fff'});
        this.add.image(450, 290, 'shop_book'); this.add.text(420, 260, "Book Store", {fontSize: '12px', color: '#fff'});
        this.bookZone = this.add.rectangle(450, 330, 60, 40, 0xffff00, 0); this.physics.add.existing(this.bookZone, true);
        this.add.image(600, 290, 'donut_shop'); this.add.text(580, 260, "DONUT BAR", {fontSize: '14px', color: '#fff', backgroundColor: '#ec407a', padding: {x: 5, y: 2}});
        this.add.image(750, 290, 'graffiti_wall').setScale(0.8); 
        this.add.image(200, 500, 'park_bench');
        [50, 200, 400, 550].forEach(x => this.add.image(x, 310, 'bush_detailed'));
        this.add.image(180, 450, 'streetlight').setScale(1.5);
        this.add.image(700, 450, 'streetlight').setScale(1.5); 
        this.clothingZone = this.add.rectangle(100, 330, 60, 40, 0xffff00, 0); this.physics.add.existing(this.clothingZone, true);
        this.crystalZone = this.add.rectangle(300, 330, 60, 40, 0xffff00, 0); this.physics.add.existing(this.crystalZone, true);
        this.donutZone = this.add.rectangle(600, 330, 60, 40, 0xffff00, 0); this.physics.add.existing(this.donutZone, true);
        this.wallZone = this.add.rectangle(750, 330, 80, 60, 0xffff00, 0); this.physics.add.existing(this.wallZone, true); 
        this.benchZone = this.add.rectangle(200, 500, 80, 40, 0xffff00, 0); this.physics.add.existing(this.benchZone, true);
        this.add.rectangle(550, 500, 150, 100, 0x2e7d32); 
        this.add.image(500, 500, 'fence_detailed'); this.add.image(600, 500, 'fence_detailed');
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 50, 400); this.player.setTexture(outfit);
        this.yvy = this.physics.add.sprite(100, 400, 'yvy');
        this.stranger = this.physics.add.sprite(520, 500, 'civilian').setTint(0xaaaaaa);
        this.dog = this.add.sprite(550, 520, 'generic_dog');
        this.dogZone = this.add.rectangle(550, 520, 100, 80, 0xffff00, 0); this.physics.add.existing(this.dogZone, true);
        this.pDonut = this.add.sprite(0,0,'donut_chocolate').setVisible(false); this.yDonut = this.add.sprite(0,0,'donut_strawberry').setVisible(false);
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.stage = 0; 
        this.add.text(20, 560, "Task: Donut Bar → Donut wall → Puppy → Bench", { fontSize: '16px', color: '#000', backgroundColor: '#fff', fontStyle: 'bold' });
        this.physics.add.overlap(this.player, this.clothingZone, () => { if(Phaser.Input.Keyboard.JustDown(this.spaceKey)) showDialogue("Yvy: 'Ooh, cute top!'"); });
        this.physics.add.overlap(this.player, this.crystalZone, () => { if(Phaser.Input.Keyboard.JustDown(this.spaceKey)) showDialogue("Yvy: 'Good energy in there.'"); });
        this.physics.add.overlap(this.player, this.bookZone, () => { if(Phaser.Input.Keyboard.JustDown(this.spaceKey)) showDialogue("Mike: 'I love old book stores.'"); }); 
        this.physics.add.overlap(this.player, this.donutZone, () => { 
            if(this.stage === 0 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.stage = 1; showDialogue("Mike: 'Whoa, look at that line.'", () => { showDialogue("They wait patiently...", () => { showDialogue("Yvy: 'Strawberry and Cream for me!'", () => { showDialogue("Mike: 'Classic Chocolate for me.'", () => {
                    this.pDonut.setVisible(true); this.yDonut.setVisible(true); showDialogue("Mike: 'Cheers!' *Chomp*", () => { this.pDonut.setVisible(false); this.yDonut.setVisible(false); this.stage = 2; showDialogue("They ate the delicious donuts."); }); }); }); }); });
            }
        });
        this.physics.add.overlap(this.player, this.wallZone, () => { if(this.stage >= 2 && this.stage < 3 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) { this.stage = 3; playSound('select'); this.cameras.main.flash(200, 255, 255, 255); showDialogue("Mike: 'Smile!'", () => { showDialogue("They took a selfie at the famous Donut Wall."); }); } });
        this.physics.add.overlap(this.player, this.dogZone, () => { if(this.stage >= 3 && this.stage < 4 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) { this.stage = 4; showDialogue("Mike: 'Can we pet your dog?'", () => { showDialogue("Stranger: 'Sure! He's friendly.'", () => { showDialogue("Yvy: 'Who's a good boy!' *Pets dog*", () => { this.tweens.add({targets: this.dog, y: '-=5', duration: 100, yoyo: true, repeat: 3}); }); }); }); } });
        this.physics.add.overlap(this.player, this.benchZone, () => {
            if(this.stage >= 4 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.stage = 5; this.player.x = 180; this.player.y = 500; this.yvy.x = 220; this.yvy.y = 500; this.player.body.stop(); this.yvy.body.stop();
                showDialogue("They sat down to enjoy the morning sun.", () => { showDialogue("Mike: 'I really like San Diego. And I really like being with you.'", () => { showDialogue("Yvy: 'Me too. What do you want out of life, Mike?'", () => { showDialogue("Mike: 'To build cool things. And to be happy with someone special.'", () => { showDialogue("Yvy: 'I also want to create things.. Create a better future for our world, and meet someone who has a vision to do the same... Someone special too..'", () => {
                    const heart = this.add.text(this.player.x + 10, this.player.y - 40, '❤️', { fontSize: '24px' });
                    this.tweens.add({ targets: heart, y: this.player.y - 80, alpha: 0, duration: 2000 });
                    showDialogue("They sat in comfortable silence for a while.", () => { this.scene.start('TravelScene'); }); }); }); }); }); });
            }
        });
    }
    update() {
        this.player.update(this.cursors); const dist = Phaser.Math.Distance.Between(this.yvy.x, this.yvy.y, this.player.x, this.player.y); 
        if (dist > 60 && this.stage !== 5) this.physics.moveToObject(this.yvy, this.player, 120); else this.yvy.body.stop();
        if (this.pDonut.visible) { this.pDonut.x = this.player.x; this.pDonut.y = this.player.y - 10; }
        if (this.yDonut.visible) { this.yDonut.x = this.yvy.x; this.yDonut.y = this.yvy.y - 10; }
        document.getElementById('interaction-hint').style.display = this.physics.overlap(this.player, [this.clothingZone, this.crystalZone, this.donutZone, this.wallZone, this.dogZone, this.benchZone, this.bookZone]) ? 'block' : 'none';
    }
}

import Phaser from 'phaser';
import { GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playAirportTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { generateTextures } from '../textures/generateTextures.js';
import { Player } from '../entities/Player.js';

export class AirportScene extends Phaser.Scene {
    constructor() { super('AirportScene'); }
    preload() { generateTextures(this); }
    create() {
        playAirportTheme();
        document.getElementById('scrolling-banner').style.display = 'block';
        this.physics.world.setBounds(0, 0, 2400, 600);
        this.cameras.main.setBounds(0, 0, 2400, 600);
        for (let x=0; x<2400/32; x++) for (let y=0; y<600/32; y++) { this.add.image(x*32+16, y*32+16, 'floor_tile'); }
        const walls = this.physics.add.staticGroup();
        for(let y=0; y<GAME_HEIGHT; y+=32) { if(y < 250 || y > 350) walls.create(600, y+16, null).setSize(32,32).setVisible(false); }
        this.securityBarrier = this.physics.add.staticSprite(600, 300, null).setSize(32, 100).setVisible(false);
        this.gateVisual = this.add.rectangle(600, 300, 32, 100, 0xffff00, 0.18);
        this.tsa = this.physics.add.sprite(600, 260, 'tsa'); this.tsa.setImmovable(true);
        this.tsaZone = this.add.rectangle(580, 300, 50, 100, 0xffff00, 0); this.physics.add.existing(this.tsaZone, true);
        this.add.text(50, 50, "DEPARTURES", { fontSize: '24px', color: '#000', backgroundColor: '#fff' });
        this.add.image(200, 150, 'checkin_desk'); this.add.text(175, 120, "TICKETS", { fontSize: '12px', color: '#fff' });
        this.ticket = this.physics.add.sprite(200, 200, 'ticket');
        this.add.image(374, 150, 'checkin_desk'); this.add.image(430, 150, 'checkin_desk'); this.add.text(360, 120, "BAG CHECK-IN", { fontSize: '12px', color: '#fff' });
        this.suitcase = this.physics.add.sprite(400, 200, 'suitcase');
        this.walkways = this.add.group();
        for (let x = 800; x < 2000; x += 32) { let w = this.add.sprite(x, 300, 'walkway'); this.physics.add.existing(w, true); this.walkways.add(w); }
        [{x: 900, label: "GATE 10"}, {x: 1300, label: "GATE 11"}, {x: 1700, label: "GATE 12A"}, {x: 2200, label: "GATE 12B\n(TARGET)"}].forEach(g => {
            this.add.rectangle(g.x, 60, 60, 80, 0x555555); this.add.text(g.x-30, 80, g.label, { fontSize: '12px', color: '#fff', align: 'center' });
        });
        this.add.rectangle(1500, 50, 300, 100, 0x87ceeb); this.add.text(1500, 110, "OBSERVATION DECK", { fontSize: '12px', color: '#fff', backgroundColor: '#333' }).setOrigin(0.5);
        const planeMaskGraphics = this.make.graphics(); planeMaskGraphics.fillStyle(0xffffff); planeMaskGraphics.fillRect(1350, 0, 300, 100); const planeMask = planeMaskGraphics.createGeometryMask();
        this.time.addEvent({ delay: 2500, loop: true, callback: () => {
                if (!this.scene.isActive('AirportScene')) return;
                let startY = 10 + Math.random() * 80; let p = this.add.sprite(1350, startY, 'mini_plane'); p.setTint(0xdddddd); p.setMask(planeMask);
                if (Math.random() > 0.5) { p.x = 1650; p.setFlipX(true); this.tweens.add({ targets: p, x: 1350, y: startY + 30, duration: 4000, onComplete: () => p.destroy() }); } else { p.x = 1350; this.tweens.add({ targets: p, x: 1650, y: startY - 20, duration: 3500, onComplete: () => p.destroy() }); }
        }});
        this.add.image(1400, 50, 'large_window'); this.add.image(1500, 50, 'large_window'); this.add.image(1600, 50, 'large_window');
        this.viewingZone = this.add.rectangle(1500, 100, 300, 50, 0xffff00, 0); this.physics.add.existing(this.viewingZone, true);
        this.add.image(300, 40, 'poster'); this.add.image(700, 40, 'poster'); this.add.image(1100, 40, 'poster'); this.add.image(2000, 40, 'poster');
        this.add.image(330, 56, 'departure_board');
        this.add.image(600, 300, 'security_arch');
        [900, 1300, 1700, 2200].forEach(x => { this.add.image(x, 210, 'gate_seats'); this.add.image(x - 72, 210, 'gate_seats'); });
        [{x: 262, y: 470}, {x: 1150, y: 150}, {x: 2050, y: 455}].forEach(p => this.add.image(p.x, p.y, 'luggage_cart'));
        [480, 1010, 1460, 1760, 2150].forEach(x => this.add.image(x, 124, 'trash_bin'));
        this.decor = this.physics.add.staticGroup();
        const PLANTS = ['plant', 'plant_fern', 'plant_snake', 'plant_flowers'];
        [100, 550, 800, 1200, 1800, 2100].forEach((x, i) => this.decor.create(x, 100, PLANTS[i % PLANTS.length]));
        [550, 900, 1800].forEach((x, i) => this.decor.create(x, 500, PLANTS[(i + 2) % PLANTS.length]));
        this.add.image(1000, 500, 'store_news'); this.add.text(970, 450, "NEWS", {fontSize: '14px', color: '#000'});
        this.add.image(1300, 500, 'store_food'); this.add.text(1260, 450, "BURGER QUEEN", {fontSize: '14px', color: '#000'});
        this.add.image(1600, 494, 'restroom_door'); this.add.text(1570, 450, "RESTROOMS", {fontSize: '14px', color: '#000'});
        this.newsZone = this.add.rectangle(1000, 500, 100, 60, 0xffff00, 0); this.physics.add.existing(this.newsZone, true);
        this.burgerZone = this.add.rectangle(1300, 500, 100, 60, 0xffff00, 0); this.physics.add.existing(this.burgerZone, true);
        this.restroomZone = this.add.rectangle(1600, 500, 60, 60, 0xffff00, 0); this.physics.add.existing(this.restroomZone, true);
        this.starbucksZone = this.add.rectangle(1900, 500, 100, 60, 0x00704a).setAlpha(0); this.add.image(1900, 494, 'coffee_kiosk'); this.physics.add.existing(this.starbucksZone, true);
        this.add.text(1860, 450, "STARBUCKS", { fontSize: '14px', color: '#fff', backgroundColor: '#00704a' });
        this.add.sprite(1955, 522, 'server');
        this.gateZone = this.add.rectangle(2200, 150, 50, 100, 0x00ff00, 0.3); this.physics.add.existing(this.gateZone, true);
        for(let i=0; i<10; i++) { let npc = this.add.sprite(700 + Math.random()*1500, 200 + Math.random()*200, i % 2 ? 'civilian_f' : 'civilian'); npc.setTint(Math.random() * 0xffffff); }
        this.player = new Player(this, 100, 300);
        this.player.setDepth(5);
        this.pullAngle = Math.PI; // parked behind him until he first moves
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.physics.add.collider(this.player, walls); this.physics.add.collider(this.player, this.securityBarrier); this.physics.add.collider(this.player, this.tsa); this.physics.add.collider(this.player, this.decor);
        this.heldSuitcase = this.add.sprite(0, 0, 'suitcase').setVisible(false);
        this.heldTicket = this.add.sprite(0, 0, 'ticket').setScale(0.5).setVisible(false);
        this.heldCoffee = this.add.sprite(0, 0, 'coffee').setScale(0.5).setVisible(false);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.add.text(20, 550, "Task: Ticket -> Suitcase -> Security -> Starbucks -> Gate 12B", { fontSize: '14px', color: '#000', backgroundColor: '#fff' }).setScrollFactor(0);
        this.physics.add.overlap(this.player, this.suitcase, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy() && !gameState.hasSuitcase) { gameState.hasSuitcase = true; this.suitcase.destroy(); this.heldSuitcase.setVisible(true); playSound('select'); showDialogue("Mike grabbed his suitcase."); } });
        this.physics.add.overlap(this.player, this.ticket, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy() && !gameState.hasTicket) { gameState.hasTicket = true; this.ticket.destroy(); this.heldTicket.setVisible(true); playSound('select'); showDialogue("Mike found the Boarding Pass."); } });
        this.physics.add.overlap(this.player, this.tsaZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { if (gameState.hasSuitcase && gameState.hasTicket) { if (!gameState.securityCleared) { gameState.securityCleared = true; showDialogue("TSA: 'You're clear. Have a safe flight.'"); this.securityBarrier.destroy(); this.gateVisual.fillColor = 0x00ff00; } } else { showDialogue("TSA: 'Ticket and luggage required.'"); } } });
        this.physics.add.overlap(this.player, this.starbucksZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { if (gameState.securityCleared) { if (!gameState.hasCoffee) { gameState.hasCoffee = true; this.heldCoffee.setVisible(true); playSound('select'); showDialogue("Mike bought a coffee. Essential fuel."); } } else { showDialogue("Security won't let you through yet."); } } });
        this.physics.add.overlap(this.player, this.gateZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { if (gameState.securityCleared && gameState.hasCoffee) { showDialogue("Boarding Flight...", () => { stopMusic(); document.getElementById('scrolling-banner').style.display = 'none'; this.scene.start('FlightScene'); }); } else if (!gameState.hasCoffee) showDialogue("Mike needs a coffee before boarding."); else showDialogue("Security Check Required."); } });
        this.physics.add.overlap(this.player, this.newsZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Mike browsed the tech magazines."); });
        this.physics.add.overlap(this.player, this.burgerZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Smells greasy... Mike isn't hungry right now."); });
        this.physics.add.overlap(this.player, this.restroomZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Mike checked his hair in the mirror. Still looks good."); });
        this.physics.add.overlap(this.player, this.viewingZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Mike spent a moment watching the planes take off and land."); });
        this.physics.add.overlap(this.player, this.walkways, () => { this.player.x += 2; });
    }    /**
     * Wheel the case along behind him: it trails whichever way he is walking,
     * eases into place rather than snapping, leans on its wheels, jostles while
     * rolling, and passes behind him when he walks towards the camera.
     */
    rollSuitcase() {
        const bag = this.heldSuitcase;
        const body = this.player.body;
        const moving = body.speed > 5;
        if (moving) this.pullAngle = Math.atan2(body.velocity.y, body.velocity.x);

        const TRAIL = 15;
        const targetX = this.player.x - Math.cos(this.pullAngle) * TRAIL;
        const targetY = this.player.y - Math.sin(this.pullAngle) * TRAIL + 6;

        if (!bag.visible) {
            // Place it rather than letting it fly in from the origin.
            bag.setPosition(targetX, targetY).setVisible(true);
        }

        const jostle = moving ? Math.sin(this.time.now / 45) * 1.2 : 0;
        bag.x = Phaser.Math.Linear(bag.x, targetX, 0.2);
        bag.y = Phaser.Math.Linear(bag.y, targetY + jostle, 0.2);

        // Tipped back on its wheels, leaning the way it is being pulled.
        const lean = Phaser.Math.Clamp((this.player.x - bag.x) / TRAIL, -1, 1);
        bag.rotation = Phaser.Math.Linear(bag.rotation, lean * 0.45, 0.15);

        bag.setDepth(bag.y < this.player.y ? 4 : 6);
    }

    update() { 
        this.player.update(this.cursors); 
        if (gameState.hasSuitcase) this.rollSuitcase(); 
        if (gameState.hasTicket) { this.heldTicket.x = this.player.x + 12; this.heldTicket.y = this.player.y + 5; this.heldTicket.setVisible(true); } 
        if (gameState.hasCoffee) { this.heldCoffee.x = this.player.x + 8; this.heldCoffee.y = this.player.y - 5; this.heldCoffee.setVisible(true); } 
        const touching = this.physics.overlap(this.player, [this.suitcase, this.ticket, this.tsaZone, this.gateZone, this.starbucksZone, this.newsZone, this.burgerZone, this.restroomZone, this.viewingZone]); 
        document.getElementById('interaction-hint').style.display = touching ? 'block' : 'none'; 
    }
}

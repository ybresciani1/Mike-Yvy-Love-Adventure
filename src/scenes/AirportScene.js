import Phaser from 'phaser';
import { GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playAirportTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { generateTextures } from '../textures/generateTextures.js';
import { Player } from '../entities/Player.js';

const WHEELED_LINES = [
    "Passenger: 'Forty minutes to the gate. I looked it up. Forty.'",
    "Passenger: 'If this thing loses a wheel I am leaving it right here.'",
    "Passenger: 'Do not make eye contact with the man at gate eleven.'",
    "Late Passenger: 'MOVE — sorry — MOVE —'"
];

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
        this.deskAgents = [this.add.sprite(200, 126, 'airline_agent'), this.add.sprite(402, 126, 'airline_agent')];
        this.deskAgents.forEach((a, i) => this.tweens.add({
            targets: a, y: 124, duration: 1500 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        }));
        this.add.image(200, 150, 'checkin_desk'); this.add.text(175, 120, "TICKETS", { fontSize: '12px', color: '#fff' });
        this.ticket = this.physics.add.sprite(200, 200, 'ticket');
        this.add.image(374, 150, 'checkin_desk'); this.add.image(430, 150, 'checkin_desk'); this.add.text(360, 120, "BAG CHECK-IN", { fontSize: '12px', color: '#fff' });
        this.add.image(275, 150, 'luggage_cart'); // the belt end of the bag drop
        this.suitcase = this.physics.add.sprite(400, 200, 'suitcase');
        this.walkways = this.add.group();
        for (let x = 800; x < 2000; x += 32) { let w = this.add.sprite(x, 300, 'walkway'); this.physics.add.existing(w, true); this.walkways.add(w); }
        [{x: 900, label: "GATE 10"}, {x: 1300, label: "GATE 11"}, {x: 1700, label: "GATE 12A"}, {x: 2200, label: "GATE 12B\n(TARGET)"}].forEach(g => {
            this.add.rectangle(g.x, 60, 60, 80, 0x555555); this.add.text(g.x-30, 80, g.label, { fontSize: '12px', color: '#fff', align: 'center' });
        });
        this.gateDesks = [];
        [
            [900, 0xb07a8c, gate => this.gateTen(gate)],
            [1300, 0x7a9cb0, gate => this.gateEleven(gate)],
            [1700, 0xa08cb4, gate => this.gateTwelveA(gate)]
        ].forEach(([gx, tint, talk]) => {
            this.add.image(gx + 44, 146, 'host_stand'); // the podium doubles nicely as a gate desk
            const agent = this.add.sprite(gx + 44, 122, 'airline_agent').setTint(tint);
            this.tweens.add({ targets: agent, y: 120, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            const zone = this.add.rectangle(gx + 20, 140, 130, 90, 0xffff00, 0);
            this.physics.add.existing(zone, true);
            zone.setData('talk', talk);
            this.gateDesks.push(zone);
        });

        // 12B is his own gate, so it gets a desk too. It sits off to the side of
        // the boarding zone rather than in front of it — an interaction zone
        // across the gate mouth would answer instead of the gate itself.
        this.add.image(2280, 146, 'host_stand');
        const boardingAgent = this.add.sprite(2280, 122, 'airline_agent').setTint(0x9cb0a0);
        this.tweens.add({ targets: boardingAgent, y: 120, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        const boardingDesk = this.add.rectangle(2280, 140, 84, 90, 0xffff00, 0);
        this.physics.add.existing(boardingDesk, true);
        boardingDesk.setData('talk', zone => this.gateTwelveB(zone));
        this.gateDesks.push(boardingDesk);
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
        // Each passenger is a plain sprite plus an invisible zone, the way every
        // other interaction in the game works. Sizing the body on a static group
        // member does not move it to match, so every passenger answered with the
        // same line no matter which one you walked up to.
        // Where a seated body goes. The seated sprites are 32x38 with the hips on
        // row 26, so the hip line sits at SEAT_Y + 7; the cushion's top surface
        // is at 209. Seated bodies are drawn in FRONT of the seat cushion, not
        // behind it — the pose is what says they are sitting, so the thighs and
        // shins are meant to be seen.
        const SEAT_Y = 202;
        this.peopleZones = [];
        const addPerson = (x, y, key, tint, line, zoneH = 44, zoneW = 46) => {
            const person = this.add.sprite(x, y, key).setTint(tint);
            const zone = this.add.rectangle(x, y + 14, zoneW, zoneH, 0xffff00, 0);
            this.physics.add.existing(zone, true);
            zone.setData('line', line);
            this.peopleZones.push(zone);
            return person;
        };
        // Seated: high enough that the seat back crosses their lap rather than
        // swallowing them whole — the seats are only 24px tall.
        const seatPassenger = (x, key, tint, line) => {
            const p = addPerson(x, SEAT_Y, key + '_sit', tint, line, 48, 20).setDepth(3);
            this.tweens.add({
                targets: p, y: SEAT_Y - 1, duration: 1800 + (x % 700),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
            return p;
        };
        seatPassenger(836, 'civilian', 0x8c7ab0, "Passenger: 'Zzz... no, I said the aisle... the aisle... zzz.'");
        seatPassenger(908, 'civilian_f', 0xb07a8c, "Passenger: 'No Mom, I already ate. Mom. MOM. I already ate.'");
        seatPassenger(1236, 'civilian', 0x7a9cb0, "Nervous Flyer: 'It's safer than driving. Statistically. Statistically.'");
        seatPassenger(1308, 'civilian_f', 0xb0a07a, "Passenger: 'Same book since March. Still on chapter two.'");
        seatPassenger(1636, 'marine', 0xffffff, "Marine: 'Heading back to Pendleton. You?'");
        seatPassenger(1708, 'civilian', 0xa08cb4, "Passenger: 'Gate changed three times. THREE.'");
        seatPassenger(2098, 'civilian_f', 0x8ca0b4, "Passenger: 'You're on 12B too? Good. I thought I was in the wrong place.'");
        // The seats sit above everyone on them, so a body at the seated height has
        // its lap crossed by the seat back instead of standing on top of it.
        // 12B's row is pulled back up the concourse — it used to sit directly
        // across the mouth of the gate you are trying to walk into.
        this.seatZones = [];
        [900, 1300, 1700, 2090].forEach(x => {
            [x, x - 72].forEach(bx => {
                this.add.image(bx, 201, 'gate_seats_back').setDepth(0);
                this.add.image(bx, 216, 'gate_seats_front').setDepth(2);
                // The far-left chair of the bench, centred on it, not between two.
                const spot = this.add.rectangle(bx - 24, 210, 20, 54, 0xffff00, 0);
                this.physics.add.existing(spot, true);
                spot.setData('seat', { x: bx - 24, y: SEAT_Y });
                this.seatZones.push(spot);
            });
        });
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
        [
            [1010, 452, 'civilian', 0x8c9cb0, "Passenger: 'They still print these? Who is buying these?'"],
            [1306, 452, 'civilian_f', 0xb09c8c, "Passenger: 'Six dollars. For a hash brown. Six.'"],
            [1560, 450, 'civilian', 0xa0b08c, "Passenger: 'Is this the line? Is anyone in this line?'"],
            [1862, 520, 'civilian_f', 0x8cb0a0, "Passenger: 'Venti. No — grande. No. Venti. Sorry.'"],
            [1190, 336, 'civilian', 0xb08ca0, "Passenger: 'Do you know if this one has power outlets?'"],
            [760, 372, 'civilian_f', 0x9c8cb0, "Passenger: 'I have been at this airport since Tuesday.'"],
            [2040, 360, 'civilian', 0x8cb0b0, "Passenger: 'Whatever you do, do not check a bag today.'"]        ].forEach(([px, py, key, tint, line]) => {
            const person = addPerson(px, py, key, tint, line);
            this.tweens.add({
                targets: person, y: py - 2, duration: 1200 + (px % 500),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        });

        // Two lines, one for each counter. Everybody in the bag line has a case
        // at their feet; the ticket line does not, because they have not dropped
        // anything yet — that is the whole reason they are in the other queue.
        const queuePerson = (x, y, key, tint, line, withBag) => {
            const person = addPerson(x, y, key, tint, line);
            if (withBag) {
                const bag = this.add.sprite(x - 13, y + 9, 'suitcase').setScale(0.85);
                this.tweens.add({ targets: bag, y: y + 8, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            }
            this.tweens.add({
                targets: person, y: y - 3, duration: 1300 + (x % 400),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
            return person;
        };
        [
            [148, 212, 'civilian', 0x8c9cb0, "Passenger: 'Is this the line for tickets? I have asked four people.'", false],
            [144, 250, 'civilian_f', 0xb09c8c, "Passenger: 'I printed it at home and the machine still would not take it.'", false],
            [152, 288, 'civilian', 0xa0b08c, "Passenger: 'Window seat. Window seat. I am not asking for much.'", false],
            [404, 238, 'civilian_f', 0x8cb0a0, "Passenger: 'Fifty-one pounds. FIFTY-ONE. I have to open it right here.'", true],
            [398, 276, 'civilian', 0xb08ca0, "Passenger: 'One bag each. That is what it said. One bag each.'", true],
            [408, 314, 'civilian_f', 0x9c8cb0, "Passenger: 'If they lose this one again I am going to lie down on the belt.'", true]
        ].forEach(([qx, qy, key, tint, line, bag]) => queuePerson(qx, qy, key, tint, line, bag));        // Wheeled luggage, going somewhere. The bag is placed each frame rather
        // than tweened, because it has to swap to the other side when they turn.
        this.wanderers = [];
        [
            [760, 2000, 372, 'civilian', 0x8c9cb0, 26000],
            [2020, 900, 420, 'civilian_f', 0xb0a08c, 31000],
            [860, 1900, 462, 'civilian', 0xa08cb4, 23000]
        ].forEach(([x0, x1, wy, key, tint, dur]) => {
            const sprite = this.add.sprite(x0, wy, key).setTint(tint);
            const bag = this.add.sprite(x0 - 14, wy + 8, 'suitcase').setScale(0.85);
            this.tweens.add({ targets: sprite, x: x1, duration: dur, yoyo: true, repeat: -1, ease: 'Linear' });
            this.tweens.add({ targets: sprite, y: wy - 2, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.wanderers.push({ sprite, bag, lastX: x0, line: WHEELED_LINES[this.wanderers.length % WHEELED_LINES.length] });
        });

        // One man who is going to miss it, sprinting the length of the terminal
        // and then trudging back to do it again.
        this.time.delayedCall(6000, () => this.sendTheLateRunner());

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
        this.peopleZones.forEach(zone => this.physics.add.overlap(this.player, zone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue(zone.getData('line'));
        }));
        this.seated = null;
        this.seatZones.forEach(spot => this.physics.add.overlap(this.player, spot, () => {
            if (!Phaser.Input.Keyboard.JustDown(this.spaceKey) || dialogueBusy()) return;
            if (this.seated) this.standUp(); else this.sitDown(spot.getData('seat'));
        }));
        this.gateDesks.forEach(zone => this.physics.add.overlap(this.player, zone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) zone.getData('talk')(zone);
        }));
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
    }    /**
     * One man who is going to miss his flight, once. He comes past from behind
     * whichever bit of the terminal Mike is standing in, runs the length of it
     * and is gone — looping him meant he snapped back to the same spot every
     * few seconds, which reads as a glitch rather than as a man in trouble.
     *
     * Nobody gets to skip the checkpoint, including him. If he starts out on
     * the landside he has to stop, put the bag through and wait to be waved on,
     * jogging on the spot the whole time. If Mike is already deep in the
     * concourse the runner starts past it and simply keeps going.
     */
    sendTheLateRunner() {
        const startX = Math.max(-40, this.player.x - 460);
        const runner = this.add.sprite(startX, 340, 'civilian').setTint(0xd48c8c);
        const bag = this.add.sprite(startX - 14, 348, 'suitcase').setScale(0.85);
        const cry = this.add.text(startX, 312, "WAIT!", {
            fontSize: '11px', color: '#c0392b', fontStyle: 'bold'
        }).setOrigin(0.5);
        const flicker = this.tweens.add({ targets: cry, alpha: 0.25, duration: 420, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: runner, y: 330, duration: 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: runner, angle: { from: -9, to: -3 }, duration: 240, yoyo: true, repeat: -1 });

        const entry = { sprite: runner, bag, lastX: startX, cry, bagLift: 0, line: WHEELED_LINES[3] };
        this.wanderers.push(entry);

        const SPEED = 0.3; // px per ms, so the run reads the same length whatever the distance
        const runTo = (toX, onDone) => this.tweens.add({
            targets: runner, x: toX, duration: Math.abs(toX - runner.x) / SPEED, ease: 'Linear', onComplete: onDone
        });
        const leave = () => runTo(2470, () => {
            this.wanderers.splice(this.wanderers.indexOf(entry), 1);
            this.tweens.killTweensOf(runner);
            this.tweens.killTweensOf(cry);
            this.tweens.killTweensOf(entry);
            [runner, bag, cry].forEach(o => o.destroy());
        });

        if (startX > 520) return leave(); // already through, nothing to queue for
        runTo(548, () => {
            cry.setText("ONE SECOND!");
            flicker.restart();
            playSound('select');
            // The bag goes up onto the belt. It has to be lifted through the
            // entry, because update() rewrites the bag's position every frame
            // from its owner's and would flatten a tween on the sprite itself.
            this.tweens.add({
                targets: entry, bagLift: 16, duration: 320, yoyo: true, repeat: 1, ease: 'Sine.easeInOut'
            });
            const scan = this.add.rectangle(600, 300, 30, 96, 0x9fe8ff, 0.5);
            this.tweens.add({ targets: scan, alpha: 0, duration: 420, yoyo: true, repeat: 1, onComplete: () => scan.destroy() });
            this.time.delayedCall(1800, () => {
                cry.setText("WAIT!");
                playSound('select');
                leave();
            });
        });
    }

    /**
     * Mike drops into the seat: he slides across to it, settles with a squash on
     * landing, and then just breathes. Depth 1 puts him under the seat backs, so
     * the chair crosses his lap the same way it does for everyone else in the row.
     *
     * The slide has to be driven through body.reset() rather than by tweening
     * x/y. He is an arcade-physics sprite, and the body writes its own position
     * back onto the sprite every step, so a plain positional tween is silently
     * undone — he sat down without ever moving. Disabling the body instead would
     * work, but then the seat's overlap stops firing and he can never stand up.
     */
    sitDown(spot) {
        this.seated = spot;
        this.player.isLocked = true;
        this.player.body.stop();
        this.standingTexture = this.player.texture.key;
        this.player.setTexture(this.standingTexture + '_sit');
        this.player.setDepth(3); // in front of the cushion, so his legs show
        const fromX = this.player.x, fromY = this.player.y;
        this.tweens.addCounter({
            from: 0, to: 1, duration: 340, ease: 'Sine.easeOut',
            onUpdate: tween => {
                const k = tween.getValue();
                this.player.body.reset(
                    Phaser.Math.Linear(fromX, spot.x, k),
                    Phaser.Math.Linear(fromY, spot.y, k)
                );
            }
        });
        // Scale is safe to tween — the body never touches it.
        this.tweens.add({
            targets: this.player, scaleY: 0.86, duration: 170, delay: 180, yoyo: true, ease: 'Quad.easeOut',
            onComplete: () => {
                if (!this.seated) return;
                this.seatBreath = this.tweens.add({
                    targets: this.player, scaleY: 0.97, duration: 1900,
                    yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                });
            }
        });
    }

    standUp() {
        const spot = this.seated;
        this.seated = null;
        if (this.seatBreath) { this.seatBreath.remove(); this.seatBreath = null; }
        this.tweens.killTweensOf(this.player);
        this.player.setScale(1);
        const fromY = this.player.y, toY = spot.y + 46;
        this.tweens.addCounter({
            from: 0, to: 1, duration: 300, ease: 'Sine.easeOut',
            onUpdate: tween => this.player.body.reset(spot.x, Phaser.Math.Linear(fromY, toY, tween.getValue())),
            onComplete: () => {
                this.player.setTexture(this.standingTexture);
                this.player.setDepth(5);
                this.player.isLocked = false;
            }
        });
    }

    /**
     * The one gate that is actually his. She answers differently depending on
     * how far along he is, so the desk doubles as a reminder of what is left to
     * do rather than repeating one line at him.
     */
    gateTwelveB(zone) {
        if (!gameState.securityCleared) {
            showDialogue("Gate Agent: 'Flight 214 to San Diego, that's us. Yes.'", () => {
                showDialogue("Gate Agent: 'You'll want to clear security first, though. Back that way.'");
            });
            return;
        }
        if (!gameState.hasCoffee) {
            showDialogue("Gate Agent: 'We're not boarding for a few minutes yet.'", () => {
                showDialogue("Gate Agent: 'Go get a coffee. It's a five hour flight and you look like you need one.'");
            });
            return;
        }
        showDialogue("Gate Agent: 'Flight 214 to San Diego. Boarding whenever you're ready.'", () => {
            showDialogue("Mike: 'Going back, actually. I used to live out there.'", () => {
                showDialogue("Gate Agent: 'Ah, a homecoming. Business or pleasure?'", () => {
                    showDialogue("Mike: 'Work meeting. Pleasure if I'm lucky.'", () => {
                        zone.setData('talk', () => showDialogue("Gate Agent: 'Still boarding. Any time you like.'"));
                    });
                });
            });
        });
    }

    gateTen(zone) {
        showDialogue("Gate Agent: 'Ten is boarding for Phoenix. Are you Phoenix?'", () => {
            showDialogue("Mike: 'San Diego.'", () => {
                showDialogue("Gate Agent: 'Then keep walking. All the way down. 12B.'", () => {
                    zone.setData('talk', () => showDialogue("Gate Agent: 'Still Phoenix. Still not you.'"));
                });
            });
        });
    }

    gateEleven(zone) {
        showDialogue("Gate Agent: 'Eleven is delayed two hours.'", () => {
            showDialogue("Mike: 'Any idea why?'", () => {
                showDialogue("Gate Agent: 'None whatsoever. I only work here.'", () => {
                    zone.setData('talk', () => showDialogue("Gate Agent: 'Three hours now. Do not ask.'"));
                });
            });
        });
    }

    gateTwelveA(zone) {
        showDialogue("Gate Agent: 'This is 12A. You want 12B?'", () => {
            showDialogue("Mike: 'I was about to sit down here.'", () => {
                showDialogue("Gate Agent: 'Everybody is about to sit down here. One more gate.'", () => {
                    zone.setData('talk', () => showDialogue("Gate Agent: 'Still A. Still not B. Off you go.'"));
                });
            });
        });
    }

    update() { 
        this.player.update(this.cursors);        this.wanderers.forEach(w => {
            const dir = w.sprite.x >= w.lastX ? -1 : 1; // the case trails whichever way they are going
            if (Math.abs(w.sprite.x - w.lastX) > 0.05) w.sprite.setFlipX(dir === 1);
            w.lastX = w.sprite.x;
            w.bag.x = Phaser.Math.Linear(w.bag.x, w.sprite.x + dir * 14, 0.25);
            w.bag.y = w.sprite.y + 9 + Math.sin(this.time.now / 50) * 1.1 - (w.bagLift || 0);
            if (w.cry) { w.cry.x = w.sprite.x; w.cry.y = w.sprite.y - 28; }
        });
        if (gameState.hasSuitcase) this.rollSuitcase(); 
        if (gameState.hasTicket) { this.heldTicket.x = this.player.x + 12; this.heldTicket.y = this.player.y + 5; this.heldTicket.setVisible(true); } 
        if (gameState.hasCoffee) { this.heldCoffee.x = this.player.x + 8; this.heldCoffee.y = this.player.y - 5; this.heldCoffee.setVisible(true); } 
        const touching = this.physics.overlap(this.player, [this.suitcase, this.ticket, this.tsaZone, this.gateZone, this.starbucksZone, this.newsZone, this.burgerZone, this.restroomZone, this.viewingZone, ...this.gateDesks, ...this.peopleZones, ...this.seatZones]); 
        // The wheeled-bag passengers are moving targets, so they are caught by
        // distance rather than by a zone. Scene update runs before the physics
        // step, so this only claims the keypress when nothing stationary wants
        // it — otherwise a zone behind a passing traveller would never fire.
        const nearby = !touching && this.wanderers.find(w =>
            w.sprite.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, w.sprite.x, w.sprite.y) < 38
        );
        if (nearby && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) {
            showDialogue(nearby.line);
        }
        document.getElementById('interaction-hint').style.display = (touching || nearby) ? 'block' : 'none'; 
    }
}

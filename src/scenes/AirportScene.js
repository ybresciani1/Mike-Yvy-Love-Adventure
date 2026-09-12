import Phaser from 'phaser';
import { GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playAirportTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { takePhoto } from '../ui/scrapbook.js';
import { generateTextures } from '../textures/generateTextures.js';
import { Player } from '../entities/Player.js';

// Nobody in a departure hall has the same case as anybody else. Mike's is the
// plain grey one; these are everyone else's.
const BAG_COLOURS = [
    0x4f86c6, // navy
    0xc0655e, // oxblood
    0x5e9e74, // green
    0xc6a24f, // mustard
    0x8a6bb0, // plum
    0x4fa39e, // teal
    0xb06a8c  // rose
];

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
        this.bagColour = 0;
        // He has his case from the first frame. There is nothing to check and
        // nothing to find on the floor of a departure hall.
        gameState.hasSuitcase = true;
        document.getElementById('scrolling-banner').style.display = 'block';
        this.physics.world.setBounds(0, 0, 2400, 600);
        this.cameras.main.setBounds(0, 0, 2400, 600);
        for (let x=0; x<2400/32; x++) for (let y=0; y<600/32; y++) { this.add.image(x*32+16, y*32+16, 'floor_tile'); }
        const walls = this.physics.add.staticGroup();
        this.add.text(50, 50, "DEPARTURES", { fontSize: '24px', color: '#000', backgroundColor: '#fff' });
        this.deskAgents = [this.add.sprite(200, 126, 'airline_agent'), this.add.sprite(402, 126, 'airline_agent')];
        this.deskAgents.forEach((a, i) => this.tweens.add({
            targets: a, y: 124, duration: 1500 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        }));
        this.add.image(200, 150, 'checkin_desk'); this.add.text(175, 120, "TICKETS", { fontSize: '12px', color: '#fff' });
        this.add.image(374, 150, 'checkin_desk'); this.add.image(430, 150, 'checkin_desk'); this.add.text(360, 120, "BAG CHECK-IN", { fontSize: '12px', color: '#fff' });
        this.add.image(275, 150, 'luggage_cart'); // the belt end of the bag drop
        // The two behind the counters were scenery. Both of them have had a
        // morning. The zones stop short of the ticket and the case on the floor
        // below them, so the pickup and the conversation do not fight over the
        // same keypress.
        this.deskZones = [];
        [
            [200, 134, z => this.ticketAgent(z)],
            [402, 134, z => this.bagAgent(z)]
        ].forEach(([dx, dy, talk]) => {
            const z = this.add.rectangle(dx, dy, 130, 62, 0xffff00, 0);
            this.physics.add.existing(z, true);
            z.setData('talk', talk);
            this.deskZones.push(z);
        });
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
            [820, 372, 'civilian_f', 0x9c8cb0, "Passenger: 'I have been at this airport since Tuesday.'"],
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
                const bag = this.add.sprite(x - 13, y + 9, 'suitcase').setScale(0.85).setTint(this.nextBagColour());
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
            [404, 238, 'civilian_f', 0x8cb0a0, "Passenger: 'Fifty-one pounds. FIFTY-ONE. I have to open it right here.'", true]
        ].forEach(([qx, qy, key, tint, line, bag]) => queuePerson(qx, qy, key, tint, line, bag));

        this.buildSecurity(walls, queuePerson);
        // Wheeled luggage, going somewhere. The bag is placed each frame rather
        // than tweened, because it has to swap to the other side when they turn.
        this.wanderers = [];
        [
            [820, 2000, 372, 'civilian', 0x8c9cb0, 26000],
            [2020, 900, 420, 'civilian_f', 0xb0a08c, 31000],
            [860, 1900, 462, 'civilian', 0xa08cb4, 23000]
        ].forEach(([x0, x1, wy, key, tint, dur]) => {
            const sprite = this.add.sprite(x0, wy, key).setTint(tint);
            const bag = this.add.sprite(x0 - 14, wy + 8, 'suitcase').setScale(0.85).setTint(this.nextBagColour());
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
        this.physics.add.collider(this.player, walls); this.physics.add.collider(this.player, this.securityBarrier); this.physics.add.collider(this.player, this.tsa); this.physics.add.collider(this.player, this.decor); this.laneBarriers.forEach(b => this.physics.add.collider(this.player, b));
        // His is the grey one. The shell is drawn pale so colours tint cleanly,
        // and pale grey on a pale terminal floor disappears -- so his gets a grey
        // tint of its own rather than going bare.
        this.heldSuitcase = this.add.sprite(0, 0, 'suitcase').setVisible(false).setTint(0x8f979d);
        this.heldTicket = this.add.sprite(0, 0, 'ticket').setScale(0.5).setVisible(false);
        this.heldCoffee = this.add.sprite(0, 0, 'coffee').setScale(0.5).setVisible(false);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.add.text(20, 550, "Task: Ticket -> Bag scan -> Body scan -> Collect bag -> Coffee -> Gate 12B", { fontSize: '14px', color: '#000', backgroundColor: '#fff' }).setScrollFactor(0);
        this.peopleZones.forEach(zone => this.physics.add.overlap(this.player, zone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue(zone.getData('line'));
        }));
        this.seated = null;
        this.seatZones.forEach(spot => this.physics.add.overlap(this.player, spot, () => {
            if (!Phaser.Input.Keyboard.JustDown(this.spaceKey) || dialogueBusy()) return;
            if (this.seated) this.standUp(); else this.sitDown(spot.getData('seat'));
        }));
        [...this.gateDesks, ...this.deskZones].forEach(zone => this.physics.add.overlap(this.player, zone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) zone.getData('talk')(zone);
        }));
        this.securityZones.forEach(({ zone, act }) => this.physics.add.overlap(this.player, zone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) act();
        }));
        this.physics.add.overlap(this.player, this.starbucksZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { if (gameState.securityCleared) { if (!gameState.hasCoffee) { gameState.hasCoffee = true; this.heldCoffee.setVisible(true); playSound('select'); showDialogue("Mike bought a coffee. Essential fuel."); } } else { showDialogue("Security won't let you through yet."); } } });
        this.physics.add.overlap(this.player, this.gateZone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { if (gameState.securityCleared && gameState.hasCoffee) { this.photographTheGate(); showDialogue("Boarding Flight...", () => { stopMusic(); document.getElementById('scrolling-banner').style.display = 'none'; this.scene.start('FlightScene'); }); } else if (!gameState.hasCoffee) showDialogue("Mike needs a coffee before boarding."); else showDialogue("Security Check Required."); } });
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
        if (this.bagOnBelt) return; // it is riding the Smithson belt, not on his hand
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
        const runner = this.add.sprite(startX, 400, 'civilian').setTint(0xd48c8c);
        const bag = this.add.sprite(startX - 14, 408, 'suitcase').setScale(0.85).setTint(this.nextBagColour());
        const cry = this.add.text(startX, 372, "WAIT!", {
            fontSize: '11px', color: '#c0392b', fontStyle: 'bold'
        }).setOrigin(0.5);
        const flicker = this.tweens.add({ targets: cry, alpha: 0.25, duration: 420, yoyo: true, repeat: -1 });
        let bob = this.tweens.add({ targets: runner, y: 390, duration: 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
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

        // Changing lane retires the bob and starts a new one at the new height.
        // Two tweens writing the same y fight each other and he judders on the spot.
        const toLane = (laneY, after) => {
            bob.stop();
            this.tweens.add({
                targets: runner, y: laneY, duration: 400, ease: 'Sine.easeInOut',
                onComplete: () => {
                    bob = this.tweens.add({
                        targets: runner, y: laneY - 10, duration: 120,
                        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                    });
                    if (after) after();
                }
            });
        };

        if (startX > 720) return leave(); // already through, nothing to queue for
        runTo(508, () => toLane(190, () => {
            cry.setText("I HAVE CLEAR!");
            flicker.restart();
            playSound('select');
            const eye = this.add.rectangle(616, 166, 18, 11, 0x3fb7e8, 0.7).setDepth(7);
            this.tweens.add({ targets: eye, alpha: 0, duration: 300, yoyo: true, repeat: 1, onComplete: () => eye.destroy() });
            // The bag goes up onto the belt. It has to be lifted through the
            // entry, because update() rewrites the bag's position every frame
            // from its owner's and would flatten a tween on the sprite itself.
            this.tweens.add({
                targets: entry, bagLift: 16, duration: 320, yoyo: true, repeat: 1, ease: 'Sine.easeInOut'
            });
            const scan = this.add.rectangle(724, 180, 56, 26, 0x9fe8ff, 0.5);
            this.tweens.add({ targets: scan, alpha: 0, duration: 420, yoyo: true, repeat: 1, onComplete: () => scan.destroy() });
            this.time.delayedCall(1100, () => {
                cry.setText("WAIT!");
                playSound('select');
                runTo(850, () => toLane(400, leave));
            });
        }));
    }

    /**
     * The checkpoint. It used to be one gap in a wall with an arch standing in
     * it, and that arch has its uprights to the left and right of the lane — so
     * walking the length of the terminal took you across it rather than through
     * it, and it read as a tall vertical slot you squeezed past. Now it is three
     * lanes laid across the width of the terminal, each with its own queue:
     * CLEAR+ at the top, the general lane in the middle, PreCheck at the bottom.
     */
    buildSecurity(walls, queuePerson) {
        const LANES = [
            // The queues start clear of the check-in hall, which ends at x=467.
            // Two interaction zones that overlap share one keypress, and whichever
            // handler runs first swallows it.
            { y: 180, label: 'CLEAR+', tint: 0x2b8ce0, queueAt: 520, officerY: 96 },
            { y: 330, label: 'GENERAL', tint: 0xf4d03f, queueAt: 520, main: true, officerY: 246 },
            // The bottom lane's officer stands below it: above it is where the
            // Smithson belt ends, and he was standing on the bag you collect.
            { y: 480, label: 'TSA PRECHECK', tint: 0xc0392b, queueAt: 520, officerY: 556 }
        ];
        const inLane = y => LANES.some(l => Math.abs(y - l.y) < 42);

        // The partition, with a hole punched through it for each lane.
        for (let y = 0; y < GAME_HEIGHT; y += 32) {
            if (inLane(y + 16)) continue;
            walls.create(760, y + 16, null).setSize(32, 32).setVisible(false);
            this.add.rectangle(760, y + 16, 26, 32, 0x9aa5b1);
            this.add.rectangle(760, y + 2, 26, 3, 0xb9c2c5);
        }

        this.securityZones = [];
        this.laneBarriers = [];
        const zone = (x, y, w, h, act) => {
            const z = this.add.rectangle(x, y, w, h, 0xffff00, 0);
            this.physics.add.existing(z, true);
            this.securityZones.push({ zone: z, act });
            return z;
        };

        LANES.forEach(l => {
            this.add.image(724, l.y, 'metal_detector');
            this.add.rectangle(710, l.y - 50, 106, 18, 0x16212b);
            this.add.text(710, l.y - 50, l.label, { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
            const officer = this.physics.add.sprite(696, l.officerY, 'tsa');
            officer.setImmovable(true);
            // Wider than the hole it plugs: a 96px gap and an 84px barrier leaves
            // a 12px slot at each end, and a 16px body will try to wriggle through.
            const bar = this.physics.add.staticSprite(760, l.y, null).setSize(26, 108).setVisible(false);
            const glow = this.add.rectangle(760, l.y, 26, 96, l.tint, 0.22);
            if (l.main) {
                this.tsa = officer;
                this.securityBarrier = bar;
                this.gateVisual = glow;
            } else {
                this.laneBarriers.push(bar);
            }
        });

        // The general lane: the two bag machines, then the booth, then the
        // walk-through. The zones are kept clear of one another — overlapping
        // zones share a keypress and whichever runs first swallows it.
        this.add.image(616, 262, 'xray_machine');
        this.add.rectangle(616, 236, 58, 16, 0x16212b);
        this.add.text(616, 236, 'X-RAY', { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
        this.add.image(616, 398, 'smithson_machine');
        this.add.image(700, 386, 'luggage_cart').setScale(0.7); // the collection end
        this.add.rectangle(596, 424, 96, 16, 0x16212b);
        this.add.text(596, 424, 'SMITHSON CT', { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
        this.add.image(672, 330, 'body_scanner');
        this.add.image(616, 180, 'clear_pod');

        zone(616, 258, 92, 52, () => this.tryRegularXray());
        zone(616, 402, 92, 52, () => this.trySmithson());
        zone(672, 330, 46, 72, () => this.tryBodyScanner());
        zone(728, 330, 40, 44, () => this.lookAtDetector());
        zone(700, 398, 56, 52, () => this.collectBag());
        zone(676, 180, 60, 60, () => showDialogue("CLEAR+ members only. An officer looks at Mike's boarding pass, then at Mike, and points back down the hall."));
        zone(676, 480, 60, 60, () => showDialogue("TSA PreCheck. 'You got PreCheck on that pass?' Mike does not have PreCheck on that pass."));

        const TINTS = [0x8c9cb0, 0xb09c8c, 0xa0b08c];
        const QUEUE_AT = Object.fromEntries(LANES.map(l => [l.y, l.queueAt]));
        [
            [180, false, [
                "CLEAR Member: 'It pays for itself. That is what I tell my wife.'",
                "CLEAR Member: 'Look at the general line. Look at it.'"
            ]],
            [330, true, [
                "Passenger: 'Laptop, tablet, Kindle. Three trays. Every single time.'",
                "Passenger: 'Forty minutes in this one. My own fault entirely.'"
            ]],
            [480, true, [
                "PreCheck Passenger: 'Eighty-five dollars for five years. Best money I ever spent.'",
                "PreCheck Passenger: 'You just walk through. It feels illegal.'"
            ]]
        ].forEach(([qy, bags, lines]) => lines.forEach((line, i) => {
            queuePerson(QUEUE_AT[qy] + i * 46, qy, i % 2 ? 'civilian_f' : 'civilian', TINTS[i], line, bags);
        }));
    }

    /** The next case colour along, so no two neighbours match. */
    nextBagColour() {
        return BAG_COLOURS[this.bagColour++ % BAG_COLOURS.length];
    }

    /** Dialogue fired from a timer has to survive a box that is already open. */
    saySoon(text, next) {
        if (!showDialogue(text, next)) this.time.delayedCall(350, () => this.saySoon(text, next));
    }

    /** The ordinary machine, which mostly exists to point him at the other one. */
    tryRegularXray() {
        if (gameState.bagScreened) return showDialogue("The trays come back down the rollers, empty. Somebody is still hunting for a laptop.");
        showDialogue("TSA: 'Regular lane. Laptops, tablets, liquids — out of the bag, separate tray.'", () => {
            showDialogue("Mike: 'I have a laptop, a tablet and a Switch in there.'", () => {
                showDialogue("TSA: 'Then take the Smithson. It is the CT one. Bag goes in exactly as it is.'", () => {
                    showDialogue("Mike: 'That is the best news I have had all morning.'");
                });
            });
        });
    }

    trySmithson() {
        if (gameState.bagScreened) return showDialogue("His case is on the belt. The booth is next.");
        this.screenTheBag();
    }

    /**
     * The case rides the belt through the ring and comes out the far end.
     * bagOnBelt takes it off rollSuitcase's books for the duration: update()
     * rewrites the held case's position every frame and would flatten the tween.
     */
    screenTheBag() {
        gameState.bagScreened = true;
        this.bagOnBelt = true;
        this.bagAtEnd = false;
        const bag = this.heldSuitcase;
        bag.setDepth(6);
        playSound('select');
        showDialogue("TSA: 'Smithson — straight in. Nothing comes out of the bag.'", () => {
            this.tweens.add({
                targets: bag, x: 552, y: 394, rotation: 0, duration: 380, ease: 'Sine.easeOut',
                onComplete: () => {
                    const glow = this.add.rectangle(616, 394, 34, 26, 0x3fb7e8, 0.5).setDepth(7);
                    this.tweens.add({ targets: glow, alpha: 0.1, duration: 700, yoyo: true, repeat: 5, onComplete: () => glow.destroy() });
                    // A CT machine is not quick, which is the point of doing it
                    // in this order: he gets scanned himself while it works.
                    this.tweens.add({
                        targets: bag, x: 690, duration: 8000, ease: 'Linear',
                        onComplete: () => { this.bagAtEnd = true; }
                    });
                    this.saySoon("The belt takes it in. It is a slow machine and there is a queue behind him.", () => {
                        this.saySoon("TSA: 'Go on through the scanner. It will come out the far end.'");
                    });
                }
            });
        });
    }

    /**
     * Walk him somewhere under his own steam. The move has to be driven through
     * body.reset() rather than by tweening x/y: he is an arcade-physics sprite
     * and the body writes its own position back onto him every step, so a plain
     * positional tween is silently undone.
     */
    stepTo(x, y, done) {
        const fromX = this.player.x, fromY = this.player.y;
        const c = { t: 0 };
        this.player.isLocked = true;
        this.player.body.stop();
        this.tweens.add({
            targets: c, t: 1, duration: 420, ease: 'Sine.easeInOut',
            onUpdate: () => this.player.body.reset(
                Phaser.Math.Linear(fromX, x, c.t),
                Phaser.Math.Linear(fromY, y, c.t)
            ),
            onComplete: () => { this.player.isLocked = false; if (done) done(); }
        });
    }

    collectBag() {
        if (gameState.bagRetrieved) return showDialogue("He has it. Both hands, like it might try something.");
        if (!gameState.bagScreened) return showDialogue("Nothing on the belt yet. His case is still over his shoulder.");
        if (!gameState.bodyScanned) return showDialogue("TSA: 'Scanner first. Nobody is going to walk off with it.'");
        if (!this.bagAtEnd) return showDialogue("The case is still somewhere inside the machine. The belt does not hurry for anyone.");
        gameState.bagRetrieved = true;
        gameState.securityCleared = true;
        this.bagOnBelt = false;
        playSound('select');
        this.securityBarrier.destroy();
        this.gateVisual.fillColor = 0x00ff00;
        showDialogue("Mike lifts his case off the end of the belt. Shoes on, laptop still inside, nothing repacked.");
    }

    tryBodyScanner() {
        if (gameState.bodyScanned) return showDialogue("Mike has already been through. He is trying not to look pleased about it.");
        if (!gameState.hasTicket) return showDialogue("TSA: 'Boarding pass first.' Mike does not have one yet.");
        if (!gameState.bagScreened) return showDialogue("TSA: 'Bag on the belt first. Then you.'");
        this.bodyScan();
    }

    bodyScan() {
        gameState.bodyScanned = true;
        playSound('select');
        const backX = this.player.x, backY = this.player.y;
        // Into the glass, not alongside it: the booth is drawn at depth 0 and he
        // is at 5, so standing on its middle puts him inside it.
        this.stepTo(672, 326, () => {
            const sweep = this.add.rectangle(672, 310, 18, 2, 0x9fe8ff, 0.9).setDepth(7);
            this.tweens.add({ targets: sweep, y: 348, duration: 900, yoyo: true, repeat: 1, ease: 'Sine.easeInOut', onComplete: () => sweep.destroy() });
            this.saySoon("TSA: 'Step in. Feet on the prints, arms up, palms forward.'", () => {
                this.saySoon("Mike stands in the booth with his hands over his head like a man being arrested very politely.", () => {
                    this.saySoon("TSA: 'You are good. Collect your bag off the end of the belt.'", () => {
                        this.stepTo(backX, backY);
                    });
                });
            });
        });
    }

    lookAtDetector() {
        if (gameState.securityCleared) return showDialogue("Mike walks through. Nothing beeps. Small mercies.");
        if (gameState.bodyScanned) return showDialogue("TSA: 'Sir. Your bag. End of the belt, behind you.'");
        showDialogue("The metal detector, for anyone travelling light enough to have nothing to scan. An officer points Mike at the booth instead.");
    }

    ticketAgent(zone) {
        showDialogue("Ticket Agent: 'Morning. Where are we headed?'", () => {
            showDialogue("Mike: 'San Diego. Work thing.'", () => {
                showDialogue("Ticket Agent: 'Aisle or window?'", () => {
                    showDialogue("Mike: 'Window. I like watching it come up out of the water.'", () => {
                        showDialogue("Ticket Agent: 'Lived out there, did you?'", () => {
                            showDialogue("Mike: 'For a while. It will be good to be back.'", () => {
                                gameState.hasTicket = true;
                                this.heldTicket.setVisible(true);
                                playSound('select');
                                showDialogue("She slides a boarding pass across the counter. Flight 214, seat 14A, Gate 12B.", () => {
                                    zone.setData('talk', () => showDialogue("Ticket Agent: 'You are all set. 12B, and it is a long walk.'"));
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    bagAgent(zone) {
        showDialogue("Bag Agent: 'Anything fragile, anything lithium, anything alive?'", () => {
            showDialogue("Mike: 'Only me, and only barely.'", () => {
                showDialogue("Bag Agent: 'Heard that one already this morning. Twice.'", () => {
                    showDialogue("Bag Agent: 'Pop it on the scale whenever you are ready.'", () => {
                        zone.setData('talk', () => showDialogue("Bag Agent: 'Forty-one pounds. You are fine. Next.'"));
                    });
                });
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
     * The first page of the album, taken before there is anybody to take it
     * with — a man, his case and his coffee, waiting on a flight west.
     */
    photographTheGate() {
        takePhoto({
            key: 'gate', title: 'Gate 12B',
            caption: "Flight 214 to San Diego. He had no idea.",
            sprites: [
                { texture: 'large_window', x: 0, y: -14, scale: 0.5 },
                { texture: 'mini_plane', x: 30, y: -20 },
                { texture: this.player.texture.key, x: -6, y: 12 },
                { texture: 'suitcase', x: 14, y: 18, scale: 0.8 },
                { texture: 'coffee', x: -24, y: 10, scale: 0.8 },
                { texture: 'gate_seats_front', x: -44, y: 16, scale: 0.7 }
            ]
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
        const touching = this.physics.overlap(this.player, [this.gateZone, this.starbucksZone, this.newsZone, this.burgerZone, this.restroomZone, this.viewingZone, ...this.gateDesks, ...this.deskZones, ...this.securityZones.map(s => s.zone), ...this.peopleZones, ...this.seatZones]); 
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

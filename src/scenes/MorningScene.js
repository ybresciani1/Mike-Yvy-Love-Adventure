import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { fadeOutMusic, playRomanticTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
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
        this.tv = this.add.image(170, 232, 'tv').setScale(0.9);
        this.add.image(150, 370, 'armchair');
        this.add.image(196, 366, 'floor_lamp');
        this.add.image(140, 150, 'mini_fridge');

        // A second print and the aircon under the window.
        this.ac = this.add.image(670, 82, 'ac_unit');
        this.add.image(190, 414, 'conf_table').setTint(0x7b6047).setScale(0.5);
        this.coffee = this.add.image(184, 408, 'coffee').setScale(0.7);
        this.curtains = this.add.image(636, 40, 'hotel_window_night'); this.add.image(268, 32, 'wall_art'); this.add.image(470, 32, 'wall_art'); 
        this.dresser = this.physics.add.staticImage(600, 100, 'dresser'); this.door = this.physics.add.staticImage(100, 100, 'door'); 
        this.add.image(336, 300, 'nightstand'); this.add.image(464, 300, 'nightstand'); this.add.image(336, 288, 'lamp').setScale(0.8); this.add.image(464, 288, 'lamp').setScale(0.8); this.add.text(150, 200, "Hotel Room", { fontSize: '12px', color: '#f2e8d5' }); this.phone = this.physics.add.staticImage(464, 314, 'cellphone'); this.player = new Player(this, 400, 278);
        this.physics.add.collider(this.player, walls);
        // It is 4am: he is in the bed, not standing beside it. He gets up the
        // moment the player moves him.
        this.asleep = true;
        // Head on the pillows, lying along the bed rather than across it. The
        // duvet is laid over him afterwards so he reads as tucked in instead of
        // stood on the mattress.
        this.bedding = [
            this.add.rectangle(400, 322, 78, 68, 0xf4f2ed),
            this.add.rectangle(400, 289, 78, 3, 0xffffff),
            this.add.rectangle(400, 299, 78, 16, 0x8e2f3f),
            this.add.rectangle(400, 292, 78, 2, 0xa84152)
        ];
        this.zzz = this.add.text(424, 248, "Zzz...", { fontSize: '14px', color: '#efe6d6' });
        this.tweens.add({ targets: this.zzz, y: 260, alpha: 0.35, duration: 1300, yoyo: true, repeat: -1 }); this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.ringing = true;
        // A phone buzzing itself across a nightstand, rather than a handset
        // jumping in the air.
        this.tweens.add({ targets: this.phone, x: 467, angle: 7, duration: 90, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.phone, scale: 1.12, duration: 620, yoyo: true, repeat: -1 }); 
        this.time.addEvent({ delay: 1000, callback: () => { if(this.ringing) playSound('select'); }, loop: true }); 
        this.add.text(350, 50, "4:00 AM", { fontSize: '40px', color: '#fff', backgroundColor: '#000' }); 
        this.instructionText = this.add.text(20, 20, "Answer your phone (Space)", { fontSize: '16px', color: '#fff' }); 
        this.setUpRoom();
        this.dresserZone = this.add.rectangle(600, 120, 80, 80, 0xffff00, 0); this.physics.add.existing(this.dresserZone, true); 
        this.doorZone = this.add.rectangle(100, 100, 50, 60, 0x00ff00, 0); this.physics.add.existing(this.doorZone, true); 
        this.physics.add.overlap(this.player, this.phone, () => { 
            if (this.ringing && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { 
                this.ringing = false; this.phone.destroy(); playRomanticTheme(); 
                const seq = [ "Mike gropes about on the nightstand and finds his phone...", "Yvy: 'Good morning! It's 4 AM! Wake up!'", "Mike: 'You actually called!'", "Mike: 'I'm awake. Thank you, Yvy.'", "Mike: 'Bye Yvy-- I hope to see you soon!'", "*Click*", "Mike: 'Wow, she actually called... Best trip ever ❤️'", "Mike: 'Time to get ready for work.'" ]; 
                let i = 0; const next = () => { if (i > 0 && seq[i-1].includes("Bye Yvy.")) fadeOutMusic(2); if (i < seq.length) { showDialogue(seq[i++], next); } else { gameState.callFinished = true; this.instructionText.setText("Go to Dresser (Space)"); } }; next(); 
            } 
        }); 
        this.physics.add.overlap(this.player, this.dresserZone, () => { 
            if (gameState.callFinished && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { 
                document.getElementById('wardrobe-modal').style.display = 'block'; this.player.isLocked = true; 
                document.getElementById('btn-suit').onclick = () => { this.player.setTexture('mike_suit'); this.game.registry.set('playerOutfit', 'mike_suit'); }; 
                document.getElementById('btn-casual').onclick = () => { this.player.setTexture('mike_casual'); this.game.registry.set('playerOutfit', 'mike_casual'); }; 
                document.getElementById('btn-confirm').onclick = () => { document.getElementById('btn-confirm').blur(); if (!this.game.registry.get('playerOutfit')) { this.player.setTexture('mike_suit'); this.game.registry.set('playerOutfit', 'mike_suit'); } closeWardrobe(); }; 
            } 
        }); 
        this.physics.add.overlap(this.player, this.doorZone, () => { if (gameState.dressedForWork && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { this.scene.start('ConferenceScene'); } }); 
        const closeWardrobe = () => { document.getElementById('wardrobe-modal').style.display = 'none'; this.player.isLocked = false; this.player.y += 40; gameState.dressedForWork = true; this.instructionText.setText("Go to Work (Use Door)"); showDialogue("Mike: 'This is the one. Looking sharp!'"); }; 
    } 
    /**
     * The room is a set of props he can actually use while he is waiting to get
     * dressed. Each one keeps its own little bit of state, so the television is
     * on or off rather than just printing a line at him, and the responses
     * change to match.
     */
    setUpRoom() {
        this.tvOn = false;
        this.acOn = true;
        this.coffeeLeft = 2;
        this.roomZones = [];

        const useable = (x, y, w, h, handler) => {
            const zone = this.add.rectangle(x, y, w, h, 0xffff00, 0);
            this.physics.add.existing(zone, true);
            zone.setData('use', handler);
            this.roomZones.push(zone);
            return zone;
        };

        // The television. It has a picture when it is on, and the glow from it
        // is what tells you across the room.
        // The picture fills the whole screen. The first version lit a 26x16
        // patch in the middle of a 58x32 screen, which read as a fault rather
        // than as a television being on.
        this.tvGlow = this.add.rectangle(170, 232, 54, 32, 0x9fd6f0, 0).setDepth(1);
        this.tvBands = [];
        for (let i = 0; i < 4; i++) {
            this.tvBands.push(this.add.rectangle(170, 220 + i * 8, 54, 4, 0xdff2ff, 0).setDepth(2));
        }
        useable(170, 262, 74, 66, () => {
            this.tvOn = !this.tvOn;
            playSound('select');
            if (this.tvOn) {
                this.tvGlow.setFillStyle(0x9fd6f0, 0.8);
                this.tvFlicker = this.tweens.add({
                    targets: this.tvGlow, alpha: 0.55, duration: 260, yoyo: true, repeat: -1
                });
                // Scan bands rolling down the picture.
                this.tvBands.forEach((band, i) => {
                    band.setFillStyle(0xdff2ff, 0.22);
                    this.tweens.add({
                        targets: band, y: 244, duration: 900, repeat: -1, delay: i * 225,
                        onRepeat: () => { band.y = 216; }
                    });
                });
                showDialogue("Local news at four in the morning. A man is very excited about a car dealership.");
            } else {
                if (this.tvFlicker) { this.tvFlicker.remove(); this.tvFlicker = null; }
                this.tvGlow.setFillStyle(0x9fd6f0, 0).setAlpha(1);
                this.tvBands.forEach(band => {
                    this.tweens.killTweensOf(band);
                    band.setFillStyle(0xdff2ff, 0).setAlpha(1);
                });
                showDialogue("Mike turns the television off. Much better.");
            }
        });

        // The aircon, which every hotel room has set wrong.
        this.acHum = this.add.text(670, 62, "~", { fontSize: '12px', color: '#bfe9ff' }).setOrigin(0.5);
        this.tweens.add({ targets: this.acHum, y: 54, alpha: 0.2, duration: 1400, yoyo: true, repeat: -1 });
        useable(670, 96, 70, 56, () => {
            this.acOn = !this.acOn;
            playSound('select');
            this.acHum.setVisible(this.acOn);
            showDialogue(this.acOn
                ? "The aircon shudders back to life. Somebody left it on 67, because of course they did."
                : "Mike turns the aircon off. The room goes quiet for the first time all night.");
        });

        // The coffee on the table by the armchair.
        useable(186, 410, 66, 54, () => {
            if (this.coffeeLeft <= 0) {
                showDialogue("Mike: 'Gone. That was the whole pot.'");
                return;
            }
            this.coffeeLeft--;
            playSound('select');
            if (this.coffeeLeft === 0) {
                this.coffee.setVisible(false);
                showDialogue("Mike finishes the coffee. Terrible. Necessary.");
            } else {
                this.coffee.setScale(0.55);
                showDialogue("Mike: 'Free hotel coffee. Tastes like a filing cabinet.'");
            }
        });

        // The window, the bed and the rest of the room, for flavour.
        useable(636, 60, 90, 60, () => showDialogue(
            "Still dark out. Somewhere under all that is a city he has known for two days."
        ));
        useable(400, 296, 74, 96, () => showDialogue(gameState.callFinished
            ? "Mike: 'No. If I sit back down on that I am not getting up again.'"
            : "The bed is still warm. The phone is still ringing."));
        useable(648, 250, 76, 50, () => showDialogue(
            "His laptop, shut, where he left it at one in the morning."
        ));
        useable(150, 372, 62, 60, () => showDialogue(
            "Mike: 'Nobody has ever sat in one of these. Not once.'"
        ));
        useable(140, 152, 56, 56, () => showDialogue(
            "Mike: 'Nine dollars for a bottle of water. I'll pass.'"
        ));

        this.roomZones.forEach(zone => this.physics.add.overlap(this.player, zone, () => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) zone.getData('use')();
        }));
    }

    update() {
        if (this.asleep && (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown)) {
            this.asleep = false;
            this.bedding.forEach(piece => piece.destroy());
            this.zzz.destroy();
        }
        this.player.update(this.cursors); document.getElementById('interaction-hint').style.display = (this.physics.overlap(this.player, this.phone)
            || this.physics.overlap(this.player, this.roomZones)
            || (gameState.callFinished && this.physics.overlap(this.player, this.dresserZone))
            || (gameState.dressedForWork && this.physics.overlap(this.player, this.doorZone))) ? 'block' : 'none';
    }

}

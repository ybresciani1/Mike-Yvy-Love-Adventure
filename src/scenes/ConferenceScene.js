import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playConferenceTheme } from '../audio/music.js';
import { showDialogue, isDialogueOpen, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class ConferenceScene extends Phaser.Scene { 
    constructor() { super('ConferenceScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#f0f0f0'); playConferenceTheme(); 
        for (let x = 0; x < GAME_WIDTH/32; x++) for (let y = 0; y < GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'expo_carpet'); 
        // Mike's own stand, dressed like the rest of the hall rather than left as a
        // bare table: backdrop, header, banners and a demo counter.
        this.add.image(400, 244, 'expo_booth').setTint(0xbcd6f5);
        this.add.text(400, 224, "NOTION THEORY", { fontSize: '11px', color: '#12212e', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 258, "SPATIAL COMPUTING", { fontSize: '8px', color: '#2c3e50' }).setOrigin(0.5);
        this.add.image(318, 250, 'expo_banner').setTint(0xbcd6f5);
        this.add.image(482, 250, 'expo_banner').setTint(0xbcd6f5);
        this.table = this.physics.add.staticImage(400, 308, 'vr_demo_table'); 
        this.vrHeadset = this.physics.add.sprite(400, 296, 'vr_headset'); this.heldVR = this.add.sprite(0,0,'vr_headset').setScale(0.8).setVisible(false); 
        this.booth1 = this.add.image(150, 92, 'expo_booth').setTint(0x8ec5e8); this.add.text(150, 70, "AI GEN", {fontSize: '11px', color: '#1b2631', fontStyle: 'bold'}).setOrigin(0.5); this.booth1Zone = this.add.rectangle(150, 100, 100, 80, 0, 0); this.physics.add.existing(this.booth1Zone, true);
        this.booth2 = this.add.image(650, 92, 'expo_booth').setTint(0xf0a49c); this.add.text(650, 70, "WEB3", {fontSize: '11px', color: '#1b2631', fontStyle: 'bold'}).setOrigin(0.5); this.booth2Zone = this.add.rectangle(650, 100, 100, 80, 0, 0); this.physics.add.existing(this.booth2Zone, true);
// The rest of the hall: stands that are scenery, not interactions.
                [
                    { x: 150, y: 300, tint: 0xa8e6c0, label: 'CLOUD OPS' },
                    { x: 650, y: 300, tint: 0xf6d6a8, label: 'ROBOTICS' },
                    { x: 150, y: 500, tint: 0xc9bde8, label: 'FINTECH' },
                    { x: 650, y: 500, tint: 0xf5c6dd, label: 'GAME DEV' }
                ].forEach(b => {
                    this.add.image(b.x, b.y, 'expo_booth').setTint(b.tint);
                    this.add.text(b.x, b.y - 22, b.label, { fontSize: '11px', color: '#1b2631', fontStyle: 'bold' }).setOrigin(0.5);
                });
                [[60, 200], [740, 200], [60, 400], [740, 400]].forEach(([x, y]) => this.add.image(x, y, 'expo_banner'));
                [[300, 180], [500, 180], [300, 430], [500, 430]].forEach(([x, y]) => this.add.image(x, y, 'expo_monitor'));
                this.attendees = this.add.group(); 
        [{x: 150, y: 150}, {x: 650, y: 150}, {x: 230, y: 360}, {x: 560, y: 250}, {x: 300, y: 520}, {x: 480, y: 120}, {x: 700, y: 400}, {x: 100, y: 400}].forEach((pos, i) => { let npc = this.physics.add.sprite(pos.x, pos.y, i % 2 ? 'civilian_f' : 'civilian'); npc.setTint(Phaser.Display.Color.RandomRGB(120, 255).color); npc.hasTriedDemo = false; this.attendees.add(npc); this.tweens.add({ targets: npc, x: npc.x + (Math.random() > 0.5 ? 50 : -50), y: npc.y + (Math.random() > 0.5 ? 50 : -50), duration: 2000 + Math.random() * 2000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 }); }); 
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit'; this.player = new Player(this, 100, 550); this.player.setTexture(outfit); 
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.add.text(20, 20, "Task: Pick up VR Headset -> Demo to 3 People", { fontSize: '16px', color: '#000', backgroundColor: '#fff' }); 
        this.physics.add.overlap(this.player, this.vrHeadset, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy() && !gameState.hasVR) { gameState.hasVR = true; this.vrHeadset.destroy(); this.heldVR.setVisible(true); playSound('select'); showDialogue("Mike picked up the VR Headset."); } }); 
        this.physics.add.overlap(this.player, this.attendees, (player, npc) => { 
            if (gameState.hasVR && !npc.hasTriedDemo && !this.player.isLocked && !isDialogueOpen() && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) { 
                npc.hasTriedDemo = true; 
                playSound('vr_boop'); 
                this.player.isLocked = true;
                npc.body.stop(); 
                const demoDialogues = [
                    ["Mike explains: 'This headset uses high-resolution retinal projection.'", "Attendee puts on headset.", "Attendee: 'Whoa! The text is perfectly readable.'", "Mike: 'Exactly. It's designed for enterprise productivity.'", "Attendee: 'Incredible work. I need this for my team.'"],
                    ["Mike: 'Let me show you the mixed reality pass-through.'", "Attendee puts on headset.", "Attendee looks around.", "Attendee: 'It feels so real! I can see the virtual objects on the table.'", "Mike: 'Latency is under 10ms.'", "Attendee: 'Sold! Where do I sign up?'"],
                    ["Mike: 'We are building the future of remote collaboration.'", "Attendee: 'Is it compatible with existing workflows?'", "Mike: 'Yes, it integrates seamlessly.'", "Attendee tries it on.", "Attendee: 'This is smooth. Very impressive.'"]
                ];
                const dialogueSet = demoDialogues[Math.min(gameState.demosGiven, 2)];
                let i = 0;
                const nextLine = () => {
                    if (i >= dialogueSet.length) {
                        this.player.isLocked = false;
                        gameState.demosGiven++;
                        if (gameState.demosGiven >= 3) { this.startTextingSequence(); }
                        return;
                    }
                    if (showDialogue(dialogueSet[i], nextLine)) {
                        i++;
                    } else {
                        this.time.delayedCall(150, nextLine);
                    }
                };
                nextLine();
            } 
        }); 
        this.physics.add.overlap(this.player, this.booth1Zone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Mike checked the AI Gen booth: 'Another LLM wrapper... Doesn't scale.'"); });
        this.physics.add.overlap(this.player, this.booth2Zone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) showDialogue("Mike checked the Web3 booth: 'Crypto... I'm more focused on VR right now.'"); });
    } 
    startTextingSequence() { showDialogue("Mike: 'That went great! I should text Yvy.'", () => { playSound('msg_sent'); showDialogue("Mike sent: 'Demo went great! Dinner tonight?'", () => { this.time.delayedCall(1500, () => { playSound('msg_sent'); showDialogue("Yvy replied: 'YES OFC! ❤️'", () => { stopMusic(); this.scene.start('UberScene'); }); }); }); }); } 
    update() { this.player.update(this.cursors); if (gameState.hasVR) { this.heldVR.x = this.player.x + 10; this.heldVR.y = this.player.y; } document.getElementById('interaction-hint').style.display = ((!gameState.hasVR && this.physics.overlap(this.player, this.vrHeadset)) || (gameState.hasVR && this.physics.overlap(this.player, this.attendees)) || this.physics.overlap(this.player, [this.booth1Zone, this.booth2Zone])) ? 'block' : 'none'; } 
}

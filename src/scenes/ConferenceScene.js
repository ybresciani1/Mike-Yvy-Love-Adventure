import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { gameState } from '../state.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playConferenceTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';

export class ConferenceScene extends Phaser.Scene { 
    constructor() { super('ConferenceScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#f0f0f0'); playConferenceTheme(); 
        for (let x = 0; x < GAME_WIDTH/32; x++) for (let y = 0; y < GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'floor_tile').setTint(0xeeeeee); 
        this.table = this.physics.add.staticImage(400, 300, 'conf_table'); this.add.text(350, 260, "NOTION\nTHEORY", { fontSize: '14px', color: '#000', align: 'center', fontWeight: 'bold' }); 
        this.vrHeadset = this.physics.add.sprite(400, 300, 'vr_headset'); this.heldVR = this.add.sprite(0,0,'vr_headset').setScale(0.8).setVisible(false); 
        this.booth1 = this.add.rectangle(150, 100, 80, 60, 0x3498db); this.add.text(120, 90, "AI GEN", {fontSize: '12px', color: '#fff', fontStyle: 'bold'}); this.booth1Zone = this.add.rectangle(150, 100, 100, 80, 0, 0); this.physics.add.existing(this.booth1Zone, true);
        this.booth2 = this.add.rectangle(650, 100, 80, 60, 0xe74c3c); this.add.text(620, 90, "WEB3", {fontSize: '12px', color: '#fff', fontStyle: 'bold'}); this.booth2Zone = this.add.rectangle(650, 100, 100, 80, 0, 0); this.physics.add.existing(this.booth2Zone, true);
        this.attendees = this.add.group(); 
        [{x: 150, y: 150}, {x: 650, y: 150}, {x: 150, y: 500}, {x: 650, y: 500}].forEach(pos => { let npc = this.physics.add.sprite(pos.x, pos.y, 'civilian'); npc.setTint(Math.random() * 0xffffff); npc.hasTriedDemo = false; this.attendees.add(npc); this.tweens.add({ targets: npc, x: npc.x + (Math.random() > 0.5 ? 50 : -50), y: npc.y + (Math.random() > 0.5 ? 50 : -50), duration: 2000 + Math.random() * 2000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 }); }); 
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit'; this.player = new Player(this, 100, 550); this.player.setTexture(outfit); 
        this.cursors = this.input.keyboard.createCursorKeys(); this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
        this.add.text(20, 20, "Task: Pick up VR Headset -> Demo to 3 People", { fontSize: '16px', color: '#000', backgroundColor: '#fff' }); 
        this.physics.add.overlap(this.player, this.vrHeadset, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !gameState.hasVR) { gameState.hasVR = true; this.vrHeadset.destroy(); this.heldVR.setVisible(true); playSound('select'); showDialogue("Mike picked up the VR Headset."); } }); 
        this.physics.add.overlap(this.player, this.attendees, (player, npc) => { 
            if (gameState.hasVR && !npc.hasTriedDemo && Phaser.Input.Keyboard.JustDown(this.spaceKey)) { 
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
                    if (i < dialogueSet.length) {
                        showDialogue(dialogueSet[i++], nextLine);
                    } else {
                        this.player.isLocked = false;
                        gameState.demosGiven++;
                        if (gameState.demosGiven >= 3) { this.startTextingSequence(); }
                    }
                };
                nextLine();
            } 
        }); 
        this.physics.add.overlap(this.player, this.booth1Zone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) showDialogue("Mike checked the AI Gen booth: 'Another LLM wrapper... Doesn't scale.'"); });
        this.physics.add.overlap(this.player, this.booth2Zone, () => { if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) showDialogue("Mike checked the Web3 booth: 'Crypto... I'm more focused on VR right now.'"); });
    } 
    startTextingSequence() { showDialogue("Mike: 'That went great! I should text Yvy.'", () => { playSound('msg_sent'); showDialogue("Mike sent: 'Demo went great! Dinner tonight?'", () => { this.time.delayedCall(1500, () => { playSound('msg_sent'); showDialogue("Yvy replied: 'YES OFC! ❤️'", () => { stopMusic(); this.scene.start('UberScene'); }); }); }); }); } 
    update() { this.player.update(this.cursors); if (gameState.hasVR) { this.heldVR.x = this.player.x + 10; this.heldVR.y = this.player.y; } document.getElementById('interaction-hint').style.display = ((!gameState.hasVR && this.physics.overlap(this.player, this.vrHeadset)) || (gameState.hasVR && this.physics.overlap(this.player, this.attendees)) || this.physics.overlap(this.player, [this.booth1Zone, this.booth2Zone])) ? 'block' : 'none'; } 
}

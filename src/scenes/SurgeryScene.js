import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { showDialogue } from '../ui/dialogue.js';

export class SurgeryScene extends Phaser.Scene {
    constructor() { super('SurgeryScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#e0f7fa');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<GAME_HEIGHT/32; y++) {
            if (y < 12) this.add.image(x*32+16, y*32+16, 'hospital_wall');
            else this.add.image(x*32+16, y*32+16, 'floor_tile');
        }
        this.add.image(140, 150, 'hospital_window');
        this.add.image(660, 150, 'hospital_window');
        // The ward around the bed: curtain track, a second bay, the trolley of
        // things nobody wants to look at, and a balloon somebody brought.
        for (let cx = 96; cx <= 224; cx += 64) this.add.image(cx, 286, 'ward_curtain');
        for (let cx = 576; cx <= 704; cx += 64) this.add.image(cx, 286, 'ward_curtain');
        this.add.image(560, 232, 'hospital_bed').setScale(0.8).setTint(0xd8dee2);
        this.add.rectangle(400, 384, GAME_WIDTH, 5, 0xb6c2c6); // skirting
        this.add.rectangle(400, 388, GAME_WIDTH, 3, 0x96a2a6);
        this.add.image(280, 196, 'med_trolley');
        this.add.image(484, 330, 'balloon');
        this.add.image(112, 350, 'plant_fern');
        this.add.image(700, 350, 'trash_bin').setScale(0.9);
        this.add.image(196, 120, 'wall_art').setTint(0xd8e8ea);
        this.add.image(604, 120, 'wall_art').setTint(0xd8e8ea);
        this.add.image(400, 120, 'departure_board').setScale(0.5).setTint(0xcfe0e4);
        this.add.text(400, 46, "Rady Children's Hospital", { fontSize: '20px', color: '#12333a', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 70, "Pediatric Surgery — Recovery", { fontSize: '11px', color: '#3f6670' }).setOrigin(0.5);
        this.bed = this.add.image(400, 300, 'hospital_bed');
        this.add.image(320, 250, 'iv_stand');
        this.monitor = this.add.image(480, 250, 'heart_monitor');
        this.tweens.add({targets: this.monitor, alpha: 0.8, duration: 500, yoyo: true, repeat: -1});
        // A steady trace across the monitor, which is the only reassuring thing
        // in the room.
        this.trace = this.add.rectangle(480, 244, 4, 3, 0x6ef07a).setDepth(1);
        this.tweens.add({ targets: this.trace, x: 496, duration: 900, repeat: -1,
            onRepeat: () => { this.trace.x = 466; } });
        this.tweens.add({ targets: this.trace, y: 238, duration: 120, yoyo: true, repeat: -1, delay: 380 });
        this.aiden = this.add.sprite(400, 290, 'aiden');
        this.doctor = this.add.sprite(520, 250, 'doctor');
        this.nurse = this.add.sprite(300, 300, 'doctor').setTint(0xbfd8e0);
        this.tweens.add({ targets: this.nurse, y: 296, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: this.doctor, y: 246, duration: 2100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.yvy = this.add.sprite(350, 350, 'yvy');
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(300, 350, outfit);
        this.time.delayedCall(1000, () => {
            showDialogue("They went through so many trials and challenges.", () => {
                showDialogue("Mike was there when Aiden had his big surgery for his throat...", () => {
                    showDialogue("He stood strong by their side, supporting them through the fear.", () => {
                        this.scene.start('BurialScene');
                    });
                });
            });
        });
    }
}

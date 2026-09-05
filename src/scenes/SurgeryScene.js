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
        this.add.image(200, 150, 'hospital_window');
        this.add.image(600, 150, 'hospital_window');
        this.add.text(400, 50, "Hospital", { fontSize: '24px', color: '#000', fontStyle: 'bold' }).setOrigin(0.5);
        this.bed = this.add.image(400, 300, 'hospital_bed');
        this.add.image(320, 250, 'iv_stand');
        this.monitor = this.add.image(480, 250, 'heart_monitor');
        this.tweens.add({targets: this.monitor, alpha: 0.8, duration: 500, yoyo: true, repeat: -1});
        this.aiden = this.add.sprite(400, 290, 'aiden');
        this.doctor = this.add.sprite(520, 250, 'doctor');
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

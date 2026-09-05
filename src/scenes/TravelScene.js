import Phaser from 'phaser';
import { showDialogue } from '../ui/dialogue.js';

export class TravelScene extends Phaser.Scene {
    constructor() { super('TravelScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#87ceeb');
        // --- CHANGED: NC to DC ---
        this.add.circle(100, 300, 10, 0x0000ff); this.add.text(100, 320, "SD", { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
        this.add.circle(700, 300, 10, 0xff0000); this.add.text(700, 320, "DC", { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff, 0.5);
        graphics.beginPath(); graphics.moveTo(100, 300); graphics.lineTo(700, 300); graphics.strokePath();
        const plane = this.add.container(100, 300, [this.add.rectangle(0,0,15,60,0xcccccc), this.add.rectangle(0,0,60,20,0xffffff)]);
        plane.setScale(1, 1);
        this.tweens.add({
            targets: plane, x: 700, duration: 2000, ease: 'Sine.easeInOut',
            onComplete: () => {
                showDialogue("Mike and Yvy got to know each other more.", () => {
                    plane.setScale(-1, 1);
                    this.tweens.add({
                        targets: plane, x: 100, duration: 2000, ease: 'Sine.easeInOut',
                        onComplete: () => {
                            showDialogue("Yvy was scared at first because Mike seemed too NICE...", () => {
                                plane.setScale(1, 1);
                                this.tweens.add({
                                    targets: plane, x: 700, duration: 2000, ease: 'Sine.easeInOut',
                                    onComplete: () => {
                                        showDialogue("But as time passed, she realized Mike was kind, safe, and truly genuine.", () => {
                                            this.scene.start('HouseScene');
                                        });
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    }
}

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
        [{x: 220, y: 140, s: 1.4}, {x: 540, y: 430, s: 1.8}, {x: 380, y: 90, s: 1.1}].forEach(c =>
                    this.add.image(c.x, c.y, 'cloud').setScale(c.s).setAlpha(0.28)
                );
                const plane = this.add.image(100, 300, 'airliner').setScale(0.8);
                this.tweens.add({ targets: plane, y: 294, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        plane.setScale(0.8, 0.8);
        this.tweens.add({
            targets: plane, x: 700, duration: 2000, ease: 'Sine.easeInOut',
            onComplete: () => {
                showDialogue("Mike and Yvy got to know each other more.", () => {
                    plane.setScale(-0.8, 0.8);
                    this.tweens.add({
                        targets: plane, x: 100, duration: 2000, ease: 'Sine.easeInOut',
                        onComplete: () => {
                            showDialogue("Yvy was scared at first because Mike seemed too NICE...", () => {
                                plane.setScale(0.8, 0.8);
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

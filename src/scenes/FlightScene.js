import Phaser from 'phaser';

export class FlightScene extends Phaser.Scene { 
    constructor() { super('FlightScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#87ceeb'); 
        // Clouds drifting the other way sell the speed better than the plane alone.
                [{x: 700, y: 120, s: 1.6, d: 9000}, {x: 900, y: 420, s: 2.2, d: 7000}, {x: 1100, y: 240, s: 1.2, d: 11000}].forEach(c => {
                    const cloud = this.add.image(c.x, c.y, 'cloud').setScale(c.s).setAlpha(0.85);
                    this.tweens.add({ targets: cloud, x: -200, duration: c.d, repeat: -1 });
                });
                const plane = this.add.image(850, 300, 'airliner');
        plane.setScale(-1, 1);
        this.tweens.add({ targets: plane, y: 292, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); 
        // --- CHANGED: NC to DC ---
        this.add.text(400, 200, "SD  <-----------------  DC", { fontSize: '32px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5); 
        this.tweens.add({ targets: plane, x: -50, duration: 4000, ease: 'Quad.easeInOut', onComplete: () => this.scene.start('BarScene') }); 
    } 
}

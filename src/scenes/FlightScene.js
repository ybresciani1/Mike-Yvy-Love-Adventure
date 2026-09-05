import Phaser from 'phaser';

export class FlightScene extends Phaser.Scene { 
    constructor() { super('FlightScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#87ceeb'); 
        const plane = this.add.container(850, 300, [this.add.rectangle(0,0,15,60,0xcccccc), this.add.rectangle(0,0,60,20,0xffffff)]); 
        plane.setScale(-1, 1); 
        // --- CHANGED: NC to DC ---
        this.add.text(400, 200, "SD  <-----------------  DC", { fontSize: '32px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5); 
        this.tweens.add({ targets: plane, x: -50, duration: 4000, ease: 'Quad.easeInOut', onComplete: () => this.scene.start('BarScene') }); 
    } 
}

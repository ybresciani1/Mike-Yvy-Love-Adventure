import Phaser from 'phaser';

export class UberScene extends Phaser.Scene { 
    constructor() { super('UberScene'); } 
    create() { 
        this.cameras.main.setBackgroundColor('#111'); this.roadLines = this.add.tileSprite(400, 300, 800, 600, 'pavement'); this.roadLines.setAlpha(0.5); 
        this.car = this.add.sprite(-100, 300, 'uber_car'); this.car.setScale(2); 
        this.add.text(400, 100, "Traveling to Gordon Biersch BrewPub...", { fontSize: '24px', color: '#fff', align: 'center', fontStyle: 'bold' }).setOrigin(0.5); 
        this.tweens.add({ targets: this.car, x: 900, duration: 4000, ease: 'Quad.easeInOut', onComplete: () => { this.scene.start('RestaurantScene'); } }); 
    } 
    update() { this.roadLines.tilePositionX += 5; } 
}

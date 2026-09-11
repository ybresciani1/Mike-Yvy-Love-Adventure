import Phaser from 'phaser';
import { buildNightDrive, driveOn } from './UberScene.js';

export class DriveToHotelScene extends Phaser.Scene {
    constructor() { super('DriveToHotelScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a1024');
        // Later in the night than the ride to dinner, so the city behind them is
        // a shade dimmer.
        buildNightDrive(this, {
            caption: "Driving to the Fancy Hotel...",
            onArrive: () => this.scene.start('FancyHotelScene'),
            tint: 0xbfc8e0
        });
    }

    update() { driveOn(this); }
}

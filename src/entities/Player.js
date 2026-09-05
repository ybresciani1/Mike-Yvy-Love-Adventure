import Phaser from 'phaser';
import { isDialogueOpen } from '../ui/dialogue.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'mike');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.body.setSize(16, 16);
        this.body.setOffset(8, 16);
        this.speed = 150;
        this.isLocked = false;
    }
    update(cursors) {
        this.setVelocity(0);
        if (isDialogueOpen() || this.isLocked) return;
        let moved = false;
        if (cursors.left.isDown) { this.setVelocityX(-this.speed); this.setFlipX(true); moved = true; }
        else if (cursors.right.isDown) { this.setVelocityX(this.speed); this.setFlipX(false); moved = true; }
        if (cursors.up.isDown) { this.setVelocityY(-this.speed); moved = true; }
        else if (cursors.down.isDown) { this.setVelocityY(this.speed); moved = true; }
        if (moved) this.y += Math.sin(this.scene.time.now / 100) * 0.5;
    }
}

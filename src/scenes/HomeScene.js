import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { playRomanticTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';

export class HomeScene extends Phaser.Scene {
    constructor() { super('HomeScene'); }
    preload() {
        this.load.image('riot_custom', REMOTE_IMAGES.riot);
        this.load.image('snow_custom', REMOTE_IMAGES.snow);
        this.load.image('beyonce_custom', REMOTE_IMAGES.beyonce);
        this.load.image('penny_custom', REMOTE_IMAGES.penny);
        this.load.image('bojji_custom', REMOTE_IMAGES.bojji);
        this.load.image('peaches_custom', REMOTE_IMAGES.peaches);
        this.load.image('lychee_custom', REMOTE_IMAGES.lychee);
    }
    create() {
        this.cameras.main.setBackgroundColor('#8d6e63');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=0; y<12; y++) this.add.image(x*32+16, y*32+16, 'floor_wood_detailed');
        for (let x=0; x<GAME_WIDTH/32; x++) for (let y=12; y<GAME_HEIGHT/32; y++) this.add.image(x*32+16, y*32+16, 'grass_detailed');
        const fences = this.physics.add.staticGroup();
        for(let x=0; x<GAME_WIDTH/32; x++) {
            if (x < 10 || x > 14) {
                this.add.image(x*32+16, 11*32+16, 'fence_detailed');
                let barrier = this.add.rectangle(x*32+16, 11*32+16, 32, 32, 0, 0);
                fences.add(barrier);
            }
        }
        this.add.image(400, 200, 'fancy_rug').setScale(0.8);
        this.add.image(100, 400, 'bush_detailed'); this.add.image(140, 420, 'bush_detailed'); this.add.image(700, 400, 'bush_detailed');
        this.add.image(60, 500, 'flower_red'); this.add.image(90, 520, 'flower_red'); this.add.image(750, 500, 'flower_red');
        this.add.image(250, 450, 'dirt_patch'); this.add.image(400, 480, 'dirt_patch'); this.add.image(550, 440, 'dirt_patch');
        this.add.text(400, 40, "Their Beautiful Home", { fontSize: '24px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.physics.add.sprite(280, 200, outfit);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, fences);
        this.yvy = this.add.sprite(340, 200, 'yvy');
        this.mom = this.add.sprite(400, 200, 'yvy_mom');
        this.aiden = this.add.sprite(460, 210, 'aiden_older');
        this.lychee = this.add.sprite(200, 250, 'lychee_custom'); this.lychee.setDisplaySize(24, 24);
        this.bojji = this.add.sprite(600, 300, 'bojji_custom'); this.bojji.setDisplaySize(48, 48);
        this.peaches = this.add.sprite(350, 280, 'peaches_custom'); this.peaches.setDisplaySize(32, 32);
        this.riot = this.add.sprite(250, 450, 'riot_custom'); this.riot.setDisplaySize(32, 32); 
        this.beyonce = this.add.sprite(400, 480, 'beyonce_custom'); this.beyonce.setDisplaySize(32, 32);
        this.snow = this.add.sprite(550, 440, 'snow_custom'); this.snow.setDisplaySize(32, 32);
        this.tweens.add({ targets: [this.riot, this.beyonce, this.snow], x: '+=20', y: '+=10', duration: 2000, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.bojji, x: '-=30', duration: 3000, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.peaches, x: 570, yoyo: true, repeat: -1, duration: 2000, flipX: true });
        this.time.delayedCall(1000, () => {
            playRomanticTheme();
            showDialogue("Mike and Yvy bought a house and end up growing their family.", () => {
                showDialogue("They adopted Lychee the gray tabby, and Bojji the brown dog.", () => {
                    showDialogue("Then came the chickens: Riot, Beyonce, and Snow.", () => {
                        showDialogue("Yvy's mom got really ill and moved in with them. To ease the pain and because Yvy always wanted a Pomeranian, they adopted Peaches.", () => {
                            showDialogue("Aiden grew up and is now 11. He's grown to love Mike and misses him when he travels to work.", () => {
                                showDialogue("Aiden: 'I want to be like Mike when I grow up!'", () => {
                                    showDialogue("Aiden: 'Mike is PERFECT but mommy.. you're *IMPERFECTLY* PERFECT.'", () => {
                                        showDialogue("They have a beautiful home and as time passed, Mike, Yvy, and Aiden keep growing together as they learn to love every pixel of each other.", () => {
                                            this.scene.start('PresentScene');
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    update() { if (this.player && this.player.body) this.player.update(this.cursors); }
}

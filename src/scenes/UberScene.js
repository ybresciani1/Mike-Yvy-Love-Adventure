import Phaser from 'phaser';
import { GAME_WIDTH } from '../constants.js';
import { playSound } from '../audio/sfx.js';

export class UberScene extends Phaser.Scene {
    constructor() { super('UberScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a1024');
        buildNightDrive(this, {
            caption: "Traveling to Gordon Biersch BrewPub...",
            // The destination is written out here rather than passed as a key so
            // tests/sceneFlow.test.js can still see the transition: it derives the
            // story chain by reading scene.start() calls out of the source.
            onArrive: () => this.scene.start('RestaurantScene')
        });
    }

    update() { driveOn(this); }
}

/**
 * The two car journeys used to be a grey tile scrolling behind a car. They are
 * the only glimpse of the city between scenes, so they get the full parallax:
 * skyline crawling, shopfronts going by, lamps whipping past, and the road
 * moving fastest of all.
 *
 * Shared by UberScene and DriveToHotelScene, which is why it lives out here
 * rather than in either class.
 */
export function buildNightDrive(scene, { caption, onArrive, tint = 0xffffff }) {
    [[0x0a1024, 0, 70], [0x121a3a, 70, 50], [0x1b2550, 120, 44], [0x263364, 164, 36]]
        .forEach(([col, top, h]) => scene.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));
    for (let i = 0; i < 40; i++) {
        scene.add.rectangle(Math.random() * GAME_WIDTH, Math.random() * 140, 2, 2, 0xffffff, 0.7);
    }
    scene.add.image(660, 70, 'moon').setScale(1.1).setAlpha(0.9);

    // Two skyline layers, the far one hazed.
    scene.farCity = scene.add.tileSprite(400, 196, GAME_WIDTH, 96, 'night_skyline')
        .setAlpha(0.5).setTint(0x8fa0c4);
    scene.nearCity = scene.add.tileSprite(400, 254, GAME_WIDTH, 96, 'night_skyline').setTint(tint);

    // The shops at street level, close enough to fly past.
    const fronts = ['night_shop_taco', 'night_shop_laundry', 'night_shop_liquor', 'night_shop_tattoo'];
    scene.shopRow = [];
    for (let i = 0; i < 8; i++) {
        const shop = scene.add.image(i * 112, 336, fronts[i % fronts.length]);
        scene.shopRow.push(shop);
    }

    // Pavement, kerb, road.
    scene.add.rectangle(400, 400, GAME_WIDTH, 34, 0x232a3e);
    scene.add.rectangle(400, 386, GAME_WIDTH, 4, 0x39415a);
    scene.add.rectangle(400, 510, GAME_WIDTH, 186, 0x14161f);
    scene.add.rectangle(400, 418, GAME_WIDTH, 3, 0x4a5168);

    // Dashes down the middle of the road, recycled as they leave the screen.
    scene.dashes = [];
    for (let i = 0; i < 10; i++) {
        scene.dashes.push(scene.add.rectangle(i * 90, 500, 44, 6, 0xd8d2b0, 0.8));
    }

    // Lamps on the near pavement.
    scene.lamps = [];
    for (let i = 0; i < 5; i++) {
        const lamp = scene.add.image(i * 190, 366, 'streetlight').setScale(1.6);
        const glow = scene.add.circle(i * 190 + 6, 382, 44, 0xffe08a, 0.13);
        scene.lamps.push({ lamp, glow });
    }

    // The car, with its lights on the road ahead of it.
    scene.headlights = scene.add.triangle(0, 0, 0, 0, 150, -34, 150, 34, 0xffe9b0, 0.13);
    scene.car = scene.add.sprite(-120, 486, 'uber_car').setScale(2.2);
    scene.tweens.add({ targets: scene.car, y: 483, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    scene.add.text(400, 60, caption, {
        fontSize: '20px', color: '#fff', align: 'center', fontStyle: 'bold',
        backgroundColor: '#00000099', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(5);

    playSound('whoosh');
    scene.tweens.add({
        targets: scene.car, x: 920, duration: 4600, ease: 'Quad.easeInOut',
        onComplete: onArrive
    });
}

/** Per-frame scroll for the drive. Everything wraps rather than being respawned. */
export function driveOn(scene) {
    scene.farCity.tilePositionX += 0.4;
    scene.nearCity.tilePositionX += 1.1;

    scene.shopRow.forEach(shop => {
        shop.x -= 3.2;
        if (shop.x < -60) shop.x += 8 * 112;
    });
    scene.dashes.forEach(dash => {
        dash.x -= 11;
        if (dash.x < -50) dash.x += 10 * 90;
    });
    scene.lamps.forEach(({ lamp, glow }) => {
        lamp.x -= 6;
        glow.x = lamp.x + 6;
        if (lamp.x < -40) { lamp.x += 5 * 190; glow.x = lamp.x + 6; }
    });

    scene.headlights.x = scene.car.x + 34;
    scene.headlights.y = scene.car.y - 4;
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { REMOTE_IMAGES } from '../assets.js';
import { playRomanticTheme } from '../audio/music.js';
import { showDialogue } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { takePhoto } from '../ui/scrapbook.js';

/**
 * The courtyard behind the house on 54th Street: red-stained concrete gone
 * blotchy in the sun, the iron pergola with the vines up it, and the swing with
 * far too many cushions on it. The house itself is the one at the front — cream
 * stucco, barrel tile, solar on the garage roof — so the two read as the same
 * address from either side.
 */
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
        this.cameras.main.setBackgroundColor('#7ec0ee');
        this.buildSky();
        this.buildHouse();
        this.buildPatio();
        this.buildBoundary();
        this.buildPergola();
        this.buildPlanting();
        this.buildFamily();

        this.add.text(400, 26, "Their Beautiful Home", {
            fontSize: '20px', color: '#fff', backgroundColor: '#00000099',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(20);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.time.delayedCall(1000, () => this.tellIt());
    }

    /** Sky, and the neighbours' roofs over the back fence. */
    buildSky() {
        this.add.rectangle(400, 30, GAME_WIDTH, 60, 0x7ec0ee);
        this.add.rectangle(400, 14, GAME_WIDTH, 28, 0x6fb3e8);
        [[120, 18], [330, 12], [610, 20], [740, 15]].forEach(([cx, cy]) => {
            this.add.image(cx, cy, 'cloud').setScale(0.7).setAlpha(0.85);
        });
        // A neighbouring roofline, because no San Diego courtyard has sky all
        // the way down to the fence.
        this.add.rectangle(150, 48, 220, 22, 0xe2dbd0);
        for (let x = 44; x < 260; x += 32) this.add.image(x, 40, 'barrel_tile_roof');
        this.add.rectangle(690, 46, 200, 20, 0xe2dbd0);
        for (let x = 596; x < 800; x += 32) this.add.image(x, 38, 'barrel_tile_roof');
    }

    /** The back of the house along the top: stucco, tile, French doors. */
    buildHouse() {
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 2; y < 5; y++) this.add.image(x * 32 + 16, y * 32 + 26, 'stucco_wall');
        }
        for (let x = 0; x < GAME_WIDTH; x += 32) this.add.image(x + 16, 66, 'barrel_tile_roof');
        this.add.rectangle(400, 74, GAME_WIDTH, 3, 0xcfc6b4); // the eave line
        // Solar on the slope, the way it is out front.
        [96, 142, 188].forEach(x => this.add.image(x, 58, 'solar_panel').setAlpha(0.95));

        this.add.image(400, 128, 'french_doors');
        // Two steps down onto the concrete. The gap in the brick course for
        // the doors would otherwise show the camera background through it.
        this.add.image(400, 158, 'brick_step');
        this.add.image(400, 178, 'brick_step').setScale(2.4, 1.9);
        this.add.image(232, 124, 'large_window');
        this.add.image(600, 124, 'large_window');
        this.add.image(330, 120, 'wall_art').setScale(0.6).setTint(0xd8d1c5); // a sconce
        this.add.rectangle(400, 154, 120, 3, 0xd8d1c5);

        // The low brick wall that runs along the foot of the stucco.
        for (let x = 0; x < GAME_WIDTH; x += 32) {
            if (x > 336 && x < 464) continue; // the doors open onto the step
            this.add.image(x + 16, 178, 'brick_low_wall');
        }
    }

    /** Red concrete, laid so the variants do not repeat in a visible grid. */
    buildPatio() {
        const SLABS = ['patio_slab', 'patio_slab_worn', 'patio_slab_cracked'];
        for (let x = 0; x < GAME_WIDTH / 32; x++) {
            for (let y = 6; y < GAME_HEIGHT / 32; y++) {
                // Cracked is rare: at one tile in three the cracks tile into
                // a dashed line and stop reading as cracks at all.
                const pick = (x * 3 + y * 7) % 11 === 0 ? 2 : (x * 5 + y * 3) % 2;
                this.add.image(x * 32 + 16, y * 32 + 16, SLABS[pick]);
            }
        }
        // The pavers on the far side of the gate.
        for (let y = 6; y < GAME_HEIGHT / 32; y++) {
            for (let x = 724; x < GAME_WIDTH; x += 32) {
                this.add.image(x, y * 32 + 16, 'brick_pavers');
            }
        }
    }

    /**
     * Rendered walls down both sides with the brick foot running along them,
     * the lattice screen behind the seating, and the gate out to the side path.
     */
    buildBoundary() {
        this.fences = this.physics.add.staticGroup();
        const block = (x, y, w, h) => {
            const b = this.add.rectangle(x, y, w, h, 0, 0);
            this.physics.add.existing(b, true);
            this.fences.add(b);
        };
        [18, 700].forEach(wx => {
            for (let y = 6; y < GAME_HEIGHT / 32; y++) {
                this.add.image(wx, y * 32 + 16, 'stucco_wall').setDepth(3);
            }
            this.add.rectangle(wx, 400, 3, 420, 0xc9c2b6).setDepth(3); // the wall's near edge
        });
        block(14, 400, 36, 420);

        // The right-hand wall stops for the gate, which is how you get to the
        // pavers down the side.
        block(702, 180, 36, 220);
        block(702, 470, 36, 260);

        // Lattice along the top of the side wall, by the gate.
        for (let y = 196; y < 600; y += 44) this.add.image(700, y, 'lattice_fence').setDepth(3);
        this.add.image(702, 300, 'wood_gate').setDepth(5);

        this.add.rectangle(400, 596, GAME_WIDTH, 8, 0x8a4a39).setAlpha(0.35); // the far edge
    }

    /** The iron frame over the seating, with the vines up it. */
    buildPergola() {
        const LEFT = 250, RIGHT = 570, TOP = 216;
        // Span first, posts over it, so the uprights read as being in front.
        for (let x = LEFT; x < RIGHT; x += 64) {
            this.add.image(x + 32, TOP, 'pergola_arch').setDepth(6);
        }
        this.add.rectangle((LEFT + RIGHT) / 2, TOP + 26, RIGHT - LEFT, 2, 0x4a3b33).setAlpha(0.3).setDepth(5);

        [LEFT, RIGHT].forEach(x => {
            this.add.image(x, TOP + 60, 'pergola_post').setScale(1, 1.9).setDepth(7);
            this.add.image(x + 3, TOP + 60, 'climbing_vine').setScale(1, 1.9).setDepth(8);
        });

        // The swing under it, and what is sitting on the swing.
        this.swing = this.add.image(410, 272, 'porch_swing').setScale(1.5).setDepth(6);
        this.tweens.add({
            targets: this.swing, angle: 1.1, duration: 2600,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.add.image(320, 292, 'toadstool').setDepth(7);
        this.add.image(286, 300, 'gnome_house').setDepth(7);
    }

    /** Pots, barrels and the things growing out of them. */
    buildPlanting() {
        this.add.image(150, 330, 'barrel_planter').setDepth(6);
        this.add.image(150, 296, 'climbing_vine').setScale(0.8).setDepth(5);
        this.add.image(652, 336, 'agave_pot').setDepth(6);
        this.add.image(596, 300, 'plant_stand').setDepth(6);
        this.add.image(120, 210, 'agave_pot').setScale(0.8).setDepth(4);
        this.add.image(556, 196, 'planter_box').setDepth(4);
        this.add.image(88, 470, 'bush_detailed').setDepth(5);
        this.add.image(660, 520, 'bush_detailed').setDepth(5);
        this.add.image(64, 520, 'flower_red').setDepth(5);
        this.add.image(112, 546, 'flower_red').setDepth(5);
        this.add.image(620, 556, 'flower_red').setDepth(5);
        this.add.image(206, 190, 'pothos').setDepth(4);
        this.add.image(478, 190, 'plant_fern').setDepth(4);
        this.add.image(60, 186, 'plant_snake').setDepth(4);

        // Strung along the pergola, because of course they are.
        for (let x = 258; x < 580; x += 64) {
            this.add.image(x, 226, 'string_lights').setDepth(9).setAlpha(0.9);
        }
        this.add.image(648, 470, 'dog_bowls').setDepth(5);
        this.add.image(610, 500, 'pet_stone').setDepth(5);
    }

    /** Everybody who lives here, and everybody who has been adopted into it. */
    buildFamily() {
        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = new Player(this, 300, 430);
        this.player.setTexture(outfit).setDepth(10);
        this.physics.add.collider(this.player, this.fences);
        this.yvy = this.add.sprite(350, 430, 'yvy').setDepth(10);
        this.mom = this.add.sprite(408, 428, 'yvy_mom').setDepth(10);
        this.aiden = this.add.sprite(466, 436, 'aiden_older').setDepth(10);

        this.lychee = this.add.sprite(210, 380, 'lychee_custom').setDepth(9);
        this.lychee.setDisplaySize(24, 24);
        this.bojji = this.add.sprite(560, 400, 'bojji_custom').setDepth(9);
        this.bojji.setDisplaySize(48, 48);
        this.peaches = this.add.sprite(360, 490, 'peaches_custom').setDepth(11);
        this.peaches.setDisplaySize(32, 32);
        this.riot = this.add.sprite(200, 528, 'riot_custom').setDepth(9);
        this.riot.setDisplaySize(32, 32);
        this.beyonce = this.add.sprite(300, 552, 'beyonce_custom').setDepth(9);
        this.beyonce.setDisplaySize(32, 32);
        this.snow = this.add.sprite(500, 536, 'snow_custom').setDepth(9);
        this.snow.setDisplaySize(32, 32);

        this.tweens.add({
            targets: [this.riot, this.beyonce, this.snow], x: '+=20', y: '+=10',
            duration: 2000, yoyo: true, repeat: -1
        });
        this.tweens.add({ targets: this.bojji, x: '-=30', duration: 3000, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: this.peaches, x: 560, yoyo: true, repeat: -1, duration: 2000, flipX: true });
        this.tweens.add({ targets: this.aiden, y: 432, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: this.mom, y: 426, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    tellIt() {
        playRomanticTheme();
        const lines = [
            "Mike and Yvy bought a house and end up growing their family.",
            "They adopted Lychee the gray tabby, and Bojji the brown dog.",
            "Then came the chickens: Riot, Beyonce, and Snow.",
            "Yvy's mom got really ill and moved in with them. To ease the pain and because Yvy always wanted a Pomeranian, they adopted Peaches.",
            "Aiden grew up and is now 11. He's grown to love Mike and misses him when he travels to work.",
            "Aiden: 'I want to be like Mike when I grow up!'",
            "Aiden: 'Mike is PERFECT but mommy.. you're *IMPERFECTLY* PERFECT.'",
            "They have a beautiful home and as time passed, Mike, Yvy, and Aiden keep growing together as they learn to love every pixel of each other."
        ];
        let i = 0;
        const next = () => {
            if (i >= lines.length) {
                this.photographTheHousehold();
                return this.scene.start('PresentScene');
            }
            showDialogue(lines[i++], next);
        };
        next();
    }

    /**
     * Everybody who lives here, in the courtyard, in one frame. The animals are
     * the downloaded images rather than drawn sprites, so the album has to be
     * able to load them itself — PresentScene.preload does.
     */
    photographTheHousehold() {
        takePhoto({
            key: 'family', title: 'The whole household',
            caption: "A dog, a cat, a Pomeranian, three chickens and the three of them.",
            window: 0x7fa45c,
            sprites: [
                { rect: [180, 30], x: 0, y: -25, color: 0xe6d7bd },
                { rect: [180, 50], x: 0, y: 15, color: 0x7fa45c },
                { texture: 'fence_detailed', x: -62, y: -14 },
                { texture: 'fence_detailed', x: 62, y: -14 },
                { texture: this.player.texture.key, x: -28, y: 0 },
                { texture: 'yvy', x: -10, y: 0 },
                { texture: 'yvy_mom', x: 8, y: 0 },
                { texture: 'aiden_older', x: 26, y: 2 },
                { texture: 'bojji_custom', x: 52, y: 14, size: [26, 26] },
                { texture: 'lychee_custom', x: -52, y: 14, size: [18, 18] },
                { texture: 'peaches_custom', x: -34, y: 20, size: [20, 20] }
            ]
        });
    }

    update() { if (this.player && this.player.body) this.player.update(this.cursors); }
}

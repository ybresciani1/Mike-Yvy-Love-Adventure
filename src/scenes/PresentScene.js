import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playBlueTheme } from '../audio/music.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';
import { REMOTE_IMAGES } from '../assets.js';
import { getAlbum, photoCount, TOTAL_PHOTOS } from '../ui/scrapbook.js';

export class PresentScene extends Phaser.Scene {
    constructor() { super('PresentScene'); }

    // Penny appears in one of the photographs, and she is a remote image rather
    // than a generated texture — so this scene has to be able to load her too,
    // not rely on an earlier scene having done it.
    preload() { this.load.image('penny_custom', REMOTE_IMAGES.penny); }

    create() {
        this.cameras.main.setBackgroundColor('#1b2a49');
        playBlueTheme();
        this.buildBeach();

        const outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.player = this.add.sprite(362, 470, outfit).setDepth(6);
        this.yvy = this.add.sprite(400, 470, 'yvy').setDepth(6);
        this.aiden = this.add.sprite(438, 476, 'aiden_older').setDepth(6);
        [this.player, this.yvy, this.aiden].forEach((who, i) => this.tweens.add({
            targets: who, y: who.y - 2, duration: 1500 + i * 260,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        }));

        this.add.text(400, 40, "Present Day", {
            fontSize: '26px', color: '#fff', fontStyle: 'bold', backgroundColor: '#00000088',
            padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setDepth(8);

        this.time.addEvent({
            delay: 900, loop: true,
            callback: () => {
                const h = this.add.text(380 + Math.random() * 50, 460, "❤️", { fontSize: '18px' }).setDepth(7);
                this.tweens.add({ targets: h, y: 360, alpha: 0, duration: 2400, onComplete: () => h.destroy() });
            }
        });

        this.time.delayedCall(1400, () => {
            showDialogue("Mike: 'Every day with you feels like a dream.'", () => {
                showDialogue("Yvy: 'I love you more today than I did yesterday.'", () => {
                    showDialogue("Mike: 'And I'll love you even more tomorrow.'", () => {
                        showDialogue("They stand together, looking out at the sunset, hand in hand.", () => {
                            this.showAlbum();
                        });
                    });
                });
            });
        });
    }

    /**
     * The sunset used to be three coloured bars and a circle. It is the last
     * thing anyone sees, so it is drawn properly: banded sky, a sun sitting on
     * the horizon with its glare laid down the water, surf, wet sand, and the
     * pier they walk out on.
     */
    buildBeach() {
        // Eleven bands rather than three, so dusk actually graduates.
        [
            [0x2b2f63, 0, 46], [0x3d3a6e, 46, 34], [0x5b4478, 80, 30], [0x7d4f78, 110, 26],
            [0xa15f6e, 136, 24], [0xc27263, 160, 22], [0xdd8a5b, 182, 20], [0xefa55b, 202, 18],
            [0xf7bf6e, 220, 16], [0xfad189, 236, 14], [0xfbe0a6, 250, 12]
        ].forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));

        // Stars, thinning out towards the light.
        for (let i = 0; i < 60; i++) {
            const sy = Math.random() * 150;
            this.add.rectangle(Math.random() * GAME_WIDTH, sy, 2, 2, 0xffffff, 0.9 - sy / 170);
        }

        // The sun, half into the sea.
        this.add.circle(400, 262, 68, 0xffd27a, 0.18);
        this.add.circle(400, 262, 48, 0xffdf96, 0.35);
        this.add.circle(400, 262, 32, 0xfff0c4);

        // Sea, darker as it comes towards us.
        [[0xcf9a6a, 262, 10], [0x9a7f86, 272, 14], [0x6d6f8c, 286, 18],
         [0x4e5c84, 304, 20], [0x3a4a72, 324, 22], [0x2e3c60, 346, 22]]
            .forEach(([col, top, h]) => this.add.rectangle(400, top + h / 2, GAME_WIDTH, h, col));

        // The glare, widening as it reaches the shore.
        for (let i = 0; i < 12; i++) {
            const y = 268 + i * 8;
            this.add.rectangle(400, y, 14 + i * 9, 3, 0xffe3ab, 0.5 - i * 0.03);
        }
        // Chop either side of it.
        for (let i = 0; i < 40; i++) {
            const wy = 272 + Math.random() * 84;
            const wx = Math.random() * GAME_WIDTH;
            if (Math.abs(wx - 400) < 40) continue;
            this.add.rectangle(wx, wy, 6 + Math.random() * 10, 2, 0x8f9fc4, 0.35);
        }

        // Surf and wet sand.
        this.add.rectangle(400, 372, GAME_WIDTH, 10, 0xe8e2d6, 0.75);
        this.add.rectangle(400, 378, GAME_WIDTH, 6, 0xf6f2e6, 0.5);
        this.add.rectangle(400, 396, GAME_WIDTH, 30, 0xa88d6a); // wet sand, still dark
        this.add.rectangle(400, 384, GAME_WIDTH, 6, 0xbfa47c);
        this.add.rectangle(400, 500, GAME_WIDTH, 180, 0xc9ab80); // dry sand
        for (let i = 0; i < 90; i++) {
            this.add.rectangle(Math.random() * GAME_WIDTH, 412 + Math.random() * 180, 2, 2,
                Math.random() > 0.5 ? 0xd8bd94 : 0xb8996f);
        }

        // The pier, off to one side, with its lamps already on.
        for (let px = 560; px < 820; px += 28) {
            this.add.rectangle(px, 356, 8, 46, 0x4a3a2e);
            this.add.rectangle(px, 356, 3, 46, 0x5c4a3a);
        }
        this.add.rectangle(690, 332, 280, 10, 0x6b5342);
        this.add.rectangle(690, 328, 280, 4, 0x8a6d56);
        for (let lx = 580; lx < 810; lx += 56) {
            this.add.rectangle(lx, 318, 3, 14, 0x3f3228);
            this.add.circle(lx, 310, 4, 0xffe08a);
            this.add.circle(lx, 310, 7, 0xffe08a, 0.25);
        }

        // A couple of gulls, because it is San Diego.
        for (let i = 0; i < 3; i++) {
            const bird = this.add.text(120 + i * 90, 120 + i * 26, "⁀", {
                fontSize: '14px', color: '#f0e6d2'
            }).setAlpha(0.7);
            this.tweens.add({
                targets: bird, x: '+=' + (90 + i * 40), y: '-=' + (10 + i * 6),
                duration: 9000 + i * 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        }
    }

    /**
     * The payoff. Every photograph they took on the way here, laid out as a
     * spread, with the ones they never took left as empty frames — so it is
     * obvious there was more to find.
     */
    showAlbum() {
        const shade = this.add.rectangle(400, 300, GAME_WIDTH, GAME_HEIGHT, 0x10182e, 0)
            .setDepth(10);
        this.tweens.add({ targets: shade, fillAlpha: 0.88, duration: 700 });

        this.time.delayedCall(760, () => {
            playSound('page');
            const page = this.add.container(400, 300).setDepth(11).setAlpha(0);
            page.add(this.add.rectangle(0, 0, 700, 440, 0x2a2038));
            page.add(this.add.rectangle(0, 0, 688, 428, 0x3a2e48));
            page.add(this.add.text(0, -190, "Their Photographs", {
                fontSize: '22px', color: '#f6e7c8', fontStyle: 'bold'
            }).setOrigin(0.5));
            page.add(this.add.text(0, -162, photoCount() + " of " + TOTAL_PHOTOS + " kept", {
                fontSize: '12px', color: '#c0a888'
            }).setOrigin(0.5));

            const photos = getAlbum();
            for (let i = 0; i < TOTAL_PHOTOS; i++) {
                const col = i % 4, row = Math.floor(i / 4);
                const fx = -258 + col * 172;
                const fy = -80 + row * 178;
                page.add(this.buildFrame(fx, fy, photos[i]));
            }

            page.add(this.add.text(0, 196, "SPACE", {
                fontSize: '12px', color: '#8a7a94'
            }).setOrigin(0.5));

            this.tweens.add({ targets: page, alpha: 1, y: 296, duration: 700, ease: 'Sine.easeOut' });

            this.input.keyboard.once('keydown-SPACE', () => {
                playSound('page');
                showDialogue("Their story continues, building a life full of love, laughter, and endless adventure.", () => {
                    showDialogue("❤️ THE END ❤️", () => {});
                });
            });
        });
    }

    /** One polaroid: mount, window, the sprites of the moment, and a caption. */
    buildFrame(x, y, photo) {
        const frame = this.add.container(x, y);
        frame.add(this.add.rectangle(0, 0, 150, 156, photo ? 0xf4efe2 : 0x33283f));
        frame.add(this.add.rectangle(0, -32, 134, 82, photo ? 0x24303f : 0x2b2136));

        if (!photo) {
            frame.add(this.add.text(0, -32, "?", {
                fontSize: '26px', color: '#4e4060', fontStyle: 'bold'
            }).setOrigin(0.5));
            frame.add(this.add.text(0, 40, "not taken", {
                fontSize: '10px', color: '#4e4060'
            }).setOrigin(0.5));
            return frame;
        }

        // No mask on the window. A geometry mask lives in world space, so one
        // built from these container-local coordinates hides the picture
        // somewhere off in the corner of the screen instead of cropping it —
        // which is exactly what the first version did. The sprites are small
        // enough to sit inside the mount on their own.
        photo.sprites.forEach(s => {
            const img = this.add.image(s.x, -32 + (s.y || 0), s.texture);
            if (s.scale) img.setScale(s.scale);
            if (s.size) img.setDisplaySize(s.size[0], s.size[1]);
            if (s.flip) img.setFlipX(true);
            if (s.tint) img.setTint(s.tint);
            frame.add(img);
        });

        frame.add(this.add.text(0, 26, photo.title, {
            fontSize: '11px', color: '#2b2038', fontStyle: 'bold',
            wordWrap: { width: 138 }, align: 'center'
        }).setOrigin(0.5));
        frame.add(this.add.text(0, 54, photo.caption, {
            fontSize: '9px', color: '#6b5a4a', wordWrap: { width: 138 }, align: 'center'
        }).setOrigin(0.5));
        return frame;
    }
}

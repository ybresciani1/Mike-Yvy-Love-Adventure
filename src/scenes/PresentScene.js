import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playBlueTheme } from '../audio/music.js';
import { playSound } from '../audio/sfx.js';
import { showDialogue } from '../ui/dialogue.js';
import { REMOTE_IMAGES } from '../assets.js';
import { getAlbum, photoCount, takePhoto, TOTAL_PHOTOS, PHOTOS_PER_PAGE } from '../ui/scrapbook.js';

export class PresentScene extends Phaser.Scene {
    constructor() { super('PresentScene'); }

    // Penny and the rest of the animals appear in the photographs, and they are
    // remote images rather than generated textures — so this scene has to be
    // able to load them too, not rely on an earlier scene having done it.
    preload() {
        this.load.image('penny_custom', REMOTE_IMAGES.penny);
        this.load.image('bojji_custom', REMOTE_IMAGES.bojji);
        this.load.image('lychee_custom', REMOTE_IMAGES.lychee);
        this.load.image('peaches_custom', REMOTE_IMAGES.peaches);
    }

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
                            this.photographTheSunset();
                            showDialogue("Aiden took the picture. It is the last one in the book.", () => {
                                this.showAlbum();
                            });
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
     * The one picture nobody in the story had to go looking for. It is drawn
     * from bands and circles rather than sprites, because the sunset itself is
     * scenery — there is no texture to stand in for it.
     */
    photographTheSunset() {
        takePhoto({
            key: 'sunset', title: 'Present day',
            caption: "The three of them, the water, and the end of an ordinary evening.",
            window: 0x2b2f63,
            sprites: [
                { rect: [180, 16], x: 0, y: -32, color: 0x3d3a6e },
                { rect: [180, 10], x: 0, y: -20, color: 0x7d4f78 },
                { rect: [180, 8], x: 0, y: -12, color: 0xc27263 },
                { rect: [180, 6], x: 0, y: -5, color: 0xefa55b },
                { circle: 15, x: 0, y: 0, color: 0xffd27a, alpha: 0.3 },
                { circle: 9, x: 0, y: 0, color: 0xfff0c4 },
                { rect: [180, 6], x: 0, y: 4, color: 0x6d6f8c },
                { rect: [180, 8], x: 0, y: 11, color: 0x3a4a72 },
                { rect: [10, 12], x: 0, y: 8, color: 0xffe3ab, alpha: 0.45 },
                { rect: [180, 4], x: 0, y: 18, color: 0xe8e2d6, alpha: 0.8 },
                { rect: [180, 8], x: 0, y: 24, color: 0xa88d6a },
                { rect: [180, 14], x: 0, y: 34, color: 0xc9ab80 },
                { texture: this.player.texture.key, x: -20, y: 14, scale: 0.8 },
                { texture: 'yvy', x: 0, y: 14, scale: 0.8 },
                { texture: 'aiden_older', x: 20, y: 16, scale: 0.8 }
            ]
        });
    }

    /**
     * The payoff. Every photograph they took on the way here, laid out six to a
     * page, with the ones they never took left as empty frames — so it is
     * obvious there was more to find. Arrow keys turn the pages; SPACE walks
     * forward through them and closes the book on the last one.
     */
    showAlbum() {
        const shade = this.add.rectangle(400, 300, GAME_WIDTH, GAME_HEIGHT, 0x10182e, 0)
            .setDepth(10);
        this.tweens.add({ targets: shade, fillAlpha: 0.88, duration: 700 });

        this.time.delayedCall(760, () => {
            playSound('page');
            this.photos = getAlbum();
            this.pageIndex = 0;
            this.pageCount = Math.ceil(TOTAL_PHOTOS / PHOTOS_PER_PAGE);

            const book = this.add.container(400, 300).setDepth(11).setAlpha(0);
            book.add(this.add.rectangle(0, 0, 756, 424, 0x2a2038));
            book.add(this.add.rectangle(0, 0, 744, 412, 0x3a2e48));
            book.add(this.add.text(0, -186, "Their Photographs", {
                fontSize: '22px', color: '#f6e7c8', fontStyle: 'bold'
            }).setOrigin(0.5));
            book.add(this.add.text(0, -162, photoCount() + " of " + TOTAL_PHOTOS + " kept", {
                fontSize: '12px', color: '#c0a888'
            }).setOrigin(0.5));

            // The leaf that changes. Everything else on the spread stays put, so
            // only this gets torn down and rebuilt on a turn.
            this.leaf = this.add.container(0, 0);
            book.add(this.leaf);

            this.footer = this.add.text(0, 188, "", {
                fontSize: '12px', color: '#8a7a94'
            }).setOrigin(0.5);
            book.add(this.footer);

            this.prevArrow = this.buildArrow(-352, -1);
            this.nextArrow = this.buildArrow(352, 1);
            book.add([this.prevArrow, this.nextArrow]);

            this.drawPage();
            // Settles higher than the middle of the screen: the dialogue box that
            // carries the last two lines covers everything below y=439, and the
            // bottom row of captions has to clear it.
            this.tweens.add({ targets: book, alpha: 1, y: 268, duration: 700, ease: 'Sine.easeOut' });

            const onLeft = () => this.turnPage(-1);
            const onRight = () => this.turnPage(1);
            const onSpace = () => {
                if (this.pageIndex < this.pageCount - 1) return this.turnPage(1);
                this.input.keyboard.off('keydown-LEFT', onLeft);
                this.input.keyboard.off('keydown-RIGHT', onRight);
                this.input.keyboard.off('keydown-SPACE', onSpace);
                this.closeAlbum();
            };
            this.input.keyboard.on('keydown-LEFT', onLeft);
            this.input.keyboard.on('keydown-RIGHT', onRight);
            this.input.keyboard.on('keydown-SPACE', onSpace);
        });
    }

    /** A chevron in the margin, for turning the page with the mouse. */
    buildArrow(x, dir) {
        const arrow = this.add.container(x, -6);
        // The glyph on its own is a thin thing to hit, so the hit area is a
        // proper strip down the margin with the chevron centred in it.
        arrow.add(this.add.rectangle(0, 0, 44, 300, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.turnPage(dir)));
        arrow.add(this.add.text(0, 0, dir > 0 ? "▶" : "◀", {
            fontSize: '20px', color: '#c0a888'
        }).setOrigin(0.5));
        return arrow;
    }

    /** Six frames, two rows of three, filled from the start of the album. */
    drawPage() {
        this.leaf.removeAll(true);
        const first = this.pageIndex * PHOTOS_PER_PAGE;
        for (let slot = 0; slot < PHOTOS_PER_PAGE; slot++) {
            const col = slot % 3;
            const row = Math.floor(slot / 3);
            this.leaf.add(this.buildFrame((col - 1) * 232, -70 + row * 164, this.photos[first + slot]));
        }
        this.footer.setText(
            "Page " + (this.pageIndex + 1) + " of " + this.pageCount +
            "      ← →  turn the page      SPACE  " +
            (this.pageIndex < this.pageCount - 1 ? "next" : "the end")
        );
        this.prevArrow.setAlpha(this.pageIndex > 0 ? 1 : 0.15);
        this.nextArrow.setAlpha(this.pageIndex < this.pageCount - 1 ? 1 : 0.15);
    }

    /** One turn: the leaf lifts away and the next one settles in behind it. */
    turnPage(dir) {
        const next = this.pageIndex + dir;
        // The arrows keep their hit areas after the book closes, invisible in
        // the margins, so the closed flag is what stops a stray click turning a
        // page behind the last two lines.
        if (this.albumClosed || this.turning || next < 0 || next >= this.pageCount) return;
        this.turning = true;
        playSound('page');
        this.tweens.add({
            targets: this.leaf, alpha: 0, x: -dir * 70, duration: 180, ease: 'Sine.easeIn',
            onComplete: () => {
                this.pageIndex = next;
                this.drawPage();
                this.leaf.x = dir * 70;
                this.tweens.add({
                    targets: this.leaf, alpha: 1, x: 0, duration: 240, ease: 'Sine.easeOut',
                    onComplete: () => { this.turning = false; }
                });
            }
        });
    }

    /** The book stays open behind the last two lines, minus its controls. */
    closeAlbum() {
        this.albumClosed = true;
        playSound('page');
        this.tweens.add({ targets: [this.prevArrow, this.nextArrow], alpha: 0, duration: 400 });
        this.footer.setText("");
        showDialogue("Their story continues, building a life full of love, laughter, and endless adventure.", () => {
            showDialogue("❤️ THE END ❤️", () => {});
        });
    }

    /** One polaroid: mount, window, the sprites of the moment, and a caption. */
    buildFrame(x, y, photo) {
        const frame = this.add.container(x, y);
        frame.add(this.add.rectangle(0, 0, 196, 150, photo ? 0xf4efe2 : 0x33283f));
        frame.add(this.add.rectangle(0, -28, 180, 80, photo ? (photo.window || 0x24303f) : 0x2b2136));

        if (!photo) {
            frame.add(this.add.text(0, -28, "?", {
                fontSize: '26px', color: '#4e4060', fontStyle: 'bold'
            }).setOrigin(0.5));
            frame.add(this.add.text(0, 32, "not taken", {
                fontSize: '10px', color: '#4e4060'
            }).setOrigin(0.5));
            return frame;
        }

        // No mask on the window. A geometry mask lives in world space, so one
        // built from these container-local coordinates hides the picture
        // somewhere off in the corner of the screen instead of cropping it —
        // which is exactly what the first version did. Everything drawn here is
        // kept small enough to sit inside the mount on its own.
        photo.sprites.forEach(s => {
            const cy = -28 + (s.y || 0);
            let obj;
            if (s.rect) {
                obj = this.add.rectangle(s.x, cy, s.rect[0], s.rect[1], s.color, s.alpha ?? 1);
            } else if (s.circle) {
                obj = this.add.circle(s.x, cy, s.circle, s.color, s.alpha ?? 1);
            } else {
                obj = this.add.image(s.x, cy, s.texture);
                if (s.scale) obj.setScale(s.scale);
                if (s.size) obj.setDisplaySize(s.size[0], s.size[1]);
                if (s.flip) obj.setFlipX(true);
                if (s.tint) obj.setTint(s.tint);
            }
            frame.add(obj);
        });

        frame.add(this.add.text(0, 24, photo.title, {
            fontSize: '12px', color: '#2b2038', fontStyle: 'bold',
            wordWrap: { width: 184 }, align: 'center'
        }).setOrigin(0.5));
        frame.add(this.add.text(0, 48, photo.caption, {
            fontSize: '9px', color: '#6b5a4a', wordWrap: { width: 184 }, align: 'center'
        }).setOrigin(0.5));
        return frame;
    }
}

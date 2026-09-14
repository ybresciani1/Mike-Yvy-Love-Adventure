import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playSound } from '../audio/sfx.js';
import { stopMusic, playLeFestinTheme } from '../audio/music.js';
import { showDialogue, dialogueBusy } from '../ui/dialogue.js';
import { Player } from '../entities/Player.js';
import { actionLabel, promptFontSize } from '../ui/touch.js';

/**
 * Raised by Wolves, in an outdoor mall: a blue shopfront with stone wolves at
 * the door, and a shop inside that looks like a very expensive liquor store.
 * The host sits you in two armchairs by a cold fireplace — and then the whole
 * wall turns round and takes you into the bar.
 *
 * Outside and inside are two containers in one scene; walking through the door
 * swaps them. The fireplace nook is its own container built around its centre,
 * so it can swing on a pivot, and the side that comes round is a second one.
 */
export class RaisedByWolvesScene extends Phaser.Scene {
    constructor() { super('RaisedByWolvesScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#d8d0c0');
        this.outfit = this.game.registry.get('playerOutfit') || 'mike_suit';
        this.stage = 'outside';
        this.zones = [];

        this.outside = this.add.container(0, 0);
        this.buildOutside();
        this.inside = this.add.container(0, 0).setVisible(false);
        this.buildInside();

        this.player = new Player(this, 300, 540);
        this.player.setTexture(this.outfit).setDepth(20);
        // Yvy is a plain sprite so she can be tweened: an arcade body writes its
        // own position back every step and quietly undoes a tween.
        this.yvy = this.add.sprite(470, 400, 'yvy_red').setDepth(20);

        this.outsideWall = this.solid(400, 170, GAME_WIDTH, 340);
        // Everything inside is solid only once you are inside.
        this.insideSolids = [
            this.solid(400, 118, GAME_WIDTH, 236), // the back wall
            this.solid(140, 332, 184, 40), // the long counter
            this.solid(507, 494, 146, 44), // the two cabinets out on the floor
            this.solid(624, 504, 50, 36), // the round case
            this.solid(720, 500, 70, 40) // the hutch
        ];
        this.insideSolids.forEach(b => { b.body.enable = false; });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Zones are gated on which room is showing, so the door and the host can
        // share screen space without sharing a keypress.
        this.zone(470, 414, 76, 60, () => this.stage === 'outside' && !this.met, () => this.meetYvy());
        this.zone(400, 356, 110, 34, () => this.stage === 'outside' && this.met, () => this.goInside());
        this.zone(300, 380, 96, 56, () => this.stage === 'inside', () => this.talkToHost());
        this.buildOutsideTalk();
        this.buildLookingAround();
        this.buildCrowd();

        this.instructionText = this.add.text(20, 560, `Meet Yvy (${actionLabel()})`, {
            fontSize: promptFontSize('15px'), color: '#fff', backgroundColor: '#00000099', padding: { x: 6, y: 3 }
        }).setDepth(40).setScrollFactor(0);

        stopMusic();
        playLeFestinTheme();
        // Nothing can be started until the opening line has been read: the line
        // is scheduled, so a quick player could otherwise reach Yvy first and
        // have the scene set after they have already said hello.
        this.busy = true;
        this.time.delayedCall(700, () => this.narrate(
            ["Back in San Diego, Mike met Yvy at Raised by Wolves: a blue shopfront in an outdoor mall, with two stone wolves at the door."],
            () => { this.busy = false; }
        ));
    }

    // --- helpers ----------------------------------------------------------------

    R(c, x, y, w, h, color, alpha = 1) {
        const r = this.add.rectangle(x, y, w, h, color, alpha);
        c.add(r);
        return r;
    }

    I(c, x, y, key, scale = 1) {
        const i = this.add.image(x, y, key).setScale(scale);
        c.add(i);
        return i;
    }

    T(c, x, y, text, style) {
        const t = this.add.text(x, y, text, style).setOrigin(0.5);
        c.add(t);
        return t;
    }

    solid(x, y, w, h) {
        const b = this.add.rectangle(x, y, w, h, 0, 0);
        this.physics.add.existing(b, true);
        this.physics.add.collider(this.player, b);
        return b;
    }

    zone(x, y, w, h, when, act) {
        const z = this.add.rectangle(x, y, w, h, 0xffff00, 0);
        this.physics.add.existing(z, true);
        this.physics.add.overlap(this.player, z, () => {
            if (when() && !this.busy && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) act();
        });
        this.zones.push({ z, when });
        return z;
    }

    /** Dialogue fired from a timer has to survive a box that is already open. */
    saySoon(text, next) {
        if (!showDialogue(text, next)) this.time.delayedCall(350, () => this.saySoon(text, next));
    }

    /** A conversation the first time, and one line after that. */
    chat(lines, again) {
        let told = false;
        return () => {
            if (told) return showDialogue(again);
            told = true;
            this.narrate(lines, () => {});
        };
    }

    /**
     * A group of people sharing one zone, and whoever is nearest answers. Given
     * a zone each they would sit closer together than he is wide, and two zones
     * he can touch at once share one keypress.
     */
    crowdZone(x, y, w, h, when, people) {
        const distance = p => Math.abs(p.sprite.x - this.player.x) + Math.abs(p.sprite.y - this.player.y);
        this.zone(x, y, w, h, when, () => {
            people.reduce((a, b) => (distance(a) <= distance(b) ? a : b)).talk();
        });
    }

    narrate(lines, done) {
        let i = 0;
        const next = () => (i >= lines.length ? done() : this.saySoon(lines[i++], next));
        next();
    }

    /** Walk him somewhere. A tween on an arcade body's x/y is undone by the body. */
    stepTo(x, y, duration) {
        const fromX = this.player.x, fromY = this.player.y;
        const c = { t: 0 };
        this.tweens.add({
            targets: c, t: 1, duration, ease: 'Sine.easeInOut',
            onUpdate: () => this.player.body.reset(
                Phaser.Math.Linear(fromX, x, c.t),
                Phaser.Math.Linear(fromY, y, c.t)
            )
        });
    }

    // --- outside: the shopfront in the outdoor mall ----------------------------

    buildOutside() {
        const c = this.outside;
        this.R(c, 400, 170, GAME_WIDTH, 340, 0xd8d0c0); // the mall's limestone
        for (let y = 14; y < 340; y += 26) this.R(c, 400, y, GAME_WIDTH, 1, 0xc6bdaa);
        for (let x = 0; x < GAME_WIDTH; x += 64) this.R(c, x, 170, 1, 340, 0xcbc2b0);

        // The shopfront: deep blue and panelled, the name cut into marble.
        this.R(c, 400, 190, 700, 300, 0x1f2d5c);
        this.R(c, 400, 190, 686, 286, 0x26386e);
        this.R(c, 400, 62, 460, 64, 0x1a2650);
        this.R(c, 400, 62, 444, 50, 0xeceff1);
        [[210, 44, 60], [300, 72, 44], [420, 50, 70], [520, 76, 38], [590, 46, 30]].forEach(([vx, vy, vw]) => {
            this.R(c, vx, vy, vw, 1, 0xc3c9cf);
        });
        this.T(c, 400, 62, 'RAISED BY WOLVES', {
            fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '26px', color: '#1b1f2a'
        });
        this.I(c, 400, 116, 'wolf_relief', 2.1);
        [215, 585].forEach(x => {
            this.R(c, x, 116, 118, 30, 0x1a2650);
            this.R(c, x, 116, 108, 22, 0x2e4178);
        });

        this.I(c, 215, 252, 'leaded_window', 1.2);
        this.I(c, 585, 252, 'leaded_window', 1.2);
        this.I(c, 100, 250, 'wolf_oval_window', 1.3).setFlipX(true);
        this.I(c, 700, 250, 'wolf_oval_window', 1.3);

        // The doors, thrown open, and the shop you can see through them.
        this.R(c, 400, 258, 136, 164, 0x111317);
        for (let tx = 340; tx < 464; tx += 16) {
            for (let ty = 300; ty < 340; ty += 16) this.I(c, tx, ty, 'bw_marble_tile', 0.5);
        }
        this.I(c, 358, 236, 'liquor_cabinet', 0.75).setTint(0xb8b0a8);
        this.I(c, 442, 236, 'liquor_cabinet', 0.75).setTint(0xb8b0a8);
        this.I(c, 400, 230, 'liquor_cabinet', 0.9);
        [326, 474].forEach(x => {
            this.R(c, x, 258, 18, 164, 0xc9a86a);
            this.R(c, x, 258, 10, 152, 0x9fb4c0);
        });

        // Lanterns between the doors and the windows.
        [288, 512].forEach(x => {
            c.add(this.add.circle(x, 196, 26, 0xffd27a, 0.18));
            this.I(c, x, 196, 'wall_lantern', 1.4);
        });

        // The walkway, then the step and the wolves sitting on it.
        for (let y = 356; y < GAME_HEIGHT + 16; y += 32) {
            for (let x = 16; x < GAME_WIDTH + 16; x += 32) this.I(c, x, y, 'sidewalk_slab');
        }
        this.R(c, 400, 344, GAME_WIDTH, 8, 0x9c9486);
        this.R(c, 400, 340, 150, 10, 0x2b2b30);
        this.T(c, 400, 340, 'RAISED BY WOLVES', { fontFamily: 'Georgia, serif', fontSize: '7px', color: '#d6d6d6' });
        this.I(c, 316, 322, 'wolf_statue', 1.4);
        this.I(c, 484, 322, 'wolf_statue', 1.4).setFlipX(true);
        this.I(c, 50, 480, 'palm_tree', 0.9);
        this.I(c, 752, 486, 'palm_tree', 0.85).setFlipX(true);

        // It is busy: a few people waiting to get in, happy to talk while they do.
        this.queue = [
            [252, 384, 'civilian_f', 0xe0c8d8, "Patron: 'We've been out here twenty minutes. Worth it, apparently.'", "Patron: 'Any minute now.'"],
            [224, 392, 'civilian', 0xc8d8b8, "Patron: 'My cousin says it's a liquor store. My other cousin says it's a bar. They're both very sure.'", "Patron: 'I'm on the bar side.'"],
            [196, 386, 'civilian', 0xd0d0e8, "Patron: 'The wolves out front are the only ones who don't have to wait.'", "Patron: 'Lucky wolves.'"],
            [168, 392, 'civilian_f', 0xe8d8b8, "Patron: 'I'm mostly here for a picture with the statues. Don't tell my friends.'", "Patron: 'Okay, and maybe one drink.'"],
            [566, 390, 'civilian', 0xc0b8d0, "Patron: 'She said dress nice. I said it's a liquor store. I lost that one.'", "Patron: 'She was right. Look at everybody.'"],
            [594, 384, 'civilian_f', 0xd8e0e8, "Patron: 'The doors are wide open and they still make you wait. That's how you know it's good.'", "Patron: 'That's the rule.'"]
        ].map(([x, y, key, tint, line, again], i) => {
            const waiting = this.add.sprite(x, y, key).setTint(tint).setFlipX(i % 2 === 0);
            c.add(waiting);
            this.tweens.add({ targets: waiting, y: y - 2, duration: 1100 + i * 170, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            return { sprite: waiting, talk: this.chat([line], again) };
        });
        // Shoppers going by.
        this.walkers = [
            [-40, 840, 578, 'civilian', 0xb8c8d8, 14000, "Shopper: 'Every time I walk past there's a line. For a liquor store.'", "Shopper: 'Still a line.'"],
            [840, -40, 596, 'civilian_f', 0xd8c0b0, 17000, "Shopper: 'Is that the place with the secret room? Nobody will tell me how you get in.'", "Shopper: 'Somebody knows.'"]
        ].map(([x0, x1, y, key, tint, duration, line, again]) => {
            const shopper = this.add.sprite(x0, y, key).setTint(tint).setFlipX(x1 < x0);
            c.add(shopper);
            this.tweens.add({ targets: shopper, x: x1, duration, repeat: -1, delay: 1200 });
            return { sprite: shopper, talk: this.chat([line], again) };
        });
    }

    /**
     * Talking outside: the queue either side of the door and the two stone
     * wolves on the step. Zones, all further apart than he is wide: the left of
     * the queue at x 150-262, the wolves at 286-326 and 474-514 either side of
     * the door's 345-455, the right of the queue at 545-615; the wolves' run
     * y 343-365, clear of Yvy's from 384. The shoppers are moving, so update()
     * finds them by distance instead.
     */
    buildOutsideTalk() {
        const outside = () => this.stage === 'outside';
        this.crowdZone(206, 396, 112, 48, outside, this.queue.slice(0, 4));
        this.crowdZone(580, 396, 70, 48, outside, this.queue.slice(4));
        this.zone(306, 354, 40, 22, outside, this.chat([
            "A stone wolf sits on the step, chin up, watching the door like it's the one checking names.",
            "Mike: 'Good boy.'"
        ], "The wolf is still watching the door."));
        this.zone(494, 354, 40, 22, outside, this.chat([
            "Its twin sits on the other side of the door, mid-howl. Somebody has tucked a cocktail napkin under its paw.",
            "Mike: 'Somebody's already had a good night.'"
        ], "Still howling. Still holding the napkin."));
    }

    /**
     * Looking round the shop before the host seats them: the counter, the
     * bottles, the cases and the cabinets. Each zone sits in front of the thing
     * it describes; the numbers that keep them clear of the crowd and the host
     * are in buildCrowd.
     */
    buildLookingAround() {
        const inside = () => this.stage === 'inside';
        [
            [140, 362, 184, 20, [
                "Gold shelves of bottles behind a long oak counter, with a brass till and a rotary phone sat on top.",
                "Mike: 'Nobody's behind the counter. I don't think anybody has ever been behind the counter.'"
            ], "The till looks like it has never once been opened."],
            [240, 262, 150, 40, [
                "Bottles behind glass, lit like jewellery. Nobody seems to be buying any.",
                "Yvy: 'Are they even allowed to open those?'"
            ], "The bottles glow. Nobody buys one."],
            [515, 270, 50, 40, [
                "A glass case under the carved mirror: crystal decanters, each one with its own little lock.",
                "Yvy: 'Who locks a decanter?'",
                "Mike: 'Somebody who really likes that decanter.'"
            ], "Locked. Every one of them."],
            [507, 456, 140, 24, [
                "Two carved wooden cabinets out on the floor, glass doors, the bottles stood in rows like books in a library.",
                "Mike: 'Every one of these has a price tag, and I haven't seen anybody pick one up.'"
            ], "Price tags on every bottle. Still nobody picks one up."],
            [624, 470, 56, 20, [
                "A round glass case with a single bottle inside, standing on its own under a little light.",
                "Yvy: 'That one's not for drinking. That one's for looking at.'"
            ], "One bottle, one light, and nobody touching it."],
            [720, 462, 70, 24, [
                "A tall wooden hutch stacked with amber bottles, and every stopper is a little gold wolf's head.",
                "Yvy: 'I want one of those stoppers.'"
            ], "Gold wolves on every stopper."]
        ].forEach(([x, y, w, h, lines, again]) => this.zone(x, y, w, h, inside, this.chat(lines, again)));
    }

    // --- inside: the liquor store that isn't ----------------------------------

    buildInside() {
        const c = this.inside;
        // The painted landscape all the way round, above wooden panelling.
        this.R(c, 400, 118, GAME_WIDTH, 236, 0xcfd9cf);
        [120, 360, 600].forEach(x => this.I(c, x, 112, 'landscape_mural', 2));
        this.R(c, 400, 12, GAME_WIDTH, 24, 0xf2efe6); // cornice
        for (let x = 4; x < GAME_WIDTH; x += 8) this.R(c, x, 22, 4, 4, 0xdcd6c8);
        this.R(c, 400, 212, GAME_WIDTH, 48, 0x7a5232);
        this.R(c, 400, 190, GAME_WIDTH, 3, 0xf2efe6);
        for (let x = 16; x < GAME_WIDTH; x += 56) this.R(c, x + 12, 214, 40, 34, 0x8a6240);
        this.I(c, 270, 34, 'lantern_chandelier', 1.3);
        c.add(this.add.circle(270, 52, 42, 0xffc46a, 0.12));

        // Plaster pilasters dividing the wall into bays, globe lamps on them.
        [12, 184, 356, 528].forEach(x => this.I(c, x, 118, 'plaster_pilaster', 1.6));
        [184, 356].forEach(x => {
            c.add(this.add.circle(x - 22, 64, 12, 0xfff3c4, 0.25));
            this.I(c, x - 22, 70, 'globe_sconce', 1.2);
        });

        // Bay one: bottles on gold shelves over wooden cupboards.
        this.I(c, 98, 150, 'gold_shelf_wall', 1.4);
        // Bay two: a hanging glass cabinet between two carved niches, one bottle each.
        this.I(c, 270, 96, 'wall_bottle_cabinet', 1.6);
        this.I(c, 218, 118, 'bottle_niche', 1.3);
        this.I(c, 322, 118, 'bottle_niche', 1.3);
        // Bay three: the carved mirror with the gold wolf, a velvet bench, a case.
        this.I(c, 442, 112, 'oval_mirror_frame', 1.5);
        this.I(c, 418, 222, 'velvet_bench', 1.2);
        this.I(c, 492, 222, 'glass_display_cabinet', 1.1);

        // Black and white marble, and the name set into it at the door.
        for (let y = 252; y < GAME_HEIGHT + 16; y += 32) {
            for (let x = 16; x < GAME_WIDTH + 16; x += 32) this.I(c, x, y, 'bw_marble_tile');
        }
        this.R(c, 400, 566, 190, 36, 0xeceff1);
        this.T(c, 400, 566, 'RAISED BY WOLVES', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#6a6a72' });

        // The long oak counter with the till and the telephone on it.
        this.I(c, 140, 330, 'shop_counter', 1.5);
        this.I(c, 170, 298, 'cash_register', 1.3);
        this.I(c, 88, 304, 'rotary_phone', 1.2);
        // Cabinets and cases out on the floor.
        this.I(c, 470, 460, 'liquor_cabinet', 1.2);
        this.I(c, 544, 460, 'liquor_cabinet', 1.2);
        this.I(c, 624, 480, 'display_case_round', 1.3);
        this.I(c, 720, 470, 'bottle_hutch', 1.4);
        this.I(c, 770, 556, 'egyptian_chair', 1.2);

        this.host = this.add.sprite(300, 346, 'host');
        c.add(this.host);
        this.I(c, 300, 372, 'host_stand', 1.2);

        this.nook = this.buildNook(false);
        this.barSide = this.buildNook(true).setScale(0, 1).setVisible(false);
        c.add(this.nook);
        c.add(this.barSide);
    }

    /**
     * It is busy - it always is. People browsing every bay and a couple waiting
     * on the host, and every one of them will talk. They stand in twos and
     * threes, so each group shares a zone and the nearest answers.
     *
     * Every zone inside, kept further apart than he is wide wherever two could
     * be reached at once, since overlapping zones share one keypress:
     *   crowd   x 48-138 y 255-305 · x 85-195 y 400-440 · x 385-465 y 257-307
     *           x 184-254 y 445-495 · x 458-608 y 542-582 · x 741-791 y 375-425
     *           x 61-151 y 519-569 · x 665-715 y 556-592
     *   looking the counter x 48-232 y 352-372 · the bottle wall x 165-315 y 242-282
     *           the glass case x 490-540 y 250-290 · the cabinets x 437-577 y 444-468
     *           the round case x 596-652 y 460-480 · the hutch x 685-755 y 450-474
     *   host    x 252-348 y 352-408
     */
    buildCrowd() {
        const c = this.inside;
        const TINTS = [0xb8c8d8, 0xd8c0b0, 0xc8d8b8, 0xe0c8d8, 0xd0d0e8, 0xe8d8b8, 0xc0b8d0, 0xd8e0e8];
        const people = [
            [62, 262, 'civilian_f', false, "Patron: 'We've been in here twenty minutes and I still don't know if it's a bar.'", "Patron: 'Still don't know.'"],
            [124, 268, 'civilian', true, "Patron: 'I asked the man at the till how much the whisky was. He just smiled at me.'", "Patron: 'He's still smiling.'"],
            [110, 396, 'civilian', false, "Patron: 'The phone on the counter rang once. The whole room went quiet.'", "Patron: 'It hasn't rung again.'"],
            [170, 400, 'civilian_f', true, "Patron: 'The host said forty-five minutes. For a liquor store.'", "Patron: 'Forty minutes now.'"],
            [404, 262, 'civilian', false, "Patron: 'That mirror has a wolf on it. Everything in here has a wolf on it.'", "Patron: 'I've counted eleven.'"],
            [462, 258, 'civilian_f', true, "Patron: 'I've been looking at this case for ten minutes. I don't think any of it is for sale.'", "Patron: 'Nope. Not for sale.'"],
            [206, 452, 'civilian_f', false, "Patron: 'The floor's so shiny you can see yourself in it. I've checked my hair twice.'", "Patron: 'Three times.'"],
            [232, 458, 'civilian', true, "Patron: 'She wants to buy a bottle. I keep telling her that's not the point.'", "Patron: 'She's looking at bottles again.'"],
            [470, 548, 'civilian_f', false, "Patron: 'My friend swears there's a secret room in here. She won't tell me where.'", "Patron: 'She's still not telling.'"],
            [520, 552, 'civilian', true, "Patron: 'See the people by the fireplace? They're sitting like they're waiting for something to happen.'", "Patron: 'Still waiting. Weird.'"],
            [596, 556, 'civilian', false, "Patron: 'Every label in here has a wolf on it. I'm starting to see a theme.'", "Patron: 'Definitely a theme.'"],
            [766, 384, 'civilian_f', true, "Patron: 'Don't sit in those armchairs unless someone tells you to. Trust me.'", "Patron: 'Trust me.'"],
            [80, 520, 'civilian', false, "Patron: 'We're on the list. We're just enjoying the shop part first.'", "Patron: 'It's a very nice shop.'"],
            [132, 536, 'civilian_f', true, "Patron: 'I love the painted hills on the walls. It's like a very fancy picnic.'", "Patron: 'A very fancy picnic.'"],
            [690, 560, 'civilian_f', false, "Patron: 'Those bottles on the hutch have gold wolf heads for stoppers. I want one for my shelf.'", "Patron: 'Just the stopper. Just one.'"]
        ].map(([x, y, key, flip, line, again], i) => {
            const person = this.add.sprite(x, y, key).setTint(TINTS[i % TINTS.length]).setFlipX(flip);
            c.add(person);
            this.tweens.add({
                targets: person, y: y - 2, duration: 1000 + (i * 137) % 900,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: (i * 211) % 700
            });
            // Browsing: every so often somebody turns to look at something else.
            if (i % 3 === 0) {
                this.time.addEvent({ delay: 2200 + i * 190, loop: true, callback: () => person.setFlipX(!person.flipX) });
            }
            return { sprite: person, talk: this.chat([line], again) };
        });
        const inside = () => this.stage === 'inside';
        [
            [93, 280, 90, 50, [0, 1]],
            [140, 420, 110, 40, [2, 3]],
            [425, 282, 80, 50, [4, 5]],
            [219, 470, 70, 50, [6, 7]],
            [533, 562, 150, 40, [8, 9, 10]],
            [766, 400, 50, 50, [11]],
            [106, 544, 90, 50, [12, 13]],
            [690, 574, 50, 36, [14]]
        ].forEach(([x, y, w, h, who]) => this.crowdZone(x, y, w, h, inside, who.map(i => people[i])));
    }

    /**
     * The wall that turns — fireplace, platform and both armchairs — built round
     * its own centre so it can swing. The bar side is the same wall seen from
     * the room on the other side of it.
     */
    buildNook(barSide) {
        const n = this.add.container(640, 180);
        const add = o => { n.add(o); return o; };
        if (!barSide) {
            add(this.add.image(0, -40, 'fireplace_wall').setScale(1.2));
            add(this.add.image(0, -118, 'gold_wolf_head').setScale(1.3));
            add(this.add.image(-44, -73, 'mantel_clock').setScale(1.2));
            add(this.add.image(42, -73, 'wolf_sheep_figure').setScale(1.2));
        } else {
            // What comes round: warm light, the dome's ribs, the bulbs.
            add(this.add.rectangle(0, -40, 192, 240, 0x3a2418));
            add(this.add.rectangle(0, -60, 176, 170, 0xe2c08e));
            const ribs = this.add.graphics();
            ribs.lineStyle(2, 0x2a1c12, 1);
            for (let i = 0; i <= 8; i++) ribs.lineBetween(0, -140, -88 + i * 22, 20);
            add(ribs);
            for (let i = 0; i < 9; i++) add(this.add.circle(-80 + i * 20, 24, 3, 0xffc46a));
            add(this.add.image(0, -20, 'lion_fountain').setScale(0.9));
        }
        for (let px = -112; px <= 112; px += 32) {
            for (let py = 96; py <= 128; py += 32) add(this.add.image(px, py, 'parquet_cube'));
        }
        add(this.add.rectangle(0, 146, 240, 4, 0x2a1a0e));

        // Armchair back, whoever sits in it, armchair front: the chair crosses
        // their lap instead of them sitting on top of it.
        const seats = {};
        [[-78, 'mike'], [78, 'yvy']].forEach(([sx, who]) => {
            add(this.add.image(sx, 88, 'wolf_armchair_back').setScale(1.4));
            const sitting = who === 'mike'
                ? this.add.sprite(sx, 92, this.textures.exists(this.outfit + '_sit') ? this.outfit + '_sit' : this.outfit)
                : this.add.sprite(sx, 98, 'yvy_red');
            add(sitting.setVisible(false));
            add(this.add.image(sx, 110, 'wolf_armchair_front').setScale(1.4));
            seats[who] = sitting;
        });
        n.setData('seats', seats);
        return n;
    }

    // --- the story ---------------------------------------------------------------

    meetYvy() {
        this.met = true;
        this.busy = true;
        this.narrate([
            "Yvy was waiting out front, in a red long-sleeved dress.",
            "Mike: 'Hi. You look amazing.'",
            "Yvy: 'Hi yourself. You made it.'"
        ], () => {
            this.busy = false;
            this.yvyFollow = true;
            this.instructionText.setText(`Go inside (${actionLabel()})`);
        });
    }

    goInside() {
        this.busy = true;
        this.player.isLocked = true;
        this.cameras.main.fadeOut(450, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.stage = 'inside';
            this.outside.setVisible(false);
            this.inside.setVisible(true);
            this.outsideWall.body.enable = false;
            this.insideSolids.forEach(b => { b.body.enable = true; });
            this.cameras.main.setBackgroundColor('#141416');
            this.player.body.reset(396, 520);
            this.yvy.setPosition(356, 520);
            this.cameras.main.fadeIn(450, 0, 0, 0);
            this.instructionText.setText('');
            this.narrate([
                "Inside, it was packed. It looked like a very high-class liquor store: black and white marble, bottles lined up behind glass, carved wooden cabinets.",
                "Yvy: 'Are we... buying a bottle?'",
                "Mike: 'I don't think that's why people come here.'"
            ], () => {
                this.busy = false;
                this.player.isLocked = false;
                this.instructionText.setText(`Look around, or talk to the host (${actionLabel()})`);
            });
        });
    }

    talkToHost() {
        this.busy = true;
        this.player.isLocked = true;
        this.yvyFollow = false;
        this.instructionText.setText('');
        this.narrate([
            "Host: 'Good evening. Busy one tonight. Just the two of you?'",
            "Mike: 'Just the two of us.'",
            "Host: 'Wonderful. Right this way. Please, have a seat by the fire.'",
            "Yvy: 'In the liquor store?'",
            "Host: 'In the liquor store.'"
        ], () => this.toTheArmchairs());
    }

    toTheArmchairs() {
        this.tweens.add({ targets: this.host, x: 560, y: 356, duration: 1300, ease: 'Sine.easeInOut' });
        this.stepTo(562, 330, 1400);
        this.tweens.add({ targets: this.yvy, x: 718, y: 330, duration: 1400, ease: 'Sine.easeInOut' });

        this.time.delayedCall(1500, () => {
            const seats = this.nook.getData('seats');
            this.player.setVisible(false);
            this.yvy.setVisible(false);
            seats.mike.setVisible(true);
            seats.yvy.setVisible(true);
            this.tweens.add({ targets: this.host, x: 300, y: 346, duration: 1300, ease: 'Sine.easeInOut' });
            // In close on the mantel, so the three things on it can be seen.
            this.cameras.main.pan(640, 150, 900, 'Sine.easeInOut');
            this.cameras.main.zoomTo(1.7, 900, 'Sine.easeInOut');
            this.time.delayedCall(1000, () => this.narrate([
                "They sat in two armchairs beside a fireplace that wasn't lit.",
                "Above it: a golden wolf's head, an old clock, and a little wolf in sheep's clothing.",
                "Yvy: 'Okay. This is a strange liquor store.'",
                "Mike: 'Something's about to happen. I can feel it.'"
            ], () => this.theWallTurns()));
        });
    }

    /** The wall swings to edge-on, and comes back round with the bar on it. */
    theWallTurns() {
        this.cameras.main.zoomTo(1.25, 600, 'Sine.easeInOut');
        playSound('whoosh');
        this.cameras.main.shake(1800, 0.003);
        const barSeats = this.barSide.getData('seats');
        barSeats.mike.setVisible(true);
        barSeats.yvy.setVisible(true);
        this.tweens.add({
            targets: this.nook, scaleX: 0, duration: 900, ease: 'Sine.easeIn', delay: 400,
            onComplete: () => {
                this.nook.setVisible(false);
                this.barSide.setVisible(true);
                this.tweens.add({
                    targets: this.barSide, scaleX: 1, duration: 900, ease: 'Sine.easeOut',
                    onComplete: () => this.narrate([
                        "Then the whole wall turned, fireplace, armchairs and all, and brought them round into the bar."
                    ], () => {
                        this.cameras.main.fadeOut(900, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            stopMusic();
                            this.scene.start('WolvesBarScene');
                        });
                    })
                });
            }
        });
    }

    update() {
        this.player.update(this.cursors);
        if (this.yvyFollow) {
            const dx = this.player.x + 30 - this.yvy.x;
            const dy = this.player.y - this.yvy.y;
            if (Math.hypot(dx, dy) > 6) {
                this.yvy.x += dx * 0.08;
                this.yvy.y += dy * 0.08;
                this.yvy.setFlipX(dx < 0);
            }
        }
        const near = !this.busy && this.zones.some(({ z, when }) => when() && this.physics.overlap(this.player, z));
        // The shoppers crossing the walkway are moving targets, so they are
        // caught by distance rather than a zone. Scene update runs before the
        // physics step, so this only claims the keypress when no zone wants it.
        const walker = !near && !this.busy && this.stage === 'outside' && this.walkers.find(w =>
            Phaser.Math.Distance.Between(this.player.x, this.player.y, w.sprite.x, w.sprite.y) < 36);
        if (walker && Phaser.Input.Keyboard.JustDown(this.spaceKey) && !dialogueBusy()) walker.talk();
        document.getElementById('interaction-hint').style.display = (near || walker) ? 'block' : 'none';
    }
}

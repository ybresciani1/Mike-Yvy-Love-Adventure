import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { isDialogueOpen } from './dialogue.js';

/**
 * Phone support: an on-screen D-pad and action button, and a game frame that
 * scales down to fit a small screen.
 *
 * Nothing here talks to Phaser or to the scenes. The pad and the button
 * dispatch the same arrow-key and SPACE events a keyboard would, so every
 * `cursors.left.isDown` and `JustDown(this.spaceKey)` in the 27 scenes — and
 * the SPACE listener that dismisses a line of dialogue — keeps working
 * untouched. Phaser's KeyboardManager listens on `window` and reads only
 * `event.keyCode`, and dialogue.js listens on `document`, so a synthetic event
 * dispatched at `document` reaches both.
 */

// The frame is the 800x600 canvas plus the 8px border index.html draws around
// it. Everything inside — canvas and DOM overlay alike — is laid out in those
// coordinates, so the whole container is scaled as one CSS transform rather
// than by resizing the canvas. Phaser derives its own pointer scaling from the
// canvas bounding rect, which a CSS transform is part of, so taps still land
// where they look.
const FRAME_BORDER = 8;
const FRAME_WIDTH = GAME_WIDTH + FRAME_BORDER * 2;
const FRAME_HEIGHT = GAME_HEIGHT + FRAME_BORDER * 2;

const KEYS = {
    up: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
    down: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
    left: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
    right: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
    action: { key: ' ', code: 'Space', keyCode: 32 },
    // B is F: the one key besides SPACE the game asks for, held down to dance
    // at the club. A phone has no F to hold.
    dance: { key: 'f', code: 'KeyF', keyCode: 70 }
};

const DIRECTIONS = ['up', 'down', 'left', 'right'];

/** Fraction of the pad's radius a thumb must travel before it steers. */
export const PAD_DEADZONE = 0.2;

/**
 * Dispatch one synthetic key event.
 *
 * `keyCode` is legacy and some browsers drop it from the KeyboardEvent init
 * dictionary, but it is the only thing Phaser's KeyboardManager reads — so it
 * is redefined on the event when the constructor ignored it.
 */
export function sendKey(type, name) {
    const spec = KEYS[name];
    if (!spec) return null;

    const event = new KeyboardEvent(type, {
        key: spec.key,
        code: spec.code,
        bubbles: true,
        cancelable: true
    });
    if (event.keyCode !== spec.keyCode) {
        Object.defineProperty(event, 'keyCode', { get: () => spec.keyCode });
        Object.defineProperty(event, 'which', { get: () => spec.keyCode });
    }
    document.dispatchEvent(event);
    return event;
}

/**
 * Which arrows a thumb at (dx, dy) from the pad centre is holding.
 *
 * Eight-way: a direction counts once the thumb is within 22.5 degrees of its
 * axis, so the diagonals hold two arrows at once — exactly what pressing two
 * keys does, which is how the player walks diagonally.
 */
export function padDirections(dx, dy, radius) {
    const distance = Math.hypot(dx, dy);
    if (!(radius > 0) || distance < radius * PAD_DEADZONE) return [];

    const diagonal = Math.cos((3 * Math.PI) / 8); // sin(22.5°)
    const nx = dx / distance;
    const ny = dy / distance;
    const held = [];
    if (ny < -diagonal) held.push('up');
    if (ny > diagonal) held.push('down');
    if (nx < -diagonal) held.push('left');
    if (nx > diagonal) held.push('right');
    return held;
}

let touchMode = false;

/** True once the game has decided it is being played with fingers. */
export function isTouchMode() {
    return touchMode;
}

/**
 * What a prompt should call the button that interacts: the key on a keyboard,
 * the button on a phone. Several scenes print this onto the canvas.
 */
export function actionLabel() {
    return touchMode ? 'A' : 'Space';
}

/**
 * Canvas text scales down with the frame rather than with the DOM overlay's
 * touch sizing, so a 16px prompt lands at about 7px on a phone. This keeps each
 * prompt's own size relative to the others.
 */
export function promptFontSize(base = '16px') {
    if (!touchMode) return base;
    return `${Math.round(parseFloat(base) * 1.75)}px`;
}

// Set by installTouchControls, so hiding the button mid-hold cannot leave the
// key stuck down.
let releaseDance = null;

/**
 * Show or hide the B button.
 *
 * Only the club asks for it — it is the one scene that reads a key besides
 * SPACE — so it is hidden everywhere else rather than sitting there doing
 * nothing. A scene that shows it must hide it again on shutdown.
 */
export function showDanceButton(visible) {
    const button = document.getElementById('touch-b');
    if (!button) return;
    button.hidden = !visible;
    if (!visible) releaseDance?.();
}

export function installTouchControls(game) {
    const container = document.getElementById('game-container');
    const controls = document.getElementById('touch-controls');
    const pad = document.getElementById('touch-pad');
    const nub = document.getElementById('touch-nub');
    const action = document.getElementById('touch-action');
    const danceButton = document.getElementById('touch-b');
    if (!container || !controls || !pad || !action) return null;

    const held = new Set();

    const hold = (name, down) => {
        if (down === held.has(name)) return;
        if (down) held.add(name);
        else held.delete(name);
        sendKey(down ? 'keydown' : 'keyup', name);
    };

    const setDirections = (active) => {
        for (const dir of DIRECTIONS) hold(dir, active.includes(dir));
        for (const arrow of pad.querySelectorAll('[data-dir]')) {
            arrow.classList.toggle('is-active', active.includes(arrow.dataset.dir));
        }
    };

    // --- Fitting the frame to the screen ---------------------------------

    // In portrait the controls get a strip of their own under the game. In
    // landscape there is no height to spare, so they sit over the letterbox at
    // either side of it instead.
    const reservedHeight = () => {
        if (!touchMode || window.innerHeight <= window.innerWidth) return 0;
        const rect = pad.getBoundingClientRect();
        return rect.height ? Math.max(0, window.innerHeight - rect.top + FRAME_BORDER) : 0;
    };

    const fit = () => {
        const reserved = reservedHeight();
        const width = window.innerWidth;
        const height = window.innerHeight - reserved;
        // A viewport that reports nothing — mid-rotation, a tab that has not
        // been laid out yet — would otherwise scale the game to zero and blank
        // the screen. Keep the last fit that made sense; another resize is
        // always on its way.
        if (width <= 0 || height <= 0) return;

        // Never scale past 1: on a desktop the game keeps the size it has
        // always had.
        const scale = Math.min(width / FRAME_WIDTH, height / FRAME_HEIGHT, 1);
        const style = document.documentElement.style;
        style.setProperty('--game-scale', String(scale));
        style.setProperty('--game-shift', (-reserved / 2) + 'px');
        // The canvas moved, and Phaser caches its bounds to place pointers.
        game?.scale?.refresh?.();
    };

    const enableTouchMode = () => {
        if (touchMode) return;
        touchMode = true;
        document.body.classList.add('touch-mode');
        const hint = document.getElementById('interaction-hint');
        if (hint) hint.textContent = 'TAP A';
        fit();
    };

    // --- The pad ---------------------------------------------------------

    let padPointer = null;

    const steer = (event) => {
        const rect = pad.getBoundingClientRect();
        const radius = rect.width / 2;
        const dx = event.clientX - (rect.left + radius);
        const dy = event.clientY - (rect.top + rect.height / 2);
        setDirections(padDirections(dx, dy, radius));
        if (nub) {
            const distance = Math.hypot(dx, dy) || 1;
            const reach = Math.min(distance, radius * 0.45) / distance;
            nub.style.transform = `translate(${dx * reach}px, ${dy * reach}px)`;
        }
    };

    const releasePad = () => {
        padPointer = null;
        setDirections([]);
        if (nub) nub.style.transform = '';
    };

    pad.addEventListener('pointerdown', (event) => {
        event.preventDefault?.();
        padPointer = event.pointerId;
        steer(event);
    });

    // Move and release are watched on the window rather than on the pad: a
    // thumb that slides off the pad mid-stride should keep steering, and a
    // finger lifted anywhere must stop it. Touch pointers stay targeted at the
    // element they started on, so these still see them.
    window.addEventListener('pointermove', (event) => {
        if (padPointer !== null && event.pointerId === padPointer) steer(event);
    });
    for (const type of ['pointerup', 'pointercancel']) {
        window.addEventListener(type, (event) => {
            if (padPointer !== null && event.pointerId === padPointer) releasePad();
        });
    }

    // --- The buttons ------------------------------------------------------

    // Each button is held rather than clicked: SPACE is only ever tapped, but
    // the club wants F held down for as long as Mike should keep dancing.
    const wireButton = (button, name) => {
        if (!button) return;
        let pointer = null;

        button.addEventListener('pointerdown', (event) => {
            event.preventDefault?.();
            pointer = event.pointerId;
            hold(name, true);
        });
        for (const type of ['pointerup', 'pointercancel']) {
            window.addEventListener(type, (event) => {
                if (pointer === null || event.pointerId !== pointer) return;
                pointer = null;
                hold(name, false);
            });
        }
    };

    wireButton(action, 'action');
    wireButton(danceButton, 'dance');
    releaseDance = () => hold('dance', false);

    // A long press on either control would otherwise raise the text-selection
    // callout over the game.
    controls.addEventListener('contextmenu', (event) => event.preventDefault?.());

    // Tapping the screen advances a line, the way tapping the box does in
    // every other game on the phone. Only while a line is open: a stray tap
    // must not fire the interaction the player happens to be standing in.
    container.addEventListener('pointerdown', (event) => {
        if (!touchMode || event.pointerType === 'mouse' || !isDialogueOpen()) return;
        sendKey('keydown', 'action');
        sendKey('keyup', 'action');
    });

    // --- Boot -------------------------------------------------------------

    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    // The visual viewport is what actually changes when a phone's browser
    // chrome slides away; window's own resize does not always follow.
    window.visualViewport?.addEventListener('resize', fit);
    // And the last word on how big the page actually is. A rotation reports its
    // new dimensions a beat after `orientationchange`, and a resize event is
    // not guaranteed at all — this fires whenever the layout really changed.
    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(fit).observe(document.documentElement);
    }
    game?.events?.once?.('ready', fit);

    // A coarse pointer is a finger, and that is known before the title screen
    // draws. A laptop with a touchscreen reports a mouse, so it only gets the
    // controls once someone actually touches the glass — as does a convertible
    // the moment its keyboard is folded away and the query starts matching.
    const coarse = window.matchMedia?.('(pointer: coarse)');
    if (coarse?.matches) enableTouchMode();
    else {
        coarse?.addEventListener?.('change', (event) => {
            if (event.matches) enableTouchMode();
        });
        window.addEventListener('touchstart', enableTouchMode, { once: true, passive: true });
    }

    fit();

    return { fit, enableTouchMode };
}

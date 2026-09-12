// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readSrc } from './helpers.js';

// The phone controls are wired to the real page shell: they are what the
// on-screen pad and button are, so a markup change that renamed or dropped one
// of them should fail here rather than on a phone.
const SHELL = (() => {
    const html = readSrc('index.html');
    return html.slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('<script'));
})();

const PAD_RECT = { left: 100, top: 400, width: 120, height: 120, right: 220, bottom: 520 };

let dialogueOpen = false;
vi.mock('../src/ui/dialogue.js', () => ({ isDialogueOpen: () => dialogueOpen }));

let touch;
let keys;

const viewport = (width, height) => {
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
};

// jsdom has no PointerEvent, and the handlers only ever read these four fields.
const pointer = (type, { id = 1, x = 0, y = 0, pointerType = 'touch' } = {}) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, { pointerId: id, clientX: x, clientY: y, pointerType });
    return event;
};

const padCentre = [PAD_RECT.left + PAD_RECT.width / 2, PAD_RECT.top + PAD_RECT.height / 2];
const atPad = (dx, dy, rest) =>
    pointer('pointerdown', { x: padCentre[0] + dx, y: padCentre[1] + dy, ...rest });
const movePad = (dx, dy) =>
    pointer('pointermove', { x: padCentre[0] + dx, y: padCentre[1] + dy });

const install = (game) => {
    const controls = touch.installTouchControls(game);
    document.getElementById('touch-pad').getBoundingClientRect = () => PAD_RECT;
    return controls;
};

const goTouch = () => window.dispatchEvent(new Event('touchstart'));

// jsdom keeps one window for the whole file, so every listener installed by a
// test would still be live in the next one — a stale module instance steering a
// pad that no longer exists. Both ends are recorded and unwound between tests.
const addWindowListener = window.addEventListener.bind(window);
let installed = [];
const record = [
    ['keydown', (e) => keys.push(['down', e.code, e.keyCode])],
    ['keyup', (e) => keys.push(['up', e.code, e.keyCode])]
];

beforeEach(async () => {
    document.body.innerHTML = SHELL;
    document.body.className = '';
    document.documentElement.removeAttribute('style');
    dialogueOpen = false;
    viewport(1280, 900);
    // Fresh module instance: whether the game is in touch mode is module state.
    vi.resetModules();

    installed = [];
    window.addEventListener = (type, listener, options) => {
        installed.push([type, listener, options]);
        addWindowListener(type, listener, options);
    };

    touch = await import('../src/ui/touch.js');

    keys = [];
    for (const [type, listener] of record) document.addEventListener(type, listener);
});

afterEach(() => {
    for (const [type, listener, options] of installed) {
        window.removeEventListener(type, listener, options);
    }
    window.addEventListener = addWindowListener;
    for (const [type, listener] of record) document.removeEventListener(type, listener);
    document.body.innerHTML = '';
    delete window.matchMedia;
});

describe('padDirections', () => {
    it('ignores a thumb resting near the middle', () => {
        expect(touch.padDirections(0, 0, 60)).toEqual([]);
        expect(touch.padDirections(5, 5, 60)).toEqual([]);
    });

    it('holds one arrow along an axis', () => {
        expect(touch.padDirections(0, -50, 60)).toEqual(['up']);
        expect(touch.padDirections(0, 50, 60)).toEqual(['down']);
        expect(touch.padDirections(-50, 0, 60)).toEqual(['left']);
        expect(touch.padDirections(50, 0, 60)).toEqual(['right']);
    });

    it('holds two on a diagonal, which is how the player walks at an angle', () => {
        expect(touch.padDirections(40, -40, 60).sort()).toEqual(['right', 'up']);
        expect(touch.padDirections(-40, 40, 60).sort()).toEqual(['down', 'left']);
    });

    it('gives a mostly-sideways thumb only the sideways arrow', () => {
        expect(touch.padDirections(50, -10, 60)).toEqual(['right']);
    });
});

describe('sendKey', () => {
    it('carries the keyCode Phaser reads, not just the modern code', () => {
        touch.sendKey('keydown', 'left');
        touch.sendKey('keyup', 'action');

        expect(keys).toEqual([
            ['down', 'ArrowLeft', 37],
            ['up', 'Space', 32]
        ]);
    });

    it('bubbles to the window, where Phaser listens', () => {
        const seen = [];
        window.addEventListener('keydown', (e) => seen.push(e.code));
        touch.sendKey('keydown', 'up');

        expect(seen).toEqual(['ArrowUp']);
    });
});

describe('touch mode', () => {
    it('stays off for a mouse until the screen is actually touched', () => {
        install();
        expect(touch.isTouchMode()).toBe(false);
        expect(document.body.classList.contains('touch-mode')).toBe(false);

        goTouch();
        expect(touch.isTouchMode()).toBe(true);
        expect(document.body.classList.contains('touch-mode')).toBe(true);
    });

    it('turns on straight away for a coarse pointer, before the title draws', () => {
        window.matchMedia = vi.fn(() => ({ matches: true }));
        install();

        expect(touch.isTouchMode()).toBe(true);
        expect(window.matchMedia).toHaveBeenCalledWith('(pointer: coarse)');
    });

    it('stops telling the player to press a key they do not have', () => {
        install();
        goTouch();

        expect(document.getElementById('interaction-hint').textContent).toBe('TAP A');
    });
});

describe('the pad', () => {
    it('presses and releases the arrow key the thumb is pointing at', () => {
        install();
        const pad = document.getElementById('touch-pad');

        pad.dispatchEvent(atPad(-50, 0));
        expect(keys).toEqual([['down', 'ArrowLeft', 37]]);

        window.dispatchEvent(pointer('pointerup', { id: 1 }));
        expect(keys).toEqual([
            ['down', 'ArrowLeft', 37],
            ['up', 'ArrowLeft', 37]
        ]);
    });

    it('holds both arrows on a diagonal', () => {
        install();
        document.getElementById('touch-pad').dispatchEvent(atPad(40, -40));

        expect(keys.map((k) => k[1]).sort()).toEqual(['ArrowRight', 'ArrowUp']);
    });

    it('swaps arrows as the thumb slides, without re-pressing the one it keeps', () => {
        install();
        const pad = document.getElementById('touch-pad');

        pad.dispatchEvent(atPad(0, -50));
        window.dispatchEvent(movePad(40, -40));

        expect(keys).toEqual([
            ['down', 'ArrowUp', 38],
            ['down', 'ArrowRight', 39]
        ]);
    });

    it('keeps steering when the thumb slides off the pad, and stops on release', () => {
        install();
        document.getElementById('touch-pad').dispatchEvent(atPad(0, -50));
        window.dispatchEvent(movePad(0, -400));
        expect(keys).toEqual([['down', 'ArrowUp', 38]]);

        window.dispatchEvent(pointer('pointercancel', { id: 1 }));
        expect(keys.at(-1)).toEqual(['up', 'ArrowUp', 38]);
    });

    it('ignores a second finger that did not start on the pad', () => {
        install();
        document.getElementById('touch-pad').dispatchEvent(atPad(-50, 0, { id: 1 }));
        window.dispatchEvent(pointer('pointerup', { id: 2 }));

        expect(keys).toEqual([['down', 'ArrowLeft', 37]]);
    });
});

describe('the action button', () => {
    it('presses SPACE while it is held', () => {
        install();
        const action = document.getElementById('touch-action');

        action.dispatchEvent(pointer('pointerdown', { id: 3 }));
        expect(keys).toEqual([['down', 'Space', 32]]);

        window.dispatchEvent(pointer('pointerup', { id: 3 }));
        expect(keys).toEqual([
            ['down', 'Space', 32],
            ['up', 'Space', 32]
        ]);
    });

    it('can be pressed again, so a held button is not a stuck key', () => {
        install();
        const action = document.getElementById('touch-action');

        for (const id of [1, 2]) {
            action.dispatchEvent(pointer('pointerdown', { id }));
            window.dispatchEvent(pointer('pointerup', { id }));
        }

        expect(keys.filter(([dir]) => dir === 'down')).toHaveLength(2);
    });
});

describe('tapping the game', () => {
    it('advances an open line, the way tapping does in every other phone game', () => {
        install();
        goTouch();
        dialogueOpen = true;

        document.getElementById('game-container').dispatchEvent(pointer('pointerdown'));
        expect(keys).toEqual([
            ['down', 'Space', 32],
            ['up', 'Space', 32]
        ]);
    });

    it('does nothing with no line open, so a stray tap fires no interaction', () => {
        install();
        goTouch();

        document.getElementById('game-container').dispatchEvent(pointer('pointerdown'));
        expect(keys).toEqual([]);
    });

    it('leaves the mouse alone', () => {
        install();
        goTouch();
        dialogueOpen = true;

        document.getElementById('game-container').dispatchEvent(
            pointer('pointerdown', { pointerType: 'mouse' })
        );
        expect(keys).toEqual([]);
    });
});

describe('fitting the frame to the screen', () => {
    const scale = () => Number(document.documentElement.style.getPropertyValue('--game-scale'));

    it('leaves a desktop at the size the game has always been', () => {
        install();
        expect(scale()).toBe(1);
    });

    it('shrinks the whole frame — canvas and overlays — to fit a phone', () => {
        viewport(390, 844);
        install();
        goTouch();

        // 390 wide against the 800px game plus its 8px frame on each side.
        expect(scale()).toBeCloseTo(390 / 816, 5);
    });

    it('lifts the game clear of the controls in portrait', () => {
        viewport(390, 844);
        install();
        goTouch();

        const shift = parseFloat(document.documentElement.style.getPropertyValue('--game-shift'));
        expect(shift).toBeLessThan(0);
    });

    it('gives landscape its full height, with the controls over the letterbox', () => {
        viewport(844, 390);
        install();
        goTouch();

        expect(document.documentElement.style.getPropertyValue('--game-shift')).toBe('0px');
        expect(scale()).toBeCloseTo(390 / 616, 5);
    });

    it('ignores a viewport that reports nothing, rather than scaling to zero', () => {
        install();
        expect(scale()).toBe(1);

        // What a tab mid-rotation, or one not yet laid out, can report.
        viewport(0, 0);
        window.dispatchEvent(new Event('resize'));

        expect(scale()).toBe(1);
    });

    it('refreshes the bounds Phaser maps taps through', () => {
        const refresh = vi.fn();
        install({ scale: { refresh }, events: { once: vi.fn() } });

        expect(refresh).toHaveBeenCalled();
    });
});

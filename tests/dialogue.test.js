// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PORTRAITS } from '../src/assets.js';

vi.mock('../src/audio/sfx.js', () => ({ playSound: vi.fn() }));

const OVERLAY_HTML = `
    <div id="interaction-hint"></div>
    <div id="dialogue-box">
        <div id="portrait-frame"><img id="portrait-img" src=""></div>
        <div id="dialogue-text"></div>
    </div>
`;

let showDialogue;
let isDialogueOpen;
let portraitFor;
let resetDialogue;

beforeEach(async () => {
    document.body.innerHTML = OVERLAY_HTML;
    vi.useFakeTimers();
    // Fresh module instance so the open/closed flag does not leak between tests.
    vi.resetModules();
    ({ showDialogue, isDialogueOpen, portraitFor, resetDialogue } = await import("../src/ui/dialogue.js"));
});

const pressSpace = () => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
const typeOut = (text) => vi.advanceTimersByTime(25 * (text.length + 1));

describe('portraitFor', () => {
    it('matches the speaker prefixes each character actually uses', () => {
        expect(portraitFor("Mike: 'Hello.'")).toBe(PORTRAITS.mike);
        expect(portraitFor('Mike picks up the phone.')).toBe(PORTRAITS.mike);
        expect(portraitFor("Yvy: 'Hi!'")).toBe(PORTRAITS.yvy);
        expect(portraitFor('Yvy wakes up: ...')).toBe(PORTRAITS.yvy);
        expect(portraitFor("Aiden: 'Dad!'")).toBe(PORTRAITS.aiden);
    });

    it('returns nothing for narration, which shows no portrait', () => {
        expect(portraitFor('Mike grabbed his suitcase.')).toBeNull();
        expect(portraitFor('The door creaks open.')).toBeNull();
    });
});

describe('showDialogue', () => {
    it('types the line out one character at a time', () => {
        showDialogue('Hello');
        const textBox = document.getElementById('dialogue-text');

        expect(document.getElementById('dialogue-box').style.display).toBe('flex');
        expect(textBox.textContent).toBe('');

        vi.advanceTimersByTime(25);
        expect(textBox.textContent).toBe('H');
        vi.advanceTimersByTime(25 * 4);
        expect(textBox.textContent).toBe('Hello');
    });

    it('shows the speaker portrait and hides it again for narration', () => {
        const frame = document.getElementById('portrait-frame');

        showDialogue("Yvy: 'Hi!'");
        expect(frame.style.display).toBe('block');
        expect(document.getElementById('portrait-img').src).toBe(PORTRAITS.yvy);

        typeOut("Yvy: 'Hi!'");
        pressSpace();
        vi.advanceTimersByTime(200); // clear the re-trigger guard

        showDialogue('The room falls quiet.');
        expect(frame.style.display).toBe('none');
    });

    it('hides the interaction hint while open', () => {
        document.getElementById('interaction-hint').style.display = 'block';
        showDialogue('Hi');
        expect(document.getElementById('interaction-hint').style.display).toBe('none');
    });

    it('gates player input until the line is dismissed with SPACE', () => {
        showDialogue('Hi');
        expect(isDialogueOpen()).toBe(true);

        // SPACE does nothing until the text has finished typing.
        pressSpace();
        expect(isDialogueOpen()).toBe(true);

        typeOut('Hi');
        pressSpace();

        expect(isDialogueOpen()).toBe(false);
        expect(document.getElementById('dialogue-box').style.display).toBe('none');
    });

    it('runs the callback once, after dismissal — this is how scenes chain lines', () => {
        const next = vi.fn();
        showDialogue('Hi', next);

        typeOut('Hi');
        expect(next).not.toHaveBeenCalled();

        pressSpace();
        expect(next).toHaveBeenCalledTimes(1);

        pressSpace();
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('ignores a second line while one is already open', () => {
        showDialogue('First');
        showDialogue('Second');
        typeOut('First');
        expect(document.getElementById('dialogue-text').textContent).toBe('First');
    });
});

describe('resetDialogue', () => {
    // Leaving a scene mid-line used to strand the box open and fire the
    // abandoned callback into the next scene — dialogue from the bar showing
    // up over the restaurant.
    it('closes an open line without running its callback', () => {
        const next = vi.fn();
        showDialogue('Marine: hello', next);
        typeOut('Marine: hello');

        resetDialogue();

        expect(isDialogueOpen()).toBe(false);
        expect(document.getElementById('dialogue-box').style.display).toBe('none');
        pressSpace();
        expect(next).not.toHaveBeenCalled();
    });

    it('lets the next scene open its own dialogue afterwards', () => {
        showDialogue('Marine: hello');
        resetDialogue();

        showDialogue('Host: right this way');
        typeOut('Host: right this way');
        expect(document.getElementById('dialogue-text').textContent).toBe('Host: right this way');
    });

    it('is safe when nothing is open', () => {
        expect(() => resetDialogue()).not.toThrow();
    });
});

describe('re-trigger guard', () => {
    // The press that closes a line is also seen by Phaser one frame later. An
    // interaction the player is standing in would re-open its line immediately,
    // and since an open line freezes the player, they could never walk away.
    it('refuses a fresh line opened by the same press that closed the last one', () => {
        showDialogue('Mike checked the AI Gen booth.');
        typeOut('Mike checked the AI Gen booth.');
        pressSpace();

        const reopened = showDialogue('Mike checked the AI Gen booth.');

        expect(reopened).toBe(false);
        expect(isDialogueOpen()).toBe(false);
        expect(document.getElementById('dialogue-box').style.display).toBe('none');
    });

    it('still lets a conversation continue to its next line', () => {
        showDialogue('Mike: line one', () => showDialogue('Yvy: line two'));
        typeOut('Mike: line one');
        pressSpace();

        expect(isDialogueOpen()).toBe(true);
        typeOut('Yvy: line two');
        expect(document.getElementById('dialogue-text').textContent).toBe('Yvy: line two');
    });

    it('allows a fresh line again once the press has settled', () => {
        showDialogue('first');
        typeOut('first');
        pressSpace();
        vi.advanceTimersByTime(200);

        expect(showDialogue('second')).toBe(true);
        expect(isDialogueOpen()).toBe(true);
    });

    it('reports refusal while another line is open', () => {
        showDialogue('first');
        expect(showDialogue('second')).toBe(false);
    });
});

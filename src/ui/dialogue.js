import { PORTRAITS } from '../assets.js';
import { playSound } from '../audio/sfx.js';

const TYPEWRITER_INTERVAL_MS = 25;

// The portrait shown next to a line is chosen by prefix-matching the dialogue
// text, so any new line that should show a face must start with one of these.
const PORTRAIT_PREFIXES = [
    { portrait: PORTRAITS.mike, prefixes: ['Mike:', 'Mike picks', 'Mike cautiously', 'Mike sent:', 'Mike explains'] },
    { portrait: PORTRAITS.yvy, prefixes: ['Yvy:', 'Yvy waves:', 'Yvy wakes up:', 'Yvy replied:'] },
    { portrait: PORTRAITS.aiden, prefixes: ['Aiden:'] }
];

export function portraitFor(text) {
    const match = PORTRAIT_PREFIXES.find(({ prefixes }) => prefixes.some(p => text.startsWith(p)));
    return match ? match.portrait : null;
}

let dialogueOpen = false;
let typeWriterEvent = null;

// Global input gate: the player cannot move while a dialogue box is open.
export function isDialogueOpen() {
    return dialogueOpen;
}

export function showDialogue(text, callback) {
    if (dialogueOpen) return;
    dialogueOpen = true;

    const box = document.getElementById('dialogue-box');
    const textBox = document.getElementById('dialogue-text');
    const portraitFrame = document.getElementById('portrait-frame');
    const portraitImg = document.getElementById('portrait-img');

    document.getElementById('interaction-hint').style.display = 'none';
    box.style.display = 'flex';

    const portrait = portraitFor(text);
    if (portrait) {
        portraitFrame.style.display = 'block';
        portraitImg.src = portrait;
    } else {
        portraitFrame.style.display = 'none';
    }

    textBox.textContent = '';
    let i = 0;
    if (typeWriterEvent) clearInterval(typeWriterEvent);
    typeWriterEvent = setInterval(() => {
        textBox.textContent += text.charAt(i);
        if (text.charAt(i) !== ' ') playSound('text');
        i++;
        if (i >= text.length) {
            clearInterval(typeWriterEvent);
            const listener = (e) => {
                if (e.code === 'Space') {
                    document.removeEventListener('keydown', listener);
                    box.style.display = 'none';
                    dialogueOpen = false;
                    playSound('select');
                    if (callback) callback();
                }
            };
            document.addEventListener('keydown', listener);
        }
    }, TYPEWRITER_INTERVAL_MS);
}

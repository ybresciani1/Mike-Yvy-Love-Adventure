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

// Warm the browser cache at boot so a face is ready the instant a line opens,
// instead of the frame sitting empty while the photo downloads mid-sentence.
for (const url of Object.values(PORTRAITS)) {
    const preload = new Image();
    preload.src = url;
}

export function portraitFor(text) {
    const match = PORTRAIT_PREFIXES.find(({ prefixes }) => prefixes.some(p => text.startsWith(p)));
    return match ? match.portrait : null;
}

let dialogueOpen = false;
let typeWriterEvent = null;
// Tracked so it can be torn down from outside: the listener closes over the
// caller's callback, and a listener left attached across a scene change fires
// the old scene's next line over the new scene.
let dismissListener = null;

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
        // index.html hides the <img> and colours the frame if a portrait ever
        // fails to fetch, and that stuck: one flaky load meant no portrait for
        // the rest of the session. Clear both before every line.
        portraitImg.style.display = '';
        portraitFrame.style.backgroundColor = '';
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
                    dismissListener = null;
                    box.style.display = 'none';
                    dialogueOpen = false;
                    playSound('select');
                    if (callback) callback();
                }
            };
            dismissListener = listener;
            document.addEventListener('keydown', listener);
        }
    }, TYPEWRITER_INTERVAL_MS);
}

/**
 * Abandon any open line without running its callback, and drop the pending
 * key listener. Leaving a scene mid-dialogue would otherwise strand the box
 * open (blocking every later line, since showDialogue refuses to open a
 * second one) and fire the abandoned callback into whatever scene is next.
 */
export function resetDialogue() {
    if (typeWriterEvent) clearInterval(typeWriterEvent);
    typeWriterEvent = null;
    if (dismissListener) document.removeEventListener('keydown', dismissListener);
    dismissListener = null;
    dialogueOpen = false;
    const box = document.getElementById('dialogue-box');
    if (box) box.style.display = 'none';
}

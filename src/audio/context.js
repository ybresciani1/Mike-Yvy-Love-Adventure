// Lazily created so the AudioContext is only constructed once something actually
// makes noise (browsers suspend contexts created before a user gesture anyway).
let ctx = null;

export function audioCtx() {
    if (!ctx) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        ctx = new Ctor();
    }
    return ctx;
}

/** True once the browser is actually letting the page make a sound. */
export function audioRunning() {
    return !!ctx && ctx.state === 'running';
}

const unlockListeners = [];

/**
 * Run `listener` when the browser starts letting the page make a sound, but
 * only if it had been refusing until then. Music started during that silence is
 * lost and has to be started over; see music.js.
 */
export function onAudioUnlock(listener) {
    unlockListeners.push(listener);
}

// Every gesture worth trying an unlock on. A phone will not let the page make a
// sound until the player touches it, and `resume()` only counts while the
// browser still considers itself inside that gesture — which is why calling it
// from `playSound` is not enough on its own: by the time Phaser has processed
// the tap and reached the game code, a frame has passed and the gesture is
// over. These listeners run in the tap itself.
const GESTURES = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'keydown'];

export function installAudioUnlock(target = window) {
    // These stay attached for the life of the page rather than coming down
    // after the first success. A phone suspends the context again whenever it
    // feels like it — a call, another app, the player locking the screen — and
    // a game that stopped listening would be silent from then on. While the
    // sound is running this costs one comparison per tap.
    const unlock = () => {
        if (audioRunning()) return;

        const context = audioCtx();
        // iOS wants both of these, in the gesture's own task: the resume, and
        // something actually pushed through the context.
        ping(context);
        const resumed = context.resume?.();

        let announced = false;
        const announce = () => {
            if (announced || !audioRunning()) return;
            announced = true;
            for (const listener of unlockListeners) listener();
        };

        // Chrome flips the state before returning; Safari only once the promise
        // settles, and sometimes not at all — in which case nothing is
        // announced and the next tap tries again.
        announce();
        if (!announced) {
            Promise.resolve(resumed)
                .catch(() => {})
                .then(announce);
        }
    };

    // Capture, so the gesture is seen before anything downstream can swallow
    // it — the D-pad calls preventDefault on its own pointerdown.
    for (const type of GESTURES) target.addEventListener(type, unlock, true);

    // A phone suspends the context when the player switches apps, and nothing
    // starts it again on the way back.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && ctx && ctx.state === 'suspended') {
            ctx.resume?.();
        }
    });

    return unlock;
}

/** A single silent sample: on iOS the context does not count as unlocked until
 *  something has actually been played through it. */
function ping(context) {
    try {
        const source = context.createBufferSource();
        source.buffer = context.createBuffer(1, 1, context.sampleRate || 22050);
        source.connect(context.destination);
        source.start(0);
    } catch {
        // Older webkit: the resume on its own will have to do.
    }
}

// --- the volume control --------------------------------------------------------
// Every sound and every note goes through one gain node on its way out, so the
// speaker button in the corner can turn the whole game down or off without any
// scene knowing about it. The setting is remembered between visits.

const SETTINGS_KEY = 'mikeyvy.audio';
let master = null;
let volume = 0.7;
let muted = false;

(() => {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
        if (saved && typeof saved.volume === 'number') volume = Math.min(1, Math.max(0, saved.volume));
        if (saved && typeof saved.muted === 'boolean') muted = saved.muted;
    } catch {
        // A private window, or storage turned off: the defaults will do.
    }
})();

function remember() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ volume, muted }));
    } catch {
        // Nothing to be done; the setting lasts as long as the page does.
    }
}

/** The node every sound connects to instead of the speakers. */
export function masterGain() {
    const ctx = audioCtx();
    if (!master) {
        master = ctx.createGain();
        master.connect(ctx.destination);
    }
    master.gain.value = muted ? 0 : volume;
    return master;
}

function apply() {
    if (master) master.gain.value = muted ? 0 : volume;
}

export function getVolume() {
    return volume;
}

export function setVolume(next) {
    volume = Math.min(1, Math.max(0, next));
    if (volume > 0) muted = false;
    apply();
    remember();
}

export function isMuted() {
    return muted || volume === 0;
}

export function setMuted(next) {
    muted = next;
    apply();
    remember();
}

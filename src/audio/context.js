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

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

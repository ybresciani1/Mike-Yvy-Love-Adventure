import { getVolume, isMuted, setMuted, setVolume } from '../audio/context.js';

/**
 * The speaker in the corner: one mute button and one volume slider, wired to the
 * master gain every sound and every theme already plays through.
 *
 * Like the phone controls, it lives in `index.html` *outside* `#game-container`
 * rather than inside it, so it stays the same readable size however far the
 * 800x600 frame has been scaled down — and it is DOM rather than Phaser, so it
 * is on screen in every scene without a line of per-scene wiring.
 *
 * Keys are the one thing to be careful about. A button keeps focus after a
 * click, so SPACE would press it again instead of advancing a line, and the
 * slider answers the arrow keys the player steers with. Both give focus back the
 * moment they are used, and a key pressed while they still have it is allowed
 * through to the game rather than acted on here.
 */
export function installAudioControls() {
    const panel = document.getElementById('audio-controls');
    const button = document.getElementById('audio-toggle');
    const slider = document.getElementById('audio-volume');
    if (!panel || !button || !slider) return null;

    const paint = () => {
        const off = isMuted();
        button.textContent = off ? '🔇' : '🔊';
        button.setAttribute('aria-pressed', String(off));
        panel.classList.toggle('muted', off);
        slider.value = String(Math.round(getVolume() * 100));
    };

    button.addEventListener('click', () => {
        setMuted(!isMuted());
        // Unmuting with the slider all the way down would still be silent.
        if (!isMuted() && getVolume() === 0) setVolume(0.7);
        paint();
        button.blur();
    });

    slider.addEventListener('input', () => {
        setVolume(Number(slider.value) / 100);
        paint();
    });
    slider.addEventListener('change', () => slider.blur());

    // Whatever they press while one of these has focus, the game wants it.
    [button, slider].forEach(el => el.addEventListener('keydown', event => {
        event.preventDefault(); // not handled here — but still seen by Phaser, which listens on window
        el.blur();
    }));

    paint();
    return { paint };
}

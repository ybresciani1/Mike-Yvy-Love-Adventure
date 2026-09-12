// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createFakeAudioContext } from './helpers.js';

// A phone refuses to make a sound until the player touches the screen, and the
// permission lasts only as long as the gesture itself. The game's own
// playSound() runs a frame later — after Phaser has processed the tap — by
// which time it is too late, which is why the unlock listens for the gesture
// directly. These checks are what stands between that and a silent game.

let created;
let FakeAudioContext;
let audio;
let music;

// jsdom keeps one window for the whole file, so listeners installed by one test
// would still be live in the next, resuming a context that test knows nothing
// about. They are recorded and unwound between tests.
const addWindowListener = window.addEventListener.bind(window);
let installed = [];

beforeEach(async () => {
    ({ FakeAudioContext, created } = createFakeAudioContext());
    window.AudioContext = FakeAudioContext;
    vi.resetModules();

    installed = [];
    window.addEventListener = (type, listener, options) => {
        installed.push([type, listener, options]);
        addWindowListener(type, listener, options);
    };

    audio = await import('../src/audio/context.js');
    music = await import('../src/audio/music.js');
});

afterEach(() => {
    for (const [type, listener, options] of installed) {
        window.removeEventListener(type, listener, options);
    }
    window.addEventListener = addWindowListener;
});

// A phone's rule, which is the whole reason any of this exists: resume() does
// nothing unless the browser thinks it is inside a user gesture at the time.
let insideGesture = false;

/** A context the browser has not let make a sound yet, and will not until asked
 *  from inside a gesture. */
const silentContext = () => {
    const ctx = audio.audioCtx();
    ctx.state = 'suspended';
    ctx.resumed = false;
    ctx.resume = () => {
        // Once a page has been allowed to make a sound, it keeps the
        // permission — which is why coming back from another app only needs
        // the resume, not another tap.
        if (insideGesture || ctx.allowed) {
            ctx.state = 'running';
            ctx.resumed = true;
            ctx.allowed = true;
        }
        return Promise.resolve();
    };
    return ctx;
};

/** A real tap. */
const tap = () => {
    insideGesture = true;
    try {
        window.dispatchEvent(new Event('pointerdown'));
    } finally {
        insideGesture = false;
    }
};

/** Something the browser does not accept as one — a synthetic event, say. */
const taplikeEvent = () => window.dispatchEvent(new Event('pointerdown'));

describe('unlocking the audio', () => {
    it('resumes a context the browser suspended, on the first gesture', () => {
        const ctx = silentContext();
        audio.installAudioUnlock();
        expect(ctx.resumed).toBe(false);

        tap();

        expect(ctx.resumed).toBe(true);
        expect(audio.audioRunning()).toBe(true);
    });

    it('plays a silent sample through it, which is what iOS counts as unlocked', () => {
        silentContext();
        audio.installAudioUnlock();
        tap();

        expect(created.buffers).toHaveLength(1);
    });

    it('creates the context on the gesture when nothing has made a sound yet', () => {
        audio.installAudioUnlock();
        expect(FakeAudioContext.instances).toHaveLength(0);

        tap();

        expect(FakeAudioContext.instances).toHaveLength(1);
    });

    it('costs nothing on every tap after that', () => {
        const ctx = silentContext();
        audio.installAudioUnlock();
        tap();

        const resume = vi.spyOn(ctx, 'resume');
        tap();
        tap();

        expect(resume).not.toHaveBeenCalled();
    });

    it('picks the sound back up if the phone suspends it again later', () => {
        const ctx = silentContext();
        audio.installAudioUnlock();
        tap();

        // A call, another app, the screen locking: the context goes away again
        // long after the gesture that first unlocked it.
        ctx.state = 'suspended';
        tap();

        expect(audio.audioRunning()).toBe(true);
    });

    it('starts the music over when it comes back, rather than leaving it mute', () => {
        silentContext();
        audio.installAudioUnlock();
        tap();

        music.playBlueTheme();
        // An interruption — a call, the screen locking — takes the sound away
        // and wants a fresh gesture before giving it back.
        const ctx = audio.audioCtx();
        ctx.state = 'suspended';
        ctx.allowed = false;
        music.playConferenceTheme(); // a scene change during that silence
        const silent = created.oscillators.length;

        tap();

        expect(created.oscillators.length).toBeGreaterThan(silent);
    });

    it('keeps listening while the browser is still refusing', () => {
        silentContext();
        audio.installAudioUnlock();

        taplikeEvent();
        expect(audio.audioRunning()).toBe(false);

        tap();
        expect(audio.audioRunning()).toBe(true);
    });
});

describe('music that started before the audio was unlocked', () => {
    it('is started over, since none of it was ever audible', () => {
        silentContext();
        audio.installAudioUnlock();

        music.playBlueTheme();
        const silentlyPlayed = created.oscillators.length;
        expect(silentlyPlayed).toBeGreaterThan(0);

        tap();

        expect(created.oscillators.length).toBeGreaterThan(silentlyPlayed);
    });

    it('is left alone when it was audible all along, so a desktop never restarts', () => {
        audio.audioCtx(); // running from the start
        audio.installAudioUnlock();

        music.playBlueTheme();
        const playing = created.oscillators.length;

        tap();

        expect(created.oscillators).toHaveLength(playing);
    });

    it('is not resurrected after a scene deliberately stopped it', () => {
        silentContext();
        audio.installAudioUnlock();

        music.playBlueTheme();
        music.stopMusic();
        const stopped = created.oscillators.length;

        tap();

        expect(created.oscillators).toHaveLength(stopped);
    });

    it('is not resurrected after a fade-out either', () => {
        silentContext();
        audio.installAudioUnlock();

        music.playRomanticTheme();
        music.fadeOutMusic(0.5);
        const faded = created.oscillators.length;

        tap();

        expect(created.oscillators).toHaveLength(faded);
    });
});

describe('coming back to the game', () => {
    it('resumes a context the phone suspended while the player was away', () => {
        const ctx = silentContext();
        audio.installAudioUnlock();
        tap();

        ctx.state = 'suspended';
        ctx.resumed = false;
        document.dispatchEvent(new Event('visibilitychange'));

        expect(ctx.resumed).toBe(true);
    });
});

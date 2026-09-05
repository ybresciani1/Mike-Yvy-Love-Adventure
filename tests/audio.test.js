// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFakeAudioContext } from './helpers.js';

let FakeAudioContext;
let created;
let playSound;
let audioCtx;
let music;

beforeEach(async () => {
    ({ FakeAudioContext, created } = createFakeAudioContext());
    window.AudioContext = FakeAudioContext;
    vi.resetModules();
    ({ playSound } = await import('../src/audio/sfx.js'));
    ({ audioCtx } = await import('../src/audio/context.js'));
    music = await import('../src/audio/music.js');
});

describe('audio context', () => {
    it('is created lazily and reused', () => {
        expect(FakeAudioContext.instances).toHaveLength(0);
        const first = audioCtx();
        expect(audioCtx()).toBe(first);
        expect(FakeAudioContext.instances).toHaveLength(1);
    });

    it('resumes a context suspended before the first user gesture', () => {
        const ctx = audioCtx();
        ctx.state = 'suspended';
        playSound('select');
        expect(ctx.resumed).toBe(true);
    });
});

describe('playSound', () => {
    it.each(['text', 'select', 'clink', 'club_beat', 'vr_boop', 'msg_sent'])(
        'schedules a tone for %s',
        (type) => {
            playSound(type);
            const osc = created.oscillators.at(-1);
            expect(osc.started).toHaveLength(1);
            expect(osc.stopped).toHaveLength(1);
        }
    );

    it('uses filtered noise rather than an oscillator for the fire effect', () => {
        playSound('fire');
        expect(created.buffers).toHaveLength(1);
        expect(created.filters.at(-1).type).toBe('lowpass');
    });

    it('stays silent for an unknown effect instead of throwing', () => {
        expect(() => playSound('not-a-sound')).not.toThrow();
        expect(created.oscillators.at(-1).started).toHaveLength(0);
    });
});

describe('music themes', () => {
    const themes = [
        'playAirportTheme',
        'playRomanticTheme',
        'playBlueTheme',
        'playConferenceTheme',
        'playDreamworksTheme',
        'playBattleTheme',
        'playLeFestinTheme'
    ];

    it('exports every theme the scenes call', () => {
        for (const theme of themes) expect(typeof music[theme]).toBe('function');
    });

    it.each(themes)('%s starts playing and can be stopped again', (theme) => {
        music[theme]();
        expect(created.oscillators.length).toBeGreaterThan(0);
        expect(() => music.stopMusic()).not.toThrow();
    });

    it('stopMusic is safe to call when nothing is playing', () => {
        expect(() => music.stopMusic()).not.toThrow();
        expect(() => music.stopMusic()).not.toThrow();
    });

    it('fadeOutMusic ramps down without throwing', () => {
        music.playRomanticTheme();
        expect(() => music.fadeOutMusic(0.5)).not.toThrow();
    });
});

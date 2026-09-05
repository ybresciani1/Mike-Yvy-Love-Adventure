import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTextures } from '../src/textures/generateTextures.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const readSrc = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

export const sceneFiles = () =>
    fs
        .readdirSync(path.join(ROOT, 'src/scenes'))
        .filter((f) => f.endsWith('.js') && f !== 'index.js');

/**
 * Records every texture generateTextures() draws, without needing Phaser: the
 * Graphics object is a proxy whose drawing calls are no-ops and whose
 * generateTexture() calls are captured.
 */
export function collectTextures() {
    const textures = [];
    const graphics = new Proxy(
        {},
        {
            get(_target, prop) {
                if (prop === 'generateTexture') {
                    return (key, width, height) => textures.push({ key, width, height });
                }
                return () => graphics;
            }
        }
    );
    generateTextures({ make: { graphics: () => graphics } });
    return textures;
}

/** Minimal stand-in for the parts of the WebAudio API the game touches. */
export function createFakeAudioContext() {
    const created = { oscillators: [], gains: [], buffers: [], filters: [] };
    const param = () => ({
        value: 0,
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        cancelScheduledValues: () => {}
    });
    const node = (extra = {}) => ({ connect: () => {}, disconnect: () => {}, ...extra });

    class FakeAudioContext {
        constructor() {
            this.state = 'running';
            this.currentTime = 0;
            this.sampleRate = 44100;
            this.destination = node();
            this.resumed = false;
            FakeAudioContext.instances.push(this);
        }
        resume() {
            this.resumed = true;
            this.state = 'running';
        }
        createOscillator() {
            const osc = node({
                type: '',
                frequency: param(),
                detune: param(),
                started: [],
                stopped: []
            });
            osc.start = (t) => osc.started.push(t);
            osc.stop = (t) => osc.stopped.push(t);
            created.oscillators.push(osc);
            return osc;
        }
        createGain() {
            const gain = node({ gain: param() });
            created.gains.push(gain);
            return gain;
        }
        createBufferSource() {
            const src = node({ buffer: null, start: () => {} });
            created.buffers.push(src);
            return src;
        }
        createBuffer(_channels, length) {
            return { length, getChannelData: () => new Float32Array(length) };
        }
        createBiquadFilter() {
            const filter = node({ type: '', frequency: { value: 0 } });
            created.filters.push(filter);
            return filter;
        }
    }
    FakeAudioContext.instances = [];

    return { FakeAudioContext, created };
}

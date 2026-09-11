import { audioCtx } from './context.js';

export function playSound(type) {
    if (audioCtx().state === 'suspended') audioCtx().resume();
    const osc = audioCtx().createOscillator();
    const gain = audioCtx().createGain();
    osc.connect(gain);
    gain.connect(audioCtx().destination);
    const now = audioCtx().currentTime;
    
    if (type === 'text') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'clink') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'club_beat') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.4);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'vr_boop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'msg_sent') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'step') {
        // A footfall: a short filtered thump, pitched a little differently each
        // time so a walk cycle does not turn into a machine gun.
        osc.type = 'sine';
        const base = 90 + Math.random() * 30;
        osc.frequency.setValueAtTime(base, now);
        osc.frequency.exponentialRampToValueAtTime(base * 0.55, now + 0.06);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.08);
    } else if (type === 'door') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.24);
    } else if (type === 'page') {
        // Paper turning: a burst of filtered noise, no tone at all.
        const noise = audioCtx().createBufferSource();
        const buffer = audioCtx().createBuffer(1, audioCtx().sampleRate * 0.18, audioCtx().sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / buffer.length);
        }
        noise.buffer = buffer;
        const filter = audioCtx().createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2200;
        noise.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        noise.start(now);
        return;
    } else if (type === 'shutter') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.08);
    } else if (type === 'whoosh') {
        const noise = audioCtx().createBufferSource();
        const buffer = audioCtx().createBuffer(1, audioCtx().sampleRate * 0.7, audioCtx().sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer;
        const filter = audioCtx().createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.linearRampToValueAtTime(1400, now + 0.35);
        filter.frequency.linearRampToValueAtTime(200, now + 0.7);
        noise.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
        noise.start(now);
        return;
    } else if (type === 'firework') {
        const noise = audioCtx().createBufferSource();
        const buffer = audioCtx().createBuffer(1, audioCtx().sampleRate * 0.9, audioCtx().sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / buffer.length, 2.2);
        }
        noise.buffer = buffer;
        const filter = audioCtx().createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, now);
        filter.frequency.exponentialRampToValueAtTime(240, now + 0.8);
        noise.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
        noise.start(now);
        return;
    } else if (type === 'fire') {
        const noise = audioCtx().createBufferSource();
        const buffer = audioCtx().createBuffer(1, audioCtx().sampleRate * 0.1, audioCtx().sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer;
        const filter = audioCtx().createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx().destination);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noise.start(now);
    }
}

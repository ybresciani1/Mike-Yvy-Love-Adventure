import { audioCtx, onAudioUnlock } from './context.js';

// --- Music Themes ---
let currentMusicNodes = [];

// The theme that is meant to be playing, and whether it began while the browser
// was still refusing to make a sound. A phone stays silent until the player
// touches the screen, and a theme started before that is lost for good: the
// melodies schedule each note against a clock that was not running, and the
// drones get an envelope that has already elapsed by the time it is. So the
// gesture that unlocks the audio starts the theme over.
let currentTheme = null;
let startedSilent = false;

function startTheme(theme) {
    stopMusic();
    currentTheme = theme;
    // Asked for after the resume, not before it: where the browser grants that
    // straight away the theme is audible from its first note, and restarting it
    // on the next tap would only interrupt itself.
    if (audioCtx().state !== 'running') audioCtx().resume();
    startedSilent = audioCtx().state !== 'running';
}

onAudioUnlock(() => {
    if (currentTheme && startedSilent) currentTheme();
});

export function stopMusic() {
    currentTheme = null;
    currentMusicNodes.forEach(node => {
        if(node.stop) node.stop();
        if(node.osc) try { node.osc.stop(); } catch(e){}
        if(node.gain) try { node.gain.disconnect(); } catch(e){}
    });
    currentMusicNodes = [];
}

export function fadeOutMusic(duration) {
    currentTheme = null;
    const now = audioCtx().currentTime;
    currentMusicNodes.forEach(node => {
        if (node.gain && node.gain.gain) {
            node.gain.gain.cancelScheduledValues(now);
            node.gain.gain.setValueAtTime(node.gain.gain.value, now);
            node.gain.gain.linearRampToValueAtTime(0, now + duration);
        }
        setTimeout(() => {
            if(node.stop) node.stop();
            if(node.osc) try { node.osc.stop(); } catch(e){}
            if(node.gain) try { node.gain.disconnect(); } catch(e){}
        }, duration * 1000);
    });
    setTimeout(() => { currentMusicNodes = []; }, duration * 1000);
}

export function playAirportTheme() {
    startTheme(playAirportTheme);
    
    const melody = [
        {f: 523.25, d: 0.2}, {f: 659.25, d: 0.2}, {f: 783.99, d: 0.2}, {f: 523.25, d: 0.4},
        {f: 659.25, d: 0.2}, {f: 783.99, d: 0.2}, {f: 1046.50, d: 0.4}
    ];

    function playNote(idx) {
        if(idx >= melody.length) idx = 0;
        const note = melody[idx];
        const now = audioCtx().currentTime;
        const osc = audioCtx().createOscillator();
        const gain = audioCtx().createGain();
        osc.type = 'triangle';
        osc.frequency.value = note.f;
        osc.connect(gain);
        gain.connect(audioCtx().destination);
        osc.start(now);
        osc.stop(now + note.d * 0.9);
        gain.gain.setValueAtTime(0.02, now); // Very quiet
        gain.gain.linearRampToValueAtTime(0, now + note.d * 0.9);
        
        if(Math.random() > 0.8) {
            const noise = audioCtx().createOscillator();
            const nGain = audioCtx().createGain();
            noise.type = 'sawtooth';
            noise.frequency.value = 50 + Math.random() * 100;
            noise.connect(nGain);
            nGain.connect(audioCtx().destination);
            nGain.gain.setValueAtTime(0.005, now);
            nGain.gain.linearRampToValueAtTime(0, now + 0.5);
            noise.start(now);
            noise.stop(now + 0.5);
        }

        const nextTime = note.d * 1000;
        const timer = setTimeout(() => playNote(idx + 1), nextTime + 200); // Slight pause
        currentMusicNodes.push({stop: () => clearTimeout(timer)});
    }
    playNote(0);
}

export function playRomanticTheme() {
    startTheme(playRomanticTheme);
    const now = audioCtx().currentTime;
    const freqs = [261.63, 329.63, 392.00, 493.88]; 
    freqs.forEach((f) => {
        const osc = audioCtx().createOscillator();
        const gain = audioCtx().createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        osc.detune.value = (Math.random() - 0.5) * 10;
        osc.connect(gain);
        gain.connect(audioCtx().destination);
        osc.start(now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 5);
        currentMusicNodes.push({osc, gain});
    });
}

export function playBlueTheme() {
    startTheme(playBlueTheme);
    
    // "Blue" - Yung Kai melody approximation
    // Key: Eb Major/C minor feel usually, but simplified here to C major scale for implementation ease
    // "You're the sun..." (E D C...)
    const melody = [
        {f: 329.63, d: 0.6}, {f: 293.66, d: 0.3}, {f: 261.63, d: 1.2}, // E D C
        {f: 392.00, d: 0.6}, {f: 329.63, d: 0.3}, {f: 293.66, d: 1.2}, // G E D
        {f: 261.63, d: 0.6}, {f: 293.66, d: 0.3}, {f: 329.63, d: 0.6}, {f: 261.63, d: 0.6}, // C D E C
        {f: 196.00, d: 1.8}, // G (low)
        
        {f: 329.63, d: 0.6}, {f: 293.66, d: 0.3}, {f: 261.63, d: 1.2}, // E D C
        {f: 392.00, d: 0.6}, {f: 329.63, d: 0.3}, {f: 293.66, d: 1.2}, // G E D
    ];

    // Bass/Chords
    const now = audioCtx().currentTime;
    const padFreqs = [130.81, 196.00, 261.63]; // C G C
    padFreqs.forEach(f => {
        const osc = audioCtx().createOscillator();
        const gain = audioCtx().createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(gain);
        gain.connect(audioCtx().destination);
        osc.start(now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 2);
        currentMusicNodes.push({osc, gain});
    });

    function playNote(idx) {
        if(idx >= melody.length) idx = 0;
        const note = melody[idx];
        const now = audioCtx().currentTime;
        const osc = audioCtx().createOscillator();
        const gain = audioCtx().createGain();
        osc.type = 'triangle'; // Softer, dreamy sound
        osc.frequency.value = note.f;
        osc.connect(gain);
        gain.connect(audioCtx().destination);
        osc.start(now);
        osc.stop(now + note.d * 0.95);
        
        // Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.d * 0.95);
        
        const nextTime = note.d * 1000;
        const timer = setTimeout(() => playNote(idx + 1), nextTime);
        currentMusicNodes.push({stop: () => clearTimeout(timer)});
    }
    playNote(0);
}

export function playConferenceTheme() {
    startTheme(playConferenceTheme);
    const melody = [
        {f: 659.25, d: 0.4}, {f: 493.88, d: 0.2}, {f: 523.25, d: 0.2}, {f: 587.33, d: 0.4}, // E B C D
        {f: 523.25, d: 0.2}, {f: 493.88, d: 0.2}, {f: 440.00, d: 0.4}, {f: 440.00, d: 0.2}, // C B A A
        {f: 523.25, d: 0.2}, {f: 659.25, d: 0.4}, {f: 587.33, d: 0.2}, {f: 523.25, d: 0.2}, // C E D C
        {f: 493.88, d: 0.4}, {f: 493.88, d: 0.2}, {f: 523.25, d: 0.2}, {f: 587.33, d: 0.4}, // B B C D
        {f: 659.25, d: 0.4}, {f: 523.25, d: 0.4}, {f: 440.00, d: 0.4}, {f: 440.00, d: 0.4}  // E C A A
    ];
    function playNote(idx) {
        if(idx >= melody.length) idx = 0;
        const note = melody[idx];
        const now = audioCtx().currentTime;
        const osc = audioCtx().createOscillator();
        const gain = audioCtx().createGain();
        osc.type = 'square';
        osc.frequency.value = note.f;
        osc.connect(gain);
        gain.connect(audioCtx().destination);
        osc.start(now);
        osc.stop(now + note.d * 0.9);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + note.d * 0.9);
        const nextTime = note.d * 1000;
        const timer = setTimeout(() => playNote(idx + 1), nextTime);
        currentMusicNodes.push({stop: () => clearTimeout(timer)});
    }
    playNote(0);
}

export function playDreamworksTheme() {
    startTheme(playDreamworksTheme);
    const melody = [
        {f: 392.00, d: 0.4}, {f: 523.25, d: 0.4}, {f: 659.25, d: 0.4}, {f: 783.99, d: 0.8},
        {f: 659.25, d: 0.4}, {f: 783.99, d: 0.4}, {f: 1046.5, d: 0.8},
        {f: 783.99, d: 0.4}, {f: 659.25, d: 0.4}, {f: 523.25, d: 0.8}
    ];
    function playNote(idx) {
        if (idx >= melody.length) return; 
        const note = melody[idx];
        const now = audioCtx().currentTime;
        const osc = audioCtx().createOscillator();
        const gain = audioCtx().createGain();
        osc.type = 'triangle'; 
        osc.frequency.value = note.f;
        osc.connect(gain);
        gain.connect(audioCtx().destination);
        osc.start(now);
        osc.stop(now + note.d * 0.95);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + note.d * 0.95);
        const timer = setTimeout(() => playNote(idx + 1), note.d * 1000);
        currentMusicNodes.push({stop: () => clearTimeout(timer)});
    }
    playNote(0);
}

export function playBattleTheme() {
    startTheme(playBattleTheme);
    const melody = [
        {f: 110.00, d: 0.15}, {f: 130.81, d: 0.15}, {f: 146.83, d: 0.15}, {f: 130.81, d: 0.15},
        {f: 110.00, d: 0.15}, {f: 130.81, d: 0.15}, {f: 164.81, d: 0.15}, {f: 155.56, d: 0.15},
    ];
    function playNote(idx) {
        if(idx >= melody.length) idx = 0;
        const note = melody[idx];
        const now = audioCtx().currentTime;
        const osc = audioCtx().createOscillator();
        const gain = audioCtx().createGain();
        osc.type = 'sawtooth'; 
        osc.frequency.value = note.f;
        osc.connect(gain);
        gain.connect(audioCtx().destination);
        osc.start(now);
        osc.stop(now + note.d * 0.8);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + note.d * 0.8);
        const timer = setTimeout(() => playNote(idx + 1), note.d * 1000);
        currentMusicNodes.push({stop: () => clearTimeout(timer)});
    }
    playNote(0);
}

export function playLeFestinTheme() {
    startTheme(playLeFestinTheme);
    
    const melody = [
        {f: 392.00, d: 0.6}, {f: 440.00, d: 0.3}, {f: 392.00, d: 0.3}, // G A G
        {f: 329.63, d: 0.6}, {f: 392.00, d: 0.3}, {f: 329.63, d: 0.3}, // E G E
        {f: 261.63, d: 0.9}, // C...
        {f: 293.66, d: 0.3}, {f: 329.63, d: 0.3}, {f: 349.23, d: 0.3}, // D E F
        
        {f: 392.00, d: 0.6}, {f: 440.00, d: 0.3}, {f: 392.00, d: 0.3}, // G A G
        {f: 329.63, d: 0.6}, {f: 392.00, d: 0.3}, {f: 329.63, d: 0.3}, // E G E
        {f: 293.66, d: 0.9}, // D...
        
        {f: 523.25, d: 0.6}, {f: 493.88, d: 0.3}, {f: 440.00, d: 0.3}, // C B A
        {f: 392.00, d: 0.6}, {f: 349.23, d: 0.3}, {f: 329.63, d: 0.3}, // G F E
        {f: 293.66, d: 0.6}, {f: 329.63, d: 0.3}, {f: 349.23, d: 0.3}, // D E F
        {f: 392.00, d: 0.9}  // G...
    ];

    function playNote(idx) {
        if(idx >= melody.length) idx = 0;
        const note = melody[idx];
        const now = audioCtx().currentTime;
        
        const osc = audioCtx().createOscillator();
        const gain = audioCtx().createGain();
        osc.type = 'sine'; 
        osc.frequency.value = note.f;
        osc.connect(gain);
        gain.connect(audioCtx().destination);
        osc.start(now);
        osc.stop(now + note.d * 0.95);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + note.d * 0.95);

        if (idx % 3 === 0) { // On the "ONE" of the waltz
            const chordOsc = audioCtx().createOscillator();
            const chordGain = audioCtx().createGain();
            chordOsc.type = 'triangle';
            chordOsc.frequency.value = note.f / 2; 
            chordOsc.connect(chordGain);
            chordGain.connect(audioCtx().destination);
            chordOsc.start(now);
            chordOsc.stop(now + 0.3);
            chordGain.gain.setValueAtTime(0.05, now);
            chordGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            currentMusicNodes.push({osc: chordOsc, gain: chordGain});
        }

        const nextTime = note.d * 1000;
        const timer = setTimeout(() => playNote(idx + 1), nextTime);
        currentMusicNodes.push({stop: () => clearTimeout(timer), osc, gain});
    }
    playNote(0);
}

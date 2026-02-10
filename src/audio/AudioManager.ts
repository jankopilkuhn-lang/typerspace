/**
 * AudioManager - Manages all game audio including background music and sound effects
 */
export class AudioManager {
    private audioContext: AudioContext | null = null;
    private musicEnabled: boolean = true;
    private sfxEnabled: boolean = true;
    private masterVolume: number = 0.5;
    private musicVolume: number = 0.3;
    private sfxVolume: number = 0.5;

    // Background music oscillators
    private bgMusicNodes: OscillatorNode[] = [];
    private bgMusicGain: GainNode | null = null;
    private musicLoopInterval: any = null;

    constructor() {
        // Initialize Web Audio API
        if (typeof AudioContext !== 'undefined') {
            this.audioContext = new AudioContext();
        } else if (typeof (window as any).webkitAudioContext !== 'undefined') {
            this.audioContext = new (window as any).webkitAudioContext();
        }
    }

    /**
     * Play a typing success sound
     */
    playTypeSound(): void {
        if (!this.sfxEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * Play a typing error sound
     */
    playErrorSound(): void {
        if (!this.sfxEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 200;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    /**
     * Play enemy defeated sound
     */
    playEnemyDefeatedSound(): void {
        if (!this.sfxEnabled || !this.audioContext) return;

        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator1.frequency.value = 600;
        oscillator2.frequency.value = 800;
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';

        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.3);
        oscillator2.stop(this.audioContext.currentTime + 0.3);
    }

    /**
     * Play game over sound
     */
    playGameOverSound(): void {
        if (!this.sfxEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    /**
     * Play level complete sound
     */
    playLevelCompleteSound(): void {
        if (!this.sfxEnabled || !this.audioContext) return;

        const times = [0, 0.1, 0.2, 0.3];
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C

        times.forEach((time, index) => {
            const oscillator = this.audioContext!.createOscillator();
            const gainNode = this.audioContext!.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext!.destination);

            oscillator.frequency.value = frequencies[index];
            oscillator.type = 'sine';

            const startTime = this.audioContext!.currentTime + time;
            gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.4);
        });
    }

    /**
     * Start background music for menu
     */
    startMenuMusic(): void {
        if (!this.musicEnabled || !this.audioContext) return;

        this.stopBackgroundMusic();

        // Create gain node for music
        this.bgMusicGain = this.audioContext.createGain();
        this.bgMusicGain.connect(this.audioContext.destination);
        this.bgMusicGain.gain.value = this.musicVolume * this.masterVolume * 0.2;

        // Pop melody: Catchy, upbeat progression in C major
        // Inspired by modern pop chord progressions (I-V-vi-IV)
        const melodyNotes = [
            // Verse 1: C-E-G pattern (uplifting)
            523.25, 659.25, 783.99, 659.25, // C5, E5, G5, E5
            523.25, 587.33, 659.25, 587.33, // C5, D5, E5, D5
            // Chorus: Catchy hook
            783.99, 783.99, 880.00, 783.99, // G5, G5, A5, G5
            659.25, 587.33, 523.25, 587.33, // E5, D5, C5, D5
        ];

        // Harmony notes (thirds above melody for pop sound)
        const harmonyNotes = [
            659.25, 783.99, 987.77, 783.99, // E5, G5, B5, G5
            659.25, 739.99, 783.99, 739.99, // E5, F#5, G5, F#5
            987.77, 987.77, 1046.50, 987.77, // B5, B5, C6, B5
            783.99, 739.99, 659.25, 739.99, // G5, F#5, E5, F#5
        ];

        // Bass line (root notes)
        const bassNotes = [
            130.81, 130.81, 164.81, 164.81, // C3, C3, E3, E3
            196.00, 196.00, 164.81, 164.81, // G3, G3, E3, E3
            196.00, 196.00, 220.00, 196.00, // G3, G3, A3, G3
            164.81, 146.83, 130.81, 146.83, // E3, D3, C3, D3
        ];

        const noteDuration = 0.4; // Upbeat tempo
        let noteIndex = 0;

        const playNextNote = () => {
            if (!this.bgMusicGain || !this.audioContext) return;

            const now = this.audioContext.currentTime;
            const idx = noteIndex % melodyNotes.length;

            // Create stereo panner for wider sound
            const melodyPanner = this.audioContext.createStereoPanner();
            const harmonyPanner = this.audioContext.createStereoPanner();

            // Alternate panning for stereo width
            melodyPanner.pan.value = (idx % 4 === 0 || idx % 4 === 2) ? -0.3 : 0.3;
            harmonyPanner.pan.value = (idx % 4 === 0 || idx % 4 === 2) ? 0.3 : -0.3;

            // Play melody (lead synth)
            const melodyFreq = melodyNotes[idx];
            const melodyOsc = this.audioContext.createOscillator();
            const melodyGain = this.audioContext.createGain();

            melodyOsc.connect(melodyGain);
            melodyGain.connect(melodyPanner);
            melodyPanner.connect(this.bgMusicGain);

            melodyOsc.frequency.value = melodyFreq;
            melodyOsc.type = 'triangle'; // Warmer sound

            melodyGain.gain.setValueAtTime(0, now);
            melodyGain.gain.linearRampToValueAtTime(0.7, now + 0.03);
            melodyGain.gain.setValueAtTime(0.7, now + noteDuration - 0.08);
            melodyGain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

            melodyOsc.start(now);
            melodyOsc.stop(now + noteDuration);

            // Play harmony (adds richness) - opposite pan
            const harmonyFreq = harmonyNotes[idx];
            const harmonyOsc = this.audioContext.createOscillator();
            const harmonyGain = this.audioContext.createGain();

            harmonyOsc.connect(harmonyGain);
            harmonyGain.connect(harmonyPanner);
            harmonyPanner.connect(this.bgMusicGain);

            harmonyOsc.frequency.value = harmonyFreq;
            harmonyOsc.type = 'sine';

            harmonyGain.gain.setValueAtTime(0, now);
            harmonyGain.gain.linearRampToValueAtTime(0.4, now + 0.03);
            harmonyGain.gain.setValueAtTime(0.4, now + noteDuration - 0.08);
            harmonyGain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

            harmonyOsc.start(now);
            harmonyOsc.stop(now + noteDuration);

            // Play POWERFUL bass (center, louder)
            const bassFreq = bassNotes[idx];
            const bassOsc = this.audioContext.createOscillator();
            const bassGain = this.audioContext.createGain();

            // Add sub-bass for extra depth
            const subBassOsc = this.audioContext.createOscillator();
            const subBassGain = this.audioContext.createGain();

            bassOsc.connect(bassGain);
            bassGain.connect(this.bgMusicGain);

            subBassOsc.connect(subBassGain);
            subBassGain.connect(this.bgMusicGain);

            bassOsc.frequency.value = bassFreq;
            bassOsc.type = 'triangle';

            subBassOsc.frequency.value = bassFreq / 2; // One octave lower
            subBassOsc.type = 'sine';

            // Louder bass
            bassGain.gain.setValueAtTime(0, now);
            bassGain.gain.linearRampToValueAtTime(0.8, now + 0.02);
            bassGain.gain.setValueAtTime(0.8, now + noteDuration - 0.05);
            bassGain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

            subBassGain.gain.setValueAtTime(0, now);
            subBassGain.gain.linearRampToValueAtTime(0.5, now + 0.02);
            subBassGain.gain.setValueAtTime(0.5, now + noteDuration - 0.05);
            subBassGain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

            bassOsc.start(now);
            bassOsc.stop(now + noteDuration);
            subBassOsc.start(now);
            subBassOsc.stop(now + noteDuration);

            noteIndex++;
        };

        // Play first note immediately
        playNextNote();

        // Set up loop
        this.musicLoopInterval = setInterval(playNextNote, noteDuration * 1000);
    }

    /**
     * Start background music for gameplay
     */
    startGameplayMusic(): void {
        if (!this.musicEnabled || !this.audioContext) return;

        this.stopBackgroundMusic();

        // Create gain node for music
        this.bgMusicGain = this.audioContext.createGain();
        this.bgMusicGain.connect(this.audioContext.destination);
        this.bgMusicGain.gain.value = this.musicVolume * this.masterVolume * 0.18;

        // Energetic pop melody in A minor (Am-F-C-G progression)
        // Fast-paced, motivating gaming soundtrack
        const melodyNotes = [
            // High energy riff
            880.00, 880.00, 1046.50, 880.00, // A5, A5, C6, A5
            783.99, 880.00, 1046.50, 1174.66, // G5, A5, C6, D6
            1046.50, 1046.50, 880.00, 783.99, // C6, C6, A5, G5
            880.00, 783.99, 659.25, 783.99, // A5, G5, E5, G5
            // Build-up pattern
            659.25, 783.99, 880.00, 1046.50, // E5, G5, A5, C6
            880.00, 783.99, 659.25, 587.33, // A5, G5, E5, D5
            659.25, 783.99, 880.00, 783.99, // E5, G5, A5, G5
            880.00, 1046.50, 880.00, 783.99  // A5, C6, A5, G5
        ];

        // Harmony (creates fuller sound)
        const harmonyNotes = [
            1046.50, 1046.50, 1318.51, 1046.50, // C6, C6, E6, C6
            987.77, 1046.50, 1318.51, 1396.91, // B5, C6, E6, F6
            1318.51, 1318.51, 1046.50, 987.77, // E6, E6, C6, B5
            1046.50, 987.77, 783.99, 987.77, // C6, B5, G5, B5
            783.99, 987.77, 1046.50, 1318.51, // G5, B5, C6, E6
            1046.50, 987.77, 783.99, 739.99, // C6, B5, G5, F#5
            783.99, 987.77, 1046.50, 987.77, // G5, B5, C6, B5
            1046.50, 1318.51, 1046.50, 987.77  // C6, E6, C6, B5
        ];

        // Driving bass line
        const bassNotes = [
            220.00, 220.00, 220.00, 220.00, // A3
            174.61, 174.61, 174.61, 174.61, // F3
            130.81, 130.81, 130.81, 130.81, // C3
            196.00, 196.00, 196.00, 196.00, // G3
            220.00, 220.00, 220.00, 220.00, // A3
            174.61, 174.61, 174.61, 174.61, // F3
            130.81, 130.81, 130.81, 130.81, // C3
            196.00, 196.00, 196.00, 196.00  // G3
        ];

        const noteDuration = 0.25; // Fast, driving tempo
        let noteIndex = 0;

        const playNextNote = () => {
            if (!this.bgMusicGain || !this.audioContext) return;

            const now = this.audioContext.currentTime;
            const idx = noteIndex % melodyNotes.length;

            // Create stereo panners for wider stereo image
            const melodyPanner = this.audioContext.createStereoPanner();
            const harmonyPanner = this.audioContext.createStereoPanner();

            // Dynamic panning - creates movement
            melodyPanner.pan.value = Math.sin(idx * 0.5) * 0.4; // Subtle stereo movement
            harmonyPanner.pan.value = -Math.sin(idx * 0.5) * 0.4; // Opposite

            // Lead synth (melody) - stereo positioned
            const melodyFreq = melodyNotes[idx];
            const melodyOsc = this.audioContext.createOscillator();
            const melodyGain = this.audioContext.createGain();

            melodyOsc.connect(melodyGain);
            melodyGain.connect(melodyPanner);
            melodyPanner.connect(this.bgMusicGain);

            melodyOsc.frequency.value = melodyFreq;
            melodyOsc.type = 'sawtooth'; // Bright, energetic

            melodyGain.gain.setValueAtTime(0, now);
            melodyGain.gain.linearRampToValueAtTime(0.6, now + 0.01);
            melodyGain.gain.setValueAtTime(0.6, now + noteDuration - 0.04);
            melodyGain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

            melodyOsc.start(now);
            melodyOsc.stop(now + noteDuration);

            // Harmony layer - opposite stereo
            const harmonyFreq = harmonyNotes[idx];
            const harmonyOsc = this.audioContext.createOscillator();
            const harmonyGain = this.audioContext.createGain();

            harmonyOsc.connect(harmonyGain);
            harmonyGain.connect(harmonyPanner);
            harmonyPanner.connect(this.bgMusicGain);

            harmonyOsc.frequency.value = harmonyFreq;
            harmonyOsc.type = 'triangle';

            harmonyGain.gain.setValueAtTime(0, now);
            harmonyGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
            harmonyGain.gain.setValueAtTime(0.4, now + noteDuration - 0.04);
            harmonyGain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

            harmonyOsc.start(now);
            harmonyOsc.stop(now + noteDuration);

            // MASSIVE BASS - center, very loud
            const bassFreq = bassNotes[idx];
            const bassOsc = this.audioContext.createOscillator();
            const bassGain = this.audioContext.createGain();

            // Sub-bass layer for extra depth
            const subBassOsc = this.audioContext.createOscillator();
            const subBassGain = this.audioContext.createGain();

            bassOsc.connect(bassGain);
            bassGain.connect(this.bgMusicGain);

            subBassOsc.connect(subBassGain);
            subBassGain.connect(this.bgMusicGain);

            bassOsc.frequency.value = bassFreq;
            bassOsc.type = 'triangle';

            subBassOsc.frequency.value = bassFreq / 2; // One octave lower for sub-bass
            subBassOsc.type = 'sine';

            // Very powerful bass
            bassGain.gain.setValueAtTime(0, now);
            bassGain.gain.linearRampToValueAtTime(1.0, now + 0.01);
            bassGain.gain.setValueAtTime(1.0, now + noteDuration - 0.03);
            bassGain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

            // Deep sub-bass
            subBassGain.gain.setValueAtTime(0, now);
            subBassGain.gain.linearRampToValueAtTime(0.7, now + 0.01);
            subBassGain.gain.setValueAtTime(0.7, now + noteDuration - 0.03);
            subBassGain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);

            bassOsc.start(now);
            bassOsc.stop(now + noteDuration);
            subBassOsc.start(now);
            subBassOsc.stop(now + noteDuration);

            noteIndex++;
        };

        // Play first note immediately
        playNextNote();

        // Set up loop
        this.musicLoopInterval = setInterval(playNextNote, noteDuration * 1000);
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic(): void {
        // Stop the loop interval
        if (this.musicLoopInterval) {
            clearInterval(this.musicLoopInterval);
            this.musicLoopInterval = null;
        }

        this.bgMusicNodes.forEach(node => {
            try {
                node.stop();
            } catch (e) {
                // Node might already be stopped
            }
        });
        this.bgMusicNodes = [];

        if (this.bgMusicGain) {
            this.bgMusicGain.disconnect();
            this.bgMusicGain = null;
        }
    }

    /**
     * Toggle music on/off
     */
    toggleMusic(): boolean {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled) {
            this.stopBackgroundMusic();
        }
        return this.musicEnabled;
    }

    /**
     * Toggle sound effects on/off
     */
    toggleSFX(): boolean {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    /**
     * Set master volume (0-1)
     */
    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.bgMusicGain) {
            this.bgMusicGain.gain.value = this.musicVolume * this.masterVolume;
        }
    }

    /**
     * Set music volume (0-1)
     */
    setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.bgMusicGain) {
            this.bgMusicGain.gain.value = this.musicVolume * this.masterVolume;
        }
    }

    /**
     * Set SFX volume (0-1)
     */
    setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Get current audio status
     */
    getStatus() {
        return {
            musicEnabled: this.musicEnabled,
            sfxEnabled: this.sfxEnabled,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume
        };
    }

    /**
     * Cleanup audio resources
     */
    destroy(): void {
        this.stopBackgroundMusic();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Create singleton instance
export const audioManager = new AudioManager();

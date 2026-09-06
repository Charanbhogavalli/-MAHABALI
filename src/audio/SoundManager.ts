/**
 * SoundManager.ts
 *
 * Authoritative Sound and Music Manager for Mahabali — Three Steps
 *
 * Guarantees seamless, continuous audio playback across all scenes, transitions, and levels.
 * - Uses the 'loop' attribute on the HTMLAudioElement (audio.loop = true)
 * - Sets up an 'ended' event listener that triggers a seamless replay (currentTime = 0; play())
 * - Completely prevents the 1-second and 3-second playback cutoffs by eliminating background pauses,
 *   anchoring the audio reference against iframe GC, and guarding against duplicate playback instances.
 */

import { getCustomTrack, saveCustomTrack, removeCustomTrack } from './AudioStorage';

export type VibeMode = 'cyber_trap' | 'lofi' | 'classic' | 'custom';

export interface GlobalAudioState {
  isPlaying: boolean;
  isMuted: boolean;
  musicVolume: number; // 0 to 1
  sfxVolume: number;   // 0 to 1
  trackName: string;
  vibeMode: VibeMode;
}

export type AudioStateListener = (state: GlobalAudioState) => void;

const AUDIO_SETTINGS_KEY = 'mahabali_audio_settings_v3';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private analyserData: Uint8Array | null = null;

  // Single Authoritative Background Music HTMLAudioElement
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmAudioUrl: string = '/audio/ReelAudio-25004.mp3';
  private isManuallyPausing: boolean = false;

  // Procedural Synth Loop Timers (when playing built-in presets)
  private proceduralTimer: number | null = null;
  private proceduralBassTimer: number | null = null;
  private isProceduralPlaying: boolean = false;

  // Sound Effect Noise Buffers
  private slapNoiseBuffer: AudioBuffer | null = null;
  private splashNoiseBuffer: AudioBuffer | null = null;
  private hihatNoiseBuffer: AudioBuffer | null = null;

  // Global Audio State
  private state: GlobalAudioState = {
    isPlaying: false,
    isMuted: false,
    musicVolume: 0.9,
    sfxVolume: 0.85,
    trackName: 'Onam Festival Reel Song',
    vibeMode: 'custom',
  };

  private listeners: Set<AudioStateListener> = new Set();
  private hasUserInteracted: boolean = false;

  constructor() {
    this.loadSettings();

    // Synchronously create and configure the authoritative HTMLAudioElement
    if (typeof window !== 'undefined') {
      this.createAndConfigureAudioElement(this.bgmAudioUrl, this.state.trackName);
      this.checkSavedCustomTrack();
    }
  }

  /**
   * Configures the HTMLAudioElement with:
   * 1. The 'loop' attribute set to true
   * 2. An 'ended' event listener that triggers a seamless replay
   * 3. Protection against 1-second and 3-second playback cutoffs
   */
  private createAndConfigureAudioElement(url: string, name: string) {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.src = '';
      } catch {}
      this.bgmAudio = null;
    }

    const audio = new Audio(url);

    // 1. Explicitly set the 'loop' attribute on the HTMLAudioElement
    audio.loop = true;
    audio.preload = 'auto';

    // 2. Set up an 'ended' event listener that triggers a seamless replay
    audio.addEventListener('ended', () => {
      this.handleSeamlessReplay(audio);
    });

    // 3. Prevent unintended pause or cutoff
    audio.addEventListener('pause', () => {
      if (this.state.isPlaying && !this.isManuallyPausing) {
        setTimeout(() => {
          if (this.state.isPlaying && !this.isManuallyPausing && audio.paused) {
            audio.play().catch(() => {});
          }
        }, 50);
      }
    });

    // 4. Auto-recover on decoding glitch or temporary stall
    audio.addEventListener('error', (e) => {
      console.warn('Audio element error, auto-recovering:', e);
      if (this.state.isPlaying && !this.isManuallyPausing) {
        setTimeout(() => {
          if (this.state.isPlaying) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
          }
        }, 100);
      }
    });

    audio.volume = this.state.isMuted ? 0 : this.state.musicVolume;
    this.bgmAudio = audio;
    this.bgmAudioUrl = url;
    this.state.trackName = name;

    // Anchor on window to protect against iframe garbage collection cutoffs
    if (typeof window !== 'undefined') {
      (window as unknown as { __mahabali_bgm_audio__?: HTMLAudioElement }).__mahabali_bgm_audio__ = audio;
    }
  }

  /**
   * Triggers a seamless replay when track ends
   */
  private handleSeamlessReplay(audio: HTMLAudioElement) {
    if (this.state.isPlaying) {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Seamless replay was prevented:', err);
        });
      }
    }
  }

  /**
   * Checks for custom track saved in IndexedDB WITHOUT interrupting playback if already playing
   */
  private async checkSavedCustomTrack() {
    try {
      const custom = await getCustomTrack();
      if (custom && custom.blob) {
        // Only override if the user previously selected custom and audio is NOT already actively playing
        if (this.state.vibeMode === 'custom' && !this.isMusicActivelyPlaying()) {
          const url = URL.createObjectURL(custom.blob);
          this.createAndConfigureAudioElement(url, custom.name);
          this.notify();
        }
      }
    } catch (e) {
      console.warn('Custom track lookup error:', e);
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.isMuted === 'boolean') this.state.isMuted = parsed.isMuted;
        if (typeof parsed.musicVolume === 'number' && parsed.musicVolume > 0.05) {
          this.state.musicVolume = parsed.musicVolume;
        } else {
          this.state.musicVolume = 0.9;
        }
        if (typeof parsed.sfxVolume === 'number') this.state.sfxVolume = parsed.sfxVolume;
        if (parsed.vibeMode) this.state.vibeMode = parsed.vibeMode;
      }
    } catch {}
  }

  private saveSettings() {
    try {
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({
        isMuted: this.state.isMuted,
        musicVolume: this.state.musicVolume,
        sfxVolume: this.state.sfxVolume,
        vibeMode: this.state.vibeMode,
      }));
    } catch {}
  }

  /**
   * Initializes the Web Audio context and sound effects
   */
  public init() {
    if (this.hasUserInteracted && this.ctx && this.ctx.state === 'running') return;
    this.hasUserInteracted = true;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.ctx = new AudioCtxClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.state.isMuted ? 0 : 1, this.ctx.currentTime);

      // Music Gain
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.state.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.state.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Realtime Frequency Analyser
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.generateSynthesizerNoiseBuffers();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private generateSynthesizerNoiseBuffers() {
    if (!this.ctx) return;
    try {
      const sampleRate = this.ctx.sampleRate;

      // 1. Chenda Slap Noise Buffer (0.06s)
      const slapLen = Math.floor(sampleRate * 0.06);
      this.slapNoiseBuffer = this.ctx.createBuffer(1, slapLen, sampleRate);
      const slapData = this.slapNoiseBuffer.getChannelData(0);
      for (let i = 0; i < slapLen; i++) {
        slapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (slapLen * 0.25));
      }

      // 2. Water Splash Noise Buffer (0.2s)
      const splashLen = Math.floor(sampleRate * 0.2);
      this.splashNoiseBuffer = this.ctx.createBuffer(1, splashLen, sampleRate);
      const splashData = this.splashNoiseBuffer.getChannelData(0);
      for (let i = 0; i < splashLen; i++) {
        splashData[i] = (Math.random() * 2 - 1) * Math.sin((i / splashLen) * Math.PI);
      }

      // 3. Trap Hi-Hat Noise Buffer (0.04s)
      const hihatLen = Math.floor(sampleRate * 0.04);
      this.hihatNoiseBuffer = this.ctx.createBuffer(1, hihatLen, sampleRate);
      const hihatData = this.hihatNoiseBuffer.getChannelData(0);
      for (let i = 0; i < hihatLen; i++) {
        hihatData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (hihatLen * 0.18));
      }
    } catch {}
  }

  /**
   * Realtime Frequency spectrum data for equalizer visualizers
   */
  public getAudioWaveData(): number[] {
    if (this.analyser && this.analyserData) {
      this.analyser.getByteFrequencyData(this.analyserData);
      return Array.from(this.analyserData);
    }
    // Fallback simulation if AudioContext not started
    const now = Date.now() * 0.008;
    return [
      Math.abs(Math.sin(now) * 180 + 40),
      Math.abs(Math.cos(now * 1.2) * 220 + 30),
      Math.abs(Math.sin(now * 1.5) * 190 + 50),
      Math.abs(Math.cos(now * 0.8) * 160 + 60),
    ];
  }

  public getState(): GlobalAudioState {
    return { ...this.state };
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const s = { ...this.state };
    this.listeners.forEach((cb) => {
      try {
        cb(s);
      } catch {}
    });
  }

  public setMusicVolume(volume: number) {
    this.state.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.state.isMuted ? 0 : this.state.musicVolume;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.state.musicVolume, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public setSfxVolume(volume: number) {
    this.state.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.state.sfxVolume, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public toggleMute(): boolean {
    this.init();
    this.state.isMuted = !this.state.isMuted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.state.isMuted ? 0 : this.state.musicVolume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.state.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    if (!this.state.isMuted && !this.isMusicActivelyPlaying()) {
      this.playMusic();
    }
    this.saveSettings();
    this.notify();
    return this.state.isMuted;
  }

  public unmute() {
    this.init();
    this.state.isMuted = false;
    if (this.state.musicVolume < 0.1) this.state.musicVolume = 0.9;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.state.musicVolume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public mute() {
    this.init();
    this.state.isMuted = true;
    if (this.bgmAudio) {
      this.bgmAudio.volume = 0;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    this.saveSettings();
    this.notify();
  }

  public isMusicActivelyPlaying(): boolean {
    if (this.state.isMuted) return false;
    if (this.bgmAudio && !this.bgmAudio.paused) return true;
    if (this.isProceduralPlaying) return true;
    return false;
  }

  /**
   * Ensures continuous background music is actively playing across all levels without restarting
   */
  public ensureMusicPlaying() {
    this.init();
    if (this.isMusicActivelyPlaying()) return;
    this.playMusic();
  }

  public startAmbientTrack(_level?: number) {
    this.ensureMusicPlaying();
  }

  public stopAmbientTrack() {
    this.pauseMusic();
  }

  /**
   * Starts playing the background audio loop
   */
  public async playMusic() {
    this.init();
    this.isManuallyPausing = false;
    this.state.isPlaying = true;
    this.stopProcedural();

    if (this.state.vibeMode !== 'custom') {
      this.startProceduralPreset(this.state.vibeMode);
      this.notify();
      return;
    }

    if (this.bgmAudio) {
      // If already playing smoothly, don't restart it
      if (!this.bgmAudio.paused && this.bgmAudio.currentTime > 0) {
        this.notify();
        return;
      }

      this.bgmAudio.volume = this.state.isMuted ? 0 : this.state.musicVolume;
      try {
        const playPromise = this.bgmAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        console.warn('Playback deferred or waiting for user gesture:', err);
      }
    }

    this.notify();
  }

  /**
   * Pauses the background music
   */
  public pauseMusic() {
    this.isManuallyPausing = true;
    this.state.isPlaying = false;
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
      } catch {}
    }
    this.stopProcedural();
    this.notify();
    setTimeout(() => {
      this.isManuallyPausing = false;
    }, 120);
  }

  public stopMusic() {
    this.pauseMusic();
    if (this.bgmAudio) {
      try {
        this.bgmAudio.currentTime = 0;
      } catch {}
    }
  }

  public togglePlayPause() {
    if (this.state.isPlaying) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
  }

  public setVibeMode(mode: VibeMode) {
    this.init();
    this.state.vibeMode = mode;
    if (mode === 'cyber_trap') this.state.trackName = '808 Cyber-Chenda Trap';
    if (mode === 'lofi') this.state.trackName = 'Monsoon Backwaters Lo-Fi';
    if (mode === 'classic') this.state.trackName = 'Vedic Temple Flute';
    if (mode === 'custom') this.state.trackName = 'Onam Festival Reel Song';

    if (this.state.isPlaying) {
      if (mode === 'custom') {
        this.stopProcedural();
        if (this.bgmAudio) {
          this.bgmAudio.volume = this.state.isMuted ? 0 : this.state.musicVolume;
          this.bgmAudio.play().catch(() => {});
        }
      } else {
        if (this.bgmAudio) {
          try {
            this.bgmAudio.pause();
          } catch {}
        }
        this.startProceduralPreset(mode);
      }
    }
    this.saveSettings();
    this.notify();
  }

  // --- Custom Audio File Upload Handling (.mp3, .wav, .m4a) ---
  public async loadCustomAudioFile(file: File): Promise<boolean> {
    this.init();
    const validExtensions = /\.(mp3|wav|m4a|aac|ogg)$/i;
    if (!file.type.startsWith('audio/') && !file.name.match(validExtensions)) {
      throw new Error('Unsupported audio format. Please upload .mp3, .wav, or .m4a');
    }

    try {
      const saved = await saveCustomTrack(file);
      const url = URL.createObjectURL(saved.blob);
      this.createAndConfigureAudioElement(url, saved.name);
      this.setVibeMode('custom');
      this.playMusic();
      return true;
    } catch (err) {
      console.error('Failed to load custom audio', err);
      throw err;
    }
  }

  public async deleteCustomTrack() {
    await removeCustomTrack();
    this.createAndConfigureAudioElement('/audio/ReelAudio-25004.mp3', 'Onam Festival Reel Song');
    this.setVibeMode('custom');
    if (this.state.isPlaying) {
      this.playMusic();
    }
  }

  // --- Procedural Acoustic & Trap Synthesizer Engine ---
  private startProceduralPreset(mode: VibeMode) {
    this.stopProcedural();
    this.isProceduralPlaying = true;
    if (!this.ctx) return;

    if (mode === 'cyber_trap') {
      this.runCyberTrapLoop();
    } else if (mode === 'lofi') {
      this.runLoFiLoop();
    } else {
      this.runClassicFluteLoop();
    }
  }

  private stopProcedural() {
    this.isProceduralPlaying = false;
    if (this.proceduralTimer !== null) {
      clearTimeout(this.proceduralTimer);
      this.proceduralTimer = null;
    }
    if (this.proceduralBassTimer !== null) {
      clearTimeout(this.proceduralBassTimer);
      this.proceduralBassTimer = null;
    }
  }

  private runCyberTrapLoop() {
    let step = 0;
    const bpm = 140;
    const tickInterval = (60 / bpm / 4) * 1000;
    const trapNotes = [174.61, 207.65, 233.08, 261.63, 311.13];

    const stepLoop = () => {
      if (!this.isProceduralPlaying || this.state.vibeMode !== 'cyber_trap') return;
      if (!this.ctx || this.state.isMuted) {
        this.proceduralTimer = window.setTimeout(stepLoop, tickInterval);
        return;
      }

      const beat16 = step % 16;
      step++;

      if (beat16 === 0 || beat16 === 10) {
        this.play808Bass(46.25, 0.4);
      } else if (beat16 === 6 || beat16 === 14) {
        this.play808Bass(55.0, 0.35);
      }

      if (beat16 === 4 || beat16 === 12) {
        this.playTrapSnare();
      }

      this.playTrapHiHat(beat16 % 4 === 2 ? 0.025 : 0.015);

      if (step % 2 === 0 && Math.random() > 0.3) {
        const note = trapNotes[(step + Math.floor(Math.random() * 3)) % trapNotes.length];
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, t);

        gain.gain.setValueAtTime(0.07 * this.state.musicVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.musicGain || this.masterGain!);
        osc.start(t);
        osc.stop(t + 0.38);
      }

      this.proceduralTimer = window.setTimeout(stepLoop, tickInterval);
    };

    this.proceduralTimer = window.setTimeout(stepLoop, 100);
  }

  private runLoFiLoop() {
    let chordIdx = 0;
    const lofiChords = [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 349.23],
    ];

    const runChord = () => {
      if (!this.isProceduralPlaying || this.state.vibeMode !== 'lofi') return;
      if (!this.ctx || this.state.isMuted) {
        this.proceduralTimer = window.setTimeout(runChord, 2600);
        return;
      }

      const chord = lofiChords[chordIdx % lofiChords.length];
      chordIdx++;

      chord.forEach((freq, idx) => {
        const t = this.ctx!.currentTime;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1100;

        gain.gain.setValueAtTime(0.001, t + idx * 0.03);
        gain.gain.linearRampToValueAtTime(0.04 * this.state.musicVolume, t + idx * 0.03 + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.03 + 2.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain || this.masterGain!);

        osc.start(t + idx * 0.03);
        osc.stop(t + idx * 0.03 + 2.4);
      });

      this.proceduralTimer = window.setTimeout(runChord, 2600);
    };

    this.proceduralTimer = window.setTimeout(runChord, 200);
  }

  private runClassicFluteLoop() {
    let noteIdx = 0;
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

    const stepMelody = () => {
      if (!this.isProceduralPlaying || this.state.vibeMode !== 'classic') return;
      if (!this.ctx || this.state.isMuted) {
        this.proceduralTimer = window.setTimeout(stepMelody, 1600);
        return;
      }

      const t = this.ctx.currentTime;
      const freq = scale[noteIdx % scale.length];
      noteIdx = (noteIdx + (Math.random() > 0.4 ? 1 : 2)) % scale.length;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const vibrato = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(4.5, t);
      vibGain.gain.setValueAtTime(3.5, t);
      vibrato.connect(osc.frequency);
      vibrato.start(t);
      vibrato.stop(t + 1.4);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.05 * this.state.musicVolume, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.35);

      osc.connect(gain);
      gain.connect(this.musicGain || this.masterGain!);

      osc.start(t);
      osc.stop(t + 1.4);

      const delay = 1400 + Math.random() * 600;
      this.proceduralTimer = window.setTimeout(stepMelody, delay);
    };

    this.proceduralTimer = window.setTimeout(stepMelody, 300);
  }

  // --- Sound Effects (SFX) ---
  public playFlowerPlace(pitchMultiplier: number = 1.0) {
    if (!this.ctx || this.state.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 587.33 * pitchMultiplier;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.3);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2.76, t);

    gain.gain.setValueAtTime(0.3 * this.state.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    gain2.gain.setValueAtTime(0.12 * this.state.sfxVolume, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.sfxGain || this.masterGain!);
    gain2.connect(this.sfxGain || this.masterGain!);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.5);
    osc2.stop(t + 0.35);
  }

  public playChendaBeat(power: number = 1.0, isHighSnap: boolean = false) {
    if (!this.ctx || this.state.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isHighSnap) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

      gain.gain.setValueAtTime(0.4 * power * this.state.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.16);

      gain.gain.setValueAtTime(0.6 * power * this.state.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    }

    if (this.slapNoiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.slapNoiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = isHighSnap ? 1800 : 800;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25 * power * this.state.sfxVolume, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain || this.masterGain!);
      noise.start(t);
      noise.stop(t + 0.06);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playWaterSplash(intensity: number = 0.5) {
    if (!this.ctx || this.state.isMuted || !this.splashNoiseBuffer) return;
    this.init();

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.splashNoiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900 * intensity, t);
    filter.frequency.linearRampToValueAtTime(300, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25 * intensity * this.state.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.masterGain!);

    noise.start(t);
    noise.stop(t + 0.18);
  }

  public playDishPlaced(isSpecial: boolean = false) {
    if (!this.ctx || this.state.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isSpecial ? 523.25 : 329.63;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.33, t + 0.15);

    gain.gain.setValueAtTime(0.35 * this.state.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  public playTap() {
    if (!this.ctx || this.state.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.05);

    gain.gain.setValueAtTime(0.2 * this.state.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  public playPowerUpCollect() {
    if (!this.ctx || this.state.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.2 * this.state.sfxVolume, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain!);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.22);
    });
  }

  public playConchBlast() {
    if (!this.ctx || this.state.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(330, t + 0.3);
    osc.frequency.linearRampToValueAtTime(310, t + 1.2);
    osc.frequency.exponentialRampToValueAtTime(110, t + 1.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.4);
    filter.frequency.exponentialRampToValueAtTime(400, t + 1.8);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4 * this.state.sfxVolume, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.masterGain!);

    osc.start(t);
    osc.stop(t + 1.85);
  }

  public playCrowdCheer() {
    if (!this.ctx || this.state.isMuted || !this.splashNoiseBuffer) return;
    this.init();

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.splashNoiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3 * this.state.sfxVolume, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.masterGain!);
    noise.start(t);
    noise.stop(t + 0.95);
  }

  public playLevelSuccess() {
    if (!this.ctx || this.state.isMuted) return;
    this.init();

    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.state.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.28 * this.state.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

        osc.connect(gain);
        gain.connect(this.sfxGain || this.masterGain!);
        osc.start(t);
        osc.stop(t + 1.0);
      }, idx * 110);
    });
  }

  public play808Bass(freq: number = 48, duration: number = 0.45) {
    if (!this.ctx || this.state.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 2.2, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);

      gain.gain.setValueAtTime(0.7 * this.state.musicVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.musicGain || this.masterGain!);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch {}
  }

  public playTrapSnare() {
    if (!this.ctx || this.state.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      if (this.slapNoiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.slapNoiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35 * this.state.musicVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain || this.masterGain!);
        noise.start(t);
        noise.stop(t + 0.13);
      }

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

      oscGain.gain.setValueAtTime(0.3 * this.state.musicVolume, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(oscGain);
      oscGain.connect(this.musicGain || this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {}
  }

  public playTrapHiHat(decay: number = 0.03) {
    if (!this.ctx || this.state.isMuted || !this.hihatNoiseBuffer) return;
    try {
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.hihatNoiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(8000, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18 * this.state.musicVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain || this.masterGain!);
      noise.start(t);
      noise.stop(t + decay + 0.02);
    } catch {}
  }
}

// Single authoritative SoundManager instance exported across the application
export const soundManager = new SoundManager();
export const globalAudio = soundManager;
export default soundManager;

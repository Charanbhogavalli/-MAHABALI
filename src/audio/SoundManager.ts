/**
 * Single background soundtrack and independent game sound effects.
 */

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private slapNoiseBuffer: AudioBuffer | null = null;
  private splashNoiseBuffer: AudioBuffer | null = null;
  private hihatNoiseBuffer: AudioBuffer | null = null;
  private readonly sfxVolume = 0.85;

  constructor() {
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(1, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    this.generateNoiseBuffers();
  }

  private generateNoiseBuffers() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const createNoise = (duration: number, envelope: (index: number, length: number) => number) => {
      const buffer = this.ctx!.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index++) {
        data[index] = (Math.random() * 2 - 1) * envelope(index, data.length);
      }
      return buffer;
    };

    this.slapNoiseBuffer = createNoise(0.06, (index, length) => Math.exp(-index / (length * 0.25)));
    this.splashNoiseBuffer = createNoise(0.2, (index, length) => Math.sin((index / length) * Math.PI));
    this.hihatNoiseBuffer = createNoise(0.04, (index, length) => Math.exp(-index / (length * 0.18)));
  }

  private getSfxOutput() {
    this.init();
    return this.sfxGain || this.masterGain;
  }

  public playFlowerPlace(pitchMultiplier: number = 1) {
    const output = this.getSfxOutput();
    if (!this.ctx || !output) return;
    const time = this.ctx.currentTime;
    const frequency = 587.33 * pitchMultiplier;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, time + 0.3);
    gain.gain.setValueAtTime(0.3 * this.sfxVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(time);
    oscillator.stop(time + 0.5);
  }

  public playChendaBeat(power: number = 1, isHighSnap: boolean = false) {
    const output = this.getSfxOutput();
    if (!this.ctx || !output) return;
    const time = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = isHighSnap ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(isHighSnap ? 420 : 160, time);
    oscillator.frequency.exponentialRampToValueAtTime(isHighSnap ? 140 : 55, time + (isHighSnap ? 0.08 : 0.16));
    gain.gain.setValueAtTime((isHighSnap ? 0.4 : 0.6) * power * this.sfxVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isHighSnap ? 0.09 : 0.2));
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(time);
    oscillator.stop(time + 0.22);

    if (this.slapNoiseBuffer) {
      const noise = this.ctx.createBufferSource();
      const noiseGain = this.ctx.createGain();
      noise.buffer = this.slapNoiseBuffer;
      noiseGain.gain.setValueAtTime(0.25 * power * this.sfxVolume, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      noise.connect(noiseGain);
      noiseGain.connect(output);
      noise.start(time);
      noise.stop(time + 0.06);
    }
  }

  public playWaterSplash(intensity: number = 0.5) {
    const output = this.getSfxOutput();
    if (!this.ctx || !output || !this.splashNoiseBuffer) return;
    const time = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    noise.buffer = this.splashNoiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900 * intensity, time);
    filter.frequency.linearRampToValueAtTime(300, time + 0.15);
    gain.gain.setValueAtTime(0.25 * intensity * this.sfxVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    noise.start(time);
    noise.stop(time + 0.18);
  }

  public playDishPlaced(isSpecial: boolean = false) {
    const output = this.getSfxOutput();
    if (!this.ctx || !output) return;
    const time = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const frequency = isSpecial ? 523.25 : 329.63;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.33, time + 0.15);
    gain.gain.setValueAtTime(0.35 * this.sfxVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(time);
    oscillator.stop(time + 0.28);
  }

  public playTap() {
    const output = this.getSfxOutput();
    if (!this.ctx || !output) return;
    const time = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(480, time);
    oscillator.frequency.exponentialRampToValueAtTime(240, time + 0.05);
    gain.gain.setValueAtTime(0.2 * this.sfxVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(time);
    oscillator.stop(time + 0.07);
  }

  public playPowerUpCollect() {
    const output = this.getSfxOutput();
    if (!this.ctx || !output) return;
    const time = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, time + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + index * 0.05 + 0.2);
      oscillator.connect(gain);
      gain.connect(output);
      oscillator.start(time + index * 0.05);
      oscillator.stop(time + index * 0.05 + 0.22);
    });
  }

  public playConchBlast() {
    const output = this.getSfxOutput();
    if (!this.ctx || !output) return;
    const time = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, time);
    oscillator.frequency.linearRampToValueAtTime(330, time + 0.3);
    oscillator.frequency.linearRampToValueAtTime(310, time + 1.2);
    oscillator.frequency.exponentialRampToValueAtTime(110, time + 1.8);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.linearRampToValueAtTime(1200, time + 0.4);
    filter.frequency.exponentialRampToValueAtTime(400, time + 1.8);
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.4 * this.sfxVolume, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    oscillator.start(time);
    oscillator.stop(time + 1.85);
  }

  public playCrowdCheer() {
    const output = this.getSfxOutput();
    if (!this.ctx || !output || !this.splashNoiseBuffer) return;
    const time = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    noise.buffer = this.splashNoiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, time);
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.3 * this.sfxVolume, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    noise.start(time);
    noise.stop(time + 0.95);
  }

  public playLevelSuccess() {
    const output = this.getSfxOutput();
    if (!this.ctx || !output) return;
    [440, 554.37, 659.25, 880, 1108.73].forEach((frequency, index) => {
      window.setTimeout(() => {
        if (!this.ctx) return;
        const time = this.ctx.currentTime;
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, time);
        gain.gain.setValueAtTime(0.28 * this.sfxVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);
        oscillator.connect(gain);
        gain.connect(output);
        oscillator.start(time);
        oscillator.stop(time + 1);
      }, index * 110);
    });
  }
}

export const soundManager = new SoundManager();
export const globalAudio = soundManager;
export default soundManager;

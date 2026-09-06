/**
 * GlobalAudioManager.ts
 *
 * Re-exports the authoritative SoundManager singleton to preserve backwards compatibility
 * while guaranteeing a single authoritative HTMLAudioElement instance with loop = true
 * and seamless replay event listeners.
 */

export * from './SoundManager';
export { SoundManager, soundManager, globalAudio } from './SoundManager';
export { soundManager as default } from './SoundManager';

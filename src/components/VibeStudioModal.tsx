import React, { useState, useEffect, useRef } from 'react';
import { globalAudio, VibeMode, GlobalAudioState } from '../audio/GlobalAudioManager';
import { getCustomTrack, StoredAudioTrack } from '../audio/AudioStorage';
import {
  Music,
  Upload,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Trash2,
  Disc,
  Waves,
  Flame,
  Coffee,
  Radio,
  Check,
  Sparkles,
} from 'lucide-react';

interface VibeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const VibeStudioModal: React.FC<VibeStudioModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
}) => {
  const [audioState, setAudioState] = useState<GlobalAudioState>(() => globalAudio.getState());
  const [customTrack, setCustomTrack] = useState<StoredAudioTrack | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>([25, 45, 65, 35, 75, 50, 85, 40]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to central GlobalAudioManager updates
  useEffect(() => {
    const unsubscribe = globalAudio.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  // Fetch stored custom track on mount
  useEffect(() => {
    getCustomTrack().then((track) => {
      if (track) {
        setCustomTrack(track);
      }
    });
  }, [isOpen]);

  // Visualizer spectrum loop
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const liveData = globalAudio.getAudioWaveData();
      setWaveHeights(liveData.map((v) => Math.max(14, (v / 255) * 100)));
    }, 80);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectMode = (mode: VibeMode) => {
    globalAudio.playTap();
    globalAudio.setVibeMode(mode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check valid audio types (.mp3, .wav, .m4a, .aac, .ogg)
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setUploadError('Please select a valid audio file (.mp3, .wav, or .m4a)');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      await globalAudio.loadCustomAudioFile(file);
      const saved = await getCustomTrack();
      setCustomTrack(saved);
      globalAudio.playPowerUpCollect();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not process audio file';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustom = async (e: React.MouseEvent) => {
    e.stopPropagation();
    globalAudio.playTap();
    await globalAudio.deleteCustomTrack();
    setCustomTrack(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1e0d06] via-[#150702] to-[#0a0301] border border-[#f59e0b]/40 shadow-2xl shadow-amber-950/80 p-5 text-[#fbf6ea] overflow-y-auto max-h-[92vh] flex flex-col space-y-4">
        {/* Glow ambient background accents */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#f59e0b]/25 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] text-white shadow-md shadow-amber-950/50">
              <Disc
                className="w-5 h-5 text-amber-200"
                style={{
                  animation: audioState.isPlaying && !audioState.isMuted ? 'spin 5s linear infinite' : 'none',
                }}
              />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-base text-[#fef08a] flex items-center gap-1.5">
                VIBE STUDIO
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  GLOBAL BGM
                </span>
              </h3>
              <p className="text-[11px] text-amber-200/70 font-philosopher">
                Unified Soundtrack Across All 3 Steps
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              globalAudio.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#271206] hover:bg-[#3d1d0a] text-amber-200/80 hover:text-white flex items-center justify-center border border-[#b45309]/40 text-xs font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Currently Playing Card */}
        <div className="p-3.5 rounded-2xl bg-[#0d0502]/90 border border-[#f59e0b]/30 flex flex-col space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 flex items-center justify-center text-amber-400 shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-cinzel font-semibold tracking-wider text-amber-400/80">
                  Currently Playing
                </p>
                <p className="text-xs font-bold text-[#fef08a] truncate">
                  {audioState.trackName || 'Kerala Melam Beat'}
                </p>
              </div>
            </div>

            {/* Live Equalizer Animation */}
            <div className="flex items-end gap-1 h-6 shrink-0">
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-amber-600 to-yellow-300 transition-all duration-75"
                  style={{
                    height: `${audioState.isPlaying && !audioState.isMuted ? Math.max(10, h * 0.24) : 4}px`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Player Controls Row: [ PLAY ] [ PAUSE ] and [ ♫ MUSIC ON / MUTED ] */}
          <div className="flex items-center justify-between pt-1 border-t border-[#f59e0b]/20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  globalAudio.playTap();
                  globalAudio.playMusic();
                }}
                className={`px-3 py-1.5 rounded-xl font-cinzel font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  audioState.isPlaying && !audioState.isMuted
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                    : 'bg-[#220e06] hover:bg-[#34160a] text-amber-200 border border-[#b45309]/40'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY</span>
              </button>

              <button
                onClick={() => {
                  globalAudio.playTap();
                  globalAudio.pauseMusic();
                }}
                className={`px-3 py-1.5 rounded-xl font-cinzel font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  !audioState.isPlaying
                    ? 'bg-amber-600/80 text-white shadow-md'
                    : 'bg-[#220e06] hover:bg-[#34160a] text-amber-200 border border-[#b45309]/40'
                }`}
              >
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </button>
            </div>

            <button
              onClick={() => {
                globalAudio.playTap();
                globalAudio.toggleMute();
                onToggleSound();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#220e06] hover:bg-[#34160a] border border-[#b45309]/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {audioState.isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300">♫ MUTED</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">♫ MUSIC ON</span>
                </>
              )}
            </button>
          </div>

          {/* Volume Slider: Volume ━━━━━━━━━ */}
          <div className="pt-1 flex flex-col space-y-1">
            <div className="flex items-center justify-between text-[11px] font-cinzel text-amber-200/80">
              <span>Volume</span>
              <span className="font-bold text-amber-300">
                {Math.round(audioState.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioState.musicVolume}
              onChange={(e) => globalAudio.setMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-[#2a1308] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* YOUR MUSIC Section (Custom Upload) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-cinzel font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>YOUR MUSIC</span>
            </p>
            <span className="text-[10px] text-amber-200/60 font-philosopher">
              .mp3, .wav, .m4a
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a"
            onChange={handleFileUpload}
            className="hidden"
          />

          {customTrack ? (
            <div
              onClick={() => handleSelectMode('custom')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                audioState.vibeMode === 'custom'
                  ? 'bg-gradient-to-r from-amber-950/70 to-orange-950/70 border-amber-400 shadow-md shadow-amber-950/60'
                  : 'bg-[#1b0c05]/60 border-[#b45309]/30 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <div className="w-8 h-8 shrink-0 rounded-xl bg-amber-900/60 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Music className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{customTrack.name}</p>
                  <p className="text-[10px] text-amber-300/80">
                    {(customTrack.size / 1024 / 1024).toFixed(2)} MB • Saved in Browser
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDeleteCustom}
                  title="Remove uploaded music"
                  className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-300 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {audioState.vibeMode === 'custom' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                onClick={() => handleSelectMode('custom')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  audioState.vibeMode === 'custom'
                    ? 'bg-gradient-to-r from-amber-950/70 to-orange-950/70 border-amber-400 shadow-md shadow-amber-950/60'
                    : 'bg-[#1b0c05]/60 border-[#b45309]/30 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <div className="w-8 h-8 shrink-0 rounded-xl bg-amber-900/60 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">ReelAudio-25004.mp3 (Default)</p>
                    <p className="text-[10px] text-amber-300/80">Full Length Onam Festival Track</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {audioState.vibeMode === 'custom' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
              </div>

              <button
                onClick={() => {
                  globalAudio.playTap();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#f59e0b]/40 hover:border-amber-400 bg-[#160a04]/60 hover:bg-[#220f06] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold text-amber-300 active:scale-98"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{isUploading ? 'Saving Track...' : 'Upload Different MP3 / Audio'}</span>
              </button>
            </div>
          )}

          {uploadError && (
            <p className="text-[11px] text-red-400 text-center">{uploadError}</p>
          )}
        </div>

        {/* Curated Authentic Kerala Sound Presets */}
        <div className="space-y-2 pt-1 border-t border-[#f59e0b]/20">
          <p className="text-[11px] font-cinzel font-bold tracking-wider text-amber-400 uppercase">
            Curated Festival Presets
          </p>

          {/* 1. Cyber-Chenda 808 Trap */}
          <div
            onClick={() => handleSelectMode('cyber_trap')}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              audioState.vibeMode === 'cyber_trap'
                ? 'bg-gradient-to-r from-red-950/60 to-amber-950/60 border-amber-400 shadow-md'
                : 'bg-[#1b0c05]/60 border-[#b45309]/30 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-red-900/60 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">808 Cyber-Chenda Trap</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-semibold">140 BPM</span>
                </div>
                <p className="text-[10px] text-zinc-400">Deep 808 sub-bass, trap hi-hats & temple rolls</p>
              </div>
            </div>
            {audioState.vibeMode === 'cyber_trap' && <Check className="w-4 h-4 text-amber-400" />}
          </div>

          {/* 2. Monsoon Lo-Fi */}
          <div
            onClick={() => handleSelectMode('lofi')}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              audioState.vibeMode === 'lofi'
                ? 'bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border-emerald-400 shadow-md'
                : 'bg-[#1b0c05]/60 border-[#b45309]/30 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Coffee className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Monsoon Backwaters Lo-Fi</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-semibold">75 BPM</span>
                </div>
                <p className="text-[10px] text-zinc-400">Tape flutter Rhodes chords & chill raindrops</p>
              </div>
            </div>
            {audioState.vibeMode === 'lofi' && <Check className="w-4 h-4 text-emerald-400" />}
          </div>

          {/* 3. Vedic Temple Flute */}
          <div
            onClick={() => handleSelectMode('classic')}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              audioState.vibeMode === 'classic'
                ? 'bg-gradient-to-r from-amber-950/60 to-yellow-950/60 border-yellow-400 shadow-md'
                : 'bg-[#1b0c05]/60 border-[#b45309]/30 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-900/60 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Vedic Temple Flute</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-semibold">Acoustic</span>
                </div>
                <p className="text-[10px] text-zinc-400">Authentic Raag Mohanam flute & brass chimes</p>
              </div>
            </div>
            {audioState.vibeMode === 'classic' && <Check className="w-4 h-4 text-yellow-400" />}
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-2 border-t border-[#f59e0b]/25 flex items-center justify-end">
          <button
            onClick={() => {
              globalAudio.playTap();
              onClose();
            }}
            className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-cinzel font-bold text-xs tracking-wider shadow-lg shadow-amber-950/60 border border-amber-300/40 active:scale-95 transition-all cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

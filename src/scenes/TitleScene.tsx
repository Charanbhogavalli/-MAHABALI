import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Music,
  BookOpen,
  Compass,
  Play,
  Flame,
  Award,
} from 'lucide-react';
import { globalAudio } from '../audio/GlobalAudioManager';
import { ASSETS } from '../assets/assetRegistry';
import { ParticleSystem } from '../engine/particles';
import { GameSaveData } from '../types/game';
import { TribalArchivesModal } from '../components/TribalArchivesModal';

interface TitleSceneProps {
  saveData: GameSaveData;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStartGame: () => void;
  onOpenStory: () => void;
  onOpenVibeStudio: () => void;
  onOpenLevelSelect: () => void;
}

export const TitleScene: React.FC<TitleSceneProps> = ({
  saveData,
  soundEnabled,
  onToggleSound,
  onStartGame,
  onOpenStory,
  onOpenVibeStudio,
  onOpenLevelSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const animTickRef = useRef<number>(0);
  const [isArchivesOpen, setIsArchivesOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [audioState, setAudioState] = useState(globalAudio.getState());

  useEffect(() => {
    const unsub = globalAudio.subscribe((st) => {
      setAudioState({ ...st });
    });
    return unsub;
  }, []);

  const isMusicActive = audioState.isPlaying && !audioState.isMuted;
  const lastActionRef = useRef<number>(0);

  const handleStartMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    lastActionRef.current = Date.now();
    globalAudio.init();
    globalAudio.unmute();
    globalAudio.playMusic();
  };

  const handleTogglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionRef.current < 600) return;
    lastActionRef.current = now;

    globalAudio.init();
    if (isMusicActive) {
      globalAudio.pauseMusic();
    } else {
      globalAudio.unmute();
      globalAudio.playMusic();
    }
  };

  // Subtle floating sparkles particle loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      animTickRef.current++;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Gold festive sparks & holy petals
      if (animTickRef.current % 18 === 0) {
        particlesRef.current.emitPetals(Math.random() * width, -10, 1, '#f59e0b');
        if (Math.random() > 0.6) {
          particlesRef.current.emitSparks(
            width * 0.15 + Math.random() * width * 0.7,
            height * 0.4 + Math.random() * height * 0.4,
            1
          );
        }
      }

      particlesRef.current.update();
      particlesRef.current.render(ctx);

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col justify-between text-[#fbf6ea] overflow-hidden select-none">
      {/* 1. Underlying Kerala Paisley Floral Reference Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none scale-105"
        style={{ backgroundImage: `url(${ASSETS.paisleyPattern})` }}
      />

      {/* 2. Cinematic Mahabali Artwork Centerpiece */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <img
          src={ASSETS.mahabaliCinematic}
          alt="Mahabali Cinematic Art"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transition-all duration-1000 ${
            imageLoaded ? 'scale-100 filter brightness-95 contrast-105' : 'scale-105 blur-md'
          }`}
        />

        {/* Sophisticated Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0502] via-[#140803]/60 to-[#0d0502]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0d0502] via-[#0d0502]/90 to-transparent pointer-events-none" />
      </div>

      {/* 3. Dynamic Interactive Sparkle Canvas */}
      <canvas
        ref={canvasRef}
        width={360}
        height={640}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 4. Top Header & Title Bar */}
      <div className="relative z-20 w-full px-4 pt-3 sm:pt-4 flex flex-col items-center text-center">
        {/* Top utility row */}
        <div className="w-full flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#120602]/80 border border-[#f59e0b]/40 backdrop-blur-md shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-cinzel font-bold tracking-widest text-amber-300 uppercase">
              FESTIVAL CHAMPIONSHIP
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* VIBE STUDIO Button */}
            <button
              onClick={() => {
                globalAudio.init();
                globalAudio.playTap();
                onOpenVibeStudio();
              }}
              className="px-2.5 py-1 rounded-full bg-[#1b0c05]/85 border border-[#f59e0b]/50 text-[#fef08a] hover:bg-[#2e1409] active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-cinzel font-bold shadow-md"
              aria-label="Open Vibe Studio"
            >
              <Music className="w-3 h-3 text-amber-400" />
              <span>VIBE</span>
            </button>

            {/* AUDIO ON / OFF Button */}
            <button
              onClick={() => {
                globalAudio.init();
                globalAudio.playTap();
                onToggleSound();
              }}
              className="p-1.5 rounded-full bg-[#1b0c05]/85 border border-[#f59e0b]/50 text-[#fef08a] hover:bg-[#2e1409] active:scale-95 transition-all cursor-pointer shadow-md"
              aria-label="Toggle Sound"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-50 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Title Typography Block (Matching User Specifications) */}
        <div className="mt-2 flex flex-col items-center">
          {/* Primary: MAHABALI */}
          <h1 className="text-4xl sm:text-5xl font-extrabold font-philosopher tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#fef08a] to-[#f59e0b] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none">
            MAHABALI
          </h1>

          {/* Secondary: THREE STRIDES ACROSS KERALA */}
          <div className="flex items-center gap-2 my-1">
            <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#f59e0b]" />
            <span className="text-[11px] sm:text-xs font-cinzel font-bold tracking-[0.28em] text-amber-200 uppercase drop-shadow-md">
              THREE STRIDES ACROSS KERALA
            </span>
            <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#f59e0b]" />
          </div>

          {/* Malayalam Script: മഹാബലി: മൂന്നടി മണ്ണ് */}
          <p className="text-sm sm:text-base font-semibold text-amber-300/90 font-philosopher tracking-wider drop-shadow-md">
            മഹാബലി: മൂന്നടി മണ്ണ്
          </p>

          {/* Festive Subtitle: An Epic Onam Championship Odyssey */}
          <p className="text-[10px] sm:text-[11px] text-zinc-300/80 font-cinzel tracking-widest mt-0.5 uppercase">
            An Epic Onam Championship Odyssey
          </p>

          {/* Interactive Music Status & Play Controller */}
          <div className="mt-3 z-30">
            {!isMusicActive ? (
              <button
                onClick={handleStartMusic}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-[#120602] font-cinzel font-black text-xs tracking-wider shadow-lg shadow-amber-500/30 animate-pulse hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-yellow-200 cursor-pointer"
                title="Tap to start the Onam background song"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>TAP TO PLAY FESTIVAL MUSIC 🎵</span>
              </button>
            ) : (
              <button
                onClick={handleTogglePlayPause}
                className="px-3.5 py-1.5 rounded-full bg-[#1b0c05]/90 border border-amber-400/50 text-amber-300 text-[11px] font-cinzel font-semibold flex items-center gap-2 shadow-md hover:bg-[#2e1409] active:scale-95 transition-all cursor-pointer"
                title="Tap to toggle pause"
              >
                <div className="flex items-end gap-0.5 h-3.5 pb-0.5">
                  <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                  <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDuration: '0.4s', animationDelay: '0.15s' }} />
                  <span className="w-0.5 h-3.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDuration: '0.7s', animationDelay: '0.3s' }} />
                </div>
                <span className="truncate max-w-[180px]">🎵 Onam Festival Song Playing</span>
                <span className="text-[10px] text-amber-200/60 ml-0.5">· Pause</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Center Golden Halo Aura Accent */}
      <div className="relative z-10 pointer-events-none flex justify-center items-center">
        <div className="w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* 6. Navigation Controls Section */}
      <div className="relative z-20 w-full px-4 pb-5 flex flex-col items-center gap-2.5">
        {/* [ BEGIN ODYSSEY ] (Story Mode / Prologue) */}
        <button
          onClick={() => {
            globalAudio.init();
            globalAudio.unmute();
            globalAudio.ensureMusicPlaying();
            globalAudio.playTap();
            onOpenStory();
          }}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#b45309] via-[#f59e0b] to-[#b45309] text-[#120602] font-cinzel font-black text-sm tracking-wider shadow-xl shadow-amber-950/80 border border-amber-200/60 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current text-[#120602]" />
          <span>BEGIN ODYSSEY (PROLOGUE)</span>
        </button>

        {/* Secondary Buttons Row: [ QUICK PLAY ] and [ TRIBAL ARCHIVES ] */}
        <div className="w-full max-w-xs grid grid-cols-2 gap-2">
          {/* [ QUICK PLAY ] (Level Select) */}
          <button
            onClick={() => {
              globalAudio.init();
              globalAudio.unmute();
              globalAudio.ensureMusicPlaying();
              globalAudio.playTap();
              onOpenLevelSelect();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#1b0c05]/90 hover:bg-[#2e1409] text-[#fef08a] font-cinzel font-bold text-xs tracking-wider border border-[#f59e0b]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-black/60"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>QUICK PLAY</span>
          </button>

          {/* [ TRIBAL ARCHIVES ] (Lore & Guide) */}
          <button
            onClick={() => {
              globalAudio.init();
              globalAudio.unmute();
              globalAudio.ensureMusicPlaying();
              globalAudio.playTap();
              setIsArchivesOpen(true);
            }}
            className="py-2.5 px-3 rounded-xl bg-[#1b0c05]/90 hover:bg-[#2e1409] text-[#fef08a] font-cinzel font-bold text-xs tracking-wider border border-[#f59e0b]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-black/60"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>TRIBAL ARCHIVES</span>
          </button>
        </div>

        {/* High Score & Cultural Footer Note */}
        {saveData.highScore > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#140804]/80 border border-[#f59e0b]/30 text-[10px] font-cinzel text-amber-200/80">
            <Award className="w-3 h-3 text-amber-400" />
            <span>
              BEST CHAMPIONSHIP SCORE: <strong className="text-amber-300 font-bold">{saveData.highScore}</strong>
            </span>
          </div>
        ) : (
          <p className="text-[10px] text-amber-300/60 font-philosopher italic">
            "മാവേലി നാടു വാണീടും കാലം..."
          </p>
        )}
      </div>

      {/* Tribal Archives Codex Modal */}
      <TribalArchivesModal
        isOpen={isArchivesOpen}
        onClose={() => setIsArchivesOpen(false)}
      />
    </div>
  );
};

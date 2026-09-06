import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Trophy,
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
  onStartGame: () => void;
  onOpenStory: () => void;
  onOpenLevelSelect: () => void;
}

export const TitleScene: React.FC<TitleSceneProps> = ({
  saveData,
  onStartGame,
  onOpenStory,
  onOpenLevelSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const animTickRef = useRef<number>(0);
  const [isArchivesOpen, setIsArchivesOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Subtle floating sparkles particle loop + responsive canvas sizing
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.floor(rect.width);
        canvas.height = Math.floor(rect.height);
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement!);

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
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="title-scene relative w-full h-full min-h-0 flex flex-col justify-between text-[#fbf6ea] overflow-hidden select-none">
      {/* 1. Underlying Kerala Paisley Floral Reference Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none scale-105"
        style={{ backgroundImage: `url(${ASSETS.paisleyPattern})` }}
      />

      {/* 2. Cinematic Mahabali Artwork Centerpiece */}
      <div className="title-artwork absolute inset-0 flex items-center justify-center overflow-hidden">
        <img
          src={ASSETS.mahabaliCinematic}
          alt="Mahabali Cinematic Art"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-[center_20%] sm:object-center transition-all duration-1000 ${
            imageLoaded ? 'scale-100 filter brightness-95 contrast-105' : 'scale-105 blur-md'
          }`}
        />

        {/* Sophisticated Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0502] via-[#140803]/60 to-[#0d0502]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 sm:h-64 bg-gradient-to-t from-[#0d0502] via-[#0d0502]/90 to-transparent pointer-events-none" />
      </div>

      {/* 3. Dynamic Interactive Sparkle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 4. Top Header & Title Bar */}
      <div className="title-header relative z-20 w-full px-3 sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top))] flex flex-col items-center text-center shrink-0">
        {/* Top utility row */}
        <div className="w-full flex items-center justify-between mb-0.5 sm:mb-1">
          <div className="title-championship-badge flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[#120602]/80 border border-[#f59e0b]/40 backdrop-blur-md shadow-md max-w-[55%]">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-cinzel font-bold tracking-widest text-amber-300 uppercase truncate">
              FESTIVAL CHAMPIONSHIP
            </span>
          </div>

        </div>

        {/* Title Typography Block (Matching User Specifications) */}
        <div className="mt-1 sm:mt-2 flex flex-col items-center w-full">
          {/* Primary: MAHABALI */}
          <h1 className="title-h1 text-[clamp(1.75rem,8vw,2.75rem)] sm:text-5xl font-extrabold font-philosopher tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#fef08a] to-[#f59e0b] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none">
            MAHABALI
          </h1>

          {/* Secondary: THREE STRIDES ACROSS KERALA */}
          <div className="flex items-center gap-1.5 sm:gap-2 my-0.5 sm:my-1 w-full justify-center px-1">
            <div className="h-[1px] w-4 sm:w-6 bg-gradient-to-r from-transparent to-[#f59e0b] shrink-0" />
            <span className="title-subtitle text-[10px] sm:text-xs font-cinzel font-bold tracking-[0.2em] sm:tracking-[0.28em] text-amber-200 uppercase drop-shadow-md text-center leading-tight">
              THREE STRIDES ACROSS KERALA
            </span>
            <div className="h-[1px] w-4 sm:w-6 bg-gradient-to-l from-transparent to-[#f59e0b] shrink-0" />
          </div>

          {/* Malayalam Script: മഹാബലി: മൂന്നടി മണ്ണ് */}
          <p className="title-malayalam text-[clamp(0.75rem,3.5vw,1rem)] font-semibold text-amber-300/90 font-philosopher tracking-wider drop-shadow-md">
            മഹാബലി: മൂന്നടി മണ്ണ്
          </p>

          {/* Festive Subtitle: An Epic Onam Championship Odyssey */}
          <p className="title-tagline text-[9px] sm:text-[11px] text-zinc-300/80 font-cinzel tracking-widest mt-0.5 uppercase">
            An Epic Onam Championship Odyssey
          </p>

        </div>
      </div>

      {/* 5. Center Golden Halo Aura Accent */}
      <div className="title-halo relative z-10 pointer-events-none flex justify-center items-center shrink-0">
        <div className="w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* 6. Navigation Controls Section */}
      <div className="title-footer relative z-20 w-full px-3 sm:px-4 flex flex-col items-center gap-2 sm:gap-2.5 shrink-0">
        {/* [ BEGIN ODYSSEY ] (Story Mode / Prologue) */}
        <button
          onClick={() => {
            globalAudio.playTap();
            onOpenStory();
          }}
          className="title-primary-btn btn-touch w-full max-w-xs py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-[#b45309] via-[#f59e0b] to-[#b45309] text-[#120602] font-cinzel font-black text-xs sm:text-sm tracking-wider shadow-xl shadow-amber-950/80 border border-amber-200/60 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current text-[#120602] shrink-0" />
          <span className="text-center leading-tight">BEGIN ODYSSEY (PROLOGUE)</span>
        </button>

        {/* Secondary Buttons Row: [ QUICK PLAY ] and [ TRIBAL ARCHIVES ] */}
        <div className="w-full max-w-xs grid grid-cols-2 gap-1.5 sm:gap-2">
          {/* [ QUICK PLAY ] (Level Select) */}
          <button
            onClick={() => {
              globalAudio.playTap();
              onOpenLevelSelect();
            }}
            className="title-secondary-btn btn-touch py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl bg-[#1b0c05]/90 hover:bg-[#2e1409] text-[#fef08a] font-cinzel font-bold text-[10px] sm:text-xs tracking-wider border border-[#f59e0b]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shadow-black/60"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>QUICK PLAY</span>
          </button>

          {/* [ TRIBAL ARCHIVES ] (Lore & Guide) */}
          <button
            onClick={() => {
              globalAudio.playTap();
              setIsArchivesOpen(true);
            }}
            className="title-secondary-btn btn-touch py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl bg-[#1b0c05]/90 hover:bg-[#2e1409] text-[#fef08a] font-cinzel font-bold text-[10px] sm:text-xs tracking-wider border border-[#f59e0b]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shadow-black/60"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="leading-tight text-center">TRIBAL ARCHIVES</span>
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

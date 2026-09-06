import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio/SoundManager';
import { ChevronRight, ChevronLeft, FastForward, Sparkles, Volume2, Crown, Footprints, ShieldCheck, Sun } from 'lucide-react';

interface StoryCinematicSceneProps {
  onComplete: () => void;
}

interface StoryChapter {
  id: number;
  actTitle: string;
  headline: string;
  malayalamVerse: string;
  storyText: string;
  gameStepRef: string;
  themeColor: string;
  bgGradient: string;
  visualType: 'golden_age' | 'vamana_arrival' | 'trivikrama_steps' | 'supreme_boon';
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    actTitle: 'ACT I — THE GOLDEN AGE',
    headline: 'When Maveli Ruled the Land',
    malayalamVerse: 'മാവേലി നാടു വാണീടും കാലം... മാനുഷരെല്ലാരും ഒന്നുപോലെ...',
    storyText: 'In ancient Kerala, King Mahabali’s righteous rule brought golden abundance. Deceit, hunger, and disparity were unknown; every soul lived in unity and happiness.',
    gameStepRef: 'Inspiration for the Pookalam floral mandala of prosperity.',
    themeColor: '#f59e0b',
    bgGradient: 'from-amber-950/80 via-yellow-950/40 to-[#0c0502]',
    visualType: 'golden_age',
  },
  {
    id: 2,
    actTitle: 'ACT II — THE DIVINE TEST',
    headline: 'Arrival of the Sacred Boy',
    malayalamVerse: 'വാമന മൂർത്തിയായി അവതരിച്ച മഹാവിഷ്ണു...',
    storyText: 'Witnessing Mahabali’s boundless glory, Lord Vishnu descended as Vamana, a modest young Brahmin boy carrying an umbrella of palm leaves to request a modest boon: just Three Paces of land.',
    gameStepRef: 'The spirit of unity tested across the backwaters in Vallam Kali.',
    themeColor: '#38bdf8',
    bgGradient: 'from-sky-950/80 via-blue-950/40 to-[#0c0502]',
    visualType: 'vamana_arrival',
  },
  {
    id: 3,
    actTitle: 'ACT III — THE COSMIC TRIVIKRAMA',
    headline: 'The Two Strides of the Universe',
    malayalamVerse: 'ഒന്നാം പദം കൊണ്ട് ഭൂമിയും, രണ്ടാം പദം കൊണ്ട് ആകാശവും...',
    storyText: 'Vamana transformed into the colossal Trivikrama! His first step measured the entire Earth and underworld. His second step spanned the cosmic skies and heavens. Vamana asked: "Where shall I place the third step?"',
    gameStepRef: 'Measuring the vast expanse of devotion and sacrifice.',
    themeColor: '#a855f7',
    bgGradient: 'from-purple-950/80 via-indigo-950/40 to-[#0c0502]',
    visualType: 'trivikrama_steps',
  },
  {
    id: 4,
    actTitle: 'ACT IV — THE ETERNAL BOON',
    headline: 'The Third Step & The Return',
    malayalamVerse: 'തിരുവോണ നാളിൽ നാടു കാണാൻ എത്തുന്ന രാജാവ്...',
    storyText: 'With serene humility, Mahabali bowed and offered his own head for the third step. Blessed by the Lord, he received the eternal boon to visit his cherished Kerala every year on Thiruvonam.',
    gameStepRef: 'Celebrated across generations through the Grand Onam Sadya.',
    themeColor: '#ef4444',
    bgGradient: 'from-orange-950/80 via-red-950/40 to-[#0c0502]',
    visualType: 'supreme_boon',
  },
];

export const StoryCinematicScene: React.FC<StoryCinematicSceneProps> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const chapter = CHAPTERS[currentIdx];

  // Keep festive background song playing during prologue story cinematic
  useEffect(() => {
    soundManager.init();
    soundManager.ensureMusicPlaying();
  }, []);

  // Auto progression timer (8 seconds per chapter)
  useEffect(() => {
    if (!isAutoPlaying) return;

    setProgress(0);
    const startTime = Date.now();
    const duration = 7500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        if (currentIdx < CHAPTERS.length - 1) {
          setCurrentIdx((prev) => prev + 1);
          soundManager.playFlowerPlace(1.1);
        } else {
          onComplete();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentIdx, isAutoPlaying, onComplete]);

  const handleNext = () => {
    soundManager.playTap();
    if (currentIdx < CHAPTERS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      soundManager.playPowerUpCollect();
      onComplete();
    }
  };

  const handlePrev = () => {
    soundManager.playTap();
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col justify-between p-5 text-[#fbf6ea] bg-gradient-to-b ${chapter.bgGradient} bg-[#0c0502] select-none transition-all duration-700 overflow-hidden`}>
      
      {/* Dynamic Animated Particles / Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 transition-all duration-1000"
          style={{ backgroundColor: chapter.themeColor }}
        />
        <div className="absolute top-1/3 -left-20 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-48 h-48 rounded-full bg-orange-500/10 blur-2xl animate-pulse" />
      </div>

      {/* Top Header & Chapter Stepper */}
      <div className="relative z-10 w-full pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[10px] font-cinzel font-bold tracking-[0.2em] text-amber-400 uppercase">
              THE LEGEND OF THREE STEPS
            </span>
          </div>

          <button
            onClick={() => {
              soundManager.playTap();
              onComplete();
            }}
            className="flex items-center gap-1 text-[11px] font-cinzel text-amber-200/80 hover:text-white px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/70 border border-[#b45309]/30 transition-all cursor-pointer"
          >
            <span>SKIP</span>
            <FastForward className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Multi-Bar */}
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-black/40 rounded-full p-0.5 border border-white/10">
          {CHAPTERS.map((c, idx) => (
            <div
              key={c.id}
              className="h-full rounded-full bg-white/15 overflow-hidden transition-all"
            >
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-75"
                style={{
                  width:
                    idx < currentIdx
                      ? '100%'
                      : idx === currentIdx
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Central Visual Art Card with Custom Illustrations */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-4 py-2">
        
        {/* Animated Artwork Canvas Avatar Box */}
        <div className="relative w-44 h-44 rounded-3xl bg-gradient-to-b from-[#241108] to-[#120602] border-2 border-[#b45309]/60 shadow-2xl shadow-black/80 flex items-center justify-center overflow-hidden group">
          
          {/* Radial Light Burst */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: `radial-gradient(circle at center, ${chapter.themeColor} 0%, transparent 70%)`,
            }}
          />

          {/* Render visual icon/scene for current chapter */}
          {chapter.visualType === 'golden_age' && (
            <div className="relative flex flex-col items-center animate-bounce-slow">
              <Crown className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
              <div className="flex gap-1.5 mt-2">
                <span className="text-xl">🌸</span>
                <span className="text-xl">🪔</span>
                <span className="text-xl">🌾</span>
              </div>
            </div>
          )}

          {chapter.visualType === 'vamana_arrival' && (
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
                <Sun className="w-10 h-10 text-sky-300 animate-spin" style={{ animationDuration: '12s' }} />
              </div>
              <p className="text-[11px] font-cinzel font-bold text-sky-200 mt-2">VAMANA AVATAR</p>
            </div>
          )}

          {chapter.visualType === 'trivikrama_steps' && (
            <div className="relative flex flex-col items-center">
              <Footprints className="w-16 h-16 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.7)] animate-pulse" />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/80 border border-purple-400 text-purple-200 font-bold">1. BHULOKA</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/80 border border-purple-400 text-purple-200 font-bold">2. SWARGA</span>
              </div>
            </div>
          )}

          {chapter.visualType === 'supreme_boon' && (
            <div className="relative flex flex-col items-center">
              <ShieldCheck className="w-16 h-16 text-orange-400 drop-shadow-[0_0_25px_rgba(249,115,22,0.8)] animate-pulse" />
              <p className="text-[11px] font-cinzel font-bold text-amber-200 mt-2">THIRUVONAM BOON</p>
            </div>
          )}

          {/* Ornamental corner accents */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/60" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/60" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/60" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/60" />
        </div>

        {/* Story Text Box */}
        <div className="w-full max-w-xs text-center space-y-2">
          <p className="text-[10px] font-cinzel font-bold uppercase tracking-[0.2em]" style={{ color: chapter.themeColor }}>
            {chapter.actTitle}
          </p>

          <h2 className="text-xl font-bold font-philosopher text-[#fef08a] leading-tight">
            {chapter.headline}
          </h2>

          <p className="text-[11px] italic text-amber-300/80 font-philosopher leading-relaxed px-2">
            "{chapter.malayalamVerse}"
          </p>

          <p className="text-xs text-[#e2e8f0]/95 leading-relaxed font-philosopher px-1">
            {chapter.storyText}
          </p>

          <div className="p-2 rounded-xl bg-black/40 border border-amber-500/20 text-[10px] text-amber-200/90 font-medium">
            ✨ {chapter.gameStepRef}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="relative z-10 w-full pb-2 flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-1 text-xs font-cinzel font-bold transition-all ${
            currentIdx === 0
              ? 'opacity-30 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-[#231106] hover:bg-[#381c0c] border-[#b45309]/50 text-amber-200 cursor-pointer active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>PREV</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-white font-cinzel font-bold text-xs tracking-wider shadow-lg shadow-amber-950/70 border border-[#fef08a]/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span>{currentIdx === CHAPTERS.length - 1 ? 'BEGIN ADVENTURE' : 'NEXT ACT'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

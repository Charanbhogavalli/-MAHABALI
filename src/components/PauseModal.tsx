import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music, HelpCircle } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface PauseModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  onToggleSound: () => void;
  onOpenVibeStudio?: () => void;
  onShowBriefing?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  soundEnabled,
  onResume,
  onRestart,
  onGoHome,
  onToggleSound,
  onOpenVibeStudio,
  onShowBriefing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-5 select-none animate-fadeIn">
      <div className="w-full max-w-xs p-6 rounded-2xl bg-[#1c0d05] border border-[#b45309]/60 shadow-2xl flex flex-col items-center text-center space-y-4">
        <div>
          <p className="text-[10px] font-cinzel tracking-widest text-[#f59e0b] uppercase">
            GAME PAUSED
          </p>
          <h3 className="text-2xl font-bold font-philosopher text-[#fef08a] mt-0.5">
            Thiruvonam
          </h3>
        </div>

        <div className="w-full space-y-2.5 pt-2">
          {/* Resume */}
          <button
            onClick={() => {
              soundManager.playTap();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-white font-cinzel font-bold text-xs tracking-wider border border-[#fef08a]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME JOURNEY</span>
          </button>

          {/* Mission Briefing / Instructions */}
          {onShowBriefing && (
            <button
              onClick={() => {
                soundManager.playTap();
                onShowBriefing();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#241006] hover:bg-[#34170a] text-[#fef08a] font-cinzel font-semibold text-xs tracking-wider border border-amber-500/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>HOW TO PLAY & OBJECTIVES</span>
            </button>
          )}

          {/* Vibe Studio */}
          {onOpenVibeStudio && (
            <button
              onClick={() => {
                soundManager.playTap();
                onOpenVibeStudio();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#241006] hover:bg-[#34170a] text-[#fef08a] font-cinzel font-semibold text-xs tracking-wider border border-amber-500/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span>VIBE STUDIO & MUSIC UPLOAD</span>
            </button>
          )}

          {/* Restart Level */}
          <button
            onClick={() => {
              soundManager.playTap();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2a1308] text-[#fef08a] font-cinzel font-semibold text-xs tracking-wider border border-[#b45309]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART LEVEL</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2a1308] text-[#fef08a] font-cinzel font-semibold text-xs tracking-wider border border-[#b45309]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            <span>AUDIO: {soundEnabled ? 'ON' : 'MUTED'}</span>
          </button>

          {/* Home */}
          <button
            onClick={() => {
              soundManager.playTap();
              onGoHome();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2a1308] text-[#fef08a] font-cinzel font-semibold text-xs tracking-wider border border-[#b45309]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

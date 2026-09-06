import React, { useEffect } from 'react';
import { soundManager } from '../audio/SoundManager';
import { Film, Play } from 'lucide-react';

interface IntroSceneProps {
  onStartLevel1: () => void;
  onWatchStory: () => void;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ onStartLevel1, onWatchStory }) => {
  useEffect(() => {
    soundManager.init();
    soundManager.ensureMusicPlaying();
  }, []);
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 text-[#fbf6ea] bg-[#110703] select-none">
      {/* Top Header */}
      <div className="w-full pt-4 text-center">
        <p className="text-[11px] font-cinzel uppercase tracking-[0.25em] text-[#f59e0b]">
          PROLOGUE
        </p>
        <h2 className="text-2xl md:text-3xl font-bold font-philosopher text-[#fef08a] mt-1">
          The Return of the King
        </h2>
      </div>

      {/* Story Cards */}
      <div className="max-w-xs space-y-4 text-center my-auto">
        <p className="text-xs md:text-sm text-[#e2e8f0]/90 leading-relaxed font-philosopher">
          Every year during the harvest month of Chingam, the beloved King Mahabali returns to his kingdom to witness the joy, prosperity, and unity of Kerala.
        </p>

        <div className="p-3.5 rounded-2xl bg-[#241006]/90 border border-[#b45309]/40 text-left space-y-2.5 shadow-lg shadow-black/60">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d97706] to-[#b45309] text-white text-xs font-bold flex items-center justify-center font-cinzel shadow-sm">1</span>
            <span className="text-xs font-semibold text-[#fef08a] font-philosopher">CREATE: Sacred Mandala Pookalam</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d97706] to-[#b45309] text-white text-xs font-bold flex items-center justify-center font-cinzel shadow-sm">2</span>
            <span className="text-xs font-semibold text-[#fef08a] font-philosopher">UNITE: Race the Chundan Vallam</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d97706] to-[#b45309] text-white text-xs font-bold flex items-center justify-center font-cinzel shadow-sm">3</span>
            <span className="text-xs font-semibold text-[#fef08a] font-philosopher">CELEBRATE: Serve Authentic Sadya</span>
          </div>
        </div>

        {/* Watch Full 3-Steps Story Button */}
        <button
          onClick={() => {
            soundManager.playTap();
            onWatchStory();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#2b1408] hover:bg-[#3d1d0c] border border-amber-500/40 text-amber-200 text-xs font-cinzel font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Film className="w-4 h-4 text-amber-400" />
          <span>WATCH 3 STEPS STORY CINEMATIC</span>
        </button>
      </div>

      {/* Start Button */}
      <div className="w-full pb-4 flex justify-center">
        <button
          onClick={() => {
            soundManager.playTap();
            onStartLevel1();
          }}
          className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-white font-cinzel font-bold text-sm tracking-wider shadow-lg shadow-amber-950/60 border border-[#fef08a]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>BEGIN FIRST STEP</span>
          <Play className="w-4 h-4 fill-white" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { RotateCcw, Home, Star, Award } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';
import { GameSaveData } from '../types/game';

interface ResultSceneProps {
  saveData: GameSaveData;
  onReplayAll: () => void;
  onGoHome: () => void;
  onSelectLevel: (lvl: number) => void;
}

export const ResultScene: React.FC<ResultSceneProps> = ({
  saveData,
  onReplayAll,
  onGoHome,
  onSelectLevel,
}) => {
  const l1 = saveData.levels[1];
  const l2 = saveData.levels[2];
  const l3 = saveData.levels[3];

  const avgAcc = Math.round((l1.accuracy + l2.accuracy + l3.accuracy) / 3);
  const avgSec = Math.round((l1.secondary + l2.secondary + l3.secondary) / 3);
  const totalTime = l1.timeSeconds + l2.timeSeconds + l3.timeSeconds;
  const finalOnamScore = Math.round(avgAcc * 0.5 + avgSec * 0.5);

  const totalStars = l1.stars + l2.stars + l3.stars;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-5 text-[#fbf6ea] bg-[#110703] overflow-y-auto select-none">
      {/* Top Title */}
      <div className="w-full pt-2 text-center">
        <p className="text-[11px] font-cinzel uppercase tracking-[0.25em] text-[#f59e0b]">
          Celebration Complete
        </p>
        <h2 className="text-2xl md:text-3xl font-bold font-philosopher text-[#fef08a] mt-0.5">
          Onam Performance
        </h2>
      </div>

      {/* Main Score Plaque */}
      <div className="w-full max-w-xs my-2 space-y-3">
        {/* Overall Score Circle Card */}
        <div className="p-4 rounded-2xl bg-[#241006] border border-[#b45309]/50 flex flex-col items-center shadow-lg text-center">
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, Math.min(3, Math.ceil(totalStars / 3))).map((s) => (
              <Star key={s} className="w-5 h-5 text-[#facc15] fill-[#facc15]" />
            ))}
          </div>

          <p className="text-[10px] font-cinzel tracking-widest text-[#f59e0b] uppercase">
            OVERALL ONAM SCORE
          </p>
          <p className="text-4xl md:text-5xl font-bold font-philosopher text-[#fef08a]">
            {finalOnamScore}
          </p>

          <p className="text-xs text-[#e2e8f0]/80 font-philosopher mt-1">
            Total Festival Time: <span className="text-[#fef08a] font-semibold">{totalTime}s</span>
          </p>
        </div>

        {/* 3 Steps Detailed Breakdown */}
        <div className="space-y-2">
          {/* Level 1: Pookalam */}
          <div
            onClick={() => {
              soundManager.playTap();
              onSelectLevel(1);
            }}
            className="p-3 rounded-xl bg-[#1c0d05]/90 border border-[#b45309]/30 flex items-center justify-between hover:bg-[#2e1409] active:scale-98 transition-all cursor-pointer"
          >
            <div>
              <p className="text-[10px] font-cinzel text-[#f59e0b] tracking-wider">STEP I — CREATE</p>
              <p className="text-xs font-bold text-[#fef08a] font-philosopher">Pookalam</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-[#f8fafc]">
                Acc: <span className="text-[#facc15]">{l1.accuracy}%</span> · Harm: <span className="text-[#facc15]">{l1.secondary}%</span>
              </p>
              <p className="text-[10px] text-[#94a3b8]">{l1.timeSeconds}s</p>
            </div>
          </div>

          {/* Level 2: Vallam Kali */}
          <div
            onClick={() => {
              soundManager.playTap();
              onSelectLevel(2);
            }}
            className="p-3 rounded-xl bg-[#1c0d05]/90 border border-[#b45309]/30 flex items-center justify-between hover:bg-[#2e1409] active:scale-98 transition-all cursor-pointer"
          >
            <div>
              <p className="text-[10px] font-cinzel text-[#f59e0b] tracking-wider">STEP II — UNITE</p>
              <p className="text-xs font-bold text-[#fef08a] font-philosopher">Vallam Kali</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-[#f8fafc]">
                Rhythm: <span className="text-[#facc15]">{l2.accuracy}%</span> · Nav: <span className="text-[#facc15]">{l2.secondary}%</span>
              </p>
              <p className="text-[10px] text-[#94a3b8]">{l2.timeSeconds}s</p>
            </div>
          </div>

          {/* Level 3: Sadya */}
          <div
            onClick={() => {
              soundManager.playTap();
              onSelectLevel(3);
            }}
            className="p-3 rounded-xl bg-[#1c0d05]/90 border border-[#b45309]/30 flex items-center justify-between hover:bg-[#2e1409] active:scale-98 transition-all cursor-pointer"
          >
            <div>
              <p className="text-[10px] font-cinzel text-[#f59e0b] tracking-wider">STEP III — CELEBRATE</p>
              <p className="text-xs font-bold text-[#fef08a] font-philosopher">Onam Sadya</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-[#f8fafc]">
                Acc: <span className="text-[#facc15]">{l3.accuracy}%</span> · Prec: <span className="text-[#facc15]">{l3.secondary}%</span>
              </p>
              <p className="text-[10px] text-[#94a3b8]">{l3.timeSeconds}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="w-full max-w-xs pt-2 flex flex-col gap-2">
        <button
          onClick={() => {
            soundManager.playTap();
            onReplayAll();
          }}
          className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-white font-cinzel font-bold text-xs tracking-wider shadow-lg border border-[#fef08a]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>PLAY FULL JOURNEY AGAIN</span>
        </button>

        <button
          onClick={() => {
            soundManager.playTap();
            onGoHome();
          }}
          className="w-full py-2.5 px-5 rounded-xl bg-[#1b0c05]/80 text-[#fef08a] font-cinzel font-semibold text-xs tracking-wider border border-[#b45309]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>RETURN TO TITLE</span>
        </button>
      </div>
    </div>
  );
};

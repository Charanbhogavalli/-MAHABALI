import React, { useEffect } from 'react';
import { ArrowLeft, Star, Play, Timer, Sparkles, Flower2, Ship, Utensils } from 'lucide-react';
import { globalAudio } from '../audio/GlobalAudioManager';
import { ASSETS } from '../assets/assetRegistry';
import { GameSaveData } from '../types/game';

interface LevelSelectSceneProps {
  saveData: GameSaveData;
  onSelectLevel: (lvl: number) => void;
  onBack: () => void;
}

export const LevelSelectScene: React.FC<LevelSelectSceneProps> = ({
  saveData,
  onSelectLevel,
  onBack,
}) => {
  useEffect(() => {
    globalAudio.init();
    globalAudio.ensureMusicPlaying();
  }, []);
  const levels = [
    {
      num: 1,
      theme: 'CREATE',
      title: 'Sacred Pookalam',
      malayalam: 'പൂക്കളം',
      icon: Flower2,
      duration: '45s',
      description: 'Recreate the sacred concentric floral mandala comparing with the original blueprint.',
      score: saveData.levels[1],
      accentColor: 'from-amber-600 to-yellow-500',
      borderAccent: 'border-amber-500/40',
    },
    {
      num: 2,
      theme: 'UNITE',
      title: 'Vallam Kali Race',
      malayalam: 'വള്ളംകളി',
      icon: Ship,
      duration: '45s',
      description: 'Steer the 138ft snake boat down the Pamba river in rhythm with Vanchipattu boat songs.',
      score: saveData.levels[2],
      accentColor: 'from-sky-600 to-blue-500',
      borderAccent: 'border-sky-500/40',
    },
    {
      num: 3,
      theme: 'CELEBRATE',
      title: 'Grand Onam Sadya',
      malayalam: 'ഓണസദ്യ',
      icon: Utensils,
      duration: '45s',
      description: 'Plate 14 authentic Kerala dishes on the plantain leaf following sacred culinary geometry.',
      score: saveData.levels[3],
      accentColor: 'from-emerald-600 to-green-500',
      borderAccent: 'border-emerald-500/40',
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-5 text-[#fbf6ea] bg-[#110703] overflow-y-auto select-none">
      {/* Background Paisley Pattern Texture */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-color-dodge pointer-events-none"
        style={{ backgroundImage: `url(${ASSETS.paisleyPattern})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#110703]/90 via-[#190a04]/70 to-[#110703]/95 pointer-events-none" />

      {/* Top Bar with Back Button */}
      <div className="relative z-10 w-full pt-2 flex items-center justify-between">
        <button
          onClick={() => {
            globalAudio.playTap();
            onBack();
          }}
          className="p-2 rounded-full bg-[#1b0c05]/90 border border-[#f59e0b]/50 text-[#fef08a] active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <p className="text-[10px] font-cinzel uppercase tracking-[0.25em] text-[#f59e0b] flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Three Sacred Steps</span>
          </p>
          <h2 className="text-xl font-bold font-philosopher text-[#fef08a]">
            Select Tradition
          </h2>
        </div>

        <div className="w-8" />
      </div>

      {/* Level Cards */}
      <div className="relative z-10 w-full max-w-xs my-auto space-y-3">
        {levels.map((lvl) => {
          const IconComponent = lvl.icon;
          return (
            <div
              key={lvl.num}
              onClick={() => {
                globalAudio.playTap();
                onSelectLevel(lvl.num);
              }}
              className={`p-4 rounded-2xl bg-[#1d0c05]/90 backdrop-blur-md border ${lvl.borderAccent} hover:border-amber-400/80 active:scale-98 transition-all cursor-pointer shadow-xl shadow-black/50 group`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${lvl.accentColor} text-white shadow-md`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#b45309]/80 text-[#fef08a] text-[10px] font-cinzel font-bold tracking-wider">
                    STEP {lvl.num} · {lvl.theme}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-amber-300/80 font-cinzel">
                    <Timer className="w-3 h-3 text-amber-400" />
                    <span>{lvl.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        lvl.score.completed && star <= lvl.score.stars
                          ? 'text-[#facc15] fill-[#facc15]'
                          : 'text-[#475569]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1.5">
                <h3 className="text-base font-bold font-philosopher text-[#fef08a] group-hover:text-white transition-colors">
                  {lvl.title}
                </h3>
                <span className="text-xs text-[#f59e0b] font-philosopher font-semibold">
                  {lvl.malayalam}
                </span>
              </div>

              <p className="text-xs text-zinc-300/80 font-philosopher mt-1 leading-relaxed">
                {lvl.description}
              </p>

              {lvl.score.completed ? (
                <div className="mt-2.5 pt-2 border-t border-[#f59e0b]/20 flex items-center justify-between text-[11px] text-[#fef08a]/90 font-cinzel">
                  <span>Best Accuracy: <strong className="text-amber-400">{lvl.score.accuracy}%</strong></span>
                  <span>Time: <strong className="text-amber-400">{lvl.score.timeSeconds}s</strong></span>
                </div>
              ) : (
                <div className="mt-2.5 pt-1.5 border-t border-[#f59e0b]/15 flex items-center justify-end">
                  <span className="text-[10px] text-amber-400 font-cinzel font-bold flex items-center gap-1">
                    <span>PLAY STEP</span>
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 w-full pb-2 text-center">
        <p className="text-[11px] text-[#f59e0b]/80 font-cinzel tracking-wider">
          TAP ANY TRADITION TO START 45s TRIAL
        </p>
      </div>
    </div>
  );
};

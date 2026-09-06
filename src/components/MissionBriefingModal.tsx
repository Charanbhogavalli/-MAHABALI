import React from 'react';
import { soundManager } from '../audio/SoundManager';
import { Play, Sparkles, Target, Zap, Award, Flame } from 'lucide-react';

interface MissionBriefingModalProps {
  level: 1 | 2 | 3;
  onStart: () => void;
}

interface LevelBriefingInfo {
  stepNumber: string;
  theme: string;
  title: string;
  malayalamTitle: string;
  objective: string;
  howToPlay: Array<{ icon: string; title: string; desc: string }>;
  proTips: string[];
  themeColor: string;
  accentBg: string;
}

const LEVEL_BRIEFINGS: Record<1 | 2 | 3, LevelBriefingInfo> = {
  1: {
    stepNumber: 'STEP I',
    theme: 'CREATION & HARMONY',
    title: 'Sacred Pookalam Mandala',
    malayalamTitle: 'പൂക്കളം ഒരുക്കൽ',
    objective: 'Recreate the original sacred floral mandala within 45 seconds to welcome King Mahabali. Points are awarded by comparing your placed flowers with the authentic target design!',
    howToPlay: [
      {
        icon: '🎨',
        title: 'Compare With Original Design',
        desc: 'Follow the target blueprint shown in translucent ghost rings and the top-right miniature target preview.',
      },
      {
        icon: '🌸',
        title: 'Select & Place Petals',
        desc: 'Select blossoms (Thumba, Chethi, Jamanthi, Shankhupushpam, Tulsi) and tap concentric slots to place them.',
      },
      {
        icon: '⏱️',
        title: '45-Second Timer & Live Points',
        desc: 'Score +120 PTS for Perfect Target Matches, +60 for Harmonies, and +350 for Full Ring Bonuses before time expires!',
      },
    ],
    proTips: [
      'Look at the ghost petal previews on each slot to match the exact original flower.',
      'Place Thumba (pure white) in the sacred center bindu for an immediate perfect match bonus.',
      'Keep your match accuracy above 85% for a 3-star rating!',
    ],
    themeColor: '#f59e0b',
    accentBg: 'from-amber-950/80 via-yellow-950/40 to-[#120602]',
  },
  2: {
    stepNumber: 'STEP II',
    theme: 'UNITY & RHYTHM',
    title: 'Vallam Kali Snake Boat Race',
    malayalamTitle: 'ആറന്മുള വള്ളംകളി',
    objective: 'Steer the royal Chundan Vallam through the surging Pamba backwaters within 45 seconds, row in rhythm with Chenda beats, and rack up live points!',
    howToPlay: [
      {
        icon: '🥁',
        title: 'Row On The Beat',
        desc: 'Tap the screen in sync with the pulsing rhythm ring and Chenda drum beats for maximum speed & synchronization.',
      },
      {
        icon: '🛶',
        title: 'Steer & Dodge',
        desc: 'Drag or tap horizontally to glide left or right, dodging logs, water lilies, whirlpools, and rival boats.',
      },
      {
        icon: '⚡',
        title: 'Collect Sacred Power-Ups',
        desc: 'Grab Golden Payasam for turbo speed, Sacred Shankh for shield, and Golden Lotuses for +300 bonus points!',
      },
    ],
    proTips: [
      'Chain 6+ Perfect Rows to trigger MAVELI FRENZY hyper-turbo speed.',
      'Beat the 45-second timer to claim the grand Vallam Kali trophy!',
    ],
    themeColor: '#38bdf8',
    accentBg: 'from-sky-950/80 via-blue-950/40 to-[#120602]',
  },
  3: {
    stepNumber: 'STEP III',
    theme: 'AUTHENTIC TRADITION',
    title: 'The Grand Onam Sadya',
    malayalamTitle: 'തിരുവോണ സദ്യ',
    objective: 'Serve the grand traditional 14-dish feast on a fresh plantain leaf within 45 seconds, adhering strictly to ancient Kerala culinary etiquette for maximum score points!',
    howToPlay: [
      {
        icon: '🍌',
        title: 'Select From The Platter',
        desc: 'Choose dishes from the bottom platter (Salt, Upperi chips, Sharkara Varatti, Inji Puli, Avial, Choru, Payasam, etc.).',
      },
      {
        icon: '🍃',
        title: 'Free-Form Traditional Placement',
        desc: 'Tap directly on the banana leaf where the dish belongs. Upper row for condiments & curries, center for rice, bottom for sweets.',
      },
      {
        icon: '⏱️',
        title: '45-Second Clock & Points',
        desc: 'Placing dishes in their exact authentic locations earns "ADIPOLI! PERFECT SPOT" and massive combo multipliers!',
      },
    ],
    proTips: [
      'Pure Uppu (salt) goes on the narrow left tip (Tunchu).',
      'Kerala Red Matta Choru goes squarely in the bottom center.',
      'Palada Payasam belongs on the bottom right corner.',
    ],
    themeColor: '#10b981',
    accentBg: 'from-emerald-950/80 via-green-950/40 to-[#120602]',
  },
};

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  level,
  onStart,
}) => {
  const briefing = LEVEL_BRIEFINGS[level];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-b ${briefing.accentBg} border border-amber-500/50 shadow-2xl shadow-black p-5 text-[#fbf6ea] flex flex-col space-y-3.5 max-h-[92vh] overflow-y-auto`}
      >
        {/* Glow ambient circle */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: briefing.themeColor }}
        />

        {/* Modal Header */}
        <div className="text-center relative z-10 space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-cinzel font-bold tracking-[0.25em] uppercase" style={{ color: briefing.themeColor }}>
              {briefing.stepNumber} · {briefing.theme}
            </span>
          </div>

          <h2 className="text-xl font-bold font-philosopher text-[#fef08a] leading-tight">
            {briefing.title}
          </h2>

          <p className="text-[11px] italic text-amber-200/80 font-philosopher">
            {briefing.malayalamTitle}
          </p>
        </div>

        {/* Objective Box */}
        <div className="relative z-10 p-3 rounded-2xl bg-black/50 border border-amber-500/25 flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-cinzel font-bold text-amber-400">Objective</p>
            <p className="text-xs text-zinc-200 font-philosopher leading-snug">{briefing.objective}</p>
          </div>
        </div>

        {/* How to Play Step-by-Step Cards */}
        <div className="relative z-10 space-y-2">
          <p className="text-[10px] uppercase font-cinzel font-bold text-amber-300 tracking-wider">
            How to Play
          </p>
          {briefing.howToPlay.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#1c0d06]/80 border border-amber-900/40 flex items-start gap-2.5"
            >
              <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="text-xs font-bold text-amber-200">{item.title}</p>
                <p className="text-[11px] text-zinc-300 leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tips */}
        <div className="relative z-10 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-cinzel font-bold text-amber-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>EXPERT TIPS</span>
          </div>
          <ul className="text-[10.5px] text-amber-100/90 list-disc list-inside space-y-0.5 font-philosopher">
            {briefing.proTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* START BUTTON */}
        <div className="relative z-10 pt-1">
          <button
            onClick={() => {
              soundManager.init();
              soundManager.playTap();
              soundManager.playPowerUpCollect();
              onStart();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-white font-cinzel font-bold text-sm tracking-wider shadow-lg shadow-amber-950/80 border border-[#fef08a]/50 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>START {briefing.stepNumber}</span>
            <Play className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

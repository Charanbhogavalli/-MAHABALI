import React, { useState } from 'react';
import { globalAudio } from '../audio/GlobalAudioManager';
import {
  BookOpen,
  Sparkles,
  Crown,
  Flower2,
  Ship,
  Utensils,
  Calendar,
  Compass,
  Award,
} from 'lucide-react';

interface TribalArchivesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ArchiveTab = 'legend' | 'pookalam' | 'vallamkali' | 'sadya' | 'traditions';

export const TribalArchivesModal: React.FC<TribalArchivesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ArchiveTab>('legend');

  if (!isOpen) return null;

  const handleTabClick = (tab: ArchiveTab) => {
    globalAudio.playTap();
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1c0e07] via-[#140803] to-[#0a0301] border border-[#f59e0b]/40 shadow-2xl shadow-amber-950/80 p-5 text-[#fbf6ea] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow ambient background circles */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-orange-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#f59e0b]/25 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] text-white shadow-md shadow-amber-950/50">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-base text-[#fef08a] flex items-center gap-1.5">
                TRIBAL ARCHIVES
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CULTURAL CODEX
                </span>
              </h3>
              <p className="text-[11px] text-amber-200/70 font-philosopher">
                Sacred Lore, Heritage Rites & Onam Traditions
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 py-3 border-b border-[#f59e0b]/20 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => handleTabClick('legend')}
            className={`px-3 py-1.5 rounded-xl font-cinzel text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'legend'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                : 'bg-[#220e06] text-amber-200/80 hover:text-white hover:bg-[#321509]'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Mahabali Lore</span>
          </button>

          <button
            onClick={() => handleTabClick('pookalam')}
            className={`px-3 py-1.5 rounded-xl font-cinzel text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pookalam'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                : 'bg-[#220e06] text-amber-200/80 hover:text-white hover:bg-[#321509]'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>Pookalam Rituals</span>
          </button>

          <button
            onClick={() => handleTabClick('vallamkali')}
            className={`px-3 py-1.5 rounded-xl font-cinzel text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vallamkali'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                : 'bg-[#220e06] text-amber-200/80 hover:text-white hover:bg-[#321509]'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Vallam Kali Race</span>
          </button>

          <button
            onClick={() => handleTabClick('sadya')}
            className={`px-3 py-1.5 rounded-xl font-cinzel text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sadya'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                : 'bg-[#220e06] text-amber-200/80 hover:text-white hover:bg-[#321509]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Sadya Etiquette</span>
          </button>

          <button
            onClick={() => handleTabClick('traditions')}
            className={`px-3 py-1.5 rounded-xl font-cinzel text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'traditions'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                : 'bg-[#220e06] text-amber-200/80 hover:text-white hover:bg-[#321509]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>10 Days of Onam</span>
          </button>
        </div>

        {/* Scrollable Archive Content */}
        <div className="overflow-y-auto pr-1 py-3 text-xs leading-relaxed space-y-3 font-philosopher">
          {activeTab === 'legend' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <p className="font-cinzel text-amber-300 font-bold text-sm mb-1 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>The Golden Era of Mahabali</span>
                </p>
                <p className="text-[#fef08a]/90 italic mb-2">
                  "മാവേലി നാടു വാണീടും കാലം, മാനുഷരെല്ലാരും ഒന്നുപോലെ..."
                </p>
                <p className="text-zinc-300">
                  Mahabali, grandson of Prahlada, ruled Kerala with unparalleled righteousness, benevolence, and humility. Under his reign, there was neither poverty, caste discrimination, falsehood, nor theft.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30">
                <p className="font-cinzel text-sky-300 font-bold text-sm mb-1">
                  Vamana Avatar & Trivikrama
                </p>
                <p className="text-zinc-300">
                  Fearful of Mahabali’s ascendance, Indra sought Lord Vishnu's intervention. Vishnu incarnated as Vamana, a young Brahmin sage seeking just three paces of land measured by his stride. Mahabali granted the boon against the advice of guru Shukracharya.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-500/30">
                <p className="font-cinzel text-orange-300 font-bold text-sm mb-1">
                  The Thiruvonam Boon
                </p>
                <p className="text-zinc-300">
                  When Vamana’s first stride swallowed the earth and the second the cosmic heavens, Mahabali humbly presented his own crowned head for the third stride. Moved by his sacrifice, Vishnu granted him sovereignty over Suthala/Patala and blessed him to return annually to see his subjects on Thiruvonam.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pookalam' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <p className="font-cinzel text-amber-300 font-bold text-sm mb-1">
                  The Sacred Botanical Blooms
                </p>
                <ul className="space-y-2 text-zinc-300">
                  <li>
                    <strong className="text-white">Thumba (Leucas aspera):</strong> Pristine white sacred flower representing absolute purity, placed at the central bindu.
                  </li>
                  <li>
                    <strong className="text-white">Chethi (Ixora coccinea):</strong> Flaming crimson clusters warding off negative energies and honoring Mother Earth.
                  </li>
                  <li>
                    <strong className="text-white">Jamanthi (Chrysanthemum):</strong> Radiant golden petals symbolising prosperity, sunlight, and cosmic royalty.
                  </li>
                  <li>
                    <strong className="text-white">Shankhupushpam (Clitoria ternatea):</strong> Sacred blue conch flower devoted to Lord Vishnu and celestial tranquility.
                  </li>
                  <li>
                    <strong className="text-white">Tulsi (Holy Basil):</strong> Divine herbal green representing longevity, health, and spiritual clarity.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1e0e07] border border-[#f59e0b]/30">
                <p className="font-cinzel text-amber-300 font-bold text-xs mb-1">
                  Geometric Concentric Rings
                </p>
                <p className="text-zinc-300">
                  From Atham (Day 1) to Thiruvonam (Day 10), one concentric ring is added daily. The design must maintain sacred radial balance and organic overlap.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'vallamkali' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30">
                <p className="font-cinzel text-sky-300 font-bold text-sm mb-1">
                  Chundan Vallam (Snake Boat) Lore
                </p>
                <p className="text-zinc-300">
                  Stretching over 100 to 138 feet with a majestic raised stern resembling a hooded cobra, the Chundan Vallam is rowed by 100+ synchronised oarsmen powered by rhythmic Vanchipattu boat songs.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1e0e07] border border-[#f59e0b]/30">
                <p className="font-cinzel text-amber-300 font-bold text-xs mb-1">
                  Chenda & Vanchipattu Rhythm
                </p>
                <p className="text-zinc-300">
                  The Chenda drummers at the centre beat in strict cadence (Thalam). Missing the beat disrupts boat harmony, whereas perfect rhythm triggers the high-velocity "Maveli Frenzy" surge!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sadya' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <p className="font-cinzel text-emerald-300 font-bold text-sm mb-1">
                  The Plantain Leaf Sacred Geometry
                </p>
                <p className="text-zinc-300 mb-2">
                  The banana leaf is placed with its tapering tip pointing to the diner's left. Salt (Uppu) is placed first on the extreme left, followed by Upperi, Sharkara Varatti, and tangy pickles.
                </p>
                <ul className="space-y-1.5 text-zinc-300">
                  <li><strong className="text-amber-300">Left Tip:</strong> Salt (Uppu), Inji Puli, Banana Chips (Upperi).</li>
                  <li><strong className="text-amber-300">Top Rim:</strong> Side curries — Thoran, Avial, Olan, and Kaalan.</li>
                  <li><strong className="text-amber-300">Center:</strong> Red Matta Rice crowned by golden Parippu & Ghee, then Sambar.</li>
                  <li><strong className="text-amber-300">Bottom Right:</strong> Palada Payasam, served on the leaf or cup after rice.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1e0e07] border border-[#f59e0b]/30">
                <p className="font-cinzel text-amber-300 font-bold text-xs mb-1">
                  Folding the Leaf Etiquette
                </p>
                <p className="text-zinc-300">
                  Folding the banana leaf towards oneself signals deep satisfaction and bliss with the host's hospitality.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'traditions' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-[#1e0e07] border border-[#f59e0b]/30">
                <p className="font-cinzel text-amber-400 font-bold text-xs">
                  Day 1: Atham (അത്തം)
                </p>
                <p className="text-zinc-300 text-[11px]">
                  Start of Onam festivities. Single-ring Pookalam laid with Thumba flowers at morning sunrise.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#1e0e07] border border-[#f59e0b]/30">
                <p className="font-cinzel text-amber-400 font-bold text-xs">
                  Day 5: Anizham (അനിഴം)
                </p>
                <p className="text-zinc-300 text-[11px]">
                  Grand flag-off of the Aranmula Uthrattathi Boat Race across the Pamba river.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#1e0e07] border border-[#f59e0b]/30">
                <p className="font-cinzel text-amber-400 font-bold text-xs">
                  Day 9: Uthradam (ഉത്രാടം)
                </p>
                <p className="text-zinc-300 text-[11px]">
                  First Onam Eve. Bustling markets, fresh harvest vegetable purchases, and final preparations.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#1e0e07] border border-[#f59e0b]/30">
                <p className="font-cinzel text-amber-400 font-bold text-xs">
                  Day 10: Thiruvonam (തിരുവോണം)
                </p>
                <p className="text-zinc-300 text-[11px]">
                  The main festival day! King Mahabali visits every Kerala home. Grand 26-dish Sadya, Onakkodi new clothes, and joy across all lands.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#f59e0b]/25 flex items-center justify-end shrink-0">
          <button
            onClick={() => {
              globalAudio.playTap();
              onClose();
            }}
            className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-cinzel font-bold text-xs tracking-wider shadow-lg shadow-amber-950/60 border border-amber-300/40 active:scale-95 transition-all cursor-pointer"
          >
            RETURN TO ODYSSEY
          </button>
        </div>
      </div>
    </div>
  );
};

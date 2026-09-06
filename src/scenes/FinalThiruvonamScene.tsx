import React, { useEffect, useRef, useState } from 'react';
import { soundManager } from '../audio/SoundManager';
import { MahabaliRenderer } from '../characters/Mahabali';
import { ParticleSystem } from '../engine/particles';
import { GameSaveData } from '../types/game';

interface FinalThiruvonamSceneProps {
  saveData: GameSaveData;
  onProceedToResult: () => void;
}

export const FinalThiruvonamScene: React.FC<FinalThiruvonamSceneProps> = ({
  saveData,
  onProceedToResult,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<number>(0); // 0: reveal, 1: three steps, 2: grand return, 3: ready for scores
  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const animTickRef = useRef<number>(0);

  useEffect(() => {
    soundManager.playLevelSuccess();

    // Sequence the emotional reveal timeline
    const t1 = setTimeout(() => setPhase(1), 2200); // 3 Steps appear
    const t2 = setTimeout(() => setPhase(2), 5200); // "THIRUVONAM - MAHABALI HAS RETURNED"
    const t3 = setTimeout(() => setPhase(3), 8500); // "View Celebration Scores" button

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

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

      // 1. Festive Twilight Village Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#1a0b06');
      bgGrad.addColorStop(0.4, '#3f1508');
      bgGrad.addColorStop(0.8, '#1e0c05');
      bgGrad.addColorStop(1, '#0c0502');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant Kerala Temple Gopuram & Coconut Palm Silhouettes
      ctx.fillStyle = '#120703';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width * 0.25, height * 0.45);
      ctx.lineTo(width * 0.35, height * 0.38); // Gopuram peak
      ctx.lineTo(width * 0.45, height * 0.45);
      ctx.lineTo(width, height * 0.45);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Glowing River at bottom with floating water diyas
      const riverGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
      riverGrad.addColorStop(0, '#064e3b');
      riverGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = riverGrad;
      ctx.fillRect(0, height * 0.72, width, height * 0.28);

      // Moored Chundan Vallam Snake Boat on the riverbank
      ctx.fillStyle = '#261205';
      ctx.beginPath();
      ctx.moveTo(width * 0.65, height * 0.82);
      ctx.quadraticCurveTo(width * 0.85, height * 0.8, width * 0.95, height * 0.75);
      ctx.lineTo(width * 0.92, height * 0.86);
      ctx.quadraticCurveTo(width * 0.8, height * 0.88, width * 0.65, height * 0.86);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Mini Blooming Pookalam on Courtyard Flagstones
      ctx.save();
      ctx.translate(width * 0.22, height * 0.76);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Brass Floor Lamps flanking Mahabali
      const renderLamp = (lx: number, ly: number) => {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(lx - 2, ly - 26, 4, 26);
        ctx.beginPath();
        ctx.ellipse(lx, ly - 28, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Flame
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(lx, ly - 34 + Math.sin(animTickRef.current * 0.15) * 1.5, 2.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      };
      renderLamp(width * 0.28, height * 0.68);
      renderLamp(width * 0.72, height * 0.68);

      // King Mahabali in Grand Center Stage
      MahabaliRenderer.draw(ctx, width * 0.5, height * 0.66, 1.15, 'celebrate', animTickRef.current);

      // Particles (Golden fireworks & petals shower)
      if (animTickRef.current % 18 === 0) {
        particlesRef.current.emitCelebration(width, height * 0.8, 12);
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
    <div className="relative w-full h-full flex flex-col items-center justify-between text-[#fbf6ea] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Narrative & Phase Text Overlays */}
      <div className="relative z-10 w-full flex flex-col items-center pt-5 px-5 text-center">
        {phase >= 1 && (
          <div className="w-full flex flex-wrap items-center justify-center gap-2 md:gap-3 my-1.5 animate-fade-in">
            <div className="px-2.5 py-1 rounded-full bg-[#271206]/85 border border-[#f59e0b]/40 backdrop-blur-xs flex items-center gap-1.5">
              <span className="text-[9px] tracking-wider font-cinzel text-[#f59e0b]">I. CREATE</span>
              <span className="text-[11px] text-[#fef08a] font-philosopher">Pookalam</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#271206]/85 border border-[#f59e0b]/40 backdrop-blur-xs flex items-center gap-1.5">
              <span className="text-[9px] tracking-wider font-cinzel text-[#f59e0b]">II. UNITE</span>
              <span className="text-[11px] text-[#fef08a] font-philosopher">Vallam Kali</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#271206]/85 border border-[#f59e0b]/40 backdrop-blur-xs flex items-center gap-1.5">
              <span className="text-[9px] tracking-wider font-cinzel text-[#f59e0b]">III. CELEBRATE</span>
              <span className="text-[11px] text-[#fef08a] font-philosopher">Sadya</span>
            </div>
          </div>
        )}

        {phase >= 2 && (
          <div className="mt-2 space-y-0.5 transition-all duration-1000">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-cinzel text-[#f59e0b]">
              The Three Sacred Steps Fulfilled
            </p>
            <h1 className="text-2xl md:text-3xl font-bold font-philosopher text-transparent bg-clip-text bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#ea580c] drop-shadow-md">
              THIRUVONAM
            </h1>
            <p className="text-xs md:text-sm font-medium text-[#f1f5f9] tracking-wider font-cinzel">
              MAHABALI HAS RETURNED
            </p>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      <div className="relative z-10 w-full px-6 pb-8 flex flex-col items-center">
        {phase >= 3 ? (
          <button
            onClick={() => {
              soundManager.playTap();
              onProceedToResult();
            }}
            className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-white font-cinzel font-bold text-sm tracking-wider shadow-lg shadow-amber-900/40 border border-[#fef08a]/40 active:scale-95 transition-all cursor-pointer"
          >
            VIEW ONAM PERFORMANCE
          </button>
        ) : (
          <div className="h-12 flex items-center justify-center">
            <p className="text-xs text-[#fef08a]/60 font-cinzel tracking-widest animate-pulse">
              CELEBRATING IN HARMONY...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

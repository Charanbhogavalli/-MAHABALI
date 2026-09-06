import React, { useEffect, useRef } from 'react';
import { Pause } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';
import { ParticleSystem } from '../engine/particles';
import { PookalamLevel } from '../levels/PookalamLevel';
import { VallamKaliLevel } from '../levels/VallamKaliLevel';
import { SadyaLevel } from '../levels/SadyaLevel';
import { GameState, LevelScore, TouchPosition } from '../types/game';

interface GameCanvasProps {
  currentLevel: 1 | 2 | 3;
  isBriefingActive?: boolean;
  onPause: () => void;
  onLevelComplete: (level: 1 | 2 | 3, score: LevelScore) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevel,
  isBriefingActive = false,
  onPause,
  onLevelComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());

  // Level instances
  const level1Ref = useRef<PookalamLevel | null>(null);
  const level2Ref = useRef<VallamKaliLevel | null>(null);
  const level3Ref = useRef<SadyaLevel | null>(null);

  // Initialize level handlers
  useEffect(() => {
    level1Ref.current = new PookalamLevel(particlesRef.current, (score) => {
      onLevelComplete(1, score);
    });

    level2Ref.current = new VallamKaliLevel(particlesRef.current, (score) => {
      onLevelComplete(2, score);
    });

    level3Ref.current = new SadyaLevel(particlesRef.current, (score) => {
      onLevelComplete(3, score);
    });
  }, [onLevelComplete]);

  // Reset active level whenever currentLevel changes or when briefing closes
  useEffect(() => {
    if (!isBriefingActive) {
      if (currentLevel === 1) level1Ref.current?.reset();
      if (currentLevel === 2) level2Ref.current?.reset();
      if (currentLevel === 3) level3Ref.current?.reset();
    }
  }, [currentLevel, isBriefingActive]);

  // Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (!isBriefingActive) {
        if (currentLevel === 1 && level1Ref.current) {
          level1Ref.current.update(w, h);
        } else if (currentLevel === 2 && level2Ref.current) {
          level2Ref.current.update(w, h);
        } else if (currentLevel === 3 && level3Ref.current) {
          level3Ref.current.update(w, h);
        }
      }

      if (currentLevel === 1 && level1Ref.current) {
        level1Ref.current.render(ctx, w, h);
      } else if (currentLevel === 2 && level2Ref.current) {
        level2Ref.current.render(ctx, w, h);
      } else if (currentLevel === 3 && level3Ref.current) {
        level3Ref.current.render(ctx, w, h);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [currentLevel, isBriefingActive]);

  // Responsive DPI & Resize Handling
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Touch & Pointer interaction
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): TouchPosition => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    soundManager.init();
    const pos = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (currentLevel === 1) {
      level1Ref.current?.handleTouch(pos, canvas.width, canvas.height);
    } else if (currentLevel === 2) {
      level2Ref.current?.handleTouch(pos, canvas.width, canvas.height);
    } else if (currentLevel === 3) {
      level3Ref.current?.handleTouch(pos, canvas.width, canvas.height);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return; // Only process drag
    e.preventDefault();
    const pos = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (currentLevel === 2) {
      level2Ref.current?.handleTouch(pos, canvas.width, canvas.height);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#0e0603] overflow-hidden select-none touch-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="w-full h-full block cursor-pointer touch-none"
      />

      {/* Top Floating Utility HUD */}
      <div className="absolute top-2.5 right-3.5 z-30 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playTap();
            onPause();
          }}
          className="p-1.5 rounded-full bg-[#1b0c05]/80 border border-[#b45309]/50 text-[#fef08a] active:scale-95 transition-all cursor-pointer"
          aria-label="Pause Game"
        >
          <Pause className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

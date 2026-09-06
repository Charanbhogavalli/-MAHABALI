/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ASSETS } from './assets/assetRegistry';
import { TitleScene } from './scenes/TitleScene';
import { IntroScene } from './scenes/IntroScene';
import { StoryCinematicScene } from './scenes/StoryCinematicScene';
import { GameCanvas } from './components/GameCanvas';
import { FinalThiruvonamScene } from './scenes/FinalThiruvonamScene';
import { ResultScene } from './scenes/ResultScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { PauseModal } from './components/PauseModal';
import { MissionBriefingModal } from './components/MissionBriefingModal';
import { GameState, GameSaveData, LevelScore } from './types/game';

const INITIAL_SAVE_DATA: GameSaveData = {
  highScore: 0,
  levels: {
    1: { accuracy: 0, secondary: 0, timeSeconds: 0, totalPoints: 0, stars: 0, completed: false },
    2: { accuracy: 0, secondary: 0, timeSeconds: 0, totalPoints: 0, stars: 0, completed: false },
    3: { accuracy: 0, secondary: 0, timeSeconds: 0, totalPoints: 0, stars: 0, completed: false },
  },
  totalPlays: 0,
};

const STORAGE_KEY = 'mahabali_three_steps_save';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showBriefing, setShowBriefing] = useState<boolean>(false);
  const [saveData, setSaveData] = useState<GameSaveData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_SAVE_DATA;
  });

  // Save changes to local storage
  const updateSaveData = (updater: (prev: GameSaveData) => GameSaveData) => {
    setSaveData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleStartGame = () => {
    setGameState('INTRO');
  };

  const handleStartLevel = (lvl: 1 | 2 | 3) => {
    setCurrentLevel(lvl);
    setIsPaused(false);
    setShowBriefing(true);
    if (lvl === 1) setGameState('LEVEL_1_POOKALAM');
    if (lvl === 2) setGameState('LEVEL_2_VALLAM');
    if (lvl === 3) setGameState('LEVEL_3_SADYA');
  };

  const handleBriefingStart = () => {
    setShowBriefing(false);
  };

  const handleLevelComplete = (level: 1 | 2 | 3, score: LevelScore) => {
    // Record level score
    updateSaveData((prev) => {
      const existing = prev.levels[level];
      const bestScore = existing.completed && existing.totalPoints > score.totalPoints ? existing : score;
      const updatedLevels = {
        ...prev.levels,
        [level]: bestScore,
      };

      const allCompleted = updatedLevels[1].completed && updatedLevels[2].completed && updatedLevels[3].completed;
      const overallScore = allCompleted
        ? Math.round(
            ((updatedLevels[1].accuracy + updatedLevels[2].accuracy + updatedLevels[3].accuracy) / 3) * 0.5 +
            ((updatedLevels[1].secondary + updatedLevels[2].secondary + updatedLevels[3].secondary) / 3) * 0.5
          )
        : prev.highScore;

      return {
        ...prev,
        highScore: Math.max(prev.highScore, overallScore),
        levels: updatedLevels,
        totalPlays: prev.totalPlays + 1,
      };
    });

    // Advance to next step or finale
    if (level === 1) {
      handleStartLevel(2);
    } else if (level === 2) {
      handleStartLevel(3);
    } else if (level === 3) {
      setGameState('FINAL_THIRUVONAM');
    }
  };

  const handleRestartLevel = () => {
    setIsPaused(false);
    handleStartLevel(currentLevel);
  };

  const handleGoHome = () => {
    setIsPaused(false);
    setGameState('TITLE');
  };

  return (
    <main className="game-root">
      {/* Surrounding Ambient Kerala Paisley Wallpaper for Wide/Desktop screens */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-color-dodge pointer-events-none scale-105"
        style={{ backgroundImage: `url(${ASSETS.paisleyPattern})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0301]/80 via-transparent to-[#0a0301]/95 pointer-events-none" />

      <div className="game-shell">
        {/* Active Scene Router */}
        {gameState === 'TITLE' && (
          <TitleScene
            saveData={saveData}
            onStartGame={handleStartGame}
            onOpenStory={() => setGameState('STORY_CINEMATIC')}
            onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
          />
        )}

        {gameState === 'STORY_CINEMATIC' && (
          <StoryCinematicScene onComplete={() => setGameState('INTRO')} />
        )}

        {gameState === 'INTRO' && (
          <IntroScene
            onStartLevel1={() => handleStartLevel(1)}
            onWatchStory={() => setGameState('STORY_CINEMATIC')}
          />
        )}

        {gameState === 'LEVEL_SELECT' && (
          <LevelSelectScene
            saveData={saveData}
            onSelectLevel={(lvl) => handleStartLevel(lvl as 1 | 2 | 3)}
            onBack={() => setGameState('TITLE')}
          />
        )}

        {(gameState === 'LEVEL_1_POOKALAM' ||
          gameState === 'LEVEL_2_VALLAM' ||
          gameState === 'LEVEL_3_SADYA') && (
          <>
            <GameCanvas
              currentLevel={currentLevel}
              isBriefingActive={showBriefing}
              onPause={() => setIsPaused(true)}
              onLevelComplete={handleLevelComplete}
            />

            {showBriefing && (
              <MissionBriefingModal
                level={currentLevel}
                onStart={handleBriefingStart}
              />
            )}
          </>
        )}

        {gameState === 'FINAL_THIRUVONAM' && (
          <FinalThiruvonamScene
            saveData={saveData}
            onProceedToResult={() => setGameState('RESULT')}
          />
        )}

        {gameState === 'RESULT' && (
          <ResultScene
            saveData={saveData}
            onReplayAll={() => handleStartLevel(1)}
            onGoHome={handleGoHome}
            onSelectLevel={(lvl) => handleStartLevel(lvl as 1 | 2 | 3)}
          />
        )}

        {/* Global In-Game Pause Modal */}
        <PauseModal
          isOpen={isPaused}
          onResume={() => setIsPaused(false)}
          onRestart={handleRestartLevel}
          onGoHome={handleGoHome}
          onShowBriefing={() => {
            setIsPaused(false);
            setShowBriefing(true);
          }}
        />

      </div>
    </main>
  );
}

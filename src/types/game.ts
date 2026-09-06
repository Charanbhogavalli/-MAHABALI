export type GameState =
  | 'BOOT'
  | 'TITLE'
  | 'STORY_CINEMATIC'
  | 'INTRO'
  | 'LEVEL_SELECT'
  | 'LEVEL_1_POOKALAM'
  | 'LEVEL_1_COMPLETE'
  | 'LEVEL_2_VALLAM'
  | 'LEVEL_2_COMPLETE'
  | 'LEVEL_3_SADYA'
  | 'LEVEL_3_COMPLETE'
  | 'FINAL_THIRUVONAM'
  | 'RESULT';

export interface LevelScore {
  accuracy: number; // 0-100
  secondary: number; // Harmony (L1), Navigation (L2), Precision (L3)
  timeSeconds: number;
  totalPoints: number;
  stars: number; // 1-3
  completed: boolean;
}

export interface GameSaveData {
  highScore: number;
  levels: {
    1: LevelScore;
    2: LevelScore;
    3: LevelScore;
  };
  totalPlays: number;
  soundEnabled: boolean;
}

export interface FlowerType {
  id: string;
  name: string;
  malayalamName: string;
  color: string;
  accentColor: string;
  petalsCount: number;
  description: string;
}

export interface SadyaDish {
  id: string;
  name: string;
  malayalamName: string;
  category: 'condiment' | 'curry' | 'staple' | 'dessert';
  color: string;
  containerColor: string;
  xRatio: number; // 0-1 relative to banana leaf
  yRatio: number; // 0-1 relative to banana leaf
  radiusRatio: number;
  description: string;
  textureType: 'powder' | 'sauce' | 'chunks' | 'crisp' | 'sweet';
}

export interface TouchPosition {
  x: number;
  y: number;
}

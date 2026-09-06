import { soundManager } from '../audio/SoundManager';
import { MahabaliRenderer } from '../characters/Mahabali';
import { ParticleSystem } from '../engine/particles';
import { LevelScore, SadyaDish, TouchPosition } from '../types/game';

export interface PlacedSadyaItem {
  dish: SadyaDish;
  x: number;
  y: number;
  accuracyScore: number; // 0 to 100
  feedbackLabel: string;
  placedTime: number;
}

export const SADYA_DISHES: SadyaDish[] = [
  {
    id: 'uppu',
    name: 'Uppu',
    malayalamName: 'ഉപ്പ്',
    category: 'condiment',
    color: '#ffffff',
    containerColor: '#94a3b8',
    xRatio: 0.14,
    yRatio: 0.22,
    radiusRatio: 0.05,
    description: 'Pristine pure sea salt placed at the narrow tip of the leaf',
    textureType: 'powder',
  },
  {
    id: 'banana_chips',
    name: 'Upperi',
    malayalamName: 'ഉപ്പേരി',
    category: 'condiment',
    color: '#facc15',
    containerColor: '#ca8a04',
    xRatio: 0.25,
    yRatio: 0.22,
    radiusRatio: 0.065,
    description: 'Crisp golden raw banana chips fried in pure coconut oil',
    textureType: 'crisp',
  },
  {
    id: 'sharkara_upperi',
    name: 'Sharkara Varatti',
    malayalamName: 'ശർക്കരവരട്ടി',
    category: 'condiment',
    color: '#78350f',
    containerColor: '#451a03',
    xRatio: 0.36,
    yRatio: 0.22,
    radiusRatio: 0.065,
    description: 'Jaggery & dry ginger coated plantain pieces',
    textureType: 'chunks',
  },
  {
    id: 'inji_puli',
    name: 'Inji Puli',
    malayalamName: 'ഇഞ്ചിപ്പുളി',
    category: 'condiment',
    color: '#831843',
    containerColor: '#701a75',
    xRatio: 0.47,
    yRatio: 0.22,
    radiusRatio: 0.055,
    description: 'Tangy ginger, tamarind & jaggery digestive relish (100 curries worth)',
    textureType: 'sauce',
  },
  {
    id: 'manga_achar',
    name: 'Manga Achar',
    malayalamName: 'മാങ്ങ അച്ചാർ',
    category: 'condiment',
    color: '#ea580c',
    containerColor: '#c2410c',
    xRatio: 0.58,
    yRatio: 0.22,
    radiusRatio: 0.055,
    description: 'Spiced tender mango pickle seasoned with mustard and fenugreek',
    textureType: 'sauce',
  },
  {
    id: 'thoran',
    name: 'Cabbage Thoran',
    malayalamName: 'തോരൻ',
    category: 'curry',
    color: '#84cc16',
    containerColor: '#4d7c0f',
    xRatio: 0.69,
    yRatio: 0.23,
    radiusRatio: 0.07,
    description: 'Finely shredded cabbage sautéed with grated coconut and curry leaves',
    textureType: 'chunks',
  },
  {
    id: 'avial',
    name: 'Grand Avial',
    malayalamName: 'അവിയൽ',
    category: 'curry',
    color: '#fef08a',
    containerColor: '#eab308',
    xRatio: 0.81,
    yRatio: 0.25,
    radiusRatio: 0.085,
    description: 'Rich medly of indigenous vegetables in crushed coconut and curd',
    textureType: 'chunks',
  },
  {
    id: 'olan',
    name: 'Olan',
    malayalamName: 'ഓലൻ',
    category: 'curry',
    color: '#f8fafc',
    containerColor: '#cbd5e1',
    xRatio: 0.72,
    yRatio: 0.42,
    radiusRatio: 0.07,
    description: 'Ash gourd and red cowpeas simmered in mild fresh coconut milk',
    textureType: 'sauce',
  },
  {
    id: 'kaalan',
    name: 'Kaalan',
    malayalamName: 'കാളൻ',
    category: 'curry',
    color: '#f59e0b',
    containerColor: '#d97706',
    xRatio: 0.84,
    yRatio: 0.42,
    radiusRatio: 0.07,
    description: 'Thick creamy sour yoghurt curry with pepper and yam chunks',
    textureType: 'sauce',
  },
  {
    id: 'choru',
    name: 'Kerala Red Choru',
    malayalamName: 'ചോറ്',
    category: 'staple',
    color: '#fda4af',
    containerColor: '#fb7185',
    xRatio: 0.48,
    yRatio: 0.62,
    radiusRatio: 0.16,
    description: 'Aromatic mound of hot steamed indigenous Matta red rice',
    textureType: 'powder',
  },
  {
    id: 'parippu_ghee',
    name: 'Parippu & Neyy',
    malayalamName: 'പരിപ്പും നെയ്യും',
    category: 'curry',
    color: '#fef08a',
    containerColor: '#ca8a04',
    xRatio: 0.32,
    yRatio: 0.62,
    radiusRatio: 0.08,
    description: 'Cooked moong dal puree crowned with pure melted golden ghee',
    textureType: 'sauce',
  },
  {
    id: 'sambar',
    name: 'Kerala Sambar',
    malayalamName: 'സാമ്പാർ',
    category: 'curry',
    color: '#d97706',
    containerColor: '#9a3412',
    xRatio: 0.64,
    yRatio: 0.62,
    radiusRatio: 0.085,
    description: 'Tamarind roasted spice vegetable stew with drumstick & shallots',
    textureType: 'sauce',
  },
  {
    id: 'pappadam',
    name: 'Crisp Pappadam',
    malayalamName: 'പപ്പടം',
    category: 'condiment',
    color: '#fef3c7',
    containerColor: '#fde68a',
    xRatio: 0.18,
    yRatio: 0.76,
    radiusRatio: 0.085,
    description: 'Crisp golden puffed Kerala papad disc with bubbly blisters',
    textureType: 'crisp',
  },
  {
    id: 'palada_payasam',
    name: 'Palada Pradhaman',
    malayalamName: 'പാലട പ്രഥമൻ',
    category: 'dessert',
    color: '#fed7aa',
    containerColor: '#ea580c',
    xRatio: 0.82,
    yRatio: 0.74,
    radiusRatio: 0.085,
    description: 'Rich pinkish slow-simmered condensed milk payasam with rice ada & cashews',
    textureType: 'sweet',
  },
];

export class SadyaLevel {
  public isCompleted: boolean = false;
  public score: LevelScore = {
    accuracy: 100,
    secondary: 100,
    timeSeconds: 0,
    totalPoints: 0,
    stars: 3,
    completed: false,
  };

  private particles: ParticleSystem;
  private animTick: number = 0;
  private startTime: number = 0;
  private placedItems: Map<string, PlacedSadyaItem> = new Map();
  private currentDishQueue: SadyaDish[] = [];
  private selectedQueueIndex: number = 0;
  private totalScorePoints: number = 0;
  private totalDurationSeconds: number = 45;
  private remainingTime: number = 45;
  private comboCount: number = 0;
  private maxCombo: number = 0;
  private lastFeedback: { text: string; color: string; time: number } | null = null;
  private onCompleteCallback?: (score: LevelScore) => void;

  constructor(particles: ParticleSystem, onComplete?: (score: LevelScore) => void) {
    this.particles = particles;
    this.onCompleteCallback = onComplete;
    this.reset();
  }

  public reset() {
    this.isCompleted = false;
    this.animTick = 0;
    this.startTime = Date.now();
    this.placedItems = new Map();
    this.totalScorePoints = 0;
    this.remainingTime = this.totalDurationSeconds;
    this.comboCount = 0;
    this.maxCombo = 0;
    this.selectedQueueIndex = 0;
    this.lastFeedback = null;
    this.particles.clear();

    // Initial shuffle queue of dishes
    this.currentDishQueue = [...SADYA_DISHES].sort(() => Math.random() - 0.5);
  }

  public getAvailableDishes(): SadyaDish[] {
    return this.currentDishQueue.filter((d) => !this.placedItems.has(d.id));
  }

  public getSelectedDish(): SadyaDish | null {
    const available = this.getAvailableDishes();
    if (available.length === 0) return null;
    return available[this.selectedQueueIndex % available.length];
  }

  public selectNextDish() {
    const available = this.getAvailableDishes();
    if (available.length > 0) {
      this.selectedQueueIndex = (this.selectedQueueIndex + 1) % available.length;
      soundManager.playTap();
    }
  }

  public handleTouch(pos: TouchPosition, viewWidth: number, viewHeight: number): boolean {
    if (this.isCompleted) return false;

    // Banana Leaf Geometry Bounds on Screen
    const leafX = viewWidth * 0.07;
    const leafY = viewHeight * 0.27;
    const leafW = viewWidth * 0.86;
    const leafH = viewHeight * 0.45;

    // Bottom serving platter tap check (Next dish / Select dish)
    const platterY = viewHeight - 65;
    const available = this.getAvailableDishes();
    const itemSpacing = Math.min(54, (viewWidth - 30) / Math.min(5, available.length));
    const startX = viewWidth / 2 - ((Math.min(5, available.length) - 1) * itemSpacing) / 2;

    for (let i = 0; i < Math.min(5, available.length); i++) {
      const px = startX + i * itemSpacing;
      const dist = Math.hypot(pos.x - px, pos.y - platterY);
      if (dist < 26) {
        this.selectedQueueIndex = i;
        soundManager.playTap();
        return true;
      }
    }

    // Touch on Banana Leaf: Freeform Placement without pre-placed helper markers!
    const selectedDish = this.getSelectedDish();
    if (!selectedDish) return false;

    // Check if touch is within the banana leaf area
    if (pos.x >= leafX - 10 && pos.x <= leafX + leafW + 10 && pos.y >= leafY - 10 && pos.y <= leafY + leafH + 10) {
      // Calculate authentic canonical target coords
      const canonicalTargetX = leafX + selectedDish.xRatio * leafW;
      const canonicalTargetY = leafY + selectedDish.yRatio * leafH;

      // Distance error from authentic Kerala Sadya tradition
      const distError = Math.hypot(pos.x - canonicalTargetX, pos.y - canonicalTargetY);
      const leafDiagonal = Math.hypot(leafW, leafH);
      const normalizedError = distError / leafDiagonal;

      let accuracy = 100;
      let feedback = '✨ PERFECT TRADITION!';
      let feedbackColor = '#10b981';

      if (normalizedError < 0.12) {
        accuracy = 100;
        feedback = '🔥 ADIPOLI! PERFECT SPOT';
        feedbackColor = '#10b981';
        this.comboCount++;
        this.totalScorePoints += 150 * (1 + this.comboCount * 0.2);
        soundManager.playPowerUpCollect();
      } else if (normalizedError < 0.22) {
        accuracy = 80;
        feedback = '👍 GOOD PLACEMENT';
        feedbackColor = '#f59e0b';
        this.comboCount = Math.max(1, this.comboCount);
        this.totalScorePoints += 100;
        soundManager.playDishPlaced(selectedDish.category === 'dessert');
      } else {
        accuracy = 50;
        feedback = '⚠️ TRADITIONAL MISMATCH';
        feedbackColor = '#ef4444';
        this.comboCount = 0;
        this.totalScorePoints += 45;
        soundManager.playTap();
      }

      this.maxCombo = Math.max(this.maxCombo, this.comboCount);
      this.lastFeedback = {
        text: feedback,
        color: feedbackColor,
        time: Date.now(),
      };

      // Place dish right where the user tapped!
      this.placedItems.set(selectedDish.id, {
        dish: selectedDish,
        x: pos.x,
        y: pos.y,
        accuracyScore: accuracy,
        feedbackLabel: feedback,
        placedTime: Date.now(),
      });

      this.particles.emitPetals(pos.x, pos.y, 12, selectedDish.color);
      this.particles.emitSonicWave(pos.x, pos.y, selectedDish.color);

      if (selectedDish.category === 'dessert') {
        this.particles.emitPayasamGlow(pos.x, pos.y);
      }

      // Reset selection to next available item
      this.selectedQueueIndex = 0;

      // Check if all dishes placed
      if (this.placedItems.size >= SADYA_DISHES.length) {
        this.triggerCompletion(viewWidth, viewHeight);
      }

      return true;
    }

    return false;
  }

  private triggerCompletion(width: number, height: number) {
    this.isCompleted = true;
    const elapsed = (Date.now() - this.startTime) / 1000;

    let totalAcc = 0;
    this.placedItems.forEach((item) => {
      totalAcc += item.accuracyScore;
    });
    const avgAccuracy = Math.round(totalAcc / Math.max(1, this.placedItems.size));
    const culinaryMastery = Math.min(100, Math.round(75 + this.maxCombo * 2.5));
    const totalPoints = Math.round(this.totalScorePoints);

    let stars = 3;
    if (avgAccuracy < 80) stars = 2;
    if (avgAccuracy < 65) stars = 1;

    this.score = {
      accuracy: avgAccuracy,
      secondary: culinaryMastery,
      timeSeconds: Math.round(elapsed),
      totalPoints,
      stars,
      completed: true,
    };

    soundManager.playLevelSuccess();
    this.particles.emitCelebration(width, height, 60);

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback(this.score);
      }
    }, 3000);
  }

  public update(width: number, height: number) {
    this.animTick++;
    this.particles.update();

    // 45-Second timer countdown tracking
    if (!this.isCompleted) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.remainingTime = Math.max(0, this.totalDurationSeconds - elapsed);
      if (this.remainingTime <= 0) {
        this.triggerCompletion(width, height);
      }
    }

    // Hot steam rising from Choru rice mound if placed
    const choruItem = this.placedItems.get('choru');
    if (choruItem && this.animTick % 20 === 0) {
      this.particles.emitPetals(choruItem.x + (Math.random() - 0.5) * 24, choruItem.y - 8, 1, '#ffffff');
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // --- 1. Traditional Kerala Illam Dining Atmosphere ---
    this.renderDiningHall(ctx, width, height);

    // --- 2. King Mahabali (At the Head of the Feast) ---
    MahabaliRenderer.draw(ctx, width * 0.5, height * 0.22, 0.95, this.isCompleted ? 'celebrate' : 'idle', this.animTick);

    // --- 3. Traditional Clean Banana Leaf (Vazhayila) on Grass Mat ---
    this.renderBananaLeaf(ctx, width, height);

    // --- 4. Render User-Placed Realistic Dishes ---
    this.renderPlacedDishes(ctx, width, height);

    // --- 5. Particles ---
    this.particles.render(ctx);

    // --- 6. Feedback Toast Banner ---
    this.renderFeedbackToast(ctx, width, height);

    // --- 7. Bottom Serving Platter Tray & HUD ---
    this.renderServingTray(ctx, width, height);
    this.renderTopHUD(ctx, width, height);

    // --- 8. Completion Banner ---
    if (this.isCompleted) {
      this.renderCompletionBanner(ctx, width, height);
    }
  }

  private renderDiningHall(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Warm, ambient wooden illam hall gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#2a1207');
    bgGrad.addColorStop(0.5, '#190a04');
    bgGrad.addColorStop(1, '#0e0502');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Filtered golden sunlight beams from courtyard window
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.04)';
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 0);
    ctx.lineTo(width * 0.6, 0);
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(width * 0.4, height * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Traditional Pullupaya (Woven Straw Grass Mat)
    const matX = width * 0.04;
    const matY = height * 0.24;
    const matW = width * 0.92;
    const matH = height * 0.51;

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(matX, matY, matW, matH, 10);
    ctx.fill();

    // Mat woven straw lines
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.lineWidth = 1;
    for (let x = matX; x < matX + matW; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, matY);
      ctx.lineTo(x, matY + matH);
      ctx.stroke();
    }
  }

  private renderBananaLeaf(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const leafX = width * 0.07;
    const leafY = height * 0.27;
    const leafW = width * 0.86;
    const leafH = height * 0.45;

    ctx.save();
    // Fresh Plantain Leaf Green Gradient
    const leafGrad = ctx.createLinearGradient(leafX, leafY, leafX + leafW, leafY + leafH);
    leafGrad.addColorStop(0, '#15803d');
    leafGrad.addColorStop(0.5, '#16a34a');
    leafGrad.addColorStop(1, '#14532d');

    // Traditional tapered Vazhayila shape (narrow left tip 'Tunchu', broad right)
    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.moveTo(leafX, leafY + leafH * 0.5); // Leaf tip (Left/Tunch)
    ctx.bezierCurveTo(leafX + leafW * 0.2, leafY, leafX + leafW * 0.8, leafY + leafH * 0.04, leafX + leafW, leafY + leafH * 0.2);
    ctx.bezierCurveTo(leafX + leafW * 1.02, leafY + leafH * 0.5, leafX + leafW, leafY + leafH * 0.8, leafX + leafW * 0.85, leafY + leafH * 0.96);
    ctx.bezierCurveTo(leafX + leafW * 0.5, leafY + leafH * 0.98, leafX + leafW * 0.2, leafY + leafH, leafX, leafY + leafH * 0.5);
    ctx.closePath();
    ctx.fill();

    // Leaf Rib (Center Thick Midrib)
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leafX, leafY + leafH * 0.5);
    ctx.lineTo(leafX + leafW, leafY + leafH * 0.5);
    ctx.stroke();

    // Subtle leaf vein lines
    ctx.strokeStyle = 'rgba(134, 239, 172, 0.22)';
    ctx.lineWidth = 1.2;
    for (let lx = leafX + 16; lx < leafX + leafW - 10; lx += 16) {
      ctx.beginPath();
      ctx.moveTo(lx, leafY + leafH * 0.5);
      ctx.lineTo(lx + 10, leafY + leafH * 0.12);
      ctx.moveTo(lx, leafY + leafH * 0.5);
      ctx.lineTo(lx + 10, leafY + leafH * 0.88);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderPlacedDishes(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const leafW = width * 0.86;

    this.placedItems.forEach((item) => {
      const { dish, x, y } = item;
      const radius = dish.radiusRatio * leafW;

      ctx.save();
      ctx.translate(x, y);

      // Render ultra-realistic food illustrations
      this.renderRealisticDishItem(ctx, dish, radius);

      // Placed score badge
      if (Date.now() - item.placedTime < 1800) {
        ctx.fillStyle = item.accuracyScore === 100 ? '#10b981' : item.accuracyScore >= 80 ? '#f59e0b' : '#ef4444';
        ctx.font = '700 9px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(`+${item.accuracyScore}`, 0, -radius - 4);
      }

      ctx.restore();
    });
  }

  private renderRealisticDishItem(ctx: CanvasRenderingContext2D, dish: SadyaDish, radius: number) {
    const r = radius;

    // Subtle dark food shadow on banana leaf
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(2, 3, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    switch (dish.id) {
      case 'uppu': {
        // Sparkling pure crystal salt mound
        const saltGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, r);
        saltGrad.addColorStop(0, '#ffffff');
        saltGrad.addColorStop(0.7, '#e2e8f0');
        saltGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = saltGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering micro salt crystals
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 8; i++) {
          ctx.fillRect((Math.random() - 0.5) * r * 1.2, (Math.random() - 0.5) * r * 1.2, 1.5, 1.5);
        }
        break;
      }

      case 'banana_chips': {
        // Golden crispy banana chips stack
        for (let c = 0; c < 3; c++) {
          const ox = (c - 1) * 5;
          const oy = (c % 2) * 3;
          ctx.save();
          ctx.translate(ox, oy);
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 0.75, r * 0.65, 0.2 * c, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 0.65, r * 0.55, 0.2 * c, 0, Math.PI * 2);
          ctx.fill();

          // Fried center ring core
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
        break;
      }

      case 'sharkara_upperi': {
        // Dark jaggery spice cubes
        ctx.fillStyle = '#451a03';
        for (let i = 0; i < 4; i++) {
          const bx = (i % 2 === 0 ? -1 : 1) * 6;
          const by = Math.floor(i / 2) * 6 - 4;
          ctx.beginPath();
          ctx.roundRect(bx - 5, by - 5, 11, 11, 2);
          ctx.fill();

          // Dry ginger & cumin white powder dust coating
          ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.fillRect(bx - 3, by - 3, 4, 3);
          ctx.fillStyle = '#451a03';
        }
        break;
      }

      case 'inji_puli': {
        // Glossy dark ginger tamarind glaze
        const sauceGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        sauceGrad.addColorStop(0, '#831843');
        sauceGrad.addColorStop(0.8, '#4c0519');
        sauceGrad.addColorStop(1, '#2e0814');
        ctx.fillStyle = sauceGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mustard seeds & curry leaf speckles
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(-4, -2, 1.5, 0, Math.PI * 2);
        ctx.arc(3, 4, 1.2, 0, Math.PI * 2);
        ctx.arc(5, -3, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'manga_achar': {
        // Fiery red spiced mango pieces
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#c2410c';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.roundRect((i - 1) * 6 - 3, (i % 2) * 4 - 3, 8, 7, 2);
          ctx.fill();
        }
        break;
      }

      case 'thoran': {
        // Sautéed cabbage and grated white coconut
        ctx.fillStyle = '#4d7c0f';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Grated coconut specks
        ctx.fillStyle = '#fef08a';
        for (let i = 0; i < 14; i++) {
          ctx.fillRect((Math.random() - 0.5) * r * 1.4, (Math.random() - 0.5) * r * 1.2, 2, 2);
        }
        break;
      }

      case 'avial': {
        // 13 vegetable medley in coconut curd
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vegetable strips (Drumstick green, carrot orange, plantain yellow)
        const vegColors = ['#ea580c', '#15803d', '#facc15', '#ffffff'];
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = vegColors[i % vegColors.length];
          ctx.save();
          ctx.rotate((i * Math.PI) / 3);
          ctx.fillRect(-8, -2, 16, 4);
          ctx.restore();
        }

        // Fresh green curry leaf on crown
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(0, -2, 7, 3, 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'olan': {
        // Ash gourd coconut milk stew
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red cowpeas (Vanpayar)
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(-4, -2, 3, 0, Math.PI * 2);
        ctx.arc(3, 3, 2.8, 0, Math.PI * 2);
        ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'kaalan': {
        // Thick yellow yoghurt curry
        const kGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        kGrad.addColorStop(0, '#fef08a');
        kGrad.addColorStop(0.7, '#f59e0b');
        kGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = kGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'choru': {
        // Steamed mountain of Rosematta rice
        const riceGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r);
        riceGrad.addColorStop(0, '#ffffff');
        riceGrad.addColorStop(0.6, '#fecdd3');
        riceGrad.addColorStop(1, '#fb7185');
        ctx.fillStyle = riceGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Individual Matta grain striations
        ctx.fillStyle = '#f43f5e';
        for (let i = 0; i < 18; i++) {
          ctx.fillRect((Math.random() - 0.5) * r * 1.5, (Math.random() - 0.5) * r * 1.3, 3.5, 1.8);
        }
        break;
      }

      case 'parippu_ghee': {
        // Golden moong dal with melted streaming ghee
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Clarified Golden Ghee stream in center
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'sambar': {
        // Rich aromatic vegetable stew
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Drumstick chunk & coriander
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-6, -3, 12, 5);
        break;
      }

      case 'pappadam': {
        // Golden puffed crispy blistered pappadam
        const papGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        papGrad.addColorStop(0, '#fef9c3');
        papGrad.addColorStop(0.7, '#fef08a');
        papGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = papGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.fill();

        // Crisp blister bubbles
        ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-6, -5, 4, 0, Math.PI * 2);
        ctx.arc(5, 4, 5, 0, Math.PI * 2);
        ctx.arc(4, -6, 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'palada_payasam': {
        // Creamy blush-pink Palada Pradhaman
        const payasamGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, r);
        payasamGrad.addColorStop(0, '#fed7aa');
        payasamGrad.addColorStop(0.7, '#fdba74');
        payasamGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = payasamGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.fill();

        // Translucent square rice ada flakes
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect((i - 1.5) * 6, (i % 2) * 5 - 4, 5, 4);
        }

        // Golden fried cashew nut
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(3, -2, 5, 3, 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      default:
        ctx.fillStyle = dish.color;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
    }
  }

  private renderFeedbackToast(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.lastFeedback) return;
    const elapsed = Date.now() - this.lastFeedback.time;
    if (elapsed > 2000) return;

    const alpha = Math.max(0, 1 - elapsed / 2000);
    ctx.save();
    ctx.fillStyle = this.lastFeedback.color;
    ctx.globalAlpha = alpha;
    ctx.font = '700 13px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.lastFeedback.text, width / 2, height * 0.74);
    ctx.restore();
  }

  private renderServingTray(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const platterY = height - 65;
    const available = this.getAvailableDishes();
    const selectedDish = this.getSelectedDish();

    if (!selectedDish || available.length === 0) return;

    // Brass Platter Background Bar
    ctx.fillStyle = 'rgba(27, 13, 7, 0.92)';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    const trayWidth = Math.min(width - 24, Math.min(5, available.length) * 54 + 28);
    ctx.beginPath();
    ctx.roundRect(width / 2 - trayWidth / 2, platterY - 30, trayWidth, 58, 29);
    ctx.fill();
    ctx.stroke();

    const itemSpacing = Math.min(54, (width - 30) / Math.min(5, available.length));
    const startX = width / 2 - ((Math.min(5, available.length) - 1) * itemSpacing) / 2;

    for (let i = 0; i < Math.min(5, available.length); i++) {
      const dish = available[i];
      const px = startX + i * itemSpacing;
      const isSelected = i === this.selectedQueueIndex;

      ctx.save();
      ctx.translate(px, platterY);

      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Miniature dish bowl icon
      this.renderRealisticDishItem(ctx, dish, 14);

      ctx.restore();
    }

    // Selected Dish Info Label
    ctx.fillStyle = '#fef08a';
    ctx.font = '600 12px Philosopher, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Tap Leaf to Serve: ${selectedDish.name} (${selectedDish.malayalamName})`, width / 2, platterY + 44);
    ctx.textAlign = 'left';
  }

  private renderTopHUD(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const progress = this.placedItems.size / SADYA_DISHES.length;
    const isUrgentTimer = this.remainingTime <= 10;

    // Header Bar
    ctx.fillStyle = 'rgba(14, 6, 3, 0.85)';
    ctx.fillRect(0, 0, width, 52);

    // Live POINTS On Screen (Left)
    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 10px Cinzel, serif';
    ctx.fillText('SCORE', 16, 18);

    ctx.fillStyle = '#fef08a';
    ctx.font = '800 16px Cinzel, serif';
    ctx.fillText(`${this.totalScorePoints.toLocaleString()} PTS`, 16, 36);

    // Real-Time 45s TIMER On Screen (Center)
    ctx.save();
    const timerCenterX = width / 2;
    ctx.fillStyle = isUrgentTimer ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = isUrgentTimer ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(timerCenterX - 36, 10, 72, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isUrgentTimer ? '#ef4444' : '#fef08a';
    ctx.font = '800 13px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱ ${this.remainingTime.toFixed(1)}s`, timerCenterX, 30);
    ctx.restore();

    // Dishes Counter (Right)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 10px Cinzel, serif';
    ctx.textAlign = 'right';
    ctx.fillText('BANANA LEAF FEAST', width - 16, 18);

    ctx.fillStyle = '#fef08a';
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`${this.placedItems.size}/${SADYA_DISHES.length} Dishes`, width - 16, 34);
    ctx.textAlign = 'left';

    // Thin bottom progress bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, 50, width, 2.5);

    ctx.fillStyle = isUrgentTimer ? '#ef4444' : '#f59e0b';
    ctx.fillRect(0, 50, width * progress, 2.5);

    // Combo indicator
    if (this.comboCount > 1 && !this.isCompleted) {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 44, 56, 88, 20, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✨ ${this.comboCount}x PERFECT`, width / 2, 70);
      ctx.textAlign = 'left';
    }
  }

  private renderCompletionBanner(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = 'rgba(10, 5, 2, 0.88)';
    ctx.fillRect(0, height * 0.42 - 55, width, 110);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 14px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THIRD STEP COMPLETE', width / 2, height * 0.42 - 14);

    ctx.fillStyle = '#fef08a';
    ctx.font = '700 22px Philosopher, serif';
    ctx.fillText('The Grand Feast is Served', width / 2, height * 0.42 + 16);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 12px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`Score: ${this.totalScorePoints} Pts • Authentic Etiquette Mastered!`, width / 2, height * 0.42 + 38);
    ctx.textAlign = 'left';
  }
}

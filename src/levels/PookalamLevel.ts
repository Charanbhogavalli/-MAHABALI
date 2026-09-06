import { soundManager } from '../audio/SoundManager';
import { MahabaliRenderer } from '../characters/Mahabali';
import { ParticleSystem } from '../engine/particles';
import { FlowerType, LevelScore, TouchPosition } from '../types/game';

export interface PookalamSlot {
  ring: number; // 0 (center bindu), 1 (inner), 2 (mid), 3 (outer)
  index: number;
  totalInRing: number;
  angle: number;
  x: number;
  y: number;
  radius: number;
  targetFlower: FlowerType; // Authentic original blueprint flower
  placedFlower: FlowerType | null;
  glowAnim: number;
  matchScore: number; // 0: empty, 1: mismatch, 2: close, 3: perfect match
  rotationJitter?: number;
  scaleJitter?: number;
  offsetXJitter?: number;
  offsetYJitter?: number;
}

interface FloatingScorePopup {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

export const FLOWERS: FlowerType[] = [
  {
    id: 'thumba',
    name: 'Thumba',
    malayalamName: 'തുമ്പപ്പൂവ്',
    color: '#ffffff',
    accentColor: '#86efac',
    petalsCount: 5,
    description: 'Pure sacred white floral symbol of Onam',
  },
  {
    id: 'chethi',
    name: 'Chethi',
    malayalamName: 'ചെത്തി',
    color: '#ef4444',
    accentColor: '#7f1d1d',
    petalsCount: 4,
    description: 'Vibrant flame red ixora blossom',
  },
  {
    id: 'marigold_yellow',
    name: 'Jamanthi',
    malayalamName: 'മഞ്ഞ ജമന്തി',
    color: '#facc15',
    accentColor: '#ca8a04',
    petalsCount: 8,
    description: 'Golden yellow marigold layered petals',
  },
  {
    id: 'marigold_orange',
    name: 'Naranga Jamanthi',
    malayalamName: 'ഓറഞ്ച് ജമന്തി',
    color: '#f97316',
    accentColor: '#9a3412',
    petalsCount: 8,
    description: 'Warm dusk orange floral cluster',
  },
  {
    id: 'shankhupushpam',
    name: 'Shankhupushpam',
    malayalamName: 'ശംഖുപുഷ്പം',
    color: '#3b82f6',
    accentColor: '#1e3a8a',
    petalsCount: 6,
    description: 'Royal butterfly pea blue bloom',
  },
  {
    id: 'tulsi',
    name: 'Tulsi',
    malayalamName: 'തുളസി',
    color: '#10b981',
    accentColor: '#064e3b',
    petalsCount: 4,
    description: 'Sacred emerald basil leaves',
  },
];

export class PookalamLevel {
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
  private selectedFlowerIndex: number = 0;
  private slots: PookalamSlot[] = [];
  private totalSlotsCount: number = 0;
  private placedSlotsCount: number = 0;
  private matchedSlotsCount: number = 0;
  private comboCount: number = 0;
  private maxCombo: number = 0;
  private totalPointsAccumulated: number = 0;
  private startTime: number = 0;
  private totalDurationSeconds: number = 45; // 45 seconds timer
  private remainingTime: number = 45;
  private cameraScale: number = 1.0;
  private targetCameraScale: number = 1.0;
  private popups: FloatingScorePopup[] = [];
  private nextPopupId: number = 1;
  private showBlueprintPreview: boolean = false;
  private onCompleteCallback?: (score: LevelScore) => void;

  constructor(particles: ParticleSystem, onComplete?: (score: LevelScore) => void) {
    this.particles = particles;
    this.onCompleteCallback = onComplete;
    this.reset();
  }

  public reset() {
    this.isCompleted = false;
    this.animTick = 0;
    this.selectedFlowerIndex = 0;
    this.comboCount = 0;
    this.maxCombo = 0;
    this.totalPointsAccumulated = 0;
    this.matchedSlotsCount = 0;
    this.startTime = Date.now();
    this.remainingTime = this.totalDurationSeconds;
    this.cameraScale = 1.0;
    this.targetCameraScale = 1.0;
    this.popups = [];
    this.showBlueprintPreview = false;
    this.particles.clear();
    soundManager.ensureMusicPlaying();

    this.initSlots();
  }

  private initSlots() {
    this.slots = [];
    // Authentic sacred blueprint configuration:
    const createJitter = () => ({
      rotationJitter: (Math.random() - 0.5) * 0.45,
      scaleJitter: 0.94 + Math.random() * 0.12,
      offsetXJitter: (Math.random() - 0.5) * 2.2,
      offsetYJitter: (Math.random() - 0.5) * 2.2,
    });

    // Ring 0 (Bindu Center): Thumba (White)
    this.slots.push({
      ring: 0,
      index: 0,
      totalInRing: 1,
      angle: 0,
      x: 0,
      y: 0,
      radius: 18,
      targetFlower: FLOWERS[0], // Thumba
      placedFlower: null,
      glowAnim: 0,
      matchScore: 0,
      ...createJitter(),
    });

    // Ring 1 (Inner Sacred Ring - 6 slots): Alternating Chethi (Red) and Jamanthi (Yellow)
    const ring1Count = 6;
    for (let i = 0; i < ring1Count; i++) {
      const angle = (i * Math.PI * 2) / ring1Count;
      const target = i % 2 === 0 ? FLOWERS[1] : FLOWERS[2]; // Chethi / Jamanthi
      this.slots.push({
        ring: 1,
        index: i,
        totalInRing: ring1Count,
        angle,
        x: Math.cos(angle) * 42,
        y: Math.sin(angle) * 42,
        radius: 14,
        targetFlower: target,
        placedFlower: null,
        glowAnim: 0,
        matchScore: 0,
        ...createJitter(),
      });
    }

    // Ring 2 (Middle Ring - 10 slots): Symmetrical Naranga Jamanthi (Orange) & Shankhupushpam (Royal Blue)
    const ring2Count = 10;
    for (let i = 0; i < ring2Count; i++) {
      const angle = (i * Math.PI * 2) / ring2Count + Math.PI / ring2Count;
      const target = i % 2 === 0 ? FLOWERS[3] : FLOWERS[4]; // Orange / Blue
      this.slots.push({
        ring: 2,
        index: i,
        totalInRing: ring2Count,
        angle,
        x: Math.cos(angle) * 78,
        y: Math.sin(angle) * 78,
        radius: 14,
        targetFlower: target,
        placedFlower: null,
        glowAnim: 0,
        matchScore: 0,
        ...createJitter(),
      });
    }

    // Ring 3 (Outer Geometric Ring - 14 slots): Alternating Tulsi (Green) & Jamanthi (Golden Yellow)
    const ring3Count = 14;
    for (let i = 0; i < ring3Count; i++) {
      const angle = (i * Math.PI * 2) / ring3Count;
      const target = i % 2 === 0 ? FLOWERS[5] : FLOWERS[2]; // Tulsi / Yellow Marigold
      this.slots.push({
        ring: 3,
        index: i,
        totalInRing: ring3Count,
        angle,
        x: Math.cos(angle) * 118,
        y: Math.sin(angle) * 118,
        radius: 13,
        targetFlower: target,
        placedFlower: null,
        glowAnim: 0,
        matchScore: 0,
        ...createJitter(),
      });
    }

    this.totalSlotsCount = this.slots.length;
    this.placedSlotsCount = 0;
  }

  public getSelectedFlower(): FlowerType {
    return FLOWERS[this.selectedFlowerIndex];
  }

  public selectFlower(index: number) {
    if (index >= 0 && index < FLOWERS.length) {
      this.selectedFlowerIndex = index;
      soundManager.playTap();
    }
  }

  private addScorePopup(text: string, x: number, y: number, color: string) {
    this.popups.push({
      id: this.nextPopupId++,
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale: 1.2,
    });
  }

  public getAccuracyPercentage(): number {
    if (this.placedSlotsCount === 0) return 100;
    const totalMatchPoints = this.slots.reduce((sum, s) => sum + s.matchScore, 0);
    const maxPossiblePoints = this.placedSlotsCount * 3;
    return Math.min(100, Math.round((totalMatchPoints / maxPossiblePoints) * 100));
  }

  public handleTouch(pos: TouchPosition, viewWidth: number, viewHeight: number): boolean {
    if (this.isCompleted) return false;

    // Check if player clicked the Miniature Blueprint Preview Box in top right
    const blueprintBoxX = viewWidth - 55;
    const blueprintBoxY = 70;
    if (Math.hypot(pos.x - blueprintBoxX, pos.y - blueprintBoxY) < 32) {
      this.showBlueprintPreview = !this.showBlueprintPreview;
      soundManager.playTap();
      return true;
    }

    // Center of Pookalam in screen space
    const centerX = viewWidth / 2;
    const centerY = viewHeight * 0.44;

    // Check if player touched one of the flower selector petals at the bottom
    const selectorY = viewHeight - 65;
    const itemSpacing = Math.min(52, (viewWidth - 40) / FLOWERS.length);
    const startX = centerX - ((FLOWERS.length - 1) * itemSpacing) / 2;

    for (let i = 0; i < FLOWERS.length; i++) {
      const fx = startX + i * itemSpacing;
      const dist = Math.hypot(pos.x - fx, pos.y - selectorY);
      if (dist < 28) {
        this.selectFlower(i);
        this.particles.emitPetals(fx, selectorY, 6, FLOWERS[i].color);
        return true;
      }
    }

    // Convert touch pos to Pookalam relative coords
    const relX = (pos.x - centerX) / this.cameraScale;
    const relY = (pos.y - centerY) / this.cameraScale;

    // Find closest slot
    let closestSlot: PookalamSlot | null = null;
    let minDist = 32;

    for (const slot of this.slots) {
      const d = Math.hypot(relX - slot.x, relY - slot.y);
      if (d < minDist) {
        minDist = d;
        closestSlot = slot;
      }
    }

    if (closestSlot) {
      const currentFlower = this.getSelectedFlower();
      const isNewPlacement = closestSlot.placedFlower === null;

      closestSlot.placedFlower = currentFlower;
      closestSlot.glowAnim = 1.0;

      if (isNewPlacement) {
        this.placedSlotsCount++;
      }

      const screenSlotX = centerX + closestSlot.x * this.cameraScale;
      const screenSlotY = centerY + closestSlot.y * this.cameraScale;

      // --- COMPARE USER DESIGN AGAINST ORIGINAL TARGET DESIGN ---
      const isExactMatch = currentFlower.id === closestSlot.targetFlower.id;
      const isColorHarmonious =
        (currentFlower.id === 'marigold_yellow' && closestSlot.targetFlower.id === 'marigold_orange') ||
        (currentFlower.id === 'marigold_orange' && closestSlot.targetFlower.id === 'marigold_yellow') ||
        (currentFlower.id === 'chethi' && closestSlot.targetFlower.id === 'marigold_orange');

      let pointsGained = 0;
      if (isExactMatch) {
        closestSlot.matchScore = 3;
        this.comboCount++;
        this.maxCombo = Math.max(this.maxCombo, this.comboCount);
        this.matchedSlotsCount++;
        pointsGained = Math.round(120 * (1 + this.comboCount * 0.15));
        this.totalPointsAccumulated += pointsGained;

        this.addScorePopup(`+${pointsGained} PERFECT!`, screenSlotX, screenSlotY - 15, '#fef08a');
        soundManager.playFlowerPlace(1.0 + Math.min(1.0, this.comboCount * 0.08));
        this.particles.emitPetals(screenSlotX, screenSlotY, 14, currentFlower.color);
        this.particles.emitSonicWave(screenSlotX, screenSlotY, '#f59e0b');
      } else if (isColorHarmonious) {
        closestSlot.matchScore = 2;
        this.comboCount = Math.max(1, this.comboCount);
        pointsGained = 60;
        this.totalPointsAccumulated += pointsGained;

        this.addScorePopup(`+${pointsGained} GOOD MATCH`, screenSlotX, screenSlotY - 15, '#67e8f9');
        soundManager.playFlowerPlace(0.95);
        this.particles.emitPetals(screenSlotX, screenSlotY, 8, currentFlower.color);
      } else {
        closestSlot.matchScore = 1;
        this.comboCount = 0; // combo broken on mismatch
        pointsGained = 25;
        this.totalPointsAccumulated += pointsGained;

        this.addScorePopup(`+${pointsGained} (Target: ${closestSlot.targetFlower.name})`, screenSlotX, screenSlotY - 15, '#fca5a5');
        soundManager.playTap();
        this.particles.emitPetals(screenSlotX, screenSlotY, 5, currentFlower.color);
      }

      // Check if full concentric ring completed
      const ringSlots = this.slots.filter((s) => s.ring === closestSlot!.ring);
      const ringCompleted = ringSlots.every((s) => s.placedFlower !== null);
      if (ringCompleted) {
        const allRingMatched = ringSlots.every((s) => s.placedFlower?.id === s.targetFlower.id);
        if (allRingMatched) {
          const ringBonus = 350;
          this.totalPointsAccumulated += ringBonus;
          this.addScorePopup(`+${ringBonus} RING HARMONY BONUS!`, centerX, centerY - 40, '#38bdf8');
          soundManager.playPowerUpCollect();
          this.particles.emitPayasamGlow(centerX, centerY);
          this.particles.emitCelebration(viewWidth, viewHeight, 25);
        }
      }

      // Check if level complete
      if (this.placedSlotsCount >= this.totalSlotsCount) {
        this.triggerCompletion(viewWidth, viewHeight);
      }
      return true;
    }

    return false;
  }

  private triggerCompletion(width: number, height: number) {
    if (this.isCompleted) return;
    this.isCompleted = true;
    this.targetCameraScale = 0.88;

    const elapsed = Math.min(this.totalDurationSeconds, (Date.now() - this.startTime) / 1000);
    const accuracy = this.getAccuracyPercentage();
    const speedBonus = Math.max(0, Math.round((this.totalDurationSeconds - elapsed) * 20));
    this.totalPointsAccumulated += speedBonus;

    let stars = 1;
    if (accuracy >= 85 && this.placedSlotsCount >= this.totalSlotsCount) stars = 3;
    else if (accuracy >= 65 || this.placedSlotsCount >= 20) stars = 2;

    this.score = {
      accuracy,
      secondary: Math.min(100, Math.round(50 + this.maxCombo * 4)),
      timeSeconds: Math.round(elapsed),
      totalPoints: Math.round(this.totalPointsAccumulated),
      stars,
      completed: true,
    };

    soundManager.playLevelSuccess();
    this.particles.emitCelebration(width, height, 55);

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback(this.score);
      }
    }, 2800);
  }

  public update(width: number, height: number) {
    this.animTick++;
    this.particles.update();

    // 45s countdown timer tracking
    if (!this.isCompleted) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.remainingTime = Math.max(0, this.totalDurationSeconds - elapsed);
      if (this.remainingTime <= 0) {
        this.triggerCompletion(width, height);
      }
    }

    this.cameraScale += (this.targetCameraScale - this.cameraScale) * 0.04;

    for (const slot of this.slots) {
      if (slot.glowAnim > 0) {
        slot.glowAnim = Math.max(0, slot.glowAnim - 0.03);
      }
    }

    // Update floating popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.y -= 0.8;
      p.alpha -= 0.02;
      p.scale = Math.max(0.9, p.scale - 0.01);
      if (p.alpha <= 0) {
        this.popups.splice(i, 1);
      }
    }

    if (this.animTick % 45 === 0) {
      this.particles.emitPetals(Math.random() * width, -10, 1, '#facc15');
      this.particles.emitSparks(width * 0.15, height * 0.65, 1);
      this.particles.emitSparks(width * 0.85, height * 0.65, 1);
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // --- 1. Traditional Nalukettu Courtyard Environment ---
    this.renderCourtyardBackground(ctx, width, height);

    // --- 2. Central Pookalam Mandala ---
    const centerX = width / 2;
    const centerY = height * 0.44;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(this.cameraScale, this.cameraScale);

    this.renderPookalamBase(ctx);
    this.renderPookalamSlots(ctx);

    ctx.restore();

    // --- 3. Traditional Brass Nilavilakku Lamps ---
    this.renderLamp(ctx, width * 0.14, height * 0.68, 0.9);
    this.renderLamp(ctx, width * 0.86, height * 0.68, 0.9);

    // --- 4. King Mahabali ---
    const mahabaliPose = this.isCompleted ? 'bless' : 'idle';
    MahabaliRenderer.draw(ctx, width * 0.5, height * 0.22, 0.95, mahabaliPose, this.animTick);

    // --- 5. Floating Score Popups ---
    this.renderScorePopups(ctx);

    // --- 6. Particles ---
    this.particles.render(ctx);

    // --- 7. Original Blueprint Target Miniature Preview ---
    this.renderTargetBlueprintPreview(ctx, width, height);

    // --- 8. In-Game UI: Flower Selection Thalams & Top HUD (Points & 45s Timer) ---
    this.renderBottomFlowerSelector(ctx, width, height);
    this.renderTopHUD(ctx, width, height);

    // --- 9. Completion Banner ---
    if (this.isCompleted) {
      this.renderCompletionBanner(ctx, width, height);
    }
  }

  private renderCourtyardBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const bgGrad = ctx.createRadialGradient(width / 2, height * 0.4, 40, width / 2, height * 0.5, width * 0.8);
    bgGrad.addColorStop(0, '#2d180f');
    bgGrad.addColorStop(0.5, '#1b0d07');
    bgGrad.addColorStop(1, '#0e0603');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Terracotta Courtyard Floor Tiles
    ctx.strokeStyle = 'rgba(217, 119, 54, 0.08)';
    ctx.lineWidth = 1;
    const tileSize = 36;
    for (let x = 0; x < width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Sloped Tiled Roof Eaves
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height * 0.08);
    ctx.lineTo(0, height * 0.08);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, height * 0.08, width, 4);

    this.renderWoodenPillar(ctx, 16, height * 0.08, height * 0.8);
    this.renderWoodenPillar(ctx, width - 26, height * 0.08, height * 0.8);
  }

  private renderWoodenPillar(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
    ctx.fillStyle = '#271206';
    ctx.fillRect(x, y, 10, h);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 2, y + 20, 14, 6);
    ctx.fillRect(x - 2, y + h - 30, 14, 6);
  }

  private renderLamp(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(-3, -40, 6, 40);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -20, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, -42, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const flicker = Math.sin(this.animTick * 0.15 + x) * 2;
    const flameGrad = ctx.createRadialGradient(0, -50 + flicker, 2, 0, -50 + flicker, 24);
    flameGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    flameGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.7)');
    flameGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(0, -50 + flicker, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, -48 + flicker, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderPookalamBase(ctx: CanvasRenderingContext2D) {
    // Outer stone ring
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 138, 0, Math.PI * 2);
    ctx.stroke();

    // Sacred geometric radial petals background
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.18)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
      ctx.lineTo(Math.cos(a) * 138, Math.sin(a) * 138);
      ctx.stroke();
    }

    // Rings 3, 2, 1 guide lines
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 118, 0, Math.PI * 2);
    ctx.arc(0, 0, 78, 0, Math.PI * 2);
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sacred Center Bindu
    const centerGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
    centerGrad.addColorStop(0, '#fef08a');
    centerGrad.addColorStop(0.6, '#f59e0b');
    centerGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderPookalamSlots(ctx: CanvasRenderingContext2D) {
    for (const slot of this.slots) {
      ctx.save();
      ctx.translate(slot.x, slot.y);

      if (slot.placedFlower) {
        // --- Render User Placed Flower with Organic Hand-Arranged Natural Placement ---
        ctx.save();
        ctx.translate(slot.offsetXJitter || 0, slot.offsetYJitter || 0);
        ctx.rotate(slot.rotationJitter || 0);
        const effectiveRadius = slot.radius * (slot.scaleJitter || 1.0);

        // Soft organic contact drop shadow on courtyard floor
        ctx.shadowColor = 'rgba(15, 6, 2, 0.45)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        this.renderRealisticFlower(ctx, slot.placedFlower, effectiveRadius);
        ctx.restore();

        // Verification indicator: Glow badge if matches target design
        if (slot.matchScore === 3) {
          ctx.strokeStyle = '#22c55e'; // Bright green match ring
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, slot.radius * 1.15, 0, Math.PI * 2);
          ctx.stroke();
        } else if (slot.matchScore === 1) {
          ctx.strokeStyle = '#ef4444'; // Red mismatch ring
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, slot.radius * 1.15, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (slot.glowAnim > 0) {
          ctx.fillStyle = `rgba(254, 240, 138, ${slot.glowAnim * 0.7})`;
          ctx.beginPath();
          ctx.arc(0, 0, slot.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // --- Empty Slot: Target Flower Ghost Outline to Compare & Place ---
        ctx.strokeStyle = slot.targetFlower.color;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, slot.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Translucent target ghost petal
        ctx.save();
        ctx.globalAlpha = 0.28;
        this.renderRealisticFlower(ctx, slot.targetFlower, slot.radius * 0.85);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  private renderRealisticFlower(ctx: CanvasRenderingContext2D, flower: FlowerType, radius: number) {
    const r = radius * 0.95;

    ctx.save();
    switch (flower.id) {
      case 'thumba': {
        // Pure sacred white 5-petaled star with delicate pale-green pistil
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5;
          ctx.save();
          ctx.rotate(a);
          const pGrad = ctx.createLinearGradient(0, 0, r, 0);
          pGrad.addColorStop(0, '#f0fdf4');
          pGrad.addColorStop(0.7, '#ffffff');
          pGrad.addColorStop(1, '#e2e8f0');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.ellipse(r * 0.5, 0, r * 0.55, r * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'chethi': {
        // Vibrant scarlet red 4-lobed cross ixora blossom
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI * 2) / 4;
          ctx.save();
          ctx.rotate(a);
          const cGrad = ctx.createLinearGradient(0, 0, r, 0);
          cGrad.addColorStop(0, '#dc2626');
          cGrad.addColorStop(0.6, '#ef4444');
          cGrad.addColorStop(1, '#b91c1c');
          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.ellipse(r * 0.52, 0, r * 0.52, r * 0.26, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'marigold_yellow': {
        // Multi-layered golden yellow marigold
        for (let layer = 0; layer < 2; layer++) {
          const count = layer === 0 ? 8 : 6;
          const lr = layer === 0 ? r : r * 0.65;
          for (let i = 0; i < count; i++) {
            const a = (i * Math.PI * 2) / count + (layer * Math.PI) / 8;
            ctx.save();
            ctx.rotate(a);
            ctx.fillStyle = layer === 0 ? '#facc15' : '#fde047';
            ctx.beginPath();
            ctx.ellipse(lr * 0.5, 0, lr * 0.5, lr * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'marigold_orange': {
        // Warm dusk orange marigold
        for (let layer = 0; layer < 2; layer++) {
          const count = layer === 0 ? 8 : 6;
          const lr = layer === 0 ? r : r * 0.65;
          for (let i = 0; i < count; i++) {
            const a = (i * Math.PI * 2) / count + (layer * Math.PI) / 8;
            ctx.save();
            ctx.rotate(a);
            ctx.fillStyle = layer === 0 ? '#ea580c' : '#f97316';
            ctx.beginPath();
            ctx.ellipse(lr * 0.5, 0, lr * 0.5, lr * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'shankhupushpam': {
        // Royal butterfly pea blue bloom
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI * 2) / 6;
          ctx.save();
          ctx.rotate(a);
          const bGrad = ctx.createLinearGradient(0, 0, r, 0);
          bGrad.addColorStop(0, '#1e40af');
          bGrad.addColorStop(0.7, '#3b82f6');
          bGrad.addColorStop(1, '#60a5fa');
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.ellipse(r * 0.5, 0, r * 0.5, r * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.25, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'tulsi': {
        // Sacred emerald basil leaf sprig
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI * 2) / 4;
          ctx.save();
          ctx.rotate(a);
          ctx.fillStyle = '#047857';
          ctx.beginPath();
          ctx.ellipse(r * 0.52, 0, r * 0.52, r * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(r * 0.8, 0);
          ctx.stroke();
          ctx.restore();
        }
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      default:
        ctx.fillStyle = flower.color;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }

  private renderScorePopups(ctx: CanvasRenderingContext2D) {
    for (const popup of this.popups) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, popup.alpha);
      ctx.fillStyle = popup.color;
      ctx.font = '800 12px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(popup.text, popup.x, popup.y);
      ctx.restore();
    }
  }

  private renderTargetBlueprintPreview(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const boxX = width - 44;
    const boxY = 72;
    const size = 30;

    ctx.save();
    ctx.translate(boxX, boxY);

    // Miniature Blueprint Box Frame
    ctx.fillStyle = 'rgba(17, 7, 3, 0.9)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw miniature target mandala inside
    const miniScale = 0.21;
    for (const slot of this.slots) {
      ctx.save();
      ctx.translate(slot.x * miniScale, slot.y * miniScale);
      ctx.fillStyle = slot.targetFlower.color;
      ctx.beginPath();
      ctx.arc(0, 0, slot.radius * miniScale * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Label
    ctx.fillStyle = '#fef08a';
    ctx.font = '700 8.5px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET', 0, size + 11);
    ctx.fillText('DESIGN', 0, size + 20);

    ctx.restore();
  }

  private renderBottomFlowerSelector(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const selectorY = height - 62;
    const itemSpacing = Math.min(52, (width - 40) / FLOWERS.length);
    const startX = width / 2 - ((FLOWERS.length - 1) * itemSpacing) / 2;

    ctx.fillStyle = 'rgba(27, 13, 7, 0.92)';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    const trayWidth = Math.min(width - 24, FLOWERS.length * itemSpacing + 28);
    ctx.beginPath();
    ctx.roundRect(width / 2 - trayWidth / 2, selectorY - 30, trayWidth, 58, 29);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < FLOWERS.length; i++) {
      const fx = startX + i * itemSpacing;
      const flower = FLOWERS[i];
      const isSelected = i === this.selectedFlowerIndex;

      ctx.save();
      ctx.translate(fx, selectorY);

      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      this.renderRealisticFlower(ctx, flower, 14);

      ctx.restore();
    }

    // Active flower name
    const sel = this.getSelectedFlower();
    ctx.fillStyle = '#fef08a';
    ctx.font = '600 12px Philosopher, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Select: ${sel.name} (${sel.malayalamName})`, width / 2, selectorY + 44);
    ctx.textAlign = 'left';
  }

  private renderTopHUD(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const progress = this.placedSlotsCount / Math.max(1, this.totalSlotsCount);
    const accuracy = this.getAccuracyPercentage();
    const isUrgentTimer = this.remainingTime <= 10;

    // Header Bar
    ctx.fillStyle = 'rgba(14, 6, 3, 0.85)';
    ctx.fillRect(0, 0, width, 52);

    // Live POINTS On Screen (Prominently displayed)
    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 10px Cinzel, serif';
    ctx.fillText('SCORE', 16, 18);

    ctx.fillStyle = '#fef08a';
    ctx.font = '800 16px Cinzel, serif';
    ctx.fillText(`${this.totalPointsAccumulated.toLocaleString()} PTS`, 16, 36);

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

    // Design Accuracy Badge & Flower Count (Right)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 10px Cinzel, serif';
    ctx.textAlign = 'right';
    ctx.fillText(`MATCH: ${accuracy}%`, width - 16, 18);

    ctx.fillStyle = '#fef08a';
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`${this.placedSlotsCount}/${this.totalSlotsCount} Flowers`, width - 16, 34);
    ctx.textAlign = 'left';

    // Thin bottom progress bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, 50, width, 2.5);

    ctx.fillStyle = isUrgentTimer ? '#ef4444' : '#f59e0b';
    ctx.fillRect(0, 50, width * progress, 2.5);

    // Combo streak badge
    if (this.comboCount > 1 && !this.isCompleted) {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 44, 56, 88, 20, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 ${this.comboCount}x PERFECT`, width / 2, 70);
      ctx.textAlign = 'left';
    }
  }

  private renderCompletionBanner(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = 'rgba(10, 5, 2, 0.92)';
    ctx.fillRect(0, height * 0.42 - 58, width, 116);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 14px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FIRST STEP COMPLETE', width / 2, height * 0.42 - 16);

    ctx.fillStyle = '#fef08a';
    ctx.font = '700 22px Philosopher, serif';
    ctx.fillText('The Sacred Mandala Blooms', width / 2, height * 0.42 + 14);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
    ctx.fillText(
      `Final Score: ${this.totalPointsAccumulated.toLocaleString()} Pts • Accuracy: ${this.getAccuracyPercentage()}%`,
      width / 2,
      height * 0.42 + 36
    );
    ctx.textAlign = 'left';
  }
}

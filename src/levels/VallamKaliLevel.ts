import { soundManager } from '../audio/SoundManager';
import { MahabaliRenderer } from '../characters/Mahabali';
import { ParticleSystem } from '../engine/particles';
import { LevelScore, TouchPosition } from '../types/game';

interface RiverHazard {
  id: number;
  x: number; // 0 to 1 across river width
  y: number; // distance down the river track (in meters)
  type: 'log' | 'lily' | 'whirlpool' | 'rival_boat' | 'payasam' | 'shankh' | 'lotus_gold';
  width: number;
  height: number;
  passed: boolean;
  hit: boolean;
  collected?: boolean;
}

interface FloatingCallout {
  text: string;
  subtext: string;
  color: string;
  scale: number;
  life: number;
}

export class VallamKaliLevel {
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

  // Boat physics & steering
  private boatX: number = 0.5; // normalized 0.15 to 0.85
  private targetBoatX: number = 0.5;
  private boatDistance: number = 0; // 0 to targetDistance meters
  private targetDistance: number = 600; // Total race distance
  private boatSpeed: number = 0;
  private baseSpeed: number = 20; // m/s
  private syncMeter: number = 60; // 0 to 100%
  private hazards: RiverHazard[] = [];
  private hazardHits: number = 0;
  private perfectRows: number = 0;
  private totalRhythmAttempts: number = 0;

  // Crazy Combo & Turbo Mode
  private comboStreak: number = 0;
  private maxCombo: number = 0;
  private turboTimer: number = 0; // Turbo boost countdown ticks
  private invincibilityTimer: number = 0;
  private screenShake: number = 0;
  private callout: FloatingCallout | null = null;
  private bonusPoints: number = 0;
  private totalDurationSeconds: number = 45;
  private remainingTime: number = 45;

  // Rhythm engine
  private beatIntervalMs: number = 820; // BPM ~ 73
  private lastBeatTime: number = 0;
  private lastFrameTime: number = 0;
  private rhythmRingScale: number = 1.0;
  private rowPhase: number = 0; // 0 to 1 oar stroke cycle
  private onCompleteCallback?: (score: LevelScore) => void;

  constructor(particles: ParticleSystem, onComplete?: (score: LevelScore) => void) {
    this.particles = particles;
    this.onCompleteCallback = onComplete;
    this.reset();
  }

  public reset() {
    this.isCompleted = false;
    this.animTick = 0;
    const now = performance.now();
    this.startTime = now;
    this.lastBeatTime = now;
    this.lastFrameTime = now;
    this.boatX = 0.5;
    this.targetBoatX = 0.5;
    this.boatDistance = 0;
    this.boatSpeed = this.baseSpeed * 0.6;
    this.syncMeter = 70;
    this.hazardHits = 0;
    this.perfectRows = 0;
    this.totalRhythmAttempts = 0;
    this.comboStreak = 0;
    this.maxCombo = 0;
    this.turboTimer = 0;
    this.invincibilityTimer = 0;
    this.screenShake = 0;
    this.callout = null;
    this.bonusPoints = 0;
    this.remainingTime = this.totalDurationSeconds;
    this.particles.clear();
    soundManager.ensureMusicPlaying();

    this.generateHazards();
  }

  private generateHazards() {
    this.hazards = [];
    // Spawn hazards & awesome powerups every 24-38 meters
    for (let d = 60; d < this.targetDistance - 30; d += 26 + Math.random() * 18) {
      // 30% chance for powerup, 70% for obstacles
      const isPowerup = Math.random() < 0.32;
      let type: 'log' | 'lily' | 'whirlpool' | 'rival_boat' | 'payasam' | 'shankh' | 'lotus_gold';

      if (isPowerup) {
        const powerups: Array<'payasam' | 'shankh' | 'lotus_gold'> = ['payasam', 'shankh', 'lotus_gold'];
        type = powerups[Math.floor(Math.random() * powerups.length)];
      } else {
        const obstacles: Array<'log' | 'lily' | 'whirlpool' | 'rival_boat'> = ['lily', 'log', 'whirlpool', 'rival_boat'];
        type = obstacles[Math.floor(Math.random() * obstacles.length)];
      }

      const x = 0.22 + Math.random() * 0.56;
      this.hazards.push({
        id: d,
        x,
        y: d,
        type,
        width: type === 'rival_boat' ? 0.20 : 0.15,
        height: type === 'rival_boat' ? 22 : 12,
        passed: false,
        hit: false,
        collected: false,
      });
    }
  }

  public handleTouch(pos: TouchPosition, viewWidth: number, viewHeight: number) {
    if (this.isCompleted) return;

    // Steering: target boat X follows horizontal touch smoothly
    const normX = pos.x / viewWidth;
    this.targetBoatX = Math.max(0.18, Math.min(0.82, normX));

    // Rhythm Tap Check
    const now = performance.now();
    const timeSinceLastBeat = (now - this.lastBeatTime) % this.beatIntervalMs;
    const timeToNextBeat = this.beatIntervalMs - timeSinceLastBeat;
    const timeDiff = Math.min(timeSinceLastBeat, timeToNextBeat);

    this.totalRhythmAttempts++;

    // Timing window: <= 190ms is perfect, <= 340ms is good
    if (timeDiff <= 190) {
      // Perfect Row!
      this.perfectRows++;
      this.comboStreak++;
      if (this.comboStreak > this.maxCombo) this.maxCombo = this.comboStreak;
      this.syncMeter = Math.min(100, this.syncMeter + 12);
      
      soundManager.playChendaBeat(1.0, true);
      soundManager.playWaterSplash(0.8);

      const boatPx = viewWidth * this.boatX;
      const boatPy = viewHeight * 0.72;
      this.particles.emitWaterSpray(boatPx - 25, boatPy, -3, 8);
      this.particles.emitWaterSpray(boatPx + 25, boatPy, 3, 8);
      this.particles.emitSonicWave(boatPx, boatPy, '#f59e0b');

      // Crazy Combo Callouts
      if (this.comboStreak === 3) {
        this.triggerCallout('🔥 ADIPOLI!', '3x Perfect Streak!', '#f59e0b');
        soundManager.playCrowdCheer();
      } else if (this.comboStreak === 6) {
        this.triggerCallout('⚡ MAVELI FRENZY!', 'HYPER SPEED UNLOCKED!', '#ef4444');
        this.turboTimer = 180; // 3 seconds of hyper speed
        this.screenShake = 6;
        soundManager.playConchBlast();
        soundManager.playCrowdCheer();
      } else if (this.comboStreak >= 10 && this.comboStreak % 4 === 0) {
        this.triggerCallout('🏆 THRISSUR POORAM!', `${this.comboStreak}x ULTRA COMBO!`, '#fef08a');
        this.particles.emitCelebration(viewWidth, viewHeight, 20);
        soundManager.playCrowdCheer();
      }
    } else if (timeDiff <= 340) {
      // Good Row
      this.syncMeter = Math.min(100, this.syncMeter + 4);
      soundManager.playChendaBeat(0.7, false);
      soundManager.playWaterSplash(0.5);
    } else {
      // Off-beat row: resets streak
      this.comboStreak = 0;
      this.syncMeter = Math.max(15, this.syncMeter - 6);
      soundManager.playChendaBeat(0.4, false);
    }
  }

  private triggerCallout(text: string, subtext: string, color: string) {
    this.callout = {
      text,
      subtext,
      color,
      scale: 1.4,
      life: 60,
    };
  }

  public update(width: number, height: number) {
    this.animTick++;
    this.particles.update();

    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    if (this.turboTimer > 0) {
      this.turboTimer--;
      this.particles.emitTurboTrail(width * this.boatX, height * 0.72);
      if (this.animTick % 6 === 0) {
        this.screenShake = Math.max(this.screenShake, 3);
      }
    }

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer--;
    }

    if (this.callout) {
      this.callout.life--;
      this.callout.scale = Math.max(1.0, this.callout.scale * 0.95);
      if (this.callout.life <= 0) this.callout = null;
    }

    if (this.isCompleted) return;

    // 45-Second countdown timer tracking
    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;
    this.remainingTime = Math.max(0, this.totalDurationSeconds - elapsed);
    if (this.remainingTime <= 0) {
      this.triggerCompletion(width, height);
      return;
    }
    const rawDt = (now - (this.lastFrameTime || now)) / 1000;
    this.lastFrameTime = now;
    const dt = Math.min(0.05, Math.max(0.008, rawDt));

    // Beat pulse for rhythm ring & oarsmen
    const beatProgress = ((now - this.lastBeatTime) % this.beatIntervalMs) / this.beatIntervalMs;
    this.rhythmRingScale = 1.0 + (1.0 - beatProgress) * 0.8;
    this.rowPhase = beatProgress;

    // Boat horizontal smooth dampening
    this.boatX += (this.targetBoatX - this.boatX) * Math.min(1, dt * 10);

    // Speed calculation (Boosted in Turbo Mode)
    const turboMultiplier = this.turboTimer > 0 ? 1.7 : 1.0;
    const targetSpeed = this.baseSpeed * (0.4 + (this.syncMeter / 100) * 1.1) * turboMultiplier;
    this.boatSpeed += (targetSpeed - this.boatSpeed) * Math.min(1, dt * 5);

    // Advance boat along backwater river smoothly
    this.boatDistance += this.boatSpeed * dt;

    // Natural sync decay if player stops rowing
    if (this.animTick % 30 === 0 && this.turboTimer === 0) {
      this.syncMeter = Math.max(18, this.syncMeter - 0.7);
    }

    // Emit boat wake water spray
    if (this.animTick % 4 === 0) {
      const sprayVel = this.turboTimer > 0 ? 4 : 2;
      this.particles.emitWaterSpray(width * this.boatX - 18, height * 0.76, -sprayVel, 3);
      this.particles.emitWaterSpray(width * this.boatX + 18, height * 0.76, sprayVel, 3);
    }

    // Check collision and collectibles
    for (const h of this.hazards) {
      if (h.passed) continue;
      const distDelta = h.y - this.boatDistance;

      // Close to boat collision box
      if (distDelta < 6 && distDelta > -6) {
        const xDist = Math.abs(this.boatX - h.x);

        // Power-ups
        if (h.type === 'payasam' || h.type === 'shankh' || h.type === 'lotus_gold') {
          if (xDist < 0.12 && !h.collected) {
            h.collected = true;
            soundManager.playPowerUpCollect();
            const px = width * this.boatX;
            const py = height * 0.68;

            if (h.type === 'payasam') {
              this.turboTimer = 220; // ~4 seconds of crazy turbo
              this.syncMeter = 100;
              this.bonusPoints += 250;
              this.particles.emitPayasamGlow(px, py);
              this.triggerCallout('🍯 GOLDEN PAYASAM!', 'TURBO BOOST +250 PTS!', '#fef08a');
              soundManager.playCrowdCheer();
            } else if (h.type === 'shankh') {
              this.invincibilityTimer = 240; // 4 seconds invincibility
              this.bonusPoints += 150;
              this.particles.emitSonicWave(px, py, '#38bdf8');
              this.triggerCallout('🐚 SACRED SHANKH!', 'DIVINE SHIELD ACTIVE!', '#38bdf8');
              soundManager.playConchBlast();
            } else if (h.type === 'lotus_gold') {
              this.bonusPoints += 300;
              this.syncMeter = 100;
              this.particles.emitCelebration(width, height, 25);
              this.triggerCallout('🌸 GOLDEN LOTUS!', '+300 FESTIVE BONUS!', '#ec4899');
            }
          }
        } else {
          // Obstacles
          if (xDist < (h.width / 2 + 0.07) && !h.hit) {
            h.hit = true;
            if (this.invincibilityTimer > 0 || this.turboTimer > 0) {
              // Destroy obstacle in invincible mode!
              this.bonusPoints += 50;
              soundManager.playChendaBeat(1.0, true);
              this.particles.emitSonicWave(width * h.x, height * 0.68, '#f59e0b');
              this.screenShake = 4;
            } else {
              this.hazardHits++;
              this.comboStreak = 0;
              this.syncMeter = Math.max(15, this.syncMeter - 16);
              this.boatSpeed = Math.max(this.baseSpeed * 0.4, this.boatSpeed * 0.75);
              this.screenShake = 5;
              soundManager.playWaterSplash(0.9);
              this.particles.emitWaterSpray(width * this.boatX, height * 0.7, 0, 10);
            }
          }
        }
      }

      if (distDelta < -15) {
        h.passed = true;
      }
    }

    // Check race completion
    if (this.boatDistance >= this.targetDistance && !this.isCompleted) {
      this.triggerCompletion(width, height);
    }
  }

  private triggerCompletion(width: number, height: number) {
    this.isCompleted = true;
    const elapsed = (performance.now() - this.startTime) / 1000;
    const rhythmRatio = this.totalRhythmAttempts > 0 ? this.perfectRows / this.totalRhythmAttempts : 0.8;
    const rhythmScore = Math.min(100, Math.round(rhythmRatio * 100 + 15));
    const navScore = Math.max(65, Math.round(100 - this.hazardHits * 6));
    const totalPoints = Math.round((rhythmScore * 0.5 + navScore * 0.5) * 10 + this.bonusPoints);

    let stars = 3;
    if (navScore < 85 || rhythmScore < 80) stars = 2;
    if (navScore < 70 && rhythmScore < 70) stars = 1;

    this.score = {
      accuracy: rhythmScore,
      secondary: navScore,
      timeSeconds: Math.round(elapsed),
      totalPoints,
      stars,
      completed: true,
    };

    soundManager.playLevelSuccess();
    this.particles.emitCelebration(width, height, 50);

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback(this.score);
      }
    }, 2800);
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // --- 1. Parallax Kerala Backwaters Environment ---
    this.renderBackwaters(ctx, width, height);

    // --- 2. River Hazards & Power-ups ---
    this.renderHazards(ctx, width, height);

    // --- 3. The Grand Chundan Vallam Snake Boat ---
    const boatScreenX = width * this.boatX;
    const boatScreenY = height * 0.68;
    this.renderChundanVallam(ctx, boatScreenX, boatScreenY);

    // --- 4. Particles ---
    this.particles.render(ctx);

    // --- 5. Floating Callout Banner ---
    this.renderCallout(ctx, width, height);

    // --- 6. Rowing Rhythm Indicator & HUD ---
    this.renderRhythmHUD(ctx, width, height);
    this.renderTopHUD(ctx, width, height);

    // --- 7. Completion Banner ---
    if (this.isCompleted) {
      this.renderCompletionBanner(ctx, width, height);
    }

    ctx.restore();
  }

  private renderCallout(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.callout) return;

    ctx.save();
    ctx.translate(width / 2, height * 0.42);
    ctx.scale(this.callout.scale, this.callout.scale);

    // Glow backing
    ctx.fillStyle = 'rgba(15, 6, 2, 0.8)';
    ctx.beginPath();
    ctx.roundRect(-120, -28, 240, 56, 12);
    ctx.fill();

    ctx.strokeStyle = this.callout.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = this.callout.color;
    ctx.font = '800 18px Philosopher, Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.callout.text, 0, -2);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText(this.callout.subtext, 0, 16);

    ctx.restore();
  }

  private renderBackwaters(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // River Sky (Dynamic Golden/Sunset)
    const isTurbo = this.turboTimer > 0;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
    skyGrad.addColorStop(0, '#1c1917');
    skyGrad.addColorStop(0.5, isTurbo ? '#b45309' : '#7c2d12');
    skyGrad.addColorStop(1, isTurbo ? '#f59e0b' : '#ea580c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.35);

    // Distant Coconut Palm Silhouettes Layer
    const scrollFar = (this.boatDistance * 4) % width;
    ctx.fillStyle = '#1c1917';
    for (let x = -width; x < width * 2; x += 60) {
      const px = x - (scrollFar * 0.3);
      this.renderPalmTree(ctx, px, height * 0.28, 0.6);
    }

    // River Water (Glows Golden during Turbo Frenzy)
    const waterGrad = ctx.createLinearGradient(0, height * 0.3, 0, height);
    if (isTurbo) {
      waterGrad.addColorStop(0, '#065f46');
      waterGrad.addColorStop(0.5, '#0d9488');
      waterGrad.addColorStop(1, '#042f2e');
    } else {
      waterGrad.addColorStop(0, '#064e3b');
      waterGrad.addColorStop(0.6, '#042f2e');
      waterGrad.addColorStop(1, '#021e1d');
    }
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, height * 0.3, width, height * 0.7);

    // Dynamic Water Flow Waves / Speed Lines
    ctx.strokeStyle = isTurbo ? 'rgba(254, 240, 138, 0.4)' : 'rgba(167, 243, 208, 0.15)';
    ctx.lineWidth = isTurbo ? 2.5 : 1.5;
    const waveScroll = (this.boatDistance * (isTurbo ? 38 : 24)) % 60;
    for (let y = height * 0.32; y < height; y += 28) {
      const currentY = y - waveScroll;
      if (currentY < height * 0.3) continue;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.bezierCurveTo(width * 0.3, currentY + 4, width * 0.7, currentY - 4, width, currentY);
      ctx.stroke();
    }

    // Riverbanks (Lush Green with Coconut Palms & Cheering Spectators & Pulikali Dancers)
    this.renderRiverBank(ctx, 0, 0.15 * width, height, 'left');
    this.renderRiverBank(ctx, width * 0.85, 0.15 * width, height, 'right');
  }

  private renderRiverBank(ctx: CanvasRenderingContext2D, x: number, w: number, height: number, side: 'left' | 'right') {
    ctx.fillStyle = '#065f46'; // Lush Kerala paddy green bank
    ctx.fillRect(x, height * 0.28, w, height * 0.72);

    // Bank edge highlight
    ctx.fillStyle = '#78350f';
    const edgeX = side === 'left' ? x + w - 4 : x;
    ctx.fillRect(edgeX, height * 0.28, 4, height * 0.72);

    // Cheering spectators & Pulikali Tiger Dancers on riverbank
    const crowdScroll = (this.boatDistance * 12) % 80;
    for (let y = height * 0.35; y < height; y += 45) {
      const cy = y - crowdScroll;
      if (cy < height * 0.3) continue;
      const cx = side === 'left' ? x + w - 14 : x + 14;

      const isTiger = Math.sin(y) > 0.4;
      if (isTiger) {
        // Pulikali Tiger Dancer (Yellow-black striped painted face)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy + Math.sin(this.animTick * 0.2 + y) * 3, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(cx - 2, cy + 2, 4, 3);
      } else {
        // Traditional Spectator in Kasavu Shawl
        ctx.fillStyle = '#faf8f2';
        ctx.beginPath();
        ctx.arc(cx, cy + Math.sin(this.animTick * 0.15 + y) * 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 3, cy + 4, 6, 8);
      }
    }
  }

  private renderPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Trunk
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, -25, 4, -55);
    ctx.stroke();

    // Palm Fronds
    ctx.fillStyle = '#064e3b';
    for (let a = 0; a < 6; a++) {
      const angle = (a * Math.PI) / 3 - Math.PI / 2;
      ctx.save();
      ctx.translate(4, -55);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(14, 0, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  private renderHazards(ctx: CanvasRenderingContext2D, width: number, height: number) {
    for (const h of this.hazards) {
      if (h.collected) continue;
      const distFromBoat = h.y - this.boatDistance;
      const screenY = height * 0.68 - distFromBoat * 8;

      if (screenY < -40 || screenY > height + 40) continue;
      const screenX = width * h.x;

      ctx.save();
      ctx.translate(screenX, screenY);

      if (h.type === 'payasam') {
        // 🍯 Golden Payasam Uruli Power-up
        const floatAnim = Math.sin(this.animTick * 0.15 + h.id) * 3;
        ctx.translate(0, floatAnim);

        // Radiant glow
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
        glow.addColorStop(0.7, 'rgba(245, 158, 11, 0.4)');
        glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        // Brass Uruli Bowl
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, 4, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a'; // Sweet rich payasam
        ctx.beginPath();
        ctx.ellipse(0, 2, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.font = '700 8px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TURBO', 0, -10);
      } else if (h.type === 'shankh') {
        // 🐚 Sacred Conch Power-up (Invincibility Shield)
        const floatAnim = Math.sin(this.animTick * 0.12 + h.id) * 3;
        ctx.translate(0, floatAnim);

        // Blue Divine Glow
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
        glow.addColorStop(0, 'rgba(125, 211, 252, 0.8)');
        glow.addColorStop(0.7, 'rgba(14, 165, 233, 0.3)');
        glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // White Pearl Shankh
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 14, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(-2, 4, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'lotus_gold') {
        // 🌸 Sacred Golden Lotus Power-up
        const floatAnim = Math.sin(this.animTick * 0.18 + h.id) * 3;
        ctx.translate(0, floatAnim);

        ctx.fillStyle = '#f43f5e';
        for (let p = 0; p < 8; p++) {
          const ang = (p * Math.PI * 2) / 8;
          ctx.beginPath();
          ctx.ellipse(Math.cos(ang) * 8, Math.sin(ang) * 8, 6, 3, ang, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'lily') {
        // Floating Lotus Water Lily Patch
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pink lotus blossom
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(0, -2, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'log') {
        // Floating River Wooden Log
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.roundRect(-22, -6, 44, 12, 4);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-18, -4, 36, 4);
      } else if (h.type === 'whirlpool') {
        // Swirling Water Current / Eddy
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const rot = this.animTick * 0.08;
        ctx.arc(0, 0, 16, rot, rot + 4.5);
        ctx.stroke();
      } else if (h.type === 'rival_boat') {
        // Rival Racing Small Vallam
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-6, -10, 12, 20);
      }

      ctx.restore();
    }
  }

  private renderChundanVallam(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    const isTurbo = this.turboTimer > 0;
    const isInvincible = this.invincibilityTimer > 0;

    // Divine Invincibility Shield Aura
    if (isInvincible) {
      const shieldGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 80);
      shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      shieldGrad.addColorStop(0.8, 'rgba(14, 165, 233, 0.2)');
      shieldGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 50, 110, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Oarsmen synchronized rowing animation angle
    const oarAngle = Math.sin(this.rowPhase * Math.PI * 2) * (isTurbo ? 0.7 : 0.45);

    // --- Boat Wake / Foamy Water ---
    ctx.fillStyle = isTurbo ? 'rgba(254, 240, 138, 0.5)' : 'rgba(224, 242, 254, 0.35)';
    ctx.beginPath();
    ctx.moveTo(-16, 50);
    ctx.lineTo(0, isTurbo ? 110 : 85);
    ctx.lineTo(16, 50);
    ctx.closePath();
    ctx.fill();

    // --- Chundan Vallam Hull ---
    ctx.fillStyle = isTurbo ? '#451a03' : '#261205';
    ctx.beginPath();
    ctx.moveTo(0, -95); // Raised sharp prow (Kuthira)
    ctx.bezierCurveTo(18, -40, 20, 30, 12, 75); // Right side
    ctx.bezierCurveTo(8, 90, 4, 105, 0, 115); // Stern
    ctx.bezierCurveTo(-4, 105, -8, 90, -12, 75); // Left side
    ctx.bezierCurveTo(-20, 30, -18, -40, 0, -95); // Prow
    ctx.closePath();
    ctx.fill();

    // Hull Gold Trim & Inlay
    ctx.strokeStyle = isTurbo ? '#fef08a' : '#f59e0b';
    ctx.lineWidth = isTurbo ? 2.5 : 1.8;
    ctx.stroke();

    // --- High Curved Stern (Amaram) ---
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-5, 75);
    ctx.lineTo(5, 75);
    ctx.lineTo(3, 115);
    ctx.lineTo(-3, 115);
    ctx.closePath();
    ctx.fill();

    // Gold Finial on Amaram
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 118, 4, 0, Math.PI * 2);
    ctx.fill();

    // --- Oarsmen Rows ---
    const rowerRows = 6;
    for (let r = 0; r < rowerRows; r++) {
      const ry = -40 + r * 18;

      // Left Oarsman
      ctx.fillStyle = isTurbo ? '#f59e0b' : '#d97736';
      ctx.beginPath();
      ctx.arc(-8, ry, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Left Oar
      ctx.save();
      ctx.translate(-8, ry);
      ctx.rotate(-0.8 + oarAngle);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-22, -1.5, 22, 3);
      ctx.restore();

      // Right Oarsman
      ctx.fillStyle = isTurbo ? '#f59e0b' : '#d97736';
      ctx.beginPath();
      ctx.arc(8, ry, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Right Oar
      ctx.save();
      ctx.translate(8, ry);
      ctx.rotate(0.8 - oarAngle);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(0, -1.5, 22, 3);
      ctx.restore();
    }

    // --- King Mahabali ---
    MahabaliRenderer.draw(ctx, 0, -50, 0.72, 'row', this.animTick);

    ctx.restore();
  }

  private renderRhythmHUD(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const hudY = height - 70;
    const centerX = width / 2;
    const isTurbo = this.turboTimer > 0;

    // Rhythmic Beat Target Circle
    ctx.save();
    ctx.translate(centerX, hudY);

    // Outer Target Pulse Ring
    ctx.strokeStyle = isTurbo ? 'rgba(254, 240, 138, 0.9)' : `rgba(245, 158, 11, ${0.3 + (this.syncMeter / 100) * 0.5})`;
    ctx.lineWidth = isTurbo ? 4 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, 32 * this.rhythmRingScale, 0, Math.PI * 2);
    ctx.stroke();

    // Center Golden Drum Pad Button
    const padGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 30);
    if (isTurbo) {
      padGrad.addColorStop(0, '#ffffff');
      padGrad.addColorStop(0.7, '#f59e0b');
      padGrad.addColorStop(1, '#b45309');
    } else {
      padGrad.addColorStop(0, '#fef08a');
      padGrad.addColorStop(0.7, '#d97706');
      padGrad.addColorStop(1, '#78350f');
    }
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Drum label
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 10px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText(isTurbo ? 'TURBO!' : 'ROW', 0, 4);

    // Combo Streak Indicator
    if (this.comboStreak >= 2) {
      ctx.fillStyle = '#fef08a';
      ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`${this.comboStreak}x STREAK`, 0, -34);
    }

    ctx.restore();

    // Sync Meter Gauge Bar
    const meterWidth = 140;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(centerX - meterWidth / 2, hudY + 34, meterWidth, 8, 4);
    ctx.fill();

    const syncColor = isTurbo ? '#facc15' : this.syncMeter > 75 ? '#10b981' : this.syncMeter > 40 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = syncColor;
    ctx.beginPath();
    ctx.roundRect(centerX - meterWidth / 2, hudY + 34, meterWidth * (this.syncMeter / 100), 8, 4);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SYNC: ${Math.round(this.syncMeter)}%`, centerX, hudY + 54);
    ctx.textAlign = 'left';
  }

  private renderTopHUD(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const progress = Math.min(1, this.boatDistance / this.targetDistance);
    const isUrgentTimer = this.remainingTime <= 10;
    const currentPoints = Math.round(
      Math.min(1, this.boatDistance / this.targetDistance) * 600 + this.bonusPoints + this.perfectRows * 25
    );

    // Top Header Bar
    ctx.fillStyle = 'rgba(14, 6, 3, 0.85)';
    ctx.fillRect(0, 0, width, 52);

    // Live POINTS On Screen (Left)
    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 10px Cinzel, serif';
    ctx.fillText('SCORE', 16, 18);

    ctx.fillStyle = '#fef08a';
    ctx.font = '800 16px Cinzel, serif';
    ctx.fillText(`${currentPoints.toLocaleString()} PTS`, 16, 36);

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

    // Distance Track & Meters (Right)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 10px Cinzel, serif';
    ctx.textAlign = 'right';
    ctx.fillText(`SPEED: ${Math.round(this.boatSpeed * 10)} KT`, width - 16, 18);

    ctx.fillStyle = '#fef08a';
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`${Math.round(this.boatDistance)}m / ${this.targetDistance}m`, width - 16, 34);
    ctx.textAlign = 'left';

    // Thin bottom progress bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, 50, width, 2.5);

    ctx.fillStyle = this.turboTimer > 0 ? '#facc15' : isUrgentTimer ? '#ef4444' : '#10b981';
    ctx.fillRect(0, 50, width * progress, 2.5);
  }

  private renderCompletionBanner(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = 'rgba(10, 5, 2, 0.88)';
    ctx.fillRect(0, height * 0.42 - 55, width, 110);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 14px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SECOND STEP COMPLETE', width / 2, height * 0.42 - 14);

    ctx.fillStyle = '#fef08a';
    ctx.font = '700 22px Philosopher, serif';
    ctx.fillText('The Waters Unite', width / 2, height * 0.42 + 16);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 12px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`Max Combo: ${this.maxCombo}x  •  Bonus Points: +${this.bonusPoints}`, width / 2, height * 0.42 + 38);
    ctx.textAlign = 'left';
  }
}


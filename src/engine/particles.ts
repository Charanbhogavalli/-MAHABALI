export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  type: 'petal' | 'spark' | 'water' | 'steam' | 'confetti';
  shape?: 'circle' | 'petal' | 'ribbon';
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public emitPetals(x: number, y: number, count: number = 8, color: string = '#f59e0b') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 5 + Math.random() * 6,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 45 + Math.random() * 30,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        type: 'petal',
        shape: 'petal',
      });
    }
  }

  public emitSparks(x: number, y: number, count: number = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1 - Math.random() * 2,
        size: 2 + Math.random() * 2.5,
        color: Math.random() > 0.3 ? '#fbbf24' : '#fef08a',
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 25,
        rotation: 0,
        vRot: 0,
        type: 'spark',
        shape: 'circle',
      });
    }
  }

  public emitWaterSpray(x: number, y: number, vxDir: number = 0, count: number = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 4,
        vx: vxDir + (Math.random() - 0.5) * 2,
        vy: -0.5 - Math.random() * 2,
        size: 3 + Math.random() * 4,
        color: '#e0f2fe',
        alpha: 0.8,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        rotation: 0,
        vRot: 0,
        type: 'water',
        shape: 'circle',
      });
    }
  }

  public emitCelebration(width: number, height: number, count: number = 30) {
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#fbbf24', '#ec4899', '#f8fafc'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: height + 10,
        vx: (Math.random() - 0.5) * 4,
        vy: -4 - Math.random() * 7,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 70 + Math.random() * 50,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        type: 'confetti',
        shape: Math.random() > 0.5 ? 'petal' : 'ribbon',
      });
    }
  }

  public emitSonicWave(x: number, y: number, color: string = '#f59e0b') {
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const speed = 4.5 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        rotation: angle,
        vRot: 0.1,
        life: 0,
        maxLife: 28,
        type: 'spark',
        shape: 'circle',
      });
    }
  }

  public emitTurboTrail(x: number, y: number) {
    const colors = ['#fef08a', '#f59e0b', '#ef4444', '#38bdf8'];
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + Math.random() * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: 3 + Math.random() * 4,
        size: 2.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.9,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        life: 0,
        maxLife: 22,
        type: 'spark',
        shape: 'circle',
      });
    }
  }

  public emitPayasamGlow(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 3,
        color: '#fef08a',
        alpha: 1,
        rotation: 0,
        vRot: 0,
        life: 0,
        maxLife: 35,
        type: 'spark',
        shape: 'circle',
      });
    }
  }

  public update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (p.type === 'petal') {
        p.vy += 0.04; // Gentle gravity
        p.vx *= 0.98; // Air drag
      } else if (p.type === 'spark') {
        p.vy *= 0.97;
        p.size *= 0.96;
      } else if (p.type === 'water') {
        p.vy += 0.12;
      } else if (p.type === 'confetti') {
        p.vy += 0.08;
      }

      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'petal') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.shape === 'ribbon') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  public clear() {
    this.particles = [];
  }
}

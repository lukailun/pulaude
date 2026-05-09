export type State =
  | 'IDLE'
  | 'THINKING'
  | 'READING'
  | 'WRITING'
  | 'EXECUTING'
  | 'WORKING'
  | 'COMPLETE'
  | 'ERROR'
  | 'APPROVAL';

interface VisualConfig {
  orbColor: string;
  glowColor: string;
  glowRadius: number;
  particleCount: number;
  particleSpeed: number;
  pulseFreq: number;
  pulseAmp: number;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
}

const STATE_VISUALS: Record<State, VisualConfig> = {
  IDLE: {
    orbColor: '#2d3a8c',
    glowColor: '#4a5acf',
    glowRadius: 60,
    particleCount: 30,
    particleSpeed: 0.003,
    pulseFreq: 0.01,
    pulseAmp: 5,
  },
  THINKING: {
    orbColor: '#6c5ce7',
    glowColor: '#a29bfe',
    glowRadius: 80,
    particleCount: 120,
    particleSpeed: 0.015,
    pulseFreq: 0.04,
    pulseAmp: 12,
  },
  READING: {
    orbColor: '#00cec9',
    glowColor: '#81ecec',
    glowRadius: 70,
    particleCount: 60,
    particleSpeed: 0.008,
    pulseFreq: 0.02,
    pulseAmp: 8,
  },
  WRITING: {
    orbColor: '#00b894',
    glowColor: '#55efc4',
    glowRadius: 90,
    particleCount: 80,
    particleSpeed: 0.006,
    pulseFreq: 0.03,
    pulseAmp: 10,
  },
  EXECUTING: {
    orbColor: '#fdcb6e',
    glowColor: '#ffeaa7',
    glowRadius: 100,
    particleCount: 150,
    particleSpeed: 0.025,
    pulseFreq: 0.06,
    pulseAmp: 18,
  },
  WORKING: {
    orbColor: '#a29bfe',
    glowColor: '#c8d6e5',
    glowRadius: 75,
    particleCount: 50,
    particleSpeed: 0.005,
    pulseFreq: 0.02,
    pulseAmp: 6,
  },
  COMPLETE: {
    orbColor: '#00b894',
    glowColor: '#55efc4',
    glowRadius: 120,
    particleCount: 200,
    particleSpeed: 0.03,
    pulseFreq: 0.02,
    pulseAmp: 5,
  },
  ERROR: {
    orbColor: '#d63031',
    glowColor: '#ff7675',
    glowRadius: 90,
    particleCount: 100,
    particleSpeed: 0.04,
    pulseFreq: 0.1,
    pulseAmp: 25,
  },
  APPROVAL: {
    orbColor: '#b2bec3',
    glowColor: '#dfe6e9',
    glowRadius: 70,
    particleCount: 40,
    particleSpeed: 0.004,
    pulseFreq: 0.015,
    pulseAmp: 8,
  },
};

export class ClaudeEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private state: State = 'IDLE';
  private targetState: State = 'IDLE';
  private time = 0;
  private animFrame = 0;
  private currentConfig: VisualConfig;
  private targetConfig: VisualConfig;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.currentConfig = { ...STATE_VISUALS.IDLE };
    this.targetConfig = { ...STATE_VISUALS.IDLE };
    this.resize();
    this.initParticles(STATE_VISUALS.IDLE.particleCount);
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private initParticles(count: number) {
    this.particles = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 50 + Math.random() * 150,
      speed: 0,
      size: 1 + Math.random() * 3,
      alpha: 0.2 + Math.random() * 0.8,
    }));
  }

  transitionTo(state: State) {
    this.targetState = state;
    this.targetConfig = { ...STATE_VISUALS[state] };
    // 粒子数量变化时补充或减少
    const diff = this.targetConfig.particleCount - this.particles.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        this.particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: 50 + Math.random() * 150,
          speed: 0,
          size: 1 + Math.random() * 3,
          alpha: 0,
        });
      }
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.min(t, 1);
  }

  private lerpColor(a: string, b: string, t: number): string {
    const parse = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const [ar, ag, ab] = parse(a);
    const [br, bg, bb] = parse(b);
    const r = Math.round(this.lerp(ar, br, t));
    const g = Math.round(this.lerp(ag, bg, t));
    const bl = Math.round(this.lerp(ab, bb, t));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
  }

  private update(dt: number) {
    this.time += dt;
    const transitionSpeed = 0.02;

    // 平滑过渡配置
    this.currentConfig.orbColor = this.lerpColor(this.currentConfig.orbColor, this.targetConfig.orbColor, transitionSpeed);
    this.currentConfig.glowColor = this.lerpColor(this.currentConfig.glowColor, this.targetConfig.glowColor, transitionSpeed);
    this.currentConfig.glowRadius = this.lerp(this.currentConfig.glowRadius, this.targetConfig.glowRadius, transitionSpeed);
    this.currentConfig.particleSpeed = this.lerp(this.currentConfig.particleSpeed, this.targetConfig.particleSpeed, transitionSpeed);
    this.currentConfig.pulseFreq = this.lerp(this.currentConfig.pulseFreq, this.targetConfig.pulseFreq, transitionSpeed);
    this.currentConfig.pulseAmp = this.lerp(this.currentConfig.pulseAmp, this.targetConfig.pulseAmp, transitionSpeed);

    // 更新粒子
    for (const p of this.particles) {
      p.speed = this.lerp(p.speed, this.currentConfig.particleSpeed, 0.05);
      p.angle += p.speed;
      p.alpha = this.lerp(p.alpha, 0.2 + Math.random() * 0.8, 0.01);
    }
  }

  private render() {
    const { ctx, canvas } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const config = this.currentConfig;

    // 清屏
    ctx.clearRect(0, 0, w, h);

    // 背景
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // 呼吸脉冲
    const pulse = Math.sin(this.time * config.pulseFreq) * config.pulseAmp;
    const radius = config.glowRadius + pulse;

    // 外层光晕
    const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 3);
    outerGlow.addColorStop(0, config.glowColor + '30');
    outerGlow.addColorStop(0.5, config.glowColor + '10');
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, w, h);

    // 粒子
    for (const p of this.particles) {
      const px = cx + Math.cos(p.angle) * p.radius;
      const py = cy + Math.sin(p.angle) * p.radius;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
      ctx.fill();
    }

    // 核心球体
    const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.2, config.orbColor);
    orbGrad.addColorStop(0.8, config.orbColor + '80');
    orbGrad.addColorStop(1, config.orbColor + '00');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = orbGrad;
    ctx.fill();

    // 核心高光
    const highlight = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius * 0.5);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlight.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.fill();
  }

  start() {
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      this.update(dt);
      this.render();
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.animFrame);
  }
}

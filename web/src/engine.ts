export type State =
  | 'IDLE'
  | 'THINKING'
  | 'READING'
  | 'WRITING'
  | 'EXECUTING'
  | 'WORKING'
  | 'COMPLETE'
  | 'ERROR'
  | 'APPROVAL'
  | 'DISCONNECTED';

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface VisualConfig {
  colors: [ColorRGB, ColorRGB, ColorRGB];
  orbIntensity: number;
  flowSpeed: number;
  noiseScale: number;
  brightness: number;
  particleDensity: number;
}

function hex(hex: string): ColorRGB {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

const STATE_VISUALS: Record<State, VisualConfig> = {
  IDLE: {
    colors: [hex('#1a1a4e'), hex('#2d3a8c'), hex('#0d0d3a')],
    orbIntensity: 0.3,
    flowSpeed: 0.12,
    noiseScale: 0.7,
    brightness: 0.2,
    particleDensity: 0.3,
  },
  THINKING: {
    colors: [hex('#6c5ce7'), hex('#a29bfe'), hex('#3d2b9e')],
    orbIntensity: 0.7,
    flowSpeed: 0.25,
    noiseScale: 0.8,
    brightness: 0.45,
    particleDensity: 0.7,
  },
  READING: {
    colors: [hex('#00cec9'), hex('#81ecec'), hex('#007a78')],
    orbIntensity: 0.5,
    flowSpeed: 0.2,
    noiseScale: 0.75,
    brightness: 0.4,
    particleDensity: 0.5,
  },
  WRITING: {
    colors: [hex('#00b894'), hex('#55efc4'), hex('#006b54')],
    orbIntensity: 0.6,
    flowSpeed: 0.22,
    noiseScale: 0.75,
    brightness: 0.42,
    particleDensity: 0.6,
  },
  EXECUTING: {
    colors: [hex('#fdcb6e'), hex('#ffeaa7'), hex('#c4941a')],
    orbIntensity: 0.9,
    flowSpeed: 0.35,
    noiseScale: 0.85,
    brightness: 0.55,
    particleDensity: 0.9,
  },
  WORKING: {
    colors: [hex('#a29bfe'), hex('#c8d6e5'), hex('#6c5ce7')],
    orbIntensity: 0.4,
    flowSpeed: 0.15,
    noiseScale: 0.7,
    brightness: 0.35,
    particleDensity: 0.4,
  },
  COMPLETE: {
    colors: [hex('#00b894'), hex('#55efc4'), hex('#00cec9')],
    orbIntensity: 0.8,
    flowSpeed: 0.3,
    noiseScale: 0.8,
    brightness: 0.5,
    particleDensity: 1.0,
  },
  ERROR: {
    colors: [hex('#d63031'), hex('#ff7675'), hex('#8b1a1a')],
    orbIntensity: 1.0,
    flowSpeed: 0.4,
    noiseScale: 0.9,
    brightness: 0.5,
    particleDensity: 0.8,
  },
  APPROVAL: {
    colors: [hex('#636e72'), hex('#b2bec3'), hex('#2d3436')],
    orbIntensity: 0.35,
    flowSpeed: 0.1,
    noiseScale: 0.65,
    brightness: 0.25,
    particleDensity: 0.3,
  },
  DISCONNECTED: {
    colors: [hex('#2d3436'), hex('#636e72'), hex('#1a1c1e')],
    orbIntensity: 0.15,
    flowSpeed: 0.06,
    noiseScale: 0.6,
    brightness: 0.12,
    particleDensity: 0.15,
  },
};

// --- Shaders ---

const VERT_SRC = `#version 100
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 100
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

// 3 fluid color control points
uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;

uniform float u_orbIntensity;
uniform float u_flowSpeed;
uniform float u_noiseScale;
uniform float u_brightness;
uniform float u_particleDensity;

// Simplex noise helpers
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = uv;
  p.x *= aspect;

  float t = u_time * u_flowSpeed;

  // Flowing noise field for color region selection
  float flow = fbm(p * u_noiseScale * 0.7 + vec2(t * 0.4, t * 0.15));
  flow = flow * 0.5 + 0.5;

  // Secondary noise for organic distortion
  float warp = fbm(p * u_noiseScale * 1.2 + vec2(-t * 0.25, t * 0.3) + 4.0);
  flow = flow + warp * 0.15;
  flow = clamp(flow, 0.0, 1.0);

  // Three soft color bands with distinct regions
  float w0 = smoothstep(0.0, 0.45, flow) * (1.0 - smoothstep(0.55, 1.0, flow));
  float w1 = smoothstep(0.25, 0.6, flow) * (1.0 - smoothstep(0.75, 1.0, flow));
  float w2 = smoothstep(0.5, 0.85, flow) * (1.0 - smoothstep(0.0, 0.15, flow));

  // Normalize weights so one color dominates per region
  float totalW = w0 + w1 + w2 + 0.001;
  vec3 fluidColor = (u_color0 * w0 + u_color1 * w1 + u_color2 * w2) / totalW;

  // Brightness variation based on flow
  fluidColor *= u_brightness + flow * 0.25;

  // Central orb glow
  vec2 center = vec2(0.5 * aspect, 0.5);
  float dist = length(p - center);
  float orbRadius = 0.25 + 0.03 * sin(u_time * 0.8);
  float orb = exp(-dist * dist / (orbRadius * orbRadius));
  float orbGlow = exp(-dist * dist / (orbRadius * orbRadius * 4.0));

  // Orb color: bright version of the primary state color
  vec3 orbColor = u_color0 * 1.5 + vec3(0.3);
  fluidColor += orbColor * orb * u_orbIntensity;
  fluidColor += orbColor * orbGlow * u_orbIntensity * 0.3;

  // Sparkle / particle effect
  float sparkle = snoise(p * 40.0 + u_time * 2.0);
  sparkle = smoothstep(0.6, 1.0, sparkle) * u_particleDensity;
  fluidColor += vec3(sparkle * 0.3);

  // Vignette
  float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5) * 1.4);
  fluidColor *= vignette;

  // Tone mapping (simple Reinhard)
  fluidColor = fluidColor / (fluidColor + vec3(1.0));

  gl_FragColor = vec4(fluidColor, 1.0);
}`;

// --- Helpers ---

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(t, 1);
}

function lerpColor(a: ColorRGB, b: ColorRGB, t: number): ColorRGB {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  };
}

function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vert: WebGLShader, frag: WebGLShader): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
  }
  return program;
}

// --- Engine ---

export class ClaudeEngine {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private uniforms: Record<string, WebGLUniformLocation> = {};
  private currentConfig: VisualConfig;
  private targetConfig: VisualConfig;
  private time = 0;
  private animFrame = 0;
  private startTime: number;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    // Compile shaders
    const vert = createShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    this.program = createProgram(gl, vert, frag);
    gl.useProgram(this.program);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(this.program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Cache uniform locations
    const names = [
      'u_resolution', 'u_time',
      'u_color0', 'u_color1', 'u_color2',
      'u_orbIntensity', 'u_flowSpeed', 'u_noiseScale',
      'u_brightness', 'u_particleDensity',
    ];
    for (const name of names) {
      const loc = gl.getUniformLocation(this.program, name);
      if (loc) this.uniforms[name] = loc;
    }

    this.currentConfig = { ...STATE_VISUALS.IDLE, colors: [...STATE_VISUALS.IDLE.colors] };
    this.targetConfig = { ...STATE_VISUALS.IDLE, colors: [...STATE_VISUALS.IDLE.colors] };
    this.startTime = performance.now() / 1000;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth * dpr;
    const h = window.innerHeight * dpr;
    this.gl.canvas.width = w;
    this.gl.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
  }

  transitionTo(state: State) {
    this.targetConfig = { ...STATE_VISUALS[state], colors: [...STATE_VISUALS[state].colors] };
  }

  private update(dt: number) {
    this.time += dt;
    const t = 0.015;

    // Smooth color transitions
    for (let i = 0; i < 3; i++) {
      this.currentConfig.colors[i] = lerpColor(this.currentConfig.colors[i], this.targetConfig.colors[i], t);
    }
    this.currentConfig.orbIntensity = lerp(this.currentConfig.orbIntensity, this.targetConfig.orbIntensity, t);
    this.currentConfig.flowSpeed = lerp(this.currentConfig.flowSpeed, this.targetConfig.flowSpeed, t);
    this.currentConfig.noiseScale = lerp(this.currentConfig.noiseScale, this.targetConfig.noiseScale, t);
    this.currentConfig.brightness = lerp(this.currentConfig.brightness, this.targetConfig.brightness, t);
    this.currentConfig.particleDensity = lerp(this.currentConfig.particleDensity, this.targetConfig.particleDensity, t);
  }

  private render() {
    const { gl, uniforms, currentConfig: c } = this;
    const w = gl.canvas.width;
    const h = gl.canvas.height;

    gl.uniform2f(uniforms.u_resolution, w, h);
    gl.uniform1f(uniforms.u_time, performance.now() / 1000 - this.startTime);

    gl.uniform3f(uniforms.u_color0, c.colors[0].r, c.colors[0].g, c.colors[0].b);
    gl.uniform3f(uniforms.u_color1, c.colors[1].r, c.colors[1].g, c.colors[1].b);
    gl.uniform3f(uniforms.u_color2, c.colors[2].r, c.colors[2].g, c.colors[2].b);

    gl.uniform1f(uniforms.u_orbIntensity, c.orbIntensity);
    gl.uniform1f(uniforms.u_flowSpeed, c.flowSpeed);
    gl.uniform1f(uniforms.u_noiseScale, c.noiseScale);
    gl.uniform1f(uniforms.u_brightness, c.brightness);
    gl.uniform1f(uniforms.u_particleDensity, c.particleDensity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  start() {
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
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

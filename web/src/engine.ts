export type BuddyState =
  | 'idle'
  | 'busy'
  | 'attention'
  | 'celebrate'
  | 'error'
  | 'sleep'
  | 'love';

const STATE_MODE: Record<BuddyState, number> = {
  idle: 0,
  busy: 1,
  attention: 2,
  celebrate: 3,
  error: 4,
  sleep: 5,
  love: 6,
};

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface VisualConfig {
  colors: [ColorRGB, ColorRGB, ColorRGB];
  mode: number;
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

const STATE_VISUALS: Record<BuddyState, VisualConfig> = {
  idle: {
    colors: [hex('#6B7280'), hex('#4B5563'), hex('#374151')],
    mode: 0,
    orbIntensity: 0.3,
    flowSpeed: 0.12,
    noiseScale: 0.7,
    brightness: 0.15,
    particleDensity: 0.2,
  },
  busy: {
    colors: [hex('#60A5FA'), hex('#93C5FD'), hex('#2563EB')],
    mode: 1,
    orbIntensity: 0.45,
    flowSpeed: 0.18,
    noiseScale: 0.7,
    brightness: 0.35,
    particleDensity: 0.4,
  },
  attention: {
    colors: [hex('#EAB308'), hex('#FDE047'), hex('#A16207')],
    mode: 2,
    orbIntensity: 0.4,
    flowSpeed: 0.12,
    noiseScale: 0.65,
    brightness: 0.25,
    particleDensity: 0.3,
  },
  celebrate: {
    colors: [hex('#10B981'), hex('#34D399'), hex('#059669')],
    mode: 3,
    orbIntensity: 0.8,
    flowSpeed: 0.3,
    noiseScale: 0.8,
    brightness: 0.5,
    particleDensity: 1.0,
  },
  error: {
    colors: [hex('#EF4444'), hex('#F87171'), hex('#991B1B')],
    mode: 4,
    orbIntensity: 0.9,
    flowSpeed: 0.4,
    noiseScale: 0.9,
    brightness: 0.45,
    particleDensity: 0.7,
  },
  sleep: {
    colors: [hex('#6B7280'), hex('#4B5563'), hex('#1F2937')],
    mode: 5,
    orbIntensity: 0.1,
    flowSpeed: 0.04,
    noiseScale: 0.6,
    brightness: 0.08,
    particleDensity: 0.1,
  },
  love: {
    colors: [hex('#EC4899'), hex('#F472B6'), hex('#BE185D')],
    mode: 6,
    orbIntensity: 0.6,
    flowSpeed: 0.2,
    noiseScale: 0.75,
    brightness: 0.4,
    particleDensity: 0.5,
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
uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_mode;
uniform float u_orbIntensity;
uniform float u_flowSpeed;
uniform float u_noiseScale;
uniform float u_brightness;
uniform float u_particleDensity;

// --- Noise ---
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
  m = m * m; m = m * m;
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
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * snoise(p);
    p *= 2.0; a *= 0.5;
  }
  return v;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// --- Effect functions ---

// IDLE — gentle breathing noise field
vec3 effectIdle(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float flow = fbm(p * 0.6 + vec2(t * 0.08, t * 0.03));
  flow = flow * 0.5 + 0.5;
  vec3 col = mix(c0, c1, flow);
  col = mix(col, c2, smoothstep(0.6, 1.0, flow));
  float d = length(uv - 0.5);
  float orb = exp(-d * d * 8.0);
  float breath = 0.5 + 0.5 * sin(t * 2.0);
  col += c1 * orb * breath * 0.4;
  col *= 0.15 + flow * 0.12;
  return col;
}

// WORKING — generic flowing animation
vec3 effectWorking(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float flow = fbm(p * 0.8 + vec2(t * 0.15, t * 0.08));
  flow = flow * 0.5 + 0.5;
  vec3 col = mix(c0, c1, flow);
  float d = length(uv - 0.5);
  float orb = exp(-d * d * 10.0);
  float pulse = 0.5 + 0.5 * sin(t * 2.5);
  col += c2 * orb * pulse * 0.3;
  col *= 0.12 + flow * 0.1;
  return col;
}

// APPROVAL — warning pulse with caution stripes
vec3 effectApproval(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float stripe = sin((uv.x + uv.y) * 40.0 + t * 2.0);
  stripe = smoothstep(0.3, 0.5, stripe);
  float d = length(uv - 0.5);
  float glow = exp(-d * d * 6.0);
  float pulse = 0.5 + 0.5 * sin(t * 3.0);
  float excl = smoothstep(0.04, 0.02, abs(uv.x - 0.5));
  excl *= step(0.42, uv.y) * step(uv.y, 0.52);
  float dot_ = smoothstep(0.04, 0.02, length(uv - vec2(0.5, 0.38)));
  float warning = max(excl, dot_);
  vec3 col = c0 * stripe * 0.15;
  col += c1 * glow * pulse * 0.4;
  col += c2 * warning * pulse * 0.8;
  float n = fbm(p * 0.7 + t * 0.1) * 0.5 + 0.5;
  col += c0 * n * 0.05;
  return col;
}

// COMPLETE — burst / success explosion
vec3 effectComplete(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float d = length(uv - 0.5);
  float burst = abs(d - fract(t * 0.6) * 0.7);
  burst = smoothstep(0.03, 0.0, burst);
  vec2 dc = uv - 0.5;
  float check1 = abs(dc.x * 1.0 - dc.y * 0.5);
  float checkArm1 = smoothstep(0.04, 0.01, check1) * step(dc.x, 0.02) * step(-0.02, dc.y);
  float check2 = abs((dc.x - 0.04) * 0.4 - dc.y);
  float checkArm2 = smoothstep(0.04, 0.01, check2) * step(0.0, dc.x) * step(dc.y, 0.04);
  float check = max(checkArm1, checkArm2);
  check *= smoothstep(0.0, 0.3, fract(t * 0.5));
  float sparkle = snoise(p * 30.0 + t * 2.0);
  sparkle = smoothstep(0.65, 1.0, sparkle) * smoothstep(0.3, 0.8, fract(t * 0.4));
  float glow = exp(-d * d * 10.0);
  vec3 col = c0 * burst * 0.6;
  col += c1 * check * 0.8;
  col += c1 * sparkle * 0.4;
  col += c2 * glow * 0.5;
  return col;
}

// ERROR — screen shake, red ripples
vec3 effectError(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float shake = sin(t * 40.0) * 0.005 * exp(-fract(t * 0.5) * 3.0);
  vec2 suv = uv + vec2(shake, shake * 0.7);
  float d = length(suv - 0.5);
  float x1 = abs(suv.x - suv.y);
  float x2 = abs(suv.x + suv.y - 1.0);
  float xMark = smoothstep(0.04, 0.01, x1) + smoothstep(0.04, 0.01, x2);
  xMark = min(xMark, 1.0) * smoothstep(0.3, 0.15, d);
  float ripple = sin(d * 20.0 - t * 8.0) * exp(-d * 3.0);
  ripple = smoothstep(0.0, 0.4, ripple);
  float flash = exp(-fract(t * 0.5) * 5.0) * 0.3;
  vec3 col = c0 * xMark * 0.6;
  col += c1 * ripple * 0.3;
  col += c2 * flash;
  float n = fbm(p * 1.0 + t * 0.3) * 0.5 + 0.5;
  col += c0 * n * 0.06;
  return col;
}

// SLEEP — CRT power-off effect
vec3 effectSleep(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float cycleDuration = 3.0;
  float cycleT = mod(t * 0.3, cycleDuration);
  float progress = cycleT / cycleDuration;
  vec2 center = vec2(0.5, 0.5);
  vec2 d = uv - center;
  float verticalSqueeze;
  float horizontalSqueeze;
  if (progress < 0.4) {
    float phase = progress / 0.4;
    verticalSqueeze = 1.0 - phase * 0.98;
    horizontalSqueeze = 1.0;
  } else if (progress < 0.8) {
    float phase = (progress - 0.4) / 0.4;
    verticalSqueeze = 0.02;
    horizontalSqueeze = 1.0 - phase * 0.98;
  } else {
    float phase = (progress - 0.8) / 0.2;
    verticalSqueeze = 0.02 * (1.0 - phase);
    horizontalSqueeze = 0.02 * (1.0 - phase);
  }
  vec2 squeezed = vec2(d.x / max(horizontalSqueeze, 0.01), d.y / max(verticalSqueeze, 0.01));
  float distFromCenter = length(squeezed);
  float screenMask = smoothstep(0.5, 0.2, distFromCenter);
  float glow = exp(-distFromCenter * distFromCenter * 2.0);
  vec3 col = c0 * screenMask * 0.5;
  col += c1 * glow * 0.5;
  if (progress > 0.9) {
    float fadeOut = 1.0 - (progress - 0.9) / 0.1;
    col *= fadeOut;
  }
  return col;
}

// LOVE — floating hearts with gentle pulse
vec3 effectLove(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float flow = fbm(p * 0.5 + vec2(t * 0.06, t * 0.04));
  flow = flow * 0.5 + 0.5;
  vec3 col = mix(c0, c1, flow);
  float d = length(uv - 0.5);
  float orb = exp(-d * d * 10.0);
  float pulse = 0.5 + 0.5 * sin(t * 3.0);
  col += c2 * orb * pulse * 0.4;
  float sparkle = snoise(p * 20.0 + t * 1.5);
  sparkle = smoothstep(0.7, 1.0, sparkle);
  col += c1 * sparkle * 0.3 * pulse;
  col *= 0.15 + flow * 0.15;
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = uv;
  p.x *= aspect;

  float t = u_time * u_flowSpeed;
  float mode = u_mode;

  int m0 = int(floor(mode));
  int m1 = int(ceil(mode));
  float blend = fract(mode);

  vec3 c0 = u_color0;
  vec3 c1 = u_color1;
  vec3 c2 = u_color2;

  vec3 colA = vec3(0.0);
  vec3 colB = vec3(0.0);

  if      (m0 == 0) colA = effectIdle(uv, p, t, c0, c1, c2);
  else if (m0 == 1) colA = effectWorking(uv, p, t, c0, c1, c2);
  else if (m0 == 2) colA = effectApproval(uv, p, t, c0, c1, c2);
  else if (m0 == 3) colA = effectComplete(uv, p, t, c0, c1, c2);
  else if (m0 == 4) colA = effectError(uv, p, t, c0, c1, c2);
  else if (m0 == 5) colA = effectSleep(uv, p, t, c0, c1, c2);
  else if (m0 == 6) colA = effectLove(uv, p, t, c0, c1, c2);

  if (m1 == m0) {
    colB = colA;
  } else if (m1 == 0) colB = effectIdle(uv, p, t, c0, c1, c2);
  else if (m1 == 1) colB = effectWorking(uv, p, t, c0, c1, c2);
  else if (m1 == 2) colB = effectApproval(uv, p, t, c0, c1, c2);
  else if (m1 == 3) colB = effectComplete(uv, p, t, c0, c1, c2);
  else if (m1 == 4) colB = effectError(uv, p, t, c0, c1, c2);
  else if (m1 == 5) colB = effectSleep(uv, p, t, c0, c1, c2);
  else if (m1 == 6) colB = effectLove(uv, p, t, c0, c1, c2);

  vec3 col = mix(colA, colB, blend);

  float vignette = 1.0 - smoothstep(0.3, 1.3, length(uv - 0.5) * 1.4);
  col *= vignette;

  col = col / (col + vec3(1.0));

  gl_FragColor = vec4(col, 1.0);
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
  private currentMode = 0;
  private targetMode = 0;
  private time = 0;
  private animFrame = 0;
  private startTime: number;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    const vert = createShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    this.program = createProgram(gl, vert, frag);
    gl.useProgram(this.program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(this.program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const names = [
      'u_resolution', 'u_time', 'u_mode',
      'u_color0', 'u_color1', 'u_color2',
      'u_orbIntensity', 'u_flowSpeed', 'u_noiseScale',
      'u_brightness', 'u_particleDensity',
    ];
    for (const name of names) {
      const loc = gl.getUniformLocation(this.program, name);
      if (loc) this.uniforms[name] = loc;
    }

    this.currentConfig = { ...STATE_VISUALS.idle, colors: [...STATE_VISUALS.idle.colors] };
    this.targetConfig = { ...STATE_VISUALS.idle, colors: [...STATE_VISUALS.idle.colors] };
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

  transitionTo(state: BuddyState) {
    this.targetConfig = { ...STATE_VISUALS[state], colors: [...STATE_VISUALS[state].colors] };
    this.targetMode = STATE_MODE[state];
  }

  private update(dt: number) {
    this.time += dt;
    const t = 0.02;

    for (let i = 0; i < 3; i++) {
      this.currentConfig.colors[i] = lerpColor(this.currentConfig.colors[i], this.targetConfig.colors[i], t);
    }
    this.currentConfig.orbIntensity = lerp(this.currentConfig.orbIntensity, this.targetConfig.orbIntensity, t);
    this.currentConfig.flowSpeed = lerp(this.currentConfig.flowSpeed, this.targetConfig.flowSpeed, t);
    this.currentConfig.noiseScale = lerp(this.currentConfig.noiseScale, this.targetConfig.noiseScale, t);
    this.currentConfig.brightness = lerp(this.currentConfig.brightness, this.targetConfig.brightness, t);
    this.currentConfig.particleDensity = lerp(this.currentConfig.particleDensity, this.targetConfig.particleDensity, t);
    this.currentMode = lerp(this.currentMode, this.targetMode, t);
  }

  private render() {
    const { gl, uniforms, currentConfig: c } = this;
    const w = gl.canvas.width;
    const h = gl.canvas.height;

    gl.uniform2f(uniforms.u_resolution, w, h);
    gl.uniform1f(uniforms.u_time, performance.now() / 1000 - this.startTime);
    gl.uniform1f(uniforms.u_mode, this.currentMode);

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

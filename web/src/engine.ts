export type State =
  | 'IDLE'
  | 'INITIALIZING'
  | 'THINKING'
  | 'COMPACTING_CONTEXT'
  | 'READING'
  | 'WRITING'
  | 'EXECUTING'
  | 'APPROVAL'
  | 'WAITING_ELICITATION'
  | 'SUBAGENT_RUNNING'
  | 'TASK_MANAGEMENT'
  | 'COMPLETE'
  | 'TOOL_ERROR'
  | 'API_ERROR'
  | 'DISCONNECTED'
  | 'WORKING'
  | 'PERMISSION_DENIED';

const STATE_MODE: Record<State, number> = {
  IDLE: 0,
  INITIALIZING: 1,
  THINKING: 2,
  COMPACTING_CONTEXT: 3,
  READING: 4,
  WRITING: 5,
  EXECUTING: 6,
  APPROVAL: 7,
  WAITING_ELICITATION: 8,
  SUBAGENT_RUNNING: 9,
  TASK_MANAGEMENT: 10,
  COMPLETE: 11,
  TOOL_ERROR: 12,
  API_ERROR: 13,
  DISCONNECTED: 14,
  WORKING: 15,
  PERMISSION_DENIED: 16,
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

const STATE_VISUALS: Record<State, VisualConfig> = {
  IDLE: {
    colors: [hex('#6B7280'), hex('#4B5563'), hex('#374151')],
    mode: 0,
    orbIntensity: 0.3,
    flowSpeed: 0.12,
    noiseScale: 0.7,
    brightness: 0.15,
    particleDensity: 0.2,
  },
  INITIALIZING: {
    colors: [hex('#3B82F6'), hex('#60A5FA'), hex('#1D4ED8')],
    mode: 1,
    orbIntensity: 0.6,
    flowSpeed: 0.25,
    noiseScale: 0.75,
    brightness: 0.35,
    particleDensity: 0.5,
  },
  THINKING: {
    colors: [hex('#3B82F6'), hex('#60A5FA'), hex('#1E40AF')],
    mode: 2,
    orbIntensity: 0.7,
    flowSpeed: 0.25,
    noiseScale: 0.8,
    brightness: 0.4,
    particleDensity: 0.6,
  },
  COMPACTING_CONTEXT: {
    colors: [hex('#8B5CF6'), hex('#A78BFA'), hex('#6D28D9')],
    mode: 3,
    orbIntensity: 0.5,
    flowSpeed: 0.2,
    noiseScale: 0.7,
    brightness: 0.35,
    particleDensity: 0.4,
  },
  READING: {
    colors: [hex('#10B981'), hex('#34D399'), hex('#059669')],
    mode: 4,
    orbIntensity: 0.5,
    flowSpeed: 0.2,
    noiseScale: 0.75,
    brightness: 0.35,
    particleDensity: 0.5,
  },
  WRITING: {
    colors: [hex('#F59E0B'), hex('#FBBF24'), hex('#D97706')],
    mode: 5,
    orbIntensity: 0.6,
    flowSpeed: 0.22,
    noiseScale: 0.75,
    brightness: 0.38,
    particleDensity: 0.5,
  },
  EXECUTING: {
    colors: [hex('#EF4444'), hex('#F87171'), hex('#B91C1C')],
    mode: 6,
    orbIntensity: 0.8,
    flowSpeed: 0.35,
    noiseScale: 0.85,
    brightness: 0.45,
    particleDensity: 0.8,
  },
  APPROVAL: {
    colors: [hex('#EAB308'), hex('#FDE047'), hex('#A16207')],
    mode: 7,
    orbIntensity: 0.4,
    flowSpeed: 0.12,
    noiseScale: 0.65,
    brightness: 0.25,
    particleDensity: 0.3,
  },
  WAITING_ELICITATION: {
    colors: [hex('#06B6D4'), hex('#22D3EE'), hex('#0891B2')],
    mode: 8,
    orbIntensity: 0.45,
    flowSpeed: 0.18,
    noiseScale: 0.7,
    brightness: 0.35,
    particleDensity: 0.4,
  },
  SUBAGENT_RUNNING: {
    colors: [hex('#6366F1'), hex('#818CF8'), hex('#4338CA')],
    mode: 9,
    orbIntensity: 0.6,
    flowSpeed: 0.25,
    noiseScale: 0.8,
    brightness: 0.4,
    particleDensity: 0.7,
  },
  TASK_MANAGEMENT: {
    colors: [hex('#3B82F6'), hex('#60A5FA'), hex('#1D4ED8')],
    mode: 10,
    orbIntensity: 0.5,
    flowSpeed: 0.18,
    noiseScale: 0.7,
    brightness: 0.35,
    particleDensity: 0.5,
  },
  COMPLETE: {
    colors: [hex('#10B981'), hex('#34D399'), hex('#059669')],
    mode: 11,
    orbIntensity: 0.8,
    flowSpeed: 0.3,
    noiseScale: 0.8,
    brightness: 0.5,
    particleDensity: 1.0,
  },
  TOOL_ERROR: {
    colors: [hex('#EF4444'), hex('#F87171'), hex('#991B1B')],
    mode: 12,
    orbIntensity: 0.9,
    flowSpeed: 0.4,
    noiseScale: 0.9,
    brightness: 0.45,
    particleDensity: 0.7,
  },
  API_ERROR: {
    colors: [hex('#DC2626'), hex('#F87171'), hex('#7F1D1D')],
    mode: 13,
    orbIntensity: 0.7,
    flowSpeed: 0.3,
    noiseScale: 0.85,
    brightness: 0.35,
    particleDensity: 0.5,
  },
  DISCONNECTED: {
    colors: [hex('#6B7280'), hex('#4B5563'), hex('#1F2937')],
    mode: 14,
    orbIntensity: 0.1,
    flowSpeed: 0.04,
    noiseScale: 0.6,
    brightness: 0.08,
    particleDensity: 0.1,
  },
  WORKING: {
    colors: [hex('#60A5FA'), hex('#93C5FD'), hex('#2563EB')],
    mode: 15,
    orbIntensity: 0.45,
    flowSpeed: 0.18,
    noiseScale: 0.7,
    brightness: 0.35,
    particleDensity: 0.4,
  },
  PERMISSION_DENIED: {
    colors: [hex('#EF4444'), hex('#FCA5A5'), hex('#991B1B')],
    mode: 16,
    orbIntensity: 0.5,
    flowSpeed: 0.15,
    noiseScale: 0.7,
    brightness: 0.3,
    particleDensity: 0.3,
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

// --- Helpers ---
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// --- State-specific effect functions ---

// 0: IDLE - gentle breathing noise field
vec3 effectIdle(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float flow = fbm(p * 0.6 + vec2(t * 0.08, t * 0.03));
  flow = flow * 0.5 + 0.5;
  vec3 col = mix(c0, c1, flow);
  col = mix(col, c2, smoothstep(0.6, 1.0, flow));
  // gentle orb
  float d = length(uv - 0.5);
  float orb = exp(-d * d * 8.0);
  float breath = 0.5 + 0.5 * sin(t * 2.0);
  col += c1 * orb * breath * 0.4;
  col *= 0.15 + flow * 0.12;
  return col;
}

// 1: INITIALIZING - spiral rays from center
vec3 effectInit(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  vec2 d = uv - 0.5;
  float angle = atan(d.y, d.x);
  float dist = length(d);
  float spiral = sin(angle * 6.0 - dist * 20.0 + t * 4.0);
  spiral = smoothstep(0.0, 0.3, spiral);
  float ring = smoothstep(0.35, 0.3, dist) * smoothstep(0.0, 0.1, dist);
  vec3 col = mix(c0, c1, spiral) * ring;
  // rotating beam
  float beam = sin(angle * 3.0 + t * 5.0);
  beam = smoothstep(0.7, 1.0, beam) * smoothstep(0.3, 0.0, dist);
  col += c2 * beam * 0.6;
  // noise background
  float n = fbm(p * 0.8 + t * 0.2) * 0.5 + 0.5;
  col += c0 * n * 0.08;
  return col;
}

// 2: THINKING - expanding concentric ripples
vec3 effectThinking(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float d = length(uv - 0.5);
  float ripple = sin(d * 30.0 - t * 5.0) * 0.5 + 0.5;
  ripple *= exp(-d * 3.0);
  float ripple2 = sin(d * 20.0 - t * 3.5 + 1.5) * 0.5 + 0.5;
  ripple2 *= exp(-d * 2.5);
  vec3 col = c0 * ripple + c1 * ripple2 * 0.7;
  // central glow pulsing
  float glow = exp(-d * d * 12.0);
  float pulse = 0.6 + 0.4 * sin(t * 4.0);
  col += c2 * glow * pulse;
  // noise
  float n = fbm(p * 1.0 + t * 0.15) * 0.5 + 0.5;
  col += c0 * n * 0.06;
  return col;
}

// 3: COMPACTING - concentric rings collapsing inward
vec3 effectCompacting(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float d = length(uv - 0.5);
  // rings that move inward
  float ring1 = abs(d - fract(t * 0.4) * 0.5);
  ring1 = smoothstep(0.02, 0.0, ring1);
  float ring2 = abs(d - fract(t * 0.4 + 0.33) * 0.5);
  ring2 = smoothstep(0.02, 0.0, ring2);
  float ring3 = abs(d - fract(t * 0.4 + 0.66) * 0.5);
  ring3 = smoothstep(0.02, 0.0, ring3);
  vec3 col = c0 * ring1 + c1 * ring2 + c2 * ring3;
  // central compressing glow
  float center = exp(-d * d * 20.0);
  float breathe = 0.5 + 0.5 * sin(t * 3.0);
  col += c2 * center * breathe * 0.5;
  // background noise that shrinks
  float n = fbm(p * (0.5 + d * 2.0) + t * 0.1) * 0.5 + 0.5;
  col += c0 * n * 0.06;
  return col;
}

// 4: READING - horizontal scan lines sweeping down
vec3 effectReading(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float scan = fract(t * 0.5);
  float scanLine = smoothstep(0.0, 0.01, abs(uv.y - scan));
  scanLine = 1.0 - (1.0 - scanLine) * 0.8;
  // text-like horizontal bars
  float barY = floor(uv.y * 30.0);
  float bar = step(0.3, fract(barY * 0.37 + 0.1));
  bar *= step(0.15, fract(uv.x * 2.0 + barY * 0.13));
  // illuminated region near scan line
  float illuminate = exp(-pow(uv.y - scan, 2.0) * 80.0);
  vec3 col = c0 * bar * 0.15;
  col += c1 * bar * illuminate * 0.5;
  col += c2 * illuminate * 0.15;
  // scan line glow
  float line = smoothstep(0.008, 0.0, abs(uv.y - scan));
  col += c1 * line * 0.6;
  // noise
  float n = fbm(p * 0.8 + t * 0.1) * 0.5 + 0.5;
  col += c0 * n * 0.04;
  return col;
}

// 5: WRITING - vertical cursor blinking with ink spread
vec3 effectWriting(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  // cursor position moves right slowly
  float cursorX = fract(t * 0.08);
  // blinking cursor bar
  float blink = step(0.5, fract(t * 1.0));
  float cursor = smoothstep(0.008, 0.0, abs(uv.x - cursorX)) * blink;
  // "typed text" bars to the left of cursor
  float textMask = step(uv.x, cursorX - 0.02);
  float barY = floor(uv.y * 25.0);
  float textBar = step(0.25, fract(barY * 0.41 + 0.05));
  textBar *= step(0.1, fract(uv.x * 15.0 + barY * 0.17));
  textBar *= textMask;
  // ink diffusion near cursor
  float inkDist = abs(uv.x - cursorX);
  float ink = exp(-inkDist * 40.0) * (1.0 - blink * 0.5);
  vec3 col = c0 * textBar * 0.2;
  col += c1 * cursor;
  col += c2 * ink * 0.3;
  // noise
  float n = fbm(p * 0.7 + t * 0.08) * 0.5 + 0.5;
  col += c0 * n * 0.04;
  return col;
}

// 6: EXECUTING - rotating gear teeth pattern
vec3 effectExecuting(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  vec2 d = uv - 0.5;
  float angle = atan(d.y, d.x);
  float dist = length(d);
  // gear teeth
  float teeth = sin(angle * 12.0 + t * 6.0);
  float gearRing = smoothstep(0.22, 0.2, dist) * smoothstep(0.12, 0.14, dist);
  float teethMask = gearRing * smoothstep(0.0, 0.4, teeth);
  // inner rotating pattern
  float inner = sin(angle * 4.0 - t * 8.0);
  inner = smoothstep(0.3, 0.8, inner) * smoothstep(0.12, 0.0, dist);
  // energy rings
  float pulse = sin(t * 10.0) * 0.5 + 0.5;
  float energy = smoothstep(0.25, 0.23, dist) * pulse;
  vec3 col = c0 * teethMask * 0.7;
  col += c1 * inner * 0.5;
  col += c2 * energy * 0.3;
  // sparks
  float spark = snoise(p * 20.0 + t * 3.0);
  spark = smoothstep(0.7, 1.0, spark);
  col += c1 * spark * 0.3;
  // background
  float n = fbm(p * 0.8 + t * 0.3) * 0.5 + 0.5;
  col += c0 * n * 0.08;
  return col;
}

// 7: APPROVAL - warning pulse with caution stripes
vec3 effectApproval(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  // caution diagonal stripes
  float stripe = sin((uv.x + uv.y) * 40.0 + t * 2.0);
  stripe = smoothstep(0.3, 0.5, stripe);
  // pulsing warning glow
  float d = length(uv - 0.5);
  float glow = exp(-d * d * 6.0);
  float pulse = 0.5 + 0.5 * sin(t * 3.0);
  // exclamation-shaped bright region at center
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

// 8: WAITING_ELICITATION - bouncing wave / input prompt
vec3 effectWaiting(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  // bouncing wave pattern
  float wave = sin(uv.x * 15.0 + t * 4.0) * 0.03;
  float bounce = sin(t * 3.0) * 0.02;
  float bar = smoothstep(0.008, 0.0, abs(uv.y - 0.5 - wave - bounce));
  // input cursor blinking at center
  float cursor = smoothstep(0.005, 0.0, abs(uv.x - 0.5));
  cursor *= smoothstep(0.04, 0.0, abs(uv.y - 0.5 - bounce));
  cursor *= step(0.5, fract(t * 1.2));
  // gentle ripple from center
  float d = length(uv - 0.5);
  float ripple = sin(d * 25.0 - t * 5.0) * exp(-d * 4.0);
  ripple = smoothstep(0.0, 0.3, ripple);
  vec3 col = c0 * bar * 0.4;
  col += c1 * cursor;
  col += c2 * ripple * 0.3;
  float n = fbm(p * 0.7 + t * 0.12) * 0.5 + 0.5;
  col += c0 * n * 0.06;
  return col;
}

// 9: SUBAGENT_RUNNING - multiple orbiting particles
vec3 effectSubagent(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  vec3 col = vec3(0.0);
  // central core
  float d = length(uv - 0.5);
  float core = exp(-d * d * 25.0);
  col += c0 * core * 0.6;
  // 4 orbiting particles
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float angle = t * (2.0 + fi * 0.3) + fi * 1.5708;
    float radius = 0.15 + fi * 0.03;
    vec2 pos = 0.5 + vec2(cos(angle), sin(angle)) * radius;
    float pd = length(uv - pos);
    float particle = exp(-pd * pd * 300.0);
    float trail = exp(-pd * pd * 40.0);
    col += c1 * particle * 0.8;
    col += c2 * trail * 0.2;
  }
  // connecting lines (approximate with thin glow)
  float ring = abs(d - 0.18);
  float orbitLine = smoothstep(0.005, 0.002, ring);
  col += c0 * orbitLine * 0.15;
  // noise
  float n = fbm(p * 0.9 + t * 0.2) * 0.5 + 0.5;
  col += c0 * n * 0.05;
  return col;
}

// 10: TASK_MANAGEMENT - grid pattern with checkmarks
vec3 effectTask(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  // grid lines
  float gx = smoothstep(0.003, 0.0, abs(fract(uv.x * 8.0) - 0.5) - 0.48);
  float gy = smoothstep(0.003, 0.0, abs(fract(uv.y * 8.0) - 0.5) - 0.48);
  float grid = max(gx, gy) * 0.1;
  // animated checkmark pattern
  float cellX = fract(uv.x * 8.0);
  float cellY = fract(uv.y * 8.0);
  float check = 0.0;
  // diagonal line (part of checkmark)
  float d1 = abs(cellX - cellY);
  check += smoothstep(0.06, 0.02, d1) * step(cellX, 0.6) * step(cellY, 0.5);
  // other arm of checkmark
  float d2 = abs((1.0 - cellX) * 0.5 - cellY);
  check += smoothstep(0.06, 0.02, d2) * step(0.4, cellX) * step(cellY, 0.5);
  // animate appearance based on grid position
  float cellId = floor(uv.x * 8.0) + floor(uv.y * 8.0) * 8.0;
  float appear = step(cellId * 0.1, fract(t * 0.3));
  check *= appear;
  vec3 col = c0 * grid + c1 * check * 0.4;
  float n = fbm(p * 0.7 + t * 0.08) * 0.5 + 0.5;
  col += c0 * n * 0.04;
  return col;
}

// 11: COMPLETE - burst / success explosion
vec3 effectComplete(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float d = length(uv - 0.5);
  // burst ring expanding outward
  float burst = abs(d - fract(t * 0.6) * 0.7);
  burst = smoothstep(0.03, 0.0, burst);
  // checkmark shape at center
  vec2 dc = uv - 0.5;
  float check1 = abs(dc.x * 1.0 - dc.y * 0.5);
  float checkArm1 = smoothstep(0.04, 0.01, check1) * step(dc.x, 0.02) * step(-0.02, dc.y);
  float check2 = abs((dc.x - 0.04) * 0.4 - dc.y);
  float checkArm2 = smoothstep(0.04, 0.01, check2) * step(0.0, dc.x) * step(dc.y, 0.04);
  float check = max(checkArm1, checkArm2);
  check *= smoothstep(0.0, 0.3, fract(t * 0.5));
  // sparkle particles
  float sparkle = snoise(p * 30.0 + t * 2.0);
  sparkle = smoothstep(0.65, 1.0, sparkle) * smoothstep(0.3, 0.8, fract(t * 0.4));
  // central glow
  float glow = exp(-d * d * 10.0);
  vec3 col = c0 * burst * 0.6;
  col += c1 * check * 0.8;
  col += c1 * sparkle * 0.4;
  col += c2 * glow * 0.5;
  return col;
}

// 12: TOOL_ERROR - screen shake effect, red ripples
vec3 effectToolError(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  // shake offset
  float shake = sin(t * 40.0) * 0.005 * exp(-fract(t * 0.5) * 3.0);
  vec2 suv = uv + vec2(shake, shake * 0.7);
  float d = length(suv - 0.5);
  // X pattern
  float x1 = abs(suv.x - suv.y);
  float x2 = abs(suv.x + suv.y - 1.0);
  float xMark = smoothstep(0.04, 0.01, x1) + smoothstep(0.04, 0.01, x2);
  xMark = min(xMark, 1.0) * smoothstep(0.3, 0.15, d);
  // error ripples
  float ripple = sin(d * 20.0 - t * 8.0) * exp(-d * 3.0);
  ripple = smoothstep(0.0, 0.4, ripple);
  // red flash
  float flash = exp(-fract(t * 0.5) * 5.0) * 0.3;
  vec3 col = c0 * xMark * 0.6;
  col += c1 * ripple * 0.3;
  col += c2 * flash;
  float n = fbm(p * 1.0 + t * 0.3) * 0.5 + 0.5;
  col += c0 * n * 0.06;
  return col;
}

// 13: API_ERROR - broken/glitchy fragments
vec3 effectApiError(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  // glitch blocks
  float blockY = floor(uv.y * 12.0);
  float glitch = hash(vec2(blockY, floor(t * 8.0)));
  float shift = step(0.7, glitch) * (hash(vec2(blockY + 1.0, floor(t * 8.0))) - 0.5) * 0.1;
  vec2 guv = uv;
  guv.x += shift;
  // broken line through center
  float line = smoothstep(0.01, 0.0, abs(guv.y - 0.5));
  line *= step(0.2, guv.x) * step(guv.x, 0.8);
  // fragments floating apart
  float frag = step(0.5, fract(guv.y * 6.0 + t * 0.5));
  float fragGlow = smoothstep(0.02, 0.0, abs(fract(guv.y * 6.0) - 0.5) - 0.48);
  // connection dots
  float d = length(guv - 0.5);
  float pulse = 0.5 + 0.5 * sin(t * 2.0);
  vec3 col = c0 * line * 0.5;
  col += c1 * fragGlow * 0.3;
  col += c2 * pulse * exp(-d * d * 8.0) * 0.3;
  // static noise
  float noise = hash(uv * 100.0 + t * 20.0) * 0.1;
  col += vec3(noise) * 0.5;
  return col;
}

// 14: DISCONNECTED - TV shutdown effect (CRT power-off)
vec3 effectDisconnected(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  // TV shutdown animation cycle (takes ~3 seconds to complete)
  float cycleDuration = 3.0;
  float cycleT = mod(t * 0.3, cycleDuration);
  float progress = cycleT / cycleDuration;

  // Phase 1 (0-0.4): Vertical compression - screen squishes into horizontal line
  // Phase 2 (0.4-0.8): Line shrinks to center dot
  // Phase 3 (0.8-1.0): Dot fades out

  vec2 center = vec2(0.5, 0.5);
  vec2 d = uv - center;

  // Vertical and horizontal squeeze factors
  float verticalSqueeze;
  float horizontalSqueeze;

  if (progress < 0.4) {
    // Phase 1: Vertical compression
    float phase = progress / 0.4;
    verticalSqueeze = 1.0 - phase * 0.98;
    horizontalSqueeze = 1.0;
  } else if (progress < 0.8) {
    // Phase 2: Horizontal compression to center dot
    float phase = (progress - 0.4) / 0.4;
    verticalSqueeze = 0.02;
    horizontalSqueeze = 1.0 - phase * 0.98;
  } else {
    // Phase 3: Dot fades out
    float phase = (progress - 0.8) / 0.2;
    verticalSqueeze = 0.02 * (1.0 - phase);
    horizontalSqueeze = 0.02 * (1.0 - phase);
  }

  // Apply squeeze
  vec2 squeezed = vec2(d.x / max(horizontalSqueeze, 0.01), d.y / max(verticalSqueeze, 0.01));
  float distFromCenter = length(squeezed);

  // Simple shape: bright compressed screen
  float screenMask = smoothstep(0.5, 0.2, distFromCenter);
  float glow = exp(-distFromCenter * distFromCenter * 2.0);

  // Combine
  vec3 col = c0 * screenMask * 0.5;
  col += c1 * glow * 0.5;

  // Final fade to black
  if (progress > 0.9) {
    float fadeOut = 1.0 - (progress - 0.9) / 0.1;
    col *= fadeOut;
  }

  return col;
}

// 15: WORKING - generic flowing animation
vec3 effectWorking(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float flow = fbm(p * 0.8 + vec2(t * 0.15, t * 0.08));
  flow = flow * 0.5 + 0.5;
  vec3 col = mix(c0, c1, flow);
  // gentle orb
  float d = length(uv - 0.5);
  float orb = exp(-d * d * 10.0);
  float pulse = 0.5 + 0.5 * sin(t * 2.5);
  col += c2 * orb * pulse * 0.3;
  col *= 0.12 + flow * 0.1;
  return col;
}

// 16: PERMISSION_DENIED - blocked / red X overlay
vec3 effectDenied(vec2 uv, vec2 p, float t, vec3 c0, vec3 c1, vec3 c2) {
  float d = length(uv - 0.5);
  // prohibited circle
  float ring = abs(d - 0.15);
  float circle = smoothstep(0.008, 0.002, ring);
  // diagonal slash
  float slash = abs(uv.x - uv.y);
  float slashLine = smoothstep(0.015, 0.005, abs(slash)) * step(0.35, uv.x) * step(uv.x, 0.65);
  float symbol = max(circle, slashLine);
  // pulsing
  float pulse = 0.4 + 0.6 * sin(t * 2.5);
  // red vignette
  float vig = smoothstep(0.5, 0.2, d);
  vec3 col = c0 * symbol * pulse * 0.5;
  col += c2 * vig * 0.08;
  // warning stripes
  float stripe = sin((uv.x + uv.y) * 30.0) * 0.5 + 0.5;
  col += c0 * stripe * 0.02 * vig;
  float n = fbm(p * 0.6 + t * 0.05) * 0.5 + 0.5;
  col += c0 * n * 0.04;
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = uv;
  p.x *= aspect;

  float t = u_time * u_flowSpeed;
  float mode = u_mode;

  // Compute two modes and blend for smooth transitions
  int m0 = int(floor(mode));
  int m1 = int(ceil(mode));
  float blend = fract(mode);

  vec3 c0 = u_color0;
  vec3 c1 = u_color1;
  vec3 c2 = u_color2;

  vec3 colA = vec3(0.0);
  vec3 colB = vec3(0.0);

  // Mode 0
  if (m0 == 0) colA = effectIdle(uv, p, t, c0, c1, c2);
  else if (m0 == 1) colA = effectInit(uv, p, t, c0, c1, c2);
  else if (m0 == 2) colA = effectThinking(uv, p, t, c0, c1, c2);
  else if (m0 == 3) colA = effectCompacting(uv, p, t, c0, c1, c2);
  else if (m0 == 4) colA = effectReading(uv, p, t, c0, c1, c2);
  else if (m0 == 5) colA = effectWriting(uv, p, t, c0, c1, c2);
  else if (m0 == 6) colA = effectExecuting(uv, p, t, c0, c1, c2);
  else if (m0 == 7) colA = effectApproval(uv, p, t, c0, c1, c2);
  else if (m0 == 8) colA = effectWaiting(uv, p, t, c0, c1, c2);
  else if (m0 == 9) colA = effectSubagent(uv, p, t, c0, c1, c2);
  else if (m0 == 10) colA = effectTask(uv, p, t, c0, c1, c2);
  else if (m0 == 11) colA = effectComplete(uv, p, t, c0, c1, c2);
  else if (m0 == 12) colA = effectToolError(uv, p, t, c0, c1, c2);
  else if (m0 == 13) colA = effectApiError(uv, p, t, c0, c1, c2);
  else if (m0 == 14) colA = effectDisconnected(uv, p, t, c0, c1, c2);
  else if (m0 == 15) colA = effectWorking(uv, p, t, c0, c1, c2);
  else if (m0 == 16) colA = effectDenied(uv, p, t, c0, c1, c2);

  // Mode 1
  if (m1 == m0) {
    colB = colA;
  } else if (m1 == 0) colB = effectIdle(uv, p, t, c0, c1, c2);
  else if (m1 == 1) colB = effectInit(uv, p, t, c0, c1, c2);
  else if (m1 == 2) colB = effectThinking(uv, p, t, c0, c1, c2);
  else if (m1 == 3) colB = effectCompacting(uv, p, t, c0, c1, c2);
  else if (m1 == 4) colB = effectReading(uv, p, t, c0, c1, c2);
  else if (m1 == 5) colB = effectWriting(uv, p, t, c0, c1, c2);
  else if (m1 == 6) colB = effectExecuting(uv, p, t, c0, c1, c2);
  else if (m1 == 7) colB = effectApproval(uv, p, t, c0, c1, c2);
  else if (m1 == 8) colB = effectWaiting(uv, p, t, c0, c1, c2);
  else if (m1 == 9) colB = effectSubagent(uv, p, t, c0, c1, c2);
  else if (m1 == 10) colB = effectTask(uv, p, t, c0, c1, c2);
  else if (m1 == 11) colB = effectComplete(uv, p, t, c0, c1, c2);
  else if (m1 == 12) colB = effectToolError(uv, p, t, c0, c1, c2);
  else if (m1 == 13) colB = effectApiError(uv, p, t, c0, c1, c2);
  else if (m1 == 14) colB = effectDisconnected(uv, p, t, c0, c1, c2);
  else if (m1 == 15) colB = effectWorking(uv, p, t, c0, c1, c2);
  else if (m1 == 16) colB = effectDenied(uv, p, t, c0, c1, c2);

  vec3 col = mix(colA, colB, blend);

  // Vignette
  float vignette = 1.0 - smoothstep(0.3, 1.3, length(uv - 0.5) * 1.4);
  col *= vignette;

  // Tone mapping (Reinhard)
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

// Draws the four sky plates (day, sunset, dusk, night) in one WebGL pass. Every plate is warped by the same
// cloud velocity field, so the clouds drift together and the scroll crossfades never show two cloud positions.

// Fitted from a 4K video of the day plate: drift per video frame, in plate uv. flow.png holds the
// per-pixel difference from this mean, packed as (d * FLOW_SCALE + 0.5) in R and G.
const FLOW_MEAN = [0.00063146, -0.0000268] as const;
const FLOW_SCALE = 744.456;

// The drift loops every PERIOD seconds; the last FADE seconds dissolve back into the start, fine detail
// switching over quickly at the midpoint so the two cloud positions are never both sharp for long.
const FRAMES_PER_SECOND = 6;
const PERIOD = 6;
const FADE = 3;

// The clouds travel up to ~4% of the plate, so it is shown slightly zoomed and shifted right to keep the
// warp inside the image. The DOM plates use the same transform (see Sky.module.css).
export const ZOOM = 1.048;
export const SHIFT = -0.0145;

const LOW = { width: 240, height: 135 };
const MAX_DPR = 2;

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uZoom;
uniform float uShift;
uniform sampler2D uFlow;
uniform vec2 uMean;
uniform float uFlowScale;
uniform vec2 uK;
uniform vec2 uBlend;
uniform vec4 uWeight;
uniform sampler2D uHi[4];
uniform sampler2D uLo[4];
out vec4 outColor;

vec2 plateUv() {
  vec2 q = vec2(gl_FragCoord.x, uView.y - gl_FragCoord.y);
  vec2 c = uView * 0.5;
  vec2 p = c + (q - c) / uZoom - vec2(uShift * uView.x, 0.0);
  float s = max(uView.x / 16.0, uView.y / 9.0);
  vec2 size = vec2(16.0, 9.0) * s;
  return (p - (uView - size) * 0.5) / size;
}

vec3 plate(sampler2D hi, sampler2D lo, vec2 a, vec2 b, bool dissolve) {
  vec3 ha = texture(hi, a).rgb;
  if (!dissolve) return ha;
  vec3 hb = texture(hi, b).rgb;
  vec3 la = texture(lo, a).rgb;
  vec3 lb = texture(lo, b).rgb;
  return mix(la, lb, uBlend.x) + mix(ha - la, hb - lb, uBlend.y);
}

void main() {
  vec2 uv = plateUv();
  vec2 v = uMean + (texture(uFlow, uv).rg - 0.5) / uFlowScale;
  vec2 a = uv - uK.x * v;
  vec2 b = uv - uK.y * v;
  bool dissolve = uBlend.x > 0.0 || uBlend.y > 0.0;
  vec3 col = vec3(0.0);
  if (uWeight.x > 0.0) col += uWeight.x * plate(uHi[0], uLo[0], a, b, dissolve);
  if (uWeight.y > 0.0) col += uWeight.y * plate(uHi[1], uLo[1], a, b, dissolve);
  if (uWeight.z > 0.0) col += uWeight.z * plate(uHi[2], uLo[2], a, b, dissolve);
  if (uWeight.w > 0.0) col += uWeight.w * plate(uHi[3], uLo[3], a, b, dissolve);
  outColor = vec4(col, 1.0);
}`;

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

function drift(time: number) {
  const u = time % PERIOD;
  const tail = FRAMES_PER_SECOND * u;
  const head = FRAMES_PER_SECOND * (u - PERIOD);
  if (u < PERIOD - FADE) return { tail, head, low: 0, detail: 0 };
  const x = (u - (PERIOD - FADE)) / FADE;
  return { tail, head, low: smooth(x), detail: smooth((x - 0.35) / 0.3) };
}

function loadImage(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode().then(() => img);
}

export type SkyRenderer = {
  setPhases: (sunset: number, dusk: number, night: number) => void;
  dispose: () => void;
};

export async function createSkyRenderer(
  canvas: HTMLCanvasElement,
  { plates, flow, still, onLost }: { plates: string[]; flow: string; still: boolean; onLost: () => void },
): Promise<SkyRenderer> {
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) throw new Error("WebGL2 unavailable");

  const shader = (type: number, source: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const texture = (unit: number, source: TexImageSource, raw = false) => {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, raw ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  };

  const [flowImg, ...plateImgs] = await Promise.all([flow, ...plates].map(loadImage));
  if (gl.isContextLost()) throw new Error("context lost");
  const small = document.createElement("canvas");
  small.width = LOW.width;
  small.height = LOW.height;
  const smallCtx = small.getContext("2d")!;
  smallCtx.imageSmoothingQuality = "high";

  const textures = [texture(0, flowImg, true)];
  plateImgs.forEach((img, i) => textures.push(texture(1 + i, img)));
  plateImgs.forEach((img, i) => {
    smallCtx.drawImage(img, 0, 0, LOW.width, LOW.height);
    textures.push(texture(5 + i, small));
  });

  const bind = () => {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    textures.forEach((tex, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
    });
  };
  bind();
  gl.uniform1i(u("uFlow"), 0);
  gl.uniform1iv(u("uHi"), [1, 2, 3, 4]);
  gl.uniform1iv(u("uLo"), [5, 6, 7, 8]);
  gl.uniform2f(u("uMean"), FLOW_MEAN[0], FLOW_MEAN[1]);
  gl.uniform1f(u("uFlowScale"), FLOW_SCALE);
  gl.uniform1f(u("uZoom"), ZOOM);
  gl.uniform1f(u("uShift"), SHIFT);
  const uView = u("uView");
  const uK = u("uK");
  const uBlend = u("uBlend");
  const uWeight = u("uWeight");

  let phases = [0, 0, 0];
  let frame = 0;
  let lastDraw = -1;
  let dirty = true;
  const start = performance.now();

  const resize = () => {
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      dirty = true;
    }
  };

  const draw = (now: number) => {
    const time = still ? 0 : (now - start) / 1000;
    const { tail, head, low, detail } = drift(time);
    const [a1, a2, a3] = phases;
    bind();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uView, canvas.width, canvas.height);
    gl.uniform2f(uK, tail, head);
    gl.uniform2f(uBlend, low, detail);
    gl.uniform4f(uWeight, (1 - a1) * (1 - a2) * (1 - a3), a1 * (1 - a2) * (1 - a3), a2 * (1 - a3), a3);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    // The drift is slow; 30 fps is plenty and halves the GPU work.
    if (!dirty && (still || now - lastDraw < 1000 / 31)) return;
    resize();
    draw(now);
    lastDraw = now;
    dirty = false;
  };

  const onVisibility = () => {
    cancelAnimationFrame(frame);
    if (!document.hidden) frame = requestAnimationFrame(tick);
  };
  const onResize = () => {
    dirty = true;
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    onLost();
  };

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);
  resize();
  draw(performance.now());
  frame = requestAnimationFrame(tick);

  return {
    setPhases(sunset, dusk, night) {
      phases = [sunset, dusk, night];
      dirty = true;
    },
    dispose() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      textures.forEach((tex) => gl.deleteTexture(tex));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

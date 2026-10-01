"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = r * p * 2.02 + 0.13;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);

  vec2 d = p - m;
  float dist = length(d);
  float angle = uHover * 0.5 * exp(-dist * dist * 4.0) * (0.9 + 0.1 * sin(uTime * 0.9));
  float s = sin(angle);
  float c = cos(angle);
  vec2 sp = m + mat2(c, -s, s, c) * d;

  vec2 q = sp * vec2(1.15, 1.9) + vec2(uTime * 0.03, 0.0);
  vec2 w = vec2(fbm(q + vec2(0.0, uTime * 0.02)), fbm(q + vec2(5.2, 1.3) - uTime * 0.015));
  vec2 warped = q + 1.5 * w;
  float n = fbm(warped);
  float n2 = fbm(warped + normalize(vec2(0.6, 0.8)) * 0.07);

  float density = smoothstep(0.44, 0.8, n);
  float lit = clamp((n - n2) * 7.0 + 0.55, 0.0, 1.0);

  vec3 skyTop = vec3(0.47, 0.72, 0.94);
  vec3 skyBottom = vec3(0.80, 0.90, 0.98);
  vec3 sky = mix(skyBottom, skyTop, smoothstep(0.0, 1.0, uv.y));
  float sun = exp(-length(p - vec2(0.9 * aspect, 1.25)) * 1.4);
  sky += vec3(1.0, 0.96, 0.86) * sun * 0.4;

  vec3 cloud = mix(vec3(0.79, 0.86, 0.94), vec3(1.0), lit);
  cloud += vec3(1.0, 0.97, 0.9) * sun * 0.12;
  vec3 col = mix(sky, cloud, density * 0.94);

  col += vec3(1.0, 0.97, 0.9) * exp(-dist * dist * 2.0) * uHover * 0.07;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function SkyShader({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const attr = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uHover = gl.getUniformLocation(program, "uHover");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5 };
    let hover = 0;
    let hoverTarget = 0;
    let time = 12;
    let last = 0;
    let raf = 0;

    const draw = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uHover, hover);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      hover += (hoverTarget - hover) * (1 - Math.exp(-dt * 2.2));
      const follow = 1 - Math.exp(-dt * 4);
      mouse.x += (mouse.tx - mouse.x) * follow;
      mouse.y += (mouse.ty - mouse.y) * follow;
      time += dt * (1 + hover * 0.3);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || still) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };
    const onEnter = (e: PointerEvent) => {
      onMove(e);
      if (hover < 0.05) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      hoverTarget = 1;
    };
    const onLeave = () => {
      hoverTarget = 0;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);

    resize();
    draw();
    canvas.dataset.ready = "";

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

"use client";

import { useEffect, useRef } from "react";
import { onSky, prefersStill, smoothstep } from "@/lib/sky";

type Star = { x: number; y: number; r: number; a: number; speed: number; phase: number };
type Meteor = { x: number; y: number; vx: number; vy: number; age: number; life: number };
type Point = { x: number; y: number; born: number };
type Rocket = { x0: number; y0: number; lean: number; age: number; trail: Point[] };

const BURN = 5.6;
const SMOKE = 6;
const MAX_ROCKETS = 4;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const mix = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);

export function NightSky({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = prefersStill();

    const stars: Star[] = Array.from({ length: 64 }, () => ({
      x: Math.random(),
      y: Math.random() ** 1.7 * 0.6,
      r: rand(0.5, 1.35),
      a: rand(0.35, 0.95),
      speed: rand(0.5, 2),
      phase: rand(0, Math.PI * 2),
    }));
    const meteors: Meteor[] = [];
    const rockets: Rocket[] = [];
    let w = 0;
    let h = 0;
    let alpha = 0;
    let frame = 0;
    let last = 0;
    let clock = 0;
    let nextMeteor = rand(3, 7);
    let launchedAtBottom = false;
    let launchTimer = 0;

    // Straight up off the pad, then a gravity turn out over the ocean.
    const rocketAt = (r: Rocket, age: number) => {
      const climb = 0.036 * h * age * age;
      return { x: r.x0 + r.lean * h * (climb / h) ** 2, y: r.y0 - climb };
    };

    const drawStars = () => {
      for (const s of stars) {
        const twinkle = still ? 0.8 : 0.6 + 0.4 * Math.sin(clock * s.speed + s.phase);
        ctx.fillStyle = `rgba(255, 250, 240, ${s.a * twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawMeteors = () => {
      for (const m of meteors) {
        const k = Math.sin((Math.PI * m.age) / m.life);
        const tail = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 0.14, m.y - m.vy * 0.14);
        tail.addColorStop(0, `rgba(255, 255, 255, ${0.9 * k})`);
        tail.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 0.14, m.y - m.vy * 0.14);
        ctx.stroke();
      }
    };

    const drawRockets = () => {
      ctx.lineCap = "round";
      for (const r of rockets) {
        for (let i = 1; i < r.trail.length; i++) {
          const a = r.trail[i - 1];
          const b = r.trail[i];
          const age = clock - b.born;
          const fade = Math.max(0, 1 - age / SMOKE);
          if (fade <= 0) continue;
          const warm = Math.max(0, 1 - age / 0.8);
          ctx.strokeStyle = `rgba(${mix(186, 255, warm)}, ${mix(196, 196, warm)}, ${mix(228, 132, warm)}, ${fade * fade * (0.28 + warm * 0.5)})`;
          ctx.lineWidth = 1.4 + age * 5.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        ctx.globalCompositeOperation = "lighter";
        if (r.age < 1.6) {
          const flash = ctx.createRadialGradient(r.x0, h, 0, r.x0, h, 160);
          flash.addColorStop(0, `rgba(255, 176, 102, ${0.42 * (1 - r.age / 1.6)})`);
          flash.addColorStop(1, "rgba(255, 176, 102, 0)");
          ctx.fillStyle = flash;
          ctx.fillRect(r.x0 - 160, h - 160, 320, 160);
        }
        if (r.age < BURN) {
          const { x, y } = rocketAt(r, r.age);
          const size = 9 + Math.random() * 4;
          const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
          glow.addColorStop(0, "rgba(255, 252, 240, 1)");
          glow.addColorStop(0.28, "rgba(255, 206, 130, 0.9)");
          glow.addColorStop(1, "rgba(255, 140, 70, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      drawStars();
      drawMeteors();
      drawRockets();
    };

    const step = (dt: number) => {
      clock += dt;

      if (alpha > 0.6 && (nextMeteor -= dt) <= 0) {
        const speed = rand(700, 1000);
        const angle = rand(0.28, 0.5);
        meteors.push({
          x: rand(0.2, 0.95) * w,
          y: rand(0.04, 0.3) * h,
          vx: -Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          age: 0,
          life: rand(0.5, 0.85),
        });
        nextMeteor = rand(6, 13);
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.age += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.age >= m.life) meteors.splice(i, 1);
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.age += dt;
        if (r.age < BURN) r.trail.push({ ...rocketAt(r, r.age), born: clock });
        if (r.age > BURN + SMOKE) rockets.splice(i, 1);
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      step(dt);
      draw();
      frame = alpha > 0.01 || rockets.length ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };

    const start = () => {
      if (still) draw();
      else if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };

    const launch = (x: number) => {
      if (still || rockets.length >= MAX_ROCKETS) return;
      rockets.push({ x0: x, y0: h + 8, lean: rand(0.3, 0.6), age: 0, trail: [] });
      start();
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (alpha > 0) draw();
    };

    const onClick = (event: MouseEvent) => {
      if (alpha < 0.5 || (event.target as Element).closest("a, button, [data-card]")) return;
      launch(event.clientX);
    };

    const onVisibility = () => (document.hidden ? stop() : alpha > 0.01 && start());

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onVisibility);

    const unsubscribe = onSky((t) => {
      alpha = smoothstep(0.64, 0.88, t);
      canvas.style.opacity = String(alpha);
      if (alpha > 0.01) start();
      if (t > 0.97 && !launchedAtBottom) {
        launchedAtBottom = true;
        launchTimer = window.setTimeout(() => launch(w * rand(0.3, 0.5)), 900);
      }
    });

    return () => {
      unsubscribe();
      stop();
      window.clearTimeout(launchTimer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className={className} />;
}

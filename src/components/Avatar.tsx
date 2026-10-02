"use client";

import Image from "next/image";
import { useRef } from "react";
import { prefersStill } from "@/lib/sky";
import styles from "./Avatar.module.css";

const MAX_CROWS = 12;

const CROW = `<svg viewBox="0 0 48 34" aria-hidden="true">
  <path d="M10 20 2 16.5l1.5 4-2 4.5 9.5-1.5z"/>
  <ellipse cx="22" cy="21" rx="13" ry="7.5"/>
  <circle cx="34.5" cy="16.5" r="6"/>
  <path d="M39.5 14.5q5.5 1.6 8 3.4-4 1.6-8 1.2z"/>
  <path class="${styles.wing}" d="M27 19c-2-8-8-13.5-16-16.5 1 3 1.5 5 3 6.5-.5 2 0 3.5 1.5 5-.5 2 0 3 .5 5z"/>
</svg>`;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function launch(flock: HTMLElement, reach: number) {
  const crow = document.createElement("span");
  crow.className = styles.crow;
  crow.innerHTML = CROW;
  crow.style.setProperty("--flap", `${rand(0.15, 0.22).toFixed(3)}s`);
  flock.append(crow);

  // Out from behind the photo in any direction, on a slightly curved line.
  const angle = rand(0, Math.PI * 2);
  const distance = rand(190, 320) * reach;
  const end = { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  const swerve = rand(-0.25, 0.25) * distance;
  const bend = { x: end.x / 2 - Math.sin(angle) * swerve, y: end.y / 2 + Math.cos(angle) * swerve - 20 * reach };
  const dir = end.x < 0 ? -1 : 1;
  const size = rand(0.8, 1.05);
  const wobble = rand(0, Math.PI * 2);

  const steps = 18;
  const frames: Keyframe[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const p = 1 - (1 - t) ** 1.6;
    const q = 1 - p;
    const x = 2 * q * p * bend.x + p * p * end.x;
    const y = 2 * q * p * bend.y + p * p * end.y + Math.sin(t * 14 + wobble) * 2.5 * t;
    const vx = 2 * q * bend.x + 2 * p * (end.x - bend.x);
    const vy = 2 * q * bend.y + 2 * p * (end.y - bend.y);
    const tilt = Math.max(-35, Math.min(35, (Math.atan2(vy, Math.abs(vx)) * 180) / Math.PI)) * dir;
    const scale = size * Math.min(1, 0.45 + p * 2.5) * (1 - 0.15 * t);
    frames.push({
      offset: t,
      opacity: t < 0.7 ? 1 : (1 - t) / 0.3,
      transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${tilt.toFixed(1)}deg) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`,
    });
  }

  crow.animate(frames, { duration: rand(1900, 2500), fill: "both" }).finished.then(
    () => crow.remove(),
    () => crow.remove(),
  );
}

export function Avatar({ name }: { name: string }) {
  const button = useRef<HTMLButtonElement>(null);
  const flock = useRef<HTMLDivElement>(null);

  const release = () => {
    button.current?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.94)", offset: 0.3 }, { transform: "scale(1.03)", offset: 0.65 }, { transform: "scale(1)" }],
      { duration: 400, easing: "ease-out" },
    );
    const el = flock.current;
    if (!el || prefersStill() || el.childElementCount >= MAX_CROWS) return;
    launch(el, window.innerWidth < 600 ? 0.7 : 1);
  };

  return (
    <div className={styles.wrap}>
      <div ref={flock} className={styles.flock} />
      <button ref={button} type="button" className={styles.avatar} onClick={release} aria-label={`${name}, release a crow`}>
        <Image src="/avatar.jpg" alt="" width={1024} height={1024} preload quality={90} sizes="128px" draggable={false} />
      </button>
    </div>
  );
}

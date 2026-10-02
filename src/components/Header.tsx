"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/data/content";
import { onSky, smoothstep } from "@/lib/sky";
import { Logo } from "./Logo";
import styles from "./Header.module.css";

const ARC = { cx: 14, cy: 13, r: 10 };

const onArc = (angle: number) => ({
  x: ARC.cx + ARC.r * Math.cos(angle),
  y: ARC.cy - ARC.r * Math.sin(angle),
});

export function Header() {
  const sun = useRef<SVGCircleElement>(null);
  const moon = useRef<SVGCircleElement>(null);

  useEffect(
    () =>
      onSky((t) => {
        const s = onArc(Math.PI * (0.7 - 0.82 * smoothstep(0, 0.6, t)));
        const m = onArc(Math.PI * (1.12 - 0.4 * smoothstep(0.62, 1, t)));
        sun.current?.setAttribute("cx", s.x.toFixed(2));
        sun.current?.setAttribute("cy", s.y.toFixed(2));
        moon.current?.setAttribute("cx", m.x.toFixed(2));
        moon.current?.setAttribute("cy", m.y.toFixed(2));
      }),
    [],
  );

  return (
    <header className={styles.header}>
      <nav className={styles.pill} aria-label="Main">
        <a href="#top" className={styles.brand} aria-label={`${profile.name}, back to top`}>
          <svg className={styles.arc} viewBox="0 0 28 16" width="28" height="16" aria-hidden="true">
            <defs>
              <clipPath id="above-horizon">
                <rect x="0" y="0" width="28" height="13" />
              </clipPath>
            </defs>
            <path d="M4 13a10 10 0 0 1 20 0" className={styles.path} />
            <g clipPath="url(#above-horizon)">
              <circle ref={sun} r="2.6" className={styles.sun} cx="7" cy="5" />
              <circle ref={moon} r="2.2" className={styles.moon} cx="4" cy="15" />
            </g>
            <path d="M1 13h26" className={styles.horizon} />
          </svg>
          {profile.short}
        </a>
        <span className={styles.links}>
          <a href="#highlights">Highlights</a>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </span>
        <a className={styles.x} href={profile.url} target="_blank" rel="noopener noreferrer" aria-label={`@${profile.handle} on X`}>
          <Logo name="x" size={14} />
        </a>
      </nav>
    </header>
  );
}

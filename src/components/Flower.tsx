"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { record } from "@/lib/activity";
import { centerMarkup, defsMarkup, flowerInnerMarkup, PETAL_COUNT, petalMarkup, petals } from "./flower-art";
import styles from "./Flower.module.css";

const SVG_NS = "http://www.w3.org/2000/svg";

function useSvgId() {
  return `fl${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

const angularDistance = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

export function Flower({ size, className }: { size?: number; className?: string }) {
  const id = useSvgId();
  return (
    <svg
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: flowerInnerMarkup(id) }}
    />
  );
}

type PluckableProps = {
  className?: string;
  regrowDelay?: number;
  onPluck?: (count: number) => void;
};

export function PluckableFlower({ className, regrowDelay = 2000, onPluck }: PluckableProps) {
  const id = useSvgId();
  const [plucked, setPlucked] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const rootRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const onPluckRef = useRef(onPluck);
  const done = plucked.length === PETAL_COUNT;

  useEffect(() => {
    onPluckRef.current = onPluck;
  });

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      setPlucked([]);
      setRound((r) => r + 1);
      onPluckRef.current?.(0);
    }, regrowDelay);
    return () => clearTimeout(t);
  }, [done, regrowDelay]);

  const drop = (i: number) => {
    const root = rootRef.current;
    const source = svgRef.current?.querySelector(`[data-petal="${i}"]`)?.parentNode;
    if (!root || !source) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const clone = source.cloneNode(true) as SVGGElement;
    clone.querySelector("[data-petal]")?.removeAttribute("class");
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "-50 -50 100 100");
    svg.setAttribute("class", styles.falling);
    svg.appendChild(clone);
    root.appendChild(svg);

    const size = root.offsetWidth;
    const rad = (petals[i].angle * Math.PI) / 180;
    const cx = size / 2 + Math.sin(rad) * size * 0.28;
    const cy = size / 2 - Math.cos(rad) * size * 0.28;
    svg.style.transformOrigin = `${cx}px ${cy}px`;

    const fall = Math.max(150, size * 1.7);
    const drift = (Math.random() - 0.5) * fall * 0.6;
    const spin = (Math.random() > 0.5 ? 1 : -1) * (160 + Math.random() * 200);
    const out = [Math.sin(rad) * size * 0.12, -Math.cos(rad) * size * 0.12];
    svg.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${out[0]}px, ${out[1]}px) rotate(${spin * 0.12}deg)`, opacity: 1, offset: 0.12 },
        { transform: `translate(${drift * 0.6}px, ${fall * 0.55}px) rotate(${spin * 0.6}deg)`, opacity: 0.95, offset: 0.6 },
        { transform: `translate(${drift}px, ${fall}px) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 1600 + Math.random() * 600, easing: "cubic-bezier(.3,.55,.4,1)", fill: "forwards" },
    ).onfinish = () => svg.remove();
  };

  const pluck = (e: MouseEvent<HTMLButtonElement>) => {
    if (done) return;
    const remaining = petals.map((_, i) => i).filter((i) => !plucked.includes(i));
    let pick = remaining[0];

    const hit = (e.target as Element).closest?.("[data-petal]");
    const hitIndex = hit ? Number(hit.getAttribute("data-petal")) : -1;
    if (hitIndex >= 0 && !plucked.includes(hitIndex)) {
      pick = hitIndex;
    } else if (e.detail > 0) {
      const r = e.currentTarget.getBoundingClientRect();
      const clicked =
        (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
      pick = remaining.reduce((best, i) =>
        angularDistance(petals[i].angle, clicked) < angularDistance(petals[best].angle, clicked) ? i : best,
      );
    }

    drop(pick);
    record(2, pick);
    const next = [...plucked, pick];
    setPlucked(next);
    onPluck?.(next.length);
  };

  return (
    <span ref={rootRef} className={`${styles.root} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.button}
        onClick={pluck}
        aria-label={done ? "No petals left" : "Pluck a petal"}
      >
        <svg ref={svgRef} viewBox="-50 -50 100 100" className={styles.svg} aria-hidden="true">
          <defs dangerouslySetInnerHTML={{ __html: defsMarkup(id) }} />
          {petals.map((p, i) => (
            <g key={`${round}-${i}`} transform={`rotate(${p.angle})`}>
              <g
                className={styles.petal}
                data-petal={i}
                data-gone={plucked.includes(i) || undefined}
                style={{ "--d": `${i * 38}ms` } as CSSProperties}
                dangerouslySetInnerHTML={{ __html: petalMarkup(id, p) }}
              />
            </g>
          ))}
          <g className={styles.center} dangerouslySetInnerHTML={{ __html: centerMarkup(id) }} />
        </svg>
      </button>
    </span>
  );
}

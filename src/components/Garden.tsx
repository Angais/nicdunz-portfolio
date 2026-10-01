"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./Garden.module.css";

const W = 1440;
const H = 180;

type Kind = "daisy" | "blossom" | "cosmos" | "marigold" | "tulip" | "lavender" | "breath";

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = rng(20220903);
const between = (min: number, max: number) => min + random() * (max - min);
const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];
const f = (n: number) => Math.round(n * 10) / 10;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const HEIGHTS: Record<Kind, [number, number]> = {
  daisy: [50, 92],
  blossom: [56, 96],
  cosmos: [66, 112],
  marigold: [36, 66],
  tulip: [42, 74],
  lavender: [64, 104],
  breath: [48, 84],
};

const GROUPS: Kind[][] = [
  ["cosmos", "daisy", "breath"],
  ["daisy", "daisy", "lavender"],
  ["marigold", "blossom", "daisy"],
  ["tulip", "daisy", "breath"],
  ["blossom", "cosmos", "daisy"],
  ["cosmos", "cosmos", "daisy"],
  ["lavender", "marigold", "daisy"],
  ["tulip", "cosmos", "breath"],
  ["blossom", "blossom", "breath"],
  ["daisy", "marigold", "cosmos"],
];

type Plant = {
  x: number;
  h: number;
  bend: number;
  kind: Kind;
  scale: number;
  tilt: number;
  delay: number;
  sway: number;
  bud: boolean;
  leaves: { t: number; side: 1 | -1; size: number; angle: number }[];
};

function makePlant(x: number, kind: Kind, back: boolean): Plant {
  const [lo, hi] = HEIGHTS[kind];
  const h = between(lo, hi) * (back ? 0.74 : 1);
  const basal = kind === "tulip" || kind === "lavender";
  const leafCount = kind === "breath" ? 1 : basal ? 2 : 3;
  const size = back ? 0.8 : 1;
  return {
    x: f(x),
    h: f(h),
    bend: f(between(-10, 10) * (h / 100)),
    kind,
    scale: f(back ? between(1, 1.15) : between(1.35, 1.6)),
    tilt: f(between(-14, 14)),
    delay: Math.round(Math.abs(x - W / 2) * 0.42 + between(0, 200) + (back ? 140 : 0)),
    sway: f(between(3.2, 5.6)),
    bud: !back && (kind === "cosmos" || kind === "daisy") && random() < 0.35,
    leaves: [
      ...range(leafCount).map((i) => ({
        t: basal ? 0 : f(between(0.2, 0.42) + i * 0.1),
        side: (i % 2 ? -1 : 1) as 1 | -1,
        size: f(between(0.85, 1.15) * size * (basal ? 1.1 : 1)),
        angle: f(basal ? between(-10, 14) : between(-40, -18)),
      })),
      ...(basal
        ? []
        : [1, -1].map((side) => ({
            t: 0,
            side: side as 1 | -1,
            size: f(between(1.15, 1.45) * size),
            angle: f(between(-14, 4)),
          }))),
    ],
  };
}

const front: Plant[] = [];
const back: Plant[] = [];
for (let x = 6; x < W; ) {
  const width = between(110, 170);
  const kinds = pick(GROUPS);
  const n = 3 + Math.floor(random() * 3);
  for (let k = 0; k < n; k++) {
    front.push(makePlant(x + ((k + 0.5) * width) / n + between(-12, 12), pick(kinds), false));
  }
  const m = 3 + Math.floor(random() * 3);
  for (let k = 0; k < m; k++) {
    back.push(makePlant(x + (k * width) / m + between(0, 30), pick(kinds), true));
  }
  x += width;
}

const all = [...back.map((p) => ({ p, back: true })), ...front.map((p) => ({ p, back: false }))];

const BLADE_COLORS = ["#7db567", "#8fc278", "#6aa557", "#a3cf8b", "#78b062"];

function tufts(count: number, scale: number) {
  return range(count).map(() => {
    const x = between(-10, W + 10);
    return range(4 + Math.floor(random() * 5)).map(() => {
      const bx = x + between(-6, 6);
      const h = between(12, 36) * scale;
      const w = between(1.2, 2.1) * scale;
      const c = between(-9, 9) * scale;
      return {
        d: `M${f(bx - w)} ${H} Q${f(bx + c * 0.35 - w * 0.3)} ${f(H - h * 0.55)} ${f(bx + c)} ${f(H - h)} Q${f(bx + c * 0.35 + w * 0.3)} ${f(H - h * 0.55)} ${f(bx + w)} ${H}Z`,
        fill: pick(BLADE_COLORS),
      };
    });
  }).flat();
}

const backGrass = tufts(60, 0.75);
const frontGrass = tufts(80, 1);

const DAISY_PETAL =
  "M0 -3 C 1.5 -4 2.6 -8.5 2.4 -11.8 C 2.3 -13.4 1.3 -14.2 0.6 -14.2 L 0 -13.6 L -0.6 -14.2 C -1.3 -14.2 -2.3 -13.4 -2.4 -11.8 C -2.6 -8.5 -1.5 -4 0 -3 Z";
const COSMOS_PETAL =
  "M0 -2 C 3 -3.5 6.4 -9 6.6 -14.6 L 4.6 -13.6 L 3.2 -15.6 L 1.5 -14 L 0 -16 L -1.5 -14 L -3.2 -15.6 L -4.6 -13.6 L -6.6 -14.6 C -6.4 -9 -3 -3.5 0 -2 Z";
const COSMOS_VEINS = "M0 -3.5 L0 -13 M-1.6 -4.2 L-3.6 -12.4 M1.6 -4.2 L3.6 -12.4";
const BROAD_LEAF = "M0 0 C 3.5 -4 9 -6.5 15 -5.5 C 10.5 -1.5 5 1 0 0 Z";
const BROAD_RIB = "M0.8 -0.5 C 5 -2.6 9 -4 14 -5.2";
const LONG_LEAF = "M0 0 C 1.5 -10 4.5 -22 10 -34 C 4 -24 0.6 -12 -2.2 0 Z";
const LONG_RIB = "M-0.6 -1 C 1.2 -11 3.8 -21 9 -32";

function scallop(radius: number, bumps: number, depth: number) {
  let d = "";
  for (let i = 0; i < bumps; i++) {
    const a0 = (i / bumps) * Math.PI * 2;
    const a1 = ((i + 0.5) / bumps) * Math.PI * 2;
    const a2 = ((i + 1) / bumps) * Math.PI * 2;
    if (i === 0) d += `M${f(Math.cos(a0) * radius)} ${f(Math.sin(a0) * radius)}`;
    d += ` Q${f(Math.cos(a1) * (radius + depth))} ${f(Math.sin(a1) * (radius + depth))} ${f(Math.cos(a2) * radius)} ${f(Math.sin(a2) * radius)}`;
  }
  return `${d}Z`;
}

const MARIGOLD = [scallop(9, 15, 3), scallop(6.4, 12, 2.4), scallop(3.8, 9, 1.8)];

function Daisy({ petal, edge, disc }: { petal: string; edge: string; disc: string }) {
  return (
    <g>
      <g transform="scale(1 0.62)">
        {range(16).map((i) => (
          <path
            key={i}
            d={DAISY_PETAL}
            transform={`rotate(${i * 22.5 + (i % 2) * 4})`}
            fill={`url(#${petal})`}
            stroke={edge}
            strokeWidth={0.45}
          />
        ))}
      </g>
      <ellipse rx={4.7} ry={3.7} cy={-0.6} fill={`url(#${disc})`} />
      <ellipse rx={2} ry={1.1} cx={-1.2} cy={-2} fill="#fff" opacity={0.35} />
    </g>
  );
}

function Cosmos() {
  return (
    <g>
      <g transform="scale(1 0.7)">
        {range(8).map((i) => (
          <g key={i} transform={`rotate(${i * 45 + 8})`}>
            <path d={COSMOS_PETAL} fill="url(#g-cosmos)" stroke="#eea2c2" strokeWidth={0.35} />
            <path d={COSMOS_VEINS} stroke="#cf5a8d" strokeWidth={0.35} opacity={0.28} />
          </g>
        ))}
      </g>
      <ellipse rx={3.6} ry={2.9} cy={-0.4} fill="url(#g-disc)" />
      <ellipse rx={2} ry={1.5} cy={-0.5} fill="#c9790f" opacity={0.55} />
    </g>
  );
}

function Marigold() {
  return (
    <g>
      <path d="M-5.5 3.5 C -3.5 8 3.5 8 5.5 3.5 C 2 5.2 -2 5.2 -5.5 3.5 Z" fill="#5f9e4d" />
      <g transform="scale(1 0.84)">
        <path d={MARIGOLD[0]} fill="#f7a640" />
        <path d={MARIGOLD[1]} fill="#f28d25" transform="translate(0 -1)" />
        <path d={MARIGOLD[2]} fill="#e5711a" transform="translate(0 -1.6)" />
      </g>
      <ellipse rx={2.4} ry={1.2} cx={-2.4} cy={-4.4} fill="#ffd38a" opacity={0.5} />
    </g>
  );
}

function Tulip() {
  return (
    <g>
      <path
        d="M-6.5 -2 C -8.5 -9 -7 -16 -3.2 -20 L 0 -16.5 L 3.2 -20 C 7 -16 8.5 -9 6.5 -2 C 4 1 -4 1 -6.5 -2 Z"
        fill="url(#g-tulip-back)"
      />
      <path d="M-6.8 -2.5 C -8.6 -9.5 -6.5 -16.5 -2.6 -19.5 C -0.5 -14 1.5 -7 1.2 0.6 C -2 1 -5 0 -6.8 -2.5 Z" fill="url(#g-tulip)" />
      <path d="M6.8 -2.5 C 8.6 -9.5 6.5 -16.5 2.6 -19.5 C 0.5 -14 -1.5 -7 -1.2 0.6 C 2 1 5 0 6.8 -2.5 Z" fill="url(#g-tulip)" opacity={0.92} />
      <path d="M-4.6 -4 C -5.8 -9 -4.8 -13.5 -2.9 -16" stroke="#fff" strokeOpacity={0.45} strokeWidth={0.9} strokeLinecap="round" fill="none" />
    </g>
  );
}

function Lavender() {
  return (
    <g>
      {range(10).map((k) => {
        const s = 1 - k * 0.055;
        const y = -k * 2.7;
        return (
          <g key={k} transform={`translate(0 ${f(y)})`}>
            <ellipse cx={-1.5 * s} rx={1.6 * s} ry={2.5 * s} transform={`rotate(-24 ${f(-1.5 * s)} 0)`} fill={k % 2 ? "url(#g-lav)" : "url(#g-lav-dark)"} />
            <ellipse cx={1.5 * s} rx={1.6 * s} ry={2.5 * s} transform={`rotate(24 ${f(1.5 * s)} 0)`} fill={k % 2 ? "url(#g-lav-dark)" : "url(#g-lav)"} />
          </g>
        );
      })}
      <ellipse cy={-28} rx={1.1} ry={1.9} fill="url(#g-lav)" />
    </g>
  );
}

const BREATH = range(6).map((i) => {
  const a = -70 + i * 28 + (i % 2) * 6;
  const len = 7 + (i % 3) * 2.5;
  const rad = (a * Math.PI) / 180;
  const ex = f(Math.sin(rad) * len);
  const ey = f(-Math.cos(rad) * len);
  return { ex, ey, dots: [[ex, ey], [f(ex * 0.6 + 1.6), f(ey * 0.6 - 0.8)], [f(ex * 1.1 - 1.2), f(ey * 1.1 - 1.4)]] };
});

function Breath() {
  return (
    <g>
      {BREATH.map((b, i) => (
        <path key={i} d={`M0 0 Q ${f(b.ex * 0.3)} ${f(b.ey * 0.6)} ${b.ex} ${b.ey}`} stroke="#86ba72" strokeWidth={0.6} fill="none" />
      ))}
      {BREATH.flatMap((b, i) =>
        b.dots.map(([x, y], j) => (
          <circle key={`${i}-${j}`} cx={x} cy={y} r={j === 0 ? 1.5 : 1.15} fill="#fffdf8" stroke="#e2ddd2" strokeWidth={0.35} />
        )),
      )}
    </g>
  );
}

function Head({ kind }: { kind: Kind }) {
  switch (kind) {
    case "daisy":
      return <Daisy petal="g-daisy" edge="#d3cadc" disc="g-disc" />;
    case "blossom":
      return <Daisy petal="g-blossom" edge="#efb21f" disc="g-disc-deep" />;
    case "cosmos":
      return <Cosmos />;
    case "marigold":
      return <Marigold />;
    case "tulip":
      return <Tulip />;
    case "lavender":
      return <Lavender />;
    case "breath":
      return <Breath />;
  }
}

function point(p: Plant, t: number) {
  const x0 = 0, y0 = 0;
  const x1 = p.bend * 0.2, y1 = -p.h * 0.35;
  const x2 = p.bend, y2 = -p.h * 0.65;
  const x3 = p.bend * 0.6, y3 = -p.h;
  const u = 1 - t;
  return {
    x: f(u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3),
    y: f(u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3),
  };
}

function PlantArt({ p, back }: { p: Plant; back: boolean }) {
  const top = point(p, 1);
  const basal = p.kind === "tulip" || p.kind === "lavender";
  const stem = `M0 0 C ${f(p.bend * 0.2)} ${f(-p.h * 0.35)}, ${p.bend} ${f(-p.h * 0.65)}, ${top.x} ${top.y}`;
  const budBase = point(p, 0.58);
  return (
    <>
      {p.leaves.map((leaf, i) => {
        const at = point(p, leaf.t);
        return (
          <g key={i} transform={`translate(${at.x} ${at.y}) scale(${leaf.side * leaf.size} ${leaf.size}) rotate(${leaf.angle})`}>
            <path d={basal ? LONG_LEAF : BROAD_LEAF} fill="url(#g-leaf)" />
            <path d={basal ? LONG_RIB : BROAD_RIB} stroke="#c4e4b0" strokeWidth={0.5} fill="none" opacity={0.7} />
          </g>
        );
      })}
      {p.bud && (
        <g>
          <path
            d={`M${budBase.x} ${budBase.y} Q ${f(budBase.x + 9)} ${f(budBase.y - 6)} ${f(budBase.x + 11)} ${f(budBase.y - 18)}`}
            stroke="url(#g-stem)"
            strokeWidth={1.3}
            fill="none"
            strokeLinecap="round"
          />
          <g transform={`translate(${f(budBase.x + 11)} ${f(budBase.y - 18)})`}>
            <path d="M0 0 C -2.4 -2 -2.4 -6 0 -8 C 2.4 -6 2.4 -2 0 0 Z" fill={p.kind === "cosmos" ? "#f3a3c4" : "#f7f2ea"} />
            <path d="M0 0.4 C -2.6 -0.8 -2.8 -3.6 -1.4 -5 L0 -2 L1.4 -5 C 2.8 -3.6 2.6 -0.8 0 0.4 Z" fill="#6aa557" />
          </g>
        </g>
      )}
      <path d={stem} stroke="url(#g-stem)" strokeWidth={back ? 1.7 : 2.3} fill="none" strokeLinecap="round" />
      <g transform={`translate(${top.x} ${top.y}) rotate(${p.kind === "lavender" ? f(p.tilt * 0.3) : p.tilt}) scale(${p.scale})`}>
        <Head kind={p.kind} />
      </g>
    </>
  );
}

function Defs() {
  const radial = (id: string, r: number, stops: [number, string][]) => (
    <radialGradient id={id} cx={0} cy={0} r={r} gradientUnits="userSpaceOnUse">
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </radialGradient>
  );
  const linear = (id: string, stops: [number, string][], vertical = true) => (
    <linearGradient id={id} x1={0} y1={1} x2={vertical ? 0 : 1} y2={0}>
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
  return (
    <defs>
      {radial("g-daisy", 14, [[0, "#e4dcee"], [0.35, "#f5f1fa"], [1, "#ffffff"]])}
      {radial("g-blossom", 14, [[0, "#ee9a0c"], [0.35, "#ffc634"], [1, "#ffe58c"]])}
      {radial("g-cosmos", 16, [[0, "#c94d84"], [0.28, "#e886b0"], [0.7, "#f7bcd4"], [1, "#fde3ed"]])}
      <radialGradient id="g-disc" cx="0.4" cy="0.35" r="0.7">
        <stop offset={0} stopColor="#ffe17a" />
        <stop offset={0.6} stopColor="#f5b72a" />
        <stop offset={1} stopColor="#d98c12" />
      </radialGradient>
      <radialGradient id="g-disc-deep" cx="0.4" cy="0.35" r="0.7">
        <stop offset={0} stopColor="#ffbe4a" />
        <stop offset={0.6} stopColor="#ee8a16" />
        <stop offset={1} stopColor="#c4620a" />
      </radialGradient>
      {linear("g-tulip", [[0, "#e46f57"], [1, "#fbb8a2"]])}
      {linear("g-tulip-back", [[0, "#cf5c46"], [1, "#ef9a84"]])}
      {linear("g-lav", [[0, "#a189e3"], [1, "#cdbdf6"]])}
      {linear("g-lav-dark", [[0, "#8a6fd4"], [1, "#b7a1ee"]])}
      {linear("g-leaf", [[0, "#5d9c4b"], [1, "#a2d488"]], false)}
      <linearGradient id="g-stem" x1={0} y1={0} x2={0} y2={-150} gradientUnits="userSpaceOnUse">
        <stop offset={0} stopColor="#5a9447" />
        <stop offset={1} stopColor="#8cc576" />
      </linearGradient>
      <linearGradient id="g-ground" x1={0} y1={0} x2={0} y2={1}>
        <stop offset={0} stopColor="#8fc074" stopOpacity={0} />
        <stop offset={1} stopColor="#8fc074" stopOpacity={0.24} />
      </linearGradient>
    </defs>
  );
}

function Layer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className={className}>
      {children}
    </svg>
  );
}

export function Garden() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const plantRefs = useRef<(SVGGElement | null)[]>([]);
  const [grown, setGrown] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let near = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setGrown(true);
      },
      { rootMargin: "0px 0px -20px 0px" },
    );
    io.observe(wrap);

    let frame = 0;
    let pointer: [number, number] | null = null;
    const update = () => {
      frame = 0;
      const r = wrap.getBoundingClientRect();
      const scale = Math.max(r.width / W, r.height / H);
      const offset = (r.width - W * scale) / 2;
      plantRefs.current.forEach((el, i) => {
        if (!el) return;
        let lean = 0;
        if (pointer) {
          const { p, back: isBack } = all[i];
          const px = r.left + offset + p.x * scale;
          const dx = px - pointer[0];
          const vertical = Math.max(0, 1 - Math.max(0, r.top - pointer[1]) / 160);
          const reach = Math.max(0, 1 - Math.abs(dx) / 140);
          lean = Math.sign(dx) * reach * vertical * (isBack ? 9 : 16);
        }
        el.style.setProperty("--lean", lean.toFixed(2));
      });
    };
    const onMove = (e: PointerEvent) => {
      if (!near) return;
      pointer = [e.clientX, e.clientY];
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onLeave = () => {
      pointer = null;
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const plantGroup = ({ p, back: isBack }: (typeof all)[number], i: number) => (
    <g key={i} transform={`translate(${p.x} ${H})`}>
      <g
        ref={(el) => {
          plantRefs.current[i] = el;
        }}
        className={styles.plant}
        style={{ "--delay": `${p.delay}ms`, "--sway": `${p.sway}s`, "--amp": isBack ? 1.6 : 2.6 } as CSSProperties}
      >
        <PlantArt p={p} back={isBack} />
      </g>
    </g>
  );

  return (
    <div
      ref={wrapRef}
      className={styles.garden}
      data-grown={grown || undefined}
      data-active={active || undefined}
      aria-hidden="true"
    >
      <Layer className={styles.layer}>
        <Defs />
        <rect x={0} y={H - 48} width={W} height={48} fill="url(#g-ground)" />
        <g className={styles.grass}>
          {backGrass.map((b, i) => (
            <path key={i} d={b.d} fill={b.fill} opacity={0.75} />
          ))}
        </g>
      </Layer>
      <Layer className={`${styles.layer} ${styles.backRow}`}>{all.slice(0, back.length).map(plantGroup)}</Layer>
      <Layer className={styles.layer}>{all.slice(back.length).map((entry, i) => plantGroup(entry, i + back.length))}</Layer>
      <Layer className={styles.layer}>
        <g className={styles.grass}>
          {frontGrass.map((b, i) => (
            <path key={i} d={b.d} fill={b.fill} />
          ))}
        </g>
      </Layer>
    </div>
  );
}

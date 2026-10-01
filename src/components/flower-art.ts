export const PETAL_COUNT = 13;

const PETAL_PATH =
  "M0 -9 C 4.2 -11 8.6 -22 8.2 -35 C 8 -41.5 5 -46.5 2.2 -46.5 Q 1 -46.5 0 -45 Q -1 -46.5 -2.2 -46.5 C -5 -46.5 -8 -41.5 -8.2 -35 C -8.6 -22 -4.2 -11 0 -9 Z";
const VEIN_PATH = "M0 -15 C 0.5 -24 0.5 -33 0 -41";

type Stops = [number, string][];

const PETAL_STOPS: Stops = [
  [0, "#e98a00"],
  [0.3, "#f8ae14"],
  [0.52, "#ffc935"],
  [0.86, "#ffdc66"],
  [1, "#ffe48a"],
];
const PETAL_ALT_STOPS: Stops = [
  [0, "#df7f00"],
  [0.3, "#f3a40f"],
  [0.52, "#fcbf2b"],
  [0.86, "#ffd659"],
  [1, "#ffdf7c"],
];
const SHADOW_STOPS: Stops = [
  [0.6, "rgba(165,80,0,0.4)"],
  [1, "rgba(165,80,0,0)"],
];
const DISC_STOPS: Stops = [
  [0, "#ffd05a"],
  [0.55, "#f29a17"],
  [1, "#c2620a"],
];

function hash(i: number, salt: number) {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

export const petals = Array.from({ length: PETAL_COUNT }, (_, i) => ({
  angle: r3((i * 360) / PETAL_COUNT + (hash(i, 1) - 0.5) * 7),
  sx: r3(0.9 + hash(i, 2) * 0.2),
  sy: r3(0.93 + hash(i, 3) * 0.1),
  alt: i % 2 === 1,
}));

const florets = Array.from({ length: 72 }, (_, n) => {
  const a = (n * 137.508 * Math.PI) / 180;
  const d = 1.42 * Math.sqrt(n + 0.6);
  return { x: r3(Math.cos(a) * d), y: r3(Math.sin(a) * d), r: r3(0.72 + (n / 72) * 0.5), outer: n > 30 };
});

const ids = (id: string) => ({ petal: `${id}p`, alt: `${id}q`, shadow: `${id}s`, disc: `${id}d` });

const stops = (list: Stops) =>
  list.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join("");

export function defsMarkup(id: string) {
  const g = ids(id);
  return (
    `<radialGradient id="${g.petal}" cx="0" cy="0" r="47" gradientUnits="userSpaceOnUse">${stops(PETAL_STOPS)}</radialGradient>` +
    `<radialGradient id="${g.alt}" cx="0" cy="0" r="47" gradientUnits="userSpaceOnUse">${stops(PETAL_ALT_STOPS)}</radialGradient>` +
    `<radialGradient id="${g.shadow}" cx="0" cy="0" r="19" gradientUnits="userSpaceOnUse">${stops(SHADOW_STOPS)}</radialGradient>` +
    `<radialGradient id="${g.disc}" cx="0.42" cy="0.38" r="0.65">${stops(DISC_STOPS)}</radialGradient>`
  );
}

export function petalMarkup(id: string, p: (typeof petals)[number]) {
  const g = ids(id);
  return (
    `<g transform="scale(${p.sx} ${p.sy})">` +
    `<path d="${PETAL_PATH}" fill="url(#${p.alt ? g.alt : g.petal})" stroke="#eba611" stroke-width="0.7" stroke-linejoin="round"/>` +
    `<path d="${VEIN_PATH}" fill="none" stroke="rgba(205,128,0,0.3)" stroke-width="0.8" stroke-linecap="round"/>` +
    `</g>`
  );
}

export function centerMarkup(id: string) {
  const g = ids(id);
  const dots = florets
    .map((f) =>
      f.outer
        ? `<circle cx="${f.x}" cy="${f.y}" r="${f.r}" fill="#ffd772" opacity="0.8"/>`
        : `<circle cx="${f.x}" cy="${f.y}" r="${f.r}" fill="#a85204" opacity="0.42"/>`,
    )
    .join("");
  return (
    `<circle r="19" fill="url(#${g.shadow})"/>` +
    `<circle r="13.6" fill="url(#${g.disc})"/>` +
    dots +
    `<ellipse cx="-4" cy="-5.5" rx="5.5" ry="3.4" transform="rotate(-32 -4 -5.5)" fill="#fff" opacity="0.2"/>`
  );
}

export function flowerInnerMarkup(id: string) {
  return (
    `<defs>${defsMarkup(id)}</defs>` +
    petals.map((p) => `<g transform="rotate(${p.angle})">${petalMarkup(id, p)}</g>`).join("") +
    centerMarkup(id)
  );
}

export function flowerSvg(id = "f") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">${flowerInnerMarkup(id)}</svg>`;
}

"use client";

import { memo, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { record } from "@/lib/activity";
import { ART, BACK, BASAL, FILL, FRONT, HEIGHT, PALETTES, type Species } from "./ascii-flowers";
import styles from "./AsciiGarden.module.css";

const COLS = 340;
const ROWS = 16;
const BASE = ROWS - 1;
const TICK = 50;
const REACH = 4;
const GLITCH = "!<>-_\\/[]{}=+*^?#%&";

const STEM = "#5a9447";
const LEAF = "#76b15a";
const GREENS = ["#5f9c4b", "#74ad5a", "#4f8a3d", "#86bd68", "#6aa152"];
const SPECKLES = ["#e0609a", "#e89f0c", "#9775de", "#4e88d8", "#ee7656"];

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = rng(5203);
const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];

type Plant = {
  x: number;
  h: number;
  species: Species;
  palette: number;
  back: boolean;
  delay: number;
  leaves: { row: number; side: -1 | 1; wide: boolean }[];
};

const fits = (species: Species, h: number) => h + ART[species].rows.length <= ROWS;
const halfWidth = (species: Species) => (ART[species].rows[0].length - 1) / 2;

function makePlant(x: number, species: Species, back: boolean): Plant {
  const [lo, hi] = HEIGHT[species];
  let h = int(lo, hi) + (back ? 2 : 0);
  while (!fits(species, h)) h--;
  const leaves: Plant["leaves"] = BASAL.includes(species)
    ? [
        { row: 0, side: -1, wide: true },
        { row: 0, side: 1, wide: true },
      ]
    : Array.from({ length: h > 3 ? 2 : 1 }, (_, i) => ({
        row: int(1, Math.max(1, h - 2)),
        side: (i % 2 ? -1 : 1) as -1 | 1,
        wide: false,
      }));
  return {
    x,
    h,
    species,
    palette: int(0, PALETTES[species].length - 1),
    back,
    delay: Math.round(Math.abs(x - COLS / 2) * 9 + random() * 260 + (back ? 180 : 0)),
    leaves,
  };
}

function row(kinds: Species[], back: boolean, start: number) {
  const out: Plant[] = [];
  let species = pick(kinds);
  for (let x = start; x < COLS - 4; ) {
    out.push(makePlant(x, species, back));
    const next = pick(kinds);
    x += Math.ceil(halfWidth(species)) + Math.ceil(halfWidth(next)) + int(2, back ? 6 : 4);
    species = next;
  }
  return out;
}

function bloomBox(p: Plant, margin = 2) {
  const reach = Math.ceil(halfWidth(p.species)) + margin;
  const bottom = BASE - p.h;
  const pad = margin > 1 ? 1 : 0;
  return { left: p.x - reach, right: p.x + reach, top: bottom - ART[p.species].rows.length + 1 - pad, bottom: bottom + pad };
}

const PLANTS = (() => {
  const back = row(BACK, true, 5);
  const front = row(FRONT, false, 3);
  const boxes = front.map(bloomBox);
  const overlaps = (a: ReturnType<typeof bloomBox>, b: ReturnType<typeof bloomBox>) =>
    a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
  const raised: Plant[] = [];
  for (const p of back) {
    const b = bloomBox(p);
    const below = boxes.filter((f) => b.left <= f.right && b.right >= f.left);
    const h = below.length ? Math.max(p.h, BASE - Math.min(...below.map((f) => f.top)) + 1) : p.h;
    if (!fits(p.species, h)) continue;
    const plant = { ...p, h };
    if (raised.some((q) => overlaps(bloomBox(q), bloomBox(plant)))) continue;
    raised.push(plant);
  }

  const placed = [...raised, ...front];
  const taken = placed.map((p) => bloomBox(p, 1));
  const fill: Plant[] = [];
  for (let x = 3; x < COLS - 3; x++) {
    const p = makePlant(x, pick(FILL), false);
    const b = bloomBox(p, 1);
    const gap = Math.ceil(halfWidth(p.species)) + 1;
    const clash = placed.some((q) => Math.abs(q.x - x) <= gap) || taken.some((t) => overlaps(t, b));
    if (clash) continue;
    fill.push(p);
    taken.push(b);
    x = b.right;
  }
  return [...raised, ...fill, ...front];
})();

const SPECIES = Object.keys(ART) as Species[];

type Cell = { ch: string; color: string; dim: boolean } | null;
type Run = { t: string; color?: string; dim?: boolean };
type Line = { sig: string; runs: Run[] };

const TUFTS: Cell[] = (() => {
  const cells: Cell[] = Array(COLS).fill(null);
  for (let c = 0; c < COLS; c++) {
    const r = random();
    if (r < 0.035) cells[c] = { ch: pick(["*", "o", "."]), color: pick(SPECKLES), dim: false };
    else if (r < 0.1 && c < COLS - 3) {
      [..."\\|/"].forEach((ch, i) => (cells[c + i] = { ch, color: pick(GREENS), dim: false }));
      c += 2;
    } else if (r < 0.42) cells[c] = { ch: pick([",", "'", '"', "\\", "/", "|", "v", "."]), color: pick(GREENS), dim: false };
  }
  for (const p of PLANTS) {
    for (let d = -2; d <= 2; d++) cells[p.x + d] = null;
  }
  return cells;
})();

function toRuns(cells: Cell[]): Run[] {
  const runs: Run[] = [];
  for (const cell of cells) {
    const last = runs[runs.length - 1];
    if (!cell) {
      if (last) last.t += " ";
      else runs.push({ t: " " });
    } else if (last && last.color === cell.color && last.dim === cell.dim) {
      last.t += cell.ch;
    } else {
      runs.push({ t: cell.ch, color: cell.color, dim: cell.dim });
    }
  }
  return runs;
}

const signature = (runs: Run[]) => runs.map((r) => `${r.color ?? ""}${r.dim ? "~" : ""}${r.t}`).join("|");

const GROUND: Run[] = toRuns(
  Array.from({ length: COLS }, () => ({
    ch: pick(["w", "w", "w", "W", "W", "v", "v", "V", ","]),
    color: pick(GREENS),
    dim: false,
  })),
);

type State = Plant & { lean: number; grown: number; glitch: number; glitchEnd: number };

const ROW_MS = 90;
const BLOOM_GLITCH_MS = 450;
const REGROW_GLITCH_MS = 650;

const initialStates = (grown: boolean): State[] =>
  PLANTS.map((p) => ({ ...p, lean: 0, grown: grown ? p.h + 1 : 0, glitch: 0, glitchEnd: 0 }));

function compose(states: State[]): Run[][] {
  const grid: Cell[][] = Array.from({ length: ROWS }, (_, r) => (r === BASE ? TUFTS.slice() : Array(COLS).fill(null)));
  const set = (r: number, c: number, ch: string, color: string, dim: boolean) => {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = { ch, color, dim };
  };
  const clearBehind = (r: number, c: number) => {
    if (grid[r]?.[c]?.dim) grid[r][c] = null;
  };

  for (const s of states) {
    const bend = Math.max(1, Math.floor(s.h * 0.55));
    const colAt = (i: number) => s.x + (i >= bend ? s.lean : 0);
    const stemRows = Math.min(s.h, Math.floor(s.grown));

    for (let i = 0; i < stemRows; i++) {
      const bent = s.lean !== 0 && i === bend;
      set(BASE - i, colAt(i), bent ? (s.lean > 0 ? "/" : "\\") : "|", STEM, s.back);
      for (const leaf of s.leaves) {
        if (leaf.row !== i || bent) continue;
        const ch = leaf.side < 0 ? "\\" : "/";
        set(BASE - i, colAt(i) + leaf.side, ch, LEAF, s.back);
        if (leaf.wide) set(BASE - i, colAt(i) + leaf.side * 2, ch, LEAF, s.back);
      }
    }

    if (s.grown <= s.h) continue;
    const art = ART[s.species];
    const pal = PALETTES[s.species][s.palette];
    const left = colAt(s.h - 1) - halfWidth(s.species);
    const top = BASE - s.h - (art.rows.length - 1);
    art.rows.forEach((line, j) => {
      if (!s.back) for (let i = -1; i <= line.length; i++) clearBehind(top + j, left + i);
      for (let i = 0; i < line.length; i++) {
        if (line[i] === " ") continue;
        const key = art.keys[j][i];
        const color =
          key === "s"
            ? STEM
            : key === "l"
              ? LEAF
              : key === "c"
              ? (pal.c ?? pal.p)
              : key === "d"
                ? (pal.d ?? pal.c ?? pal.p)
                : key === "q"
                  ? pal.q
                  : pal.p;
        const ch = s.glitch > (i * 5 + j * 3) % 8 ? GLITCH[Math.floor(Math.random() * GLITCH.length)] : line[i];
        set(top + j, left + i, ch, color, s.back);
      }
    });
  }

  return grid.map(toRuns);
}

const INITIAL: Line[] = compose(initialStates(false)).map((runs) => ({ sig: signature(runs), runs }));

const Row = memo(function Row({ runs }: { runs: Run[] }) {
  return (
    <div>
      {runs.map((run, i) =>
        run.color ? (
          <span key={i} style={{ color: run.color }} data-dim={run.dim || undefined}>
            {run.t}
          </span>
        ) : (
          run.t
        ),
      )}
    </div>
  );
});

export function AsciiGarden() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const states = useRef<State[]>(initialStates(false));
  const lines = useRef<Line[]>(INITIAL);
  const pointer = useRef<number | null>(null);
  const still = useRef(false);
  const [rows, setRows] = useState<Line[]>(INITIAL);

  const publish = () => {
    lines.current = compose(states.current).map((runs, i) => {
      const sig = signature(runs);
      const prev = lines.current[i];
      return prev && prev.sig === sig ? prev : { sig, runs };
    });
    setRows(lines.current);
  };

  const columnAt = (clientX: number) => {
    const art = artRef.current;
    if (!art) return 0;
    const r = art.getBoundingClientRect();
    return Math.round(((clientX - r.left) / r.width) * COLS);
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      still.current = true;
      states.current = initialStates(true);
      publish();
      return;
    }

    let timer = 0;
    let start = 0;
    let gust: number | null = null;
    let nextGust = 0;

    const view = () => {
      const w = wrap.getBoundingClientRect();
      return { left: columnAt(w.left), right: columnAt(w.right) };
    };

    const tick = () => {
      const now = performance.now();
      const elapsed = now - start;
      let dirty = false;

      if (gust === null && now > nextGust) gust = view().left - 2;
      if (gust !== null) {
        gust += 4;
        if (gust > view().right + 12) {
          gust = null;
          nextGust = now + 5000 + Math.random() * 5000;
        }
      }

      for (const s of states.current) {
        if (s.grown <= s.h) {
          const grown = Math.min(s.h + 1, Math.max(0, (elapsed - s.delay) / ROW_MS));
          if (grown > s.h) s.glitchEnd = now + BLOOM_GLITCH_MS;
          if (grown !== s.grown) dirty = true;
          s.grown = grown;
        }
        const glitch = Math.max(0, Math.ceil((s.glitchEnd - now) / (BLOOM_GLITCH_MS / 8)));
        if (glitch !== s.glitch || glitch > 0) dirty = true;
        s.glitch = glitch;
        let lean = 0;
        if (s.grown > s.h) {
          const p = pointer.current;
          if (p !== null && Math.abs(s.x - p) <= REACH) lean = s.x >= p ? 1 : -1;
          else if (gust !== null && s.x <= gust && s.x > gust - 14) lean = 1;
        }
        if (lean !== s.lean) {
          s.lean = lean;
          dirty = true;
        }
      }

      if (dirty) publish();
    };

    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (!entry.isIntersecting) return;
      if (!start) {
        start = performance.now();
        nextGust = start + 3500;
      }
      timer = window.setInterval(tick, TICK);
    });
    io.observe(wrap);

    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const onPointerMove = (e: PointerEvent) => {
    pointer.current = columnAt(e.clientX);
  };

  const onPointerLeave = () => {
    pointer.current = null;
  };

  const onClick = (e: MouseEvent) => {
    const col = columnAt(e.clientX);
    const target = states.current
      .filter((s) => s.grown > s.h && Math.abs(s.x - col) <= REACH)
      .sort((a, b) => Number(a.back) - Number(b.back) || Math.abs(a.x - col) - Math.abs(b.x - col))[0];
    if (!target) return;
    const room = halfWidth(target.species);
    const options = SPECIES.filter((sp) => sp !== target.species && fits(sp, target.h) && halfWidth(sp) <= room);
    if (!options.length) return;
    target.species = options[Math.floor(Math.random() * options.length)];
    target.palette = Math.floor(Math.random() * PALETTES[target.species].length);
    record(1, states.current.indexOf(target));
    if (still.current) publish();
    else target.glitchEnd = performance.now() + REGROW_GLITCH_MS;
  };

  return (
    <div
      ref={wrapRef}
      className={styles.garden}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      data-garden
      aria-hidden="true"
    >
      <div ref={artRef} className={styles.art}>
        {rows.map((line, i) => (
          <Row key={i} runs={line.runs} />
        ))}
        <Row runs={GROUND} />
      </div>
    </div>
  );
}

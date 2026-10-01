"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { send, subscribe, type Note, type Run, type Sprites } from "@/lib/activity";
import { Logo } from "./Logo";
import styles from "./Overlay.module.css";

type Mover = { x: number; base: number; vx: number; phase: number };
type Placed = { x: number; y: number; runs: Run[] };

const MIN_X = 2;
const MAX_X = 92;

const stillMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function arrange(spec: Sprites, movers: Mover[], now: number, still: boolean): Placed[] {
  return movers.map((m) => {
    const frames = m.vx >= 0 ? spec.r : spec.l;
    return {
      x: m.x,
      y: still ? m.base : m.base + Math.sin(now / 420 + m.phase) * 6,
      runs: frames[still ? 0 : Math.floor(now / 110) % frames.length],
    };
  });
}

export function Overlay() {
  const [active, setActive] = useState<{ spec: Sprites; host: Element } | null>(null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const movers = useRef<Mover[]>([]);
  const shown = useRef(false);
  const busy = useRef(false);

  useEffect(
    () =>
      subscribe((reply) => {
        if (!reply.o || shown.current) return;
        const host = document.querySelector(reply.o.q);
        if (!host) return;
        const spec = reply.o;
        shown.current = true;
        movers.current = Array.from({ length: spec.n }, (_, i) => ({
          x: MIN_X + ((i + 1) / (spec.n + 1)) * (MAX_X - MIN_X),
          base: 20 + (i % 3) * 12,
          vx: (i % 2 ? -1 : 1) * (3 + Math.random() * 1.5),
          phase: Math.random() * Math.PI * 2,
        }));
        setActive({ spec, host });
        setPlaced(arrange(spec, movers.current, performance.now(), stillMotion()));
      }),
    [],
  );

  useEffect(() => {
    if (!active || stillMotion()) return;
    const { spec } = active;
    let last = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (const m of movers.current) {
        m.x += m.vx * dt;
        if (m.x <= MIN_X) m.vx = Math.abs(m.vx);
        else if (m.x >= MAX_X) m.vx = -Math.abs(m.vx);
        else if (Math.random() < dt * 0.2) m.vx = -m.vx;
        m.x = Math.min(MAX_X, Math.max(MIN_X, m.x));
      }
      setPlaced(arrange(spec, movers.current, now, false));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const onPick = async (e: MouseEvent) => {
    e.stopPropagation();
    if (busy.current) return;
    busy.current = true;
    const reply = await send({ b: 1 });
    busy.current = false;
    if (!reply?.n) return;
    setActive(null);
    setPlaced([]);
    setNote(reply.n);
  };

  return (
    <>
      {active &&
        createPortal(
          <div className={styles.layer} style={active.spec.s as CSSProperties}>
            {placed.map((p, i) => (
              <span key={i} className={styles.sprite} style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={onPick}>
                {p.runs.map(([text, color], j) => (
                  <span key={j} style={{ color }}>
                    {text}
                  </span>
                ))}
              </span>
            ))}
          </div>,
          active.host,
        )}

      {note && (
        <div className={styles.card} role="dialog" aria-label={note.t}>
          <p className={styles.title}>{note.t}</p>
          <p className={styles.text}>{note.d}</p>
          {note.c && <p className={styles.code}>{note.c}</p>}
          <div className={styles.actions}>
            {note.h && (
              <a className="btn btn-primary" href={note.h} target="_blank" rel="noopener noreferrer">
                <Logo name="x" size={14} />
                {note.a}
              </a>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => setNote(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

type Listener = (t: number) => void;

let current = 0;
const listeners = new Set<Listener>();

export function setSky(t: number) {
  if (Math.abs(t - current) < 0.0005) return;
  current = t;
  listeners.forEach((listener) => listener(t));
}

export function onSky(listener: Listener) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

export const smoothstep = (from: number, to: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - from) / (to - from)));
  return x * x * (3 - 2 * x);
};

export const prefersStill = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

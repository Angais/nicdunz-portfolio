export type Run = [text: string, color: string];

export type Sprites = {
  q: string;
  s?: Record<string, string>;
  n: number;
  r: Run[][];
  l: Run[][];
};

export type Note = { t: string; d: string; c?: string; a?: string; h?: string };

export type Reply = { o?: Sprites; n?: Note };

type Entry = [time: number, kind: number, detail: number];

const FLUSH_MS = 1500;
const MAX_ENTRIES = 300;

const entries: Entry[] = [];
const listeners = new Set<(reply: Reply) => void>();
let timer = 0;
let sending = false;

export async function send(extra?: object): Promise<Reply | null> {
  try {
    const res = await fetch("/api/activity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ e: entries, ...extra }),
    });
    return res.status === 200 ? await res.json() : null;
  } catch {
    return null;
  }
}

async function flush() {
  if (sending) {
    timer = window.setTimeout(flush, FLUSH_MS);
    return;
  }
  sending = true;
  const reply = await send();
  sending = false;
  if (reply) listeners.forEach((listener) => listener(reply));
}

export function record(kind: number, detail = 0) {
  entries.push([Math.round(performance.now()), kind, detail]);
  if (entries.length > MAX_ENTRIES) entries.shift();
  window.clearTimeout(timer);
  timer = window.setTimeout(flush, FLUSH_MS);
}

export function subscribe(listener: (reply: Reply) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

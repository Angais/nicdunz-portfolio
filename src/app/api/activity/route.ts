import { randomInt } from "node:crypto";
import { profile } from "@/data/content";

// The easter egg lives entirely here so the browser bundle never says what triggers it or where it
// appears: the client only reports anonymous interaction events and renders whatever comes back.

const GARDEN = 1;
const SWAPS = 30;
const MAX_ENTRIES = 400;

const WING = "#a9c4e2";
const BODY = "#e9a40c";
const HEAD = "#3b2c1a";

const BEES = {
  q: "[data-garden]",
  s: { font: "600 clamp(10px, 0.94vw, 13.5px) / 1.1 var(--font-mono)" },
  n: 3,
  r: [
    [["^", WING], ["8", BODY], [">", HEAD]],
    [["v", WING], ["8", BODY], [">", HEAD]],
  ],
  l: [
    [["<", HEAD], ["8", BODY], ["^", WING]],
    [["<", HEAD], ["8", BODY], ["v", WING]],
  ],
};

const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const isTime = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const isSmallInt = (value: unknown) => Number.isInteger(value) && (value as number) >= 0 && (value as number) < 10_000;

function gardenSwaps(value: unknown): number | null {
  if (!Array.isArray(value) || value.length > MAX_ENTRIES) return null;
  let swaps = 0;
  for (const entry of value) {
    if (!Array.isArray(entry) || entry.length !== 3 || !isTime(entry[0]) || !isSmallInt(entry[1]) || !isSmallInt(entry[2])) {
      return null;
    }
    if (entry[1] === GARDEN) swaps++;
  }
  return swaps;
}

const chunk = () => Array.from({ length: 4 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");

function prize() {
  const title = "🐝 You found the easter egg!";
  if (process.env.EASTER_EGG_CLAIMED === "1") {
    return { t: title, d: "Someone already claimed the gift, but you still found it. Nice one." };
  }

  const code = `BEE-${chunk()}-${chunk()}`;
  console.info(`easter egg found: ${code}`);
  const dm = `🐝 I found the easter egg on your site! Code: ${code}`;
  return {
    t: title,
    d: "DM me this message on X. If you’re the first, you get a month of Claude Pro.",
    c: code,
    a: "Send me the DM",
    h: `${profile.dmUrl}&text=${encodeURIComponent(dm)}`,
  };
}

const nothing = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const swaps = gardenSwaps(body?.e);
  if (swaps === null || swaps < SWAPS) return nothing();
  return Response.json(body.b === undefined ? { o: BEES } : { n: prize() });
}

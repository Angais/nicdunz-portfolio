export type Species = "daisy" | "sunflower" | "rose" | "tulip" | "lavender" | "cornflower" | "breath" | "bud";
export type Palette = { p: string; q: string; c?: string; d?: string };

// keys: p/q petal shades, c center, d center ring, s stem, l leaf
export const ART: Record<Species, { rows: string[]; keys: string[] }> = {
  daisy: {
    rows: [String.raw`  \ | /  `, String.raw`'.\\|//.'`, "-==(@)==-", String.raw`.'//|\\'.`, String.raw`  / | \  `],
    keys: ["  p q p  ", "qqppqppqq", "qppdcdppq", "qqppqppqq", "  p q p  "],
  },
  sunflower: {
    rows: [String.raw`  \\ | //  `, "-=.(###).=-", "==(#####)==", "-='(###)'=-", String.raw`  // | \\  `],
    keys: ["  pp q pp  ", "qpqdcccdqpq", "ppdcccccdpp", "qpqdcccdqpq", "  pp q pp  "],
  },
  rose: {
    rows: [" ,@@@, ", "@@@@@@@", "'@@@@@'", "  '@'  "],
    keys: [" qpppq ", "pqpcpqp", "qpcccpq", "  qpq  "],
  },
  tulip: {
    rows: ["/\\/^\\/\\", "(@@@@@)", String.raw` \@@@/ `, String.raw`  \@/  `],
    keys: ["qqpppqq", "qpppppq", " qpppq ", "  qpq  "],
  },
  lavender: {
    rows: [" ' ", ",@,", "'@'", ",@,", "'@'", ",@,"],
    keys: [" q ", "qpq", "qpq", "qpq", "qpq", "qpq"],
  },
  cornflower: {
    rows: [String.raw` \:|:/ `, "-=(o)=-", String.raw` /:|:\ `],
    keys: [" qpqpq ", "qpdcdpq", " qpqpq "],
  },
  breath: {
    rows: [" *. .* ", String.raw`*.\|/.*`, String.raw`  \|/  `],
    keys: [" pq qp ", "pqsssqp", "  sss  "],
  },
  bud: {
    rows: [".o.", String.raw`\|/`],
    keys: ["qpq", "lsl"],
  },
};

export const PALETTES: Record<Species, Palette[]> = {
  daisy: [
    { p: "#e89f0c", q: "#f4bb31", c: "#9a4a0a", d: "#c0620c" },
    { p: "#e0609a", q: "#f297bf", c: "#b8560a", d: "#e3961a" },
    { p: "#ee7656", q: "#f6a084", c: "#9a3d0a", d: "#e9a10f" },
  ],
  sunflower: [{ p: "#efab00", q: "#f6c234", c: "#6b3410", d: "#4a230a" }],
  rose: [
    { p: "#dd4a63", q: "#ee7f92", c: "#a8243c" },
    { p: "#f39a2b", q: "#f7b866", c: "#c4560a" },
    { p: "#e9709f", q: "#f3a2c1", c: "#bf3f73" },
  ],
  tulip: [
    { p: "#ea5a40", q: "#c63b2b" },
    { p: "#ee75a4", q: "#cf4f86" },
    { p: "#f3b724", q: "#d8920a" },
    { p: "#9b72dd", q: "#7a52c4" },
  ],
  lavender: [{ p: "#8f6ad8", q: "#b9a0f0" }],
  cornflower: [{ p: "#4a83d6", q: "#82adec", c: "#203f8a", d: "#4a83d6" }],
  breath: [{ p: "#b39ae2", q: "#cdbcf0" }],
  bud: [
    { p: "#e0609a", q: "#f297bf" },
    { p: "#e89f0c", q: "#f4bb31" },
    { p: "#4a83d6", q: "#82adec" },
    { p: "#9b72dd", q: "#bfa3f2" },
    { p: "#ee7656", q: "#f6a084" },
  ],
};

export const HEIGHT: Record<Species, [number, number]> = {
  daisy: [2, 6],
  sunflower: [5, 8],
  rose: [2, 5],
  tulip: [2, 5],
  lavender: [2, 4],
  cornflower: [2, 5],
  breath: [2, 5],
  bud: [1, 3],
};

export const FRONT: Species[] = [
  "daisy", "daisy", "daisy", "daisy", "rose", "rose", "rose", "tulip", "tulip", "tulip",
  "cornflower", "cornflower", "breath", "breath", "lavender", "lavender", "sunflower",
];

export const BACK: Species[] = ["daisy", "daisy", "rose", "tulip", "lavender", "lavender", "breath", "cornflower"];

export const FILL: Species[] = ["bud", "bud", "bud", "breath"];

export const BASAL: Species[] = ["tulip", "lavender"];

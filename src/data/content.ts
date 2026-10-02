export const profile = {
  name: "Nicholas Dunzelman",
  short: "Nic",
  handle: "nicdunz",
  tagline: "AI, models & creative tech",
  url: "https://x.com/nicdunz",
  email: "nicdunz@gmail.com",
  github: "https://github.com/dicnunz",
  linkedin: "https://www.linkedin.com/in/nicdunz/",
  krea: "https://www.krea.ai",
  followUrl: "https://x.com/intent/follow?screen_name=nicdunz",
  dmUrl: "https://x.com/messages/compose?recipient_id=1640521359640993798",
  followers: "14.4K",
};

export const postUrl = (id: string) => `https://x.com/${profile.handle}/status/${id}`;

type Media =
  | { kind: "video"; src: string; poster: string }
  | { kind: "photo"; src: string; width: number; height: number; alt: string }
  | { kind: "article"; cover: string; title: string; preview: string }
  | { kind: "quote" };

export type Post = {
  id: string;
  date: string;
  text: string;
  mark?: string;
  where?: string;
  media: Media;
};

export const highlights = {
  price: {
    id: "2082884002201878824",
    date: "2026-07-30",
    text: "Roughly four months later, OpenAI is selling March’s full flagship intelligence at about one-thirteenth the token price.",
    mark: "one-thirteenth the token price",
    media: { kind: "quote" },
  },
  altman: {
    id: "2051843991495397753",
    date: "2026-05-05",
    text: "it happened",
    where: "At the GPT-5.5 Party",
    media: {
      kind: "photo",
      src: "/media/happened.jpg",
      width: 1536,
      height: 2048,
      alt: "Nic and Sam Altman taking a selfie at the GPT-5.5 Party",
    },
  },
  voxel: {
    id: "1990816436931932444",
    date: "2025-11-18",
    text: "voxel toy box powered by gemini 3",
    media: { kind: "video", src: "/media/voxel.mp4", poster: "/media/voxel.webp" },
  },
  hallOfFame: {
    id: "2078856693983609259",
    date: "2026-07-19",
    text: "People have used GPT to help blind people understand images, teach an agent to explore Minecraft, prove theorems, control robots, and build entire games.\n\nI went looking for the best work. I found 48.\n\nThe GPT Hall of Fame.",
    media: { kind: "video", src: "/media/hof.mp4", poster: "/media/hof.webp" },
  },
  math: {
    id: "2077799400475136352",
    date: "2026-07-16",
    text: "",
    media: {
      kind: "article",
      cover: "/media/article.jpg",
      title: "I Asked GPT-5.6 Pro to Solve an Open Math Problem. It Did.",
      preview:
        "I wanted to test a very specific claim about frontier AI: not whether it could ace a contest problem, but whether it could help push a real open question to a checkable answer.",
    },
  },
} satisfies Record<string, Post>;

export type Project = { name: string; blurb: string; url: string; tag: string };

export const projects: Project[] = [
  {
    name: "Codex Sessions",
    blurb: "Run a fleet of local Codex sessions on macOS, with locks and a Telegram bridge",
    url: "https://github.com/dicnunz/codex-sessions",
    tag: "Agents",
  },
  {
    name: "Krea Tools",
    blurb: "A community Krea plugin for Codex: images, video and LoRAs",
    url: "https://github.com/dicnunz/krea-tools",
    tag: "Krea",
  },
];

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

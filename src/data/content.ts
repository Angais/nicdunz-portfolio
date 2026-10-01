export const profile = {
  name: "Angel",
  handle: "Angaisb_",
  url: "https://x.com/Angaisb_",
  github: "https://github.com/Angais",
  email: "angaisbx@gmail.com",
  followUrl: "https://x.com/intent/follow?screen_name=Angaisb_",
  dmUrl: "https://x.com/messages/compose?recipient_id=1565897247115644930",
  followers: "13.9K",
};

export const about = {
  name: "Ángel",
  age: 20,
  country: "Spain",
  studies: ["IT Systems & Networking", "Web Development"],
};

export const postUrl = (id: string) => `https://x.com/${profile.handle}/status/${id}`;

type VideoMedia = { kind: "video"; src: string; poster: string };
type ArticleMedia = { kind: "article"; cover: string; title: string; preview: string };

export type Post = {
  id: string;
  date: string;
  text: string;
  likes: number;
  replies: number;
  tags: string[];
  media: VideoMedia | ArticleMedia;
};

export const featuredPost: Post = {
  id: "2095964361105789424",
  date: "2026-09-04",
  text: "I asked GPT-6 Astra to make a portfolio inside a console similar to a Gameboy and LOOK AT THIS\n\nIt's so so so good, a huge jump from GPT-5.6",
  likes: 8671,
  replies: 104,
  tags: ["GPT-6 Astra"],
  media: { kind: "video", src: "/media/gameboy.mp4", poster: "/media/gameboy.webp" },
};

export const latestPost: Post = {
  id: "2104253151037808885",
  date: "2026-09-27",
  text: "I asked Opus 5.5 to make a video about its Unciv match against GPT-6 Astra\n\nIt dug through 3.7 GB of logs, notes and screenshots and came back with a 15-minute documentary\n\nI'm speechless",
  likes: 332,
  replies: 33,
  tags: ["Opus 5.5", "Unciv"],
  media: { kind: "video", src: "/media/unciv.mp4", poster: "/media/unciv.webp" },
};

export const highlights: Post[] = [
  {
    id: "2029635731585372598",
    date: "2026-03-05",
    text: "GPT-5.4, it's basically perfect (it took it around 24 minutes)\n\nYeah, Minecraft is pretty much solved, I have to find a new test now",
    likes: 3045,
    replies: 124,
    tags: ["GPT-5.4", "Minecraft"],
    media: { kind: "video", src: "/media/gpt54.mp4", poster: "/media/gpt54.webp" },
  },
  {
    id: "2099461833388065018",
    date: "2026-09-14",
    text: "I found the old Gemini 3.1 Pro SVG demo from February and was curious to see how it would compare to GPT-6 Astra\n\n7 months of progress",
    likes: 2560,
    replies: 60,
    tags: ["Gemini 3.1 Pro", "GPT-6 Astra"],
    media: { kind: "video", src: "/media/svg.mp4", poster: "/media/svg.webp" },
  },
  {
    id: "2091206049587961917",
    date: "2026-08-22",
    text: "I asked Codex to design its own CPU and then write a Space Invaders-style game for it in assembly and after a while working on it this is the result\n\nNow the real question is... can it run Minecraft?",
    likes: 1585,
    replies: 70,
    tags: ["Codex"],
    media: { kind: "video", src: "/media/cpu.mp4", poster: "/media/cpu.webp" },
  },
  {
    id: "2036362334902325577",
    date: "2026-03-24",
    text: "GPT-5.4 (xhigh) in Codex worked for almost 5 minutes but it did collect some wood",
    likes: 1297,
    replies: 27,
    tags: ["GPT-5.4", "Minecraft"],
    media: { kind: "video", src: "/media/wood.mp4", poster: "/media/wood.webp" },
  },
  {
    id: "2044796326160826615",
    date: "2026-04-16",
    text: "I tried Opus 4.7 (xhigh) with my Minecraft prompt\n\nIt's a very ambitious and creative model, but it feels unreliable\n\nIt even added mobs and ore generation, but most things were broken and it couldn't fix some",
    likes: 385,
    replies: 28,
    tags: ["Opus 4.7"],
    media: { kind: "video", src: "/media/opus47.mp4", poster: "/media/opus47.webp" },
  },
  {
    id: "2046666389734179018",
    date: "2026-04-21",
    text: "",
    likes: 237,
    replies: 11,
    tags: ["GPT Image 2"],
    media: {
      kind: "article",
      cover: "/media/article.webp",
      title: "What I’ve Learned Using GPT Image 2",
      preview:
        "GPT Image 2 is the best image model out right now. It's really smart, creative, and handles complex prompts well.",
    },
  },
];

type Brand = { name: string; url: string };

export const credits: { label: string; brands: Brand[]; more?: boolean }[] = [
  {
    label: "Early access",
    brands: [
      { name: "OpenAI", url: "https://openai.com" },
      { name: "Ideogram", url: "https://ideogram.ai" },
    ],
    more: true,
  },
  {
    label: "Paid collabs",
    brands: [
      { name: "Veed", url: "https://www.veed.io" },
      { name: "Adaptive AI", url: "https://adaptive.ai" },
    ],
  },
  {
    label: "Product feedback",
    brands: [
      { name: "Cursor", url: "https://cursor.com" },
      { name: "Krea", url: "https://www.krea.ai" },
    ],
    more: true,
  },
];

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export const formatCount = (n: number) => n.toLocaleString("en-US");

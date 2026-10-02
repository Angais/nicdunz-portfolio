import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/data/content";

export const alt = `${profile.name}: ${profile.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [sky, avatar, serif, sans] = await Promise.all([
    readFile(join(process.cwd(), "src", "assets", "og-sky.jpg")),
    readFile(join(process.cwd(), "public", "avatar.jpg")),
    readFile(join(process.cwd(), "src", "assets", "InstrumentSerif-Regular.ttf")),
    readFile(join(process.cwd(), "src", "assets", "InstrumentSans-Medium.ttf")),
  ]);
  const dataUrl = (buf: Buffer) => `data:image/jpeg;base64,${buf.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          color: "#fff",
        }}
      >
        <img src={dataUrl(sky)} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0 }} />
        <img
          src={dataUrl(avatar)}
          alt=""
          width={150}
          height={150}
          style={{ borderRadius: 999, border: "5px solid rgba(255,255,255,0.45)" }}
        />
        <span
          style={{
            marginTop: 30,
            fontFamily: "Instrument Serif",
            fontSize: 112,
            lineHeight: 1,
            letterSpacing: -3,
            textShadow: "0 4px 40px rgba(20,30,90,0.35)",
          }}
        >
          {profile.name}
        </span>
        <span style={{ marginTop: 22, fontFamily: "Instrument Sans", fontSize: 30, opacity: 0.92 }}>
          {profile.tagline} · Community Lead at Krea
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, weight: 400, style: "normal" },
        { name: "Instrument Sans", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}

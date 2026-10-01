import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { flowerSvg } from "@/components/flower-art";
import { profile } from "@/data/content";

export const alt = "Angel 🌼, AI news and opinions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [banner, avatar, fraunces, geist] = await Promise.all([
    readFile(join(process.cwd(), "public", "banner.jpg")),
    readFile(join(process.cwd(), "public", "avatar.jpg")),
    readFile(join(process.cwd(), "src", "assets", "Fraunces-Medium.ttf")),
    readFile(join(process.cwd(), "src", "assets", "Geist-Medium.ttf")),
  ]);
  const dataUrl = (buf: Buffer) => `data:image/jpeg;base64,${buf.toString("base64")}`;
  const flower = `data:image/svg+xml;base64,${Buffer.from(flowerSvg("og")).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#faf8f3",
          padding: 44,
          position: "relative",
        }}
      >
        { }
        <img
          src={dataUrl(banner)}
          alt=""
          width={1112}
          height={371}
          style={{ borderRadius: 30, objectFit: "cover" }}
        />
        { }
        <img
          src={dataUrl(avatar)}
          alt=""
          width={160}
          height={160}
          style={{
            position: "absolute",
            left: 84,
            top: 44 + 371 - 80,
            borderRadius: 999,
            border: "8px solid #faf8f3",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 236,
            marginTop: 26,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontFamily: "Fraunces", fontSize: 76, letterSpacing: -3, lineHeight: 1, color: "#1c1a17" }}>
              {profile.name}
            </span>
            <img src={flower} alt="" width={60} height={60} />
          </div>
          <span style={{ fontFamily: "Geist", fontSize: 28, color: "#8a8478", marginTop: 12 }}>
            @{profile.handle} · AI news, opinions & model tests
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 500, style: "normal" },
        { name: "Geist", data: geist, weight: 500, style: "normal" },
      ],
    },
  );
}

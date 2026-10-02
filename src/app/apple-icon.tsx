import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  // iOS rounds the corners itself, so the tile is drawn square.
  const svg = (await readFile(join(process.cwd(), "src", "app", "icon.svg"), "utf8")).replace('rx="16"', 'rx="0"');

  return new ImageResponse(
    <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={180} height={180} alt="" />,
    size,
  );
}

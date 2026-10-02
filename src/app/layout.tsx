import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { profile } from "@/data/content";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const description = "AI, models & creative tech. Community Lead at Krea, computer science at Florida Tech.";

export const metadata: Metadata = {
  title: `${profile.name} · AI, models & creative tech`,
  description,
  openGraph: {
    title: profile.name,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: `@${profile.handle}`,
    title: profile.name,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#4a8cec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

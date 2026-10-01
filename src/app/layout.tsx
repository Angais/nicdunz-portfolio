import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono, Pixelify_Sans } from "next/font/google";
import { profile } from "@/data/content";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
});

const siteUrl = "https://angaisb.com";

const description =
  "I post AI news, opinions, and hands-on tests of new models. Usually by asking them to build something way too ambitious.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${profile.name} 🌼 · AI news and opinions`,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${profile.name} 🌼`,
    description,
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    creator: `@${profile.handle}`,
    title: `${profile.name} 🌼`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} ${geistMono.variable} ${pixelify.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

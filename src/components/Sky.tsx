"use client";

import Image, { getImageProps, type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { onSky, prefersStill, setSky, smoothstep } from "@/lib/sky";
import { DAY_PREVIEW } from "@/lib/skyPreview";
import { createSkyRenderer, ZOOM, type SkyRenderer } from "@/lib/skyRenderer";
import day from "../../public/sky/day.jpg";
import dusk from "../../public/sky/dusk.jpg";
import night from "../../public/sky/night.jpg";
import sunset from "../../public/sky/sunset.jpg";
import { NightSky } from "./NightSky";
import styles from "./Sky.module.css";

// Each plate is the same sky, same clouds, later in the evening. They fade in on top of each other.
const LATER: { src: StaticImageData; from: number; to: number }[] = [
  { src: sunset, from: 0.04, to: 0.24 },
  { src: dusk, from: 0.26, to: 0.46 },
  { src: night, from: 0.56, to: 0.78 },
];

// The plates are 16:9 and always cover the viewport, so tall screens need wider files.
const SIZES = "max(100vw, 178vh)";

type Anchor = [scroll: number, time: number];

function measure(): Anchor[] {
  const vh = window.innerHeight;
  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  const anchors: Anchor[] = [[0, 0]];
  document.querySelectorAll<HTMLElement>("[data-sky]").forEach((el) => {
    const y = el.getBoundingClientRect().top + window.scrollY - vh * 0.6;
    anchors.push([Math.min(max, Math.max(0, y)), Number(el.dataset.sky)]);
  });
  anchors.push([max, 1]);
  return anchors.sort((a, b) => a[0] - b[0]);
}

function timeAt(anchors: Anchor[], y: number) {
  for (let i = 1; i < anchors.length; i++) {
    const [y1, t1] = anchors[i];
    if (y > y1) continue;
    const [y0, t0] = anchors[i - 1];
    return y1 === y0 ? t1 : t0 + ((y - y0) / (y1 - y0)) * (t1 - t0);
  }
  return 1;
}

function plateUrl(src: StaticImageData) {
  const { props } = getImageProps({ src, alt: "", fill: true, sizes: SIZES, quality: 90 });
  const options = (props.srcSet ?? "").split(", ").map((entry) => {
    const [url, width] = entry.trim().split(" ");
    return { url, width: parseInt(width, 10) };
  });
  const needed = Math.max(window.innerWidth, (window.innerHeight * 16) / 9) * Math.min(2, window.devicePixelRatio) * ZOOM;
  return (options.find(({ width }) => width >= needed) ?? options[options.length - 1])?.url ?? props.src;
}

const phasesAt = (t: number) => LATER.map(({ from, to }) => smoothstep(from, to, t)) as [number, number, number];

export function Sky() {
  const base = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const [mode, setMode] = useState<"pending" | "gl" | "dom">("pending");

  useEffect(() => {
    let anchors = measure();
    let frame = 0;
    const update = () => {
      frame = 0;
      setSky(timeAt(anchors, window.scrollY));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      anchors = measure();
      schedule();
    };
    const resize = new ResizeObserver(remeasure);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    update();
    const unsubscribe = onSky((t) => {
      document.documentElement.dataset.phase = t > 0.36 ? "night" : "day";
    });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let cancelled = false;
    let renderer: SkyRenderer | undefined;
    let unsubscribe = () => {};
    const fallback = () => !cancelled && setMode("dom");

    const dayImg = base.current?.querySelector("img");
    const plates = [dayImg?.currentSrc || plateUrl(day), ...LATER.map(({ src }) => plateUrl(src))];
    createSkyRenderer(el, { plates, flow: "/sky/flow.png", still: prefersStill(), onLost: fallback })
      .then((r) => {
        if (cancelled) return r.dispose();
        renderer = r;
        unsubscribe = onSky((t) => r.setPhases(...phasesAt(t)));
        setMode("gl");
      })
      .catch(fallback);

    return () => {
      cancelled = true;
      unsubscribe();
      renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    if (mode !== "dom") return;
    return onSky((t) => {
      phasesAt(t).forEach((opacity, i) => {
        const layer = layers.current[i];
        if (layer) layer.style.opacity = String(opacity);
      });
    });
  }, [mode]);

  return (
    <div className={styles.sky} aria-hidden="true">
      <div ref={base} className={styles.layer}>
        <div className={styles.preview} style={{ backgroundImage: `url(${DAY_PREVIEW})` }} />
        <Image src={day} alt="" fill preload quality={90} sizes={SIZES} draggable={false} />
      </div>
      {mode === "dom" &&
        LATER.map(({ src }, i) => (
          <div
            key={src.src}
            ref={(el) => {
              layers.current[i] = el;
            }}
            className={styles.layer}
            style={{ opacity: 0 }}
          >
            <Image src={src} alt="" fill quality={90} sizes={SIZES} draggable={false} />
          </div>
        ))}
      <canvas ref={canvas} className={styles.gl} data-ready={mode === "gl" || undefined} />
      <NightSky className={styles.night} />
    </div>
  );
}

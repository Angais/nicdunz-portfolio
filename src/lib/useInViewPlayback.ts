"use client";

import { useEffect, type RefObject } from "react";

export function useInViewPlayback(ref: RefObject<HTMLVideoElement | null>, key?: string) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Buffer everything once the page itself has loaded, so videos never visibly load as you scroll.
    const warm = () => {
      video.preload = "auto";
    };
    if (document.readyState === "complete") warm();
    else window.addEventListener("load", warm, { once: true });

    // Starting well before the video scrolls in means it's already buffered and moving when it appears.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      window.removeEventListener("load", warm);
    };
  }, [ref, key]);
}

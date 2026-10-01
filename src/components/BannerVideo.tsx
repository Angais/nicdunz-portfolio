"use client";

import { useEffect, useRef } from "react";
import { useFirstFrame } from "@/lib/useFirstFrame";
import { useInViewPlayback } from "@/lib/useInViewPlayback";

const SOURCES = { small: "/banner-loop-1200.mp4", large: "/banner-loop-2400.mp4" };
const SPEED = 0.75;

export function BannerVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.defaultPlaybackRate = SPEED;
    video.playbackRate = SPEED;
    video.src = window.matchMedia("(max-width: 700px)").matches ? SOURCES.small : SOURCES.large;
  }, []);
  const ready = useFirstFrame(ref);
  useInViewPlayback(ref);

  return (
    <video
      ref={ref}
      className={className}
      data-ready={ready || undefined}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

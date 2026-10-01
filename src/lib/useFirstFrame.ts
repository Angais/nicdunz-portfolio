"use client";

import { useEffect, useState, type RefObject } from "react";

export function useFirstFrame(ref: RefObject<HTMLVideoElement | null>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reveal = () => setReady(true);
    if (typeof video.requestVideoFrameCallback === "function") {
      const id = video.requestVideoFrameCallback(reveal);
      return () => video.cancelVideoFrameCallback(id);
    }
    video.addEventListener("playing", reveal, { once: true });
    return () => video.removeEventListener("playing", reveal);
  }, [ref]);

  return ready;
}

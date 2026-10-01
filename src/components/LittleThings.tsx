"use client";

import { useEffect } from "react";
import { profile } from "@/data/content";

export function LittleThings() {
  useEffect(() => {
    const title = document.title;
    const onVisibility = () => {
      document.title = document.hidden ? "Still waiting for AGI…" : title;
    };
    document.addEventListener("visibilitychange", onVisibility);

    console.log(
      "%c🌼 hi, curious one",
      "font: 600 15px ui-serif, Georgia, serif; color: #d9578f",
      `\nnow that you're here, follow me. it's free → ${profile.url}`,
    );

    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}

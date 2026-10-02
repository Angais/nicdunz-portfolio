"use client";

import { useEffect } from "react";
import { profile } from "@/data/content";

export function LittleThings() {
  useEffect(() => {
    console.log(
      "%c☀︎ hi from Florida",
      "font: italic 18px 'Instrument Serif', Georgia, serif; color: #f2689a",
      `\nscroll to the bottom and wait for nightfall. then click the sky.\nsay hi → ${profile.url}`,
    );
  }, []);

  return null;
}

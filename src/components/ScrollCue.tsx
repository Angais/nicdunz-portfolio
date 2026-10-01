"use client";

import { useEffect, useState } from "react";
import { defsMarkup, petalMarkup, petals } from "./flower-art";
import styles from "./ScrollCue.module.css";

const petalSvg = `<defs>${defsMarkup("cue")}</defs>${petalMarkup("cue", petals[0])}`;

export function ScrollCue({ to }: { to: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heading = document.querySelector(`#${to} h2`);
    if (!heading) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(heading.getBoundingClientRect().top > window.innerHeight);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [to]);

  return (
    <a
      href={`#${to}`}
      className={styles.cue}
      data-visible={visible || undefined}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
    >
      <span className={styles.label}>Scroll</span>
      <span className={styles.track}>
        <svg
          className={styles.petal}
          viewBox="-10 -48 20 40"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: petalSvg }}
        />
      </span>
    </a>
  );
}

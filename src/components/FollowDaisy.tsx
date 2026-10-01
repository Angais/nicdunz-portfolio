"use client";

import { useState } from "react";
import { profile } from "@/data/content";
import { PluckableFlower } from "./Flower";
import { PETAL_COUNT } from "./flower-art";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

function messageFor(count: number) {
  if (count === 0) return "pluck a petal";
  if (count === PETAL_COUNT) return "follow me. it was meant to be";
  return count % 2 ? "follow me…" : "follow me not…";
}

export function FollowDaisy() {
  const [count, setCount] = useState(0);
  const done = count === PETAL_COUNT;

  return (
    <div className={styles.stack} data-done={done || undefined}>
      <PluckableFlower className={styles.flower} onPluck={setCount} regrowDelay={3600} />

      <p key={count} className={styles.message} aria-live="polite">
        {messageFor(count)}
      </p>

      <h2 className={styles.big}>
        Now that you’re here, follow me. <em>It’s free.</em>
      </h2>

      <div className={styles.actions}>
        <a className={`btn btn-primary ${styles.follow}`} href={profile.followUrl} target="_blank" rel="noopener noreferrer">
          <Logo name="x" size={14} />
          Follow @{profile.handle}
        </a>
        <a className="btn btn-ghost" href={profile.dmUrl} target="_blank" rel="noopener noreferrer">
          Message me
        </a>
        <a className="btn btn-ghost" href={profile.github} target="_blank" rel="noopener noreferrer">
          <Logo name="github" size={16} />
          GitHub
        </a>
      </div>
    </div>
  );
}

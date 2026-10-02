import { profile } from "@/data/content";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.inner}>
        <Avatar name={profile.name} />

        <h1 className={styles.name}>{profile.name}</h1>

        <p className={styles.tagline}>
          {profile.tagline}
          <span className={styles.dot} aria-hidden="true" />
          Community Lead at{" "}
          <a className={styles.krea} href={profile.krea} target="_blank" rel="noopener noreferrer">
            <Logo name="krea" size={15} />
            Krea
          </a>
        </p>

        <div className={styles.actions}>
          <a className="btn btn-light" href={profile.followUrl} target="_blank" rel="noopener noreferrer">
            <Logo name="x" size={14} />
            Follow
            <span className={styles.count}>{profile.followers}</span>
          </a>
          <a className="btn btn-glass btn-icon" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Logo name="github" size={18} />
          </a>
          <a className="btn btn-glass btn-icon" href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Logo name="linkedin" size={17} />
          </a>
        </div>
      </div>

      <a href="#highlights" className={styles.cue} aria-label="Scroll down">
        <svg viewBox="0 0 40 24" width="40" height="24" aria-hidden="true">
          <defs>
            <clipPath id="cue-horizon">
              <rect width="40" height="17" />
            </clipPath>
          </defs>
          <g clipPath="url(#cue-horizon)">
            <circle className={styles.cueSun} cx="20" cy="12" r="6" />
          </g>
          <path d="M4 17h32" />
        </svg>
      </a>
    </section>
  );
}

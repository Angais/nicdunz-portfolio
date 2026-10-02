import { profile } from "@/data/content";
import { Logo } from "./Logo";
import styles from "./About.module.css";

export function About() {
  return (
    <section id="about" className="container section" data-sky="0.4">
      <div className="section-head">
        <h2 className="section-title">About</h2>
      </div>

      <p className={styles.bio}>
        I’m Nic, 20, from Florida. I’m the Community Lead at{" "}
        <a className={styles.krea} href={profile.krea} target="_blank" rel="noopener noreferrer">
          <Logo name="krea" size={26} />
          Krea
        </a>
        , I study computer science at Florida Tech, and I spend the rest of my time trying new models and posting what I find.
      </p>

      <div className={styles.links}>
        <a className="btn btn-glass" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          <Logo name="linkedin" size={16} />
          LinkedIn
        </a>
        <a className="btn btn-glass" href={profile.github} target="_blank" rel="noopener noreferrer">
          <Logo name="github" size={17} />
          GitHub
        </a>
      </div>
    </section>
  );
}

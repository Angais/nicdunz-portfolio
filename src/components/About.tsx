import { about, profile } from "@/data/content";
import { CopyEmail } from "./AboutBits";
import styles from "./About.module.css";

export function About() {
  const [first, second] = about.studies;

  return (
    <section id="about" className="container section">
      <div className="section-head">
        <h2 className="section-title">
          About <em>me</em>
        </h2>
      </div>

      <p className={styles.bio}>
        I’m <strong>{about.name}</strong>, a <strong>{about.age}-year-old</strong> from{" "}
        <strong className={styles.spain}>{about.country}</strong>. I studied <strong>{first}</strong> and{" "}
        <strong>{second}</strong>, and now I put new AI models to the test.
      </p>

      <div className={styles.contact}>
        <CopyEmail email={profile.email} />
      </div>
    </section>
  );
}

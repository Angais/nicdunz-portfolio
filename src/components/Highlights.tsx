import { highlights, profile } from "@/data/content";
import { ArrowUpRight } from "./icons";
import { PostCard } from "./PostCard";
import styles from "./Highlights.module.css";

export function Highlights() {
  return (
    <section id="highlights" className="container section" data-sky="0.04">
      <div className="section-head">
        <h2 className="section-title">Highlights</h2>
        <a className="text-link" href={profile.url} target="_blank" rel="noopener noreferrer">
          More on X <ArrowUpRight />
        </a>
      </div>

      <div className={styles.grid}>
        <PostCard post={highlights.price} className={styles.price} />
        <PostCard post={highlights.altman} className={styles.altman} />
        <PostCard post={highlights.voxel} className={styles.voxel} />
        <PostCard post={highlights.hallOfFame} className={styles.hof} />
        <PostCard post={highlights.math} className={styles.math} />
      </div>
    </section>
  );
}

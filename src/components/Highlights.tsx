import { featuredPost, highlights, latestPost, profile } from "@/data/content";
import { ArrowUpRight } from "./icons";
import { PostCard } from "./PostCard";
import styles from "./Highlights.module.css";

export function Highlights() {
  return (
    <section id="highlights" className="container section">
      <div className="section-head">
        <h2 className="section-title">Highlights</h2>
        <a className="text-link" href={profile.url} target="_blank" rel="noopener noreferrer">
          More on X <ArrowUpRight />
        </a>
      </div>

      <PostCard post={featuredPost} featured />

      <div className={styles.grid}>
        {highlights.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div className={styles.closer}>
        <PostCard post={latestPost} featured flipped />
      </div>
    </section>
  );
}

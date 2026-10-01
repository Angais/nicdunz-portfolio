import { credits, profile } from "@/data/content";
import { ArrowUpRight } from "./icons";
import { SkyShader } from "./SkyShader";
import styles from "./WorkedWith.module.css";

export function WorkedWith() {
  return (
    <section id="work" className="container section">
      <div className="section-head">
        <h2 className="section-title">
          Worked <em>with</em>
        </h2>
      </div>

      <ul className={styles.credits}>
        {credits.map((group) => (
          <li key={group.label} className={styles.row}>
            <span className={styles.label}>{group.label}</span>
            <span className={styles.brands}>
              {group.brands.map((brand) => (
                <a
                  key={brand.name}
                  className={styles.brand}
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {brand.name}
                  <span className={styles.arrow} aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </a>
              ))}
              {group.more && <span className={styles.more}>and more</span>}
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.cta}>
        <SkyShader className={styles.sky} />
        <div className={styles.ctaCopy}>
          <h3 className={styles.ctaTitle}>Building something in AI?</h3>
          <p className={styles.ctaText}>
            I’m up for early access, honest feedback, or a paid collab.
          </p>
        </div>
        <a className="btn btn-primary" href={profile.dmUrl} target="_blank" rel="noopener noreferrer">
          Message me on X
        </a>
      </div>
    </section>
  );
}

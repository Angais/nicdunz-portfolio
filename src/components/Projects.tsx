import { profile, projects } from "@/data/content";
import { ArrowUpRight } from "./icons";
import styles from "./Projects.module.css";

export function Projects() {
  return (
    <section id="projects" className="container section" data-sky="0.68">
      <div className="section-head">
        <h2 className="section-title">Projects</h2>
        <a className="text-link" href={profile.github} target="_blank" rel="noopener noreferrer">
          GitHub <ArrowUpRight />
        </a>
      </div>

      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.name}>
            <a className={styles.row} href={project.url} target="_blank" rel="noopener noreferrer">
              <span className={styles.name}>
                <span className={styles.star} aria-hidden="true">
                  ✦
                </span>
                {project.name}
              </span>
              <span className={styles.blurb}>{project.blurb}</span>
              <span className={styles.tag}>{project.tag}</span>
              <span className={styles.arrow} aria-hidden="true">
                <ArrowUpRight size={16} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

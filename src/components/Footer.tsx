import { profile } from "@/data/content";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} data-sky="1">
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <nav className={styles.socials} aria-label="Elsewhere">
          <a href={profile.url} target="_blank" rel="noopener noreferrer" aria-label="X">
            <Logo name="x" size={15} />
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Logo name="github" size={17} />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Logo name="linkedin" size={16} />
          </a>
        </nav>
      </div>
    </footer>
  );
}

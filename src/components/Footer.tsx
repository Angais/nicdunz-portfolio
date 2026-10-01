import { AsciiGarden } from "./AsciiGarden";
import { FollowDaisy } from "./FollowDaisy";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <FollowDaisy />
      </div>
      <AsciiGarden />
    </footer>
  );
}

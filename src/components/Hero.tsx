import Image from "next/image";
import { profile } from "@/data/content";
import banner from "../../public/banner.jpg";
import frame from "./BannerFrame.module.css";
import { BannerVideo } from "./BannerVideo";
import { PluckableFlower } from "./Flower";
import { Logo } from "./Logo";
import { ScrollCue } from "./ScrollCue";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bannerWrap}>
        <div className={`${styles.glow} ${frame.frame}`} aria-hidden="true" />
        <div className={`${styles.banner} ${frame.frame}`}>
          <Image
            src={banner}
            alt="“AI News and Opinions” spelled out in flowers above a field by the sea"
            fill
            preload
            draggable={false}
            sizes="(max-width: 1184px) 100vw, 1120px"
          />
          <BannerVideo className={styles.bannerVideo} />
        </div>
      </div>

      <div className={styles.identity}>
        <div className={styles.avatar}>
          <Image
            src="/avatar.jpg"
            alt="Angel"
            width={1024}
            height={1024}
            preload
            draggable={false}
            quality={90}
            sizes="(max-width: 640px) 90px, 250px"
          />
        </div>
        <div className={styles.actions}>
          <a className="btn btn-ghost" href="#work">
            Work with me
          </a>
          <a className="btn btn-primary" href={profile.followUrl} target="_blank" rel="noopener noreferrer">
            <Logo name="x" size={14} />
            Follow
            <span className={styles.count}>{profile.followers}</span>
          </a>
        </div>
      </div>

      <h1 id="hero-name" className={styles.name}>
        {profile.name}
        <PluckableFlower className={styles.flower} regrowDelay={1600} />
      </h1>
      <p className={styles.handle}>@{profile.handle}</p>

      <p className={styles.tagline}>
        I post AI news, opinions, and hands-on tests of new models. Usually by asking them to build
        something <em>way too ambitious.</em>
      </p>

      <ScrollCue to="highlights" />
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { profile } from "@/data/content";
import { Flower } from "./Flower";
import { Logo } from "./Logo";
import styles from "./Header.module.css";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    const name = document.getElementById("hero-name");
    const io = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    if (name) io.observe(name);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.brand} data-past={pastHero || undefined}>
          <span className={styles.mark}>
            <span className={styles.daisy}>
              <Flower size={26} />
            </span>
            <Image className={styles.avatar} src="/avatar.jpg" alt="" width={26} height={26} draggable={false} />
          </span>
          {profile.name}
        </a>

        <nav className={styles.nav} aria-label="Sections">
          <a href="#highlights">Highlights</a>
          <a href="#about">About</a>
          <a href="#work">Work with me</a>
        </nav>

        <div className={styles.socials}>
          <a
            className={`${styles.social} ${styles.github}`}
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Angel on GitHub"
          >
            <Logo name="github" size={17} />
          </a>
          <a
            className={styles.social}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`@${profile.handle} on X`}
          >
            <Logo name="x" size={15} />
          </a>
        </div>
      </div>
    </header>
  );
}

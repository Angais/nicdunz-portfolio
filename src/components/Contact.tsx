"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/content";
import { Check, Copy } from "./icons";
import { Logo } from "./Logo";
import styles from "./Contact.module.css";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      window.location.href = `mailto:${profile.email}`;
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="contact" className="container section" data-sky="0.86">
      <div className="section-head">
        <h2 className="section-title">Contact</h2>
      </div>

      <a className={styles.email} href={`mailto:${profile.email}`}>
        {profile.email}
      </a>

      <div className={styles.links}>
        <button type="button" className={`btn btn-light ${styles.copy}`} onClick={copy} data-copied={copied || undefined}>
          <span aria-hidden={copied}>
            <Copy />
            Copy email
          </span>
          <span aria-hidden={!copied}>
            <Check />
            Copied
          </span>
        </button>
        <a className="btn btn-glass" href={profile.dmUrl} target="_blank" rel="noopener noreferrer">
          <Logo name="x" size={14} />
          Message me
        </a>
      </div>
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Email copied" : ""}
      </span>
    </section>
  );
}

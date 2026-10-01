"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Mail } from "./icons";
import styles from "./About.module.css";

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    if (!(await writeClipboard(email))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={styles.email}>
      <a className={styles.address} href={`mailto:${email}`}>
        <Mail />
        {email}
      </a>
      <button
        type="button"
        className={styles.copy}
        onClick={copy}
        data-copied={copied || undefined}
        aria-label="Copy email"
      >
        <span className={styles.copyIcon}>
          <Copy />
        </span>
        <span className={styles.checkIcon}>
          <Check />
        </span>
        <span className={styles.tip} aria-hidden="true">
          {copied ? "Copied" : "Copy"}
        </span>
      </button>
      <span className="visually-hidden" role="status">
        {copied ? "Email copied" : ""}
      </span>
    </div>
  );
}
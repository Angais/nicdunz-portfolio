"use client";

import Image from "next/image";
import { useRef } from "react";
import { formatDate, postUrl, type Post } from "@/data/content";
import { useFirstFrame } from "@/lib/useFirstFrame";
import { useInViewPlayback } from "@/lib/useInViewPlayback";
import { ArrowUpRight } from "./icons";
import { Logo } from "./Logo";
import styles from "./PostCard.module.css";

function Video({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const ready = useFirstFrame(ref);
  useInViewPlayback(ref);

  return (
    <div className={styles.media}>
      <Image src={poster} alt="" fill unoptimized draggable={false} />
      <video ref={ref} src={src} data-ready={ready || undefined} muted loop playsInline preload="none" aria-hidden="true" />
    </div>
  );
}

function Text({ text, mark }: { text: string; mark?: string }) {
  if (!mark || !text.includes(mark)) return text;
  const [before, after] = text.split(mark);
  return (
    <>
      {before}
      <mark className={styles.mark}>{mark}</mark>
      {after}
    </>
  );
}

function Meta({ date }: { date: string }) {
  return (
    <div className={styles.meta}>
      <Logo name="x" size={12} />
      <time dateTime={date}>{formatDate(date)}</time>
      <span className={styles.open} aria-hidden="true">
        <ArrowUpRight size={15} />
      </span>
    </div>
  );
}

export function PostCard({ post, className = "" }: { post: Post; className?: string }) {
  const { media } = post;

  return (
    <a
      href={postUrl(post.id)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.card} ${className}`}
      data-kind={media.kind}
      data-card
      draggable={false}
    >
      {media.kind === "photo" && (
        <>
          <Image
            className={styles.photo}
            src={media.src}
            alt={media.alt}
            fill
            sizes="(max-width: 860px) 100vw, 460px"
            draggable={false}
          />
          <div className={styles.caption}>
            {post.where && <span className={styles.kicker}>{post.where}</span>}
            <p className={styles.said}>{post.text}</p>
            <Meta date={post.date} />
          </div>
        </>
      )}

      {media.kind === "video" && (
        <>
          <Video src={media.src} poster={media.poster} />
          <div className={styles.body}>
            <p className={styles.text}>{post.text}</p>
            <Meta date={post.date} />
          </div>
        </>
      )}

      {media.kind === "article" && (
        <>
          <div className={styles.media} data-cover>
            <Image src={media.cover} alt="" fill sizes="(max-width: 860px) 100vw, 560px" draggable={false} />
          </div>
          <div className={styles.body}>
            <span className={styles.kicker}>Article</span>
            <h3 className={styles.title}>{media.title}</h3>
            <p className={styles.preview}>{media.preview}</p>
            <Meta date={post.date} />
          </div>
        </>
      )}

      {media.kind === "quote" && (
        <div className={styles.body}>
          <p className={styles.quote}>
            <Text text={post.text} mark={post.mark} />
          </p>
          <Meta date={post.date} />
        </div>
      )}
    </a>
  );
}

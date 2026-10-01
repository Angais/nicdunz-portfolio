"use client";

import Image from "next/image";
import { useRef } from "react";
import { formatCount, formatDate, postUrl, type Post } from "@/data/content";
import { useInViewPlayback } from "@/lib/useInViewPlayback";
import { ArrowUpRight, Heart, Reply } from "./icons";
import styles from "./PostCard.module.css";

type Props = {
  post: Post;
  featured?: boolean;
  flipped?: boolean;
};

export function PostCard({ post, featured = false, flipped = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useInViewPlayback(videoRef);
  const { media } = post;

  return (
    <a
      href={postUrl(post.id)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      draggable={false}
      data-featured={featured || undefined}
      data-flipped={flipped || undefined}
    >
      <div className={styles.media} data-kind={media.kind}>
        {media.kind === "video" ? (
          <video
            ref={videoRef}
            src={media.src}
            poster={media.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
        ) : (
          <Image src={media.cover} alt="" fill draggable={false} sizes="(max-width: 900px) 100vw, 360px" />
        )}
      </div>

      <div className={styles.body}>
        {media.kind === "article" ? (
          <>
            <span className={styles.kicker}>Article</span>
            <h3 className={styles.title}>{media.title}</h3>
            <p className={styles.text}>{media.preview}</p>
          </>
        ) : (
          <p className={styles.text}>{post.text}</p>
        )}

        <div className={styles.meta}>
          <ul className={styles.tags}>
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <div className={styles.stats}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className={styles.likes}>
              <Heart /> {formatCount(post.likes)}
            </span>
            <span className={styles.replies}>
              <Reply /> {formatCount(post.replies)}
            </span>
          </div>
        </div>
      </div>

      <span className={styles.open} aria-hidden="true">
        <ArrowUpRight size={16} />
      </span>
      <span className="visually-hidden">View on X</span>
    </a>
  );
}

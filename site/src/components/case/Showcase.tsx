"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/icons/Icon";
import type { Img } from "@/content/case-schema";
import styles from "./CaseStudy.module.css";

// The hero exhibit: one framed screen at a time, advancing on its own like the live pages
// (paused on hover or focus, and not at all under reduced motion). Arrows, the arrow keys
// and a swipe step through the screens; stepping by hand stops the auto-advance.
type Labels = { show: string; prev: string; next: string };

export function Showcase({ images, label, labels, caption }: { images: Img[]; label: string; labels: Labels; caption?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = (step: number) => {
    setManual(true);
    setIndex((i) => (i + step + count) % count);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };

  useEffect(() => {
    if (images.length < 2 || paused || manual) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % images.length), 5200);
    return () => window.clearInterval(id);
  }, [images.length, paused, manual]);

  if (!images.length) return null;
  return (
    <figure
      className={styles.showcase}
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={count > 1 ? onKey : undefined}
    >
      <div
        className={styles.showFrame}
        style={{ aspectRatio: `${images[0].width} / ${images[0].height}`, ["--ratio" as string]: images[0].width / images[0].height }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || count < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="(max-width: 960px) 94vw, 60vw"
            className={styles.showImage}
            data-active={i === index || undefined}
            aria-hidden={i !== index}
          />
        ))}
        {count > 1 && (
          <>
            <button type="button" className={`${styles.arrow} ${styles.arrowPrev}`} aria-label={labels.prev} onClick={() => go(-1)}>
              <span className={styles.arrowIcon}>
                <Icon name="chevron-left" size={22} />
              </span>
            </button>
            <button type="button" className={`${styles.arrow} ${styles.arrowNext}`} aria-label={labels.next} onClick={() => go(1)}>
              <span className={styles.arrowIcon}>
                <Icon name="chevron-right" size={22} />
              </span>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className={styles.dots}>
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              className={styles.dot}
              aria-label={`${labels.show} ${i + 1} / ${images.length}`}
              aria-current={i === index || undefined}
              onClick={() => {
                setManual(true);
                setIndex(i);
              }}
            />
          ))}
        </div>
      )}
      {caption && <figcaption className={styles.showCaption}>{caption}</figcaption>}
    </figure>
  );
}

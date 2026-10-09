"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Img } from "@/content/case-schema";
import styles from "./CaseStudy.module.css";

// The hero exhibit: one framed screen at a time, advancing on its own like the live pages
// (paused on hover or focus, and not at all under reduced motion).
export function Showcase({ images, label, show, caption }: { images: Img[]; label: string; show: string; caption?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % images.length), 5200);
    return () => window.clearInterval(id);
  }, [images.length, paused]);

  if (!images.length) return null;
  return (
    <figure
      className={styles.showcase}
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className={styles.showFrame}
        style={{ aspectRatio: `${images[0].width} / ${images[0].height}`, ["--ratio" as string]: images[0].width / images[0].height }}
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
      </div>
      {images.length > 1 && (
        <div className={styles.dots}>
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              className={styles.dot}
              aria-label={`${show} ${i + 1} / ${images.length}`}
              aria-current={i === index || undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
      {caption && <figcaption className={styles.showCaption}>{caption}</figcaption>}
    </figure>
  );
}

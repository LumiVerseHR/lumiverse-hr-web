"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import { workIndex } from "@/content/work";
import s from "./sections.module.css";
import styles from "./WorkIndex.module.css";

type Copy = { title: string; lede: string; open: string };

// A list you read, with a framed preview that follows whichever row has hover or focus.
export function WorkIndex({ lang, copy }: { lang: Locale; copy: Copy }) {
  const [active, setActive] = useState(0);
  const current = workIndex[active];

  return (
    <section className={s.section} aria-labelledby="index-title">
      <div className={`${s.inner} ${styles.layout}`}>
        <div>
          <header className={s.head}>
            <h2 id="index-title" className={s.title}>{copy.title}</h2>
            <p className={s.lede}>{copy.lede}</p>
          </header>
          <ol className={styles.list}>
            {workIndex.map((item, i) => (
              <li key={item.slug}>
                <a
                  href={localePath(lang, `/${item.slug}`)}
                  className={styles.row}
                  data-active={i === active || undefined}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.fact}>{item.fact[lang]}</span>
                  <span className={styles.kind}>{item.kind[lang]}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
        <figure className={styles.preview} aria-hidden>
          <div className={styles.frame}>
            {workIndex.map((item, i) => (
              <Image
                key={item.slug}
                src={item.image}
                alt=""
                fill
                sizes="40vw"
                className={styles.shot}
                data-active={i === active || undefined}
              />
            ))}
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.captionName}>{current.name}</span>
            <span>{current.kind[lang]}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

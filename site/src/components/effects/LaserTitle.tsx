"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LaserTitle.module.css";

// The LumiVerse dot writes the title: a coral beam from the logo's dot traces each letter
// in turn and burns it in. Works from the text alone, so any title gets it.
// The letters are the real heading text (inline spans read as normal words), so search and
// screen readers get the title once; reduced motion shows it at once and never cycles.

type Spark = { x: number; y: number; vx: number; vy: number; life: number };

const PER_CHAR_MS = 46;
const MIN_MS = 700;
const MAX_MS = 1800;
const ERASE_PER_CHAR_MS = 32;
const ERASE_MIN_MS = 420;
// The title changes this long after an exhibit settles, so the two lasers never fire at once.
const SWAP_DELAY_MS = 900;

type Pass = { erase?: boolean; onDone: () => void };

// One pass of the beam over `chars`: writing burns each letter in left to right; erasing
// sweeps back right to left and burns each letter out.
function run(chars: HTMLElement[], canvas: HTMLCanvasElement, { erase, onDone }: Pass) {
  const origin = document.querySelector<HTMLElement>("[data-laser-origin]");
  const ctx = canvas.getContext("2d");
  if (!chars.length || !ctx) {
    onDone();
    return () => {};
  }
  if (erase) chars = [...chars].reverse();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const perChar = erase ? ERASE_PER_CHAR_MS : PER_CHAR_MS;
  const total = Math.min(MAX_MS, Math.max(erase ? ERASE_MIN_MS : MIN_MS, chars.length * perChar));
  const step = total / chars.length;
  for (const c of chars) c.style.setProperty("--burn", `${Math.max(140, step * 2.2)}ms`);
  origin?.setAttribute("data-firing", "");

  const sparks: Spark[] = [];
  let lit = 0;
  let start = 0;
  let last = 0;
  let raf = 0;
  let fade = 1;

  const tick = (now: number) => {
    start ||= now;
    const dt = Math.min(48, now - (last || now));
    last = now;
    const t = now - start;
    const i = Math.min(chars.length - 1, Math.floor(t / step));
    while (lit <= i && lit < chars.length) chars[lit++].dataset[erase ? "out" : "lit"] = "";

    const done = t >= total;
    if (done) fade = Math.max(0, fade - dt / 220);

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const o = origin?.getBoundingClientRect();
    const box = chars[i].getBoundingClientRect();
    const local = Math.min(1, (t - i * step) / step);
    // A writing head: sweeps left to right across the glyph, zigzagging top to bottom.
    const across = done ? 1 : local;
    const hx = box.left + box.width * (erase ? 1 - across : across);
    const zig = Math.abs(((local * 5) % 2) - 1);
    const hy = box.top + box.height * (0.22 + 0.56 * zig);

    if (o && fade > 0) {
      const ox = o.left + o.width / 2;
      const oy = o.top + o.height / 2;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgba(255, 77, 77, ${0.28 * fade})`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 190, 170, ${0.9 * fade})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 26);
      glow.addColorStop(0, `rgba(255, 240, 225, ${fade})`);
      glow.addColorStop(0.25, `rgba(255, 110, 90, ${0.8 * fade})`);
      glow.addColorStop(1, "rgba(255, 77, 77, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(hx, hy, 26, 0, Math.PI * 2);
      ctx.fill();
      if (!done) {
        for (let k = 0; k < 3; k++) {
          const a = Math.random() * Math.PI * 2;
          const v = 0.06 + Math.random() * 0.22;
          sparks.push({ x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.08, life: 1 });
        }
      }
    }
    for (let k = sparks.length - 1; k >= 0; k--) {
      const s = sparks[k];
      s.life -= dt / 380;
      if (s.life <= 0) {
        sparks.splice(k, 1);
        continue;
      }
      s.vy += 0.0006 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      ctx.fillStyle = `rgba(255, ${150 + 80 * s.life}, ${110 * s.life}, ${s.life})`;
      ctx.fillRect(s.x, s.y, 1.8, 1.8);
    }
    ctx.globalCompositeOperation = "source-over";

    if (done && fade <= 0 && sparks.length === 0) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      origin?.removeAttribute("data-firing");
      window.removeEventListener("resize", resize);
      onDone();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    origin?.removeAttribute("data-firing");
  };
}

// How much of a line two titles share from the start; only the rest is erased and rewritten.
const keepOf = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};
const glyphs = (line: string) => line.replace(/ /g, "");

// `variants` are alternative titles, variants[0] being `text`. Each time an exhibit settles
// (lv:exhibit-hold, detail = exhibit index) the laser erases only what differs from that
// exhibit's title, line by line from the first changed letter, and writes the new letters in place.
export function LaserTitle({ text, variants }: { text: string; variants?: string[] }) {
  const root = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // keep[li]: letters of line li carried over from the previous title; fresh: new letters await the beam.
  const [shown, setShown] = useState({ v: 0, keep: [] as number[], fresh: false });
  const stopPass = useRef<() => void>(() => {});

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const written = () => {
      el.dataset.done = "";
      window.dispatchEvent(new Event("lv:title-written"));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      written();
      return;
    }
    let alive = true;
    // Wait for the face, or the letter boxes are measured in the fallback font.
    document.fonts.ready.then(() => {
      if (alive) stopPass.current = run([...el.querySelectorAll<HTMLElement>("[data-c]")], cv, { onDone: written });
    });
    return () => {
      alive = false;
      stopPass.current();
    };
  }, [text]);

  // Erase what the next title does not share, then let React mount the new letters unlit.
  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!variants || !el || !cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let current = 0;
    let busy = false;
    const onHold = (e: Event) => {
      const next = (e as CustomEvent<number>).detail % variants.length;
      if (next === current || busy || !("done" in el.dataset)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        busy = true;
        const from = variants[current].split("\n").map(glyphs);
        const to = variants[next].split("\n").map(glyphs);
        const keep = to.map((line, li) => keepOf(from[li] ?? "", line));
        const doomed = [...el.querySelectorAll<HTMLElement>("[data-line]")].flatMap((line, li) =>
          [...line.querySelectorAll<HTMLElement>("[data-c]")].slice(keep[li] ?? 0),
        );
        stopPass.current = run(doomed, cv, {
          erase: true,
          onDone: () => {
            current = next;
            busy = false;
            setShown({ v: next, keep, fresh: true });
          },
        });
      }, SWAP_DELAY_MS);
    };
    window.addEventListener("lv:exhibit-hold", onHold);
    return () => {
      window.removeEventListener("lv:exhibit-hold", onHold);
      window.clearTimeout(timer);
    };
  }, [variants]);

  // The new letters are in the DOM: write them.
  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!shown.fresh || !el || !cv) return;
    stopPass.current = run([...el.querySelectorAll<HTMLElement>("[data-fresh]")], cv, {
      onDone: () => setShown((s) => ({ ...s, fresh: false })),
    });
    return () => stopPass.current();
  }, [shown]);

  const lines = (variants?.[shown.v] ?? text).split("\n");
  return (
    <>
      <span ref={root} className={styles.laser}>
        {lines.map((line, li) => {
          const keep = shown.keep[li] ?? Infinity;
          let ci = 0;
          return (
            <span key={li} data-line>
              {line.split(" ").map((word, wi, words) => (
                <span key={wi}>
                  <span className={styles.word}>
                    {[...word].map((ch) => {
                      const i = ci++;
                      const isNew = i >= keep;
                      // New letters get new keys, so they mount fresh instead of reusing an erased span.
                      return (
                        <span key={isNew ? `${shown.v}-${i}` : i} data-c data-fresh={(shown.fresh && isNew) || undefined}>
                          {ch}
                        </span>
                      );
                    })}
                  </span>
                  {wi < words.length - 1 && " "}
                </span>
              ))}
              {/* The space keeps words apart in the heading's text; the break sets the line. */}
              {li < lines.length - 1 && (
                <>
                  {" "}
                  <br />
                </>
              )}
            </span>
          );
        })}
      </span>
      <canvas ref={canvas} className={styles.canvas} aria-hidden />
    </>
  );
}

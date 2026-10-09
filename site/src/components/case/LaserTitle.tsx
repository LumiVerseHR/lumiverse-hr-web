"use client";

import { useEffect, useRef } from "react";
import styles from "./LaserTitle.module.css";

// The LumiVerse dot writes the title: a coral beam from the logo's dot traces each letter
// in turn and burns it in. Works from the text alone, so any title gets it.
// The letters are the real heading text (inline spans read as normal words), so search and
// screen readers get the title once; reduced motion shows it at once.

type Spark = { x: number; y: number; vx: number; vy: number; life: number };

const PER_CHAR_MS = 46;
const MIN_MS = 700;
const MAX_MS = 1800;

function run(root: HTMLElement, canvas: HTMLCanvasElement) {
  const chars = [...root.querySelectorAll<HTMLElement>("[data-c]")];
  const origin = document.querySelector<HTMLElement>("[data-laser-origin]");
  const ctx = canvas.getContext("2d");
  if (!chars.length || !ctx) {
    root.dataset.done = "";
    return () => {};
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const total = Math.min(MAX_MS, Math.max(MIN_MS, chars.length * PER_CHAR_MS));
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
    while (lit <= i && lit < chars.length) chars[lit++].dataset.lit = "";

    const done = t >= total;
    if (done) fade = Math.max(0, fade - dt / 220);

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const o = origin?.getBoundingClientRect();
    const box = chars[i].getBoundingClientRect();
    const local = Math.min(1, (t - i * step) / step);
    // A writing head: sweeps left to right across the glyph, zigzagging top to bottom.
    const hx = box.left + box.width * (done ? 1 : local);
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
      root.dataset.done = "";
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

export function LaserTitle({ text }: { text: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.done = "";
      return;
    }
    let stop = () => {};
    let alive = true;
    // Wait for the face, or the letter boxes are measured in the fallback font.
    document.fonts.ready.then(() => {
      if (alive) stop = run(el, cv);
    });
    return () => {
      alive = false;
      stop();
    };
  }, [text]);

  const lines = text.split("\n");
  return (
    <>
      <span ref={root} className={styles.laser}>
        {lines.map((line, li) => (
          <span key={li}>
            {line.split(" ").map((word, wi, words) => (
              <span key={wi}>
                <span className={styles.word}>
                  {[...word].map((ch, ci) => (
                    <span key={ci} data-c>
                      {ch}
                    </span>
                  ))}
                </span>
                {wi < words.length - 1 && " "}
              </span>
            ))}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </span>
      <canvas ref={canvas} className={styles.canvas} aria-hidden />
    </>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { buildProducts, type Region } from "@/content/hero-build";
import type { Locale } from "@/i18n/config";
import styles from "./HeroBuild.module.css";

// Idea to shipped, in 2D: a framed exhibit where the laser sketches a real product's layout,
// the sheet turns blueprint, then wireframe, then the real screenshot wipes in. Then the
// next product. Plays after the headline is written; reduced motion shows the screenshot.

type Stage = "sketch" | "blueprint" | "wireframe" | "shipped";
const STAGES: Stage[] = ["sketch", "blueprint", "wireframe", "shipped"];
const TIMING = { sketch: 1700, blueprint: 900, wireframe: 900, shipped: 4600 };

// A region as a path: boxes are rectangles, text runs are one hand-drawn scribble line.
function regionPath(r: Region) {
  if (r.kind === "box") return `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}Z`;
  const y = r.y + r.h / 2;
  const segs = Math.max(2, Math.round(r.w / 90));
  let d = `M${r.x} ${y}`;
  for (let i = 1; i <= segs; i++) d += ` L${r.x + (r.w * i) / segs} ${y + (i % 2 ? -r.h * 0.12 : r.h * 0.12)}`;
  return d;
}

type Copy = { stages: Record<Stage, string> };

export function HeroBuild({ lang, copy }: { lang: Locale; copy: Copy }) {
  const [product, setProduct] = useState(0);
  const [stage, setStage] = useState<Stage>("sketch");
  const [playing, setPlaying] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const firstRun = useRef(true);
  const p = buildProducts[product];

  // Start once the headline has been laser-written (or after a fallback delay).
  // Under reduced motion it jumps straight to the shipped product instead.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = () => (reduced ? setStage("shipped") : setPlaying(true));
    window.addEventListener("lv:title-written", go, { once: true });
    const fallback = window.setTimeout(go, 2600);
    return () => {
      window.removeEventListener("lv:title-written", go);
      window.clearTimeout(fallback);
    };
  }, []);

  // The stage machine: sketch -> blueprint -> wireframe -> shipped -> next product.
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      const next = STAGES.indexOf(stage) + 1;
      if (next < STAGES.length) {
        setStage(STAGES[next]);
      } else {
        firstRun.current = false;
        setProduct((i) => (i + 1) % buildProducts.length);
        setStage("sketch");
      }
    }, TIMING[stage]);
    return () => window.clearTimeout(id);
  }, [playing, stage]);

  // During the sketch the pen travels each path in turn; on the first run the beam
  // from the logo dot follows it, like the headline's laser.
  useEffect(() => {
    if (!playing || stage !== "sketch") return;
    const root = svg.current;
    const cv = canvas.current;
    if (!root) return;
    const paths = [...root.querySelectorAll<SVGPathElement>("[data-sketch]")];
    const lengths = paths.map((el) => el.getTotalLength());
    const total = lengths.reduce((a, b) => a + b, 0);
    const pen = root.querySelector<SVGCircleElement>("[data-pen]");
    const origin = firstRun.current ? document.querySelector<HTMLElement>("[data-laser-origin]") : null;
    const ctx = origin && cv ? cv.getContext("2d") : null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (ctx && cv) {
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const duration = TIMING.sketch * 0.86;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      start ||= now;
      const t = Math.min(1, (now - start) / duration);
      let left = t * total;
      let i = 0;
      while (i < paths.length - 1 && left > lengths[i]) left -= lengths[i++];
      paths.forEach((el, k) => {
        const drawn = k < i ? lengths[k] : k === i ? Math.min(left, lengths[k]) : 0;
        el.style.strokeDashoffset = String(lengths[k] - drawn);
      });
      const pt = paths[i]?.getPointAtLength(Math.min(left, lengths[i]));
      if (pt && pen) {
        pen.setAttribute("cx", String(pt.x));
        pen.setAttribute("cy", String(pt.y));
      }
      if (ctx && origin && pt) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        const m = root.getScreenCTM();
        const o = origin.getBoundingClientRect();
        if (m && t < 1) {
          const sx = m.a * pt.x + m.c * pt.y + m.e;
          const sy = m.b * pt.x + m.d * pt.y + m.f;
          ctx.globalCompositeOperation = "lighter";
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(o.left + o.width / 2, o.top + o.height / 2);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = "rgba(255, 77, 77, 0.26)";
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.strokeStyle = "rgba(255, 190, 170, 0.85)";
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }
      if (t < 1) raf = requestAnimationFrame(tick);
      else ctx?.clearRect(0, 0, innerWidth, innerHeight);
    };
    paths.forEach((el, k) => {
      el.style.strokeDasharray = String(lengths[k]);
      el.style.strokeDashoffset = String(lengths[k]);
    });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ctx?.clearRect(0, 0, innerWidth, innerHeight);
    };
  }, [playing, stage, product]);

  const shown = playing || stage === "shipped";

  return (
    <div className={styles.stage}>
      <figure className={styles.exhibit} data-stage={stage} data-shown={shown || undefined}>
        <div className={styles.frame}>
          <Image
            key={p.image}
            src={p.image}
            alt={p.alt[lang]}
            fill
            priority={product === 0}
            sizes="(max-width: 960px) 92vw, 56vw"
            className={styles.shot}
          />
          <svg ref={svg} key={p.id} className={styles.drawing} viewBox="0 0 1440 900" aria-hidden>
            <defs>
              <filter id="hb-sketch">
                <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
                <feDisplacementMap in="SourceGraphic" scale="9" />
              </filter>
              <pattern id="hb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect className={styles.paper} width="1440" height="900" />
            <rect className={styles.grid} width="1440" height="900" fill="url(#hb-grid)" />
            <g className={styles.fills}>
              {p.regions.map((r, i) => (
                <rect key={i} x={r.x} y={r.kind === "text" ? r.y + r.h * 0.2 : r.y} width={r.w} height={r.kind === "text" ? r.h * 0.6 : r.h} />
              ))}
            </g>
            <g className={styles.lines} filter="url(#hb-sketch)">
              {p.regions.map((r, i) => (
                <path key={i} d={regionPath(r)} data-sketch />
              ))}
            </g>
            <g className={styles.dims}>
              <path d="M40 40H1400M40 30V50M1400 30V50" />
              <text x="720" y="28">1440</text>
              <path d="M40 60V860M30 60H50M30 860H50" />
              <text x="58" y="466">900</text>
            </g>
            <circle className={styles.pen} data-pen r="9" cx="-20" cy="-20" />
          </svg>
          <span className={styles.seam} aria-hidden />
        </div>
        <figcaption className={styles.placard}>
          <span className={styles.placardName}>{p.name}</span>
          <span className={styles.placardStage}>{copy.stages[stage]}</span>
        </figcaption>
      </figure>
      <canvas ref={canvas} className={styles.beam} aria-hidden />
    </div>
  );
}

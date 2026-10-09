"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import styles from "./HeroLaser.module.css";

// A rendered laptop on a turntable (Blender, design-src/hero-laptop.blend), cut into being by the
// LumiVerse laser: one sweep conjures the wireframe out of thin air, a second sweep cuts it into
// the solid laptop showing one of our products. Then the next product. The layers are stills
// rendered from one camera, so wireframe and solid line up exactly; only the reveal is animated.

const FRAME = { w: 1600, h: 1100 };
// The laptop's box in the render, measured from the alpha channel.
const LAPTOP = { x: 384, y: 224, w: 746, h: 576 };
const T = { cut: 1300, between: 450, hold: 4600, vanish: 520 };

const PRODUCTS = [
  { id: "moj-kolega", name: "Moj Kolega" },
  { id: "titlomat", name: "Titlomat" },
  { id: "bridj", name: "Bridj" },
] as const;

type Phase = "idle" | "wire" | "solid" | "hold" | "vanish";
type Copy = { idea: string; shipped: string; alt: Record<(typeof PRODUCTS)[number]["id"], string> };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function HeroLaser({ copy }: { lang: Locale; copy: Copy }) {
  const [product, setProduct] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [reduced, setReduced] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const wire = useRef<HTMLImageElement>(null);
  const solid = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // Start when the headline has been laser-written (or after a fallback delay).
  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = () => (isReduced ? setReduced(true) : setPhase("wire"));
    window.addEventListener("lv:title-written", go, { once: true });
    const fallback = window.setTimeout(go, 2600);
    return () => {
      window.removeEventListener("lv:title-written", go);
      window.clearTimeout(fallback);
    };
  }, []);

  // Timeline between the cuts.
  useEffect(() => {
    if (phase === "hold") {
      const id = window.setTimeout(() => setPhase("vanish"), T.hold);
      return () => window.clearTimeout(id);
    }
    if (phase === "vanish") {
      const id = window.setTimeout(() => {
        setProduct((i) => (i + 1) % PRODUCTS.length);
        setPhase("wire");
      }, T.vanish);
      return () => window.clearTimeout(id);
    }
  }, [phase]);

  // A cut: a glowing line rises through the laptop's box, the layer appearing below it,
  // while the beam from the logo dot scans along the line, throwing sparks.
  useEffect(() => {
    if (phase !== "wire" && phase !== "solid") return;
    const target = phase === "wire" ? wire.current : solid.current;
    const box = stage.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!target || !box || !cv || !ctx) return;
    const origin = document.querySelector<HTMLElement>("[data-laser-origin]");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    origin?.setAttribute("data-firing", "");

    const top = (LAPTOP.y / FRAME.h) * 100;
    const bottom = ((LAPTOP.y + LAPTOP.h) / FRAME.h) * 100;
    const sparks: Spark[] = [];
    let raf = 0;
    let start = 0;
    let last = 0;
    let finished = false;

    const tick = (now: number) => {
      start ||= now;
      const dt = Math.min(40, now - (last || now));
      last = now;
      const t = Math.min(1, (now - start) / T.cut);
      const cutPct = bottom - (bottom - top) * ease(t);
      target.style.clipPath = `inset(${t >= 1 ? 0 : cutPct}% 0 0 0)`;

      const r = box.getBoundingClientRect();
      const sx = r.width / FRAME.w;
      const lineY = r.top + (cutPct / 100) * r.height;
      const x0 = r.left + LAPTOP.x * sx;
      const x1 = r.left + (LAPTOP.x + LAPTOP.w) * sx;
      // The hit point scans back and forth along the cut, like a laser cutter head.
      const scan = Math.abs(((now / 170) % 2) - 1);
      const hx = x0 + (x1 - x0) * scan;

      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (t < 1) {
        ctx.globalCompositeOperation = "lighter";
        // the cut line
        const line = ctx.createLinearGradient(x0, 0, x1, 0);
        line.addColorStop(0, "rgba(255,77,77,0)");
        line.addColorStop(0.08, "rgba(255,120,100,0.9)");
        line.addColorStop(0.92, "rgba(255,120,100,0.9)");
        line.addColorStop(1, "rgba(255,77,77,0)");
        ctx.fillStyle = line;
        ctx.fillRect(x0, lineY - 1, x1 - x0, 2);
        ctx.fillStyle = "rgba(255,77,77,0.18)";
        ctx.fillRect(x0, lineY - 6, x1 - x0, 12);
        // the beam from the logo dot
        if (origin) {
          const o = origin.getBoundingClientRect();
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(o.left + o.width / 2, o.top + o.height / 2);
          ctx.lineTo(hx, lineY);
          ctx.strokeStyle = "rgba(255,77,77,0.26)";
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.strokeStyle = "rgba(255,190,170,0.9)";
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
        const glow = ctx.createRadialGradient(hx, lineY, 0, hx, lineY, 24);
        glow.addColorStop(0, "rgba(255,240,225,1)");
        glow.addColorStop(0.3, "rgba(255,110,90,0.8)");
        glow.addColorStop(1, "rgba(255,77,77,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(hx, lineY, 24, 0, Math.PI * 2);
        ctx.fill();
        for (let k = 0; k < 3; k++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
          const v = 0.08 + Math.random() * 0.25;
          sparks.push({ x: hx, y: lineY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
        }
      }
      for (let k = sparks.length - 1; k >= 0; k--) {
        const s = sparks[k];
        s.life -= dt / 420;
        if (s.life <= 0) {
          sparks.splice(k, 1);
          continue;
        }
        s.vy += 0.0007 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.fillStyle = `rgba(255,${150 + 80 * s.life},${110 * s.life},${s.life})`;
        ctx.fillRect(s.x, s.y, 1.8, 1.8);
      }
      ctx.globalCompositeOperation = "source-over";

      if (t >= 1 && !finished) {
        finished = true;
        origin?.removeAttribute("data-firing");
        window.setTimeout(() => setPhase(phase === "wire" ? "solid" : "hold"), phase === "wire" ? T.between : 0);
      }
      if (t < 1 || sparks.length) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      origin?.removeAttribute("data-firing");
    };
  }, [phase]);

  // Before each wire cut, both laptop layers start fully hidden again.
  useEffect(() => {
    if (phase === "wire") {
      if (wire.current) wire.current.style.clipPath = "inset(100% 0 0 0)";
      if (solid.current) solid.current.style.clipPath = "inset(100% 0 0 0)";
    }
  }, [phase, product]);

  const p = PRODUCTS[product];
  const showSolid = reduced || phase === "solid" || phase === "hold" || phase === "vanish";
  // "Idea" while it exists only as lines; "Shipped" once the second cut has finished.
  const label = reduced || phase === "hold" || phase === "vanish" ? copy.shipped : copy.idea;

  return (
    <div className={styles.wrap}>
      <figure className={styles.scene}>
        <div ref={stage} className={styles.stage} data-phase={phase} data-reduced={reduced || undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element -- layered stills, sized by the frame */}
          <img className={styles.layer} src="/hero/stage.webp" alt="" width={FRAME.w} height={FRAME.h} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={wire} className={`${styles.layer} ${styles.wire}`} src="/hero/wire.webp" alt="" width={FRAME.w} height={FRAME.h} />
          <div ref={solid} className={`${styles.layer} ${styles.solid}`}>
            {PRODUCTS.map((item, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id}
                className={styles.layer}
                src={`/hero/solid-${item.id}.webp`}
                alt={i === product && showSolid ? copy.alt[item.id] : ""}
                width={FRAME.w}
                height={FRAME.h}
                data-active={i === product || undefined}
              />
            ))}
          </div>
        </div>
        <figcaption className={styles.placard} data-visible={phase !== "idle" || reduced || undefined}>
          <span className={styles.placardName}>{p.name}</span>
          <span className={styles.placardStage}>{label}</span>
        </figcaption>
      </figure>
      <canvas ref={canvas} className={styles.beam} aria-hidden />
    </div>
  );
}

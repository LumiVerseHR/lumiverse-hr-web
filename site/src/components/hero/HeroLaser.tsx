"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import styles from "./HeroLaser.module.css";
import { boxOf, trace, type Device } from "./laserTrace";

// Rendered exhibits on a turntable (Blender, design-src/hero-exhibits.blend), cut into being by the
// LumiVerse laser: one sweep conjures the gold wireframe out of thin air, a second sweep cuts it into
// the solid device showing one of our products. Then the next exhibit. The layers are stills
// rendered from one camera, so wireframe and solid line up exactly; only the reveal is animated.

const FRAME = { w: 1600, h: 1100 };

// Every layer comes in 800, 1100 and 1600 wide; a phone takes the 1100, a desktop the full frame.
const SIZES = "(max-aspect-ratio: 1/1) 100vw, 60vw";
const srcSet = (name: string) => `/hero/${name}-800.webp 800w, /hero/${name}-1100.webp 1100w, /hero/${name}.webp 1600w`;
// One round trip: up drawing the wireframe, straight back down making it solid.
const T = { wire: 1150, cut: 850, hold: 4800, vanish: 520 };

// Each product on the device it is used on: a webshop laptop, a creator's monitor, an analyst's desk.
const PRODUCTS = [
  { id: "moj-kolega", name: "Moj Kolega", device: "laptop" },
  { id: "titlomat", name: "Titlomat", device: "monitor" },
  { id: "bridj", name: "Bridj", device: "workstation" },
] as const satisfies readonly { id: string; name: string; device: Device }[];

type Phase = "idle" | "wire" | "solid" | "hold" | "vanish";
type Copy = { idea: string; shipped: string; alt: Record<(typeof PRODUCTS)[number]["id"], string> };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };


export function HeroLaser({ copy }: { lang: Locale; copy: Copy }) {
  const [product, setProduct] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [reduced, setReduced] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const wire = useRef<HTMLDivElement>(null);
  const solid = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reveal = useRef<HTMLCanvasElement>(null);

  // Start when the headline has been laser-written (or after a fallback delay).
  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Whichever comes first, the title event or the fallback, starts it; the other is ignored.
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      window.clearTimeout(fallback);
      if (isReduced) setReduced(true);
      else setPhase("wire");
    };
    window.addEventListener("lv:title-written", go, { once: true });
    const fallback: number = window.setTimeout(() => go(), 2600);
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

  // Tell the headline an exhibit has settled, so it can swap its word while the laser is idle.
  useEffect(() => {
    if (phase === "hold") window.dispatchEvent(new CustomEvent("lv:exhibit-hold", { detail: product }));
  }, [phase, product]);

  // The cuts. Wire: four beams from the logo dot trace the device's real edges at once and
  // the wireframe appears where they pass. Solid: a cut line sweeps down with three beams
  // scanning along it, the finished device appearing above the line.
  useEffect(() => {
    if (phase !== "wire" && phase !== "solid") return;
    const box = stage.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    const wireEl = wire.current;
    const device = PRODUCTS[product].device;
    const wireImg = wireEl?.querySelector<HTMLImageElement>("img[data-active]");
    const solidEl = solid.current;
    const rv = reveal.current;
    const rctx = rv?.getContext("2d");
    if (!box || !cv || !ctx || !wireEl || !wireImg || !solidEl || !rv || !rctx) return;
    const origin = document.querySelector<HTMLElement>("[data-laser-origin]");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    origin?.setAttribute("data-firing", "");

    const isWire = phase === "wire";
    const duration = isWire ? T.wire : T.cut;
    const area = boxOf(device);
    const top = area.y;
    const bottom = area.y + area.h;
    const sparks: Spark[] = [];
    let raf = 0;
    let start = 0;
    let last = 0;
    let finished = false;

    const tick = (now: number) => {
      start ||= now;
      const dt = Math.min(40, now - (last || now));
      last = now;
      const t = Math.min(1, (now - start) / duration);
      const r = box.getBoundingClientRect();
      const toScreen = (x: number, y: number): [number, number] => [r.left + (x / FRAME.w) * r.width, r.top + (y / FRAME.h) * r.height];
      let heads: [number, number][] = [];
      let lineY = 0;

      if (isWire) {
        // Reveal the real wireframe through the traced strokes, plus a hot glow on fresh edges.
        const k = 1 - (1 - t) * (1 - t) * (1 - t * 0.6);
        rctx.clearRect(0, 0, FRAME.w, FRAME.h);
        rctx.lineCap = "round";
        rctx.lineJoin = "round";
        rctx.globalCompositeOperation = "source-over";
        rctx.strokeStyle = "#fff";
        rctx.lineWidth = 26;
        const frameHeads = trace(rctx, device, k);
        rctx.stroke();
        rctx.globalCompositeOperation = "source-in";
        rctx.drawImage(wireImg, 0, 0, FRAME.w, FRAME.h);
        rctx.globalCompositeOperation = "lighter";
        trace(rctx, device, k);
        rctx.strokeStyle = `rgba(255, 214, 140, ${0.6 * (1 - t)})`;
        rctx.lineWidth = 2.5;
        rctx.stroke();
        rctx.globalCompositeOperation = "source-over";
        heads = t < 1 ? frameHeads.map(([x, y]) => toScreen(x, y)) : [];
      } else {
        const k = 1 - (1 - t) * (1 - t);
        const y = top + (bottom - top) * k;
        solidEl.style.clipPath = t >= 1 ? "inset(0 0 0 0)" : `inset(0 0 ${100 - (y / FRAME.h) * 100}% 0)`;
        const [x0, ly] = toScreen(area.x, y);
        const [x1] = toScreen(area.x + area.w, y);
        lineY = ly;
        if (t < 1) {
          heads = [0, 0.33, 0.66].map((off) => {
            const scan = Math.abs((((now / 190 + off * 2) % 2) + 2) % 2 - 1);
            return [x0 + (x1 - x0) * scan, ly] as [number, number];
          });
          ctx.clearRect(0, 0, innerWidth, innerHeight);
          ctx.globalCompositeOperation = "lighter";
          const line = ctx.createLinearGradient(x0, 0, x1, 0);
          line.addColorStop(0, "rgba(255,77,77,0)");
          line.addColorStop(0.08, "rgba(255,130,110,0.6)");
          line.addColorStop(0.92, "rgba(255,130,110,0.6)");
          line.addColorStop(1, "rgba(255,77,77,0)");
          ctx.fillStyle = line;
          ctx.fillRect(x0, lineY - 0.6, x1 - x0, 1.2);
          ctx.fillStyle = "rgba(255,77,77,0.08)";
          ctx.fillRect(x0, lineY - 4, x1 - x0, 8);
        }
      }

      if (isWire || t >= 1) ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = "lighter";
      const o = origin?.getBoundingClientRect();
      for (const [hx, hy] of heads) {
        if (o) {
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(o.left + o.width / 2, o.top + o.height / 2);
          ctx.lineTo(hx, hy);
          ctx.strokeStyle = "rgba(255,77,77,0.1)";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.strokeStyle = "rgba(255,190,170,0.5)";
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
        // Where the beam meets the work it burns gold, like the lines it leaves behind.
        const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 15);
        glow.addColorStop(0, "rgba(255,246,228,0.95)");
        glow.addColorStop(0.3, "rgba(255,190,110,0.6)");
        glow.addColorStop(1, "rgba(255,150,80,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(hx, hy, 15, 0, Math.PI * 2);
        ctx.fill();
        for (let n = 0; n < 2; n++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
          const v = 0.07 + Math.random() * 0.22;
          sparks.push({ x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
        }
      }
      for (let n = sparks.length - 1; n >= 0; n--) {
        const sp = sparks[n];
        sp.life -= dt / 420;
        if (sp.life <= 0) {
          sparks.splice(n, 1);
          continue;
        }
        sp.vy += 0.0007 * dt;
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        ctx.fillStyle = `rgba(255,${150 + 80 * sp.life},${110 * sp.life},${sp.life})`;
        ctx.fillRect(sp.x, sp.y, 1.8, 1.8);
      }
      ctx.globalCompositeOperation = "source-over";

      if (t >= 1 && !finished) {
        finished = true;
        origin?.removeAttribute("data-firing");
        if (isWire) {
          // Hand over from the traced reveal to the finished wireframe still.
          wireEl.style.clipPath = "inset(0 0 0 0)";
          rctx.clearRect(0, 0, FRAME.w, FRAME.h);
        }
        setPhase(isWire ? "solid" : "hold");
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
  }, [phase, product]);

  // Before each wire cut, both device layers start fully hidden again.
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
          <img
            className={styles.layer}
            src="/hero/stage.webp"
            srcSet={srcSet("stage")}
            sizes={SIZES}
            alt=""
            width={FRAME.w}
            height={FRAME.h}
            fetchPriority="high"
          />
          <div ref={wire} className={`${styles.layer} ${styles.wire}`}>
            {PRODUCTS.map((item, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.device}
                className={styles.layer}
                src={`/hero/wire-${item.device}.webp`}
                srcSet={srcSet(`wire-${item.device}`)}
                sizes={SIZES}
                fetchPriority={i === 0 ? undefined : "low"}
                alt=""
                width={FRAME.w}
                height={FRAME.h}
                data-active={i === product || undefined}
              />
            ))}
          </div>
          <canvas ref={reveal} className={`${styles.layer} ${styles.wire} ${styles.reveal}`} width={FRAME.w} height={FRAME.h} aria-hidden />
          <div
            ref={solid}
            className={`${styles.layer} ${styles.solid}`}
            style={{ "--sheen-mask": `url(/hero/solid-${p.id}.webp)` } as CSSProperties}
          >
            {PRODUCTS.map((item, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id}
                className={styles.layer}
                src={`/hero/solid-${item.id}.webp`}
                srcSet={srcSet(`solid-${item.id}`)}
                sizes={SIZES}
                fetchPriority={i === 0 ? undefined : "low"}
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

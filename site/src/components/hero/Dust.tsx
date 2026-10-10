"use client";

import { useEffect, useRef } from "react";
import styles from "./Dust.module.css";

// Dust caught in the light: a few dozen motes drifting slowly, visible only inside the two
// lamp cones (each canvas wears its cone as a mask). A final touch, not an effect: low
// count, low alpha, 30 fps, paused off screen or in a hidden tab, absent under reduced motion.

type Mote = { x: number; y: number; r: number; a: number; vx: number; vy: number; ph: number };

function field(canvas: HTMLCanvasElement, count: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  let w = 0;
  let h = 0;
  let motes: Mote[] = [];
  const seed = () => {
    w = canvas.width = canvas.clientWidth;
    h = canvas.height = canvas.clientHeight;
    motes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.3,
      a: 0.12 + Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.006,
      vy: -0.003 - Math.random() * 0.008,
      ph: Math.random() * Math.PI * 2,
    }));
  };
  seed();
  window.addEventListener("resize", seed);

  let raf = 0;
  let last = 0;
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden || now - last < 33) return;
    const dt = Math.min(66, now - (last || now));
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      m.ph += dt * 0.0011;
      m.x += (m.vx + Math.sin(m.ph) * 0.004) * dt;
      m.y += m.vy * dt;
      if (m.y < -4) m.y = h + 4;
      if (m.x < -4) m.x = w + 4;
      if (m.x > w + 4) m.x = -4;
      // Motes catch the light as they turn: a slow twinkle.
      const alpha = m.a * (0.55 + 0.45 * Math.sin(m.ph * 1.7));
      ctx.fillStyle = `rgba(255, 228, 200, ${alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("resize", seed);
  };
}

export function Dust() {
  const logo = useRef<HTMLCanvasElement>(null);
  const spot = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stops = [logo.current && field(logo.current, 55), spot.current && field(spot.current, 70)];
    return () => stops.forEach((stop) => stop && stop());
  }, []);

  return (
    <>
      <canvas ref={logo} className={`${styles.dust} ${styles.logo}`} aria-hidden />
      <canvas ref={spot} className={`${styles.dust} ${styles.spot}`} aria-hidden />
    </>
  );
}

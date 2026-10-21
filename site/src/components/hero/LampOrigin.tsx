"use client";

import { useEffect, useRef } from "react";

// Aims the logo lamp at the real dot: writes the dot's centre, relative to the hero, as
// --logo-dot-x / --logo-dot-y. Until it runs, the CSS falls back to a measured estimate.
export function LampOrigin() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = marker.current?.parentElement;
    const dot = document.querySelector<HTMLElement>("[data-laser-origin]");
    if (!host || !dot) return;
    const aim = () => {
      const h = host.getBoundingClientRect();
      const d = dot.getBoundingClientRect();
      host.style.setProperty("--logo-dot-x", `${d.left + d.width / 2 - h.left}px`);
      host.style.setProperty("--logo-dot-y", `${d.top + d.height / 2 - h.top}px`);
    };
    aim();
    const ro = new ResizeObserver(aim);
    ro.observe(host);
    document.fonts?.ready.then(aim);
    return () => ro.disconnect();
  }, []);

  return <span ref={marker} hidden />;
}

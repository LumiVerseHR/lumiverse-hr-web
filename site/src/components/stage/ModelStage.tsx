"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Placard } from "./Scene";
import styles from "./ModelStage.module.css";

// WebGL never renders on the server; the hero copy is complete without it.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export function ModelStage({ placards }: { placards: Placard[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // Stop rendering once the hero is off screen; resume when it comes back.
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={stage} className={styles.stage} aria-hidden>
      <Scene placards={placards} active={active} />
    </div>
  );
}

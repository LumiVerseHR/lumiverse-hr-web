"use client";

import dynamic from "next/dynamic";
import type { Placard } from "./Scene";
import styles from "./ModelStage.module.css";

// WebGL never renders on the server; the hero copy is complete without it.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export function ModelStage({ placards }: { placards: Placard[] }) {
  return (
    <div className={styles.stage} aria-hidden>
      <Scene placards={placards} />
    </div>
  );
}

import type { CSSProperties } from "react";
import { LOCKUP, SYMBOL_PATH, SYMBOL_VIEWBOX } from "./logoSymbol";
import styles from "./Logo.module.css";

const vars = {
  "--sym-w": `${LOCKUP.width}em`,
  "--sym-h": `${LOCKUP.height}em`,
  "--sym-gap": `${LOCKUP.gap}em`,
  "--sym-drop": `${LOCKUP.drop}em`,
  "--dot": `${LOCKUP.dot}em`,
  "--dot-gap": `${LOCKUP.dotGap}em`,
} as CSSProperties;

// The LumiVerse lockup: the LV symbol standing on the text baseline, the name in live
// Golos Text 500, and the coral dot. The dot is a real element so the laser can fire from it.
export function Logo({ laserOrigin = false }: { laserOrigin?: boolean }) {
  return (
    <span className={styles.logo} style={vars}>
      <svg className={styles.symbol} viewBox={SYMBOL_VIEWBOX} aria-hidden focusable="false">
        <path d={SYMBOL_PATH} />
      </svg>
      LumiVerse
      <span className={styles.dot} data-laser-origin={laserOrigin ? "" : undefined} aria-hidden />
    </span>
  );
}

import styles from "./Beams.module.css";

// Two lamps in the gallery: one from the LumiVerse logo over the headline, one from the
// top right onto the exhibit. Painted in CSS, so they cost no render loop.
export function Beams() {
  return (
    <>
      <div className={styles.beam} aria-hidden />
      <div className={`${styles.beam} ${styles.spot}`} aria-hidden />
    </>
  );
}

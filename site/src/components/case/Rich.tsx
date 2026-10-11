import styles from "./CaseStudy.module.css";

// Copy from the live pages keeps paragraph breaks ("\n\n") and line breaks ("\n").
// A paragraph made of several short lines is a checklist, so it renders as one.
export function Rich({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => {
        const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length >= 2 && lines.every((l) => l.length < 160)) {
          return (
            <ul key={i} className={styles.checks}>
              {lines.map((line, j) => (
                <li key={j}>{line}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={className}>
            {para}
          </p>
        );
      })}
    </>
  );
}

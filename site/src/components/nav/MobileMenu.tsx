"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "./MobileMenu.module.css";

type Item = { href: string; label: string };

// Narrow screens: the nav and the primary action move into one full-screen panel.
export function MobileMenu({ items, cta, labels }: { items: Item[]; cta: Item; labels: { open: string; close: string } }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    panel.current?.querySelector("a")?.focus();
    const trigger = button.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.toggleLabel}>{open ? labels.close : labels.open}</span>
        <Icon name={open ? "close" : "menu"} size={22} />
      </button>
      <div ref={panel} id="mobile-menu" className={styles.panel} data-open={open || undefined} hidden={!open}>
        <nav aria-label={labels.open}>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className={styles.cta} href={cta.href} onClick={() => setOpen(false)}>
          {cta.label}
          <Icon name="arrow-right" size={18} />
        </a>
      </div>
    </>
  );
}

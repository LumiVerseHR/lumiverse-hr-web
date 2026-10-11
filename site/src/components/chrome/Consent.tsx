"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Consent.module.css";

// Analytics wait behind an explicit choice (ported from the legacy consent.js):
//   granted   -> load now and on every later visit
//   denied    -> never load, clear their cookies, never ask again
//   no answer -> load nothing; after 10s the strip snoozes for this visit only
const CHOICE_KEY = "lv-consent";
const SNOOZE_KEY = "lv-consent-snoozed";
const GA_ID = "G-KDSBK2G9NS";
const CLARITY_ID = "y93two6ppk";
const VISIBLE_MS = 10000;
export const OPEN_EVENT = "lv:consent-open";

type Copy = { text: string; deny: string; allow: string; region: string };
type Choice = "granted" | "denied" | null;

// Private-mode Safari throws on storage access; a throw here must not take the page down.
const read = (store: "localStorage" | "sessionStorage", key: string) => {
  try {
    return window[store].getItem(key);
  } catch {
    return null;
  }
};
const write = (store: "localStorage" | "sessionStorage", key: string, value: string) => {
  try {
    window[store].setItem(key, value);
  } catch {}
};

let loaded = false;

function loadAnalytics() {
  if (loaded) return;
  loaded = true;
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(tag);
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void; clarity?: unknown };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag reads the arguments object itself, exactly as Google's snippet does.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
  const clarity = document.createElement("script");
  clarity.async = true;
  clarity.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  document.head.appendChild(clarity);
}

// Denying does not retract cookies the tags already set, so clear them on every domain variant.
function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`];
  const parts = host.split(".");
  if (parts.length > 2) domains.push(`.${parts.slice(-2).join(".")}`);
  document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => /^(_ga|_gid|_gat|_clck|_clsk)/.test(n))
    .forEach((name) =>
      domains.forEach((domain) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
      }),
    );
}

export function Consent({ copy }: { copy: Copy }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Choice>(null);
  const autoDismiss = useRef(false);
  const timer = useRef<number | null>(null);
  const region = useRef<HTMLDivElement>(null);

  const pause = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const snooze = useCallback(() => {
    write("sessionStorage", SNOOZE_KEY, "1");
    setVisible(false);
  }, []);

  const startTimer = useCallback(() => {
    pause();
    timer.current = window.setTimeout(snooze, VISIBLE_MS);
  }, [snooze]);

  useEffect(() => {
    const choice = read("localStorage", CHOICE_KEY) as Choice;
    if (choice === "granted") loadAnalytics();
    // Also on load: a tag still running when someone denied may have re-written its cookie.
    if (choice === "denied") clearAnalyticsCookies();
    const open = () => {
      pause();
      autoDismiss.current = false;
      setCurrent(read("localStorage", CHOICE_KEY) as Choice);
      setVisible(true);
      window.requestAnimationFrame(() => region.current?.focus());
    };
    window.addEventListener(OPEN_EVENT, open);
    if (!choice && read("sessionStorage", SNOOZE_KEY) !== "1") {
      autoDismiss.current = true;
      // Deferred so the strip arrives after first paint, as the legacy banner did.
      window.requestAnimationFrame(() => setVisible(true));
      startTimer();
    }
    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      pause();
    };
  }, [startTimer]);

  const decide = (value: "granted" | "denied") => {
    write("localStorage", CHOICE_KEY, value);
    setCurrent(value);
    pause();
    setVisible(false);
    if (value === "granted") return loadAnalytics();
    clearAnalyticsCookies();
    // A running tag cannot be unloaded; a reload makes Deny take effect now.
    if (loaded) window.setTimeout(() => window.location.reload(), 400);
  };

  // The countdown only runs while they are elsewhere, and never for a strip opened from the footer.
  const resume = () => {
    window.setTimeout(() => {
      if (!autoDismiss.current || timer.current) return;
      const node = region.current;
      if (!node || node.matches(":hover") || node.contains(document.activeElement)) return;
      startTimer();
    }, 0);
  };

  if (!visible) return null;
  return (
    <div
      ref={region}
      className={styles.consent}
      role="region"
      aria-label={copy.region}
      tabIndex={-1}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <p className={styles.text}>{copy.text}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} aria-pressed={current ? current === "denied" : undefined} onClick={() => decide("denied")}>
          {copy.deny}
        </button>
        <button type="button" className={`${styles.button} ${styles.allow}`} aria-pressed={current ? current === "granted" : undefined} onClick={() => decide("granted")}>
          {copy.allow}
        </button>
      </div>
    </div>
  );
}

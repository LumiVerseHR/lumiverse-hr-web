"use client";

import { OPEN_EVENT } from "./Consent";

// The footer's "Cookie preferences": reopens the consent strip at any time.
export function ConsentOpen({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {label}
    </button>
  );
}

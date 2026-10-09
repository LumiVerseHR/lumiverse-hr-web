"use client";

import type { ReactNode } from "react";

export const PICK_EVENT = "lv:package";

// A price card's call to action: jumps to the brief with that package already chosen.
export function PickPackage({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <a href="#contact" className={className} onClick={() => window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: id }))}>
      {children}
    </a>
  );
}

"use client";

import { useEffect } from "react";

// Old links pointed at homepage sections (/#studio). A hash never reaches the server, so the
// homepage forwards the ones whose section now lives on its own page.
export function HashForward({ to }: { to: Record<string, string> }) {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (to[id] && !document.getElementById(id)) window.location.replace(to[id]);
  }, [to]);
  return null;
}

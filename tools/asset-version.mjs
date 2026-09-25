// Content-hashed names for the shared css/js.
//
// nginx serves css/js with `max-age=31536000, immutable`, which is a promise
// that a given URL never changes its contents. Under a bare `styles.css` that
// promise is false: a returning visitor keeps last year's stylesheet for a
// year and renders new markup against it. Putting a content hash in the
// filename makes the header true — a changed file is a new URL.
//
// Shared by the migrate step (which rewrites the hand-written pages) and the
// blog layout (which Astro renders), so both point at the same file.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const versionedAssets = ["styles.css", "showcase.js", "titlomat-wave.js", "consent.js"];

export function assetVersions(root = process.cwd()) {
  const versions = new Map();
  for (const name of versionedAssets) {
    const from = path.join(root, name);
    if (!existsSync(from)) continue;
    const parsed = path.parse(name);
    const hash = createHash("sha256").update(readFileSync(from)).digest("hex").slice(0, 8);
    versions.set(name, `${parsed.name}.${hash}${parsed.ext}`);
  }
  return versions;
}

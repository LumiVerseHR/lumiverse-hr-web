import data from "@/content/laptop-paths.json";

// The laptop's edges, projected from the Blender scene through the render camera
// (content/laptop-paths.json, render-pixel coordinates), split between several beams.
// Each beam walks its own paths at its own speed so they all finish together.

type Pt = [number, number];
type Seg = { a: Pt; b: Pt; len: number };
type Beam = { segs: Seg[]; total: number };

const P = data.paths as unknown as Record<string, Pt[] | Pt[][]>;
const path = (k: string) => P[k] as Pt[];

const GROUPS: Pt[][][] = [
  [path("lid_back"), path("lid_front")],
  [path("screen")],
  [path("base_top"), path("base_bottom")],
  [path("keywell"), path("trackpad"), ...(P.key_rows as Pt[][])],
];

function plan(polylines: Pt[][]): Beam {
  const segs: Seg[] = [];
  for (const line of polylines) {
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      segs.push({ a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) });
    }
  }
  return { segs, total: segs.reduce((s, x) => s + x.len, 0) };
}

export const BEAMS: Beam[] = GROUPS.map(plan);

/** Strokes every beam's progress up to t (0..1) into ctx; returns each beam's head. */
export function trace(ctx: CanvasRenderingContext2D, t: number): Pt[] {
  const heads: Pt[] = [];
  ctx.beginPath();
  for (const beam of BEAMS) {
    let left = beam.total * t;
    let head: Pt = beam.segs[0].a;
    for (const s of beam.segs) {
      if (left <= 0) break;
      const f = Math.min(1, left / s.len);
      head = [s.a[0] + (s.b[0] - s.a[0]) * f, s.a[1] + (s.b[1] - s.a[1]) * f];
      ctx.moveTo(s.a[0], s.a[1]);
      ctx.lineTo(head[0], head[1]);
      left -= s.len;
    }
    heads.push(head);
  }
  return heads;
}

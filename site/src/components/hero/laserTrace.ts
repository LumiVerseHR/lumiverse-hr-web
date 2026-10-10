import data from "@/content/hero-paths.json";

// Each exhibit's hard edges, projected from the Blender scene through the render camera
// (content/hero-paths.json, render-pixel coordinates) and split between four beams.
// Each beam walks its own polylines at its own speed so they all finish together.

type Pt = [number, number];
type Seg = { a: Pt; b: Pt; len: number };
type Beam = { segs: Seg[]; total: number };
export type Device = keyof typeof data.devices;

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

const devices = data.devices as unknown as Record<Device, { box: [number, number, number, number]; beams: Pt[][][] }>;
const BEAMS = Object.fromEntries(
  Object.entries(devices).map(([id, d]) => [id, d.beams.filter((b) => b.length).map(plan)]),
) as Record<Device, Beam[]>;

/** The exhibit's box in the render, padded around its edges. */
export function boxOf(device: Device) {
  const [x, y, w, h] = devices[device].box;
  return { x, y, w, h };
}

/** Strokes every beam's progress up to t (0..1) into ctx; returns each beam's head. */
export function trace(ctx: CanvasRenderingContext2D, device: Device, t: number): Pt[] {
  const heads: Pt[] = [];
  ctx.beginPath();
  for (const beam of BEAMS[device]) {
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

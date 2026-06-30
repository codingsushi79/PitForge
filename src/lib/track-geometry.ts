import type { TrackLayout } from "./tracks";

/** Build a closed SVG path from centerline keypoints. */
export function centerlineToPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return (
    `M ${first[0]},${first[1]} ` +
    rest.map(([x, y]) => `L ${x},${y}`).join(" ") +
    " Z"
  );
}

function segmentLength(a: [number, number], b: [number, number]): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Map lap progress (0–1) to x,y by walking the centerline polyline. */
export function progressToPosition(
  layout: TrackLayout,
  progress: number
): [number, number] {
  const points = layout.centerline;
  if (!points || points.length < 2) {
    return layout.startLine;
  }

  const segments: { a: [number, number]; b: [number, number]; len: number }[] = [];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const len = segmentLength(a, b);
    segments.push({ a, b, len });
    total += len;
  }

  if (total === 0) return points[0];

  let dist = (((progress % 1) + 1) % 1) * total;
  for (const seg of segments) {
    if (dist <= seg.len) {
      const t = seg.len === 0 ? 0 : dist / seg.len;
      return [seg.a[0] + (seg.b[0] - seg.a[0]) * t, seg.a[1] + (seg.b[1] - seg.a[1]) * t];
    }
    dist -= seg.len;
  }

  return points[0];
}

/** Sample a browser SVG path element for positioning (client-only). */
export function progressToPathPoint(
  pathEl: SVGPathElement | null,
  progress: number
): [number, number] | null {
  if (!pathEl) return null;
  const length = pathEl.getTotalLength();
  if (length <= 0) return null;
  const p = pathEl.getPointAtLength((((progress % 1) + 1) % 1) * length);
  return [p.x, p.y];
}
